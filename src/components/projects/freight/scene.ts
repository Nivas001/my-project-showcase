import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { HALF_PI, Kit, at, box, claddingTexture, cyl, makeMaterials, textTexture } from "./kit";
import {
  BOX_COLOURS,
  buildClouds,
  buildCrane,
  buildPlane,
  buildShip,
  buildStacker,
  buildTruck,
  containerField,
  containerLook,
  heroContainer,
  rand,
} from "./models";
import {
  BOX,
  CHAPTERS,
  CRANE_X,
  CRANE_Z,
  PIER_EAST,
  PIER_W,
  PIER_Z0,
  PIER_Z1,
  STACK_X,
  WATER_Y,
  inOut,
  lerp,
  roadAt,
  S_CRANE,
  seg,
  smooth,
  stateAt,
  yawOf,
  type State,
} from "./timeline";

/**
 * THE FREIGHT SCENE
 *
 * A container port in daylight, rendered physically: a sky that lights the
 * scene and is reflected in every painted panel, one sun with soft shadows,
 * ACES tone mapping, and fog that thickens with distance the way air does.
 *
 * Scrolling scrubs a single timeline (see timeline.ts). The camera is cut
 * like a film: a set of shots, each following whatever it is about, with
 * eased cross-moves between them.
 */

export type Telemetry = { label: string; value: number; unit: string };

export type Freight = {
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: (w: number, h: number, mobile: boolean) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

const HAZE = new THREE.Color("#c9d6e1");
/** The frame shape the shots were composed for; phones keep a squarer crop of it. */
const COMPOSED_ASPECT = 1.6;
const COMPOSED_ASPECT_PHONE = 1.1;

/* ---- Ocean ------------------------------------------------------------------ */

const NOISE_GLSL = /* glsl */ `
varying vec3 vWPos;
uniform float uTime;
uniform vec4 uShip;
uniform float uWake;
uniform float uRun;
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p, int octaves) {
  float s = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    s += a * vnoise(p);
    p = r * p * 2.03;
    a *= 0.5;
  }
  return s;
}
float oceanH(vec2 p, float detail) {
  float t = uTime;
  float h = 1.1 * fbm(p * 0.035 + vec2(t * 0.018, t * 0.011), 4);
  h += 0.34 * detail * fbm(p * 0.14 + vec2(-t * 0.05, t * 0.04), 3);
  h += 0.1 * detail * fbm(p * 0.55 + vec2(t * 0.12, -t * 0.1), 2);
  return h;
}
`;

/** Foam: the ship's wake (prop wash and two Kelvin arms) and water pushed off the hull. */
const FOAM_GLSL = /* glsl */ `
float foam = 0.0;
float wash = 0.0;
{
  vec2 rel = vWPos.xz - uShip.xy;
  vec2 fwd = uShip.zw;
  float along = dot(rel, fwd);
  float side = abs(rel.x * fwd.y - rel.y * fwd.x);
  float hl = 90.0;
  float hb = 14.0;
  float n1 = fbm(vWPos.xz * 0.08 + vec2(uTime * 0.035, 0.0), 4);
  float n2 = vnoise(vWPos.xz * 0.42 - uTime * 0.25);
  float behind = -along - hl + 3.0;
  float lane = hb * 0.7 + max(behind, 0.0) * 0.05;
  wash = step(0.0, behind) * (1.0 - smoothstep(lane * 0.35, lane, side))
    * exp(-behind / 240.0) * (1.0 - smoothstep(uRun * 0.85, uRun + 1.0, behind));
  float fromBow = hl - along;
  float armW = 1.6 + fromBow * 0.03;
  float arm = step(0.0, fromBow)
    * (1.0 - smoothstep(0.0, armW, abs(side - (hb * 0.55 + fromBow * 0.34))))
    * exp(-fromBow / 170.0) * (0.35 + 0.65 * vnoise(vWPos.xz * 0.06))
    * (1.0 - smoothstep(uRun * 0.85 + 2.0 * hl, uRun + 2.0 * hl, fromBow));
  float hull = (1.0 - smoothstep(hb - 1.5, hb + 4.5, side))
    * step(-hl, along) * step(along, hl + 1.5)
    * mix(0.25, 0.75, smoothstep(-hl, hl, along));
  float mask = max(max(wash, arm * 0.62), hull * 0.8) * uWake;
  wash *= uWake;
  foam = smoothstep(0.4, 0.82, mask * (0.4 + 0.95 * n1) + (n2 - 0.5) * 0.28);
}
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.06, 0.3, 0.45), clamp(wash * 0.3, 0.0, 0.3));
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.93, 0.95), foam);
roughnessFactor = mix(roughnessFactor, 0.85, foam);
`;

const NORMAL_GLSL = /* glsl */ `
{
  float camDist = length(vWPos - cameraPosition);
  float detail = 1.0 - smoothstep(180.0, 1100.0, camDist);
  vec2 p = vWPos.xz;
  float e = 0.3 + camDist * 0.002;
  float h0 = oceanH(p, detail);
  float hx = oceanH(p + vec2(e, 0.0), detail);
  float hz = oceanH(p + vec2(0.0, e), detail);
  float k = mix(0.45, 1.0, detail);
  vec3 nW = normalize(vec3(-(hx - h0) / e * k, 1.0, -(hz - h0) / e * k));
  nW = normalize(mix(nW, vec3(0.0, 1.0, 0.0), foam * 0.7));
  normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
}
`;

function oceanMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uShip: { value: new THREE.Vector4(0, 0, 0, 1) },
    uWake: { value: 0 },
    uRun: { value: 0 },
  };
  const material = new THREE.MeshStandardMaterial({
    color: "#0a2f5e",
    roughness: 0.14,
    metalness: 0,
    envMapIntensity: 1.1,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE_GLSL}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${FOAM_GLSL}`)
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>\n${NORMAL_GLSL}`,
      );
  };
  material.customProgramCacheKey = () => "freight-ocean";
  return { material, uniforms };
}

/* ---- Road ------------------------------------------------------------------- */

function roadGeometry(from: number, to: number, width: number) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const step = 2;
  let n = 0;
  for (let s = from; s <= to + 0.001; s += step) {
    const p = roadAt(s);
    const lx = p.dz;
    const lz = -p.dx;
    positions.push(p.x + (lx * width) / 2, 0.02, p.z + (lz * width) / 2);
    positions.push(p.x - (lx * width) / 2, 0.02, p.z - (lz * width) / 2);
    uvs.push(0, s / 18, 1, s / 18);
    if (n > 0) {
      const a = (n - 1) * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    n++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/* ---- Build ------------------------------------------------------------------ */

export function createFreight(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean; onTelemetry?: (t: Telemetry) => void },
): Freight {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.6;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE, 200, 1500);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 12000);

  /* Sky and sun: late morning, from the south-west. */
  const sunDir = new THREE.Vector3().setFromSphericalCoords(
    1,
    THREE.MathUtils.degToRad(90 - 40),
    THREE.MathUtils.degToRad(-35),
  );
  const makeSky = () => {
    const sky = new Sky();
    const u = sky.material.uniforms;
    u["turbidity"]!.value = 2.6;
    u["rayleigh"]!.value = 1.15;
    u["mieCoefficient"]!.value = 0.004;
    u["mieDirectionalG"]!.value = 0.8;
    (u["sunPosition"]!.value as THREE.Vector3).copy(sunDir);
    u["cloudCoverage"]!.value = 0.32;
    u["cloudDensity"]!.value = 0.55;
    u["cloudScale"]!.value = 0.00024;
    return sky;
  };
  const sky = makeSky();
  sky.scale.setScalar(10000);
  sky.frustumCulled = false;
  scene.add(sky);

  // Image-based lighting: the same sky over a concrete-coloured ground, so
  // paint and glass reflect the world they sit in.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSky = makeSky();
  envSky.scale.setScalar(50);
  envScene.add(envSky);
  const envGround = new THREE.Mesh(
    new THREE.CircleGeometry(40, 32),
    new THREE.MeshBasicMaterial({ color: "#8f8b83" }),
  );
  envGround.rotation.x = -HALF_PI;
  envGround.position.y = -2;
  envScene.add(envGround);
  const envTarget = pmrem.fromScene(envScene, 0, 0.1, 200);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.5;

  const sunLight = new THREE.DirectionalLight("#fff1dc", 3.3);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.radius = 3;
  scene.add(sunLight, sunLight.target);
  scene.add(new THREE.HemisphereLight("#d2e4ff", "#6d6456", 0.22));

  const M = makeMaterials();
  const lampOn = new THREE.MeshStandardMaterial({
    color: "#0b3d1a",
    emissive: "#39ff7a",
    emissiveIntensity: 1.8,
  });

  /* ---- Ground, quay, pier ---------------------------------------------------- */

  const landW = 6000;
  const landD = 3200;
  const landTex = M.textures.concrete.clone();
  landTex.repeat.set(landW / 32, landD / 32);
  const landMat = M.concrete.clone();
  landMat.map = landTex;
  const land = new THREE.Mesh(new THREE.PlaneGeometry(landW, landD), landMat);
  land.rotation.x = -HALF_PI;
  land.position.set(0, 0, PIER_Z0 - landD / 2);
  land.receiveShadow = true;
  scene.add(land);

  const pierWest = CRANE_X - PIER_W / 2;
  const quay = new Kit();
  quay.add(
    box(landW / 2 + pierWest, 9, 2),
    M.quayWall,
    at((-landW / 2 + pierWest) / 2, -4.5, PIER_Z0 - 1),
  );
  quay.add(
    box(landW / 2 - PIER_EAST, 9, 2),
    M.quayWall,
    at((landW / 2 + PIER_EAST) / 2, -4.5, PIER_Z0 - 1),
  );
  // Pier sides and end.
  const pierLen = PIER_Z1 - PIER_Z0;
  quay.add(box(0.6, 9, pierLen), M.quayWall, at(pierWest + 0.3, -4.5, (PIER_Z0 + PIER_Z1) / 2));
  quay.add(box(0.6, 9, pierLen), M.quayWall, at(PIER_EAST - 0.3, -4.5, (PIER_Z0 + PIER_Z1) / 2));
  quay.add(box(PIER_W, 9, 0.6), M.quayWall, at(CRANE_X, -4.5, PIER_Z1 - 0.3));
  // Fenders and bollards on the berth face; crane rails on the deck.
  for (let z = PIER_Z0 + 12; z < PIER_Z1 - 6; z += 15) {
    quay.add(cyl(0.65, 0.65, 3.2, 16), M.rubber, at(PIER_EAST + 0.5, -2.1, z));
  }
  for (let z = PIER_Z0 + 18; z < PIER_Z1 - 6; z += 22) {
    quay.add(cyl(0.28, 0.34, 0.7, 12), M.darkSteel, at(PIER_EAST - 1.0, 0.35, z));
  }
  for (const x of [CRANE_X - 14, CRANE_X + 14]) {
    quay.add(box(0.3, 0.06, pierLen - 4), M.steel, at(x, 0.03, (PIER_Z0 + PIER_Z1) / 2));
  }
  scene.add(quay.build({ cast: false }));

  const pierTex = M.textures.concrete.clone();
  pierTex.repeat.set(PIER_W / 32, pierLen / 32);
  const pierTop = M.concrete.clone();
  pierTop.map = pierTex;
  const pier = new THREE.Mesh(new THREE.PlaneGeometry(PIER_W, pierLen), pierTop);
  pier.rotation.x = -HALF_PI;
  pier.position.set(CRANE_X, 0, (PIER_Z0 + PIER_Z1) / 2);
  pier.receiveShadow = true;
  scene.add(pier);

  /* ---- Road ------------------------------------------------------------------- */

  const roadTex = M.textures.asphalt;
  roadTex.repeat.set(1, 1);
  const road = new THREE.Mesh(roadGeometry(-20, S_CRANE + 100, 11), M.asphalt);
  road.receiveShadow = true;
  scene.add(road);

  /* ---- Water ------------------------------------------------------------------ */

  const ocean = oceanMaterial();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000, 1, 1), ocean.material);
  water.rotation.x = -HALF_PI;
  water.position.set(0, WATER_Y, 2000);
  water.receiveShadow = true;
  scene.add(water);

  /* ---- Yard: stacks, hoarding, lights, distant sheds -------------------------- */

  const look = containerLook();
  const items: { m: THREE.Matrix4; colour: string }[] = [];
  const put = (x: number, tier: number, z: number, colour: string) =>
    items.push({ m: new THREE.Matrix4().makeTranslation(x, BOX.H * tier + BOX.H / 2, z), colour });
  // The stack the story starts from: the hero box sits on the navy one.
  put(STACK_X, 0, 0, "#1f3a68");
  put(STACK_X + 2.52, 0, 0, "#d4d6d3");
  put(STACK_X + 5.04, 0, 0, "#8e3f2a");
  put(STACK_X + 5.04, 1, 0, "#2f5d4a");
  const block = (x0: number, cols: number, zs: number[], maxTiers: number, seed: number) => {
    for (let i = 0; i < cols; i++) {
      zs.forEach((z, j) => {
        const tiers = 1 + Math.floor(rand(seed + i * 7 + j * 131) * maxTiers);
        for (let t = 0; t < tiers; t++) {
          const colour =
            BOX_COLOURS[Math.floor(rand(seed + i * 17 + j * 3 + t * 29) * BOX_COLOURS.length)]!;
          put(x0 + i * 2.54, t, z, colour);
        }
      });
    }
  };
  block(-74, 16, [-22, -34.9], 4, 11);
  block(-26, 12, [-22, -34.9], 3, 57);
  block(28, 36, [-12, -24.9, -37.8], 3, 91);
  block(176, 26, [-30, -17.1, -4.2, 8.7, 21.6, 34.5, 47.4], 4, 133);
  block(-120, 14, [40, 52.9], 3, 177);
  scene.add(containerField(look, items));

  const hoardTex = textTexture(
    [
      {
        text: "BUILT END TO END",
        font: "800 300px Inter, system-ui, sans-serif",
        color: "#bdb9b0",
        x: 2048,
        y: 212,
        align: "center",
      },
    ],
    4096,
    400,
    "#efeee9",
  );
  const hoardFace = new THREE.MeshStandardMaterial({ map: hoardTex, roughness: 0.85 });
  const hoard = new THREE.Mesh(new THREE.BoxGeometry(92, 9, 0.3), [
    M.offWhite,
    M.offWhite,
    M.offWhite,
    M.offWhite,
    hoardFace,
    M.offWhite,
  ]);
  hoard.position.set(72, 4.95, 3.2);
  hoard.castShadow = true;
  hoard.receiveShadow = true;
  scene.add(hoard);
  const props = new Kit();
  for (let x = 28; x <= 116; x += 8) props.add(box(0.25, 9.6, 0.25), M.steel, at(x, 4.8, 2.85));
  // Flood-light masts.
  for (const [x, z] of [
    [-40, -10],
    [24, -8],
    [-88, 28],
    [CRANE_X - 15, 150],
    [CRANE_X - 15, 290],
    [168, -40],
  ] as const) {
    props.add(cyl(0.2, 0.34, 30, 10), M.steel, at(x, 15, z));
    props.add(box(3.4, 0.5, 1.2), M.darkSteel, at(x, 30.2, z));
    for (const dx of [-1.1, 0, 1.1]) props.add(box(0.8, 0.12, 0.8), M.glass, at(x + dx, 29.9, z));
  }
  scene.add(props.build());
  // Warehouses on the far side of the yard, for a horizon.
  const cladding = claddingTexture();
  const shedTints = ["#e3e5e4", "#cfd6dc", "#dcd8cf", "#b9c4cc"];
  const shedRoof = new THREE.MeshStandardMaterial({
    color: "#7d858c",
    roughness: 0.7,
    metalness: 0.3,
  });
  for (let i = 0; i < 8; i++) {
    const w = 50 + rand(i * 3) * 40;
    const h = 12 + rand(i * 5) * 8;
    const wall = new THREE.MeshStandardMaterial({
      map: cladding,
      color: shedTints[i % shedTints.length]!,
      roughness: 0.6,
      metalness: 0.2,
    });
    const shed = new THREE.Mesh(new THREE.BoxGeometry(w, h, 34), [
      wall,
      wall,
      shedRoof,
      shedRoof,
      wall,
      wall,
    ]);
    shed.position.set(-260 + i * 95, h / 2, -150 - rand(i) * 60);
    shed.castShadow = shed.receiveShadow = true;
    scene.add(shed);
  }

  /* ---- Machines ----------------------------------------------------------------- */

  const stacker = buildStacker(M, lampOn);
  scene.add(stacker.root);
  const truck = buildTruck(M);
  scene.add(truck.tractor, truck.trailer);
  const crane = buildCrane(M, lampOn);
  crane.root.position.set(CRANE_X, 0, CRANE_Z);
  scene.add(crane.root);
  const ship = buildShip(M, look);
  scene.add(ship.root);
  const plane = buildPlane(M);
  scene.add(plane.root);
  const clouds = buildClouds();
  clouds.forEach((c) => scene.add(c.mesh));
  const hero = heroContainer(look, M);
  scene.add(hero);

  // Where the camera waits above the clouds: over the ship, a little ahead.
  const skyCentre = (() => {
    const s = stateAt(7.55);
    return new THREE.Vector3(s.ship.x + 60, 0, s.ship.z + 120);
  })();
  const planeFrom = skyCentre.clone().add(new THREE.Vector3(-110, 1352, 330));
  const planeTo = skyCentre.clone().add(new THREE.Vector3(130, 1352, -330));
  const planeYaw = yawOf(planeTo.x - planeFrom.x, planeTo.z - planeFrom.z);
  clouds.forEach((c, i) => c.mesh.position.set(skyCentre.x, 1290 + i * 26, skyCentre.z));

  /* ---- Camera director ------------------------------------------------------------ */

  type Shot = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; top: number };
  const shot = (
    px: number,
    py: number,
    pz: number,
    lx: number,
    ly: number,
    lz: number,
    fov: number,
    top = 0,
  ): Shot => ({
    pos: new THREE.Vector3(px, py, pz),
    look: new THREE.Vector3(lx, ly, lz),
    fov,
    top,
  });

  const SHOTS: ((T: number, st: State) => Shot)[] = [
    // Establishing: the yard from the air.
    (T) => shot(-70 + T * 10, 28 - T * 6, 64, -6, 10 - T * 5, -34, 44),
    // Side on, like a product shot: the stacker and the stack.
    (_T, st) => {
      const lx = Math.max(-7, st.stacker.x * 0.42 + 3.4);
      return shot(lx - 1.5, 5.4, 38, lx, 4.1, 0, 32);
    },
    // Three-quarter while it turns with the box.
    () => shot(-34, 11, 38, -4, 3.4, 5, 36),
    // Face on: the box comes down onto the trailer.
    () => shot(-4.5, 5.9, 46, -6, 3.6, 8, 32),
    // Tracking beside the rig, past the hoarding.
    () => {
      const c = truck.centre;
      return shot(c.x - 1, 4.6, 50, c.x, 3.3, 12, 30);
    },
    // Straight down onto the road as it turns for the pier.
    () => {
      const c = truck.centre;
      return shot(c.x, 88, c.z, c.x, 0, c.z, 38, 1);
    },
    // The quay crane, from the south-west.
    () => shot(CRANE_X - 96, 66, CRANE_Z + 118, CRANE_X + 20, 21, CRANE_Z - 6, 40),
    // Straight down over the ship as she leaves, climbing.
    (T, st) => {
      const alt = lerp(150, 560, smooth(seg(T, 6.1, 7.0)));
      return shot(st.ship.x, alt, st.ship.z - 4, st.ship.x, 0, st.ship.z - 4, 36, 1);
    },
    // Above the cloud deck, waiting for the freighter.
    () => shot(skyCentre.x, 1590, skyCentre.z, skyCentre.x, 1300, skyCentre.z, 38, 1),
  ];
  const CUTS: [number, number][] = [
    [0.55, 1.05],
    [2.6, 2.95],
    [3.2, 3.6],
    [4.02, 4.3],
    [4.55, 4.8],
    [5.3, 5.5],
    [6.0, 6.25],
    [6.85, 7.3],
  ];

  const director = (T: number, st: State): Shot => {
    let i = 0;
    while (i < CUTS.length && T >= CUTS[i]![1]) i++;
    const a = SHOTS[i]!(T, st);
    const cut = CUTS[i];
    if (!cut || T <= cut[0]) return a;
    const w = inOut(seg(T, cut[0], cut[1]));
    const b = SHOTS[i + 1]!(T, st);
    a.pos.lerp(b.pos, w);
    a.look.lerp(b.look, w);
    a.fov = lerp(a.fov, b.fov, w);
    a.top = lerp(a.top, b.top, w);
    return a;
  };

  /* ---- State ---------------------------------------------------------------------- */

  let target = 0;
  let T = 0;
  let primed = false;
  let pointerX = 0;
  let pointerY = 0;
  let width = 1;
  let height = 1;
  let mobile = false;
  let running = false;
  let frame = 0;
  let last = performance.now();
  let shadowExtent = 0;
  const heroMatrix = new THREE.Matrix4();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const north = new THREE.Vector3(0, 0, -1);
  const right = new THREE.Vector3();
  const camUp = new THREE.Vector3();
  const lastPos = new THREE.Vector3();
  const nowPos = new THREE.Vector3();
  let lastLabel = "";
  let speed = 0;
  let shown = -1;
  /** 0 while the intro title is up, 1 once a stage panel is on screen. */
  let framing = 0;
  const stackPose = new THREE.Matrix4().makeTranslation(STACK_X, BOX.H * 1.5, 0);
  const craneProbe = new THREE.Matrix4();

  const placeHero = (st: State) => {
    switch (st.carrier) {
      case "stack":
        heroMatrix.copy(stackPose);
        break;
      case "stacker":
        stacker.boxMatrix(heroMatrix);
        break;
      case "trailer":
        truck.boxMatrix(heroMatrix);
        break;
      case "crane":
        crane.boxMatrix(heroMatrix);
        break;
      case "ship":
        ship.boxMatrix(heroMatrix);
        break;
    }
    hero.matrix.copy(heroMatrix);
    hero.matrixWorldNeedsUpdate = true;
  };

  /** Which machine the read-out follows, and how its speed is shown. */
  const gauge = (t: number) => {
    if (t < 3.0) return { label: "Reach stacker", unit: "KM/H", max: 25, v0: 25 };
    if (t < 3.56) return { label: "Tractor unit", unit: "KM/H", max: 80, v0: 120 };
    if (t < 4.1) return { label: "Reach stacker", unit: "KM/H", max: 25, v0: 25 };
    if (t < 5.42) return { label: "Tractor unit", unit: "KM/H", max: 80, v0: 120 };
    if (t < 6.08) return { label: "Quay crane", unit: "M/MIN", max: 90, v0: 120 };
    if (t < 7.1) return { label: "Feeder vessel", unit: "KN", max: 22, v0: 300 };
    return { label: "Freighter", unit: "KM/H", max: 910, v0: 300 };
  };
  const gaugePosition = (t: number, out: THREE.Vector3) => {
    if (t < 3.0 || (t >= 3.56 && t < 4.1)) return out.copy(stacker.root.position);
    if (t < 5.42) return out.copy(truck.tractor.position);
    if (t < 6.08) return out.setFromMatrixPosition(crane.boxMatrix(craneProbe));
    if (t < 7.1) return out.copy(ship.root.position);
    return out.copy(plane.root.position);
  };

  const applyCamera = (s: Shot) => {
    const dist = s.pos.distanceTo(s.look);
    camUp.copy(worldUp).lerp(north, s.top).normalize();
    camera.up.copy(camUp);
    camera.position.copy(s.pos);
    camera.lookAt(s.look);
    if (!opts.reducedMotion) {
      // A little hand-held parallax under the pointer.
      right.setFromMatrixColumn(camera.matrix, 0);
      camUp.setFromMatrixColumn(camera.matrix, 1);
      const amp = dist * 0.012;
      camera.position
        .addScaledVector(right, pointerX * amp)
        .addScaledVector(camUp, pointerY * amp * 0.6);
      camera.lookAt(s.look);
    }
    camera.near = THREE.MathUtils.clamp(dist * 0.02, 0.3, 40);
    camera.far = 12000;
    camera.aspect = width / height;
    const composed = mobile ? COMPOSED_ASPECT_PHONE : COMPOSED_ASPECT;
    if (camera.aspect < composed) {
      const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(s.fov / 2)) * composed);
      camera.fov = Math.min(
        80,
        THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) / camera.aspect)),
      );
    } else {
      camera.fov = s.fov;
    }
    // Make room for the words: on phones they take the bottom of the screen,
    // so the picture lifts; on wider screens they sit bottom-left, so it
    // slides right.
    const room = framing;
    if (room > 0.001) {
      if (mobile) camera.setViewOffset(width, height, 0, height * 0.15 * room, width, height);
      else
        camera.setViewOffset(
          width,
          height,
          -width * 0.11 * room,
          height * 0.03 * room,
          width,
          height,
        );
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();

    // Fog and shadows follow the shot.
    const h = Math.max(0, camera.position.y);
    const fog = scene.fog as THREE.Fog;
    fog.near = 260 + h * 0.9;
    fog.far = 2600 + h * 3;
    const ext = THREE.MathUtils.clamp(dist * 0.6, 26, 460);
    if (Math.abs(ext - shadowExtent) > shadowExtent * 0.02) {
      shadowExtent = ext;
      const cam = sunLight.shadow.camera;
      cam.left = -ext;
      cam.right = ext;
      cam.top = ext;
      cam.bottom = -ext;
      cam.near = 1;
      cam.far = ext * 4 + 800;
      cam.updateProjectionMatrix();
      sunLight.shadow.normalBias = (ext / 2048) * 1.6;
    }
    sunLight.target.position.copy(s.look);
    sunLight.position.copy(s.look).addScaledVector(sunDir, ext * 2 + 400);
  };

  // If a weaker GPU cannot hold the frame rate, render fewer pixels rather
  // than stutter: step the pixel ratio down toward 1, never back up.
  let pixelRatio = renderer.getPixelRatio();
  let slowFrames = 0;
  let sampled = 0;
  const adapt = (dt: number) => {
    if (!running || pixelRatio <= 1) return;
    sampled++;
    if (dt > 0.026) slowFrames++;
    if (sampled < 90) return;
    if (slowFrames > 45) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    sampled = 0;
    slowFrames = 0;
  };

  const render = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.0001, (now - last) / 1000));
    last = now;
    const time = now / 1000;
    adapt(dt);

    // Ease toward the scroll position, so a flick of the wheel plays as motion.
    const k = opts.reducedMotion ? 1 : 1 - Math.pow(0.0012, dt);
    T += (target - T) * k;
    if (Math.abs(target - T) < 1e-5) T = target;

    const st = stateAt(T);
    stacker.update(st.stacker);
    truck.update(st.truck.s);
    crane.update(st.crane);
    ship.update(st.ship, time);
    stacker.root.updateMatrixWorld(true);
    truck.trailer.updateMatrixWorld(true);
    crane.root.updateMatrixWorld(true);
    ship.root.updateMatrixWorld(true);
    placeHero(st);

    // Plane and clouds only exist for the last act.
    plane.root.visible = st.plane.visible;
    if (plane.root.visible) {
      plane.root.position.lerpVectors(planeFrom, planeTo, st.plane.u);
      plane.root.rotation.set(0, planeYaw, Math.sin(time * 0.6) * 0.015);
    }
    const cloudAlpha = smooth(seg(T, 6.7, 7.05));
    clouds.forEach((c, i) => {
      c.mesh.visible = cloudAlpha > 0.001;
      c.mat.opacity = cloudAlpha * (i === 0 ? 1 : 0.7);
      c.map.offset.set(time * 0.0016 * (i + 1), time * 0.0009);
    });

    // Water.
    ocean.uniforms.uTime.value = time;
    // She always heads due south, bow first.
    ocean.uniforms.uShip.value.set(st.ship.x, st.ship.z, 0, 1);
    ocean.uniforms.uWake.value = st.ship.wake;
    ocean.uniforms.uRun.value = st.ship.run;

    // Warning lights.
    const blink = Math.sin(time * 6) > 0 ? 1 : 0.25;
    M.amber.emissiveIntensity = 1.6 * blink;
    M.beacon.emissiveIntensity = 2.2 * (Math.sin(time * 2.2) > 0.6 ? 1 : 0.2);

    const wantFrame = T < 0.9 ? 0 : 1;
    framing += (wantFrame - framing) * (1 - Math.pow(0.05, dt));
    const skyU = sky.material.uniforms;
    skyU["time"]!.value = time;
    applyCamera(director(T, st));

    // The read-out: which machine, how fast.
    const g = gauge(T);
    gaugePosition(T, nowPos);
    if (g.label !== lastLabel) {
      lastPos.copy(nowPos);
      speed = 0;
    }
    const v = nowPos.distanceTo(lastPos) / dt;
    lastPos.copy(nowPos);
    const display = g.max * (1 - Math.exp(-v / g.v0));
    speed += (display - speed) * (1 - Math.pow(0.02, dt));
    const rounded = Math.round(speed < 0.5 ? 0 : speed);
    if (rounded !== shown || g.label !== lastLabel) {
      shown = rounded;
      lastLabel = g.label;
      opts.onTelemetry?.({ label: g.label, value: rounded, unit: g.unit });
    }

    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    render(now);
    frame = running ? requestAnimationFrame(loop) : 0;
  };

  return {
    setProgress(p) {
      target = Math.min(1, Math.max(0, p)) * CHAPTERS;
      if (!primed) {
        T = target;
        primed = true;
      }
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    resize(w, h, isMobile) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      mobile = isMobile;
      renderer.setSize(width, height, false);
      if (!running) render(performance.now());
    },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
    dispose() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material;
        if (!mat) return;
        (Array.isArray(mat) ? mat : [mat]).forEach((m) => materials.add(m));
      });
      materials.forEach((m) => {
        for (const value of Object.values(m)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      envTarget.dispose();
      pmrem.dispose();
      envScene.traverse((obj) => (obj as THREE.Mesh).geometry?.dispose?.());
      renderer.dispose();
    },
  };
}

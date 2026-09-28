import * as THREE from "three";
import {
  SCREEN_H,
  SCREEN_W,
  androidScreen,
  browserMock,
  phoneMock,
  pycharmScreen,
  terminalScreen,
  videoPoster,
  vscodeScreen,
  type Screen,
} from "./screens";
import { CHAPTER_COUNT, ease, insetsAt, locate } from "./timeline";

/**
 * THE STUDIO
 *
 * A developer's room, built from primitives and drawn in two inks: paper where
 * the light lands, cobalt where it does not. Scrolling flies the camera from
 * the doorway to each screen on the desk — VS Code, Android Studio, PyCharm,
 * a Linux terminal — then pulls back while the things built on them rise out
 * of the monitor, and finally pushes into the centre screen.
 *
 * The two-ink look is a Lambert material whose final colour is replaced by a
 * hard step on the direct light it received (shadow maps included), plus a
 * whisper of paper grain and diagonal hatching in the shade.
 */

const PAPER = "#ece5d3";
const INK = "#2447c9";
const INK_DEEP = "#16307f";
const LINE = "#1b2a6b";
const SKIN = "#f3e6d2";
const ORANGE = "#f08a3c";
const ORANGE_DEEP = "#b8561c";

type Ink = { lit: string; shade: string };
const PAPER_INK: Ink = { lit: PAPER, shade: INK };
const BLUE_INK: Ink = { lit: INK, shade: INK_DEEP };
const DEEP_INK: Ink = { lit: INK_DEEP, shade: "#0e1d52" };
const SKIN_INK: Ink = { lit: SKIN, shade: INK };
const ORANGE_INK: Ink = { lit: ORANGE, shade: ORANGE_DEEP };
const WHITE_INK: Ink = { lit: "#fbf8f1", shade: "#9fb0e8" };

const materialCache = new Map<string, THREE.MeshLambertMaterial>();

function ink({ lit, shade }: Ink): THREE.MeshLambertMaterial {
  const key = `${lit}|${shade}`;
  const cached = materialCache.get(key);
  if (cached) return cached;
  const material = new THREE.MeshLambertMaterial({ color: "#ffffff" });
  const uLit = new THREE.Color(lit);
  const uShade = new THREE.Color(shade);
  material.onBeforeCompile = (shader) => {
    // Colours are written after the colour-space conversion, so pass them as
    // the sRGB values they are rather than letting three linearise them.
    shader.uniforms["uLit"] = { value: new THREE.Vector3(uLit.r, uLit.g, uLit.b) };
    shader.uniforms["uShade"] = { value: new THREE.Vector3(uShade.r, uShade.g, uShade.b) };
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uLit;\nuniform vec3 uShade;\nvoid main() {")
      .replace(
        "#include <dithering_fragment>",
        `
        float lightIn = dot(reflectedLight.directDiffuse, vec3(1.0)) / max(dot(diffuseColor.rgb, vec3(1.0)), 1e-4);
        float lit = smoothstep(0.16, 0.24, lightIn);
        vec3 col = mix(uShade, uLit, lit);
        float hatch = step(0.62, fract((gl_FragCoord.x - gl_FragCoord.y) / 7.0));
        col = mix(col, col * 0.9, (1.0 - lit) * hatch * 0.45);
        float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.05;
        gl_FragColor = vec4(col, 1.0);
        `,
      );
  };
  // Every ink shares one program; the colours differ only in uniforms.
  material.customProgramCacheKey = () => key;
  materialCache.set(key, material);
  return material;
}

const lineMaterial = new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0.7 });
const hullMaterial = new THREE.MeshBasicMaterial({ color: LINE, side: THREE.BackSide });

/** A box with a pen outline around its hard edges. */
function box(w: number, h: number, d: number, style: Ink, outline = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, ink(style));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (outline) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), lineMaterial));
  return mesh;
}

/** A rounded solid with an inverted-hull outline, for anything organic. */
function solid(geo: THREE.BufferGeometry, style: Ink, hull = 0.012) {
  const mesh = new THREE.Mesh(geo, ink(style));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (hull > 0) {
    const shell = new THREE.Mesh(geo, hullMaterial);
    geo.computeBoundingSphere();
    const r = geo.boundingSphere?.radius ?? 1;
    shell.scale.setScalar(1 + hull / r);
    mesh.add(shell);
  }
  return mesh;
}

function cylinder(rt: number, rb: number, h: number, style: Ink, seg = 20) {
  const geo = new THREE.CylinderGeometry(rt, rb, h, seg);
  const mesh = new THREE.Mesh(geo, ink(style));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineMaterial));
  return mesh;
}

const UP = new THREE.Vector3(0, 1, 0);

/** A capsule stretched between two points — an arm, a leg. */
class Limb {
  mesh: THREE.Mesh;
  constructor(
    public from: THREE.Vector3,
    public to: THREE.Vector3,
    radius: number,
    style: Ink,
  ) {
    const length = from.distanceTo(to);
    this.mesh = solid(new THREE.CapsuleGeometry(radius, length, 6, 14), style, 0.01);
    this.update();
  }
  update() {
    const dir = this.to.clone().sub(this.from);
    const length = dir.length();
    this.mesh.position.copy(this.from).addScaledVector(dir, 0.5);
    this.mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
    const geo = this.mesh.geometry as THREE.CapsuleGeometry;
    this.mesh.scale.set(1, length / geo.parameters.height, 1);
  }
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* ---- Camera path ---------------------------------------------------------- */

type Pose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

const POSES: Pose[] = [
  { pos: v(3.3, 2.5, 2.4), look: v(-0.2, 0.95, -1.9), fov: 38 },
  { pos: v(0.6, 1.55, -0.98), look: v(-0.04, 1.1, -2.4), fov: 36 },
  { pos: v(-0.05, 1.5, -1.2), look: v(-1.0, 1.08, -2.3), fov: 38 },
  { pos: v(0.1, 1.5, -1.2), look: v(1.0, 1.08, -2.3), fov: 38 },
  { pos: v(-0.5, 1.25, -1.35), look: v(-1.06, 0.93, -2.03), fov: 40 },
  { pos: v(1.25, 1.8, 0.05), look: v(-0.02, 1.5, -1.95), fov: 40 },
  { pos: v(0, 1.13, -1.72), look: v(0, 1.12, -2.45), fov: 36 },
];

/** The frame shape every pose was composed for. */
const COMPOSED_ASPECT = 1.55;

/* ---- Build ---------------------------------------------------------------- */

type Monitor = { group: THREE.Group; screen: THREE.Mesh };

function monitor(texture: THREE.Texture, w = 0.9, h = 0.52): Monitor {
  const group = new THREE.Group();
  const bezel = box(w + 0.04, h + 0.04, 0.03, DEEP_INK);
  group.add(bezel);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  screen.position.z = 0.0165;
  group.add(screen);
  const neck = box(0.05, 0.22, 0.04, BLUE_INK);
  neck.position.set(0, -h / 2 - 0.07, -0.04);
  group.add(neck);
  const foot = box(0.26, 0.02, 0.18, BLUE_INK);
  foot.position.set(0, -h / 2 - 0.18, -0.02);
  group.add(foot);
  return { group, screen };
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export type Studio = {
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  resize: (w: number, h: number, mobile: boolean) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

export function createStudio(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }): Studio {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);

  // Sun through the window, and nothing else: the look lives or dies on one
  // clean light direction.
  const sun = new THREE.DirectionalLight("#ffffff", Math.PI);
  sun.position.set(-5, 6.8, 3.6);
  sun.target.position.set(0.2, 0, -2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -5;
  sun.shadow.camera.right = 5;
  sun.shadow.camera.top = 5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 20;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.AmbientLight("#ffffff", 0.3));

  /* Room */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), ink(PAPER_INK));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1);
  floor.receiveShadow = true;
  scene.add(floor);

  const back = box(7.5, 3.6, 0.1, PAPER_INK, false);
  back.castShadow = false;
  back.position.set(0.4, 1.8, -3.05);
  scene.add(back);

  // Left wall, built around a window opening.
  const WX = -3.2;
  const wall = (y: number, h: number, z: number, d: number) => {
    const piece = box(0.12, h, d, PAPER_INK, false);
    piece.castShadow = false;
    piece.position.set(WX, y, z);
    scene.add(piece);
  };
  wall(0.45, 0.9, -1.0, 4.1);
  wall(3.1, 1.0, -1.0, 4.1);
  wall(1.75, 1.7, -2.75, 0.6);
  wall(1.75, 1.7, 0.45, 1.2);
  const mullions = [
    [WX, 1.75, -1.5, 0.05, 1.7, 0.05],
    [WX, 1.75, -0.8, 0.05, 1.7, 0.05],
    [WX, 1.75, -2.2, 0.05, 1.7, 0.05],
    [WX, 1.75, -0.15, 0.05, 1.7, 0.05],
    [WX, 1.75, -1.15, 0.05, 0.05, 2.7],
  ] as const;
  mullions.forEach(([x, y, z, w, h, d]) => {
    const m = box(w, h, d, BLUE_INK);
    m.position.set(x, y, z);
    scene.add(m);
  });
  const sill = box(0.3, 0.05, 2.9, PAPER_INK);
  sill.position.set(WX + 0.1, 0.92, -1.1);
  scene.add(sill);

  // The city through the window.
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 12),
    new THREE.MeshBasicMaterial({ color: "#c9d4f2" }),
  );
  sky.position.set(-14, 3, -1);
  sky.rotation.y = Math.PI / 2;
  scene.add(sky);
  for (let i = 0; i < 14; i++) {
    const h = 1.5 + ((i * 37) % 11) * 0.35;
    const tower = box(0.8 + (i % 3) * 0.3, h, 0.9, BLUE_INK, false);
    tower.castShadow = false;
    tower.position.set(-8 - (i % 4) * 1.4, h / 2 + 0.2, -6 + i * 0.95);
    scene.add(tower);
  }

  /* Desk */
  const DESK_Y = 0.75;
  const desk = new THREE.Group();
  const top = box(2.5, 0.05, 0.85, PAPER_INK);
  top.position.set(0, DESK_Y, -2.2);
  desk.add(top);
  [
    [-1.18, -2.55],
    [1.18, -2.55],
    [-1.18, -1.85],
    [1.18, -1.85],
  ].forEach(([x, z]) => {
    const leg = box(0.05, DESK_Y, 0.05, BLUE_INK);
    leg.position.set(x!, DESK_Y / 2, z!);
    desk.add(leg);
  });
  const drawer = box(0.5, 0.45, 0.75, PAPER_INK);
  drawer.position.set(0.9, 0.45, -2.2);
  desk.add(drawer);
  scene.add(desk);

  /* Screens */
  const screens: Screen[] = [vscodeScreen(), androidScreen(), pycharmScreen(), terminalScreen()];
  const textures = screens.map((s) => canvasTexture(s.canvas));
  const posterTexture = canvasTexture(videoPoster());

  const center = monitor(textures[0]!);
  center.group.position.set(0, 1.12, -2.45);
  const left = monitor(textures[1]!);
  left.group.position.set(-0.98, 1.1, -2.33);
  left.group.rotation.y = 0.38;
  const right = monitor(textures[2]!);
  right.group.position.set(0.98, 1.1, -2.33);
  right.group.rotation.y = -0.38;
  scene.add(center.group, left.group, right.group);

  // Laptop on the left, lid open, running a Linux shell.
  const laptop = new THREE.Group();
  const base = box(0.4, 0.018, 0.28, DEEP_INK);
  laptop.add(base);
  const lid = new THREE.Group();
  lid.position.set(0, 0.009, -0.14);
  lid.rotation.x = -0.28;
  const lidBack = box(0.4, 0.26, 0.012, DEEP_INK);
  lidBack.position.set(0, 0.13, 0);
  lid.add(lidBack);
  const laptopScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.37, 0.235),
    new THREE.MeshBasicMaterial({ map: textures[3]!, toneMapped: false }),
  );
  laptopScreen.position.set(0, 0.13, 0.007);
  lid.add(laptopScreen);
  laptop.add(lid);
  laptop.position.set(-1.06, DESK_Y + 0.035, -2.02);
  laptop.rotation.y = 0.55;
  scene.add(laptop);

  // Keyboard: one instanced mesh for all the keys.
  const kb = box(0.46, 0.02, 0.15, BLUE_INK);
  kb.position.set(0, DESK_Y + 0.035, -2.02);
  scene.add(kb);
  const keys = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.026, 0.012, 0.026),
    ink(PAPER_INK),
    60,
  );
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 15; c++) {
      m4.makeTranslation(-0.2 + c * 0.0285, DESK_Y + 0.051, -2.07 + r * 0.032);
      keys.setMatrixAt(k++, m4);
    }
  keys.castShadow = true;
  scene.add(keys);
  const mouse = solid(new THREE.SphereGeometry(0.035, 16, 10), PAPER_INK);
  mouse.scale.set(0.8, 0.45, 1.2);
  mouse.position.set(0.36, DESK_Y + 0.035, -2.0);
  scene.add(mouse);

  // Coffee.
  const mug = cylinder(0.045, 0.04, 0.1, ORANGE_INK);
  mug.position.set(0.6, DESK_Y + 0.075, -1.92);
  scene.add(mug);
  const handle = solid(new THREE.TorusGeometry(0.028, 0.008, 8, 16), ORANGE_INK, 0.004);
  handle.position.set(0.648, DESK_Y + 0.08, -1.92);
  handle.rotation.y = Math.PI / 2;
  scene.add(handle);

  // Tux, because of course.
  const tux = new THREE.Group();
  const body = solid(new THREE.SphereGeometry(0.06, 20, 14), DEEP_INK);
  body.scale.set(1, 1.25, 0.9);
  tux.add(body);
  const belly = solid(new THREE.SphereGeometry(0.048, 20, 14), WHITE_INK, 0);
  belly.scale.set(0.95, 1.2, 0.6);
  belly.position.set(0, -0.005, 0.03);
  tux.add(belly);
  const head = solid(new THREE.SphereGeometry(0.042, 18, 12), DEEP_INK);
  head.position.set(0, 0.095, 0.005);
  tux.add(head);
  const beak = solid(new THREE.ConeGeometry(0.014, 0.035, 10), ORANGE_INK, 0);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.09, 0.05);
  tux.add(beak);
  [-0.028, 0.028].forEach((x) => {
    const foot = solid(new THREE.SphereGeometry(0.022, 12, 8), ORANGE_INK, 0);
    foot.scale.set(1.2, 0.35, 1.4);
    foot.position.set(x, -0.075, 0.025);
    tux.add(foot);
    const eye = solid(new THREE.SphereGeometry(0.009, 10, 8), WHITE_INK, 0);
    eye.position.set(x * 0.55, 0.108, 0.038);
    tux.add(eye);
  });
  tux.position.set(-0.52, DESK_Y + 0.1, -2.35);
  tux.rotation.y = 0.35;
  scene.add(tux);

  // Plant on the floor, right of the desk.
  const pot = cylinder(0.16, 0.12, 0.32, PAPER_INK);
  pot.position.set(1.75, 0.16, -2.55);
  scene.add(pot);
  for (let i = 0; i < 9; i++) {
    const leaf = solid(new THREE.SphereGeometry(0.1, 12, 8), BLUE_INK, 0.006);
    const a = (i / 9) * Math.PI * 2;
    leaf.scale.set(0.45, 2.1, 0.18);
    leaf.position.set(1.75 + Math.cos(a) * 0.12, 0.62 + (i % 3) * 0.08, -2.55 + Math.sin(a) * 0.12);
    leaf.rotation.set(Math.sin(a) * 0.45, a, -Math.cos(a) * 0.45);
    scene.add(leaf);
  }

  // Shelf of books on the back wall.
  const shelf = box(1.1, 0.04, 0.24, PAPER_INK);
  shelf.position.set(2.35, 1.72, -2.9);
  scene.add(shelf);
  for (let i = 0; i < 9; i++) {
    const h = 0.2 + ((i * 7) % 5) * 0.025;
    const book = box(0.07, h, 0.18, i % 3 === 0 ? ORANGE_INK : i % 2 ? BLUE_INK : PAPER_INK);
    book.position.set(1.88 + i * 0.1, 1.74 + h / 2, -2.9);
    book.rotation.z = i === 8 ? 0.25 : 0;
    scene.add(book);
  }

  // Notes pinned above the desk.
  [
    [-0.7, 2.15, 0.34, 0.42, -0.05],
    [-0.25, 2.28, 0.3, 0.36, 0.04],
    [0.3, 2.12, 0.42, 0.3, -0.02],
    [0.78, 2.3, 0.26, 0.32, 0.06],
  ].forEach(([x, y, w, h, r]) => {
    const note = box(w!, h!, 0.005, PAPER_INK);
    note.position.set(x!, y!, -2.99);
    note.rotation.z = r!;
    scene.add(note);
    const pin = solid(new THREE.SphereGeometry(0.014, 10, 8), ORANGE_INK, 0);
    pin.position.set(x!, y! + h! / 2 - 0.04, -2.98);
    scene.add(pin);
  });

  /* Chair */
  const chair = new THREE.Group();
  const seat = box(0.5, 0.07, 0.48, BLUE_INK);
  seat.position.set(0, 0.48, -1.42);
  chair.add(seat);
  const backrest = box(0.48, 0.55, 0.06, BLUE_INK);
  backrest.position.set(0, 0.86, -1.13);
  backrest.rotation.x = -0.1;
  chair.add(backrest);
  const pole = cylinder(0.025, 0.025, 0.36, DEEP_INK);
  pole.position.set(0, 0.27, -1.42);
  chair.add(pole);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = box(0.3, 0.025, 0.04, DEEP_INK);
    spoke.position.set(Math.cos(a) * 0.15, 0.07, -1.42 + Math.sin(a) * 0.15);
    spoke.rotation.y = -a;
    chair.add(spoke);
  }
  scene.add(chair);

  /* The developer */
  const person = new THREE.Group();
  const HOODIE = BLUE_INK;
  const hips = solid(new THREE.SphereGeometry(0.16, 20, 14), HOODIE);
  hips.scale.set(1.1, 0.6, 0.95);
  hips.position.set(0, 0.6, -1.42);
  person.add(hips);
  const torso = new Limb(v(0, 0.62, -1.42), v(0, 1.03, -1.52), 0.155, HOODIE);
  person.add(torso.mesh);
  const hood = solid(new THREE.SphereGeometry(0.1, 16, 12), HOODIE);
  hood.scale.set(1.5, 0.7, 0.9);
  hood.position.set(0, 1.08, -1.46);
  person.add(hood);
  const neck = new Limb(v(0, 1.06, -1.53), v(0, 1.14, -1.56), 0.045, SKIN_INK);
  person.add(neck.mesh);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.23, -1.58);
  const skull = solid(new THREE.SphereGeometry(0.105, 24, 18), SKIN_INK);
  skull.scale.set(0.95, 1.08, 1);
  headGroup.add(skull);
  // Curly hair: a cluster of small spheres over the crown and back.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 * 2.3;
    const ring = i / 26;
    const curl = solid(new THREE.SphereGeometry(0.038, 12, 10), DEEP_INK, 0.004);
    curl.position.set(
      Math.cos(a) * 0.085 * (1 - ring * 0.5),
      0.06 + ring * 0.05 - Math.abs(Math.sin(a)) * 0.01,
      0.02 + Math.sin(a) * 0.085 * (1 - ring * 0.5) + 0.015,
    );
    headGroup.add(curl);
  }
  [-0.1, 0.1].forEach((x) => {
    const ear = solid(new THREE.SphereGeometry(0.025, 10, 8), SKIN_INK, 0.004);
    ear.scale.set(0.5, 1, 0.8);
    ear.position.set(x, 0, 0.01);
    headGroup.add(ear);
  });
  // Headphones round the neck — the universal "focused" signal.
  const cans = solid(new THREE.TorusGeometry(0.09, 0.012, 8, 24, Math.PI), DEEP_INK, 0.004);
  cans.position.set(0, -0.12, 0.05);
  cans.rotation.set(Math.PI / 2 + 0.3, 0, 0);
  headGroup.add(cans);
  person.add(headGroup);

  const shoulders = [v(-0.2, 1.0, -1.5), v(0.2, 1.0, -1.5)];
  const elbows = [v(-0.25, 0.83, -1.72), v(0.25, 0.83, -1.72)];
  const wristsRest = [v(-0.1, 0.8, -1.97), v(0.12, 0.8, -1.97)];
  const wrists = wristsRest.map((w) => w.clone());
  const upper = shoulders.map((s, i) => new Limb(s, elbows[i]!, 0.052, HOODIE));
  const fore = elbows.map((e, i) => new Limb(e, wrists[i]!, 0.042, HOODIE));
  const hands = wrists.map((w) => {
    const hand = solid(new THREE.SphereGeometry(0.035, 14, 10), SKIN_INK, 0.006);
    hand.scale.set(1, 0.55, 1.3);
    hand.position.copy(w);
    return hand;
  });
  upper.forEach((l) => person.add(l.mesh));
  fore.forEach((l) => person.add(l.mesh));
  hands.forEach((h) => person.add(h));

  [-0.1, 0.1].forEach((x) => {
    const thigh = new Limb(v(x, 0.6, -1.42), v(x * 1.2, 0.58, -1.84), 0.07, DEEP_INK);
    const shin = new Limb(v(x * 1.2, 0.58, -1.84), v(x * 1.2, 0.1, -1.9), 0.055, DEEP_INK);
    const shoe = solid(new THREE.SphereGeometry(0.06, 14, 10), PAPER_INK, 0.006);
    shoe.scale.set(0.8, 0.5, 1.6);
    shoe.position.set(x * 1.2, 0.05, -1.97);
    person.add(thigh.mesh, shin.mesh, shoe);
  });
  scene.add(person);

  /* What rises out of the screen */
  const emerge = new THREE.Group();
  const browser = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.42, 0.015), [
    ink(PAPER_INK),
    ink(PAPER_INK),
    ink(PAPER_INK),
    ink(PAPER_INK),
    new THREE.MeshBasicMaterial({ map: canvasTexture(browserMock()), toneMapped: false }),
    ink(PAPER_INK),
  ]);
  browser.add(new THREE.LineSegments(new THREE.EdgesGeometry(browser.geometry), lineMaterial));
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.02), [
    ink(DEEP_INK),
    ink(DEEP_INK),
    ink(DEEP_INK),
    ink(DEEP_INK),
    new THREE.MeshBasicMaterial({ map: canvasTexture(phoneMock()), toneMapped: false }),
    ink(DEEP_INK),
  ]);
  phone.add(new THREE.LineSegments(new THREE.EdgesGeometry(phone.geometry), lineMaterial));
  const db = new THREE.Group();
  [0, 0.09, 0.18].forEach((y) => {
    const disk = cylinder(0.11, 0.11, 0.07, y === 0.09 ? ORANGE_INK : BLUE_INK, 24);
    disk.position.y = y;
    db.add(disk);
  });
  const chart = new THREE.Group();
  const chartBase = box(0.36, 0.012, 0.22, PAPER_INK);
  chart.add(chartBase);
  const bars = [0.1, 0.16, 0.12, 0.24, 0.3].map((h, i) => {
    const bar = box(0.045, h, 0.045, i === 4 ? ORANGE_INK : BLUE_INK);
    bar.position.set(-0.13 + i * 0.065, h / 2, 0);
    chart.add(bar);
    return bar;
  });
  const risers: { obj: THREE.Object3D; to: THREE.Vector3; spin: number; size: number }[] = [
    { obj: browser, to: v(-0.6, 1.72, -1.8), spin: 0.3, size: 1.35 },
    { obj: phone, to: v(0.5, 1.66, -1.62), spin: -0.35, size: 1.4 },
    { obj: db, to: v(1.05, 1.32, -1.78), spin: 0, size: 1.3 },
    { obj: chart, to: v(-0.02, 2.08, -2.0), spin: 0.15, size: 1.3 },
  ];
  risers.forEach((r) => emerge.add(r.obj));
  scene.add(emerge);
  const origin = v(0, 1.12, -2.4);

  /* State */
  let progress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let width = 1;
  let height = 1;
  let mobile = false;
  let running = false;
  let frame = 0;
  let last = performance.now();
  const smoothPos = POSES[0]!.pos.clone();
  const smoothLook = POSES[0]!.look.clone();
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  let screenShowsPoster = false;

  if (opts.reducedMotion) screens.forEach((s) => s.finish());

  const pose = () => {
    const { index, move } = locate(progress);
    const a = POSES[index]!;
    const b = POSES[Math.min(index + 1, POSES.length - 1)]!;
    tmpPos.lerpVectors(a.pos, b.pos, move);
    tmpLook.lerpVectors(a.look, b.look, move);
    return { fov: a.fov + (b.fov - a.fov) * move, index, move };
  };

  const applyViewport = (fov: number) => {
    const [t, r, b, l] = insetsAt(progress, mobile);
    const x0 = l * width;
    const y0 = t * height;
    const vw = Math.max(1, width - (l + r) * width);
    const vh = Math.max(1, height - (t + b) * height);
    camera.aspect = vw / vh;
    // Keep each shot's horizontal framing on narrow screens by widening the
    // lens, rather than backing the camera into whatever is behind it.
    if (camera.aspect < COMPOSED_ASPECT) {
      const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(fov / 2)) * COMPOSED_ASPECT);
      camera.fov = Math.min(
        84,
        THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) / camera.aspect)),
      );
    } else {
      camera.fov = fov;
    }
    // Project as if the canvas were only the visible frame, so the subject is
    // centred in what the visitor can actually see.
    camera.setViewOffset(vw, vh, -x0, -y0, width, height);
    camera.updateProjectionMatrix();
  };

  const render = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const time = now / 1000;
    const { fov, index, move } = pose();

    // Ease toward the scroll-driven pose instead of snapping to it; a fast
    // flick of the wheel then reads as a camera move rather than a cut.
    const k = opts.reducedMotion ? 1 : 1 - Math.pow(0.0015, dt);
    smoothPos.lerp(tmpPos, k);
    smoothLook.lerp(tmpLook, k);
    camera.position.copy(smoothPos);
    if (!opts.reducedMotion) {
      camera.position.x += pointerX * 0.06;
      camera.position.y += pointerY * 0.04;
    }
    camera.lookAt(smoothLook);
    applyViewport(fov);

    // Typing. The screen being looked at types fastest.
    if (!opts.reducedMotion) {
      screens.forEach((s, i) => {
        const active =
          (i === 0 && index === 1) ||
          (i === 1 && index === 2) ||
          (i === 2 && index === 3) ||
          (i === 3 && index === 4);
        if (s.tick(dt, time, active)) textures[i]!.needsUpdate = true;
      });
      const typing = index >= 1 && index <= 4 ? 1 : 0.4;
      wrists.forEach((w, i) => {
        w.copy(wristsRest[i]!);
        w.y += Math.max(0, Math.sin(time * 17 + i * 1.9)) * 0.012 * typing;
        w.x += Math.sin(time * 3.1 + i) * 0.01 * typing;
        hands[i]!.position.copy(w);
        fore[i]!.update();
      });
      headGroup.position.y = 1.23 + Math.sin(time * 1.3) * 0.004;
    }

    // Head turns toward whatever is being worked on.
    const targetYaw = [0, 0, 0.42, -0.42, 0.6, 0, 0][index] ?? 0;
    const nextYaw = [0, 0.42, -0.42, 0.6, 0, 0, 0][index] ?? 0;
    const yaw = targetYaw + (nextYaw - targetYaw) * move;
    headGroup.rotation.y += (yaw - headGroup.rotation.y) * Math.min(1, dt * 4);
    headGroup.rotation.x = index === 4 ? 0.25 : 0.08;

    // The centre screen becomes the video poster for the last chapter.
    const wantPoster = index >= 5 && (index === 6 || move > 0.4);
    if (wantPoster !== screenShowsPoster) {
      (center.screen.material as THREE.MeshBasicMaterial).map = wantPoster
        ? posterTexture
        : textures[0]!;
      (center.screen.material as THREE.MeshBasicMaterial).needsUpdate = true;
      screenShowsPoster = wantPoster;
    }

    // Products rise out of the monitor through chapter five.
    const rise = index === 4 ? move : index === 5 ? 1 : index === 6 ? 1 - move : 0;
    emerge.visible = rise > 0.001;
    risers.forEach((r, i) => {
      const t = ease(Math.min(1, Math.max(0, rise * 1.4 - i * 0.12)));
      r.obj.position.lerpVectors(origin, r.to, t);
      r.obj.scale.setScalar(Math.max(0.001, t * r.size));
      r.obj.rotation.y =
        r.spin * t + (opts.reducedMotion ? 0 : Math.sin(time * 0.8 + i) * 0.05 * t);
      if (!opts.reducedMotion) r.obj.position.y += Math.sin(time * 1.2 + i * 1.7) * 0.012 * t;
    });
    bars.forEach((bar, i) => {
      const s = opts.reducedMotion ? 1 : 0.75 + Math.sin(time * 1.6 + i) * 0.25;
      bar.scale.y = s;
      bar.position.y = (bar.geometry as THREE.BoxGeometry).parameters.height * s * 0.5;
    });

    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    render(now);
    frame = running ? requestAnimationFrame(loop) : 0;
  };

  return {
    setProgress(p) {
      progress = p;
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
      pose();
      smoothPos.copy(tmpPos);
      smoothLook.copy(tmpLook);
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
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
      });
      textures.forEach((t) => t.dispose());
      posterTexture.dispose();
      materialCache.forEach((m) => m.dispose());
      materialCache.clear();
      renderer.dispose();
    },
  };
}

export { CHAPTER_COUNT, SCREEN_W, SCREEN_H };

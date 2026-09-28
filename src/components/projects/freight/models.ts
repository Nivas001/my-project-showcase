import * as THREE from "three";
import { HALF_PI, Kit, at, box, cyl, rbox, textTexture, type Materials } from "./kit";
import {
  corrugationNormal,
  containerSideShade,
  doorShade,
  windowsTexture,
  cloudTexture,
} from "./kit";
import { BOX, DECK_Y, SHIP, STACKER, bayZ, roadAt, rowX, yawOf, type State } from "./timeline";

/**
 * THE MACHINES
 *
 * Every vehicle is built at real-world size, in metres, from primitives:
 * a reach stacker, a tractor and skeletal trailer, a ship-to-shore crane, a
 * feeder container ship and a four-engined freighter. Each rigid part is
 * merged per material, so a whole machine is a handful of draw calls.
 *
 * Proportions follow the real things closely enough that they read as
 * machines rather than toys: tyre sizes, wheelbases, a 40ft box's 12.19 m.
 */

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const X_AXIS = V(1, 0, 0);

/** Adds a box whose long axis runs from a to b. */
function strut(
  kit: Kit,
  a: THREE.Vector3,
  b: THREE.Vector3,
  w: number,
  h: number,
  material: THREE.Material,
) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(X_AXIS, dir.normalize());
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, V(1, 1, 1));
  kit.add(box(len, h, w), material, m);
}

/** A round bar from a to b. */
function rod(kit: Kit, a: THREE.Vector3, b: THREE.Vector3, r: number, material: THREE.Material) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, V(1, 1, 1));
  kit.add(cyl(r, r, len, 10), material, m);
}

/* ==========================================================================
 * Wheels
 * ======================================================================== */

type WheelSpec = { r: number; w: number; rim: THREE.Material; hub?: boolean };

/** A tyre and rim, axle along z, dished face toward +z. */
function wheelGroup(M: Materials, { r, w, rim, hub = true }: WheelSpec) {
  const hw = w / 2;
  const t = (x: number, y: number) => new THREE.Vector2(x, y * hw);
  const tread = r * 0.985;
  const profile = [
    t(r * 0.6, -0.78),
    t(r * 0.8, -1),
    t(r * 0.94, -0.97),
    t(r * 0.99, -0.86),
    t(r, -0.7),
    t(r, -0.42),
    t(tread, -0.4),
    t(tread, -0.34),
    t(r, -0.32),
    t(r, -0.03),
    t(tread, -0.01),
    t(tread, 0.01),
    t(r, 0.03),
    t(r, 0.32),
    t(tread, 0.34),
    t(tread, 0.4),
    t(r, 0.42),
    t(r, 0.7),
    t(r * 0.99, 0.86),
    t(r * 0.94, 0.97),
    t(r * 0.8, 1),
    t(r * 0.6, 0.78),
  ];
  const kit = new Kit();
  kit.add(new THREE.LatheGeometry(profile, 36), M.rubber, at(0, 0, 0, HALF_PI));
  const rr = r * 0.6;
  const dish = [
    new THREE.Vector2(rr * 0.99, -hw * 0.75),
    new THREE.Vector2(rr * 0.99, hw * 0.55),
    new THREE.Vector2(rr * 0.93, hw * 0.62),
    new THREE.Vector2(rr * 0.72, hw * 0.42),
    new THREE.Vector2(rr * 0.36, hw * 0.46),
    new THREE.Vector2(rr * 0.3, hw * 0.6),
    new THREE.Vector2(0.001, hw * 0.62),
  ];
  kit.add(new THREE.LatheGeometry(dish, 28), rim, at(0, 0, 0, HALF_PI));
  if (hub) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      kit.add(
        cyl(0.022, 0.022, 0.05, 6),
        M.chrome,
        at(Math.cos(a) * rr * 0.4, Math.sin(a) * rr * 0.4, hw * 0.63, HALF_PI),
      );
    }
  }
  return kit.build();
}

/** A wheel on a hub that rolls about z. Right-hand wheels turn their dish outward. */
function mountWheel(
  parent: THREE.Object3D,
  template: THREE.Group,
  x: number,
  y: number,
  z: number,
) {
  const hub = new THREE.Group();
  hub.position.set(x, y, z);
  const wheel = template.clone();
  if (z < 0) wheel.rotation.y = Math.PI;
  hub.add(wheel);
  parent.add(hub);
  return hub;
}

/* ==========================================================================
 * Containers
 * ======================================================================== */

export type ContainerLook = {
  materials: THREE.Material[];
  geometry: THREE.BoxGeometry;
};

/**
 * One material set shared by every plain container. Face order follows
 * BoxGeometry: +x, -x (long sides), +y (roof), -y, +z (doors), -z (front end).
 * Paint colour comes from instance colours, so the base colour is white.
 */
export function containerLook(): ContainerLook {
  const pitch = 0.28;
  const sideN = corrugationNormal();
  sideN.repeat.set(Math.round(BOX.L / pitch), 1);
  const endN = sideN.clone();
  endN.repeat.set(Math.round(BOX.W / pitch), 1);
  const roofN = corrugationNormal(true);
  roofN.repeat.set(1, Math.round(BOX.L / 0.55));
  const shade = containerSideShade();
  const doors = doorShade();

  const side = new THREE.MeshStandardMaterial({
    map: shade,
    normalMap: sideN,
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughness: 0.62,
    metalness: 0.25,
  });
  const roof = new THREE.MeshStandardMaterial({
    normalMap: roofN,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughness: 0.7,
    metalness: 0.2,
  });
  const under = new THREE.MeshStandardMaterial({ color: "#2a2a2a", roughness: 0.9 });
  const door = new THREE.MeshStandardMaterial({ map: doors, roughness: 0.6, metalness: 0.25 });
  const front = new THREE.MeshStandardMaterial({
    map: shade,
    normalMap: endN,
    roughness: 0.62,
    metalness: 0.25,
  });
  return {
    materials: [side, side, roof, under, door, front],
    geometry: new THREE.BoxGeometry(BOX.W, BOX.H, BOX.L),
  };
}

export const BOX_COLOURS = [
  "#1f3a68",
  "#8e3f2a",
  "#2f5d4a",
  "#9fa4a9",
  "#d4d6d3",
  "#b7892f",
  "#5f2230",
  "#3d6f9e",
  "#c9cbc6",
  "#2d4e7a",
];

/** Seeded hash in [0, 1), so the yard and the ship look the same every visit. */
export function rand(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Many plain containers in one draw call. */
export function containerField(look: ContainerLook, items: { m: THREE.Matrix4; colour: string }[]) {
  const mesh = new THREE.InstancedMesh(look.geometry, look.materials, items.length);
  const c = new THREE.Color();
  items.forEach((item, i) => {
    mesh.setMatrixAt(i, item.m);
    mesh.setColorAt(i, c.set(item.colour));
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

/**
 * The hero box: the project. Signature orange, a real frame with corner
 * castings, our name down both sides and a proper ISO 6346 code on the doors
 * (NIVU 202609, check digit 7 — it does check out).
 */
export function heroContainer(look: ContainerLook, M: Materials) {
  const group = new THREE.Group();
  const paint = look.materials.map((mat) => {
    const m = (mat as THREE.MeshStandardMaterial).clone();
    if (m.color.getHex() === 0xffffff) m.color.set("#e2742a");
    return m;
  });
  const body = new THREE.Mesh(look.geometry, paint);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const frame = new Kit();
  const hw = BOX.W / 2;
  const hh = BOX.H / 2;
  const hl = BOX.L / 2;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      // Top and bottom side rails.
      frame.add(box(0.1, 0.16, BOX.L - 0.3), paint[0]!, at(sx * (hw - 0.03), sy * (hh - 0.08), 0));
      for (const sz of [-1, 1]) {
        frame.add(
          box(0.18, 0.12, 0.18),
          M.darkSteel,
          at(sx * (hw - 0.085), sy * (hh - 0.055), sz * (hl - 0.085)),
        );
      }
    }
    // Corner posts.
    for (const sz of [-1, 1]) {
      frame.add(box(0.12, BOX.H - 0.2, 0.12), paint[0]!, at(sx * (hw - 0.05), 0, sz * (hl - 0.05)));
    }
  }
  group.add(frame.build());

  // Name on both long sides.
  const brand = textTexture(
    [
      {
        text: "nivas.tech",
        font: "700 150px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 70,
        y: 150,
      },
      {
        text: "NIVU 202609 7",
        font: "600 44px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 1990,
        y: 58,
        align: "right",
      },
      {
        text: "22G1",
        font: "600 44px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 1990,
        y: 112,
        align: "right",
      },
    ],
    2048,
    300,
  );
  const decal = new THREE.MeshStandardMaterial({
    map: brand,
    transparent: true,
    roughness: 0.55,
    metalness: 0.1,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  });
  const decalGeo = new THREE.PlaneGeometry(BOX.L * 0.86, BOX.L * 0.86 * (300 / 2048));
  for (const sx of [-1, 1]) {
    const plane = new THREE.Mesh(decalGeo, decal);
    plane.position.set(sx * (hw + 0.012), 0.55, 0);
    plane.rotation.y = sx * HALF_PI;
    group.add(plane);
  }
  // Door markings.
  const doorText = textTexture(
    [
      {
        text: "NIVU 202609 7",
        font: "700 58px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 492,
        y: 70,
        align: "right",
      },
      {
        text: "22G1",
        font: "600 40px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 492,
        y: 124,
        align: "right",
      },
      {
        text: "MAX GROSS  30,480 KG",
        font: "500 22px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 300,
        y: 190,
      },
      {
        text: "TARE  3,750 KG",
        font: "500 22px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 300,
        y: 220,
      },
      {
        text: "NET  26,730 KG",
        font: "500 22px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 300,
        y: 250,
      },
    ],
    512,
    512,
  );
  const doorDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(BOX.W * 0.94, BOX.H * 0.94),
    new THREE.MeshStandardMaterial({
      map: doorText,
      transparent: true,
      roughness: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    }),
  );
  doorDecal.position.set(0, 0, hl + 0.012);
  group.add(doorDecal);

  // Roof code, for the view from above.
  const roofText = textTexture(
    [
      {
        text: "NIVU 202609 7",
        font: "700 96px Inter, system-ui, sans-serif",
        color: "#fbf6ef",
        x: 512,
        y: 64,
        align: "center",
      },
    ],
    1024,
    128,
  );
  const roofDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(BOX.L * 0.5, BOX.L * 0.5 * (128 / 1024)),
    new THREE.MeshStandardMaterial({
      map: roofText,
      transparent: true,
      roughness: 0.6,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    }),
  );
  roofDecal.rotation.set(-HALF_PI, 0, HALF_PI);
  roofDecal.position.y = hh + 0.012;
  group.add(roofDecal);

  group.matrixAutoUpdate = false;
  return group;
}

/* ==========================================================================
 * Spreader — shared by the reach stacker and the quay crane
 * ======================================================================== */

export type Spreader = {
  group: THREE.Group;
  set: (length: number, locked: number) => void;
};

/**
 * A telescopic spreader, origin on the plane of its twistlocks, length along
 * z. The headblocks slide out to the box length; the lamps on them go from
 * amber to green when all four twistlocks have turned.
 */
function buildSpreader(M: Materials, lampOn: THREE.Material): Spreader {
  const group = new THREE.Group();
  const main = new Kit()
    .add(box(0.85, 0.5, 6.0), M.graphite, at(0, 0.62, 0))
    .add(box(0.95, 0.06, 6.1), M.darkSteel, at(0, 0.9, 0))
    .add(box(0.6, 0.35, 1.6), M.darkSteel, at(0, 1.05, 0))
    .build();
  group.add(main);

  const ends: { beam: THREE.Group; head: THREE.Group; lamps: THREE.Mesh[] }[] = [];
  for (const s of [-1, 1]) {
    const beam = new Kit().add(box(0.5, 0.36, 3.2), M.graphite, at(0, 0.62, s * -1.6)).build();
    const headKit = new Kit()
      .add(box(BOX.W, 0.5, 0.4), M.graphite, at(0, 0.38, 0))
      .add(box(BOX.W - 0.1, 0.36, 0.02), M.hazard, at(0, 0.38, s * 0.205));
    for (const x of [-1.02, 1.02]) {
      headKit.add(cyl(0.06, 0.08, 0.14, 8), M.chrome, at(x, 0.05, 0));
      headKit.add(box(0.28, 0.12, 0.28), M.darkSteel, at(x, 0.12, 0));
    }
    const head = headKit.build();
    const lamps: THREE.Mesh[] = [];
    for (const x of [-0.9, 0.9]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.14), M.amber);
      lamp.position.set(x, 0.7, 0);
      head.add(lamp);
      lamps.push(lamp);
    }
    group.add(beam, head);
    ends.push({ beam, head, lamps });
  }

  return {
    group,
    set(length, locked) {
      const half = length / 2;
      ends.forEach(({ beam, head, lamps }, i) => {
        const s = i === 0 ? -1 : 1;
        head.position.z = s * (half - 0.2);
        beam.position.z = s * Math.max(1.6, half - 0.2);
        const mat = locked > 0.5 ? lampOn : M.amber;
        lamps.forEach((l) => (l.material = mat));
      });
    },
  };
}

/* ==========================================================================
 * Reach stacker
 * ======================================================================== */

export type Stacker = {
  root: THREE.Group;
  update: (s: State["stacker"]) => void;
  boxMatrix: (out: THREE.Matrix4) => THREE.Matrix4;
};

export function buildStacker(M: Materials, lampOn: THREE.Material): Stacker {
  const root = new THREE.Group();

  /* Chassis, counterweight, cab. Local +x is forward; origin is mid-wheelbase. */
  const k = new Kit();
  k.add(rbox(7.2, 1.1, 2.1, 0.1), M.white, at(-0.3, 1.35, 0));
  k.add(box(0.8, 0.6, 3.3), M.darkSteel, at(3.0, 0.82, 0));
  k.add(box(0.55, 0.42, 2.7), M.darkSteel, at(-3.0, 0.74, 0));
  const arch = M.white.clone();
  arch.side = THREE.DoubleSide;
  for (const s of [-1, 1]) {
    // Front fenders arched over the duals, and headlamps on stalks.
    k.add(
      new THREE.CylinderGeometry(1.0, 1.0, 1.42, 28, 1, true, HALF_PI * 0.55, Math.PI * 0.72),
      arch,
      at(3.0, 0.8, s * 1.66, HALF_PI),
    );
    k.add(box(0.1, 0.1, 0.5), M.darkSteel, at(3.9, 1.72, s * 1.05));
    k.add(rbox(0.14, 0.2, 0.3, 0.04), M.headlamp, at(3.96, 1.72, s * 1.3));
    // Rear fenders.
    k.add(rbox(1.7, 0.12, 0.8, 0.04), M.graphite, at(-3.0, 1.58, s * 1.52));
    // Tail lamps.
    k.add(box(0.05, 0.16, 0.26), M.taillamp, at(-5.13, 1.25, s * 1.45));
    // Walkway along the side.
    k.add(box(3.2, 0.05, 0.4), M.darkSteel, at(-1.3, 1.95, s * 1.15));
  }
  // Counterweight, with warning stripes across its back.
  k.add(rbox(1.6, 2.35, 3.4, 0.26), M.graphite, at(-4.3, 1.78, 0));
  k.add(box(0.02, 0.36, 3.0), M.hazard, at(-5.11, 2.45, 0));
  k.add(box(0.02, 0.2, 2.6), M.hazard, at(-5.11, 0.95, 0));
  // Engine hood, louvres, exhaust.
  k.add(rbox(2.3, 1.05, 2.2, 0.16), M.white, at(-2.3, 2.38, 0));
  for (const s of [-1, 1]) k.add(box(1.3, 0.45, 0.02), M.plastic, at(-2.4, 2.4, s * 1.11));
  k.add(cyl(0.075, 0.075, 1.1, 12), M.darkSteel, at(-1.8, 3.35, 0.82));
  k.add(cyl(0.09, 0.09, 0.08, 12), M.darkSteel, at(-1.8, 3.92, 0.82));
  // Boom tower and pivot pin.
  for (const s of [-1, 1]) k.add(rbox(1.2, 2.8, 0.16, 0.05), M.graphite, at(-3.8, 3.0, s * 0.62));
  k.add(cyl(0.17, 0.17, 1.55, 16), M.steel, at(STACKER.pivotX, STACKER.pivotY, 0, HALF_PI));
  // Cylinder anchors at the front.
  for (const s of [-1, 1]) k.add(box(0.5, 0.35, 0.3), M.graphite, at(2.0, 1.85, s * 0.72));
  // The cab: glass box on a white base, pillars, roof, beacon.
  k.add(rbox(1.9, 0.45, 1.75, 0.06), M.white, at(-0.55, 2.13, 0));
  k.add(rbox(1.7, 1.42, 1.58, 0.08), M.glass, at(-0.55, 3.05, 0));
  for (const [x, z] of [
    [0.28, 0.76],
    [0.28, -0.76],
    [-1.38, 0.76],
    [-1.38, -0.76],
  ] as const) {
    k.add(box(0.07, 1.42, 0.07), M.graphite, at(x, 3.05, z));
  }
  k.add(rbox(2.0, 0.1, 1.8, 0.04), M.white, at(-0.5, 3.8, 0));
  k.add(box(0.28, 0.05, 1.5), M.graphite, at(0.42, 3.72, 0, 0, 0, -0.25));
  for (const s of [-1, 1]) {
    k.add(cyl(0.02, 0.02, 0.45, 6), M.darkSteel, at(0.3, 3.4, s * 1.0, HALF_PI));
    k.add(rbox(0.08, 0.34, 0.18, 0.03), M.black, at(0.3, 3.3, s * 1.2));
  }
  k.add(cyl(0.08, 0.1, 0.15, 12), M.amber, at(-1.2, 3.93, -0.6));
  // Steps up to the cab.
  for (const y of [0.75, 1.15, 1.55]) k.add(box(0.5, 0.04, 0.28), M.darkSteel, at(0.1, y, 1.2));
  root.add(k.build());

  /* Wheels. Duals up front on the drive axle, singles on the steer axle. */
  const front = wheelGroup(M, { r: 0.8, w: 0.56, rim: M.yellow });
  const rear = wheelGroup(M, { r: 0.72, w: 0.55, rim: M.yellow });
  const wheels: { hub: THREE.Group; r: number }[] = [];
  for (const z of [-1.98, -1.38, 1.38, 1.98]) {
    wheels.push({ hub: mountWheel(root, front, 3.0, 0.8, z), r: 0.8 });
  }
  for (const z of [-1.5, 1.5]) wheels.push({ hub: mountWheel(root, rear, -3.0, 0.72, z), r: 0.72 });

  /* Boom: an outer box on the pivot, an inner box that slides out of it. */
  const pivot = new THREE.Group();
  pivot.position.set(STACKER.pivotX, STACKER.pivotY, 0);
  root.add(pivot);
  const outer = new Kit()
    .add(box(9.4, 0.92, 0.82), M.graphite, at(4.1, 0, 0))
    .add(box(9.0, 0.05, 0.6), M.darkSteel, at(4.3, 0.47, 0))
    .add(box(0.6, 0.4, 1.3), M.graphite, at(6.2, -0.4, 0))
    .add(cyl(0.12, 0.12, 1.4, 12), M.steel, at(6.2, -0.45, 0, HALF_PI))
    .add(box(0.3, 1.0, 0.9), M.darkSteel, at(8.7, 0, 0));
  // Brand on the boom, like a manufacturer's name.
  const boomLabel = textTexture(
    [
      {
        text: "nivas · NS-45",
        font: "600 110px Inter, system-ui, sans-serif",
        color: "#e7e6e1",
        x: 20,
        y: 80,
      },
    ],
    1024,
    160,
  );
  const labelMat = new THREE.MeshStandardMaterial({
    map: boomLabel,
    transparent: true,
    roughness: 0.5,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  });
  const outerGroup = outer.build();
  for (const s of [-1, 1]) {
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.56), labelMat);
    label.position.set(4.6, 0.02, s * 0.415);
    if (s < 0) label.rotation.y = Math.PI;
    outerGroup.add(label);
  }
  pivot.add(outerGroup);

  const inner = new THREE.Group();
  inner.add(
    new Kit()
      .add(box(7.4, 0.72, 0.64), M.graphite, at(-3.4, 0, 0))
      .add(cyl(0.22, 0.22, 0.9, 16), M.darkSteel, at(0, 0, 0, HALF_PI))
      .build(),
  );
  pivot.add(inner);

  /* Head: stays level under the tip, carries the spreader. */
  const head = new THREE.Group();
  inner.add(head);
  head.add(
    new Kit()
      .add(box(0.55, 0.9, 0.7), M.graphite, at(0, -0.45, 0))
      .add(cyl(0.42, 0.42, 0.28, 20), M.darkSteel, at(0, -0.98, 0))
      .build(),
  );
  const spreader = buildSpreader(M, lampOn);
  spreader.group.position.y = -STACKER.drop;
  head.add(spreader.group);

  /* Lift cylinders: barrel from the frame, chrome rod up to the boom. */
  const unit = new THREE.CylinderGeometry(1, 1, 1, 16);
  const cylinders = [-1, 1].map((s) => {
    const barrel = new THREE.Mesh(unit, M.graphite);
    const rodMesh = new THREE.Mesh(unit, M.chrome);
    barrel.castShadow = rodMesh.castShadow = true;
    root.add(barrel, rodMesh);
    return { s, barrel, rod: rodMesh };
  });
  const base = new THREE.Vector3();
  const top = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const place = (mesh: THREE.Mesh, a: THREE.Vector3, len: number, r: number) => {
    mesh.position.copy(a).addScaledVector(dir, len / 2);
    mesh.quaternion.setFromUnitVectors(UP, dir);
    mesh.scale.set(r, len, r);
  };

  const hang = new THREE.Matrix4().makeTranslation(0, -STACKER.drop - BOX.H / 2, 0);

  return {
    root,
    update(s) {
      root.position.set(s.x, 0, s.z);
      root.rotation.y = s.yaw;
      const dx = s.tipX - STACKER.pivotX;
      const dy = s.tipY - STACKER.pivotY;
      const theta = Math.atan2(dy, dx);
      const len = Math.hypot(dx, dy);
      pivot.rotation.z = theta;
      inner.position.x = len;
      head.rotation.z = -theta;
      spreader.set(s.spread, s.locked);
      wheels.forEach(({ hub, r }) => (hub.rotation.z = -s.roll / r));

      const c = Math.cos(theta);
      const sn = Math.sin(theta);
      for (const cy of cylinders) {
        base.set(2.0, 1.95, cy.s * 0.72);
        top.set(
          STACKER.pivotX + 6.2 * c + 0.45 * sn,
          STACKER.pivotY + 6.2 * sn - 0.45 * c,
          cy.s * 0.6,
        );
        dir.copy(top).sub(base);
        const dist = dir.length();
        dir.normalize();
        place(cy.barrel, base, Math.min(2.9, dist - 0.3), 0.17);
        const rodStart = base.clone().addScaledVector(dir, 0.5);
        place(cy.rod, rodStart, dist - 0.5, 0.09);
      }
    },
    boxMatrix(out) {
      head.updateWorldMatrix(true, false);
      return out.copy(head.matrixWorld).multiply(hang);
    },
  };
}

/* ==========================================================================
 * Tractor and skeletal trailer
 * ======================================================================== */

export type Truck = {
  tractor: THREE.Group;
  trailer: THREE.Group;
  update: (s: number) => void;
  boxMatrix: (out: THREE.Matrix4) => THREE.Matrix4;
  /** World position of the rig's middle, for the camera. */
  centre: THREE.Vector3;
};

const KINGPIN = 3.2;
const TRAILER_AXLE = 9.5;
const BOX_ON_TRAILER = 5.1;

export function buildTruck(M: Materials): Truck {
  /* Tractor: cab-over, 4x2. Origin at the front axle, +x forward. */
  const tractor = new THREE.Group();
  const t = new Kit();
  for (const z of [-0.45, 0.45]) t.add(box(5.7, 0.28, 0.1), M.darkSteel, at(-1.65, 1.0, z));
  t.add(rbox(2.35, 2.75, 2.48, 0.16), M.black, at(0.27, 2.45, 0));
  t.add(rbox(1.9, 0.44, 2.36, 0.16), M.black, at(0.0, 3.93, 0, 0, 0, 0.1));
  t.add(box(0.04, 0.98, 2.2), M.glass, at(1.46, 2.86, 0, 0, 0, 0.1));
  for (const s of [-1, 1]) {
    t.add(box(1.05, 0.95, 0.02), M.glass, at(0.82, 2.84, s * 1.245));
    t.add(box(1.6, 0.5, 0.03), M.plastic, at(0.25, 1.35, s * 1.24));
    t.add(box(0.012, 1.95, 0.012), M.plastic, at(0.3, 2.2, s * 1.246));
    t.add(box(0.2, 0.04, 0.02), M.chrome, at(0.45, 2.2, s * 1.25));
    // Mirror arm and housing.
    t.add(cyl(0.022, 0.022, 0.4, 6), M.darkSteel, at(1.25, 3.0, s * 1.38, HALF_PI));
    t.add(rbox(0.12, 0.52, 0.24, 0.05), M.black, at(1.22, 2.78, s * 1.56));
    // Steps.
    t.add(box(0.62, 0.05, 0.3), M.darkSteel, at(0.3, 0.55, s * 1.1));
    t.add(box(0.62, 0.05, 0.3), M.darkSteel, at(0.3, 0.88, s * 1.1));
    // Headlamps and indicators.
    t.add(box(0.05, 0.15, 0.42), M.headlamp, at(1.56, 1.12, s * 0.93));
    t.add(box(0.05, 0.08, 0.14), M.amber, at(1.56, 1.12, s * 1.2));
    // Front wheel arch.
    t.add(
      new THREE.CylinderGeometry(0.64, 0.64, 0.4, 20, 1, true, HALF_PI, Math.PI),
      M.plasticDouble,
      at(0, 0.53, s * 1.05, HALF_PI),
    );
    // Rear mudguard and flap.
    t.add(box(1.0, 0.04, 0.72), M.plastic, at(-3.7, 1.24, s * 0.88));
    t.add(box(0.02, 0.5, 0.62), M.rubber, at(-4.25, 0.72, s * 0.88));
    // Tail lamps.
    t.add(box(0.05, 0.12, 0.3), M.taillamp, at(-4.52, 0.95, s * 0.85));
  }
  // Grille, bumper, visor.
  t.add(box(0.05, 0.78, 1.9), M.plastic, at(1.455, 1.78, 0));
  for (let i = 0; i < 5; i++)
    t.add(box(0.06, 0.035, 1.8), M.chrome, at(1.475, 1.47 + i * 0.155, 0));
  t.add(rbox(0.32, 0.46, 2.5, 0.07), M.graphite, at(1.4, 0.95, 0));
  t.add(box(0.26, 0.07, 2.32), M.black, at(1.56, 3.39, 0));
  // Fuel tank, battery box, fifth wheel.
  t.add(cyl(0.34, 0.34, 1.5, 24), M.alloy, at(-1.7, 0.78, 1.02, 0, 0, HALF_PI));
  t.add(box(0.9, 0.55, 0.5), M.darkSteel, at(-1.7, 0.8, -1.0));
  t.add(cyl(0.5, 0.5, 0.1, 24), M.darkSteel, at(-KINGPIN, 1.22, 0));
  tractor.add(t.build());

  const tractorWheel = wheelGroup(M, { r: 0.525, w: 0.3, rim: M.alloy });
  const tractorWheels = [
    mountWheel(tractor, tractorWheel, 0, 0.525, 1.05),
    mountWheel(tractor, tractorWheel, 0, 0.525, -1.05),
    mountWheel(tractor, tractorWheel, -3.7, 0.525, 1.05),
    mountWheel(tractor, tractorWheel, -3.7, 0.525, -1.05),
    mountWheel(tractor, tractorWheel, -3.7, 0.525, 0.73),
    mountWheel(tractor, tractorWheel, -3.7, 0.525, -0.73),
  ];

  /* Trailer: origin at the kingpin. */
  const trailer = new THREE.Group();
  const r = new Kit();
  r.add(box(3.0, 0.2, 2.1), M.darkSteel, at(-0.3, 1.33, 0));
  for (const z of [-0.5, 0.5]) r.add(box(12.3, 0.4, 0.14), M.darkSteel, at(-5.0, 1.2, z));
  for (const x of [1.0, -2.4, -5.1, -7.4, -11.05])
    r.add(box(0.18, 0.18, 2.44), M.darkSteel, at(x, 1.33, 0));
  for (const x of [0.9, -11.0]) {
    for (const z of [-1.02, 1.02]) r.add(cyl(0.07, 0.09, 0.12, 10), M.chrome, at(x, 1.46, z));
  }
  for (const s of [-1, 1]) {
    r.add(box(0.14, 0.95, 0.14), M.darkSteel, at(-2.2, 0.72, s * 0.95));
    r.add(box(0.36, 0.05, 0.36), M.darkSteel, at(-2.2, 0.22, s * 0.95));
    r.add(box(4.6, 0.1, 0.05), M.steel, at(-4.8, 0.62, s * 1.2));
    r.add(box(4.2, 0.04, 0.55), M.plastic, at(-9.5, 1.12, s * 1.05));
    r.add(box(0.05, 0.12, 0.36), M.taillamp, at(-11.24, 0.75, s * 0.95));
  }
  for (const x of [-8.2, -9.5, -10.8]) r.add(box(0.14, 0.14, 2.3), M.darkSteel, at(x, 0.54, 0));
  r.add(box(0.14, 0.2, 2.45), M.darkSteel, at(-11.16, 0.75, 0));
  r.add(box(0.9, 0.45, 0.45), M.darkSteel, at(-6.8, 0.95, 0.95));
  trailer.add(r.build());

  const trailerWheel = wheelGroup(M, { r: 0.535, w: 0.38, rim: M.alloy });
  const trailerWheels: THREE.Group[] = [];
  for (const x of [-8.2, -9.5, -10.8]) {
    for (const z of [-1.02, 1.02])
      trailerWheels.push(mountWheel(trailer, trailerWheel, x, 0.535, z));
  }

  const onTrailer = new THREE.Matrix4()
    .makeTranslation(-BOX_ON_TRAILER, DECK_Y + BOX.H / 2, 0)
    .multiply(new THREE.Matrix4().makeRotationY(-HALF_PI));
  const centre = new THREE.Vector3();

  return {
    tractor,
    trailer,
    centre,
    update(s) {
      const f = roadAt(s);
      const back = roadAt(s - 3.7);
      let ux = f.x - back.x;
      let uz = f.z - back.z;
      const ul = Math.hypot(ux, uz) || 1;
      ux /= ul;
      uz /= ul;
      tractor.position.set(f.x, 0, f.z);
      tractor.rotation.y = yawOf(ux, uz);
      const kx = f.x - ux * KINGPIN;
      const kz = f.z - uz * KINGPIN;
      const axle = roadAt(s - KINGPIN - TRAILER_AXLE);
      trailer.position.set(kx, 0, kz);
      trailer.rotation.y = yawOf(kx - axle.x, kz - axle.z);
      tractorWheels.forEach((w) => (w.rotation.z = -s / 0.525));
      trailerWheels.forEach((w) => (w.rotation.z = -s / 0.535));
      centre.set((kx + axle.x) / 2, 2, (kz + axle.z) / 2);
    },
    boxMatrix(out) {
      trailer.updateWorldMatrix(true, false);
      return out.copy(trailer.matrixWorld).multiply(onTrailer);
    },
  };
}

/* ==========================================================================
 * Ship-to-shore quay crane
 * ======================================================================== */

export type Crane = {
  root: THREE.Group;
  update: (c: State["crane"]) => void;
  boxMatrix: (out: THREE.Matrix4) => THREE.Matrix4;
};

const CRANE_TOP = 44;
const RAIL = 14;
const LEG_Z = 9;

/**
 * Local +x points out over the water, z runs along the quay. Four legs on
 * rail bogies, a portal, a boom from backreach to outreach, an A-frame with
 * forestays, and a trolley that runs the boom with the spreader on ropes.
 */
export function buildCrane(M: Materials, lampOn: THREE.Material): Crane {
  const root = new THREE.Group();
  const k = new Kit();
  for (const x of [-RAIL, RAIL]) {
    for (const z of [-LEG_Z, LEG_Z]) {
      k.add(box(1.3, CRANE_TOP - 2, 1.3), M.white, at(x, (CRANE_TOP - 2) / 2 + 1.4, z));
      k.add(box(2.1, 1.3, 5.6), M.graphite, at(x, 0.85, z));
      for (const dz of [-1.9, -0.65, 0.65, 1.9]) {
        k.add(cyl(0.42, 0.42, 0.45, 16), M.darkSteel, at(x, 0.42, z + dz, 0, 0, HALF_PI));
      }
    }
    // Portal ties along the quay, low and high, with X-bracing between.
    k.add(box(1.2, 1.4, LEG_Z * 2), M.white, at(x, 12, 0));
    k.add(box(1.5, 2.2, LEG_Z * 2 + 1.4), M.white, at(x, CRANE_TOP - 0.2, 0));
    strut(k, V(x, 13, -LEG_Z), V(x, CRANE_TOP - 1.5, LEG_Z), 0.5, 0.5, M.white);
    strut(k, V(x, 13, LEG_Z), V(x, CRANE_TOP - 1.5, -LEG_Z), 0.5, 0.5, M.white);
  }
  // Sill beams across the portal.
  for (const z of [-LEG_Z, LEG_Z]) k.add(box(RAIL * 2, 1.8, 1.2), M.white, at(0, 12.5, z));
  // Boom girders, backreach to outreach, with cross ties and trolley rails.
  for (const z of [-4, 4]) {
    k.add(box(94, 2.4, 1.1), M.white, at(15, CRANE_TOP + 0.9, z));
    k.add(box(94, 0.22, 0.3), M.steel, at(15, CRANE_TOP + 2.2, z * 0.82));
  }
  for (let x = -30; x <= 60; x += 6)
    k.add(box(0.35, 0.35, 8.8), M.white, at(x, CRANE_TOP + 2.0, 0));
  for (const x of [-RAIL, RAIL]) k.add(box(1.4, 1.6, 10), M.white, at(x, CRANE_TOP + 0.8, 0));
  // A-frame and stays.
  const apex = V(10, 72, 0);
  for (const z of [-4, 4]) {
    const a = V(10, 72, z * 0.6);
    strut(k, V(RAIL, CRANE_TOP + 1, z * 2.2), a, 1.1, 1.1, M.white);
    strut(k, V(-RAIL + 2, CRANE_TOP + 1, z * 2.2), a, 0.9, 0.9, M.white);
    rod(k, a, V(56, CRANE_TOP + 2.4, z), 0.22, M.steel);
    rod(k, a, V(34, CRANE_TOP + 2.4, z), 0.2, M.steel);
    rod(k, a, V(-30, CRANE_TOP + 2.4, z), 0.22, M.steel);
  }
  k.add(box(1.4, 1.4, 5.8), M.white, at(apex.x, apex.y, 0));
  k.add(cyl(0.18, 0.18, 0.35, 10), M.beacon, at(apex.x, apex.y + 0.9, 0));
  // Machinery house on the backreach, and an electrical room on the land leg.
  k.add(box(12, 5.4, 9.6), M.white, at(-24, CRANE_TOP + 4.8, 0));
  k.add(box(12.1, 0.3, 9.7), M.graphite, at(-24, CRANE_TOP + 7.6, 0));
  for (let i = 0; i < 5; i++)
    k.add(box(1.1, 0.9, 0.02), M.darkSteel, at(-29 + i * 2.4, CRANE_TOP + 5.2, 4.81));
  k.add(box(4, 3.2, 3.2), M.white, at(-RAIL, 16.2, LEG_Z + 2.4));
  root.add(k.build());

  /* Trolley, with the driver's cab slung under it. */
  const trolley = new THREE.Group();
  trolley.add(
    new Kit()
      .add(box(5.6, 2.2, 9.4), M.graphite, at(0, CRANE_TOP + 3.3, 0))
      .add(box(5.7, 0.2, 9.5), M.darkSteel, at(0, CRANE_TOP + 4.45, 0))
      .add(rbox(2.3, 2.4, 2.3, 0.1), M.glass, at(2.8, CRANE_TOP - 1.3, 0))
      .add(box(2.4, 0.15, 2.4), M.white, at(2.8, CRANE_TOP - 0.05, 0))
      .add(box(0.3, 1.6, 0.3), M.graphite, at(2.8, CRANE_TOP + 0.9, 0))
      .build(),
  );
  root.add(trolley);

  const spreader = buildSpreader(M, lampOn);
  const headblock = new Kit().add(box(2.0, 0.7, 3.6), M.graphite, at(0, 1.55, 0)).build();
  spreader.group.add(headblock);
  spreader.set(BOX.L, 0);
  root.add(spreader.group);

  const unit = new THREE.CylinderGeometry(0.04, 0.04, 1, 6);
  const ropes = [
    [-1.1, -2.4],
    [1.1, -2.4],
    [-1.1, 2.4],
    [1.1, 2.4],
  ].map(([x, z]) => {
    const mesh = new THREE.Mesh(unit, M.cable);
    root.add(mesh);
    return { mesh, x: x!, z: z! };
  });

  const carry = new THREE.Matrix4()
    .makeTranslation(0, -BOX.H / 2, 0)
    .multiply(new THREE.Matrix4().makeRotationY(Math.PI));

  return {
    root,
    update(c) {
      trolley.position.x = c.trolley;
      spreader.group.position.set(c.trolley, c.hoist, 0);
      spreader.set(BOX.L, c.locked);
      const topY = CRANE_TOP + 2.2;
      const lowY = c.hoist + 1.9;
      ropes.forEach(({ mesh, x, z }) => {
        mesh.position.set(c.trolley + x, (topY + lowY) / 2, z * 0.4);
        mesh.scale.y = Math.max(0.01, topY - lowY);
      });
    },
    boxMatrix(out) {
      spreader.group.updateWorldMatrix(true, false);
      return out.copy(spreader.group.matrixWorld).multiply(carry);
    },
  };
}

/* ==========================================================================
 * Feeder container ship
 * ======================================================================== */

export type Ship = {
  root: THREE.Group;
  update: (s: State["ship"], time: number) => void;
  boxMatrix: (out: THREE.Matrix4) => THREE.Matrix4;
};

const HULL_DECK = 6;

/** Half-breadth of the hull at station z (bow +90, stern -90), at deck and at the waterline. */
function halfBreadth(z: number) {
  const b = SHIP.beam / 2;
  if (z > 36) {
    const t = Math.min(1, (z - 36) / 54);
    return { deck: b * (1 - Math.pow(t, 2.5)), water: b * (1 - Math.pow(t, 1.7)) };
  }
  if (z < -56) {
    const t = Math.min(1, (-56 - z) / 34);
    return { deck: b * (1 - 0.2 * t * t), water: b * (1 - 0.42 * Math.pow(t, 1.4)) };
  }
  return { deck: b, water: b };
}

/** The hull as a loft of U-shaped sections, coloured by height: antifouling, boot-top, topsides. */
function hullGeometry() {
  const stations = 72;
  const section = (z: number) => {
    const { deck, water } = halfBreadth(z);
    const half: [number, number][] = [
      [deck, HULL_DECK],
      [(deck + water) / 2, 3],
      [water, 0.95],
      [water, 0.9],
      [water, 0.05],
      [water, 0],
      [water * 0.99, -2.5],
      [water * 0.92, -5.5],
      [water * 0.72, -8],
      [water * 0.38, -8.9],
    ];
    const pts: [number, number][] = [];
    for (let i = 0; i < half.length; i++) pts.push([-half[i]![0], half[i]![1]]);
    pts.push([0, -9]);
    for (let i = half.length - 1; i >= 0; i--) pts.push([half[i]![0], half[i]![1]]);
    return pts;
  };
  const positions: number[] = [];
  const colours: number[] = [];
  const index: number[] = [];
  const top = new THREE.Color("#1d2b44");
  const boot = new THREE.Color("#e9e9e4");
  const red = new THREE.Color("#7c2922");
  let ring = 0;
  for (let i = 0; i <= stations; i++) {
    const z = -90 + (180 * i) / stations;
    const pts = section(z);
    ring = pts.length;
    for (const [x, y] of pts) {
      positions.push(x, y, z);
      const c = y > 0.92 ? top : y > 0.02 ? boot : red;
      colours.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < stations; i++) {
    for (let j = 0; j < ring - 1; j++) {
      const a = i * ring + j;
      const b = (i + 1) * ring + j;
      const c = b + 1;
      const d = a + 1;
      index.push(a, c, b, a, d, c);
    }
  }
  // Transom: close the stern section with a fan.
  const centre = positions.length / 3;
  positions.push(0, 0, -90);
  colours.push(top.r, top.g, top.b);
  for (let j = 0; j < ring - 1; j++) index.push(centre, j + 1, j);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function deckShape(fromZ = -90, toZ = 90) {
  const shape = new THREE.Shape();
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const z = fromZ + ((toZ - fromZ) * i) / steps;
    const b = halfBreadth(z).deck;
    if (i === 0) shape.moveTo(b, -z);
    else shape.lineTo(b, -z);
  }
  for (let i = steps; i >= 0; i--) {
    const z = fromZ + ((toZ - fromZ) * i) / steps;
    shape.lineTo(-halfBreadth(z).deck, -z);
  }
  return shape;
}

export function buildShip(M: Materials, look: ContainerLook): Ship {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const hull = new THREE.Mesh(
    hullGeometry(),
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.1,
      clearcoat: 0.2,
    }),
  );
  hull.castShadow = true;
  hull.receiveShadow = true;
  body.add(hull);

  const k = new Kit();
  // Main deck and the raised forecastle.
  k.add(new THREE.ShapeGeometry(deckShape()), M.deckGreen, at(0, HULL_DECK, 0, -HALF_PI));
  k.add(
    new THREE.ExtrudeGeometry(deckShape(74, 90), { depth: 2.6, bevelEnabled: false }),
    M.navy,
    at(0, HULL_DECK, 0, -HALF_PI),
  );
  k.add(
    new THREE.ShapeGeometry(deckShape(74.2, 89.6)),
    M.deckGreen,
    at(0, HULL_DECK + 2.62, 0, -HALF_PI),
  );
  // Breakwater.
  for (const s of [-1, 1]) {
    strut(k, V(0, HULL_DECK + 1.7, 73.5), V(s * 13, HULL_DECK + 1.7, 68), 0.25, 3.4, M.white);
  }
  // Hatch covers and lashing bridges.
  for (let b = 0; b < 10; b++) {
    const z = bayZ(b);
    k.add(
      box(25.4, SHIP.hatchTop - HULL_DECK, 12.9),
      M.hatch,
      at(0, (SHIP.hatchTop + HULL_DECK) / 2, z),
    );
    k.add(box(25.5, 0.05, 0.1), M.darkSteel, at(0, SHIP.hatchTop + 0.02, z));
    if (b < 9) {
      k.add(box(26, 2.4, 0.8), M.steel, at(0, SHIP.hatchTop + 1.2, z + 6.9));
      k.add(box(26, 0.08, 1.4), M.darkSteel, at(0, SHIP.hatchTop + 2.45, z + 6.9));
    }
  }
  // Accommodation block and bridge at the stern.
  const windows = windowsTexture();
  windows.repeat.set(2, 1);
  const house = new THREE.MeshStandardMaterial({ map: windows, roughness: 0.5, metalness: 0.05 });
  k.add(box(20, 18, 13), house, at(0, HULL_DECK + 9, -76));
  k.add(box(20.2, 0.3, 13.2), M.white, at(0, HULL_DECK + 18.1, -76));
  k.add(box(SHIP.beam + 1, 2.8, 5.5), M.white, at(0, HULL_DECK + 19.6, -72.5));
  k.add(box(SHIP.beam + 0.6, 1.2, 0.08), M.glass, at(0, HULL_DECK + 19.8, -69.72));
  k.add(box(8, 0.25, 4), M.white, at(0, HULL_DECK + 21.1, -73));
  k.add(cyl(0.12, 0.12, 6, 8), M.white, at(0, HULL_DECK + 24, -74));
  k.add(box(3.2, 0.12, 0.35), M.darkSteel, at(0, HULL_DECK + 25.5, -74));
  // Funnel, in signature orange with a black top.
  k.add(rbox(6, 7.5, 5, 0.6), M.signature, at(0, HULL_DECK + 22, -84));
  k.add(rbox(6.05, 1.2, 5.05, 0.6), M.black, at(0, HULL_DECK + 26.2, -84));
  // Mooring gear on the forecastle, and the foremast.
  for (const s of [-1, 1]) {
    k.add(cyl(0.9, 0.9, 1.4, 16), M.darkSteel, at(s * 4, HULL_DECK + 3.3, 82, 0, 0, HALF_PI));
    k.add(cyl(0.35, 0.35, 0.8, 10), M.darkSteel, at(s * 7, HULL_DECK + 3.0, 79));
  }
  k.add(cyl(0.18, 0.18, 9, 8), M.white, at(0, HULL_DECK + 7, 84));
  body.add(k.build());

  /* Deck cargo: a full ship, minus one slot for our box. */
  const items: { m: THREE.Matrix4; colour: string }[] = [];
  const turn = new THREE.Matrix4().makeRotationY(Math.PI);
  for (let b = 0; b < 10; b++) {
    for (let row = 0; row < 10; row++) {
      const edge = b === 0 || b === 9 ? 1 : 0;
      let tiers = 3 + Math.floor(rand(b * 31 + row * 7) * 3) - edge;
      if (b === SHIP.bay && row === SHIP.row) tiers = SHIP.tier;
      for (let tier = 0; tier < tiers; tier++) {
        const y = SHIP.hatchTop + tier * BOX.H + BOX.H / 2;
        const m = new THREE.Matrix4().makeTranslation(rowX(row), y, bayZ(b)).multiply(turn);
        const pick = Math.floor(rand(b * 101 + row * 13 + tier * 5) * BOX_COLOURS.length);
        items.push({ m, colour: BOX_COLOURS[pick]! });
      }
    }
  }
  body.add(containerField(look, items));

  const slot = new THREE.Matrix4()
    .makeTranslation(rowX(SHIP.row), SHIP.hatchTop + SHIP.tier * BOX.H + BOX.H / 2, bayZ(SHIP.bay))
    .multiply(turn);

  return {
    root,
    update(s, time) {
      root.position.set(s.x, -1.5, s.z);
      // At sea she rolls and pitches a little; alongside she is still.
      const sea = s.wake;
      body.rotation.z = Math.sin(time * 0.55) * 0.006 * sea;
      body.rotation.x = Math.sin(time * 0.37 + 1) * 0.003 * sea;
    },
    boxMatrix(out) {
      body.updateWorldMatrix(true, false);
      return out.copy(body.matrixWorld).multiply(slot);
    },
  };
}

/* ==========================================================================
 * Four-engined freighter
 * ======================================================================== */

export type Plane = { root: THREE.Group };

/** A tapered, swept surface from a planform, thickness along y. */
function surface(
  planform: [number, number][],
  thickness: number,
  taperSpan: number,
  material: THREE.Material,
  kit: Kit,
  m: THREE.Matrix4,
) {
  const shape = new THREE.Shape(planform.map(([x, z]) => new THREE.Vector2(x, z)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: Math.min(0.3, thickness * 0.4),
    bevelSegments: 2,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.rotateX(HALF_PI);
  // Thin toward the tip.
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const span = Math.abs(pos.getZ(i));
    pos.setY(i, pos.getY(i) * (1 - 0.62 * Math.min(1, span / taperSpan)));
  }
  geo.computeVertexNormals();
  kit.add(geo, material, m);
}

export function buildPlane(M: Materials): Plane {
  const root = new THREE.Group();
  const k = new Kit();

  // Fuselage: a lathe from tail to nose, then the aft body swept up.
  const R = 3.25;
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = -35.6 + (70.6 * i) / 60;
    let r = R;
    if (x > 27) r = R * Math.sqrt(Math.max(0, 1 - Math.pow((x - 27) / 8, 2)));
    if (x < -17) r = R * (0.12 + 0.88 * Math.pow((x + 35.6) / 18.6, 0.8));
    profile.push(new THREE.Vector2(Math.max(0.001, r), x));
  }
  const fuselage = new THREE.LatheGeometry(profile, 40);
  fuselage.rotateZ(-HALF_PI);
  const pos = fuselage.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    if (x < -17) pos.setY(i, pos.getY(i) + Math.pow((-17 - x) / 18.6, 1.6) * 2.2);
  }
  fuselage.computeVertexNormals();
  k.add(fuselage, M.fuselage);
  // Cockpit glazing, a dark band over the nose.
  k.add(
    new THREE.SphereGeometry(1, 24, 12),
    M.glass,
    at(30.6, 2.66, 0, 0, 0, -0.35, 1.5, 0.38, 1.35),
  );
  // Wings: low, swept 37.5°, with dihedral.
  for (const s of [-1, 1]) {
    surface(
      [
        [6, s * 2.8],
        [-16.4, s * 32.2],
        [-20.4, s * 32.2],
        [-8.5, s * 2.8],
      ],
      1.1,
      32,
      M.wing,
      k,
      at(0, -1.5, 0, s * -0.1),
    );
    // Tailplane.
    surface(
      [
        [-25.5, s * 1.2],
        [-33.5, s * 11.2],
        [-35.8, s * 11.2],
        [-33.5, s * 1.2],
      ],
      0.5,
      11,
      M.wing,
      k,
      at(0, 1.8, 0, s * -0.12),
    );
    // Engines: inboard and outboard, slung on pylons ahead of the wing.
    for (const [z, x] of [
      [11.8, 0.6],
      [21.2, -6.6],
    ] as const) {
      const nacelle = [
        new THREE.Vector2(0.001, -4),
        new THREE.Vector2(0.55, -3.7),
        new THREE.Vector2(0.95, -3.0),
        new THREE.Vector2(1.25, -1.6),
        new THREE.Vector2(1.42, 0.4),
        new THREE.Vector2(1.4, 2.4),
        new THREE.Vector2(1.28, 3.35),
        new THREE.Vector2(1.12, 3.6),
      ];
      const y = -1.5 + 0.1 * z - 2.2;
      const geo = new THREE.LatheGeometry(nacelle, 28);
      geo.rotateZ(-HALF_PI);
      geo.scale(1, 1.08, 1.08);
      k.add(geo, M.belly, at(x, y, s * z));
      k.add(cyl(1.12, 1.12, 0.25, 28), M.chrome, at(x + 3.55, y, s * z, 0, 0, HALF_PI));
      k.add(cyl(1.0, 1.0, 0.1, 28), M.plastic, at(x + 3.3, y, s * z, 0, 0, HALF_PI));
      k.add(box(4.8, 1.5, 0.35), M.fuselage, at(x - 1.6, y + 1.2, s * z));
    }
  }
  // Fin, in signature orange.
  const fin = new THREE.Shape([
    new THREE.Vector2(-24, 1.2),
    new THREE.Vector2(-33, 12.4),
    new THREE.Vector2(-37.4, 12.4),
    new THREE.Vector2(-35.4, 1.2),
  ]);
  const finGeo = new THREE.ExtrudeGeometry(fin, {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 2,
  });
  finGeo.translate(0, 0, -0.35);
  k.add(finGeo, M.signature, at(0, 1.2, 0));
  // Belly fairing where the wings meet the body.
  k.add(rbox(16, 1.6, 6.2, 0.7), M.belly, at(-1.5, -2.3, 0));
  root.add(k.build());
  return { root };
}

/* ==========================================================================
 * Cloud deck
 * ======================================================================== */

export function buildClouds() {
  const alpha = cloudTexture();
  const layers = [0, 1].map((i) => {
    const map = alpha.clone();
    map.repeat.set(3 + i, 3 + i);
    const mat = new THREE.MeshStandardMaterial({
      color: i === 0 ? "#ffffff" : "#f4f6f8",
      // Density doubles as shading: thin edges read grey, thick tops white.
      map,
      alphaMap: map,
      transparent: true,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5200, 5200), mat);
    mesh.rotation.x = -HALF_PI;
    mesh.receiveShadow = true;
    mesh.renderOrder = 2 + i;
    return { mesh, mat, map };
  });
  return layers;
}

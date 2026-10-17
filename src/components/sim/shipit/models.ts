import * as THREE from "three";
import type { ItemKind } from "./balance";

/* ==========================================================================
 * SHIP IT INC. — MODELS
 *
 * Everything is built from primitives with flat shading, which is the whole
 * low-poly look: no model files to download, and every colour is a line here.
 * Materials are cached by colour so a garage full of furniture shares a dozen
 * of them.
 * ======================================================================== */

export const PALETTE = {
  floor: "#e3d5bd",
  floorLine: "#cdbb9c",
  wall: "#f4e9d6",
  wallShade: "#e6d5b8",
  trim: "#b98a5e",
  wood: "#c98f5c",
  woodDark: "#8e5b37",
  ink: "#2c2f3d",
  steel: "#9aa3b2",
  red: "#e5533c",
  redDeep: "#b93a28",
  orange: "#f39a3d",
  yellow: "#f6c64a",
  green: "#4fb36b",
  teal: "#25b2a0",
  blue: "#3f7cf0",
  purple: "#8b6cf0",
  pink: "#f06a9b",
  skin: ["#f5d2b3", "#e2b48f", "#c68d63", "#9c6542", "#7a4b30"],
  grass: "#a9c977",
  asphalt: "#8d8f95",
  sky: "#cfe8f2",
};

const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(
  color: string,
  o: { emissive?: string; ei?: number; rough?: number; metal?: number; opacity?: number } = {},
) {
  const key = `${color}|${o.emissive ?? ""}|${o.ei ?? 0}|${o.rough ?? 0.85}|${o.metal ?? 0}|${o.opacity ?? 1}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.85,
      metalness: o.metal ?? 0,
      flatShading: true,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.ei ?? 0,
      transparent: (o.opacity ?? 1) < 1,
      opacity: o.opacity ?? 1,
    });
    matCache.set(key, m);
  }
  return m;
}

export function disposeMaterials() {
  matCache.forEach((m) => m.dispose());
  matCache.clear();
}

type MeshOpts = { cast?: boolean; receive?: boolean };

function mesh(
  geo: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  o: MeshOpts = {},
) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = o.cast ?? true;
  m.receiveShadow = o.receive ?? true;
  return m;
}

export function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material | string,
  x = 0,
  y = 0,
  z = 0,
  o?: MeshOpts,
) {
  const m = mesh(
    new THREE.BoxGeometry(w, h, d),
    typeof material === "string" ? mat(material) : material,
    o,
  );
  m.position.set(x, y, z);
  return m;
}

function cyl(
  rt: number,
  rb: number,
  h: number,
  material: THREE.Material | string,
  seg = 10,
  o?: MeshOpts,
) {
  return mesh(
    new THREE.CylinderGeometry(rt, rb, h, seg),
    typeof material === "string" ? mat(material) : material,
    o,
  );
}

function ball(r: number, material: THREE.Material | string, detail = 1) {
  return mesh(
    new THREE.IcosahedronGeometry(r, detail),
    typeof material === "string" ? mat(material) : material,
  );
}

/* ---- Canvas textures ---------------------------------------------------- */

export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* ==========================================================================
 * Characters
 * ======================================================================== */

export type Rig = {
  root: THREE.Group;
  body: THREE.Group;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  /** Items you carry stack upwards from here, in root space. */
  hands: THREE.Object3D;
};

export type Look = {
  shirt: string;
  pants: string;
  skin: string;
  hair: string;
  hairStyle: 0 | 1 | 2 | 3;
  extra?: "headphones" | "glasses" | "cap" | "tie" | undefined;
};

const SHIRTS = [
  "#3f7cf0",
  "#25b2a0",
  "#f39a3d",
  "#8b6cf0",
  "#f06a9b",
  "#4fb36b",
  "#f6c64a",
  "#5a6378",
  "#ec6f5a",
];
const PANTS = ["#2c2f3d", "#3c4a6b", "#5b4636", "#4a5568", "#2f4f4f"];
const HAIR = ["#2a1f1a", "#3b2a20", "#14110f", "#6b4a2b", "#8a8f99", "#b5562c"];
const EXTRAS: Look["extra"][] = [
  undefined,
  undefined,
  "glasses",
  "tie",
  "cap",
  undefined,
  "glasses",
];

/** A client's look from their stable seed, so they never change outfit mid-walk. */
export function lookFromSeed(seed: number): Look {
  const r = (n: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  return {
    shirt: SHIRTS[r(SHIRTS.length)]!,
    pants: PANTS[r(PANTS.length)]!,
    skin: PALETTE.skin[r(PALETTE.skin.length)]!,
    hair: HAIR[r(HAIR.length)]!,
    hairStyle: r(4) as Look["hairStyle"],
    extra: EXTRAS[r(EXTRAS.length)],
  };
}

export const PLAYER_LOOK: Look = {
  shirt: PALETTE.red,
  pants: "#2c2f3d",
  skin: PALETTE.skin[1]!,
  hair: "#1d1612",
  hairStyle: 1,
  extra: "headphones",
};

export function makeCharacter(look: Look, scale = 1): Rig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const leg = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.11, 0.42, 0);
    pivot.add(box(0.15, 0.36, 0.17, look.pants, 0, -0.18, 0));
    pivot.add(box(0.17, 0.08, 0.24, PALETTE.ink, 0, -0.38, 0.03));
    body.add(pivot);
    return pivot;
  };
  const legL = leg(-1);
  const legR = leg(1);

  const torso = cyl(0.21, 0.27, 0.5, look.shirt, 8);
  torso.position.y = 0.66;
  body.add(torso);
  if (look.extra === "tie") body.add(box(0.06, 0.3, 0.03, PALETTE.red, 0, 0.7, 0.235));

  const arm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.3, 0.86, 0);
    pivot.add(box(0.11, 0.36, 0.13, look.shirt, 0, -0.16, 0));
    const hand = ball(0.07, look.skin, 0);
    hand.position.set(0, -0.37, 0);
    pivot.add(hand);
    body.add(pivot);
    return pivot;
  };
  const armL = arm(-1);
  const armR = arm(1);

  const head = new THREE.Group();
  head.position.y = 1.16;
  body.add(head);
  head.add(ball(0.29, look.skin, 1));
  const eye = (side: number) =>
    box(0.05, 0.08, 0.03, PALETTE.ink, side * 0.1, 0.0, 0.265, { cast: false });
  head.add(eye(-1), eye(1));
  const blush = (side: number) =>
    box(0.07, 0.035, 0.02, mat("#f19a8f", { opacity: 0.75 }), side * 0.17, -0.07, 0.24, {
      cast: false,
    });
  head.add(blush(-1), blush(1));

  // Hair
  const hairMat = mat(look.hair);
  if (look.hairStyle === 0 || look.hairStyle === 2) {
    const cap = mesh(
      new THREE.SphereGeometry(0.31, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.1),
      hairMat,
    );
    cap.position.y = 0.02;
    cap.rotation.x = -0.18;
    head.add(cap);
    if (look.hairStyle === 2) head.add(box(0.5, 0.42, 0.14, hairMat, 0, -0.12, -0.2));
  } else if (look.hairStyle === 1) {
    const cap = mesh(
      new THREE.SphereGeometry(0.31, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.4),
      hairMat,
    );
    cap.position.y = 0.04;
    cap.rotation.x = -0.25;
    head.add(cap);
    const tuft = box(0.22, 0.1, 0.16, hairMat, 0.05, 0.3, 0.12);
    tuft.rotation.set(0.4, 0, 0.3);
    head.add(tuft);
  } else {
    const bun = ball(0.12, hairMat, 0);
    bun.position.set(0, 0.32, -0.08);
    head.add(bun);
    const cap = mesh(
      new THREE.SphereGeometry(0.305, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.6),
      hairMat,
    );
    cap.position.y = 0.04;
    head.add(cap);
  }

  if (look.extra === "glasses") {
    const g = mat(PALETTE.ink);
    head.add(box(0.12, 0.08, 0.02, g, -0.1, 0.01, 0.28, { cast: false }));
    head.add(box(0.12, 0.08, 0.02, g, 0.1, 0.01, 0.28, { cast: false }));
    head.add(box(0.08, 0.02, 0.02, g, 0, 0.03, 0.285, { cast: false }));
  }
  if (look.extra === "cap") {
    const c = mesh(
      new THREE.SphereGeometry(0.315, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2),
      mat(PALETTE.blue),
    );
    c.position.y = 0.05;
    head.add(c);
    head.add(box(0.36, 0.03, 0.2, PALETTE.blue, 0, 0.08, 0.3));
  }
  if (look.extra === "headphones") {
    const band = mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 16, Math.PI), mat(PALETTE.ink));
    band.position.y = 0.02;
    head.add(band);
    const cup = (side: number) => {
      const m = cyl(0.1, 0.1, 0.08, PALETTE.ink, 10);
      m.rotation.z = Math.PI / 2;
      m.position.set(side * 0.31, 0.0, 0);
      return m;
    };
    head.add(cup(-1), cup(1));
    const ring = (side: number) => {
      const m = cyl(
        0.06,
        0.06,
        0.085,
        mat(PALETTE.yellow, { emissive: PALETTE.yellow, ei: 0.4 }),
        10,
      );
      m.rotation.z = Math.PI / 2;
      m.position.set(side * 0.315, 0.0, 0);
      return m;
    };
    head.add(ring(-1), ring(1));
  }

  const hands = new THREE.Object3D();
  hands.position.set(0, 0.62, 0.38);
  root.add(hands);

  root.scale.setScalar(scale);
  return { root, body, legL, legR, armL, armR, hands };
}

/** Walk cycle + carry pose. `phase` advances with distance walked. */
export function poseCharacter(
  rig: Rig,
  phase: number,
  moving: boolean,
  carrying: boolean,
  dt: number,
) {
  const swing = moving ? Math.sin(phase) * 0.7 : 0;
  const k = 1 - Math.exp(-14 * dt);
  rig.legL.rotation.x += (swing - rig.legL.rotation.x) * k;
  rig.legR.rotation.x += (-swing - rig.legR.rotation.x) * k;
  const armTarget = carrying ? -1.35 : -swing * 0.8;
  rig.armL.rotation.x += (armTarget - rig.armL.rotation.x) * k;
  rig.armR.rotation.x += ((carrying ? -1.35 : swing * 0.8) - rig.armR.rotation.x) * k;
  rig.body.position.y = moving ? Math.abs(Math.sin(phase)) * 0.06 : 0;
  rig.body.rotation.z = moving ? Math.sin(phase) * 0.04 : 0;
}

/* ==========================================================================
 * Items
 * ======================================================================== */

export const ITEM_H: Record<ItemKind, number> = { brief: 0.05, mockup: 0.075, build: 0.24 };

export function makeItem(kind: ItemKind) {
  const g = new THREE.Group();
  if (kind === "brief") {
    g.add(box(0.4, 0.035, 0.3, "#fbf7ef", 0, 0.0175, 0));
    g.add(box(0.4, 0.012, 0.07, PALETTE.blue, 0, 0.04, -0.11, { cast: false }));
    g.add(box(0.22, 0.008, 0.03, "#c9c2b4", -0.05, 0.039, 0.0, { cast: false }));
    g.add(box(0.28, 0.008, 0.03, "#c9c2b4", -0.01, 0.039, 0.07, { cast: false }));
  } else if (kind === "mockup") {
    g.add(box(0.42, 0.06, 0.3, PALETTE.purple, 0, 0.03, 0));
    g.add(
      box(0.34, 0.012, 0.22, mat("#e5dcff", { emissive: "#b7a4ff", ei: 0.25 }), 0, 0.065, 0, {
        cast: false,
      }),
    );
    g.add(box(0.1, 0.006, 0.06, PALETTE.pink, -0.09, 0.073, -0.05, { cast: false }));
    g.add(box(0.14, 0.006, 0.04, PALETTE.yellow, 0.06, 0.073, 0.05, { cast: false }));
  } else {
    g.add(box(0.36, 0.22, 0.3, PALETTE.teal, 0, 0.11, 0));
    g.add(box(0.37, 0.05, 0.08, "#f2fbf9", 0, 0.11, 0, { cast: false }));
    g.add(box(0.08, 0.225, 0.31, "#f2fbf9", 0, 0.11, 0, { cast: false }));
    g.add(box(0.1, 0.06, 0.01, PALETTE.orange, 0.11, 0.15, 0.152, { cast: false }));
  }
  return g;
}

export const BILL_H = 0.032;

let billTex: THREE.Texture | null = null;
export function makeBill() {
  billTex ??= canvasTexture(128, 64, (ctx, w, h) => {
    ctx.fillStyle = "#5cbf75";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e8f8ea";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#e8f8ea";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3d9a57";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", w / 2, h / 2 + 1);
  });
  const top = new THREE.MeshStandardMaterial({ map: billTex, roughness: 0.9, flatShading: true });
  const side = mat("#4aa863");
  const m = mesh(new THREE.BoxGeometry(0.34, BILL_H, 0.17), [side, side, top, side, side, side]);
  return m;
}

/* ==========================================================================
 * Furniture
 * ======================================================================== */

function codeScreen(accent: string, design: boolean) {
  const tex = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = design ? "#f7f3ff" : "#1d2130";
    ctx.fillRect(0, 0, w, h);
    if (design) {
      // Layout blocks, tiled so the scroll loops cleanly.
      for (let y = 0; y < h; y += 64) {
        ctx.fillStyle = accent;
        roundRect(ctx, 18, y + 10, 120, 18, 6);
        ctx.fill();
        ctx.fillStyle = "#d8cff7";
        roundRect(ctx, 18, y + 36, 220, 20, 6);
        ctx.fill();
        ctx.fillStyle = "#f6c64a";
        roundRect(ctx, 160, y + 10, 78, 18, 6);
        ctx.fill();
      }
    } else {
      const cols = ["#7aa2f7", "#9ece6a", "#f7768e", "#e0af68", "#bb9af7", "#7dcfff"];
      let i = 0;
      for (let y = 8; y < h; y += 16) {
        const indent = ((i * 7) % 4) * 14;
        const len = 40 + ((i * 37) % 140);
        ctx.fillStyle = cols[i % cols.length]!;
        roundRect(ctx, 14 + indent, y, len, 8, 4);
        ctx.fill();
        if (i % 3 === 0) {
          ctx.fillStyle = "#565f89";
          roundRect(ctx, 22 + indent + len, y, 40, 8, 4);
          ctx.fill();
        }
        i++;
      }
    }
  });
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 0.62);
  return tex;
}

export type DeskModel = {
  group: THREE.Group;
  inAnchor: THREE.Object3D;
  outAnchor: THREE.Object3D;
  screen: THREE.Texture;
  screenMat: THREE.MeshStandardMaterial;
  extraScreen: THREE.Group;
};

export function makeDesk(accent: string, design: boolean): DeskModel {
  const g = new THREE.Group();
  const top = box(2.15, 0.08, 1.0, PALETTE.wood, 0, 0.74, 0);
  g.add(top);
  g.add(box(2.15, 0.03, 1.0, PALETTE.woodDark, 0, 0.695, 0, { cast: false }));
  for (const [x, z] of [
    [-1.0, -0.42],
    [1.0, -0.42],
    [-1.0, 0.42],
    [1.0, 0.42],
  ] as const)
    g.add(box(0.07, 0.7, 0.07, PALETTE.ink, x, 0.35, z));
  // Drawer unit under one side, in the station's colour.
  g.add(box(0.5, 0.6, 0.85, accent, -0.72, 0.35, 0));
  g.add(box(0.36, 0.04, 0.02, "#ffffff", -0.72, 0.5, 0.43, { cast: false }));
  g.add(box(0.36, 0.04, 0.02, "#ffffff", -0.72, 0.3, 0.43, { cast: false }));

  // Monitor
  const screen = codeScreen(accent, design);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screen,
    emissive: "#ffffff",
    emissiveMap: screen,
    emissiveIntensity: 0.55,
    roughness: 0.6,
  });
  g.add(box(0.08, 0.26, 0.06, PALETTE.ink, 0, 0.9, -0.3));
  g.add(box(0.36, 0.03, 0.22, PALETTE.ink, 0, 0.795, -0.3));
  const frame = box(1.0, 0.6, 0.06, PALETTE.ink, 0, 1.25, -0.3);
  g.add(frame);
  const face = mesh(new THREE.PlaneGeometry(0.92, 0.52), screenMat, { cast: false });
  face.position.set(0, 1.25, -0.266);
  g.add(face);

  // A second monitor, hidden until someone buys it.
  const extraScreen = new THREE.Group();
  extraScreen.add(box(0.06, 0.22, 0.05, PALETTE.ink, 0, 0.88, 0));
  const f2 = box(0.62, 0.42, 0.05, PALETTE.ink, 0, 1.12, 0);
  extraScreen.add(f2);
  const face2 = mesh(new THREE.PlaneGeometry(0.56, 0.36), screenMat, { cast: false });
  face2.position.set(0, 1.12, 0.028);
  extraScreen.add(face2);
  extraScreen.position.set(0.82, 0, -0.22);
  extraScreen.rotation.y = -0.45;
  extraScreen.visible = false;
  g.add(extraScreen);

  // Keyboard, mouse, mug, little plant
  g.add(box(0.6, 0.03, 0.2, "#e9e4dc", 0, 0.795, 0.05, { cast: false }));
  g.add(box(0.1, 0.03, 0.14, "#e9e4dc", 0.42, 0.795, 0.08, { cast: false }));
  const mug = cyl(0.06, 0.055, 0.12, accent, 10);
  mug.position.set(-0.45, 0.84, -0.3);
  g.add(mug);
  const pot = cyl(0.08, 0.06, 0.12, "#d9774b", 8);
  pot.position.set(0.85, 0.84, -0.33);
  g.add(pot);
  const leaf = ball(0.12, PALETTE.green, 0);
  leaf.position.set(0.85, 0.98, -0.33);
  g.add(leaf);

  // Trays: in on the left, out on the right.
  const tray = (x: number, color: string) => {
    const t = new THREE.Group();
    t.add(box(0.5, 0.03, 0.38, color, 0, 0.0, 0));
    t.add(box(0.5, 0.06, 0.02, color, 0, 0.03, 0.18));
    t.add(box(0.5, 0.06, 0.02, color, 0, 0.03, -0.18));
    t.position.set(x, 0.795, 0.2);
    g.add(t);
    const a = new THREE.Object3D();
    a.position.set(x, 0.82, 0.2);
    g.add(a);
    return a;
  };
  const inAnchor = tray(-0.62, "#d8d2c6");
  const outAnchor = tray(0.62, accent);

  // Chair
  const chair = new THREE.Group();
  chair.add(box(0.5, 0.08, 0.48, PALETTE.ink, 0, 0.48, 0));
  chair.add(box(0.5, 0.55, 0.08, PALETTE.ink, 0, 0.8, 0.24));
  chair.add(cyl(0.04, 0.04, 0.4, PALETTE.steel, 6).translateY(0.24));
  chair.add(box(0.5, 0.04, 0.08, PALETTE.steel, 0, 0.04, 0));
  chair.add(box(0.08, 0.04, 0.5, PALETTE.steel, 0, 0.04, 0));
  chair.position.set(0, 0, 0.62);
  chair.rotation.y = 0.25;
  g.add(chair);

  return { group: g, inAnchor, outAnchor, screen, screenMat, extraScreen };
}

export type ReceptionModel = {
  group: THREE.Group;
  outAnchor: THREE.Object3D;
  bell: THREE.Object3D;
};

export function makeReception(): ReceptionModel {
  const g = new THREE.Group();
  // The counter runs along z; clients stand on its +x side, you on its -x side.
  g.add(box(0.8, 0.98, 2.0, PALETTE.wall, 0, 0.49, 0));
  g.add(box(0.96, 0.08, 2.16, PALETTE.wood, 0, 1.02, 0));
  const sign = canvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.red;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff6ea";
    ctx.font = "900 62px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SHIP IT INC.", w / 2, h / 2 + 4);
  });
  const signMat = new THREE.MeshStandardMaterial({ map: sign, roughness: 0.7 });
  const panel = mesh(new THREE.PlaneGeometry(1.9, 0.42), signMat, { cast: false });
  panel.position.set(0.405, 0.62, 0);
  panel.rotation.y = Math.PI / 2;
  g.add(panel);
  g.add(box(0.03, 0.08, 2.0, PALETTE.redDeep, 0.41, 0.12, 0, { cast: false }));

  // Monitor facing the staff side.
  g.add(box(0.06, 0.2, 0.06, PALETTE.ink, -0.2, 1.16, -0.55));
  const mon = box(0.05, 0.36, 0.56, PALETTE.ink, -0.2, 1.38, -0.55);
  g.add(mon);
  const face = mesh(
    new THREE.PlaneGeometry(0.5, 0.3),
    mat("#9fd8ff", { emissive: "#7cc8ff", ei: 0.6 }),
    { cast: false },
  );
  face.position.set(-0.226, 1.38, -0.55);
  face.rotation.y = -Math.PI / 2;
  g.add(face);

  const bell = new THREE.Group();
  const dome = mesh(
    new THREE.SphereGeometry(0.09, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(PALETTE.yellow, { metal: 0.6, rough: 0.3 }),
  );
  bell.add(dome);
  bell.add(cyl(0.11, 0.11, 0.02, PALETTE.ink, 10));
  bell.position.set(0.15, 1.07, 0.7);
  g.add(bell);

  const tray = new THREE.Group();
  tray.add(box(0.5, 0.03, 0.4, PALETTE.blue, 0, 0, 0));
  tray.position.set(-0.1, 1.075, 0.1);
  g.add(tray);
  const outAnchor = new THREE.Object3D();
  outAnchor.position.set(-0.1, 1.09, 0.1);
  g.add(outAnchor);

  const plant = makePlant(0.8);
  plant.position.set(0.1, 1.06, -0.8);
  g.add(plant);

  return { group: g, outAnchor, bell };
}

export type DeployModel = {
  group: THREE.Group;
  inAnchor: THREE.Object3D;
  pad: THREE.Object3D;
  leds: THREE.MeshStandardMaterial[];
};

export function makeDeploy(): DeployModel {
  const g = new THREE.Group();

  // Server rack against the wall.
  const rack = new THREE.Group();
  rack.add(box(0.95, 2.1, 0.95, "#2a2e3b", 0, 1.05, 0));
  rack.add(box(0.98, 0.06, 0.98, "#3a4052", 0, 2.12, 0));
  const leds: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 0.35 + i * 0.25;
    rack.add(box(0.02, 0.16, 0.78, "#3b4153", 0.48, y, 0, { cast: false }));
    const led = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? PALETTE.yellow : PALETTE.green,
      emissive: i % 3 === 0 ? PALETTE.yellow : PALETTE.green,
      emissiveIntensity: 1.2,
    });
    leds.push(led);
    for (let j = 0; j < 4; j++) {
      const l = mesh(new THREE.BoxGeometry(0.02, 0.035, 0.035), led, { cast: false });
      l.position.set(0.495, y, -0.3 + j * 0.06);
      rack.add(l);
    }
  }
  rack.position.set(-0.2, 0, -0.55);
  g.add(rack);

  // Intake belt in front of the rack.
  const belt = new THREE.Group();
  belt.add(box(0.7, 0.5, 0.7, PALETTE.steel, 0, 0.25, 0));
  belt.add(box(0.74, 0.05, 0.74, PALETTE.ink, 0, 0.525, 0));
  for (let i = 0; i < 4; i++)
    belt.add(box(0.72, 0.02, 0.05, "#525a6e", 0, 0.56, -0.27 + i * 0.18, { cast: false }));
  belt.position.set(0.4, 0, -0.55);
  g.add(belt);
  const inAnchor = new THREE.Object3D();
  inAnchor.position.set(0.4, 0.57, -0.55);
  g.add(inAnchor);

  // Launch pad with hazard ring.
  const hazard = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#30343f";
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.fillStyle = i % 2 ? PALETTE.yellow : "#30343f";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, w / 2, 0, (Math.PI * 2) / 16);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#3a3f4c";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f6c64a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.2, 0, Math.PI * 2);
    ctx.stroke();
  });
  const pad = new THREE.Group();
  const disc = cyl(0.5, 0.55, 0.1, "#30343f", 20);
  disc.position.y = 0.05;
  pad.add(disc);
  const top = mesh(
    new THREE.CircleGeometry(0.5, 24),
    new THREE.MeshStandardMaterial({ map: hazard, roughness: 0.8 }),
    {
      cast: false,
    },
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.102;
  pad.add(top);
  pad.position.set(0.2, 0, 0.55);
  g.add(pad);

  return { group: g, inAnchor, pad, leds };
}

export function makeRocket() {
  const g = new THREE.Group();
  const body = cyl(0.13, 0.15, 0.48, "#f7f4ee", 12);
  body.position.y = 0.34;
  g.add(body);
  const nose = mesh(new THREE.ConeGeometry(0.13, 0.26, 12), mat(PALETTE.red));
  nose.position.y = 0.71;
  g.add(nose);
  const win = cyl(0.06, 0.06, 0.02, mat(PALETTE.blue, { emissive: PALETTE.blue, ei: 0.5 }), 12);
  win.rotation.x = Math.PI / 2;
  win.position.set(0, 0.44, 0.14);
  g.add(win);
  for (let i = 0; i < 3; i++) {
    const fin = box(0.03, 0.18, 0.16, PALETTE.red, 0, 0.17, 0.16);
    const pivot = new THREE.Group();
    pivot.add(fin);
    pivot.rotation.y = (i / 3) * Math.PI * 2;
    g.add(pivot);
  }
  const flame = mesh(
    new THREE.ConeGeometry(0.1, 0.34, 10),
    new THREE.MeshBasicMaterial({ color: PALETTE.orange, transparent: true, opacity: 0.9 }),
    { cast: false, receive: false },
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -0.05;
  g.add(flame);
  return { group: g, flame };
}

export function makePuff() {
  return mesh(
    new THREE.IcosahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({
      color: "#f1ece4",
      transparent: true,
      opacity: 0.9,
      flatShading: true,
    }),
    { cast: false, receive: false },
  );
}

/* ---- Floor markers ------------------------------------------------------ */

let zoneTex: THREE.Texture | null = null;
export function makeZone(w: number, d: number) {
  zoneTex ??= canvasTexture(256, 256, (ctx, cw, ch) => {
    ctx.clearRect(0, 0, cw, ch);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 14;
    roundRect(ctx, 14, 14, cw - 28, ch - 28, 40);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    roundRect(ctx, 14, 14, cw - 28, ch - 28, 40);
    ctx.fill();
  });
  const m = new THREE.MeshBasicMaterial({
    map: zoneTex,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const plane = mesh(new THREE.PlaneGeometry(w, d), m, { cast: false, receive: false });
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.012;
  return plane;
}

let padTex: THREE.Texture | null = null;
export function makePad() {
  padTex ??= canvasTexture(256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(30,34,48,0.55)";
    roundRect(ctx, 10, 10, w - 20, h - 20, 36);
    ctx.fill();
    ctx.setLineDash([26, 16]);
    ctx.lineDashOffset = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    roundRect(ctx, 18, 18, w - 36, h - 36, 30);
    ctx.stroke();
  });
  const g = new THREE.Group();
  const base = mesh(
    new THREE.PlaneGeometry(1.3, 1.3),
    new THREE.MeshBasicMaterial({ map: padTex, transparent: true, depthWrite: false }),
    { cast: false, receive: false },
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.014;
  g.add(base);

  // The fill grows from the near edge as money goes in.
  const fillPivot = new THREE.Group();
  fillPivot.position.set(0, 0.016, 0.56);
  const fill = mesh(
    new THREE.PlaneGeometry(1.12, 1.12),
    new THREE.MeshBasicMaterial({
      color: PALETTE.green,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
    { cast: false, receive: false },
  );
  fill.rotation.x = -Math.PI / 2;
  fill.position.z = -0.56;
  fillPivot.add(fill);
  fillPivot.scale.z = 0.0001;
  g.add(fillPivot);
  return { group: g, fill: fillPivot };
}

export function makeArrow() {
  const g = new THREE.Group();
  const m = mat(PALETTE.yellow, { emissive: PALETTE.yellow, ei: 0.55 });
  const cone = mesh(new THREE.ConeGeometry(0.22, 0.38, 4), m, { cast: false, receive: false });
  cone.rotation.x = Math.PI;
  cone.position.y = 0.19;
  g.add(cone);
  const stem = box(0.13, 0.28, 0.13, m, 0, 0.52, 0, { cast: false, receive: false });
  g.add(stem);
  return g;
}

/* ==========================================================================
 * Decor
 * ======================================================================== */

export function makePlant(scale = 1) {
  const g = new THREE.Group();
  const pot = cyl(0.17, 0.13, 0.28, "#d9774b", 8);
  pot.position.y = 0.14;
  g.add(pot);
  g.add(box(0.3, 0.03, 0.3, "#5b4030", 0, 0.27, 0, { cast: false }));
  const leaves = [
    [0, 0.5, 0, 0.2],
    [0.1, 0.62, 0.05, 0.15],
    [-0.1, 0.6, -0.04, 0.16],
    [0.02, 0.76, -0.02, 0.12],
  ] as const;
  for (const [x, y, z, r] of leaves) {
    const l = ball(r, PALETTE.green, 0);
    l.position.set(x, y, z);
    g.add(l);
  }
  g.scale.setScalar(scale);
  return g;
}

export function makeSofa() {
  const g = new THREE.Group();
  const c = "#3f8f8a";
  const d = "#337773";
  g.add(box(2.7, 0.3, 0.9, d, 0, 0.25, 0));
  g.add(box(2.7, 0.6, 0.25, c, 0, 0.6, -0.33));
  g.add(box(0.25, 0.5, 0.9, c, -1.33, 0.45, 0));
  g.add(box(0.25, 0.5, 0.9, c, 1.33, 0.45, 0));
  for (let i = -1; i <= 1; i++) g.add(box(0.78, 0.14, 0.62, c, i * 0.8, 0.46, 0.06));
  const pillow = box(0.36, 0.3, 0.12, PALETTE.yellow, -0.95, 0.66, -0.15);
  pillow.rotation.z = 0.2;
  g.add(pillow);
  return g;
}

export function makePoster(text: string, sub: string, bg: string, fg: string, w = 1.1, h = 1.4) {
  const tex = canvasTexture(256, Math.round((256 * h) / w), (ctx, cw, ch) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.font = "900 46px system-ui, sans-serif";
    const lines = text.split("\n");
    lines.forEach((l, i) => ctx.fillText(l, cw / 2, ch * 0.42 + i * 48 - (lines.length - 1) * 24));
    ctx.font = "600 20px ui-monospace, monospace";
    ctx.globalAlpha = 0.8;
    ctx.fillText(sub, cw / 2, ch * 0.82);
  });
  const g = new THREE.Group();
  g.add(box(w + 0.08, h + 0.08, 0.03, PALETTE.ink, 0, 0, 0, { cast: false }));
  const face = mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }),
    {
      cast: false,
    },
  );
  face.position.z = 0.017;
  g.add(face);
  return g;
}

export function makeWhiteboard() {
  const g = new THREE.Group();
  g.add(box(1.9, 1.05, 0.05, "#d8dde6", 0, 0, 0, { cast: false }));
  g.add(box(1.8, 0.95, 0.02, "#fbfcfe", 0, 0, 0.03, { cast: false }));
  const notes = [PALETTE.yellow, PALETTE.pink, "#8fd3ff", PALETTE.yellow, "#b4e88a", PALETTE.pink];
  notes.forEach((c, i) => {
    const n = box(0.2, 0.2, 0.01, c, -0.7 + (i % 3) * 0.28, 0.22 - Math.floor(i / 3) * 0.3, 0.045, {
      cast: false,
    });
    n.rotation.z = (i % 2 ? 1 : -1) * 0.08;
    g.add(n);
  });
  g.add(box(0.7, 0.03, 0.01, PALETTE.blue, 0.42, 0.25, 0.045, { cast: false }));
  g.add(box(0.5, 0.03, 0.01, PALETTE.red, 0.36, 0.1, 0.045, { cast: false }));
  g.add(box(0.6, 0.03, 0.01, PALETTE.ink, 0.4, -0.05, 0.045, { cast: false }));
  g.add(box(1.8, 0.05, 0.08, "#c4cad4", 0, -0.52, 0.05));
  return g;
}

export function makeWindow(w = 1.5, h = 1.0) {
  const g = new THREE.Group();
  g.add(box(w + 0.12, h + 0.12, 0.06, "#ffffff", 0, 0, 0, { cast: false }));
  g.add(
    box(w, h, 0.02, mat("#bfe6f7", { emissive: "#bfe6f7", ei: 0.55 }), 0, 0, 0.03, { cast: false }),
  );
  g.add(box(0.05, h, 0.03, "#ffffff", 0, 0, 0.045, { cast: false }));
  g.add(box(w, 0.05, 0.03, "#ffffff", 0, 0, 0.045, { cast: false }));
  g.add(box(w + 0.2, 0.06, 0.16, "#ffffff", 0, -h / 2 - 0.08, 0.06));
  return g;
}

export function makeShelf() {
  const g = new THREE.Group();
  g.add(box(1.4, 0.05, 0.4, PALETTE.woodDark, 0, 0, 0));
  g.add(box(1.4, 0.05, 0.4, PALETTE.woodDark, 0, 0.5, 0));
  const items: [number, number, string, number][] = [
    [-0.5, 0.05, PALETTE.blue, 0.24],
    [-0.3, 0.05, PALETTE.yellow, 0.3],
    [-0.12, 0.05, PALETTE.red, 0.2],
    [0.3, 0.55, PALETTE.teal, 0.22],
    [0.5, 0.55, PALETTE.purple, 0.26],
  ];
  for (const [x, y, c, hgt] of items) g.add(box(0.14, hgt, 0.26, c, x, y + hgt / 2 + 0.025, 0));
  const plant = makePlant(0.6);
  plant.position.set(-0.4, 0.53, 0);
  g.add(plant);
  const trophy = cyl(0.06, 0.03, 0.18, mat(PALETTE.yellow, { metal: 0.7, rough: 0.3 }), 8);
  trophy.position.set(0.25, 0.16, 0);
  g.add(trophy);
  return g;
}

export function makeStringLights(length: number) {
  const g = new THREE.Group();
  const cols = [PALETTE.yellow, PALETTE.pink, "#8fd3ff", PALETTE.orange];
  const n = Math.round(length / 0.45);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = -length / 2 + t * length;
    const y = -(Math.sin(t * Math.PI * 3) ** 2) * 0.18;
    const c = cols[i % cols.length]!;
    const b = mesh(new THREE.IcosahedronGeometry(0.05, 0), mat(c, { emissive: c, ei: 1.1 }), {
      cast: false,
    });
    b.position.set(x, y, 0);
    g.add(b);
  }
  return g;
}

export function makeCoffeeMachine() {
  const g = new THREE.Group();
  g.add(box(0.7, 0.8, 0.5, PALETTE.woodDark, 0, 0.4, 0));
  g.add(box(0.42, 0.55, 0.36, "#30343f", 0, 1.08, 0));
  g.add(box(0.3, 0.08, 0.2, PALETTE.steel, 0, 0.9, 0.06));
  g.add(
    box(0.2, 0.08, 0.02, mat(PALETTE.red, { emissive: PALETTE.red, ei: 0.8 }), 0, 1.24, 0.19, {
      cast: false,
    }),
  );
  const cup = cyl(0.05, 0.045, 0.09, "#ffffff", 8);
  cup.position.set(0, 0.85, 0.06);
  g.add(cup);
  const mug = cyl(0.05, 0.05, 0.1, PALETTE.yellow, 8);
  mug.position.set(0.25, 0.85, 0.1);
  g.add(mug);
  return g;
}

export function makeNeonSign() {
  const tex = canvasTexture(512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = "italic 900 92px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#ff4fa0";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "#ffd0e6";
    ctx.fillText("ship it ✦", w / 2, h / 2);
    ctx.fillText("ship it ✦", w / 2, h / 2);
  });
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const plane = mesh(new THREE.PlaneGeometry(2.2, 0.69), m, { cast: false, receive: false });
  return plane;
}

export function makeTree(scale = 1) {
  const g = new THREE.Group();
  const trunk = cyl(0.12, 0.16, 0.8, PALETTE.woodDark, 6);
  trunk.position.y = 0.4;
  g.add(trunk);
  const a = ball(0.7, "#7fb069", 0);
  a.position.y = 1.2;
  g.add(a);
  const b = ball(0.5, "#93c47d", 0);
  b.position.set(0.25, 1.65, 0.1);
  g.add(b);
  g.scale.setScalar(scale);
  return g;
}

export function floorTexture() {
  const tex = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 0, w, h);
    // Faint speckle so the concrete is not a flat colour.
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(120,95,60,${Math.random() * 0.07})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.strokeStyle = PALETTE.floorLine;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, h);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function rugTexture() {
  return canvasTexture(256, 160, (ctx, w, h) => {
    ctx.fillStyle = "#e9b872";
    roundRect(ctx, 0, 0, w, h, 30);
    ctx.fill();
    ctx.strokeStyle = "#fff4e0";
    ctx.lineWidth = 6;
    roundRect(ctx, 14, 14, w - 28, h - 28, 22);
    ctx.stroke();
    ctx.fillStyle = "#d99b4e";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(50 + i * 39, h / 2, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

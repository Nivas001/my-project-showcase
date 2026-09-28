import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * Building blocks for the freight scene: a geometry merger so every rigid part
 * of a machine is one draw call per material, a few primitive shorthands, and
 * the procedural textures and PBR materials everything is painted with.
 *
 * Nothing here is downloaded. Every texture is drawn on a canvas at start-up,
 * which keeps the page light and the look entirely our own.
 */

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();

/** Translate, then rotate (radians, XYZ order), then scale. */
export function at(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _p.set(x, y, z);
  _q.setFromEuler(_e.set(rx, ry, rz));
  _s.set(sx, sy, sz);
  return _m.clone().compose(_p, _q, _s);
}

function prep(geo: THREE.BufferGeometry) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const name of Object.keys(g.attributes)) {
    if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
  }
  if (!g.getAttribute("normal")) g.computeVertexNormals();
  if (!g.getAttribute("uv")) {
    const count = g.getAttribute("position").count;
    g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
  }
  g.clearGroups();
  return g;
}

/**
 * Collects primitives by material and merges each set into a single mesh.
 * One `Kit` per rigid part: a chassis, a boom section, a wheel.
 */
export class Kit {
  private readonly parts = new Map<THREE.Material, THREE.BufferGeometry[]>();

  add(geo: THREE.BufferGeometry, material: THREE.Material, matrix?: THREE.Matrix4) {
    const g = prep(geo);
    geo.dispose();
    if (matrix) g.applyMatrix4(matrix);
    const list = this.parts.get(material);
    if (list) list.push(g);
    else this.parts.set(material, [g]);
    return this;
  }

  build({ cast = true, receive = true } = {}) {
    const group = new THREE.Group();
    for (const [material, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}

/* ---- Primitive shorthands ------------------------------------------------ */

export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const rbox = (w: number, h: number, d: number, r: number, seg = 3) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
/** A cylinder along y. */
export const cyl = (rt: number, rb: number, h: number, seg = 24, open = false) =>
  new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);

export const HALF_PI = Math.PI / 2;

/* ---- Canvas textures --------------------------------------------------------- */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return { c, ctx };
}

function texture(c: HTMLCanvasElement, { srgb = true, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Periodic value noise, so textures built from it tile without seams. */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const value = (x: number, y: number, period: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const w = (v: number) => ((v % period) + period) % period;
    const a = hash(w(xi), w(yi));
    const b = hash(w(xi + 1), w(yi));
    const c = hash(w(xi), w(yi + 1));
    const d = hash(w(xi + 1), w(yi + 1));
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  };
  /** Fractal sum in [0, 1]; x and y are in cells of the base period. */
  return (x: number, y: number, period: number, octaves = 5) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let f = 1;
    for (let o = 0; o < octaves; o++) {
      sum += value(x * f, y * f, period * f) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
}

/** Yard concrete: poured slabs with joints, tyre polish and old oil. One tile = 32 m. */
export function concreteTexture() {
  const size = 512;
  const { c, ctx } = canvas(size, size);
  const img = ctx.createImageData(size, size);
  const fbm = makeNoise(7);
  const stain = makeNoise(19);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * 8;
      const v = (y / size) * 8;
      const n = fbm(u, v, 8, 5);
      const s = stain(u * 0.5, v * 0.5, 4, 4);
      const grain = Math.random() * 0.05;
      let k = 0.92 + (n - 0.5) * 0.14 + grain - 0.025;
      if (s > 0.66) k -= (s - 0.66) * 0.55;
      const i = (y * size + x) * 4;
      img.data[i] = 146 * k;
      img.data[i + 1] = 143 * k;
      img.data[i + 2] = 137 * k;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // Slab joints every 4 m.
  ctx.strokeStyle = "rgba(40,38,34,0.11)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const p = (i / 8) * size;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  return texture(c);
}

/** Asphalt with white edge lines and a dashed centre; 11 m wide, 18 m per tile. */
export function asphaltTexture() {
  const w = 256;
  const h = 512;
  const { c, ctx } = canvas(w, h);
  const img = ctx.createImageData(w, h);
  const fbm = makeNoise(31);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm((x / w) * 4, (y / h) * 8, 4, 4);
      const k = 0.85 + (n - 0.5) * 0.25 + Math.random() * 0.12;
      const i = (y * w + x) * 4;
      img.data[i] = 54 * k;
      img.data[i + 1] = 55 * k;
      img.data[i + 2] = 58 * k;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const m = w / 11;
  ctx.fillStyle = "rgba(236,236,230,0.92)";
  ctx.fillRect(0.45 * m, 0, 0.15 * m, h);
  ctx.fillRect(w - 0.6 * m, 0, 0.15 * m, h);
  // 3 m dashes, 6 m gaps.
  const perM = h / 18;
  ctx.fillRect(w / 2 - 0.075 * m, 0, 0.15 * m, 3 * perM);
  ctx.fillRect(w / 2 - 0.075 * m, 9 * perM, 0.15 * m, 3 * perM);
  return texture(c);
}

/**
 * Trapezoidal corrugation as a tangent-space normal map. `across` puts the
 * ridges along the texture's u axis instead of v (container roofs).
 */
export function corrugationNormal(across = false) {
  const n = 64;
  const { c, ctx } = canvas(across ? 4 : n, across ? n : 4);
  const img = ctx.createImageData(c.width, c.height);
  for (let i = 0; i < n; i++) {
    const f = i / n;
    let slope = 0;
    if (f > 0.2 && f < 0.3) slope = 0.72;
    else if (f > 0.7 && f < 0.8) slope = -0.72;
    const nz = Math.sqrt(1 - slope * slope);
    for (let j = 0; j < 4; j++) {
      const x = across ? j : i;
      const y = across ? i : j;
      const k = (y * c.width + x) * 4;
      img.data[k] = across ? 128 : (slope * 0.5 + 0.5) * 255;
      img.data[k + 1] = across ? (slope * 0.5 + 0.5) * 255 : 128;
      img.data[k + 2] = nz * 255;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return texture(c, { srgb: false });
}

/** A container side's paint: darker rails top and bottom, corner posts, grime. */
export function containerSideShade() {
  const w = 512;
  const h = 128;
  const { c, ctx } = canvas(w, h);
  const img = ctx.createImageData(w, h);
  const fbm = makeNoise(53);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm((x / w) * 16, (y / h) * 4, 16, 4);
      let k = 0.96 + (n - 0.5) * 0.12;
      // Grime collects toward the bottom rail.
      k -= Math.max(0, y / h - 0.7) * 0.18;
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255 * k;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, 0, w, h * 0.055);
  ctx.fillRect(0, h * 0.93, w, h * 0.07);
  ctx.fillRect(0, 0, w * 0.012, h);
  ctx.fillRect(w * 0.988, 0, w * 0.012, h);
  return texture(c, { repeat: false });
}

/** Container doors: two leaves, four locking bars, hinges. Greyscale, tinted by paint. */
export function doorShade() {
  const s = 256;
  const { c, ctx } = canvas(s, s);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, s, s);
  // Door frame.
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, s, s * 0.06);
  ctx.fillRect(0, s * 0.93, s, s * 0.07);
  ctx.fillRect(0, 0, s * 0.05, s);
  ctx.fillRect(s * 0.95, 0, s * 0.05, s);
  // Seam between the leaves.
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(s * 0.497, s * 0.06, s * 0.006, s * 0.87);
  // Locking bars.
  const bars = [0.2, 0.37, 0.63, 0.8];
  for (const b of bars) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(s * b - 3, s * 0.07, 6, s * 0.86);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(s * b + 3, s * 0.07, 2, s * 0.86);
    // Handles.
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(s * b - 2, s * 0.55, 18, 5);
  }
  // Hinges.
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  for (const y of [0.16, 0.38, 0.62, 0.84]) {
    ctx.fillRect(s * 0.05, s * y, 10, 8);
    ctx.fillRect(s * 0.95 - 10, s * y, 10, 8);
  }
  return texture(c, { repeat: false });
}

/** Profiled steel cladding for sheds: ribs, a fascia, dock doors along the bottom. */
export function claddingTexture() {
  const w = 512;
  const h = 128;
  const { c, ctx } = canvas(w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) {
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.fillRect(x, 0, 3, h);
  }
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, w, 6);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = "rgba(20,24,28,0.55)";
    ctx.fillRect(28 + i * 80, h - 44, 44, 44);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(28 + i * 80, h - 46, 44, 3);
  }
  return texture(c);
}

/** Diagonal yellow-and-black warning stripes. */
export function hazardTexture() {
  const { c, ctx } = canvas(128, 32);
  ctx.fillStyle = "#e9b10c";
  ctx.fillRect(0, 0, 128, 32);
  ctx.fillStyle = "#16161a";
  for (let x = -32; x < 160; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 32);
    ctx.lineTo(x + 16, 32);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 16, 0);
    ctx.closePath();
    ctx.fill();
  }
  return texture(c);
}

/** Soft cumulus coverage for the cloud deck, as an alpha map. */
export function cloudTexture() {
  const size = 512;
  const { c, ctx } = canvas(size, size);
  const img = ctx.createImageData(size, size);
  const fbm = makeNoise(97);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * 6, (y / size) * 6, 6, 6);
      const a = Math.min(1, Math.max(0, (n - 0.52) * 4.6));
      const v = Math.pow(a, 0.5) * 255;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return texture(c, { srgb: false });
}

/** Rows of lit and unlit windows for a ship's accommodation block. */
export function windowsTexture() {
  const { c, ctx } = canvas(256, 256);
  ctx.fillStyle = "#eef0ef";
  ctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    const y = row * 32 + 12;
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, row * 32 + 30, 256, 2);
    for (let col = 0; col < 12; col++) {
      ctx.fillStyle = "#1e2a36";
      ctx.fillRect(col * 21 + 5, y, 12, 9);
    }
  }
  return texture(c);
}

/** Panel lines for a wing or tailplane surface, in metres (1 unit = 1 m). */
export function panelTexture() {
  const { c, ctx } = canvas(256, 256);
  ctx.fillStyle = "#e6e8ea";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(60,70,80,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  const t = texture(c);
  t.repeat.set(1 / 8, 1 / 8);
  return t;
}

/** Text painted on a transparent canvas, for decals and hoardings. */
export function textTexture(
  lines: {
    text: string;
    font: string;
    color: string;
    x: number;
    y: number;
    align?: CanvasTextAlign;
  }[],
  w: number,
  h: number,
  background?: string,
) {
  const { c, ctx } = canvas(w, h);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  for (const line of lines) {
    ctx.font = line.font;
    ctx.fillStyle = line.color;
    ctx.textAlign = line.align ?? "left";
    ctx.textBaseline = "middle";
    ctx.fillText(line.text, line.x, line.y);
  }
  return texture(c, { repeat: false });
}

/* ---- Materials ------------------------------------------------------------------ */

export type Materials = ReturnType<typeof makeMaterials>;

/**
 * The whole palette. Environment lighting comes from the scene's sky, so
 * these only describe the surfaces: paint, steel, rubber, glass, concrete.
 */
export function makeMaterials() {
  const std = (params: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial(params);
  const paint = (color: string, roughness = 0.42, clearcoat = 0.5) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      metalness: 0.1,
      clearcoat,
      clearcoatRoughness: 0.25,
    });

  const hazardMap = hazardTexture();
  const concrete = concreteTexture();
  const asphalt = asphaltTexture();
  const panels = panelTexture();

  return {
    textures: { hazardMap, concrete, asphalt, panels },
    // Machine paint.
    white: paint("#e7e6e1", 0.4),
    offWhite: paint("#d8d6cf", 0.5, 0.2),
    graphite: paint("#2b2f35", 0.45, 0.35),
    black: paint("#121417", 0.3, 0.9),
    signature: paint("#e97a2c", 0.38, 0.5),
    yellow: paint("#e9b10c", 0.45, 0.3),
    navy: paint("#1c2b45", 0.5, 0.2),
    hullRed: paint("#7a2a24", 0.7, 0),
    deckGreen: paint("#50615a", 0.75, 0),
    hatch: paint("#5e6f7d", 0.62, 0.1),
    hazard: std({ map: hazardMap, roughness: 0.5, metalness: 0.1 }),
    // Metal and rubber.
    steel: std({ color: "#6a6f76", roughness: 0.42, metalness: 0.75 }),
    darkSteel: std({ color: "#34373c", roughness: 0.5, metalness: 0.6 }),
    chrome: std({ color: "#e4e7ea", roughness: 0.08, metalness: 1 }),
    alloy: std({ color: "#c4c8cc", roughness: 0.28, metalness: 0.95 }),
    rubber: std({ color: "#1a1a1b", roughness: 0.92, metalness: 0 }),
    plastic: std({ color: "#202225", roughness: 0.7, metalness: 0 }),
    plasticDouble: std({ color: "#202225", roughness: 0.7, metalness: 0, side: THREE.DoubleSide }),
    cable: std({ color: "#1c1d1f", roughness: 0.6, metalness: 0.4 }),
    // Glass: dark, reflective, opaque — reads correctly at every distance.
    glass: new THREE.MeshPhysicalMaterial({
      color: "#16212c",
      roughness: 0.03,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.2,
    }),
    // Lamps.
    headlamp: std({ color: "#ffffff", emissive: "#fff3d6", emissiveIntensity: 1.4 }),
    taillamp: std({ color: "#5a0d0d", emissive: "#ff2a1a", emissiveIntensity: 0.9 }),
    amber: std({ color: "#5a3a06", emissive: "#ffa21a", emissiveIntensity: 1.6 }),
    beacon: std({ color: "#5a0d0d", emissive: "#ff3322", emissiveIntensity: 2.2 }),
    // Ground.
    concrete: std({ map: concrete, roughness: 0.93, metalness: 0 }),
    quayWall: std({ color: "#6f6c66", roughness: 0.95, metalness: 0 }),
    asphalt: std({
      map: asphalt,
      roughness: 0.88,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
    wing: std({ map: panels, roughness: 0.4, metalness: 0.15 }),
    fuselage: paint("#f3f4f5", 0.32, 0.6),
    belly: paint("#c9ccd0", 0.45, 0.2),
  };
}

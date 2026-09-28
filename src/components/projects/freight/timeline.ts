/**
 * THE FREIGHT TIMELINE
 *
 * One number drives the whole story: `T`, the scroll position measured in
 * chapters (0 at the top of the section, CHAPTERS at the bottom). Every
 * machine, the container and the camera are pure functions of T, so scrolling
 * backwards un-ships the box exactly as it was shipped and nothing can drift.
 *
 * World units are metres, y is up. The yard sits at the origin; the road runs
 * east along z = LANE_Z, turns south, and runs down a pier with a quay crane
 * and a feeder ship on its east side. The open sea is south; the sky is up.
 *
 *   Chapter 0  intro — the yard from the air
 *   Chapter 1  requirements — reach stacker drives up, sizes its spreader
 *   Chapter 2  design — lowers, locks four corners, lifts
 *   Chapter 3  coding — turns, the truck backs in, the box goes on the trailer
 *   Chapter 4  debugging — the truck drives out, turns, heads down the pier
 *   Chapter 5  testing — the quay crane lifts the box aboard
 *   Chapter 6  security — the ship leaves, lashed and locked
 *   Chapter 7  shipping — the camera climbs through cloud; a freighter passes
 */

export const CHAPTERS = 8;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before a, 1 after b, linear between. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smooth = (t: number) => t * t * (3 - 2 * t);

type Keys = readonly (readonly [number, number])[];

/** A keyframed value that eases into and out of every key: it stops on each one. */
export function eased(keys: Keys) {
  return (t: number) => {
    const first = keys[0]!;
    if (t <= first[0]) return first[1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i]!;
      if (t <= t1) {
        const [t0, v0] = keys[i - 1]!;
        return lerp(v0, v1, inOut((t - t0) / (t1 - t0)));
      }
    }
    return keys[keys.length - 1]![1];
  };
}

/**
 * A keyframed value that keeps moving through its keys (monotone cubic,
 * Fritsch–Carlson) and only comes to rest at the two ends. Used for anything
 * that cruises — a truck should not stop dead at every waypoint.
 */
export function flowing(keys: Keys) {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1]! - vs[i]!) / (ts[i + 1]! - ts[i]!));
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const a = d[i - 1]!;
    const b = d[i]!;
    m[i] = a * b <= 0 ? 0 : (a + b) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    const di = d[i]!;
    if (di === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / di;
    const b = m[i + 1]! / di;
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * di;
      m[i + 1] = k * b * di;
    }
  }
  return (t: number) => {
    if (t <= ts[0]!) return vs[0]!;
    if (t >= ts[n - 1]!) return vs[n - 1]!;
    let i = 0;
    while (t > ts[i + 1]!) i++;
    const h = ts[i + 1]! - ts[i]!;
    const u = (t - ts[i]!) / h;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      (2 * u3 - 3 * u2 + 1) * vs[i]! +
      (u3 - 2 * u2 + u) * h * m[i]! +
      (-2 * u3 + 3 * u2) * vs[i + 1]! +
      (u3 - u2) * h * m[i + 1]!
    );
  };
}

/* ---- Fixed dimensions ------------------------------------------------------ */

/** A 40ft ISO container, metres. Length runs along its local z. */
export const BOX = { L: 12.19, H: 2.59, W: 2.44 } as const;

/** Reach stacker: boom pivot (machine-local x, y) and base boom length. */
export const STACKER = {
  pivotX: -3.8,
  pivotY: 4.1,
  boomBase: 9.0,
  /** Tip pin to the underside of the spreader's headblocks. */
  drop: 1.675,
} as const;

/** Where the hero box starts: top of the left-hand stack, doors to the south. */
export const STACK_X = 8.78;
export const STACK_TOP = BOX.H * 2;

/** Tractor front axle to the centre of a box on its trailer. */
export const RIG_TO_BOX = 8.3;
/** Height of the trailer's twistlocks — the underside of a box on the trailer. */
export const DECK_Y = 1.45;

/* ---- The road ------------------------------------------------------------ */

export const LANE_Z = 13;
export const TURN_R = 25;
/** The truck lane on the pier. */
export const PIER_X = 145;
const TURN_X = PIER_X - TURN_R;
const ROAD_START_X = -160;
const LEG_A = TURN_X - ROAD_START_X;
const LEG_B = (Math.PI / 2) * TURN_R;

export type RoadPoint = { x: number; z: number; dx: number; dz: number };

/** A point on the road at arc length s, with the direction of travel. */
export function roadAt(s: number): RoadPoint {
  if (s <= LEG_A) return { x: ROAD_START_X + s, z: LANE_Z, dx: 1, dz: 0 };
  if (s <= LEG_A + LEG_B) {
    const a = -Math.PI / 2 + (s - LEG_A) / TURN_R;
    return {
      x: TURN_X + TURN_R * Math.cos(a),
      z: LANE_Z + TURN_R + TURN_R * Math.sin(a),
      dx: -Math.sin(a),
      dz: Math.cos(a),
    };
  }
  return { x: PIER_X, z: LANE_Z + TURN_R + (s - LEG_A - LEG_B), dx: 0, dz: 1 };
}

/** three.js yaw for an object whose nose is local +x, travelling along (dx, dz). */
export const yawOf = (dx: number, dz: number) => Math.atan2(-dz, dx);

/** Loading position: the box lands on the trailer at x = -6. */
const LOAD_BOX_X = -6;
export const S_LOAD = LOAD_BOX_X + RIG_TO_BOX - ROAD_START_X;
/** Under the quay crane, the box sits at z = CRANE_Z. */
export const CRANE_Z = 220;
export const S_CRANE = LEG_A + LEG_B + (CRANE_Z + RIG_TO_BOX - (LANE_Z + TURN_R));
const S_PARK = 20;

/* ---- Quay crane, ship ------------------------------------------------------ */

/** Crane centre (between its rails); local +x points out over the water. */
export const CRANE_X = PIER_X + 1;
export const PIER_W = 34;
export const PIER_EAST = CRANE_X + PIER_W / 2;
export const PIER_Z0 = 70;
export const PIER_Z1 = 340;
export const WATER_Y = -1.5;

/** The feeder: centreline x when berthed, and its centre z. */
export const SHIP = {
  length: 180,
  beam: 28,
  /** Hatch-cover tops, above the waterline. */
  hatchTop: 7.5,
  x: PIER_EAST + 2.5 + 14,
  z: CRANE_Z - 9.0,
  /** Bay and row the hero box is stowed in (see the ship model). */
  bay: 5,
  row: 1,
  tier: 2,
} as const;

/** Bay centres along the ship (local z) and row centres across it (local x). */
export const bayZ = (bay: number) => -60 + bay * 13.8;
export const rowX = (row: number) => (row - 4.5) * 2.5;

/** Crane-local x of the stowage slot, and heights the spreader works between. */
export const SLOT_LOCAL_X = SHIP.x + rowX(SHIP.row) - CRANE_X;
export const SLOT_BOTTOM_Y = WATER_Y + SHIP.hatchTop + SHIP.tier * BOX.H;
const HOIST = 24;
const PICK = DECK_Y + BOX.H;
const DROP = SLOT_BOTTOM_Y + BOX.H;

/* ---- The story ------------------------------------------------------------- */

const stackerX = eased([
  [1.0, -18],
  [1.5, STACK_X - 7.5],
  [2.72, STACK_X - 7.5],
  [2.95, -6],
]);
const stackerZ = eased([
  [3.55, 0],
  [3.8, LANE_Z - 6.5],
  [3.98, LANE_Z - 6.5],
  [4.22, 1.0],
]);
const stackerYaw = eased([
  [2.95, 0],
  [3.38, -Math.PI / 2],
]);

const TIP_GRAB = STACK_TOP + STACKER.drop;
const TIP_PLACE = DECK_Y + BOX.H + STACKER.drop;
const tipX = eased([
  [1.15, 5.8],
  [1.5, 7.5],
  [2.72, 7.5],
  [2.95, 6.5],
  [3.98, 6.5],
  [4.25, 5.8],
]);
const tipY = eased([
  [1.15, 5.3],
  [1.5, TIP_GRAB + 0.9],
  [2.0, TIP_GRAB + 0.9],
  [2.3, TIP_GRAB],
  [2.42, TIP_GRAB],
  [2.72, TIP_GRAB + 1.75],
  [2.95, TIP_PLACE + 0.8],
  [3.8, TIP_PLACE + 0.8],
  [3.95, TIP_PLACE],
  [4.0, TIP_PLACE],
  [4.25, 5.3],
]);
const spread = eased([
  [1.45, 6.1],
  [1.85, BOX.L],
  [4.05, BOX.L],
  [4.35, 6.1],
]);

const truckIn = eased([
  [3.0, S_PARK],
  [3.55, S_LOAD],
]);
const truckOut = flowing([
  [4.12, S_LOAD],
  [4.6, S_LOAD + 82],
  [4.95, S_LOAD + 180],
  [5.36, S_CRANE],
]);

const trolley = eased([
  [5.7, -1],
  [5.84, SLOT_LOCAL_X],
]);
const hoist = eased([
  [5.45, HOIST],
  [5.55, PICK],
  [5.6, PICK],
  [5.7, HOIST],
  [5.84, HOIST],
  [5.93, DROP],
  [5.98, DROP],
  [6.08, HOIST],
]);

const shipRun = flowing([
  [6.08, 0],
  [6.6, 120],
  [7.0, 420],
  [8.0, 1150],
]);
const shipDrift = eased([
  [6.08, 0],
  [6.7, 26],
]);

export type Carrier = "stack" | "stacker" | "trailer" | "crane" | "ship";

export type State = {
  stacker: {
    x: number;
    z: number;
    yaw: number;
    /** Distance rolled forward, for the wheels. */
    roll: number;
    tipX: number;
    tipY: number;
    spread: number;
    locked: number;
  };
  truck: { s: number };
  crane: { trolley: number; hoist: number; locked: number };
  ship: { x: number; z: number; run: number; wake: number };
  plane: { u: number; visible: boolean };
  carrier: Carrier;
};

export function stateAt(T: number): State {
  const sx = stackerX(T);
  const sz = stackerZ(T);
  const truckS = T < 4.06 ? truckIn(T) : truckOut(T);

  let carrier: Carrier = "stack";
  if (T >= 2.36) carrier = "stacker";
  if (T >= 3.97) carrier = "trailer";
  if (T >= 5.58) carrier = "crane";
  if (T >= 5.96) carrier = "ship";

  const run = shipRun(T);
  return {
    stacker: {
      x: sx,
      z: sz,
      yaw: stackerYaw(T),
      roll: sx + 18 + sz,
      tipX: tipX(T),
      tipY: tipY(T),
      spread: spread(T),
      locked: seg(T, 2.3, 2.38) - seg(T, 3.95, 4.0),
    },
    truck: { s: truckS },
    crane: {
      trolley: trolley(T),
      hoist: hoist(T),
      locked: seg(T, 5.55, 5.6) - seg(T, 5.93, 5.98),
    },
    ship: {
      x: SHIP.x + shipDrift(T),
      z: SHIP.z + run,
      run,
      wake: smooth(seg(T, 6.1, 6.4)),
    },
    plane: { u: seg(T, 7.12, 8.0), visible: T > 6.95 },
    carrier,
  };
}

/* ---- Words ----------------------------------------------------------------- */

/** The chapter whose words should be showing, or -1 while the story moves on. */
export function shownChapter(T: number) {
  const index = Math.min(CHAPTERS - 1, Math.floor(Math.max(0, T)));
  const local = T - index;
  if (index < CHAPTERS - 1 && local > 0.88) return -1;
  return index;
}

/* ==========================================================================
 * SHIP IT INC. — BALANCE
 *
 * Every number that decides how the game feels lives here: where things sit
 * in the garage, how long a desk takes, what a website pays, what an upgrade
 * costs. The simulation reads these and nothing else, so tuning a run is an
 * edit to this file and never a hunt through the loop.
 *
 * World units are metres. x runs left to right across the screen, z runs from
 * the back wall (negative) towards the camera (positive). The front of the
 * garage is open, which is where clients walk in from.
 * ======================================================================== */

export type Vec = { x: number; z: number };

export type ItemKind = "brief" | "mockup" | "build";

export type StationId = "reception" | "design" | "frontend" | "deploy";

export type Box = { x: number; z: number; hx: number; hz: number };

export type StationDef = {
  id: StationId;
  label: string;
  kind: "reception" | "desk" | "deploy";
  /** Where the furniture sits. */
  x: number;
  z: number;
  /** The square on the floor you stand on to use it. */
  zone: Vec;
  /** What it takes from your arms, and what it puts on its out-tray. */
  accept: ItemKind | null;
  out: ItemKind | null;
  inMax: number;
  outMax: number;
  /** Seconds per item at 1x speed. */
  time: number;
  /** Solid footprint the player cannot walk through. */
  box: Box;
};

export const ROOM = { minX: -6.6, maxX: 6.6, minZ: -4.35, maxZ: 4.7 };

export const PLAYER = {
  start: { x: 0, z: 0.6 },
  speed: 4.3,
  accel: 22,
  radius: 0.34,
  carry: 4,
  /** Seconds between two items moving in or out of your arms. */
  transfer: 0.085,
};

export const STATIONS: StationDef[] = [
  {
    id: "reception",
    label: "Reception",
    kind: "reception",
    x: 4.75,
    z: 2.3,
    zone: { x: 3.75, z: 2.3 },
    accept: null,
    out: "brief",
    inMax: 0,
    outMax: 6,
    time: 0,
    box: { x: 4.75, z: 2.3, hx: 0.42, hz: 1.0 },
  },
  {
    id: "design",
    label: "Design",
    kind: "desk",
    x: -1.7,
    z: -3.55,
    zone: { x: -1.7, z: -2.3 },
    accept: "brief",
    out: "mockup",
    inMax: 8,
    outMax: 8,
    time: 1.7,
    box: { x: -1.7, z: -3.6, hx: 1.05, hz: 0.62 },
  },
  {
    id: "frontend",
    label: "Frontend",
    kind: "desk",
    x: 1.9,
    z: -3.55,
    zone: { x: 1.9, z: -2.3 },
    accept: "mockup",
    out: "build",
    inMax: 8,
    outMax: 8,
    time: 2.1,
    box: { x: 1.9, z: -3.6, hx: 1.05, hz: 0.62 },
  },
  {
    id: "deploy",
    label: "Deploy",
    kind: "deploy",
    x: -5.85,
    z: -0.6,
    zone: { x: -4.55, z: -0.6 },
    accept: "build",
    out: null,
    inMax: 6,
    outMax: 0,
    time: 0.75,
    box: { x: -5.95, z: -0.6, hx: 0.75, hz: 1.05 },
  },
];

export const ZONE_HALF = { x: 0.8, z: 0.66 };

/** Furniture that is not a station but still has to be walked around. */
export const PROPS: Box[] = [
  { x: 5.15, z: -3.95, hx: 1.45, hz: 0.5 }, // sofa
];

/* ---- Clients ------------------------------------------------------------ */

export const CLIENT = {
  speed: 2.5,
  /** Seconds between arrivals at 1x. */
  spawnEvery: 5.2,
  firstArrival: 1.2,
  maxQueue: 4,
  maxAlive: 13,
  handover: 0.45,
};

/** Clients walk up the lane east of the counter; the queue grows towards the camera. */
export const LANE_X = 5.85;
export const DOOR: Vec = { x: LANE_X, z: 8.5 };
export const queueSlot = (i: number): Vec => ({ x: LANE_X, z: 2.3 + i * 0.95 });

/** Sofa seats first, then standing spots along the right wall. */
export const SEATS: Vec[] = [
  { x: 4.35, z: -3.75 },
  { x: 5.15, z: -3.75 },
  { x: 5.95, z: -3.75 },
  { x: 6.35, z: -2.6 },
  { x: 6.35, z: -1.75 },
  { x: 6.35, z: -0.9 },
  { x: 6.35, z: -0.05 },
  { x: 4.2, z: -2.35 },
  { x: 4.2, z: -1.5 },
];

export const EXIT_X = 6.75;

/* ---- Money -------------------------------------------------------------- */

export const PRODUCTS = {
  website: { label: "Website", icon: "🌐", price: 12 },
} as const;

export type ProductId = keyof typeof PRODUCTS;

/** Payments land as a stack of bills you walk over to collect. */
export const BILL_VALUE = 3;
export const PILE: Vec = { x: -4.7, z: 1.75 };
export const PILE_RADIUS = 1.15;

/* ---- Upgrade pads ------------------------------------------------------- */

export type PadEffect = {
  carry?: number;
  deskSpeed?: number;
  frontendSpeed?: number;
  spawn?: number;
  walk?: number;
};

export type PadDef = {
  id: string;
  label: string;
  icon: string;
  cost: number;
  effect: PadEffect;
  /** A prop that appears in the garage once it is bought. */
  prop?: "coffee" | "neon" | "monitor" | "shoes";
};

/** Bought in this order. Two are on the floor at a time. */
export const PADS: PadDef[] = [
  { id: "arms", label: "Bigger arms", icon: "💪", cost: 30, effect: { carry: 2 } },
  {
    id: "coffee",
    label: "Coffee machine",
    icon: "☕",
    cost: 60,
    effect: { deskSpeed: 0.3 },
    prop: "coffee",
  },
  { id: "neon", label: "Neon sign", icon: "✨", cost: 90, effect: { spawn: 0.35 }, prop: "neon" },
  {
    id: "monitor",
    label: "Second monitor",
    icon: "🖥️",
    cost: 130,
    effect: { frontendSpeed: 0.45 },
    prop: "monitor",
  },
  { id: "shoes", label: "Running shoes", icon: "👟", cost: 160, effect: { walk: 0.18 } },
  { id: "arms2", label: "Gym membership", icon: "🏋️", cost: 220, effect: { carry: 3 } },
  {
    id: "espresso",
    label: "Espresso upgrade",
    icon: "⚡",
    cost: 300,
    effect: { deskSpeed: 0.35, spawn: 0.25 },
  },
];

export const PAD_SLOTS: Vec[] = [
  { x: -1.1, z: 3.05 },
  { x: 1.25, z: 3.05 },
];
export const PAD_HALF = 0.62;
/** You have to stand still on a pad this long before it starts taking money. */
export const PAD_ARM = 0.22;
/** A whole pad drains in about this many seconds, however expensive. */
export const PAD_DRAIN_SECONDS = 1.4;

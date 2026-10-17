import {
  BILL_VALUE,
  CLIENT,
  DOOR,
  EXIT_X,
  LANE_X,
  PAD_ARM,
  PAD_DRAIN_SECONDS,
  PAD_HALF,
  PAD_SLOTS,
  PADS,
  PILE,
  PILE_RADIUS,
  PLAYER,
  PRODUCTS,
  PROPS,
  ROOM,
  SEATS,
  STATIONS,
  ZONE_HALF,
  queueSlot,
  type Box,
  type ItemKind,
  type PadDef,
  type ProductId,
  type StationDef,
  type StationId,
  type Vec,
} from "./balance";

/* ==========================================================================
 * SHIP IT INC. — SIMULATION
 *
 * Plain TypeScript, no three.js and no DOM, so the whole game can be stepped
 * from a script to check its pacing. The renderer reads this state every frame
 * and never writes to it; the only way in is `input`, and the only way out
 * besides the state itself is `events`, a list of things that just happened
 * (an item moved, a client paid, a pad unlocked) that the renderer and the
 * audio drain once per frame.
 * ======================================================================== */

/** Where an item is. Used by the renderer to fly it from one place to the next. */
export type Ref =
  | { k: "player" }
  | { k: "in"; s: StationId }
  | { k: "out"; s: StationId }
  | { k: "client"; id: number };

export type SimEvent =
  | { t: "move"; item: ItemKind; from: Ref; to: Ref }
  | { t: "made"; s: StationId }
  | { t: "launch"; s: StationId }
  | { t: "pay"; amount: number; bills: number }
  | { t: "collect"; amount: number }
  | { t: "drain"; id: string }
  | { t: "unlock"; pad: PadDef }
  | { t: "arrive"; id: number };

export type StationState = {
  def: StationDef;
  inQ: number;
  outQ: number;
  /** Seconds into the current item. */
  t: number;
};

export type ClientState =
  | "toQueue" //  walking in or shuffling up the line
  | "handover" //  at the counter, handing over the brief
  | "toSeat"
  | "waiting" //  sitting, waiting for the product
  | "leaving";

export type Client = {
  id: number;
  x: number;
  z: number;
  heading: number;
  moving: boolean;
  state: ClientState;
  path: Vec[];
  product: ProductId;
  seat: number;
  /** Stable per client: picks the shirt, hair and accessories. */
  look: number;
  t: number;
  happy: boolean;
};

export type Pad = { def: PadDef; slot: number; paid: number; armed: number };

export type Objective = { text: string; target: Vec | null };

export class Sim {
  time = 0;
  cash = 0;
  earned = 0;
  shipped = 0;
  bought = 0;
  /** Ids of every pad bought so far, so props can be rebuilt from state alone. */
  owned: string[] = [];

  input = { x: 0, z: 0 };

  player = {
    x: PLAYER.start.x,
    z: PLAYER.start.z,
    vx: 0,
    vz: 0,
    heading: 0,
    moving: false,
    stack: [] as ItemKind[],
  };

  stations: Record<StationId, StationState>;
  clients: Client[] = [];
  queue: number[] = [];
  /** Clients sitting down, oldest first. The next build that ships is theirs. */
  waiting: number[] = [];
  pile = 0;
  pads: Pad[] = [];

  upgrades = { carry: PLAYER.carry, deskSpeed: 1, frontendSpeed: 1, spawn: 1, walk: 1 };

  events: SimEvent[] = [];

  private nextPad = 0;
  private padRespawn: { slot: number; at: number }[] = [];
  private spawnT = CLIENT.spawnEvery - CLIENT.firstArrival;
  private xferT = 0;
  private billT = 0;
  private padCarry = 0;
  private nextId = 1;
  private solids: Box[];

  constructor() {
    this.stations = Object.fromEntries(
      STATIONS.map((def) => [def.id, { def, inQ: 0, outQ: 0, t: 0 }]),
    ) as Record<StationId, StationState>;
    this.solids = [...STATIONS.map((s) => s.box), ...PROPS];
    PAD_SLOTS.forEach((_, slot) => this.placePad(slot));
  }

  /* ---------------------------------------------------------------------- */

  step(dt: number) {
    this.time += dt;
    this.movePlayer(dt);
    this.spawnClients(dt);
    this.updateClients(dt);
    this.updateStations(dt);
    this.interact(dt);
    this.updatePads(dt);
  }

  drain(): SimEvent[] {
    const out = this.events;
    this.events = [];
    return out;
  }

  /* ---- Player ----------------------------------------------------------- */

  private movePlayer(dt: number) {
    const p = this.player;
    let ix = this.input.x;
    let iz = this.input.z;
    const len = Math.hypot(ix, iz);
    if (len > 1) {
      ix /= len;
      iz /= len;
    }
    const speed = PLAYER.speed * this.upgrades.walk;
    const k = 1 - Math.exp(-PLAYER.accel * dt);
    p.vx += (ix * speed - p.vx) * k;
    p.vz += (iz * speed - p.vz) * k;

    p.x += p.vx * dt;
    p.z += p.vz * dt;

    const r = PLAYER.radius;
    for (const b of this.solids) {
      const dx = p.x - clamp(p.x, b.x - b.hx, b.x + b.hx);
      const dz = p.z - clamp(p.z, b.z - b.hz, b.z + b.hz);
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        p.x += (dx / d) * (r - d);
        p.z += (dz / d) * (r - d);
      } else {
        // Centre inside the box: push out along the shallowest side.
        const left = p.x - (b.x - b.hx);
        const right = b.x + b.hx - p.x;
        const back = p.z - (b.z - b.hz);
        const front = b.z + b.hz - p.z;
        const m = Math.min(left, right, back, front);
        if (m === left) p.x = b.x - b.hx - r;
        else if (m === right) p.x = b.x + b.hx + r;
        else if (m === back) p.z = b.z - b.hz - r;
        else p.z = b.z + b.hz + r;
      }
    }
    p.x = clamp(p.x, ROOM.minX, ROOM.maxX);
    p.z = clamp(p.z, ROOM.minZ, ROOM.maxZ);

    const sp = Math.hypot(p.vx, p.vz);
    p.moving = sp > 0.4;
    if (sp > 0.25) p.heading = turn(p.heading, Math.atan2(p.vx, p.vz), 14 * dt);
  }

  get carry() {
    return this.upgrades.carry;
  }

  /* ---- Clients ---------------------------------------------------------- */

  private spawnClients(dt: number) {
    this.spawnT += dt * this.upgrades.spawn;
    if (this.spawnT < CLIENT.spawnEvery) return;
    if (this.queue.length >= CLIENT.maxQueue || this.clients.length >= CLIENT.maxAlive) return;
    this.spawnT = 0;

    const c: Client = {
      id: this.nextId++,
      x: DOOR.x,
      z: DOOR.z,
      heading: Math.PI,
      moving: true,
      state: "toQueue",
      path: [],
      product: "website",
      seat: -1,
      look: Math.floor(Math.random() * 1e6),
      t: 0,
      happy: false,
    };
    this.clients.push(c);
    this.queue.push(c.id);
    c.path = [queueSlot(this.queue.length - 1)];
    this.events.push({ t: "arrive", id: c.id });
  }

  private client(id: number) {
    return this.clients.find((c) => c.id === id);
  }

  private updateClients(dt: number) {
    const reception = this.stations.reception;

    for (const c of this.clients) {
      c.moving = walk(c, CLIENT.speed, dt);

      switch (c.state) {
        case "toQueue": {
          const front = this.queue[0] === c.id;
          if (front && !c.moving) {
            c.state = "handover";
            c.t = 0;
            c.heading = turn(c.heading, -Math.PI / 2, 1);
          }
          break;
        }
        case "handover": {
          c.heading = turn(c.heading, -Math.PI / 2, 10 * dt);
          if (reception.outQ >= reception.def.outMax) break;
          c.t += dt;
          if (c.t < CLIENT.handover) break;
          reception.outQ++;
          this.events.push({
            t: "move",
            item: "brief",
            from: { k: "client", id: c.id },
            to: { k: "out", s: "reception" },
          });
          this.queue.shift();
          this.queue.forEach((id, i) => {
            const q = this.client(id);
            if (q) q.path = [queueSlot(i)];
          });
          c.seat = this.freeSeat();
          c.state = "toSeat";
          const seat = SEATS[c.seat] ?? SEATS[SEATS.length - 1]!;
          c.path = [{ x: LANE_X, z: 0.6 }, seat];
          this.waiting.push(c.id);
          break;
        }
        case "toSeat":
          if (!c.moving) {
            c.state = "waiting";
            c.heading = c.seat < 3 ? 0 : -Math.PI / 2;
          }
          break;
        case "waiting":
          break;
        case "leaving":
          break;
      }
    }

    // Gone once they are back out past the door.
    this.clients = this.clients.filter((c) => !(c.state === "leaving" && c.path.length === 0));
  }

  private freeSeat() {
    const taken = new Set(
      this.clients.filter((c) => c.state === "toSeat" || c.state === "waiting").map((c) => c.seat),
    );
    for (let i = 0; i < SEATS.length; i++) if (!taken.has(i)) return i;
    return SEATS.length - 1;
  }

  /* ---- Stations --------------------------------------------------------- */

  private updateStations(dt: number) {
    for (const st of Object.values(this.stations)) {
      const def = st.def;
      if (def.kind === "desk") {
        if (st.inQ === 0 || st.outQ >= def.outMax) {
          st.t = 0;
          continue;
        }
        const mul =
          this.upgrades.deskSpeed * (def.id === "frontend" ? this.upgrades.frontendSpeed : 1);
        st.t += dt * mul;
        if (st.t >= def.time) {
          st.t = 0;
          st.inQ--;
          st.outQ++;
          this.events.push({ t: "made", s: def.id });
        }
      } else if (def.kind === "deploy") {
        if (st.inQ === 0) {
          st.t = 0;
          continue;
        }
        st.t += dt;
        if (st.t >= def.time) {
          st.t = 0;
          st.inQ--;
          this.ship(def.id);
        }
      }
    }
  }

  private ship(s: StationId) {
    this.shipped++;
    this.events.push({ t: "launch", s });

    const id = this.waiting.shift();
    const c = id === undefined ? undefined : this.client(id);
    const price = PRODUCTS[c?.product ?? "website"].price;
    const bills = Math.round(price / BILL_VALUE);
    this.pile += bills;
    this.earned += bills * BILL_VALUE;
    this.events.push({ t: "pay", amount: bills * BILL_VALUE, bills });

    if (c) {
      c.state = "leaving";
      c.happy = true;
      c.path = [
        { x: EXIT_X, z: clamp(c.z + 0.6, -3, 0) },
        { x: EXIT_X, z: DOOR.z },
      ];
    }
  }

  /* ---- Player <-> world ------------------------------------------------- */

  /** The station whose floor square the player is standing in, if any. */
  zoneAt(): StationState | null {
    const p = this.player;
    for (const st of Object.values(this.stations)) {
      const z = st.def.zone;
      if (Math.abs(p.x - z.x) < ZONE_HALF.x && Math.abs(p.z - z.z) < ZONE_HALF.z) return st;
    }
    return null;
  }

  private interact(dt: number) {
    const p = this.player;
    this.xferT -= dt;
    this.billT -= dt;

    const st = this.zoneAt();
    if (st && this.xferT <= 0) {
      const def = st.def;
      const idx = def.accept ? p.stack.lastIndexOf(def.accept) : -1;
      if (def.accept && idx >= 0 && st.inQ < def.inMax) {
        p.stack.splice(idx, 1);
        st.inQ++;
        this.events.push({
          t: "move",
          item: def.accept,
          from: { k: "player" },
          to: { k: "in", s: def.id },
        });
        this.xferT = PLAYER.transfer;
      } else if (def.out && st.outQ > 0 && p.stack.length < this.carry) {
        st.outQ--;
        p.stack.push(def.out);
        this.events.push({
          t: "move",
          item: def.out,
          from: { k: "out", s: def.id },
          to: { k: "player" },
        });
        this.xferT = PLAYER.transfer;
      }
    }

    if (this.pile > 0 && this.billT <= 0 && Math.hypot(p.x - PILE.x, p.z - PILE.z) < PILE_RADIUS) {
      // Big piles empty faster, so collecting never becomes a chore.
      const n = this.pile > 24 ? 3 : this.pile > 10 ? 2 : 1;
      const take = Math.min(n, this.pile);
      this.pile -= take;
      this.cash += take * BILL_VALUE;
      this.events.push({ t: "collect", amount: take * BILL_VALUE });
      this.billT = 0.045;
    }
  }

  /* ---- Upgrade pads ----------------------------------------------------- */

  private placePad(slot: number) {
    const def = PADS[this.nextPad];
    if (!def) return;
    this.nextPad++;
    this.pads.push({ def, slot, paid: 0, armed: 0 });
  }

  private updatePads(dt: number) {
    const p = this.player;

    for (const r of this.padRespawn) if (this.time >= r.at) this.placePad(r.slot);
    this.padRespawn = this.padRespawn.filter((r) => this.time < r.at);

    for (const pad of this.pads) {
      const at = PAD_SLOTS[pad.slot]!;
      const on = Math.abs(p.x - at.x) < PAD_HALF && Math.abs(p.z - at.z) < PAD_HALF;
      if (!on) {
        pad.armed = 0;
        continue;
      }
      pad.armed += dt;
      if (pad.armed < PAD_ARM || this.cash <= 0) continue;

      const rate = pad.def.cost / PAD_DRAIN_SECONDS;
      this.padCarry += rate * dt;
      const take = Math.min(Math.floor(this.padCarry), this.cash, pad.def.cost - pad.paid);
      if (take <= 0) continue;
      this.padCarry -= take;
      this.cash -= take;
      pad.paid += take;
      this.events.push({ t: "drain", id: pad.def.id });

      if (pad.paid >= pad.def.cost) this.unlock(pad);
    }
    this.pads = this.pads.filter((pad) => pad.paid < pad.def.cost);
  }

  private unlock(pad: Pad) {
    const e = pad.def.effect;
    const u = this.upgrades;
    if (e.carry) u.carry += e.carry;
    if (e.deskSpeed) u.deskSpeed += e.deskSpeed;
    if (e.frontendSpeed) u.frontendSpeed += e.frontendSpeed;
    if (e.spawn) u.spawn += e.spawn;
    if (e.walk) u.walk += e.walk;
    this.bought++;
    this.owned.push(pad.def.id);
    this.padCarry = 0;
    this.events.push({ t: "unlock", pad: pad.def });
    this.padRespawn.push({ slot: pad.slot, at: this.time + 0.9 });
  }

  /* ---- Guidance --------------------------------------------------------- */

  /**
   * What a new player should do next, and where. Reads the state the way a
   * person standing in the garage would: hands full means go and drop, hands
   * empty means go and fetch the most finished thing there is.
   */
  objective(): Objective {
    const p = this.player;
    const s = this.stations;
    const zone = (id: StationId) => s[id].def.zone;

    if (this.pile >= 4 && p.stack.length === 0) return { text: "Pick up your cash", target: PILE };
    // Empty-handed with money to spend: an upgrade is worth more than one more trip.
    const affordable = this.pads.find((x) => x.def.cost - x.paid <= this.cash);
    if (affordable && p.stack.length === 0)
      return { text: `Buy ${affordable.def.label}`, target: PAD_SLOTS[affordable.slot]! };

    const top = p.stack[p.stack.length - 1];
    if (top === "build") return { text: "Ship the build at Deploy", target: zone("deploy") };
    if (top === "mockup") return { text: "Take the mockups to Frontend", target: zone("frontend") };
    if (top === "brief" && p.stack.length >= this.carry)
      return { text: "Drop the briefs at the Design desk", target: zone("design") };

    if (p.stack.length < this.carry) {
      if (s.frontend.outQ > 0)
        return { text: "Grab the finished builds", target: zone("frontend") };
      if (s.design.outQ > 0) return { text: "Grab the mockups", target: zone("design") };
      if (s.reception.outQ > 0 || this.queue.length > 0)
        return { text: "Collect client briefs at Reception", target: zone("reception") };
    }
    if (top === "brief")
      return { text: "Drop the briefs at the Design desk", target: zone("design") };

    if (this.pile > 0) return { text: "Pick up your cash", target: PILE };
    return { text: "Waiting for clients…", target: null };
  }
}

/* ---- helpers ------------------------------------------------------------ */

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Rotate `from` towards `to` by at most `max` radians, the short way round. */
export function turn(from: number, to: number, max: number) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + clamp(d, -max, max);
}

/** Advance along a waypoint path. Returns whether the walker moved. */
function walk(
  w: { x: number; z: number; heading: number; path: Vec[] },
  speed: number,
  dt: number,
) {
  const next = w.path[0];
  if (!next) return false;
  const dx = next.x - w.x;
  const dz = next.z - w.z;
  const d = Math.hypot(dx, dz);
  const stepLen = speed * dt;
  if (d <= stepLen) {
    w.x = next.x;
    w.z = next.z;
    w.path.shift();
    return w.path.length > 0 || d > 1e-3;
  }
  w.x += (dx / d) * stepLen;
  w.z += (dz / d) * stepLen;
  w.heading = turn(w.heading, Math.atan2(dx, dz), 10 * dt);
  return true;
}

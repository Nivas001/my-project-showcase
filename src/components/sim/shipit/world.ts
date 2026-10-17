import * as THREE from "three";
import "./shipit.css";
import {
  BILL_VALUE,
  PAD_SLOTS,
  PADS,
  PILE,
  PRODUCTS,
  ROOM,
  STATIONS,
  ZONE_HALF,
  type ItemKind,
  type StationId,
} from "./balance";
import { Sim, type Ref, type SimEvent } from "./sim";
import {
  BILL_H,
  ITEM_H,
  PALETTE,
  PLAYER_LOOK,
  box,
  disposeMaterials,
  floorTexture,
  lookFromSeed,
  makeArrow,
  makeBill,
  makeCharacter,
  makeCoffeeMachine,
  makeDeploy,
  makeDesk,
  makeItem,
  makeNeonSign,
  makePad,
  makePlant,
  makePoster,
  makePuff,
  makeReception,
  makeRocket,
  makeShelf,
  makeSofa,
  makeStringLights,
  makeTree,
  makeWhiteboard,
  makeWindow,
  makeZone,
  mat,
  poseCharacter,
  rugTexture,
  type DeskModel,
  type Rig,
} from "./models";

/* ==========================================================================
 * SHIP IT INC. — WORLD
 *
 * The three.js side. It owns the scene, steps the simulation on a fixed 60 Hz
 * clock, and turns what the simulation says happened into motion: items arc
 * from one tray to the next, bills fly to the pile and then to you, rockets
 * leave the launch pad. Labels that have to stay crisp (station names, prices,
 * client bubbles) are plain DOM elements pinned to 3D positions, which is far
 * cheaper and sharper than rendering text into textures.
 *
 * Nothing in here decides anything about the game. If a number feels wrong,
 * it is in balance.ts.
 * ======================================================================== */

export type WorldCallbacks = {
  /** Everything the simulation reported this frame, for sound and the HUD. */
  onEvents: (events: SimEvent[]) => void;
  /** A bill reached the player; screen coordinates for the HUD coin flight. */
  onCollect: (x: number, y: number, amount: number) => void;
  /** Read once per simulation step: the direction the player wants to walk. */
  input: () => { x: number; z: number };
};

export type ShipItWorld = {
  sim: Sim;
  start: () => void;
  stop: () => void;
  setPaused: (p: boolean) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

const STEP = 1 / 60;

export function createShipIt(
  canvas: HTMLCanvasElement,
  overlay: HTMLElement,
  cb: WorldCallbacks,
  opts: { quality: "high" | "low"; reducedMotion: boolean },
): ShipItWorld {
  const sim = new Sim();

  /* ---- Renderer, scene, camera ---------------------------------------- */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.quality === "high" ? 2 : 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(PALETTE.sky, 32, 75);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 120);
  const camDir = new THREE.Vector3(0, 13, 11).normalize();
  let camDist = 18;
  const camTarget = new THREE.Vector3(0, 0, 0.3);
  let viewW = 1;
  let viewH = 1;

  const hemi = new THREE.HemisphereLight("#fff7ea", "#c7b394", 1.35);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff0da", 2.1);
  sun.position.set(6, 14, 8);
  sun.castShadow = true;
  const sm = opts.quality === "high" ? 2048 : 1024;
  sun.shadow.mapSize.set(sm, sm);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 3;
  scene.add(sun);
  scene.add(sun.target);

  /* ---- Environment ---------------------------------------------------- */

  const grass = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), mat(PALETTE.grass));
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = -0.06;
  grass.receiveShadow = true;
  scene.add(grass);

  const drive = box(3.4, 0.04, 16, PALETTE.asphalt, 6.1, -0.04, 12.5, { cast: false });
  scene.add(drive);
  for (let i = 0; i < 5; i++)
    scene.add(box(0.12, 0.045, 0.9, "#f1f1ee", 6.1, -0.02, 6.2 + i * 2.2, { cast: false }));
  scene.add(box(30, 0.05, 1.6, "#d9d4cb", 0, -0.035, 6.2, { cast: false }));

  const ftex = floorTexture();
  ftex.repeat.set(7, 5);
  const floorMat = new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.92 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.12, 10.3), [
    mat(PALETTE.wallShade),
    mat(PALETTE.wallShade),
    floorMat,
    mat(PALETTE.wallShade),
    mat(PALETTE.wallShade),
    mat(PALETTE.wallShade),
  ]);
  slab.position.set(0, -0.06, -0.05);
  slab.receiveShadow = true;
  scene.add(slab);

  const wallMat = mat(PALETTE.wall);
  const backWall = box(14.9, 3.3, 0.3, wallMat, 0, 1.65, -5.2);
  const leftWall = box(0.3, 3.3, 10.3, wallMat, -7.3, 1.65, -0.05);
  const rightWall = box(0.3, 3.3, 10.3, wallMat, 7.3, 1.65, -0.05);
  scene.add(backWall, leftWall, rightWall);
  scene.add(box(14.6, 0.16, 0.06, PALETTE.trim, 0, 0.08, -5.03, { cast: false }));
  scene.add(box(0.06, 0.16, 10.2, PALETTE.trim, -7.13, 0.08, -0.05, { cast: false }));
  scene.add(box(0.06, 0.16, 10.2, PALETTE.trim, 7.13, 0.08, -0.05, { cast: false }));
  // Wall caps, so the cutaway reads as a thick wall rather than paper.
  scene.add(box(14.9, 0.06, 0.34, PALETTE.trim, 0, 3.32, -5.2, { cast: false }));
  scene.add(box(0.34, 0.06, 10.3, PALETTE.trim, -7.3, 3.32, -0.05, { cast: false }));
  scene.add(box(0.34, 0.06, 10.3, PALETTE.trim, 7.3, 3.32, -0.05, { cast: false }));

  const onBack = (o: THREE.Object3D, x: number, y: number) => {
    o.position.set(x, y, -5.03);
    scene.add(o);
  };
  const onLeft = (o: THREE.Object3D, z: number, y: number) => {
    o.position.set(-7.13, y, z);
    o.rotation.y = Math.PI / 2;
    scene.add(o);
  };
  const onRight = (o: THREE.Object3D, z: number, y: number) => {
    o.position.set(7.13, y, z);
    o.rotation.y = -Math.PI / 2;
    scene.add(o);
  };

  onBack(makeWindow(1.6, 1.05), -4.7, 1.95);
  onBack(makeWhiteboard(), 0.1, 1.85);
  onBack(
    makePoster("SHIP\nIT", "v0.1 · garage", PALETTE.yellow, PALETTE.ink, 0.8, 1.05),
    -3.3,
    2.15,
  );
  onBack(makePoster("MOVE\nFAST", "fix things", PALETTE.blue, "#ffffff", 0.8, 1.05), 3.45, 2.15);
  onBack(makeStringLights(13), 0, 3.0);
  onLeft(makeShelf(), 2.8, 1.25);
  onLeft(makePoster("localhost", ":3000", PALETTE.ink, PALETTE.yellow, 1.1, 0.8), -3.2, 2.0);
  onRight(makeWindow(1.4, 1.0), -1.4, 1.95);
  onRight(
    makePoster("CLIENTS\nWELCOME", "please wait here", PALETTE.teal, "#ffffff", 0.9, 1.1),
    1.4,
    2.0,
  );

  const neon = makeNeonSign();
  neon.position.set(5.15, 2.5, -5.02);
  neon.visible = false;
  scene.add(neon);

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 2.6),
    new THREE.MeshStandardMaterial({ map: rugTexture(), transparent: true, roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-0.2, 0.008, 0.6);
  rug.receiveShadow = true;
  scene.add(rug);

  const sofa = makeSofa();
  sofa.position.set(5.15, 0, -4.4);
  scene.add(sofa);

  for (const [x, z, s] of [
    [-6.45, 4.25, 1.1],
    [3.45, -4.5, 0.9],
    [-6.5, -4.5, 1.0],
  ] as const) {
    const p = makePlant(s);
    p.position.set(x, 0, z);
    scene.add(p);
  }
  for (const [x, z, s] of [
    [-9.6, -2.5, 1.3],
    [-9.2, 3.5, 1.0],
    [-11.5, 0.5, 1.5],
    [9.9, -3.0, 1.2],
    [10.4, 2.6, 1.4],
    [-5.5, 9.5, 1.2],
    [-2, 11, 1.0],
    [12, 9, 1.6],
  ] as const) {
    const t = makeTree(s);
    t.position.set(x, 0, z);
    scene.add(t);
  }

  const coffee = makeCoffeeMachine();
  coffee.position.set(-4.35, 0, -4.7);
  coffee.visible = false;
  scene.add(coffee);

  /* ---- Stations ------------------------------------------------------- */

  const reception = makeReception();
  const desks: Partial<Record<StationId, DeskModel>> = {};
  const deploy = makeDeploy();
  const anchors: Record<string, THREE.Object3D> = {};
  const zones: Partial<Record<StationId, THREE.Mesh>> = {};

  for (const def of STATIONS) {
    let group: THREE.Group;
    if (def.kind === "reception") {
      group = reception.group;
      anchors[`out:${def.id}`] = reception.outAnchor;
    } else if (def.kind === "desk") {
      const d = makeDesk(def.id === "design" ? PALETTE.purple : PALETTE.blue, def.id === "design");
      desks[def.id] = d;
      group = d.group;
      anchors[`in:${def.id}`] = d.inAnchor;
      anchors[`out:${def.id}`] = d.outAnchor;
    } else {
      group = deploy.group;
      anchors[`in:${def.id}`] = deploy.inAnchor;
    }
    group.position.set(def.x, 0, def.z);
    scene.add(group);

    const z = makeZone(ZONE_HALF.x * 2, ZONE_HALF.z * 2);
    z.position.x = def.zone.x;
    z.position.z = def.zone.z;
    scene.add(z);
    zones[def.id] = z;
  }

  /* ---- Characters ----------------------------------------------------- */

  const player = makeCharacter(PLAYER_LOOK);
  scene.add(player.root);
  let playerPhase = 0;

  const clientRigs = new Map<number, { rig: Rig; phase: number; bubble: Label; joy: number }>();

  /* ---- Pools ---------------------------------------------------------- */

  const itemPool: Record<ItemKind, THREE.Group[]> = { brief: [], mockup: [], build: [] };
  const getItem = (k: ItemKind) => itemPool[k].pop() ?? makeItem(k);
  const putItem = (k: ItemKind, g: THREE.Group) => {
    g.removeFromParent();
    itemPool[k].push(g);
  };

  /** Items currently shown in each container, keyed like `in:design`. */
  const shown = new Map<string, { kind: ItemKind; mesh: THREE.Group }[]>();

  const billPool: THREE.Mesh[] = [];
  const pileBills: THREE.Mesh[] = [];
  const getBill = () => billPool.pop() ?? makeBill();

  /* ---- Overlay labels ------------------------------------------------- */

  type Label = { el: HTMLElement; pos: THREE.Vector3; visible: boolean };
  const labels = new Set<Label>();
  const tmp = new THREE.Vector3();

  const label = (html: string, className: string): Label => {
    const el = document.createElement("div");
    el.className = className;
    el.innerHTML = html;
    overlay.appendChild(el);
    const l = { el, pos: new THREE.Vector3(), visible: true };
    labels.add(l);
    return l;
  };
  const dropLabel = (l: Label) => {
    l.el.remove();
    labels.delete(l);
  };

  const toScreen = (v: THREE.Vector3) => {
    tmp.copy(v).project(camera);
    return { x: ((tmp.x + 1) / 2) * viewW, y: ((1 - tmp.y) / 2) * viewH, behind: tmp.z > 1 };
  };

  const placeLabels = () => {
    for (const l of labels) {
      if (!l.visible) {
        l.el.style.visibility = "hidden";
        continue;
      }
      const s = toScreen(l.pos);
      l.el.style.visibility = s.behind ? "hidden" : "visible";
      l.el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
    }
  };

  /** A "+$12" that rises and fades, then removes itself. */
  const floatText = (text: string, at: THREE.Vector3, tone: "cash" | "info" = "cash") => {
    const s = toScreen(at);
    const el = document.createElement("div");
    el.className = `si-float si-float-${tone}`;
    el.textContent = text;
    el.style.left = `${s.x}px`;
    el.style.top = `${s.y}px`;
    overlay.appendChild(el);
    window.setTimeout(() => el.remove(), 1300);
  };

  const stationLabels = new Map<
    StationId,
    { l: Label; count: HTMLElement; ring: SVGCircleElement }
  >();
  const LABEL_Y: Record<StationId, number> = {
    reception: 2.05,
    design: 2.15,
    frontend: 2.15,
    deploy: 2.75,
  };
  for (const def of STATIONS) {
    const l = label(
      `<div class="si-station"><svg class="si-ring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" class="si-ring-bg"/><circle cx="12" cy="12" r="9.5" class="si-ring-fg"/></svg><span class="si-station-name">${def.label}</span><span class="si-station-count"></span></div>`,
      "si-label",
    );
    l.pos.set(
      def.x + (def.kind === "deploy" ? 0.4 : 0),
      LABEL_Y[def.id],
      def.z + (def.kind === "desk" ? 0.1 : 0),
    );
    stationLabels.set(def.id, {
      l,
      count: l.el.querySelector(".si-station-count") as HTMLElement,
      ring: l.el.querySelectorAll("circle")[1] as SVGCircleElement,
    });
  }

  const maxLabel = label(`<div class="si-max">MAX</div>`, "si-label");
  maxLabel.visible = false;

  /* ---- Pads ----------------------------------------------------------- */

  const padViews = new Map<
    string,
    { group: THREE.Group; fill: THREE.Object3D; l: Label; price: HTMLElement; born: number }
  >();

  /* ---- Objective arrow ------------------------------------------------ */

  const arrow = makeArrow();
  arrow.visible = false;
  scene.add(arrow);

  /* ---- Transient effects ---------------------------------------------- */

  type Flyer = {
    mesh: THREE.Object3D;
    from: THREE.Vector3;
    to: () => THREE.Vector3;
    t: number;
    dur: number;
    delay: number;
    arc: number;
    done: () => void;
  };
  const flyers: Flyer[] = [];
  const pending = new Map<string, number>();
  const bump = (key: string, d: number) => pending.set(key, (pending.get(key) ?? 0) + d);
  let pilePending = 0;

  type Rocket = {
    group: THREE.Group;
    flame: THREE.Mesh;
    t: number;
    x: number;
    z: number;
    puffT: number;
  };
  const rockets: Rocket[] = [];
  type Puff = { mesh: THREE.Mesh; vel: THREE.Vector3; t: number; life: number; grow: number };
  const puffs: Puff[] = [];
  const confetti: { mesh: THREE.Mesh; vel: THREE.Vector3; spin: THREE.Vector3; t: number }[] = [];
  const pops: { obj: THREE.Object3D; t: number; base: number }[] = [];

  const keyOf = (r: Ref) =>
    r.k === "player" ? "player" : r.k === "client" ? `client:${r.id}` : `${r.k}:${r.s}`;

  /** World position of the n-th slot of a container. */
  const slotPos = (key: string, index: number, kind: ItemKind, out = new THREE.Vector3()) => {
    if (key === "player") {
      let h = 0;
      const stack = sim.player.stack;
      for (let i = 0; i < index; i++) h += ITEM_H[stack[i] ?? kind];
      out.set(0, h, 0);
      player.hands.localToWorld(out);
      return out;
    }
    if (key.startsWith("client:")) {
      const c = sim.clients.find((x) => `client:${x.id}` === key);
      return out.set(c?.x ?? 0, 0.9, c?.z ?? 0);
    }
    const a = anchors[key];
    if (!a) return out.set(0, 0, 0);
    const cap = kind === "build" ? 4 : 10;
    const col = Math.floor(index / cap);
    out.set(0, (index % cap) * ITEM_H[kind], -col * 0.34);
    a.localToWorld(out);
    return out;
  };

  const fly = (kind: ItemKind, from: Ref, to: Ref, fromIndex: number) => {
    const fromKey = keyOf(from);
    const toKey = keyOf(to);
    const start = slotPos(fromKey, fromIndex, kind);
    const mesh = getItem(kind);
    scene.add(mesh);
    bump(toKey, 1);
    flyers.push({
      mesh,
      from: start,
      to: () => {
        const count = countOf(toKey);
        const p = pending.get(toKey) ?? 0;
        return slotPos(toKey, Math.max(0, count - p), kind);
      },
      t: 0,
      dur: 0.24,
      delay: 0,
      arc: 0.7,
      done: () => {
        bump(toKey, -1);
        putItem(kind, mesh);
      },
    });
  };

  const countOf = (key: string) => {
    if (key === "player") return sim.player.stack.length;
    if (key.startsWith("client:")) return 0;
    const [side, id] = key.split(":") as ["in" | "out", StationId];
    const st = sim.stations[id];
    return side === "in" ? st.inQ : st.outQ;
  };

  const pileSlot = (i: number, out = new THREE.Vector3()) => {
    const layer = Math.floor(i / 4);
    const j = i % 4;
    return out.set(
      PILE.x + (j % 2 ? 0.19 : -0.19),
      BILL_H / 2 + layer * BILL_H,
      PILE.z + (j < 2 ? -0.1 : 0.1),
    );
  };

  const padPos = new THREE.Vector3();
  const deployPadWorld = () => deploy.pad.getWorldPosition(padPos).clone();

  const spawnConfetti = (at: THREE.Vector3, n = 26) => {
    const cols = [
      PALETTE.yellow,
      PALETTE.pink,
      PALETTE.teal,
      PALETTE.blue,
      PALETTE.orange,
      PALETTE.green,
    ];
    for (let i = 0; i < n; i++) {
      const m = box(0.08, 0.02, 0.12, mat(cols[i % cols.length]!), at.x, at.y, at.z, {
        cast: false,
        receive: false,
      });
      scene.add(m);
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 2.5;
      confetti.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(a) * s, 4 + Math.random() * 3, Math.sin(a) * s),
        spin: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
        t: 0,
      });
    }
  };

  const popIn = (obj: THREE.Object3D) => {
    obj.visible = true;
    pops.push({ obj, t: 0, base: obj.scale.x || 1 });
    obj.scale.setScalar(0.001);
  };

  /* ---- Event handling ------------------------------------------------- */

  const handle = (events: SimEvent[]) => {
    for (const e of events) {
      switch (e.t) {
        case "move": {
          // The state has already changed; the item left the slot that is now
          // one past the end of its source.
          const fromKey = keyOf(e.from);
          const idx = e.from.k === "player" ? sim.player.stack.length : countOf(fromKey);
          fly(e.item, e.from, e.to, idx);
          break;
        }
        case "launch": {
          const r = makeRocket();
          const p = deployPadWorld();
          r.group.position.set(p.x, 0.1, p.z);
          scene.add(r.group);
          rockets.push({ group: r.group, flame: r.flame, t: 0, x: p.x, z: p.z, puffT: 0 });
          deploy.leds.forEach((l) => (l.emissiveIntensity = 2.4));
          break;
        }
        case "pay": {
          const from = deployPadWorld().add(new THREE.Vector3(0, 0.6, 0));
          floatText(`+$${e.amount}`, from.clone().add(new THREE.Vector3(0, 1.2, 0)));
          pilePending += e.bills;
          for (let i = 0; i < e.bills; i++) {
            const b = getBill();
            scene.add(b);
            flyers.push({
              mesh: b,
              from: from.clone(),
              to: () => pileSlot(Math.max(0, sim.pile - pilePending)),
              t: 0,
              dur: 0.42,
              delay: 0.25 + i * 0.07,
              arc: 1.3,
              done: () => {
                pilePending--;
                b.removeFromParent();
                billPool.push(b);
              },
            });
          }
          break;
        }
        case "collect": {
          const n = Math.max(1, Math.round(e.amount / BILL_VALUE));
          for (let i = 0; i < n; i++) {
            const b = getBill();
            scene.add(b);
            const start = pileSlot(Math.max(0, sim.pile - pilePending + i));
            flyers.push({
              mesh: b,
              from: start,
              to: () => player.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)),
              t: 0,
              dur: 0.2,
              delay: i * 0.02,
              arc: 0.5,
              done: () => {
                b.removeFromParent();
                billPool.push(b);
                const s = toScreen(player.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
                cb.onCollect(s.x, s.y, BILL_VALUE);
              },
            });
          }
          break;
        }
        case "unlock": {
          const view = padViews.get(e.pad.id);
          const at = view ? view.group.position.clone() : player.root.position.clone();
          spawnConfetti(at.add(new THREE.Vector3(0, 0.4, 0)));
          floatText(
            `${e.pad.icon} ${e.pad.label}!`,
            at.clone().add(new THREE.Vector3(0, 1.6, 0)),
            "info",
          );
          break;
        }
        case "made":
        case "arrive":
          break;
        case "drain":
          break;
      }
    }
  };

  /* ---- Per-frame sync ------------------------------------------------- */

  const syncContainer = (
    key: string,
    kinds: ItemKind[],
    place: (i: number, m: THREE.Group) => void,
  ) => {
    let list = shown.get(key);
    if (!list) {
      list = [];
      shown.set(key, list);
    }
    // Rebuild only from the first slot whose kind changed.
    let same = 0;
    while (same < list.length && same < kinds.length && list[same]!.kind === kinds[same]) same++;
    for (let i = list.length - 1; i >= same; i--) putItem(list[i]!.kind, list[i]!.mesh);
    list.length = same;
    for (let i = same; i < kinds.length; i++)
      list.push({ kind: kinds[i]!, mesh: getItem(kinds[i]!) });
    list.forEach((it, i) => place(i, it.mesh));
  };

  const stackLean = new THREE.Vector2();

  const syncPlayer = (dt: number) => {
    const p = sim.player;
    player.root.position.set(p.x, 0, p.z);
    player.root.rotation.y = p.heading;
    const speed = Math.hypot(p.vx, p.vz);
    playerPhase += speed * dt * 3.1;
    const shownCount = Math.max(0, p.stack.length - (pending.get("player") ?? 0));
    poseCharacter(player, playerPhase, p.moving, p.stack.length > 0, dt);

    // The stack leans against the direction of travel and springs back.
    const cos = Math.cos(-p.heading);
    const sin = Math.sin(-p.heading);
    const lx = p.vx * cos - p.vz * sin;
    const lz = p.vx * sin + p.vz * cos;
    const k = 1 - Math.exp(-8 * dt);
    stackLean.x += (-lx * 0.012 - stackLean.x) * k;
    stackLean.y += (-lz * 0.012 - stackLean.y) * k;

    let h = 0;
    syncContainer("player", p.stack.slice(0, shownCount), (i, m) => {
      if (m.parent !== player.hands) player.hands.add(m);
      m.position.set(stackLean.x * i, h, stackLean.y * i);
      m.rotation.set(0, Math.sin(i * 1.7) * 0.06, 0);
      h += ITEM_H[p.stack[i]!];
    });

    const full = p.stack.length >= sim.carry;
    maxLabel.visible = full;
    maxLabel.pos.set(p.x, 1.75 + h * 0.6, p.z);
  };

  const syncStations = (dt: number) => {
    for (const def of STATIONS) {
      const st = sim.stations[def.id];
      if (def.accept) {
        const key = `in:${def.id}`;
        const n = Math.max(0, st.inQ - (pending.get(key) ?? 0));
        syncContainer(key, Array(n).fill(def.accept), (i, m) => {
          const a = anchors[key]!;
          if (m.parent !== a.parent) a.parent!.add(m);
          const cap = def.accept === "build" ? 4 : 10;
          m.position.set(
            a.position.x,
            a.position.y + (i % cap) * ITEM_H[def.accept!],
            a.position.z - Math.floor(i / cap) * 0.34,
          );
          m.rotation.set(0, (i % 2 ? 1 : -1) * 0.04, 0);
        });
      }
      if (def.out) {
        const key = `out:${def.id}`;
        const n = Math.max(0, st.outQ - (pending.get(key) ?? 0));
        syncContainer(key, Array(n).fill(def.out), (i, m) => {
          const a = anchors[key]!;
          if (m.parent !== a.parent) a.parent!.add(m);
          const cap = def.out === "build" ? 4 : 10;
          m.position.set(
            a.position.x,
            a.position.y + (i % cap) * ITEM_H[def.out!],
            a.position.z - Math.floor(i / cap) * 0.34,
          );
          m.rotation.set(0, (i % 2 ? 1 : -1) * 0.04, 0);
        });
      }

      // Monitors scroll while the desk is busy.
      const d = desks[def.id];
      const busy = st.t > 0;
      if (d) {
        if (busy) d.screen.offset.y -= dt * 0.35;
        d.screenMat.emissiveIntensity +=
          ((busy ? 0.75 : 0.45) - d.screenMat.emissiveIntensity) * 0.1;
      }

      const sl = stationLabels.get(def.id)!;
      const progress = def.time > 0 ? st.t / def.time : 0;
      const C = 2 * Math.PI * 9.5;
      sl.ring.style.strokeDasharray = `${C}`;
      sl.ring.style.strokeDashoffset = `${C * (1 - progress)}`;
      sl.l.el.classList.toggle("is-busy", busy);
      const count =
        def.kind === "reception"
          ? `${st.outQ}/${def.outMax}`
          : def.kind === "deploy"
            ? `${st.inQ}`
            : `${st.inQ} → ${st.outQ}`;
      if (sl.count.textContent !== count) sl.count.textContent = count;
    }

    deploy.leds.forEach((l, i) => {
      l.emissiveIntensity +=
        (1.0 + Math.sin(clock * 6 + i * 1.3) * 0.35 - l.emissiveIntensity) * 0.08;
    });

    const inZone = sim.zoneAt()?.def.id;
    for (const def of STATIONS) {
      const z = zones[def.id]!;
      const m = z.material as THREE.MeshBasicMaterial;
      const target = inZone === def.id ? 0.95 : 0.4;
      m.opacity += (target - m.opacity) * 0.15;
    }
  };

  const syncClients = (dt: number) => {
    const alive = new Set<number>();
    for (const c of sim.clients) {
      alive.add(c.id);
      let v = clientRigs.get(c.id);
      if (!v) {
        const rig = makeCharacter(lookFromSeed(c.look), 0.96);
        scene.add(rig.root);
        const bubble = label(
          `<div class="si-bubble">${PRODUCTS[c.product].icon}</div>`,
          "si-label",
        );
        v = { rig, phase: Math.random() * 6, bubble, joy: 0 };
        clientRigs.set(c.id, v);
      }
      v.rig.root.position.set(c.x, 0, c.z);
      v.rig.root.rotation.y = c.heading;
      if (c.moving) v.phase += dt * CLIENT_STEP;
      const seated = c.state === "waiting" && c.seat < 3;
      poseCharacter(v.rig, v.phase, c.moving, c.state === "toQueue" || c.state === "handover", dt);
      v.rig.root.position.y = seated ? -0.12 : 0;

      // Happy hop on the way out.
      if (c.happy) {
        v.joy += dt;
        if (v.joy < 0.6)
          v.rig.root.position.y = Math.abs(Math.sin(v.joy * 10)) * 0.25 * (1 - v.joy / 0.6);
      }

      const b = v.bubble;
      const showBubble = c.state !== "leaving" || v.joy < 1.4;
      b.visible = showBubble;
      b.pos.set(c.x, 1.95, c.z);
      const icon =
        c.state === "leaving"
          ? "💖"
          : c.state === "waiting" || c.state === "toSeat"
            ? "⏳"
            : PRODUCTS[c.product].icon;
      const inner = b.el.firstElementChild as HTMLElement;
      if (inner.dataset["icon"] !== icon) {
        inner.dataset["icon"] = icon;
        inner.textContent = icon;
        inner.classList.toggle("is-small", icon === "⏳");
        inner.classList.toggle("is-love", icon === "💖");
      }
    }
    for (const [id, v] of clientRigs) {
      if (alive.has(id)) continue;
      v.rig.root.removeFromParent();
      disposeTree(v.rig.root);
      dropLabel(v.bubble);
      clientRigs.delete(id);
    }
  };

  const syncPile = () => {
    const n = Math.min(80, Math.max(0, sim.pile - pilePending));
    while (pileBills.length < n) {
      const b = getBill();
      pileSlot(pileBills.length, b.position);
      b.rotation.y = (Math.random() - 0.5) * 0.25;
      scene.add(b);
      pileBills.push(b);
    }
    while (pileBills.length > n) {
      const b = pileBills.pop()!;
      b.removeFromParent();
      billPool.push(b);
    }
  };

  const syncPads = (dt: number) => {
    const live = new Set(sim.pads.map((p) => p.def.id));
    for (const pad of sim.pads) {
      let v = padViews.get(pad.def.id);
      if (!v) {
        const { group, fill } = makePad();
        const at = PAD_SLOTS[pad.slot]!;
        group.position.set(at.x, 0, at.z);
        scene.add(group);
        const l = label(
          `<div class="si-pad"><span class="si-pad-icon">${pad.def.icon}</span><span class="si-pad-name">${pad.def.label}</span><span class="si-pad-price"></span></div>`,
          "si-label si-label-pad",
        );
        l.pos.set(at.x, 0.05, at.z);
        v = {
          group,
          fill,
          l,
          price: l.el.querySelector(".si-pad-price") as HTMLElement,
          born: clock,
        };
        padViews.set(pad.def.id, v);
        group.scale.setScalar(0.001);
      }
      const age = clock - v.born;
      v.group.scale.setScalar(age < 0.5 ? elastic(age / 0.5) : 1);
      const f = pad.paid / pad.def.cost;
      v.fill.scale.z += (Math.max(0.0001, f) - v.fill.scale.z) * Math.min(1, dt * 18);
      const price = `$${pad.def.cost - pad.paid}`;
      if (v.price.textContent !== price) v.price.textContent = price;
      v.l.el.classList.toggle("is-affordable", sim.cash >= pad.def.cost - pad.paid);
      v.l.el.classList.toggle("is-active", pad.armed > 0);
    }
    for (const [id, v] of padViews) {
      if (live.has(id)) continue;
      v.group.removeFromParent();
      disposeTree(v.group);
      dropLabel(v.l);
      padViews.delete(id);
    }
  };

  /** Props bought with pads. Driven by state, not events, so a restored save shows them too. */
  const propOf: Record<string, THREE.Object3D | undefined> = {
    coffee,
    neon,
    monitor: desks.frontend?.extraScreen,
  };
  const syncProps = () => {
    for (const id of sim.owned) {
      const prop = PADS.find((p) => p.id === id)?.prop;
      const obj = prop && propOf[prop];
      if (obj && !obj.visible) popIn(obj);
    }
  };

  const syncArrow = () => {
    const tutorial = sim.shipped < 4 || sim.bought < 1;
    const o = sim.objective();
    arrow.visible = tutorial && o.target !== null;
    if (o.target) {
      const bob = opts.reducedMotion ? 0 : Math.sin(clock * 5) * 0.14;
      arrow.position.set(o.target.x, 1.0 + bob, o.target.z);
      arrow.rotation.y = clock * 2;
    }
  };

  const stepEffects = (dt: number) => {
    for (let i = flyers.length - 1; i >= 0; i--) {
      const f = flyers[i]!;
      if (f.delay > 0) {
        f.delay -= dt;
        f.mesh.visible = false;
        continue;
      }
      f.mesh.visible = true;
      f.t += dt / f.dur;
      const t = Math.min(1, f.t);
      const e = t * t * (3 - 2 * t);
      const to = f.to();
      f.mesh.position.lerpVectors(f.from, to, e);
      f.mesh.position.y += Math.sin(t * Math.PI) * f.arc;
      f.mesh.rotation.y = t * Math.PI;
      if (t >= 1) {
        f.done();
        flyers.splice(i, 1);
      }
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]!;
      r.t += dt;
      const lift = r.t < 0.25 ? 0 : (r.t - 0.25) ** 2 * 7;
      r.group.position.set(r.x + Math.sin(r.t * 18) * 0.02, 0.1 + lift, r.z);
      r.flame.scale.set(1, 0.8 + Math.random() * 0.6, 1);
      r.puffT -= dt;
      if (r.puffT <= 0 && r.t < 1.3) {
        r.puffT = 0.035;
        const m = makePuff();
        m.position.set(
          r.x + (Math.random() - 0.5) * 0.2,
          r.group.position.y - 0.1,
          r.z + (Math.random() - 0.5) * 0.2,
        );
        scene.add(m);
        puffs.push({
          mesh: m,
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * 1.6,
            r.t < 0.3 ? 0.2 : -0.4,
            (Math.random() - 0.5) * 1.6,
          ),
          t: 0,
          life: 0.7 + Math.random() * 0.4,
          grow: 1.5 + Math.random(),
        });
      }
      if (r.t > 1.8) {
        r.group.removeFromParent();
        disposeTree(r.group);
        rockets.splice(i, 1);
      }
    }

    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i]!;
      p.t += dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(0.94);
      const k = p.t / p.life;
      p.mesh.scale.setScalar(1 + k * p.grow);
      (p.mesh.material as THREE.MeshStandardMaterial).opacity = 0.85 * (1 - k);
      if (k >= 1) {
        p.mesh.removeFromParent();
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        puffs.splice(i, 1);
      }
    }

    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i]!;
      c.t += dt;
      c.vel.y -= 12 * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin.x * dt;
      c.mesh.rotation.y += c.spin.y * dt;
      if (c.mesh.position.y < 0.02) {
        c.mesh.position.y = 0.02;
        c.vel.set(0, 0, 0);
        c.spin.set(0, 0, 0);
      }
      if (c.t > 1.6) {
        c.mesh.removeFromParent();
        c.mesh.geometry.dispose();
        confetti.splice(i, 1);
      }
    }

    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]!;
      p.t += dt;
      const k = Math.min(1, p.t / 0.45);
      p.obj.scale.setScalar(p.base * elastic(k));
      if (k >= 1) pops.splice(i, 1);
    }
  };

  scene.updateMatrixWorld();

  /* ---- Camera --------------------------------------------------------- */

  const updateCamera = (dt: number, snap = false) => {
    const aspect = viewW / viewH;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // Far enough to show about 7.5 m across on a phone; never closer than 20.
    camDist = THREE.MathUtils.clamp(7.6 / 2 / (tanV * aspect) / 0.86, 20, 28);
    const halfW = camDist * 0.86 * tanV * aspect;
    const cx = Math.max(0, ROOM.maxX + 0.8 - halfW);
    const p = sim.player;
    const tx = THREE.MathUtils.clamp(p.x, -cx, cx);
    const tz =
      aspect < 1
        ? THREE.MathUtils.clamp(p.z, -2.4, 1.4)
        : THREE.MathUtils.clamp(p.z * 0.3, -0.8, 0.6) - 0.35;
    const k = snap ? 1 : 1 - Math.exp(-4 * dt);
    camTarget.x += (tx - camTarget.x) * k;
    camTarget.z += (tz - camTarget.z) * k;
    camera.position.copy(camTarget).addScaledVector(camDir, camDist);
    camera.lookAt(camTarget);
    sun.position.set(camTarget.x + 6, 14, camTarget.z + 8);
    sun.target.position.copy(camTarget);
  };

  /* ---- Loop ----------------------------------------------------------- */

  let raf = 0;
  let last = 0;
  let acc = 0;
  let clock = 0;
  let running = false;
  let paused = false;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, last ? (now - last) / 1000 : STEP);
    last = now;
    if (!paused) {
      clock += dt;
      acc += dt;
      while (acc >= STEP) {
        const v = cb.input();
        sim.input.x = v.x;
        sim.input.z = v.z;
        sim.step(STEP);
        acc -= STEP;
      }
      const events = sim.drain();
      if (events.length) {
        handle(events);
        cb.onEvents(events);
      }
      stepEffects(dt);
    }
    syncPlayer(dt);
    syncStations(dt);
    syncClients(dt);
    syncPile();
    syncPads(dt);
    syncProps();
    syncArrow();
    updateCamera(dt);
    renderer.render(scene, camera);
    placeLabels();
  };

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (wanted) start();
  };
  let wanted = false;

  function start() {
    wanted = true;
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener("visibilitychange", onVisibility);

  const resize = (w: number, h: number) => {
    viewW = Math.max(1, w);
    viewH = Math.max(1, h);
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    updateCamera(0, true);
  };

  return {
    sim,
    start,
    stop: () => {
      wanted = false;
      stop();
    },
    setPaused: (p) => {
      paused = p;
    },
    resize,
    dispose: () => {
      wanted = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      for (const l of labels) l.el.remove();
      labels.clear();
      overlay.querySelectorAll(".si-float").forEach((el) => el.remove());
      disposeTree(scene, true);
      disposeMaterials();
      renderer.dispose();
    },
  };
}

const CLIENT_STEP = 9;

function elastic(t: number) {
  if (t <= 0) return 0.001;
  if (t >= 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

/**
 * Frees geometry, and with `everything` the textures and one-off materials
 * too. Pads and clients come and go all game but share textures and cached
 * materials, so only the final teardown passes `everything`.
 */
function disposeTree(root: THREE.Object3D, everything = false) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    if (!everything) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const x of mats) {
      (x as THREE.MeshStandardMaterial).map?.dispose();
      x.dispose();
    }
  });
}

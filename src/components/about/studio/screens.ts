/**
 * The four screens on the desk, drawn to 2D canvases and used as textures.
 *
 * Each one is a small, honest imitation of a real tool — VS Code, Android
 * Studio, PyCharm, a Linux terminal — with a script of code that types itself
 * out, pauses, and starts again. Nothing here is a screenshot: it is all
 * rectangles and monospace text, so it stays sharp and weighs nothing.
 */

type Tok = [text: string, color: string];
type Line = { t: Tok[]; out?: boolean };

export const SCREEN_W = 1024;
export const SCREEN_H = 592;
const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";

const L = (...t: Tok[]): Line => ({ t });
const O = (...t: Tok[]): Line => ({ t, out: true });

/* ---- Scripts ------------------------------------------------------------ */

const V = {
  kw: "#c586c0",
  kw2: "#569cd6",
  str: "#ce9178",
  fn: "#dcdcaa",
  ty: "#4ec9b0",
  id: "#9cdcfe",
  tx: "#d4d4d4",
  cm: "#6a9955",
  tag: "#4ec9b0",
};

const VSCODE: Line[] = [
  L(
    ["import ", V.kw],
    ["{ createFileRoute } ", V.id],
    ["from ", V.kw],
    ['"@tanstack/react-router"', V.str],
    [";", V.tx],
  ),
  L(
    ["import ", V.kw],
    ["{ projectsQuery } ", V.id],
    ["from ", V.kw],
    ['"@/lib/queries"', V.str],
    [";", V.tx],
  ),
  L(),
  L(
    ["export const ", V.kw2],
    ["Route", V.id],
    [" = ", V.tx],
    ["createFileRoute", V.fn],
    ['("/")', V.str],
    ["({", V.tx],
  ),
  L(["  loader", V.id], [": ({ ", V.tx], ["context", V.id], [" }) =>", V.tx]),
  L(
    ["    context", V.id],
    [".", V.tx],
    ["queryClient", V.id],
    [".", V.tx],
    ["ensureQueryData", V.fn],
    ["(", V.tx],
    ["projectsQuery", V.id],
    ["),", V.tx],
  ),
  L(["  component", V.id], [": ", V.tx], ["Home", V.fn], [",", V.tx]),
  L(["});", V.tx]),
  L(),
  L(["function ", V.kw2], ["Home", V.fn], ["() {", V.tx]),
  L(
    ["  const ", V.kw2],
    ["{ data } ", V.id],
    ["= ", V.tx],
    ["useSuspenseQuery", V.fn],
    ["(", V.tx],
    ["projectsQuery", V.id],
    [");", V.tx],
  ),
  L(["  // five live, every one shipped solo", V.cm]),
  L(
    ["  return ", V.kw],
    ["<", V.tx],
    ["SelectedWork ", V.tag],
    ["projects", V.id],
    ["={", V.tx],
    ["data", V.id],
    ["} />", V.tx],
    [";", V.tx],
  ),
  L(["}", V.tx]),
];

const A = {
  kw: "#cc7832",
  str: "#6a8759",
  ty: "#a9b7c6",
  cl: "#ffc66d",
  an: "#bbb529",
  num: "#6897bb",
  tx: "#a9b7c6",
  cm: "#808080",
  pr: "#9876aa",
};

const ANDROID: Line[] = [
  L(
    ["class ", A.kw],
    ["OrderScreen ", A.cl],
    ["extends ", A.kw],
    ["StatelessWidget ", A.ty],
    ["{", A.tx],
  ),
  L(["  const ", A.kw], ["OrderScreen", A.cl], ["({", A.tx], ["super", A.kw], [".key});", A.tx]),
  L(),
  L(["  @override", A.an]),
  L(["  Widget ", A.ty], ["build", A.cl], ["(BuildContext context) {", A.tx]),
  L(["    return ", A.kw], ["StreamBuilder", A.ty], ["<List<Order>>(", A.tx]),
  L(["      stream", A.pr], [": orders.", A.tx], ["watchToday", A.cl], ["(),", A.tx]),
  L(["      builder", A.pr], [": (context, snap) => ", A.tx], ["ListView", A.ty], ["(", A.tx]),
  L(["        children", A.pr], [": [", A.tx]),
  L(
    ["          for ", A.kw],
    ["(", A.tx],
    ["final ", A.kw],
    ["o ", A.tx],
    ["in ", A.kw],
    ["snap.data ?? [])", A.tx],
  ),
  L(["            OrderTile", A.ty], ["(order: o),", A.tx]),
  L(["        ],", A.tx]),
  L(["      ),", A.tx]),
  L(["    );", A.tx]),
  L(["  }", A.tx]),
  L(["}", A.tx]),
];

const P = {
  kw: "#cf8e6d",
  str: "#6aab73",
  fn: "#56a8f5",
  tx: "#bcbec4",
  num: "#2aacb8",
  cm: "#7a7e85",
  dec: "#b3ae60",
};

const PYCHARM: Line[] = [
  L(
    ["from ", P.kw],
    ["transformers ", P.tx],
    ["import ", P.kw],
    ["MT5ForConditionalGeneration", P.tx],
  ),
  L(["from ", P.kw], ["peft ", P.tx], ["import ", P.kw], ["LoraConfig, get_peft_model", P.tx]),
  L(),
  L(["model = MT5ForConditionalGeneration.", P.tx], ["from_pretrained", P.fn], ["(", P.tx]),
  L(['    "google/mt5-base"', P.str], [")", P.tx]),
  L(
    ["config = ", P.tx],
    ["LoraConfig", P.fn],
    ["(r=", P.tx],
    ["16", P.num],
    [", lora_alpha=", P.tx],
    ["32", P.num],
    [")", P.tx],
  ),
  L(["model = ", P.tx], ["get_peft_model", P.fn], ["(model, config)", P.tx]),
  L(),
  L(["def ", P.kw], ["keep_entities", P.fn], ["(summary, entities):", P.tx]),
  L(["    # the names have to survive the summary", P.cm]),
  L(
    ["    return ", P.kw],
    ["[e ", P.tx],
    ["for ", P.kw],
    ["e ", P.tx],
    ["in ", P.kw],
    ["entities ", P.tx],
    ["if ", P.kw],
    ["e ", P.tx],
    ["in ", P.kw],
    ["summary]", P.tx],
  ),
];

const PY_CONSOLE = [
  "epoch 1/5   loss 2.914   rouge-L 0.212",
  "epoch 2/5   loss 2.107   rouge-L 0.301",
  "epoch 3/5   loss 1.642   rouge-L 0.356",
  "epoch 4/5   loss 1.381   rouge-L 0.392",
  "epoch 5/5   loss 1.284   rouge-L 0.412  ✓ saved",
];

const T = {
  pr: "#8ae234",
  path: "#729fcf",
  tx: "#eeeeec",
  dim: "#9a9a96",
  ok: "#8ae234",
  acc: "#f08a3c",
  tux: "#fce94f",
};

const TERMINAL: Line[] = [
  L(["nivas@ubuntu", T.pr], [":", T.tx], ["~", T.path], ["$ ", T.tx], ["neofetch", T.tx]),
  O(["    .--.      ", T.tux], ["OS      ", T.acc], ["Ubuntu 24.04 LTS", T.tx]),
  O(["   |o_o |     ", T.tux], ["Shell   ", T.acc], ["zsh 5.9", T.tx]),
  O(["   |:_/ |     ", T.tux], ["Editor  ", T.acc], ["VS Code · PyCharm · nvim", T.tx]),
  O(["  //   \\ \\    ", T.tux], ["Langs   ", T.acc], ["TS · Python · Dart", T.tx]),
  O([" (|     | )   ", T.tux], ["Zone    ", T.acc], ["IST (UTC+05:30)", T.tx]),
  O(),
  L(
    ["nivas@ubuntu", T.pr],
    [":", T.tx],
    ["~/nivas.tech", T.path],
    ["$ ", T.tx],
    ["git push origin main", T.tx],
  ),
  O(["To github.com:Nivas001/nivas.tech.git", T.dim]),
  O(["   4f1c2e9..a8d31b7  main -> main", T.dim]),
  L(
    ["nivas@ubuntu", T.pr],
    [":", T.tx],
    ["~/nivas.tech", T.path],
    ["$ ", T.tx],
    ["bun run build", T.tx],
  ),
  O(["✓ built in 7.42s", T.ok]),
  O(["✓ deployed → https://nivas.tech", T.ok]),
];

/* ---- Typing state ------------------------------------------------------- */

class Typist {
  private chars = 0;
  private hold = 0;
  readonly total: number;
  constructor(
    private lines: Line[],
    private cps: number,
  ) {
    this.total = lines.reduce((n, l) => n + l.t.reduce((m, [s]) => m + s.length, 0) + 1, 0);
    // Start well into the file, so no screen is ever seen empty.
    this.chars = this.total * 0.62;
  }
  step(dt: number, speed = 1) {
    if (this.chars >= this.total) {
      this.hold += dt;
      if (this.hold > 3.2) {
        this.chars = this.total * 0.25;
        this.hold = 0;
      }
      return;
    }
    // Output lines print far faster than a person types.
    const line = this.lineAt(this.chars);
    const fast = line?.out ? 14 : 1;
    this.chars = Math.min(this.total, this.chars + dt * this.cps * speed * fast);
  }
  finish() {
    this.chars = this.total;
  }
  private lineAt(n: number) {
    let acc = 0;
    for (const l of this.lines) {
      acc += l.t.reduce((m, [s]) => m + s.length, 0) + 1;
      if (n < acc) return l;
    }
    return undefined;
  }
  /** Lines with their visible characters, plus where the caret sits. */
  visible(): { line: Line; shown: number }[] {
    let budget = Math.floor(this.chars);
    const out: { line: Line; shown: number }[] = [];
    for (const l of this.lines) {
      const len = l.t.reduce((m, [s]) => m + s.length, 0);
      if (budget <= 0 && out.length > 0) break;
      out.push({ line: l, shown: Math.min(len, Math.max(0, budget)) });
      budget -= len + 1;
    }
    return out;
  }
  get done() {
    return this.chars >= this.total;
  }
  get fraction() {
    return this.chars / this.total;
  }
}

function drawCode(
  ctx: CanvasRenderingContext2D,
  typist: Typist,
  x: number,
  y: number,
  lineH: number,
  maxLines: number,
  gutter: string | null,
  caret: string,
  blink: boolean,
) {
  const rows = typist.visible();
  const start = Math.max(0, rows.length - maxLines);
  ctx.font = `17px ${MONO}`;
  ctx.textBaseline = "top";
  rows.slice(start).forEach(({ line, shown }, i) => {
    const row = start + i;
    const ly = y + i * lineH;
    if (gutter) {
      ctx.fillStyle = gutter;
      ctx.textAlign = "right";
      ctx.fillText(String(row + 1), x - 18, ly);
      ctx.textAlign = "left";
    }
    let cx = x;
    let left = shown;
    for (const [text, color] of line.t) {
      if (left <= 0) break;
      const part = text.slice(0, left);
      ctx.fillStyle = color;
      ctx.fillText(part, cx, ly);
      cx += ctx.measureText(part).width;
      left -= text.length;
    }
    const last = i === rows.length - 1 - start;
    if (last && blink) {
      ctx.fillStyle = caret;
      ctx.fillRect(cx + 1, ly + 1, 9, 19);
    }
  });
}

/* ---- Screens ------------------------------------------------------------ */

export type Screen = {
  canvas: HTMLCanvasElement;
  /** Advance typing and redraw. Returns true when the pixels changed. */
  tick: (dt: number, time: number, active: boolean) => boolean;
  finish: () => void;
};

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function titleBar(ctx: CanvasRenderingContext2D, bg: string, fg: string, text: string, h = 34) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, h);
  ctx.fillStyle = fg;
  ctx.font = `14px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, SCREEN_W / 2, h / 2);
  ctx.textAlign = "left";
}

function makeScreen(
  cps: number,
  lines: Line[],
  paint: (ctx: CanvasRenderingContext2D, t: Typist, blink: boolean, time: number) => void,
): Screen {
  const { canvas, ctx } = makeCanvas();
  const typist = new Typist(lines, cps);
  let lastChars = -1;
  let lastBlink = false;
  return {
    canvas,
    tick(dt, time, active) {
      typist.step(dt, active ? 1.6 : 0.6);
      const blink = Math.floor(time * 2.2) % 2 === 0;
      const key = Math.floor(typist.fraction * 4000);
      if (key === lastChars && blink === lastBlink) return false;
      lastChars = key;
      lastBlink = blink;
      paint(ctx, typist, blink, time);
      return true;
    },
    finish() {
      typist.finish();
      paint(ctx, typist, false, 0);
    },
  };
}

export function vscodeScreen(): Screen {
  return makeScreen(22, VSCODE, (ctx, t, blink) => {
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    titleBar(ctx, "#3c3c3c", "#cccccc", "index.tsx — nivas.tech — Visual Studio Code");
    // Activity bar and explorer.
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 34, 52, SCREEN_H - 60);
    ctx.fillStyle = "#858585";
    [60, 108, 156, 204].forEach((y, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.55;
      ctx.fillRect(16, y, 20, 20);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#252526";
    ctx.fillRect(52, 34, 200, SCREEN_H - 60);
    ctx.font = `13px ${SANS}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#bbbbbb";
    ctx.fillText("EXPLORER", 68, 48);
    const files = [
      "▾ src",
      "  ▾ routes",
      "     index.tsx",
      "     about.tsx",
      "  ▸ components",
      "  ▸ lib",
      "  styles.css",
      "package.json",
    ];
    files.forEach((f, i) => {
      if (i === 2) {
        ctx.fillStyle = "#37373d";
        ctx.fillRect(52, 76 + i * 26 - 4, 200, 26);
      }
      ctx.fillStyle = i === 2 ? "#ffffff" : "#cccccc";
      ctx.fillText(f, 68, 76 + i * 26);
    });
    // Tabs.
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(252, 34, SCREEN_W - 252, 38);
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(252, 34, 150, 38);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("index.tsx", 280, 46);
    ctx.fillStyle = "#969696";
    ctx.fillText("about.tsx", 430, 46);
    drawCode(ctx, t, 312, 92, 26, 16, "#858585", "#aeafad", blink);
    // Status bar.
    ctx.fillStyle = "#007acc";
    ctx.fillRect(0, SCREEN_H - 26, SCREEN_W, 26);
    ctx.fillStyle = "#ffffff";
    ctx.font = `13px ${SANS}`;
    ctx.textBaseline = "middle";
    ctx.fillText("⎇ main   ✓ 0 problems", 14, SCREEN_H - 13);
    ctx.fillText("TypeScript React   UTF-8   IST", SCREEN_W - 240, SCREEN_H - 13);
  });
}

export function androidScreen(): Screen {
  return makeScreen(18, ANDROID, (ctx, t, blink, time) => {
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    titleBar(ctx, "#3c3f41", "#bbbbbb", "ani_bakes – order_screen.dart – Android Studio");
    // Toolbar with the run button.
    ctx.fillStyle = "#3c3f41";
    ctx.fillRect(0, 34, SCREEN_W, 32);
    ctx.fillStyle = "#59a869";
    ctx.beginPath();
    ctx.moveTo(SCREEN_W - 250, 42);
    ctx.lineTo(SCREEN_W - 250, 58);
    ctx.lineTo(SCREEN_W - 236, 50);
    ctx.fill();
    ctx.fillStyle = "#bbbbbb";
    ctx.font = `13px ${SANS}`;
    ctx.textBaseline = "middle";
    ctx.fillText("Pixel 8 · API 35", SCREEN_W - 225, 50);
    // Project pane.
    ctx.fillStyle = "#313335";
    ctx.fillRect(0, 66, 170, SCREEN_H - 66);
    ctx.fillStyle = "#a9b7c6";
    ctx.textBaseline = "top";
    [
      "▾ lib",
      "  ▾ screens",
      "    order_screen",
      "    menu_screen",
      "  ▸ models",
      "  main.dart",
      "pubspec.yaml",
    ].forEach((f, i) => ctx.fillText(f, 14, 82 + i * 24));
    drawCode(ctx, t, 216, 84, 25, 19, "#606366", "#bbbbbb", blink);
    // The emulator: a phone running what is being written.
    const px = SCREEN_W - 220;
    const py = 84;
    ctx.fillStyle = "#1a1a1a";
    roundRect(ctx, px, py, 190, 390, 26);
    ctx.fill();
    ctx.fillStyle = "#fbf4ea";
    roundRect(ctx, px + 10, py + 12, 170, 366, 18);
    ctx.fill();
    ctx.fillStyle = "#e0527a";
    ctx.fillRect(px + 10, py + 30, 170, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 15px ${SANS}`;
    ctx.fillText("Today’s orders", px + 24, py + 43);
    const shown = Math.min(5, Math.floor(t.fraction * 6));
    for (let i = 0; i < shown; i++) {
      const y = py + 88 + i * 56;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, px + 20, y, 150, 46, 10);
      ctx.fill();
      ctx.fillStyle = i % 2 ? "#f3c14b" : "#e0527a";
      ctx.beginPath();
      ctx.arc(px + 40, y + 23, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(px + 60, y + 14, 80 - ((i * 17) % 30), 7);
      ctx.fillStyle = "#b8a99a";
      ctx.fillRect(px + 60, y + 27, 50, 6);
    }
    if (shown < 5 && Math.floor(time * 3) % 2) {
      ctx.fillStyle = "#e0527a";
      ctx.fillRect(px + 80, py + 88 + shown * 56 + 18, 30, 4);
    }
  });
}

export function pycharmScreen(): Screen {
  return makeScreen(20, PYCHARM, (ctx, t, blink) => {
    ctx.fillStyle = "#1e1f22";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    titleBar(ctx, "#2b2d30", "#dfe1e5", "tamil-ner-summariser – train.py – PyCharm");
    ctx.fillStyle = "#2b2d30";
    ctx.fillRect(0, 34, 44, SCREEN_H - 34);
    ctx.fillStyle = "#6f737a";
    [56, 96, 136].forEach((y) => ctx.fillRect(12, y, 20, 20));
    drawCode(ctx, t, 108, 58, 25, 12, "#4b5059", "#ced0d6", blink);
    // Run console.
    const cy = 372;
    ctx.fillStyle = "#2b2d30";
    ctx.fillRect(44, cy, SCREEN_W - 44, SCREEN_H - cy);
    ctx.fillStyle = "#dfe1e5";
    ctx.font = `13px ${SANS}`;
    ctx.textBaseline = "top";
    ctx.fillText("Run    train", 64, cy + 10);
    ctx.fillStyle = "#57965c";
    ctx.fillRect(64, cy + 34, SCREEN_W - 108, 1);
    ctx.font = `15px ${MONO}`;
    const epochs = Math.min(PY_CONSOLE.length, Math.floor(Math.max(0, t.fraction - 0.55) * 12));
    for (let i = 0; i < epochs; i++) {
      ctx.fillStyle = i === PY_CONSOLE.length - 1 ? "#6aab73" : "#bcbec4";
      ctx.fillText(PY_CONSOLE[i]!, 64, cy + 46 + i * 26);
    }
    // A loss curve that falls as the epochs land.
    ctx.strokeStyle = "#56a8f5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= Math.max(0, epochs - 1) * 10; i++) {
      const x = SCREEN_W - 280 + i * 5;
      const y = cy + 60 + 110 * (1 - Math.exp(-i / 14));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

export function terminalScreen(): Screen {
  return makeScreen(16, TERMINAL, (ctx, t, blink) => {
    ctx.fillStyle = "#300a24";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    titleBar(ctx, "#2c2c2c", "#dddddd", "nivas@ubuntu: ~/nivas.tech", 40);
    ["#e95420", "#777777", "#777777"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(SCREEN_W - 26 - i * 26, 20, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    drawCode(ctx, t, 26, 60, 34, 15, null, "#eeeeec", blink);
  });
}

/** The centre monitor's last frame: the video résumé, waiting. */
export function videoPoster(): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  g.addColorStop(0, "#14161b");
  g.addColorStop(1, "#23262e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = "#f08a3c";
  ctx.beginPath();
  ctx.arc(SCREEN_W / 2, SCREEN_H / 2 - 30, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14161b";
  ctx.beginPath();
  ctx.moveTo(SCREEN_W / 2 - 16, SCREEN_H / 2 - 58);
  ctx.lineTo(SCREEN_W / 2 - 16, SCREEN_H / 2 - 2);
  ctx.lineTo(SCREEN_W / 2 + 30, SCREEN_H / 2 - 30);
  ctx.fill();
  ctx.fillStyle = "#f2f2f2";
  ctx.font = `600 34px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Video résumé", SCREEN_W / 2, SCREEN_H / 2 + 70);
  ctx.fillStyle = "#9aa0aa";
  ctx.font = `18px ${SANS}`;
  ctx.fillText("Srinivas M · keep scrolling to play", SCREEN_W / 2, SCREEN_H / 2 + 110);
  return canvas;
}

/** Flat mock-ups for the objects that rise out of the screen. */
export function browserMock(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fbf8f1";
  ctx.fillRect(0, 0, 640, 420);
  ctx.fillStyle = "#e7e0cf";
  ctx.fillRect(0, 0, 640, 36);
  ["#e0527a", "#f3c14b", "#59a869"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(22 + i * 20, 18, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#1f2a44";
  ctx.font = `bold 40px ${SANS}`;
  ctx.fillText("Fresh, every", 40, 110);
  ctx.fillText("single morning.", 40, 158);
  ctx.fillStyle = "#f08a3c";
  roundRect(ctx, 40, 190, 150, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 18px ${SANS}`;
  ctx.fillText("Order now", 70, 219);
  ctx.fillStyle = "#e9c4cf";
  roundRect(ctx, 360, 70, 240, 180, 16);
  ctx.fill();
  ctx.fillStyle = "#1f2a44";
  for (let i = 0; i < 3; i++) {
    roundRect(ctx, 40 + i * 190, 290, 170, 100, 12);
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  return canvas;
}

export function phoneMock(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 480;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fbf4ea";
  ctx.fillRect(0, 0, 240, 480);
  ctx.fillStyle = "#2447c9";
  ctx.fillRect(0, 0, 240, 90);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 22px ${SANS}`;
  ctx.fillText("Velocity", 20, 58);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 16, 110 + i * 88, 208, 72, 12);
    ctx.fill();
    ctx.fillStyle = i % 2 ? "#f08a3c" : "#2447c9";
    roundRect(ctx, 28, 122 + i * 88, 48, 48, 8);
    ctx.fill();
    ctx.fillStyle = "#1f2a44";
    ctx.fillRect(90, 132 + i * 88, 100, 9);
    ctx.fillStyle = "#b9b2a5";
    ctx.fillRect(90, 150 + i * 88, 70, 7);
  }
  return canvas;
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
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

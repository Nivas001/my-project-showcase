/* ==========================================================================
 * SHIP IT INC. — INPUT
 *
 * One control scheme for every device: press anywhere on the floor and drag,
 * and a joystick appears under your finger (or mouse). WASD and the arrow keys
 * work too. Both produce the same thing, a direction on the floor where screen
 * up is "away from the camera", which is -z in the world.
 * ======================================================================== */

const RADIUS = 56;
const DEADZONE = 0.12;

export class Input {
  private keys = new Set<string>();
  private pointer: number | null = null;
  private ox = 0;
  private oy = 0;
  private stick = { x: 0, y: 0 };
  private cleanup: (() => void)[] = [];

  constructor(
    private surface: HTMLElement,
    private base: HTMLElement,
    private knob: HTMLElement,
    private onFirstInput: () => void,
  ) {
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Window,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      this.cleanup.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };

    on(surface, "pointerdown", (e) => {
      if (this.pointer !== null || (e.pointerType === "mouse" && e.button !== 0)) return;
      this.pointer = e.pointerId;
      surface.setPointerCapture(e.pointerId);
      const r = surface.getBoundingClientRect();
      this.ox = e.clientX - r.left;
      this.oy = e.clientY - r.top;
      this.stick = { x: 0, y: 0 };
      this.base.style.transform = `translate3d(${this.ox}px, ${this.oy}px, 0)`;
      this.base.dataset["on"] = "1";
      this.knob.style.transform = "translate3d(0,0,0)";
      this.onFirstInput();
    });
    on(surface, "pointermove", (e) => {
      if (e.pointerId !== this.pointer) return;
      const r = surface.getBoundingClientRect();
      let dx = e.clientX - r.left - this.ox;
      let dy = e.clientY - r.top - this.oy;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS;
        dy = (dy / len) * RADIUS;
      }
      this.knob.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      this.stick = { x: dx / RADIUS, y: dy / RADIUS };
    });
    const release = (e: PointerEvent) => {
      if (e.pointerId !== this.pointer) return;
      this.pointer = null;
      this.stick = { x: 0, y: 0 };
      delete this.base.dataset["on"];
    };
    on(surface, "pointerup", release);
    on(surface, "pointercancel", release);

    on(window, "keydown", (e) => {
      const k = KEYMAP[e.key];
      if (!k) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      this.keys.add(k);
      this.onFirstInput();
    });
    on(window, "keyup", (e) => {
      const k = KEYMAP[e.key];
      if (k) this.keys.delete(k);
    });
    on(window, "blur", () => {
      this.keys.clear();
      this.pointer = null;
      this.stick = { x: 0, y: 0 };
      delete this.base.dataset["on"];
    });
  }

  vector(): { x: number; z: number } {
    if (this.keys.size) {
      const x = (this.keys.has("right") ? 1 : 0) - (this.keys.has("left") ? 1 : 0);
      const z = (this.keys.has("down") ? 1 : 0) - (this.keys.has("up") ? 1 : 0);
      const len = Math.hypot(x, z) || 1;
      return { x: x / len, z: z / len };
    }
    const len = Math.hypot(this.stick.x, this.stick.y);
    if (len < DEADZONE) return { x: 0, z: 0 };
    // Ease the first part of the throw so small drags walk, big ones run.
    const k = Math.min(1, ((len - DEADZONE) / (1 - DEADZONE)) * 1.25) / len;
    return { x: this.stick.x * k, z: this.stick.y * k };
  }

  dispose() {
    this.cleanup.forEach((f) => f());
    this.cleanup = [];
  }
}

const KEYMAP: Record<string, "up" | "down" | "left" | "right"> = {
  w: "up",
  W: "up",
  ArrowUp: "up",
  s: "down",
  S: "down",
  ArrowDown: "down",
  a: "left",
  A: "left",
  ArrowLeft: "left",
  d: "right",
  D: "right",
  ArrowRight: "right",
};

/**
 * ============================================================================
 * ARCADE AUDIO
 * ============================================================================
 *
 * Every sound in the arcade is synthesised in the browser. No .mp3 to ship, no
 * licence to worry about, no 400KB of audio on a page that half of visitors
 * will never turn the volume up for.
 *
 * The rule that makes that safe: nothing touches the speakers until `unlock()`
 * is called from a real user gesture. Chrome and Safari both refuse to start an
 * AudioContext otherwise, and an arcade that throws on load is worse than a
 * silent one.
 *
 * Shape is deliberately close to the horror engine in `lib/horror/audio.ts` —
 * same unlock/mute/play contract — but the palette is the opposite: short,
 * bright, pitched, and quantised to a scale so that rapid-fire combo blips
 * sound like music instead of a smoke alarm.
 */

export type ArcadeSfx =
  | "blip" //  generic UI tick
  | "select" //  tab / menu change
  | "start" //  a run begins
  | "hit" //  you scored
  | "miss" //  you didn't
  | "combo" //  pitched, rises with the streak
  | "coin" //  bonus pickup
  | "power" //  power-up collected
  | "levelup" //  difficulty step
  | "hurt" //  damage taken
  | "crash" //  run ended badly
  | "gameover" //  run ended
  | "highscore" //  personal best beaten
  | "type" //  keystroke
  | "error" //  wrong keystroke
  | "tick" //  countdown
  | "whoosh"; //  movement

/** A pentatonic minor scale in semitones. Nothing in it can clash. */
const PENTA = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
const BASE_HZ = 220; // A3

function step(n: number) {
  const semis = PENTA[Math.min(n, PENTA.length - 1)] ?? 0;
  return BASE_HZ * Math.pow(2, semis / 12);
}

export class ArcadeAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private noiseBuffer: AudioBuffer | null = null;
  muted = false;

  /** Call from a click/keydown. Safe to call repeatedly. */
  unlock() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;

    // A gentle limiter so a combo chain and a crash landing on the same frame
    // cannot clip. Without it the sum of six oscillators is genuinely painful.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;

    this.master.connect(limiter).connect(ctx.destination);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.master);

    // One second of white noise, reused by every percussive sound.
    const len = Math.floor(ctx.sampleRate * 1);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    void ctx.resume();
  }

  get ready() {
    return this.ctx !== null;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.05);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Primitives                                                             */
  /* ---------------------------------------------------------------------- */

  private tone(
    from: number,
    to: number,
    vol: number,
    dur: number,
    type: OscillatorType = "square",
    delay = 0,
  ) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(
    type: BiquadFilterType,
    freq: number,
    q: number,
    vol: number,
    dur: number,
    delay = 0,
    sweepTo?: number,
  ) {
    const ctx = this.ctx;
    if (!ctx || this.muted || !this.noiseBuffer) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(freq, t);
    if (sweepTo) filt.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /* ---------------------------------------------------------------------- */
  /* The palette                                                            */
  /* ---------------------------------------------------------------------- */

  /**
   * @param n  Optional index. For `combo` and `hit` it climbs the pentatonic
   *           scale, so a streak plays an ascending run rather than the same
   *           note thirty times.
   */
  play(kind: ArcadeSfx, n = 0) {
    if (!this.ctx) return;

    switch (kind) {
      case "blip":
        this.tone(880, 880, 0.08, 0.05, "square");
        break;

      case "select":
        this.tone(520, 760, 0.1, 0.07, "square");
        this.tone(1040, 1520, 0.04, 0.06, "square", 0.02);
        break;

      case "start":
        [0, 2, 4, 6].forEach((s, i) => this.tone(step(s), step(s), 0.16, 0.1, "square", i * 0.075));
        this.tone(step(8), step(8), 0.2, 0.28, "triangle", 0.3);
        break;

      case "hit":
        this.tone(step(n % 6), step((n % 6) + 2), 0.18, 0.09, "square");
        this.noise("highpass", 3200, 0.5, 0.05, 0.05);
        break;

      case "combo": {
        // Climbs while the streak holds, then wraps an octave up.
        const f = step(Math.min(n, 10));
        this.tone(f, f * 1.5, 0.18, 0.13, "square");
        this.tone(f * 2, f * 3, 0.07, 0.11, "triangle", 0.03);
        break;
      }

      case "coin":
        this.tone(988, 988, 0.16, 0.07, "square");
        this.tone(1319, 1319, 0.16, 0.24, "square", 0.07);
        break;

      case "power":
        [0, 4, 7, 10].forEach((s, i) =>
          this.tone(step(s), step(s + 1), 0.14, 0.12, "sawtooth", i * 0.05),
        );
        break;

      case "levelup":
        [0, 3, 5, 8].forEach((s, i) => this.tone(step(s), step(s), 0.15, 0.14, "square", i * 0.08));
        this.noise("bandpass", 2000, 1.5, 0.06, 0.4, 0.1, 5000);
        break;

      case "miss":
        this.tone(220, 130, 0.14, 0.18, "sawtooth");
        this.noise("lowpass", 900, 0.7, 0.08, 0.14);
        break;

      case "hurt":
        this.tone(300, 90, 0.2, 0.26, "sawtooth");
        this.noise("bandpass", 600, 1.2, 0.14, 0.2);
        break;

      case "crash":
        this.tone(200, 55, 0.24, 0.5, "sawtooth");
        this.noise("lowpass", 1400, 0.6, 0.22, 0.45, 0, 120);
        break;

      case "gameover":
        [12, 9, 6, 2].forEach((s, i) =>
          this.tone(step(s), step(s), 0.16, 0.22, "square", i * 0.13),
        );
        this.tone(step(0), step(0) / 2, 0.18, 0.7, "triangle", 0.55);
        break;

      case "highscore":
        [0, 4, 7, 10, 7, 10, 12].forEach((s, i) =>
          this.tone(step(s), step(s), 0.15, 0.16, "square", i * 0.085),
        );
        this.noise("highpass", 4000, 0.4, 0.05, 0.9, 0.1);
        break;

      case "type":
        this.noise("bandpass", 1800 + Math.random() * 600, 3, 0.05, 0.035);
        this.tone(1400, 1200, 0.03, 0.03, "square");
        break;

      case "error":
        this.tone(160, 120, 0.13, 0.1, "square");
        break;

      case "tick":
        this.tone(1200, 1200, 0.07, 0.04, "square");
        break;

      case "whoosh":
        this.noise("bandpass", 400, 0.8, 0.07, 0.22, 0, 2600);
        break;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Background loop                                                        */
  /* ---------------------------------------------------------------------- */

  /**
   * A four-bar chiptune arpeggio, off by default. It exists because a silent
   * arcade feels broken, and it is a separate gain node from the SFX so it can
   * sit low enough to stay out of the way.
   */
  startMusic(bpm = 104) {
    if (!this.ctx || this.musicTimer) return;
    this.musicGain!.gain.setTargetAtTime(0.16, this.ctx.currentTime, 0.8);

    const PATTERN = [0, 4, 7, 4, 2, 5, 9, 5, 3, 7, 10, 7, 1, 5, 8, 5];
    const interval = 60000 / bpm / 2;

    this.musicTimer = window.setInterval(() => {
      const ctx = this.ctx;
      if (!ctx || this.muted) return;
      const s = PATTERN[this.musicStep % PATTERN.length] ?? 0;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = step(s) / 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(g).connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + 0.2);

      // Bass on every fourth sixteenth.
      if (this.musicStep % 4 === 0) {
        const bass = ctx.createOscillator();
        bass.type = "triangle";
        bass.frequency.value = step(s) / 4;
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.0001, t);
        bg.gain.exponentialRampToValueAtTime(0.45, t + 0.012);
        bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        bass.connect(bg).connect(this.musicGain!);
        bass.start(t);
        bass.stop(t + 0.34);
      }

      this.musicStep++;
    }, interval);
  }

  stopMusic() {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.musicStep = 0;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  get musicPlaying() {
    return this.musicTimer !== null;
  }

  destroy() {
    this.stopMusic();
    try {
      void this.ctx?.close();
    } catch {
      /* already closed */
    }
    this.ctx = null;
  }
}

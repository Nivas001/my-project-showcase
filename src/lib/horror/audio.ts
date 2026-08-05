import type { Ambience, Sfx } from "./types";

/**
 * Fully synthesized horror audio. No assets, no autoplay: nothing starts
 * until unlock() is called from a user gesture (the entry gate).
 */
export class HorrorAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambGain: GainNode | null = null;
  private ambNodes: AudioNode[] = [];
  private heartTimer: number | null = null;
  private whisperTimer: number | null = null;
  private current: Ambience | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  muted = false;

  unlock() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(ctx.destination);
    this.ambGain = ctx.createGain();
    this.ambGain.gain.value = 0;
    this.ambGain.connect(this.master);

    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
    void ctx.resume();
  }

  get ready() {
    return this.ctx !== null;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.15);
    }
  }

  private noise() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    return src;
  }

  /** Crossfade to a new ambience bed. */
  setAmbience(kind: Ambience) {
    if (!this.ctx || this.current === kind) return;
    const ctx = this.ctx;
    this.current = kind;
    this.stopAmbienceNodes();
    if (kind === "silence") {
      this.ambGain!.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
      return;
    }

    const out = this.ambGain!;
    const made: AudioNode[] = [];

    const addNoise = (type: BiquadFilterType, freq: number, q: number, gain: number) => {
      const src = this.noise();
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.value = freq;
      filt.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(filt).connect(g).connect(out);
      src.start();
      made.push(src, filt, g);
      return { filt, g };
    };

    const addDrone = (freq: number, gain: number, detune = 0) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 180;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(filt).connect(g).connect(out);
      osc.start();
      made.push(osc, filt, g);
      return g;
    };

    const addLfo = (target: AudioParam, rate: number, depth: number) => {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const lg = ctx.createGain();
      lg.gain.value = depth;
      lfo.connect(lg).connect(target);
      lfo.start();
      made.push(lfo, lg);
    };

    switch (kind) {
      case "rain": {
        const { filt } = addNoise("bandpass", 2400, 0.6, 0.16);
        addLfo(filt.frequency, 0.07, 500);
        addNoise("lowpass", 300, 0.5, 0.1);
        addDrone(48, 0.05);
        break;
      }
      case "corridor": {
        addDrone(41, 0.09);
        addDrone(61.5, 0.05, 7);
        const { g } = addNoise("lowpass", 420, 0.7, 0.05);
        addLfo(g.gain, 0.05, 0.03);
        break;
      }
      case "forest": {
        addNoise("highpass", 5200, 0.4, 0.035);
        const { filt } = addNoise("bandpass", 900, 1.2, 0.05);
        addLfo(filt.frequency, 0.13, 300);
        addDrone(36, 0.07);
        break;
      }
      case "hospital": {
        addDrone(50, 0.06);
        addDrone(100, 0.03, -5);
        const { g } = addNoise("bandpass", 1600, 2, 0.03);
        addLfo(g.gain, 0.9, 0.02);
        break;
      }
      case "static": {
        addNoise("highpass", 1200, 0.4, 0.09);
        const { g } = addNoise("lowpass", 700, 0.5, 0.06);
        addLfo(g.gain, 3.1, 0.05);
        break;
      }
      case "engine": {
        addDrone(44, 0.09);
        addDrone(66, 0.04, 11);
        const { filt } = addNoise("lowpass", 240, 0.8, 0.09);
        addLfo(filt.frequency, 1.6, 90);
        break;
      }
    }

    this.ambNodes = made;
    this.ambGain!.gain.setTargetAtTime(0.9, ctx.currentTime, 1.2);
  }

  private stopAmbienceNodes() {
    for (const n of this.ambNodes) {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        /* already stopped */
      }
      try {
        n.disconnect();
      } catch {
        /* noop */
      }
    }
    this.ambNodes = [];
  }

  /** Duck ambience for a moment — the silence before the jolt. */
  duck(ms = 700) {
    if (!this.ctx || !this.ambGain) return;
    const t = this.ctx.currentTime;
    this.ambGain.gain.cancelScheduledValues(t);
    this.ambGain.gain.setTargetAtTime(0.02, t, 0.05);
    this.ambGain.gain.setTargetAtTime(0.9, t + ms / 1000, 0.4);
  }

  /** Heartbeat rate follows fear 0..100. */
  setFear(fear: number) {
    if (!this.ctx) return;
    if (this.heartTimer) window.clearInterval(this.heartTimer);
    if (this.whisperTimer) window.clearInterval(this.whisperTimer);
    if (fear < 18) return;

    const bpm = 52 + (fear / 100) * 68;
    const interval = 60000 / bpm;
    this.heartTimer = window.setInterval(() => {
      this.thump(0.5 + fear / 260);
      window.setTimeout(() => this.thump(0.32 + fear / 340), interval * 0.32);
    }, interval);

    if (fear > 55) {
      this.whisperTimer = window.setInterval(
        () => {
          if (Math.random() < 0.55) this.play("whisper");
        },
        7000 - fear * 30,
      );
    }
  }

  private thump(vol: number) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const g = ctx.createGain();
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(78, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.14);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.min(vol, 0.85), t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  play(kind: Sfx) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const out = this.master!;

    const burst = (
      type: BiquadFilterType,
      freq: number,
      q: number,
      vol: number,
      dur: number,
      pan = 0,
      sweepTo?: number,
    ) => {
      const src = this.noise();
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.setValueAtTime(freq, t);
      if (sweepTo) filt.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
      filt.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      src.connect(filt).connect(g).connect(p).connect(out);
      src.start(t);
      src.stop(t + dur + 0.05);
    };

    const tone = (from: number, to: number, vol: number, dur: number, type: OscillatorType = "sawtooth") => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    switch (kind) {
      case "sting":
        this.duck(220);
        tone(1400, 120, 0.5, 0.9);
        tone(1397, 118, 0.35, 0.9, "square");
        burst("highpass", 2000, 0.5, 0.35, 0.5);
        break;
      case "whisper":
        burst("bandpass", 1500, 6, 0.09, 1.4, Math.random() * 1.6 - 0.8, 900);
        break;
      case "knock":
        tone(190, 60, 0.4, 0.16, "sine");
        burst("lowpass", 500, 1, 0.22, 0.12);
        break;
      case "breath":
        burst("bandpass", 700, 1.6, 0.1, 1.1, Math.random() * 0.8 - 0.4, 320);
        break;
      case "door":
        burst("bandpass", 320, 8, 0.16, 1.6, -0.3, 1200);
        break;
      case "scrape":
        burst("bandpass", 2600, 12, 0.14, 0.9, 0.35, 700);
        break;
      case "drop":
        tone(220, 28, 0.4, 1.4, "sine");
        break;
      case "bell":
        tone(880, 870, 0.18, 2.4, "sine");
        tone(1320, 1310, 0.08, 2.0, "sine");
        break;
      case "scream":
        this.duck(500);
        tone(300, 1500, 0.32, 0.5, "sawtooth");
        burst("bandpass", 1800, 3, 0.3, 0.8, 0, 600);
        break;
    }
  }

  stop() {
    if (this.heartTimer) window.clearInterval(this.heartTimer);
    if (this.whisperTimer) window.clearInterval(this.whisperTimer);
    this.heartTimer = null;
    this.whisperTimer = null;
    this.stopAmbienceNodes();
    this.current = null;
    if (this.ambGain && this.ctx) this.ambGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
  }

  destroy() {
    this.stop();
    try {
      void this.ctx?.close();
    } catch {
      /* noop */
    }
    this.ctx = null;
  }
}

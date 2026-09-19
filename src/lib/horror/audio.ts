import type { Ambience, Sfx } from "./types";

/**
 * ============================================================================
 * HORROR AUDIO
 * ============================================================================
 *
 * Fully synthesised. No assets, no autoplay: nothing starts until unlock() is
 * called from a user gesture (the entry gate).
 *
 * What makes this version frighten rather than merely buzz:
 *
 *   space        every sound goes through a convolution reverb built from
 *                noise-shaped decay. A dry click is a click; the same click
 *                with 2.4s of tail is a room you are standing in, and the
 *                room is the thing that scares people.
 *   movement     one-shots are panned, and several of them sweep across the
 *                stereo field while they play. A sound that moves behind you
 *                is read by the brain as a body, not a speaker.
 *   restraint    the loudest thing in the mix is silence. `duck()` drops the
 *                bed before a sting, because the drop is what the jolt lands
 *                in. Ambience sits at -20dB and never competes with a line.
 *   pressure     fear drives heart rate, breath, and how often the room makes
 *                a noise you cannot place. At the top of the scale it also
 *                detunes the bed, which is unpleasant in a way most listeners
 *                feel before they identify.
 */

export class HorrorAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private ambGain: GainNode | null = null;
  private ambNodes: AudioNode[] = [];
  private ambDetune: AudioParam[] = [];

  private heartTimer: number | null = null;
  private whisperTimer: number | null = null;
  private roomTimer: number | null = null;

  private current: Ambience | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private fear = 0;
  muted = false;

  /* ---------------------------------------------------------------------- */
  /* Setup                                                                  */
  /* ---------------------------------------------------------------------- */

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
    this.master.gain.value = 0.9;

    // A limiter stops a sting stacked on a scream from clipping into a buzz,
    // which instantly breaks the illusion of a real space.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 8;
    limiter.ratio.value = 14;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.2;
    this.master.connect(limiter).connect(ctx.destination);

    // Dry / wet split. Everything routes through both; the reverb is what
    // turns a collection of beeps into a building.
    this.dry = ctx.createGain();
    this.dry.gain.value = 0.82;
    this.dry.connect(this.master);

    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.impulse(ctx, 2.6, 2.4);
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.34;
    this.convolver.connect(this.wet).connect(this.master);

    this.ambGain = ctx.createGain();
    this.ambGain.gain.value = 0;
    this.ambGain.connect(this.dry);
    this.ambGain.connect(this.convolver);

    const len = Math.floor(ctx.sampleRate * 3);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    void ctx.resume();
    this.startRoomNoises();
  }

  /**
   * A synthesised impulse response: stereo noise under an exponential decay,
   * low-passed so the tail is dark rather than hissy. Two channels decorrelated
   * so the tail is genuinely wide.
   */
  private impulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, length, rate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      let last = 0;
      for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i / length, decay);
        // A one-pole low-pass on the noise darkens the tail, which reads as
        // stone and plaster rather than tiled bathroom.
        last = last * 0.72 + (Math.random() * 2 - 1) * 0.28;
        data[i] = last * env;
      }
    }
    return buf;
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

  private get out(): AudioNode {
    return this.dry!;
  }

  private send(node: AudioNode) {
    node.connect(this.dry!);
    node.connect(this.convolver!);
  }

  private noise() {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    return src;
  }

  /* ---------------------------------------------------------------------- */
  /* Ambience beds                                                          */
  /* ---------------------------------------------------------------------- */

  setAmbience(kind: Ambience) {
    if (!this.ctx || this.current === kind) return;
    const ctx = this.ctx;
    this.current = kind;
    this.stopAmbienceNodes();

    if (kind === "silence") {
      // Not actually silent — a room with the sound removed still has a floor,
      // and true digital zero is the one thing that tells a listener it is fake.
      this.ambGain!.gain.setTargetAtTime(0.05, ctx.currentTime, 0.9);
      const made: AudioNode[] = [];
      const src = this.noise();
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 180;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      src.connect(filt).connect(g).connect(this.ambGain!);
      src.start();
      made.push(src, filt, g);
      this.ambNodes = made;
      return;
    }

    const out = this.ambGain!;
    const made: AudioNode[] = [];
    const detunes: AudioParam[] = [];

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

    const addDrone = (freq: number, gain: number, detune = 0, type: OscillatorType = "sawtooth") => {
      const osc = ctx.createOscillator();
      osc.type = type;
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
      detunes.push(osc.detune);
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

      /* ---- new beds ---- */

      case "temple": {
        // A low stone hum with a fifth above it, and air moving through a space
        // far larger than the one you are standing in.
        addDrone(38, 0.085, 0, "triangle");
        addDrone(57, 0.045, -9, "triangle");
        const { filt } = addNoise("bandpass", 480, 0.9, 0.045);
        addLfo(filt.frequency, 0.045, 140);
        break;
      }
      case "hostel": {
        // Ceiling fan: a slow amplitude wobble on filtered noise, plus tube-
        // light mains hum at 100Hz, which is what an Indian corridor sounds
        // like at 3am and nothing else does.
        const { g } = addNoise("lowpass", 520, 0.6, 0.075);
        addLfo(g.gain, 4.6, 0.035);
        addDrone(100, 0.035, 0, "sine");
        addDrone(50, 0.05);
        break;
      }
      case "well": {
        // Everything arrives late, dark and narrow. The band is deliberately
        // tight: a well removes the top and bottom of every sound in it.
        addDrone(33, 0.1);
        const { filt, g } = addNoise("bandpass", 320, 4.5, 0.07);
        addLfo(filt.frequency, 0.09, 90);
        addLfo(g.gain, 0.21, 0.03);
        break;
      }
      case "sea": {
        // Surf is two noise bands breathing against each other out of phase.
        const { g: a } = addNoise("lowpass", 700, 0.5, 0.11);
        addLfo(a.gain, 0.11, 0.06);
        const { g: b } = addNoise("bandpass", 1800, 0.8, 0.05);
        addLfo(b.gain, 0.077, 0.035);
        addDrone(40, 0.055);
        break;
      }
      case "tape": {
        // Hiss, transport whine, and the slow wow of a stretched reel.
        const { g } = addNoise("highpass", 2600, 0.4, 0.05);
        addLfo(g.gain, 0.6, 0.012);
        addNoise("lowpass", 400, 0.5, 0.035);
        const whine = addDrone(2960, 0.012, 0, "sine");
        addLfo(whine.gain, 0.3, 0.006);
        addDrone(60, 0.03, 0, "sine");
        break;
      }
      case "street": {
        // Heard from inside a vehicle: mostly low, with occasional movement.
        addDrone(46, 0.08);
        const { filt } = addNoise("lowpass", 340, 0.7, 0.1);
        addLfo(filt.frequency, 0.23, 140);
        addNoise("bandpass", 1400, 0.9, 0.02);
        break;
      }
    }

    this.ambNodes = made;
    this.ambDetune = detunes;
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
    this.ambDetune = [];
  }

  /** Duck the bed for a moment — the silence a jolt lands in. */
  duck(ms = 700) {
    if (!this.ctx || !this.ambGain) return;
    const t = this.ctx.currentTime;
    this.ambGain.gain.cancelScheduledValues(t);
    this.ambGain.gain.setTargetAtTime(0.02, t, 0.05);
    this.ambGain.gain.setTargetAtTime(0.9, t + ms / 1000, 0.4);
  }

  /* ---------------------------------------------------------------------- */
  /* Fear                                                                   */
  /* ---------------------------------------------------------------------- */

  /**
   * Fear 0..100 drives three things at once: heart rate, how often the room
   * makes an unplaceable noise, and — past 70 — a slow detune of the bed, so
   * the ground itself stops sitting still.
   */
  setFear(fear: number) {
    if (!this.ctx) return;
    this.fear = fear;

    if (this.heartTimer) window.clearInterval(this.heartTimer);
    if (this.whisperTimer) window.clearInterval(this.whisperTimer);

    // The bed sours as it gets bad. Cents, not semitones — it should be felt
    // rather than heard.
    const cents = fear > 70 ? -((fear - 70) / 30) * 26 : 0;
    for (const d of this.ambDetune) d.setTargetAtTime(cents, this.ctx.currentTime, 2.5);

    if (fear < 18) return;

    const bpm = 52 + (fear / 100) * 72;
    const interval = 60000 / bpm;
    this.heartTimer = window.setInterval(() => {
      this.thump(0.5 + fear / 260);
      window.setTimeout(() => this.thump(0.32 + fear / 340), interval * 0.32);
    }, interval);

    if (fear > 52) {
      this.whisperTimer = window.setInterval(
        () => {
          if (Math.random() < 0.55) this.play(Math.random() < 0.7 ? "whisper" : "breath");
        },
        Math.max(2200, 7600 - fear * 34),
      );
    }
  }

  /**
   * The room makes a noise every so often whether or not the story asked for
   * one. Always faint, always somewhere in the stereo field, never on a cycle
   * you could learn — that unpredictability is what keeps a reader listening.
   */
  private startRoomNoises() {
    if (this.roomTimer) window.clearInterval(this.roomTimer);
    this.roomTimer = window.setInterval(() => {
      if (!this.ctx || this.muted || this.fear < 12) return;
      if (Math.random() > 0.3 + this.fear / 340) return;
      const pool: Sfx[] = ["scrape", "knock", "drop", "crack", "wind"];
      const kind = pool[Math.floor(Math.random() * pool.length)]!;
      this.play(kind, 0.35);
    }, 9000);
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
    osc.connect(g).connect(this.out);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /* ---------------------------------------------------------------------- */
  /* One-shots                                                              */
  /* ---------------------------------------------------------------------- */

  /** @param scale 0..1 volume trim, used by the ambient room noises. */
  play(kind: Sfx, scale = 1) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    /** Filtered noise burst. `panTo` sweeps it across the field while it plays. */
    const burst = (
      type: BiquadFilterType,
      freq: number,
      q: number,
      vol: number,
      dur: number,
      pan = 0,
      sweepTo?: number,
      panTo?: number,
      delay = 0,
    ) => {
      const at = t + delay;
      const src = this.noise();
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.setValueAtTime(freq, at);
      if (sweepTo) filt.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
      filt.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * scale), at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(pan, at);
      if (panTo !== undefined) p.pan.linearRampToValueAtTime(panTo, at + dur);
      src.connect(filt).connect(g).connect(p);
      this.send(p);
      src.start(at);
      src.stop(at + dur + 0.05);
    };

    const tone = (
      from: number,
      to: number,
      vol: number,
      dur: number,
      type: OscillatorType = "sawtooth",
      delay = 0,
      pan = 0,
    ) => {
      const at = t + delay;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(from, at);
      osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), at + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * scale), at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      osc.connect(g).connect(p);
      this.send(p);
      osc.start(at);
      osc.stop(at + dur + 0.05);
    };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    switch (kind) {
      case "sting":
        this.duck(220);
        tone(1400, 120, 0.5, 0.9);
        tone(1397, 118, 0.35, 0.9, "square");
        burst("highpass", 2000, 0.5, 0.35, 0.5);
        break;

      case "whisper":
        // Sweeps across the head. Directionless whispering is a sound effect;
        // a whisper that moves is a person.
        burst("bandpass", 1500, 6, 0.09, 1.5, rand(-0.9, 0.9), 900, rand(-0.9, 0.9));
        break;

      case "knock":
        tone(190, 60, 0.4, 0.16, "sine", 0, rand(-0.5, 0.5));
        burst("lowpass", 500, 1, 0.22, 0.12);
        break;

      case "breath":
        // In, then out. Two bursts, because one is just noise.
        burst("bandpass", 620, 1.8, 0.1, 0.8, rand(-0.5, 0.5), 340);
        burst("bandpass", 380, 1.4, 0.07, 1.1, rand(-0.5, 0.5), 240, undefined, 0.95);
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

      /* ---- new ---- */

      case "steps": {
        // Five footfalls walking from one side to the other. The interval is
        // slightly uneven, because an even one sounds like a metronome.
        const from = rand(-0.85, 0.85);
        const to = -from;
        for (let i = 0; i < 5; i++) {
          const k = i / 4;
          const pan = from + (to - from) * k;
          burst("lowpass", 280, 1.2, 0.17, 0.13, pan, 120, pan, i * rand(0.42, 0.52));
          tone(120, 55, 0.1, 0.1, "sine", i * 0.46, pan);
        }
        break;
      }

      case "water":
        tone(700, 180, 0.13, 0.22, "sine");
        burst("bandpass", 1500, 2.2, 0.16, 0.5, rand(-0.4, 0.4), 420);
        burst("lowpass", 300, 0.8, 0.1, 1.2, 0, 90, undefined, 0.12);
        break;

      case "phone": {
        // Two bursts of a double ring, in the room with you.
        for (const d of [0, 0.42, 1.5, 1.92]) {
          tone(1140, 1140, 0.14, 0.3, "sine", d, 0.2);
          tone(1520, 1520, 0.1, 0.3, "sine", d, 0.2);
        }
        break;
      }

      case "glass":
        burst("highpass", 4200, 0.6, 0.26, 0.25, rand(-0.4, 0.4));
        for (let i = 0; i < 7; i++) {
          tone(rand(2200, 5200), rand(1400, 3200), 0.06, rand(0.1, 0.3), "triangle", rand(0.02, 0.5), rand(-0.7, 0.7));
        }
        break;

      case "wind":
        burst("bandpass", 420, 1.1, 0.13, 3.4, -0.8, 1500, 0.8);
        break;

      case "chant": {
        // Many voices on one syllable, each slightly detuned. The beating
        // between them is what makes it sound like a crowd rather than a chord.
        this.duck(300);
        const root = 116;
        for (let i = 0; i < 6; i++) {
          tone(root * (1 + rand(-0.012, 0.012)), root * (1 + rand(-0.012, 0.012)), 0.07, 2.6, "sawtooth", rand(0, 0.25), rand(-0.7, 0.7));
        }
        tone(root * 1.5, root * 1.5, 0.05, 2.4, "triangle", 0.2);
        break;
      }

      case "laugh": {
        // A child, at the wrong speed. Six short pitched bursts falling away.
        for (let i = 0; i < 6; i++) {
          const f = 900 - i * 60;
          burst("bandpass", f, 7, 0.09, 0.12, rand(-0.6, 0.6), f * 0.7, undefined, i * 0.15);
        }
        break;
      }

      case "crawl":
        burst("lowpass", 240, 1.6, 0.15, 2.2, rand(-0.8, -0.3), 90, rand(0.3, 0.8));
        burst("bandpass", 1100, 5, 0.05, 2.2, -0.5, 700, 0.5);
        break;

      case "radio": {
        // A tuner crossing three stations and finding none of them.
        burst("highpass", 1800, 0.4, 0.14, 1.8, 0, 3600);
        for (const d of [0.25, 0.75, 1.25]) {
          tone(rand(400, 1400), rand(300, 900), 0.09, 0.22, "square", d);
        }
        break;
      }

      case "riser": {
        // Ten seconds of ascending dread. Use once, before something bad.
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(40, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 9.5);
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.setValueAtTime(300, t);
        filt.frequency.exponentialRampToValueAtTime(5200, t + 9.5);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16 * scale, t + 7.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 10);
        osc.connect(filt).connect(g);
        this.send(g);
        osc.start(t);
        osc.stop(t + 10.2);
        break;
      }

      case "reverse":
        // A rising swell that stops dead, which the ear hears as a sound played
        // backwards — wrong in a way that is hard to name.
        burst("bandpass", 300, 1.4, 0.2, 1.1, 0, 3400);
        tone(90, 760, 0.16, 1.1, "triangle");
        break;

      case "flatline":
        this.duck(1600);
        tone(1000, 1000, 0.13, 2.2, "sine");
        break;

      case "crack":
        burst("bandpass", 1800, 9, 0.2, 0.09, rand(-0.6, 0.6), 400);
        tone(340, 90, 0.14, 0.12, "square", 0.01);
        break;

      case "whoosh":
        // Air across a microphone as a handheld camera is swung. Sweeps the
        // filter up and the pan across at once, which is what makes it read as
        // the room moving rather than a sound being played.
        burst("bandpass", 260, 0.9, 0.12, 0.42, rand(-0.8, -0.3), 2600, rand(0.3, 0.8));
        break;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Teardown                                                               */
  /* ---------------------------------------------------------------------- */

  stop() {
    if (this.heartTimer) window.clearInterval(this.heartTimer);
    if (this.whisperTimer) window.clearInterval(this.whisperTimer);
    if (this.roomTimer) window.clearInterval(this.roomTimer);
    this.heartTimer = null;
    this.whisperTimer = null;
    this.roomTimer = null;
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

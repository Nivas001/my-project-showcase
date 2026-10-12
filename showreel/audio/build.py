"""
Sound design + score for the reel. Everything is synthesised here — no samples,
no stock audio — and every cue is placed from src/timeline.json plus the local
offsets the scenes export, so picture and sound can't drift apart.

    .venv/bin/python audio/build.py   ->  public/audio/score.wav
"""

import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
FPS = TL["fps"]
DUR = TL["duration"] / FPS + 0.0
N = int(DUR * SR)
rng = np.random.default_rng(1729)

# Local offsets mirrored from the scenes (keep in sync with src/scenes/*).
P = dict(enter=0, name=18, chips=64, chipStep=6, float=96, note=150, exit=412)
STATEMENT_BEATS, LIST_AT, LIST_STEP, STATEMENT_EXIT = [0, 30, 60], 150, 12, 262
R = dict(words=70, wordStep=6, ents=[150, 174], model=214, summary=262, summaryStep=7, exit=446)
S = dict(step=15, items=14, stats=236, statStep=10, exit=392)
O = dict(links=70, linkStep=10, note=130, squiggle=44)

sc = TL["scenes"]
t = lambda frame: frame / FPS  # noqa: E731

# --------------------------------------------------------------------------- #
# DSP helpers
# --------------------------------------------------------------------------- #


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo / (SR / 2), min(hi / (SR / 2), 0.999)], btype="band", output="sos")
    return sosfilt(sos, x)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f / (SR / 2), 0.999), output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), btype="high", output="sos"), x)


def noise(n):
    return rng.standard_normal(n)


def pink(n):
    # Voss-ish: white through a -3dB/oct shelf approximation.
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return lfilter(b, a, noise(n)) * 4


def env_exp(n, tau_s):
    return np.exp(-np.arange(n) / (tau_s * SR))


def adsr(n, a, r, curve=2.0):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def pan(mono, p):
    """Equal-power pan, p in [-1, 1]. p may be an array (moving source)."""
    th = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([mono * np.cos(th), mono * np.sin(th)])


def moving_bp(x, centers, q=1.2, block=256):
    """Band-pass whose centre follows `centers` (per-sample Hz). Block-wise
    coefficient updates with carried state — smooth enough for noise sources."""
    out = np.zeros_like(x)
    zi = np.zeros((1, 2))
    for i in range(0, len(x), block):
        c = float(np.clip(centers[min(i, len(centers) - 1)], 40, SR / 2.3))
        lo, hi = c / (1 + 1 / (2 * q)), c * (1 + 1 / (2 * q))
        sos = butter(1, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], btype="band", output="sos")
        out[i : i + block], zi = sosfilt(sos, x[i : i + block], zi=zi)
    return out


def make_ir(seconds, decay, damp_hz=5000, pre=0.012, width=1.0):
    n = int(seconds * SR)
    ir = np.zeros((2, n))
    for ch in range(2):
        nz = noise(n) * np.exp(-np.arange(n) / (decay * SR))
        # Darken the tail over time: blend a low-passed copy in progressively.
        dark = lp(nz, damp_hz * 0.35)
        mixc = np.linspace(0, 1, n) ** 0.6
        ir[ch] = nz * (1 - mixc) + dark * mixc
    ir[1] = ir[0] * (1 - width) + ir[1] * width
    ir[:, : int(pre * SR)] = 0
    ir /= np.sqrt((ir**2).sum(axis=1, keepdims=True))
    return ir


IR_ROOM = make_ir(0.6, 0.12, 7000, pre=0.004)  # a desk in a small room
IR_HALL = make_ir(3.8, 0.9, 4000, pre=0.025)  # the score's space
IR_BIG = make_ir(6.0, 1.6, 2500, pre=0.03)  # impacts


def reverb(stereo, ir, hpf=220):
    # Keep lows out of the tails — that's what makes synthetic reverb boom.
    src = hp(stereo, hpf, 2)
    out = np.stack([fftconvolve(src[c], ir[c])[: stereo.shape[1]] for c in range(2)])
    return out


class Bus:
    def __init__(self):
        self.x = np.zeros((2, N + SR * 8))

    def add(self, sig, at_s, gain=1.0):
        if sig.ndim == 1:
            sig = np.stack([sig, sig])
        i = int(at_s * SR)
        if i < 0:
            sig, i = sig[:, -i:], 0
        n = min(sig.shape[1], self.x.shape[1] - i)
        self.x[:, i : i + n] += sig[:, :n] * gain


# --------------------------------------------------------------------------- #
# Sound effects
# --------------------------------------------------------------------------- #

QWERTY = ["`1234567890-=", "qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./"]


def key_pan(ch):
    for row in QWERTY:
        if ch.lower() in row:
            return (row.index(ch.lower()) / 11 - 0.5) * 0.7
    return 0.0


def keystroke(kind="key"):
    """One mechanical key: down-click, spring/housing ring, bottom-out thock,
    then a softer release click. Every press is randomised a little."""
    n = int(0.16 * SR)
    v = 10 ** (rng.uniform(-2.5, 1.5) / 20)
    big = kind in ("space", "enter")
    # 1) contact click — very short bright transient
    click = hp(noise(n), 2500) * env_exp(n, 0.0009) * 0.9
    # 2) plastic clack — band of the keycap/housing
    f0 = rng.uniform(1800, 3200) * (0.7 if big else 1)
    clack = bp(noise(n), f0 * 0.6, f0 * 1.5) * env_exp(n, 0.012 if not big else 0.02) * 1.6
    # 3) thock — damped low resonances of the case/plate
    tt = np.arange(n) / SR
    thock = np.zeros(n)
    for fr, amp, tau in [
        (rng.uniform(260, 420) * (0.75 if big else 1), 0.9, 0.022),
        (rng.uniform(700, 1100), 0.35, 0.012),
        (rng.uniform(120, 160), 0.6 if big else 0.35, 0.03),
    ]:
        thock += amp * np.sin(2 * np.pi * fr * tt + rng.uniform(0, 6.28)) * np.exp(-tt / tau)
    down = click + clack + thock * 0.55
    # 4) release, 55–95 ms later, quieter and brighter
    rel_at = int(rng.uniform(0.055, 0.095) * SR)
    rel_n = n - rel_at
    rel = bp(noise(rel_n), 2500, 6500) * env_exp(rel_n, 0.006) * 0.35
    rel += 0.2 * np.sin(2 * np.pi * rng.uniform(500, 800) * tt[:rel_n]) * np.exp(-tt[:rel_n] / 0.008)
    down[rel_at:] += rel
    if big:  # stabiliser rattle on space/enter
        rat = int(0.012 * SR)
        down[rat:] += bp(noise(n - rat), 900, 2500) * env_exp(n - rat, 0.01) * 0.5
    return down * v * (1.25 if kind == "enter" else 1)


def whoosh(length, peak_frac=0.62, lo=180, hi=3200, pan_from=0.7, pan_to=-0.7, body=0.5):
    """Air past the mic: noise through a band that sweeps up to the peak and
    back down, louder and brighter at the pass, panned with the motion."""
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    pk = peak_frac
    shape = np.where(x < pk, (x / pk) ** 2.2, ((1 - x) / (1 - pk)) ** 1.4)
    centers = lo + (hi - lo) * shape
    air = moving_bp(pink(n), centers, q=0.9)
    air += 0.5 * moving_bp(noise(n), centers * 2.2, q=1.5)
    low = lp(pink(n), 220) * body
    sig = (air + low * shape) * shape
    sig /= np.max(np.abs(sig)) + 1e-9
    p = pan_from + (pan_to - pan_from) * np.clip((x - 0.2) / 0.7, 0, 1)
    return pan(sig, p)


def impact(size=1.0):
    n = int(2.6 * SR)
    tt = np.arange(n) / SR
    # sub drop
    f = 30 + 55 * np.exp(-tt / 0.18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (0.75 * size))
    # punch
    f2 = 48 + 140 * np.exp(-tt / 0.03)
    punch = np.tanh(2.5 * np.sin(2 * np.pi * np.cumsum(f2) / SR)) * np.exp(-tt / 0.12)
    # crack
    crack = hp(noise(n), 1800) * env_exp(n, 0.018) * 0.6
    # low rumble body
    rumble = lp(pink(n), 140) * np.exp(-tt / (0.9 * size)) * 0.45
    m = sub * 1.0 + punch * 0.7 + crack + rumble
    return np.tanh(m * 1.2) * 0.9


def riser(length, lo=300, hi=6000):
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    centers = lo * (hi / lo) ** (x**1.6)
    air = moving_bp(pink(n), centers, q=1.4)
    # tonal layer: rising sine with accelerating tremolo
    ph = 2 * np.pi * np.cumsum(110 * 2 ** (x * 2.5)) / SR
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 22 * x**2) / SR)
    tone = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * trem * 0.25
    sig = (air / (np.max(np.abs(air)) + 1e-9) + tone) * x**2.4
    return sig / (np.max(np.abs(sig)) + 1e-9)


def scribble(length):
    """Marker on paper: bursts of bright friction noise, one per stroke."""
    n = int(length * SR)
    e = np.zeros(n)
    i = 0
    while i < n:
        d = int(rng.uniform(0.04, 0.12) * SR)
        g = rng.uniform(0.5, 1.0)
        seg = np.sin(np.linspace(0, np.pi, d)) ** 0.7 * g
        e[i : i + d] += seg[: max(0, min(d, n - i))]
        i += d + int(rng.uniform(0.0, 0.03) * SR)
    fric = bp(noise(n), 2200, 7500) + 0.5 * bp(noise(n), 900, 2000)
    # tiny pitch of felt tip squeak
    tt = np.arange(n) / SR
    squeak = np.sin(2 * np.pi * (3100 + 300 * np.sin(2 * np.pi * 7 * tt)) * tt) * 0.05
    return (fric * 0.6 + squeak) * e * adsr(n, 0.01, 0.05)


def tick(freq=2600, gain=1.0):
    n = int(0.06 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * tt) * np.exp(-tt / 0.012) * 0.6
    s += hp(noise(n), 4000) * env_exp(n, 0.0015) * 0.5
    return s * gain


def blip(f1=1318.5, f2=1760.0):
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f1 * tt) * adsr(n, 0.004, 0.0) * np.exp(-tt / 0.09)
    b = np.zeros(n)
    k = int(0.07 * SR)
    b[k:] = np.sin(2 * np.pi * f2 * tt[: n - k]) * np.exp(-tt[: n - k] / 0.16)
    glass = a + b + 0.15 * np.sin(2 * np.pi * f2 * 2 * tt) * np.exp(-tt / 0.05)
    return glass * 0.5


def thump(f=85, tau=0.07):
    n = int(0.4 * SR)
    tt = np.arange(n) / SR
    fr = f + 60 * np.exp(-tt / 0.01)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / tau)


def room_tone(length):
    n = int(length * SR)
    x = lp(pink(n), 900) * 0.08 + lp(noise(n), 300) * 0.04
    tt = np.arange(n) / SR
    hum = 0.012 * (np.sin(2 * np.pi * 50 * tt) + 0.5 * np.sin(2 * np.pi * 100 * tt))  # 50Hz mains, India
    fan = bp(noise(n), 180, 420) * 0.05
    return x + hum + fan


# --------------------------------------------------------------------------- #
# Score — D minor, 120 bpm
# --------------------------------------------------------------------------- #

BPM = TL["bpm"]
BEAT = 60 / BPM
BAR = BEAT * 4
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731

CHORDS = [  # (bass, pad voicing)
    (38, [53, 57, 60, 64, 69]),  # Dm9
    (34, [50, 53, 57, 60, 65]),  # Bbmaj9
    (33, [52, 55, 60, 64, 67]),  # Am7(11)-ish
    (36, [52, 55, 60, 62, 67]),  # Cadd9
]


def saw_additive(freq, n, max_h=40):
    tt = np.arange(n) / SR
    s = np.zeros(n)
    ph = rng.uniform(0, 6.28)
    for h in range(1, max_h + 1):
        if freq * h > 9000:
            break
        s += np.sin(2 * np.pi * freq * h * tt + ph * h) / h
    return s


def pad_note(m, n, cutoff=1400):
    voices = []
    for det in (-9, -3, 4, 10):
        f = m2f(m) * 2 ** (det / 1200)
        voices.append(saw_additive(f, n, 24))
    l = (voices[0] + voices[2]) * 0.5
    r = (voices[1] + voices[3]) * 0.5
    return np.stack([hp(lp(l, cutoff, 2), 140), hp(lp(r, cutoff, 2), 140)])


def pluck(m, length=1.4, bright=0.55):
    """Karplus–Strong string, vectorised via an IIR comb."""
    n = int(length * SR)
    period = SR / m2f(m)
    d = int(period)
    burst = np.zeros(n)
    burst[:d] = lp(noise(d), 2000 + 6000 * bright)
    g = 0.996
    a = np.zeros(d + 2)
    a[0] = 1
    a[d] = -g * 0.5
    a[d + 1] = -g * 0.5
    y = lfilter([1.0], a, burst)
    y = lp(y, 5000)
    return y * adsr(n, 0.002, 0.08) / (np.max(np.abs(y)) + 1e-9)


def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 46 + 110 * np.exp(-tt / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.2)
    click = hp(noise(n), 3000) * env_exp(n, 0.002) * 0.25
    return np.tanh((body + click) * 1.6) * 0.8


def clap():
    n = int(0.5 * SR)
    e = np.zeros(n)
    for off in (0, 0.011, 0.023):
        k = int(off * SR)
        e[k:] += np.exp(-np.arange(n - k) / (0.006 * SR))
    tail = int(0.03 * SR)
    e[tail:] += 0.6 * np.exp(-np.arange(n - tail) / (0.07 * SR))
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * 185 * tt) * np.exp(-tt / 0.04) * 0.4
    return bp(noise(n), 900, 4200) * e * 0.8 + body


def hat(open_=False):
    n = int((0.35 if open_ else 0.08) * SR)
    tt = np.arange(n) / SR
    metal = sum(np.sign(np.sin(2 * np.pi * f * tt)) for f in (205.3, 304.4, 369.6, 522.7, 540.0, 800.0))
    s = hp(bp(metal, 6000, 14000) * 0.4 + noise(n) * 0.6, 7000)
    return s * np.exp(-tt / (0.12 if open_ else 0.022)) * 0.35


def sections():
    s0 = t(sc["title"][0])
    return [
        ("intro", s0, t(sc["statement"][0])),
        ("build", t(sc["statement"][0]), t(sc["projects"][0])),
        ("groove", t(sc["projects"][0]), t(sc["research"][0])),
        ("break", t(sc["research"][0]), t(sc["stack"][0])),
        ("drop", t(sc["stack"][0]), t(sc["outro"][0])),
        ("outro", t(sc["outro"][0]), DUR),
    ]


def build_score():
    music = Bus()
    drums = Bus()
    bassb = Bus()
    sidechain_hits = []
    bar_i = 0
    for name, a, b in sections():
        # bars restart on each section's downbeat (sections start on beats)
        bt = a
        while bt < b - 0.05:
            bar_end = min(bt + BAR, b)
            blen = bar_end - bt
            bass_m, voicing = CHORDS[bar_i % len(CHORDS)]
            if name == "outro":
                bass_m, voicing = CHORDS[0]
            n = int((blen + 1.2) * SR)
            # ---- pad
            if name != "outro" or bt == a:
                L = n if name != "outro" else int((b - a + 0.5) * SR)
                cutoff = {"intro": 900, "build": 1300, "groove": 1700, "break": 650, "drop": 2200, "outro": 1500}[name]
                p = sum(pad_note(m, L, cutoff) for m in voicing) / len(voicing)
                e = adsr(L, 0.5 if name in ("intro", "outro") else 0.08, 0.9 if name != "outro" else 5.0, 1.5)
                if name == "intro" and bt == a:
                    e *= np.linspace(0, 1, L) ** 0.5
                gain = {"intro": 0.5, "build": 0.55, "groove": 0.5, "break": 0.6, "drop": 0.55, "outro": 0.7}[name]
                music.add(p * e, bt, gain)
            # ---- bass
            if name in ("build", "groove", "drop"):
                for k in range(4 if name != "build" else 2):
                    st = bt + k * BEAT * (1 if name != "build" else 2)
                    if st >= bar_end - 0.01:
                        break
                    ln = BEAT * (0.9 if name != "build" else 1.8)
                    nn = int(ln * SR)
                    tt = np.arange(nn) / SR
                    f = m2f(bass_m)
                    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.tanh(3 * np.sin(2 * np.pi * f * 2 * tt)) * 0.5
                    s = lp(s, 380) * adsr(nn, 0.006, 0.08)
                    bassb.add(s, st, 0.38)
            if name == "outro" and bt == a:
                nn = int(6 * SR)
                tt = np.arange(nn) / SR
                s = np.sin(2 * np.pi * m2f(26) * tt) * np.exp(-tt / 2.2)
                bassb.add(s, bt, 0.6)
            # ---- plucked arp (16ths), thinner in the build and break
            if name in ("groove", "break", "drop", "intro"):
                pattern = [0, 2, 4, 1, 3, 2, 4, 1]
                notes = [m + 12 for m in voicing]
                step = BEAT / 2 if name in ("intro", "break") else BEAT / 4
                k = 0
                st = bt
                while st < bar_end - 0.01:
                    if name == "intro" and st < a + 2.0:
                        st += step
                        k += 1
                        continue
                    m = notes[pattern[k % len(pattern)] % len(notes)]
                    vel = (0.8 if k % 4 == 0 else 0.5) * rng.uniform(0.85, 1.0)
                    pl = pluck(m, 1.2, bright=0.35 + 0.3 * vel)
                    pp = rng.uniform(-0.5, 0.5)
                    g = {"intro": 0.13, "groove": 0.14, "break": 0.18, "drop": 0.15}[name]
                    music.add(pan(pl, pp), st, g * vel)
                    # dotted-8th ping-pong echo
                    music.add(pan(pl, -pp), st + BEAT * 0.75, g * vel * 0.35)
                    st += step
                    k += 1
            # ---- drums
            if name in ("build", "groove", "drop"):
                for k in range(4):
                    st = bt + k * BEAT
                    if st >= bar_end - 0.01:
                        break
                    if name == "build" and k % 2:
                        continue
                    drums.add(kick(), st, 0.72)
                    sidechain_hits.append(st)
                    if name != "build" and k in (1, 3):
                        drums.add(clap(), st, 0.42)
                for k in range(16 if name != "build" else 8):
                    st = bt + k * (BEAT / 4 if name != "build" else BEAT / 2)
                    if st >= bar_end - 0.01:
                        break
                    v = (0.9 if k % 2 else 0.45) * rng.uniform(0.7, 1.0)
                    swing = (BEAT / 4) * 0.12 if (k % 2 and name != "build") else 0
                    drums.add(pan(hat(open_=(k % 8 == 6 and name == "drop")), rng.uniform(0.1, 0.35)), st + swing, 0.5 * v)
            bt += BAR
            bar_i += 1

    # Sidechain: duck pad/arp/bass under each kick.
    duck = np.ones(music.x.shape[1])
    for st in sidechain_hits:
        i = int(st * SR)
        L = int(0.32 * SR)
        curve = 1 - 0.55 * np.exp(-np.arange(L) / (0.09 * SR))
        duck[i : i + L] = np.minimum(duck[i : i + L], curve[: len(duck[i : i + L])])
    music.x *= duck
    bassb.x *= duck

    wet = reverb(music.x, IR_HALL)
    drum_wet = reverb(drums.x * np.array([[1], [1]]), IR_ROOM)
    mix = music.x * 0.75 + wet * 0.45 + bassb.x + drums.x * 0.8 + drum_wet * 0.18
    return mix


# --------------------------------------------------------------------------- #
# Cue sheet
# --------------------------------------------------------------------------- #


def build_sfx():
    fx = Bus()
    verb_send = Bus()  # into the big space
    room_send = Bus()

    # Cold open — room, keys, terminal ticks, the suck into the cut.
    co_end = t(sc["coldOpen"][1])
    rt = room_tone(co_end + 0.4) * adsr(int((co_end + 0.4) * SR), 0.8, 0.3)
    fx.add(rt, 0, 0.55)
    for line in TL["typing"]["lines"]:
        for ch, fr in zip(line["text"], line["frames"]):
            k = keystroke("space" if ch == " " else "key")
            s = pan(k, key_pan(ch))
            fx.add(s, t(fr) - 0.004, 0.55)
            room_send.add(s, t(fr), 0.42)
        k = pan(keystroke("enter"), 0.35)
        fx.add(k, t(line["enter"]) - 0.004, 0.62)
        room_send.add(k, t(line["enter"]), 0.5)
    e2 = TL["typing"]["lines"][1]["enter"]
    for i, d in enumerate((10, 20, 30)):
        fx.add(pan(tick(1900 + i * 240, 0.5), 0.1), t(e2 + d), 0.35)
    r = riser(t(330 - 250), 200, 7000)
    fx.add(pan(r, 0), t(250), 0.38)
    verb_send.add(pan(r, 0), t(250), 0.2)

    # Title — the hit, a pen line, out.
    T0 = sc["title"][0]
    hit = impact(1.2)
    fx.add(hit, t(T0), 0.95)
    verb_send.add(hit, t(T0), 0.55)
    fx.add(pan(tick(2200, 0.4), -0.2), t(T0 + 104), 0.25)
    fx.add(pan(tick(2400, 0.4), -0.1), t(T0 + 116), 0.25)
    fx.add(pan(scribble(0.42), -0.25), t(T0 + 148), 0.32)
    w = whoosh(1.1, 0.6, 150, 2400, 0.0, 0.0, body=0.6)
    fx.add(w, t(T0 + 296) - 0.45, 0.42)

    # Statement — three hits on the beat, the note, the list, the whip out.
    S0 = sc["statement"][0]
    for i, b in enumerate(STATEMENT_BEATS):
        th = thump(70 - i * 6, 0.11)
        fx.add(th, t(S0 + b), 0.75)
        fx.add(hp(noise(int(0.05 * SR)), 2000) * env_exp(int(0.05 * SR), 0.004), t(S0 + b), 0.25)
        verb_send.add(th, t(S0 + b), 0.25)
    fx.add(pan(scribble(0.65), 0.3), t(S0 + 84), 0.32)
    for i in range(5):
        fx.add(pan(tick(1800 + i * 180, 0.6), -0.6 + i * 0.3), t(S0 + LIST_AT + i * LIST_STEP), 0.3)

    # Projects
    P0 = sc["projects"][0]
    L = TL["projectLen"]
    # whip from statement into project 1
    w = whoosh(1.0, 0.62, 160, 3600, 0.8, -0.8)
    fx.add(w, t(S0 + STATEMENT_EXIT) + 0.05, 0.6)
    verb_send.add(w, t(S0 + STATEMENT_EXIT) + 0.05, 0.12)
    for i in range(5):
        st = P0 + i * L
        for k in range(6):
            fx.add(pan(tick(2400 + 150 * k, 0.45), -0.55 + 0.15 * k), t(st + P["chips"] + k * P["chipStep"]), 0.2)
        # floating screen lands: soft swish + body
        sw = whoosh(0.55, 0.75, 400, 2600, -0.2, -0.4, body=0.2)
        fx.add(sw, t(st + P["float"]) - 0.12, 0.22)
        fx.add(pan(thump(110, 0.05), -0.3), t(st + P["float"] + 22), 0.28)
        fx.add(pan(scribble(0.55), 0.3), t(st + P["note"]), 0.27)
        # the whip to the next project (or into research)
        last = i == 4
        w = whoosh(1.05 if not last else 1.4, 0.55, 140, 3800 if not last else 2400, 0.85, -0.85, body=0.7)
        fx.add(w, t(st + P["exit"]) - 0.12, 0.62 if not last else 0.5)
        verb_send.add(w, t(st + P["exit"]), 0.1)
        if not last:
            fx.add(thump(58, 0.16), t(st + L), 0.35)

    # Research — quiet, precise.
    R0 = sc["research"][0]
    for i in range(11):
        fx.add(pan(tick(3000, 0.3), -0.5 + i * 0.05), t(R0 + R["words"] + i * R["wordStep"]), 0.12)
    for j, fr in enumerate(R["ents"]):
        b = blip(1318.5 if j == 0 else 1174.7, 1760.0 if j == 0 else 1568.0)
        fx.add(pan(b, -0.4), t(R0 + fr), 0.35)
        verb_send.add(pan(b, -0.4), t(R0 + fr), 0.3)
    # model "thinking": a scatter of soft glassy pings in D minor pentatonic
    for k in range(10):
        m = rng.choice([74, 77, 79, 81, 84, 86])
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        g = np.sin(2 * np.pi * m2f(m) * tt) * np.exp(-tt / 0.06)
        fx.add(pan(g, rng.uniform(-0.3, 0.3)), t(R0 + R["model"]) + k * 0.055, 0.07)
    for i in range(6):
        fx.add(pan(tick(3200, 0.3), 0.4), t(R0 + R["summary"] + i * R["summaryStep"]), 0.12)
    for j in range(2):
        b = blip(1318.5 if j == 0 else 1174.7, 1760.0 if j == 0 else 1568.0)
        fx.add(pan(b, 0.45), t(R0 + R["summary"] + 16 + j * 12), 0.3)
        verb_send.add(pan(b, 0.45), t(R0 + R["summary"] + 16 + j * 12), 0.3)
    rs = riser(t(sc["stack"][0] - R0 - 380), 250, 8000)
    fx.add(pan(rs, 0), t(R0 + 380), 0.42)
    verb_send.add(pan(rs, 0), t(R0 + 380), 0.25)

    # Stack — a drop, a thock per word on the 8ths, counter rolls.
    K0 = sc["stack"][0]
    hit = impact(0.8)
    fx.add(hit, t(K0), 0.7)
    verb_send.add(hit, t(K0), 0.35)
    for i in range(S["items"]):
        k = keystroke("key") * 0.8
        k += thump(140 + i * 8, 0.03)[: len(k)] * 0.25
        fx.add(pan(k, -0.3 + i * 0.045), t(K0 + i * S["step"]), 0.3)
    for i in range(4):
        st = t(K0 + S["stats"] + i * S["statStep"])
        # mechanical counter: clicks that slow down as the number settles
        tt = 0.0
        gap = 0.028
        while tt < 0.8:
            fx.add(pan(tick(2800 + i * 200, 0.35), -0.5 + i * 0.33), st + tt, 0.14)
            tt += gap
            gap *= 1.13
    w = whoosh(0.9, 0.7, 200, 4000, 0.0, 0.0, body=0.5)
    fx.add(w, t(K0 + S["exit"]) - 0.25, 0.4)

    # Outro — the last hit, pen, ticks, long tail.
    O0 = sc["outro"][0]
    hit = impact(1.5)
    fx.add(hit, t(O0), 1.0)
    verb_send.add(hit, t(O0), 0.7)
    fx.add(pan(scribble(0.5), 0.1), t(O0 + O["squiggle"]), 0.3)
    for i in range(3):
        fx.add(pan(tick(2000 + i * 250, 0.5), -0.3), t(O0 + O["links"] + i * O["linkStep"]), 0.25)
    fx.add(pan(scribble(0.7), 0.4), t(O0 + O["note"]), 0.28)

    out = fx.x + reverb(verb_send.x, IR_BIG) * 0.5 + reverb(room_send.x, IR_ROOM) * 0.35
    return out


# --------------------------------------------------------------------------- #
# Mix + master
# --------------------------------------------------------------------------- #


def compress(x, thresh_db=-14, ratio=2.5, attack=0.01, release=0.15):
    mono = np.sqrt((x**2).mean(axis=0) + 1e-12)
    env = lfilter([1 - np.exp(-1 / (release * SR))], [1, -np.exp(-1 / (release * SR))], mono)
    lvl = 20 * np.log10(env + 1e-9)
    gr = np.minimum(0, (thresh_db - lvl) * (1 - 1 / ratio))
    g = 10 ** (gr / 20)
    g = lfilter([1 - np.exp(-1 / (attack * SR))], [1, -np.exp(-1 / (attack * SR))], g)
    return x * g


def main():
    print("score…")
    music = build_score()
    print("sfx…")
    sfx = build_sfx()

    # Music sits under the sound design; duck it a little under the big hits.
    music *= 0.5
    # Fade the score in on the first hit, out at the end.
    m_env = np.ones(music.shape[1])
    i0 = int(t(sc["title"][0]) * SR)
    m_env[:i0] = 0
    end = int(DUR * SR)
    fade = int(3.5 * SR)
    m_env[end - fade : end] = np.linspace(1, 0, fade) ** 1.5
    m_env[end:] = 0
    music *= m_env

    mix = music + sfx
    mix = mix[:, :end]
    mix[:, -int(0.4 * SR) :] *= np.linspace(1, 0, int(0.4 * SR))
    mix = hp(mix, 25)
    mix = compress(mix)
    mix = np.tanh(mix * 1.1) / 1.1
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.9

    raw = ROOT / "out/score-raw.wav"
    raw.parent.mkdir(exist_ok=True)
    from scipy.io import wavfile

    wavfile.write(raw, SR, (mix.T * 32767).astype(np.int16))
    dst = ROOT / "public/audio/score.wav"
    # Web loudness: -16 LUFS integrated, -1.5 dBTP.
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), str(dst)],
        check=True,
    )
    print("wrote", dst)


if __name__ == "__main__":
    main()

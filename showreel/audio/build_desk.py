"""
Score + sound design for the "Desk OS" reel (composition DeskReel).

Like audio/build.py, everything is synthesised — no samples — and every cue
comes from src/desk/timeline.json, the file that also times the picture.
The DSP primitives (keys, whooshes, impacts, drums, reverb) are reused from
build.py; this file adds the warmer instruments and the cue sheet.

    .venv/bin/python audio/build_desk.py   ->  public/audio/score-desk.wav
"""

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build as dsp  # noqa: E402  (shared DSP helpers; its main() does not run)
from build import (  # noqa: E402
    SR, adsr, blip, bp, clap, compress, env_exp, hat, hp, impact, key_pan, keystroke, kick, lp,
    noise, pan, pink, reverb, riser, room_tone, scribble, thump, tick, whoosh,
)

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/desk/timeline.json").read_text())
FPS = TL["fps"]
DUR = TL["duration"] / FPS
N = int(DUR * SR)
rng = np.random.default_rng(2026)
dsp.rng = rng

sc = TL["scenes"]
t = lambda frame: frame / FPS  # noqa: E731
BPM = TL["bpm"]
BEAT = 60 / BPM
BAR = BEAT * 4
OV = TL["projectOverlap"]
PL = TL["projectLen"]
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731


class Bus:
    def __init__(self):
        self.x = np.zeros((2, N + SR * 10))

    def add(self, sig, at_s, gain=1.0):
        if sig.ndim == 1:
            sig = np.stack([sig, sig])
        i = int(at_s * SR)
        if i < 0:
            sig, i = sig[:, -i:], 0
        n = min(sig.shape[1], self.x.shape[1] - i)
        if n > 0:
            self.x[:, i : i + n] += sig[:, :n] * gain


IR_ROOM = dsp.make_ir(0.5, 0.1, 7000, pre=0.004)
IR_HALL = dsp.make_ir(3.2, 0.8, 4500, pre=0.02)
IR_BIG = dsp.make_ir(5.0, 1.3, 3000, pre=0.03)

# --------------------------------------------------------------------------- #
# Instruments
# --------------------------------------------------------------------------- #


def ep(m, length, vel=0.8):
    """Electric piano: two-operator FM with a tine transient and a slow autopan."""
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = m2f(m)
    idx = (1.5 * vel + 0.3) * np.exp(-tt / 0.32) + 0.22
    body = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * tt))
    body += 0.18 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt / 0.6)
    tine = 0.22 * vel * np.sin(2 * np.pi * f * 7.02 * tt) * np.exp(-tt / 0.035)
    env = np.exp(-tt / (1.9 - 0.012 * (m - 48))) * adsr(n, 0.003, min(0.12, length * 0.3), 1.0)
    s = np.tanh((body + tine) * env * 1.3) * 0.75
    p = 0.35 * np.sin(2 * np.pi * 3.6 * tt + rng.uniform(0, 6))
    return pan(s, p)


def bell(m, length=2.4, vel=1.0):
    """Glassy FM bell for the motif and the chime (ratio 3.5 gives the shimmer)."""
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = m2f(m)
    idx = 2.2 * vel * np.exp(-tt / 0.18) + 0.4
    s = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * 3.5 * tt))
    s += 0.3 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt / 0.4)
    return s * np.exp(-tt / (length * 0.38)) * adsr(n, 0.002, 0.05) * 0.5


def square(m, length, duty=0.5):
    """Chiptune pulse, band-limited by a low-pass."""
    n = int(length * SR)
    tt = np.arange(n) / SR
    ph = (m2f(m) * tt) % 1
    s = np.where(ph < duty, 1.0, -1.0)
    return lp(s, 5000) * adsr(n, 0.002, 0.02) * 0.25


def pad(ms, length, cutoff=1600):
    n = int(length * SR)
    out = np.zeros((2, n))
    for m in ms:
        for det, side in ((-7, 0), (6, 1), (-2, 1), (3, 0)):
            out[side] += dsp.saw_additive(m2f(m) * 2 ** (det / 1200), n, 20)
    out = np.stack([hp(lp(out[0], cutoff, 2), 160), hp(lp(out[1], cutoff, 2), 160)])
    return out / (len(ms) * 2.5)


def bass(m, length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = m2f(m)
    s = np.sin(2 * np.pi * f * tt) + 0.3 * np.tanh(2.5 * np.sin(2 * np.pi * 2 * f * tt))
    return lp(s, 420) * adsr(n, 0.004, min(0.06, length * 0.4)) * np.exp(-tt / 0.9)


def shaker():
    n = int(0.09 * SR)
    e = np.sin(np.linspace(0, np.pi, n)) ** 3
    return bp(noise(n), 5000, 11000) * e * 0.3


def snap():
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    s = bp(noise(n), 1500, 6000) * np.exp(-tt / 0.03)
    s += 0.5 * np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / 0.008)
    return s * 0.6


def crackle(length):
    n = int(length * SR)
    x = lp(pink(n), 2500) * 0.02
    k = rng.random(n) < 30 / SR
    clicks = np.convolve(k * rng.uniform(-1, 1, n), np.exp(-np.arange(40) / 6), "same")
    return hp(x + clicks * 0.25, 400)


# F major. (bass, EP voicing)
CHORDS = [
    (41, [57, 60, 64, 67]),  # Fmaj9
    (38, [57, 60, 64, 65]),  # Dm9
    (34, [57, 60, 62, 65]),  # Bbmaj9 (no 3rd doubled)
    (36, [55, 60, 62, 64]),  # C6/9
]
# Two-bar motif, (beat, midi): F major pentatonic.
MOTIF = [
    [(0, 72), (0.75, 69), (1.5, 65), (2.0, 67), (3.0, 69)],
    [(0, 72), (0.75, 74), (1.5, 72), (2.5, 69), (3.0, 67)],
]
BASS_STEPS = [(0, 0, 0.42), (3, 0, 0.18), (6, 12, 0.2), (8, 0, 0.36), (11, 0, 0.18), (14, 7, 0.2)]


def section_at(ts):
    s = lambda k: t(sc[k][0])  # noqa: E731
    if ts < s("title"):
        return None
    if ts < s("statement"):
        return "intro"
    if ts < s("index"):
        return "hits"
    if ts < s("projects"):
        return "build"
    if ts < s("desk"):
        return "groove"
    if ts < s("research"):
        return "groove2"
    if ts < s("orbit"):
        return "break"
    if ts < t(sc["orbit"][0] + TL["orbit"]["stamp"]):
        return "rise"
    if ts < s("outro"):
        return "drop"
    return "outro"


def build_score():
    music, drums, low = Bus(), Bus(), Bus()
    kicks = []
    start = t(sc["title"][0])
    end = t(sc["outro"][0])
    bar_i = 0
    bt = start
    while bt < end - 0.01:
        sec = section_at(bt + 0.01)
        bm, voicing = CHORDS[bar_i % 4]
        full = sec in ("groove", "groove2", "drop")
        # --- EP
        if sec in ("intro", "break"):
            for j, m in enumerate(voicing):
                music.add(ep(m, BAR + 1.5, 0.55), bt + j * 0.018, 0.2)
        elif sec == "hits":
            # the three hits are cues below; a bed carries the rest of the line
            L = BAR + 1.0
            music.add(pad(voicing, L, 1300) * adsr(int(L * SR), 0.6 if bt == t(sc["statement"][0]) else 0.2, 0.8), bt, 0.5)
            if bt > t(sc["statement"][0]) + 0.1:
                for k in range(8):
                    drums.add(pan(shaker(), -0.25), bt + k * BEAT / 2 + BEAT / 4, 0.32)
                for j, m in enumerate(voicing):
                    music.add(ep(m, BAR, 0.45), bt + j * 0.02, 0.12)
        else:
            music.add(sum(ep(m, BAR * 0.9, 0.5) for m in voicing), bt, 0.08)
            for k in range(4):
                if sec == "build" and k % 2 == 0:
                    continue
                st = bt + k * BEAT + BEAT / 2
                v = 0.75 if k % 2 else 0.6
                music.add(sum(ep(m + 12 * (sec == "drop" and k == 3), 0.32, v) for m in voicing), st, 0.075)
        # --- pad bed
        if sec in ("intro", "break", "groove2", "rise"):
            cut = {"intro": 1100, "break": 900, "groove2": 1500, "rise": 1000 + 2500 * (bt - t(sc["orbit"][0])) / 6}[sec]
            music.add(pad(voicing, BAR + 1.0, cut) * adsr(int((BAR + 1.0) * SR), 0.4, 0.9), bt, 0.55)
        # --- bass
        if full or sec in ("build", "rise"):
            for step, off, ln in BASS_STEPS:
                if sec in ("build", "rise") and step not in (0, 8):
                    continue
                low.add(bass(bm + off, ln * 1.6), bt + step * BEAT / 4, 0.42)
        # --- motif
        if sec in ("groove", "drop") or (sec == "groove2" and bar_i % 4 >= 2):
            for b, m in MOTIF[bar_i % 2]:
                s = bell(m, 1.6, 0.8)
                pp = rng.uniform(-0.3, 0.3)
                music.add(pan(s, pp), bt + b * BEAT, 0.09)
                music.add(pan(s, -pp), bt + b * BEAT + BEAT * 0.75, 0.035)
        if sec == "break":
            for k in range(3):
                m = rng.choice([77, 79, 81, 84])
                music.add(pan(bell(m, 2.2, 0.5), rng.uniform(-0.6, 0.6)), bt + rng.choice([0.5, 1.5, 2.5, 3.5]) * BEAT, 0.05)
        # --- drums
        if full or sec in ("build", "rise"):
            for k in range(4):
                st = bt + k * BEAT
                if sec == "groove2" and bar_i % 8 in (0, 1):
                    break  # the desk opens with two bars of air
                drums.add(kick(), st, 0.62 if sec != "build" else 0.5)
                kicks.append(st)
                if full and k in (1, 3):
                    drums.add(clap(), st, 0.3)
                    drums.add(snap(), st + 0.004, 0.18)
            for k in range(16):
                st = bt + k * BEAT / 4 + ((BEAT / 4) * 0.1 if k % 2 else 0)
                if sec in ("build",) and k % 4 != 2:
                    continue
                if k % 4 == 2:
                    drums.add(pan(hat(open_=(sec == "drop" and k == 14)), 0.25), st, 0.42)
                elif full:
                    drums.add(pan(shaker(), -0.3), st, 0.36 * rng.uniform(0.6, 1.0))
        if sec == "intro" and bt >= start + BAR * 2:
            for k in range(8):
                drums.add(pan(shaker(), -0.25), bt + k * BEAT / 2 + BEAT / 4, 0.35)
        if sec == "rise":
            # snare roll that tightens into the stamp
            st = bt
            gap = BEAT / 2 if bt < t(sc["orbit"][0]) + BAR else BEAT / 4
            while st < min(bt + BAR, t(sc["orbit"][0] + TL["orbit"]["stamp"])) - 0.01:
                drums.add(snap(), st, 0.12 + 0.2 * (st - t(sc["orbit"][0])) / 6)
                st += gap if st < t(sc["orbit"][0] + TL["orbit"]["stamp"]) - BAR / 2 else BEAT / 8
        bt += BAR
        bar_i += 1

    # outro: one long Fmaj9 under the sign-off, then the bloom at the end card
    O0 = t(sc["outro"][0])
    for j, m in enumerate([53, 57, 60, 64, 67, 72]):
        music.add(ep(m, 7.0, 0.5), O0 + j * 0.03, 0.15)
    music.add(pad([53, 57, 60, 64, 67], 9.0, 1300) * adsr(int(9 * SR), 1.0, 4.0), O0, 0.5)
    low.add(bass(29, 6.0) * 0.8, O0, 0.5)
    for b, m in MOTIF[0]:
        music.add(pan(bell(m, 2.0, 0.7), 0.2), O0 + 2 * BAR + b * BEAT * 1.25, 0.08)

    # sidechain
    duck = np.ones(music.x.shape[1])
    for st in kicks:
        i = int(st * SR)
        L = int(0.3 * SR)
        curve = 1 - 0.5 * np.exp(-np.arange(L) / (0.08 * SR))
        duck[i : i + L] = np.minimum(duck[i : i + L], curve[: len(duck[i : i + L])])
    music.x *= duck
    low.x *= duck

    wet = reverb(music.x, IR_HALL)
    dw = reverb(drums.x, IR_ROOM)
    return music.x * 0.8 + wet * 0.4 + low.x + drums.x * 0.75 + dw * 0.15


# --------------------------------------------------------------------------- #
# Sound effects
# --------------------------------------------------------------------------- #


def pop(f0=420, f1=1100):
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    fr = f0 + (f1 - f0) * (1 - np.exp(-tt / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.03)
    s += hp(noise(n), 3000) * env_exp(n, 0.002) * 0.4
    return s * 0.7


def slap():
    """Paper hitting the desk: a flat crack, some body, a little air."""
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    s = bp(noise(n), 400, 3500) * np.exp(-tt / 0.018) * 1.2
    s += np.sin(2 * np.pi * (110 + 90 * np.exp(-tt / 0.01)) * tt) * np.exp(-tt / 0.05) * 0.6
    s += bp(noise(n), 3000, 9000) * np.exp(-tt / 0.006) * 0.4
    return s


def swish(length=0.75, pan_from=0.8, pan_to=-0.6):
    """A sheet of paper sliding across the desk: friction, then a soft landing."""
    n = int(length * SR)
    x = np.linspace(0, 1, n)
    shape = np.sin(np.pi * np.clip(x / 0.92, 0, 1)) ** 1.5
    fric = bp(pink(n), 1200, 7000) * 1.2 + bp(noise(n), 4000, 9000) * 0.3
    s = fric * shape
    s += lp(pink(n), 300) * shape * 0.5
    s /= np.max(np.abs(s)) + 1e-9
    return pan(s, pan_from + (pan_to - pan_from) * x)


def crt_on():
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    thunk = np.sin(2 * np.pi * (70 + 60 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.12)
    hum = sum(np.sin(2 * np.pi * 50 * k * tt) / k for k in (1, 2, 3, 5)) * np.exp(-tt / 0.5) * 0.35
    zap = bp(noise(n), 2000, 8000) * np.exp(-tt / 0.08) * 0.5
    whine = np.sin(2 * np.pi * 7800 * tt) * adsr(n, 0.3, 0.6) * 0.02
    return thunk + hum + zap + whine


def static(length):
    n = int(length * SR)
    s = bp(noise(n), 800, 9000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 9 * np.arange(n) / SR)))
    return s * adsr(n, 0.02, 0.1) * 0.25


def chime():
    """The startup chord: our own, F major add9 in bells, wide and long."""
    out = np.zeros((2, int(4.5 * SR)))
    for j, m in enumerate([41, 53, 60, 65, 69, 72, 79]):
        b = bell(m, 4.4, 0.6) + 0.5 * dsp.pluck(m, 4.4, 0.4)[: int(4.4 * SR)]
        p = pan(b, (j / 6 - 0.5) * 0.9)
        out[:, : p.shape[1]] += p
    return out * 0.32


def power_off():
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    fr = 2400 * np.exp(-tt / 0.06) + 60
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.18) * 0.5
    s += bp(noise(n), 1500, 6000) * np.exp(-tt / 0.03) * 0.4
    return s


def build_sfx():
    fx, big, room = Bus(), Bus(), Bus()
    B = TL["boot"]

    # ---------------- boot
    fx.add(room_tone(t(B["blue"] + 60)) * adsr(int(t(B["blue"] + 60) * SR), 0.8, 0.4), 0, 0.5)
    k = pan(keystroke("enter") * 0.8, 0.2)
    fx.add(k, t(B["power"]), 0.7)
    room.add(k, t(B["power"]), 0.4)
    fx.add(crt_on(), t(B["crtOn"]), 0.55)
    fx.add(static(t(B["logo"] - B["bars"])), t(B["bars"]), 0.4)
    c = chime()
    fx.add(c, t(B["chime"]), 0.6)
    big.add(c, t(B["chime"]), 0.35)
    for i in range(12):
        at = B["logo"] + 10 + i * (B["terminal"] - 14 - B["logo"] - 10) / 12
        fx.add(pan(square(84 + (i % 4) * 2, 0.035, 0.25), 0.1), t(at), 0.25)
    for line in TL["typing"]["lines"]:
        for ch, fr in zip(line["text"], line["frames"]):
            s = pan(keystroke("space" if ch == " " else "key"), key_pan(ch))
            fx.add(s, t(fr) - 0.004, 0.5)
            room.add(s, t(fr), 0.4)
        s = pan(keystroke("enter"), 0.35)
        fx.add(s, t(line["enter"]) - 0.004, 0.6)
        room.add(s, t(line["enter"]), 0.45)
    for i, fr in enumerate(TL["typing"]["out"]):
        fx.add(pan(square(79 + i * 4, 0.06, 0.5), 0.1), t(fr), 0.3)
    r = riser(t(B["blue"] + 52 - (B["plunge"] - 70)), 200, 7000)
    fx.add(pan(r, 0), t(B["plunge"] - 70), 0.36)
    big.add(pan(r, 0), t(B["plunge"] - 70), 0.15)
    w = whoosh(1.4, 0.75, 120, 3000, 0.0, 0.0, body=0.9)
    fx.add(w, t(B["plunge"]) + 0.1, 0.55)

    # ---------------- title
    T0 = sc["title"][0]
    T = TL["title"]
    hit = impact(1.0)
    fx.add(hit, t(T0), 0.7)
    big.add(hit, t(T0), 0.45)
    fx.add(whoosh(1.0, 0.45, 300, 5000, -0.9, 0.9, body=0.3), t(T0) - 0.05, 0.45)
    fx.add(pan(slap(), 0.45), t(T0 + T["portrait"] + 4), 0.7)
    for i, fr in enumerate(T["stickers"]):
        fx.add(pan(pop(380 + i * 60, 1000 + i * 120), [0.2, 0.6, 0.5][i]), t(T0 + fr), 0.45)
    fx.add(pan(scribble(0.38), -0.3), t(T0 + T["marker"]), 0.3)
    fx.add(whoosh(0.8, 0.7, 200, 3000, 0, 0, body=0.4), t(T0 + T["exit"]) - 0.2, 0.3)

    # ---------------- statement: three hits on the beat
    S0 = sc["statement"][0]
    St = TL["statement"]
    for i, b in enumerate(St["beats"]):
        th = thump(66 - i * 5, 0.13)
        fx.add(th, t(S0 + b), 0.75)
        fx.add(sum(ep(m, 0.9, 0.9) for m in CHORDS[i][1]), t(S0 + b), 0.11)
        fx.add(kick(), t(S0 + b), 0.45)
        big.add(th, t(S0 + b), 0.2)
    fx.add(pan(slap(), 0.35), t(S0 + St["note"] + 3), 0.6)
    for i in range(6):
        fx.add(pan(pop(500 + i * 40, 900 + i * 60), -0.6 + i * 0.24), t(S0 + 140 + i * 9), 0.28)
    fx.add(whoosh(1.0, 0.6, 150, 3000, 0.4, -0.8, body=0.5), t(S0 + St["exit"]), 0.4)

    # ---------------- index
    I0 = sc["index"][0]
    Ix = TL["index"]
    for i in range(7):
        fx.add(pan(tick(2200 + i * 150, 0.5), -0.6), t(I0 + Ix["list"] + i * Ix["listStep"]), 0.22)
    fx.add(whoosh(1.0, 0.6, 250, 2600, 0.3, 0.0, body=0.3), t(I0 + Ix["lift"]), 0.35)
    r = riser(t(sc["projects"][0] - (I0 + 120)), 300, 6000)
    fx.add(pan(r, 0), t(I0 + 120), 0.28)

    # ---------------- projects
    P = TL["project"]
    for i in range(6):
        fr0 = sc["projects"][0] + i * PL - OV
        sw = swish(t(OV) + 0.12, 0.9, -0.5)
        fx.add(sw, t(fr0), 0.55)
        room.add(sw, t(fr0), 0.2)
        fx.add(pan(thump(90, 0.05), 0.0), t(fr0 + OV), 0.3)
        for kk in range(5):
            fx.add(pan(tick(2500 + 120 * kk, 0.4), -0.6 + 0.2 * kk), t(fr0 + P["chips"] + kk * P["chipStep"]), 0.16)
        fx.add(pan(slap(), 0.2 if i % 2 == 0 else -0.2), t(fr0 + P["float"] + 6), 0.35)
        fx.add(pan(slap(), 0.5 if i % 2 == 0 else -0.5), t(fr0 + P["note"] + 3), 0.5)
        fx.add(pan(pop(), -0.4 if i % 2 == 0 else 0.4), t(fr0 + P["sticker"]), 0.35)
        if i == 5:  # the month counter
            for j in range(1, 5):
                at = fr0 + 50 + j * 84 - 4
                for q in range(6):
                    fx.add(pan(tick(3000, 0.3), -0.5), t(at) + q * 0.05, 0.12)

    # ---------------- desk
    D0 = sc["desk"][0]
    D = TL["desk"]
    sw = swish(t(OV) + 0.12, 0.9, -0.5)
    fx.add(sw, t(D0 - OV), 0.55)
    for i in range(13):
        fx.add(pan(pop(420 + 30 * (i % 5), 950 + 40 * (i % 4)), rng.uniform(-0.6, 0.6)), t(D0 + D["pop"] + i * D["popStep"]), 0.22)
    for s in D["stops"]:
        fx.add(whoosh(1.1, 0.55, 150, 1800, 0.5, -0.5, body=0.4), t(D0 + s - 64), 0.3)
        fx.add(pan(tick(1900, 0.5), -0.6), t(D0 + s - 10), 0.2)
    fx.add(whoosh(1.0, 0.6, 150, 1600, 0, 0, body=0.4), t(D0 + D["out"]), 0.3)

    # ---------------- research
    R0 = sc["research"][0]
    R = TL["research"]
    sw = swish(t(OV) + 0.12, 0.0, 0.0)
    fx.add(sw, t(R0 - OV), 0.5)
    for i in range(11):
        fx.add(pan(tick(3000, 0.3), -0.5 + i * 0.04), t(R0 + R["words"] + i * R["wordStep"]), 0.12)
    for j, fr in enumerate(R["ents"]):
        b = blip(1396.9 if j == 0 else 1174.7, 1760.0 if j == 0 else 1568.0)
        fx.add(pan(b, -0.4), t(R0 + fr), 0.35)
        big.add(pan(b, -0.4), t(R0 + fr), 0.25)
    for kk in range(10):
        m = rng.choice([77, 79, 81, 84, 86, 89])
        fx.add(pan(square(m, 0.05, 0.25), rng.uniform(-0.3, 0.3)), t(R0 + R["model"]) + kk * 0.06, 0.12)
    for i in range(6):
        fx.add(pan(tick(3200, 0.3), 0.4), t(R0 + R["summary"] + i * R["summaryStep"]), 0.12)
    for j in range(2):
        b = blip(1396.9 if j == 0 else 1174.7, 1760.0 if j == 0 else 1568.0)
        fx.add(pan(b, 0.45), t(R0 + R["summary"] + 18 + j * 12), 0.3)
    fx.add(whoosh(1.2, 0.6, 120, 2400, 0, 0, body=0.6), t(R0 + R["space"]) - 0.1, 0.4)
    fx.add(pan(pop(), 0.5), t(R0 + R["space"] + 54), 0.4)
    fx.add(pan(pop(450, 1000), -0.4), t(R0 + R["space"] + 66), 0.3)

    # ---------------- orbit
    K0 = sc["orbit"][0]
    Ob = TL["orbit"]
    hit = impact(0.7)
    fx.add(hit, t(K0), 0.55)
    big.add(hit, t(K0), 0.3)
    fx.add(whoosh(1.3, 0.7, 150, 3500, -0.4, 0.6, body=0.6), t(K0 + Ob["collapse"]), 0.5)
    hit = impact(1.3)
    fx.add(hit, t(K0 + Ob["stamp"]), 0.95)
    big.add(hit, t(K0 + Ob["stamp"]), 0.55)
    fx.add(pan(slap(), 0.4), t(K0 + Ob["stamp"]), 0.8)
    for i in range(4):
        st = t(K0 + Ob["stats"] + i * Ob["statStep"])
        tt, gap = 0.0, 0.03
        while tt < 0.9:
            fx.add(pan(tick(2800 + i * 200, 0.35), -0.6), st + tt, 0.12)
            tt += gap
            gap *= 1.14
    fx.add(whoosh(0.8, 0.8, 300, 5000, -0.9, 0.9, body=0.3), t(K0 + Ob["exit"] - 12), 0.45)

    # ---------------- outro
    O0 = sc["outro"][0]
    O = TL["outro"]
    w = whoosh(1.2, 0.25, 150, 3000, 0, 0, body=0.6)
    fx.add(w, t(O0), 0.4)
    head = "Let's build yours."
    for i, ch in enumerate(head):
        fr = O0 + O["type"] + i * 2.2
        s = pan(keystroke("space" if ch == " " else "key") * 0.8, key_pan(ch))
        fx.add(s, t(fr), 0.35)
        room.add(s, t(fr), 0.3)
    for i in range(3):
        fx.add(pan(square(84 + i * 3, 0.07, 0.5), 0.0), t(O0 + O["links"] + i * O["linkStep"]), 0.25)
    fx.add(pan(slap(), -0.5), t(O0 + O["notes"][0] + 3), 0.55)
    fx.add(pan(slap(), 0.5), t(O0 + O["notes"][1] + 3), 0.55)
    fx.add(power_off(), t(O0 + O["off"]), 0.6)
    big.add(power_off(), t(O0 + O["off"]), 0.2)
    c = chime()
    fx.add(c, t(O0 + O["card"] + 10), 0.45)
    big.add(c, t(O0 + O["card"] + 10), 0.4)

    return fx.x + reverb(big.x, IR_BIG) * 0.45 + reverb(room.x, IR_ROOM) * 0.3


def main():
    print("score…")
    music = build_score()
    print("sfx…")
    sfx = build_sfx()
    music *= 0.55
    end = int(DUR * SR)
    m_env = np.ones(music.shape[1])
    i0 = int(t(sc["title"][0]) * SR)
    m_env[:i0] = 0
    fade = int(2.5 * SR)
    m_env[end - fade : end] = np.linspace(1, 0, fade) ** 1.5
    m_env[end:] = 0
    music *= m_env

    vinyl = np.stack([crackle(DUR), crackle(DUR)])
    vinyl *= np.clip((np.arange(vinyl.shape[1]) / SR - t(sc["title"][0])) / 2, 0, 1)

    mix = music[:, :end] + sfx[:, :end]
    mix[:, : vinyl.shape[1]] += vinyl[:, :end] * 0.25
    mix[:, -int(0.5 * SR) :] *= np.linspace(1, 0, int(0.5 * SR))
    mix = hp(mix, 25)
    mix = compress(mix)
    mix = np.tanh(mix * 1.1) / 1.1
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.9

    from scipy.io import wavfile

    raw = ROOT / "out/score-desk-raw.wav"
    raw.parent.mkdir(exist_ok=True)
    wavfile.write(raw, SR, (mix.T * 32767).astype(np.int16))
    dst = ROOT / "public/audio/score-desk.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), str(dst)],
        check=True,
    )
    print("wrote", dst)


if __name__ == "__main__":
    main()

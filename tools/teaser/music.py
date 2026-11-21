"""Original soundtrack for the teaser, synthesized from scratch (no samples): a dark pad in A minor, a low drone,
a plucked arpeggio, drum hits on the cuts and a heartbeat drum under the fights. Writes a WAV the length of the video."""
import sys, numpy as np, wave
SR = 44100

def env(n, a, r):
    e = np.ones(n); a = int(a * SR); r = int(r * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e

def tone(f, dur, kind='pad'):
    t = np.arange(int(dur * SR)) / SR
    if kind == 'pad':   # detuned saws, softened
        w = sum(np.sin(2 * np.pi * f * d * t) + 0.35 * np.sin(4 * np.pi * f * d * t) + 0.15 * np.sin(6 * np.pi * f * d * t) for d in (0.997, 1.0, 1.004))
        return w / 4.5 * env(len(t), dur * 0.35, dur * 0.4)
    if kind == 'pluck':
        w = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 9)
        return w * np.exp(-t * 4.5)
    if kind == 'drone':
        return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t)) * env(len(t), 2, 2) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.15 * t))

def drum(dur=0.9, f0=90, f1=38, noise=0.25):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 5) + noise * np.random.default_rng(1).standard_normal(len(t)) * np.exp(-t * 30))

def hz(n): return 440 * 2 ** ((n - 69) / 12)

def build(total, cuts, fights):
    out = np.zeros(int(total * SR) + SR)
    def add(sig, at, g):
        i = int(at * SR); j = min(len(out), i + len(sig))
        if j > i: out[i:j] += sig[:j - i] * g
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
    bar = 4.0; k = 0; t = 0
    while t < total:
        for n in chords[k % 4]: add(tone(hz(n), bar + 1.5, 'pad'), t, 0.11)
        arp = chords[k % 4] + [chords[k % 4][0] + 12]
        if t > 4.5:                                     # plucks come in after the title
            for s in range(8): add(tone(hz(arp[[0, 1, 2, 3, 2, 1, 0, 2][s]] + 12), 1.2, 'pluck'), t + s * bar / 8, 0.07)
        k += 1; t += bar
    add(tone(hz(33), total + 1, 'drone'), 0, 0.12)
    for c in cuts: add(drum(1.2, 80, 32, 0.3), c, 0.55)
    for a, b in fights:                                 # heartbeat: two soft hits a beat, 120 bpm
        t = a
        while t < b: add(drum(0.4, 70, 40, 0.1), t, 0.28); add(drum(0.35, 65, 38, 0.05), t + 0.22, 0.18); t += 0.5
    out = out[:int(total * SR)]
    fade = int(2.5 * SR); out[-fade:] *= np.linspace(1, 0, fade); out[:int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))
    out = np.tanh(out * 1.3); out /= np.abs(out).max() * 1.12
    return out

if __name__ == '__main__':
    import json
    cfg = json.loads(sys.argv[1]); a = build(cfg['total'], cfg['cuts'], cfg['fights'])
    st = np.stack([a, np.roll(a, int(0.012 * SR))], 1)   # a touch of width
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())

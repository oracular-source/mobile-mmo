"""Stalagmite drafts for the rat tunnel (Nov 27, owner: fill the empty cave floor; take 2).
Draws six versions at true game size on cave dirt, with the hero beside each for scale, into out/:
stalagmite_drafts.png (x6) and stalagmite_phone_zoom.png (x2). The hero sprite comes from a 6x in-game
close-up (pass its path; default /tmp/stal_close.png, hero box 408,300-498,414). Run: python3 tools/stalagmite_drafts.py [closeup.png]
What makes them read (real cave photos): rounded blobby tops (pointy tips are stalactites), a wide melted-candle
base, drip ledges (pale lip, dark underside), pale limestone against the dark dirt, wet glints on the lit left side."""
import math, os, random, sys
from collections import deque
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = (11, 10, 15); DIRT = [(58, 49, 39), (54, 46, 37), (62, 52, 41), (51, 43, 34)]
C = dict(wet=(222, 214, 192), hi=(192, 180, 154), lt=(160, 148, 124), md=(126, 116, 97), dk=(92, 83, 68), sh=(62, 55, 45))

def load_hero(path):
    hero = Image.open(path).convert('RGB').crop((408, 300, 498, 414)).resize((15, 19), Image.NEAREST).convert('RGBA')
    hp = hero.load(); w, h = hero.size
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]); seen = set()
    while q:  # key out the background: flood from the edges over anything that isn't the black outline
        x, y = q.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y)); r, g, b, a = hp[x, y]
        if r + g + b < 60: continue
        hp[x, y] = (0, 0, 0, 0); q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    return hero

def ground(w, h, seed):
    random.seed(seed); im = Image.new('RGB', (w, h)); px = im.load()
    for y in range(h):
        for x in range(w): px[x, y] = DIRT[int((x // 8) + (y // 8) * 3 + random.random() * 1.3) % 4]
    for i in range(w * h // 40):
        x, y = random.randrange(w), random.randrange(h); px[x, y] = (76, 64, 50) if i % 2 else (31, 26, 21)
    return im

def mite(px, cx, foot, h, base, seed, broken=False, lean=0.0, shape=None, roof=False):
    """One stalagmite: lumpy drip-wax outline, rounded top, drip ledges, light from the upper left."""
    rnd = random.Random(seed); rows = []; off = 0.0
    ledges = set(); y = rnd.randint(4, 6)
    while y < h - 2: ledges.add(y); y += rnd.randint(4, 7)
    for y in range(h):
        t = y / max(1, h - 1)
        w = shape(t) if shape else base * (0.30 + 0.70 * t ** 1.4)
        w += rnd.uniform(-0.6, 0.6)
        if y in ledges: w += 1.1
        if not broken and not roof and y < 3: w = min(w, [1.6, 2.4, 3.0][y])
        off += rnd.choice([-0.35, 0, 0, 0.35]) + lean
        rows.append((max(1, round(w)), round(off)))
    rows = [(w, o - rows[-1][1]) for w, o in rows]  # the foot stays centred
    for y, (w, o) in enumerate(rows):
        yy = foot - h + y; x0 = cx + o
        for x in range(x0 - w - 1, x0 + w + 2): px[x, yy] = OUT
        for x in range(x0 - w, x0 + w + 1):
            u = (x - (x0 - w)) / max(1, 2 * w)
            c = C['hi'] if u < 0.2 else C['lt'] if u < 0.45 else C['md'] if u < 0.75 else C['dk']
            if u > 0.88: c = C['sh']
            if rnd.random() < 0.12 and 0.2 < u < 0.9: c = C['dk'] if u > 0.5 else C['md']
            px[x, yy] = c
        if y in ledges:  # drip ledge: pale lip on top, dark underside below
            for x in range(x0 - w, x0 + w): px[x, yy] = C['wet'] if x < x0 else C['lt']
            if y + 1 < h:
                w2, o2 = rows[y + 1]
                for x in range(cx + o2 - w2, cx + o2 + w2 + 1): px[x, yy + 1] = C['sh'] if x > cx + o2 - w2 else C['md']
        elif y > 2 and y % 3 == 0: px[x0 - w + 1, yy] = C['wet']
        if roof and y < 12:  # a column fades up into the dark roof
            k = 1 - y / 12
            for x in range(x0 - w - 1, x0 + w + 2):
                r, g, b = px[x, yy]; px[x, yy] = (int(r * (1 - k) + 12 * k), int(g * (1 - k) + 10 * k), int(b * (1 - k) + 9 * k))
    w, o = rows[0]; x0 = cx + o; top = foot - h
    if broken:  # snapped-off top: a flat pale break
        for x in range(x0 - w, x0 + w + 1): px[x, top] = C['wet'] if x < x0 - 1 else C['hi'] if x < x0 + 1 else C['lt']
        for x in range(x0 - w - 1, x0 + w + 2): px[x, top - 1] = OUT
        px[x0, top + 1] = C['md']
    elif not roof:
        for x in range(x0 - w, x0 + w + 1): px[x, top - 1] = OUT
        px[x0 - 1, top] = C['wet']

def skirt(px, cx, foot, r):
    """Flowstone spreading at the foot and a wet dark ring where the drips pool."""
    for y in range(-3, 3):
        for x in range(-r - 3, r + 4):
            d = (x / (r + 3)) ** 2 + (y / 2.8) ** 2
            if 0.55 < d <= 1: px[cx + x, foot + y] = (34, 28, 22)
    for x in range(-r, r + 1):
        px[cx + x, foot + 1] = OUT; px[cx + x, foot] = C['md'] if x < 0 else C['dk']
    for x in range(-r + 2, r - 1): px[cx + x, foot - 1] = C['lt'] if x < 1 else C['md']

def A(px, cx, f): skirt(px, cx, f, 6); mite(px, cx, f - 1, 28, 5.4, 11)
def B(px, cx, f): skirt(px, cx - 1, f, 10); mite(px, cx - 7, f - 1, 13, 3.4, 21); mite(px, cx + 1, f - 2, 24, 4.8, 22); mite(px, cx + 9, f, 8, 2.4, 23)
def Cc(px, cx, f):
    skirt(px, cx, f, 7); mite(px, cx, f - 1, 12, 5.6, 31, broken=True)
    for dx, dy in [(10, 1), (-11, 2), (13, -1)]:  # chips of the broken top lying by it
        px[cx + dx, f + dy] = C['lt']; px[cx + dx + 1, f + dy] = C['md']; px[cx + dx, f + dy + 1] = OUT; px[cx + dx + 1, f + dy + 1] = OUT
def D(px, cx, f): skirt(px, cx, f, 9); mite(px, cx - 3, f - 1, 26, 4.4, 41, lean=0.05); mite(px, cx + 4, f - 1, 18, 4.0, 42, lean=-0.06)
def E(px, cx, f): skirt(px, cx, f, 7); mite(px, cx, f - 1, 48, 5, 51, roof=True, shape=lambda t: 2.6 + 4.2 * abs(t - 0.42) ** 1.2 * 2.0)
def F(px, cx, f):
    for dx, dy, h in [(-9, 0, 6), (-2, -3, 9), (5, 1, 5), (10, -2, 7)]: skirt(px, cx + dx, f + dy, 2); mite(px, cx + dx, f + dy - 1, h, 2.4, 60 + dx)

NAMES = ['A · Tall', 'B · Group', 'C · Broken stump', 'D · Twins', 'E · Column (into the roof)', 'F · Low stubs']
DRAWS = [A, B, Cc, D, E, F]; CW, CH = 56, 66

def main():
    hero = load_hero(sys.argv[1] if len(sys.argv) > 1 else '/tmp/stal_close.png')
    out = os.path.join(ROOT, 'out'); os.makedirs(out, exist_ok=True)
    def tile(i, fn, sc):
        g = ground(CW, CH, i); px = g.load(); fn(px, 24, CH - 8); g = g.convert('RGBA'); g.alpha_composite(hero, (41, CH - 8 - 19))
        return g.convert('RGB').resize((CW * sc, CH * sc), Image.NEAREST)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    except Exception: f = None
    SC = 6; S = Image.new('RGB', (3 * CW * SC + 40, 2 * (CH * SC + 44) + 60), (20, 18, 16)); d = ImageDraw.Draw(S)
    d.text((12, 10), 'Stalagmite drafts, take 2  (true size x6, hero for scale)', fill=(235, 225, 205), font=f)
    for i, fn in enumerate(DRAWS):
        x = 10 + (i % 3) * (CW * SC + 10); y = 50 + (i // 3) * (CH * SC + 44)
        d.text((x, y), NAMES[i], fill=(235, 225, 205), font=f); S.paste(tile(i, fn, SC), (x, y + 30))
    S.save(os.path.join(out, 'stalagmite_drafts.png'))
    P = Image.new('RGB', (6 * (CW * 2 + 8) + 10, CH * 2 + 50), (20, 18, 16)); d = ImageDraw.Draw(P)
    d.text((8, 8), 'At normal phone zoom (x2)', fill=(235, 225, 205), font=f)
    for i, fn in enumerate(DRAWS): P.paste(tile(i, fn, 2), (5 + i * (CW * 2 + 8), 40))
    P.save(os.path.join(out, 'stalagmite_phone_zoom.png'))

if __name__ == '__main__':
    main()

# Draft sprites for Wolfwood's monsters (map chat, Nov 19): blight wolf, Greyfang (named), Old Scar (rare),
# thornback boar. Same text-grid format as js/data/sprites.js (one character per pixel, '.' = see-through), faces right.
# Draws a review sheet: each monster big with its step frame, then a true-size line-up next to the player and a rat.
# Run: python3 tools/wolfwood_mobs.py out/wolfwood_mobs.png   (grids move into sprites.js once the owner OKs them)
import sys
from PIL import Image, ImageDraw, ImageFont

# Wolves are drawn as fill only; outline() adds the black edge, so shapes stay clean. Legs swap for the step frame.
# Keys: A fur light, a fur, d shadow, e/m eye, w tooth, K nose (black), b blight patch, S scar.
WOLF_BODY = [
    "................A.A...",
    "...........AAA..AAAA..",
    ".....AAAAAAaaaAAAaAAA.",
    "....AaaaaaaaaaaaaeaAAA",
    "...AaaabbaaaaaaaaaaaaK",
    "..Aaaaabbaaaaaaadwd...",
    ".Aa.ddaaaaaaaaaadd....",
    "Aa..dddd....ddadd.....",
]
# near legs (x4, x12) in mid fur, far legs (x7, x15) in shadow, so the four read apart at small size
WOLF_STAND = [
    "....a..d....a..d......",
    "....a..d....a..d......",
    "....a..d....a..d......",
    "....aa.dd...aa.dd.....",
]
WOLF_STEP = [
    "....a..d....a..d......",
    "...a....d..a....d.....",
    "..a.....d..a....d.....",
    "..aa....dd.aa...dd....",
]

def outline(rows):
    """Pad by one pixel and turn every empty pixel touching a filled one (up, down, left, right) black."""
    w = max(len(r) for r in rows) + 2
    g = [list('.' * w)] + [list('.' + r.ljust(w - 2, '.') + '.') for r in rows] + [list('.' * w)]
    out = [r[:] for r in g]
    for y in range(len(g)):
        for x in range(w):
            if g[y][x] != '.': continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= yy < len(g) and 0 <= xx < w and g[yy][xx] not in '.k':
                    out[y][x] = 'k'; break
    return [''.join(r).replace('K', 'k') for r in out]

def scale(rows, f):
    """Nearest-neighbour resize of a fill grid (before outlining), for the bigger named wolf."""
    w = max(len(r) for r in rows); rows = [r.ljust(w, '.') for r in rows]; h = len(rows)
    W, H = round(w * f), round(h * f)
    return [''.join(rows[int(j / f)][int(i / f)] for i in range(W)) for j in range(H)]

def put(rows, pts, c):
    rows = [list(r) for r in rows]
    for x, y in pts: rows[y][x] = c
    return [''.join(r) for r in rows]

def wolf(step=False):
    return WOLF_BODY + (WOLF_STEP if step else WOLF_STAND)

def greyfang(step=False):
    # the wolf at 1.25x with a raised ruff over the shoulders and glowing eyes
    g = scale(wolf(step), 1.25)
    g = [r.replace('e', 'm').replace('b', 'a') for r in g]
    g = [list(r) for r in g]
    for x in (12, 14, 16, 18):  # ruff: tufts sticking up along the neck and shoulders
        y = next(yy for yy in range(len(g)) if g[yy][x] != '.')
        if y > 0: g[y - 1][x] = 'A'
    return [''.join(r) for r in g]

def oldscar(step=False):
    # torn ear (the back ear is gone), a pink scar down through a blind eye, no blight
    g = wolf(step)
    g = put(g, [(18, 0), (19, 1)], '.')
    g = [r.replace('e', 'a').replace('b', 'a') for r in g]
    return put(g, [(17, 2), (17, 3), (16, 4)], 'S')

# Boar: drawn with its outline by hand (the thorns sit in it). Legs come from legs().
# Tusk (w) runs out past the snout and curves up at the tip (owner, Nov 19: a little longer, protruding).
BOAR = [
    "........T.T.T..........",
    ".....T.kTkTkTk.........",
    "....kTkAAAAAAAkk.......",
    "...kAAaaaaaaaaAAkk.....",
    "..kAaaaaaaaaaaaaAAk....",
    "kkAaaaaaaaaaaaaaaeAkk..",
    "kkaaaaaaaaaaaaaaaaapkwk",
    ".kaaaaaaaaaaaaaaawwwwk.",
    ".kdaaaaaaaaaaaaaadkkk..",
    "..kddddddddddddddk.....",
]
BOAR_LEGS = [2, 6, 11, 15]

def legs(body, xs, rows=2, step=False):
    """Short boar legs. Step: each pair swings apart, one forward and one back."""
    w = len(body[0]); out = [list('.' * w) for _ in range(rows)]
    for x, s in zip(xs, [-1, 1, -1, 1] if step else [0, 0, 0, 0]):
        for r in range(rows):
            dx = s if r == rows - 1 else 0
            for i, c in enumerate('kdk' if r < rows - 1 else 'kkk'):
                if 0 <= x + dx + i < w: out[r][x + dx + i] = c
    return body + [''.join(r) for r in out]

BASE = {'k': '#0b0a0f'}
PALS = {
    # blight wolf: grey with red eyes, sick grey-green blight patches (b) on the back, ribs showing (d)
    'wolf': {'A': '#a9acb0', 'a': '#7d8086', 'd': '#55585f', 'b': '#6f7a5c', 'e': '#ff3b30', 'w': '#e8e2d4'},
    # Greyfang: silver coat, glowing ice-blue eyes, a raised ruff
    'greyfang': {'A': '#dfe3e8', 'a': '#aeb4be', 'd': '#6c7280', 'm': '#9fe8ff', 'w': '#f4efe2', 'e': '#9fe8ff'},
    # Old Scar: older, browner grey, one blind eye with a pink scar, torn ear
    'oldscar': {'A': '#9a948c', 'a': '#726c66', 'd': '#45413d', 'S': '#c98a86', 'w': '#d8d0bc'},
    # thornback boar: brown, pale thorn ridge (T), pink-brown snout (p), pale tusks (w), small red eye
    'boar': {'A': '#8a6448', 'a': '#6a4a34', 'd': '#43301f', 'T': '#e0d4b4', 'p': '#a0706a', 'e': '#ff3b30', 'w': '#efe6cc'},
}

def frames(name):
    if name == 'boar': return legs(BOAR, BOAR_LEGS), legs(BOAR, BOAR_LEGS, step=True)
    fn = {'wolf': wolf, 'greyfang': greyfang, 'oldscar': oldscar}[name]
    return outline(fn()), outline(fn(True))

def to_img(rows, pal, scale):
    h, w = len(rows), max(len(r) for r in rows)
    im = Image.new('RGBA', (w * scale, h * scale), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c == '.': continue
            col = pal.get(c) or BASE.get(c)
            d.rectangle([x * scale, y * scale, x * scale + scale - 1, y * scale + scale - 1], fill=col)
    return im

# For the true-size line-up: the player (Druid rags at its in-game 15x18) and a grave rat, copied from sprites.js.
DRUID = ["......kLLLLk", ".....kLhLLhLk", "....khhhhhhhhk", "....khhhhhhhhk", "....khsssssshk", "....kssessessk", "....kssssssssk", ".....kssssssk",
         "......kHnnNk", ".....kHnnnnNk", "....kHnnnnnnNk", "...kHnnnnnnnnNk", "...kHnnnnnnnnNk", "...kHyyyyyyyyNkS", "...kHnnnnnnnnNk", "...kHnnnnnnNNNk",
         "...kHnnnnnNNNNk", "...kHnnnnNNNNdk", "...kHkNnkNkNNdk", "....kwwk..kwwk", "....kwwk..kwwk", "....kwwk..kwwk", "....kOOk..kOOk", "....kkkk..kkkk"]
DRUID_PAL = {'y': '#9c8a5a', 'w': '#8a7f70', 'O': '#4a3b33', 'S': '#f0c99a', 's': '#d9a77c', 'e': '#1a1820', 'o': '#6e4a2a', 'L': '#5f8a3a',
             'H': '#686d56', 'n': '#535a44', 'N': '#3e4734', 'd': '#303a28', 'h': '#6e4a2a'}
RAT = ["...........kk...", "......kkkkkkpk..", ".....kAAAAAAAAk.", "....kAaaaaaaAeAk", "P...kaaaaaaaaaAp", ".PPpkdaaaaaaddk.", "...kdkddddkddk..", "....kpk...kpk..."]
RAT_PAL = {'A': '#8a7a6e', 'a': '#6b5d52', 'd': '#463b34', 'p': '#c98a86', 'P': '#9a6a66', 'e': '#ff3b30'}

def shrink(rows, sw=15, sh=18):
    w = max(len(r) for r in rows); rows = [r.ljust(w, '.') for r in rows]; h = len(rows)
    return [''.join(rows[j * h // sh][i * w // sw] for i in range(sw)) for j in range(sh)]

def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        try: return ImageFont.truetype(p, sz)
        except OSError: pass
    return ImageFont.load_default()

def sheet(path):
    S = 10; bg = (46, 54, 46, 255)
    names = [('wolf', 'Blight wolf (8-11), packs of 2-3'), ('greyfang', 'Greyfang (named, 11)'),
             ('oldscar', 'Old Scar (rare)'), ('boar', 'Thornback boar (8-11), charges')]
    W = 1100; H = 1560
    im = Image.new('RGBA', (W, H), bg); d = ImageDraw.Draw(im); f = font(26); fs = font(20)
    d.text((30, 20), 'Wolfwood monsters - draft 4 (stand | step)', font=f, fill=(235, 230, 215))
    y = 70
    for key, label in names:
        a, b = frames(key); pal = PALS[key]
        ia, ib = to_img(a, pal, S), to_img(b, pal, S)
        d.text((30, y), f'{label}  -  {len(a[0])}x{len(a)}', font=fs, fill=(235, 230, 215))
        im.alpha_composite(ia, (30, y + 34)); im.alpha_composite(ib, (60 + ia.width, y + 34))
        y += 34 + ia.height + 36
    # true size line-up on dusk ground, at 4x (roughly how a phone shows it zoomed in)
    d.text((30, y), 'True size next to the player and a rat (4x)', font=fs, fill=(235, 230, 215)); y += 34
    T = 4; x = 30; base = y + 20 * T
    d.rectangle([20, y, W - 20, base + 30], fill=(58, 58, 42, 255))
    line = [(shrink(DRUID), DRUID_PAL), (RAT, RAT_PAL)] + [(frames(k)[0], PALS[k]) for k, _ in names]
    for rows, pal in line:
        i = to_img(rows, pal, T); im.alpha_composite(i, (x, base - i.height)); x += i.width + 28
    im.save(path)

if __name__ == '__main__':
    sheet(sys.argv[1] if len(sys.argv) > 1 else 'wolfwood_mobs.png')

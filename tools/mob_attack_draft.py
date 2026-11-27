"""Mob attack drafts (animation lane, Nov 27): skeleton sword swings, the Skeleton King's overhead swing and a
physical wolf bite, drawn as real frames from the live sprites (never rotated). Not loaded by the game.

Run:  python3 tools/mob_attack_draft.py  ->  art/drafts/mob-attacks-draft1.json (frames for the review page)
                                            art/drafts/mob-attacks-draft1.png  (frame strip)
Owner rule (Nov 27): small mobs attack with their bodies (the wolf lunges and bites with its own jaws, the skeleton
swings the sword in its hand); floating effects are only for spells.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_sprites():
    js = r"""
const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');
const o=new Function(src+';return {UNDEAD_SPR,UNDEAD_PAL,REDO_SPR,REDO_PAL,RAG15,RAG15_COMMON}')();
process.stdout.write(JSON.stringify(o));"""
    out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'js/data/sprites.js')], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

# ---------- tiny pixel canvas: a dict of (x, y) -> palette char ----------
def grid_to_px(rows, ox=0, oy=0):
    return {(x + ox, y + oy): c for y, r in enumerate(rows) for x, c in enumerate(r) if c != '.'}

def line(a, b):
    """Pixels from a to b (Bresenham): how a weapon is drawn at an angle, one pixel at a time."""
    (x0, y0), (x1, y1) = a, b
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err, pts = dx + dy, []
    while True:
        pts.append((x0, y0))
        if (x0, y0) == (x1, y1): return pts
        e2 = 2 * err
        if e2 >= dy: err += dy; x0 += sx
        if e2 <= dx: err += dx; y0 += sy

def outline(layer):
    """Black outline round a layer (4 neighbours), so a weapon reads against the body and the ground."""
    out = dict(layer)
    for (x, y) in layer:
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if (nx, ny) not in layer: out[(nx, ny)] = 'k'
    return out

def over(base, layer):
    b = dict(base); b.update(layer); return b

def shift(px, dx, dy):
    return {(x + dx, y + dy): c for (x, y), c in px.items()}

def arm_and_weapon(shoulder, hand, tip, blade, edge, grip='o', guard='y', bone='w', handc='W', guard_len=1, grip_len=1):
    """Arm bone from shoulder to hand, then the weapon from the hand toward the tip: grip, crossguard, blade.
    blade/edge alternate along the blade so it has a lit edge; the tip is the edge colour."""
    arm = {p: bone for p in line(shoulder, hand)}
    arm[hand] = handc
    path = line(hand, tip)
    w = {}
    vx, vy = tip[0] - hand[0], tip[1] - hand[1]
    n = max(abs(vx), abs(vy)) or 1
    px, py = -vy / n, vx / n  # across the blade, for the crossguard
    for i, p in enumerate(path[1:], 1):
        if i <= grip_len: w[p] = grip
        elif i == grip_len + 1:
            w[p] = guard
            for s in range(1, guard_len + 1):
                for sg in (1, -1): w[(round(p[0] + px * s * sg), round(p[1] + py * s * sg))] = guard
        else: w[p] = blade if i % 3 == 0 else edge
    w[path[-1]] = edge
    return outline(arm), outline(w)

def smear(center, r0, r1, a0, a1, cols, steps=40):
    """The swing's arc filled in with the weapon's two brightest colours (one frame, no outline)."""
    import math
    s = {}
    for i in range(steps + 1):
        a = math.radians(a0 + (a1 - a0) * i / steps)
        for r in range(r0, r1 + 1):
            s[(round(center[0] + math.cos(a) * r), round(center[1] + math.sin(a) * r))] = cols[0] if r >= (r0 + r1) / 2 else cols[1]
    return s

def streak(a, b, col='w'):
    """The leftover of the smear for one frame: a thin pale line just behind the blade, showing it slowing down."""
    return {p: col for p in line(a, b)}

def frame(px, pal, ms, label, extra=None):
    xs = [x for x, _ in px]; ys = [y for _, y in px]
    return {'px': [[x, y, c] for (x, y), c in px.items()], 'pal': pal, 'ms': ms, 'label': label, 'extra': extra or []}

# ---------- the skeleton ----------
def skeleton(S):
    rows = S['UNDEAD_SPR']['skel']; pal = S['UNDEAD_PAL']['skel']
    ready = grid_to_px(rows)
    body = {p: c for p, c in ready.items()}
    # Cut the sword and the arm out of the body (they become their own layer, drawn per pose).
    for (x, y) in list(body):
        if x >= 13 and y <= 15: del body[(x, y)]
        elif x == 12 and (3 <= y <= 6 or 9 <= y <= 14): del body[(x, y)]
    body[(12, 8)] = 'k'
    for y in range(9, 14): body[(12, y)] = 'k' if (11, y) not in body or body[(11, y)] != 'k' else body.get((12, y), '.')
    body = {p: c for p, c in body.items() if c != '.'}
    sh = (11, 8)
    def pose(hand, tip, dx, sm=None):
        a, w = arm_and_weapon(sh, hand, tip, 'g', 'G', grip='o', guard='y', guard_len=1)
        px = over(over(body, a), w)
        if sm: px = over(sm, px)
        return shift(px, dx, 0)
    f = []
    f.append(frame(ready, pal, 500, 'Ready (as today)'))
    f.append(frame(pose((12, 2), (5, -5), -1), pal, 300, 'Wind-up: sword raised back (held, the tell)'))
    f.append(frame(pose((16, 6), (25, 4), 1, smear((11, 6), 8, 13, -120, 5, ['G', 'W'])), pal, 50, 'Strike: one smear frame'))
    f.append(frame(pose((16, 9), (23, 16), 2, streak((17, 6), (24, 12))), pal, 130, 'Impact: held, 2 px lunge'))
    f.append(frame(pose((14, 11), (16, 3), 1), pal, 110, 'Recover'))
    return f

# ---------- the Skeleton King ----------
def king(S):
    rows = S['UNDEAD_SPR']['king']; pal = dict(S['UNDEAD_PAL']['king'])
    pal['u'] = '#8a7f70'; pal['U'] = '#6e6458'  # dust
    ready = grid_to_px(rows)
    body = {p: c for p, c in ready.items() if not (p[0] >= 19 and p[1] >= 10)}
    for y in (13, 14, 15): body[(18, y)] = 'k' if y > 13 else body.get((18, y), 'Q')
    body[(19, 13)] = 'k'
    sh = (17, 12)
    def pose(hand, tip, dx, dy=0, sm=None, dust=False):
        a, w = arm_and_weapon(sh, hand, tip, 'g', 'G', grip='o', guard='y', guard_len=2, grip_len=2)
        w = over(w, {})
        px = over(over(body, a), w)
        if sm: px = over(sm, px)
        if dust:
            for (x, y), c in {(tip[0]-3, 28): 'U', (tip[0]-2, 27): 'u', (tip[0]+2, 27): 'u', (tip[0]+3, 28): 'U', (tip[0]-4, 26): 'u', (tip[0]+4, 26): 'U', (tip[0]+1, 25): 'u', (tip[0]-1, 25): 'U'}.items():
                if (x, y) not in px: px[(x, y)] = c
        return shift(px, dx, dy)
    f = []
    f.append(frame(ready, pal, 500, 'Ready (as today)'))
    f.append(frame(pose((18, -1), (8, -11), -1, -1), pal, 450, 'Wind-up: sword overhead (held long, he is heavy)'))
    f.append(frame(pose((23, 7), (36, 5), 1, 0, smear((17, 9), 11, 19, -125, 0, ['G', 'W'])), pal, 70, 'Strike: one big smear'))
    f.append(frame(pose((22, 15), (29, 28), 2, 1, streak((24, 11), (32, 24)), dust=True), pal, 220, 'Impact: blade bites the floor, dust (held)'))
    f.append(frame(pose((20, 13), (21, 25), 1, 0), pal, 160, 'Recover: drags it back up'))
    return f

# ---------- the blight wolf: a real bite with its own jaws ----------
def wolf(S):
    rows = S['REDO_SPR']['wolf']; step = S['REDO_SPR']['wolfstep']; pal = S['REDO_PAL']['wolf']
    ready = grid_to_px(rows)
    # Crouch: drop the body 1 px (one leg row taken out), head low, ready to spring.
    crouch_rows = ['.' * len(rows[0])] + rows[:9] + rows[10:]
    crouch = grid_to_px(crouch_rows)
    crouch = {(x, y + (1 if x >= 18 and y <= 8 else 0)): c for (x, y), c in crouch.items() if not (x >= 18 and y == 9)} | {p: c for p, c in crouch.items() if p[0] >= 18 and p[1] >= 10}
    # Head drawn open by hand (columns 17 on): upper jaw lifted, fangs top and bottom, red mouth between.
    body_rows = [r[:17] for r in step]
    open_head = [
        "...k.k......",
        "..kAkAk.....",
        "kkAaAak.....",
        "AAaaaeakkk..",
        "aaaAaaaaaNk.",
        "baaaawwkwwk.",
        "aaaakrrrrk..",
        "aaaakkwwkwk.",
        "aaaaaaaak...",
        "aaadkkkk....",
    ]
    lunge = grid_to_px(body_rows[1:9], 0, 0)
    lunge = over(grid_to_px([r[:17] for r in step]), {})
    lunge = {p: c for p, c in lunge.items() if p[0] < 17}
    lunge = over(lunge, grid_to_px(open_head, 17, -1))
    # Snap: jaws shut (the closed head), fangs locked over the lip, body as far forward as it goes.
    snap_head = [r[17:] for r in rows]
    snap_head[5] = "baawkwkwk"
    snap = over({p: c for p, c in grid_to_px(step).items() if p[0] < 17}, grid_to_px(snap_head, 17, 0))
    f = []
    f.append(frame(ready, pal, 500, 'Ready (as today)'))
    f.append(frame(shift(crouch, -1, 0), pal, 160, 'Crouch: sinks back, head low (the tell)'))
    f.append(frame(shift(lunge, 3, -1), pal, 60, 'Lunge: springs in, jaws wide'))
    f.append(frame(shift(snap, 4, 0), pal, 140, 'Snap: jaws shut on you (held)'))
    f.append(frame(shift(ready, 1, 0), pal, 110, 'Recover: pulls back'))
    return f

def player(S):
    r = S['RAG15']['warrior']; pal = dict(S['RAG15_COMMON']); pal.update(r['c'])
    return {'px': [[x, y, c] for (x, y), c in grid_to_px(r['r']).items()], 'pal': pal}

def main():
    S = load_sprites()
    data = {'skeleton': skeleton(S), 'king': king(S), 'wolf': wolf(S), 'player': player(S)}
    out = os.path.join(ROOT, 'art/drafts/mob-attacks-draft1.json')
    json.dump(data, open(out, 'w'), separators=(',', ':'))
    try:
        from PIL import Image
        scale = 6
        strips = []
        for key in ('skeleton', 'king', 'wolf'):
            frs = data[key]
            allp = [(x, y) for f in frs for x, y, _ in f['px']]
            x0, y0 = min(p[0] for p in allp) - 2, min(p[1] for p in allp) - 2
            x1, y1 = max(p[0] for p in allp) + 2, max(p[1] for p in allp) + 2
            fw, fh = x1 - x0 + 1, y1 - y0 + 1
            im = Image.new('RGB', (fw * len(frs), fh), (40, 38, 46))
            for i, f in enumerate(frs):
                for x, y, c in f['px']:
                    h = f['pal'].get(c, '#ff00ff').lstrip('#')
                    im.putpixel((i * fw + x - x0, y - y0), tuple(int(h[j:j+2], 16) for j in (0, 2, 4)))
            strips.append(im.resize((im.width * scale, im.height * scale), Image.NEAREST))
        W = max(s.width for s in strips); H = sum(s.height for s in strips) + 12 * len(strips)
        sheet = Image.new('RGB', (W, H), (24, 22, 28)); y = 0
        for s in strips: sheet.paste(s, (0, y)); y += s.height + 12
        sheet.save(out.replace('.json', '.png'))
    except ImportError:
        print('PIL missing: no strip image', file=sys.stderr)
    print('wrote', out)

if __name__ == '__main__':
    main()

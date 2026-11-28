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
const o=new Function(src+';return {UNDEAD_SPR,UNDEAD_PAL,REDO_SPR,REDO_PAL,RAG15,RAG15_COMMON,WOLF_SPR,WOLF_PAL,PAL,SPR,RAT_PAL}')();
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

# ---------- wolves: a real bite with their own jaws ----------
def bite(rows, step, pal, head_x, open_head, snap_rows, drop_row, lunge=3):
    """Crouch, lunge jaws open, snap shut (held), pull back. head_x = first column of the head; open_head = the head
    drawn jaws-open (rows from one row above the sprite); snap_rows = {row: new head row} for the jaws fully shut."""
    ready = grid_to_px(rows)
    # Crouch: drop the body 1 px (one leg row taken out), and the head another pixel, ready to spring.
    crouch = grid_to_px(['.' * len(rows[0])] + rows[:drop_row] + rows[drop_row + 1:])
    keep = {p: c for p, c in crouch.items() if not (p[0] >= head_x + 1 and p[1] <= drop_row)}
    head = {(x, y + 1): c for (x, y), c in crouch.items() if x >= head_x + 1 and y <= drop_row - 1}
    crouch = over(keep, head)
    body = {p: c for p, c in grid_to_px(step).items() if p[0] < head_x}
    lunge_px = over(body, grid_to_px(open_head, head_x, -1))
    snap_head = [r[head_x:] for r in rows]
    for i, r in snap_rows.items(): snap_head[i] = r
    snap = over(body, grid_to_px(snap_head, head_x, 0))
    return [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(crouch, -1, 0), pal, 160, 'Crouch: sinks back, head low (the tell)'),
            frame(shift(lunge_px, lunge, -1), pal, 60, 'Lunge: springs in, jaws wide'),
            frame(shift(snap, lunge + 1, 0), pal, 140, 'Snap: jaws fully shut, no mouth showing (held)'),
            frame(shift(ready, 1, 0), pal, 110, 'Recover: pulls back, mouth shows again')]

def wolf_open(rows, patch):
    """Jaws-open head for the 27-wide wolf body (blight wolf, Old Scar): its own ears and eye on top, the snout one
    pixel longer, fangs top and bottom with the red mouth between. patch = the body colour under the jaw ('b' for the
    blight wolf's green rot, 'a' for plain fur)."""
    h = [r[17:] for r in rows]
    return [h[0] + '..', h[1] + '..', h[2] + '..', (h[3].rstrip('.') + 'k').ljust(12, '.'),
            'aaaAaaaaaNk.', patch + 'aaaawwkwwk.', 'aaaakrrrrk..', 'aaaakkwwkwk.', 'aaaaaaaak...', 'aaadkkkk....']

def wolf(S):
    rows = S['REDO_SPR']['wolf']
    # Owner (Nov 27): on the snap the jaws are fully shut: teeth clenched in one row, no red mouth showing.
    return bite(rows, S['REDO_SPR']['wolfstep'], S['REDO_PAL']['wolf'], 17, wolf_open(rows, 'b'),
                {5: "baaaawwwwk", 6: "aaaaakkkk."}, 9)

def oldscar(S):
    rows = S['REDO_SPR']['oldscar']
    return bite(rows, S['REDO_SPR']['oldscarstep'], S['REDO_PAL']['oldscar'], 17, wolf_open(rows, 'a'),
                {5: "aaaaawwwk.", 6: "aaaaakkkk."}, 9)

def greyfang(S):
    W = S['WOLF_SPR']; rows = W['greyfang']; pal = dict(S['PAL']); pal.update(S['WOLF_PAL']['greyfang'])
    h = [r[24:] for r in rows]
    # His head drawn jaws-open (columns 24 on, from one row above): upper jaw and nose lifted, a long row of upper
    # fangs, the red mouth, lower fangs, the lower jaw dropped a pixel.
    open_head = ['.' * 17] + h[0:6] + [
        "AAAaaaaaaaaaaaaNk",
        "AAAaaaaaawkwkwkwk",
        "AAAAaadkrrrrrrk..",
        "AAAAaaakwkwkwkk..",
        "AAAdddddddkk.....",
        "AAAddkkkk........",
        "AAdkkk...........",
    ] + h[13:]
    snap = {7: "AAAaaaaaawwwwwwkk", 8: "AAAAaadaaaaakk...", 9: "AAAAaaadddkk.....", 10: "AAAdddddkkk......"}
    return bite(rows, W['greyfangstep'], pal, 24, open_head, snap, 16, lunge=4)

# ---------- rats: a quick lunging nip, and a death where they flip onto their backs ----------
def rat_frames(rows, step, pal, head_x, open_rows, snap_rows, eye):
    """Bite: squash down (the tell), dart in with the snout up and teeth showing, nip shut (held), back.
    Death: a yelp hop, then belly-up with the legs in the air, two kicks, then it lies still (the game fades it).
    open_rows / snap_rows = {row: new head part from head_x}; eye = (x, y) of the eye, shut when dead."""
    ready = grid_to_px(rows)
    h = len(rows)
    squash = grid_to_px(['.' * len(rows[0])] + rows[:2] + rows[3:])  # one body row taken out: it crouches flat
    def head_edit(rws, edits):
        r = list(rws)
        for i, t in edits.items():
            r[i] = r[i][:head_x] + t + r[i][head_x + len(t):] if i >= 0 else r[i]
        return r
    lunge = grid_to_px(head_edit(step, open_rows))
    snap = grid_to_px(head_edit(step, snap_rows))
    bite = [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(squash, -1, 0), pal, 150, 'Squash: flattens, ready to dart (the tell)'),
            frame(shift(lunge, 2, -1), pal, 60, 'Dart: snout up, teeth out'),
            frame(shift(snap, 3, 0), pal, 120, 'Nip: jaws shut on you (held)'),
            frame(shift(ready, 1, 0), pal, 100, 'Back')]
    # Belly-up: the body drawn upside down on the ground (legs in the air), eye shut, tail lying flat.
    def belly(rws):
        r = [row for row in rws if row.strip('.')]
        up = r[::-1]
        # Light and dark swap: the pale belly is now on top, the dark back against the ground. The eye shuts.
        sw = {'A': 'd', 'd': 'A', 'e': 'k'}
        px = {p: sw.get(c, c) for p, c in grid_to_px(up).items()}
        dy = h - len(up)
        return shift(px, 0, dy)
    dead = belly(rows); kick = belly(step)
    death = [frame(ready, pal, 300, 'Hit (alive)'),
             frame(shift(grid_to_px(step), 0, -2), pal, 90, 'Death: a yelp hop'),
             frame(dead, pal, 160, 'Flips belly-up, legs in the air'),
             frame(kick, pal, 90, 'Kick'),
             frame(dead, pal, 90, ''),
             frame(kick, pal, 90, 'Kick'),
             frame(dead, pal, 150, 'Gone: fades at once, no lying there (owner, Nov 27)')]
    return bite, death

def rats(S):
    R = S['SPR']; pal = dict(S['PAL']); pal.update(S['RAT_PAL']['rat']); pal['w'] = '#e8e2d4'
    # Small rat (16x8): head from column 11. Open: snout lifted a pixel, a tooth under it. Snap: the tooth tucked in.
    small = rat_frames(R['rat'], R['ratstep'], pal, 11,
                       {2: "AAAk.", 3: "aAeAk", 4: "aaAAp", 5: "dkwk."},
                       {4: "aaAwp"}, (13, 3))
    B = S['REDO_SPR']; bpal = S['REDO_PAL']['brat']; bpal = dict(bpal); bpal['w'] = '#efe6cc'
    # Big tunnel rat (29x13): head from column 21. Open: top jaw up, the yellow incisors split top and bottom with the
    # pink mouth between. Snap: incisors clamped together.
    bopen = {5: "aaaaeak.", 6: "aaaaaapk", 7: "aaaayyk.", 8: "aaakPPk.", 9: "dkkkyk.."}
    bsnap = {7: "aaaayyyk", 8: "aaaakyk."}
    big = rat_frames(B['brat'], B['bratstep'], bpal, 21, bopen, bsnap, (26, 5))
    pale = rat_frames(B['palerat'], B['paleratstep'], dict(S['REDO_PAL']['palerat'], w='#ffffff'), 21, bopen, bsnap, (26, 5))
    out = {'rat_bite': small[0], 'rat_death': small[1], 'brat_bite': big[0], 'brat_death': big[1], 'palerat_bite': pale[0], 'palerat_death': pale[1]}
    out.update(big_rats(S))  # the Pale Rat's rear-back bite replaces his plain one; Old Gnawbone's own (owner, Nov 27)
    return out

# ---------- the Pale Rat and Old Gnawbone: rear back, jaws wide on the big teeth, then bite down (owner, Nov 27) ----------
def rear_head(rows, head_x, jaw_row, mouth_x, steps, lower_tooth):
    """The head thrown back, drawn from the sprite's own head so the face keeps its size and the eye stays where it is
    on the face (owner, Nov 27: the first try grew the faces). The upper head (rows above jaw_row) is lifted more the
    further forward it is: steps = [(from column, lift), ...]. The lower jaw stays. The gap between them is the open
    mouth: black from mouth_x forward, fur behind, a black lip at the front, and a lower tooth pointing up."""
    px = grid_to_px(rows)
    up, low = {}, {}
    for (x, y), c in px.items():
        if x < head_x: continue
        if y < jaw_row:
            lift = max([l for fx, l in steps if x >= fx] or [0])
            up[(x, y - lift)] = c
        else: low[(x, y)] = c
    head = over(low, up)
    cols = sorted({x for x, _ in head})
    front = max(x for x, _ in low) if low else cols[-1]
    for x in cols:
        ys_up = [y for (xx, y) in up if xx == x]; ys_lo = [y for (xx, y) in low if xx == x]
        if not ys_up or not ys_lo: continue
        for y in range(max(ys_up) + 1, min(ys_lo)):
            head[(x, y)] = 'k' if x >= mouth_x else 'a'  # inside of the mouth: black (owner, Nov 27: brown looked bad on the Pale Rat; black for every mouth)
    for (x, y) in lower_tooth: head[(x, y)] = lower_tooth[(x, y)]
    return head

def rear_bite(rows, step, pal, head_x, head, snap_edits, lunge=3):
    """Ready -> rears back: head thrown up, jaws wide on the big teeth (held, the tell) -> lunges in, still open ->
    bites down: head drops, teeth clamped (held) -> back. Drawn poses, never a turned sprite."""
    ready = grid_to_px(rows)
    body_r = {p: c for p, c in ready.items() if p[0] < head_x}
    body_s = {p: c for p, c in grid_to_px(step).items() if p[0] < head_x}
    snap_rows = [r for r in rows]
    for i, t in snap_edits.items(): snap_rows[i] = snap_rows[i][:head_x] + t + snap_rows[i][head_x + len(t):]
    snap_head = {(x, y + 1): c for (x, y), c in grid_to_px(snap_rows).items() if x >= head_x}  # head dropped into the bite
    return [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(over(body_r, head), -1, 0), pal, 320, 'Rears back: head tips up, jaws wide on the big teeth (held, the tell)'),
            frame(shift(over(body_s, head), lunge - 1, 0), pal, 60, 'Lunges in, still open'),
            frame(shift(over(body_s, snap_head), lunge, 0), pal, 150, 'Bites down: head drops, teeth clamped (held)'),
            frame(shift(ready, 1, 0), pal, 120, 'Back')]

def big_rats(S):
    B = S['REDO_SPR']
    pr = B['palerat']
    ph = rear_head(pr, 19, 8, 24, [(22, 1), (24, 2)], {(26, 9): 'y'})
    pale = rear_bite(pr, B['paleratstep'], S['REDO_PAL']['palerat'], 19, ph, {7: "aaaaaayyyk", 8: "aaaaaakyk."})
    br = B['brat']  # the big tunnel rat: same body as the Pale Rat, same rear-back bite (owner, Nov 27)
    bh = rear_head(br, 19, 8, 24, [(22, 1), (24, 2)], {(26, 9): 'y'})
    big = rear_bite(br, B['bratstep'], S['REDO_PAL']['brat'], 19, bh, {7: "aaaaaayyyk", 8: "aaaaaakyk."})
    R = S['SPR']; gpal = dict(S['PAL']); gpal.update(S['RAT_PAL']['gnaw']); g = R['gnaw']
    gh = rear_head(g, 30, 15, 36, [(33, 1), (36, 2)], {(38, 14): 'Y'})
    gnaw = rear_bite(g, R['gnawstep'], gpal, 30, gh, {14: "aaaaaadkYYYk"}, lunge=4)
    return {'palerat_bite': pale, 'brat_bite': big, 'gnaw_bite': gnaw}

def player(S):
    r = S['RAG15']['warrior']; pal = dict(S['RAG15_COMMON']); pal.update(r['c'])
    return {'px': [[x, y, c] for (x, y), c in grid_to_px(r['r']).items()], 'pal': pal}

def main():
    S = load_sprites()
    data = {'skeleton': skeleton(S), 'king': king(S), 'wolf': wolf(S), 'oldscar': oldscar(S), 'greyfang': greyfang(S), 'player': player(S)}
    out = os.path.join(ROOT, 'art/drafts/mob-attacks-draft1.json')
    json.dump(data, open(out, 'w'), separators=(',', ':'))
    try:
        from PIL import Image
        scale = 6
        strips = []
        for key in ('skeleton', 'king', 'wolf', 'oldscar', 'greyfang'):
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

if __name__ == '__main__' and len(sys.argv) == 1:
    main()


# ---------- into the game: write the pose frames into js/data/sprites.js (between the MOB_POSES markers) ----------
# Each pose: rows (text grid), ax (the column that lines up with the body's middle, as drawPose wants) and by (rows the
# frame reaches below the standing sprite's feet, so a crouch or a blade in the dirt sits right).
def to_pose(f, base_w, base_h):
    px = {(x, y): c for x, y, c in f['px']}
    x0 = min(x for x, _ in px); x1 = max(x for x, _ in px)
    y0 = min(y for _, y in px); y1 = max(max(y for _, y in px), base_h - 1)
    rows = [''.join(px.get((x, y), '.') for x in range(x0, x1 + 1)) for y in range(y0, y1 + 1)]
    return {'rows': rows, 'ax': (base_w >> 1) - x0, 'by': y1 - (base_h - 1)}

def write_game_data(data, S):
    names = {'skeleton': ('skel', S['UNDEAD_SPR']['skel'], ['wind', 'smear', 'hit', 'rec']),
             'king': ('boss1', S['UNDEAD_SPR']['king'], ['wind', 'smear', 'hit', 'rec']),
             'wolf': ('wolf', S['REDO_SPR']['wolf'], ['wind', 'smear', 'hit', 'rec']),
             'oldscar': ('oldscar', S['REDO_SPR']['oldscar'], ['wind', 'smear', 'hit', 'rec']),
             'greyfang': ('greyfang', S['WOLF_SPR']['greyfang'], ['wind', 'smear', 'hit', 'rec'])}
    names.update({'rat_bite': ('rat', S['SPR']['rat'], None), 'crat_bite': ('crat', S['SPR']['rat'], None), 'trat_bite': ('trat', S['SPR']['rat'], None),
                  'brat_bite': ('brat', S['REDO_SPR']['brat'], None), 'palerat_bite': ('palerat', S['REDO_SPR']['palerat'], None),
                  'gnaw_bite': ('gnaw', S['SPR']['gnaw'], None)})
    out = {}
    deaths = {}
    for key, (name, base, slots) in names.items():
        slots = slots or ['wind', 'smear', 'hit', 'rec']
        frs = data[key][1:]  # frame 0 is the ready pose (the normal sprite)
        out[name] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal']}
        for slot, f in zip(slots, frs): out[name][slot] = to_pose(f, len(base[0]), len(base))
    # Family deaths drawn as frames (rats: yelp hop, belly-up, two kicks, gone at once; owner Nov 27).
    for name, base, key in (('rat', S['SPR']['rat'], 'rat_death'), ('crat', S['SPR']['rat'], 'crat_death'), ('trat', S['SPR']['rat'], 'trat_death'),
                            ('brat', S['REDO_SPR']['brat'], 'brat_death'), ('palerat', S['REDO_SPR']['palerat'], 'palerat_death')):
        frs = data[key][1:]
        deaths[name] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal'], 'f': [to_pose(f, len(base[0]), len(base)) for f in frs]}
    out['_deaths'] = deaths
    block = ('// MOB_POSES (from tools/mob_attack_draft.py, owner OK Nov 27): attack frames drawn from each sprite. t = seconds for\n'
             '// wind-up (held before the hit lands), smear, hit (held), recover. Physical attacks: the weapon or the jaws do the work.\n'
             'const MOB_POSES=' + json.dumps(out, separators=(',', ':')) + ';\n// /MOB_POSES\n')
    p = os.path.join(ROOT, 'js/data/sprites.js'); s = open(p).read()
    a = s.find('// MOB_POSES'); b = s.find('// /MOB_POSES\n')
    s = (s[:a] + block + s[b + len('// /MOB_POSES\n'):]) if a >= 0 and b > a else s.rstrip('\n') + '\n' + block
    open(p, 'w').write(s)
    print('wrote MOB_POSES into js/data/sprites.js')

def rat_draft():
    S = load_sprites(); data = rats(S); data['player'] = player(S)
    out = os.path.join(ROOT, 'art/drafts/rat-anims-draft1.json'); json.dump(data, open(out, 'w'), separators=(',', ':'))
    from PIL import Image
    strips = []
    for key in [k for k in data if k != 'player']:
        frs = [f for f in data[key]]
        allp = [(x, y) for f in frs for x, y, _ in f['px']]
        x0, y0, x1, y1 = min(p[0] for p in allp) - 2, min(p[1] for p in allp) - 2, max(p[0] for p in allp) + 2, max(p[1] for p in allp) + 2
        fw, fh = x1 - x0 + 1, y1 - y0 + 1
        im = Image.new('RGB', (fw * len(frs), fh), (40, 38, 46))
        for i, f in enumerate(frs):
            for x, y, c in f['px']:
                hx = f['pal'].get(c, '#ff00ff').lstrip('#'); im.putpixel((i * fw + x - x0, y - y0), tuple(int(hx[j:j+2], 16) for j in (0, 2, 4)))
        strips.append(im.resize((im.width * 6, im.height * 6), Image.NEAREST))
    W = max(s.width for s in strips); H = sum(s.height + 12 for s in strips)
    sheet = Image.new('RGB', (W, H), (24, 22, 28)); y = 0
    for st in strips: sheet.paste(st, (0, y)); y += st.height + 12
    sheet.save(out.replace('.json', '.png')); print('wrote', out)

if __name__ == '__main__' and '--rats' in sys.argv:
    rat_draft()

if __name__ == '__main__' and '--game' in sys.argv:
    S = load_sprites()
    d = {'skeleton': skeleton(S), 'king': king(S), 'wolf': wolf(S), 'oldscar': oldscar(S), 'greyfang': greyfang(S)}
    d.update(rats(S))
    cpal = dict(S['PAL']); cpal.update(S['RAT_PAL']['crat']); cpal['w'] = '#e8e2d4'
    cb, cd = rat_frames(S['SPR']['rat'], S['SPR']['ratstep'], cpal, 11, {2: "AAAk.", 3: "aAeAk", 4: "aaAAp", 5: "dkwk."}, {4: "aaAwp"}, (13, 3))
    d['crat_bite'] = cb; d['crat_death'] = cd
    tpal = dict(S['PAL']); tpal.update(S['RAT_PAL']['trat']); tpal['w'] = '#e8e2d4'  # Old Gnawbone's tunnel-rat adds
    tb, td = rat_frames(S['SPR']['rat'], S['SPR']['ratstep'], tpal, 11, {2: "AAAk.", 3: "aAeAk", 4: "aaAAp", 5: "dkwk."}, {4: "aaAwp"}, (13, 3))
    d['trat_bite'] = tb; d['trat_death'] = td
    write_game_data(d, S)

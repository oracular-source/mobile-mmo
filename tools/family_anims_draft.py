"""Family animations, draft 1 (animation lane, Nov 27): attacks and deaths for four mob families at once, so the owner
can review them together (owner: "do multiple families at once"). Drawn as real frames from the live sprites (never
rotated or redrawn bigger). Not loaded by the game until the owner OKs them.

  beetles  : mire beetle (rear up, pincers open, snap shut) and Ironshell (rear up high, shell ram forward, dust)
             death: flips onto its back, legs flail twice, legs curl in, gone
  boar     : head down (the tell), charge in, toss the tusks up (gore); death: front knees buckle, belly down, a kick, gone
  wisp     : draws in and dims, leans in with a tongue of flame, flares on you; death: gutters smaller, an ember, smoke
  cultists : zealot chops with the sickle in his hand, ashcaller shoves his ember at you, chanter swings his censer on
             its chain; death: drops to the knees, slumps forward, item falls, gone

Run:  python3 tools/family_anims_draft.py  ->  art/drafts/family-anims-draft1.json and .png
Owner rules kept: small mobs attack with their bodies (physical), floating effects only for spell-like things (a wisp is
fire, so its flare may glow); faces keep their size; open mouths red inside; deaths short and gone at once.
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mob_attack_draft import grid_to_px, line, over, shift, frame, smear, ROOT

DUST = {'u': '#8a7f70', 'U': '#6e6458'}

def load():
    js = r"""
const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');
const o=new Function(src+';return {REDO_SPR,REDO_PAL,WISP_SPR,WISP_PAL,RAG15,RAG15_COMMON}')();
process.stdout.write(JSON.stringify(o));"""
    out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'js/data/sprites.js')], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

# ---------- small pixel tools ----------
def reoutline(px):
    """Close the black outline after a part of the body moved: every empty pixel touching a coloured (non-black) pixel
    becomes black. Never paints over colour, so it only fills the gaps a moved head or leg left."""
    out = dict(px)
    for (x, y), c in px.items():
        if c == 'k': continue
        for n in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if n not in px: out[n] = 'k'
    return out

def stamp(layer, at):
    """A small outlined prop (weapon, ember, censer) placed with its origin at `at`; its outline never covers the body."""
    return {(x + at[0], y + at[1]): c for (x, y), c in layer.items()}

def put(base, layer):
    """Lay a prop over the body: colour always wins, the prop's black outline only fills empty pixels."""
    b = dict(base)
    for p, c in layer.items():
        if c != 'k' or p not in b: b[p] = c
    return b

def outlined(core):
    out = dict(core)
    for (x, y) in core:
        for n in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if n not in core: out[n] = 'k'
    return out

def tilt(px, steps, ymax=999, sign=-1):
    """Lift (sign -1) or drop (sign +1) the part of the body forward of each step: steps = [(from column, pixels)].
    Rows below ymax stay (feet on the ground). A drawn pose, not a turned sprite."""
    out = {}
    for (x, y), c in px.items():
        d = max([l for fx, l in steps if x >= fx] or [0]) if y <= ymax else 0
        out[(x, y + sign * d)] = c
    return out

def rot_cw(layer): return {(-y, x): c for (x, y), c in layer.items()}
def mirror(layer): return {(-x, y): c for (x, y), c in layer.items()}
def recolour(px, m): return {p: m.get(c, c) for p, c in px.items()}
def drop_rows(rows, idx):
    """Take rows out of a sprite (a crouch or a kneel) and pad the top so the feet stay on the ground."""
    keep = [r for i, r in enumerate(rows) if i not in idx]
    return ['.' * len(rows[0])] * (len(rows) - len(keep)) + keep
def flipv(px, h):
    ys = [y for _, y in px]; top, bot = min(ys), max(ys)
    return {(x, top + h - 1 - y): c for (x, y), c in px.items()}  # upside down, its new bottom on the ground row

# ---------- beetles ----------
def pincers(front, row, state, big=False):
    """Pincers at the front of the head. open: one jaw up, one down, a gap between; shut: both meet in a point."""
    x, y = front, row
    if state == 'open':
        core = {(x, y - 1): 'Q', (x + 1, y - 2): 'Q', (x, y + 1): 'Q', (x + 1, y + 2): 'Q'}
        if big: core.update({(x + 2, y - 2): 'Q', (x + 2, y + 2): 'Q', (x + 1, y - 1): 'q', (x + 1, y + 1): 'q'})
    else:
        core = {(x, y): 'Q', (x + 1, y): 'Q'}
        if big: core.update({(x, y - 1): 'q', (x, y + 1): 'q', (x + 2, y): 'Q'})
    return outlined(core)

def beetle_set(S, name, front, jaw_row, big):
    rows = S['REDO_SPR'][name]; step = S['REDO_SPR'][name + 'step']
    pal = dict(S['REDO_PAL'][name]); pal.update(DUST)
    ready = grid_to_px(rows); stepp = grid_to_px(step); h = len(rows)
    if not big:
        rear = reoutline(tilt(ready, [(9, 1), (13, 2)]))
        lunge = put(reoutline(tilt(stepp, [(13, 1)], sign=1, ymax=7)), pincers(front, jaw_row + 1, 'open'))
        snap = put(ready, pincers(front, jaw_row, 'shut'))
        bite = [frame(ready, pal, 500, 'Ready (as today)'),
                frame(shift(put(rear, pincers(front, jaw_row - 2, 'open')), -1, 0), pal, 170, 'Rears up: front lifts, pincers open (the tell)'),
                frame(shift(lunge, 2, 0), pal, 60, 'Lunges: head dips in, pincers wide'),
                frame(shift(snap, 3, 0), pal, 130, 'Snaps the pincers shut on you (held)'),
                frame(shift(ready, 1, 0), pal, 110, 'Back')]
    else:  # Ironshell: rears up high, then rams forward head-down and the shell thumps down, dust at the front
        rear = reoutline(tilt(ready, [(8, 1), (14, 2), (20, 3), (24, 4)]))
        ram = put(reoutline(tilt(stepp, [(22, 1)], sign=1, ymax=12)), pincers(front, jaw_row + 1, 'shut', True))
        dust = {(front + 1, h - 1): 'u', (front + 3, h - 2): 'U', (front + 2, h - 3): 'u', (front - 3, h): 'u', (front + 4, h): 'U', (front - 1, h - 1): 'U'}
        bite = [frame(ready, pal, 500, 'Ready (as today)'),
                frame(shift(put(rear, pincers(front, jaw_row - 4, 'open', True)), -1, 0), pal, 320, 'Rears up high, pincers wide (held, the tell)'),
                frame(shift(ram, 3, 0), pal, 70, 'Rams forward, head down'),
                frame(over(shift(put(ready, pincers(front, jaw_row, 'shut', True)), 3, 0), shift(dust, 3, 0)), pal, 170, 'Shell thumps down on you, dust kicks up (held)'),
                frame(shift(ready, 1, 0), pal, 140, 'Back')]
    # Death: flips onto its back (the shell dome at the bottom, legs in the air), legs flail twice, curl in, gone.
    shut = {'e': 'k'}
    back = recolour(flipv(ready, h), shut); flail = recolour(flipv(stepp, h), shut)
    leg_top = min(y for _, y in back)
    curled = recolour(flipv(grid_to_px([r for i, r in enumerate(rows) if i < h - 2]), h), shut)  # the two lowest leg rows tucked away
    thud = {(front - 2, h): 'u', (2, h): 'U', (front // 2, h): 'u'} if big else {}
    death = [frame(ready, pal, 300, 'Hit (alive)'),
             frame(shift(stepp, 0, -2), pal, 80, 'Death: jolts up'),
             frame(over(back, thud), pal, 140, 'Lands on its back, legs in the air' + (' (thud, dust)' if big else '')),
             frame(flail, pal, 90, 'Legs flail'), frame(back, pal, 90, ''), frame(flail, pal, 90, 'Flail'),
             frame(curled, pal, 160, 'Legs curl in, gone at once')]
    return bite, death

# ---------- boar ----------
def boar_set(S):
    rows = S['REDO_SPR']['boar']; step = S['REDO_SPR']['boarstep']; pal = dict(S['REDO_PAL']['boar']); pal.update(DUST)
    ready = grid_to_px(rows); stepp = grid_to_px(step); h = len(rows)
    low = lambda px: reoutline(tilt(px, [(18, 1), (22, 2)], ymax=10, sign=1))   # head down, tusks forward
    toss = lambda px: reoutline(tilt(px, [(18, 1), (21, 2), (24, 3)], ymax=10))  # head tossed up, tusks hook upward
    crouch = grid_to_px(drop_rows(rows, [12]))
    dust = {(3, h - 1): 'u', (1, h - 2): 'U', (6, h): 'U'}
    bite = [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(low(crouch), -1, 0), pal, 180, 'Head down, tusks low, sinks on its haunches (the tell)'),
            frame(over(shift(low(stepp), 3, 0), shift(dust, 3, 0)), pal, 60, 'Charges in, head still low'),
            frame(shift(toss(ready), 4, 0), pal, 150, 'Tosses its head up: the tusks hook into you (held)'),
            frame(shift(ready, 1, 0), pal, 120, 'Back')]
    shut = {'e': 'k'}
    body = {p: c for p, c in ready.items() if p[1] <= 10}
    front_down = recolour(reoutline({(x, y + (2 if x >= 13 else 0)): c for (x, y), c in ready.items() if not (x >= 13 and y >= 13)}), shut)
    belly = recolour(reoutline(tilt(shift(body, 0, 3), [(19, 1), (22, 2)], sign=1)), shut)
    kick = over(belly, outlined({(3, h - 3): 'd', (2, h - 3): 'd', (1, h - 4): 'h'}))
    death = [frame(ready, pal, 300, 'Hit (alive)'),
             frame(front_down, pal, 140, 'Death: front knees buckle, head drops'),
             frame(belly, pal, 160, 'Back legs go too: down on its belly, snout in the dirt'),
             frame(kick, pal, 90, 'One last kick'), frame(belly, pal, 150, 'Gone at once')]
    return bite, death

# ---------- wisp ----------
def wisp_set(S):
    W = S['WISP_SPR']; pal = dict(S['WISP_PAL']); pal['S'] = '#8a8690'
    ready = grid_to_px(W[0]); flame = {p: c for p, c in ready.items() if p[1] <= 11}; tail = {p: c for p, c in ready.items() if p[1] > 11}
    dim = recolour(flame, {'W': 'Y'})
    lean = {(x + round((11 - y) * 0.3), y): c for (x, y), c in flame.items()}
    tongue = outlined({(10, 6): 'y', (11, 6): 'y', (10, 7): 'Y', (11, 7): 'y', (12, 7): 'y', (10, 8): 'y'})
    lean = put(lean, tongue)
    core = {p for p, c in flame.items() if c != 'k'}
    grow = {}
    for (x, y) in core:
        for n in ((x+1, y), (x-1, y), (x, y-1), (x, y-2)):
            if n not in core: grow[n] = 'y'
    flare = outlined(over(grow, recolour({p: flame[p] for p in core}, {'y': 'Y', 'Y': 'W'})))
    bite = [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(over(dim, tail), -1, 0), pal, 160, 'Draws back and dims (the tell)'),
            frame(shift(over(lean, tail), 2, 0), pal, 60, 'Leans in, a tongue of flame reaching for you'),
            frame(shift(over(flare, tail), 3, 0), pal, 140, 'Flares up on you, white-hot (held)'),
            frame(shift(ready, 1, 0), pal, 110, 'Back')]
    def g(rows, ox, base=11):  # a smaller flame, its bottom kept where the wisp's flame ends
        return grid_to_px(rows, ox, base - len(rows) + 1)
    f1 = g(["...k...", "..kyk..", "..kYk..", ".kyYyk.", ".kYWYk.", "kyYWYyk", "kyYWYyk", ".kyYyk.", "..kkk.."], 1)
    f2 = g(["..k..", ".kyk.", ".kYk.", "kyYyk", ".kyk.", "..k.."], 2)
    f3 = g([".k.", "kyk", ".k."], 3)
    s1 = over(g([".k."], 3), {(4, 7): 's', (5, 6): 's', (4, 5): 'S'})
    s2 = {(5, 4): 's', (4, 3): 'S', (5, 2): 's'}
    death = [frame(ready, pal, 300, 'Hit (alive)'),
             frame(over(f1, tail), pal, 100, 'Death: gutters smaller'),
             frame(f2, pal, 90, 'Smaller, the tail gone'),
             frame(f3, pal, 90, 'Just an ember'),
             frame(s1, pal, 120, 'Goes out: a thread of smoke'),
             frame(s2, pal, 140, 'Smoke drifts up, gone')]
    return bite, death

# ---------- cultists ----------
def clean(rows, fixes):
    r = list(rows)
    for i, t in fixes.items(): r[i] = t.ljust(len(rows[0]), '.')
    return r

ZEALOT_FIX = {5: '...kdaHfefedk', 6: '...kdaffffddk', 7: '...kddaffdddk', 8: '...kdHmmmmmdk', 9: '..kdHHmmmmmddk',
              10: '..kdHaaaaaaadk', 11: '..kdHaaaaaaaddk', 12: '.kdHarrrrrrrddk', 13: '.kdHaaaaRaaaddk'}
ASH_FIX = {5: '...kdaHfefedk', 6: '...kdaffffddk', 7: '...kddaffdddk', 8: '...kdHmmmmmdk', 9: '..kdHHmmmmmddk',
           10: '..kdHaaaaaaadk', 11: '..kdHaaaaaaaddk'}
CHANT_FIX = {8: '...kdHmmmmmdk', 9: '..kdHHmmmmmddk', 10: '..kdHaaaaaaadk', 11: '..kdHaaaaaaadk', 12: '.kdHarrrrrrrdk',
             13: '.kdHaaaaRaaaddk', 14: '.kdHaaaaRaaaaddk', 15: '.kdHaadaaaaadadk', 16: 'kdHaaadaaaaaadadk',
             17: 'kdHaadaaaaaaadadk', 18: 'kDdddDddddDdddDDk'}

def arm(shoulder, hand):
    a = {p: 'a' for p in line(shoulder, hand)}; a[hand] = 's'
    return outlined(a)

def sickle():
    """The zealot's sickle, grip at (0,0), handle up, the crescent blade curling forward over the top."""
    core = {(0, 0): 'o', (0, -1): 'o', (0, -2): 'o', (0, -3): 'O', (1, -4): 'l', (2, -5): 'l', (3, -5): 'l', (4, -4): 'l', (4, -3): 'L', (3, -2): 'L'}
    return outlined(core)

def ember(big=False):
    core = {(0, -2): 'G', (-1, -1): 'g', (0, -1): 'G', (1, -1): 'g', (-1, 0): 'g', (0, 0): 'g', (1, 0): 'g'}
    if big: core.update({(0, -3): 'G', (-2, -1): 'g', (2, -1): 'g', (-1, -2): 'g', (1, -2): 'g', (0, 0): 'G'})
    return outlined(core)

def censer():
    core = {(-1, 0): 'n', (0, 0): 'n', (1, 0): 'n', (-2, 1): 'n', (-1, 1): 'g', (0, 1): 'G', (1, 1): 'g', (2, 1): 'n', (-1, 2): 'n', (0, 2): 'n', (1, 2): 'n'}
    return outlined(core)

def chain(a, b): return {p: 'c' for p in line(a, b)}

def cultist_death(body_rows, pal, item_on_ground, label_item):
    h = len(body_rows); ready = grid_to_px(body_rows)
    kneel = grid_to_px(drop_rows(body_rows, [13, 14, 15, 16]))
    up = {p: c for p, c in kneel.items() if p[1] <= 12}; low = {p: c for p, c in kneel.items() if p[1] > 12}
    slump = reoutline(over(low, {(x + max(0, (12 - y) // 4), y + 2): c for (x, y), c in up.items()}))
    slump = {p: c for p, c in slump.items() if p[1] < h}
    heap_low = grid_to_px([body_rows[i] for i in (12, 14, 16, 17, 18)], -2, h - 5)  # the robe lying flat, a few rows deep
    hood = {(x + 6, y + h - 9): c for (x, y), c in ready.items() if y <= 5}
    heap = reoutline(over(heap_low, hood))
    shut = {'e': 'f'}
    # Owner (Nov 27): cultists are higher level than rats, so they stay down a moment longer (more dramatic).
    return [frame(ready, pal, 300, 'Hit (alive)'),
            frame(over(recolour(kneel, shut), item_on_ground[0]), pal, 180, 'Death: drops to its knees, ' + label_item),
            frame(over(recolour(slump, shut), item_on_ground[1]), pal, 180, 'Slumps forward'),
            frame(over(recolour(heap, shut), item_on_ground[1]), pal, 1200, 'Face down, lies there a moment'),
            frame(over(recolour(heap, shut), item_on_ground[1]), pal, 500, 'Fades')]

# Owner (Nov 27): two more cultist deaths, picked at random, so a camp doesn't all fall the same way.
CLOTH = (["..kkkk......", ".kHaaakkkk..", "kaaaaaaaaakk", "kddaaaaddddk", ".kkdddkkkkk.", "...kk......."],
         ["....kkkk....", "kkkkHaaakk..", "kaaaaaaaaak.", ".kdddaaaadk.", "..kkkkddkk..", "......kk...."])
def cultist_death_wind(body_rows, pal, item):
    """Blown away: the life goes out of him and he crumbles to ash inside his robe; the empty robe slumps, then the
    wind catches it and carries it off, fluttering, while the ash blows after it."""
    h, w = len(body_rows), len(body_rows[0]); ready = grid_to_px(body_rows); shut = {'e': 'f'}
    kneel = recolour(grid_to_px(drop_rows(body_rows, [13, 14, 15, 16])), shut)
    ash = lambda pts: {p: c for p, c in zip(pts, 'ZlZlZlZl')}  # pale flecks: dark grey vanished at night
    empty = grid_to_px([body_rows[i] for i in (14, 16, 17, 18)], 0, h - 4)  # an empty robe lying in a crumple
    out = [frame(ready, pal, 300, 'Hit (alive)'),
           frame(over(over(kneel, item), ash([(3, 6), (12, 4), (6, 2), (14, 9)])), pal, 150, 'Death: sags, ash spills from the sleeves'),
           frame(over(over(empty, item), ash([(4, h - 6), (9, h - 8), (12, h - 7), (7, h - 10)])), pal, 170, 'Crumbles to ash: the robe drops empty')]
    for i in range(6):
        cl = grid_to_px(CLOTH[i % 2], w // 2 - 6 - 3 * (i + 1), h - 6 - 3 * (i + 1) - (i % 2))
        trail = ash([(w // 2 - 3 * i + 2, h - 3 - 2 * i), (w // 2 - 3 * i + 5, h - 5 - 2 * i), (w // 2 - 3 * i, h - 1 - i)])
        out.append(frame(over(over(trail, cl), item), pal, 110 if i < 5 else 320,
                         'The wind takes the robe, fluttering away' if i == 0 else ('Gone on the wind' if i == 5 else '')))
    return out

def cultist_death_burn(body_rows, pal, item):
    """Burns up: embers catch at the hem and climb, the robe charring black behind them, then he falls in as a heap
    of ash with a last ember glowing in it."""
    h = len(body_rows); ready = grid_to_px(body_rows); shut = {'e': 'f'}
    def burnt(front):
        out = {}
        for (x, y), c in ready.items():
            if y > front: out[(x, y)] = 'k' if c == 'k' else 'D'
            elif y == front and c != 'k': out[(x, y)] = 'G' if x % 2 else 'g'
            else: out[(x, y)] = shut.get(c, c)
        return out
    pile = grid_to_px(["....kkk....", "..kkZlZkk..", ".kZlZgZlZk.", "kZlZcZlZcZk", "kkkkkkkkkkk"], len(body_rows[0]) // 2 - 5, h - 5)  # pale ash with a dark outline so it reads at night
    smoke = {(len(body_rows[0]) // 2, h - 7): 'Z', (len(body_rows[0]) // 2 + 1, h - 9): 'z', (len(body_rows[0]) // 2 - 1, h - 11): 'Z'}
    return [frame(ready, pal, 300, 'Hit (alive)'),
            frame(over(burnt(h - 3), item), pal, 140, 'Death: embers catch at the hem'),
            frame(over(burnt(h - 9), item), pal, 140, 'They climb, the robe charring black'),
            frame(over(burnt(h - 15), item), pal, 140, 'Up to the hood'),
            frame(over(over(pile, smoke), item), pal, 900, 'Falls in: a heap of ash, one ember left'),
            frame(over(pile, item), pal, 500, 'Fades')]

def cultist_sets(S):
    R, P = S['REDO_SPR'], S['REDO_PAL']; out = {}
    # Zealot: raise the sickle overhead (blade back), chop down in an arc, blade low in front, back.
    z = clean(R['zealot'], ZEALOT_FIX); zp = dict(P['zealot']); h = len(z); body = grid_to_px(z)
    sk = sickle()
    up = put(put(body, arm((10, 9), (12, 2))), stamp(mirror(sk), (12, 2)))
    trail = {p: 'L' for p in smear((10, 6), 8, 8, -110, 30, 'LL', 30) if p not in body}
    chop = put(put(over(trail, body), arm((10, 9), (15, 6))), stamp(rot_cw(sk), (15, 6)))
    low = put(put(body, arm((10, 9), (14, 11))), stamp(mirror(rot_cw(rot_cw(sk))), (14, 11)))
    rest = put(put(body, arm((10, 9), (13, 10))), stamp(sk, (13, 10)))
    out['zealot_attack'] = [frame(rest, zp, 500, 'Ready (sickle held up, as today)'),
                            frame(shift(up, -1, 0), zp, 220, 'Raises the sickle over his head, blade back (the tell)'),
                            frame(shift(chop, 1, 0), zp, 60, 'Chops down in an arc'),
                            frame(shift(low, 2, 0), zp, 150, 'Blade low in front, through you (held)'),
                            frame(shift(rest, 1, 0), zp, 130, 'Back')]
    lying = stamp(rot_cw(sk), (13, h - 1))
    out['zealot_death'] = cultist_death(z, zp, (lying, lying), 'the sickle falls')
    out['zealot_death_2'] = cultist_death_wind(z, zp, lying); out['zealot_death_3'] = cultist_death_burn(z, zp, lying)
    # Ashcaller: pulls the ember to his chest, shoves it at you, it flares and spits sparks.
    a = clean(R['ashcaller'], ASH_FIX); ap = dict(P['ashcaller']); h = len(a); body = grid_to_px(a)
    rest = put(put(body, arm((10, 9), (12, 8))), stamp(ember(), (12, 7)))
    pull = put(put(body, arm((10, 9), (10, 10))), stamp(ember(), (11, 9)))
    shove = put(put(body, arm((10, 9), (15, 9))), stamp(ember(True), (16, 8)))
    sparks = {(19, 6): 'G', (20, 8): 'g', (19, 10): 'G', (21, 7): 'g'}
    out['ashcaller_attack'] = [frame(rest, ap, 500, 'Ready (ember held up, as today)'),
                               frame(shift(pull, -1, 0), ap, 180, 'Pulls the ember in to his chest (the tell)'),
                               frame(shift(shove, 1, 0), ap, 60, 'Shoves it at you, it flares'),
                               frame(over(shift(shove, 2, 0), shift(sparks, 2, 0)), ap, 140, 'Sparks spit off it into you (held)'),
                               frame(shift(rest, 1, 0), ap, 120, 'Back')]
    gem = {(13, h - 2): 'g', (14, h - 2): 'G', (13, h - 1): 'k', (14, h - 1): 'k'}
    smoke = {(13, h - 2): 'O', (14, h - 4): 'z', (13, h - 6): 'z'}
    out['ashcaller_death'] = cultist_death(a, ap, (gem, smoke), 'the ember drops and goes out')
    out['ashcaller_death_2'] = cultist_death_wind(a, ap, smoke); out['ashcaller_death_3'] = cultist_death_burn(a, ap, {})
    # Chanter: swings the censer up on its chain, brings it down on you, embers jump out.
    c = clean(R['chanter'], CHANT_FIX); cp = dict(P['chanter']); h = len(c); body = grid_to_px(c)
    cs = censer()
    def swing(hand, cen, extra=None):
        b = put(body, arm((10, 9), hand))
        b = put(b, chain(hand, (cen[0], cen[1] - 1)))
        b = put(b, stamp(cs, cen))
        return over(b, extra) if extra else b
    rest = swing((12, 10), (14, 13))
    up = swing((12, 6), (10, -1))
    trail = {p: 'z' for p in smear((12, 7), 9, 9, -100, 50, 'zz', 30) if p not in body}
    down = over(trail, swing((13, 8), (19, 4)))
    hit = swing((14, 10), (19, 15), {(22, 13): 'G', (17, 13): 'g', (21, 17): 'G', (23, 15): 'g'})
    out['chanter_attack'] = [frame(rest, cp, 500, 'Ready (censer hanging, as today)'),
                             frame(shift(up, -1, 0), cp, 220, 'Swings the censer up over his head (the tell)'),
                             frame(shift(down, 1, 0), cp, 60, 'Brings it round on its chain'),
                             frame(shift(hit, 2, 0), cp, 150, 'It smashes into you, embers jump (held)'),
                             frame(shift(rest, 1, 0), cp, 130, 'Back')]
    ground = stamp(cs, (15, h - 3))
    out['chanter_death'] = cultist_death(c, cp, (ground, ground), 'the censer drops')
    out['chanter_death_2'] = cultist_death_wind(c, cp, ground); out['chanter_death_3'] = cultist_death_burn(c, cp, ground)
    # The dungeon's hooded (menders and deacons) fall the same three ways, holding on to what's in their hands.
    for k in ('mender', 'deacon'):
        r, pk = R[k], dict(P[k])
        out[k + '_death'] = cultist_death(r, pk, ({}, {}), 'slumping'); out[k + '_death_2'] = cultist_death_wind(r, pk, {}); out[k + '_death_3'] = cultist_death_burn(r, pk, {})
    return out

def player(S):
    r = S['RAG15']['warrior']; pal = dict(S['RAG15_COMMON']); pal.update(r['c'])
    return {'px': [[x, y, c] for (x, y), c in grid_to_px(r['r']).items()], 'pal': pal}

def build():
    S = load(); d = {}
    d['beetle_bite'], d['beetle_death'] = beetle_set(S, 'beetle', 17, 6, False)
    d['ironshell_bite'], d['ironshell_death'] = beetle_set(S, 'ironshell', 29, 8, True)
    d['boar_bite'], d['boar_death'] = boar_set(S)
    d['wisp_bite'], d['wisp_death'] = wisp_set(S)
    d.update(cultist_sets(S))
    return d, S

def sheet(d, out, scale=6):
    from PIL import Image
    strips = []
    for key, frs in d.items():
        if key == 'player': continue
        allp = [(x, y) for f in frs for x, y, _ in f['px']]
        x0, y0, x1, y1 = min(p[0] for p in allp) - 2, min(p[1] for p in allp) - 2, max(p[0] for p in allp) + 2, max(p[1] for p in allp) + 2
        fw, fh = x1 - x0 + 1, y1 - y0 + 1
        im = Image.new('RGB', (fw * len(frs), fh), (40, 38, 46))
        for i, f in enumerate(frs):
            for x, y, c in f['px']:
                hx = f['pal'].get(c, '#ff00ff').lstrip('#'); im.putpixel((i * fw + x - x0, y - y0), tuple(int(hx[j:j+2], 16) for j in (0, 2, 4)))
        strips.append(im.resize((im.width * scale, im.height * scale), Image.NEAREST))
    W = max(s.width for s in strips); H = sum(s.height + 12 for s in strips)
    sh = Image.new('RGB', (W, H), (24, 22, 28)); y = 0
    for st in strips: sh.paste(st, (0, y)); y += st.height + 12
    sh.save(out)

if __name__ == '__main__':
    d, S = build(); d['player'] = player(S)
    out = os.path.join(ROOT, 'art/drafts/family-anims-draft1.json')
    json.dump(d, open(out, 'w'), separators=(',', ':'))
    sheet(d, out.replace('.json', '.png'))
    print('wrote', out)

# ---------- into the game (owner OK'd draft 1, Nov 27: "this all looks fantastic"; one shared cultist death is fine) ----------
# mob_attack_draft.py --game calls this and merges it into MOB_POSES, so one command rewrites every mob's frames.
GAME = {  # game image name: (draft key for the attack, draft key for the death, sprite rows the frames line up with)
    'beetle': ('beetle_bite', 'beetle_death', lambda S: S['REDO_SPR']['beetle']),
    'ironshell': ('ironshell_bite', 'ironshell_death', lambda S: S['REDO_SPR']['ironshell']),
    'boar': ('boar_bite', 'boar_death', lambda S: S['REDO_SPR']['boar']),
    'wisp': ('wisp_bite', 'wisp_death', lambda S: S['WISP_SPR'][0]),
    'zealot': ('zealot_attack', 'zealot_death', lambda S: S['REDO_SPR']['zealot']),
    'ashcaller': ('ashcaller_attack', 'ashcaller_death', lambda S: S['REDO_SPR']['ashcaller']),
    'chanter': ('chanter_attack', 'chanter_death', lambda S: S['REDO_SPR']['chanter']),
}

def game_data(to_pose):
    d, S = build(); poses, deaths = {}, {}
    for name, (atk, die, base) in GAME.items():
        rows = base(S); w, h = len(rows[0]), len(rows)
        frs = d[atk][1:]  # frame 0 is the ready pose (the normal sprite)
        poses[name] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal']}
        for slot, f in zip(['wind', 'smear', 'hit', 'rec'], frs): poses[name][slot] = to_pose(f, w, h)
        for suf in ('', '_2', '_3'):  # extra deaths picked at random in the game (cultists, owner Nov 27)
            if die + suf not in d: continue
            frs = d[die + suf][1:]
            deaths[name + suf] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal'], 'f': [to_pose(f, w, h) for f in frs]}
    for name in ('mender', 'deacon'):  # deaths only for now (their attacks come with the cast poses)
        rows = S['REDO_SPR'][name]; w, h = len(rows[0]), len(rows)
        for suf in ('', '_2', '_3'):
            frs = d[name + '_death' + suf][1:]
            deaths[name + suf] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal'], 'f': [to_pose(f, w, h) for f in frs]}
    return poses, deaths

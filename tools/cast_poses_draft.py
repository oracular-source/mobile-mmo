"""Mob cast poses, draft 1 (animation lane, Nov 27): every enemy that casts gets a drawn pose held for the whole cast,
a glow in the spell's colour that builds as the bar fills, and a release frame when it goes off. Drawn as real frames
from the live sprites (never rotated, never drawn big and shrunk). Not loaded by the game until the owner OKs them.

  ashcaller  Ash Bolt      lifts his ember over his head, it swells orange, he hurls it forward
  summoner   Cinder Lash   raises his hand, flame coils round it into a whip, he lashes it out at you
  acolyte    Shadow Bolt   lifts the censer on its chain, a purple orb gathers over it, he flings it
             Ember Brand   (instant) tips the censer down at you, embers spill to the ground
  mender     Mend          both hands up, green light gathers between them, it bursts outward
  chanter    chant         (instant) sways the censer side to side, purple motes rise from it
  gwisp      flare         (instant) swells white-hot and fans out while its ring of fire burns
  malrec     Ash Bolt      lifts his caged-flame staff, the flame swells out of the cage, he tips it at you
             Rite of Mending  staff planted, his gold trim lights up and gold motes rise round his hem
  prior      Grasp of the Deep  lifts his dead lantern high, it glows sea-green and drips, he swings it down: splash
  bellringer Toll          heaves the clapper up and strains (shaking), then slams it down: dust and sound rings

Run:  python3 tools/cast_poses_draft.py  ->  art/drafts/cast-poses-draft1.json and .png
Rules kept: spells may glow (flashy only for spells); the Toll is physical (a man and a bell clapper); looks only,
same timing (each hold lasts exactly the spell's cast time from js/data/mobs.js / js/world.js).
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mob_attack_draft import grid_to_px, line, over, shift, frame, ROOT
from family_anims_draft import reoutline, stamp, put, outlined, recolour, clean, censer, chain, ember, ASH_FIX, CHANT_FIX

def load():
    js = r"""
const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');
const o=new Function(src+';return {REDO_SPR,REDO_PAL,UNDEAD_SPR,UNDEAD_PAL,MONASTERY_SPR,MONASTERY_PAL,GWISP_SPR,GWISP_PAL,RAG15,RAG15_COMMON}')();
process.stdout.write(JSON.stringify(o));"""
    out = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'js/data/sprites.js')], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

# Spell colours: 1 dark rim, 2 the spell's own colour (from mobs.js), 3 bright, 4 white-hot core. Digits so they never
# clash with a sprite's own palette letters.
SPELL = {
    'ash':    {'1': '#a0461e', '2': '#ff9a4a', '3': '#ffd08a', '4': '#fff4dc'},
    'shadow': {'1': '#5a3a9a', '2': '#b48cff', '3': '#dcc8ff', '4': '#f6f0ff'},
    'cinder': {'1': '#a05a1e', '2': '#ffb060', '3': '#ffe0a0', '4': '#fff6e0'},
    'mend':   {'1': '#3e7a2e', '2': '#9be37a', '3': '#d4f5c0', '4': '#f4fff0'},
    'rite':   {'1': '#9a7420', '2': '#ffd27a', '3': '#fff0c0', '4': '#fffcf0'},
    'grasp':  {'1': '#3a7a66', '2': '#9fd8c0', '3': '#d4fff0', '4': '#f4fffa'},
    'chant':  {'1': '#5a3a9a', '2': '#c8a0ff', '3': '#e8d8ff', '4': '#f6f0ff'},
}
DUST = {'u': '#8a7f70', 'U': '#6e6458'}

def pal_of(base, spell):
    p = dict(base); p.update(SPELL[spell]); return p

# ---------- light ----------
ORB = [  # glow stages, centre at (0,0): it starts as a spark and swells as the cast bar fills (the channel glow recipe)
    {(0, 0): '3'},
    {(0, 0): '4', (1, 0): '2', (-1, 0): '2', (0, 1): '2', (0, -1): '2'},
    {(0, 0): '4', (1, 0): '3', (-1, 0): '3', (0, 1): '3', (0, -1): '3', (1, 1): '1', (-1, 1): '1', (1, -1): '1', (-1, -1): '1',
     (2, 0): '2', (-2, 0): '2', (0, 2): '2', (0, -2): '2'},
    {(0, 0): '4', (1, 0): '4', (0, -1): '4', (1, -1): '4', (-1, 0): '3', (2, 0): '3', (0, 1): '3', (1, 1): '3', (0, -2): '3', (1, -2): '3',
     (-1, -1): '3', (2, -1): '3', (-1, 1): '2', (2, 1): '2', (-1, -2): '2', (2, -2): '2', (-2, 0): '2', (3, 0): '2', (-2, -1): '2', (3, -1): '2',
     (0, 2): '2', (1, 2): '2', (0, -3): '2', (1, -3): '2', (-2, 1): '1', (3, 1): '1', (-2, -2): '1', (3, -2): '1'},
]
def orb(stage, at): return stamp(ORB[stage], at)

def motes(at, r, n, seed):
    """A few sparks drifting in toward the glow: n pixels on a ring of radius r round `at`, turned by seed each frame."""
    import math
    out = {}
    for i in range(n):
        a = (i / n + seed * 0.13) * 2 * math.pi
        out[(round(at[0] + math.cos(a) * r), round(at[1] + math.sin(a) * r * 0.8))] = '3' if i % 2 else '2'
    return out

def burst(at, r, cols='34'):
    """The release flash: a short star of light at `at` (one frame)."""
    out = {at: '4'}
    for d in range(1, r + 1):
        c = cols[0] if d < r else cols[1] if len(cols) > 1 else cols[0]
        for dx, dy in ((d, 0), (-d, 0), (0, d), (0, -d)): out[(at[0] + dx, at[1] + dy)] = c
        if d < r:
            for dx, dy in ((d, d), (-d, d), (d, -d), (-d, -d)): out[(at[0] + dx, at[1] + dy)] = '2'
    return out

def arm(shoulder, hand, col='a', skin='s'):
    a = {p: col for p in line(shoulder, hand)}; a[hand] = skin
    return outlined(a)

def hold(make, pal, dur, labels, n=4):
    """Split a cast of `dur` seconds into n frames (glow stage 0..3), each drawn by make(stage, i). The review page fills
    the cast bar over exactly these frames."""
    ms = round(dur * 1000 / n)
    return [dict(frame(make(min(3, i), i), pal, ms, labels[i] if i < len(labels) else ''), cast=1) for i in range(n)]

# ---------- cultists (21 x 17 hooded robes) ----------
SUMMON_FIX = {4: '....kaHffffdk', 5: '...kdaHfefedk', 6: '...kdaffffddk', 7: '...kddaffdddk', 8: '...kdHmmmmmdk',
              9: '..kdHHmmmmmddk', 10: '..kdHaaaaaaadk', 11: '..kdHaaaaaaaddk'}
MENDER_FIX = {9: '..kdHHmmmmmddk', 10: '..kdHaaaaaaadk', 11: '..kdHaaaaaaadk', 12: '.kdHarrrrrrrdk', 13: '.kdHaaaaRaaaddk',
              14: '.kdHaaaaRaaaaddk'}
ACO_FIX = {8: '....kdHmmmmmdk', 9: '...kdHHmmmmmddk', 10: '...kdHaaaaaaadk', 11: '...kdHaaaaaaaddk', 12: '..kdHarrrrrrrddk',
           13: '..kdHaaaaRaaaddk', 14: '..kdHaaaaRaaaddk', 15: '..kdHaadaaaaaddk'}

def ashcaller(S):
    a = clean(S['REDO_SPR']['ashcaller'], ASH_FIX); pal = pal_of(S['REDO_PAL']['ashcaller'], 'ash'); body = grid_to_px(a)
    rest = put(put(body, arm((10, 9), (12, 8))), stamp(ember(), (12, 7)))
    up = put(body, arm((10, 9), (13, 1)))
    def lift(st, i):
        b = put(up, stamp(ember(), (13, 0)))
        g = orb(st, (13, -2))
        return over(over(b, g), motes((13, -2), 5 - st // 2, 3 + st, i)) if st else over(b, g)
    throw = put(body, arm((10, 9), (16, 8)))
    return [frame(rest, pal, 400, 'Ready (as today)')] + \
        hold(lift, pal, 1.0, ['Cast starts: lifts the ember over his head', 'It catches, orange light swelling', 'Brighter, sparks drawn in', 'White-hot at the top of the bar']) + \
        [frame(over(throw, burst((18, 7), 3)), pal, 90, 'Release: hurls it forward (the Ash Bolt flies)'),
         frame(throw, pal, 120, 'Arm out'), frame(rest, pal, 200, 'Back')]

def summoner(S):
    a = clean(S['REDO_SPR']['summoner'], SUMMON_FIX); pal = pal_of(S['REDO_PAL']['summoner'], 'cinder'); body = grid_to_px(a)
    rest = put(put(body, arm((10, 9), (12, 8))), stamp(ember(), (12, 7)))
    up = put(body, arm((10, 9), (12, 1)))
    tails = [{}, {(11, 2): '1'}, {(11, 2): '2', (10, 3): '1', (13, 3): '1'},
             {(11, 2): '3', (10, 3): '2', (9, 3): '1', (13, 3): '2', (14, 4): '1', (10, -3): '2', (14, -3): '1'}]
    coils = [over(tails[i], ORB[i] and stamp(ORB[i], (12, -1))) for i in range(4)]
    def lift(st, i): return over(up, coils[st])
    lash = put(body, arm((10, 9), (15, 6)))
    whip = {}
    for j, p in enumerate(line((16, 5), (20, 3)) + line((21, 3), (25, 7)) + line((26, 8), (28, 12))):
        whip[p] = '4' if j > 11 else '3' if j % 2 else '2'
    return [frame(rest, pal, 400, 'Ready (as today)')] + \
        hold(lift, pal, 1.2, ['Cast starts: raises his hand', 'Flame curls round it', 'The coil grows a tail', 'A whip of fire, ready']) + \
        [frame(over(lash, whip), pal, 110, 'Release: lashes it out at you (Cinder Lash)'),
         frame(over(lash, {p: '1' for p in list(whip)[:7]}), pal, 90, 'The lash falls back and dies'), frame(rest, pal, 200, 'Back')]

def acolyte(S):
    a = clean(S['REDO_SPR']['acolyte'], ACO_FIX); pal = pal_of(S['REDO_PAL']['acolyte'], 'shadow'); body = grid_to_px(a)
    cs = censer()
    def carry(hand, cen, embers=None):
        b = put(put(body, arm((11, 10), hand)), chain(hand, (cen[0], cen[1] - 1)))
        b = put(b, stamp(cs if not embers else recolour(cs, embers), cen))
        return b
    rest = carry((13, 11), (15, 14))
    def lift(st, i):
        b = carry((15, 2), (16, 6), {'g': '2', 'G': '3'} if st else None)
        g = orb(st, (16, -2))
        return over(over(b, g), motes((16, -2), 5, 2 + st, i)) if st else over(b, g)
    fling = carry((16, 9), (20, 9), {'g': '2', 'G': '4'})
    bolt = [frame(rest, pal, 400, 'Ready (censer hanging, as today)')] + \
        hold(lift, pal, 2.0, ['Cast starts: lifts the censer high on its chain', 'Its embers turn purple; shadow gathers above', 'The orb swells, shadow drawn in', 'Full: a purple orb over his head']) + \
        [frame(over(fling, burst((22, 7), 3)), pal, 90, 'Release: flings it at you (the Shadow Bolt flies)'),
         frame(fling, pal, 120, 'Censer swung out'), frame(rest, pal, 200, 'Back')]
    tip = carry((15, 11), (18, 14))
    spill = lambda k: {(19 + (j % 3) - 1, 16 + k + j // 2): 'G' if j % 2 else 'g' for j in range(4)}
    brand = [frame(rest, pal, 300, 'Ready'),
             frame(tip, pal, 120, 'Ember Brand (instant): tips the censer down at you'),
             frame(over(tip, spill(0)), pal, 120, 'Embers spill out'),
             frame(over(tip, spill(2)), pal, 140, 'They fall toward the ground (the ring flares under you)'),
             frame(rest, pal, 200, 'Back')]
    return bolt, brand

def mender(S):
    a = clean(S['REDO_SPR']['mender'], MENDER_FIX); pal = pal_of(S['REDO_PAL']['mender'], 'mend'); body = grid_to_px(a)
    rest = grid_to_px(S['REDO_SPR']['mender'])
    up = put(put(body, arm((4, 10), (3, 1), 'd')), arm((10, 9), (13, 1)))
    def lift(st, i):
        g = orb(st, (8, -2))
        return over(over(up, g), motes((8, -2), 5, 2 + st, i)) if st else over(up, g)
    out_ = put(put(body, arm((4, 10), (1, 4), 'd')), arm((10, 9), (15, 4)))
    ring = {}
    import math
    for j in range(16):
        ang = j / 16 * 2 * math.pi; ring[(round(8 + math.cos(ang) * 9), round(-2 + math.sin(ang) * 5))] = '3' if j % 2 else '2'
    return [frame(rest, pal, 400, 'Ready (as today)')] + \
        hold(lift, pal, 1.5, ['Cast starts: both hands up', 'Green light gathers between them', 'Brighter, motes drawn in', 'Full: ready to mend']) + \
        [frame(over(out_, ring), pal, 110, 'Release: hands open, the light bursts out (the hurt ally heals)'),
         frame(out_, pal, 110, 'Hands open'), frame(rest, pal, 200, 'Back')]

def chanter(S):
    c = clean(S['REDO_SPR']['chanter'], CHANT_FIX); pal = pal_of(S['REDO_PAL']['chanter'], 'chant'); body = grid_to_px(c)
    cs = censer()
    def swing(hand, cen, extra=None):
        b = put(put(put(body, arm((10, 9), hand)), chain(hand, (cen[0], cen[1] - 1))), stamp(cs, cen))
        return over(b, extra) if extra else b
    rise = lambda x, k: {(x, 8 - k): '2', (x + 1, 5 - k): '3', (x - 1, 2 - k): '2', (x + 2, -1 - k): '1'}
    rest = swing((12, 10), (14, 13))
    return [frame(rest, pal, 400, 'Ready (as today)'),
            frame(swing((12, 9), (17, 11), rise(17, 0)), pal, 220, 'Chants (instant): swings the censer out, purple motes rise'),
            frame(swing((11, 10), (12, 14), rise(14, 2)), pal, 220, 'Back across the robe'),
            frame(swing((12, 9), (17, 11), rise(17, 4)), pal, 220, 'Out again, the motes drift up'),
            frame(swing((11, 10), (12, 14), rise(14, 6)), pal, 220, 'Back (his camp now hits harder)'),
            frame(rest, pal, 200, 'Settles')]

# ---------- great ash wisp ----------
def gwisp(S):
    W = S['GWISP_SPR'][0]; pal = dict(S['GWISP_PAL']); pal.update({'1': '#a0461e', '2': '#ff8a3c', '3': '#ffd070', '4': '#fff6d8'})
    ready = grid_to_px(W); flame = {p: c for p, c in ready.items() if c != 's'}; tail = {p: c for p, c in ready.items() if c == 's'}
    core = {p for p, c in flame.items() if c != 'k'}
    def grow(n):
        cur = set(core); add = {}
        for k in range(n):
            nxt = {}
            for (x, y) in cur:
                for q in ((x + 1, y), (x - 1, y), (x, y - 1), (x - 1, y - 1) if k % 2 else (x + 1, y - 1)):
                    if q not in cur: nxt[q] = '2' if k == n - 1 else '3'
            add.update(nxt); cur |= set(nxt)
        body = recolour({p: flame[p] for p in core}, {'y': 'Y', 'Y': 'W'})
        out = over(add, body)
        return over(outlined(out) if False else {**{q: 'k' for (x, y) in out for q in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)) if q not in out}, **out}, tail)
    big, bigger = grow(1), grow(2)
    return [frame(ready, pal, 400, 'Ready (as today)'),
            frame(bigger, pal, 120, 'Flares (instant): swells white-hot, side flames fanning out'),
            dict(frame(big, pal, 380, 'Burns while its ring of fire spreads below'), cast=1),
            dict(frame(bigger, pal, 380, 'Pulses'), cast=1),
            dict(frame(big, pal, 420, ''), cast=1),
            dict(frame(bigger, pal, 420, 'Last pulse as the ring goes off'), cast=1),
            frame(ready, pal, 200, 'Settles')]

# ---------- Brother Malrec ----------
def malrec(S):
    rows = S['UNDEAD_SPR']['malrec']; ready = grid_to_px(rows)
    staff = {p: c for p, c in ready.items() if p[0] >= 17 and not (p[1] >= 9 and p[0] == 17)}
    body = {p: c for p, c in ready.items() if p not in staff}
    cage_in = {(20, 4), (20, 5), (21, 4), (21, 5), (20, 6), (21, 6)}
    def lifted(dy, cage_col=None, shear=0):
        s = {}
        for (x, y), c in staff.items():
            nx = x + (max(0, (12 - y)) // 4 if shear else 0)
            if cage_col and (x, y) in cage_in and c in 'fFc': c = cage_col
            s[(nx, y - dy)] = c
        hand = {(16, 10 - dy): 'w', (17, 10 - dy): 'w', (16, 11 - dy): 'w'}
        return reoutline(over(over(body, s), hand))
    bolt_pal = pal_of(S['UNDEAD_PAL']['malrec'], 'ash')
    def lift(st, i):
        b = lifted(3, '34'[min(1, st // 2)] if st else None)
        g = orb(st, (21, -2))
        return over(over(b, g), motes((21, -2), 5, 2 + st, i)) if st else over(b, g)
    tipped = lifted(1, '4', shear=1)
    bolt = [frame(ready, bolt_pal, 400, 'Ready (as today)')] + \
        hold(lift, bolt_pal, 2.0, ['Ash Bolt starts: lifts the staff', 'The caged flame swells', 'It spills out of the cage, sparks drawn in', 'Full: a ball of fire over the staff']) + \
        [frame(over(tipped, burst((25, 0), 3)), bolt_pal, 100, 'Release: tips the staff at you (the bolt flies)'),
         frame(tipped, bolt_pal, 120, 'Staff tipped'), frame(ready, bolt_pal, 220, 'Back')]
    rite_pal = pal_of(S['UNDEAD_PAL']['malrec'], 'rite')
    h = len(rows)
    def glow(st, i):
        lit = recolour(ready, {'y': '2', 'Y': '3', 'e': 'E'} if st >= 2 else {'y': 'Y'} if st else {})
        rise = {}
        for j in range(3 + st * 2):
            x = 1 + (j * 5 + i * 3) % 18; y = h - 2 - ((j * 3 + i * 4) % (5 + st * 3))
            if (x, y) not in ready or ready[(x, y)] in 'kb': rise[(x, y)] = '3' if j % 2 else '2'
        return over(lit, rise)
    floor = {(x, h): '2' if x % 2 else '3' for x in range(-2, 20)}
    rite = [frame(ready, rite_pal, 400, 'Ready (as today)')] + \
        hold(glow, rite_pal, 2.0, ['Rite of Mending starts: staff planted, he stills', 'His gold trim warms', 'It burns bright, gold motes rising round his hem', 'Full: lit up gold']) + \
        [frame(over(recolour(ready, {'y': '3', 'Y': '3', 'e': 'E'}), floor), rite_pal, 120, 'Release: a flash of gold along the floor (his hurt ally heals)'),
         frame(recolour(ready, {'y': 'Y'}), rite_pal, 140, 'Fading'), frame(ready, rite_pal, 200, 'Back')]
    return bolt, rite

# ---------- the Drowned Prior ----------
def prior(S):
    rows = S['MONASTERY_SPR']['prior']; pal = pal_of(S['MONASTERY_PAL']['prior'], 'grasp'); ready = grid_to_px(rows); h = len(rows)
    lantern = {p: c for p, c in ready.items() if p[0] >= 19 and p[1] >= 13}
    body = {p: c for p, c in ready.items() if p not in lantern}
    def raised(dy, dx=1, lamp=None):
        lt = {(x + dx, y - dy): (lamp.get(c, c) if lamp else c) for (x, y), c in lantern.items()}
        a = arm((17, 13), (20 + dx, 14 - dy), 'h', 'p')
        return reoutline(put(over(body, lt), a))
    drip = lambda i: {(22, 14 + (i * 3) % 7): '2', (24, 14 + (i * 3 + 4) % 7): '3'}
    def lift(st, i):
        lamp = {'G': '234'[min(2, st)] if st else 'G', 'x': '4' if st >= 2 else 'x'}
        b = raised(11, 1, lamp)
        if st: b = over(stamp(ORB[st], (23, 9)), b)  # glow behind the lantern so it halos round it
        return over(b, over(drip(i), motes((23, 9), 5, st + 1, i))) if st else b
    splash = {}
    for x in range(-3, 30):
        if x % 3 != 1: splash[(x, h - 1 + (x % 2))] = '2' if x % 2 else '3'
    down = raised(0, 2, {'G': '4', 'x': '4'})
    return [frame(ready, pal, 400, 'Ready (as today)')] + \
        hold(lift, pal, 2.0, ['Grasp of the Deep starts: lifts the dead lantern high', 'It glows sea-green, water dripping off it', 'Brighter, the deep drawn in', 'Full (get onto dry stone!)']) + \
        [frame(over(down, splash), pal, 120, 'Release: swings it down, the flood water splashes up (the hands rise)'),
         frame(down, pal, 140, 'Lantern down'), frame(ready, pal, 220, 'Back')]

# ---------- the Bellringer ----------
def bellringer(S):
    rows = S['MONASTERY_SPR']['bellringer']; pal = dict(S['MONASTERY_PAL']['bellringer']); pal.update(DUST); pal.update(SPELL['rite'])
    ready = grid_to_px(rows); h = len(rows)
    maul = {p: c for p, c in ready.items() if (p[0] >= 18 and p[1] <= 25) or (p[0] == 17 and p[1] <= 12)}
    body = {p: c for p, c in ready.items() if p not in maul}
    def heave(dy, dx):
        m = {(x + dx, y - dy): c for (x, y), c in maul.items()}
        return reoutline(over(body, m))
    def strain(st, i):
        dy = 2 + st; dx = -1 if i % 2 else 0  # lifts higher each beat and shakes side to side: the strain is the tell
        return heave(dy, dx)
    # The clapper stays one straight, rigid, UPRIGHT bar (owner, Nov 27, twice: a tilted bar read as a bent spoon). He drives
    # it straight down in front of him: the same clapper drawn head-down (flipped top to bottom, never turned), the iron
    # head on the floor, his fist on the top of the handle.
    bare = {p: c for p, c in body.items() if not (p[0] >= 15 and p[1] <= 12 and c in 'knmN')}  # no stub of the handle left over his head
    iron = {p: c for p, c in maul.items() if c not in 'sS' and p[1] <= 24}
    for y in range(12, 17):  # the handle under his old fist: fill it in from a plain row of the handle
        for x in range(18, 25):
            iron.pop((x, y), None)
            if (x, 18) in maul: iron[(x, y)] = maul[(x, 18)]
    top = min(y for _, y in iron); bot = max(y for _, y in iron)
    dx = 6; dy = (h - 2) - bot - top  # flipped so the head is at the bottom, resting on the floor row
    flipped = {(x + dx, top + bot - y + dy): c for (x, y), c in iron.items()}
    hx = 20 + dx; fy = min(y for _, y in flipped)
    hit = reoutline(put(over(bare, flipped), arm((16, 12), (hx, fy + 1), 'h', 's')))
    hit = over(hit, {(hx - 1, fy + 1): 's', (hx, fy + 1): 'S', (hx + 1, fy + 1): 's', (hx - 1, fy + 2): 's', (hx, fy + 2): 's', (hx + 1, fy + 2): 'S'})
    dust = {(22, h - 1): 'u', (31, h - 2): 'U', (21, h - 2): 'U', (32, h - 1): 'u', (30, h - 3): 'u', (23, h - 3): 'U'}
    rings = {}
    import math
    for r, col in ((7, '3'), (10, '2')):
        for j in range(-6, 7):
            a = math.radians(j * 12); rings[(round(27 + math.cos(a) * r), round(h - 4 + math.sin(a) * r * 0.5))] = col
    return [frame(ready, pal, 400, 'Ready (as today)')] + \
        hold(strain, pal, 1.5, ['Toll starts: heaves the clapper up', 'Higher, straining (it shakes)', 'Higher still', 'Up over his shoulder (step back now!)']) + \
        [frame(over(over(hit, dust), rings), pal, 120, 'Release: slams it into the floor: dust, the toll rings out (stuns anyone close)'),
         frame(over(hit, dust), pal, 200, 'Clapper on the floor'), frame(ready, pal, 220, 'Hauls it back up')]

def player(S):
    r = S['RAG15']['warrior']; pal = dict(S['RAG15_COMMON']); pal.update(r['c'])
    return {'px': [[x, y, c] for (x, y), c in grid_to_px(r['r']).items()], 'pal': pal}

def build():
    S = load(); d = {}
    d['ashcaller_cast'] = ashcaller(S)
    d['summoner_cast'] = summoner(S)
    d['acolyte_cast'], d['acolyte_brand'] = acolyte(S)
    d['mender_cast'] = mender(S)
    d['chanter_chant'] = chanter(S)
    d['gwisp_flare'] = gwisp(S)
    d['malrec_cast'], d['malrec_heal'] = malrec(S)
    d['prior_grasp'] = prior(S)
    d['bellringer_toll'] = bellringer(S)
    return d, S

if __name__ == '__main__' and '--game' not in sys.argv:
    from family_anims_draft import sheet
    d, S = build(); d['player'] = player(S)
    out = os.path.join(ROOT, 'art/drafts/cast-poses-draft1.json')
    json.dump(d, open(out, 'w'), separators=(',', ':'))
    sheet(d, out.replace('.json', '.png'))
    print('wrote', out)

# ---------- into the game (owner OK'd draft 1, Nov 27: "everything else looks absolutely fantastic"; the clapper
# stays straight when it hits the floor) ----------
# python3 tools/cast_poses_draft.py --game  writes MOB_CASTS into js/data/sprites.js. Per mob image, per kind of cast:
#   h  = the hold frames, stepped through as the cast bar fills (glow stage 0..3)
#   r  = the release frames played once when the spell goes off (rt = their seconds); for instant moves (chant, flare,
#        brand) r is the whole move. The first (ready) and last (back) draft frames are the normal sprite, so they're dropped.
CAST_GAME = {  # image: {kind: (draft key, base rows)}
    'ashcaller': {'bolt': ('ashcaller_cast', lambda S: S['REDO_SPR']['ashcaller'])},
    'summoner': {'bolt': ('summoner_cast', lambda S: S['REDO_SPR']['summoner'])},
    'acolyte': {'bolt': ('acolyte_cast', lambda S: S['REDO_SPR']['acolyte']), 'brand': ('acolyte_brand', lambda S: S['REDO_SPR']['acolyte'])},
    'mender': {'heal': ('mender_cast', lambda S: S['REDO_SPR']['mender'])},
    'chanter': {'chant': ('chanter_chant', lambda S: S['REDO_SPR']['chanter'])},
    'gwisp': {'flare': ('gwisp_flare', lambda S: S['GWISP_SPR'][0])},
    'malrec': {'bolt': ('malrec_cast', lambda S: S['UNDEAD_SPR']['malrec']), 'heal': ('malrec_heal', lambda S: S['UNDEAD_SPR']['malrec'])},
    'prior': {'grasp': ('prior_grasp', lambda S: S['MONASTERY_SPR']['prior'])},
    'bellringer': {'toll': ('bellringer_toll', lambda S: S['MONASTERY_SPR']['bellringer'])},
}
INSTANT = ('chant', 'flare', 'brand')

def write_game():
    from mob_attack_draft import to_pose
    d, S = build(); out = {}
    for img, kinds in CAST_GAME.items():
        out[img] = {}
        for kind, (key, base) in kinds.items():
            rows = base(S); w, h = len(rows[0]), len(rows); frs = d[key][1:-1]
            hold = [] if kind in INSTANT else [f for f in frs if f.get('cast')]
            rel = frs if kind in INSTANT else [f for f in frs if not f.get('cast')]
            out[img][kind] = {'pal': frs[0]['pal'], 'h': [to_pose(f, w, h) for f in hold], 'r': [to_pose(f, w, h) for f in rel],
                              'rt': [round(f['ms'] / 1000, 3) for f in rel]}
    from mob_attack_draft import to_pose as tp
    from gap_anims_draft import screech_cast
    out['gnaw'] = {'squeal': screech_cast(tp)}  # Old Gnawbone's screech when he squeals (owner picked A, Nov 28)
    block = ('// MOB_CASTS (from tools/cast_poses_draft.py --game, owner OK Nov 27): cast poses. h = frames held while the cast bar\n'
             '// fills (the glow builds), r = frames played once when it goes off (rt seconds each); instant moves are all r.\n'
             'const MOB_CASTS=' + json.dumps(out, separators=(',', ':')) + ';\n// /MOB_CASTS\n')
    p = os.path.join(ROOT, 'js/data/sprites.js'); s = open(p).read()
    a = s.find('// MOB_CASTS'); b = s.find('// /MOB_CASTS\n')
    s = (s[:a] + block + s[b + len('// /MOB_CASTS\n'):]) if a >= 0 and b > a else s.rstrip('\n') + '\n' + block
    open(p, 'w').write(s); print('wrote MOB_CASTS into js/data/sprites.js', len(block) // 1024, 'KB')

if __name__ == '__main__' and '--game' in sys.argv:
    write_game()

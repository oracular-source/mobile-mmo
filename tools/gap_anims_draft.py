"""Gap animations + Old Gnawbone's screech, draft 1 (animation lane, Nov 27; owner: "fill the gaps in too, and then let's
come up with something for Old Gnawbone"). Every mob that still lunges with a generic swing or sinks into the floor gets
its own physical attack and/or death, drawn from its live sprite (never rotated, never drawn big and shrunk):

  great ash wisp  the ash wisp's moves at its size (dims, leans in with a tongue of flame, flares; gutters out to smoke)
  candle wisp     doesn't fight; dies like the ash wisp in its candle colours
  deacon          lifts his lantern-staff and drives it straight down on you (rigid things stay upright, owner rule)
  mender          pulls a hand back and shoves you with an open palm
  summoner        shoves his ember at you like the ashcaller; the three cultist deaths
  Ashen Acolyte   swings his censer on its chain like the chanter; the three cultist deaths
  Old Gnawbone    his squeal (rats burrow out at 2/3 and 1/3 health) as a drawn screech: rears up, jaws wide, sound
                  lines, held; and the wall hole those rats come out of: dirt cracks, sprays, a rat claws out and drops

Run:  python3 tools/gap_anims_draft.py  ->  art/drafts/gap-anims-draft1.json and .png (review page: tools/gap_review_page.py)
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mob_attack_draft import grid_to_px, line, over, shift, frame, smear, ROOT, MOUTH_RED, rats, load_sprites
from family_anims_draft import (reoutline, stamp, put, outlined, recolour, clean, censer, chain, ember, arm, tilt,
                                cultist_death, cultist_death_wind, cultist_death_burn, wisp_set)
from cast_poses_draft import load, SUMMON_FIX, MENDER_FIX, ACO_FIX

# ---------- wisps ----------
def gwisp_set(S):
    W = S['GWISP_SPR'][0]; pal = dict(S['GWISP_PAL']); pal['S'] = '#8a8690'
    ready = grid_to_px(W); flame = {p: c for p, c in ready.items() if c != 's'}; tail = {p: c for p, c in ready.items() if c == 's'}
    dim = recolour(flame, {'W': 'Y'})
    lean = reoutline({(x + round((15 - y) * 0.25), y): c for (x, y), c in flame.items()})
    tongue = outlined({(14, 9): 'y', (15, 9): 'y', (14, 10): 'Y', (15, 10): 'Y', (16, 10): 'y', (14, 11): 'y', (17, 10): 'y'})
    lean = put(lean, tongue)
    core = {p for p, c in flame.items() if c != 'k'}; grow = {}
    for (x, y) in core:
        for n in ((x + 1, y), (x - 1, y), (x, y - 1), (x, y - 2)):
            if n not in core: grow[n] = 'y'
    flare = outlined(over(grow, recolour({p: flame[p] for p in core}, {'y': 'Y', 'Y': 'W'})))
    bite = [frame(ready, pal, 500, 'Ready (as today)'),
            frame(shift(over(dim, tail), -1, 0), pal, 170, 'Draws back and dims (the tell)'),
            frame(shift(over(lean, tail), 2, 0), pal, 60, 'Leans in, a tongue of flame reaching for you'),
            frame(shift(over(flare, tail), 3, 0), pal, 150, 'Flares up on you, white-hot (held)'),
            frame(shift(ready, 1, 0), pal, 120, 'Back')]
    def g(rows, ox, base=15):
        return grid_to_px(rows, ox, base - len(rows) + 1)
    f1 = g(["....k....", "...kyk...", "..kyYyk..", ".kyYWYyk.", "kyYWWWYyk", "kyYWWWYyk", ".kyYWYyk.", "..kyyyk..", "...kkk..."], 2)
    f2 = g(["..k..", ".kyk.", "kyYyk", "kYWYk", ".kyk.", "..k.."], 4)
    f3 = g([".k.", "kyk", ".k."], 5)
    s1 = over(g([".k."], 5), {(6, 11): 'S', (7, 9): 's', (6, 7): 'S'})
    s2 = {(7, 7): 's', (6, 5): 'S', (7, 3): 's'}
    death = [frame(ready, pal, 300, 'Hit (alive)'),
             frame(over(f1, tail), pal, 110, 'Death: gutters smaller'),
             frame(f2, pal, 90, 'Smaller, the tail gone'),
             frame(f3, pal, 90, 'Just an ember'),
             frame(s1, pal, 120, 'Goes out: a thread of smoke'),
             frame(s2, pal, 150, 'Smoke drifts up, gone')]
    return bite, death

def cwisp_death(S):
    from family_anims_draft import load as fload
    F = fload(); _, death = wisp_set(F); S = F
    cpal = dict(S['WISP_PAL']); cpal.update({'k': '#4a3a10', 'y': '#ffd070', 'Y': '#fff0b0', 's': '#a89a70', 'S': '#c8bc90'})
    out = []
    for f in death:
        f = dict(f); f['pal'] = cpal; out.append(f)
    out[1]['label'] = 'Death: the candle flame gutters'
    return out

# ---------- deacon: lantern-staff driven straight down ----------
def deacon_set(S):
    rows = S['REDO_SPR']['deacon']; pal = dict(S['REDO_PAL']['deacon']); pal.update({'u': '#8a7f70', 'U': '#6e6458'})
    ready = grid_to_px(rows); h = len(rows)
    staff = {p: c for p, c in ready.items() if p[0] >= 12 and p[1] <= 13 and c in 'kLloOs' and not (p[0] <= 13 and c == 'k' and p[1] > 8)}
    body = {p: c for p, c in ready.items() if p not in staff}
    def held(dx, dy, hand_to):
        s = {(x + dx, y + dy): c for (x, y), c in staff.items()}
        return reoutline(put(over(body, s), arm((10, 10), hand_to)))
    hand = min((p for p, c in staff.items() if c == 's'), default=(13, 11))
    up = held(-1, -4, (hand[0] - 1, hand[1] - 4))
    down = held(3, 4, (hand[0] + 3, hand[1] + 4))
    dust = {(16, h - 1): 'u', (19, h - 2): 'U', (15, h - 2): 'U', (20, h - 1): 'u'}
    atk = [frame(ready, pal, 500, 'Ready (lantern-staff held, as today)'),
           frame(shift(up, -1, 0), pal, 220, 'Lifts the lantern-staff high, straight up (the tell)'),
           frame(shift(held(1, 0, (hand[0] + 1, hand[1])), 1, 0), pal, 60, 'Brings it down, still upright'),
           frame(over(shift(down, 1, 0), shift(dust, 1, 0)), pal, 150, 'Drives it straight down on you: dust (held)'),
           frame(shift(ready, 1, 0), pal, 130, 'Back')]
    return atk

# ---------- mender: open-palm shove ----------
def mender_atk(S):
    a = clean(S['REDO_SPR']['mender'], MENDER_FIX); pal = dict(S['REDO_PAL']['mender']); body = grid_to_px(a)
    rest = grid_to_px(S['REDO_SPR']['mender'])
    back = put(body, arm((10, 9), (10, 11)))
    palm = {(15, 8): 's', (15, 9): 's', (15, 10): 's', (16, 9): 's'}
    shove = put(body, outlined(over({p: 'a' for p in line((10, 9), (14, 9))}, palm)))
    return [frame(rest, pal, 500, 'Ready (as today)'),
            frame(shift(back, -1, 0), pal, 180, 'Pulls a hand back to the chest (the tell)'),
            frame(shift(shove, 1, 0), pal, 60, 'Shoves forward, palm open'),
            frame(shift(shove, 2, 0), pal, 150, 'The palm lands on you (held)'),
            frame(shift(rest, 1, 0), pal, 120, 'Back')]

# ---------- summoner and Acolyte: cultist moves ----------
def summoner_set(S):
    a = clean(S['REDO_SPR']['summoner'], SUMMON_FIX); pal = dict(S['REDO_PAL']['summoner']); body = grid_to_px(a)
    rest = put(put(body, arm((10, 9), (12, 8))), stamp(ember(), (12, 7)))
    pull = put(put(body, arm((10, 9), (10, 10))), stamp(ember(), (11, 9)))
    shove = put(put(body, arm((10, 9), (15, 9))), stamp(ember(True), (16, 8)))
    sparks = {(19, 6): 'G', (20, 8): 'g', (19, 10): 'G', (21, 7): 'g'}
    atk = [frame(rest, pal, 500, 'Ready (ember held up, as today)'),
           frame(shift(pull, -1, 0), pal, 180, 'Pulls the ember in to his chest (the tell)'),
           frame(shift(shove, 1, 0), pal, 60, 'Shoves it at you, it flares'),
           frame(over(shift(shove, 2, 0), shift(sparks, 2, 0)), pal, 140, 'Sparks spit off it into you (held)'),
           frame(shift(rest, 1, 0), pal, 120, 'Back')]
    rows = S['REDO_SPR']['summoner']; h = len(rows); prow = dict(pal)
    smoke = {(13, h - 2): 'O', (14, h - 4): 'z', (13, h - 6): 'z'}
    deaths = [cultist_death(rows, prow, ({(13, h - 2): 'g', (14, h - 2): 'G'}, smoke), 'the ember drops and goes out'),
              cultist_death_wind(rows, prow, smoke), cultist_death_burn(rows, prow, {})]
    return atk, deaths

def acolyte_set(S):
    a = clean(S['REDO_SPR']['acolyte'], ACO_FIX); pal = dict(S['REDO_PAL']['acolyte']); body = grid_to_px(a); h = len(a)
    cs = censer()
    def swing(hand, cen, extra=None):
        b = put(put(put(body, arm((11, 10), hand)), chain(hand, (cen[0], cen[1] - 1))), stamp(cs, cen))
        return over(b, extra) if extra else b
    rest = swing((13, 11), (15, 14))
    up = swing((13, 7), (11, 0))
    trail = {p: 'z' for p in smear((13, 8), 9, 9, -100, 50, 'zz', 30) if p not in body}
    down = over(trail, swing((14, 9), (20, 5)))
    hit = swing((15, 11), (20, 16), {(23, 14): 'G', (18, 14): 'g', (22, 18): 'G', (24, 16): 'g'})
    atk = [frame(rest, pal, 500, 'Ready (censer hanging, as today)'),
           frame(shift(up, -1, 0), pal, 220, 'Swings the censer up over his head (the tell)'),
           frame(shift(down, 1, 0), pal, 60, 'Brings it round on its chain'),
           frame(shift(hit, 2, 0), pal, 150, 'It smashes into you, embers jump (held)'),
           frame(shift(rest, 1, 0), pal, 130, 'Back')]
    rows = S['REDO_SPR']['acolyte']; ground = stamp(cs, (16, h - 3))
    deaths = [cultist_death(rows, pal, (ground, ground), 'the censer drops'),
              cultist_death_wind(rows, pal, ground), cultist_death_burn(rows, pal, ground)]
    return atk, deaths

# ---------- Old Gnawbone: the screech, and a rat clawing out of the wall ----------
def gnaw_screech(S2):
    gb = rats(S2)['gnaw_bite']; reared = gb[1]  # his own rear-back: head thrown up, jaws wide on the big teeth
    ready = gb[0]
    px = {(x, y): c for x, y, c in reared['px']}
    fy = max(y for _, y in px) - 3  # feet stay down; the front half lifts high (rearing up on his back legs)
    px = reoutline(tilt(px, [(22, 1), (27, 2), (31, 3), (35, 4)], ymax=fy))
    hx = max(x for x, _ in px); top = min(y for _, y in px)
    lines = lambda k: {p: 'Y' for p in line((hx + 2 + k, top + 1), (hx + 4 + k, top - 1))} | {p: 'Y' for p in line((hx + 3 + k, top + 4), (hx + 6 + k, top + 4))} | {p: 'Y' for p in line((hx + 2 + k, top + 7), (hx + 4 + k, top + 9))}
    shake = lambda d: {(x + d, y): c for (x, y), c in px.items()}
    def fr(p, ms, lab): return {'px': [[x, y, c] for (x, y), c in p.items()], 'pal': reared['pal'], 'ms': ms, 'label': lab, 'extra': []}
    return [dict(ready, label='Fighting (as today)', ms=500),
            fr(px, 160, 'Squeal (at 2/3 and 1/3 health): rears up, jaws wide'),
            fr(over(shake(1), lines(1)), 140, 'Screeches: sound lines from his jaws, shaking'),
            fr(over(shake(0), lines(2)), 140, ''),
            fr(over(shake(1), lines(3)), 140, 'Still screeching (the rats are coming)'),
            fr(over(shake(0), lines(4)), 160, ''),
            dict(ready, label='Back to the fight', ms=300)]

def wall_hole(S2):
    """A wall hole at the foot of the tunnel's dirt wall: it cracks, dirt sprays, a tunnel rat pokes out, climbs out onto
    the floor and runs at you."""
    W = {'k': '#0e0b09', 'w': '#57442f', 'v': '#4b3b2a', 'x': '#3e3024', 'f': '#3a3127', 'F': '#332b22', 'h': '#140f0b',
         'd': '#6e5a40', 'D': '#8a7356'}
    scene = {}
    for y in range(0, 24):
        for x in range(0, 26):
            scene[(x, y)] = ('w' if (x * 7 + y * 3) % 11 > 2 else 'v') if y < 12 else ('x' if y == 12 else ('f' if (x + y) % 5 else 'F'))
    hole = {(x, y) for x in range(4, 15) for y in range(5, 13) if ((x - 9.5) / 4.5) ** 2 + ((y - 9.5) / 3.5) ** 2 < 1}
    base = dict(scene); base.update({p: 'h' for p in hole})
    rows = S2['SPR']['rat']; rpal = dict(S2['PAL']); rpal.update(S2['RAT_PAL']['trat']); rpal['r'] = MOUTH_RED
    rat = grid_to_px(rows); rw = max(x for x, _ in rat) + 1; rh = max(y for _, y in rat) + 1
    pal = dict(rpal); pal.update(W)
    def withrat(dx, feet):
        b = dict(base); dy = feet - (rh - 1)
        for (x, y), c in rat.items():
            q = (x + dx, y + dy)
            if q in hole or q[1] >= 12: b[q] = c  # seen only through the hole or once it's out on the floor
        return b
    crack = dict(base); crack.update({(3, 7): 'k', (2, 6): 'k', (15, 8): 'k', (16, 7): 'k', (9, 4): 'k', (10, 3): 'k', (14, 5): 'k'})
    spray = lambda k: {(14 + k, 13 + k // 2): 'd', (15 + k, 12): 'D', (13 + k, 14): 'd', (5 - k, 13): 'd', (4 - k, 12): 'D'}
    return [frame(base, pal, 400, 'A wall hole in the den (as today)'),
            frame(crack, pal, 140, 'Squeal: the dirt round the hole cracks'),
            frame(over(crack, spray(0)), pal, 120, 'Dirt sprays out'),
            frame(over(withrat(14 - rw, 11), spray(2)), pal, 150, 'A rat\'s snout pokes out of the dark'),
            frame(over(withrat(18 - rw, 14), spray(3)), pal, 130, 'It scrabbles out onto the floor'),
            frame(withrat(24 - rw, 19), pal, 160, 'Out, and running at you'),
            frame(base, pal, 200, '')]

def build():
    S = load(); S2 = load_sprites(); d = {}
    d['gwisp_bite'], d['gwisp_death'] = gwisp_set(S)
    d['cwisp_death'] = cwisp_death(S)
    d['deacon_attack'] = deacon_set(S)
    d['mender_attack'] = mender_atk(S)
    d['summoner_attack'], sd = summoner_set(S)
    for i, x in enumerate(sd): d['summoner_death' + ('' if i == 0 else '_%d' % (i + 1))] = x
    d['acolyte_attack'], ad = acolyte_set(S)
    for i, x in enumerate(ad): d['acolyte_death' + ('' if i == 0 else '_%d' % (i + 1))] = x
    d['gnaw_screech'] = gnaw_screech(S2)
    d['gnaw_hole'] = wall_hole(S2)
    return d, S

if __name__ == '__main__':
    from family_anims_draft import sheet, player
    d, S = build(); d['player'] = player(S)
    out = os.path.join(ROOT, 'art/drafts/gap-anims-draft1.json')
    json.dump(d, open(out, 'w'), separators=(',', ':'))
    sheet(d, out.replace('.json', '.png'))
    print('wrote', out)

# ---------- into the game (owner OK'd draft 1, Nov 28: "let's go with A") ----------
# Read by tools/mob_attack_draft.py --game (MOB_POSES: attacks and deaths) and tools/cast_poses_draft.py --game
# (MOB_CASTS: Old Gnawbone's screech, played when he squeals). The wall hole is drawn live in js/anim.js (holeBurst).
GAP_ATK = {  # image: (attack key, base rows)
    'gwisp': ('gwisp_bite', lambda S: S['GWISP_SPR'][0]),
    'deacon': ('deacon_attack', lambda S: S['REDO_SPR']['deacon']),
    'mender': ('mender_attack', lambda S: S['REDO_SPR']['mender']),
    'summoner': ('summoner_attack', lambda S: S['REDO_SPR']['summoner']),
    'acolyte': ('acolyte_attack', lambda S: S['REDO_SPR']['acolyte']),
}
GAP_DEATH = {  # image: (death key, base rows); _2 and _3 are extra deaths picked at random
    'gwisp': ('gwisp_death', lambda S: S['GWISP_SPR'][0]),
    'cwisp': ('cwisp_death', lambda S: S['WISP_SPR'][0]),
    'summoner': ('summoner_death', lambda S: S['REDO_SPR']['summoner']),
    'acolyte': ('acolyte_death', lambda S: S['REDO_SPR']['acolyte']),
}

def game_data(to_pose):
    from family_anims_draft import load as fload
    d, S = build(); S = dict(S); F = fload(); S.setdefault('WISP_SPR', F['WISP_SPR'])
    poses, deaths = {}, {}
    for name, (key, base) in GAP_ATK.items():
        rows = base(S); w, h = len(rows[0]), len(rows); frs = d[key][1:]
        poses[name] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal']}
        for slot, f in zip(['wind', 'smear', 'hit', 'rec'], frs): poses[name][slot] = to_pose(f, w, h)
    for name, (key, base) in GAP_DEATH.items():
        rows = base(S); w, h = len(rows[0]), len(rows)
        for suf in ('', '_2', '_3'):
            if key + suf not in d: continue
            frs = d[key + suf][1:]
            deaths[name + suf] = {'t': [round(f['ms'] / 1000, 3) for f in frs], 'pal': frs[0]['pal'], 'f': [to_pose(f, w, h) for f in frs]}
    return poses, deaths

def screech_cast(to_pose):
    """Old Gnawbone's screech as an instant cast pose (MOB_CASTS.gnaw.squeal)."""
    S2 = load_sprites(); frs = gnaw_screech(S2)[1:-1]; rows = S2['SPR']['gnaw']
    return {'pal': frs[0]['pal'], 'h': [], 'r': [to_pose(f, len(rows[0]), len(rows)) for f in frs], 'rt': [round(f['ms'] / 1000, 3) for f in frs]}

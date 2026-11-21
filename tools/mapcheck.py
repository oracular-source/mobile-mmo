#!/usr/bin/env python3
"""Map checker: validates a text map (js/data/maps/*.js) against the area rules and draws it.

Usage:  python3 tools/mapcheck.py js/data/maps/*.js [--out out/] [--phone X,Y]
Prints errors (must fix) and warnings (look at them), then writes <name>.png (whole map)
and <name>-phone.png (one phone screen at game scale, from the start exit unless --phone X,Y). Exit code 1 if there are errors.
Format and rules: docs/map-format.md. Needs Python 3 and Pillow.
"""
import os, re, sys
from collections import deque
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------- reading ----------
def table(src, name):
    m = re.search(r'const ' + name + r'\s*=\s*`(.*?)`', src, re.S)
    rows = [l.split() for l in m.group(1).strip().splitlines() if l.strip()]
    head, out = rows[0], {}
    for r in rows[1:]:
        out[r[0]] = dict(zip(head, r))
    return out

def load_tables():
    src = open(os.path.join(ROOT, 'js/data/tiles.js')).read()
    tiles = table(src, 'TILESET')
    for t in tiles.values():
        t['walk'] = t['walk'] == '1'
    # tags are every word after the colour
    for line in re.search(r'const TILESET\s*=\s*`(.*?)`', src, re.S).group(1).strip().splitlines()[1:]:
        p = line.split()
        if p: tiles[p[0]]['tags'] = set(p[4:])
    objs = table(src, 'OBJECTS')
    for o in objs.values():
        for k in ('w', 'h', 'blocks', 'clear', 'light'): o[k] = int(o[k])
    return tiles, objs

def load_map(path):
    src = open(path).read()
    m = {'id': re.search(r'MAPS\.(\w+)\s*=', src).group(1)}
    for key in ('name', 'tint', 'start', 'rules'):
        f = re.search(key + r"\s*:\s*'([^']*)'", src)
        m[key] = f.group(1) if f else ''
    z = re.search(r'zone\s*:\s*\[(\-?\d+)\s*,\s*(\-?\d+)\]', src)
    m['zone'] = (int(z.group(1)), int(z.group(2))) if z else (0, 0)
    body = re.search(r'tiles\s*:\s*\[(.*?)\]', src, re.S).group(1)
    m['tiles'] = re.findall(r"'([^']*)'", body)
    things = re.search(r'things\s*:\s*`(.*?)`', src, re.S).group(1)
    m['things'] = [l.split('#')[0].split() for l in things.splitlines()]
    m['things'] = [t for t in m['things'] if t]
    m['labels'] = [l.strip().split(None, 3) for l in things.splitlines() if l.strip().startswith('label ')]
    return m

def lv_range(s):
    a = [int(v) for v in s.split('-')]
    return a[0], a[-1]

# ---------- checking ----------
def check(m, tiles, objs):
    E, W = [], []
    g = m['tiles']; H = len(g); Wd = len(g[0]) if g else 0
    m['W'], m['H'] = Wd, H
    for y, row in enumerate(g):
        if len(row) != Wd: E.append(f'row {y} is {len(row)} wide, expected {Wd}')
        for x, c in enumerate(row):
            if c not in tiles: E.append(f'unknown tile {c!r} at {x},{y}')
    if E: return E, W, None
    T = lambda x, y: tiles[g[y][x]]
    inb = lambda x, y: 0 <= x < Wd and 0 <= y < H

    # objects and their footprints
    foot = {}   # (x,y) -> object index
    placed, markers, fogs, critters = [], [], [], []
    for t in m['things']:
        k = t[0]
        if k == 'obj':
            kind, x, y = t[1], int(t[2]), int(t[3])
            if kind not in objs: E.append(f'unknown object {kind}'); continue
            o = dict(objs[kind], kind=kind, x=x, y=y)
            placed.append(o)
        elif k == 'spawn': markers.append(dict(k=k, type=t[1], lv=lv_range(t[2]), x=int(t[3]), y=int(t[4])))
        elif k == 'named': markers.append(dict(k=k, type=t[1], lv=lv_range(t[2]), x=int(t[3]), y=int(t[4]), extra=t[5:]))
        elif k == 'rare': markers.append(dict(k=k, type=t[1], x=int(t[2]), y=int(t[3])))
        elif k == 'chest': markers.append(dict(k=k, type='chest', x=int(t[1]), y=int(t[2])))
        elif k == 'exit': markers.append(dict(k=k, type=t[1], x=int(t[2]), y=int(t[3]), extra=t[4:]))
        elif k == 'fog': fogs.append(tuple(int(v) for v in t[1:5]))
        elif k == 'label': pass
        elif k == 'critter': critters.append(dict(kind=t[1], x=float(t[2]), y=float(t[3])))
        else: E.append(f'unknown line: {" ".join(t)}')
    # critters (v0.49): known kinds, on the map; frogs on open ground by water, moths near a light
    for c in critters:
        cx, cy = int(c['x']), int(c['y'])
        if c['kind'] not in ('crow', 'frog', 'moth', 'owl', 'bat', 'firefly', 'rabbit'): E.append(f"unknown critter {c['kind']}"); continue
        if not (0 <= cx < Wd and 0 <= cy < H): E.append(f"critter {c['kind']} at {c['x']},{c['y']} is off the map"); continue
        if c['kind'] == 'frog':
            if not tiles[g[cy][cx]]['walk']: E.append(f"frog at {c['x']},{c['y']} sits in scenery or water")
            if not any(0 <= cy+dy < H and 0 <= cx+dx < Wd and g[cy+dy][cx+dx] == '~' for dy in range(-2, 3) for dx in range(-2, 3)): W.append(f"frog at {c['x']},{c['y']} has no water near it")
        if c['kind'] == 'moth' and not any(o.get('light', 0) and abs(o['x'] + o['w']/2 - c['x']) < 3 and abs(o['y'] - c['y']) < 3 for o in placed): W.append(f"moth at {c['x']},{c['y']} has no light near it")
    for i, o in enumerate(placed):
        name = f"{o['kind']} at {o['x']},{o['y']}"
        for yy in range(o['y'], o['y'] + o['h']):
            for xx in range(o['x'], o['x'] + o['w']):
                if not inb(xx, yy): E.append(f'{name} goes off the map'); continue
                if o['on'] not in T(xx, yy)['tags']: E.append(f'{name}: tile {xx},{yy} is {T(xx,yy)["name"]}, needs {o["on"]}')
                if (xx, yy) in foot: E.append(f'{name} overlaps {placed[foot[(xx, yy)]]["kind"]} at {xx},{yy}')
                foot[(xx, yy)] = i
    solid = {p for p, i in foot.items() if placed[i]['blocks']}
    walk = lambda x, y: inb(x, y) and T(x, y)['walk'] and (x, y) not in solid

    def door(o):
        return (o['x'] + o['w'] // 2, o['y'] + o['h']) if o['door'] == 'S' else None
    for i, o in enumerate(placed):
        name = f"{o['kind']} at {o['x']},{o['y']}"
        c = o['clear']
        for yy in range(o['y'] - c, o['y'] + o['h'] + c):
            for xx in range(o['x'] - c, o['x'] + o['w'] + c):
                if not inb(xx, yy) or (xx, yy) in foot and foot[(xx, yy)] == i: continue
                if (xx, yy) in foot and placed[foot[(xx, yy)]]['blocks']:
                    E.append(f'{name}: {placed[foot[(xx,yy)]]["kind"]} too close at {xx},{yy} (keep {c} tile clear)'); continue
                tg = T(xx, yy)['tags']
                if c and not T(xx, yy)['walk'] and 'rubble' not in tg:
                    E.append(f'{name}: {T(xx,yy)["name"]} at {xx},{yy} is inside its clear ring')
        d = door(o)
        if d and not walk(*d): E.append(f'{name}: door at {d[0]},{d[1]} opens onto something solid')
    # graves never touch buildings (no gravestones on a bell tower)
    for y in range(H):
        for x in range(Wd):
            tg = T(x, y)['tags']
            if 'grave' in tg:
                near = any((x + dx, y + dy) in solid for dx in (-1, 0, 1) for dy in (-1, 0, 1))
                if near: E.append(f'grave at {x},{y} touches a building')
                if T(x, y)['name'] == 'grave' and not any(inb(x + d, y) and 'grave' in T(x + d, y)['tags'] for d in (-2, -1, 1, 2)):
                    W.append(f'lonely grave at {x},{y} (graves sit in rows)')
            if 'rubble' in tg and T(x, y)['name'] == 'rubble':
                src = any((x + dx, y + dy) in solid or (inb(x + dx, y + dy) and T(x + dx, y + dy)['tags'] & {'border', 'wall'})
                          for dx in range(-2, 3) for dy in range(-2, 3))
                if not src: W.append(f'rubble at {x},{y} has nothing nearby it could have fallen from')
    for mk in markers:
        if not inb(mk['x'], mk['y']): E.append(f"{mk['k']} {mk['type']} off the map"); continue
        if not walk(mk['x'], mk['y']):
            what = placed[foot[(mk['x'], mk['y'])]]['kind'] if (mk['x'], mk['y']) in solid else T(mk['x'], mk['y'])['name']
            E.append(f"{mk['k']} {mk['type']} at {mk['x']},{mk['y']} stands inside {what}")
    # dead areas are dead all the way inside their border
    if 'dead-inside' in m['rules']:
        out = set(); q = deque()
        for x in range(Wd):
            for y in (0, H - 1): q.append((x, y))
        for y in range(H):
            for x in (0, Wd - 1): q.append((x, y))
        while q:
            p = q.popleft()
            if p in out or not inb(*p) or 'border' in T(*p)['tags']: continue
            out.add(p)
            q.extend([(p[0] + 1, p[1]), (p[0] - 1, p[1]), (p[0], p[1] + 1), (p[0], p[1] - 1)])
        inside = {(x, y) for y in range(H) for x in range(Wd) if (x, y) not in out and 'border' not in T(x, y)['tags']}
        bad = [p for p in inside if 'living' in T(*p)['tags']]
        for p in sorted(bad)[:12]: E.append(f'living {T(*p)["name"]} inside the border at {p[0]},{p[1]}')
        if not inside: W.append('rule dead-inside is on but the border encloses nothing')
        m['inside'] = inside
    # reachability from the start exit
    start = next((mk for mk in markers if mk['k'] == 'exit' and mk['type'] == m['start']), None)
    dist = {}
    if not start: E.append(f"start exit '{m['start']}' not found")
    else:
        q = deque([(start['x'], start['y'])]); dist[q[0]] = 0
        while q:
            x, y = q.popleft()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if walk(nx, ny) and (nx, ny) not in dist:
                    dist[(nx, ny)] = dist[(x, y)] + 1; q.append((nx, ny))
        for mk in markers:
            if (mk['x'], mk['y']) not in dist: E.append(f"can't reach {mk['k']} {mk['type']} at {mk['x']},{mk['y']} from the start")
        for o in placed:
            d = door(o)
            if d and d not in dist: E.append(f"can't reach the {o['kind']} door at {d[0]},{d[1]}")
        pockets = sum(1 for y in range(H) for x in range(Wd) if walk(x, y) and (x, y) not in dist)
        if pockets: W.append(f'{pockets} walkable tiles cannot be reached (sealed pockets)')
        # dead ends: a tile with one way out, not at an exit or a reward
        ends = []
        mpos = {(mk['x'], mk['y']) for mk in markers}
        for (x, y) in dist:
            n = sum(walk(nx, ny) for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
            edge = x in (0, Wd - 1) or y in (0, H - 1)
            if n == 1 and not edge and (x, y) not in mpos: ends.append((x, y))
        for p in ends[:10]: W.append(f'dead end at {p[0]},{p[1]}')
        # a wandering named walks a loop of waypoints: route=x,y;x,y;... (every point on open ground, reachable)
        for mk in markers:
            if mk['k'] != 'named': continue
            rt = next((e[6:] for e in mk.get('extra', []) if e.startswith('route=')), None)
            if not rt: continue
            mk['route'] = [tuple(int(v) for v in pt.split(',')) for pt in rt.split(';')]
            for (x, y) in mk['route']:
                if not walk(x, y): E.append(f"{mk['type']} route point {x},{y} is not open ground")
                elif (x, y) not in dist: E.append(f"{mk['type']} route point {x},{y} can't be reached")
        # difficulty should grow with distance from the start
        sp = sorted([mk for mk in markers if mk['k'] in ('spawn', 'named') and (mk['x'], mk['y']) in dist], key=lambda mk: dist[(mk['x'], mk['y'])])
        for i, a in enumerate(sp):
            for b in sp[i + 1:]:
                if a['lv'][0] > b['lv'][1] and dist[(b['x'], b['y'])] - dist[(a['x'], a['y'])] > 12:
                    W.append(f"level {a['lv'][0]} {a['type']} at {a['x']},{a['y']} is much closer to the start than level {b['lv'][1]} {b['type']} at {b['x']},{b['y']}")
        # breadcrumbs: the way in and every stairway has a light near it
        lights = [o for o in placed if o['light']]
        for mk in markers:
            if mk['k'] == 'exit' and (mk['type'] == m['start'] or 'lit' in mk.get('extra', [])):
                if not any(abs(o['x'] - mk['x']) + abs(o['y'] - mk['y']) <= o['light'] + 3 for o in lights):
                    W.append(f"exit {mk['type']} has no light near it (torches mark the way in)")
    m.update(placed=placed, markers=markers, fogs=fogs, foot=foot, solid=solid, dist=dist)
    return E, W, m

# ---------- drawing ----------
def hexc(h, a=255): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
def shade(c, f): return tuple(max(0, min(255, int(v * f))) for v in c[:3]) + (c[3],)
def font(sz, bold=False):
    for p in ('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf' if bold else '/usr/share/fonts/opentype/inter/Inter-Regular.otf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()

SPAWN_COL = {'corpse': (190, 220, 170, 255), 'rat': (220, 170, 130, 255), 'crypt_rat': (220, 170, 130, 255), 'skeleton': (240, 234, 216, 255),
             'tunnel_rat': (220, 170, 130, 255), 'big_rat': (200, 140, 100, 255), 'beetle': (130, 170, 220, 255),
             'blight_wolf': (170, 176, 184, 255), 'thornback_boar': (176, 120, 80, 255),
             'cult_zealot': (200, 90, 70, 255), 'cult_ashcaller': (170, 168, 176, 255), 'cult_chanter': (170, 110, 210, 255), 'ash_wisp': (255, 230, 160, 255)}
TINTS = {'moonlit': (60, 110, 120, 70), 'crypt': (30, 50, 120, 55), 'dusk': (120, 70, 30, 40), 'earth': (40, 30, 20, 50), 'wood': (40, 70, 60, 60), 'chapel': (50, 60, 100, 55), '': (0, 0, 0, 0)}
OBJ_COL = {'bell_tower': '#5d5668', 'crypt_mouth': '#4a4560', 'shack': '#5a4030', 'mausoleum': '#6b6578', 'dead_oak': '#4a3e32',
           'statue': '#9a94a2', 'torch': '#ff9a3c', 'lantern': '#ffb860', 'candle': '#ffd890', 'cart': '#6a5034',
           'throne': '#3a3446', 'brazier': '#ff9a3c', 'campfire': '#ff9a3c', 'signpost': '#8a6a4a', 'sinkhole': '#120d0a',
           'burrow': '#1a120c', 'light_shaft': '#cfd8dc', 'gnaw_pile': '#b9b0a0',
           'giant_tree': '#b8b2a6', 'tunnel_mouth': '#4a4a48', 'lean_to': '#6a5034', 'firepit': '#3a3430',
           'drying_rack': '#7a5a3a', 'trap': '#8a8a90', 'wolf_den': '#3e3c3a', 'fallen_log': '#5a4430', 'stump': '#6a5038',
           'chapel': '#6a6672', 'fallen_bell': '#a08a50', 'ash_circle': '#2a2624', 'shrine': '#7a7480', 'censer': '#ffb060',
           'banner': '#3a1418', 'bedroll': '#6a5a48', 'wagon': '#8a7254', 'fishing_rod': '#7a5a42', 'town_gate': '#5a4030'}

def draw_tiles(d, m, tiles, s, ox=0, oy=0, x0=0, y0=0, x1=None, y1=None):
    g = m['tiles']; x1 = x1 or m['W']; y1 = y1 or m['H']
    for y in range(y0, y1):
        for x in range(x0, x1):
            ground_pass(d, m, tiles, s, x, y, ox + (x - x0) * s, oy + (y - y0) * s)
    for y in range(y0, y1):
        for x in range(x0, x1):
            scenery_pass(d, m, tiles, s, x, y, ox + (x - x0) * s, oy + (y - y0) * s)

def ground_pass(d, m, tiles, s, x, y, px, py):
    g = m['tiles']; c = g[y][x]; t = tiles[c]; col = hexc(t['color'])
    base = col
    if 'tree' in t['tags'] or t['name'] in ('boulder', 'bush', 'dead_bush', 'grave', 'dug_grave', 'rubble', 'bones', 'coffin', 'dirt_pile'):
        # draw the ground under scenery as the nearest open ground around it
        base = next((hexc(tiles[g[yy][xx]]['color']) for xx, yy in ((x, y + 1), (x - 1, y), (x + 1, y), (x, y - 1))
                     if 0 <= xx < m['W'] and 0 <= yy < m['H'] and tiles[g[yy][xx]]['walk']), hexc('#3b3a2c'))
    d.rectangle([px, py, px + s - 1, py + s - 1], fill=base)
    h = (x * 7 + y * 13) % 5
    if t['name'] in ('grass', 'dead_grass') and h == 0:
        d.rectangle([px + s // 3, py + s // 2, px + s // 3, py + s // 2 + max(1, s // 6)], fill=shade(col, 1.35))
    if t['name'] in ('road', 'dirt_path') and h < 2:
        d.rectangle([px + h * 2 + 1, py + s // 2, px + h * 2 + 1 + s // 8, py + s // 2 + s // 8], fill=shade(col, 0.8))
    if t['name'] == 'water' and (x + y) % 3 == 0:
        d.line([px + s // 4, py + s // 2, px + s * 3 // 4, py + s // 2], fill=hexc('#4c7a8c'))
    if t['name'] == 'needles' and h < 2:
        d.line([px + h * 3 + 2, py + s * 0.6, px + h * 3 + 2 + s // 5, py + s * 0.5], fill=hexc('#5a5236'))
    if t['name'] == 'moss' and h < 3:
        d.ellipse([px + s * 0.2 + h, py + s * 0.3, px + s * 0.55 + h, py + s * 0.6], fill=hexc('#45602f'))
    if t['name'] == 'blight' and h < 2:
        d.line([px + s * 0.2, py + s * 0.3 + h, px + s * 0.7, py + s * 0.6 + h], fill=hexc('#6e6a62'))
    if t['name'] == 'fern':
        for a in (-0.25, 0, 0.25): d.line([px + s / 2, py + s * 0.85, px + s * (0.5 + a), py + s * 0.25], fill=hexc('#4e7a3c'))
    if t['name'] == 'marsh' and h < 2:
        d.line([px + s // 2, py + s // 4, px + s // 2, py + s * 3 // 4], fill=hexc('#4f6b4a'))
    if t['name'] == 'fence_grate':
        for a in (0.2, 0.5, 0.8): d.line([px + s * a, py, px + s * a, py + s - 1], fill=hexc('#6c6880'))
    if t['name'] == 'floor' and (x + y) % 2 == 0:
        d.rectangle([px, py, px + s - 1, py + s - 1], fill=shade(col, 0.9))
    if t['name'] == 'ash' and h < 2:
        d.ellipse([px + s * 0.3 + h * 2, py + s * 0.4, px + s * 0.45 + h * 2, py + s * 0.55], fill=hexc('#6a6460'))
    if t['name'] == 'gravel' and h < 3:
        for a, b in ((0.25, 0.3), (0.65, 0.6)): d.rectangle([px + s * a, py + s * b, px + s * a + max(1, s // 8), py + s * b + max(1, s // 8)], fill=hexc('#7a766c'))
    if t['name'] == 'flagstone':
        d.rectangle([px, py, px + s - 1, py + s - 1], outline=hexc('#3a3640'))
        if h == 0: d.line([px + s * 0.2, py + s * 0.3, px + s * 0.6, py + s * 0.7], fill=hexc('#3a3640'))
    if t['name'] == 'herbs':
        for a in (0.25, 0.5, 0.75): d.ellipse([px + s * a - s * 0.12, py + s * 0.35, px + s * a + s * 0.12, py + s * 0.65], fill=hexc('#5e7a40'))
    if t['name'] == 'stairs':
        for i in range(3): d.rectangle([px + 1, py + 2 + i * s // 3, px + s - 2, py + 2 + i * s // 3 + max(1, s // 8)], fill=hexc('#4a4560'))

def scenery_pass(d, m, tiles, s, x, y, px, py):
    g = m['tiles']; c = g[y][x]; t = tiles[c]; col = hexc(t['color'])
    nb = lambda dx, dy: 0 <= x + dx < m['W'] and 0 <= y + dy < m['H'] and 'border' in tiles[g[y + dy][x + dx]]['tags'] and tiles[g[y + dy][x + dx]]['name'] in ('iron_fence', 'fence_grate', 'gate')
    if t['name'] == 'tree':
        r = s * 0.62
        d.ellipse([px + s / 2 - r, py + s / 2 - r - s * 0.15, px + s / 2 + r, py + s / 2 + r - s * 0.15], fill=hexc('#0d1710'))
        r2 = r - max(1, s / 8)
        d.ellipse([px + s / 2 - r2, py + s / 2 - r2 - s * 0.15, px + s / 2 + r2, py + s / 2 + r2 - s * 0.15], fill=col)
        d.ellipse([px + s * 0.25, py + s * 0.05, px + s * 0.55, py + s * 0.35], fill=shade(col, 1.4))
    if t['name'] == 'fir':
        # tall dark fir: a stacked cone, taller than its tile
        d.ellipse([px + s * 0.15, py + s * 0.75, px + s * 0.85, py + s * 1.0], fill=(0, 0, 0, 90))
        for i, (top, bot, half) in enumerate(((-0.55, 0.15, 0.32), (-0.2, 0.5, 0.42), (0.15, 0.85, 0.5))):
            d.polygon([(px + s / 2, py + s * top), (px + s * (0.5 + half), py + s * bot), (px + s * (0.5 - half), py + s * bot)],
                      fill=shade(col, 1 + i * 0.12), outline=hexc('#0a120e'))
        d.line([px + s * 0.42, py + s * -0.3, px + s * 0.3, py + s * 0.45], fill=shade(col, 1.6))
    if t['name'] == 'boulder':
        d.ellipse([px + 1, py + s * 0.15, px + s - 2, py + s - 2], fill=col, outline=hexc('#1a1a18'))
        d.ellipse([px + s * 0.25, py + s * 0.25, px + s * 0.6, py + s * 0.5], fill=shade(col, 1.3))
        d.ellipse([px + s * 0.5, py + s * 0.55, px + s * 0.85, py + s * 0.85], fill=hexc('#45602f'))
    if t['name'] == 'dead_tree':
        # gnarled and bigger than its tile, like the living trees outside
        cx = px + s / 2; w = max(2, s // 5); dk = hexc('#1c1712'); lt = hexc('#6a5a48')
        d.ellipse([px + s * 0.1, py + s * 0.8, px + s * 0.9, py + s * 1.05], fill=(0, 0, 0, 90))
        br = [((cx, py + s * 0.95), (cx, py - s * 0.1)), ((cx, py + s * 0.5), (px - s * 0.25, py - s * 0.1)),
              ((cx, py + s * 0.35), (px + s * 1.25, py - s * 0.3)), ((cx, py + s * 0.1), (px + s * 0.2, py - s * 0.55)),
              ((px - s * 0.05, py + s * 0.15), (px - s * 0.35, py + s * 0.35))]
        for a, b in br: d.line([a, b], fill=dk, width=w + 2)
        for a, b in br: d.line([a, b], fill=col, width=w)
        d.line([cx - w / 2, py + s * 0.9, cx - w / 2, py + s * 0.1], fill=lt, width=1)
    if t['name'] in ('bush', 'dead_bush'):
        d.ellipse([px + 1, py + s * 0.25, px + s - 2, py + s - 2], fill=col, outline=shade(col, 0.5))
    if t['name'] == 'grave':
        d.rectangle([px + s * 0.25, py + s * 0.15, px + s * 0.75, py + s * 0.8], fill=hexc('#0b0a0f'))
        d.rectangle([px + s * 0.3, py + s * 0.2, px + s * 0.7, py + s * 0.75], fill=col)
        d.rectangle([px + s * 0.2, py + s * 0.8, px + s * 0.8, py + s * 0.95], fill=hexc('#3a2e24'))
    if t['name'] == 'dug_grave':
        d.rectangle([px + s * 0.2, py + s * 0.1, px + s * 0.8, py + s * 0.9], fill=col, outline=hexc('#5a4632'))
    if t['name'] == 'coffin':
        d.rectangle([px + s * 0.2, py + 1, px + s * 0.8, py + s - 2], fill=col, outline=hexc('#0b0a0f'))
    if t['name'] in ('rubble', 'bones'):
        for i, (a, b) in enumerate(((0.25, 0.6), (0.6, 0.35), (0.55, 0.75))):
            r = s * 0.14
            d.ellipse([px + s * a - r, py + s * b - r, px + s * a + r, py + s * b + r], fill=col)
    if t['name'] == 'iron_fence':
        rail = hexc('#55526a'); post = hexc('#7a7690'); q = max(1, s // 8)
        if nb(-1, 0) or nb(1, 0) or not (nb(0, -1) or nb(0, 1)):
            d.rectangle([px if nb(-1, 0) else px + s * 0.4, py + s * 0.45, px + s - 1 if nb(1, 0) else px + s * 0.6, py + s * 0.55], fill=rail)
        if nb(0, -1) or nb(0, 1):
            d.rectangle([px + s * 0.45, py if nb(0, -1) else py + s * 0.4, px + s * 0.55, py + s - 1 if nb(0, 1) else py + s * 0.6], fill=rail)
        d.rectangle([px + s * 0.5 - q, py + s * 0.15, px + s * 0.5 + q, py + s * 0.85], fill=post)
        d.rectangle([px + s * 0.5 - q, py + s * 0.1, px + s * 0.5 + q, py + s * 0.2], fill=hexc('#a8a4bc'))
    if t['name'] == 'gate':
        d.rectangle([px, py + s * 0.45, px + s - 1, py + s * 0.55], fill=hexc('#8a7650'))
    if t['name'] in ('earth_wall', 'rat_hole') and y + 1 < m['H'] and tiles[g[y + 1][x]]['walk']:
        d.rectangle([px, py + s * 0.35, px + s - 1, py + s - 1], fill=hexc('#3e3024'))  # the wall's face above the floor
    if t['name'] == 'rat_hole':
        d.ellipse([px + s * 0.25, py + s * 0.45, px + s * 0.75, py + s * 0.95], fill=hexc('#050404'))
    if t['name'] == 'dirt_pile':
        d.ellipse([px + 1, py + s * 0.3, px + s - 2, py + s - 2], fill=col, outline=hexc('#0b0a0f'))
    if t['name'] == 'bridge':
        for i in range(0, s, max(2, s // 5)): d.line([px, py + i, px + s - 1, py + i], fill=hexc('#3e2c1e'))
    if t['name'] == 'stone_wall':
        d.rectangle([px, py + s * 0.15, px + s - 1, py + s - 1], fill=shade(col, 0.75))
        d.rectangle([px, py, px + s - 1, py + s * 0.5], fill=col)
        d.line([px, py + s * 0.5, px + s - 1, py + s * 0.5], fill=hexc('#2a2830'))
        d.line([px + (s // 2 if y % 2 else 0), py + s * 0.5, px + (s // 2 if y % 2 else 0), py + s - 1], fill=hexc('#2a2830'))
        if (x * 5 + y * 3) % 7 == 0: d.ellipse([px, py + s * 0.4, px + s * 0.6, py + s * 0.95], fill=hexc('#3e5a32'))  # ivy
    if t['name'] == 'pillar':
        d.ellipse([px + s * 0.15, py + s * 0.7, px + s * 0.85, py + s * 1.0], fill=(0, 0, 0, 90))
        d.rectangle([px + s * 0.25, py - s * 0.4, px + s * 0.75, py + s * 0.9], fill=col, outline=hexc('#2a2830'))
        d.rectangle([px + s * 0.15, py - s * 0.5, px + s * 0.85, py - s * 0.3], fill=shade(col, 1.2))
    if t['name'] == 'rock':
        if (x + y) % 4 == 0: d.rectangle([px + 2, py + 2, px + s // 3, py + s // 3], fill=hexc('#221f2a'))

def draw_objects(d, m, s, ox=0, oy=0, x0=0, y0=0):
    for o in m['placed']:
        px, py = ox + (o['x'] - x0) * s, oy + (o['y'] - y0) * s
        w, h = o['w'] * s, o['h'] * s; col = hexc(OBJ_COL.get(o['kind'], '#777777'))
        k = o['kind']
        if k == 'light_shaft':
            d.ellipse([px - s * 0.3, py - s * 0.2, px + s * 1.3, py + s * 1.2], fill=(200, 215, 220, 40)); continue
        if k == 'sinkhole' or k == 'burrow':
            d.ellipse([px, py, px + w - 1, py + h - 1], fill=hexc('#3a2e22'), outline=hexc('#0b0a0f'))
            d.ellipse([px + w * 0.2, py + h * 0.2, px + w * 0.8, py + h * 0.85], fill=col); continue
        if k in ('torch', 'lantern', 'candle', 'brazier', 'campfire'):
            d.rectangle([px + s * 0.4, py + s * 0.35, px + s * 0.6, py + s - 1], fill=hexc('#3a2a1c'))
            d.ellipse([px + s * 0.25, py, px + s * 0.75, py + s * 0.5], fill=col)
            continue
        if k == 'statue':
            d.rectangle([px + s * 0.2, py + s * 0.7, px + s * 0.8, py + s - 1], fill=shade(col, 0.6))
            d.ellipse([px + s * 0.3, py, px + s * 0.7, py + s * 0.75], fill=col); continue
        if k == 'giant_tree':
            cx = px + w / 2
            d.ellipse([px, py + h * 0.7, px + w - 1, py + h - 1], fill=(0, 0, 0, 110))
            for a, b in ((-0.6, -1.4), (1.6, -1.2), (0.1, -2.0), (0.9, -1.9), (-0.3, -0.6), (1.4, -0.4)):
                d.line([cx, py + h * 0.4, px + w * a, py + h * b * 0.5], fill=hexc('#1c1712'), width=max(3, s // 2 + 2))
                d.line([cx, py + h * 0.4, px + w * a, py + h * b * 0.5], fill=col, width=max(2, s // 2))
            d.polygon([(px + w * 0.2, py + h - 1), (px + w * 0.35, py + h * 0.1), (px + w * 0.65, py + h * 0.1), (px + w * 0.8, py + h - 1)],
                      fill=col, outline=hexc('#1c1712'))
            d.ellipse([cx - s * 0.5, py + h - s * 1.1, cx + s * 0.5, py + h - 1], fill=hexc('#0b0a0f'))  # the hollow
            continue
        if k in ('fallen_log', 'drying_rack', 'stump', 'trap', 'firepit'):
            if k == 'fallen_log':
                d.rounded_rectangle([px + 1, py + s * 0.3, px + w - 2, py + s * 0.85], radius=s * 0.25, fill=col, outline=hexc('#1c1712'))
            elif k == 'drying_rack':
                d.line([px + 2, py + s * 0.3, px + w - 3, py + s * 0.3], fill=col, width=2)
                for a in (0.15, 0.85): d.line([px + w * a, py + s * 0.2, px + w * a, py + s - 1], fill=col, width=2)
                d.rectangle([px + w * 0.35, py + s * 0.3, px + w * 0.6, py + s * 0.75], fill=hexc('#8a6a50'))
            elif k == 'stump':
                d.ellipse([px + s * 0.15, py + s * 0.3, px + s * 0.85, py + s * 0.9], fill=col, outline=hexc('#1c1712'))
            elif k == 'trap':
                d.arc([px + s * 0.15, py + s * 0.25, px + s * 0.85, py + s * 0.85], 180, 360, fill=col, width=2)
                d.arc([px + s * 0.15, py + s * 0.35, px + s * 0.85, py + s * 0.95], 0, 180, fill=col, width=2)
            else:
                d.ellipse([px + s * 0.1, py + s * 0.3, px + s * 0.9, py + s * 0.9], fill=hexc('#6a6460'))
                d.ellipse([px + s * 0.3, py + s * 0.45, px + s * 0.7, py + s * 0.75], fill=col)
            continue
        if k == 'chapel':
            # nave with a slate roof, the steeple at the front with its one lit window, the door at the foot
            d.rectangle([px + s * 0.5, py + s * 2, px + w - s * 0.5, py + h - 1], fill=hexc('#0b0a0f'))
            d.rectangle([px + s * 0.5 + 1, py + s * 2 + 1, px + w - s * 0.5 - 1, py + h - 2], fill=col)
            d.polygon([(px + s * 0.3, py + s * 5), (px + w / 2, py + s * 1.4), (px + w - s * 0.3, py + s * 5)], fill=hexc('#3a3a48'), outline=hexc('#0b0a0f'))
            for hx, hy in ((0.3, 0.45), (0.7, 0.4)): d.rectangle([px + w * hx, py + h * hy, px + w * hx + s * 0.5, py + h * hy + s * 0.4], fill=hexc('#14121a'))  # holes in the roof
            tx = px + w / 2
            d.rectangle([tx - s * 1.2, py + s * 3.5, tx + s * 1.2, py + h - 1], fill=shade(col, 1.15), outline=hexc('#0b0a0f'))
            d.polygon([(tx - s * 1.4, py + s * 3.6), (tx, py - s * 1.2), (tx + s * 1.4, py + s * 3.6)], fill=hexc('#3a3a48'), outline=hexc('#0b0a0f'))
            d.rectangle([tx - s * 0.3, py + s * 4.4, tx + s * 0.3, py + s * 5.3], fill=hexc('#ffd27a'))   # the lit window
            d.rectangle([tx - s * 0.5, py + h - s * 1.3, tx + s * 0.5, py + h - 1], fill=hexc('#2a1a12'))   # the door
            continue
        if k == 'fallen_bell':
            d.ellipse([px + 2, py + h * 0.55, px + w - 2, py + h - 1], fill=(0, 0, 0, 110))
            d.polygon([(px + w * 0.25, py + h * 0.15), (px + w * 0.75, py + h * 0.15), (px + w * 0.95, py + h * 0.85), (px + w * 0.05, py + h * 0.85)], fill=col, outline=hexc('#2a2014'))
            d.line([px + w * 0.45, py + h * 0.3, px + w * 0.6, py + h * 0.8], fill=hexc('#2a2014'), width=2)  # the crack
            continue
        if k == 'ash_circle':
            d.ellipse([px + 2, py + 2, px + w - 3, py + h - 3], outline=hexc('#9a9490'), width=max(2, s // 4))
            d.ellipse([px + w * 0.3, py + h * 0.3, px + w * 0.7, py + h * 0.7], fill=hexc('#ff7a3c')); continue
        if k == 'censer':
            d.line([px + s / 2, py, px + s / 2, py + s - 1], fill=hexc('#3a2a1c'), width=2)
            d.ellipse([px + s * 0.25, py + s * 0.15, px + s * 0.75, py + s * 0.6], fill=col)
            d.line([px + s / 2, py, px + s * 0.7, py - s * 0.8], fill=(180, 180, 190, 160), width=2); continue
        if k == 'banner':
            d.rectangle([px + s * 0.2, py, px + s * 0.8, py + s * 1.1], fill=col, outline=hexc('#0b0a0f'))
            d.ellipse([px + s * 0.32, py + s * 0.3, px + s * 0.68, py + s * 0.66], outline=hexc('#c0302a'), width=max(1, s // 8)); continue
        if k == 'bedroll':
            d.rounded_rectangle([px + s * 0.1, py + s * 0.3, px + s * 0.9, py + s * 0.8], radius=s * 0.2, fill=col, outline=hexc('#1c1712')); continue
        if k == 'shrine':
            d.rectangle([px + 1, py - s * 0.6, px + w - 2, py + h - 1], fill=col, outline=hexc('#0b0a0f'))
            d.polygon([(px, py - s * 0.5), (px + w / 2, py - s * 1.2), (px + w, py - s * 0.5)], fill=hexc('#3a3a48'), outline=hexc('#0b0a0f'))
            d.rectangle([px + w * 0.4, py - s * 0.3, px + w * 0.6, py + h * 0.6], fill=hexc('#ffd27a')); continue
        if k == 'dead_oak':
            cx, cy = px + w / 2, py + h / 2
            for a, b in ((0.05, 0.1), (0.95, 0.0), (0.15, 0.55), (0.9, 0.5), (0.5, 0.0)):
                d.line([cx, cy + h * 0.1, px + w * a, py + h * b], fill=col, width=max(2, s // 3))
            d.rectangle([cx - s * 0.3, cy - s * 0.2, cx + s * 0.3, py + h - 1], fill=col); continue
        d.rectangle([px, py, px + w - 1, py + h - 1], fill=hexc('#0b0a0f'))
        d.rectangle([px + 1, py + 1, px + w - 2, py + h - 2], fill=col)
        d.rectangle([px + 1, py + 1, px + w - 2, py + s * 0.4], fill=shade(col, 1.3))
        if k == 'bell_tower':
            d.rectangle([px + s, py + s * 0.6, px + 2 * s - 1, py + 1.6 * s], fill=hexc('#1a1820'))
            d.ellipse([px + s * 1.15, py + s * 0.75, px + s * 1.85, py + s * 1.45], fill=hexc('#a08a50'))
        if k == 'crypt_mouth':
            d.rectangle([px + 1.6 * s, py + 1.2 * s, px + 3.4 * s, py + h - 1], fill=hexc('#07060a'))
            d.rectangle([px + 1.8 * s, py + 1.5 * s, px + 3.2 * s, py + h - 1], fill=hexc('#2a3a6a'))
        if k in ('tunnel_mouth', 'wolf_den'):
            d.rectangle([px + w * 0.3, py + h * 0.45, px + w * 0.7, py + h - 1], fill=hexc('#07060a'))
        if k == 'lean_to':
            d.polygon([(px, py + h - 1), (px + w / 2, py), (px + w - 1, py + h - 1)], fill=hexc('#7a5a38'), outline=hexc('#1c1712'))
        if k == 'shack':
            d.polygon([(px, py + s), (px + w / 2, py - s * 0.2), (px + w, py + s)], fill=hexc('#6e4a2a'))
        if k == 'throne':
            d.rectangle([px + s, py, px + 2 * s - 1, py + h - 1], fill=hexc('#c9a227'))
        if o['door'] == 'S' and k not in ('throne',):
            dx = px + (o['w'] // 2) * s
            d.rectangle([dx + s * 0.2, py + h - s * 0.6, dx + s * 0.8, py + h - 1], fill=hexc('#3b2a1d'))

def draw_markers(d, m, s, f, ox=0, oy=0, x0=0, y0=0, labels=True):
    P = lambda mk: (ox + (mk['x'] - x0) * s + s / 2, oy + (mk['y'] - y0) * s + s / 2)
    for mk in m['markers']:
        x, y = P(mk); r = max(3, s * 0.45)
        if mk['k'] == 'spawn':
            sc = SPAWN_COL.get(mk['type'], (240, 234, 216, 255))
            for dx, dy in ((-r * 0.6, r * 0.4), (r * 0.6, r * 0.4), (0, -r * 0.6)):
                d.ellipse([x + dx - r * 0.4, y + dy - r * 0.4, x + dx + r * 0.4, y + dy + r * 0.4], fill=sc, outline=(10, 10, 14, 255))
            if labels: tag(d, f, '-'.join(map(str, sorted(set(mk['lv'])))), x + r + 8, y, sc)
        elif mk['k'] == 'named':
            if mk.get('route') and labels:
                pts = [(ox + (a - x0) * s + s / 2, oy + (b - y0) * s + s / 2) for a, b in mk['route']]
                for a, b in zip(pts, pts[1:] + pts[:1]):
                    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1])) // 6) + 1
                    for i in range(0, n, 2):
                        d.line([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n,
                                a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n], fill=(255, 138, 112, 200), width=2)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(224, 72, 42, 255), outline=(10, 10, 14, 255), width=2)
            if labels: tag(d, f, mk['type'].replace('_', ' ').title() + f" ({mk['lv'][0]})", x, y - r - 7, (255, 138, 112, 255))
        elif mk['k'] == 'rare':
            d.polygon([(x, y - r), (x + r * 0.8, y), (x, y + r), (x - r * 0.8, y)], fill=(180, 140, 255, 255), outline=(10, 10, 14, 255))
            if labels: tag(d, f, mk['type'].replace('_', ' ').title() + ' (rare)', x, y - r - 7, (205, 180, 255, 255))
        elif mk['k'] == 'chest':
            d.rectangle([x - r * 0.7, y - r * 0.5, x + r * 0.7, y + r * 0.6], fill=(201, 162, 39, 255), outline=(10, 10, 14, 255))
            if labels: tag(d, f, 'hidden chest', x, y - r - 7, (236, 210, 122, 255))
        elif mk['k'] == 'exit':
            d.ellipse([x - r, y - r, x + r, y + r], outline=(125, 255, 176, 255), width=2)
            if labels:
                to = next((e[3:] for e in mk.get('extra', []) if e.startswith('to=')), mk['type'])
                tag(d, f, '→ ' + to.replace('_', ' '), x, y - r - 7, (125, 255, 176, 255))

def tag(d, f, text, x, y, col):
    w = d.textlength(text, font=f)
    hh = f.size
    x = max(w / 2 + 4, min(d.im.size[0] - w / 2 - 4, x))
    d.rectangle([x - w / 2 - 3, y - hh / 2 - 2, x + w / 2 + 3, y + hh / 2 + 2], fill=(10, 9, 14, 190))
    d.text((x - w / 2, y - hh / 2 - 1), text, font=f, fill=col)

def overlay_light_fog(img, m, s, ox=0, oy=0, x0=0, y0=0):
    ov = Image.new('RGBA', img.size, TINTS.get(m['tint'], (0, 0, 0, 0)))
    od = ImageDraw.Draw(ov)
    for (x, y, w, h) in m['fogs']:
        od.ellipse([ox + (x - x0) * s, oy + (y - y0) * s, ox + (x - x0 + w) * s, oy + (y - y0 + h) * s], fill=(200, 215, 210, 55))
    img.alpha_composite(ov)
    gl = Image.new('RGBA', img.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(gl)
    for o in m['placed']:
        if not o['light']: continue
        cx, cy = ox + (o['x'] - x0 + o['w'] / 2) * s, oy + (o['y'] - y0 + o['h'] / 2) * s
        col = (120, 160, 255) if o['kind'] == 'crypt_mouth' else (255, 160, 70)
        for i in range(6, 0, -1):
            r = o['light'] * s * i / 6
            gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (int(14 * (7 - i) / 2),))
    img.alpha_composite(gl)

def render(m, tiles, outdir, phone=None):
    s = 16; pad = 28
    W, H = m['W'] * s + pad * 2, m['H'] * s + pad * 2
    img = Image.new('RGBA', (W, H), (18, 17, 22, 255)); d = ImageDraw.Draw(img)
    draw_tiles(d, m, tiles, s, pad, pad)
    draw_objects(d, m, s, pad, pad)
    overlay_light_fog(img, m, s, pad, pad); d = ImageDraw.Draw(img)
    # coordinate ruler every 4 tiles so notes can say "move the shack to 6,30"
    fs = font(11)
    for x in range(0, m['W'], 4):
        d.text((pad + x * s + 1, 6), str(x), font=fs, fill=(150, 145, 160, 255))
        d.line([pad + x * s, pad, pad + x * s, pad + m['H'] * s], fill=(255, 255, 255, 18))
    for y in range(0, m['H'], 4):
        d.text((4, pad + y * s), str(y), font=fs, fill=(150, 145, 160, 255))
        d.line([pad, pad + y * s, pad + m['W'] * s, pad + y * s], fill=(255, 255, 255, 18))
    draw_markers(d, m, s, font(12, True), pad, pad)
    lf = font(13, True)
    for l in m['labels']:
        if len(l) == 4: tag(d, lf, l[3], pad + int(l[1]) * s + s / 2, pad + int(l[2]) * s + s / 2, (236, 210, 122, 255))
    path = os.path.join(outdir, m['id'] + '.png'); img.convert('RGB').save(path)
    out = [path]
    # one phone screen at game scale: 16 px tiles, about 12 x 22 tiles, drawn 2x
    if phone:
        cx, cy = phone; vw, vh = 12, 22
        x0 = max(0, min(m['W'] - vw, cx - vw // 2)); y0 = max(0, min(m['H'] - vh, cy - vh // 2))
        s2 = 32
        im2 = Image.new('RGBA', (vw * s2, vh * s2), (0, 0, 0, 255)); d2 = ImageDraw.Draw(im2)
        draw_tiles(d2, m, tiles, s2, 0, 0, x0, y0, x0 + vw, y0 + vh)
        draw_objects(d2, m, s2, 0, 0, x0, y0)
        sub = dict(m, markers=[mk for mk in m['markers'] if x0 <= mk['x'] < x0 + vw and y0 <= mk['y'] < y0 + vh])
        overlay_light_fog(im2, m, s2, 0, 0, x0, y0); d2 = ImageDraw.Draw(im2)
        draw_markers(d2, sub, s2, font(14, True), 0, 0, x0, y0, labels=False)
        p2 = os.path.join(outdir, m['id'] + '-phone.png'); im2.convert('RGB').save(p2); out.append(p2)
    return out

def main():
    args = sys.argv[1:]
    if not args: print(__doc__); sys.exit(2)
    outdir = 'out'; phone = None; paths = []
    i = 0
    while i < len(args):
        if args[i] == '--out': outdir = args[i + 1]; i += 2
        elif args[i] == '--phone': phone = tuple(int(v) for v in args[i + 1].split(',')); i += 2
        else: paths.append(args[i]); i += 1
    os.makedirs(outdir, exist_ok=True)
    tiles, objs = load_tables(); bad = 0
    maps = {load_map(p)['id']: load_map(p) for p in paths}
    for p in paths:
        m = load_map(p)
        E, W, mm = check(m, tiles, objs)
        # exits between maps: the other map must exist and lead back here (by at= exit name, or any exit to this map)
        for t in m['things']:
            if t[0] != 'exit': continue
            kv = dict(a.split('=', 1) for a in t[4:] if '=' in a); to = kv.get('to', '')
            if to in maps:
                back = [x for x in maps[to]['things'] if x[0] == 'exit']
                if kv.get('at') and not any(x[1] == kv['at'] for x in back): E.append(f"exit {t[1]}: map {to} has no exit named {kv['at']}")
                if not any(('to=' + m['id']) in x for x in back): W.append(f'exit {t[1]}: map {to} has no way back to {m["id"]}')
        print(f"== {m['name']} ({m.get('W','?')}x{m.get('H','?')} tiles) ==")
        for e in E: print('  ERROR  ' + e)
        for w in W: print('  warn   ' + w)
        if not E and not W: print('  all clear')
        if mm:
            sp = [mk for mk in mm['markers'] if mk['k'] in ('spawn', 'named')]
            print(f"  {len(mm['placed'])} objects, {len(sp)} spawn points, {sum(1 for mk in mm['markers'] if mk['k']=='chest')} chests, "
                  f"{sum(1 for mk in mm['markers'] if mk['k']=='exit')} exits")
            if mm['dist']:
                far = max(mm['dist'].values())
                print(f"  farthest walk from the start: {far} tiles (about {far / 2:.0f} s at 2 tiles a second)")
            st = next((mk for mk in mm['markers'] if mk['k'] == 'exit' and mk['type'] == mm['start']), None)
            view = phone or ((st['x'], st['y']) if st else None)  # default phone view: standing at the way in
            for f in render(mm, tiles, outdir, view): print('  drew ' + f)
        bad += bool(E)
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()

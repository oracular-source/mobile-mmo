"""Run: python3 tools/wolfwood_takes.py (writes out/wolfwood_take_A..D.png; needs Pillow and numpy).
Wolfwood style takes: the same scene in four looks, drawn as pixel art at game scale.
Scene: you walk north up the road from the crossroads; leafy trees give way to tall firs, the dead giant tree
stands grey above the canopy, a wolf pack on the road, a boar off to the side, the hunter's camp in a clearing."""
import random, math
import numpy as np
from PIL import Image

W, H, S = 195, 380, 2          # game pixels, scale up 2x for the canvas
K = (11, 10, 15)               # outline

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

TAKES = {
 'A': dict(name='Dusk hush',
   ground=['#1e2a1f', '#26331f', '#2f3d26'], needles='#3a3226', moss='#3d5a34', road=['#4a3e32', '#5a4b3a'],
   fir=['#13221a', '#1d3324', '#2b4a31', '#3e6440'], leaf=['#26391f', '#3a5530', '#58773f'],
   bark='#4a3a2c', dead=['#5c5a5e', '#8a8790', '#b4b0b8'], blight=['#4b4a4c', '#6a676b'],
   tint='#9fb8a8', tintAmt=.35, fog='#9db0a6', fogA=.30, shaft='#e8e2b0', shaftA=.18, dark=.18,
   eye=None, extra=None),
 'B': dict(name='Blight bloom',
   ground=['#24242a', '#2c2b30', '#353339'], needles='#3a3434', moss='#4a4a3e', road=['#4a4440', '#5a524c'],
   fir=['#16181c', '#22262a', '#323a36', '#4a564c'], leaf=['#2a3324', '#3e4a32', '#5a6644'],
   bark='#463c36', dead=['#6a6870', '#9a96a2', '#d0ccd6'], blight=['#5c5864', '#8a8494'],
   tint='#b4a8c8', tintAmt=.40, fog='#b8b0c4', fogA=.34, shaft='#d8d0f0', shaftA=.10, dark=.22,
   eye=None, extra='spores'),
 'C': dict(name='Moon and eyes',
   ground=['#151c26', '#1a2430', '#223040'], needles='#262a32', moss='#24384a', road=['#343842', '#424854'],
   fir=['#0c121c', '#141e2c', '#1e3044', '#2e4a62'], leaf=['#162436', '#20364a', '#30506a'],
   bark='#2e2a30', dead=['#4a5260', '#7a8698', '#b8c4d4'], blight=['#3a4250', '#56606e'],
   tint='#7890c0', tintAmt=.45, fog='#8ea4c8', fogA=.26, shaft='#c8dcff', shaftA=.20, dark=.30,
   eye='#ffe36a', extra='moon'),
 'D': dict(name='Rust and gold',
   ground=['#2a2418', '#33291a', '#3e3220'], needles='#4a3622', moss='#4a5a2c', road=['#5a4630', '#6a543a'],
   fir=['#141e18', '#1e2e22', '#2c4430', '#3e5e3a'], leaf=['#5a2e14', '#8a4a1c', '#c0782c'],
   bark='#4a3424', dead=['#5e5650', '#8e847a', '#bcb2a4'], blight=['#4e4842', '#6e6660'],
   tint='#e0b07a', tintAmt=.30, fog='#d8b890', fogA=.22, shaft='#ffd88a', shaftA=.26, dark=.16,
   eye=None, extra='leaves'),
}

def vnoise(seed, cell):
    r = np.random.RandomState(seed); g = r.rand(H//cell+3, W//cell+3).astype(np.float32)
    im = Image.fromarray((g*255).astype(np.uint8)).resize(((W//cell+3)*cell, (H//cell+3)*cell), Image.BICUBIC)
    return np.asarray(im, np.float32)[:H, :W]/255.

def make(key):
    T = TAKES[key]; C = {k: ([hexc(x) for x in v] if isinstance(v, list) else hexc(v) if isinstance(v, str) and v.startswith('#') else v) for k, v in T.items()}
    rnd = random.Random(7)                     # same layout in every take
    img = np.zeros((H, W, 3), np.float32)
    def px(x, y, c):
        if 0 <= x < W and 0 <= y < H: img[y, x] = c

    # --- road: enters bottom middle, bends left, then right toward the giant tree, leaves at the top
    def road_x(y): return 92 + 22*math.sin((380-y)/70) - (380-y)*0.05
    def road_w(y): return 13 if y > 120 else 10
    def blight_amt(x, y):                       # grey creeping out from the giant tree's foot
        d = math.hypot((x-130)*0.9, (y-122)*1.3); return max(0, 1-d/(70 if key != 'B' else 110))
    border = lambda y: max(0, min(1, (y-280)/70))   # 0 = deep wood, 1 = crossroads side (blended border)
    n1, n2, n3 = vnoise(1, 14), vnoise(2, 5), vnoise(5, 8)
    bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]])/16.
    for y in range(H):
        for x in range(W):
            th = bayer[y % 4, x % 4]
            n = n1[y, x]*.65 + n2[y, x]*.35
            lv = n*2.0 - .45                     # 0..1.55: base, mid, light; dithered between bands
            i = int(lv + th - .5); i = max(0, min(2, i))
            g = C['ground'][i]
            r = rnd.random()
            if r < .05: g = C['needles']
            elif r < .08 + .08*border(y) and n3[y, x] > .5: g = C['moss']
            if border(y) > 0 and n2[y, x] + th*.3 < border(y)*.7: g = mix(g, C['leaf'][1], .3)
            b = blight_amt(x, y) + (n1[y, x]-.5)*.35
            if b > .30 + th*.25: g = C['blight'][1 if b > .65 + th*.2 else 0]
            rx, rw = road_x(y), road_w(y)
            dx = abs(x-rx) - rw/2 + (n2[y, x]-.5)*2.5
            if dx < 0: g = C['road'][1 if n2[y, x] + th*.3 > .85 else 0]
            elif dx < 1: g = mix(C['road'][0], C['ground'][0], .5)
            img[y, x] = g
    # clearing for the hunter's camp (right, middle) and the road's light
    camp = (150, 210)
    for y in range(185, 240):
        for x in range(122, 190):
            if ((x-camp[0])/34)**2 + ((y-camp[1])/24)**2 < 1 and rnd.random() < .5: img[y, x] = mix(img[y, x], C['moss'], .5)

    things = []   # (sort_y, draw_fn)
    def fir(cx, by, h, v):
        def d():
            tw = max(3, h//14)
            for y in range(by-6, by+1):
                for x in range(cx-tw//2-1, cx+tw//2+2):
                    edge = x in (cx-tw//2-1, cx+tw//2+1) or y == by
                    px(x, y, K if edge else C['bark'])
            top = by-h; tiers = 4 + h//30
            # crown silhouette row by row: jagged tiers, wider toward the bottom
            rows = {}
            for y in range(top, by-4):
                t = (y-top)/(by-4-top)
                tier = t*tiers; ft = tier-int(tier)
                half = int(2 + t*h*0.30 * (0.55 + 0.45*ft)) + v.randint(0, 1)
                rows[y] = half
            for y, half in rows.items():
                for x in range(cx-half, cx+half+1):
                    rel = (x-cx)/(half+.01); up = rows.get(y-1, -1)
                    if x in (cx-half, cx+half) or abs(x-cx) > up: c = K
                    elif rel < -.45 and v.random() < .8: c = C['fir'][3]
                    elif rel < .05: c = C['fir'][2]
                    elif rel < .55: c = C['fir'][1]
                    else: c = C['fir'][0]
                    px(x, y, c)
            px(cx, top-1, K)
        things.append((by, d))
    def leafy(cx, by, r):
        def d():
            for y in range(by-10, by+1):
                for x in (cx-2, cx-1, cx, cx+1, cx+2):
                    px(x, y, K if x in (cx-2, cx+2) or y == by else C['bark'])
            oy = by-10-r
            for y in range(oy-r, oy+r+1):
                for x in range(cx-r-3, cx+r+4):
                    dd = ((x-cx)/(r+3))**2 + ((y-oy)/r)**2
                    wob = .08*math.sin(x*1.7+y*0.9)
                    if dd < 1+wob:
                        hl = math.hypot(x-(cx-r*.35), y-(oy-r*.35)) + 2*math.sin(x*2.3+y*1.1)
                        sd = math.hypot(x-(cx+r*.3), y-(oy+r*.45)) + 2*math.sin(x*1.9-y*1.3)
                        c = K if dd > .86+wob else C['leaf'][2] if hl < r*.55 else C['leaf'][0] if sd < r*.55 else C['leaf'][1]
                        if key == 'D' and rnd.random() < .07: c = C['leaf'][2]
                        px(x, y, c)
        things.append((by, d))
    def giant(cx, by):
        def d():
            def line(x0, y0, x1, y1, w0, w1, c, shade=False):
                n = max(abs(x1-x0), abs(y1-y0)) or 1
                for i in range(n+1):
                    t = i/n; x = round(x0+(x1-x0)*t); y = round(y0+(y1-y0)*t); w = round(w0+(w1-w0)*t)
                    for o in range(-(w//2), w-(w//2)):
                        cc = c
                        if shade: cc = C['dead'][2] if o == -(w//2)+1 and w > 2 else C['dead'][0] if o >= w-(w//2)-2 and w > 3 else c
                        px(x+o, y, cc)
            limbs = [(-4, -78, -40, -120, 10, 4), (6, -74, 44, -128, 10, 4), (-36, -114, -62, -138, 5, 2), (-34, -116, -26, -170, 4, 2),
                     (40, -122, 70, -146, 4, 2), (38, -124, 30, -176, 4, 2), (0, -80, 6, -190, 12, 4), (5, -150, -12, -190, 4, 2),
                     (5, -150, 24, -192, 3, 1), (-58, -134, -74, -142, 2, 1), (66, -142, 80, -160, 2, 1)]
            for (a, b, c2, d2, w0, w1) in limbs: line(cx+a, by+b, cx+c2, by+d2, w0+2, w1+2, K)
            for y in range(by-82, by+1):                     # thick trunk flaring into roots
                f = max(0, y-(by-18)); half = 13 + f*f//22
                wav = round(1.5*math.sin(y/6))
                for x in range(cx-half+wav, cx+half+1+wav):
                    rel = (x-(cx+wav))/half
                    c = K if x in (cx-half+wav, cx+half+wav) or y == by else C['dead'][2] if rel < -.55 else C['dead'][1] if rel < .25 else C['dead'][0]
                    if (x*7+y*3) % 11 == 0 and abs(rel) < .8: c = mix(c, K, .35)    # bark cracks
                    px(x, y, c)
            for (a, b, c2, d2, w0, w1) in limbs: line(cx+a, by+b, cx+c2, by+d2, w0, w1, C['dead'][1], shade=True)
            for y in range(by-30, by-9):                        # the hollow (hidden chest inside)
                for x in range(cx-6, cx+7):
                    q = ((x-cx)/5.5)**2 + ((y-(by-19))/9.5)**2
                    if q < 1: px(x, y, K if q < .75 else mix(C['dead'][0], K, .5))
            for (x, y) in [(cx-62, by-139), (cx+44, by-129), (cx-28, by-171), (cx+70, by-147)]:   # crows
                for (dx, dy) in [(0, 0), (1, 0), (-1, 0), (0, -1), (1, -1), (2, -2), (-1, 1), (1, 1), (-2, 0)]: px(x+dx, y+dy, K)
        things.append((by, d))
    def wolf(x, y, face=1, big=False):
        def d():
            coat = C['dead'][1] if big else mix(C['dead'][0], C['blight'][1], .5)
            hi = C['dead'][2]
            shape = ["....k.k...............",
                     "...kHkHk...............",
                     "..kHHHHHk..............",
                     ".kHEHHHHHkkkkkkkkk.....",
                     "kNHHHHHHCCCCCCCCCCkk..k",
                     ".kkkHHCCCCCCCCCCCCCCkkC",
                     "...kHCCCCCCCCCCCCCCCCCk",
                     "...kCCCCCCCCCCCCCCDDkk.",
                     "...kCCkCCkkkkkCCkCDk...",
                     "...kCkkCk....kCkkCk....",
                     "...kCk.kCk...kCk.kCk...",
                     "...kk...kk...kk...kk..."]
            if big: shape = [r.replace('k', 'k') for r in shape]
            for j, row in enumerate(shape):
                for i, ch in enumerate(row):
                    xx = x + (i if face > 0 else 22-i)
                    if ch == 'k': px(xx, y+j, K)
                    elif ch == 'C': px(xx, y+j, coat)
                    elif ch == 'H': px(xx, y+j, hi)
                    elif ch == 'D': px(xx, y+j, mix(coat, K, .4))
                    elif ch == 'N': px(xx, y+j, K)
                    elif ch == 'E': px(xx, y+j, hexc(T['eye']) if T['eye'] else (220, 60, 50))
        things.append((y+11, d))
    def boar(x, y):
        def d():
            shape = ["......k.k.k.k.k.......",
                     ".....kTkTkTkTkTk......",
                     "...kkBBBBBBBBBBBkk....",
                     ".kkBBHBHBHBHBBBBBBk...",
                     "kBBBBBBBBBBBBBBBBBBkk.",
                     "kBBBBBBBBBBBBBBBBBEBBk",
                     "kBBBBBBBBBBBBBBBBBBBNk",
                     ".kBBBBBBBBBBBBBBBBBWWk",
                     "..kBBBBBBBBBBBBBBBBkk.",
                     "..kBBkkBBkkkkkBBkkBk..",
                     "..kBk.kBk.....kBk.kBk.",
                     "..kk..kk......kk..kk.."]
            for j, row in enumerate(shape):
                for i, ch in enumerate(row):
                    c = {'k': K, 'B': mix(C['bark'], (90,70,60), .3), 'H': mix(C['bark'], C['dead'][1], .5), 'T': C['dead'][2], 'N': (40,30,30), 'E': (220, 60, 50), 'W': (230, 220, 190)}.get(ch)
                    if c: px(x+i, y+j, c)
        things.append((y+11, d))
    def player(x, y):
        def d():
            for j in range(-1, 25):                            # outline first
                for i in range(-1, 21):
                    hx, hy = i-10, j
                    if (hx/4.6)**2+((hy-4)/4.8)**2 < 1 or (7 <= hy <= 22 and abs(hx) <= 4+(hy-8)//4) or (21 < hy <= 24 and -3 <= hx <= 3): px(x+i, y+j, K)
            # small rags figure, 20x24 footprint, so the trees read at true size
            for j in range(24):
                for i in range(20):
                    hx, hy = i-10, j
                    inside_head = (hx/3.6)**2 + ((hy-4)/3.8)**2 < 1
                    inside_body = 8 <= hy <= 21 and abs(hx) <= 3 + (hy-8)//4
                    legs = 21 < hy <= 23 and hx in (-2, -1, 1, 2)
                    if inside_head: c = (217, 167, 124) if hy > 3 else (60, 44, 32)
                    elif inside_body: c = (74, 59, 51) if hx < 1 else (58, 46, 40)
                    elif legs: c = (58, 46, 40)
                    else: continue
                    px(x+i, y+j, c)
            for (i, j) in [(15, 10), (16, 9), (17, 8), (18, 7)]: px(x+i, y+j, (110, 74, 42))  # stick
        things.append((y+23, d))
    def camp_props():
        def d():
            cx, cy = camp
            hide, hide2, pole = (132, 104, 76), (104, 82, 60), (88, 64, 42)
            for y in range(cy-26, cy-3):                      # lean-to: hide stretched on a slanted frame
                for x in range(cx+2, cx+34):
                    if y-(cy-26) >= (cx+34-x)*0.7:
                        edge = y == cy-4 or y-(cy-26) < (cx+34-x)*0.7+1
                        px(x, y, K if edge else hide if (x//3+y//2) % 3 else hide2)
            for i in range(26): px(cx+3+i, cy-4-int(i*0.0), K)
            for y in range(cy-4, cy+1): px(cx+3, y, pole); px(cx+33, y, pole)
            for a in range(10):                                  # cold firepit: stone ring, ash, a charred log
                t = a/10*6.283; x, y = round(cx-10+6*math.cos(t)), round(cy+4+3.5*math.sin(t))
                px(x, y, C['dead'][1]); px(x, y+1, K)
            for x in range(cx-14, cx-6): px(x, cy+4, (44, 38, 36)); px(x, cy+3, (70, 62, 58))
            for x in range(cx-38, cx-18): px(x, cy-14, K)        # drying rack with two hides
            for y in range(cy-15, cy+3): px(cx-38, y, pole); px(cx-19, y, pole)
            for x0 in (cx-36, cx-27):
                for x in range(x0, x0+7):
                    for y in range(cy-13, cy-3): px(x, y, K if x in (x0, x0+6) or y == cy-4 else hide if (x+y) % 4 else hide2)
            for (tx, ty) in [(cx+12, cy+14), (cx-30, cy+12)]:    # sprung traps
                for i in range(5): px(tx+i, ty, (120, 118, 124)); px(tx+i, ty-2, (120, 118, 124))
                px(tx-1, ty-1, K); px(tx+5, ty-1, K)
        things.append((camp[1]+4, d))
    # --- placement (identical in every take)
    giant(130, 120)
    fv = random.Random(3)
    spots = [(12, 70, 80), (34, 52, 66), (8, 132, 74), (40, 150, 70), (60, 104, 62), (178, 62, 76), (186, 140, 70),
             (104, 46, 56), (154, 40, 60), (18, 206, 78), (52, 232, 72), (108, 196, 60), (186, 312, 66), (10, 286, 70),
             (60, 290, 60), (150, 296, 64), (84, 168, 50)]
    for (x, y, h) in spots:
        if abs(x-road_x(y)) > 16: fir(x, y, h, fv)
    for (x, y, r) in [(14, 352, 15), (182, 344, 14), (160, 378, 16), (40, 378, 14), (128, 340, 12)]:
        if abs(x-road_x(y)) > 18: leafy(x, y, r)
    camp_props()
    wolf(int(road_x(150))-14, 138, -1); wolf(int(road_x(160))+4, 152, -1); wolf(int(road_x(166))-24, 160, 1)
    wolf(154, 142, -1, big=True)                 # Old Scar-ish loner near the blight edge
    boar(14, 246)
    player(int(road_x(330))-10, 318)
    for _, d in sorted(things, key=lambda t: t[0]): d()

    # --- light pass: tint, darkness toward the north, light shafts, fog bands, take extras
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    tint = np.array(C['tint'], np.float32)
    img = img*(1-T['tintAmt']) + img*(tint/255.)*T['tintAmt']*1.6
    depth = 1 - T['dark']*np.clip((300-yy)/300, 0, 1)                 # darker deeper in
    img *= depth[..., None]
    sh = np.zeros((H, W), np.float32)
    for (sx, w) in [(150, 14), (96, 9), (40, 7)]:                      # diagonal shafts through gaps
        d = np.abs((xx - sx) - (yy - 200)*0.35)
        sh += np.clip(1 - d/w, 0, 1) * np.clip(1-np.abs(yy-200)/170, 0, 1)
    img += sh[..., None]*np.array(C['shaft'], np.float32)*T['shaftA']
    fog = np.zeros((H, W), np.float32)
    for (fy, amp) in [(118, 1), (176, 0.8), (248, 0.9), (300, 0.6)]:   # low fog lying between the trunks
        fog += np.exp(-((yy-fy-3*np.sin(xx/13))/7)**2)*amp*(0.6+0.4*np.sin(xx/9+fy))
    fogc = np.array(C['fog'], np.float32)
    a = np.clip(fog*T['fogA'], 0, .6)[..., None]
    img = img*(1-a) + fogc*a
    vig = np.clip(1 - ((xx-W/2)/(W*.75))**2 - ((yy-H/2)/(H*.9))**2, .55, 1)
    img *= vig[..., None]
    r2 = random.Random(11)
    if T['extra'] == 'spores':
        for _ in range(90):
            x, y = r2.randrange(W), r2.randrange(H); img[y, x] = hexc('#d6cfe6')
    if T['extra'] == 'leaves':
        for _ in range(45):
            x, y = r2.randrange(W), r2.randrange(H); img[y, x] = C['leaf'][2 if r2.random() < .5 else 1]
    if T['extra'] == 'moon':
        for _ in range(40):
            x, y = r2.randrange(W), r2.randrange(H)
            if img[y, x].sum() < 120: img[y, x] = hexc('#8fd8ff') if r2.random() < .3 else img[y, x]
        for (x, y) in [(36, 268), (39, 268), (52, 214), (55, 214)]:     # eyes in the dark between trunks
            img[y, x] = hexc('#ffe36a')
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((W*S, H*S), Image.NEAREST)
    out.save(f'out/wolfwood_take_{key}.png')

for k in TAKES: make(k)
print('ok')

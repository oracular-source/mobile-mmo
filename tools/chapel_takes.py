"""Run: python3 tools/chapel_takes.py (writes out/chapel_take_A..D.png; needs Pillow and numpy).
Ruined Chapel style takes: the same scene in four looks, drawn as pixel art at game scale.
Scene: you come up the road out of Wolfwood's firs, past the pilgrims' wayside shrine with its candles,
through the gap in the chapel wall. Inside: a cult camp of three in the ash circle (zealot, ashcaller,
chanter), an ash wisp, the ruined chapel with its whole steeple and one lit window, and the cloister
where the cracked bell lies on its side (its hidden chest is under the lip)."""
import random, math
import numpy as np
from PIL import Image

W, H, S = 195, 380, 2          # game pixels (same frame as the Wolfwood takes), scaled 2x for the canvas
K = (11, 10, 15)               # outline

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t): return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

TAKES = {
 'A': dict(name='Vesper embers',   # cold blue-grey dusk, warm candle pools, low grey smoke
   ground=['#2a2c2e', '#33352f', '#3c3d34'], ash='#55534f', gravel='#6a645a', grass=['#26331f', '#34452a'],
   stone=['#3a3a42', '#5a5a64', '#84848e'], roof=['#2a2226', '#3e3236', '#54464a'], ivy='#34502e',
   fir=['#13221a', '#1d3324', '#2b4a31', '#3e6440'], bark='#4a3a2c',
   robe={'zealot': '#5a2a24', 'ashcaller': '#5c5a5e', 'chanter': '#3e3a52'},
   tint='#9aa8c0', tintAmt=.35, dark=.10, smoke='#a8a8b0', smokeA=.30, warm='#ffb050', warmA=.55,
   window='#ffd070', extra=None),
 'B': dict(name='Ash fall',        # grey and brown, ash flakes in the air, red embers, heavy smoke
   ground=['#2e2a28', '#36312d', '#3f3934'], ash='#5e5852', gravel='#6e665c', grass=['#2c2e22', '#3a3c2c'],
   stone=['#3c3834', '#5e5852', '#88827a'], roof=['#241c1a', '#382c28', '#4e403a'], ivy='#3a4430',
   fir=['#161a16', '#222a22', '#323e30', '#46563e'], bark='#463a30',
   robe={'zealot': '#4e2420', 'ashcaller': '#6a6662', 'chanter': '#40383a'},
   tint='#b8aca0', tintAmt=.35, dark=.12, smoke='#8a8480', smokeA=.42, warm='#ff6a3a', warmA=.45,
   window='#ff9a4a', extra='ash'),
 'C': dict(name='Night vigil',     # deep blue night, only the candles and the steeple window are warm
   ground=['#161a24', '#1c2230', '#232a3a'], ash='#30343e', gravel='#3c4250', grass=['#142030', '#1c2c3c'],
   stone=['#262a38', '#3e4458', '#62687e'], roof=['#141420', '#20202e', '#2e2e40'], ivy='#1e3440',
   fir=['#0c121c', '#141e2c', '#1e3044', '#2e4a62'], bark='#2e2a30',
   robe={'zealot': '#4a1e22', 'ashcaller': '#4a4c58', 'chanter': '#2e2a4a'},
   tint='#7088c0', tintAmt=.45, dark=.20, smoke='#7a88a8', smokeA=.22, warm='#ffc060', warmA=.75,
   window='#ffe080', extra='stars'),
 'D': dict(name='Fen rot',         # murky green-gold, sickly candle light, wet moss on the stones
   ground=['#262a1e', '#2e3322', '#373c28'], ash='#4a4a3a', gravel='#5e5c48', grass=['#2a3a1e', '#3a4e26'],
   stone=['#363a30', '#545a48', '#7c8268'], roof=['#22261c', '#323826', '#464e34'], ivy='#4a6a2a',
   fir=['#141e14', '#1e2e1c', '#2c4428', '#3e5e34'], bark='#463c2a',
   robe={'zealot': '#4a3420', 'ashcaller': '#545a46', 'chanter': '#3a4230'},
   tint='#b8c890', tintAmt=.35, dark=.10, smoke='#a8b490', smokeA=.32, warm='#d8e060', warmA=.45,
   window='#e0f070', extra='motes'),
}

def vnoise(seed, cell):
    r = np.random.RandomState(seed); g = r.rand(H//cell+3, W//cell+3).astype(np.float32)
    im = Image.fromarray((g*255).astype(np.uint8)).resize(((W//cell+3)*cell, (H//cell+3)*cell), Image.BICUBIC)
    return np.asarray(im, np.float32)[:H, :W]/255.

WALL_Y = 236                    # south wall of the chapel grounds (the road comes in through a gap)
GAP = (84, 112)
def road_x(y): return 98 + 10*math.sin((380-y)/60) if y > WALL_Y else 98
def road_w(y): return 12 if y > WALL_Y else 10

def make(key):
    T = TAKES[key]
    C = {k: ([hexc(x) for x in v] if isinstance(v, list) else hexc(v) if isinstance(v, str) and v.startswith('#') else v)
         for k, v in T.items()}
    R = {k: hexc(v) for k, v in T['robe'].items()}
    rnd = random.Random(7)                     # same layout in every take
    img = np.zeros((H, W, 3), np.float32)
    lights = []                                # (x, y, radius, strength) warm light sources
    def px(x, y, c):
        if 0 <= x < W and 0 <= y < H: img[y, x] = c

    # --- ground: needles and firs at the south (Wolfwood), trampled ash and gravel inside the walls (soft border)
    n1, n2 = vnoise(1, 14), vnoise(2, 5)
    bayer = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]])/16.
    for y in range(H):
        wood = max(0, min(1, (y-262)/70))      # 1 = Wolfwood floor, 0 = chapel ground
        for x in range(W):
            th = bayer[y % 4, x % 4]; n = n1[y, x]*.65 + n2[y, x]*.35
            i = max(0, min(2, int(n*2.0 - .45 + th - .5)))
            g = C['ground'][i]
            if wood + n2[y, x]*.4 > .7 + th*.2: g = mix(C['fir'][0], C['fir'][1], n)      # needles under the firs
            elif y < WALL_Y and n1[y, x]*.6 + n2[y, x]*.4 + th*.15 > .80: g = C['ash']      # ash in patches, not static
            elif n2[y, x] + th*.2 > 1.02: g = C['gravel']
            dx = abs(x-road_x(y)) - road_w(y)/2 + (n2[y, x]-.5)*2.5
            if dx < 0 and y > 146:          # the road stops at the flagstones in front of the door
                g = C['gravel'] if (n2[y, x] + th*.3) > .7 else mix(C['gravel'], C['ground'][0], .4)
            img[y, x] = g

    # --- flagstones in front of the chapel door, and the cloister lawn
    for y in range(116, 150):
        for x in range(70, 128):
            if (x-99)**2/30**2 + (y-132)**2/18**2 < 1:
                edge = (x % 7 == 0) or ((y + (x//7)*3) % 6 == 0)
                broken = n2[y, x] > .72
                if not broken: px(x, y, mix(C['stone'][0], K, .3) if edge else C['stone'][1] if (x//7 + y//6) % 3 else C['stone'][0])
    for y in range(64, 126):
        for x in range(140, 189):
            g = C['grass'][1 if n2[y, x] + bayer[y % 4, x % 4]*.3 > .8 else 0]
            if n1[y, x] > .7: g = C['ash']
            px(x, y, g)

    things = []   # (sort_y, draw_fn), drawn back to front

    def wall_h(x0, x1, y, h=7):                # a stretch of low stone wall running east-west
        def d():
            for x in range(x0, x1):
                for j in range(h):
                    yy = y - j
                    top = j == h-1
                    c = K if (x in (x0, x1-1) or j == 0) else C['stone'][2] if top else brick(x, y - j)
                    if not top and j > 0 and (x*3 + j*7) % 13 == 0: c = mix(c, K, .4)
                    px(x, yy, c)
                px(x, y-h, K)
                if rnd.random() < .18: px(x, y-h+1, C['ivy']); px(x, y-h+2, C['ivy'])
        things.append((y, d))
    def wall_v(x, y0, y1, w=6):                # a wall running north-south (seen from above: its top)
        def d():
            for y in range(y0, y1):
                for i in range(w):
                    c = K if i in (0, w-1) else C['stone'][2] if i == 1 else C['stone'][1]
                    if (y*5 + i) % 11 == 0: c = C['ivy']
                    px(x+i, y, c)
            for i in range(w):                 # end face
                for j in range(5): px(x+i, y1+j, K if i in (0, w-1) or j == 4 else C['stone'][0])
        things.append((y1+4, d))

    def brick(x, y):                           # running-bond stone courses: mortar lines, offset every other row
        row = y // 4; off = 4 if row % 2 else 0
        if y % 4 == 3 or (x + off) % 8 == 0: return mix(C['stone'][0], K, .35)
        return C['stone'][1] if (x + off)//8 % 3 else mix(C['stone'][1], C['stone'][0], .5)
    def chapel():
        def d():
            # nave: long roofed hall running north, front gable faces south toward you
            fx0, fx1, fy = 70, 128, 116        # front wall bottom edge at y=116
            for y in range(40, fy-30):         # the roof running back (north), two slopes, holes in it
                for x in range(fx0+2, fx1-2):
                    mid = (fx0+fx1)//2
                    c = C['roof'][2] if x < mid else C['roof'][1]
                    if (y + (x % 6)) % 6 == 0: c = C['roof'][0]                 # slate rows
                    if x in (fx0+2, fx1-3) or x == mid: c = K
                    if (x-108)**2 + (y-58)**2 < 30 or (x-84)**2/16 + (y-70)**2/9 < 4:  # holes: ruined roof
                        c = K if (x-108)**2 + (y-58)**2 > 22 and (x-84)**2/16 + (y-70)**2/9 > 3 else mix(C['ground'][0], K, .5)
                    px(x, y, c)
            for y in range(fy-30, fy+1):       # front wall with a gable on top
                for x in range(fx0, fx1+1):
                    gy = fy-30; mid = (fx0+fx1)/2
                    c = K if x in (fx0, fx1) or y == fy else brick(x, y)
                    if y < fy-22 and (x-fx0) < 8: c = C['stone'][2]
                    px(x, y, c)
            mid = (fx0+fx1)//2
            for j in range(24):                # gable triangle above the front wall
                half = (fx1-fx0)//2 - j*((fx1-fx0)//2)//24
                for x in range(mid-half, mid+half+1):
                    y = fy-30-j
                    px(x, y, K if x in (mid-half, mid+half) else C['stone'][1] if (x+j) % 9 else C['stone'][0])
            for y in range(fy-20, fy+1):       # arched door (the way into Dungeon 1)
                for x in range(mid-7, mid+8):
                    if y > fy-14 or (x-mid)**2 + (y-(fy-14))**2 < 49:
                        edge = (x in (mid-7, mid+7)) or (x-mid)**2 + (y-(fy-14))**2 > 36 and y <= fy-14
                        px(x, y, K if edge else (40, 28, 22) if x < mid else (54, 38, 28))
            for y in range(fy-45, fy-34):      # round window in the gable (dark: broken)
                for x in range(mid-5, mid+6):
                    q = (x-mid)**2 + (y-(fy-40))**2
                    if q < 30: px(x, y, K if q > 18 or x == mid or y == fy-40 else (30, 26, 34))
            for x in range(fx0+4, fx1-3, 4):   # rubble at the wall foot, ivy up the corner
                px(x, fy+1, C['stone'][0]); px(x+1, fy+2, C['stone'][1])
            for y in range(fy-26, fy): px(fx1-1 - (y % 3 == 0), y, C['ivy'])
            # steeple: a square tower on the front left, whole, with a pointed spire and one lit window
            sx0, sx1 = 52, 72
            for y in range(28, fy+1):
                for x in range(sx0, sx1+1):
                    c = K if x in (sx0, sx1) or y == fy else mix(brick(x, y), C['stone'][2], .45) if x < sx0+4 else brick(x, y)
                    px(x, y, c)
            for j in range(44):                # spire
                half = 11 - j//4
                for x in range(62-half, 62+half+1):
                    px(x, 28-j, K if x in (62-half, 62+half) else C['roof'][2] if x < 62 else C['roof'][1])
            for y in range(36, 48):            # the lit window (the breadcrumb you see from Wolfwood)
                for x in range(58, 67):
                    if y > 40 or (x-62)**2 + (y-40)**2 < 18:
                        px(x, y, K if x in (58, 66) or y == 47 or ((x-62)**2 + (y-40)**2 > 12 and y <= 40) else C['window'])
            lights.append((62, 42, 30, .8))
            for y in range(70, 80):            # the empty bell opening below it (the bell has fallen)
                for x in range(58, 67): px(x, y, K if x in (58, 66) else (20, 18, 24))
        things.append((116, d))

    def bell(cx, by):                          # the cracked bell lying on its side in the cloister
        def d():
            for j in range(-8, 9):             # bell seen side-on, mouth facing right
                for i in range(0, 20):
                    flare = 4 + i*i//28
                    if abs(j) <= flare and i < 19:
                        edge = abs(j) == flare or i == 0
                        c = K if edge else (150, 124, 70) if j < -flare//3 else (110, 88, 50) if j < flare//3 else (78, 62, 38)
                        px(cx+i, by+j, c)
            for i in range(19, 21):
                for j in range(-9, 10): px(cx+i, by+j, K)
            for (i, j) in [(6, -3), (7, -2), (8, -2), (9, -1), (10, 0), (11, 0), (12, 1)]: px(cx+i, by+j, K)  # the crack
            for i in range(-3, 1): px(cx+i, by, K); px(cx+i, by-1, (110, 88, 50))     # crown loop
            for i in range(14, 22): px(cx+i, by+9, C['stone'][0])                    # dug earth at the lip
            px(cx+21, by+8, (180, 150, 60))                                           # a glint: the chest under it
        things.append((by+9, d))

    def candle(x, y, n=3):
        def d():
            for k in range(n):
                cx = x + k*3 - n; h = 3 + (k*7 + x) % 3
                for j in range(h): px(cx, y-j, (220, 210, 180))
                px(cx, y-h, C['window']); px(cx, y-h-1, (255, 240, 200))
            lights.append((x, y-3, 14, .55))
        things.append((y, d))

    def ash_circle(cx, cy, r):
        for y in range(cy-r, cy+r+1):
            for x in range(cx-int(r*1.4), cx+int(r*1.4)+1):
                q = ((x-cx)/(r*1.4))**2 + ((y-cy)/r)**2
                if .78 < q < 1: px(x, y, (178, 172, 160) if (x+y) % 3 else C['ash'])
                elif q < .78 and rnd.random() < .25: px(x, y, C['ash'])

    def robed(x, y, kind, face=1):
        """Hooded cultist, about 16 x 22 (a little smaller than the player's 20 x 24)."""
        def d():
            col = R[kind]; hi = mix(col, (220, 210, 200), .25); lo = mix(col, K, .45)
            for j in range(22):
                for i in range(16):
                    hx = i - 8
                    hood = (hx/4.4)**2 + ((j-5)/5.2)**2 < 1
                    body = 8 <= j <= 21 and abs(hx) <= 3 + (j-8)//3
                    if not (hood or body): continue
                    ehood = (hx/4.4)**2 + ((j-5)/5.2)**2 > .72 and not (body and j > 8)
                    ebody = body and (abs(hx) == 3 + (j-8)//3 or j == 21) and not hood
                    if ehood or ebody: c = K
                    elif hood and (hx/2.6)**2 + ((j-6)/2.8)**2 < 1: c = (16, 12, 14)        # shadowed face
                    elif hx < -1: c = hi
                    elif hx > 1: c = lo
                    else: c = col
                    px(x+i, y+j, c)
            px(x+7, y+6, (230, 80, 50)); px(x+9, y+6, (230, 80, 50))                         # eyes in the hood
            for i in range(5, 12): px(x+i, y+13, mix(col, K, .6))                            # rope belt
            if kind == 'zealot':               # a sickle
                for (i, j) in [(13, 16), (14, 15), (14, 14), (15, 13), (15, 12), (14, 11), (13, 11)]: px(x+i, y+j, (150, 150, 160))
                px(x+13, y+17, (90, 64, 40)); px(x+12, y+18, (90, 64, 40))
            if kind == 'ashcaller':            # an ember held up in one hand
                px(x+2, y+10, (255, 150, 60)); px(x+2, y+9, (255, 220, 140)); px(x+1, y+10, (200, 80, 40))
                lights.append((x+2, y+10, 10, .5))
            if kind == 'chanter':              # a swinging censer on a chain, smoke rising
                for j in range(12, 17): px(x+14, y+j, (120, 116, 110))
                for (i, j) in [(13, 17), (14, 17), (15, 17), (13, 18), (14, 18), (15, 18)]: px(x+i, y+j, (150, 120, 60))
                px(x+14, y+19, K)
                lights.append((x+14, y+18, 8, .35))
        things.append((y+21, d))

    def wisp(x, y):                            # ash wisp: a floating candle flame with a smoky tail
        def d():
            for j in range(10):
                for i in range(-4, 5):
                    q = (i/(4-j*.3+.01))**2 + ((j-6)/4)**2
                    if j < 6 and abs(i) <= max(0, (j+1)//2) or j >= 6 and q < 1:
                        c = (255, 250, 220) if abs(i) < 1 and j > 3 else C['window'] if abs(i) <= 1 else C['warm']
                        px(x+i, y+j, c)
            for j in range(10, 16): px(x + (1 if j % 2 else 0), y+j, mix(C['smoke'], K, .3))       # tail
            lights.append((x, y+6, 16, .5))
        things.append((y+30, d))

    def shrine(x, y):                          # pilgrims' wayside shrine: little roofed post with candles
        def d():
            for j in range(18):                # post
                for i in range(4): px(x+i, y-j, K if i in (0, 3) else C['stone'][1])
            for j in range(9):                 # small stone box with a dark niche
                for i in range(-4, 8):
                    yy = y-18-j
                    c = K if i in (-4, 7) or j in (0, 8) else (24, 20, 26) if 0 <= i <= 3 and 2 <= j <= 6 else C['stone'][2] if i < 0 else C['stone'][1]
                    px(x+i, yy, c)
            for j in range(5):                 # little pitched roof
                for i in range(-6+j, 10-j): px(x+i, y-27-j, K if i in (-6+j, 9-j) or j == 0 else C['roof'][2])
            px(x+1, y-21, C['window']); px(x+2, y-21, C['window']); px(x+1, y-22, (255, 240, 200))   # candle in the niche
            lights.append((x+2, y-21, 12, .6))
        things.append((y, d))
        candle(x-6, y+2, 3); candle(x+10, y+3, 2)

    def banner(x, y):   # y = the wall top it hangs from                          # cult banner nailed over the wall: grey cloth, ash-black sigil
        def d():
            for i in range(-1, 10): px(x+i, y-1, (90, 64, 40))      # the pole it hangs from
            for j in range(16):
                for i in range(8):
                    if j > 12 and 2 < i < 5 + (j-13)//2 - (j-13)//2: continue   # swallowtail cut
                    if j > 12 and i in (3, 4): continue
                    c = K if i in (0, 7) or j == 15 or (j > 12 and i in (2, 5)) else (52, 40, 44) if i < 4 else (40, 30, 34)
                    if (i-3.5)**2 + (j-6)**2 < 5 and (i-3.5)**2 + (j-6)**2 > 1.5: c = (170, 40, 34)   # a red ring sigil
                    px(x+i, y+j, c)
        things.append((WALL_Y+1, d))

    def fir(cx, by, h, v):
        def d():
            tw = max(3, h//14)
            for y in range(by-6, by+1):
                for x in range(cx-tw//2-1, cx+tw//2+2):
                    px(x, y, K if x in (cx-tw//2-1, cx+tw//2+1) or y == by else C['bark'])
            top = by-h; tiers = 4 + h//30; rows = {}
            for y in range(top, by-4):
                t = (y-top)/(by-4-top); ft = t*tiers - int(t*tiers)
                rows[y] = int(2 + t*h*0.30*(0.55 + 0.45*ft)) + v.randint(0, 1)
            for y, half in rows.items():
                for x in range(cx-half, cx+half+1):
                    rel = (x-cx)/(half+.01); up = rows.get(y-1, -1)
                    c = K if x in (cx-half, cx+half) or abs(x-cx) > up else C['fir'][3] if rel < -.45 else C['fir'][2] if rel < .05 else C['fir'][1] if rel < .55 else C['fir'][0]
                    px(x, y, c)
        things.append((by, d))

    def player(x, y):                          # rags figure at true size so everything else reads to scale
        def d():
            for j in range(-1, 25):
                for i in range(-1, 21):
                    hx, hy = i-10, j
                    if (hx/4.6)**2+((hy-4)/4.8)**2 < 1 or (7 <= hy <= 22 and abs(hx) <= 4+(hy-8)//4) or (21 < hy <= 24 and -3 <= hx <= 3): px(x+i, y+j, K)
            for j in range(24):
                for i in range(20):
                    hx, hy = i-10, j
                    if (hx/3.6)**2 + ((hy-4)/3.8)**2 < 1: c = (217, 167, 124) if hy > 3 else (60, 44, 32)
                    elif 8 <= hy <= 21 and abs(hx) <= 3 + (hy-8)//4: c = (74, 59, 51) if hx < 1 else (58, 46, 40)
                    elif 21 < hy <= 23 and hx in (-2, -1, 1, 2): c = (58, 46, 40)
                    else: continue
                    px(x+i, y+j, c)
            for (i, j) in [(15, 10), (16, 9), (17, 8), (18, 7)]: px(x+i, y+j, (110, 74, 42))
        things.append((y+23, d))

    def herb(x, y, r):                         # overgrown herb-garden bush
        def d():
            for j in range(-r, r+1):
                for i in range(-r-1, r+2):
                    q = (i/(r+1))**2 + (j/r)**2 + .12*math.sin(i*2.1+j*1.7)
                    if q < 1:
                        c = K if q > .78 else C['grass'][1] if (i < 0 and j < 0) else C['grass'][0]
                        if (i*5 + j*3) % 9 == 0 and q < .6: c = (150, 120, 170)       # a few pale flowers
                        px(x+i, y+j, c)
        things.append((y+r, d))
    def stump_pillar(x, y):                    # a broken column at the old garden edge
        def d():
            for j in range(11):
                for i in range(6):
                    yy = y-j; top = j == 10 - (i % 3)
                    if j > 10 - (i % 3): continue
                    px(x+i, yy, K if i in (0, 5) or j == 0 or top else C['stone'][2] if i < 2 else C['stone'][1])
            px(x+7, y, C['stone'][1]); px(x+8, y-1, C['stone'][0])                    # rubble at its foot
        things.append((y, d))

    # --- placement (identical in every take)
    for (hx, hy, hr) in [(18, 100, 5), (30, 112, 4), (14, 124, 4), (36, 94, 3), (24, 138, 5)]: herb(hx, hy, hr)
    stump_pillar(40, 132); stump_pillar(120, 168)
    ash_circle(60, 196, 16)
    chapel()
    wall_v(134, 60, 128)                       # cloister west wall, with an arch gap
    wall_h(134, 192, 64, 6)                    # cloister north wall
    wall_h(140, 192, 128, 6)                   # cloister south wall
    bell(152, 98)
    wall_h(0, GAP[0], WALL_Y); wall_h(GAP[1], W, WALL_Y)        # the grounds' south wall, gap for the road
    wall_v(0, 30, WALL_Y-8, 6)
    banner(30, WALL_Y-6); banner(150, WALL_Y-6)
    candle(GAP[0]-4, WALL_Y+4, 3); candle(GAP[1]+4, WALL_Y+4, 3)
    candle(88, 120, 3); candle(110, 120, 2)    # by the chapel door
    candle(36, 200, 2); candle(84, 204, 3)     # round the ash circle
    robed(44, 176, 'zealot', 1); robed(64, 172, 'ashcaller', -1); robed(54, 190, 'chanter', 1)
    wisp(156, 168)
    shrine(140, 288)
    fv = random.Random(3)
    for (x, y, h) in [(14, 300, 70), (46, 330, 66), (8, 370, 74), (180, 330, 70), (160, 378, 60), (186, 266, 64), (40, 270, 52)]:
        if abs(x-road_x(y)) > 16: fir(x, y, h, fv)
    player(int(road_x(340))-10, 330)
    for _, d in sorted(things, key=lambda t: t[0]): d()

    # --- light pass: tint, darker to the north, candle pools, smoke bands, take extras
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    tint = np.array(C['tint'], np.float32)
    img = img*(1-T['tintAmt']) + img*(tint/255.)*T['tintAmt']*1.6
    img *= (1 - T['dark']*np.clip((260-yy)/260, 0, 1))[..., None] * (1 - .15*np.clip((yy-250)/130, 0, 1))[..., None]
    warm = np.zeros((H, W), np.float32)
    for (lx, ly, r, s) in lights:
        warm += np.clip(1 - np.hypot(xx-lx, (yy-ly)*1.3)/r, 0, 1)**1.6 * s
    warm = np.clip(warm, 0, 1.2)
    img = img + warm[..., None]*np.array(C['warm'], np.float32)*T['warmA']*.8 + img*warm[..., None]*.9
    smoke = np.zeros((H, W), np.float32)       # grey smoke drifting low instead of fog
    for (sy, amp) in [(150, 1.0), (206, .9), (250, .7), (110, .5)]:
        smoke += np.exp(-((yy-sy-4*np.sin(xx/17+sy))/6)**2)*amp*(0.5+0.5*np.sin(xx/11+sy*.3))
    for (cx, cy) in [(68, 186), (152, 160)]:   # rising smoke above the censer and the wisp
        smoke += np.exp(-((xx-cx-3*np.sin(yy/7))/3)**2) * np.clip((cy-yy)/40, 0, 1) * np.clip(1-(cy-yy)/90, 0, 1)
    a = np.clip(smoke*T['smokeA'], 0, .6)[..., None]
    img = img*(1-a) + np.array(C['smoke'], np.float32)*a
    vig = np.clip(1 - ((xx-W/2)/(W*.75))**2 - ((yy-H/2)/(H*.9))**2, .55, 1)
    img *= vig[..., None]
    r2 = random.Random(11)
    if T['extra'] == 'ash':
        for _ in range(110):
            x, y = r2.randrange(W), r2.randrange(H); img[y, x] = hexc('#cfc8c0') if r2.random() < .8 else hexc('#ff7a3a')
    if T['extra'] == 'stars':
        for _ in range(30):
            x, y = r2.randrange(W), r2.randrange(60)
            if img[y, x].sum() < 150: img[y, x] = hexc('#c8d8ff')
    if T['extra'] == 'motes':
        for _ in range(50):
            x, y = r2.randrange(W), r2.randrange(H); img[y, x] = hexc('#d8e890')
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((W*S, H*S), Image.NEAREST)
    out.save(f'out/chapel_take_{key}.png')

if __name__ == '__main__':
    import os; os.makedirs('out', exist_ok=True)
    for k in TAKES: make(k)
    print('ok')

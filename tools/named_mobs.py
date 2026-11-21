# Draft sprites for Zone 1's named, round 2 (character chat, Nov 21; owner: bigger, shaggier, 'more spicy').
# Old Gnawbone is grown from his current grid (same rat, longer and deeper, shaggy back, belly fringe, a bone in his teeth,
# a rusty trap jaw on his tail). Greyfang is redrawn by hand (ruff, dark saddle, snarl, two hunters' arrows, scars).
# Run: python3 tools/named_mobs.py -> writes d_gnaw2*.png and d_grey3*.png; grids move into sprites.js once the owner OKs them. Reads the CURRENT Gnawbone from sprites.js, so run it before his new grid goes in.
import os,sys,json,subprocess; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from undead_mobs import outline,img
NP=dict(k='#0b0a0f',A='#7a665a',a='#56463d',d='#352a24',p='#b07a76',P='#8a5a56',S='#a87a72',Y='#ecd890',e='#ff2a20',w='#ece4d0',W='#a89e88',c='#8a8a92',C='#8a5232')
SPRITES=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','js','data','sprites.js')
old=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8').replace(/const /g,'var ')+';console.log(JSON.stringify([SPR.gnaw,SPR.gnawstep]))')",SPRITES]))
def fill(rows): return [r.replace('k','.') for r in rows]
def grow(rows):
    rows=[list(r) for r in fill(rows)]
    # longer body: repeat columns 12 and 16 (mid back), taller: repeat rows 8 and 10 (mid body)
    for x in (16,12,12):
        for r in rows: r.insert(x,r[x])
    for y in (10,8):
        rows.insert(y,rows[y][:])
    pad=[['.']*len(rows[0]) for _ in range(2)]
    rows=pad+rows
    W=len(rows[0]);rows=[['.']*5+r+['.']*6 for r in rows];W+=11
    return rows
def dress(rows,step=False):
    H=len(rows);W=len(rows[0])
    top=[next((y for y in range(H) if rows[y][x]!='.'),None) for x in range(W)]
    # shaggy back: spiky tufts every 2 pixels along the top edge of the body (not the head/ears)
    for x in range(6,26):
        t=top[x]
        if t is not None and t>0 and x%2==0: rows[t-1][x]='A'
        if t is not None and t>1 and x%4==0: rows[t-2][x]='A'
    # shaggy belly fringe: jagged dark tufts hanging under the belly (skip the legs)
    for x in range(5,30):
        col=[y for y in range(H) if rows[y][x]!='.']
        if not col: continue
        b=max(col)
        if rows[b][x] in 'ad' and x%2==1 and b+1<H and b<H-3: rows[b+1][x]='d'
    return rows
def finish(rows):
    return [''.join(r) for r in rows]
G=dress(grow(old[0]));GS=dress(grow(old[1]))
def find(rows,ch):
    return [(x,y) for y,r in enumerate(rows) for x,c in enumerate(r) if c==ch]
for R in (G,GS):
    # the bone he gnaws: across his teeth, sticking out both sides of the mouth
    ys=[y for x,y in find(R,'Y')]; y=min(ys); xs=[x for x,yy in find(R,'Y')]; x0=min(xs)
    y+=1
    for i,c in enumerate('wwwwwwww'):
        X=x0-3+i
        if X<len(R[0]): R[y][X]=c
    for X in (x0-3,x0+4): R[y-1][X]='w';R[y+1][X]='W'  # knobbed ends, so it reads as a bone
    # a rusty trap's jaw clamped on his tail
    ps=sorted(find(R,'P'),key=lambda p:p[1]); x,y=ps[len(ps)//2]
    lx,ly=min(find(R,'P'))
    for dx,dy in ((-1,0),(-2,1),(-3,1),(-4,2),(-5,2)): R[ly+dy][lx+dx]='P'  # a longer tail
    R[y][x]='c';R[y-1][x]='C';R[y+1][x]='c'
    if x+1<len(R[0]) and R[y][x+1]=='.': R[y][x+1]='C'
GNAW2=finish(G);GNAW2S=finish(GS)
GP=dict(k='#0b0a0f',A='#dfe3e8',a='#aeb4be',d='#6c7280',D='#4e5360',m='#9fe8ff',w='#f4efe2',e='#9fe8ff',S='#d89a9a',s='#6e4a2a',f='#e8e0cc',r='#7a1a22')
def fix(rows):
    w=max(len(r) for r in rows);return [r.ljust(w,'.') for r in rows]
G3=fix([
"...........................A...A....",
".........f.....f..........AA..AA....",
".........s.....s.........AAa.AAa....",
"..........s.A.As.A.A.A..AAaaAaaaA...",
"........AAsAAAAsAAAAAAAAAAaaaaaaaA..",
"......AAdddddddddddddAAAAAaaaaamaaA.",
".....AadddddddddddddAAAAAAaaaaaaaaaK",
"..A.AaaaddddddddddaAAAAAAAaaaawrwrw.",
".AAAaaaaSaaaaaaaaaaAAAAAAAAadrrrrr..",
".AaAaaaaaSaaaaaaaaaAAAAAAAAaawwww...",
"AAaAaaaaaaSaaaaaaaAAAAAAAAddd.......",
"AaaAaddaaaaaaaaaadAAAAAAAd..........",
"Aa.Aad.ddddddddddA.A.A.A............",
".a..d.d.d.d.d.ddd.d.................",
])
LEGS=["......aa..DD.......aa..DD...","......aa..DD.......aa..DD...","......aa..DD.......aa..DD...","......aa..DD.......aa..DD...",".....aaa.DDD......aaa.DDD..."]
STEP=[".......aa.DD......aa...DD...","......aa...DD....aa.....DD..",".....aa.....DD...aa.....DD..",".....aa.....DD..aa.......DD.","....aaa.....DDD.aaa......DDD"]
G3S=fix(G3+STEP);G3=fix(G3+LEGS)
if __name__=='__main__':
    for n,r,pal in (('gnaw2',GNAW2,NP),('gnaw2step',GNAW2S,NP),('grey3',G3,GP),('grey3step',G3S,GP)):
        o=outline(r);img(o,pal,1).save(f'd_{n}.png');print(n,len(o[0]),len(o))

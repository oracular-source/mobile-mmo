# Warrior main-attack options (character lane, Nov 27): owner says the chop ending with the blade straight down
# reads like stabbing down. Three replacements, each [wind-up, strike], same body as chop_2. Fill-only grids.
# Run: python3 tools/warrior_swing_draft.py -> art/drafts/warrior-swing-draft1.png and .gif
import os,sys;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw
import warrior_draft as W
BODY=[  # chop_2's body, columns 0-10 (shield, torso, legs); the sword arm is drawn per option
"...........","...........",".....hhhh..","...RRRRRRR.","..R.sesses.","....ssssss.",".....ssss..","......ss...",
"..ooonnnNN.",".oOooinnNN.",".oOIoinnNN.",".oOooiyyyy.","..ooonnnNd.","....HnNnNd.",
"....ww.ww..","....ww.ww..","....ww.ww..","....OO.OO.."]
def pose(marks,w=20):
    g=[list(r.ljust(w,'.')) for r in BODY]
    for (y,x,c) in marks: g[y][x]=c
    return [''.join(r) for r in g]
def line(pts,c='l'):return [(y,x,c) for y,x in pts]
O={}
# A: forward slash. Sword raised over the shoulder (today's wind-up), then cut forward, ending ~25 degrees below level.
O['A']=('Forward slash',W.F['chop_1'],pose(
 [(8,10,'s'),(9,10,'s'),(9,11,'S'),(9,12,'S'),(8,13,'y'),(9,13,'y'),(10,13,'y'),(9,14,'L')]+line([(10,15),(10,16),(11,17),(11,18),(12,19)])))
# B: angled chop. Same wind-up, the blade stops at 45 degrees out in front instead of pointing at the ground.
O['B']=('Angled chop',W.F['chop_1'],pose(
 [(8,10,'s'),(9,10,'s'),(9,11,'S'),(9,12,'S'),(8,12,'y'),(10,13,'y'),(9,13,'y'),(10,14,'L')]+line([(11,15),(12,16),(13,17),(14,18)])))
# C: rising sweep. Sword drawn back low behind the hip, then swept up and out, ending raised in front (~40 degrees up).
O['C']=('Rising sweep',pose(
 [(9,10,'s'),(10,10,'s'),(11,10,'S'),(11,9,'S'),(12,10,'y'),(10,9,'y'),(12,11,'L')]+line([(13,12),(13,13),(14,14)]),w=20),pose(
 [(8,10,'s'),(8,11,'s'),(8,12,'S'),(8,13,'S'),(9,13,'y'),(7,14,'y'),(8,14,'y'),(7,15,'L')]+line([(6,15),(5,16),(4,17),(3,17),(2,18)])))
def img(rows,S):
    rows=W.outline(rows);h=len(rows);w=max(len(r) for r in rows);im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            col=W.PAL.get(c)
            if col: im.putpixel((x,y),tuple(int(col[i:i+2],16) for i in (1,3,5))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)
if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    BG=(44,52,34);rows=[('Today (reads as stabbing down)',W.F['chop_1'],W.F['chop_2'])]+[(f'{k}: {v[0]}',v[1],v[2]) for k,v in O.items()]
    S=7;cw=24*S;rh=22*S+30;sh=Image.new('RGB',(3*cw+20,len(rows)*rh+10),BG);d=ImageDraw.Draw(sh)
    for n,(lab,a,b) in enumerate(rows):
        y=10+n*rh;d.text((10,y),lab,fill=(255,179,71))
        for i,f in enumerate((W.F['idle'],a,b)):
            im=img(f,S);ax=0 if f is W.F['idle'] else 0
            sh.paste(im,(10+i*cw,y+20+20*S-im.height),im)
    sh.save('art/drafts/warrior-swing-draft1.png')
    # loop: each option swings twice, side by side, game timing (wind-up short, strike held)
    S=6;cw=24*S;ch=22*S+24
    def fr(k):
        f=Image.new('RGB',(4*cw,ch),BG);dd=ImageDraw.Draw(f)
        for n,(lab,a,b) in enumerate(rows):
            g={'i':W.F['idle'],'a':a,'b':b}[k];im=img(g,S);f.paste(im,(n*cw+6,ch-im.height-4),im)
            dd.text((n*cw+6,4),['Today','A','B','C'][n],fill=(235,225,200))
        return f
    seq=[('i',500),('a',180),('b',320),('i',350),('a',180),('b',320),('i',600)]
    fs=[fr(k) for k,_ in seq];fs[0].save('art/drafts/warrior-swing-draft1.gif',save_all=True,append_images=fs[1:],duration=[t for _,t in seq],loop=0)

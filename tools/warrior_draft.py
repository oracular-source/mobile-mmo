# Warrior redraw + attack frames, draft 1 (character lane, Nov 27). Fill-only grids; outline() adds the black edge.
# Run: python3 tools/warrior_draft.py -> art/drafts/warrior-draft1.png and warrior-draft1.gif
import os,sys;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw
import player_rags as P
def outline(rows):
    w=max(len(r) for r in rows)+2
    g=[list('.'*w)]+[list('.'+r.ljust(w-2,'.')+'.') for r in rows]+[list('.'*w)]
    out=[r[:] for r in g]
    for y in range(len(g)):
        for x in range(w):
            if g[y][x]=='.':
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    X,Y=x+dx,y+dy
                    if 0<=X<w and 0<=Y<len(g) and g[Y][X]!='.':out[y][x]='k';break
    return [''.join(r) for r in out]
PAL=dict(P.COMMON);PAL.update({'H':'#86605a','n':'#6e4844','N':'#563332','d':'#452526','h':'#6e4a2a','R':'#a32a34',
  'o':'#8a6238','O':'#5e4024','I':'#a8acb8','i':'#0b0a0f','l':'#c4c8cc','L':'#8a8e96','y':'#9c8a5a'})
F={}
F['idle']=[
"....hhhh...l.",
"..RRRRRRR..l.",
".R.sesses..L.",
"...ssssss..l.",
"....ssss...l.",
".....ss....l.",
".ooonnnNNsyyy",
"oOooinnNNsSS.",
"oOIoinnNNx.y.",
"oOooiyyyy....",
".ooonnnNd....",
"...HnNnNd....",
"....ww.ww....",
"....ww.ww....",
"....ww.ww....",
"....OO.OO....",
]
def step(rows,side):
    r=[list(x) for x in rows];c=(4,5) if side==0 else (7,8)
    for x in c: r[-4][x],r[-3][x],r[-2][x],r[-1][x]=r[-3][x],r[-2][x],r[-1][x],'.'
    return [''.join(x) for x in r]
F['walk_a']=step(F['idle'],0);F['walk_b']=step(F['idle'],1)
# Stab: draw back (sword low at the hip, point forward), then lunge and thrust.
F['stab_1']=[
"....hhhh.......",
"..RRRRRRR......",
".R.sesses......",
"...ssssss......",
"....ssss.......",
".....ss........",
".ooonnnNNs.....",
"oOooinnNNsy....",
"oOIoinnNNSyLlll",
"oOooiyyyy.y....",
".ooonnnNd......",
"...HnNnNd......",
"....ww.ww......",
"....ww.ww......",
"....ww.ww......",
"....OO.OO......",
]
F['stab_2']=[
".....hhhh..........",
"..RRRRRRRR.........",
".RR.sesses.........",
"....ssssss.........",
".....ssss..........",
"......ss...........",
"..ooonnnNNs...y....",
".oOooinnNNssSSyLlll",
".oOIoinnNN....y....",
".oOooiyyyy.........",
"..ooonnnNd.........",
"....HnNnNd.........",
"....ww..ww.........",
"...ww...ww.........",
"...ww....ww........",
"..OO.....OO........",
]
# Chop (auto attack): sword up over the shoulder, then down and forward. Two extra rows on top for the raised blade.
F['chop_1']=[
"..........l..",
".........lL..",
"....hhhh.l...",
"..RRRRRRyl...",
".R.sesseSy...",
"...ssssssS...",
"....ssss.s...",
".....ss..s...",
".ooonnnNNs...",
"oOooinnNN....",
"oOIoinnNN....",
"oOooiyyyy....",
".ooonnnNd....",
"...HnNnNd....",
"....ww.ww....",
"....ww.ww....",
"....ww.ww....",
"....OO.OO....",
]
F['chop_2']=[
"...............",
"...............",
".....hhhh......",
"...RRRRRRR.....",
"..R.sesses.....",
"....ssssss.....",
".....ssss......",
"......ss.......",
"..ooonnnNNs....",
".oOooinnNNsSSy.",
".oOIoinnNN..yL.",
".oOooiyyyy...l.",
"..ooonnnNd....l",
"....HnNnNd....l",
"....ww.ww......",
"....ww.ww......",
"....ww.ww......",
"....OO.OO......",
]
def img(rows,S):
    rows=outline(rows);h=len(rows);w=len(rows[0]);im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c in PAL: im.putpixel((x,y),tuple(int(PAL[c][i:i+2],16) for i in (1,3,5))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)
if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    S=10;BG=(52,62,40,255)
    labels=[('Today',None),('New: standing','idle'),('Walk','walk_a'),('Walk','walk_b'),('Stab 1: draw back','stab_1'),('Stab 2: thrust','stab_2'),('Chop 1: raise','chop_1'),('Chop 2: swing','chop_2')]
    cells=[]
    for lab,k in labels:
        if k is None: r,p=P.get('warrior');im=P.img(r,p,S)
        else: im=img(F[k],S)
        cells.append((lab,im))
    W=sum(im.width for _,im in cells)+30*len(cells)+20;H=22*S+70
    sh=Image.new('RGBA',(W,H),BG);d=ImageDraw.Draw(sh);x=20
    for lab,im in cells:
        sh.alpha_composite(im,(x,H-50-im.height));d.text((x,H-40),lab,fill=(235,225,200));x+=im.width+30
    sh.save('art/drafts/warrior-draft1.png')
    # GIF at about phone zoom: stand, stab, stand, chop, walk
    seq=[('idle',6),('stab_1',3),('stab_2',5),('idle',6),('chop_1',3),('chop_2',5),('idle',6),('walk_a',3),('idle',3),('walk_b',3),('idle',3)]
    S2=8;fw,fh=24*S2,22*S2;frames=[]
    for k,n in seq:
        f=Image.new('RGBA',(fw,fh),BG);im=img(F[k],S2);f.alpha_composite(im,(4*S2,fh-im.height-S2))
        if k=='stab_2':  # effect kit would draw this: a pale streak along the thrust
            dd=ImageDraw.Draw(f);y=fh-S2-im.height+8*S2+S2//2;dd.line([(16*S2,y),(23*S2,y)],fill=(255,245,220,160),width=S2//2)
        if k=='chop_2':
            dd=ImageDraw.Draw(f);dd.arc([(9*S2,4*S2),(21*S2,18*S2)],-70,40,fill=(255,245,220,170),width=S2//2)
        frames+= [f.convert('RGB')]*n
    frames[0].save('art/drafts/warrior-draft1.gif',save_all=True,append_images=frames[1:],duration=50,loop=0)

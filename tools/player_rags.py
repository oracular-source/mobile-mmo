# Player base look (rags, tier 0), drawn natively at 15 x 18 (13 x 16 fill + outline). Character chat, Nov 21, draft 1.
# Fill-only text grids; outline() adds the black edge. Faces front, weapon in the right hand (viewer's right).
# Run from anywhere: python3 tools/player_rags.py  -> art/drafts/players-draft1.png. Grids move into sprites.js once the owner OKs them.
# Keys: H/n/N/d cloth light to dark, y rope belt, w leg wraps, O foot wraps, s skin, S lit skin, e eyes, h hair,
# o wood, l steel, L leaf, W pale, A/a/Q hood light to dark, m glow, R accent, I/i iron, b bone, T band.
from PIL import Image
def outline(rows):
    w=13+2
    g=[list('.'*w)]+[list('.'+r.ljust(13,'.')[:13]+'.') for r in rows]+[list('.'*w)]
    out=[r[:] for r in g]
    for y in range(len(g)):
        for x in range(w):
            if g[y][x]=='.':
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    X,Y=x+dx,y+dy
                    if 0<=X<w and 0<=Y<len(g) and g[Y][X]!='.':
                        out[y][x]='k';break
    return [''.join(r) for r in out]

COMMON={'k':'#0b0a0f','y':'#9c8a5a','w':'#8a7f70','W2':'#000','O':'#4a3b33','S':'#f0c99a','s':'#d9a77c','x':'#b07f5c',
        'e':'#1a1820','o':'#6e4a2a','O2':'#000','l':'#9a9590','L':'#6f9a3e','G':'#4a6a2a','b':'#e4dccb','B':'#a89c84'}

# Shared legs: tunic (trousers, wraps) and robe (hem to the shin, wraps and feet below).
LEG_T=["...ww.ww.....","...ww.ww.....","...OO.OO....."]
def stepT(rows,side):  # lift one foot a pixel: that leg's rows move up, the gap shows under it
    r=[list(x.ljust(13,'.')) for x in rows];c=(3,4) if side==0 else (6,7)
    for x in c: r[-3][x],r[-2][x],r[-1][x]=r[-2][x],r[-1][x],'.'
    return [''.join(x) for x in r]

C={}
# ---------- Druid: crown of leaves, mossy robe, crooked staff budding a leaf. Organic, rounded.
C['druid']=dict(rows=[
"..L.L..L..L..",
"...LhLLhL.Lo.",
"...hhhhhh..o.",
"...hssssh..o.",
"...sesses..o.",
"...ssssss..o.",
"..HHnnnNN..o.",
".HHnnnnnNN.o.",
".Hnnnnnnn NSo",
".sHyyyyyyN.o.",
"..HnnGnnNd.o.",
"..HnnnGNNd.o.",
"..HnnnnNNNdo.",
"..HnNnnNdNd.o",
"...ww.ww....o",
"...OO.OO....o",
], pal={'H':'#6f7558','n':'#566048','N':'#424c36','d':'#323b2a','h':'#7a5232','G':'#4f6e34'})
# ---------- Warrior: red headband with tails, broad padded shoulders, rusty sword up, plank shield in front.
C['warrior']=dict(rows=[
"....hhhh...l.",
"..RRRRRRR..l.",
"...hsssshR.l.",
"...sesses..l.",
"...ssssss..l.",
"....ssss...l.",
".HHHnnnnNNNl.",
"ooHnnnnnnNNyy",
"oOHnnnnnnNNS.",
"lOyyyyyyyyN..",
"Oo.HnnnnNN...",
"oO.HnkNnNd...",
"oo..........",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#86605a','n':'#6e4844','N':'#563332','d':'#452526','h':'#6e4a2a','R':'#a32a34'})
# ---------- Paladin: iron skullcap over gold hair, pale tabard with a gold sun stitch, sword and plank shield.
C['paladin']=dict(rows=[
"....IIII...l.",
"...IIiiII..l.",
"...hhhhhh..l.",
"...sesses..l.",
"...ssssss..l.",
"....ssss...l.",
"..HHWWWWNN.l.",
"ooHnWWYWnNNyy",
"oOHnWYYWnNNS.",
"lOyyyyyyyyN..",
"Oo.HnWWnNN...",
"oO.HnWWnNd...",
"oo...........",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#8e8984','n':'#77736e','N':'#5e5b58','d':'#4a4846','h':'#d4ad3a','I':'#9a9eac','i':'#6c7080','W':'#d8d0bc','Y':'#c9a227'})
# ---------- Shadow Knight: closed pot helm with a glowing red slit, ragged dark half-cape, black-iron sword and shield.
C['shadowknight']=dict(rows=[
"....IIII...l.",
"...IIIIii..l.",
"...IIIIii..l.",
"...kmkkmk..l.",
"...iIIIii..l.",
"....iiii...l.",
"..AHnnnnNN.l.",
"ooAnnnnnnNNyy",
"oOAnnnnnnNNS.",
"oOyyyyyyyyN..",
"OoAaHnnnNN...",
"oOA.aHnNNd...",
"oo.A.a.......",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#5e5852','n':'#48433f','N':'#34302e','d':'#262423','I':'#4e5060','i':'#2e3039','m':'#ff3b30','A':'#3a2028','a':'#2a161c','o':'#3a3442','O':'#26222c','l':'#6c6c78'})
# ---------- Rogue: deep pointed hood, red scarf over the nose, short mantle, dagger forward, off-hand knife.
C['rogue']=dict(rows=[
".....A.......",
"....AAa......",
"...AAaaQ.....",
"...AkkkkQ....",
"...AseseQ....",
"...ARRRRQ....",
"..AAaRRaQQ...",
"..AaannaaQ.l.",
"..HnnnnnNN.l.",
".lHnnnnnNNSy.",
".SyyyyyyyN...",
"..HnnnnnNd...",
"..HnkNnkNd...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#6e6156','n':'#584c43','N':'#433933','d':'#342c27','A':'#3e363c','a':'#2c262a','Q':'#1c181a','R':'#a32a34'})
# ---------- Necromancer: tall hood, black face with violet eyes, robe to the floor with a torn hem, bone-tipped stick.
C['necro']=dict(rows=[
"....A......b.",
"....AA....bb.",
"...AAaa....o.",
"...AkkkkQ..o.",
"...AmkkmQ..o.",
"...AkkkkQ..o.",
"..AAakkaQQ.o.",
"..HnaQQaNN.o.",
".HHnnnbnNNNo.",
".HnnnnnnnNSo.",
".syyyyyyyN.o.",
"..HnnnnnNd.o.",
"..HnnnnNNd.o.",
"..HnnnnNNNdo.",
"..HnNnNNdNd.o",
"..N.d..N.d..o",
"...O...O....o",
][:16], pal={'H':'#5e5452','n':'#494041','N':'#352e31','d':'#282226','A':'#4a423c','a':'#332d29','Q':'#221e1b','m':'#b08ae0'})
# ---------- Ranger: green hood back off the face, quiver over the shoulder, tunic, short bow.
C['ranger']=dict(rows=[
"..o.AAAA..o..",
"..oAAaaaQ.oo.",
"...Assssa.o.o",
"...sesses.o.o",
"...ssssss.o.o",
"..AAssssQQo.o",
"..AHnnnnNQo.o",
".HHnnnnnNNSyo",
".HnnnnyynNo.o",
".syyyyyyyNo.o",
"..HnnnnnNNoo.",
"..HnkNnkNdo..",
"...ww.ww.....",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#6c6c58','n':'#575846','N':'#424536','d':'#34382a','A':'#5e7446','a':'#475832','Q':'#303c22'})
# ---------- Cleric: white linen coif framing the face, wooden sun on a cord, plain robe, knobbed club.
C['cleric']=dict(rows=[
"....WWWW.....",
"...WWWWWW..oo",
"...WsssssW.oO",
"...WseseW..oo",
"...WssssW..o.",
"...WWssWW..o.",
"..HWWWWWWN.o.",
".HHnnYYnNNNo.",
".HnnnYYnnNSo.",
".syyyyyyyN.o.",
"..HnnnnnNd...",
"..HnnnnNNd...",
"..HnnnnNNNd..",
"..HnNnnNdNd..",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#968b7c','n':'#7f766a','N':'#6a6259','d':'#5a544b','W':'#d8d0bc','Y':'#b08a3a'})
# ---------- Enchanter: porcelain mask with violet eyes under a deep purple hood, robe, stick with a glass bead.
C['enchanter']=dict(rows=[
"....AAAA...m.",
"...AAaaaQ..W.",
"...AWWWWQ..o.",
"...WmWWmW..o.",
"...WWWWWW..o.",
"...AWRRWQ..o.",
"..AAaWWaQQ.o.",
".HHnnnnnNNNo.",
".HnnnnnnnNSo.",
".syyyyyyyN.o.",
"..HnnRnnNd.o.",
"..HnnnRNNd.o.",
"..HnnnnNNNdo.",
"..HnNnnNdNd.o",
"...ww.ww....o",
"...OO.OO....o",
], pal={'H':'#776778','n':'#615266','N':'#4c3f54','d':'#3e3349','A':'#5c4a7c','a':'#45336e','Q':'#2e2248','W':'#ece6da','m':'#c09cff','R':'#9a7ac0'})
# ---------- Wizard: wide-brimmed pointed hat bent at the tip, long white beard, grey-blue robe, gnarled stick.
C['wizard']=dict(rows=[
".......AQ....",
"......AaQ....",
".....AaaQ..o.",
"....AaaaaQ.o.",
".AAAAaaaaQQo.",
"...sesses..o.",
"...sWWWWs..o.",
"..HHWWWWNN.o.",
".HHnnWWnNNSo.",
".snnyWWyNN.o.",
"..HnnnnnNd.o.",
"..HnnnnNNd.o.",
"..HnnnnNNNdo.",
"..HnNnnNdNd.o",
"...ww.ww....o",
"...OO.OO....o",
], pal={'H':'#686668','n':'#535155','N':'#3e3e44','d':'#303038','A':'#4e5e86','a':'#3c4a6e','Q':'#2c3858','W':'#d6d0be'})
# ---------- Magician: tall red cone cap with a tassel, collared robe with a red stole, stick with an ember.
C['magician']=dict(rows=[
"......R....m.",
"......RR...y.",
".....RRR...o.",
".....RrRR..o.",
"....RRrRRR.o.",
"...hRRRRRh.o.",
"...hsssssh.o.",
"...sesses..o.",
"...ssssss..o.",
"..HHRsssRN.o.",
".HHnRnnRNNSo.",
".snyRyyRyN.o.",
"..HnRnnRNd.o.",
"..HnnnnNNNdo.",
"...ww.ww....o",
"...OO.OO....o",
], pal={'H':'#88644f','n':'#734f3f','N':'#5e3c2f','d':'#4e3024','R':'#b04a2c','r':'#7e2e1c','h':'#3a2418','m':'#ffb347','y':'#ffe08a'})
# ---------- Shaman: horned hide hood, red war paint across the eyes, bone necklace, fur mantle, bone-tipped spear.
C['shaman']=dict(rows=[
".B.......B.b.",
"..B.AAAA.B.b.",
"...BAaaaB..o.",
"...AssssQ..o.",
"...RReRRe..o.",
"...ssssss..o.",
"..AAbsbsQQ.o.",
".AAaabbaaQQo.",
".HnnnnnnNNSo.",
".syyyyyyyN.o.",
"..HnnnnnNd.o.",
"..HnnnnNNd.o.",
"..HnnnnNNNdo.",
"..HnNnnNdNd.o",
"...ww.ww....o",
"...OO.OO....o",
], pal={'H':'#687269','n':'#535e58','N':'#3e4b47','d':'#303e3c','A':'#8a7056','a':'#6a5440','Q':'#4a3a2c','R':'#b0402e','B':'#d8ccb0','b':'#e4dccb'})
# ---------- Monk: shaved head with a topknot, dark headband with tails, bare arms, sash, wrapped fists.
C['monk']=dict(rows=[
".....hh......",
"...sssssS....",
"..TTTTTTTT...",
"...ssssss....",
"...sesses....",
"...ssssss....",
"....ssss.....",
"..sHnnnnNs...",
".ssHnnnnNss..",
".s.HnnnnN.s..",
".WTTTTTTTTW..",
"...HnnnnNT...",
"...ww.ww.T...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#9a815c','n':'#846c4a','N':'#6c5738','d':'#5e4a2d','T':'#2a2d36','h':'#2a1e16','W':'#d8d0bc'})
# ---------- Bard: plum cap with a gold feather, doublet with puffed sleeves, lute on the back, a knife.
C['bard']=dict(rows=[
"........YY...",
"....AAAAY....",
"...AAaaaAA...",
"...hhhhhh....",
"...sesses....",
"...ssssss....",
"..o.ssss.....",
".ooHnnnnNN...",
"oOoRnnnnRNl..",
"oooHyyyyNNS..",
".o.HnRRnNN...",
"...HnnnnNN...",
"...HnkkNNd...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
], pal={'H':'#8e5e66','n':'#784a55','N':'#623643','d':'#522837','A':'#7a3050','a':'#5a2238','h':'#c9a227','R':'#ffd27a','Y':'#ffd27a','O':'#4a2e1c'})

def img(rows,pal,S=1):
    h=len(rows);w=len(rows[0]);im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c in pal: im.putpixel((x,y),tuple(int(pal[c][i:i+2],16) for i in (1,3,5))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)
ORDER=['druid','warrior','paladin','shadowknight','rogue','necro','ranger','cleric','enchanter','wizard','magician','shaman','monk','bard']
NAMES=['Druid','Warrior','Paladin','Shadow Knight','Rogue','Necromancer','Ranger','Cleric','Enchanter','Wizard','Magician','Shaman','Monk','Bard']
def get(id,frame=None):
    c=C[id];rows=[r.replace(' ','.') for r in c['rows']][:16]
    assert len(rows)==16,(id,len(rows))
    for r in rows: assert len(r)<=13,(id,r,len(r))
    if frame is not None: rows=stepT(rows,frame)
    pal=dict(COMMON);pal.update(c['pal']);return outline(rows),pal

# ---------- Draft sheet: today's shrunk sprites vs the new ones (run from the repo root) ----------
if __name__=='__main__':
    import os,sys; os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')); sys.path.insert(0,'tools')
    import json, subprocess, player_rags as P, player_rags_old as cur
    from PIL import Image, ImageDraw
    src=open('js/data/sprites.js').read()+"\nconsole.log(JSON.stringify({UNDEAD_SPR,UNDEAD_PAL}))"
    open('u.js','w').write(src);U=json.loads(subprocess.check_output(['node','u.js']));os.remove('u.js')
    ids=P.ORDER;S=6;cw=17*S;pad=8
    rows_h=[('Today (shrunk from 20x24)',20*S),('New: drawn at 15x18',20*S),('Walk: left step',20*S),('Walk: right step',20*S),('Silhouette',20*S),('Grayscale',20*S)]
    W=len(ids)*cw+pad*2;H=sum(h+18 for _,h in rows_h)+30+110
    sh=Image.new('RGBA',(W,H),(30,33,28,255));d=ImageDraw.Draw(sh)
    d.text((pad,6),'Player base look (rags), draft 1 - character chat, Nov 21. Shown 6x; game size row at the bottom.',fill=(255,210,122))
    y=26
    for ri,(lab,h) in enumerate(rows_h):
        d.text((pad,y),lab,fill=(200,200,190));y+=14
        for n,id in enumerate(ids):
            x=pad+n*cw
            if ri==0: r,p=cur.build(id);im=cur.img(r,p,S)
            else:
                fr=None if ri in(1,4,5) else ri-2
                r,p=P.get(id,fr);im=P.img(r,p,S)
                if ri==4:
                    a=im.split()[3];im=Image.new('RGBA',im.size,(0,0,0,0));im.paste((12,12,14,255),mask=a)
                if ri==5:
                    a=im.split()[3];g=im.convert('L').convert('RGBA');g.putalpha(a);im=g
            if ri==4: sh.paste((150,150,140,255),(x-2,y-2,x+16*S,y+19*S))
            sh.alpha_composite(im,(x,y))
        y+=h+4
    for n,id in enumerate(ids): d.text((pad+n*cw,y),P.NAMES[n][:13],fill=(220,210,180))
    y+=20
    # game size (3x, roughly phone) on a dark grass strip with a crypt skeleton and the Necro pet for scale
    d.text((pad,y),'At game zoom (3x) on grass, next to the crypt skeleton (16x20) for scale',fill=(200,200,190));y+=14
    sh.paste((52,62,40,255),(pad,y,W-pad,y+70))
    x=pad+6
    for id in ids:
        r,p=P.get(id);sh.alpha_composite(P.img(r,p,3),(x,y+10));x+=17*3+4
    sk=U['UNDEAD_SPR']['skel'];pal=dict(U['UNDEAD_PAL']['skel']);pal.setdefault('k','#0b0a0f')
    sh.alpha_composite(cur.img(sk,pal,3),(x+6,y+4))
    sh.save('art/drafts/players-draft1.png');print(sh.size)

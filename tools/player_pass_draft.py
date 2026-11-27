# Player character pass, draft 2 (character lane, Nov 27): all 14 classes redrawn at 15x18 with attack/cast poses in mind.
# Warrior from warrior_draft.py (owner OK'd draft 1). Fill-only grids; outline() adds the black edge.
# Run: python3 tools/player_pass_draft.py -> art/drafts/players-pass-draft2.png and .gif
import os,sys;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw
import player_rags as P, warrior_draft as W
outline=W.outline
D={}  # id -> dict(pal, idle, act, legs, act_label)
def pal(id,extra=None):
    p=dict(P.COMMON);p.update(P.C[id]['pal']);p.update(extra or {});return p
# ---------- shield-and-sword classes reuse the Warrior's frames with their own head and colours
HEADBOX=dict(idle=(0,0),stab_1=(0,0),stab_2=(0,1),chop_1=(2,0),chop_2=(2,1))
def rehead(frame,head):
    dy,dx=HEADBOX[frame];g=[list(r) for r in W.F[frame]]
    for y in range(6):
        for x in range(9):
            Y,X=y+dy,x+dx
            if X>=len(g[Y]):continue
            if g[Y][X] in 'hRse.':g[Y][X]='.' if X<=8+dx else g[Y][X]
    for y,r in enumerate(head):
        for x,c in enumerate(r):
            Y,X=y+dy,x+dx
            if c!='.' and g[Y][X]=='.':g[Y][X]=c
    return [''.join(r) for r in g]
heads={
'paladin':["....JJJJ.","...JJjjJJ","...hhhhhh","...sesses","...ssssss","....ssss."],
'shadowknight':["....JJJJ.","...JJJJjj","...JJJJjj","...kmkkmk","...jJJJjj","....jjjj."],
}
D['warrior']=dict(pal=dict(W.PAL),idle=W.F['idle'],act=W.F['chop_2'],act2=W.F['stab_2'],lab='chop / stab')
D['paladin']=dict(pal=pal('paladin',{'H':'#e2dccb','n':'#d0c8b2','N':'#9a948a','d':'#7c766e','o':'#c9b48a','O':'#9a845a','I':'#d4ad3a','i':'#0b0a0f','x':'#b07f5c','l':'#d8dce0','L':'#9aa0a8','I2':''}),
  idle=rehead('idle',heads['paladin']),act=rehead('chop_2',heads['paladin']),act2=rehead('stab_2',heads['paladin']),lab='chop / stab')
# Paladin: the cap needs iron, the shield boss gold -> give the head its own letters
D['paladin']['pal'].update({'o':'#8a6238','O':'#5e4024','I':'#d4ad3a','i':'#0b0a0f','J':'#9a9eac','j':'#6c7080'})
for k in('idle','act','act2'):
    D['paladin'][k]=[r.replace('IoiI','IoiI') for r in D['paladin'][k]]
D['shadowknight']=dict(pal=pal('shadowknight',{'o':'#4e5060','O':'#2e3039','I':'#4e5060','i':'#0b0a0f','x':'#3a3442','s':'#5a5462','S':'#6c6c78','l':'#8a8a96','L':'#5a5a66','y':'#5a4a5a'}),
  idle=rehead('idle',heads['shadowknight']),act=rehead('chop_2',heads['shadowknight']),act2=rehead('stab_2',heads['shadowknight']),lab='chop / stab')
# SK helm letters clash with the shield's I/i: helm uses its own (J/j), eye glow m
for k in('idle','act','act2'):
    D['shadowknight'][k]=[r for r in D['shadowknight'][k]]
D['shadowknight']['pal'].update({'m':'#ff3b30','o':'#5a2430','O':'#3a161e','I':'#8a8a96','J':'#4e5060','j':'#2e3039'})
# ---------- Rogue: hood, scarf, dagger up in the right fist, off-hand knife held point-down
D['rogue']=dict(pal=pal('rogue',{'l':'#c4c8cc','y':'#7a6a4a'}),lab='stab',idle=[
".....A.......",
"....AAa......",
"...AAaaQ.....",
"...AkkkkQ....",
"...AseseQ..l.",
"...ARRRRQ..l.",
"..AAaRRaQQyyy",
".AAaannaaQSS.",
".HHnnnnnNN.y.",
".SHnnnnnNN...",
".lyyyyyyyN...",
".lHnnnnnNd...",
"..HnNnnNNd...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
],act=[
"......A..........",
".....AAa.........",
"....AAaaQ........",
"....AkkkkQ.......",
"....AseseQ.......",
"....ARRRRQ.......",
"...AAaRRaQQ......",
"..AAaannaaQHSSyll",
"..HHnnnnnNN......",
"..SHnnnnnNN......",
"..lyyyyyyyN......",
"..lHnnnnnNd......",
"...HnNnnNNd......",
"...ww..ww........",
"..ww...ww........",
"..OO....OO.......",
])
# ---------- Ranger: hood and mantle, bow held by the grip in the right fist, quiver over the left shoulder
D['ranger']=dict(pal=pal('ranger',{'B':'#d8ccb0','W':'#e8e0d0'}),lab='draw',idle=[
"..W.AAAA.....",
"..oAAaaaQ..o.",
"..oAssssa..Bo",
"...sesses..Bo",
"...ssssss..Bo",
"..AAssssQQ.Bo",
"..AHnnnnNQHSS",
".HHnnnnnNNHBo",
".HnnnnyynN.Bo",
".syyyyyyyN.Bo",
"..HnnnnnNN.Bo",
"..HnkNnkNd.o.",
"...ww.ww.....",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
],act=[
"..W.AAAA.......",
"..oAAaaaQ.....o",
"..oAssssa....Bo",
"...sesses...B.o",
"...ssssss..B..o",
"..AAssssQQB...o",
"..AHnnnnNSyyySS",
".HHnnnnnNNB...o",
".HnnnnyynN.B..o",
".syyyyyyyN..B.o",
"..HnnnnnNN...Bo",
"..HnkNnkNd....o",
"...ww.ww.......",
"...ww.ww.......",
"...ww.ww.......",
"...OO.OO.......",
])
# ---------- Monk: bare arms with wrapped fists, dark headband and sash
D['monk']=dict(pal=pal('monk'),lab='punch',idle=[
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
],act=[
"......hh........",
"....sssssS......",
"...TTTTTTTT.....",
"....ssssss......",
"....sesses......",
"....ssssss......",
".....ssss.......",
"...sHnnnnNsssWW.",
"..ssHnnnnN...WW.",  # punch: arm one pixel thick, 2x2 wrapped fist
"..s.HnnnnN......",
"..WTTTTTTTT.....",
"....HnnnnNT.....",
"....ww..ww......",
"...ww...ww.T....",
"...ww....ww.....",
"..OO.....OO.....",
])
# ---------- Bard: feathered cap, lute held across the body (neck up to the left, left hand on the neck, right hand strumming)
D['bard']=dict(pal=pal('bard',{'o':'#b07a3a','Q':'#7a4a1c'}),lab='strum',idle=[
"........YY...",
"....AAAAY....",
"...AAaaaAA...",
"...hhhhhh....",
"...sesses....",
".Q.ssssss....",
"..o.ssss.....",
"..SoHnnnNN...",
"..HnonnnRNN..",
"..HnnoooonNs.",
"..HyyooQoSNs.",
"...HnooooN...",
"...HnnnnNN...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
],act=[
"........YY...",
"....AAAAY....",
"...AAaaaAA...",
"...hhhhhh....",
"...sesses..R.",
".Q.ssssss...R",
"..o.ssss..R..",
"..SoHnnnNN...",
"..HnonnnRNN..",
"..HnnooooSNs.",
"..HyyooQoonN.",
"...HnooooN...",
"...HnnnnNN...",
"...ww.ww.....",
"...ww.ww.....",
"...OO.OO.....",
])
# ---------- Robe casters: one shared robe with a real right sleeve and a fist on the staff; heads and staff tops per class.
ROBE=[
"..HHnnnNNn.o.",
".HHnnnnNdn.o.",
".HnnnnnNdnsS.",
".sHyyyyyyN.o.",
"..HnnnnnNd.o.",
"..HnnnnNNd.o.",
"..HnnnnNNNdo.",
"..HnNnnNdNdo.",
"...ww.ww...o.",
"...OO.OO...o.",
]
def robe(head,deco=None,body=None):
    rows=head+[r for r in (body or ROBE)]
    rows=[list(r.ljust(13,'.')) for r in rows]
    for (y,x,c) in (deco or []): rows[y][x]=c
    return [''.join(r) for r in rows]
def cast(rows,glow='m'):
    # spell cast: the staff arm lifts the staff 3 rows (foot off the ground), the off hand comes up with a glow.
    # Three empty rows go on top so the raised staff isn't cut off (the frame is anchored at the feet).
    g=[list('.'*13) for _ in range(3)]+[list(r.ljust(13,'.')) for r in rows];h=len(g);n=[r[:] for r in g]
    robe='HnNdwOGRrkQAa'   # robe and leg letters stay put; everything else in cols 10-12 is staff and fist
    for y in range(h):
        for x in range(10,13):
            if g[y][x] not in robe: n[y][x]='.'
    for y in range(h):
        for x in range(10,13):
            if g[y][x]!='.' and g[y][x] not in robe and n[y-3][x] in '.': n[y-3][x]=g[y][x]
    fy=next(y for y in range(h) if g[y][11]=='S')-3   # fist row after the lift
    for y in range(fy,12): n[y][9]=n[y][9] if n[y][9]!='.' else 'n'
    n[fy][10]='s'
    top=next(y for y in range(h) if n[y][11]!='.')
    if top>0: n[top-1][11]=glow
    n[12][1]='.';n[11][1]='H';n[10][1]='H';n[10][0]='s';n[9][0]=glow;n[8][0]=glow
    return [''.join(r) for r in n]
robe_heads={
'druid':["..L.L..L..L..","...LhLLhL.Lo.","...hhhhhh..o.","...hssssh..o.","...sesses..o.","...ssssss..o."],
'necro':["....A......b.","....AA....bb.","...AAaa....o.","...AkkkkQ..o.","...AmkkmQ..o.","...AkkkkQ..o."],
'cleric':["....WWWW...oo","...WWWWWW..oO","...WsssssW.o.","...WseseW..o.","...WssssW..o.","...WWssWW..o."],
'enchanter':["....AAAA...m.","...AAaaaQ..W.","...AWWWWQ..o.","...WmWWmW..o.","...WWWWWW..o.","...AWRRWQ..o."],
'wizard':[".......AQ....","......AaQ....",".....AaaQ..o.","....AaaaaQ.o.",".AAAAaaaaQQo.","...sesses..o."],
'shaman':[".B.......B.b.","..B.AAAA.B.b.","...BAaaaB..o.","...AssssQ..o.","...RReRRe..o.","...ssssss..o."],
}
D['druid']=dict(pal=pal('druid'),idle=robe(robe_heads['druid'],[(10,4,'G'),(11,6,'G'),(12,5,'G')]))
D['necro']=dict(pal=pal('necro'),idle=robe(robe_heads['necro'],[(6,4,'a'),(6,5,'k'),(6,6,'k'),(6,7,'a'),(8,6,'b'),(15,4,'.'),(15,3,'O'),(13,3,'.'),(13,8,'.')]))
D['cleric']=dict(pal=pal('cleric'),idle=robe(robe_heads['cleric'],[(6,3,'W'),(6,4,'W'),(6,5,'W'),(6,6,'W'),(6,7,'W'),(7,5,'Y'),(7,6,'Y'),(8,5,'Y'),(8,6,'Y')]))
D['enchanter']=dict(pal=pal('enchanter'),idle=robe(robe_heads['enchanter'],[(6,4,'a'),(6,5,'W'),(6,6,'W'),(6,7,'a'),(10,5,'R'),(11,6,'R')]))
D['wizard']=dict(pal=pal('wizard'),idle=robe(robe_heads['wizard'],[(6,3,'s'),(6,4,'W'),(6,5,'W'),(6,6,'W'),(6,7,'W'),(6,8,'s'),(7,4,'W'),(7,5,'W'),(7,6,'W'),(8,5,'W'),(8,6,'W'),(9,5,'W')]))
D['shaman']=dict(pal=pal('shaman'),idle=robe(robe_heads['shaman'],[(6,2,'A'),(6,3,'A'),(6,4,'b'),(6,5,'s'),(6,6,'b'),(6,7,'s'),(6,8,'Q'),(6,9,'Q'),(7,3,'a'),(7,4,'a'),(7,5,'b'),(7,6,'b'),(7,7,'a'),(7,8,'a')]))
# Magician: kept short on purpose (owner likes it): tall hat, face lower, shorter robe
D['magician']=dict(pal=pal('magician'),idle=[
"......R....m.",
"......RR...y.",
".....RRR...o.",
".....RrRR..o.",
"....RRrRRR.o.",
"...hRRRRRh.o.",
"...hsssssh.o.",
"...sesses..o.",
"...ssssss..o.",
"..HHRsssRn.o.",
".HHnRnnRdnsS.",
".snyRyyRyN.o.",
"..HnRnnRNd.o.",
"..HnnnnNNNdo.",
"...ww.ww...o.",
"...OO.OO...o.",
])
GLOW={'druid':'L','necro':'m','cleric':'Y','enchanter':'m','wizard':'W','shaman':'R','magician':'m'}
for id in GLOW:
    D[id]['act']=cast(D[id]['idle'],GLOW[id]);D[id]['lab']='cast'
D['magician']['act']=cast(D['magician']['idle'],'m')
def img(rows,p,S):
    rows=outline(rows);h=len(rows);w=len(rows[0]);im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c in p and p[c]: im.putpixel((x,y),tuple(int(p[c][i:i+2],16) for i in (1,3,5))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)
if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    S=6;BG=(52,62,40,255);ids=P.ORDER;cw=22*S
    H=3*(22*S)+120;Wd=len(ids)*cw+20
    sh=Image.new('RGBA',(Wd,H),BG);d=ImageDraw.Draw(sh)
    d.text((10,6),'Player pass, draft 2. Row 1 today, row 2 new, row 3 an action pose. Shown 6x.',fill=(255,210,122))
    for n,id in enumerate(ids):
        x=10+n*cw;r,p=P.get(id);a=P.img(r,p,S);sh.alpha_composite(a,(x,30+20*S-a.height))
        b=img(D[id]['idle'],D[id]['pal'],S);sh.alpha_composite(b,(x,30+22*S+20*S-b.height))
        c=img(D[id]['act'],D[id]['pal'],S);sh.alpha_composite(c,(x,30+44*S+20*S-c.height))
        d.text((x,30+66*S+4),P.NAMES[n],fill=(235,225,200));d.text((x,30+66*S+18),D[id]['lab'],fill=(170,170,160))
    sh.save('art/drafts/players-pass-draft2.png')
    # game-size strip (3x) new looks side by side
    st=Image.new('RGBA',(len(ids)*17*3+20,24*3),BG)
    for n,id in enumerate(ids):
        b=img(D[id]['idle'],D[id]['pal'],3);st.alpha_composite(b,(10+n*17*3,24*3-b.height-6))
    st.save('art/drafts/players-pass-draft2-game.png')
    # Looping clip, 2 rows of 7 for a phone: stand, action, stand
    S=5;BG=(52,62,40);cw=20*S;ch=22*S
    def frame(key):
        f=Image.new('RGBA',(7*cw+10,2*ch+10),BG+(255,))
        for n,id in enumerate(ids):
            x=5+(n%7)*cw;y=5+(n//7)*ch;im=img(D[id][key],D[id]['pal'],S);f.alpha_composite(im,(x+S,y+ch-im.height-S))
        return f.convert('RGB')
    a,b=frame('idle'),frame('act')
    a.save('art/drafts/players-pass-draft2.gif',save_all=True,append_images=[b,a],duration=[700,450,300],loop=0)

# Draft sprites for the undead and Brother Malrec (character chat, Nov 21): crypt skeleton, Necro pet, Shadow Knight minion,
# shambling corpse, Skeleton King, Malrec. Fill-only text grids (same format as js/data/sprites.js), outline() adds the black edge.
# Run: python3 tools/undead_mobs.py  -> writes d_*.png; grids move into sprites.js once the owner OKs them.
from PIL import Image
def outline(rows):
    w=max(len(r) for r in rows)+2
    g=[list('.'*w)]+[list('.'+r.ljust(w-2,'.')+'.') for r in rows]+[list('.'*w)]
    out=[r[:] for r in g]
    for y in range(len(g)):
        for x in range(w):
            if g[y][x]=='.':
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    X,Y=x+dx,y+dy
                    if 0<=X<w and 0<=Y<len(g) and g[Y][X] not in '.':
                        out[y][x]='k';break
    return [''.join(r) for r in out]
BONE={'W':'#e4dccb','w':'#bdb39c','b':'#857b69','h':'#1c1418','e':'#ff3b30','r':'#8a5a3a','R':'#5e3a26','y':'#c9a227','o':'#6e4a2a','k':'#0b0a0f'}
SKEL=[
"....wWWWw....",
"...wWWWWWw...",
"...wWheWhe...",
"...bWWWhWW...",
"....bWhWhW..r",
".....bwww...r",
"......b.....r",
"..bwWWWWWWw.r",
"..b.WWbWWW.wr",
".b....b....wr",
".b..WWbWW..wr",
".b....b....Wy",
"..b.wWWWw..Wo",
"....b...b....",
"....w...w....",
"....W...W....",
"....w...w....",
"....ww..ww...",
]
SKEL_STEP=SKEL[:13]+[
"...b.....b...",
"...w.....w...",
"..W.......W..",
"..w.......w..",
".ww.......ww.",
]
def img(rows,pal,S=1):
    h=len(rows);w=len(rows[0]);im=Image.new('RGBA',(w,h))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c!='.' and c in pal: im.putpixel((x,y),Image.new('RGB',(1,1),pal[c]).getpixel((0,0))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)
P=dict(k='#0b0a0f',h='#1c1418')
BONE=dict(P,W='#e4dccb',w='#bdb39c',b='#857b69',e='#ff3b30',g='#9a9ca4',G='#c4c6cc',r='#8a5232',y='#b08a3a',o='#5a3a24',s='#7a5a3a',S='#5a4028',i='#8a8a90')
# crypt skeleton 14x18 fill: rusty sword (steel g/G with rust r), brass guard, broken round shield on the far arm (s/S wood, i iron rim)
SKEL=[
"....wWWWw.....",
"...wWWWWWw....",
"...wWheWhe..G.",
"...bWWWhWW..g.",
"....bWhWhW..r.",
".....bwww...g.",
"......b.....g.",
".ibwWWWWWWw.r.",
"isSiWWbWWW.wg.",
"isSs..b....wg.",
"iSsS.WWbWW.yyy",
"isSs..b....Wo.",
".iS.wWWWWw..o.",
"....b...b...y.",
"....w...w.....",
"....W...W.....",
"....w...w.....",
"....ww..ww....",
]
LEGS_STEP=["...b.....b....","...w.....w....","..W.......W...","..w.......w...",".ww.......ww.."]
SKEL_STEP=SKEL[:13]+LEGS_STEP
def strip_shield(rows):
    out=[]
    for j,r in enumerate(rows):
        r=list(r)
        for x in range(4):
            if r[x] in 'isS': r[x]='.'
        if 7<=j<=12: r[1]='b' if j>=8 else r[1]
        out.append(''.join(r))
    return out
def bone_club(rows):  # Necro pet: swap the sword for a thigh-bone club
    out=[]
    for j,r in enumerate(rows):
        r=list(r)
        for x in range(11,14):
            if r[x] in 'gGryo': r[x]='.'
        out.append(r)
    for j,c in [(4,'W'),(5,'w'),(6,'w'),(7,'w'),(8,'w'),(9,'w'),(10,'W')]: out[j][12]=c
    out[3][12]='W';out[3][11]='W';out[4][11]='w';out[11][12]='W';out[10][13]='.';out[10][11]='W' if False else out[10][11]
    out[10][11]='.';out[10][13]='.';out[10][12]='W'
    return [''.join(r) for r in out]
PET=bone_club(strip_shield(SKEL)); PET_STEP=PET[:13]+LEGS_STEP
PET_PAL=dict(BONE,W='#f0ead8',w='#cfc8b2',b='#9a9282',e='#7dffa6')
MIN_PAL=dict(BONE,W='#a8a092',w='#857d70',b='#5a5248',e='#ff3b30')
MIN=strip_shield(SKEL); MIN_STEP=MIN[:13]+LEGS_STEP
# shambling corpse 14x18 fill: hunched, head pushed forward, both arms reaching, jaw hanging, torn shirt with a rib showing, one bare foot
ZP=dict(P,S='#9cae86',s='#748a62',d='#4f6243',e='#ffd23a',c='#6a5a44',C='#857258',q='#463a2c',x='#d8cfb8',m='#6a1c1c',t='#3e3a48',T='#2a2732',W='#d8cfb8')
ZOMB=[
".....dsSSs....",
"....dsSSSSs...",
"....dsShSeS...",
"....dssSSSs...",
".....dsshhh...",
"......dsWhW...",
"...qcCCcd.....",
"..qcCCCCCssSSs",
"..qcCxCCCdsSSS",
"..qcxCxCcqdddd",
"..qcCCmCcq..dd",
"..dqcCcmqc....",
"..dsqcqcqs....",
"...tTttTt.....",
"...tT..tt.....",
"...tT...tt....",
"...dd....ts...",
"...dd....sS...",
]
ZOMB_STEP=ZOMB[:13]+["...tTttTt.....","...tT.tt......","..tT...tt.....","..dd...ts.....","..dd...sS....."]
# Skeleton King 22x28 fill: gold crown with a red gem, big skull with violet fire in the sockets, ermine collar,
# torn purple mantle over the ribcage, a greatsword planted point-down that he leans on.
KP=dict(P,W='#e4dccb',w='#bdb39c',b='#857b69',e='#b48cff',E='#efe0ff',Y='#f0d070',y='#c9a227',o='#7a5a1a',R='#d0283a',
        F='#ece6dc',f='#1c1418',q='#2a1a44',p='#3d2a63',Q='#5a3f8a',g='#9a9ca4',G='#c4c6cc',l='#6a6c74',a='#5a3a24')
KING=[
"......y..y..y..y......",
"......yYyyYyyYyy......",
"......oyyyRyyyyo......",
".....wWWWWWWWWWWw.....",
"....wWWWWWWWWWWWWw....",
"....wWhhEWWWhhEWWw....",
"....wWhhhWWWhhhWWw....",
"....bWWWWWhWWWWWWw....",
".....bWWhWhWhWhWw.....",
"......bwWwWwWwWb......",
"...FFfFFFFFFFFfFFF.Y..",
"..FFFFFFfFFFFFFFfFF.o.",
"..qpQFWWWbWWWFQppQwo..",
".qppQ.WWWbWWW.QppwWy..",
".qpQ.........bQpQWyyy.",
".qpQ.WWWWbWWWW.QQ..g..",
".qpQ..........bQp..G..",
"qppQ..WWWbWWW..Qp..g..",
"qppQ......b....Qp..G..",
"qpQQ...wWWWWw..Qpp.g..",
"qpQ...wWWbWWWw.QQp.G..",
"qppQ..b......b.Qpp.g..",
"qpQQ..w......w..Qp.G..",
"qppQ..W......W..Qp.g..",
".qpQ..w......w..Qp.l..",
".qqp..w......w.qQp.l..",
"..qq.www....www.qq..l.",
"......................",
]
KING=KING[:27]
KING_STEP=KING[:21]+["qpQQ.b.......b.Qpp.G..","qppQ.w........w.Qp.g..","qpQQW.........W.Qp.G..",".qpQw..........wQp.l..",".qqpw..........wqp.l..","..qww..........wwq..l."]
SHEETS=[('skel',SKEL,SKEL_STEP,BONE),('pet',PET,PET_STEP,PET_PAL),('minion',MIN,MIN_STEP,MIN_PAL),('corpse',ZOMB,ZOMB_STEP,ZP),('king',KING,KING_STEP,KP)]
# --- fixes: corpse body (less round, ragged hem), pet bone club, king skull smaller with glowing sockets
ZP.update(c='#857a60',C='#a39478',q='#5a4e3c')
ZOMB=[
".....dsSSs....",
"....dsSSSSs...",
"....dsShSeS...",
"....dssSSSs...",
".....dsshhh...",
"......dsWhW...",
"....qcCCcd....",
"...qcCCCCCsSSs",
"...qcCCCCdssSS",
"...qcCxCcqdddd",
"...qcxhxcq..dd",
"...qcCCmCq....",
"...q.cmc.q....",
"...tTttTt.....",
"...tT..tt.....",
"...tT...tt....",
"...dd....ts...",
"...dd....sS...",
]
ZOMB_STEP=ZOMB[:13]+["...tTttTt.....","...tT.tt......","..tT...tt.....","..dd...ts.....","..dd...sS....."]
PET=[list(r) for r in strip_shield(SKEL)]
for j in range(14):
    for x in range(11,14):
        if PET[j][x] in 'gGryo': PET[j][x]='.'
for j,x,c in [(2,11,'W'),(2,12,'W'),(3,11,'w'),(3,12,'W'),(3,13,'W'),(4,12,'w'),(5,12,'w'),(6,12,'b'),(7,12,'w'),(8,12,'w'),(9,12,'w'),(10,12,'W'),(10,11,'W'),(11,12,'W'),(11,13,'w')]:
    PET[j][x]=c
PET=[''.join(r) for r in PET]; PET_STEP=PET[:13]+LEGS_STEP
KP.update(e='#9a6aff',E='#e8d8ff')
KHEAD=[
"......y...y...y.......",
"......yYyyYyyYy.......",
"......oyyyRyyyo.......",
"......wWWWWWWWw.......",
".....wWWWWWWWWWw......",
".....wWhEWWWhEWw......",
".....wWEeWWWEeWw......",
".....bWWWWhWWWWw......",
"......bWhWhWhWw.......",
".......bwWwWwb........",
]
KING=KHEAD+KING[10:]; KING_STEP=KHEAD+KING_STEP[10:]
# --- Brother Malrec, grander (owner, Nov 21): tall pointed cowl with a gold tip and trim, face lost in shadow with ember eyes,
# a black cope with a high gold collar over a red robe, gold-edged front and a gold-embroidered stole down the middle,
# a gold hem band, and a tall crook-staff with a lit censer hanging from it trailing smoke.
MP=dict(P,B='#2a1d22',b='#160e12',R='#8a1e24',r='#5a1418',Y='#f0d070',y='#c9a227',o='#7a5a1a',h='#0e0a0c',e='#ffb060',E='#fff0c0',
        s='#5a3a24',c='#6a6470',f='#ff8a3c',F='#ffd070',m='#6a6670',w='#cfc0b0')
BODY=[
"........yY.......",".......BBy.......","......BBBBy......",".....BBBBBBy.....",".....BhhhhBy.....",
"....bBhehheBy....","....bBhhhhhBy....","....bByhhhyBy....","...bBBYyyyyYBB...","..bBBByRyyRyBBBw.",
".bBBBByRRRRyBBBww",".bBBByRRYYRRyBBB.","bBBBByRRyyRRyBBB.","bBBBByRrYYrRyBBB.","bBBByRRrYYrRRyBB.",
"bBBByRRryyrRRyBB.","bBBByRRrYYrRRyBB.","bBBByRRryyrRRyBBB","bBByRRRrYYrRRRyBB","bBByRRRryyrRRRyBB",
"bByRRRRrYYrRRRRyB","bByRRRRryyrRRRRyB","byRRRRRrYYrRRRRRy","byyyyyyyyyyyyyyyy","bRRRRRRRRRRRRRRRb",".bbbbbbbbbbbbbbb.",
]
STAFF=[".ss..","s..s.","s..c.","s.cfc","s.cFc","s.ccc","s...m","s..m.","s...m"]+["s...."]*17
MALREC=[a+b for a,b in zip(BODY,STAFF)]
SHEETS=[('skel',SKEL,SKEL_STEP,BONE),('pet',PET,PET_STEP,PET_PAL),('minion',MIN,MIN_STEP,MIN_PAL),('corpse',ZOMB,ZOMB_STEP,ZP),('king',KING,KING_STEP,KP),('malrec',MALREC,MALREC,MP)]
if __name__=='__main__':
    for n,a,b,pal in SHEETS:
        for tag,rows in (('',a),('step',b)):
            assert len(set(len(r) for r in rows))==1,(n,tag,[len(r) for r in rows])
            o=outline(rows);img(o,pal,1).save(f'd_{n}{tag}.png');print(n,tag,len(o[0]),len(o))

# --- Malrec, draft 1b (owner, Nov 21): not the cultists' hooded model. Bare-headed under a tall red mitre with a gold band
# and an ember sigil, a gaunt grey face with ember eyes and an ash-grey beard, a stiff high collar (black, gold-edged)
# framing the face; the vestments below stay (cope, red robe, gold stole and hem, crook-staff with censer).
MP.update(v='#8a7a70',g='#9a948c',G='#6a645e',w='#cfc0b0')
MHEAD=[
"........y........",
".......yRy.......",
"......yRRRy......",
"......RRYRR......",
"......RYYYR......",
"......yyyyy......",
"....YBvwwwwBY....",
"....YBvwewewBY...",
"....YBvwwwwBY....",
"....YBGggggBY....",
"...bBYBGggGBYB...",
]
MHEAD=[r[:17].ljust(17,'.') for r in MHEAD]
MALREC2=[a+b for a,b in zip(MHEAD+BODY[9:],[".ss..","s..s.","s..c.","s.cfc","s.cFc","s.ccc","s...m","s..m.","s...m"]+["s...."]*30)]
if __name__=='__main__':
    o=outline(MALREC2);img(o,MP,1).save('d_malrec2.png');print('malrec2',len(o[0]),len(o))

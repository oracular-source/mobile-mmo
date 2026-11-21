# Redesign pass, draft 2 (character chat, Nov 21; owner: "give another crack" at everything not redone yet, expect small changes).
# Cult (zealot, ashcaller, chanter, mender, deacon, summoner, the Ashen Acolyte), blight wolf, Old Scar, thornback boar,
# big tunnel rat and the Pale Rat, mire beetle and Ironshell, the Weeping Bride, the Magician's elementals and the
# Enchanter's floating sword. Fill-only text grids (same format as js/data/sprites.js); outline() adds the black edge.
# Run: python3 tools/redesign_pass.py -> art/drafts/redesign-draft1.png (needs /tmp/cur/*.png exported from the game for
# the "now" column; see the export snippet at the bottom).
import os,sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw,ImageFont
from undead_mobs import outline,img

def pad(rows,w=None):
    w=w or max(len(r) for r in rows);return [r.ljust(w,'.') for r in rows]
def over(base,layer,dx=0,dy=0):
    """Lay an item grid over a body ('.' = see-through), growing the grid if the item sticks out."""
    W=max(len(base[0]),dx+max(len(r) for r in layer));H=max(len(base),dy+len(layer))
    g=[list(r.ljust(W,'.')) for r in base]+[list('.'*W) for _ in range(H-len(base))]
    for j,r in enumerate(layer):
        for i,c in enumerate(r):
            if c!='.':g[dy+j][dx+i]=c
    return [''.join(r) for r in g]
def hemstep(rows):
    """Robe walk frame: one foot shows forward and the other tucks under the hem."""
    g=[list(r) for r in rows];H=len(g)
    last=g[H-1]
    for i,c in enumerate(last):
        if c=='u':last[i]='.'
    xs=[i for i,c in enumerate(g[H-2]) if c!='.'];mid=(xs[0]+xs[-1])//2
    for i in range(mid+1,min(mid+3,len(last))):last[i]='u'
    return [''.join(r) for r in g]

# ================= The cult: one hand-drawn body, then a story per role =================
# Rounded cowl lit on its left rim, the face in shadow with two glowing eyes, a mantle over the shoulders, sleeves with a
# hand showing, a rope belt with a knotted tail, robe folds and a darker hem, boots peeping out (they swap on the step).
CULT=[
"......aaa......",
".....aHHad.....",
"....aHHaaad....",
"....aHffffd....",
"...daHfefed....",
"...daffffdd....",
"...ddaffddd....",
"...dHmmmmmd....",
"..dHHmmmmmdd...",
"..dHaaaaaasd...",
"..dHaaaaaasdd..",
".dHarrrrrrrdd..",
".dHaaaaRaaadd..",
".dHaaaaRaaaadd.",
".dHaadaaaaadad.",
"dHaaadaaaaaadad",
"dHaadaaaaaaadad",
"DdddDddddDdddDD",
"...uu....uu....",
]
def cultpal(robe,eye='#ff4a30',**x):
    from monastery_named import shift
    p=dict(k='#0b0a0f',a=robe,H=shift(robe,[34,32,30]),d=shift(robe,[-26,-24,-22]),D=shift(robe,[-44,-42,-38]),
           m=shift(robe,[14,12,10]),f='#100c0e',e=eye,s='#a89c8c',r='#9a8458',R='#6e5c3a',u='#4a3a2e',
           l='#b0b0bc',L='#7a7a86',o='#5a4028',O='#3a2a1c',g='#ff8a3c',G='#ffe0a0',n='#a0802a',N='#e0c070',w='#e8e0c8',W='#b8ae98',
           c='#8a8690',z='#6a6670',Z='#9a96a0')
    p.update(x);return p
SICKLE=["....lll","...l..l","......l",".....lL","....o..","...o...","..o....","..o....",]
EMBER =["..G..","..g..",".gGg.",".ggg.","ss...","s....",]
CENSER=["..cc.","..c..","..c..","..c..",".nnn.","ngGgn",".nnn.","..z.Z","...z.","..Z..",]
BOOK  =["wWwW","wWwW","oooo",]
MACE  =[".LlL.","LlllL",".LlL.","..o..","..o..","..o..","..o..","..O..",]
COAL  =[".G.",".g.","gGg","ggg","ss.","s..",]
ZEAL=over(CULT,SICKLE,10,5)
ASH =over(over(CULT,EMBER,9,4),["z"],4,15)       # ember cupped up in one hand, ash smudge on the robe
CHAN=over(CULT,CENSER,10,8)
MEND=over(over(CULT,BOOK,10,9),["ww","WW"],3,12)  # open book, a bandage roll at the belt
SUMM=over(over(CULT,COAL,10,3),["G..G","..G."],4,15) # coal held high, embers in a rune on the hem
# deacon: a size up (wider shoulders, a cord across the chest, a mace)
DEAC=pad([
"......aaaa......",
".....aHHHad.....",
"....aHHaaaad....",
"....aHfffffd....",
"...daHffefed....",
"...daafffffd....",
"...ddaafffdd....",
"...dHmmmmmmd....",
"..dHHmmmmmmmd...",
"..dHmnmmmnmmdd..",
"..dHanaaanaasd..",
".dHaanaaanaasdd.",
".dHarnrrrnrrrdd.",
".dHaanaaanaaadd.",
".dHaanaRanaaadd.",
"dHaaanaRanaaadad",
"dHaaanaaanaaadad",
"dHaadnaaanaaadad",
"DdddDNddDNdddDDD",
"...uu.....uu....",
])
DEAC=over(DEAC,MACE,11,5)
# the Ashen Acolyte (rare): taller, pale ash robes going sooty at the hem, ember eyes, a smoking censer, smoke wisps rising
ACOL=pad([
".......aaa.......",
"......aHHad......",
".....aHHaaad.....",
".....aHffffd.....",
"....daHfefed.....",
"....daffffdd.....",
"....ddaffddd.....",
"....dHmmmmmd.....",
"...dHHmmmmmdd....",
"...dHaaaaaasd....",
"...dHaaaaaasdd...",
"..dHarrrrrrrdd...",
"..dHaaaaRaaadd...",
"..dHaaaaRaaaadd..",
"..dHaadaaaaadad..",
".dHaaadaaaaaadad.",
".dHaadaaaaaaadad.",
"dHaaadaaaaaaaddad",
"dHzaadaazaaadzadd",
"dzzZdzzzZzzdzzZdd",
"zZzzZzzZzzzZzzzZz",
"....uu.....uu....",
])
ACOL=over(ACOL,CENSER,12,8)
ACOL=over(ACOL,["..Z","Z..",".Z."],0,0)
CULT_SET=[('zealot',ZEAL,cultpal('#5a2a24')),('ashcaller',ASH,cultpal('#5c5a5e')),('chanter',CHAN,cultpal('#3e3a56')),
          ('mender',MEND,cultpal('#5a6a52')),('deacon',DEAC,cultpal('#4a1c1e')),('summoner',SUMM,cultpal('#6a3a1c',eye='#ffb060')),
          ('acolyte',ACOL,cultpal('#8a8682',eye='#ffb060',z='#4a4648',Z='#9a96a0'))]

# ================= Wolfwood =================
# Blight wolf: the old wolf a size up with real fur: lighter back, a little ruff at the neck, a thin flank (ribs), bushy
# tail, the blight as a sick green patch eating its shoulder with a faint glow, red eye, bared teeth.
WP=dict(k='#0b0a0f',A='#a9acb0',a='#7d8086',d='#55585f',D='#3e4046',b='#6f7a5c',B='#9ab06a',e='#ff3b30',w='#e8e2d4',r='#7a1a22')
WOLF=pad([
"...........................a..a...",
"..........................aAa.aAa.",
".............A.A.A.A.....aAAaaaAa.",
"..........AAAAAAAAAAAAAAAAAaaaaaaa.",
"..AA...AAAaaaaaaaaaaaaaAAAaaaaaeaa.",
".AaaA.AaaaaaaaaaaabBaaaaAAaaaaaaaaa",
"AaadaAaaaaaaaaaaabBBbaaaaAaaaaawrwr",
"AadddaaaaaaadadadabBaaaaaAaaaaarrrr",
".AddaaaaaaadadadaaaaaaaaaAaaadwwww.",
"..dd.aaaaaaaaaaaaaaaaaaaddaadd.....",
"....addaaddddddddddddddaddaad......",
"....aaDd.aaD..........aDd.aD.......",
".....aDd..aD..........aDd.aD.......",
"....aDd..aD...........aDd.aD.......",
"....aDd..aD...........aDd.aD.......",
"....aDDd.aDd..........aDDd.aDd.....",
])
def legstep(rows,legs_from):
    """Four-legged walk frame: each whole leg moves one pixel, every other leg forward and back, so the pairs splay.
    (Shifting single pixels split 2-pixel legs in half: the 'silly' boar legs in draft 1.)"""
    top=rows[:legs_from];leg=rows[legs_from:];W=len(rows[0])
    bottom=leg[-1];runs=[];i=0
    while i<W:
        if bottom[i]!='.':
            j=i
            while j+1<W and bottom[j+1]!='.':j+=1
            runs.append((i,j));i=j+1
        else:i+=1
    out=[]
    for r in leg:
        n=['.']*W
        for i,c in enumerate(r):
            if c=='.':continue
            k=next((k for k,(a,b) in enumerate(runs) if a-1<=i<=b+1),None)
            ni=i if k is None else i+(-1 if k%2==0 else 1)
            if 0<=ni<W:n[ni]=c
        out.append(''.join(n))
    return top+out
OSP=dict(WP,A='#9a948c',a='#726c66',d='#45413d',D='#33302d',S='#c98a86',G='#c8c4bc',w='#d8d0bc')
SCAR=[list(r) for r in WOLF]
for j,r in enumerate(SCAR):
    for i,c in enumerate(r):
        if c in 'bB':SCAR[j][i]='a'
for i,j in [(10,4),(11,5),(12,5),(13,6),(14,6),(15,7),(16,7),(17,8)]:SCAR[j][i]='S'
SCAR[4][31]='G';SCAR[3][30]='S';SCAR[5][30]='S';SCAR[0][30]='.';SCAR[1][31]='.'
SCAR=[''.join(r) for r in SCAR]
BP=dict(k='#0b0a0f',A='#8a6448',a='#6a4a34',d='#43301f',D='#2e2016',T='#e0d4b4',t='#a8987a',p='#a0706a',e='#ff3b30',w='#efe6cc',h='#3a2a1e')
BOAR=pad([
"........T.T.T.T...........",
".....TtThThThThT..........",
"....hAAhAAhAAhAAAA........",
"...hAAaaaaaaaaaaAAAA......",
"..hAaaaaaaaaaaaaaaaAAa....",
".hAaaaaaaaaaaaaaaaaaaeAa..",
"hAaaaaaaaaaaaaaaaaaaaaaapw",
"haaaaaaaaaaaaaaaaaaaawwwww",
".adaaaaaaaaaaaaaaaaadd.w..",
"..ddddddddddddddddddd.....",
"..dDd.dDd....dDd.dDd......",
"...dD..dD.....dD..dD......",
"...hh..hh.....hh..hh......",
])

# ================= Rats =================
# Big tunnel rat: a small Gnawbone (owner: Gnawbone is the bar): shaggy spikes along the back, a mangy patch, a scar,
# long yellow teeth, pink ear and tail, red eye.
RP=dict(k='#0b0a0f',A='#6e5c4e',a='#54463c',d='#3a302a',D='#2a221e',p='#c98a86',P='#9a6a66',e='#ff3b30',y='#e0c070',m='#7e6e60',S='#a88880')
BRAT=pad([
"..............a.a.a........",
"..........aAaAaAaAaa.pp....",
"........aAAAAAAAAAAAAaPp...",
"......aAaaaaaammaaaaAAaaa..",
".....aaaaaSaaammaaaaaaaaea.",
"PPPPdaaaaaaSaaaaaaaaaaaaaap",
"....ddaaaaaaaaaaaaaaaaaayy.",
".....ddddadddddddaddddd.y..",
".......d...d.......d...d...",
".......p...p.......p...p...",
])
PALE=dict(RP,A='#ece6e0',a='#c8c0b8',d='#968c86',D='#706864',m='#d8cec8',S='#e0a0a0',e='#ff2020')

# ================= Beetles =================
# Mire beetle: a real beetle at last (was a blue blob): domed shell with a centre seam and a sheen, a small head with
# mandibles, six short legs.
EP=dict(k='#0b0a0f',C='#4a6a9a',c='#34507a',D='#22344e',h='#9ac0e8',H='#cfe4f8',q='#2a2a34',Q='#4a4a58',e='#ff3b30')
BEET=pad([
"................",
"....cCCCcc......",
"..cChHCCCcc.....",
".cChHCCcCCcc.qq.",
"cCCCCCcCCCcccQeq",
"cCCCCCcCCCccQqqQ",
".cccccDccccc.qQ.",
"..q.q..q.q..q...",
".q..q..q..q..q..",
])
# Ironshell: twice the beetle, drawn at full detail (no 2x chunky pixels): a thick cracked shell grown over with moss
IP=dict(EP,C='#5a6250',c='#454b40',D='#2e322a',h='#8a9478',H='#b0b89c',m='#55733d',M='#7a9a4a',x='#1a1c18')
IRON=pad([
"..............................",
"..............................",
"........ccCCCCCcc.............",
".....ccCCmMmCCCCCcc.........",
"...cCCmMMmhHCCxCCCCcc.......",
"..cCmMmmCCHCCxCCCmMCCc...qq.",
".cCCCCCCCCCCxCcCCMmmCCc.qQeq",
"cCCCxxCCCCCCCcCCCCCCCCccQqqQ",
"cCCCCxCCCCCCCcCCCCxCCCccqQqQ",
"cCmCCCCCmMCCCcCCCCxxCCcc.qQ.",
".cmMcccccmMcccccccccccc.....",
"..cDDDDDDDDDDDDDDDDDDDc.....",
"...q..q...q....q...q..q.....",
"..q...q...q....q...q...q....",
".qq..qq..qq...qq..qq..qq....",
])

def feelers(rows,pts):
    g=[list(r) for r in pad(rows)];W=max(len(g[0]),max(x for x,y in pts)+1)
    g=[r+['.']*(W-len(r)) for r in g]
    for x,y in pts:g[y][x]='Q'
    return [''.join(r) for r in g]
# two thin feelers off the head, curving up and forward
BEET=feelers(BEET,[(14,2),(14,1),(15,0),(16,2),(17,1),(18,1)])
IRON=feelers(IRON,[(25,4),(25,3),(26,2),(26,1),(27,0),(27,4),(28,3),(29,2),(30,2),(31,1)])

# ================= The Weeping Bride =================
# A drowned bride in the graveyard's flooded corner: a long torn veil falling down her back, a tattered once-white gown
# going muddy at the hem, a wilted bouquet in her hands, grey-green face with pale glowing eyes and a dark wet streak
# down each cheek, a faint pale glow (drawn by the game) around her.
WB=dict(k='#0b0a0f',V='#e8e8f0',v='#b8b8c8',g='#d0ccd8',G='#a09cb0',M='#6e6a60',f='#8aa090',F='#6a8070',e='#e8fff8',t='#2a3a34',
        b='#6a3a4a',B='#8a5a6a',L='#4a6a3a')
BRIDE=pad([
"....vVVVv.......",
"...vVVVVVv......",
"..vVvffffVv.....",
"..vVfefeFvv.....",
"..vVftfFtvv.....",
".vVvfFFFfvvv....",
".vVvvfFfvvvv....",
"vVvvggggggvvv...",
"vVvgGggggGgvv...",
"vVvgGgbBgGgvv...",
"vvvgGbLBbGgvv...",
"vVvgGgbbgGgvv...",
"vvgGgggggggGv...",
"vvgGggggggggGv..",
"vgGggggggggggG..",
"vgGgggGgggGgggG.",
".gGggGgggGgggGg.",
".gMgMggMgMggMgM.",
".MMgMMgMMMgMMgM.",
"..M..M...M..M...",
])

# ================= Pets =================
# Earth elemental: a squat golem of stacked stone with moss in the cracks and a warm glow in the eyes and the seams
EAP=dict(k='#0b0a0f',A='#9a7a58',a='#7a5e42',d='#56402c',D='#3a2a1e',e='#ffd27a',m='#5a7a3a',x='#2a1e14')
EARTH=pad([
"......aAa......",
".....aAAAd.....",
".....aeAed.....",
"....aaAAAdd....",
".aAAadaAAddAAd.",
"aAAAdxaaaxdAAAd",
"aAAdaaaaaaadAAd",
"aAd.aaAmAad.aAd",
"aAd.aAAAAad.aAd",
".d..adxxxad..d.",
"....aAd.aAd....",
"....aAd.aAd....",
"...aAAd.aAAd...",
])
# Fire elemental: a body of flame with a hot white core, arms of fire, flames licking up off the head and shoulders
FP=dict(k='#0b0a0f',Y='#fff3c4',y='#ffd070',o='#ff9a4a',r='#c4471f',R='#7a2410',e='#fff3c4',E='#3a1a10')
FIRE=pad([
"....o.....o....",
"...oyo.o.oyo...",
"...oyyoyoyyo...",
"...oyyEyEyyo...",
"..ryyyyyyyyyr..",
".rooyyYYYyyoor.",
"roo.yYYYYYy.oor",
"ro..oyYYYyo..or",
"r...ryyyyyr...r",
"....rooooor....",
"...rro...orr...",
"...ro.....or...",
"..rr.......rr..",
])
# Floating sword: the Enchanter's conjured blade, a slim pale steel sword with a pink glow edge and a gem in the guard
SP=dict(k='#0b0a0f',l='#e8e8f4',L='#a8a8c0',v='#ff9ae8',y='#c9a227',m='#ff5ad0',o='#5a4028')
SWORD=pad([
"..v..",
".vlv.",
".lLv.",
".lLv.",
".lLv.",
".lLv.",
".lLv.",
".lLv.",
"yymyy",
"..o..",
"..o..",
"..y..",
])

BEASTS=[('wolf',WOLF,WP,10),('oldscar',SCAR,OSP,10),('boar',BOAR,BP,10),('brat',BRAT,RP,8),('palerat',BRAT,PALE,8),
        ('beetle',BEET,EP,7),('ironshell',IRON,IP,12),('bride',BRIDE,WB,None),('earth',EARTH,EAP,10),('fire',FIRE,FP,None)]

# walk frame: each pair splays (one leg reaching forward, one back); paws keep pointing forward
WOLF_LEGS=["....aaDd..aD.........aDd...aD......","....aDd....aD.......aDd.....aD.....","...aDd......aD.....aDd......aD.....","...aDd......aD.....aDd.......aD....","...aDDd.....aDd....aDDd......aDd..."]
def frames(name,rows,legs):
    if name in('wolf','oldscar'):return rows,pad(rows[:11]+WOLF_LEGS,len(rows[0]))
    if name in dict((c[0],1) for c in CULT_SET):return rows,hemstep(rows)
    if legs:return rows,legstep(rows,legs)
    return rows,None

if __name__=='__main__':
    font=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
    S=6;sheet=Image.new('RGBA',(1560,1500),'#2b2d28');d=ImageDraw.Draw(sheet)
    d.text((20,12),'Redesign pass, draft 2 (character chat, Nov 21). Each pair: in the game now (left) and new (right, stand + step).',fill='#fff',font=font(20))
    items=[(n,r,p,None) for n,r,p in CULT_SET]+BEASTS
    x=20;y=60;rowh=0
    for n,rows,pal,legs in items:
        a,b=frames(n,pad(rows),legs)
        o=outline(a);ni=img(o,pal,S);si=img(outline(b),pal,S) if b else None
        cur='/tmp/cur/%s.png'%n
        oi=Image.open(cur).convert('RGBA') if os.path.exists(cur) else None
        if oi:oi=oi.resize((oi.width*S,oi.height*S),Image.NEAREST)
        w=(oi.width+16 if oi else 0)+ni.width+(si.width+10 if si else 0)
        if x+w>1540:x=20;y+=rowh+40;rowh=0
        h=max(ni.height,oi.height if oi else 0);base=y+h
        cx=x
        if oi:sheet.alpha_composite(oi,(cx,base-oi.height));cx+=oi.width+16
        sheet.alpha_composite(ni,(cx,base-ni.height));cx+=ni.width+10
        if si:sheet.alpha_composite(si,(cx,base-si.height))
        d.text((x,base+4),f'{n}  {len(o[0])}x{len(o)}',fill='#e8c060',font=font(14))
        x+=w+36;rowh=max(rowh,h)
    # game-zoom line-up next to the player and the redone named
    from monastery_named import warrior
    ly=y+rowh+50;d.rectangle((0,ly,1560,ly+260),fill='#1e2030')
    d.text((20,ly+10),'Game zoom (4x): zealot, deacon, Acolyte, you, wolf, Greyfang, boar, big tunnel rat, Gnawbone, beetle, Ironshell, Bride, elementals',fill='#fff',font=font(16))
    wr,wp=warrior();x=20;base=ly+230
    line=[(outline(ZEAL),CULT_SET[0][2]),(outline(DEAC),CULT_SET[4][2]),(outline(ACOL),CULT_SET[6][2]),(wr,wp),(outline(pad(WOLF)),WP),
          ('greyfang',None),(outline(pad(BOAR)),BP),(outline(pad(BRAT)),RP),('gnaw',None),(outline(pad(BEET)),EP),(outline(pad(IRON)),IP),(outline(pad(BRIDE)),WB),(outline(pad(EARTH)),EAP),(outline(pad(FIRE)),FP)]
    for rows,pal in line:
        if pal is None:
            im=Image.open('/tmp/cur/%s.png'%rows).convert('RGBA');im=im.resize((im.width*4,im.height*4),Image.NEAREST)
        else:im=img(rows,pal,4)
        sheet.alpha_composite(im,(x,base-im.height));x+=im.width+8
    sheet=sheet.crop((0,0,1560,ly+260))
    out=os.path.join(os.path.dirname(__file__),'..','art','drafts','redesign-draft2.png');sheet.save(out);print('wrote',out)

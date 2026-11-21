# Draft sprites for Dungeon 1's other two named (character chat, Nov 21): the Drowned Prior and the Bellringer.
# Same family as the monastery's hooded cultists, upgraded like Brother Malrec (v0.65): own model, real detail, one clear
# differentiator each. Fill-only text grids (same format as js/data/sprites.js); outline() adds the black edge.
# Run: python3 tools/monastery_named.py -> writes art/drafts/monastery-named-draft1.png
import os,sys; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw,ImageFont
from undead_mobs import outline,img,MALREC,MP

def step(rows,back=True):
    """Walk frame: the trailing half of the hem lifts a pixel (the robe swings), like Malrec's."""
    g=[list(r) for r in rows];H=len(g);W=len(g[0])
    xs=[x for x in range(W) if g[H-1][x]!='.'];mid=(xs[0]+xs[-1])//2
    for x in range(W):
        if (x<=mid)==back and g[H-1][x]!='.':g[H-1][x]='.'
    return [''.join(r) for r in g]

# ---------------- The Drowned Prior ----------------
# The monastery's prior, drowned in the flood and still standing in it. Same hood family as the cult, but the hood is soaked
# and slumps to one side; his face shows: bloated, grey-green, sunken holes with pale glowing pupils, slack open jaw.
# A prior's silver chain and round seal, tarnished. The habit is darker and wetter from the waist down, weed and river-grass
# hang off his shoulders and hem, the hem is in tatters and drips. In his hand the dead lantern, now with a faint drowned
# glow inside (the one light in his flooded chamber). Barnacle-pale specks on the sleeve.
PRP=dict(k='#0b0a0f',H='#5e6e64',h='#46544c',d='#303c36',D='#222c28',f='#121816',p='#a9b8a6',P='#7d8f80',q='#5c6e60',e='#d8f0e8',
         s='#7e8a86',S='#c6d0cc',w='#26342f',W='#34443d',v='#3a5a32',V='#5e8040',l='#4c4a42',L='#77735f',g='#28403a',
         G='#8fd0b4',x='#e4fff4',b='#4f8796',B='#9ccfdc',c='#c8c8b4')
PRIOR=[
"......hhhhhh...........",
".....hHHHHHhh..........",
"....hHHHHHHHhh.........",
"...dhHHhhhhHHhh........",
"...dhHfpppppfHhh.......",
"..ddhffepPfefhhHh......",
"..ddhfppPPpppfhHh......",
"..ddhfpPffPpfhhhh......",
"..dddhfpffpffhhdd......",
"..vddhhfppqfhhhddv.....",
".vVddhhhhfhhhhhdddV....",
".vddhhhhsShhhhHhdddv...",
"vVdhhhhhhsSsShHhhhddv..",
"vddhhhhhhsSSShHhhhcpPs.",
"vddhhhhhhhSGShhhhhhPps.",
"vdhhhhhhhhsSshhhhhdd.s.",
"Vdhhvhhhhhhhhhhvhhd..s.",
"vdhhVhhhhhhhhhhVhhd.LLL",
"vdwwvwwwwwwWWWWvWWd.lxl",
".dwwvwwwwwwwWWWvWWd.lGl",
".dwwvwwwwwwwwWWvWWd.lGl",
".dwwvwwwwwwwwWWvWdd.LLL",
".dwVwwwwwwwwwwWVwWd..L.",
".dwVwwwwwwwwwwwVWwd....",
".dvwwwVwwwwwVwwwvwd....",
".dw.w.ww.wwV.w.wv.d....",
"..b...b......b...b.....",
]
# drips under the hem only in the standing frame read as water falling; step frame moves them a row (they fall)
PRIOR_STEP=PRIOR[:-2]+[
".dw.w.ww.wwV.w.wv......",
"..b......b.......b.....",
]
# colour the far side of the habit darker: anything left of the medallion column stays 'h'; that's fine as drawn.

# ---------------- The Bellringer ----------------
# The monastery's bellringer, gone with the cult: the biggest of them, a hunched hulk in a soot-brown habit. Still hooded
# (the family look), but the hood is short and his head sits low and forward between huge shoulders. Linen rags wrapped
# round his ears under the hood (rang the bells till he went deaf), ember eyes. A scorched leather foundry apron over the
# habit with a burn hole, a rope belt with a small handbell hanging off it, bare thick forearms. His weapon is the great
# bell's iron clapper: a long rod with a heavy pear-shaped ball and the ring it hung from, held up like a maul.
BRP=dict(k='#0b0a0f',H='#6a5442',h='#4e3e30',d='#382c22',D='#261d17',f='#140f0c',e='#ff7a34',E='#ffd090',c='#cfc4a8',C='#9a8f78',
         a='#5a3a26',A='#7a5236',z='#2a1a12',r='#a08a5a',R='#6e5c3a',y='#b08a3a',Y='#e0c070',n='#5a5a62',N='#8a8a94',
         m='#3a3a42',s='#b88a6a',S='#8a5e46',o='#3a2a20')
BELL=[
"..................mNNm....",
".................mNNNNm...",
"................mNNNYNNm..",
"................mNnnnNNm..",
"........DDDD....mNnnnnNm..",
"......DDHHHHDD...mNnnNm...",
".....DHHHHHHHHD...mnnm....",
"..dddDHHhhhhHHHD...nm.....",
".ddhhDHhhhhhhhHD...nm.....",
"ddhhhDHcffffffcHD..nm.....",
"dhhhhDcCfefffecCD..nm.....",
"dhhhhhDcffffffcDhh.nm.....",
"dhhhhhhDDffffDDhhhsSs.....",
"dhhhhhhhhDDDDhhhhsSsS.....",
"dhhhhhhaAAAAAahhhSsSs.....",
"dhhDhhhaAAAAAAahhh.nm.....",
"dhhDhhaaAAAzAAahhd.nm.....",
"Dhhhhhrrrrrrrrrrhh.nm.....",
"dhhhhhaRaAAAAAaahh.nm.....",
"dDhhhhayaAAAAAaahd.nm.....",
"sSDhhhaYyaAAAAaahd.nm.....",
"SsSdhhaYYaAAAAAahd.nm.....",
"sSsdhhayyazaaaaahd.nm.....",
".SsDhhaaaaaaaaaahd.mNm....",
"Dddhhhaaaaaaaaaahdd.m.....",
"Ddddhhhhhhhhhhhhhdd.......",
".DDdd.dddd.dddd.ddD.......",
]
BELL_STEP=step(BELL)

GRIDS=[('Drowned Prior',PRIOR,PRIOR_STEP,PRP),('Bellringer',BELL,BELL_STEP,BRP)]

# ---- the current placeholders (port of render.js mkRobed) so old and new sit side by side ----
def shift(hexc,d):
    n=int(hexc[1:],16);c=[n>>16,(n>>8)&255,n&255]
    c=[max(0,min(255,v+d[i]+(round(d[i]*(v-60)/120) if d[i] and v>60 else 0))) for i,v in enumerate(c)]
    return '#'+''.join(f'{v:02x}' for v in c)
ROBED={'prior':dict(w=20,h=23,robe='#3e4a44',eye='#d8f0e8',item='lantern'),'bellringer':dict(w=22,h=25,robe='#4a3a2c',eye='#ff6a30',item='maul'),
       'deacon':dict(w=15,h=20,robe='#4a1c1e',eye='#ff4a30',item='mace'),'zealot':dict(w=14,h=19,robe='#5a2a24',eye='#ff4a30',item='sickle')}
def robed(id):
    S=ROBED[id];W,H=S['w'],S['h'];cx=(W-1)/2;rx=W*0.29;ry=H*0.235;hy=H*0.23;b0=round(H*0.37)
    g=[['.']*W for _ in range(H)]
    inHood=lambda i,j:((i-cx)/rx)**2+((j-hy)/ry)**2<1
    half=lambda j:2.4+(j-b0)/2.6
    inBody=lambda i,j:b0<=j<H and abs(i-cx)<=half(j)
    ins=lambda i,j:inHood(i,j) or inBody(i,j)
    for j in range(H):
        for i in range(W):
            if not ins(i,j):continue
            hx=i-cx;edge=not ins(i-1,j) or not ins(i+1,j) or not ins(i,j-1) or j==H-1 or not ins(i,j+1)
            c='k' if edge else 'A' if hx<-1 else 'd' if hx>1.2 else 'a'
            if not edge and inHood(i,j) and ((i-cx)/(rx*0.58))**2+((j-hy-0.9)/(ry*0.6))**2<1:c='f'
            g[j][i]=c
    ey=round(hy+0.6);g[ey][round(cx-1)]='e';g[ey][round(cx+1)]='e'
    belt=b0+round((H-b0)*0.42)
    for i in range(W):
        if g[belt][i] not in '.k':g[belt][i]='b'
    def put(i,j,c):
        if 0<=j<H and 0<=i<W:g[j][i]=c
    it=S['item']
    if it=='sickle':
        for i,j in [(W-2,b0+6),(W-1,b0+5),(W-1,b0+4),(W-1,b0+3),(W-2,b0+2),(W-3,b0+2)]:put(i,j,'l')
        put(W-2,b0+7,'o');put(W-3,b0+8,'o')
    if it=='mace':
        for j in range(b0+3,b0+8):put(W-1,j,'o')
        put(W-2,b0+1,'k');put(W-1,b0+1,'l');put(W-2,b0+2,'l');put(W-1,b0+2,'l')
    if it=='lantern':
        for j in range(b0+1,b0+5):put(W-1,j,'c')
        put(W-2,b0+5,'k');put(W-1,b0+5,'g');put(W-2,b0+6,'g');put(W-1,b0+6,'g');put(W-2,b0+7,'k');put(W-1,b0+7,'k')
        for i in range(2,W-2,3):
            j=b0+2+((i*7)%(H-b0-3))
            if g[j][i] not in '.k':put(i,j,'v')
            if j+1<H and g[j+1][i] not in '.k':put(i,j+1,'v')
    if it=='maul':
        for j in range(b0-3,b0+8):put(W-2,j,'o')
        for j in range(b0-6,b0-2):put(W-3,j,'k');put(W-2,j,'n');put(W-1,j,'k')
        put(W-2,b0-7,'k')
    r=S['robe']
    pal=dict(k='#0b0a0f',a=r,A=shift(r,[30,28,26]),d=shift(r,[-24,-22,-20]),f='#100c0e',e=S['eye'],b=shift(r,[-40,-38,-34]),
             l='#a8a8b4',o='#5a4028',r='#ff8a3c',R='#ffe0a0',c='#8a8690',n='#a0802a',w='#e8e0c8',g='#3a4a44',v='#3a5a32')
    return [''.join(x) for x in g],pal

def warrior():
    import re,json
    src=open(os.path.join(os.path.dirname(__file__),'..','js','data','sprites.js')).read()
    common=json.loads(re.search(r'const RAG15_COMMON=(\{.*?\});',src).group(1))
    m=re.search(r'\n  warrior:\{r:(\[.*?\]),a:.*?c:(\{.*?\})\}',src)
    return json.loads(m.group(1)),dict(common,**json.loads(m.group(2)))

if __name__=='__main__':
    for n,a,b,pal in GRIDS:
        assert len(set(len(r) for r in a+b))==1,(n,[len(r) for r in a])
        bad=set(''.join(a+b))-set(pal)-{'.'};assert not bad,(n,bad)
    S=7;font=lambda s:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
    try:fb=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
    except OSError:fb=font(22)
    sheet=Image.new('RGBA',(1500,720),'#2b2d28');d=ImageDraw.Draw(sheet)
    d.text((20,14),'Drowned Prior and Bellringer, draft 1 (character chat, Nov 21). Left: in the game now. Right: new (stand + step).',fill='#ffffff',font=font(20))
    x0=20;y=60
    for (n,a,b,pal),old in zip(GRIDS,('prior','bellringer')):
        d.text((x0,y),n,fill='#e8c060',font=font(20))
        orows,opal=robed(old);oi=img(orows,opal,S)
        ni=img(outline(a),pal,S);si=img(outline(b),pal,S)
        base=y+40+max(ni.height,si.height)
        sheet.alpha_composite(oi,(x0,base-oi.height))
        d.text((x0,base+6),'now (shared cultist shape)',fill='#aaaaaa',font=font(14))
        sheet.alpha_composite(ni,(x0+260,base-ni.height));sheet.alpha_composite(si,(x0+260+ni.width+30,base-si.height))
        d.text((x0+260,base+6),f'new {len(outline(a)[0])}x{len(outline(a))}',fill='#aaaaaa',font=font(14))
        x0+=720
    # game-zoom line-up next to the player, Malrec and the cult
    ly=350;d.rectangle((0,ly,1500,720),fill='#1e2030')
    d.text((20,ly+12),'Game zoom line-up: zealot, deacon, you (warrior), Drowned Prior, Bellringer, Brother Malrec',fill='#ffffff',font=font(18))
    wr,wp=warrior()
    line=[(robed('zealot')),(robed('deacon')),(wr,wp),(outline(PRIOR),PRP),(outline(BELL),BRP),(outline(MALREC),MP)]
    Z=4;x=30;base=ly+300
    for rows,pal in line:
        im=img(rows,pal,Z);sheet.alpha_composite(im,(x,base-im.height));x+=im.width+40
    d.text((20,base+20),'Same scale as the game at the default zoom (4x here). Malrec is the bar for "upgraded".',fill='#aaaaaa',font=font(14))
    out=os.path.join(os.path.dirname(__file__),'..','art','drafts','monastery-named-draft1.png')
    sheet.save(out);print('wrote',out)

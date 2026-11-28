# Gear look ladder, draft 1 (character lane, Nov 27): one robe class (Wizard) and one plate class (Warrior), with their
# weapons, from rags to the end of the game in 6 steps, so the whole scope is judged before Zone 1's small steps are built.
# Rules from the owner: the body stays 15 x 18 and gear grows the outline; Zone 1 shows chest and head only, colour and trim
# (no shape changes); silhouettes change from Zone 2; capes and big pieces late; glow only at the very end. Weapons never
# grow past their look-4 size: later looks are new colours only. Step 0 is today's in-game look.
# Run: python3 tools/look_ladder_draft.py -> art/drafts/look-ladder-draft1.png (+ -game.png, -turn.gif)
import os,sys;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from PIL import Image,ImageDraw,ImageFont
import player_frames as F, player_pass_draft as PD, weapon_looks as WL
outline=WL.outline

def pad(rows,l=2,t=4):return ['.'*17]*t+[('.'*l+r).ljust(17,'.') for r in rows]
STEPS=['Rags','Zone 1 early','Zone 1 end','Zone 2','End of launch','Expansions']
WHEN=['today, level 1','first drops','Malrec','the Mire','Zone 3 and on','far future']
# What changes at each step (shown on the review page).
NOTE={
'wizard':['Today\'s look: grey robe, plain staff.',
  'Robe dyed the class blue. Same shape.',
  'Cream trim down the front and hem, a band on the hat. Still the same shape.',
  'First shape change: a short mantle over the shoulders, the hat a pixel taller with a wider brim.',
  'A hooded cape shows on the back, gold trim, a star on the hat.',
  'Tall hat with a glowing band and runes, high collar, long flared robe, gold-edged cape.'],
'warrior':['Today\'s look: bandana, cloth tunic, plank shield.',
  'Leather cap and a laced leather jerkin. Same shape.',
  'Iron cap with a nose guard, a mail shirt over the red tunic. Same shape.',
  'First shape change: open steel helm, a pauldron on each shoulder, breastplate, iron-rimmed shield.',
  'Closed helm with a red crest, bigger pauldrons, gold trim, crimson shield and a cape.',
  'Winged helm, silver plate with gold, kite shield with a glowing crest, cape to the ground.']}

B={}  # class -> list of (fill rows, palette, grip (x,y) in fill rows, weapon look, weapon palette tier)
LEGS=["......ww.ww","......ww.ww","......ww.ww","......OO.OO"]
# ---------- Warrior (plate)
r0,g0=F.cut('warrior',PD.D['warrior']['idle']);wp0={k:v for k,v in PD.D['warrior']['pal'].items() if v and len(k)==1}
WG=(g0[0]+2,g0[1]+4)
w1=pad([]) [:4]+[
"......AABB","....BAABBBC",".....Cesses",".....ssssss","......ssss",".......ss",
"...ooonnnNNs","..oOooinvNNsSS","..oOIoinnNNx","..oOooiyyby","...ooonnvNd",".....HnNnNd"]+LEGS
w2=pad([])[:4]+[
"......AABB","....BAABBBC",".....CesCes",".....ssssss","......ssss",".......ss",
"...ooomMmMMM","..oOooiMmMMsSS","..oOIoimMmMx","..oOooiyyby","...ooouUuUR",".....uUuUuR"]+LEGS
w3=pad([])[:3]+[
"........B","......BAAB","....BAABBBC",".....BesseB",".....BssssC","......ssss",".....CBssABB",
"...rrrBABBCABC","..rOooiABBCBSS","..rOIoiABBCB","..rOooiyyby","...rrrABBBC",".....mMmMmM"]+LEGS
w4=['.'*17]+[
".......FF","......FFf","......BFfB",".....BAFBB","....BAABBBC",".....BBeeeB",".....BABBBC","......CBBC",
"....ABBCCAABD","...DDDBADBCABD","..DQRRiADBCBSS","..DQIRiADBCB","..DQRRiyyby","..VDDDABDBC",".UVVVABCBCB",
".UVVVVwwVww",".UVVVVwwVww","UVVVVVwwVww","..VVV.OO.OO"]
w5=['.'*17]+[
"...D........D","...DD......DD","....DEABBBED",".....EAAGBBE","....BAABBBBC",".....BBeeeB",".....DABBBD","......CBBC",
"...DABBCCAABDD","...DDDBAGBCAABD","..DBBBiADBCBSS","..DBGBiADBCB","..DBBBiDDGD",".UVDDDABDBC","UVVVDABCBCB",
"UVVVVVwwVww","DUVVVVwwVww","DUVVVVwwVww","DDDDD.OOVOO"]
C=dict(PD.P.COMMON)
WP=[wp0,
 {**wp0,'A':'#9a7448','B':'#7a5636','C':'#563a22','n':'#7a5636','N':'#5a3e26','d':'#40291a','H':'#94704a','v':'#c8a878','b':'#b08a3a'},
 {**wp0,'A':'#b8b4c4','B':'#8d8692','C':'#5e5a66','m':'#a4a0ae','M':'#6a6570','u':'#a32a34','U':'#7a1e26','R':'#561419','b':'#8d8692'},
 {**wp0,'A':'#c8c6d2','B':'#9a96a4','C':'#66626e','m':'#a4a0ae','M':'#6a6570','r':'#8d8692','S':'#9a96a4','x':'#9a96a4','b':'#8d8692'},
 {**wp0,'A':'#e4e4ee','B':'#b4b8c8','C':'#767a8e','D':'#d4ad3a','E':'#9a7a22','F':'#c03030','f':'#7a1a1a','R':'#8a2a30','Q':'#5a1a1e',
  'I':'#d4ad3a','U':'#a32a34','V':'#6a1a22','w':'#9a96a4','O':'#66626e','S':'#b4b8c8','b':'#d4ad3a'},
 {**wp0,'A':'#e0e2ec','B':'#a8acc0','C':'#686c84','D':'#ffd27a','E':'#c9a227','G':'#fff2b0','U':'#a32a34','V':'#6a1a22',
  'w':'#c8ccdc','O':'#80849a','S':'#c8ccdc'}]
B['warrior']=[(pad(r0),WP[0],WG,1,1),(w1,WP[1],WG,2,2),(w2,WP[2],WG,4,4),(w3,WP[3],WG,5,5),(w4,WP[4],WG,5,6),(w5,WP[5],WG,5,7)]
# ---------- Wizard (robe)
r0,g0=F.cut('wizard',PD.D['wizard']['idle']);zp0={k:v for k,v in PD.D['wizard']['pal'].items() if v and len(k)==1}
ZG=(g0[0]+2,g0[1]+4);base=pad(r0)
z2=base[:8]+["...AAAADDDDQ"]+base[9:14]+["....HnnDnnNd","....HnnDnNNd","....HnnDnNNNd","....DDDDDDDDE"]+base[18:]
z3=['.'*17]*3+[".........AQ","........AaQ",".......AaaQ","......AaaaQ","......AaaaaQ","..AAAAADDDDDQ",".....sesses",
"...MMsWWWWsMM","..MMMmWWWmMMm","...mMnnWWNdnsS","...sHyyWyyyN","....HnnDnnNd","....HnnDnNNd","....HnnDnNNNd","....DDDDDDDDE",
".....ww.ww",".....OO.OO"]
z4=['.'*17]*2+["..........AQ",".........AaQ","........AaaQ",".......AaGaQ","......AaaaaQ",".AAAAAADDGDDQ","..U..sesses",
"..UUMsWWWWsMM",".UUMMmWWWmMMm",".UVmMnnWWNdnsS",".UVsHDDWDDDN",".UVVHnnDnnNd","UVVVHnnDnNNd","UVVVHnnDnNNNd","UVVVDDDDDDDDE",
"UVV..ww.ww",".VV..OO.OO"]
z5=[".........G",".........AQ","........AaQ","........AaQ",".......AaaQ",".......AGaQ","......AaaaQ",".....GGGGGGQ",
"AAAAAAAaaaaaQ","...DDsesses","..UDDsWWWWsDD",".UUMMmWWWmMMm",".UVmMnGWWNdnsS",".UVsHDDWDGDN",".UVVHnnDnnNd","UVVVHnGDGnNNd",
"UVVVHnnDnNNNdd","UVVHnnnDnnNNNd","UVDDDDDDDDDDDE","DDD..OO.OO"]
BLUE={'n':'#3c4a7a','H':'#56669a','N':'#2c3860','d':'#222a48'}
ZP=[zp0,{**zp0,**BLUE},{**zp0,**BLUE,'D':'#a8a08a','E':'#7a7462'},
 {**zp0,**BLUE,'D':'#a8a08a','E':'#7a7462','M':'#5a5070','m':'#3e3650'},
 {**zp0,'n':'#2e3e72','H':'#46589a','N':'#22305a','d':'#182240','A':'#3a4c86','a':'#2e3e72','Q':'#1e2a50','D':'#c9a227','E':'#8a6e1a',
  'G':'#7dbbff','M':'#3a2e5a','m':'#241c3c','U':'#3a2e5a','V':'#241c3c'},
 {**zp0,'n':'#3a3a7a','H':'#5a5aa0','N':'#2a2a5a','d':'#1c1c3c','A':'#4a4a8e','a':'#3a3a7a','Q':'#22224a','D':'#ffd27a','E':'#c9a227',
  'G':'#9fd8ff','M':'#e8e4f0','m':'#b8b4c8','U':'#2a2a5a','V':'#16163a'}]
B['wizard']=[(base,ZP[0],ZG,1,1),(base,ZP[1],ZG,2,2),(z2,ZP[2],ZG,4,4),(z3,ZP[3],ZG,4,5),(z4,ZP[4],ZG,4,6),(z5,ZP[5],ZG,4,7)]
# ---------- Weapons: look shapes from weapon_looks.py; looks 6 and 7 are new colours on the look-4/5 shape (size never grows).
TYPE={'wizard':('staff','#7dbbff'),'warrior':('sword','#ffd27a')}
LOOKPAL={**WL.LOOK,6:{'l':'#fff2c8','i':'#e0b84a','I':'#9a7a22','y':'#f6f6fc','Y':'#b4b8c8'},
                   7:{'l':'#ffffff','i':'#d8e8ff','I':'#8aa0d0','y':'#ffd27a','Y':'#c9a227','g':'#fff2b0'}}
def weapon(cls,shape,tier):
    t,acc=TYPE[cls];L=WL.W[t];rows,gr=L[shape] if shape in L else L[max(L)]
    p={'k':'#0b0a0f',**WL.BASE,**WL.LOOK[min(tier,5)],**LOOKPAL.get(tier,{})}
    if tier>=2 and tier<7:p['g']=acc
    o=outline(rows);line=rows[gr];hc=[i for i,c in enumerate(line) if c in 'oOIi'];gc=hc[len(hc)//2] if hc else len(line)//2
    return o,p,(gc+1,gr+1)
def picture(cls,i):
    rows,p,grip,shape,tier=B[cls][i];body=outline(rows);wr,wpal,wg=weapon(cls,shape,tier)
    pal={**C,**p}
    ox,oy=grip[0]+1-wg[0],grip[1]+1-wg[1]
    L=max(0,-ox);T=max(0,-oy);W=max(len(body[0]),ox+len(wr[0]))+L;H=max(len(body),oy+len(wr))+T
    im=Image.new('RGBA',(W,H),(0,0,0,0))
    def put(g,pp,dx,dy):
        for y,r in enumerate(g):
            for x,c in enumerate(r):
                if c!='.' and c in pp:im.putpixel((x+dx,y+dy),tuple(int(pp[c][j:j+2],16) for j in (1,3,5))+(255,))
    put(wr,wpal,ox+L,oy+T);put(body,pal,L,T)
    feet=T+len(body)  # bottom of the body: the ground line
    if tier==7:  # the very end: a faint glow around the weapon's top only (glow saved for last)
        gl=Image.new('RGBA',im.size,(0,0,0,0))
        for y in range(oy+T,oy+T+6):
            for x in range(ox+L-1,ox+L+len(wr[0])+1):
                if not(0<=x<W and 0<=y<H) or im.getpixel((x,y))[3]:continue
                if any(0<=x+a<W and 0<=y+b<H and im.getpixel((x+a,y+b))[3] for a,b in((1,0),(-1,0),(0,1),(0,-1))):
                    gl.putpixel((x,y),(255,242,176,110))
        im=Image.alpha_composite(gl,im)
    return im,L,feet
def missing(cls,i):
    rows,p,_,_,_=B[cls][i];pal={**C,**p}
    return sorted({c for r in rows for c in r if c!='.' and c not in pal})

if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    for cls in B:
        for i in range(6):
            m=missing(cls,i)
            if m:print('missing colours',cls,i,m)
    S=6;BG=(52,62,40,255);cw=26*S;rh=30*S;top=40
    f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',15)
    fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
    sh=Image.new('RGBA',(6*cw+20,top+2*rh+20),BG);d=ImageDraw.Draw(sh)
    for i in range(6):
        x=10+i*cw;d.text((x+6,8),STEPS[i],font=f,fill=(255,210,122));d.text((x+6,24),WHEN[i],font=fs,fill=(190,190,170))
    for row,cls in enumerate(('wizard','warrior')):
        for i in range(6):
            im,L,feet=picture(cls,i);im=im.resize((im.width*S,im.height*S),Image.NEAREST)
            x=10+i*cw+(cw-17*S)//2-L*S+S;y=top+row*rh+rh-14-feet*S
            sh.alpha_composite(im,(x,y))
    sh.save('art/drafts/look-ladder-draft1.png')
    # Near game size (3x) beside each other, the way they read on the phone
    S=3;g=Image.new('RGBA',(6*26*S+20,2*30*S+10),BG)
    for row,cls in enumerate(('wizard','warrior')):
        for i in range(6):
            im,L,feet=picture(cls,i);im=im.resize((im.width*S,im.height*S),Image.NEAREST)
            g.alpha_composite(im,(10+i*26*S+(26*S-17*S)//2-L*S,5+row*30*S+30*S-6-feet*S))
    g.save('art/drafts/look-ladder-draft1-game.png')
    print('ok')

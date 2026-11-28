# Town 1 townsfolk, draft 1 (map chat, Nov 28): smith, gem cutter, banker, Marrow the Peddler and the wizard, drawn
# pixel by pixel at 15 x 18 like the players (13 x 16 fill + outline), facing front, two idle frames each.
# python3 tools/townsfolk_draft.py -> art/drafts/townsfolk-draft1.png (sheet), .gif (idle loop), -town.png (in place)
import sys, os
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from player_rags import outline, COMMON

NPC = {}
# Smith (repair): bald and burly, black beard, leather apron over a grey shirt, bare forearms, a hammer.
NPC['smith'] = dict(name='Smith', job='Repairs your gear', frames=[[
"....SSSS.....",
"...SSSSss....",
"...sesses....",
"...ssssss....",
"...hhhhhh....",
"..CChhhhCC...",
".sCCAAAACCs..",
".sSCAAAACSs..",
".ssCAAAACss..",
".s.AAAAAA.s..",
"...AAAAAA.o..",
"...AAyAAA.o..",
"...AAAAAA.II.",
"...ww..ww.II.",
"...ww..ww....",
"...OO..OO...."],[
"..........II.",
"....SSSS..IIo",
"...SSSSss..o.",
"...sesses.s..",
"...ssssss.S..",
"...hhhhhh.s..",
"..CChhhhCs...",
".sCCAAAACC...",
".sSCAAAAC....",
".ssCAAAAC....",
".s.AAAAAA....",
"...AAAAAA....",
"...AAyAAA....",
"...ww..ww....",
"...ww..ww....",
"...OO..OO...."]], pal={'h':'#2a2220','C':'#7a7672','A':'#6a4428','y':'#3a2818','I':'#8e8a86','o':'#5a3a22'})
# Gem cutter (enchanting): green cap, brass loupe over one eye, waistcoat over a work apron, a gem in hand.
NPC['gems'] = dict(name='Gem cutter', job='Enchants your gear (orbs, +1 to +5)', frames=[[
"....GGGG.....",
"...GGGGGG....",
"..ggggggg....",
"...hssssh....",
"...hBBssh....",
"...hBesesh...",
"....ssss.....",
"..VVcccVV....",
".VVPPPPPVV...",
".sVPPPPPVs...",
"..VPyPyPV.s..",
"..VPPPPPV.m..",
"..VPPPPPV....",
"...PPPPP.....",
"...ww.ww.....",
"...OO.OO....."],None], pal={'G':'#3e6a4a','g':'#2c4c36','h':'#8a8a8a','B':'#c8a040','V':'#4a3a5a','c':'#e4dccb','P':'#8a6a4a','y':'#c8a040','m':'#5ad0e0','M':'#c0f8ff'})
# Banker: grey hair, spectacles, a moustache, a long burgundy coat with gold buttons and a white cravat, a coin purse.
NPC['bank'] = dict(name='Banker', job='Keeps your bank', frames=[[
"....hhhh.....",
"...hhhhhh....",
"...hssssh....",
"...LeLLeL....",
"...ssssss....",
"...sxxxxs....",
"..RRRccRRR...",
".RRRRccRRRR..",
".RRRYRRYRRR..",
".sRRRRRRRRs..",
".sRRYRRYRRsQ.",
"..RRRRRRRR...",
"..RRRRRRRR...",
"...RRRRRR....",
"...ww..ww....",
"...OO..OO...."],None], pal={'h':'#b8b4ac','L':'#c8c4b8','x':'#9a948a','R':'#6a2430','c':'#ece6d8','Y':'#e8c850','Q':'#8a6a3a'})
# Marrow the Peddler (sell, buy orbs): a huge pack on his back, wide-brimmed hat, stubble, a walking stick, a pot.
NPC['marrow'] = dict(name='Marrow the Peddler', job='Buys junk, sells orbs', frames=[[
"..RRRRRRR....",
".RrrrrrrrR...",
".PPPTTTTPP...",
"TTTTTTTTTTT..",
".P.sesses.P.o",
".P.ssssss.P.o",
".P..hhhh..P.o",
".PDDDDDDDDPso",
".PDDDyDDDDP.o",
"IsDDDDyDDD..o",
"I.DDDDDyDD..o",
"..DDDDDDDD..o",
"..DDDDDDDD..o",
"...ww..ww...o",
"...ww..ww...o",
"...OO..OO...o"],None], pal={'P':'#b0965e','R':'#8a3a2a','r':'#6a2a20','T':'#4a3a2a','h':'#6a5a4a','D':'#5a5a3a','y':'#3a2818','I':'#5a5652','o':'#6e4a2a'})
# The wizard (main quest): long white beard to the belt, deep violet robe with gold stars, tall bent hat, a staff
# with a glowing orb (he talks to you through his scrying orb).
NPC['wizard'] = dict(name='The wizard', job='Main quest; sells horses on the side', frames=[[
"......U...M..",
".....UU..MMM.",
"....UUUU..o..",
"...UUYUUU.o..",
".UUUUUUUUUo..",
"...sesses.o..",
"...BBBBBB.o..",
"..VBBBBBBVs..",
".VVBBBBBBVo..",
".VVVBBBBVVo..",
".sVVBBBBVVo..",
"..VVVBBVVVo..",
"..VVVYVVVVo..",
"..VVVVVVVVo..",
"..VVVVVVVVo..",
"...OO..OO.o.."],None], pal={'U':'#3a3a8a','Y':'#e8c850','B':'#ece8e0','V':'#4a2a6a','M':'#7ab8ff','o':'#6e4a2a'})

def second(id, rows):
    r=[list(x) for x in rows]
    if id=='gems':   # the gem catches the light: glint and a sparkle above it
        r[11][10]='M'; r[10][11]='M'
    if id=='bank':   # a coin flipped up from the purse
        r[9][11]='Y'
    if id=='marrow': # a wink and a grin
        r[4][7]='s'; r[6][5]='S'
    if id=='wizard': # the orb pulses brighter
        r[0][10]='M'; r[1][9]='W'; r[1][10]='W'; r[1][11]='W'; r[0][9]='M'; r[0][11]='M'
    return [''.join(x) for x in r]
for k,v in NPC.items():
    if v['frames'][1] is None: v['frames'][1]=second(k,v['frames'][0])
    v['pal'].setdefault('W','#e8f4ff')

def sprite(id, f, S=1):
    rows=outline(NPC[id]['frames'][f]); pal={**COMMON, **NPC[id]['pal']}
    im=Image.new('RGBA',(15,18),(0,0,0,0))
    for y,row in enumerate(rows):
        for x,c in enumerate(row):
            if c!='.': im.putpixel((x,y),Image.new('RGB',(1,1),pal.get(c,'#ff00ff')).getpixel((0,0))+(255,))
    return im.resize((15*S,18*S),Image.NEAREST) if S>1 else im

if __name__=='__main__':
    out='art/drafts/townsfolk-draft1'
    S=8; ids=list(NPC); W=len(ids)*(15*S+40)+40
    sheet=Image.new('RGB',(W,18*S*2+150),'#1e2226'); d=ImageDraw.Draw(sheet)
    for i,id in enumerate(ids):
        x=40+i*(15*S+40)
        for f in (0,1):
            sheet.paste(sprite(id,f,S),(x,20+f*(18*S+30)),sprite(id,f,S))
        d.text((x,18*S*2+70),NPC[id]['name'],fill='#e8e2d4'); d.text((x,18*S*2+88),NPC[id]['job'][:24],fill='#a8a296')
        if len(NPC[id]['job'])>24: d.text((x,18*S*2+104),NPC[id]['job'][24:],fill='#a8a296')
    sheet.save(out+'.png')
    frames=[]
    for f in (0,1,0,1):
        im=Image.new('RGB',(len(ids)*19*6,22*6),'#2f3d26')
        for i,id in enumerate(ids): sp=sprite(id,f,6); im.paste(sp,(i*19*6+12,12),sp)
        frames.append(im)
    frames[0].save(out+'.gif',save_all=True,append_images=frames[1:],duration=[700,500,700,500],loop=0)
    print('ok')

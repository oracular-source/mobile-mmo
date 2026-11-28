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

# ---- Draft 2 (owner notes, Nov 28): real idle loops instead of two-frame twitches, drawn on a taller grid so a coin,
# a lifted hat or sparks can rise above the head. Grid 17 x 24 fill (19 x 26 with outline); the body sits at BX, BY.
# Glow pixels (GLOW) are drawn without an outline so sparks and motes read as light.
GW, GH, BX, BY = 17, 24, 2, 8
GLOW = set('*+~^')
GLOWPAL = {'*':'#fff6c8','+':'#ffe070','~':'#9ad8ff','^':'#d8b0ff'}
def frame(id, body_mods=None, over=None, bob=0, drop=()):
    rows=[list(r.ljust(13,'.')) for r in NPC[id]['frames'][0]]
    for (x,y),c in (body_mods or {}).items(): rows[y][x]=c
    g=[['.']*GW for _ in range(GH)]
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c!='.' and c not in drop: g[y+BY-bob][x+BX]=c
    for (x,y),c in (over or {}).items():
        if 0<=x<GW and 0<=y<GH: g[y][x]=c
    return g
def render(id, g, S=1):
    W,H=GW+2,GH+2; pal={'W':'#e8f4ff',**COMMON, **NPC[id]['pal'], **GLOWPAL}
    G=[['.']*W]+[['.']+r+['.'] for r in g]+[['.']*W]
    solid=lambda x,y: 0<=x<W and 0<=y<H and G[y][x] not in GLOW and G[y][x]!='.'
    im=Image.new('RGBA',(W,H),(0,0,0,0))
    for y in range(H):
        for x in range(W):
            c=G[y][x]
            if c=='.':
                if any(solid(x+a,y+b) for a,b in((1,0),(-1,0),(0,1),(0,-1))): im.putpixel((x,y),(11,10,15,255))
            else:
                h=pal.get(c,'#ff00ff').lstrip('#'); im.putpixel((x,y),tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,))
    return im.resize((W*S,H*S),Image.NEAREST) if S>1 else im
B=lambda x,y:(x+BX,y+BY)   # body coords -> grid coords

def loop(id):
    """List of (grid, ms) for one idle loop."""
    F=[]
    if id=='smith':   # rest, lift the hammer, bring it down on an unseen anvil: a burst of sparks
        up={(10,10):'.',(10,11):'.',(10,12):'.',(11,12):'.',(10,13):'.',(11,13):'.',(10,9):'.',(10,6):'s',(10,5):'s',(10,4):'o',(10,3):'o',(10,2):'I',(11,2):'I',(10,1):'I',(11,1):'I'}
        down={(10,10):'.',(10,11):'.',(10,12):'.',(11,12):'.',(10,13):'.',(11,13):'.',(10,9):'s',(11,9):'o',(12,9):'I',(12,10):'I'}
        sp={B(13,9):'*',B(14,8):'+',B(13,11):'+',B(14,11):'*',B(15,10):'+',B(12,12):'+'}
        F=[(frame(id),900),(frame(id,up),260),(frame(id,down,sp),120),(frame(id,down,{B(14,8):'+',B(15,11):'+'}),160),(frame(id,down),300),(frame(id),700)]
    if id=='gems':    # lifts the gem under her chin, turns it in the light, it flashes, lowers it
        base={(10,10):'.',(10,11):'.'}
        lift={**base,(10,9):'s',(10,8):'m'}
        held={**base,(10,9):'s',(9,8):'s',(8,7):'m'}
        F=[(frame(id),900),(frame(id,lift),180),(frame(id,held),300),
           (frame(id,{**held,(8,7):'M'},{B(8,5):'*',B(7,6):'+',B(9,6):'+',B(6,7):'+',B(10,7):'+',B(8,4):'+'}),140),
           (frame(id,{**held,(8,7):'M'},{B(8,6):'*',B(10,6):'+'}),160),(frame(id,held),260),
           (frame(id,{**held,(8,7):'M'},{B(9,6):'*'}),160),(frame(id,held),260),(frame(id,lift),180)]
    if id=='bank':    # flicks a coin high over his head, spinning (face, edge, face...), catches it, eyes follow it
        hand=(11,10); F=[(frame(id),900)]
        path=[-2,-6,-10,-13,-15,-16,-15,-13,-10,-6,-2]
        for k,dy in enumerate(path):
            x,y=B(*hand); y+=dy; o={}
            if k%2==0: o={(x,y):'Y',(x+1,y):'Y',(x,y+1):'Y',(x+1,y+1):'Y'}   # face on
            else: o={(x,y):'+',(x,y+1):'+'}                                  # edge on: a thin bright line
            mods={(11,10):'.',(10,9):'s'} if k<len(path)-1 else {}
            if dy<=-10: mods.update({(4,3):'L',(7,3):'L'})                    # glasses glint as he looks up
            F.append((frame(id,mods,o),80))
        F.append((frame(id,{},{B(11,9):'*'}),160)); F.append((frame(id),700))
    if id=='marrow':  # tips his hat right off his head, a little bow, puts it back
        hat=[(x,y) for y in range(4) for x,c in enumerate(NPC[id]['frames'][0][y].ljust(13,'.')) if c=='T']
        def lifted(dy, hand=True):
            o={B(x,y-dy):'T' for x,y in hat}
            if hand: o.update({B(11,4-dy+1):'s',B(11,5):'s',B(11,6):'s'})
            mods={(x,y):('h' if y==3 and 3<=x<=8 else 'P' if NPC[id]['frames'][0][y][x] in 'T' and y<3 else '.') for x,y in hat}
            mods[(11,7)]='.'
            return frame(id,mods,o)
        F=[(frame(id),1000),(lifted(1),140),(lifted(2),160),(lifted(3),600),(lifted(2),140),(lifted(1),140),(frame(id),900)]
    if id=='wizard':  # owner (Nov 28): keep only the staff animation: the orb swirls and sends sparks floating up.
        # He stands still: no float, no beard sway, no hat star twinkle.
        n=10
        for k in range(n):
            o={}; ox,oy=B(10,1)
            o[(ox,oy)]='W' if k%3==0 else 'M'
            o[(ox-1,oy)]='~' if k%3==1 else 'M'; o[(ox+1,oy)]='~' if k%3==2 else 'M'
            for m in range(3):                      # three sparks drifting up from the orb, staggered
                t=(k+m*3)%n; mx=ox+(-1,1,0)[m]+(1 if t%4==2 else 0); my=oy-2-t
                if my>=0 and t<7: o[(mx,my)]='^' if m==1 else '~'
            F.append((frame(id,{},o),150))
    return F

if __name__=='__main__':
    out='art/drafts/townsfolk-draft2'; ids=list(NPC); S=8
    loops={id:loop(id) for id in ids}
    # sheet: every frame of every loop, one row per person
    mx=max(len(v) for v in loops.values()); cw=(GW+2)*S+10
    sheet=Image.new('RGB',(mx*cw+20,len(ids)*((GH+2)*S+30)+10),'#1e2226'); d=ImageDraw.Draw(sheet)
    for r,id in enumerate(ids):
        for c,(g,ms) in enumerate(loops[id]):
            im=render(id,g,S); sheet.paste(im,(10+c*cw,10+r*((GH+2)*S+30)),im)
        d.text((10,10+r*((GH+2)*S+30)+(GH+2)*S+4),NPC[id]['name'],fill='#e8e2d4')
    sheet.save(out+'-frames.png')
    # one GIF per person at 6x, true timings
    for id in ids:
        fr=[];du=[]
        for g,ms in loops[id]:
            bg=Image.new('RGB',((GW+2)*6,(GH+2)*6),'#2f3d26'); im=render(id,g,6); bg.paste(im,(0,0),im); fr.append(bg); du.append(ms)
        fr[0].save(f'{out}-{id}.gif',save_all=True,append_images=fr[1:],duration=du,loop=0)
    print('ok')

# ---- Game export (v0.157): python3 tools/townsfolk_draft.py --game -> js/data/townsfolk.js (numbers only).
LINES = {
  'smith': ["Dented, chipped, cracked: bring it here, I'll hammer it true.", "Death is hard on armour. Easy on my purse.", "Mind the sparks."],
  'gems': ["An orb, a steady hand and a good eye. That's all enchanting is.", "Plus five is as far as any steel will take it. I've tried.", "Hold still, the light's just right."],
  'bank': ["Your things are safe with me. Safer than with you, out there.", "Deposits, withdrawals. No questions asked. Well, a few.", "Heads I keep it, tails you lose."],
  'marrow': ["Rat whiskers, beetle shells, old bones... bring them to me, I buy it all.", "They say Old Gnawbone ate a whole cart once. Wheels and all.", "Orbs? I've a few. Not cheap, mind."],
  'wizard': ["Ah, you're up. The dead won't stay buried; my orb will call you when I need you.", "Horses? Yes, I sell them. Don't ask why.", "Mind the orb. It bites."],
}
def export(path='js/data/townsfolk.js'):
    import json
    out={}
    for id in NPC:
        frames=[];seq=[]
        for g,ms in loop(id):
            W,H=GW+2,GH+2;G=[['.']*W]+[['.']+r+['.'] for r in g]+[['.']*W]
            solid=lambda x,y: 0<=x<W and 0<=y<H and G[y][x] not in GLOW and G[y][x]!='.'
            rows=[''.join(('k' if any(solid(x+a,y+b) for a,b in((1,0),(-1,0),(0,1),(0,-1))) else '.') if G[y][x]=='.' else G[y][x] for x in range(W)) for y in range(H)]
            key='\n'.join(rows)
            if key not in frames: frames.append(key)
            seq.append([frames.index(key),ms])
        used=set(''.join(frames))-set('.\n')
        pal={c:v for c,v in {'W':'#e8f4ff','k':'#0b0a0f',**COMMON,**NPC[id]['pal'],**GLOWPAL}.items() if c in used}
        out[id]={'name':NPC[id]['name'],'job':NPC[id]['job'],'lines':LINES[id],'pal':pal,'frames':[f.split('\n') for f in frames],'seq':seq}
    src=('// Town 1 townsfolk (v0.157, map lane; owner OK\'d draft 2, Nov 28): smith, gem cutter, banker, Marrow the Peddler, the wizard.\n'
         '// Numbers only, generated by tools/townsfolk_draft.py --game. Each frame is 19 x 26 (body 15 x 18 at the bottom, room above for\n'
         '// a coin, a lifted hat or sparks); seq is the idle loop as [frame, ms]. Glow pixels (* + ~ ^) have no outline.\n'
         "'use strict';\nconst TOWNSFOLK="+json.dumps(out,separators=(',',':'))+';\n')
    open(path,'w').write(src); print('wrote',path,len(src),'bytes')
if __name__=='__main__' and '--game' in sys.argv: export()

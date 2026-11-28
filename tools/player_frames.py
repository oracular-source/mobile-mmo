# Player bodies and attack poses into the game (character lane, Nov 27): takes the owner-approved draft 2 looks
# (tools/player_pass_draft.py, all 14 classes) and writes them into js/data/sprites.js as PLAYER15.
# Each class: s = standing, a/b = left/right foot lifted, p = poses {name: [wind-up frame, strike frame]}, x = anchor
# column per frame (the column that lines up with the standing body's middle, so a wider pose doesn't slide the body).
# Run: python3 tools/player_frames.py
import os,sys,json,re;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import player_pass_draft as PD, warrior_draft as W
import warrior_swing_draft as WS
# Owner (Nov 27): the old chop ended with the blade pointing at the ground and read as stabbing down; option A,
# a forward slash ending just below level, replaces it for all three knights (same body as chop_2, so same head spot).
W.F['slash_2']=WS.O['A'][2];PD.HEADBOX['slash_2']=PD.HEADBOX['chop_2']
outline=W.outline

def step(rows,side):
    # Lift one foot a pixel: the left or right group of boot pixels (O) in the bottom row, and the leg (w) above it.
    g=[list(r) for r in rows];last=g[-1];cols=[x for x,c in enumerate(last) if c=='O']
    groups=[];
    for x in cols:
        if groups and x==groups[-1][-1]+1:groups[-1].append(x)
        else:groups.append([x])
    for x in groups[side] if len(groups)>side else []:
        ys=[];y=len(g)-1
        while y>=0 and g[y][x] in 'wO':ys.append(y);y-=1
        for y in sorted(ys):g[y][x]=g[y+1][x] if y+1<len(g) else '.'
        g[len(g)-1][x]='.'
    return [''.join(r) for r in g]

def no_glow(rows,glow):
    # The staff strike (melee main attack for robe classes): the cast pose's staff lift, without the spell glow.
    # Only the three spots cast() puts the glow: the off hand (column 0, rows 8-9) and just above the staff top (column 11).
    g=[list(r) for r in rows]
    for y in (8,9):
        if g[y][0]==glow:g[y][0]='.'
    top=next(y for y in range(len(g)) if g[y][11]!='.')
    if g[top][11]==glow:g[top][11]='.'
    return [''.join(r) for r in g]

KNIGHTS=('warrior','paladin','shadowknight')
SHIFT={'rogue':1,'monk':1}  # strike frames that step one pixel forward (body drawn one column further right)
def frames(id):
    d=PD.D[id];poses={}
    if id in KNIGHTS:
        F=W.F if id=='warrior' else {k:PD.rehead(k,PD.heads[id]) for k in ('chop_1','slash_2','stab_1','stab_2')}
        poses['main']=[(F['chop_1'],0),(F['slash_2'],1)]   # auto attack: raise, slash forward
        poses['skill']=[(F['stab_1'],0),(F['stab_2'],1)]  # abilities: draw back, thrust
    elif id in PD.GLOW:
        poses['cast']=[(d['act'],0),(d['act'],0)]
        poses['main']=[(d['idle'],0),(no_glow(d['act'],PD.GLOW[id]),0)]  # staff strike for Cleric's Smite, Shaman's Jab
    else:
        s=SHIFT.get(id,0)
        poses['main']=[(d['idle'],0),(d['act'],s)]
    return d,poses

def grid(rows):return outline(rows)

# ---------- Weapon layer (character lane, Nov 27; owner OK'd the draft 4 weapon looks) ----------
# The bodies above were drawn holding their starter weapon. The game now draws the equipped weapon as its own layer
# (js/data/weapons.js), so each frame is cut here: the old weapon pixels are removed, and the frame records where the
# hand closes and which way the weapon pointed (its tip), so any weapon can be put back in that hand at that angle.
import math
def weapon_px(id,rows):
    """Which pixels of a fill grid are the old weapon (by class: the letters and where they sit)."""
    out=set()
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c=='.':continue
            if id in KNIGHTS: hit=x>=7 and (c in 'lL' or (c=='y' and y<9))   # sword: blade, guard, pommel (belt is lower)
            elif id=='rogue': hit=x>=9 and c in 'ly' and y<9                  # the dagger in the right hand (off-hand knife and belt stay)
            elif id=='ranger': hit=x>=10 and c in 'oB'                        # bow stave and string
            elif id in PD.GLOW: hit=x>=10 and c not in 'HnNdsS'               # staff and its head, right of the robe
            else: hit=False                                                   # Monk (fists) and Bard (lute; rapier at the hip)
            if hit:out.add((x,y))
    return out
# Bard: the lute stays in his hands (it is how he plays); his rapier hangs at the left hip, point down and back.
SHEATH={'bard':(3,10,236)}
def cut(id,rows):
    """Remove the weapon; return (rows, [grip x, grip y, angle in degrees clockwise from straight up] or None)."""
    wp=weapon_px(id,rows)
    if not wp:return rows,(list(SHEATH[id]) if id in SHEATH else None)
    g=[list(r) for r in rows]
    for x,y in wp:g[y][x]='.'
    fist=[(x,y) for y,r in enumerate(rows) for x,c in enumerate(r) if c=='S' and any(abs(x-a)+abs(y-b)<=2 for a,b in wp)]
    if not fist:fist=[min(((x,y) for y,r in enumerate(rows) for x,c in enumerate(r) if c=='S'),key=lambda f:min(abs(f[0]-a)+abs(f[1]-b) for a,b in wp))]
    fx=sum(f[0] for f in fist)/len(fist);fy=sum(f[1] for f in fist)/len(fist)
    # Weapon axis: principal direction of its pixels; the tip is the end farther from the hand (ties: the higher end).
    mx=sum(x for x,_ in wp)/len(wp);my=sum(y for _,y in wp)/len(wp)
    sxx=sum((x-mx)**2 for x,_ in wp);syy=sum((y-my)**2 for _,y in wp);sxy=sum((x-mx)*(y-my) for x,y in wp)
    th=0.5*math.atan2(2*sxy,sxx-syy);ux,uy=math.cos(th),math.sin(th)
    ends=[max(wp,key=lambda q:(q[0]-mx)*ux+(q[1]-my)*uy),min(wp,key=lambda q:(q[0]-mx)*ux+(q[1]-my)*uy)]
    # The tip is the end clearly farther from the hand (a sword held by its hilt); for a weapon held near its middle
    # (a staff) both ends are about as far, so the upper end is the top.
    d0,d1=(math.hypot(q[0]-fx,q[1]-fy) for q in ends)
    tip=ends[0] if d0-d1>=3 else ends[1] if d1-d0>=3 else min(ends,key=lambda q:q[1])
    if (tip[0]-mx)*ux+(tip[1]-my)*uy<0:ux,uy=-ux,-uy
    # Grip: the hand's centre moved onto the weapon line (so the weapon passes through the fist).
    t=(fx-mx)*ux+(fy-my)*uy;gx=round(mx+t*ux);gy=round(my+t*uy)
    ang=math.degrees(math.atan2(ux,-uy))%360
    for a in (0,90,180,270,360):
        if abs(ang-a)<9:ang=a%360
    return [''.join(r) for r in g],[gx,gy,round(ang)]

def build():
    out={}
    for id in PD.P.ORDER:
        d,poses=frames(id)
        pal={k:v for k,v in d['pal'].items() if v and len(k)==1}
        idle,gi=cut(id,d['idle']);s=grid(idle);mid=len(s[0])//2
        o1=lambda m:m and [m[0]+1,m[1]+1,m[2]]   # the outline adds one pixel on every side
        o={'s':s,'a':grid(step(idle,0)),'b':grid(step(idle,1)),'p':{},'x':{},'g':{'s':o1(gi)},'pg':{}}
        for name,fr in poses.items():
            cs=[cut(id,r) for r,_ in fr]
            o['p'][name]=[grid(r) for r,_ in cs];o['x'][name]=[mid+sh for _,sh in fr];o['pg'][name]=[o1(m) for _,m in cs]
        used=set(''.join(s+o['a']+o['b']+[l for fr in o['p'].values() for g in fr for l in g]))
        o['c']={k:v for k,v in pal.items() if k in used}
        out[id]=o
    return out

if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    data=build();path='js/data/sprites.js';src=open(path).read()
    head=('// PLAYER15_START (written by tools/player_frames.py, do not edit by hand)\n'
          '// Player bodies with attack poses (character lane, Nov 27; owner OK\'d draft 2 for all 14 classes). s = standing,\n'
          '// a/b = a foot lifted, p = poses {main: auto attack, skill: abilities, cast: spells} as [wind-up, strike],\n'
          '// x = the column that lines up with the standing body\'s middle, c = colours. Used ahead of RAG15.\n'
          '// Weapon layer (Nov 27): the old weapon is cut out; g.s / pg = [grip x, grip y, angle clockwise from up] per frame\n'
          '// (null = nothing in that hand), where js/render.js puts the equipped weapon (js/data/weapons.js).\n')
    body='const PLAYER15={\n'+',\n'.join('  %s:%s'%(k,json.dumps(v,separators=(',',':'))) for k,v in data.items())+'\n};\n// PLAYER15_END\n'
    block=head+body
    if 'PLAYER15_START' in src:src=re.sub(r'// PLAYER15_START.*?// PLAYER15_END\n',lambda m:block,src,flags=re.S)
    else:src=src.rstrip('\n')+'\n'+block
    open(path,'w').write(src)
    print('wrote PLAYER15 for',len(data),'classes')

# Player bodies and attack poses into the game (character lane, Nov 27): takes the owner-approved draft 2 looks
# (tools/player_pass_draft.py, all 14 classes) and writes them into js/data/sprites.js as PLAYER15.
# Each class: s = standing, a/b = left/right foot lifted, p = poses {name: [wind-up frame, strike frame]}, x = anchor
# column per frame (the column that lines up with the standing body's middle, so a wider pose doesn't slide the body).
# Run: python3 tools/player_frames.py
import os,sys,json,re;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import player_pass_draft as PD, warrior_draft as W
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
        F=W.F if id=='warrior' else {k:PD.rehead(k,PD.heads[id]) for k in ('chop_1','chop_2','stab_1','stab_2')}
        poses['main']=[(F['chop_1'],0),(F['chop_2'],1)]   # auto attack: raise, chop
        poses['skill']=[(F['stab_1'],0),(F['stab_2'],1)]  # abilities: draw back, thrust
    elif id in PD.GLOW:
        poses['cast']=[(d['act'],0),(d['act'],0)]
        poses['main']=[(d['idle'],0),(no_glow(d['act'],PD.GLOW[id]),0)]  # staff strike for Cleric's Smite, Shaman's Jab
    else:
        s=SHIFT.get(id,0)
        poses['main']=[(d['idle'],0),(d['act'],s)]
    return d,poses

def grid(rows):return outline(rows)

def build():
    out={}
    for id in PD.P.ORDER:
        d,poses=frames(id)
        pal={k:v for k,v in d['pal'].items() if v and len(k)==1}
        s=grid(d['idle']);mid=len(s[0])//2
        o={'s':s,'a':grid(step(d['idle'],0)),'b':grid(step(d['idle'],1)),'p':{},'x':{}}
        for name,fr in poses.items():
            o['p'][name]=[grid(r) for r,_ in fr];o['x'][name]=[mid+sh for _,sh in fr]
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
          '// x = the column that lines up with the standing body\'s middle, c = colours. Used ahead of RAG15.\n')
    body='const PLAYER15={\n'+',\n'.join('  %s:%s'%(k,json.dumps(v,separators=(',',':'))) for k,v in data.items())+'\n};\n// PLAYER15_END\n'
    block=head+body
    if 'PLAYER15_START' in src:src=re.sub(r'// PLAYER15_START.*?// PLAYER15_END\n',lambda m:block,src,flags=re.S)
    else:src=src.rstrip('\n')+'\n'+block
    open(path,'w').write(src)
    print('wrote PLAYER15 for',len(data),'classes')

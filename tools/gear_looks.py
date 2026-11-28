# Gear looks by zone (character lane, owner Nov 27): what you wear shows on the character, one look step per zone.
# Owner: each step of the look ladder is a new zone, not several steps in one zone; an item carries its zone's look (wearing
# Zone 1 items reads as Zone 1), and later a harder dungeon tier of an item can upgrade its look. Zone 1 = colour only
# (the owner's "start really small"): a chest item dyes the clothes, a head item dyes the hat, hood or helm. No shape changes.
# Head colours apply only above the shoulders (rows before the first clothes row), chest colours only from there down, so a
# letter both parts share (the Cleric's white, the Magician's red, the Monk's dark cloth) changes in the right place only.
# Run: python3 tools/gear_looks.py -> js/data/looks.js and art/drafts/gear-z1-draft3.png (+ -game.png)
import os,sys,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))

# LOOKS[class][slot][zone look] = {letter: colour}. Rags (no item) = look 0 = the class's own colours.
LOOKS={   # draft 2 (owner, Nov 27: v0.142 was "pretty much nothing"): each class's own colour, brighter and easier to read,
          # plus a gold or class-colour trim on the belt or sash. Wizard (B) and Warrior (C, bright red) picked by the owner.
 'druid':   {'chest':{1:{'H':'#9ad060','n':'#76b044','N':'#568a30','d':'#3e6622','y':'#f4c868'}},
             'head': {1:{'L':'#c0f060','G':'#88c844','h':'#b07a40'}}},
 'warrior': {'chest':{1:{'H':'#d05a58','n':'#b03a3c','N':'#86262c','d':'#5e1820','y':'#f4c868'}},
             'head': {1:{'R':'#e04848','h':'#6e4a2a'}}},
 'paladin': {'chest':{1:{'H':'#ffffff','n':'#f4f0e4','N':'#c4c0b4','d':'#9c988e','y':'#ffd24a'}},
             'head': {1:{'J':'#e4e8f4','j':'#a0a8c0'}}},
 'shadowknight':{'chest':{1:{'H':'#8a4a6a','n':'#6e3456','N':'#52243e','d':'#3a182c','y':'#d03a4a'}},
             'head': {1:{'J':'#7a82a8','j':'#4a5070'}}},
 'rogue':   {'chest':{1:{'H':'#7c9a5c','n':'#5e7a44','N':'#465c32','d':'#344424','y':'#c8aa60'}},
             'head': {1:{'A':'#566e48','a':'#3e5234','Q':'#283622'}}},
 'necro':   {'chest':{1:{'H':'#8a62a0','n':'#6c4886','N':'#52346a','d':'#3a2450','y':'#b08ae0'}},
             'head': {1:{'A':'#6e5288','a':'#503a68','Q':'#34264a'}}},
 'ranger':  {'chest':{1:{'H':'#8aa45c','n':'#6c8644','N':'#526832','d':'#3c4c24','y':'#d4b060'}},
             'head': {1:{'A':'#6c9a48','a':'#527a34','Q':'#3a5624'}}},
 'cleric':  {'chest':{1:{'H':'#e0d4b8','n':'#cabd9e','N':'#aa9e80','d':'#8c826a','W':'#ffffff','Y':'#ffcc4a','y':'#ffcc4a'}},
             'head': {1:{'W':'#ffffff'}}},
 'enchanter':{'chest':{1:{'H':'#a880d0','n':'#8c64b8','N':'#6e4c98','d':'#563a7c','y':'#e0c060'}},
             'head': {1:{'A':'#9468e0','a':'#764cc4','Q':'#54348e'}}},
 'wizard':  {'chest':{1:{'H':'#6a8ae0','n':'#4866c4','N':'#344e9e','d':'#263a7a','y':'#f0c860'}},
             'head': {1:{'A':'#6e8ae6','a':'#506ac8','Q':'#38509e'}}},
 'magician':{'chest':{1:{'H':'#d8805a','n':'#bc6040','N':'#964830','d':'#743422','R':'#ff7038'}},
             'head': {1:{'R':'#ff7a38','r':'#c44420'}}},
 'shaman':  {'chest':{1:{'H':'#78b8a4','n':'#5a9a86','N':'#447c6a','d':'#325e50','y':'#e0b850'}},
             'head': {1:{'A':'#c89a64','a':'#a0784c','Q':'#765636'}}},
 'monk':    {'chest':{1:{'H':'#f0b858','n':'#d89a40','N':'#b07a2e','T':'#b02a2a'}},
             'head': {1:{'T':'#d03434'}}},
 'bard':    {'chest':{1:{'H':'#e07890','n':'#c45a74','N':'#a0445c','y':'#ffcc50'}},
             'head': {1:{'A':'#c84080','a':'#962c5c'}}},
}

# ---------- Rarity (owner, Nov 27): white and green show nothing (rags), blue shows the zone's bright look (LOOKS above),
# pink shows the colours of the boss it came from, so you can tell where gear was won (the game's signature: high-level
# players in strange boss colours). Boss colours: [light, mid, dark, darkest] for clothes, a trim, and [light, mid, dark] for heads.
MAKERS={
 'mal':  {'name':'Brother Malrec (soot and ember)','cloth':['#5e5254','#463c40','#30282b','#1e181b'],'trim':'#ff8a3a','head':['#5e5254','#3e3438','#241c20']},
 'sk':   {'name':'Skeleton King (bone, black, violet)','cloth':['#ece4d4','#cfc5b0','#9c927e','#3a3640'],'trim':'#b48cff','head':['#ece4d4','#bdb39c','#3a3640']},
 'prior':{'name':'Drowned Prior (drowned green)','cloth':['#7e9a88','#5e7a6a','#3a5246','#26382e'],'trim':'#8fd0b4','head':['#8aa694','#5e7a6a','#3a5246']},
 'fang': {'name':'Greyfang (silver and ice)','cloth':['#dfe3e8','#aeb4be','#6c7280','#4e5360'],'trim':'#9fe8ff','head':['#dfe3e8','#aeb4be','#6c7280']},
}
HEAD_ROLES={'druid':['L','G'],'warrior':['R'],'paladin':['J','j'],'shadowknight':['J','j'],'rogue':['A','a','Q'],'necro':['A','a','Q'],
 'ranger':['A','a','Q'],'cleric':['W'],'enchanter':['A','a','Q'],'wizard':['A','a','Q'],'magician':['R','r'],'shaman':['A','a','Q'],'monk':['T'],'bard':['A','a']}
TRIM_ROLES={'cleric':['y','Y'],'magician':['R'],'monk':['T']}   # letters that take the boss's trim colour (default: the belt, y)
def maker_looks():
    for cls in LOOKS:
        for mk,M in MAKERS.items():
            c=M['cloth'];ch={'H':c[0],'n':c[1],'N':c[2],'d':c[3]}
            for t in TRIM_ROLES.get(cls,['y']):ch[t]=M['trim']
            if cls=='cleric':ch['W']=c[0]
            if cls in('monk','bard'):ch.pop('d',None)
            hd={k:M['head'][i] for i,k in enumerate(HEAD_ROLES[cls])}
            LOOKS[cls]['chest'][mk]=ch;LOOKS[cls]['head'][mk]=hd
maker_looks()
def item_makers():
    import re
    src=open('js/data/items.js').read();out={}
    for m in re.finditer(r"\n\s*(\w+):\{([^}]*)\}",src):
        id,b=m.groups()
        if "rar:'named'" not in b or not re.search(r"slot:'(chest|head)'",b):continue
        out[id]='sk' if id.startswith('b1') else 'mal' if id.startswith('mal') else 'prior' if id.startswith('prior') else 'fang' if id.startswith('fang') else None
    return {k:v for k,v in out.items() if v}

HEAD_KEYS='12345';CHEST_KEYS='6789@#$%'   # stand-in letters the game swaps in, so head and chest colours never mix

def head_rows(rows):
    """Rows above the shoulders: everything before the first row with clothes (H or n)."""
    for y,r in enumerate(rows):
        if 'H' in r or 'n' in r:return y
    return 0
def dress(rows,cls,chest,head):
    """Swap the worn slots' letters for stand-in letters (head ones only above the shoulders, chest ones only below)."""
    hl=list(LOOKS[cls]['head'].get(head,{}));cl=list(LOOKS[cls]['chest'].get(chest,{}))
    hy=head_rows(rows);out=[]
    for y,r in enumerate(rows):
        s=''
        for c in r:
            if y<hy and c in hl:s+=HEAD_KEYS[hl.index(c)]
            elif y>=hy and c in cl:s+=CHEST_KEYS[cl.index(c)]
            else:s+=c
        out.append(s)
    return out
def dress_pal(cls,chest,head):
    p={}
    for i,(k,v) in enumerate(LOOKS[cls]['head'].get(head,{}).items()):p[HEAD_KEYS[i]]=v
    for i,(k,v) in enumerate(LOOKS[cls]['chest'].get(chest,{}).items()):p[CHEST_KEYS[i]]=v
    return p

if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    J=lambda o:json.dumps(o,separators=(',',':'))
    data={c:{s:{str(z):m for z,m in v.items()} for s,v in d.items()} for c,d in LOOKS.items()}
    open('js/data/looks.js','w').write(
     "// DATA ONLY (written by tools/gear_looks.py, do not edit by hand). Gear looks by zone (character lane, owner Nov 27).\n"
     "// What you wear shows on the character, one look step per zone. GEAR_LOOKS[class][slot][zone look] = {letter: colour};\n"
     "// no item = the class's own (rags) colours. Zone 1 is colour only. Head colours apply above the shoulders, chest colours\n"
     "// below (js/render.js dress()). An item's zone look is its zl field (js/data/items.js), Zone 1 when it has none.\n"
          "// Rarity (owner, Nov 27): white and green show nothing, blue the zone look (1), pink its boss's colours (GEAR_MAKER[item]).\n"
     "const GEAR_LOOKS="+J(data)+";\nconst GEAR_SLOTS=['chest','head'];\nconst GEAR_MAKER="+J(item_makers())+";\n")
    # Review sheet: every class four ways: rags, chest item, head item, both. Standing, with its starter weapon look 1.
    from PIL import Image,ImageDraw,ImageFont
    import player_frames as F, player_pass_draft as PD, look_ladder_draft as LL
    D=F.build();S=5;BG=(52,62,40,255)
    f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',14)
    fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
    def body(cls,ch,hd):
        o=D[cls];pal={**PD.P.COMMON,**o['c'],**dress_pal(cls,ch,hd)};rows=dress(o['s'],cls,ch,hd)
        im=Image.new('RGBA',(len(rows[0]),len(rows)),(0,0,0,0))
        for y,r in enumerate(rows):
            for x,c in enumerate(r):
                if c!='.' and c in pal:im.putpixel((x,y),tuple(int(pal[c][j:j+2],16) for j in (1,3,5))+(255,))
        return im
    ids=PD.P.ORDER;cw=20*S;rh=20*S;LW=115;cols=['No gear','Blue','Malrec','Skel. King','Prior cowl']
    # Two blocks of 7 classes side by side, each class a row of four, so it fits a phone screen sideways.
    W=2*(5*cw+LW+10)+20;H=40+7*rh+10
    sh=Image.new('RGBA',(W,H),BG);d=ImageDraw.Draw(sh)
    for b in range(2):
        x0=10+b*(5*cw+LW+10)
        for j,cname in enumerate(cols):d.text((x0+LW+j*cw,10),cname,font=fs,fill=(255,210,122))
        for i,cls in enumerate(ids[b*7:b*7+7]):
            y=40+i*rh;d.text((x0,y+rh//2-8),PD.P.NAMES[ids.index(cls)],font=f,fill=(235,225,200))
            for j,(ch,hd) in enumerate(((0,0),(1,1),('mal','mal'),('sk','sk'),(1,'prior'))[:2 if 'mal' not in LOOKS['wizard']['chest'] else 5]):
                im=body(cls,ch,hd);im=im.resize((im.width*S,im.height*S),Image.NEAREST)
                sh.alpha_composite(im,(x0+LW+j*cw,y+rh-im.height))
    sh.save('art/drafts/gear-z1-draft3.png')
    g=Image.new('RGBA',(14*17*3+20,2*20*3+10),BG)
    for i,cls in enumerate(ids):
        for r,(ch,hd) in enumerate(((0,0),(1,1))):
            im=body(cls,ch,hd);im=im.resize((im.width*3,im.height*3),Image.NEAREST)
            g.alpha_composite(im,(10+i*17*3,5+r*60+60-im.height))
    g.save('art/drafts/gear-z1-draft3-game.png')
    print('wrote js/data/looks.js and the review sheet')

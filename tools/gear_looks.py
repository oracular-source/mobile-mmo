# Gear looks by zone (character lane, owner Nov 27): what you wear shows on the character, one look step per zone.
# Owner: each step of the look ladder is a new zone, not several steps in one zone; an item carries its zone's look (wearing
# Zone 1 items reads as Zone 1), and later a harder dungeon tier of an item can upgrade its look. Zone 1 = colour only
# (the owner's "start really small"): a chest item dyes the clothes, a head item dyes the hat, hood or helm. No shape changes.
# Head colours apply only above the shoulders (rows before the first clothes row), chest colours only from there down, so a
# letter both parts share (the Cleric's white, the Magician's red, the Monk's dark cloth) changes in the right place only.
# Run: python3 tools/gear_looks.py -> js/data/looks.js and art/drafts/gear-z1-draft1.png (+ -game.png)
import os,sys,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))

# LOOKS[class][slot][zone look] = {letter: colour}. Rags (no item) = look 0 = the class's own colours.
LOOKS={
 'druid':   {'chest':{1:{'H':'#6f8a4e','n':'#587040','N':'#435632','d':'#334226'}},
             'head': {1:{'L':'#86b84a','G':'#5e8a36','h':'#8a5e36'}}},
 'warrior': {'chest':{1:{'H':'#94704a','n':'#7a5636','N':'#5a3e26','d':'#40291a'}},
             'head': {1:{'R':'#7c6a52','h':'#5a3e26'}}},
 'paladin': {'chest':{1:{'H':'#f0ece0','n':'#dcd6c4','N':'#a8a49a','d':'#86827a'}},
             'head': {1:{'J':'#b8bcc8','j':'#7e8292'}}},
 'shadowknight':{'chest':{1:{'H':'#5e4e58','n':'#4a3c46','N':'#362a34','d':'#281e28'}},
             'head': {1:{'J':'#5c6076','j':'#363a4a'}}},
 'rogue':   {'chest':{1:{'H':'#5c6052','n':'#474b40','N':'#363a32','d':'#2a2c26'}},
             'head': {1:{'A':'#3c4238','a':'#2a2e27','Q':'#1a1c18'}}},
 'necro':   {'chest':{1:{'H':'#5c4c60','n':'#473a4c','N':'#352a3a','d':'#26202a'}},
             'head': {1:{'A':'#4c4054','a':'#352b3c','Q':'#221a27'}}},
 'ranger':  {'chest':{1:{'H':'#6c7650','n':'#555e3e','N':'#41482e','d':'#323822'}},
             'head': {1:{'A':'#527040','a':'#3c562c','Q':'#2a3c1c'}}},
 'cleric':  {'chest':{1:{'H':'#a89c88','n':'#91856f','N':'#786e5e','d':'#665d50','W':'#eee8d8','Y':'#c49a3e'}},
             'head': {1:{'W':'#eee8d8'}}},
 'enchanter':{'chest':{1:{'H':'#806896','n':'#695282','N':'#53406a','d':'#433058'}},
             'head': {1:{'A':'#6a50a2','a':'#523a8c','Q':'#38265e'}}},
 'wizard':  {'chest':{1:{'H':'#56669a','n':'#3c4a7a','N':'#2c3860','d':'#222a48'}},
             'head': {1:{'A':'#5a6c9e','a':'#445482','Q':'#2e3a64'}}},
 'magician':{'chest':{1:{'H':'#9c6650','n':'#844f3c','N':'#6a3b2c','d':'#572d20','R':'#c4542e'}},
             'head': {1:{'R':'#c6582e','r':'#8e321c'}}},
 'shaman':  {'chest':{1:{'H':'#5e7a72','n':'#486258','N':'#384e46','d':'#2a3c36'}},
             'head': {1:{'A':'#9c7c58','a':'#7a5c42','Q':'#544030'}}},
 'monk':    {'chest':{1:{'H':'#b48c50','n':'#9a7440','N':'#7c5c30'}},
             'head': {1:{'T':'#8a2a2a'}}},
 'bard':    {'chest':{1:{'H':'#a2606e','n':'#8a4a5a','N':'#723846'}},
             'head': {1:{'A':'#8e3258','a':'#64203e'}}},
}
HEAD_KEYS='12345';CHEST_KEYS='6789@#'   # stand-in letters the game swaps in, so head and chest colours never mix

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
     "const GEAR_LOOKS="+J(data)+";\nconst GEAR_SLOTS=['chest','head'];\n")
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
    ids=PD.P.ORDER;cw=20*S;rh=20*S;LW=115;cols=['No gear','Zone 1 chest','Zone 1 head','Both']
    # Two blocks of 7 classes side by side, each class a row of four, so it fits a phone screen sideways.
    W=2*(4*cw+LW+10)+20;H=40+7*rh+10
    sh=Image.new('RGBA',(W,H),BG);d=ImageDraw.Draw(sh)
    for b in range(2):
        x0=10+b*(4*cw+LW+10)
        for j,cname in enumerate(cols):d.text((x0+LW+j*cw,10),cname,font=fs,fill=(255,210,122))
        for i,cls in enumerate(ids[b*7:b*7+7]):
            y=40+i*rh;d.text((x0,y+rh//2-8),PD.P.NAMES[ids.index(cls)],font=f,fill=(235,225,200))
            for j,(ch,hd) in enumerate(((0,0),(1,0),(0,1),(1,1))):
                im=body(cls,ch,hd);im=im.resize((im.width*S,im.height*S),Image.NEAREST)
                sh.alpha_composite(im,(x0+LW+j*cw,y+rh-im.height))
    sh.save('art/drafts/gear-z1-draft1.png')
    g=Image.new('RGBA',(14*17*3+20,2*20*3+10),BG)
    for i,cls in enumerate(ids):
        for r,(ch,hd) in enumerate(((0,0),(1,1))):
            im=body(cls,ch,hd);im=im.resize((im.width*3,im.height*3),Image.NEAREST)
            g.alpha_composite(im,(10+i*17*3,5+r*60+60-im.height))
    g.save('art/drafts/gear-z1-draft1-game.png')
    print('wrote js/data/looks.js and the review sheet')

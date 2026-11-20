# Rough draft: UI breakdown 18, buff and debuff icons with timers (your frame and the target frame).
# Uses the shipped spell icon shapes from js/data/icons.js. Draws art/drafts/ui-buff-icons.png.
import json,subprocess
from PIL import Image,ImageDraw,ImageFont
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
def mix(a,b,t):return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
G=json.loads(subprocess.run(['node','-e',"eval(require('fs').readFileSync('js/data/icons.js','utf8').replace('const ICON_SHAPES','global.ICON_SHAPES'));console.log(JSON.stringify(ICON_SHAPES))"],capture_output=True,text=True).stdout)
S=4  # screen scale for the sheet
F=lambda n,b=False:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono'+('-Bold' if b else '')+'.ttf',n)
GREY,PANEL,EDGE,DARK=(214,214,214),(40,40,40),(138,138,138),(17,17,17)

def icon(name,col):
    """16x16 tinted icon (style 2, as shipped): grey square, 1px light border, outlined 12x12 shape."""
    c=hx(col);im=Image.new('RGB',(16,16),(43,43,43));px=im.load()
    cols={'#':c,'+':mix(c,(255,255,255),.55),'o':mix(c,(0,0,0),.55)};rows=G[name]
    on=lambda x,y:0<=x<12 and 0<=y<12 and rows[y][x] in cols
    for y in range(12):
        for x in range(12):
            if not on(x,y) and any(on(x+dx,y+dy) for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):px[x+2,y+2]=(12,12,12)
            elif on(x,y):px[x+2,y+2]=cols[rows[y][x]]
    ImageDraw.Draw(im).rectangle([0,0,15,15],outline=EDGE);return im

def put(sheet,im,x,y):sheet.paste(im.resize((im.width*S,im.height*S),Image.NEAREST),(x,y))

# What's up on you (Druid) and on the target, with seconds left (None = long buff, no number).
BUFFS=[('shield','#a07850','Barkskin',None),('renew','#7dffb0','Regrowth',18),('speed','#7dbbd0','Sprint',9),('aura','#ffd27a','Aura',2)]
DEBUFFS=[('roots','#8fd17a','Rooted',6,0),('drip','#9be37a','Rot',14,0),('frost','#bfe6ff','Chilled',8,3),('boot','#a8d8a0','Snared',3,0),('star','#ffe08a','Stunned',1,0)]
FULL={'Barkskin':1800,'Regrowth':24,'Sprint':12,'Aura':10,'Rooted':8,'Rot':18,'Chilled':10,'Snared':6,'Stunned':3}

def drawicon(sh,d,opt,x,y,name,col,label,secs,stack=0):
    put(sh,icon(name,col),x,y);W=16*S
    left=1.0 if secs is None else secs/FULL[label]
    if opt=='A':  # seconds under the icon
        if secs is not None:
            t=str(secs);w=d.textlength(t,font=F(26,True));d.text((x+(W-w)/2,y+W+2),t,font=F(26,True),fill=(255,90,90) if secs<=3 else GREY)
    elif opt=='B':  # dark shade grows down over the icon as time runs out, number only under 10s
        if secs is not None:
            h=int((1-left)*(W-2*S))
            ov=Image.new('RGBA',(W-2*S,h),(0,0,0,150));sh.paste(ov,(x+S,y+S),ov)
            if secs<10:
                t=str(secs);d.text((x+W-d.textlength(t,font=F(24,True))-6,y+W-30),t,font=F(24,True),fill=(255,255,255),stroke_width=3,stroke_fill=(0,0,0))
    else:  # C: thin bar under the icon drains, no numbers; whole icon blinks in the last 3s
        if secs is not None:
            d.rectangle([x,y+W+3,x+W-1,y+W+3+2*S-1],fill=DARK);d.rectangle([x,y+W+3,x+int((W-1)*left),y+W+3+2*S-1],fill=(255,90,90) if secs<=3 else hx(col))
    if secs is not None and secs<=3 and opt in 'BC':d.rectangle([x-3,y-3,x+W+2,y+W+2],outline=(255,90,90),width=3)  # last 3s: red edge (blinks in game)
    if stack:d.text((x+4,y+2),'x'+str(stack),font=F(20,True),fill=(255,255,255),stroke_width=3,stroke_fill=(0,0,0))

def frame(sh,d,opt,x,y,title,sub,hpcol,items,debuff):
    w,h=7*20*S+20,(16*S)+150;d.rectangle([x,y,x+w,y+h],fill=PANEL,outline=EDGE,width=3)
    d.text((x+14,y+10),title,font=F(30,True),fill=(238,238,238));d.text((x+14+d.textlength(title,font=F(30,True))+16,y+14),sub,font=F(24),fill=(200,200,200))
    d.rectangle([x+14,y+56,x+w-14,y+80],fill=DARK,outline=(85,85,85));d.rectangle([x+16,y+58,x+int((w-14)*.72),y+78],fill=hpcol)
    for i,it in enumerate(items):
        n,c,l,s=it[:4];st=it[4] if len(it)>4 else 0
        drawicon(sh,d,opt,x+14+i*(16*S+14),y+96,n,c,l,s,st)

OPTS=[('A','Number under each icon','Seconds left under every timed icon; red at 3 and under. Long buffs show no number. Most exact; adds a line of height.'),
      ('B','Dark shade fills down','The icon darkens from the top as it runs out (like a cooldown); a number only under 10s; red edge blinks in the last 3s. Same height as now.'),
      ('C','Thin bar under','A 2px bar under the icon drains; no numbers; red bar and edge in the last 3s. Calmest; you guess the seconds.')]
W,H=2*(7*20*S+20)+120,len(OPTS)*440+220
sh=Image.new('RGB',(W,H),(22,22,26));d=ImageDraw.Draw(sh)
d.text((40,30),'UI breakdown 18: buff and debuff icons with timers (rough)',font=F(32,True),fill=(240,240,240))
d.text((40,84),'Left: your frame (Druid, 4 buffs). Right: target frame (5 debuffs, Chilled stacks x3).',font=F(24),fill=(190,190,190))
d.text((40,120),'Traits (Undead, Armored, Rare) move up next to the level. Tap an icon to see its name.',font=F(24),fill=(190,190,190))
for i,(k,t,desc) in enumerate(OPTS):
    y=190+i*440
    d.text((40,y),k+'  '+t,font=F(32,True),fill=(255,215,94));import textwrap
    for j,ln in enumerate(textwrap.wrap(desc,88)):d.text((40,y+44+j*28),ln,font=F(22),fill=(200,200,200))
    frame(sh,d,k,40,y+110,'Druid','Lv 9',(70,170,80),BUFFS,False)
    frame(sh,d,k,40+7*20*S+60,y+110,'Crypt skeleton','Lv 8  Undead',(200,60,60),DEBUFFS,True)
sh.save('art/drafts/ui-buff-icons.png');print(sh.size)

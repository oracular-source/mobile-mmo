# Rough draft: spell icon shape families (UI breakdown 15), tinted style, on real spell colours.
import re,json,subprocess
from PIL import Image,ImageDraw,ImageFont
src=open('tools/ui_drafts.py').read()
exec(src[:src.index('def hx')])   # reuse the first-pass glyphs (G, g)
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
def mix(a,b,t):return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))

g('sword','''
..........##
.........#+#
........#+#.
.......#+#..
......#+#...
.....#+#....
.o..#+#.....
..o#+#......
...o#.......
..o.o.......
.o...o......
o...........''')
g('boot','''
..####......
..#++#......
..#++#......
.oooooo.....
.o#++#oo.o.o
.oooooo.....
..#++#......
..#++####...
..#++++++#..
..#+++++++#.
..#########.
............''')
g('drip','''
....#.......
....#.......
...###......
...#+#....#.
..##+##..###
..#+###...#.
.##+####....
.#+#####..#.
.########.#.
.########...
..######....
...####.....''')
g('tap','''
...#........
...#........
..###.......
..#+#....#..
.##+##..###.
.#+###.#####
##+####..#..
#+#####..#..
#######..#..
#######..#..
.#####...#..
..###.......''')
g('ghost','''
...######...
..#++++++#..
.#++++++++#.
.#+oo++oo+#.
.#+oo++oo+#.
.#++++++++#.
.#+++oo+++#.
.#+++oo+++#.
.#++++++++#.
.#++++++++#.
.#+#+##+#+#.
.#.#.##.#.#.''')
g('tomb','''
...######...
..#++++++#..
.#++++++++#.
.#+++oo+++#.
.#++oooo++#.
.#+++oo+++#.
.#+++oo+++#.
.#++++++++#.
.#++++++++#.
.#++++++++#.
############
.oooooooooo.''')
g('bonemend','''
........##..
........##..
......######
......######
.#####..##..
#+++++#.##..
#oo+oo#.....
#oo+oo#.....
#+++++#.....
.#+o+#......
.#+++#......
..#.#.......''')
g('rock','''
............
............
......####..
.....#++###.
oo..#++####.
....#+#####.
ooo.#######.
....#######.
.oo..#####..
......###...
............
............''')
g('star','''
.....##.....
.....##.....
.#...##...#.
..#..++..#..
...#++++#...
##++++++++##
##++++++++##
...#++++#...
..#..++..#..
.#...##...#.
.....##.....
.....##.....''')
g('arc','''
...######...
.##++++++##.
#++#....#++#
#+#..##..#+#
##...#+...##
#....#+....#
.....#+.....
.....#+.....
...oooooo...
.....oo.....
.....oo.....
.....oo.....''')
g('bolt','''
.........###
........#++#
.......#+++#
......#++##.
.....#++#...
....#+#.....
...o#.......
..o.o.......
.o..........
o...........
............
............''')

def icon(name,col,size=14):
    """Tinted (style 2): shape in the spell colour, with a 1px near-black outline so it reads on grey."""
    c=hx(col);cols={'#':c,'+':mix(c,(255,255,255),.55),'o':mix(c,(0,0,0),.35)}
    im=Image.new('RGB',(size,size),(43,43,43));px=im.load();o=(size-12)//2
    filled=set()
    for y,r in enumerate(G[name]):
        for x,ch in enumerate(r):
            if ch in cols:px[o+x,o+y]=cols[ch];filled.add((o+x,o+y))
    for (x,y) in list(filled):
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            p=(x+dx,y+dy)
            if p not in filled and 0<=p[0]<size and 0<=p[1]<size:px[p]=(16,16,18)
    return im

# Real abilities and colours from js/data/classes.js
out=subprocess.run(['node','-e',"eval(require('fs').readFileSync('js/data/classes.js','utf8').replace(/^const CLASSES/m,'global.CLASSES'));const o={};for(const c of ['druid','necro','warrior'])o[c]=CLASSES[c].abilities.map(a=>[a.id,a.short,a.col,a.kind]);console.log(JSON.stringify(o))"],capture_output=True,text=True)
AB=json.loads(out.stdout)
# Option B: shape by kind, damage spells by what hits you (weapon or element)
SHAPE_B={'thorn':'thorn','mend':'heal','snare':'boot','rot':'drip','root':'roots','bark':'shield',
 'tap':'tap','raise':'skull','plague':'drip','dread':'ghost','feign':'tomb','mendb':'bonemend',
 'strike':'sword','bandage':'heal','throw':'rock','bash':'star','ham':'boot','stance':'shield','cleave':'arc'}
NAMES={'druid':'Druid','necro':'Necromancer','warrior':'Warrior'}

FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',20)
FB=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',26)
FS=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',17)
GOLD=(255,210,122);TXT=(225,225,225);DIM=(165,165,165)

def button(im,x,y,shape,col,label,bw=124,bh=104):
    d=ImageDraw.Draw(im)
    d.rectangle([x,y,x+bw,y+bh],fill=(43,43,43),outline=(138,138,138),width=2)
    im.paste(icon(shape,col).resize((56,56),Image.NEAREST),(x+bw//2-28,y+10))
    tw=d.textlength(label,font=FS);d.text((x+bw/2-tw/2,y+74),label,font=FS,fill=(235,235,235))

W=1080;H=1500;im=Image.new('RGB',(W,H),(20,18,26));d=ImageDraw.Draw(im)
d.text((30,22),'Spell icons (rough) - tinted, real spell colours',font=FB,fill=TXT)
y=70
for t,s in [('A  One shape per kind','~30 shapes. Every damage spell is the same bolt.'),
            ('B  Kind + what hits you','~40 shapes. Heals share a cross, snares a boot,'),
            ('','damage shows the weapon or element.  <- lean'),
            ('C  One shape per spell','109 drawings. Most distinct, slowest to make.')]:
    if t:d.text((30,y),t,font=FONT,fill=GOLD)
    d.text((370,y+2),s,font=FS,fill=DIM);y+=32
y+=16
d.text((30,y),'Option B on three classes (button size x2)',font=FB,fill=GOLD);y+=46
for c in ('druid','necro','warrior'):
    d.text((30,y),NAMES[c],font=FONT,fill=TXT);y+=30
    x=30
    for i,(aid,short,col,kind) in enumerate(AB[c]):
        button(im,x,y,SHAPE_B[aid],col,short);x+=146
    y+=124
y+=6
d.text((30,y),'B shares shapes across classes (colour tells them apart)',font=FB,fill=GOLD);y+=46
pairs=[('heal','#7dffa6','Mend'),('heal','#e8e2cf','Bandage'),None,('boot','#5f9ea0','Tangle'),('boot','#a3252f','Hamstr'),None,('drip','#6aa84f','Rot'),('drip','#7a9a3a','Plague')]
x=30
for p in pairs:
    if p is None:x+=26;continue
    button(im,x,y,p[0],p[1],p[2],bw=110);x+=122
y+=130
d.text((30,y),'Why not A: Thornlash, Strike and Throw Stone become one bolt',font=FB,fill=GOLD);y+=46
x=30
for col,lab in [('#7dbb4a','Thorn'),('#cfd6e0','Strike'),('#8d8692','Throw')]:
    button(im,x,y,'bolt',col,lab);x+=146
d.text((x+20,y+20),'only the colour differs,',font=FS,fill=DIM);d.text((x+20,y+46),'and grey-ish spells blur.',font=FS,fill=DIM)
im=im.crop((0,0,W,y+130))
im.save('art/drafts/ui-spell-icons-b.png')

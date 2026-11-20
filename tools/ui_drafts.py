# Rough drafts: minimap options and icon styles, rendered from the game's real map data.
import json,re,math
from PIL import Image,ImageDraw,ImageFont
G={}
def g(name,rows):G[name]=[r.ljust(12,'.')[:12] for r in rows.strip('\n').split('\n')]
g('flame','''
.....#......
.....##.....
....###.....
....####..#.
...#####.##.
..###+###...
..##+++##...
.###+++###..
.##++o++##..
.##+ooo+##..
..##ooo##...
...######...''')
g('shield','''
.##########.
.#++++++++#.
.#+######+#.
.#+##++##+#.
.#+##++##+#.
.#+######+#.
.#+######+#.
..#+####+#..
..#+####+#..
...#+##+#...
....#++#....
.....##.....''')
g('skull','''
............
...######...
..########..
.##########.
.##########.
.##oo##oo##.
.##oo##oo##.
.##########.
..####o####.
...##ooo##..
...#+#+#+#..
...#.#.#.#..''')
g('thorn','''
..........##
.........##.
......+.##..
.......##...
....+.##.+..
.....##.....
..+.##.+....
...##.......
..##.+......
.##.........
##..........
............''')
g('heal','''
............
....####....
....#++#....
....#++#....
.####++####.
.#++++++++#.
.#++++++++#.
.####++####.
....#++#....
....#++#....
....####....
............''')
g('roots','''
............
..#.....#...
..#..#..#...
...#.#.#....
...#.#.#....
....###.....
....###.....
...#####....
..##.#.##...
.##..#..##..
.#...#...#..
oooooooooooo''')
g('town','''
.....##.....
....####....
...######...
..########..
.##########.
..#++++++#..
..#+##+++#..
..#+##+oo#..
..#++++oo#..
..#++++oo#..
..########..
............''')
g('cave','''
............
...######...
..#++++++#..
.#++oooo++#.
.#+oooooo+#.
.#+oooooo+#.
.#+oooooo+#.
.#+oooooo+#.
.#+oooooo+#.
############
............
............''')
g('fire','''
............
.....#......
....##......
....###.#...
...#+##.##..
...#++###...
..##+++##...
..#+++++#...
...#####....
.oo.#.#.oo..
..oooooooo..
............''')
g('chest','''
............
............
..########..
.#++++++++#.
.#++++++++#.
.####oo####.
.#+++oo+++#.
.#++++++++#.
.#++++++++#.
.##########.
............
............''')
g('exit','''
............
.....#......
.....##.....
.....###....
.########...
.#########..
.########...
.....###....
.....##.....
.....#......
............
............''')
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
def mix(a,b,t):return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
def glyph(img,x0,y0,name,cols,sc=1):
    d=ImageDraw.Draw(img)
    for y,r in enumerate(G[name]):
        for x,ch in enumerate(r):
            if ch in cols:d.rectangle([x0+x*sc,y0+y*sc,x0+x*sc+sc-1,y0+y*sc+sc-1],fill=cols[ch])
def icon(style,name,col):
    """16x16 icon: 1px border, 1px inset, 12x12 glyph."""
    c=hx(col);im=Image.new('RGB',(16,16),(43,43,43));d=ImageDraw.Draw(im)
    if style==1:   # plain: grey glyph, no colour
        cols={'#':(214,214,214),'+':(255,255,255),'o':(110,110,110)}
    elif style==2: # tinted: glyph in the spell's colour
        cols={'#':c,'+':mix(c,(255,255,255),.55),'o':mix(c,(0,0,0),.55)}
    else:          # filled: dark colour square, light glyph
        d.rectangle([1,1,14,14],fill=mix(c,(0,0,0),.6))
        cols={'#':mix(c,(255,255,255),.6),'+':(255,255,255),'o':mix(c,(0,0,0),.25)}
    glyph(im,2,2,name,cols)
    d.rectangle([0,0,15,15],outline=(138,138,138))
    return im
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',22)
FONTB=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',28)
FS=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',18)
SPELLS=[('thorn','#7ec850','Thornlash'),('heal','#7dffb0','Mend'),('roots','#b08a50','Rootgrip'),('flame','#ff8a3a','Fire nuke'),('shield','#9ab4d8','Shield Bash'),('skull','#c8b8ff','Raise Bones')]
PLACES=[('town','#7dffa6','Town'),('cave','#c8a0ff','Dungeon door'),('fire','#ffd27a','Campfire'),('exit','#7dffa6','Way out'),('skull','#ff6b6b','Named'),('chest','#ffd27a','Hidden chest')]

def sheet():
    S=4;W=1080;H=1110;im=Image.new('RGB',(W,H),(20,18,26));d=ImageDraw.Draw(im)
    d.text((30,24),'Icon styles (rough) - same 12x12 shapes, three looks',font=FONTB,fill=(230,230,230))
    y=90
    for st,title,sub in [(1,'1  Plain','grey shape, no colour - quietest, most EverQuest'),(2,'2  Tinted','shape in the spell or pin colour'),(3,'3  Filled','dark colour square, light shape - boldest')]:
        d.text((30,y),title,font=FONTB,fill=(255,210,122));d.text((210,y+6),sub,font=FS,fill=(170,170,170));y+=48
        for row in (SPELLS,PLACES):
            x=30
            for n,c,lab in row:
                im.paste(icon(st,n,c).resize((64,64),Image.NEAREST),(x,y))
                d.text((x,y+68),lab[:15],font=FS,fill=(190,190,190));x+=172
            y+=104
        y+=12
    # In context: on a spell button (real size x2) and on a minimap pin size
    d.text((30,y),'On a spell button (style 2, roughly real size x2)',font=FONTB,fill=(255,210,122));y+=50
    x=30
    for n,c,lab in SPELLS[:4]:
        bw,bh=150,116
        d.rectangle([x,y,x+bw,y+bh],fill=(43,43,43),outline=(138,138,138),width=2)
        im.paste(icon(2,n,c).crop((1,1,15,15)).resize((56,56),Image.NEAREST),(x+bw//2-28,y+12))
        tw=d.textlength(lab,font=FONT);d.text((x+bw/2-tw/2,y+78),lab,font=FONT,fill=(235,235,235))
        x+=bw+20
    im.save('art/drafts/ui-icon-styles.png')
sheet()

# ---------- Minimap options ----------
D=json.load(open('mm.json'))
def rgb(s):return tuple(int(v) for v in re.findall(r'\d+',s))
def kind(Z,x,y):
    t=Z['map'][y][x];r,gg,b=rgb(Z['col'][y*Z['w']+x])
    if t==3:return 'tree'
    if t==2:return 'water'
    if t in(5,7):return 'wall'
    if t in(8,10):return 'door'
    return 'path' if (r>gg*1.04 and r>100) else 'grass'
FLAT={'grass':(58,82,52),'tree':(30,46,32),'water':(52,86,140),'wall':(120,118,128),'door':(150,110,200),'path':(176,146,104)}
ROADS={'grass':(26,28,30),'tree':(18,20,22),'water':(44,70,112),'wall':(96,96,104),'door':(150,110,200),'path':(200,190,170)}
PINK={'exit':('exit','#7dffa6'),'dun':('cave','#c8a0ff'),'camp':('fire','#ffd27a'),'boss':('skull','#ff6b6b')}
def pinicon(p):
    if p['name']=='Hidden chest':return ('chest','#ffd27a')
    if p['name'].startswith('Town'):return ('town','#7dffa6')
    return PINK[p['k']]
def seen(Z,px,py,R=11):
    return lambda x,y:(x-px)**2+(y-py)**2<=R*R+R or abs(x-px)<=4 and y>py  # a revealed patch around a walked line
def minimap(Z,variant,px,py,size=172,tile=4):
    im=Image.new('RGB',(size,size),(7,6,10));d=ImageDraw.Draw(im);cx=cy=size//2
    sv=lambda x,y:((x-px)**2+(y-py)**2<=150) or (abs(x-px)<=3) or (abs(y-py-5)<=2 and x<px+20)
    for y in range(Z['h']):
        for x in range(Z['w']):
            if not sv(x,y):continue
            sx=cx+(x-px)*tile;sy=cy+(y-py)*tile
            if sx<-tile or sy<-tile or sx>size or sy>size:continue
            if variant=='now':c=rgb(Z['col'][y*Z['w']+x])
            elif variant in('A','C'):c=FLAT[kind(Z,x,y)]
            else:c=ROADS[kind(Z,x,y)]
            d.rectangle([sx,sy,sx+tile-1,sy+tile-1],fill=c)
    if variant=='C':  # monsters nearby as small red dots
        for (mx,my) in [(px+6,py-4),(px+8,py-3),(px-9,py+7),(px+3,py+12)]:
            sx=cx+(mx-px)*tile;sy=cy+(my-py)*tile;d.rectangle([sx,sy,sx+3,sy+3],fill=(0,0,0));d.rectangle([sx+1,sy+1,sx+2,sy+2],fill=(255,80,80))
    for p in Z['pins']:
        if not sv(p['x'],p['y']) and variant!='now':pass
        sx=cx+(p['x']+.5-px)*tile;sy=cy+(p['y']+.5-py)*tile
        if not(6<sx<size-6 and 6<sy<size-6):continue
        if variant=='now':
            col=hx({'exit':'#7dffa6','dun':'#c8a0ff','camp':'#ffd27a','boss':'#ff6b6b'}[p['k']])
            d.rectangle([sx-5,sy-5,sx+5,sy+5],fill=(0,0,0));d.rectangle([sx-3,sy-3,sx+3,sy+3],fill=col)
        else:
            n,c=pinicon(p);c=hx(c);sh={'#':(0,0,0),'+':(0,0,0),'o':(0,0,0)}
            for ox,oy in((-1,0),(1,0),(0,-1),(0,1)):glyph(im,int(sx-12)+ox,int(sy-12)+oy,n,sh,2)
            glyph(im,int(sx-12),int(sy-12),n,{'#':c,'+':mix(c,(255,255,255),.55),'o':mix(c,(0,0,0),.55)},2)
    # you
    if variant=='now':
        d.ellipse([cx-6,cy-6,cx+6,cy+6],fill=(0,0,0));d.ellipse([cx-4,cy-4,cx+4,cy+4],fill=(255,210,122))
    else: # an arrow showing which way you face
        d.polygon([(cx,cy-8),(cx+6,cy+6),(cx,cy+3),(cx-6,cy+6)],fill=(255,210,122),outline=(0,0,0))
    return im
def framed(mm,variant,name):
    pad=3;lab=26 if variant!='now' else 0
    out=Image.new('RGB',(mm.width+2*pad,mm.height+2*pad+lab),(0,0,0));d=ImageDraw.Draw(out)
    if variant=='now':d.rectangle([0,0,out.width-1,out.height-1],outline=(138,138,138),width=2)
    else:
        d.rectangle([0,0,out.width-1,out.height-1],fill=(43,43,43),outline=(138,138,138),width=2)
    out.paste(mm,(pad,pad))
    if lab:
        tw=d.textlength(name,font=FS);d.text(((out.width-tw)/2,mm.height+pad+3),name,font=FS,fill=(220,220,220))
    return out
def mmsheet():
    W=1080;im=Image.new('RGB',(W,1260),(20,18,26));d=ImageDraw.Draw(im)
    d.text((30,24),'Minimap options (rough) - the real crossroads map',font=FONTB,fill=(230,230,230))
    d.text((30,64),'Shown at 2x phone size. Each also gets the area name under it.',font=FS,fill=(170,170,170))
    Z=D['cross'];px,py=24,26
    items=[('now','Now (v0.43)','averaged ground colours; blurry, pins are plain squares'),
           ('A','A  Flat colours','one clean colour per thing: path, grass, trees, water, stone; pins become icons'),
           ('B','B  Roads only','dark ground, only roads, water and walls drawn; quietest, easiest to read'),
           ('C','C  A + monsters','A, plus red dots for monsters near you (EverQuest-style tracking feel)')]
    for i,(v,t,sub) in enumerate(items):
        x=30+(i%2)*520;y=110+(i//2)*570
        mm=framed(minimap(Z,v,px,py,size=172,tile=4),v,Z.get('name','Crossroads')).resize(None or (2*178,2*(178+(26 if v!='now' else 0))),Image.NEAREST)
        d.text((x,y),t,font=FONTB,fill=(255,210,122))
        im.paste(mm,(x,y+44))
        # wrap sub
        words=sub.split();line='';yy=y+44+mm.height+10
        for w_ in words:
            if d.textlength(line+' '+w_,font=FS)>470:d.text((x,yy),line.strip(),font=FS,fill=(180,180,180));yy+=24;line=''
            line+=' '+w_
        d.text((x,yy),line.strip(),font=FS,fill=(180,180,180))
    im.save('art/drafts/ui-minimap-options.png')
mmsheet()

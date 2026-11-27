# Weapon looks, draft 1 (Items lane, Nov 27). Every weapon type drawn at each look tier, natively at game size.
# The look follows the weapon's power (look tier), never its rarity colour: a stronger weapon never looks plainer.
# Zone 1 uses looks 1-4 (no weapon = empty hand); later zones add 5, 6... Named weapons keep their tier's shape and
# swap in their maker's colours (Skeleton King: bone and violet; Malrec: soot iron and ember).
# Run: python3 tools/weapon_looks.py -> art/drafts/weapons-draft1.png (sheet) and art/drafts/weapons-draft1-held.png
from PIL import Image, ImageDraw

def outline(rows):
    w=max(len(r) for r in rows)+2
    g=[list('.'*w)]+[list('.'+r.ljust(w-2,'.')+'.') for r in rows]+[list('.'*w)]
    out=[r[:] for r in g]
    for y in range(len(g)):
        for x in range(w):
            if g[y][x]=='.':
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    X,Y=x+dx,y+dy
                    if 0<=X<w and 0<=Y<len(g) and g[Y][X]!='.':
                        out[y][x]='k';break
    return [''.join(r) for r in out]

BASE={'k':'#0b0a0f','o':'#7a5232','O':'#4e3220','b':'#e4dccb','B':'#a89c84','w':'#cfc8b2','W':'#8a8070',
      's':'#d8d0bc','r':'#8a4a2a','S':'#f0c99a','L':'#6f9a3e'}
# Metal and trim per look tier: dull iron -> steel -> bright steel with brass -> polished with gold and a gem.
LOOK={1:{'l':'#8d8692','i':'#6a6570','I':'#4a4650','y':'#6a6570','Y':'#4a4650','g':'#6a6570'},
      2:{'l':'#b8b4c4','i':'#8d8692','I':'#5e5a66','y':'#a08a5a','Y':'#6e5e3a','g':'#8d8692'},
      3:{'l':'#dcd8e6','i':'#a8a4b4','I':'#6e6a7a','y':'#c9a227','Y':'#8a6e1a','g':'#7dbbff'},
      4:{'l':'#f2f2fa','i':'#b8bccc','I':'#7a7e90','y':'#ffd27a','Y':'#c9a227','g':'#7dffd0'},
      5:{'l':'#ffffff','i':'#c8d0e4','I':'#8a92aa','y':'#ffe9a8','Y':'#e0b040','g':'#ff7de0'}}
NAMED={'sk':{'y':'#e4dccb','Y':'#a89c84','g':'#b48cff','o':'#a89c84','O':'#6e6458'},
       'mal':{'l':'#8a7478','i':'#5a4a4e','I':'#3a2e32','y':'#ff8a3a','Y':'#c0502a','g':'#ffd060','o':'#3a2e32','O':'#2a1e22'}}

# Each weapon: rows (fill only, upright, '.' clear) and grip row (where the hand closes, counted in the filled rows).
W={}
W['staff']={
1:(["O"]+["o"]*13+["O"],8),
2:(["oO.",".oO",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".O.",".O."],8),
3:([".g.","igi",".i.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".y.",".o.",".o.",".i."],8),
4:([".y.y.","y.g.y",".yiy.","..i..","..o..","..y..","..o..","..o..","..o..","..o..","..o..","..o..","..y..","..o..","..o..","..i..","..Y.."],10)}
W['sword']={
1:([".l.",".r.",".l.",".l.",".r.",".l.","III",".o.",".o.",".I."],7),
2:([".l.",".l.",".l.",".l.",".l.",".l.",".l.","yYy",".o.",".o.",".Y."],8),
3:([".l.","il.","il.","il.","il.","il.","il.","il.","yYYy","..o.","..o.","..y."],9),
4:(["..l..",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.","yYgYy","..o..","..o..",".yYy."],10),
5:(["..l..",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.","yy.yy","yYgYy","..o..","..o..","..o..",".yYy."],14)}
W['axe']={
1:([".ll","oli","o..","o..","o..","o..","o..","o..","o..","O.."],6),
2:(["..l.","oill","oil.","o...","o...","o...","o...","o...","o...","o...","O..."],7),
3:(["..ll","yill","yiil","o.il","o...","o...","o...","o...","o...","o...","o...","y..."],8),
4:([".l.l.","lliil","liyil","l.y.l","..g..","..o..","..o..","..o..","..y..","..o..","..o..","..o..","..Y.."],9)}
W['dagger']={
1:(["l","l","r","I","o","o"],4),
2:([".l.",".l.",".l.",".l.","bBb",".o.",".b."],5),
3:(["..l",".il",".il",".il","yYy",".o.",".y."],5),
4:(["..l..",".il..",".ili.",".ili.",".ili.","yYgYy","..o..","..o..",".yYy."],6)}
W['mace']={
1:(["II","Ii","o.","o.","o.","o.","o.","o.","o.","O."],6),
2:([".l.","lil","lil",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".O."],7),
3:(["..l..",".lil.","liyil",".lil.","..y..","..o..","..o..","..o..","..o..","..o..","..o..","..y.."],8),
4:(["..y..","l.l.l",".lgl.","lliil",".lyl.","..y..","..o..","..o..","..o..","..o..","..o..","..o..","..y.."],9)}
W['greatsword']={
1:(["l.","ll","il","il","il","il","il","il","il","II","o.","o.","I."],10),
2:([".l.","il.","il.","il.","il.","il.","il.","il.","il.","il.","yYy",".o.",".o.",".Y."],11),
3:([".l..",".il.","iil.","iil.","iil.","iil.","iil.","iil.","iil.","iil.","iil.","yYYy",".o..",".o..",".y.."],12),
4:(["..l..",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.",".ili.","yYgYy","..o..","..o..",".yYy."],13)}
W['bow']={
1:(["o.",".o","so","so","so","so","so","so","so","so",".o","o."],7),
2:(["O..",".o.","s.o","s.o","s.o","s.o","s.o","s.o","s.o","s.o","s.o","s.o",".o.","O.."],8),
3:(["y..",".o.","s.o","s.o","s.o","s.o","s.y","s.o","s.o","s.o","s.o","s.o",".o.","y.."],8),
4:(["yy..","..o.",".s.o",".s.o",".s.o",".s.o",".s.y",".s.g",".s.y",".s.o",".s.o",".s.o",".s.o","..o.","yy.."],8)}
W['spear']={
1:(["l.l","lil",".i.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".O."],9),
2:([".b.","bBb",".B.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".O."],9),
3:([".l.","lil","lil",".i.",".y.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".o.",".y."],9),
4:(["..l..",".lil.",".lil.",".lil.","y.i.y","..g..","..y..","..o..","..o..","..o..","..o..","..o..","..o..","..o..","..o..","..o..","..Y.."],10)}
W['rapier']={
1:(["l","l","l","l","l","l","l","I","o","I"],8),
2:([".l.",".l.",".l.",".l.",".l.",".l.",".l.",".l.","yYy","yo.",".Y."],9),
3:(["..l.","..l.","..l.","..l.","..l.","..l.","..l.","..l.","..l.","yYYy","y.o.",".yy."],10),
4:(["..l..","..l..","..l..","..l..","..l..","..l..","..l..","..l..","..l..","..l..","yYgYy","y.o.y",".yYy."],11)}
# Fist weapons sit on the hand itself: a small patch over the fist (row 0 = top of the fist).
W['fists']={
1:(["ww","wW"],0),
2:(["ll","iI"],0),
3:(["yly","iiI"],0),
4:(["l.l","ygy","iiI"],1)}

ORDER=['staff','sword','axe','dagger','mace','greatsword','bow','spear','rapier','fists']
WHO={'staff':'Druid, Necro, Enchanter, Wizard, Magician','sword':'Warrior, Paladin, SK','axe':'Warrior','dagger':'Rogue',
     'mace':'Cleric','greatsword':'Paladin, SK','bow':'Ranger','spear':'Shaman','rapier':'Bard','fists':'Monk'}

def img(rows,pal):
    rows=outline(rows);h=len(rows);w=len(rows[0])
    im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c!='.': im.putpixel((x,y),tuple(int(pal[c][i:i+2],16) for i in (1,3,5))+(255,))
    return im

def pal(look,named=None):
    p=dict(BASE);p.update(LOOK[look])
    if named: p.update(NAMED[named])
    return p

# Plain body (the monk's rags, empty hands) to show weapons held at real size.
MONK=["......kk.......","....kkhhkk.....","...ksssssSk....","..kTTTTTTTTk...","...kssssssk....","...ksessesk....",
"...kssssssk....","...kksssskk....","..ksHnnnnNsk...",".kssHnnnnNssk..",".kskHnnnnNksk..",".kWTTTTTTTTWk..",
"..kkHnnnnNTk...","...kwwkwwkTk...","...kwwkwwkk....","...kwwkwwk.....","...kOOkOOk.....","....kk.kk......"]
MPAL={'k':'#0b0a0f','h':'#1a1820','s':'#d9a77c','S':'#f0c99a','e':'#1a1820','T':'#4a4a52','H':'#8a7a60','n':'#6e6048',
      'N':'#56493a','W':'#cfc8b2','w':'#8a7f70','O':'#4a3b33'}
def held(weapon,look,named=None):
    body=img_raw(MONK,MPAL);rows,grip=W[weapon][look];wi=img(rows,pal(look,named))
    can=Image.new('RGBA',(22,24),(0,0,0,0));ox,oy=2,5;can.alpha_composite(body,(ox,oy))
    if weapon=='fists':
        can.alpha_composite(wi,(ox+10,oy+9-grip-1));return can
    gx=max(i for i,c in enumerate(outline(rows)[grip+1]) if c not in '.k')  # grip column (rightmost metal/wood)
    cx=[i for i,c in enumerate(outline(rows)[grip+1]) if c in 'oOIi']
    gx=cx[len(cx)//2] if cx else gx
    can.alpha_composite(wi,(ox+12-gx,oy+9-grip-1))
    can.putpixel((ox+12,oy+9),(240,201,154,255));can.putpixel((ox+11,oy+9),(217,167,124,255))  # hand over the grip
    return can
def img_raw(rows,p):
    im=Image.new('RGBA',(len(rows[0]),len(rows)),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c!='.': im.putpixel((x,y),tuple(int(p[c][i:i+2],16) for i in (1,3,5))+(255,))
    return im

if __name__=='__main__':
    import os
    os.makedirs('art/drafts',exist_ok=True)
    Z=4;CW=22*Z+16;BG=(28,26,34,255)
    cols=[(1,None,'1 white'),(2,None,'2 green'),(3,None,'3 blue'),(3,'sk','3 Skel. King'),(4,None,'4 top Z1'),(4,'mal','4 Malrec')]
    H=24*Z+14
    sheet=Image.new('RGBA',(118+CW*len(cols),30+H*len(ORDER)),BG);d=ImageDraw.Draw(sheet)
    for j,(lk,nm,lab) in enumerate(cols): d.text((118+j*CW+4,10),lab,fill=(220,214,200,255))
    for i,wp in enumerate(ORDER):
        y0=30+i*H
        d.text((6,y0+30),wp,fill=(255,220,150,255))
        words=WHO[wp].split(', ')
        for k,wd in enumerate(words): d.text((6,y0+46+k*13),wd,fill=(150,144,160,255))
        for j,(lk,nm,lab) in enumerate(cols):
            h=held(wp,lk,nm)
            sheet.alpha_composite(h.resize((22*Z,24*Z),Image.NEAREST),(118+j*CW,y0))
            sheet.alpha_composite(h,(118+j*CW+22*Z-8,y0+24*Z-26))  # true size in the corner
    sheet.save('art/drafts/weapons-draft1.png')
    # Zone ladder: why looks follow power, not colour.
    lad=[('Z1 green',2,None),('Z1 blue',3,None),('Skel. King pink',3,'sk'),('Malrec pink',4,'mal'),('Z2 blue (preview)',5,None)]
    L=Image.new('RGBA',(len(lad)*130+20,24*5+40),BG);d=ImageDraw.Draw(L)
    for j,(lab,lk,nm) in enumerate(lad):
        h=held('sword',lk,nm);L.alpha_composite(h.resize((22*5,24*5),Image.NEAREST),(10+j*130,8));d.text((14+j*130,24*5+14),lab,fill=(220,214,200,255))
    L.save('art/drafts/weapons-draft1-ladder.png')
    print('ok')

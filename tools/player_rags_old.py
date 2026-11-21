# Today's player sprites as the game draws them (20x24 shrunk to 15x18), for the draft comparison in player_rags.py.
import json,re,subprocess
from PIL import Image
src=open('js/data/sprites.js').read()
js=src+"\nconsole.log(JSON.stringify({RAG_COMMON,RAG_HEADS,RAG_BODIES,RAG_WEAPONS,RAGS}))"
open('d.js','w').write(js)
D=json.loads(subprocess.check_output(['node','d.js']));__import__('os').remove('d.js')
def build(id):
    c=D['RAGS'][id];W=20
    g=[list(r.ljust(W,'.')[:W]) for r in D['RAG_HEADS'][id]+D['RAG_BODIES'][c['body']]]
    for w in c['w']:
        for y0,rows in D['RAG_WEAPONS'][w]:
            for j,r in enumerate(rows):
                y=y0+j
                if y>=len(g):continue
                for i,ch in enumerate(r[:W]):
                    if ch!='.':g[y][i]=ch
    pal=dict(D['RAG_COMMON']);pal.update(c['c'])
    rows=[''.join(r) for r in g];h=len(rows)
    sh=[''.join(rows[j*h//18][i*20//15] for i in range(15)) for j in range(18)]
    return sh,pal
def img(rows,pal,S=1):
    h=len(rows);w=max(len(r) for r in rows);im=Image.new('RGBA',(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch in pal: im.putpixel((x,y),tuple(int(pal[ch][i:i+2],16) for i in (1,3,5))+(255,))
    return im.resize((w*S,h*S),Image.NEAREST)

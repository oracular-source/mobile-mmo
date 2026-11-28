"""Films a scene from the real game frame by frame at 30 fps, for the showcase (docs/media/clips, owner Nov 27).
Run from the repo root: python3 tools/showcase/film.py skel   (scenes: skel, king, throw, crowd, howl; add new ones to SETUP)
Frames land in /tmp/film/<scene>NNN.png; crop and join them into a GIF with Pillow (see the showcase notes in docs/board.md).
The game loop is paused (simState.busy) and stepped by hand, so every clip plays at true speed however slow the machine is."""
import asyncio,base64,sys
from playwright.async_api import async_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SETUP={
'skel':'''const m=G.mobs.find(m=>m.type==='cskel'&&!m.dead);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x-24;P.y=m.y+6;m.state='idle';W.focus=m;W.at=6;W.act=()=>killMob(m);W.n=60;''',
'king':'''const m=G.mobs.find(m=>m.def.boss);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x-30;P.y=m.y+10;m.state='idle';W.focus=m;W.at=6;W.act=()=>killMob(m);W.n=70;''',
'throw':'''const m=G.mobs.find(m=>m.def.boss);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+30;P.y=m.y+60;m.state='chase';m.threat={p:999,pet:0};m.bolt=0.01;W.focus={x:(m.x+P.x)/2,y:(m.y+P.y)/2};W.n=84;W.god=1;''',
'howl':'''const m=G.mobs.find(m=>m.type==='greyfang'&&!m.dead);const pk=G.mobs.filter(o=>o!==m&&!o.dead&&o.sp.group&&o.sp.group===m.sp.group);
  G.mobs.forEach(o=>{if(o!==m&&pk.indexOf(o)<0)o.dead=true});P.x=m.x+110;P.y=m.y+14;m.state='idle';m.dir=1;
  pk.forEach((o,i)=>{o.x=m.x-40-i*26;o.y=m.y-30+i*44;o.state='idle';o.dir=1});W.at=6;W.act=()=>engage(m);W.n=120;W.god=1;''',
'crowd':'''const sk=G.mobs.filter(m=>m.type==='cskel'&&!m.dead).slice(0,3);G.mobs.forEach(o=>{if(sk.indexOf(o)<0)o.dead=true});const K=G.mobs.find(m=>m.def.boss);
  sk.forEach((m,i)=>{m.x=P.x-12+i*12;m.y=P.y-9+(i%2)*3;m.state='chase';m.threat={p:999,pet:0};m.atk=0.2+i*0.55});W.focus=P;W.n=96;W.god=1;''',
'swing':'''const m=G.mobs.find(m=>m.type==='cskel'&&!m.dead);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+10;P.y=m.y-4;m.state='chase';m.threat={p:999,pet:0};m.atk=0.5;W.focus={x:m.x+5,y:m.y};W.n=84;W.god=1;''',
'kingswing':'''const m=G.mobs.find(m=>m.def.boss);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+10;P.y=m.y-4;m.state='chase';m.threat={p:999,pet:0};m.atk=0.6;m.bolt=99;W.focus={x:m.x+5,y:m.y};W.n=84;W.god=1;''',
'bite':'''const m=G.mobs.find(m=>m.type==='wolf'&&!m.dead);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+10;P.y=m.y-4;m.state='chase';m.threat={p:999,pet:0};m.atk=0.4;W.focus={x:m.x+5,y:m.y};W.n=84;W.god=1;''',
'greyfangbite':'''const m=G.mobs.find(m=>m.type==='greyfang'&&!m.dead);G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+12;P.y=m.y-4;m.state='chase';m.howled=true;m.threat={p:999,pet:0};m.atk=0.4;W.n=84;W.god=1;''',
'scarbite':'''const m=G.mobs.find(m=>m.type==='wolf'&&!m.dead);m.type='oldscar';m.def=TYPES.oldscar;G.mobs.forEach(o=>{if(o!==m)o.dead=true});P.x=m.x+10;P.y=m.y-4;m.state='chase';m.threat={p:999,pet:0};m.atk=0.4;W.n=84;W.god=1;''',
}
AREA={'howl':'wolfwood','bite':'wolfwood','greyfangbite':'wolfwood','scarbite':'wolfwood'}  # scenes outside the crypt
async def main(scene):
  os.makedirs('/tmp/film',exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file://'+ROOT+'/index.html?debug&level=9&area='+AREA.get(scene,'crypt'))
    await pg.wait_for_timeout(1500)
    try: await pg.click('text=Play',timeout=1500)
    except Exception: pass
    await pg.wait_for_timeout(1500)
    js='''()=>{const G=__game,P=G.player,W={};simState.busy=true;'''+SETUP[scene]+'''
      if(scene==='crowd'){}const cv=document.querySelector('canvas'),out=[];const dt=1/30;
      for(let i=0;i<W.n;i++){if(W.god)P.hp=P.maxhp;if(i===W.at&&W.act)W.act();time+=dt;update(dt);render();out.push(cv.toDataURL())}
      return out}'''.replace("scene==='crowd'","true")
    shots=await pg.evaluate(js)
    for i,s in enumerate(shots): open(f'/tmp/film/{scene}{i:03d}.png','wb').write(base64.b64decode(s.split(',')[1]))
    print(scene,len(shots),'errors',errs); await b.close()
asyncio.run(main(sys.argv[1]))

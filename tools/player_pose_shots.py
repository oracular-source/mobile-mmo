"""Shots of the player attack poses from the real game (character lane, Nov 27), for review sheets and the showcase.
Run from the repo root: python3 tools/player_pose_shots.py [class ...]
For each class: stands at the crossroads (daylight) next to a mob, then fires its main attack, an ability and a spell through
animPlayer (looks only) and films the player at 30 fps. Frames land in /tmp/poses/<class>NNN.png (crop around the player)."""
import asyncio,base64,sys,os
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER=['warrior','paladin','shadowknight','rogue','ranger','monk','bard','druid','necro','cleric','enchanter','wizard','magician','shaman']
JS='''()=>{const G=__game,P=G.player;simState.busy=true;
  const m=G.mobs.filter(m=>!m.dead).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];
  G.mobs.forEach(o=>{if(o!==m)o.dead=true});m.x=P.x+16;m.y=P.y;P.dir=1;P.target=null;m.state='idle';m.dir=-1;m.x0=m.x;
  const main=ABI[loadout[0]],all=Object.values(ABI).filter(a=>a&&a.lvl<=P.lvl);
  const skill=all.find(a=>(a.melee||a.shot)&&a.tgt&&a!==main)||all.find(a=>a.melee&&a.kind==='cleave');
  const spell=all.find(a=>!a.melee&&!a.shot&&a.tgt);
  const plan=[[4,main],[16,main],[30,skill],[46,spell]];const cv=document.querySelector('canvas'),out=[],dt=1/30;
  const crop=document.createElement('canvas');crop.width=44*S;crop.height=34*S;const cg=crop.getContext('2d');cg.imageSmoothingEnabled=false;
  for(let i=0;i<62;i++){plan.forEach(([f,a])=>{if(i===f&&a)animPlayer(a,m)});time+=dt;fxTick(dt);m.x=m.x0;P.hp=P.maxhp||P.hp;render();
    const sx=(P.x-camX-16)*S,sy=(P.y-camY-27)*S;cg.clearRect(0,0,crop.width,crop.height);cg.drawImage(cv,sx,sy,crop.width,crop.height,0,0,crop.width,crop.height);out.push(crop.toDataURL())}
  return {out:out,names:[main&&main.name,skill&&skill.name,spell&&spell.name]}}'''
async def main(ids):
  os.makedirs('/tmp/poses',exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    for id in ids:
      await pg.goto('file://'+ROOT+'/index.html?debug&level=9&area=cross')
      await pg.evaluate("id=>{localStorage['ashfen-class']=JSON.stringify(id)}",id)
      await pg.goto('file://'+ROOT+'/index.html?debug&level=9&area=cross');await pg.wait_for_timeout(1200)
      try: await pg.click('text=Play',timeout=1200)
      except Exception: pass
      await pg.wait_for_timeout(1200)
      r=await pg.evaluate(JS)
      for i,s in enumerate(r['out']): open(f'/tmp/poses/{id}{i:03d}.png','wb').write(base64.b64decode(s.split(',')[1]))
      print(id,r['names'],'errors',errs)
    await b.close()
asyncio.run(main(sys.argv[1:] or ORDER))

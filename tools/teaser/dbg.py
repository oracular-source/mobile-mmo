import sys,json; sys.path.insert(0,'.')
import record, shots
from playwright.sync_api import sync_playwright
s=[x for x in shots.SHOTS if x['name']==sys.argv[1]][0]
srv=record.serve()
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
  ctx=b.new_context(viewport={'width':360,'height':640},device_scale_factor=2)
  ctx.add_init_script(record.INIT.replace('__SEED__','7').replace('__CLS__',s['cls']).replace('__MM__','false').replace('__ZOOM__','150'))
  rs=record.patched_render();import re
  ctx.route(re.compile(r'.*/js/render\.js.*'),lambda r:r.fulfill(status=200,content_type='application/javascript',body=rs))
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto('http://127.0.0.1:8765/index.html?debug&area=%s&level=%d'%(s['area'],s['level']));pg.wait_for_function('!!window.__game')
  for _ in range(3):pg.evaluate('__step()')
  pg.add_script_tag(content=record.FAKES);pg.add_script_tag(content=record.OVERLAY_JS)
  pg.add_script_tag(content='(function(){'+s['setup']+'})();');pg.add_script_tag(content='window.__tick=function(i,dt){'+s.get('tick','')+'};')
  for i in range(int(sys.argv[2]) if len(sys.argv)>2 else 40):
    pg.evaluate('(i)=>{window.__fi=i;__tick(i,1/30);__heroTick(1/30);__fakeTick(1/30);__step()}',i)
  print(pg.evaluate("""()=>JSON.stringify({p:[player.x|0,player.y|0,player.tx,player.target&&player.target.type],hf:!!window.__hf,
    mobs:mobs.filter(m=>!m.dead).map(m=>[m.type,m.x|0,m.y|0,m.state,m.hp|0]),fakes:__fakes.map(f=>[f.name,f.x|0,f.y|0,f.target&&f.target.type])})"""))
  print(errs)

"""Probe a shot without filming it: run its setup and N frames, then print a JS expression (positions, states, stalls).
Run from tools/teaser:  python3 dbg.py <shot> [frames] [js expression]"""
import sys, re; sys.path.insert(0, '.')
import record, shots
from playwright.sync_api import sync_playwright
s = [x for x in shots.SHOTS if x['name'] == sys.argv[1]][0]
N = int(sys.argv[2]) if len(sys.argv) > 2 else 40
EXPR = sys.argv[3] if len(sys.argv) > 3 else """JSON.stringify({p:[player.x|0,player.y|0,player.target&&player.target.type],
  mobs:mobs.filter(m=>!m.dead).map(m=>[m.type,m.x|0,m.y|0,m.state,Math.round(m.hp/m.maxhp*100)]),
  fakes:__fakes.map(f=>[f.name,f.x|0,f.y|0,f.target&&f.target.type,f.sitting?'sit':'']),stuck:__stuck.slice(-8)})"""
srv = record.serve()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-proxy-server'])
    ctx = b.new_context(viewport={'width': 360, 'height': 640}, device_scale_factor=2)
    ctx.add_init_script(record.INIT.replace('__SEED__', str(s.get('seed', 7))).replace('__CLS__', s['cls']).replace('__MM__', 'false').replace('__ZOOM__', str(s.get('zoom', 999))))
    for fn in record.PATCHES:
        body = record.patched(fn)
        ctx.route(re.compile(r'.*/js/' + re.escape(fn) + r'.*'), (lambda bd: lambda route, req: route.fulfill(status=200, content_type='application/javascript', body=bd))(body))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:%d/index.html?debug&area=%s&level=%d' % (record.PORT, s['area'], s['level'])); pg.wait_for_function('!!window.__game')
    for _ in range(3): pg.evaluate('__step()')
    pg.add_script_tag(content=record.FAKES); pg.add_script_tag(content=record.OVERLAY_JS)
    pg.add_script_tag(content='(function(){' + s['setup'] + '})();'); pg.add_script_tag(content='window.__tick=function(i,dt){' + s.get('tick', '') + '};')
    w = s.get('warm', 0)
    for i in range(N):
        pg.evaluate('(i)=>{window.__fi=i;__tick(i,1/30);__heroTick(1/30);__fakeTick(1/30);__step()}', i - w)
    print(pg.evaluate('()=>' + EXPR)); print(errs[:3])

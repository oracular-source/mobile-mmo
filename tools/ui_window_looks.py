# Rough draft: UI breakdown 19, window looks. Restyles the real game's windows with each option's CSS and screenshots them.
# Needs Python Playwright and Chrome. Run from the repo root: python3 tools/ui_window_looks.py
import asyncio,os
from playwright.async_api import async_playwright
from PIL import Image,ImageDraw,ImageFont
BASE=""".card{background:rgba(40,40,40,.97)!important;border:1px solid #8a8a8a!important;border-radius:4px!important;box-shadow:none!important}
.card h1{border-bottom-color:#555!important}
.card button,.card .chip,.card .bc,.card .fork,.card .dslot,.card .bc8{border-radius:4px!important;box-shadow:none!important}
.card button{background:#2b2b2b!important;border:1px solid #8a8a8a!important;color:#e6e6e6!important}
.card button.active,.card .seg button.active{border-color:#c9a227!important;color:#ffd27a!important;background:#3a3628!important}
.card .tabs button.active{background:#46464c!important;color:#fff!important}
.card .chip,.card .bc,.card .fork{background:#2b2b2b!important;border-color:#666!important}
.card .go{background:#2b2b2b!important;border-color:#c9a227!important;color:#ffd27a!important}
"""
OPTS=[('Now',''),
 ('A Plain grey, white titles',BASE+".card h1,.card h2{color:#eee!important;text-shadow:none!important}"),
 ('B Plain grey, gold titles',BASE+".card h1,.card h2{color:#c9a227!important}"),
 ('C Dark, grey edges',".card{border-color:#8a8a8a!important;border-radius:4px!important}.card button{border-radius:4px!important;border-color:#8a8a8a!important;background:#1e1e22!important;box-shadow:none!important}.card button.active{border-color:#c9a227!important}")]
VIEWS=[('Menu: Spells',"openModal('menuUI');setMenuTab('spells')"),('Menu: Settings',"openModal('menuUI');setMenuTab('settings')"),('Character',"openModal('charUI')")]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--allow-file-access-from-files'])
    pg=await b.new_page(viewport={'width':390,'height':700},device_scale_factor=2,has_touch=True)
    await pg.goto('file://'+os.path.abspath('index.html')+'?level=10');await pg.wait_for_timeout(1200)
    await pg.evaluate("""()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Play/.test(x.textContent));if(b)b.click()}""");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{const s=document.createElement('style');s.id='opt';document.head.appendChild(s)}")
    shots={}
    for oi,(on,css) in enumerate(OPTS):
      await pg.evaluate("c=>{document.getElementById('opt').textContent=c}",css)
      for vi,(vn,js) in enumerate(VIEWS):
        await pg.evaluate("()=>{"+js+"}");await pg.wait_for_timeout(350)
        f='/tmp/o%d%d.png'%(oi,vi);await pg.screenshot(path=f);shots[(oi,vi)]=f
    await b.close()
  W,H=390,700;F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20)
  for vi,(vn,_) in enumerate(VIEWS):
    sh=Image.new('RGB',(4*(W+10)+10,H+50),(250,250,250));d=ImageDraw.Draw(sh)
    for oi,(on,_) in enumerate(OPTS):
      sh.paste(Image.open(shots[(oi,vi)]).resize((W,H)),(10+oi*(W+10),45));d.text((10+oi*(W+10),12),on,font=F,fill=(20,20,20))
    sh.save('art/drafts/ui-window-looks-%s.png'%['menu','settings','char'][vi])
asyncio.run(main())

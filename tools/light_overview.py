"""Whole-map lighting pictures from the real game, for the lighting pass (Nov 27).
Builds each area in a headless browser and draws its ground with the baked light on top (the same darkness, cut-out and
firelight glow the game draws), plus a small numbered dot on every fixed light so placements can be checked for symmetry.
Run from the repo root: python3 tools/light_overview.py out/lights crypt dungeon1 dungeon1_f2 rat_tunnel
Writes <area>.png (scale 1) and prints each area's light list (number, kind, tile) and any JavaScript errors."""
import asyncio, base64, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""(k)=>{
  const A=buildArea(k),W=A.w*T,H=A.h*T,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.drawImage(A.world,0,0);
  const AT=AREA_TINT[A.tint]||{amb:0.38,col:'0,0,0'},d=document.createElement('canvas');d.width=W;d.height=H;const dg=d.getContext('2d');
  dg.fillStyle='rgba('+AT.col+','+(1-AT.amb)+')';dg.fillRect(0,0,W,H);
  dg.globalCompositeOperation='destination-out';drawLightMap(dg,A.lmCut,0,0,W,H,0,0);
  g.drawImage(d,0,0);g.globalCompositeOperation='lighter';drawLightMap(g,A.lmGlow,0,0,W,H,0,0);g.globalCompositeOperation='source-over';
  // which object made each light: match lights to the nearest light-giving object
  const src=A.objs.filter(o=>['torch','sconce','lantern','candle','brazier','campfire','censer','shrine','altar','window','mourner_shrine','feast_table','light_shaft','book_pyre','bell_mold','ash_circle','flowers','sunbeam','foxfire','shack','chapel','crypt_mouth','town_gate'].indexOf(o.kind)>=0);
  g.font='9px monospace';g.textBaseline='middle';
  const out=[];src.forEach((o,i)=>{const x=o.x*T+o.w*T/2,y=o.y*T+8;g.fillStyle='#0ff';g.fillRect(x-2,y-2,4,4);g.fillStyle='#000';g.fillRect(x+3,y-5,String(i+1).length*6+2,10);g.fillStyle='#0ff';g.fillText(String(i+1),x+4,y);out.push((i+1)+' '+o.kind+' '+o.x+','+o.y)});
  return {png:c.toDataURL('image/png'),list:out};
}"""

async def main(out, areas):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 390, 'height': 844})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + ROOT + '/index.html?debug')
        await pg.wait_for_timeout(1500)
        for a in areas:
            r = await pg.evaluate(JS, a)
            open(os.path.join(out, a + '.png'), 'wb').write(base64.b64decode(r['png'].split(',')[1]))
            print('==', a); print('\n'.join(r['list']))
        print('errors:', errs)
        await b.close()

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2:]))

"""Phone-size screenshots of an area from the real game, for showing the owner a crop before shipping art.
Opens the game headless at phone size, stands the hero on each spot (tile x,y), waits, and saves one PNG per spot.
Run from the repo root: python3 tools/area_shots.py wolfwood out/shots 52,40 30,36 40,24
Prints any JavaScript errors it saw."""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

async def main(area, out, spots):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("CHROME") or None)
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + ROOT + '/index.html?debug&area=' + area)
        await pg.wait_for_timeout(1500)
        try: await pg.click('text=Play', timeout=1500)
        except Exception: pass
        await pg.wait_for_timeout(1500)
        for s in spots:
            x, y = [float(v) for v in s.split(',')]
            # Stand the hero on the spot and clear any mobs so the scenery shows.
            await pg.evaluate('([x,y])=>{const P=__game.player;P.x=x*16+8;P.y=y*16+12;P.tx=null;__game.mobs.length=0}', [x, y])
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=os.path.join(out, area + '_' + s.replace(',', '_') + '.png'))
        print('errors:', errs)
        await b.close()

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3:]))

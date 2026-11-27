"""Wide in-game shots of whole areas, for map passes (Nov 27, map love pass).
Opens the real game headless with a big window, zooms the camera out to 2x, hides the HUD, and walks the hero
over a grid of spots so each area is covered in a few shots (trees, lights, fog and critters all drawn live).
Run from the repo root: python3 tools/area_tour.py out/tour crypt crossroads ...
Each shot is saved as <area>_<col>_<row>.png with the hero (tile) spot in the name; prints JavaScript errors."""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, SC = 1280, 1280, 2           # window size and pixels per game pixel
SPAN = W // SC // 16                # tiles across one shot (40)

async def main(out, areas):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None)
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + ROOT + '/index.html?debug')
        await pg.wait_for_timeout(1500)
        try: await pg.click('text=Play', timeout=1500)
        except Exception: pass
        await pg.wait_for_timeout(1000)
        await pg.add_style_tag(content='#view>*:not(#c){visibility:hidden!important} #app>*:not(#view){display:none!important}')
        for area in areas:
            await pg.evaluate('k=>__game.enterZone(ZONE_OF[k]||k)', area)
            await pg.wait_for_timeout(800)
            w, h = await pg.evaluate('()=>[MW,MH]')
            xs = list(range(SPAN // 2, max(SPAN // 2, w - SPAN // 2) + 1, SPAN - 6)) or [w // 2]
            ys = list(range(SPAN // 2, max(SPAN // 2, h - SPAN // 2) + 1, SPAN - 6)) or [h // 2]
            if xs[-1] < w - SPAN // 2: xs.append(w - SPAN // 2)
            if ys[-1] < h - SPAN // 2: ys.append(h - SPAN // 2)
            for j, y in enumerate(ys):
                for i, x in enumerate(xs):
                    await pg.evaluate('''([x,y,s])=>{const P=__game.player;P.x=x*16+8;P.y=y*16+12;P.tx=null;
                        __game.mobs.length=0;S=s;VW=Math.ceil(cv.width/S);VH=Math.ceil(cv.height/S)}''', [x, y, SC])
                    await pg.wait_for_timeout(700)
                    await pg.evaluate('([s])=>{S=s;VW=Math.ceil(cv.width/S);VH=Math.ceil(cv.height/S)}', [SC])
                    await pg.wait_for_timeout(250)
                    await pg.screenshot(path=os.path.join(out, f'{area}_{i}_{j}__{x}-{y}.png'))
            print(area, w, h, 'shots', len(xs) * len(ys))
        print('errors:', errs)
        await b.close()

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2:]))

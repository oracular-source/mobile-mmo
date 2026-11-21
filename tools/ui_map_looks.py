"""Draft sheets for UI breakdown 20 (minimap and full map cleanup).
Opens the real game headless, injects tools/ui_map_looks.js, draws each take from the real map data and saves
art/drafts/ui-map-looks-mini.png and art/drafts/ui-map-looks-full.png. Draft only: the game is unchanged.
Run from the repo root: python3 tools/ui_map_looks.py"""
import asyncio, base64, io, os
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = open(os.path.join(ROOT, 'tools', 'ui_map_looks.js')).read()
MINI = [('old', 'Now (v0.48)'), ('A', 'A  Clean square'), ('B', 'B  Pictures + ring'), ('C', 'C  Round compass')]
FULL = [('A', 'A  Names on the map'), ('B', 'B  Tap a pin'), ('C', 'C  Short list by kind')]
SPOTS = {'cross': 'Crossroads', 'wolf': 'Wolfwood', 'gy': 'Sunken Graveyard'}

def font(n):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, n)
    return ImageFont.load_default()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + ROOT + '/index.html?debug&area=crossroads')
        await pg.wait_for_timeout(1500)
        try: await pg.click('text=Play', timeout=1500)
        except Exception: pass
        await pg.wait_for_timeout(1200)
        await pg.add_script_tag(content=JS)
        # Where "you" stand in each area: by the campfire if there is one, else the middle of the first road.
        spot = """id=>{const Z=mmZone(id),c=Z.pins.find(p=>p.k==='camp'&&p.name==='Campfire');
          return c?[c.x+2,c.y+1]:[Math.floor(Z.w/2),Math.floor(Z.h/2)]}"""
        rows = []
        for zid in SPOTS:
            x, y = await pg.evaluate(spot, zid)
            imgs = []
            for take, _ in MINI:
                url = await pg.evaluate('([t,z,x,y])=>draftMini(t,z,x,y,-0.7,96)', [take, zid, x, y])
                imgs.append(Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGB'))
            rows.append((SPOTS[zid], imgs))
        # Mini sheet: each take at 2x (as it looks on a sharp phone, blown up to judge) plus true phone size.
        cw = 192 * 2; pad = 24; F = font(22); f2 = font(16)
        W = pad + len(MINI) * (cw + pad); H = 60 + len(rows) * (cw + 70)
        sheet = Image.new('RGB', (W, H), (22, 22, 24)); d = ImageDraw.Draw(sheet)
        for i, (_, lab) in enumerate(MINI): d.text((pad + i * (cw + pad), 18), lab, fill=(230, 200, 120), font=F)
        for r, (name, imgs) in enumerate(rows):
            y0 = 60 + r * (cw + 70)
            d.text((pad, y0), name, fill=(170, 170, 170), font=f2)
            for i, im in enumerate(imgs):
                sheet.paste(im.resize((cw, cw), Image.NEAREST), (pad + i * (cw + pad), y0 + 24))
        out = os.path.join(ROOT, 'art', 'drafts'); os.makedirs(out, exist_ok=True)
        sheet.save(os.path.join(out, 'ui-map-looks-mini.png'))
        # Full map takes: the real map window restyled, screenshotted at phone size.
        shots = []
        for take, lab in FULL:
            await pg.goto('file://' + ROOT + '/index.html?debug&area=crossroads'); await pg.wait_for_timeout(1200)
            try: await pg.click('text=Play', timeout=1500)
            except Exception: pass
            await pg.wait_for_timeout(1000); await pg.add_script_tag(content=JS)
            x, y = await pg.evaluate(spot, 'cross')
            await pg.evaluate("()=>{openModal('mapUI');renderMapScreen()}"); await pg.wait_for_timeout(300)
            await pg.evaluate('([t,x,y])=>draftFull(t,"cross",x,y,-0.7)', [take, x, y]); await pg.wait_for_timeout(300)
            card = await pg.query_selector('#mapUI .card')
            shots.append((lab, Image.open(io.BytesIO(await card.screenshot())).convert('RGB')))
        sw = max(s.width for _, s in shots); sh = max(s.height for _, s in shots)
        full = Image.new('RGB', (pad + len(shots) * (sw + pad), sh + 70), (22, 22, 24)); d = ImageDraw.Draw(full)
        for i, (lab, s) in enumerate(shots):
            d.text((pad + i * (sw + pad), 18), lab, fill=(230, 200, 120), font=F); full.paste(s, (pad + i * (sw + pad), 56))
        full.save(os.path.join(out, 'ui-map-looks-full.png'))
        print('errors:', errs)
        await b.close()

asyncio.run(main())

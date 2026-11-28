#!/usr/bin/env python3
"""Zone 1 climb with gear (Items lane, v0.137): every class from level 1 to Brother Malrec, wearing drops as they come.

  python3 tools/climb.py                      every class, with gear and without, 1 run each -> out/climb.json
  python3 tools/climb.py --only druid,wizard  just these
  python3 tools/climb.py --seeds 2 --nogear-off   more runs; skip the naked comparison

Why: to time Zone 1 (with items on) and size Zone 2 and the mount around it. The sim itself is runClimb in js/sim.js.
Runs classes in parallel, one browser page each (--jobs, default 2).
"""
import json, os, sys, time, argparse
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check import serve
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--only', default='')
ap.add_argument('--seeds', type=int, default=1)
ap.add_argument('--jobs', type=int, default=2)
ap.add_argument('--nogear-off', action='store_true')
ap.add_argument('--chrome', default='/usr/bin/google-chrome')
ap.add_argument('--out', default=os.path.join(ROOT, 'out', 'climb.json'))
a = ap.parse_args()

srv = serve(); url = 'http://127.0.0.1:%d/' % srv.server_address[1]

def one(job):
    cls, gear = job
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=a.chrome or None, args=['--no-sandbox'])
        ctx = b.new_context()
        ctx.add_init_script("try{localStorage.setItem('ashfen-class',JSON.stringify(%s))}catch(e){}" % json.dumps(cls))
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url + 'index.html?debug'); pg.wait_for_function('window.__game')
        t = time.time()
        r = pg.evaluate('o=>__game.runClimb(o)', {'seeds': a.seeds, 'gear': gear})
        b.close()
    r = r or {'cls': cls, 'runs': []}
    r['gearOn'] = gear; r['secs'] = round(time.time() - t); r['errors'] = errs[:5]
    print('%-14s gear=%-5s %4ds  %s' % (cls, gear, r['secs'], ', '.join('%.1fh L%d malrec=%s' % (x['hours'], x['lvl'], x['malrec']) for x in r['runs'])), flush=True)
    return r

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=a.chrome or None, args=['--no-sandbox']); pg = b.new_page()
    pg.goto(url + 'index.html?debug'); pg.wait_for_function('window.__game')
    classes = pg.evaluate('Object.keys(CLASSES)'); b.close()
if a.only: classes = [c for c in classes if c in a.only.split(',')]
jobs = [(c, True) for c in classes] + ([] if a.nogear_off else [(c, False) for c in classes])
with ThreadPoolExecutor(a.jobs) as ex: res = list(ex.map(one, jobs))
os.makedirs(os.path.dirname(a.out), exist_ok=True)
json.dump(res, open(a.out, 'w'), indent=1)
print('saved', a.out)

#!/usr/bin/env python3
"""Automatic checks: runs on GitHub after every push (.github/workflows/checks.yml), or by hand.

  python3 tools/check.py             run every check; exit code 1 if anything broke
  python3 tools/check.py --update    after a balance change that was MEANT: save today's sim numbers as the new baseline
  python3 tools/check.py --quick     skip the sim (load, areas, casting, maps only)
  python3 tools/check.py --only necro,wizard   just these classes (faster when working on one)
  python3 tools/check.py --chrome /usr/bin/google-chrome   use this browser instead of Playwright's own

What it checks (why: the owner tests on a phone, so a break should show up as a red X on GitHub first):
  1. Maps: tools/mapcheck.py on every map file (its errors, not its warnings).
  2. Load: the game opens with no JavaScript error, for every class.
  3. Areas: walks into every area and lets it run and draw for a moment; no error.
  4. Casting: every class, at the top test level, casts each of its abilities at a test mob; no error.
  5. Sim: every class's sim (fixed seeds, so the same code gives the same numbers) matches
     tools/check-baseline.json. Numbers that moved without a balance change mean something changed by accident.

Errors are caught two ways: the browser's own error events, and the game's crash catcher (js/crash.js), which
otherwise swallows errors so the phone keeps playing.
Needs: pip install playwright pillow, then python3 -m playwright install chromium (GitHub does this itself).
"""
import json, os, subprocess, sys, threading, time, glob, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASELINE = os.path.join(ROOT, 'tools', 'check-baseline.json')
SIM_SEEDS = 10         # fights per scenario, same as the game's own sim (SIM_SEEDS in js/sim.js)
AREA_SECONDS = 1.0     # real time each area runs and draws
problems = []          # everything that broke, printed at the end


def fail(what):
    problems.append(what)
    print('  FAIL ' + what, flush=True)


# ---------- 1. Maps ----------
def check_maps():
    print('Maps', flush=True)
    files = sorted(glob.glob(os.path.join(ROOT, 'js', 'data', 'maps', '*.js')))
    out = os.path.join(ROOT, 'out', 'mapcheck')
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'mapcheck.py')] + files + ['--out', out],
                       capture_output=True, text=True)
    errs = [l.strip() for l in r.stdout.splitlines() if l.strip().startswith('ERROR')]
    for e in errs: fail('map: ' + e)
    if r.returncode != 0 and not errs: fail('map: mapcheck.py stopped with code %d\n%s' % (r.returncode, r.stderr[-800:]))
    if r.returncode == 0: print('  ok   %d map files' % len(files), flush=True)


# ---------- Game in a headless browser ----------
def serve():
    # A tiny local web server, so the game loads the same way it does from GitHub Pages.
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=ROOT)
    srv = ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def open_game(browser, url, cls, errors):
    """A fresh page with this class picked and the game started. Browser errors land in `errors`."""
    ctx = browser.new_context(viewport={'width': 390, 'height': 844})
    ctx.add_init_script("try{localStorage.setItem('ashfen-class',JSON.stringify(%s))}catch(e){}" % json.dumps(cls))
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append('page error: ' + str(e)))
    page.on('console', lambda m: errors.append('console error: ' + m.text) if m.type == 'error' else None)
    page.on('requestfailed', lambda r: errors.append('could not load ' + r.url.replace(url, '')))
    page.goto(url + 'index.html?debug', wait_until='load')
    page.wait_for_function('window.__game', timeout=15000)
    page.evaluate('startGame()')
    return ctx, page


def crashes(page):
    # The game's crash catcher keeps the loop going after an error; its reports are how we see those errors.
    return page.evaluate("Object.keys(crashSeen).map(k=>crashSeen[k].error+' | '+(crashSeen[k].stack||'').split('\\n')[1])")


def report(where, page, errors, seen):
    """Fail for every new browser error or crash report since the last call. `seen` remembers what was already reported."""
    bad = errors[seen['e']:] + [c for c in crashes(page) if c not in seen['c']]
    seen['e'] = len(errors); seen['c'] = set(crashes(page))
    for b in bad: fail('%s: %s' % (where, b))
    return not bad


def check_class(browser, url, cls, areas, sim):
    errors, seen = [], {'e': 0, 'c': set()}
    ctx, page = open_game(browser, url, cls, errors)
    ok = report(cls + ' load', page, errors, seen)
    page.evaluate('dev.god=true')  # nothing should die during the area tour
    # Areas: each class walks the tour, since a class's pet, buffs or spells can be what breaks an area.
    for a in areas:
        page.evaluate('id=>enterZone(id)', a)
        time.sleep(AREA_SECONDS)
        ok &= report('%s in area %s' % (cls, a), page, errors, seen)
    # Casting: every ability the class has, at the top test level, at a test mob in the arena.
    res = page.evaluate("""()=>{
      const out=[];simState.busy=true;dev.god=true;enterZone('arena');player.lvl=TEST_MAX;
      player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);
      for(const id in ABI){const a=ABI[id];if(a.lvl>player.lvl)continue;
        mobs.forEach(m=>{m.dead=1});
        const m=arenaMob('cskel',player.lvl,player.x+40,player.y);
        player.cds={};player.gcd=0;player.cast=null;player.mp=maxMP(player.lvl);player.target=m;
        try{cast(a,true);for(let i=0;i<120;i++)update(1/30)}catch(e){out.push(a.name+': '+e.message)}}
      simState.busy=false;return out}""")
    for r in res: fail('%s cast %s' % (cls, r))
    ok &= report(cls + ' casting', page, errors, seen) and not res
    print('  %s %s' % ('ok  ' if ok else 'FAIL', cls), flush=True)
    rows = None
    if sim:
        ctx.close()  # a clean page for the sim, so the tour and casting above can't change its numbers
        errors, seen = [], {'e': 0, 'c': set()}
        ctx, page = open_game(browser, url, cls, errors)
        t = time.time()
        r = page.evaluate('s=>__game.runSim({seeds:s})', SIM_SEEDS)
        report(cls + ' sim', page, errors, seen)
        if not r: fail(cls + ' sim: no results (does the class have a bot in BOTS?)')
        else:
            rows = [{'lvl': x['lvl'], 'fight': x['fight'] + (' · ' + x['mode'] if x['mode'] else ''), 'wins': x['wins'],
                     'deaths': x['deaths'], 'kill': round(x['kill'], 1), 'dmg': round(x['dmg'])} for x in r['rows']]
            print('       sim %d rows in %.0fs' % (len(rows), time.time() - t), flush=True)
    ctx.close()
    return rows


def compare(cls, rows, base):
    """Sim numbers vs the saved baseline. Same seeds and same code give the same numbers, so any move is a change."""
    if cls not in base: fail('%s sim: not in the baseline yet (run tools/check.py --update)' % cls); return
    old = {(r['lvl'], r['fight']): r for r in base[cls]}
    new = {(r['lvl'], r['fight']): r for r in rows}
    moved = []
    for k in sorted(set(old) | set(new), key=lambda k: (k[0], k[1])):
        a, b = old.get(k), new.get(k)
        if not a or not b: moved.append('lvl %s %s: %s' % (k[0], k[1], 'new fight' if b else 'fight gone')); continue
        diff = [f for f in ('wins', 'deaths', 'kill', 'dmg') if a[f] != b[f]]
        if diff: moved.append('lvl %s %s: ' % k + ', '.join('%s %s→%s' % (f, a[f], b[f]) for f in diff))
    if moved:
        fail('%s sim numbers moved (%d fights). If that was a balance change on purpose, run tools/check.py --update:\n       ' % (cls, len(moved))
             + '\n       '.join(moved[:8]) + ('\n       …' if len(moved) > 8 else ''))


def main():
    args = sys.argv[1:]
    update, quick = '--update' in args, '--quick' in args
    chrome = args[args.index('--chrome') + 1] if '--chrome' in args else None
    only = args[args.index('--only') + 1].split(',') if '--only' in args else None
    t0 = time.time()
    check_maps()
    from playwright.sync_api import sync_playwright
    srv = serve()
    url = 'http://127.0.0.1:%d/' % srv.server_address[1]
    base = json.load(open(BASELINE)) if os.path.exists(BASELINE) else {}
    sims = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome) if chrome else p.chromium.launch()
        # Ask the game for its own lists, so a new class or area is checked without editing this file.
        errors = []
        ctx, page = open_game(browser, url, 'druid', errors)
        classes = [c for c in page.evaluate('Object.keys(CLASSES)') if not only or c in only]
        areas = page.evaluate('Object.keys(AREA_OF)')
        ctx.close()
        print('Classes (%d), areas (%s)%s' % (len(classes), ', '.join(areas), '' if quick else ', sim'), flush=True)
        for c in classes:
            rows = check_class(browser, url, c, areas, not quick)
            if rows is not None: sims[c] = rows
        browser.close()
    srv.shutdown()
    if not quick:
        if update:
            base.update(sims)
            json.dump(base, open(BASELINE, 'w'), indent=0, ensure_ascii=False)
            print('Saved the sim baseline for %d classes to tools/check-baseline.json' % len(sims))
        else:
            for c, rows in sims.items(): compare(c, rows, base)
    print('\n%s in %.0fs' % ('ALL CHECKS PASSED' if not problems else '%d PROBLEM(S)' % len(problems), time.time() - t0))
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()

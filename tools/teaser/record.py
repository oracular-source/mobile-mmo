"""Teaser video recorder (personal-use trailer, not part of the game).

Plays the real game in headless Chrome one frame at a time (a fake clock, so every frame is exactly 1/30 s of game time),
screenshots each frame, and turns each shot into an MP4 with ffmpeg. Fake "other players" come from fakes.js and a small
patch to render.js that is applied only while recording (served through the browser, never written to the game files).

Run:  python3 tools/teaser/record.py [shot names...]   (from the repo root; output in ../teaser_out)
"""
import os, re, sys, json, shutil, subprocess, threading, functools, http.server
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.abspath(os.path.join(ROOT, '..', 'teaser_out'))
PORT = 8765
PREVIEW = int(os.environ.get('PREVIEW', '0'))   # e.g. PREVIEW=40: only every 40th frame, no video
W, H, DSF, FPS = 360, 640, 2, 30          # CSS size x2 = 720 x 1280 video, phone portrait

INIT = r"""
(()=>{
  // Fake clock: the game only advances when the recorder calls __step().
  let vt=0;const cbs=[];window.requestAnimationFrame=cb=>{cbs.push(cb);return cbs.length};
  performance.now=()=>vt;
  window.__step=()=>{vt+=1000/30;const l=cbs.splice(0);l.forEach(cb=>cb(vt))};
  // Same randomness every take.
  let s=__SEED__>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
  try{localStorage.clear();localStorage.setItem('ashfen-class',JSON.stringify('__CLS__'));
    localStorage.setItem('ashfen-settings',JSON.stringify({minimap:__MM__,zoom:__ZOOM__}));sessionStorage.setItem('ashfen-go','1')}catch(e){}
})();
"""

CINE_CSS = "#view > :not(#c){display:none !important} .modal{display:none !important}"
HUD_CSS = "#devbtn{display:none !important} .modal{display:none !important}"

# Recording-only patches to render.js: a camera override, the hero can be hidden, fakes join the depth sort, names on top.
PATCHES = {'render.js': [
    ("camY=sn(camY);}", "camY=sn(camY);}if(window.__cam){camX=window.__cam.x;camY=window.__cam.y}"),
    ("drawGlows();", "drawGlows();if(window.__spellFx)window.__spellFx();"),
    ("[player],trees)", "[player],trees,window.__fakes||[])"),
    ("const drawEnt=e=>{", "const drawEnt=e=>{if(e.fake){window.__drawFake(e);return}if(e===player&&window.__hideHero)return;"),
    ("if(player.dead>0){cx.fillStyle='rgba(60", "if(window.__names)window.__names();if(window.__overlayDraw)window.__overlayDraw();if(player.dead>0){cx.fillStyle='rgba(60"),
  ],
  # Draft 3: a mob can fight a fake player (the group's tank), so the hero isn't the only one ever hit.
  'combat.js': [("const victim=m=>(decoy", "const victim=m=>(m.fakeT&&window.__fakes&&__fakes.indexOf(m.fakeT)>=0)?m.fakeT:(decoy")],
  'update.js': [("if(v===decoy){floatText(decoy.x,decoy.y-20,'miss','#c8a0ff')}", "if(v.fake){window.__hurtFake(m,v)}else if(v===decoy){floatText(decoy.x,decoy.y-20,'miss','#c8a0ff')}")],
}

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Quiet, directory=ROOT)
    class Q(http.server.ThreadingHTTPServer):
        allow_reuse_address = True
    srv = Q(('127.0.0.1', PORT), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def patched(fn):
    src = open(os.path.join(ROOT, 'js', fn)).read()
    for a, b in PATCHES[fn]:
        assert src.count(a) == 1, 'patch anchor missing or not unique in %s: %s' % (fn, a)
        src = src.replace(a, b)
    return src

STUCK = {}
FAKES = open(os.path.join(os.path.dirname(__file__), 'fakes.js')).read()

def record(pw_browser, shot):
    """shot: dict(name, cls, area, level, frames, setup (js), tick (js run every frame, gets i), hud, seed, warm)."""
    name = shot['name']; d = os.path.join(OUT, 'frames', name)
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    ctx = pw_browser.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DSF, is_mobile=True, has_touch=True)
    init = (INIT.replace('__SEED__', str(shot.get('seed', 7))).replace('__CLS__', shot.get('cls', 'druid'))
            .replace('__MM__', 'true' if shot.get('hud') else 'false').replace('__ZOOM__', str(shot.get('zoom', 999))))
    ctx.add_init_script(init)
    for fn in PATCHES:
        body = patched(fn)
        ctx.route(re.compile(r'.*/js/' + re.escape(fn) + r'.*'), (lambda b: lambda route, req: route.fulfill(status=200, content_type='application/javascript', body=b))(body))
    page = ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    q = '?debug&area=%s&level=%d' % (shot.get('area', 'crossroads'), shot.get('level', 1))
    page.goto('http://127.0.0.1:%d/index.html%s' % (PORT, q))
    page.wait_for_function('typeof window.__step==="function" && !!window.__game')
    page.add_style_tag(content=HUD_CSS if shot.get('hud') else CINE_CSS)
    page.add_script_tag(content=FAKES)
    page.add_script_tag(content=OVERLAY_JS)
    for _ in range(3): page.evaluate('__step()')
    page.add_script_tag(content='(function(){' + shot.get('setup', '') + '})();')
    page.add_script_tag(content='window.__tick=function(i,dt){' + shot.get('tick', '') + '};')
    # Warm-up frames run the scene before filming starts (negative frame numbers), so a shot opens mid-fight.
    warm = shot.get('warm', 0)
    for k in range(warm):
        page.evaluate('(i)=>{window.__fi=i;__tick(i,1/30);__heroTick(1/30);__fakeTick(1/30);__step()}', k - warm)
    page.evaluate('__stuck.length=0')
    n = shot['frames']
    for i in range(n):
        page.evaluate('(i)=>{window.__fi=i;__tick(i,1/30);__heroTick(1/30);__fakeTick(1/30);__step()}', i)
        if PREVIEW and i % PREVIEW: continue
        page.screenshot(path=os.path.join(d, '%04d.jpg' % i), type='jpeg', quality=92)
    if errs: print('  JS errors in', name, ':', errs[:3])
    # Stuck check (owner: "people were getting stuck"): a stall is someone who wanted to move and didn't for 0.4 s. One is
    # fine (they pick a new spot); the same player stalling again and again on camera means the shot needs fixing.
    st = page.evaluate('__stuck')
    by = {}
    for e in st: by[e['name']] = by.get(e['name'], 0) + 1
    bad = {k: v for k, v in by.items() if v >= 3}
    print('  stalls:', by or 'none', ('  STUCK: ' + str(bad)) if bad else '')
    STUCK[name] = bad
    ctx.close()
    return d

# Text overlays are drawn on the game's crisp text layer by this helper, so they land in the screenshot.
OVERLAY_JS = r"""
window.__ov=[];  // {text, y (0..1 of screen), size, col, from, to (frame), sub}
window.__overlayDraw=function(){const i=window.__fi||0;cx.textAlign='center';cx.textBaseline='middle';
  __ov.forEach(o=>{if(i<o.from||i>o.to)return;const fi=Math.min(1,(i-o.from)/8,(o.to-i)/8);if(o.dim){cx.fillStyle='rgba(0,0,0,'+(o.dim*Math.max(0,Math.min(1,(i-o.from)/20)))+')';cx.fillRect(0,0,cv.width,cv.height);return}cx.globalAlpha=Math.max(0,fi);
    if(o.band){cx.fillStyle='rgba(0,0,0,0.55)';cx.fillRect(0,cv.height*o.y-o.size*dpr*1.1,cv.width,o.size*dpr*2.2)}
    cx.font=(o.w||'700')+' '+Math.round(o.size*dpr)+'px '+(o.font||'Georgia,serif');cx.lineWidth=Math.max(3,o.size/5)*dpr;cx.strokeStyle='#000';
    cx.strokeText(o.text,cv.width/2,cv.height*o.y);cx.fillStyle=o.col||'#ffe9a8';cx.fillText(o.text,cv.width/2,cv.height*o.y);cx.globalAlpha=1})};
"""

def caption_png(text, path, size=34):
    # A caption band drawn outside the game, for a shot whose video is zoomed afterwards (the zoom would crop an in-game one).
    from PIL import Image, ImageDraw, ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', size)
    im = Image.new('RGBA', (720, 1280), (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = int(1280 * 0.14)
    d.rectangle([0, y - int(size * 1.1), 720, y + int(size * 1.1)], fill=(0, 0, 0, 140))
    d.text((360, y), text, font=f, fill=(255, 233, 168, 255), anchor='mm', stroke_width=5, stroke_fill=(0, 0, 0, 255))
    im.save(path); return path

def encode(name, frames, fade_in=6, fade_out=6, extra=None):
    d = os.path.join(OUT, 'frames', name); tmp = os.path.join(OUT, 'shots', name + '.tmp.mp4'); dst = os.path.join(OUT, 'shots', name + '.mp4')
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    vf = ([extra] if extra else []) + ['format=yuv420p']
    if fade_in: vf.append('fade=t=in:st=0:d=%.3f' % (fade_in / FPS))
    if fade_out: vf.append('fade=t=out:st=%.3f:d=%.3f' % ((frames - fade_out) / FPS, fade_out / FPS))
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(d, '%04d.jpg'), '-vf', ','.join(vf),
           '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS), tmp]
    subprocess.run(cmd, check=True); os.replace(tmp, dst); return dst

def main(shots, only):
    os.makedirs(OUT, exist_ok=True); srv = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu-vsync', '--no-proxy-server'])
        for s in shots:
            if only and s['name'] not in only: continue
            print('recording', s['name'], s['frames'], 'frames'); sys.stdout.flush()
            record(b, s)
            vf = s.get('vf')
            if vf and s.get('caption'): vf = vf.replace('CAP7', caption_png(s['caption'], os.path.join(OUT, s['name'] + '_cap.png')))
            if not PREVIEW: encode(s['name'], s['frames'], s.get('fin', 6), s.get('fout', 6), vf)
        b.close()
    srv.shutdown()

if __name__ == '__main__':
    from shots import SHOTS
    main(SHOTS, sys.argv[1:])

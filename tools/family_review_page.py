"""Builds the review page for tools/family_anims_draft.py: art/drafts/family-anims-draft1.html (one page, every
family, each move playing at real speed with its frames laid out underneath). Run after the draft script."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'art/drafts/family-anims-draft1.json')))

FAMILIES = [
 ('Beetles', 'The mire beetle and Ironshell. Kept as they are (owner, Nov 27); Ironshell in his corner glade is the hint there is more.', [
  ('beetle_bite', 'Mire beetle attack', 'Rears up so its front lifts and the pincers open (the tell), dips its head in, snaps the pincers shut on you.', 1),
  ('beetle_death', 'Mire beetle death', 'Jolts, lands on its back with its legs in the air, flails them twice, curls them in and is gone.', 0),
  ('ironshell_bite', 'Ironshell attack (his own)', 'Rears up high with his pincers wide and holds it, then rams forward head-down and his shell thumps down on you with a kick of dust.', 1),
  ('ironshell_death', 'Ironshell death', 'The beetle death, heavier: he lands on his back with a thud and dust, flails, curls up.', 0)]),
 ('Thornback boar', 'Wolfwood. The charge it already has keeps its own rules; this is its normal hit and its death.', [
  ('boar_bite', 'Boar attack', 'Head down and tusks low as it sinks on its haunches (the tell), charges in, then tosses its head up so the tusks hook into you.', 1),
  ('boar_death', 'Boar death', 'Front knees buckle and the head drops, then the back legs go and it lies on its belly, snout in the dirt; one last kick, gone.', 0)]),
 ('Ash wisp', 'The chapel grounds. A wisp is living fire, so its flare may glow; it still moves its own body to hit you.', [
  ('wisp_bite', 'Ash wisp attack', 'Draws back and dims (the tell), leans in with a tongue of flame reaching for you, flares up white-hot on you.', 1),
  ('wisp_death', 'Ash wisp death', 'Gutters smaller and smaller, down to an ember, goes out in a thread of smoke that drifts up.', 0)]),
 ('Fen cultists', 'The chapel camps. Each one fights with the thing in its hand; all three share one death.', [
  ('zealot_attack', 'Zealot attack', 'Raises the sickle over his head with the blade back (the tell), chops down in an arc, blade low through you.', 1),
  ('zealot_death', 'Zealot death', 'Drops to his knees as the sickle falls, slumps forward, lies face down. Gone at once.', 0),
  ('ashcaller_attack', 'Ashcaller attack (up close)', 'Pulls the ember to his chest (the tell), shoves it at you so it flares, sparks spit into you. His Ash Bolt spell from range stays as it is.', 1),
  ('ashcaller_death', 'Ashcaller death', 'The same fall; the ember drops and goes out in smoke.', 0),
  ('chanter_attack', 'Chanter attack', 'Swings the censer up over his head on its chain (the tell), brings it round and smashes it into you, embers jumping.', 1),
  ('chanter_death', 'Chanter death', 'The same fall; the censer drops beside him.', 0)])]

ASKS = ['Mark each move <b>keep / change / skip</b>, and say what to change in your own words, like the rats.',
        'Beetles: should the mire beetle\'s pincers be bigger or brighter so they read on the phone?',
        'Boar: is the head toss big enough? It is 3 pixels at the front.',
        'Cultists: one shared death for all three, or should each fall its own way?',
        'Not here yet, to keep this round about the look: the great ash wisp and the candle wisp (they get the ash wisp\'s moves once you OK it), the mender, deacon and Ashen Acolyte (same cultist moves after), and Old Gnawbone\'s boss move.']

esc = lambda t: t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
sets = [[k, t, d, b] for _, _, items in FAMILIES for k, t, d, b in items]
fam_html = ''.join('<section class="fam" id="f' + str(i) + '"><h2 class="famh">' + esc(n) + '</h2><p class="dim">' + esc(s) + '</p>' +
                   ''.join('<div class="panel" data-k="' + k + '"></div>' for k, _, _, _ in items) + '</section>' for i, (n, s, items) in enumerate(FAMILIES))
nav = ''.join('<a href="#f' + str(i) + '">' + esc(n) + '</a>' for i, (n, _, _) in enumerate(FAMILIES))

page = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Family animations draft 1</title>
<style>
/* VOICE: a game dev's review sheet, plain and quick to judge on a phone
   IDEA: an animator's light table: each move playing big, its frames laid out below
   PICTURE: the mobs themselves, animated at real speed, the warrior standing in to take the hit
   COLOUR and TYPE: crypt dark stone, bone white, one grave-red accent; Pixelify Sans titles, Inter body
   LAYOUT: one column, a section per family, each move a stage then a frame strip */
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&family=Inter:wght@400;600&display=swap');
:root{color-scheme:dark;--bg:#16141a;--stone:#24212b;--line:#3a3542;--ink:#ece6da;--dim:#a39b8e;--red:#ff4a3a}
*{box-sizing:border-box;min-width:0}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;overflow-x:clip}
.band{padding:clamp(20px,4vw,48px) max(4vw,14px);max-width:900px;margin:auto}
h1{font:700 clamp(30px,6vw,46px)/1.05 'Pixelify Sans',sans-serif;margin:0 0 10px;text-wrap:balance}
h2{font:700 24px/1.1 'Pixelify Sans',sans-serif;margin:0 0 4px}.famh{font-size:32px;margin-top:34px}
p{margin:0 0 12px;max-width:66ch}.dim{color:var(--dim);font-size:15px}
.nav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.nav a{color:var(--ink);background:var(--stone);border:1px solid var(--line);border-radius:8px;padding:10px 14px;text-decoration:none;font-weight:600;min-height:44px}
.panel{background:var(--stone);border:1px solid var(--line);border-radius:10px;padding:16px;margin:16px 0}
.stage{background:#1b1820;border-radius:8px;padding:8px}
canvas{display:block;width:100%;image-rendering:pixelated;background:#2b2731;border-radius:6px}
.stage canvas{max-width:460px;margin:auto}
.ctl{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0}
button{font:600 15px Inter,sans-serif;min-height:44px;padding:0 16px;border-radius:8px;border:1px solid var(--line);background:#2f2a37;color:var(--ink)}
button[aria-pressed=true]{background:var(--ink);color:#16141a}
button:focus-visible,.nav a:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.strip{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:12px 0 4px}
.strip figure{margin:0;flex:none;width:132px;scroll-snap-align:start}.strip canvas{width:132px}
.strip figcaption{font-size:13px;color:var(--dim);line-height:1.35;margin-top:6px}.strip figcaption em{color:var(--ink);font-style:normal;font-weight:600}
.asks{border-left:3px solid var(--red)}ol{padding-left:20px;margin:0}li{margin:6px 0}
</style></head><body><div class="band">
<h1>Beetles, boar, wisps and cultists: draft 1</h1>
<p>An attack and a death for every mob in four families, all on one page so you can mark them in one go. Physical like the rats and wolves: each one hits you with its own body or the thing in its hand. Drawn from the sprites in the game today. Drafts only: nothing in the game has changed yet.</p>
<nav class="nav">""" + nav + """</nav>
<div class="panel asks"><h2>What I'd like from you</h2><ol>""" + ''.join('<li>' + a + '</li>' for a in ASKS) + """</ol></div>
""" + fam_html + """
</div>
<script>
{
const D=""" + json.dumps(D, separators=(',', ':')) + """,P=D.player;
const SETS=""" + json.dumps(sets) + """;
const esc=t=>t.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
function bounds(frs){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;frs.forEach(f=>f.px.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}));return{x0,y0,x1,y1}}
function paint(ctx,f,ox,oy,flip,w){f.px.forEach(([x,y,c])=>{ctx.fillStyle=f.pal[c]||'#f0f';ctx.fillRect(ox+(flip?w-1-x:x),oy+y,1,1)})}
const slow={},paused={};
SETS.forEach(([k,t,d,bite])=>{const el=document.querySelector('.panel[data-k="'+k+'"]');
  el.innerHTML='<h2>'+esc(t)+'</h2><p class="dim">'+esc(d)+'</p><div class="stage"><canvas></canvas></div><div class="ctl"><button data-s="1" aria-pressed="true">Real speed</button><button data-s="4" aria-pressed="false">Slow (4x)</button><button data-p aria-pressed="false">Pause</button></div><div class="strip"></div>';
  slow[k]=1;const frs=D[k],b=bounds(frs),cv=el.querySelector('canvas'),ctx=cv.getContext('2d');
  const W=b.x1-b.x0+(bite?26:12),H=Math.max(30,b.y1-b.y0+12),gy=H-3;cv.width=W;cv.height=H;cv.style.maxWidth=(W*6)+'px';
  const total=frs.reduce((a,f)=>a+f.ms,0);let t0=0,last=performance.now();
  function tick(now){const dt=Math.min(100,now-last);last=now;if(!paused[k])t0=(t0+dt/slow[k])%total;let acc=0,i=0;for(;i<frs.length;i++){acc+=frs[i].ms;if(t0<acc)break}
    ctx.fillStyle='#2b2731';ctx.fillRect(0,0,W,H);ctx.fillStyle='#332e3a';for(let x=0;x<W;x+=8)ctx.fillRect(x,gy-4,6,1);
    const ox=4-b.x0,oy=gy-b.y1;if(bite)paint(ctx,P,ox+b.x1-6,gy-17,true,15);
    paint(ctx,frs[Math.min(i,frs.length-1)],ox,oy,false,0);requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
  const st=el.querySelector('.strip'),w=b.x1-b.x0+3,h=b.y1-b.y0+3;
  st.innerHTML=frs.map((f,i)=>'<figure><canvas width="'+w+'" height="'+h+'"></canvas><figcaption><em>'+(i+1)+'.</em> '+esc(f.label)+'<br>'+f.ms+' ms</figcaption></figure>').join('');
  st.querySelectorAll('canvas').forEach((c,i)=>{const x=c.getContext('2d');x.fillStyle='#2b2731';x.fillRect(0,0,w,h);paint(x,frs[i],1-b.x0,1-b.y0,false,0);c.style.height=(132*h/w)+'px'});
  el.querySelector('.ctl').addEventListener('click',e=>{const bt=e.target.closest('button');if(!bt)return;
    if(bt.dataset.p!==undefined){paused[k]=!paused[k];bt.setAttribute('aria-pressed',paused[k]);bt.textContent=paused[k]?'Play':'Pause';return}
    slow[k]=+bt.dataset.s;el.querySelectorAll('[data-s]').forEach(x=>x.setAttribute('aria-pressed',x===bt))})});
}
</script></body></html>
"""
out = os.path.join(ROOT, 'art/drafts/family-anims-draft1.html')
open(out, 'w').write(page); print('wrote', out, len(page) // 1024, 'KB')

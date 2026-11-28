"""Review page for tools/gap_anims_draft.py: art/drafts/gap-anims-draft1.html. Run after the draft script."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'art/drafts/gap-anims-draft1.json')))

FAMILIES = [
 ('Wisps', "Dungeon 1. The great ash wisp gets the ash wisp's moves at its own size; the candle wisp never fights, so it only gets a death.", [
  ('gwisp_bite', 'Great ash wisp attack', 'Draws back and dims (the tell), leans in with a tongue of flame, flares white-hot on you.', 1),
  ('gwisp_death', 'Great ash wisp death', 'Gutters smaller and smaller, down to an ember, goes out in a thread of smoke.', 0),
  ('cwisp_death', 'Candle wisp death', "The ash wisp's death in candle colours (today it just vanishes).", 0)]),
 ('The hooded', 'Dungeon 1 and the chapel garden. Each fights with what it carries. Rigid things stay upright (your rule from the clapper).', [
  ('deacon_attack', 'Deacon attack', 'Lifts his lantern-staff straight up (the tell), then drives it straight down on you with a puff of dust.', 1),
  ('mender_attack', 'Mender attack', 'Pulls a hand back to the chest (the tell), then shoves you with an open palm. Its Mend cast stays as it is.', 1),
  ('summoner_attack', 'Cult summoner attack', 'Pulls his ember in, shoves it at you so it flares and spits sparks (like the ashcaller).', 1),
  ('summoner_death', 'Summoner death 1', 'Drops to his knees, slumps, face down; the ember goes out. One of three, picked at random like the cultists.', 0),
  ('summoner_death_2', 'Summoner death 2', 'Knocked back: eyes dim, thrown backwards, crumples as he slides away.', 0),
  ('summoner_death_3', 'Summoner death 3', 'Burns up: embers climb from the hem, he falls in as a heap of ash.', 0),
  ('acolyte_attack', 'Ashen Acolyte attack', 'Swings his censer up overhead (the tell), brings it round on its chain and smashes it into you.', 1),
  ('acolyte_death', 'Acolyte death 1', 'Drops to his knees, slumps, face down; the censer drops beside him.', 0),
  ('acolyte_death_2', 'Acolyte death 2', 'Knocked back and crumpling away.', 0),
  ('acolyte_death_3', 'Acolyte death 3', 'Burns up into a heap of ash.', 0)]),
 ('Old Gnawbone', 'His move today: at 2/3 and 1/3 health he squeals and two rats burrow out of the nearest wall holes, shown only as text and a burst. This draft gives that move a body. Same timing, same rats.', [
  ('gnaw_screech', 'The screech', 'Rears up on his back legs, jaws wide on the big teeth, and screeches, shaking, sound lines pulsing from his jaws. The tell that rats are coming.', 0),
  ('gnaw_hole', 'The rats come out of the walls', 'At the nearest wall hole: the dirt cracks, sprays out, a tunnel rat pokes its snout out of the dark, scrabbles out onto the floor and runs at you.', 0)])]

ASKS = ['Mark each one <b>keep / change / skip</b>, like before.',
        '<b>Old Gnawbone, which way?</b> <b>A (drawn here, my pick):</b> keep his move and give it a body: the screech and the rats clawing out of the walls. Looks only, nothing gets harder. <b>B:</b> also give him a new move: he whips the bone in his tail round in a circle (a ring on the ground, step out). <b>C:</b> he burrows into the den floor, a mound of dirt chases you, and he bursts up under you (dodge it). B and C are new mechanics, so the Balance lane would tune them.',
        'Rats coming out of the walls: should the hole crumble a little bigger each time, so the den looks dug-up by the end of the fight?']

esc = lambda t: t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
sets = [[k, t, d, b] for _, _, items in FAMILIES for k, t, d, b in items]
fam_html = ''.join('<section class="fam" id="f' + str(i) + '"><h2 class="famh">' + esc(n) + '</h2><p class="dim">' + esc(s) + '</p>' +
                   ''.join('<div class="panel" data-k="' + k + '"></div>' for k, _, _, _ in items) + '</section>' for i, (n, s, items) in enumerate(FAMILIES))
nav = ''.join('<a href="#f' + str(i) + '">' + esc(n) + '</a>' for i, (n, _, _) in enumerate(FAMILIES))

page = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gap animations draft 1</title>
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
<h1>Filling the gaps, and Old Gnawbone: draft 1</h1>
<p>Every mob that still lunges with a generic swing or just sinks into the floor gets its own attack or death, plus a body for Old Gnawbone&#39;s squeal. Drawn from today&#39;s sprites, real speed. Drafts only: nothing in the game has changed yet.</p>
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
out = os.path.join(ROOT, 'art/drafts/gap-anims-draft1.html')
open(out, 'w').write(page); print('wrote', out, len(page) // 1024, 'KB')

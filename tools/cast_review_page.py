"""Builds the review page for tools/cast_poses_draft.py: art/drafts/cast-poses-draft1.html (every caster, each cast
playing at real speed with the cast bar filling over its head, frames laid out underneath). Run after the draft script."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'art/drafts/cast-poses-draft1.json')))

FAMILIES = [
 ('Chapel grounds', 'The fen cult camps outside the Ruined Chapel. Today every caster here stands still in its normal pose while the purple bar fills.', [
  ('ashcaller_cast', 'Ashcaller: Ash Bolt (1 s)', 'Lifts his ember over his head, it swells orange as the bar fills, sparks drawn in; at the top he hurls it forward and the bolt flies.', 1),
  ('chanter_chant', 'Chanter: chant (instant)', 'No bar, so a short sway: the censer swings out and back twice and purple motes rise off it while his camp starts hitting harder.', 0),
  ('acolyte_cast', 'Ashen Acolyte: Shadow Bolt (2 s)', 'Lifts the censer high on its chain, its embers turn purple and a shadow orb gathers above it; he flings it at you.', 1),
  ('acolyte_brand', 'Ashen Acolyte: Ember Brand (instant)', 'Tips the censer down at you and embers spill toward the ground, just as the ring flares under your feet.', 1)]),
 ('Dungeon 1', 'Brother Malrec\'s monastery.', [
  ('mender_cast', 'Mender: Mend (1.5 s)', 'Both hands up, green light gathers between them; at the top the hands open and the light bursts out as the hurt ally heals.', 0),
  ('summoner_cast', 'Cult summoner: Cinder Lash (1.2 s)', 'Raises his hand and flame curls round it, growing a tail; at the top he lashes a whip of fire out at you.', 1),
  ('gwisp_flare', 'Great ash wisp: flare (instant)', 'Swells white-hot with its side flames fanning out, and pulses while its ring of fire spreads below (the bar here stands for the ring).', 0)]),
 ('Bosses', 'The Skeleton King already lifts his bone while his bar fills, so he isn\'t here.', [
  ('malrec_cast', 'Brother Malrec: Ash Bolt (2 s)', 'Lifts his staff, the flame in its cage swells and spills out into a ball of fire; he tips the staff at you and the bolt flies.', 1),
  ('malrec_heal', 'Brother Malrec: Rite of Mending (2 s)', 'Staff planted, he stills; his gold trim warms and burns bright while gold motes rise round his hem, then a flash of gold runs along the floor.', 0),
  ('prior_grasp', 'Drowned Prior: Grasp of the Deep (2 s)', 'Lifts his dead lantern high; it glows sea-green and drips; at the top he swings it down and the flood water splashes up as the hands rise.', 0),
  ('bellringer_toll', 'Bellringer: Toll (1.5 s)', 'Heaves the clapper up a little higher each beat, shaking with the strain (that is your cue to step back), then slams it into the floor: dust and the toll ringing out.', 1)])]

ASKS = ['Mark each one <b>keep / change / skip</b>, in your own words like before.',
        'Glow size: the light at the top of a cast grows to about 6 pixels across. Bigger, smaller, or right?',
        'Release flash: casters show a short star of light as the bolt leaves. Keep it, or let the bolt itself be the only light?',
        'The great ash wisp and the chanter have no cast bar (their moves are instant). Are short poses like these right for them?',
        'In the game the cast bar stays as it is; the poses just play under it. Same timing, nothing gets easier or harder.']

esc = lambda t: t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
sets = [[k, t, d, b] for _, _, items in FAMILIES for k, t, d, b in items]
fam_html = ''.join('<section class="fam" id="f' + str(i) + '"><h2 class="famh">' + esc(n) + '</h2><p class="dim">' + esc(s) + '</p>' +
                   ''.join('<div class="panel" data-k="' + k + '"></div>' for k, _, _, _ in items) + '</section>' for i, (n, s, items) in enumerate(FAMILIES))
nav = ''.join('<a href="#f' + str(i) + '">' + esc(n) + '</a>' for i, (n, _, _) in enumerate(FAMILIES))

page = """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mob cast poses draft 1</title>
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
<h1>Mob cast poses: draft 1</h1>
<p>Every enemy that casts, on one page so you can mark them all in one go. Each one holds a pose for the whole cast, light in the spell\'s colour builds as the bar fills, and there is a release frame when the spell goes off. Spells can glow; the Bellringer\'s Toll stays physical. Drawn from today\'s sprites, real speed, same timing as the game. Drafts only: nothing in the game has changed yet.</p>
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
  const W=b.x1-b.x0+(bite?26:12),H=Math.max(30,b.y1-b.y0+16),gy=H-3;cv.width=W;cv.height=H;cv.style.maxWidth=(W*6)+'px';
  const total=frs.reduce((a,f)=>a+f.ms,0);let t0=0,last=performance.now();
  function tick(now){const dt=Math.min(100,now-last);last=now;if(!paused[k])t0=(t0+dt/slow[k])%total;let acc=0,i=0;for(;i<frs.length;i++){acc+=frs[i].ms;if(t0<acc)break}
    ctx.fillStyle='#2b2731';ctx.fillRect(0,0,W,H);ctx.fillStyle='#332e3a';for(let x=0;x<W;x+=8)ctx.fillRect(x,gy-4,6,1);
    const ox=4-b.x0,oy=gy-b.y1;if(bite)paint(ctx,P,ox+b.x1-6,gy-17,true,15);
    const fi=Math.min(i,frs.length-1);paint(ctx,frs[fi],ox,oy,false,0);
    if(frs[fi].cast){let ct=0,cd=0,a2=0;frs.forEach((f,j)=>{if(f.cast){if(j<fi)cd+=f.ms;ct+=f.ms}});const into=t0-(acc-frs[fi].ms);const p=Math.min(1,(cd+into)/ct);
      const bw=20,bx=Math.round(ox+(b.x0+b.x1)/2-bw/2),by=2;ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,4);ctx.fillStyle='#2a2033';ctx.fillRect(bx,by,bw,2);
      ctx.fillStyle=Math.floor(now/125)%2?'#d8b8ff':'#b48cff';ctx.fillRect(bx,by,Math.round(bw*p),2)}
    requestAnimationFrame(tick)}
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
out = os.path.join(ROOT, 'art/drafts/cast-poses-draft1.html')
open(out, 'w').write(page); print('wrote', out, len(page) // 1024, 'KB')

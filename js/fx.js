// Floating numbers, sparks, the chat log, and small helpers (distance, con colours, movement).
'use strict';
/* ---------- Effects, text, log ---------- */
const floats=[],parts=[],beams=[],pillars=[]; // pillars: loot light columns (v0.97)
let rangeShow=0,rangeR=80;
// Floating text, option A (owner, Nov 18; v0.33): spread out and hold. kind: 'hit' = your own hits (big, white);
// 'small' = DoT ticks, pet and NPC hits; numbers otherwise medium. Words (Zz, MARKED, RESIST...) sit still over the head.
// Each new number near a recent one is nudged sideways so they never stack; text stays solid most of the way, then fades.
const FLOAT={big:{px:15,life:1.6,rise:10},hit:{px:13,life:1.1,rise:16},num:{px:11,life:1.1,rise:14},small:{px:9,life:0.9,rise:10},word:{px:10,life:1.3,rise:0}};
const NUDGE=[[0,0],[16,-4],[-16,-4],[8,-12],[-8,-12],[24,-10],[-24,-10],[0,-20]]; // spots around the first number: sideways first, then a row up
function floatText(x,y,txt,col,big,kind){
  kind=big?'big':kind||(/^[+-]?\d/.test(txt)?'num':'word');
  let dx=0,dy=0;
  if(kind==='word'||kind==='big'){dy=-14;let hit=true;while(hit){hit=floats.some(f=>(f.kind==='word'||f.kind==='big')&&f.t<0.8&&Math.abs(f.x0-x)<10&&Math.abs(f.y-(y+dy))<9);if(hit)dy-=11}} // words stack upward instead of on top of each other
  else{const n=floats.filter(f=>f.kind!=='word'&&f.kind!=='big'&&f.t<0.6&&Math.abs(f.x0-x)<10&&Math.abs(f.y0-y)<12).length;[dx,dy]=NUDGE[n%NUDGE.length]}
  floats.push({x0:x,y0:y,x:x+dx,y:y+dy,txt:txt,col:col,t:0,big:!!big,kind:kind,life:FLOAT[kind].life})}
function burst(x,y,col,n,up){for(let i=0;i<n;i++)parts.push({x:x+rr(-4,4),y:y+rr(-4,2),vx:rr(-12,12),vy:up?rr(-28,-12):rr(-18,8),t:0,life:rr(0.4,0.9),col:col})}
const logEl=$('log'),lines=[],logHist=[];
// Moments banner (v0.37): one small grey box under the cast bar. Shows ~2.5s; if two things happen at once they queue.
const banQ=[];let banT=null;
function banner(title,sub,col){if(logMute)return;banQ.push({title:title,sub:sub||'',col:col||'#ffd27a'});if(!banT)banNext()}
function banNext(){const b=banQ.shift(),el=$('banner');if(!b){el.style.display='none';banT=null;return}
  $('bantitle').textContent=b.title;$('bantitle').style.color=b.col;$('bansub').textContent=b.sub;el.style.display='block';
  banT=setTimeout(banNext,banQ.length?1800:2600)} // shorter when more are waiting
let logMute=false; // the sim runs thousands of fights; it mutes the chat box meanwhile
let logPanelOpen=false; // the Log panel (top right button) shows the full history; see ui.js
// kind: 'fight' = routine hits, misses and heals (the numbers already float over heads), kept in the Log panel only;
// 'loot' = copper, drops, selling; anything else = 'main'. v0.30.1 (owner): the chat box shows only lines that matter,
// 4 at a time, all at full brightness like EverQuest.
function log(msg,col,kind){if(logMute)return;const l={msg:msg,col:col||'#d8d2c0',kind:kind||'main'};
  logHist.push(l);if(logHist.length>150)logHist.shift();
  if(logPanelOpen)logPanelAdd(l);
  if(l.kind==='fight')return;
  const last=lines[lines.length-1];
  if(last&&last.msg===l.msg)last.n=(last.n||1)+1; // the same line again shows as one line with ×2, ×3 (no "Out of range" wall)
  else{lines.push({msg:l.msg,col:l.col});if(lines.length>4)lines.shift();}
  logEl.innerHTML=lines.map(l=>'<div style="color:'+l.col+'">'+l.msg+(l.n>1?' <span style="color:#9aa">×'+l.n+'</span>':'')+'</div>').join('');
  // Long lines wrap; drop whole old lines from the top rather than showing half a line.
  // (Lines overflow upward here, which scrollHeight doesn't count, so measure the first line's top instead.)
  while(logEl.childElementCount>1&&logEl.firstChild.getBoundingClientRect().top<logEl.getBoundingClientRect().top-1)logEl.firstChild.remove();}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ---------- Helpers ---------- */
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function con(lv){const d=lv-player.lvl;return d<=-2?'#5fbf5f':d===-1?'#5fa8ff':d===0?'#f2f2f2':d===1?'#ffd23f':'#ff4d4d'}
// Screen shake (v0.79, the Toll): looks only (Math.random in render), never touches a game roll.
let shakeT=0,shakeA=0;function shake(a,d){if(logMute)return;if(shakeT<=0||a>shakeA)shakeA=a;shakeT=Math.max(shakeT,d)}
let slowArea=null; // the current area if it has slow ground (set by enterZone), else null
const WADE=0.6;    // speed in flood water
// How deep someone stands in slow water, 0 (dry) to 1. Flood water fills its tiles; the crossroads creek has curved, drawn
// banks (v0.52), so wading there follows the drawn water, not the square tile (v0.123, owner: you sank to your knees
// while still on the bank). Used for the slowdown here and the wading look in render.js.
function wadeDepth(x,y){const SA=slowArea;if(!SA)return 0;const tx=Math.floor(x/T),ty=Math.floor(y/T);
  if(tx<0||ty<0||tx>=SA.w||ty>=SA.h||!SA.slow[ty*SA.w+tx])return 0;
  if(SA.rows[ty][tx]!=='~'||!SA.wetV)return 1;const v=SA.wetV(x,y);return v>0.04?Math.min(1,(v-0.04)/0.22):0}
function moveToward(e,tx,ty,spd,dt){
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<0.5)return true;
  // Flood water (v0.63, Dungeon 1) slows anyone wading it, you, pets and mobs alike; floating things skim over it.
  const SA=slowArea;if(SA&&!(e.def&&e.def.float)){const sx=Math.floor(e.x/T),sy=Math.floor(e.y/T);if(sx>=0&&sy>=0&&sx<SA.w&&sy<SA.h&&SA.slow[sy*SA.w+sx]&&wadeDepth(e.x,e.y)>0)spd*=WADE*(e===player?((wornTrick('wade')||{}).wade||1):1)} /* the Drowned Prior's Cowl wades faster */
  const step=Math.min(d,spd*dt),vx=dx/d*step,vy=dy/d*step;
  // Feet, not a point (v0.64, owner: "you can walk through the water a bit"): water you can't wade stops your whole feet,
  // a few pixels either side and in front, so half your body never hangs out over a pond. Only ever stops a move that
  // would newly touch water, so anyone already standing at the edge can always walk away.
  const wet=(x,y)=>tileAt(x-4,y)===2||tileAt(x+4,y)===2||tileAt(x,y-4)===2,was=wet(e.x,e.y);
  const bk=(x,y)=>blocked(x,y)||(!was&&wet(x,y));
  if(!bk(e.x+vx,e.y))e.x+=vx;else if(!bk(e.x+vx,e.y+(vy>=0?3:-3)))e.y+=(vy>=0?1:-1)*Math.abs(vx);
  if(!bk(e.x,e.y+vy))e.y+=vy;else if(!bk(e.x+(vx>=0?3:-3),e.y+vy))e.x+=(vx>=0?1:-1)*Math.abs(vy);
  e.x=Math.max(4,Math.min(WW-4,e.x));e.y=Math.max(8,Math.min(WH-2,e.y));
  if(Math.abs(vx)>step*0.4)e.dir=vx>0?1:-1; // only turn when clearly moving sideways, so walking up/down doesn't flip the sprite back and forth
  e.walk+=dt;
  return d<=step+0.01;
}
const inCombat=()=>mobs.some(m=>!m.dead&&m.state==='chase'&&!(remote&&mobOnAlly(m))); // multiplayer: a monster on your partner isn't your fight
function nearestMob(maxD){let best=null,bd=maxD;mobs.forEach(m=>{if(m.dead)return;const d=dist(m,player);if(d<bd){bd=d;best=m}});return best}

// Floating numbers, sparks, the chat log, and small helpers (distance, con colours, movement).
'use strict';
/* ---------- Effects, text, log ---------- */
const floats=[],parts=[],beams=[];
let rangeShow=0,rangeR=80;
function floatText(x,y,txt,col,big){floats.push({x:x,y:y,txt:txt,col:col,t:0,big:!!big})}
function burst(x,y,col,n,up){for(let i=0;i<n;i++)parts.push({x:x+rr(-4,4),y:y+rr(-4,2),vx:rr(-12,12),vy:up?rr(-28,-12):rr(-18,8),t:0,life:rr(0.4,0.9),col:col})}
const logEl=$('log'),lines=[],logHist=[];
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
function moveToward(e,tx,ty,spd,dt){
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<0.5)return true;
  const step=Math.min(d,spd*dt),vx=dx/d*step,vy=dy/d*step;
  if(!blocked(e.x+vx,e.y))e.x+=vx;else if(!blocked(e.x+vx,e.y+(vy>=0?3:-3)))e.y+=(vy>=0?1:-1)*Math.abs(vx);
  if(!blocked(e.x,e.y+vy))e.y+=vy;else if(!blocked(e.x+(vx>=0?3:-3),e.y+vy))e.x+=(vx>=0?1:-1)*Math.abs(vy);
  e.x=Math.max(4,Math.min(WW-4,e.x));e.y=Math.max(8,Math.min(WH-2,e.y));
  if(Math.abs(vx)>step*0.4)e.dir=vx>0?1:-1; // only turn when clearly moving sideways, so walking up/down doesn't flip the sprite back and forth
  e.walk+=dt;
  return d<=step+0.01;
}
const inCombat=()=>mobs.some(m=>!m.dead&&m.state==='chase');
function nearestMob(maxD){let best=null,bd=maxD;mobs.forEach(m=>{if(m.dead)return;const d=dist(m,player);if(d<bd){bd=d;best=m}});return best}

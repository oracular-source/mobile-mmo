// Crash reports (v0.73, owner, Nov 22: "in-game logs so if I get a crash I can send it to you"). Catches errors, keeps the game going, saves a report you can copy.
'use strict';
// Before this, one error inside the game loop stopped the loop for good: the screen froze (or went black if it broke halfway
// through drawing). Now main.js runs each frame inside crashGuard, so an error is caught, written into a report, and the next
// frame still runs. The report is what Claude needs to find the bug: the error and where in the code it happened, what you
// were doing (class, level, area, target, pet, nearby mobs and what they were casting) and the last 60 lines of the Log.
// The last 3 reports are kept in storage (so they survive a reload) and can be copied any time from Menu → Settings → Game.
const CRASH_KEY='ashfen-crash',CRASH_KEEP=3;
let crashSeen={};     // one report per distinct error per session: an error that repeats every frame would otherwise flood storage
let crashCount=0;     // errors this session, including repeats
function crashSnapshot(){const s={};
  // Each piece on its own try: the game may be half broken while this runs, and the report must still come out.
  const t=(k,f)=>{try{s[k]=f()}catch(e){s[k]='(unavailable: '+e.message+')'}};
  t('version',()=>(document.querySelector('#intro .hint')||{}).textContent);
  t('when',()=>new Date().toString());
  t('device',()=>navigator.userAgent+' · screen '+innerWidth+'x'+innerHeight+' @'+devicePixelRatio);
  t('class',()=>C.name+' Lv '+player.lvl);
  t('area',()=>{const A=curArea();return (A&&A.id)||zone});
  t('player',()=>({x:Math.round(player.x),y:Math.round(player.y),hp:Math.round(player.hp),mana:Math.round(player.mp||0),dead:player.dead>0,
    stunned:player.stunT>0,casting:player.cast&&(player.cast.id||player.cast.name),target:player.target&&(player.target.def.name+(player.target.dead?' (dead)':''))}));
  t('pets',()=>[pet,pet2].filter(Boolean).map(p=>({name:p.name||p.type,hp:Math.round(p.hp),target:p.target&&p.target.def&&p.target.def.name})));
  t('forks',()=>JSON.stringify(forkPick));
  t('mobsNear',()=>mobs.filter(m=>!m.dead&&Math.hypot(m.x-player.x,m.y-player.y)<200).slice(0,12).map(m=>m.def.name+' Lv'+m.lv+' '+Math.round(m.hp/m.maxhp*100)+'% '+m.state+(m.casting?' casting '+m.casting.name:'')));
  t('settings',()=>JSON.stringify(settings));
  t('log',()=>logHist.slice(-60).map(l=>l.msg.replace(/<[^>]+>/g,'')));
  return s}
function crashText(r){const lines=['Ashfen Hollow crash report','Error: '+r.error,'Where: '+(r.stack||'(no stack)')];
  Object.keys(r.snap).forEach(k=>{const v=r.snap[k];if(k==='log')return;lines.push(k+': '+(typeof v==='string'?v:JSON.stringify(v)))});
  lines.push('Repeats this session: '+r.repeats,'--- last Log lines ---');(r.snap.log||[]).forEach(l=>lines.push(l));return lines.join('\n')}
function crashReport(err,where){crashCount++;
  const msg=(err&&err.message)||String(err),key=msg+'|'+where;
  if(crashSeen[key]){crashSeen[key].repeats++;crashSaveAll();return}
  const r={error:msg+(where?' (in '+where+')':''),stack:(err&&err.stack||'').split('\n').slice(0,8).join('\n'),snap:crashSnapshot(),repeats:1};
  crashSeen[key]=r;crashSaveAll();crashShow()}
function crashList(){return store.get(CRASH_KEY,[])}
// This session's reports first, then older ones, newest first, at most CRASH_KEEP.
function crashSaveAll(){const mine=Object.keys(crashSeen).map(k=>crashSeen[k]);const old=crashList().filter(o=>!mine.some(m=>m.snap.when===o.snap.when));
  store.set(CRASH_KEY,mine.reverse().concat(old).slice(0,CRASH_KEEP))}
// Run one piece of the frame; if it throws, report it and carry on instead of stopping the loop.
function crashGuard(fn,where){try{fn()}catch(e){crashReport(e,where);try{cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;cx.globalCompositeOperation='source-over'}catch(_){}}}
// A small grey bar (never pauses the game, owner's rule): "Something went wrong" with Copy report and ✕.
function crashShow(){let el=document.getElementById('crashbar');
  if(!el){el=document.createElement('div');el.id='crashbar';
    el.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 92px);transform:translateX(-50%);z-index:60;background:#2a2a2e;border:1px solid #6b6b72;color:#e8e2d0;font:12px ui-monospace,Menlo,monospace;padding:8px 10px;display:flex;gap:8px;align-items:center;max-width:92vw';
    el.innerHTML='<span>Something went wrong. The game kept going.</span><button id="crashcopy" style="font:inherit;background:#3a3a40;color:#ffe9a8;border:1px solid #8a8a92;padding:4px 8px">Copy report</button><button id="crashx" style="font:inherit;background:#3a3a40;color:#e8e2d0;border:1px solid #8a8a92;padding:4px 8px">✕</button>';
    document.body.appendChild(el);
    el.querySelector('#crashcopy').addEventListener('click',()=>crashCopy());el.querySelector('#crashx').addEventListener('click',()=>{el.style.display='none'})}
  el.style.display='flex'}
// Copy every saved report as plain text. Phones: the share sheet if there is one (easy to paste into a chat), else the clipboard,
// else a box with the text selected so it can be copied by hand.
function crashCopy(){const list=crashList();const txt=list.length?list.map(crashText).join('\n\n========\n\n'):'No crash reports saved.';
  const done=()=>{try{floatText(player.x,player.y-26,'Report copied','#7dffa6')}catch(e){}};
  if(navigator.share&&/Mobi|Android|iPhone|iPad/.test(navigator.userAgent)){navigator.share({title:'Ashfen Hollow crash report',text:txt}).catch(()=>crashBox(txt));return}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done,()=>crashBox(txt));return}
  crashBox(txt)}
function crashBox(txt){let b=document.getElementById('crashtxt');
  if(!b){b=document.createElement('textarea');b.id='crashtxt';b.readOnly=true;
    b.style.cssText='position:fixed;left:4vw;top:15vh;width:92vw;height:60vh;z-index:61;background:#1d1d21;color:#e8e2d0;border:1px solid #8a8a92;font:11px ui-monospace,Menlo,monospace';
    b.addEventListener('blur',()=>b.remove());document.body.appendChild(b)}
  b.value=txt;b.focus();b.select()}
// Errors outside the loop (a button handler, a script that failed to load) are caught here too.
window.addEventListener('error',e=>crashReport(e.error||e.message,e.filename?e.filename.replace(/^.*\//,'')+':'+e.lineno:'page'));
window.addEventListener('unhandledrejection',e=>crashReport(e.reason,'promise'));

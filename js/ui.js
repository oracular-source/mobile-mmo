// On-screen controls and menus: spell pad, side slots, arrange mode, spellbook, settings, character screen.
'use strict';
/* ---------- Input: spell grid and spell pad ---------- */
// Pad: tap the center for slot 1, or flick toward one of the five ring spells (or tap it).
// Ring order is clockwise from straight up, 72 degrees apart.
const SLOT_LABELS={pad:['Tap center','Flick up','Flick up-right','Flick down-right','Flick down-left','Flick up-left','Side bar top','Side bar bottom'],grid:['Top row left (main)','Top row right','Row 2 left','Row 2 right','Row 3 left','Row 3 right','Bottom row left','Bottom row right']};
// Grid button sizes (v0.29.1: owner found the v0.28 size, now Large, too big). Width, height, gap, font size.
const GRID_PX={S:[44,36,5,9],M:[50,41,5,10],L:[58,48,6,11]};
const PAD_PX={S:136,M:160,L:188}, FLICK_PX={short:22,normal:32,long:46};
let gest=null, arranging=false, arrSel=null, arrDrag=null;
const ctrl=$('controls'),ghost=$('ghost');
const slotOf=el=>el.dataset.slot==='c'?0:+el.dataset.slot;
function slotHTML(i,showMana){
  const a=ABI[loadout[i]];
  if(!a)return '<span style="color:#5a5363">empty</span>';
  return '<span class="ic" style="background:'+a.col+'"></span><span>'+a.short+'</span>'+(showMana&&a.mana?'<small class="nm">'+a.mana+'</small>':'')+'<span class="cd"></span><span class="cdt"></span>';
}
let ctrlEls=[];
function buildControls(){
  ctrl.innerHTML='';
  ctrl.classList.toggle('arrange',arranging);
  const side=settings.left?'left':'right';
  logEl.style.left=settings.left?'auto':'6px';logEl.style.right=settings.left?'6px':'auto';
  if(settings.scheme==='grid'){
    // EverQuest-style grid (v0.28): all 8 spells in one 2 x 4 block of square buttons, all the same size, in the thumb corner.
    // v0.29.1 (owner): read like a page, slot 1 (main, what Auto keeps casting) top left, then left to right, top to bottom.
    // The thumb rests a little high on the grid, so the first spells go on top. Arrange still moves anything anywhere.
    // Above it: Back and Next target, which cycle through nearby enemies in opposite directions.
    const [W,H,G,FS]=GRID_PX[settings.gridSize]||GRID_PX.M,M=10;
    for(let i=0;i<8;i++){
      const row=Math.floor(i/2), onLeft=i%2===0; // row 0 = top
      const fromEdge=(side==='right')===onLeft?1:0; // distance in columns from the screen edge the grid hugs
      const b=document.createElement('div');b.className='gb'+(i===0?' main':'');b.dataset.slot=i;
      b.style.cssText='width:'+W+'px;height:'+H+'px;font-size:'+FS+'px;bottom:'+(M+(3-row)*(H+G))+'px;'+side+':'+(M+fromEdge*(W+G))+'px';
      b.innerHTML=slotHTML(i,true);
      b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;castSlot(i);flash(b)});
      ctrl.appendChild(b);
    }
    const tb=M+4*(H+G),tw=W,th=Math.round(H*0.72);
    [['tgtback','◀ Back',backTarget,settings.left?0:W+G],['nexttgt','Next ▶',nextTarget,settings.left?W+G:0]] /* Back always on the left, Next on the right */.forEach(([id,label,fn,off])=>{
      const t=document.createElement('button');t.id=id;t.className='gtb';t.textContent=label;
      t.style.cssText='bottom:'+tb+'px;'+side+':'+(M+off)+'px;width:'+tw+'px;height:'+th+'px';
      t.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;fn();flash(t)});
      ctrl.appendChild(t);
    });
    autoPill(side,0,true);
    sideBar(settings.left?'right':'left',true); // only Sit on the far side: room for pet controls later
    ctrlEls=Array.from(ctrl.querySelectorAll('[data-slot]'));return;
  }else if(settings.scheme==='pad'){
    const P=PAD_PX[settings.padSize]||160,ic=Math.round(P*0.27),cc=Math.round(P*0.34),R=P/2-ic/2-3;
    const pad=document.createElement('div');pad.id='pad';
    pad.style.cssText='width:'+P+'px;height:'+P+'px;bottom:12px;'+side+':12px';
    for(let i=1;i<6;i++){
      const ang=(i-1)*72*Math.PI/180, x=P/2+Math.sin(ang)*R-ic/2, y=P/2-Math.cos(ang)*R-ic/2;
      const d=document.createElement('div');d.className='pi';d.dataset.slot=i;
      d.style.cssText='width:'+ic+'px;height:'+ic+'px;left:'+x+'px;top:'+y+'px';d.innerHTML=slotHTML(i,false);pad.appendChild(d);
    }
    const c=document.createElement('div');c.id='padc';c.dataset.slot='c';
    c.style.cssText='width:'+cc+'px;height:'+cc+'px;left:'+(P-cc)/2+'px;top:'+(P-cc)/2+'px';
    c.innerHTML=slotHTML(0,false);
    pad.appendChild(c);
    pad.addEventListener('pointerdown',padDown);
    pad.addEventListener('pointermove',padMove);
    pad.addEventListener('pointerup',padUp);pad.addEventListener('pointercancel',()=>{gest=null});
    ctrl.appendChild(pad);
    autoPill(side,P+20);
  }
  // The Classic fan layout was removed in v0.29.1 (owner); it's in git history (v0.28.1, js/ui.js) if we ever want it back.
  sideBar(settings.left?'right':'left');
  ctrlEls=Array.from(ctrl.querySelectorAll('[data-slot]'));
}
// Side column, on the other edge from the spells (left for right-handed players), stacked right
// above the chat box: slot 7, slot 8, then Sit. Shown in both joystick and tap-to-move.
// Kept to 2 spells so the screen never shows more than 8 ability buttons (a design rule).
// Sit lives here (not in a menu) because Necros sit a lot while the pet and DoTs do the work.
function sideBar(side,sitOnly){
  const sz=48,gap=8,base=8+96+8+44; // chat box bottom + height + gap, lifted 44px (v0.27.1 play-test: was too low)
  // v0.30.2 (owner): Sit is a square in the same plain grey style as the spell grid, so both sides match, but smaller
  // (about 80% of a spell button) since the left side has less on it. Pet buttons will use this size later.
  const g=GRID_PX[settings.gridSize]||GRID_PX.M,W=Math.round(g[0]*0.8),H=Math.round(g[1]*0.8),FS=g[3]-1;
  const sit=document.createElement('button');sit.id='bsit';sit.className='gb';
  sit.style.cssText='width:'+W+'px;height:'+H+'px;bottom:'+base+'px;'+side+':10px;font-size:'+FS+'px;padding:0';
  sit.textContent=player.sit?'Stand':'Sit';
  sit.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggleSit()});
  ctrl.appendChild(sit);
  if(sitOnly)return;
  [6,7].forEach((i,k)=>{
    const b=document.createElement('div');b.className='fb side'+(loadout[i]?'':' empty');b.dataset.slot=i;
    b.style.cssText='width:'+sz+'px;height:'+sz+'px;bottom:'+(base+(2-k)*(sz+gap))+'px;'+side+':8px';
    b.innerHTML=slotHTML(i,true);
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;castSlot(i);flash(b)});
    ctrl.appendChild(b);
  });
}
// Two quick toggles, top right under the target frame: "1st hit" = tapping an enemy casts your main attack once;
// "Auto" = it keeps casting. They're set between fights, so they live out of the thumb's way.
// Their old spot above the abilities now holds a Next target button, which IS needed mid-fight.
function autoPill(side,bottom,noNext){
  // Top left, under your portrait: the two toggles. Top right, under the target: Menu.
  const pills=document.createElement('div');pills.id='toggles';ctrl.appendChild(pills);
  const mk=(key,label,msg,id)=>{const b=document.createElement('button');b.id=id;b.className='autopill'+(settings[key]?' active':'');
    b.textContent=label+' '+(settings[key]?'on':'off');
    b.style.cssText='height:26px;padding:0 10px;font-size:11px;border-radius:13px;background:rgba(20,18,26,.88)';
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();settings[key]=!settings[key];saveSettings();buildControls();log(msg+' '+(settings[key]?'on':'off')+'.','#9aa')});
    pills.appendChild(b);};
  mk('tapCast','1st hit','Auto first attack','firstpill');
  mk('autoCast','Auto','Auto attack','autopill');
  // While arranging, Menu reads Done so there's always a way out.
  // Top right: Log, then Menu (v0.30.1). Log sits up here, away from both thumbs, because the chat box is joystick space.
  const tr=document.createElement('div');tr.id='topbtns';ctrl.appendChild(tr);
  const pill='height:26px;padding:0 12px;font-size:11px;border-radius:13px;background:rgba(20,18,26,.88)';
  const lg=document.createElement('button');lg.id='blog';lg.textContent='Log';if(logPanelOpen)lg.className='active';lg.style.cssText=pill;
  lg.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggleLogPanel()});
  tr.appendChild(lg);
  const m=document.createElement('button');m.id='bmenu';m.textContent=arranging?'Done':'Menu';if(arranging)m.className='active';
  m.style.cssText=pill;
  m.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)setArranging(false);else openModal('menuUI')});
  tr.appendChild(m);
  if(noNext)return;
  // Next target: thumb-reachable, just above the spells. (Tab on a keyboard does the same.)
  const t=document.createElement('button');t.id='nexttgt';t.textContent='Next ⟳';
  t.style.cssText='position:absolute;bottom:'+bottom+'px;'+side+':16px;height:34px;padding:0 12px;font-size:12px;border-radius:17px;background:rgba(20,18,26,.88);border-color:#7a6a3a';
  t.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;nextTarget();flash(t)});
  ctrl.appendChild(t);
}
function flash(el){if(!el)return;el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),160)}
function padDown(e){
  e.preventDefault();if(gest)return;
  try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
  const el=e.target.closest('[data-slot]');
  gest={id:e.pointerId,sx:e.clientX,sy:e.clientY,fired:false,moved:false,slot:el?slotOf(el):0};
}
function padMove(e){
  if(!gest||e.pointerId!==gest.id||gest.fired)return;
  const dx=e.clientX-gest.sx,dy=e.clientY-gest.sy,d=Math.hypot(dx,dy);
  if(d>12)gest.moved=true;
  if(d>=(FLICK_PX[settings.flick]||32)){
    gest.fired=true;
    // Pick the ring spell whose direction is closest to the flick (five 72-degree sectors).
    let deg=Math.atan2(dx,-dy)*180/Math.PI;if(deg<0)deg+=360;
    const slot=1+Math.round(deg/72)%5;
    castSlot(slot);flash(ctrl.querySelector('.pi[data-slot="'+slot+'"]'));
  }
}
function padUp(e){
  if(!gest||e.pointerId!==gest.id)return;
  if(!gest.fired&&!gest.moved){castSlot(gest.slot);flash(ctrl.querySelector('[data-slot="'+(gest.slot===0?'c':gest.slot)+'"]'))}
  gest=null;
}

/* ---------- Arrange mode: drag spells on the pad or buttons to swap them ---------- */
function swapSlots(a,b){if(a===b)return;if((a===0&&!loadout[b])||(b===0&&!loadout[a])){log('Your main slot needs a spell.','#ff6b6b');buildControls();return}const t=loadout[a];loadout[a]=loadout[b];loadout[b]=t;saveLoadout();buildControls();}
ctrl.addEventListener('pointerdown',e=>{
  if(!arranging||e.target.closest('button'))return; // buttons (Done, toggles, Next, Sit) still work while arranging
  e.stopPropagation();e.preventDefault();
  const el=e.target.closest('[data-slot]');if(!el)return;
  arrDrag={slot:slotOf(el),sx:e.clientX,sy:e.clientY,id:e.pointerId,moved:false};
},true);
window.addEventListener('pointermove',e=>{
  if(!arrDrag||e.pointerId!==arrDrag.id)return;
  if(!arrDrag.moved&&Math.hypot(e.clientX-arrDrag.sx,e.clientY-arrDrag.sy)>8){
    arrDrag.moved=true;const a=ABI[loadout[arrDrag.slot]];
    ghost.innerHTML=a?'<div class="pi" style="position:static;width:46px;height:46px"><span class="ic" style="background:'+a.col+'"></span><span>'+a.short+'</span></div>':'<div class="pi" style="position:static;width:46px;height:46px">empty</div>';ghost.style.display='block';
  }
  if(arrDrag.moved){const r=$('view').getBoundingClientRect();ghost.style.left=(e.clientX-r.left-23)+'px';ghost.style.top=(e.clientY-r.top-23)+'px'}
});
window.addEventListener('pointerup',e=>{
  if(!arrDrag||e.pointerId!==arrDrag.id)return;
  ghost.style.display='none';
  if(arrDrag.moved){
    const el=document.elementFromPoint(e.clientX,e.clientY),t=el&&el.closest('#controls [data-slot]');
    if(t)swapSlots(arrDrag.slot,slotOf(t));arrSel=null;
  }else if(arrSel===null){arrSel=arrDrag.slot;const el=ctrl.querySelector('[data-slot="'+(arrSel===0?'c':arrSel)+'"]');if(el)el.classList.add('sel')}
  else{swapSlots(arrSel,arrDrag.slot);arrSel=null}
  arrDrag=null;
});
function setArranging(on){
  arranging=on;arrSel=null;running=!on&&!document.querySelector('.modal.show');
  if(on)log('Arrange: drag a spell onto another to swap, or tap two spells. Tap Done when finished.','#ffd27a');
  buildControls();
}

/* ---------- Spellbook (drag and drop loadout) ---------- */
let selected=null,drag=null;
function chipHTML(a){const locked=player.lvl<a.lvl;return '<span class="ic" style="background:'+a.col+'"></span><span><b>'+a.name+'</b><small>'+a.tag+' · '+(a.mana?a.mana+' mana':'no cost')+' · '+(a.cast?a.cast+'s cast':'instant')+(a.cd?' · '+Math.round(cdFor(a))+'s cooldown':'')+(locked?' · Lv '+a.lvl:'')+'</small></span>'}
function renderBook(){
  const book=$('book'),slots=$('slots');
  book.innerHTML='';slots.innerHTML='';
  AB.forEach(a=>{const c=document.createElement('div');c.className='chip'+(player.lvl<a.lvl?' lock':'')+(selected===a.id?' sel':'');c.dataset.id=a.id;c.innerHTML=chipHTML(a);book.appendChild(c)});
  const labels=SLOT_LABELS[settings.scheme];
  loadout.forEach((id,i)=>{const s=document.createElement('div');s.className='slot';s.dataset.i=i;
    const a=ABI[id];s.innerHTML='<div class="lbl">'+labels[i]+'</div>'+(a?'<div class="chip'+(player.lvl<a.lvl?' lock':'')+'" data-id="'+id+'" data-from="'+i+'">'+chipHTML(a)+'</div>':'<div class="hint" style="margin:6px 0 0">Empty</div>');slots.appendChild(s)});
}
function assign(id,i){
  const j=loadout.indexOf(id);
  if(j===i)return;
  if(j===0&&!loadout[i]){log('Your main slot needs a spell.','#ff6b6b');return}
  if(j>=0)loadout[j]=loadout[i]; else {/* spell not loaded: replace */}
  loadout[i]=id;saveLoadout();buildControls();
}
$('spellsUI').addEventListener('pointerdown',e=>{
  const chip=e.target.closest('.chip');
  if(chip){e.preventDefault();drag={id:chip.dataset.id,sx:e.clientX,sy:e.clientY,moved:false,pid:e.pointerId,el:chip};return}
  const slot=e.target.closest('.slot');
  if(slot&&selected){assign(selected,+slot.dataset.i);selected=null;renderBook()}
});
window.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>8){drag.moved=true;ghost.innerHTML='<div class="chip">'+chipHTML(ABI[drag.id])+'</div>';ghost.style.display='block'}
  if(drag.moved){const r=$('view').getBoundingClientRect();ghost.style.left=(e.clientX-r.left-60)+'px';ghost.style.top=(e.clientY-r.top-20)+'px';
    document.querySelectorAll('.slot').forEach(s=>s.classList.remove('over'));
    const el=document.elementFromPoint(e.clientX,e.clientY),s=el&&el.closest('.slot');if(s)s.classList.add('over')}
});
window.addEventListener('pointerup',e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  ghost.style.display='none';document.querySelectorAll('.slot').forEach(s=>s.classList.remove('over'));
  if(drag.moved){const el=document.elementFromPoint(e.clientX,e.clientY),s=el&&el.closest('.slot');if(s){assign(drag.id,+s.dataset.i);selected=null}}
  else{
    const inSlot=drag.el.closest('.slot');
    if(inSlot&&selected){assign(selected,+inSlot.dataset.i);selected=null}
    else selected=(selected===drag.id?null:drag.id);
  }
  drag=null;renderBook();
});

/* ---------- Settings ---------- */
function renderSettings(){
  const box=$('setbox');
  const seg=(label,key,opts)=>'<h2>'+label+'</h2><div class="seg">'+opts.map(o=>'<button data-k="'+key+'" data-v="'+o[0]+'" class="'+(String(settings[key])===String(o[0])?'active':'')+'">'+o[1]+'</button>').join('')+'</div>';
  box.innerHTML=
    '<button class="go" id="chgcls" style="margin:0 0 6px;background:#1c1922;border-color:#3a3343">Change class</button>'+
    seg('Controls','scheme',[['grid','Grid'],['pad','Spell pad']])+
    (settings.scheme==='grid'?seg('Grid size','gridSize',[['S','Small'],['M','Medium'],['L','Large']]):'')+
    seg('Hand','left',[['false','Right-handed'],['true','Left-handed']])+
    seg('Auto first attack (tap an enemy)','tapCast',[['true','Target + cast'],['false','Target only']])+
    seg('Auto attack (keep casting)','autoCast',[['true','On'],['false','Off']])+
    seg('Zoom (or pinch the screen)','zoom',[[160,'Near'],[999,'Far']])+
    seg('Minimap (tap it for the full map)','minimap',[['true','On'],['false','Off']])+
    seg('Movement','move',[['drag','Tap + drag stick'],['hold','Hold to move']])+
    (settings.move==='drag'?seg('Drag stick','showJoy',[['false','Hidden'],['true','Visible']]):'')+
    (settings.scheme==='pad'?
      seg('Pad size','padSize',[['S','Small'],['M','Medium'],['L','Large']])+
      seg('Flick distance','flick',[['short','Short'],['normal','Normal'],['long','Long']]):'')+
    // Prototype only: lets the home-screen app (which can't use ?dev) turn developer tools on.
    '<h2>Developer tools (prototype)</h2><div class="seg"><button id="devoff" class="'+(dev.on?'':'active')+'">Off</button><button id="devon" class="'+(dev.on?'active':'')+'">On</button></div>';
}
$('setbox').addEventListener('click',e=>{
  if(e.target.id==='devon'||e.target.id==='devoff'){const on=e.target.id==='devon';if(on!==dev.on){store.set('ashfen-dev',on);location.reload()}return}
  if(e.target.id==='chgcls'){$('settingsUI').classList.remove('show');$('intro').classList.add('show');running=false;return}
  const b=e.target.closest('button[data-k]');if(!b)return;
  let v=b.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;else if(/^\d+$/.test(v))v=+v;
  settings[b.dataset.k]=v;saveSettings();renderSettings();buildControls();if(b.dataset.k==='zoom')applyZoom();
});

/* ---------- Modals and utility buttons ---------- */
let running=false;
function openModal(id){if(arranging)setArranging(false);$(id).classList.add('show');running=false;if(id==='charUI')renderChar();if(id==='spellsUI')renderBook();if(id==='settingsUI')renderSettings()}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{$(b.dataset.close).classList.remove('show');running=!arranging;selected=null}));
const closeMenu=()=>$('menuUI').classList.remove('show');
$('bspells').addEventListener('click',()=>{closeMenu();openModal('spellsUI')});
$('barr').addEventListener('click',()=>{closeMenu();setArranging(true)});
$('bset').addEventListener('click',()=>{closeMenu();openModal('settingsUI')});

$('pframe').addEventListener('click',()=>{charTab='gear';openModal('charUI')});
let charTab='gear',bagSel=null;
const nearMerchant=()=>{const m=npcs.find(n=>n.kind==='peddler');return m&&dist(m,player)<52};
$('ctabs').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(!b)return;charTab=b.dataset.tab;bagSel=null;renderChar()});
function renderChar(){
  document.querySelectorAll('#ctabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===charTab));
  const L=player.lvl;let h='';
  if(charTab==='gear'){
    h+='<p class="hint">Level '+L+' '+C.name+' · HP '+maxHP(L)+(C.mana?' · Mana '+maxMP(L):'')+' · '+STAT_KEYS.map(k=>k[1]+' '+stat(k[0])).join(' · ')+' · '+inv.copper+' copper</p>';
    SLOTS.forEach(sl=>{const id=inv.equip[sl[0]],it=id&&ITEMS[id];
      h+='<div class="jrow" data-act="unequip" data-slot="'+sl[0]+'" style="cursor:pointer"><span class="q">'+sl[1]+'</span><span'+(it?' style="color:'+RAR[it.rar]+'"':' class="q"')+'>'+(it?it.name+' <small class="q">'+itemStats(it)+'</small>':'Empty')+'</span></div>'});
    h+='<p class="hint" style="margin-top:8px">Tap a worn item to take it off. Equip gear from your Bags.</p>';
  }else if(charTab==='bags'){
    const near=nearMerchant();
    h+='<p class="hint">'+inv.copper+' copper'+(near?' · Marrow is buying.':' · Stand near Marrow the Peddler to sell.')+'</p>';
    if(near)h+='<button data-act="selljunk" style="width:100%;height:34px;margin-bottom:8px">Sell all junk</button>';
    h+='<div class="bagg">';
    inv.bags.forEach((b,i)=>{const it=b&&ITEMS[b.id];h+='<div class="bc'+(bagSel===i?' sel':'')+'" data-act="pick" data-i="'+i+'">'+(it?'<span style="color:'+RAR[it.rar]+'">'+it.name+'</span>'+(b.n>1?'<small>×'+b.n+'</small>':''):'<small>·</small>')+'</div>'});
    h+='</div>';
    if(bagSel!==null&&inv.bags[bagSel]){
      const b=inv.bags[bagSel],it=ITEMS[b.id];
      h+='<div class="idet"><b style="color:'+RAR[it.rar]+'">'+it.name+'</b>'+(b.n>1?' ×'+b.n:'')+'<br><span class="q">'+(it.slot?SLOTS.find(x=>x[0]===it.slot)[1]+' · '+it.rar:'Junk')+' · sells for '+it.value*b.n+'c</span>';
      if(it.slot){h+='<br>'+(itemStats(it)||'No stats');const cur=inv.equip[it.slot]&&ITEMS[inv.equip[it.slot]];
        const diffs=STAT_KEYS.map(k=>{const d=(it[k[0]]||0)-(cur&&cur[k[0]]||0);return d?'<span class="'+(d>0?'up':'down')+'">'+k[1]+' '+(d>0?'+':'')+d+'</span>':''}).filter(Boolean);
        h+='<br><span class="q">vs '+(cur?cur.name:'nothing worn')+':</span> '+(diffs.join(' · ')||'<span class="q">same</span>');}
      h+='<div class="acts">'+(it.slot?'<button data-act="equip">Equip</button>':'')+(near?'<button data-act="sell">Sell</button>':'')+'<button data-act="destroy">Destroy</button></div></div>';
    }
  }else{
    const named=Object.keys(TYPES).filter(k=>TYPES[k].named).map(k=>TYPES[k]);
    h+='<h2>Named</h2>';
    named.forEach(t=>{const k=kills[t.name];h+='<div class="jrow"><span>'+t.name+' <small class="q">'+(t.zone||'')+'</small></span><span class="q">'+(k?'Slain ×'+k.count+' · first '+k.first:'Not yet slain')+'</span></div>'});
    h+='<h2>Creatures</h2>';
    const rest=Object.keys(kills).filter(n=>!kills[n].named).sort((a,b)=>kills[b].count-kills[a].count);
    if(!rest.length)h+='<div class="jrow"><span class="q">Nothing slain yet.</span></div>';
    rest.forEach(n=>{h+='<div class="jrow"><span>'+cap(n.replace(/^an? /,''))+'</span><span class="q">×'+kills[n].count+'</span></div>'});
  }
  $('cbox').innerHTML=h;
}
$('cbox').addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;const act=el.dataset.act;
  if(act==='pick'){const i=+el.dataset.i;bagSel=inv.bags[i]?(bagSel===i?null:i):null}
  else if(act==='unequip'){const sl=el.dataset.slot,id=inv.equip[sl];if(!id)return;const i=inv.bags.indexOf(null);if(i<0){log('Your bags are full.','#ff8a80');return}
    inv.bags[i]={id:id,n:1};delete inv.equip[sl];log('You remove the '+ITEMS[id].name+'.','#9aa')}
  else if(act==='equip'&&bagSel!==null){const b=inv.bags[bagSel],it=ITEMS[b.id],old=inv.equip[it.slot];
    inv.equip[it.slot]=b.id;inv.bags[bagSel]=old?{id:old,n:1}:null;log('You equip the '+it.name+'.',RAR[it.rar]);bagSel=old?bagSel:null}
  else if(act==='sell'&&bagSel!==null){const b=inv.bags[bagSel],it=ITEMS[b.id],c=it.value*b.n;inv.copper+=c;inv.bags[bagSel]=null;bagSel=null;log('Marrow pays you '+c+' copper for the '+it.name+(b.n>1?' ×'+b.n:'')+'.','#c9a227')}
  else if(act==='selljunk'){let c=0;inv.bags.forEach((b,i)=>{if(b&&ITEMS[b.id].rar==='junk'){c+=ITEMS[b.id].value*b.n;inv.bags[i]=null}},'loot');bagSel=null;
    log(c?'Marrow pays you '+c+' copper for your junk.':'You have no junk to sell.','#c9a227','loot');inv.copper+=c}
  else if(act==='destroy'&&bagSel!==null){log('You destroy the '+ITEMS[inv.bags[bagSel].id].name+'.','#9aa');inv.bags[bagSel]=null;bagSel=null}
  player.hp=Math.min(player.hp,maxHP(player.lvl));player.mp=Math.min(player.mp,maxMP(player.lvl));
  saveInv();renderChar();
});

function nextTarget(){
  const list=mobs.filter(m=>!m.dead&&dist(m,player)<130).sort((a,b)=>dist(a,player)-dist(b,player));
  if(!list.length){log('No targets nearby.','#9aa');return}
  const i=list.indexOf(player.target);switchTarget(list[(i+1)%list.length]);
}
// Back is Next in reverse (v0.29.1, owner): both walk the same nearest-first list, so you can step either way and never get lost.
function backTarget(){
  const list=mobs.filter(m=>!m.dead&&dist(m,player)<130).sort((a,b)=>dist(a,player)-dist(b,player));
  if(!list.length){log('No targets nearby.','#9aa');return}
  const i=list.indexOf(player.target);switchTarget(list[i<0?list.length-1:(i-1+list.length)%list.length]);
}
function switchTarget(m){if(!m||m===player.target)return;player.target=m}
function toggleSit(){if(player.dead)return;player.sit=!player.sit;if(player.sit){player.tx=null;player.cast=null;log('You sit down.','#9aa')}else log('You stand up.','#9aa')}

/* ---------- Log panel (v0.30.1) ----------
   The full chat history (last 150 lines) with All / Fight / Loot filters. It does NOT pause the game: you can keep
   moving with the joystick while you read. Opened and closed with the Log button (top right) or its X. */
let logFilter='all';
const logOk=l=>logFilter==='all'||l.kind===logFilter;
const logLine=l=>'<div style="color:'+l.col+'">'+l.msg+'</div>';
function renderLogPanel(){
  document.querySelectorAll('#logtabs button').forEach(b=>b.classList.toggle('active',b.dataset.f===logFilter));
  const box=$('loglist'),shown=logHist.filter(logOk);
  box.innerHTML=shown.length?shown.map(logLine).join(''):'<div style="color:#9aa">Nothing here yet.</div>';
  box.dataset.empty=shown.length?'0':'1';
  box.scrollTop=box.scrollHeight;
}
function logPanelAdd(l){
  if(!logOk(l))return;const box=$('loglist');
  const atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<24; // only follow new lines if you haven't scrolled up to read
  if(box.dataset.empty!=='0'){box.innerHTML='';box.dataset.empty='0'}
  box.insertAdjacentHTML('beforeend',logLine(l));
  while(box.childElementCount>150)box.firstChild.remove();
  if(atEnd)box.scrollTop=box.scrollHeight;
}
function toggleLogPanel(open){
  logPanelOpen=open===undefined?!logPanelOpen:open;
  $('logpanel').style.display=logPanelOpen?'flex':'none';
  const b=$('blog');if(b)b.classList.toggle('active',logPanelOpen);
  if(logPanelOpen)renderLogPanel();
}
$('logtabs').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-f]');if(!b)return;e.preventDefault();logFilter=b.dataset.f;renderLogPanel()});
$('logclose').addEventListener('pointerdown',e=>{e.preventDefault();toggleLogPanel(false)});

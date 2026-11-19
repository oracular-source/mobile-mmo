// On-screen controls and menus: spell pad, side slots, arrange mode, spellbook, settings, character screen.
'use strict';
/* ---------- Input: spell pad and classic buttons ---------- */
// Pad: tap the center for slot 1, or flick toward one of the five ring spells (or tap it).
// Ring order is clockwise from straight up, 72 degrees apart.
const SLOT_LABELS={pad:['Tap center','Flick up','Flick up-right','Flick down-right','Flick down-left','Flick up-left','Side bar top','Side bar bottom'],buttons:['Main button','Button 2','Button 3','Button 4','Button 5','Button 6','Side bar top','Side bar bottom']};
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
  if(settings.scheme==='pad'){
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
  }else{
    // Classic: main button in the corner, five more fanned in a quarter circle around it.
    const main=62,sm=50,R=132,cxp=12+main/2,cyp=12+main/2;
    for(let i=0;i<6;i++){
      const b=document.createElement('div');b.className='fb'+(i===0?' main':'');b.dataset.slot=i;
      let sz=i===0?main:sm,ox=cxp,oy=cyp;
      if(i>0){const a=(i-1)*(Math.PI/2)/4;ox=cxp+Math.cos(a)*R;oy=cyp+Math.sin(a)*R;}
      b.style.cssText='width:'+sz+'px;height:'+sz+'px;bottom:'+(oy-sz/2)+'px;'+side+':'+(ox-sz/2)+'px';
      b.innerHTML=slotHTML(i,true);
      b.addEventListener('pointerdown',e=>{e.preventDefault();castSlot(i);flash(b)});
      ctrl.appendChild(b);
    }
    autoPill(side,12+main+R+4);
  }
  sideBar(settings.left?'right':'left');
  ctrlEls=Array.from(ctrl.querySelectorAll('[data-slot]'));
}
// Side column, on the other edge from the spells (left for right-handed players), stacked right
// above the chat box: slot 7, slot 8, then Sit. Shown in both joystick and tap-to-move.
// Kept to 2 spells so the screen never shows more than 8 ability buttons (a design rule).
// Sit lives here (not in a menu) because Necros sit a lot while the pet and DoTs do the work.
function sideBar(side){
  const sz=48,gap=8,base=8+96+8+44; // chat box bottom + height + gap, lifted 44px (v0.27.1 play-test: was too low)
  const sit=document.createElement('button');sit.id='bsit';sit.className='fb';
  sit.style.cssText='width:'+sz+'px;height:'+sz+'px;bottom:'+base+'px;'+side+':8px;font-size:11px';
  sit.textContent=player.sit?'Stand':'Sit';
  sit.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();toggleSit()});
  ctrl.appendChild(sit);
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
function autoPill(side,bottom){
  // Top left, under your portrait: the two toggles. Top right, under the target: Menu.
  const pills=document.createElement('div');pills.id='toggles';ctrl.appendChild(pills);
  const mk=(key,label,msg,id)=>{const b=document.createElement('button');b.id=id;b.className='autopill'+(settings[key]?' active':'');
    b.textContent=label+' '+(settings[key]?'on':'off');
    b.style.cssText='height:26px;padding:0 10px;font-size:11px;border-radius:13px;background:rgba(20,18,26,.88)';
    b.addEventListener('click',()=>{settings[key]=!settings[key];saveSettings();buildControls();log(msg+' '+(settings[key]?'on':'off')+'.','#9aa')});
    pills.appendChild(b);};
  mk('tapCast','1st hit','Auto first attack','firstpill');
  mk('autoCast','Auto','Auto attack','autopill');
  // While arranging, Menu reads Done so there's always a way out.
  const m=document.createElement('button');m.id='bmenu';m.textContent=arranging?'Done':'Menu';if(arranging)m.className='active';
  m.style.cssText='position:absolute;top:calc(62px + env(safe-area-inset-top));right:6px;height:26px;padding:0 12px;font-size:11px;border-radius:13px;background:rgba(20,18,26,.88)';
  m.addEventListener('click',()=>{if(arranging)setArranging(false);else openModal('menuUI')});
  ctrl.appendChild(m);
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
    seg('Controls','scheme',[['pad','Spell pad'],['buttons','Classic buttons']])+
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
  else if(act==='selljunk'){let c=0;inv.bags.forEach((b,i)=>{if(b&&ITEMS[b.id].rar==='junk'){c+=ITEMS[b.id].value*b.n;inv.bags[i]=null}});bagSel=null;
    log(c?'Marrow pays you '+c+' copper for your junk.':'You have no junk to sell.','#c9a227');inv.copper+=c}
  else if(act==='destroy'&&bagSel!==null){log('You destroy the '+ITEMS[inv.bags[bagSel].id].name+'.','#9aa');inv.bags[bagSel]=null;bagSel=null}
  player.hp=Math.min(player.hp,maxHP(player.lvl));player.mp=Math.min(player.mp,maxMP(player.lvl));
  saveInv();renderChar();
});

function nextTarget(){
  const list=mobs.filter(m=>!m.dead&&dist(m,player)<130).sort((a,b)=>dist(a,player)-dist(b,player));
  if(!list.length){log('No targets nearby.','#9aa');return}
  const i=list.indexOf(player.target);player.target=list[(i+1)%list.length];
}
function toggleSit(){if(player.dead)return;player.sit=!player.sit;if(player.sit){player.tx=null;player.cast=null;log('You sit down.','#9aa')}else log('You stand up.','#9aa')}

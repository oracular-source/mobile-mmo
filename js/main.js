// Starts the game: the main loop, the start screen and class picker. Loaded last.
'use strict';
/* ---------- Loop ---------- */
let last=0,uiT=0;
function loop(ts){
  const dt=Math.min(0.05,(ts-last)/1000||0);last=ts;
  if(running&&!document.hidden&&!simState.busy){time+=dt;botTick();update(dt);} // the sim runs its own fixed steps
  render();uiT+=dt;if(uiT>0.1){ui();uiT=0}
  requestAnimationFrame(loop);
}
resize();buildControls();
// Test hook for automated checks: only when the page is opened with ?debug in the address.
if(location.search.indexOf('debug')>=0)window.__game={enterZone:enterZone,player:player,mobs:mobs,inv:inv,tileAt:tileAt,DOOR:DOOR,checkPortals:checkPortals,CLS:CLS,giveItem:giveItem,getPet:()=>pet,devAct:devAct,cast:cast,ABI:ABI,loadout:()=>loadout,runSim:runSim,simTable:simTable,simSummary:simSummary,seedRng:seedRng,zone:()=>zoneId,arenaMob:arenaMob,update:update,grounds:grounds,getDecoy:()=>decoy};
// Class pick: switching saves the choice and reloads, so each class keeps its own level, bags and loadout.
(function(){
  $('pcls').textContent=C.name+' ▸';$('ctitle').textContent=C.name;
  $('clspick').innerHTML=Object.keys(CLASSES).map(k=>{const pg=store.get(k==='druid'?'ashfen-druid':'ashfen-prog-'+k,null);return '<button data-cls="'+k+'" class="'+(k===CLS?'active':'')+'">'+CLASSES[k].name+(pg&&pg.v===2?'<br><small style="color:#9aa">Lv '+pg.lvl+'</small>':'')+'</button>'}).join('');
  $('clsdesc').textContent=C.desc;
  $('clspick').addEventListener('click',e=>{const b=e.target.closest('button[data-cls]');if(!b||b.dataset.cls===CLS)return;store.set('ashfen-class',b.dataset.cls);location.reload()});
  $('start').textContent='Play '+C.name;
  if(!C.mana)document.querySelector('.bar.mp').style.display='none';
})();
$('start').addEventListener('click',()=>{$('intro').classList.remove('show');running=true;log('Welcome to Ashfen Hollow, '+C.name+'.','#7dffa6');if(player.lvl>1)log('Progress restored: level '+player.lvl+'.','#9aa');if(/[?&]area=graveyard/.test(location.search))enterZone('gy')});
requestAnimationFrame(t=>{last=t;loop(t)});

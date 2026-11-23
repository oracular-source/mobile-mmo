// Starts the game: the main loop, the start screen and class picker. Loaded last.
'use strict';
/* ---------- Loop ---------- */
let last=0,uiT=0;
function loop(ts){
  const dt=Math.min(0.05,(ts-last)/1000||0);last=ts;
  // Each part runs inside crashGuard (js/crash.js): an error is reported and the next frame still comes (it used to freeze the game).
  requestAnimationFrame(loop);
  if(running&&!document.hidden&&!simState.busy){time+=dt;crashGuard(()=>{botTick();update(dt)},'update')} // the sim runs its own fixed steps
  crashGuard(render,'render');uiT+=dt;if(uiT>0.1){crashGuard(()=>{ui();pauseWatch()},'ui');uiT=0}
}
resize();buildControls();
// Test hook for automated checks: only when the page is opened with ?debug in the address.
if(location.search.indexOf('debug')>=0)window.__game={enterZone:enterZone,player:player,mobs:mobs,inv:inv,tileAt:tileAt,DOOR:DOOR,checkPortals:checkPortals,CLS:CLS,giveItem:giveItem,getPet:()=>pet,devAct:devAct,cast:cast,ABI:ABI,loadout:()=>loadout,runSim:runSim,runPace:runPace,simTable:simTable,simSummary:simSummary,seedRng:seedRng,zone:()=>zoneId,arenaMob:arenaMob,update:update,grounds:grounds,getDecoy:()=>decoy,runForkSim:runForkSim,forkTable:forkTable,getPet2:()=>pet2,forks:()=>forkPick,forkDue:forkDue,nearFire:nearFire,traps:traps};
// Start screen (v0.38, UI breakdown 11, owner picked A). Tapping a class only shows it; Play does the work.
// Switching class still saves the choice and reloads (each class keeps its own level, bags and loadout), and a
// one-time flag in sessionStorage starts the game straight after the reload so it doesn't take a second Play.
let pickCls=CLS,started=false;
function progOf(k){const pg=store.get(k==='druid'?'ashfen-druid':'ashfen-prog-'+k,null);return pg&&pg.v===2?pg:null}
function renderPick(){
  $('clspick').innerHTML=Object.keys(CLASSES).map(k=>{const c=CLASSES[k],pg=progOf(k);
    return '<button data-cls="'+k+'" class="'+(k===pickCls?'sel':'')+'"'+(c.name.length>10&&c.name.indexOf(' ')<0?' style="font-size:10px"':'')+'>'+c.name+'<small>'+(pg?'Lv '+pg.lvl:c.role)+'</small></button>'}).join('');
  const c=CLASSES[pickCls],pg=progOf(pickCls);
  $('clsname').textContent=c.name+(pg?' · Lv '+pg.lvl:'');$('clstag').textContent=c.role+' · Solo: '+c.solo;$('clsdesc').textContent=c.blurb||c.desc;
  const cv=$('clscv'),im=mkRags(pickCls)||IMG.druid,x=cv.getContext('2d');cv.width=im.w;cv.height=im.h;x.imageSmoothingEnabled=false;x.drawImage(im.c,0,0);
  $('start').textContent=started&&pickCls===CLS?'Back to game':'Play '+c.name;
}
function openIntro(){pickCls=CLS;$('introx').style.display=started?'':'none';renderPick();$('intro').classList.add('show');running=false}
function startGame(){$('intro').classList.remove('show');running=true;if(started)return; // Change class → same class just resumes where you were
  started=true;log('Welcome to Ashfen Hollow, '+C.name+'.','#7dffa6');if(player.lvl>1)log('Progress restored: level '+player.lvl+'.','#9aa');enterZone(ZONE_OF[(location.search.match(/[?&]area=(\w+)/)||[])[1]]||'cross')} // a waiting skill choice shows as a pulsing Menu (pauseWatch), never a window
(function(){
  $('pcls').textContent=C.name+' ▸';$('ctitle').textContent=C.name+' · Lv '+player.lvl;
  renderPick();
  $('clspick').addEventListener('click',e=>{const b=e.target.closest('button[data-cls]');if(!b)return;pickCls=b.dataset.cls;renderPick()});
  $('introx').addEventListener('click',()=>{$('intro').classList.remove('show');running=true});
  if(!C.mana)document.querySelector('.bar.mp').style.display='none';
})();
// The game starts at the crossroads (v0.28); ?area=graveyard, crypt, rat_tunnel or crossroads starts in that area.
$('start').addEventListener('click',()=>{
  if(pickCls!==CLS){store.set('ashfen-class',pickCls);try{sessionStorage.setItem('ashfen-go','1')}catch(e){}location.reload();return}
  startGame()});
// After a class switch reload, go straight in.
(function(){let go=false;try{go=sessionStorage.getItem('ashfen-go')==='1';sessionStorage.removeItem('ashfen-go')}catch(e){}if(go)startGame()})();
requestAnimationFrame(t=>{last=t;loop(t)});

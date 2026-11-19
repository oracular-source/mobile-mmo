// Developer panel (open the game with ?dev). Testing only.
'use strict';
/* ---------- Developer tools ---------- */
function devAct(a){
  const L=player.lvl;
  if(a==='lvlup'||a==='lvldn'){player.lvl=Math.max(1,Math.min(10,L+(a==='lvlup'?1:-1)));player.xp=0;player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);player.cds={};save();buildControls();log('Dev: level '+player.lvl+'.','#ff8a80')}
  else if(a==='heal'){player.hp=maxHP(L);player.mp=maxMP(L);if(pet)pet.hp=pet.maxhp;log('Dev: full health and mana.','#ff8a80')}
  else if(a==='cds'){player.cds={};player.gcd=0;log('Dev: cooldowns reset.','#ff8a80')}
  else if(a==='skin'){dev.skin=!dev.skin;log('Dev: default skin '+(dev.skin?'on':'off')+'.','#ff8a80')}
  else if(a==='old'){dev.old=!dev.old;log('Dev: old look '+(dev.old?'on':'off')+'.','#ff8a80')}
  else if(a==='god'){dev.god=!dev.god;log('Dev: god mode '+(dev.god?'on':'off')+'.','#ff8a80')}
  else if(a==='kill'){const t=player.target;if(t&&!t.dead)hitMob(t,t.hp+999,'direct','dev strike');else log('Dev: no target.','#ff8a80')}
  else if(a==='gear'){giveItem(pick(UNCOMMONS));saveInv()}
  else if(a==='rare'){giveItem(pick(RARES));saveInv()}
  else if(a==='boss'){giveItem(pick(BOSS1));saveInv()}
  else if(a==='copper'){inv.copper+=500;saveInv();log('Dev: +500 copper.','#ff8a80')}
  else if(a==='gate'){if(zoneId!=='over')enterZone('over');player.x=3.5*T;player.y=15*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='door'){if(zoneId!=='over')enterZone('over');player.x=DOOR.x;player.y=DOOR.y+26;player.onTile=tileAt(player.x,player.y);if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='dun'){enterZone('dun')}
  else if(a==='gy'){enterZone('gy');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='bossroom'){if(zoneId!=='dun')enterZone('dun');player.x=8*T+8;player.y=8*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='gnaw'){if(zoneId!=='over'){log('Dev: Old Gnawbone lives outside.','#ff8a80');return}const m=spawn({type:'gnaw',x:player.x+30,y:player.y,timer:0,mob:null,group:null,noRespawn:true});log('Dev: Old Gnawbone appears.','#ff8a80')}
  else if(a==='arena'){enterZone('arena')}
  else if(a.indexOf('sp-')===0){if(zoneId!=='arena')enterZone('arena');const f=SIM_FIGHTS.find(f=>f.id===a.slice(3));arenaSpawn(f,player.lvl);log('Dev: '+f.name+' at level '+(f.lv||player.lvl)+'.','#ff8a80')}
  else if(a==='clear'){if(zoneId==='arena'){mobs.length=0;spawns.length=0;log('Dev: arena cleared.','#ff8a80')}}
  else if(a==='watch'){simWatch.on=!simWatch.on;simWatch.st={mode:'A'};if(simWatch.on&&zoneId!=='arena')enterZone('arena');log('Dev: bot '+(simWatch.on?'plays your character (testing grounds only).':'off.'),'#ff8a80')}
  else if(a==='sim'){if(simState.busy||!BOTS[CLS])return;
    runSim({onProgress:(i,n)=>{const o=$('simout');if(o)o.textContent='Running fight set '+i+' of '+n+'…'}}).then(()=>{log('Dev: sim finished.','#ff8a80');renderDev()});renderDev();return}
  else if(a==='wipe'){if(!devAct.armed){devAct.armed=true;log('Dev: tap Wipe again to erase all saves for every class.','#ff8a80');renderDev();return}
    store.keys().filter(k=>k!=='ashfen-dev').forEach(k=>store.del(k));location.reload();return}
  devAct.armed=false;renderDev();
}
// Which DEV sections are open (Character open by default). Not saved; resets on reload.
const devOpen={char:true};
function renderDev(){
  const b=(a,t)=>'<button data-dev="'+a+'"'+((a==='god'&&dev.god)||(a==='skin'&&dev.skin)||(a==='old'&&dev.old)||(a==='watch'&&simWatch.on)?' class="active"':'')+'>'+t+'</button>';
  // Sections fold away (tap a heading) so the panel isn't one long wall of buttons. Which ones are open is kept between re-draws.
  const sec=(id,title,body)=>'<details data-sec="'+id+'"'+(devOpen[id]?' open':'')+'><summary>'+title+'</summary>'+body+'</details>';
  const g=(...btns)=>'<div class="dgrid">'+btns.join('')+'</div>';
  $('devbox').innerHTML=
    sec('char','Character',g(b('lvldn','Level −'),b('lvlup','Level +'),b('heal','Full heal'),b('cds','Reset cooldowns'),b('god','God mode'),b('kill','Kill target')))+
    sec('loot','Loot',g(b('gear','Uncommon'),b('rare','Rare'),b('boss','Boss 1 item'),b('copper','+500 copper')))+
    sec('tp','Teleport',g(b('gate','Gate'),b('door','Crypt door'),b('dun','Dungeon start'),b('bossroom','Boss room'),b('gy','New graveyard')))+
    sec('test','Testing grounds',g(b('arena','Go there'),b('clear','Clear mobs'),b('watch','Bot plays me'),b('sim',simState.busy?'Sim running…':'Run sim ('+C.name+')'))+
      '<p class="hint" style="margin:8px 0 4px">Spawn a test fight:</p>'+g(...SIM_FIGHTS.map(f=>b('sp-'+f.id,f.name.replace(' (armored)','').replace(' (lvl 7)',''))))+
      '<div id="simout" class="simout">'+(!BOTS[CLS]?'No playbook bot for '+C.name+' yet.':simState.last&&simState.last.cls===CLS?'<p><b>'+simSummary(simState.last)+'</b></p>'+simTable(simState.last,true):'Mobs spawn at your level. The sim fights each one '+SIM_SEEDS+' times at every level from 1 to 10, Boss 1 from level 6 (a few minutes).')+'</div>')+
    sec('look','Look and galleries',g(b('old','Old look'),b('skin','Default skin'))+'<p class="hint" style="margin:8px 0 0">Classes</p><div id="skingal" class="skingal"></div><p class="hint" style="margin:8px 0 0">Monsters</p><div id="mobgal" class="skingal"></div>')+
    sec('world','World',g(b('gnaw','Spawn Gnawbone'),b('wipe',devAct.armed?'Tap again to wipe':'Wipe all saves')));
  // Every class in rags (gear tier 0) side by side, so colours can be compared on the phone.
  $('skingal').innerHTML=Object.keys(RAGS).map(id=>{const im=mkRags(id);return '<figure><img src="'+im.c.toDataURL()+'" alt=""><figcaption>'+(CLASSES[id]?CLASSES[id].name:id[0].toUpperCase()+id.slice(1).replace('knight',' Knight'))+'</figcaption></figure>'}).join('');
  // Every monster type as it draws in the game (list and status in docs/monsters.md).
  $('mobgal').innerHTML=Object.keys(TYPES).map(k=>{const im=IMG[TYPES[k].img];return '<figure><img src="'+im.c.toDataURL()+'" alt=""><figcaption>'+TYPES[k].name.replace(/^an? /,'')+'</figcaption></figure>'}).join('');
}
if(dev.on){$('devbtn').style.display='block';$('devbtn').addEventListener('click',()=>{renderDev();openModal('devUI')});$('devbox').addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.sec)devOpen[d.dataset.sec]=d.open},true);$('devbox').addEventListener('click',e=>{const b=e.target.closest('button[data-dev]');if(b)devAct(b.dataset.dev)});}

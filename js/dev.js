// Developer panel (open the game with ?dev). Testing only.
'use strict';
/* ---------- Developer tools ---------- */
function devAct(a){
  const L=player.lvl;
  if(a==='lvlup'||a==='lvldn'){player.lvl=Math.max(1,Math.min(TEST_MAX,L+(a==='lvlup'?1:-1)));player.xp=0;player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);player.cds={};save();buildControls();log('Dev: level '+player.lvl+'.','#ff8a80')}
  else if(a==='heal'){player.hp=maxHP(L);player.mp=maxMP(L);if(pet)pet.hp=pet.maxhp;log('Dev: full health and mana.','#ff8a80')}
  else if(a==='cds'){player.cds={};player.gcd=0;log('Dev: cooldowns reset.','#ff8a80')}
  else if(a==='skin'){dev.skin=!dev.skin;log('Dev: default skin '+(dev.skin?'on':'off')+'.','#ff8a80')}
  else if(a==='old'){dev.old=!dev.old;log('Dev: old look '+(dev.old?'on':'off')+'.','#ff8a80')}
  else if(a==='god'){dev.god=!dev.god;log('Dev: god mode '+(dev.god?'on':'off')+'.','#ff8a80')}
  else if(a==='kill'){const t=player.target;if(t&&!t.dead)hitMob(t,t.hp+999,'direct','dev strike');else log('Dev: no target.','#ff8a80')}
  // Loot by rarity (owner, Nov 27): pick the colour you want to test. Every pink for your class, including named and Malrec ones.
  else if(a==='white'){giveItem(pick(COMMONS));saveInv()}
  else if(a==='gear'){giveItem(pick(UNCOMMONS));saveInv()}
  else if(a==='pink'){giveItem(pick(Object.keys(ITEMS).filter(id=>ITEMS[id].rar==='named'&&ITEMS[id].slot&&forMe(id))));saveInv()}
  // Your weapon type's whole Zone 1 ladder (white to Malrec), for testing weapon looks as they get built.
  else if(a==='wpns'){Object.keys(ITEMS).filter(id=>ITEMS[id].slot==='weapon'&&forMe(id)).sort((x,y)=>(ITEMS[x].look||0)-(ITEMS[y].look||0)).forEach((id,i)=>giveItem(id,1,i));saveInv()}
  else if(a==='rare'){giveItem(pick(RARES));saveInv()}
  else if(a==='boss'){giveItem(pick(BOSS1));saveInv()}
  else if(a==='copper'){inv.copper+=500;saveInv();log('Dev: +500 copper.','#ff8a80')}
  else if(a==='orbs'){giveItem('orb1',5);saveInv();log('Dev: +5 Enchant Orbs.','#ff8a80')}
  else if(a==='gate'){if(zoneId!=='over')enterZone('over');player.x=3.5*T;player.y=15*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='door'){if(zoneId!=='over')enterZone('over');player.x=DOOR.x;player.y=DOOR.y+26;player.onTile=tileAt(player.x,player.y);if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='dun'){enterZone('dun')}
  else if(a==='crypt'){enterZone('crypt');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='gy'){enterZone('gy');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='cross'){enterZone('cross');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='tunnel'){enterZone('tunnel');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='wolf'){enterZone('wolf');if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='chapel'){enterZone('chapel');if(pet){pet.x=player.x;pet.y=player.y}}
  // Dungeon 1 (v0.66, two floors): floor 1's catacomb, the Drowned Prior's pool, or floor 2 for the Bellringer or Brother Malrec.
  else if(a==='d1'||a==='prior'||a==='bell'||a==='malrec'){const f2=a==='bell'||a==='malrec';enterZone(f2?'d2':'d1');if(f2)run.home='dungeon1'; // the way out still leads to the chapel
    const to={prior:[22,14],malrec:[16,11]}[a];if(to){player.x=to[0]*T+8;player.y=to[1]*T+8}if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='den'){if(zoneId!=='tunnel')enterZone('tunnel');player.x=26*T+8;player.y=29*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='bossroom'){if(zoneId!=='dun')enterZone('dun');player.x=8*T+8;player.y=8*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='rarespawn'){const A=curArea();if(!A||!A.rare){log('Dev: this area has no rare.','#ff8a80')}else{const m=spawnRare(A),p=areaSpot(A,{tx:A.rare.x,ty:A.rare.y+3})||areaSpot(A,{tx:A.rare.x,ty:A.rare.y});if(p){player.x=p.x;player.y=p.y}log('Dev: '+m.def.name+' is up. You are next to its spot.','#ff8a80')}}
  else if(a==='keys'){giveItem('severed_paw',3);giveItem('crown_shard',3,1);saveInv()}
  else if(a==='gnaw'){const m=spawn({type:'gnaw',x:player.x+30,y:player.y,timer:0,mob:null,group:null,noRespawn:true});log('Dev: Old Gnawbone appears.','#ff8a80')}
  else if(a==='arena'){enterZone('arena')}
  else if(a.indexOf('sp-')===0){if(zoneId!=='arena')enterZone('arena');const f=SIM_FIGHTS.find(f=>f.id===a.slice(3));arenaSpawn(f,player.lvl);log('Dev: '+f.name+' at level '+(f.lv||player.lvl)+'.','#ff8a80')}
  else if(a==='clear'){if(zoneId==='arena'){mobs.length=0;spawns.length=0;log('Dev: arena cleared.','#ff8a80')}}
  else if(a==='watch'){simWatch.on=!simWatch.on;simWatch.st={mode:'A'};if(simWatch.on&&zoneId!=='arena')enterZone('arena');log('Dev: bot '+(simWatch.on?'plays your character (testing grounds only).':'off.'),'#ff8a80')}
  else if(a==='sim'){if(simState.busy||!BOTS[CLS])return;
    runSim({onProgress:(i,n)=>{const o=$('simout');if(o)o.textContent='Running fight set '+i+' of '+n+'…'}}).then(()=>{log('Dev: sim finished.','#ff8a80');renderDev()});renderDev();return}
  else if(a==='pace'){if(simState.busy||!BOTS[CLS])return;
    runPace({onProgress:(i,n)=>{const o=$('simout');if(o)o.textContent='Zone 1 pace: run '+i+' of '+n+'…'}}).then(()=>{log('Dev: Zone 1 pace finished.','#ff8a80');renderDev()});renderDev();return}
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
    sec('loot','Loot',g(b('white','White'),b('gear','Green'),b('rare','Blue'),b('pink','Pink'),b('boss','Skeleton King item'),b('wpns','All my weapons'),b('copper','+500 copper'),b('orbs','+5 orbs')))+
    sec('tp','Teleport',g(b('cross','Crossroads'),b('tunnel','Rat tunnel'),b('den','Gnawbone den'),b('gy','Graveyard'),b('crypt','Crypt'),b('wolf','Wolfwood'),b('chapel','Chapel'),b('d1','Dungeon 1'),b('prior','Drowned Prior'),b('bell','Bellringer'),b('malrec','Malrec')))+
    // Old Zone (owner, Nov 27): the first build (Gate Road, guards, the first crypt), kept only to compare then and now.
    // Frozen: not part of the game, nobody works on it.
    sec('old','Old Zone (first build, frozen)',g(b('gate','Old gate'),b('door','Old crypt door'),b('dun','Old crypt'),b('bossroom','Old boss room')))+
    sec('test','Testing grounds',g(b('arena','Go there'),b('clear','Clear mobs'),b('watch','Bot plays me'),b('sim',simState.busy?'Sim running…':'Run sim ('+C.name+')'),b('pace','Zone 1 pace'))+
      '<p class="hint" style="margin:8px 0 4px">Spawn a test fight:</p>'+g(...SIM_FIGHTS.map(f=>b('sp-'+f.id,f.name.replace(' (armored)','').replace(' (lvl 7)',''))))+
      '<div id="simout" class="simout">'+(!BOTS[CLS]?'No playbook bot for '+C.name+' yet.':simState.lastPace&&simState.lastPace.cls===CLS&&(!simState.last||simState.lastPaceAt>simState.lastAt)?paceSummary(simState.lastPace):simState.last&&simState.last.cls===CLS?'<p><b>'+simSummary(simState.last)+'</b></p>'+simTable(simState.last,true):'Mobs spawn at your level. The sim fights each one '+SIM_SEEDS+' times at every level from 1 to 10, the Skeleton King from level 6 (a few minutes).')+'</div>')+
    sec('look','Look and galleries',g(b('old','Old look'),b('skin','Default skin'))+'<p class="hint" style="margin:8px 0 0">Classes</p><div id="skingal" class="skingal"></div><p class="hint" style="margin:8px 0 0">Monsters</p><div id="mobgal" class="skingal"></div>')+
    sec('world','World',g(b('gnaw','Spawn Gnawbone'),b('keys','Summon keys'),b('rarespawn','Rare here'),b('wipe',devAct.armed?'Tap again to wipe':'Wipe all saves')));
  // Every class in rags (gear tier 0) side by side, so colours can be compared on the phone.
  $('skingal').innerHTML=Object.keys(RAGS).map(id=>{const im=mkRags(id);return '<figure><img src="'+im.c.toDataURL()+'" alt=""><figcaption>'+(CLASSES[id]?CLASSES[id].name:id[0].toUpperCase()+id.slice(1).replace('knight',' Knight'))+'</figcaption></figure>'}).join('');
  // Every monster type as it draws in the game (list and status in docs/monsters.md).
  $('mobgal').innerHTML=Object.keys(TYPES).map(k=>{const im=IMG[TYPES[k].img];return '<figure><img src="'+im.c.toDataURL()+'" alt=""><figcaption>'+TYPES[k].name.replace(/^an? /,'')+'</figcaption></figure>'}).join('');
}
if(dev.on){$('devbtn').style.display='block';$('devbtn').addEventListener('click',()=>{renderDev();openModal('devUI')});$('devbox').addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.sec)devOpen[d.dataset.sec]=d.open},true);$('devbox').addEventListener('click',e=>{const b=e.target.closest('button[data-dev]');if(b)devAct(b.dataset.dev)});}

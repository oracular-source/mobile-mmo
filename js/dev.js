// Developer panel (open the game with ?dev). Testing only.
'use strict';
/* ---------- Developer tools ---------- */
function devAct(a){
  const L=player.lvl;
  if(a==='lvlup'||a==='lvldn'){player.lvl=Math.max(1,Math.min(10,L+(a==='lvlup'?1:-1)));player.xp=0;player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);player.cds={};save();buildControls();log('Dev: level '+player.lvl+'.','#ff8a80')}
  else if(a==='heal'){player.hp=maxHP(L);player.mp=maxMP(L);if(pet)pet.hp=pet.maxhp;log('Dev: full health and mana.','#ff8a80')}
  else if(a==='cds'){player.cds={};player.gcd=0;log('Dev: cooldowns reset.','#ff8a80')}
  else if(a==='skin'){dev.skin=!dev.skin;log('Dev: default skin '+(dev.skin?'on':'off')+'.','#ff8a80')}
  else if(a==='god'){dev.god=!dev.god;log('Dev: god mode '+(dev.god?'on':'off')+'.','#ff8a80')}
  else if(a==='kill'){const t=player.target;if(t&&!t.dead)hitMob(t,t.hp+999,'direct','dev strike');else log('Dev: no target.','#ff8a80')}
  else if(a==='gear'){giveItem(pick(UNCOMMONS));saveInv()}
  else if(a==='rare'){giveItem(pick(RARES));saveInv()}
  else if(a==='boss'){giveItem(pick(BOSS1));saveInv()}
  else if(a==='copper'){inv.copper+=500;saveInv();log('Dev: +500 copper.','#ff8a80')}
  else if(a==='gate'){if(zoneId!=='over')enterZone('over');player.x=3.5*T;player.y=15*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='door'){if(zoneId!=='over')enterZone('over');player.x=DOOR.x;player.y=DOOR.y+26;player.onTile=tileAt(player.x,player.y);if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='dun'){enterZone('dun')}
  else if(a==='bossroom'){if(zoneId!=='dun')enterZone('dun');player.x=8*T+8;player.y=8*T+8;if(pet){pet.x=player.x;pet.y=player.y}}
  else if(a==='gnaw'){if(zoneId!=='over'){log('Dev: Old Gnawbone lives outside.','#ff8a80');return}const m=spawn({type:'gnaw',x:player.x+30,y:player.y,timer:0,mob:null,group:null,noRespawn:true});log('Dev: Old Gnawbone appears.','#ff8a80')}
  else if(a==='wipe'){if(!devAct.armed){devAct.armed=true;log('Dev: tap Wipe again to erase all saves for every class.','#ff8a80');renderDev();return}
    store.keys().filter(k=>k!=='ashfen-dev').forEach(k=>store.del(k));location.reload();return}
  devAct.armed=false;renderDev();
}
function renderDev(){
  const b=(a,t)=>'<button data-dev="'+a+'"'+((a==='god'&&dev.god)||(a==='skin'&&dev.skin)?' class="active"':'')+'>'+t+'</button>';
  $('devbox').innerHTML='<h2>Character</h2><div class="seg">'+b('lvldn','Level −')+b('lvlup','Level +')+'</div><div class="seg">'+b('heal','Full heal')+b('cds','Reset cooldowns')+'</div><div class="seg">'+b('god','God mode')+b('kill','Kill target')+'</div>'+
    '<h2>Loot</h2><div class="seg">'+b('gear','Uncommon')+b('rare','Rare')+b('boss','Boss 1 item')+'</div><div class="seg">'+b('copper','+500 copper')+'</div>'+
    '<h2>Teleport</h2><div class="seg">'+b('gate','Gate')+b('door','Crypt door')+'</div><div class="seg">'+b('dun','Dungeon start')+b('bossroom','Boss room')+'</div>'+
    '<h2>Look</h2><div class="seg">'+b('skin','Default skin')+'</div><div id="skingal" class="skingal"></div>'+
    '<h2>World</h2><div class="seg">'+b('gnaw','Spawn Gnawbone')+b('wipe',devAct.armed?'Tap again to wipe':'Wipe all saves')+'</div>';
  // Every class on the default skin side by side, so colours can be compared on the phone.
  $('skingal').innerHTML=Object.keys(SKINS).map(id=>{const im=mkSkin(id);return '<figure><img src="'+im.c.toDataURL()+'" alt=""><figcaption>'+(CLASSES[id]?CLASSES[id].name:id[0].toUpperCase()+id.slice(1).replace('knight',' Knight'))+'</figcaption></figure>'}).join('');
}
if(dev.on){$('devbtn').style.display='block';$('devbtn').addEventListener('click',()=>{renderDev();openModal('devUI')});$('devbox').addEventListener('click',e=>{const b=e.target.closest('button[data-dev]');if(b)devAct(b.dataset.dev)});}

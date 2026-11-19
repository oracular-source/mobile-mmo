// Game rules for fighting: threat, hits, deaths, the pet, loot and casting.
// No drawing or touch input here.
'use strict';
// Buff length for the chat line. Long-lasting buffs (Spirit of the Wolf, Spirit Ward) last until you die, so no number is shown.
const durTxt=d=>d>=9999?'':' ('+Math.round(d)+'s)';
/* ---------- Combat ---------- */
let pet=null; // your one pet: Necro skeleton, Shadow Knight minion, Enchanter sword, or a charmed mob
let decoy=null; // Enchanter's Phantasm: a see-through copy of you that nearby mobs attack for a few seconds
const grounds=[]; // circles on the floor: Paladin's Consecrate, Shaman's Venom Totem, Ranger's Volley
const traps=[]; // Ranger's Spike Traps: wait at a spot and go off on the first mob that steps in
const victim=m=>(decoy&&dist(m,decoy)<110)?decoy:(pet&&m.threat.pet>m.threat.p)?pet:player;
const petName=()=>pet?(pet.name||'skeleton'):'skeleton';
// Songs the Bard is playing right now (ability ids, oldest first, two at most).
const songOn=id=>!!(player.songs&&player.songs.indexOf(id)>=0);
const songKind=k=>(player.songs||[]).some(id=>ABI[id]&&ABI[id].song===k);
const isUndead=m=>!!(m&&m.def.undead);
// Divine Aura blocks all damage; Mana Shield takes damage out of your mana first. Returns what's left to hit your health.
function shieldDmg(dmg){
  if(player.buffs.aura>0){floatText(player.x,player.y-20,'IMMUNE','#ffd27a');return 0}
  if(player.buffs.mshield>0&&player.mp>0){const soak=Math.min(player.mp,dmg);player.mp-=soak;dmg-=soak;floatText(player.x+6,player.y-24,'-'+Math.round(soak)+' mana','#7dbbff');if(player.mp<1){player.buffs.mshield=0;log('Your Mana Shield collapses.','#ffb37a')}}
  return dmg;
}
// Rogue helpers. "Behind" = on the side the mob's back faces (mobs face left or right).
const hidden=()=>player.buffs.hide>0;
const behind=m=>(player.x-m.x)*(m.dir||1)<-2;
// A stunned or Evaded mob isn't watching you, so Backstab works from any side (stepping behind in 2s is fiddly on a phone).
const openTo=m=>m.stun>0||m.lost>0;
const unhide=msg=>{if(player.buffs.hide>0){player.buffs.hide=0;if(msg)log(msg,'#9aa')}};
// Mobs actively fighting you (Evade's confusion doesn't count).
const fightingMe=()=>mobs.filter(m=>!m.dead&&m.state==='chase'&&victim(m)===player&&!(m.lost>0));
function engage(m,byPet){
  if(m.dead||player.dead)return;
  if(byPet)m.threat.pet+=1;else m.threat.p+=1;
  if(m.state!=='chase'){m.state='chase';if(!player.target)player.target=m;}
  if(m.sp.group)mobs.forEach(o=>{if(o!==m&&!o.dead&&o.sp.group===m.sp.group&&o.state!=='chase'&&!(o.calm>0)&&dist(o,m)<70){o.state='chase';log(cap(o.def.name)+' joins the fight!','#ffb37a')}});
}
// src 'npc' = a guard. XP only goes to the player if they did at least half the damage.
function hitMob(m,dmg,kind,label,src){
  if(m.dead)return;
  if(src!=='npc'&&m.mark)dmg*=m.mark; // Ranger's Hunter's Mark: your (and your pet's) hits do more
  dmg=Math.max(1,Math.round(dmg));m.hp-=dmg;
  if(src==='npc'){m.odmg+=dmg;floatText(m.x,m.y-18,String(dmg),'#cfd6e0');log(label+' hits '+m.def.name+' for '+dmg+'.','#b8c4d4');}
  else if(src==='pet'){m.pdmg+=dmg;m.threat.pet+=dmg*((pet&&pet.threat)||3)+(m.petHit?0:20);m.petHit=1;floatText(m.x,m.y-18,String(dmg),'#d8d2c0');if(rng()<0.35)log('Your '+petName()+' hits '+m.def.name+' for '+dmg+'.','#bdb6a0');engage(m,true);}
  else{m.pdmg+=dmg;m.threat.p+=dmg;floatText(m.x,m.y-18,String(dmg),kind==='dot'?'#9be37a':kind==='song'?'#ffd27a':kind==='shield'?'#ff9a4a':'#ffffff');log('Your '+label+' hits '+m.def.name+' for '+dmg+'.','#e8e2cf');engage(m);}
  // Anything that hits a sleeping (mesmerized) mob wakes it, angry.
  if(m.mez>0){m.mez=0;floatText(m.x,m.y-26,'awake!','#ffb37a');log(cap(m.def.name)+' wakes up!','#ffb37a')}
  if(kind==='direct')m.lost=0; // a direct hit snaps an Evaded mob out of it (DoT ticks don't)
  if(kind==='direct'&&m.root>0&&rng()<0.25){m.root=0;log('Your Rootgrip on '+m.def.name+' breaks!','#ffb37a')}
  if(m.hp<=0)killMob(m);
}
function killMob(m){
  m.dead=true;m.hp=0;m.sp.timer=m.sp.noRespawn?Infinity:(m.type==='gnaw'?30:24);m.sp.mob=null;
  burst(m.x,m.y-6,'#cfc8b2',10,false);
  log('You have slain '+m.def.name+'!','#ffd27a');
  const d=m.lv-player.lvl,mult=Math.max(0.1,Math.min(1.6,1+0.2*d));
  let xp=Math.round((m.lv*m.lv*4+6)*mult*(m.def.boss?6:m.def.named?3:1)*XP_MULT);
  const credit=m.pdmg>=m.odmg;
  if(player.lvl>=10)xp=0;
  if(!credit){xp=0;log('The guards did most of the work. No experience or loot.','#9aa');}
  if(xp>0){player.xp+=xp;log('You gain experience!','#c9a227');}
  if(zoneId==='dun'){run.kills++;run.xp+=credit?xp:0;}
  if(m.def.boss&&zoneId==='dun'){floatText(player.x,player.y-40,'Dungeon 1 cleared!','#ffd27a',true);log(m.def.name+' has been defeated! A chest and a way out appear.','#ffd27a');
    run.chest={x:m.hx,y:m.hy+6,open:false};run.portal={x:m.hx,y:m.hy-22};}
  if(credit){const k=kills[m.def.name]||{count:0,named:!!m.def.named,first:new Date().toISOString().slice(0,10)};k.count++;kills[m.def.name]=k;store.set('ashfen-kills',kills);
    if(m.def.named&&k.count===1)log('Journal updated: first kill of '+m.def.name+'!','#ff9de2');}
  if(credit){const coin=Math.floor(rr(0,3)+m.lv);if(coin>0){inv.copper+=coin;log('You receive '+coin+' copper.','#c9a227')}rollLoot(m);saveInv();}
  if(player.target===m)player.target=null;
  while(player.lvl<10&&player.xp>=need(player.lvl)){
    player.xp-=need(player.lvl);player.lvl++;player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);
    floatText(player.x,player.y-26,'LEVEL '+player.lvl+'!','#ffd27a',true);burst(player.x,player.y-8,'#ffd27a',24,true);
    log('You have reached level '+player.lvl+'!','#ffd27a');
    AB.forEach(a=>{if(a.lvl===player.lvl)log('You have learned '+a.name+'! Check your Spells.','#7dffa6')});
    buildControls();
  }
  save();
  setTimeout(()=>{const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1)},800);
}
function hurtPlayer(m){
  // Monk's Deflect: every melee hit misses for a few seconds.
  if(player.buffs.deflect>0){floatText(player.x,player.y-20,'DODGE','#cfd6e0');return}
  // Class passive dodge (Rogue): a chance for any melee hit to miss outright.
  if(C.dodge&&rng()<C.dodge){floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You dodge '+m.def.name+"'s attack.",'#9aa');return}
  let dmg=(m.def.dmg+m.def.dmgl*m.lv)*rr(0.7,1.25);
  // Higher-level mobs hit much harder; lower-level ones a little softer.
  const ld=m.lv-player.lvl;dmg*=ld>0?1+0.15*ld:Math.max(0.7,1+0.05*ld);
  if(player.buffs.bark>0)dmg*=0.75;
  if(player.buffs.stance>0)dmg*=0.5;
  dmg=tankMods(dmg);
  dmg*=100/(100+(stat('ac')+C.ac+(player.buffs.ward>0?8:0))*4); // AC from gear (and Warrior plate, and Spirit Ward) softens every hit
  if(player.sit){dmg*=1.25;player.sit=false;log('You stand up.','#9aa')}
  dmg=Math.max(1,Math.round(dmg));if(dev.god)dmg=0;
  // Magician's Elemental Link: the pet takes half of the hit.
  if(player.buffs.link>0&&pet&&!pet.charm&&dmg>1){const h=Math.floor(dmg/2);dmg-=h;damagePet(h)}
  dmg=Math.round(shieldDmg(dmg));player.hp-=dmg;
  if(dmg>0)floatText(player.x,player.y-20,String(dmg),'#ff5a5a');
  // Magician's Flame Shield: whatever hits you gets burned back.
  if(player.buffs.fshield>0&&player.bval&&player.bval.fshield&&!m.dead)hitMob(m,player.bval.fshield*rr(0.9,1.1)*(1-m.def.armor),'shield','Flame Shield');
  log(cap(m.def.name)+' hits YOU for '+dmg+'.','#ff8a80');
  unhide('You are no longer hidden.');
  if(player.cast&&rng()<0.15){player.cast=null;log('Your spell is interrupted.','#ffb37a')}
  if(player.hp<=0&&!lastStand())playerDie(m);
}
// Warrior's Last Stand: once a fight, a killing blow leaves you at 1 HP, and for a few seconds nothing can drop you below 1
// (damage is also cut, so a Bandage in that window sticks). Resets when the fight ends (see update.js).
function lastStand(){
  if(player.buffs.laststand>0){player.hp=1;return true}
  if(!C.lastStand||player.lsUsed)return false;
  player.hp=1;player.lsUsed=true;player.buffs.laststand=C.lastStand.dur;
  floatText(player.x,player.y-28,'LAST STAND!','#ffd27a',true);burst(player.x,player.y-8,'#ffd27a',18,true);
  log('You refuse to fall! Last Stand ('+C.lastStand.dur+'s).','#ffd27a');
  return true;
}
// Warrior passives, used by melee hits and Boss 1's bolt alike.
function tankMods(dmg){
  // Hold the Line: the more mobs on you, the less each one hurts (the Shadow Knight heals per mob; the Warrior shrugs per mob).
  if(C.holdLine)dmg*=1-C.holdLine*Math.min(C.holdMax||4,Math.max(1,fightingMe().length));
  if(player.buffs.laststand>0)dmg*=1-C.lastStand.dr;
  return dmg;
}
function playerDie(m){
  player.hp=0;player.dead=3;player.cast=null;player.tx=null;player.target=null;player.sit=false;
  log('You have been slain by '+m.def.name+'!','#ff4d4d');
  const loss=Math.floor(need(player.lvl)*0.1);player.xp=Math.max(0,player.xp-loss);save();
  // Death ends every fight: clear threat and lingering DoTs (a DoT tick after you respawn used to re-aggro the mob), then send mobs home.
  mobs.forEach(o=>{if(o.dead)return;o.threat.p=0;o.threat.pet=0;o.petHit=0;o.dots=[];o.root=0;o.snare=0;o.fear=0;o.stun=0;o.lost=0;if(o.state==='chase')o.state='return'});
  player.buffs={};player.bval={};player.lsUsed=false;player.hots=[];player.songs=[];decoy=null;grounds.length=0;traps.length=0; // buffs (Clarity, Barkskin...) and songs last until you die
  if(pet&&pet.charm)releaseCharm(true);
  else if(pet){log('Your '+petName()+' is gone.','#9aa');pet=null;}
}
function hurtPet(m){
  const dmg=(m.def.dmg+m.def.dmgl*m.lv)*rr(0.7,1.25)*100/(100+pet.ac*4);
  damagePet(Math.max(1,Math.round(dmg)));
}
function damagePet(dmg){
  if(!pet)return;
  pet.hp-=dmg;floatText(pet.x,pet.y-18,String(dmg),'#ffb37a');
  if(pet.hp<=0){burst(pet.x,pet.y-6,'#cfc8b2',12);
    if(pet.charm){const cm=pet.charm;cm.dead=true;cm.sp.mob=null;cm.sp.timer=cm.sp.noRespawn?Infinity:24;log('Your charmed '+cm.def.name.replace(/^an? /,'')+' is slain.','#ffb37a')}
    else log('Your '+petName()+' is destroyed.','#ffb37a');
    pet=null;mobs.forEach(o=>{if(o.threat)o.threat.pet=0});}
}
// A summon's numbers come from its ability's pet:{} data (no data = the Necro's skeleton). One pet at a time.
function raisePet(def){
  const L=player.lvl;def=def||{name:'skeleton',img:'pet',hp:[30,14],dmg:[3,1.6],ac:6};
  if(pet&&pet.charm)releaseCharm();
  else if(pet&&pet.name!==def.name)log('Your '+petName()+' returns to where it came from.','#9aa'); // Magician: one elemental at a time
  const hp=Math.round(def.hp[0]+def.hp[1]*L);
  pet={kind:'pet',name:def.name,img:def.img,x:player.x-12*player.dir,y:player.y+4,dir:player.dir,walk:0,hp:hp,maxhp:hp,dmg:def.dmg[0]+def.dmg[1]*L,ac:def.ac+L,atk:0,rate:def.atk||1.8,life:def.life||0,target:null,threat:def.threat||3,burn:def.burn?def.burn[0]+def.burn[1]*L:0,boom:def.boom||1,boomStun:def.boomStun||0,bash:def.bash||null,bashT:0};
  if(blocked(pet.x,pet.y)){pet.x=player.x;pet.y=player.y}
  burst(pet.x,pet.y-6,'#7dffa6',16,true);
  log(def.say||(def.img==='blade'?'A sword lifts into the air and floats beside you.':'A '+def.name+' claws its way out of the ground to serve you.'),'#b48cff');
}
// Charm: the mob leaves the enemy list and becomes your pet until the charm runs out. Then it breaks free and always comes for you.
function charmMob(m,dur){
  if(pet&&pet.charm)releaseCharm();
  const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);
  mobs.forEach(o=>{if(o.threat)o.threat.pet=0});
  if(player.target===m)player.target=null;
  const d=m.def.dmg+m.def.dmgl*m.lv;
  pet={kind:'pet',charm:m,name:m.def.name.replace(/^an? /,''),img:m.def.img,x:m.x,y:m.y,dir:m.dir,walk:0,hp:m.hp,maxhp:m.maxhp,dmg:d*1.3,ac:6+m.lv,atk:0,rate:2,charmT:dur,charmMax:dur,target:null};
  burst(m.x,m.y-6,'#ff9de2',14,true);log(cap(m.def.name)+' is charmed and fights for you ('+Math.round(dur)+'s). When it breaks free, it comes for YOU.','#ff9de2');
}
function releaseCharm(quiet){
  if(!pet||!pet.charm)return;
  const m=pet.charm;
  // It comes back where your pet stood, with your pet's health, and nothing from before still on it.
  Object.assign(m,{x:pet.x,y:pet.y,hp:Math.max(1,Math.round(pet.hp)),dots:[],mez:0,stun:0,fear:0,root:0,snare:0,lost:0,aslow:0,chill:0});
  pet=null;mobs.push(m);
  if(quiet||player.dead){m.state='return';m.threat={p:0,pet:0};return}
  m.state='chase';m.threat={p:999,pet:0};m.atk=1;
  burst(m.x,m.y-6,'#ff4d4d',12);floatText(m.x,m.y-26,'FREE!','#ff4d4d');log(cap(m.def.name)+' breaks free of your charm and turns on YOU!','#ff4d4d');
}
// The skeleton follows you, attacks whatever you're fighting, and holds aggro: its hits count triple for threat, plus a bonus on its first hit.
function updatePet(dt){
  if(!pet)return;
  pet.atk=Math.max(0,pet.atk-dt);
  // Pet bash (Earth elemental's Stone Fist): saved for a cast. When the mob it's fighting starts casting, the pet slams it
  // (a short stun breaks the spell), then waits out its cooldown. Works like a player's stun, on its own timer.
  if(pet.bash){pet.bashT=Math.max(0,pet.bashT-dt);const bt=pet.target;
    if(bt&&!bt.dead&&bt.casting&&pet.bashT<=0&&dist(pet,bt)<=14){pet.bashT=pet.bash.cd;bt.stun=Math.max(bt.stun||0,pet.bash.dur);burst(bt.x,bt.y-8,'#8a6a48',8,true);log('Your '+petName()+' slams '+bt.def.name+' with a stone fist!','#cfc8b2')}}
  if(pet.charm){pet.charmT-=dt;if(pet.charmT<=0){releaseCharm();return}}
  if(pet.life){pet.life-=dt;if(pet.life<=0){burst(pet.x,pet.y-6,'#cfd6e0',8);log('Your '+petName()+' falls to the ground.','#9aa');pet=null;mobs.forEach(o=>{if(o.threat)o.threat.pet=0});return}}
  if(pet.target&&(pet.target.dead||pet.target.mez>0||mobs.indexOf(pet.target)<0))pet.target=null; // never wake a sleeping mob
  if(!pet.target){const pt=player.target;
    if(pt&&!pt.dead&&pt.state==='chase'&&!(pt.mez>0))pet.target=pt;
    else{const m=mobs.filter(m=>!m.dead&&m.state==='chase'&&!(m.mez>0)&&dist(m,player)<90).sort((a,b)=>dist(a,pet)-dist(b,pet))[0];if(m)pet.target=m;}}
  const t=pet.target;
  if(t){if(dist(pet,t)>12)moveToward(pet,t.x,t.y,38,dt);else{pet.dir=t.x>pet.x?1:-1;if(pet.atk<=0){pet.atk=(pet.rate||1.8)/(player.buffs.burnout>0?1.3:1);burst(t.x,t.y-6,pet.img==='fire'?'#ff9a4a':'#cfc8b2',3);hitMob(t,pet.dmg*rr(0.8,1.2)*(1-t.def.armor),'melee',petName(),'pet');
      // Fire elemental: every hit sets the mob burning (a short DoT that refreshes).
      if(pet&&pet.burn&&!t.dead){t.dots=t.dots.filter(d=>d.id!=='burn');t.dots.push({id:'burn',name:'Burn',t:6,next:2,dmg:pet.burn,pet:1})}}}}
  // Follow with a dead zone: start walking past 30px, stop once close to its spot. One threshold made it stop and start every frame (the jitter).
  else{const d=dist(pet,player);if(d>30)pet.follow=true;
    if(pet.follow){const fx=player.x-12*player.dir,fy=player.y+4;if(moveToward(pet,fx,fy,d>60?52:40,dt)||Math.hypot(pet.x-fx,pet.y-fy)<6)pet.follow=false;}
    pet.hp=Math.min(pet.maxhp,pet.hp+pet.maxhp*0.02*dt);}
  if(dist(pet,player)>240){pet.x=player.x;pet.y=player.y;pet.target=null;}
}
function respawnPlayer(){if(zoneId==='dun'){player.x=DUN.start.x;player.y=DUN.start.y}else if(zoneId==='arena'){player.x=ARENA.start.x;player.y=ARENA.start.y}else{player.x=3.5*T;player.y=15*T+8}player.hp=Math.round(maxHP(player.lvl)*0.5);player.mp=Math.round(maxMP(player.lvl)*0.5);player.dead=0;log(zoneId==='dun'?'You wake at the crypt entrance.':'You return to the Gate Road.','#9aa')}

const LIFETAP_HEAL=0.85; // Lifetap returns this share of its damage as healing (v0.11.1: was 100%)

/* ---------- Loot ---------- */
// Drop chances grow a little with mob level. Gear: ~11-15% common, ~3-5% uncommon, 1% rare from level 4+ mobs.
function rollLoot(m){
  const got=[];
  if(rng()<0.6)got.push(JUNK[m.type]);
  if(m.type==='dead'&&rng()<0.3)got.push('rag');
  const lb=m.lv*0.01,r=rng(),dun=zoneId==='dun';
  if(r<0.10+lb)got.push(pick(COMMONS));
  else if(r<0.10+lb+(0.025+lb*0.5)*(dun?2:1))got.push(pick(UNCOMMONS));
  if(m.lv>=4&&rng()<(dun?0.03:0.01))got.push(pick(RARES));
  // Boss 1's loot waits in its chest: one named item and one uncommon, every time, plus a small rare chance.
  if(m.type==='boss1'){const c=[pick(BOSS1),pick(UNCOMMONS)];if(rng()<0.15)c.push(pick(RARES));if(run.chest){run.chest.items=c.concat(got.filter(id=>ITEMS[id].rar!=='junk'));got.splice(0,got.length,...got.filter(id=>ITEMS[id].rar==='junk'))}else got.push.apply(got,c);}
  if(m.type==='gnaw'){got.push('gnawring');if(rng()<0.5)got.push(pick(UNCOMMONS));}
  got.forEach((id,i)=>giveItem(id,1,i));
}
function giveItem(id,n,k){
  const it=ITEMS[id];n=n||1;
  let i=it.stack?inv.bags.findIndex(b=>b&&b.id===id):-1;
  if(i>=0)inv.bags[i].n+=n;
  else{i=inv.bags.indexOf(null);if(i<0){log('Your bags are full. The '+it.name+' is left behind.','#ff8a80');return false}inv.bags[i]={id:id,n:n}}
  if(zoneId==='dun')run.loot.push(it.name);
  log('You loot: '+it.name+(it.rar==='junk'?'':' ('+it.rar+')'),RAR[it.rar]);
  floatText(player.x,player.y-30-(k||0)*8,it.name,RAR[it.rar]);
  return true;
}

/* ---------- Casting ---------- */
// Returns true if the spell started. "quiet" skips spam messages during hold-to-repeat.
function cast(a,quiet){
  if(!a||player.dead)return false;
  if(player.lvl<a.lvl){if(!quiet)log(a.name+' unlocks at level '+a.lvl+'.','#9aa');return false}
  // Bard: tapping a song that's playing stops it right away (no cost, no wait).
  if(a.kind==='song'&&songOn(a.id)){player.songs=player.songs.filter(id=>id!==a.id);log('You stop playing '+a.name+'.','#9aa');return true}
  const own=player.cds[a.id]||0;
  if(own>0){if(!quiet){if(own<1)player.queued={a:a,until:time+2};else{log(a.name+' is ready in '+Math.ceil(own)+'s.','#9aa');floatText(player.x,player.y-24,a.short+' '+Math.ceil(own)+'s','#9aa')}}return false}
  if(player.cast||player.gcd>0){if(!quiet){player.queued={a:a,until:time+2};}return false}
  if(a.mana&&player.mp<a.mana){if(!quiet)log('Not enough mana for '+a.name+'.','#ff8a80');return false}
  let t=null;
  if(player.fd>0&&a.kind!=='feign'){if(!quiet)log('You are playing dead. Move to get up.','#9aa');return false}
  // Rogue: attacking from Hide with your main attack opens with Backstab when it's ready.
  if(hidden()&&a===ABI[loadout[0]]&&ABI.backstab&&a.melee&&!(player.cds.backstab>0)&&player.lvl>=ABI.backstab.lvl)a=ABI.backstab;
  if(a.kind==='stealth'&&hidden()){if(!quiet)log('You are already hidden.','#9aa');return false}
  if(a.kind==='stealth'&&fightingMe().length){if(!quiet)log("You can't hide while something is fighting you. Try Evade first.",'#9aa');return false}
  if(a.kind==='evade'&&!fightingMe().length){if(!quiet)log('Nothing is fighting you.','#9aa');return false}
  if(a.kind==='petheal'&&(!pet||pet.charm||pet.img==='blade')){if(!quiet)log('You have no pet to mend.','#9aa');return false}
  if((a.kind==='detonate'||a.kind==='petbuff')&&(!pet||pet.charm)){if(!quiet)log('You need a pet out for '+a.name+'.','#9aa');return false}
  if(a.kind==='crescendo'&&!(player.songs&&player.songs.length)){if(!quiet)log('Play a song first.','#9aa');return false}
  // Divine Aura: nothing can hurt you, but you can't attack either (heals and buffs still work).
  if(player.buffs.aura>0&&!/^(heal|hot|buff)$/.test(a.kind)){if(!quiet)log("You can't attack inside Divine Aura.",'#9aa');return false}
  if(a.hpCost&&player.hp<=maxHP(player.lvl)*a.hpCost+1){if(!quiet)log('Not enough health for '+a.name+'.','#ff8a80');return false}
  if(a.kind==='cleave'&&!mobs.some(m=>!m.dead&&dist(m,player)<=a.radius)){if(!quiet)log('No enemies close enough to '+a.name+'.','#9aa');return false}
  if(a.tgt){
    t=player.target;
    // Mesmerize goes on the closest awake mob coming at you that you are NOT fighting, so you can keep hitting your target.
    // With no extra mob around, it uses your target. Your target never changes.
    let picked=false;
    if(a.kind==='mez'){const ex=mobs.filter(m=>!m.dead&&m.state==='chase'&&!(m.mez>0)&&m!==player.target&&!m.def.boss&&dist(m,player)<=a.range).sort((x,y)=>dist(x,player)-dist(y,player))[0];if(ex){t=ex;picked=true}}
    // Smart targeting: no target means the nearest enemy, preferring one already in range.
    if(!picked&&(!t||t.dead)){t=nearestMob(a.range)||nearestMob(150);if(t)player.target=t;}
    if(!t){if(!quiet)log('No enemy nearby.','#9aa');return false}
    if(dist(player,t)>a.range){if(!quiet){log('Out of range. Move closer.','#ff8a80');floatText(player.x,player.y-24,'Out of range','#ff8a80')}rangeShow=0.8;rangeR=a.range;return false}
    if(a.kind==='backstab'&&!hidden()&&!behind(t)&&!openTo(t)){if(!quiet){log('Backstab needs you hidden, behind the target, or the target stunned or Evaded.','#ff8a80');floatText(player.x,player.y-24,'Get behind it','#ff8a80')}return false}
    if(a.undeadOnly&&!isUndead(t)){if(!quiet){log(a.name+' only works on the undead.','#ff8a80');floatText(player.x,player.y-24,'Undead only','#ff8a80')}return false}
    if((a.kind==='mez'||a.kind==='charm')&&t.def.boss){if(!quiet)log(cap(t.def.name)+' can not be '+(a.kind==='mez'?'mesmerized':'charmed')+'.','#ff8a80');return false}
    if(a.kind==='charm'&&(t.def.named||t.lv>player.lvl)){if(!quiet)log('Charm only works on ordinary mobs your level or lower.','#ff8a80');return false}
    if(t.x!==player.x)player.dir=t.x>player.x?1:-1;
  }
  if(player.sit)player.sit=false;
  // Ranger's Rapid Fire doubles the speed of Shoot; the Bard's Chant of Blades makes melee 25% faster.
  player.gcd=GCD*(a.shot&&player.buffs.rapid>0?0.5:1)*(a.melee&&songKind('haste')?0.8:1);
  // Using anything but Hide brings you out of hiding (Backstab still gets its stealth bonus).
  const fromHide=hidden();if(a.kind!=='stealth')unhide();
  if(a.cast<=0){player.mp-=a.mana;player.cds[a.id]=cdFor(a);applyAbility(a,t,fromHide);return true}
  player.tx=null; // cast-time spells stop a tap-to-move walk
  player.cast={a:a,t:t,time:0};
  return true;
}
const castSlot=(i,quiet)=>{const a=ABI[loadout[i]];return a?cast(a,quiet):false}; // empty slots do nothing
// Every targeted spell can be resisted. Even-level mobs resist 5% of the time, +10% per level above you,
// down to 2% for much lower mobs. A resist still costs the mana. There are no fizzles.
function resistChance(m){const d=m.lv-player.lvl;return Math.max(0.02,Math.min(0.9,0.05+(d>0?d*0.10:d*0.015)))}
// Roots, snares and DoTs last longer on lower-level mobs and shorter on higher ones.
const durMult=m=>Math.max(0.25,Math.min(1.5,1-0.15*(m.lv-player.lvl)));
function applyAbility(a,t,fromHide){
  const L=player.lvl,mult=a.melee?meleeMult():spellMult();
  if(a.hpCost){const c=Math.round(maxHP(L)*a.hpCost);player.hp=Math.max(1,player.hp-c);floatText(player.x,player.y-20,'-'+c,'#a3252f');log(a.name+' costs you '+c+' health.','#c87a80')}
  // A Backstab from Hide never misses: they didn't see you coming.
  // An Evaded mob counts as an ambush too: Evade, then Backstab.
  if(a.kind==='backstab'&&t&&t.lost>0)fromHide=true;
  if(a.tgt&&a.kind!=='taunt'&&!(a.kind==='backstab'&&fromHide)&&rng()<resistChance(t)){
    floatText(t.x,t.y-18,a.melee?'MISS':'RESIST',a.melee?'#cfd6e0':'#c8a0ff');
    log(a.melee?'You miss '+t.def.name+' with '+a.name+'.':cap(t.def.name)+' resists your '+a.name+'!',a.melee?'#9aa':'#c8a0ff');engage(t);return;}
  if(a.kind==='nuke'||a.kind==='stun'){
    if(a.dash)dashTo(t); // Monk's Flying Kick: leap in first
    if(a.beam)beams.push({x1:player.x,y1:player.y-8,x2:t.x,y2:t.y-6,t:0,col:a.beam});
    burst(t.x,t.y-6,a.beam||a.col,6);
    let x=a.undead&&isUndead(t)?a.undead:1;
    // Shatter: huge on a frozen (rooted) mob and breaks the freeze; weak on anything else.
    if(a.shatter){if(t.root>0){t.root=0;floatText(t.x,t.y-28,'SHATTER!','#e6f6ff',true);burst(t.x,t.y-6,'#e6f6ff',16,true)}else x*=0.35}
    // Flurry: several quick hits in a row.
    for(let h=0;h<(a.hits||1)&&!t.dead;h++)hitMob(t,at(a.dmg)*rr(0.85,1.15)*(1-t.def.armor)*mult*x,a.shatter?'shatter':'direct',a.name);
    if(a.knock&&!t.dead&&!t.def.boss)knockBack(t,a.knock); // Dragon Strike
    if(a.petHeal&&pet&&!pet.charm){const h=Math.round(at(a.petHeal,a)*mult);pet.hp=Math.min(pet.maxhp,pet.hp+h);floatText(pet.x,pet.y-20,'+'+h,'#7dffa6')} // Elemental Lash
    // Chill: each Frost Bolt slows a bit more (up to 4 stacks), wearing off 8s after the last one.
    if(a.chill&&!t.dead){t.chill=Math.min(4,(t.chill||0)+1);t.chillT=8}
    if(a.kind==='stun'&&!t.dead){t.stun=at(a.dur,a)*durMult(t);log(cap(t.def.name)+' is stunned ('+t.stun.toFixed(1)+'s).','#9fb8e0')}
  }else if(a.kind==='heal'){const h=a.full?maxHP(L)-player.hp:Math.round(at(a.heal)*rr(0.9,1.1)*mult);player.hp=Math.min(maxHP(L),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#7dffa6');burst(player.x,player.y-6,a.col,12,true);log(a.name+' heals you for '+h+'.','#7dffa6');
    if(a.holy)holyPulse(Math.max(at(a.heal)*mult,h)*a.holy,a.name);}
  else if(a.kind==='hot'){player.hots=(player.hots||[]).filter(o=>o.id!==a.id);player.hots.push({id:a.id,name:a.name,t:at(a.dur,a),next:2,heal:at(a.heal,a)*mult,holy:a.holy||0});burst(player.x,player.y-6,a.col,10,true);log(a.name+' is on you ('+Math.round(at(a.dur,a))+'s).','#7dffa6');}
  else if(a.kind==='root'){t.root=at(a.dur,a)*durMult(t);burst(t.x,t.y,a.col,8);log(cap(t.def.name)+' is held by roots ('+Math.round(t.root)+'s).','#c8b07a');engage(t);}
  else if(a.kind==='snare'){if(a.dmg){if(a.beam)beams.push({x1:player.x,y1:player.y-8,x2:t.x,y2:t.y-6,t:0,col:a.beam});hitMob(t,at(a.dmg)*rr(0.85,1.15)*(1-t.def.armor)*mult,'direct',a.name);if(t.dead)return}
    t.snare=at(a.dur,a)*durMult(t);if(a.aslow){t.aslow=t.snare;t.aslowX=1.6}burst(t.x,t.y,a.col,8);log(cap(t.def.name)+' is slowed by your '+a.name+' ('+Math.round(t.snare)+'s).','#9fd0d0');engage(t);}
  else if(a.kind==='dot'){t.dots=t.dots.filter(d=>d.id!==a.id);const dur=at(a.dur,a)*durMult(t);t.dots.push({id:a.id,name:a.name,t:dur,next:3,dmg:at(a.dmg)*mult});burst(t.x,t.y-6,a.col,8,true);log(cap(t.def.name)+' is afflicted by '+a.name+' ('+Math.round(dur)+'s).','#9be37a');engage(t);}
  // Attack slow (Shaman's Drowsy): the mob swings slower but still runs at full speed.
  else if(a.kind==='slow'){t.aslow=at(a.dur,a)*durMult(t);t.aslowX=a.aslowX||1.4;burst(t.x,t.y-6,a.col,8);log(cap(t.def.name)+' grows drowsy: it attacks '+Math.round((1-1/t.aslowX)*100)+'% slower for '+Math.round(t.aslow)+'s (it still runs at full speed).','#9fd0d0');engage(t);}
  // Ranger's Hunter's Mark: your hits on it do more until it dies.
  else if(a.kind==='mark'){t.mark=a.mark||1.2;burst(t.x,t.y-10,a.col,8);floatText(t.x,t.y-26,'MARKED','#ffb37a');log(cap(t.def.name)+' is marked. Your hits on it do '+Math.round((t.mark-1)*100)+'% more.','#ffb37a');engage(t);}
  else if(a.kind==='buff'){player.buffs[a.buff]=at(a.dur,a);if(a.val){player.bval=player.bval||{};player.bval[a.buff]=at(a.val,a)*mult}burst(player.x,player.y-6,a.col,12,true);log(a.name+' is on you'+durTxt(player.buffs[a.buff])+'.','#c8b07a');}
  else if(a.kind==='lifetap'){
    beams.push({x1:player.x,y1:player.y-8,x2:t.x,y2:t.y-6,t:0,col:a.beam});burst(t.x,t.y-6,a.beam,6);
    const dmg=Math.max(1,Math.round(at(a.dmg)*rr(0.85,1.15)*(1-t.def.armor)*mult));hitMob(t,dmg,'direct',a.name);
    const h=Math.max(1,Math.round(dmg*LIFETAP_HEAL));player.hp=Math.min(maxHP(L),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#b48cff');}
  else if(a.kind==='backstab'){
    // x3 damage from Hide, x2 from behind.
    const x=fromHide?3:2;burst(t.x,t.y-6,a.col,fromHide?14:9);
    if(fromHide){floatText(t.x,t.y-28,'AMBUSH!','#ffd27a')}
    hitMob(t,at(a.dmg)*x*rr(0.9,1.1)*(1-t.def.armor)*mult,'direct',a.name+(fromHide?' (from hiding)':''));}
  else if(a.kind==='stealth'){player.buffs.hide=9999;burst(player.x,player.y-6,a.col,10,true);log('You melt into the shadows. Mobs won\'t notice you; attacking or getting hit ends it.','#bdbdbd');}
  else if(a.kind==='evade'){let n=0;const d=at(a.dur,a);
    fightingMe().forEach(m=>{m.threat.p=0;m.lost=m.def.boss?d*0.5:d;n++});
    burst(player.x,player.y-6,a.col,10,true);
    log('You slip away. '+n+(n===1?' foe loses':' foes lose')+' track of you for a moment: Hide now to escape, or get behind to Backstab.','#bdbdbd');}
  else if(a.kind==='pet'){raisePet(a.pet);}
  else if(a.kind==='mez'){t.mez=at(a.dur,a)*durMult(t);t.stun=0;if(pet&&pet.target===t)pet.target=null;burst(t.x,t.y-10,a.col,10,true);floatText(t.x,t.y-26,'Zz','#e0c3ff');log(cap(t.def.name)+' falls asleep ('+Math.round(t.mez)+'s). Anything that hits it wakes it.','#e0c3ff');}
  else if(a.kind==='charm'){charmMob(t,at(a.dur,a));}
  else if(a.kind==='taunt'){t.threat.p=Math.max(t.threat.p,t.threat.pet+40);engage(t);burst(t.x,t.y-8,a.col,8);floatText(t.x,t.y-26,'TAUNT','#ffb37a');log(cap(t.def.name)+' turns its attention to YOU.','#ffb37a');}
  else if(a.kind==='decoy'){decoy={x:player.x+12*player.dir,y:player.y,dir:player.dir,t:at(a.dur,a)};burst(decoy.x,decoy.y-6,a.col,14,true);log('A see-through copy of you appears. Nearby enemies attack it instead ('+Math.round(decoy.t)+'s).','#c8a0ff');}
  // Ground circles: at your feet (Consecrate, Venom Totem) or on your target (Volley). "all" = hurts any mob, not just undead.
  else if(a.kind==='ground'){const gx=a.tgt&&t?t.x:player.x,gy=a.tgt&&t?t.y:player.y;grounds.length=0;
    grounds.push({x:gx,y:gy,r:a.radius,t:at(a.dur,a),next:a.tick||1,every:a.tick||1,heal:a.heal?at(a.heal,a)*mult:0,dmg:at(a.dmg,a)*mult,all:!!a.all,totem:!!a.totem,name:a.name,col:a.col});
    burst(gx,gy,a.col,16,true);log(a.msg||'You consecrate the ground. Stand in it to heal; undead that step in burn.',a.col);if(a.tgt&&t)engage(t);}
  // Ranger's Spike Trap: set at your feet; the first mob to step in takes a big hit and bleeds. Two at most.
  else if(a.kind==='trap'){if(traps.length>=2)traps.shift();traps.push({x:player.x,y:player.y,t:60,dmg:at(a.dmg,a)*mult,bleed:at(a.bleed,a)*mult,name:a.name});burst(player.x,player.y,a.col,8);log('You set a '+a.name+' at your feet. Lead a mob over it.','#cfc8b2');}
  // Magician's Detonate: the pet blows up. Fire hits hardest; Earth hits less but stuns.
  else if(a.kind==='detonate'){const px=pet.x,py=pet.y,boom=pet.boom,st=pet.boomStun,nm=petName();
    pet=null;mobs.forEach(o=>{if(o.threat)o.threat.pet=0});burst(px,py-6,'#ff9a4a',22,true);log('Your '+nm+' explodes!','#ff9a4a');
    mobs.filter(m=>!m.dead&&Math.hypot(m.x-px,m.y-py)<=a.radius).forEach(m=>{hitMob(m,at(a.dmg)*boom*rr(0.85,1.15)*(1-m.def.armor)*mult,'direct',a.name);if(!m.dead&&st){m.stun=st*durMult(m);m.mez=0}});}
  // Magician's Burnout: a short pet buff (the pet attacks faster).
  else if(a.kind==='petbuff'){player.buffs[a.buff]=at(a.dur,a);burst(pet.x,pet.y-6,a.col,12,true);log('Your '+petName()+' surges with '+a.name+durTxt(player.buffs[a.buff])+'.',a.col);}
  // Shaman's Cannibalize: health for mana (the health was already paid above, through hpCost).
  else if(a.kind==='canni'){const g=Math.round(maxHP(L)*a.hpCost*(a.ratio||1.2));player.mp=Math.min(maxMP(L),player.mp+g);floatText(player.x+6,player.y-24,'+'+g+' mana','#7dbbff');burst(player.x,player.y-6,a.col,10,true);}
  // Bard songs: start playing. Two at once; a third replaces the oldest. They pulse every 3s on their own.
  else if(a.kind==='song'){player.songs=player.songs||[];if(player.songs.length>=2){const old=player.songs.shift();log('You stop playing '+ABI[old].name+'.','#9aa')}
    player.songs.push(a.id);if(!(player.songNext>0))player.songNext=3;songPulse(a,1);log('You start playing '+a.name+'.',a.col);}
  // Crescendo: both songs end in one big pulse of whatever they were.
  else if(a.kind==='crescendo'){const ss=player.songs.slice();player.songs=[];burst(player.x,player.y-6,a.col,20,true);floatText(player.x,player.y-30,'CRESCENDO!','#ffd27a',true);
    ss.forEach(id=>songPulse(ABI[id],a.power||4,true));}
  else if(a.kind==='blink'){
    // Disengage hops backward, away from the nearest thing fighting you (or your target).
    if(a.back){const m=fightingMe().sort((x,y)=>dist(x,player)-dist(y,player))[0]||player.target;if(m&&!m.dead){const dx=player.x-m.x,dy=player.y-m.y,d=Math.hypot(dx,dy)||1;player.fx=dx/d;player.fy=dy/d}}
    blink(a.range,a.back);burst(player.x,player.y-6,a.col,10,true);}
  else if(a.kind==='gate'){gateHome();}
  else if(a.kind==='petheal'){const h=Math.round(at(a.heal)*rr(0.9,1.1)*mult);pet.hp=Math.min(pet.maxhp,pet.hp+h);floatText(pet.x,pet.y-20,'+'+h,'#7dffa6');burst(pet.x,pet.y-6,a.col,10,true);log(a.name+' heals your '+petName()+' for '+h+'.','#7dffa6');}
  else if(a.kind==='fear'){t.fear=at(a.dur,a)*durMult(t);burst(t.x,t.y-6,a.col,10,true);log(cap(t.def.name)+' flees in terror ('+Math.round(t.fear)+'s).','#c8a0ff');engage(t);}
  // Feign Death. The Monk's version ("split") sends every mob home except your target, which keeps coming:
  // a pack becomes a single. With only one mob on you, it drops that one too (an escape).
  else if(a.kind==='feign'){player.cast=null;player.tx=null;let n=0;
    const fight=mobs.filter(m=>!m.dead&&m.state==='chase'),tg=player.target;
    const keep=a.split&&tg&&!tg.dead&&fight.length>1&&fight.indexOf(tg)>=0?tg:null;
    player.fd=keep?1.5:4;player.fdKeep=keep;
    fight.forEach(m=>{if(m===keep)return;m.threat.p=0;if(a.split){m.state='return';m.threat.pet=0;m.calm=10}n++}); // calm: won't notice you or rejoin for 10s
    log(keep?'You drop to the ground. Everything but '+keep.def.name+' loses interest and walks home.':'You fall to the ground, feigning death.'+(n?' Your foes lose interest in you.':''),'#bdbdbd');}
  // Area: hits every mob around you. Depending on the ability it also stuns (Color Flash), freezes (Frost Nova),
  // hits undead harder (Divine Strike) or heals you per mob hit (Dark Cleave).
  else if(a.kind==='cleave'){const hits=mobs.filter(m=>!m.dead&&dist(m,player)<=a.radius);burst(player.x,player.y-6,a.col,14);let healed=0;
    hits.forEach(m=>{if(rng()<resistChance(m)){floatText(m.x,m.y-18,a.melee?'MISS':'RESIST','#cfd6e0');engage(m);return}
      if(a.dmg)hitMob(m,at(a.dmg)*rr(0.85,1.15)*(1-m.def.armor)*mult*(a.undead&&isUndead(m)?a.undead:1),'direct',a.name);else engage(m);
      if(m.dead)return;
      if(a.stun){m.stun=at(a.stun,a)*durMult(m);m.mez=0}
      if(a.root){m.root=at(a.root,a)*durMult(m)}
      if(a.tapPer)healed+=at(a.tapPer,a)*mult;});
    if(a.stun&&hits.length)log('A flash of color stuns '+hits.length+(hits.length===1?' enemy.':' enemies.'),'#e8e2cf');
    if(a.root&&hits.length)log(hits.length+(hits.length===1?' enemy is':' enemies are')+' frozen in place.','#bfe6ff');
    if(healed>0){const h=Math.round(healed);player.hp=Math.min(maxHP(L),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#b48cff')}}
}

// Cleric's twist: holy power from a heal burns every undead fighting near you.
function holyPulse(amount,name){
  const near=mobs.filter(m=>!m.dead&&isUndead(m)&&m.state==='chase'&&dist(m,player)<=40);
  if(!near.length)return;
  burst(player.x,player.y-6,'#fff3c4',10,true);
  near.forEach(m=>hitMob(m,amount*rr(0.9,1.1)*(1-m.def.armor),'holy',name+' (holy)'));
}
// Bard songs: what one pulse does. power > 1 is Crescendo's big final pulse.
function songPulse(a,power,finale){
  const L=player.lvl,mult=spellMult(),r=a.radius||32;
  if(a.song==='heal'){const h=Math.round(at(a.heal,a)*mult*power);player.hp=Math.min(maxHP(L),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#7dffa6');
    if(pet&&!pet.charm)pet.hp=Math.min(pet.maxhp,pet.hp+h);}
  else if(a.song==='dmg'){mobs.filter(m=>!m.dead&&m.state==='chase'&&!(m.mez>0)&&dist(m,player)<=r).forEach(m=>hitMob(m,at(a.dmg,a)*mult*power*rr(0.9,1.1)*(1-m.def.armor),'song',a.name))}
  else if(a.song==='discord'){mobs.filter(m=>!m.dead&&dist(m,player)<=r).forEach(m=>{m.discord=3.5;if(finale&&!m.def.boss){m.stun=2*durMult(m);m.mez=0}})}
  else if(a.song==='speed'&&finale){player.buffs.sprint=6}
  else if(a.song==='haste'&&finale){const t=player.target;if(t&&!t.dead&&dist(t,player)<=20)hitMob(t,at(ABI[loadout[0]].dmg||[6,2.4])*meleeMult()*3*(1-t.def.armor),'direct',a.name)}
  if(power>1||a.song==='dmg'||a.song==='heal')burst(player.x,player.y-6,a.col,power>1?14:5,true);
}
// Monk's Flying Kick: leap toward the target, stopping next to it (or at a wall).
function dashTo(t){
  const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;let n=0;
  for(let s=2;s<=d-10;s+=2){if(blocked(player.x+dx/d*s,player.y+dy/d*s))break;n=s}
  player.x+=dx/d*n;player.y+=dy/d*n;player.tx=null;burst(player.x,player.y-6,'#ffd27a',6);
}
// Dragon Strike: shove the mob straight back from you, stopping at a wall.
function knockBack(m,px){
  const dx=m.x-player.x,dy=m.y-player.y,d=Math.hypot(dx,dy)||1;let n=0;
  for(let s=2;s<=px;s+=2){if(blocked(m.x+dx/d*s,m.y+dy/d*s))break;n=s}
  m.x+=dx/d*n;m.y+=dy/d*n;burst(m.x,m.y-6,'#ffd27a',6);
}
// Blink: a short teleport the way you last moved (or faced). Stops early at a wall.
function blink(range,back){
  const fx=player.fx||player.dir,fy=player.fy||0,d=Math.hypot(fx,fy)||1;let n=0;
  for(let s=2;s<=range;s+=2){const x=player.x+fx/d*s,y=player.y+fy/d*s;if(blocked(x,y))break;n=s}
  player.x+=fx/d*n;player.y+=fy/d*n;player.tx=null;
  log(back?'You hop back.':'You blink.','#c8e8ff');
}
// Gate: home to the Gate Road guards. Every fight ends (mobs forget you). In Dungeon 1 this leaves the run.
function gateHome(){
  log('You gate home to the Gate Road.','#c8a0ff');
  mobs.forEach(o=>{if(!o.dead&&o.state==='chase'){o.threat.p=0;o.state='return'}});
  if(zoneId!=='over')enterZone('over');
  player.x=3.5*T;player.y=15*T+8;player.target=null;
  if(pet){pet.x=player.x-10;pet.y=player.y+4;pet.target=null}
  burst(player.x,player.y-6,'#c8a0ff',16,true);
}

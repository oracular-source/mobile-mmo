// The living world: gate camp NPCs and critters, zone changes, portals and Boss 1's behaviour.
'use strict';
/* ---------- The gate camp: guards, peddler, campfire, signpost, critters ---------- */
const CAMPFIRE={x:118,y:190}, TORCHES=[{x:24,y:212},{x:24,y:284}];
const SIGN={x:264,y:206,name:'Signpost',text:'West: Town 1. East: the Sunken Graveyard and Dungeon 1. Turn back if the names glow red.'};
const npcs=[
  {kind:'guard',name:'Guard Hollis',x:46,y:214,hx:46,hy:214,dir:1,walk:0,target:null,atk:0},
  {kind:'guard',name:'Guard Bren',x:46,y:282,hx:46,hy:282,dir:1,walk:0,target:null,atk:0},
  {kind:'peddler',name:'Marrow the Peddler',x:94,y:188,hx:94,hy:188,dir:1,walk:0}
];
const LINES={
  guard:['Keep to the road, friend.','Pulled more than you can handle? Run back to the gate. We will deal with it.','The graveyard is no place for the green.','Watch the names. Red means run.','Quiet night. Too quiet.'],
  peddler:['Sit by my fire. Your mana comes back faster in the warmth.','They say Old Gnawbone ate a whole cart once. Wheels and all.','Rat whiskers, beetle shells, old bones... bring them to me, I buy it all.','Mind the dead after dark. They never tire.']
};
const bubbles=[];
// cd: seconds this speaker stays quiet afterward. Taps pass force=true so you always get an answer.
function say(o,text,force){
  const now=performance.now()/1000;
  if(!force&&o.quietUntil&&now<o.quietUntil)return;
  o.quietUntil=now+(force?3:20);
  for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].o===o)bubbles.splice(i,1);
  bubbles.push({o:o,text:text,t:0});log(o.name+' says, "'+text+'"','#d8c8ff');
}
let chatT=12;
function updateNPCs(dt){
  npcs.forEach(n=>{
    if(n.kind!=='guard')return;
    n.atk=Math.max(0,n.atk-dt);
    if(n.target&&(n.target.dead||Math.hypot(n.target.x-n.hx,n.target.y-n.hy)>180))n.target=null;
    // Guards attack any mob chasing you that comes near them: run to the gate when you over-pull.
    if(!n.target){const m=mobs.find(m=>!m.dead&&m.state==='chase'&&dist(m,n)<75&&Math.hypot(m.x-n.hx,m.y-n.hy)<170);if(m){n.target=m;say(n,pick(['For the gate!','Back, vermin!','I have this one!']))}}
    if(n.target){const t=n.target;if(dist(n,t)>12)moveToward(n,t.x,t.y,44,dt);else{n.dir=t.x>n.x?1:-1;if(n.atk<=0){n.atk=1.2;burst(t.x,t.y-6,'#cfd6e0',4);hitMob(t,22+rr(0,8),'melee',n.name,'npc')}}}
    else if(Math.hypot(n.x-n.hx,n.y-n.hy)>2)moveToward(n,n.hx,n.hy,30,dt);
  });
  chatT-=dt;
  if(chatT<=0){chatT=rr(22,38);const near=npcs.filter(n=>dist(n,player)<120);if(near.length){const n=pick(near);say(n,pick(LINES[n.kind]))}}
  for(let i=bubbles.length-1;i>=0;i--){bubbles[i].t+=dt;if(bubbles[i].t>4)bubbles.splice(i,1)}
}
const nearFire=()=>Math.hypot(player.x-CAMPFIRE.x,player.y-CAMPFIRE.y)<48;

// Critters: crows on the road that scatter, frogs at the pond, fireflies.
const critters=[],flies=[];
function roadSpot(){const tx=4+Math.floor(rnd()*32);return{x:tx*T+rnd()*16,y:roadY(tx)*T+4+rnd()*24}}
for(let i=0;i<5;i++){const p=roadSpot();critters.push({kind:'crow',x:p.x,y:p.y,hx:p.x,hy:p.y,fly:0,vx:0,vy:0,hide:0,dir:1,pk:rr(0,3)})}
for(let i=0;i<4;i++){const an=rnd()*Math.PI*2;let x=12*T+8+Math.cos(an)*5.2*T,y=6*T+8+Math.sin(an)*3.6*T;if(blocked(x,y)){x+=Math.cos(an)*12;y+=Math.sin(an)*10}
  critters.push({kind:'frog',x:x,y:y,hx:x,hy:y,hop:rr(1,4),hide:0,dir:1})}
for(let i=0;i<16;i++){const nearPond=i<9;flies.push({x:nearPond?12*T+rnd()*7*T-3*T:4*T+rnd()*30*T,y:nearPond?6*T+rnd()*5*T-2*T:3*T+rnd()*24*T,ph:rnd()*6.28,sp:0.4+rnd()*0.6})}
function updateCritters(dt){
  critters.forEach(c=>{
    if(c.hide>0){c.hide-=dt;if(c.hide<=0){if(c.kind==='crow'){const p=roadSpot();c.x=c.hx=p.x;c.y=c.hy=p.y;c.fly=0}else{c.x=c.hx;c.y=c.hy}}return}
    const d=Math.hypot(c.x-player.x,c.y-player.y);
    if(c.kind==='crow'){
      if(!c.fly&&d<30){c.fly=1;c.t=0;c.vx=(c.x>player.x?1:-1)*rr(22,36);c.vy=-rr(26,40);c.dir=c.vx>0?1:-1}
      if(c.fly){c.t+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.t>2.5)c.hide=rr(25,45)}
      else{c.pk-=dt;if(c.pk<=0){c.pk=rr(1,3);c.dir*=-1}}
    }else{
      if(d<24){c.hide=rr(8,14);burst(c.x,c.y,'#6fa0b8',6);return}
      c.hop-=dt;if(c.hop<=0){c.hop=rr(2,5);const nx=c.hx+rr(-8,8),ny=c.hy+rr(-5,5);if(!blocked(nx,ny)){c.dir=nx>c.x?1:-1;c.x=nx;c.y=ny}}
    }
  });
}
function drawCamp(){
  // Campfire logs and stones (the flame is drawn after lighting so it glows).
  const fx=CAMPFIRE.x,fy=CAMPFIRE.y;
  lx.fillStyle='#55585f';[[-6,1],[-4,3],[0,4],[4,3],[6,1],[4,-1],[-4,-1]].forEach(p=>lx.fillRect(fx+p[0],fy+p[1],2,1));
  lx.fillStyle='#3b2a1d';lx.fillRect(fx-4,fy,8,2);lx.fillRect(fx-2,fy-1,4,1);
  // Peddler's stall: a small cart.
  lx.fillStyle='#0b0a0f';lx.fillRect(70,182,16,9);lx.fillStyle='#6e4a2a';lx.fillRect(71,183,14,6);lx.fillStyle='#5a3d6b';lx.fillRect(70,178,16,4);
  lx.fillStyle='#0b0a0f';lx.fillRect(72,190,3,3);lx.fillRect(81,190,3,3);
  // Signpost.
  const sx=SIGN.x,sy=SIGN.y;lx.fillStyle='#3b2a1d';lx.fillRect(sx,sy-10,2,10);
  lx.fillStyle='#0b0a0f';lx.fillRect(sx-6,sy-15,14,7);lx.fillStyle='#6e4a2a';lx.fillRect(sx-5,sy-14,12,5);
  lx.fillStyle='#cfc8b2';lx.fillRect(sx-3,sy-13,7,1);lx.fillRect(sx-3,sy-11,5,1);lx.fillRect(sx+5,sy-12,1,1);
  // Torch brackets on the wall.
  TORCHES.forEach(t=>{lx.fillStyle='#3b2a1d';lx.fillRect(t.x-1,t.y,3,6);lx.fillStyle='#55585f';lx.fillRect(t.x-2,t.y,5,1)});
}
function drawCritters(){
  critters.forEach(c=>{if(c.hide>0)return;
    if(c.kind==='crow'){const img=c.fly?IMG.crowfly:IMG.crow;const flap=c.fly&&Math.floor(time*10)%2;drawSprite(img,c.x,c.y+(flap?1:0),c.dir,0,false)}
    else drawSprite(IMG.frog,c.x,c.y,c.dir,0,false);
  });
}
// Drawn after lighting, so they glow in the dark.
function drawGlows(){
  const flame=(x,y,big)=>{const k=Math.floor(time*8)%3;lx.fillStyle='#e0611f';lx.fillRect(x-1,y-4-(k===1?1:0),3,4);if(big){lx.fillRect(x-2,y-2,5,2)}lx.fillStyle='#ffb347';lx.fillRect(x,y-3,1,2);if(k!==2){lx.fillStyle='#ffe9a8';lx.fillRect(x,y-2,1,1)}};
  lx.save();lx.translate(-camX,-camY);
  const CA=curArea();if(CA){const A=CA;A.flames.forEach(f=>{if(f.tiny){const k=Math.floor(time*6+f.x)%3;lx.fillStyle='#ffb347';lx.fillRect(f.x,f.y-2-(k===1?1:0),1,2);lx.fillStyle='#ffe9a8';lx.fillRect(f.x,f.y-1,1,1)}else if(f.lamp){lx.fillStyle=Math.floor(time*5)%4?'#ffd27a':'#ffb347';lx.fillRect(f.x+4,f.y-4,2,3)}else flame(f.x,f.y,f.big)});
    // Cold motes drifting up out of the crypt mouth.
    A.objs.forEach(o=>{if(o.kind!=='crypt_mouth')return;const cx=o.x*T+o.w*T/2,cy=(o.y+o.h)*T-8;for(let i=0;i<4;i++){const ph=(time*0.6+i/4)%1;lx.fillStyle=i%2?'#6f8fe0':'#b9cbbf';lx.fillRect(Math.round(cx-8+i*5+Math.sin(time+i)*2),Math.round(cy-ph*22),1,1)}});
    // Dust turning in the daylight shafts (rat tunnel) and rising out of the sinkhole (crossroads).
    (A.motes||[]).forEach((m,j)=>{for(let i=0;i<5;i++){const ph=(time*0.25+i/5+j*0.13)%1;lx.fillStyle=i%2?'#c8c0a8':'#8f8a76';lx.fillRect(Math.round(m.x-6+i*3+Math.sin(time*0.7+i+j)*3),Math.round(m.y-ph*26),1,1)}});
    A.objs.forEach(o=>{if(o.kind!=='sinkhole')return;const cx=o.x*T+o.w*T/2,cy=o.y*T+o.h*T/2;for(let i=0;i<6;i++){const ph=(time*0.35+i/6)%1;lx.fillStyle=i%2?'#8a7a62':'#6a5c4a';lx.fillRect(Math.round(cx-14+i*5+Math.sin(time*0.8+i)*3),Math.round(cy+2-ph*30),1,1)}});
    lx.restore();return}
  if(zoneId!=='over'){(zoneId==='arena'?ARENA:DUN).braziers.forEach(b=>flame(b.x,b.y-1,true));lx.restore();return}
  flame(CAMPFIRE.x,CAMPFIRE.y,true);
  TORCHES.forEach(t=>flame(t.x,t.y,false));
  if(rng()<0.3)parts.push({x:CAMPFIRE.x+rr(-2,2),y:CAMPFIRE.y-5,vx:rr(-3,3),vy:-rr(10,18),t:0,life:0.8,col:'#ffb347'});
  if(Math.floor(time*2)%2){lx.fillStyle='#b48cff';lx.fillRect(DOOR.x-1,DOOR.y-6,1,1);lx.fillRect(DOOR.x+1,DOOR.y-9,1,1)}
  flies.forEach(f=>{const x=f.x+Math.sin(time*f.sp+f.ph)*10,y=f.y+Math.cos(time*f.sp*1.3+f.ph)*6;if(Math.sin(time*2.2+f.ph*3)>0.2){lx.fillStyle='#d8ff8a';lx.fillRect(Math.round(x),Math.round(y),1,1)}});
  lx.restore();
}

/* ---------- Zones: the overworld and the Dungeon 1 instance ---------- */
let promptAction=null;
// Stats for the current dungeon run, shown on the ending screen.
const run={t0:0,kills:0,xp:0,loot:[],chest:null,portal:null};
function finishRun(){
  const secs=Math.round(time-run.t0),mm=Math.floor(secs/60),ss=String(secs%60).padStart(2,'0');
  const loot=run.loot.filter(n=>!/Whisker|Shell|Bone|Rag/.test(n));
  prompt('Dungeon 1 complete','Time '+mm+':'+ss+' · '+run.kills+' kills · '+run.xp+' XP. Gear found: '+(loot.length?loot.join(', '):'none this run')+'.','Return to the graveyard',()=>enterZone('gy'));
}
function prompt(title,text,yes,action){$('ptitle').textContent=title;$('ptext').textContent=text;$('pyes').textContent=yes;promptAction=action;openModal('promptUI')}
$('pyes').addEventListener('click',()=>{$('promptUI').classList.remove('show');running=true;if(promptAction)promptAction();promptAction=null});
// A free spot a couple of tiles from an exit (not on it, so you don't trigger it again on arrival).
function areaSpot(A,ex){
  for(const [dx,dy] of [[0,2],[0,-2],[2,0],[-2,0],[0,3],[0,-3],[3,0],[-3,0],[2,2],[-2,2],[2,-2],[-2,-2]]){const x=ex.tx+dx,y=ex.ty+dy;
    if(x>=0&&y>=0&&x<A.w&&y<A.h&&A.map[y][x]===0)return{x:x*T+8,y:y*T+8}}
  return A.start||null}
// from: the map key of the area you came from, so you arrive at the matching exit (up the crypt stairs -> crypt mouth).
function enterZone(id,from,at){
  if(MM.dirty&&!simState.busy)mmSave(); // keep what you explored in the area you're leaving
  zoneId=id;const A=curArea();
  if(id==='dun'){map=DUN.map;MW=DUN.w;MH=DUN.h;world=DUN.world;spawns=dunSpawns();}
  else if(id==='arena'){map=ARENA.map;MW=ARENA.w;MH=ARENA.h;world=ARENA.world;spawns=[];}
  else if(A){map=A.map;MW=A.w;MH=A.h;world=A.world;spawns=A.spawns;}
  else{map=overMap;MW=40;MH=30;world=overWorld;spawns=overSpawns;}
  WW=MW*T;WH=MH*T;
  mobs.length=0;spawns.forEach(sp=>{sp.mob=null;sp.timer=0;spawn(sp)});
  if(A&&A.rare){A.rare.sp.mob=null;if(A.rare.sp.up)spawn(A.rare.sp)} // a rare still out there waits for you (no reroll by walking in and out)
  player.target=null;player.tx=null;player.cast=null;player.queued=null;bubbles.length=0;parts.length=0;floats.length=0;
  if(id==='dun'){run.t0=time;run.kills=0;run.xp=0;run.loot=[];run.chest=null;run.portal=null;player.x=DUN.start.x;player.y=DUN.start.y;log('You enter Dungeon 1. The air is cold and still.','#c8a0ff');floatText(player.x,player.y-30,'Dungeon 1','#c8a0ff',true)}
  else if(id==='arena'){player.x=ARENA.start.x;player.y=ARENA.start.y;log('Testing grounds. Spawn mobs from the DEV panel.','#ff8a80')}
  else if(A){const ex=(at&&A.exits.find(e=>e.name===at))||(from&&A.exits.find(e=>e.to===from)),p=ex?areaSpot(A,ex):A.start;player.x=p.x;player.y=p.y;player.atExit=ex||null;player.atSummon=null;
    const col=(AREA_TINT[A.tint]||{}).text||'#9fd8c0';
    log(id==='crypt'?'You descend the stairs into the crypt. Cold blue light, and the smell of old bone.':from==='crypt'?'You climb back up into the Sunken Graveyard.':from==='rat_tunnel'?'You climb out of the dark into the open air.':A.enter||('You stand in the '+A.name+'.'),col);
    floatText(player.x,player.y-30,A.name,col,true)}
  else{player.x=DOOR.x;player.y=DOOR.y+22;log('You climb back out into the graveyard.','#9aa')}
  if(pet&&pet.charm)pet=null; // a charmed mob belongs to the zone you left
  if(pet){pet.x=player.x-10;pet.y=player.y+4;pet.target=null;}
  decoy=null;grounds.length=0;traps.length=0;
  player.onTile=tileAt(player.x,player.y);
}
/* ---------- Summoning a named (v0.31) ---------- */
// At a named's spot (the crypt throne, Gnawbone's bone pile) you can call it back if it isn't up, so a trip is never wasted.
// It takes one of the area's key items (dropped by the mobs there), used up; no cooldown (owner, Nov 17).
const SUMMON_TEXT={
  throne:{hint:'The throne sits empty. A crown shard from the crypt\'s skeletons could call its king back.',act:'You set the crown shard on the throne. The bones in the dark begin to stir...'},
  gnaw_pile:{hint:'A heap of gnawed bones. A severed paw from the tunnel rats might draw out whatever made it.',act:'You toss the severed paw onto the bones. Something huge scrabbles in the walls...'}};
function keyCount(id){return inv.bags.reduce((n,b)=>n+(b&&b.id===id?b.n:0),0)}
function useKey(id){const i=inv.bags.findIndex(b=>b&&b.id===id);if(i<0)return false;if(--inv.bags[i].n<=0)inv.bags[i]=null;saveInv();return true}
// Standing in the ring of floor around the object (one tile out from its footprint).
function summonAt(A,tx,ty){return A.named.find(n=>n.obj&&n.key&&tx>=n.obj.x-1&&tx<=n.obj.x+n.obj.w&&ty>=n.obj.y-1&&ty<=n.obj.y+n.obj.h)}
function offerSummon(n){
  const def=TYPES[n.sp.type],key=ITEMS[n.key],txt=SUMMON_TEXT[n.summon]||{},have=keyCount(n.key);
  if(n.sp.mob&&!n.sp.mob.dead){log(def.name+' is already here.','#9aa');return}
  if(!have){log(txt.hint||('You need a '+key.name.toLowerCase()+' to summon '+def.name+'.'),'#c8b89a');return}
  prompt('Summon '+def.name+'?','Uses one '+key.name+' (you have '+have+'). It comes out fighting.','Summon',()=>doSummon(n));
}
function doSummon(n){
  if((n.sp.mob&&!n.sp.mob.dead)||!useKey(n.key))return;
  log((SUMMON_TEXT[n.summon]||{}).act||'You use the '+ITEMS[n.key].name+'.','#e8c060');
  const m=spawn(n.sp);n.sp.timer=0;
  burst(m.x,m.y-8,'#e8c060',18,true);floatText(m.x,m.y-34,m.def.name,'#ff9de2',true);
  log(m.def.name+' appears!','#ff8a80');
}
// Walking up to the object offers the summon once per approach; tapping it while you stand there offers it again.
function checkSummon(A){const n=summonAt(A,Math.floor(player.x/T),Math.floor(player.y/T))||null;
  if(n!==player.atSummon){player.atSummon=n;if(n)offerSummon(n)}}
function tapSummon(wx,wy){const A=curArea();if(!A)return false;
  const n=A.named.find(n=>n.obj&&n.key&&wx>=n.obj.x*T&&wx<(n.obj.x+n.obj.w)*T&&wy>=n.obj.y*T-8&&wy<(n.obj.y+n.obj.h)*T);
  if(!n)return false;if(player.atSummon===n){offerSummon(n);return true}return false} // not there yet: the tap just walks you over
// Step onto the crypt door or the exit circle to get a prompt (once per step onto it).
function checkPortals(){
  if(zoneId==='dun'&&run.chest&&!run.chest.open&&dist(player,run.chest)<12){run.chest.open=true;burst(run.chest.x,run.chest.y-4,'#ffd27a',16,true);
    const c=20+Math.floor(rr(0,15));inv.copper+=c;log('You open the chest: '+c+' copper.','#c9a227','loot');(run.chest.items||[pick(UNCOMMONS)]).forEach((id,i)=>giveItem(id,1,i));saveInv();}
  if(zoneId==='dun'&&run.portal){const near=dist(player,run.portal)<10;if(near&&!run.atPortal)finishRun();run.atPortal=near;}
  const A=curArea();
  if(A){checkSummon(A);checkChests(A);const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T),ex=A.exits.find(e=>Math.abs(e.tx-tx)<=1&&Math.abs(e.ty-ty)<=1&&(e.tx===tx||e.ty===ty));
    if(ex!==player.atExit){player.atExit=ex;if(ex){
      // Built areas link straight through (the crypt is open and shared, so mobs chasing you just stay behind).
      if(ZONE_OF[ex.to]){if(inCombat())log('You can not leave while something is chasing you.','#ff8a80');else enterZone(ZONE_OF[ex.to],A.id,ex.at)}
      else if(ex.to==='town1')log('The road south leads to Town 1. It is not built yet.','#9aa');
      else if(ex.to==='wolfwood'||ex.to==='wolfwood_edge')log('The way ahead leads into Wolfwood. It is not built yet.','#9aa');
      else log('This way is not built yet.','#9aa');}}
    return}
  const t=tileAt(player.x,player.y);
  if(t!==player.onTile){player.onTile=t;
    if(t===10)prompt('Dungeon 1','A crypt for levels 4 to 7, sized for one player. Boss 1 waits at the end. Anything you pull will chase you until one of you dies.','Enter',()=>enterZone('dun'));
    if(t===8&&zoneId==='arena'){prompt('Leave the testing grounds?','Back to the crossroads.','Leave',()=>enterZone('cross'));}
    else if(t===8){if(inCombat())log('You can not leave while something is chasing you.','#ff8a80');else prompt('Leave Dungeon 1?','Leaving from the entrance resets the dungeon. Anything still alive will be back next time.','Leave',()=>enterZone('gy'));}
  }
}
// Boss 1: casts a shadow bolt (a 2s cast you can see coming) and calls two skeletons at half health.
// Counters: stun or fear it mid-cast (Evade and Feign Death also break it off), or be out of range,
// Deflecting or inside Divine Aura when it lands. While casting it stands still. Returns true while casting.
// An attack slow on it slows the casting too (cast bar fills slower, longer wait between bolts).
const BOLT={first:3,every:5,cast:2,range:110}; // first cast after 3s, then 5s between casts: one bolt about every 7s
// A stun, fear, sleep, Evade or Feign Death (or the fight ending) breaks off a boss's cast.
function interruptCast(m){if(!m.casting)return;m.casting=null;m.bolt=BOLT.every;floatText(m.x,m.y-34,'Interrupted!','#9fb8e0');log(cap(m.def.name)+"'s spell is interrupted!",'#9fb8e0')}
function bossThink(m,dt){
  // The Enchanter's Slow Mind slows its spellcasting too: longer casts, longer gaps. The Shaman's Drowsy only slows attacks (v0.24).
  if(m.aslow>0&&m.slowCast)dt/=(m.aslowX||1.6);
  if(m.casting){m.casting.t+=dt;
    if(m.casting.t<m.casting.dur)return true;
    m.casting=null;m.bolt=BOLT.every;
    if(dist(m,player)>BOLT.range){floatText(player.x,player.y-20,'MISS','#c8a0ff');log('The shadow bolt falls short. You were out of range.','#9fb8e0');return false}
    beams.push({x1:m.x,y1:m.y-20,x2:player.x,y2:player.y-8,t:0,col:'#b48cff'});burst(player.x,player.y-8,'#b48cff',8);
    if(player.buffs.deflect>0){floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You dodge the shadow bolt.','#9fb8e0');return false}
    let dmg=tankMods((8+2*m.lv)*rr(0.85,1.15));dmg=Math.max(1,Math.round(dmg));if(dev.god)dmg=0;dmg=Math.round(shieldDmg(dmg));player.hp-=dmg;if(dmg>0)floatText(player.x,player.y-20,String(dmg),'#c8a0ff');log('Boss 1 hurls a shadow bolt at YOU for '+dmg+'.','#c8a0ff');if(player.hp<=0&&!lastStand())playerDie(m);
    return false}
  m.bolt=(m.bolt===undefined?BOLT.first:m.bolt)-dt;
  if(m.bolt<=0&&dist(m,player)<BOLT.range){m.casting={name:'Shadow Bolt',t:0,dur:BOLT.cast};floatText(m.x,m.y-34,'Shadow Bolt!','#c8a0ff');
    log('Boss 1 begins casting Shadow Bolt! Stun or fear it, or get out of range.','#c8a0ff');return true}
  if(!m.added&&m.hp<m.maxhp/2){m.added=true;log('Boss 1 calls the dead to its side!','#ffb37a');
    [[-18,6],[18,6]].forEach(o=>{const sp={type:'cskel',x:m.x+o[0],y:m.y+o[1],timer:0,mob:null,group:null,lv:[5,5],noRespawn:true};if(blocked(sp.x,sp.y)){sp.x=m.x;sp.y=m.y}const a=spawn(sp);a.state='chase';burst(a.x,a.y-6,'#b48cff',8)})}
  return false;
}

// A named with adds (Old Gnawbone): at each share of health it squeals and rats burrow out of the nearest holes in the walls.
// Seen coming: the squeal and a puff of dirt at each hole before the rats join the fight. Holes come from the map (h tiles).
function namedAdds(m){
  const list=m.def.adds;m.addsDone=m.addsDone||0;
  while(m.addsDone<list.length&&m.hp<=m.maxhp*list[m.addsDone].at){
    const a=list[m.addsDone++],A=curArea(),holes=(A?A.holes:[]).filter(h=>Math.hypot(h.x-m.x,h.y-m.y)<160).sort((p,q)=>Math.hypot(p.x-m.x,p.y-m.y)-Math.hypot(q.x-m.x,q.y-m.y));
    floatText(m.x,m.y-26,a.shout||'SQUEAL!','#ffb37a',true);log(cap(m.def.name)+' '+(a.say||'squeals, and rats pour out of the walls!'),'#ffb37a');
    if(a.from==='ground')holes.length=0; // rising from the earth beside it, not out of wall holes
    for(let i=0;i<a.n;i++){const h=holes[i%Math.max(1,holes.length)],sp={type:a.type,x:h?h.x:m.x+(i?16:-16),y:h?h.y:m.y+6,timer:0,mob:null,group:null,lv:[a.lv,a.lv],noRespawn:true};
      if(blocked(sp.x,sp.y)){sp.x=m.x;sp.y=m.y}const r=spawn(sp);r.state='chase';burst(r.x,r.y-4,a.col||'#5a4836',10,true)}
  }
}

/* ---------- Named rares (v0.32) ---------- */
// About 1 in 100 spawns in an area brings out that area's rare, at its own spot off the main path (owner, Nov 17).
// Rolled when a mob respawns, not when you walk in, so leaving and coming back can't fish for it. Only one out at a time.
const RARE_CHANCE=0.01;
const RARE_TEXT={ironshell:'Something big and heavy shifts in the marsh reeds.',palerat:'A thin, high squeak echoes from somewhere off the warren.',bride:'A woman\'s sobbing drifts across the graves.'};
function rollRare(A){if(!A||!A.rare||A.rare.sp.up||rng()>=RARE_CHANCE)return;spawnRare(A)}
function spawnRare(A){const sp=A.rare.sp;if(sp.mob&&!sp.mob.dead)return sp.mob;sp.up=true;const m=spawn(sp);
  log(RARE_TEXT[sp.type]||'Something rare stirs nearby.',(AREA_TINT[A.tint]||{}).text||'#c8a0ff');return m}
// The Pale Rat: at low health it runs for the nearest mob that isn't fighting yet and brings it, and anything idle around it, back with it.
// Seen coming: it shouts and turns tail. A snare or root stops the run (it's fast, so slow it first). Returns true while running.
function rareCall(m,dt,spd){
  if(m.called||m.hp>m.maxhp*m.def.callAt)return false;
  if(!m.friend){m.friend=mobs.filter(o=>o!==m&&!o.dead&&o.state==='idle'&&Math.hypot(o.x-m.x,o.y-m.y)<220).sort((p,q)=>Math.hypot(p.x-m.x,p.y-m.y)-Math.hypot(q.x-m.x,q.y-m.y))[0]||null;
    if(!m.friend){m.called=true;return false}
    floatText(m.x,m.y-20,'flees!','#ffb37a');log(cap(m.def.name)+' turns tail and runs, squeaking for help!','#ffb37a')}
  const f=m.friend;
  if(f.dead||f.state!=='idle'||Math.hypot(f.x-m.x,f.y-m.y)<20){m.called=true;
    mobs.filter(o=>o!==m&&!o.dead&&o.state==='idle'&&Math.hypot(o.x-m.x,o.y-m.y)<48).forEach(o=>{engage(o);log(cap(o.def.name)+' answers the call!','#ffb37a')});
    return false}
  if(spd>0)moveToward(m,f.x,f.y,spd,dt);return true}

/* ---------- Hidden chests (v0.32) ---------- */
// Walk up to one to open it: some copper and one piece of gear your class can use (odds by area in CHEST_ODDS).
// It fills again after CHEST_REFILL seconds of play (kept for this session only; a reload fills every chest).
function checkChests(A){A.chests.forEach(ch=>{
  if(ch.open&&time-ch.at>=CHEST_REFILL)ch.open=false;
  const near=Math.hypot(player.x-ch.x,player.y-ch.y)<14;
  if(near&&!ch.near){if(ch.open){const mins=Math.max(1,Math.ceil((CHEST_REFILL-(time-ch.at))/60));log('The chest is empty. It looks like someone refills it now and then (about '+mins+' min).','#9aa')}else openChest(A,ch)}
  ch.near=near})}
function openChest(A,ch){
  const o=CHEST_ODDS[A.id]||CHEST_ODDS.crossroads,r=rng();
  let pool=r<o.rare?RARES:r<o.rare+o.unc?UNCOMMONS:COMMONS;if(!pool.length)pool=UNCOMMONS.length?UNCOMMONS:COMMONS;
  ch.open=true;ch.at=time;burst(ch.x,ch.y-4,'#ffd27a',16,true);
  const c=Math.floor(rr(o.cu,o.cu*2));inv.copper+=c;log('You open a hidden chest: '+c+' copper.','#c9a227','loot');
  if(pool.length)giveItem(pick(pool),1,0);saveInv()}

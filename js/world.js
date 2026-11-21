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
    if(n.target){const t=n.target;if(dist(n,t)>12)pathTo(n,t.x,t.y,44,dt);else{n.dir=t.x>n.x?1:-1;if(n.atk<=0){n.atk=1.2;burst(t.x,t.y-6,'#cfd6e0',4);hitMob(t,22+rr(0,8),'melee',n.name,'npc')}}}
    else if(Math.hypot(n.x-n.hx,n.y-n.hy)>2)pathTo(n,n.hx,n.hy,30,dt);
  });
  chatT-=dt;
  if(chatT<=0){chatT=rr(22,38);const near=npcs.filter(n=>dist(n,player)<120);if(near.length){const n=pick(near);say(n,pick(LINES[n.kind]))}}
  for(let i=bubbles.length-1;i>=0;i--){bubbles[i].t+=dt;if(bubbles[i].t>4)bubbles.splice(i,1)}
}
// Any campfire: the old Gate Road one, or a campfire in a map-file area (the crossroads). v0.38: areas count too.
// The chapel road's wayside shrine (v0.62) is a rest spot too.
const nearFire=()=>{const A=curArea();if(A)return A.flames.some(f=>f.camp&&Math.hypot(player.x-f.x,player.y-f.y)<48)||(A.rests||[]).some(r=>Math.hypot(player.x-r.x,player.y-r.y)<44);return zoneId==='over'&&Math.hypot(player.x-CAMPFIRE.x,player.y-CAMPFIRE.y)<48};

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
    drawCritterGlows(A);
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
const run={t0:0,kills:0,xp:0,loot:[],chest:null,portal:null,cryptT0:null}; // cryptT0: when you came down the crypt stairs (for "Crypt cleared in m:ss")
function finishRun(){
  const secs=Math.round(time-run.t0),mm=Math.floor(secs/60),ss=String(secs%60).padStart(2,'0');
  const loot=run.loot;
  const A=curArea();
  // Dungeon 1 (v0.63): the way out of Malrec's sanctum takes you back to the chapel door.
  if(A&&A.instance)prompt(A.name+' complete','Time '+mm+':'+ss+' · '+run.kills+' kills · '+run.xp+' XP. Gear found: '+(loot.length?loot.join(', '):'none this run')+'.','Back to the chapel grounds',()=>{const ex=A.exits.find(e=>e.name===MAPS[A.id].start)||A.exits[0];enterZone(ZONE_OF[ex.to],A.id,ex.at)});
  else prompt('Dungeon 1 complete','Time '+mm+':'+ss+' · '+run.kills+' kills · '+run.xp+' XP. Gear found: '+(loot.length?loot.join(', '):'none this run')+'.','Return to the graveyard',()=>enterZone('gy'));
}
// Never pause (v0.56): the prompt is a strip under the cast bar and the world keeps running. It remembers where you
// stood; walk away (about two tiles) or change area and it cancels, so it never hangs around stale.
let promptAt=null;
function prompt(title,text,yes,action){$('ptitle').textContent=title;$('ptext').textContent=text;$('pyes').textContent=yes;promptAction=action;promptAt={x:player.x,y:player.y,z:zoneId};$('promptUI').classList.add('show')}
function closePrompt(){$('promptUI').classList.remove('show');promptAction=null;promptAt=null}
function promptWatch(){if(promptAt&&(promptAt.z!==zoneId||Math.hypot(player.x-promptAt.x,player.y-promptAt.y)>2*T))closePrompt()}
$('pyes').addEventListener('click',()=>{const a=promptAction;closePrompt();if(a)a()});
$('pno').addEventListener('click',closePrompt);
// A free spot a couple of tiles from an exit (not on it, so you don't trigger it again on arrival).
// dir (v0.41): the way you were walking. You come out on that side of the exit so you keep walking away from it, not back in.
function areaSpot(A,ex,dir){
  let offs=[[0,2],[0,-2],[2,0],[-2,0],[0,3],[0,-3],[3,0],[-3,0],[2,2],[-2,2],[2,-2],[-2,-2]];
  if(dir&&(dir.x||dir.y)){const d=Math.hypot(dir.x,dir.y);offs=offs.map((o,i)=>[o,i]).sort((a,b)=>{const s=o=>(o[0]*dir.x+o[1]*dir.y)/(d*Math.hypot(o[0],o[1]));return (s(b[0])-s(a[0]))||(a[1]-b[1])}).map(o=>o[0])}
  for(const [dx,dy] of offs){const x=ex.tx+dx,y=ex.ty+dy;
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
  else if(A){const ex=(at&&A.exits.find(e=>e.name===at))||(from&&A.exits.find(e=>e.to===from)),p=ex?areaSpot(A,ex,player.lastMove):A.start;player.x=p.x;player.y=p.y;player.atExit=ex||null;player.exitGuard=ex||null;player.exitGuardT=time;player.atSummon=null;
    const col=(AREA_TINT[A.tint]||{}).text||'#9fd8c0';
    log(id==='crypt'&&from==='wolfwood'?'You duck into the old tunnel. It slopes down into cold blue light.':id==='crypt'?'You descend the stairs into the crypt. Cold blue light, and the smell of old bone.':from==='crypt'&&id==='wolf'?'You climb out of the tunnel into a hillside of mossy boulders. Firs all around.':from==='crypt'?'You climb back up into the Sunken Graveyard.':from==='rat_tunnel'?'You climb out of the dark into the open air.':A.enter||('You stand in the '+A.name+'.'),col);
    floatText(player.x,player.y-30,A.name,col,true)}
  else{player.x=DOOR.x;player.y=DOOR.y+22;log('You climb back out into the graveyard.','#9aa')}
  run.cryptT0=id==='crypt'?time:null;
  slowArea=A&&A.slow&&A.slow.indexOf(1)>=0?A:null; // flood water slows wading (fx.js moveToward)
  // An instance (v0.63, Dungeon 1): a fresh run every time you walk in. The stairs are sealed again, its chests are full,
  // and the run clock and tally start (shown on the way out).
  if(A&&A.instance){sealArea(A);A.chests.forEach(ch=>{ch.open=false;ch.near=false});A.seals.forEach(sl=>sl.near=false);
    run.t0=time;run.kills=0;run.xp=0;run.loot=[];run.chest=null;run.portal=null;run.atPortal=false;run.wakes=0}
  player.held=0;player.stunT=0;
  if(pet&&pet.charm)pet=null; // a charmed mob belongs to the zone you left
  if(pet){pet.x=player.x-10;pet.y=player.y+4;pet.target=null;}
  if(pet2){pet2.x=player.x+10;pet2.y=player.y+4;pet2.target=null;}
  decoy=null;grounds.length=0;traps.length=0;hazards.length=0;
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
  const inst=zoneId==='dun'||(curArea()&&curArea().instance);
  if(inst&&run.chest&&!run.chest.open&&dist(player,run.chest)<12){run.chest.open=true;burst(run.chest.x,run.chest.y-4,'#ffd27a',16,true);
    const c=20+Math.floor(rr(0,15));inv.copper+=c;log('You open the chest: '+c+' copper.','#c9a227','loot');(run.chest.items||[pick(UNCOMMONS)]).forEach((id,i)=>giveItem(id,1,i));saveInv();}
  if(inst&&run.portal){const near=dist(player,run.portal)<10;if(near&&!run.atPortal)finishRun();run.atPortal=near;}
  const A=curArea();
  if(A){checkSummon(A);checkChests(A);checkBars(A);checkSeals(A);const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T),ex=A.exits.find(e=>Math.abs(e.tx-tx)<=1&&Math.abs(e.ty-ty)<=1&&(e.tx===tx||e.ty===ty));
    // The exit you just came out of wakes up 1 second after you arrive (owner, Nov 20; was "after walking 3 tiles away"):
    // you can run straight back in (to help a friend), but you can't flicker in and out. If you're already back on it when the
    // second is up, it takes you through then (you always arrive 2+ tiles off it, so arriving never counts as standing on it).
    const G=player.exitGuard;if(G&&time-player.exitGuardT>=1){player.exitGuard=null;if(ex===G)player.atExit=null}
    if(ex!==player.atExit){player.atExit=ex;if(ex&&ex!==player.exitGuard){
      // Built areas link straight through. You can leave with mobs on you (owner, Nov 19): reaching the edge is fair, and they reset behind you.
      if(ZONE_OF[ex.to]){if(inCombat())log('You slip away. What was chasing you loses your trail.','#9aa');enterZone(ZONE_OF[ex.to],A.id,ex.at)}
      else if(ex.to==='town1')log('The gates of Town 1 are shut for now. It is not built yet.','#9aa');
      else if(ex.to==='chapel')log('The road north leads on to an old chapel. It is not built yet.','#9aa');
      else if(ex.to==='dungeon1_old')log('The chapel door is barred from within. Chanting carries through the wood. (Brother Malrec\'s halls come in the next release.)','#f0c890');
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
function interruptCast(m){if(!m.casting)return;const c=m.casting;m.casting=null;m.bolt=m.def.cast?m.def.cast.every:BOLT.every;if(c.heal)m.healCd=m.def.heal.every*0.6;if(c.grasp)m.graspCd=GRASP.every*0.6;if(c.toll)m.tollCd=TOLL.every*0.6;floatText(m.x,m.y-34,'Interrupted!','#9fb8e0');log(cap(m.def.name)+"'s spell is interrupted!",'#9fb8e0')}
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

/* ---------- Wolfwood (v0.40): a wandering named, wolves that flee, a boar that charges ---------- */
// Greyfang walks his route point to point at a stroll. If something blocks him for a few seconds he skips to the next point.
function walkRoute(m,dt){const R=m.sp.route;if(m.ri===undefined){m.ri=0;m.stuck=0}
  const p=R[m.ri],ox=m.x,oy=m.y;
  if(pathTo(m,p.x,p.y,m.def.spd*0.4,dt)||Math.hypot(m.x-p.x,m.y-p.y)<4){m.ri=(m.ri+1)%R.length;m.stuck=0}
  else if(Math.hypot(m.x-ox,m.y-oy)<0.05){m.stuck+=dt;if(m.stuck>3){m.ri=(m.ri+1)%R.length;m.stuck=0}}
  m.hx=m.x;m.hy=m.y} // home is wherever he left the path, so a reset doesn't walk him through the trees
// Below its flee share of health a wolf runs off in a random direction for a few seconds (once per fight). Anything idle it runs past joins in.
// A snare slows the run; a root stops it.
const FLEE_TIME=4;
function wolfFlee(m,dt,spd){
  if(!m.fled&&m.hp<=m.maxhp*m.def.flee){m.fled=true;m.fleeT=FLEE_TIME;floatText(m.x,m.y-20,'flees!','#ffb37a');log(cap(m.def.name)+' turns tail and runs!','#ffb37a')}
  if(!(m.fleeT>0))return false;
  m.fleeT-=dt;
  // Runs for a random open spot nearby (owner, Nov 19), then another if there's time left. Not toward other packs yet (backlog).
  if(!m.fleeTo||Math.hypot(m.x-m.fleeTo.x,m.y-m.fleeTo.y)<4)m.fleeTo=randomRunSpot(m,player)||{x:m.x+(m.x-player.x),y:m.y+(m.y-player.y)};
  if(spd>0)pathTo(m,m.fleeTo.x,m.fleeTo.y,spd*1.05,dt);
  mobs.forEach(o=>{if(o!==m&&!o.dead&&o.state==='idle'&&Math.hypot(o.x-m.x,o.y-m.y)<40){engage(o);log(cap(o.def.name)+' is drawn in by the fleeing wolf!','#ffb37a')}});
  return true}
// The boar: when you're a little way off it stops and lowers its head (you see it coming), then rushes you at three times its speed
// and hits the moment it arrives. A root or stun during the wind-up wastes it. Every 8 seconds at most.
const CHARGE={min:34,max:120,wind:0.7,cd:8,spd:3.2};
function boarCharge(m,v,d,dt,spd){
  m.chargeCd=Math.max(0,(m.chargeCd===undefined?1.5:m.chargeCd)-dt);
  if(m.rush){m.rushT=(m.rushT||0)+dt;if(spd<=0||m.rushT>1.5){m.rush=false;m.rushT=0;return false} // rooted, or a tree in the way: give up the rush
    moveToward(m,v.x,v.y,m.def.spd*CHARGE.spd,dt);if(dist(m,v)<=11){m.rush=false;m.rushT=0;m.atk=0;floatText(m.x,m.y-18,'CHARGE!','#ffb37a');burst(v.x,v.y-4,'#c8b89a',8)}return true}
  if(m.wind>0){m.wind-=dt;m.dir=v.x>m.x?1:-1;if(m.wind<=0)m.rush=true;return true}
  if(m.chargeCd<=0&&d>=CHARGE.min&&d<=CHARGE.max&&spd>0){m.wind=CHARGE.wind;m.chargeCd=CHARGE.cd;floatText(m.x,m.y-18,'lowers its head','#ffd27a');return true}
  return false}

/* ---------- Ruined Chapel (v0.62): cult camps that call for help, the chanter's song, casters, wisps, Ember Brand ---------- */
// The chapel's east gate: barred from the inside. Walk up to it inside the wall and you lift the bar (it stays open for good,
// for every character); from the ledge outside it won't budge.
function checkBars(A){(A.bars||[]).forEach(b=>{const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T),near=Math.abs(tx-b.tx)<=1&&Math.abs(ty-b.ty)<=1;
  if(near&&!b.near&&!b.open){const inside=b.from==='W'?tx<b.tx:b.from==='E'?tx>b.tx:b.from==='N'?ty<b.ty:ty>b.ty;
    if(inside){b.open=true;A.map[b.ty][b.tx]=0;const g=store.get('ashfen-gates',{});g[b.id]=1;store.set('ashfen-gates',g);burst(b.tx*T+8,b.ty*T+4,'#c8b89a',10,true);
      log('You lift the heavy bar and the east gate creaks open. A steep path leads down toward the crossroads.','#f0c890');floatText(b.tx*T+8,b.ty*T-10,'Gate open','#f0c890',true)}
    else log('The gate is barred from the other side.','#9aa')}
  b.near=near})}
// Camps (cultists): the first of a camp to be pulled shouts, and the nearest other camp within CAMP_CALL comes running.
// One shout per camp, and the camp that answers doesn't shout again, so one pull brings at most two camps.
const CAMP_CALL=128;
function campCall(m){
  if(!m.sp.group)return;const mine=mobs.filter(o=>!o.dead&&o.sp.group===m.sp.group);if(mine.some(o=>o.shouted))return;mine.forEach(o=>o.shouted=true);
  let best=null,bd=CAMP_CALL;mobs.forEach(o=>{if(o.dead||!o.def.camp||o.sp.group===m.sp.group||o.state!=='idle'||!o.sp.group)return;const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<bd&&!wallBetween(m,o)){bd=d;best=o}});
  if(!best)return;
  floatText(m.x,m.y-26,'TO ME!','#ffb37a',true);log(cap(m.def.name)+' shouts for help!','#ffb37a');
  mobs.forEach(o=>{if(!o.dead&&o.sp.group===best.sp.group){o.shouted=true;engage(o);log(cap(o.def.name)+' answers the call!','#ffb37a')}})}
// A shout doesn't carry through a wall (the chapel's stone wall, a fence): true if one stands on the line between two mobs.
function wallBetween(a,b){const A=curArea();if(!A)return false;const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4);
  for(let i=1;i<n;i++){const x=Math.floor((a.x+(b.x-a.x)*i/n)/T),y=Math.floor((a.y+(b.y-a.y)*i/n)/T),c=A.rows[y]&&A.rows[y][x],t=c&&AREA_TILES[c];if(t&&(t.tags.indexOf('wall')>=0||t.tags.indexOf('border')>=0))return true}
  return false}
// The chanter: every CHANT.every seconds while it fights it sings, and its camp (itself too) hits CHANT.x harder for CHANT.dur s.
const CHANT={every:7,dur:6,x:1.25,first:2};
function chantThink(m,dt){m.chantCd=(m.chantCd===undefined?CHANT.first:m.chantCd)-dt;if(m.chantCd>0)return;m.chantCd=CHANT.every;
  const mates=mobs.filter(o=>!o.dead&&(o===m||(m.sp.group&&o.sp.group===m.sp.group))&&dist(o,m)<90);
  mates.forEach(o=>{o.chantT=CHANT.dur});floatText(m.x,m.y-24,'chants','#e0c3ff');burst(m.x,m.y-10,'#c8a0ff',6);
  log(cap(m.def.name)+' chants, and '+(mates.length>1?'its camp fights harder':'it fights harder')+'!','#e0c3ff')}
// Casters (ashcallers, the Ashen Acolyte): a spell with a cast bar over its head. Stands still while casting. A stun, fear,
// sleep, Evade or Feign Death breaks it off (interruptCast); out of range when it lands = it misses.
function mobCast(m,dt){const c=m.def.cast;
  if(m.aslow>0&&m.slowCast)dt/=(m.aslowX||1.6);
  if(m.casting){m.casting.t+=dt;if(m.casting.t<m.casting.dur)return true;m.casting=null;m.bolt=c.every;
    if(dist(m,player)>c.range){floatText(player.x,player.y-20,'MISS',c.col);log('The '+c.name.toLowerCase()+' falls short. You were out of range.','#9fb8e0');return false}
    beams.push({x1:m.x,y1:m.y-12,x2:player.x,y2:player.y-8,t:0,col:c.col});burst(player.x,player.y-8,c.col,8);
    if(player.buffs.deflect>0){floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You dodge the '+c.name.toLowerCase()+'.','#9fb8e0');return false}
    mobSpellHit(m,c.boss?(8+2*m.lv):(m.def.dmg+m.def.dmgl*m.lv)*c.x,c.name,c.col);return false}
  m.bolt=(m.bolt===undefined?c.first:m.bolt)-dt;
  if(m.bolt<=0&&dist(m,player)<c.range&&victim(m)===player){m.casting={name:c.name,t:0,dur:c.dur};floatText(m.x,m.y-26,c.name+'!',c.col);
    if(c.boss)log(cap(m.def.name)+' begins casting '+c.name+'! Stun or fear it, or get out of range.',c.col);return true}
  return false}
// A spell or burn on you from a mob: same softening as the King's bolt (Warrior passives, shields), plus the level gap.
function mobSpellHit(m,base,label,col){
  let dmg=base*rr(0.85,1.15);const ld=m.lv-player.lvl;dmg*=ld>0?1+0.15*ld:Math.max(0.7,1+0.05*ld);if(m.chantT>0)dmg*=CHANT.x;
  dmg=Math.max(1,Math.round(tankMods(dmg)));if(dev.god)dmg=0;dmg=Math.round(shieldDmg(dmg));player.hp-=dmg;
  if(dmg>0)floatText(player.x,player.y-20,String(dmg),col);log(cap(m.def.name)+"'s "+label.toLowerCase()+' hits YOU for '+dmg+'.','#ff8a80',dmg>=maxHP(player.lvl)*0.2?'main':'fight');
  unhide('You are no longer hidden.');if(player.hp<=0&&!lastStand())playerDie(m)}
// Ash wisps: every so often one gutters out in a puff and flares up again a few steps from you, somewhere else.
function wispBlink(m,dt){m.blinkCd=(m.blinkCd===undefined?rr(3,5):m.blinkCd)-dt;if(m.blinkCd>0||m.root>0)return false;m.blinkCd=rr(5,7);
  const v=victim(m),a0=rng()*6.283;for(let k=0;k<8;k++){const an=a0+k*0.785,x=v.x+Math.cos(an)*26,y=v.y+Math.sin(an)*20;
    if(!blocked(x,y)&&!blocked(x,y-6)){burst(m.x,m.y-8,'#8a8590',8);m.x=x;m.y=y;burst(x,y-8,'#ffd27a',8);floatText(x,y-22,'blinks','#ffd27a');return true}}
  return false}
// Ember Brand (the Ashen Acolyte): a ring of embers flares under you; 1.5 s to step out of it, then a big burn inside.
const BRAND={first:5,every:9,dur:1.5,r:20,x:1.5},hazards=[];
function brandThink(m,dt){if(m.casting)return;m.brandCd=(m.brandCd===undefined?BRAND.first:m.brandCd)-dt;if(m.brandCd>0||dist(m,player)>120)return;m.brandCd=BRAND.every;
  hazards.push({x:player.x,y:player.y,r:BRAND.r,t:0,dur:BRAND.dur,m:m});floatText(m.x,m.y-26,'Ember Brand!','#ff8a3c');log(cap(m.def.name)+' brands the ground under you with embers! Move!','#ff8a3c')}
function updateHazards(dt){for(let i=hazards.length-1;i>=0;i--){const h=hazards[i];h.t+=dt;if(h.t<h.dur)continue;hazards.splice(i,1);
  for(let k=0;k<14;k++)parts.push({x:h.x+rr(-h.r,h.r),y:h.y+rr(-h.r*0.6,h.r*0.6),vx:rr(-6,6),vy:-rr(14,30),t:0,life:0.7,col:k%2?'#ff8a3c':'#ffd27a'});
  if(player.dead||!h.m||h.m.dead)continue;
  if(Math.hypot((player.x-h.x)/h.r,(player.y-h.y)/(h.r*0.6))<=1)mobSpellHit(h.m,(8+2*h.m.lv)*BRAND.x,'Ember Brand','#ff8a3c');else log('The embers flare where you stood.','#9aa')}}

/* ---------- Dungeon 1 (v0.63): the altar switch, menders, Grasp of the Deep, Toll, Candle Wake ---------- */
// The altar: walk up to it and the stone slab behind it grinds aside, opening the stairs down. Shut again on every visit.
function checkSeals(A){A.seals.forEach(sl=>{if(sl.open||!sl.obj)return;const o=sl.obj,tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);
  const near=tx>=o.x-1&&tx<=o.x+o.w&&ty>=o.y-1&&ty<=o.y+o.h+1;
  if(near&&!sl.near){sl.open=true;for(let y=sl.y0;y<=sl.y1;y++)for(let x=sl.x0;x<=sl.x1;x++)A.map[y][x]=0;
    const cx=(sl.x0+sl.x1+1)*T/2,cy=sl.y0*T+8;burst(cx,cy,'#8a8690',16,true);floatText(cx,cy-14,'The slab grinds aside','#f0c890',true);
    log('You lay a hand on the altar. Behind it, a stone slab grinds aside, and steps lead down into the sound of water.','#f0c890')}
  sl.near=near})}
// Healers (the fen mender, Brother Malrec): when one of its group drops below heal.below of its health, it starts a cast
// (a bar over its head; a boss one shows mid-screen) that heals the most hurt one by heal.x of their health. Stun, fear,
// sleep or Evade breaks it off. It never heals itself. Returns true while casting (it stands still).
function healThink(m,dt){const h=m.def.heal;
  if(m.aslow>0&&m.slowCast)dt/=(m.aslowX||1.6);
  if(m.casting&&m.casting.heal){m.casting.t+=dt;if(m.casting.t<m.casting.dur)return true;const t=m.casting.who;m.casting=null;m.healCd=h.every;
    if(!t||t.dead)return false;const n=Math.round(t.maxhp*h.x);t.hp=Math.min(t.maxhp,t.hp+n);floatText(t.x,t.y-24,'+'+n,h.col);burst(t.x,t.y-8,h.col,8);
    log(cap(m.def.name)+(t===m?' heals itself':' heals '+t.def.name)+' for '+n+'.',h.col);return false}
  if(m.casting)return false;
  m.healCd=(m.healCd===undefined?h.first:m.healCd)-dt;if(m.healCd>0)return false;
  const hurt=mobs.filter(o=>o!==m&&!o.dead&&!o.def.drift&&m.sp.group&&o.sp.group===m.sp.group&&dist(o,m)<130&&o.hp<o.maxhp*h.below).sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp)[0];
  if(!hurt)return false;
  m.casting={name:h.name,t:0,dur:h.dur,heal:1,who:hurt,boss:h.boss};floatText(m.x,m.y-26,h.name+'!',h.col);
  log(cap(m.def.name)+' begins casting '+h.name+' on '+hurt.def.name+'! Stun or fear it to stop the heal.',h.col);return true}
// Player crowd control from mobs: held = can't move (you can still cast); stunT = can't move or act.
// Grasp of the Deep (the Drowned Prior): a 2 s boss cast, then pale hands rise from the flood water: anyone standing in water
// is held for 4 s and hurt. Counter: stand on one of the dry stone plinths when it lands.
const GRASP={first:6,every:14,dur:2,hold:4,x:1.3},TOLL={first:4,every:10,dur:1.5,r:30,stun:2,x:1.2};
const inWater=e=>{const A=slowArea;if(!A)return false;const x=Math.floor(e.x/T),y=Math.floor(e.y/T);return x>=0&&y>=0&&x<A.w&&y<A.h&&!!A.slow[y*A.w+x]};
function graspThink(m,dt){
  if(m.casting&&m.casting.grasp){m.casting.t+=dt;if(m.casting.t<m.casting.dur)return true;m.casting=null;m.graspCd=GRASP.every;
    const A=slowArea;if(A){for(let k=0;k<40;k++){const x=m.hx+rr(-110,110),y=m.hy+rr(-70,70),tx=Math.floor(x/T),ty=Math.floor(y/T);if(tx>=0&&ty>=0&&tx<A.w&&ty<A.h&&A.slow[ty*A.w+tx])hands.push({x:x,y:y,t:0,life:1.4})}}
    if(inWater(player)){player.held=GRASP.hold;hands.push({x:player.x,y:player.y,t:0,life:GRASP.hold,on:1});floatText(player.x,player.y-28,'HELD','#9fd8c0',true);
      log('Pale hands rise from the water and seize you!','#9fd8c0');mobSpellHit(m,(8+2*m.lv)*GRASP.x,'Grasp of the Deep','#9fd8c0')}
    else log('Pale hands rise from the water and grasp at nothing. You were on dry stone.','#9fb8e0');
    return false}
  if(m.casting)return false;
  m.graspCd=(m.graspCd===undefined?GRASP.first:m.graspCd)-dt;
  if(m.graspCd<=0&&dist(m,player)<160){m.casting={name:'Grasp of the Deep',t:0,dur:GRASP.dur,grasp:1,boss:1};floatText(m.x,m.y-34,'Grasp of the Deep!','#9fd8c0');
    log(cap(m.def.name)+' begins casting Grasp of the Deep! Get out of the water, onto dry stone.','#9fd8c0');return true}
  return false}
// Toll (the Bellringer): he heaves the bell's clapper up for 1.5 s (a bar over his head), then slams it down: a ring of sound
// stuns anyone within reach for 2 s. Counter: step back out of the ring (or stun him first).
function tollThink(m,dt){
  if(m.casting&&m.casting.toll){m.casting.t+=dt;if(m.casting.t<m.casting.dur)return true;m.casting=null;m.tollCd=TOLL.every;
    rings.push({x:m.x,y:m.y,r:TOLL.r,t:0,life:0.6});
    if(dist(m,player)<=TOLL.r){player.stunT=TOLL.stun;player.cast=null;floatText(player.x,player.y-28,'STUNNED','#ffd27a',true);log('The toll rings through your skull! You are stunned.','#ffd27a');mobSpellHit(m,(m.def.dmg+m.def.dmgl*m.lv)*TOLL.x,'Toll','#ffd27a')}
    else log('The toll booms out. You were out of reach.','#9fb8e0');
    return false}
  if(m.casting)return false;
  m.tollCd=(m.tollCd===undefined?TOLL.first:m.tollCd)-dt;
  if(m.tollCd<=0&&dist(m,player)<TOLL.r*0.9){m.casting={name:'Toll',t:0,dur:TOLL.dur,toll:1};floatText(m.x,m.y-34,'heaves the clapper','#ffd27a');
    log(cap(m.def.name)+' heaves the clapper overhead! Step back!','#ffd27a');return true}
  return false}
// Candle Wake (Brother Malrec): each time he loses a sixth of his health, a candle in the room flares and a candle wisp drifts
// slowly toward him; one that reaches him heals him. Kill, snare or root the wisps (they never fight back).
const WAKE={heal:0.08,reach:12};
function candleWake(m){m.wakes=m.wakes||0;
  while(m.wakes<5&&m.hp<=m.maxhp*(1-(m.wakes+1)/6)){m.wakes++;
    const A=curArea(),cs=A?A.objs.filter(o=>o.kind==='candle'&&Math.hypot(o.x*T+8-m.hx,o.y*T+8-m.hy)<10*T):[];
    const c=cs.length?cs[(m.wakes*3)%cs.length]:null,an=rng()*6.283,x=c?c.x*T+8:m.x+Math.cos(an)*70,y=c?c.y*T+12:m.y+Math.sin(an)*50;
    const sp={type:'cwisp',x:x,y:y,timer:0,mob:null,group:null,lv:[m.lv,m.lv],noRespawn:true},w=spawn(sp);w.lord=m;w.state='drift';
    burst(x,y-6,'#ffd27a',12,true);floatText(x,y-18,'a candle flares','#ffd27a');
    log('A candle flares, and a wisp of flame drifts toward '+m.def.name+'! Stop it before it reaches him.','#ffd27a')}}
// A candle wisp drifts to its master and melts into him, healing him.
function wispDrift(m,dt,spd){const L=m.lord;if(!L||L.dead){killQuiet(m);return}
  if(spd>0)pathTo(m,L.x,L.y-4,spd,dt);
  if(dist(m,L)<WAKE.reach){const n=Math.round(L.maxhp*WAKE.heal);L.hp=Math.min(L.maxhp,L.hp+n);floatText(L.x,L.y-30,'+'+n,'#ffd27a');burst(L.x,L.y-10,'#ffd27a',12);
    log('A candle wisp melts into '+L.def.name+', and he heals for '+n+'.','#ffd27a');killQuiet(m)}}
// Gone without a kill (no XP, no loot, no log line).
function killQuiet(m){m.dead=true;m.hp=0;m.sp.timer=Infinity;m.sp.mob=null;if(player.target===m)player.target=null}
const hands=[],rings=[]; // Grasp of the Deep's hands and the Toll's ring of sound (drawn in render.js)

/* ---------- Named rares (v0.32) ---------- */
// About 1 in 100 spawns in an area brings out that area's rare, at its own spot off the main path (owner, Nov 17).
// Rolled when a mob respawns, not when you walk in, so leaving and coming back can't fish for it. Only one out at a time.
const RARE_CHANCE=0.01;
const RARE_TEXT={acolyte:'Smoke curls up from the herb garden, and someone is praying in a voice like ash.',ironshell:'Something big and heavy shifts in the marsh reeds.',palerat:'A thin, high squeak echoes from somewhere off the warren.',bride:'A woman\'s sobbing drifts across the graves.',oldscar:'A low, ragged growl carries from the east, off the deer trail.'};
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
  if(spd>0)pathTo(m,f.x,f.y,spd,dt);return true}

/* ---------- Hidden chests (v0.32) ---------- */
// Walk up to one to open it: some copper and one piece of gear your class can use (odds by area in CHEST_ODDS).
// It fills again after CHEST_REFILL seconds of play (kept for this session only; a reload fills every chest).
// In an instance (v0.63) a chest opens once per run, and one by a named won't open while that named still stands guard.
function checkChests(A){A.chests.forEach(ch=>{
  if(ch.open&&!A.instance&&time-ch.at>=CHEST_REFILL)ch.open=false;
  const near=Math.hypot(player.x-ch.x,player.y-ch.y)<14;
  const guard=near&&!ch.near&&!ch.open?A.named.map(n=>n.sp.mob).find(m=>m&&!m.dead&&Math.hypot(m.hx-ch.x,m.hy-ch.y)<5*T):null;
  if(guard){log('The chest won\'t open while '+guard.def.name+' stands guard over it.','#c8b89a');ch.near=near;return}
  if(near&&!ch.near){if(ch.open&&A.instance)log('You already emptied this chest on this run.','#9aa');else if(ch.open){const mins=Math.max(1,Math.ceil((CHEST_REFILL-(time-ch.at))/60));log('The chest is empty. It looks like someone refills it now and then (about '+mins+' min).','#9aa')}else openChest(A,ch)}
  ch.near=near})}
function openChest(A,ch){
  const o=CHEST_ODDS[A.id]||CHEST_ODDS.crossroads,r=rng();
  let pool=r<o.rare?RARES:r<o.rare+o.unc?UNCOMMONS:COMMONS;if(!pool.length)pool=UNCOMMONS.length?UNCOMMONS:COMMONS;
  ch.open=true;ch.at=time;burst(ch.x,ch.y-4,'#ffd27a',16,true);
  const c=Math.floor(rr(o.cu,o.cu*2));inv.copper+=c;log('You open a hidden chest: '+c+' copper.','#c9a227','loot');
  if(pool.length)giveItem(pick(pool),1,0);saveInv()}

/* ---------- Area critters (Heart pass, v0.49): the small living things a map file places ---------- */
// A map's things can hold "critter <kind> x y [n]" (tile units, decimals fine, docs/map-format.md):
// crow (perches, flies off when you come close, comes back once you've gone), frog (sits by the water, plops in when you
// come close), moth (n of them circling a light), owl (sits on a branch, blinks, turns its head to watch you), bat
// (flutters round a belfry), firefly (drifts and blinks over a marsh, v0.59), rabbit (nibbles in a meadow, bolts
// for the trees when you come close, v0.59). Ripples on open water and smoke from a shack's chimney come with any area that has them.
// Looks only: these use Math.random, never rng(), so they can't shift any game roll or sim result.
const vr=(a,b)=>a+Math.random()*(b-a);
function areaCritters(A){
  if(A.crit)return A.crit;
  A.crit=[];A.rip=[];A.smoke=[];A.ripT=0;A.smokeT=0;
  (A.critDefs||[]).forEach(d=>{for(let i=0;i<d.n;i++){const c={kind:d.kind,hx:d.x,hy:d.y,x:d.x,y:d.y,ph:Math.random()*6.28,dir:Math.random()<0.5?1:-1,t:0,st:'sit',pk:vr(1,4),hop:vr(1,5),blink:vr(2,6),look:0};
    if(d.kind==='moth'){c.r=vr(5,9)+i*2;c.sp=vr(0.8,1.6)}if(d.kind==='bat'){c.r=vr(13,19)+i*4;c.sp=vr(0.9,1.4)}if(d.kind==='firefly'){c.r=vr(10,26);c.sp=vr(0.15,0.35);c.hx+=vr(-12,12);c.hy+=vr(-8,8)} // bats swing out past the tower's sides so they show against the sky and walls
    // a crow standing where you could walk is on the ground; anywhere else it's perched up on something
    if(d.kind==='crow')c.ground=!d.high;
    A.crit.push(c)}});
  // Open water for ripples: water tiles with water all round them, so rings never cross the shore.
  A.waterSpots=[];for(let y=1;y<A.h-1;y++)for(let x=1;x<A.w-1;x++){const w=(a,b)=>A.rows[b][a]==='~';if(w(x,y)&&w(x-1,y)&&w(x+1,y)&&w(x,y-1)&&w(x,y+1))A.waterSpots.push({x:x*T+8,y:y*T+8})}
  A.chimneys=A.objs.filter(o=>o.kind==='shack').map(o=>({x:o.x*T+o.w*T-4,y:o.y*T-11}))
    .concat(A.objs.filter(o=>o.kind==='censer').map(o=>({x:o.x*T+13,y:o.y*T-9})),A.objs.filter(o=>o.kind==='book_pyre').map(o=>({x:o.x*T+8,y:o.y*T+4}))); // chapel censers and the smouldering books (v0.62)
  return A.crit;
}
// The closest point a few pixels inside open water, within about three tiles (for a fleeing frog), or null.
function nearWater(A,x,y){let best=null,bd=1e9;const tx=Math.floor(x/T),ty=Math.floor(y/T);
  for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const a=tx+i,b=ty+j;if(b<0||b>=A.h||a<0||a>=A.w||A.rows[b][a]!=='~')continue;
    let px=Math.max(a*T+4,Math.min(a*T+12,x)),py=Math.max(b*T+4,Math.min(b*T+12,y));if(A.wetV&&A.wetV(px,py)<0.05){px=a*T+8;py=b*T+8} // banks curve (v0.52): land in the drawn water, never on a bit of bank
    const d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best={x:px,y:py}}}
  return best}
function updateAreaCritters(A,dt){
  const cr=areaCritters(A),inView=(x,y)=>x>camX-16&&x<camX+VW+16&&y>camY-16&&y<camY+VH+16;
  cr.forEach(c=>{const d=Math.hypot(c.x-player.x,c.y-player.y),home=Math.hypot(c.hx-player.x,c.hy-player.y);c.t+=dt;
    if(c.kind==='crow'){
      if(c.st==='sit'){c.pk-=dt;if(c.pk<=0){c.pk=vr(0.8,3);if(Math.random()<0.5)c.dir*=-1;else c.peck=0.25}if(c.peck>0)c.peck-=dt;
        if(d<(c.ground?34:26)&&player.dead<=0){c.st='fly';c.t=0;c.vx=(c.x>player.x?1:-1)*vr(30,46);c.vy=-vr(22,36);c.dir=c.vx>0?1:-1}}
      else if(c.st==='fly'){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy-=6*dt;if(c.t>3){c.st='gone';c.t=0}}
      else if(c.t>12&&home>150){c.st='sit';c.x=c.hx;c.y=c.hy;c.t=0}} // back on its perch once you're well away
    else if(c.kind==='frog'){
      if(c.st==='sit'){c.hop-=dt;if(c.hop<=0){c.hop=vr(2,6);const nx=c.hx+vr(-6,6),ny=c.hy+vr(-4,4);if(!blocked(nx,ny)){c.dir=nx>c.x?1:-1;c.x=nx;c.y=ny;c.jump=0.2}}if(c.jump>0)c.jump-=dt;
        if(d<28&&player.dead<=0){const w=nearWater(A,c.x,c.y);
          // Leap for the nearest water and plop in where it lands (v0.49.1, owner: they used to splash on dry ground).
          // A frog with no water within reach just hides in the reeds.
          if(w){c.st='leap';c.t=0;c.fx=c.x;c.fy=c.y;c.tx=w.x;c.ty=w.y;c.dir=w.x>c.x?1:-1}else{c.st='gone';c.t=0}}}
      else if(c.st==='leap'){const k=Math.min(1,c.t/0.35);c.x=c.fx+(c.tx-c.fx)*k;c.y=c.fy+(c.ty-c.fy)*k;c.jump=Math.sin(k*Math.PI)*6;
        if(k>=1){c.st='gone';c.t=0;c.jump=0;A.rip.push({x:c.tx,y:c.ty,t:0,big:1})}}
      else if(c.t>8&&home>110){c.st='sit';c.x=c.hx;c.y=c.hy;c.t=0}}
    else if(c.kind==='rabbit'){
      // (v0.59) sits and nibbles, now and then hops a step; gets close and it bolts away from you and is gone in the trees.
      if(c.st==='sit'){c.hop-=dt;if(c.hop<=0){c.hop=vr(1.5,5);if(Math.random()<0.4){const nx=c.hx+vr(-8,8),ny=c.hy+vr(-5,5);if(!blocked(nx,ny)){c.dir=nx>c.x?1:-1;c.x=nx;c.y=ny;c.jump=0.18}}else c.nib=0.6}
        if(c.jump>0)c.jump-=dt;if(c.nib>0)c.nib-=dt;
        if(d<40&&player.dead<=0){const a=Math.atan2(c.y-player.y,c.x-player.x)+vr(-0.5,0.5);c.vx=Math.cos(a)*78;c.vy=Math.sin(a)*78;c.dir=c.vx>0?1:-1;c.st='run';c.t=0}}
      else if(c.st==='run'){const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;c.jump=Math.abs(Math.sin(c.t*14))*3;
        if(blocked(nx,ny)||c.t>1.1){c.st='gone';c.t=0;c.jump=0}else{c.x=nx;c.y=ny}} // into the undergrowth
      else if(c.t>10&&home>130){c.st='sit';c.x=c.hx;c.y=c.hy;c.t=0}}
    else if(c.kind==='owl'){c.blink-=dt;if(c.blink<-0.15)c.blink=vr(2,6);const dx=player.x-c.x;c.look=Math.abs(dx)<20?0:dx<0?-1:1}
  });
  if(A.waterSpots.length){A.ripT-=dt;if(A.ripT<=0){A.ripT=vr(0.5,1.4);const v=A.waterSpots.filter(w=>inView(w.x,w.y));if(v.length){const w=v[Math.floor(Math.random()*v.length)];A.rip.push({x:w.x+vr(-6,6),y:w.y+vr(-5,5),t:0})}}}
  A.rip.forEach(r=>r.t+=dt);A.rip=A.rip.filter(r=>r.t<1.6);
  if(A.chimneys.length){A.smokeT-=dt;if(A.smokeT<=0){A.smokeT=0.4;A.chimneys.forEach(ch=>{if(inView(ch.x,ch.y))A.smoke.push({x:ch.x+vr(-1,1),y:ch.y,t:0})})}}
  A.smoke.forEach(p=>{p.t+=dt;p.y-=7*dt;p.x+=(3+Math.sin(p.t*2))*dt});A.smoke=A.smoke.filter(p=>p.t<3.2);
}
// layer 0: on the ground, under everyone (frogs, crows on the ground, ripples). layer 1: up high, over everyone
// (perched and flying crows, the owl, bats, chimney smoke). Both before the lighting, so the night darkens them.
function drawAreaCritters(A,layer){
  if(!A.crit)return;const f=(x,y,w,h,col)=>{lx.fillStyle=col;lx.fillRect(Math.round(x),Math.round(y),w,h)};
  if(layer===0){
    A.rip.forEach(r=>{const k=r.t/1.6,rad=1+k*(r.big?8:5);lx.globalAlpha=1-k;for(let a=0;a<14;a++){const an=a/14*6.283;f(r.x+Math.cos(an)*rad,r.y+Math.sin(an)*rad*0.45,1,1,k<0.4?AP.glint:AP.waterHi)}lx.globalAlpha=1});
    A.crit.forEach(c=>{if(c.st==='gone')return;
      if(c.kind==='frog')critGrid(c.jump>0?FROG_JUMP:FROG,c.x,c.y-(c.st==='leap'?c.jump:c.jump>0?2:0),c.dir);
      if(c.kind==='crow'&&c.ground&&c.st==='sit')critGrid(c.peck>0?CROW_PECK:CROW,c.x,c.y,c.dir);
      if(c.kind==='rabbit')critGrid(c.jump>0.5?RABBIT_HOP:c.nib>0&&Math.floor(time*8)%2?RABBIT_NIB:RABBIT,c.x,c.y-c.jump,c.dir)});
    return}
  A.crit.forEach(c=>{
    if(c.kind==='crow'&&(c.st==='fly'||(!c.ground&&c.st==='sit'))){const flap=c.st==='fly'&&Math.floor(time*10)%2;critGrid(c.st==='fly'?(flap?CROW_FLY2:CROW_FLY):c.peck>0?CROW_PECK:CROW,c.x,c.y,c.dir)}
    else if(c.kind==='owl')drawOwl(c);
    else if(c.kind==='bat'){const x=c.hx+Math.cos(time*c.sp+c.ph)*c.r*1.4,y=c.hy+Math.sin(time*c.sp*2+c.ph)*c.r*0.5,up=Math.floor(time*12+c.ph)%2;
      f(x-1,y,3,1,'#120e16');if(up){f(x-3,y-1,2,1,'#120e16');f(x+2,y-1,2,1,'#120e16')}else{f(x-3,y+1,2,1,'#120e16');f(x+2,y+1,2,1,'#120e16')}}});
  A.smoke.forEach(p=>{lx.globalAlpha=0.55*(1-p.t/3.2);f(p.x,p.y,p.t>1.2?3:2,2,'#8a8590');lx.globalAlpha=1});
}
// Critter pictures as little grids (bottom-middle on x,y; drawn facing right, mirrored for dir<0). A lighter back and
// pale eyes so a frog shows up against the marsh, and a lighter wing edge so a crow reads against dark ground.
const FROG=['.k...k.','kek.kek','kgGGGgk','kgGGGgk','kk.k.kk'],FROG_JUMP=['.k...k.','kek.kek','kgGGGgk','k.k.k.k'];
const CROW=['..kkk..','.kbbbky','kbhhbk.','kbbbbk.','.k.k...'],CROW_PECK=['.......','..kkk..','kbbbbk.','kbhhbky','.k.k...'];
const CROW_FLY=['k.....k','hk.k.kh','.kbbbky','..kbk..'],CROW_FLY2=['.......','.kkkkk.','hhbbbhy','..kbk..'];
// Rabbit (v0.59), 8 x 6 facing right: long ears, a brown body with a lighter back, the white tail at the rear.
const RABBIT=['.....kk.','....kRk.','.kkkkRRk','kwRRRRkk','krrrrrrk','.kk..kk.'],RABBIT_NIB=['........','....kk..','.kkkkRk.','kwRRRRkk','krrrrrrk','.kk..kk.'],RABBIT_HOP=['......kk','.....kRk','kkkkkkRR','wRRRRRkk','krrrrrk.','k.....k.'];
const CRIT_PAL={k:'#0b0a0f',e:'#d8e070',g:'#4d7034',G:'#7aa04a',b:'#2a2733',h:'#4a4560',y:'#8d8692',r:'#6a5848',R:'#9a8670',w:'#e8e2d4'};
function critGrid(G,x,y,dir){const w=G[0].length,x0=Math.round(x)-(w>>1),y0=Math.round(y)-G.length;
  G.forEach((row,j)=>{for(let i=0;i<w;i++){const ch=row[dir<0?w-1-i:i];if(ch==='.')continue;lx.fillStyle=CRIT_PAL[ch];lx.fillRect(x0+i,y0+j,1,1)}})}
function drawOwl(c){
  // A little barn-brown owl, 7 x 9: ear tufts, a pale face with two big eyes, a light chest, talons on the branch.
  // Its head (the top five rows) turns a pixel toward you when you walk past.
  const G=['k.....k','kbkkkbk','kFFbFFk','kFEbEFk','kbFyFbk','kbbbbbk','kbLLLbk','.kLLLk.','..ktk..'],P={k:'#0b0a0f',b:'#5a4636',F:'#b8a888',E:c.blink<0?'#b8a888':'#0b0a0f',y:'#c9a227',L:'#8a7258',t:'#c9a227'};
  const x0=Math.round(c.x)-3,y0=Math.round(c.y)-9;
  G.forEach((row,j)=>{const off=j<5?c.look:0;for(let i=0;i<7;i++){const ch=row[i];if(ch==='.')continue;lx.fillStyle=P[ch];lx.fillRect(x0+i+off,y0+j,1,1)}});
}
// After the lighting: moths circling their light (they catch it, so they show), and a glint in the owl's eyes.
function drawCritterGlows(A){
  if(!A.crit)return;
  A.crit.forEach(c=>{
    if(c.kind==='moth'){const x=Math.round(c.hx+Math.cos(time*c.sp*2+c.ph)*c.r),y=Math.round(c.hy-6+Math.sin(time*c.sp*3.1+c.ph)*c.r*0.6);
      lx.fillStyle='#efe3c4';lx.fillRect(x,y,1,1);if(Math.floor(time*14+c.ph*3)%2){lx.fillStyle='#b8ad90';lx.fillRect(x-1,y,1,1);lx.fillRect(x+1,y,1,1)}}
    if(c.kind==='firefly'){const x=Math.round(c.hx+Math.cos(time*c.sp+c.ph)*c.r+Math.sin(time*c.sp*2.7+c.ph)*6),y=Math.round(c.hy+Math.sin(time*c.sp*1.3+c.ph)*c.r*0.5);
      const on=0.5+0.5*Math.sin(time*(1.3+c.sp*3)+c.ph*5);if(on>0.35){lx.globalAlpha=(on-0.35)*0.5;lx.fillStyle='#c8e070';lx.fillRect(x-1,y,3,1);lx.fillRect(x,y-1,1,3);lx.globalAlpha=Math.min(1,(on-0.35)*2.2);lx.fillStyle='#f0ff9a';lx.fillRect(x,y,1,1);lx.globalAlpha=1}}
    if(c.kind==='owl'&&c.blink>=0){lx.fillStyle='#ffcf5a';const x0=Math.round(c.x)-3+c.look,y0=Math.round(c.y)-9;lx.fillRect(x0+2,y0+3,1,1);lx.fillRect(x0+4,y0+3,1,1)}});
}

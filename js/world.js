// The living world: gate camp NPCs and critters, zone changes, portals and the Skeleton King's behaviour.
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
  const CA=curArea();if(CA){const A=CA;A.flames.forEach(f=>{if(f.hid)return;if(f.tiny){const k=Math.floor(time*6+f.x)%3;lx.fillStyle='#ffb347';lx.fillRect(f.x,f.y-2-(k===1?1:0),1,2);lx.fillStyle='#ffe9a8';lx.fillRect(f.x,f.y-1,1,1)}else if(f.lamp){lx.fillStyle=Math.floor(time*5)%4?'#ffd27a':'#ffb347';lx.fillRect(f.x+4,f.y-4,2,3)}else flame(f.x,f.y,f.big)});
    // Cold motes drifting up out of the crypt mouth.
    A.objs.forEach(o=>{if(o.kind!=='crypt_mouth')return;const cx=o.x*T+o.w*T/2,cy=(o.y+o.h)*T-8;for(let i=0;i<4;i++){const ph=(time*0.6+i/4)%1;lx.fillStyle=i%2?'#6f8fe0':'#b9cbbf';lx.fillRect(Math.round(cx-8+i*5+Math.sin(time+i)*2),Math.round(cy-ph*22),1,1)}});
    // Dust turning in the daylight shafts (rat tunnel) and rising out of the sinkhole (crossroads).
    (A.motes||[]).forEach((m,j)=>{for(let i=0;i<5;i++){const ph=(time*0.25+i/5+j*0.13)%1;lx.fillStyle=i%2?'#c8c0a8':'#8f8a76';lx.fillRect(Math.round(m.x-6+i*3+Math.sin(time*0.7+i+j)*3),Math.round(m.y-ph*26),1,1)}});
    // Wolfwood sunbeams (v0.82, owner: the v0.81 smear didn't read). What makes canopy light read: (1) sun flecks, a
    // dapple of bright leaf-shaped spots on the ground that shimmer as the leaves above move; (2) a few crisp, parallel
    // shafts slanting down from the upper left (the game's light direction), brightest where they land and fading out
    // toward the canopy, each breathing on its own; (3) dust motes twinkling inside them. Drawn with 'screen' so the
    // light brightens what's under it instead of painting over it.
    (A.beams||[]).forEach(b=>{if(b.x<camX-110||b.x>camX+VW+30||b.y<camY-20||b.y>camY+VH+110)return;
      lx.globalCompositeOperation='screen';
      const S=[[0,3,0.0],[6,5,1.7],[14,2,3.1]];
      S.forEach(([off,w,ph])=>{const br=0.55+0.45*Math.sin(time*0.6+b.ph+ph);
        for(let i=0;i<88;i++){const t=i/88,x=Math.round(b.x-14+off-(88-i)*0.6),y=b.y-88+i;lx.globalAlpha=br*0.30*Math.pow(t,1.6);lx.fillStyle=i>80?'#ffe6a0':'#ffc860';lx.fillRect(x,y,w,1)}});
      // sun flecks on the ground: a dapple of small bright spots, each fading in and out on its own
      for(let i=0;i<14;i++){const a=ah(i,b.ph*100|0,91)*6.283,r=ah(i,3,92),fx=Math.round(b.x+Math.cos(a)*r*17),fy=Math.round(b.y+Math.sin(a)*r*8),on=0.5+0.5*Math.sin(time*(0.7+ah(i,4,93))+i*1.9+b.ph);
        if(on<0.25)continue;lx.globalAlpha=0.55*on;lx.fillStyle='#ffd27a';const w=1+Math.floor(ah(i,5,94)*3);lx.fillRect(fx,fy,w,1+(w>2?1:0));lx.globalAlpha=0.25*on;lx.fillRect(fx-1,fy,w+2,1)}
      lx.globalAlpha=0.10;lx.fillStyle='#ffc860';lx.beginPath();lx.ellipse(b.x,b.y,18,8,0,0,6.283);lx.fill();
      for(let i=0;i<6;i++){const ph=(time*0.08+i/6+b.ph)%1,y=b.y-88*(1-ph);lx.globalAlpha=0.9*Math.sin(ph*Math.PI)*(0.5+0.5*Math.sin(time*3+i*2));lx.fillStyle='#fff2c8';lx.fillRect(Math.round(b.x-14+i*3-(88*(1-ph))*0.6+Math.sin(time*0.7+i)*1.5),Math.round(y),1,1)}
      lx.globalCompositeOperation='source-over';lx.globalAlpha=1});
    // Glow caps (rat tunnel love pass, Nov 27): each cap's top glows a cold blue-green, breathing slowly, a spore drifting up now and then.
    (A.caps||[]).forEach(c=>{c.spots.forEach(([x,y],i)=>{const p=0.5+0.5*Math.sin(time*0.8+c.ph+i*1.3);lx.globalAlpha=0.45+0.55*p;lx.fillStyle='#b8fff0';lx.fillRect(c.x+x,c.y+y-2,1,1);if(p>0.7){lx.globalAlpha=0.5*p;lx.fillRect(c.x+x-1,c.y+y-2,3,1)}});
      const ph=(time*0.15+c.ph)%1;lx.globalAlpha=0.6*Math.sin(ph*Math.PI);lx.fillStyle='#9af0e0';lx.fillRect(c.x+8+Math.round(Math.sin(time*0.9+c.ph)*3),Math.round(c.y+8-ph*16),1,1);lx.globalAlpha=1});
    // Foxfire: the fungus on rotting wood glows a cold green, pulsing slowly, a mote drifting up off it now and then.
    (A.fox||[]).forEach(f=>{const p=0.55+0.45*Math.sin(time*0.9+f.ph);
      [[5,8],[9,7],[6,11],[10,10],[8,12],[3,12],[12,12]].forEach(([x,y],i)=>{lx.globalAlpha=Math.max(0,p-(i%3)*0.15);lx.fillStyle='#b8ffc8';lx.fillRect(f.x+x,f.y+y,1,1)});
      const ph=(time*0.2+f.ph)%1;lx.globalAlpha=0.6*Math.sin(ph*Math.PI);lx.fillStyle='#9af0b0';lx.fillRect(f.x+8+Math.round(Math.sin(time+f.ph)*2),Math.round(f.y+8-ph*14),1,1);lx.globalAlpha=1});
    // Steam off the hunter's stew pot (v0.87): a few pale wisps rising and drifting.
    A.objs.forEach(o=>{if(o.kind!=='campfire'||o.opt!=='pot')return;const px=o.x*T+8,py=o.y*T-7;
      for(let i=0;i<4;i++){const ph=(time*0.45+i/4)%1;lx.globalAlpha=0.5*Math.sin(ph*Math.PI);lx.fillStyle='#d8d8d0';lx.fillRect(Math.round(px-2+i*1.5+Math.sin(time*1.3+i*2)*2),Math.round(py-ph*14),1+(i%2),1)}lx.globalAlpha=1});
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
  // v0.66: from floor 2 too: back out the way you came into floor 1 (run.home), not up the stairs to floor 1.
  if(A&&A.instance)prompt(A.name+' complete','Time '+mm+':'+ss+' · '+run.kills+' kills · '+run.xp+' XP. Gear found: '+(loot.length?loot.join(', '):'none this run')+'.','Back to the chapel grounds',()=>{const H=AREAS[run.home]||A,ex=H.exits.find(e=>e.name===MAPS[H.id].start)||H.exits[0];enterZone(ZONE_OF[ex.to],H.id,ex.at)});
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
// A free spot beside an exit (not on it, so you don't trigger it again on arrival).
// dir (v0.41): the way you were walking. You come out on that side of the exit so you keep walking away from it, not back in.
// v0.94 (owner Nov 27: "you're landing further away from the door"): through a doorway or stairs you come out on the
// tile right beside it, never on a tile that would take you straight back. Map-edge exits still put you 2 tiles in.
function areaSpot(A,ex,dir){
  let offs=[[0,2],[0,-2],[2,0],[-2,0],[0,3],[0,-3],[3,0],[-3,0],[2,2],[-2,2],[2,-2],[-2,-2]];
  if(!exitEdge(A,ex))offs=[[0,1],[0,-1],[1,0],[-1,0]].concat(offs);
  if(dir&&(dir.x||dir.y)){const d=Math.hypot(dir.x,dir.y);offs=offs.map((o,i)=>[o,i]).sort((a,b)=>{const s=o=>(o[0]*dir.x+o[1]*dir.y)/(d*Math.hypot(o[0],o[1]));return (s(b[0])-s(a[0]))||(a[1]-b[1])}).map(o=>o[0])}
  // Open ground only (v0.64, owner: coming up out of the rat tunnel dropped you in a pocket behind the lamppost that was
  // hard to get out of): a spot needs most of the ground around it open, so you never arrive boxed in by a tree, a post
  // or a wall. If nothing round the exit is that open, the first free spot still does.
  const ok=(x,y)=>x>=0&&y>=0&&x<A.w&&y<A.h&&A.map[y][x]===0&&!A.exits.some(e=>exitTrigger(A,e,x,y)),roomy=(x,y)=>{let n=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if(ok(x+i,y+j))n++;return n>=15};
  for(const [dx,dy] of offs){const x=ex.tx+dx,y=ex.ty+dy;if(ok(x,y)&&roomy(x,y))return{x:x*T+8,y:y*T+8}}
  for(const [dx,dy] of offs){const x=ex.tx+dx,y=ex.ty+dy;if(ok(x,y))return{x:x*T+8,y:y*T+8}}
  return A.start||null}
// from: the map key of the area you came from, so you arrive at the matching exit (up the crypt stairs -> crypt mouth).
function enterZone(id,from,at){
  if(MM.dirty&&!simState.busy)mmSave(); // keep what you explored in the area you're leaving
  // A fresh dungeon run (v0.66): walking into an instance from outside it rebuilds every floor (flood back, seals shut,
  // chests full, every mob up). Going between its floors (down the Prior's stairs, back up) keeps the same run.
  const tgt=AREA_OF[id],fresh=!!(tgt&&MAPS[tgt].instance&&!(from&&MAPS[from]&&MAPS[from].instance));
  // v0.92: only floors you've already walked are thrown away; one built ahead of time (prebuildNext) is still untouched.
  if(fresh)Object.keys(MAPS).forEach(k=>{if(MAPS[k].instance&&AREAS[k]&&AREAS[k].used)delete AREAS[k]});
  zoneId=id;const A=curArea();if(A)A.used=1;
  if(id==='dun'){map=DUN.map;MW=DUN.w;MH=DUN.h;world=DUN.world;spawns=dunSpawns();}
  else if(id==='arena'){map=ARENA.map;MW=ARENA.w;MH=ARENA.h;world=ARENA.world;spawns=[];}
  else if(A){map=A.map;MW=A.w;MH=A.h;world=A.world;spawns=A.spawns;}
  else{map=overMap;MW=40;MH=30;world=overWorld;spawns=overSpawns;}
  WW=MW*T;WH=MH*T;
  mobs.length=0;spawns.forEach(sp=>{sp.mob=null;if(sp.gone){sp.timer=Infinity;return}sp.timer=0;spawn(sp)}); // gone = killed earlier this dungeon run
  if(A&&A.rare){A.rare.sp.mob=null;if(A.rare.sp.up)spawn(A.rare.sp)} // a rare still out there waits for you (no reroll by walking in and out)
  player.target=null;player.tx=null;player.cast=null;player.queued=null;bubbles.length=0;parts.length=0;floats.length=0;
  if(id==='dun'){run.t0=time;run.kills=0;run.xp=0;run.loot=[];run.chest=null;run.portal=null;player.x=DUN.start.x;player.y=DUN.start.y;log('Old Zone: the first crypt (frozen, kept to compare).','#c8a0ff');floatText(player.x,player.y-30,'Old crypt','#c8a0ff',true)}
  else if(id==='arena'){player.x=ARENA.start.x;player.y=ARENA.start.y;log('Testing grounds. Spawn mobs from the DEV panel.','#ff8a80')}
  else if(A){const ex=(at&&A.exits.find(e=>e.name===at))||(from&&A.exits.find(e=>e.to===from)),p=ex?areaSpot(A,ex,player.lastMove):A.start;player.x=p.x;player.y=p.y;player.atExit=ex||null;player.exitGuard=ex||null;player.exitGuardT=time;player.atSummon=null;
    const col=(AREA_TINT[A.tint]||{}).text||'#9fd8c0';
    log(id==='crypt'&&from==='wolfwood'?'You duck into the old tunnel. It slopes down into cold blue light.':id==='crypt'?'You descend the stairs into the crypt. Cold air and old bone, and somewhere below, candles still burning.':from==='crypt'&&id==='wolf'?'You climb out of the tunnel into a hillside of mossy boulders. Firs all around.':from==='crypt'?'You climb back up into the Sunken Graveyard.':from==='rat_tunnel'?'You climb out of the dark into the open air.':A.enter||('You stand in the '+A.name+'.'),col);
    floatText(player.x,player.y-30,A.name,col,true)}
  else{player.x=DOOR.x;player.y=DOOR.y+22;log('You climb back out into the graveyard.','#9aa')}
  run.cryptT0=id==='crypt'?time:null;
  slowArea=A&&A.slow&&A.slow.indexOf(1)>=0?A:null; // flood water slows wading (fx.js moveToward)
  // An instance (v0.63, Dungeon 1): a fresh run every time you walk in. The stairs are sealed again, its chests are full,
  // and the run clock and tally start (shown on the way out).
  // v0.66: only a fresh run resets (the floors were just rebuilt above); run.home = the floor you came in by.
  if(fresh)finaleReset();else if(finale.on)finaleAbort(); // v0.79: a new run starts clean; leaving the floor mid-finale puts it back to wait
  if(A&&A.instance&&fresh){run.t0=time;run.kills=0;run.xp=0;run.loot=[];run.chest=null;run.portal=null;run.atPortal=false;run.wakes=0;run.home=A.id}
  player.held=0;player.stunT=0;player.mireT=0;player.tollT=0;
  if(pet&&pet.charm)pet=null; // a charmed mob belongs to the zone you left
  if(pet){pet.x=player.x-10;pet.y=player.y+4;pet.target=null;}
  if(pet2){pet2.x=player.x+10;pet2.y=player.y+4;pet2.target=null;}
  decoy=null;grounds.length=0;traps.length=0;hazards.length=0;
  player.onTile=tileAt(player.x,player.y);
  arriveSafe(); // v0.77: nothing jumps you on arrival
  prebuildNext(); // v0.92: build the areas next door in spare moments so the next doorway doesn't freeze
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
    const c=20+Math.floor(rr(0,15));inv.copper+=c;log('You open the chest: '+c+' copper.','#c9a227','loot');(run.chest.items||[pick(UNCOMMONS)]).forEach((id,i)=>giveItem(id,1,i));
    if(run.chest.offer){renderChestPick();log('Three things lie in the chest. Take one.','#ffd27a')}else lootPillar(run.chest.x,run.chest.y,run.chest.items||[]);saveInv();}
  if(inst&&run.portal){const near=dist(player,run.portal)<10;if(near&&!run.atPortal)finishRun();run.atPortal=near;}
  const A=curArea();
  if(A){checkSummon(A);checkChests(A);checkBars(A);checkSeals(A);checkLocks(A);const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T),ex=A.exits.find(e=>exitTrigger(A,e,tx,ty)); // v0.94: doorways fire under your feet, not a tile early
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
    if(t===10)prompt('Old crypt','Old Zone: the first crypt, kept to compare. The Skeleton King waits at the end. Anything you pull will chase you until one of you dies.','Enter',()=>enterZone('dun'));
    if(t===8&&zoneId==='arena'){prompt('Leave the testing grounds?','Back to the crossroads.','Leave',()=>enterZone('cross'));}
    else if(t===8){if(inCombat())log('You can not leave while something is chasing you.','#ff8a80');else prompt('Leave Dungeon 1?','Leaving from the entrance resets the dungeon. Anything still alive will be back next time.','Leave',()=>enterZone('gy'));}
  }
}
// The Skeleton King: Bone Throw (v0.102, was a shadow bolt; same rules: a 2s cast you can see coming) and calls two skeletons at half health.
// Counters: stun or fear it mid-cast (Evade and Feign Death also break it off), or be out of range,
// Deflecting or inside Divine Aura when it lands. While casting it stands still. Returns true while casting.
// An attack slow on it slows the casting too (cast bar fills slower, longer wait between bolts).
const BOLT={first:3,every:5,cast:2,range:110}; // first cast after 3s, then 5s between casts: one bolt about every 7s
// A stun, fear, sleep, Evade or Feign Death (or the fight ending) breaks off a boss's cast.
function interruptCast(m){if(!m.casting)return;const c=m.casting;m.casting=null;m.bolt=m.def.cast?m.def.cast.every:BOLT.every;if(c.heal)m.healCd=m.def.heal.every*0.6;if(c.grasp)m.graspCd=GRASP.every*0.6;if(c.toll)m.tollCd=TOLL.every*0.6;if(m.finale&&(c.toll||c.grasp))finaleNext(c.toll?'toll':'grasp');floatText(m.x,m.y-34,'Interrupted!','#9fb8e0');log(cap(m.def.name)+"'s spell is interrupted!",'#9fb8e0')}
function bossThink(m,dt){
  // The Enchanter's Slow Mind slows its spellcasting too: longer casts, longer gaps. The Shaman's Drowsy only slows attacks (v0.24).
  if(m.aslow>0&&m.slowCast)dt/=(m.aslowX||1.6);
  if(m.casting){m.casting.t+=dt;
    if(m.casting.bone&&!m.casting.thrown&&m.casting.t>=m.casting.dur-BONE_FLIGHT)boneLaunch(m); // thrown a moment early so it lands with the hit (looks only)
    if(m.casting.t<m.casting.dur)return true;
    m.casting=null;m.bolt=BOLT.every;
    if(dist(m,player)>BOLT.range){boneLand(m,'miss');floatText(player.x,player.y-20,'MISS','#c8a0ff');log('The bone falls short. You were out of range.','#9fb8e0');return false}
    burst(player.x,player.y-8,'#e8e0c8',8); // bone shards (the same roll count as the old purple burst, so the sim is unchanged)
    if(player.buffs.deflect>0){boneLand(m,'dodge');floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You knock the bone aside.','#9fb8e0');return false}
    boneLand(m,'hit');
    let dmg=tankMods((8+2*m.lv)*rr(0.85,1.15));dmg=Math.max(1,Math.round(dmg));if(dev.god)dmg=0;dmg=Math.round(shieldDmg(dmg));player.hp-=dmg;if(dmg>0)floatText(player.x,player.y-20,String(dmg),'#c8a0ff');log('The Skeleton King hurls a bone at YOU for '+dmg+'.','#c8a0ff');if(player.hp<=0&&!lastStand())playerDie(m);
    return false}
  m.bolt=(m.bolt===undefined?BOLT.first:m.bolt)-dt;
  if(m.bolt<=0&&dist(m,player)<BOLT.range){m.casting={name:'Bone Throw',t:0,dur:BOLT.cast,bone:1};floatText(m.x,m.y-34,'Bone Throw!','#e8e0c8');
    log('The Skeleton King raises a bone to throw! Stun or fear him, or get out of range.','#c8a0ff');return true}
  if(!m.added&&m.hp<m.maxhp/2){m.added=true;log('The Skeleton King calls the dead to its side!','#ffb37a');
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
  if(!m.fled&&wornTrick('noFlee'))return false; // Greyfang's Ruff: hurt wolves can't run from you (pink trick)
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
  if(Math.hypot((player.x-h.x)/h.r,(player.y-h.y)/(h.r*0.6))<=1)mobSpellHit(h.m,(8+2*h.m.lv)*(h.mult||BRAND.x),h.label||'Ember Brand','#ff8a3c');else log('The embers flare where you stood.','#9aa')}}

/* ---------- Dungeon 1 (v0.63): the altar switch, menders, Grasp of the Deep, Toll, Candle Wake ---------- */
// The altar: walk up to it and the stone slab behind it grinds aside, opening the stairs down. Shut again on every visit.
function checkSeals(A){A.seals.forEach(sl=>{if(sl.open||!sl.obj||sl.named)return;const o=sl.obj,tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);
  const near=tx>=o.x-1&&tx<=o.x+o.w&&ty>=o.y-1&&ty<=o.y+o.h+1;
  if(near&&!sl.near){sl.open=true;for(let y=sl.y0;y<=sl.y1;y++)for(let x=sl.x0;x<=sl.x1;x++)A.map[y][x]=0;pathReset(); // mobs can path through it now
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
// Grasp of the Deep (the Drowned Prior; reworked v0.66, owner Nov 21: "slow you down hard", not a hold): ripples spread on
// spots round you (a boss bar mid-screen, 1.5 s), then pale hands rise there: still on one = slowed hard for a few seconds
// and a light hit. Stun or fear stops it.
// Boss pass (v0.79, owner Nov 24: "too easy to walk around"): three spots, not one: under you, one where you're heading
// (so walking straight on doesn't save you) and one beside you. And every so often one of his drowned dead climbs out of
// the water to join him (two at most).
const GRASP={first:5,every:9,dur:1.5,r:15,slow:3.5,x:0.6,ahead:1.0,side:26},MIRE_SLOW=0.35;
const RISEN={first:12,every:18,max:2,total:2,lv:14}; // total: per fight (v0.79: endless risers stalled a kiting Bard forever)
// Toll (the Bellringer). Boss pass (v0.79, owner Nov 24: "quiet and bland"): graded by distance. Close in you're stunned,
// longer the closer (stunMax right next to him down to stunMin at stunR); further out you're slowed, fading with distance
// to slowR (about the size of his foundry). A sound wave rolls out, the screen shakes and dust falls from the ceiling.
const TOLL={first:4,every:10,dur:1.5,stunR:36,stunMax:3,stunMin:1,slowR:150,slow:3,slowMax:0.5,x:1.2};
const inWater=e=>{const A=slowArea;if(!A)return false;const x=Math.floor(e.x/T),y=Math.floor(e.y/T);return x>=0&&y>=0&&x<A.w&&y<A.h&&!!A.slow[y*A.w+x]};
const finX=m=>m.finale?FINALE.dmg:1; // the finale's returning bosses hit softer
const onSpot=(s)=>Math.hypot((player.x-s.x)/GRASP.r,(player.y-s.y)/(GRASP.r*0.6))<=1;
function graspThink(m,dt){
  if(m.def.grasp&&m.state==='chase')riseDead(m,dt);
  if(m.casting&&m.casting.grasp){const c=m.casting;c.t+=dt;if(c.t<c.dur)return true;m.casting=null;m.graspCd=GRASP.every;if(m.finale)finaleNext('grasp');
    let caught=false;
    c.spots.forEach(s=>{for(let k=0;k<5;k++){const an=k*1.257+rr(-0.3,0.3);hands.push({x:s.x+Math.cos(an)*GRASP.r*0.7,y:s.y+Math.sin(an)*GRASP.r*0.42,t:0,life:1.4})}
      if(!caught&&onSpot(s))caught=true});
    if(caught){player.mireT=GRASP.slow;hands.push({x:player.x,y:player.y,t:0,life:GRASP.slow,on:1});
      floatText(player.x,player.y-28,'SLOWED','#9fd8c0',true);log('Pale hands rise out of the water and drag at your legs!','#9fd8c0');mobSpellHit(m,(8+2*m.lv)*GRASP.x*finX(m),'Grasp of the Deep','#9fd8c0')}
    else log('Pale hands rise all round you and close on nothing.','#9fb8e0');
    return false}
  if(m.casting)return false;
  if(m.finale){if(!finaleTurn('grasp')||dist(m,player)>200)return false}
  else{m.graspCd=(m.graspCd===undefined?GRASP.first:m.graspCd)-dt;if(m.graspCd>0||dist(m,player)>=160)return false}
  // Where you're heading: the way you face, about a second of walking on. A spot inside a wall slides back toward you.
  const ah=PSPEED*GRASP.ahead,fx=player.fx||0,fy=player.fy||0,side=rng()<0.5?-1:1,spots=[{x:player.x,y:player.y}];
  const fit=(x,y)=>{for(let k=0;k<4&&blocked(x,y);k++){x=(x+player.x)/2;y=(y+player.y)/2}return{x:x,y:y}};
  if(fx||fy)spots.push(fit(player.x+fx*ah,player.y+fy*ah));
  spots.push(fit(player.x+(fy?-fy:1)*side*GRASP.side,player.y+(fx||0)*side*GRASP.side*0.6));
  m.casting={name:'Grasp of the Deep',t:0,dur:GRASP.dur,grasp:1,boss:1,spots:spots};floatText(m.x,m.y-34,'Grasp of the Deep!','#9fd8c0');
  log('The water ripples all round you! Find still water.','#9fd8c0');return true}
// His drowned dead (v0.79): now and then, while he fights in his water, one claws up out of it beside him (two up at most).
// Two per fight at most (they reset if he walks home). They give no loot and never come back once killed.
function riseDead(m,dt){if(!inWater(m))return;m.riseCd=(m.riseCd===undefined?RISEN.first:m.riseCd)-dt;if(m.riseCd>0)return;m.riseCd=RISEN.every;
  m.risen=(m.risen||[]).filter(o=>!o.dead);if(m.risen.length>=RISEN.max||(m.riseN||0)>=RISEN.total)return;m.riseN=(m.riseN||0)+1;
  let x=m.x,y=m.y;for(let k=0;k<8;k++){const an=rng()*6.283,qx=m.x+Math.cos(an)*rr(18,34),qy=m.y+Math.sin(an)*rr(12,22);if(!blocked(qx,qy)){x=qx;y=qy;break}}
  const d=spawn({type:'dead',x:x,y:y,timer:0,mob:null,group:m.sp.group,lv:[RISEN.lv,RISEN.lv],noRespawn:true});d.noLoot=1;d.state='chase';d.threat.p=1;m.risen.push(d);
  burst(x,y-4,'#9fd8c0',12,true);floatText(x,y-20,'rises','#9fd8c0');log('The water churns, and one of the drowned dead claws its way up!','#9fd8c0')}
// A seal that opens when a named dies (v0.66, Dungeon 1: the Drowned Prior's death drains the flood and uncovers the stairs down).
// v0.79: the Bellringer holds the way on from his foundry the same way (an iron gate over the passage north).
function namedSeal(m){const A=curArea();if(!A)return;A.seals.forEach(sl=>{if(sl.open||!sl.named||sl.named.sp!==m.sp)return;
  sl.open=true;sl.openT=time;for(let y=sl.y0;y<=sl.y1;y++)for(let x=sl.x0;x<=sl.x1;x++)A.map[y][x]=0;pathReset();
  const drained=drainFlood(A),cx=(sl.x0+sl.x1+1)*T/2,cy=sl.y0*T+12;burst(cx,cy,drained?'#9fd8c0':'#8a8690',18,true);floatText(cx,cy-16,'The way on','#f0c890',true);
  if(drained){log('The flood drains away through the cracks with a long gurgle. At the north wall, steps rise out of the silt.','#f0c890');banner('The flood drains','Steps lead down at the north wall','#9fd8c0')}
  else{log('With a groan of iron, the gate at the north end of the foundry swings open.','#f0c890');banner('The gate opens','The way north is clear','#f0c890')}})}
// The flood goes: its water becomes wet stone (tile Z), nothing wades any more, and the floor is painted again.
function drainFlood(A){if(!A.slow||A.slow.indexOf(1)<0)return false;
  A.rows=A.rows.map(r=>r.replace(/z/g,'Z'));A.slow.fill(0);if(slowArea===A)slowArea=null;
  A.trees=[];A.world=paintArea(A);if(curArea()===A)world=A.world;return true}
// Locked rooms (v0.71, owner Nov 21: "the door closes behind you, then water fills the whole room, so they have to walk slow
// no matter what"). Step into the Drowned Prior's chamber while he's up: a portcullis slams down over the door behind you,
// then the flood spreads out from the middle pool over every dry floor tile in about 3 s. No dry ground left, so the whole
// fight is slow wading (him and his dead too), and his Grasp ripples still ask you to step off them. His death drains it all
// and lifts the portcullis. If you die in there, the water sinks back and the door opens, so the next try starts the same.
const RISE={dur:3,step:0.4}; // seconds for the water to reach the walls; how often the floor gets repainted while it rises
const inRoom=(r,x,y)=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1;
function repaintArea(A){A.trees=[];A.world=paintArea(A);if(curArea()===A){world=A.world;slowArea=A.slow.indexOf(1)>=0?A:null}}
function setDoor(A,L,v){for(let y=L.y0;y<=L.y1;y++)for(let x=L.x0;x<=L.x1;x++)A.map[y][x]=v;pathReset()} // 5 = shut, 0 = open
function checkLocks(A){if(!A.locks)return;A.locks.forEach(L=>{if(L.done)return;
  if(L.named&&L.named.sp.gone){if(L.shut)setDoor(A,L,0);L.shut=false;L.rise=null;L.done=true;L.openT=time; // he's dead: the drain already ran (namedSeal)
    log('With a rattle of chains, the portcullis behind you rises.','#f0c890');return}
  if(L.shut){if(L.rise)riseStep(A,L);return}
  const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);if(player.dead||!inRoom(L.room,tx,ty))return;
  if(Math.abs(ty-L.y0)<2&&Math.abs(tx-(L.x0+L.x1)/2)<2.5)return; // a couple of steps in first, so the slam lands behind you, not on you
  L.shut=true;L.closeT=time;setDoor(A,L,5);
  // Every dry, open floor tile in the room floods, nearest the middle first (the pool spreads to the walls). Tiles under
  // things that stand on the floor (braziers) stay dry: their stone footings stick up out of the water.
  const r=L.room,cx=(r.x0+r.x1)/2,cy=(r.y0+r.y1)/2,list=[];
  for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++)if(A.map[y][x]===0&&!A.slow[y*A.w+x]&&AREA_TILES[A.rows[y][x]].walk)list.push({x:x,y:y,d:Math.hypot((x-cx)/(r.x1-r.x0+1),(y-cy)/(r.y1-r.y0+1))});
  const dmax=Math.max(0.01,...list.map(q=>q.d));list.forEach(q=>{q.at=RISE.dur*q.d/dmax});list.sort((a,b)=>a.at-b.at);
  L.rise=list;L.risen=[];L.t0=time;L.painted=time;
  // A pet left in the doorway or the hall comes in with you rather than ending up shut out.
  [pet,pet2].forEach(p=>{if(p&&!inRoom(r,Math.floor(p.x/T),Math.floor(p.y/T))){p.x=player.x+(p===pet?-10:10);p.y=player.y+4;p.target=null}});
  const dx=(L.x0+L.x1+1)*T/2,dy=L.y0*T+8;burst(dx,dy,'#8a8690',14,true);floatText(dx,dy-14,'SLAM','#f0c890',true);
  log('A portcullis slams down behind you! Water wells up through the cracks in the floor.','#9fd8c0');banner('The door slams shut','The water is rising','#9fd8c0')})}
function riseStep(A,L){const t=time-L.t0;if(time-L.painted<RISE.step&&L.rise.length&&L.rise[L.rise.length-1].at>t)return;
  let n=0;while(L.rise.length&&L.rise[0].at<=t){const q=L.rise.shift();q.c=A.rows[q.y][q.x];A.rows[q.y]=A.rows[q.y].slice(0,q.x)+'z'+A.rows[q.y].slice(q.x+1);A.slow[q.y*A.w+q.x]=1;L.risen.push(q);n++}
  L.painted=time;if(n)repaintArea(A);
  if(!L.rise.length){L.rise=null;log(L.doneMsg||'The water stops rising: knee-deep from wall to wall.','#9fd8c0')}}
// You died in a locked room: the water sinks back to the middle pool and the portcullis lifts, ready for the next try.
function resetLocks(){const A=curArea();if(!A||!A.locks)return;A.locks.forEach(L=>{if(!L.shut||L.done)return;
  L.shut=false;L.rise=null;setDoor(A,L,0);(L.risen||[]).forEach(q=>{A.rows[q.y]=A.rows[q.y].slice(0,q.x)+q.c+A.rows[q.y].slice(q.x+1);A.slow[q.y*A.w+q.x]=0});L.risen=[];repaintArea(A)})}
// The great ash wisp: every so often it flares and a ring of fire spreads round where it hangs; 1.6 s to get out of it
// (or drag the fight away from it). Uses the same ground hazards as Ember Brand.
const GBURN={first:4,every:8,dur:1.6,r:34,x:1.1};
function burnThink(m,dt){if(m.casting)return;m.burnCd=(m.burnCd===undefined?GBURN.first:m.burnCd)-dt;if(m.burnCd>0||dist(m,player)>GBURN.r+30)return;m.burnCd=GBURN.every;
  hazards.push({x:m.x,y:m.y,r:GBURN.r,t:0,dur:GBURN.dur,m:m,mult:GBURN.x,label:'Fire Ring'});floatText(m.x,m.y-28,'flares!','#ff8a3c');burst(m.x,m.y-10,'#ffd27a',10);
  log(cap(m.def.name)+' flares up! Get out of the ring of fire.','#ff8a3c')}
// Toll: he heaves the bell's clapper up for 1.5 s (a bar over his head), then slams it down. Counter: step back to mid range
// (slowed, not stunned), or stun him first. In the finale the ring also knocks Grasp's hands back down.
function tollThink(m,dt){
  if(m.casting&&m.casting.toll){m.casting.t+=dt;if(m.casting.t<m.casting.dur)return true;m.casting=null;m.tollCd=TOLL.every;if(m.finale)finaleNext('toll');
    tollRing(m);return false}
  if(m.casting)return false;
  if(m.finale){if(!finaleTurn('toll')||dist(m,player)>TOLL.slowR)return false}
  else{m.tollCd=(m.tollCd===undefined?TOLL.first:m.tollCd)-dt;if(m.tollCd>0||dist(m,player)>=TOLL.slowR*0.8)return false}
  m.casting={name:'Toll',t:0,dur:TOLL.dur,toll:1,boss:1};floatText(m.x,m.y-34,'heaves the clapper','#ffd27a');
  log(cap(m.def.name)+' heaves the clapper overhead! Get back!','#ffd27a');return true}
function tollRing(m){const d=dist(m,player);
  rings.push({x:m.x,y:m.y,r:TOLL.stunR,t:0,life:0.5},{x:m.x,y:m.y,r:TOLL.slowR,t:0,life:1.1,col:'#e8dcc0'},{x:m.x,y:m.y,r:TOLL.slowR*0.7,t:-0.15,life:1.1,col:'#c8b890'});
  shake(3,0.45);burst(m.x,m.y-10,'#ffd27a',14,true);
  for(let k=0;k<26;k++)parts.push({x:player.x+rr(-110,110),y:player.y+rr(-130,30),vx:rr(-3,3),vy:rr(30,60),t:0,life:rr(0.7,1.3),col:k%3?'#6e6a72':'#8a8690'}); // dust off the ceiling
  // The bell's ring knocks the hands back down (finale: the safe spot is mid range, slowed but not stunned).
  for(let i=hands.length-1;i>=0;i--)hands.splice(i,1);player.mireT=0;
  if(player.dead)return;
  if(d<=TOLL.stunR){const s=(TOLL.stunMax-(TOLL.stunMax-TOLL.stunMin)*(d/TOLL.stunR))*((wornTrick('stun')||{}).stun||1); /* Bellringer's Band */player.stunT=s;player.cast=null;
    floatText(player.x,player.y-28,'STUNNED','#ffd27a',true);log('The toll rings through your skull! You are stunned ('+s.toFixed(1)+' s).','#ffd27a');mobSpellHit(m,(m.def.dmg+m.def.dmgl*m.lv)*TOLL.x*finX(m),'Toll','#ffd27a')}
  else if(d<=TOLL.slowR){const f=1-(d-TOLL.stunR)/(TOLL.slowR-TOLL.stunR);player.tollX=1-TOLL.slowMax*f;player.tollT=TOLL.slow;
    floatText(player.x,player.y-28,'SLOWED','#e8dcc0',true);log('The toll booms through the room and your legs go heavy.','#e8dcc0')}
  else log('The toll booms out. You were far enough away.','#9fb8e0')}
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
/* ---------- Dungeon 1 boss pass (v0.79, owner Nov 24): wail and vanish, then the finale ---------- */
// The Drowned Prior and the Bellringer can't be skipped (each holds the way on), and neither dies in his own room: at half
// health he wails and vanishes (the Prior sinks into his water, the Bellringer into the dark; a proper animation comes
// later). That ends his fight: XP, his drop, the lock and seal open, his chest is free. When Brother Malrec dies, both come
// back to avenge him, toned down (FINALE.hp of their solo health, FINALE.dmg of the damage), and they take turns on one
// clock (Toll, a gap, Grasp, a gap...), never both winding up at once. The flood rises in from the doorway, and a ring of
// dry stone round the middle of the sanctum shrinks over FINALE.rise seconds, then holds. Water drags you toward the Prior.
// Malrec's chest and the way out come after the finale. Die in it: the water sinks back, the two go, and walking back
// into the sanctum starts it again.
const VANISH={at:0.5};
const FINALE={hp:0.5,dmg:0.75,gap:4,first:2.5,pass:3,rise:60,ring:3,drag:10};
const finale={on:false,done:false,armed:false,turn:'toll',cd:0,mobs:[],L:null,at:null,A:null}; // A = the floor it's on
function finaleReset(){finale.on=false;finale.done=false;finale.armed=false;finale.mobs=[];finale.L=null;finale.at=null;finale.A=null}
function vanishMob(m){const prior=!!m.def.grasp;m.casting=null;m.vanished=1;
  for(let k=0;k<26;k++)parts.push({x:m.x+rr(-6,6),y:m.y+rr(-16,2),vx:rr(-8,8),vy:prior?rr(-4,14):rr(-22,-6),t:0,life:rr(0.6,1.4),col:prior?(k%2?'#9fd8c0':'#33505c'):(k%2?'#2a2630':'#5c5866')});
  floatText(m.x,m.y-34,'WAIL!','#d8e0ff',true);shake(2,0.3);
  log(prior?cap(m.def.name)+' lets out a drowned wail and sinks into the black water. He is not gone.':cap(m.def.name)+' howls, swings the clapper wide, and melts into the dark. You haven\'t seen the last of him.','#d8e0ff');
  killMob(m,'vanish');const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1)}
// One clock for the finale's two casts: true when it's this kind's turn (or the other one is down) and the gap is over.
function finaleTurn(kind){if(finale.cd>0)return false;const other=finale.mobs.find(o=>o.def[kind==='toll'?'grasp':'toll']);
  return finale.turn===kind||!other||other.dead}
function finaleNext(kind){finale.turn=kind==='toll'?'grasp':'toll';finale.cd=FINALE.gap}
function startFinale(x,y,lv){const A=curArea();finale.A=A;finale.on=true;finale.armed=false;finale.at={x:x,y:y,lv:lv};finale.turn='toll';finale.cd=FINALE.first;finale.mobs=[];
  ['bellringer','prior'].forEach((t,i)=>{let bx=x+(i?44:-44),by=y+14;if(blocked(bx,by)){bx=x;by=y+14}
    const b=spawn({type:t,x:bx,y:by,timer:0,mob:null,group:'finale',lv:[lv,lv],noRespawn:true});
    b.finale=1;b.noLoot=1;b.maxhp=Math.round(b.maxhp*FINALE.hp);b.hp=b.maxhp;b.state='chase';b.threat.p=1;b.graspCd=99;b.tollCd=99;finale.mobs.push(b);
    for(let k=0;k<18;k++)parts.push({x:bx+rr(-6,6),y:by+rr(-14,4),vx:rr(-6,6),vy:rr(-20,-4),t:0,life:rr(0.6,1.2),col:i?'#9fd8c0':'#5c5866'})});
  shake(3,0.5);log('Brother Malrec falls, and the bell tolls by itself. Out of the dark and the water they come back for him: the Bellringer and the Drowned Prior!','#d8e0ff');
  banner('They return','The Bellringer and the Drowned Prior','#9fd8c0');
  // The flood (an instance only): every open floor tile in the sanctum floods except a ring round the middle. Farthest
  // from the middle first, the doorway sooner, so water pours in at the door and the dry ground closes in, then holds.
  const R=A&&A.finale;if(!R)return;const cx=(R.x0+R.x1+1)/2,cy=(R.y0+R.y1+1)/2,dx=(R.x0+R.x1+1)/2,dy=R.y1+1,list=[];
  for(let ty=R.y0;ty<=R.y1;ty++)for(let tx=R.x0;tx<=R.x1;tx++){const d=Math.hypot(tx+0.5-cx,ty+0.5-cy);
    if(d<=R.ring||A.map[ty][tx]!==0||A.slow[ty*A.w+tx]||!AREA_TILES[A.rows[ty][tx]].walk)continue;list.push({x:tx,y:ty,d:d,dd:Math.hypot(tx+0.5-dx,ty+0.5-dy)})}
  const dmax=Math.max(R.ring+0.01,...list.map(q=>q.d)),ddmax=Math.max(0.01,...list.map(q=>q.dd));
  list.forEach(q=>{q.at=Math.max(0,FINALE.rise*(1-(q.d-R.ring)/(dmax-R.ring))-FINALE.rise*0.3*(1-q.dd/ddmax))});list.sort((a,b)=>a.at-b.at);
  finale.L={rise:list,risen:[],t0:time,painted:time,doneMsg:'The water stops rising. Only the ring of stone round the middle is still dry.'};
  log('Black water pours in under the door!','#9fd8c0')}
function finaleTick(dt){if(!finale.on&&!finale.armed)return;const A=curArea();
  // Died in it: walking back into the sanctum starts it again.
  if(finale.armed){const R=A&&A.finale;if(!R||player.dead)return;const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);
    if(tx>=R.x0&&tx<=R.x1&&ty>=R.y0&&ty<=R.y1-2)startFinale(finale.at.x,finale.at.y,finale.at.lv);return}
  if(finale.L&&finale.L.rise&&A)riseStep(A,finale.L);
  finale.cd-=dt;if(finale.cd<-FINALE.pass){finale.turn=finale.turn==='toll'?'grasp':'toll';finale.cd=0} // the one whose turn it is can't reach you: pass
  const pr=finale.mobs.find(o=>o.def.grasp&&!o.dead);
  if(pr&&!player.dead&&!(player.stunT>0)&&inWater(player)&&dist(pr,player)>20)moveToward(player,pr.x,pr.y,FINALE.drag,dt); // the water drags you toward him
  if(finale.mobs.length&&finale.mobs.every(o=>o.dead))finishFinale()}
function finishFinale(){finale.on=false;finale.done=true;const A=curArea();finaleDrain(finale.A);
  log('The two of them break apart into water and ash, and the monastery falls quiet at last.','#ffd27a');
  if(A&&A.instance&&finale.at)dungeonCleared(finale.at.x,finale.at.y)}
// The flood sinks back (the finale won, or you died in it).
function finaleDrain(A){const L=finale.L;if(!L||!A)return;L.rise=null;(L.risen||[]).forEach(q=>{A.rows[q.y]=A.rows[q.y].slice(0,q.x)+q.c+A.rows[q.y].slice(q.x+1);A.slow[q.y*A.w+q.x]=0});L.risen=[];finale.L=null;repaintArea(A)}
// You died, or left the floor, mid-finale: the two go, the water goes, and it waits for you in the sanctum.
function finaleAbort(){if(!finale.on)return;finale.mobs.forEach(o=>{if(!o.dead)killQuiet(o);const i=mobs.indexOf(o);if(i>=0)mobs.splice(i,1)});
  finale.mobs=[];finaleDrain(finale.A);finale.on=false;finale.armed=true}
// The end of the dungeon: Malrec's chest where he fell and the way out behind it (moved here from killMob in v0.79).
function dungeonCleared(x,y){const A=curArea();floatText(player.x,player.y-40,A.name+' cleared!','#ffd27a',true);log('A chest and a way out appear where Brother Malrec fell.','#ffd27a');
  run.chest={x:x,y:y+14,open:false};run.portal={x:x,y:y-12};banner(A.name+' cleared','in '+Math.floor((time-run.t0)/60)+':'+String(Math.round(time-run.t0)%60).padStart(2,'0'))}
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
  const guard=near&&!ch.near&&!ch.open?A.named.map(n=>n.sp.mob).find(m=>m&&!m.dead&&Math.hypot(m.hx-ch.x,m.hy-ch.y)<6*T):null;
  if(guard){log('The chest won\'t open while '+guard.def.name+' stands guard over it.','#c8b89a');ch.near=near;return}
  if(near&&!ch.near){if(ch.open&&A.instance)log('You already emptied this chest on this run.','#9aa');else if(ch.open){const mins=Math.max(1,Math.ceil((CHEST_REFILL-(time-ch.at))/60));log('The chest is empty. It looks like someone refills it now and then (about '+mins+' min).','#9aa')}else openChest(A,ch)}
  ch.near=near})}
function openChest(A,ch){
  const o=CHEST_ODDS[A.id]||CHEST_ODDS.crossroads,r=rng();
  let pool=r<o.rare?RARES:r<o.rare+o.unc?UNCOMMONS:COMMONS;if(!pool.length)pool=UNCOMMONS.length?UNCOMMONS:COMMONS;
  ch.open=true;ch.at=time;burst(ch.x,ch.y-4,'#ffd27a',16,true);
  const c=Math.floor(rr(o.cu,o.cu*2));inv.copper+=c;log('You open a hidden chest: '+c+' copper.','#c9a227','loot');
  if(pool.length)giveItem(pick(pool),1,0);if(rng()<LOOT.orbChest)giveItem('orb1',1,1);saveInv()}

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
    else if(c.kind==='deer'){
      // (v0.81, Wolfwood) a doe grazing by the trail: head down, now and then up to listen. Come closer and she freezes and
      // watches you; closer still and she bounds off into the trees and is gone until you've left.
      if(c.st==='sit'){c.hop-=dt;if(c.hop<=0){c.hop=vr(2,6);c.up=Math.random()<0.35?vr(1,2.5):0;if(Math.random()<0.3){const nx=c.hx+vr(-10,10),ny=c.hy+vr(-5,5);if(!blocked(nx,ny)){c.dir=nx>c.x?1:-1;c.x=nx;c.y=ny}}}
        if(c.up>0)c.up-=dt;c.alert=d<96&&player.dead<=0;if(c.alert)c.dir=player.x>c.x?1:-1;
        if(d<56&&player.dead<=0){const a=Math.atan2(c.y-player.y,c.x-player.x)+vr(-0.4,0.4);c.vx=Math.cos(a)*92;c.vy=Math.sin(a)*92;c.dir=c.vx>0?1:-1;c.st='run';c.t=0}}
      else if(c.st==='run'){const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;c.jump=Math.abs(Math.sin(c.t*9))*4;
        if(blocked(nx,ny)||c.t>1.6){c.st='gone';c.t=0;c.jump=0}else{c.x=nx;c.y=ny}}
      else if(c.t>14&&home>170){c.st='sit';c.x=c.hx;c.y=c.hy;c.t=0}}
    else if(c.kind==='eyes'){
      // (v0.82, owner: v0.81's two dots didn't read) a wolf watching from the treeline: a low dark head-and-shoulders
      // shape you can just make out against the trunks, two eyes with real eyeshine. It blinks and tilts its head;
      // walk toward it and it turns away (the eyes flick sideways and go out) and the shape slinks back into the trees.
      c.blink-=dt;if(c.blink<-0.18)c.blink=vr(1.8,5);c.tilt=Math.sin(time*0.4+c.ph)>0.7?1:0;
      if(c.st==='sit'&&d<84&&player.dead<=0){c.st='slink';c.t=0;c.away=player.x<c.x?1:-1}
      else if(c.st==='slink'){c.x+=c.away*22*dt;c.y-=10*dt;if(c.t>0.9){c.st='gone';c.t=0}}
      else if(c.st==='gone'&&c.t>14&&home>140){c.st='sit';c.x=c.hx;c.y=c.hy;c.t=0}}
    else if(c.kind==='cavefish'){if(c.a===undefined){c.a=Math.random()*6.28;c.rx=vr(16,30);c.ry=vr(5,9);c.sp=vr(0.25,0.4)*(Math.random()<0.5?1:-1);c.dart=0}
      if(c.dart>0)c.dart-=dt;else if(d<30&&player.dead<=0&&Math.random()<dt*3)c.dart=0.6;
      c.a+=c.sp*dt*(c.dart>0?5:1);const nx=c.hx+Math.cos(c.a)*c.rx,ny=c.hy+Math.sin(c.a)*c.ry;
      if(!A.wetV||A.wetV(nx,ny)>0.12){c.x=nx;c.y=ny}else c.sp=-c.sp} // turn back before the bank
    else if(c.kind==='owl'){c.blink-=dt;if(c.blink<-0.15)c.blink=vr(2,6);const dx=player.x-c.x;c.look=Math.abs(dx)<20?0:dx<0?-1:1}
  });
  if(A.waterSpots.length){A.ripT-=dt;if(A.ripT<=0){A.ripT=vr(0.5,1.4);const v=A.waterSpots.filter(w=>inView(w.x,w.y));if(v.length){const w=v[Math.floor(Math.random()*v.length)];A.rip.push({x:w.x+vr(-6,6),y:w.y+vr(-5,5),t:A.tint==='earth'?-0.4:0,drip:A.tint==='earth'})}if(A.tint==='earth')A.ripT+=vr(0.8,2)}} // in a cave the rings come from drips off the roof: a drop falls first, and less often
  A.rip.forEach(r=>r.t+=dt);A.rip=A.rip.filter(r=>r.t<1.6);
  if(A.chimneys.length){A.smokeT-=dt;if(A.smokeT<=0){A.smokeT=0.4;A.chimneys.forEach(ch=>{if(inView(ch.x,ch.y))A.smoke.push({x:ch.x+vr(-1,1),y:ch.y,t:0})})}}
  A.smoke.forEach(p=>{p.t+=dt;p.y-=7*dt;p.x+=(3+Math.sin(p.t*2))*dt});A.smoke=A.smoke.filter(p=>p.t<3.2);
}
// layer 0: on the ground, under everyone (frogs, crows on the ground, ripples). layer 1: up high, over everyone
// (perched and flying crows, the owl, bats, chimney smoke). Both before the lighting, so the night darkens them.
function drawAreaCritters(A,layer){
  if(!A.crit)return;const f=(x,y,w,h,col)=>{lx.fillStyle=col;lx.fillRect(Math.round(x),Math.round(y),w,h)};
  if(layer===0){
    A.rip.forEach(r=>{if(r.t<0){const h=-r.t*70;lx.globalAlpha=0.8;f(r.x,r.y-h-2,1,2,'#9ab8c0');lx.globalAlpha=1;return} // the falling drop
      const k=r.t/1.6,rad=1+k*(r.big?8:5);lx.globalAlpha=1-k;for(let a=0;a<14;a++){const an=a/14*6.283;f(r.x+Math.cos(an)*rad,r.y+Math.sin(an)*rad*0.45,1,1,k<0.4?AP.glint:AP.waterHi)}lx.globalAlpha=1});
    A.crit.forEach(c=>{if(c.st==='gone')return;
      if(c.kind==='frog')critGrid(c.jump>0?FROG_JUMP:FROG,c.x,c.y-(c.st==='leap'?c.jump:c.jump>0?2:0),c.dir);
      if(c.kind==='crow'&&c.ground&&c.st==='sit')critGrid(c.peck>0?CROW_PECK:CROW,c.x,c.y,c.dir);
      if(c.kind==='rabbit')critGrid(c.jump>0.5?RABBIT_HOP:c.nib>0&&Math.floor(time*8)%2?RABBIT_NIB:RABBIT,c.x,c.y-c.jump,c.dir);
      if(c.kind==='cavefish'){const dx=Math.cos(c.a),dy=Math.sin(c.a)*0.5,dir=dx>=0?1:-1,wig=Math.floor(time*(c.dart>0?16:5)+c.ph)%2;lx.globalAlpha=0.42;
        f(c.x-dir*2,c.y,4,1,'#c8d8d4');f(c.x+dir*2,c.y,1,1,'#e8f0ec');f(c.x-dir*3,c.y+(wig?-1:1)*0.6,1,1,'#a8bcb8');lx.globalAlpha=1} // pale cave fish under the water
      if(c.kind==='deer')critGrid(c.st==='run'?(c.jump>2?DEER_RUN:DEER):c.alert||c.up>0?DEER:DEER_GRAZE,c.x,c.y-(c.jump||0),c.dir)});
    return}
  A.crit.forEach(c=>{
    if(c.kind==='crow'&&(c.st==='fly'||(!c.ground&&c.st==='sit'))){const flap=c.st==='fly'&&Math.floor(time*10)%2;critGrid(c.st==='fly'?(flap?CROW_FLY2:CROW_FLY):c.peck>0?CROW_PECK:CROW,c.x,c.y,c.dir)}
    else if(c.kind==='eyes'&&c.st!=='gone'){const x=Math.round(c.x),y=Math.round(c.y),a=c.st==='slink'?Math.max(0,1-c.t/0.9):1;lx.globalAlpha=0.85*a;lx.fillStyle='#050607';
      lx.fillRect(x-5,y-3,11,6);lx.fillRect(x-4,y-5,2,2);lx.fillRect(x+3,y-5,2,2);lx.fillRect(x-7,y+2,15,4);lx.fillRect(x-3,y+3,7,2);lx.globalAlpha=1} // ears, head, shoulders
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
// Deer (v0.81), 14 x 10 facing right: a doe, red-brown with a lighter back and a white tail; head up (listening), head down (grazing), bounding.
const DEER=['...........kk.','..........kLLk','..........kLkk','..k.......kLk.','.kwkkkkkkkLLk.','.kLLLLLLLLLk..','.kDDDDDDDDDk..','..kDDDDDDDk...','..kk.k..k.kk..','..k..k..k..k..'];
const DEER_GRAZE=['..............','..............','..............','..k...........','.kwkkkkkkkkk..','.kLLLLLLLLLLk.','.kDDDDDDDDDLLk','..kDDDDDDDkLLk','..kk.k..k.kkk.','..k..k..k..k..'];
const DEER_RUN=['...........kk.','..........kLLk','..........kLkk','..........kLk.','.kkkkkkkkkLLk.','kwLLLLLLLLLk..','.kDDDDDDDDDk..','..kDDDDDDDk...','.k...kk....k..','k.....kk....k.'];
const CRIT_PAL={D:'#6e4e34',L:'#9a7452',k:'#0b0a0f',e:'#d8e070',g:'#4d7034',G:'#7aa04a',b:'#2a2733',h:'#4a4560',y:'#8d8692',r:'#6a5848',R:'#9a8670',w:'#e8e2d4'};
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
    if(c.kind==='eyes'&&(c.st==='sit'||(c.st==='slink'&&c.t<0.25))&&c.blink>=0){const x=Math.round(c.x)+(c.st==='slink'?c.away*2:0),y=Math.round(c.y)-1+c.tilt,ey=c.tilt;
      // eyeshine: a soft halo, an almond of pale gold with a bright core toward the nose; red is kept for monsters
      lx.globalCompositeOperation='screen';lx.globalAlpha=0.35;lx.fillStyle='#d8c860';lx.fillRect(x-5,y-1,4,3);lx.fillRect(x+2,y-1+ey,4,3);
      lx.globalAlpha=1;lx.fillStyle='#e8d870';lx.fillRect(x-4,y,3,1);lx.fillRect(x+2,y+ey,3,1);lx.fillStyle='#fffbd0';lx.fillRect(x-2,y,1,1);lx.fillRect(x+2,y+ey,1,1);lx.globalCompositeOperation='source-over'}
    if(c.kind==='owl'&&c.blink>=0){lx.fillStyle='#ffcf5a';const x0=Math.round(c.x)-3+c.look,y0=Math.round(c.y)-9;lx.fillRect(x0+2,y0+3,1,1);lx.fillRect(x0+4,y0+3,1,1)}});
}

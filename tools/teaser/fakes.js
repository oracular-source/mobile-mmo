// Teaser video only (tools/teaser/record.py injects this; the game never loads it).
// Fake "other players" for the trailer: multiplayer is phase 3, so these are drawn and steered here, never shipped.
// Each fake is a class's real 15x18 rags sprite with a name over its head. It walks with the game's own pathing, hits the
// game's own mobs (hitMob, so numbers, deaths and corpses are the real ones) and fires the class's spell colour.
//
// Draft 3 (owner, Nov 22: "make the players look as human as possible"). What makes them read as people, not bots:
//  - they notice things a moment late (a reaction delay per player) and don't all move at the same speed;
//  - each picks its own open, reachable spot around the fight (melee in close on different sides, casters back behind
//    the tank), and never stands inside another player;
//  - casters stand still while a cast bar fills, then the spell flies; now and then they step to a better spot;
//  - a tank takes the hits (mobs really turn on it), a healer watches health and heals whoever is lowest;
//  - after a fight they don't freeze: casters sit to rest, others drift a step, turn, wait for the group;
//  - walking together, followers trail the leader's actual footsteps a little behind, so a group bends round corners.
// Stuck rule (draft 2 had players grinding into walls): a player that wants to move but hasn't for 0.4 s gives up that
// spot and picks another; every stall is logged in __stuck so record.py can refuse a shot where anyone stayed stuck.
'use strict';
window.__fakes=[];window.__stuck=[];window.__tank=null;
const FAKE_IMG={};
const fakeImg=c=>FAKE_IMG[c]||(FAKE_IMG[c]=mkRags(c));
const FAKE_ROLE={warrior:'melee',rogue:'melee',monk:'melee',paladin:'melee',shadowknight:'melee',bard:'melee',
  wizard:'caster',magician:'caster',necro:'caster',enchanter:'caster',ranger:'caster',shaman:'caster',druid:'caster',cleric:'healer'};
const R01=()=>Math.random(),RR=(a,b)=>a+Math.random()*(b-a);

// ---------- Where to stand ----------
const tileOf=(x,y)=>({x:Math.floor(x/T),y:Math.floor(y/T)});
// Steps from (x,y) to every tile (the game's own distance map, cached), so "can I walk there?" is one lookup.
function reach(x,y){const g=tileOf(x,y);return pathField(g.x,g.y)}
function canReach(f,x,y){if(blocked(x,y))return false;const fl=reach(f.x,f.y),g=tileOf(x,y);if(g.x<0||g.y<0||g.x>=MW||g.y>=MH)return false;
  const v=fl[g.y*MW+g.x];return v!==PATH_FAR&&v<60}
const bodies=f=>__fakes.filter(o=>o!==f).map(o=>o.spot||o).concat(window.__hideHero?[]:[player]);
// The best open spot at about radius r from the target, as near as possible to the preferred angle. Skips spots taken by
// someone else, spots in walls, and spots this player already failed to reach (f.bad).
function pickSpot(f,t,r,ang){const others=bodies(f);
  for(let k=0;k<24;k++){const a=ang+(k%2?1:-1)*Math.ceil(k/2)*0.32,rr=r*(1+((k/6)|0)*0.18);
    const x=t.x+Math.cos(a)*rr,y=t.y+Math.sin(a)*rr*0.7;
    if((f.bad||[]).some(b=>Math.hypot(b.x-x,b.y-y)<6))continue;
    if(others.some(o=>Math.hypot(o.x-x,o.y-y)<9))continue;
    if(!canReach(f,x,y)||!clearLine(x,y,t.x,t.y-4))continue;
    return{x:x,y:y,a:a,tx:t.x,ty:t.y}}
  return null}
// A fake set down inside a wall or tree could never take a step, so nudge it to the nearest open ground first.
function openSpot(x,y){if(!blocked(x,y))return{x:x,y:y};for(let r=4;r<80;r+=4)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Y=y+Math.sin(a/16*6.283)*r;if(!blocked(X,Y))return{x:X,y:Y}}return{x:x,y:y}}

function addFake(cls,name,x,y,o){const sp=openSpot(x,y);const role=FAKE_ROLE[cls]||'melee';
  const f=Object.assign({fake:1,cls:cls,name:name,x:sp.x,y:sp.y,dir:R01()<0.5?-1:1,walk:0,moving:false,role:role,
    spd:RR(31,37),react:RR(0.2,0.55),reactT:0,cd:RR(0.3,1.4),lunge:0,path:null,fight:true,aggro:110,
    hp:100,maxhp:100,idleT:RR(1,4),stall:0,bad:[],spot:null,cast:null,lag:RR(0.35,0.8),trail:[]},o||{});
  if(f.sit)f.sitting=true;__fakes.push(f);return f}

// ---------- Moving ----------
// Walk toward (x,y); returns true on arrival. Tracks stalls: wanting to move but not getting anywhere.
function fakeGo(f,x,y,spd,dt){const before=Math.hypot(f.x-x,f.y-y);if(before<2.5){f.stall=0;return true}
  const arrived=pathTo(f,x,y,spd,dt);const after=Math.hypot(f.x-x,f.y-y);
  if(before-after<spd*dt*0.25){f.stall+=dt;if(f.stall>0.4){__stuck.push({name:f.name,x:Math.round(f.x),y:Math.round(f.y),fi:window.__fi||0});
    f.bad.push({x:x,y:y});if(f.bad.length>8)f.bad.shift();f.spot=null;f.stall=0;
    if(f.path&&f.path.length)f.path.shift();}}  // a waypoint it can't reach: skip it rather than grind
  else f.stall=0;
  return arrived||after<2.5}
// Players don't stand inside each other: a gentle push apart when two get closer than a body's width.
function separate(f,dt){const others=__fakes.filter(o=>o!==f);if(!window.__hideHero)others.push(player);
  others.forEach(p=>{const dx=f.x-p.x,dy=f.y-p.y,d=Math.hypot(dx,dy);
  if(d>0.01&&d<8){const k=(8-d)*3*dt,nx=f.x+dx/d*k,ny=f.y+dy/d*k*0.6;if(!blocked(nx,ny)){f.x=nx;f.y=ny}}})}

// ---------- Fighting ----------
const liveMob=m=>m&&!m.dead&&!m.def.drift;
// Who to hit: a set target, then the group's target (players assist), then anything already fighting near them.
function chooseTarget(f){
  if(liveMob(f.target))return f.target;
  if(f.target&&f.target.dead){f.target=null;f.post=RR(0.6,1.6)}  // the mob just died: a beat before turning to the next
  if(f.post>0)return null;
  const lead=f.assist||(window.__tank&&window.__tank!==f?window.__tank:null);
  if(lead&&lead.fake&&liveMob(lead.target))return lead.target;
  if(!window.__hideHero&&liveMob(player.target)&&player.target.state==='chase'&&dist(player.target,f)<f.aggro*1.6)return player.target;
  let t=null,bd=f.aggro;mobs.forEach(m=>{if(!liveMob(m))return;if(m.state!=='chase'&&!f.puller)return;const d=dist(m,f);if(d<bd){bd=d;t=m}});
  return t}
function fakeTick(dt){
  __fakes.forEach(f=>{
    const x0=f.x,y0=f.y;f.lunge=Math.max(0,f.lunge-dt);if(f.post>0)f.post-=dt;
    if(f.sitting){if(f.fight&&!f.sitStay&&chooseTarget(f)){f.sitting=false;f.reactT=f.react+0.3}else{tickHeal(f,dt);return}}
    if(f.path&&f.path.length&&f.path[0].wait>0){f.path[0].wait-=dt;idleFidget(f,dt)}
    else if(f.path&&f.path.length){const p=f.path[0];if(fakeGo(f,p.x,p.y,f.spd*(p.run?1.25:1),dt))f.path.shift();if(!f.path.length&&f.endSit){f.sitting=true;f.dir=f.endSit}}
    else if(f.follow){followTick(f,dt)}
    else if(f.fight)fightTick(f,dt);
    tickHeal(f,dt);
    if(!f.cast)separate(f,dt);
    const mv=Math.hypot(f.x-x0,f.y-y0);f.moving=mv>0.05;if(f.moving){f.walk+=dt;if(Math.abs(f.x-x0)>0.08)f.dir=f.x<x0?-1:1}
  });
}
// Followers walk where the leader walked a moment ago (its trail), a little off to the side, so a group bends round corners.
function followTick(f,dt){const L=f.follow;L.trail=L.trail||[];
  const back=Math.round(f.lag*30),p=L.trail[Math.max(0,L.trail.length-1-back)]||L;
  const tx=p.x+Math.cos(f.slot||0)*7,ty=p.y+Math.sin(f.slot||0)*4;
  if(Math.hypot(f.x-tx,f.y-ty)>5)fakeGo(f,tx,ty,f.spd*(Math.hypot(f.x-tx,f.y-ty)>26?1.2:1),dt);else{f.stall=0;idleFidget(f,dt)}
  if(f.fight&&chooseTarget(f)&&L.target){f.follow=null;f.reactT=f.react}}
function fightTick(f,dt){
  const t=chooseTarget(f);
  if(t!==f.target){f.target=t;f.spot=null;if(t){f.reactT=f.react;f.cast=null}}
  if(!t){f.cast=null;postFight(f,dt);return}
  f.afterT=0;
  if(f.reactT>0){f.reactT-=dt;f.dir=t.x<f.x?-1:1;return}        // noticing, turning toward it
  const bigMob=t.def.boss||t.def.named,melee=f.role==='melee',R=melee?(f===window.__tank?11:15)+(bigMob?4:0):RR(48,62);
  // Casters stand on the far side of the mob from the tank (or the hero), so they aren't in the way.
  const anchor=(window.__tank&&window.__tank!==f?window.__tank:(!window.__hideHero?player:f));
  if(!f.spot||Math.hypot(f.spot.tx-t.x,f.spot.ty-t.y)>(melee?6:26)){
    const base=melee?(f.slotA!==undefined?f.slotA:Math.atan2(f.y-t.y,f.x-t.x)):Math.atan2(anchor.y-t.y,anchor.x-t.x)+(f.slotA||RR(-0.6,0.6));
    f.spot=pickSpot(f,t,R,base)||{x:f.x,y:f.y,tx:t.x,ty:t.y}}
  if(f.cast){f.dir=t.x<f.x?-1:1;f.cast.t+=dt;if(f.cast.t>=f.cast.dur){const c=f.cast;f.cast=null;fakeAttack(f,t,c.big);f.cd=c.big?RR(0.4,0.9):RR(0.25,0.7)}return}
  const there=fakeGo(f,f.spot.x,f.spot.y,f.spd*(dist(f,t)>R*2.5?1.15:1),dt);
  if(!there){const d=dist(f,t);
    // In range already, with a clear shot and not in the melee pile: a person would just stop here, not walk round.
    if(!melee&&d<R*1.25&&d>34&&clearLine(f.x,f.y,t.x,t.y)){f.spot={x:f.x,y:f.y,tx:t.x,ty:t.y,a:Math.atan2(f.y-t.y,f.x-t.x)}}else return}
  f.dir=t.x<f.x?-1:1;f.cd-=dt;
  if(f.cd>0){if(melee&&R01()<dt*0.25&&f!==window.__tank)f.spot=pickSpot(f,t,R,(f.spot.a||0)+RR(-0.9,0.9))||f.spot;return} // melee shuffle round a bit
  const big=(f.bigCd===undefined?(f.bigCd=RR(1,3.5)):f.bigCd)<=0;if(big)f.bigCd=(f.bigEvery||4.5)+RR(0,2.5);
  if(melee){fakeAttack(f,t,big);f.cd=RR(1.0,1.5)+(big?0.4:0)}
  else{f.cast={t:0,dur:big?RR(1.3,1.8):RR(0.7,1.1),big:big,col:(SK[f.cls]||SK.wizard).col};
    if(R01()<0.12)f.spot=null;}  // once in a while a caster takes a step to a new spot before the next cast
}
// Between fights: nobody freezes. Casters sit to get mana back; others turn, take a step, wait.
function postFight(f,dt){f.afterT=(f.afterT||0)+dt;
  if(f.role!=='melee'&&f.afterT>RR(1.5,3)&&f.restAfter!==false&&!f.noRest){f.sitting=true;f.dir=R01()<0.5?-1:1;return}
  idleFidget(f,dt)}
function idleFidget(f,dt){f.idleT-=dt;if(f.idleT>0)return;f.idleT=RR(1.8,4.5);
  if(R01()<0.55)f.dir=-f.dir;else{const a=RR(0,6.283),x=f.x+Math.cos(a)*RR(5,12),y=f.y+Math.sin(a)*RR(3,7);if(canReach(f,x,y))f.path=[{x:x,y:y}]}}

// ---------- Health: tanks get hit, healers heal ----------
// record.py patches the game so a mob whose fakeT is a fake fights that fake (victim) and hits it through this.
window.__hurtFake=function(m,f){const dmg=Math.max(1,Math.round((m.def.dmg+m.def.dmgl*m.lv)*RR(0.7,1.2)));
  f.hp=Math.max(f.maxhp*0.3,f.hp-dmg*(f.armor||0.55));f.lunge=0.08;floatText(f.x,f.y-20,String(dmg),'#ff7070',0,'small')};
// Who needs healing most: fakes (by health) and the hero.
function lowest(){let best=null,bv=0.92;__fakes.forEach(o=>{const v=o.hp/o.maxhp;if(v<bv){bv=v;best=o}});
  if(!window.__hideHero&&!player.dead){const v=player.hp/maxHP(player.lvl);if(v<bv){bv=v;best=player}}return best}
function tickHeal(f,dt){if(f.role!=='healer'&&!f.heals)return;
  if(f.hcast){f.hcast.t+=dt;f.dir=f.hcast.who.x<f.x?-1:1;if(f.hcast.t<f.hcast.dur)return;const who=f.hcast.who;f.hcast=null;
    const amt=40+Math.floor(R01()*30);if(who===player)player.hp=Math.min(maxHP(player.lvl),player.hp+amt);else who.hp=Math.min(who.maxhp,who.hp+amt*0.8);
    floatText(who.x,who.y-22,'+'+amt,'#7dffa6',0,'hit');__sfx.push({k:'heal',x:who.x,y:who.y,t:0,life:1.1,o:who});f.hcd=RR(1.2,2.5);return}
  f.hcd=(f.hcd===undefined?RR(0.5,2):f.hcd)-dt;if(f.hcd>0)return;
  const who=lowest();if(!who){f.hcd=RR(0.4,1);return}
  f.sitting=false;f.cast=null;f.hcast={who:who,t:0,dur:RR(1.0,1.5)}}

/* ---------- Drawing ---------- */
function drawFake(f){
  const im=fakeImg(f.cls);if(!im)return;
  shadow(f.x,f.y,6);const wf=walkFrame(im,f.walk,f.moving);
  const lx2=f.lunge>0?f.dir*2:0;drawSprite(f.sitting?im:wf.im,f.x+lx2,f.y+1,f.dir,wf.bob,!!f.sitting);
}
// Names over heads (players' names in a soft blue, like an MMO), and a thin cast bar under the name while casting.
function drawNames(){
  const list=__fakes.slice();if(window.__heroName&&!window.__hideHero&&!(player.dead>0))list.push({x:player.x,y:player.y,name:window.__heroName,hero:1});
  cx.textAlign='center';cx.textBaseline='middle';cx.font='600 '+Math.round(9*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;
  list.forEach(o=>{const sx=(o.x-camX)*S,sy=(o.y-24-camY)*S;if(sx<-60||sx>cv.width+60||sy<-20||sy>cv.height+20)return;
    cx.strokeStyle='#000';cx.strokeText(o.name,sx,sy);cx.fillStyle=o.hero?'#ffe9a8':'#9fd0ff';cx.fillText(o.name,sx,sy);
    const c=o.cast||o.hcast;if(c){const w=22*dpr,h=2.5*dpr,y=sy+6*dpr,k=Math.min(1,c.t/c.dur);
      cx.fillStyle='rgba(0,0,0,0.75)';cx.fillRect(sx-w/2-dpr,y-dpr,w+2*dpr,h+2*dpr);cx.fillStyle=o.hcast?'#7dffa6':(c.col||'#ffe9a8');cx.fillRect(sx-w/2,y,w*k,h)}});
}
window.__drawFake=drawFake;window.__names=drawNames;window.addFake=addFake;

/* ---------- Shot helpers for shots.py ---------- */
window.H={
  god(){dev.god=true},
  at(x,y){const s=openSpot(x,y);player.x=s.x;player.y=s.y;player.tx=null;if(pet){pet.x=s.x-10;pet.y=s.y+4}},
  cam(x,y){window.__cam={x:Math.round(x-VW/2),y:Math.round(y-VH/2)}},
  // The camera eases after a moving point instead of snapping, like a person holding a camera.
  follow(o,dx,dy,k){const c=window.__camF||(window.__camF={x:o.x+(dx||0),y:o.y+(dy||0)});c.x+=(o.x+(dx||0)-c.x)*(k||0.06);c.y+=(o.y+(dy||0)-c.y)*(k||0.06);H.cam(c.x,c.y)},
  quiet(){floats.length=0;logMute=true},
  only(keep){mobs.forEach(m=>{if(!m.dead&&!keep(m))killQuiet(m)})},
  fight(o){window.__hf=o},
  // Keep a mob's health inside a band that slides from hi to lo (fractions) between frames i0 and i1. Real hits still land
  // and show; the band just means a boss is never killed on camera and the fight is seen from the middle (owner, draft 3).
  band(m,i,i0,i1,hi,lo){if(!m||m.dead)return;const k=Math.max(0,Math.min(1,(i-i0)/(i1-i0))),top=m.maxhp*(hi+(lo-hi)*k),bot=Math.max(1,top-m.maxhp*0.05);
    m.hp=Math.min(Math.max(m.hp,bot),top)},
  floor(list,frac){list.forEach(m=>{if(!m.dead)m.hp=Math.max(m.hp,m.maxhp*frac)})},
  // A mob fights this fake (record.py's patch to victim()).
  tankOn(m,f){if(m){m.fakeT=f;engage(m)}}
};
// The hero is played by a simple "human" too: a short delay before reacting, keeps its range, steps off boss ripples.
window.__heroTick=function(dt){const o=window.__hf;if(!o||player.dead>0)return;
  // A ripple (Grasp of the Deep) under you: walk out of it, sideways, before the hands come up.
  const g=mobs.find(m=>!m.dead&&m.casting&&m.casting.grasp);
  if(g&&o.dodge!==false){const s=g.casting.spot,dx=player.x-s.x,dy=player.y-s.y,d=Math.hypot(dx/GRASP.r,dy/(GRASP.r*0.6));
    if(d<1.6&&g.casting.t>(o.dodgeLate||0.35)){const a=Math.atan2(dy||0.3,dx||1);player.tx=s.x+Math.cos(a)*GRASP.r*2.3;player.ty=s.y+Math.sin(a)*GRASP.r*1.4;return}}
  let t=player.target&&!player.target.dead?player.target:null;
  if(!t){window.__hpost=(window.__hpost||0)+dt;if(window.__hpost<0.8)return;
    let bd=o.R||120;mobs.forEach(m=>{if(m.dead||m.def.drift)return;if(o.engaged&&m.state!=='chase')return;const d=dist(m,player);if(d<bd){bd=d;t=m}});player.target=t;window.__hreact=o.react===undefined?0.3:o.react}
  if(!t){window.__hpost=0;if(o.idle){player.tx=o.idle.x;player.ty=o.idle.y}return}
  window.__hpost=0;if(window.__hreact>0){window.__hreact-=dt;player.dir=t.x<player.x?-1:1;return}
  const d=dist(player,t);if(d>o.range){if(!player.cast){player.tx=t.x;player.ty=t.y}}
  else{player.tx=null;player.dir=t.x<player.x?-1:1;for(const id of o.abis){if(B.can(id)){B.use(id,t);break}}}};

/* ---------- Spells (trailer only) ----------
   The owner is still deciding on big spells, so they stay faked here. Each class has a small spell it fires often and a
   big one every few seconds, drawn after the lighting with an additive glow. Draft 3 rule (owner, Nov 21): teammates'
   spells draw no ground circles or area outlines, only the spell itself. Enemy telegraphs (the game's own) still show. */
window.__sfx=[];
const SK={ // small: what the class fires often; big: its showpiece; col: its colour
  wizard:{small:'orb',big:'meteor',col:'#ff9a4a',core:'#fff0c8'}, magician:{small:'orb',big:'pillar',col:'#ff7a3c',core:'#ffe3a0'},
  necro:{small:'orb',big:'cloud',col:'#9be37a',core:'#e8ffd0'}, druid:{small:'orb',big:'thorns',col:'#9be37a',core:'#f0ffd8'},
  shaman:{small:'orb',big:'chain',col:'#8fd8ff',core:'#ffffff'}, enchanter:{small:'orb',big:'mind',col:'#e0a0ff',core:'#fbeaff'},
  ranger:{small:'arrow',big:'rain',col:'#e8d8a0',core:'#ffffff'}, cleric:{small:'orb',big:'pillar',col:'#ffe9a8',core:'#ffffff'},
  paladin:{small:'slash',big:'pillar',col:'#ffe9a8',core:'#ffffff'}, warrior:{small:'slash',big:'whirl',col:'#ffffff',core:'#ffffff'},
  rogue:{small:'slash',big:'slash3',col:'#ff8a8a',core:'#ffffff'}, monk:{small:'slash',big:'slash3',col:'#ffd27a',core:'#ffffff'},
  shadowknight:{small:'slash',big:'cloud',col:'#b48cff',core:'#f0e0ff'}, bard:{small:'slash',big:'mind',col:'#ffd27a',core:'#ffffff'}};
const near=(x,y,r)=>mobs.filter(m=>!m.dead&&!m.def.drift&&Math.hypot(m.x-x,(m.y-y)/0.6)<r);
function dmgOf(f,big){return Math.max(1,Math.round((f.dmg||6)*(big?2.6:1)*RR(0.8,1.25)))}
function zap(t,dmg,f,big){if(t.dead)return;
  // A fake's hit should pull the mob onto the group's tank (the tank "taunts"), not onto the hero.
  if(!t.fakeT&&!t.def.boss&&!t.def.named&&!(t.state==='chase'&&victim(t)===player&&!window.__hideHero))t.fakeT=window.__tank||f;  // no tank: each player fights its own mob
  hitMob(t,dmg,'direct',f.name,undefined)}
function fakeAttack(f,t,big){
  const k=SK[f.cls]||SK.warrior;const kind=big?k.big:k.small;f.lunge=f.role==='melee'?0.15:0.1;
  const sx=f.x+f.dir*5,sy=f.y-10;
  switch(kind){
    case 'orb':__sfx.push({k:'orb',x:sx,y:sy,o:t,spd:150,r:f.cls==='wizard'||f.cls==='magician'?4:3,col:k.col,core:k.core,f:f,t:0,life:3});break;
    case 'arrow':__sfx.push({k:'orb',x:sx,y:sy,o:t,spd:260,r:1.2,col:k.col,core:k.core,f:f,t:0,life:2,arrow:1});break;
    case 'slash':__sfx.push({k:'slash',x:t.x,y:t.y-7,dir:f.dir,col:k.col,t:0,life:0.22});zap(t,dmgOf(f),f);break;
    case 'slash3':for(let j=0;j<3;j++)__sfx.push({k:'slash',x:t.x+RR(-3,3),y:t.y-7+RR(-3,3),dir:j%2?-f.dir:f.dir,col:k.col,t:-j*0.09,life:0.22});zap(t,dmgOf(f,true),f,true);break;
    case 'meteor':__sfx.push({k:'meteor',x:t.x,y:t.y,o:t,col:k.col,core:k.core,f:f,t:0,life:0.75,r:30});break;
    case 'pillar':__sfx.push({k:'pillar',x:t.x,y:t.y,o:t,col:k.col,core:k.core,f:f,t:0,life:0.9,r:20,hit:0});break;
    case 'cloud':__sfx.push({k:'cloud',x:t.x,y:t.y,col:k.col,f:f,t:0,life:2.4,r:30,tick:0});break;
    case 'thorns':__sfx.push({k:'thorns',x:t.x,y:t.y,col:k.col,f:f,t:0,life:1.1,r:20,hit:0});break;
    case 'chain':{const hops=[t].concat(near(t.x,t.y,80).filter(m=>m!==t).slice(0,2));__sfx.push({k:'chain',pts:[{x:sx,y:sy}].concat(hops.map(m=>({x:m.x,y:m.y-6}))),col:k.col,core:k.core,t:0,life:0.4});
      hops.forEach((m,i)=>zap(m,Math.round(dmgOf(f,true)*(1-i*0.25)),f,i===0));break}
    case 'mind':__sfx.push({k:'mind',x:t.x,y:t.y,o:t,col:k.col,t:0,life:0.9});zap(t,dmgOf(f,true),f,true);break;
    case 'rain':__sfx.push({k:'rain',x:t.x,y:t.y,col:k.col,f:f,t:0,life:1.3,r:24,tick:0});break;
    case 'whirl':__sfx.push({k:'whirl',x:f.x,y:f.y,o:f,col:k.col,t:0,life:0.55,r:26});near(f.x,f.y,24).forEach((m,i)=>zap(m,dmgOf(f,true),f,i===0));break;
  }
}
function boom(x,y,r,col,core){__sfx.push({k:'boom',x:x,y:y,r:r,col:col,core:core,t:0,life:0.5});for(let i=0;i<r*0.8;i++)parts.push({x:x+(R01()-0.5)*r*0.6,y:y-4+(R01()-0.5)*r*0.3,vx:(R01()-0.5)*r*3,vy:-R01()*r*2.2,t:0,life:0.35+R01()*0.45,col:R01()<0.4?core:col})}
function sfxTick(dt){
  for(let i=__sfx.length-1;i>=0;i--){const e=__sfx[i];e.t+=dt;
    if(e.k==='orb'){const o=e.o,tx=o.x,ty=o.y-6,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),st=e.spd*dt;
      if(!e.arrow&&R01()<0.9)parts.push({x:e.x,y:e.y,vx:(R01()-0.5)*6,vy:(R01()-0.5)*6,t:0,life:0.3,col:R01()<0.5?e.core:e.col});
      if(d<=st||o.dead){if(!o.dead){if(!e.arrow)boom(tx,ty,12,e.col,e.core);zap(o,dmgOf(e.f),e.f)}__sfx.splice(i,1);continue}
      e.px=e.x;e.py=e.y;e.x+=dx/d*st;e.y+=dy/d*st;continue}
    if(e.k==='meteor'&&!e.hit&&e.t>=0.45){e.hit=1;boom(e.x,e.y-2,32,e.col,e.core);near(e.x,e.y,e.r).forEach((m,j)=>zap(m,dmgOf(e.f,true),e.f,j===0))}
    if(e.k==='pillar'&&!e.hit&&e.t>=0.25){e.hit=1;boom(e.x,e.y-4,14,e.col,e.core);near(e.x,e.y,e.r).forEach((m,j)=>zap(m,dmgOf(e.f,true),e.f,j===0))}
    if(e.k==='thorns'&&!e.hit&&e.t>=0.2){e.hit=1;near(e.x,e.y,e.r).forEach((m,j)=>zap(m,dmgOf(e.f,true),e.f,j===0))}
    if((e.k==='cloud'||e.k==='rain')&&(e.tick-=dt)<=0){e.tick=e.k==='rain'?0.35:0.6;near(e.x,e.y,e.r).forEach(m=>zap(m,Math.round(dmgOf(e.f)*0.8),e.f))}
    if(e.t>=e.life)__sfx.splice(i,1)}
}
function glow(x,y,r,col,a){if(a<=0)return;const g=lx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');lx.globalAlpha=Math.min(1,a);lx.fillStyle=g;lx.beginPath();lx.arc(x,y,r,0,7);lx.fill();lx.globalAlpha=1}
function spellFx(){
  lx.save();lx.translate(-camX,-camY);lx.globalCompositeOperation='lighter';
  // Hands glow while a cast bar fills (brighter for a big spell), so you can see who is about to throw what.
  __fakes.forEach(f=>{const c=f.cast||f.hcast;if(!c)return;const k=Math.min(1,c.t/c.dur),col=f.hcast?'#9fffc0':c.col;
    glow(f.x+f.dir*5,f.y-10,(c.big?9:5)+k*(c.big?8:3),col,0.35+0.5*k);if(R01()<0.5)parts.push({x:f.x+f.dir*5+RR(-3,3),y:f.y-10+RR(-2,2),vx:RR(-4,4),vy:RR(-14,-4),t:0,life:0.4,col:col})});
  __sfx.forEach(e=>{const p=Math.max(0,e.t/e.life);if(e.t<0)return;
    switch(e.k){
      case 'orb':glow(e.x,e.y,e.r*5,e.col,0.55);if(e.arrow){lx.strokeStyle=e.core;lx.lineWidth=1;lx.beginPath();lx.moveTo(e.x,e.y);lx.lineTo(e.px||e.x,e.py||e.y);lx.stroke()}
        else{lx.fillStyle=e.col;lx.beginPath();lx.arc(e.x,e.y,e.r,0,7);lx.fill();lx.fillStyle=e.core;lx.beginPath();lx.arc(e.x,e.y,e.r*0.5,0,7);lx.fill()}break;
      case 'boom':glow(e.x,e.y,e.r*(0.6+p),e.col,0.8*(1-p));glow(e.x,e.y,e.r*0.5*(1-p),e.core,0.9*(1-p));break;
      case 'slash':{lx.globalAlpha=1-p;lx.strokeStyle=e.col;lx.lineWidth=2;lx.beginPath();const a0=e.dir>0?-1.9:1.2;lx.arc(e.x,e.y,9,a0+p*1.2,a0+1.6+p*1.2);lx.stroke();lx.globalAlpha=1;break}
      case 'meteor':{if(p<0.6){const q=p/0.6,mx=e.x-50*(1-q),my=e.y-120*(1-q);glow(mx,my,22,e.col,0.8);lx.fillStyle=e.core;lx.beginPath();lx.arc(mx,my,5,0,7);lx.fill();
          for(let j=1;j<8;j++)glow(mx-j*5,my-j*12,13-j,e.col,0.4)}break}
      case 'pillar':{const a=p<0.25?p/0.25:1-(p-0.25)/0.75,w=12*(1-p*0.5);lx.globalAlpha=a*0.7;const g=lx.createLinearGradient(0,e.y-150,0,e.y);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,e.col);lx.fillStyle=g;lx.fillRect(e.x-w,e.y-150,w*2,150);
          lx.fillStyle=e.core;lx.globalAlpha=a*0.9;lx.fillRect(e.x-w*0.3,e.y-150,w*0.6,150);lx.globalAlpha=1;glow(e.x,e.y-6,36,e.col,a*0.7);break}
      case 'cloud':{const a=Math.min(1,e.t*3,(e.life-e.t)*2);for(let j=0;j<6;j++){const an=j*1.05+e.t*0.6,rx=e.x+Math.cos(an)*e.r*0.5,ry=e.y-6+Math.sin(an)*e.r*0.25;glow(rx,ry,e.r*0.55,e.col,0.26*a)}break}
      case 'thorns':{const a=1-p;lx.strokeStyle=e.col;lx.lineWidth=1.5;lx.globalAlpha=a;for(let j=0;j<10;j++){const an=j/10*6.283,rx=e.x+Math.cos(an)*e.r*0.7,ry=e.y+Math.sin(an)*e.r*0.42,h=8*Math.min(1,e.t*6);lx.beginPath();lx.moveTo(rx-2,ry);lx.lineTo(rx,ry-h);lx.lineTo(rx+2,ry);lx.stroke()}lx.globalAlpha=1;break}
      case 'chain':{const a=1-p;for(let pass=0;pass<2;pass++){lx.strokeStyle=pass?e.core:e.col;lx.lineWidth=pass?1.2:3.5;lx.globalAlpha=a;lx.beginPath();
          e.pts.forEach((pt,j)=>{if(!j){lx.moveTo(pt.x,pt.y);return}const q=e.pts[j-1];for(let s=1;s<=5;s++){const u=s/5;lx.lineTo(q.x+(pt.x-q.x)*u+(s<5?(R01()-0.5)*7:0),q.y+(pt.y-q.y)*u+(s<5?(R01()-0.5)*7:0))}});lx.stroke()}
        lx.globalAlpha=1;e.pts.slice(1).forEach(pt=>glow(pt.x,pt.y,20,e.col,0.7*a));break}
      case 'mind':{const o=e.o.dead?e:e.o,a=1-p;for(let j=0;j<8;j++){const an=j/8*6.283+e.t*5,r=4+p*10;lx.fillStyle=e.col;lx.globalAlpha=a;lx.fillRect(o.x+Math.cos(an)*r,o.y-14+Math.sin(an)*r*0.5,1.5,1.5)}lx.globalAlpha=1;glow(o.x,o.y-12,16,e.col,0.5*a);break}
      case 'rain':{const a=Math.min(1,(e.life-e.t)*3);lx.strokeStyle=e.col;lx.lineWidth=1;lx.globalAlpha=a;for(let j=0;j<14;j++){const ph=(e.t*2.2+j*0.137)%1,rx=e.x+((j*37)%50-25)*e.r/25,ry=e.y+((j*23)%24-12)*0.6;lx.beginPath();lx.moveTo(rx-6*(1-ph),ry-40*(1-ph));lx.lineTo(rx-6*(1-ph)+2,ry-40*(1-ph)+7);lx.stroke()}lx.globalAlpha=1;break}
      case 'whirl':{const o=e.o;for(let j=0;j<3;j++){lx.globalAlpha=1-p;lx.strokeStyle=e.col;lx.lineWidth=2;lx.beginPath();const a0=e.t*18+j*2.09;lx.ellipse(o.x,o.y-6,e.r*(0.5+p*0.5),e.r*0.3*(0.5+p*0.5),0,a0,a0+1.4);lx.stroke()}lx.globalAlpha=1;break}
      case 'heal':{const o=e.o||e,a=1-p;for(let j=0;j<10;j++){const an=j/10*6.283+e.t*3,ry=o.y-p*24-(j%3)*4;lx.fillStyle=j%2?'#ffe9a8':'#9be37a';lx.globalAlpha=a;lx.fillRect(o.x+Math.cos(an)*8,ry+Math.sin(an)*3,1.5,1.5)}lx.globalAlpha=1;glow(o.x,o.y-8,16,'#ffe9a8',0.35*a);break}
    }});
  lx.globalCompositeOperation='source-over';lx.restore();
}
window.__spellFx=spellFx;
window.__fakeTick=function(dt){__fakes.forEach(f=>{if(f.bigCd!==undefined)f.bigCd-=dt;
  f.trail.push({x:f.x,y:f.y});if(f.trail.length>60)f.trail.shift()});
  player.trail=player.trail||[];player.trail.push({x:player.x,y:player.y});if(player.trail.length>60)player.trail.shift();fakeTick(dt);sfxTick(dt)};

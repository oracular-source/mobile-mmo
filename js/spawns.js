// Where mobs live and how they spawn.
'use strict';
/* ---------- Spawns ---------- */
function findSpot(x0,x1,y0,y1){
  for(let i=0;i<200;i++){const x=Math.floor(x0+rnd()*(x1-x0)),y=Math.floor(y0+rnd()*(y1-y0));
    if(map[y]&&map[y][x]===0)return{x:x*T+8,y:y*T+10};}
  return{x:x0*T,y:y0*T};
}
let spawns=[];
function addSpawns(type,n,x0,x1,y0,y1,lv,extra){for(let i=0;i<n;i++){const p=findSpot(x0,x1,y0,y1);spawns.push(Object.assign({type:type,x:p.x,y:p.y,timer:0,mob:null,group:null,lv:lv},extra||{}))}}
// Near the gate: level 1-2 only, with guards close by.
addSpawns('rat',5,5,14,9,21,[1,1]);
addSpawns('beetle',3,5,14,19,26,[2,2]);
// Middle of the road: level 2-3.
addSpawns('rat',3,16,24,9,22,[2,2]);
addSpawns('beetle',4,15,26,19,28,[2,3]);
addSpawns('beetle',2,28,37,19,27,[3,3]);
// Sunken Graveyard: level 3-5. Deadly for a fresh Druid. (Old Gnawbone moved to the rat tunnel, v0.28.)
addSpawns('rat',2,27,37,3,11,[3,4],{gy:true});
for(let g=0;g<3;g++){const p=findSpot(27,37,3,11);for(let k=0;k<2;k++){
  let q={x:p.x+k*14,y:p.y+k*6};if(blocked(q.x,q.y))q=p;
  spawns.push({type:'dead',x:q.x,y:q.y,timer:0,mob:null,group:'g'+g,lv:[3,5]});}}
const overSpawns=spawns;
const mobs=[];
// Players sharing the world's mobs (multiplayer step 2 sets this; DEV -> World -> "Group of 2" tries it solo).
// Mobs spawned while it's above 1 get a scaled copy of their type (GROUP_SCALE in js/data/mobs.js).
let partyN=1;
function groupDef(T0,n){if(n<=1)return T0;const G=GROUP_SCALE,k=n-1;
  return Object.assign({},T0,{hp:T0.hp*(1+G.hp*k),hpl:T0.hpl*(1+G.hp*k),dmg:T0.dmg*(1+G.dmg*k),dmgl:T0.dmgl*(1+G.dmg*k),
    armor:Math.min(G.armorCap,(T0.armor||0)+G.armor*k),base:T0})}
function spawn(sp){
  let type=sp.type;
  const T0=groupDef(TYPES[type],partyN),range=type==='gnaw'?T0.lv:(sp.lv||T0.lv),lv=Math.floor(rr(range[0],range[1]+1));
  const m={sp:sp,type:type,def:T0,lv:lv,maxhp:T0.hp+T0.hpl*lv,x:sp.x,y:sp.y,hx:sp.x,hy:sp.y,state:'idle',wt:rr(1,4),wx:sp.x,wy:sp.y,root:0,snare:0,dots:[],atk:1,dir:1,dead:false,walk:0,pdmg:0,odmg:0};
  m.hp=m.maxhp;m.threat={p:0,pet:0};if(sp.aloof)m.aloof=1;sp.mob=m;mobs.push(m);return m;
}
spawns.forEach(spawn);

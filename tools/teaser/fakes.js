// Teaser video only (tools/teaser/record.py injects this; the game never loads it).
// Fake "other players" for the trailer: multiplayer is phase 3, so these are drawn and steered here, never shipped.
// Each fake is a class's real rags sprite with a name over its head. It walks with the game's own pathing, hits the
// game's own mobs (hitMob, so numbers, deaths and corpses are the real ones) and fires the class's spell colour.
'use strict';
window.__fakes=[];
const FAKE_IMG={};
const fakeImg=c=>FAKE_IMG[c]||(FAKE_IMG[c]=mkRags(c));
// Role per class: melee walks in close, casters stand back and fire a beam, healers top up the hero now and then.
const FAKE_ROLE={warrior:'melee',rogue:'melee',monk:'melee',paladin:'melee',shadowknight:'melee',
  wizard:'caster',magician:'caster',necro:'caster',enchanter:'caster',ranger:'caster',shaman:'caster',druid:'caster',bard:'melee',cleric:'healer'};
const FAKE_COL={wizard:'#9fd0ff',magician:'#ff9a4a',necro:'#9be37a',enchanter:'#e0a0ff',ranger:'#e8d8a0',shaman:'#7ad0a0',druid:'#9be37a',cleric:'#ffe9a8'};
// A fake set down inside a wall or tree could never take a step, so nudge it to the nearest open ground first.
function openSpot(x,y){if(!blocked(x,y))return{x:x,y:y};for(let r=4;r<80;r+=4)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Y=y+Math.sin(a/16*6.283)*r;if(!blocked(X,Y))return{x:X,y:Y}}return{x:x,y:y}}
function addFake(cls,name,x,y,o){const sp=openSpot(x,y);x=sp.x;y=sp.y;const f=Object.assign({fake:1,cls:cls,name:name,x:x,y:y,dir:1,walk:0,moving:false,cd:Math.random()*1.2,
  role:FAKE_ROLE[cls]||'melee',slot:Math.random()*6.283,lunge:0,path:null,fight:true,aggro:110,spd:34},o||{});__fakes.push(f);return f}
function fakeTick(dt){
  __fakes.forEach(f=>{
    const x0=f.x,y0=f.y;f.lunge=Math.max(0,f.lunge-dt);
    if(f.path&&f.path.length){const p=f.path[0];if(pathTo(f,p.x,p.y,f.spd,dt)||Math.hypot(f.x-p.x,f.y-p.y)<3)f.path.shift();}
    else if(f.follow){const L=f.follow,a=f.slot,tx=L.x+Math.cos(a)*16,ty=L.y+Math.sin(a)*9;if(Math.hypot(f.x-tx,f.y-ty)>6)pathTo(f,tx,ty,f.spd*1.15,dt)}
    if(f.fight&&!(f.path&&f.path.length)){
      let t=f.target&&!f.target.dead?f.target:null;
      if(!t){let bd=f.aggro;mobs.forEach(m=>{if(m.dead||m.def.drift)return;const d=dist(m,f);if(d<bd){bd=d;t=m}});f.target=t}
      if(t){const R=f.role==='melee'?14:58,d=dist(f,t);
        if(d>R){const a=f.slot,px=f.x,py=f.y;pathTo(f,t.x+Math.cos(a)*R*0.8,t.y+Math.sin(a)*R*0.5,f.spd*1.1,dt);if(Math.hypot(f.x-px,f.y-py)<0.2)pathTo(f,t.x,t.y,f.spd*1.1,dt)}
        else{f.dir=t.x<f.x?-1:1;f.cd-=dt;
          if(f.cd<=0){f.cd=f.role==='melee'?1.1+Math.random()*0.4:1.8+Math.random()*0.6;
            const dmg=Math.round((f.dmg||8)*(0.8+Math.random()*0.5));
            if(f.role==='melee'){f.lunge=0.15;burst(t.x,t.y-6,'#ffffff',4)}
            else{beams.push({x1:f.x,y1:f.y-9,x2:t.x,y2:t.y-6,t:0,col:FAKE_COL[f.cls]||'#ffd27a'});burst(t.x,t.y-6,FAKE_COL[f.cls]||'#ffd27a',8)}
            hitMob(t,dmg,'direct',f.name,undefined)}}}
      else if(f.role==='healer'||f.heals){}
    }
    if(f.role==='healer'||f.heals){f.hcd=(f.hcd===undefined?2:f.hcd)-dt;if(f.hcd<=0){f.hcd=3+Math.random()*2;const who=f.healT||player;
      floatText(who.x,who.y-22,'+'+(12+Math.floor(Math.random()*10)),'#7dffa6',0,'small');burst(who.x,who.y-8,'#ffe9a8',10,true)}}
    const mv=Math.hypot(f.x-x0,f.y-y0);f.moving=mv>0.05;if(f.moving){f.walk+=dt;if(Math.abs(f.x-x0)>0.05)f.dir=f.x<x0?-1:1}
  });
}
function drawFake(f){
  const im=fakeImg(f.cls);if(!im)return;
  shadow(f.x,f.y,6);const wf=walkFrame(im,f.walk,f.moving);
  const lx2=f.lunge>0?f.dir*2:0;drawSprite(f.sit?im:wf.im,f.x+lx2,f.y+1,f.dir,wf.bob,!!f.sit);
}
// Names over heads (players' names in a soft blue, like an MMO), drawn on the crisp text layer.
function drawNames(){
  const list=__fakes.slice();if(window.__heroName&&!window.__hideHero&&!(player.dead>0))list.push({x:player.x,y:player.y,name:window.__heroName,hero:1});
  cx.textAlign='center';cx.textBaseline='middle';cx.font='600 '+Math.round(9*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;
  list.forEach(o=>{const sx=(o.x-camX)*S,sy=(o.y-24-camY)*S;if(sx<-60||sx>cv.width+60||sy<-20||sy>cv.height+20)return;
    cx.strokeStyle='#000';cx.strokeText(o.name,sx,sy);cx.fillStyle=o.hero?'#ffe9a8':'#9fd0ff';cx.fillText(o.name,sx,sy)});
}
window.__drawFake=drawFake;window.__names=drawNames;window.__fakeTick=fakeTick;window.addFake=addFake;

// Shot helpers for shots.py: place the hero, steer the camera, fight with a fixed ability order, make a boss last a set time.
window.H={
  god(){dev.god=true},
  at(x,y){player.x=x;player.y=y;player.tx=null;if(pet){pet.x=x-10;pet.y=y+4}},
  cam(x,y){window.__cam={x:Math.round(x-VW/2),y:Math.round(y-VH/2)}},
  quiet(){floats.length=0;logMute=true},
  only(keep){mobs.forEach(m=>{if(!m.dead&&!keep(m))killQuiet(m)})},
  fight(o){window.__hf=o},
  // Boss health follows a straight line from full at frame i0 to empty at i1 (real hits still land, the line just keeps the
  // fight the length the shot needs). The last hit kills it for real.
  track(m,i,i0,i1){if(!m||m.dead)return;const k=Math.max(0,Math.min(1,1-(i-i0)/(i1-i0))),hi=Math.max(1,m.maxhp*k),lo=Math.max(1,hi-m.maxhp*0.06);
    m.hp=Math.min(Math.max(m.hp,lo),hi)}
};
window.__heroTick=function(dt){const o=window.__hf;if(!o||player.dead>0)return;
  let t=player.target&&!player.target.dead?player.target:null;
  if(!t){let bd=o.R||120;mobs.forEach(m=>{if(m.dead||m.def.drift)return;const d=dist(m,player);if(d<bd){bd=d;t=m}});player.target=t}
  if(t){const d=dist(player,t);if(d>o.range){if(!player.cast){player.tx=t.x;player.ty=t.y}}
    else{player.tx=null;for(const id of o.abis){if(B.can(id)){B.use(id,t);break}}}}
  else if(o.idle){player.tx=o.idle.x;player.ty=o.idle.y}};

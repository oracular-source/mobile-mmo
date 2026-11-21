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
      if(t){const R=f.role==='melee'?14:64,d=dist(f,t);
        if(d>R){const a=f.slot,px=f.x,py=f.y;pathTo(f,t.x+Math.cos(a)*R*0.8,t.y+Math.sin(a)*R*0.5,f.spd*1.1,dt);if(Math.hypot(f.x-px,f.y-py)<0.2)pathTo(f,t.x,t.y,f.spd*1.1,dt)}
        else{f.dir=t.x<f.x?-1:1;f.cd-=dt;
          if(f.cd<=0){f.cd=f.role==='melee'?1.0+Math.random()*0.4:1.5+Math.random()*0.5;fakeAttack(f,t)}}}
      else if(f.role==='healer'||f.heals){}
    }
    if(f.role==='healer'||f.heals){f.hcd=(f.hcd===undefined?2:f.hcd)-dt;if(f.hcd<=0){f.hcd=3+Math.random()*2;const who=f.healT||player;
      floatText(who.x,who.y-22,'+'+(40+Math.floor(Math.random()*30)),'#7dffa6',0,'hit');__sfx.push({k:'heal',x:who.x,y:who.y,t:0,life:1.1,o:who})}}
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

/* ---------- Bigger spells (trailer only) ----------
   The owner wanted to see what big spells from several players look like. Each class gets a small spell it fires often
   and a big one every few seconds: orbs that fly with a trail and burst, meteors, pillars of light, chain lightning,
   arrow rain, poison clouds, whirlwinds. Drawn after the lighting with an additive glow, so they light up the night. */
window.__sfx=[];
const SK={ // small: what the class fires often; big: its showpiece; col: its colour
  wizard:{small:'orb',big:'meteor',col:'#ff9a4a',core:'#fff0c8'}, magician:{small:'orb',big:'pillar_fire',col:'#ff7a3c',core:'#ffe3a0'},
  necro:{small:'orb',big:'cloud',col:'#9be37a',core:'#e8ffd0'}, druid:{small:'orb',big:'thorns',col:'#9be37a',core:'#f0ffd8'},
  shaman:{small:'orb',big:'chain',col:'#8fd8ff',core:'#ffffff'}, enchanter:{small:'orb',big:'rings',col:'#e0a0ff',core:'#fbeaff'},
  ranger:{small:'arrow',big:'rain',col:'#e8d8a0',core:'#ffffff'}, cleric:{small:'orb',big:'pillar',col:'#ffe9a8',core:'#ffffff'},
  paladin:{small:'slash',big:'pillar',col:'#ffe9a8',core:'#ffffff'}, warrior:{small:'slash',big:'whirl',col:'#ffffff',core:'#ffffff'},
  rogue:{small:'slash',big:'whirl',col:'#ff8a8a',core:'#ffffff'}, monk:{small:'slash',big:'whirl',col:'#ffd27a',core:'#ffffff'},
  shadowknight:{small:'slash',big:'cloud',col:'#b48cff',core:'#f0e0ff'}, bard:{small:'slash',big:'rings',col:'#ffd27a',core:'#ffffff'}};
const near=(x,y,r)=>mobs.filter(m=>!m.dead&&!m.def.drift&&Math.hypot(m.x-x,(m.y-y)/0.6)<r);
function dmgOf(f,big){return Math.round((f.dmg||8)*(big?3.2:1)*(0.85+Math.random()*0.4))}
function zap(t,dmg,f,big){if(t.dead)return;floatText(t.x,t.y-18,String(dmg),big?'#ffe9a8':'#e8e2cf',big,big?undefined:'small');hitMob(t,dmg,'direct',f.name,undefined)}
function fakeAttack(f,t){
  const k=SK[f.cls]||SK.warrior;f.bigCd=(f.bigCd===undefined?1+Math.random()*2.5:f.bigCd);
  const big=f.bigCd<=0;if(big)f.bigCd=(f.bigEvery||4)+Math.random()*2;
  const kind=big?k.big:k.small;f.lunge=f.role==='melee'?0.15:0;
  const sx=f.x+f.dir*5,sy=f.y-10;
  switch(kind){
    case 'orb':__sfx.push({k:'orb',x:sx,y:sy,o:t,spd:150,r:f.cls==='wizard'||f.cls==='magician'?4.5:3.5,col:k.col,core:k.core,f:f,t:0,life:3});break;
    case 'arrow':__sfx.push({k:'orb',x:sx,y:sy,o:t,spd:260,r:1.2,col:k.col,core:k.core,f:f,t:0,life:2,arrow:1});break;
    case 'slash':__sfx.push({k:'slash',x:t.x,y:t.y-7,dir:f.dir,col:k.col,t:0,life:0.22});zap(t,dmgOf(f),f);break;
    case 'meteor':__sfx.push({k:'meteor',x:t.x,y:t.y,o:t,col:k.col,core:k.core,f:f,t:0,life:0.75,r:42});break;
    case 'pillar':case 'pillar_fire':__sfx.push({k:'pillar',x:t.x,y:t.y,o:t,col:k.col,core:k.core,f:f,t:0,life:0.9,r:22,hit:0});break;
    case 'cloud':__sfx.push({k:'cloud',x:t.x,y:t.y,col:k.col,f:f,t:0,life:2.6,r:40,tick:0});break;
    case 'thorns':__sfx.push({k:'thorns',x:t.x,y:t.y,col:k.col,f:f,t:0,life:1.2,r:26,hit:0});break;
    case 'chain':{const hops=[t].concat(near(t.x,t.y,90).filter(m=>m!==t).slice(0,3));__sfx.push({k:'chain',pts:[{x:t.x,y:t.y-200}].concat(hops.map(m=>({x:m.x,y:m.y-6}))),col:k.col,core:k.core,t:0,life:0.45});
      hops.forEach((m,i)=>zap(m,Math.round(dmgOf(f,true)*(1-i*0.2)),f,i===0));break}
    case 'rings':__sfx.push({k:'rings',x:t.x,y:t.y,col:k.col,t:0,life:1.0,r:44});near(t.x,t.y,44).forEach((m,i)=>zap(m,dmgOf(f,true),f,i===0));break;
    case 'rain':__sfx.push({k:'rain',x:t.x,y:t.y,col:k.col,f:f,t:0,life:1.4,r:30,tick:0});break;
    case 'whirl':__sfx.push({k:'whirl',x:f.x,y:f.y,o:f,col:k.col,t:0,life:0.6,r:34});near(f.x,f.y,30).forEach((m,i)=>zap(m,dmgOf(f,true),f,i===0));break;
  }
}
function boom(x,y,r,col,core){__sfx.push({k:'boom',x:x,y:y,r:r,col:col,core:core,t:0,life:0.55});for(let i=0;i<r;i++)parts.push({x:x+(Math.random()-0.5)*r*0.6,y:y-4+(Math.random()-0.5)*r*0.3,vx:(Math.random()-0.5)*r*3,vy:-Math.random()*r*2.2,t:0,life:0.4+Math.random()*0.5,col:Math.random()<0.4?core:col})}
function sfxTick(dt){
  for(let i=__sfx.length-1;i>=0;i--){const e=__sfx[i];e.t+=dt;
    if(e.k==='orb'){const o=e.o,tx=o.x,ty=o.y-6,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),st=e.spd*dt;
      if(!e.arrow&&Math.random()<0.9)parts.push({x:e.x,y:e.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,t:0,life:0.35,col:Math.random()<0.5?e.core:e.col});
      if(d<=st||o.dead){if(!o.dead){if(!e.arrow)boom(tx,ty,16,e.col,e.core);zap(o,dmgOf(e.f),e.f)}__sfx.splice(i,1);continue}
      e.px=e.x;e.py=e.y;e.x+=dx/d*st;e.y+=dy/d*st;continue}
    if(e.k==='meteor'&&!e.hit&&e.t>=0.45){e.hit=1;boom(e.x,e.y-2,40,e.col,e.core);__sfx.push({k:'ring',x:e.x,y:e.y,r:e.r,col:e.col,t:0,life:0.5});near(e.x,e.y,e.r).forEach((m,j)=>zap(m,dmgOf(e.f,true),e.f,j===0))}
    if(e.k==='pillar'&&!e.hit&&e.t>=0.25){e.hit=1;boom(e.x,e.y-4,16,e.col,e.core);near(e.x,e.y,e.r).forEach((m,j)=>zap(m,dmgOf(e.f,true),e.f,j===0))}
    if(e.k==='thorns'&&!e.hit&&e.t>=0.2){e.hit=1;near(e.x,e.y,e.r).forEach((m,j)=>{zap(m,dmgOf(e.f,true),e.f,j===0);m.root=Math.max(m.root||0,1.2)})}
    if((e.k==='cloud'||e.k==='rain')&&(e.tick-=dt)<=0){e.tick=e.k==='rain'?0.35:0.6;near(e.x,e.y,e.r).forEach(m=>zap(m,Math.round(dmgOf(e.f)*0.9),e.f))}
    if(e.t>=e.life)__sfx.splice(i,1)}
}
function glow(x,y,r,col,a){const g=lx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');lx.globalAlpha=a;lx.fillStyle=g;lx.beginPath();lx.arc(x,y,r,0,7);lx.fill();lx.globalAlpha=1}
function ell(x,y,r,col,a,w){lx.globalAlpha=a;lx.strokeStyle=col;lx.lineWidth=w||1.5;lx.beginPath();lx.ellipse(x,y,r,r*0.6,0,0,7);lx.stroke();lx.globalAlpha=1}
function spellFx(){
  lx.save();lx.translate(-camX,-camY);lx.globalCompositeOperation='lighter';
  __sfx.forEach(e=>{const p=e.t/e.life;
    switch(e.k){
      case 'orb':glow(e.x,e.y,e.r*5,e.col,0.55);if(e.arrow){lx.strokeStyle=e.core;lx.lineWidth=1;lx.beginPath();lx.moveTo(e.x,e.y);lx.lineTo(e.px||e.x,e.py||e.y);lx.stroke()}
        else{lx.fillStyle=e.col;lx.beginPath();lx.arc(e.x,e.y,e.r,0,7);lx.fill();lx.fillStyle=e.core;lx.beginPath();lx.arc(e.x,e.y,e.r*0.5,0,7);lx.fill()}break;
      case 'boom':glow(e.x,e.y,e.r*(0.6+p),e.col,0.8*(1-p));glow(e.x,e.y,e.r*0.5*(1-p),e.core,0.9*(1-p));break;
      case 'ring':ell(e.x,e.y,e.r*(0.3+0.7*p),e.col,1-p,2.5);break;
      case 'slash':{lx.globalAlpha=1-p;lx.strokeStyle=e.col;lx.lineWidth=2;lx.beginPath();const a0=e.dir>0?-1.9:1.2;lx.arc(e.x,e.y,9,a0+p*1.2,a0+1.6+p*1.2);lx.stroke();lx.globalAlpha=1;break}
      case 'meteor':{if(p<0.64){const q=p/0.64,mx=e.x-60*(1-q),my=e.y-130*(1-q);glow(mx,my,26,e.col,0.8);lx.fillStyle=e.core;lx.beginPath();lx.arc(mx,my,6,0,7);lx.fill();
          for(let j=1;j<8;j++)glow(mx-j*6,my-j*13,15-j,e.col,0.4)}ell(e.x,e.y,e.r,e.col,0.25+0.35*p,1);break}
      case 'pillar':{const a=p<0.25?p/0.25:1-(p-0.25)/0.75,w=15*(1-p*0.5);lx.globalAlpha=a*0.7;const g=lx.createLinearGradient(0,e.y-160,0,e.y);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,e.col);lx.fillStyle=g;lx.fillRect(e.x-w,e.y-160,w*2,160);
          lx.fillStyle=e.core;lx.globalAlpha=a*0.9;lx.fillRect(e.x-w*0.3,e.y-160,w*0.6,160);lx.globalAlpha=1;ell(e.x,e.y,e.r*(0.5+p*0.5),e.col,a,2);glow(e.x,e.y-6,44,e.col,a*0.7);break}
      case 'cloud':{const a=Math.min(1,e.t*3,(e.life-e.t)*2);for(let j=0;j<7;j++){const an=j*0.9+e.t*0.6,rx=e.x+Math.cos(an)*e.r*0.55,ry=e.y-4+Math.sin(an)*e.r*0.3;glow(rx,ry,e.r*0.6,e.col,0.28*a)}break}
      case 'thorns':{const a=1-p;lx.strokeStyle=e.col;lx.lineWidth=1.5;lx.globalAlpha=a;for(let j=0;j<14;j++){const an=j/14*6.283,rx=e.x+Math.cos(an)*e.r*0.8,ry=e.y+Math.sin(an)*e.r*0.48,h=8*Math.min(1,e.t*6);lx.beginPath();lx.moveTo(rx-2,ry);lx.lineTo(rx,ry-h);lx.lineTo(rx+2,ry);lx.stroke()}lx.globalAlpha=1;glow(e.x,e.y-3,e.r,e.col,0.35*a);break}
      case 'chain':{const a=1-p;for(let pass=0;pass<2;pass++){lx.strokeStyle=pass?e.core:e.col;lx.lineWidth=pass?1.5:4.5;lx.globalAlpha=a;lx.beginPath();
          e.pts.forEach((pt,j)=>{if(!j){lx.moveTo(pt.x,pt.y);return}const q=e.pts[j-1];for(let s=1;s<=5;s++){const u=s/5;lx.lineTo(q.x+(pt.x-q.x)*u+(s<5?(Math.random()-0.5)*8:0),q.y+(pt.y-q.y)*u+(s<5?(Math.random()-0.5)*8:0))}});lx.stroke()}
        lx.globalAlpha=1;e.pts.slice(1).forEach(pt=>glow(pt.x,pt.y,26,e.col,0.7*a));break}
      case 'rings':for(let j=0;j<3;j++){const q=Math.min(1,Math.max(0,p*1.6-j*0.25));if(q>0&&q<1)ell(e.x,e.y,e.r*q,e.col,1-q,2)}glow(e.x,e.y-4,20,e.col,0.4*(1-p));break;
      case 'rain':{const a=Math.min(1,(e.life-e.t)*3);lx.strokeStyle=e.col;lx.lineWidth=1;lx.globalAlpha=a;for(let j=0;j<16;j++){const ph=(e.t*2.2+j*0.137)%1,rx=e.x+((j*37)%60-30)*e.r/30,ry=e.y+((j*23)%30-15)*0.6;lx.beginPath();lx.moveTo(rx-6*(1-ph),ry-40*(1-ph));lx.lineTo(rx-6*(1-ph)+2,ry-40*(1-ph)+7);lx.stroke()}lx.globalAlpha=1;ell(e.x,e.y,e.r,e.col,0.3*a,1);break}
      case 'whirl':{const o=e.o;for(let j=0;j<3;j++){lx.globalAlpha=1-p;lx.strokeStyle=e.col;lx.lineWidth=2;lx.beginPath();const a0=e.t*18+j*2.09;lx.ellipse(o.x,o.y-6,e.r*(0.5+p*0.5),e.r*0.3*(0.5+p*0.5),0,a0,a0+1.4);lx.stroke()}lx.globalAlpha=1;break}
      case 'heal':{const o=e.o||e,a=1-p;for(let j=0;j<10;j++){const an=j/10*6.283+e.t*3,ry=o.y-p*24-(j%3)*4;lx.fillStyle=j%2?'#ffe9a8':'#9be37a';lx.globalAlpha=a;lx.fillRect(o.x+Math.cos(an)*8,ry+Math.sin(an)*3,1.5,1.5)}lx.globalAlpha=1;ell(o.x,o.y,10+p*8,'#ffe9a8',a,1.5);glow(o.x,o.y-8,18,'#ffe9a8',0.35*a);break}
    }});
  lx.globalCompositeOperation='source-over';lx.restore();
}
window.__spellFx=spellFx;
const _ft=fakeTick;window.__fakeTick=function(dt){__fakes.forEach(f=>{if(f.bigCd!==undefined)f.bigCd-=dt});_ft(dt);sfxTick(dt)};

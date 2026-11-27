// Animation kit (v0.102, animation lane): mob swings, hit flashes, deaths that sink, and flying things (the Skeleton King's Bone Throw).
'use strict';
// Looks only. Everything here uses fr() (Math.random), never the game's rng(), and never changes a timer, a number or
// a position the rules use, so fights and the sim roll exactly the same with or without it. While the sim runs
// (logMute) nothing is spawned, so it stays fast.
const fr=(a,b)=>a+Math.random()*(b-a);
const fxo=[]; // short animations and flying things: {k:kind, t, life, ...}
const SWING=0.26,HITT=0.2,BONE_FLIGHT=0.32; // seconds: a lunge out and back, a hit nudge, the bone in the air

// Dust, shards, sparks: little 1-pixel bits that fly out and fade (the same parts list as the old bursts).
function fxBits(x,y,cols,n,sp,up,life){for(let i=0;i<n;i++)parts.push({x:x+fr(-2,2),y:y+fr(-2,2),vx:fr(-1,1)*sp,vy:fr(-1,1)*sp-(up||0),t:0,life:fr(0.35,0.75)*(life||1),col:cols[i%cols.length]})}

// A mob swings: a quick lunge toward whoever it hits, and a slash that sweeps across them. Each mob lunges on its own
// swing, so a stack of three ripples instead of blurring into one shape.
function animSwing(m,v){if(logMute)return;
  const dx=v.x-m.x,dy=v.y-m.y,d=Math.hypot(dx,dy)||1;m.swT=SWING;m.swx=dx/d;m.swy=dy/d;
  fxo.push({k:'slash',x:v.x,y:v.y-8,ax:-dx/d,ay:-dy/d,t:0,life:0.16,col:m.def.slash||'#f2eee0'})}
// A mob is hit: a white flash and a small push away from what hit it. DoT and song ticks stay quiet (too often).
function animHit(m,src,kind){if(logMute||kind==='dot'||kind==='song')return;
  const a=src==='pet'&&pet?pet:src==='npc'?null:player;let dx=a?m.x-a.x:fr(-1,1),dy=a?m.y-a.y:fr(-1,1);const d=Math.hypot(dx,dy)||1;
  m.hitT=HITT;m.hx_=dx/d;m.hy_=dy/d}
// A mob dies: it flashes, then sinks into the ground and fades while dust puffs out at its feet.
function animDeath(m){if(logMute)return;const img=IMG[m.def.img];if(!img||m.def.float)return;
  fxo.push({k:'fall',img:img,x:m.x,y:m.y+1,dir:m.dir,t:0,life:0.55});fxBits(m.x,m.y-1,['#6e6458','#8a7f70','#5a5248'],8,16,4,0.9)}

// Where to draw a mob this frame: its swing lunge (with a tiny lean back just before), its hit nudge, and the flash.
function mobAnim(m){let dx=0,dy=0;const img=IMG[m.def.img],L=Math.min(6,Math.max(3,Math.round(((img&&img.w)||14)*0.18)));
  if(m.near>0&&m.atk>0&&m.atk<0.3&&m.aimX!==undefined){const k=(0.3-m.atk)/0.3,ax=m.aimX-m.x,ay=m.aimY-m.y,d=Math.hypot(ax,ay)||1;dx-=ax/d*k;dy-=ay/d*k} // the wind-up: leans back a pixel
  if(m.swT>0){const p=1-m.swT/SWING,o=p<0.25?p/0.25:1-(p-0.25)/0.75;dx+=m.swx*L*o;dy+=m.swy*L*o*0.7}
  if(m.hitT>0){const o=m.hitT/HITT;dx+=m.hx_*2*o;dy+=m.hy_*1.5*o}
  return{dx:Math.round(dx),dy:Math.round(dy),flash:m.hitT>HITT-0.07}}

// A white copy of a sprite for the hit flash, made once per picture and kept.
function whiteOf(img,dir){const key=dir<0?'wf':'wc';if(img[key])return img[key];
  const c=document.createElement('canvas');c.width=img.w;c.height=img.h;const x=c.getContext('2d');x.drawImage(dir<0?img.f:img.c,0,0);
  x.globalCompositeOperation='source-in';x.fillStyle='#ffffff';x.fillRect(0,0,img.w,img.h);return img[key]=c}

// ---------- The Skeleton King's Bone Throw (v0.102, owner picked it over a wailing skull and a crown bolt) ----------
// Same rules as the old Shadow Bolt: a 2 s cast, stun or fear breaks it, out of range it falls short. During the cast he
// lifts a thigh bone over his head; just before the cast ends he throws it, so it lands the moment the hit does.
function boneLaunch(m){m.casting.thrown=1;if(logMute)return;const img=IMG[m.def.img],h=(img&&img.h)||30;
  const slow=m.aslow>0&&m.slowCast?(m.aslowX||1.6):1,far=dist(m,player)>BOLT.range;
  let tx=player.x,ty=player.y-8;if(far){const d=dist(m,player)||1;tx=m.x+(player.x-m.x)/d*BOLT.range;ty=m.y+(player.y-m.y)/d*BOLT.range} // out of range: it drops short
  fxo.push({k:'bone',m:m,x0:m.x+m.dir*4,y0:m.y-h-4,tx:tx,ty:ty,home:!far,t:0,life:BONE_FLIGHT*slow,spin:m.dir,out:null})}
// The hit lands (world.js tells us how it went): 'hit', 'dodge' or 'miss'.
function boneLand(m,out){const b=fxo.find(f=>f.k==='bone'&&f.m===m&&!f.out);if(b)b.out=out}
// Draw a bone at any angle, chunky enough to read on a phone: a dark outline, a 2-pixel cream shaft, and two knobs at
// each end (the dog-bone shape is what makes it read as a bone at a glance). Placed on whole pixels so it stays crisp.
function drawBone(x,y,ang,len,a){const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c,hl=len/2;lx.globalAlpha=a==null?1:a;
  const dot=(X,Y,n,col)=>{lx.fillStyle=col;lx.fillRect(Math.round(X)-(n>>1),Math.round(Y)-(n>>1),n,n)};
  const big=len>=8,kn=big?1.6:1;
  for(let pass=0;pass<2;pass++){const n=big?(pass?2:4):(pass?1:3),col=pass?'#e8e0c8':'#1c1820';
    for(let i=-hl;i<=hl;i+=0.5)dot(x+c*i,y+s*i,n,col);
    if(big)[-1,1].forEach(e=>{const ex=x+c*hl*e,ey=y+s*hl*e;dot(ex+px*kn,ey+py*kn,n,pass?'#f6f0dc':col);dot(ex-px*kn,ey-py*kn,n,pass?'#f6f0dc':col)})}
  if(big){lx.fillStyle='#a89e86';for(let i=-hl+2;i<=hl-2;i+=1)lx.fillRect(Math.round(x+c*i+px*0.7),Math.round(y+s*i+py*0.7),1,1)} // shade on the lower edge
  lx.globalAlpha=1}
// A soft grave-light glow (added on top, so it brightens the dark crypt instead of painting over it).
function boneGlow(x,y,r,a){lx.globalCompositeOperation='lighter';lx.globalAlpha=a;lx.fillStyle='#6a4a9a';lx.beginPath();lx.arc(Math.round(x),Math.round(y),r,0,7);lx.fill();
  lx.globalAlpha=a*1.4;lx.beginPath();lx.arc(Math.round(x),Math.round(y),r*0.5,0,7);lx.fill();lx.globalAlpha=1;lx.globalCompositeOperation='source-over'}

// Every frame (from update): move the animations along and drop the finished ones.
function fxTick(dt){
  for(let i=0;i<mobs.length;i++){const m=mobs[i];if(m.swT>0)m.swT-=dt;if(m.hitT>0)m.hitT-=dt;if(m.near>0)m.near-=dt}
  for(let i=fxo.length-1;i>=0;i--){const f=fxo[i];f.t+=dt;
    if(f.k==='bone'){if(f.home){f.tx=player.x;f.ty=player.y-8}const p=Math.min(1,f.t/f.life),bx=f.x0+(f.tx-f.x0)*p,by=f.y0+(f.ty-f.y0)*p-Math.sin(Math.PI*p)*14;
      if(Math.random()<0.8)parts.push({x:bx+fr(-1,1),y:by+fr(-1,1),vx:fr(-4,4),vy:fr(-6,2),t:0,life:fr(0.25,0.5),col:Math.random()<0.35?'#9a7cc8':'#cfc6ae'}); // bone dust and a thread of grave-light
      if(f.t>=f.life){fxo.splice(i,1);boneEnd(f,bx,by);continue}}
    else if(f.k==='frag'){if(f.y<f.gy)f.ang+=f.va*dt;f.vy+=160*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>f.gy){f.y=f.gy;f.vy*=-0.35;f.vx*=0.5}}
    if(f.t>=f.life)fxo.splice(i,1)}}
// Where the bone ends up. Hit: it cracks apart on you. Dodged: it glances off and tumbles away. Short or broken off: it
// clatters to the ground and lies there a moment.
function boneEnd(f,x,y){const frag=(n,sp,up)=>{for(let k=0;k<n;k++)fxo.push({k:'frag',x:x,y:y,vx:fr(-1,1)*sp,vy:-fr(up*0.5,up),gy:(f.out==='hit'?player.y:y+8)+fr(-2,3),ang:fr(0,6.3),va:fr(-14,14),len:k?3:5,t:0,life:fr(0.9,1.4)})};
  if(f.out==='hit'){fxBits(x,y,['#f6f0dc','#e8e0c8','#bdb49c','#9a7cc8'],14,34,10);frag(3,40,50)}
  else if(f.out==='dodge'){fxo.push({k:'frag',x:x,y:y,vx:(x-f.x0>0?1:-1)*50,vy:-60,gy:y+10,ang:0,va:18,len:12,t:0,life:1.2});fxBits(x,y,['#cfc6ae'],5,18,4)}
  else{fxo.push({k:'frag',x:x,y:y,vx:f.spin*14,vy:-30,gy:y+6,ang:0,va:12,len:12,t:0,life:1.3});fxBits(x,y+6,['#6e6458','#8a7f70'],6,14,4)}}

// Every frame (from render, in the world's camera, before the lighting): slashes and sinking bodies, which should sit in
// the room's light like the mobs do.
function fxDraw(){
  fxo.forEach(f=>{
    if(f.k==='slash'){const p=f.t/f.life,base=Math.atan2(f.ay,f.ax);lx.fillStyle=f.col;
      for(let j=0;j<6;j++){const q=j/5;if(q>p*1.6)break;const an=base-1+q*2;lx.globalAlpha=Math.max(0,1-p)*(0.5+0.5*q);lx.fillRect(Math.round(f.x+Math.cos(an)*5),Math.round(f.y+Math.sin(an)*5),1,1)}lx.globalAlpha=1}
    else if(f.k==='fall'){const p=f.t/f.life,im=f.img,h=Math.max(1,Math.round(im.h*(1-p*0.75))),w=im.w,dx=Math.round(f.x)-(w>>1),dy=Math.round(f.y)-h;
      lx.globalAlpha=1-p*p;lx.drawImage(p<0.15?whiteOf(im,f.dir):(f.dir<0?im.f:im.c),0,0,w,im.h,dx,dy,w,h);lx.globalAlpha=1}})}
// Every frame, after the lighting (so the dark doesn't swallow it): the bone in the King's hand, in the air and in pieces.
function fxDrawLit(){
  // The bone raised over his head while the cast bar fills, rising and trembling as it comes to the throw, grave-light
  // gathering into it.
  for(let i=0;i<mobs.length;i++){const m=mobs[i];if(m.dead||!m.casting||!m.casting.bone||m.casting.thrown)continue;
    const img=IMG[m.def.img],h=(img&&img.h)||30,p=Math.min(1,m.casting.t/m.casting.dur),sh=p>0.7?Math.round(fr(-1,1)*(p-0.7)*4):0;
    const bx=Math.round(m.x+m.dir*(4+p*3))+sh,by=Math.round(m.y-h-2-p*6);
    boneGlow(bx,by,5+p*5,0.12+p*0.18);
    if(Math.random()<0.3+p*0.5){const a=fr(0,6.3),r=fr(8,14);parts.push({x:bx+Math.cos(a)*r,y:by+Math.sin(a)*r,vx:-Math.cos(a)*r*2.5,vy:-Math.sin(a)*r*2.5,t:0,life:0.35,col:'#b48cff'})}
    drawBone(bx,by,(-0.6-p*0.7)*m.dir,12)}
  fxo.forEach(f=>{
    if(f.k==='bone'){const pos=q=>{const p=Math.min(1,q/f.life);return[f.x0+(f.tx-f.x0)*p,f.y0+(f.ty-f.y0)*p-Math.sin(Math.PI*p)*14]};
      const p=Math.min(1,f.t/f.life),[bx,by]=pos(f.t);
      lx.globalAlpha=0.35;lx.fillStyle='#000';lx.fillRect(Math.round(f.x0+(f.tx-f.x0)*p)-3,Math.round(f.y0+(f.ty-f.y0)*p)+9,7,2);lx.globalAlpha=1; // its shadow on the ground
      boneGlow(bx,by,8,0.22);
      for(let k=2;k>=1;k--){const q=f.t-k*0.022,[gx,gy]=pos(q);drawBone(gx,gy,q*22*f.spin,12,0.15*(3-k))} // a fading blur behind it as it spins
      drawBone(bx,by,f.t*22*f.spin,12)}
    else if(f.k==='frag'){const fade=f.t>f.life-0.3?(f.life-f.t)/0.3:1;drawBone(f.x,f.y,f.ang,f.len,fade)}})}

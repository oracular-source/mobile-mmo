// Animation kit (v0.102, animation lane): mob swings, hit flashes, deaths that sink, flying things (the Skeleton King's Bone Throw), Greyfang's roar-howl and wolf bites, the player's attack poses.
'use strict';
// Looks only. Everything here uses fr() (Math.random), never the game's rng(), and never changes a timer, a number or
// a position the rules use, so fights and the sim roll exactly the same with or without it. While the sim runs
// (logMute) nothing is spawned, so it stays fast.
const fr=(a,b)=>a+Math.random()*(b-a);
const fxo=[]; // short animations and flying things: {k:kind, t, life, ...}
const SWING=0.26,BONE_FLIGHT=0.32; // seconds: a lunge out and back, a hit nudge, the bone in the air

// Dust, shards, sparks: little 1-pixel bits that fly out and fade (the same parts list as the old bursts).
function fxBits(x,y,cols,n,sp,up,life){for(let i=0;i<n;i++)parts.push({x:x+fr(-2,2),y:y+fr(-2,2),vx:fr(-1,1)*sp,vy:fr(-1,1)*sp-(up||0),t:0,life:fr(0.35,0.75)*(life||1),col:cols[i%cols.length]})}

// A mob swings: a quick lunge toward whoever it hits, and a slash that sweeps across them. Each mob lunges on its own
// swing, so a stack of three ripples instead of blurring into one shape.
function animSwing(m,v){if(logMute)return;
  const dx=v.x-m.x,dy=v.y-m.y,d=Math.hypot(dx,dy)||1,P=MOB_POSES[m.def.img];m.swx=dx/d;m.swy=dy/d;
  // Physical attacks (owner, Nov 27): a mob with drawn attack frames shows the swing or the bite with its own body,
  // no slash or floating fangs over you. The frames carry the lunge.
  if(P){m.swDur=P.t[1]+P.t[2]+P.t[3];m.swT=m.swDur;return}
  m.swDur=SWING;m.swT=SWING;
  if(m.def.bite)return; // a biter without its own frames yet: the lunge only, never floating fangs (physical attacks)
  fxo.push({k:'slash',x:v.x,y:v.y-8,ax:-dx/d,ay:-dy/d,t:0,life:0.16,col:m.def.slash||'#f2eee0'})}
// A mob dies. Its family's death if it has one (def.death in js/data/mobs.js), otherwise it sinks into the ground and
// fades while dust puffs out at its feet. (No white flash: owner, Nov 27, it looked like a hit.)
function animDeath(m){if(logMute)return;const img=IMG[m.def.img];if(!img)return;
  if(m.def.death==='bones'){boneCollapse(m,img);return}
  if(m.def.death==='flip'&&MOB_DEATH_IMG[m.def.img]){const k=m.def.img,vs=[k,k+'_2',k+'_3'].filter(v=>MOB_DEATH_IMG[v]),D=MOB_DEATH_IMG[vs[Math.floor(Math.random()*vs.length)]]; // cultists have 2 more deaths, picked at random (looks only, so Math.random, not the game's dice)
    fxo.push({k:'flip',D:D,x:m.x,y:m.y+1-(m.def.float?6:0),dir:m.dir,t:0,life:D.t.reduce((a,b)=>a+b,0)});return} // a family death drawn as frames (rats, beetles, boar, wisp, cultists); a floating wisp dies where it hovers
  if(m.def.float)return;
  fxo.push({k:'fall',img:img,x:m.x,y:m.y+1,dir:m.dir,t:0,life:0.55});fxBits(m.x,m.y-1,['#6e6458','#8a7f70','#5a5248'],8,16,4,0.9)}

// ---------- Skeleton death: falls into a pile of bones, the skull drops on top (v0.105, first unique death) ----------
// The body caves in (squashes toward its feet in about 0.12 s) while its bones spill out and land in a little mound;
// the skull hangs in the air a beat, then drops onto the pile, bounces once and settles. The pile lies there about
// 3 s, then fades. def.deathHead = [x, y, w, h, source width]: where the skull is in the sprite's grid.
function boneCollapse(m,img){const H=m.def.deathHead||[3,0,9,7,16],sc=img.w/H[4],big=sc>1.5;
  const gy=m.y,pc=[],n=big?11:7;
  for(let i=0;i<n;i++){const tx=m.x+fr(-6,6)*(big?1.6:1)*(0.4+0.6*Math.abs(Math.sin(i*1.7))),y0=m.y-fr(img.h*0.2,img.h*0.65),t0=fr(0.03,0.12);
    pc.push({x:m.x+fr(-3,3)*(big?2:1),y:y0,tx:tx,gy:gy-Math.max(0,(big?5:3.5)-Math.abs(tx-m.x)*0.6)-fr(0,1),lie:fr(-0.45,0.45)+(Math.random()<0.5?0:Math.PI),vx:0,vy:fr(-20,0),t0:t0,ang:fr(0,6.3),va:fr(-16,16),len:big?fr(4,8):fr(3,6),down:false})}
  pc.forEach(p=>{p.vx=(p.tx-p.x)/0.24});
  fxo.push({k:'bones',img:img,x:m.x,y:m.y+1,dir:m.dir,H:H,sc:sc,pc:pc,gy:gy,t:0,life:3.4,
    sk:{x:m.x+(H[0]+H[2]/2-H[4]/2)*sc*m.dir,y:m.y+1-img.h+H[1]*sc,vy:0,vx:fr(-6,6),rest:gy-3-(big?3:0),bounced:0,ang:0,landed:0},puffed:0})}
function bonesTick(f,dt){const g=320;
  f.pc.forEach(p=>{if(f.t<p.t0||p.down)return;p.vy+=g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.ang+=p.va*dt;
    if(p.y>=p.gy){p.y=p.gy;p.down=true;p.ang=p.lie}}); // lands and lies still, roughly flat (a bone standing upright reads as a stick)
  if(!f.puffed&&f.t>0.2){f.puffed=1;fxBits(f.x,f.gy-1,['#6e6458','#8a7f70','#5a5248'],8,18,4,0.9)}
  const s=f.sk;if(f.t<0.24){s.y+=Math.sin(f.t*40)*0.08;return} // the skull hangs a beat while the body caves in under it
  if(s.landed)return;s.vy+=g*dt;s.y+=s.vy*dt;s.x+=s.vx*dt;s.ang+=s.vx*dt*0.15;
  if(s.y>=s.rest){s.y=s.rest;if(!s.bounced){s.bounced=1;s.vy*=-0.32;s.vx*=0.5;fxBits(s.x,s.rest+2,['#8a7f70','#cfc6ae'],4,10,3,0.6)}else{s.landed=1;s.vy=0}}}
function bonesDraw(f){const im=f.img,dirIm=f.dir<0?im.f:im.c,H=f.H,sc=f.sc,fade=f.t>f.life-0.5?(f.life-f.t)/0.5:1;
  // The body below the skull caving in.
  if(f.t<0.14){const p=f.t/0.14,top=Math.round((H[1]+H[3])*sc),bh=im.h-top,h=Math.max(1,Math.round(bh*(1-p*0.8)));
    lx.globalAlpha=1-p*0.6;lx.drawImage(dirIm,0,top,im.w,bh,Math.round(f.x)-(im.w>>1),Math.round(f.y)-h,im.w,h);lx.globalAlpha=1}
  // The bones, falling and then lying in their pile.
  f.pc.forEach(p=>{if(f.t>=p.t0)drawBone(p.x,p.y,p.ang,p.len,fade)});
  // The skull, cut from the sprite itself so it's the same face (and the King keeps his crown).
  const s=f.sk,sw=Math.round(H[2]*sc),sh=Math.round(H[3]*sc),sx=f.dir<0?im.w-Math.round((H[0]+H[2])*sc):Math.round(H[0]*sc);
  lx.globalAlpha=fade;lx.save();lx.translate(Math.round(s.x),Math.round(s.y)+(sh>>1));lx.rotate(Math.round(s.ang/0.35)*0.35);
  lx.drawImage(dirIm,sx,Math.round(H[1]*sc),sw,sh,-(sw>>1),-(sh>>1),sw,sh);lx.restore();lx.globalAlpha=1}

// Where to draw a mob this frame: its swing lunge, with a tiny lean back just before. (Hit reactions wait for weapon
// animations, owner Nov 27.)
// Which attack frame to draw (MOB_POSES in sprites.js), or null for the normal sprite: the wind-up in the moment
// before the hit lands (m.atk counts down to it), then smear, hit (held) and recover after it.
// Cast poses (v0.147, owner OK'd draft 1): while a cast bar fills the caster holds its pose and the glow builds a step at a
// time; when the spell goes off (castPlay) the release frames play once. Instant moves (chant, flare, Ember Brand) play
// their whole move through castPlay. Looks only.
function castKind(c){return c.heal?'heal':c.grasp?'grasp':c.toll?'toll':c.bone?null:'bolt'}
function castPlay(m,kind){if(logMute)return;const C=MOB_CAST_IMG[m.def.img];if(C&&C[kind]){m.cpK=kind;m.cpAt=time}}
function castFrame(m){const C=MOB_CAST_IMG[m.def.img];if(!C)return null;
  if(m.casting){const k=castKind(m.casting),A=k&&C[k];if(!A||!A.h.length)return null;m.cpK=null;
    return A.h[Math.min(A.h.length-1,Math.floor(m.casting.t/m.casting.dur*A.h.length))]}
  if(m.cpK){const A=C[m.cpK];let e=time-m.cpAt;for(let i=0;i<A.r.length;i++){if(e<A.rt[i])return A.r[i];e-=A.rt[i]}m.cpK=null}
  return null}
function poseFrame(m){const cf=castFrame(m);if(cf)return cf;const P=MOB_POSE_IMG[m.def.img];if(!P||m.casting)return null;const t=P.t;
  if(m.swT>0){const e=(m.swDur||0)-m.swT;return e<t[1]?P.smear:e<t[1]+t[2]?P.hit:P.rec}
  if(m.def.charge&&m.wind>0)return P.wind; // the boar lowering its head before a charge shows its head-down frame
  if(m.near>0&&m.atk>0&&m.atk<t[0]&&m.aimX!==undefined)return P.wind;
  return null}
function mobAnim(m){let dx=0,dy=0;if(MOB_POSES[m.def.img])return{dx:0,dy:0}; // drawn frames move the body themselves
  const img=IMG[m.def.img],L=Math.min(6,Math.max(3,Math.round(((img&&img.w)||14)*0.18)));
  if(m.near>0&&m.atk>0&&m.atk<0.3&&m.aimX!==undefined){const k=(0.3-m.atk)/0.3,ax=m.aimX-m.x,ay=m.aimY-m.y,d=Math.hypot(ax,ay)||1;dx-=ax/d*k;dy-=ay/d*k} // the wind-up: leans back a pixel
  if(m.swT>0){const p=1-m.swT/(m.swDur||SWING),o=p<0.25?p/0.25:1-(p-0.25)/0.75;dx+=m.swx*L*o;dy+=m.swy*L*o*0.7}
  return{dx:Math.round(dx),dy:Math.round(dy)}}

// ---------- The Skeleton King's Bone Throw (v0.102, owner picked it over a wailing skull and a crown bolt) ----------
// Same rules as the old Shadow Bolt: a 2 s cast, stun or fear breaks it, out of range it falls short. During the cast he
// lifts a thigh bone over his head; just before the cast ends he throws it, so it lands the moment the hit does.
function boneLaunch(m){m.casting.thrown=1;if(logMute)return;const img=IMG[m.def.img],h=(img&&img.h)||30;
  const P=m.casting.foe||player,slow=m.aslow>0&&m.slowCast?(m.aslowX||1.6):1,far=dist(m,P)>BOLT.range; // foe: thrown at another player (multiplayer)
  let tx=P.x,ty=P.y-8;if(far){const d=dist(m,P)||1;tx=m.x+(P.x-m.x)/d*BOLT.range;ty=m.y+(P.y-m.y)/d*BOLT.range} // out of range: it drops short
  fxo.push({k:'bone',m:m,x0:m.x+m.dir*4,y0:m.y-h-4,tx:tx,ty:ty,home:!far,t:0,life:BONE_FLIGHT*slow,spin:m.dir,out:null})}
// The hit lands (world.js tells us how it went): 'hit', 'dodge' or 'miss'.
function boneLand(m,out){const b=fxo.find(f=>f.k==='bone'&&f.m===m&&!f.out);if(b)b.out=out}
// Draw a bone at any angle, chunky enough to read on a phone: a dark outline, a 2-pixel cream shaft, and two knobs at
// each end (the dog-bone shape is what makes it read as a bone at a glance). Placed on whole pixels so it stays crisp.
function drawBone(x,y,ang,len,a){const c=Math.cos(ang),s=Math.sin(ang),px=-s,py=c,hl=len/2;lx.globalAlpha=a==null?1:a;
  const dot=(X,Y,n,col)=>{lx.fillStyle=col;lx.fillRect(Math.round(X)-(n>>1),Math.round(Y)-(n>>1),n,n)};
  const big=len>=8,kn=big?1.6:1;
  if(!big){ // small bone: a cream line with a shadow pixel under it and a knob at each end, so it stays light
    for(let i=-hl;i<=hl;i+=0.5)dot(x+c*i,y+s*i+1,1,'#1c1820');
    for(let i=-hl;i<=hl;i+=0.5)dot(x+c*i,y+s*i,1,'#e4dccb');
    [-1,1].forEach(e=>{dot(x+c*hl*e+px*0.6,y+s*hl*e+py*0.6,1,'#f6f0dc');dot(x+c*hl*e-px*0.6,y+s*hl*e-py*0.6,1,'#bdb39c')});lx.globalAlpha=1;return}
  for(let pass=0;pass<2;pass++){const n=pass?2:4,col=pass?'#e8e0c8':'#1c1820';
    for(let i=-hl;i<=hl;i+=0.5)dot(x+c*i,y+s*i,n,col);
    if(big)[-1,1].forEach(e=>{const ex=x+c*hl*e,ey=y+s*hl*e;dot(ex+px*kn,ey+py*kn,n,pass?'#f6f0dc':col);dot(ex-px*kn,ey-py*kn,n,pass?'#f6f0dc':col)})}
  if(big){lx.fillStyle='#a89e86';for(let i=-hl+2;i<=hl-2;i+=1)lx.fillRect(Math.round(x+c*i+px*0.7),Math.round(y+s*i+py*0.7),1,1)} // shade on the lower edge
  lx.globalAlpha=1}
// A soft grave-light glow (added on top, so it brightens the dark crypt instead of painting over it).
function boneGlow(x,y,r,a){lx.globalCompositeOperation='lighter';lx.globalAlpha=a;lx.fillStyle='#6a4a9a';lx.beginPath();lx.arc(Math.round(x),Math.round(y),r,0,7);lx.fill();
  lx.globalAlpha=a*1.4;lx.beginPath();lx.arc(Math.round(x),Math.round(y),r*0.5,0,7);lx.fill();lx.globalAlpha=1;lx.globalCompositeOperation='source-over'}

// ---------- Greyfang's Howl (v0.110; owner: a drawn lean-back pose, not a turned sprite, and he keeps running) ----------
// Looks only: the howl already calls his pack from 260 away (combat.js), and he never slows down. For about a second he
// shows his howl frame (head thrown back, muzzle up, mouth open; his legs keep their walk) while three short sound lines
// pulse from his jaws like a Pokemon cry.
const HOWL={time:1.0,pulse:0.22,col:'#e8f4ff',mouth:[35,1]}; // mouth = his nose tip in the howl frame's grid
// Old Gnawbone's rats clawing out of a wall hole (v0.155, owner picked A): the dirt round the hole cracks and sprays out
// as the rat scrabbles free. Looks only.
function holeBurst(x,y){if(logMute)return;const seg=[];for(let i=0;i<6;i++){const a=fr(0,6.28);seg.push([Math.cos(a),Math.sin(a)*0.7,fr(4,8)])}
  fxo.push({k:'crack',x:x,y:y-3,seg:seg,t:0,life:1.1});fxBits(x,y-3,['#6e5a40','#8a7356','#4b3b2a','#3a3127'],18,30,12,1.2)}
// v0.157 (owner: the rats looked like they came out of the wall itself, not the hole as drafted): the rat starts inside the
// hole's dark mouth, seen only through it, pokes its snout out and scrabbles down onto the floor, sliding to where it
// really is over EMERGE seconds. Looks only: the rat's real spot, timing and chase never change (sims stay the same).
const EMERGE={poke:0.3,out:0.45}; // seconds: snout poking out of the dark, then scrabbling down onto the floor
function animEmerge(r,h){if(logMute||h.mx===undefined)return;const im=IMG[r.def.img];
  // start: feet on the hole's floor line, body tucked in so only the snout end shows in the mouth; it runs toward you,
  // so its snout leads that way
  const fd=player.x>=r.x?1:-1;r.emerge={t:time,sx:h.mx+h.mw/2-fd*Math.round(im.w*0.4),sy:h.f,fd:fd,h:h}}
// Before drawing an emerging rat: clip to the hole's mouth plus the floor below the wall face, and draw it back at the
// hole, catching up with its real spot as it climbs out. Returns true if it set up a clip (the caller restores).
function emergeClip(m){const e=m.emerge;if(!e)return false;const t=time-e.t;if(t>=EMERGE.poke+EMERGE.out||m.dead){m.emerge=null;return false}
  let x,y;
  if(t<EMERGE.poke){const k=t/EMERGE.poke;x=e.sx-e.fd*Math.round(5*(1-k));y=e.sy} // the snout creeps out of the dark
  else{const k=(t-EMERGE.poke)/EMERGE.out,q=k*k*(3-2*k);x=e.sx+(m.x-e.sx)*q;y=e.sy+(m.y-e.sy)*q} // out and down to the floor
  const h=e.h;lx.save();lx.beginPath();lx.rect(h.mx,h.my,h.mw,h.f+1-h.my);lx.rect(h.mx-60,h.f+1,h.mw+120,60);lx.clip();
  lx.translate(Math.round(x-m.x),Math.round(y-m.y));return true}
function animHowl(m){if(logMute)return;m.howlT=HOWL.time;fxo.push({k:'howl',m:m,t:0,life:HOWL.time+0.1})}
// His howl picture right now, or null for his normal one (a short beat before and after so the head snaps up and down).
function howlFrame(m){if(!(m.howlT>0.06&&m.howlT<HOWL.time-0.06))return null;return IMG[m.def.img+'howl']||null}
function howlTick(f,dt){}
// Three short lines fanning out from his raised jaws, each pulse sliding out and fading.
function howlDraw(f){const m=f.m;if(m.dead||!howlFrame(m))return;const im=IMG[m.def.img+'howl'],an=mobAnim(m),e=HOWL.time-m.howlT;
  const ox=m.x+an.dx+m.dir*(HOWL.mouth[0]+0.5-(im.w>>1)),oy=m.y+1+an.dy-im.h+HOWL.mouth[1],q=(e%HOWL.pulse)/HOWL.pulse;lx.fillStyle=HOWL.col;
  [-1.35,-0.85,-0.35].forEach(a0=>{const a=m.dir>0?a0:Math.PI-a0,c=Math.cos(a),s=Math.sin(a),r0=3+q*4;lx.globalAlpha=1-q;
    for(let i=0;i<3;i++)lx.fillRect(Math.round(ox+c*(r0+i)),Math.round(oy+s*(r0+i)),1,1)});
  lx.globalAlpha=1}

// Every frame (from update): move the animations along and drop the finished ones.
function fxTick(dt){
  for(let i=0;i<mobs.length;i++){const m=mobs[i];if(m.swT>0)m.swT-=dt;if(m.near>0)m.near-=dt;if(m.howlT>0)m.howlT-=dt}
  for(let i=fxo.length-1;i>=0;i--){const f=fxo[i];f.t+=dt;
    if(f.k==='bone'){if(f.home){f.tx=player.x;f.ty=player.y-8}const p=Math.min(1,f.t/f.life),bx=f.x0+(f.tx-f.x0)*p,by=f.y0+(f.ty-f.y0)*p-Math.sin(Math.PI*p)*14;
      if(Math.random()<0.8)parts.push({x:bx+fr(-1,1),y:by+fr(-1,1),vx:fr(-4,4),vy:fr(-6,2),t:0,life:fr(0.25,0.5),col:Math.random()<0.35?'#9a7cc8':'#cfc6ae'}); // bone dust and a thread of grave-light
      if(f.t>=f.life){fxo.splice(i,1);boneEnd(f,bx,by);continue}}
    else if(f.k==='bones')bonesTick(f,dt);
    else if(f.k==='howl')howlTick(f,dt);
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
    if(f.k==='crack'){const p=f.t/f.life;lx.fillStyle='#0e0b09';lx.globalAlpha=Math.max(0,1-p*p);
      f.seg.forEach(([cx,cy,len])=>{const n=Math.round(len*Math.min(1,p*4));for(let j=2;j<n;j++)lx.fillRect(Math.round(f.x+cx*j),Math.round(f.y+cy*j),1,1)});lx.globalAlpha=1}
    else if(f.k==='slash'){const p=f.t/f.life,base=Math.atan2(f.ay,f.ax);lx.fillStyle=f.col;
      for(let j=0;j<6;j++){const q=j/5;if(q>p*1.6)break;const an=base-1+q*2;lx.globalAlpha=Math.max(0,1-p)*(0.5+0.5*q);lx.fillRect(Math.round(f.x+Math.cos(an)*5),Math.round(f.y+Math.sin(an)*5),1,1)}lx.globalAlpha=1}
    else if(f.k==='fall'){const p=f.t/f.life,im=f.img,h=Math.max(1,Math.round(im.h*(1-p*0.75))),w=im.w,dx=Math.round(f.x)-(w>>1),dy=Math.round(f.y)-h;
      lx.globalAlpha=1-p*p;lx.drawImage(f.dir<0?im.f:im.c,0,0,w,im.h,dx,dy,w,h);lx.globalAlpha=1}
    else if(f.k==='bones')bonesDraw(f)
    else if(f.k==='flip'){let acc=0,i=0;const T=f.D.t;for(;i<T.length-1;i++){acc+=T[i];if(f.t<acc)break} // the frame for this moment; the last one fades out at once
      const last=i===T.length-1;if(last)lx.globalAlpha=Math.max(0,1-(f.t-acc)/T[i]);drawPose(f.D.f[i],f.x,f.y,f.dir);lx.globalAlpha=1}
    else if(f.k==='parc'||f.k==='pthrust')playerFxDraw(f)
})}
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
  fxo.forEach(f=>{if(f.k==='howl')howlDraw(f)});
  fxo.forEach(f=>{
    if(f.k==='bone'){const pos=q=>{const p=Math.min(1,q/f.life);return[f.x0+(f.tx-f.x0)*p,f.y0+(f.ty-f.y0)*p-Math.sin(Math.PI*p)*14]};
      const p=Math.min(1,f.t/f.life),[bx,by]=pos(f.t);
      lx.globalAlpha=0.35;lx.fillStyle='#000';lx.fillRect(Math.round(f.x0+(f.tx-f.x0)*p)-3,Math.round(f.y0+(f.ty-f.y0)*p)+9,7,2);lx.globalAlpha=1; // its shadow on the ground
      boneGlow(bx,by,8,0.22);
      for(let k=2;k>=1;k--){const q=f.t-k*0.022,[gx,gy]=pos(q);drawBone(gx,gy,q*22*f.spin,12,0.15*(3-k))} // a fading blur behind it as it spins
      drawBone(bx,by,f.t*22*f.spin,12)}
    else if(f.k==='frag'){const fade=f.t>f.life-0.3?(f.life-f.t)/0.3:1;drawBone(f.x,f.y,f.ang,f.len,fade)}})}

// ---------- Player attack poses (character lane, Nov 27; owner OK'd the draft 2 bodies and poses for all 14 classes) ----------
// Looks only, same timing: when an attack or spell goes off (applyAbility), the body shows its pose for a moment, a
// wind-up frame then the strike frame. Owner (Nov 27): the main attack stays plain (it happens constantly), abilities get
// a little flair to start (a thin swipe arc for area swings, a short thrust streak and a few sparks for single hits), and
// it can grow bigger and more dramatic later on. Spell looks stay as they are (the Spells lane owns those).
const PPOSE={main:[0.07,0.16],skill:[0.09,0.2],cast:[0.08,0.18]}; // seconds: wind-up, strike
function animPlayer(a,t){if(logMute||!a)return;const im=playerImg(),P=im&&im.poses;if(!P)return;
  const main=a===ABI[loadout[0]],phys=(a.melee||a.shot)&&(a.tgt||a.kind==='cleave'); // weapon moves that hit enemies (not Bandage)
  // Which pose: knights chop for the main attack and thrust for abilities; robe classes lift the staff for a melee main
  // attack and cast for spells; everyone else has one pose for any weapon attack.
  let k=null;
  if(phys)k=!main&&P.skill?'skill':P.main?'main':null;
  else if(P.cast)k='cast';
  if(!k)return;
  player.pose={k:k,t0:time};
  if(main&&phys&&weaponShown())player.aura={t0:time}; // basic attack: a tiny aura round the weapon in the class colour; never bare-handed (owner, Nov 28)
  if(k==='cast'&&!(a.cast>0)&&!a.melee)player.flash={a:a,t0:time}; // instant spell: a short glow at the staff tip, sized by its mana
  if(main||!a.melee)return; // plain main attack; spells keep their own looks
  // Ability flair, small for now.
  if(a.kind==='cleave'){fxo.push({k:'parc',x:player.x,y:player.y-7,dir:player.dir,r:Math.min(13,(a.radius||16)*0.6),t:0,life:0.2});return}
  if(t&&!t.dead){const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
    fxo.push({k:'pthrust',x:player.x+dx/d*6,y:player.y-8+dy/d*2,ux:dx/d,uy:dy/d,t:0,life:0.16});
    fxBits(t.x,t.y-8,['#fff4dc','#ffd27a'],3,22,4,0.5)}}
// The frame to draw right now ({im, ax}) or null for the normal standing/walking body. Spells with a cast time hold the
// cast pose for the whole cast.
function playerPose(img){const P=img&&img.poses;if(!P)return null;
  if(player.cast&&P.cast)return P.cast[1];
  const p=player.pose;if(!p||!P[p.k])return null;const e=time-p.t0,T=PPOSE[p.k];
  if(e<0||e>=T[0]+T[1]){player.pose=null;return null}
  return P[p.k][e<T[0]?0:1]}
// Channel glow (character lane, owner Nov 27): while a spell with a cast time charges, light gathers at the staff tip in the
// spell's colour and grows as the bar fills (a soft glow and a bright core that becomes a small cross past half), and render.js grows a light pool around it. Instant spells keep the quick lift. Small to start; can grow later.
const CGLOW={};
function castGlowStamp(r,col){const k=r+col;if(CGLOW[k])return CGLOW[k];
  const n=parseInt(col.slice(1),16),R=n>>16,G=n>>8&255,B=n&255,z=r*2+1,c=document.createElement('canvas');c.width=c.height=z;
  const g=c.getContext('2d'),id=g.createImageData(z,z),d=id.data;
  for(let y=0;y<z;y++)for(let x=0;x<z;x++){const v=Math.max(0,1-Math.hypot(x-r,y-r)/(r+0.5)),o=(y*z+x)*4;d[o]=R;d[o+1]=G;d[o+2]=B;d[o+3]=v*v*255}
  g.putImageData(id,0,0);return CGLOW[k]=c}
// Owner (Nov 27, v0.133): no drifting motes and no flutter; just a steady glow that grows brighter as the bar fills.
// Owner (Nov 27, v0.135): how big and bright it can get comes from the spell's mana cost, in three steps (GLOW_TIER), for
// cast-time and instant spells alike; c.p is how far along it is (the cast bar, or the instant flash fading out).
const GLOW_TIER={r:[5,7,9],a:[0.5,0.65,0.8],light:[14,20,26]}; // small (under 10 mana), medium (10-19), big (20+)
const FLASH_T=PPOSE.cast[0]+PPOSE.cast[1]; // an instant spell glows as long as its cast pose lasts
function glowTier(a){const m=a.mana||0;return m>=20?2:m>=10?1:0}
function castGlowDraw(){const c=player.castTip;if(!c)return;const p=c.p,T=c.tier,r=Math.max(2,Math.round(2+(GLOW_TIER.r[T]-2)*p));
  lx.globalCompositeOperation='lighter';lx.globalAlpha=0.25+(GLOW_TIER.a[T]-0.25)*p;lx.drawImage(castGlowStamp(r,c.col),c.x-r,c.y-r);lx.globalCompositeOperation='source-over';
  lx.globalAlpha=Math.min(1,0.4+p);lx.fillStyle='#fffbe8';lx.fillRect(c.x,c.y,1,1);
  if(T===2&&p>0.5){lx.globalAlpha=Math.min(1,(p-0.5)*2);lx.fillRect(c.x-1,c.y,3,1);lx.fillRect(c.x,c.y-1,1,3)}lx.globalAlpha=1}
// Weapon aura (character lane, owner Nov 28; first step of "Hits that grow with damage"): every basic attack, melee too,
// lights a very small soft glow round the weapon's head in the class colour. It rises through the wind-up, peaks on the
// strike and fades. Tiny on purpose: it happens constantly; it can grow later (big hits, the gleam idea on the board).
const AURA={r:3,a:0.55,t:PPOSE.main[0]+PPOSE.main[1]+0.12}; // radius px, peak strength, seconds
function auraDraw(){const c=player.atkTip;if(!c)return;const s=Math.sin(Math.PI*Math.min(1,c.p));
  lx.globalCompositeOperation='lighter';lx.globalAlpha=AURA.a*s;lx.drawImage(castGlowStamp(AURA.r,c.col),c.x-AURA.r,c.y-AURA.r);
  lx.globalCompositeOperation='source-over';lx.globalAlpha=1}
// Ability flair drawing (in the world, before the lighting, like the mob slashes).
function playerFxDraw(f){const p=f.t/f.life;
  if(f.k==='parc'){lx.fillStyle='#f2eee0';const base=f.dir>0?0:Math.PI; // a thin arc sweeping round in front, top to bottom
    for(let j=0;j<10;j++){const q=j/9;if(q>p*1.8)break;const an=base+(f.dir>0?1:-1)*(-1.2+q*2.4);lx.globalAlpha=Math.max(0,1-p)*(0.35+0.5*q);
      lx.fillRect(Math.round(f.x+Math.cos(an)*f.r),Math.round(f.y+Math.sin(an)*f.r*0.6),1,1)}lx.globalAlpha=1}
  else if(f.k==='pthrust'){lx.fillStyle='#fff4dc';const n=Math.round(3+p*4); // a short streak along the thrust
    for(let i=0;i<n;i++){lx.globalAlpha=Math.max(0,1-p)*(0.3+0.7*i/n);lx.fillRect(Math.round(f.x+f.ux*(i+p*4)),Math.round(f.y+f.uy*(i+p*4)),1,1)}lx.globalAlpha=1}}

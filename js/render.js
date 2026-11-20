// Drawing: sprites to pictures, camera and zoom, lighting, the world, and the HUD bars.
'use strict';
function mk(rows,pal,scale){
  scale=scale||1;const h=rows.length,w=rows[0].length;
  const c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;const g=c.getContext('2d');
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];if(ch!=='.'&&pal[ch]){g.fillStyle=pal[ch];g.fillRect(i*scale,j*scale,scale,scale)}}
  const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const fg=f.getContext('2d');fg.translate(c.width,0);fg.scale(-1,1);fg.drawImage(c,0,0);
  return{c:c,f:f,w:c.width,h:c.height};
}
// A picture with step frames (walk cycle: stand, step, stand, step). One step frame is used for both steps.
function mkWalk(rows,step,pal,scale){const im=mk(rows,pal,scale),st=mk(step,pal,scale);im.steps=[st,st];return im}
const IMG={druid:mk(SPR.druid,PAL),dead:mk(SPR.dead,PAL),rat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.rat)),beetle:mk(SPR.beetle,PAL),
  guard:mk(SPR.guard,PAL),warrior:mk(SPR.warrior,PAL),rogue:mk(SPR.rogue,PAL),
  necro:mk(SPR.necro,Object.assign({},PAL,{p:'#2e2338',P:'#1d1626',x:'#b8b4c4'})),
  pet:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#2a4a28',e:'#7dffa6'})),minion:mk(SPR.dead,Object.assign({},PAL,{z:'#9a9282',Z:'#6b6470',r:'#3a1418',e:'#ff3b30'})),blade:mk(SPR.blade,PAL),
  earth:mk(SPR.elem,Object.assign({},PAL,{A:'#8a6a48',a:'#5e4630',e:'#ffd27a'})),fire:mk(SPR.elem,Object.assign({},PAL,{A:'#ff9a4a',a:'#c4471f',e:'#fff3c4'})),peddler:mk(SPR.peddler,PAL),crow:mk(SPR.crow,PAL),crowfly:mk(SPR.crowfly,PAL),frog:mk(SPR.frog,PAL),
  gnaw:mkWalk(SPR.gnaw,SPR.gnawstep,Object.assign({},PAL,RAT_PAL.gnaw)),
  trat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.trat)),
  brat:mkWalk(SPR.brat,SPR.bratstep,Object.assign({},PAL,RAT_PAL.brat)),
  crat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.crat)),
  ironshell:mk(SPR.ironshell,Object.assign({},PAL,RARE_PAL.ironshell),2),palerat:mkWalk(SPR.brat,SPR.bratstep,Object.assign({},PAL,RARE_PAL.palerat)),
  bride:mk(SPR.bride,Object.assign({},PAL,RARE_PAL.bride)),
  skel:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#3a3442'})),
  boss1:mk(SPR.dead,Object.assign({},PAL,{z:'#b9b3a0',Z:'#7a7468',r:'#3d2a63',e:'#b48cff'}),3)}; // bosses draw at 3x so they loom (placeholder until the art pass)

// Default skin: lay each weapon over the shared body, then colour it from the class's SKINS entry.
function mkSkin(id){
  const sk=SKINS[id];if(!sk)return null;
  const rows=BASE_BODY.map(r=>r.split(''));
  (sk.weapons||[]).forEach(w=>(WEAPONS[w]||[]).forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]!=='.')rows[j][i]=r[i]}));
  return mk(rows.map(r=>r.join('')),Object.assign({},PAL,{h:sk.hair,b:sk.body,B:sk.shade,t:sk.trim,u:sk.boots,v:sk.glow||'#ffffff',q:sk.shield||'#6a82b0'}));
}
// Rags (gear tier 0): head + body + starter weapon on a 20x24 grid, coloured from RAGS. Also makes two
// walk frames where one foot lifts a pixel (feet are columns 4-7 and 10-13), so legs move instead of the whole body bobbing.
function mkRags(id){
  const c=RAGS[id];if(!c)return null;
  const W=20,g=RAG_HEADS[id].concat(RAG_BODIES[c.body]).map(r=>{const a=r.split('');while(a.length<W)a.push('.');return a});
  c.w.forEach(w=>RAG_WEAPONS[w].forEach(([y0,rows])=>rows.forEach((r,j)=>{const y=y0+j;if(!g[y])return;for(let i=0;i<r.length&&i<W;i++)if(r[i]!=='.')g[y][i]=r[i]})));
  const pal=Object.assign({},RAG_COMMON,c.c),H=g.length;
  const step=(a,b)=>{const n=g.map(r=>r.slice());for(let x=a;x<=b;x++){n[H-3][x]=g[H-2][x];n[H-2][x]=g[H-1][x];n[H-1][x]='.'}return n.map(r=>r.join(''))};
  // v0.27.2: 20x24 read too big next to doors, so shrink to 15x18 (just over the old 12x16) by dropping every 4th row/column.
  const shrink=rows=>{const sh=18,sw=15,h=rows.length,w=rows[0].length,o=[];for(let j=0;j<sh;j++){let r='';const src=rows[Math.floor(j*h/sh)];for(let i=0;i<sw;i++)r+=src[Math.floor(i*w/sw)];o.push(r)}return o};
  const im=mk(shrink(g.map(r=>r.join(''))),pal);im.steps=[mk(shrink(step(4,7)),pal),mk(shrink(step(10,13)),pal)];return im;
}
// The player's picture: the rags look by default. DEV "Old look" shows the class's previous sprite
// (or the v0.15 default skin), and "Default skin" forces the shared 12x16 body, for comparing.
function playerImg(){
  if(dev.skin||(dev.old&&!C.sprite)){const k='skin_'+CLS;if(!IMG[k])IMG[k]=mkSkin(CLS)||IMG.druid;return IMG[k]}
  if(dev.old)return IMG[C.sprite];
  const k='rags_'+CLS;if(!IMG[k])IMG[k]=mkRags(CLS)||IMG.druid;return IMG[k];
}
// Walk cycle for pictures that have step frames: stand, left foot up, stand, right foot up (body rises on steps).
function walkFrame(img,walk,moving){
  if(!moving)return{im:img,bob:0};
  const f=Math.floor(walk*6)%4; // a bit slower than before so the steps read clearly
  if(!img.steps)return{im:img,bob:f%2};
  return{im:f===1?img.steps[0]:f===3?img.steps[1]:img,bob:0}; // feet move, body stays put (the bob made it look jittery)
}

/* ---------- Render ---------- */
let S=3,VW=160,VH=200,camX=0,camY=0,dpr=1;
// Zoom: settings.zoom is how many game pixels wide the view should be (bigger = see more).
// The game scales up by whole steps (S) so pixels stay crisp, so the real width snaps to the nearest step.
// Resolution cap is 3x (was 2x) so phones get finer zoom steps.
const ZOOM_MIN=150, ZOOM_MAX=210; // farthest zoom is one notch past a 210-pixel-wide view (tuned by play-test in v0.11.7)
function zoomSteps(){const lo=Math.max(2,Math.ceil(cv.width/ZOOM_MAX)-1),hi=Math.max(lo,Math.floor(cv.width/ZOOM_MIN));return [lo,hi]}
function applyZoom(){
  const [lo,hi]=zoomSteps();
  S=Math.min(hi,Math.max(lo,Math.round(cv.width/settings.zoom)));VW=Math.ceil(cv.width/S);VH=Math.ceil(cv.height/S);
  low.width=VW;low.height=VH;
}
function resize(){
  const r=$('view').getBoundingClientRect();dpr=Math.min(3,window.devicePixelRatio||1);
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  applyZoom();
}
// Step the zoom by one notch (+1 = closer, -1 = farther) and remember it.
function zoomStep(d){
  const [lo,hi]=zoomSteps(),n=Math.min(hi,Math.max(lo,S+d));if(n===S)return;
  S=n;settings.zoom=Math.round(cv.width/S);saveSettings();applyZoom();
}
window.addEventListener('resize',resize);
const bay=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const dark=document.createElement('canvas'),dg=dark.getContext('2d'),stampCache={};
// A light pool with a smooth fade (v0.27.2: the old dither pattern looked grainy). 'cut' removes darkness, 'warm' adds firelight color.
function lightStamp(r,amb,kind){
  const key=r+'|'+amb+'|'+kind;if(stampCache[key])return stampCache[key];
  const size=r*2+2,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),id=g.createImageData(size,size),d=id.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const v=Math.max(0,1-Math.hypot(x-r-1,(y-r-1)*1.15)/r);if(v<=0)continue;
    let a=kind==='cut'?Math.min(1,v*v*0.9/(1-amb)):v*v;
    const o=(y*size+x)*4;if(kind==='warm'){d[o]=255;d[o+1]=150;d[o+2]=60}else if(kind==='cool'){d[o]=170;d[o+1]=200;d[o+2]=215}d[o+3]=a*255;
  }
  g.putImageData(id,0,0);stampCache[key]=c;return c;
}
function shadow(x,y,r){lx.fillStyle='rgba(0,0,0,0.5)';lx.fillRect(x-r,y-1,r*2,2);lx.fillRect(x-r+1,y+1,r*2-2,1)}
function drawSprite(img,x,y,dir,bob,sit){
  const im=dir<0?img.f:img.c,w=img.w,h=img.h;
  // Round the position first, then offset by whole pixels: with an odd width (15) Math.round(x-w/2) flipped a pixel out of step with the camera, so sprites shook while walking sideways (v0.27.4).
  const dx=Math.round(x)-(w>>1),dy=Math.round(y)-h+(bob||0);
  if(sit){lx.drawImage(im,0,0,w,h-4,dx,dy+4,w,h-4)}else lx.drawImage(im,dx,dy);
}
function line(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;lx.fillStyle=col;
  for(let i=0;i<400;i++){lx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}}
let time=0;
function render(){
  const pxr=Math.round(player.x),pyr=Math.round(player.y);
  // The camera may scroll a little past the map's top edge so the top bars never cover you, and past the bottom edge
  // so the spell pad never covers you either (the crossroads starts at its bottom edge, v0.28).
  const topPad=Math.round(66*dpr/S),botPad=Math.round(VH*0.28);
  camX=Math.max(0,Math.min(WW-VW,pxr-Math.round(VW/2)));camY=Math.max(-topPad,Math.min(WH-VH+botPad,pyr-Math.round(VH/2)-10));
  if(WW<VW)camX=Math.round((WW-VW)/2);if(WH<VH)camY=Math.round((WH-VH)/2);
  lx.fillStyle='#050507';lx.fillRect(0,0,VW,VH);
  lx.save();lx.translate(-camX,-camY);
  lx.drawImage(world,0,0);
  if(curArea())drawAreaFog(curArea());
  if(zoneId==='over'){drawCamp();drawCritters();}
  if(zoneId==='dun'&&run.portal){const p=run.portal;lx.fillStyle='#7dffa6';for(let a=0;a<24;a++){if((a+Math.floor(time*8))%3===0)continue;const an=a/24*Math.PI*2;lx.fillRect(Math.round(p.x+Math.cos(an)*7),Math.round(p.y+Math.sin(an)*4),1,1)}lx.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,2,2)}
  const CHA=curArea();if(CHA)CHA.chests.forEach(ch=>{const x=Math.round(ch.x),y=Math.round(ch.y),f=(X,Y,w,h,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,w,h)};
    if(ch.open){f(x-7,y-12,14,14,AP.out);f(x-6,y-11,12,3,AP.woodHi);f(x-6,y-8,12,1,AP.woodDk);f(x-6,y-7,12,8,AP.wood);f(x-5,y-7,10,3,'#120d0a');f(x-6,y-3,12,1,AP.bell)} // lid up, empty inside
    else{f(x-7,y-8,14,10,AP.out);f(x-6,y-7,12,8,AP.wood);f(x-6,y-7,12,2,AP.woodHi);f(x-6,y-4,12,1,AP.bell);f(x-1,y-5,2,3,AP.bellHi)}});
  if(zoneId==='dun'&&run.chest){const c=run.chest,x=Math.round(c.x),y=Math.round(c.y);lx.fillStyle='#0b0a0f';lx.fillRect(x-6,y-8,12,9);lx.fillStyle=c.open?'#3b2a1d':'#6e4a2a';lx.fillRect(x-5,y-7,10,7);lx.fillStyle='#c9a227';lx.fillRect(x-5,y-5,10,1);lx.fillRect(x-1,y-6,2,3);}
  if(player.tx!==null){lx.fillStyle='#c9a227';const x=Math.round(player.tx),y=Math.round(player.ty);lx.fillRect(x-2,y,1,1);lx.fillRect(x+2,y,1,1);lx.fillRect(x,y-1,1,1);lx.fillRect(x,y+1,1,1)}
  if(rangeShow>0){lx.fillStyle='#ff8a80';for(let a=0;a<64;a+=2){const an=a/64*Math.PI*2;lx.fillRect(Math.round(player.x+Math.cos(an)*rangeR),Math.round(player.y+Math.sin(an)*rangeR*0.8),1,1)}}
  const t=player.target;
  if(t&&!t.dead){for(let a=0;a<24;a++){if((a+Math.floor(time*6))%3===0)continue;const an=a/24*Math.PI*2;lx.fillStyle='#ffcc33';lx.fillRect(Math.round(t.x+Math.cos(an)*8),Math.round(t.y+Math.sin(an)*2.6),1,1)}}
  // Holy ground: a dotted gold ring on the floor that blinks out in its last 3 seconds.
  grounds.forEach(g=>{if(g.t<3&&Math.floor(time*6)%2)return;lx.fillStyle=g.col;for(let a=0;a<48;a++){if((a+Math.floor(time*4))%4===0)continue;const an=a/48*Math.PI*2;lx.fillRect(Math.round(g.x+Math.cos(an)*g.r),Math.round(g.y+Math.sin(an)*g.r*0.6),1,1)}});
  // Venom Totem: a little carved post in the middle of its ring. Spike Traps: grey spikes on the ground.
  grounds.forEach(g=>{if(!g.totem)return;const x=Math.round(g.x),y=Math.round(g.y);lx.fillStyle='#0b0a0f';lx.fillRect(x-2,y-9,4,10);lx.fillStyle='#6e4a2a';lx.fillRect(x-1,y-8,2,8);lx.fillStyle=Math.floor(time*3)%2?'#7a9a3a':'#9be37a';lx.fillRect(x-1,y-9,2,2)});
  traps.forEach(tr=>{const x=Math.round(tr.x),y=Math.round(tr.y);lx.fillStyle='#8d8692';for(let i=-3;i<=3;i+=2)lx.fillRect(x+i,y-1-((i+3)%4?0:1),1,2);lx.fillStyle='#4a3b33';lx.fillRect(x-4,y+1,9,1)});
  // Trees in view join the depth sort (v0.30): whoever stands north of a trunk is drawn first, so the crown covers them.
  const A0=curArea(),trees=A0?A0.trees.filter(tr=>tr.b[2]>=camX&&tr.b[0]<=camX+VW&&tr.b[3]>=camY&&tr.b[1]<=camY+VH):[];
  const ents=mobs.concat(zoneId==='over'?npcs:[],pet?[pet]:[],pet2?[pet2]:[],decoy?[decoy]:[],[player],trees).sort((a,b)=>a.y-b.y);
  // A tree you (or your target) are behind fades so you never lose sight of the fight.
  const behind=(o,tr)=>o&&!o.dead&&o.y<tr.y&&o.x+6>tr.b[0]&&o.x-6<tr.b[2]&&o.y>tr.b[1]+4&&o.y-14<tr.b[3];
  ents.forEach(e=>{
    if(e.tree){const goal=(player.dead>0?false:behind(player,e))||behind(player.target,e)?0.4:1;e.a+=(goal-e.a)*0.2;if(Math.abs(goal-e.a)<0.02)e.a=goal;
      lx.globalAlpha=e.a;lx.drawImage(e.tree.c,e.px,e.py);lx.globalAlpha=1;return}
    if(e===player){
      if(player.dead>0)return;
      shadow(player.x,player.y,6);
      const moving=player.tx!==null||joy.active||(settings.move==='hold'&&joy.id!==null)||keys.w||keys.a||keys.s||keys.d;
      const wf=walkFrame(playerImg(),player.walk,moving&&!player.sit);
      if(hidden())lx.globalAlpha=0.4; // hidden Rogue draws see-through
      drawSprite(wf.im,player.x,player.y+1,player.dir,wf.bob,player.sit||player.fd>0);
      lx.globalAlpha=1;
      if(player.buffs.stance>0&&Math.floor(time*4)%2===0){lx.fillStyle='#c9a227';lx.fillRect(Math.round(player.x)-7,Math.round(player.y)-12,1,1);lx.fillRect(Math.round(player.x)+7,Math.round(player.y)-12,1,1)}
      if(player.buffs.bark>0&&Math.floor(time*4)%4===0){lx.fillStyle='#a07850';lx.fillRect(Math.round(player.x)-6,Math.round(player.y)-10,1,1);lx.fillRect(Math.round(player.x)+6,Math.round(player.y)-6,1,1)}
      if(player.buffs.aura>0){lx.fillStyle='#ffd27a';for(let a=0;a<16;a++){if((a+Math.floor(time*8))%2)continue;const an=a/16*Math.PI*2;lx.fillRect(Math.round(player.x+Math.cos(an)*8),Math.round(player.y-7+Math.sin(an)*10),1,1)}}
      if(player.buffs.mshield>0&&Math.floor(time*4)%2===0){lx.fillStyle='#7dbbff';lx.fillRect(Math.round(player.x)-7,Math.round(player.y)-8,1,2);lx.fillRect(Math.round(player.x)+7,Math.round(player.y)-8,1,2)}
      if(player.cast){lx.fillStyle=player.cast.a.col;const k=Math.floor(time*10)%4;lx.fillRect(Math.round(player.x)+5,Math.round(player.y)-15-k,1,1);lx.fillRect(Math.round(player.x)-5,Math.round(player.y)-13+k,1,1)}
      return;
    }
    if(e===decoy){lx.globalAlpha=0.45;drawSprite(playerImg(),e.x,e.y+1,e.dir,0,false);lx.globalAlpha=1;return}
    if(e===pet||e===pet2){const im=IMG[e.img||'pet']||IMG.pet;
      if(e.img==='blade'){shadow(e.x,e.y,2);drawSprite(im,e.x,e.y-4+Math.round(Math.sin(time*3)),e.dir,0,false);return} // the sword floats
      shadow(e.x,e.y,Math.max(4,Math.round(im.w/2.4)));drawSprite(im,e.x,e.y+1,e.dir,Math.floor(e.walk*6)%2,false);
      if(e.charm&&Math.floor(time*3)%2===0){lx.fillStyle='#ff9de2';const hy=Math.round(e.y-im.h-3);lx.fillRect(Math.round(e.x)-1,hy,1,1);lx.fillRect(Math.round(e.x)+1,hy,1,1);lx.fillRect(Math.round(e.x),hy+1,1,1)} // little heart over a charmed mob
      return}
    if(e.kind){shadow(e.x,e.y,5);const mv=e.target||Math.hypot(e.x-e.hx,e.y-e.hy)>2;drawSprite(IMG[e.kind],e.x,e.y+1,e.dir,mv?(Math.floor(e.walk*6)%2):0,false);return}
    const m=e;if(m.dead)return;
    const img=IMG[m.def.img];
    shadow(m.x,m.y,Math.max(4,Math.round(img.w/2.4)));
    if(m.def.rare){const pr=0.5+0.5*Math.sin(time*3),rw=Math.round(img.w/2)+2;lx.globalAlpha=0.09+0.08*pr;lx.fillStyle='#d8c8ff';lx.beginPath();lx.ellipse(Math.round(m.x),Math.round(m.y),rw,Math.max(2,Math.round(rw/3)),0,0,7);lx.fill();lx.globalAlpha=1;
      if(Math.random()<0.12)parts.push({x:m.x+(Math.random()-0.5)*img.w,y:m.y-Math.random()*img.h,vx:0,vy:-8,t:0,life:0.7,col:'#e6dcff'})} // the faint glow that says "rare" (visual only, no game rolls)
    const mmv=(m.state!=='idle'||Math.hypot(m.x-m.wx,m.y-m.wy)>1)&&!(m.root>0);
    if(img.steps){const wf=walkFrame(img,m.walk,mmv);drawSprite(wf.im,m.x,m.y+1,m.dir,0,false)} // new monsters animate their legs
    else drawSprite(img,m.x,m.y+1,m.dir,mmv?(Math.floor(m.walk*6)%2):0,false);
    if(m.root>0){lx.fillStyle='#5e3e24';for(let i=-5;i<=5;i+=2)lx.fillRect(Math.round(m.x)+i,Math.round(m.y)-((i+Math.floor(time*3))%3===0?2:1),1,2);lx.fillStyle='#3f6b3a';lx.fillRect(Math.round(m.x)-4,Math.round(m.y)-3,1,1);lx.fillRect(Math.round(m.x)+4,Math.round(m.y)-2,1,1)}
    if(m.snare>0&&Math.floor(time*3)%2===0){lx.fillStyle='#5f9ea0';lx.fillRect(Math.round(m.x)-3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x)+3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x),Math.round(m.y)+1,1,1)}
    if(m.mark>0&&Math.floor(time*2)%2===0){lx.fillStyle='#ffb37a';const my=Math.round(m.y-img.h-4);lx.fillRect(Math.round(m.x),my,1,2);lx.fillRect(Math.round(m.x)-1,my+1,3,1)} // Hunter's Mark
    if(m.chill>0&&Math.floor(time*3+m.x)%2===0){lx.fillStyle='#bfe6ff';for(let i=0;i<m.chill;i++)lx.fillRect(Math.round(m.x)-4+i*3,Math.round(m.y)-1,1,1)}
    if(m.dots.length&&rng()<0.25)parts.push({x:m.x+rr(-4,4),y:m.y-rr(4,12),vx:0,vy:-10,t:0,life:0.5,col:'#6aa84f'});
  });
  beams.forEach(b=>line(b.x1,b.y1,b.x2,b.y2,b.col));
  parts.forEach(p=>{lx.fillStyle=p.col;lx.fillRect(Math.round(p.x),Math.round(p.y),1,1)});
  lx.restore();
  // Lighting: a dark overlay with dithered light pools cut out of it. The pools are pre-drawn "stamps",
  // so each frame is just a few image draws instead of reading and rewriting every pixel (the old way stuttered on phones).
  const AT=curArea()&&AREA_TINT[curArea().tint],amb=AT?AT.amb:zoneId==='dun'?0.22:0.38,fl=1+0.04*Math.sin(time*9)+0.02*Math.sin(time*23);
  const zl=curArea()?curArea().lights.concat(mobs.filter(m=>m.def.rare&&!m.dead).map(m=>({x:m.x,y:m.y-6,r:30,w:0,c:34}))):zoneId==='over'?[{x:CAMPFIRE.x,y:CAMPFIRE.y-3,r:70,w:36},{x:DOOR.x,y:DOOR.y-4,r:34,w:0}].concat(TORCHES.map(t=>({x:t.x,y:t.y-2,r:52,w:30}))):(zoneId==='arena'?ARENA:DUN).braziers.map(b=>({x:b.x,y:b.y-4,r:62,w:32}));
  const lights=[{x:pxr,y:pyr-8,r:95,w:18}].concat(zl)
    .map(l=>({x:Math.round(l.x-camX),y:Math.round(l.y-camY),r:Math.round(l.r*(l.c?1:fl)),w:l.w,c:l.c})).filter(l=>l.x>-l.r&&l.x<VW+l.r&&l.y>-l.r&&l.y<VH+l.r);
  if(dark.width!==VW||dark.height!==VH){dark.width=VW;dark.height=VH}
  dg.globalCompositeOperation='source-over';dg.clearRect(0,0,VW,VH);dg.fillStyle='rgba('+(AT?AT.col:'0,0,0')+','+(1-amb)+')';dg.fillRect(0,0,VW,VH);
  dg.globalCompositeOperation='destination-out';
  lights.forEach(l=>dg.drawImage(lightStamp(l.r,amb,'cut'),l.x-l.r-1,l.y-l.r-1));
  dg.globalCompositeOperation='source-over';
  lx.drawImage(dark,0,0);
  lx.globalCompositeOperation='lighter';
  lights.forEach(l=>{if(l.w>0){lx.globalAlpha=l.w/255;lx.drawImage(lightStamp(l.r,amb,'warm'),l.x-l.r-1,l.y-l.r-1)}if(l.c>0){lx.globalAlpha=l.c/255;lx.drawImage(lightStamp(l.r,amb,'cool'),l.x-l.r-1,l.y-l.r-1)}}); // c = cold daylight
  lx.globalAlpha=1;lx.globalCompositeOperation='source-over';
  drawGlows();
  cx.imageSmoothingEnabled=false;
  cx.drawImage(low,0,0,VW*S,VH*S);
  // Crisp text layer
  cx.textAlign='center';cx.textBaseline='middle';
  if(t&&!t.dead){const sx=(t.x-camX)*S,sy=(t.y-(IMG[t.def.img].h)-6-camY)*S;cx.font='600 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';cx.strokeText(cap(t.def.name),sx,sy);cx.fillStyle=con(t.lv);cx.fillText(cap(t.def.name),sx,sy)}
  // Sleeping (mesmerized) mobs: "Zz" and seconds left, so you know when to re-mez.
  mobs.forEach(m=>{if(m.dead||!(m.mez>0))return;const sx=(m.x-camX)*S,sy=(m.y-IMG[m.def.img].h-(m===t?14:4)-camY)*S;cx.font='700 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';const s='Zz '+Math.ceil(m.mez);cx.strokeText(s,sx,sy);cx.fillStyle=m.mez<4?'#ffb37a':'#e0c3ff';cx.fillText(s,sx,sy)});
  // A boss casting its big spell: a purple bar over its head that fills up, so you can see it coming and stun it or step away.
  mobs.forEach(m=>{if(m.dead||!m.casting)return;const w=40*dpr,h=5*dpr,sx=(m.x-camX)*S-w/2,sy=(m.y-IMG[m.def.img].h-(m===t?22:10)-camY)*S;
    cx.fillStyle='#000';cx.fillRect(sx-dpr,sy-dpr,w+2*dpr,h+2*dpr);cx.fillStyle='#2a2033';cx.fillRect(sx,sy,w,h);cx.fillStyle=Math.floor(time*8)%2?'#d8b8ff':'#b48cff';cx.fillRect(sx,sy,w*Math.min(1,m.casting.t/m.casting.dur),h)});
  // Floating text (v0.33, option A): solid for the first two thirds, then fades; numbers ease upward, words hold still.
  floats.forEach(f=>{const F=FLOAT[f.kind]||FLOAT.num,p=Math.min(1,f.t/f.life),a=p<0.65?1:1-(p-0.65)/0.35,rise=F.rise*(1-(1-p)*(1-p)),
    sx=(f.x-camX)*S,sy=(f.y-camY-rise)*S;cx.globalAlpha=Math.max(0,a);
    cx.font='700 '+Math.round(F.px*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=(F.px<10?2.5:3)*dpr;cx.strokeStyle='#000';cx.strokeText(f.txt,sx,sy);cx.fillStyle=f.col;cx.fillText(f.txt,sx,sy);cx.globalAlpha=1});
  if(settings.move==='joy'&&settings.showJoy&&joy.active){
    const r=cv.getBoundingClientRect(),bx=(joy.sx-r.left)*dpr,by=(joy.sy-r.top)*dpr,R=40*dpr,d=Math.hypot(joy.dx,joy.dy)||1,k=Math.min(1,40/d);
    cx.globalAlpha=0.35;cx.fillStyle='#14121a';cx.beginPath();cx.arc(bx,by,R,0,Math.PI*2);cx.fill();cx.strokeStyle='#c9a227';cx.lineWidth=2*dpr;cx.stroke();
    cx.globalAlpha=0.7;cx.fillStyle='#c9a227';cx.beginPath();cx.arc(bx+joy.dx*k*dpr,by+joy.dy*k*dpr,16*dpr,0,Math.PI*2);cx.fill();cx.globalAlpha=1;
  }
  bubbles.forEach(b=>{
    const o=b.o,sx=(o.x-camX)*S,sy=(o.y-22-camY)*S,fs=Math.round(10*dpr),pad=5*dpr,maxW=170*dpr;
    cx.font=fs+'px ui-monospace,Menlo,monospace';
    const words=b.text.split(' '),ls=[];let cur='';words.forEach(w=>{const t2=cur?cur+' '+w:w;if(cx.measureText(t2).width>maxW&&cur){ls.push(cur);cur=w}else cur=t2});if(cur)ls.push(cur);
    const w=Math.max(...ls.map(l=>cx.measureText(l).width))+pad*2,h=ls.length*fs*1.25+pad*2;
    const bx=Math.max(4,Math.min(cv.width-w-4,sx-w/2)),by=Math.max(4,sy-h);
    cx.globalAlpha=b.t>3.5?Math.max(0,(4-b.t)*2):1;
    cx.fillStyle='rgba(20,18,26,0.92)';cx.strokeStyle='#c9a227';cx.lineWidth=1*dpr;cx.beginPath();cx.rect(bx,by,w,h);cx.fill();cx.stroke();
    cx.fillStyle='#e8e2cf';ls.forEach((l,i)=>cx.fillText(l,bx+w/2,by+pad+fs*0.6+i*fs*1.25));cx.globalAlpha=1;
  });
  if(player.dead>0){cx.fillStyle='rgba(60,0,0,0.35)';cx.fillRect(0,0,cv.width,cv.height);}
}

/* ---------- HUD ---------- */
// Buff bar names and colours come from the abilities that give them (plus a few that aren't on every class).
const BUFFS={sprint:{short:'Sprint',col:'#7dbbd0'},laststand:{short:'Last Stand',col:'#ffd27a'}};AB.forEach(a=>{if(a.buff)BUFFS[a.buff]={short:a.short,col:a.col}});
function ui(){
  const L=player.lvl;
  mmReveal();drawMinimap();
  $('plv').textContent='Lv '+L;
  // Your frame (v0.33.1): numbers on the left, percent on the right, same as the target frame.
  const mh=maxHP(L),mm=maxMP(L),hpN=Math.max(0,Math.ceil(player.hp)),mpN=Math.max(0,Math.floor(player.mp));
  $('php').style.width=(100*player.hp/mh)+'%';$('phpn').textContent=hpN+'/'+mh;$('phpp').textContent=Math.max(0,Math.ceil(100*player.hp/mh))+'%';
  if(mm){$('pmp').style.width=(100*player.mp/mm)+'%';$('pmpn').textContent=mpN+'/'+mm;$('pmpp').textContent=Math.max(0,Math.floor(100*player.mp/mm))+'%';}
  // Pet bar: health, except a charmed mob shows how long the charm has left (pink), so you can see it about to break.
  // v0.34: the pet gets a thin row of its own at the bottom of your frame: its name (Earth elemental, Skeleton...), what it's
  // hitting (or "held" after Back off), and a thin bar. Timed pets show seconds left; under 5s the bar turns red.
  $('petrow').style.display=pet?'block':'none';
  if(pet){const pb=$('petbar');let nm=cap(petName()),col='#cfc8b2',w=100*pet.hp/pet.maxhp;
    if(pet.charm){nm='Charmed '+nm+' '+Math.ceil(pet.charmT)+'s';w=100*pet.charmT/pet.charmMax;col=pet.charmT<5?'#ff4d4d':'#ff9de2'}
    else if(pet.life){nm+=' '+Math.ceil(pet.life)+'s';if(pet.life<5)col='#ff4d4d'}
    pb.style.width=Math.max(0,w)+'%';pb.style.background=col;
    const tg=pet.hold?'held':pet.target&&!pet.target.dead?'› '+cap(pet.target.def.name.replace(/^an? /,'')):'';
    if($('petnm').textContent!==nm)$('petnm').textContent=nm;if($('pettg').textContent!==tg)$('pettg').textContent=tg;}
  ['bpetatk','bpetback'].forEach(id=>{const b=$(id);if(b)b.style.display=pet&&!player.dead?'flex':'none'});
  const bb0=$('bpetback');if(bb0)bb0.classList.toggle('held',!!(pet&&pet.hold));
  $('pxp').style.width=(L>=10?100:Math.min(100,100*player.xp/need(L)))+'%'; // capped: a save from before v0.34.1 can hold more XP than the new table needs (it dings on the next kill)
  const t=player.target,tf=$('tframe');
  if(t&&!t.dead){tf.style.visibility='visible';$('tname').textContent=cap(t.def.name);$('tname').style.color=con(t.lv);$('tlv').textContent='Lv '+t.lv;
    const hp=Math.max(0,Math.ceil(t.hp)),pc=Math.max(0,Math.ceil(100*t.hp/t.maxhp));
    $('thp').style.width=(100*t.hp/t.maxhp)+'%';$('thpn').textContent=hp+'/'+t.maxhp;$('thpp').textContent=pc+'%';
    // Debuffs as full-word tags with seconds left (v0.33). Rough until spell icons exist; then each tag becomes an icon with the same timer.
    const fx=[],tag=(txt,col,s)=>fx.push('<span style="background:'+col+'">'+txt+(s>0?' '+Math.ceil(s):'')+'</span>');
    if(t.def.rare)tag('Rare','#ffd75e');if(t.mez>0)tag('Asleep','#e0c3ff',t.mez);if(t.stun>0)tag('Stunned','#ffe08a',t.stun);if(t.fear>0)tag('Afraid','#d9a0ff',t.fear);
    if(t.root>0)tag('Rooted','#8fd17a',t.root);if(t.snare>0)tag('Snared','#a8d8a0',t.snare);
    t.dots.forEach(d=>{const ab=ABI[d.id];tag((d.name||'Rot').split(' ').pop(),ab&&ab.col||(d.id==='bleed'?'#ff8a80':d.id==='burn'?'#ff9a4a':'#9be37a'),d.t)});
    if(t.chill>0)tag('Chilled x'+t.chill,'#bfe6ff');if(t.aslow>0)tag('Slowed','#c8b8a0',t.aslow);if(t.discord>0)tag('Discord','#ffd27a',t.discord<100?t.discord:0);
    if(t.mark>0)tag('Marked','#ffb37a');if(t.def.undead)tag('Undead','#b8b8b8');if(t.def.armor>=0.5)tag('Armored','#b8b8b8');
    const fh=fx.join('');if($('tfx').dataset.h!==fh){$('tfx').dataset.h=fh;$('tfx').innerHTML=fh}}
  else tf.style.visibility='hidden';
  // Boss and named casts at you: big bar in the middle of the screen, whoever you're targeting (never in the target frame).
  {const d=$('deathUI'),on=player.dead>0&&!simState.busy?'block':'none';if(d.style.display!==on)d.style.display=on} // the sim's arena deaths never show it
  const bc=$('bcast'),cm=mobs.find(m=>!m.dead&&m.casting&&(m.def.boss||m.def.named));
  if(cm){bc.style.display='block';$('bcastname').textContent=cap(cm.def.name)+': '+cm.casting.name;$('bcastfill').style.width=Math.min(100,100*cm.casting.t/cm.casting.dur)+'%'}else bc.style.display='none';
  // Log, Menu, the minimap and DEV sit under the top frames and move down when the frames grow (debuff tags, buffs wrapping).
  {const hb=$('hud').getBoundingClientRect(),vt=$('view').getBoundingClientRect().top,base=$('hud').offsetTop+52,dy=Math.max(0,Math.round(hb.bottom-vt-base));
    [['topbtns',62],['mm',94],['logpanel',94],['devbtn',188]].forEach(([id,top])=>{const el=$(id);if(el&&el.dataset.dy!==String(dy)){el.dataset.dy=dy;el.style.top='calc('+(top+dy)+'px + env(safe-area-inset-top))'}})}

  const cb=$('castbar');
  if(player.cast){cb.style.display='block';$('castname').textContent=player.cast.a.name;$('castfill').style.width=(100*player.cast.time/player.cast.a.cast)+'%'}else cb.style.display='none';
  const cdPct=100*player.gcd/GCD;
  ctrlEls.forEach(el=>{
    const s=el.dataset.slot==='c'?0:+el.dataset.slot,a=ABI[loadout[s]];
    if(!a)return;
    el.classList.toggle('lock',L<a.lvl);el.classList.toggle('nomana',L>=a.lvl&&player.mp<a.mana);
    const own=player.cds[a.id]||0,full=cdFor(a)||1,pct=L<a.lvl?0:Math.max(cdPct,100*own/full);
    const cd=el.querySelector('.cd');if(cd)cd.style.height=pct+'%';
    const ct=el.querySelector('.cdt');if(ct)ct.textContent=own>0.05?Math.ceil(own):'';
    el.classList.toggle('queued',!!(player.queued&&player.queued.a===a));
  });
  // Queued spell: a gold "Next" chip under the cast bar (your thumb covers the button itself).
  const qc=$('qchip');if(qc){const q=player.queued&&player.queued.a;const h=q?'<i style="background:'+q.col+'"></i>Next: '+q.name:'';if(qc.dataset.h!==h){qc.dataset.h=h;qc.innerHTML=h;qc.style.display=q?'flex':'none'}}
  // Buff bar: one small tag per buff and song on you (seconds left on short ones).
  const bb=$('buffbar');if(bb){const tags=[];
    for(const k in player.buffs){const v=player.buffs[k];if(!(v>0)||k==='hide')continue;const d=BUFFS[k]||{short:k,col:'#cfc8b2'};tags.push('<span style="background:'+d.col+'">'+d.short+(v<100?' '+Math.ceil(v):'')+'</span>')}
    if(C.holdLine){const n=Math.min(C.holdMax||4,fightingMe().length);if(n)tags.push('<span style="background:#8a9bb5">Hold -'+Math.round(C.holdLine*n*100)+'%</span>')} // Warrior: shows how much Hold the Line is saving you
    (player.songs||[]).forEach(id=>{const a=ABI[id];if(a)tags.push('<span style="background:'+a.col+'">♪ '+a.short+'</span>')});
    const h=tags.join('');if(bb.dataset.h!==h){bb.dataset.h=h;bb.innerHTML=h}
    // Keep the 1st hit / Auto toggles just under the portrait, which grows when buffs wrap to a new line.
    const tg=$('toggles');if(tg){const top=Math.round($('pframe').getBoundingClientRect().bottom-tg.parentNode.getBoundingClientRect().top+4);if(tg.dataset.top!==String(top)){tg.dataset.top=top;tg.style.top=top+'px'}}}
  // Songs that are playing light up their buttons.
  ctrlEls.forEach(el=>{const s=el.dataset.slot==='c'?0:+el.dataset.slot,a=ABI[loadout[s]];el.classList.toggle('playing',!!(a&&a.kind==='song'&&songOn(a.id)))});
  const sb=$('bsit');if(sb){sb.classList.toggle('sitting',player.sit);sb.textContent=player.sit?'Stand':'Sit'}
}

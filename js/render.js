// Drawing: sprites to pictures, camera and zoom, lighting, the world, and the HUD bars.
'use strict';
function mk(rows,pal,scale){
  scale=scale||1;const h=rows.length,w=rows[0].length;
  const c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;const g=c.getContext('2d');
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];if(ch!=='.'&&pal[ch]){g.fillStyle=pal[ch];g.fillRect(i*scale,j*scale,scale,scale)}}
  const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const fg=f.getContext('2d');fg.translate(c.width,0);fg.scale(-1,1);fg.drawImage(c,0,0);
  return{c:c,f:f,w:c.width,h:c.height};
}
const IMG={druid:mk(SPR.druid,PAL),dead:mk(SPR.dead,PAL),rat:mk(SPR.rat,PAL),beetle:mk(SPR.beetle,PAL),
  guard:mk(SPR.guard,PAL),warrior:mk(SPR.warrior,PAL),rogue:mk(SPR.rogue,PAL),
  necro:mk(SPR.necro,Object.assign({},PAL,{p:'#2e2338',P:'#1d1626',x:'#b8b4c4'})),
  pet:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#2a4a28',e:'#7dffa6'})),peddler:mk(SPR.peddler,PAL),crow:mk(SPR.crow,PAL),crowfly:mk(SPR.crowfly,PAL),frog:mk(SPR.frog,PAL),
  gnaw:mk(SPR.rat,Object.assign({},PAL,{a:'#4a3536',A:'#7a5555'}),2),
  crat:mk(SPR.rat,Object.assign({},PAL,{a:'#8a8494',A:'#b5b0bc'})),
  skel:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#3a3442'})),
  boss1:mk(SPR.dead,Object.assign({},PAL,{z:'#b9b3a0',Z:'#7a7468',r:'#3d2a63',e:'#b48cff'}),3)}; // bosses draw at 3x so they loom (placeholder until the art pass)

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
// A light pool, pre-dithered into 6 brightness steps. 'cut' removes darkness, 'warm' adds firelight color.
function lightStamp(r,amb,kind){
  const key=r+'|'+amb+'|'+kind;if(stampCache[key])return stampCache[key];
  const size=r*2+2,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),id=g.createImageData(size,size),d=id.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const v=Math.max(0,1-Math.hypot(x-r-1,(y-r-1)*1.15)/r);if(v<=0)continue;
    let a=kind==='cut'?Math.min(1,v*v*0.9/(1-amb)):v*v;
    a=Math.min(1,Math.floor(a*6+bay[(y&3)*4+(x&3)]/16)/6);
    const o=(y*size+x)*4;if(kind==='warm'){d[o]=255;d[o+1]=150;d[o+2]=60}d[o+3]=a*255;
  }
  g.putImageData(id,0,0);stampCache[key]=c;return c;
}
function shadow(x,y,r){lx.fillStyle='rgba(0,0,0,0.5)';lx.fillRect(x-r,y-1,r*2,2);lx.fillRect(x-r+1,y+1,r*2-2,1)}
function drawSprite(img,x,y,dir,bob,sit){
  const im=dir<0?img.f:img.c,w=img.w,h=img.h;const dx=Math.round(x-w/2),dy=Math.round(y-h)+(bob||0);
  if(sit){lx.drawImage(im,0,0,w,h-4,dx,dy+4,w,h-4)}else lx.drawImage(im,dx,dy);
}
function line(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;lx.fillStyle=col;
  for(let i=0;i<400;i++){lx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}}
let time=0;
function render(){
  const pxr=Math.round(player.x),pyr=Math.round(player.y);
  // The camera may scroll a little past the map's top edge so the top bars never cover you.
  const topPad=Math.round(66*dpr/S);
  camX=Math.max(0,Math.min(WW-VW,pxr-Math.round(VW/2)));camY=Math.max(-topPad,Math.min(WH-VH,pyr-Math.round(VH/2)-10));
  if(WW<VW)camX=Math.round((WW-VW)/2);if(WH<VH)camY=Math.round((WH-VH)/2);
  lx.fillStyle='#050507';lx.fillRect(0,0,VW,VH);
  lx.save();lx.translate(-camX,-camY);
  lx.drawImage(world,0,0);
  if(zoneId==='over'){drawCamp();drawCritters();}
  if(zoneId==='dun'&&run.portal){const p=run.portal;lx.fillStyle='#7dffa6';for(let a=0;a<24;a++){if((a+Math.floor(time*8))%3===0)continue;const an=a/24*Math.PI*2;lx.fillRect(Math.round(p.x+Math.cos(an)*7),Math.round(p.y+Math.sin(an)*4),1,1)}lx.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,2,2)}
  if(zoneId==='dun'&&run.chest){const c=run.chest,x=Math.round(c.x),y=Math.round(c.y);lx.fillStyle='#0b0a0f';lx.fillRect(x-6,y-8,12,9);lx.fillStyle=c.open?'#3b2a1d':'#6e4a2a';lx.fillRect(x-5,y-7,10,7);lx.fillStyle='#c9a227';lx.fillRect(x-5,y-5,10,1);lx.fillRect(x-1,y-6,2,3);}
  if(player.tx!==null){lx.fillStyle='#c9a227';const x=Math.round(player.tx),y=Math.round(player.ty);lx.fillRect(x-2,y,1,1);lx.fillRect(x+2,y,1,1);lx.fillRect(x,y-1,1,1);lx.fillRect(x,y+1,1,1)}
  if(rangeShow>0){lx.fillStyle='#ff8a80';for(let a=0;a<64;a+=2){const an=a/64*Math.PI*2;lx.fillRect(Math.round(player.x+Math.cos(an)*rangeR),Math.round(player.y+Math.sin(an)*rangeR*0.8),1,1)}}
  const t=player.target;
  if(t&&!t.dead){for(let a=0;a<24;a++){if((a+Math.floor(time*6))%3===0)continue;const an=a/24*Math.PI*2;lx.fillStyle='#ffcc33';lx.fillRect(Math.round(t.x+Math.cos(an)*8),Math.round(t.y+Math.sin(an)*2.6),1,1)}}
  const ents=mobs.concat(zoneId==='over'?npcs:[],pet?[pet]:[],[player]).sort((a,b)=>a.y-b.y);
  ents.forEach(e=>{
    if(e===player){
      if(player.dead>0)return;
      shadow(player.x,player.y,5);
      const moving=player.tx!==null||joy.active||(settings.move==='hold'&&joy.id!==null)||keys.w||keys.a||keys.s||keys.d,bob=moving?(Math.floor(player.walk*8)%2):0;
      if(hidden())lx.globalAlpha=0.4; // hidden Rogue draws see-through
      drawSprite(IMG[C.sprite],player.x,player.y+1,player.dir,bob,player.sit||player.fd>0);
      lx.globalAlpha=1;
      if(player.buffs.stance>0&&Math.floor(time*4)%2===0){lx.fillStyle='#c9a227';lx.fillRect(Math.round(player.x)-7,Math.round(player.y)-12,1,1);lx.fillRect(Math.round(player.x)+7,Math.round(player.y)-12,1,1)}
      if(player.buffs.bark>0&&Math.floor(time*4)%4===0){lx.fillStyle='#a07850';lx.fillRect(Math.round(player.x)-6,Math.round(player.y)-10,1,1);lx.fillRect(Math.round(player.x)+6,Math.round(player.y)-6,1,1)}
      if(player.cast){lx.fillStyle=player.cast.a.col;const k=Math.floor(time*10)%4;lx.fillRect(Math.round(player.x)+5,Math.round(player.y)-15-k,1,1);lx.fillRect(Math.round(player.x)-5,Math.round(player.y)-13+k,1,1)}
      return;
    }
    if(e===pet){shadow(e.x,e.y,4);drawSprite(IMG.pet,e.x,e.y+1,e.dir,Math.floor(e.walk*6)%2,false);return}
    if(e.kind){shadow(e.x,e.y,5);const mv=e.target||Math.hypot(e.x-e.hx,e.y-e.hy)>2;drawSprite(IMG[e.kind],e.x,e.y+1,e.dir,mv?(Math.floor(e.walk*6)%2):0,false);return}
    const m=e;if(m.dead)return;
    const img=IMG[m.def.img];
    shadow(m.x,m.y,Math.max(4,Math.round(img.w/2.4)));
    const bob=(m.state!=='idle'||Math.hypot(m.x-m.wx,m.y-m.wy)>1)?(Math.floor(m.walk*6)%2):0;
    drawSprite(img,m.x,m.y+1,m.dir,m.root>0?0:bob,false);
    if(m.root>0){lx.fillStyle='#5e3e24';for(let i=-5;i<=5;i+=2)lx.fillRect(Math.round(m.x)+i,Math.round(m.y)-((i+Math.floor(time*3))%3===0?2:1),1,2);lx.fillStyle='#3f6b3a';lx.fillRect(Math.round(m.x)-4,Math.round(m.y)-3,1,1);lx.fillRect(Math.round(m.x)+4,Math.round(m.y)-2,1,1)}
    if(m.snare>0&&Math.floor(time*3)%2===0){lx.fillStyle='#5f9ea0';lx.fillRect(Math.round(m.x)-3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x)+3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x),Math.round(m.y)+1,1,1)}
    if(m.dots.length&&rng()<0.25)parts.push({x:m.x+rr(-4,4),y:m.y-rr(4,12),vx:0,vy:-10,t:0,life:0.5,col:'#6aa84f'});
  });
  beams.forEach(b=>line(b.x1,b.y1,b.x2,b.y2,b.col));
  parts.forEach(p=>{lx.fillStyle=p.col;lx.fillRect(Math.round(p.x),Math.round(p.y),1,1)});
  lx.restore();
  // Lighting: a dark overlay with dithered light pools cut out of it. The pools are pre-drawn "stamps",
  // so each frame is just a few image draws instead of reading and rewriting every pixel (the old way stuttered on phones).
  const amb=zoneId==='dun'?0.22:0.38,fl=1+0.04*Math.sin(time*9)+0.02*Math.sin(time*23);
  const zl=zoneId==='over'?[{x:CAMPFIRE.x,y:CAMPFIRE.y-3,r:70,w:36},{x:DOOR.x,y:DOOR.y-4,r:34,w:0}].concat(TORCHES.map(t=>({x:t.x,y:t.y-2,r:52,w:30}))):DUN.braziers.map(b=>({x:b.x,y:b.y-4,r:62,w:32}));
  const lights=[{x:pxr,y:pyr-8,r:95,w:18}].concat(zl)
    .map(l=>({x:Math.round(l.x-camX),y:Math.round(l.y-camY),r:Math.round(l.r*fl),w:l.w})).filter(l=>l.x>-l.r&&l.x<VW+l.r&&l.y>-l.r&&l.y<VH+l.r);
  if(dark.width!==VW||dark.height!==VH){dark.width=VW;dark.height=VH}
  dg.globalCompositeOperation='source-over';dg.clearRect(0,0,VW,VH);dg.fillStyle='rgba(0,0,0,'+(1-amb)+')';dg.fillRect(0,0,VW,VH);
  dg.globalCompositeOperation='destination-out';
  lights.forEach(l=>dg.drawImage(lightStamp(l.r,amb,'cut'),l.x-l.r-1,l.y-l.r-1));
  dg.globalCompositeOperation='source-over';
  lx.drawImage(dark,0,0);
  lx.globalCompositeOperation='lighter';
  lights.forEach(l=>{if(l.w>0){lx.globalAlpha=l.w/255;lx.drawImage(lightStamp(l.r,amb,'warm'),l.x-l.r-1,l.y-l.r-1)}});
  lx.globalAlpha=1;lx.globalCompositeOperation='source-over';
  drawGlows();
  cx.imageSmoothingEnabled=false;
  cx.drawImage(low,0,0,VW*S,VH*S);
  // Crisp text layer
  cx.textAlign='center';cx.textBaseline='middle';
  if(t&&!t.dead){const sx=(t.x-camX)*S,sy=(t.y-(IMG[t.def.img].h)-6-camY)*S;cx.font='600 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';cx.strokeText(cap(t.def.name),sx,sy);cx.fillStyle=con(t.lv);cx.fillText(cap(t.def.name),sx,sy)}
  floats.forEach(f=>{const a=1-f.t/1.1,sx=(f.x-camX)*S,sy=(f.y-camY-f.t*18)*S;cx.globalAlpha=Math.max(0,a);
    cx.font='700 '+Math.round((f.big?15:12)*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';cx.strokeText(f.txt,sx,sy);cx.fillStyle=f.col;cx.fillText(f.txt,sx,sy);cx.globalAlpha=1});
  if(settings.move==='drag'&&settings.showJoy&&joy.active){
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
  if(player.dead>0){cx.fillStyle='rgba(60,0,0,0.35)';cx.fillRect(0,0,cv.width,cv.height);cx.font='700 '+Math.round(16*dpr)+'px ui-monospace,Menlo,monospace';cx.fillStyle='#ff6b6b';cx.fillText('You have died',cv.width/2,cv.height/2)}
}

/* ---------- HUD ---------- */
function ui(){
  const L=player.lvl;
  $('plv').textContent='Lv '+L;
  $('php').style.width=(100*player.hp/maxHP(L))+'%';
  $('pmp').style.width=(100*player.mp/maxMP(L))+'%';
  $('petrow').style.display=pet?'block':'none';if(pet)$('petbar').style.width=(100*pet.hp/pet.maxhp)+'%';
  $('pxp').style.width=(L>=10?100:100*player.xp/need(L))+'%';
  const t=player.target,tf=$('tframe');
  if(t&&!t.dead){tf.style.visibility='visible';$('tname').textContent=cap(t.def.name);$('tname').style.color=con(t.lv);$('tlv').textContent='Lv '+t.lv;
    $('thp').style.width=(100*t.hp/t.maxhp)+'%';
    const fx=[];if(t.root>0)fx.push('Rooted '+Math.ceil(t.root)+'s');if(t.snare>0)fx.push('Snared '+Math.ceil(t.snare)+'s');t.dots.forEach(d=>fx.push('Rot '+Math.ceil(d.t)+'s'));if(t.def.armor>=0.5)fx.push('Armored');
    $('tfx').textContent=fx.join(' · ');}
  else tf.style.visibility='hidden';
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
  });
  const sb=$('bsit');if(sb){sb.classList.toggle('active',player.sit);sb.textContent=player.sit?'Stand':'Sit'}
}

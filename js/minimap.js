// Minimap (top right) and the full map screen. Both fill in as you explore; only places you've found get a pin (no quest arrows).
'use strict';
/* ---------- What you've explored ----------
   One bit per tile per area, saved per character as hex text (a 48 x 44 area is about 530 characters).
   New key, no change to any old save shape, so no save version bump: a missing key just means "nothing explored yet". */
const MM_ZONES={over:1,gy:1,dun:1}; // the arena (testing grounds) never shows a map
const MM_SEE={over:7,gy:7,dun:5};    // how many tiles around you get revealed (less underground)
const MM_TILE=3;                     // minimap: CSS pixels per tile (shows about 29 tiles across)
const mmSaved=store.get(KEY('explored'),{});
const MM={z:{},dirty:false,saveT:0};

// Places worth a pin, per area, in tile coordinates. k = kind: exit (a way out of the area, also pointed at
// from the minimap edge), dun (a dungeon door), camp (somewhere safe), boss.
function mmPins(id){
  if(id==='over')return[
    {x:0,y:15,name:'Town 1 gate',k:'exit'},
    {x:Math.floor(CAMPFIRE.x/T),y:Math.floor(CAMPFIRE.y/T),name:'Camp and guards',k:'camp'},
    {x:Math.floor(SIGN.x/T),y:Math.floor(SIGN.y/T),name:'Signpost',k:'camp'},
    {x:Math.floor(DOOR.x/T),y:Math.floor(DOOR.y/T),name:'Dungeon 1',k:'dun'}];
  if(id==='dun')return[{x:3,y:30,name:'Way out',k:'exit'},{x:6,y:4,name:'Boss 1',k:'boss'}];
  if(id==='gy'){const N={crossroads:'Gate Road',wolfwood:'Wolfwood (not built yet)',crypt:'Crypt (not built yet)'};
    return AREAS.graveyard.exits.map(e=>({x:e.tx,y:e.ty,name:N[e.to]||e.to,k:e.to==='crypt'?'dun':'exit'}))}
  return[];
}
const MM_PIN_COL={exit:'#7dffa6',dun:'#c8a0ff',camp:'#ffd27a',boss:'#ff6b6b'};

// Build an area's map picture once: one pixel per tile, coloured from the painted ground underneath
// (so the map looks like the place), brightened because the world is drawn dark and lit later.
function mmZone(id){
  if(MM.z[id])return MM.z[id];
  let src;
  if(id==='over')src={w:40,h:30,world:overWorld,map:overMap,name:'Gate Road'};
  else if(id==='dun')src={w:DUN.w,h:DUN.h,world:DUN.world,map:DUN.map,name:'Dungeon 1'};
  else if(id==='gy'){const A=buildArea('graveyard');src={w:A.w,h:A.h,world:A.world,map:A.map,name:A.name}}
  else return null;
  const w=src.w,h=src.h,pix=src.world.getContext('2d').getImageData(0,0,w*T,h*T).data,col=[];
  for(let ty=0;ty<h;ty++)for(let tx=0;tx<w;tx++){
    let r=0,g=0,b=0,n=0;
    for(let y=ty*T;y<ty*T+T;y+=2)for(let x=tx*T;x<tx*T+T;x+=2){const o=(y*w*T+x)*4;r+=pix[o];g+=pix[o+1];b+=pix[o+2];n++}
    r/=n;g/=n;b/=n;
    const t=src.map[ty][tx];let k=1.9;
    if(t===3)k=1.1;                                          // trees and scenery: darker so paths stand out
    if(t===7){r=g=b=12;k=1}                                  // solid rock underground: near black, so the rooms stand out
    if(t===5){r=r*0.4+80;g=g*0.4+76;b=b*0.4+88;k=1.3}        // buildings and walls: pale stone
    if(t===2){b+=20;k=1.7}                                   // water
    if(t===10||t===8){r=150;g=110;b=200;k=1}                 // doors and exit circles
    col.push('rgb('+Math.min(255,r*k|0)+','+Math.min(255,g*k|0)+','+Math.min(255,b*k|0)+')');
  }
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const Z={id:id,name:src.name,w:w,h:h,col:col,c:c,g:c.getContext('2d'),seen:new Uint8Array(w*h),count:0,pins:mmPins(id)};
  // Load the saved bits.
  const hex=mmSaved[id]||'';
  for(let i=0;i<hex.length;i++){const v=parseInt(hex[i],16)||0;for(let j=0;j<4;j++)if(v&(8>>j)){const k=i*4+j;if(k<w*h)mmMark(Z,k)}}
  Z.pins.forEach(p=>p.found=!!Z.seen[p.y*w+p.x]);
  MM.z[id]=Z;return Z;
}
function mmMark(Z,k){if(Z.seen[k])return false;Z.seen[k]=1;Z.count++;Z.g.fillStyle=Z.col[k];Z.g.fillRect(k%Z.w,(k/Z.w)|0,1,1);return true}
function mmSave(){
  const out={};for(const id in mmSaved)out[id]=mmSaved[id];
  for(const id in MM.z){const Z=MM.z[id];let s='';for(let i=0;i<Z.w*Z.h;i+=4){let v=0;for(let j=0;j<4;j++)if(Z.seen[i+j])v|=8>>j;s+=v.toString(16)}out[id]=s.replace(/0+$/,'')}
  store.set(KEY('explored'),out);MM.dirty=false;
}

/* ---------- Revealing (called with the HUD, 10 times a second) ---------- */
function mmReveal(){
  if(!MM_ZONES[zoneId]||simState.busy)return;
  const Z=mmZone(zoneId),R=MM_SEE[zoneId],px=Math.floor(player.x/T),py=Math.floor(player.y/T);
  for(let y=py-R;y<=py+R;y++)for(let x=px-R;x<=px+R;x++){
    if(x<0||y<0||x>=Z.w||y>=Z.h||(x-px)*(x-px)+(y-py)*(y-py)>R*R+R)continue;
    if(mmMark(Z,y*Z.w+x))MM.dirty=true;
  }
  Z.pins.forEach(p=>{if(!p.found&&Z.seen[p.y*Z.w+p.x]){p.found=true;log('Added to your map: '+p.name+'.','#9fd8c0')}});
  MM.saveT+=0.1;if(MM.dirty&&MM.saveT>3){MM.saveT=0;mmSave()} // save at most every few seconds
}

/* ---------- Drawing the minimap ---------- */
const mmEl=$('mm'),mmg=mmEl.getContext('2d');
function drawMinimap(){
  const show=settings.minimap&&MM_ZONES[zoneId];
  mmEl.style.display=show?'block':'none';if(!show)return;
  const Z=mmZone(zoneId),dpr=Math.min(2,window.devicePixelRatio||1),W=mmEl.clientWidth||86,H=mmEl.clientHeight||86;
  if(mmEl.width!==Math.round(W*dpr)){mmEl.width=Math.round(W*dpr);mmEl.height=Math.round(H*dpr)}
  const s=MM_TILE*dpr,cxp=mmEl.width/2,cyp=mmEl.height/2,ptx=player.x/T,pty=player.y/T;
  mmg.imageSmoothingEnabled=false;mmg.fillStyle='#07060a';mmg.fillRect(0,0,mmEl.width,mmEl.height);
  mmg.drawImage(Z.c,Math.round(cxp-ptx*s),Math.round(cyp-pty*s),Z.w*s,Z.h*s);
  // Pins for places you've found. Exits off the edge get a small arrow on the rim, so you know which way to head.
  const pad=4*dpr;
  Z.pins.forEach(p=>{if(!p.found)return;
    const x=cxp+(p.x+0.5-ptx)*s,y=cyp+(p.y+0.5-pty)*s,col=MM_PIN_COL[p.k];
    if(x>pad&&y>pad&&x<mmEl.width-pad&&y<mmEl.height-pad){mmg.fillStyle='#000';mmg.fillRect(x-2.5*dpr,y-2.5*dpr,5*dpr,5*dpr);mmg.fillStyle=col;mmg.fillRect(x-1.5*dpr,y-1.5*dpr,3*dpr,3*dpr);return}
    if(p.k!=='exit'&&p.k!=='dun')return;
    const a=Math.atan2(y-cyp,x-cxp),r=Math.min((cxp-pad)/Math.abs(Math.cos(a)||1e-6),(cyp-pad)/Math.abs(Math.sin(a)||1e-6));
    mmArrow(cxp+Math.cos(a)*r,cyp+Math.sin(a)*r,a,3.5*dpr,col);
  });
  // You: a gold dot with a dark ring.
  mmg.fillStyle='#000';mmg.beginPath();mmg.arc(cxp,cyp,3*dpr,0,Math.PI*2);mmg.fill();
  mmg.fillStyle='#ffd27a';mmg.beginPath();mmg.arc(cxp,cyp,2*dpr,0,Math.PI*2);mmg.fill();
}
function mmArrow(x,y,a,r,col){
  mmg.save();mmg.translate(x,y);mmg.rotate(a);mmg.fillStyle='#000';mmg.beginPath();mmg.moveTo(r+1,0);mmg.lineTo(-r-1,-r-1);mmg.lineTo(-r-1,r+1);mmg.fill();
  mmg.fillStyle=col;mmg.beginPath();mmg.moveTo(r,0);mmg.lineTo(-r,-r);mmg.lineTo(-r,r);mmg.fill();mmg.restore();
}

/* ---------- Full map screen (tap the minimap) ---------- */
function renderMapScreen(){
  const Z=mmZone(zoneId);if(!Z)return;
  $('mapname').textContent=Z.name;
  const cv2=$('mapcv'),box=cv2.parentNode,dpr=Math.min(2,window.devicePixelRatio||1);
  const cssW=Math.min(box.clientWidth||300,360),s=Math.max(2,Math.floor(cssW/Z.w)),cw=Z.w*s,ch=Z.h*s;
  cv2.style.width=cw+'px';cv2.style.height=ch+'px';cv2.width=cw*dpr;cv2.height=ch*dpr;
  const g=cv2.getContext('2d'),S=s*dpr;g.imageSmoothingEnabled=false;
  g.fillStyle='#07060a';g.fillRect(0,0,cv2.width,cv2.height);g.drawImage(Z.c,0,0,Z.w*S,Z.h*S);
  Z.pins.forEach((p,i)=>{if(!p.found)return;const x=(p.x+0.5)*S,y=(p.y+0.5)*S;
    g.fillStyle='#000';g.fillRect(x-4*dpr,y-4*dpr,8*dpr,8*dpr);g.fillStyle=MM_PIN_COL[p.k];g.fillRect(x-3*dpr,y-3*dpr,6*dpr,6*dpr)});
  const x=player.x/T*S,y=player.y/T*S;
  g.fillStyle='#000';g.beginPath();g.arc(x,y,4.5*dpr,0,Math.PI*2);g.fill();g.fillStyle='#ffd27a';g.beginPath();g.arc(x,y,3*dpr,0,Math.PI*2);g.fill();
  const found=Z.pins.filter(p=>p.found);
  $('maplegend').innerHTML='<div style="color:#9aa;margin-bottom:4px">Explored '+Math.round(100*Z.count/(Z.w*Z.h))+'%</div>'+
    '<div><span class="mpin" style="background:#ffd27a;border-radius:50%"></span>You</div>'+
    (found.length?found.map(p=>'<div><span class="mpin" style="background:'+MM_PIN_COL[p.k]+'"></span>'+p.name+'</div>').join(''):'<div style="color:#9aa">No places found yet. Walk around to fill in the map.</div>');
}
mmEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;openModal('mapUI');renderMapScreen()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MM.dirty)mmSave()}); // save the map when the app goes to the background

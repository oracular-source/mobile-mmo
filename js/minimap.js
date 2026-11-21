// Minimap (top right) and the full map screen. Both fill in as you explore; only places you've found get a pin (no quest arrows).
'use strict';
/* ---------- What you've explored ----------
   One bit per tile per area, saved per character as hex text (a 48 x 44 area is about 530 characters).
   New key, no change to any old save shape, so no save version bump: a missing key just means "nothing explored yet". */
// Every area built from a map file gets a map automatically (v0.41.2: Wolfwood was left off a hand-kept list and had none).
// The arena (testing grounds) never shows a map.
const MM_ZONES={over:1,dun:1};for(const id in AREA_OF)MM_ZONES[id]=1;
const MM_UNDER={dun:1,crypt:1,tunnel:1};
const MM_SEE={};for(const id in MM_ZONES)MM_SEE[id]=MM_UNDER[id]?5:7; // how many tiles around you get revealed (less underground)
const MM_TILE=2;
const MM_MS=4,MM_FOG='#0b0b0e'; // explored mask: pixels a tile; colour of unexplored ground                     // minimap: CSS pixels per tile (shows about 43 tiles across; was 3)
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
  // Areas from map files: every exit gets a pin (named by the exit, or by where it leads), plus the campfire and each named's spot.
  if(AREA_OF[id]){const A=buildArea(AREA_OF[id]);
    const EX={stairs_up:'Stairs up',back_tunnel:'Back tunnel (Wolfwood)',crypt_tunnel:'Crypt tunnel',sinkhole:'Sinkhole (rat tunnel)',burrow:'Back hole (rat tunnel)',mouth:'Climb out (crossroads)',back_hole:'Back hole (crossroads)'};
    const TO={crossroads:'Crossroads',graveyard:'Sunken Graveyard',crypt:'Crypt',rat_tunnel:'Rat tunnel',wolfwood:'Wolfwood',wolfwood_edge:'Wolfwood',chapel:'Ruined Chapel',dungeon1:'Chapel door (Dungeon 1)',town1:'Town 1 (not built yet)'};
    const NAMED={skeleton_king:'Skeleton King',old_gnawbone:'Old Gnawbone',greyfang:"Greyfang's den"};
    return A.exits.map(e=>({x:e.tx,y:e.ty,name:e.name==='east_path'?(e.to==='chapel'?'East path (Ruined Chapel)':'East path (crossroads)'):EX[e.name]||TO[e.to]||e.to,k:(e.to==='crypt'||e.to==='rat_tunnel'||e.to==='dungeon1')?'dun':'exit'}))
      .concat(A.objs.filter(o=>o.kind==='shrine').map(o=>({x:o.x,y:o.y,name:'Wayside shrine (rest)',k:'camp'})))
      .concat(A.objs.filter(o=>o.kind==='campfire').map(o=>({x:o.x,y:o.y,name:'Campfire',k:'camp'})))
      .concat(A.named.map(n=>({x:n.x,y:n.y-2,name:NAMED[n.name]||n.name,k:'boss'})))
      .concat(A.chests.map(c=>({x:c.tx,y:c.ty,name:'Hidden chest',k:'camp'})))}
  return[];
}
const MM_PIN_COL={exit:'#7dffa6',dun:'#c8a0ff',camp:'#ffd27a',boss:'#ff6b6b'};

// Build an area's map picture once: one pixel per tile, one flat colour per kind of ground (v0.48, UI 14 option A).
// Each area's grass, road and floor colours come from its own painted ground (averaged over the whole area), so
// Wolfwood's dusk and the crossroads still look different, but every road is one clean colour that stands out.
function mmZone(id){
  if(MM.z[id])return MM.z[id];
  let src;
  if(id==='over')src={w:40,h:30,world:overWorld,map:overMap,name:'Gate Road'};
  else if(id==='dun')src={w:DUN.w,h:DUN.h,world:DUN.world,map:DUN.map,name:'Dungeon 1'};
  else if(AREA_OF[id]){const A=buildArea(AREA_OF[id]);src={w:A.w,h:A.h,world:A.world,map:A.map,name:A.name,rows:A.rows}}
  else return null;
  const w=src.w,h=src.h,pix=src.world.getContext('2d').getImageData(0,0,w*T,h*T).data,under=!!MM_UNDER[id];
  // Map-file areas say which tiles are road (the 'path' tag in tiles.js); the old Gate Road falls back to colour.
  const isPath=(tx,ty,r,g)=>src.rows?((AREA_TILES[src.rows[ty][tx]]||{tags:[]}).tags.indexOf('path')>=0):(r>g*1.04&&r>40);
  // 1) Sort every tile into a kind, using the painted colour to tell road from grass.
  const kind=[],sum={grass:[0,0,0,0],path:[0,0,0,0]};
  for(let ty=0;ty<h;ty++)for(let tx=0;tx<w;tx++){
    let r=0,g=0,b=0,n=0;
    for(let y=ty*T;y<ty*T+T;y+=2)for(let x=tx*T;x<tx*T+T;x+=2){const o=(y*w*T+x)*4;r+=pix[o];g+=pix[o+1];b+=pix[o+2];n++}
    r/=n;g/=n;b/=n;
    const t=src.map[ty][tx];let k;
    if(t===3)k='tree';else if(t===2)k='water';else if(t===7)k='rock';else if(t===5)k='wall';else if(t===10||t===8)k='door';
    else k=(!under&&isPath(tx,ty,r,g))?'path':'grass';   // underground floors are all 'grass' (one floor colour)
    kind.push(k);if(sum[k]){sum[k][0]+=r;sum[k][1]+=g;sum[k][2]+=b;sum[k][3]++}
  }
  // 2) One colour per kind. Brightened, because the world is drawn dark and lit later.
  const avg=(k,f,d)=>{const q=sum[k];if(!q[3])return d;return q.slice(0,3).map(v=>Math.min(255,v/q[3]*f|0))};
  const grass=avg('grass',under?2.0:1.7,[58,82,52]);
  const C={grass:grass,path:avg('path',1.9,[176,146,104]),tree:grass.map(v=>v*0.5|0),water:[52,86,140],
    rock:[12,12,14],wall:[120,118,128],door:[150,110,200]};
  const col=kind.map(k=>'rgb('+C[k].join(',')+')'),hex=k=>'rgb('+C[k].join(',')+')';
  // v0.61 (UI 20): the map is drawn, not tiled. Explored tiles go into a small mask (MM_MS pixels a tile); the
  // drawn ground is cut by it when something new is revealed, so the minimap only blits one picture a frame.
  const m=document.createElement('canvas');m.width=w*MM_MS;m.height=h*MM_MS;
  const Z={id:id,name:src.name,w:w,h:h,col:col,kind:kind,
    pal:{grass:hex('grass'),tree:hex('tree'),water:hex('water'),path:hex('path'),wall:hex('wall'),rock:hex('rock'),door:hex('door')},
    m:m,mg:m.getContext('2d'),ground:{},comp:null,compDirty:true,seen:new Uint8Array(w*h),count:0,pins:mmPins(id)};
  // Load the saved bits.
  const hx=mmSaved[id]||'';
  for(let i=0;i<hx.length;i++){const v=parseInt(hx[i],16)||0;for(let j=0;j<4;j++)if(v&(8>>j)){const k=i*4+j;if(k<w*h)mmMark(Z,k)}}
  Z.pins.forEach(p=>p.found=!!Z.seen[p.y*w+p.x]);
  MM.z[id]=Z;return Z;
}
function mmMark(Z,k){if(Z.seen[k])return false;Z.seen[k]=1;Z.count++;
  const g=Z.mg,r=MM_MS*0.95;g.fillStyle='#fff';g.beginPath();g.arc((k%Z.w+.5)*MM_MS,(((k/Z.w)|0)+.5)*MM_MS,r,0,7);g.fill();
  Z.compDirty=true;return true}
// The ground drawn at s pixels a tile (cached per size): flat colours, trees and water as rounded masses
// (one circle per tile, so neighbours merge and edges are round), roads as clean lines between road tiles.
function mmGround(Z,s){
  if(Z.ground[s])return Z.ground[s];
  const w=Z.w,h=Z.h,K=Z.kind,P=Z.pal,c=document.createElement('canvas');c.width=w*s;c.height=h*s;const g=c.getContext('2d');
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?'':K[y*w+x];
  g.fillStyle=P.grass;g.fillRect(0,0,c.width,c.height);
  const round=(kind,col,r)=>{g.fillStyle=col;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)===kind){g.beginPath();g.arc((x+.5)*s,(y+.5)*s,s*r,0,7);g.fill()}};
  round('tree',P.tree,0.72);round('water',P.water,0.72);
  g.strokeStyle=g.fillStyle=P.path;g.lineCap='round';g.lineWidth=Math.max(1.5,s*0.5);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(at(x,y)!=='path')continue;
    g.beginPath();g.arc((x+.5)*s,(y+.5)*s,g.lineWidth/2,0,7);g.fill();
    [[1,0],[0,1],[1,1],[-1,1]].forEach(([dx,dy])=>{if(at(x+dx,y+dy)!=='path')return;
      if(dx&&dy&&(at(x+dx,y)==='path'||at(x,y+dy)==='path'))return; // a corner already joins them
      g.beginPath();g.moveTo((x+.5)*s,(y+.5)*s);g.lineTo((x+dx+.5)*s,(y+dy+.5)*s);g.stroke()});
    // wide roads: fill between four road centres so there's no hole in the middle
    if(at(x+1,y)==='path'&&at(x,y+1)==='path'&&at(x+1,y+1)==='path')g.fillRect((x+.5)*s,(y+.5)*s,s,s)}
  for(let i=0;i<w*h;i++){const k=K[i];if(k==='wall'||k==='door'||k==='rock'){g.fillStyle=P[k==='door'?'wall':k];g.fillRect((i%w)*s,((i/w)|0)*s,s,s)}}
  return Z.ground[s]=c;
}
// What you've seen of the ground, at s pixels a tile, with a soft fog edge (the mask is scaled up smoothly).
function mmPicture(Z,s,into){
  const c=into||document.createElement('canvas');c.width=Z.w*s;c.height=Z.h*s;const g=c.getContext('2d');
  g.clearRect(0,0,c.width,c.height);g.drawImage(mmGround(Z,s),0,0);
  g.globalCompositeOperation='destination-in';g.imageSmoothingEnabled=true;
  g.filter='blur('+Math.max(1,s*0.35)+'px)';g.drawImage(Z.m,0,0,c.width,c.height);g.filter='none';
  g.globalCompositeOperation='destination-over';g.fillStyle=MM_FOG;g.fillRect(0,0,c.width,c.height);
  g.globalCompositeOperation='source-over';return c;
}
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
// Map pins (v0.61, UI 20): small pictures of what the place is (5 x 5, black outline), not code shapes to learn.
// '#' = colour, 'o' = dark inside (the door's opening, the skull's eyes).
const MM_ICON={
  exit:  ['#....','###..','#####','###..','#....'],   // pointer, turned to point out of the area
  town:  ['..#..','.###.','#####','##o##','##o##'],   // house with a door
  door:  ['.###.','#ooo#','#ooo#','#ooo#','#ooo#'],   // arch: a way down (cave, crypt, sinkhole)
  fire:  ['..#..','.##..','.###.','#####','.###.'],   // flame: campfire
  skull: ['.###.','#####','#o#o#','.###.','.#.#.'],   // named
  chest: ['#####','#ooo#','#####','##o##','#####']};  // hidden chest
const MM_ICOL={exit:'#7dffa6',town:'#e8e2d0',door:'#c8a0ff',fire:'#ffb347',skull:'#ff6b6b',chest:'#ffd27a'};
// Pin size (v0.61.1, owner): Small (default), Medium or Large, picked on the map's corner or in Settings → Display.
const MM_PINS={S:1,M:1.5,L:2},mmPinMul=()=>MM_PINS[settings.pins]||1;
const MM_WHAT={exit:'Way out',town:'Way out',door:'Way down',fire:'Rest spot',skull:'Named',chest:'Hidden chest'};
function mmIconOf(p){if(p.name==='Hidden chest')return'chest';if(/^Town/.test(p.name))return'town';
  return{exit:'exit',dun:'door',camp:'fire',boss:'skull'}[p.k]||'fire'}
function mmIcon(g,cx,cy,name,u,rot){
  const G=MM_ICON[name],N=G.length,on=[],hole=[];
  const at=(x,y)=>{let X=x,Y=y;for(let r=0;r<(rot||0);r++){const t=X;X=N-1-Y;Y=t}return[X,Y]}; // turn a quarter at a time
  const x0=Math.round(cx-N/2*u),y0=Math.round(cy-N/2*u);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const ch=G[y][x];if(ch==='#')on.push(at(x,y));else if(ch==='o')hole.push(at(x,y))}
  g.fillStyle='#000';on.concat(hole).forEach(([X,Y])=>g.fillRect(x0+(X-1)*u,y0+(Y-1)*u,3*u,3*u)); // outline first
  g.fillStyle=MM_ICOL[name];on.forEach(([X,Y])=>g.fillRect(x0+X*u,y0+Y*u,u,u));
  g.fillStyle='#141418';hole.forEach(([X,Y])=>g.fillRect(x0+X*u,y0+Y*u,u,u));
}
// Which way an exit points: toward the nearest edge of the area (exits sit on or near an edge).
function mmExitRot(Z,p){const d=[Z.w-1-p.x,Z.h-1-p.y,p.x,p.y];return d.indexOf(Math.min(...d))}
const mmEl=$('mm'),mmg=mmEl.getContext('2d');
function drawMinimap(){
  const show=settings.minimap&&MM_ZONES[zoneId];
  mmEl.style.display=show?'block':'none';if(!show)return;
  const Z=mmZone(zoneId),dpr=Math.min(2,window.devicePixelRatio||1),W=mmEl.clientWidth||86,H=mmEl.clientHeight||86;
  if(mmEl.width!==Math.round(W*dpr)){mmEl.width=Math.round(W*dpr);mmEl.height=Math.round(H*dpr)}
  const strip=Math.round(13*dpr);                       // the area's name sits in a grey strip along the bottom
  const s=Math.round(MM_TILE*dpr),cxp=mmEl.width/2,cyp=(mmEl.height-strip)/2,ptx=player.x/T,pty=player.y/T,u=Math.max(1,Math.round(dpr));
  // Rebuild the picture only when something new was revealed (a few times a second while exploring, never when not).
  if(Z.compDirty||!Z.comp||Z.comp.width!==Z.w*s){Z.comp=mmPicture(Z,s,Z.comp);Z.compDirty=false}
  mmg.imageSmoothingEnabled=false;mmg.fillStyle=MM_FOG;mmg.fillRect(0,0,mmEl.width,mmEl.height);
  mmg.drawImage(Z.comp,Math.round(cxp-ptx*s),Math.round(cyp-pty*s));
  // Pins for places you've found. Ways out off the edge get a small arrow on the rim, so you know which way to head.
  const pad=5*dpr,bot=mmEl.height-strip,pu=Math.max(1,Math.round(dpr*mmPinMul()));
  Z.pins.forEach(p=>{if(!p.found)return;
    const x=cxp+(p.x+0.5-ptx)*s,y=cyp+(p.y+0.5-pty)*s,ic=mmIconOf(p);
    if(x>pad&&y>pad&&x<mmEl.width-pad&&y<bot-pad){mmIcon(mmg,x,y,ic,pu,ic==='exit'?mmExitRot(Z,p):0);return}
    if(p.k!=='exit'&&p.k!=='dun')return;
    const a=Math.atan2(y-cyp,x-cxp),r=Math.min((cxp-pad)/Math.abs(Math.cos(a)||1e-6),(cyp-pad)/Math.abs(Math.sin(a)||1e-6));
    mmArrow(cxp+Math.cos(a)*r,cyp+Math.sin(a)*r,a,3*dpr,MM_ICOL[ic]);
  });
  mmYou(mmg,cxp,cyp,pu);
  // Name strip.
  mmg.fillStyle='rgba(43,43,43,.95)';mmg.fillRect(0,bot,mmEl.width,strip);mmg.fillStyle='#8a8a8a';mmg.fillRect(0,bot,mmEl.width,dpr);
  mmg.fillStyle='#ddd';mmg.font=(9*dpr)+'px monospace';mmg.textAlign='center';mmg.textBaseline='middle';
  mmg.fillText(Z.name.length>16?Z.name.slice(0,15)+'…':Z.name,mmEl.width/2,bot+strip/2+dpr*0.5);
}
// You (v0.61.3, owner: "smaller, like a mouse pointer, less chunky"): a slim white pointer with a thin black edge,
// like a map app's navigation arrow, turned to the exact way you're heading. Drawn as a clean shape, not blocky
// pixels: at this size 8-way pixel arrows came out lumpy on the diagonals. u = the pins' pixel size (follows S / M / L).
function mmYou(g,x,y,u){
  const fa=Math.atan2(player.fy||0,player.fx||(player.fy?0:1)),L=3.6*u,W=2.6*u;
  g.save();g.translate(Math.round(x),Math.round(y));g.rotate(fa);
  g.beginPath();g.moveTo(L,0);g.lineTo(-L*0.75,-W);g.lineTo(-L*0.3,0);g.lineTo(-L*0.75,W);g.closePath();
  g.lineJoin='miter';g.lineWidth=Math.max(1.5,u*0.9);g.strokeStyle='#000';g.stroke();
  g.fillStyle='#fff';g.fill();g.restore();
}
function mmArrow(x,y,a,r,col){
  mmg.save();mmg.translate(x,y);mmg.rotate(a);mmg.fillStyle='#000';mmg.beginPath();mmg.moveTo(r+1,0);mmg.lineTo(-r-1,-r-1);mmg.lineTo(-r-1,r+1);mmg.fill();
  mmg.fillStyle=col;mmg.beginPath();mmg.moveTo(r,0);mmg.lineTo(-r,-r);mmg.lineTo(-r,r);mmg.fill();mmg.restore();
}

/* ---------- Full map screen (tap the minimap) ---------- */
// v0.61 (UI 20 option B): pins only, no numbers or list; tap a pin and a strip under the map says what it is,
// how far and which way. "% explored" sits in the title bar, zoom on the map's corner.
let mapSel=null;
function renderMapScreen(){
  const Z=mmZone(zoneId);if(!Z)return;
  const found=Z.pins.filter(p=>p.found);if(mapSel&&found.indexOf(mapSel)<0)mapSel=null;
  $('mapname').innerHTML=Z.name+' <span class="mpct">'+Math.round(100*Z.count/(Z.w*Z.h))+'% explored</span>';
  const cv2=$('mapcv'),box=cv2.parentNode,dpr=Math.min(2,window.devicePixelRatio||1);
  const cssW=Math.min(box.clientWidth||300,360),fit=Math.max(2,Math.floor(cssW/Z.w)),s=fit*MAPZ,cw=Z.w*s,ch=Z.h*s;
  cv2.style.width=cw+'px';cv2.style.height=ch+'px';
  const S=Math.round(s*dpr);mmPicture(Z,S,cv2);cv2.style.width=cw+'px';cv2.style.height=ch+'px';
  const g=cv2.getContext('2d'),u=Math.max(1,Math.round(dpr*Math.min(2,1+MAPZ*0.5)*mmPinMul()));mmPinBtn();
  const x=player.x/T*S,y=player.y/T*S;
  if(MAPZ>1&&!renderMapScreen.keep){box.scrollLeft=x/dpr-box.clientWidth/2;box.scrollTop=y/dpr-box.clientHeight/2} // keep you in view when zoomed
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),m=5*u;
  found.forEach(p=>{const ic=mmIconOf(p),px=cl((p.x+.5)*S,m,cv2.width-m),py=cl((p.y+.5)*S,m,cv2.height-m); // exits sit on the edge: keep the whole pin inside
    p.sx=px/dpr;p.sy=py/dpr;
    if(p===mapSel){g.strokeStyle='#ffd27a';g.lineWidth=1.5*dpr;g.beginPath();g.arc(px,py,5*u,0,7);g.stroke()}
    mmIcon(g,px,py,ic,u,ic==='exit'?mmExitRot(Z,p):0)});
  mmYou(g,x,y,u); // the same marker as the minimap, at the pins' size, on top
  const leg=$('maplegend');
  if(!mapSel){leg.innerHTML='<div class="mtip">'+(found.length?'Tap a pin to see what it is. '+found.length+' place'+(found.length>1?'s':'')+' found.':'No places found yet. Walk around to fill in the map.')+'</div>';return}
  const p=mapSel,ic=mmIconOf(p),dx=p.x+.5-player.x/T,dy=p.y+.5-player.y/T,dist=Math.round(Math.hypot(dx,dy));
  const dir=['east','south-east','south','south-west','west','north-west','north','north-east'][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
  leg.innerHTML='<div class="msel"><canvas id="mselic" width="'+(9*dpr)+'" height="'+(9*dpr)+'" style="width:18px;height:18px;image-rendering:pixelated"></canvas>'+
    '<div><div class="mselname">'+p.name+'</div><div class="mselsub">'+MM_WHAT[ic]+' · '+(dist<2?'right here':dist+' tiles '+dir)+'</div></div></div>';
  mmIcon($('mselic').getContext('2d'),4.5*dpr,4.5*dpr,ic,dpr,ic==='exit'?mmExitRot(Z,p):0);
}
// The pin size button on the map's corner shows a house pin at the size you have, plus S / M / L; a tap goes to the next size.
function mmPinBtn(){const c=$('mappinsic'),dpr=Math.min(2,window.devicePixelRatio||1),n=Math.round(14*dpr);c.width=c.height=n;c.style.width=c.style.height='14px';
  const g=c.getContext('2d');g.clearRect(0,0,n,n);mmIcon(g,n/2,n/2,'town',Math.max(1,Math.round(dpr*({S:.5,M:1,L:1.5}[settings.pins]||.5))),0);$('mappinsl').textContent=settings.pins||'S'}
$('mappins').addEventListener('click',()=>{settings.pins={S:'M',M:'L',L:'S'}[settings.pins]||'M';saveSettings();renderMapScreen.keep=true;renderMapScreen();renderMapScreen.keep=false});
// Tap a pin (a tap, not a drag or a pinch): select the nearest found pin within reach, or clear the selection.
(()=>{const cv2=$('mapcv');let down=null;
  cv2.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,id:e.pointerId}});
  cv2.addEventListener('pointerup',e=>{if(!down||down.id!==e.pointerId)return;const d=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(d>8)return;
    const Z=mmZone(zoneId);if(!Z)return;const r=cv2.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    let best=null,bd=22;Z.pins.forEach(p=>{if(!p.found||p.sx==null)return;const q=Math.hypot(p.sx-mx,p.sy-my);if(q<bd){bd=q;best=p}});
    mapSel=best===mapSel?null:best;renderMapScreen.keep=true;renderMapScreen();renderMapScreen.keep=false});
  cv2.addEventListener('pointercancel',()=>{down=null});
})();
// Map zoom (v0.27.1): + / - buttons or pinch on the map. 1 = whole area fits; zoomed in, drag to scroll.
let MAPZ=1;const MAPZ_MAX=4;
function mapZoom(d){const n=Math.min(MAPZ_MAX,Math.max(1,MAPZ+d));if(n===MAPZ)return;MAPZ=n;$('mapzl').textContent=MAPZ+'x';renderMapScreen()}
$('mapzin').addEventListener('click',()=>mapZoom(1));$('mapzout').addEventListener('click',()=>mapZoom(-1));
(()=>{const box=$('mapbox'),pts=new Map();let d0=0;
  const dist=()=>{const a=[...pts.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
  box.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2)d0=dist()});
  box.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const d=dist();if(d>d0*1.25){mapZoom(1);d0=d}else if(d<d0/1.25){mapZoom(-1);d0=d}}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>box.addEventListener(t,e=>pts.delete(e.pointerId)));
})();
mmEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;mapSel=null;openModal('mapUI');renderMapScreen()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MM.dirty)mmSave()}); // save the map when the app goes to the background

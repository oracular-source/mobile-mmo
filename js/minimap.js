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
const MM_TILE=2;                     // minimap: CSS pixels per tile (shows about 43 tiles across; was 3)
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
    const TO={crossroads:'Crossroads',graveyard:'Sunken Graveyard',crypt:'Crypt',rat_tunnel:'Rat tunnel',wolfwood:'Wolfwood',wolfwood_edge:'Wolfwood',chapel:'Chapel (not built yet)',town1:'Town 1 (not built yet)'};
    const NAMED={skeleton_king:'Skeleton King',old_gnawbone:'Old Gnawbone',greyfang:"Greyfang's den"};
    return A.exits.map(e=>({x:e.tx,y:e.ty,name:EX[e.name]||TO[e.to]||e.to,k:(e.to==='crypt'||e.to==='rat_tunnel')?'dun':'exit'}))
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
  const col=kind.map(k=>'rgb('+C[k].join(',')+')');
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
// Minimap markers (v0.48, owner): plain shapes, not pictures; small, so the minimap stays clean. Each kind of
// place has its own shape and colour, and the full map's list shows the same shape so they're easy to learn.
// 5 x 5, one screen pixel per dot, black outline. Exits are an arrow turned to point out of the area.
const MM_ICON={
  arrow: ['..#..','..##.','#####','..##.','..#..'],
  town:  ['#####','#####','#####','#####','#####'],   // square
  cave:  ['.###.','#####','#####','#####','.###.'],   // circle (cave or dungeon door)
  fire:  ['..#..','.###.','.###.','#####','#####'],   // triangle (campfire)
  skull: ['..#..','.###.','#####','.###.','..#..'],   // diamond (named)
  chest: ['#####','#...#','#...#','#...#','#####']};  // hollow square (hidden chest)
const MM_GLYPH={arrow:'→',town:'■',cave:'●',fire:'▲',skull:'◆',chest:'□'}; // the same shapes in the full map's list
function mmIconOf(p){if(p.name==='Hidden chest')return'chest';if(/^Town/.test(p.name))return'town';
  return{exit:'arrow',dun:'cave',camp:'fire',boss:'skull'}[p.k]||'fire'}
function mmIcon(g,cx,cy,name,hex,u,rot){
  const G=MM_ICON[name],N=G.length;
  const at=(x,y)=>{let X=x,Y=y;for(let r=0;r<(rot||0);r++){const t=X;X=N-1-Y;Y=t}return[X,Y]}; // turn a quarter at a time
  const x0=Math.round(cx-N/2*u),y0=Math.round(cy-N/2*u),dots=[];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(G[y][x]==='#')dots.push(at(x,y));
  g.fillStyle='#000';dots.forEach(([X,Y])=>g.fillRect(x0+(X-1)*u,y0+(Y-1)*u,3*u,3*u)); // outline first
  g.fillStyle=hex;dots.forEach(([X,Y])=>g.fillRect(x0+X*u,y0+Y*u,u,u));
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
  const s=MM_TILE*dpr,cxp=mmEl.width/2,cyp=(mmEl.height-strip)/2,ptx=player.x/T,pty=player.y/T,u=Math.max(1,Math.round(dpr));
  mmg.imageSmoothingEnabled=false;mmg.fillStyle='#07060a';mmg.fillRect(0,0,mmEl.width,mmEl.height);
  mmg.drawImage(Z.c,Math.round(cxp-ptx*s),Math.round(cyp-pty*s),Z.w*s,Z.h*s);
  // Icons for places you've found. Exits off the edge get a small arrow on the rim, so you know which way to head.
  const pad=5*dpr,bot=mmEl.height-strip;
  Z.pins.forEach(p=>{if(!p.found)return;
    const x=cxp+(p.x+0.5-ptx)*s,y=cyp+(p.y+0.5-pty)*s,col=MM_PIN_COL[p.k];
    if(x>pad&&y>pad&&x<mmEl.width-pad&&y<bot-pad){const ic=mmIconOf(p);mmIcon(mmg,x,y,ic,ic==='chest'?'#ffd27a':col,u,ic==='arrow'?mmExitRot(Z,p):0);return}
    if(p.k!=='exit'&&p.k!=='dun')return;
    const a=Math.atan2(y-cyp,x-cxp),r=Math.min((cxp-pad)/Math.abs(Math.cos(a)||1e-6),(cyp-pad)/Math.abs(Math.sin(a)||1e-6));
    mmArrow(cxp+Math.cos(a)*r,cyp+Math.sin(a)*r,a,3*dpr,col);
  });
  // You: a gold arrow pointing the way you last moved.
  mmYou(mmg,cxp,cyp,4.5*dpr,dpr);
  // Name strip.
  mmg.fillStyle='rgba(43,43,43,.95)';mmg.fillRect(0,bot,mmEl.width,strip);mmg.fillStyle='#8a8a8a';mmg.fillRect(0,bot,mmEl.width,dpr);
  mmg.fillStyle='#ddd';mmg.font=(9*dpr)+'px monospace';mmg.textAlign='center';mmg.textBaseline='middle';
  mmg.fillText(Z.name.length>16?Z.name.slice(0,15)+'…':Z.name,mmEl.width/2,bot+strip/2+dpr*0.5);
}
function mmYou(g,x,y,q,dpr){
  const fa=Math.atan2(player.fy||0,player.fx||(player.fy?0:1));
  g.save();g.translate(x,y);g.rotate(fa);
  g.beginPath();g.moveTo(q,0);g.lineTo(-q*0.8,-q*0.75);g.lineTo(-q*0.35,0);g.lineTo(-q*0.8,q*0.75);g.closePath();
  g.fillStyle='#ffd27a';g.fill();g.lineWidth=dpr;g.strokeStyle='#000';g.stroke();g.restore();
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
  const cssW=Math.min(box.clientWidth||300,360),fit=Math.max(2,Math.floor(cssW/Z.w)),s=fit*MAPZ,cw=Z.w*s,ch=Z.h*s;
  cv2.style.width=cw+'px';cv2.style.height=ch+'px';cv2.width=cw*dpr;cv2.height=ch*dpr;
  const g=cv2.getContext('2d'),S=s*dpr;g.imageSmoothingEnabled=false;
  g.fillStyle='#07060a';g.fillRect(0,0,cv2.width,cv2.height);g.drawImage(Z.c,0,0,Z.w*S,Z.h*S);
  // You first, then the pins on top, so a numbered pin under you can still be read.
  const x=player.x/T*S,y=player.y/T*S;
  if(MAPZ>1){box.scrollLeft=x/dpr-box.clientWidth/2;box.scrollTop=y/dpr-box.clientHeight/2} // keep you in view when zoomed
  mmYou(g,x,y,6*dpr,dpr); // the same gold arrow as the minimap (v0.48)
  // v0.42: each found place gets a number on the map that matches its row in the list below (owner picked A),
  // so four green exits can be told apart.
  const found=Z.pins.filter(p=>p.found),r=6*dpr;
  g.font='bold '+(9*dpr)+'px monospace';g.textAlign='center';g.textBaseline='middle';
  found.forEach((p,i)=>{const n=String(i+1),w=n.length>1?r*1.4:r,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),
    px=cl((p.x+0.5)*S,w+dpr,cv2.width-w-dpr),py=cl((p.y+0.5)*S,r+dpr,cv2.height-r-dpr); // exits sit on the edge: keep the whole pin inside
    g.fillStyle='#000';g.fillRect(px-w-dpr,py-r-dpr,2*w+2*dpr,2*r+2*dpr);g.fillStyle=MM_PIN_COL[p.k];g.fillRect(px-w,py-r,2*w,2*r);
    g.fillStyle='#000';g.fillText(n,px,py+0.5*dpr)});
  $('maplegend').innerHTML='<div style="color:#9aa;margin-bottom:4px">Explored '+Math.round(100*Z.count/(Z.w*Z.h))+'%</div>'+
    '<div class="mrow"><span style="color:#ffd27a;margin:0 9px 0 3px">➤</span>You</div>'+
    (found.length?found.map((p,i)=>'<div class="mrow"><span class="mnum" style="background:'+MM_PIN_COL[p.k]+'">'+(i+1)+'</span><span style="color:'+(mmIconOf(p)==='chest'?'#ffd27a':MM_PIN_COL[p.k])+';width:18px;display:inline-block">'+MM_GLYPH[mmIconOf(p)]+'</span>'+p.name+'</div>').join(''):'<div style="color:#9aa">No places found yet. Walk around to fill in the map.</div>');
}
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
mmEl.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(arranging)return;openModal('mapUI');renderMapScreen()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MM.dirty)mmSave()}); // save the map when the app goes to the background

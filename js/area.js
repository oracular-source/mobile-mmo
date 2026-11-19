// Areas built from text maps (js/data/maps): reads the map, paints its pixel-art ground once, and lists its lights, spawns and exits.
'use strict';
/* ---------- Reading the tables and a map file ---------- */
const AREA_TILES={},AREA_OBJS={};
TILESET.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_TILES[p[0]]={name:p[1],walk:p[2]==='1',tags:p.slice(4)}});
OBJECTS.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_OBJS[p[0]]={w:+p[1],h:+p[2],blocks:p[3]==='1',light:+p[7]}});
// Map file mob names -> mob types in js/data/mobs.js. The Skeleton King uses Boss 1 until he has his own data.
const AREA_MOBS={corpse:'dead',rat:'rat',crypt_rat:'crat',skeleton:'cskel',skeleton_king:'boss1'};
const AREAS={}; // built once, the first time you enter
// Zone ids that are built from map files (the old 'gy' id is kept so explored maps carry over).
const AREA_OF={gy:'graveyard',crypt:'crypt'},ZONE_OF={graveyard:'gy',crypt:'crypt'};
function curArea(){const k=AREA_OF[zoneId];return k?buildArea(k):null}
// Small integer hash so every tile gets the same "random" details each time (no effect on the game's seeded rolls).
function ah(x,y,s){let n=(x*374761393+y*668265263+(s||0)*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296}

function buildArea(id){
  if(AREAS[id])return AREAS[id];
  const M=MAPS[id],rows=M.tiles,w=rows[0].length,h=rows.length;
  const A={id:id,name:M.name,w:w,h:h,rows:rows,map:[],objs:[],spawns:[],exits:[],fogs:[],lights:[],flames:[],chests:[],start:null,tint:M.tint};
  M.things.split('\n').forEach(line=>{const p=line.split('#')[0].trim().split(/\s+/);if(!p[0])return;
    const k=p[0],px=x=>x*T+8,py=y=>y*T+10;
    if(k==='obj')A.objs.push(Object.assign({kind:p[1],x:+p[2],y:+p[3]},AREA_OBJS[p[1]]));
    else if(k==='spawn'||k==='named'){const lv=p[2].split('-').map(Number);A.spawns.push({type:AREA_MOBS[p[1]]||'dead',x:px(+p[3]),y:py(+p[4]),timer:0,mob:null,group:null,lv:[lv[0],lv[lv.length-1]]})}
    else if(k==='exit')A.exits.push({name:p[1],tx:+p[2],ty:+p[3],to:(p.find(s=>s.indexOf('to=')===0)||'to=?').slice(3)});
    else if(k==='fog')A.fogs.push({x:+p[1]*T,y:+p[2]*T,w:+p[3]*T,h:+p[4]*T});
    else if(k==='chest')A.chests.push({x:px(+p[1]),y:py(+p[2])});
  });
  // Walk map for the game's blocked(): 0 open, 2 water, 3 scenery, 5 buildings.
  for(let y=0;y<h;y++){A.map[y]=[];for(let x=0;x<w;x++){const t=AREA_TILES[rows[y][x]];A.map[y][x]=t.walk?0:(t.tags.indexOf('water')>=0?2:3)}}
  A.objs.forEach(o=>{if(!o.blocks)return;for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)A.map[y][x]=5;});
  // Lights: torches and lanterns are warm, the crypt mouth is cold.
  A.objs.forEach(o=>{const cx=o.x*T+o.w*T/2;
    if(o.kind==='torch'){A.lights.push({x:cx,y:o.y*T-6,r:58,w:34});A.flames.push({x:cx,y:o.y*T-4,big:0})}
    if(o.kind==='lantern'){A.lights.push({x:cx,y:o.y*T-4,r:44,w:26});A.flames.push({x:cx,y:o.y*T-1,big:0,lamp:1})}
    if(o.kind==='candle'){A.lights.push({x:cx,y:o.y*T+8,r:26,w:20});A.flames.push({x:cx-3,y:o.y*T+9,big:0,tiny:1},{x:cx+2,y:o.y*T+11,big:0,tiny:1})}
    if(o.kind==='brazier'){A.lights.push({x:cx,y:o.y*T-2,r:56,w:30});A.flames.push({x:cx,y:o.y*T+3,big:1})}
    if(o.kind==='crypt_mouth'){A.lights.push({x:cx,y:(o.y+o.h)*T-10,r:46,w:0})}
  });
  const st=A.exits.find(e=>e.name===M.start)||A.exits[0];
  const edge=st.tx>=w-1||st.tx<=0||st.ty>=h-1||st.ty<=0;
  A.start=edge?{x:st.tx*T+8+(st.tx>=w-1?-48:st.tx<=0?48:0),y:st.ty*T+8+(st.ty>=h-1?-48:st.ty<=0?48:0)}:areaSpot(A,st); // a few steps inside, clear of the exit
  if(!A.start)A.start={x:st.tx*T+8,y:st.ty*T+8};
  A.world=paintArea(A);
  AREAS[id]=A;return A;
}

/* ---------- Painting: ground first, then scenery from the top row down so taller things overlap correctly ---------- */
// Colours from the moonlit graveyard mock-up (art/palette.md family).
const AP={out:'#0b0a0f',dg:['#29281f','#2b2a20','#2f2d22','#33301f'],dgTuft:'#3a3727',dgDot:'#454030',
  gg:['#222a1e','#242c20','#28301f','#262c20'],ggTuft:'#33402c',ggTuft2:'#2c3a27',
  path:'#5a4c3d',pathHi:'#6e5a48',pebble:'#8a7460',road:'#6e5a48',roadHi:'#8a7460',rut:'#4a3e32',
  mud:'#28241b',mudDk:'#1c1a14',marsh:'#25312a',reed:'#4d6640',reedHi:'#6f8a5a',
  water:'#132430',waterHi:'#22404e',glint:'#b9cbbf',
  leaf:'#223020',leafHi:'#3a4d33',leafTop:'#56704a',leafDk:'#1a2618',trunk:'#3b3128',trunkHi:'#4a3e32',twig:'#5a4c3d',
  stone:'#6b6470',stoneHi:'#8d8692',stoneDk:'#4d4752',stoneDk2:'#3a3343',moss:'#4d6640',
  iron:'#2b2738',ironHi:'#4a4256',ironTip:'#6b6480',brick:'#4a4256',brickHi:'#57506a',mortar:'#2b2738',
  wood:'#5a4030',woodHi:'#7a5a42',woodDk:'#3b2a1e',roof:'#3b2616',roofHi:'#5a3a22',dirt:'#3b3128',dirtHi:'#4a3e32',bell:'#8a6f1a',bellHi:'#c9a227',
  flr:'#2a2733',flr2:'#26232e',flrHi:'#312d3b',flrLine:'#1b1922',rock:'#14121a',rockHi:'#24212c',bone:'#b9b0a0',boneDk:'#857c6e'};

function groundCol(n,r){
  if(n==='dead_grass')return AP.dg[Math.floor(r*4)];if(n==='grass')return AP.gg[Math.floor(r*4)];
  if(n==='dirt_path'||n==='gate'||n==='broken_fence')return r<0.5?AP.path:(r<0.8?'#54473a':AP.pathHi);
  if(n==='road')return r<0.6?AP.road:'#665443';if(n==='mud')return r<0.7?AP.mud:'#2c2820';if(n==='marsh')return r<0.6?AP.marsh:'#2a3a30';
  if(n==='water')return r<0.7?AP.water:'#16293a';if(n==='floor'||n==='stairs')return r<0.5?AP.flr:(r<0.8?AP.flr2:AP.flrHi);return AP.dg[0]}
function paintArea(A){
  const W=A.w*T,H=A.h*T,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const tile=(x,y)=>(x<0||y<0||x>=A.w||y>=A.h)?null:A.rows[y][x];
  const name=(x,y)=>{const t=tile(x,y);return t?AREA_TILES[t].name:''};
  const tags=(x,y)=>{const t=tile(x,y);return t?AREA_TILES[t].tags:[]};
  // Which open ground sits under a piece of scenery: living grass outside, dead grass inside, water under the grate.
  const under=(x,y)=>{const n=name(x,y);if(n==='fence_grate')return 'water';if(n==='tree'||n==='bush')return 'grass';
    if(n==='iron_fence'||n==='gate'||n==='broken_fence'){return name(x,y)==='gate'?'dirt_path':'dead_grass'}
    if(n==='rock'||n==='bones'||n==='coffin')return 'floor';
    return 'dead_grass'};
  const groundOf=(x,y)=>{x=Math.max(0,Math.min(A.w-1,x));y=Math.max(0,Math.min(A.h-1,y));const t=AREA_TILES[tile(x,y)];return t.walk||t.name==='water'?t.name:under(x,y)};

  // 1) Ground: 8 x 8 patches in a few close shades (the mock-up's look), with tufts and pebbles.
  for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){
    const gname=groundOf(tx,ty),bx=tx*T,by=ty*T;
    for(let qy=0;qy<2;qy++)for(let qx=0;qx<2;qx++){
      const r=ah(tx*2+qx,ty*2+qy,1),X=bx+qx*8,Y=by+qy*8;
      let col;
      if(gname==='dead_grass')col=AP.dg[Math.floor(r*4)];
      else if(gname==='grass')col=AP.gg[Math.floor(r*4)];
      else if(gname==='dirt_path'||gname==='gate'||gname==='broken_fence')col=r<0.5?AP.path:(r<0.8?'#54473a':AP.pathHi);
      else if(gname==='road')col=r<0.6?AP.road:'#665443';
      else if(gname==='mud')col=r<0.7?AP.mud:'#2c2820';
      else if(gname==='marsh')col=r<0.6?AP.marsh:'#2a3a30';
      else if(gname==='water')col=r<0.7?AP.water:'#16293a';
      else if(gname==='floor'||gname==='stairs')col=groundCol('floor',r);
      else col=AP.dg[0];
      R(X,Y,8,8,col);
    }
    for(let i=0;i<6;i++){const r1=ah(tx,ty,10+i),r2=ah(tx,ty,30+i),x=bx+Math.floor(r1*15),y=by+Math.floor(r2*15);
      if(gname==='dead_grass'){if(i<3){R(x,y,1,2,AP.dgTuft);if(i===0)R(x+1,y+1,1,1,AP.dgTuft)}else if(i===3&&r1<0.4)R(x,y,1,1,AP.dgDot)}
      else if(gname==='grass'){if(i<4){R(x,y,1,2,i%2?AP.ggTuft:AP.ggTuft2);if(i===1)R(x+1,y,1,1,AP.ggTuft)}}
      else if(gname==='dirt_path'||gname==='gate'){if(i<3)R(x,y,1,1,AP.pebble);else if(i===3)R(x,y,2,1,'#4a3e32')}
      else if(gname==='road'){if(i<3)R(x,y,1,1,AP.roadHi);if(i===4)R(bx,by+4,16,1,AP.rut);if(i===5)R(bx,by+11,16,1,AP.rut)}
      else if(gname==='mud'){if(i<2)R(x,y,3,1,AP.mudDk);if(i===2&&r1<0.3)R(x,y,1,1,'#3a4a50')}
      else if(gname==='marsh'){if(i<3){R(x,y-2,1,3,AP.reed);R(x,y-2,1,1,AP.reedHi)}else if(i===3)R(x,y,3,1,AP.water)}
      else if(gname==='water'){if(i<2)R(x,y,3,1,AP.waterHi);if(i===2&&r1<0.15)R(x,y,1,1,AP.glint)}
      else if(gname==='floor'){if(i===0){R(bx,by+15,16,1,AP.flrLine);R(bx+((ty%2)?7:15),by,1,16,AP.flrLine)}else if(i===1&&r1<0.3)R(x,y,3,1,AP.flrLine);else if(i===2&&r1<0.2)R(x,y,1,1,AP.boneDk)}
      else if(gname==='stairs'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#1c1a24':'#24212c');R(bx,by+k*4,16,1,'#3a3545')}}
    }
    // Ragged edges wherever two kinds of ground meet (path and grass, mud and marsh...), so nothing looks stamped on in squares.
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const n=groundOf(tx+dx,ty+dy);if(n===gname||n==='water'||gname==='water'||gname==='floor'||gname==='stairs')return;
      for(let i=0;i<16;i++){const r=ah(tx*16+i,ty*16,dx*3+dy*7+50);if(r>0.6)continue;const d=1+Math.floor(ah(tx+i,ty*16,dx+dy*5+60)*3),col=groundCol(n,ah(tx*16+i,ty,61));
        if(dy===-1)R(bx+i,by,1,d,col);if(dy===1)R(bx+i,by+16-d,1,d,col);if(dx===-1)R(bx,by+i,d,1,col);if(dx===1)R(bx+16-d,by+i,d,1,col)}});
    // Dark shoreline where water meets land.
    if(gname==='water'){[[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const n=groundOf(tx+dx,ty+dy);if(n!=='water'){
      if(dy===-1){R(bx,by,16,1,'#0d1a22');R(bx,by+1,16,1,'#1b3442')}if(dy===1)R(bx,by+15,16,1,'#0d1a22');if(dx===-1)R(bx,by,1,16,'#0d1a22');if(dx===1)R(bx+15,by,1,16,'#0d1a22')}});
      const land=(dx,dy)=>groundOf(tx+dx,ty+dy)!=='water';
      [[-1,-1,0,0],[1,-1,15,0],[-1,1,0,15],[1,1,15,15]].forEach(([dx,dy,cx,cy])=>{if(!land(dx,0)||!land(0,dy))return;const col=groundCol(groundOf(tx+dx,ty),0.3);
        for(let yy=0;yy<6;yy++)for(let xx=0;xx<6;xx++){if(xx*xx+yy*yy<26&&(5-xx)*(5-xx)+(5-yy)*(5-yy)>=16)continue;if((5-xx)*(5-xx)+(5-yy)*(5-yy)<20)continue;
          R(bx+(dx<0?xx:15-xx),by+(dy<0?yy:15-yy),1,1,col)}
        for(let k=0;k<6;k++){const ang=k/5*Math.PI/2,ex=Math.round(Math.cos(ang)*6),ey=Math.round(Math.sin(ang)*6);R(bx+(dx<0?6-ex:9+ex),by+(dy<0?6-ey:9+ey),1,1,'#0d1a22')}})}
  }

  // 2) Scenery and objects, row by row. Objects are drawn when we reach their bottom row so trees in front cover them.
  const objsByRow={};A.objs.forEach(o=>{const r=o.y+o.h-1;(objsByRow[r]=objsByRow[r]||[]).push(o)});
  for(let ty=0;ty<A.h;ty++){
    for(let tx=0;tx<A.w;tx++){
      const n=name(tx,ty),bx=tx*T,by=ty*T;
      if(n==='tree')drawTree(g,R,bx,by,ah(tx,ty,3));
      else if(n==='dead_tree')drawDeadTree(g,R,bx,by,ah(tx,ty,4));
      else if(n==='bush'||n==='dead_bush')drawBush(R,bx,by,n==='dead_bush',ah(tx,ty,5));
      else if(n==='grave')drawGrave(R,bx,by,ah(tx,ty,6));
      else if(n==='dug_grave')drawDug(R,bx,by,ah(tx,ty,7));
      else if(n==='rubble')drawRubble(R,bx,by,ah(tx,ty,8));
      else if(n==='rock')drawRock(R,bx,by,name(tx,ty+1)!=='rock'&&ty+1<A.h,name(tx,ty-1)!=='rock'&&ty>0,ah(tx,ty,9));
      else if(n==='bones')drawBones(R,bx,by,ah(tx,ty,11));
      else if(n==='coffin')drawCoffin(R,bx,by,ah(tx,ty,12));
      else if(n==='iron_fence'||n==='fence_grate'){const isF=(x,y)=>{const m=name(x,y);return m==='iron_fence'||m==='fence_grate'||m==='gate'||m==='broken_fence'};
        drawFence(R,bx,by,isF(tx-1,ty),isF(tx+1,ty),isF(tx,ty-1),isF(tx,ty+1),n==='fence_grate')}
      else if(n==='gate'){const pillarUp=name(tx,ty-1)==='iron_fence',pillarDn=name(tx,ty+1)==='iron_fence',pL=name(tx-1,ty)==='iron_fence',pR=name(tx+1,ty)==='iron_fence';
        if(pillarUp)drawPillar(R,bx+4,by-10);if(pL)drawPillar(R,bx-3,by-6);if(pR)drawPillar(R,bx+11,by-6);
        if(pillarDn){drawPillar(R,bx+4,by+4);R(bx+3,by+14,1,1,AP.out)}
        // An open gate leaf swung back against the fence.
        if(pillarUp){R(bx+7,by-2,1,10,AP.ironHi);R(bx+9,by-2,1,10,AP.ironHi);R(bx+7,by-2,3,1,AP.ironTip)}}
      else if(n==='broken_fence'){R(bx+2,by+10,13,1,AP.iron);R(bx+3,by+8,11,1,AP.ironHi);R(bx+4,by+11,1,2,AP.ironTip);R(bx+9,by+12,1,2,AP.ironTip);R(bx+13,by+5,2,6,AP.ironHi);R(bx+13,by+4,2,1,AP.ironTip)}
    }
    (objsByRow[ty]||[]).forEach(o=>drawObj(g,R,o));
  }
  A.chests.forEach(ch=>{const x=Math.round(ch.x),y=Math.round(ch.y);R(x-7,y-8,14,10,AP.out);R(x-6,y-7,12,8,AP.wood);R(x-6,y-7,12,2,AP.woodHi);R(x-6,y-4,12,1,AP.bell);R(x-1,y-5,2,3,AP.bellHi)});
  return c;
}

function drawTree(g,R,bx,by,r){
  // Living tree in 3/4 view: a round crown that hangs a tile above its trunk, lit from the upper left.
  const cx=bx+8,cy=by-1+Math.floor(r*3),rad=10+Math.floor(r*3);
  g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(cx+1,by+14,8,3,0,0,7);g.fill();
  R(cx-2,by+6,4,9,AP.out);R(cx-1,by+6,2,9,AP.trunk);R(cx-1,by+6,1,8,AP.trunkHi);
  for(let y=-rad-1;y<=rad+1;y++)for(let x=-rad-1;x<=rad+1;x++){
    const wob=Math.sin((Math.atan2(y,x)*5)+r*9)*1.3,d=Math.sqrt(x*x+y*y*1.15)-wob;
    if(d>rad+1)continue;
    let col;
    if(d>rad)col=AP.out;
    else{const lit=(-x-y)/rad+(ah(cx+x,cy+y,2)-0.5)*0.7;col=lit>0.95?AP.leafTop:lit>0.25?AP.leafHi:lit<-0.55?AP.leafDk:AP.leaf}
    R(cx+x,cy+y,1,1,col);
  }
  // Leaf clumps so the crown reads as foliage, not a ball.
  for(let i=0;i<5;i++){const a=ah(bx,by,40+i)*6.28,dd=ah(bx,by,50+i)*rad*0.6,x=Math.round(cx+Math.cos(a)*dd),y=Math.round(cy+Math.sin(a)*dd);if(x+y<cx+cy)R(x,y,2,1,AP.leafTop);else R(x,y,2,1,AP.leafDk)}
}
function drawDeadTree(g,R,bx,by,r){
  // Bare, crooked tree: dark outline under a lighter bark line, branches reaching up past its tile.
  const cx=bx+7+Math.floor(r*3),top=by-14-Math.floor(r*6);
  g.fillStyle='rgba(0,0,0,0.3)';g.beginPath();g.ellipse(cx+1,by+14,6,2,0,0,7);g.fill();
  const seg=[];
  seg.push([cx,by+14,cx+Math.round((r-0.5)*4),top+10,3]);
  const tx=cx+Math.round((r-0.5)*4);
  seg.push([tx,top+10,tx-7-Math.floor(r*3),top+2,2],[tx,top+12,tx+7+Math.floor(r*2),top+3,2],[tx,top+10,tx+1,top-2,2],
           [tx-4,top+6,tx-9,top+7,1],[tx+4,top+7,tx+10,top+9,1],[tx+1,top+2,tx-3,top-4,1],[cx,by+4,cx+5,by-1,1]);
  const line=(x0,y0,x1,y1,w,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);R(x-Math.floor(w/2),y,w,1,col)}};
  seg.forEach(s=>line(s[0],s[1],s[2],s[3],s[4]+2,AP.out));
  seg.forEach(s=>line(s[0],s[1],s[2],s[3],s[4],AP.trunk));
  line(cx-1,by+13,tx-1,top+11,1,AP.trunkHi);
  seg.slice(4).forEach(s=>R(s[2],s[3],1,1,AP.twig));
  R(bx+4,by+14,9,1,AP.dirt);
}
function drawBush(R,bx,by,dead,r){
  if(dead){const c=AP.twig;[[3,12,7,6],[8,12,6,5],[12,12,14,7],[8,12,9,4]].forEach(([x0,y0,x1,y1])=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)R(bx+Math.round(x0+(x1-x0)*i/n),by+Math.round(y0+(y1-y0)*i/n),1,1,i<2?AP.trunk:c)});return}
  for(let y=-5;y<=4;y++)for(let x=-7;x<=7;x++){const d=x*x/49+y*y/25;if(d>1)continue;R(bx+8+x,by+10+y,1,1,d>0.75?AP.out:(x+y<-3?AP.leafHi:AP.leaf))}
}
function drawGrave(R,bx,by,r){
  // Headstone on a low mound; three shapes so a row doesn't look stamped.
  R(bx+3,by+12,10,3,AP.dirt);R(bx+3,by+12,10,1,AP.dirtHi);R(bx+2,by+15,12,1,'rgba(0,0,0,0.35)');
  const k=Math.floor(r*3);
  if(k===0){R(bx+4,by+2,8,11,AP.out);R(bx+5,by+1,6,1,AP.out);R(bx+5,by+2,6,10,AP.stone);R(bx+5,by+2,2,9,AP.stoneHi);R(bx+10,by+3,1,9,AP.stoneDk);R(bx+7,by+5,2,1,AP.stoneDk);R(bx+7,by+7,3,1,AP.stoneDk)}
  else if(k===1){R(bx+6,by,4,13,AP.out);R(bx+3,by+3,10,4,AP.out);R(bx+7,by+1,2,11,AP.stone);R(bx+4,by+4,8,2,AP.stone);R(bx+7,by+1,1,10,AP.stoneHi);R(bx+4,by+4,3,1,AP.stoneHi)}
  else{R(bx+3,by+5,10,8,AP.out);R(bx+4,by+6,8,6,AP.stone);R(bx+4,by+6,8,1,AP.stoneHi);R(bx+4,by+6,1,6,AP.stoneHi);R(bx+11,by+7,1,5,AP.stoneDk)}
  if(r>0.6)R(bx+5+Math.floor(r*4),by+11,2,1,AP.moss);
}
function drawDug(R,bx,by,r){
  R(bx+3,by+2,10,12,AP.out);R(bx+4,by+3,8,10,'#0e0c10');R(bx+4,by+3,8,1,'#2a2018');
  R(bx+12,by+5,3,7,AP.dirt);R(bx+12,by+5,2,1,AP.dirtHi);R(bx+13,by+9,2,1,AP.dirtHi);
  if(r<0.5){R(bx+1,by+10,2,4,AP.stoneDk);R(bx+1,by+10,2,1,AP.stone)} // a tipped-over stone beside the hole
}
// Crypt walls: dark rock, with a lit stone face where the wall meets the floor below it (3/4 view).
function drawRock(R,bx,by,face,top,r){
  R(bx,by,16,16,AP.rock);
  if(top){R(bx,by+2,16,1,AP.rockHi);R(bx,by+3,16,1,AP.out)}
  if(face){R(bx,by+6,16,10,AP.stoneDk2);for(let y=0;y<10;y+=4){R(bx,by+6+y,16,1,AP.mortar);const o=(y/4)%2?4:12;R(bx+o,by+6+y,1,4,AP.mortar)}
    R(bx,by+6,16,1,AP.stoneDk);R(bx,by+15,16,1,AP.out);if(r<0.25)R(bx+3+Math.floor(r*30),by+11,2,2,AP.moss)}
}
// A heap of old bones against the wall.
function drawBones(R,bx,by,r){
  R(bx+1,by+9,14,6,'rgba(0,0,0,0.3)');R(bx+2,by+6,12,8,AP.boneDk);
  for(let i=0;i<7;i++){const x=bx+2+Math.floor(ah(bx,i,1)*11),y=by+5+Math.floor(ah(by,i,2)*7);R(x,y,3+(i%2),1,AP.bone);R(x,y+1,1,1,AP.out)}
  R(bx+5+Math.floor(r*4),by+4,4,4,AP.out);R(bx+6+Math.floor(r*4),by+4,2,2,AP.bone);R(bx+6+Math.floor(r*4),by+6,2,1,AP.boneDk)} // a skull on top
// Stone coffin seen from above, lid slightly ajar on some.
function drawCoffin(R,bx,by,r){
  R(bx+2,by+13,13,2,'rgba(0,0,0,0.35)');R(bx+3,by+1,10,14,AP.out);R(bx+4,by+2,8,12,AP.stoneDk);R(bx+4,by+2,8,1,AP.stone);R(bx+4,by+2,1,12,AP.stone);
  R(bx+7,by+4,2,7,AP.stoneDk2);R(bx+5,by+6,6,2,AP.stoneDk2);
  if(r<0.35){R(bx+4,by+11,8,3,AP.out);R(bx+5,by+12,6,1,'#0e0c12')}}
function drawRubble(R,bx,by,r){
  [[3,9,4,3],[8,11,5,3],[6,6,3,2],[11,7,3,3],[2,13,3,2]].forEach(([x,y,w,h],i)=>{if(i===4&&r<0.5)return;R(bx+x-1,by+y-1,w+2,h+2,AP.out);R(bx+x,by+y,w,h,i%2?AP.stoneDk:AP.stone);R(bx+x,by+y,w,1,AP.stoneHi)});
}
function drawFence(R,bx,by,l,rt,up,dn,grate){
  // Iron fence: spear-topped posts joined by two rails; runs up and down the screen show as a post column.
  if(grate){for(let i=0;i<4;i++)R(bx+2+i*4,by+1,1,14,AP.ironHi);R(bx,by+3,16,1,AP.iron);R(bx,by+11,16,1,AP.iron);return}
  const horiz=l||rt||!(up||dn);
  if(horiz){R(l?bx:bx+6,by+5,(l?8:2)+(rt?8:2),1,AP.out);R(l?bx:bx+6,by+6,(l?8:2)+(rt?8:2),1,AP.ironHi);R(l?bx:bx+6,by+10,(l?8:2)+(rt?8:2),1,AP.out);R(l?bx:bx+6,by+11,(l?8:2)+(rt?8:2),1,AP.ironHi);
    [2,7,12].forEach(x=>{R(bx+x,by+2,2,12,AP.out);R(bx+x,by+3,1,10,AP.ironHi);R(bx+x,by+1,2,1,AP.ironTip)});R(bx,by+14,16,1,'rgba(0,0,0,0.3)')}
  if(up||dn){R(bx+6,up?by:by+4,4,(dn?16:12)-(up?0:4),AP.out);R(bx+7,up?by:by+4,1,(dn?16:12)-(up?0:4),AP.ironHi);R(bx+8,up?by:by+4,1,(dn?16:12)-(up?0:4),AP.iron);
    [1,9].forEach(y=>{R(bx+5,by+y,6,5,AP.out);R(bx+6,by+y+1,1,3,AP.ironHi);R(bx+6,by+y,1,1,AP.ironTip)})}
}
function drawPillar(R,x,y){R(x,y,8,14,AP.out);R(x+1,y+2,6,11,AP.brick);R(x+1,y+2,2,11,AP.brickHi);R(x,y,8,3,AP.stoneDk2);R(x+1,y,6,1,AP.stone);R(x+1,y+6,6,1,AP.mortar);R(x+1,y+10,6,1,AP.mortar)}

function drawObj(g,R,o){
  const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T,k=o.kind;
  const shadow=(x,y,w,h)=>{g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,y,w,h)};
  const bricks=(x,y,w,h,base,hi)=>{R(x,y,w,h,base);for(let yy=0;yy<h;yy+=4){R(x,y+yy,w,1,AP.mortar);const off=(yy/4)%2?4:0;for(let xx=off;xx<w;xx+=8)R(x+xx,y+yy,1,4,AP.mortar);if(hi)for(let xx=off+1;xx<w;xx+=8)R(x+xx,y+yy+1,3,1,hi)}};
  if(k==='bell_tower'){
    // Broken stone bell tower: it rises well above its footprint; the right side of the top has crumbled away (rubble lies at its foot).
    const top=Y-34;shadow(X+3,Y+H-4,W,5);
    // Drawn on its own small canvas first so the crumbled corner can be cut away without cutting the ground behind it.
    const tc=document.createElement('canvas');tc.width=W+2;tc.height=H+36;const t2=tc.getContext('2d');
    const TR=(x,y,w,h,col)=>{t2.fillStyle=col;t2.fillRect(x-X+1,y-top+1,w,h)};
    TR(X-1,top-1,W+2,H+35,AP.out);
    TR(X,top,W,H+34,AP.brick);for(let yy=0;yy<H+34;yy+=4){TR(X,top+yy,W,1,AP.mortar);const off=(yy/4)%2?4:0;for(let xx=off;xx<W;xx+=8){TR(X+xx,top+yy,1,4,AP.mortar);TR(X+xx+1,top+yy+1,3,1,AP.brickHi)}}
    TR(X,top,3,H+34,AP.brickHi);TR(X+W-4,top,4,H+34,AP.stoneDk2);
    [[W-12,0,13,6],[W-8,6,9,5],[W-4,11,5,4]].forEach(([dx,dy,w,h])=>t2.clearRect(dx+1,dy,w+1,h+1));
    TR(X+W-13,top+6,1,1,AP.out);TR(X+W-12,top+6,4,1,AP.out);TR(X+W-9,top+11,5,1,AP.out);TR(X+W-5,top+15,5,1,AP.out);TR(X+W-13,top,1,6,AP.out);TR(X+W-9,top+6,1,5,AP.out);TR(X+W-5,top+11,1,4,AP.out);
    g.drawImage(tc,X-1,top-1);
    // cornice band and belfry arch with the tilted bell
    R(X-1,top+12,W-8,3,AP.stoneDk2);R(X,top+12,W-10,1,AP.stone);
    R(X+16,top+17,16,17,AP.out);R(X+17,top+19,14,14,'#120f16');R(X+18,top+18,12,1,AP.out);
    R(X+20,top+22,9,7,AP.out);R(X+21,top+22,7,6,AP.bell);R(X+21,top+22,2,5,AP.bellHi);R(X+23,top+28,3,2,AP.bell);R(X+24,top+19,1,3,AP.woodDk);
    // slit window and wooden door at ground level
    R(X+8,Y-4,2,6,'#120f16');R(X+38,Y+2,2,6,'#120f16');
    R(X+18,Y+H-17,12,17,AP.out);R(X+19,Y+H-16,10,16,AP.wood);R(X+19,Y+H-16,10,2,AP.woodDk);[21,24,27].forEach(x=>R(X+x,Y+H-14,1,14,AP.woodDk));R(X+26,Y+H-8,1,2,AP.bellHi);
    R(X+17,Y+H-18,14,2,AP.stoneDk2);R(X+18,Y+H-18,12,1,AP.stone);
    // ivy on the shady side
    for(let i=0;i<10;i++){const yy=Y+H-6-Math.floor(ah(o.x,i,11)*30),xx=X+W-6+Math.floor(ah(o.y,i,12)*5);R(xx,yy,2,1,AP.moss);R(xx,yy+1,1,1,'#33402c')}
    return}
  if(k==='crypt_mouth'){
    // Stone crypt front: a pediment roof on two pillars, steps down into cold blue light.
    const top=Y-14;shadow(X+3,Y+H-3,W,4);
    R(X-1,top+9,W+2,H+6,AP.out);bricks(X,top+10,W,H+4,AP.stoneDk2,AP.brick);
    for(let row=0;row<12;row++){const half=Math.round(row*(W/2+3)/11);R(X+W/2-half-1,top-2+row,2*half+2,1,AP.out);if(row>0)R(X+W/2-half,top-2+row,2*half,1,row%3===0?AP.stoneHi:AP.stone)}
    R(X-3,top+9,W+6,3,AP.out);R(X-2,top+10,W+4,1,AP.stoneHi);
    [[6],[W-14]].forEach(([px])=>{R(X+px-1,top+12,10,H+2,AP.out);R(X+px,top+12,8,H+1,AP.stone);R(X+px,top+12,3,H+1,AP.stoneHi);R(X+px+6,top+12,2,H+1,AP.stoneDk)});
    const dx=X+W/2-12,dy=Y+10;R(dx-1,dy-2,26,H-8,AP.out);R(dx,dy,24,H-10,'#07060a');
    for(let i=0;i<4;i++){R(dx+2+i,dy+H-14-i*4+3,20-i*2,2,i%2?'#2a3a6a':'#1d2a50')}
    R(dx+2,dy+1,20,4,'#3a55a0');R(dx+4,dy+2,16,1,'#6f8fe0');
    R(X+W/2-6,top+2,12,4,AP.out);R(X+W/2-5,top+3,10,2,AP.stoneDk);R(X+W/2-1,top+3,2,2,AP.bellHi); // carved crest with a gold glint
    return}
  if(k==='mausoleum'){
    const top=Y-14;shadow(X+3,Y+H-3,W,4);
    R(X-1,top+5,W+2,H+10,AP.out);bricks(X,top+6,W,H+8,AP.stoneDk,AP.stone);R(X,top+6,2,H+8,AP.stone);
    for(let i=0;i<W/2+3;i++)R(X+W/2-i-1,Math.floor(top+i/2.6-2),2*i+2,1,i>=W/2+2?AP.out:i%3===0?AP.stoneHi:AP.stone);
    R(X-2,top+5,W+4,2,AP.out);R(X-1,top+5,W+2,1,AP.stoneHi);
    R(X+W/2-5,Y+H-14,10,14,AP.out);R(X+W/2-4,Y+H-13,8,13,AP.stoneDk2);R(X+W/2-4,Y+H-13,8,1,AP.stone);R(X+W/2,Y+H-13,1,13,AP.out);
    R(X+3,Y+H-2,3,1,AP.moss);return}
  if(k==='shack'){
    // Gravedigger's shack: plank walls under a sagging shingle roof, a lit window.
    const top=Y-12;shadow(X+3,Y+H-3,W,4);
    R(X-1,top+11,W+2,H+2,AP.out);R(X,top+12,W,H,AP.wood);for(let x=0;x<W;x+=4){R(X+x,top+12,1,H,AP.woodDk);R(X+x+1,top+12,1,H,AP.woodHi)}
    for(let i=0;i<16;i++){R(X-3+Math.floor(i/6),top+i,W+6-Math.floor(i/6)*2,1,i<1||i===15?AP.out:i%3===0?AP.roof:AP.roofHi)}
    for(let x=0;x<W+4;x+=5)R(X-2+x,top+2,1,12,AP.roof);
    R(X+W/2-4,Y+H-13,9,13,AP.out);R(X+W/2-3,Y+H-12,7,12,AP.woodDk);R(X+W/2+1,Y+H-7,1,1,AP.bellHi);
    R(X+6,Y+H-24,8,7,AP.out);R(X+7,Y+H-23,6,5,'#ffb860');R(X+9,Y+H-23,1,5,AP.out);R(X+7,Y+H-21,6,1,AP.out);
    R(X+W-6,top+4,4,8,AP.out);R(X+W-5,top+2,2,9,AP.stoneDk);return} // chimney
  if(k==='dead_oak'){
    // A huge dead oak: the area's second landmark, big enough to see over the graves.
    const cx=X+W/2,base=Y+H-1;g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(cx+2,base,14,4,0,0,7);g.fill();
    const br=[[cx,base,cx,base-28,6],[cx,base-22,cx-20,base-40,3],[cx,base-26,cx+22,base-44,3],[cx,base-28,cx-4,base-50,3],[cx-12,base-31,cx-24,base-30,2],
      [cx+12,base-35,cx+26,base-32,2],[cx-2,base-40,cx+8,base-54,2],[cx-16,base-36,cx-18,base-48,1],[cx+18,base-40,cx+16,base-52,1],[cx-3,base-6,cx-12,base,3],[cx+3,base-6,cx+12,base,3]];
    const line=(x0,y0,x1,y1,w,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)R(Math.round(x0+(x1-x0)*i/n)-Math.floor(w/2),Math.round(y0+(y1-y0)*i/n),w,1,col)};
    br.forEach(b=>line(b[0],b[1],b[2],b[3],b[4]+2,AP.out));br.forEach(b=>line(b[0],b[1],b[2],b[3],b[4],AP.trunk));line(cx-2,base-1,cx-2,base-26,2,AP.trunkHi);
    R(cx+1,base-16,2,3,'#120f16');return} // a knot hole
  if(k==='statue'){
    // Weathered angel on a plinth.
    shadow(X+2,Y+13,14,3);R(X+1,Y+8,14,7,AP.out);R(X+2,Y+9,12,5,AP.stoneDk);R(X+2,Y+9,12,1,AP.stone);
    R(X+5,Y-10,6,19,AP.out);R(X+6,Y-9,4,17,AP.stone);R(X+6,Y-9,1,17,AP.stoneHi);R(X+6,Y-13,4,4,AP.out);R(X+7,Y-12,2,2,AP.stoneHi);
    R(X,Y-8,6,8,AP.out);R(X+1,Y-7,4,6,AP.stoneHi);R(X+10,Y-8,6,8,AP.out);R(X+11,Y-7,4,6,AP.stone);R(X+3,Y+12,2,1,AP.moss);return}
  if(k==='throne'){
    // The Skeleton King's throne: a high-backed stone seat on a dais, a skull on the crest.
    shadow(X+2,Y+H-3,W-2,4);R(X,Y+H-8,W,8,AP.out);R(X+1,Y+H-7,W-2,6,AP.stoneDk);R(X+1,Y+H-7,W-2,1,AP.stone);
    const cx=X+W/2;R(cx-9,Y-12,18,30,AP.out);R(cx-8,Y-11,16,28,AP.stoneDk2);R(cx-8,Y-11,2,28,AP.stoneDk);R(cx-6,Y-9,12,14,'#1c1924');
    R(cx-12,Y+8,6,10,AP.out);R(cx-11,Y+9,4,8,AP.stoneDk);R(cx+6,Y+8,6,10,AP.out);R(cx+7,Y+9,4,8,AP.stoneDk);
    R(cx-8,Y+11,16,6,AP.out);R(cx-7,Y+12,14,4,'#3d2a63');R(cx-7,Y+12,14,1,'#5a3f8a');
    R(cx-3,Y-16,6,6,AP.out);R(cx-2,Y-15,4,4,AP.bone);R(cx-2,Y-13,1,1,AP.out);R(cx+1,Y-13,1,1,AP.out);return}
  if(k==='brazier'){R(X+3,Y+4,10,5,AP.out);R(X+4,Y+5,8,3,AP.iron);R(X+4,Y+5,8,1,AP.ironHi);R(X+7,Y+8,2,6,AP.out);R(X+4,Y+13,8,2,AP.out);shadow(X+3,Y+14,10,2);return}
  if(k==='torch'){R(X+6,Y-6,4,22,AP.out);R(X+7,Y-5,2,20,AP.woodDk);R(X+7,Y-5,1,20,AP.wood);R(X+5,Y-6,6,3,AP.out);R(X+6,Y-5,4,1,AP.ironHi);shadow(X+5,Y+14,7,2);return}
  if(k==='lantern'){R(X+7,Y-8,2,24,AP.out);R(X+7,Y-8,1,23,AP.woodHi);R(X+8,Y-8,5,2,AP.out);R(X+11,Y-6,4,6,AP.out);R(X+12,Y-5,2,4,'#ffb860');return}
  if(k==='candle'){[[4,10,3],[9,12,4],[12,9,2]].forEach(([x,y,h])=>{R(X+x-1,Y+y-1,3,h+2,AP.out);R(X+x,Y+y,1,h,'#e8e0c8')});R(X+3,Y+14,11,1,'#cfc8b2');return}
  if(k==='cart'){
    // The gravedigger's handcart with a shovel in it.
    shadow(X+2,Y+13,W-2,3);R(X+1,Y+3,W-6,9,AP.out);R(X+2,Y+4,W-8,7,AP.wood);R(X+2,Y+4,W-8,1,AP.woodHi);[8,16].forEach(x=>R(X+x,Y+4,1,7,AP.woodDk));
    R(X+W-6,Y+6,6,1,AP.out);R(X+W-4,Y+5,4,1,AP.woodHi);R(X+5,Y+9,6,6,AP.out);R(X+6,Y+10,4,4,AP.woodDk);R(X+7,Y+11,2,2,AP.ironHi);
    R(X+12,Y-4,1,10,AP.woodHi);R(X+11,Y-6,3,3,AP.stone);return}
}

/* ---------- Ground fog: soft patches drifting over the fog zones (drawn under mobs so it never hides them) ---------- */
let fogBlob=null;
function drawAreaFog(A){
  if(!A.fogs.length)return;
  if(!fogBlob){fogBlob=document.createElement('canvas');fogBlob.width=64;fogBlob.height=32;const f=fogBlob.getContext('2d'),gr=f.createRadialGradient(32,16,2,32,16,30);
    gr.addColorStop(0,'rgba(190,210,205,0.55)');gr.addColorStop(1,'rgba(190,210,205,0)');f.fillStyle=gr;f.save();f.scale(1,0.5);f.beginPath();f.arc(32,32,30,0,7);f.restore();f.fillRect(0,0,64,32)}
  lx.globalAlpha=0.22;
  A.fogs.forEach((z,i)=>{const n=Math.round(z.w*z.h/2600)+2;for(let k=0;k<n;k++){
    const bx=z.x+ah(i,k,70)*z.w,by=z.y+ah(i,k,71)*z.h,sp=4+ah(i,k,72)*5,dx=Math.sin(time/sp+k)*18;
    lx.drawImage(fogBlob,Math.round(bx+dx-48),Math.round(by-24),96,48)}});
  lx.globalAlpha=1;
}

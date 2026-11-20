// Areas built from text maps (js/data/maps): reads the map, paints its pixel-art ground once, and lists its lights, spawns and exits.
'use strict';
/* ---------- Reading the tables and a map file ---------- */
const AREA_TILES={},AREA_OBJS={};
TILESET.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_TILES[p[0]]={name:p[1],walk:p[2]==='1',tags:p.slice(4)}});
OBJECTS.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_OBJS[p[0]]={w:+p[1],h:+p[2],blocks:p[3]==='1',light:+p[7]}});
// Map file mob names -> mob types in js/data/mobs.js. The Skeleton King uses Boss 1 until he has his own data.
const AREA_MOBS={corpse:'dead',rat:'rat',beetle:'beetle',crypt_rat:'crat',skeleton:'cskel',skeleton_king:'boss1',tunnel_rat:'trat',big_rat:'brat',old_gnawbone:'gnaw',ironshell:'ironshell',pale_rat:'palerat',weeping_bride:'bride'};
const AREAS={}; // built once, the first time you enter
// Zone ids that are built from map files (the old 'gy' id is kept so explored maps carry over).
const AREA_OF={gy:'graveyard',crypt:'crypt',cross:'crossroads',tunnel:'rat_tunnel'},ZONE_OF={graveyard:'gy',crypt:'crypt',crossroads:'cross',rat_tunnel:'tunnel'};
// Each map's light: how bright the dark is (amb) and the colour of the night over it. Shared by render.js and the minimap.
const AREA_TINT={moonlit:{amb:0.44,col:'3,12,14',text:'#9fd8c0'},crypt:{amb:0.22,col:'2,4,14',text:'#9fb4ee'},dusk:{amb:0.5,col:'14,8,4',text:'#ffd8a0'},earth:{amb:0.34,col:'6,8,8',text:'#c8b89a'}};
function curArea(){const k=AREA_OF[zoneId];return k?buildArea(k):null}
// Small integer hash so every tile gets the same "random" details each time (no effect on the game's seeded rolls).
function ah(x,y,s){let n=(x*374761393+y*668265263+(s||0)*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296}

function buildArea(id){
  if(AREAS[id])return AREAS[id];
  const M=MAPS[id],rows=M.tiles,w=rows[0].length,h=rows.length;
  const A={id:id,name:M.name,w:w,h:h,rows:rows,map:[],objs:[],spawns:[],exits:[],fogs:[],lights:[],flames:[],chests:[],holes:[],named:[],start:null,tint:M.tint,enter:M.enter||'',wake:M.wake||''};
  M.things.split('\n').forEach(line=>{const p=line.split('#')[0].trim().split(/\s+/);if(!p[0])return;
    const k=p[0],px=x=>x*T+8,py=y=>y*T+10;
    if(k==='obj')A.objs.push(Object.assign({kind:p[1],x:+p[2],y:+p[3]},AREA_OBJS[p[1]]));
    const opt=n=>(p.find(s=>s.indexOf(n+'=')===0)||'').slice(n.length+1); // name=value extras on a line
    if(k==='spawn'||k==='named'){const lv=p[2].split('-').map(Number),sp={type:AREA_MOBS[p[1]]||'dead',x:px(+p[3]),y:py(+p[4]),timer:0,mob:null,group:null,lv:[lv[0],lv[lv.length-1]]};A.spawns.push(sp);
      // A named remembers its spawn, the object you touch to summon it and the key that takes (v0.31).
      if(k==='named')A.named.push({x:+p[3],y:+p[4],name:p[1],sp:sp,summon:opt('summon'),key:opt('key')})}
    else if(k==='exit')A.exits.push({name:p[1],tx:+p[2],ty:+p[3],to:(p.find(s=>s.indexOf('to=')===0)||'to=?').slice(3),at:(p.find(s=>s.indexOf('at=')===0)||'at=').slice(3)}); // at = the exit you arrive by on the other side
    else if(k==='fog')A.fogs.push({x:+p[1]*T,y:+p[2]*T,w:+p[3]*T,h:+p[4]*T});
    else if(k==='chest')A.chests.push({x:px(+p[1]),y:py(+p[2]),tx:+p[1],ty:+p[2],open:false,at:0});
    // The area's named rare (v0.32): its own spot, empty until a spawn somewhere in the area rolls it (world.js rollRare). up = still out there.
    else if(k==='rare'){const ty=AREA_MOBS[p[1]];if(TYPES[ty])A.rare={name:p[1],x:+p[2],y:+p[3],sp:{type:ty,x:px(+p[2]),y:py(+p[3]),timer:Infinity,mob:null,group:null,lv:TYPES[ty].lv,noRespawn:true,rare:1,up:false}}}
  });
  A.named.forEach(n=>{n.obj=n.summon?A.objs.find(o=>o.kind===n.summon):null});
  // Walk map for the game's blocked(): 0 open, 2 water, 3 scenery, 5 buildings.
  for(let y=0;y<h;y++){A.map[y]=[];for(let x=0;x<w;x++){const t=AREA_TILES[rows[y][x]];A.map[y][x]=t.walk?0:(t.tags.indexOf('water')>=0?2:3)}}
  A.objs.forEach(o=>{if(!o.blocks)return;for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)A.map[y][x]=5;});
  // Holes in the tunnel walls: where Old Gnawbone's rats burrow out (the open floor just below each hole).
  for(let y=0;y<h-1;y++)for(let x=0;x<w;x++)if(rows[y][x]==='h'&&A.map[y+1][x]===0)A.holes.push({x:x*T+8,y:(y+1)*T+10});
  // Lights: torches and lanterns are warm, the crypt mouth is cold.
  A.objs.forEach(o=>{const cx=o.x*T+o.w*T/2;
    if(o.kind==='torch'){A.lights.push({x:cx,y:o.y*T-6,r:58,w:34});A.flames.push({x:cx,y:o.y*T-4,big:0})}
    if(o.kind==='lantern'){A.lights.push({x:cx,y:o.y*T-4,r:44,w:26});A.flames.push({x:cx,y:o.y*T-1,big:0,lamp:1})}
    if(o.kind==='candle'){A.lights.push({x:cx,y:o.y*T+8,r:26,w:20});A.flames.push({x:cx-3,y:o.y*T+9,big:0,tiny:1},{x:cx+2,y:o.y*T+11,big:0,tiny:1})}
    if(o.kind==='brazier'){A.lights.push({x:cx,y:o.y*T-2,r:56,w:30});A.flames.push({x:cx,y:o.y*T+3,big:1})}
    if(o.kind==='crypt_mouth'){A.lights.push({x:cx,y:(o.y+o.h)*T-10,r:46,w:0})}
    if(o.kind==='campfire'){A.lights.push({x:cx,y:o.y*T+6,r:72,w:38});A.flames.push({x:cx,y:o.y*T+11,big:1,camp:1})}
    if(o.kind==='light_shaft'){A.lights.push({x:cx,y:o.y*T+8,r:54,w:0,c:30});A.motes=(A.motes||[]).concat([{x:cx,y:o.y*T+12}])} // cold daylight from a crack above
  });
  const st=A.exits.find(e=>e.name===M.start)||A.exits[0];
  const edge=st.tx>=w-1||st.tx<=0||st.ty>=h-1||st.ty<=0;
  A.start=edge?{x:st.tx*T+8+(st.tx>=w-1?-48:st.tx<=0?48:0),y:st.ty*T+8+(st.ty>=h-1?-48:st.ty<=0?48:0)}:areaSpot(A,st); // a few steps inside, clear of the exit
  if(!A.start)A.start={x:st.tx*T+8,y:st.ty*T+8};
  A.trees=[];A.world=paintArea(A);
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
  flr:'#2a2733',cave:['#3a3127','#362e25','#3e3429','#332b22'],caveHi:'#4c4032',caveDk:'#1f1a15',earth:'#0e0b09',earthHi:'#2a221a',earthFace:'#57442f',earthFace2:'#3e3024',root:'#5a4632',rootHi:'#7a6248',fungus:'#c9c2a8',fungusDk:'#8f8a76',plank:'#6a5038',plankHi:'#8a6a4a',plankDk:'#3e2c1e',flr2:'#26232e',flrHi:'#312d3b',flrLine:'#1b1922',rock:'#14121a',rockHi:'#24212c',bone:'#b9b0a0',boneDk:'#857c6e'};

function groundCol(n,r){
  if(n==='dead_grass')return AP.dg[Math.floor(r*4)];if(n==='grass')return AP.gg[Math.floor(r*4)];
  if(n==='dirt_path'||n==='gate'||n==='broken_fence')return r<0.5?AP.path:(r<0.8?'#54473a':AP.pathHi);
  if(n==='road')return r<0.6?AP.road:'#665443';if(n==='mud')return r<0.7?AP.mud:'#2c2820';if(n==='marsh')return r<0.6?AP.marsh:'#2a3a30';
  if(n==='water')return r<0.7?AP.water:'#16293a';if(n==='cave_dirt'||n==='dirt_slope')return AP.cave[Math.floor(r*4)];if(n==='bridge')return AP.road;if(n==='floor'||n==='stairs')return r<0.5?AP.flr:(r<0.8?AP.flr2:AP.flrHi);return AP.dg[0]}
function paintArea(A){
  const W=A.w*T,H=A.h*T,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const tile=(x,y)=>(x<0||y<0||x>=A.w||y>=A.h)?null:A.rows[y][x];
  const name=(x,y)=>{const t=tile(x,y);return t?AREA_TILES[t].name:''};
  const tags=(x,y)=>{const t=tile(x,y);return t?AREA_TILES[t].tags:[]};
  // Which open ground sits under a piece of scenery: living grass outside, dead grass inside, water under the grate.
  const under=(x,y)=>{const n=name(x,y);if(n==='fence_grate')return 'water';if(n==='tree'||n==='bush')return 'grass';
    if(n==='iron_fence'||n==='gate'||n==='broken_fence'){return name(x,y)==='gate'?'dirt_path':'dead_grass'}
    if(A.tint==='earth')return 'cave_dirt'; // anything solid in the tunnel sits on damp earth
    if(n==='rock'||n==='bones'||n==='coffin')return 'floor';
    if(A.tint==='dusk')return 'grass';
    return 'dead_grass'};
  const groundOf=(x,y)=>{x=Math.max(0,Math.min(A.w-1,x));y=Math.max(0,Math.min(A.h-1,y));const t=AREA_TILES[tile(x,y)];return t.name==='bridge'?'water':t.walk||t.name==='water'?t.name:under(x,y)};

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
      else if(gname==='cave_dirt'||gname==='dirt_slope')col=AP.cave[Math.floor(r*4)];
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
      else if(gname==='cave_dirt'){const wallAbove=AREA_TILES[tile(tx,ty-1)||'d'].tags.indexOf('wall')>=0;
        if(i<2)R(x,y,1,1,AP.caveHi);else if(i===2)R(x,y,2,1,AP.caveDk);
        // pale mushrooms and hanging roots along the foot of the walls; drips darken the dirt
        else if(i===3&&wallAbove&&r1<0.35){R(x,by+2,2,1,AP.fungus);R(x,by+3,1,1,AP.fungusDk);R(x+3,by+3,1,1,AP.fungus)}
        else if(i===4&&r1<0.2)R(x,y,2,2,'#251f19')}
      else if(gname==='dirt_slope'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#3a3026':'#463a2c');R(bx,by+k*4,16,1,AP.root)}R(bx+3,by,1,16,AP.root);R(bx+11,by+2,1,14,AP.rootHi)}
      else if(gname==='stairs'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#1c1a24':'#24212c');R(bx,by+k*4,16,1,'#3a3545')}}
    }
    // Ragged edges wherever two kinds of ground meet (path and grass, mud and marsh...), so nothing looks stamped on in squares.
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy])=>{const n=groundOf(tx+dx,ty+dy);if(n===gname||n==='water'||gname==='water'||gname==='floor'||gname==='stairs'||gname==='cave_dirt'||gname==='dirt_slope'||n==='cave_dirt'||n==='dirt_slope')return;
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
      if(n==='tree'||n==='dead_tree'){const live=n==='tree',im=treeImg(live?'tree':'dead',Math.floor(ah(tx,ty,live?3:4)*TREE_VARIANTS));
        g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(bx+9,by+14,live?12:8,live?4:3,0,0,7);g.fill();
        A.trees.push(treeAt(im,bx,by,by+13))}
      else if(n==='bush'||n==='dead_bush')drawBush(R,bx,by,n==='dead_bush',ah(tx,ty,5));
      else if(n==='grave')drawGrave(R,bx,by,ah(tx,ty,6));
      else if(n==='dug_grave')drawDug(R,bx,by,ah(tx,ty,7));
      else if(n==='rubble')drawRubble(R,bx,by,ah(tx,ty,8));
      else if(n==='rock')drawRock(R,bx,by,name(tx,ty+1)!=='rock'&&ty+1<A.h,name(tx,ty-1)!=='rock'&&ty>0,ah(tx,ty,9));
      else if(n==='bones')drawBones(R,bx,by,ah(tx,ty,11));
      else if(n==='earth_wall'||n==='rat_hole'){const solid=(x,y)=>{const m=name(x,y);return !m||m==='earth_wall'||m==='rat_hole'};drawEarth(R,bx,by,!solid(tx,ty+1),!solid(tx,ty-1),n==='rat_hole',ah(tx,ty,13))}
      else if(n==='dirt_pile')drawDirtPile(R,bx,by,ah(tx,ty,14));
      else if(n==='bridge')drawBridge(R,bx,by,name(tx,ty-1)!=='bridge',name(tx,ty+1)!=='bridge');
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
    (objsByRow[ty]||[]).forEach(o=>{
      if(o.kind==='dead_oak'){const X=o.x*T,Y=o.y*T,base=Y+o.h*T-1;g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(X+T+2,base,20,6,0,0,7);g.fill();
        A.trees.push(treeAt(treeImg('oak',0),X+T/2,Y+(o.h-1)*T,base-2));return}
      drawObj(g,R,o)});
  }
  // Chests are drawn each frame in render.js (drawChests), since they open and fill again.
  return c;
}

/* ---------- Trees (v0.30): drawn bigger, on their own pictures, and sorted with characters so you walk behind them ---------- */
// Each tree picture has an anchor: (ox,oy) is where its trunk tile's top-left corner sits inside the picture.
// A tree's sort line (sy) is the foot of its trunk: anyone standing north of it is behind the tree.
const TREE_VARIANTS=8,TREE_IMGS={};
const TREE_BOX={tree:[56,64,20,42],dead:[60,84,22,64],oak:[96,112,40,80]}; // picture width, height, ox, oy
function treeImg(kind,v){
  const key=kind+v;if(TREE_IMGS[key])return TREE_IMGS[key];
  const [w,h,ox,oy]=TREE_BOX[kind],c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)},r=(v+0.5)/TREE_VARIANTS;
  if(kind==='tree')drawTree(R,ox,oy,r,v);else if(kind==='dead')drawDeadTree(R,ox,oy,r);else drawDeadOak(R,ox,oy);
  // Find the drawn part (for the "are you behind it?" check).
  const d=g.getImageData(0,0,w,h).data;let x0=w,x1=0,y0=h,y1=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  return TREE_IMGS[key]={c:c,ox:ox,oy:oy,box:[x0,y0,x1,y1]};
}
function treeAt(im,bx,by,sy){const x=bx-im.ox,y=by-im.oy;return{tree:im,x:x,y:sy,px:x,py:y,b:[x+im.box[0],y+im.box[1],x+im.box[2],y+im.box[3]],a:1}}
function drawTree(R,bx,by,r,v){
  // Living tree in 3/4 view, about 1.6x the old size: a round crown on a taller trunk, lit from the upper left.
  const cx=bx+8,rad=15+Math.floor(r*4),cy=by-rad+5;
  R(cx-3,by-2,6,17,AP.out);R(cx-2,by-2,4,16,AP.trunk);R(cx-2,by-2,1,15,AP.trunkHi);R(cx-5,by+13,3,2,AP.out);R(cx+2,by+13,4,2,AP.out);R(cx-4,by+13,2,1,AP.trunk);R(cx+2,by+13,3,1,AP.trunk); // roots
  for(let y=-rad-1;y<=rad+1;y++)for(let x=-rad-1;x<=rad+1;x++){
    const wob=Math.sin((Math.atan2(y,x)*6)+r*9)*1.8,d=Math.sqrt(x*x+y*y*1.15)-wob;
    if(d>rad+1)continue;
    let col;
    if(d>rad)col=AP.out;
    else{const lit=(-x-y)/rad+(ah(x+v*97,y,2)-0.5)*0.7;col=lit>0.95?AP.leafTop:lit>0.25?AP.leafHi:lit<-0.55?AP.leafDk:AP.leaf}
    R(cx+x,cy+y,1,1,col);
  }
  // Leaf clumps so the crown reads as foliage, not a ball.
  for(let i=0;i<9;i++){const a=ah(v,i,40)*6.28,dd=ah(v,i,50)*rad*0.65,x=Math.round(cx+Math.cos(a)*dd),y=Math.round(cy+Math.sin(a)*dd);if(x+y<cx+cy)R(x,y,3,1,AP.leafTop);else R(x,y,3,1,AP.leafDk)}
}
// Line of pixels between two points, w wide (used by the bare trees).
function treeLine(R,x0,y0,x1,y1,w,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)R(Math.round(x0+(x1-x0)*i/n)-Math.floor(w/2),Math.round(y0+(y1-y0)*i/n),w,1,col)}
function drawDeadTree(R,bx,by,r){
  // Bare, crooked tree (1.6x the old one): dark outline under a lighter bark line, branches reaching well above its tile.
  const k=1.6,base=by+14,cx=bx+7+Math.floor(r*3),P=(dx,dy)=>[Math.round(cx+dx*k),Math.round(base+dy*k)];
  const tdx=Math.round((r-0.5)*4),top=-28-Math.floor(r*6); // offsets from the foot of the trunk
  const seg=[[0,0,tdx,top+10,4],[tdx,top+10,tdx-7-Math.floor(r*3),top+2,3],[tdx,top+12,tdx+7+Math.floor(r*2),top+3,3],[tdx,top+10,tdx+1,top-2,3],
    [tdx-4,top+6,tdx-9,top+7,1],[tdx+4,top+7,tdx+10,top+9,1],[tdx+1,top+2,tdx-3,top-4,1],[0,-10,5,-15,2],[-1,0,-4,1,2],[1,0,4,1,2]];
  const L=(s,extra,col)=>{const a=P(s[0],s[1]),b=P(s[2],s[3]);treeLine(R,a[0],a[1],b[0],b[1],s[4]+extra,col)};
  seg.forEach(s=>L(s,2,AP.out));seg.forEach(s=>L(s,0,AP.trunk));
  const a=P(-1,-1),b=P(tdx-1,top+11);treeLine(R,a[0],a[1],b[0],b[1],1,AP.trunkHi);
  seg.slice(4,7).forEach(s=>{const e=P(s[2],s[3]);R(e[0],e[1],1,1,AP.twig)});
}
function drawDeadOak(R,bx,by){
  // A huge dead oak (1.5x the old one): the graveyard's second landmark, big enough to see over the graves. (bx,by) = its 2x2 footprint's bottom-left tile.
  const k=1.5,cx=bx+8,base=by+15;
  const br=[[0,0,0,-28,6],[0,-22,-20,-40,3],[0,-26,22,-44,3],[0,-28,-4,-50,3],[-12,-31,-24,-30,2],
    [12,-35,26,-32,2],[-2,-40,8,-54,2],[-16,-36,-18,-48,1],[18,-40,16,-52,1],[-3,-6,-12,0,3],[3,-6,12,0,3]];
  const L=(b,w,col)=>treeLine(R,Math.round(cx+b[0]*k),Math.round(base+b[1]*k),Math.round(cx+b[2]*k),Math.round(base+b[3]*k),w,col);
  br.forEach(b=>L(b,Math.round(b[4]*k)+2,AP.out));br.forEach(b=>L(b,Math.round(b[4]*k),AP.trunk));L([-2,-1,-2,-26],3,AP.trunkHi);
  R(cx+1,base-24,3,4,'#120f16'); // a knot hole
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
// Rat tunnel walls: packed earth. Where the wall meets the floor below you see its face: dark soil, stones, roots hanging down.
// A rat hole is a dark burrow in that face with a spill of loose dirt (where Old Gnawbone's rats come out).
function drawEarth(R,bx,by,face,top,hole,r){
  R(bx,by,16,16,AP.earth);
  if(top){R(bx,by+1,16,1,AP.earthHi);R(bx,by+2,16,1,AP.out)}
  for(let i=0;i<3;i++){const x=bx+Math.floor(ah(bx,by,80+i)*14),y=by+Math.floor(ah(bx,by,90+i)*(face?5:14));R(x,y,2,1,'#211b15')}
  if(!face)return;
  R(bx,by+5,16,11,AP.earthFace2);
  for(let i=0;i<6;i++){const x=bx+Math.floor(ah(bx,by,100+i)*15),y=by+6+Math.floor(ah(bx,by,110+i)*9);R(x,y,i%2?2:1,1,i<3?AP.earthFace:'#241c15')}
  if(r<0.5){const sx=bx+2+Math.floor(r*20);R(sx,by+9,3,2,AP.out);R(sx,by+9,2,1,AP.stoneDk);R(sx+1,by+10,1,1,AP.stoneDk2)} // a stone stuck in the soil
  R(bx,by+5,16,1,'#46382a');R(bx,by+15,16,1,AP.out);
  // roots: one or two hanging out of the face, a few with a pale tip
  const nr=1+Math.floor(ah(bx,by,120)*2);for(let i=0;i<nr;i++){const x=bx+2+Math.floor(ah(bx,by,121+i)*12),len=4+Math.floor(ah(bx,by,125+i)*7);
    for(let k=0;k<len;k++)R(x+(k>len/2&&i%2?1:0),by+5+k,1,1,k<len-1?AP.root:AP.rootHi)}
  if(hole){R(bx+3,by+7,10,8,AP.out);R(bx+4,by+8,8,7,'#050404');R(bx+5,by+7,6,1,AP.out);R(bx+4,by+8,8,1,'#2a2018');
    R(bx+2,by+14,12,2,AP.caveHi);R(bx+1,by+15,3,1,AP.earthFace);R(bx+12,by+15,3,1,AP.earthFace);R(bx+6,by+12,2,1,AP.boneDk)} // gnawed bone in the mouth of the hole
}
// A heap of dug-out dirt, kicked out of a burrow.
function drawDirtPile(R,bx,by,r){
  R(bx+1,by+12,14,3,'rgba(0,0,0,0.35)');
  for(let y=-5;y<=4;y++)for(let x=-7;x<=7;x++){const d=x*x/49+(y+1)*(y+1)/25;if(d>1)continue;R(bx+8+x,by+10+y,1,1,d>0.8?AP.out:(x+y<-2?'#5a4836':(d>0.5?'#3e3226':'#4a3c2c')))}
  R(bx+5+Math.floor(r*4),by+8,2,1,AP.pebble);if(r>0.5)R(bx+10,by+11,1,1,AP.boneDk);
}
// The old plank bridge on the north road: boards across the creek, a rail on each side.
function drawBridge(R,bx,by,topEnd,botEnd){
  R(bx,by,16,16,AP.plankDk);
  for(let y=0;y<16;y+=3){R(bx,by+y,16,2,AP.plank);R(bx,by+y,16,1,AP.plankHi);R(bx+5+((y/3)%2)*6,by+y,1,2,AP.plankDk)}
  R(bx,by,1,16,AP.out);R(bx+15,by,1,16,AP.out);
  if(topEnd){R(bx,by-3,2,5,AP.woodDk);R(bx+14,by-3,2,5,AP.woodDk)}if(botEnd){R(bx,by+13,2,4,AP.woodDk);R(bx+14,by+13,2,4,AP.woodDk)}
}
function drawRubble(R,bx,by,r){
  [[3,9,4,3],[8,11,5,3],[6,6,3,2],[11,7,3,3],[2,13,3,2]].forEach(([x,y,w,h],i)=>{if(i===4&&r<0.5)return;R(bx+x-1,by+y-1,w+2,h+2,AP.out);R(bx+x,by+y,w,h,i%2?AP.stoneDk:AP.stone);R(bx+x,by+y,w,1,AP.stoneHi)});
}
function drawFence(R,bx,by,l,rt,up,dn,grate){
  // Iron fence: spear-topped posts joined by two rails; runs up and down the screen show as a post column.
  if(grate){
    // Where the creek runs out under the fence: the fence keeps standing in the water (same line as the fence around it),
    // its bars go down into the stream, and the water ripples where it flows past them (v0.30; the old flat grate looked knocked over).
    if(up||dn){R(bx+6,by,4,16,AP.out);R(bx+7,by,1,16,AP.ironHi);R(bx+8,by,1,16,AP.iron);
      [1,9].forEach(y=>{R(bx+5,by+y,6,5,AP.out);R(bx+6,by+y+1,1,3,AP.ironHi);R(bx+6,by+y,1,1,AP.ironTip)});
      [2,7,12].forEach(y=>{R(bx+1,y+by,4,1,AP.waterHi);R(bx+4,y+by+1,2,1,AP.glint);R(bx+10,y+by+1,2,1,AP.glint);R(bx+11,y+by+2,4,1,AP.waterHi)})}
    else{R(bx,by+5,16,1,AP.out);R(bx,by+6,16,1,AP.ironHi);[2,7,12].forEach(x=>{R(bx+x,by+2,2,11,AP.out);R(bx+x,by+3,1,9,AP.ironHi);R(bx+x,by+1,2,1,AP.ironTip);R(bx+x-1,by+12,4,1,AP.waterHi)})}
    return}
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
  if(k==='campfire'){
    // The crossroads campfire: a ring of stones round a few burning logs (the flame is drawn live in world.js).
    shadow(X+1,Y+12,14,3);[[2,9],[5,12],[10,12],[13,9],[4,6],[11,6]].forEach(([x,y])=>{R(X+x-1,Y+y-1,4,3,AP.out);R(X+x,Y+y,2,1,AP.stoneHi)});
    R(X+4,Y+8,9,3,AP.out);R(X+5,Y+9,7,1,AP.woodHi);R(X+6,Y+7,5,3,AP.out);R(X+7,Y+8,3,1,AP.wood);R(X+6,Y+10,5,1,'#ff7a2a');return}
  if(k==='signpost'){
    // Wooden signpost: arms pointing down each road.
    shadow(X+4,Y+14,8,2);R(X+7,Y-12,3,27,AP.out);R(X+8,Y-11,1,25,AP.wood);
    R(X,Y-10,14,5,AP.out);R(X+1,Y-9,12,3,AP.woodHi);R(X+12,Y-9,2,3,AP.wood);R(X+3,Y-8,6,1,AP.woodDk);
    R(X+3,Y-3,13,5,AP.out);R(X+4,Y-2,11,3,AP.wood);R(X+3,Y-2,1,3,AP.woodHi);R(X+6,Y-1,6,1,AP.woodDk);return}
  if(k==='sinkhole'){
    // The sinkhole: the ground has fallen in. Torn turf at the lip, roots hanging into the dark, dust in the air (world.js).
    const cx=X+W/2,cy=Y+H/2;
    for(let y=-H/2-2;y<=H/2+2;y++)for(let x=-W/2-2;x<=W/2+2;x++){const d=(x*x)/((W/2+1)*(W/2+1))+(y*y)/((H/2+1)*(H/2+1));const wob=1+0.08*Math.sin(Math.atan2(y,x)*5);
      if(d>wob*1.05)continue;let col;if(d>wob*0.92)col=AP.out;else if(d>wob*0.72)col=y<0?'#4a3c2c':'#3a2e22';else if(d>wob*0.5)col=y<0?'#2a2018':'#16110c';else col='#050404';R(cx+x,cy+y,1,1,col)}
    for(let i=0;i<7;i++){const a=ah(o.x,i,1)*Math.PI,x=Math.round(cx+Math.cos(a)*(W/2-6)),y0=Math.round(cy-Math.sin(a)*(H/2-6)*0.6),len=4+Math.floor(ah(o.y,i,2)*6);for(let k=0;k<len;k++)R(x,y0+k,1,1,k<len-1?AP.root:AP.rootHi)}
    [[-W/2-1,-4],[W/2-3,-6],[-6,-H/2-1],[8,H/2-2]].forEach(([dx,dy])=>{R(cx+dx,cy+dy,5,3,AP.out);R(cx+dx+1,cy+dy,3,2,AP.ggTuft)});return}
  if(k==='burrow'){
    // The back hole: a narrow burrow mouth under a tree root, where the rat tunnel climbs out into the woods.
    const cx=X+W/2,cy=Y+H/2+4;shadow(X+2,Y+H-4,W-4,3);
    R(cx-12,cy-7,24,13,AP.out);R(cx-11,cy-6,22,11,'#3a2e22');R(cx-8,cy-4,16,8,AP.out);R(cx-7,cy-3,14,7,'#050404');
    R(cx-14,cy-9,28,3,AP.out);R(cx-13,cy-8,26,1,AP.trunk);R(cx-13,cy-9,8,1,AP.trunkHi); // the root arching over it
    R(cx+6,cy+5,7,3,AP.caveHi);R(cx-12,cy+5,5,2,AP.earthFace);return}
  if(k==='light_shaft'){
    // A crack of daylight from above: paler dirt and a few pale specks (the beam and dust are lit live).
    for(let y=-6;y<=6;y++)for(let x=-9;x<=9;x++){if(x*x/81+y*y/36>1)continue;if(ah(X+x,Y+y,7)<0.35)R(X+8+x,Y+8+y,1,1,'#4a3e30')}
    R(X+6,Y+7,2,1,'#6a5a46');R(X+10,Y+10,1,1,'#6a5a46');return}
  if(k==='gnaw_pile'){
    // Old Gnawbone's pile: a big heap of gnawed bones, a torn sack and a helmet. Touching it will summon him (later, with a severed paw).
    shadow(X+1,Y+H-5,W-2,5);
    for(let y=-11;y<=10;y++)for(let x=-15;x<=15;x++){const d=x*x/225+(y-2)*(y-2)/100;if(d>1)continue;R(X+16+x,Y+16+y,1,1,d>0.85?AP.out:AP.boneDk)}
    for(let i=0;i<22;i++){const x=X+4+Math.floor(ah(o.x,i,31)*24),y=Y+9+Math.floor(ah(o.y,i,32)*14);R(x,y,3+(i%3),1,AP.bone);R(x,y+1,1,1,AP.out)}
    R(X+18,Y+6,7,6,AP.out);R(X+19,Y+7,5,4,AP.bone);R(X+20,Y+9,1,1,AP.out);R(X+22,Y+9,1,1,AP.out); // skull on top
    R(X+5,Y+14,8,6,AP.out);R(X+6,Y+15,6,4,'#6b5a3a');R(X+6,Y+15,6,1,'#8a7650'); // torn sack
    R(X+24,Y+18,6,4,AP.out);R(X+25,Y+19,4,2,AP.stoneDk);R(X+25,Y+19,4,1,AP.stoneHi);return} // a dented helmet
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

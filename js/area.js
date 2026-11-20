// Areas built from text maps (js/data/maps): reads the map, paints its pixel-art ground once, and lists its lights, spawns and exits.
'use strict';
/* ---------- Reading the tables and a map file ---------- */
const AREA_TILES={},AREA_OBJS={};
TILESET.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_TILES[p[0]]={name:p[1],walk:p[2]==='1',tags:p.slice(4)}});
OBJECTS.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_OBJS[p[0]]={w:+p[1],h:+p[2],blocks:p[3]==='1',light:+p[7]}});
// Map file mob names -> mob types in js/data/mobs.js. The Skeleton King uses Boss 1 until he has his own data.
const AREA_MOBS={corpse:'dead',rat:'rat',beetle:'beetle',crypt_rat:'crat',skeleton:'cskel',skeleton_king:'boss1',tunnel_rat:'trat',big_rat:'brat',old_gnawbone:'gnaw',ironshell:'ironshell',pale_rat:'palerat',weeping_bride:'bride',blight_wolf:'wolf',thornback_boar:'boar',greyfang:'greyfang',old_scar:'oldscar'};
const AREAS={}; // built once, the first time you enter
// Zone ids that are built from map files (the old 'gy' id is kept so explored maps carry over).
const AREA_OF={gy:'graveyard',crypt:'crypt',cross:'crossroads',tunnel:'rat_tunnel',wolf:'wolfwood'},ZONE_OF={graveyard:'gy',crypt:'crypt',crossroads:'cross',rat_tunnel:'tunnel',wolfwood:'wolf'};
// Each map's light: how bright the dark is (amb) and the colour of the night over it. Shared by render.js and the minimap.
const AREA_TINT={moonlit:{amb:0.44,col:'3,12,14',text:'#9fd8c0'},crypt:{amb:0.22,col:'2,4,14',text:'#9fb4ee'},dusk:{amb:0.5,col:'14,8,4',text:'#ffd8a0'},earth:{amb:0.34,col:'6,8,8',text:'#c8b89a'},wood:{amb:0.42,col:'6,12,8',text:'#c8dca0'}};
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
      if(k==='named'){A.named.push({x:+p[3],y:+p[4],name:p[1],sp:sp,summon:opt('summon'),key:opt('key')});
        // A wandering named (v0.39, Greyfang): walks its route loop; pack=N wolves walk with it and fight as one group.
        const rt=opt('route');if(rt)sp.route=rt.split(';').map(q=>{const c=q.split(',');return{x:px(+c[0]),y:py(+c[1])}});
        const pk=+opt('pack')||0;if(pk){sp.group='pack_'+p[1];for(let i=0;i<pk;i++){const f={type:'wolf',x:sp.x+(i?14:-14),y:sp.y+8,timer:0,mob:null,group:sp.group,lv:[sp.lv[0]-1,sp.lv[0]-1],follow:sp,fo:{x:i?14:-14,y:8}};A.spawns.push(f)}}}
        // Packs (wolves): spawns of a pack type standing within 3 tiles of one another fight together.
        else if(TYPES[sp.type]&&TYPES[sp.type].pack){const mate=A.spawns.find(o=>o!==sp&&o.type===sp.type&&!o.follow&&Math.hypot(o.x-sp.x,o.y-sp.y)<=3*T);
          sp.group=mate?(mate.group=mate.group||'pk'+A.spawns.indexOf(mate)):null}}
    else if(k==='exit')A.exits.push({name:p[1],tx:+p[2],ty:+p[3],to:(p.find(s=>s.indexOf('to=')===0)||'to=?').slice(3),at:(p.find(s=>s.indexOf('at=')===0)||'at=').slice(3)}); // at = the exit you arrive by on the other side
    else if(k==='critter')(A.critDefs=A.critDefs||[]).push({kind:p[1],x:+p[2]*T,y:+p[3]*T,n:+p[4]||1,high:p.indexOf('high')>0}); // small living things (v0.49, world.js)
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
    if(o.kind==='flowers'){A.lights.push({x:o.x*T+12,y:o.y*T+2,r:20,w:18});A.flames.push({x:o.x*T+12,y:o.y*T+2,big:0,tiny:1})} // a mourner's candle (v0.49)
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
  flr:'#2a2733',cave:['#3a3127','#362e25','#3e3429','#332b22'],caveHi:'#4c4032',caveDk:'#1f1a15',earth:'#0e0b09',earthHi:'#2a221a',earthFace:'#57442f',earthFace2:'#3e3024',root:'#5a4632',rootHi:'#7a6248',fungus:'#c9c2a8',fungusDk:'#8f8a76',plank:'#6a5038',plankHi:'#8a6a4a',plankDk:'#3e2c1e',flr2:'#26232e',flrHi:'#312d3b',flrLine:'#1b1922',rock:'#14121a',rockHi:'#24212c',bone:'#b9b0a0',boneDk:'#857c6e',
  // Wolfwood (v0.40, Dusk hush): needles, moss, blight, firs, boulders and the pale dead giant.
  needles:['#2c2a1e','#2f2c20','#33301f','#2a281c'],needleHi:'#4a3c26',needleDk:'#221f16',cone:'#5a4630',
  mossG:['#263420','#29381f','#2c3b22','#24311e'],mossHi:'#3a4d2c',mossDk:'#1e2a1a',
  blight:['#3a3936','#3e3d39','#42403b','#383733'],ash:'#6a675f',crack:'#2a2926',
  fern:'#3d5a32',fernHi:'#56704a',fernDk:'#2a3f24',
  firDk:'#101c17',fir:'#182b22',firHi:'#24402f',firTop:'#35563f',
  bould:'#5a5a55',bouldHi:'#7c7b73',bouldDk:'#36362f',
  bark:'#7d786e',barkHi:'#aaa498',barkDk:'#4f4b44'};

function groundCol(n,r){
  if(n==='dead_grass')return AP.dg[Math.floor(r*4)];if(n==='grass')return AP.gg[Math.floor(r*4)];
  if(n==='dirt_path'||n==='gate'||n==='broken_fence')return r<0.5?AP.path:(r<0.8?'#54473a':AP.pathHi);
  if(n==='road')return r<0.6?AP.road:'#665443';if(n==='mud')return r<0.7?AP.mud:'#2c2820';if(n==='marsh')return r<0.6?AP.marsh:'#2a3a30';
  if(n==='water')return r<0.7?AP.water:'#16293a';if(n==='cave_dirt'||n==='dirt_slope')return AP.cave[Math.floor(r*4)];if(n==='bridge')return AP.road;if(n==='moss')return AP.mossG[Math.floor(r*4)];if(Array.isArray(AP[n]))return AP[n][Math.floor(r*4)];if(n==='fern')return AP.needles[Math.floor(r*4)];if(n==='floor'||n==='stairs')return r<0.5?AP.flr:(r<0.8?AP.flr2:AP.flrHi);return AP.dg[0]}
/* ---------- Water with natural edges (v0.52, owner Nov 20: square water read like a path) ----------
   Walking still uses the square tiles; only the look changes. Each tile is 1 (water) or 0 (land) at its centre; blending
   those across the tile and adding two layers of slow wobble gives one smooth shape whose banks curve across tile lines.
   v below 0 is land, above 0 is water; the bigger v, the deeper. Rules in docs/area-rules.md (Natural shapes). */
// The same smooth noise from a pre-filled grid of lattice values: far faster when a whole area is painted pixel by pixel.
function noiseGrid(W,H,p,s){const nx=Math.ceil(W/p)+2,ny=Math.ceil(H/p)+2,L=new Float32Array(nx*ny);for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)L[j*nx+i]=ah(i,j,s);
  return (x,y)=>{const u=x/p,v=y/p,i=u|0,j=v|0,fx=u-i,fy=v-j,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),k=j*nx+i,a=L[k],b=L[k+1],c=L[k+nx],d=L[k+nx+1];
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}}
function waterField(A,groundOf){
  const wet=[];for(let y=0;y<A.h;y++){wet[y]=[];for(let x=0;x<A.w;x++)wet[y][x]=groundOf(x,y)==='water'?1:0}
  const m=(x,y)=>wet[Math.max(0,Math.min(A.h-1,y))][Math.max(0,Math.min(A.w-1,x))];
  const N1=noiseGrid(A.w*T+16,A.h*T+16,40,201),N2=noiseGrid(A.w*T+16,A.h*T+16,13,202);
  const dry=new Set(['road','dirt_path','gate','floor','stairs']); // never let water creep onto a road or a built floor
  const bl=(px,py)=>{const u=(px+0.5)/T-0.5,v=(py+0.5)/T-0.5,i=Math.floor(u),j=Math.floor(v),fx=u-i,fy=v-j;
    return m(i,j)*(1-fx)*(1-fy)+m(i+1,j)*fx*(1-fy)+m(i,j+1)*(1-fx)*fy+m(i+1,j+1)*fx*fy};
  return (px,py)=>{const tx=Math.floor(px/T),ty=Math.floor(py/T);
    if(!wet[ty]||wet[ty][tx]===undefined)return -1;
    if(!wet[ty][tx]&&dry.has(groundOf(tx,ty)))return -1;
    // Averaging a small square of blended samples turns a staircase of tiles into a slope.
    let f=0;for(let sy=-6;sy<=6;sy+=6)for(let sx=-6;sx<=6;sx+=6)f+=bl(px+sx,py+sy);f/=9;
    return f-0.5+(N1(px,py)-0.5)*0.5+(N2(px,py)-0.5)*0.22}}
function paintWater(A,g,groundOf){
  const V=waterField(A,groundOf);A.wetV=V;
  const near=[];for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){let n=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const a=x+i,b=y+j;if(a>=0&&b>=0&&a<A.w&&b<A.h&&groundOf(a,b)==='water')n=1}if(n)near.push([x,y])}
  if(!near.length)return;
  const W=A.w*T,H=A.h*T,img=g.getImageData(0,0,W,H),d=img.data;
  const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const C={};const col=h=>C[h]||(C[h]=rgb(h));
  const put=(x,y,h)=>{const c=col(h),k=(y*W+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255};
  const cave=A.tint==='earth',NB=noiseGrid(W+16,H+16,24,204),N9=noiseGrid(W+16,H+16,9,205),N11=noiseGrid(W+16,H+16,11,206);
  // The land a water tile's dry bits belong to: the neighbour on that side, else any land next to it.
  const bankOf=(tx,ty,ox,oy)=>{const sx=ox<8?-1:1,sy=oy<8?-1:1;for(const [dx,dy] of [[sx,0],[0,sy],[sx,sy],[-sx,0],[0,-sy],[-sx,-sy],[sx,-sy],[-sx,sy]]){const n=groundOf(tx+dx,ty+dy);if(n!=='water')return n}return cave?'cave_dirt':'mud'};
  near.forEach(([tx,ty])=>{const isW=groundOf(tx,ty)==='water';
    for(let oy=0;oy<T;oy++)for(let ox=0;ox<T;ox++){const px=tx*T+ox,py=ty*T+oy,v=V(px,py);
      const bankW=0.07+0.13*NB(px,py); // the wet strip changes width along the bank
      if(v<0){
        if(v>-bankW)put(px,py,cave?(ah(px,py,5)<0.5?'#2a231b':'#241e17'):(ah(px,py,5)<0.6?AP.mud:(ah(px,py,6)<0.5?'#2c2820':AP.mudDk))); // wet mud
        else if(isW)put(px,py,groundPatch(bankOf(tx,ty,ox,oy),px,py)); // land biting into a water tile
        continue}
      let c;
      if(v<0.03)c='#0d1a22';                                               // dark wet rim right at the edge
      else if(V(px,py-3)<0||V(px,py-2)<0)c='#0f1e28';                      // the north bank's shadow on the water (3/4 view)
      else if(v<0.11)c=ah(px,py,7)<0.55?'#1d3842':'#1a333e';               // shallows, a touch lighter and greener
      else if(v<0.2)c=ah(px,py,8)<0.5?'#16293a':AP.water;                  // stepping down
      else c=v>0.42&&N9(px,py)<0.5?'#0f202b':(N11(px,py)<0.45?'#16293a':AP.water); // deep, in soft patches
      put(px,py,c)}});
  g.putImageData(img,0,0);
  // Bank details on top: pebbles in the wet strip, reeds in clumps, lily pads in still water, light catching the deep.
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};const dead=A.tint==='moonlit';
  near.forEach(([tx,ty])=>{for(let i=0;i<8;i++){const x=tx*T+Math.floor(ah(tx,ty,300+i)*16),y=ty*T+Math.floor(ah(tx,ty,320+i)*16),v=V(x,y),r=ah(tx,ty,340+i);
    if(v<0&&v>-0.12&&r<0.12){R(x,y+1,3,1,AP.out);R(x,y,3,1,AP.stoneDk);R(x,y,1,1,AP.stone)}                                  // a pebble at the waterline
    else if(!cave&&v>-0.16&&v<0.06&&r>0.12&&r<0.34){const n=2+Math.floor(ah(x,y,9)*3);                                    // a clump of reeds
      for(let k=0;k<n;k++){const rx=x+k*2-n,h=3+Math.floor(ah(x+k,y,10)*3);R(rx,y-h+1,1,h,dead?'#5e5638':AP.reed);R(rx,y-h+1,1,1,dead?'#8a7d52':AP.reedHi)}
      if(dead&&r<0.18)R(x,y-6,1,2,'#3b2a1e')}
    else if(!cave&&!dead&&v>0.14&&v<0.32&&r>0.9){R(x,y,4,2,'#2a4228');R(x+1,y,2,1,'#3d5a32');R(x+2,y+1,1,1,'#0f1e28')}   // a lily pad with its notch
    else if(v>0.2&&r>0.5&&r<0.75){R(x,y,3,1,AP.waterHi);if(r<0.53)R(x+1,y,1,1,AP.glint)}}});
}
/* ---------- Ground with natural edges (v0.54, owner Nov 20: give the ground the same treatment as the water) ----------
   Same idea as the water: each tile's ground counts fully at its centre and fades toward its neighbours; a little wobble
   plus a nudge per ground decides which one shows at each pixel. Natural ground (grass, dead grass, mud, marsh, needles,
   moss, blight, worn paths) meets in loose curves; built ground (roads, floors, stairs, flagstones) keeps a near-straight,
   tidy edge, because people made it. Walking still uses the tiles. Rules in docs/area-rules.md (Natural shapes). */
const BUILT_GROUND=new Set(['road','floor','stairs','flagstone','dirt_slope','bridge']);
// One ground's colour at a pixel: the 8 x 8 colour patches are wobbled a little so they never line up in a checker grid
// (built floors keep their tidy patches).
let PATCH_NX=null,PATCH_NY=null; // set per area by paintGround (noise grids sized to the area)
function groundPatch(n,px,py){if(BUILT_GROUND.has(n)||!PATCH_NX)return groundCol(n,ah(px>>3,py>>3,1));
  const qx=px+Math.round((PATCH_NX(px,py)-0.5)*7),qy=py+Math.round((PATCH_NY(px,py)-0.5)*7);return groundCol(n,ah(qx>>3,qy>>3,1))}
// A ground's small detail (tuft, pebble, reed...) for the bits of ground that spill over a tile line.
function groundDetail(R,n,x,y,r){
  if(n==='grass')R(x,y,1,2,r<0.5?AP.ggTuft:AP.ggTuft2);else if(n==='dead_grass')R(x,y,1,2,AP.dgTuft);
  else if(n==='dirt_path'||n==='gate'||n==='broken_fence')R(x,y,1,1,AP.pebble);else if(n==='road')R(x,y,1,1,AP.roadHi);
  else if(n==='mud')R(x,y,3,1,AP.mudDk);else if(n==='marsh'){R(x,y-2,1,3,AP.reed);R(x,y-2,1,1,AP.reedHi)}
  else if(n==='needles')R(x,y,2,1,AP.needleHi);else if(n==='moss')R(x,y,3,2,AP.mossHi);else if(n==='blight')R(x,y,1,1,AP.ash);
  else if(n==='cave_dirt')R(x,y,1,1,AP.caveHi)}
function paintGround(A,g,groundOf){
  const W=A.w*T,H=A.h*T,types=[],tid={},id=n=>tid[n]!==undefined?tid[n]:(tid[n]=types.push(n)-1);
  const tt=[];for(let y=0;y<A.h;y++){tt[y]=[];for(let x=0;x<A.w;x++)tt[y][x]=id(groundOf(x,y))}
  const WATER=id('water'),tm=(x,y)=>tt[y<0?0:y>=A.h?A.h-1:y][x<0?0:x>=A.w?A.w-1:x];
  // Each ground's colours, looked up by patch roll in 20 steps (exact for groundCol's thresholds), packed for a fast write.
  const pack=h=>(255<<24)|(parseInt(h.slice(5,7),16)<<16)|(parseInt(h.slice(3,5),16)<<8)|parseInt(h.slice(1,3),16);
  const pal=types.map(n=>{const a=new Uint32Array(20);for(let b=0;b<20;b++)a[b]=pack(groundCol(n,(b+0.5)/20));return a});
  const built=types.map(n=>BUILT_GROUND.has(n));
  // Paths and roads are thin: a small head start keeps a one-tile path joined where its tiles only touch at the corners.
  const thin=types.map(n=>n==='dirt_path'||n==='gate'||n==='broken_fence'||n==='road'||n==='bridge'?0.16:0);
  const at=new Uint8Array(W*H),img=g.createImageData(W,H),d32=new Uint32Array(img.data.buffer);
  const NX=noiseGrid(W,H,18,401),NY=noiseGrid(W,H,18,402),NT=types.map((n,c)=>noiseGrid(W+16,H+16,12,500+c));
  const PX=noiseGrid(W+16,H+16,10,403),PY=noiseGrid(W+16,H+16,10,404);PATCH_NX=PX;PATCH_NY=PY;
  const wsum=new Float32Array(types.length),seen=new Int32Array(4);
  const CW=(W>>3)+4,CH=(H>>3)+4,cell=new Uint8Array(CW*CH);for(let j=0;j<CH;j++)for(let i=0;i<CW;i++)cell[j*CW+i]=Math.floor(ah(i-1,j-1,1)*20); // patch rolls, one per 8 x 8 cell
  const OFF=new Int8Array(((W>>1)+1)*((H>>1)+1)*2),OW=(W>>1)+1;for(let j=0;j*2<H;j++)for(let i=0;i*2<W;i++){const k=(j*OW+i)*2;OFF[k]=Math.round((PX(i*2,j*2)-0.5)*7);OFF[k+1]=Math.round((PY(i*2,j*2)-0.5)*7)} // patch wobble every 2 px
  for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){const t0=tt[ty][tx];
    // Only tiles with a different ground next to them need the blend (water is left to the water pass).
    let edge=false;if(t0!==WATER)for(let j=-1;j<=1&&!edge;j++)for(let i=-1;i<=1;i++){const n=tm(tx+i,ty+j);if(n!==t0&&n!==WATER){edge=true;break}}
    const anyB=built[t0]||built[tm(tx-1,ty)]||built[tm(tx+1,ty)]||built[tm(tx,ty-1)]||built[tm(tx,ty+1)],aw=anyB?2:4;
    for(let oy=0;oy<T;oy++)for(let ox=0;ox<T;ox++){const px=tx*T+ox,py=ty*T+oy;let t=t0;
      if(edge){
        const qx=px+(NX(px,py)-0.5)*2*aw,qy=py+(NY(px,py)-0.5)*2*aw,u=(qx+0.5)/T-0.5,v=(qy+0.5)/T-0.5,i=Math.floor(u),j=Math.floor(v),fx=u-i,fy=v-j;
        let ns=0;
        for(let k=0;k<4;k++){let c=tm(i+(k&1),j+(k>>1));if(c===WATER)c=t0;const w=(k&1?fx:1-fx)*(k>>1?fy:1-fy);
          let f=-1;for(let q=0;q<ns;q++)if(seen[q]===c)f=q;if(f<0){seen[ns++]=c;wsum[c]=0}wsum[c]+=w}
        if(ns>1){let best=-9;for(let q=0;q<ns;q++){const c=seen[q],amp=built[c]||built[t0]?0.2:thin[c]||thin[t0]?0.3:0.5,sc=wsum[c]+thin[c]+(NT[c](px,py)-0.5)*amp;if(sc>best){best=sc;t=c}}}
        else t=seen[0]}
      at[py*W+px]=t;
      // The colour patch: 8 x 8 blocks, wobbled for natural ground so they don't form a checker grid.
      let cx=px,cy=py;if(!built[t]){const k=((py>>1)*OW+(px>>1))*2;cx+=OFF[k];cy+=OFF[k+1]}
      d32[py*W+px]=pal[t][cell[((cy>>3)+1)*CW+(cx>>3)+1]]}}
  g.putImageData(img,0,0);
  return {types:types,at:at}}
const EDGE_STRIP=160; // game pixels of edge ground kept for the mirror past the map edge (more than the camera ever shows)
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
    if(A.tint==='wood')return n==='dead_tree'?'blight':'needles'; // firs and boulders on needles, dead trees in the blight
    return 'dead_grass'};
  const groundOf=(x,y)=>{x=Math.max(0,Math.min(A.w-1,x));y=Math.max(0,Math.min(A.h-1,y));const t=AREA_TILES[tile(x,y)];return t.name==='bridge'?'water':t.walk||t.name==='water'?t.name:under(x,y)};

  // 1) Ground (v0.54): every pixel picks its ground from a smooth blend of the tiles around it, so grounds meet in natural
  // curves instead of tile squares; colour patches are wobbled so they don't line up in a checker grid. Then tufts and pebbles.
  const eg=paintGround(A,g,groundOf);const egAt=(x,y)=>eg.types[eg.at[Math.max(0,Math.min(A.h*T-1,y))*A.w*T+Math.max(0,Math.min(A.w*T-1,x))]];
  for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){
    const gname=groundOf(tx,ty),bx=tx*T,by=ty*T;
    const R0=R;{const R=(x,y,w,h,col)=>{if(w>2||h>4||egAt(x,y)===gname)R0(x,y,w,h,col)}; // a tuft only where its own ground shows
    for(let i=0;i<6;i++){const r1=ah(tx,ty,10+i),r2=ah(tx,ty,30+i),x=bx+Math.floor(r1*15),y=by+Math.floor(r2*15);
      if(gname==='dead_grass'){if(i<3){R(x,y,1,2,AP.dgTuft);if(i===0)R(x+1,y+1,1,1,AP.dgTuft)}else if(i===3&&r1<0.4)R(x,y,1,1,AP.dgDot)
        // Heart pass (v0.49): fallen leaves, a dry twig now and then, a pale pebble
        else if(i===4&&r1<0.2){R(x,y,2,1,'#4a3424');R(x+1,y-1,1,1,'#5a3e28')}else if(i===5&&r1<0.06){R(x,y,3,1,AP.trunkHi);R(x+2,y-1,1,1,AP.trunkHi)}else if(i===5&&r1<0.1)R(x,y,1,1,AP.stone)}
      else if(gname==='grass'){if(i<4){R(x,y,1,2,i%2?AP.ggTuft:AP.ggTuft2);if(i===1)R(x+1,y,1,1,AP.ggTuft)}}
      else if(gname==='dirt_path'||gname==='gate'){if(i<3)R(x,y,1,1,AP.pebble);else if(i===3)R(x,y,2,1,'#4a3e32')}
      else if(gname==='road'){if(i<3)R(x,y,1,1,AP.roadHi);if(i===4)R(bx,by+4,16,1,AP.rut);if(i===5)R(bx,by+11,16,1,AP.rut)}
      else if(gname==='mud'){if(i<2)R(x,y,3,1,AP.mudDk);if(i===2&&r1<0.3)R(x,y,1,1,'#3a4a50')}
      else if(gname==='marsh'){const dead=A.tint==='moonlit'; // reeds inside the graveyard are dead and tan, with a few seed heads (v0.49)
        if(i<3){R(x,y-2,1,3,dead?'#5e5638':AP.reed);R(x,y-2,1,1,dead?'#8a7d52':AP.reedHi);if(dead&&i===0&&r1<0.5)R(x,y-4,1,2,'#3b2a1e')}else if(i===3)R(x,y,3,1,AP.water)}
      else if(gname==='water'){if(i<2)R(x,y,3,1,AP.waterHi);if(i===2&&r1<0.15)R(x,y,1,1,AP.glint)}
      else if(gname==='floor'){if(i===0){R(bx,by+15,16,1,AP.flrLine);R(bx+((ty%2)?7:15),by,1,16,AP.flrLine)}else if(i===1&&r1<0.3)R(x,y,3,1,AP.flrLine);else if(i===2&&r1<0.2)R(x,y,1,1,AP.boneDk)}
      else if(gname==='cave_dirt'){const wallAbove=AREA_TILES[tile(tx,ty-1)||'d'].tags.indexOf('wall')>=0;
        if(i<2)R(x,y,1,1,AP.caveHi);else if(i===2)R(x,y,2,1,AP.caveDk);
        // pale mushrooms and hanging roots along the foot of the walls; drips darken the dirt
        else if(i===3&&wallAbove&&r1<0.35){R(x,by+2,2,1,AP.fungus);R(x,by+3,1,1,AP.fungusDk);R(x+3,by+3,1,1,AP.fungus)}
        else if(i===4&&r1<0.2)R(x,y,2,2,'#251f19')}
      else if(gname==='dirt_slope'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#3a3026':'#463a2c');R(bx,by+k*4,16,1,AP.root)}R(bx+3,by,1,16,AP.root);R(bx+11,by+2,1,14,AP.rootHi)}
      // Wolfwood floor (v0.40): rusty needles, soft moss, grey blight with ash and cracks, ferns.
      else if(gname==='needles'){if(i<4){R(x,y,2,1,i%2?AP.needleHi:AP.needleDk)}else if(i===4&&r1<0.25)R(x,y,1,1,AP.cone)}
      else if(gname==='moss'){if(i<2)R(x,y,3,2,AP.mossHi);else if(i===2)R(x,y,2,1,AP.mossDk);else if(i===3&&r1<0.3)R(x,y,1,1,'#7a8a4a')}
      else if(gname==='blight'){if(i<2)R(x,y,1,1,AP.ash);else if(i===2&&r1<0.5){R(x,y,3,1,AP.crack);R(x+2,y+1,2,1,AP.crack)}else if(i===3&&r1<0.2)R(x,y,2,1,AP.boneDk)}
      else if(gname==='fern'){if(i<3){const fx=x,fy=y;R(fx,fy,1,4,AP.fernDk);R(fx-2,fy+1,2,1,AP.fern);R(fx+1,fy+1,2,1,AP.fern);R(fx-1,fy+2,1,1,AP.fern);R(fx+1,fy+2,1,1,AP.fern);R(fx,fy-1,1,1,AP.fernHi)}}
      else if(gname==='stairs'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#1c1a24':'#24212c');R(bx,by+k*4,16,1,'#3a3545')}}
    }
    }
    // Where a neighbour's ground spills into this tile, give it that ground's own little details too.
    for(let i=0;i<4;i++){const x=bx+Math.floor(ah(tx,ty,60+i)*16),y=by+Math.floor(ah(tx,ty,70+i)*16),e=egAt(x,y);if(e!==gname)groundDetail(R,e,x,y,ah(tx,ty,80+i))}
    // Tree variety (v0.50): seedlings, small ferns and fallen twigs on open ground beside trees, so a wood has something growing between the trunks.
    // Ground only: you walk over them, and the trees still draw over them.
    {const nb=m=>[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>name(tx+dx,ty+dy)===m);const here=name(tx,ty);
     if(here==='grass'&&nb('tree')&&ah(tx,ty,120)<0.3){const x=bx+2+Math.floor(ah(tx,ty,121)*11),y=by+4+Math.floor(ah(tx,ty,122)*9);
       if(ah(tx,ty,123)<0.5){R(x,y-3,1,4,AP.out);R(x,y-2,1,3,AP.trunkHi);R(x-2,y-4,2,2,AP.leafHi);R(x+1,y-5,2,2,AP.leafTop);R(x-1,y-6,2,1,AP.leafHi)} // a seedling
       else{R(x-2,y,5,1,AP.fernDk);R(x-3,y-1,2,1,AP.fern);R(x+2,y-1,2,1,AP.fern);R(x-1,y-2,1,2,AP.fernHi);R(x+1,y-2,1,2,AP.fern);R(x,y-3,1,3,AP.fernHi)}} // a little fern
     else if(here==='dead_grass'&&nb('dead_tree')&&ah(tx,ty,124)<0.18){const x=bx+3+Math.floor(ah(tx,ty,125)*8),y=by+5+Math.floor(ah(tx,ty,126)*8),fl=ah(tx,ty,127)<0.5?1:-1;
       for(let i=0;i<6;i++){R(x+i,y+Math.floor(i*fl/3),1,1,AP.out);R(x+i,y-1+Math.floor(i*fl/3),1,1,i<2?AP.trunkHi:AP.trunk)}R(x+3,y-2+(fl>0?1:-1),1,1,AP.twig)}} // a fallen branch
    // Heart pass (v0.49): leaves drift under the dead trees.
    if(gname==='dead_grass'&&[[0,1],[0,-1],[1,0],[-1,0],[0,0]].some(([dx,dy])=>name(tx+dx,ty+dy)==='dead_tree'))for(let i=0;i<4;i++){const x=bx+Math.floor(ah(tx,ty,100+i)*15),y=by+Math.floor(ah(tx,ty,110+i)*15);R(x,y,2,1,i%2?'#4a3424':'#5e4026')}
  }

  // 1b) Water with natural edges (v0.52): drawn over the square tiles as one smooth shape, then the bank details.
  paintWater(A,g,groundOf);
  for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){const gname=groundOf(tx,ty),bx=tx*T,by=ty*T;
    // The Sunken Graveyard lives up to its name: old headstones lean up out of the flooded water, each with its waterline.
    // Only in water with no living grass nearby, so none turn up in the creek outside the fence.
    if(gname==='water'&&A.tint==='moonlit'&&ah(tx,ty,95)<0.12&&A.wetV(bx+3,by+12)>0.08&&A.wetV(bx+13,by+12)>0.08&&A.wetV(bx+8,by+4)>0.08&&!(()=>{for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(name(tx+dx,ty+dy)==='grass'||name(tx+dx,ty+dy)==='tree')return 1})()){
      const lean=ah(tx,ty,96)<0.5?-1:1,X=bx+4,Y=by+3,cross=ah(tx,ty,97)<0.3;
      const S=(x,y,w,h,col)=>{for(let j=0;j<h;j++)R(X+x+(y+j<3?lean:0),Y+y+j,w,1,col)};
      if(cross){S(3,0,4,9,AP.out);S(1,2,8,3,AP.out);S(4,1,2,7,AP.stoneDk);S(2,3,6,1,AP.stoneDk);S(4,1,1,7,AP.stone)}
      else{S(1,1,8,8,AP.out);S(2,0,6,1,AP.out);S(2,1,6,7,AP.stoneDk);S(2,1,2,7,AP.stone);if(ah(tx,ty,98)<0.6)S(3,1,3,1,AP.moss)}
      R(bx+2,Y+8,12,1,AP.waterHi);R(bx+4,Y+9,8,1,'#0d1a22');R(bx+3,Y+10,4,1,'#1b3442')}
  }

  // Ground-only copies of the top and bottom edges, taken before any scenery: render mirrors these past the map edge so the
  // strip under the top bars (or the spell grid) shows ground carrying on, never black and never a doubled building (v0.55).
  {const E=Math.min(H,EDGE_STRIP),cut=y=>{const e=document.createElement('canvas');e.width=W;e.height=E;e.getContext('2d').drawImage(c,0,y,W,E,0,0,W,E);return e};
    c.edgeTop=cut(0);c.edgeBot=cut(H-E);}

  // 2) Scenery and objects, row by row. Objects are drawn when we reach their bottom row so trees in front cover them.
  const objsByRow={};A.objs.forEach(o=>{const r=o.y+o.h-1;(objsByRow[r]=objsByRow[r]||[]).push(o)});
  for(let ty=0;ty<A.h;ty++){
    for(let tx=0;tx<A.w;tx++){
      const n=name(tx,ty),bx=tx*T,by=ty*T;
      if(n==='tree'||n==='dead_tree'||n==='fir'){const im=pickTree(A,n,tx,ty); // v0.50: kinds, sizes and shades per area (tree variety)
        g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(bx+8+im.shx,by+14,im.sh,Math.max(2,Math.round(im.sh/3)),0,0,7);g.fill();
        A.trees.push(treeAt(im,bx,by,by+13))}
      else if(n==='boulder')drawBoulder(R,bx,by,name(tx,ty-1)!=='boulder',ah(tx,ty,16));
      else if(n==='bush'||n==='dead_bush')drawBush(R,bx,by,n==='dead_bush',ah(tx,ty,5));
      else if(n==='grave')drawGrave(R,bx,by,ah(tx,ty,6),tx,ty);
      else if(n==='dug_grave')drawDug(R,bx,by,ah(tx,ty,7));
      else if(n==='rubble')drawRubble(R,bx,by,ah(tx,ty,8));
      else if(n==='rock')drawRock(R,bx,by,name(tx,ty+1)!=='rock'&&ty+1<A.h,name(tx,ty-1)!=='rock'&&ty>0,ah(tx,ty,9));
      else if(n==='bones')drawBones(R,bx,by,ah(tx,ty,11));
      else if(n==='earth_wall'||n==='rat_hole'){const solid=(x,y)=>{const m=name(x,y);return !m||m==='earth_wall'||m==='rat_hole'};drawEarth(R,bx,by,!solid(tx,ty+1),!solid(tx,ty-1),n==='rat_hole',ah(tx,ty,13))}
      else if(n==='dirt_pile')drawDirtPile(R,bx,by,ah(tx,ty,14));
      else if(n==='bridge')drawBridge(R,bx,by,name(tx,ty-1)!=='bridge',name(tx,ty+1)!=='bridge');
      else if(n==='coffin')drawCoffin(R,bx,by,ah(tx,ty,12));
      else if(n==='iron_fence'||n==='fence_grate'){const isF=(x,y)=>{const m=name(x,y);return m==='iron_fence'||m==='fence_grate'||m==='gate'||m==='broken_fence'};
        drawFence(R,bx,by,isF(tx-1,ty),isF(tx+1,ty),isF(tx,ty-1),isF(tx,ty+1),n==='fence_grate',tx,ty);
        // A fence panel that came down in the creek lies half-sunk in the water just outside the grate (owner, Nov 20).
        if(n==='fence_grate'&&name(tx+1,ty)==='water')drawSunkPanel(R,bx+16,by)}
      else if(n==='gate'){const pillarUp=name(tx,ty-1)==='iron_fence',pillarDn=name(tx,ty+1)==='iron_fence',pL=name(tx-1,ty)==='iron_fence',pR=name(tx+1,ty)==='iron_fence';
        if(pillarUp)drawPillar(R,bx+4,by-10);if(pL)drawPillar(R,bx-3,by-6);if(pR)drawPillar(R,bx+11,by-6);
        if(pillarDn){drawPillar(R,bx+4,by+4);R(bx+3,by+14,1,1,AP.out)}
        // An open gate leaf swung back against the fence.
        if(pillarUp){R(bx+7,by-2,1,10,AP.ironHi);R(bx+9,by-2,1,10,AP.ironHi);R(bx+7,by-2,3,1,AP.ironTip)}}
      else if(n==='broken_fence'){const isF=(x,y)=>{const m=name(x,y);return m==='iron_fence'||m==='fence_grate'||m==='broken_fence'};
        const isI=(x,y)=>{const m=name(x,y);return m==='iron_fence'||m==='fence_grate'},isB=(x,y)=>name(x,y)==='broken_fence';
        // Panel goes on one tile of the gap: a gap one tile long always has it; in a longer gap the seed of its first tile picks.
        const hz=isI(tx-1,ty)||isI(tx+1,ty)||isB(tx-1,ty)||isB(tx+1,ty),first=hz?!isB(tx-1,ty):!isB(tx,ty-1),solo=hz?!isB(tx-1,ty)&&!isB(tx+1,ty):!isB(tx,ty-1)&&!isB(tx,ty+1);
        const g0=first?ah(tx,ty,80):(hz?ah(tx-1,ty,80):ah(tx,ty-1,80)),panel=solo||(first?g0<0.5:g0>=0.5);
        drawBrokenFence(R,bx,by,isI(tx-1,ty),isI(tx+1,ty),isI(tx,ty-1),isI(tx,ty+1),hz,panel)}
    }
    (objsByRow[ty]||[]).forEach(o=>{
      if(o.kind==='dead_oak'){const X=o.x*T,Y=o.y*T,base=Y+o.h*T-1;g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(X+T+2,base,20,6,0,0,7);g.fill();
        A.trees.push(treeAt(treeImg('oak',0),X+T/2,Y+(o.h-1)*T,base-2));return}
      if(o.kind==='giant_tree'){const X=o.x*T,Y=o.y*T,base=Y+o.h*T-1;g.fillStyle='rgba(0,0,0,0.4)';g.beginPath();g.ellipse(X+o.w*T/2,base-2,40,9,0,0,7);g.fill();
        A.trees.push(treeAt(treeImg('giant',0),X,Y+(o.h-1)*T,base-2));return}
      drawObj(g,R,o)});
  }
  // Chests are drawn each frame in render.js (drawChests), since they open and fill again.
  return c;
}

/* ---------- Trees (v0.30, variety v0.50): drawn on their own pictures and sorted with characters so you walk behind them ---------- */
// Each tree picture has an anchor: (ox,oy) is where its trunk tile's top-left corner sits inside the picture.
// A tree's sort line (sy) is the foot of its trunk: anyone standing north of it is behind the tree.
// v0.50 (owner: "it's literally the same trees surrounding us"): a wood is now several kinds of tree growing in stands,
// in three sizes, each crown a touch warmer or cooler than its neighbours. Everything is picked from the tile's position,
// so the map files don't change and a tree always looks the same.
const TREE_IMGS={};
const TREE_BOX={live:[92,104,38,80],dead:[92,104,38,80],oak:[96,112,40,80],giant:[150,176,43,156]}; // picture width, height, ox, oy
// Which living trees grow in each area's light, and how common each is.
const TREE_MIX={dusk:[['oak',0.5],['birch',0.25],['poplar',0.25]],moonlit:[['oak',0.55],['poplar',0.3],['birch',0.15]],wood:[['oak',0.6],['birch',0.4]]};
const TREE_MIX_DEF=[['oak',0.5],['birch',0.25],['poplar',0.25]];
// Leaf colours per kind: [dark, base, lit, top].
const LEAVES={oak:['#1a2618','#223020','#3a4d33','#56704a'],birch:['#1e2a1a','#2b3a22','#4a5e36','#6e8450'],poplar:['#152119','#1d2d21','#31473a','#4b654f']};
// Small shade shifts from tree to tree (never a rainbow): none, warmer, cooler, a yellowing crown.
const SHADE=[[0,0,0],[6,3,-2],[-3,1,2],[11,7,-4]];
function shiftCol(hex,d){const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map((v,i)=>Math.max(0,Math.min(255,v+d[i]+(d[i]&&v>60?Math.round(d[i]*(v-60)/120):0))));
  return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')}
function pickByWeight(list,r){for(const [k,w] of list){if(r<w)return k;r-=w}return list[list.length-1][0]}
function pickTree(A,n,tx,ty){
  // Stands: neighbouring trees mostly share a kind (cells about 5 tiles across, edges wobbled), with one tree in four mixed in.
  const cx=Math.floor((tx+ah(ty,0,71)*3)/5),cy=Math.floor((ty+ah(tx,0,72)*3)/5),stand=ah(tx,ty,73)<0.75?ah(cx,cy,70):ah(tx,ty,74);
  const sz=ah(tx,ty,31),size=sz<0.14?0:sz>0.88?2:1,hr=ah(tx,ty,32),shade=hr<0.58?0:hr<0.77?1:hr<0.9?2:3,v=Math.floor(ah(tx,ty,33)*4);
  if(n==='tree')return treeImg('live',pickByWeight(TREE_MIX[A.tint]||TREE_MIX_DEF,stand),size,shade,v);
  if(n==='fir')return treeImg('fir','fir',size,shade,v);
  // Dead: mostly crooked, some leaning or forked, a few snapped-off snags and stumps.
  const d=ah(tx,ty,34);return treeImg('dead',d<0.38?'crooked':d<0.6?'lean':d<0.78?'forked':d<0.92?'snag':'stump',size,0,v);
}
function treeImg(kind,sp,size,shade,v){
  sp=sp||'';size=size===undefined?1:size;shade=shade||0;v=v||0;
  const key=[kind,sp,size,shade,v].join('|');if(TREE_IMGS[key])return TREE_IMGS[key];
  const [w,h,ox,oy]=TREE_BOX[kind==='fir'?'live':kind],c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)},r=(v+0.5)/4;
  let sh=10,shx=1;
  if(kind==='live'){const L=LEAVES[sp].map(col=>shiftCol(col,SHADE[shade]));sh=drawLiving(R,ox,oy,sp,size,L,v)}
  else if(kind==='fir'){const sc=[0.55,0.95,1.22][size]+r*0.08,P={firDk:shiftCol(AP.firDk,SHADE[shade]),fir:shiftCol(AP.fir,SHADE[shade]),firHi:shiftCol(AP.firHi,SHADE[shade]),firTop:shiftCol(AP.firTop,SHADE[shade])};
    drawFir(R,ox,oy,r,v,sc,P);sh=Math.round(5+4*sc);shx=0}
  else if(kind==='dead')sh=drawDeadTree(R,ox,oy,r,sp,size,v);
  else if(kind==='giant')drawGiant(R,ox,oy);else drawDeadOak(R,ox,oy);
  // Find the drawn part (for the "are you behind it?" check).
  const d=g.getImageData(0,0,w,h).data;let x0=w,x1=0,y0=h,y1=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  return TREE_IMGS[key]={c:c,ox:ox,oy:oy,box:[x0,y0,x1,y1],sh:sh,shx:shx};
}
function treeAt(im,bx,by,sy){const x=bx-im.ox,y=by-im.oy;return{tree:im,x:x,y:sy,px:x,py:y,b:[x+im.box[0],y+im.box[1],x+im.box[2],y+im.box[3]],a:1}}
// A leafy crown from overlapping round clumps. Each pixel takes the front-most clump over it and is lit from the upper left,
// both across the whole crown and on each clump, so the crown reads as bunches of leaves rather than one ball.
function crown(cells,blobs,L,v,gx,gy,gr){
  const put=(x,y,c)=>cells.set(x+','+y,c);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;blobs.forEach(b=>{x0=Math.min(x0,b[0]-b[2]-1);x1=Math.max(x1,b[0]+b[2]+1);y0=Math.min(y0,b[1]-b[3]-1);y1=Math.max(y1,b[1]+b[3]+1)});
  for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){
    let hit=-1;for(let i=blobs.length-1;i>=0;i--){const b=blobs[i],dx=(x-b[0])/b[2],dy=(y-b[1])/b[3],wob=Math.sin(Math.atan2(dy,dx)*5+i*2.1+v)*0.09;if(dx*dx+dy*dy<=(1+wob)*(1+wob)){hit=i;break}}
    if(hit<0)continue;const b=blobs[hit];
    const own=(-(x-b[0])/b[2]-(y-b[1])/b[3])*0.55,all=(-(x-gx)-(y-gy))/gr*0.6,lit=own+all+(ah(x+v*97,y+hit*13,2)-0.5)*0.55;
    put(x,y,lit>0.95?L[3]:lit>0.3?L[2]:lit<-0.6?L[0]:L[1])}
}
function drawLiving(R,bx,by,sp,size,L,v){
  // One living tree. Returns how wide its ground shadow should be.
  const cells=new Map(),put=(x,y,c)=>cells.set(x+','+y,c),cx=bx+8,base=by+14,j=(i)=>ah(v,i,60+size); // j = this tree's own small differences
  const trunk=(x,yTop,w,col,hi,lean)=>{for(let y=yTop;y<=base;y++){const sx=Math.round(x+(lean||0)*(base-y));for(let k=0;k<w;k++)put(sx+k,y,k===0?hi:col)}};
  if(sp==='oak'){
    // Round oak: a broad, lumpy crown wider than it is tall, on a thick trunk with roots. Old oaks are big and gnarled; young ones a slim stem.
    const rad=[7,14,19][size]+Math.floor(j(1)*3),tw=[2,4,6][size],cy=base-rad-[6,11,13][size];
    trunk(cx-(tw>>1),cy,tw,AP.trunk,AP.trunkHi);
    if(size>0){put(cx-(tw>>1)-1,base,AP.trunk);put(cx+(tw>>1)+(tw&1),base,AP.trunk);if(size===2){put(cx-(tw>>1)-2,base,AP.trunk);put(cx+(tw>>1)+1,base,AP.trunk);put(cx-(tw>>1)-1,base-1,AP.trunk)}}
    const n=size===0?2:size===1?5:7,blobs=[];
    for(let i=0;i<n;i++){const a=i/n*6.28+j(2)*6,dd=rad*(0.38+j(10+i)*0.2);blobs.push([cx+Math.cos(a)*dd*1.15,cy+Math.sin(a)*dd*0.75,rad*(0.52+j(20+i)*0.14),rad*(0.48+j(30+i)*0.12)])}
    blobs.sort((p,q)=>p[1]-q[1]);blobs.unshift([cx,cy,rad*0.8,rad*0.7]);crown(cells,blobs,L,v,cx-2,cy-2,rad);
    outlined(R,cells);return [5,11,15][size]}
  if(sp==='birch'){
    // Birch: slim white trunks with black marks (often two stems leaning apart), and a light, open crown of small clumps you can see through.
    const tall=[20,32,40][size]+Math.floor(j(1)*5),stems=size>0&&j(3)<0.55?2:1,tw=size===2?3:2;
    const tops=[];
    for(let s=0;s<stems;s++){const lean=stems===2?(s?0.12:-0.1):(j(4)-0.5)*0.12,x=cx-1+(stems===2?(s?1:-1):0),yTop=base-tall+(s?4:0);
      for(let y=yTop;y<=base;y++){const sx=Math.round(x+lean*(base-y));for(let k=0;k<tw;k++){const mark=ah(sx,y,61+s)<0.16&&k<tw;put(sx+k,y,mark?'#2a2620':k===0?'#e4dfd2':'#bdb7a8')}}
      tops.push([Math.round(x+lean*tall),yTop])}
    const blobs=[];tops.forEach(([tx,ty],s)=>{const m=size===0?3:size===1?6:7;for(let i=0;i<m;i++)blobs.push([tx+1+(j(40+i+s*9)-0.5)*[7,13,17][size],ty+3+(j(50+i+s*9)-0.25)*[8,14,17][size],[3.5,5.5,6.5][size]+j(70+i)*1.5,[3,4.8,5.8][size]+j(80+i)*1.2])});
    blobs.sort((p,q)=>p[1]-q[1]);
    // thin dark twigs reaching into the gaps first, so the leaves sit on them
    tops.forEach(([tx,ty])=>{for(let i=0;i<3;i++){const ex=tx+Math.round((j(90+i)-0.5)*16),ey=ty+Math.round(j(95+i)*6)-3;const st=Math.max(Math.abs(ex-tx),Math.abs(ey-ty-6))||1;for(let k=0;k<=st;k++)put(Math.round(tx+(ex-tx)*k/st),Math.round(ty+6+(ey-ty-6)*k/st),'#3b3128')}});
    crown(cells,blobs,L,v,cx-2,base-tall,[8,12,15][size]);outlined(R,cells);return [4,8,11][size]}
  // Poplar: a tall, narrow column of leaves on a short trunk; the one that breaks up a row of round crowns.
  const H=[22,38,50][size]+Math.floor(j(1)*6),hw=[4,6.5,8][size],top=base-H-[4,6,7][size];
  trunk(cx-1,base-[7,9,10][size],size===2?3:2,AP.trunk,AP.trunkHi);
  const blobs=[],m=size===0?3:size===1?5:6;
  for(let i=0;i<m;i++){const f=i/(m-1);blobs.push([cx+(j(20+i)-0.5)*3,top+H*(0.15+f*0.62),hw*(0.62+0.38*Math.sin(f*2.6+0.4)),H*0.2])}
  crown(cells,blobs,L,v,cx-2,top+H*0.35,hw*2);outlined(R,cells);return [4,7,9][size];
}
// Line of pixels between two points, w wide (used by the bare trees).
function treeLine(R,x0,y0,x1,y1,w,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)R(Math.round(x0+(x1-x0)*i/n)-Math.floor(w/2),Math.round(y0+(y1-y0)*i/n),w,1,col)}
function drawDeadTree(R,bx,by,r,sp,size,v){
  // Dead trees. Returns the ground shadow width.
  //  crooked: the bare crooked tree from v0.30. lean: the same, tipped over to one side. forked: splits low into two big limbs.
  //  snag: snapped off part way up, a jagged pale break at the top. stump: cut or rotted down to the roots.
  sp=sp||'crooked';size=size===undefined?1:size;
  const base=by+14,cx=bx+7+Math.floor(r*3);
  if(sp==='snag'||sp==='stump'){
    const cells=new Map(),put=(x,y,c)=>cells.set(x+','+y,c),hgt=sp==='stump'?5+size:16+size*7+Math.floor(r*5),hw=sp==='stump'?4+(size>1?1:0):2+(size>0?1:0);
    for(let y=0;y<=hgt;y++){const flare=y<3?3-y:0;for(let x=-hw-flare;x<=hw+flare;x++)put(cx+x,base-y,x<=-hw+0?AP.trunkHi:ah(x,y+v*7,63)<0.1?'#2e2620':AP.trunk)}
    // the top: a pale break (jagged on a snag, flat with a ring on a stump)
    const ty=base-hgt;
    if(sp==='stump'){for(let x=-hw;x<=hw;x++){const e=Math.abs(x)===hw;put(cx+x,ty-2,e?AP.trunk:'#9a8a6c');put(cx+x,ty-1,e?AP.trunk:Math.abs(x)===hw-2?'#6e604a':'#a8987a');put(cx+x,ty,e?AP.trunkHi:'#8a7a60')}put(cx,ty-1,'#6e604a')} // flat pale top with a ring
    else{for(let x=-hw;x<=hw;x++){const up=Math.round(ah(x,v,64)*4+(x===-hw+1?3:0));for(let k=0;k<=up;k++)put(cx+x,ty-k,k>=up-1&&Math.abs(x)<hw?'#a8987a':AP.trunk)}
      // one broken stub of a branch, and on a big snag a shelf fungus
      const sd=v%2?1:-1;for(let k=1;k<=3+size;k++)put(cx+sd*(hw+k),ty+5+Math.floor(r*4)-Math.floor(k/2),AP.trunk);
      if(size>0){const fy=base-Math.round(hgt*0.45);for(let k=0;k<3;k++)put(cx-sd*(hw+1+k),fy,k?'#8f8a76':'#c9c2a8')}}
    outlined(R,cells);return sp==='stump'?5:6}
  // the bare-branch shapes, scaled by size, tipped by lean
  const k=[1.15,1.6,1.9][size],lean=sp==='lean'?(v%2?1:-1)*(0.28+r*0.12):(r-0.5)*0.08;
  const P=(dx,dy)=>[Math.round(cx+(dx-lean*dy)*k),Math.round(base+dy*k)];
  const tdx=Math.round((r-0.5)*4),top=-28-Math.floor(r*6);
  const seg=sp==='forked'?
    [[0,0,0,-9,4],[0,-9,-7,top+4,3],[0,-9,7,top+2,3],[-7,top+4,-12,top-2,2],[-5,top+10,-11,top+9,1],[7,top+2,11,top-4,2],[6,top+8,12,top+10,1],[-7,top+4,-4,top-3,1],[7,top+2,4,top-5,1],[-1,0,-4,1,2],[1,0,4,1,2]]:
    [[0,0,tdx,top+10,4],[tdx,top+10,tdx-7-Math.floor(r*3),top+2,3],[tdx,top+12,tdx+7+Math.floor(r*2),top+3,3],[tdx,top+10,tdx+1,top-2,3],
     [tdx-4,top+6,tdx-9,top+7,1],[tdx+4,top+7,tdx+10,top+9,1],[tdx+1,top+2,tdx-3,top-4,1],[0,-10,5,-15,2],[-1,0,-4,1,2],[1,0,4,1,2]];
  const wd=w=>Math.max(1,Math.round(w*(size===0?0.7:size===2?1.2:1)));
  const Ln=(s,extra,col)=>{const a=P(s[0],s[1]),b=P(s[2],s[3]);treeLine(R,a[0],a[1],b[0],b[1],wd(s[4])+extra,col)};
  seg.forEach(s=>Ln(s,2,AP.out));seg.forEach(s=>Ln(s,0,AP.trunk));
  const a=P(-1,-1),b=sp==='forked'?P(-1,-9):P(tdx-1,top+11);treeLine(R,a[0],a[1],b[0],b[1],1,AP.trunkHi);
  seg.filter(s=>s[4]===1).forEach(s=>{const e=P(s[2],s[3]);R(e[0],e[1],1,1,AP.twig)});
  return [6,8,10][size];
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
// Wolfwood (v0.40). Pixel helper: fill a shape into a grid first, then give it a black edge, so tiers and branches stay clean.
function outlined(R,cells){const key=(x,y)=>x+','+y;
  cells.forEach((c,k)=>{const [x,y]=k.split(',').map(Number);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{if(!cells.has(key(x+dx,y+dy)))R(x+dx,y+dy,1,1,AP.out)})});
  cells.forEach((c,k)=>{const [x,y]=k.split(',').map(Number);R(x,y,1,1,c)})}
function drawFir(R,bx,by,r,v,sc,P){
  // Tall dark fir: four drooping tiers of boughs on a short trunk, lit from the upper left. sc = size (young 0.55 .. old 1.25), P = its shade.
  sc=sc||1;P=P||AP;
  const cx=bx+8,base=by+14,top=base-Math.round((60+Math.floor(r*8))*sc),bot=base-Math.max(3,Math.round(5*sc)),H=bot-top,cells=new Map(),tiers=sc<0.7?3:4;
  for(let y=top;y<=bot;y++){const f=(y-top)/H,tp=(f*tiers)%1;
    const hw=Math.max(1,Math.round((1.5+f*11.5*Math.min(1.15,0.45+sc*0.6))*(0.55+0.45*tp)+(ah(v,y,20)-0.5)*1.4));
    for(let x=-hw;x<=hw;x++){const lit=(-x/hw)*0.9+(tp<0.3?0.25:0)-(tp>0.82?0.9:0)+(ah(x+v*31,y,21)-0.5)*0.5;
      cells.set((cx+x)+','+y,lit>0.75?P.firTop:lit>0.1?P.firHi:lit<-0.6?P.firDk:P.fir)}}
  const tw=sc>1.1?2:1;for(let y=bot+1;y<=base;y++)for(let x=-tw;x<=tw;x++)cells.set((cx+x)+','+y,x<0?AP.trunkHi:AP.trunk);
  outlined(R,cells);
}
function drawGiant(R,bx,by){
  // The dead giant tree: a huge pale bare trunk on a 4x4 footprint, branches spread far above the firs, a dark hollow at its foot.
  // (bx,by) = the footprint's bottom-left tile; base = the ground line.
  const cx=bx+32,base=by+15,cells=new Map();
  const put=(x,y,c)=>cells.set(Math.round(x)+','+Math.round(y),c);
  // trunk: wide flared roots narrowing upward, bark lit on the left
  for(let y=0;y<=96;y++){const hw=Math.round(9+22*Math.pow(Math.max(0,1-y/18),2)+(y<60?3:3*(1-(y-60)/40)));
    for(let x=-hw;x<=hw;x++){const f=x/hw;put(cx+x,base-y,f<-0.55?AP.barkHi:f>0.5?AP.barkDk:(ah(x,y,22)<0.12?AP.barkDk:AP.bark))}}
  // big branches: [from x,y up the trunk] -> [to x,y], width
  const br=[[0,90,-34,128,7],[0,92,30,132,7],[0,96,-4,150,6],[-22,114,-48,116,3],[20,118,46,112,3],[-30,124,-36,144,2],[26,128,34,150,2],[-2,130,10,160,2],[-4,140,-14,158,2],[-12,70,-40,84,4],[10,64,38,78,4],[-34,82,-44,96,2],[36,77,48,88,2]];
  br.forEach(([x0,y0,x1,y1,w])=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n,ww=Math.max(1,Math.round(w*(1-i/n*0.6)));
    for(let k=-Math.floor(ww/2);k<=Math.floor((ww-1)/2);k++)for(let j=0;j<2;j++)put(cx+x+(Math.abs(x1-x0)>Math.abs(y1-y0)?0:k),base-y-(Math.abs(x1-x0)>Math.abs(y1-y0)?k:0)-j,k<0?AP.barkHi:AP.bark)}});
  outlined(R,cells);
  // the hollow at its foot (the hidden chest waits just in front of it), a few blight cracks running up the bark
  const hx=cx+6;for(let y=0;y<22;y++){const hw=Math.round(7*Math.sqrt(Math.max(0,1-Math.pow((y-4)/18,2))));R(hx-hw-1,base-2-y,2*hw+2,1,AP.out);if(hw>0)R(hx-hw,base-2-y,2*hw,1,y<3?'#0c0b0a':'#050404')}
  [[-8,30,6],[12,46,9],[-2,70,7]].forEach(([x,y,l])=>{for(let k=0;k<l;k++)R(cx+x+(k%3===2?1:0),base-y-k,1,1,AP.barkDk)});
}
function drawBoulder(R,bx,by,top,r){
  // Mossy grey boulders: the hillside the crypt tunnel comes up through. Each tile a rounded rock rising a little above it.
  const cx=bx+8,cy=by+8,rw=8+Math.floor(r*2),rh=9;
  for(let y=-rh-1;y<=rh+1;y++)for(let x=-rw-1;x<=rw+1;x++){const d=x*x/(rw*rw)+y*y/(rh*rh);if(d>1.18)continue;
    let c;if(d>1)c=AP.out;else{const lit=(-x-y*1.2)/rw+(ah(bx+x,by+y,23)-0.5)*0.5;c=lit>0.7?AP.bouldHi:lit<-0.5?AP.bouldDk:AP.bould}
    R(cx+x,cy+y-3,1,1,c)}
  if(top){R(cx-4,cy-11,5,2,AP.mossHi);R(cx-2,cy-12,3,1,AP.moss)}
  if(r<0.4)R(cx+2,cy-1,2,1,AP.bouldDk);
}
function drawBush(R,bx,by,dead,r){
  if(dead){const c=AP.twig;[[3,12,7,6],[8,12,6,5],[12,12,14,7],[8,12,9,4]].forEach(([x0,y0,x1,y1])=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)R(bx+Math.round(x0+(x1-x0)*i/n),by+Math.round(y0+(y1-y0)*i/n),1,1,i<2?AP.trunk:c)});return}
  for(let y=-5;y<=4;y++)for(let x=-7;x<=7;x++){const d=x*x/49+y*y/25;if(d>1)continue;R(bx+8+x,by+10+y,1,1,d>0.75?AP.out:(x+y<-3?AP.leafHi:AP.leaf))}
}
function drawGrave(R,bx,by,r,tx,ty){
  // Headstone on a low mound. Five shapes, and every stone weathers on its own (Heart pass, v0.49): some lean, some are
  // chipped, cracked or broken off, moss sits on the tops and at the foot, pale lichen spots the faces, and now and then
  // someone has left flowers that have long since died.
  const a=ah(tx,ty,70),b=ah(tx,ty,71),c=ah(tx,ty,72),d=ah(tx,ty,73),e=ah(tx,ty,74);
  R(bx+3,by+12,10,3,AP.dirt);R(bx+3,by+12,10,1,AP.dirtHi);R(bx+2,by+15,12,1,'rgba(0,0,0,0.35)');
  const lean=a<0.2?-1:a>0.84?1:0;
  // A leaning stone: its upper rows shift one pixel over, the top rows two, as if the ground gave way on one side.
  const S=(x,y,w,h,col)=>{for(let j=0;j<h;j++){const yy=y+j,sh=lean*((yy<by+4)?2:(yy<by+8)?1:0);R(bx+x+sh,yy,w,1,col)}};
  const P=(x,y,w,h,col)=>S(x,by+y,w,h,col),k=r<0.12?4:Math.floor((r-0.12)/0.88*4); // about 1 in 8 is broken
  let top; // where moss settles: [x,y,w] on the top edge
  if(k===0){P(4,2,8,11,AP.out);P(5,1,6,1,AP.out);P(5,2,6,10,AP.stone);P(5,2,2,9,AP.stoneHi);P(10,3,1,9,AP.stoneDk);P(7,5,2,1,AP.stoneDk);P(7,7,3,1,AP.stoneDk);top=[5,2,4]}
  else if(k===1){P(6,0,4,13,AP.out);P(3,3,10,4,AP.out);P(7,1,2,11,AP.stone);P(4,4,8,2,AP.stone);P(7,1,1,10,AP.stoneHi);P(4,4,3,1,AP.stoneHi);top=[4,4,3]}
  else if(k===2){P(3,5,10,8,AP.out);P(4,6,8,6,AP.stone);P(4,6,8,1,AP.stoneHi);P(4,6,1,6,AP.stoneHi);P(11,7,1,5,AP.stoneDk);P(6,8,4,1,AP.stoneDk);top=[4,6,5]}
  else if(k===3){ // round-topped stone
    P(6,0,4,1,AP.out);P(5,1,6,1,AP.out);P(4,2,8,11,AP.out);P(6,1,4,1,AP.stone);P(5,2,6,10,AP.stone);P(5,2,2,9,AP.stoneHi);P(10,3,1,9,AP.stoneDk);P(6,4,4,1,AP.stoneDk);P(7,6,2,1,AP.stoneDk);top=[6,1,3]}
  else{ // snapped off, the top half lying in the grass beside it
    P(4,6,8,7,AP.out);P(5,7,6,5,AP.stone);P(5,7,2,5,AP.stoneHi);P(10,7,1,5,AP.stoneDk);P(7,6,2,1,AP.out);P(9,6,1,1,AP.stone);P(5,6,1,1,AP.stone);
    R(bx+10,by+11,6,4,AP.out);R(bx+11,by+12,4,2,AP.stoneDk);R(bx+11,by+12,4,1,AP.stone);top=[5,7,3]}
  if(b<0.5)P(top[0],top[1],top[2],1,b<0.2?'#5f7a4a':AP.moss); // moss on the top edge
  if(c<0.55){R(bx+4+Math.floor(c*6),by+12,3,1,AP.moss);R(bx+5+Math.floor(c*6),by+11,1,1,'#3e5434')} // moss at the foot
  if(d<0.45&&k!==1){P(6+Math.floor(d*6),5+Math.floor(e*4),1,1,'#a8a48a');if(d<0.2)P(7+Math.floor(d*8),8,2,1,'#8f8c76')} // pale lichen
  if(b>0.78&&k!==1&&k!==4){P(8,3,1,2,AP.stoneDk2);P(9,5,1,2,AP.stoneDk2);P(8,7,1,1,AP.stoneDk2)} // a crack down the face
  if(c>0.82&&(k===0||k===2))P(k===0?10:11,k===0?2:5,1,1,AP.out); // a chipped corner
  if(e>0.9){R(bx+4,by+12,1,2,'#4a5a3a');R(bx+6,by+12,1,2,'#4a5a3a');R(bx+3,by+11,2,1,'#7a5a62');R(bx+6,by+11,2,1,'#8a6a4a')} // dead flowers left on the mound
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
function drawFence(R,bx,by,l,rt,up,dn,grate,tx,ty){
  // Iron fence: spear-topped bars joined by two rails; runs up and down the screen show as a post column.
  // Fences join (owner, Nov 20): bars only stand where the rails are, so a run never sticks out past a turn or an end,
  // and every corner or end gets one thick post with a cap that both runs meet. Old fences sag: here and there a bar is
  // bent, snapped off or missing, a spear tip leans, the top rail dips (fence rules in area-rules.md).
  if(grate){
    // Where the creek runs out under the fence: the fence keeps standing in the water (same line as the fence around it),
    // its bars go down into the stream, and the water ripples where it flows past them (v0.30; the old flat grate looked knocked over).
    if(up||dn){R(bx+6,by,4,16,AP.out);R(bx+7,by,1,16,AP.ironHi);R(bx+8,by,1,16,AP.iron);
      [1,9].forEach(y=>{R(bx+5,by+y,6,5,AP.out);R(bx+6,by+y+1,1,3,AP.ironHi);R(bx+6,by+y,1,1,AP.ironTip)});
      [2,7,12].forEach(y=>{R(bx+1,y+by,4,1,AP.waterHi);R(bx+4,y+by+1,2,1,AP.glint);R(bx+10,y+by+1,2,1,AP.glint);R(bx+11,y+by+2,4,1,AP.waterHi)})}
    else{R(bx,by+5,16,1,AP.out);R(bx,by+6,16,1,AP.ironHi);[2,7,12].forEach(x=>{R(bx+x,by+2,2,11,AP.out);R(bx+x,by+3,1,9,AP.ironHi);R(bx+x,by+1,2,1,AP.ironTip);R(bx+x-1,by+12,4,1,AP.waterHi)})}
    return}
  const h=ah(tx,ty,90),h2=ah(tx,ty,91),horiz=l||rt||!(up||dn),vert=up||dn,mid=l&&rt&&!vert;
  // A corner or an end (anything but a straight run) gets the thick post.
  const post=!(l&&rt&&!vert)&&!(up&&dn&&!l&&!rt);
  if(horiz){
    const x0=l?0:7,x1=rt?16:9,w=x1-x0,sag=mid&&h2<0.08;
    // Rails: the top one dips a pixel in the middle on a sagging panel.
    if(sag){R(bx,by+5,5,1,AP.out);R(bx,by+6,5,1,AP.ironHi);R(bx+5,by+6,6,1,AP.out);R(bx+5,by+7,6,1,AP.ironHi);R(bx+11,by+5,5,1,AP.out);R(bx+11,by+6,5,1,AP.ironHi)}
    else{R(bx+x0,by+5,w,1,AP.out);R(bx+x0,by+6,w,1,AP.ironHi)}
    R(bx+x0,by+10,w,1,AP.out);R(bx+x0,by+11,w,1,AP.ironHi);
    // Which bar (if any) is damaged on this panel: 0 bent, 1 snapped off short, 2 gone.
    const bad=mid&&h<0.26?Math.floor(ah(tx,ty,92)*3):-1,badX=[2,7,12][Math.floor(ah(tx,ty,93)*3)];
    [2,7,12].forEach(x=>{
      if(x<x0-1||x>x1-1)return; // no bar out past the end of the rails
      if(post&&x===7)return; // the thick post stands here
      if(x===badX&&bad===2)return;
      if(x===badX&&bad===1){R(bx+x,by+8,2,6,AP.out);R(bx+x,by+9,1,4,AP.ironHi);R(bx+x+1,by+8,1,1,AP.ironHi);return} // snapped, jagged top
      if(x===badX&&bad===0){const d=ah(tx,ty,94)<0.5?-1:1; // bent: straight below the top rail, kinked over above it
        R(bx+x,by+6,2,8,AP.out);R(bx+x,by+7,1,6,AP.ironHi);R(bx+x+d,by+3,2,4,AP.out);R(bx+x+d+(d>0?0:0),by+4,1,2,AP.ironHi);R(bx+x+2*d,by+2,2,1,AP.out);R(bx+x+2*d,by+1,2,1,AP.ironTip);return}
      const lean=mid&&ah(tx,ty,95+x)<0.1?(h<0.5?-1:1):0; // a spear tip knocked a pixel off true
      R(bx+x,by+2,2,12,AP.out);R(bx+x,by+3,1,10,AP.ironHi);R(bx+x+lean,by+1,2,1,AP.ironTip)});
    R(bx+x0,by+14,w,1,'rgba(0,0,0,0.3)');
    if(mid&&ah(tx,ty,96)<0.35){const rx=bx+1+Math.floor(ah(tx,ty,97)*12);R(rx,by+6,2,1,'#6a4636');R(rx+1,by+7,1,2,'#4a3028')} // rust running down from a rail (v0.49)
    if(mid&&ah(tx,ty,98)<0.12){R(bx+3,by+12,4,2,'#3e4a30');R(bx+4,by+11,1,1,'#3e4a30')}}
  if(vert){
    const top=up?0:5,bot=dn?16:13;
    R(bx+6,by+top,4,bot-top,AP.out);R(bx+7,by+top,1,bot-top,AP.ironHi);R(bx+8,by+top,1,bot-top,AP.iron);
    const tipLean=up&&dn&&h<0.12?(h2<0.5?-1:1):0;
    [1,9].forEach((y,i)=>{if(post&&i===0&&!up)return;const lx=i===0?tipLean:0;R(bx+5+lx,by+y,6,5,AP.out);R(bx+6+lx,by+y+1,1,3,AP.ironHi);R(bx+6+lx,by+y,1,1,AP.ironTip)});
    if(up&&dn&&ah(tx,ty,96)<0.3)R(bx+8,by+4+Math.floor(h2*8),1,3,'#6a4636')} // rust streak on the bar
  if(post){
    // Thick corner/end post with a stone foot and a capped top: both runs meet here, so the turn reads as one joint.
    R(bx+5,by+0,6,15,AP.out);R(bx+6,by+2,3,12,AP.ironHi);R(bx+9,by+2,1,12,AP.iron);R(bx+5,by+1,6,2,AP.out);R(bx+6,by+0,4,1,AP.ironTip);R(bx+7,by-1,2,1,AP.ironTip);
    R(bx+4,by+13,8,3,AP.out);R(bx+5,by+13,6,2,AP.stoneDk);R(bx+5,by+13,6,1,AP.stone);
    if(ah(tx,ty,99)<0.5)R(bx+5,by+14,2,1,AP.moss)}
}
function drawBrokenFence(R,bx,by,l,rt,up,dn,inHoriz,panel){
  // A gap where the fence came down (owner, Nov 20: fallen fences make the world feel lived in). Whatever was standing
  // next to it ends in a snapped stub, and the panel lies flat on the ground outside the line where it fell, one bar bent
  // up off it. In a gap two tiles long only one tile holds the panel; the other gets a loose bar, so it never repeats.
  const dk='rgba(0,0,0,0.35)';
  const bar=(x,y,w,h,c)=>R(x,y,w,h,c);
  if(inHoriz){ // gap in a run across the screen: stubs left and right; the panel fell outward, down the screen
    if(l){bar(bx,by+5,2,1,AP.out);bar(bx,by+10,3,1,AP.out);bar(bx,by+11,3,1,AP.ironHi);bar(bx+2,by+7,2,7,AP.out);bar(bx+2,by+8,1,5,AP.ironHi)}
    if(rt){bar(bx+14,by+5,2,1,AP.out);bar(bx+13,by+10,3,1,AP.out);bar(bx+13,by+11,3,1,AP.ironHi);bar(bx+12,by+9,2,5,AP.out);bar(bx+13,by+10,1,3,AP.ironHi)}
    if(panel){ // seen from above it's a short ladder lying on the grass: two rails across, bars running down to their spear tips
      bar(bx+1,by+21,15,1,dk);
      [14,19].forEach(y=>{bar(bx,by+y,16,2,AP.out);bar(bx+1,by+y,14,1,AP.ironHi);bar(bx+2,by+y,4,1,AP.ironTip)});
      [2,6,10,14].forEach(x=>{if(x===10)return;bar(bx+x,by+12,1,10,AP.out);bar(bx+x,by+22,1,1,AP.ironTip)});
      bar(bx+10,by+15,1,4,AP.out);bar(bx+11,by+12,1,3,AP.out);bar(bx+12,by+10,1,2,AP.ironHi);bar(bx+12,by+9,1,1,AP.ironTip)} // the bent bar
    else{bar(bx+3,by+15,9,1,AP.out);bar(bx+4,by+14,8,1,AP.ironHi);bar(bx+11,by+14,1,1,AP.ironTip);bar(bx+3,by+16,9,1,dk)}
    return}
  // Gap in a run up and down the screen: stubs above and below; the panel fell outward (to the left) and lies there,
  // its rails still running up and down, its bars pointing out at their spear tips.
  if(up){bar(bx+6,by,4,5,AP.out);bar(bx+7,by,1,4,AP.ironHi);bar(bx+8,by+4,1,1,AP.ironHi)}
  if(dn){bar(bx+6,by+11,4,5,AP.out);bar(bx+7,by+12,1,4,AP.ironHi);bar(bx+7,by+11,1,1,AP.ironHi)}
  if(panel){
    bar(bx-7,by+15,13,1,dk);
    [3,-2].forEach(x=>{bar(bx+x,by-1,1,16,AP.out);bar(bx+x+1,by,1,14,x===3?AP.iron:AP.ironHi)}); // the two rails
    [1,6,11].forEach((y,i)=>{if(i===1){bar(bx-4,by+y,8,1,AP.out);bar(bx-6,by+y-1,2,1,AP.out);bar(bx-7,by+y-2,1,1,AP.ironTip);return} // bent
      bar(bx-7,by+y,12,1,AP.out);bar(bx-6,by+y,10,1,AP.ironHi);bar(bx-8,by+y,1,1,AP.ironTip)})}
  else{bar(bx-4,by+8,10,1,AP.out);bar(bx-3,by+7,9,1,AP.ironHi);bar(bx-5,by+8,1,1,AP.ironTip);bar(bx-4,by+9,10,1,dk)}
}
function drawSunkPanel(R,x,y){
  // A fence panel that fell into the creek: it lies askew, one rail and the tops of its bars above the water, the rest
  // gone under; the current laps across it.
  const S=(a,b,w,h,c)=>R(x+a,y+b,w,h,c);
  for(let i=-1;i<15;i++){const yy=3+Math.floor(i/3);S(i,yy,1,2,AP.out);S(i,yy,1,1,AP.ironHi)} // top rail, slanting down to the right
  [0,4,8,12].forEach((bx,i)=>{const top=4+Math.floor(bx/3),len=i===2?3:7;S(bx,top,2,len,AP.out);S(bx,top,1,len-1,AP.ironHi);if(i!==2)S(bx,top+len,2,1,AP.ironTip)});
  for(let i=0;i<10;i++)S(i,10+Math.floor(i/3),1,1,AP.out); // the second rail just breaking the surface
  S(-2,8,3,1,AP.waterHi);S(5,10,3,1,AP.waterHi);S(9,13,5,1,AP.waterHi);S(2,14,3,1,AP.waterHi);S(14,9,2,1,AP.glint);S(-1,2,2,1,AP.glint)}
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
    // cornice band and belfry arch with the bell
    R(X-1,top+12,W-8,3,AP.stoneDk2);R(X,top+12,W-10,1,AP.stone);
    R(X+16,top+17,16,17,AP.out);R(X+17,top+19,14,14,'#120f16');R(X+18,top+18,12,1,AP.out);
    // The bell (redrawn v0.49.1, owner: the old tilted lump didn't read): an old bronze bell hanging from a wooden beam,
    // round-shouldered crown, a waist, a flared lip and the clapper showing under it. Light on the left, green patina
    // spots and one crack up from the lip, so it reads as a bell first and an old one second.
    R(X+17,top+20,14,3,AP.out);R(X+17,top+21,14,1,AP.wood);R(X+23,top+22,2,2,AP.out);
    const bx0=X+24;[[2,0],[3,1],[3,2],[3,3],[4,4],[4,5],[5,6],[5,7]].forEach(([hw,j],_,a)=>{const y=top+23+j;R(bx0-hw-1,y,hw*2+2,1,AP.out)});
    R(bx0-6,top+31,12,1,AP.out);
    [[2,0],[3,1],[3,2],[3,3],[4,4],[4,5],[5,6]].forEach(([hw,j])=>{const y=top+23+j;R(bx0-hw,y,hw*2,1,AP.bell);R(bx0-hw,y,2,1,AP.bellHi);R(bx0+hw-1,y,1,1,'#5a4810')});
    R(bx0-5,top+30,10,1,'#6e5814');R(bx0-5,top+30,2,1,AP.bell); // the lip band
    R(bx0-1,top+23,2,1,AP.bellHi);R(bx0+2,top+26,1,1,'#4f7a5a');R(bx0-2,top+28,2,1,'#4f7a5a');R(bx0+3,top+29,1,1,'#4f7a5a'); // shine and patina
    R(bx0+1,top+27,1,1,'#2a2008');R(bx0+2,top+28,1,2,'#2a2008'); // the crack
    R(bx0-1,top+32,2,1,'#5a4810'); // the clapper's tip under the lip
    // slit window and wooden door at ground level
    R(X+8,Y-4,2,6,'#120f16');R(X+38,Y+2,2,6,'#120f16');
    // (Heart pass, v0.49: the door is person-height now, 26 px for the 24 px characters, with an arched stone head)
    R(X+17,Y+H-26,14,26,AP.out);R(X+18,Y+H-24,12,24,AP.wood);R(X+18,Y+H-24,12,2,AP.woodDk);[20,23,26].forEach(x=>R(X+x,Y+H-22,1,22,AP.woodDk));R(X+18,Y+H-15,12,1,AP.woodDk);R(X+27,Y+H-12,1,2,AP.bellHi);
    R(X+16,Y+H-28,16,3,AP.stoneDk2);R(X+17,Y+H-28,14,1,AP.stone);R(X+19,Y+H-30,10,2,AP.stoneDk2);R(X+20,Y+H-30,8,1,AP.stone);
    // ivy on the shady side
    // Heart pass (v0.49): a long crack running down from the broken corner, moss along the cornice and the foot.
    treeLine(R,X+W-14,top+15,X+W-18,top+24,1,AP.stoneDk2);treeLine(R,X+W-18,top+24,X+W-15,top+33,1,AP.stoneDk2);R(X+W-16,top+28,2,1,AP.stoneDk2);
    R(X+2,top+11,6,1,AP.moss);R(X+3,top+10,3,1,'#5f7a4a');R(X+2,Y+H-2,7,2,AP.moss);R(X+3,Y+H-3,3,1,'#5f7a4a');R(X+W-11,Y+H-2,6,2,AP.moss);
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

    // Heart pass (v0.49): moss on the pediment and cornice, dead ivy hanging off the left pillar, a crack in the right one,
    // and moss creeping up from the foot of both.
    R(X+4,top+8,8,1,AP.moss);R(X+6,top+7,3,1,'#5f7a4a');R(X+W-14,top+5,6,1,AP.moss);R(X-1,top+10,6,1,AP.moss);R(X+W-6,top+10,5,1,AP.moss);
    for(let i=0;i<9;i++){const yy=top+12+Math.floor(ah(o.x,i,93)*(H+1)),xx=X+5+Math.floor(ah(o.y,i,94)*4);R(xx,yy,1,2,i%3?'#5a5a3a':AP.moss)}
    R(X+W-10,top+16,1,3,AP.stoneDk2);R(X+W-9,top+19,1,3,AP.stoneDk2);R(X+W-10,top+22,1,2,AP.stoneDk2);
    R(X+5,Y+H-2,5,2,AP.moss);R(X+W-13,Y+H-2,4,2,AP.moss);R(X+W-12,Y+H-3,2,1,'#5f7a4a');
    return}
  if(k==='mausoleum'){
    // Family tomb (Heart pass, v0.49): an iron-barred door you could walk through (the old one was waist-high), a carved
    // lintel, rain streaks under the eaves, a crack, moss along the roof and the foot, and a stone urn of dead stalks.
    const top=Y-14,cx=X+W/2,v=ah(o.x,o.y,90);shadow(X+3,Y+H-3,W,4);
    R(X-1,top+5,W+2,H+10,AP.out);bricks(X,top+6,W,H+8,AP.stoneDk,AP.stone);R(X,top+6,2,H+8,AP.stone);
    for(let i=0;i<W/2+3;i++)R(X+W/2-i-1,Math.floor(top+i/2.6-2),2*i+2,1,i>=W/2+2?AP.out:i%3===0?AP.stoneHi:AP.stone);
    R(X-2,top+5,W+4,2,AP.out);R(X-1,top+5,W+2,1,AP.stoneHi);
    [[5,9],[13,6],[34,11],[42,7]].forEach(([sx,l])=>R(X+sx,top+7,1,l,AP.stoneDk2)); // rain streaks
    R(X+3,top+4,7,1,AP.moss);R(X+5,top+3,3,1,'#5f7a4a');R(X+W-12,top+4,6,1,AP.moss);R(X+18,top+1,4,1,AP.moss); // moss on the eaves
    R(cx-9,Y+H-28,18,3,AP.out);R(cx-8,Y+H-27,16,2,AP.stoneHi);[-6,-2,2].forEach(x=>R(cx+x,Y+H-26,3,1,AP.stoneDk)); // lintel with worn letters
    R(cx-7,Y+H-25,14,25,AP.out);R(cx-6,Y+H-24,12,24,'#0a080e');R(cx-5,Y+H-5,10,2,'#1c1826');R(cx-4,Y+H-9,8,2,'#16131e'); // dark inside, steps going down
    [-5,-2,1,4].forEach(x=>{R(cx+x,Y+H-24,1,24,AP.ironHi);R(cx+x,Y+H-25,1,1,AP.ironTip)});R(cx-6,Y+H-18,12,1,AP.ironHi);R(cx-6,Y+H-17,12,1,AP.iron);
    if(v<0.5){R(X+W-9,top+16,1,3,AP.stoneDk2);R(X+W-8,top+19,1,3,AP.stoneDk2);R(X+W-9,top+22,1,2,AP.stoneDk2)} // a crack
    else{for(let i=0;i<7;i++){const yy=top+9+Math.floor(ah(o.x,i,91)*20),xx=X+2+Math.floor(ah(o.y,i,92)*4);R(xx,yy,2,1,AP.moss);R(xx,yy+1,1,1,'#33402c')}} // ivy
    R(X+2,Y+H-2,5,2,AP.moss);R(X+3,Y+H-3,2,1,'#5f7a4a');R(X+W-6,Y+H-2,4,2,AP.moss);
    const ux=v<0.5?cx+10:cx-15; // the urn sits to one side of the door
    R(ux,Y+H-8,5,7,AP.out);R(ux+1,Y+H-7,3,5,AP.stone);R(ux+1,Y+H-7,1,5,AP.stoneHi);R(ux-1,Y+H-8,7,1,AP.out);
    R(ux+1,Y+H-12,1,4,'#6a5a3a');R(ux+3,Y+H-11,1,3,'#6a5a3a');R(ux+2,Y+H-13,1,2,'#7a6a48');return}
  if(k==='shack'){
    // Gravedigger's shack (Heart pass, v0.49): the door is sized for a person now (the old one came up to your waist),
    // planks gone dark and damp at the foot, one sprung loose, a shuttered lit window with one shutter hanging off,
    // moss and a missing shingle on the roof, a woodpile against the wall and his spade leaning by the door. Smoke from
    // the chimney is drawn live (world.js, area critters).
    const top=Y-12;shadow(X+3,Y+H-3,W,4);
    R(X-1,top+11,W+2,H+2,AP.out);R(X,top+12,W,H,AP.wood);for(let x=0;x<W;x+=4){R(X+x,top+12,1,H,AP.woodDk);R(X+x+1,top+12,1,H,AP.woodHi)}
    R(X,Y+H-5,W,5,'#463225');for(let x=0;x<W;x+=4)R(X+x,Y+H-5,1,5,AP.woodDk);
    R(X+28,Y+9,1,13,AP.woodHi);R(X+29,Y+9,1,13,'#2a1c14'); // a sprung plank
    for(let i=0;i<16;i++){R(X-3+Math.floor(i/6),top+i,W+6-Math.floor(i/6)*2,1,i<1||i===15?AP.out:i%3===0?AP.roof:AP.roofHi)}
    for(let x=0;x<W+4;x+=5)R(X-2+x,top+2,1,12,AP.roof);
    R(X+39,top+5,6,4,AP.out);R(X+40,top+6,4,2,'#140d08'); // missing shingle
    R(X+4,top+1,9,2,AP.moss);R(X+6,top,4,1,'#5f7a4a');R(X+20,top+13,7,2,AP.moss);R(X+52,top+10,6,2,AP.moss);R(X+54,top+9,2,1,'#5f7a4a');
    // door: a full-height plank door with a Z brace, an iron ring, a lintel and a stone step
    const dx=X+36,dy=Y+H-26;R(dx-1,dy-2,16,2,AP.woodDk);R(dx,dy,14,26,AP.out);R(dx+1,dy+1,12,25,AP.wood);R(dx+4,dy+1,1,25,AP.woodDk);R(dx+8,dy+1,1,25,AP.woodDk);
    R(dx+1,dy+3,12,2,AP.woodHi);R(dx+1,dy+20,12,2,AP.woodHi);treeLine(R,dx+2,dy+19,dx+11,dy+6,1,AP.woodHi);R(dx+10,dy+12,2,2,AP.bellHi);
    R(dx-1,Y+H,16,3,AP.out);R(dx,Y+H,14,2,AP.stone);R(dx,Y+H,14,1,AP.stoneHi);
    // window with shutters (the right one hangs crooked from one hinge)
    R(X+9,Y+12,12,10,AP.out);R(X+10,Y+13,10,8,'#ffb860');R(X+10,Y+17,10,4,'#e08a3a');R(X+14,Y+13,1,8,AP.out);R(X+10,Y+16,10,1,AP.out);
    R(X+5,Y+12,4,10,AP.out);R(X+6,Y+13,2,8,AP.woodDk);R(X+21,Y+14,4,10,AP.out);R(X+22,Y+15,2,8,AP.woodDk);R(X+8,Y+22,14,1,AP.woodHi);
    // woodpile against the wall: log ends stacked three high
    R(X+1,Y+H+3,21,1,'rgba(0,0,0,0.45)');R(X+2,Y+H+2,19,1,'rgba(0,0,0,0.3)'); // the pile sits out on the ground (v0.49.1), with its shadow
    for(let j=0;j<3;j++)for(let i=0;i<4-j;i++){const lx2=X+2+i*5+j*2,ly=Y+H-1-j*4;R(lx2,ly,5,4,AP.out);R(lx2+1,ly+1,3,2,'#a88a64');R(lx2+2,ly+1,1,1,'#7a5a42')}
    // the spade, leaning on the wall beside the door
    R(X+50,Y+H+3,9,1,'rgba(0,0,0,0.45)'); // its foot on the ground in front of the wall, top leaning on the wall (v0.49.1)
    treeLine(R,X+57,Y+H-23,X+54,Y+H-5,3,AP.out);treeLine(R,X+57,Y+H-22,X+54,Y+H-5,1,AP.woodHi);R(X+55,Y+H-24,5,2,AP.out);R(X+56,Y+H-24,3,1,AP.wood);
    R(X+51,Y+H-6,6,9,AP.out);R(X+52,Y+H-5,4,7,AP.stone);R(X+52,Y+H-5,1,6,AP.stoneHi);R(X+53,Y+H+1,2,1,AP.stoneDk);
    R(X+W-6,top+4,4,8,AP.out);R(X+W-5,top+2,2,9,AP.stoneDk);R(X+W-6,top+1,4,2,AP.out);return} // chimney
  if(k==='flowers'){
    // Small story (Heart pass, v0.49): fresh flowers and a stub of candle at the foot of one grave. Someone still visits.
    R(X+2,Y+1,1,5,'#3e5a32');R(X+4,Y,1,6,'#3e5a32');R(X+6,Y+2,1,4,'#3e5a32');R(X+3,Y+5,4,1,'#6a3a4a'); // stems tied with a ribbon
    [[1,0,'#e8e0f0'],[2,-1,'#e8e0f0'],[4,-2,'#c05a6a'],[5,-1,'#c05a6a'],[6,1,'#e8e0f0'],[7,0,'#d8c060']].forEach(([x,y,col])=>{R(X+x,Y+y,2,2,AP.out);R(X+x,Y+y,1,1,col)});
    R(X+10,Y+1,4,6,AP.out);R(X+11,Y+2,2,4,'#e8dcc0');R(X+11,Y+5,2,1,'#b8ad90');R(X+9,Y+6,6,1,'#b8ad90');return}
  if(k==='shovel'){
    // The gravedigger's spade left standing in the dirt he dug out of the open grave beside it.
    // (v0.49.1, owner: it floated) the blade is driven into the pile, so the dirt is drawn over its lower half,
    // and the pile casts a shadow on the grass.
    R(X+1,Y+15,14,1,'rgba(0,0,0,0.45)');
    R(X+7,Y-10,3,18,AP.out);R(X+8,Y-9,1,17,AP.woodHi);R(X+5,Y-12,7,3,AP.out);R(X+6,Y-11,5,1,AP.wood);
    R(X+5,Y+5,7,6,AP.out);R(X+6,Y+6,5,4,AP.stone);R(X+6,Y+6,5,1,AP.stoneHi);
    R(X+4,Y+7,8,1,AP.out);R(X+2,Y+8,12,1,AP.out);R(X+1,Y+9,14,5,AP.out);R(X+2,Y+14,12,1,AP.out); // a rounded heap, not a box
    R(X+5,Y+8,6,1,AP.dirtHi);R(X+3,Y+9,10,1,AP.dirtHi);R(X+2,Y+10,12,4,AP.dirt);R(X+4,Y+10,4,1,AP.dirtHi);
    R(X+3,Y+12,2,1,'#2a221c');R(X+10,Y+11,2,1,'#2a221c');R(X+7,Y+13,1,1,AP.dirtHi);return}
  if(k==='statue'){
    // Weathered angel on a plinth (Heart pass, v0.49): its right wing has broken off at the tip (the piece lies on the
    // plinth), dark rain streaks run down it, lichen on the robe, moss on the plinth and the wing tops.
    shadow(X+2,Y+13,14,3);R(X+1,Y+8,14,7,AP.out);R(X+2,Y+9,12,5,AP.stoneDk);R(X+2,Y+9,12,1,AP.stone);
    R(X+5,Y-10,6,19,AP.out);R(X+6,Y-9,4,17,AP.stone);R(X+6,Y-9,1,17,AP.stoneHi);R(X+6,Y-13,4,4,AP.out);R(X+7,Y-12,2,2,AP.stoneHi);
    R(X,Y-8,6,8,AP.out);R(X+1,Y-7,4,6,AP.stoneHi);R(X+10,Y-5,5,5,AP.out);R(X+11,Y-4,3,3,AP.stone);
    R(X+8,Y-8,1,6,AP.stoneDk);R(X+9,Y-2,1,4,AP.stoneDk);R(X+7,Y+1,2,1,'#a8a48a');R(X+8,Y+4,1,1,'#a8a48a');
    R(X+1,Y-8,3,1,AP.moss);R(X+2,Y+9,4,1,AP.moss);R(X+3,Y+12,2,1,AP.moss);R(X+11,Y+8,3,2,AP.out);R(X+12,Y+8,1,1,AP.stoneHi);return}
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
  if(k==='tunnel_mouth'){
    // Where the crypt tunnel comes up: a dark hole in the hillside, shored with old timbers, roots over the lintel.
    const top=Y-10;shadow(X+2,Y+H-3,W-2,4);
    for(let y=0;y<H+10;y++){const hw=Math.round(W/2*Math.sqrt(Math.max(0,1-Math.pow((H+10-y)/(H+12),2)))+2);R(X+W/2-hw-1,top+y,2*hw+2,1,AP.out);if(hw>1)R(X+W/2-hw,top+y,2*hw,1,y<3?AP.bouldHi:AP.bould)}
    R(X+10,Y+2,W-20,H-2,AP.out);R(X+11,Y+3,W-22,H-3,'#050404');R(X+12,Y+3,W-24,2,'#1c1712');
    R(X+8,Y,4,H,AP.out);R(X+9,Y+1,2,H-1,AP.woodDk);R(X+W-12,Y,4,H,AP.out);R(X+W-11,Y+1,2,H-1,AP.woodDk);R(X+7,Y-2,W-14,4,AP.out);R(X+8,Y-1,W-16,2,AP.wood);R(X+8,Y-1,W-16,1,AP.woodHi);
    [[14,6],[22,9],[31,5]].forEach(([x,l])=>{for(let k=0;k<l;k++)R(X+x+(k>3?1:0),Y+2+k,1,1,k<l-1?AP.root:AP.rootHi)});
    R(X+4,top+6,4,2,AP.mossHi);R(X+W-10,top+4,5,2,AP.mossHi);return}
  if(k==='wolf_den'){
    // Greyfang's den: a low rocky mound with a dark hole, bones scattered in front and a gnawed hunter's bow.
    const top=Y-8;shadow(X+2,Y+H-3,W-2,4);
    for(let y=0;y<H+8;y++){const hw=Math.round(W/2*Math.sqrt(Math.max(0,1-Math.pow((H+8-y)/(H+10),2)))+1);R(X+W/2-hw-1,top+y,2*hw+2,1,AP.out);if(hw>1)R(X+W/2-hw,top+y,2*hw,1,y<4?AP.bouldHi:(ah(o.x,y,24)<0.2?AP.bouldDk:AP.bould))}
    R(X+W/2-10,Y+6,20,H-6,AP.out);R(X+W/2-9,Y+7,18,H-7,'#050404');R(X+W/2-11,Y+5,22,2,AP.out);
    for(let i=0;i<8;i++){const x=X+4+Math.floor(ah(o.x,i,25)*(W-8)),y=Y+H-4+Math.floor(ah(o.y,i,26)*5);R(x,y,3,1,AP.bone);R(x,y+1,1,1,AP.out)}
    R(X+W-14,Y+H-2,12,1,AP.out);R(X+W-13,Y+H-3,10,1,AP.wood);R(X+W-14,Y+H-4,1,2,AP.wood);R(X+W-3,Y+H-4,1,2,AP.wood);return} // the bow
  if(k==='lean_to'){
    // The hunter's lean-to (v0.41.1, owner: the first one read as an upside-down pyramid). Open side faces you:
    // a pole roof sloping up and back from a ridge pole on two forked posts, a dark sleeping space under it with a fur on the ground,
    // a hide hung over one end against the wind.
    const ridge=Y+3,top=Y-15;shadow(X+1,Y+H-3,W-2,4);
    // roof: wider at the ridge, narrowing a little toward the back (top), poles running down the slope
    for(let y=top;y<=ridge;y++){const f=(y-top)/(ridge-top),inset=Math.round(5*(1-f)),x0=X+1+inset,x1=X+W-1-inset;
      R(x0-1,y,x1-x0+2,1,AP.out);for(let x=x0;x<x1;x++){const c=(x-X)%4===0?AP.woodDk:(x-X)%4===1?AP.woodHi:AP.wood;R(x,y,1,1,y===top?AP.out:c)}}
    R(X+8,top+3,10,2,AP.mossHi);R(X+28,top+6,7,2,AP.mossHi); // moss and needles on the poles
    // ridge pole, posts, the space under it
    R(X+1,ridge,W-2,4,AP.out);R(X+2,ridge+1,W-4,2,AP.trunk);R(X+2,ridge+1,W-4,1,AP.trunkHi);
    R(X+5,ridge+4,W-10,H-ridge+Y-7,'#0b0907');R(X+8,Y+H-8,W-20,3,'#6a5038');R(X+8,Y+H-8,W-20,1,'#8a6a4a'); // the dark inside, a fur bed
    [X+3,X+W-6].forEach(x=>{R(x-1,ridge-2,5,Y+H-ridge,AP.out);R(x,ridge-1,3,Y+H-ridge-2,AP.wood);R(x,ridge-1,1,Y+H-ridge-2,AP.woodHi);R(x-1,ridge-3,1,2,AP.out);R(x+3,ridge-3,1,2,AP.out)});
    R(X+W-15,ridge+3,9,13,AP.out);R(X+W-14,ridge+3,7,12,'#8a6a4a');R(X+W-14,ridge+3,7,1,'#a88a64');R(X+W-13,ridge+14,5,1,'#6a5038'); // hide over the end
    return}
  if(k==='drying_rack'){
    // A tanning frame (v0.41, owner: the old pole rack didn't read): a square wooden frame standing on its feet,
    // a wolf hide stretched inside it, laced to the frame at the edges.
    const fx=X+3,fy=Y-14,fw=26,fh=26;shadow(X+2,Y+12,W-4,3);
    R(fx-1,fy-1,4,fh+3,AP.out);R(fx+fw-3,fy-1,4,fh+3,AP.out);R(fx-1,fy-1,fw+1,4,AP.out);R(fx-1,fy+fh-5,fw+1,4,AP.out);
    R(fx,fy,2,fh+1,AP.wood);R(fx+fw-2,fy,2,fh+1,AP.woodDk);R(fx,fy,fw-1,2,AP.woodHi);R(fx,fy+fh-4,fw-1,2,AP.wood);
    R(fx-3,fy+fh,6,2,AP.out);R(fx+fw-4,fy+fh,6,2,AP.out); // feet
    // the hide: wide in the middle, legs reaching to the corners
    const hx=fx+fw/2-1,hy=fy+fh/2-2;
    const rows=[[-4,4],[-6,6],[-8,8],[-7,7],[-7,7],[-7,7],[-6,6],[-7,7],[-8,8],[-6,6],[-4,4]];
    rows.forEach(([a,b],r)=>{const y=hy-5+r;R(hx+a-1,y,b-a+2,1,AP.out)});
    rows.forEach(([a,b],r)=>{const y=hy-5+r;R(hx+a,y,b-a,1,'#a8825c');R(hx+a,y,2,1,'#c49e74');if(r>3&&r<8)R(hx-1,y,2,1,'#8a6a4a')});
    [[-9,-7],[8,-7],[-9,6],[8,6]].forEach(([dx,dy])=>{R(hx+dx,hy+dy,2,2,'#a8825c');R(hx+dx+(dx<0?-2:2),hy+dy+(dy<0?-2:2),2,1,'#d8c8a0')}); // legs and lacing
    [[-11,0],[10,0],[0,-9],[0,8]].forEach(([dx,dy])=>R(hx+dx,hy+dy,1,1,'#d8c8a0'));
    return}
  if(k==='trap'){
    // A sprung iron jaw trap, its teeth shut on nothing.
    R(X+3,Y+9,10,5,AP.out);R(X+4,Y+10,8,3,AP.iron);R(X+4,Y+10,8,1,AP.ironHi);[5,7,9,11].forEach(x=>R(X+x,Y+8,1,2,AP.ironTip));R(X+12,Y+11,4,1,AP.ironHi);return}
  if(k==='fallen_log'){
    // A fallen fir trunk lying across the ground: bark on top, a pale cut end, moss.
    shadow(X+2,Y+12,W-2,3);R(X,Y+3,W,11,AP.out);R(X+1,Y+4,W-2,9,AP.trunk);R(X+1,Y+4,W-2,2,AP.trunkHi);for(let x=6;x<W-6;x+=7)R(X+x,Y+7,3,1,AP.woodDk);
    R(X+W-8,Y+3,8,11,AP.out);R(X+W-7,Y+4,6,9,'#a88a64');R(X+W-5,Y+6,2,5,'#7a5a42');R(X+8,Y+3,6,2,AP.mossHi);return}
  if(k==='stump'){
    // An old cut stump with its rings showing.
    shadow(X+2,Y+12,13,3);R(X+3,Y+4,11,10,AP.out);R(X+4,Y+5,9,8,AP.trunk);R(X+4,Y+5,9,3,'#a88a64');R(X+6,Y+6,5,1,'#7a5a42');R(X+2,Y+12,3,2,AP.out);R(X+12,Y+12,3,2,AP.out);return}
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

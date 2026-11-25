// Areas built from text maps (js/data/maps): reads the map, paints its pixel-art ground once, and lists its lights, spawns and exits.
'use strict';
/* ---------- Reading the tables and a map file ---------- */
const AREA_TILES={},AREA_OBJS={};
TILESET.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_TILES[p[0]]={name:p[1],walk:p[2]==='1',tags:p.slice(4)}});
OBJECTS.trim().split('\n').slice(1).forEach(l=>{const p=l.trim().split(/\s+/);AREA_OBJS[p[0]]={w:+p[1],h:+p[2],blocks:p[3]==='1',light:+p[7]}});
// Map file mob names -> mob types in js/data/mobs.js. The Skeleton King uses Boss 1 until he has his own data.
const AREA_MOBS={corpse:'dead',rat:'rat',beetle:'beetle',crypt_rat:'crat',skeleton:'cskel',skeleton_king:'boss1',tunnel_rat:'trat',big_rat:'brat',old_gnawbone:'gnaw',ironshell:'ironshell',pale_rat:'palerat',weeping_bride:'bride',blight_wolf:'wolf',thornback_boar:'boar',greyfang:'greyfang',old_scar:'oldscar',cult_zealot:'zealot',cult_ashcaller:'ashcaller',cult_chanter:'chanter',ash_wisp:'wisp',ashen_acolyte:'acolyte',cult_mender:'mender',cult_deacon:'deacon',drowned_prior:'prior',bellringer:'bellringer',malrec:'malrec',great_wisp:'gwisp',cult_summoner:'summoner'};
const AREAS={}; // built once, the first time you enter
// Zone ids that are built from map files (the old 'gy' id is kept so explored maps carry over).
const AREA_OF={gy:'graveyard',crypt:'crypt',cross:'crossroads',tunnel:'rat_tunnel',wolf:'wolfwood',chapel:'chapel',d1:'dungeon1',d2:'dungeon1_f2'},ZONE_OF={graveyard:'gy',crypt:'crypt',crossroads:'cross',rat_tunnel:'tunnel',wolfwood:'wolf',chapel:'chapel',dungeon1:'d1',dungeon1_f2:'d2'};
// Each map's light: how bright the dark is (amb) and the colour of the night over it. Shared by render.js and the minimap.
const AREA_TINT={moonlit:{amb:0.44,col:'3,12,14',text:'#9fd8c0'},crypt:{amb:0.22,col:'2,4,14',text:'#9fb4ee'},dusk:{amb:0.5,col:'14,8,4',text:'#ffd8a0'},earth:{amb:0.34,col:'6,8,8',text:'#c8b89a'},wood:{amb:0.42,col:'6,12,8',text:'#c8dca0'},
  // Ruined Chapel (v0.62, Vesper embers): cold blue-grey dusk; the warmth comes from its candles, censers and embers.
  chapel:{amb:0.4,col:'8,10,20',text:'#f0c890'},
  // Dungeon 1 (v0.63): the crypt's cold blue-black, a touch brighter so the flood water, pews and cultists read on a phone.
  vault:{amb:0.3,col:'4,6,16',text:'#f0c890'}};
function curArea(){const k=AREA_OF[zoneId];return k?buildArea(k):null}
// Small integer hash so every tile gets the same "random" details each time (no effect on the game's seeded rolls).
function ah(x,y,s){let n=(x*374761393+y*668265263+(s||0)*1442695041)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296}

function buildArea(id){
  if(AREAS[id])return AREAS[id];
  const M=MAPS[id],rows=M.tiles,w=rows[0].length,h=rows.length;
  const A={id:id,name:M.name,w:w,h:h,rows:rows.slice(),map:[],objs:[],spawns:[],exits:[],fogs:[],lights:[],flames:[],chests:[],holes:[],named:[],start:null,tint:M.tint,enter:M.enter||'',wake:M.wake||'',instance:!!M.instance,seals:[]};
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
        // A named group (v0.63, Dungeon 1): group=<name> on the line puts the spawn in that group, whatever its kind
        // (Malrec and his deacons, the Bellringer and his two cultists).
        if(opt('group'))sp.group='g_'+opt('group');
        // Packs (wolves): spawns of a pack type standing within 3 tiles of one another fight together.
        else if(TYPES[sp.type]&&TYPES[sp.type].pack){const mate=A.spawns.find(o=>o!==sp&&o.type===sp.type&&!o.follow&&Math.hypot(o.x-sp.x,o.y-sp.y)<=3*T);
          sp.group=mate?(mate.group=mate.group||'pk'+A.spawns.indexOf(mate)):null}
        // Camps (v0.62, chapel cultists): any camp mobs standing within 3 tiles of one another are one camp.
        else if(TYPES[sp.type]&&TYPES[sp.type].camp){const mate=A.spawns.find(o=>o!==sp&&TYPES[o.type]&&TYPES[o.type].camp&&Math.hypot(o.x-sp.x,o.y-sp.y)<=3*T);
          sp.group=mate?(mate.group=mate.group||'cp'+A.spawns.indexOf(mate)):null}}
    else if(k==='exit')A.exits.push({name:p[1],tx:+p[2],ty:+p[3],to:(p.find(s=>s.indexOf('to=')===0)||'to=?').slice(3),at:(p.find(s=>s.indexOf('at=')===0)||'at=').slice(3)}); // at = the exit you arrive by on the other side
    else if(k==='critter')(A.critDefs=A.critDefs||[]).push({kind:p[1],x:+p[2]*T,y:+p[3]*T,n:+p[4]||1,high:p.indexOf('high')>0}); // small living things (v0.49, world.js)
    // A barred gate (v0.62, the chapel's east gate): closed until you lift the bar from the inside (the side named, W = west).
    // Once opened it stays open for every character (saved under ashfen-gates).
    else if(k==='bar')(A.bars=A.bars||[]).push({tx:+p[1],ty:+p[2],id:p[3],from:p[4]||'W'});
    // A seal (v0.63, Dungeon 1's stairs): tiles x0..x1, y0..y1 shut by a stone slab until you walk up to the object named.
    // v0.66: or, if the last word names a named on this map (drowned_prior), until that named dies (world.js openSeal).
    // In an instance it shuts again on every fresh run.
    else if(k==='seal')A.seals.push({x0:+p[1],y0:+p[2],x1:+p[3],y1:+p[4],by:p[5],open:false});
    // A locked room (v0.71, owner Nov 21: the Drowned Prior's chamber): step inside room=x0,y0,x1,y1 while the named is up and
    // a portcullis drops over the door tiles behind you, then the flood rises over the room's whole floor (world.js checkLocks).
    else if(k==='lockin'){const r=opt('room').split(',').map(Number);(A.locks=A.locks||[]).push({x0:+p[1],y0:+p[2],x1:+p[3],y1:+p[4],by:p[5],room:{x0:r[0],y0:r[1],x1:r[2],y1:r[3]},shut:false,done:false})}
    // The finale's room (v0.79, Dungeon 1's sanctum): tiles x0..x1, y0..y1 that flood when the finale starts, all but a dry
    // ring=N tiles round the middle (world.js startFinale). Walking back in after dying there starts the finale again.
    else if(k==='finale')A.finale={x0:+p[1],y0:+p[2],x1:+p[3],y1:+p[4],ring:+opt('ring')||3}
    else if(k==='fog')A.fogs.push({x:+p[1]*T,y:+p[2]*T,w:+p[3]*T,h:+p[4]*T});
    else if(k==='chest')A.chests.push({x:px(+p[1]),y:py(+p[2]),tx:+p[1],ty:+p[2],open:false,at:0});
    // The area's named rare (v0.32): its own spot, empty until a spawn somewhere in the area rolls it (world.js rollRare). up = still out there.
    else if(k==='rare'){const ty=AREA_MOBS[p[1]];if(TYPES[ty])A.rare={name:p[1],x:+p[2],y:+p[3],sp:{type:ty,x:px(+p[2]),y:py(+p[3]),timer:Infinity,mob:null,group:null,lv:TYPES[ty].lv,noRespawn:true,rare:1,up:false}}}
  });
  A.named.forEach(n=>{n.obj=n.summon?A.objs.find(o=>o.kind===n.summon):null});
  // An instance (v0.63, Dungeon 1): nothing comes back while you're inside; walking in again starts a fresh run.
  if(A.instance)A.spawns.forEach(sp=>{sp.noRespawn=true});
  // Walk map for the game's blocked(): 0 open, 2 water, 3 scenery, 5 buildings.
  for(let y=0;y<h;y++){A.map[y]=[];for(let x=0;x<w;x++){const t=AREA_TILES[rows[y][x]];A.map[y][x]=t.walk?0:(t.tags.indexOf('water')>=0?2:3)}}
  A.objs.forEach(o=>{if(!o.blocks)return;for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)A.map[y][x]=5;});
  // Slow ground (v0.63): flood water slows everyone who wades it, you and the mobs (moveToward, fx.js). Floaters skim over.
  A.slow=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(AREA_TILES[rows[y][x]].tags.indexOf('flood')>=0)A.slow[y*w+x]=1;
  // Wading water (v0.64, owner: the crossroads creek): wade: 1 on a map lets you walk into its water, slowed like the flood
  // in Dungeon 1, a little taste of what's to come. Mobs wade too. Drawn the same; you sink to your knees (render.js).
  if(M.wade)for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(rows[y][x]==='~'){A.map[y][x]=0;A.slow[y*w+x]=1}
  A.seals.forEach(sl=>{sl.obj=A.objs.find(o=>o.kind===sl.by)||null;sl.named=A.named.find(n=>n.name===sl.by)||null});sealArea(A);
  (A.locks||[]).forEach(L=>{L.named=A.named.find(n=>n.name===L.by)||null});
  (A.bars||[]).forEach(b=>{b.open=!!store.get('ashfen-gates',{})[b.id];if(!b.open)A.map[b.ty][b.tx]=5});
  // Holes in the tunnel walls: where Old Gnawbone's rats burrow out (the open floor just below each hole).
  for(let y=0;y<h-1;y++)for(let x=0;x<w;x++)if(rows[y][x]==='h'&&A.map[y+1][x]===0)A.holes.push({x:x*T+8,y:(y+1)*T+10});
  // Lights: torches and lanterns are warm, the crypt mouth is cold.
  A.objs.forEach(o=>{const cx=o.x*T+o.w*T/2;
    if(o.kind==='torch'){A.lights.push({x:cx,y:o.y*T-6,r:58,w:34});A.flames.push({x:cx,y:o.y*T-4,big:0})}
    if(o.kind==='town_gate'){const m=o.x*T+o.w*T/2;[m-22,m+23].forEach(x=>{A.lights.push({x:x,y:o.y*T+16-26,r:48,w:30});A.flames.push({x:x-6,y:o.y*T+16-22,big:0,lamp:1})})}
    if(o.kind==='lantern'){A.lights.push({x:cx,y:o.y*T-4,r:44,w:26});A.flames.push({x:cx,y:o.y*T-1,big:0,lamp:1})}
    // Wolfwood heart pass (v0.81): low gold dusk light through gaps in the canopy (more near the crossroads, fewer deeper in),
    // and foxfire's cold glow round the blight. Both drawn live too (world.js drawGlows).
    if(o.kind==='sunbeam'){A.lights.push({x:cx,y:o.y*T+8,r:46,w:20});(A.beams=A.beams||[]).push({x:cx,y:o.y*T+12,ph:ah(o.x,o.y,63)*6.3})}
    if(o.kind==='foxfire'){A.lights.push({x:cx,y:o.y*T+10,r:22,w:0,c:26});(A.fox=A.fox||[]).push({x:o.x*T,y:o.y*T,ph:ah(o.x,o.y,64)*6.3})}
    if(o.kind==='shack')A.lights.push({x:o.x*T+15,y:o.y*T+30,r:30,w:24}); // the gravedigger is home: his window throws a little warm light (v0.82)
    if(o.kind==='flowers'){A.lights.push({x:o.x*T+12,y:o.y*T+2,r:20,w:18});A.flames.push({x:o.x*T+12,y:o.y*T+2,big:0,tiny:1})} // a mourner's candle (v0.49)
    if(o.kind==='candle'){A.lights.push({x:cx,y:o.y*T+8,r:26,w:20});A.flames.push({x:cx-3,y:o.y*T+9,big:0,tiny:1},{x:cx+2,y:o.y*T+11,big:0,tiny:1})}
    if(o.kind==='brazier'){A.lights.push({x:cx,y:o.y*T-2,r:56,w:30});A.flames.push({x:cx,y:o.y*T+3,big:1})}
    if(o.kind==='crypt_mouth'){A.lights.push({x:cx,y:(o.y+o.h)*T-10,r:46,w:0})}
    if(o.kind==='campfire'){A.lights.push({x:cx,y:o.y*T+6,r:72,w:38});A.flames.push({x:cx,y:o.y*T+11,big:1,camp:1})}
    // Ruined Chapel (v0.62): the steeple's gold window, censer embers, the shrine's candle, the ash circle's coals, the smouldering books.
    if(o.kind==='chapel'){const wx=o.x*T+o.w*T/2;A.lights.push({x:wx,y:(o.y+o.h)*T-80,r:46,w:40},{x:wx,y:(o.y+o.h)*T-6,r:30,w:22})}
    if(o.kind==='censer'){A.lights.push({x:o.x*T+13,y:o.y*T-4,r:26,w:22});A.flames.push({x:o.x*T+13,y:o.y*T-7,big:0,tiny:1})}
    if(o.kind==='shrine'){A.lights.push({x:o.x*T+15,y:o.y*T-6,r:44,w:30});A.flames.push({x:o.x*T+15,y:o.y*T-10,big:0,tiny:1});(A.rests=A.rests||[]).push({x:o.x*T+16,y:o.y*T+8})}
    if(o.kind==='ash_circle'){A.lights.push({x:cx,y:o.y*T+26,r:30,w:30})}
    if(o.kind==='book_pyre'){A.lights.push({x:cx,y:o.y*T+8,r:28,w:26});A.flames.push({x:cx,y:o.y*T+8,big:0})}
    // Dungeon 1 (v0.63): coloured light through the stained glass, the altar's own candles.
    if(o.kind==='bell_mold'){A.lights.push({x:o.x*T+16,y:o.y*T+26,r:26,w:30})}
    if(o.kind==='window'){A.lights.push({x:cx,y:o.y*T+22,r:40,w:16,c:22})}
    if(o.kind==='altar'){A.lights.push({x:cx,y:o.y*T+4,r:34,w:26});A.flames.push({x:o.x*T+6,y:o.y*T-3,big:0,tiny:1},{x:o.x*T+o.w*T-6,y:o.y*T-3,big:0,tiny:1})}
    if(o.kind==='light_shaft'){A.lights.push({x:cx,y:o.y*T+8,r:54,w:0,c:30});A.motes=(A.motes||[]).concat([{x:cx,y:o.y*T+12}])} // cold daylight from a crack above
  });
  // Ember pits glow from below (every other tile is enough light).
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(rows[y][x]==='K'&&(x+y)%2===0)A.lights.push({x:x*T+8,y:y*T+8,r:30,w:34});
  const st=A.exits.find(e=>e.name===M.start)||A.exits[0];
  const edge=st.tx>=w-1||st.tx<=0||st.ty>=h-1||st.ty<=0;
  A.start=edge?{x:st.tx*T+8+(st.tx>=w-1?-48:st.tx<=0?48:0),y:st.ty*T+8+(st.ty>=h-1?-48:st.ty<=0?48:0)}:areaSpot(A,st); // a few steps inside, clear of the exit
  if(!A.start)A.start={x:st.tx*T+8,y:st.ty*T+8};
  if(M.startAt)A.start={x:M.startAt[0]*T+8,y:M.startAt[1]*T+8}; // v0.64: where you start and wake when the way in is a closed gate
  A.trees=[];A.world=paintArea(A);edgeWoods(A);
  // A flame behind a tree crown (v0.64, owner: a lantern flickering through a tree at the crossroads): flames draw after the
  // lighting, over everything, so one under a crown in front showed through the leaves. Those stay unlit-looking now.
  A.flames.forEach(f=>{f.hid=A.trees.some(t=>t.tree&&!t.tree.chapel&&f.x>=t.b[0]+6&&f.x<=t.b[2]-6&&f.y>=t.b[1]+6&&f.y<=t.y-4&&t.y>f.y+6)});
  AREAS[id]=A;return A;
}
// The woods carry on past the map edges (v0.64 top and bottom; v0.76 all four sides and the corners, for "Character always
// centred": the camera now shows past every edge). The edge's own trees carry on (so roads and clearings that run off the
// map stay open), and further out the gaps close up into deeper forest, with the odd dead snag. Outdoors only; you can
// never walk there. Shadows go into the mirrored ground strips.
const EDGE_DEPTH=14; // tiles of woods past each edge (the camera shows at most about half a screen, ~13 tiles, past an edge)
function edgeWoods(A){
  if(A.instance||A.tint==='earth'||A.tint==='crypt'||A.tint==='vault')return;
  const W=A.w,H=A.h,wd=A.world,treeN={tree:1,fir:1,dead_tree:1};
  const nm=(x,y)=>{x=Math.max(0,Math.min(W-1,x));y=Math.max(0,Math.min(H-1,y));return AREA_TILES[A.rows[y][x]].name};
  const open=n=>{const t=Object.values(AREA_TILES).find(t=>t.name===n);return t&&t.walk&&t.tags.indexOf('path')<0&&n!=='bridge'};
  const fallback=A.tint==='wood'||A.tint==='chapel'?'fir':'tree';
  const sh=(cv,x,y,r)=>{if(!cv)return;const g=cv.getContext('2d');g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(x,y,r,Math.max(2,Math.round(r/3)),0,0,7);g.fill()};
  // Each side: how long it runs, which map tile sits k rows in from it at position i, where tile k-out lands, and its shadow strip.
  // Left and right run past both ends (i from -EDGE_DEPTH) so the corners fill too.
  const SIDES=[
    {n:W,lo:0,hi:W,src:(i,k)=>nm(i,k-1),at:(i,k)=>[i,-k],cv:wd.edgeTop,shp:(x,y)=>[x,-y]},
    {n:W,lo:0,hi:W,src:(i,k)=>nm(i,H-k),at:(i,k)=>[i,H-1+k],cv:wd.edgeBot,shp:(x,y)=>[x,wd.edgeBot.height-(y-H*T)]},
    {n:H,lo:-EDGE_DEPTH,hi:H+EDGE_DEPTH,src:(i,k)=>nm(k-1,i),at:(i,k)=>[-k,i],cv:wd.edgeLeft,shp:(x,y)=>[-x,y]},
    {n:H,lo:-EDGE_DEPTH,hi:H+EDGE_DEPTH,src:(i,k)=>nm(W-k,i),at:(i,k)=>[W-1+k,i],cv:wd.edgeRight,shp:(x,y)=>[wd.edgeRight.width-(x-W*T),y]}];
  SIDES.forEach((S,si)=>{
    // The kind of wood an edge has: whatever tree is most common in its first few rows.
    const kindNear=i=>{const c={};for(let j=1;j<=4;j++)for(let d=-4;d<=4;d++){const n=S.src(i+d,j);if(treeN[n])c[n]=(c[n]||0)+1}
      return Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||fallback};
    for(let k=1;k<=EDGE_DEPTH;k++)for(let i=S.lo;i<S.hi;i++){
      const src=S.src(i,k);let n=null;
      if(treeN[src])n=ah(i,k,160+si*7)<0.9?src:null; // the edge's own trees carry on (one in ten left out, so it isn't a mirror)
      else if(k>=2&&open(src)&&[-1,0,1].every(d=>open(S.src(i+d,k))&&open(S.src(i+d,1)))&&ah(i,k,162+si*7)<Math.min(0.85,0.12+0.1*k))n=kindNear(i); // gaps close up further out, a few clearings stay
      if(!n)continue;if(n==='tree'&&ah(i,k,164+si*7)<0.05)n='dead_tree'; // now and then a dead snag
      const [tx,ty]=S.at(i,k),bx=tx*T,by=ty*T,im=pickTree(A,n,tx,ty);
      if(ty>=0&&ty<H||si<2){const [sx,sy]=S.shp(bx+8+im.shx,by+14);sh(S.cv,sx,sy,im.sh)} // corner shadows fall outside the strips
      A.trees.push(treeAt(im,bx,by,by+13))}});
}
// Shut every seal again (a fresh instance visit) and block its tiles.
function sealArea(A){A.seals.forEach(sl=>{sl.open=false;for(let y=sl.y0;y<=sl.y1;y++)for(let x=sl.x0;x<=sl.x1;x++)A.map[y][x]=5})}

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
  bark:'#7d786e',barkHi:'#aaa498',barkDk:'#4f4b44',
  // Ruined Chapel (v0.62, Vesper embers, from tools/chapel_takes.py take A): trampled ash, gravel, broken flagstones, herb rows,
  // running-bond grey stone with ivy, slate roofs, warm candle gold.
  ashG:['#2c2d2e','#302f2e','#343330','#2a2b2b'],ashHi:'#55534f',ashDk:'#212122',ember:'#ff8a3c',
  grav:['#4a4740','#4f4b44','#45423c','#535048'],gravHi:'#6a645a',gravDk:'#36332e',
  flag:['#4a4a52','#52525a','#46464e','#4e4e57'],flagLine:'#2a2a31',flagHi:'#64646e',
  herbG:['#283421','#2b3823','#2e3b25','#263020'],herb:'#3e5a32',herbHi:'#5e7a40',herbFl:'#9a86b0',
  cst:'#5a5a64',cstHi:'#84848e',cstDk:'#3a3a42',cstMor:'#2c2c33',ivy:'#34502e',ivyHi:'#4a6a3a',
  slate:'#3e3236',slateHi:'#54464a',slateDk:'#2a2226',gold:'#ffd070',goldHi:'#fff0c8',
  cloth:'#3a2a30',clothDk:'#281c22',sigil:'#aa2822',
  // Dungeon 1 (v0.63): knee-deep flood water over the crypt floor, dark pew wood, red cult cloth, stained glass, ember pits.
  flood:['#18252d','#1b2a33','#172229','#1e2e38'],floodHi:'#33505c',floodDk:'#0f181e',
  // v0.66: where the Drowned Prior's flood drained away: dark wet stone, silt, puddles left in the hollows, drowned weed.
  drained:['#262a30','#2a2f36','#23272c','#2e333a'],silt:'#3a3a34',weed:'#2e4436',weedHi:'#46604a',
  pew:'#4a3424',pewHi:'#6a4c34',pewDk:'#2e2016',red:'#7a1c1c',redHi:'#a8302a',redDk:'#4a1012',
  glassR:'#b0302a',glassB:'#3a5aa8',glassG:'#e0b040',glassV:'#5a8a4a',lead:'#14121a',
  pit:'#1a0f0c',coal:'#5a2414',emb:'#ff8a3c',embHi:'#ffd27a',clay:'#7a4a32',clayHi:'#9a6a48',clayDk:'#4a2c1e'};

function groundCol(n,r){
  if(n==='dead_grass')return AP.dg[Math.floor(r*4)];if(n==='grass')return AP.gg[Math.floor(r*4)];
  if(n==='dirt_path'||n==='gate'||n==='broken_fence')return r<0.5?AP.path:(r<0.8?'#54473a':AP.pathHi);
  if(n==='road')return r<0.6?AP.road:'#665443';if(n==='mud')return r<0.7?AP.mud:'#2c2820';if(n==='marsh')return r<0.6?AP.marsh:'#2a3a30';
  if(n==='water')return r<0.7?AP.water:'#16293a';if(n==='cave_dirt'||n==='dirt_slope')return AP.cave[Math.floor(r*4)];if(n==='bridge')return AP.road;if(n==='moss')return AP.mossG[Math.floor(r*4)];if(Array.isArray(AP[n]))return AP[n][Math.floor(r*4)];if(n==='fern')return AP.needles[Math.floor(r*4)];if(n==='ash')return AP.ashG[Math.floor(r*4)];if(n==='gravel')return AP.grav[Math.floor(r*4)];if(n==='flagstone')return AP.flag[Math.floor(r*4)];if(n==='herbs')return AP.herbG[Math.floor(r*4)];if(n==='floor'||n==='stairs')return r<0.5?AP.flr:(r<0.8?AP.flr2:AP.flrHi);if(n==='steps')return AP.flag[Math.floor(r*4)];return AP.dg[0]}
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
  else if(n==='cave_dirt')R(x,y,1,1,AP.caveHi);else if(n==='ash')R(x,y,1,1,AP.ashHi);else if(n==='gravel')R(x,y,2,1,AP.gravHi)}
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
const EDGE_STRIP=256; // game pixels of edge ground kept for the mirror past each map edge (more than the camera ever shows: about half a screen)
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
    if(A.instance){const nb=[[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy])=>AREA_TILES[tile(x+dx,y+dy)||'X']).find(t=>t.walk&&t.name!=='steps');return nb?nb.name:'floor'} // Dungeon 1: whatever floor is next to it
    if(n==='rock'||n==='bones'||n==='coffin')return 'floor';
    if(A.tint==='dusk')return 'grass';
    if(A.tint==='wood')return n==='dead_tree'?'blight':'needles'; // firs and boulders on needles, dead trees in the blight
    if(A.tint==='chapel')return n==='fir'||n==='boulder'||n==='tree'?'needles':n==='stone_wall'||n==='pillar'?'gravel':'ash'; // inside the wall it's trampled ash
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
      else if(gname==='cave_dirt'){
        if(i<2)R(x,y,1,1,AP.caveHi);else if(i===2)R(x,y,2,1,AP.caveDk);
        // drips darken the dirt (mushrooms at the foot of the walls: paintEarthWalls)
        else if(i===4&&r1<0.2)R(x,y,2,2,'#251f19')}
      else if(gname==='dirt_slope'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,3,k%2?'#3a3026':'#463a2c');R(bx,by+k*4,16,1,AP.root)}R(bx+3,by,1,16,AP.root);R(bx+11,by+2,1,14,AP.rootHi)}
      // Wolfwood floor (v0.40): rusty needles, soft moss, grey blight with ash and cracks, ferns.
      else if(gname==='needles'){if(i<4){R(x,y,2,1,i%2?AP.needleHi:AP.needleDk)}else if(i===4&&r1<0.25)R(x,y,1,1,AP.cone)}
      else if(gname==='moss'){if(i<2)R(x,y,3,2,AP.mossHi);else if(i===2)R(x,y,2,1,AP.mossDk);else if(i===3&&r1<0.3)R(x,y,1,1,'#7a8a4a')}
      else if(gname==='blight'){if(i<2)R(x,y,1,1,AP.ash);else if(i===2&&r1<0.5){R(x,y,3,1,AP.crack);R(x+2,y+1,2,1,AP.crack)}else if(i===3&&r1<0.2)R(x,y,2,1,AP.boneDk)}
      else if(gname==='fern'){if(i<3){const fx=x,fy=y;R(fx,fy,1,4,AP.fernDk);R(fx-2,fy+1,2,1,AP.fern);R(fx+1,fy+1,2,1,AP.fern);R(fx-1,fy+2,1,1,AP.fern);R(fx+1,fy+2,1,1,AP.fern);R(fx,fy-1,1,1,AP.fernHi)}}
      // Ruined Chapel ground (v0.62, Vesper embers): trampled ash with grey specks and charred bits (now and then a dying ember),
      // gravel paths with pebbles, broken flagstone slabs before the door (seams, cracks, the odd missing corner), herb rows.
      else if(gname==='ash'){if(i<2)R(x,y,1,1,AP.ashHi);else if(i===2)R(x,y,2,1,AP.ashDk);else if(i===3&&r1<0.25){R(x,y,3,1,'#1a1a1b');R(x+1,y-1,1,1,'#1a1a1b')}else if(i===4&&r1<0.07)R(x,y,1,1,'#a8502a')}
      else if(gname==='gravel'){if(i<3){R(x,y,2,1,AP.gravHi);R(x,y+1,2,1,AP.gravDk)}else if(i===3)R(x,y,1,1,AP.gravDk)}
      else if(gname==='flagstone'&&i===0){const sx=(ty%2)?8:0;R(bx,by,16,1,AP.flagLine);R(bx+sx,by,1,16,AP.flagLine);R(bx+1,by+1,6,1,AP.flagHi);
        if(r1<0.35){R(bx+4,by+5,1,1,AP.flagLine);R(bx+5,by+6,2,1,AP.flagLine);R(bx+7,by+7,1,2,AP.flagLine)} // a crack
        if(r2<0.18){R(bx+11,by+10,5,6,AP.ashG[1]);R(bx+11,by+10,5,1,AP.flagLine);R(bx+11,by+10,1,6,AP.flagLine);R(bx+13,by+13,1,1,AP.ashHi)}} // a corner gone, ash showing
      else if(gname==='herbs'&&i===0){for(let k=0;k<3;k++){const hx=bx+2+k*5,hy=by+7+((k+tx)%2);R(hx-1,hy+2,5,2,AP.out);R(hx,hy,3,3,AP.herb);R(hx-1,hy+1,1,2,AP.herb);R(hx+3,hy+1,1,2,AP.herb);R(hx,hy,1,1,AP.herbHi);R(hx+1,hy-1,1,1,AP.herbHi);
        if(ah(tx+k,ty,140)<0.4)R(hx+1+(k%2),hy,1,1,AP.herbFl)}R(bx,by+13,16,1,AP.dirt)}
      // Dungeon 1 (v0.63): flood water (ripples, a floating leaf of rot, the odd bone just under the surface) and stone steps.
      else if(gname==='flood'){if(i<2)R(x,y,4,1,AP.floodHi);else if(i===2)R(x+1,y+1,3,1,AP.floodDk);else if(i===3&&r1<0.12){R(x,y,3,1,AP.boneDk);R(x,y-1,1,1,AP.boneDk);R(x+2,y+1,1,1,AP.boneDk)}else if(i===4&&r1<0.25)R(x,y,1,1,AP.glint)}
      else if(gname==='drained'){if(i===0&&r1<0.45){R(x-2,y,6,2,AP.flood[1]);R(x-1,y,3,1,AP.floodHi)}else if(i===1)R(x,y,3,1,AP.silt);else if(i===2&&r1<0.5){R(x,y,1,3,AP.weed);R(x+1,y+1,1,2,AP.weed);R(x,y,1,1,AP.weedHi)}else if(i===3&&r1<0.15){R(x,y,3,1,AP.boneDk);R(x+2,y+1,1,1,AP.boneDk)}else if(i===4&&r1<0.3)R(x,y,1,1,AP.glint)}
      else if(gname==='steps'&&i===0){for(let k=0;k<4;k++){R(bx,by+k*4,16,4,k%2?'#3e3a46':'#4a4652');R(bx,by+k*4,16,1,'#6a6672');R(bx,by+k*4+3,16,1,'#26232e')}}
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

  // 1c) Rat tunnel earth walls with natural edges (v0.74), before the edge copies so the earth carries on past the map edge.
  paintEarthWalls(A,g,name);
  // Ground-only copies of the top and bottom edges, taken before any scenery: render mirrors these past the map edge so the
  // strip under the top bars (or the spell grid) shows ground carrying on, never black and never a doubled building (v0.55).
  {const E=Math.min(H,EDGE_STRIP),cut=y=>{const e=document.createElement('canvas');e.width=W;e.height=E;e.getContext('2d').drawImage(c,0,y,W,E,0,0,W,E);return e};
    c.edgeTop=cut(0);c.edgeBot=cut(H-E);
    // Left and right too (v0.76, character always centred: the camera now shows past those edges as well).
    const F=Math.min(W,EDGE_STRIP),cutX=x=>{const e=document.createElement('canvas');e.width=F;e.height=H;e.getContext('2d').drawImage(c,x,0,F,H,0,0,F,H);return e};
    c.edgeLeft=cutX(0);c.edgeRight=cutX(W-F);}

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
      else if(n==='stone_wall'){const isW=(x,y)=>{const m=name(x,y);return m==='stone_wall'||m==='gate'};drawStoneWall(R,g,bx,by,isW(tx,ty-1),isW(tx,ty+1),isW(tx+1,ty),isW(tx-1,ty),tx,ty)}
      else if(n==='pillar')drawColumn(R,g,bx,by,ah(tx,ty,17));
      else if(n==='palisade'){const isP=(x,y)=>name(x,y)==='palisade';drawPalisade(R,bx,by,isP(tx-1,ty),isP(tx+1,ty),tx,ty)}
      else if(n==='earth_wall'||n==='rat_hole'){} // drawn earlier as one shape (paintEarthWalls, v0.74)
      else if(n==='dirt_pile')drawDirtPile(R,bx,by,ah(tx,ty,14));
      else if(n==='bridge')drawBridge(R,bx,by,name(tx,ty-1)!=='bridge',name(tx,ty+1)!=='bridge');
      else if(n==='coffin')drawCoffin(R,bx,by,ah(tx,ty,12));
      else if(n==='pew')drawPew(R,g,bx,by,name(tx-1,ty)==='pew',name(tx+1,ty)==='pew',ah(tx,ty,18));
      else if(n==='bone_niche')drawNiche(R,bx,by,name(tx,ty+1)!=='rock'&&name(tx,ty+1)!=='bone_niche',ah(tx,ty,19));
      else if(n==='ember_pit'){const K=(x,y)=>name(x,y)==='ember_pit';drawEmberPit(R,bx,by,K(tx,ty-1),K(tx,ty+1),K(tx-1,ty),K(tx+1,ty),tx,ty)}
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
      if(o.kind==='chapel'){const im=chapelImg(o),X=o.x*T,Y=o.y*T;im.box=[0,0,im.c.width-1,im.c.height-1];
        A.trees.push({tree:im,x:X-im.ox,y:Y+o.h*T-1,px:X-im.ox,py:Y-im.oy,b:[X-im.ox,Y-im.oy+20,X-im.ox+im.c.width,Y+o.h*T],a:1});return} // sorted with characters, like a tree
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
// Rat tunnel walls with natural edges (v0.74, Zone 1 pass step 3): the earth walls used to follow the tile steps, so every
// cave edge was a staircase. Now they're one shape, like water (v0.52): a smoothed wall field plus two layers of wobble picks,
// pixel by pixel, wall or floor. Then, in the 3/4 view: a soil face 10 px tall wherever floor lies just below the wall (with
// stones, roots hanging out of it, rat holes), a lit lip on the far (north) rims, a thin rim on the sides, a damp shadow at
// the foot and pale mushrooms growing there. Walking stays on tiles: the drawn edge only moves a few pixels off the tile line,
// and the middle of an open tile is never drawn over.
const EARTH_FACE=10;
function paintEarthWalls(A,g,name){
  const solidT=(x,y)=>{if(x<0||y<0||x>=A.w||y>=A.h)return 1;const m=name(x,y);return m==='earth_wall'||m==='rat_hole'?1:0};
  let any=0;for(let y=0;y<A.h&&!any;y++)for(let x=0;x<A.w;x++)if(name(x,y)==='earth_wall'){any=1;break}
  if(!any)return;
  const W=A.w*T,H=A.h*T,N1=noiseGrid(W+32,H+32,13,231),N2=noiseGrid(W+32,H+32,5,232);
  // Wall-ness between tile centres (1 = wall), sampled in a small square so a staircase becomes a slope.
  const bl=(px,py)=>{const u=px/T-0.5,v=py/T-0.5,i=Math.floor(u),j=Math.floor(v),fx=u-i,fy=v-j;
    return solidT(i,j)*(1-fx)*(1-fy)+solidT(i+1,j)*fx*(1-fy)+solidT(i,j+1)*(1-fx)*fy+solidT(i+1,j+1)*fx*fy};
  const M=new Uint8Array(W*H);
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const tx=(px/T)|0,ty=(py/T)|0,ox=px-tx*T,oy=py-ty*T,st=solidT(tx,ty);
    // the middle of an open tile always stays floor (you stand there), the middle of a wall tile always stays wall
    if(ox>=4&&ox<12&&oy>=4&&oy<12){M[py*W+px]=st;continue}
    let f=0;for(let sy=-5;sy<=5;sy+=5)for(let sx=-5;sx<=5;sx+=5)f+=bl(px+sx,py+sy);f/=9;
    f+=(N1(px+16,py+16)-0.5)*0.36+(N2(px+16,py+16)-0.5)*0.16;
    M[py*W+px]=f>0.5?1:0}
  const wall=(x,y)=>x<0||y<0||x>=W||y>=H?1:M[y*W+x];
  const img=g.getImageData(0,0,W,H),d=img.data;
  const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const C={};const col=h=>C[h]||(C[h]=rgb(h));
  const put=(x,y,h)=>{const c=col(h),k=(y*W+x)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255};
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){
    if(!wall(px,py)){if(wall(px,py-1)&&py>0&&ah(px,py,41)<0.8)put(px,py,'#241e17');else if(wall(px,py-2)&&py>1&&ah(px,py,42)<0.4)put(px,py,'#2a231b');continue} // damp shadow at the foot
    let k=0;for(let s=1;s<=EARTH_FACE;s++)if(py+s<H&&!wall(px,py+s)){k=s;break}
    if(k){ // the soil face
      if(k===1)put(px,py,AP.out);
      else if(k===EARTH_FACE)put(px,py,'#46382a');
      else{const r=ah(px,py,43),band=5+Math.round((N1(px*3+16,py+16)-0.5)*4); // a wavy darker layer of soil across the face
        put(px,py,k===band?'#33281e':r<0.05?AP.earthFace:r<0.09?'#241c15':(k>7&&r<0.5)?'#4a3b2b':AP.earthFace2)}
      continue}
    if(py>0&&!wall(px,py-1))put(px,py,AP.earthHi);          // the lit far rim
    else if(py>1&&!wall(px,py-2))put(px,py,AP.out);
    else if(!wall(px-1,py)||!wall(px+1,py))put(px,py,'#1f1913'); // a thin rim on the sides
    else put(px,py,ah(px,py,44)<0.02?'#211b15':AP.earth)}
  g.putImageData(img,0,0);
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  // Where a face column ends: the last wall pixel above the floor, searched down from y0. -1 if there's no full face there.
  const footAt=(x,y0,y1)=>{for(let y=y0;y<y1&&y<H-1;y++)if(wall(x,y)&&!wall(x,y+1)){for(let s=1;s<EARTH_FACE;s++)if(!wall(x,y-s))return -1;return y}return -1};
  for(let ty=0;ty<A.h;ty++)for(let tx=0;tx<A.w;tx++){const n=name(tx,ty);if(n!=='earth_wall'&&n!=='rat_hole')continue;
    const bx=tx*T,by=ty*T;
    if(n==='rat_hole'){const f=footAt(bx+8,by+4,by+22);if(f<0)continue;const hy=f-15; // the hole sits on the foot of the face
      R(bx+3,hy+7,10,8,AP.out);R(bx+4,hy+8,8,7,'#050404');R(bx+5,hy+7,6,1,AP.out);R(bx+4,hy+8,8,1,'#2a2018');
      R(bx+2,hy+14,12,2,AP.caveHi);R(bx+1,hy+15,3,1,AP.earthFace);R(bx+12,hy+15,3,1,AP.earthFace);R(bx+6,hy+12,2,1,AP.boneDk);
      R(bx+3,f+1,9,1,AP.caveHi);R(bx+5,f+2,5,1,AP.cave[1]);continue} // gnawed bone in the mouth, loose dirt spilled out on the floor
    // a stone stuck in the soil
    if(ah(tx,ty,13)<0.5){const x=bx+2+Math.floor(ah(tx,ty,14)*11),f=footAt(x,by,by+22);if(f>=0&&footAt(x+2,f-1,f+3)===f){R(x,f-6,3,2,AP.out);R(x,f-6,2,1,AP.stoneDk);R(x+1,f-5,1,1,AP.stoneDk2)}}
    // roots: one or two hanging out of the face, a few with a pale tip, the odd one reaching the floor
    const nr=1+Math.floor(ah(tx,ty,15)*2);for(let i=0;i<nr;i++){const x=bx+1+Math.floor(ah(tx,ty,16+i)*14),f=footAt(x,by,by+22);if(f<0)continue;
      const len=3+Math.floor(ah(tx,ty,18+i)*8),top=f-EARTH_FACE+2;for(let s=0;s<len;s++)R(x+(s>len/2&&i%2?1:0),top+s,1,1,s<len-1?AP.root:AP.rootHi)}
    // pale mushrooms in the damp at the foot
    if(ah(tx,ty,20)<0.4){const x=bx+1+Math.floor(ah(tx,ty,21)*11),f=footAt(x,by,by+22);if(f>=0&&!wall(x+3,f+2)){R(x,f+2,2,1,AP.fungus);R(x,f+3,1,1,AP.fungusDk);R(x+3,f+3,1,1,AP.fungus)}}}
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
  // (heart pass, v0.59) old planks: one in a few has gone, showing the dark water under it, and the odd one is a shade off
  for(let y=0;y<16;y+=3){const r=ah(bx,by+y,61);if(r<0.12){R(bx+1,by+y,14,2,'#0d1a22');R(bx+3,by+y+1,4,1,AP.waterHi);continue}
    R(bx,by+y,16,2,r>0.8?'#5e4632':AP.plank);R(bx,by+y,16,1,AP.plankHi);R(bx+5+((y/3)%2)*6,by+y,1,2,AP.plankDk)}
  R(bx,by,1,16,AP.out);R(bx+15,by,1,16,AP.out);
  if(topEnd){R(bx,by-3,2,5,AP.woodDk);R(bx+14,by-3,2,5,AP.woodDk);R(bx,by-3,2,1,AP.moss)}if(botEnd){R(bx,by+13,2,4,AP.woodDk);R(bx+14,by+13,2,4,AP.woodDk);R(bx+14,by+16,2,1,AP.moss)}
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
/* ---------- Ruined Chapel (v0.62): low stone walls and cloister columns ----------
   A low wall seen from the 3/4 view: its top (light capstones) and, where nothing walls it in to the south, its front face in
   running-bond courses. East-west runs fill the tile; north-south runs are narrower so the turns meet at a square corner (a
   post). Ivy hangs off the top here and there, moss on the caps, a dark line and shadow at the foot. Recipe in area-rules.md. */
// Palisade (v0.64, the Town 1 wall at the crossroads): sharpened logs side by side, each a little different in height and
// lean, lashed with a rail, earth banked at the foot. Joins with its neighbours so a run reads as one wall.
function drawPalisade(R,bx,by,l,rt,tx,ty){
  for(let i=0;i<4;i++){const x=bx+i*4,h=22+Math.floor(ah(tx*4+i,ty,150)*6),top=by+14-h;
    R(x,top+2,4,h,AP.out);R(x+1,top+3,2,h-3,AP.wood);R(x+1,top+3,1,h-3,AP.woodHi);R(x+1,top+1,2,2,AP.out);R(x+1,top+2,2,1,AP.woodDk); // log with a point
    if(ah(tx*4+i,ty,151)<0.3)R(x+1,top+8+Math.floor(ah(tx,ty,152)*6),2,1,AP.woodDk)} // a knot
  R(bx-(l?0:1),by+1,16+(l?0:1)+(rt?0:1),3,AP.out);R(bx,by+2,16,1,AP.rut); // the rail
  R(bx,by+12,16,3,AP.dirt);R(bx,by+12,16,1,AP.dirtHi);if(ah(tx,ty,153)<0.5)R(bx+3+Math.floor(ah(tx,ty,154)*8),by+11,3,1,AP.moss)}
function drawStoneWall(R,g,bx,by,n,s,e,w,tx,ty){
  const hz=e||w||!(n||s),L=w?bx:bx+3,Rx=e?bx+16:bx+13,brick=(x0,y0,ww,hh)=>{R(x0,y0,ww,hh,AP.cst);for(let yy=0;yy<hh;yy+=4){R(x0,y0+yy+3,ww,1,AP.cstMor);const off=((ty*4+yy)/4)%2?4:0;for(let xx=x0+((x0+off)%8?8-((x0+off)%8):0);xx<x0+ww;xx+=8)R(xx,y0+yy,1,3,AP.cstMor)}};
  const top=(x0,y0,ww,hh)=>{R(x0-1,y0-1,ww+2,hh+1,AP.out);R(x0,y0,ww,hh,AP.cstHi);R(x0,y0,ww,1,'#9a9aa4');for(let xx=x0+5+Math.floor(ah(tx,ty,61)*3);xx<x0+ww-1;xx+=6+Math.floor(ah(xx,ty,62)*3))R(xx,y0+1,1,hh-1,AP.cstMor);
    if(ah(tx,ty,63)<0.35)R(x0+2+Math.floor(ah(tx,ty,64)*(ww-6)),y0+1,3,2,AP.moss)};
  if(hz){g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(L,by+15,Rx-L,3);brick(L,by+6,Rx-L,9);R(L,by+14,Rx-L,1,AP.cstDk);R(L,by+15,Rx-L,1,AP.out)}
  if(n||s){const y0=n?by-1:by-1,y1=s?by+16:by+6;if(!s){g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(bx+3,by+15,10,3);brick(bx+3,by+6,10,9);R(bx+3,by+14,10,1,AP.cstDk);R(bx+3,by+15,10,1,AP.out)}
    R(bx+2,y0,12,y1-y0,AP.out);R(bx+3,y0,10,y1-y0,AP.cst);R(bx+3,y0,2,y1-y0,AP.cstHi);R(bx+12,y0,1,y1-y0,AP.cstDk);for(let yy=y0+4+Math.floor(ah(tx,ty,65)*3);yy<y1-1;yy+=6)R(bx+3,yy,10,1,AP.cstMor);
    if(ah(tx,ty,66)<0.3)R(bx+5,by+4,3,3,AP.moss)}
  if(hz)top(L,by-1,Rx-L,7);
  // Ivy hanging off the top over the face, in clumps.
  if(hz&&ah(tx,ty,67)<0.4){const ix=L+2+Math.floor(ah(tx,ty,68)*(Rx-L-6));for(let k=0;k<4;k++){const h=3+Math.floor(ah(tx+k,ty,69)*6);R(ix+k,by+4,1,h,k%2?AP.ivy:AP.ivyHi);R(ix+k,by+4+h,1,1,AP.out)}R(ix-1,by+3,6,2,AP.ivy)}
}
// A cloister column: base, shaft lit from the left, capital. About one in four has broken off partway, its top jagged.
function drawColumn(R,g,bx,by,r){
  g.fillStyle='rgba(0,0,0,0.35)';g.beginPath();g.ellipse(bx+9,by+14,6,2,0,0,7);g.fill();
  const broke=r<0.25,top=broke?by-2-Math.floor(r*16):by-16;
  R(bx+3,by+10,10,5,AP.out);R(bx+4,by+11,8,3,AP.cst);R(bx+4,by+11,8,1,AP.cstHi);
  R(bx+4,top,8,by+11-top,AP.out);R(bx+5,top,6,by+11-top,AP.cst);R(bx+5,top,2,by+11-top,AP.cstHi);R(bx+10,top,1,by+11-top,AP.cstDk);
  if(broke){R(bx+5,top,2,1,AP.out);R(bx+8,top+1,3,1,AP.out);R(bx+7,top-1,1,1,AP.cstHi);R(bx+12,by+13,2,1,AP.cstDk);R(bx+13,by+12,1,1,AP.cst)} // chips at its foot
  else{R(bx+2,top-3,12,4,AP.out);R(bx+3,top-2,10,2,AP.cstHi);R(bx+3,top,10,1,AP.cstDk)}
  if(r>0.6){R(bx+5,by+2,1,6,AP.ivy);R(bx+6,by+4,1,4,AP.ivyHi);R(bx+5,by+1,2,1,AP.ivyHi)}
}
/* ---------- Dungeon 1 (v0.63): pews, bone niches, ember pits; altar, stained glass, refectory table, cage, bell mould ----------
   Shapes that make each one read (references first, recipes in area-rules.md): a pew is a long low bench with a tall back
   and carved end posts, in rows; a bone niche is an arched hole in the wall with a skull on the shelf; an ember pit is a
   stone-rimmed hole of glowing coals. */
function drawPew(R,g,bx,by,l,rt,r){
  g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(bx,by+13,16,2);
  const x0=bx+(l?0:2),x1=bx+(rt?16:14),w=x1-x0;
  R(x0,by+1,w,6,AP.out);R(x0,by+2,w,4,AP.pew);R(x0,by+2,w,1,AP.pewHi);R(x0,by+5,w,1,AP.pewDk); // the tall back rail
  R(x0,by+7,w,6,AP.out);R(x0,by+8,w,3,AP.pewHi);R(x0,by+11,w,1,AP.pewDk); // the seat
  if(!l){R(bx+1,by-1,3,15,AP.out);R(bx+2,by,1,13,AP.pewHi);R(bx+1,by-2,3,2,AP.out);R(bx+2,by-2,1,1,AP.pew)} // carved end post
  if(!rt){R(bx+12,by-1,3,15,AP.out);R(bx+13,by,1,13,AP.pew);R(bx+12,by-2,3,2,AP.out);R(bx+13,by-2,1,1,AP.pewDk)}
  if(r<0.25)R(x0+4+Math.floor(r*20),by+8,3,2,'#3a3238'); // a hymnal left on the seat
  if(r>0.85)R(x0+2,by+3,4,1,'#2a1e16'); // a crack in the back
}
function drawNiche(R,bx,by,face,r){
  drawRock(R,bx,by,face,false,r);
  const y=face?by+2:by+3;R(bx+3,y,10,10,AP.out);R(bx+4,y+2,8,8,'#08070b');R(bx+5,y+1,6,1,'#08070b');R(bx+4,y+10,8,1,AP.rockHi); // the arched hole and its sill
  if(r<0.75){R(bx+6,y+5,4,3,AP.bone);R(bx+6,y+5,4,1,'#d8d0c0');R(bx+6,y+6,1,1,AP.out);R(bx+9,y+6,1,1,AP.out);R(bx+7,y+8,2,1,AP.boneDk)} // a skull
  else{R(bx+5,y+8,6,1,AP.bone);R(bx+5,y+7,1,2,AP.bone);R(bx+10,y+7,1,2,AP.bone)} // a long bone
  if(r>0.5){R(bx+4,y+9,2,1,AP.boneDk);R(bx+11,y+9,1,1,AP.boneDk)}
}
function drawEmberPit(R,bx,by,n,s,w,e,tx,ty){
  R(bx,by,16,16,AP.pit);
  for(let i=0;i<14;i++){const x=bx+Math.floor(ah(tx,ty,200+i)*15),y=by+Math.floor(ah(tx,ty,220+i)*15),q=ah(tx,ty,240+i);R(x,y,2,1,q<0.35?AP.coal:q<0.7?AP.emb:q<0.85?'#c4471f':AP.embHi)}
  const rim=(x,y,ww,hh)=>{R(x,y,ww,hh,AP.stoneDk2);R(x,y,ww,1,AP.stone)};
  if(!n)rim(bx,by,16,3);if(!w)rim(bx,by,3,16);if(!e){R(bx+13,by,3,16,AP.stoneDk2);R(bx+13,by,1,16,AP.stoneDk)}if(!s){R(bx,by+13,16,3,AP.stoneDk);R(bx,by+15,16,1,AP.out)}
}
// Objects (drawObj): the altar, a stained-glass window, a refectory table, the cage with its monk, the bell mould.
function drawDungeonProp(g,R,o,X,Y,W,H,shadow){const k=o.kind;
  if(k==='altar'){
    // A stone altar under the cult's red cloth: thick slab top, the cloth hanging down the front with a black sigil, candles on top.
    shadow(X+2,Y+H-2,W,4);R(X-1,Y-7,W+2,H+7,AP.out);R(X,Y-6,W,5,AP.cstHi);R(X,Y-6,W,1,'#a8a8b2');R(X,Y-1,W,H+1,AP.cst);R(X,Y-1,3,H+1,AP.cstDk);R(X+W-3,Y-1,3,H+1,AP.cstDk);
    R(X+6,Y-6,W-12,2,AP.red);R(X+6,Y-4,W-12,H+2,AP.red);R(X+6,Y-4,W-12,1,AP.redHi);for(let i=X+8;i<X+W-8;i+=4)R(i,Y+H-3,2,1,AP.redDk); // the cloth and its frayed hem
    const cx=X+W/2;R(cx-3,Y+2,6,1,AP.out);R(cx-1,Y,2,6,AP.out);R(cx-4,Y+4,2,1,AP.out);R(cx+2,Y+4,2,1,AP.out); // the sigil
    [6,W-7].forEach(dx=>{R(X+dx-1,Y-10,3,5,AP.out);R(X+dx,Y-9,1,4,'#e8e0c8')}); // two fat candles (their flames are live)
    R(X+W/2-5,Y-8,10,2,AP.out);R(X+W/2-4,Y-8,8,1,AP.bellHi); // a gold bowl
    return true}
  if(k==='window'){
    // Stained glass in the wall: a tall pointed arch, leaded panes of red, blue, gold and green, a stone frame.
    const x=X+3,y=Y-10;R(x-1,y,12,22,AP.out);R(x,y+3,10,18,AP.cstDk);R(x+1,y+1,8,2,AP.cstDk);R(x+3,y,4,1,AP.cstDk);
    const P=[AP.glassR,AP.glassB,AP.glassG,AP.glassV];for(let j=0;j<6;j++)for(let i=0;i<2;i++){const c=P[(i+j*3+o.x)%4];R(x+2+i*3,y+3+j*3,3,3,c);R(x+2+i*3,y+3+j*3,1,1,shiftCol(c,[40,40,30]))}
    R(x+3,y+1,3,2,AP.glassG);R(x+5,y+3,1,18,AP.lead);R(x+2,y+9,6,1,AP.lead);R(x+2,y+15,6,1,AP.lead);R(x+1,y+20,8,1,AP.cstHi);
    return true}
  if(k==='table'){
    // A long refectory table: plank top, trestle legs, an open book, wooden bowls and a guttered candle stub.
    shadow(X+2,Y+12,W-2,3);R(X,Y+2,W,6,AP.out);R(X+1,Y+3,W-2,4,AP.plank);R(X+1,Y+3,W-2,1,AP.plankHi);for(let i=X+12;i<X+W-4;i+=12)R(i,Y+3,1,4,AP.plankDk);
    R(X+3,Y+7,3,7,AP.out);R(X+4,Y+7,1,6,AP.plankDk);R(X+W-6,Y+7,3,7,AP.out);R(X+W-5,Y+7,1,6,AP.plankDk);
    R(X+8,Y,8,4,AP.out);R(X+9,Y+1,3,2,'#d8d0b8');R(X+12,Y+1,3,2,'#c8c0a8');R(X+12,Y+1,1,2,AP.out); // an open book
    R(X+22,Y+1,6,3,AP.out);R(X+23,Y+1,4,1,AP.woodHi);R(X+32,Y+1,6,3,AP.out);R(X+33,Y+1,4,1,AP.woodHi); // bowls
    R(X+W-8,Y-1,2,4,'#d8d0b8');return true}
  if(k==='cage'){
    // An iron cage with a starved monk inside, hunched in his brown habit; bars in front, a hoop on top, a chain up into the dark.
    shadow(X+2,Y+H-3,W-2,4);const x0=X+4,x1=X+W-4,y0=Y-4,y1=Y+H-2;
    R(x0-1,y1-1,x1-x0+2,3,AP.out);R(x0,y1,x1-x0,1,AP.ironHi); // floor bar
    R(x0+7,y1-12,10,12,AP.out);R(x0+8,y1-11,8,11,'#5a4030');R(x0+8,y1-11,3,11,'#6e5038');R(x0+10,y1-15,5,5,AP.out);R(x0+11,y1-14,3,3,'#c8a888');R(x0+11,y1-14,3,1,'#5a4030'); // the monk
    for(let x=x0;x<=x1;x+=4){R(x,y0,1,y1-y0,AP.ironHi);R(x+1,y0,1,y1-y0,AP.out)}R(x0,y0,x1-x0+1,2,AP.ironHi);R(x0,y0+2,x1-x0+1,1,AP.out);
    R(X+W/2-1,y0-14,2,14,AP.iron);R(X+W/2-3,y0-3,6,2,AP.ironHi);return true}
  if(k==='bell_mold'){
    // The cult's new bell: a half-cast bell shape in a clay mould, sunk in a casting pit still hot along its seam.
    const cx=X+W/2,cy=Y+H-6;g.fillStyle='#120c0a';g.beginPath();g.ellipse(cx,cy,15,6,0,0,7);g.fill();
    for(let j=0;j<16;j++){const hw=4+Math.floor(j*j/30);R(cx-hw-1,cy-18+j,hw*2+2,1,AP.out);R(cx-hw,cy-18+j,hw*2,1,j<3?AP.clayHi:AP.clay);R(cx-hw,cy-18+j,2,1,AP.clayHi);R(cx+hw-2,cy-18+j,2,1,AP.clayDk)}
    R(cx-12,cy-3,24,2,AP.out);R(cx-11,cy-3,22,1,AP.emb);R(cx-6,cy-3,4,1,AP.embHi);R(cx-2,cy-21,4,3,AP.out);R(cx-1,cy-20,2,2,AP.clayDk); // hot seam, the pour hole
    R(X+W-4,Y+H-4,5,3,AP.out);R(X+W-3,Y+H-4,3,1,AP.ironHi);return true} // tongs left by the pit
  return false}
function drawPillar(R,x,y){R(x,y,8,14,AP.out);R(x+1,y+2,6,11,AP.brick);R(x+1,y+2,2,11,AP.brickHi);R(x,y,8,3,AP.stoneDk2);R(x+1,y,6,1,AP.stone);R(x+1,y+6,6,1,AP.mortar);R(x+1,y+10,6,1,AP.mortar)}

/* ---------- Ruined Chapel props (v0.62, Vesper embers; shapes from tools/chapel_takes.py take A, references first) ----------
   What makes each one read: the bell's flared mouth and crown loop; the shrine's little roof over a lit niche on a post; the
   censer's bowl on a chain with smoke; the banner's swallowtail and red ring; the well's round stone ring and crossbar. */
function drawChapelProp(g,R,o,X,Y,W,H,shadow){
  const k=o.kind,ell=(cx,cy,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fill()};
  if(k==='fallen_bell'){
    // The chapel's bell, down in the cloister: lying on its side, mouth facing east, cracked; the earth dug out under its lip
    // (the hidden chest sits there), its crown loop still on.
    const cx=X+5,cy=Y+18;ell(X+16,Y+28,15,4,'rgba(0,0,0,0.4)');
    for(let i=0;i<21;i++){const fl=i<3?[3,5,6][i]:6+Math.floor((i-3)*(i-3)/40);for(let j=-fl-1;j<=fl+1;j++){const edge=Math.abs(j)>=fl||i===0;
      R(cx+i,cy+j,1,1,edge?AP.out:j<-fl/3?'#a08a50':j<fl/3?'#7a6634':'#56461f')}}
    for(let j=-12;j<=12;j++)R(cx+20,cy+j,2,1,AP.out); // the lip, seen edge-on
    R(cx+21,cy-11,1,22,'#56461f');R(cx+21,cy-11,1,8,'#7a6634');
    [[6,-3],[7,-2],[8,-2],[9,-1],[10,0],[11,0],[12,1],[13,2]].forEach(([i,j])=>R(cx+i,cy+j,1,1,AP.out)); // the crack
    R(cx+3,cy-6,2,1,'#c9b070');R(cx+8,cy-8,3,1,'#c9b070');R(cx+12,cy+4,1,1,'#4f7a5a');R(cx+5,cy+3,2,1,'#4f7a5a'); // shine, patina
    R(cx-4,cy-2,4,4,AP.out);R(cx-3,cy-1,2,2,'#56461f'); // crown loop
    R(cx+18,cy+12,9,3,AP.dirt);R(cx+19,cy+12,6,1,AP.dirtHi);R(cx+24,cy+11,3,1,AP.dirt); // dug earth at the lip
    R(X+22,Y+2,4,2,AP.moss);return true}
  if(k==='ash_circle'){
    // The cult's ritual ring: a ring of pale ash and salt on the ground, scorched inside, a heap of embers in the middle.
    // Ground only: you walk over it. The embers glow (light 1).
    const cx=X+W/2,cy=Y+H/2+2;
    for(let a=0;a<120;a++){const an=a/120*6.283,rr=1+((a*7)%5===0?1:0);const x=Math.round(cx+Math.cos(an)*21),y=Math.round(cy+Math.sin(an)*14);R(x,y,rr,1,a%3?'#b2ac9f':'#8a857c');if(a%9===0)R(x,y+1,1,1,'#6a675f')}
    for(let i=0;i<46;i++){const an=ah(o.x,i,150)*6.283,d=ah(i,o.y,151)*15;R(Math.round(cx+Math.cos(an)*d*1.3),Math.round(cy+Math.sin(an)*d*0.85),2,1,'#1c1b1c')}
    ell(cx,cy,7,4,'#1a1312');ell(cx,cy,5,3,'#5a2414');[[-3,0,'#ff8a3c'],[1,-1,'#ffb060'],[2,1,'#c4471f'],[-1,1,'#ff6a2a'],[0,0,'#ffd27a']].forEach(([x,y,c])=>R(cx+x,cy+y,2,1,c));
    return true}
  if(k==='shrine'){
    // Pilgrims' wayside shrine (rest spot): a stone post holding a little stone box with a lit candle in its niche, under a
    // small pitched slate roof. Offerings at its foot.
    const x=X+12,y=Y+15;shadow(X+6,Y+13,22,3);
    R(x-1,y-16,8,17,AP.out);R(x,y-15,6,15,AP.cst);R(x,y-15,2,15,AP.cstHi);R(x+5,y-15,1,15,AP.cstDk); // post
    R(x-6,y-28,18,13,AP.out);R(x-5,y-27,16,11,AP.cst);R(x-5,y-27,3,11,AP.cstHi);R(x-1,y-25,8,7,'#18141a');R(x,y-24,6,1,AP.out); // box and niche
    R(x+2,y-22,2,4,'#e8e0c8');R(x+2,y-24,2,2,AP.gold);R(x+2,y-25,1,1,AP.goldHi); // the candle
    for(let j=0;j<6;j++){R(x-8+j,y-29-j,20-2*j,1,AP.out);if(j<5)R(x-7+j,y-29-j,(18-2*j)>>1,1,AP.slateHi),R(x-7+j+((18-2*j)>>1),y-29-j,(18-2*j)-((18-2*j)>>1),1,AP.slate)}
    R(x-8,y-29,20,1,AP.out);R(x+1,y-35,4,1,AP.out); // eaves and ridge
    R(x-4,y-1,3,2,'#c8b890');R(x+7,y,2,1,'#8a2a20');R(x+9,y-1,1,2,'#e8e0c8'); // offerings: a folded cloth, a ribbon, a stub of candle
    return true}
  if(k==='censer'){
    // A standing censer: an iron hook on a pole with a brass bowl on its chain; embers inside, smoke rising (drawn live).
    shadow(X+4,Y+13,9,2);R(X+7,Y-14,3,28,AP.out);R(X+8,Y-13,1,26,AP.woodHi);R(X+7,Y-14,8,2,AP.out);R(X+8,Y-13,6,1,AP.ironHi);
    R(X+13,Y-12,1,5,'#8d8692');R(X+10,Y-7,7,6,AP.out);R(X+11,Y-6,5,4,'#8a6f1a');R(X+11,Y-6,2,1,'#c9a227');R(X+12,Y-7,3,1,'#ff8a3c');R(X+13,Y-8,1,1,'#ffd27a');
    R(X+5,Y+12,7,2,AP.out);return true}
  if(k==='banner'){
    // A cult banner nailed over the wall: a pole across the top, dark cloth with a swallowtail cut and a red ring.
    const x=X+4,y=Y+1;R(x-2,y-1,12,2,AP.out);R(x-1,y-1,10,1,AP.woodHi);
    for(let j=0;j<15;j++)for(let i=0;i<8;i++){if(j>11&&(i===3||i===4)&&j-11>Math.abs(i-3.5)-0.5)continue;
      const d=(i-3.5)*(i-3.5)+(j-5.5)*(j-5.5),edge=i===0||i===7||j===14||(j>11&&(i===2||i===5));
      R(x+i,y+1+j,1,1,edge?AP.out:d<6&&d>1.6?AP.sigil:i<4?AP.cloth:AP.clothDk)}
    return true}
  if(k==='torn_banner'){
    // The monks' white banner, torn down and left crumpled at the foot of the wall: pale cloth, a gold sun stitched on it.
    shadow(X+2,Y+12,13,2);R(X+1,Y+7,14,7,AP.out);R(X+2,Y+8,12,5,'#c8c0b0');R(X+2,Y+11,12,2,'#a39c8e');R(X+5,Y+6,6,2,AP.out);R(X+6,Y+7,4,1,'#d8d0c0');
    R(X+7,Y+9,3,2,'#c9a227');R(X+6,Y+10,1,1,'#c9a227');R(X+10,Y+10,1,1,'#c9a227');R(X+8,Y+8,1,1,'#c9a227');R(X+12,Y+12,3,1,'#5a4030');return true}
  if(k==='bedroll'){
    // A cultist's bedroll: a rolled blanket with a sack for a pillow.
    shadow(X+1,Y+12,14,2);R(X+1,Y+6,14,7,AP.out);R(X+2,Y+7,12,5,'#5a4a3c');R(X+2,Y+7,12,1,'#6e5c4a');R(X+5,Y+7,1,5,'#3e3228');R(X+10,Y+7,1,5,'#3e3228');
    R(X+11,Y+4,5,5,AP.out);R(X+12,Y+5,3,3,'#7a6a52');return true}
  if(k==='well'){
    // The courtyard well: a round ring of stones (seen from above at an angle), dark water deep inside, two posts and a
    // crossbar with the rope and a bucket.
    const cx=X+16,cy=Y+20;ell(cx+1,cy+8,15,4,'rgba(0,0,0,0.35)');ell(cx,cy,14,9,AP.out);ell(cx,cy,13,8,AP.cst);
    for(let a=0;a<20;a++){const an=a/20*6.283;R(Math.round(cx+Math.cos(an)*11),Math.round(cy+Math.sin(an)*6.5),1,1,AP.cstMor)}
    ell(cx,cy-1,8,4.5,AP.out);ell(cx,cy-1,7,3.5,'#0e1a22');R(cx-3,cy-2,3,1,'#22404e');
    R(cx-12,cy+3,24,4,AP.cstDk);R(cx-12,cy+3,24,1,AP.cstHi);for(let x=cx-11;x<cx+12;x+=5)R(x,cy+4,1,3,AP.cstMor); // the ring's front face
    [cx-13,cx+11].forEach(px=>{R(px,cy-22,3,26,AP.out);R(px+1,cy-21,1,24,AP.woodHi)});R(cx-13,cy-23,27,3,AP.out);R(cx-12,cy-22,25,1,AP.wood);
    R(cx,cy-20,1,14,'#8a7f70');R(cx-2,cy-7,5,4,AP.out);R(cx-1,cy-6,3,2,AP.wood);R(X+3,Y+2,4,2,AP.moss);return true}
  if(k==='book_pyre'){
    // The monks' books, burned before the chapel door: a low heap of charred books, a few pale pages, a small flame (it
    // smoulders; the flame and smoke are drawn live).
    shadow(X+1,Y+12,15,3);R(X+1,Y+7,14,7,AP.out);R(X+2,Y+8,12,5,'#2a2420');[[2,8,5,'#3e2c22'],[7,9,6,'#4a3424'],[4,11,7,'#33261e']].forEach(([x,y,w,c])=>{R(X+x,Y+y,w,2,c);R(X+x,Y+y,w,1,'#1a1412')});
    R(X+4,Y+5,7,3,AP.out);R(X+5,Y+6,5,1,'#3e2c22');R(X+3,Y+12,3,1,'#c8b890');R(X+11,Y+10,3,1,'#d8ccaa');R(X+12,Y+13,2,1,'#c8b890');R(X+6,Y+9,2,1,'#ff6a2a');R(X+10,Y+12,1,1,'#c4471f');return true}
  if(k==='pack'){
    // A pilgrim's pack dropped by the shrine, a walking staff leaning on it.
    shadow(X+2,Y+12,11,2);R(X+3,Y+5,9,9,AP.out);R(X+4,Y+6,7,7,'#7a5a3a');R(X+4,Y+6,2,7,'#8f6c48');R(X+5,Y+4,5,2,AP.out);R(X+6,Y+5,3,1,'#5a4030');
    R(X+4,Y+9,7,1,'#5a4030');for(let j=0;j<16;j++)R(X+13-Math.floor(j/5),Y-3+j,2,1,j%5===0?AP.out:'#8a6a48');return true}
  return false}
// The chapel (v0.62): the landmark of the grounds and the door to Dungeon 1. A long nave running north under a slate roof
// with holes in it, its front gable facing south, and the steeple rising from the front: whole, with one gold-lit window (the
// breadcrumb you see from the road in) and the empty belfry where the fallen bell hung. An arched door sized for people.
// Drawn on its own picture and sorted like a tree, so anyone north of its front wall is behind it and it fades for you.
function chapelImg(o){
  const W=o.w*T,H=o.h*T,PAD=8,UP=72,c=document.createElement('canvas');c.width=W+PAD*2;c.height=H+UP+4;const g=c.getContext('2d');
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x+PAD,y+UP,w,h)};
  const brick=(x0,y0,w,h,lit)=>{R(x0,y0,w,h,AP.cst);for(let yy=0;yy<h;yy+=4){R(x0,y0+yy+3,w,1,AP.cstMor);const off=((yy/4)%2)?4:0;for(let xx=off;xx<w;xx+=8)R(x0+xx,y0+yy,1,3,AP.cstMor)}if(lit)R(x0,y0,3,h,AP.cstHi)};
  const fy=H-1,mid=Math.round(W/2),fx0=3,fx1=W-3;
  // shadow on the ground behind the front
  g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(PAD+fx0+4,UP+fy-2,fx1-fx0,5);
  // roof: two slopes running back north from the gable, slate rows, a dark ridge; two holes with the rafters showing
  const ry0=8,ry1=fy-34;R(fx0+1,ry0-1,fx1-fx0-2,ry1-ry0+2,AP.out);
  for(let y=ry0;y<ry1;y++){for(let x=fx0+2;x<fx1-2;x++){let col=x<mid?AP.slateHi:AP.slate;if((y+(x%6))%6===0)col=AP.slateDk;if(x===mid||x===mid-1)col=AP.out;R(x,y,1,1,col)}}
  [[mid+18,30,9,6],[mid-30,52,7,5]].forEach(([hx,hy,rw,rh])=>{for(let y=-rh;y<=rh;y++)for(let x=-rw;x<=rw;x++){const q=(x*x)/(rw*rw)+(y*y)/(rh*rh);if(q<1)R(hx+x,hy+y,1,1,q>0.7?AP.out:'#141117')}
    for(let x=-rw+2;x<rw-1;x+=4)R(hx+x,hy-rh+1,1,rh*2-1,AP.woodDk)});
  R(fx0+8,ry0+20,3,2,AP.moss);R(fx1-16,ry0+60,4,2,AP.moss);
  // front wall with the gable over it
  R(fx0-1,fy-35,fx1-fx0+3,37,AP.out);brick(fx0,fy-34,fx1-fx0+1,34,true);R(fx0,fy-1,fx1-fx0+1,1,AP.cstDk);
  for(let j=0;j<22;j++){const half=Math.round((fx1-fx0)/2-j*((fx1-fx0)/2)/22);R(mid-half-1,fy-35-j,half*2+3,1,AP.out);R(mid-half,fy-35-j,half*2+1,1,(j%4===3)?AP.cstMor:AP.cst);R(mid-half,fy-35-j,3,1,AP.cstHi)}
  // two narrow dark windows in the front wall, either side of the tower
  [fx0+12,fx1-17].forEach(wx=>{R(wx-1,fy-28,7,16,AP.out);R(wx,fy-27,5,14,'#18141c');R(wx+2,fy-29,1,1,AP.out);R(wx,fy-14,5,1,AP.cstHi)});
  // ivy up the east corner, rubble at the foot
  for(let y=fy-30;y<fy;y++)R(fx1-1-(y%3===0?1:0),y,1,1,y%2?AP.ivy:AP.ivyHi);R(fx1-3,fy-31,4,2,AP.ivy);
  for(let x=fx0+3;x<fx1-2;x+=9){R(x,fy+1,2,1,AP.cstDk);R(x+1,fy,1,1,AP.cst)}
  // the steeple: a square tower over the door, running-bond stone lit from the left, a cornice band, a pointed slate spire
  const tx0=mid-15,tx1=mid+15,tt=fy-100;
  R(tx0-1,tt-1,tx1-tx0+3,fy-tt+2,AP.out);brick(tx0,tt,tx1-tx0+1,fy-tt,true);R(tx1-2,tt,3,fy-tt,AP.cstDk);
  R(tx0-3,tt-2,tx1-tx0+7,5,AP.out);R(tx0-2,tt-1,tx1-tx0+5,3,AP.cstHi);R(tx0-2,tt+1,tx1-tx0+5,1,AP.cstDk); // cornice
  R(tx0-1,fy-58,tx1-tx0+3,3,AP.out);R(tx0,fy-57,tx1-tx0+1,1,AP.cstHi); // string course between door and window
  for(let j=0;j<50;j++){const half=Math.max(0,15-Math.floor(j*15/48));R(mid-half-1,tt-3-j,half*2+3,1,AP.out);if(half>0){R(mid-half,tt-3-j,half,1,AP.slateHi);R(mid,tt-3-j,half+1,1,AP.slate);if(j%5===4)R(mid-half,tt-3-j,half*2+1,1,AP.slateDk)}}
  R(mid,tt-58,1,6,AP.out);R(mid-2,tt-56,5,1,AP.out); // a small iron cross at the tip
  // the one lit window (gold), arched, high in the tower
  const wy=fy-86;R(mid-6,wy-1,13,17,AP.out);R(mid-5,wy+3,11,12,AP.gold);for(let y=0;y<4;y++){const h=[2,4,5,5][y];R(mid-h,wy+y,h*2+1,1,AP.gold)}R(mid,wy,1,15,'#c89a40');R(mid-5,wy+8,11,1,'#c89a40');R(mid-3,wy+2,2,3,AP.goldHi);
  // the empty belfry where the bell hung: a dark arch with the beam still across it
  const by=fy-72;R(mid-7,by-1,15,13,AP.out);R(mid-6,by+2,13,9,'#141117');for(let y=0;y<3;y++){const h=[3,5,6][y];R(mid-h,by+y,h*2+1,1,'#141117')}R(mid-6,by+3,13,2,AP.woodDk);R(mid-1,by+5,2,2,AP.out);
  // the arched door (the way into Dungeon 1): 17 wide, 26 tall, dark old wood in planks with iron bands, a pale stone surround
  const dy=fy-26;R(mid-10,dy-4,21,31,AP.out);R(mid-9,dy-3,19,29,AP.cstHi);R(mid-8,dy,17,26,AP.out);
  for(let y=0;y<26;y++){const h=y<5?[4,6,7,8,8][y]:8;for(let x=-h;x<=h;x++)R(mid+x,dy+y,1,1,(x===0)?AP.out:(x+8)%4===0?'#2a1a12':x<0?'#3e2a1c':'#4a3222')}
  R(mid-8,dy+9,17,1,'#2b2738');R(mid-8,dy+19,17,1,'#2b2738');R(mid+3,dy+14,2,2,'#c9a227'); // iron bands, the ring
  R(mid-11,fy-1,23,2,AP.cstDk); // the step
  return {c:c,ox:PAD,oy:UP,box:null}}
function drawObj(g,R,o){
  const X=o.x*T,Y=o.y*T,W=o.w*T,H=o.h*T,k=o.kind;
  const shadow=(x,y,w,h)=>{g.fillStyle='rgba(0,0,0,0.35)';g.fillRect(x,y,w,h)};
  const bricks=(x,y,w,h,base,hi)=>{R(x,y,w,h,base);for(let yy=0;yy<h;yy+=4){R(x,y+yy,w,1,AP.mortar);const off=(yy/4)%2?4:0;for(let xx=off;xx<w;xx+=8)R(x+xx,y+yy,1,4,AP.mortar);if(hi)for(let xx=off+1;xx<w;xx+=8)R(x+xx,y+yy+1,3,1,hi)}};
  if(drawChapelProp(g,R,o,X,Y,W,H,shadow))return;
  if(drawDungeonProp(g,R,o,X,Y,W,H,shadow))return;
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
    // Gravedigger's shack, rebuilt (v0.82, owner: the little shacks could look a lot better). Drawn like a real timber
    // hut in 3/4 view: a stone footing, a board wall between two corner posts, and a big roof of wooden shakes seen
    // from above, overhanging the wall with a shadow under the eaves (the old roof was a thin strip, so it read as a box).
    // Still the person-sized door, the lit window with a shutter hanging off, his woodpile and spade, a rain barrel at
    // the corner and a bucksaw hung on the wall. Smoke from the stone chimney is drawn live (world.js).
    const base=Y+H,wallTop=Y+12,eave=Y+15,ridge=Y-20;shadow(X-2,base-2,W+6,5);
    // stone footing
    R(X-1,base-6,W+2,6,AP.out);for(let x=0,i=0;x<W;i++){const w=5+Math.floor(ah(o.x+i,1,81)*4);R(X+x,base-5,w-1,4,i%2?AP.stoneDk:AP.stone);R(X+x,base-5,w-1,1,AP.stoneHi);x+=w}
    // the board wall, darker and damp toward the foot, nail heads, a beam across
    R(X-1,wallTop,W+2,base-6-wallTop,AP.out);
    for(let x=0,i=0;x<W;x+=5,i++){const c=['#5a4030','#523a2b','#614634','#4e3828'][Math.floor(ah(o.x,i,82)*4)];R(X+x,wallTop,4,base-6-wallTop,c);R(X+x,wallTop,1,base-6-wallTop,'#6e523c');R(X+x+4,wallTop,1,base-6-wallTop,'#2e2018');R(X+x+2,base-13,1,1,'#2e2018');R(X+x+2,eave+5,1,1,'#2e2018')}
    R(X,base-12,W,6,'rgba(20,14,10,0.35)');R(X,base-21,W,3,AP.out);R(X,base-20,W,1,AP.woodHi);
    [X-2,X+W-3].forEach(px=>{R(px,wallTop,5,base-6-wallTop,AP.out);R(px+1,wallTop,3,base-6-wallTop,'#3e2c1e');R(px+1,wallTop,1,base-6-wallTop,'#5a4030')}); // corner posts
    R(X+28,eave+6,1,14,'#6e523c');R(X+29,eave+6,1,14,'#1e140e'); // one sprung board
    // the roof: rows of overlapping shakes, each lit on its top edge with a dark line under each row
    const rx0=X-5,rx1=X+W+5;R(rx0-1,ridge-1,rx1-rx0+2,eave-ridge+3,AP.out);
    for(let row=0,y=ridge+1;y<eave;row++,y+=4){for(let x=rx0+(row%2?3:0),i=0;x<rx1;i++){const w=5+Math.floor(ah(i,row,83)*3),c=['#4a2e1a','#3b2616','#5a3a22','#45291a'][Math.floor(ah(i,row,84)*4)];
        R(x,y,Math.min(w-1,rx1-x),4,c);R(x,y,Math.min(w-1,rx1-x),1,'#6e4a2c');R(x+w-1,y,1,4,'#24160c');x+=w}
      R(rx0,y+3,rx1-rx0,1,'#1e120a')}
    R(rx0-2,ridge-3,rx1-rx0+4,4,AP.out);R(rx0-1,ridge-2,rx1-rx0+2,2,'#2e1c10');R(rx0-1,ridge-2,rx1-rx0+2,1,'#4a2e1a'); // ridge cap
    R(rx0,eave,rx1-rx0,2,'#24160c');R(X,eave+2,W,3,'rgba(0,0,0,0.4)'); // fascia and the shadow under the eaves
    R(X+8,ridge+18,7,6,AP.out);R(X+9,ridge+19,5,4,'#120b06');R(X+10,ridge+20,1,3,'#4a2e1a');R(X+16,ridge+24,6,3,'#5a3a22'); // a missing shake (rafter showing) and one slipped
    [[X-3,eave-5,10,3],[X+2,eave-2,5,2],[X+22,ridge+2,8,2],[X+48,eave-6,9,3]].forEach(([x,y,w,h])=>{R(x,y,w,h,AP.moss);R(x+1,y,w-3,1,'#5f7a4a')});
    // stone chimney up through the roof near the ridge (smoke comes from its top)
    const cx0=X+W-10;R(cx0-1,Y-14,10,20,AP.out);for(let y=Y-13;y<Y+5;y+=3)for(let x=cx0+((y-Y)%2?0:2);x<cx0+8;x+=4)R(x,y,3,2,ah(x,y,85)<0.5?AP.stone:AP.stoneDk);
    R(cx0,Y-13,8,1,AP.stoneHi);R(cx0-2,Y-15,12,3,AP.out);R(cx0-1,Y-14,10,1,AP.stoneDk);R(cx0+2,Y-15,4,1,'#0a0806');
    // door: frame, plank door with a Z brace and iron ring, a stone step
    const dx=X+36,dy=base-30;R(dx-2,dy-3,18,3,AP.out);R(dx-1,dy-2,16,1,AP.woodHi);R(dx-2,dy,2,24,'#2e2018');R(dx+14,dy,2,24,'#2e2018');
    R(dx,dy,14,24,AP.out);R(dx+1,dy+1,12,23,'#5a4030');R(dx+4,dy+1,1,23,'#3b2a1e');R(dx+8,dy+1,1,23,'#3b2a1e');R(dx+1,dy+3,12,2,AP.woodHi);R(dx+1,dy+18,12,2,AP.woodHi);
    treeLine(R,dx+2,dy+17,dx+11,dy+6,1,AP.woodHi);R(dx+10,dy+12,2,2,AP.bellHi);
    R(dx-2,base-6,18,4,AP.out);R(dx-1,base-6,16,3,AP.stone);R(dx-1,base-6,16,1,AP.stoneHi);
    // window: frame, lit panes with a cross, a sill, the left shutter open, the right one hanging from one hinge
    const wx=X+9,wy=eave+5;R(wx-1,wy-1,14,12,AP.out);R(wx,wy,12,10,'#ffb860');R(wx,wy+5,12,5,'#e08a3a');R(wx+6,wy,1,10,AP.out);R(wx,wy+4,12,1,AP.out);R(wx+1,wy,2,1,'#ffe0a0');
    R(wx-2,wy+10,16,2,AP.out);R(wx-1,wy+10,14,1,AP.woodHi);
    R(wx-6,wy-1,5,12,AP.out);R(wx-5,wy,3,10,AP.woodDk);R(wx+13,wy+2,5,11,AP.out);R(wx+14,wy+3,3,9,AP.woodDk);R(wx+14,wy+3,1,9,AP.wood);
    // a bucksaw hung on the wall between the window and the door
    R(X+25,eave+7,9,1,AP.out);R(X+25,eave+7,1,8,AP.out);R(X+33,eave+7,1,8,AP.out);R(X+25,eave+14,9,1,'#9a98a4');R(X+29,eave+6,1,2,'#2e2018');
    // rain barrel at the left corner, woodpile under the window, the spade by the door
    const bx=X-4;R(bx,base-14,10,15,AP.out);R(bx+1,base-13,8,13,'#4e3828');R(bx+1,base-13,2,13,'#6a4c36');R(bx,base-11,10,1,AP.iron);R(bx,base-4,10,1,AP.iron);R(bx+1,base-14,8,2,'#1a2830');R(bx+2,base-14,3,1,'#3a5260');
    R(X+9,base+2,22,1,'rgba(0,0,0,0.45)');
    for(let j=0;j<3;j++)for(let i=0;i<4-j;i++){const lx2=X+10+i*5+j*2,ly=base-3-j*4;R(lx2,ly,5,4,AP.out);R(lx2+1,ly+1,3,2,'#a88a64');R(lx2+2,ly+1,1,1,'#7a5a42')}
    R(X+51,base+2,9,1,'rgba(0,0,0,0.45)');
    treeLine(R,X+58,base-25,X+55,base-6,3,AP.out);treeLine(R,X+58,base-24,X+55,base-6,1,AP.woodHi);R(X+56,base-26,5,2,AP.out);R(X+57,base-26,3,1,AP.wood);
    R(X+52,base-7,6,9,AP.out);R(X+53,base-6,4,7,AP.stone);R(X+53,base-6,1,6,AP.stoneHi);return}
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
    // Wooden signpost at the crossroads (heart pass, v0.59): an old post with a cap, one arm for each road. The west arm
    // points to the graveyard, the east one to the sinkhole, the north one up toward Wolfwood; the lower arm has lost a
    // nail and hangs crooked. Weathered: a split in the post, moss at the foot and on the cap, lichen on a board.
    shadow(X+3,Y+14,10,2);R(X+7,Y-16,3,31,AP.out);R(X+8,Y-15,1,29,AP.wood);R(X+8,Y-3,1,4,AP.woodDk);
    R(X+6,Y-18,5,3,AP.out);R(X+7,Y-17,3,1,AP.woodHi);R(X+7,Y-18,2,1,AP.moss);
    R(X+6,Y-14,8,4,AP.out);R(X+7,Y-13,6,2,AP.woodHi);R(X+13,Y-13,1,2,AP.wood);R(X+14,Y-12,1,1,AP.out); // north arm (short, up the road)
    R(X-2,Y-9,11,5,AP.out);R(X-1,Y-8,9,3,AP.woodHi);R(X-3,Y-7,1,1,AP.out);R(X+1,Y-7,5,1,AP.woodDk);R(X+2,Y-8,2,1,'#8a8a6a'); // west arm, lichen
    R(X+9,Y-6,9,5,AP.out);R(X+10,Y-5,7,3,AP.wood);R(X+18,Y-4,1,1,AP.out);R(X+11,Y-4,4,1,AP.woodDk); // east arm
    for(let i=0;i<9;i++){R(X+2+i,Y+1+Math.round(i*0.6),1,4,AP.out);R(X+3+i,Y+2+Math.round(i*0.6),1,2,i%4===0?AP.woodDk:AP.wood)}R(X+8,Y+1,2,2,AP.ironHi); // the crooked arm on its last nail
    R(X+6,Y+13,5,2,AP.moss);R(X+7,Y+12,2,1,'#5f7a4a');return}
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
    // Greyfang's den, third take (v0.83; owner: the v0.82 boulder pile still didn't read as a den). What makes a den read
    // at this size: (1) a brown EARTH MOUND, not grey rock, so it stands apart from the boulder hillside round it;
    // (2) a big black mouth dug into its face with a pale rim of fresh-dug dirt, so the hole is the first thing you see;
    // (3) a worn dirt apron spilling out of it with white bones and a skull on it; (4) a wolf's eyes in the dark
    // (drawn live after the lighting, world.js drawGlows). The hunter's gnawed bow still lies on the apron.
    const base=Y+H-1,cx=X+32,cy=Y+5,rx=31,ry=22;shadow(X+2,base-2,W-4,5);
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const e=x*x/(rx*rx)+y*y/(ry*ry)+(ah(cx+x,cy+y,81)-0.5)*0.10;if(e>1||cy+y>base-1)continue;
      const lit=(x/rx)+(y/ry); // light from the upper left
      R(cx+x,cy+y,1,1,e>0.9?AP.out:lit<-0.75?'#7a6244':lit<0.1?'#5a4630':lit<0.8?'#47372a':'#33281e')}
    for(let i=0;i<46;i++){const a=ah(i,1,82)*Math.PI,r=0.35+ah(i,2,83)*0.6,x=Math.round(cx-Math.cos(a)*r*rx*0.9),y=Math.round(cy-Math.sin(a)*r*ry*0.85);
      if(y>cy+2)continue;R(x,y,2,1,i%3?'#3e5530':'#58743f');if(i%4===0)R(x,y-1,1,1,'#6e8a4c')} // grass on the crown
    const rock=(x0,y0,w,h)=>{R(x0-1,y0-1,w+2,h+2,AP.out);R(x0,y0,w,h,AP.bould);R(x0,y0,w-1,1,AP.bouldHi);R(x0,y0,1,h-1,AP.bouldHi);R(x0+1,y0+h-1,w-1,1,AP.bouldDk);R(x0+1,y0,Math.max(1,w-3),1,AP.mossHi)};
    // (no stones on the crown: small square rocks read as windows, v0.83)
    // the mouth: rim of fresh-dug pale dirt, then the black hole, darkest at the back
    const my=base-4,mh=22,mw=14;
    for(let y=0;y<=mh+3;y++){const t=(mh+3-y)/(mh+4),hw=Math.round((mw+3)*Math.sqrt(Math.max(0,1-t*t)));if(hw>0)R(cx-hw,my-mh-3+y,2*hw,1,y<2?'#a88a60':'#8a6e4a')}
    for(let y=0;y<=mh;y++){const t=(mh-y)/(mh+1),hw=Math.round(mw*Math.sqrt(Math.max(0,1-t*t)))+(ah(y,7,84)<0.25?1:0);const yy=my-mh+y;
      if(hw>0){R(cx-hw-1,yy,2*hw+2,1,AP.out);R(cx-hw,yy,2*hw,1,y<5?'#120d0a':'#030202')}}
    [[-9,7],[-4,10],[2,6],[7,9],[11,5]].forEach(([x,l])=>{for(let j=0;j<l;j++)R(cx+x+(j>3?(x<0?-1:1):0),my-mh-2+j,1,1,j<l-1?AP.root:AP.rootHi)}); // roots hanging over the mouth
    // the apron: worn dirt spilling out of the mouth, paler than the forest floor
    for(let y=0;y<8;y++){const hw=mw+2+y*2;R(cx-hw,my-1+y,2*hw,1,y%2?'#5c4a36':'#66523c')}
    for(let i=0;i<5;i++){const x=cx-10+i*5,y=my+2+(i%2)*2;treeLine(R,x,y,x+2,y-2,1,'#2e241a');treeLine(R,x+2,y,x+4,y-2,1,'#2e241a')} // claw rakes
    [[cx-20,my+6],[cx-16,my+4],[cx+17,my+5],[cx+21,my+7]].forEach(([x,y])=>{R(x,y,2,2,'#2a2016');R(x-1,y-1,1,1,'#2a2016');R(x+1,y-2,1,1,'#2a2016');R(x+2,y-1,1,1,'#2a2016')}); // paw prints going in
    // bones: pale shafts with knobbed ends, and a skull
    const bone=(x,y,l,d)=>{for(let j=0;j<l;j++)R(x+j,y+(d?Math.floor(j/2):0),1,1,'#e2dac6');R(x-1,y-1,2,3,AP.out);R(x-1,y-1,2,1,'#e2dac6');R(x-1,y+1,2,1,'#e2dac6');const ex=x+l-1,ey=y+(d?Math.floor((l-1)/2):0);R(ex,ey-1,2,3,AP.out);R(ex,ey-1,2,1,'#e2dac6');R(ex,ey+1,2,1,'#e2dac6');for(let j=1;j<l-1;j++)R(x+j,y+1+(d?Math.floor(j/2):0),1,1,'#9a907c')};
    bone(cx-16,my+3,6,0);bone(cx+8,my+6,7,1);bone(cx-6,my+8,5,0);bone(cx+13,my+1,5,0);
    R(cx-25,my+1,7,6,AP.out);R(cx-24,my+1,5,4,'#e2dac6');R(cx-24,my+1,5,1,'#f4eedc');R(cx-23,my+3,1,1,AP.out);R(cx-21,my+3,1,1,AP.out);R(cx-23,my+5,3,1,'#b8ae98'); // skull
    [[cx-12,my-1],[cx+19,my+3]].forEach(([x,y])=>{R(x,y,3,1,'#8a8a88');R(x+1,y-1,1,1,'#b0b0ac')}); // grey fur tufts
    R(cx+4,my+10,12,1,AP.out);R(cx+5,my+9,10,1,'#9a7448');R(cx+4,my+8,1,2,'#9a7448');R(cx+15,my+8,1,2,'#9a7448');R(cx+9,my+9,2,1,'#5a4030');return} // the hunter's gnawed bow
  if(k==='lean_to'){
    // The hunter's shelter, third take (v0.83; owner: the v0.82 lean-to seen from above still read as a box). Redrawn
    // as a bough A-frame, the shape anyone reads as "a shelter" at a glance: a steep triangle of layered fir boughs,
    // two poles crossed at the top and sticking out past the ridge, a dark triangular doorway facing the fire with his
    // fur bed showing, antlers hung at the peak, his quiver propped by the door. The back gable sits a little higher
    // (3/4 view), so you see the lit left slope and the shaded right slope running back.
    const base=Y+H-1,cx=X+24,fA=Y-6,bA=Y-15,bB=base-8;shadow(X,base-2,W,4);
    const inTri=(px,py,ax,ay,bx,by,qx,qy)=>{const d=(x1,y1,x2,y2,x3,y3)=>(x1-x3)*(y2-y3)-(x2-x3)*(y1-y3);const d1=d(px,py,ax,ay,bx,by),d2=d(px,py,bx,by,qx,qy),d3=d(px,py,qx,qy,ax,ay);return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0))};
    const G0='#16241a',G1='#25402a',G2='#36593a',G3='#4f7848',D1='#5a4a2a',D2='#7a6438';
    const front=(x,y)=>inTri(x,y,X+1,base,cx,fA,X+W-1,base),back=(x,y)=>inTri(x,y,X+4,bB,cx,bA,X+W-4,bB);
    const slope=(x,y)=>back(x,y)||inTri(x,y,X+1,base,cx,fA,cx,bA)||inTri(x,y,X+1,base,X+4,bB,cx,bA)||inTri(x,y,X+W-1,base,cx,fA,cx,bA)||inTri(x,y,X+W-1,base,X+W-4,bB,cx,bA);
    // roof slopes running back: boughs in drooping rows, lit on the left, shaded on the right
    for(let y=bA-1;y<=base;y++)for(let x=X-1;x<=X+W;x++){if(!slope(x,y)||front(x,y))continue;
      const edge=!slope(x-1,y)||!slope(x+1,y)||!slope(x,y-1);if(edge){R(x,y,1,1,AP.out);continue}
      const left=x<cx,row=(y+Math.floor(x/5))%4,dead=ah(Math.floor(x/5),Math.floor(y/4),71)<0.1;
      R(x,y,1,1,dead?(row?D1:D2):left?(row===0?G3:row===3?G1:G2):(row===0?G2:G0))}
    // the front gable: a border of boughs round a dark triangular doorway
    for(let y=fA;y<=base;y++)for(let x=X;x<=X+W;x++){if(!front(x,y))continue;
      const edge=!front(x-1,y)||!front(x+1,y)||!front(x,y-1);if(edge){R(x,y,1,1,AP.out);continue}
      const door=inTri(x,y,cx-11,base,cx,fA+9,cx+11,base);
      if(door){R(x,y,1,1,y<fA+16?'#020101':'#080605');continue}
      const row=(y+Math.floor((x-cx)/4))%3;R(x,y,1,1,x<cx?(row===0?G3:G2):(row===0?G2:G1))}
    for(let y=fA+9;y<base;y+=3){const hw=Math.round((y-fA-9)*11/(base-fA-9));R(cx-hw-1,y,2,1,G3);R(cx+hw,y,1,1,G1)} // bough tips round the doorway
    R(cx-8,base-4,16,3,AP.out);R(cx-7,base-4,14,2,'#9a7650');R(cx-7,base-4,14,1,'#c09a6a');R(cx+3,base-3,2,1,'#6a5038'); // his fur bed inside
    R(cx-11,base,23,1,'rgba(0,0,0,0.6)');
    // the ridge pole running back, and the two poles crossed at each peak
    treeLine(R,cx,fA,cx,bA,2,AP.out);treeLine(R,cx,fA+1,cx,bA+1,1,AP.woodHi);
    [[fA,0],[bA,1]].forEach(([ay,b])=>{treeLine(R,cx-1,ay+2,cx+5,ay-5,2,AP.out);treeLine(R,cx+1,ay+2,cx-5,ay-5,2,AP.out);
      treeLine(R,cx-1,ay+2,cx+5,ay-5,1,b?AP.woodDk:AP.woodHi);treeLine(R,cx+1,ay+2,cx-5,ay-5,1,b?AP.woodDk:AP.wood);R(cx-1,ay,3,1,'#c8b48a')}); // rope at the cross
    // antlers hung under the front peak
    const ay=fA+5;R(cx-1,ay,3,2,'#d8ccb0');treeLine(R,cx-1,ay,cx-6,ay-4,1,'#d8ccb0');treeLine(R,cx-4,ay-2,cx-6,ay,1,'#d8ccb0');treeLine(R,cx+1,ay,cx+6,ay-4,1,'#d8ccb0');treeLine(R,cx+4,ay-2,cx+6,ay,1,'#c8bca0');
    // his quiver propped against the right side of the door, red and white fletchings
    R(X+W-13,base-11,4,11,AP.out);R(X+W-12,base-10,2,9,'#6a4a30');R(X+W-12,base-13,1,3,'#e8e0d0');R(X+W-11,base-14,1,3,'#b84a3a');R(X+W-10,base-13,1,2,'#e8e0d0');
    return}
  if(k==='game_rack'){
    // A meat tripod by the camp (v0.82): three poles lashed at the top, a cross-stick hung with two rabbits by their hind
    // feet and a grouse, so you know the hunter was a hunter. Blood dark on the ground under them.
    const tx=X+8,ty=Y-15;shadow(X+2,Y+14,13,2);R(X+4,Y+12,9,2,'#2a1810');
    [[X+1,Y+15],[X+15,Y+15],[X+9,Y+12]].forEach(([fx,fy])=>{treeLine(R,fx,fy,tx,ty,2,AP.out);treeLine(R,fx,fy,tx,ty,1,AP.woodHi)});
    R(tx-1,ty-1,3,3,'#c8b48a');R(X+1,ty+4,14,2,AP.out);R(X+2,ty+4,12,1,AP.wood);
    const rab=(x)=>{R(x,ty+6,1,3,'#c8b48a');R(x-2,ty+9,5,9,AP.out);R(x-1,ty+9,3,8,'#8a7660');R(x-1,ty+9,1,8,'#a8927a');R(x-1,ty+16,3,2,'#6a5848');R(x-2,ty+18,1,2,AP.out);R(x+1,ty+18,1,2,AP.out);R(x,ty+11,1,1,'#e8e2d4')};
    rab(X+4);rab(X+12);
    R(X+8,ty+6,1,2,'#c8b48a');R(X+6,ty+8,5,7,AP.out);R(X+7,ty+9,3,5,'#4a3a2a');R(X+7,ty+9,3,1,'#6a5a44');R(X+8,ty+14,1,2,'#c9a227');return} // the grouse
  if(k==='chop_block'){
    // The hunter's woodpile and chopping block: split logs stacked bark-side out, the block (a big round of fir) with
    // the axe left bitten into it, pale chips round its foot.
    shadow(X+1,Y+13,W-2,3);
    for(let j=0;j<3;j++)for(let i=0;i<4-j;i++){const lx2=X+1+i*5+j*2,ly=Y+9-j*4;R(lx2,ly,6,5,AP.out);R(lx2+1,ly+1,4,3,'#a88a64');R(lx2+1,ly+1,4,1,'#c8a878');R(lx2+3,ly+2,1,1,'#7a5a42')}
    const bx=X+22;R(bx,Y+5,9,10,AP.out);R(bx+1,Y+8,7,6,AP.trunk);R(bx+1,Y+8,1,6,AP.trunkHi);R(bx,Y+4,9,5,AP.out);R(bx+1,Y+5,7,3,'#b8986c');R(bx+3,Y+6,3,1,'#8a6a4a');
    R(bx+3,Y+1,5,4,AP.out);R(bx+4,Y+2,3,2,'#9a98a4');R(bx+4,Y+2,3,1,'#c8c6d0'); // the axe head, bitten in
    treeLine(R,bx+6,Y+3,bx+12,Y-6,2,AP.out);treeLine(R,bx+6,Y+3,bx+12,Y-6,1,'#a07a50');
    for(let i=0;i<9;i++)R(bx-3+Math.floor(ah(o.x,i,77)*15),Y+13+Math.floor(ah(o.y,i,78)*3),1+(i%2),1,i%3?'#c8a878':'#e0c898');return}
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
  // ---- Wolfwood heart pass (v0.81): small stories you can read without words, references first (area-rules "Living detail"). ----
  if(k==='hunter_remains'){
    // The hunter who didn't come back: his green cloak torn and dropped on the wolf trail, his bow snapped in two, his horn
    // in the needles, an old dark stain under it all and wolf prints walking away. (Reads as: something happened here.)
    R(X+3,Y+9,14,5,'#24180f');R(X+5,Y+8,9,1,'#24180f'); // the old stain soaked into the ground
    const cl=[[4,6,10],[3,7,12],[2,8,13],[3,9,12],[2,10,11],[4,11,8],[6,12,4]];
    cl.forEach(([x,y,w])=>R(X+x-1,Y+y,w+2,1,AP.out));cl.forEach(([x,y,w],i)=>{R(X+x,Y+y,w,1,i<2?'#4a5e34':'#36472a');if(i>1&&i<5)R(X+x+3,Y+y,1,1,'#2a3820')});
    R(X+13,Y+12,2,1,AP.out);R(X+15,Y+11,1,1,AP.out);R(X+5,Y+7,1,1,'#e0b838'); // ragged corner, brass clasp
    R(X+1,Y+5,6,4,AP.out);R(X+2,Y+6,4,2,'#5a7040');R(X+3,Y+6,2,1,'#6e8650'); // the hood, crumpled at one end
    R(X+8,Y+9,4,1,'#5a1e16');R(X+10,Y+10,2,1,'#4a1810'); // torn, and darker where it tore
    // the bow: two halves at angles, the string slack between them
    treeLine(R,X+17,Y+5,X+23,Y+8,2,AP.out);treeLine(R,X+17,Y+5,X+23,Y+8,1,'#b08a58');
    treeLine(R,X+24,Y+11,X+30,Y+9,2,AP.out);treeLine(R,X+24,Y+11,X+30,Y+9,1,'#9a7448');R(X+23,Y+8,1,1,'#d8c8a0');R(X+24,Y+10,1,1,'#b8ac90');
    // the horn: a pale curve with a brass band
    R(X+18,Y+11,8,4,AP.out);R(X+19,Y+12,6,2,'#e8dcc0');R(X+19,Y+13,2,1,'#b8ac90');R(X+19,Y+12,2,2,AP.out);R(X+23,Y+13,1,1,'#c9a227');
    // wolf prints going off to the right: a pad and three toes, 2 sets
    [[27,13],[30,3]].forEach(([x,y])=>{R(X+x,Y+y+1,2,1,'#1a1610');R(X+x-1,Y+y,1,1,'#1a1610');R(X+x+1,Y+y-1,1,1,'#1a1610');R(X+x+2,Y+y,1,1,'#1a1610')});return}
  if(k==='saw_log'){
    // The woodcutters gave up: a felled fir half sawn through, the two-man saw still standing in the cut,
    // a heap of pale sawdust under it and a wedge on the ground.
    shadow(X+2,Y+12,W-2,3);R(X,Y+3,W,11,AP.out);R(X+1,Y+4,W-2,9,AP.trunk);R(X+1,Y+4,W-2,2,AP.trunkHi);for(let x=4;x<W-8;x+=6)R(X+x,Y+7+(x%4?1:0),3,1,AP.woodDk);
    R(X+W-7,Y+3,7,11,AP.out);R(X+W-6,Y+4,5,9,'#a88a64');R(X+W-5,Y+6,3,5,'#8a6a4a');R(X+W-4,Y+8,1,1,'#6a5038'); // the cut end, rings
    const sx=X+24;R(sx-1,Y+2,3,12,'#0b0907'); // the kerf
    // the blade stands in the cut: its lower edge (the teeth) is hidden down in the kerf, so it reads as stuck, not floating
    R(sx-10,Y-2,22,7,AP.out);R(sx-9,Y-1,20,5,'#8d8692');R(sx-9,Y-1,20,1,'#c8c2cc');R(sx-9,Y+3,20,1,'#6a6570');R(sx-1,Y+4,3,1,'#0b0907');
    [sx-12,sx+11].forEach(x=>{R(x-1,Y-8,4,11,AP.out);R(x,Y-7,2,9,'#8a6a4a');R(x,Y-7,1,9,'#a88a64')}); // a handle at each end
    for(let i=0;i<10;i++)R(X+18+Math.floor(ah(o.x,i,61)*12),Y+13+Math.floor(ah(o.y,i,62)*3),1,1,i%2?'#c8b088':'#a89070'); // sawdust
    R(X+6,Y+13,4,2,AP.out);R(X+7,Y+13,2,1,AP.woodHi);return}
  if(k==='log_stack'){
    // A woodcutters' stack left to go grey: cut ends in rows of three, two and one, bark between, moss on the top.
    shadow(X+1,Y+13,W-2,3);
    // round cut ends (an octagon at this size), pale wood with a darker ring and the heart in the middle
    const end=(x,y)=>{R(x+1,y-1,6,9,AP.out);R(x-1,y+1,10,5,AP.out);R(x,y,8,7,AP.out);R(x+1,y,6,7,'#9a9080');R(x,y+1,8,5,'#9a9080');R(x+2,y+1,4,5,'#b0a896');R(x+1,y+2,6,3,'#b0a896');R(x+3,y+2,2,3,'#7a7062');R(x+2,y,4,1,'#c4bca8')};
    [[1,6],[11,6],[21,6],[6,-1],[16,-1],[11,-8]].forEach(([x,y])=>end(X+x,Y+y));
    R(X+10,Y-9,6,2,AP.mossHi);R(X+4,Y-2,4,1,AP.mossHi);R(X+24,Y+4,5,1,AP.mossHi);return}
  if(k==='deer_bones'){
    // The blight kills: what's left of a deer in the grey. Skull with antlers, a curl of ribs, the spine and a leg bone.
    const B=AP.bone,D=AP.boneDk;
    for(let i=0;i<5;i++){const x=X+8+i*3;R(x,Y+6,1,7,AP.out);R(x+1,Y+7,1,5,i%2?D:B)} // ribs
    R(X+6,Y+5,18,2,AP.out);R(X+7,Y+5,16,1,B); // spine
    R(X+23,Y+4,7,5,AP.out);R(X+24,Y+5,5,3,B);R(X+25,Y+6,1,1,AP.out);R(X+28,Y+7,2,1,D); // skull
    treeLine(R,X+25,Y+4,X+22,Y-1,1,B);treeLine(R,X+23,Y+1,X+20,Y+1,1,B);treeLine(R,X+27,Y+4,X+29,Y-1,1,B);treeLine(R,X+28,Y+1,X+31,Y,1,D); // antlers
    R(X+2,Y+12,9,1,AP.out);R(X+3,Y+11,7,1,B);R(X+2,Y+11,1,1,B);R(X+10,Y+11,1,1,B);return}
  if(k==='camp_kit'){
    // By the hunter's fire: a blackened pot on two stones and two tin cups. One is still full: nobody came back to drink it.
    R(X+1,Y+9,4,3,AP.out);R(X+2,Y+9,2,2,AP.bouldHi);R(X+8,Y+9,4,3,AP.out);R(X+9,Y+9,2,2,AP.bould);
    R(X+2,Y+3,9,7,AP.out);R(X+3,Y+4,7,5,'#24222a');R(X+3,Y+4,7,1,'#3e3a46');R(X+5,Y+2,3,1,AP.out); // pot and its handle
    [[11,10,0],[13,12,1]].forEach(([x,y,full])=>{R(X+x-1,Y+y-1,4,4,AP.out);R(X+x,Y+y,2,2,'#8d8692');R(X+x,Y+y,2,1,full?'#3a2a1e':'#b8b2bc')});return}
  if(k==='toadstools'){
    // A ring of pale toadstools where something rots under the needles.
    [[3,10],[6,7],[10,6],[13,9],[11,12],[5,13]].forEach(([x,y],i)=>{R(X+x,Y+y,1,2,'#d8d0b8');R(X+x-2,Y+y-2,5,2,AP.out);R(X+x-1,Y+y-2,3,1,i%3?AP.fungus:'#d8b890');R(X+x-1,Y+y-1,3,1,AP.fungusDk)});return}
  if(k==='foxfire'){
    // Foxfire: a rotting stub of wood furred with pale fungus that glows a cold green in the dusk (the glow is drawn live).
    shadow(X+3,Y+13,10,2);R(X+4,Y+6,8,8,AP.out);R(X+5,Y+7,6,6,'#3a2a20');R(X+5,Y+7,6,1,'#5a4030');R(X+7,Y+9,2,1,'#2a1e16');
    [[5,8],[9,7],[6,11],[10,10],[8,12],[3,12],[12,12]].forEach(([x,y])=>R(X+x,Y+y,1,1,'#9ad8a8'));return}
  if(k==='sunbeam')return; // just light: the gold shaft and its dust are drawn live after the lighting
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
  if(k==='wagon'){
    // Small story (crossroads heart pass, v0.59): a trader's covered wagon that lost a wheel and was pushed off the road.
    // What makes it read as a wagon: a spoked wheel, a planked box and the canvas hoops. Here the front wheel has come
    // off and lies flat in the grass, so the front corner sits on the ground (the box tilts), the canvas is torn,
    // a crate has slid out and split, a sack lies in the grass, and the shaft rests on the ground.
    const ring=(cx,cy,r,col,hub)=>{for(let a=0;a<40;a++){const an=a/40*6.283;R(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),1,1,col)}
      for(let a=0;a<6;a++){const an=a/6*6.283+0.3;treeLine(R,cx,cy,Math.round(cx+Math.cos(an)*(r-1)),Math.round(cy+Math.sin(an)*(r-1)),1,AP.woodDk)}R(cx-1,cy-1,3,3,AP.out);R(cx,cy,1,1,hub)};
    shadow(X+4,Y+H-6,W-6,4);
    // the shaft resting on the ground off the front (left), with its cross-bar
    treeLine(R,X+1,Y+H-6,X+12,Y+H-11,2,AP.out);treeLine(R,X+1,Y+H-7,X+12,Y+H-12,1,AP.woodHi);R(X,Y+H-9,2,5,AP.out);R(X,Y+H-8,1,3,AP.wood);
    // the box, tipped down at the front: each plank column sits lower toward the left
    for(let i=0;i<30;i++){const x=X+10+i,drop=Math.round((30-i)*0.18),top=Y+8+drop,bot=Y+H-8+Math.round(drop*0.4);
      R(x,top,1,bot-top,AP.out);if(i>0&&i<29){R(x,top+1,1,bot-top-2,i%6===0?AP.woodDk:AP.wood);R(x,top+1,1,1,AP.woodHi);R(x,top+5,1,1,AP.woodDk)}}
    // canvas cover on three hoops: pale cloth, sagging between hoops, a dark tear on the front
    for(let i=0;i<28;i++){const x=X+11+i,drop=Math.round((28-i)*0.18),sag=Math.round(2*Math.sin((i%9)/9*Math.PI)),top=Y-6+drop+sag;
      R(x,top,1,15-sag,AP.out);if(i>0&&i<27){R(x,top+1,1,13-sag,i%9===0?'#8a8270':'#b8ae94');R(x,top+1,1,2,'#d2c8ae')}}
    [11,20,29,38].forEach(x0=>{const drop=Math.round((39-x0)*0.18);R(X+x0,Y-6+drop,1,15,'#5a4636')});
    R(X+14,Y+1,5,4,'#1a1410');R(X+15,Y+5,2,2,'#1a1410');R(X+13,Y+2,1,2,'#d2c8ae'); // the tear
    // the back wheel, still on: rim, spokes, hub
    ring(X+33,Y+H-9,6,AP.out,AP.ironHi);ring(X+33,Y+H-9,5,AP.wood,AP.ironHi);
    // the broken front wheel lying flat in front: seen from above it's a squashed ring, two spokes snapped
    for(let a=0;a<36;a++){const an=a/36*6.283;R(Math.round(X+8+Math.cos(an)*7),Math.round(Y+H-3+Math.sin(an)*2.5),1,1,a%9===4?AP.out:AP.wood)}
    R(X+7,Y+H-4,3,2,AP.out);R(X+8,Y+H-4,1,1,AP.ironHi);treeLine(R,X+3,Y+H-3,X+13,Y+H-3,1,AP.woodDk);
    // a crate slid out the back and split open, and a tied sack in the grass
    R(X+38,Y+H-12,9,9,AP.out);R(X+39,Y+H-11,7,7,AP.woodHi);R(X+39,Y+H-8,7,1,AP.woodDk);R(X+42,Y+H-11,1,7,AP.woodDk);R(X+44,Y+H-12,3,3,AP.out);R(X+45,Y+H-11,1,1,'#c9a227');
    R(X+20,Y+H-4,8,5,AP.out);R(X+21,Y+H-3,6,3,'#9a8a6a');R(X+21,Y+H-3,6,1,'#b8a888');R(X+23,Y+H-5,2,2,AP.out);return}
  if(k==='fishing_rod'){
    // Small story (v0.59): someone left a rod propped on the bridge rail with the line still in the water, and a bucket.
    R(X+12,Y+2,1,12,AP.woodDk); // rod butt against the rail post
    treeLine(R,X+12,Y+3,X+30,Y-6,1,AP.woodHi);R(X+30,Y-6,1,1,AP.out);
    R(X+30,Y-5,1,15,'rgba(220,220,210,0.45)');R(X+29,Y+10,3,1,'#c0302a'); // the line and a red float
    R(X+3,Y+8,7,7,AP.out);R(X+4,Y+9,5,5,AP.wood);R(X+4,Y+9,5,1,AP.woodHi);R(X+4,Y+11,5,1,AP.ironHi);R(X+5,Y+9,3,1,AP.water);return}
  if(k==='town_gate'){
    // The way south to Town 1, redrawn in v0.64 (owner: "it's not reading gate at all"). References: timber motte gatehouses
    // and palisade forts. What makes it read: two square timber towers with steep shingle roofs taller than everything
    // round them, a covered walkway joining them over the road, and big plank doors, shut (Town 1 isn't built yet), with
    // iron bands and a crest. A palisade wall (tile L) runs off into the woods either side. 96 x ~80 pixels.
    const B=Y+H,mid=X+W/2;shadow(X+2,B-3,W-4,5);
    const tower=tx=>{ // a square timber tower, 22 wide, body 50 tall, roof 18
      R(tx,B-52,22,52,AP.out);for(let x=1;x<21;x++)R(tx+x,B-51,1,47,x%4===0?AP.woodDk:x<4?AP.woodHi:AP.wood);
      R(tx+1,B-36,20,3,AP.out);R(tx+1,B-35,20,1,AP.woodHi);R(tx+1,B-18,20,3,AP.out);R(tx+1,B-17,20,1,AP.woodHi); // cross beams
      R(tx+1,B-5,20,5,AP.stoneDk);R(tx+1,B-5,20,1,AP.stone);[3,9,15].forEach(x=>R(tx+x,B-3,1,3,AP.stoneDk2)); // stone footing
      R(tx+8,B-31,6,10,AP.out);R(tx+9,B-30,4,8,'#ffb860');R(tx+9,B-30,4,2,'#ffe0a0');R(tx+10,B-30,1,8,AP.out); // a lit window
      R(tx+1,B-6,3,1,AP.moss);R(tx+17,B-7,3,2,AP.moss);
      for(let y=0;y<18;y++){const hw=Math.round(13*y/17);R(tx+11-hw-1,B-70+y,hw*2+3,1,AP.out);if(y>0)R(tx+11-hw,B-70+y,hw*2+1,1,y%3===0?AP.slateDk:AP.roof);if(y>1)R(tx+11-hw,B-70+y,Math.max(1,hw-2),1,AP.roofHi)} // steep roof
      R(tx+10,B-74,2,5,AP.out);R(tx+10,B-73,1,3,AP.ironHi); // finial
      R(tx-2,B-53,26,2,AP.out);R(tx-1,B-53,24,1,AP.woodDk)}; // eaves
    tower(X+2);tower(X+W-24);
    // the covered walkway over the road between the towers
    R(X+24,B-48,48,12,AP.out);R(X+24,B-47,48,9,AP.wood);for(let x=X+26;x<X+72;x+=5)R(x,B-47,1,9,AP.woodDk);R(X+24,B-47,48,1,AP.woodHi);
    R(X+22,B-54,52,6,AP.out);R(X+23,B-53,50,4,AP.roof);R(X+23,B-53,50,1,AP.roofHi);for(let x=X+25;x<X+72;x+=4)R(x,B-52,1,3,AP.slateDk);
    // the doors: two plank leaves under a round-topped frame, shut, iron bands and studs, a ring on each, a crest above
    const dx=mid-17,dy=B-34;R(dx-3,dy-3,40,37,AP.out);R(dx-2,dy-2,38,3,AP.woodDk);
    for(let y=0;y<34;y++){const arch=y<4?[9,5,3,1][y]:0;for(let x=arch;x<34-arch;x++)R(dx+x,dy+y,1,1,(x===16||x===17)?AP.out:(x%4===0?AP.plankDk:x%4===1?AP.plankHi:AP.plank))}
    [7,17,27].forEach(y=>{R(dx,dy+y,34,2,AP.iron);R(dx,dy+y,34,1,AP.ironHi);for(let x=2;x<34;x+=6)R(dx+x,dy+y,1,1,AP.ironTip)});
    R(dx+12,dy+20,3,3,AP.bell);R(dx+19,dy+20,3,3,AP.bell);R(dx+13,dy+21,1,1,AP.out);R(dx+20,dy+21,1,1,AP.out);
    R(mid-6,B-47,12,11,AP.out);R(mid-5,B-46,10,9,'#3a4a6a');R(mid-1,B-45,2,7,'#c9a227');R(mid-4,B-43,8,2,'#c9a227'); // crest
    // lanterns on iron brackets either side of the doors (their light is in buildArea)
    [mid-24,mid+21].forEach(lx=>{R(lx,B-30,4,1,AP.out);R(lx+(lx<mid?0:3),B-30,1,3,AP.out);R(lx-1,B-28,5,7,AP.out);R(lx,B-27,3,5,'#ffb860');R(lx,B-27,3,1,'#ffe0a0')});
    return}
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

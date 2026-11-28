// Pathing: mobs, pets and guards (v0.43) and your tap-to-walk (v0.78) find their way around trees, walls, fences and water.
'use strict';
// How it works (research in docs/research/pathing.md): a "distance map", the Dijkstra map from the roguelike Brogue and the
// flow fields of Fieldrunners 2 and Supreme Commander 2. One breadth-first pass from the goal tile writes how many steps
// every walkable tile is from it; a mob then just walks "downhill". One map serves every mob heading for the same tile,
// so the cost doesn't grow with the number of mobs, and maps are cached until the goal moves to another tile.
// When nothing blocks the straight line, things walk straight (smoothest, and the same feel as before);
// the map only takes over when something is in the way.
const PATH_FAR=0xffff,PATH_CACHE=24,PATH_LOOK=4; // PATH_LOOK: how many tiles ahead a mob looks to cut corners smoothly
const PATH_DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
let pathMapRef=null,pathFree=null;const pathFields=new Map(),walkGrids=new Map(); // 'x,y' -> Uint16Array, least recently used first

// Rebuilt once per area: which tiles can be walked on (same rule as blocked()).
function pathReset(){pathMapRef=map;pathFields.clear();walkGrids.clear();pathFree=new Uint8Array(MW*MH);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)pathFree[y*MW+x]=blocked(x*T+8,y*T+8)?0:1}
const okIn=(G,x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&G[y*MW+x]===1;
const stepIn=(G,x,y,dx,dy)=>okIn(G,x+dx,y+dy)&&(!(dx&&dy)||(okIn(G,x+dx,y)&&okIn(G,x,y+dy)));
const pathOk=(x,y)=>okIn(pathFree,x,y);
// A diagonal step needs both side tiles open, so nothing cuts through the corner of a wall or a tree trunk.
const pathStep=(x,y,dx,dy)=>stepIn(pathFree,x,y,dx,dy);

// Every entry point calls this first, so the walk grid always matches the area you're in.
function pathSync(){if(pathMapRef!==map||!pathFree||pathFree.length!==MW*MH)pathReset()}
function pathField(gx,gy){pathSync();return fieldIn(pathFree,pathFields,gx,gy)}
// One distance map to tile (gx,gy) over walk grid G, kept in cache C (least recently used dropped first).
function fieldIn(G,C,gx,gy){
  const k=gx+','+gy;let f=C.get(k);
  if(f){C.delete(k);C.set(k,f);return f}
  f=new Uint16Array(MW*MH).fill(PATH_FAR);
  if(okIn(G,gx,gy)){const q=new Int32Array(MW*MH);let h=0,t=0;f[gy*MW+gx]=0;q[t++]=gy*MW+gx;
    while(h<t){const i=q[h++],x=i%MW,y=(i/MW)|0,nd=f[i]+1;
      for(let n=0;n<8;n++){const dx=PATH_DIRS[n][0],dy=PATH_DIRS[n][1];if(!stepIn(G,x,y,dx,dy))continue;
        const j=(y+dy)*MW+x+dx;if(f[j]===PATH_FAR){f[j]=nd;q[t++]=j}}}}
  C.set(k,f);if(C.size>PATH_CACHE)C.delete(C.keys().next().value);
  return f}

// Is the straight walk from a to b open? Checks every few pixels along the line, a body's width to each side.
function clearLine(ax,ay,bx,by,G){const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);if(d<1)return true;
  const ux=dx/d,uy=dy/d,px=-uy*3,py=ux*3;
  for(let s=0;s<=d;s+=4){const x=ax+ux*s,y=ay+uy*s;if(blocked(x,y)||blocked(x+px,y+py)||blocked(x-px,y-py))return false
  } // G: a walk grid with extra no-go tiles (your way-out tiles), checked across the body's width every 2 pixels so a line
  // can't clip the corner of one (an exit fires on the tile your feet are on).
  if(G)for(let s=0;s<=d;s+=2){const x=ax+ux*s,y=ay+uy*s;
    for(let k=-1;k<=1;k++)if(!okIn(G,Math.floor((x+px*k)/T),Math.floor((y+py*k)/T)))return false}
  return true}

// Drop-in for moveToward that finds its way around things. Returns true on arrival, like moveToward.
function pathTo(e,tx,ty,spd,dt,W){
  const G=W?W.G:null;
  if(clearLine(e.x,e.y,tx,ty,G))return moveToward(e,tx,ty,spd,dt);
  const gx=Math.floor(tx/T),gy=Math.floor(ty/T),f=W?(pathSync(),fieldIn(W.G,W.C,gx,gy)):pathField(gx,gy); // also syncs the walk grid
  const g=G||pathFree,ok=(x,y)=>okIn(g,x,y),st=(x,y,dx,dy)=>stepIn(g,x,y,dx,dy);
  let x=Math.floor(e.x/T),y=Math.floor(e.y/T);
  if(!ok(x,y)||f[y*MW+x]===PATH_FAR)return moveToward(e,tx,ty,spd,dt); // goal cut off (across water): old straight walk
  // Walk downhill a few tiles and aim for the farthest one in plain sight, so the route is smooth, not tile-by-tile zigzag.
  let aim=null;
  for(let s=0;s<PATH_LOOK;s++){const cur=f[y*MW+x];if(cur===0)break;
    let bx=-1,by=-1,bv=cur,bd=1e9;
    for(let n=0;n<8;n++){const dx=PATH_DIRS[n][0],dy=PATH_DIRS[n][1];if(!st(x,y,dx,dy))continue;
      const v=f[(y+dy)*MW+x+dx],dd=Math.hypot((x+dx)*T+8-tx,(y+dy)*T+8-ty); // ties: the step that heads most toward the goal
      if(v<bv||(v===bv&&v<cur&&dd<bd)){bv=v;bd=dd;bx=x+dx;by=y+dy}}
    if(bx<0)break;x=bx;y=by;const cx=x*T+8,cy=y*T+8;
    if(!aim||clearLine(e.x,e.y,cx,cy,G))aim={x:cx,y:cy};else break}
  if(!aim)return moveToward(e,tx,ty,spd,dt);
  moveToward(e,aim.x,aim.y,spd,dt);return false}

// A random open spot a few tiles away that e can walk to (for wolves running off). Never one that's closer to you than it is now,
// so a fleeing wolf doesn't run back through you. Returns null if nothing fits (then it just runs away from you).
function randomRunSpot(e,from){pathSync();
  const ex=Math.floor(e.x/T),ey=Math.floor(e.y/T);if(!pathOk(ex,ey))return null;
  const f=pathField(ex,ey),now=Math.hypot(e.x-from.x,e.y-from.y);
  for(let i=0;i<20;i++){const a=rng()*Math.PI*2,r=(4+rng()*4)*T,x=Math.floor((e.x+Math.cos(a)*r)/T),y=Math.floor((e.y+Math.sin(a)*r)/T);
    if(!pathOk(x,y))continue;const steps=f[y*MW+x];if(steps===PATH_FAR||steps>12)continue;
    const sx=x*T+8,sy=y*T+8;if(Math.hypot(sx-from.x,sy-from.y)<now)continue;
    return{x:sx,y:sy}}
  return null}

// Tap to walk (optimization lane). Your walks get their own walk grid: the mobs' grid minus every way-out tile (an exit and
// the tiles beside it that take you through, as in checkPortals), so a route round a tree never carries you out of the area
// by accident. Tap the exit itself (or beside it, e.g. the door in the building) and that one exit stays open, so you walk out as you meant to.
// Which tiles take you through an exit (v0.94, owner Nov 27: "you're going in much further away than the door is").
// A doorway or stairs only fires when your feet are on it: the exit tile, or another tile of the same stairs / steps /
// slope beside it (the crypt's stairs are two wide). It used to fire from the plain ground in front too, a tile early.
// An exit on the map's edge (walking off the side) keeps the old rule: the edge tile or one beside it.
const EXIT_WIDE=new Set(['stairs','steps','dirt_slope']);
function exitEdge(A,e){return e.tx<=0||e.ty<=0||e.tx>=A.w-1||e.ty>=A.h-1}
function exitTrigger(A,e,x,y){
  if(x===e.tx&&y===e.ty)return true;
  if(Math.abs(e.tx-x)+Math.abs(e.ty-y)!==1)return false;
  if(exitEdge(A,e))return true;
  const c=A.rows[y]&&A.rows[y][x];return c===A.rows[e.ty][e.tx]&&!!AREA_TILES[c]&&EXIT_WIDE.has(AREA_TILES[c].name)}
// A tap counts as tapping an exit if it's on it or right beside it, as before, or (v0.94) anywhere on the building or rock
// within 2 tiles of a doorway: tapping the top of the crypt's dark doorway used to walk you round behind the crypt.
const exitNear=(A,e,x,y)=>(Math.abs(e.tx-x)<=1&&Math.abs(e.ty-y)<=1&&(e.tx===x||e.ty===y))||
  (!exitEdge(A,e)&&!okIn(pathFree,x,y)&&Math.max(Math.abs(e.tx-x),Math.abs(e.ty-y))<=2);
function walkGrid(gx,gy){pathSync();
  const A=curArea(),ex=A&&A.exits||[],open=ex.find(e=>exitNear(A,e,gx,gy)),k=open?ex.indexOf(open):-1;
  let W=walkGrids.get(k);if(W)return W;
  const G=pathFree.slice();
  for(const e of ex){if(e===open)continue;
    for(let y=e.ty-1;y<=e.ty+1;y++)for(let x=e.tx-1;x<=e.tx+1;x++)if(x>=0&&y>=0&&x<MW&&y<MH&&exitTrigger(A,e,x,y))G[y*MW+x]=0}
  W={G,C:new Map(),ex:open||null};walkGrids.set(k,W);return W}
// Where should a tap actually take you? The tapped spot if you can walk there; if it's a tree, wall or water, or cut off
// (across a pond), the reachable tile nearest to it, so a tap never leaves you pushing into a trunk or a shoreline.
// Returns {x,y,W}: the goal and the walk grid to use for it.
function walkGoal(e,tx,ty){
  let gx=Math.floor(tx/T),gy=Math.floor(ty/T);const W=walkGrid(gx,gy),G=W.G;
  // Tapped a building or rock next to a doorway (v0.94): walk to the doorway itself, not the nearest bit of ground.
  if(W.ex&&!okIn(pathFree,gx,gy)){tx=W.ex.tx*T+8;ty=W.ex.ty*T+8;gx=W.ex.tx;gy=W.ex.ty}
  const ex=Math.floor(e.x/T),ey=Math.floor(e.y/T);
  if(!okIn(pathFree,ex,ey))return{x:tx,y:ty,W:null}; // standing somewhere odd: the old straight walk
  // Standing on a way-out tile (just arrived, or stepped back on one): that one's open too, so you can walk off it.
  let Gs=G;if(!okIn(G,ex,ey)){Gs=G.slice();Gs[ey*MW+ex]=1}
  const f=Gs===G?fieldIn(G,W.C,ex,ey):fieldIn(Gs,new Map(),ex,ey);
  const Wg=Gs===G?W:{G:Gs,C:new Map()};
  if(okIn(Gs,gx,gy)&&f[gy*MW+gx]!==PATH_FAR)return{x:tx,y:ty,W:Wg};
  let best=-1,bd=1e9,bs=PATH_FAR;
  for(let i=0;i<f.length;i++){const s=f[i];if(s===PATH_FAR)continue;
    const d=Math.hypot((i%MW)*T+8-tx,((i/MW)|0)*T+8-ty);if(d<bd-0.01||(d<bd+0.01&&s<bs)){bd=d;bs=s;best=i}}
  return best<0?{x:tx,y:ty,W:Wg}:{x:(best%MW)*T+8,y:((best/MW)|0)*T+8,W:Wg}}

// Running in fear (optimization lane, Nov 27; Brogue's "safety map", docs/research/pathing.md). A feared mob used to run in a
// straight line directly away from you, so it slammed into the nearest wall, tree or corner and ground there. Now it walks
// downhill on a safety map: start from the distance map to you (steps from every tile), flip it so far is low (times
// FLEE_K), then let the values settle so no tile is more than one step worse than its best neighbour. A dead end or a corner
// then stops looking like a way out, because the open ground round it is lower, so a mob runs along the open routes away
// from you, round things and even past you to the far side of a room, instead of into the wall. Cached per tile you stand on.
const FLEE_K=1.2;        // how much "far from you" outweighs "a long way round": Brogue's value
const fleeMaps=new Map();let fleeRef=null;
function fleeField(gx,gy){pathSync();if(fleeRef!==pathFree){fleeMaps.clear();fleeRef=pathFree}
  const k=gx+','+gy;let s=fleeMaps.get(k);if(s){fleeMaps.delete(k);fleeMaps.set(k,s);return s}
  const d=pathField(gx,gy),N=MW*MH;s=new Float32Array(N);
  for(let i=0;i<N;i++)s[i]=d[i]===PATH_FAR?Infinity:-FLEE_K*d[i];
  // Settle: sweep forwards and backwards until nothing changes (a few passes on our small grids).
  for(let pass=0;pass<64;pass++){let ch=false;
    for(let b=0;b<2;b++)for(let n=0;n<N;n++){const i=b?N-1-n:n;if(s[i]===Infinity)continue;const x=i%MW,y=(i/MW)|0;
      for(let q=0;q<8;q++){const dx=PATH_DIRS[q][0],dy=PATH_DIRS[q][1];if(!pathStep(x,y,dx,dy))continue;const v=s[i+dy*MW+dx]+1;if(v<s[i]){s[i]=v;ch=true}}}
    if(!ch)break}
  fleeMaps.set(k,s);if(fleeMaps.size>8)fleeMaps.delete(fleeMaps.keys().next().value);
  return s}
// Move e one tick away from `from` (you) in fear. Like pathTo: walk downhill a few tiles, aim for the farthest in plain sight.
// Cornered (no tile leads anywhere safer) it cowers in the middle of its tile instead of pushing into the wall.
function fleeFrom(e,from,spd,dt){
  const away=()=>{const dx=e.x-from.x,dy=e.y-from.y,dd=Math.hypot(dx,dy)||1;moveToward(e,e.x+dx/dd*20,e.y+dy/dd*20,spd,dt)};
  pathSync();
  let x=Math.floor(e.x/T),y=Math.floor(e.y/T);const gx=Math.floor(from.x/T),gy=Math.floor(from.y/T);
  if(!pathOk(x,y)||!pathOk(gx,gy))return away(); // standing somewhere odd (or you are): the old straight run
  const s=fleeField(gx,gy);if(s[y*MW+x]===Infinity)return away();
  let aim=null;
  for(let st=0;st<PATH_LOOK;st++){const cur=s[y*MW+x];let bx=-1,by=-1,bv=cur,bd=-1;
    for(let q=0;q<8;q++){const dx=PATH_DIRS[q][0],dy=PATH_DIRS[q][1];if(!pathStep(x,y,dx,dy))continue;
      const v=s[(y+dy)*MW+x+dx],dd=Math.hypot((x+dx)*T+8-from.x,(y+dy)*T+8-from.y); // ties: the step farther from you
      if(v<bv-1e-6||(Math.abs(v-bv)<=1e-6&&v<cur&&dd>bd)){bv=v;bd=dd;bx=x+dx;by=y+dy}}
    if(bx<0)break;x=bx;y=by;const cx=x*T+8,cy=y*T+8;
    if(!aim||clearLine(e.x,e.y,cx,cy))aim={x:cx,y:cy};else break}
  if(!aim){moveToward(e,x*T+8,y*T+8,spd,dt);return}
  moveToward(e,aim.x,aim.y,spd,dt)}

// Fear wanders, and is afraid of everything (owner, Nov 27, after v0.101). A feared mob doesn't run one straight line any more:
// like WoW's fear it picks a new spot every 1-1.5 s, 3-5 tiles off, usually away from you but sometimes sideways, so it
// zig-zags. Unlike WoW it's afraid of everything, so it never runs into another camp: any spot (or the run to it) that comes
// within a camp's notice range plus a tile is thrown out. A feared mob never drags you, or your pet chasing it, into a
// second pack; kinder for phone play and for new players. Boxed in by camps, it cowers where it is. All rolls use rng(),
// so the sim stays repeatable.
const FEAR_PICK=[1,1.5],FEAR_R=[3,5],FEAR_TRIES=20,FEAR_STEPS=8, // re-pick time (s), spot distance (tiles), samples, max route steps
  FEAR_LEAN=0.6,  // how strongly it prefers "away": higher = straighter runs, lower = wilder zig-zags
  FEAR_NEAR=2.5;  // never picks a spot closer than this many tiles to you
// How close does the segment a->b pass to point p?
function segDist(ax,ay,bx,by,px,py){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;let t=L?((px-ax)*dx+(py-ay)*dy)/L:0;t=Math.max(0,Math.min(1,t));
  return Math.hypot(ax+dx*t-px,ay+dy*t-py)}
function fearPick(e,from){pathSync();
  const ex=Math.floor(e.x/T),ey=Math.floor(e.y/T),gx=Math.floor(from.x/T),gy=Math.floor(from.y/T);
  if(!pathOk(ex,ey)||!pathOk(gx,gy))return{cower:false};
  // Other camps nearby: anything alive and idle (not already in this fight), with how close is too close.
  // Its own pack doesn't count (it pulls with it). A camp it's already inside the edge of: just never get closer to it.
  const camps=[];for(const o of mobs)if(o!==e&&!o.dead&&o.state==='idle'&&!(e.sp.group&&o.sp.group===e.sp.group)&&Math.hypot(o.x-e.x,o.y-e.y)<(FEAR_R[1]+6)*T)camps.push(o);
  const tooClose=(o,sx,sy)=>{const R=o.def.aggro+T,now=Math.hypot(e.x-o.x,e.y-o.y);
    return now<R?Math.hypot(sx-o.x,sy-o.y)<now:segDist(e.x,e.y,sx,sy,o.x,o.y)<R};
  const f=pathField(ex,ey),s=fleeField(gx,gy),here=s[ey*MW+ex];
  const opts=[];let campHit=false;
  for(let i=0;i<FEAR_TRIES;i++){const a=rng()*Math.PI*2,r=(FEAR_R[0]+rng()*(FEAR_R[1]-FEAR_R[0]))*T;
    const x=Math.floor((e.x+Math.cos(a)*r)/T),y=Math.floor((e.y+Math.sin(a)*r)/T);
    if(!pathOk(x,y))continue;const st=f[y*MW+x];if(st===PATH_FAR||st>FEAR_STEPS)continue;
    const sx=x*T+8,sy=y*T+8;if(Math.hypot(sx-from.x,sy-from.y)<FEAR_NEAR*T)continue;
    if(camps.some(o=>tooClose(o,sx,sy))){campHit=true;continue}
    const gain=(here===Infinity||s[y*MW+x]===Infinity)?0:here-s[y*MW+x]; // tiles safer than where it stands (dead ends count as worse)
    opts.push({x:sx,y:sy,w:Math.exp(Math.max(-8,Math.min(8,gain*FEAR_LEAN)))})}
  if(!opts.length)return{cower:campHit};
  let sum=0;for(const o of opts)sum+=o.w;let p=rng()*sum;
  for(const o of opts){p-=o.w;if(p<=0)return{to:o}}
  return{to:opts[opts.length-1]}}
// One tick of a feared mob running from `from` (you).
function fearThink(e,from,spd,dt){
  e.fearT=(e.fearT||0)-dt;
  if(e.fearT<=0||(!e.fearTo&&!e.fearCower)){e.fearT=FEAR_PICK[0]+rng()*(FEAR_PICK[1]-FEAR_PICK[0]);
    const r=fearPick(e,from);e.fearTo=r.to||null;e.fearCower=!!r.cower}
  if(e.fearTo){const px=e.x,py=e.y;if(pathTo(e,e.fearTo.x,e.fearTo.y,spd,dt))e.fearT=0; // arrived early: pick the next spot now
    // Guard: the route bent round a wall, or a camp mob wandered, and this step took it closer to a camp's edge: flinch back, pick again.
    for(const o of mobs){if(o===e||o.dead||o.state!=='idle'||(e.sp.group&&o.sp.group===e.sp.group))continue;
      const R=o.def.aggro+T*0.5,d=Math.hypot(e.x-o.x,e.y-o.y);
      if(d<R&&d<Math.hypot(px-o.x,py-o.y)){e.x=px;e.y=py;e.fearTo=null;e.fearCower=true;e.fearT=0.4;break}} // a short flinch, then a new heading
    return}
  if(e.fearCower){moveToward(e,Math.floor(e.x/T)*T+8,Math.floor(e.y/T)*T+8,spd,dt);return} // boxed in by camps: cowers
  fleeFrom(e,from,spd,dt)} // nothing fit and no camp in the way: the v0.101 safety-map run

// Line of sight (v0.126, owner: mobs could cast at you through walls). A straight line between two people that crosses no
// wall tile (stone walls, palisades, rock and cave walls, pillars, boulders) can carry a spell; fences, trees, graves and
// water don't block it. Checked from about chest height so standing hard against a wall still sees along it.
function sightClear(a,b){const A=typeof curArea==='function'?curArea():null;if(!A)return true;
  const x0=a.x,y0=a.y-6,x1=b.x,y1=b.y-6,n=Math.ceil(Math.hypot(x1-x0,y1-y0)/4);
  for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n,tx=Math.floor(x/T),ty=Math.floor(y/T);
    if(tx<0||ty<0||tx>=A.w||ty>=A.h)continue;const t=AREA_TILES[A.rows[ty][tx]];if(t&&t.tags.indexOf('wall')>=0)return false}
  return true}

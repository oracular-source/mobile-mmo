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

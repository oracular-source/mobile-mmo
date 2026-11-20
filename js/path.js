// Mob pathing (v0.43): mobs, pets and guards walk around trees, walls, fences and water instead of grinding into them.
'use strict';
// How it works (research in docs/research/pathing.md): a "distance map", the Dijkstra map from the roguelike Brogue and the
// flow fields of Fieldrunners 2 and Supreme Commander 2. One breadth-first pass from the goal tile writes how many steps
// every walkable tile is from it; a mob then just walks "downhill". One map serves every mob heading for the same tile,
// so the cost doesn't grow with the number of mobs, and maps are cached until the goal moves to another tile.
// When nothing blocks the straight line, things walk straight (smoothest, and the same feel as before);
// the map only takes over when something is in the way.
const PATH_FAR=0xffff,PATH_CACHE=24,PATH_LOOK=4; // PATH_LOOK: how many tiles ahead a mob looks to cut corners smoothly
const PATH_DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
let pathMapRef=null,pathFree=null;const pathFields=new Map(); // 'x,y' -> Uint16Array, least recently used first

// Rebuilt once per area: which tiles can be walked on (same rule as blocked()).
function pathReset(){pathMapRef=map;pathFields.clear();pathFree=new Uint8Array(MW*MH);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)pathFree[y*MW+x]=blocked(x*T+8,y*T+8)?0:1}
const pathOk=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH&&pathFree[y*MW+x]===1;
// A diagonal step needs both side tiles open, so nothing cuts through the corner of a wall or a tree trunk.
const pathStep=(x,y,dx,dy)=>pathOk(x+dx,y+dy)&&(!(dx&&dy)||(pathOk(x+dx,y)&&pathOk(x,y+dy)));

// Every entry point calls this first, so the walk grid always matches the area you're in.
function pathSync(){if(pathMapRef!==map||!pathFree||pathFree.length!==MW*MH)pathReset()}
function pathField(gx,gy){pathSync();
  const k=gx+','+gy;let f=pathFields.get(k);
  if(f){pathFields.delete(k);pathFields.set(k,f);return f}
  f=new Uint16Array(MW*MH).fill(PATH_FAR);
  if(pathOk(gx,gy)){const q=new Int32Array(MW*MH);let h=0,t=0;f[gy*MW+gx]=0;q[t++]=gy*MW+gx;
    while(h<t){const i=q[h++],x=i%MW,y=(i/MW)|0,nd=f[i]+1;
      for(let n=0;n<8;n++){const dx=PATH_DIRS[n][0],dy=PATH_DIRS[n][1];if(!pathStep(x,y,dx,dy))continue;
        const j=(y+dy)*MW+x+dx;if(f[j]===PATH_FAR){f[j]=nd;q[t++]=j}}}}
  pathFields.set(k,f);if(pathFields.size>PATH_CACHE)pathFields.delete(pathFields.keys().next().value);
  return f}

// Is the straight walk from a to b open? Checks every few pixels along the line, a body's width to each side.
function clearLine(ax,ay,bx,by){const dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy);if(d<1)return true;
  const ux=dx/d,uy=dy/d,px=-uy*3,py=ux*3;
  for(let s=0;s<=d;s+=4){const x=ax+ux*s,y=ay+uy*s;if(blocked(x,y)||blocked(x+px,y+py)||blocked(x-px,y-py))return false}
  return true}

// Drop-in for moveToward that finds its way around things. Returns true on arrival, like moveToward.
function pathTo(e,tx,ty,spd,dt){
  if(clearLine(e.x,e.y,tx,ty))return moveToward(e,tx,ty,spd,dt);
  const gx=Math.floor(tx/T),gy=Math.floor(ty/T),f=pathField(gx,gy); // pathField also syncs the walk grid
  let x=Math.floor(e.x/T),y=Math.floor(e.y/T);
  if(!pathOk(x,y)||f[y*MW+x]===PATH_FAR)return moveToward(e,tx,ty,spd,dt); // goal cut off (across water): old straight walk
  // Walk downhill a few tiles and aim for the farthest one in plain sight, so the route is smooth, not tile-by-tile zigzag.
  let aim=null;
  for(let s=0;s<PATH_LOOK;s++){const cur=f[y*MW+x];if(cur===0)break;
    let bx=-1,by=-1,bv=cur,bd=1e9;
    for(let n=0;n<8;n++){const dx=PATH_DIRS[n][0],dy=PATH_DIRS[n][1];if(!pathStep(x,y,dx,dy))continue;
      const v=f[(y+dy)*MW+x+dx],dd=Math.hypot((x+dx)*T+8-tx,(y+dy)*T+8-ty); // ties: the step that heads most toward the goal
      if(v<bv||(v===bv&&v<cur&&dd<bd)){bv=v;bd=dd;bx=x+dx;by=y+dy}}
    if(bx<0)break;x=bx;y=by;const cx=x*T+8,cy=y*T+8;
    if(!aim||clearLine(e.x,e.y,cx,cy))aim={x:cx,y:cy};else break}
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

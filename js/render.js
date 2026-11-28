// Drawing: sprites to pictures, camera and zoom, lighting, the world, and the HUD bars.
'use strict';
const PLAYER_LIGHT=0; // 0 = no light around your character (owner, Nov 21: play by natural light); 1 = the old glow
function mk(rows,pal,scale){
  scale=scale||1;const h=rows.length,w=rows[0].length;
  const c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;const g=c.getContext('2d');
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];if(ch!=='.'&&pal[ch]){g.fillStyle=pal[ch];g.fillRect(i*scale,j*scale,scale,scale)}}
  const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const fg=f.getContext('2d');fg.translate(c.width,0);fg.scale(-1,1);fg.drawImage(c,0,0);
  return{c:c,f:f,w:c.width,h:c.height};
}
// A picture with step frames (walk cycle: stand, step, stand, step). One step frame is used for both steps.
function mkWalk(rows,step,pal,scale){const im=mk(rows,pal,scale),st=mk(step,pal,scale);im.steps=[st,st];return im}
const IMG={druid:mk(SPR.druid,PAL),dead:mk(SPR.dead,PAL),rat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.rat)),beetle:mk(SPR.beetle,PAL),
  guard:mk(SPR.guard,PAL),warrior:mk(SPR.warrior,PAL),rogue:mk(SPR.rogue,PAL),
  necro:mk(SPR.necro,Object.assign({},PAL,{p:'#2e2338',P:'#1d1626',x:'#b8b4c4'})),
  pet:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#2a4a28',e:'#7dffa6'})),minion:mk(SPR.dead,Object.assign({},PAL,{z:'#9a9282',Z:'#6b6470',r:'#3a1418',e:'#ff3b30'})),blade:mk(SPR.blade,PAL),
  earth:mk(SPR.elem,Object.assign({},PAL,{A:'#8a6a48',a:'#5e4630',e:'#ffd27a'})),fire:mk(SPR.elem,Object.assign({},PAL,{A:'#ff9a4a',a:'#c4471f',e:'#fff3c4'})),peddler:mk(SPR.peddler,PAL),crow:mk(SPR.crow,PAL),crowfly:mk(SPR.crowfly,PAL),frog:mk(SPR.frog,PAL),
  gnaw:mkWalk(SPR.gnaw,SPR.gnawstep,Object.assign({},PAL,RAT_PAL.gnaw)),
  trat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.trat)),
  brat:mkWalk(SPR.brat,SPR.bratstep,Object.assign({},PAL,RAT_PAL.brat)),
  crat:mkWalk(SPR.rat,SPR.ratstep,Object.assign({},PAL,RAT_PAL.crat)),
  ironshell:mk(SPR.ironshell,Object.assign({},PAL,RARE_PAL.ironshell),2),palerat:mkWalk(SPR.brat,SPR.bratstep,Object.assign({},PAL,RARE_PAL.palerat)),
  bride:mk(SPR.bride,Object.assign({},PAL,RARE_PAL.bride)),
  skel:mk(SPR.dead,Object.assign({},PAL,{z:'#cfc8b2',Z:'#9a9282',r:'#3a3442'})),
  boss1:mk(SPR.dead,Object.assign({},PAL,{z:'#b9b3a0',Z:'#7a7468',r:'#3d2a63',e:'#b48cff'}),3)}; // bosses draw at 3x so they loom (placeholder until the art pass)
// Wolfwood (v0.40): blight wolf, Greyfang, Old Scar and the thornback boar, each with a step frame.
['wolf','greyfang','oldscar','boar'].forEach(k=>{IMG[k]=mkWalk(WOLF_SPR[k],WOLF_SPR[k+'step'],Object.assign({},PAL,WOLF_PAL[k]))});
IMG.greyfanghowl=mkWalk(WOLF_SPR.greyfanghowl,WOLF_SPR.greyfanghowlstep,Object.assign({},PAL,WOLF_PAL.greyfang)); // his howl pose, legs still running (v0.110)

// Ruined Chapel (v0.62): hooded cultists and the Ashen Acolyte from one robed shape (ROBED in sprites.js), and the ash wisp.
// The hood is a rounded cowl with the face lost in shadow and two eyes glowing in it; the robe flares to the hem; a rope belt;
// light from the left. Two step frames lift one side of the hem.
function mkRobed(id){const S=ROBED[id],W=S.w,H=S.h,cx=(W-1)/2,rx=W*0.29,ry=H*0.235,hy=H*0.23,b0=Math.round(H*0.37);
  const g=[];for(let j=0;j<H;j++){g[j]=[];for(let i=0;i<W;i++)g[j][i]='.'}
  const inHood=(i,j)=>((i-cx)/rx)**2+((j-hy)/ry)**2<1,half=j=>2.4+(j-b0)/2.6,inBody=(i,j)=>j>=b0&&j<H&&Math.abs(i-cx)<=half(j);
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){if(!inHood(i,j)&&!inBody(i,j))continue;const hx=i-cx;
    const edge=!(inHood(i-1,j)||inBody(i-1,j))||!(inHood(i+1,j)||inBody(i+1,j))||!(inHood(i,j-1)||inBody(i,j-1))||j===H-1||!(inHood(i,j+1)||inBody(i,j+1));
    let c=edge?'k':hx<-1?'A':hx>1.2?'d':'a';
    if(!edge&&inHood(i,j)&&((i-cx)/(rx*0.58))**2+((j-hy-0.9)/(ry*0.6))**2<1)c='f'; // the face lost in the hood's shadow
    g[j][i]=c}
  const ey=Math.round(hy+0.6);g[ey][Math.round(cx-1)]='e';g[ey][Math.round(cx+1)]='e';
  const belt=b0+Math.round((H-b0)*0.42);for(let i=0;i<W;i++)if(g[belt][i]!=='.'&&g[belt][i]!=='k')g[belt][i]='b';
  const put=(i,j,c)=>{if(j>=0&&j<H&&i>=0&&i<W)g[j][i]=c};
  if(S.item==='sickle'){[[W-2,b0+6],[W-1,b0+5],[W-1,b0+4],[W-1,b0+3],[W-2,b0+2],[W-3,b0+2]].forEach(([i,j])=>put(i,j,'l'));put(W-2,b0+7,'o');put(W-3,b0+8,'o')}
  if(S.item==='ember'){put(0,b0+1,'k');put(1,b0+1,'r');put(1,b0,'R');put(0,b0,'k');put(1,b0-1,'k')}
  // Dungeon 1 (v0.63): the mender's open book, the deacon's mace, the Prior's dead lantern on its chain and the weed hanging off
  // him, the Bellringer's great clapper-maul, Malrec's tall censer-staff.
  if(S.item==='book'){put(0,b0+3,'k');put(1,b0+3,'w');put(2,b0+3,'w');put(1,b0+4,'k');put(2,b0+4,'k')}
  if(S.item==='mace'){for(let j=b0+3;j<b0+8;j++)put(W-1,j,'o');put(W-2,b0+1,'k');put(W-1,b0+1,'l');put(W-2,b0+2,'l');put(W-1,b0+2,'l')}
  if(S.item==='lantern'){for(let j=b0+1;j<b0+5;j++)put(W-1,j,'c');put(W-2,b0+5,'k');put(W-1,b0+5,'g');put(W-2,b0+6,'g');put(W-1,b0+6,'g');put(W-2,b0+7,'k');put(W-1,b0+7,'k');
    for(let i=2;i<W-2;i+=3){const j=b0+2+((i*7)%(H-b0-3));if(g[j][i]!=='.'&&g[j][i]!=='k')put(i,j,'v');if(g[j+1]&&g[j+1][i]!=='.'&&g[j+1][i]!=='k')put(i,j+1,'v')}}
  if(S.item==='maul'){for(let j=b0-3;j<b0+8;j++)put(W-2,j,'o');for(let j=b0-6;j<b0-2;j++){put(W-3,j,'k');put(W-2,j,'n');put(W-1,j,'k')}put(W-2,b0-7,'k')}
  if(S.item==='staff'){for(let j=1;j<H-1;j++)put(W-1,j,'o');put(W-1,0,'k');put(W-2,1,'n');put(W-2,2,'r');put(W-2,3,'n')}
  if(S.item==='censer'){for(let j=b0+2;j<b0+6;j++)put(W-1,j,'c');put(W-2,b0+6,'k');put(W-1,b0+6,'n');put(W-1,b0+7,'k');put(W-2,b0+7,'n');put(W-1,b0+5,'r')}
  const pal=Object.assign({},PAL,{k:'#0b0a0f',a:S.robe,A:shiftCol(S.robe,[30,28,26]),d:shiftCol(S.robe,[-24,-22,-20]),f:'#100c0e',e:S.eye,b:shiftCol(S.robe,[-40,-38,-34]),
    l:'#a8a8b4',o:'#5a4028',r:'#ff8a3c',R:'#ffe0a0',c:'#8a8690',n:'#a0802a',w:'#e8e0c8',g:'#3a4a44',v:'#3a5a32'});
  const rows=g.map(r=>r.join('')),step=side=>{const n=g.map(r=>r.slice());for(let i=0;i<W;i++){if((side?i>cx:i<cx)&&n[H-1][i]!=='.'){n[H-1][i]='.';if(n[H-2][i]!=='.')n[H-2][i]='k'}}return n.map(r=>r.join(''))};
  const im=mk(rows,pal);im.steps=[mk(step(0),pal),mk(step(1),pal)];return im}
['zealot','ashcaller','chanter','acolyte','mender','deacon','prior','bellringer','malrec','summoner'].forEach(k=>{IMG[k]=mkRobed(k)});
// Undead and Brother Malrec redrawn (v0.65, character pass): each with its own body and a step frame (UNDEAD_SPR in sprites.js).
// Image keys stay the same (dead, skel, pet, minion, boss1, malrec), so mobs, pets and the DEV gallery pick them up as before.
[['dead','corpse'],['skel','skel'],['pet','pet'],['minion','minion'],['boss1','king'],['malrec','malrec']].forEach(([k,s])=>{IMG[k]=mkWalk(UNDEAD_SPR[s],UNDEAD_SPR[s+'step'],UNDEAD_PAL[s])});
// The Drowned Prior and the Bellringer get their own models too (character pass, Nov 21), replacing the shared robed shape.
['prior','bellringer'].forEach(k=>{IMG[k]=mkWalk(MONASTERY_SPR[k],MONASTERY_SPR[k+'step'],MONASTERY_PAL[k])});
// Redesign pass (Nov 21): every monster not yet redone gets its hand-drawn look; walkers get their step frame.
Object.keys(REDO_PAL).forEach(k=>{const s=REDO_SPR[k+'step'];IMG[k]=s?mkWalk(REDO_SPR[k],s,REDO_PAL[k]):mk(REDO_SPR[k],REDO_PAL[k])});
IMG.wisp=mk(WISP_SPR[0],WISP_PAL);IMG.wisp2=mk(WISP_SPR[1],WISP_PAL);IMG.gwisp=mk(GWISP_SPR[0],GWISP_PAL);IMG.gwisp2=mk(GWISP_SPR[1],GWISP_PAL);
// Candle wisp (v0.63, Malrec's Candle Wake): the ash wisp's flame in pale candle gold, so it reads as a different thing to chase.
IMG.cwisp=mk(WISP_SPR[0],Object.assign({},WISP_PAL,{k:'#4a3a10',y:'#ffd070',Y:'#fff0b0',s:'#a89a70'}));IMG.cwisp2=mk(WISP_SPR[1],Object.assign({},WISP_PAL,{k:'#4a3a10',y:'#ffd070',Y:'#fff0b0',s:'#a89a70'}));
// Default skin: lay each weapon over the shared body, then colour it from the class's SKINS entry.
function mkSkin(id){
  const sk=SKINS[id];if(!sk)return null;
  const rows=BASE_BODY.map(r=>r.split(''));
  (sk.weapons||[]).forEach(w=>(WEAPONS[w]||[]).forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]!=='.')rows[j][i]=r[i]}));
  return mk(rows.map(r=>r.join('')),Object.assign({},PAL,{h:sk.hair,b:sk.body,B:sk.shade,t:sk.trim,u:sk.boots,v:sk.glow||'#ffffff',q:sk.shield||'#6a82b0'}));
}
// Rags (gear tier 0): head + body + starter weapon on a 20x24 grid, coloured from RAGS. Also makes two
// walk frames where one foot lifts a pixel (feet are columns 4-7 and 10-13), so legs move instead of the whole body bobbing.
// ---------- Gear looks by zone (character lane, owner Nov 27; js/data/looks.js from tools/gear_looks.py) ----------
// What you wear shows: a worn chest or head item swaps that part's colours for its zone's look. The swapped letters become
// stand-in letters (1-5 head, 6-9 @ # $ % chest) so head colours apply only above the shoulders and chest colours only below.
// lk = {chest: zone look, head: zone look}; 0 or missing = rags.
const LOOK_HEAD='12345',LOOK_CHEST='6789@#$%';
function dress(rows,cls,lk){const L=GEAR_LOOKS[cls];if(!L||!lk)return rows;
  const hl=Object.keys((L.head||{})[lk.head]||{}),cl=Object.keys((L.chest||{})[lk.chest]||{});if(!hl.length&&!cl.length)return rows;
  let hy=rows.findIndex(r=>r.indexOf('H')>=0||r.indexOf('n')>=0);if(hy<0)hy=0;   // first row with clothes = the shoulders
  return rows.map((r,y)=>{let o='';for(const c of r){const i=y<hy?hl.indexOf(c):cl.indexOf(c);o+=i<0?c:(y<hy?LOOK_HEAD:LOOK_CHEST)[i]}return o})}
function dressPal(cls,lk){const L=GEAR_LOOKS[cls],p={};if(!L||!lk)return p;
  Object.values((L.head||{})[lk.head]||{}).forEach((v,i)=>p[LOOK_HEAD[i]]=v);
  Object.values((L.chest||{})[lk.chest]||{}).forEach((v,i)=>p[LOOK_CHEST[i]]=v);return p}
// The look a slot shows (owner, Nov 27): white and green show nothing (rags); blue shows its zone's look (zl, Zone 1 when it
// has none); pink shows the colours of the boss it came from (GEAR_MAKER), so you can tell where gear was won.
function slotLook(eq,sl){const id=eq&&eq[sl],it=id&&ITEMS[id];if(!it)return 0;
  if(it.rar==='named')return GEAR_MAKER[id]||it.zl||1;return it.rar==='rare'?(it.zl||1):0}
// True when a weapon is drawn in your hand (an equipped weapon with a look, on a class that holds one; never the Monk).
function weaponShown(){const w=inv.equip.weapon,it=w&&ITEMS[w];return !!(it&&WEAPON_LOOKS[it.wt]&&it.look&&CLASS_WEAPON[CLS])}
function mkRags(id,wid,lk){
  // v0.68: the hand-drawn 15x18 look when there is one (all 14 classes); the 20x24 shrink below stays as a fallback.
  // Nov 27 (character lane): the approved draft 2 body with attack poses, built by tools/player_frames.py.
  const pf0=PLAYER15[id];if(pf0){const D=r=>dress(r,id,lk),pf=lk?Object.assign({},pf0,{s:D(pf0.s),a:D(pf0.a),b:D(pf0.b),p:Object.fromEntries(Object.entries(pf0.p).map(([k,v])=>[k,v.map(D)]))}):pf0;const pal=Object.assign({},RAG15_COMMON,pf.c,dressPal(id,lk)),im=mk(pf.s,pal);im.ax=pf.s[0].length>>1;im.steps=[mk(pf.a,pal),mk(pf.b,pal)];
    im.fo=feetX(pf.s)-(pf.s[0].length>>1); // feet column relative to the middle, for the shadow
    // Owner (Nov 27): legs froze mid-run whenever an attack or cast went off, because a pose frame carries standing (or
    // lunging) legs. Each pose frame also gets three leg versions taken from the walk cycle (standing, left foot, right
    // foot): the bottom 5 rows, columns 0-10 of the standing body (legs only; a staff foot at 11+ stays the pose's own).
    const wk=[pf.s,pf.a,pf.b],mid=pf.s[0].length>>1;
    im.poses={};Object.keys(pf.p).forEach(k=>{im.poses[k]=pf.p[k].map((r,i)=>({im:mk(r,pal),ax:pf.x[k][i],tip:pf.pg&&pf.pg[k]&&pf.pg[k][i]?[pf.pg[k][i][0],pf.pg[k][i][1]]:null, // tip: the hand, where the channel glow sits (no weapon)
      legs:wk.map(w=>mk(withLegs(r,pf.x[k][i]-mid,w),pal))}))});return wid?armed(im,pf,id,wid):im}
  const q=RAG15[id];if(q){const pal=Object.assign({},RAG15_COMMON,q.c),im=mk(q.r,pal);im.steps=[mk(q.a,pal),mk(q.b,pal)];return im}
  const c=RAGS[id];if(!c)return null;
  const W=20,g=RAG_HEADS[id].concat(RAG_BODIES[c.body]).map(r=>{const a=r.split('');while(a.length<W)a.push('.');return a});
  c.w.forEach(w=>RAG_WEAPONS[w].forEach(([y0,rows])=>rows.forEach((r,j)=>{const y=y0+j;if(!g[y])return;for(let i=0;i<r.length&&i<W;i++)if(r[i]!=='.')g[y][i]=r[i]})));
  const pal=Object.assign({},RAG_COMMON,c.c),H=g.length;
  const step=(a,b)=>{const n=g.map(r=>r.slice());for(let x=a;x<=b;x++){n[H-3][x]=g[H-2][x];n[H-2][x]=g[H-1][x];n[H-1][x]='.'}return n.map(r=>r.join(''))};
  // v0.27.2: 20x24 read too big next to doors, so shrink to 15x18 (just over the old 12x16) by dropping every 4th row/column.
  const shrink=rows=>{const sh=18,sw=15,h=rows.length,w=rows[0].length,o=[];for(let j=0;j<sh;j++){let r='';const src=rows[Math.floor(j*h/sh)];for(let i=0;i<sw;i++)r+=src[Math.floor(i*w/sw)];o.push(r)}return o};
  const im=mk(shrink(g.map(r=>r.join(''))),pal);im.steps=[mk(shrink(step(4,7)),pal),mk(shrink(step(10,13)),pal)];return im;
}
// The player's picture: the rags look by default. DEV "Old look" shows the class's previous sprite
// (or the v0.15 default skin), and "Default skin" forces the shared 12x16 body, for comparing.
function playerImg(){
  if(dev.skin||(dev.old&&!C.sprite)){const k='skin_'+CLS;if(!IMG[k])IMG[k]=mkSkin(CLS)||IMG.druid;return IMG[k]}
  if(dev.old)return IMG[C.sprite];
  // Keyed by the equipped weapon too: equipping or removing one builds (once) the pictures with that weapon in hand.
  const w=inv.equip.weapon,it=w&&ITEMS[w],wid=it&&WEAPON_LOOKS[it.wt]&&it.look&&CLASS_WEAPON[CLS]?w:'',
    lk={chest:slotLook(inv.equip,'chest'),head:slotLook(inv.equip,'head')},k='rags_'+CLS+'|'+wid+'|'+lk.chest+lk.head;
  if(!IMG[k])IMG[k]=mkRags(CLS,wid,lk)||IMG.druid;return IMG[k];
}
// ---------- Weapon layer (character lane, Nov 27; owner OK'd the draft 4 looks) ----------
// The body frames have their old weapon cut out (tools/player_frames.py) and know where the hand closes and which way the
// weapon pointed (PLAYER15 g / pg: [x, y, degrees clockwise from straight up]). The equipped weapon's look (js/data/weapons.js:
// the item's type and look tier (wt, look in items.js), named makers' colours) is turned to that angle and drawn behind the body, so the fist closes
// over the grip. No weapon equipped = empty hand. The Monk fights with his fists: his hand wraps never show.
function weaponPal(cls,wid){const cw=CLASS_WEAPON[cls],acc=cw[1],handle=cw[2],look=ITEMS[wid].look,maker=WEAPON_MAKER[wid],P=WEAPON_PAL;
  const p=Object.assign({k:'#0b0a0f'},P.base,P.look[look]);
  if(handle&&!maker){if(handle==='#24222a'){p.y='#4a4650';p.Y='#2e2c36'}p.o=handle;p.O=handle} // Shadow Knight: black hilt, dark iron guard
  if(look>=2)p.g=acc;if(maker)Object.assign(p,P.named[maker]);return p}
// One weapon turned to an angle: nearest-pixel rotation of its upright drawing about the grip, then its own outline.
// Returns {c, gx, gy}: the picture and where the grip sits in it.
function weaponAt(rows,gr,deg,pal){
  const line=rows[gr],hc=[];for(let i=0;i<line.length;i++)if('oOIi'.indexOf(line[i])>=0)hc.push(i);
  const gc=hc.length?hc[hc.length>>1]:line.length>>1,a=deg*Math.PI/180,sq=deg%90===0,
    cs=sq?Math.round(Math.cos(a)):Math.cos(a),sn=sq?Math.round(Math.sin(a)):Math.sin(a);
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const W=Math.max.apply(null,rows.map(r=>r.length)),H=rows.length;
  [[-0.5,-0.5],[W-0.5,-0.5],[-0.5,H-0.5],[W-0.5,H-0.5]].forEach(q=>{const u=q[0]-gc,v=q[1]-gr,X=u*cs-v*sn,Y=u*sn+v*cs;
    x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y)});
  x0=Math.floor(x0);y0=Math.floor(y0);x1=Math.ceil(x1);y1=Math.ceil(y1);
  const out=[];for(let Y=y0;Y<=y1;Y++){let r='';for(let X=x0;X<=x1;X++){const sx=Math.round(X*cs+Y*sn+gc),sy=Math.round(-X*sn+Y*cs+gr);
    r+=sy>=0&&sy<H&&sx>=0&&sx<rows[sy].length?rows[sy][sx]:'.'}out.push(r)}
  const at=(x,y)=>(out[y]||'')[x],g=[];
  for(let y=-1;y<=out.length;y++){let r='';for(let x=-1;x<=out[0].length;x++){const c=at(x,y);
    if(c&&c!=='.'){r+=c;continue}const n=[at(x+1,y),at(x-1,y),at(x,y+1),at(x,y-1)].some(q=>q&&q!=='.');r+=n?'k':'.'}g.push(r)}
  return{c:mk(g,pal).c,gx:1-x0,gy:1-y0}}
// A body picture with the weapon behind it. The canvas grows to fit the weapon, evenly left and right (so the middle stays
// the middle) and at the top; growth at the bottom is kept in by, so the feet stay on the ground.
function withWeapon(im,m,wp){if(!m)return im;const w=wp(m[2]),ox=m[0]-w.gx,oy=m[1]-w.gy,
    L=Math.max(0,-ox,ox+w.c.width-im.w),T=Math.max(0,-oy),B=Math.max(0,oy+w.c.height-im.h),
    c=document.createElement('canvas');c.width=im.w+2*L;c.height=im.h+T+B;const g=c.getContext('2d');
  g.drawImage(w.c,ox+L,oy+T);g.drawImage(im.c,L,T);
  const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const fg=f.getContext('2d');fg.translate(c.width,0);fg.scale(-1,1);fg.drawImage(c,0,0);
  return{c:c,f:f,w:c.width,h:c.height,by:B,pad:L}}
function armed(im,pf,cls,wid){const type=ITEMS[wid].wt,look=ITEMS[wid].look,T=WEAPON_LOOKS[type],L=T[look]||T[Math.min(4,look)];
  if(!L)return im;const pal=weaponPal(cls,wid),cache={},wp=deg=>cache[deg]||(cache[deg]=weaponAt(L[0],L[1],deg,pal));
  const gs=pf.g&&pf.g.s,o=withWeapon(im,gs,wp);o.fo=im.fo;o.steps=im.steps.map(st=>withWeapon(st,gs,wp));o.poses={};
  Object.keys(im.poses).forEach(k=>{o.poses[k]=im.poses[k].map((p,i)=>{const m=pf.pg&&pf.pg[k]&&pf.pg[k][i],a=withWeapon(p.im,m,wp);
    // tip: the top of the weapon (grip spot moved up by the grip row; poses hold it upright), where the channel glow sits
    return{im:a,ax:p.ax+(a.pad||0),tip:m?[m[0]+(a.pad||0),m[1]+(a.h-p.im.h-(a.by||0))-L[1]]:null,legs:p.legs.map(l=>withWeapon(l,m,wp))}})});
  return o}
// Walk cycle for pictures that have step frames: stand, left foot up, stand, right foot up (body rises on steps).
// Copy the walk frame's legs (bottom 5 rows, standing columns 0-10) into a pose frame; sh = pose column minus standing column.
function withLegs(pose,sh,walk){const P=pose.map(r=>r.split('')),dy=P.length-walk.length;
  for(let y=walk.length-5;y<walk.length;y++)for(let x=0;x<=10;x++){const X=x+sh;if(P[y+dy]&&X>=0&&X<P[y+dy].length)P[y+dy][X]=walk[y][x]}
  return P.map(r=>r.join(''))}
// Where the feet are (the middle column of the boots, 'O', in the bottom rows, left of any staff), so the shadow sits under
// the feet rather than under the picture's middle; most classes stand a pixel left of the middle (owner, Nov 27).
function feetX(rows){const h=rows.length;let n=0,t=0;for(let y=h-3;y<h;y++)for(let x=0;x<=10&&x<rows[y].length;x++)if(rows[y][x]==='O'){n++;t+=x}
  return n?Math.round(t/n):rows[0].length>>1}
function walkFrame(img,walk,moving){
  if(!moving)return{im:img,bob:0};
  const f=Math.floor(walk*6)%4; // a bit slower than before so the steps read clearly
  if(!img.steps)return{im:img,bob:f%2};
  return{im:f===1?img.steps[0]:f===3?img.steps[1]:img,bob:0,leg:f===1?1:f===3?2:0}; // feet move, body stays put (the bob made it look jittery)
}

/* ---------- Render ---------- */
let S=3,VW=160,VH=200,camX=0,camY=0,dpr=1;
// Screen space the top and bottom UI leave free over the player, in CSS pixels from the top of the view (ui() measures it,
// render() eases toward it). SAFE_HEAD / SAFE_FEET: game pixels from your feet to just above your head / just below your feet.
const camSafe={top:0,bot:0,wantTop:0,wantBot:0,t:0},SAFE_HEAD=30,SAFE_FEET=3;
const SAFE_TOP_IDS=['pframe','tframe','toggles','topbtns','mm','devbtn'];
function measureSafe(){
  const vr=$('view').getBoundingClientRect(),g=S/dpr,px=vr.left+(player.x-camX)*g,half=12*g; // your sprite's left and right, with a little room
  const over=r=>r.width>0&&r.height>0&&r.right>px-half&&r.left<px+half;
  let top=0;SAFE_TOP_IDS.forEach(id=>{const el=$(id);if(!el||el.style.visibility==='hidden')return;const r=el.getBoundingClientRect();if(over(r))top=Math.max(top,r.bottom-vr.top)});
  let bot=vr.height;[...ctrl.children,logEl].forEach(el=>{const r=el.getBoundingClientRect();if(over(r)&&r.top-vr.top>vr.height/2)bot=Math.min(bot,r.top-vr.top)});
  camSafe.wantTop=top+4;camSafe.wantBot=bot-4; // nothing over you: just keep your head and feet on screen
  if(!camSafe.ready){camSafe.top=camSafe.wantTop;camSafe.bot=camSafe.wantBot;camSafe.ready=1} // first measure: start where it should be
}
// Zoom: settings.zoom is how many game pixels wide the view should be (bigger = see more).
// The game scales up by whole steps (S) so pixels stay crisp, so the real width snaps to the nearest step.
// Resolution cap is 3x (was 2x) so phones get finer zoom steps.
const ZOOM_MIN=150, ZOOM_MAX=210; // farthest zoom is one notch past a 210-pixel-wide view (tuned by play-test in v0.11.7)
// Landscape (v0.75, UI breakdown 22, owner picked A1 with centred frames): zoom is measured across the screen's SHORT side,
// so a phone on its side shows the same amount of world as upright, just turned. settings.zoom means that short side.
const zoomSide=()=>Math.min(cv.width,cv.height);
function zoomSteps(){const sd=zoomSide(),lo=Math.max(2,Math.ceil(sd/ZOOM_MAX)-1),hi=Math.max(lo,Math.floor(sd/ZOOM_MIN));return [lo,hi]}
function applyZoom(){
  const [lo,hi]=zoomSteps();
  S=Math.min(hi,Math.max(lo,Math.round(zoomSide()/settings.zoom)));VW=Math.ceil(cv.width/S);VH=Math.ceil(cv.height/S);
}
// LAND = phone held sideways. Turning the phone just re-lays the HUD (class "land" on <body>, controls rebuilt); nothing reloads.
let LAND=false;
function resize(){
  const r=$('view').getBoundingClientRect();dpr=Math.min(3,window.devicePixelRatio||1);
  cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);
  const land=r.width>r.height;
  if(land!==LAND){LAND=land;document.body.classList.toggle('land',land);
    ['toggles','topbtns','mm','logpanel','devbtn'].forEach(id=>{const el=$(id);if(el){el.style.top='';delete el.dataset.dy;delete el.dataset.top}});
    if(typeof ctrl!=='undefined'&&ctrl.children.length)buildControls();}
  applyZoom();
}
// Step the zoom by one notch (+1 = closer, -1 = farther) and remember it.
function zoomStep(d){
  const [lo,hi]=zoomSteps(),n=Math.min(hi,Math.max(lo,S+d));if(n===S)return;
  S=n;settings.zoom=Math.round(zoomSide()/S);saveSettings();applyZoom();
}
window.addEventListener('resize',resize);
const bay=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const dark=document.createElement('canvas'),dg=dark.getContext('2d'),stampCache={};
// A light pool with a smooth fade (v0.27.2: the old dither pattern looked grainy). 'cut' removes darkness, 'warm' adds firelight color.
function lightStamp(r,amb,kind){
  const key=r+'|'+amb+'|'+kind;if(stampCache[key])return stampCache[key];
  const size=r*2+2,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),id=g.createImageData(size,size),d=id.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const v=Math.max(0,1-Math.hypot(x-r-1,(y-r-1)*1.15)/r);if(v<=0)continue;
    let a=kind==='cut'?Math.min(1,v*v*0.9/(1-amb)):v*v;
    const o=(y*size+x)*4;if(kind==='warm'){d[o]=255;d[o+1]=150;d[o+2]=60}else if(kind==='cool'){d[o]=170;d[o+1]=200;d[o+2]=215}d[o+3]=a*255;
  }
  g.putImageData(id,0,0);stampCache[key]=c;return c;
}
// Whole pixels and the same width on both sides of x (owner, Nov 27: shadows shook, because a fractional position
// smeared the edge pixels a little differently every frame while the body snapped to whole pixels).
function shadow(x,y,r){x=Math.round(x);y=Math.round(y);lx.fillStyle='rgba(0,0,0,0.5)';lx.fillRect(x-r,y-1,r*2+1,2);lx.fillRect(x-r+1,y+1,r*2-1,1)}
// Mob attack frames (MOB_POSES, from tools/mob_attack_draft.py) turned into pictures once: each with its ax and by.
const MOB_POSE_IMG={},MOB_DEATH_IMG={};Object.keys(MOB_POSES._deaths).forEach(k=>{const D=MOB_POSES._deaths[k];MOB_DEATH_IMG[k]={t:D.t,f:D.f.map(p=>({im:mk(p.rows,D.pal),ax:p.ax,by:p.by}))}}); // rat deaths (v0.118)
// Cast poses (v0.147): MOB_CASTS[img][kind] = {h: frames held while the bar fills, r: frames played once when it goes off}.
const MOB_CAST_IMG={};Object.keys(MOB_CASTS).forEach(k=>{MOB_CAST_IMG[k]={};Object.keys(MOB_CASTS[k]).forEach(n=>{const C=MOB_CASTS[k][n],f=p=>({im:mk(p.rows,C.pal),ax:p.ax,by:p.by});MOB_CAST_IMG[k][n]={h:C.h.map(f),r:C.r.map(f),rt:C.rt}})});
Object.keys(MOB_POSES).forEach(k=>{if(k==='_deaths')return;const P=MOB_POSES[k],o={t:P.t};['wind','smear','hit','rec'].forEach(s=>{o[s]={im:mk(P[s].rows,P.pal),ax:P[s].ax,by:P[s].by}});MOB_POSE_IMG[k]=o});
function drawSprite(img,x,y,dir,bob,sit){
  const im=dir<0?img.f:img.c,w=img.w,h=img.h;
  // Round the position first, then offset by whole pixels: with an odd width (15) Math.round(x-w/2) flipped a pixel out of step with the camera, so sprites shook while walking sideways (v0.27.4).
  const dx=Math.round(x)-(w>>1),dy=Math.round(y)-h+(img.by||0)+(bob||0);
  if(sit){lx.drawImage(im,0,0,w,h-4,dx,dy+4,w,h-4)}else lx.drawImage(im,dx,dy);
}
// A pose frame can be wider than the standing body (a sword thrust out front): ax is the column that lines up with the
// body's middle, so the body stays put and only the weapon reaches out. Facing left, the frame is mirrored, and so is ax.
function drawPose(p,x,y,dir){const im=p.im,dx=Math.round(x)-(dir<0?im.w-1-p.ax:p.ax),dy=Math.round(y)-im.h+(p.by||0)+(im.by||0);lx.drawImage(dir<0?im.f:im.c,dx,dy)} // im.by: a player frame grown at the bottom to fit a weapon
function line(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;lx.fillStyle=col;
  for(let i=0;i<400;i++){lx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}}
// Trees on screen (v0.92, optimization lane): areas hold thousands of trees (Wolfwood ~3,000 counting the woods past the
// edges) and checking every one each frame made most of the frame's garbage. The trees are sorted once into 128-pixel
// squares; each frame only the squares in view are checked. The grid rebuilds itself if the area's tree list changes
// (repaintArea). Visible trees keep the area's list order, so the depth sort draws exactly as before.
const TG=128,tgOut=[],entsBuf=[],byY=(a,b)=>a.y-b.y;
let tgStamp=0;
function treesInView(A){
  const L=A.trees;
  if(A.tg_arr!==L||A.tg_n!==L.length){const g=new Map();
    L.forEach((tr,i)=>{tr.ti=i;for(let cy=Math.floor(tr.b[1]/TG);cy<=Math.floor(tr.b[3]/TG);cy++)for(let cx=Math.floor(tr.b[0]/TG);cx<=Math.floor(tr.b[2]/TG);cx++){
      const k=cx*65536+cy;let c=g.get(k);if(!c)g.set(k,c=[]);c.push(tr)}});
    A.tg=g;A.tg_arr=L;A.tg_n=L.length}
  tgOut.length=0;tgStamp++;
  const x0=Math.floor(camX/TG),x1=Math.floor((camX+VW)/TG),y0=Math.floor(camY/TG),y1=Math.floor((camY+VH)/TG);
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const c=A.tg.get(cx*65536+cy);if(!c)continue;
    for(let i=0;i<c.length;i++){const tr=c[i];if(tr.ts===tgStamp)continue;tr.ts=tgStamp;
      if(tr.b[2]>=camX&&tr.b[0]<=camX+VW&&tr.b[3]>=camY&&tr.b[1]<=camY+VH)tgOut.push(tr)}}
  return tgOut.sort((a,b)=>a.ti-b.ti)}
let time=0;
function render(){
  // Smooth camera (v0.45, optimization lane): the camera and every moving sprite snap to a SCREEN pixel (1/S of a game pixel),
  // not a whole game pixel. Art stays crisp (each game pixel is still an S x S block) but the world glides instead of
  // stepping one game pixel at a time, which made diagonal walking jitter (x and y stepped on different frames).
  const sn=v=>Math.round(v*S)/S,pxr=sn(player.x),pyr=sn(player.y);
  // Character always centred (v0.76, UI chat, owner Nov 24, upright and sideways): the camera keeps you in the middle of the
  // screen everywhere, map edges included, instead of stopping at the edges and letting you drift off centre. The ground
  // and woods carry on past every edge (drawn below), so there's never a black box. CAM_LIFT: your middle, not your feet,
  // sits at the screen's middle (sprites are 18 tall).
  const CAM_LIFT=9;
  camX=sn(pxr-VW/2);camY=sn(pyr-CAM_LIFT-VH/2);
  // Safety net from v0.55 (never under the bars): the middle is clear of the top frames and the spell grid on any normal
  // phone, but ui() still measures what sits over you and nudges the view if a very short screen ever puts you under one.
  if(camSafe.ready){const now=performance.now(),k=Math.min(1,(now-(camSafe.t||now))/90);camSafe.t=now;
    camSafe.top+=(camSafe.wantTop-camSafe.top)*k;camSafe.bot+=(camSafe.wantBot-camSafe.bot)*k;
    const g=S/dpr; // CSS pixels per game pixel
    camY=Math.max(camY,pyr+SAFE_FEET-camSafe.bot/g); // feet stay above the spell grid and chat box
    camY=Math.min(camY,pyr-SAFE_HEAD-camSafe.top/g); // head stays below the top bars (wins if a tiny screen can't fit both)
    camY=sn(camY);}
  cx.setTransform(S,0,0,S,0,0);cx.imageSmoothingEnabled=false;cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  lx.fillStyle='#050507';lx.fillRect(0,0,VW,VH);
  if(shakeT>0){const k=shakeA*Math.min(1,shakeT/0.25);camX+=Math.round((Math.random()*2-1)*k);camY+=Math.round((Math.random()*2-1)*k)} // the Toll (v0.79)
  lx.save();lx.translate(-camX,-camY);
  lx.drawImage(world,0,0);
  // Past the map edges the ground carries on as a mirror of the edge instead of black (owner, v0.55 top and bottom; v0.76
  // left, right and the corners): roads run on, grass and moss keep going. Areas keep ground-only edge strips (no buildings
  // to double up); the older built-in maps mirror the whole edge. Corners mirror the top or bottom strip both ways.
  {const H=world.height,W=world.width,eT=world.edgeTop||world,eB=world.edgeBot||world,eL=world.edgeLeft||world,eR=world.edgeRight||world;
    const ht=Math.min(Math.ceil(-camY)+1,eT.height),hb=Math.min(Math.ceil(camY+VH-H)+1,eB.height),
      wl=Math.min(Math.ceil(-camX)+1,eL.width),wr=Math.min(Math.ceil(camX+VW-W)+1,eR.width);
    // m(img, sx,sy,w,h, flipX,flipY, dx,dy): copy a piece of a strip, mirrored about the map edge at dx / dy.
    const m=(im,sx,sy,w,h,fx,fy,ex,ey)=>{if(w<=1||h<=1)return;lx.save();lx.translate(ex,ey);lx.scale(fx?-1:1,fy?-1:1);lx.drawImage(im,sx,sy,w,h,0,0,w,h);lx.restore()};
    m(eT,0,0,eT.width,ht,0,1,0,0);                              // above the top edge
    m(eB,0,eB.height-hb,eB.width,hb,0,1,0,2*H-(H-hb));          // below the bottom edge
    m(eL,0,0,wl,eL.height,1,0,0,0);                             // left of the left edge
    m(eR,eR.width-wr,0,wr,eR.height,1,0,2*W-(W-wr),0);          // right of the right edge
    const cw=Math.min(wl,eT.width),cr=Math.min(wr,eT.width);
    m(eT,0,0,cw,ht,1,1,0,0);                                    // top-left corner
    m(eT,eT.width-cr,0,cr,ht,1,1,2*W-(W-cr),0);                 // top-right corner
    m(eB,0,eB.height-hb,cw,hb,1,1,0,2*H-(H-hb));                // bottom-left corner
    m(eB,eB.width-cr,eB.height-hb,cr,hb,1,1,2*W-(W-cr),2*H-(H-hb));} // bottom-right corner
  if(curArea())drawAreaCritters(curArea(),0); // frogs, ripples, crows on the ground (v0.49)
  if(curArea())drawAreaFog(curArea());
  if(zoneId==='over'){drawCamp();drawCritters();}
  if(zoneId==='dun'&&run.portal){const p=run.portal;lx.fillStyle='#7dffa6';for(let a=0;a<24;a++){if((a+Math.floor(time*8))%3===0)continue;const an=a/24*Math.PI*2;lx.fillRect(Math.round(p.x+Math.cos(an)*7),Math.round(p.y+Math.sin(an)*4),1,1)}lx.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,2,2)}
  // Barred gates (v0.62, the chapel's east gate): two plank leaves in the wall with an iron-bound bar across, or swung open.
  {const BA=curArea();if(BA&&BA.bars)BA.bars.forEach(b=>{const x=b.tx*T,y=b.ty*T,f=(X,Y,w,h,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,w,h)};
    f(x-1,y-6,3,22,'#0b0a0f');f(x+14,y-6,3,22,'#0b0a0f');f(x,y-5,1,20,'#84848e');f(x+15,y-5,1,20,'#5a5a64');
    if(!b.open){f(x+1,y-3,14,18,'#0b0a0f');f(x+2,y-2,12,16,'#4a3222');[4,7,10].forEach(i=>f(x+2+i,y-2,1,16,'#2a1a12'));f(x+1,y+4,14,3,'#0b0a0f');f(x+1,y+5,14,1,'#7a5a42');f(x+3,y+4,2,3,'#2b2738');f(x+11,y+4,2,3,'#2b2738')}
    else{f(x+1,y-3,3,18,'#0b0a0f');f(x+2,y-2,1,16,'#4a3222');f(x+12,y-3,3,18,'#0b0a0f');f(x+13,y-2,1,16,'#4a3222');f(x-4,y+13,8,2,'#0b0a0f');f(x-3,y+13,6,1,'#7a5a42')}})}
  // Ember Brand (v0.62): a ring of embers on the ground under where you stood, filling in as it comes to a head; step out.
  hazards.forEach(h=>{const p=h.t/h.dur;for(let a=0;a<56;a++){if((a+Math.floor(time*10))%6===0)continue;const an=a/56*6.283;lx.fillStyle=a%2?'#ff8a3c':'#ffe9a8';lx.fillRect(Math.round(h.x+Math.cos(an)*h.r),Math.round(h.y+Math.sin(an)*h.r*0.6)-1,2,2)}
    lx.globalAlpha=0.18+0.32*p;lx.fillStyle=p>0.8&&Math.floor(time*12)%2?'#ffb060':'#c4471f';lx.beginPath();lx.ellipse(Math.round(h.x),Math.round(h.y),h.r*p,h.r*0.6*p,0,0,7);lx.fill();lx.globalAlpha=1});
  const CHA=curArea();if(CHA)CHA.chests.forEach(ch=>{const x=Math.round(ch.x),y=Math.round(ch.y),f=(X,Y,w,h,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,w,h)};
    if(ch.open){f(x-7,y-12,14,14,AP.out);f(x-6,y-11,12,3,AP.woodHi);f(x-6,y-8,12,1,AP.woodDk);f(x-6,y-7,12,8,AP.wood);f(x-5,y-7,10,3,'#120d0a');f(x-6,y-3,12,1,AP.bell)} // lid up, empty inside
    else{f(x-7,y-8,14,10,AP.out);f(x-6,y-7,12,8,AP.wood);f(x-6,y-7,12,2,AP.woodHi);f(x-6,y-4,12,1,AP.bell);f(x-1,y-5,2,3,AP.bellHi)}});
  // Dungeon 1 (v0.63): the slab over the stairs until you touch the altar; Grasp of the Deep's hands; the Toll's ring of sound.
  if(CHA)CHA.seals.forEach(sl=>{const x=sl.x0*T,y=sl.y0*T,w=(sl.x1-sl.x0+1)*T,f=(X,Y,ww,h,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,ww,h)};
    // v0.79: a seal held by a named that isn't the Prior (the Bellringer's foundry) is an iron gate: rusty bars, two crossbars
    // with rivets, spiked feet in the floor; it rises slowly into the arch when he's driven off.
    if(sl.named&&sl.by!=='drowned_prior'){const p=sl.open?1-Math.min(1,(time-(sl.openT||0))/1.4):1;if(p<=0)return;
      const H=22,top=sl.y1*T-6,h=Math.round(H*p);f(x-1,top-2,w+2,3,'#0b0a0f');f(x,top-1,w,1,'#4a4652');
      for(let bx=x+1;bx<x+w-1;bx+=4){f(bx,top,3,h,'#0b0a0f');f(bx+1,top,1,h,'#6a5a4e');if(h>=H-1)f(bx+1,top+h,1,2,'#0b0a0f')}
      [5,14].forEach(cy=>{if(cy<h){f(x,top+cy,w,3,'#0b0a0f');f(x,top+cy+1,w,1,'#7a6458');for(let bx=x+2;bx<x+w-1;bx+=4)f(bx,top+cy+1,1,1,'#a08870')}});return}
    if(sl.open)return;
    // v0.66: a seal a named holds (the Drowned Prior's stairs) is dark flood water over the steps, a slow ripple on it, until he dies.
    if(sl.named){const hh=(sl.y1-sl.y0+1)*T;f(x,y,w,hh,AP.flood[1]);f(x,y,w,1,AP.floodDk);for(let i=0;i<6;i++){const rx=x+((i*23+Math.floor(time*6))%(w-4)),ry=y+3+((i*11)%(hh-6));f(rx,ry,4,1,AP.floodHi)}
      f(x+4,y+hh-6,3,1,'#4a4652');f(x+w-9,y+hh-9,3,1,'#4a4652');return} // the top edge of a step just showing under the water
    f(x-1,y-2,w+2,18,AP.out);f(x,y-1,w,16,AP.cst);f(x,y-1,w,2,AP.cstHi);f(x+w-3,y-1,3,16,AP.cstDk);f(x+9,y+3,1,5,AP.cstMor);f(x+10,y+7,1,4,AP.cstMor);f(x+20,y+4,4,1,AP.cstMor);f(x+4,y+12,w-8,1,AP.cstDk)});
  // Locked rooms (v0.71): an iron portcullis over the doorway while you're shut in, dropping fast with a little bounce when it
  // slams, rising slowly when it lifts. Bars you can see through (the hall's light behind), crossbars, spiked feet in the floor.
  if(CHA&&CHA.locks)CHA.locks.forEach(L=>{let p=L.shut?Math.min(1,(time-L.closeT)/0.16):L.openT?1-Math.min(1,(time-L.openT)/1.2):0;if(p<=0)return;
    if(L.shut&&time-L.closeT<0.3&&time-L.closeT>0.16)p=1-0.08*Math.sin((time-L.closeT-0.16)/0.14*Math.PI); // the bounce
    const x=L.x0*T,w=(L.x1-L.x0+1)*T,H=19,top=L.y0*T-4,h=Math.round(H*p),f=(X,Y,ww,hh,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,ww,hh)};
    f(x-1,top-2,w+2,3,'#0b0a0f');f(x,top-1,w,1,'#4a4652'); // the slot in the arch it drops from
    for(let bx=x+1;bx<x+w-1;bx+=4){f(bx,top,3,h,'#0b0a0f');f(bx+1,top,1,h,'#5c5c66');if(h>=H-1){f(bx+1,top+h,1,2,'#0b0a0f')}} // bars, then spikes into the floor
    [5,12].forEach(cy=>{if(cy<h){f(x,top+cy,w,3,'#0b0a0f');f(x,top+cy+1,w,1,'#6e6a72');for(let bx=x+2;bx<x+w-1;bx+=4)f(bx,top+cy+1,1,1,'#8a8690')}}); // crossbars with rivets
  });
  // Grasp of the Deep (v0.66): rings of ripples spreading on the spot under you while the Prior casts; step off them.
  mobs.forEach(m=>{const c=m.casting;if(!c||!c.spots||m.dead)return;const p=c.t/c.dur;c.spots.forEach(s=>{const sx=Math.round(s.x),sy=Math.round(s.y);
    for(let k=0;k<3;k++){const q=((time*1.4+k/3)%1),r=GRASP.r*(0.25+0.75*q);lx.globalAlpha=(1-q)*(0.5+0.5*p);lx.fillStyle=k%2?'#9fd8c0':'#d8f0e8';
      for(let a=0;a<40;a++){if(a%5===0)continue;const an=a/40*6.283;lx.fillRect(Math.round(sx+Math.cos(an)*r),Math.round(sy+Math.sin(an)*r*0.6),2,1)}}
    lx.globalAlpha=0.15+0.35*p;lx.fillStyle=p>0.75&&Math.floor(time*12)%2?'#d8f0e8':'#33505c';lx.beginPath();lx.ellipse(sx,sy,GRASP.r,GRASP.r*0.6,0,0,7);lx.fill();lx.globalAlpha=1})});
  hands.forEach(h=>{const p=Math.min(1,h.t/0.35),fade=h.on?1:Math.max(0,1-(h.t-0.9)/0.5),x=Math.round(h.x),y=Math.round(h.y),up=Math.round(6*p),f=(X,Y,w,hh,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,w,hh)};
    lx.globalAlpha=fade;f(x-3,y-up,2,up+1,'#b8c8c0');f(x+1,y-up,2,up+1,'#9fb4ac');f(x-4,y-up-2,1,2,'#cfdcd4');f(x-2,y-up-3,1,3,'#cfdcd4');f(x,y-up-3,1,3,'#cfdcd4');f(x+2,y-up-2,1,2,'#cfdcd4');f(x-4,y,9,1,'#33505c');lx.globalAlpha=1});
  rings.forEach(r=>{if(r.t<0)return;const p=r.t/r.life,rad=r.r*(0.4+0.6*p);lx.globalAlpha=1-p;lx.fillStyle=r.col||'#ffd27a';for(let a=0;a<48;a++){const an=a/48*6.283;lx.fillRect(Math.round(r.x+Math.cos(an)*rad),Math.round(r.y+Math.sin(an)*rad*0.6),2,1)}lx.globalAlpha=1});
  const instNow=zoneId==='dun'||(CHA&&CHA.instance);
  if(instNow&&run.portal&&CHA){const p=run.portal,x=Math.round(p.x),y=Math.round(p.y);for(let a=0;a<32;a++){if((a+Math.floor(time*6))%4===0)continue;const an=a/32*6.283;lx.fillStyle=a%2?'#ffd27a':'#fff0c8';lx.fillRect(Math.round(x+Math.cos(an)*9),Math.round(y+Math.sin(an)*4),1,1)}} // the way out
  if(instNow&&run.stairs&&CHA)drawOutStairs(run.stairs); // v0.140: the way out rising from the floor
  if(instNow&&run.chest){const c=run.chest,x=Math.round(c.x),y=Math.round(c.y);lx.fillStyle='#0b0a0f';lx.fillRect(x-6,y-8,12,9);lx.fillStyle=c.open?'#3b2a1d':'#6e4a2a';lx.fillRect(x-5,y-7,10,7);lx.fillStyle='#c9a227';lx.fillRect(x-5,y-5,10,1);lx.fillRect(x-1,y-6,2,3);}
  if(player.tx!==null){lx.fillStyle='#c9a227';const x=Math.round(player.tx),y=Math.round(player.ty);lx.fillRect(x-2,y,1,1);lx.fillRect(x+2,y,1,1);lx.fillRect(x,y-1,1,1);lx.fillRect(x,y+1,1,1)}
  if(rangeShow>0){lx.fillStyle='#ff8a80';for(let a=0;a<64;a+=2){const an=a/64*Math.PI*2;lx.fillRect(Math.round(player.x+Math.cos(an)*rangeR),Math.round(player.y+Math.sin(an)*rangeR*0.8),1,1)}}
  const t=player.target;
  if(t&&!t.dead){lx.save();lx.translate(sn(t.x)-Math.round(t.x),sn(t.y)-Math.round(t.y));for(let a=0;a<24;a++){if((a+Math.floor(time*6))%3===0)continue;const an=a/24*Math.PI*2;lx.fillStyle='#ffcc33';lx.fillRect(Math.round(t.x+Math.cos(an)*8),Math.round(t.y+Math.sin(an)*2.6),1,1)}lx.restore()}
  // Holy ground: a dotted gold ring on the floor that blinks out in its last 3 seconds.
  grounds.forEach(g=>{if(g.t<3&&Math.floor(time*6)%2)return;lx.fillStyle=g.col;for(let a=0;a<48;a++){if((a+Math.floor(time*4))%4===0)continue;const an=a/48*Math.PI*2;lx.fillRect(Math.round(g.x+Math.cos(an)*g.r),Math.round(g.y+Math.sin(an)*g.r*0.6),1,1)}});
  // Venom Totem: a little carved post in the middle of its ring. Spike Traps: grey spikes on the ground.
  grounds.forEach(g=>{if(!g.totem)return;const x=Math.round(g.x),y=Math.round(g.y);lx.fillStyle='#0b0a0f';lx.fillRect(x-2,y-9,4,10);lx.fillStyle='#6e4a2a';lx.fillRect(x-1,y-8,2,8);lx.fillStyle=Math.floor(time*3)%2?'#7a9a3a':'#9be37a';lx.fillRect(x-1,y-9,2,2)});
  traps.forEach(tr=>{const x=Math.round(tr.x),y=Math.round(tr.y);lx.fillStyle='#8d8692';for(let i=-3;i<=3;i+=2)lx.fillRect(x+i,y-1-((i+3)%4?0:1),1,2);lx.fillStyle='#4a3b33';lx.fillRect(x-4,y+1,9,1)});
  // Trees in view join the depth sort (v0.30): whoever stands north of a trunk is drawn first, so the crown covers them.
  // Everyone and every tree in view, in one reused list (no new arrays each frame), then sorted north to south.
  // Same order as before (mobs, NPCs, pets, decoy, you, trees) going in, and the sort keeps ties in that order.
  const A0=curArea(),ents=entsBuf;ents.length=0;
  for(let i=0;i<mobs.length;i++)ents.push(mobs[i]);
  if(zoneId==='over')for(let i=0;i<npcs.length;i++)ents.push(npcs[i]);
  if(A0&&A0.folk)for(let i=0;i<A0.folk.length;i++)ents.push(A0.folk[i]); // Town 1's townsfolk
  if(pet)ents.push(pet);if(pet2)ents.push(pet2);if(decoy)ents.push(decoy);ents.push(player);if(remoteHere()){ents.push(remote);(remote.pets||[]).forEach(q=>ents.push(q))} // your partner and their pets (multiplayer, js/net.js)
  if(A0){const tv=treesInView(A0);for(let i=0;i<tv.length;i++)ents.push(tv[i])}
  ents.sort(byY);
  // A tree you (or your target) are behind fades so you never lose sight of the fight.
  const behind=(o,tr)=>o&&!o.dead&&o.y<tr.y&&o.x+6>tr.b[0]&&o.x-6<tr.b[2]&&o.y>tr.b[1]+4&&o.y-14<tr.b[3];
  const drawEnt=e=>{
    if(e===player){
      player.castTip=null;if(player.dead>0)return;
      const moving=player.tx!==null||joy.active||(settings.move==='hold'&&joy.id!==null)||keys.w||keys.a||keys.s||keys.d;
      const pim=playerImg(),pp=player.sit||player.fd>0?null:playerPose(pim),wf=walkFrame(pim,player.walk,moving&&!player.sit);
      // Shadow under the feet: the feet column measured from the standing picture, mirrored when facing left.
      const fo=pim&&pim.fo||0;shadow(Math.round(player.x)+(player.dir<0?-fo:fo),player.y,5);
      if(hidden())lx.globalAlpha=0.4; // hidden Rogue draws see-through
      if(pp)drawPose(moving&&pp.legs?{im:pp.legs[wf.leg||0],ax:pp.ax}:pp,player.x,player.y+1,player.dir); // attack or cast pose (js/anim.js); legs keep walking
      else drawSprite(wf.im,player.x,player.y+1,player.dir,wf.bob,player.sit||player.fd>0);
      lx.globalAlpha=1;
      // Channel glow (character lane, owner Nov 27): a spell with a cast time charges at the staff tip (or the hand, or in
      // front of the body for classes with no cast pose); js/anim.js castGlowDraw draws it and the light pool grows with it.
      const fl0=player.flash,flE=fl0?time-fl0.t0:9;if(flE>=FLASH_T||player.cast)player.flash=null;
      const ga=player.cast&&!player.cast.a.melee?player.cast.a:player.flash?player.flash.a:null;
      if(ga&&!player.sit){let tx,ty;
        if(pp&&pp.tip){const im=moving&&pp.legs?pp.legs[wf.leg||0]:pp.im,dx=Math.round(player.x)-(player.dir<0?im.w-1-pp.ax:pp.ax),dy=Math.round(player.y+1)-im.h+(pp.by||0)+(im.by||0);
          tx=player.dir<0?dx+im.w-1-pp.tip[0]:dx+pp.tip[0];ty=dy+pp.tip[1]}
        else{tx=Math.round(player.x)+player.dir*6;ty=Math.round(player.y)-10}
        player.castTip={x:tx,y:ty,p:player.cast?Math.min(1,player.cast.time/ga.cast):1-flE/FLASH_T,col:ga.col,tier:glowTier(ga)}}
      // Weapon aura on a basic attack (js/anim.js auraDraw): at the weapon's tip in the pose, or the fist / in front of the body.
      player.atkTip=null;const au=player.aura,auE=au?time-au.t0:9;if(auE>=AURA.t)player.aura=null;
      if(au&&auE<AURA.t&&!player.sit&&!player.cast){let tx,ty;
        if(pp&&pp.tip){const im=moving&&pp.legs?pp.legs[wf.leg||0]:pp.im,dx=Math.round(player.x)-(player.dir<0?im.w-1-pp.ax:pp.ax),dy=Math.round(player.y+1)-im.h+(pp.by||0)+(im.by||0);
          tx=player.dir<0?dx+im.w-1-pp.tip[0]:dx+pp.tip[0];ty=dy+pp.tip[1]}
        else{tx=Math.round(player.x)+player.dir*7;ty=Math.round(player.y)-8}
        const cw=CLASS_WEAPON[CLS];player.atkTip={x:tx,y:ty,p:auE/AURA.t,col:cw&&cw[1]||'#ffd27a'}}
      if(player.buffs.stance>0&&Math.floor(time*4)%2===0){lx.fillStyle='#c9a227';lx.fillRect(Math.round(player.x)-7,Math.round(player.y)-12,1,1);lx.fillRect(Math.round(player.x)+7,Math.round(player.y)-12,1,1)}
      if(player.buffs.bark>0&&Math.floor(time*4)%4===0){lx.fillStyle='#a07850';lx.fillRect(Math.round(player.x)-6,Math.round(player.y)-10,1,1);lx.fillRect(Math.round(player.x)+6,Math.round(player.y)-6,1,1)}
      if(player.buffs.aura>0){lx.fillStyle='#ffd27a';for(let a=0;a<16;a++){if((a+Math.floor(time*8))%2)continue;const an=a/16*Math.PI*2;lx.fillRect(Math.round(player.x+Math.cos(an)*8),Math.round(player.y-7+Math.sin(an)*10),1,1)}}
      if(player.buffs.mshield>0&&Math.floor(time*4)%2===0){lx.fillStyle='#7dbbff';lx.fillRect(Math.round(player.x)-7,Math.round(player.y)-8,1,2);lx.fillRect(Math.round(player.x)+7,Math.round(player.y)-8,1,2)}
      if(player.cast&&player.cast.a.melee){lx.fillStyle=player.cast.a.col;const k=Math.floor(time*10)%4;lx.fillRect(Math.round(player.x)+5,Math.round(player.y)-15-k,1,1);lx.fillRect(Math.round(player.x)-5,Math.round(player.y)-13+k,1,1)}
      return;
    }
    // Your partner: their class's look and weapon, walking or sitting, a glow while they cast (multiplayer step 1, js/net.js).
    if(e===remote){const im=remoteImg(e),wf=walkFrame(im,e.walk,e.moving&&!e.sit),fo=im&&im.fo||0;
      shadow(Math.round(e.x)+(e.dir<0?-fo:fo),e.y,5);if(net.quiet)lx.globalAlpha=0.5;
      drawSprite(wf.im,e.x,e.y+1,e.dir,wf.bob,e.sit);lx.globalAlpha=1;
      if(e.cast){lx.fillStyle=e.cast.col||'#cfc8b2';const k=Math.floor(time*10)%4;lx.fillRect(Math.round(e.x)+e.dir*6,Math.round(e.y)-11-k%2,1,1);lx.fillRect(Math.round(e.x)+e.dir*5,Math.round(e.y)-13+k%2,1,1)}
      return}
    if(e===decoy){lx.globalAlpha=0.45;drawSprite(playerImg(),e.x,e.y+1,e.dir,0,false);lx.globalAlpha=1;return}
    if(e===pet||e===pet2||e.rpet){const im=IMG[e.img||'pet']||IMG.pet; // rpet: your partner's pet
      if(e.img==='blade'){shadow(e.x,e.y,2);drawSprite(im,e.x,e.y-4+Math.round(Math.sin(time*3)),e.dir,0,false);return} // the sword floats
      shadow(e.x,e.y,Math.max(4,Math.round(im.w/2.4)));
      if(im.steps){const mv=e._lw!==e.walk;e._lw=e.walk;drawSprite(walkFrame(im,e.walk,mv).im,e.x,e.y+1,e.dir,0,false)} // new pets step their legs, standing still when idle
      else drawSprite(im,e.x,e.y+1,e.dir,Math.floor(e.walk*6)%2,false);
      if(e.charm&&Math.floor(time*3)%2===0){lx.fillStyle='#ff9de2';const hy=Math.round(e.y-im.h-3);lx.fillRect(Math.round(e.x)-1,hy,1,1);lx.fillRect(Math.round(e.x)+1,hy,1,1);lx.fillRect(Math.round(e.x),hy+1,1,1)} // little heart over a charmed mob
      return}
    if(e.folk){shadow(e.x,e.y,5);drawFolk(e);return}
    if(e.kind){shadow(e.x,e.y,5);const mv=e.target||Math.hypot(e.x-e.hx,e.y-e.hy)>2;drawSprite(IMG[e.kind],e.x,e.y+1,e.dir,mv?(Math.floor(e.walk*6)%2):0,false);return}
    const m=e;if(m.dead)return;
    const img=IMG[m.def.img];
    // Ash wisps (v0.62) hover: a small shadow, a slow bob, the flame flickering between two frames, a thread of smoke.
    if(m.def.float){const bob=Math.round(Math.sin(time*3+m.hx)*1.5),fpf=poseFrame(m);shadow(m.x,m.y,3);if(fpf)drawPose(fpf,m.x,m.y-5+bob,m.dir);else drawSprite(Math.floor(time*8+m.hx)%2?(IMG[m.def.img+'2']||IMG.wisp2):img,m.x,m.y-5+bob,m.dir,0,false);
      if(Math.random()<0.2)parts.push({x:m.x+(Math.random()-0.5)*2,y:m.y-6+bob,vx:(Math.random()-0.5)*4,vy:-9,t:0,life:0.9,col:'#6a6670'});return}
    shadow(m.x,m.y,Math.max(4,Math.round(img.w/2.4)));
    if(m.def.rare){const pr=0.5+0.5*Math.sin(time*3),rw=Math.round(img.w/2)+2;lx.globalAlpha=0.09+0.08*pr;lx.fillStyle='#d8c8ff';lx.beginPath();lx.ellipse(Math.round(m.x),Math.round(m.y),rw,Math.max(2,Math.round(rw/3)),0,0,7);lx.fill();lx.globalAlpha=1;
      if(Math.random()<0.12)parts.push({x:m.x+(Math.random()-0.5)*img.w,y:m.y-Math.random()*img.h,vx:0,vy:-8,t:0,life:0.7,col:'#e6dcff'})} // the faint glow that says "rare" (visual only, no game rolls)
    const mmv=(m.state!=='idle'||Math.hypot(m.x-m.wx,m.y-m.wy)>1)&&!(m.root>0)&&!(m.near>0);
    // v0.102 (js/anim.js): the swing lunge moves the sprite only, never the mob itself.
    const an=mobAnim(m),fim=img.steps?walkFrame(img,m.walk,mmv).im:img,fb=img.steps?0:(mmv?(Math.floor(m.walk*6)%2):0);
    const hp=howlFrame(m); // Greyfang's howl pose while he howls, running legs and all (js/anim.js)
    const pf=hp?null:poseFrame(m); // an attack frame: the skeleton's swing, the wolf's bite (js/anim.js)
    if(hp)drawSprite(walkFrame(hp,m.walk,mmv).im,m.x+an.dx,m.y+1+an.dy,m.dir,0,false);else if(pf)drawPose(pf,m.x,m.y+1,m.dir);else drawSprite(fim,m.x+an.dx,m.y+1+an.dy,m.dir,fb,false);
    if(m.root>0){lx.fillStyle='#5e3e24';for(let i=-5;i<=5;i+=2)lx.fillRect(Math.round(m.x)+i,Math.round(m.y)-((i+Math.floor(time*3))%3===0?2:1),1,2);lx.fillStyle='#3f6b3a';lx.fillRect(Math.round(m.x)-4,Math.round(m.y)-3,1,1);lx.fillRect(Math.round(m.x)+4,Math.round(m.y)-2,1,1)}
    if(m.snare>0&&Math.floor(time*3)%2===0){lx.fillStyle='#5f9ea0';lx.fillRect(Math.round(m.x)-3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x)+3,Math.round(m.y),1,1);lx.fillRect(Math.round(m.x),Math.round(m.y)+1,1,1)}
    if(m.mark>0&&Math.floor(time*2)%2===0){lx.fillStyle='#ffb37a';const my=Math.round(m.y-img.h-4);lx.fillRect(Math.round(m.x),my,1,2);lx.fillRect(Math.round(m.x)-1,my+1,3,1)} // Hunter's Mark
    if(m.chill>0&&Math.floor(time*3+m.x)%2===0){lx.fillStyle='#bfe6ff';for(let i=0;i<m.chill;i++)lx.fillRect(Math.round(m.x)-4+i*3,Math.round(m.y)-1,1,1)}
    if(m.chantT>0&&Math.floor(time*5+m.x)%3===0){lx.fillStyle='#e0c3ff';const cy=Math.round(m.y-img.h-2);lx.fillRect(Math.round(m.x)-4,cy+Math.floor(time*4)%3,1,1);lx.fillRect(Math.round(m.x)+4,cy+(Math.floor(time*4)+1)%3,1,1)} // a chanter's song on it (v0.62)
    if(m.type==='acolyte'&&Math.random()<0.3)parts.push({x:m.x+(Math.random()-0.5)*8,y:m.y-4,vx:(Math.random()-0.5)*5,vy:-7,t:0,life:1.1,col:Math.random()<0.15?'#ff8a3c':'#7a7680'}); // trailing smoke and the odd ember
    if(m.dots.length&&rng()<0.25)parts.push({x:m.x+rr(-4,4),y:m.y-rr(4,12),vx:0,vy:-10,t:0,life:0.5,col:'#6aa84f'});
  };
  // Each sprite and its little overlays (roots, marks, buff sparkles) are drawn at whole game pixels, then the lot is
  // nudged by the leftover fraction so it moves as smoothly as the camera and the overlays stay stuck to it.
  ents.forEach(e=>{
    if(e.tree){const goal=(player.dead>0?false:behind(player,e))||behind(player.target,e)?0.4:1;e.a+=(goal-e.a)*0.2;if(Math.abs(goal-e.a)<0.02)e.a=goal;
      lx.globalAlpha=e.a;lx.drawImage(e.tree.c,e.px,e.py);lx.globalAlpha=1;return}
    // Nudge there and back instead of save()/restore() per sprite (restore was ~8% of the frame); the alpha is reset after.
    const ox=sn(e.x)-Math.round(e.x),oy=sn(e.y)-Math.round(e.y);lx.translate(ox,oy);
    if(e.emerge&&emergeClip(e)){drawEnt(e);lx.restore()}else drawEnt(e); // a rat climbing out of its hole (js/anim.js)
    // Wading (v0.64): in slow water (Dungeon 1's flood, the crossroads creek) the water covers your feet and shins, with a
    // ripple ring that moves, so you can see why you're slow. Floating things (wisps, the sword) skim over.
    if(slowArea&&!e.dead&&!(e.def&&e.def.float)&&e.img!=='blade'&&e!==decoy&&!(e===player&&player.dead>0)){const SA=slowArea,tx=Math.floor(e.x/T),ty=Math.floor(e.y/T);
      const dep=tx>=0&&ty>=0&&tx<SA.w&&ty<SA.h&&SA.slow[ty*SA.w+tx]?wadeDepth(e.x,e.y):0;
      // v0.123 (owner): the wading look starts only once you're really in the water and gets deeper as you go in; a splash
      // when you step in, and a ring of ripples spreading from your legs while you're in it.
      if(dep>0&&!e._wd)e._spl=time;e._wd=dep;
      if(dep>0){const x=Math.round(e.x),y=Math.round(e.y),fl=SA.rows[ty][tx]==='z',w=e===player?16:Math.min(26,Math.max(12,Math.round(((IMG[e.img]||{}).w||14)*0.9))),ph=Math.floor(time*5+x)%4,hh=2+Math.round(3*dep);
        lx.fillStyle=fl?AP.flood[1]:AP.water;lx.fillRect(x-w/2,y+2-hh,w,hh);lx.fillStyle=fl?AP.floodHi:AP.waterHi;lx.fillRect(x-w/2-1+ph%2,y+2-hh,w+2,1);
        lx.fillStyle=AP.glint;lx.globalAlpha=0.5;lx.fillRect(x-w/2-2-ph,y-1,2,1);lx.fillRect(x+w/2+ph,y-1,2,1);
        const rt=(time*0.9+x*0.013)%1,rr=w/2+1+rt*7;lx.globalAlpha=0.45*(1-rt); // the spreading ripple ring, flattened (3/4 view)
        for(let a=0;a<20;a++){const an=a/20*6.283;lx.fillRect(Math.round(x+Math.cos(an)*rr),Math.round(y+Math.sin(an)*rr*0.35),1,1)}
        const st=time-(e._spl||-9);if(st<0.4){lx.globalAlpha=1-st/0.4; // the splash: drops thrown up and out, falling back
          for(let k=0;k<6;k++){const dx=(k-2.5)*3.2*(1+st*3),dy=-8*st*(1+k%2)+22*st*st;lx.fillRect(Math.round(x+dx),Math.round(y-2+dy),1,1+(k%2))}}
        lx.globalAlpha=1}}
    lx.translate(-ox,-oy);lx.globalAlpha=1});
  if(A0)drawAreaCritters(A0,1); // perched crows, owl, bats, chimney smoke (v0.49)
  beams.forEach(b=>line(b.x1,b.y1,b.x2,b.y2,b.col));
  // Loot pillars (v0.97): a soft column of light rising from a good drop, bright core, wider faint edge, fading out.
  pillars.forEach(p=>{const f=Math.min(1,p.t*4)*Math.max(0,1-p.t/p.life),x=Math.round(p.x),y=Math.round(p.y),h=44+Math.round(6*Math.sin(p.t*3));
    lx.globalAlpha=0.35*f;lx.fillStyle=p.col;lx.fillRect(x-3,y-h,7,h);lx.globalAlpha=0.9*f;lx.fillRect(x-1,y-h-4,3,h+4);lx.globalAlpha=1});
  parts.forEach(p=>{lx.fillStyle=p.col;lx.fillRect(Math.round(p.x),Math.round(p.y),1,1)});
  fxDraw(); // slashes, sinking bodies, the Skeleton King's bone (js/anim.js)
  lx.restore();
  // v0.71: def.glow = a named that carries its own cold light (the Drowned Prior's lantern; without it he melted into his
  // dark water and read as a plain hooded shape).
  // Lighting: a dark overlay with dithered light pools cut out of it. The pools are pre-drawn "stamps",
  // so each frame is just a few image draws instead of reading and rewriting every pixel (the old way stuttered on phones).
  const AT=curArea()&&AREA_TINT[curArea().tint],amb=AT?AT.amb:zoneId==='dun'?0.22:0.38,fl=1+0.04*Math.sin(time*9)+0.02*Math.sin(time*23);
  // v0.95: an area's own fixed lights are baked into its light map (area.js bakeLight); only lights that move (floaters,
  // hazards, rares, the Prior's lantern) are still stamped live here.
  const AR=curArea(),baked=!!(AR&&AR.lmCut);
  const zl=AR?(baked?[]:AR.lights).concat(mobs.filter(m=>m.def.float&&!m.dead).map(m=>({x:m.x,y:m.y-10,r:26,w:26})),hazards.map(h=>({x:h.x,y:h.y,r:36+20*h.t/h.dur,w:40}))).concat(mobs.filter(m=>m.def.rare&&!m.dead).map(m=>({x:m.x,y:m.y-6,r:30,w:0,c:34}))).concat(mobs.filter(m=>m.def.glow&&!m.dead).map(m=>({x:m.x,y:m.y-12,r:m.def.glow,w:0,c:46}))).concat(stairsLight()):zoneId==='over'?[{x:CAMPFIRE.x,y:CAMPFIRE.y-3,r:70,w:36},{x:DOOR.x,y:DOOR.y-4,r:34,w:0}].concat(TORCHES.map(t=>({x:t.x,y:t.y-2,r:52,w:30}))):(zoneId==='arena'?ARENA:DUN).braziers.map(b=>({x:b.x,y:b.y-4,r:62,w:32}));
  // The darkness canvas lines up with the world's pixel grid (one game pixel bigger than the view on each side), so light
  // pools stay put on the ground while the camera glides.
  const ox=Math.floor(camX),oy=Math.floor(camY),DW=VW+2,DH=VH+2;
  // v0.72 (owner, Nov 21): the player no longer carries a light; you see by the world's own lights and ambient.
  // PLAYER_LIGHT = 1 brings the old glow back (radius 95) if dark spots turn out unreadable on the phone.
  const ct=player.castTip,lights=(PLAYER_LIGHT?[{x:player.x,y:player.y-8,r:95,w:18}]:[]).concat(ct?[{x:ct.x,y:ct.y,r:6+(GLOW_TIER.light[ct.tier]-6)*ct.p,w:0,steady:1}]:[],zl) // channel glow lights the ground around the caster
    .map(l=>({x:Math.round(l.x),y:Math.round(l.y),r:Math.round(l.r*(l.c||l.steady?1:fl)),w:l.w,c:l.c})).filter(l=>l.x>camX-l.r&&l.x<camX+VW+l.r&&l.y>camY-l.r&&l.y<camY+VH+l.r);
  if(dark.width!==DW||dark.height!==DH){dark.width=DW;dark.height=DH}
  dg.globalCompositeOperation='source-over';dg.clearRect(0,0,DW,DH);dg.fillStyle='rgba('+(AT?AT.col:'0,0,0')+','+(1-amb)+')';dg.fillRect(0,0,DW,DH);
  dg.globalCompositeOperation='destination-out';
  if(baked)drawLightMap(dg,AR.lmCut,ox,oy,DW,DH,0,0);
  lights.forEach(l=>dg.drawImage(lightStamp(l.r,amb,'cut'),l.x-ox-l.r-1,l.y-oy-l.r-1));
  dg.globalCompositeOperation='source-over';
  lx.save();lx.translate(-camX,-camY);
  lx.drawImage(dark,ox,oy);
  lx.globalCompositeOperation='lighter';
  if(baked){drawLightMap(lx,AR.lmGlow,ox,oy,DW,DH,ox,oy);
    // Fire flickers: a small warm glow near each flame breathes with the flicker (kept small so it never reaches past a wall).
    AR.lights.forEach(l=>{if(!(l.w>0)||l.x<camX-l.r||l.x>camX+VW+l.r||l.y<camY-l.r||l.y>camY+VH+l.r)return;const a=(fl-0.95)*3;if(a<=0)return;
      const r=Math.max(6,Math.round(l.r*0.45));lx.globalAlpha=a*l.w/255;lx.drawImage(lightStamp(r,amb,'warm'),Math.round(l.x)-r-1,Math.round(l.y)-r-1)})}
  lights.forEach(l=>{if(l.w>0){lx.globalAlpha=l.w/255;lx.drawImage(lightStamp(l.r,amb,'warm'),l.x-l.r-1,l.y-l.r-1)}if(l.c>0){lx.globalAlpha=l.c/255;lx.drawImage(lightStamp(l.r,amb,'cool'),l.x-l.r-1,l.y-l.r-1)}}); // c = cold daylight
  lx.restore();
  drawGlows();
  lx.save();lx.translate(-camX,-camY);fxDrawLit();castGlowDraw();auraDraw();if(run.stairs&&curArea()&&curArea().instance)drawStairsShaft(run.stairs);lx.restore(); // the Bone Throw, over the dark (js/anim.js)
  cx.setTransform(1,0,0,1,0,0); // back to screen pixels for the crisp text layer
  // Crisp text layer
  cx.textAlign='center';cx.textBaseline='middle';
  if(t&&!t.dead){const sx=(t.x-camX)*S,sy=(t.y-(IMG[t.def.img].h)-6-camY)*S;cx.font='600 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';cx.strokeText(cap(t.def.name),sx,sy);cx.fillStyle=con(t.lv);cx.fillText(cap(t.def.name),sx,sy)}
  // Your partner's name over their head, with a thin health bar and their cast bar (multiplayer step 1).
  if(remoteHere()){const r=remote,sx=(r.x-camX)*S,sy=(r.y-24-camY)*S,w=26*dpr,h=3*dpr;
    cx.font='600 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';const nm=(player.ally?'+ ':'')+r.name;cx.strokeText(nm,sx,sy);cx.fillStyle=player.ally?'#ffd27a':'#9fd8ff';cx.fillText(nm,sx,sy); // gold with a + while picked for your heals
    cx.fillStyle='#000';cx.fillRect(sx-w/2-dpr,sy+6*dpr-dpr,w+2*dpr,h+2*dpr);cx.fillStyle='#3a1418';cx.fillRect(sx-w/2,sy+6*dpr,w,h);cx.fillStyle='#d8433e';cx.fillRect(sx-w/2,sy+6*dpr,w*Math.max(0,Math.min(1,r.hp/r.mhp)),h);
    if(r.cast){cx.fillStyle='#000';cx.fillRect(sx-w/2-dpr,sy+10*dpr-dpr,w+2*dpr,h+2*dpr);cx.fillStyle=r.cast.col||'#cfc8b2';cx.fillRect(sx-w/2,sy+10*dpr,w*r.cast.p,h)}}
  // Sleeping (mesmerized) mobs: "Zz" and seconds left, so you know when to re-mez.
  mobs.forEach(m=>{if(m.dead||!(m.mez>0))return;const sx=(m.x-camX)*S,sy=(m.y-IMG[m.def.img].h-(m===t?14:4)-camY)*S;cx.font='700 '+Math.round(10*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=3*dpr;cx.strokeStyle='#000';const s='Zz '+Math.ceil(m.mez);cx.strokeText(s,sx,sy);cx.fillStyle=m.mez<4?'#ffb37a':'#e0c3ff';cx.fillText(s,sx,sy)});
  // A boss casting its big spell: a purple bar over its head that fills up, so you can see it coming and stun it or step away.
  mobs.forEach(m=>{if(m.dead||!m.casting)return;const w=40*dpr,h=5*dpr,sx=(m.x-camX)*S-w/2,sy=(m.y-IMG[m.def.img].h-(m===t?22:10)-camY)*S;
    cx.fillStyle='#000';cx.fillRect(sx-dpr,sy-dpr,w+2*dpr,h+2*dpr);cx.fillStyle='#2a2033';cx.fillRect(sx,sy,w,h);cx.fillStyle=Math.floor(time*8)%2?'#d8b8ff':'#b48cff';cx.fillRect(sx,sy,w*Math.min(1,m.casting.t/m.casting.dur),h)});
  // Floating text (v0.33, option A): solid for the first two thirds, then fades; numbers ease upward, words hold still.
  floats.forEach(f=>{const F=FLOAT[f.kind]||FLOAT.num,p=Math.min(1,f.t/f.life),a=p<0.65?1:1-(p-0.65)/0.35,rise=F.rise*(1-(1-p)*(1-p)),
    sx=(f.x-camX)*S,sy=(f.y-camY-rise)*S;cx.globalAlpha=Math.max(0,a);
    cx.font='700 '+Math.round(F.px*dpr)+'px ui-monospace,Menlo,monospace';cx.lineWidth=(F.px<10?2.5:3)*dpr;cx.strokeStyle='#000';cx.strokeText(f.txt,sx,sy);cx.fillStyle=f.col;cx.fillText(f.txt,sx,sy);cx.globalAlpha=1});
  if(settings.move==='joy'&&settings.showJoy&&joy.active){
    const r=cv.getBoundingClientRect(),bx=(joy.sx-r.left)*dpr,by=(joy.sy-r.top)*dpr,R=40*dpr,d=Math.hypot(joy.dx,joy.dy)||1,k=Math.min(1,40/d);
    cx.globalAlpha=0.35;cx.fillStyle='#14121a';cx.beginPath();cx.arc(bx,by,R,0,Math.PI*2);cx.fill();cx.strokeStyle='#c9a227';cx.lineWidth=2*dpr;cx.stroke();
    cx.globalAlpha=0.7;cx.fillStyle='#c9a227';cx.beginPath();cx.arc(bx+joy.dx*k*dpr,by+joy.dy*k*dpr,16*dpr,0,Math.PI*2);cx.fill();cx.globalAlpha=1;
  }
  bubbles.forEach(b=>{
    const o=b.o,sx=(o.x-camX)*S,sy=(o.y-(o===remote?30:22)-camY)*S,fs=Math.round(10*dpr),pad=5*dpr,maxW=170*dpr;
    cx.font=fs+'px ui-monospace,Menlo,monospace';
    const words=b.text.split(' '),ls=[];let cur='';words.forEach(w=>{const t2=cur?cur+' '+w:w;if(cx.measureText(t2).width>maxW&&cur){ls.push(cur);cur=w}else cur=t2});if(cur)ls.push(cur);
    const w=Math.max(...ls.map(l=>cx.measureText(l).width))+pad*2,h=ls.length*fs*1.25+pad*2;
    const bx=Math.max(4,Math.min(cv.width-w-4,sx-w/2)),by=Math.max(4,sy-h);
    cx.globalAlpha=b.t>3.5?Math.max(0,(4-b.t)*2):1;
    cx.fillStyle='rgba(20,18,26,0.92)';cx.strokeStyle='#c9a227';cx.lineWidth=1*dpr;cx.beginPath();cx.rect(bx,by,w,h);cx.fill();cx.stroke();
    cx.fillStyle='#e8e2cf';ls.forEach((l,i)=>cx.fillText(l,bx+w/2,by+pad+fs*0.6+i*fs*1.25));cx.globalAlpha=1;
  });
  if(player.dead>0){cx.fillStyle='rgba(60,0,0,0.35)';cx.fillRect(0,0,cv.width,cv.height);}
}

/* ---------- Townsfolk (v0.158, Town 1) ---------- */
// Each townsperson's frames (js/data/townsfolk.js) are drawn once into small canvases, then the idle loop picks one by
// time (each person offset by ph so they don't all move together). Frames are 19 x 26 with the feet on the bottom rows.
const FOLK_IMG={};
function folkFrames(id){if(FOLK_IMG[id])return FOLK_IMG[id];const d=TOWNSFOLK[id];
  FOLK_IMG[id]=d.frames.map(rows=>{const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const g=c.getContext('2d');
    rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;g.fillStyle=d.pal[ch]||'#f0f';g.fillRect(x,y,1,1)}});return c});
  FOLK_IMG[id].total=d.seq.reduce((t,s)=>t+s[1],0);return FOLK_IMG[id]}
function drawFolk(e){const d=TOWNSFOLK[e.folk],im=folkFrames(e.folk);let t=((time+e.ph*7)*1000)%im.total,f=d.seq[0][0];
  for(const s of d.seq){if(t<s[1]){f=s[0];break}t-=s[1]}
  const c=im[f];lx.drawImage(c,Math.round(e.x)-9,Math.round(e.y)+1-c.height)}

/* ---------- HUD ---------- */
// Buff bar names and colours come from the abilities that give them (plus a few that aren't on every class).
const BUFFS={sprint:{short:'Sprint',name:'Sprint',col:'#7dbbd0',icon:'speed'},laststand:{short:'Last Stand',name:'Last Stand',col:'#ffd27a',icon:'heart'}};AB.forEach(a=>{if(a.buff)BUFFS[a.buff]={short:a.short,name:a.name,col:a.col,icon:a.icon}});
// Buff and debuff icons with timers (UI breakdown 18, option B): one row of spell icons; a dark shade fills down from the top
// as the effect runs out, a number shows only under 10s, and the edge blinks red in the last 3s. The longest time each effect
// has had since it was last put up is its "full" time (a refresh starts it again). The row is rebuilt only when the set of
// effects changes; shades and numbers update in place.
const FXM_P={},FXM_T=new WeakMap();
function fxFull(st,k,v){const m=st[k];if(!m||v>m.p+0.05)st[k]={max:v,p:v};else m.p=v;return st[k].max}
function fxRow(el,items){
  const key=items.map(i=>i.k+'/'+i.icon+'/'+i.col+'/'+(i.stack||'')).join('|');
  if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=items.map(i=>'<div class="fx" data-n="'+i.name+'">'+iconHTML({icon:i.icon,col:i.col},14)+'<i class="sh"></i>'+(i.stack?'<em>'+i.stack+'</em>':'')+'<b class="n"></b></div>').join('')}
  items.forEach((i,j)=>{const d=el.children[j];if(!d)return;const timed=i.t>0&&i.max>0;
    const pc=timed?Math.max(0,Math.min(100,Math.round(100*(1-i.t/i.max)))):0,sh=d.querySelector('.sh');if(sh.dataset.p!==String(pc)){sh.dataset.p=pc;sh.style.height=pc+'%'}
    const n=timed&&i.t<10?String(Math.ceil(i.t)):'',nb=d.lastChild;if(nb.textContent!==n)nb.textContent=n;
    d.classList.toggle('low',timed&&i.t<=3)});
}
function ui(){
  const L=player.lvl;
  measureSafe();
  mmReveal();drawMinimap();
  $('plv').textContent='Lv '+L;
  // Your frame (v0.33.1): numbers on the left, percent on the right, same as the target frame.
  const mh=maxHP(L),mm=maxMP(L),hpN=Math.max(0,Math.ceil(player.hp)),mpN=Math.max(0,Math.floor(player.mp));
  $('php').style.width=(100*player.hp/mh)+'%';$('phpn').textContent=hpN+'/'+mh;$('phpp').textContent=Math.max(0,Math.ceil(100*player.hp/mh))+'%';
  if(mm){$('pmp').style.width=(100*player.mp/mm)+'%';$('pmpn').textContent=mpN+'/'+mm;$('pmpp').textContent=Math.max(0,Math.floor(100*player.mp/mm))+'%';}
  // Pet bar: health, except a charmed mob shows how long the charm has left (pink), so you can see it about to break.
  // v0.34: the pet gets a thin row of its own at the bottom of your frame: its name (Earth elemental, Skeleton...), what it's
  // hitting (or "held" after Back off), and a thin bar. Timed pets show seconds left; under 5s the bar turns red.
  $('petrow').style.display=pet?'block':'none';
  if(pet){const pb=$('petbar');let nm=cap(petName()),col='#cfc8b2',w=100*pet.hp/pet.maxhp;
    if(pet.charm){nm='Charmed '+nm+' '+Math.ceil(pet.charmT)+'s';w=100*pet.charmT/pet.charmMax;col=pet.charmT<5?'#ff4d4d':'#ff9de2'}
    else if(pet.life){nm+=' '+Math.ceil(pet.life)+'s';if(pet.life<5)col='#ff4d4d'}
    pb.style.width=Math.max(0,w)+'%';pb.style.background=col;
    const tg=pet.hold?'held':pet.target&&!pet.target.dead?'› '+cap(pet.target.def.name.replace(/^an? /,'')):'';
    if($('petnm').textContent!==nm)$('petnm').textContent=nm;if($('pettg').textContent!==tg)$('pettg').textContent=tg;}
  // Your partner's row (multiplayer): health, and whether your heals go to them. Tapping it picks them (js/ui.js).
  {const on=net.state==='on'&&!!remote,row=$('partyrow');if(row.style.display!==(on?'block':'none'))row.style.display=on?'block':'none';
    if(on){const r=remote,here=remoteHere(),nm=r.name+(r.lv?' · Lv '+r.lv:''),st=r.dead?'down':!here?'away':player.ally?'+ healing':'';
      if($('partynm').textContent!==nm)$('partynm').textContent=nm;if($('partyst').textContent!==st)$('partyst').textContent=st;
      $('partybar').style.width=(r.dead?0:Math.max(0,Math.min(100,100*r.hp/(r.mhp||1))))+'%';row.classList.toggle('picked',!!player.ally)}}
  ['bpetatk','bpetback'].forEach(id=>{const b=$(id);if(b)b.style.display=pet&&!player.dead?'flex':'none'});
  const bb0=$('bpetback');if(bb0)bb0.classList.toggle('held',!!(pet&&pet.hold));
  $('pxp').style.width=(L>=LEVEL_CAP?100:Math.min(100,100*player.xp/need(L)))+'%'; // capped: a save from before v0.34.1 can hold more XP than the new table needs (it dings on the next kill)
  const t=player.target,tf=$('tframe');
  if(t&&!t.dead){tf.style.visibility='visible';$('tname').textContent=cap(t.def.name);$('tname').style.color=con(t.lv);
    const hp=Math.max(0,Math.ceil(t.hp)),pc=Math.max(0,Math.ceil(100*t.hp/t.maxhp));
    $('thp').style.width=(100*t.hp/t.maxhp)+'%';$('thpn').textContent=hp+'/'+t.maxhp;$('thpp').textContent=pc+'%';
    // Effects on the target as icons with timers (v0.58, UI breakdown 18 B); traits that never run out sit after the level.
    const st=FXM_T.get(t)||{};FXM_T.set(t,st);const fx=[],add=(k,icon,col,name,v,stack)=>fx.push({k,icon,col,name,t:v||0,max:v>0?fxFull(st,k,v):0,stack});
    if(t.mez>0)add('mez','mez','#e0c3ff','Asleep',t.mez);if(t.stun>0)add('stun','star','#ffe08a','Stunned',t.stun);if(t.fear>0)add('fear','ghost','#d9a0ff','Afraid',t.fear);
    if(t.root>0)add('root','roots','#8fd17a','Rooted',t.root);if(t.snare>0)add('snare','boot','#a8d8a0','Snared',t.snare);
    t.dots.forEach(d=>{const ab=ABI[d.id];add('dot'+d.id,ab&&ab.icon||(d.id==='bleed'?'dagger':d.id==='burn'?'flame':'drip'),ab&&ab.col||(d.id==='bleed'?'#ff8a80':d.id==='burn'?'#ff9a4a':'#9be37a'),d.name||(ab&&ab.name)||'Rot',d.t)});
    if(t.chill>0)add('chill','frost','#bfe6ff','Chilled x'+t.chill,0,'x'+t.chill);if(t.aslow>0)add('aslow','hourglass','#c8b8a0','Slowed',t.aslow);if(t.discord>0)add('discord','notes','#ffd27a','Discord',t.discord<100?t.discord:0);
    if(t.weak&&t.weak.t>0)add('weak','hand','#c8b07a','Weakened',t.weak.t);if(t.crack>0)add('crack','shatter','#ffb37a','Sundered',t.crack); // fork debuffs (v0.44)
    if(t.mark>0)add('mark','target','#ffb37a','Marked',0);
    fxRow($('tfx'),fx);
    const tr=[];if(t.def.rare)tr.push('<i style="color:#ffd75e">Rare</i>');if(t.def.undead)tr.push('<i>Undead</i>');if(t.def.armor>=0.5)tr.push('<i>Armored</i>');
    const lh='Lv '+t.lv+(tr.length?' '+tr.join(' '):'');if($('tlv').dataset.h!==lh){$('tlv').dataset.h=lh;$('tlv').innerHTML=lh}}
  else tf.style.visibility='hidden';
  // Boss and named casts at you: big bar in the middle of the screen, whoever you're targeting (never in the target frame).
  {const p=$('pickUI'),c=run.chest,on=c&&c.offer&&!c.taken&&c.open&&!player.dead&&dist(player,c)<40?'block':'none';if(p.style.display!==on)p.style.display=on}
  {const d=$('deathUI'),on=player.dead>0&&!simState.busy?'block':'none';if(d.style.display!==on)d.style.display=on} // the sim's arena deaths never show it
  const bc=$('bcast'),cm=mobs.find(m=>!m.dead&&m.casting&&(m.def.boss||m.def.named||m.def.rare));
  if(cm){bc.style.display='block';$('bcastname').textContent=cap(cm.def.name)+': '+cm.casting.name;$('bcastfill').style.width=Math.min(100,100*cm.casting.t/cm.casting.dur)+'%'}else bc.style.display='none';
  // Log, Menu, the minimap and DEV sit under the top frames and move down when the frames grow (debuff tags, buffs wrapping).
  {const hb=$('hud').getBoundingClientRect(),vt=$('view').getBoundingClientRect().top,base=$('hud').offsetTop+52,dy=Math.max(0,Math.round(hb.bottom-vt-base));
    // Sideways (v0.75) only the Log window sits under the centred frames; Log/Menu, the minimap and DEV live in the top-right corner.
    (LAND?[['logpanel',76]]:[['topbtns',62],['mm',100],['logpanel',100],['devbtn',194]]).forEach(([id,top])=>{const el=$(id);if(el&&el.dataset.dy!==String(dy)){el.dataset.dy=dy;el.style.top='calc('+(top+dy)+'px + env(safe-area-inset-top))'}})}

  const cb=$('castbar');
  if(player.cast){cb.style.display='block';$('castname').textContent=player.cast.a.name;$('castfill').style.width=(100*player.cast.time/player.cast.a.cast)+'%'}else cb.style.display='none';
  const cdPct=100*player.gcd/GCD;
  ctrlEls.forEach(el=>{
    const s=el.dataset.slot==='c'?0:+el.dataset.slot,a=ABI[loadout[s]];
    if(!a)return;
    el.classList.toggle('lock',L<a.lvl);el.classList.toggle('nomana',L>=a.lvl&&player.mp<a.mana);
    const own=player.cds[a.id]||0,full=cdFor(a)||1,pct=L<a.lvl?0:Math.max(cdPct,100*own/full);
    const cd=el.querySelector('.cd');if(cd)cd.style.height=pct+'%';
    const ct=el.querySelector('.cdt');if(ct)ct.textContent=own>0.05?Math.ceil(own):'';
    el.classList.toggle('queued',!!(player.queued&&player.queued.a===a));
  });
  // Queued spell: a gold "Next" chip under the cast bar (your thumb covers the button itself).
  const qc=$('qchip');if(qc){const q=player.queued&&player.queued.a;const h=q?(q.icon?iconHTML(q,14):'<i style="background:'+q.col+'"></i>')+'Next: '+q.name:'';if(qc.dataset.h!==h){qc.dataset.h=h;qc.innerHTML=h;qc.style.display=q?'flex':'none'}}
  // Buff bar: one icon per buff and song on you, with timers (v0.58, UI breakdown 18 B).
  const bb=$('buffbar');if(bb){const fx=[];
    for(const k in player.buffs){const v=player.buffs[k];if(!(v>0)||k==='hide')continue;const d=BUFFS[k]||{name:k,col:'#cfc8b2'};fx.push({k,icon:d.icon||'aura',col:d.col,name:d.name||d.short,t:v<100?v:0,max:v<100?fxFull(FXM_P,k,v):0})}
    if(C.holdLine){const n=Math.min(C.holdMax||4,fightingMe().length);if(n)fx.push({k:'hold',icon:'shield',col:'#8a9bb5',name:'Hold the Line -'+Math.round(C.holdLine*n*100)+'%',stack:'-'+Math.round(C.holdLine*n*100)+'%'})} // Warrior: how much Hold the Line is saving you
    (player.songs||[]).forEach(id=>{const a=ABI[id];if(a)fx.push({k:'song'+id,icon:a.icon||'note',col:a.col,name:a.name})});
    fxRow(bb,fx);
    // Keep the 1st hit / Auto toggles just under the portrait, which grows when buffs wrap to a new line.
    const tg=$('toggles');if(tg&&!LAND){const top=Math.round($('pframe').getBoundingClientRect().bottom-tg.parentNode.getBoundingClientRect().top+4);if(tg.dataset.top!==String(top)){tg.dataset.top=top;tg.style.top=top+'px'}}}
  // Songs that are playing light up their buttons.
  ctrlEls.forEach(el=>{const s=el.dataset.slot==='c'?0:+el.dataset.slot,a=ABI[loadout[s]];el.classList.toggle('playing',!!(a&&a.kind==='song'&&songOn(a.id)))});
  const sb=$('bsit');if(sb){sb.classList.toggle('sitting',player.sit);sb.textContent=player.sit?'Stand':'Sit'}
}

/* ---------- The way out of Dungeon 1 (v0.140, owner Nov 27): stairs that rise out of the floor ---------- */
// What makes it read as stairs going up (3/4 view, refs: pixel dungeon stairs): stacked bands that get narrower and paler
// toward the top, each with a bright lip on top and a dark riser under it, cut into the north wall, with daylight at the
// top. How it plays: cracks run across the floor (0-0.9 s), then the steps grind up one at a time from the bottom, each
// with a thump of dust, the wall above splits into an arch, and last the daylight pours down the steps.
const STEP_N=6;
function stairsP(S){return (time-S.t0)/STAIRS.form} // 0 to 1 while it forms
function drawOutStairs(S){const x0=S.tx*T,yb=(S.ty+1)*T+6,t=time-S.t0,f=(X,Y,w,h,c)=>{lx.fillStyle=c;lx.fillRect(X,Y,w,h)};
  // cracks first: a jagged split across the two tiles, then branches
  if(t<1.4){const a=Math.min(1,t/0.9);lx.globalAlpha=t<0.9?1:Math.max(0,1-(t-0.9)/0.5);
    for(let i=0;i<Math.round(28*a);i++)f(x0+2+i,yb-8+Math.round(Math.sin(i*1.7)*2),1,1,'#0b0a0f');
    if(a>0.5){f(x0+9,yb-12,1,4,'#0b0a0f');f(x0+20,yb-6,1,5,'#0b0a0f');f(x0+25,yb-13,1,5,'#0b0a0f')}lx.globalAlpha=1}
  // the arch in the wall above: a dark doorway that splits open as the steps reach it
  const ao=Math.max(0,Math.min(1,(t-0.8)/1.8)),aw=Math.round(26*ao);
  if(aw>1){const ax=x0+16-Math.round(aw/2),top=yb-38;f(ax-2,top-1,aw+4,22,'#4a4652');f(ax-1,top,aw+2,21,'#0b0a0f');f(ax,top+1,aw,20,'#1a1c26');
    if(aw>6){f(ax-1,top,2,2,'#4a4652');f(ax+aw-1,top,2,2,'#4a4652');f(ax+1,top+1,1,1,'#4a4652');f(ax+aw-2,top+1,1,1,'#4a4652')} // rounded top
    const day=Math.max(0,Math.min(1,(t-STAIRS.form+0.6)/0.8));if(day>0){lx.globalAlpha=day;f(ax+2,top+2,aw-4,5,'#e8e4cc');f(ax+1,top+7,aw-2,3,'#b8b4a0');lx.globalAlpha=1}}
  // the steps, bottom (nearest, widest, darkest) to top (narrow, pale): each rises 3 px into place with a dust puff
  for(let i=0;i<STEP_N;i++){const at=0.9+i*(STAIRS.form-1.4)/STEP_N,k=(t-at)/0.35;if(k<=0)continue;
    if(!S['p'+i]){S['p'+i]=1;for(let j=0;j<10;j++)parts.push({x:x0+4+rr(0,24),y:yb-i*5-2,vx:rr(-14,14),vy:rr(-16,-4),t:0,life:rr(0.4,0.8),col:j%2?'#7a7368':'#5c5866'});if(i===STEP_N-1)shake(2,0.3)}
    const up=Math.round(3*(1-Math.min(1,k))),w=30-i*2,sx=x0+16-w/2,sy=yb-6-i*5+up,sh=[44,52,60,70,82,96][i];
    lx.globalAlpha=Math.min(1,k*1.5);f(sx-1,sy-1,w+2,7,'#0b0a0f');f(sx,sy,w,5,'rgb('+sh+','+(sh-2)+','+(sh+8)+')');f(sx,sy,w,1,'rgb('+(sh+40)+','+(sh+38)+','+(sh+44)+')');f(sx,sy+4,w,1,'rgb('+(sh-20)+','+(sh-22)+','+(sh-12)+')');
    f(sx+3+((i*7)%(w-8)),sy+2,2,1,'rgb('+(sh-14)+','+(sh-16)+','+(sh-6)+')'); // a chip in each step
    lx.globalAlpha=1}}
// Daylight down the stairs once they're up: a cool pool of light on the steps and the floor below them.
function stairsLight(){const S=run.stairs;if(!S||!curArea()||!curArea().instance)return[];const d=Math.max(0,Math.min(1,(time-S.t0-STAIRS.form+0.6)/0.8));return d>0?[{x:S.x,y:S.y-4,r:Math.round(30+34*d),w:0,c:Math.round(70*d)}]:[]}
// Drawn over the dark: a soft slanted shaft from the arch down the steps, with motes drifting in it.
function drawStairsShaft(S){const d=Math.max(0,Math.min(1,(time-S.t0-STAIRS.form+0.6)/0.8));if(d<=0)return;const x0=S.tx*T+16,yb=(S.ty+1)*T+6;
  for(let r=0;r<30;r++){const w=10+Math.round(r*0.6);lx.globalAlpha=d*0.16*(1-r/34);lx.fillStyle='#f0ecd8';lx.fillRect(x0-Math.round(w/2),yb-34+r,w,1)}
  lx.fillStyle='#fff8e0';for(let i=0;i<6;i++){const q=(time*0.18+i/6)%1;lx.globalAlpha=d*0.7*Math.sin(q*3.14);lx.fillRect(Math.round(x0-6+((i*5)%12)+Math.sin(time+i)*2),Math.round(yb-30+q*28),1,1)}
  lx.globalAlpha=1}

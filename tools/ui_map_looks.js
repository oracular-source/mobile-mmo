// Draft only (UI breakdown 20): alternative minimap and full map looks drawn from the real game's map data.
// Injected into the page by tools/ui_map_looks.py; not loaded by the game.
(function(){
'use strict';
// Tile kinds, worked out the same way mmZone does it.
function kinds(id){
  const A=buildArea(AREA_OF[id]),w=A.w,h=A.h,under=!!MM_UNDER[id],K=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=A.map[y][x];let k;
    if(t===3)k='tree';else if(t===2)k='water';else if(t===7)k='rock';else if(t===5)k='wall';else if(t===10||t===8)k='door';
    else k=(!under&&(AREA_TILES[A.rows[y][x]]||{tags:[]}).tags.indexOf('path')>=0)?'path':'grass';K.push(k)}
  return{K:K,w:w,h:h};
}
// A seen mask that looks like real play: the roads walked, plus around you.
function seenLike(Z,K,px,py){
  const S=new Uint8Array(Z.w*Z.h),R=6;
  for(let y=0;y<Z.h;y++)for(let x=0;x<Z.w;x++){if(K[y*Z.w+x]!=='path')continue;
    for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++){const X=x+i,Y=y+j;if(X<0||Y<0||X>=Z.w||Y>=Z.h||i*i+j*j>R*R)continue;S[Y*Z.w+X]=1}}
  return S;
}
const hexA=(c,a)=>{const n=parseInt(c.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'};
// The cleaned-up ground: forest as soft masses, water with round edges, roads as clean lines, fog with a soft edge.
function smooth(Z,KK,S,s,pal){
  const w=Z.w,h=Z.h,K=KK.K,c=document.createElement('canvas');c.width=w*s;c.height=h*s;const g=c.getContext('2d');
  const at=(x,y)=>x<0||y<0||x>=w||y>=h?'':K[y*w+x];
  // Small seeded wobble so masses get lumpy edges.
  const j=(x,y,n)=>{let v=Math.sin(x*12.9898+y*78.233+n)*43758.5453;return v-Math.floor(v)};
  g.fillStyle=pal.grass;g.fillRect(0,0,c.width,c.height);
  const blobs=(kind,col,r)=>{g.fillStyle=col;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)===kind){
    g.beginPath();g.arc((x+.5)*s+(j(x,y,1)-.5)*s*.3,(y+.5)*s+(j(x,y,2)-.5)*s*.3,s*r*(0.85+j(x,y,3)*.3),0,7);g.fill()}};
  blobs('tree',pal.tree,0.78);
  if(s>=6){g.fillStyle=pal.treeHi;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)==='tree'&&j(x,y,4)>.45){
    g.beginPath();g.arc((x+.4)*s,(y+.38)*s,s*.28,0,7);g.fill()}}
  blobs('water',pal.water,0.72);
  g.fillStyle=pal.waterHi;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)==='water'&&at(x,y-1)==='water'&&at(x-1,y)==='water'&&at(x+1,y)==='water'&&at(x,y+1)==='water'){g.fillRect((x+.2)*s,(y+.45)*s,s*.6,Math.max(1,s*.12))}
  // Roads: a line between every pair of neighbouring road tiles, round ends.
  g.strokeStyle=pal.path;g.lineCap='round';g.lineWidth=Math.max(2,s*.62);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)==='path'){
    g.fillStyle=pal.path;g.beginPath();g.arc((x+.5)*s,(y+.5)*s,g.lineWidth/2,0,7);g.fill();
    [[1,0],[0,1],[1,1],[-1,1]].forEach(([dx,dy])=>{if(at(x+dx,y+dy)!=='path')return;
      if(dx&&dy&&(at(x+dx,y)==='path'||at(x,y+dy)==='path'))return; // no diagonal where a corner already joins
      g.beginPath();g.moveTo((x+.5)*s,(y+.5)*s);g.lineTo((x+dx+.5)*s,(y+dy+.5)*s);g.stroke()})}
  // Wide roads: fill the gap between four road centres so a 2-wide road has no hole in the middle.
  g.fillStyle=pal.path;for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++)if(at(x,y)==='path'&&at(x+1,y)==='path'&&at(x,y+1)==='path'&&at(x+1,y+1)==='path')g.fillRect((x+.5)*s,(y+.5)*s,s,s);
  g.fillStyle=pal.wall;for(let i=0;i<w*h;i++)if(K[i]==='wall'||K[i]==='door')g.fillRect((i%w)*s,((i/w)|0)*s,s,s);
  g.fillStyle=pal.rock;for(let i=0;i<w*h;i++)if(K[i]==='rock')g.fillRect((i%w)*s,((i/w)|0)*s,s,s);
  // Fog: keep only what you've seen, with a soft edge.
  const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const mg=m.getContext('2d');
  mg.filter='blur('+Math.max(1,s*.5)+'px)';mg.fillStyle='#fff';
  for(let i=0;i<w*h;i++)if(S[i]){mg.beginPath();mg.arc((i%w+.5)*s,((i/w|0)+.5)*s,s*.95,0,7);mg.fill()}
  g.globalCompositeOperation='destination-in';g.drawImage(m,0,0);g.globalCompositeOperation='destination-over';
  g.fillStyle=pal.fog;g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='source-over';
  return c;
}
const PAL0={grass:'#4c6a40',tree:'#22341f',treeHi:'#2d4628',water:'#35588f',waterHi:'#5a80b8',path:'#c8a676',wall:'#8c8a96',rock:'#0d0d10',fog:'#0b0b0e'};
// Each area keeps its own ground colours (the ones v0.48 worked out); trees a touch lighter so masses show texture.
function palOf(Z,KK){const P=Object.assign({},PAL0),pick=k=>{const i=KK.K.indexOf(k);return i<0?null:Z.col[i]};
  const toHex=c=>{const m=c.match(/\d+/g).map(Number);return'#'+m.map(v=>('0'+Math.min(255,v).toString(16)).slice(-2)).join('')};
  const mix=(c,f)=>{const m=c.match(/\d+/g).map(Number);return'rgb('+m.map(v=>Math.min(255,v*f|0)).join(',')+')'};
  const gr=pick('grass'),pa=pick('path');if(gr){P.grass=gr;P.tree=mix(gr,0.45);P.treeHi=mix(gr,0.6)}if(pa)P.path=pa;return P}
// Picture pins, 7 x 7: what the place is, not a code to learn.
const PICS={
  town: ['...#...','..###..','.#####.','#######','.##.##.','.##.##.','.##.##.'],
  door: ['.#####.','##ooo##','#ooooo#','#ooooo#','#ooooo#','#ooooo#','#ooooo#'],
  fire: ['...#...','..##...','..###..','.####..','.#####.','#######','.#####.'],
  skull:['.#####.','#######','#oo#oo#','#######','.##o##.','.#####.','.#.#.#.'],
  chest:['.#####.','#ooooo#','#######','###o###','#######','#######','.......'],
  exit: ['...#...','...##..','######.','#######','######.','...##..','...#...']};
function picOf(p){if(p.name==='Hidden chest')return'chest';if(/^Town/.test(p.name))return'town';return{exit:'exit',dun:'door',camp:'fire',boss:'skull'}[p.k]}
const PCOL={town:'#e8e2d0',door:'#c8a0ff',fire:'#ffb347',skull:'#ff6b6b',chest:'#ffd27a',exit:'#7dffa6'};
function pic(g,cx,cy,name,u,rot){
  const G=PICS[name],N=7,x0=Math.round(cx-N/2*u),y0=Math.round(cy-N/2*u),on=[],hole=[];
  const turn=(x,y)=>{let X=x,Y=y;for(let r=0;r<(rot||0);r++){const t=X;X=N-1-Y;Y=t}return[X,Y]};
  for(let y=0;y<N;y++)for(let x=0;x<G[y].length&&x<N;x++){const ch=G[y][x];if(ch==='#')on.push(turn(x,y));else if(ch==='o')hole.push(turn(x,y))}
  g.fillStyle='#000';on.concat(hole).forEach(([X,Y])=>g.fillRect(x0+(X-1)*u,y0+(Y-1)*u,3*u,3*u));
  g.fillStyle=PCOL[name];on.forEach(([X,Y])=>g.fillRect(x0+X*u,y0+Y*u,u,u));
  g.fillStyle='#141418';hole.forEach(([X,Y])=>g.fillRect(x0+X*u,y0+Y*u,u,u));
}
function exitRot(Z,p){const d=[Z.w-1-p.x,Z.h-1-p.y,p.x,p.y];return d.indexOf(Math.min(...d))}
// "You" markers.
function youArrowCone(g,x,y,q,u,a){
  g.save();g.translate(x,y);g.rotate(a);
  const gr=g.createRadialGradient(0,0,0,0,0,q*3.4);gr.addColorStop(0,'rgba(255,230,150,.45)');gr.addColorStop(1,'rgba(255,230,150,0)');
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.arc(0,0,q*3.4,-0.6,0.6);g.closePath();g.fill();
  g.beginPath();g.moveTo(q,0);g.lineTo(-q*.8,-q*.8);g.lineTo(-q*.3,0);g.lineTo(-q*.8,q*.8);g.closePath();
  g.lineJoin='round';g.lineWidth=3*u;g.strokeStyle='#000';g.stroke();g.lineWidth=1.2*u;g.strokeStyle='#fff';g.stroke();g.fillStyle='#ffd27a';g.fill();g.restore();
}
function youRing(g,x,y,q,u,a){
  g.save();g.translate(x,y);
  g.fillStyle='#000';g.beginPath();g.arc(0,0,q+1.5*u,0,7);g.fill();
  g.fillStyle='#fff';g.beginPath();g.arc(0,0,q+.5*u,0,7);g.fill();
  g.fillStyle='#ffd27a';g.beginPath();g.arc(0,0,q-.5*u,0,7);g.fill();
  g.rotate(a);g.fillStyle='#000';g.beginPath();g.moveTo(q*2.1+u,0);g.lineTo(q+.2*u,-q*.8-u);g.lineTo(q+.2*u,q*.8+u);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(q*2.1,0);g.lineTo(q+.5*u,-q*.7);g.lineTo(q+.5*u,q*.7);g.fill();g.restore();
}
function youOld(g,x,y,q,u,a){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(q,0);g.lineTo(-q*0.8,-q*0.75);g.lineTo(-q*0.35,0);g.lineTo(-q*0.8,q*0.75);g.closePath();
  g.fillStyle='#ffd27a';g.fill();g.lineWidth=u;g.strokeStyle='#000';g.stroke();g.restore()}

// Minimap takes. W = CSS size; dpr 2.
window.draftMini=function(take,id,px,py,face,W){
  const dpr=2,Z=mmZone(id),KK=kinds(id),S=seenLike(Z,KK.K,px,py),u=dpr;
  for(let j=-8;j<=8;j++)for(let i=-8;i<=8;i++){const X=px+i,Y=py+j;if(X>=0&&Y>=0&&X<Z.w&&Y<Z.h&&i*i+j*j<64)S[Y*Z.w+X]=1}
  const PAL=palOf(Z,KK);const c=document.createElement('canvas');c.width=W*dpr;c.height=W*dpr;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const round=take==='C',s=(take==='old'?2:3)*dpr;
  let ground;
  if(take==='old'){ground=document.createElement('canvas');ground.width=Z.w;ground.height=Z.h;const gg=ground.getContext('2d');
    for(let i=0;i<Z.w*Z.h;i++)if(S[i]){gg.fillStyle=Z.col[i];gg.fillRect(i%Z.w,(i/Z.w)|0,1,1)}}
  else ground=smooth(Z,KK,S,s,PAL);
  const strip=take==='old'||take==='A'?13*dpr:0,cx=c.width/2,cy=(c.height-strip)/2;
  g.save();if(round){g.beginPath();g.arc(cx,cy,c.width/2-3*dpr,0,7);g.clip()}
  g.fillStyle='#0b0b0e';g.fillRect(0,0,c.width,c.height);
  g.drawImage(ground,Math.round(cx-(px+.5)*s),Math.round(cy-(py+.5)*s),Z.w*s,Z.h*s);
  const pad=6*dpr,bot=c.height-strip,rad=c.width/2-3*dpr;
  Z.pins.forEach(p=>{const x=cx+(p.x-px)*s,y=cy+(p.y-py)*s,inside=round?Math.hypot(x-cx,y-cy)<rad-pad:(x>pad&&y>pad&&x<c.width-pad&&y<bot-pad);
    if(inside){if(take==='old'){const ic=mmIconOf(p);mmIcon(g,x,y,ic,ic==='chest'?'#ffd27a':MM_PIN_COL[p.k],u,ic==='arrow'?mmExitRot(Z,p):0)}
      else if(take==='C'){g.fillStyle='#000';g.beginPath();g.arc(x,y,3.2*u,0,7);g.fill();g.fillStyle=PCOL[picOf(p)];g.beginPath();g.arc(x,y,2.2*u,0,7);g.fill()}
      else pic(g,x,y,picOf(p),u,picOf(p)==='exit'?exitRot(Z,p):0);return}
    if(p.k!=='exit'&&p.k!=='dun')return;
    const a=Math.atan2(y-cy,x-cx);let ex,ey;
    if(round){ex=cx+Math.cos(a)*(rad-5*u);ey=cy+Math.sin(a)*(rad-5*u)}else{const r=Math.min((cx-pad)/Math.abs(Math.cos(a)||1e-6),(cy-pad)/Math.abs(Math.sin(a)||1e-6));ex=cx+Math.cos(a)*r;ey=cy+Math.sin(a)*r}
    const col=PCOL[picOf(p)],q=3.5*u;g.save();g.translate(ex,ey);g.rotate(a);g.fillStyle='#000';g.beginPath();g.moveTo(q+1.5*u,0);g.lineTo(-q-u,-q-1.5*u);g.lineTo(-q-u,q+1.5*u);g.fill();
    g.fillStyle=col;g.beginPath();g.moveTo(q,0);g.lineTo(-q,-q);g.lineTo(-q,q);g.fill();g.restore()});
  if(take==='old')youOld(g,cx,cy,4.5*dpr,u,face);else if(take==='A')youArrowCone(g,cx,cy,5.5*dpr,u,face);else youRing(g,cx,cy,3.2*dpr,u,face);
  g.restore();
  if(strip){g.fillStyle='rgba(43,43,43,.95)';g.fillRect(0,bot,c.width,strip);g.fillStyle='#8a8a8a';g.fillRect(0,bot,c.width,dpr);
    g.fillStyle='#ddd';g.font=(9*dpr)+'px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(Z.name,c.width/2,bot+strip/2+dpr*.5)}
  if(round){g.lineWidth=2*dpr;g.strokeStyle='#8a8a8a';g.beginPath();g.arc(cx,cy,rad+dpr,0,7);g.stroke();g.lineWidth=dpr;g.strokeStyle='#000';g.beginPath();g.arc(cx,cy,rad+2.5*dpr,0,7);g.stroke();
    // area name on a small tab under the circle
    g.font=(8*dpr)+'px monospace';const tw=g.measureText(Z.name).width+8*dpr;g.fillStyle='rgba(43,43,43,.95)';g.fillRect(cx-tw/2,c.height-11*dpr,tw,11*dpr);
    g.strokeStyle='#8a8a8a';g.strokeRect(cx-tw/2+.5,c.height-11*dpr+.5,tw-1,11*dpr-1);g.fillStyle='#ddd';g.textAlign='center';g.textBaseline='middle';g.fillText(Z.name,cx,c.height-5.5*dpr)}
  else{g.strokeStyle='#8a8a8a';g.lineWidth=dpr;g.strokeRect(dpr/2,dpr/2,c.width-dpr,c.height-dpr)}
  return c.toDataURL();
};

// Full map takes: restyle the real map window.
window.draftFull=function(take,id,px,py,face){
  const Z=mmZone(id),KK=kinds(id),S=seenLike(Z,KK.K,px,py);
  for(let j=-8;j<=8;j++)for(let i=-8;i<=8;i++){const X=px+i,Y=py+j;if(X>=0&&Y>=0&&X<Z.w&&Y<Z.h&&i*i+j*j<64)S[Y*Z.w+X]=1}
  Z.pins.forEach(p=>p.found=!!S[p.y*Z.w+p.x]);
  const found=Z.pins.filter(p=>p.found),pct=Math.round(100*S.reduce((a,b)=>a+b,0)/(Z.w*Z.h));
  const box=$('mapbox'),cv2=$('mapcv'),dpr=2,cssW=Math.min(box.clientWidth||300,360),fit=Math.max(2,Math.floor(cssW/Z.w)),s=fit,cw=Z.w*s,ch=Z.h*s;
  cv2.style.width=cw+'px';cv2.style.height=ch+'px';cv2.width=cw*dpr;cv2.height=ch*dpr;const g=cv2.getContext('2d'),SS=s*dpr,u=dpr;
  g.drawImage(smooth(Z,KK,S,SS,palOf(Z,KK)),0,0);
  const card=$('mapUI').querySelector('.card');
  // Header: name on the left, explored % small on the right of it; zoom moves onto the map's corner.
  $('mapname').innerHTML=Z.name+' <span style="font-size:12px;color:#9a9a9a;font-weight:400;letter-spacing:0">'+pct+'% explored</span>';
  const mz=card.querySelector('.mapz');
  mz.style.cssText='position:absolute;z-index:2;flex-direction:column;gap:4px;margin:0';
  box.style.position='relative';box.parentNode.style.position='relative';
  const r=cv2.getBoundingClientRect(),cr=card.getBoundingClientRect();
  mz.style.left=(r.right-cr.left-40)+'px';mz.style.top=(r.top-cr.top+6)+'px';
  mz.querySelectorAll('button').forEach(b=>{b.style.width='32px';b.style.height='30px';b.style.fontSize='16px'});mz.querySelector('span').style.display='none';
  const P=p=>[(p.x+.5)*SS,(p.y+.5)*SS];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const drawPins=(sel)=>found.forEach(p=>{let [x,y]=P(p);x=clamp(x,6*u,cv2.width-6*u);y=clamp(y,6*u,cv2.height-6*u);
    if(sel===p){g.strokeStyle='#ffd27a';g.lineWidth=2*u;g.beginPath();g.arc(x,y,8*u,0,7);g.stroke()}
    pic(g,x,y,picOf(p),1.6*u,picOf(p)==='exit'?exitRot(Z,p):0)});
  const leg=$('maplegend');
  if(take==='A'){ // names written on the map
    drawPins();g.font=(9*dpr)+'px monospace';g.textBaseline='middle';
    found.forEach(p=>{let [x,y]=P(p);const nm=p.name.replace(' (not built yet)','').replace(' (rat tunnel)','');const tw=g.measureText(nm).width+6*u;
      let tx=x+9*u;if(tx+tw>cv2.width-2*u)tx=x-9*u-tw;tx=clamp(tx,2*u,cv2.width-tw-2*u);let ty=clamp(y,8*u,cv2.height-8*u);
      if(p.y<3)ty=y+14*u;if(p.y>Z.h-3)ty=y-14*u;
      g.fillStyle='rgba(20,20,22,.85)';g.fillRect(tx,ty-6.5*u,tw,13*u);g.fillStyle='#e8e8e8';g.textAlign='left';g.fillText(nm,tx+3*u,ty+.5*u)});
    youArrowCone(g,(px+.5)*SS,(py+.5)*SS,7*dpr,u,face);
    leg.innerHTML='';
  }else if(take==='B'){ // tap a pin: one strip says what it is
    const sel=found.find(p=>p.k==='exit'&&/Wolfwood/.test(p.name))||found[0];drawPins(sel);youRing(g,(px+.5)*SS,(py+.5)*SS,4.5*dpr,u,face);
    const dir=(()=>{const dx=sel.x-px,dy=sel.y-py,a=Math.atan2(dy,dx)*180/Math.PI,N=['east','south-east','south','south-west','west','north-west','north','north-east'];return N[(Math.round(a/45)+8)%8]})();
    leg.innerHTML='<div style="display:flex;align-items:center;gap:8px;border:1px solid #8a8a8a;background:#282828;padding:6px 8px">'+
      '<span style="color:'+PCOL[picOf(sel)]+';font-size:16px">➜</span><div><div style="color:#fff">'+sel.name+'</div><div style="color:#9a9a9a;font-size:11px">Way out · '+Math.round(Math.hypot(sel.x-px,sel.y-py))+' tiles '+dir+'</div></div></div>'+
      '<div style="color:#9a9a9a;font-size:11px;margin-top:6px">Tap a pin to see what it is. '+found.length+' places found.</div>';
  }else{ // C: picture pins and a short list grouped by kind
    drawPins();youArrowCone(g,(px+.5)*SS,(py+.5)*SS,7*dpr,u,face);
    const grp={exit:'Ways out',dun:'Ways down',boss:'Named',camp:'Rest and finds'};
    leg.innerHTML=Object.keys(grp).map(k=>{const ps=found.filter(p=>p.k===k);if(!ps.length)return'';
      return'<div style="color:#c9a227;font-size:11px;margin-top:4px">'+grp[k]+'</div><div style="display:flex;flex-wrap:wrap;gap:4px 12px">'+
        ps.map(p=>'<span><span style="color:'+PCOL[picOf(p)]+'">'+{town:'⌂',door:'∩',fire:'▲',skull:'☠',chest:'▣',exit:'➜'}[picOf(p)]+'</span> '+p.name.replace(' (not built yet)','*')+'</span>').join('')+'</div>'}).join('')+
      '<div style="color:#777;font-size:10px;margin-top:4px">* not built yet</div>';
  }
};
})();

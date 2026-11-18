// The overworld map (built once from the seeded rnd), the ground picture, and Dungeon 1's rooms.
'use strict';
/* ---------- Map: 0 grass, 1 road, 2 water, 3 tree, 4 grave, 5 wall ---------- */
const roadY=x=>15+Math.round(Math.sin(x*0.35)*0.8);
let map=[];
for(let y=0;y<MH;y++){map[y]=[];for(let x=0;x<MW;x++){
  let t=0;
  if(Math.abs(y-roadY(x))<=1)t=1;
  const dx=(x-12)/4.5,dy=(y-6)/3;if(dx*dx+dy*dy<1)t=2;
  if(x<=1)t=(y>=14&&y<=16)?1:5;
  if(y===0||y===MH-1||x===MW-1)t=3;
  map[y][x]=t;
}}
for(let y=3;y<=10;y++)for(let x=26;x<=37;x++){if(map[y][x]===0&&(x+y)%3===0&&rnd()<0.55)map[y][x]=4}
for(let y=1;y<MH-1;y++)for(let x=3;x<MW-1;x++){
  if(map[y][x]!==0)continue;
  if(Math.abs(y-roadY(x))<=2)continue;
  if(x>=25&&x<=38&&y>=2&&y<=11)continue;
  if(rnd()<0.07)map[y][x]=3;
}
// Keep the gate camp (guards, peddler, campfire, signpost) clear of trees.
for(let y=10;y<=19;y++)for(let x=2;x<=9;x++)if(map[y][x]===3)map[y][x]=0;
for(let y=11;y<=13;y++)for(let x=15;x<=17;x++)if(map[y][x]===3)map[y][x]=0;
// Crypt mausoleum at the back of the graveyard: stone walls around a door (tile 10) into Dungeon 1.
[[31,1],[32,1],[33,1],[31,2],[33,2]].forEach(p=>map[p[1]][p[0]]=5);map[2][32]=10;
for(let x=30;x<=34;x++)map[3][x]=0;
const DOOR={x:32*T+8,y:2*T+12};
const overMap=map;
const tileAt=(px,py)=>{const tx=Math.floor(px/T),ty=Math.floor(py/T);if(tx<0||ty<0||tx>=MW||ty>=MH)return 3;return map[ty][tx]};
const blocked=(px,py)=>{const t=tileAt(px,py);return t===2||t===3||t===4||t===5||t===7||t===9};

/* ---------- Pre-render a zone's ground once ---------- */
function renderWorld(){
  const world=document.createElement('canvas');world.width=WW;world.height=WH;const wg=world.getContext('2d');
  const id=wg.createImageData(WW,WH),d=id.data;
  for(let y=0;y<WH;y++)for(let x=0;x<WW;x++){
    const t=map[Math.floor(y/T)][Math.floor(x/T)];let c;const n=(rnd()-0.5);
    if(t===1){c=[74+n*14,62+n*12,50+n*10];if(rnd()<0.02)c=[96,86,72];}
    else if(t===2){c=[22+n*6,36+n*6,46+n*6];if((x+y*3)%17===0)c=[44,64,76];}
    else if(t===5){const row=Math.floor(y/4),xo=(row%2)*4;const mortar=(y%4===0)||((x+xo)%8===0);c=mortar?[21,19,26]:[58+n*14,51+n*14,67+n*14];}
    else{c=[36+n*12,44+n*12,32+n*10];if(rnd()<0.015)c=[72,64,40];if(rnd()<0.01)c=[26,32,24];}
    if(t===4)c=[48+n*10,40+n*10,32+n*8];
    if(t===6||t===8||t===9){c=[34+n*12,31+n*12,40+n*12];if((x%16===0)||(y%16===0&&((Math.floor(x/16)+Math.floor(y/16))%2)))c=[22,20,27];}
    if(t===7){const row=Math.floor(y/4),xo=(row%2)*4;const mortar=(y%4===0)||((x+xo)%8===0);c=mortar?[14,12,18]:[40+n*10,36+n*10,48+n*10];
      const below=map[Math.floor(y/T)+1]&&map[Math.floor(y/T)+1][Math.floor(x/T)];if(below!==undefined&&below!==7&&y%T>=9)c=mortar?[24,21,30]:[64+n*10,58+n*10,74+n*10];}
    if(t===10)c=[8,7,11];
    const o=(y*WW+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;
  }
  wg.putImageData(id,0,0);
  const px=(x,y,c)=>{wg.fillStyle=c;wg.fillRect(x,y,1,1)};
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++){
    const t=map[ty][tx],bx=tx*T,by=ty*T;
    if(t===4){
      wg.fillStyle='#3a2e24';wg.fillRect(bx+3,by+12,10,3);
      wg.fillStyle='#0b0a0f';wg.fillRect(bx+4,by+3,8,10);
      wg.fillStyle='#6b6470';wg.fillRect(bx+5,by+4,6,8);
      wg.fillStyle='#8d8692';wg.fillRect(bx+5,by+4,6,1);
      if((tx+ty)%2){wg.fillStyle='#4a4550';wg.fillRect(bx+7,by+5,2,5);wg.fillRect(bx+6,by+6,4,1);}
    }
    if(t===8){wg.fillStyle='#4a6a5a';for(let a=0;a<20;a++){const an=a/20*Math.PI*2;wg.fillRect(Math.round(bx+8+Math.cos(an)*6),Math.round(by+8+Math.sin(an)*4),1,1)}wg.fillStyle='#7dffa6';wg.fillRect(bx+7,by+7,2,2);}
    if(t===9){wg.fillStyle='#0b0a0f';wg.fillRect(bx+4,by+8,8,6);wg.fillStyle='#55585f';wg.fillRect(bx+5,by+9,6,4);wg.fillStyle='#3b2a1d';wg.fillRect(bx+5,by+8,6,1);}
    if(t===10){wg.fillStyle='#0b0a0f';wg.fillRect(bx+1,by,14,16);wg.fillStyle='#4a4354';wg.fillRect(bx+1,by,2,16);wg.fillRect(bx+13,by,2,16);wg.fillRect(bx+1,by,14,2);wg.fillStyle='#2a1f3a';wg.fillRect(bx+4,by+4,8,12);}
    if(t===3){
      wg.fillStyle='#000';wg.globalAlpha=0.35;wg.fillRect(bx+2,by+13,12,3);wg.globalAlpha=1;
      wg.fillStyle='#3b2a1d';wg.fillRect(bx+7,by+9,3,6);
      for(let y=-8;y<=7;y++)for(let x=-8;x<=8;x++){
        const dd=x*x+y*y*1.1;if(dd>52)continue;
        const lit=(x+y)<-4,dark=(x+y)>5;
        px(bx+8+x,by+5+y,dd>44?'#0b0a0f':lit?'#3a4d33':dark?'#18221a':(rnd()<0.2?'#2a3a26':'#223020'));
      }
    }
  }
  return world;
}
let world=renderWorld();
const overWorld=world;

/* ---------- Dungeon 1 (placeholder name): five rooms carved from solid rock ---------- */
const DUN=(function(){
  const w=30,h=34,m=[];for(let y=0;y<h;y++){m[y]=[];for(let x=0;x<w;x++)m[y][x]=7}
  const rooms=[{x:2,y:26,w:8,h:6},{x:3,y:15,w:9,h:7},{x:16,y:17,w:10,h:7},{x:15,y:7,w:11,h:6},{x:3,y:2,w:11,h:8}];
  rooms.forEach(r=>{for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)m[y][x]=6});
  // Two-tile-wide halls between rooms.
  const carve=(x0,y0,x1,y1)=>{for(let y=Math.min(y0,y1);y<=Math.max(y0,y1)+1;y++)for(let x=Math.min(x0,x1);x<=Math.max(x0,x1)+1;x++)if(m[y]&&m[y][x]!==undefined)m[y][x]=6};
  carve(6,21,6,26);carve(11,18,16,18);carve(21,12,21,17);carve(13,9,15,9);
  const braziers=[[2,26],[9,26],[3,15],[11,15],[16,17],[25,17],[15,7],[25,7],[3,2],[13,2]].map(p=>{m[p[1]][p[0]]=9;return{x:p[0]*T+8,y:p[1]*T+10}});
  m[30][3]=8;
  const d={w:w,h:h,map:m,start:{x:6*T+8,y:29*T+8},braziers:braziers};
  const sm=map,sw=MW,sh=MH,swW=WW,swH=WH;map=m;MW=w;MH=h;WW=w*T;WH=h*T;d.world=renderWorld();map=sm;MW=sw;MH=sh;WW=swW;WH=swH;
  return d;
})();
/* ---------- Testing grounds (DEV only): one open walled room for test fights ---------- */
// Big enough for a Druid to kite in circles. No spawns of its own: the DEV panel and the sim place mobs.
const ARENA=(function(){
  const w=26,h=20,m=[];for(let y=0;y<h;y++){m[y]=[];for(let x=0;x<w;x++)m[y][x]=(x<1||y<1||x>=w-1||y>=h-1)?7:6}
  const braziers=[[1,1],[w-2,1],[1,h-2],[w-2,h-2],[13,1],[13,h-2]].map(p=>{m[p[1]][p[0]]=9;return{x:p[0]*T+8,y:p[1]*T+10}});
  m[h-3][2]=8; // exit circle back to the Gate Road
  const d={w:w,h:h,map:m,start:{x:7*T+8,y:10*T+8},braziers:braziers};
  const sm=map,sw=MW,sh=MH,swW=WW,swH=WH;map=m;MW=w;MH=h;WW=w*T;WH=h*T;d.world=renderWorld();map=sm;MW=sw;MH=sh;WW=swW;WH=swH;
  return d;
})();
// A fresh instance every time you enter: nothing respawns inside.
function dunSpawns(){
  const L=[],add=(type,tx,ty,lv,group)=>L.push({type:type,x:tx*T+8,y:ty*T+10,timer:0,mob:null,group:group||null,lv:[lv,lv],noRespawn:true});
  add('crat',5,17,4,'d1');add('crat',7,18,4,'d1');add('crat',9,17,4,'d1b');add('cskel',8,20,4);
  add('cskel',19,19,5,'d2');add('cskel',20,21,5,'d2');add('cskel',23,19,5,'d3');add('cskel',24,21,5,'d3');add('crat',22,22,5);
  add('cskel',20,10,6);
  add('cskel',11,8,6,'d6');add('cskel',12,6,6,'d6');add('boss1',6,4,7);
  return L;
}

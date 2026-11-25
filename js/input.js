// Touch and keyboard: three movement modes (tap to walk, joystick, hold to walk), pinch zoom, tapping enemies.
'use strict';
/* ---------- Input: movement ---------- */
// settings.move picks ONE way to walk (v0.35.1, kept separate so they can't trip each other):
//  'tap'  tap the ground to walk there; dragging does nothing
//  'joy'  drag anywhere for an invisible joystick; tapping the ground does nothing
//  'hold' press and hold, you walk toward your finger; a quick tap does nothing
// In every mode a tap on an enemy, NPC or summon spot still works.
const joy={id:null,sx:0,sy:0,cx:0,cy:0,dx:0,dy:0,t0:0,active:false};
const HOLD_MS=180; // hold-to-move: a press longer than this walks instead of tapping
const keys={};
// Extra fingers while the joystick is held: a quick tap with a second finger
// targets an enemy (it never walks, so it can't fight the joystick).
const taps={};
let pinch=null; // {a,b,d0}: two fingers on the map; spreading zooms in, squeezing zooms out
const fingers={}; // where each finger on the map is right now
function fingerDist(){const k=Object.keys(fingers);if(k.length<2)return 0;const a=fingers[k[0]],b=fingers[k[1]];return Math.hypot(a.x-b.x,a.y-b.y)}
cv.addEventListener('pointerdown',e=>{
  e.preventDefault();
  fingers[e.pointerId]={x:e.clientX,y:e.clientY};
  if(joy.id!==null){taps[e.pointerId]={x:e.clientX,y:e.clientY,t0:performance.now()};
    try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
  joy.id=e.pointerId;joy.sx=joy.cx=e.clientX;joy.sy=joy.cy=e.clientY;joy.dx=0;joy.dy=0;joy.active=false;joy.noTap=false;joy.t0=performance.now();
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
});
cv.addEventListener('pointermove',e=>{
  if(fingers[e.pointerId])fingers[e.pointerId]={x:e.clientX,y:e.clientY};
  // Pinch: starts when a second finger moves more than a tap would. The joystick lets go while pinching.
  const tp=taps[e.pointerId];
  if(tp&&!pinch&&Math.hypot(e.clientX-tp.x,e.clientY-tp.y)>=20&&Object.keys(fingers).length>=2){pinch={d0:fingerDist()};joy.active=false;joy.dx=joy.dy=0;}
  if(pinch){const d=fingerDist();if(d>pinch.d0*1.2){zoomStep(1);pinch.d0=d}else if(d<pinch.d0/1.2){zoomStep(-1);pinch.d0=d}return}
  if(e.pointerId!==joy.id)return;
  joy.cx=e.clientX;joy.cy=e.clientY;
  const dx=e.clientX-joy.sx,dy=e.clientY-joy.sy;
  if(!joy.active&&Math.hypot(dx,dy)>12){
    if(settings.move==='tap'){joy.noTap=true;return} // tap mode: a drag isn't a tap and doesn't steer
    joy.active=true;player.tx=null;player.sit=false;}
  if(settings.move==='tap')return;
  joy.dx=dx;joy.dy=dy;
});
function endJoy(e){
  delete fingers[e.pointerId];
  if(pinch){delete taps[e.pointerId];if(e.pointerId===joy.id){joy.id=null;joy.active=false}
    if(Object.keys(fingers).length<2){pinch=null; // pinch over; a joystick finger still down starts steering fresh from where it is
      const f=fingers[joy.id];if(f){joy.sx=joy.cx=f.x;joy.sy=joy.cy=f.y;joy.active=false;joy.dx=joy.dy=0;joy.noTap=true}}
    return} // a pinch never walks or targets
  const tp=taps[e.pointerId];
  if(tp){delete taps[e.pointerId];
    if(performance.now()-tp.t0<400&&Math.hypot(e.clientX-tp.x,e.clientY-tp.y)<20)tapWorld(tp.x,tp.y,true);return}
  if(e.pointerId!==joy.id)return;
  const quick=performance.now()-joy.t0<HOLD_MS,wasTap=!joy.active&&!joy.noTap&&(settings.move!=='hold'||quick);joy.id=null;joy.active=false;
  if(wasTap)tapWorld(joy.sx,joy.sy);
}
cv.addEventListener('pointerup',endJoy);cv.addEventListener('pointercancel',e=>{delete taps[e.pointerId];delete fingers[e.pointerId];if(!Object.keys(fingers).length)pinch=null;if(e.pointerId===joy.id){joy.id=null;joy.active=false}});
function tapWorld(clientX,clientY,targetOnly){
  if(player.dead)return;
  const r=cv.getBoundingClientRect(),wx=camX+(clientX-r.left)*dpr/S,wy=camY+(clientY-r.top)*dpr/S;
  if(zoneId==='over')for(const n of npcs){if(Math.hypot(wx-n.x,wy-(n.y-8))<13){if(n.kind==='peddler'&&nearMerchant()){say(n,'Let us see what you have found.',true);charTab='char';charSel=null;openModal('charUI')}else say(n,pick(LINES[n.kind]),true);return}}
  if(zoneId==='over'&&Math.hypot(wx-SIGN.x,wy-(SIGN.y-11))<11){say(SIGN,SIGN.text,true);return}
  let best=null,bd=1e9;
  mobs.forEach(m=>{if(m.dead)return;const img=IMG[m.def.img];const d=Math.hypot(wx-m.x,wy-(m.y-img.h/2));if(d<Math.max(12,img.h*0.8)&&d<bd){bd=d;best=m}});
  if(best){switchTarget(best);if(settings.tapCast&&!(best.mez>0))castSlot(0);return} // tapping a sleeping mob only targets it
  if(!targetOnly&&tapSummon(wx,wy))return; // the throne or bone pile, when you're standing at it
  if(targetOnly)return; // second finger missed: don't walk, the joystick is steering
  if(settings.move!=='tap')return; // only tap-to-walk walks on a ground tap
  // Find the way round trees and walls (js/path.js). tapGoal marks this walk as yours, so it paths; anything else that
  // sets tx (the sim's bots) keeps walking straight, and the sims stay the same.
  const g=walkGoal(player,wx,wy);player.tx=g.x;player.ty=g.y;player.tapGoal=g;player.stuckT=0;player.sit=false;
}
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;const n=parseInt(e.key,10);if(n>=1&&n<=NSLOTS)castSlot(n-1);if(e.key==='Tab'){e.preventDefault();if(e.shiftKey)backTarget();else nextTarget()}});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});

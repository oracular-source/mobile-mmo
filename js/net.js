// Multiplayer step 1 (owner, Nov 27): two phones see each other. Host / Join with a 4-letter code, phone to phone.
'use strict';
/* ---------- How it connects ----------
   Phone to phone over WebRTC, using PeerJS (MIT licence, loaded from unpkg only when you tap Host or Join, so solo play
   and the checks never touch the network). PeerJS's free public server only introduces the two phones; after that the
   game data goes straight between them. The host's code becomes its PeerJS id, so the guest can find it.
   ?net=local swaps PeerJS for a BroadcastChannel between two tabs of one browser: the headless test uses it.
   Step 1 shares only looks: where you are, your class and weapon, sitting, casting, health, chat. Each phone still
   fights its own copy of the mobs (shared mobs are step 2). */
const NET={
  lib:'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  idPrefix:'ashfen-hollow-v1-', // on the public server, so make it ours
  rate:0.1,        // seconds between position updates (10 a second)
  quiet:8,         // seconds without a word before the partner shows as "not responding"
  letters:'ABCDEFGHJKMNPQRSTUVWXYZ', // no I, L or O: easy to read out loud
  timeout:20,      // seconds to wait for the phones to link up before giving up with a clear message
  // STUN servers tell each phone its public address so the two can find a route to each other (free, public).
  ice:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]
};
const net={role:null,state:'off',code:'',err:'',step:'',stepT:0,conn:null,peer:null,chan:null,sendT:0,heardT:0,lastZone:null,quiet:false};
// The partner as the game draws it (null until they connect). x, y ease toward tx, ty so movement looks smooth at 10 updates a second.
let remote=null;
// This build's version, read from net.js's own cache tag, so two phones on different versions get told to reload.
const GAME_V=((document.currentScript&&document.currentScript.src||'').match(/v=([\d.]+)/)||[])[1]||'?';
// An area's name from its zone id, even for an area you haven't been to yet (it may not be built here).
function zoneName(z){const k=AREA_OF[z];return k&&MAPS[k]?MAPS[k].name:null}
const netLocal=/[?&]net=local/.test(location.search);
function netName(){return (settings.netName||C.name).slice(0,14)}
function netCode(){let s='';for(let i=0;i<4;i++)s+=NET.letters[Math.floor(Math.random()*NET.letters.length)];return s} // not rng(): never touch the game's dice
function netStatus(){renderGroup()}
// Which part of connecting we're on, shown on screen and in the Log, so a stuck join says where it stuck (v0.138).
function netStep(t){net.step=t;net.stepT=performance.now()/1000;log('Group: '+t,'#7fa8c0');netStatus()}
// Gives up after NET.timeout seconds with a message that names the stuck step.
function netWatch(){const t0=performance.now()/1000,role=net.role;
  setTimeout(()=>{if(net.state==='on'||net.state==='off'||net.role!==role||performance.now()/1000-t0<NET.timeout-0.5)return;
    if(net.role==='host'&&net.state==='waiting'&&!net.knock)return; // a host just waiting for someone is fine
    netFail('Could not link the phones (stuck at: '+net.step+'). Try with one phone on mobile data instead of Wi-Fi, then send Claude this message.')},NET.timeout*1000)}
// Load PeerJS once, when it's first needed.
function netLib(){return new Promise((ok,bad)=>{if(window.Peer)return ok();
  const s=document.createElement('script');s.src=NET.lib;s.onload=()=>window.Peer?ok():bad(new Error('PeerJS missing'));s.onerror=()=>bad(new Error('Could not load the connection library. Check your internet.'));document.head.appendChild(s)})}
function netFail(msg){net.err=msg;netClose(true);log('Group: '+msg,'#ff8a80')}

/* ---------- Host and join ---------- */
function netHost(){if(net.state!=='off')return;net.role='host';net.code=netCode();net.err='';net.state='opening';netStatus();
  if(netLocal){netLocalOpen();return}
  netLib().then(()=>{
    netStep('reaching the matchmaker…');
    const p=new Peer(NET.idPrefix+net.code.toLowerCase(),{config:{iceServers:NET.ice}});net.peer=p;
    p.on('open',()=>{net.state='waiting';net.step='waiting for your partner';netStatus();log('Group: hosting. Your code is '+net.code+'.','#9fd8ff')});
    p.on('connection',c=>{if(net.conn){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),300)});return} // two players for now
      net.knock=true;netStep('your partner found you; linking the phones…');netUse(c);netWatch()});
    p.on('error',e=>netFail(e.type==='unavailable-id'?'That code is taken. Tap Host again for a new one.':'Connection error ('+(e.type||e.message)+').'));
    p.on('disconnected',()=>{if(net.state==='waiting')p.reconnect()}) // lost the introducer while waiting: try again
  }).catch(e=>netFail(e.message))}
function netJoin(code){if(net.state!=='off')return;code=(code||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(code.length!==4){net.err='Type the 4-letter code from the host.';netStatus();return}
  net.role='guest';net.code=code;net.err='';net.state='opening';netStatus();
  if(netLocal){netLocalOpen();return}
  netWatch();netStep('loading the connection library…');
  netLib().then(()=>{
    netStep('reaching the matchmaker…');
    const p=new Peer({config:{iceServers:NET.ice}});net.peer=p;
    p.on('open',()=>{net.state='joining';netStep('found the matchmaker; asking for game '+code+'…');netUse(p.connect(NET.idPrefix+code.toLowerCase(),{reliable:true,serialization:'json'}))});
    p.on('error',e=>netFail(e.type==='peer-unavailable'?'No game with code '+code+'. Check the code, and that the host is still on Host.':'Connection error ('+(e.type||e.message)+').'))
  }).catch(e=>netFail(e.message))}
// A PeerJS connection, whichever side opened it.
function netUse(c){net.conn=c;
  c.on('open',()=>netOpened());
  // The direct phone-to-phone line's own progress (checking → connected, or failed / disconnected).
  c.on('iceStateChanged',st=>{if(net.state!=='on'&&net.state!=='off')netStep('phone to phone: '+({checking:'trying routes…',connected:'linked, opening…',completed:'linked, opening…',failed:'no route found',disconnected:'line dropped',closed:'closed'}[st]||st))});
  c.on('data',d=>netMsg(d));
  c.on('close',()=>netLost());
  c.on('error',()=>netLost())}
// Test transport: a BroadcastChannel named after the code. The guest says hello; the host answers.
function netLocalOpen(){const ch=new BroadcastChannel('ashfen-net-'+net.code);net.chan=ch;
  net.conn={send:d=>ch.postMessage(d),close:()=>ch.close()};
  ch.onmessage=e=>{const d=e.data;if(d.t==='knock'){if(net.role==='host'&&net.state==='waiting'){ch.postMessage({t:'come'});netOpened()}return}
    if(d.t==='come'){if(net.role==='guest'&&net.state==='joining')netOpened();return}netMsg(d)};
  if(net.role==='host'){net.state='waiting';log('Group: hosting. Your code is '+net.code+'.','#9fd8ff')}else{net.state='joining';ch.postMessage({t:'knock'})}
  netStatus()}
function netOpened(){net.state='on';net.step='';net.knock=false;net.heardT=performance.now()/1000;net.quiet=false;net.err='';
  netSend({t:'hi',name:netName(),cls:CLS,v:GAME_V});netSendState();netStatus()}
function netSend(d){if(net.conn&&(net.state==='on'||d.t==='hi'))try{net.conn.send(d)}catch(e){}}
// Leave on purpose (bye tells the partner right away) or after a failure.
function netClose(quietly){if(net.state==='on'&&!quietly)netSend({t:'bye'});
  try{if(net.conn)net.conn.close()}catch(e){}try{if(net.peer)net.peer.destroy()}catch(e){}
  net.conn=null;net.peer=null;net.chan=null;net.state='off';net.role=null;net.step='';net.knock=false;
  if(remote&&!quietly)log('Group: you left the game.','#9fd8ff');remote=null;netStatus()}
function netLost(){if(net.state==='off')return;const who=remote?remote.name:'Your partner';net.err='';netClose(true);log('Group: lost the connection to '+who+'. Host or join again to reconnect.','#ff8a80')}

/* ---------- Messages ---------- */
// What you look like right now. Short keys: this goes out 10 times a second.
function netSendState(){const p=player,moving=p.tx!==null||joy.active||(settings.move==='hold'&&joy.id!==null)||keys.w||keys.a||keys.s||keys.d;
  const w=inv.equip.weapon;
  netSend({t:'s',z:zoneId,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,d:p.dir,m:moving&&!p.sit?1:0,sit:p.sit?1:0,dead:p.dead>0?1:0,
    hp:Math.round(p.hp),mhp:Math.round(maxHP(p.lvl)),lv:p.lvl,cls:CLS,w:w&&ITEMS[w]?w:'',name:netName(),
    c:p.cast&&!p.cast.a.melee?{n:p.cast.a.name,col:p.cast.a.col,p:Math.min(1,p.cast.time/p.cast.a.cast)}:0})}
function netMsg(d){if(!d||!d.t)return;net.heardT=performance.now()/1000;if(net.quiet){net.quiet=false;netStatus()}
  if(d.t==='full'){netFail('That game already has two players.');return}
  if(d.t==='bye'){const who=remote?remote.name:'Your partner';netClose(true);log('Group: '+who+' left the game.','#9fd8ff');return}
  if(d.t==='hi'){const first=!remote;netRemote(d);if(first){log('Group: '+remote.name+' ('+(CLASSES[d.cls]?CLASSES[d.cls].name:d.cls)+') joined. Say hi from Menu → Group.','#9fd8ff');banner('Playing together',remote.name+' is here')}
    if(d.v!==GAME_V)log('Group: '+remote.name+' is on v'+d.v+', you are on v'+GAME_V+'. Both reload the page so you match.','#ffd27a');netStatus();return}
  if(d.t==='s'){netRemote(d);return}
  if(d.t==='c'&&remote){if(remote.z===zoneId){burst(remote.x,remote.y-10,d.col||'#cfc8b2',6,true);floatText(remote.x,remote.y-24,d.n,d.col||'#cfc8b2',false,'word')}return}
  if(d.t==='say'&&remote&&typeof d.text==='string'){const t=d.text.slice(0,120);if(remoteHere())say(remote,t,true);else log(remote.name+' says, "'+t+'"','#d8c8ff');return}}
// Fill in the partner from a hello or a state update.
function netRemote(d){const known=!!remote,cls=CLASSES[d.cls]?d.cls:'druid';
  if(!remote)remote={name:'',cls:cls,x:0,y:0,tx:0,ty:0,dir:1,walk:0,net:1};
  const r=remote;r.name=String(d.name||'Partner').slice(0,14);r.cls=cls;
  if(d.t!=='s')return;
  const zoneChanged=r.z!==d.z;
  if(known&&zoneChanged&&r.z){log('Group: '+r.name+(d.z===zoneId?' is here with you.':' went to '+(zoneName(d.z)||'another area')+'.'),'#9fd8ff');netStatus()}
  r.z=d.z;r.tx=d.x;r.ty=d.y;if(zoneChanged||Math.hypot(r.x-d.x,r.y-d.y)>48){r.x=d.x;r.y=d.y} // a jump (new area, a blink): snap instead of sliding
  r.dir=d.d<0?-1:1;r.moving=!!d.m;r.sit=!!d.sit;r.dead=!!d.dead;r.hp=d.hp;r.mhp=d.mhp||1;r.lv=d.lv;r.w=d.w&&ITEMS[d.w]?d.w:'';r.cast=d.c||null}
// Called when you cast anything (js/combat.js applyAbilityCore): your partner sees a spark and the spell's name.
function netCast(a){if(net.state!=='on'||simState.busy||!a)return;netSend({t:'c',n:a.name,col:a.col})}
function netSay(text){text=(text||'').trim().slice(0,120);if(!text||net.state!=='on')return;netSend({t:'say',text:text});
  // Your own bubble follows you (say() would name the speaker; this is you).
  for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].o===player)bubbles.splice(i,1);
  bubbles.push({o:player,text:text,t:0});log('You say, "'+text+'"','#d8c8ff')}

/* ---------- Every frame (js/main.js) ---------- */
function netTick(dt){
  if(net.state==='on'){net.sendT-=dt;if(net.sendT<=0){net.sendT=NET.rate;netSendState()}
    const q=performance.now()/1000-net.heardT>NET.quiet;if(q!==net.quiet){net.quiet=q;if(q&&remote)log('Group: '+remote.name+' is not responding (screen off, or the connection dropped?).','#ffd27a');netStatus()}}
  if(remote){const r=remote,k=Math.min(1,dt*12);r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;
    if(r.moving)r.walk+=dt*1.4;else r.walk=0}}
// Is the partner drawn in this area right now?
function remoteHere(){return remote&&net.state==='on'&&remote.z===zoneId&&!remote.dead}
// The partner's picture: their class's rags look with their weapon in hand (same pictures as yours, built once and kept).
function remoteImg(r){const it=r.w&&ITEMS[r.w],wid=it&&WEAPON_LOOKS[it.wt]&&it.look&&CLASS_WEAPON[r.cls]?r.w:'',k='rags_'+r.cls+'|'+wid;
  if(!IMG[k])IMG[k]=mkRags(r.cls,wid)||IMG.druid;return IMG[k]}

/* ---------- Menu → Group ---------- */
function renderGroup(){const box=$('groupbox');if(!box)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const err=net.err?'<p class="neterr">'+esc(net.err)+'</p>':'';
  let h='';
  if(net.state==='off'){
    h='<p class="hint">Play with someone on another phone. Step 1: you see each other walk, fight and cast, and can chat. Each of you still fights your own monsters for now.</p>'+
      '<label class="netl">Your name<input id="netname" maxlength="14" value="'+esc(settings.netName||'')+'" placeholder="'+esc(C.name)+'"></label>'+
      '<button class="go" id="nethost">Host a game</button>'+
      '<label class="netl">Or join with a code<input id="netcode" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="ABCD"></label>'+
      '<button class="go" id="netjoin">Join</button>'+err+
      '<p class="hint">Works best when both phones are on the same Wi-Fi.</p>';
  }else if(net.state==='opening'||net.state==='joining'){
    h='<p>'+(net.role==='host'?'Setting up your game…':'Looking for game <b>'+esc(net.code)+'</b>…')+'</p>'+(net.step?'<p class="hint">Step: '+esc(net.step)+'</p>':'')+err+'<button class="go" id="netleave">Cancel</button>';
  }else if(net.state==='waiting'){
    h='<p>Your code:</p><p class="netcode">'+esc(net.code)+'</p><p class="hint">Tell your partner. They open the game, go to Menu → Group, type the code and tap Join. Keep this screen on until they show up.</p>'+(net.knock?'<p class="hint">Step: '+esc(net.step)+'</p>':'')+err+'<button class="go" id="netleave">Cancel</button>';
  }else{const r=remote,A=r&&r.z?zoneName(r.z):null;
    h='<p>Playing with <b>'+esc(r?r.name:'…')+'</b>'+(r?' · '+esc(CLASSES[r.cls].name)+(r.lv?' · Lv '+r.lv:''):'')+'</p>'+
      '<p class="hint">'+(net.quiet?'Not responding…':r&&r.z===zoneId?'Here with you.':A?'In '+esc(A)+'.':'Somewhere else.')+(net.role==='host'?' You are hosting (code '+esc(net.code)+').':'')+'</p>'+
      '<div class="netsay"><input id="netmsg" maxlength="120" placeholder="Say something" autocomplete="off"><button id="netsend">Say</button></div>'+
      '<button class="go" id="netleave">Leave</button>';}
  box.innerHTML=h}
(function(){const box=$('groupbox');if(!box)return;
  const saveName=()=>{const i=$('netname');if(!i)return;settings.netName=i.value.trim().slice(0,14);store.set('ashfen-settings',settings)};
  box.addEventListener('click',e=>{const id=e.target.id;
    if(id==='nethost'){saveName();netHost()}
    else if(id==='netjoin'){saveName();netJoin(($('netcode')||{}).value)}
    else if(id==='netleave')netClose(false);
    else if(id==='netsend'){const i=$('netmsg');netSay(i.value);i.value=''}});
  box.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(e.target.id==='netmsg'){netSay(e.target.value);e.target.value=''}else if(e.target.id==='netcode'){saveName();netJoin(e.target.value)}});
  window.addEventListener('pagehide',()=>{if(net.state==='on')netSend({t:'bye'})}) // closing the tab tells the partner straight away
})();

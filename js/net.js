// Multiplayer (owner, Nov 27): up to 4 phones, phone to phone; built by player id so a real server can take over later (v0.157).
'use strict';
/* ---------- The shape of it (built to grow into an MMO) ----------
   Everyone is a PLAYER with an id: the host is 'h', guests are 'g1', 'g2'... (the host hands them out). Nothing in the game
   talks about "the partner": threat, targets, heals, buffs and kills all work per id, for any number of players.
   STAR: guests only link to the host. The host passes player-to-player messages on (moves, chat, heals, buffs), stamping
   who each came from, so a guest can't pretend to be someone else.
   AUTHORITY: the host's phone runs the monsters of its area for everyone (the "Authority" section below). It is the stand-in
   for a real server: when step 4 comes (Nakama), the server takes that job and speaks the same messages, so the rest of the
   game barely changes. Guests show copies ("mirrors") and send what their player did.
   INTEREST: the host sends each guest only what's near them often (monsters within SHARE.near or fighting: 10 a second;
   the rest once a second), so data per player stays flat as the world fills up.
   Phone hosting tops out at NET.max players: the host's phone runs every monster and sends to each guest itself.
   Transport: WebRTC through PeerJS (MIT; loaded from unpkg only when you tap Host or Join, so solo play and the checks never
   touch the network). PeerJS's free public server only introduces the phones; game data goes straight between them.
   ?net=local swaps PeerJS for a BroadcastChannel between tabs of one browser: the headless tests use it. */
const NET={
  lib:'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  idPrefix:'ashfen-hollow-v1-', // on the public server, so make it ours
  max:4,           // players in one game, host included (phone hosting; a real server lifts this)
  rate:0.1,        // seconds between position updates (10 a second)
  quiet:8,         // seconds without a word before a player shows as "not responding"
  letters:'ABCDEFGHJKMNPQRSTUVWXYZ', // no I, L or O: easy to read out loud
  timeout:20,      // seconds to wait for the phones to link up before giving up with a clear message
  // STUN servers tell each phone its public address so they can find a route to each other (free, public).
  ice:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]
};
const net={role:null,state:'off',code:'',err:'',step:'',stepT:0,myId:'',links:new Map(),seq:0,host:null,peer:null,chan:null,lid:'',
  sendT:0,heardT:0,quiet:false,knock:false,shared:false};
// Everyone else in the game, by id. x, y ease toward tx, ty so movement looks smooth at 10 updates a second.
const peers=new Map();
// This build's version, read from net.js's own cache tag, so phones on different versions get told to reload.
const GAME_V=((document.currentScript&&document.currentScript.src||'').match(/v=([\d.]+)/)||[])[1]||'?';
// An area's name from its zone id, even for an area you haven't been to yet (it may not be built here).
function zoneName(z){const k=AREA_OF[z];return k&&MAPS[k]?MAPS[k].name:null}
const netLocal=/[?&]net=local/.test(location.search);
function netName(){return (settings.netName||C.name).slice(0,14)}
const netRand=n=>{let s='';for(let i=0;i<n;i++)s+=NET.letters[Math.floor(Math.random()*NET.letters.length)];return s}; // not rng(): never touch the game's dice
function netCode(){return netRand(4)}
function netStatus(){renderGroup()}
const nowS=()=>performance.now()/1000;
// Which part of connecting we're on, shown on screen and in the Log, so a stuck join says where it stuck (v0.138).
function netStep(t){net.step=t;net.stepT=nowS();log('Group: '+t,'#7fa8c0');netStatus()}
function netWatch(){const t0=nowS(),role=net.role;
  setTimeout(()=>{if(net.state==='on'||net.state==='off'||net.role!==role||nowS()-t0<NET.timeout-0.5)return;
    if(net.role==='host'&&net.state==='waiting'&&!net.knock)return; // a host just waiting for someone is fine
    netFail('Could not link the phones (stuck at: '+net.step+'). Try with one phone on mobile data instead of Wi-Fi, then send Claude this message.')},NET.timeout*1000)}
function netLib(){return new Promise((ok,bad)=>{if(window.Peer)return ok();
  const s=document.createElement('script');s.src=NET.lib;s.onload=()=>window.Peer?ok():bad(new Error('PeerJS missing'));s.onerror=()=>bad(new Error('Could not load the connection library. Check your internet.'));document.head.appendChild(s)})}
function netFail(msg){net.err=msg;netClose(true);log('Group: '+msg,'#ff8a80')}

/* ---------- Transport: host and join ---------- */
// A link is one guest as the host sees it (or the host as a guest sees it): an id and a way to send.
function hostAddLink(send,close){if(net.links.size>=NET.max-1)return null;const id='g'+(++net.seq),L={id:id,send:send,close:close};net.links.set(id,L);return L}
function netHost(){if(net.state!=='off')return;net.role='host';net.myId='h';net.code=netCode();net.err='';net.state='opening';netStatus();
  if(netLocal){netLocalOpen();return}
  netLib().then(()=>{
    netStep('reaching the matchmaker…');
    const p=new Peer(NET.idPrefix+net.code.toLowerCase(),{config:{iceServers:NET.ice}});net.peer=p;
    p.on('open',()=>{net.state='waiting';net.step='waiting for players';netStatus();log('Group: hosting. Your code is '+net.code+'.','#9fd8ff')});
    p.on('connection',c=>{
      if(net.links.size>=NET.max-1){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),300)});return}
      net.knock=true;if(net.state!=='on')netStep('a player found you; linking the phones…');
      c.on('iceStateChanged',st=>{if(net.state!=='on'&&net.state!=='off')netStep('phone to phone: '+iceWord(st))});
      c.on('open',()=>{const L=hostAddLink(d=>c.send(d),()=>c.close());if(!L){c.send({t:'full'});return}
        c.on('data',d=>hostIn(L,d));c.on('close',()=>hostDrop(L.id,false));c.on('error',()=>hostDrop(L.id,false));hostWelcome(L)});
      netWatch()});
    p.on('error',e=>netFail(e.type==='unavailable-id'?'That code is taken. Tap Host again for a new one.':'Connection error ('+(e.type||e.message)+').'));
    p.on('disconnected',()=>{if(net.state==='waiting'||net.state==='on')try{p.reconnect()}catch(e){}}) // lost the introducer: keep the code open for late joiners
  }).catch(e=>netFail(e.message))}
function netJoin(code){if(net.state!=='off')return;code=(code||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(code.length!==4){net.err='Type the 4-letter code from the host.';netStatus();return}
  net.role='guest';net.code=code;net.err='';net.state='opening';netStatus();
  if(netLocal){netLocalOpen();return}
  netWatch();netStep('loading the connection library…');
  netLib().then(()=>{
    netStep('reaching the matchmaker…');
    const p=new Peer({config:{iceServers:NET.ice}});net.peer=p;
    p.on('open',()=>{net.state='joining';netStep('found the matchmaker; asking for game '+code+'…');
      const c=p.connect(NET.idPrefix+code.toLowerCase(),{reliable:true,serialization:'json'});
      net.host={id:'h',send:d=>c.send(d),close:()=>c.close()};
      c.on('iceStateChanged',st=>{if(net.state!=='on'&&net.state!=='off')netStep('phone to phone: '+iceWord(st))});
      c.on('data',d=>guestIn(d));c.on('close',()=>netLost());c.on('error',()=>netLost())});
    p.on('error',e=>netFail(e.type==='peer-unavailable'?'No game with code '+code+'. Check the code, and that the host is still on Host.':'Connection error ('+(e.type||e.message)+').'))
  }).catch(e=>netFail(e.message))}
const iceWord=st=>({checking:'trying routes…',connected:'linked, opening…',completed:'linked, opening…',failed:'no route found',disconnected:'line dropped',closed:'closed'}[st]||st);
// Test transport: one BroadcastChannel per code; every tab has a random id (lid) and messages carry who they're for.
function netLocalOpen(){const ch=new BroadcastChannel('ashfen-net-'+net.code);net.chan=ch;net.lid=netRand(8);const byLid=new Map();
  ch.onmessage=e=>{const x=e.data;if(!x)return;
    if(net.role==='host'){
      if(x.k==='knock'){const L=hostAddLink(d=>ch.postMessage({to:x.lid,d:d}),()=>{});if(!L){ch.postMessage({to:x.lid,d:{t:'full'}});return}byLid.set(x.lid,L);hostWelcome(L);return}
      if(x.to==='h'){const L=byLid.get(x.from);if(L)hostIn(L,x.d)}return}
    if(x.to===net.lid)guestIn(x.d)};
  if(net.role==='host'){net.state='waiting';log('Group: hosting. Your code is '+net.code+'.','#9fd8ff')}
  else{net.state='joining';net.host={id:'h',send:d=>ch.postMessage({to:'h',from:net.lid,d:d}),close:()=>ch.close()};ch.postMessage({k:'knock',lid:net.lid})}
  netStatus()}
// Host: a guest is in. Give them their id, then say hello so they know who you are.
function hostWelcome(L){L.heardT=nowS();try{L.send({t:'welcome',id:L.id,f:'h'})}catch(e){}
  if(net.state!=='on')netOpened();else{netHello(L.id);netSendState()}}
function netOpened(){net.state='on';net.step='';net.knock=false;net.heardT=nowS();net.quiet=false;net.err='';netHello();netSendState();netStatus()}
function netHello(to){const d={t:'hi',name:netName(),cls:CLS,v:GAME_V};if(to)netTo(to,d);else netSend(d)}
/* ---------- Routing ---------- */
// netSend: to everyone (a guest sends to the host, which passes it on when it's for everyone). netTo: to one player.
function netSend(d){if(net.state!=='on'&&d.t!=='hi'&&d.t!=='bye')return;d.f=net.myId;
  if(net.role==='host')net.links.forEach(L=>{try{L.send(d)}catch(e){}});else if(net.host)try{net.host.send(d)}catch(e){}}
function netTo(id,d){if(net.state!=='on'&&d.t!=='hi')return;d.f=net.myId;d.to=id;
  if(net.role==='host'){const L=net.links.get(id);if(L)try{L.send(d)}catch(e){}}else if(net.host)try{net.host.send(d)}catch(e){}}
// Host: to every guest standing in this area (the ones its monsters matter to).
function netZone(d,except){if(net.role!=='host')return;d.f='h';peers.forEach(p=>{if(p.id!==except&&p.z===zoneId){const L=net.links.get(p.id);if(L)try{L.send(d)}catch(e){}}})}
const RELAY={s:1,c:1,say:1,hi:1}; // player-to-player messages the host passes on to everyone else
// Host: a message from a guest. Stamp who sent it, pass it on if it's for someone else, then handle it.
function hostIn(L,d){if(!d||!d.t)return;d.f=L.id;L.heardT=nowS();const p=peers.get(L.id);if(p){p.heardT=L.heardT;if(p.quiet){p.quiet=false;netStatus()}}
  if(d.t==='bye'){hostDrop(L.id,true);return}
  if(d.to&&d.to!=='h'){const T=net.links.get(d.to);if(T)try{T.send(d)}catch(e){}return}
  if(RELAY[d.t])net.links.forEach(o=>{if(o!==L)try{o.send(d)}catch(e){}});
  netMsg(d)}
// Guest: a message from the host (its own, or passed on from another guest).
function guestIn(d){if(!d||!d.t)return;net.heardT=nowS();if(net.quiet){net.quiet=false;netStatus()}
  if(d.t==='welcome'){net.myId=d.id;netOpened();return}
  if(d.t==='full'){netFail('That game is full ('+NET.max+' players).');return}
  if(d.to&&d.to!==net.myId)return;
  const p=peers.get(d.f);if(p)p.heardT=net.heardT;
  if(d.t==='bye'&&d.f==='h'){netClose(true);log('Group: the host left the game.','#9fd8ff');return}
  if(d.t==='gone'){peerGone(d.id,d.why==='lost'?'lost the connection':'left the game');return}
  netMsg(d)}
// Host: a guest left (bye) or their line dropped. Everyone else hears about it.
function hostDrop(id,bye){const L=net.links.get(id);if(!L)return;net.links.delete(id);try{L.close()}catch(e){}
  netSend({t:'gone',id:id,why:bye?'bye':'lost'});peerGone(id,bye?'left the game':'lost the connection')}
// Leave on purpose (bye tells everyone right away) or after a failure.
function netClose(quietly){if(net.state==='on'&&!quietly)netSend({t:'bye'});
  net.links.forEach(L=>{try{L.close()}catch(e){}});try{if(net.host)net.host.close()}catch(e){}try{if(net.peer)net.peer.destroy()}catch(e){}try{if(net.chan)net.chan.close()}catch(e){}
  const had=peers.size>0;net.links.clear();net.host=null;net.peer=null;net.chan=null;net.state='off';net.role=null;net.myId='';net.step='';net.knock=false;
  if(had&&!quietly)log('Group: you left the game.','#9fd8ff');peers.clear();player.allyId=null;netStatus()}
function netLost(){if(net.state==='off')return;net.err='';netClose(true);log('Group: lost the connection to the host. Host or join again to reconnect.','#ff8a80')}

/* ---------- Players ---------- */
const peersHere=()=>{const o=[];if(net.state!=='on')return o;peers.forEach(p=>{if(p.z===zoneId&&!p.dead)o.push(p)});return o};
const peerHere=p=>!!(p&&p.net&&net.state==='on'&&peers.get(p.id)===p&&p.z===zoneId&&!p.dead);
function peerGone(id,why){const p=peers.get(id);if(!p)return;if(net.role==='host')netAllyDown(id);peers.delete(id);if(player.allyId===id)player.allyId=null;
  log('Group: '+p.name+' '+why+'.','#9fd8ff');netStatus()}
// Fill in a player from a hello or a state update.
function peerUpsert(d){const id=d.f;if(!id||id===net.myId)return null;const cls=CLASSES[d.cls]?d.cls:'druid';let p=peers.get(id);const known=!!p;
  if(!p){p={id:id,net:1,name:'',cls:cls,x:0,y:0,tx:0,ty:0,dir:1,walk:0,heardT:nowS()};peers.set(id,p)}
  p.name=String(d.name||'Player').slice(0,14);p.cls=cls;
  if(d.t!=='s')return p;
  const zoneChanged=p.z!==d.z,wasHere=p.z===zoneId;
  if(known&&zoneChanged&&p.z){log('Group: '+p.name+(d.z===zoneId?' is here with you.':' went to '+(zoneName(d.z)||'another area')+'.'),'#9fd8ff');netStatus()}
  if(net.role==='host'&&wasHere&&zoneChanged)netAllyDown(id); // left your area: your monsters forget them
  p.z=d.z;p.tx=d.x;p.ty=d.y;if(zoneChanged||Math.hypot(p.x-d.x,p.y-d.y)>48){p.x=d.x;p.y=d.y} // a jump (new area, a blink): snap instead of sliding
  if(d.dead&&!p.dead&&net.role==='host')netAllyDown(id); // down: monsters on them go home (unless someone else is fighting them)
  p.hid=!!d.hid;p.dir=d.d<0?-1:1;p.moving=!!d.m;p.sit=!!d.sit;p.dead=!!d.dead;p.hp=d.hp;p.mhp=d.mhp||1;p.lv=d.lv;p.w=d.w&&ITEMS[d.w]?d.w:'';p.cast=d.c||null;
  p.ch=d.ch&&ITEMS[d.ch]?d.ch:'';p.hd=d.hd&&ITEMS[d.hd]?d.hd:''; // their chest and head looks
  const pl=Array.isArray(d.pt)?d.pt.slice(0,2):[];p.pets=pl.map((q,i)=>{const o=(p.pets&&p.pets[i]&&p.pets[i].img===q[0])?p.pets[i]:{rpet:1,img:IMG[q[0]]?q[0]:'pet',x:q[1],y:q[2],walk:0};
    o.tx=q[1];o.ty=q[2];o.dir=q[3]<0?-1:1;o.hp=q[4];o.maxhp=q[5]||1;if(zoneChanged||Math.hypot(o.x-q[1],o.y-q[2])>48){o.x=q[1];o.y=q[2]}return o});
  return p}
// A player's picture: their class's rags look with their weapon and gear looks (same pictures as yours, built once and kept).
function peerImg(r){const it=r.w&&ITEMS[r.w],wid=it&&WEAPON_LOOKS[it.wt]&&it.look&&CLASS_WEAPON[r.cls]?r.w:'',
    eq={chest:r.ch,head:r.hd},lk={chest:slotLook(eq,'chest'),head:slotLook(eq,'head')},k='rags_'+r.cls+'|'+wid+'|'+lk.chest+lk.head;
  if(!IMG[k])IMG[k]=mkRags(r.cls,wid,lk)||IMG.druid;return IMG[k]}

/* ---------- Messages ---------- */
// What you look like right now. Short keys: this goes out 10 times a second.
function netSendState(){const p=player,moving=p.tx!==null||joy.active||(settings.move==='hold'&&joy.id!==null)||keys.w||keys.a||keys.s||keys.d;
  const w=inv.equip.weapon;
  netSend({t:'s',z:zoneId,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,d:p.dir,m:moving&&!p.sit?1:0,sit:p.sit?1:0,dead:p.dead>0?1:0,hid:hidden()||p.fd>0?1:0,
    hp:Math.round(p.hp),mhp:Math.round(maxHP(p.lvl)),lv:p.lvl,cls:CLS,w:w&&ITEMS[w]?w:'',name:netName(),ch:inv.equip.chest||'',hd:inv.equip.head||'',
    pt:[pet,pet2].filter(q=>q&&q.hp>0).map(q=>[q.img||'pet',Math.round(q.x),Math.round(q.y),q.dir<0?-1:1,Math.round(q.hp),Math.round(q.maxhp)]),
    c:p.cast&&!p.cast.a.melee?{n:p.cast.a.name,col:p.cast.a.col,p:Math.min(1,p.cast.time/p.cast.a.cast)}:0})}
function netMsg(d){
  if(d.t==='hi'){const first=!peers.get(d.f),p=peerUpsert(d);if(!p)return;
    if(first){log('Group: '+p.name+' ('+(CLASSES[d.cls]?CLASSES[d.cls].name:d.cls)+') joined. Say hi from Menu → Group.','#9fd8ff');banner('Playing together',p.name+' is here')}
    if(d.v!==GAME_V)log('Group: '+p.name+' is on v'+d.v+', you are on v'+GAME_V+'. Both reload the page so you match.','#ffd27a');netStatus();return}
  if(d.t==='s'){peerUpsert(d);return}
  if(authIn(d)||mirrorIn(d)||partyIn(d))return;
  const p=peers.get(d.f);if(!p)return;
  if(d.t==='c'){if(p.z===zoneId){burst(p.x,p.y-10,d.col||'#cfc8b2',6,true);floatText(p.x,p.y-24,d.n,d.col||'#cfc8b2',false,'word')}return}
  if(d.t==='say'&&typeof d.text==='string'){const t=d.text.slice(0,120);if(peerHere(p))say(p,t,true);else log(p.name+' says, "'+t+'"','#d8c8ff')}}
// Called when you cast anything (js/combat.js applyAbilityCore): the others see a spark and the spell's name.
function netCast(a){if(net.state!=='on'||simState.busy||!a)return;netSend({t:'c',n:a.name,col:a.col})}
function netSay(text){text=(text||'').trim().slice(0,120);if(!text||net.state!=='on')return;netSend({t:'say',text:text});
  for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].o===player)bubbles.splice(i,1);
  bubbles.push({o:player,text:text,t:0});log('You say, "'+text+'"','#d8c8ff')}

/* ---------- Every frame (js/main.js) ---------- */
function netTick(dt){
  {const sh=netShared();if(sh!==!!net.shared)netShareChange(sh)}
  if(net.role==='host'&&net.shared)hostParty();
  if(player.allyId&&!peerHere(peers.get(player.allyId)))player.allyId=null;
  if(net.state==='on'&&net.shared&&running&&!document.hidden){if(net.role==='host')authSendMobs(dt);else mirrorSync(dt)}
  if(net.state==='on'){net.sendT-=dt;if(net.sendT<=0){net.sendT=NET.rate;netSendState()}
    const t=nowS();peers.forEach(p=>{const q=t-(p.heardT||t)>NET.quiet;if(q!==!!p.quiet){p.quiet=q;if(q)log('Group: '+p.name+' is not responding (screen off, or the connection dropped?).','#ffd27a');netStatus()}})}
  const k=Math.min(1,dt*12);
  peers.forEach(r=>{r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;if(r.moving)r.walk+=dt*1.4;else r.walk=0;
    (r.pets||[]).forEach(o=>{const dx=o.tx-o.x,dy=o.ty-o.y;if(Math.abs(dx)+Math.abs(dy)>0.3)o.walk+=dt*1.4;o.x+=dx*k;o.y+=dy*k})})}

/* ---------- Menu → Group ---------- */
function renderGroup(){const box=$('groupbox');if(!box)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const err=net.err?'<p class="neterr">'+esc(net.err)+'</p>':'';
  let h='';
  if(net.state==='off'){
    h='<p class="hint">Play with up to '+(NET.max-1)+' others on their phones. In the same area you fight the same monsters (tuned for the group) and everyone gets the XP. Tap a player, or their row under your health, and your heals go to them.</p>'+
      '<label class="netl">Your name<input id="netname" maxlength="14" value="'+esc(settings.netName||'')+'" placeholder="'+esc(C.name)+'"></label>'+
      '<button class="go" id="nethost">Host a game</button>'+
      '<label class="netl">Or join with a code<input id="netcode" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="ABCD"></label>'+
      '<button class="go" id="netjoin">Join</button>'+err+
      '<p class="hint">If phones on the same Wi-Fi can\'t link, put the guests on mobile data.</p>';
  }else if(net.state==='opening'||net.state==='joining'){
    h='<p>'+(net.role==='host'?'Setting up your game…':'Looking for game <b>'+esc(net.code)+'</b>…')+'</p>'+(net.step?'<p class="hint">Step: '+esc(net.step)+'</p>':'')+err+'<button class="go" id="netleave">Cancel</button>';
  }else if(net.state==='waiting'){
    h='<p>Your code:</p><p class="netcode">'+esc(net.code)+'</p><p class="hint">Tell the others. They open the game, go to Menu → Group, type the code and tap Join. Keep this screen on until someone shows up.</p>'+(net.knock?'<p class="hint">Step: '+esc(net.step)+'</p>':'')+err+'<button class="go" id="netleave">Cancel</button>';
  }else{const rows=[];peers.forEach(p=>{const A=p.z?zoneName(p.z):null;
      rows.push('<p><b>'+esc(p.name)+'</b> · '+esc(CLASSES[p.cls].name)+(p.lv?' · Lv '+p.lv:'')+(p.id==='h'?' · host':'')+'<br><span class="hint">'+(p.quiet?'Not responding…':p.z===zoneId?'Here with you.':A?'In '+esc(A)+'.':'Somewhere else.')+'</span></p>')});
    const n=peers.size+1;
    h='<p>Playing together ('+n+' of '+NET.max+')</p>'+rows.join('')+
      (net.role==='host'?'<p class="hint">You are hosting. Code <b>'+esc(net.code)+'</b>'+(n<NET.max?': more can join with it.':' (full).')+'</p>':'')+
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
  window.addEventListener('pagehide',()=>{if(net.state==='on')netSend({t:'bye'})}) // closing the tab tells everyone straight away
})();

/* ==========================================================================================================
   AUTHORITY: the host's phone runs its area's monsters for everyone. This is the part a real server replaces.
   Monsters are shared in normal areas the host is in (not instances or the testing grounds yet). Guests in another area
   each fight their own copies until a server runs every area.
   ========================================================================================================== */
const SHARE={near:260,fast:0.1,slow:1,roster:1,threat:0.2,healRange:110,keep:0.8,
  fx:['root','snare','stun','mez','fear','aslow','lost','discord','chill','crack','mark']}; // effects a guest can put on a monster
const mirrors=new Map(); // guest: the host's monsters by id
let authMobT=0,authRosterT=0,mirrorThreatT=0;
const shareArea=()=>{if(simState.busy||zoneId==='arena'||zoneId==='dun')return false;const A=curArea();return !(A&&A.instance)};
// Host: shared while any guest stands in your area. Guest: shared while the host stands in yours.
function netShared(){if(net.state!=='on'||!shareArea())return false;
  if(net.role==='host'){for(const p of peers.values())if(p.z===zoneId)return true;return false}
  const h=peers.get('h');return !!(h&&h.z===zoneId)}
const netGuestMirror=()=>net.role==='guest'&&net.shared;
// Threat per player: m.threat.p (you, the host), m.threat.pet, and m.threat.a[id] for each other player (plus m.ab[id], taunt bonus).
function topAlly(m){const a=m.threat.a;if(!a)return null;let best=null;for(const id in a){const v=a[id];if(!(v>0))continue;const p=peers.get(id);if(!p||p.dead||p.z!==zoneId)continue;if(!best||v>best.v)best={id:id,v:v}}return best}
function allyOn(m){return net.role==='host'&&net.shared&&!!topAlly(m)} // someone else is in this monster's fight
function mobOnAlly(m){if(m.mirror)return m.tg!==net.myId;const t=net.role==='host'&&net.shared&&topAlly(m);return !!t&&t.v>m.threat.p&&t.v>m.threat.pet}
// Who a monster goes for (combat.js victim calls this once anyone else is involved).
function netVictim(m){
  if(m.mirror){if(m.tg===net.myId)return pet&&m.threat.pet>m.threat.p?pet:player;const p=peers.get(m.tg);return peerHere(p)?p:player}
  if(decoy&&dist(m,decoy)<110)return victimSolo(m);
  const t=topAlly(m);return t&&t.v>m.threat.p&&t.v>m.threat.pet?peers.get(t.id):victimSolo(m)}
function allyEngage(m,id){m.threat.a=m.threat.a||{};m.threat.a[id]=Math.max(1,m.threat.a[id]||0);m.allyHad=1}
function netMob(id){for(let i=0;i<mobs.length;i++)if(mobs[i].nid===id)return mobs[i];return null}
// Rescale a monster for the group size, keeping its health percentage. One already in a fight keeps its numbers until it
// walks home (update.js calls this again then).
function mobScale(m){if((m.gn||1)===partyN||m.dead)return;if(m.state==='chase')return;
  const base=m.def.base||m.def,def=groupDef(base,partyN),pct=m.maxhp>0?m.hp/m.maxhp:1;
  m.def=def;m.maxhp=def.hp+def.hpl*m.lv;m.hp=Math.min(m.maxhp,Math.round(pct*m.maxhp));m.gn=partyN}
// Host: the group size in your area follows who's here (you plus each guest in it), up to NET.max.
function hostParty(){let n=1;peers.forEach(p=>{if(p.z===zoneId)n++});n=Math.min(NET.max,n);if(n===partyN)return;
  partyN=n;mobs.forEach(mobScale);log('Group: monsters here are tuned for '+n+' players.','#9fd8ff')}
function netShareChange(on){net.shared=on;
  if(net.role==='host'){if(on){authMobT=0;authRosterT=0;hostParty()}
    else{partyN=1;mobs.forEach(mobScale);mobs.forEach(m=>{if(m.dead||!m.threat)return;m.threat.a=null;m.ab=null;if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0)m.state='return'});
      log('Group: monsters here are back to solo strength.','#9fd8ff')}return}
  // Guest: swap your own monsters for the host's (or back).
  const h=peers.get('h'),who=h?h.name:'the host';
  mobs.length=0;mirrors.clear();player.target=null;if(pet)pet.target=null;if(pet2)pet2.target=null;grounds.length=0;traps.length=0;
  if(on){spawns.forEach(sp=>{sp.mob=null});log('Group: you fight '+who+"'s monsters here now.",'#9fd8ff')}
  else{partyN=1;spawns.forEach(sp=>{sp.mob=null;if(sp.gone){sp.timer=Infinity;return}sp.timer=0;spawn(sp)});const A=curArea();if(A&&A.rare){A.rare.sp.mob=null;if(A.rare.sp.up)spawn(A.rare.sp)}
    arriveSafe();if(net.state==='on')log('Group: '+who+' is not in this area. You have your own monsters again.','#9fd8ff')}}
/* Host → guests */
const ST_CODE={idle:0,chase:1,return:2,drift:3},ST_NAME=['idle','chase','return','drift'];
const nr1=v=>Math.round((v||0)*10)/10;
const targetId=v=>!v?0:v.net?v.id:'h'; // a monster's target as an id: a player, or 'h' for the host and the host's pets
// Each guest in your area gets its own snapshot: monsters near them or fighting, 10 a second; the rest once a second.
function authSendMobs(dt){authMobT-=dt;authRosterT-=dt;if(authMobT>0)return;authMobT=SHARE.fast;const roster=authRosterT<=0;if(roster)authRosterT=SHARE.roster;
  const live=mobs.filter(m=>!m.dead&&m.nid!=null);
  peers.forEach(p=>{if(p.z!==zoneId||!net.links.get(p.id))return;const l=[];
    live.forEach(m=>{const ns=m._ns||(m._ns={}),near=m.state==='chase'||dist(m,p)<SHARE.near;if(time-(ns[p.id]||-9)<(near?SHARE.fast:SHARE.slow)-0.01)return;ns[p.id]=time;
      l.push([m.nid,m.type,m.lv,m.gn||1,nr1(m.x),nr1(m.y),Math.ceil(m.hp),Math.round(m.maxhp),ST_CODE[m.state]||0,m.dir<0?-1:1,m.state==='chase'?targetId(victim(m)):0,m.near>0?1:0,
        nr1(m.root),nr1(m.snare),nr1(m.stun),nr1(m.mez),nr1(m.fear),nr1(m.aslow),m.chill||0,nr1(m.mark),
        m.casting&&m.casting.dur?[String(m.casting.name||'').slice(0,20),nr1(m.casting.t),nr1(m.casting.dur)]:0])});
    if(l.length)netTo(p.id,{t:'m',l:l});if(roster)netTo(p.id,{t:'mr',l:live.map(m=>m.nid)})})}
// Called from killMob (combat.js): everyone in the area gets the kill (their own XP and loot).
function netKill(m,how){if(net.role==='host'&&net.shared&&m.nid!=null)netZone({t:'k',i:m.nid,v:how==='vanish'?1:0})}
// A monster swings: the player it hit takes it on their phone ('mh'); the rest just see the swing ('sw').
function netSwing(m,v){if(net.role!=='host'||!net.shared||m.nid==null)return;const g=targetId(v);
  if(v&&v.net)netTo(v.id,{t:'mh',i:m.nid});netZone({t:'sw',i:m.nid,g:g},v&&v.net?v.id:null)}
// Who a caster aims at: whoever it's fighting (a player object), or you.
function castFoe(m){if(net.state==='on'){const v=victim(m);if(v&&v.net&&allyOn(m))return v}return player}
// The spell landed on another player: their phone takes the hit with their own dodges and shields.
function netSpellAlly(m,foe,base,label,col,king){if(!net.shared||m.nid==null||!foe||!foe.net)return;
  netTo(foe.id,{t:'sp',i:m.nid,b:Math.round(base*100)/100,n:String(label).slice(0,24),c:col,k:king?1:0})}
// A ground ring was laid (under anyone): every phone in the area draws it and checks its own player's feet.
function netHazard(h){if(net.role!=='host'||!net.shared||!h.m||h.m.nid==null)return;
  netZone({t:'hz',i:h.m.nid,x:Math.round(h.x),y:Math.round(h.y),r:h.r,d:h.dur,mu:h.mult||0,n:h.label||''})}
// A player went down or left the area: monsters forget them, and go home unless someone else is fighting them.
function netAllyDown(id){mobs.forEach(m=>{if(m.dead||!m.threat||!m.threat.a)return;delete m.threat.a[id];if(m.ab)delete m.ab[id];
  if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0&&!topAlly(m))m.state='return'})}
/* Guests → host: what their players did to the monsters */
function authIn(d){if(net.role!=='host'||!net.shared)return false;const id=d.f,p=peers.get(id);
  if(d.t==='h'){const m=netMob(d.i);if(m&&!m.dead&&p&&p.z===zoneId&&typeof d.d==='number'){m._af=id;hitMob(m,Math.max(1,Math.min(99999,Math.round(d.d))),d.k||'direct',d.n||'',d.s?'allypet':'ally')}return true}
  if(d.t==='fx'){(d.l||[]).forEach(f=>{const m=netMob(f[0]);if(!m||m.dead)return;const k=f[1],v=+f[2]||0;
    if(k==='aslowX'){m.aslowX=v;return}if(SHARE.fx.indexOf(k)<0)return;
    m[k]=Math.max(m[k]||0,v);if(k==='mez'){m.stun=0;m.mezDeep=0}if(k==='chill')m.chillT=8;if(k==='crack'||k==='lost')return;
    if(m.state!=='chase'&&k!=='mez')engage(m,false,id)});return true}
  if(d.t==='th'){(d.l||[]).forEach(f=>{const m=netMob(f[0]);if(!m||m.dead)return;const v=Math.max(0,+f[1]||0);
    if(v===0){if(m.threat.a)delete m.threat.a[id];if(m.ab)delete m.ab[id];if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0&&!topAlly(m)&&!(m.lost>0))m.state='return';return}
    m.threat.a=m.threat.a||{};m.threat.a[id]=v+((m.ab&&m.ab[id])||0);m.allyHad=1;if(m.state!=='chase')engage(m,false,id)});return true}
  if(d.t==='tn'){const m=netMob(d.i);if(!m||m.dead)return true;m.threat.a=m.threat.a||{};m.ab=m.ab||{};
    let top=Math.max(m.threat.p,m.threat.pet);for(const k in m.threat.a)if(k!==id)top=Math.max(top,m.threat.a[k]);top+=40;
    const cur=m.threat.a[id]||0;if(cur<top){m.ab[id]=(m.ab[id]||0)+top-cur;m.threat.a[id]=top}engage(m,false,id);return true}
  return false}

/* ==========================================================================================================
   MIRROR: a guest shows the host's monsters and sends what its player did to them.
   ========================================================================================================== */
function mirrorMake(e){const T0=TYPES[e[1]];if(!T0)return null;const def=groupDef(T0,e[3]);
  const m={nid:e[0],mirror:1,sp:{},type:e[1],def:def,gn:e[3],lv:e[2],maxhp:e[7],hp:e[6],x:e[4],y:e[5],hx:e[4],hy:e[5],tx:e[4],ty:e[5],wx:e[4],wy:e[5],
    state:'idle',dots:[],atk:1,dir:e[9],dead:false,walk:0,pdmg:0,odmg:0,threat:{p:0,pet:0},root:0,snare:0,_h:{},_last:{},_mine:{},_ts:0,_hitT:-9};
  mirrors.set(m.nid,m);mobs.push(m);return m}
function mirrorApply(e){if(!netGuestMirror())return;let m=mirrors.get(e[0]);if(m&&m.dead)return;
  if(!m){m=mirrorMake(e);if(!m)return}
  if(m.gn!==e[3]){m.gn=e[3];m.def=groupDef(TYPES[m.type],e[3])}
  m.lv=e[2];m.maxhp=e[7];m.hp=time-m._hitT<0.4?Math.min(m.hp,e[6]):e[6];
  m.tx=e[4];m.ty=e[5];m.wx=e[4];m.wy=e[5];if(Math.hypot(m.x-e[4],m.y-e[5])>48){m.x=e[4];m.y=e[5]}
  const st=ST_NAME[e[8]]||'idle';if(m.state==='chase'&&st!=='chase'){m.threat.p=0;m.threat.pet=0}m.state=st;
  m.dir=e[9];m.tg=e[10]||0;m.near=e[11]?0.3:0;
  // Effects: the host's word, except one you just put on (it may not have reached the host yet).
  const H={root:e[12],snare:e[13],stun:e[14],mez:e[15],fear:e[16],aslow:e[17],chill:e[18],mark:e[19]}; // lost, discord, crack: only ever set by you here
  for(const k in H){m._h[k]=H[k];if(!(time-(m._mine[k]||-9)<SHARE.keep))m[k]=H[k];m._last[k]=m[k]||0}
  const cs=e[20];m.casting=Array.isArray(cs)?{name:String(cs[0]),t:+cs[1]||0,dur:+cs[2]||1,shown:1}:null} // the host's cast bar (display only here)
// Every guest frame (update.js): the mirror slides to where the host says, your own DoTs on it tick, timers run down.
function mirrorTick(m,dt){
  if(tickDots(m,dt))return;
  ['root','snare','aslow','discord','stun','mez','fear','lost','crack','near'].forEach(k=>{if(m[k]>0)m[k]=Math.max(0,m[k]-dt)});
  if(m.casting&&m.casting.shown){m.casting.t+=dt;if(m.casting.t>m.casting.dur+0.3)m.casting=null}
  if(m.chill>0){m.chillT=(m.chillT||8)-dt;if(m.chillT<=0)m.chill=0}if(m.weak&&m.weak.t>0)m.weak.t-=dt;
  const dx=m.tx-m.x,dy=m.ty-m.y,d=Math.hypot(dx,dy);if(d>0.05){const k=Math.min(1,dt*10);m.x+=dx*k;m.y+=dy*k;m.walk+=dt*1.4}}
// Your hit on a mirror (combat.js hitMob): shows here at once, the host applies it for real.
function mirrorHit(m,dmg,kind,label,src){m.hp=Math.max(1,m.hp-dmg);m._hitT=time;
  if(src==='pet'){m.petT=pet;m.threat.pet+=dmg*((pet&&pet.threat)||3)+(m.petHit?0:20);m.petHit=1;floatText(m.x,m.y-18,String(dmg),'#d8d2c0',0,'small');log('Your '+petName()+' hits '+m.def.name+' for '+dmg+'.','#bdb6a0','fight')}
  else{m.threat.p+=dmg;floatText(m.x,m.y-18,String(dmg),kind==='dot'?'#9be37a':kind==='song'?'#ffd27a':kind==='shield'?'#ff9a4a':'#ffffff',0,(kind==='dot'||kind==='song'||kind==='shield')?'small':'hit');log('Your '+label+' hits '+m.def.name+' for '+dmg+'.','#e8e2cf','fight')}
  if(!player.target&&src!=='pet')player.target=m;
  if(m.mez>0&&m.mezDeep)m.mezDeep=0;else if(m.mez>0)m.mez=0;
  if(kind==='direct')m.lost=0;
  netSend({t:'h',i:m.nid,d:dmg,k:kind,n:String(label||'').slice(0,24),s:src==='pet'?1:0})}
// Send what changed on the mirrors since last frame: effects you put on, your threat.
function mirrorSync(dt){const fx=[];
  mirrors.forEach(m=>{if(m.dead)return;SHARE.fx.forEach(k=>{const v=m[k]||0;if(v>(m._last[k]||0)+0.3){fx.push([m.nid,k,nr1(v)]);if(k==='aslow')fx.push([m.nid,'aslowX',m.aslowX||1.6]);m._mine[k]=time}m._last[k]=v})});
  if(fx.length)netSend({t:'fx',l:fx});
  mirrorThreatT-=dt;if(mirrorThreatT>0)return;mirrorThreatT=SHARE.threat;const th=[];
  mirrors.forEach(m=>{if(m.dead)return;const v=Math.round(m.threat.p+m.threat.pet);if(v!==m._ts&&(v===0||Math.abs(v-m._ts)>=1)){m._ts=v;th.push([m.nid,v])}});
  if(th.length)netSend({t:'th',l:th})}
// Taunts (combat.js): on a mirror, ask the host to put you on top of its list.
function netTaunt(m){if(m&&m.mirror)netSend({t:'tn',i:m.nid})}
/* Host → this guest: what its monsters did */
function mirrorIn(d){if(net.role!=='guest'||d.f!=='h')return false;
  if(d.t==='m'){(d.l||[]).forEach(mirrorApply);return true}
  if(d.t==='mr'){if(!netGuestMirror())return true;const keep=new Set(d.l||[]);
    mirrors.forEach((m,id)=>{if(!keep.has(id)&&!m.dead){mirrors.delete(id);const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);if(player.target===m)player.target=null}});return true}
  if(d.t==='k'){const m=mirrors.get(d.i);if(!m||m.dead||!netGuestMirror())return true;m.hp=0;killMob(m,d.v?'vanish':undefined);mirrors.delete(d.i);return true}
  if(d.t==='mh'){const m=mirrors.get(d.i);if(!m||m.dead||player.dead||!netGuestMirror())return true;
    const toPet=pet&&m.threat.pet>m.threat.p&&dist(m,pet)<30;animSwing(m,toPet?pet:player);m.near=0.3;if(toPet)hurtPet(m,pet);else hurtPlayer(m);return true}
  if(d.t==='sw'){const m=mirrors.get(d.i);if(!m||m.dead)return true;const v=d.g===net.myId?player:peers.get(d.g);if(v&&(v===player||peerHere(v)))animSwing(m,v);m.near=0.3;return true}
  if(d.t==='sp'){const m=mirrors.get(d.i);if(!m||m.dead||player.dead)return true;const col=d.c||'#c8a0ff',base=Math.max(0,Math.min(9999,+d.b||0));
    beams.push({x1:m.x,y1:m.y-12,x2:player.x,y2:player.y-8,t:0,col:col});burst(player.x,player.y-8,col,8);
    if(player.buffs.deflect>0){floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You dodge the '+String(d.n||'spell').toLowerCase()+'.','#9fb8e0');return true}
    if(d.k){let dmg=Math.max(1,Math.round(tankMods(base*rr(0.85,1.15))));if(dev.god)dmg=0;dmg=Math.round(shieldDmg(dmg));player.hp-=dmg; // the Skeleton King's bone: no level gap, like solo
      if(dmg>0)floatText(player.x,player.y-20,String(dmg),col);log(cap(m.def.name)+' hurls a bone at YOU for '+dmg+'.',col);if(player.hp<=0&&!lastStand())playerDie(m);return true}
    mobSpellHit(m,base,String(d.n||'spell'),col);return true}
  if(d.t==='hz'){const m=mirrors.get(d.i);if(!m||m.dead)return true;
    hazards.push({x:+d.x||0,y:+d.y||0,r:Math.max(4,Math.min(60,+d.r||20)),t:0,dur:Math.max(0.3,Math.min(5,+d.d||1.5)),m:m,mult:+d.mu||0,label:d.n?String(d.n).slice(0,24):undefined});
    floatText(m.x,m.y-26,(d.n||'Ember Brand')+'!','#ff8a3c');return true}
  return false}

/* ==========================================================================================================
   PARTY: things players do for each other (heals, heals over time, group buffs). Player to player, through the host.
   ========================================================================================================== */
// Tap a player (or their row under your health) to pick them: your heals and heals over time land on them. Tap again to heal yourself.
function allyPicked(){return !!(player.allyId&&peerHere(peers.get(player.allyId)))}
const allyNow=()=>peers.get(player.allyId);
function allyReach(quiet){if(!allyPicked())return false;const r=allyNow();
  if(dist(player,r)>SHARE.healRange){if(!quiet){log(r.name+' is out of range. Move closer.','#ff8a80');floatText(player.x,player.y-24,'Out of range','#ff8a80')}return false}
  if(typeof sightClear==='function'&&!sightClear(player,r)){if(!quiet)log("You can't see "+r.name+' from here.','#ff8a80');return false}return true}
function allyToggle(id){const p=peers.get(id);if(!peerHere(p)){player.allyId=null;return}player.allyId=player.allyId===id?null:id;
  log(player.allyId?'You pick '+p.name+'. Your heals go to them. Tap them again to heal yourself.':'Your heals go to you again.','#9fd8ff')}
// The player nearest a tap, if the tap is on one (js/input.js).
function peerAt(wx,wy,maxD){let best=null,bd=maxD;peersHere().forEach(p=>{const d=Math.hypot(wx-p.x,wy-(p.y-9));if(d<bd){bd=d;best=p}});return best?{p:best,d:bd}:null}
// Called from applyAbilityCore: true when the heal went to the picked player.
function netHealAlly(a,h){if(!allyPicked())return false;const r=allyNow();
  if(!allyReach(true)){log(r.name+' moved out of range. '+a.name+' fizzles.','#ff8a80');return true}
  netTo(r.id,{t:'hl',h:a.full?-1:h,n:a.name});burst(r.x,r.y-6,a.col,12,true);if(!a.full)floatText(r.x,r.y-22,'+'+h,'#7dffa6');
  log(a.name+' heals '+r.name+(a.full?' fully.':' for '+h+'.'),'#7dffa6','fight');return true}
function netHotAlly(a,dur,heal){if(!allyPicked())return false;const r=allyNow();
  if(!allyReach(true)){log(r.name+' moved out of range. '+a.name+' fizzles.','#ff8a80');return true}
  netTo(r.id,{t:'ho',id:a.id,n:a.name,d:dur,h:heal});burst(r.x,r.y-6,a.col,10,true);log(a.name+' is on '+r.name+' ('+Math.round(dur)+'s).','#7dffa6');return true}
// Buffs that work as "you and everyone nearby" (EverQuest style): every player close by gets them too.
// Only buffs that are plain numbers on the player (no pets, stances or shields that need the caster's own class code).
const GROUP_BUFFS=['bark','clarity','wolf','ward'];
function netBuffAlly(a,dur){if(GROUP_BUFFS.indexOf(a.buff)<0)return;const got=[];
  peersHere().forEach(p=>{if(dist(player,p)>SHARE.healRange)return;netTo(p.id,{t:'bf',k:a.buff,d:dur,n:a.name});burst(p.x,p.y-6,a.col,10,true);got.push(p.name)});
  if(got.length)log(a.name+' is on '+got.join(', ')+' too.','#c8b07a')}
function partyIn(d){if(d.t!=='hl'&&d.t!=='ho'&&d.t!=='bf')return false;if(player.dead)return true;const p=peers.get(d.f),who=p?p.name:'Someone',L=player.lvl;
  if(d.t==='hl'){const h=d.h<0?maxHP(L)-player.hp:Math.max(0,Math.min(99999,Math.round(+d.h||0)));player.hp=Math.min(maxHP(L),player.hp+h);
    floatText(player.x,player.y-22,'+'+Math.round(h),'#7dffa6');burst(player.x,player.y-6,'#7dffa6',10,true);log(who+"'s "+(d.n||'heal')+' heals you for '+Math.round(h)+'.','#7dffa6','fight');return true}
  if(d.t==='ho'){const id='ally_'+(d.f||'')+'_'+(d.id||'hot');player.hots=(player.hots||[]).filter(o=>o.id!==id);
    player.hots.push({id:id,name:String(d.n||'Heal').slice(0,24),t:Math.min(60,+d.d||0),next:2,heal:Math.max(0,Math.min(9999,+d.h||0)),holy:0,holyAll:0});
    log(who+"'s "+(d.n||'heal')+' is on you ('+Math.round(+d.d||0)+'s).','#7dffa6');return true}
  if(GROUP_BUFFS.indexOf(d.k)<0)return true;const dur=Math.max(0,Math.min(99999,+d.d||0));
  player.buffs[d.k]=Math.max(player.buffs[d.k]||0,dur);burst(player.x,player.y-6,'#c8b07a',10,true);log(who+"'s "+String(d.n||'buff')+' is on you'+(dur<100?' ('+Math.round(dur)+'s)':'')+'.','#c8b07a');return true}

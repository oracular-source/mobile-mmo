// Multiplayer (owner, Nov 27): two phones, phone to phone. Step 1 see each other; step 2 (v0.142) shared mobs and heals.
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
  netSend({t:'s',z:zoneId,x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,d:p.dir,m:moving&&!p.sit?1:0,sit:p.sit?1:0,dead:p.dead>0?1:0,hid:hidden()||p.fd>0?1:0,
    hp:Math.round(p.hp),mhp:Math.round(maxHP(p.lvl)),lv:p.lvl,cls:CLS,w:w&&ITEMS[w]?w:'',name:netName(),ch:inv.equip.chest||'',hd:inv.equip.head||'',
    pt:[pet,pet2].filter(q=>q&&q.hp>0).map(q=>[q.img||'pet',Math.round(q.x),Math.round(q.y),q.dir<0?-1:1,Math.round(q.hp),Math.round(q.maxhp)]), // step 3: your partner sees your pets
    c:p.cast&&!p.cast.a.melee?{n:p.cast.a.name,col:p.cast.a.col,p:Math.min(1,p.cast.time/p.cast.a.cast)}:0})}
function netMsg(d){if(!d||!d.t)return;net.heardT=performance.now()/1000;if(net.quiet){net.quiet=false;netStatus()}
  if(d.t==='full'){netFail('That game already has two players.');return}
  if(d.t==='bye'){const who=remote?remote.name:'Your partner';netClose(true);log('Group: '+who+' left the game.','#9fd8ff');return}
  if(d.t==='hi'){const first=!remote;netRemote(d);if(first){log('Group: '+remote.name+' ('+(CLASSES[d.cls]?CLASSES[d.cls].name:d.cls)+') joined. Say hi from Menu → Group.','#9fd8ff');banner('Playing together',remote.name+' is here')}
    if(d.v!==GAME_V)log('Group: '+remote.name+' is on v'+d.v+', you are on v'+GAME_V+'. Both reload the page so you match.','#ffd27a');netStatus();return}
  if(netHostMsg(d)||netGuestMsg(d)||netHealMsg(d)||netStep3Msg(d))return; // steps 2 and 3: shared mobs, heals, spells, buffs
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
  if(d.dead&&!r.dead&&net.role==='host'&&net.shared)netAllyDown(); // the guest went down: monsters on them go home
  r.hid=!!d.hid;r.dir=d.d<0?-1:1;r.moving=!!d.m;r.sit=!!d.sit;r.dead=!!d.dead;r.hp=d.hp;r.mhp=d.mhp||1;r.lv=d.lv;r.w=d.w&&ITEMS[d.w]?d.w:'';r.cast=d.c||null;
  r.ch=d.ch&&ITEMS[d.ch]?d.ch:'';r.hd=d.hd&&ITEMS[d.hd]?d.hd:''; // step 3: their chest and head looks
  // Their pets (step 3): drawn like yours, sliding to where their phone says.
  const pl=Array.isArray(d.pt)?d.pt.slice(0,2):[];r.pets=pl.map((q,i)=>{const o=(r.pets&&r.pets[i]&&r.pets[i].img===q[0])?r.pets[i]:{rpet:1,img:IMG[q[0]]?q[0]:'pet',x:q[1],y:q[2],walk:0};
    o.tx=q[1];o.ty=q[2];o.dir=q[3]<0?-1:1;o.hp=q[4];o.maxhp=q[5]||1;if(zoneChanged||Math.hypot(o.x-q[1],o.y-q[2])>48){o.x=q[1];o.y=q[2]}return o})}
// Called when you cast anything (js/combat.js applyAbilityCore): your partner sees a spark and the spell's name.
function netCast(a){if(net.state!=='on'||simState.busy||!a)return;netSend({t:'c',n:a.name,col:a.col})}
function netSay(text){text=(text||'').trim().slice(0,120);if(!text||net.state!=='on')return;netSend({t:'say',text:text});
  // Your own bubble follows you (say() would name the speaker; this is you).
  for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].o===player)bubbles.splice(i,1);
  bubbles.push({o:player,text:text,t:0});log('You say, "'+text+'"','#d8c8ff')}

/* ---------- Every frame (js/main.js) ---------- */
function netTick(dt){
  {const sh=netShared();if(sh!==!!net.shared)netShareChange(sh)} // step 2: start or stop sharing this area's monsters
  if(player.ally&&!remoteHere())player.ally=false;
  if(net.state==='on'&&net.shared&&running&&!document.hidden){if(net.role==='host')netSendMobs(dt);else netGuestSync(dt)}
  if(net.state==='on'){net.sendT-=dt;if(net.sendT<=0){net.sendT=NET.rate;netSendState()}
    const q=performance.now()/1000-net.heardT>NET.quiet;if(q!==net.quiet){net.quiet=q;if(q&&remote)log('Group: '+remote.name+' is not responding (screen off, or the connection dropped?).','#ffd27a');netStatus()}}
  if(remote){const r=remote,k=Math.min(1,dt*12);r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;
    if(r.moving)r.walk+=dt*1.4;else r.walk=0;
    (r.pets||[]).forEach(o=>{const dx=o.tx-o.x,dy=o.ty-o.y;if(Math.abs(dx)+Math.abs(dy)>0.3)o.walk+=dt*1.4;o.x+=dx*k;o.y+=dy*k})}}
// Is the partner drawn in this area right now?
function remoteHere(){return remote&&net.state==='on'&&remote.z===zoneId&&!remote.dead}
// The partner's picture: their class's rags look with their weapon in hand (same pictures as yours, built once and kept).
function remoteImg(r){const it=r.w&&ITEMS[r.w],wid=it&&WEAPON_LOOKS[it.wt]&&it.look&&CLASS_WEAPON[r.cls]?r.w:'',
    eq={chest:r.ch,head:r.hd},lk={chest:slotLook(eq,'chest'),head:slotLook(eq,'head')},k='rags_'+r.cls+'|'+wid+'|'+lk.chest+lk.head; // same key as yours, so a shared look is built once
  if(!IMG[k])IMG[k]=mkRags(r.cls,wid,lk)||IMG.druid;return IMG[k]}

/* ---------- Menu → Group ---------- */
function renderGroup(){const box=$('groupbox');if(!box)return;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const err=net.err?'<p class="neterr">'+esc(net.err)+'</p>':'';
  let h='';
  if(net.state==='off'){
    h='<p class="hint">Play with someone on another phone. In the same area you fight the same monsters (tuned for 2) and both get the XP. Tap your partner, or their row under your health, and your heals go to them.</p>'+
      '<label class="netl">Your name<input id="netname" maxlength="14" value="'+esc(settings.netName||'')+'" placeholder="'+esc(C.name)+'"></label>'+
      '<button class="go" id="nethost">Host a game</button>'+
      '<label class="netl">Or join with a code<input id="netcode" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="ABCD"></label>'+
      '<button class="go" id="netjoin">Join</button>'+err+
      '<p class="hint">If two phones on the same Wi-Fi can\'t link, put one on mobile data.</p>';
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

/* ---------- Step 2 (v0.142): shared mobs and healing each other ----------
   In an area you're both in (not an instance or the testing grounds: those are step 3), the HOST's phone runs the monsters.
   The guest throws its own monsters away and shows copies ("mirrors") of the host's, sent about 10 times a second for the
   ones near the fight and once a second for the rest. The guest's hits, effects (roots, stuns, sleeps...) and threat go to
   the host, which applies them to the real monster; a monster that goes for the guest tells the guest's phone to take the
   hit (the guest's own armor, dodges and shields work out the damage). A kill is sent to both: each phone gives its own
   player the full solo XP and rolls its own loot. While you share an area the host scales its monsters for 2 players
   (GROUP_SCALE). Solo play never touches any of this: it only runs while connected. */
const SHARE={near:260,fast:0.1,slow:1,roster:1,threat:0.2,healRange:110,keep:0.8,
  fx:['root','snare','stun','mez','fear','aslow','lost','discord','chill','crack','mark']}; // effects the guest can put on a monster
const mirrors=new Map(); // guest: the host's monsters by id
let netMobT=0,netRosterT=0,netThreatT=0;
// Are the two of you in an area whose monsters are shared?
function netShared(){if(net.state!=='on'||!remote||remote.z!==zoneId||simState.busy||zoneId==='arena'||zoneId==='dun')return false;const A=curArea();return !(A&&A.instance)}
const netGuestMirror=()=>net.role==='guest'&&net.shared;
// Host: is this monster after the guest (and can it be)?
function allyOn(m){return net.role==='host'&&net.shared&&remote&&!remote.dead&&(m.threat.ally||0)>0}
function mobOnAlly(m){if(m.mirror)return m.tg!==2;return allyOn(m)&&m.threat.ally>m.threat.p&&m.threat.ally>m.threat.pet}
function netMob(id){for(let i=0;i<mobs.length;i++)if(mobs[i].nid===id)return mobs[i];return null}
// Host: rescale a monster for the current group size, keeping its health percentage. One already in a fight keeps its
// numbers until the fight ends (update.js calls this again when it walks home).
function mobScale(m){if((m.gn||1)===partyN||m.dead)return;if(m.state==='chase')return;
  const base=m.def.base||m.def,def=groupDef(base,partyN),pct=m.maxhp>0?m.hp/m.maxhp:1;
  m.def=def;m.maxhp=def.hp+def.hpl*m.lv;m.hp=Math.min(m.maxhp,Math.round(pct*m.maxhp));m.gn=partyN}
function netShareChange(on){net.shared=on;const who=remote?remote.name:'your partner';
  if(net.role==='host'){partyN=on?2:1;mobs.forEach(mobScale);
    if(!on)mobs.forEach(m=>{if(m.dead)return;m.threat.ally=0;m.allyBonus=0;if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0)m.state='return'});
    else{netMobT=0;netRosterT=0}
    log(on?'Group: you and '+who+' share this area. Its monsters are tuned for 2 players.':'Group: monsters here are back to solo strength.','#9fd8ff');return}
  // Guest: swap your own monsters for the host's (or back).
  mobs.length=0;mirrors.clear();player.target=null;if(pet)pet.target=null;if(pet2)pet2.target=null;grounds.length=0;traps.length=0;
  if(on){partyN=2;spawns.forEach(sp=>{sp.mob=null});log('Group: you and '+who+' fight the same monsters here now.','#9fd8ff')}
  else{partyN=1;spawns.forEach(sp=>{sp.mob=null;if(sp.gone){sp.timer=Infinity;return}sp.timer=0;spawn(sp)});const A=curArea();if(A&&A.rare){A.rare.sp.mob=null;if(A.rare.sp.up)spawn(A.rare.sp)}
    arriveSafe();if(net.state==='on')log('Group: '+who+' left this area. You have your own monsters again.','#9fd8ff')}}

/* Host → guest */
const ST_CODE={idle:0,chase:1,return:2,drift:3},ST_NAME=['idle','chase','return','drift'];
const nr1=v=>Math.round((v||0)*10)/10;
function netSendMobs(dt){netMobT-=dt;netRosterT-=dt;if(netMobT>0)return;netMobT=SHARE.fast;
  const l=[];mobs.forEach(m=>{if(m.dead||m.nid==null)return;const near=m.state==='chase'||dist(m,remote)<SHARE.near;
    if(time-(m._ns||-9)<(near?SHARE.fast:SHARE.slow)-0.01)return;m._ns=time;
    const v=m.state==='chase'?victim(m):null;
    l.push([m.nid,m.type,m.lv,m.gn||1,nr1(m.x),nr1(m.y),Math.ceil(m.hp),Math.round(m.maxhp),ST_CODE[m.state]||0,m.dir<0?-1:1,v===remote?2:v?1:0,m.near>0?1:0,
      nr1(m.root),nr1(m.snare),nr1(m.stun),nr1(m.mez),nr1(m.fear),nr1(m.aslow),m.chill||0,nr1(m.mark),
      m.casting&&m.casting.dur?[String(m.casting.name||'').slice(0,20),nr1(m.casting.t),nr1(m.casting.dur)]:0])}); // step 3: the cast bar, so your partner can see it coming and break it
  if(l.length)netSend({t:'m',l:l});
  if(netRosterT<=0){netRosterT=SHARE.roster;netSend({t:'mr',l:mobs.filter(m=>!m.dead&&m.nid!=null).map(m=>m.nid)})}}
// Called from killMob (combat.js): the guest gets the kill too (its own XP and loot).
function netKill(m,how){if(net.role==='host'&&net.shared&&m.nid!=null)netSend({t:'k',i:m.nid,v:how==='vanish'?1:0})}
// A monster swings: at the guest (they take the hit on their phone) or at someone else (the guest just sees the swing).
function netSwing(m,v){if(net.role!=='host'||!net.shared||m.nid==null)return;netSend({t:v===remote?'mh':'sw',i:m.nid})}

/* Guest: the mirrors */
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
  m.dir=e[9];m.tg=e[10];m.near=e[11]?0.3:0;
  const cs=e[20];m.casting=Array.isArray(cs)?{name:String(cs[0]),t:+cs[1]||0,dur:+cs[2]||1,shown:1}:null; // the host's cast bar (display only here)
  // Effects: the host's word, except one you just put on (it may not have reached the host yet).
  const H={root:e[12],snare:e[13],stun:e[14],mez:e[15],fear:e[16],aslow:e[17],chill:e[18],mark:e[19]}; // lost, discord, crack: only ever set by you here
  for(const k in H){m._h[k]=H[k];if(!(time-(m._mine[k]||-9)<SHARE.keep))m[k]=H[k];m._last[k]=m[k]||0}}
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
  netSend({t:'h',i:m.nid,d:dmg,k:kind,n:String(label||'').slice(0,24)})}
// Guest: send what changed on the mirrors since last frame (effects you put on, your threat).
function netGuestSync(dt){const fx=[];
  mirrors.forEach(m=>{if(m.dead)return;SHARE.fx.forEach(k=>{const v=m[k]||0;if(v>(m._last[k]||0)+0.3){fx.push([m.nid,k,nr1(v)]);if(k==='aslow')fx.push([m.nid,'aslowX',m.aslowX||1.6]);m._mine[k]=time}m._last[k]=v})});
  if(fx.length)netSend({t:'fx',l:fx});
  netThreatT-=dt;if(netThreatT>0)return;netThreatT=SHARE.threat;const th=[];
  mirrors.forEach(m=>{if(m.dead)return;const v=Math.round(m.threat.p+m.threat.pet);if(v!==m._ts&&(v===0||Math.abs(v-m._ts)>=1)){m._ts=v;th.push([m.nid,v])}});
  if(th.length)netSend({t:'th',l:th})}
// Taunts (combat.js): on a mirror, ask the host to put you on top of its list.
function netTaunt(m){if(m&&m.mirror)netSend({t:'tn',i:m.nid})}

/* Host: what the guest did */
function netHostMsg(d){if(net.role!=='host'||!net.shared)return false;
  if(d.t==='h'){const m=netMob(d.i);if(m&&!m.dead&&typeof d.d==='number')hitMob(m,Math.max(1,Math.min(99999,Math.round(d.d))),d.k||'direct',d.n||'',d.s?'allypet':'ally');return true}
  if(d.t==='fx'){(d.l||[]).forEach(f=>{const m=netMob(f[0]);if(!m||m.dead)return;const k=f[1],v=+f[2]||0;
    if(k==='aslowX'){m.aslowX=v;return}if(SHARE.fx.indexOf(k)<0)return;
    m[k]=Math.max(m[k]||0,v);if(k==='mez'){m.stun=0;m.mezDeep=0}if(k==='chill')m.chillT=8;if(k==='crack'||k==='lost')return;
    if(m.state!=='chase'&&k!=='mez')engage(m,false,true)});return true}
  if(d.t==='th'){(d.l||[]).forEach(f=>{const m=netMob(f[0]);if(!m||m.dead)return;const v=Math.max(0,+f[1]||0);
    if(v===0){m.threat.ally=0;m.allyBonus=0;if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0&&!(m.lost>0))m.state='return';return}
    m.threat.ally=v+(m.allyBonus||0);m.allyHad=1;if(m.state!=='chase')engage(m,false,true)});return true}
  if(d.t==='tn'){const m=netMob(d.i);if(!m||m.dead)return true;const top=Math.max(m.threat.p,m.threat.pet)+40;
    if((m.threat.ally||0)<top){m.allyBonus=(m.allyBonus||0)+top-(m.threat.ally||0);m.threat.ally=top}engage(m,false,true);return true}
  return false}
/* Guest: what the host's monsters did */
function netGuestMsg(d){if(net.role!=='guest')return false;
  if(d.t==='m'){(d.l||[]).forEach(mirrorApply);return true}
  if(d.t==='mr'){if(!netGuestMirror())return true;const keep=new Set(d.l||[]);
    mirrors.forEach((m,id)=>{if(!keep.has(id)&&!m.dead){mirrors.delete(id);const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);if(player.target===m)player.target=null}});return true}
  if(d.t==='k'){const m=mirrors.get(d.i);if(!m||m.dead||!netGuestMirror())return true;m.hp=0;killMob(m,d.v?'vanish':undefined);mirrors.delete(d.i);return true}
  if(d.t==='mh'){const m=mirrors.get(d.i);if(!m||m.dead||player.dead||!netGuestMirror())return true;
    const toPet=pet&&m.threat.pet>m.threat.p&&dist(m,pet)<30;animSwing(m,toPet?pet:player);m.near=0.3;if(toPet)hurtPet(m,pet);else hurtPlayer(m);return true}
  if(d.t==='sw'){const m=mirrors.get(d.i);if(m&&!m.dead&&remote){animSwing(m,remote);m.near=0.3}return true}
  return false}
// Host: the guest went down (or left): monsters that were after them forget them and go home unless you're in the fight.
function netAllyDown(){mobs.forEach(m=>{if(m.dead||!m.threat)return;m.threat.ally=0;m.allyBonus=0;if(m.state==='chase'&&m.threat.p<=0&&m.threat.pet<=0)m.state='return'})}

/* ---------- Healing your partner ----------
   Tap your partner (or their row under your frame) to pick them. While picked, your heals and heals-over-time land on them
   instead of you. Tap again to go back to healing yourself. */
function allyPicked(){return !!(player.ally&&remoteHere())}
function allyReach(quiet){if(!allyPicked())return false;const r=remote;
  if(dist(player,r)>SHARE.healRange){if(!quiet){log(r.name+' is out of range. Move closer.','#ff8a80');floatText(player.x,player.y-24,'Out of range','#ff8a80')}return false}
  if(typeof sightClear==='function'&&!sightClear(player,r)){if(!quiet)log("You can't see "+r.name+' from here.','#ff8a80');return false}return true}
function allyToggle(){if(!remoteHere()){player.ally=false;return}player.ally=!player.ally;
  log(player.ally?'You pick '+remote.name+'. Your heals go to them. Tap them again to heal yourself.':'Your heals go to you again.','#9fd8ff')}
// Called from applyAbilityCore: returns true when the heal went to your partner.
function netHealAlly(a,h){if(!allyPicked())return false;const r=remote;
  if(!allyReach(true)){log(r.name+' moved out of range. '+a.name+' fizzles.','#ff8a80');return true}
  netSend({t:'hl',h:a.full?-1:h,n:a.name});burst(r.x,r.y-6,a.col,12,true);if(!a.full)floatText(r.x,r.y-22,'+'+h,'#7dffa6');
  log(a.name+' heals '+r.name+(a.full?' fully.':' for '+h+'.'),'#7dffa6','fight');return true}
function netHotAlly(a,dur,heal){if(!allyPicked())return false;const r=remote;
  if(!allyReach(true)){log(r.name+' moved out of range. '+a.name+' fizzles.','#ff8a80');return true}
  netSend({t:'ho',id:a.id,n:a.name,d:dur,h:heal});burst(r.x,r.y-6,a.col,10,true);log(a.name+' is on '+r.name+' ('+Math.round(dur)+'s).','#7dffa6');return true}
function netHealMsg(d){if(d.t!=='hl'&&d.t!=='ho')return false;const who=remote?remote.name:'Your partner';if(player.dead)return true;const L=player.lvl;
  if(d.t==='hl'){const h=d.h<0?maxHP(L)-player.hp:Math.max(0,Math.min(99999,Math.round(+d.h||0)));player.hp=Math.min(maxHP(L),player.hp+h);
    floatText(player.x,player.y-22,'+'+Math.round(h),'#7dffa6');burst(player.x,player.y-6,'#7dffa6',10,true);log(who+"'s "+(d.n||'heal')+' heals you for '+Math.round(h)+'.','#7dffa6','fight');return true}
  if(d.t==='ho'){const id='ally_'+(d.id||'hot');player.hots=(player.hots||[]).filter(o=>o.id!==id);
    player.hots.push({id:id,name:String(d.n||'Heal').slice(0,24),t:Math.min(60,+d.d||0),next:2,heal:Math.max(0,Math.min(9999,+d.h||0)),holy:0,holyAll:0});
    log(who+"'s "+(d.n||'heal')+' is on you ('+Math.round(+d.d||0)+'s).','#7dffa6');return true}
  return false}

/* ---------- Step 3, part 1 (v0.154): monster spells at either of you, group buffs ----------
   Casters and bosses aim at whoever they're fighting. When the host's monster casts at the guest, the host's phone shows the
   cast and the beam, and the guest's phone takes the hit with its own dodges and shields ('sp'). Ground rings (Ember Brand,
   a wisp's Fire Ring) are sent to the guest too ('hz'), so each phone shows the ring and hurts only its own player. */
// Host: who a caster aims at. Your partner when they're the one it's fighting; otherwise you (as in solo).
function castFoe(m){if(remote&&allyOn(m)&&victim(m)===remote)return remote;return player}
// Host: the spell landed on your partner.
function netSpellAlly(m,base,label,col,king){if(!net.shared||m.nid==null)return;
  netSend({t:'sp',i:m.nid,b:Math.round(base*100)/100,n:String(label).slice(0,24),c:col,k:king?1:0})}
// Host: a ground ring was laid down (at you or your partner): your partner's phone draws it and checks their own feet.
function netHazard(h){if(net.role!=='host'||!net.shared||!h.m||h.m.nid==null)return;
  netSend({t:'hz',i:h.m.nid,x:Math.round(h.x),y:Math.round(h.y),r:h.r,d:h.dur,mu:h.mult||0,n:h.label||''})}
function netStep3Msg(d){
  if(d.t==='sp'&&net.role==='guest'){const m=mirrors.get(d.i);if(!m||m.dead||player.dead)return true;const col=d.c||'#c8a0ff',base=Math.max(0,Math.min(9999,+d.b||0));
    beams.push({x1:m.x,y1:m.y-12,x2:player.x,y2:player.y-8,t:0,col:col});burst(player.x,player.y-8,col,8);
    if(player.buffs.deflect>0){floatText(player.x,player.y-20,'DODGE','#cfd6e0');log('You dodge the '+String(d.n||'spell').toLowerCase()+'.','#9fb8e0');return true}
    if(d.k){let dmg=Math.max(1,Math.round(tankMods(base*rr(0.85,1.15))));if(dev.god)dmg=0;dmg=Math.round(shieldDmg(dmg));player.hp-=dmg; // the Skeleton King's bone: no level gap, like solo
      if(dmg>0)floatText(player.x,player.y-20,String(dmg),col);log(cap(m.def.name)+' hurls a bone at YOU for '+dmg+'.',col);if(player.hp<=0&&!lastStand())playerDie(m);return true}
    mobSpellHit(m,base,String(d.n||'spell'),col);return true}
  if(d.t==='hz'&&net.role==='guest'){const m=mirrors.get(d.i);if(!m||m.dead)return true;
    hazards.push({x:+d.x||0,y:+d.y||0,r:Math.max(4,Math.min(60,+d.r||20)),t:0,dur:Math.max(0.3,Math.min(5,+d.d||1.5)),m:m,mult:+d.mu||0,label:d.n?String(d.n).slice(0,24):undefined});
    floatText(m.x,m.y-26,(d.n||'Ember Brand')+'!','#ff8a3c');return true}
  if(d.t==='bf'){if(player.dead||GROUP_BUFFS.indexOf(d.k)<0)return true;const dur=Math.max(0,Math.min(99999,+d.d||0)),who=remote?remote.name:'Your partner';
    player.buffs[d.k]=Math.max(player.buffs[d.k]||0,dur);burst(player.x,player.y-6,'#c8b07a',10,true);log(who+"'s "+String(d.n||'buff')+' is on you'+(dur<100?' ('+Math.round(dur)+'s)':'')+'.','#c8b07a');return true}
  return false}
// Buffs that work as "you and everyone nearby" (EverQuest style): cast one with your partner close by and it lands on them too.
// Only buffs that are plain numbers on the player (no pets, stances or shields that need your own class's code).
const GROUP_BUFFS=['bark','clarity','wolf','ward'];
function netBuffAlly(a,dur){if(GROUP_BUFFS.indexOf(a.buff)<0||!remoteHere()||dist(player,remote)>SHARE.healRange)return;
  netSend({t:'bf',k:a.buff,d:dur,n:a.name});burst(remote.x,remote.y-6,a.col,10,true);log(a.name+' is on '+remote.name+' too.','#c8b07a')}

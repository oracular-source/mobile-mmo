// Testing grounds (DEV only): spawn test mobs in the arena, and the sim, a bot that plays your class by its
// playbook (docs/playbooks.md) at fixed time steps with seeded randomness, so the same seed always gives the same fight.
'use strict';
/* ---------- Sim setup ---------- */
const SIM_DT=1/30;            // fixed step: 30 game ticks per second, the same on any phone
// Every level up to the cap, so you can see where a class turns the corner (and the first level it beats Boss 1).
const SIM_LEVELS=[1,2,3,4,5,6,7,8,9,10];
const SIM_SEEDS=10;           // fights per scenario; results are averages
// Every class fights the same mobs, set to its own level (even con) so levels compare fairly.
const SIM_FIGHTS=[
  {id:'rat',name:'Rat',mobs:['rat']},
  {id:'beetle',name:'Beetle (armored)',mobs:['beetle']},
  {id:'skel',name:'Skeleton',mobs:['cskel']},
  {id:'pair',name:'Two skeletons',mobs:['cskel','cskel']},
  {id:'boss',name:'Boss 1 (lvl 7)',mobs:['boss1'],minL:6,lv:7}, // tried from level 6 up to find the first level that beats it
  {id:'gnaw',name:'Old Gnawbone (lvl 6)',mobs:['gnaw'],minL:5,lv:6} // squeals for two rats at 2/3 and 1/3 health (beside him: the arena has no holes)
];
// Classes with more than one playbook to compare. Empty for now: the Rogue's Evade was settled as damage (A) on Nov 17.
// To compare again, add e.g. rogue:[{id:'A',name:'Evade as damage'},{id:'B',name:'Evade as escape'}].
const SIM_MODES={};

// Puts a test mob in the arena at a given level. Two mobs share a group, so pulling one brings both.
function arenaMob(type,lv,x,y,group){
  const sp={type:type,x:x,y:y,timer:0,mob:null,group:group||null,lv:[lv,lv],noRespawn:true};
  if(blocked(x,y)){sp.x=ARENA.start.x+60;sp.y=ARENA.start.y}
  spawns.push(sp);return spawn(sp);
}
function arenaSpawn(f,L){
  const lv=f.lv||L,x=player.x+80,y=player.y;
  return f.mobs.map((t,i)=>arenaMob(t,lv,x+i*14,y+(i?14:0),f.mobs.length>1?'pair':null));
}

/* ---------- Bot helpers: what a player sees and can tap ---------- */
const B={
  ready:id=>{const a=ABI[id];return !!a&&player.lvl>=a.lvl&&!(player.cds[id]>0)&&(!a.mana||player.mp>=a.mana)},
  can:id=>B.ready(id)&&player.gcd<=0&&!player.cast,
  use:(id,t)=>{if(t)player.target=t;return cast(ABI[id],true)},
  hp:()=>player.hp/maxHP(player.lvl),
  mp:()=>C.mana?player.mp/maxMP(player.lvl):1,
  live:()=>mobs.filter(m=>!m.dead),
  fighting:()=>mobs.filter(m=>!m.dead&&m.state==='chase'),
  onMe:()=>mobs.filter(m=>!m.dead&&m.state==='chase'&&victim(m)===player&&!(m.fear>0)&&!(m.lost>0)&&!(m.mez>0)),
  hot:id=>(player.hots||[]).some(o=>o.id===id),
  // Point Blink away from a mob (Blink goes the way you last moved).
  faceAway:m=>{const dx=player.x-m.x,dy=player.y-m.y,d=Math.hypot(dx,dy)||1;player.fx=dx/d;player.fy=dy/d},
  dot:(m,id)=>m.dots.some(d=>d.id===id),
  stop:()=>{player.tx=null},
  // Walk toward a mob until within r. Returns true once in range.
  near:(m,r)=>{if(dist(player,m)>r){player.sit=false;player.tx=m.x;player.ty=m.y;return false}player.tx=null;return true},
  // Kite: back away from the mob, curving around the room so you don't get stuck in a corner.
  kite:m=>{
    player.sit=false;
    let ax=player.x-m.x,ay=player.y-m.y,ad=Math.hypot(ax,ay)||1;ax/=ad;ay/=ad;
    const cx0=ARENA.w*T/2,cy0=ARENA.h*T/2;let rx=player.x-cx0,ry=player.y-cy0;const rd=Math.hypot(rx,ry)||1;rx/=rd;ry/=rd;
    let tx=-ry,ty=rx;if(tx*ax+ty*ay<0){tx=-tx;ty=-ty}
    const w=Math.max(0,Math.min(1,(rd-50)/70));
    let dx=ax*(1-w)+tx*w,dy=ay*(1-w)+ty*w;const dd=Math.hypot(dx,dy)||1;
    let px=player.x+dx/dd*24,py=player.y+dy/dd*24;
    if(blocked(px,py)){px=player.x+tx*24;py=player.y+ty*24}
    player.tx=px;player.ty=py;
  },
  // Boss telegraph (any class, checked before the playbook): when a boss starts its big cast, a player taps a stun or fear
  // that reaches; failing that, steps out of range if there's time to make it. Returns true if it acted this tick.
  counter:()=>{
    const m=B.live().find(x=>x.casting&&victim(x)===player);if(!m)return false;
    const left=m.casting.dur-m.casting.t,d=dist(player,m);
    const a=C.abilities.find(a=>(a.kind==='stun'||(a.kind==='fear'&&(!a.undeadOnly||isUndead(m)))||(a.kind==='cleave'&&a.stun))&&B.can(a.id)&&d<=(a.radius||a.range||18));
    if(a&&B.use(a.id,m))return true;
    const need=BOLT.range+4-d;
    if(m.casting.fled&&need<=0){B.stop();return true} // made it out: wait there until the bolt falls short
    if(need>0&&(m.casting.fled||(B.hp()<0.6&&need/pSpeed()<left-0.1))){ // only worth giving up the attack when you are getting low
      m.casting.fled=true;B.kite(m);return true}
    return false;
  },
  // Who to hit: the current target if it's alive, else whatever is fighting you, else the nearest mob.
  target:()=>{const t=player.target;if(t&&!t.dead)return t;const f=B.fighting();return f[0]||nearestMob(999)}
};

/* ---------- Playbooks as code ("when X, do Y", top rule first) ---------- */
// prep(st): before the pull (not counted in kill time); returns true when ready. think(st): one decision per tick.
const BOTS={
  druid:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const L=player.lvl,t=B.target();if(!t)return;
      // Levels 1-2: stand and fight.
      if(L<3){if(B.hp()<0.35&&B.can('mend')){B.stop();B.use('mend');return}
        if(B.near(t,75)&&B.can('thorn'))B.use('thorn',t);return}
      // Pull: Rot from max range.
      if(!B.fighting().length){if(B.near(t,75)){if(B.can('rot'))B.use('rot',t);else if(B.can('thorn'))B.use('thorn',t)}return}
      const on=B.onMe().filter(m=>!(m.root>0)&&!(m.stun>0)).sort((a,b)=>dist(a,player)-dist(b,player));
      const th=on[0],d=th?dist(th,player):999;
      // Movement: kite whatever is close and free; otherwise get in range of the target.
      if(th&&d<30)B.kite(th);else if(dist(player,t)>75)B.near(t,75);else B.stop();
      // 1. Low health: heal once there's room.
      if(B.hp()<0.35){if(d>45&&B.can('mend')){B.stop();B.use('mend')}return}
      // 2. Close and not snared: Tanglefoot, else Rootgrip.
      if(th&&d<45&&!(th.snare>0)){if(B.can('snare')){B.use('snare',th);return}if(B.can('root')){B.stop();B.use('root',th);return}}
      // Two mobs: root the extra one (level 6) and fight the first.
      const extra=B.fighting().filter(m=>m!==t&&!(m.root>0));
      if(extra.length&&B.can('root')&&dist(player,extra[0])<=80){B.stop();B.use('root',extra[0]);player.target=t;return}
      // 3. Rot on the target (and on the extra one if mana allows).
      if(!B.dot(t,'rot')&&B.can('rot')){B.use('rot',t);return}
      if(extra.length&&!B.dot(extra[0],'rot')&&B.mp()>0.4&&B.can('rot')&&dist(player,extra[0])<=80){B.use('rot',extra[0]);player.target=t;return}
      // 5. Otherwise Thornlash.
      if(B.can('thorn'))B.use('thorn',t);
    }
  },
  warrior:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      // Pull: Throw Stone, then wait for it to come.
      if(!B.fighting().length){if(B.near(t,75)&&B.can('throw'))B.use('throw',t);return}
      if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0))B.stop();else B.near(t,14);
      const hitting=B.onMe().filter(m=>dist(m,player)<16&&!(m.stun>0));
      // Last Stand window: get a Bandage off while nothing can kill you.
      if(player.buffs.laststand>0&&B.can('bandage')){B.stop();B.use('bandage');return}
      if(B.hp()<0.35&&B.can('stance')){B.use('stance');return}
      if(B.hp()<0.35&&!hitting.length&&B.can('bandage')){B.stop();B.use('bandage');return}
      if(dist(player,t)>18)return;
      if(t.hp/t.maxhp<0.3&&!(t.snare>0)&&B.can('ham')){B.use('ham',t);return}
      if(B.can('bash')){B.use('bash',t);return}
      if(B.live().filter(m=>dist(m,player)<=24).length>=2&&B.can('cleave')){B.use('cleave');return}
      if(B.can('strike'))B.use('strike',t);
    }
  },
  necro:{
    prep(){if(pet)return !player.cast;if(player.lvl<ABI.raise.lvl)return true;if(!player.cast&&B.can('raise'))B.use('raise');return false},
    think(st){
      if(player.cast||player.fd>0)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting(),on=B.onMe();
      // Pull: plague the target so the pet picks it up.
      if(!fight.length){if(B.near(t,75)){if(B.can('plague'))B.use('plague',t);else if(B.ready('plague')||player.lvl<ABI.plague.lvl){if(B.can('tap'))B.use('tap',t)}}return}
      // 1. Health very low: Feign Death.
      if(B.hp()<0.2&&B.can('feign')){B.stop();player.sit=false;B.use('feign');return}
      // Lost the pet: Dread, back off, re-raise if there's time.
      if(!pet){const th=on.sort((a,b)=>dist(a,player)-dist(b,player))[0];
        // Levels 1-3 (no pet yet): keep Plague up, Dread what gets close, back off and Lifetap.
        if(player.lvl<ABI.raise.lvl){const tt=B.target();
          if(th&&dist(th,player)<24&&B.can('dread')){B.use('dread',th);return}
          if(!B.dot(tt,'plague')&&B.can('plague')&&dist(player,tt)<=80){B.use('plague',tt);return}
          if(B.can('tap')&&B.near(tt,75))B.use('tap',tt);return}
        if(th&&B.can('dread')){B.use('dread',th);return}
        if((!th||dist(th,player)>50)&&B.can('raise')){B.stop();B.use('raise');return}
        if(th&&dist(th,player)<30)B.kite(th);
        if(th&&B.can('tap')&&dist(th,player)<=80)B.use('tap',th);return}
      // 2. Two mobs: Dread the one with the most health, fight the weaker one; re-Dread when it comes back.
      if(fight.length>=2){const big=fight.slice().sort((a,b)=>b.hp-a.hp)[0];
        if(!(big.fear>0)&&B.can('dread')&&dist(player,big)<=80){B.use('dread',big);player.target=fight.find(m=>m!==big)||t;return}}
      const tt=B.target();
      // 3. Plague on every mob in the fight.
      const bare=fight.find(m=>!B.dot(m,'plague')&&dist(player,m)<=80);
      if(bare&&B.can('plague')){B.use('plague',bare);player.target=tt;return}
      // 4. Pet below half: Mend Bones.
      if(pet.hp<pet.maxhp/2&&B.can('mendb')){B.stop();B.use('mendb');return}
      // 5. Hurt: Lifetap.
      if(B.hp()<0.7&&B.can('tap')){if(B.near(tt,75))B.use('tap',tt);return}
      // 6. Nothing on you and the pet is tanking: sit for mana.
      if(!on.length){B.stop();player.sit=true;return}
      // 7. Otherwise Lifetap.
      if(B.can('tap')&&B.near(tt,75))B.use('tap',tt);
    }
  },
  rogue:{
    prep(){if(hidden())return true;if(B.can('hide'))B.use('hide');return false},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting(),on=B.onMe();
      // Escaped (version B): rest to 80% hidden, then sneak back in.
      if(!fight.length||(hidden()&&!on.length)){
        if(!hidden()){if(B.can('hide'))B.use('hide');return}
        if(B.hp()<0.8&&st.reset){B.stop();player.sit=true;return}
        st.reset=false;player.sit=false;
        if(B.near(t,14)&&B.can('backstab'))B.use('backstab',t);return}
      // Version B: after Evade, Hide right away so the mob walks home.
      if(st.escape){if(B.can('hide')){B.use('hide');st.escape=false;st.reset=true}return}
      B.near(t,14);
      // 1. Evade as damage (owner's call): Evade, then Backstab right away. Version B (escape) is kept for comparison runs.
      if(st.mode!=='B'&&on.length&&B.can('evade')){B.use('evade');return}
      if(st.mode==='B'&&B.hp()<0.35&&on.length&&B.can('evade')){B.use('evade');st.escape=true;return}
      if(dist(player,t)>18)return;
      // 2. Stunned or Evaded: Backstab from any side.
      if((t.stun>0||t.lost>0)&&B.can('backstab')){B.use('backstab',t);return}
      // 3. Gouge, then Backstab. Against a boss, save Gouge to break its bolt (the counter rule uses it when the cast starts).
      if(!t.def.boss&&B.can('gouge')){B.use('gouge',t);return}
      // 4. Rend.
      if(!B.dot(t,'rend')&&B.can('rend')){B.use('rend',t);return}
      // 5. Stab.
      if(B.can('stab'))B.use('stab',t);
    }
  },
  // ---- Batch 1 (v0.17) ----
  cleric:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting(),on=B.onMe();
      // Pull: Holy Light (level 3), then let it come. Before that, walk in and Smite.
      if(!fight.length){if(player.lvl>=3&&ABI.hlight.tgt){if(B.near(t,75)&&B.can('hlight'))B.use('hlight',t)}else if(B.near(t,14)&&B.can('smite'))B.use('smite',t);return}
      if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0)&&!(t.fear>0))B.stop();else B.near(t,14);
      // 1. Very low: Divine Aura, then Greater Heal inside it.
      if(B.hp()<0.2&&B.can('aura')){B.use('aura');return}
      if(player.buffs.aura>0){if(B.can('gheal')){B.stop();B.use('gheal')}else if(B.can('mheal')){B.stop();B.use('mheal')}return}
      // 2. Low: Greater Heal, else Minor Heal.
      if(B.hp()<0.35){if(B.can('gheal')){B.stop();B.use('gheal');return}if(B.can('mheal')){B.stop();B.use('mheal');return}}
      // 3. Taking hits and no Renew: Renew.
      if(on.length&&!B.hot('renew')&&B.can('renew')){B.use('renew');return}
      // 4. Two mobs and one is undead: Turn Undead on it, fight the other.
      if(fight.length>=2){const u=fight.find(m=>isUndead(m)&&!(m.fear>0)&&m!==t);
        if(u&&B.can('turn')&&dist(player,u)<=80){B.use('turn',u);player.target=t;return}}
      // Against undead: heal on cooldown, since every heal also burns them.
      const dead=fight.some(m=>isUndead(m)&&dist(m,player)<=40);
      if(dead&&B.hp()<0.95&&B.mp()>0.25&&B.can('mheal')){B.stop();B.use('mheal');return}
      if(dist(player,t)>18)return;
      // 5. Daze. 6. Smite.
      if(B.can('daze')){B.use('daze',t);return}
      if(B.can('smite'))B.use('smite',t);
    }
  },
  enchanter:{
    prep(){if(player.cast)return false;
      if(player.lvl>=4&&!(player.buffs.clarity>0)&&B.can('clarity')){B.use('clarity');return false}
      if(player.lvl>=2&&!pet&&B.can('blade')){B.use('blade');return false}
      return true},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      // Pull: Mind Rot on one mob.
      if(!fight.length){if(B.near(t,75)&&B.can('mrot'))B.use('mrot',t);return}
      // Fight the mob that's awake; the others sleep.
      let main=player.target;if(!main||main.dead||main.mez>0||mobs.indexOf(main)<0){main=fight.find(m=>!(m.mez>0))||fight[0];player.target=main}
      const on=B.onMe();
      // 1. An awake extra coming at you: Mesmerize it (the spell picks the extra, not your target).
      const extra=fight.filter(m=>m!==main&&!(m.mez>0)&&!m.def.boss);
      if(extra.length&&B.can('mez')&&dist(extra[0],player)<=80){B.use('mez');player.target=main;return}
      // 2. Low and two or more on you: Phantasm (level 8), else Color Flash, then back off.
      if(B.hp()<0.35&&on.length>=2){if(B.can('phantasm')){B.use('phantasm');return}if(B.can('flash')&&on.some(m=>dist(m,player)<=30)){B.use('flash');return}}
      // 3. Charm an extra your level or lower and send it at the target.
      if(fight.length>=2&&!(pet&&pet.charm)&&B.can('charm')){const c=fight.find(m=>m!==main&&m.lv<=player.lvl&&!m.def.boss&&!m.def.named&&dist(m,player)<=60);
        if(c){B.stop();B.use('charm',c);player.target=main;return}}
      // Keep away from anything hitting you while the pet works.
      const th=on.filter(m=>!(m.stun>0)).sort((a,b)=>dist(a,player)-dist(b,player))[0];
      if(th&&dist(th,player)<26)B.kite(th);else if(dist(player,main)>75)B.near(main,75);else B.stop();
      // 4. Slow Mind. 5. Mind Rot.
      if(!(main.aslow>0)&&B.can('slow')&&dist(player,main)<=80){B.use('slow',main);return}
      if(!B.dot(main,'mrot')&&B.can('mrot')&&dist(player,main)<=80){B.use('mrot',main);return}
      // 6. Sword gone and nothing on you: Animate Blade.
      if(!pet&&!on.length&&B.can('blade')){B.stop();B.use('blade');return}
      // 7. Mind Lash while mana is above half (always before the sword, level 1).
      if((B.mp()>0.5||!pet)&&B.can('mlash')&&dist(player,main)<=80){B.use('mlash',main);return}
      // 8. Otherwise let the pets work; sit if nothing is on you.
      if(!on.length&&pet){B.stop();player.sit=true}
    }
  },
  paladin:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      // Pull: Smite Undead on undead, Taunt (level 5), or walk in.
      if(!B.fighting().length){
        if(isUndead(t)&&B.can('smiteu')){if(B.near(t,75))B.use('smiteu',t);return}
        if(B.can('taunt')){if(B.near(t,38))B.use('taunt',t);return}
        if(B.near(t,14)&&B.can('pstrike'))B.use('pstrike',t);return}
      // Hold the line: once Consecrate is down, stay inside it and let mobs come.
      const g=grounds[0],inG=g&&Math.hypot(player.x-g.x,player.y-g.y)<=g.r-5;
      if(g){if(!inG){player.tx=g.x;player.ty=g.y}else B.stop()}
      else if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0))B.stop();else B.near(t,14);
      const hitting=B.onMe().filter(m=>dist(m,player)<16&&!(m.stun>0));
      // 1. Very low: Lay on Hands.
      if(B.hp()<0.2&&B.can('loh')){B.use('loh');return}
      // 2. Low: Holy Bash, then Mend while it's stunned.
      if(B.hp()<0.35){if(dist(player,t)<=18&&B.can('hbash')){B.use('hbash',t);return}
        if((!hitting.length||t.stun>0)&&B.can('pmend')){B.stop();B.use('pmend');return}}
      // 3. Undead: Smite Undead.
      if(isUndead(t)&&B.can('smiteu')&&dist(player,t)<=80){B.use('smiteu',t);return}
      // 4. Consecrate where you stand when the mob is coming or in melee.
      if(!g&&B.can('consec')&&dist(player,t)<40){B.stop();B.use('consec');return}
      // 5. Two or more next to you: Divine Strike.
      if(B.live().filter(m=>dist(m,player)<=24).length>=2&&B.can('dstrike')){B.use('dstrike');return}
      if(dist(player,t)>18)return;
      // 6. Holy Bash. 7. Strike.
      if(B.can('hbash')){B.use('hbash',t);return}
      if(B.can('pstrike'))B.use('pstrike',t);
    }
  },
  shadowknight:{
    prep(){if(player.cast)return false;if(player.lvl>=4&&!pet){if(B.can('minion'))B.use('minion');return false}return true},
    think(st){
      if(player.cast||player.fd>0)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      // Pull: Disease Cloud (level 2), then wait.
      if(!fight.length){if(B.can('disease')){if(B.near(t,75))B.use('disease',t);return}if(B.near(t,14)&&B.can('sstrike'))B.use('sstrike',t);return}
      if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0)&&!(t.fear>0))B.stop();else B.near(t,14);
      // 1. Very low: Feign Death.
      if(B.hp()<0.2&&B.can('sfeign')){B.stop();B.use('sfeign');return}
      // 2. Three or more: Terror the one with the most health. Two is fine (Dark Cleave).
      if(fight.length>=3){const big=fight.slice().sort((a,b)=>b.hp-a.hp)[0];if(!(big.fear>0)&&B.can('terror')){B.use('terror',big);player.target=fight.find(m=>m!==big)||t;return}}
      // 3. Harm Touch while the mob is healthy and you can afford the blood.
      if(t.hp/t.maxhp>0.5&&B.hp()>0.5&&B.can('harm')&&dist(player,t)<=30){B.use('harm',t);return}
      // 4. Hurt: Siphon.
      if(B.hp()<0.7&&B.can('siphon')&&dist(player,t)<=60){B.use('siphon',t);return}
      // 5. Disease Cloud on the target.
      if(!B.dot(t,'disease')&&B.can('disease')){B.use('disease',t);return}
      // 6. Two or more next to you: Dark Cleave.
      if(B.live().filter(m=>dist(m,player)<=24).length>=2&&B.can('dcleave')){B.use('dcleave');return}
      if(ABI.dcleave&&ABI.dcleave.single&&dist(t,player)<=24&&B.can('dcleave')){B.use('dcleave',t);return} // Rending Blow fork: a single-target hit, so use it on one mob too
      if(dist(player,t)>18)return;
      if(B.can('sstrike'))B.use('sstrike',t);
    }
  },
  wizard:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      // Pull: Fireball from max range (level 4), else Frost Bolt.
      if(!fight.length){if(B.near(t,75)){if(B.can('fireball'))B.use('fireball',t);else if(B.can('frost'))B.use('frost',t)}return}
      const on=B.onMe().filter(m=>!(m.root>0)&&!(m.stun>0)).sort((a,b)=>dist(a,player)-dist(b,player));
      const th=on[0],d=th?dist(th,player):999;
      // 1. Low and losing: Gate out (an escape, not a death).
      const bossM=fight.find(m=>m.def.boss),gl=bossM||t; // against a boss, judge by the boss, not one of its adds
      if(B.hp()<0.35&&gl.hp/gl.maxhp>0.4&&B.can('gate')&&d>40){B.stop();B.use('gate');return}
      // 2. Low: Mana Shield, Blink away, Freeze.
      if(B.hp()<0.35){if(!(player.buffs.mshield>0)&&B.can('mshield')){B.use('mshield');return}
        if(th&&d<20&&B.can('blink')){B.faceAway(th);B.use('blink');return}
        if(th&&B.can('freeze')){B.use('freeze',th);return}}
      // 3. Frozen and Shatter ready: Shatter.
      if(t.root>0&&B.can('shatter')){B.use('shatter',t);return}
      // 4. Close and Freeze ready: Freeze, step back, then Shatter.
      if(th&&d<26&&B.can('freeze')){B.use('freeze',th);return}
      // 5. Two or more close: Frost Nova, then Shatter the strongest.
      if(B.live().filter(m=>dist(m,player)<=34).length>=2&&B.can('nova')){B.use('nova');player.target=fight.slice().sort((a,b)=>b.hp-a.hp)[0];return}
      // Movement: kite whatever is close and free (Blink if it's on top of you); otherwise stay in range.
      if(th&&d<14&&B.can('blink')){B.faceAway(th);B.use('blink');return}
      if(th&&d<30)B.kite(th);else if(dist(player,t)>75)B.near(t,75);else B.stop();
      // 6. Far away and Fireball ready: Fireball.
      if(dist(player,t)>50&&!th&&B.can('fireball')){B.stop();B.use('fireball',t);return}
      // 7. Frost Bolt.
      if(B.can('frost')&&dist(player,t)<=80)B.use('frost',t);
    }
  },
  // ---- Batch 2 (v0.18) ----
  magician:{
    // Pick the pet for the job: Earth for two mobs or Boss 1 (or below level 2), Fire for a quick single. Flame Shield up first.
    prep(st){if(player.cast)return false;
      if(player.lvl>=6&&!(player.buffs.fshield>0)&&B.can('fshield')){B.use('fshield');return false}
      const want=(player.lvl<2||st.fight==='pair'||st.fight==='boss'||!st.fight)?'earth':'fire';
      if(!pet||pet.img!==want){if(B.can(want))B.use(want);return false}
      return true},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting(),on=B.onMe();
      // Pull: send the pet (Lash from range so it gets going).
      if(!fight.length){if(B.near(t,38)&&B.can('lash'))B.use('lash',t);return}
      // Lost the pet: back off and call Earth.
      if(!pet){const th=on.sort((a,b)=>dist(a,player)-dist(b,player))[0];
        if((!th||dist(th,player)>40)&&B.can('earth')){B.stop();B.use('earth');return}
        if(th&&dist(th,player)<30)B.kite(th);
        if(th&&B.can('lash')&&dist(th,player)<=40)B.use('lash',th);return}
      // 1. Low: Elemental Link. 2. Low with a Fire pet: back off; Detonate it if it's dying anyway, then Earth.
      if(B.hp()<0.35&&B.can('elink')){B.use('elink');return}
      if(B.hp()<0.35&&pet.img==='fire'){if(pet.hp<pet.maxhp*0.3&&B.can('detonate')){B.use('detonate');return}
        const th=on[0];if(th&&dist(th,player)<30){B.kite(th);return}}
      // 3. Pet below half: Mend Elemental.
      if(pet.hp<pet.maxhp/2&&B.can('mende')){B.stop();B.use('mende');return}
      // 4. Burnout while the mob is healthy.
      if(t.hp/t.maxhp>0.5&&B.can('burnout')){B.use('burnout');return}
      // 5. Finish a low mob with a Fire Detonate. 6. Two or more next to the pet: Detonate.
      const nearPet=B.live().filter(m=>dist(m,pet)<=30).length;
      // (An Earth pet that's holding a pair is worth more alive: only blow it up if it's about to die anyway.)
      if(B.can('detonate')&&((pet.img==='fire'&&t.hp/t.maxhp<0.25&&dist(t,pet)<=30)||(nearPet>=2&&(pet.img==='fire'||pet.hp<pet.maxhp*0.25)))){B.use('detonate');return}
      // 7. Nothing on you: sit for mana. 8. Otherwise Lash.
      if(!on.length){if(B.mp()<0.9){B.stop();player.sit=true}else if(B.near(t,38)&&B.can('lash'))B.use('lash',t);return}
      const th=on[0];if(th&&dist(th,player)<20)B.kite(th);else B.near(t,38);
      if(B.can('lash')&&dist(player,t)<=40)B.use('lash',t);
    }
  },
  ranger:{
    // Before the pull: a Spike Trap between you and the mob (the mob comes from the right in the arena).
    prep(st){if(player.lvl>=3&&!traps.length){if(B.can('trap'))B.use('trap');return false}return true},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      // Pull: Hunter's Mark, then back up so the mob runs over the trap.
      if(!fight.length){if(B.near(t,75)){if(B.can('mark'))B.use('mark',t);else if(B.can('shoot'))B.use('shoot',t)}return}
      const on=B.onMe().filter(m=>!(m.stun>0)).sort((a,b)=>dist(a,player)-dist(b,player));
      const th=on[0],d=th?dist(th,player):999;
      // Keep moving: kite anything close, otherwise stay in range. Shots go off while walking.
      if(th&&d<34)B.kite(th);else if(dist(player,t)>75)B.near(t,75);else B.stop();
      // 1. Low: Salve with nothing in melee; Disengage first if something is.
      if(B.hp()<0.35){if(th&&d<18&&B.can('disengage')){B.faceAway(th);B.use('disengage');return}if(d>30&&B.can('salve')){B.stop();B.use('salve');return}}
      // 2. In melee: Disengage.
      if(th&&d<14&&B.can('disengage')){B.use('disengage');return}
      // Mark the target if it isn't.
      if(!(t.mark>0)&&B.can('mark')&&dist(player,t)<=80){B.use('mark',t);return}
      // 3. Not snared: Ensnaring Shot.
      if(th&&!(th.snare>0)&&B.can('ensnare')){B.use('ensnare',th);return}
      // 4. Two or more: Volley. 5. Rapid Fire.
      if(fight.length>=2&&B.can('volley')&&dist(player,t)<=80){B.use('volley',t);return}
      if(B.can('rapid')){B.use('rapid');return}
      // Set a fresh trap at your feet while kiting (the mob walks through it).
      if(th&&d<40&&!traps.length&&B.can('trap')){B.use('trap');return}
      // 7. Shoot.
      if(B.can('shoot')&&dist(player,t)<=80)B.use('shoot',t);
    }
  },
  monk:{
    prep:()=>true,
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      if(player.fd>0)return; // lying down: let the split happen
      if(!st.camp)st.camp={x:player.x,y:player.y}; // where you pulled from: fight there, away from the others' home spot
      // After a split, walk back to camp so the one that stayed follows you away from the rest.
      if(st.split&&fight.length===1&&Math.hypot(player.x-st.camp.x,player.y-st.camp.y)>8){player.tx=st.camp.x;player.ty=st.camp.y;return}
      st.split=false;
      // Pull: Flying Kick (level 2), else walk in.
      if(!fight.length){if(B.can('fkick')){if(B.near(t,55))B.use('fkick',t);return}if(B.near(t,14)&&B.can('palm'))B.use('palm',t);return}
      // 1. Two or more on you: Feign Death splits your target off.
      const on=B.onMe();
      if(fight.length>=2&&B.can('mfeign')){B.stop();B.use('mfeign');st.split=true;return}
      // Losing: Feign Death with one mob drops it too (an escape, not a death).
      if(B.hp()<0.15&&fight.length===1&&t.hp/t.maxhp>0.3&&B.can('mfeign')){B.stop();B.use('mfeign');st.escaped=true;return}
      if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0))B.stop();else B.near(t,14);
      // 2. Low: Mend. 3. Low: Deflect.
      if(B.hp()<0.35&&B.can('mmend')){B.use('mmend');return}
      if(B.hp()<0.35&&on.length&&B.can('deflect')){B.use('deflect');return}
      if(dist(player,t)>18)return;
      // 4. Leg Sweep. 5. Flurry. 6. Dragon Strike. 7. Palm Strike.
      if(!t.def.boss&&B.can('sweep')){B.use('sweep',t);return} // against a boss, save it to break the bolt
      if(B.can('flurry')){B.use('flurry',t);return}
      if(B.can('dragon')){B.use('dragon',t);return}
      if(B.can('palm'))B.use('palm',t);
    }
  },
  shaman:{
    prep(){if(player.cast)return false;
      if(player.lvl>=3&&!(player.buffs.wolf>0)&&B.can('wolf')){B.use('wolf');return false}
      if(player.lvl>=6&&!(player.buffs.ward>0)&&B.can('ward')){B.use('ward');return false}
      return true},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting();
      // Pull: Sicken from max range.
      if(!fight.length){if(B.near(t,75)&&B.can('sicken'))B.use('sicken',t);return}
      const on=B.onMe().filter(m=>!(m.stun>0)).sort((a,b)=>dist(a,player)-dist(b,player));
      const th=on[0],d=th?dist(th,player):999;
      // Levels 1-3 (before Swarm): Drowsy and Sicken on it, then stand and Spear Jab.
      if(player.lvl<ABI.swarm.lvl){if(B.hp()<0.35&&B.can('sheal')){B.stop();B.use('sheal');return}
        if(!(t.aslow>0)&&B.can('drowsy')&&dist(player,t)<=80){B.use('drowsy',t);return}
        if(!B.dot(t,'sicken')&&B.can('sicken')&&dist(player,t)<=80){B.use('sicken',t);return}
        if(B.near(t,14)&&B.can('jab'))B.use('jab',t);return}
      // 1. Low: back off, then Minor Healing.
      if(B.hp()<0.4){if(d>30&&B.can('sheal')){B.stop();B.use('sheal');return}if(th)B.kite(th);}
      // 2-4. Drowsy, Sicken, Swarm on every mob in the fight.
      const inR=fight.filter(m=>dist(player,m)<=80);
      const sl=inR.find(m=>!(m.aslow>0));if(sl&&B.can('drowsy')){B.use('drowsy',sl);player.target=t;return}
      const s1=inR.find(m=>!B.dot(m,'sicken'));if(s1&&B.can('sicken')){B.use('sicken',s1);player.target=t;return}
      const s2=inR.find(m=>!B.dot(m,'swarm'));if(s2&&B.can('swarm')){B.use('swarm',s2);player.target=t;return}
      // 5. Mob close and no totem: Venom Totem at your feet, then walk away so it follows through.
      if(th&&d<30&&!grounds.length&&B.can('totem')){B.use('totem');return}
      // 6. Mana low and health fine: Cannibalize.
      if(B.mp()<0.25&&B.hp()>0.7&&B.can('canni')){B.use('canni');return}
      // 7. Everything ticking: kite and let it rot. Out of reach of the mobs, top up with a heal.
      if(th&&d<34)B.kite(th);else if(dist(player,t)>75)B.near(t,75);else B.stop();
      if(B.hp()<0.7&&d>40&&B.can('sheal')){B.stop();B.use('sheal')}
    }
  },
  bard:{
    // Before the pull: Mending + Dirge (levels 2-5), Chant of Blades + Discord (level 6+). Level 1: Mending only.
    prep(){const want=player.lvl>=6?['chant','discord']:player.lvl>=2?['smend','dirge']:['smend'];
      for(const id of want){if(!songOn(id)){if(B.can(id))B.use(id);return false}}return true},
    think(st){
      if(player.cast)return;
      const t=B.target();if(!t)return;
      const fight=B.fighting(),on=B.onMe();
      // Pull: walk in and Slash; Dirge is already hitting.
      if(!fight.length){if(B.near(t,14)&&B.can('slash'))B.use('slash',t);return}
      // Boss: kite it (EverQuest bard style). Song of Travel + Dirge, staying just inside Dirge's reach so it keeps
      // pulsing while Boss 1 never catches you; when it starts casting, run out of range.
      if(fight.some(m=>m.def.boss)&&player.lvl>=3){
        for(const id of ['travel','dirge'])if(!songOn(id)){if(B.can(id)){B.use(id);return}}
        const boss=fight.find(m=>m.def.boss);
        if(boss.casting){B.kite(boss);return}
        const near=fight.filter(m=>dist(m,player)<22);
        if(near.length)B.kite(near[0]);else if(dist(player,boss)>28)B.near(boss,24);else B.kite(boss);
        return}
      // 1. Low: swap to Mending; level 8: Crescendo with Mending playing.
      if(B.hp()<0.35){if(!songOn('smend')&&B.can('smend')){B.use('smend');return}if(songOn('smend')&&B.can('crescendo')){B.use('crescendo');return}}
      // Back to the fight songs once healthy again.
      if(B.hp()>0.7&&player.lvl>=6&&songOn('smend')){const want=['chant','discord'].find(id=>!songOn(id));if(want&&B.can(want)){B.use(want);return}}
      // 2. A second mob coming: Lullaby it.
      const extra=fight.filter(m=>m!==t&&!(m.mez>0)&&!m.def.boss);
      if(extra.length&&B.can('lullaby')&&dist(extra[0],player)<=70){B.use('lullaby');player.target=t;return}
      if(t.state==='chase'&&dist(player,t)>16&&!(t.stun>0))B.stop();else B.near(t,14);
      if(dist(player,t)>18)return;
      if(B.can('slash'))B.use('slash',t);
    }
  }
};

/* ---------- One fight ---------- */
function resetPlayer(L){
  player.lvl=L;player.xp=-1e9; // no level-ups mid-sim
  player.hp=maxHP(L);player.mp=maxMP(L);player.buffs={};player.cds={};player.gcd=0;player.cast=null;player.queued=null;
  player.sit=false;player.fd=0;player.dead=0;player.target=null;player.tx=null;player.hots=[];player.songs=[];player.bval={};player.fdKeep=null;decoy=null;grounds.length=0;traps.length=0;
  player.ward=0;player.ambush=0;player.freeSummon=0;player.fdStand=0;player.fdStill=0;
  applyForks(); // forks follow the sim's level (a level-10 fork only counts from 10)
}
// On a loss: how much health the mobs had left, all together (0.33 = a third).
const hpLeft=()=>{const a=mobs.filter(m=>m.maxhp);return a.reduce((s,m)=>s+Math.max(0,m.dead?0:m.hp),0)/(a.reduce((s,m)=>s+m.maxhp,0)||1)};
function simFight(f,L,seed,mode){
  seedRng(seed);
  pet=null;pet2=null;enterZone('arena');resetPlayer(L);
  const bot=BOTS[CLS],st={mode:mode,fight:f.id};
  // Before the pull: raise the pet, hide. Then top up, as if you'd rested.
  for(let t=0;t<15&&!bot.prep(st);t+=SIM_DT)update(SIM_DT);
  player.hp=maxHP(L);player.mp=maxMP(L);player.sit=false;
  arenaSpawn(f,L);
  const maxT=f.mobs[0]==='boss1'||f.mobs[0]==='gnaw'?420:240;
  let t=0,dmg=0,mana=0,hadPet=!!pet,petDied=false;
  while(t<maxT){
    const hp0=player.hp,mp0=player.mp;
    if(!B.counter())bot.think(st);update(SIM_DT);t+=SIM_DT;
    if(player.hp<hp0)dmg+=hp0-player.hp;if(player.mp<mp0)mana+=mp0-player.mp;
    if(hadPet&&!pet)petDied=true;
    // Wizard's Gate left the arena: an escape, not a death or a win.
    // Monk's Feign Death on a lost fight counts as an escape too, once nothing is chasing it.
    if(st.escaped&&!mobs.some(m=>!m.dead&&m.state==='chase'))return{win:false,death:false,escape:true,t:t,dmg:dmg,mana:mana,petDied:petDied,rest:0,left:hpLeft()};
    if(zoneId!=='arena')return{win:false,death:false,escape:true,t:t,dmg:dmg,mana:mana,petDied:petDied,rest:0,left:hpLeft()};
    if(player.dead>0||player.hp<=0)return{win:false,death:true,t:t,dmg:dmg,mana:mana,petDied:petDied,rest:0,left:hpLeft()};
    if(mobs.every(m=>m.dead)&&!(pet&&pet.charm))break;
  }
  const win=mobs.every(m=>m.dead)&&!(pet&&pet.charm); // a charmed mob still counts as alive
  const hpTot=mobs.reduce((s,m)=>s+(m.maxhp||0),0); // every mob's health, adds included: for damage per second
  // Rest to 80% health and mana before the next pull (sitting).
  let rest=0;
  if(win){player.target=null;player.tx=null;player.buffs.hide=0;
    while(rest<600&&(B.hp()<0.8||B.mp()<0.8)){player.sit=true;update(SIM_DT);rest+=SIM_DT}}
  return{win:win,death:false,timeout:!win,t:t,dmg:dmg,mana:mana,petDied:petDied,rest:rest,left:win?0:hpLeft(),hpTot:hpTot};
}

/* ---------- A full run for the class you're playing ---------- */
const simState={busy:false,last:null};
// Keep the real character safe while a sim runs: no saving, no gear, no god mode, chat muted; simEnd puts it all back.
function simBegin(){
  simState.busy=true; // the main loop skips its own updates while simState.busy
  const keep={lvl:player.lvl,xp:player.xp,inv:JSON.stringify(inv),kills:JSON.stringify(kills),auto:settings.autoCast,god:dev.god,set:store.set};
  store.set=function(){};logMute=true;settings.autoCast=false;dev.god=false;inv.equip={};
  return keep;
}
function simEnd(keep){
  seedRng(null);store.set=keep.set;logMute=false;settings.autoCast=keep.auto;dev.god=keep.god;pet=null;pet2=null;
  const iv=JSON.parse(keep.inv);inv.bags=iv.bags;inv.equip=iv.equip;inv.copper=iv.copper;
  Object.keys(kills).forEach(k=>delete kills[k]);Object.assign(kills,JSON.parse(keep.kills));
  if(keep.forks){forkPick=keep.forks}
  enterZone('arena');player.lvl=keep.lvl;applyForks();player.xp=keep.xp;player.hp=maxHP(keep.lvl);player.mp=maxMP(keep.lvl);
  player.buffs={};player.cds={};player.dead=0;player.target=null;
  floats.length=0;parts.length=0;beams.length=0;
  simState.busy=false;
}
// Runs every scenario for your class, one fight per tick so the phone stays responsive. Resolves with the results.
function runSim(opts){
  opts=opts||{};
  if(simState.busy||!BOTS[CLS])return Promise.resolve(null);
  const keep=simBegin();
  const seeds=opts.seeds||SIM_SEEDS,modes=SIM_MODES[CLS]||[{id:'',name:''}],jobs=[];
  const levels=opts.levels||SIM_LEVELS;
  modes.forEach(md=>levels.forEach(L=>SIM_FIGHTS.forEach(f=>{if(opts.fights&&opts.fights.indexOf(f.id)<0)return;if(!f.minL||L>=f.minL)jobs.push({md:md,L:L,f:f})})));
  const rows=[];let i=0;
  return new Promise(resolve=>{
    const step=()=>{
      if(i<jobs.length){const j=jobs[i++],rs=[];
        for(let s=0;s<seeds;s++)rs.push(simFight(j.f,j.L,1000+s,j.md.id));
        const w=rs.filter(r=>r.win),avg=(a,k)=>a.length?a.reduce((x,r)=>x+r[k],0)/a.length:0;
        rows.push({mode:j.md.name,lvl:j.L,fight:j.f.name,runs:rs.length,wins:w.length,deaths:rs.filter(r=>r.death).length,timeouts:rs.filter(r=>r.timeout).length,escapes:rs.filter(r=>r.escape).length,
          kill:avg(w,'t'),dmg:avg(rs,'dmg'),mana:avg(rs,'mana'),rest:avg(w,'rest'),left:avg(rs.filter(r=>!r.win),'left'),petDied:rs.filter(r=>r.petDied).length});
        if(opts.onProgress)opts.onProgress(i,jobs.length);
        setTimeout(step,0);return}
      simEnd(keep);
      const res={cls:CLS,name:C.name,seeds:seeds,rows:rows};
      simState.last=res;simState.lastAt=Date.now();resolve(res);
    };
    step();
  });
}
/* ---------- Fork check (v0.38): both sides of each fork against the base ability ---------- */
// The plan's rule: both sides a bit stronger than the base, about equal, better in different situations. So each side
// fights a single, a pack of three and two long named fights at the fork's level; if one side wins everywhere, redesign.
const FORK_FIGHTS=[
  {id:'single',name:'Single skeleton',mobs:['cskel']},
  {id:'pack',name:'Pack of 3 skeletons',mobs:['cskel','cskel','cskel']},
  {id:'gnaw',name:'Old Gnawbone (even level)',mobs:['gnaw'],named:1},
  {id:'king',name:'Skeleton King (even level)',mobs:['boss1'],named:1}
];
function runForkSim(opts){
  opts=opts||{};
  if(simState.busy||!BOTS[CLS])return Promise.resolve(null);
  const forks=MYFORKS.filter(f=>f.lvl<=TEST_MAX&&(!opts.only||opts.only.indexOf(f.lvl)>=0)); // opts.only: [12,14] checks just those fork levels
  const keep=simBegin();keep.forks=forkPick;
  const seeds=opts.seeds||SIM_SEEDS,jobs=[];
  forks.forEach(f=>[{id:'',name:'Base '+BASE_AB[f.ab].name}].concat(f.opts).forEach(o=>FORK_FIGHTS.forEach(fi=>jobs.push({f:f,o:o,fi:fi}))));
  const rows=[];let i=0;
  return new Promise(resolve=>{
    const step=()=>{
      if(i<jobs.length){const j=jobs[i++],rs=[],L=opts.level||j.f.lvl;
        forkPick=Object.assign({},keep.forks);if(j.o.id)forkPick[j.f.lvl]=j.o.id;else delete forkPick[j.f.lvl];
        for(let s=0;s<seeds;s++)rs.push(simFight(Object.assign({lv:L},j.fi),L,2000+s,''));
        const w=rs.filter(r=>r.win),avg=(a,k)=>a.length?a.reduce((x,r)=>x+r[k],0)/a.length:0;
        rows.push({lvl:L,side:j.o.name,fight:j.fi.name,runs:rs.length,wins:w.length,deaths:rs.filter(r=>r.death).length,kill:avg(w,'t'),
          dps:w.length?w.reduce((x,r)=>x+r.hpTot/r.t,0)/w.length:0,dmg:avg(rs,'dmg'),mana:avg(rs,'mana'),left:avg(rs.filter(r=>!r.win),'left'),petDied:rs.filter(r=>r.petDied).length});
        if(opts.onProgress)opts.onProgress(i,jobs.length);
        setTimeout(step,0);return}
      simEnd(keep);
      const res={cls:CLS,name:C.name,seeds:seeds,rows:rows};simState.lastFork=res;resolve(res);
    };
    step();
  });
}
function forkTable(res){
  const n=v=>Math.round(v),head=['Side','Fight','Win','Deaths','Kill (s)','DPS','Dmg taken','Mob HP left (losses)'];
  return '| '+head.join(' | ')+' |\n|'+head.map(()=>' --- ').join('|')+'|\n'+res.rows.map(r=>'| '+[r.side,r.fight,r.wins+'/'+r.runs,r.deaths,r.wins?n(r.kill):'–',r.wins?r.dps.toFixed(1):'–',n(r.dmg),r.wins<r.runs?n(r.left*100)+'%':'–'].join(' | ')+' |').join('\n');
}
// Results as a table: kill time, damage taken, mana used, rest time, deaths.
function simTable(res,html){
  const n=v=>Math.round(v),head=['Lvl','Fight','Win','Deaths','Kill (s)','Rest (s)','Dmg taken','Mana used','Mob HP left (losses)'];
  const body=res.rows.map(r=>[r.lvl,r.fight+(r.mode?' · '+r.mode:''),r.wins+'/'+r.runs,r.deaths+(r.escapes?' (+'+r.escapes+' escaped)':''),r.wins?n(r.kill):'–',r.wins?n(r.rest):'–',n(r.dmg),C.mana?n(r.mana):'–',r.wins<r.runs?n(r.left*100)+'%':'–']);
  if(html)return '<table class="simtab"><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr>'+body.map(b=>'<tr>'+b.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</table>';
  return '| '+head.join(' | ')+' |\n|'+head.map(()=>' --- ').join('|')+'|\n'+body.map(b=>'| '+b.join(' | ')+' |').join('\n');
}

// Short summary: the first level that wins each fight at least half the time ("beats it": a retry or two gets it done).
function simFirst(res,fightName,need){need=need||0.5;
  const r=res.rows.filter(x=>x.fight===fightName&&x.wins/x.runs>=need).sort((a,b)=>a.lvl-b.lvl)[0];return r?r.lvl:null}
function simSummary(res){
  const b=simFirst(res,'Boss 1 (lvl 7)'),p=simFirst(res,'Two skeletons',0.8);
  return 'Boss 1 first beaten (5+ wins in 10): '+(b?'level '+b:'never (by level 10)')+' · Two skeletons (8+ in 10): '+(p?'from level '+p:'never');
}

/* ---------- Zone 1 pace: how a fresh character climbs through the built areas ---------- */
// A level-1 character does laps of the built areas in the owner's order (crossroads, rat tunnel, graveyard, crypt),
// playing like a sensible player: it fights spawns from 3 levels below it up to 2 above (easiest first), walks past the
// rest, and tries a named only when it's at most 1 level above. Each fight runs in the arena at that spawn's real level
// against the character's current level. XP uses the game's own rule (xpFor), levels come at the real thresholds, and a
// death costs the real 10% plus a respawn and walk back, then one retry (a lost named waits until you level).
// Laps go on until level 8 (Wolfwood's door) or PACE_LAPS. Simplified on purpose: singles only (the maps have no social
// camps), no rares or chests, rest to 80% between pulls (like runSim), walking at straight-line distance x1.4.
const PACE_AREAS=['crossroads','rat_tunnel','graveyard','crypt'];
const PACE_GOAL=8;          // Wolfwood's first level (draft 2 ladder)
const PACE_LAPS=40;         // stop after this many laps even if the goal isn't reached
const PACE_DEATH=25;        // seconds to respawn and walk back after a death
const PACE_HOP=30;          // seconds walking from one area into the next
function paceList(id){
  const A=buildArea(id),named=A.named.map(n=>n.sp);
  const sps=A.spawns.filter(sp=>named.indexOf(sp)<0).slice().sort((a,b)=>a.lv[0]-b.lv[0]||a.lv[1]-b.lv[1]);
  return sps.concat(named).map(sp=>({type:sp.type,lv:sp.lv,x:sp.x,y:sp.y,named:named.indexOf(sp)>=0}));
}
function paceRun(seed,goal){goal=goal||PACE_GOAL;
  let L=1,xp=0,time=0,deaths=0,fights=0,kills=0;const areas=[],laps=[],lost={},namedAt={};
  const gain=n=>{if(L>=LEVEL_CAP)return;xp+=n;while(L<LEVEL_CAP&&xp>=need(L)){xp-=need(L);L++}if(L>=LEVEL_CAP)xp=0};
  const clear=(id,lap)=>{
    const t0=time,L0=L,d0=deaths,k0=kills;let px=null,py=null;time+=PACE_HOP;
    paceList(id).forEach(sp=>{
      seedRng(seed*7919+fights*31+kills*17+1);const lv=sp.lv[0]+Math.floor(rng()*(sp.lv[1]-sp.lv[0]+1));
      if(lv>L+(sp.named?1:2)||lv<L-3)return;      // too tough for now, or not worth the time: walk past
      if(sp.named&&lost[sp.type]>=L)return;          // lost to this named at this level: leave it until you ding
      if(px!==null)time+=Math.hypot(sp.x-px,sp.y-py)*1.4/PSPEED;px=sp.x;py=sp.y;
      for(let tries=0;tries<2;tries++){
        fights++;const r=simFight({mobs:[sp.type],lv:lv},L,seed*104729+fights,'');
        time+=r.t+(r.rest||0);
        if(r.win){kills++;if(sp.named&&!namedAt[sp.type])namedAt[sp.type]=L;gain(xpFor(lv,TYPES[sp.type],L));return}
        if(r.death){deaths++;xp=Math.max(0,xp-Math.floor(need(L)*0.1));time+=PACE_DEATH}
      }
      if(sp.named)lost[sp.type]=L;
    });
    if(lap===1)areas.push({area:MAPS[id].name,from:L0,to:L,pct:L>=10?0:Math.round(100*xp/need(L)),min:(time-t0)/60,deaths:deaths-d0,kills:kills-k0});
  };
  for(let lap=1;lap<=PACE_LAPS&&(lap===1||L<goal);lap++){PACE_AREAS.forEach(id=>clear(id,lap));laps.push({lap:lap,lvl:L,pct:L>=10?0:Math.round(100*xp/need(L)),min:time/60})}
  const named={};Object.keys(namedAt).forEach(k=>named[TYPES[k].name]=namedAt[k]);
  return{seed:seed,lvl:L,pct:L>=10?0:Math.round(100*xp/need(L)),min:time/60,deaths:deaths,kills:kills,areas:areas,laps:laps,named:named};
}
// Runs the pace for your class (a few seeds), one area-walk per tick. Resolves with {cls, runs}.
function runPace(opts){
  opts=opts||{};
  if(simState.busy||!BOTS[CLS])return Promise.resolve(null);
  const keep=simBegin(),seeds=opts.seeds||3,runs=[];let i=0;
  return new Promise(resolve=>{
    const step=()=>{
      if(i<seeds){runs.push(paceRun(1+i++,opts.goal));if(opts.onProgress)opts.onProgress(i,seeds);setTimeout(step,0);return}
      simEnd(keep);const res={cls:CLS,name:C.name,runs:runs};simState.lastPace=res;simState.lastPaceAt=Date.now();resolve(res);
    };
    step();
  });
}

// Pace results for the DEV panel: level after the first lap, time to level 8, deaths, and when each named first fell.
function paceSummary(res){
  const R=res.runs,avg=f=>R.reduce((a,r)=>a+f(r),0)/R.length,l1=R.map(r=>r.laps[0]);
  const nm=k=>{const v=R.map(r=>r.named[k]).filter(x=>x);return v.length?'level '+Math.min.apply(null,v)+(v.length<R.length?' ('+v.length+' of '+R.length+' runs)':''):'not by 8'};
  return '<p><b>'+res.name+', '+R.length+' runs.</b> First lap of every built area: '+Math.round(l1.reduce((a,l)=>a+l.min,0)/R.length)+' min, ends at level '+(l1.reduce((a,l)=>a+l.lvl+l.pct/100,0)/R.length).toFixed(1)+
    '. To level '+PACE_GOAL+': '+(avg(r=>r.min)/60).toFixed(1)+' h ('+avg(r=>r.laps.length).toFixed(1)+' laps), '+avg(r=>r.deaths).toFixed(1)+' deaths.</p>'+
    '<p>Level after each area, first lap: '+R[0].areas.map(a=>a.area+' '+a.to).join(' → ')+'. Old Gnawbone first beaten: '+nm('Old Gnawbone')+'. Skeleton King: '+nm('Boss 1')+'.</p>';
}

/* ---------- Watch the bot: it plays your character live in the arena ---------- */
const simWatch={on:false,st:{mode:'A'}};
function botTick(){if(!simWatch.on||zoneId!=='arena'||player.dead>0||!BOTS[CLS])return;const b=BOTS[CLS];if(!B.fighting().length&&!b.prep(simWatch.st))return;if(!B.counter())b.think(simWatch.st)}

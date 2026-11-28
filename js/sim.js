// Testing grounds (DEV only): spawn test mobs in the arena, and the sim, a bot that plays your class by its
// playbook (docs/playbooks.md) at fixed time steps with seeded randomness, so the same seed always gives the same fight.
'use strict';
/* ---------- Sim setup ---------- */
const SIM_DT=1/30;            // fixed step: 30 game ticks per second, the same on any phone
// Every level up to the cap, so you can see where a class turns the corner (and the first level it beats the Skeleton King).
const SIM_LEVELS=[1,2,3,4,5,6,7,8,9,10];
const SIM_SEEDS=10;           // fights per scenario; results are averages
// Every class fights the same mobs, set to its own level (even con) so levels compare fairly.
const SIM_FIGHTS=[
  {id:'rat',name:'Rat',mobs:['rat']},
  {id:'beetle',name:'Beetle (armored)',mobs:['beetle']},
  {id:'skel',name:'Skeleton',mobs:['cskel']},
  {id:'pair',name:'Two skeletons',mobs:['cskel','cskel']},
  {id:'boss',name:'Skeleton King (lvl 7)',mobs:['boss1'],minL:6,lv:7}, // tried from level 6 up to find the first level that beats it
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
  // lvs: each mob's own level. atPull marks the mobs there from the start (a named's guards), not ones raised mid-fight.
  return f.mobs.map((t,i)=>{const m=arenaMob(t,f.lvs?f.lvs[i]:lv,x+i*14,y+(i?14:0),f.mobs.length>1?'pair':null);if(m)m.atPull=1;return m});
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
    // Telegraphed ground (v0.76): a player steps out of rings marked under them (Ember Brand, a great wisp's Fire Ring, the
    // Prior's ripples) and back out of the Bellringer's Toll, unless a stun that reaches stops the caster first.
    const inEll=(cx,cy,r)=>Math.hypot((player.x-cx)/r,(player.y-cy)/(r*0.6))<=1;
    const hz=hazards.find(h=>h.t<h.dur&&inEll(h.x,h.y,h.r+3));if(hz){B.stepOut(hz.x,hz.y,hz.r+8);return true}
    // v0.79: the Toll only stuns close in (step back to mid range, slowed but free), and Grasp has three spots: get off the one you're on.
    const gs=x=>x.casting.spots.find(s=>inEll(s.x,s.y,GRASP.r+3));
    const tg=B.live().find(x=>x.casting&&((x.casting.toll&&dist(x,player)<TOLL.stunR+4)||(x.casting.grasp&&gs(x))));
    if(tg){const st=C.abilities.find(a=>(a.kind==='stun'||(a.kind==='fear'&&(!a.undeadOnly||isUndead(tg)))||(a.kind==='cleave'&&a.stun))&&B.can(a.id)&&dist(player,tg)<=(a.radius||a.range||18));
      if(st&&B.use(st.id,tg))return true;
      if(tg.casting.toll)B.stepOut(tg.x,tg.y,TOLL.stunR+8);else{const g=gs(tg);B.stepOut(g.x,g.y,GRASP.r+8,tg)}return true}
    // A heal cast (Mend, Malrec's Rite) is worth a stun but never worth running from.
    const hc=B.live().find(x=>x.casting&&x.casting.heal);
    if(hc){const st=C.abilities.find(a=>(a.kind==='stun'||(a.kind==='cleave'&&a.stun))&&B.can(a.id)&&dist(player,hc)<=(a.radius||a.range||18));if(st&&B.use(st.id,hc))return true}
    const m=B.live().find(x=>x.casting&&!x.casting.heal&&victim(x)===player&&!x.casting.toll&&!x.casting.grasp);if(!m)return false;
    const left=m.casting.dur-m.casting.t,d=dist(player,m);
    const a=C.abilities.find(a=>(a.kind==='stun'||(a.kind==='fear'&&(!a.undeadOnly||isUndead(m)))||(a.kind==='cleave'&&a.stun))&&B.can(a.id)&&d<=(a.radius||a.range||18));
    if(a&&B.use(a.id,m))return true;
    const need=BOLT.range+4-d;
    if(m.casting.fled&&need<=0){B.stop();return true} // made it out: wait there until the bolt falls short
    if(need>0&&(m.casting.fled||(B.hp()<0.6&&need/pSpeed()<left-0.1))){ // only worth giving up the attack when you are getting low
      m.casting.fled=true;B.kite(m);return true}
    return false;
  },
  // Walk to the nearest point r away from (cx,cy), straight out from it (backing away from the nearest mob if you stand on the centre).
  stepOut:(cx,cy,r,m)=>{let dx=player.x-cx,dy=player.y-cy,d=Math.hypot(dx,dy);
    if(d<2){const o=m&&dist(m,player)<60?m:B.onMe()[0];if(o){dx=player.x-o.x;dy=player.y-o.y}else{dx=1;dy=0}d=Math.hypot(dx,dy)||1}
    player.sit=false;let px=cx+dx/d*r,py=cy+dy/d*r;if(blocked(px,py)){px=cx-dy/d*r;py=cy+dx/d*r}player.tx=px;player.ty=py},
  // Who to hit: the current target if it's alive, else whatever is fighting you, else the nearest mob.
  // Adds first (v0.76): when a named comes with guards (there at the pull, not raised mid-fight like the King's skeletons),
  // a player kills the guards first (lowest health first, ones in reach before far ones), and Malrec's candle wisps, leaving alone anything mezzed or charmed, then turns on the named
  // (once a named is under a fifth of its health, a player finishes it).
  target:()=>{let t=player.target;if(t&&t.dead)t=null;
    if(!t||((t.def.named||t.def.boss)&&t.hp>t.maxhp*0.2)){const adds=B.live().filter(m=>((m.state==='chase'&&m.atPull)||m.def.drift)&&!m.def.named&&!m.def.boss&&!(m.mez>0)&&!m.charm); // drift: Malrec's candle wisps
      if(adds.length&&(t||B.fighting().some(m=>m.def.named||m.def.boss))){const close=adds.filter(m=>dist(m,player)<=50);return (close.length?close:adds).sort((a,b)=>a.hp-b.hp)[0]}}
    if(t)return t;const f=B.fighting();return f[0]||nearestMob(999)}
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
      const bossM=fight.find(m=>m.def.boss||m.def.named),gl=bossM||t; // against a boss, judge by the boss, not one of its adds
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
    // Pick the pet for the job: Earth for two mobs or the Skeleton King (or below level 2), Fire for a quick single. Flame Shield up first.
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
      // Something on you and the target out of reach: Lash what's on you (v0.76; kiting toward a far caster never got there).
      if(B.can('lash')&&dist(player,t)>40&&th&&dist(th,player)<=40){B.use('lash',th);return}
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
      // pulsing while the Skeleton King never catches you; when it starts casting, run out of range.
      if(fight.some(m=>m.def.boss||m.def.named)&&player.lvl>=3){ // named count as bosses (v0.76: Dungeon 1)
        for(const id of ['travel','dirge'])if(!songOn(id)){if(B.can(id)){B.use(id);return}}
        const boss=fight.find(m=>m.def.boss||m.def.named);
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
  pet=null;pet2=null;enterZone('arena');finaleReset();resetPlayer(L);
  // wade: the whole arena is knee-deep flood (v0.71: the Drowned Prior locks you in and floods his room wall to wall), so
  // you, your pet and the mobs all walk slowed, as in the game.
  if(f.wade)slowArea={w:ARENA.w,h:ARENA.h,slow:new Uint8Array(ARENA.w*ARENA.h).fill(1),rows:new Array(ARENA.h).fill('')}; // rows: wadeDepth reads them since v0.123 (no '~' = flood, full depth)
  const bot=BOTS[CLS],st={mode:mode,fight:f.id};
  // Before the pull: raise the pet, hide. Then top up, as if you'd rested.
  for(let t=0;t<15&&!bot.prep(st);t+=SIM_DT)update(SIM_DT);
  player.hp=maxHP(L);player.mp=maxMP(L);player.sit=false;
  arenaSpawn(f,L);
  const maxT=f.mobs.indexOf('malrec')>=0?600:f.mobs[0]==='boss1'||f.mobs[0]==='gnaw'||f.mobs.some(t=>TYPES[t].named)?420:240;
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
  const keep={lvl:player.lvl,xp:player.xp,inv:JSON.stringify(inv),loot:JSON.stringify(lootMem),kills:JSON.stringify(kills),auto:settings.autoCast,god:dev.god,set:store.set};
  store.set=function(){};logMute=true;settings.autoCast=false;dev.god=false;inv.equip={};
  return keep;
}
function simEnd(keep){
  finaleReset();
  seedRng(null);store.set=keep.set;logMute=false;settings.autoCast=keep.auto;dev.god=keep.god;pet=null;pet2=null;
  const iv=JSON.parse(keep.inv);inv.bags=iv.bags;inv.equip=iv.equip;inv.copper=iv.copper;inv.wear=iv.wear||{};inv.ench=iv.ench||{};{const l=JSON.parse(keep.loot);lootMem.first=l.first;lootMem.dry=l.dry}
  Object.keys(kills).forEach(k=>delete kills[k]);Object.assign(kills,JSON.parse(keep.kills));
  if(keep.forks){forkPick=keep.forks}
  enterZone('arena');player.lvl=keep.lvl;applyForks();player.xp=keep.xp;player.hp=maxHP(keep.lvl);player.mp=maxMP(keep.lvl);
  player.buffs={};player.cds={};player.dead=0;player.target=null;
  floats.length=0;parts.length=0;beams.length=0;pillars.length=0;
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
  const b=simFirst(res,'Skeleton King (lvl 7)'),p=simFirst(res,'Two skeletons',0.8);
  return 'Skeleton King first beaten (5+ wins in 10): '+(b?'level '+b:'never (by level 10)')+' · Two skeletons (8+ in 10): '+(p?'from level '+p:'never');
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

// Dungeon 1 pace (v0.63; two floors since v0.66): one run through Brother Malrec's monastery for your class at a level
// (default 15). Each camp or group on the map is one arena fight (all its mobs at once, at the map's top level for it), plus
// rest after it, plus walking between them at 1.4x the straight line. A lost fight is tried once more (25 s to run back).
// Floor 1 (catacomb, hall, the Drowned Prior), then floor 2 (the Bellringer, the wisp room, Malrec). Resolves with the
// minutes, deaths, and how each named fight went. Target (owner, Nov 21): 10-15 minutes.
function dungeonPace(L,seed,noWade){
  let t=0,deaths=0,fights=0;const named={},log=[];
  ['dungeon1','dungeon1_f2'].forEach(id=>{const A=buildArea(id),by={},order=[];let px=A.start.x,py=A.start.y;
    A.spawns.forEach(sp=>{const k=sp.group||('solo'+A.spawns.indexOf(sp));if(!by[k]){by[k]=[];order.push(k)}by[k].push(sp)});
    // nearest group next, as a player would walk it (the map's own order isn't the walking order)
    while(order.length){order.sort((a,b)=>Math.hypot(by[a][0].x-px,by[a][0].y-py)-Math.hypot(by[b][0].x-px,by[b][0].y-py));const g=by[order.shift()];
      g.sort((a,b)=>(TYPES[b.type].named?1:0)-(TYPES[a.type].named?1:0));
      const types=g.map(sp=>sp.type),lvs=g.map(sp=>sp.lv[1]); // each mob at the top of its own map level
      t+=Math.hypot(g[0].x-px,g[0].y-py)*1.4/PSPEED;px=g[0].x;py=g[0].y;
      for(let tries=0;tries<2;tries++){fights++;const r=simFight({mobs:types,lvs:lvs,wade:!noWade&&types.some(x=>TYPES[x].grasp)},L,seed*104729+fights,'');t+=r.t+(r.rest||0);
        const nm=types.find(x=>TYPES[x].named);if(nm)named[TYPES[nm].name]=(named[TYPES[nm].name]||'')+(r.win?'W':r.death?'D':'T')+Math.round(r.t)+'s ';
        log.push(types.join('+')+' '+(r.win?'win':'lose')+' '+Math.round(r.t)+'s rest '+Math.round(r.rest||0)+'s');
        if(r.win)break;deaths++;t+=PACE_DEATH}}
    const ex=A.exits.find(e=>e.name==='down');if(ex)t+=Math.hypot(ex.tx*T+8-px,ex.ty*T+8-py)*1.4/PSPEED}); // on to the stairs down
  return{min:t/60,deaths:deaths,named:named,log:log}}
function runDungeon(opts){opts=opts||{};if(simState.busy||!BOTS[CLS])return null;const keep=simBegin(),L=opts.lvl||15,runs=[];
  for(let i=0;i<(opts.seeds||2);i++)runs.push(dungeonPace(L,1+i,opts.noWade));simEnd(keep);return{cls:CLS,name:C.name,lvl:L,runs:runs}}

/* ---------- Zone 1 climb with gear (v0.137, Items lane, owner Nov 27) ---------- */
// The whole climb from level 1 to Brother Malrec, picking up and wearing gear as it drops, to time Zone 1 and size Zone 2.
// Laps of every built area in the owner's order (crossroads, rat tunnel, graveyard, crypt, Wolfwood, chapel); from level
// CLIMB_DUNGEON_LV each lap ends with a run of Dungeon 1, and the climb ends the first time Malrec falls.
// Like the pace sim: fights a spawn (or a whole camp, all at once, as the map groups them) from 3 levels below up to 2 above,
// a named at most 1 above; each fight runs in the arena at the spawn's real level; rest to 80% after a win; walking at
// straight-line x1.4; a lost fight is tried once more after a 25 s run back. New since the pace sim:
//  - drops: every kill rolls the game's own loot (lootIds, with the real area, so the cave bonus, keys and orbs count);
//    hidden chests open when you pass and they've refilled (10 min); a rare mob shows up 1 spawn in 100 where an area has one.
//  - gear: anything better for the slot goes on at once (gear:false never wears anything: the old naked numbers).
//    "Better" = a simple stat score for your class (below). Enchant orbs go on the best item when you have the fee.
//  - copper: coin per kill, junk sold, chest coin; minus enchant fees and repairs (each death wears gear 10%).
//  - named: up the first time you reach them; after that the rat tunnel's and the crypt's need their summon key, which must
//    drop from that area's mobs on that lap (the others are assumed up again by the next lap).
const CLIMB_AREAS=['crossroads','rat_tunnel','graveyard','crypt','wolfwood','chapel'];
const CLIMB_DUNGEON_LV=14;   // the monastery's mobs are 14-15
const CLIMB_HOURS=30;        // give up here
const CLIMB_KEY={rat_tunnel:'severed_paw',crypt:'crown_shard'};
// What a sensible player would call an upgrade: the stats that matter to the class, a little extra for a pink's trick.
function gearScore(id){const it=ITEMS[id];if(!it)return 0;const cas=!!C.caster;
  return (it.ac||0)*0.5+(it.sta||0)+(it.str||0)*(cas?0.3:1.3)+(it.int||0)*(cas?1.3:0.3)+(it.wis||0)*(C.mana?(cas?1:0.5):0)+(it.rar==='named'?2:0)}
// Everything in the bags that beats what's worn goes on (enchants move over when you can pay); the rest is sold or broken.
function climbEquip(st){
  inv.bags.forEach((b,i)=>{if(!b)return;const it=ITEMS[b.id];if(!it)return;
    if(it.rar==='junk'){st.copper+=it.value*b.n;inv.bags[i]=null;return}
    if(!it.slot)return; // orbs and keys stay
    const sl=it.slot,cur=inv.equip[sl];
    if(st.gear&&(!cur||gearScore(b.id)>gearScore(cur))){
      const e=inv.ench[sl]||0;inv.equip[sl]=b.id;delete inv.wear[sl];
      if(e&&st.copper>=LOOT.moveFee*e){st.copper-=LOOT.moveFee*e;st.spent+=LOOT.moveFee*e}else delete inv.ench[sl];
      st.equips.push({min:Math.round(st.time/60),lvl:st.L,id:b.id,rar:it.rar})}
    inv.bags[i]=null}); // not worn: broken into dust or sold, either way gone
  // Orbs: raise the best worn item that isn't +5 yet, if the fee is there.
  if(!st.gear)return;
  for(;;){const oi=inv.bags.findIndex(b=>b&&b.id==='orb1');if(oi<0)break;
    const sl=Object.keys(inv.equip).filter(k=>(inv.ench[k]||0)<LOOT.enchMax).sort((a,b)=>gearScore(inv.equip[b])-gearScore(inv.equip[a]))[0];
    if(!sl)break;const fee=LOOT.enchFee[inv.ench[sl]||0];if(st.copper<fee)break;
    st.copper-=fee;st.spent+=fee;inv.ench[sl]=(inv.ench[sl]||0)+1;st.enchants++;
    if(--inv.bags[oi].n<=0)inv.bags[oi]=null}
}
function climbGive(id){const it=ITEMS[id];let i=it.stack?inv.bags.findIndex(b=>b&&b.id===id):-1;
  if(i>=0)inv.bags[i].n++;else{i=inv.bags.indexOf(null);if(i<0){inv.bags.push({id:id,n:1});return}inv.bags[i]={id:id,n:1}}}
// One fight in the climb: the arena fight, then XP, coin and loot for everything you killed (lost fights keep their kills).
function climbFight(st,types,lvs,zone,wade){
  st.fights++;simState.climb=[];
  const r=simFight({mobs:types,lvs:lvs,wade:!!wade},st.L,st.seed*104729+st.fights,'');
  const killed=simState.climb;simState.climb=null;st.time+=r.t+(r.rest||0);st.fightT+=r.t;st.restT+=(r.rest||0);
  seedRng(st.seed*7919+st.fights*131+7); // loot gets its own rolls, so wearing gear can't shift the next fight's dice
  killed.forEach(k=>{st.kills++;st.gain(xpFor(k.lv,k.def,st.L));st.copper+=Math.floor(rr(0,3)+k.lv);
    if(k.noLoot||(k.type==='malrec'&&!r.win))return; // the finale's two pay nothing; Malrec's chest only opens once the finale is won
    const m={type:k.type,lv:k.lv,def:k.def};lootIds(m,zone,true).forEach(id=>{climbGive(id);const it=ITEMS[id];
      if(it.slot||it.rar==='orb'){st.drops[it.rar]=(st.drops[it.rar]||0)+1;const so=k.def.named||k.def.boss||k.def.end||NAMED_PINKS[k.type]?'named':k.def.rare?'rare':'mob';st.src[so+' '+it.rar]=(st.src[so+' '+it.rar]||0)+1;if(it.rar==='named'||it.rar==='rare')st.good.push({min:Math.round(st.time/60),lvl:st.L,id:id,from:TYPES[k.type].name})}
      if(it.rar==='key')st.keys[id]=(st.keys[id]||0)+1})});
  if(r.death){st.deaths++;st.time+=PACE_DEATH;
    Object.keys(inv.equip).forEach(sl=>{const c=ITEMS[inv.equip[sl]].value*LOOT.wearDeath/100;st.copper-=c;st.spent+=c})} // mended at the next fire
  climbEquip(st);
  return r;
}
function climbChest(st,A){const o=CHEST_ODDS[A.id];if(!o||!A.chests.length)return;
  A.chests.forEach((ch,ci)=>{const k=A.id+ci;if(st.chestAt[k]!=null&&st.time-st.chestAt[k]<CHEST_REFILL)return;st.chestAt[k]=st.time;
    seedRng(st.seed*31+st.fights*7+ci+3);const r=rng();let pool=r<o.rare?RARES:r<o.rare+o.unc?UNCOMMONS:COMMONS;if(!pool.length)pool=UNCOMMONS.length?UNCOMMONS:COMMONS;
    st.copper+=Math.floor(rr(o.cu,o.cu*2));const ids=[];if(pool.length)ids.push(pick(pool));if(rng()<LOOT.orbChest)ids.push('orb1');
    ids.forEach(id=>{climbGive(id);const it=ITEMS[id];st.drops[it.rar]=(st.drops[it.rar]||0)+1;st.src['chest '+it.rar]=(st.src['chest '+it.rar]||0)+1;st.chests++;if(it.rar==='rare')st.good.push({min:Math.round(st.time/60),lvl:st.L,id:id,from:'hidden chest'})})});
  climbEquip(st)}
// Groups as the map makes them (a camp is one pull), in the map's order; named last.
function climbGroups(A){const by={},order=[],named=A.named.map(n=>n.sp);
  A.spawns.forEach((sp,i)=>{const k=sp.group?'g'+sp.group:'s'+i;if(!by[k]){by[k]=[];order.push(k)}by[k].push(sp)});
  const gs=order.map(k=>by[k]);return gs.filter(g=>!g.some(sp=>named.indexOf(sp)>=0)).sort((a,b)=>a[0].lv[0]-b[0].lv[0]).concat(gs.filter(g=>g.some(sp=>named.indexOf(sp)>=0)))}
function climbArea(st,id,lap){
  const A=buildArea(id),zone=ZONE_OF[id],named=A.named.map(n=>n.sp),t0=st.time,L0=st.L,k0=st.kills;let px=null,py=null,visited=false;
  const keyHad=CLIMB_KEY[id]?(st.keys[CLIMB_KEY[id]]||0):0;
  climbGroups(A).forEach(g=>{
    seedRng(st.seed*7919+st.fights*31+st.kills*17+1);
    const lvs=g.map(sp=>sp.lv[0]+Math.floor(rng()*(sp.lv[1]-sp.lv[0]+1))),top=Math.max.apply(null,lvs),isN=g.some(sp=>named.indexOf(sp)>=0);
    if(top>st.L+(isN?1:2)||top<st.L-3)return;
    if(isN){const ty=g.find(sp=>named.indexOf(sp)>=0).type;
      if(st.lost[ty]>=st.L)return;
      if(st.namedSeen[ty]&&CLIMB_KEY[id]){if((st.keys[CLIMB_KEY[id]]||0)<1)return;st.keys[CLIMB_KEY[id]]--}}
    if(!visited){visited=true;st.time+=PACE_HOP;climbChest(st,A)}
    if(px!==null)st.time+=Math.hypot(g[0].x-px,g[0].y-py)*1.4/PSPEED;px=g[0].x;py=g[0].y;
    for(let tries=0;tries<2;tries++){const r=climbFight(st,g.map(sp=>sp.type),lvs,zone,false);
      if(r.win){if(isN){const ty=g.find(sp=>named.indexOf(sp)>=0).type;st.namedSeen[ty]=1;if(!st.namedAt[ty])st.namedAt[ty]={lvl:st.L,min:Math.round(st.time/60)}}
        // a rare: 1 spawn in 100 in an area that has one
        if(A.rare&&!isN){seedRng(st.seed*13+st.kills);if(rng()<RARE_CHANCE*g.length){st.rares++;climbFight(st,[A.rare.sp.type],[A.rare.sp.lv[1]],zone,false)}}
        return}}
    if(isN)st.lost[g.find(sp=>named.indexOf(sp)>=0).type]=st.L});
  if(visited)st.areaLog.push({lap:lap,area:A.name,from:L0,to:st.L,min:(st.time-t0)/60,kills:st.kills-k0});
}
// One run of Dungeon 1 at your level, nearest camp next (as dungeonPace), with loot. True if Malrec fell.
function climbDungeon(st){const t0=st.time,L0=st.L,k0=st.kills;let malrec=false;
  ['dungeon1','dungeon1_f2'].forEach(id=>{const A=buildArea(id),by={},order=[];let px=A.start.x,py=A.start.y;
    climbChest(st,A);
    A.spawns.forEach(sp=>{const k=sp.group||('solo'+A.spawns.indexOf(sp));if(!by[k]){by[k]=[];order.push(k)}by[k].push(sp)});
    while(order.length){order.sort((a,b)=>Math.hypot(by[a][0].x-px,by[a][0].y-py)-Math.hypot(by[b][0].x-px,by[b][0].y-py));const g=by[order.shift()];
      g.sort((a,b)=>(TYPES[b.type].named?1:0)-(TYPES[a.type].named?1:0));const types=g.map(sp=>sp.type),lvs=g.map(sp=>sp.lv[1]);
      st.time+=Math.hypot(g[0].x-px,g[0].y-py)*1.4/PSPEED;px=g[0].x;py=g[0].y;
      for(let tries=0;tries<2;tries++){const r=climbFight(st,types,lvs,ZONE_OF[id],types.some(x=>TYPES[x].grasp));
        if(r.win){if(types.indexOf('malrec')>=0)malrec=true;break}}}
    const ex=A.exits.find(e=>e.name==='down');if(ex)st.time+=Math.hypot(ex.tx*T+8-px,ex.ty*T+8-py)*1.4/PSPEED});
  st.dungeons.push({lvl:L0,min:(st.time-t0)/60,kills:st.kills-k0,malrec:malrec});return malrec}
function climbRun(seed,gear){
  inv.equip={};inv.wear={};inv.ench={};inv.bags=new Array(BAG_SIZE).fill(null);lootMem.first={};lootMem.dry={};
  const st={seed:seed,gear:gear!==false,L:1,xp:0,time:0,fightT:0,restT:0,deaths:0,fights:0,kills:0,copper:0,spent:0,enchants:0,chests:0,rares:0,
    drops:{},src:{},good:[],equips:[],keys:{},lost:{},namedSeen:{},namedAt:{},chestAt:{},areaLog:[],dungeons:[],levels:[{lvl:1,min:0}]};
  st.gain=n=>{if(st.L>=LEVEL_CAP)return;st.xp+=n;while(st.L<LEVEL_CAP&&st.xp>=need(st.L)){st.xp-=need(st.L);st.L++;st.levels.push({lvl:st.L,min:Math.round(st.time/60),kills:st.kills})}if(st.L>=LEVEL_CAP)st.xp=0};
  let done=false,lap=0;
  while(!done&&st.time<CLIMB_HOURS*3600){lap++;
    CLIMB_AREAS.forEach(id=>{if(!done)climbArea(st,id,lap)});
    if(st.L>=CLIMB_DUNGEON_LV)done=climbDungeon(st)}
  const worn={};Object.keys(inv.equip).forEach(sl=>worn[sl]={id:inv.equip[sl],name:ITEMS[inv.equip[sl]].name,rar:ITEMS[inv.equip[sl]].rar,ench:inv.ench[sl]||0});
  const named={};Object.keys(st.namedAt).forEach(k=>named[TYPES[k].name]=st.namedAt[k]);
  return{seed:seed,gear:st.gear,malrec:done,laps:lap,hours:st.time/3600,fightH:st.fightT/3600,restH:st.restT/3600,lvl:st.L,deaths:st.deaths,fights:st.fights,kills:st.kills,
    copper:Math.round(st.copper),spent:Math.round(st.spent),enchants:st.enchants,chests:st.chests,rares:st.rares,drops:st.drops,src:st.src,good:st.good,equips:st.equips,worn:worn,named:named,
    levels:st.levels,areas:st.areaLog,dungeons:st.dungeons,stats:{ac:stat('ac'),sta:stat('sta'),str:stat('str'),int:stat('int'),wis:stat('wis')}};
}
// Runs the climb for your class. Headless only (it takes minutes): __game.runClimb({seeds:1,gear:true}).
function runClimb(opts){opts=opts||{};if(simState.busy||!BOTS[CLS])return null;const keep=simBegin(),runs=[];
  try{for(let i=0;i<(opts.seeds||1);i++)runs.push(climbRun((opts.seed0||1)+i,opts.gear))}finally{simState.climb=null;simEnd(keep)}
  return{cls:CLS,name:C.name,caster:!!C.caster,runs:runs}}

// Pace results for the DEV panel: level after the first lap, time to level 8, deaths, and when each named first fell.
function paceSummary(res){
  const R=res.runs,avg=f=>R.reduce((a,r)=>a+f(r),0)/R.length,l1=R.map(r=>r.laps[0]);
  const nm=k=>{const v=R.map(r=>r.named[k]).filter(x=>x);return v.length?'level '+Math.min.apply(null,v)+(v.length<R.length?' ('+v.length+' of '+R.length+' runs)':''):'not by 8'};
  return '<p><b>'+res.name+', '+R.length+' runs.</b> First lap of every built area: '+Math.round(l1.reduce((a,l)=>a+l.min,0)/R.length)+' min, ends at level '+(l1.reduce((a,l)=>a+l.lvl+l.pct/100,0)/R.length).toFixed(1)+
    '. To level '+PACE_GOAL+': '+(avg(r=>r.min)/60).toFixed(1)+' h ('+avg(r=>r.laps.length).toFixed(1)+' laps), '+avg(r=>r.deaths).toFixed(1)+' deaths.</p>'+
    '<p>Level after each area, first lap: '+R[0].areas.map(a=>a.area+' '+a.to).join(' → ')+'. Old Gnawbone first beaten: '+nm('Old Gnawbone')+'. Skeleton King: '+nm('Skeleton King')+'.</p>';
}

/* ---------- Watch the bot: it plays your character live in the arena ---------- */
const simWatch={on:false,st:{mode:'A'}};
function botTick(){if(!simWatch.on||zoneId!=='arena'||player.dead>0||!BOTS[CLS])return;const b=BOTS[CLS];if(!B.fighting().length&&!b.prep(simWatch.st))return;if(!B.counter())b.think(simWatch.st)}

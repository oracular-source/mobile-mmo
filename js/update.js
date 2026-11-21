// One step of game time: movement, mob AI, DoTs, regen, cooldowns.
'use strict';
/* ---------- Update ---------- */
function update(dt){
  // Dead: you stay down until you tap Respawn on the death panel (v0.37; was 3 seconds).
  if(!(player.dead>0)){
    // Movement: joystick drag or keyboard steers; otherwise walk to a tapped point.
    let mx=0,my=0;
    if(settings.move==='hold'&&joy.id!==null&&(joy.active||performance.now()-joy.t0>HOLD_MS)){
      // Hold to move: walk toward wherever your finger is pressing.
      const r=cv.getBoundingClientRect(),wx=camX+(joy.cx-r.left)*dpr/S,wy=camY+(joy.cy-r.top)*dpr/S,dx=wx-player.x,dy=wy-(player.y-6);
      if(Math.hypot(dx,dy)>5){mx=dx;my=dy}
    }else if(joy.active){const d=Math.hypot(joy.dx,joy.dy);if(d>0){mx=joy.dx/d;my=joy.dy/d}}
    if(keys.w||keys.arrowup)my-=1;if(keys.s||keys.arrowdown)my+=1;if(keys.a||keys.arrowleft)mx-=1;if(keys.d||keys.arrowright)mx+=1;
    // Held by Grasp of the Deep or stunned by the Toll (v0.63): no walking until it wears off.
    if(player.held>0||player.stunT>0){player.held=Math.max(0,(player.held||0)-dt);player.stunT=Math.max(0,(player.stunT||0)-dt);mx=0;my=0;player.tx=null}
    const steering=mx!==0||my!==0;if(steering)player.lastMove={x:mx,y:my}; // which way you were heading when you took an exit
    if(player.fd>0){player.fd-=dt;if(steering||player.tx!==null){player.fd=0;log('You get back up.','#9aa')}
      // Still Water (Monk fork): health and mana come back fast while you lie there.
      if(player.fd>0&&player.fdStill){player.hp=Math.min(maxHP(player.lvl),player.hp+maxHP(player.lvl)*player.fdStill*dt);player.mp=Math.min(maxMP(player.lvl),player.mp+maxMP(player.lvl)*player.fdStill*dt)}
      // Perfect Split (Monk fork): standing up stuns the mob you kept.
      if(!(player.fd>0)&&player.fdStand){const k=player.fdKeep;if(k&&!k.dead){k.stun=player.fdStand*durMult(k);k.mez=0;floatText(k.x,k.y-26,'STUNNED','#9fb8e0')}player.fdStand=0}}
    if(steering&&!(player.fd>0)){const d=Math.hypot(mx,my);player.fx=mx/d;player.fy=my/d;player.tx=null;player.sit=false;moveToward(player,player.x+mx/d*20,player.y+my/d*20,pSpeed(),dt);}
    else if(player.tx!==null){const fd=Math.hypot(player.tx-player.x,player.ty-player.y);if(fd>1){player.fx=(player.tx-player.x)/fd;player.fy=(player.ty-player.y)/fd}if(moveToward(player,player.tx,player.ty,pSpeed(),dt))player.tx=null;}
    if(player.cast&&(steering||player.tx!==null)){player.cast=null;log('Your spell is interrupted. Stand still to cast.','#ffb37a')}
    if(player.cast){player.cast.time+=dt;const a=player.cast.a,t=player.cast.t;
      if(player.cast.time>=a.cast){player.cast=null;
        if(a.tgt&&(!t||t.dead)){log('Your target is gone.','#9aa')}
        else if(a.tgt&&dist(player,t)>a.range*1.2){log('Your target moved out of range.','#ff8a80')}
        else if(a.mana&&player.mp<a.mana){log('Not enough mana.','#ff8a80')}
        else{player.mp-=a.mana;player.cds[a.id]=cdFor(a);applyAbility(a,t)}}}
    player.gcd=Math.max(0,player.gcd-dt);
    for(const k in player.cds)player.cds[k]=Math.max(0,player.cds[k]-dt);
    // Auto-cast: whenever your target is in range, the main spell repeats when it's ready, even if the mob hasn't noticed you
    // (v0.33.3, owner: run past and hit things). Not from Hide (a Rogue's Backstab opener) or Feign Death and not on a sleeping mob.
    // Normal mana cost. Pauses below 15% mana so there's always enough left to heal.
    // A spell you tapped during the cooldown goes first; auto-cast waits its turn.
    if(player.queued&&(time>player.queued.until||player.dead))player.queued=null;
    if(player.queued&&!player.cast&&player.gcd<=0){const q=player.queued.a;player.queued=null;cast(q);}
    const tg=player.target;
    if(!player.queued&&settings.autoCast&&tg&&!tg.dead&&!hidden()&&!(player.fd>0)&&!(tg.lost>0)&&!(tg.mez>0)&&!player.cast&&player.gcd<=0&&!player.sit&&dist(player,tg)<=(ABI[loadout[0]].range||80)&&(!C.mana||player.mp>maxMP(player.lvl)*0.15))castSlot(0,true);
    const fight=inCombat(),L=player.lvl,fire=player.sit&&nearFire()?2:1,f=(1+L*0.1)*fire;
    if(!fight)player.lsUsed=false; // Last Stand comes back once the fight is over
    if(fire>1&&!player.warmed){player.warmed=true;log("The fire's warmth speeds your rest.",'#ffb347')}if(!player.sit)player.warmed=false;
    // Out of combat (owner, Nov 18: no potions in this game): health and mana come back fast,
    // about 5% a second standing (full in ~20s) and 12% sitting (full in ~8s); the campfire doubles it.
    // In a fight the old slow rates stay, so fight balance and the sim's fight numbers don't move.
    const clar=player.buffs.clarity>0?1.5:1; // Clarity: +50% mana regen
    if(fight)player.mp=Math.min(maxMP(L),player.mp+(player.sit?4:1)*f*clar*dt);
    else player.mp=Math.min(maxMP(L),player.mp+maxMP(L)*(player.sit?0.12:0.05)*fire*clar*dt);
    // Heals over time (Cleric's Renew) tick every 2s; each tick also burns nearby undead.
    if(player.hots&&player.hots.length)for(let i=player.hots.length-1;i>=0;i--){const o=player.hots[i];o.t-=dt;o.next-=dt;
      if(o.next<=0){o.next+=2;const h=Math.round(o.heal*rr(0.9,1.1));player.hp=Math.min(maxHP(L),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#7dffa6');if(o.holy)holyPulse(o.heal*o.holy,o.name,o.holyAll);}
      if(o.t<=0)player.hots.splice(i,1);}
    if(!fight)player.hp=Math.min(maxHP(L),player.hp+maxHP(L)*(player.sit?0.12:0.05)*fire*dt);
    for(const k in player.buffs)player.buffs[k]=Math.max(0,player.buffs[k]-dt);
    if(player.ward>0)player.ward-=dt; // Warding Renew's block lasts as long as the Renew
    // Level 12 and 14 fork timers (v0.44).
    if(player.vshieldT>0){player.vshieldT-=dt;if(player.vshieldT<=0)player.vshield=0} // Verdant Touch's shield fades
    if(player.kidneyT>0){player.kidneyT-=dt;if(player.kidneyT<=0)player.kidney=0}
    if(player.spareT>0)player.spareT-=dt; // Double Hop's stored hop comes back
    if(player.wrathT>0){player.wrathT-=dt;if(player.wrathT<=0&&player.wrath){const w=player.wrath; // Divine Wrath: the aura ends in a blast
      burst(player.x,player.y-6,'#ffd27a',22,true);floatText(player.x,player.y-30,'DIVINE WRATH','#ffd27a',true);
      mobs.filter(m=>!m.dead&&dist(m,player)<=w.r).forEach(m=>hitMob(m,w.dmg*(isUndead(m)?1.5:1)*rr(0.9,1.1)*(1-m.def.armor),'direct','Divine Wrath'))}}
    if(player.drainM){const dm=player.drainM.m;if(dm.dead||!(dm.aslow>0)||mobs.indexOf(dm)<0)player.drainM=null;else player.mp=Math.min(maxMP(L),player.mp+maxMP(L)*player.drainM.x*dt)} // Mind Drain
    if(!fight)player.tempo=0; // Battle Tempo starts over each fight
    // Bard songs pulse every 3s while they play: walking, fighting or sitting.
    if(player.songs&&player.songs.length){player.songNext-=dt;if(player.songNext<=0){player.songNext+=3;player.songs.forEach(id=>songPulse(ABI[id],1))}}
  }
  rangeShow=Math.max(0,rangeShow-dt);
  // Holy ground (Paladin's Consecrate): once a second, heals you if you stand in it and burns undead inside.
  // Venom Totem and Volley ("all") hurt any mob that's fighting you inside them; idle mobs aren't pulled.
  for(let i=grounds.length-1;i>=0;i--){const g=grounds[i];g.t-=dt;g.next-=dt;
    if(g.next<=0){g.next+=g.every||1;
      if(g.heal&&!player.dead&&Math.hypot(player.x-g.x,player.y-g.y)<=g.r){const h=Math.max(1,Math.round(g.heal));player.hp=Math.min(maxHP(player.lvl),player.hp+h);floatText(player.x,player.y-22,'+'+h,'#ffd27a')}
      // Mending Totem (Shaman fork) poisons only the nearest mob; Pinning Volley (Ranger fork) roots each mob once.
      const inG=mobs.filter(m=>!m.dead&&m.state==='chase'&&Math.hypot(m.x-g.x,m.y-g.y)<=g.r).sort((a,b)=>Math.hypot(a.x-g.x,a.y-g.y)-Math.hypot(b.x-g.x,b.y-g.y));
      (g.one?inG.slice(0,1):inG).forEach(m=>{
        if(g.pin&&g.pinned.indexOf(m)<0){g.pinned.push(m);m.root=Math.max(m.root||0,g.pin*durMult(m));floatText(m.x,m.y-26,'PINNED','#e8e2cf')}
        if(g.all)hitMob(m,g.dmg*rr(0.9,1.1)*(1-m.def.armor),'dot',g.name);else if(isUndead(m))hitMob(m,g.dmg*rr(0.9,1.1),'holy',g.name)});}
    if(g.t<=0){grounds.splice(i,1);log((g.name==='Consecrate'?'The holy ground':'Your '+g.name)+' fades.','#9aa')}}
  // Spike Traps: the first mob to step in sets it off.
  for(let i=traps.length-1;i>=0;i--){const tr=traps[i];tr.t-=dt;
    const m=mobs.find(m=>!m.dead&&Math.hypot(m.x-tr.x,m.y-tr.y)<=12); // 12: mobs stop about 11px from you to swing, so a trap at your feet still catches them
    if(m){traps.splice(i,1);burst(tr.x,tr.y-2,'#cfc8b2',10,true);floatText(m.x,m.y-28,'SNAP!','#ffd27a');
      // Blast Trap (Ranger fork): hits every mob near the trap and knocks them back from it.
      const hit=tr.blast?mobs.filter(o=>!o.dead&&Math.hypot(o.x-tr.x,o.y-tr.y)<=tr.blast):[m];
      hit.forEach(o=>{hitMob(o,tr.dmg*rr(0.9,1.1)*(1-o.def.armor),'direct',tr.name);if(!o.dead&&tr.knock&&!o.def.boss)knockBack(o,tr.knock,tr.x,tr.y)});
      if(!m.dead){m.dots=m.dots.filter(d=>d.id!=='bleed');m.dots.push({id:'bleed',name:'Bleed',t:tr.bleedT||12,next:3,dmg:tr.bleed})}}
    else if(tr.t<=0){traps.splice(i,1);log('Your '+tr.name+' rusts away.','#9aa')}}
  if(decoy){decoy.t-=dt;if(decoy.t<=0){burst(decoy.x,decoy.y-6,'#c8a0ff',8);decoy=null;log('Your Phantasm fades.','#9aa')}}
  if(zoneId==='over'){updateNPCs(dt);updateCritters(dt);}
  {const CAc=curArea();if(CAc)updateAreaCritters(CAc,dt);} // area critters (v0.49)
  if(!player.dead)checkPortals();
  updatePet(dt);
  spawns.forEach(sp=>{if(!sp.mob){sp.timer-=dt;if(sp.timer<=0){spawn(sp);rollRare(curArea())}}}); // every respawn has a small chance to bring out the area's rare
  mobs.forEach(m=>{
    if(m.dead)return;
    for(let i=m.dots.length-1;i>=0;i--){const d=m.dots[i];d.t-=dt;d.next-=dt;
      // Shaman's small stacking bonus: each DoT ticks 10% harder for every other DoT on the same mob.
      // Thornsnare ticks only while the mob is walking (not while it stands and swings, or is held).
      if(d.next<=0&&d.walk&&(m.root>0||m.stun>0||m.mez>0||m.state!=='chase'||dist(m,victim(m))<=12)){d.next+=3}
      else if(d.next<=0){d.next+=3;const sx=C.dotStack&&!d.pet?1+C.dotStack*(m.dots.filter(o=>!o.pet).reduce((n,o)=>n+(o.cnt||1),0)-(d.cnt||1)):1; // Stinging Swarm counts as two
        const ds=d.id==='mrot'&&m.aslow>0&&m.deepSlow?m.deepSlow:1; // Deep Slow (Enchanter fork): Mind Rot hits harder on a slowed mob
        hitMob(m,d.dmg*sx*ds*rr(0.9,1.1),'dot',d.name||'Creeping Rot',d.pet?'pet':undefined);if(m.dead)return;}
      if(d.t<=0){m.dots.splice(i,1);if(d.boom){bombGo(m,d);if(m.dead)return}log((d.name||'Creeping Rot')+' on '+m.def.name+' wears off.','#9aa')}}
    if(m.root>0){m.root-=dt;if(m.root<=0)log('The root on '+m.def.name+' wears off.','#ffb37a')}
    if(m.snare>0){m.snare-=dt;if(m.snare<=0)log('The snare on '+m.def.name+' wears off.','#9aa')}
    if(m.aslow>0)m.aslow-=dt;
    if(m.discord>0)m.discord-=dt;
    if(m.calm>0)m.calm-=dt;
    if(m.weak&&m.weak.t>0)m.weak.t-=dt; // Judgment / Rebuke
    if(m.crack>0)m.crack-=dt; // Sunder
    if(m.tiger>0)m.tiger-=dt; // Tiger Leap's window
    if(m.chill>0){m.chillT-=dt;if(m.chillT<=0)m.chill=0}
    if(m.chantT>0)m.chantT-=dt; // a chanter's song (v0.62)
    if(m.casting&&(m.mez>0||m.stun>0||m.fear>0||m.lost>0||m.state!=='chase'||player.dead))interruptCast(m);
    if(m.mez>0){m.mez-=dt;if(m.mez<=0)log(cap(m.def.name)+' wakes up.','#ffb37a');return;} // asleep: stands still until hit or the mez ends
    if(m.stun>0){m.stun-=dt;return;} // stunned: no moving, no attacking
    const spd=m.def.spd*(m.snare>0?0.5:1)*(m.root>0?0:1)*(1-0.12*(m.chill||0)); // each chill stack: -12% speed
    if(m.state==='drift'){wispDrift(m,dt,spd);return} // a candle wisp drifting to Brother Malrec (v0.63)
    if(m.state==='idle'){
      if(m.sp.route)walkRoute(m,dt); // Greyfang walks his loop
      else if(m.sp.follow&&m.sp.follow.mob&&!m.sp.follow.mob.dead){const L=m.sp.follow.mob;m.wx=L.x+m.sp.fo.x;m.wy=L.y+m.sp.fo.y;pathTo(m,m.wx,m.wy,m.def.spd*0.5,dt);m.hx=m.x;m.hy=m.y} // pack wolves keep at his side
      else{m.wt-=dt;if(m.wt<=0){m.wt=rr(2,6);m.wx=m.hx+rr(-20,20);m.wy=m.hy+rr(-14,14);if(blocked(m.wx,m.wy)){m.wx=m.hx;m.wy=m.hy}}
      moveToward(m,m.wx,m.wy,m.def.spd*0.35,dt);}
      if(!player.dead&&!(player.fd>0)&&!hidden()&&!(m.calm>0)&&dist(m,player)<m.def.aggro&&m.lv>player.lvl-3){engage(m);log(cap(m.def.name)+' notices you!','#ffb37a')}
      else if(pet&&dist(m,pet)<m.def.aggro*0.8&&m.lv>player.lvl-3){engage(m,true);log(cap(m.def.name)+' notices your skeleton!','#ffb37a')}
    }else if(m.state==='chase'){
      if(player.dead){m.state='return';return}
      if(m.fear>0){m.fear-=dt;const dx=m.x-player.x,dy=m.y-player.y,dd=Math.hypot(dx,dy)||1;if(spd>0)moveToward(m,m.x+dx/dd*20,m.y+dy/dd*20,spd*0.7,dt);return} // feared: runs from you
      // Evaded: stands confused, doesn't turn or attack. If you Hide meanwhile, it gives up and walks home.
      if(m.lost>0){m.lost-=dt;if(hidden()){m.lost=0;m.state='return';m.threat.p=0;log(cap(m.def.name)+' loses track of you.','#9aa')}return}
      const v=victim(m);
      if(v===player&&player.fd>0&&m!==player.fdKeep){m.state='idle';m.wx=m.x;m.wy=m.y;m.threat.p=0;return} // fooled by Feign Death; stays where it is, no heal
      const d=dist(m,v);
      if(m.def.adds)namedAdds(m);
      if(m.def.callAt&&rareCall(m,dt,spd))return; // the Pale Rat running for help
      if(m.def.boss&&bossThink(m,dt))return;if(m.dead||player.dead)return; // casting: stands still
      // Dungeon 1 (v0.63): healers, the Prior's Grasp of the Deep, the Bellringer's Toll, Malrec's Candle Wake.
      if(m.def.wake)candleWake(m);
      if(m.def.heal&&healThink(m,dt))return;if(m.dead||player.dead)return;
      if(m.def.grasp&&graspThink(m,dt))return;if(m.dead||player.dead)return;
      if(m.def.toll&&tollThink(m,dt))return;if(m.dead||player.dead)return;
      if(m.def.cast&&mobCast(m,dt))return;if(m.dead||player.dead)return; // chapel casters (v0.62): stand still while the bar fills
      if(m.def.chant)chantThink(m,dt);if(m.def.brand)brandThink(m,dt);if(m.def.blink)wispBlink(m,dt);
      if(m.def.flee&&wolfFlee(m,dt,spd))return; // a wolf running off at low health
      if(m.def.charge&&boarCharge(m,v,d,dt,spd))return; // the boar lowering its head or rushing in
      if(d>11){if(spd>0)pathTo(m,v.x,v.y,spd,dt)} // around trees and walls, not into them (js/path.js)
      else{m.dir=v.x>m.x?1:-1;m.atk-=dt;if(m.atk<=0){m.atk=2*(m.aslow>0?(m.aslowX||1.6):1)*(m.discord>0?1.25:1); // Slow Mind 60% slower, Drowsy 40%, Bard's Discord 25%
        if(v===decoy){floatText(decoy.x,decoy.y-20,'miss','#c8a0ff')}else if(v===pet||v===pet2)hurtPet(m,v);else hurtPlayer(m)}}
    }else if(m.state==='return'){
      if(pathTo(m,m.hx,m.hy,m.def.spd*1.6,dt)||Math.hypot(m.x-m.hx,m.y-m.hy)<3){m.state='idle';m.hp=m.maxhp;m.root=0;m.snare=0;m.aslow=0;m.chill=0;m.mark=0;m.weak=null;m.crack=0;m.ruin=0;m.fled=false;m.fleeT=0;m.fleeTo=null;m.rush=false;m.wind=0;m.howled=false;m.shouted=false;m.chantT=0;m.casting=null;m.bolt=undefined;m.brandCd=undefined;m.healCd=undefined;m.graspCd=undefined;m.tollCd=undefined;m.wakes=0}
    }
  });
  updateHazards(dt);
  for(let i=hands.length-1;i>=0;i--){hands[i].t+=dt;if(hands[i].t>hands[i].life)hands.splice(i,1)}
  for(let i=rings.length-1;i>=0;i--){rings[i].t+=dt;if(rings[i].t>rings[i].life)rings.splice(i,1)}
  for(let i=floats.length-1;i>=0;i--){floats[i].t+=dt;if(floats[i].t>(floats[i].life||1.1))floats.splice(i,1)}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t>p.life)parts.splice(i,1)}
  for(let i=beams.length-1;i>=0;i--){beams[i].t+=dt;if(beams[i].t>0.15)beams.splice(i,1)}
}

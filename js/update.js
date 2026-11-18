// One step of game time: movement, mob AI, DoTs, regen, cooldowns.
'use strict';
/* ---------- Update ---------- */
function update(dt){
  if(player.dead>0){player.dead-=dt;if(player.dead<=0)respawnPlayer();}
  else{
    // Movement: joystick drag or keyboard steers; otherwise walk to a tapped point.
    let mx=0,my=0;
    if(settings.move==='hold'&&joy.id!==null&&(joy.active||performance.now()-joy.t0>HOLD_MS)){
      // Hold to move: walk toward wherever your finger is pressing.
      const r=cv.getBoundingClientRect(),wx=camX+(joy.cx-r.left)*dpr/S,wy=camY+(joy.cy-r.top)*dpr/S,dx=wx-player.x,dy=wy-(player.y-6);
      if(Math.hypot(dx,dy)>5){mx=dx;my=dy}
    }else if(joy.active){const d=Math.hypot(joy.dx,joy.dy);if(d>0){mx=joy.dx/d;my=joy.dy/d}}
    if(keys.w||keys.arrowup)my-=1;if(keys.s||keys.arrowdown)my+=1;if(keys.a||keys.arrowleft)mx-=1;if(keys.d||keys.arrowright)mx+=1;
    const steering=mx!==0||my!==0;
    if(player.fd>0){player.fd-=dt;if(steering||player.tx!==null){player.fd=0;log('You get back up.','#9aa')}}
    if(steering&&!(player.fd>0)){const d=Math.hypot(mx,my);player.tx=null;player.sit=false;moveToward(player,player.x+mx/d*20,player.y+my/d*20,pSpeed(),dt);}
    else if(player.tx!==null){if(moveToward(player,player.tx,player.ty,pSpeed(),dt))player.tx=null;}
    if(player.cast&&(steering||player.tx!==null)){player.cast=null;log('Your spell is interrupted. Stand still to cast.','#ffb37a')}
    if(player.cast){player.cast.time+=dt;const a=player.cast.a,t=player.cast.t;
      if(player.cast.time>=a.cast){player.cast=null;
        if(a.tgt&&(!t||t.dead)){log('Your target is gone.','#9aa')}
        else if(a.tgt&&dist(player,t)>a.range*1.2){log('Your target moved out of range.','#ff8a80')}
        else if(a.mana&&player.mp<a.mana){log('Not enough mana.','#ff8a80')}
        else{player.mp-=a.mana;player.cds[a.id]=cdFor(a);applyAbility(a,t)}}}
    player.gcd=Math.max(0,player.gcd-dt);
    for(const k in player.cds)player.cds[k]=Math.max(0,player.cds[k]-dt);
    // Auto-cast: once you're fighting your target, the main (center) spell repeats whenever it's ready.
    // Normal mana cost. Pauses below 15% mana so there's always enough left to heal.
    // A spell you tapped during the cooldown goes first; auto-cast waits its turn.
    if(player.queued&&(time>player.queued.until||player.dead))player.queued=null;
    if(player.queued&&!player.cast&&player.gcd<=0){const q=player.queued.a;player.queued=null;cast(q);}
    const tg=player.target;
    if(!player.queued&&settings.autoCast&&tg&&!tg.dead&&tg.state==='chase'&&!(tg.lost>0)&&!player.cast&&player.gcd<=0&&!player.sit&&dist(player,tg)<=(ABI[loadout[0]].range||80)&&(!C.mana||player.mp>maxMP(player.lvl)*0.15))castSlot(0,true);
    const fight=inCombat(),L=player.lvl,fire=player.sit&&nearFire()?2:1,f=(1+L*0.1)*fire;
    if(fire>1&&!player.warmed){player.warmed=true;log("The fire's warmth speeds your rest.",'#ffb347')}if(!player.sit)player.warmed=false;
    player.mp=Math.min(maxMP(L),player.mp+(player.sit?4:1)*f*dt);
    if(!fight)player.hp=Math.min(maxHP(L),player.hp+(player.sit?3:0.8)*f*C.regen*dt);
    for(const k in player.buffs)player.buffs[k]=Math.max(0,player.buffs[k]-dt);
  }
  rangeShow=Math.max(0,rangeShow-dt);
  if(zoneId==='over'){updateNPCs(dt);updateCritters(dt);}
  if(!player.dead)checkPortals();
  updatePet(dt);
  spawns.forEach(sp=>{if(!sp.mob){sp.timer-=dt;if(sp.timer<=0)spawn(sp)}});
  mobs.forEach(m=>{
    if(m.dead)return;
    for(let i=m.dots.length-1;i>=0;i--){const d=m.dots[i];d.t-=dt;d.next-=dt;
      if(d.next<=0){d.next+=3;hitMob(m,d.dmg*rr(0.9,1.1),'dot',d.name||'Creeping Rot');if(m.dead)return;}
      if(d.t<=0){m.dots.splice(i,1);log((d.name||'Creeping Rot')+' on '+m.def.name+' wears off.','#9aa')}}
    if(m.root>0){m.root-=dt;if(m.root<=0)log('The root on '+m.def.name+' wears off.','#ffb37a')}
    if(m.snare>0){m.snare-=dt;if(m.snare<=0)log('The snare on '+m.def.name+' wears off.','#9aa')}
    if(m.stun>0){m.stun-=dt;return;} // stunned: no moving, no attacking
    const spd=m.def.spd*(m.snare>0?0.5:1)*(m.root>0?0:1);
    if(m.state==='idle'){
      m.wt-=dt;if(m.wt<=0){m.wt=rr(2,6);m.wx=m.hx+rr(-20,20);m.wy=m.hy+rr(-14,14);if(blocked(m.wx,m.wy)){m.wx=m.hx;m.wy=m.hy}}
      moveToward(m,m.wx,m.wy,m.def.spd*0.35,dt);
      if(!player.dead&&!(player.fd>0)&&!hidden()&&dist(m,player)<m.def.aggro&&m.lv>player.lvl-3){engage(m);log(cap(m.def.name)+' notices you!','#ffb37a')}
      else if(pet&&dist(m,pet)<m.def.aggro*0.8&&m.lv>player.lvl-3){engage(m,true);log(cap(m.def.name)+' notices your skeleton!','#ffb37a')}
    }else if(m.state==='chase'){
      if(player.dead){m.state='return';return}
      if(m.fear>0){m.fear-=dt;const dx=m.x-player.x,dy=m.y-player.y,dd=Math.hypot(dx,dy)||1;if(spd>0)moveToward(m,m.x+dx/dd*20,m.y+dy/dd*20,spd*0.7,dt);return} // feared: runs from you
      // Evaded: stands confused, doesn't turn or attack. If you Hide meanwhile, it gives up and walks home.
      if(m.lost>0){m.lost-=dt;if(hidden()){m.lost=0;m.state='return';m.threat.p=0;log(cap(m.def.name)+' loses track of you.','#9aa')}return}
      const v=victim(m);
      if(v===player&&player.fd>0){m.state='idle';m.wx=m.x;m.wy=m.y;m.threat.p=0;return} // fooled by Feign Death; stays where it is, no heal
      const d=dist(m,v);
      if(m.def.boss)bossThink(m,dt);if(m.dead||player.dead)return;
      if(d>11){if(spd>0)moveToward(m,v.x,v.y,spd,dt)}
      else{m.dir=v.x>m.x?1:-1;m.atk-=dt;if(m.atk<=0){m.atk=2;if(v===pet)hurtPet(m);else hurtPlayer(m)}}
    }else if(m.state==='return'){
      if(moveToward(m,m.hx,m.hy,m.def.spd*1.6,dt)||Math.hypot(m.x-m.hx,m.y-m.hy)<3){m.state='idle';m.hp=m.maxhp;m.root=0;m.snare=0}
    }
  });
  for(let i=floats.length-1;i>=0;i--){floats[i].t+=dt;if(floats[i].t>1.1)floats.splice(i,1)}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t>p.life)parts.splice(i,1)}
  for(let i=beams.length-1;i>=0;i--){beams[i].t+=dt;if(beams[i].t>0.15)beams.splice(i,1)}
}

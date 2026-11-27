// DATA ONLY. Mob types and the XP knobs.
'use strict';
// undead:1 = Cleric and Paladin holy spells hit it harder (and some only work on undead).
// death:'bones' = falls into a pile of bones, skull on top (js/anim.js); deathHead = [x, y, w, h, grid width] of the skull in its sprite.
// HP is tuned so an even-level mob takes about 5-6 Thornlash hits (or DoTs plus a few hits).
const TYPES={
  rat:{name:'a grave rat',img:'rat',lv:[1,2],hp:46,hpl:18,dmg:2.2,dmgl:1.3,spd:30,aggro:40,armor:0},
  beetle:{name:'a mire beetle',img:'beetle',lv:[2,3],hp:41,hpl:17,dmg:3.3,dmgl:1.45,spd:24,aggro:30,armor:0.5},
  dead:{name:'a shambling corpse',img:'dead',lv:[3,5],hp:51,hpl:21,dmg:4.4,dmgl:1.75,spd:25,aggro:48,undead:1,armor:0},
  // Old Gnawbone (rat tunnel, Nov 18): level 6 (the tunnel comes before the crypt), above every rat around him. adds: at each share of health he squeals and
  // that many rats burrow out of the nearest holes in the walls (beside him if there are none, e.g. the testing grounds).
  gnaw:{name:'Old Gnawbone',img:'gnaw',lv:[6,6],hp:125,hpl:31,dmg:4.6,dmgl:1.8,spd:31,aggro:56,armor:0.1,named:1,zone:'Rat tunnel',
    adds:[{at:0.66,type:'trat',n:2,lv:4},{at:0.33,type:'trat',n:2,lv:4}]},
  trat:{name:'a tunnel rat',img:'trat',lv:[2,4],hp:48,hpl:18,dmg:2.4,dmgl:1.35,spd:31,aggro:44,armor:0},
  brat:{name:'a big tunnel rat',img:'brat',lv:[4,5],hp:56,hpl:21,dmg:3,dmgl:1.55,spd:30,aggro:46,armor:0.05},
  crat:{name:'a crypt rat',img:'crat',lv:[4,5],hp:50,hpl:20,dmg:2.8,dmgl:1.45,spd:31,aggro:44,armor:0},
  cskel:{name:'a crypt skeleton',img:'skel',death:'bones',deathHead:[3,0,9,7,16],lv:[4,6],hp:56,hpl:23,dmg:5.2,dmgl:2,spd:29,aggro:52,undead:1,armor:0.15},
  // Named rares (v0.32, map chat): about 1 in 100 spawns in an area brings out that area's rare at its own spot on the map.
  // rare:1 = 3x XP, a sure uncommon for your class (and a rare chance), a faint glow. shell = direct hits mostly glance off (DoTs work best).
  // callAt = at that share of health it runs to the nearest idle mob and brings it (and its neighbours) back. Adds from:'ground' = they rise beside it.
  ironshell:{name:'Ironshell',img:'ironshell',lv:[3,3],hp:80,hpl:24,dmg:3.8,dmgl:1.6,spd:22,aggro:34,armor:0.6,rare:1,shell:1,zone:'Crossroads'},
  palerat:{name:'the Pale Rat',img:'palerat',lv:[5,5],hp:90,hpl:28,dmg:3.4,dmgl:1.6,spd:37,aggro:52,armor:0.05,rare:1,callAt:0.3,zone:'Rat tunnel'},
  bride:{name:'the Weeping Bride',img:'bride',lv:[8,8],hp:110,hpl:34,dmg:5.2,dmgl:2,spd:25,aggro:50,undead:1,armor:0,rare:1,zone:'Sunken Graveyard',
    adds:[{at:0.5,type:'dead',n:2,lv:6,from:'ground',shout:'WAIL!',say:'lets out a long wail, and the dead claw their way out of the ground!',col:'#3a3727'}]},
  // Wolfwood (v0.40, levels 8-11). pack = spawns of this type close together on the map fight as one pack.
  // flee = at that share of health it turns tail for a few seconds (snare or root it to stop that); anything idle it runs past joins in.
  // charge = when you're a little way off it lowers its head (seen coming), then rushes you and hits at once.
  wolf:{name:'a blight wolf',img:'wolf',lv:[8,11],hp:47,hpl:19,dmg:3.3,dmgl:1.5,spd:34,bite:1,aggro:52,armor:0,pack:1,flee:0.2},
  boar:{name:'a thornback boar',img:'boar',lv:[8,11],hp:56,hpl:23,dmg:3.5,dmgl:1.65,spd:27,aggro:44,armor:0.15,charge:1},
  // Greyfang (named, 11): howlStop = seconds he stands and howls when pulled, howlRush = seconds he then runs 1.9x to catch up (v0.109). Walks a loop round the middle of the wood with two pack wolves (route on the map). howl = when it's pulled,
  // its whole pack comes from much farther off. Never flees. No summon key: it comes back on its own timer.
  greyfang:{name:'Greyfang',img:'greyfang',lv:[11,11],hp:138,hpl:34,dmg:4.9,dmgl:1.95,spd:34,bite:1,aggro:60,armor:0.1,named:1,howl:1,howlStop:0.9,howlRush:1.5,zone:'Wolfwood'},
  // Old Scar (rare, 11): an old one-eyed wolf, alone, hits hard.
  oldscar:{name:'Old Scar',img:'oldscar',lv:[11,11],hp:112,hpl:32,dmg:5.6,dmgl:2.1,spd:36,bite:1,aggro:56,armor:0.05,rare:1,zone:'Wolfwood'},
  // Ruined Chapel grounds (v0.62, levels 10-14). camp = fen cultists standing within 3 tiles of one another fight as one camp, and
  // the first one pulled shouts for the nearest other camp if it's close (CAMP_CALL in world.js). cast = a spell with a cast bar over
  // its head (stun, fear or step out of range to stop it): name, first/every seconds, cast time, range, x = damage vs one melee hit.
  // chant = every few seconds the chanter's song makes its camp hit harder (kill it first). drain = each hit also burns that much mana.
  // blink = every few seconds it vanishes in a puff and reappears beside you. float = drawn hovering, with its own light.
  zealot:{name:'a fen zealot',img:'zealot',lv:[10,14],hp:55,hpl:22,dmg:3.6,dmgl:1.65,spd:28,aggro:50,armor:0.1,camp:1},
  ashcaller:{name:'a fen ashcaller',img:'ashcaller',lv:[10,14],hp:42,hpl:17,dmg:2.6,dmgl:1.2,spd:27,aggro:56,armor:0,camp:1,
    cast:{name:'Ash Bolt',first:1.5,every:4.5,dur:1,range:90,x:1.6,col:'#ff9a4a'}},
  chanter:{name:'a fen chanter',img:'chanter',lv:[10,14],hp:46,hpl:18,dmg:2.8,dmgl:1.3,spd:27,aggro:50,armor:0,camp:1,chant:1},
  wisp:{name:'an ash wisp',img:'wisp',lv:[10,14],hp:36,hpl:15,dmg:2.8,dmgl:1.3,spd:30,aggro:46,armor:0,drain:1,blink:1,float:1},
  // The Ashen Acolyte (rare, 14, herb garden): a telegraphed shadow bolt like the King's, and Ember Brand: a ring of embers
  // flares under you (1.5 s to step out, then a big burn). No flee-to-heal (owner, Nov 20: unfair to classes without a snare).
  acolyte:{name:'the Ashen Acolyte',img:'acolyte',lv:[14,14],hp:120,hpl:32,dmg:4.6,dmgl:1.9,spd:28,aggro:56,armor:0.05,rare:1,brand:1,zone:'Ruined Chapel',
    cast:{name:'Shadow Bolt',first:3,every:6,dur:2,range:110,boss:1,col:'#b48cff'}},
  // Dungeon 1, Brother Malrec's chapel (v0.63, levels 14-15, instanced). heal = a cast with a bar over its head that heals the
  // most hurt of its group (not itself) by x of their health; stun, fear or sleep it to stop it. grasp = Grasp of the Deep:
  // a 2 s boss cast, then anyone standing in flood water is held and hurt (get onto dry stone). toll = a 1.5 s wind-up, then
  // anyone within reach is stunned (step back). wake = Candle Wake: every sixth of its health a candle flares and a candle
  // wisp drifts toward it; one that reaches it heals it (kill or snare them). end = the dungeon's last boss: 6x XP, a chest
  // and the way out with the run summary. vanish = at half health it wails and vanishes instead of dying (v0.79); it comes
  // back with the other one when Malrec dies (the finale, world.js). drift = a candle wisp: doesn't fight, just drifts to its master. noxp = no XP or loot.
  mender:{name:'a fen mender',img:'mender',lv:[14,15],hp:44,hpl:18,dmg:2.6,dmgl:1.2,spd:27,aggro:50,armor:0,camp:1,
    heal:{name:'Mend',first:2.5,every:6,dur:1.5,x:0.3,below:0.75,col:'#9be37a'}},
  deacon:{name:'a cult deacon',img:'deacon',lv:[15,15],hp:55,hpl:22,dmg:3.2,dmgl:1.45,spd:27,aggro:56,armor:0.15},
  prior:{name:'the Drowned Prior',img:'prior',lv:[15,15],hp:230,hpl:58,dmg:5,dmgl:2,spd:23,aggro:60,undead:1,armor:0.1,named:1,grasp:1,vanish:1,glow:38,zone:'Dungeon 1'},
  bellringer:{name:'the Bellringer',img:'bellringer',lv:[15,15],hp:210,hpl:54,dmg:5.6,dmgl:2.2,spd:25,aggro:58,armor:0.15,named:1,toll:1,vanish:1,zone:'Dungeon 1'},
  malrec:{name:'Brother Malrec',img:'malrec',lv:[15,15],hp:240,hpl:60,dmg:4.2,dmgl:1.6,spd:26,aggro:70,armor:0.1,named:1,end:1,wake:1,zone:'Dungeon 1',
    heal:{name:'Rite of Mending',first:5,every:10,dur:2,x:0.25,below:0.5,col:'#ffd27a',boss:1},
    cast:{name:'Ash Bolt',first:6,every:9,dur:2,range:110,boss:1,col:'#ff9a4a'}},
  // Dungeon 1 rebuild (v0.66). gwisp = a great ash wisp: hovers with its pack (camp) and joins the pull; burn = every so often
  // it flares and a ring of fire spreads round where it hangs (1.6 s to get out of the ring). It doesn't die with whoever
  // summoned it (owner, Nov 21). summoner = the cultist who lit it: a caster like the ashcaller.
  gwisp:{name:'a great ash wisp',img:'gwisp',lv:[14,15],hp:70,hpl:26,dmg:3.2,dmgl:1.4,spd:24,aggro:52,armor:0,float:1,camp:1,burn:1},
  summoner:{name:'a cult summoner',img:'summoner',lv:[14,15],hp:46,hpl:18,dmg:2.6,dmgl:1.2,spd:27,aggro:56,armor:0,camp:1,
    cast:{name:'Cinder Lash',first:2,every:5,dur:1.2,range:90,x:1.5,col:'#ffb060'}},
  cwisp:{name:'a candle wisp',img:'cwisp',lv:[15,15],hp:30,hpl:6,dmg:0,dmgl:0,spd:11,aggro:0,armor:0,float:1,drift:1,noxp:1},
  boss1:{name:'the Skeleton King',img:'boss1',death:'bones',deathHead:[5,0,13,10,24],lv:[7,7],hp:247,hpl:44,dmg:6.5,dmgl:2.4,spd:27,aggro:70,undead:1,armor:0.1,named:1,boss:1,zone:'Dungeon 1'}
};
// XP has three knobs (v0.34.1, owner Nov 19); tune these, never single mobs' XP or the XP-needed numbers:
// 1) KILLS_PER_LEVEL: how many even-level, standard-toughness kills each level takes (index = level). The XP needed for
//    each level is worked out from it in combat.js. A smooth ~+25% a level; to slow or speed the whole climb, change this row.
const KILLS_PER_LEVEL=[0,8,12,17,22,29,38,48,59,73,91,114,142,178,222,278]; // v0.34.1 first try was 6,9,12,16,21,27,34,42,52; owner: a bit slower (x1.4). 10-15 added v0.44/v0.46: the same ~+25% a level
// Level cap: experience stops here (owner, Nov 19: 16, ahead of the level 16 and 18 forks; was 10).
// TEST_MAX is how high ?level= and the DEV panel can go, so forks past the cap can be tried before the world has mobs for them.
const LEVEL_CAP=16;
const TEST_MAX=20;
// 2) Toughness: a regular mob pays more or less than a standard mob of its level by how tanky it is (health, with armor)
//    and how hard it hits, so stat changes carry their XP with them. STD_MOB is the standard; TOUGH_RANGE caps the swing.
//    Named, rares and bosses skip it: they keep their flat 3x / 6x.
const STD_MOB={hp:50,hpl:20,dmg:3.2,dmgl:1.5};
const TOUGH_RANGE=[0.5,2];
// 3) Spawn count lives in the map files: enough mobs that one clear takes you through most of an area's levels.
// Check all three with DEV -> Testing grounds -> Zone 1 pace.

// DATA ONLY. Mob types and the XP knobs.
'use strict';
// undead:1 = Cleric and Paladin holy spells hit it harder (and some only work on undead).
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
  cskel:{name:'a crypt skeleton',img:'skel',lv:[4,6],hp:56,hpl:23,dmg:5.2,dmgl:2,spd:29,aggro:52,undead:1,armor:0.15},
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
  wolf:{name:'a blight wolf',img:'wolf',lv:[8,11],hp:47,hpl:19,dmg:3.3,dmgl:1.5,spd:34,aggro:52,armor:0,pack:1,flee:0.2},
  boar:{name:'a thornback boar',img:'boar',lv:[8,11],hp:56,hpl:23,dmg:3.5,dmgl:1.65,spd:27,aggro:44,armor:0.15,charge:1},
  // Greyfang (named, 11): walks a loop round the middle of the wood with two pack wolves (route on the map). howl = when it's pulled,
  // its whole pack comes from much farther off. Never flees. No summon key: it comes back on its own timer.
  greyfang:{name:'Greyfang',img:'greyfang',lv:[11,11],hp:138,hpl:34,dmg:4.9,dmgl:1.95,spd:34,aggro:60,armor:0.1,named:1,howl:1,zone:'Wolfwood'},
  // Old Scar (rare, 11): an old one-eyed wolf, alone, hits hard.
  oldscar:{name:'Old Scar',img:'oldscar',lv:[11,11],hp:112,hpl:32,dmg:5.6,dmgl:2.1,spd:36,aggro:56,armor:0.05,rare:1,zone:'Wolfwood'},
  boss1:{name:'Boss 1',img:'boss1',lv:[7,7],hp:247,hpl:44,dmg:6.5,dmgl:2.4,spd:27,aggro:70,undead:1,armor:0.1,named:1,boss:1,zone:'Dungeon 1'}
};
// XP has three knobs (v0.34.1, owner Nov 19); tune these, never single mobs' XP or the XP-needed numbers:
// 1) KILLS_PER_LEVEL: how many even-level, standard-toughness kills each level takes (index = level). The XP needed for
//    each level is worked out from it in combat.js. A smooth ~+25% a level; to slow or speed the whole climb, change this row.
const KILLS_PER_LEVEL=[0,8,12,17,22,29,38,48,59,73]; // v0.34.1 first try was 6,9,12,16,21,27,34,42,52; owner: a bit slower (x1.4)
// 2) Toughness: a regular mob pays more or less than a standard mob of its level by how tanky it is (health, with armor)
//    and how hard it hits, so stat changes carry their XP with them. STD_MOB is the standard; TOUGH_RANGE caps the swing.
//    Named, rares and bosses skip it: they keep their flat 3x / 6x.
const STD_MOB={hp:50,hpl:20,dmg:3.2,dmgl:1.5};
const TOUGH_RANGE=[0.5,2];
// 3) Spawn count lives in the map files: enough mobs that one clear takes you through most of an area's levels.
// Check all three with DEV -> Testing grounds -> Zone 1 pace.

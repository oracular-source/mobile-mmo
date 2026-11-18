// DATA ONLY. Mob types and the XP curve.
'use strict';
// HP is tuned so an even-level mob takes about 5-6 Thornlash hits (or DoTs plus a few hits).
const TYPES={
  rat:{name:'a grave rat',img:'rat',lv:[1,2],hp:46,hpl:18,dmg:2.2,dmgl:1.3,spd:30,aggro:40,armor:0},
  beetle:{name:'a mire beetle',img:'beetle',lv:[2,3],hp:41,hpl:17,dmg:3.3,dmgl:1.45,spd:24,aggro:30,armor:0.5},
  dead:{name:'a shambling corpse',img:'dead',lv:[3,5],hp:51,hpl:21,dmg:4.4,dmgl:1.75,spd:25,aggro:48,armor:0},
  gnaw:{name:'Old Gnawbone',img:'gnaw',lv:[4,4],hp:104,hpl:29,dmg:4.4,dmgl:1.75,spd:31,aggro:50,armor:0.1,named:1,zone:'Gate Road'},
  crat:{name:'a crypt rat',img:'crat',lv:[4,5],hp:50,hpl:20,dmg:2.8,dmgl:1.45,spd:31,aggro:44,armor:0},
  cskel:{name:'a crypt skeleton',img:'skel',lv:[4,6],hp:56,hpl:23,dmg:5.2,dmgl:2,spd:29,aggro:52,armor:0.15},
  boss1:{name:'Boss 1',img:'boss1',lv:[7,7],hp:260,hpl:46,dmg:6.5,dmgl:2.4,spd:27,aggro:70,armor:0.1,named:1,boss:1,zone:'Dungeon 1'}
};
const XP_MULT=1.25; // mobs got tougher, so each kill is worth a bit more
// XP needed per level, EverQuest-shaped: early levels are quick, later ones slow down a lot.
// Target at roughly 50 kills an hour: L2 ~10 min, L5 ~1.3 h, L10 ~10 h total.
const NEED=[0,80,260,670,1680,3800,8400,15400,27200,47500];
const need=L=>NEED[L]||NEED[NEED.length-1];

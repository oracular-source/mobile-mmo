// DATA ONLY. Item rarity colours and every item.
'use strict';
/* ---------- Items, bags and gear (personal loot: every drop is yours) ---------- */
const RAR={junk:'#9a9a9a',common:'#e8e2cf',uncommon:'#5fdf6f',rare:'#5fa8ff',named:'#ff9de2',key:'#e8c060'};
const ITEMS={
  whisker:{name:'Rat Whisker',rar:'junk',value:1,stack:true},
  shell:{name:'Beetle Shell',rar:'junk',value:3,stack:true},
  bone:{name:'Brittle Bone',rar:'junk',value:4,stack:true},
  rag:{name:'Grave Rag',rar:'junk',value:2,stack:true},
  pelt:{name:'Mangy Wolf Pelt',rar:'junk',value:6,stack:true},
  tusk:{name:'Boar Tusk',rar:'junk',value:7,stack:true},
  cultrag:{name:'Ash-stained Cowl',rar:'junk',value:8,stack:true},
  ember:{name:'Cold Ember',rar:'junk',value:9,stack:true},
  // Summon keys (v0.31): used up at a named's spot to call it if it isn't up. Not junk, so "Sell all junk" leaves them alone.
  severed_paw:{name:'Severed Paw',rar:'key',value:1,stack:true,desc:"Summon key · lay it on the bone pile at the bottom of the rat tunnel to call Old Gnawbone"},
  crown_shard:{name:'Crown Shard',rar:'key',value:1,stack:true,desc:"Summon key · set it on the empty throne in the crypt to call the Skeleton King"},
  cap:{name:'Cloth Cap',slot:'head',rar:'common',ac:1,value:6},
  robe:{name:'Frayed Robe',slot:'chest',rar:'common',ac:2,wis:1,value:10,cls:'caster'},
  legs:{name:'Patched Leggings',slot:'legs',rar:'common',ac:1,value:6},
  sandals:{name:'Worn Sandals',slot:'feet',rar:'common',ac:1,value:5},
  gloves:{name:'Rough Gloves',slot:'hands',rar:'common',ac:1,value:5},
  oakstaff:{name:'Oak Staff',slot:'weapon',rar:'common',int:1,value:8,cls:'caster'},
  charm:{name:'Bone Charm',slot:'offhand',rar:'common',wis:1,value:8,cls:'caster'},
  cring:{name:'Copper Ring',slot:'ring',rar:'common',sta:1,value:8},
  mosscap:{name:'Mossweave Cap',slot:'head',rar:'uncommon',ac:2,wis:1,value:20},
  barkrobe:{name:'Barkweave Robe',slot:'chest',rar:'uncommon',ac:3,sta:1,wis:2,value:35,cls:'caster'},
  thornstaff:{name:'Thornwood Staff',slot:'weapon',rar:'uncommon',int:3,wis:1,value:40,cls:'caster'},
  gravecharm:{name:'Gravebloom Charm',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'caster'},
  boots:{name:'Bog-walker Boots',slot:'feet',rar:'uncommon',ac:2,sta:1,value:22},
  shroud:{name:"Mourner's Shroud",slot:'chest',rar:'rare',ac:4,sta:2,wis:3,int:2,value:90,cls:'caster'},
  gravemail:{name:'Gravewarden Mail',slot:'chest',rar:'rare',ac:7,sta:3,str:2,value:90,cls:'warrior'},
  fangring:{name:"Greyfang's Tooth",slot:'ring',rar:'named',sta:2,str:1,wis:1,value:75},
  gnawring:{name:'Gnawed Ring',slot:'ring',rar:'named',sta:2,wis:1,value:60},
  b1staff:{name:'Boss 1 Staff',slot:'weapon',rar:'named',int:5,wis:2,value:120,cls:'caster'},
  b1robe:{name:'Boss 1 Robe',slot:'chest',rar:'named',ac:5,sta:2,wis:3,value:120,cls:'caster'},
  b1charm:{name:'Boss 1 Charm',slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'caster'},
  b1blade:{name:'Boss 1 Blade',slot:'weapon',rar:'named',str:5,sta:2,value:120,cls:'warrior'},
  b1plate:{name:'Boss 1 Breastplate',slot:'chest',rar:'named',ac:8,sta:3,str:1,value:120,cls:'warrior'},
  b1shield:{name:'Boss 1 Shield',slot:'offhand',rar:'named',ac:5,sta:2,value:110,cls:'warrior'},
  rsword:{name:'Rusty Sword',slot:'weapon',rar:'common',str:1,value:8,cls:'warrior'},
  ishield:{name:'Dented Shield',slot:'offhand',rar:'common',ac:2,value:8,cls:'warrior'},
  tunic:{name:'Studded Tunic',slot:'chest',rar:'common',ac:3,str:1,value:10,cls:'warrior'},
  coif:{name:'Chain Coif',slot:'head',rar:'uncommon',ac:3,sta:1,value:22,cls:'warrior'},
  axe:{name:'Grave-iron Axe',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'warrior'},
  kite:{name:'Kite Shield',slot:'offhand',rar:'uncommon',ac:4,sta:1,value:30,cls:'warrior'},
  ringmail:{name:'Ringmail Shirt',slot:'chest',rar:'uncommon',ac:5,sta:1,str:1,value:35,cls:'warrior'},
  dagger:{name:'Chipped Dagger',slot:'weapon',rar:'common',str:1,value:8,cls:'rogue'},
  pdagger:{name:'Parrying Dagger',slot:'offhand',rar:'common',str:1,value:8,cls:'rogue'},
  jerkin:{name:'Leather Jerkin',slot:'chest',rar:'common',ac:2,str:1,value:10,cls:'rogue'},
  hood:{name:'Cutpurse Hood',slot:'head',rar:'uncommon',ac:2,str:1,value:22,cls:'rogue'},
  dirk:{name:'Bone-hilt Dirk',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'rogue'},
  shadowvest:{name:'Shadowhide Vest',slot:'chest',rar:'uncommon',ac:4,str:1,sta:1,value:35,cls:'rogue'},
  nightleather:{name:'Nightveil Leathers',slot:'chest',rar:'rare',ac:5,sta:2,str:3,value:90,cls:'rogue'},
  b1dagger:{name:'Boss 1 Dagger',slot:'weapon',rar:'named',str:6,sta:1,value:120,cls:'rogue'},
  b1jerkin:{name:'Boss 1 Jerkin',slot:'chest',rar:'named',ac:6,sta:3,str:2,value:120,cls:'rogue'},
  b1parry:{name:'Boss 1 Parrying Blade',slot:'offhand',rar:'named',ac:1,str:3,sta:2,value:110,cls:'rogue'},
  // Batch 1 (v0.17). cls 'cleric' = Cleric only; 'knight' = Paladin and Shadow Knight (they also wear Warrior plate).
  imace:{name:'Iron Mace',slot:'weapon',rar:'common',str:1,wis:1,value:8,cls:'cleric'},
  chainvest:{name:'Chain Vest',slot:'chest',rar:'common',ac:3,wis:1,value:10,cls:'cleric'},
  bmace:{name:'Blessed Mace',slot:'weapon',rar:'uncommon',str:2,wis:2,value:40,cls:'cleric'},
  wardstone:{name:'Wardstone Shield',slot:'offhand',rar:'uncommon',ac:3,wis:1,value:30,cls:'cleric'},
  vigil:{name:'Vestments of the Vigil',slot:'chest',rar:'rare',ac:5,sta:2,wis:3,int:1,value:90,cls:'cleric'},
  b1mace:{name:'Boss 1 Mace',slot:'weapon',rar:'named',str:3,wis:3,int:1,value:120,cls:'cleric'},
  b1hauberk:{name:'Boss 1 Hauberk',slot:'chest',rar:'named',ac:6,sta:2,wis:3,value:120,cls:'cleric'},
  b1relic:{name:'Boss 1 Reliquary',slot:'offhand',rar:'named',ac:3,wis:3,int:1,value:110,cls:'cleric'},
  tabard:{name:"Squire's Tabard",slot:'chest',rar:'common',ac:3,wis:1,value:10,cls:'knight'},
  oathhelm:{name:'Oathbound Helm',slot:'head',rar:'uncommon',ac:3,sta:1,wis:1,value:22,cls:'knight'},
  greatsword:{name:'Grave-iron Greatsword',slot:'weapon',rar:'uncommon',str:3,wis:1,value:40,cls:'knight'},
  b1great:{name:'Boss 1 Greatsword',slot:'weapon',rar:'named',str:5,wis:2,value:120,cls:'knight'},
  b1helm:{name:'Boss 1 Helm',slot:'head',rar:'named',ac:4,sta:2,wis:2,value:110,cls:'knight'},
  b1circlet:{name:'Boss 1 Circlet',slot:'head',rar:'named',ac:1,int:3,wis:2,value:110,cls:'caster'},
  // Batch 2 (v0.18). Magician wears caster gear; Shaman wears caster gear plus its own. ranger, monk, shaman, bard = that class only.
  hbow:{name:'Hunting Bow',slot:'weapon',rar:'common',str:1,value:8,cls:'ranger'},
  rjerkin:{name:'Trail Jerkin',slot:'chest',rar:'common',ac:2,str:1,value:10,cls:'ranger'},
  yewbow:{name:'Yew Longbow',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'ranger'},
  quiver:{name:"Fletcher's Quiver",slot:'offhand',rar:'uncommon',str:2,value:30,cls:'ranger'},
  gcloak:{name:'Greenwood Cloak',slot:'chest',rar:'rare',ac:5,sta:2,str:3,value:90,cls:'ranger'},
  b1bow:{name:'Boss 1 Bow',slot:'weapon',rar:'named',str:6,sta:1,value:120,cls:'ranger'},
  b1cloak:{name:'Boss 1 Cloak',slot:'chest',rar:'named',ac:6,sta:3,str:2,value:120,cls:'ranger'},
  b1quiver:{name:'Boss 1 Quiver',slot:'offhand',rar:'named',str:3,sta:2,value:110,cls:'ranger'},
  wraps:{name:'Cloth Wraps',slot:'weapon',rar:'common',str:1,value:8,cls:'monk'},
  gi:{name:'Plain Gi',slot:'chest',rar:'common',ac:2,sta:1,value:10,cls:'monk'},
  knuckles:{name:'Iron Knuckles',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'monk'},
  trousers:{name:'Mountain Trousers',slot:'legs',rar:'uncommon',ac:2,str:1,sta:1,value:30,cls:'monk'},
  stillrobe:{name:'Robe of the Still Mind',slot:'chest',rar:'rare',ac:5,sta:3,str:2,value:90,cls:'monk'},
  b1fists:{name:'Boss 1 Fist Wraps',slot:'weapon',rar:'named',str:6,sta:1,value:120,cls:'monk'},
  b1gi:{name:'Boss 1 Gi',slot:'chest',rar:'named',ac:6,sta:3,str:2,value:120,cls:'monk'},
  b1hands:{name:'Boss 1 Handwraps',slot:'hands',rar:'named',ac:2,str:3,sta:1,value:110,cls:'monk'},
  fspear:{name:'Fishing Spear',slot:'weapon',rar:'common',str:1,wis:1,value:8,cls:'shaman'},
  mantle:{name:'Hide Mantle',slot:'chest',rar:'common',ac:2,wis:1,value:10,cls:'shaman'},
  bspear:{name:'Bone Spear',slot:'weapon',rar:'uncommon',wis:2,int:1,str:1,value:40,cls:'shaman'},
  fetish:{name:'Spirit Fetish',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'shaman'},
  ancest:{name:'Ancestral Hides',slot:'chest',rar:'rare',ac:5,sta:2,wis:3,int:1,value:90,cls:'shaman'},
  b1spear:{name:'Boss 1 Spear',slot:'weapon',rar:'named',int:4,wis:3,value:120,cls:'shaman'},
  b1mantle:{name:'Boss 1 Mantle',slot:'chest',rar:'named',ac:5,sta:2,wis:3,value:120,cls:'shaman'},
  b1fetish:{name:'Boss 1 Fetish',slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'shaman'},
  rapier:{name:'Thin Rapier',slot:'weapon',rar:'common',str:1,value:8,cls:'bard'},
  lute:{name:'Old Lute',slot:'offhand',rar:'common',wis:1,value:8,cls:'bard'},
  doublet:{name:'Velvet Doublet',slot:'chest',rar:'common',ac:2,sta:1,value:10,cls:'bard'},
  srapier:{name:'Silver Rapier',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'bard'},
  finelute:{name:'Fine Lute',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'bard'},
  tcoat:{name:"Troubadour's Coat",slot:'chest',rar:'rare',ac:5,sta:2,str:2,wis:2,value:90,cls:'bard'},
  b1rapier:{name:'Boss 1 Rapier',slot:'weapon',rar:'named',str:5,sta:2,value:120,cls:'bard'},
  b1lute:{name:'Boss 1 Lute',slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'bard'},
  b1coat:{name:'Boss 1 Coat',slot:'chest',rar:'named',ac:6,sta:3,str:2,value:120,cls:'bard'},
  // Dungeon 1 (v0.63). The Drowned Prior and the Bellringer each drop one item any class can wear; Brother Malrec's chest holds
  // one for your gear group (a step above the Skeleton King's). Placeholder names until the setting is decided.
  dcultjunk:{name:'Waterlogged Psalter',rar:'junk',value:11,stack:true},
  priorcowl:{name:"Drowned Prior's Cowl",slot:'head',rar:'named',ac:4,sta:3,wis:2,value:150},
  bellband:{name:"Bellringer's Band",slot:'ring',rar:'named',sta:3,str:2,int:1,value:150},
  malstaff:{name:"Malrec's Censer-staff",slot:'weapon',rar:'named',int:7,wis:3,sta:1,value:200,cls:'caster'},
  malaxe:{name:"Malrec's Headsman Axe",slot:'weapon',rar:'named',str:7,sta:3,value:200,cls:'warrior'},
  malknife:{name:"Malrec's Ritual Knife",slot:'weapon',rar:'named',str:8,sta:2,value:200,cls:'rogue'},
  malmace:{name:"Malrec's Ember Mace",slot:'weapon',rar:'named',str:4,wis:4,int:2,value:200,cls:'cleric'},
  malblade:{name:"Malrec's Ashen Greatsword",slot:'weapon',rar:'named',str:7,wis:3,value:200,cls:'knight'},
  malbow:{name:"Malrec's Pyre Bow",slot:'weapon',rar:'named',str:8,sta:2,value:200,cls:'ranger'},
  malwraps:{name:"Malrec's Penitent Wraps",slot:'weapon',rar:'named',str:8,sta:2,value:200,cls:'monk'},
  malspear:{name:"Malrec's Smoke Spear",slot:'weapon',rar:'named',int:5,wis:4,value:200,cls:'shaman'},
  malrapier:{name:"Malrec's Vesper Rapier",slot:'weapon',rar:'named',str:7,sta:3,value:200,cls:'bard'}
};
// Which mobs drop which summon key, by area (zone id -> mob type -> key). One in KEY_CHANCE kills drops one.
const KEY_DROPS={tunnel:{trat:'severed_paw',brat:'severed_paw'},crypt:{cskel:'crown_shard'}};
const KEY_CHANCE=0.1;
// Hidden chests (v0.32): each opening rolls one piece of gear your class can use. Chance of uncommon and rare by area (the rest is common), plus copper.
// Deeper areas pay better. An opened chest fills again after CHEST_REFILL seconds.
const CHEST_ODDS={crossroads:{unc:0.3,rare:0,cu:5},rat_tunnel:{unc:0.5,rare:0.05,cu:10},graveyard:{unc:0.55,rare:0.08,cu:14},crypt:{unc:0.6,rare:0.12,cu:16},wolfwood:{unc:0.6,rare:0.12,cu:20},chapel:{unc:0.65,rare:0.15,cu:26},dungeon1:{unc:0.75,rare:0.25,cu:34}};
const CHEST_REFILL=600;
// Loot feel (v0.97, Items lane, owner Nov 27): fewer drops so each one counts. Normal mobs drop gear rarely (about 1 kill in 30),
// blues are a highlight, pinks (named items) only come from named and bosses, about 1 in 10 kills, and creep up each kill without one.
const LOOT={
  mobCommon:0.022,mobCommonLv:0.0005, // white: ~2.5% a kill (a little more from higher mobs)
  mobUnc:0.007,                       // green: ~0.7% a kill
  mobRare:0.0015,mobRareLv:4,         // blue: ~1 in 700 kills, from level 4 mobs up
  caveX:1.5,                          // rat tunnel and crypt pay a little better (they used to double)
  rareMobBlue:0.3,                    // a rare mob drops one item: green, or blue this often
  namedPink:0.10,pinkStep:0.05,       // a named's own pink: 10%, +5% for every kill of it without one (resets when one drops)
  namedBlue:0.33,                     // when the pink doesn't drop: blue this often, else green. First kill of each named: blue or better
  wearDeath:10                        // each death wears every worn item 10% (repair at any campfire); replaces the XP loss
};

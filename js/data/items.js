// DATA ONLY. Item rarity colours and every item.
'use strict';
/* ---------- Items, bags and gear (personal loot: every drop is yours) ---------- */
const RAR={junk:'#9a9a9a',common:'#e8e2cf',uncommon:'#5fdf6f',rare:'#5fa8ff',named:'#ff9de2',key:'#e8c060',orb:'#7fe0d8'};
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
  // Enchanting (v0.100, Items lane): orbs raise a worn item one step (+1 to +5); unwanted gear breaks into dust, enough dust makes an orb.
  // One orb tier for now (Zone 1); higher tiers and merging 3 into 1 come with Zone 2.
  orb1:{name:'Enchant Orb',rar:'orb',value:100,stack:true,desc:"Enchant orb · at a campfire, raise a worn item one step (+1 to +5)"},
  dust:{name:'Orb Dust',rar:'orb',value:1,stack:true,desc:"Orb dust · from gear you break down; at a campfire, enough of it makes an Enchant Orb"},
  cap:{name:'Cloth Cap',slot:'head',rar:'common',ac:1,value:6},
  robe:{name:'Frayed Robe',slot:'chest',rar:'common',ac:2,wis:1,value:10,cls:'caster'},
  legs:{name:'Patched Leggings',slot:'legs',rar:'common',ac:1,value:6},
  sandals:{name:'Worn Sandals',slot:'feet',rar:'common',ac:1,value:5},
  gloves:{name:'Rough Gloves',slot:'hands',rar:'common',ac:1,value:5},
  oakstaff:{name:'Oak Staff',slot:'weapon',rar:'common',int:1,value:8,cls:'caster',wt:'staff',look:1},
  charm:{name:'Bone Charm',slot:'offhand',rar:'common',wis:1,value:8,cls:'caster'},
  cring:{name:'Copper Ring',slot:'ring',rar:'common',sta:1,value:8},
  mosscap:{name:'Mossweave Cap',slot:'head',rar:'uncommon',ac:2,wis:1,value:20},
  barkrobe:{name:'Barkweave Robe',slot:'chest',rar:'uncommon',ac:3,sta:1,wis:2,value:35,cls:'caster'},
  thornstaff:{name:'Thornwood Crook',slot:'weapon',rar:'uncommon',int:3,wis:1,value:40,cls:'caster',wt:'crook',look:2},
  gravecharm:{name:'Gravebloom Charm',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'caster'},
  boots:{name:'Bog-walker Boots',slot:'feet',rar:'uncommon',ac:2,sta:1,value:22},
  shroud:{name:"Mourner's Shroud",slot:'chest',rar:'rare',ac:4,sta:2,wis:3,int:2,value:90,cls:'caster'},
  gravemail:{name:'Gravewarden Mail',slot:'chest',rar:'rare',ac:7,sta:3,str:2,value:90,cls:'warrior'},
  fangring:{name:"Greyfang's Tooth",slot:'ring',rar:'named',sta:2,str:1,wis:1,value:75},
  gnawring:{name:'Gnawed Ring',slot:'ring',rar:'named',sta:2,wis:1,value:60},
  b1staff:{name:"Skeleton King's Staff",slot:'weapon',rar:'named',value:120,cls:'caster',wt:'staff',look:3,int:6,wis:2,sta:1},
  b1robe:{name:"Skeleton King's Robe",slot:'chest',rar:'named',ac:5,sta:3,wis:3,value:120,cls:'caster'},
  b1charm:{name:"Skeleton King's Charm",slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'caster'},
  b1blade:{name:"Skeleton King's Blade",slot:'weapon',rar:'named',value:120,cls:'warrior',wt:'sword',look:3,str:6,sta:3},
  b1plate:{name:"Skeleton King's Breastplate",slot:'chest',rar:'named',ac:8,sta:4,str:1,value:120,cls:'warrior'},
  b1shield:{name:"Skeleton King's Shield",slot:'offhand',rar:'named',ac:5,sta:2,value:110,cls:'warrior'},
  rsword:{name:'Rusty Sword',slot:'weapon',rar:'common',str:1,value:8,cls:'warrior',wt:'sword',look:1},
  ishield:{name:'Dented Shield',slot:'offhand',rar:'common',ac:2,value:8,cls:'warrior'},
  tunic:{name:'Studded Tunic',slot:'chest',rar:'common',ac:3,str:1,value:10,cls:'warrior'},
  coif:{name:'Chain Coif',slot:'head',rar:'uncommon',ac:3,sta:1,value:22,cls:'warrior'},
  axe:{name:'Grave-iron Sword',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'warrior',wt:'sword',look:2},
  kite:{name:'Kite Shield',slot:'offhand',rar:'uncommon',ac:4,sta:1,value:30,cls:'warrior'},
  ringmail:{name:'Ringmail Shirt',slot:'chest',rar:'uncommon',ac:5,sta:1,str:1,value:35,cls:'warrior'},
  dagger:{name:'Chipped Dagger',slot:'weapon',rar:'common',str:1,value:8,cls:'rogue',wt:'dagger',look:1},
  pdagger:{name:'Parrying Dagger',slot:'offhand',rar:'common',str:1,value:8,cls:'rogue'},
  jerkin:{name:'Leather Jerkin',slot:'chest',rar:'common',ac:2,str:1,value:10,cls:'rogue'},
  hood:{name:'Cutpurse Hood',slot:'head',rar:'uncommon',ac:2,str:1,value:22,cls:'rogue'},
  dirk:{name:'Bone-hilt Dirk',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'rogue',wt:'dagger',look:2},
  shadowvest:{name:'Shadowhide Vest',slot:'chest',rar:'uncommon',ac:4,str:1,sta:1,value:35,cls:'rogue'},
  nightleather:{name:'Nightveil Leathers',slot:'chest',rar:'rare',ac:5,sta:2,str:3,value:90,cls:'rogue'},
  b1dagger:{name:"Skeleton King's Dagger",slot:'weapon',rar:'named',value:120,cls:'rogue',wt:'dagger',look:3,str:7,sta:2},
  b1jerkin:{name:"Skeleton King's Jerkin",slot:'chest',rar:'named',ac:6,sta:4,str:2,value:120,cls:'rogue'},
  b1parry:{name:"Skeleton King's Parrying Blade",slot:'offhand',rar:'named',ac:1,str:3,sta:2,value:110,cls:'rogue'},
  // Batch 1 (v0.17). cls 'cleric' = Cleric only; 'knight' = Paladin and Shadow Knight (they also wear Warrior plate).
  imace:{name:'Iron Mace',slot:'weapon',rar:'common',str:1,wis:1,value:8,cls:'cleric',wt:'mace',look:1},
  chainvest:{name:'Chain Vest',slot:'chest',rar:'common',ac:3,wis:1,value:10,cls:'cleric'},
  bmace:{name:'Blessed Mace',slot:'weapon',rar:'uncommon',str:2,wis:2,value:40,cls:'cleric',wt:'mace',look:2},
  wardstone:{name:'Wardstone Shield',slot:'offhand',rar:'uncommon',ac:3,wis:1,value:30,cls:'cleric'},
  vigil:{name:'Vestments of the Vigil',slot:'chest',rar:'rare',ac:5,sta:2,wis:3,int:1,value:90,cls:'cleric'},
  b1mace:{name:"Skeleton King's Mace",slot:'weapon',rar:'named',value:120,cls:'cleric',wt:'mace',look:3,str:4,wis:3,sta:2},
  b1hauberk:{name:"Skeleton King's Hauberk",slot:'chest',rar:'named',ac:6,sta:3,wis:3,value:120,cls:'cleric'},
  b1relic:{name:"Skeleton King's Reliquary",slot:'offhand',rar:'named',ac:3,wis:3,int:1,value:110,cls:'cleric'},
  tabard:{name:"Squire's Tabard",slot:'chest',rar:'common',ac:3,wis:1,value:10,cls:'knight'},
  oathhelm:{name:'Oathbound Helm',slot:'head',rar:'uncommon',ac:3,sta:1,wis:1,value:22,cls:'knight'},
  b1helm:{name:"Skeleton King's Helm",slot:'head',rar:'named',ac:4,sta:2,wis:2,value:110,cls:'knight'},
  b1circlet:{name:"Skeleton King's Circlet",slot:'head',rar:'named',ac:1,int:3,wis:2,value:110,cls:'caster'},
  // Batch 2 (v0.18). Magician wears caster gear; Shaman wears caster gear plus its own. ranger, monk, shaman, bard = that class only.
  hbow:{name:'Hunting Bow',slot:'weapon',rar:'common',str:1,value:8,cls:'ranger',wt:'bow',look:1},
  rjerkin:{name:'Trail Jerkin',slot:'chest',rar:'common',ac:2,str:1,value:10,cls:'ranger'},
  yewbow:{name:'Yew Longbow',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'ranger',wt:'bow',look:2},
  quiver:{name:"Fletcher's Quiver",slot:'offhand',rar:'uncommon',str:2,value:30,cls:'ranger'},
  gcloak:{name:'Greenwood Cloak',slot:'chest',rar:'rare',ac:5,sta:2,str:3,value:90,cls:'ranger'},
  b1bow:{name:"Skeleton King's Bow",slot:'weapon',rar:'named',value:120,cls:'ranger',wt:'bow',look:3,str:7,sta:2},
  b1cloak:{name:"Skeleton King's Cloak",slot:'chest',rar:'named',ac:6,sta:4,str:2,value:120,cls:'ranger'},
  b1quiver:{name:"Skeleton King's Quiver",slot:'offhand',rar:'named',str:3,sta:2,value:110,cls:'ranger'},
  wraps:{name:'Cloth Wraps',slot:'weapon',rar:'common',str:1,value:8,cls:'monk',wt:'wraps',look:1},
  gi:{name:'Plain Gi',slot:'chest',rar:'common',ac:2,sta:1,value:10,cls:'monk'},
  knuckles:{name:'Iron Knuckles',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'monk',wt:'wraps',look:2},
  trousers:{name:'Mountain Trousers',slot:'legs',rar:'uncommon',ac:2,str:1,sta:1,value:30,cls:'monk'},
  stillrobe:{name:'Robe of the Still Mind',slot:'chest',rar:'rare',ac:5,sta:3,str:2,value:90,cls:'monk'},
  b1fists:{name:"Skeleton King's Fist Wraps",slot:'weapon',rar:'named',value:120,cls:'monk',wt:'wraps',look:3,str:7,sta:2},
  b1gi:{name:"Skeleton King's Gi",slot:'chest',rar:'named',ac:6,sta:4,str:2,value:120,cls:'monk'},
  b1hands:{name:"Skeleton King's Handwraps",slot:'hands',rar:'named',ac:2,str:3,sta:1,value:110,cls:'monk'},
  fspear:{name:'Fishing Spear',slot:'weapon',rar:'common',str:1,wis:1,value:8,cls:'shaman',wt:'spear',look:1},
  mantle:{name:'Hide Mantle',slot:'chest',rar:'common',ac:2,wis:1,value:10,cls:'shaman'},
  bspear:{name:'Bone Spear',slot:'weapon',rar:'uncommon',wis:2,int:1,str:1,value:40,cls:'shaman',wt:'spear',look:2},
  fetish:{name:'Spirit Fetish',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'shaman'},
  ancest:{name:'Ancestral Hides',slot:'chest',rar:'rare',ac:5,sta:2,wis:3,int:1,value:90,cls:'shaman'},
  b1spear:{name:"Skeleton King's Spear",slot:'weapon',rar:'named',value:120,cls:'shaman',wt:'spear',look:3,int:5,wis:3,sta:1},
  b1mantle:{name:"Skeleton King's Mantle",slot:'chest',rar:'named',ac:5,sta:3,wis:3,value:120,cls:'shaman'},
  b1fetish:{name:"Skeleton King's Fetish",slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'shaman'},
  rapier:{name:'Thin Rapier',slot:'weapon',rar:'common',str:1,value:8,cls:'bard',wt:'rapier',look:1},
  lute:{name:'Old Lute',slot:'offhand',rar:'common',wis:1,value:8,cls:'bard'},
  doublet:{name:'Velvet Doublet',slot:'chest',rar:'common',ac:2,sta:1,value:10,cls:'bard'},
  srapier:{name:'Silver Rapier',slot:'weapon',rar:'uncommon',str:3,sta:1,value:40,cls:'bard',wt:'rapier',look:2},
  finelute:{name:'Fine Lute',slot:'offhand',rar:'uncommon',wis:2,int:1,value:30,cls:'bard'},
  tcoat:{name:"Troubadour's Coat",slot:'chest',rar:'rare',ac:5,sta:2,str:2,wis:2,value:90,cls:'bard'},
  b1rapier:{name:"Skeleton King's Rapier",slot:'weapon',rar:'named',value:120,cls:'bard',wt:'rapier',look:3,str:6,sta:2,wis:1},
  b1lute:{name:"Skeleton King's Lute",slot:'offhand',rar:'named',wis:3,int:2,sta:1,value:110,cls:'bard'},
  b1coat:{name:"Skeleton King's Coat",slot:'chest',rar:'named',ac:6,sta:4,str:2,value:120,cls:'bard'},
  // Items lane, draft 2 (v0.119, owner Nov 27). Budget points = STR+STA+WIS+INT+AC/2 by slot (tools/items_draft2.py): white 2, green 4.5,
  // blue 8, Skeleton King and named 9, Malrec 11. Weapons drop by weapon type (WPN_OF), armour by gear group. wt = weapon type, look = look tier.
  gashstaff:{name:'Grave-ash Staff',slot:'weapon',rar:'uncommon',int:3,wis:1,value:40,cls:'caster',wt:'staff',look:2},
  lowmoon:{name:'Staff of the Low Moon',slot:'weapon',rar:'rare',int:5,wis:2,sta:1,value:90,cls:'caster',wt:'staff',look:3},
  tinscep:{name:'Tin Scepter',slot:'weapon',rar:'common',int:1,wis:1,value:8,cls:'caster',wt:'scepter',look:1},
  waxscep:{name:'Candlewax Scepter',slot:'weapon',rar:'uncommon',int:3,wis:1,value:40,cls:'caster',wt:'scepter',look:2},
  emberscep:{name:'Emberglass Scepter',slot:'weapon',rar:'rare',int:5,sta:2,wis:1,value:90,cls:'caster',wt:'scepter',look:3},
  b1scepter:{name:"Skeleton King's Scepter",slot:'weapon',rar:'named',int:6,wis:2,sta:1,value:120,cls:'caster',wt:'scepter',look:3},
  malscepter:{name:"Malrec's Thurible",slot:'weapon',rar:'named',int:7,wis:2,sta:2,value:200,cls:'caster',wt:'scepter',look:4},
  gcrook:{name:'Gnarled Crook',slot:'weapon',rar:'common',int:1,wis:1,value:8,cls:'caster',wt:'crook',look:1},
  mosscrook:{name:'Mossheart Crook',slot:'weapon',rar:'rare',int:4,wis:3,sta:1,value:90,cls:'caster',wt:'crook',look:3},
  b1crook:{name:"Skeleton King's Crook",slot:'weapon',rar:'named',int:5,wis:3,sta:1,value:120,cls:'caster',wt:'crook',look:3},
  malcrook:{name:"Malrec's Briar Crook",slot:'weapon',rar:'named',int:6,wis:4,sta:1,value:200,cls:'caster',wt:'crook',look:4},
  wolfspear:{name:'Wolfbone Spear',slot:'weapon',rar:'rare',wis:3,int:3,sta:2,value:90,cls:'shaman',wt:'spear',look:3},
  gwblade:{name:'Gravewarden Blade',slot:'weapon',rar:'rare',str:5,sta:3,value:90,cls:'warrior',wt:'sword',look:3},
  vigilmace:{name:'Vigil Mace',slot:'weapon',rar:'rare',str:3,wis:3,sta:2,value:90,cls:'cleric',wt:'mace',look:3},
  moonrapier:{name:'Moonsteel Rapier',slot:'weapon',rar:'rare',str:5,sta:2,wis:1,value:90,cls:'bard',wt:'rapier',look:3},
  kris:{name:"Cutthroat's Kris",slot:'weapon',rar:'rare',str:6,sta:2,value:90,cls:'rogue',wt:'dagger',look:3},
  ashbow:{name:'Ashwood Recurve',slot:'weapon',rar:'rare',str:6,sta:2,value:90,cls:'ranger',wt:'bow',look:3},
  ironpalm:{name:'Ironpalm Wraps',slot:'weapon',rar:'rare',str:6,sta:2,value:90,cls:'monk',wt:'wraps',look:3},
  // Two more blues per gear group (every group's only blue was a chest).
  qgcowl:{name:'Cowl of Quiet Graves',slot:'head',rar:'rare',ac:2,int:2,wis:2,sta:1,value:80,cls:'caster'},
  lantern:{name:'Lantern of the Lost',slot:'offhand',rar:'rare',int:3,wis:2,sta:1,value:80,cls:'caster'},
  gwhelm:{name:'Gravewarden Helm',slot:'head',rar:'rare',ac:4,sta:2,str:2,value:80,cls:'warrior'},
  barrowgreaves:{name:'Barrow-iron Greaves',slot:'legs',rar:'rare',ac:4,sta:3,str:1,value:80,cls:'warrior'},
  oathhauberk:{name:'Oathsworn Hauberk',slot:'chest',rar:'rare',ac:7,sta:3,wis:2,value:90,cls:'knight'},
  towervigil:{name:'Tower of the Vigil',slot:'offhand',rar:'rare',ac:5,sta:2,wis:1,value:80,cls:'knight'},
  nvhood:{name:'Nightveil Hood',slot:'head',rar:'rare',ac:2,str:3,sta:2,value:80,cls:'rogue'},
  maingauche:{name:'Fenrunner Main-gauche',slot:'offhand',rar:'rare',str:3,sta:2,ac:1,value:80,cls:'rogue'},
  mitre:{name:'Mitre of Mercy',slot:'head',rar:'rare',ac:3,wis:3,sta:1,value:80,cls:'cleric'},
  sanctward:{name:'Sanctuary Ward',slot:'offhand',rar:'rare',ac:4,wis:2,sta:2,value:80,cls:'cleric'},
  hawkcap:{name:'Hawkfeather Cap',slot:'head',rar:'rare',ac:2,str:3,sta:2,value:80,cls:'ranger'},
  greyquiver:{name:'Quiver of Grey Fletching',slot:'offhand',rar:'rare',str:4,sta:2,value:80,cls:'ranger'},
  windtrousers:{name:'Wind-step Trousers',slot:'legs',rar:'rare',ac:3,str:2,sta:2,value:80,cls:'monk'},
  stonefist:{name:'Stonefist Bindings',slot:'hands',rar:'rare',ac:2,str:2,sta:1,value:70,cls:'monk'},
  antler:{name:'Antler Headdress',slot:'head',rar:'rare',ac:2,wis:3,int:1,sta:1,value:80,cls:'shaman'},
  fentotem:{name:'Totem of the Fen',slot:'offhand',rar:'rare',wis:3,int:2,sta:1,value:80,cls:'shaman'},
  minhat:{name:"Minstrel's Feathered Hat",slot:'head',rar:'rare',ac:2,sta:2,wis:2,str:1,value:80,cls:'bard'},
  lowbells:{name:'Lute of Low Bells',slot:'offhand',rar:'rare',wis:3,int:2,sta:1,value:80,cls:'bard'},
  // Any class: greens for the empty hands and legs slots.
  wolfgloves:{name:'Wolfhide Gloves',slot:'hands',rar:'uncommon',ac:2,sta:1,value:20},
  gdbreeches:{name:"Gravedigger's Breeches",slot:'legs',rar:'uncommon',ac:2,sta:1,str:1,value:25},
  // Each rare mob's own item (src = the mob): when a rare would drop a blue, it's this one, unless you already have it.
  ironbracers:{name:'Ironshell Bracers',slot:'hands',rar:'rare',ac:3,sta:3,value:70,src:'ironshell'},
  tunnelboots:{name:"Tunnel-runner's Boots",slot:'feet',rar:'rare',ac:2,sta:2,str:1,value:70,src:'palerat'},
  brideveil:{name:"Bride's Mourning Veil",slot:'head',rar:'rare',ac:2,wis:3,int:2,value:80,src:'bride'},
  emberring:{name:'Ember-knot Ring',slot:'ring',rar:'rare',sta:2,int:1,wis:1,str:1,value:80,src:'acolyte'},
  scarhands:{name:"Old Scar's Hide Grips",slot:'hands',rar:'named',ac:3,sta:3,str:2,value:110,src:'oldscar'},
  // Greyfang's second pink (owner, Nov 27), beside his ring.
  fangruff:{name:"Greyfang's Ruff",slot:'head',rar:'named',ac:3,sta:3,wis:2,str:1,value:110},
  // Necklaces (v0.128, owner Nov 27): one ring and one necklace. The necklace is the power piece (counts like a head piece in the stat
  // budget, leans into your main stat); the ring is the trick piece (fewer stats, where small tricks live on). Any class, by lean.
  necktwine:{name:'Twine Pendant',slot:'neck',rar:'common',int:1,wis:1,value:8,lean:'caster'},
  neckmoss:{name:'Grave-moss Locket',slot:'neck',rar:'uncommon',int:2,wis:1,sta:1,value:30,lean:'caster'},
  neckmourn:{name:"Mourner's Locket",slot:'neck',rar:'rare',int:3,wis:2,sta:1,value:80,lean:'caster'},
  neckbead:{name:'Bone-bead Necklace',slot:'neck',rar:'common',str:1,sta:1,value:8,lean:'melee'},
  neckfang:{name:'Wolf-fang Necklace',slot:'neck',rar:'uncommon',str:2,sta:2,value:30,lean:'melee'},
  necktorc:{name:"Gravewarden's Torc",slot:'neck',rar:'rare',str:3,sta:2,ac:2,value:80,lean:'melee'},
  // Dungeon 1 (v0.63). The Drowned Prior and the Bellringer each drop one item any class can wear; Brother Malrec's chest holds
  // one for your gear group (a step above the Skeleton King's). Placeholder names until the setting is decided.
  dcultjunk:{name:'Waterlogged Psalter',rar:'junk',value:11,stack:true},
  priorcowl:{name:"Drowned Prior's Cowl",slot:'head',rar:'named',ac:4,sta:3,wis:2,value:150},
  bellband:{name:"Bellringer's Band",slot:'ring',rar:'named',sta:3,str:2,int:1,value:150},
  malstaff:{name:"Malrec's Censer-staff",slot:'weapon',rar:'named',int:7,wis:3,sta:1,value:200,cls:'caster',wt:'staff',look:4},
  malaxe:{name:"Malrec's Headsman Blade",slot:'weapon',rar:'named',str:7,sta:4,value:200,cls:'warrior',wt:'sword',look:4},
  malknife:{name:"Malrec's Ritual Knife",slot:'weapon',rar:'named',value:200,cls:'rogue',wt:'dagger',look:4,str:8,sta:3},
  malmace:{name:"Malrec's Ember Mace",slot:'weapon',rar:'named',value:200,cls:'cleric',wt:'mace',look:4,str:5,wis:4,sta:2},
  malbow:{name:"Malrec's Pyre Bow",slot:'weapon',rar:'named',value:200,cls:'ranger',wt:'bow',look:4,str:8,sta:3},
  malwraps:{name:"Malrec's Penitent Wraps",slot:'weapon',rar:'named',value:200,cls:'monk',wt:'wraps',look:4,str:8,sta:3},
  malspear:{name:"Malrec's Smoke Spear",slot:'weapon',rar:'named',value:200,cls:'shaman',wt:'spear',look:4,int:6,wis:4,sta:1},
  malrapier:{name:"Malrec's Vesper Rapier",slot:'weapon',rar:'named',value:200,cls:'bard',wt:'rapier',look:4,str:7,sta:3,wis:1}
};
// Which mobs drop which summon key, by area (zone id -> mob type -> key). One in KEY_CHANCE kills drops one.
// Pink tricks (v0.121, Items lane, owner Nov 27): each pink does one small thing on top of its stats. Tiny on purpose in Zone 1,
// and one of a kind: later items never repeat a trick, and a trick never shrinks as stats fade, so an old pink can still earn a
// slot in a build later (situational ones shine in zones built around them). Weapons: a trick per class holding it. Named: 'all'.
// on = ability id it rides on; dur = seconds added to what it does; heal / mana = share of your max; cd = cooldown share off;
// share = share of your heal that also goes to your pet; dot = [damage per tick at level 1, + per level, ticks]; more in combat.js.
const TRICKS={
  b1crook:{druid:{on:'root',heal:0.02,desc:'Rootgrip gives a little back: you heal 2% of your health.'}},
  b1blade:{warrior:{on:'bash',taunt:1,desc:'Shield Bash also taunts: the mob turns to you.'},
    shadowknight:{on:'siphon',share:0.25,desc:'Siphon also heals your minion for a quarter of what it heals you.'}},
  b1dagger:{rogue:{on:'gouge',dur:0.5,desc:'Gouge lasts half a second longer.'}},
  b1staff:{necro:{on:'raise',cd:0.1,desc:'Raise Bones comes back 10% sooner.'},wizard:{on:'freeze',dur:0.5,desc:'Freeze lasts half a second longer.'}},
  b1mace:{cleric:{on:['mheal','gheal','renew'],holy:3,desc:'Your heals spark 3 holy damage onto undead near you.'},
    paladin:{on:'hbash',dur:0.5,undead:1,desc:'Holy Bash stuns undead half a second longer.'}},
  b1scepter:{enchanter:{on:'mez',dur:1,desc:'Mesmerize lasts 1 second longer.'},
    magician:{on:['earth','fire'],petFirst:1.25,desc:"Your elemental's first hit after you summon it lands 25% harder."}},
  b1bow:{ranger:{on:'ensnare',dur:1,desc:'Ensnaring Shot lasts 1 second longer.'}},
  b1fists:{monk:{on:'mfeign',heal:0.03,desc:'Feign Death heals you 3% of your health.'}},
  b1spear:{shaman:{on:'drowsy',dur:1,desc:'Drowsy lasts 1 second longer.'}},
  b1rapier:{bard:{on:'lullaby',dur:1,desc:'Lullaby lasts 1 second longer.'}},
  malcrook:{druid:{on:'snare',dot:[1.5,0.15,4],desc:'Tanglefoot also pricks: a tiny thorn tick each second for 4 seconds.'}},
  malaxe:{warrior:{on:'cleave',healPer:0.01,desc:'Cleave heals you 1% of your health for each mob it hits.'},
    shadowknight:{on:'harm',cd:0.1,desc:'Harm Touch comes back 10% sooner.'}},
  malknife:{rogue:{on:'evade',heal:0.03,desc:'Evade heals you 3% of your health.'}},
  malstaff:{necro:{on:'tap',share:0.25,desc:'Lifetap also heals your skeleton for a quarter of what it heals you.'},
    wizard:{on:'blink',frost:1.5,desc:'Blink leaves a puff of frost where you stood: mobs in it are slowed for a moment.'}},
  malmace:{cleric:{on:'turn',dot:[1.5,0.15,3],desc:'Undead fleeing your Turn Undead smoulder: a tiny burn for 3 seconds.'},
    paladin:{on:'consec',dur:1,desc:'Consecrate burns 1 second longer.'}},
  malscepter:{enchanter:{on:'phantasm',dur:1,desc:'Phantasm lasts 1 second longer.'},
    magician:{on:'detonate',embers:[1.5,0.15,2],desc:'Detonate leaves embers that burn mobs it hit for 2 seconds.'}},
  malbow:{ranger:{on:'trap',trap2:0.5,desc:'Spike Trap snaps twice: a second, smaller spike.'}},
  malwraps:{monk:{on:'fkick',knock:8,desc:'Flying Kick knocks the mob back a step.'}},
  malspear:{shaman:{on:'canni',refund:0.15,desc:'Cannibalize costs a little less health.'}},
  malrapier:{bard:{on:'crescendo',mana:0.03,desc:'Crescendo gives back 3% of your mana.'}},
  gnawring:{all:{rats:0.02,desc:'Killing a rat heals you 2% of your health.'}},
  fangring:{all:{firstHit:3,desc:'Your first spell or strike on a mob bites for 3 extra damage.'}},
  fangruff:{all:{noFlee:1,desc:"Hurt wolves can't run from you."}},
  scarhands:{all:{hide:0.1,desc:'Thick hide: once a minute, a hit that drops you under a quarter health makes you take 10% less damage for 5 seconds.'}},
  priorcowl:{all:{wade:1.1,desc:'You wade through water 10% faster.'}},
  bellband:{all:{stun:0.8,desc:'Stuns on you wear off 20% sooner.'}}
};
// Which weapon type each class fights with (owner, Nov 27). Weapons drop for your weapon type, armour for your gear group.
// The Monk's hand wraps never show on the character. The scythe is saved for a special drop later.
const WPN_OF={wizard:'staff',necro:'staff',magician:'scepter',enchanter:'scepter',druid:'crook',shaman:'spear',warrior:'sword',
  shadowknight:'sword',cleric:'mace',paladin:'mace',bard:'rapier',rogue:'dagger',ranger:'bow',monk:'wraps'};
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
  wearDeath:10,                       // each death wears every worn item 10% (repair at any campfire); replaces the XP loss
  // Enchanting (v0.100, owner Nov 27): small sure steps, never fails. Owner: about 10% at +5, felt more than it's big
  // (the +N in the name, a glow at +3 and +5, a flash when it lands). Raise enchStep to make every step stronger.
  enchStep:0.02,enchMax:5,            // each step: +2% of the item's stats (+5 = +10%)
  enchFee:[20,40,80,120,200],         // copper for the step to +1, +2, +3, +4, +5 (plus one orb)
  moveFee:15,                         // copper per step to move an enchant onto a new item of the same slot
  orbMob:1/150,orbMobLv:3,            // normal mobs: an orb about 1 kill in 150, from level 3 mobs up (outside the arena)
  orbRare:0.5,orbNamed:0.25,orbChest:0.1, // rare mobs, named and bosses, hidden chests. Brother Malrec always drops one
  orbPrice:1000,                      // backstop: buy an orb at a campfire for about an hour of copper
  dustPerOrb:40,                      // dust to make one orb
  dust:{common:2,uncommon:5,rare:12,named:25} // dust from breaking down an item of each rarity
};

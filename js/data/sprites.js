// DATA ONLY. Sprites as text grids (one character per pixel) and the colour palette.
// Turning these into pictures happens in render.js.
'use strict';
/* ---------- Sprites (12x16 style, one character per pixel) ---------- */
const PAL={k:'#0b0a0f',n:'#3f6b3a',N:'#2a4a28',o:'#6e4a2a',s:'#d9a77c',y:'#c9a227',m:'#7dffa6',M:'#e6ffee',
  z:'#6f8a5a',Z:'#4d6640',r:'#4a3b33',e:'#ff3b30',a:'#6b6470',A:'#8d8692',c:'#3b4a6b',C:'#6a82b0',w:'#cfc8b2',
  g:'#7f8a9c',G:'#b5bfcc',b:'#2c3a58',l:'#cfd6e0',D:'#24272e',p:'#5a3d6b',P:'#3e2a4b',x:'#bfbfc8',f:'#1a1820',R:'#8f2630'};
const SPR={
  druid:["...n.nn.n.m.","..kNNNNNkmMm","..kNsssNk.o.","..kNkskNk.o.","...kNsNk..o.","..knnnnnkso.",".knnonnnnko.",".knnnonnnko.",".knnnnonnko.",".kyyyyyyyko.",".knnNnnNnko.",".knNnnnnNko.",".knnnNnnnko.","..kNnnnNk.o.","..kok.kok.o.","..kkk.kkk.o."],
  dead:["....kkkk....","...kzzzzk...","...kzezek...","...kzZZzk...","....kzzk....","..kkrrrrkk..",".kzkrrrrkzk.",".kzkrrrrkzk.",".kzkrrrrkzk.","..kkrrrrkk..","...krrrrk...","...kzk.zk...","...kzk.kzk..","...kZk..kZk.","..kzzk..kzzk","..kkkk..kkkk"],
  // Rat (v0.19, monster pass #1): long and low, pointed snout, round pink ear, tail, 4 legs, red eye. 16x8, faces right.
  // Keys: A fur light, a fur, d fur shadow, p pink (ear, nose, feet), P tail. ratstep = the scurry frame.
  rat:["...........kk...","......kkkkkkpk..",".....kAAAAAAAAk.","....kAaaaaaaAeAk","P...kaaaaaaaaaAp",".PPpkdaaaaaaddk.","...kdkddddkddk..","....kpk...kpk..."],
  ratstep:["...........kk...","......kkkkkkpk..",".....kAAAAAAAAk.","....kAaaaaaaAeAk","....kaaaaaaaaaAp","PPPpkdaaaaaaddk.","...kdkddddkddk..","...kpk.....kpk.."],
  // Big tunnel rat (Nov 18, map chat): the same rat a size up (20x10) for the deeper tunnel.
  brat:["...............kk...","........kkkkkkkkpk..","......kkAAAAAAAAAk..",".....kAAaaaaaaaAAAk.","....kAaaaaaaaaaaAeAk","P...kaaaaaaaaaaaaAAp",".P.kdaaaaaaaaaaaadkk","..Pkddaaaaaaaaaaddk.","...kdkddddddddkdk...","....kpk.....kpk....."],
  bratstep:["...............kk...","........kkkkkkkkpk..","......kkAAAAAAAAAk..",".....kAAaaaaaaaAAAk.","....kAaaaaaaaaaaAeAk","P...kaaaaaaaaaaaaAAp",".P.kdaaaaaaaaaaaadkk","PPPkddaaaaaaaaaaddk.","...kdkkdddddddkdkk..","...kpk.......kpk...."],
  // Old Gnawbone (Nov 18, map chat): his own shape, 32x17. Hunched and bristly, scarred back, torn ear, a scar through the eye,
  // long yellow teeth. Extra keys: S scar (bald pink skin), Y teeth.
  gnaw:[".........k.k..k.k.k.............","..........kkkkkkkk.......kk.kk..","........kkAAAAAAAAkk....kpkkpk..",".......kAAAAAAAAAAAAk...kppkpk..","......kAAAaaaSaaaAAAAk.kkpkkkk..",".....kAAaaaaaaSaaaaaAAkAAAAAAk..","....kAaaaaaaaaaSaaaaaaAAAAASAAk.","....kAaaSSaaaaaaaaaaaaaaaAAAeAAk","...kAaaaaSaaaaaaaaaaaaaaaaAAASAp","...kaaaaaaaaaaaaaaaaaaaaaaadaakk","..kdaaaaaaaaaaaaaaaaaaaaaaadkYY.","..kddaaaaaaaaaaaaaaaaaaaaaddkY..","PPkdddaaaaaaaaaaaaaaaaaadddk....","P.Pkkdddddaaaaaaaaaadddddkk.....","P..Pkdkdkkdddddddddkkdkdkk......",".PP.kdk.kdk.......kdk.kdk.......","....kpk..kpk......kpk..kpk......"],
  gnawstep:[".........k.k..k.k.k.............","..........kkkkkkkk.......kk.kk..","........kkAAAAAAAAkk....kpkkpk..",".......kAAAAAAAAAAAAk...kppkpk..","......kAAAaaaSaaaAAAAk.kkpkkkk..",".....kAAaaaaaaSaaaaaAAkAAAAAAk..","....kAaaaaaaaaaSaaaaaaAAAAASAAk.","....kAaaSSaaaaaaaaaaaaaaaAAAeAAk","...kAaaaaSaaaaaaaaaaaaaaaaAAASAp","...kaaaaaaaaaaaaaaaaaaaaaaadaakk","..kdaaaaaaaaaaaaaaaaaaaaaaadkYY.",".Pkdddaaaaaaaaaaaaaaaaaadddk....","P.Pkkdddddaaaaaaaaaadddddkk.....","P..Pkdkdkkdddddddddkkdkdkk......","..PPkdkk.kdk......kdkk.kdk......","....kpk...kpk.....kpk...kpk.....","....kpk..kpk......kpk..kpk......"],
  beetle:["...k..k...","..kkkkkk..",".kcCccCck.","kcccCCccck","kcCccccCck",".kcccccck.",".k.k..k.k."],
  guard:["....kkkk..l.","...kGGGGk.l.","..kGGGGGGkl.","...ksksk..l.","...kssssk.l.","..kgbbbbgkl.",".kgkbyybkgsk",".kgkbyybkgl.",".kskbbbbk.l.","..koooooo.l.","..kbbbbbbkl.","..kgg.ggk.l.","..kgk.kgk.l.","..kgk.kgk.l.","..kDk.kDk.l.","..kkk.kkk.l."],
  peddler:["....kkkk....","...kPPPPk...","..kPPPPPPk..","..kPskskPk..","..kPssssPk..","...kxxxxk...","..kpkxxkpk..",".kpppkkpppk.",".kppppppppk.",".ksppyypppsk",".kpppppppk..",".kppppppppk.",".kPppppppPk.",".kppppppppk.","..kPPPPPPk..","...kkkkkk..."],
  crow:[".ff..","ffff.",".fff.",".f.f."],
  crowfly:["f...f",".fff.","..f.."],
  frog:[".n.n.","nnnnn","n...n"],
  // Magician's elementals: one shape, recoloured per element in render.js (earth, fire).
  elem:["...kkkk...","..kAAAAk..",".kAeAAeAk.",".kAAAAAAk.","..kAaaAk..",".kAAaaAAk.","kAaAAAAaAk","kAaAAAAaAk",".kkAAAAkk.","..kAaaAk..","..kAk.kAk.","..kkk.kkk."],
  // Named rares (v0.32): Ironshell = a mire beetle with a cracked, mossy shell (drawn at 2x, placeholder like Boss 1);
  // the Weeping Bride = a shambling corpse in a torn veil and a long gown (she glides, no legs). The Pale Rat uses the big rat's shape.
  ironshell:["...k..k...","..kkkkkk..",".kmCcmCck.","kccmkCmcck","kcCckccCmk",".kcmcccmk.",".k.k..k.k."],
  bride:["...kvvvvk...","..kvzzzzvk..","..kvzezevk..",".kvvzZZzvvk.",".kv.kzzk.vk.",".kvkrrrrkvk.",".kzkrrrrkzk.",".kzkrrrrkzk.","..vkrrrrkv..","..kkrrrrkk..","..krrrrrrk..","..krrrrrrk..","..krrrrrrk..",".krrrrrrrrk.",".krrrrrrrrk.",".kkkkkkkkkk."],
  blade:["..k..",".klk.",".klk.",".klk.",".klk.",".klk.","kyyyk",".kok.",".kok.","..k.."], // Enchanter's floating sword
  necro:["....kkkk.ww.","...kPPPPkwkw","..kPPPPPPkw.","..kPmkkmPko.","..kPxxxxPko.","...kPxxPk.o.","..kpppppkxo.",".kpppwpppko.",".kppppwppko.",".kpppppwpko.",".kppppppppk.",".kPppppppPk.",".kppppppppk.","..kPPPPPPk..","..kPk..kPk..","..kkk..kkk.."],
  rogue:["....kkkk....","...kffffk...","..kffffffk..","..kfskskfk..","..kfssssfk..","...kfrrfk...","..krrrrrrk..",".krkrrrrkrk.",".krkryyrkrk.",".kskooooksk.",".lkkrrrrkkl.",".l.krrrrk.l.","...krk.krk..","...krk.krk..","...kDk.kDk..","...kkk.kkk.."],
  warrior:["...kkkkk....","..kGGGGGk...","..kGkkkGk...","..kGsksGk..l","..kGssssk..l",".kkgRRRRgk.l","kbbkRyyRgkkl","kbybRyyRgksk","kyyybRRRgk..","kbybkRRRgk..",".kbkoooook..","..kgg.ggk...","..kgk.kgk...","..kgk.kgk...","..kDk.kDk...","..kkk.kkk..."]
};

// Rat colourways: grave rat (grey-brown), crypt rat (pale), tunnel rat (earthy brown), big tunnel rat (darker), Old Gnawbone (his own sprite).
const RAT_PAL={rat:{A:'#8a7a6e',a:'#6b5d52',d:'#463b34',p:'#c98a86',P:'#9a6a66'},crat:{A:'#c4bfc8',a:'#9a94a0',d:'#6b6672',p:'#c98a86',P:'#9a6a66'},
  trat:{A:'#8a6e56',a:'#6a5240',d:'#43342a',p:'#c98a86',P:'#9a6a66'},brat:{A:'#7a604c',a:'#5c4636',d:'#3a2c22',p:'#c08480',P:'#946462'},
  gnaw:{A:'#6e5c52',a:'#4f4038',d:'#2f2520',p:'#b07a76',P:'#8a5a56',S:'#a87a72',Y:'#e6d29a',e:'#ff3b30'}};

// Named rare colourways (v0.32): a colour shift that says "rare" (the faint glow is added when drawn).
const RARE_PAL={ironshell:{c:'#454b40',C:'#7d8670',m:'#55733d'},palerat:{A:'#ece6e0',a:'#cfc6be',d:'#958a82',p:'#f0a8a8',P:'#c88a8a',e:'#ff2a2a'},
  bride:{v:'#d9d5e6',r:'#b8b1c4',z:'#97a68c',Z:'#6c7a63',e:'#b8f0ff'}};

// Wolfwood (v0.40, map chat; drawn in tools/wolfwood_mobs.py, owner OK Nov 19). 24x14 wolves, Greyfang 30x17, the boar 23x12. Face right.
// Keys: A fur light, a fur, d shadow, e eye, m glowing eye, w tooth/tusk, b blight patch, S scar, T thorn ridge, p snout. *step = the walk frame.
const WOLF_SPR={
  wolf:[".................k.k....","............kkk.kAkAk...","......kkkkkkAAAkkAAAAk..",".....kAAAAAAaaaAAAaAAAk.","....kAaaaaaaaaaaaaeaAAAk","...kAaaabbaaaaaaaaaaaakk","..kAaaaabbaaaaaaadwdkkk.",".kAakddaaaaaaaaaaddk....","kAakkddddkkkkddaddk.....",".kk.kakkdk..kakkdk......","....kakkdk..kakkdk......","....kakkdk..kakkdk......","....kaakddk.kaakddk.....",".....kk.kk...kk.kk......"],
  wolfstep:[".................k.k....","............kkk.kAkAk...","......kkkkkkAAAkkAAAAk..",".....kAAAAAAaaaAAAaAAAk.","....kAaaaaaaaaaaaaeaAAAk","...kAaaabbaaaaaaaaaaaakk","..kAaaaabbaaaaaaadwdkkk.",".kAakddaaaaaaaaaaddk....","kAakkddddkkkkddaddk.....",".kk.kakkdk..kakkdk......","...kak..kdkkak..kdk.....","..kak...kdkkak..kdk.....","..kaak..kddkaak.kddk....","...kk....kk.kk...kk....."],
  greyfang:[".....................kk.k.....","...............k.k..kAAkAk....",".............kkAkAkkkAAkAk....","........kkkkkAkAAAAAkAAAAAkk..","......kkAAAAAAAaaaaAAAAaAAAAk.",".....kAAaaaaaaaaaaaaaaamaAAAAk","....kAaaaaaaaaaaaaaaaaaaaaaakk","....kAaaaaaaaaaaaaaaaaaaaaaakk","...kAaaaaaaaaaaaaaaaaddwdkkkk.",".kkAakdddaaaaaaaaaaaadddk.....","kAAakkdddddkkkkkdddadddk......",".kkk.kaakkdk...kaakkdkk.......",".....kaakkdk...kaakkdk........",".....kaakkdk...kaakkdk........",".....kaakkdkk..kaakkdkk.......",".....kaaakdddk.kaaakdddk......","......kkk.kkk...kkk.kkk......."],
  greyfangstep:[".....................kk.k.....","...............k.k..kAAkAk....",".............kkAkAkkkAAkAk....","........kkkkkAkAAAAAkAAAAAkk..","......kkAAAAAAAaaaaAAAAaAAAAk.",".....kAAaaaaaaaaaaaaaaamaAAAAk","....kAaaaaaaaaaaaaaaaaaaaaaakk","....kAaaaaaaaaaaaaaaaaaaaaaakk","...kAaaaaaaaaaaaaaaaaddwdkkkk.",".kkAakdddaaaaaaaaaaaadddk.....","kAAakkdddddkkkkkdddadddk......",".kkk.kaakkdk...kaakkdkk.......",".....kaakkdkk..kaakkdkk.......","....kakk..kddkkakk..kddk......","...kak....kddkkakk..kddk......","...kaak...kdddkaaak.kdddk.....","....kk.....kkk.kkk...kkk......"],
  oldscar:[".................k......","............kkk.kAkk....","......kkkkkkAAAkkAAAkk..",".....kAAAAAAaaaAAASAAAk.","....kAaaaaaaaaaaaaSaAAAk","...kAaaaaaaaaaaaaSaaaakk","..kAaaaaaaaaaaaaadwdkkk.",".kAakddaaaaaaaaaaddk....","kAakkddddkkkkddaddk.....",".kk.kakkdk..kakkdk......","....kakkdk..kakkdk......","....kakkdk..kakkdk......","....kaakddk.kaakddk.....",".....kk.kk...kk.kk......"],
  oldscarstep:[".................k......","............kkk.kAkk....","......kkkkkkAAAkkAAAkk..",".....kAAAAAAaaaAAASAAAk.","....kAaaaaaaaaaaaaSaAAAk","...kAaaaaaaaaaaaaSaaaakk","..kAaaaaaaaaaaaaadwdkkk.",".kAakddaaaaaaaaaaddk....","kAakkddddkkkkddaddk.....",".kk.kakkdk..kakkdk......","...kak..kdkkak..kdk.....","..kak...kdkkak..kdk.....","..kaak..kddkaak.kddk....","...kk....kk.kk...kk....."],
  boar:["........T.T.T..........",".....T.kTkTkTk.........","....kTkAAAAAAAkk.......","...kAAaaaaaaaaAAkk.....","..kAaaaaaaaaaaaaAAk....","kkAaaaaaaaaaaaaaaeAkk..","kkaaaaaaaaaaaaaaaaapkwk",".kaaaaaaaaaaaaaaawwwwk.",".kdaaaaaaaaaaaaaadkkk..","..kddddddddddddddk.....","..kdk.kdk..kdk.kdk.....","..kkk.kkk..kkk.kkk....."],
  boarstep:["........T.T.T..........",".....T.kTkTkTk.........","....kTkAAAAAAAkk.......","...kAAaaaaaaaaAAkk.....","..kAaaaaaaaaaaaaAAk....","kkAaaaaaaaaaaaaaaeAkk..","kkaaaaaaaaaaaaaaaaapkwk",".kaaaaaaaaaaaaaaawwwwk.",".kdaaaaaaaaaaaaaadkkk..","..kddddddddddddddk.....","..kdk.kdk..kdk.kdk.....",".kkk...kkkkkk...kkk...."]
};
const WOLF_PAL={wolf:{A:'#a9acb0',a:'#7d8086',d:'#55585f',b:'#6f7a5c',e:'#ff3b30',w:'#e8e2d4'},greyfang:{A:'#dfe3e8',a:'#aeb4be',d:'#6c7280',m:'#9fe8ff',w:'#f4efe2',e:'#9fe8ff'},oldscar:{A:'#9a948c',a:'#726c66',d:'#45413d',S:'#c98a86',w:'#d8d0bc'},boar:{A:'#8a6448',a:'#6a4a34',d:'#43301f',T:'#e0d4b4',p:'#a0706a',e:'#ff3b30',w:'#efe6cc'}};

/* ---------- Default skin (v0.15) ----------
   One shared body for every class, told apart by colours and weapon. New classes use it until the art redo.
   Body keys: k outline, s skin, h hair or hood, b clothes, B clothes shadow, t trim and belt, u boots.
   Weapons are overlays on the same 12x16 grid ('.' = see-through). Keys: o wood, l steel, y gold, v glow, q shield face. */
const BASE_BODY=["....kkkk....","...khhhhk...","..khhhhhhk..","..khskskhk..","...kssssk...","..kkbttbkk..",".kbbbbbbbbk.",".kBkbbbbkBk.",".kBkbbbbkBk.",".kskttttksk.","..kbbbbbbk..","..kbbBBbbk..","...kbk.kbk..","...kBk.kBk..","...kuk.kuk..","...kkk.kkk.."];
const WEAPONS={
  staff:["..........v.",".........vov","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o."],
  sword:["............","............","..........l.","..........l.","..........l.","..........l.","..........l.","..........l.",".........yyy","..........o."],
  mace:["............","............","............","............","..........l.",".........lll","..........l.","..........o.","..........o.","..........o."],
  dagger:["............","............","............","............","............","............","..........l.","..........l.","..........y.","..........o."],
  shield:["","","","","","","kkkk........","kqyk........","kyyk........","kqyk........","kqqk........",".kk........."],
  bow:["","","","..........o.","...........o","..........lo","..........lo","..........lo","..........lo","..........lo","...........o","..........o."],
  spear:["..........l.",".........lll","..........l.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o.","..........o."],
  lute:["","","","","","","..k.........",".kok........","kooyk.......","koyok.......",".kook.......","..kk........"]
};
// Colours per class. body/shade = clothes, trim = belt and collar, hair = hair or hood, boots, glow = staff tip, shield = shield face.
// Batch 1 classes are listed ahead of time so their look is ready when they land.
const SKINS={
  druid:{body:'#3f6b3a',shade:'#2a4a28',trim:'#c9a227',hair:'#2a4a28',boots:'#6e4a2a',glow:'#7dffa6',weapons:['staff']},
  warrior:{body:'#8f2630',shade:'#5e1a20',trim:'#c9a227',hair:'#6e4a2a',boots:'#24272e',shield:'#6a82b0',weapons:['sword','shield']},
  rogue:{body:'#4a3b33',shade:'#2e2420',trim:'#8d8692',hair:'#1a1820',boots:'#24272e',weapons:['dagger']},
  necro:{body:'#2e2338',shade:'#1d1626',trim:'#b8b4c4',hair:'#1d1626',boots:'#1d1626',glow:'#b48cff',weapons:['staff']},
  cleric:{body:'#cfc8b2',shade:'#9a9282',trim:'#c9a227',hair:'#6e4a2a',boots:'#6e4a2a',shield:'#c9a227',weapons:['mace','shield']},
  enchanter:{body:'#6a4fa3',shade:'#45336e',trim:'#e0c3ff',hair:'#c9a227',boots:'#45336e',glow:'#e0c3ff',weapons:['staff']},
  paladin:{body:'#cfd6e0',shade:'#8d96a6',trim:'#c9a227',hair:'#c9a227',boots:'#8d96a6',shield:'#3b6fd1',weapons:['sword','shield']},
  shadowknight:{body:'#24272e',shade:'#15161b',trim:'#a3252f',hair:'#3a3442',boots:'#15161b',shield:'#3a3442',weapons:['sword','shield']},
  wizard:{body:'#3b4a6b',shade:'#2c3a58',trim:'#c9a227',hair:'#cfc8b2',boots:'#2c3a58',glow:'#7dbbff',weapons:['staff']},
  // Batch 2 (v0.18)
  magician:{body:'#a3452a',shade:'#6e2c1a',trim:'#ffd27a',hair:'#3a2418',boots:'#3a2418',glow:'#ff9a4a',weapons:['staff']},
  ranger:{body:'#4d6640',shade:'#33452a',trim:'#8a6a48',hair:'#8a6a48',boots:'#4a3b33',weapons:['bow']},
  monk:{body:'#d9a24a',shade:'#a3742e',trim:'#24272e',hair:'#1a1820',boots:'#6e4a2a',weapons:[]},
  shaman:{body:'#3e7a7a',shade:'#2a5454',trim:'#c9a227',hair:'#2a1e16',boots:'#4a3b33',weapons:['spear']},
  bard:{body:'#b0306a',shade:'#7a2048',trim:'#ffd27a',hair:'#c9a227',boots:'#4a3b33',weapons:['sword','lute']}
};

/* ---------- Rags: gear tier 0 (v0.25: 20x24) ----------
   The A+B mix look (take 1) at the picked size, 20x24 (owner, Nov 18): 8-row heads, 16-row bodies.
   The two bodies and the Druid and Paladin heads come straight from the character-size mock-up (draft 4);
   the other heads follow the same pattern. Everyone starts in rags and sticks; the head and starter weapon
   tell classes apart. Later gear tiers add their own looks.
   Keys: k outline, H/n/N/d cloth light to dark (sackcloth with a light class dye), y rope belt, w leg wraps,
   O foot wraps, S lit hand, s skin, e eyes, h hair, A/a/Q hood light to dark, m glowing eyes, R accent,
   W pale cloth or bone, I/i iron, T headband, L leaf, o wood, l rusty steel. Hand is at x15 y13. */
const RAG_COMMON={"k": "#0b0a0f", "y": "#9c8a5a", "w": "#8a7f70", "O": "#4a3b33", "S": "#f0c99a", "s": "#d9a77c", "e": "#1a1820", "o": "#6e4a2a", "l": "#8f8a86", "L": "#5f8a3a"};
const RAG_HEADS={
  druid:["......kLLLLk",".....kLhLLhLk","....khhhhhhhhk","....khhhhhhhhk","....khsssssshk","....kssessessk","....kssssssssk",".....kssssssk"],
  warrior:["......kkkkkk",".....khhhhhhk","...RkRRRRRRRRk","....khhhhhhhhk","....khsssssshk","....kssessessk","....kssssssssk",".....kssssssk"],
  paladin:["......kkkkkk",".....khhhhhhk","....kIIIIIIIIk","....khhhhhhhhk","....khsssssshk","....kssessessk","....kssssssssk",".....kssssssk"],
  shadowknight:["......kkkkkk",".....kIIIIIIk","....kIIIIIIIIk","....kIIIIIIIIk","....kiiiiiiiik","....kkkmkkmkkk","....kiiiiiiiik",".....kiiiiiik"],
  rogue:[".......kkk","......kAaak",".....kAaaaaQk","....kAaaaaaaQk","....kAkkkkkkQk","....kAsessesQk","....kARRRRRRQk",".....kRRRRRRk"],
  necro:[".......kkk","......kAaak",".....kAaaaaQk","....kAaaaaaaQk","....kAkkkkkkQk","....kAkmkkmkQk","....kAkkkkkkQk",".....kQQQQQQk"],
  ranger:[".......kkk","......kAaak",".....kAaaaaQk","....kAaaaaaaQk","....kAssssssQk","....kAsessesQk","....kAssssssQk",".....kssssssk"],
  cleric:["......kkkkkk",".....kWWWWWWk","....kWWWWWWWWk","....kWhhhhhhWk","....kWssssssWk","....kWsessesWk","....kWssssssWk",".....kWssssWk"],
  enchanter:["......kkkkkk",".....kAaaaaQk","....kAaaaaaaQk","....kAWWWWWWQk","....kWWWWWWWWk","....kWWmWWmWWk","....kWWWWWWWWk",".....kWWWWWWk"],
  wizard:["........kk",".......kAak","......kAaaak",".....kAaaaaQk","..kAAAaaaaaQQQk","....kssessessk","....ksWWWWWWsk",".....kWWWWWWk"],
  magician:["........kRk","......kRRRRk",".....kRRRRRRk","....kRRRRRRRRk","....khRRRRRRhk","....khsssssshk","....kssessessk",".....kssssssk"],
  shaman:["......kkkkkk.W",".....khhhhhhkW","....khhhhhhhhk","....khhhhhhhhk","....khsssssshk","....kRReRReRRk","....kssssssssk","...khksssssskhk"],
  monk:["......kkkkkk",".....kssssssk","....kssssssssk","..TTkTTTTTTTTk","....kssssssssk","....kssessessk","....kssssssssk",".....kssssssk"],
  bard:[".......kkkk...R",".....kAAAAAAk.R","....kAAAAAAAAkR","....khhhhhhhhk","....khsssssshk","....kssessessk","....kssssssssk",".....kssssssk"]
};
const RAG_BODIES={  // rag = robe to the knee (casters), tunic = short tunic and trousers (fighters). From the mock-up.
  rag:["......kHnnNk",".....kHnnnnNk","....kHnnnnnnNk","...kHnnnnnnnnNk","...kHnnnnnnnnNk","...kHyyyyyyyyNkS","...kHnnnnnnnnNk","...kHnnnnnnNNNk",
    "...kHnnnnnNNNNk","...kHnnnnNNNNdk","...kHkNnkNkNNdk","....kwwk..kwwk","....kwwk..kwwk","....kwwk..kwwk","....kOOk..kOOk","....kkkk..kkkk"],
  tunic:["......kHnnNk",".....kHnnnnNk","....kHnnnnnnNk","...kHnnnnnnnnNk","...kHnnnnnnnnNk","...kHyyyyyyyyNkS","...kHnnnnnnnnNk","...kHnnnnnnNNNk",
    "...kHkNnkNnkNNk","....kwwwwwwwwk","....kwwk..kwwk","....kwwk..kwwk","....kwwk..kwwk","....kwwk..kwwk","....kOOk..kOOk","....kkkk..kkkk"]
};
// Weapons: each is a list of [first row, rows] pieces laid over the 20x24 grid ('.' = see-through).
const RAG_WEAPONS={
  stick:[[2,Array(22).fill("................o")]],
  leafstick:[[1,[".................L"].concat(Array(23).fill("................o"))]],
  club:[[5,["..............kkkkk","..............koook","..............koOok","..............koook","..............kooOk","..............kkkkk","................o","................o","................o","................o"]]],
  sword:[[4,["................k","...............klk","...............klk","...............klk","...............klk","...............klk","...............klk","..............kooook","................o","...............So","................o"]]],
  shield:[[11,["kkkkk","kooOk","koOok","kOook","kooOk","kOook","kkkkk"]]],
  dagger:[[9,["................k","...............klk","...............klk","...............klk","................o","................o"]]],
  offknife:[[13,[".kS",".klk",".klk","..k"]]],
  bow:[[3,[".................k","..................o"].concat(Array(13).fill(".................wo"),["..................o",".................k"])]],
  spear:[[0,["................W","...............kWk","................y"].concat(Array(21).fill("................o"))]],
  lute:[[10,["k",".o",".kok","koook","kokok","koook",".kkk"]]],
  wraps:[[14,["..w.............w"]]]
};
// Ruined Chapel (v0.62, placeholders until the character design pass; shapes from tools/chapel_takes.py take A):
// hooded fen cultists drawn from one robed shape (render.js mkRobed): w x h, robe colour, eye colour and what they hold.
// zealot rust-red with a sickle, ashcaller grey with an ember held up, chanter purple with a censer; the Ashen Acolyte pale
// grey, a size bigger, ember eyes and a censer trailing smoke.
const ROBED={zealot:{w:14,h:19,robe:'#5a2a24',eye:'#ff4a30',item:'sickle'},ashcaller:{w:14,h:19,robe:'#5c5a5e',eye:'#ff4a30',item:'ember'},
  chanter:{w:14,h:19,robe:'#3e3a56',eye:'#ff4a30',item:'censer'},acolyte:{w:16,h:21,robe:'#8a8682',eye:'#ffb060',item:'censer'},
  // Dungeon 1 (v0.63, placeholders until the character design pass): the mender in pale sage with a book; the deacon a size up,
  // oxblood with a mace; the Drowned Prior bloated and big in a rotted grey-green habit, weed hanging off him, pale eyes, a dead
  // lantern; the Bellringer the biggest, soot-brown, with the bell's clapper as a maul; Brother Malrec in black and red with
  // ember eyes and a tall censer-staff.
  mender:{w:14,h:19,robe:'#5a6a52',eye:'#ff4a30',item:'book'},deacon:{w:15,h:20,robe:'#4a1c1e',eye:'#ff4a30',item:'mace'},
  prior:{w:20,h:23,robe:'#3e4a44',eye:'#d8f0e8',item:'lantern'},bellringer:{w:22,h:25,robe:'#4a3a2c',eye:'#ff6a30',item:'maul'},
  malrec:{w:18,h:23,robe:'#2a1a1e',eye:'#ffb060',item:'staff'},
  // v0.66 (placeholder): the cult summoner in ember-orange, holding up the coal its great wisp was lit from.
  summoner:{w:14,h:19,robe:'#6a3a1c',eye:'#ffb060',item:'ember'}};
// Ash wisp: a floating candle flame with a smoky tail (9 x 15), two frames that flicker.
const WISP_SPR=[["....k....","...kyk...","...kyk...","..kyYyk..","..kYWYk..",".kyYWYyk.",".kyYWWYk.","kyYWWWYyk","kyYWWWYyk","kyyYWYyyk",".kyyYyyk.","..kkkkk..","...ss....","....s....","...s....."],
  ["...k.....","...kyk...","..kyyk...","..kyYyk..","..kYWYk..",".kyYWYyk.",".kyYWWYk.","kyYWWWYyk","kyYWWWYyk","kyyYWYyyk",".kyyYyyk.","..kkkkk..","....ss...","...s.....","....s...."]];
const WISP_PAL={k:'#3a1a10',y:'#ff8a3c',Y:'#ffd070',W:'#fff6d8',s:'#6a6670'};
// Undead and Brother Malrec (v0.65, character chat; drawn in tools/undead_mobs.py, owner OK Nov 21). Outlined grids, face right.
// skel = crypt skeleton (rusty sword, broken shield), pet = Necro skeleton (clean bone, bone club), minion = Shadow Knight's (dark bone),
// corpse = shambling corpse (hunched, reaching), king = the Skeleton King, malrec = Brother Malrec (tall gold-tipped hood, ember eyes, grand vestments).
const UNDEAD_SPR={
  skel:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwk.k..", "...kwWheWhekkGk.", "...kbWWWhWWkkgk.", "....kbWhWhWkkrk.", ".....kbwwwk.kgk.", "..kkkkkbkkkkkgk.", ".kibwWWWWWWwkrk.", "kisSiWWbWWWkwgk.", "kisSskkbkkkkwgk.", "kiSsSkWWbWWkyyyk", "kisSskkbkkkkWok.", ".kiSkwWWWWwkkok.", "..kkkbkkkbk.kyk.", "....kwk.kwk..k..", "....kWk.kWk.....", "....kwk.kwk.....", "....kwwkkwwk....", ".....kk..kk....."],
  skelstep:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwk.k..", "...kwWheWhekkGk.", "...kbWWWhWWkkgk.", "....kbWhWhWkkrk.", ".....kbwwwk.kgk.", "..kkkkkbkkkkkgk.", ".kibwWWWWWWwkrk.", "kisSiWWbWWWkwgk.", "kisSskkbkkkkwgk.", "kiSsSkWWbWWkyyyk", "kisSskkbkkkkWok.", ".kiSkwWWWWwkkok.", "..kkbkkkkkbk.k..", "...kwk...kwk....", "..kWk.....kWk...", "..kwk.....kwk...", ".kwwk.....kwwk..", "..kk.......kk..."],
  pet:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwkkk..", "...kwWheWhekWWk.", "...kbWWWhWWkwWWk", "....kbWhWhWkkwk.", ".....kbwwwk.kwk.", "...kkkkbkkkkkbk.", "..kbwWWWWWWwkwk.", ".kbkkWWbWWWkwwk.", ".kbk.kkbkkkkwwk.", ".kbk.kWWbWWkWWk.", ".kbk.kkbkkkkWWwk", ".kbkkwWWWWwkkkk.", "..k.kbkkkbk.....", "....kwk.kwk.....", "....kWk.kWk.....", "....kwk.kwk.....", "....kwwkkwwk....", ".....kk..kk....."],
  petstep:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwkkk..", "...kwWheWhekWWk.", "...kbWWWhWWkwWWk", "....kbWhWhWkkwk.", ".....kbwwwk.kwk.", "...kkkkbkkkkkbk.", "..kbwWWWWWWwkwk.", ".kbkkWWbWWWkwwk.", ".kbk.kkbkkkkwwk.", ".kbk.kWWbWWkWWk.", ".kbk.kkbkkkkWWwk", ".kbkkwWWWWwkkkk.", "..kkbkkkkkbk....", "...kwk...kwk....", "..kWk.....kWk...", "..kwk.....kwk...", ".kwwk.....kwwk..", "..kk.......kk..."],
  minion:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwk.k..", "...kwWheWhekkGk.", "...kbWWWhWWkkgk.", "....kbWhWhWkkrk.", ".....kbwwwk.kgk.", "...kkkkbkkkkkgk.", "..kbwWWWWWWwkrk.", ".kbkkWWbWWWkwgk.", ".kbk.kkbkkkkwgk.", ".kbk.kWWbWWkyyyk", ".kbk.kkbkkkkWok.", ".kbkkwWWWWwkkok.", "..k.kbkkkbk.kyk.", "....kwk.kwk..k..", "....kWk.kWk.....", "....kwk.kwk.....", "....kwwkkwwk....", ".....kk..kk....."],
  minionstep:[".....kkkkk......", "....kwWWWwk.....", "...kwWWWWWwk.k..", "...kwWheWhekkGk.", "...kbWWWhWWkkgk.", "....kbWhWhWkkrk.", ".....kbwwwk.kgk.", "...kkkkbkkkkkgk.", "..kbwWWWWWWwkrk.", ".kbkkWWbWWWkwgk.", ".kbk.kkbkkkkwgk.", ".kbk.kWWbWWkyyyk", ".kbk.kkbkkkkWok.", ".kbkkwWWWWwkkok.", "..kkbkkkkkbk.k..", "...kwk...kwk....", "..kWk.....kWk...", "..kwk.....kwk...", ".kwwk.....kwwk..", "..kk.......kk..."],
  corpse:["......kkkkk.....", ".....kdsSSsk....", "....kdsSSSSsk...", "....kdsShSeSk...", "....kdssSSSsk...", ".....kdsshhhk...", ".....kkdsWhWk...", "....kqcCCcdkkkk.", "...kqcCCCCCsSSsk", "...kqcCCCCdssSSk", "...kqcCxCcqddddk", "...kqcxhxcqkkddk", "...kqcCCmCqk.kk.", "...kqkcmckqk....", "...ktTttTtk.....", "...ktTkkttk.....", "...ktTk.kttk....", "...kddk..ktsk...", "...kddk..ksSk...", "....kk....kk...."],
  corpsestep:["......kkkkk.....", ".....kdsSSsk....", "....kdsSSSSsk...", "....kdsShSeSk...", "....kdssSSSsk...", ".....kdsshhhk...", ".....kkdsWhWk...", "....kqcCCcdkkkk.", "...kqcCCCCCsSSsk", "...kqcCCCCdssSSk", "...kqcCxCcqddddk", "...kqcxhxcqkkddk", "...kqcCCmCqk.kk.", "...kqkcmckqk....", "...ktTttTtk.....", "...ktTkttk......", "..ktTk.kttk.....", "..kddk.ktsk.....", "..kddk.ksSk.....", "...kk...kk......"],
  king:[".......k...k...k........", "......kykkkykkkyk.......", "......kyYyyYyyYyk.......", "......koyyyRyyyok.......", "......kwWWWWWWWwk.......", ".....kwWWWWWWWWWwk......", ".....kwWhEWWWhEWwk......", ".....kwWEeWWWEeWwk......", ".....kbWWWWhWWWWwk......", "......kbWhWhWhWwk.......", "....kkkkbwWwWwbkkkk.k...", "...kFFfFFFFFFFFfFFFkYk..", "..kFFFFFFfFFFFFFFfFFkok.", "..kqpQFWWWbWWWFQppQwok..", ".kqppQkWWWbWWWkQppwWyk..", ".kqpQkkkkkkkkkbQpQWyyyk.", ".kqpQkWWWWbWWWWkQQkkgk..", ".kqpQkkkkkkkkkkbQpkkGk..", "kqppQkkWWWbWWWkkQpkkgk..", "kqppQk.kkkkbkk.kQpkkGk..", "kqpQQk.kwWWWWwkkQppkgk..", "kqpQk.kwWWbWWWwkQQpkGk..", "kqppQkkbkkkkkkbkQppkgk..", "kqpQQkkwk....kwkkQpkGk..", "kqppQkkWk....kWkkQpkgk..", ".kqpQkkwk....kwkkQpklk..", ".kqqpkkwk....kwkqQpklk..", "..kqqkwwwk..kwwwkqqkklk.", "...kk.kkk....kkk.kk..k.."],
  kingstep:[".......k...k...k........", "......kykkkykkkyk.......", "......kyYyyYyyYyk.......", "......koyyyRyyyok.......", "......kwWWWWWWWwk.......", ".....kwWWWWWWWWWwk......", ".....kwWhEWWWhEWwk......", ".....kwWEeWWWEeWwk......", ".....kbWWWWhWWWWwk......", "......kbWhWhWhWwk.......", "....kkkkbwWwWwbkkkk.k...", "...kFFfFFFFFFFFfFFFkYk..", "..kFFFFFFfFFFFFFFfFFkok.", "..kqpQFWWWbWWWFQppQwok..", ".kqppQkWWWbWWWkQppwWyk..", ".kqpQkkkkkkkkkbQpQWyyyk.", ".kqpQkWWWWbWWWWkQQkkgk..", ".kqpQkkkkkkkkkkbQpkkGk..", "kqppQkkWWWbWWWkkQpkkgk..", "kqppQk.kkkkbkk.kQpkkGk..", "kqpQQk.kwWWWWwkkQppkgk..", "kqpQk.kwWWbWWWwkQQpkGk..", "kqpQQkbkkkkkkkbkQppkGk..", "kqppQkwk......kwkQpkgk..", "kqpQQWk.......kWkQpkGk..", ".kqpQwk........kwQpklk..", ".kqqpwk........kwqpklk..", "..kqwwk........kwwqkklk.", "...kkk..........kkk..k.."],
  malrec:[".........kk........kk...", "........kyYk......kssk..", ".......kBByk.....kskksk.", "......kBBBByk....kskkck.", ".....kBBBBBByk...kskcfck", ".....kBhhhhByk...kskcFck", "....kbBhehheByk..kskccck", "....kbBhhhhhByk..kskkkmk", "....kbByhhhyByk..kskkmk.", "...kbBBYyyyyYBBkkksk.kmk", "..kbBBByRyyRyBBBwksk..k.", ".kbBBBByRRRRyBBBwwsk....", ".kbBBByRRYYRRyBBBksk....", "kbBBBByRRyyRRyBBBksk....", "kbBBBByRrYYrRyBBBksk....", "kbBBByRRrYYrRRyBBksk....", "kbBBByRRryyrRRyBBksk....", "kbBBByRRrYYrRRyBBksk....", "kbBBByRRryyrRRyBBBsk....", "kbBByRRRrYYrRRRyBBsk....", "kbBByRRRryyrRRRyBBsk....", "kbByRRRRrYYrRRRRyBsk....", "kbByRRRRryyrRRRRyBsk....", "kbyRRRRRrYYrRRRRRysk....", "kbyyyyyyyyyyyyyyyysk....", "kbRRRRRRRRRRRRRRRbsk....", ".kbbbbbbbbbbbbbbbksk....", "..kkkkkkkkkkkkkkk.k....."],
  malrecstep:[".........kk........kk...", "........kyYk......kssk..", ".......kBByk.....kskksk.", "......kBBBByk....kskkck.", ".....kBBBBBByk...kskcfck", ".....kBhhhhByk...kskcFck", "....kbBhehheByk..kskccck", "....kbBhhhhhByk..kskkkmk", "....kbByhhhyByk..kskkmk.", "...kbBBYyyyyYBBkkksk.kmk", "..kbBBByRyyRyBBBwksk..k.", ".kbBBBByRRRRyBBBwwsk....", ".kbBBByRRYYRRyBBBksk....", "kbBBBByRRyyRRyBBBksk....", "kbBBBByRrYYrRyBBBksk....", "kbBBByRRrYYrRRyBBksk....", "kbBBByRRryyrRRyBBksk....", "kbBBByRRrYYrRRyBBksk....", "kbBBByRRryyrRRyBBBsk....", "kbBByRRRrYYrRRRyBBsk....", "kbBByRRRryyrRRRyBBsk....", "kbByRRRRrYYrRRRRyBsk....", "kbByRRRRryyrRRRRyBsk....", "kbyRRRRRrYYrRRRRRysk....", "kbyyyyyyyyyyyyyyyysk....", "kbRRRRRRRRbbbbbbbbsk....", ".kbbbbbbbbkkkkkkkksk....", "..kkkkkkkk........k....."],
};
const UNDEAD_PAL={
  skel:{"k": "#0b0a0f", "h": "#1c1418", "W": "#e4dccb", "w": "#bdb39c", "b": "#857b69", "e": "#ff3b30", "g": "#9a9ca4", "G": "#c4c6cc", "r": "#8a5232", "y": "#b08a3a", "o": "#5a3a24", "s": "#7a5a3a", "S": "#5a4028", "i": "#8a8a90"},
  pet:{"k": "#0b0a0f", "h": "#1c1418", "W": "#f0ead8", "w": "#cfc8b2", "b": "#9a9282", "e": "#7dffa6", "g": "#9a9ca4", "G": "#c4c6cc", "r": "#8a5232", "y": "#b08a3a", "o": "#5a3a24", "s": "#7a5a3a", "S": "#5a4028", "i": "#8a8a90"},
  minion:{"k": "#0b0a0f", "h": "#1c1418", "W": "#a8a092", "w": "#857d70", "b": "#5a5248", "e": "#ff3b30", "g": "#9a9ca4", "G": "#c4c6cc", "r": "#8a5232", "y": "#b08a3a", "o": "#5a3a24", "s": "#7a5a3a", "S": "#5a4028", "i": "#8a8a90"},
  corpse:{"k": "#0b0a0f", "h": "#1c1418", "S": "#9cae86", "s": "#748a62", "d": "#4f6243", "e": "#ffd23a", "c": "#857a60", "C": "#a39478", "q": "#5a4e3c", "x": "#d8cfb8", "m": "#6a1c1c", "t": "#3e3a48", "T": "#2a2732", "W": "#d8cfb8"},
  king:{"k": "#0b0a0f", "h": "#1c1418", "W": "#e4dccb", "w": "#bdb39c", "b": "#857b69", "e": "#9a6aff", "E": "#e8d8ff", "Y": "#f0d070", "y": "#c9a227", "o": "#7a5a1a", "R": "#d0283a", "F": "#ece6dc", "f": "#1c1418", "q": "#2a1a44", "p": "#3d2a63", "Q": "#5a3f8a", "g": "#9a9ca4", "G": "#c4c6cc", "l": "#6a6c74", "a": "#5a3a24"},
  malrec:{"k": "#0b0a0f", "h": "#0e0a0c", "B": "#2a1d22", "b": "#160e12", "R": "#8a1e24", "r": "#5a1418", "Y": "#f0d070", "y": "#c9a227", "o": "#7a5a1a", "e": "#ffb060", "E": "#fff0c0", "s": "#5a3a24", "c": "#6a6470", "f": "#ff8a3c", "F": "#ffd070", "m": "#6a6670", "w": "#cfc0b0", "v": "#8a7a70", "g": "#9a948c", "G": "#6a645e"}};
// Great ash wisp (v0.66, Dungeon 1; placeholder): a bigger flame (13 x 21) with licks of fire at its sides, two dark eyes in
// the white-hot core and a heavier smoke tail. Same colours as the ash wisp, so it reads as its big cousin. Two frames.
const GWISP_SPR=[["......k......",".....kyk.....","..k..kyk..k..",".kyk.kYk.kyk.",".kyk.kYk.kyk.",".kyykyYykyyk.","..kyyYWYyyk..",".kyyYWWWYyyk.","kyyYWWWWWYyyk","kyYWWEWEWWYyk","kyYWWWWWWWYyk","kyYWWWWWWWYyk","kyyYWWWWWYyyk",".kyyYWWWYyyk.",".kyyyYYYyyyk.","..kyyyyyyyk..","...kkkkkkk...","....ss.ss....",".....sss.....","......s......",".....s......."],
  ["......k......","......kyk....",".k...kyk...k.","kyk..kYk..kyk","kyk..kYk..kyk",".kyykyYykyyk.","..kyyYWYyyk..",".kyyYWWWYyyk.","kyyYWWWWWYyyk","kyYWWEWEWWYyk","kyYWWWWWWWYyk","kyYWWWWWWWYyk","kyyYWWWWWYyyk",".kyyYWWWYyyk.",".kyyyYYYyyyk.","..kyyyyyyyk..","...kkkkkkk...","...ss..ss....","....sss......",".......s.....","......s......"]];
const GWISP_PAL=Object.assign({},WISP_PAL,{E:'#3a1a10'});
const RAGS={
  druid:{"body":"rag","w":["leafstick"],"c":{"H":"#686d56","n":"#535a44","N":"#3e4734","d":"#303a28","h":"#6e4a2a"}},
  warrior:{"body":"tunic","w":["sword","shield"],"c":{"H":"#805853","n":"#6b4542","N":"#563231","d":"#482526","h":"#6e4a2a","R":"#8f2630"}},
  paladin:{"body":"tunic","w":["sword","shield"],"c":{"H":"#948d88","n":"#7e7a76","N":"#6a6766","d":"#5c5a5a","h":"#c9a227","I":"#8a8d9c"}},
  shadowknight:{"body":"tunic","w":["sword","shield"],"c":{"H":"#605952","n":"#4b4541","N":"#363230","d":"#282625","I":"#4c4d5c","i":"#2e2f38","m":"#ff3b30"}},
  rogue:{"body":"tunic","w":["dagger","offknife"],"c":{"H":"#6c5f54","n":"#574b42","N":"#423832","d":"#342c26","A":"#3a3238","a":"#2a2428","Q":"#1a1618","R":"#8f2630"}},
  necro:{"body":"rag","w":["stick"],"c":{"H":"#635855","n":"#4e4444","N":"#393133","d":"#2b2428","A":"#4a423c","a":"#332d29","Q":"#221e1b","m":"#9a7ac0"}},
  ranger:{"body":"tunic","w":["bow"],"c":{"H":"#6c6c58","n":"#575846","N":"#424536","d":"#34382a","A":"#5a6e44","a":"#43532f","Q":"#2e3a20"}},
  cleric:{"body":"rag","w":["club"],"c":{"H":"#94897a","n":"#7e7568","N":"#6a6258","d":"#5c564c","W":"#bdb39a","h":"#6e4a2a"}},
  enchanter:{"body":"rag","w":["stick"],"c":{"H":"#756576","n":"#605164","N":"#4b3e53","d":"#3d3248","A":"#5a4a7a","a":"#45336e","Q":"#2e2248","W":"#e8e2d4","m":"#b48cff"}},
  wizard:{"body":"rag","w":["stick"],"c":{"H":"#676365","n":"#525053","N":"#3d3d42","d":"#2f3037","A":"#4a5a80","a":"#3b4a6b","Q":"#2c3a58","W":"#cfc8b2"}},
  magician:{"body":"rag","w":["stick"],"c":{"H":"#866251","n":"#714e40","N":"#5c3b2f","d":"#4e2f24","R":"#a3452a","h":"#3a2418"}},
  shaman:{"body":"rag","w":["spear"],"c":{"H":"#687269","n":"#535e58","N":"#3e4b47","d":"#303e3c","h":"#2a1e16","R":"#a33a2a","W":"#e2d8bf"}},
  monk:{"body":"tunic","w":["wraps"],"c":{"H":"#967e5b","n":"#826a49","N":"#6c5738","d":"#5e4a2d","T":"#24272e","w":"#8a7f70"}},
  bard:{"body":"tunic","w":["dagger","lute"],"c":{"H":"#8a5b64","n":"#754853","N":"#603542","d":"#522837","A":"#7a3050","R":"#ffd27a","h":"#c9a227"}}
};

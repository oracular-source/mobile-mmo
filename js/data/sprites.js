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
  beetle:["...k..k...","..kkkkkk..",".kcCccCck.","kcccCCccck","kcCccccCck",".kcccccck.",".k.k..k.k."],
  guard:["....kkkk..l.","...kGGGGk.l.","..kGGGGGGkl.","...ksksk..l.","...kssssk.l.","..kgbbbbgkl.",".kgkbyybkgsk",".kgkbyybkgl.",".kskbbbbk.l.","..koooooo.l.","..kbbbbbbkl.","..kgg.ggk.l.","..kgk.kgk.l.","..kgk.kgk.l.","..kDk.kDk.l.","..kkk.kkk.l."],
  peddler:["....kkkk....","...kPPPPk...","..kPPPPPPk..","..kPskskPk..","..kPssssPk..","...kxxxxk...","..kpkxxkpk..",".kpppkkpppk.",".kppppppppk.",".ksppyypppsk",".kpppppppk..",".kppppppppk.",".kPppppppPk.",".kppppppppk.","..kPPPPPPk..","...kkkkkk..."],
  crow:[".ff..","ffff.",".fff.",".f.f."],
  crowfly:["f...f",".fff.","..f.."],
  frog:[".n.n.","nnnnn","n...n"],
  // Magician's elementals: one shape, recoloured per element in render.js (earth, fire).
  elem:["...kkkk...","..kAAAAk..",".kAeAAeAk.",".kAAAAAAk.","..kAaaAk..",".kAAaaAAk.","kAaAAAAaAk","kAaAAAAaAk",".kkAAAAkk.","..kAaaAk..","..kAk.kAk.","..kkk.kkk."],
  blade:["..k..",".klk.",".klk.",".klk.",".klk.",".klk.","kyyyk",".kok.",".kok.","..k.."], // Enchanter's floating sword
  necro:["....kkkk.ww.","...kPPPPkwkw","..kPPPPPPkw.","..kPmkkmPko.","..kPxxxxPko.","...kPxxPk.o.","..kpppppkxo.",".kpppwpppko.",".kppppwppko.",".kpppppwpko.",".kppppppppk.",".kPppppppPk.",".kppppppppk.","..kPPPPPPk..","..kPk..kPk..","..kkk..kkk.."],
  rogue:["....kkkk....","...kffffk...","..kffffffk..","..kfskskfk..","..kfssssfk..","...kfrrfk...","..krrrrrrk..",".krkrrrrkrk.",".krkryyrkrk.",".kskooooksk.",".lkkrrrrkkl.",".l.krrrrk.l.","...krk.krk..","...krk.krk..","...kDk.kDk..","...kkk.kkk.."],
  warrior:["...kkkkk....","..kGGGGGk...","..kGkkkGk...","..kGsksGk..l","..kGssssk..l",".kkgRRRRgk.l","kbbkRyyRgkkl","kbybRyyRgksk","kyyybRRRgk..","kbybkRRRgk..",".kbkoooook..","..kgg.ggk...","..kgk.kgk...","..kgk.kgk...","..kDk.kDk...","..kkk.kkk..."]
};

// Rat colourways: grave rat (grey-brown), crypt rat (pale), Old Gnawbone (dark; drawn 2x until he gets his own sprite).
const RAT_PAL={rat:{A:'#8a7a6e',a:'#6b5d52',d:'#463b34',p:'#c98a86',P:'#9a6a66'},crat:{A:'#c4bfc8',a:'#9a94a0',d:'#6b6672',p:'#c98a86',P:'#9a6a66'},gnaw:{A:'#6e5048',a:'#4f3832',d:'#2f221f',p:'#b07a76',P:'#8a5a56'}};

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

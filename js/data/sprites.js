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
  rat:["......kk..","..kkkkaak.",".kaaaaaaek","kAaaaaaak.",".kkakkak..","..k..k...."],
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

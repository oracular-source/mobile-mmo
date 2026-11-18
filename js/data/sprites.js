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
  necro:["....kkkk.ww.","...kPPPPkwkw","..kPPPPPPkw.","..kPmkkmPko.","..kPxxxxPko.","...kPxxPk.o.","..kpppppkxo.",".kpppwpppko.",".kppppwppko.",".kpppppwpko.",".kppppppppk.",".kPppppppPk.",".kppppppppk.","..kPPPPPPk..","..kPk..kPk..","..kkk..kkk.."],
  rogue:["....kkkk....","...kffffk...","..kffffffk..","..kfskskfk..","..kfssssfk..","...kfrrfk...","..krrrrrrk..",".krkrrrrkrk.",".krkryyrkrk.",".kskooooksk.",".lkkrrrrkkl.",".l.krrrrk.l.","...krk.krk..","...krk.krk..","...kDk.kDk..","...kkk.kkk.."],
  warrior:["...kkkkk....","..kGGGGGk...","..kGkkkGk...","..kGsksGk..l","..kGssssk..l",".kkgRRRRgk.l","kbbkRyyRgkkl","kbybRyyRgksk","kyyybRRRgk..","kbybkRRRgk..",".kbkoooook..","..kgg.ggk...","..kgk.kgk...","..kgk.kgk...","..kDk.kDk...","..kkk.kkk..."]
};

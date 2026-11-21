// Tile and object tables for text maps (js/data/maps/*.js). Numbers and names only. Format: docs/map-format.md
'use strict';
const MAPS={}; // each js/data/maps/*.js file adds one map here
// One character per tile. walk: 1 = you can stand on it. tags group tiles for the rules the checker runs.
const TILESET = `
char name        walk color   tags
,    grass        1   #2f3d26 living ground
.    dead_grass   1   #3b3a2c dead ground
:    dirt_path    1   #77623f path ground
=    road         1   #8f7650 path ground
m    mud          1   #2c2820 low ground
w    marsh        1   #27403b low slow ground
~    water        0   #1d3a4b water
T    tree         0   #1f3a22 living tree
t    dead_tree    0   #4a4036 dead tree
b    bush         0   #25381f living
x    dead_bush    0   #3e3428 dead
+    grave        0   #8d8692 grave
o    dug_grave    0   #2a2018 grave
#    iron_fence   0   #2b2a35 border
G    gate         1   #6b5a3a border path ground
/    broken_fence 1   #3b3a2c border ground
g    fence_grate  0   #1d3a4b border water
r    rubble       0   #6b6470 rubble
X    rock         0   #15131a wall
_    floor        1   #34303d floor ground
B    bones        0   #b9b0a0 rubble
C    coffin       0   #4a3c30 grave
^    stairs       1   #0b0a0f exit ground floor
H    bridge       1   #6a5038 path ground
d    cave_dirt    1   #3a3128 ground floor cave
u    dirt_slope   1   #4a3e30 exit ground floor cave
E    earth_wall   0   #1c1712 wall cave
h    rat_hole     0   #1c1712 wall cave hole
p    dirt_pile    0   #4a3a2c rubble cave
F    fir          0   #1a2e26 living tree
n    needles      1   #3a3a2a ground
v    moss         1   #34452c living ground
k    blight       1   #4e4c48 dead ground
f    fern         1   #2e4a2a living ground
O    boulder      0   #4a4a48 wall
a    ash          1   #4a4644 ground
q    gravel       1   #5e5a52 path ground
s    flagstone    1   #5c5862 path ground floor
W    stone_wall   0   #57535c border wall
P    pillar       0   #6e6a74 wall
e    herbs        1   #3e5432 living ground
Y    pew          0   #5a4230 furniture
z    flood        1   #24323c low slow floor ground flood
N    bone_niche   0   #2a2630 wall
V    steps        1   #4a4652 path floor ground
K    ember_pit    0   #5a2414 pit
`;
// Objects with a footprint (w x h tiles, top-left at x y). blocks: 1 = solid. on: tag every footprint tile must have.
// clear: tiles of open ground kept around it. door: side that must touch open ground (S = bottom middle, - = none).
// light: radius in tiles, for breadcrumb checks and the render.
const OBJECTS = `
kind         w h blocks on     clear door light
bell_tower   3 3 1      ground 1     S    0
crypt_mouth  5 3 1      ground 1     S    3
shack        4 3 1      ground 1     S    0
mausoleum    3 2 1      ground 1     S    0
dead_oak     2 2 1      ground 1     -    0
statue       1 1 1      ground 1     -    0
torch        1 1 1      ground 0     -    4
lantern      1 1 1      ground 0     -    3
candle       1 1 0      ground 0     -    2
cart         2 1 1      ground 0     -    0
throne       3 2 1      floor  1     S    0
brazier      1 1 1      floor  0     -    4
campfire     1 1 1      ground 1     -    4
signpost     1 1 1      ground 0     -    0
sinkhole     4 3 1      ground 1     -    0
burrow       2 2 1      ground 1     -    0
light_shaft  1 1 0      floor  0     -    4
gnaw_pile    2 2 1      floor  1     -    0
giant_tree   4 4 1      ground 1     S    0
tunnel_mouth 3 2 1      ground 1     S    2
lean_to      3 2 1      ground 1     S    0
firepit      1 1 1      ground 1     -    0
drying_rack  2 1 1      ground 0     -    0
trap         1 1 0      ground 0     -    0
wolf_den     4 2 1      ground 1     S    0
fallen_log   3 1 1      ground 0     -    0
stump        1 1 1      ground 0     -    0
chapel       7 9 1      ground 1     S    3
fallen_bell  2 2 1      ground 1     -    0
ash_circle   3 3 0      ground 0     -    1
shrine       2 1 1      ground 1     S    3
censer       1 1 1      ground 0     -    2
banner       1 1 0      wall   0     -    0
bedroll      1 1 0      ground 0     -    0
flowers      1 1 0      ground 0     -    1
shovel       1 1 0      ground 0     -    0
wagon        3 2 1      ground 0     -    0
fishing_rod  1 1 0      ground 0     -    0
town_gate    4 1 0      ground 0     -    0
well         2 2 1      ground 1     -    0
book_pyre    1 1 1      ground 0     -    2
torn_banner  1 1 0      ground 0     -    0
pack         1 1 0      ground 0     -    0
altar        4 1 1      floor  1     -    2
window       1 1 0      wall   0     -    3
table        3 1 1      floor  0     -    0
cage         2 2 1      floor  0     -    0
bell_mold    2 2 1      floor  1     -    0
`;

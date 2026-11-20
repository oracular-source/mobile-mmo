// The crypt under the Sunken Graveyard: open and shared, levels 5-7, Skeleton King at the throne. Format: docs/map-format.md
// Check and draw it: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.crypt = {
  name: 'Crypt', zone: [0, 0], tint: 'crypt', start: 'stairs_up', rules: '',
  tiles: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXX____XXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXX____XXX_____________XX',
    'XXBB_______BBXXXXX____XXX_____________XX',
    'XXB_________BXXXXX____XXX_____________XX',
    'XX___________XXXXXX__XXXX_____________XX',
    'XX____________________________________XX',
    'XX____________________________________XX',
    'XX___________XXXXXXXXXXXX_______________',
    'XX___________XXXXXXXXXXXX_______________',
    'XXB_________BXXXXXXXXXXXX_____________XX',
    'XXBB_______BBXXXXXXXXXXXX_____________XX',
    'XXXXX__XXXXXXXXXXXXXXXXXX_____________XX',
    'XXXXX__XXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXX',
    'XXXXX__XXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXX',
    'XXXXX__XXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXX',
    'XXXXX__XXXXXXXXX____________XXXXXXXXXXXX',
    'XXXXX__XXXXXXXXX____________XXXXXXXXXXXX',
    'XXX________XXXXX__C_C_C_C___XXXXXXXXXXXX',
    'XXX________XXXXX____________XXXXXXXXXXXX',
    'XXX________XXXXX__C_C_C_C___XXXXXXXXXXXX',
    'XXX_________________________XXXXXXXXXXXX',
    'XXX_______________C_C_C_C___XXXXXXXXXXXX',
    'XXX________XXXXX____________XXXXXXXXXXXX',
    'XXX________XXXXX____________XXXXXXXXXXXX',
    'XXXXXX^^XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  ],
  things: `
obj throne 30 3
obj brazier 3 18
obj brazier 10 18
obj brazier 3 24
obj brazier 10 24
obj brazier 25 2
obj brazier 37 2
obj brazier 25 12
obj brazier 37 12
obj brazier 16 16
obj brazier 27 24
# ways in and out
exit stairs_up 6 25 to=graveyard lit
exit back_tunnel 39 8 to=wolfwood at=crypt_tunnel lit
# stair hall: crypt rats
spawn crypt_rat 5 5 21
spawn crypt_rat 5 8 22
spawn crypt_rat 5 8 20
# ossuary: rats and the first skeletons
spawn crypt_rat 6 5 8
spawn skeleton 6 8 5
spawn skeleton 6 10 9
# coffin hall: skeletons between the rows
spawn skeleton 6 17 17
spawn skeleton 6 24 17
spawn skeleton 6 21 23
spawn crypt_rat 6 19 21
# throne room: the King's guard
spawn skeleton 7 27 7
spawn skeleton 7 35 7
spawn skeleton 7 28 10
spawn skeleton 7 34 10
spawn crypt_rat 5 5 12
spawn skeleton 5-6 12 22
spawn skeleton 6 26 20
spawn skeleton 6 21 19
spawn skeleton 6-7 17 7
spawn skeleton 7 32 11
named skeleton_king 7 31 6 summon=throne key=crown_shard
chest 20 2
label 31 1 Throne
label 7 15 Stair hall
label 7 2 Ossuary
label 22 15 Coffin hall
`
};

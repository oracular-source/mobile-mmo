// The crypt under the Sunken Graveyard, open and shared, levels 5-7. Rework v0.89 (draft 2, owner OK Nov 25). Layout from the approved direction (owner, Nov 21; docs/research/map-design.md,
// "Crypt rework direction"): stairs -> landing -> ossuary (west) and embalming room (east, chest) both into the coffin hall (a loop)
// -> antechamber (the King's door guard; owner, Nov 25: no mini named) -> throne room with the Skeleton King -> back tunnel to Wolfwood. North is deeper. 8 packs.
// Format: docs/map-format.md. Check and draw it: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.crypt = {
  name: 'Crypt', zone: [0, 0], tint: 'crypt', start: 'stairs_up', rules: '', redrawn: 2,   // redrawn: the old map's explored tiles don't fit this one (minimap.js keys them by size)
  tiles: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXX______XX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXX______XX',
    'XXXXXXXXXXXXssPssssssssssssssPss_______XXXXX',
    'XXXXXXXXXXXXssssssssssssssssssss_______XXXXX',
    'XXXXXXXXXXXXsssssssVVVVVVsssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssPssssssssssssssPssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXssssssssssssssssssssXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXssXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXssssssssssXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXssPssssssPssXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXssssssssssssXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXssssssssssssXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXssssssssssssXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXssPssssssPssXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXssssssssssXXXXXXXXXXXXXXXXX',
    'XXXNXNXNXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXXX',
    'XN_______BX_____________________BX________XX',
    'XX________X______________________X________XX',
    'XN________X__C__C__C____C__C__C__X________XX',
    'XX________X______________________X________XX',
    'XN________________________________________XX',
    'XX______________C__C____C__C______________XX',
    'XN________X______________________X________XX',
    'XX________N______________________X________XX',
    'XN________X__C__C__C____C__C__C__X________XX',
    'XX________NB_____________________X________XX',
    'XN________XXXXXXXXXXXXXXXXXXXXXXXX________XX',
    'XX________NXXXXXXXXXXXXXXXXXXXXXXX________XX',
    'XNB_______XXXXXXXXXXXXXXXXXXXXXXXX_______BXX',
    'XXXXX__XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX__XXXXX',
    'XXXXX__XXXXXXXXXX__________XXXXXXXXXX__XXXXX',
    'XXXXX__XXXXXXXXX____________XXXXXXXXX__XXXXX',
    'XXXXX__________________________________XXXXX',
    'XXXXX__________________________________XXXXX',
    'XXXXXXXXXXXXXXXX____________XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX____________XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXB_________XXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXX^^XXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  ],
  things: `
# ways in and out
exit stairs_up 21 43 to=graveyard lit
exit back_tunnel 41 2 to=wolfwood at=crypt_tunnel lit
obj light_shaft 39 3

# LANDING (5): grey daylight falls down the stairs. Story 1, grave robbers got in first: a coffin smashed open with
# the crowbar still in it, a sack dropped in a hurry spilling candlesticks. Their trail goes west (a candlestick on the floor).
obj light_shaft 21 42
obj smashed_coffin 24 37
obj loot_sack 23 38
obj candle 26 41
obj cobweb 16 37
spawn crypt_rat 5 17 38
spawn crypt_rat 5 18 39

# OSSUARY (west, 5-6): bones stacked in wall niches, a skull pile, and a mourner's shrine whose candles are still
# lit: someone still comes down here (a light that shouldn't be there). Cold, no fire.
obj skull_pile 3 23
obj skull_pile 8 33
obj mourner_shrine 2 28
obj candle 3 29
obj cobweb 2 22
obj candlestick 8 38
spawn skeleton 5-6 5 24
spawn crypt_rat 5 7 25
spawn skeleton 6 4 31
spawn skeleton 6 6 32
spawn crypt_rat 6 5 30

# EMBALMING ROOM (east, 5-6): stone slabs, one still with a shrouded body, urns along the wall, a brazier the dead
# never let go out. The hidden chest sits behind the slabs.
obj slab 36 24
obj slab 36 28
obj urn 41 22
obj urn 41 25
obj urn 41 31
obj brazier 34 22
obj cobweb 40 33
chest 40 28
spawn skeleton 6 38 26
spawn skeleton 5-6 39 30

# COFFIN HALL (6): three rows of coffins. Story 2, the dead got up: lids pushed off from inside, one coffin empty.
# Story 1 ends here: a robber who didn't get out, his burnt-out torch beside him, by an open coffin. Low cold fog.
obj open_coffin 21 24
obj open_coffin 21 30
obj robber_remains 14 28
obj candle 17 28
obj brazier 20 22
obj brazier 23 22
spawn skeleton 6 14 25
spawn crypt_rat 6 15 26
spawn skeleton 6 28 28
spawn skeleton 6 29 29
spawn skeleton 6 30 26
fog 11 23 22 9

# ANTECHAMBER (7): the King's door guard, a pair among four pillars. Owner (Nov 25): no mini named, just the
# Skeleton King. Braziers either side of the door north: the way on is lit.
obj brazier 20 14
obj brazier 23 14
obj weapon_rack 17 17
obj weapon_rack 26 17
spawn skeleton 7 20 17
spawn skeleton 7 23 17

# THRONE ROOM (7): story 3, the King's court rotted at its feast: a long table with tipped goblets and guttered
# candles, torn banners, weapon racks by the guards, and crown shards glinting on the dais steps (the summon key's story).
obj throne 20 3
obj brazier 13 3
obj brazier 30 3
obj brazier 13 11
obj brazier 30 11
obj feast_table 17 9
obj feast_table 22 9
obj king_banner 16 1
obj king_banner 27 1
obj weapon_rack 27 7
obj crown_shards 23 6
obj cobweb 31 10
spawn skeleton 7 18 7
spawn skeleton 7 25 7
named skeleton_king 7 21 7 summon=throne key=crown_shard
fog 12 2 20 4

# life: bats in every room, moths at the warm lights
critter bat 5 27 2
critter bat 38 33 1
critter bat 22 26 2
critter bat 22 9 2
critter bat 38 3 1
critter moth 34.5 22.5 2
critter moth 20.5 14.5 1
critter moth 13.5 3.5 2
critter moth 30.5 11.5 1
critter moth 3.5 29.5 1

label 21 2 Throne room
label 22 15 Antechamber
label 21 23 Coffin hall
label 5 23 Ossuary
label 37 23 Embalming
label 21 37 Landing
label 39 1 To Wolfwood
`
};

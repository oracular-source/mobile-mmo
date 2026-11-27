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
    'XXNNNNNNNNXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXXX',
    'XN________X_____________________BX________XX',
    'XX________X______________________X________XX',
    'XN________X______________________X________XX',
    'XX________X______________________X________XX',
    'XN________________________________________XX',
    'XX________________________________________XX',
    'XN________X______________________X________XX',
    'XX________N______________________X________XX',
    'XN________X______________________X________XX',
    'XX________NB_____________________X________XX',
    'XN________XXXXXXXXXXXXXXXXXXXXXXXX________XX',
    'XX________NXXXXXXXXXXXXXXXXXXXXXXX________XX',
    'XN________XXXXXXXXXXXXXXXXXXXXXXXX_______BXX',
    'XXXXX__XXXXXXXXXXNNNNNNNNNNXXXXXXXXXX__XXXXX',
    'XXXXX__XXXXXXXXXX__________XXXXXXXXXX__XXXXX',
    'XXXXX__NNNXNNNNN____________NNNNNXNNN__XXXXX',
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
# the corridor to the ossuary and the embalming room: one wall torch each way, mirrored on the stairs (lighting pass, v0.96)
obj sconce 10 37
obj sconce 33 37
obj smashed_coffin 24 37
obj loot_sack 23 38
obj cobweb 16 37
spawn crypt_rat 5 17 38
spawn crypt_rat 5 18 39

# OSSUARY (west, 5-6). Love pass v0.103 (owner: big and empty, bones dropped at random): the bones are stacked into three
# low bone walls across the room like the Paris catacombs, with an aisle down the middle from the stairs to a mourner's
# shrine on the north wall, whose candles are still lit: someone still comes down here. One run has slumped onto the floor.
# Cold, no fire.
obj bone_wall 2 24
obj bone_wall 3 24
obj bone_wall 4 24
obj bone_wall 7 24
obj bone_wall 8 24
obj bone_wall 9 24
obj bone_wall 2 28
obj bone_wall 3 28 slump
obj bone_wall 4 28
obj bone_wall 7 28
obj bone_wall 8 28
obj bone_wall 9 28
obj bone_wall 2 32
obj bone_wall 3 32
obj bone_wall 4 32
obj bone_wall 7 32
obj bone_wall 8 32
obj bone_wall 9 32
obj mourner_shrine 5 22 half
obj cobweb 2 22
obj candlestick 8 38
spawn skeleton 5-6 5 24
spawn crypt_rat 5 7 25
spawn skeleton 6 4 31
spawn skeleton 6 6 32
spawn crypt_rat 6 5 30

# EMBALMING ROOM (east, 5-6): stone slabs, one still with a shrouded body, urns along the wall, two wall torches the
# dead never let go out (v0.96: a pair centred on the north wall, was one brazier jammed in the corner). The hidden chest sits behind the slabs.
obj slab 36 24
obj slab 36 28
obj urn 41 22
obj urn 41 25
obj urn 41 31
obj sconce 35 21
obj sconce 40 21
obj cobweb 34 22
chest 40 28
spawn skeleton 6 38 26
spawn skeleton 5-6 39 30

# COFFIN HALL (6). Love pass v0.103 (owner: the coffins stood in a grid, all alike; keep the open one and the cracked one):
# four corners of the dead off a cross of aisles (door to door, and the north door down the middle). The rich in stone tombs
# with their effigies (a knight north-west, his neighbour's lid shoved open north-east, a plain one south-east), the
# poor in wooden coffins, a child's coffin with dried flowers. Story 2, the dead got up: the two open coffins in the middle,
# a wooden lid caved in. Story 1 ends here: a robber who didn't get out, face down by the coffin he'd stuck his candle on
# (it still burns). Low cold fog.
obj open_coffin 21 24
obj open_coffin 21 30
obj sarcophagus 12 23 knight
obj coffin 16 23 wood
obj coffin 18 24 stone
obj coffin 25 24 cracked
obj coffin 27 23 wood_broken
obj sarcophagus 30 23 cracked
obj robber_remains 14 28
obj coffin 17 27 candle
obj coffin 12 30 wood
obj coffin 16 30 small
obj coffin 19 30 ajar
obj coffin 25 28 wood_ajar
obj coffin 31 27 stone
obj coffin 26 30 wood
obj sarcophagus 29 30 plain
obj brazier 20 22
obj brazier 23 22
# v0.96: a wall torch over each wing, mirrored on the north door (the hall's ends were black)
obj sconce 14 21
obj sconce 29 21
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

# THRONE ROOM (7): story 3, the King's court rotted at its feast: two long tables either side of a rotted red runner from
# the door to the dais, tipped goblets and candles burnt down from the outer ends inward, torn banners, a weapon rack by
# the guards, and crown shards glinting on the dais steps (the summon key's story). Love pass v0.103 (owner: evenly
# bright, bare floor): the throne sits on the room's middle line (half), the tables mirror each other across the runner,
# and the light gathers at the throne (two braziers flanking it, were four in the corners) and the feast candles; the
# corners fall dark.
obj throne 20 3 half
obj brazier 18 4
obj brazier 25 4
obj carpet 21 7
obj feast_table 17 9 L
obj feast_table 24 9 R
obj king_banner 16 1
obj king_banner 27 1
obj weapon_rack 28 7
obj crown_shards 23 6
obj cobweb 31 2
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
critter moth 35.5 22.5 2
critter moth 20.5 14.5 1
critter moth 18.5 4.5 2
critter moth 25.5 4.5 1
critter moth 6 23 1

label 21 2 Throne room
label 22 15 Antechamber
label 21 23 Coffin hall
label 5 23 Ossuary
label 37 23 Embalming
label 21 37 Landing
label 39 1 To Wolfwood
`
};

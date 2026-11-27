// Dungeon 1, floor 1: Brother Malrec's monastery (the owner calls it "the monastery"), levels 14-15. DRAFT 3 (owner, Nov 21):
// middle size, two floors, tighter packs and more of them, no empty walking, every room intentional. North is deeper.
// catacomb (enter here, three packs) -> the hall (old refectory: mender camp, a pack with a big wisp, the floor's
// chest, a caged monk; owner, Nov 21: one hall, not two, since players skip trash anyway) -> flooded chamber (the
// only water: the Drowned Prior; his death drains the flood and opens the stairs down). Spec: docs/research/map-design.md (draft 3).
// Built in v0.66 (replaces the v0.63 one-floor map). Floor 2 is js/data/maps/dungeon1_f2.js.
// Format: docs/map-format.md
'use strict';
MAPS.dungeon1 = {
  name: 'Dungeon 1', zone: [27, -15], tint: 'vault', start: 'out', rules: '', instance: 1, wake: 'You wake at the foot of the chapel stairs.',
  enter: 'The stairs under the chapel open into the old catacomb. Somewhere ahead, water laps against stone.',
  tiles: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXVVVVXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXVVVVXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX__________________XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXX____________________XXXXXXXXXXXXX',
    'XXXXXXXXXXXX____zzzzzzzzz_zzzz____XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzzzzzzzzzzzzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzPzzzzzzzzPzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzzzzzzzzzzzzzz___XXXXXXXXXXXX',
    'XXXXXXXXXXXX___zzzzzzzzzzzzzzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzzzzzzzzzzzzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzPzzzzzzzzPzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX__zzzzzzzzzzzzzzzzzz__XXXXXXXXXXXX',
    'XXXXXXXXXXXX____zzzz_zzzzzzzzz____XXXXXXXXXXXX',
    'XXXXXXXXXXXXX____________________XXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX__________________XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWWWWWWssWWWWWWWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWPsssssssssssPWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXWWWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXWsssssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXWsssssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXWWWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWsssssssssssssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWPsssssssssssPWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXWWWWWWssWWWWWWWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXNXXNXXNX__XXNXXNXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX______XX__XX______XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXX____________________XXXXXXXXXXXXX',
    'XXXXXXXXXXXX__C________________C__XXXXXXXXXXXX',
    'XXXXXXXXXXXN__C________________C__NXXXXXXXXXXX',
    'XXXXXXXXXXXX_______C______C_______XXXXXXXXXXXX',
    'XXXXXXXXXXXX__C____C______C____C__XXXXXXXXXXXX',
    'XXXXXXXXXXXN__C________________C__NXXXXXXXXXXX',
    'XXXXXXXXXXXX______________________XXXXXXXXXXXX',
    'XXXXXXXXXXXXX__B______________B__XXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX__________________XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  ],
  things: `
# Target: 10-15 min for both floors (owner, Nov 21). Floor 1: 5 packs, 14 mobs + 1 big wisp, the Drowned Prior.
# 1. CATACOMB (you arrive here, rough rock, bone niches, coffins). Dry. Packs sit back from the stairs, not on them.
exit out 22 46 to=chapel at=dungeon lit
obj brazier 20 42
obj brazier 25 42
obj brazier 17 34
obj brazier 28 34
spawn skeleton 14 16 38
spawn corpse 14 17 40
spawn skeleton 14 22 35
spawn corpse 14 23 36
spawn skeleton 14 28 37
spawn corpse 14 29 39
spawn skeleton 14 27 39
# 2. THE HALL: the monks' old refectory (dressed stone, flagstones, long tables), straight north of the catacomb
# (owner, Nov 21: a straight shot like floor 2). Healer first: the mender camp is back in the north-east corner. On
# the west side a pack of two with a BIG WISP that hovers with it and joins the pull; its move is an area burn round
# it: stay out of the ring or drag the fight away. 9+ tiles apart, no shouting; both set back from the south door.
obj table 18 20
obj table 22 23
obj table 23 26
obj banner 21 17
obj banner 24 17
obj torn_banner 20 27
obj censer 29 23
spawn cult_zealot 14 26 20
spawn cult_ashcaller 14 28 19
spawn cult_mender 14 27 21
spawn great_wisp 15 18 22
spawn cult_zealot 14-15 18 24
spawn cult_ashcaller 14-15 19 25
# small story: a monk the cult kept alive, caged in the south-east corner
obj cage 27 26
obj candle 26 28
# the floor's chest, in a little alcove off the west wall, one candle left burning by it
chest 15 22
obj candle 15 23
# 3. FLOODED CHAMBER: the only water in the dungeon (slows a little all the time); a pool in the middle until you're locked in. MINI BOSS: the Drowned Prior with
# two drowned dead. His grip: ripples under you (about 1.5 s), step off or hands rise and slow you hard (light damage).
# When he dies the flood drains and the steps down at the north wall come up out of the water.
obj brazier 14 4
obj brazier 31 4
obj brazier 14 14
obj brazier 31 14
named drowned_prior 15 22 9 group=prior
spawn corpse 15 19 9 group=prior
spawn skeleton 15 25 9 group=prior
# LOCKED IN (v0.71, owner Nov 21): a couple of steps into the chamber while the Prior is up, a portcullis slams down over
# the door behind you and the flood spreads from the middle pool to every wall in about 3 s: no dry ground, slow the whole
# fight. His death drains it and lifts the portcullis; dying in there sinks the water back and opens the door.
lockin 22 16 23 16 drowned_prior room=12,3,33,15
# the steps down stay under water (sealed) until the Prior dies: seal ... <named> opens when that named dies (v0.66)
seal 21 1 24 2 drowned_prior
exit down 22 1 to=dungeon1_f2 at=up
# something alive
critter bat 22.5 38 2
critter moth 15.3 23 1
critter moth 26.3 28 1
critter bat 22 7 2
critter moth 20.3 42 1
fog 14 5 18 9
label 22 44 1. Catacomb (enter)
label 23 30 2. The hall (refectory)
label 22 16 3. Flooded chamber: Drowned Prior
label 22 0 Stairs down (after the Prior)
`
};

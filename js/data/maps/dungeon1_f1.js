// Dungeon 1, floor 1: Brother Malrec's monastery (the owner calls it "the monastery"), levels 14-15. DRAFT 3 (owner, Nov 21):
// middle size, two floors, tighter packs and more of them, no empty walking, every room intentional. North is deeper.
// catacomb (enter here, three packs) -> west hall (old refectory: mender camp + small camp, the floor's chest) or
// east hall (old dormitory: a pack with a big wisp, caged monk) as a loop -> flooded chamber (the only water: the
// Drowned Prior; his death drains the flood and opens the stairs down). Spec: docs/research/map-design.md (draft 3).
// NOT LOADED BY THE GAME YET: at the build this replaces js/data/maps/dungeon1.js (key becomes MAPS.dungeon1).
// Format: docs/map-format.md
'use strict';
MAPS.dungeon1_f1 = {
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
    'XXXXXXXXXXXXX__XXXXXXXXXXXXXXXX__XXXXXXXXXXXXX',
    'XXXWWWWWWWWWWssWWWXXXXXXXXXXWWWssWWWWWWWWWWXXX',
    'XXXWPsssssssssssPWXXXXXXXXXXWPsssssssssssPWXXX',
    'XXXWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XXXWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XWWWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XWsssssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XWsssssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XWWWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XXXWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XXXWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XXXWsssssssssssssWXXXXXXXXXXWsssssssssssssWXXX',
    'XXXWPsssssssssssPWXXXXXXXXXXWPsssssssssssPWXXX',
    'XXXWWWWWWWWWWWWssWXXXXXXXXXXWssWWWWWWWWWWWWXXX',
    'XXXXXXXXXXXXXXX__XXXXXXXXXXXX__XXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXX__XXXXXXXXXXXX__XXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXN__NXXNXXNXXNXX__XXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXX______XX__XX______XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXX____________________XXXXXXXXXXXXX',
    'XXXXXXXXXXXX__C________________C__XXXXXXXXXXXX',
    'XXXXXXXXXXXN______________________NXXXXXXXXXXX',
    'XXXXXXXXXXXX_______C______C_______XXXXXXXXXXXX',
    'XXXXXXXXXXXX__C________________C__XXXXXXXXXXXX',
    'XXXXXXXXXXXN______________________NXXXXXXXXXXX',
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
# Target: 10-15 min for both floors (owner, Nov 21). Floor 1: 6 packs, 16 mobs + 1 big wisp, the Drowned Prior.
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
# 2a. WEST HALL: the monks' old refectory (dressed stone, flagstones, long tables). Healer first: the mender camp is
# back in the north-east corner, a small camp in the south-west, out of shouting range of each other (9+ tiles).
obj table 5 20
obj table 9 23
obj table 12 26
obj banner 8 17
obj banner 11 17
obj torn_banner 5 24
obj censer 16 23
spawn cult_zealot 14 13 20
spawn cult_ashcaller 14 15 19
spawn cult_mender 14 14 21
spawn cult_zealot 14 6 27
spawn cult_ashcaller 14 8 27
# the floor's chest, in a little alcove off the west wall, one candle left burning by it
chest 2 22
obj candle 2 23
# 2b. EAST HALL: the old dormitory (bedrolls, a monk in a cage). One pack with a BIG WISP that hovers with it and
# joins the pull; its move is an area burn round it: stay out of the ring or drag the fight away from it.
obj bedroll 30 20
obj bedroll 30 22
obj bedroll 30 24
obj bedroll 40 20
obj bedroll 40 22
obj cage 38 25
obj candle 37 27
obj banner 34 17
spawn cult_zealot 14-15 34 21
spawn cult_ashcaller 14-15 36 20
spawn great_wisp 15 35 23
# 3. FLOODED CHAMBER: the only water in the dungeon (slows a little all the time). MINI BOSS: the Drowned Prior with
# two drowned dead. His grip: ripples under you (about 1.5 s), step off or hands rise and slow you hard (light damage).
# When he dies the flood drains and the steps down at the north wall come up out of the water.
obj brazier 14 4
obj brazier 31 4
obj brazier 14 14
obj brazier 31 14
named drowned_prior 15 22 9 group=prior
spawn corpse 15 19 9 group=prior
spawn skeleton 15 25 9 group=prior
# the steps down stay under water (sealed) until the Prior dies; the build adds "seal ... named" (today: object only)
seal 21 1 24 2 drowned_prior
exit down 22 1 to=dungeon1_f2 at=up
# something alive
critter bat 22.5 38 2
critter moth 2.3 23 1
critter moth 37.3 27 1
critter bat 22 7 2
critter moth 20.3 42 1
fog 14 5 18 9
label 22 44 1. Catacomb (enter)
label 10 30 2a. West hall (refectory)
label 35 30 2b. East hall (dormitory)
label 22 16 3. Flooded chamber: Drowned Prior
label 22 0 Stairs down (after the Prior)
`
};

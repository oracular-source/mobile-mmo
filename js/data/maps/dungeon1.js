// Dungeon 1: Brother Malrec's chapel, levels 14-15 (draft 2 ladder). Instanced (just you until groups exist), entered
// through the chapel door on the chapel grounds. Draft 2 (owner, Nov 20: bigger and more substantial, with a named, but
// still a 10-15 minute run): nave -> flooded catacomb -> drowned crypts -> the Drowned Prior (mini boss) -> refectory,
// dormitory, ritual hall -> Malrec's sanctum; the Bellringer's foundry is an optional side lair. North is deeper.
// In the game since v0.63. Format: docs/map-format.md
'use strict';
MAPS.dungeon1 = {
  name: 'Dungeon 1', zone: [27, -15], tint: 'vault', start: 'out', rules: '', instance: 1, wake: 'You wake in the nave, by the chapel door.',
  enter: 'Candles gutter on the altar. Behind it, steps lead down into the dark, and you can hear water.',
  tiles: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXssssssssssXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXssssssssssXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXPX_ssssssssss_XPXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX______________XXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX______________XXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX______________XXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXP____________PXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX____________XXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX__________XXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXX',
    'XXXX__________________XXXXXXXXXXXXXXXXXXX________________XXXXXXX',
    'XXX________ssss________XXXX____________XX________________XXXXXXX',
    'XXX_zzzzzzzsssszzzzzzz_XXXX____________XX________________XXXXXXX',
    'XXX_zzzzzzzzzzzzzzzzzz_XXXX____________XX________________XXXXXXX',
    'XXX_zzssszzzzzzzssszzz_XXXX____________XX________________XXXXXXX',
    'XXX_zzssszzzzzzzssszzz_________________XX______KKKK______XXXXXXX',
    'XXX_zzzzzzzzzzzzzzzzzz_________________XX_____KKKKKK_____XXXXXXX',
    'XXX_zzzzzzzzzzzzzzzzzz_XXXX___________________KKKKKK_____XXXXXXX',
    'XXX_zzzzzzzssszzzzzzzz_XXXX___________________KKKKKK_____XXXXXXX',
    'XXX_zzzzzzzssszzzzzzzz_XXXX____________XX______KKKK______XXXXXXX',
    'XXX_zzzzzzzzzzzzzzzzzz_XXXX____________XX________________XXXXXXX',
    'XXXX__________________XXXXX____________XX________________XXXXXXX',
    'XXXXXXXXXXXX__XXXXXXXXXXXXX____________XX________________XXXXXXX',
    'XXXXXXXXXXXX__XXXXXXXXXXXXX____________XX________________XXXXXXX',
    'XXXXXXXXNXXN__NXXNXXNXXXXXXXXXX__XXXXXXXX________________XXXXXXX',
    'XXXXX___________________XXXXXXX__XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXX___________________XXXX__________XXXXXXXXXXXX___________XXX',
    'XXXXX__XXXXXXXXXXXXXXX_zXXX___________XXXXXXXXXXX_____________XX',
    'XXXXX_zXX_________XXXXz_XXX___________XXXXXXXXXXX_____________XX',
    'XXXXXz_XX_C_C_C_C_XXXX__XXX___________XXXXXXXXXXX_____________XX',
    'XXXXX_z_________________XXX___________XXXXXXXXXXX_____KKKK____XX',
    'XXXXX__XX_C_C_C_C_______XXX__________XXXXXXXXXXXX_____KKKK____XX',
    'XXXXX__XX_________XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_____KKKK____XX',
    'XXXXX__XNXX__XNXXNXXNXXXXXXXXXXXXXXXXXXXXXXXXXXXX_____KKKK____XX',
    'XXXXX________zz_______XXXXXXXXXXXXXXXXXXXX____________________XX',
    'XXXXX__________z______XXXXXXXXXXXXXXXXXXXX____________________XX',
    'XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX__XXXXX_____________XX',
    'XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX__XXXXX_____________XX',
    'XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX__XXXXX_____________XX',
    'XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX__XXXXX____________XXX',
    'XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXNXNX__NXNXNXNXNXNXNXNXNXNX__NXNXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX________________________________XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX________________________________XXXXXXXXXXXXXXXX',
    'XXXXXXXXX________zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX__XXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX__XXXXX_zzzPzzzzzzPzzzzzzzzPzzzzzzPzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX_zXXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX_zXXXXX_zzzzzCzCzzzzCzCzCzzzzCzCzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXX__zXXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXX__zXXXXX_zzzPzzzzzzPzzzzzzzzPzzzzzzPzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX_zXXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX_zXXXXX_zzzzzCzCzzzzCzCzCzzzzCzCzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX__XXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX__XXXXX_zzzPzzzzzzPzzzzzzzzPzzzzzzPzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXX________zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz_XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX________________________________XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXNXNXNXNXNXNXNXXVVXNXNXNXNXNXNXNXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWWWWWWWWWVVWWWWWWWWWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWsYYYYYYPssPYYYYYYsWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWsYYYYYYssssYYYYYYsWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWsYYYYYYPssPYYYYYYsWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWssssssssssssssssssWXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXWWWWWWWWWssWWWWWWWWWXXXXXXXXXXXXXXXXXXXXXX',
  ],
  things: `
# Target: a 10-15 minute run (owner, Nov 20). About 22 mobs on the main way plus two named fights and Malrec;
# the Bellringer's foundry is an optional side lair (about 3 more minutes, a better chest).
# 1. the nave: pews, the altar under a red cult cloth, stained glass; touch the altar and the stairs behind it open
obj altar 30 68
obj candle 29 68
obj candle 34 68
obj window 26 66
obj window 37 66
obj banner 22 73
obj banner 41 73
obj torn_banner 24 77
obj candle 30 78
obj candle 33 78
exit out 31 79 to=chapel at=dungeon lit
# the stairs behind the altar are sealed by a stone slab until you touch the altar (v0.63)
seal 31 66 32 66 altar
spawn cult_zealot 14 31 70
spawn cult_ashcaller 14 33 69
spawn cult_chanter 14 30 69
# 2. the flooded catacomb: knee-deep water slows you and the dead alike
obj brazier 16 45
obj brazier 47 45
obj brazier 16 60
obj brazier 47 60
spawn skeleton 14 25 58
spawn corpse 14 26 57
spawn skeleton 14 38 54
spawn corpse 14 21 48
spawn skeleton 14 23 47
# secret: a loop round the west wall to a chest in a burial niche, one candle left burning by it
chest 8 52
obj candle 8 53
spawn corpse 14 10 56
# 3. the drowned crypts: narrow burial passages that loop, flooded in patches
spawn skeleton 14 6 34
spawn corpse 14-15 13 33
spawn skeleton 14-15 15 33
spawn skeleton 15 18 28
# 4. MINI BOSS: the Drowned Prior, in the flooded crypt chapel. Grasp of the Deep: stand on the dry stone plinths
obj brazier 3 14
obj brazier 22 14
obj brazier 3 23
obj brazier 22 23
named drowned_prior 15 12 19
# 5. the cult's half: the refectory (a camp with a mender), the dormitory (a monk in a cage), the ritual hall
obj table 29 17
obj table 29 22
obj table 34 24
obj brazier 27 14
obj brazier 38 14
obj banner 30 13
obj banner 35 13
spawn cult_zealot 15 33 19
spawn cult_ashcaller 15 35 18
spawn cult_mender 15 34 21
obj bedroll 28 31
obj bedroll 30 31
obj bedroll 32 33
obj cage 34 31
obj candle 28 33
obj censer 42 14
obj censer 55 26
obj candle 45 20
obj candle 52 20
obj banner 44 12
obj banner 53 12
spawn cult_zealot 15 53 15
spawn cult_ashcaller 15 55 17
spawn cult_mender 15 52 17
spawn ash_wisp 15 43 21
spawn ash_wisp 15 54 24
# OPTIONAL NAMED: the Bellringer, in the old bell foundry off the catacomb (one way in). Toll: step out of reach
obj brazier 61 30
obj brazier 61 41
obj bell_mold 51 32
spawn cult_zealot 15 51 39
spawn cult_ashcaller 15 53 40
named bellringer 15 58 31
chest 60 31
# 6. the sanctum: Brother Malrec on the dais with his two deacons; candles round the room flare during the fight
obj censer 50 1
obj candle 43 4
obj candle 54 4
obj candle 42 6
obj candle 55 6
obj candle 45 8
obj candle 52 8
obj banner 46 0
obj banner 51 0
named malrec 15 48 2 group=sanctum
spawn cult_deacon 15 45 3 group=sanctum
spawn cult_deacon 15 52 3 group=sanctum
# something alive
critter bat 31.5 72 2
critter moth 31.8 68.2 2
critter bat 31 52 2
critter moth 8.3 53 1
critter bat 12 16 2
critter moth 52.3 20 2
critter moth 52.3 8 2
critter moth 28.3 33 1
# mist on the water, smoke over the pit and in the sanctum
fog 17 47 30 12
fog 4 15 18 9
fog 45 17 8 6
fog 42 1 14 6
label 31 76 1. Nave
label 32 50 2. Flooded catacomb
label 6 46 Secret loop
label 12 30 3. Drowned crypts
label 12 13 4. Drowned Prior (mini boss)
label 32 15 5. Refectory
label 32 29 Dormitory (cage)
label 48 13 Ritual hall (ember pit)
label 55 28 Optional: Bellringer's foundry
label 48 9 6. Sanctum
`
};

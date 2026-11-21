// Dungeon 1, floor 2: Brother Malrec's monastery, level 15. DRAFT 3 (owner, Nov 21). North is deeper.
// landing (one small pack, a breather) -> wisp room (old ritual hall round the ember pit: two packs, each a summoner
// with its big wisp already out; a wisp outlives its summoner) -> Malrec's sanctum (Malrec + two deacons, as built).
// NOT LOADED BY THE GAME YET (draft for the owner). Format: docs/map-format.md
'use strict';
MAPS.dungeon1_f2 = {
  name: 'Dungeon 1', zone: [27, -60], tint: 'vault', start: 'up', rules: '', instance: 1, wake: 'You wake at the foot of the stairs, under the flooded chamber.',
  enter: 'Water still drips from the steps behind you. Ahead, ember light and a low chant.',
  tiles: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXWWWssssssssWWWXXXXXXXXXX',
    'XXXXXXXXXWWssssssssssssWWXXXXXXXXX',
    'XXXXXXXXWWssssssssssssssWWXXXXXXXX',
    'XXXXXXXXWssssssssssssssssWXXXXXXXX',
    'XXXXXXXWWssssssssssssssssWWXXXXXXX',
    'XXXXXXXWssssssssssssssssssWXXXXXXX',
    'XXXXXXXWWssssssssssssssssWWXXXXXXX',
    'XXXXXXXXWssssssssssssssssWXXXXXXXX',
    'XXXXXXXXWWssssssssssssssWWXXXXXXXX',
    'XXXXXXXXXWWssssssssssssWWXXXXXXXXX',
    'XXXXXXXXXXWWWssssssssWWWXXXXXXXXXX',
    'XXXXXXXXXXXXXXXWssWXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXWWWWWWWWWWWWssWWWWWWWWWWWWXXXX',
    'XXXXWssssssssssssssssssssssssWXXXX',
    'XXXXWsssPsssPssssssssPsssPsssWXXXX',
    'XXXXWssssssssssssssssssssssssWXXXX',
    'XXXXWsssssssssssKKsssssssssssWXXXX',
    'XXXXWssssssssssKKKKssssssssssWXXXX',
    'XXXXWssssssssssKKKKssssssssssWXXXX',
    'XXXXWsssssssssssKKsssssssssssWXXXX',
    'XXXXWssssssssssssssssssssssssWXXXX',
    'XXXXWssssssssssssssssssssssssWXXXX',
    'XXXXWsssPsssPssssssssPsssPsssWXXXX',
    'XXXXWssssssssssssssssssssssssWXXXX',
    'XXXXWWWWWWWWWWWWssWWWWWWWWWWWWXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX__XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXX________XXXXXXXXXXXXX',
    'XXXXXXXXXXXX__________XXXXXXXXXXXX',
    'XXXXXXXXXXX____________XXXXXXXXXXX',
    'XXXXXXXXXXX____________XXXXXXXXXXX',
    'XXXXXXXXXXX____________XXXXXXXXXXX',
    'XXXXXXXXXXX____________XXXXXXXXXXX',
    'XXXXXXXXXXX____________XXXXXXXXXXX',
    'XXXXXXXXXXXXB________BXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXVVXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  ],
  things: `
# Floor 2: 3 packs, 6 mobs + 2 big wisps, then Malrec and his two deacons.
# 4. LANDING: one small pack in the far corner, so you're not jumped coming off the stairs
exit up 16 42 to=dungeon1_f1 at=down lit
obj brazier 13 38
obj brazier 20 38
spawn cult_zealot 15 20 34
spawn cult_ashcaller 15 21 36
# 5. WISP ROOM: the old ritual hall round its ember pit. Two packs, one each side, each a summoner with its big wisp
# (already summoned, hovering with the pack). Killing the summoner does NOT kill its wisp.
obj censer 13 21
obj censer 20 22
obj banner 10 16
obj banner 23 16
obj candle 6 17
obj candle 27 17
obj candle 6 27
obj candle 27 27
spawn cult_summoner 15 8 22 group=west
spawn cult_zealot 15 9 24 group=west
spawn great_wisp 15 7 20 group=west
spawn cult_summoner 15 25 22 group=east
spawn cult_zealot 15 24 24 group=east
spawn great_wisp 15 26 20 group=east
# 6. SANCTUM: Brother Malrec on the dais with his two deacons (Rite of Mending, Ash Bolt, Candle Wake as built);
# the six candles in a ring are the ones that flare during Candle Wake
obj censer 16 9
obj banner 11 1
obj banner 22 1
obj candle 10 6
obj candle 23 6
obj candle 12 3
obj candle 21 3
obj candle 12 9
obj candle 21 9
named malrec 15 16 3 group=sanctum
spawn cult_deacon 15 13 4 group=sanctum
spawn cult_deacon 15 20 4 group=sanctum
# something alive
critter bat 16.5 35 2
critter moth 6.3 17 1
critter moth 27.3 27 1
critter moth 12.3 3 2
critter moth 21.3 9 2
fog 13 19 8 6
fog 9 2 16 8
label 16 31 4. Landing
label 16 29 5. Wisp room (ember pit)
label 16 12 6. Malrec's sanctum
`
};

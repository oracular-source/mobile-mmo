// Sunken Graveyard (surface), levels 4-8. West spoke of Zone 1. Format: docs/map-format.md
// Check and draw it: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.graveyard = {
  name: 'Sunken Graveyard', zone: [2, 64], tint: 'moonlit', start: 'east', rules: 'dead-inside',
  tiles: [
    'TT,TTTTT,,TTT,TT,,TTTTTTTTTTT,::,,TTTTTTTTTTTTTT',
    ',T,,,,,,,,,,,,,,,,,,,,,,,,,,,,::,TTTTTTTTTTTTTTT',
    ',,,,::::::::::::::::::::::::::::,TTTTTTTTTTTTTTT',
    'T,,::,,,,,,,,,,,,,,,,,,,,,,,,,::,,,TTTTTTTTTTTTT',
    ',,::,,TTTT,,,,,,,,,,,,,,,,,,,,::,,,,,,,,,TTTTTTT',
    ',::,,TTT,,,###################GG########,,TTTTTT',
    ',:,,,TTT,,#......t.........t..::.x......#,,TTTTT',
    ',:,,TTTT,#....tt.............:::.tm......#,TTTTT',
    ',:,TTTTT,#...............r.::::mmmmmmmmt.#,TTTTT',
    ',:,TT,,,,#t..............r::::mwwwwwwwmmm#,,,TTT',
    ',:,,,,T,,#...............::::ww~~~~~~~wwm#,T,TTT',
    ',:,T,,,,,#.............:::::ww~~~~~~~~~ww#,,,T,,',
    ',:,,T,,T,#.............::.mmww~~~~~~~~~ww#,,T,,T',
    ',:,,,,,T,#.............::.mmww~~~~~~~~~~~#,,,,TT',
    ',:,T,TTT,#.............::..mmww~~~~~~~ww~g~,,TTT',
    ',:,,,TTT,#.............::...mmmwwwwwwwmmm#~~,,,,',
    ',:,,TT,,,#.............::.....mmmmmmmmm..#,~~~~,',
    ',:,TTT,T,#.............::.......t.mt..t..#,,,,~~',
    ',:,TT,,T,#.............::...............x#,,T,,,',
    ',:,TT,,,,#...::........::..+.+.+.+.o.+...#,,TTTT',
    ',:,TTTTT,#...::::......::................#,,TTTT',
    ',:,,TTTT,#t...:::::....::..+.+.+.+.o.+...#,,TTTT',
    ',:,,TTT,,#.....::::::..::................#,,,,,,',
    ',:,,T,,,,#.......::::::::..+.+.+.+.o.+..t#,,TT,,',
    ',:,,,,,,,#....t.....::::::...............#,TTT,,',
    ',:,,,,,,,#............:::::..+.+.+.o.+.t.#,,,,,,',
    ',:,,,,,,,#.++.....+.+...::::.............#,T,,T,',
    ',:,,,,,,,#.....::.....t..::::......t.x...#,,,,,,',
    ',:,,,,,,,#....:::.+.o.....:::::..........#,,,,,T',
    ',:,,,,,,,#..::::...........::::::.....t..#,,,,,,',
    ',:,,,::::/:::::..++.+........::::::......#,,T,,,',
    ',::::::::/::::.........t...t...::::::::..#,,,,,,',
    ',,,,,,,,,#.....o.++.+............::::::::G===,,T',
    ',,TTTTTT,#...........................::::G====,,',
    'TTTTTTTT,#.++.++.+o.+.+.+.+.o.+.+.+......#,====,',
    'TTTTTTT,,#...............................#,,,===',
    'TTTTTTT,,#x.....t.....+.+.+.o.+.+.+.+.+..#,,,,==',
    'TTTTTTT,,T#t..t.........................#,,,,:,,',
    'TTTTTTTTTTT################/############,,,,:,,T',
    'TTTTTTTTTTTTTTTTTTTTTTTTTTr:,,,,,,,,,,,,,,,:,,TT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT,::::::,,,,,,::::,,TTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT,,,,,,::::::::,,,,TTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT,,,TT,,,,,,,,,,TTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTTTT,,TTTTTTTTTT,TTTTTTTTT',
  ],
  things: `
# landmarks and buildings
obj crypt_mouth 11 15
obj bell_tower 22 7
obj mausoleum 16 10
obj mausoleum 27 15
obj dead_oak 18 16
obj statue 25 28
obj shack 2 26
obj lantern 7 28
obj cart 6 24
obj torch 42 30
obj torch 42 35
obj candle 12 18
obj candle 14 18
# small stories (Heart pass, v0.49): someone still brings flowers; the gravedigger's spade stands by an open grave
obj flowers 34 35
obj shovel 21 28
# ways in and out
exit east 47 35 to=crossroads
exit north 30 0 to=wolfwood
exit crypt 13 18 to=crypt lit
# front graves, just inside the gate: easy
spawn rat 3 37 29
spawn corpse 4 25 35
spawn corpse 4 31 35
spawn corpse 4 36 35
# middle graves by the flooded corner
spawn corpse 5 29 20
spawn corpse 5 35 22
spawn corpse 5 29 24
spawn corpse 5 36 24
rare weeping_bride 33 22
# back graves under the fog: pairs, pull one at a time (ladder draft 2: 7-8, the top of the graveyard band)
spawn corpse 7-8 12 27
spawn corpse 7-8 16 27
spawn corpse 7-8 13 31
spawn corpse 7-8 17 33
# round the crypt and the tower
spawn corpse 5 19 13
spawn corpse 5 21 19
spawn corpse 5 38 27
spawn corpse 5-6 33 30
spawn corpse 6 26 27
spawn corpse 6 22 30
spawn corpse 6-7 20 25
spawn corpse 6-7 17 22
spawn corpse 5-6 25 13
spawn corpse 6 14 21
# critters (Heart pass, v0.49): crows on the fence, the tower, the angel and the open graves, frogs round the flooded
# corner, moths at every light, an owl on the dead oak, bats round the belfry
critter crow 13.5 5.1 1 high
critter crow 37.3 5.1 1 high
critter crow 22.5 4.9 1 high
critter crow 25.5 27.2 1 high
critter crow 16.3 32.6
critter crow 19.6 27.4
critter frog 33.4 9.6
critter frog 39.8 11.5
critter frog 29.4 13.8
critter frog 38.6 14.4
critter moth 7.5 27.6 3
critter moth 42.5 29.6 2
critter moth 42.5 34.6 2
critter moth 13.5 18.6 2
critter owl 17.5 14.9
critter bat 23.5 6.4 2
# secrets
chest 27 41
# fog banks (x y w h)
fog 9 24 13 13
fog 9 12 12 9
fog 26 17 13 9
label 23 5 Bell tower
label 13 13 Crypt
label 34 8 Flooded corner
label 4 24 Gravedigger
`
};

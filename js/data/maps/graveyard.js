// Sunken Graveyard (surface), levels 3-5. West spoke of Zone 1. Format: docs/map-format.md
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
    ',:,,TT,,,#.............::.....mmmmmmmmm..#T~~~~,',
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
    ',:,,,,,,,#....:::.+.o.....:::::.......t..#,,,,,T',
    ',:,,,,,,,#..::::...........::::::.....t.t#,,,,,,',
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
# ways in and out
exit east 47 35 to=crossroads
exit north 30 0 to=wolfwood
exit crypt 13 18 to=crypt lit
# front graves, just inside the gate: easy
spawn rat 3 37 29
spawn corpse 3 25 35
spawn corpse 3 31 35
spawn corpse 3 36 35
# middle graves by the flooded corner
spawn corpse 4 29 20
spawn corpse 4 35 22
spawn corpse 4 29 24
spawn corpse 4 36 24
rare weeping_bride 33 22
# back graves under the fog: pairs, pull one at a time
spawn corpse 4-5 12 27
spawn corpse 4-5 16 27
spawn corpse 4-5 13 31
spawn corpse 4-5 17 33
# round the crypt and the tower
spawn corpse 5 19 13
spawn corpse 5 21 19
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

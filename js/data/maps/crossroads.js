// Crossroads (outside Town 1's gate), levels 1-3: the hub of Zone 1. Roads to the graveyard (west), Wolfwood (north),
// the rat tunnel's sinkhole (east) and Town 1 (south). Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.crossroads = {
  name: 'Crossroads', zone: [50, 69], tint: 'dusk', start: 'south', rules: '',
  enter: 'You stand at the crossroads outside Town 1. Roads run off in every direction.',
  tiles: [
    'TT,TTTTTTTTTTTTTb,TTTTT,,,==,,,TTTTTT,TTTTTTTTTT',
    ',TTT,T,TTTTTTT,TTTTTTTT,,,==,,,T,TTTTTTTT,TTTTTT',
    'TTTTTT,TTTTT,TTTT,T,TTT,,,==,,,TTTTTTTTT,TTTTTTT',
    'TTTT,TTTTTT,T,TTTTT,TTT,T,==,,,TTTTTTTTTTT,TT,,,',
    'TTTTTTTTTTT,TTTTTT,TTTT,,,==,,bTTTTTT,TTT,,T,T,,',
    ',TTTTTTTTTTTTTTTTTTTTTT,,,==,,,TT,,T,T,,,,,,,,~~',
    'TTTT,TTTTTTTTT,,TTT,TTT,,,==,,,,,,T,,,T,,,~~~~~~',
    'TTTTTTTTTT,TTTTTTT,TTTT,,,==,,,,,,,,,,,~~~~~~~,,',
    'TTTTTTTTTTTbTTTTTTTTTT,,,,==,,b,,,,~~~~~~~,,,,,,',
    'TTTTTT,,b,,,,,T,,TT,,,,,,===,,~~~~~~~~~,,,,,,,,,',
    'T,TT,,,,,,,,,,,,,,ww,,,,,HH~~~~~~~~,,T,,,,,,TT,T',
    ',TT,,,,,,,,,,,w,,,,w,~~~~HH~~~,,,,,,,,,,,,T,TT,T',
    'TTT,,,,,,,w,w,wwww~~~~~~~==,,,,,,b,,,TTTTTTTTTTT',
    'TT,,w,w,w,,www~~~~~~~,T,,==,,T,T,TTTTTTTTTTTTTTT',
    'wwww,,www~~~~~~~~~,,,,,,,==,,,,TTTTTTTTT,,,,TTTT',
    'T,,w~~~~~~~~~~wwww,,,,,,,==,,,TTT,TTTTTT,,,,TTTT',
    '~~~~~~~~~w,,ww,,,,,,Tb,T,==,,,TTTTTTTTTT,,,,,TTT',
    '~~~~wwwww,,,,,,,,TTTTT,T,==,,,TTTTTTTTTT,,:,,,TT',
    'wwb,,,,,,TT,,TTTTTTTTT,,,==,,,TT,TTTTTTT,:,,,TTT',
    ',,,,,TTTTTTT,TTTTT,TTT,,,==,,,T,TTT,T,,,,:,,TTTT',
    'TTTTTTTTT,,,TTTTTTTTTT,,,==,,,TTTT,T,,,,:,,,bTTT',
    'T,TTT,T,,,,,TTTTTTTTTT,,,==,,,TT,,,bT,,:,,,,,,TT',
    'TTTTTT,,,,,,,TT,TTTTT,,,,==,,,,,,,,,,,,:,,,,r,TT',
    'TTTTT,,,,,,,,,TTTT,,,,,,===,T,,,,,,,=,:,,,,,,,,T',
    'TTTTTT,,,,,,,TTTTT,,,,,,==,,,,,,,====,,,,,,,r,TT',
    'TTTT,TT,,,,TTTTTTT,,,,,,==,,,,=======,,,,,,,,,TT',
    'TTTTTTTTT,,TT,,,,,,,,,,,==,=======,,,,r,,,,,,TTT',
    ',,,,,T,,,,,,,,,,,,,,,,,,=======,,,,,,,,,T,,,TTTT',
    ',,,,,,,,,T,,,,,,,,,,========,,,,b,,,,T,TTT,TTTTT',
    ',,,,,,,,,,,,,,============,,,,,,,,,TTTTTTTTTTTTT',
    '=====================,,,==,,,,,T,TTT,,TTTTTT,TTT',
    '=========,,,===,,,,,,,,,==,,,TTTTTTTTTT,TTTTTTTT',
    ',,,,,,,,,:,,,,,,,,,,T,,,==,,,T,T,TTT,TTTTTTTTTTT',
    ',,T,,,,,:,,,,,,,,,TTT,,,==,,,TTTT,,TTT,TTTTTTTTT',
    ',,,,T,,,:,,,,,,,,,TT,,,,==,,,,T,,,,,TT,TTTTTTTTT',
    'TTTTTT,:,,,,,,,,,b,T,,,===,,,T,,,,,,,TTTTTTTTTTT',
    ',TTT,,:,,,T,,,,,,,b,,,,==,,,,,,,,,,,,TTTTTTTTTTT',
    'TTTT,,:,,,TT,,,,,,,TT,,==,,,T,,,,,,,,TTTTTTTTTTT',
    'TTTT,:,,,TTTT,,,,,TT,,,==,,,TTT,,,,,TTT,TTTTTTTT',
    'TTT,,,,,,TT,TTT,,TT,T,,==,,,TTTTT,TTTTTTTTTTTT,T',
    'T,TTT,,TTTTTTTTTTTTT,,,==,,,TTTTTTT,TT,TTTTTTT,T',
    'TTTTTTTTTTTTTTTTT,T,,T,==,,,TTT,TTTTTTTTTTTTTTTT',
    'TTTT,TTTTTTTTTTTTTT,,,,==,,,TTTTTT,TTTTTTTTTTTT,',
    'TTTTTTTTTTTTTTTTTTTT,,,==,T,T,TTT,TTTTTT,TTTT,T,',
  ],
  things: `
obj campfire 20 25
obj signpost 27 29
obj sinkhole 39 22
obj lantern 37 21
obj burrow 41 15
obj torch 20 40
obj torch 26 41
obj torch 2 28
# ways in and out
exit south 23 43 to=town1 lit
exit west 0 30 to=graveyard
exit north 26 0 to=wolfwood
exit sinkhole 38 23 to=rat_tunnel at=mouth
exit burrow 42 17 to=rat_tunnel at=back_hole
# by the town road: the easiest rats
spawn rat 1 21 37
spawn rat 1 26 35
spawn rat 1 19 31
# west road toward the graveyard
spawn rat 1-2 13 31
spawn rat 2 6 29
# marsh meadow by the creek: beetles
spawn beetle 2-3 9 13
spawn beetle 2-3 13 12
spawn beetle 2-3 6 14
rare ironshell 10 16
# east of the crossing, toward the sinkhole
spawn rat 2 31 27
spawn rat 2-3 34 24
# along the creek and the north road
spawn beetle 3 33 7
spawn beetle 3 37 7
spawn beetle 2-3 22 8
# round the sinkhole
spawn rat 2-3 41 26
spawn rat 2-3 43 19
# secret: a chest at the end of a deer trail in the south-west woods
chest 5 38
label 24 24 Crossroads
label 40 19 Sinkhole
label 41 13 Back hole
label 25 9 Old bridge
label 11 11 Marsh
`
};

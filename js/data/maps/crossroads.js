// Crossroads (outside Town 1's gate), levels 1-3: the hub of Zone 1. Roads to the graveyard (west), Wolfwood (north),
// the rat tunnel's sinkhole (east), Town 1 (south), and a steep path north-east up to the Ruined Chapel's east gate. Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.crossroads = {
  name: 'Crossroads', zone: [50, 69], tint: 'dusk', start: 'south', rules: '', wade: 1, startAt: [25, 37], // the creek: walk in, but slowly (v0.64)
  enter: 'You stand at the crossroads outside Town 1. Roads run off in every direction.',
  tiles: [
    'TT,TTTTTTTTTFFFFb,FFFFF,,==,,,,FFFFFF,FFTFFTTTTT',
    ',TTT,T,TTTTTFT,FFFFTFFF,,==,,,,F,FFFFFFFF,FFTTTT',
    'TTTTTT,TTTTT,TTFF,F,TTF,,==,,,,TFFTFFFTT,FTFTTTT',
    'TTTT,TTTTTT,T,TTTTT,TTF,T==,,,,TTTFFTFTFFF,TT,,,',
    'TTTTTTTTTTT,FFTTFT,TTTT,,==,,,bFTTTTF,FFF,,T,T,,',
    ',TTTTTTTTTTTTTFTTTTTTTT,,==,,,,FT,,T,T,,,,,,,,~~',
    'TTTT,TTTTTTTTT,,TTT,TTT,,==,,,,,,,T,,,T,,,~~~~~~',
    'TTTTTTTTTT,TTTTTTT,TTTT,,==,,,,,,,,,,,,~~~~~~~,,',
    'TTTTTTTTTTTbTTTTTTTTTT,,,==,,,b,,,,~~~~~~~,,,,,,',
    'TTTTTT,,b,,,,,T,,TT,,,,,,==,,,~~~~~~~~~,,,,,,,,,',
    'T,TT,,,,,,,,,,,,,,ww,,,,,HH~~~~~~~~,,T,,,,,,TT::',
    ',TT,,,,,,,,,,,w,,,,w,~~~~HH~~~,,,,,,,,,,,,T,T:,T',
    'TTT,,,,,,,w,w,wwww~~~~~~~==,,,,,,b,,,TTTTTTT:,TT',
    'TT,,w,w,w,,www~~~~~~~,T,,==,,T,T,TTTTTTTTTT,:TTT',
    'wwww,,www~~~~~~~~~,,,,,,,==,,,,TTTTTTTTT,,,:TTTT',
    'T,,w~~~~~~~~~~wwww,,,,,,,==,,,TTT,TTTTTT,,,:TTTT',
    '~~~~~~~~~w,,ww,,,,,,Tb,T,==,,,TTTTTTTTTT,,:,,TTT',
    '~~~~wwwww,,,,,,,,TTTTT,T,==,,,TTTTTTTTTT,,:,,,TT',
    'wwb,,,,,,TT,,TTTTTTTTT,,,==,,,TT,TTTTTTT,:,,,TTT',
    ',,,,,TTTTTTT,TTTTT,TTT,,,==,,,T,TTT,T,,,,:,,TTTT',
    'TTTTTTTTT,,,TTTTTTTTTT,,,==,,,TTTT,T,,,,:,,,bTTT',
    'T,TTT,T,,,,,TTTTTTTTTT,,,==,,,TT,,,bT,,:,,,,,,TT',
    'TTTTTT,,,,,,,TT,TTTTT,,,,==,,,,,,,,,,,,:,,,,r,TT',
    'TTTTT,,,,,,,,,TTTT,,,,,,,==,T,,,,,,,:,:,,,,,,,,T',
    'TTTTTT,,,,,,,TTTTT,,,,,,,==,,,,,,::::,,,,,,,r,TT',
    'TTTT,TT,,,,TTTTTTT,,,,,,,==,,,:::::::,,,,,,,,,TT',
    'TTTTTTTTT,,TT,,,,,,,,,,,,===::::::,,,,r,,,,,,TTT',
    ',,,,,T,,,,,,,,,,,,,,,,,,,===:::,,,,,,,,,T,,,TTTT',
    ',,,,,,,,,T,,,,,,,,,,========,,,,b,,,,T,TTT,TTTTT',
    ',,,,,,,,,,,,,,=============,,,,,,,,TTTTTTTTTTTTT',
    '=====================,,,,==,,,,T,TTT,,TTTTTT,TTT',
    '===============,,,,,,,,,,==,,TTTTTTTTTT,TTTTTTTT',
    ',,,,,,,,,:,,,,,,,,,,T,,,,==,,T,T,TTT,TTTTTTTTTTT',
    ',,T,,,,,:,,,,,,,,,TTT,,,,==,,TTTT,,TTT,TTTTTTTTT',
    ',,,,T,,,:,,,,,,,,,TT,,,,,==,,,T,,,,,TT,TTTTTTTTT',
    'TTTTTT,:,,,,,,,,,b,T,,,,,==,,T,,,,,,,TTTTTTTTTTT',
    ',TTT,,:,,,T,,,,,,,b,,,,,,==,,,,,,,,,,TTTTTTTTTTT',
    'TTTT,,:,,,TT,,,,,,,TT,,,,==,T,,,,,,,,TTTTTTTTTTT',
    'TTTT,:,,,TTTT,,,,,TT,,,,,==,TTT,,,,,TTT,TTTTTTTT',
    'TTT,,,,,,TT,TTT,,TT,T,,,,==,,,TTT,TTTTTTTTTTTT,T',
    'T,TTT,,TTTTTTTTTTTTT,,,,,==,,,,,TTT,TT,TTTTTTT,T',
    'TTTTTTTTTTTTTTTTLLLLLLL,,==,,LLLLLLTTTTTTTTTTTTT',
    'TTTT,TTTTTTTTTTTTTTTT,,,,==,,TTTTT,TTTTTTTTTTTT,',
    'TTTTTTTTTTTTTTTTTTTT,,,,,==,,,TTT,TTTTTT,TTTT,T,',
  ],
  things: `
obj campfire 20 25
obj signpost 27 29
obj sinkhole 39 22
obj lantern 37 24   # v0.64: moved to the path side (it boxed you in north of the sinkhole)
obj torch 2 28
# ways in and out
exit south 25 40 to=town1 lit   # v0.64: at the closed gate (Town 1 isn't built yet)
exit west 0 30 to=graveyard
exit north 26 0 to=wolfwood
exit sinkhole 38 23 to=rat_tunnel at=mouth
exit east_path 47 10 to=chapel at=east_path   # v0.62: the steep path up to the chapel's east gate (it opens from the chapel side)
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
# Owner (Nov 20): more mobs in the little pockets in the trees, a bit of danger for new players without overrunning them.
spawn rat 2 9 22
spawn rat 1-2 11 24
spawn rat 1-2 15 34
spawn rat 2 3 33
spawn rat 1-2 33 35
spawn rat 1-2 31 37
spawn rat 2-3 42 15
spawn beetle 3 43 17
spawn beetle 2 6 10
spawn beetle 3 36 6
# small stories and wear (heart pass, v0.59)
obj town_gate 23 41   # v0.64: a gatehouse in a palisade wall, doors shut
obj wagon 11 32
obj bedroll 18 24
obj fallen_log 19 27
obj fishing_rod 26 10
fog 3 10 17 8
# critters: moths at every light, crows on the signpost and the wagon, frogs on the creek banks, an owl over the
# crossing, fireflies over the marsh, rabbits in the meadows that bolt for the trees
critter moth 20.5 25.4 3
critter moth 37.6 24.0 2
critter moth 23.6 40.2 2
critter moth 28.4 40.2 2
critter moth 2.5 28.3 2
critter crow 27.6 28.0 1 high
critter crow 12.6 31.9 1 high
critter crow 15.5 29.6
critter crow 31.4 27.8
critter frog 30.5 11.6
critter frog 39.5 9.6
critter frog 18.5 14.4
critter frog 9.5 16.6
critter frog 4.5 17.6
critter owl 28.5 22.6
critter firefly 8 13 6
critter firefly 15 12.5 5
critter firefly 33 8 4
critter rabbit 9.5 22.5
critter rabbit 33.5 34.5
critter rabbit 14 36.5
critter rabbit 41.5 16.5
# secret: a chest at the end of a deer trail in the south-west woods
chest 5 38
label 24 24 Crossroads
label 40 19 Sinkhole
label 25 9 Old bridge
label 11 11 Marsh
`
};

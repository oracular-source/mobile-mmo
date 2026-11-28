// Ironshell's hollow (v0.129, owner, Nov 27): a small hidden dell off the crossroads' far north-east corner, where the old
// steep path up to the chapel used to go. You phase into it like any area. Ironshell is always home, guarding a chest. Up on
// the ledge behind the chapel's low stone wall, fen cultists walk about: a peek at what's to come. You can see and tap them,
// but no one can reach anyone (aloof = they never join a fight; the wall blocks spells both ways, line of sight v0.126).
// Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.nook = {
  name: 'Ironshell Hollow', zone: [98, 62], tint: 'dusk', start: 'south', rules: '',
  enter: 'The trees close in behind you. Above the hollow an old stone wall runs along a ledge, and hooded shapes move behind it.',
  tiles: [
    'TTTTFFFFFFFFFFFFTTTT',
    'TTFFnnnnnnnnnnnnFFTT',
    'TFFnnnnnnnnnnnnnnFFT',
    'TFnnnnnnnnnnnnnnnnFT',
    'TTWWWWWWWWWWWWWWWWTT',
    'TT,,,,,,,,,,,,,,,,TT',
    'Tb,,,,,,,,,,,,,,,,bT',
    'T,,,,,,,,,,,,,,,,,,T',
    'TT,,,,,,,,,,,,,,,TTT',
    'TTT,,,,,,,,,,,,,,TTT',
    'TTTT,,,,,,,,,,,TTTTT',
    'TTTTTT,,,::,,TTTTTTT',
    'TTTTTTT,,::,TTTTTTTT',
    'TTTTTTTT,::,TTTTTTTT',
  ],
  things: `
# the way back: the grass gap down to the crossroads
exit south 9 13 to=crossroads at=hollow
# Ironshell, the big mossy beetle, is always home; his chest sits behind him at the foot of the wall
named ironshell 3 9 7
chest 9 5
# small life and a bit of story: a stump and a log where the hollow's trees came down, toadstools in the damp
obj fallen_log 6 11
# foxfire glows on the rotting log by the path (the cold green light that marks the way back out)
obj foxfire 8 12
obj stump 15 8
obj toadstools 4 6
obj toadstools 16 7
critter rabbit 14.5 9.5
critter crow 6.5 3.4 1 high
critter crow 13.5 3.2 1 high
# up on the ledge, behind the wall: the fen cult, out of reach (levels 10-14 live up there)
spawn cult_zealot 12 5 2 aloof
spawn cult_ashcaller 12 10 1 aloof
spawn cult_chanter 12 14 2 aloof
fog 2 1 16 3
label 9 2 The chapel's wall (out of reach)
label 9 8 Ironshell
`
};

// Rat tunnel (under the crossroads), levels 2-6: a sinkhole into damp burrows, Old Gnawbone at the bottom. Format: docs/map-format.md
// Check and draw it: python3 tools/mapcheck.py js/data/maps/*.js
'use strict';
MAPS.rat_tunnel = {
  name: 'Rat Tunnel', zone: [0, 0], tint: 'earth', start: 'mouth', rules: '',
  enter: 'You drop down through the sinkhole. Cold, damp earth, and squeaking somewhere ahead.',
  tiles: [
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEuuEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEhEuuEhEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEddddddEEEEEEEEEEEEEEEEEEEEdEhEEEEEEEEEEEE',
    'EEEEEdpddpdddEEEEEEEEEEEEEEEEdddddEEEEEEEEEEEE',
    'EEEEdddddddddEEEEEEEEEEEEEhEdddddBEEEEEEEEEEEE',
    'EEEEddddddddddEEEEEEEhEEdEddddddddEEEEEEEEEEEE',
    'EEEEdddddddddddEEEEEdddddddpddEEEEEEEEEEEEEEEE',
    'EEEEdddddddddddddEEdddddddddddEEEEEEEEEEEEEEEE',
    'EEEEEEddddEEEddddddddddddddEEEEEEEEEEEEEEEEEEE',
    'EEEEEEdddEEEEEEddddddddddddEEEEEEEEEEEEEEEEEEE',
    'EEEEEddddEEEEEEEdddddddddddEEEEEEEEEEEEEEEEEEE',
    'EEEEEddddEEEEEEEEEEddddddEddEEEEEEEEEEEEEEEEEE',
    'EEEEEdddEEEEEEEEEEEEddddEEEddEEEEEEEEEEEEEEEEE',
    'EEEEEddddEEEEEEEEEEdddEEEEEEdEEEEEEEEEEEEEEEEE',
    'EEEEEddddEEEEEEEEEddddEEEEEEdEEEEEEEEEEEEEEEuE',
    'EEEEEddddEEEEEEEEEddddEEEEEEdEEEEEEEEEEEEEEEuE',
    'EEEEEEdddEEEhEEEEEddddEEEEEEddEEEEEEEEEEEEEEdE',
    'EEEEEEEdddEEdddEEddddEEEEEEEEdEEEEEEEEEEEEEddE',
    'EEEEEEEdddddddddddddEEEEEEEEEdEEEEEEEEEEEEEdEE',
    'EEEEEEEEdddddddddddddEEEEEEEEdEEEEEEEEEEEEEdEE',
    'EEEEEEEEdddddddddddddEEEEEEEEdEEEEEEEEEEEEEdEE',
    'EEEEEEEEddd~~~~~ddddddEEEEEEEddEEEEEEEEEEEddEE',
    'EEEEEEEEdd~~~~~~~dddddEEEEEEEEdEEEEEEEEEEEdEEE',
    'EEEEEEEEdd~~~~~~~dddddEEEEEEEEdEhEEEEEEEEEdEEE',
    'EEEEEEEEEdd~~~~~dddddddEhEEEEdddddEhEEhEEEdEEE',
    'EEEEEEEEEddddddddddddddddEEEdddpdddddddEEddEEE',
    'EEEEEEEEEEdddddddddEEdddddEdddddddpdddddddEEEE',
    'EEEEEEEEEEEdddEEEEEEEEEddddddddddddddddddEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEdBddddddddddddddBdEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddddddEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddddEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEBddddddddddddddEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEdddddddddddBddEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEddBddddddddEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEdddddEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
  ],
  things: `
# daylight through the sinkhole and a few cracks; the cart fell in from the road above
obj light_shaft 8 4
obj light_shaft 6 5
obj light_shaft 23 8
obj light_shaft 13 19
obj light_shaft 33 27
obj cart 10 6
obj gnaw_pile 36 27
# ways in and out (the back hole climbs up into the woods north-east of the crossroads)
exit mouth 7 2 to=crossroads at=sinkhole lit
exit back_hole 44 15 to=crossroads at=burrow
# sinkhole floor: small tunnel rats
spawn tunnel_rat 2 5 6
spawn tunnel_rat 2 11 8
spawn tunnel_rat 2-3 6 13
# the warren: holes everywhere
spawn tunnel_rat 2-3 20 9
spawn tunnel_rat 2-3 24 10
spawn tunnel_rat 3 19 15
# pool cavern: the first big rats
spawn tunnel_rat 3 18 20
spawn tunnel_rat 3 10 19
spawn big_rat 5 20 25
spawn big_rat 5 12 27
spawn big_rat 5 23 27
# Gnawbone's den: big rats up to his level (ladder draft 2: deep big rats 5-6)
spawn big_rat 5-6 28 29
spawn big_rat 5-6 31 32
spawn big_rat 6 39 31
named old_gnawbone 6 34 29 summon=gnaw_pile key=severed_paw
# secrets: the side burrow with a dead adventurer, and the Pale Rat
chest 32 4
rare pale_rat 29 6
# damp mist over the pool and the den floor (x y w h)
fog 8 19 14 8
fog 25 26 16 9
label 8 0 Sinkhole
label 23 6 Warren
label 31 2 Side burrow
label 14 17 Pool cavern
label 34 24 Gnawbone's den
label 40 13 Back hole
label 28 18 Squeeze
`
};

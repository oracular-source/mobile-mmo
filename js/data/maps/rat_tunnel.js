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
    'EEEEEddddEEEEEEEEEddddEEEEEEdEEEEEEEEEEEEEEEEE',
    'EEEEEddddEEEEEEEEEddddEEEEEEdEEEEEEEEEEEEEEEEE',
    'EEEEEEdddEEEhEEEEEddddEEEEEEddEEEEEEEEEEEEEEEE',
    'EEEEEEEdddEEdddEEddddEEEEEEEEdEEEEEEEEEEEEEEEE',
    'EEEEEEEdddddddddddddEEEEEEEEEdEEEEEEEEEEEEEEEE',
    'EEEEEEEEdddddddddddddEEEEEEEEdEEEEEEEEEEEEEEEE',
    'EEEEEEEEdddddddddddddEEEEEEEEdEEEEEEEEEEEEEEEE',
    'EEEEEEEEddd~~~~~ddddddEEEEEEEddEEEEEEEEEEEEEEE',
    'EEEEEEEEdd~~~~~~~dddddEEEEEEEEdEEEEEEEEEEEEEEE',
    'EEEEEEEEdd~~~~~~~dddddEEEEEEEEdEhEEEEEEEEEEEEE',
    'EEEEEEEEEdd~~~~~dddddddEhEEEEdddddEhEEhEEEEEEE',
    'EEEEEEEEEddddddddddddddddEEEdddpdddddddEEEEEEE',
    'EEEEEEEEEEdddddddddEEdddddEdddddddpdddddddEEEE',
    'EEEEEEEEEEEdddEEEEEEEEEdddddddddddddddddBEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddddddEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddddddEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddddEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEdddddddddddddddEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEddddddddddddddEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEdddddddddddEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEdddddEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
  ],
  things: `
# daylight only under the sinkhole (owner, Nov 27: no light shafts deeper in); the cart fell in from the road above
obj light_shaft 8 4
obj light_shaft 6 5
obj cart 10 6
obj gnaw_pile 36 27
# one way in and out: the sinkhole (owner, Nov 20: it's a rat tunnel; the old back hole is gone)
exit mouth 7 2 to=crossroads at=sinkhole lit
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
spawn tunnel_rat 3-4 29 17
spawn tunnel_rat 4 29 20
spawn tunnel_rat 3-4 26 12
spawn big_rat 4 9 23
spawn big_rat 4-5 16 25
named old_gnawbone 6 34 29 summon=gnaw_pile key=severed_paw
# secrets: the side burrow with a dead adventurer, and the Pale Rat
chest 32 4
rare pale_rat 29 6
# pool cavern (love pass, Nov 27): a wet bank, dripstone by the wall, glow caps where it's damp, rat tracks to the water, pale fish
obj stalagmite 8 22
obj stalagmite 9 26 small
obj glow_caps 9 25
obj glow_caps 17 22
obj rat_tracks 17 23 w
obj rat_tracks 12 21 s
critter cavefish 13.5 23.6 2
# Gnawbone's den (love pass, Nov 27): bones heaped round his nest and thinning out, a drag trail in from the west,
# glow caps feeding on the rot by the pile (the den's only light)
obj gnawed_bones 35 28 heap
obj gnawed_bones 38 27 heap
obj gnawed_bones 36 29 heap
obj gnawed_bones 34 28 few
obj gnawed_bones 37 29 few
obj gnawed_bones 38 29 few
obj gnawed_bones 35 30 few
obj gnawed_bones 39 28 few
obj gnawed_bones 33 29 one
obj gnawed_bones 31 28 one
obj gnawed_bones 29 29 one
obj gnawed_bones 27 28 one
obj glow_caps 39 29
obj glow_caps 32 27
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

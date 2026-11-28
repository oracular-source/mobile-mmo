// Town 1, DRAFT 2 (map chat, Nov 27): round and cozier, with the wizard's stable. In the game behind DEV → Teleport → Town 1 (draft) only; the crossroads gate stays shut until it's built (town1 has no ZONE_OF entry, on purpose).
// Format: docs/map-format.md
'use strict';
MAPS.town1 = {
  name: 'Town 1', zone: [53, 113], tint: 'dusk', start: 'north', rules: '',
  enter: 'Town 1. Everyone you need is round the square.',
  tiles: [
    'TTTTTTTTTTTTT,TTT,TT==,TTTT,TTTTTTTTTTTTTT',
    ',TTTT,TT,TTTTTTTTT,T==TT,,TTTTT,,TTTTTTTTT',
    'TTT,TTT,,,TTT,,TTTTT==TTTT,TTTTT,T,,TTTTTT',
    'TTTTTTTTT,TTTTTT,,TT==TT,TT,TTTTT,,TTTTTTT',
    'TT,,,,,TTTTTTTTT,T,,==,TTTT,,TT,TT,,TTT,T,',
    ',TT,TTTT,,T,,TTTTT,T==T,,TTTTTTTT,TTT,T,TT',
    'TTTTT,TTTTTTT,TTTTTT==,TTTTTTTT,T,,TT,,TTT',
    'TTTT,,TTTT,,T,TT,,T,==,TTTTTTTTTT,,,TTTTTT',
    'T,,TT,TTTTTTT,T,,,,,==,,,,TTTTTTTTTTTTTTTT',
    'TTTT,T,TT,TTT,,,WWWW==WWWW,,TTTTTTTTT,,TTT',
    'TTTTT,,TT,TT,,WWW,,,==,,,WWW,,TTTTTTTTTTTT',
    'TTT,TT,TTTT,,WW,,,,,==,,,,,WW,,,TTT,,,T,TT',
    'TTTTT,TTTT,,WW,,,,,,==,,,,,,WW,,TTTTTTTTTT',
    'T,TTTTTTTT,WW,,,,,,,==,,,,,,,WW,TTTTTTTTTT',
    'TTTT,T,,T,WW,,,,,,,,==,,,,,,,,WW,,TTT,TTTT',
    ',T,T,TT,T,W,,,,,,,,,==,,,,,,,,,W,TTTTTT,TT',
    ',T,T,TTT,WW,,,,:::,,ss,,:::,,,,WW,TTTTT,T,',
    'TTTTT,,,,W,,,,,,,,ssssss,,,,,,,,W,,TTTTTTT',
    'TT,TTTTT,W,,,,,,,ssssssss,,jjjjjW,TTTTTTT,',
    'TT,,TTT,,W,,,,,,,ssssssss,,j,,,,W,,TT,TTTT',
    'TTTT,TT,,W,,,,,:ssssssssss,j,,,,W,,TTT,,,T',
    'TT,TTTT,,W,,,,:,ssssssssss,j,,,,W,,TTTTT,T',
    'TTTTT,T,,W,,,,,,,ssssssss,,j,,,,W,,TTTTTTT',
    'TTTTTT,T,W,,,,,,,ssssssss,,jjjjjW,TT,TTTTT',
    'TTT,TTTT,W,,,,,,,:ssssss,,,,,,,,W,,TTT,T,T',
    'TTT,TTTT,WW,,,,,,:,:ss:,,,,,,,,WW,TTT,TTTT',
    ',,T,,TT,T,W,,,,,,::,,,:,,,,,,,,W,TTTTTTT,T',
    ',TT,,TTTT,WW,,,,,:,,,,:,,,,,,,WW,T,TT,TTTT',
    ',TT,TT,TTT,WW,,,,,,,,,::::,,,WW,TT,T,TTT,,',
    'TTTT,T,T,T,,WW,,,,,,,,,,,,,,WW,,,TTTTTTTT,',
    ',,TTTTTTTTT,,WW,,,,,,,,,,,,WW,,T,TTTTTTTT,',
    'TTT,TT,T,TT,,,WWW,,,,,,,,WWW,,TT,T,T,TTT,T',
    'TTTTTTTTTTTTTT,,WWWWWWWWWW,,TTTTTTTTTTT,TT',
    'TT,,TTTTT,T,T,TT,,,,,,,,,,T,TT,,TT,,TT,T,T',
    ',T,TT,,TTTTTTTT,TTT,,,,TTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTTTTT,T,,T,T,T,,T,,TTTT,T,TT,TTTT',
    'TTT,T,T,TTTT,TT,T,TT,T,TTTTTTT,TT,TTTTTTTT',
    'T,TTTTTTTTTTTTTTT,TTTT,,TTTTTTTT,TT,TTTTTT',
    'TT,TTTTT,TTTT,,TT,TTTTTTTTTTT,TTTT,TTT,T,T',
    'TTT,TT,TT,TTT,T,T,TTTTTTT,TTT,TTTTTTTTTTT,',
    ',,T,,,TTTT,,T,TTTTTTTTTTTTTT,T,TTTTTTTTT,T',
    ',TTTT,TTT,TTT,T,TTTTTTT,T,TTTT,T,TTT,TT,TT',
  ],
  things: `
# Town 1 DRAFT 2 (owner, Nov 27): round and cozier. The town wall is a circle of stone (v0.153, owner: stone walls, not a log palisade), everyone stands round a round flagstone
# square a few steps from the hearth, worn paths to each door. The wizard keeps a stable and a paddock of horses beside
# his tower (why does a wizard sell horses? nobody knows). Wrapped in forest so the mirrored edge is woods.
exit north 20 0 to=crossroads at=south lit
obj lantern 22 4
obj torch 18 10
obj torch 23 10
obj signpost 22 15
# the hearth: start, rest, swap forks (what campfires do today)
obj campfire 20 20 half
obj bench 18 23
obj bench 23 23
# north-west: the smith (repair); his barrels by the road
obj forge 14 14
obj barrels 18 14
# north-east: the bank
obj bank 25 14
# west: the gem cutter's table (enchanting) and Marrow the Peddler's wagon (sell junk, buy orbs)
obj gem_table 11 17
obj wagon 11 20
obj lantern 14 19
# south-west: a townhouse and the well
obj townhouse 13 23
obj well 15 27
# south, facing the gate across the square: the wizard's tower, his scrying orb on the square's edge (main quest)
obj wizard_tower 19 28 half
obj orb_stand 20 24 half
# south-east: the wizard's stable, and his paddock against the town wall (your first mount comes from here)
obj stable 23 25
obj hay_bale 31 19
obj trough 29 22
critter horse 29.6 21.0
critter horse 30.8 21.7
critter horse 28.8 20.0
# life
critter crow 25.2 24.6 1 high
critter crow 15.3 22.4 1 high
critter moth 14.5 19 2
critter moth 22.5 4 2
label 22 21 Hearth
label 15 13 Smith
label 26 13 Bank
label 11 16 Gems
label 11 19 Marrow
label 20 33 Wizard
label 24 24 Stable
`
};

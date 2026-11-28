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
    'TTTT,T,TT,TTT,,,LLLL==LLLL,,TTTTTTTTT,,TTT',
    'TTTTT,,TT,TT,,LLL,,,==,,,LLL,,TTTTTTTTTTTT',
    'TTT,TT,TTTT,,LL,,,,,==,,,,,LL,,,TTT,,,T,TT',
    'TTTTT,TTTT,,LL,,,,,,==,,,,,,LL,,TTTTTTTTTT',
    'T,TTTTTTTT,LL,,,,,,,==,,,,,,,LL,TTTTTTTTTT',
    'TTTT,T,,T,LL,,,,,,,,==,,,,,,,,LL,,TTT,TTTT',
    ',T,T,TT,T,L,,,,,,,,,==,,,,,,,,,L,TTTTTT,TT',
    ',T,T,TTT,LL,,,,:::,,ss,,:::,,,,LL,TTTTT,T,',
    'TTTTT,,,,L,,,,,,,,ssssss,,,,,,,,L,,TTTTTTT',
    'TT,TTTTT,L,,,,,,,ssssssss,,,,,,,L,TTTTTTT,',
    'TT,,TTT,,L,,,,,,,ssssssss,,,,,,,L,,TT,TTTT',
    'TTTT,TT,,L,,,,,:ssssssssss,,,,,,L,,TTT,,,T',
    'TT,TTTT,,L,,,,:,ssssssssss,,,,,,L,,TTTTT,T',
    'TTTTT,T,,L,,,,,,,ssssssss,,,,,,,L,,TTTTTTT',
    'TTTTTT,T,L,,,,,,,ssssssss,,,,,,,L,TT,TTTTT',
    'TTT,TTTT,L,,,,,,,:ssssss,,,,,,,,L,,TTT,T,T',
    'TTT,TTTT,LL,,,,,,:,:ss:,,,,,,,,LL,TTT,TTTT',
    ',,T,,TT,T,L,,,,,,::,,,:,,,,,,,,L,TTTTTTT,T',
    ',TT,,TTTT,LL,,,,,:,,,,:,,,,,,,LL,T,TT,TTTT',
    ',TT,TT,TTT,LL,,,,,,,,,::::,,,LL,TT,T,TTT,,',
    'TTTT,T,T,T,,LL,,,,,,,,,,,,,,LL,,,TTTTTTTT,',
    ',,TTTTTTTTT,,LL,,,,,,,,,,,,LL,,T,TTTTTTTT,',
    'TTT,TT,T,TT,,,LLL,,,,,,,,LLL,,TT,T,T,TTT,T',
    'TTTTTTTTTTTTTT,,LLLLLLLLLL,,TTTTTTTTTTT,TT',
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
# Town 1 DRAFT 2 (owner, Nov 27): round and cozier. The palisade is a circle, everyone stands round a round flagstone
# square a few steps from the hearth, worn paths to each door. The wizard keeps a stable beside his tower, his horses tied
# at a rail (why does a wizard sell horses? nobody knows). Wrapped in forest so the mirrored edge is woods.
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
# south-east: the wizard's stable; two of his horses tied at a hitching rail beside it, a trough and hay (your first
# mount comes from here). Owner (Nov 27): no paddock fence, a town doesn't have a fence in the middle.
obj stable 23 25
obj hitching_post 28 21
obj hay_bale 31 21
obj trough 28 23
critter horse 28.9 22.8 1 tied
critter horse 30.7 22.8 1 tied
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

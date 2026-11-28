// Town 1, DRAFT 1 (map chat, Nov 27): the hub you start in and walk out of to the crossroads. In the game behind DEV → Teleport → Town 1 (draft) only; the crossroads gate stays shut until it's built (town1 has no ZONE_OF entry, on purpose).
// Format: docs/map-format.md
'use strict';
MAPS.town1 = {
  name: 'Town 1', zone: [53, 113], tint: 'dusk', start: 'north', rules: '',
  enter: 'Town 1. Everyone you need is round the square.',
  tiles: [
    ',TT,TTT,T,TTTTTT,T,TT,==,TTTTTTTTT,T,T,TTT,TTT',
    'TTTTTTT,TTTTTTTTTTTT,,==,TTTTTTTT,,TTT,,TTTTTT',
    'T,TTTT,,,T,,T,,TTTTTT,==,,TTTTTTT,TTTT,,,TTTTT',
    'TTTT,TTTTTTTTTTT,T,TT,==,TTTTTTTTTTTTT,,TTTTTT',
    'T,T,TTT,TTTT,TTTTTTTT,==,TTTTTTTTTTT,,,TTTTTTT',
    'TTTTTTTTTTT,TTTTTTTTT,==,TTTTT,TTTTT,,,TT,TTTT',
    'T,TTTTT,,T,TTTTTTTTTT,==,TTTTTTTTTTT,T,,TTTTTT',
    ',,,,TT,T,T,,TT,T,,,,T,==,,,T,,,,,,,TT,TT,,,,T,',
    'TTTTTT,,LLLLLLLLLLLLLL==LLLLLLLLLLLLLL,TTTTTTT',
    ',TTT,TTTLTT,,,,,,,,,,,==,,,,,,,,,,,TTL,T,TTTTT',
    'TT,T,,TTL,,,,,,,,,,,,,==,,,,,,,,,,,,,L,TTTTTTT',
    'TTTTT,T,L,,,,,,,,,,,,,==,,,,,,,,,,,,,LT,TTTTTT',
    'TT,TTTTTL,,,,,,,,,,,,,==,,,,,,,,,,,,,L,TTTT,TT',
    'TTTTTT,,L,,,,,,,,,,,,,==,,,,,,,,,,,,,L,TTTTTTT',
    'TTTTT,TTL,,,,,,,,,,,,,==,,,,,,,,,,,,,L,TTTTTT,',
    'T,,TTTT,L,,,,,,,,,,,,,==,,,,,,,,,,,,,LTTTTTTTT',
    'TT,,TTT,L,,,,,ssssssssssssssssss,,,,,L,TT,,TTT',
    'T,TTTTT,L,,,,,ssssssssssssssssss,,,,,L,TTT,T,T',
    ',TTTTTTTL,,,,,ssssssssssssssssss,,,,,L,TT,TT,T',
    'TTT,TT,,L,,,,,ssssssssssssssssss,,,,,L,TTTTTT,',
    'TTT,TTT,L,,,,,ssssssssssssssssss,,,,,LTTTTTT,T',
    'TTTTTTT,L,,,,,ssssssssssssssssss,,,,,L,TTT,,TT',
    'TTTTTTTTL,,,,,ssssssssssssssssss,,,,,L,TTTTT,T',
    'TT,TTTTTL,,,,,ssssssssssssssssss,,,,,LTTTTTT,T',
    'T,TTTTTTL,,,,,ssssssssssssssssss,,,,,LTTTTTT,T',
    'TTTTTTT,L,,,,,ssssssssssssssssss,,,,,LTT,TTTTT',
    'TTT,TTTTL,,,,,ssssssssssssssssss,,,,,L,TTTTTTT',
    'TTTTTTT,L,,,,,,,,,,,,,,,,,,,,,,,,,,,,L,,TTTTT,',
    'TTTTTTT,L,,,,,,,,,,,,,,,,,,,,,,,,,,,,L,TT,TT,,',
    'TT,TTTTTLT,,,,,,,,,,,,,,,,,,,,,,,,,,TLTT,TTTTT',
    'T,TTTTTTLTT,,,,,,,,,,,,,,,,,,,,,,,,TTLTTTT,TTT',
    ',TTTT,,,LTT,,,,,,,,,,,,,,,,,,,,,,,,TTL,,,TTTTT',
    'TTTTT,T,LTT,,,,,,,,,,,,,,,,,,,,,,,,TTL,,TTTTTT',
    'TT,TTTTTLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL,TTTTTT,',
    ',,,T,,TTT,T,,TT,,,,T,,,,,TT,,,,,,T,T,,T,,,,,,,',
    'TTTTTTT,TTTTT,,,,,TTT,T,TT,TTTTTTTTTTTTTTTTTTT',
    'TTT,TTT,TTTTTTTT,TTTTTTTTTTTTTTTTTTTTT,,,TTTTT',
    ',TTTTT,TTTTTTTT,T,TTTTTTTTTTTTTTT,TTTTTT,TTTTT',
    'TTTTTT,,TTTT,TTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTT,',
    'TTTTTTT,TTTTT,TTTTTTTTTTTT,,TTTTTTTTTT,TTTTTTT',
    'TTTTTTT,TTTTTTTTTTTTTTTTTTTTTTTTTT,TTTTTTTTTTT',
    'TTTTTTT,T,TTTTTTTTTTTTT,TTT,TTTTT,,TTT,TTTTTTT',
  ],
  things: `
# (v0.143) wrapped in 8 tiles of forest so the ground mirrored past the map edge is woods, not copies of the square;
# the road north runs out through it to the crossroads.
# Town 1 DRAFT 1 (owner, Nov 27): a small Diablo-style hub, not a city. Everyone you need stands round one square,
# a few steps from where you start. No mobs. Gate north to the crossroads. You start by the hearth.
exit north 22 0 to=crossroads at=south lit
obj lantern 24 3
obj torch 20 9
obj torch 25 9
# the hearth: start, rest, swap forks (what campfires do today)
obj campfire 22 21
# north side, either side of the road in: the smith (repair) and the bank
obj forge 15 13
obj torch 19 14
obj bank 28 13
# west side: Marrow the Peddler's wagon (sell junk, buy orbs)
obj wagon 10 19
obj lantern 13 19
# east side: the gem cutter's table (enchanting: orbs, +1 to +5, orb dust)
obj gem_table 33 20
# south, the square's landmark facing the gate: the wizard's tower; he stands at his scrying orb and gives the main
# quest line, then talks to you through the orb wherever you are (no walking back to turn in)
obj wizard_tower 21 28
obj orb_stand 22 24
# townhouses behind, so it reads as a town
obj townhouse 10 11
obj townhouse 32 11
obj townhouse 10 23
obj townhouse 32 23
obj well 17 23
label 23 21 Hearth (start, rest, forks)
label 16 12 Smith: repair
label 29 12 Bank
label 11 18 Marrow: sell
label 34 19 Gems: enchant
label 22 32 Wizard: main quest
`
};

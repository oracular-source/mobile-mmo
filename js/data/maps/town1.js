// Town 1, DRAFT 1 (map chat, Nov 27): the hub you start in and walk out of to the crossroads. Not loaded by the game yet.
// Format: docs/map-format.md
'use strict';
MAPS.town1 = {
  name: 'Town 1', zone: [50, 75], tint: 'dusk', start: 'north', rules: 'town',
  enter: 'Town 1. Everyone you need is round the square.',
  tiles: [
    'LLLLLLLLLLLLLL==LLLLLLLLLLLLLL',
    'LTT,,,,,,,,,,,==,,,,,,,,,,,TTL',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,==,,,,,,,,,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,ssssssssssssssssss,,,,,L',
    'L,,,,,,,,,,,,,,,,,,,,,,,,,,,,L',
    'L,,,,,,,,,,,,,,,,,,,,,,,,,,,,L',
    'LT,,,,,,,,,,,,,,,,,,,,,,,,,,TL',
    'LTT,,,,,,,,,,,,,,,,,,,,,,,,TTL',
    'LTT,,,,,,,,,,,,,,,,,,,,,,,,TTL',
    'LTT,,,,,,,,,,,,,,,,,,,,,,,,TTL',
    'LLLLLLLLLLLLLLLLLLLLLLLLLLLLLL',
  ],
  things: `
# Town 1 DRAFT 1 (owner, Nov 27): a small Diablo-style hub, not a city. Everyone you need stands round one square,
# a few steps from where you start. No mobs. Gate north to the crossroads. You start by the hearth.
exit north 14 0 to=crossroads at=south lit
obj torch 12 1
obj torch 17 1
# the hearth: start, rest, swap forks (what campfires do today)
obj campfire 14 13
# north side, either side of the road in: the smith (repair) and the bank
obj forge 7 5
obj torch 11 6
obj bank 20 5
# west side: Marrow the Peddler's wagon (sell junk, buy orbs)
obj wagon 2 11
obj lantern 5 11
# east side: the gem cutter's table (enchanting: orbs, +1 to +5, orb dust)
obj gem_table 25 12
# south, the square's landmark facing the gate: the wizard's tower; he stands at his scrying orb and gives the main
# quest line, then talks to you through the orb wherever you are (no walking back to turn in)
obj wizard_tower 13 20
obj orb_stand 14 18
# townhouses behind, so it reads as a town
obj townhouse 2 3
obj townhouse 24 3
obj townhouse 2 15
obj townhouse 24 15
obj well 9 15
label 15 13 Hearth (start, rest, forks)
label 8 4 Smith: repair
label 21 4 Bank
label 3 10 Marrow: sell
label 26 11 Gems: enchant
label 14 24 Wizard: main quest
`
};

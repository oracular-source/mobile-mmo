// Ruined Chapel grounds, levels 10-14: the far end of Zone 1, north of Wolfwood. A forest monastery the fen cult has
// taken: low stone wall, chapel with a whole steeple and one lit window, roofless cloister with its bell fallen, herb
// garden and fish pond, the monks' plot (graves dug up), an ash circle. The chapel door is Dungeon 1 (Brother Malrec).
// Style A Vesper embers (area-rules.md). Draft 2 (Nov 20): built to the Area pass checklist; the chapel sits further
// south so its lit steeple shows from the road in. Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
// In the game since v0.62.
'use strict';
MAPS.chapel = {
  name: 'Ruined Chapel', zone: [24, -24], tint: 'chapel', start: 'south', rules: '',
  enter: 'The firs open onto a low stone wall. Candles burn on it, and smoke hangs over the grass.',
  tiles: [
    'FFvvvnnnnvnnnvnnnannFFvFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFnn::::::::::::nnannFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFvnn:nfannnnnf:annFfnFFFFFFFFFFFFFFFFFFFFFFbFF',
    'FFFnnn:nnnWWWWWWqrWWWWWWWWWWWWWWWWWWWWWWWWWWWbFF',
    'FFFvn::nnaWaqaqaaqaqaqqaaqaaaaaaqPsssssssssaWbFF',
    'FFFnvv:avaWqeeeeeeeeaaaaaaaaaqaaqssssssssssaWbFF',
    'FFFfnv:vnFWaaaaqaaaaaaaqaqqqaqaaaPs,,,,,,sPaWbFF',
    'FFFfvv:nvnWqeeeeeeeeaaaaaaaqaaaaass,,,,,,ssqWbFF',
    'FFFnn::navWqaqaaqaaaqaaaaqqaaaqqaPs,,,,,,sPqWbFF',
    'FFFnna:vnaWaeeeeeeeeaaaaaqqaaaaaass,,,,,,ssaWbFF',
    'FFFnna:vfnWaaqaaaa~~~aaaaaaaqqqaaPssssssssPaWbFF',
    'nnnvvn:vanWaeeeea~~~~aqaaaaaaaaaaPsPsPsPsPPaWbFF',
    'vfnnf::nfnWaaqaaaaaaaaaaaaaaaaaaaaaaaaqqaqaqWbFF',
    'nnvvnn:nnnWaaaqaaqaaqaaaaaqaaaqaaqaaqaaaqaaaWbFF',
    'fnnnnv:nnnWqaqaaqaaaaqaaaqqaaqaaaqaqaaaaaaqaWbFF',
    'Fnnnnv:annWaqqqqaaaaaqaqaqaaqaaqaaaaaaaaaaaaWOOO',
    'Fnvnf::nnvWaaqqqaaqqaaaaaaaqaaaaaaaaaqaaaqaqWOOF',
    'nvFnnf:nnvWaqaqqaaaaaaaaaaaqaaqaaaaaqaaaaaaaWOOF',
    'nnFnnn:nnFWaaaqqaqaaaaaaqaaaaaqaaqaaqaaaaaaaG::O',
    'fnvnfa:nrFWaaqqaaaaqqaaaaaaaaqaqaaqaaaaaqaqaW::F',
    'Fnnnn::vvFWqaaqaaaaaaaqqaaaqaaaqaaqaaaaaaaaaW::F',
    'FFFnvnqqqqqaaqqaaaaaaqaaaaaaaaaqaaaaaqaqaaaaW::O',
    'FFFvvnqqqqqaaaaaaqqqaaaaasssssqaaaaaaaaaaqaaW::F',
    'FFFnnn:nnnWqa+o++o+aaaaqqsssssaaaaaaqqaaaaaaW::F',
    'FFFnn::nvrWaaqaaaaaqaaaqqsssssqaaaaaaaaaaaqaW:OO',
    'FFFnna:avFWaTaaaaqaaaqaaaqaaaaaaaaaqaaaaqaqaW::O',
    'FFFnnn:naFWqq++o+++aaqaaqaqaqqqaaaqaqaaaaqaaWOOF',
    'FFFnvn:anFWaqaaqaaaqqqaaaaaaaaaaaaqaaaaqaaaaWOOO',
    'FFFnn::vnFWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWbbF',
    'vFFFnn:naaaFnvvvnnFfvnnfvnnfvnnfvFnnvnnnnnnbbbbF',
    'nFFvvn:anaaFvnnnnnnnfvnFfavnfvnnfvnnfnnvnnvnnFFF',
    'nFnfnv:fnnFannnvvnvnvnnnnnnvvnnnnnfaavFnaaFnvFFF',
    'nnnFn::ffnvnvnnvffvnnvnvnnnnnnvnnvnnnfnFnnFFFFFF',
    'FnFFnn:fnn:fnnn:nvnn:vnfn:nnnnnnnnf::vnnnFFFFFFF',
    'FnFnnn:::::::::::::::::::::::nnnnnnnnnfvnFFFFFFF',
    'nvFnvnnfffnnnnnnnnvffnvnfnn::nnnnnnnnnffFFFFFFFF',
    'FFFvnvnnnfvnnvfnnvfnnfnfnnn::nnnnnnnnfnvFFFFFFFF',
    'FFFFFFFFFfnFFFFFnnvfnnnvnnv::nnnnnnnnnfnFFFFFFFF',
    'FFFFFFnfvfFFFFFFnnnnnnFFnvn::nnnnnnnnvnnFFFFFFFF',
    'FFFFFFfFFnFFFFFnvFFFnFFFnFn::FFFFnvnnnffFFFFFFFF',
  ],
  things: `
# landmarks and props
obj chapel 24 13
obj fallen_bell 36 6
obj ash_circle 35 20
obj shrine 27 33
obj well 15 16
obj book_pyre 22 23
# small stories: the monks' banner torn down under the cult's, a pilgrim's pack dropped by the shrine,
# the monks' graves dug up (o tiles in the plot) with the spade left behind, the monks' books burned before the door
obj torn_banner 22 4
obj pack 30 33
obj shovel 16 25
# light: candles at the wall gap, the door and the ash circle (the shrine carries its own candle); censers hung from the
# cloister's arches where the monks swung them, smoking
obj candle 11 20
obj candle 11 23
obj candle 25 22
obj candle 29 22
obj candle 34 19
obj candle 38 19
obj candle 34 23
obj candle 38 23
obj hung_censer 35 12
obj hung_censer 39 12
obj banner 14 3
obj banner 22 3
obj banner 32 3
obj banner 10 13
obj banner 44 10
obj bedroll 19 20
obj bedroll 41 14
obj bedroll 29 9
obj fallen_log 22 31
obj stump 12 36
# a pilgrim's lantern on a post where the road leaves the woods (lights the way in)
obj lantern 26 38
# ways in and out
exit south 28 39 to=wolfwood at=north
exit dungeon 27 22 to=dungeon1 at=out lit
# the east path down to the crossroads fell away (v0.125): the barred gate now opens onto a ledge with a view
# the east gate is barred: it opens from the inside (west) and stays open
bar 44 18 chapel_east_gate W
# on the road in: lone wisps and the first camp (10)
spawn ash_wisp 10 35 36
spawn ash_wisp 10 20 36
spawn cult_zealot 10 14 31
spawn cult_ashcaller 10 15 30
spawn cult_chanter 10 13 30
# up the west side, outside the wall (11)
spawn cult_zealot 11 3 15
spawn cult_ashcaller 11 2 14
spawn cult_chanter 11 3 13
spawn ash_wisp 11 8 9
spawn ash_wisp 12-13 12 1
# inside the gap: the monks' plot (12)
spawn cult_zealot 12 13 24
spawn cult_ashcaller 12 15 24
spawn cult_chanter 12 18 24
spawn ash_wisp 12 21 21
# herb garden, the quiet corner (12-13)
spawn cult_zealot 12-13 14 8
spawn cult_ashcaller 12-13 16 8
spawn cult_chanter 12-13 15 6
# courtyard by the well (13)
spawn cult_zealot 13 19 16
spawn cult_ashcaller 13 18 18
spawn cult_chanter 13 20 18
spawn ash_wisp 13 31 26
# the east yard, by the barred gate (14)
spawn cult_zealot 14 40 17
spawn cult_ashcaller 14 41 19
spawn cult_chanter 14 39 19
spawn ash_wisp 14 42 23
# the ash circle: the cult's ritual (13-14)
spawn cult_zealot 13-14 35 22
spawn cult_ashcaller 13-14 36 20
spawn cult_chanter 13-14 37 22
# cloister round the fallen bell (13-14)
spawn cult_zealot 13-14 35 9
spawn cult_ashcaller 13-14 37 9
spawn cult_chanter 13-14 39 9
# behind the chapel (14)
spawn cult_zealot 14 25 9
spawn cult_ashcaller 14 27 10
spawn cult_chanter 14 26 8
spawn ash_wisp 14 22 6
# the chapel steps (14)
spawn cult_zealot 14 21 25
spawn cult_ashcaller 14 23 26
spawn cult_chanter 14 22 26
rare ashen_acolyte 13 10
# secret: under the fallen bell's lip
chest 38 7
# something alive in every screen
critter owl 34.5 35.2
critter moth 28.4 32.4 3
critter moth 11.5 21.5 2
critter moth 27 22.4 2
critter moth 36.5 21 2
critter crow 14.5 2.9 1 high
critter crow 30.5 2.9 1 high
critter crow 36.6 6.1 1 high
critter crow 44.1 21 1 high
critter crow 10.1 26 1 high
critter bat 27.5 12.2 2
critter frog 17.6 9.7
critter frog 20.8 12.1
critter rabbit 38 33
# smoke lies low in bands (Vesper embers)
fog 0 31 30 4
fog 12 18 20 3
fog 31 14 12 3
label 27 11 Chapel (Dungeon 1 door)
label 37 3 Cloister, fallen bell
label 16 4 Herb garden, fish pond
label 16 22 Monks' plot (dug up)
label 36 18 Ash circle
label 15 15 Well
label 28 31 Wayside shrine
label 44 16 East gate (barred)
label 8 20 Wall gap
`
};

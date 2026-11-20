// Ruined Chapel grounds, levels 10-14: the far end of Zone 1, north of Wolfwood. A forest monastery the fen cult has
// taken: low stone wall, chapel with a whole steeple and one lit window, roofless cloister with its bell fallen, herb
// garden, monks' plot, an ash circle. The chapel door is Dungeon 1 (Brother Malrec). Style A Vesper embers (area-rules.md).
// Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
// Map draft for the owner (Nov 20); not loaded by the game yet (not in index.html).
'use strict';
MAPS.chapel = {
  name: 'Ruined Chapel', zone: [24, -24], tint: 'chapel', start: 'south', rules: '',
  enter: 'The firs open onto a low stone wall. Candles burn on it, and smoke hangs over the grass.',
  tiles: [
    'FFvvvnnnnvnnnvnnnannFFvFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFnn::::::::::::nnannFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFvnn:nfannnnnf:annFfnFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFnnn:nnnWWWWWWqrWWWWWWWWWWWWWWWWWWWWWWWWWWWFFF',
    'FFFvn::nnaWaaaqqaaaaaaaqaqaaqaaqqaaqqqaaqaaqWFFF',
    'FFFnvv:avaWaeqqqqqqqeaaaqaaaaaqaqqqqaqaaaaqaWFFF',
    'FFFfnv:vnFWaqeeeeeeeqaaaaaaaaaaaaaaqqqqqaaqaWFFF',
    'FFFfvv:nvnWqqqqqqqqqqqqaaaqaqqaaaaPsPsPsPPaaWFFF',
    'FFFnn::navWqqeeeeeeeqqaaaqaqaqaaqassssssssqaWFFF',
    'FFFnna:vnaWqqqqqqqqqqaaaaaqaaaqaaaPse,,esPaaWFFF',
    'FFFnna:vfnWqqeeeeeeeqaaaaaqaaaaaaass,,,,ssqaWFFF',
    'nnnvvn:vanWaqqqqqqqqqaaaaaqqaaaaaaPs,,,,sPqqWFFF',
    'vfnnf::nfnWaeqqqqqqqeqaaaqqaaaaaqass,,,essaqWFFF',
    'nnvvnn:nnnWaaaaqaqqaaaqaaaqaqaaaaaPssssssPaaWFFF',
    'fnnnnv:nnnWqaqaaaaaaaaaaaaaaaaaaaassPsPsPsqaWFFF',
    'Fnnnnv:annWaaaqaaaaaqaqaaaaaaaaaaaaaaqqaaqaaWOOO',
    'Fnvnf::nnvWaaaaaaaqaaaqaasssssaaaaaaqqaqqqqaWOOF',
    'nvFnnf:nnvWaaqaaaaaaaaaassssssaqaqaaaaaaaqaaWOOF',
    'nnFnnn:nnFWaqaaaqaaqaaaqqssssssqaaaaaqaaaqaaG::O',
    'fnvnfa:nrFWaaaaqaqqaqaqaasssssqaqaaqaaaaaaaaW::F',
    'Fnnnn::vvFWaaaqaaaqaaaaaaassaaaaaqaaaaqqaaaaW::F',
    'FFFnvnqqqqqqaaqqaaqaaqaqaaaasaaaqqaaqaaaaaaaW::O',
    'FFFvvnqqqqqaaaaqaaaaaaaqaaasaqaaqaaqaqqaaaaaW::F',
    'FFFnnn:nnnWqaa+++++aaqqaaasaaaqqaqaaaaaaaaaaW::F',
    'FFFnn::nvrWqqqqqqqqqaqaaqqaaqqaqaaaqqqaaqaaaW::O',
    'FFFnna:avFWrqqqqqqqqqaaqaqqqaaqaqqaaaaaaaaqaW:::',
    'FFFnnn:naFWaaa+++++qqqaaaqqaqqaqaaaaaaqaaaaqWOOF',
    'FFFnvn:anFWaaaqaqaaaqaaaaaqqqaqaaqqaaaaaaaaqWOOO',
    'FFFnn::vnFWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFF',
    'vFFFnn:naaaFnvvvnnFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'nFFvvn:anaaFvnnnnnnFFFFFFavFFFFFFFFFFFFFFFFFFFFF',
    'nFnfnv:fnnFannnvvnvnvnnnnnnvvnnnnnfaavFFaaFFFFFF',
    'nnnFn::ffnvnvnnvffvnnvnvnnnfnnvnnvnnnfnFnnFFFFFF',
    'FnFFnn:fnn:fnnn:nvnn:vnfn:nnnf:nnnf::vnnnFFFFFFF',
    'FnFnnn:::::::::::::::::::::::::::::::nfvnFFFFFFF',
    'nvFnvnnfffnnnnnnnnvffnvnfnnnnnnnnnn::nffFFFFFFFF',
    'FFFvnvnnnfvnnvfnnvfnnfnfnnnnnnnnnnn::fnvFFFFFFFF',
    'FFFFFFFFFfnFFFFFnnvfnnnvnnvvvnFnnnn::nfnFFFFFFFF',
    'FFFFFFnfvfFFFFFFnnnnnnFFnvnvnnFnnnn::vnnFFFFFFFF',
    'FFFFFFfFFnFFFFFnvFFFnFFFnFnnnFFFFnv::nffFFFFFFFF',
  ],
  things: `
# landmarks and props
obj chapel 24 7
obj fallen_bell 37 10
obj ash_circle 34 20
obj shrine 33 37
obj candle 32 36
obj candle 35 36
obj candle 11 20
obj candle 11 23
obj candle 25 16
obj candle 29 16
obj candle 33 19
obj candle 37 19
obj candle 33 23
obj candle 37 23
obj censer 22 19
obj censer 32 17
obj censer 40 24
obj banner 14 3
obj banner 22 3
obj banner 32 3
obj banner 10 13
obj banner 44 10
obj bedroll 19 24
obj bedroll 20 16
obj bedroll 16 30
obj fallen_log 22 31
obj stump 12 36
# ways in and out
exit south 36 39 to=wolfwood at=north
exit dungeon 27 16 to=dungeon1 lit
exit east_path 47 25 to=crossroads
# on the road in: lone wisps and the first camp (10)
spawn ash_wisp 10 27 37
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
spawn cult_zealot 12 15 24
spawn cult_ashcaller 12 17 25
spawn cult_chanter 12 16 25
spawn ash_wisp 12 21 22
# herb garden, the quiet corner (12-13)
spawn cult_zealot 12-13 14 9
spawn cult_ashcaller 12-13 16 9
spawn cult_chanter 12-13 18 7
# courtyard west of the chapel (13)
spawn cult_zealot 13 19 17
spawn cult_ashcaller 13 18 18
spawn cult_chanter 13 20 18
spawn ash_wisp 13 29 23
# the ash circle: the cult's ritual (13-14)
spawn cult_zealot 13-14 34 21
spawn cult_ashcaller 13-14 35 20
spawn cult_chanter 13-14 36 22
# cloister round the fallen bell (13-14)
spawn cult_zealot 13-14 35 9
spawn cult_ashcaller 13-14 35 11
spawn cult_chanter 13-14 35 13
spawn ash_wisp 14 42 20
spawn ash_wisp 14 27 4
# the chapel steps (14)
spawn cult_zealot 14 26 17
spawn cult_ashcaller 14 28 17
spawn cult_chanter 14 27 18
rare ashen_acolyte 13 11
# secret: under the fallen bell's lip
chest 39 11
fog 0 31 30 4
fog 12 19 20 3
fog 33 15 10 3
label 27 5 Chapel (Dungeon 1 door)
label 37 7 Cloister, fallen bell
label 16 4 Herb garden
label 16 22 Monks' plot
label 35 19 Ash circle
label 33 34 Wayside shrine
label 44 16 East gate (barred)
label 8 20 Wall gap
`
};

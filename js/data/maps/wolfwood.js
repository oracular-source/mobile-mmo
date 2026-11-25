// Wolfwood, levels 8-11: the north spoke of Zone 1. Old dark forest going sick: leafy trees by the crossroads give way
// to tall firs; grey blight spreads from the dead giant tree. Style A Dusk hush (docs/area-rules.md, look sheet).
// Format: docs/map-format.md. Check: python3 tools/mapcheck.py js/data/maps/*.js
// In the game since v0.40 (monsters in js/data/mobs.js, behaviour in js/world.js).
'use strict';
MAPS.wolfwood = {
  name: 'Wolfwood', zone: [20, 16], tint: 'wood', start: 'south', rules: '',
  enter: 'The road runs north under the trees. Somewhere ahead, a wolf howls.',
  tiles: [
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF::nFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFfFFFFFFFFFFFFFFFnFFFFFFFFFFFFF::nFFFFFFFFnfnFFFFFFFFFFF',
    'FFFfnFFFFnvFFFFFFFnFFFFFOnnFnnFOFFfFnnF::nnFFFFFFFFFnFnFFFFFFFFF',
    'FFFnnnnFnnFvvFnvvvvvvnFOnnnnnnnnOnnFnnn::nnnnnFFFFfnnnnnnnFFFFFF',
    'FFFnnnnfnFnvnnvFFvFvvFvnnnnnnnnnnnFFnnn::nnnnnnfFFFFnnnnnnfFFFFF',
    'FFFnnFFFFnvnvnvvFnFnFFnnnnnnnnnnnnnnnFn::nnnnnnfnFFFFnnnnFFFnFFF',
    'FFnnFnnnnnnvnvnFFvvvFnnnnnnnnnnBnFnnnnn::nnnnnnFFFFFvvnvvvfnnnFF',
    'FFFnnfFnnFnvvnvfvFFFnFvnnBnnnnnnnnnnnnn:::nnnnFFFFFvvFnFvnnFnnFF',
    'FFnnFFFfFFFFnnFFvvnvvFvnnnnnnnnnkknnnnnn::nnnnFFFFFvnvvFvvvFFFFF',
    'FFnnnnnFFFFnnnnnFFnnnFFFnFnvFktvFnnnnnnn::nnFFnFFFfvFvnvvFnnnFFF',
    'FFFnFnOOOOOOOnnnnnnFfnnnFnFknvkkkFtFFnnn:::FFnnnnFFFvvnFnvFnnFFF',
    'FFFnFOnnnnnnnOnnnnnFnFnFknkvkkkkkkknFknnn::FnnnnnnnnvvFvvFFFnnFF',
    'FFFfFOnnnnnnnnOnnFFnFFFtnkkkkkkkkktkkkkFF::nnnnnnnnnnFnFFFnnnnFF',
    'FFFFnnOnnnnnnOnnFFnnnnknkkkkkkkkkkkkkkktk::nnnnnnnnnnnnFFFnnFnFF',
    'FFFFFnnnnnnnnnnnnnnFkknkkkkkkkkkkkkkkkkkn::nnnnnnnnnnnnnFFFFFFFF',
    'FFFFFnnnnnnnnnnnnFnFkknkktkkkkkkkkkkkkktk::nnnnnvnvnnvnnFFnFFFFF',
    'FFFFnnnnn:nnnnnnnnnnFkkkkkkkkkkkkkkkkkkkk::nknnvnnvnnnFnnnnFFFFF',
    'FFFFFnnnn:nnnnnFnnnnkkkkkkkkkkkkkkkkkkkkk::knnnnnvnnvFFnnnnnnFFF',
    'FFFFFFnnFv:n:FnnnnFnFkkkkkkkkkkkkkkkkkkkk::nFnnvnnFvvFFnnnnnnnFF',
    'FFFFFFnFnvvFn:vnnnFFkkktkkkkkkkkkkkkkktkk:::FnFFvFFvvnFnnnFFnFFF',
    'FFFFFnnnnnFnnn:Fnnnnknkkkkkkkkkkkkkkkkkknt::FnfFnFFnnFFFFFFnnnFF',
    'FFnnnnnFnFnFnnn:nnFkFnnkktkkkkkkkkkkkkktkk::nnnFnFFnnfFFnnFFnnFF',
    'FFFFnnnnFnnnFnnn::nFkkkFkkktkkkkkkkktkkkkk:::nnnnnFnFFFFFvvvvvFF',
    'FFFFFnnnnFFnnnnnn::nknnkkkkkkkkkkkkkkknkknn::nnnnnnnnFFFvvvvvvnF',
    'FFFFfnnnnFnnnFnnnnn:nnknnkkkkkkkkkktkkkkkFn:::nnFnnnnnnnnvvvvvFF',
    'FFFFnFFnnnnnnnnnnnnn:::kktkkkkktkkFFktFnnFnn:::nnnnnnnnnnvvvvvFF',
    'FFffnFnnFnnnFFFnnnnnnn:::kvkkvFknFkFFFkFnnnn:::nnnnnnnnnnvvvvvFF',
    'FFnFFFFnnFfFnnnnnnnnnnvvv:vFFkknknkvnnnnvnnnn:::nnnnnnnnnnnnnnFF',
    'FFFFFFnfFFFFnnnnnnnnnnnvvv::kFvnFnvnnnnvvnnnn:::nnnnnnnnnnnnvvFF',
    'FFFFFFFnnnnnnnnnFFnnnnvvvFv::vnnnnvFFFFvvnnnnn:::nnnnnnnnnnnnnFF',
    'FFFFFFFnnnnnnnnnnnnnnnFnnnnnF:FnFFnFFFFvvnnnnnn:::nnnnnnnnvvvFFF',
    'FFFFFFFnnnnnnnnnnnnnnnnFFFFFFF:nnnnnFFFFvnnnnnn:::nnnnnnnnnnnFFF',
    'FTFFFFFTnnnTnnnnnnnnnFnnnnFnfFF:nFnnFFFnnnnnnnnn:::nnnnnnnnnnFFF',
    'TFFFFFnTnFnFFFFnnnnnnTFnnnnFnvnn:nvnnnnnnnnnnn:::::nnnnnnFnnnfFF',
    'FFFTFFnnnFFnFFnnFTFnTnFnnnnnnvvvv:vvnnnnnn:::::nF:::nnFnnnnFFFFF',
    'FFFFnnnnFnnnnnnnnnFnnnFFnnFnnvvvvn:v:::::::FnnnnnT:::TnnnnnnFFFT',
    'TFFnnnnnFT,vFn,FvFFFnTnnnnnn:::::::::nnn,nnnnFnnnnF:::nnnnn,nFFF',
    'FFTn,nnnnnnFnnTnvTnnFFT::::::,v,nv,vnnn,vvTvvvF,nnnn:::,nnnnnFFF',
    'FTFTnFn,FFF,,,nnvn,::::,nnnnn,nn,n,,nn,n,vvnnFvnnnnFT:::n,n,n,FF',
    'TFFFn,T,nTnvnnv,,::,,nnT,,FFnnnn,,,,n,nnvTF,,vnnn,Fnn:::n,n,n,,T',
    'FFTTnFF,v,,v,,vv:,,,nT,,TTFFFT,n,FnF,n,,FTT,,,v,,nnn,v::nvn,nnFT',
    'FFFFnFF,,v,,,,n:n,n,,,,,,FFTFF,TTvnTF,TTFF,,,,TT,nF,n,:::nn,,,FF',
    'FTFF,T,,TF,,,,:T,,,,,,,TTFFFFTFFTvFFT,,,,,F,,,FFT,T,,n:::,Fv,,FF',
    'FTFFvFvFFn,,::,,,,n,,,,TFFTFFTFT,vTTF,Tv,FFTF,F,,,,T,,n::,v,,TTF',
    'TFT,,,FFFF,,::,,,,,,TTFTFTFTFTTTT,FFF,FTTFFF,,,,,TTTTn,===,,,,TF',
    'T,,,T,TTFTT,::TF,,F,TTFFFTTT,,,,,,,TFFTTFTTTFFTTTTTTT,,:==,,,TTT',
    'TF,FTTFTTTT,:,TTTTTTFTTTTTTF,FTFTTTTTFTFTTFTTTTFFTTFFTF:==,FFFFT',
    'TTTTFTTTTTT,:,TFFTTTTTTTFTTTTTFTFTFTTFTTTTTTTTTTTTFTTTT:==,TTFFF',
  ],
  things: `
# landmarks and props
obj giant_tree 29 15
obj tunnel_mouth 8 14
obj wolf_den 26 4
obj cot 53 26
obj campfire 53 29 pot
# Hunter's camp laid out symmetrically round the fire (v0.85, owner): cot at the back, tripod and tanning frame either side, a stew pot hung over the fire, the two traps side by side; his woodpile against the treeline to the north (v0.86).
obj drying_rack 57 28
obj trap 55 31
obj trap 56 31
obj fallen_log 36 27
obj fallen_log 18 33
obj stump 43 37
obj stump 21 20
obj lantern 58 44
# Heart pass (v0.81, docs/research/map-design.md "Wolfwood heart pass"): three small stories, light that has a reason, life everywhere.
# Story 1, the hunter who didn't come back: his things on Greyfang's trail by the den; at his camp the fire is still kept,
# a stew pot still hangs over the fire (v0.87; the second bedroll and the camp kit were cut: they did not read).
# Story 2, the woodcutters gave up: a fir half sawn through with the saw left in it, their stack gone grey, a cart.
# Story 3, the blight kills: a deer's bones in the grey, toadstools, foxfire glowing on the rot.
obj hunter_remains 31 7
obj saw_log 45 13
obj log_stack 47 15
obj stump 49 14
obj stump 45 17
obj cart 48 17
obj deer_bones 24 17
obj toadstools 25 23
obj toadstools 36 14
obj foxfire 21 21
obj foxfire 39 27
obj foxfire 27 13
obj foxfire 33 24
obj foxfire 17 32
obj game_rack 51 27
obj chop_block 50 23
obj toadstools 10 26
# Life: crows on the dead giant's branches and one at the deer bones, an owl on the giant, moths at every light,
# rabbits at the crossroads end, fireflies on the road and in the glade, deer in the glade, a wolf watching from the treeline (eyes).
critter crow 28.9 11.0 1 high
critter crow 33.9 11.95 1 high
critter crow 25.7 17.9
critter owl 33.4 14.06
critter moth 53.5 29.4 3
critter moth 58.5 43.6 2
critter moth 9.5 15.6 2
critter rabbit 46.5 44.6
critter rabbit 28.5 45.5
critter rabbit 36.5 40.6
critter firefly 50.5 38.5 4
critter firefly 60 24.5 3
critter firefly 15.5 24.5 2
critter deer 58.5 22.8
critter deer 60.2 26.6
critter eyes 18.5 8.5
critter eyes 7.5 6.5
critter eyes 54.5 2.6
critter eyes 60.5 9.5
critter eyes 21.5 13.5
# ways in and out
exit south 56 47 to=crossroads at=north
exit graveyard 12 47 to=graveyard at=north
exit crypt_tunnel 9 16 to=crypt at=back_tunnel lit
exit north 40 0 to=chapel at=south
# Greyfang wanders a loop round the middle of the wood with two pack wolves; howls them back, never flees
named greyfang 11 28 7 pack=2 route=28,7;38,9;46,14;45,22;40,27;30,29;20,26;15,19;20,11
# the way in from the crossroads: easiest wolves
spawn blight_wolf 8 52 40
spawn blight_wolf 8 53 41
spawn thornback_boar 8 44 41
# by the graveyard path
spawn blight_wolf 8 18 40
spawn blight_wolf 8 19 41
spawn blight_wolf 8 17 41
# south-middle glade
spawn blight_wolf 8-9 30 38
spawn blight_wolf 8-9 31 39
spawn thornback_boar 9 24 33
# east of the road
spawn blight_wolf 8-9 59 38
spawn blight_wolf 8-9 60 39
# west woods
spawn blight_wolf 9 8 30
spawn blight_wolf 9 9 31
spawn blight_wolf 9 10 30
spawn thornback_boar 9 6 23
# west glade below the hillside
spawn blight_wolf 9-10 14 22
spawn blight_wolf 9-10 15 23
# round the blight
spawn thornback_boar 10 37 20
spawn thornback_boar 10 22 15
# north-east glade
spawn blight_wolf 10 49 12
spawn blight_wolf 10 50 13
spawn blight_wolf 10 51 12
spawn thornback_boar 10 56 18
# north-west, by the den
spawn blight_wolf 10-11 12 5
spawn blight_wolf 10-11 13 6
spawn blight_wolf 10-11 11 6
spawn thornback_boar 11 34 8
# by the chapel road: the hardest pack
spawn blight_wolf 11 44 4
spawn blight_wolf 11 45 5
rare old_scar 59 24
# secret: the giant tree's hollow
chest 31 19
fog 20 10 22 14
fog 2 2 20 10
fog 36 2 16 8
fog 4 26 12 8
fog 46 10 12 8
label 31 13 Dead giant tree
label 53 24 Hunter's camp
label 28 3 Greyfang's den
label 9 9 Crypt tunnel
label 59 21 Old Scar's glade
label 60 30 Deer trail
label 40 2 To the chapel
`
};

// Shared basics: the screen canvas, tile size and current zone size. Loaded first.
'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),cx=cv.getContext('2d');
const low=document.createElement('canvas'),lx=low.getContext('2d');
const T=16;let MW=40,MH=30,WW=MW*T,WH=MH*T,zoneId='over';

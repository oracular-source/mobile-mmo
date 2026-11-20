// Shared basics: the screen canvas, tile size and current zone size. Loaded first.
'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),cx=cv.getContext('2d');
// The world draws straight onto the screen canvas, scaled up by whole steps (v0.45). It used to draw on a small
// low-res canvas that was then blown up, which made the camera move in whole game pixels: diagonal walking stair-stepped.
const lx=cx;
const T=16;let MW=40,MH=30,WW=MW*T,WH=MH*T,zoneId='over';

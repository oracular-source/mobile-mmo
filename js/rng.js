// Random numbers. rnd() is seeded so the map and spawn spots are the same every visit.
// rng() is for every gameplay roll (loot, misses, interrupts). It lives in one place so the
// testing grounds can make it seeded later and replay fights exactly.
'use strict';
/* ---------- Seeded random (same map every visit) ---------- */
let seed=20261117;
function rnd(){seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
const rr=(a,b)=>a+rng()*(b-a);

function rng(){return Math.random()} // swap for a seeded generator in the testing grounds
const pick=a=>a[Math.floor(rng()*a.length)];

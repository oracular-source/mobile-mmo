// Random numbers. rnd() is seeded so the map and spawn spots are the same every visit.
// rng() is for every gameplay roll (loot, misses, interrupts). It lives in one place so the
// testing grounds can seed it (seedRng) and replay fights exactly.
'use strict';
/* ---------- Seeded random (same map every visit) ---------- */
let seed=20261117;
function rnd(){seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
const rr=(a,b)=>a+rng()*(b-a);

// Normal play uses Math.random. The testing grounds call seedRng(n) so the same seed gives the same fight,
// and seedRng(null) to go back to normal randomness.
let rngSeed=null;
function seedRng(n){rngSeed=n==null?null:(n|0)}
function rng(){
  if(rngSeed===null)return Math.random();
  rngSeed=rngSeed+0x6D2B79F5|0;let t=Math.imul(rngSeed^rngSeed>>>15,1|rngSeed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;
}
const pick=a=>a[Math.floor(rng()*a.length)];

// Saved data on the phone: one safe wrapper around browser storage, a save version number, and upgrade steps for old saves.
'use strict';
/* ---------- Safe storage ----------
   Phones can block storage (private browsing), run out of room, or hold a half-written value.
   None of that may crash the game: every read falls back to a default, and every write also
   goes to an in-memory copy so progress still works for this session if the phone refuses it. */
const memStore={};
const store={
  raw(k){if(k in memStore)return memStore[k];try{return localStorage.getItem(k)}catch(e){return null}},
  get(k,d){try{const v=JSON.parse(this.raw(k)||'null');return v==null?d:v}catch(e){return d}},
  set(k,v){let s;try{s=JSON.stringify(v)}catch(e){return}memStore[k]=s;try{localStorage.setItem(k,s)}catch(e){}},
  del(k){delete memStore[k];try{localStorage.removeItem(k)}catch(e){}},
  // Every saved key for this game (names start with "ashfen-").
  keys(){let ks=Object.keys(memStore);try{ks=ks.concat(Object.keys(localStorage))}catch(e){}return ks.filter((k,i)=>k.indexOf('ashfen-')===0&&ks.indexOf(k)===i)}
};

/* ---------- Save version and upgrades ----------
   The whole save carries one number. When a future release changes how something is saved,
   bump SAVE_VERSION and add a step below that turns the old shape into the new one, so
   players keep their characters instead of losing them. Steps run in order, oldest first. */
const SAVE_VERSION=1;
const SAVE_STEPS={
  // 0 → 1 (v0.14.1): saves from before version numbers. Shapes are unchanged; just clear out
  // any value that can't be read (half-written or corrupted) so it can't cause trouble later.
  1(){store.keys().forEach(k=>{if(k==='ashfen-backup')return;const r=store.raw(k);if(r==null)return;try{JSON.parse(r)}catch(e){store.del(k)}})}
};
(function upgradeSave(){
  const keys=store.keys();
  // No saves at all yet: a fresh player starts on the current version.
  if(!keys.length){store.set('ashfen-save-version',SAVE_VERSION);return}
  let v=store.get('ashfen-save-version',0)|0;
  // A newer save than this game understands (e.g. an old copy of the game cached on the home screen):
  // read what we can, but never rewrite it with an older version.
  if(v>=SAVE_VERSION)return;
  // Keep one copy of the save from just before upgrading, in case a step goes wrong.
  const copy={};keys.forEach(k=>{if(k!=='ashfen-backup')copy[k]=store.raw(k)});
  store.set('ashfen-backup',{from:v,at:new Date().toISOString(),data:copy});
  while(v<SAVE_VERSION){v++;try{SAVE_STEPS[v]()}catch(e){/* a failed step never stops the game */}store.set('ashfen-save-version',v)}
})();

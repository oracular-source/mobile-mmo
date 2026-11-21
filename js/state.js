// Your character: which class you picked, bags and gear, stats, saves, settings and loadout.
'use strict';
const CLS=(function(){const c=store.get('ashfen-class','druid');return CLASSES[c]?c:'druid'})();
const C=CLASSES[CLS];
const KEY=k=>CLS==='druid'?'ashfen-'+k:'ashfen-'+k+'-'+CLS; // Druid keeps the original save names
const AB=C.abilities;
const ABI={};AB.forEach(a=>ABI[a.id]=a);
// Each spell's own cooldown shrinks as you level past the level you learned it, down to a floor.
const at=(arr,a)=>arr[0]+arr[1]*Math.max(0,player.lvl-(a?a.lvl:0)); // value that grows each level
const cdFor=a=>a.cd?Math.max(a.cd[1],a.cd[0]-a.cd[2]*Math.max(0,player.lvl-a.lvl)):0;
const SLOTS=[['head','Head'],['chest','Chest'],['legs','Legs'],['feet','Feet'],['hands','Hands'],['weapon','Weapon'],['offhand','Off-hand'],['ring','Ring']];
const forMe=id=>{const c=ITEMS[id].cls;return !c||c===CLS||(c==='caster'&&C.caster)||!!(C.gear&&C.gear.indexOf(c)>=0)}; // personal loot: only gear your class can use drops for you
const pool=rar=>Object.keys(ITEMS).filter(id=>ITEMS[id].rar===rar&&ITEMS[id].slot&&forMe(id)&&id!=='gnawring');
const COMMONS=pool('common'),UNCOMMONS=pool('uncommon'),RARES=pool('rare'),BOSS1=pool('named').filter(id=>id.indexOf('b1')===0);
const JUNK={rat:'whisker',beetle:'shell',dead:'bone',gnaw:'whisker',crat:'whisker',trat:'whisker',brat:'whisker',cskel:'bone',boss1:'bone',ironshell:'shell',palerat:'whisker',bride:'bone',wolf:'pelt',greyfang:'pelt',oldscar:'pelt',boar:'tusk',zealot:'cultrag',ashcaller:'cultrag',chanter:'cultrag',acolyte:'cultrag',wisp:'ember'};
const BAG_SIZE=16, STAT_KEYS=[['ac','AC'],['sta','STA'],['str','STR'],['wis','WIS'],['int','INT']];
const inv=(function(){
  const d={bags:new Array(BAG_SIZE).fill(null),equip:{},copper:0};
  try{const v=store.get(KEY('inv'),null);
    if(v&&v.v===1){v.bags.forEach((b,i)=>{if(i<BAG_SIZE&&b&&ITEMS[b.id])d.bags[i]=b});Object.keys(v.equip||{}).forEach(k=>{if(ITEMS[v.equip[k]])d.equip[k]=v.equip[k]});d.copper=v.copper|0}}catch(e){}
  return d;
})();
const saveInv=()=>store.set(KEY('inv'),{v:1,bags:inv.bags,equip:inv.equip,copper:inv.copper});
const stat=k=>Object.values(inv.equip).reduce((t,id)=>t+(ITEMS[id][k]||0),0);
const spellMult=()=>1+stat('int')*0.02;            // INT: +2% spell damage and healing per point
const itemStats=it=>STAT_KEYS.filter(s=>it[s[0]]).map(s=>(s[0]==='ac'?'AC ':s[1]+' +')+it[s[0]]).join(' · ');
// STA: +3 HP per point. WIS: +3 mana per point.
// Spirit Ward (Shaman buff): +10% max health.
const maxHP=L=>Math.round((C.hp[0]+C.hp[1]*L+stat('sta')*3)*(player.buffs&&player.buffs.ward>0?1.1:1)), maxMP=L=>C.mana?C.mana[0]+C.mana[1]*L+stat('wis')*3:0;
const meleeMult=()=>1+stat('str')*0.02; // STR: +2% melee damage and bandage healing per point
const GCD=1.5, PSPEED=34;
// Rogue: Hide lets you sneak at 70% speed; Sprint is +50%.
// Chill (Wizard's Frost Bolt) only slows mobs; nothing slows you yet.
// Shaman's Spirit of the Wolf +30%; the Bard's Song of Travel +60% (they don't add up: the faster one counts).
const pSpeed=()=>PSPEED*(player.buffs.hide>0?0.7:1)*(player.buffs.sprint>0?1.5:1)*Math.max(player.buffs.wolf>0&&!inCombat()?1.3:1,songKind('speed')?1.6:1); // Spirit of the Wolf is a travel spell: no speed while anything is fighting (owner, v0.24)

/* ---------- Saved progress, settings and loadout ---------- */
// Storage itself (store.get / store.set, save version, upgrades) lives in js/save.js.
const settings=Object.assign({scheme:'grid',left:false,gridSize:'M',padSize:'M',flick:'normal',tapCast:true,autoCast:true,move:'joy',showJoy:false,zoom:999,minimap:true,pins:'S'},store.get('ashfen-settings',{}));
// v0.28: everyone moves to the EverQuest-style grid once (owner pick); Settings can switch back.
if(!settings.grid28){settings.grid28=true;settings.scheme='grid';store.set('ashfen-settings',settings)}
// v0.29.1: Classic buttons are gone; anyone still on them moves to the grid.
if(settings.scheme!=='grid'&&settings.scheme!=='pad'){settings.scheme='grid';store.set('ashfen-settings',settings)}
// v0.35.1: movement split into three separate modes (owner). The old 'Tap + drag' mixed tap-to-walk
// with the joystick; it becomes Joystick only, so stray taps no longer walk.
if(settings.move==='drag'){settings.move='joy';store.set('ashfen-settings',settings)}
// 8 ability slots: on the grid all 8 sit together; on the spell pad 0-5 are the pad and 6-7 the small side bar.
// A slot can be empty (null) when a class has fewer than 8 abilities. Slot 0 (main attack) is never empty.
const NSLOTS=8;
function fillLoadout(base){
  const out=base.slice(0,NSLOTS).map(id=>ABI[id]?id:null);
  // Put any abilities that aren't loaded yet into the empty slots (e.g. the Warrior's Throw Stone).
  AB.forEach(a=>{if(out.indexOf(a.id)<0){const e=out.indexOf(null);if(e>=0)out[e]=a.id;else if(out.length<NSLOTS)out.push(a.id)}});
  while(out.length<NSLOTS)out.push(null);
  return out;
}
let loadout=store.get(KEY('loadout'),null);
// Older saves have 6 slots: keep the player's arrangement and add the two new slots.
if(!Array.isArray(loadout)||!ABI[loadout[0]])loadout=C.loadout.slice();
loadout=fillLoadout(loadout);
// Developer tools: open the game once with ?dev in the address to turn them on (?dev=0 turns them off).
const dev={on:(function(){const m=/[?&]dev(=(\d))?/.exec(location.search);if(m)store.set('ashfen-dev',m[2]!=='0');return !!store.get('ashfen-dev',false)})(),god:false,skin:false,old:false}; // skin / old: DEV previews of the default skin and the pre-rags sprites (not saved)
const kills=store.get('ashfen-kills',{});
const saveSettings=()=>store.set('ashfen-settings',settings), saveLoadout=()=>store.set(KEY('loadout'),loadout);

const player={buffs:{},bval:{},songs:[],songNext:0,cds:{},x:3.5*T,y:15*T+8,tx:null,ty:null,dir:1,lvl:1,xp:0,hp:52,mp:50,sit:false,cast:null,gcd:0,bark:0,target:null,dead:0,walk:0};
const PROGKEY=CLS==='druid'?'ashfen-druid':'ashfen-prog-'+CLS;
const prog=store.get(PROGKEY,null);if(prog&&prog.v===2&&prog.lvl){player.lvl=Math.min(TEST_MAX,prog.lvl|0);player.xp=prog.xp|0;}
// Test shortcut: open the game with ?level=7 in the address to jump to that level (1-15; XP still stops at the cap). Prototype only.
(function(){const m=/[?&]level=(\d+)/.exec(location.search);if(m){player.lvl=Math.max(1,Math.min(TEST_MAX,+m[1]));player.xp=0;store.set(PROGKEY,{v:2,lvl:player.lvl,xp:0});}})();
player.hp=maxHP(player.lvl);player.mp=maxMP(player.lvl);
const save=()=>store.set(PROGKEY,{v:2,lvl:player.lvl,xp:player.xp});

/* ---------- Skill tree forks (v0.38) ---------- */
// Your pick for each fork level ({10:'a'}), saved per character. Picking happens on the Skills tab: free when the fork
// is new, and swapping later only works by a campfire (owner, Nov 19; until Town 1 exists).
const MYFORKS=FORKS[CLS]||[];
const BASE_AB={};AB.forEach(a=>BASE_AB[a.id]=Object.assign({},a)); // each ability as it is before any fork
let forkPick=store.get(KEY('forks'),{});
const saveForks=()=>store.set(KEY('forks'),forkPick);
// Puts every ability back to its base numbers, then lays the picked side of each fork you've reached on top.
// Changes the ability objects in place, so ABI, AB and the loadout keep pointing at them.
function applyForks(){
  AB.forEach(a=>{const base=BASE_AB[a.id];Object.keys(a).forEach(k=>delete a[k]);Object.assign(a,base)}); // read the id before clearing
  MYFORKS.forEach(f=>{if(player.lvl<f.lvl)return;const o=f.opts.find(o=>o.id===forkPick[f.lvl]);if(o){Object.assign(ABI[f.ab],o.set);ABI[f.ab].fork=o.name}});
}
// The first fork you've reached but not picked yet (shown as "pick your new toy").
const forkDue=()=>MYFORKS.find(f=>player.lvl>=f.lvl&&!forkPick[f.lvl])||null;
applyForks();

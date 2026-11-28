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
// Personal loot: only gear your class can use drops for you. Weapons go by weapon type (WPN_OF: a Paladin finds maces), armour by gear group.
const forMe=id=>{const it=ITEMS[id];if(it.slot==='weapon')return it.wt===WPN_OF[CLS];const c=it.cls;return !c||c===CLS||(c==='caster'&&C.caster)||!!(C.gear&&C.gear.indexOf(c)>=0)};
// Random pools leave out the items that belong to one mob (a named's ring, a rare mob's own item): those only come from that mob.
const pool=rar=>Object.keys(ITEMS).filter(id=>ITEMS[id].rar===rar&&ITEMS[id].slot&&forMe(id)&&id!=='gnawring'&&!ITEMS[id].src&&id!=='fangruff');
// No duplicates of a mob's own items (owner, Nov 27): a pink or a rare mob's own blue you already have (worn or in your bags) won't drop again.
const owned=id=>Object.keys(inv.equip).some(sl=>inv.equip[sl]===id)||inv.bags.some(b=>b&&b.id===id);
const COMMONS=pool('common'),UNCOMMONS=pool('uncommon'),RARES=pool('rare'),BOSS1=pool('named').filter(id=>id.indexOf('b1')===0),MALREC=pool('named').filter(id=>id.indexOf('mal')===0);
const JUNK={rat:'whisker',beetle:'shell',dead:'bone',gnaw:'whisker',crat:'whisker',trat:'whisker',brat:'whisker',cskel:'bone',boss1:'bone',ironshell:'shell',palerat:'whisker',bride:'bone',wolf:'pelt',greyfang:'pelt',oldscar:'pelt',boar:'tusk',zealot:'cultrag',ashcaller:'cultrag',chanter:'cultrag',acolyte:'cultrag',wisp:'ember',mender:'dcultjunk',deacon:'dcultjunk',malrec:'dcultjunk',prior:'bone',bellringer:'cultrag',gwisp:'ember',summoner:'cultrag'};
const BAG_SIZE=16, STAT_KEYS=[['ac','AC'],['sta','STA'],['str','STR'],['wis','WIS'],['int','INT']];
const inv=(function(){
  const d={bags:new Array(BAG_SIZE).fill(null),equip:{},copper:0};
  try{const v=store.get(KEY('inv'),null);
    if(v&&v.v===1){v.bags.forEach((b,i)=>{if(i<BAG_SIZE&&b&&ITEMS[b.id])d.bags[i]=b});Object.keys(v.equip||{}).forEach(k=>{if(ITEMS[v.equip[k]])d.equip[k]=v.equip[k]});d.copper=v.copper|0}}catch(e){}
  return d;
})();
// Gear wear (v0.97): inv.wear[slot] = how worn the item in that slot is, 0 (fine) to 100 (broken: no stats). A bag item carries its
// own wear as b.w, so taking something off and putting it back on can't reset it. Older saves have none: everything starts fine.
inv.wear=(function(){try{const v=store.get(KEY('inv'),null);return v&&v.wear?v.wear:{}}catch(e){return {}}})();
// Enchants (v0.100): inv.ench[slot] = the worn item's step (0 to 5); a bag item carries its own as b.e, the same way wear travels.
inv.ench=(function(){try{const v=store.get(KEY('inv'),null);return v&&v.ench?v.ench:{}}catch(e){return {}}})();
const saveInv=()=>store.set(KEY('inv'),{v:1,bags:inv.bags,equip:inv.equip,copper:inv.copper,wear:inv.wear,ench:inv.ench});
const broken=sl=>(inv.wear[sl]||0)>=100;
const enchMul=e=>1+(e||0)*LOOT.enchStep;           // each step adds a small share of the item's own stats
const stat=k=>Object.keys(inv.equip).reduce((t,sl)=>t+(broken(sl)?0:(ITEMS[inv.equip[sl]][k]||0)*enchMul(inv.ench[sl])),0);
const r1=x=>Math.round(x*10)/10;                     // stats can be fractional with enchants: show one decimal at most
const enchName=(it,e)=>(e?'+'+e+' ':'')+it.name;
const enchCls=e=>e>=5?' ench5':e>=3?' ench3':'';     // the glow: faint at +3, strong at +5 (css)
// Repair price: the share of an item's value that's worn off, for every worn item. At least 1 copper if anything is worn.
const repairCost=()=>{let c=0,any=false;Object.keys(inv.equip).forEach(sl=>{const w=inv.wear[sl]||0;if(w>0){any=true;c+=ITEMS[inv.equip[sl]].value*w/100}});return any?Math.max(1,Math.ceil(c)):0};
// Loot memory (v0.97): which named you've killed at least once (first kill pays blue or better) and how many kills of each
// have gone by without its pink (bad-luck protection). Saved per character.
const lootMem=(function(){const d={first:{},dry:{}};try{const v=store.get(KEY('loot'),null);if(v){d.first=v.first||{};d.dry=v.dry||{}}}catch(e){}return d})();
const saveLoot=()=>store.set(KEY('loot'),lootMem);
const spellMult=()=>1+stat('int')*0.02;            // INT: +2% spell damage and healing per point
const itemStats=(it,e)=>STAT_KEYS.filter(s=>it[s[0]]).map(s=>(s[0]==='ac'?'AC ':s[1]+' +')+r1(it[s[0]]*enchMul(e))).join(' · ');
// STA: +3 HP per point. WIS: +3 mana per point.
// Spirit Ward (Shaman buff): +10% max health.
const maxHP=L=>Math.round((C.hp[0]+C.hp[1]*L+stat('sta')*3)*(player.buffs&&player.buffs.ward>0?1.1:1)), maxMP=L=>C.mana?Math.round(C.mana[0]+C.mana[1]*L+stat('wis')*3):0; // rounded: enchants make stats fractional
const meleeMult=()=>1+stat('str')*0.02; // STR: +2% melee damage and bandage healing per point
const GCD=1.5, PSPEED=34;
// Rogue: Hide lets you sneak at 70% speed; Sprint is +50%.
// Chill (Wizard's Frost Bolt) only slows mobs; nothing slows you yet.
// Shaman's Spirit of the Wolf +30%; the Bard's Song of Travel +60% (they don't add up: the faster one counts).
const pSpeed=()=>PSPEED*(player.mireT>0?MIRE_SLOW:1)*(player.tollT>0?player.tollX:1)*(player.buffs.hide>0?0.7:1)*(player.buffs.sprint>0?1.5:1)*Math.max(player.buffs.wolf>0&&!inCombat()?1.3:1,songKind('speed')?(inCombat()?1.35:1.6):1); // Spirit of the Wolf is a travel spell: no speed while anything is fighting (owner, v0.24). Song of Travel: 1.6x out of fights, 1.35x while anything fights you (owner, v0.76: still kites, not risk-free; below about 1.33x the Bard can't get out of a boss bolt's range in time and can't solo the King at all)

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

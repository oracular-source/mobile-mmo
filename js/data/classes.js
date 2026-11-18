// DATA ONLY. Classes and their abilities. Tune class numbers here.
'use strict';
/* ---------- Game data (tune numbers here) ---------- */
// Classes. Every ability has a "kind" that says what it does; numbers are [base, per level].
// cast: seconds standing still (0 = instant, usable while moving). cd: [start, floor, seconds shaved per level].
// dur: [seconds, extra seconds per level after learning it]. Spells grow a little stronger every level.
const CLASSES={
  druid:{name:'Druid',sprite:'druid',hp:[40,12],mana:[40,10],ac:0,regen:1,desc:'Nature caster. Kites with snares, roots and rot.',
    loadout:['thorn','mend','snare','rot','root','bark'],abilities:[
    {id:'thorn',name:'Thornlash',short:'Thorn',lvl:1,mana:5,cast:0,cd:null,range:80,col:'#7dbb4a',tgt:1,tag:'Nuke',kind:'nuke',dmg:[8,3],beam:'#9be37a'},
    {id:'mend',name:'Mending Touch',short:'Mend',lvl:1,mana:9,cd:[8,4,0.5],cast:1.2,col:'#7dffa6',tgt:0,tag:'Heal',kind:'heal',heal:[15,6]},
    {id:'snare',name:'Tanglefoot',short:'Tangle',lvl:3,mana:6,cd:[18,10,1],cast:0,range:80,col:'#5f9ea0',tgt:1,tag:'Snare',kind:'snare',dur:[24,1]},
    {id:'rot',name:'Creeping Rot',short:'Rot',lvl:2,mana:8,cd:[12,6,0.75],cast:0,range:80,col:'#6aa84f',tgt:1,tag:'DoT',kind:'dot',dmg:[3,1.6],dur:[18,0.5]},
    {id:'root',name:'Rootgrip',short:'Root',lvl:6,mana:7,cd:[24,12,1.5],cast:0.6,range:80,col:'#9b7b3a',tgt:1,tag:'Root',kind:'root',dur:[12,0.5]},
    {id:'bark',name:'Barkskin',short:'Bark',lvl:8,mana:10,cd:[30,15,1.5],cast:0,col:'#a07850',tgt:0,tag:'Armor',kind:'buff',buff:'bark',dur:[120,0]}]},
  warrior:{name:'Warrior',sprite:'warrior',hp:[60,16],mana:null,ac:12,regen:1.5,desc:'Armored tank. No mana; skills on cooldowns. Stands and takes the hits.',
    loadout:['strike','bandage','bash','ham','stance','cleave'],abilities:[
    {id:'strike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,3],melee:1},
    {id:'bandage',name:'Bandage',short:'Bandage',lvl:1,mana:0,cast:2,cd:[20,12,1],col:'#e8e2cf',tgt:0,tag:'Heal',kind:'heal',heal:[12,5],melee:1},
    {id:'throw',name:'Throw Stone',short:'Throw',lvl:1,mana:0,cast:0,cd:[6,4,0.25],range:80,col:'#8d8692',tgt:1,tag:'Pull',kind:'nuke',dmg:[3,1],melee:1,beam:'#cfc8b2'},
    {id:'bash',name:'Shield Bash',short:'Bash',lvl:2,mana:0,cast:0,cd:[12,8,0.5],range:18,col:'#6a82b0',tgt:1,tag:'Stun',kind:'stun',dmg:[4,1],dur:[2,0.1],melee:1},
    {id:'ham',name:'Hamstring',short:'Hamstr',lvl:3,mana:0,cast:0,cd:[18,10,1],range:18,col:'#a3252f',tgt:1,tag:'Snare',kind:'snare',dur:[16,1],melee:1},
    {id:'stance',name:'Defensive Stance',short:'Stance',lvl:6,mana:0,cast:0,cd:[45,30,1.5],col:'#c9a227',tgt:0,tag:'Defense',kind:'buff',buff:'stance',dur:[10,0.5]},
    {id:'cleave',name:'Cleave',short:'Cleave',lvl:8,mana:0,cast:0,cd:[10,6,0.5],col:'#ffb37a',tgt:0,tag:'Area',kind:'cleave',dmg:[6,2.5],radius:24,melee:1}]},
  rogue:{name:'Rogue',sprite:'rogue',hp:[48,14],mana:null,ac:8,regen:1.2,desc:'Sneaky melee damage. Open from Hide with a huge Backstab, hit hard from behind, Evade to drop aggro. Fragile and weak solo: best with a tank.',
    loadout:['stab','backstab','hide','gouge','evade','rend','knife','sprint'],abilities:[
    {id:'stab',name:'Stab',short:'Stab',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#d8dde6',tgt:1,tag:'Melee',kind:'nuke',dmg:[10,4],melee:1},
    {id:'backstab',name:'Backstab',short:'Backst',lvl:1,mana:0,cast:0,cd:[10,6,0.4],range:18,col:'#e05a5a',tgt:1,tag:'Backstab',kind:'backstab',dmg:[20,7],melee:1},
    {id:'hide',name:'Hide',short:'Hide',lvl:1,mana:0,cast:0,cd:[6,3,0.3],col:'#6b6f80',tgt:0,tag:'Stealth',kind:'stealth',melee:1},
    {id:'knife',name:'Throwing Knife',short:'Knife',lvl:1,mana:0,cast:0,cd:[6,4,0.25],range:80,col:'#9aa3b0',tgt:1,tag:'Pull',kind:'nuke',dmg:[3,1.2],melee:1,beam:'#d8dde6'},
    {id:'gouge',name:'Gouge',short:'Gouge',lvl:2,mana:0,cast:0,cd:[12,8,0.5],range:18,col:'#c9a227',tgt:1,tag:'Stun',kind:'stun',dmg:[3,1],dur:[2.5,0.1],melee:1},
    {id:'rend',name:'Rend',short:'Rend',lvl:3,mana:0,cast:0,cd:[12,6,0.6],range:18,col:'#a3252f',tgt:1,tag:'Bleed',kind:'dot',dmg:[4,2],dur:[15,0.5],melee:1},
    {id:'evade',name:'Evade',short:'Evade',lvl:5,mana:0,cast:0,cd:[30,18,1.2],col:'#8d8692',tgt:0,tag:'Drop aggro',kind:'evade',dur:[3,0.15],melee:1},
    {id:'sprint',name:'Sprint',short:'Sprint',lvl:7,mana:0,cast:0,cd:[40,25,1.5],col:'#7dbbd0',tgt:0,tag:'Speed',kind:'buff',buff:'sprint',dur:[8,0.3],melee:1}]},
  necro:{name:'Necromancer',sprite:'necro',hp:[36,11],mana:[44,11],ac:0,regen:1,caster:1,desc:'Dark caster with an undead pet that tanks for you. Lifetaps, plague, fear and feign death.',
    loadout:['tap','raise','plague','dread','feign','mendb'],abilities:[
    {id:'tap',name:'Lifetap',short:'Tap',lvl:1,mana:6,cast:0,cd:null,range:80,col:'#b48cff',tgt:1,tag:'Lifetap',kind:'lifetap',dmg:[6,2.4],beam:'#b48cff'},
    {id:'raise',name:'Raise Bones',short:'Raise',lvl:1,mana:15,cast:3,cd:[30,15,1.5],col:'#cfc8b2',tgt:0,tag:'Pet',kind:'pet'},
    {id:'plague',name:'Siphon Plague',short:'Plague',lvl:2,mana:9,cast:0,cd:[10,5,0.5],range:80,col:'#7a9a3a',tgt:1,tag:'DoT',kind:'dot',dmg:[4,2],dur:[18,0.5]},
    {id:'dread',name:'Dread',short:'Dread',lvl:3,mana:8,cast:0,cd:[20,12,0.8],range:80,col:'#6a4fa3',tgt:1,tag:'Fear',kind:'fear',dur:[6,0.3]},
    {id:'feign',name:'Feign Death',short:'Feign',lvl:6,mana:5,cast:0,cd:[60,35,2.5],col:'#9a9a9a',tgt:0,tag:'Escape',kind:'feign'},
    {id:'mendb',name:'Mend Bones',short:'MendB',lvl:8,mana:10,cast:1,cd:[10,6,0.4],col:'#e8e2cf',tgt:0,tag:'Pet heal',kind:'petheal',heal:[20,8]}]},
  // ---- Batch 1 (v0.17). New ability fields: undead (x damage vs undead), undeadOnly, holy (share of a heal that burns
  // nearby undead), hpCost (share of your max health), chill, shatter, aslow (slows attacks too), full (full heal),
  // pet:{...} (which pet a summon makes), and area kinds that can stun, root or heal per mob hit.
  cleric:{name:'Cleric',hp:[44,13],mana:[44,11],ac:6,regen:1,gear:['cleric'],desc:'Healer with a hammer. Slow kills, almost never dies. Every heal also burns nearby undead. Solo: slow but safe.',
    loadout:['smite','mheal','renew','hlight','daze','turn','gheal','aura'],abilities:[
    {id:'smite',name:'Smite',short:'Smite',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#e8e2cf',tgt:1,tag:'Melee',kind:'nuke',dmg:[6,2.6],melee:1},
    {id:'mheal',name:'Minor Heal',short:'Heal',lvl:1,mana:8,cast:1.5,cd:[6,3,0.4],col:'#ffe9a8',tgt:0,tag:'Heal',kind:'heal',heal:[14,6],holy:0.6},
    {id:'renew',name:'Renew',short:'Renew',lvl:2,mana:10,cast:0,cd:[14,8,0.5],col:'#fff3c4',tgt:0,tag:'Heal over time',kind:'hot',heal:[3,1.4],dur:[12,0],holy:0.6},
    {id:'hlight',name:'Holy Light',short:'Light',lvl:3,mana:6,cast:0,cd:[6,4,0.25],range:80,col:'#ffe9a8',tgt:1,tag:'Nuke',kind:'nuke',dmg:[6,2.4],undead:2,beam:'#ffe9a8'},
    {id:'daze',name:'Daze',short:'Daze',lvl:4,mana:0,cast:0,cd:[14,9,0.5],range:18,col:'#c9a227',tgt:1,tag:'Stun',kind:'stun',dmg:[3,1],dur:[1.8,0.1],melee:1},
    {id:'turn',name:'Turn Undead',short:'Turn',lvl:5,mana:8,cast:0,cd:[20,12,0.8],range:80,col:'#fff3c4',tgt:1,tag:'Fear undead',kind:'fear',dur:[6,0.3],undeadOnly:1},
    {id:'gheal',name:'Greater Heal',short:'GHeal',lvl:6,mana:22,cast:2.5,cd:[12,8,0.5],col:'#fff3c4',tgt:0,tag:'Big heal',kind:'heal',heal:[40,12],holy:0.6},
    {id:'aura',name:'Divine Aura',short:'Aura',lvl:8,mana:10,cast:0,cd:[120,90,3],col:'#ffd27a',tgt:0,tag:'Immune',kind:'buff',buff:'aura',dur:[4,0]}]},
  enchanter:{name:'Enchanter',hp:[34,10],mana:[48,12],ac:0,regen:1,caster:1,desc:'Crowd control. Puts extra mobs to sleep, slows the one you fight, and lets a floating sword or a charmed mob do the hitting. Solo: fine if you keep control.',
    loadout:['mrot','mez','blade','slow','clarity','charm','flash','phantasm'],abilities:[
    {id:'mrot',name:'Mind Rot',short:'Rot',lvl:1,mana:6,cast:0,cd:[8,5,0.4],range:80,col:'#c8a0ff',tgt:1,tag:'DoT',kind:'dot',dmg:[4,2],dur:[12,0.5]},
    {id:'mez',name:'Mesmerize',short:'Mez',lvl:1,mana:8,cast:0,cd:[6,4,0.2],range:80,col:'#e0c3ff',tgt:1,tag:'Sleep',kind:'mez',dur:[18,0.3]},
    {id:'blade',name:'Animate Blade',short:'Blade',lvl:2,mana:14,cast:2,cd:[20,10,1],col:'#cfd6e0',tgt:0,tag:'Pet',kind:'pet',pet:{name:'floating sword',img:'blade',hp:[16,6],dmg:[3,1.5],ac:2,life:120,atk:1.5}},
    {id:'slow',name:'Slow Mind',short:'Slow',lvl:3,mana:7,cast:0,cd:[14,8,0.5],range:80,col:'#9fb8e0',tgt:1,tag:'Slow',kind:'snare',dur:[20,1],aslow:1},
    {id:'clarity',name:'Clarity',short:'Clarity',lvl:4,mana:10,cast:1,cd:[10,10,0],col:'#7dbbff',tgt:0,tag:'Mana regen',kind:'buff',buff:'clarity',dur:[99999,0]},
    {id:'charm',name:'Charm',short:'Charm',lvl:5,mana:15,cast:1,cd:[40,25,1.5],range:60,col:'#ff9de2',tgt:1,tag:'Charm',kind:'charm',dur:[24,1.5]},
    {id:'flash',name:'Color Flash',short:'Flash',lvl:6,mana:12,cast:0,cd:[30,20,1],col:'#ffffff',tgt:0,tag:'Area stun',kind:'cleave',radius:30,stun:[3,0.1]},
    {id:'phantasm',name:'Phantasm',short:'Phantm',lvl:8,mana:12,cast:0,cd:[45,30,1.5],col:'#c8a0ff',tgt:0,tag:'Decoy',kind:'decoy',dur:[5,0.2]}]},
  paladin:{name:'Paladin',hp:[54,15],mana:[24,6],ac:10,regen:1.3,gear:['warrior','knight'],desc:'Holy tank. Heals, stuns, and lays holy ground that heals you and burns the undead. Very strong in the crypt. Solo: steady.',
    loadout:['pstrike','loh','hbash','pmend','smiteu','taunt','consec','dstrike'],abilities:[
    {id:'pstrike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'loh',name:'Lay on Hands',short:'LoH',lvl:1,mana:0,cast:0,cd:[180,120,4],col:'#ffd27a',tgt:0,tag:'Full heal',kind:'heal',heal:[0,0],full:1},
    {id:'hbash',name:'Holy Bash',short:'Bash',lvl:2,mana:0,cast:0,cd:[12,8,0.5],range:18,col:'#6a82b0',tgt:1,tag:'Stun',kind:'stun',dmg:[4,1],dur:[2,0.1],melee:1},
    {id:'pmend',name:'Mend',short:'Mend',lvl:3,mana:8,cast:2,cd:[8,5,0.4],col:'#ffe9a8',tgt:0,tag:'Heal',kind:'heal',heal:[12,5]},
    {id:'smiteu',name:'Smite Undead',short:'SmiteU',lvl:4,mana:10,cast:0,cd:[12,8,0.5],range:80,col:'#ffe9a8',tgt:1,tag:'Undead nuke',kind:'nuke',dmg:[16,6],undeadOnly:1,beam:'#ffe9a8'},
    {id:'taunt',name:'Taunt',short:'Taunt',lvl:5,mana:0,cast:0,cd:[8,6,0.2],range:40,col:'#ffb37a',tgt:1,tag:'Taunt',kind:'taunt'},
    {id:'consec',name:'Consecrate',short:'Consec',lvl:6,mana:14,cast:0,cd:[30,20,1],col:'#ffd27a',tgt:0,tag:'Holy ground',kind:'ground',radius:26,dur:[15,0],heal:[2,0.8],dmg:[3,1.2]},
    {id:'dstrike',name:'Divine Strike',short:'Divine',lvl:8,mana:6,cast:0,cd:[10,6,0.5],col:'#ffe9a8',tgt:0,tag:'Area',kind:'cleave',dmg:[7,2.8],undead:1.6,radius:24,melee:1}]},
  shadowknight:{name:'Shadow Knight',hp:[52,14],mana:[26,7],ac:10,regen:1.2,gear:['warrior','knight'],desc:'Dark tank. Lifetaps, a small skeleton, fear, and a Harm Touch paid for in blood. Likes two mobs at once: Dark Cleave heals per mob. Solo: good.',
    loadout:['sstrike','siphon','disease','terror','minion','harm','sfeign','dcleave'],abilities:[
    {id:'sstrike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#a3252f',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'siphon',name:'Siphon',short:'Siphon',lvl:1,mana:6,cast:0,cd:[6,4,0.25],range:60,col:'#b48cff',tgt:1,tag:'Lifetap',kind:'lifetap',dmg:[5,2],beam:'#a3252f'},
    {id:'disease',name:'Disease Cloud',short:'Cloud',lvl:2,mana:6,cast:0,cd:[10,6,0.4],range:80,col:'#7a9a3a',tgt:1,tag:'DoT',kind:'dot',dmg:[3,1.4],dur:[18,0.5]},
    {id:'terror',name:'Terror',short:'Terror',lvl:3,mana:7,cast:0,cd:[20,12,0.8],range:80,col:'#6a4fa3',tgt:1,tag:'Fear',kind:'fear',dur:[4,0.2]},
    {id:'minion',name:'Raise Minion',short:'Minion',lvl:4,mana:14,cast:3,cd:[30,15,1.5],col:'#cfc8b2',tgt:0,tag:'Pet',kind:'pet',pet:{name:'minion',img:'minion',hp:[18,8],dmg:[2,1],ac:3}},
    {id:'harm',name:'Harm Touch',short:'Harm',lvl:5,mana:0,cast:0,cd:[90,60,2],range:30,col:'#a3252f',tgt:1,tag:'Big hit',kind:'nuke',dmg:[40,14],hpCost:0.2,beam:'#a3252f'},
    {id:'sfeign',name:'Feign Death',short:'Feign',lvl:6,mana:5,cast:0,cd:[60,35,2.5],col:'#9a9a9a',tgt:0,tag:'Escape',kind:'feign'},
    {id:'dcleave',name:'Dark Cleave',short:'DCleave',lvl:8,mana:6,cast:0,cd:[10,6,0.5],col:'#a3252f',tgt:0,tag:'Area lifetap',kind:'cleave',dmg:[6,2.4],tapPer:[4,1.5],radius:24,melee:1}]},
  wizard:{name:'Wizard',hp:[32,10],mana:[50,13],ac:0,regen:1,caster:1,desc:'Glass cannon. Frost Bolt chills, Freeze holds, Shatter hits huge. Blink to get around, Gate home. Solo: strong on one mob, weak on two.',
    loadout:['frost','blink','freeze','shatter','fireball','nova','mshield','gate'],abilities:[
    {id:'frost',name:'Frost Bolt',short:'Frost',lvl:1,mana:6,cast:0,cd:null,range:80,col:'#9fd8ff',tgt:1,tag:'Nuke + chill',kind:'nuke',dmg:[8,3.2],chill:1,beam:'#9fd8ff'},
    {id:'blink',name:'Blink',short:'Blink',lvl:1,mana:5,cast:0,cd:[12,6,0.6],col:'#c8e8ff',tgt:0,tag:'Teleport',kind:'blink',range:50},
    {id:'freeze',name:'Freeze',short:'Freeze',lvl:2,mana:7,cast:0,cd:[14,8,0.6],range:80,col:'#bfe6ff',tgt:1,tag:'Root',kind:'root',dur:[8,0.4]},
    {id:'shatter',name:'Shatter',short:'Shattr',lvl:3,mana:10,cast:0,cd:[10,6,0.4],range:80,col:'#e6f6ff',tgt:1,tag:'Combo nuke',kind:'nuke',dmg:[26,9],shatter:1,beam:'#e6f6ff'},
    {id:'fireball',name:'Fireball',short:'Fire',lvl:4,mana:18,cast:2.5,cd:[8,5,0.3],range:80,col:'#ff9a4a',tgt:1,tag:'Big nuke',kind:'nuke',dmg:[22,8],beam:'#ff9a4a'},
    {id:'nova',name:'Frost Nova',short:'Nova',lvl:5,mana:14,cast:0,cd:[20,12,0.8],col:'#bfe6ff',tgt:0,tag:'Area freeze',kind:'cleave',dmg:[6,2.4],root:[3,0.2],radius:34},
    {id:'mshield',name:'Mana Shield',short:'Shield',lvl:6,mana:10,cast:0,cd:[40,25,1.5],col:'#7dbbff',tgt:0,tag:'Absorb',kind:'buff',buff:'mshield',dur:[10,0.5]},
    {id:'gate',name:'Gate',short:'Gate',lvl:8,mana:20,cast:6,cd:[300,200,0],col:'#c8a0ff',tgt:0,tag:'Go home',kind:'gate'}]}
};
CLASSES.druid.caster=1;

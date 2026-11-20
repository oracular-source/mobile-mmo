// DATA ONLY. Classes and their abilities. Tune class numbers here.
'use strict';
/* ---------- Game data (tune numbers here) ---------- */
// Classes. Every ability has a "kind" that says what it does; numbers are [base, per level].
// cast: seconds standing still (0 = instant, usable while moving). cd: [start, floor, seconds shaved per level].
// dur: [seconds, extra seconds per level after learning it]. Spells grow a little stronger every level.
const CLASSES={
  druid:{name:'Druid',role:'Caster',solo:'Steady',blurb:'Nature caster. Kites with snares, roots and rot.',sprite:'druid',hp:[40,12],mana:[40,10],ac:0,regen:1,desc:'Nature caster. Kites with snares, roots and rot.',
    loadout:['thorn','mend','snare','rot','root','bark'],abilities:[
    {id:'thorn',name:'Thornlash',short:'Thorn',lvl:1,mana:5,cast:0,cd:null,range:80,col:'#7dbb4a',tgt:1,tag:'Nuke',kind:'nuke',dmg:[8,3],beam:'#9be37a'},
    {id:'mend',name:'Mending Touch',short:'Mend',lvl:1,mana:9,cd:[8,4,0.5],cast:1.2,col:'#7dffa6',tgt:0,tag:'Heal',kind:'heal',heal:[15,6]},
    {id:'snare',name:'Tanglefoot',short:'Tangle',lvl:3,mana:6,cd:[18,10,1],cast:0,range:80,col:'#5f9ea0',tgt:1,tag:'Snare',kind:'snare',dur:[24,1]},
    {id:'rot',name:'Creeping Rot',short:'Rot',lvl:2,mana:8,cd:[12,6,0.75],cast:0,range:80,col:'#6aa84f',tgt:1,tag:'DoT',kind:'dot',dmg:[3,1.6],dur:[18,0.5]},
    {id:'root',name:'Rootgrip',short:'Root',lvl:6,mana:7,cd:[24,12,1.5],cast:0.6,range:80,col:'#9b7b3a',tgt:1,tag:'Root',kind:'root',dur:[12,0.5]},
    {id:'bark',name:'Barkskin',short:'Bark',lvl:8,mana:10,cd:[30,15,1.5],cast:0,col:'#a07850',tgt:0,tag:'Armor',kind:'buff',buff:'bark',dur:[120,0]}]},
  warrior:{name:'Warrior',role:'Tank',solo:'Hard',blurb:'Hardest class to kill. No mana, skills on cooldowns; best with a group.',sprite:'warrior',hp:[60,16],mana:null,ac:12,regen:1.5,holdLine:0.2,holdMax:3,lastStand:{dr:0.75,dur:5},desc:'Armored tank. No mana; skills on cooldowns. Hold the Line: takes 20% less damage for each mob on you (up to 3). Last Stand: once a fight, a killing blow leaves you at 1 HP and you can\'t die for 5s (damage cut by 75%). Hardest class to kill.',
    loadout:['strike','bandage','bash','ham','stance','cleave'],abilities:[
    {id:'strike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,3],melee:1},
    {id:'bandage',name:'Bandage',short:'Bandage',lvl:1,mana:0,cast:2,cd:[20,12,1],col:'#e8e2cf',tgt:0,tag:'Heal',kind:'heal',heal:[12,5],melee:1},
    {id:'throw',name:'Throw Stone',short:'Throw',lvl:1,mana:0,cast:0,cd:[6,4,0.25],range:80,col:'#8d8692',tgt:1,tag:'Pull',kind:'nuke',dmg:[3,1],melee:1,beam:'#cfc8b2'},
    {id:'bash',name:'Shield Bash',short:'Bash',lvl:2,mana:0,cast:0,cd:[12,8,0.5],range:18,col:'#6a82b0',tgt:1,tag:'Stun',kind:'stun',dmg:[4,1],dur:[2,0.1],melee:1},
    {id:'ham',name:'Hamstring',short:'Hamstr',lvl:3,mana:0,cast:0,cd:[18,10,1],range:18,col:'#a3252f',tgt:1,tag:'Snare',kind:'snare',dur:[16,1],melee:1},
    {id:'stance',name:'Defensive Stance',short:'Stance',lvl:6,mana:0,cast:0,cd:[45,30,1.5],col:'#c9a227',tgt:0,tag:'Defense',kind:'buff',buff:'stance',dur:[10,0.5]},
    {id:'cleave',name:'Cleave',short:'Cleave',lvl:8,mana:0,cast:0,cd:[10,6,0.5],col:'#ffb37a',tgt:0,tag:'Area',kind:'cleave',dmg:[6,2.5],radius:24,melee:1}]},
  rogue:{name:'Rogue',role:'Melee',solo:'Hard',blurb:'Huge Backstab from Hide, Evade to drop aggro. No heal: best with a tank.',sprite:'rogue',hp:[50,15],mana:null,ac:8,regen:1.2,dodge:0.25,desc:'Sneaky melee damage. Open from Hide with a huge Backstab, hit hard from behind, Evade to drop aggro. Dodges a quarter of melee hits, but has no heal: best with a tank.',
    loadout:['stab','backstab','hide','gouge','evade','rend','knife','sprint'],abilities:[
    {id:'stab',name:'Stab',short:'Stab',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#d8dde6',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'backstab',name:'Backstab',short:'Backst',lvl:1,mana:0,cast:0,cd:[10,6,0.4],range:18,col:'#e05a5a',tgt:1,tag:'Backstab',kind:'backstab',dmg:[10,6],melee:1},
    {id:'hide',name:'Hide',short:'Hide',lvl:1,mana:0,cast:0,cd:[6,3,0.3],col:'#6b6f80',tgt:0,tag:'Stealth',kind:'stealth',melee:1},
    {id:'knife',name:'Throwing Knife',short:'Knife',lvl:1,mana:0,cast:0,cd:[6,4,0.25],range:80,col:'#9aa3b0',tgt:1,tag:'Pull',kind:'nuke',dmg:[3,1.2],melee:1,beam:'#d8dde6'},
    {id:'gouge',name:'Gouge',short:'Gouge',lvl:2,mana:0,cast:0,cd:[10,6,0.5],range:18,col:'#c9a227',tgt:1,tag:'Stun',kind:'stun',dmg:[3,1],dur:[3.5,0.1],melee:1},
    {id:'rend',name:'Rend',short:'Rend',lvl:3,mana:0,cast:0,cd:[12,6,0.6],range:18,col:'#a3252f',tgt:1,tag:'Bleed',kind:'dot',dmg:[4,2],dur:[15,0.5],melee:1},
    {id:'evade',name:'Evade',short:'Evade',lvl:5,mana:0,cast:0,cd:[30,18,1.2],col:'#8d8692',tgt:0,tag:'Drop aggro',kind:'evade',dur:[3,0.15],melee:1},
    {id:'sprint',name:'Sprint',short:'Sprint',lvl:7,mana:0,cast:0,cd:[40,25,1.5],col:'#7dbbd0',tgt:0,tag:'Speed',kind:'buff',buff:'sprint',dur:[8,0.3],melee:1}]},
  necro:{name:'Necromancer',role:'Pet',solo:'Easy',blurb:'Undead pet tanks while you lifetap, plague and fear.',sprite:'necro',hp:[36,11],mana:[44,11],ac:0,regen:1,caster:1,desc:'Dark caster with an undead pet that tanks for you. Lifetaps, plague, fear and feign death.',
    loadout:['tap','plague','dread','raise','feign','mendb'],abilities:[
    {id:'tap',name:'Lifetap',short:'Tap',lvl:1,mana:6,cast:0,cd:null,range:80,col:'#b48cff',tgt:1,tag:'Lifetap',kind:'lifetap',dmg:[6,2.4],beam:'#b48cff'},
    {id:'raise',name:'Raise Bones',short:'Raise',lvl:4,mana:15,cast:3,cd:[30,15,1.5],col:'#cfc8b2',tgt:0,tag:'Pet',kind:'pet'},
    {id:'plague',name:'Siphon Plague',short:'Plague',lvl:1,mana:9,cast:0,cd:[10,5,0.5],range:80,col:'#7a9a3a',tgt:1,tag:'DoT',kind:'dot',dmg:[4,2],dur:[18,0.5]},
    {id:'dread',name:'Dread',short:'Dread',lvl:3,mana:8,cast:0,cd:[20,12,0.8],range:80,col:'#6a4fa3',tgt:1,tag:'Fear',kind:'fear',dur:[6,0.3]},
    {id:'feign',name:'Feign Death',short:'Feign',lvl:6,mana:5,cast:0,cd:[60,35,2.5],col:'#9a9a9a',tgt:0,tag:'Escape',kind:'feign'},
    {id:'mendb',name:'Mend Bones',short:'MendB',lvl:8,mana:10,cast:1,cd:[10,6,0.4],col:'#e8e2cf',tgt:0,tag:'Pet heal',kind:'petheal',heal:[20,8]}]},
  // ---- Batch 1 (v0.17). New ability fields: undead (x damage vs undead), undeadOnly, holy (share of a heal that burns
  // nearby undead), hpCost (share of your max health), chill, shatter, aslow (slows attacks too), full (full heal),
  // pet:{...} (which pet a summon makes), and area kinds that can stun, root or heal per mob hit.
  cleric:{name:'Cleric',role:'Healer',solo:'Steady',blurb:'Healer with a hammer. Slow kills, almost never dies; heals burn undead.',hp:[44,13],mana:[44,11],ac:6,regen:1,gear:['cleric'],desc:'Healer with a hammer. Slow kills, almost never dies. Every heal also burns nearby undead. Solo: slow but safe.',
    loadout:['smite','mheal','renew','hlight','daze','turn','gheal','aura'],abilities:[
    {id:'smite',name:'Smite',short:'Smite',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#e8e2cf',tgt:1,tag:'Melee',kind:'nuke',dmg:[6,2.6],melee:1},
    {id:'mheal',name:'Minor Heal',short:'Heal',lvl:1,mana:8,cast:1.5,cd:[6,3,0.4],col:'#ffe9a8',tgt:0,tag:'Heal',kind:'heal',heal:[14,6],holy:0.6},
    {id:'renew',name:'Renew',short:'Renew',lvl:2,mana:10,cast:0,cd:[14,8,0.5],col:'#fff3c4',tgt:0,tag:'Heal over time',kind:'hot',heal:[3,1.4],dur:[12,0],holy:0.6},
    {id:'hlight',name:'Holy Light',short:'Light',lvl:3,mana:6,cast:0,cd:[6,4,0.25],range:80,col:'#ffe9a8',tgt:1,tag:'Nuke',kind:'nuke',dmg:[6,2.4],undead:2,beam:'#ffe9a8'},
    {id:'daze',name:'Daze',short:'Daze',lvl:4,mana:0,cast:0,cd:[14,9,0.5],range:18,col:'#c9a227',tgt:1,tag:'Stun',kind:'stun',dmg:[3,1],dur:[1.8,0.1],melee:1},
    {id:'turn',name:'Turn Undead',short:'Turn',lvl:5,mana:8,cast:0,cd:[20,12,0.8],range:80,col:'#fff3c4',tgt:1,tag:'Fear undead',kind:'fear',dur:[6,0.3],undeadOnly:1},
    {id:'gheal',name:'Greater Heal',short:'GHeal',lvl:6,mana:22,cast:2.5,cd:[12,8,0.5],col:'#fff3c4',tgt:0,tag:'Big heal',kind:'heal',heal:[40,12],holy:0.6},
    {id:'aura',name:'Divine Aura',short:'Aura',lvl:8,mana:10,cast:0,cd:[120,90,3],col:'#ffd27a',tgt:0,tag:'Immune',kind:'buff',buff:'aura',dur:[4,0]}]},
  enchanter:{name:'Enchanter',role:'CC',solo:'Steady',blurb:'Puts extra mobs to sleep and slows the one you fight. Keep control.',hp:[34,9],mana:[48,12],ac:0,regen:1,caster:1,desc:'Crowd control. Puts extra mobs to sleep, slows the one you fight, and lets a floating sword or a charmed mob do the hitting. Solo: fine if you keep control.',
    loadout:['mlash','mrot','mez','blade','slow','charm','flash','phantasm'],abilities:[
    {id:'mlash',name:'Mind Lash',short:'Lash',lvl:1,mana:3,cast:0,cd:null,range:80,col:'#e0c3ff',tgt:1,tag:'Nuke',kind:'nuke',dmg:[5,2],beam:'#e0c3ff'},
    {id:'mrot',name:'Mind Rot',short:'Rot',lvl:1,mana:6,cast:0,cd:[8,5,0.4],range:80,col:'#c8a0ff',tgt:1,tag:'DoT',kind:'dot',dmg:[4,2],dur:[12,0.5]},
    {id:'mez',name:'Mesmerize',short:'Mez',lvl:1,mana:8,cast:0,cd:[6,4,0.2],range:80,col:'#e0c3ff',tgt:1,tag:'Sleep',kind:'mez',dur:[18,0.3]},
    {id:'blade',name:'Animate Blade',short:'Blade',lvl:2,mana:14,cast:2,cd:[20,10,1],col:'#cfd6e0',tgt:0,tag:'Pet',kind:'pet',pet:{name:'floating sword',img:'blade',hp:[16,6],dmg:[3,1.5],ac:2,life:120,atk:1.5}},
    {id:'slow',name:'Slow Mind',short:'Slow',lvl:3,mana:7,cast:0,cd:[14,8,0.5],range:80,col:'#9fb8e0',tgt:1,tag:'Slow',kind:'snare',dur:[20,1],aslow:1},
    {id:'clarity',name:'Clarity',short:'Clarity',lvl:4,mana:10,cast:1,cd:[10,10,0],col:'#7dbbff',tgt:0,tag:'Mana regen',kind:'buff',buff:'clarity',dur:[99999,0]},
    {id:'charm',name:'Charm',short:'Charm',lvl:5,mana:15,cast:1,cd:[40,25,1.5],range:60,col:'#ff9de2',tgt:1,tag:'Charm',kind:'charm',dur:[24,1.5]},
    {id:'flash',name:'Color Flash',short:'Flash',lvl:7,mana:12,cast:0,cd:[30,20,1],col:'#ffffff',tgt:0,tag:'Area stun',kind:'cleave',radius:30,stun:[3,0.1]},
    {id:'phantasm',name:'Phantasm',short:'Phantm',lvl:8,mana:12,cast:0,cd:[45,30,1.5],col:'#c8a0ff',tgt:0,tag:'Decoy',kind:'decoy',dur:[5,0.2]}]},
  paladin:{name:'Paladin',role:'Tank',solo:'Steady',blurb:'Holy tank. Heals, stuns and holy ground. Strong in the crypt.',hp:[54,15],mana:[24,6],ac:10,regen:1.3,gear:['warrior','knight'],desc:'Holy tank. Heals, stuns, and lays holy ground that heals you and burns the undead. Very strong in the crypt. Solo: steady.',
    loadout:['pstrike','pmend','hbash','loh','smiteu','taunt','consec','dstrike'],abilities:[
    {id:'pstrike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'loh',name:'Lay on Hands',short:'LoH',lvl:5,mana:0,cast:0,cd:[180,120,4],col:'#ffd27a',tgt:0,tag:'Full heal',kind:'heal',heal:[0,0],full:1},
    {id:'hbash',name:'Holy Bash',short:'Bash',lvl:2,mana:0,cast:0,cd:[12,8,0.5],range:18,col:'#6a82b0',tgt:1,tag:'Stun',kind:'stun',dmg:[4,1],dur:[2,0.1],melee:1},
    {id:'pmend',name:'Mend',short:'Mend',lvl:1,mana:8,cast:2,cd:[8,5,0.4],col:'#ffe9a8',tgt:0,tag:'Heal',kind:'heal',heal:[12,5]},
    {id:'smiteu',name:'Smite Undead',short:'SmiteU',lvl:4,mana:10,cast:0,cd:[12,8,0.5],range:80,col:'#ffe9a8',tgt:1,tag:'Undead nuke',kind:'nuke',dmg:[16,6],undeadOnly:1,beam:'#ffe9a8'},
    {id:'taunt',name:'Taunt',short:'Taunt',lvl:5,mana:0,cast:0,cd:[8,6,0.2],range:40,col:'#ffb37a',tgt:1,tag:'Taunt',kind:'taunt'},
    {id:'consec',name:'Consecrate',short:'Consec',lvl:6,mana:14,cast:0,cd:[30,20,1],col:'#ffd27a',tgt:0,tag:'Holy ground',kind:'ground',radius:26,dur:[15,0],heal:[2,0.8],dmg:[3,1.2]},
    {id:'dstrike',name:'Divine Strike',short:'Divine',lvl:8,mana:6,cast:0,cd:[10,6,0.5],col:'#ffe9a8',tgt:0,tag:'Area',kind:'cleave',dmg:[7,2.8],undead:1.6,radius:24,melee:1}]},
  shadowknight:{name:'Shadow Knight',role:'Tank',solo:'Steady',blurb:'Dark tank. Lifetaps, a small skeleton, fear. Likes two mobs at once.',hp:[52,14],mana:[26,7],ac:10,regen:1.2,gear:['warrior','knight'],desc:'Dark tank. Lifetaps, a small skeleton, fear, and a Harm Touch paid for in blood. Likes two mobs at once: Dark Cleave heals per mob. Solo: good.',
    loadout:['sstrike','siphon','disease','terror','minion','dcleave','sfeign','harm'],abilities:[
    {id:'sstrike',name:'Strike',short:'Strike',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#a3252f',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'siphon',name:'Siphon',short:'Siphon',lvl:1,mana:6,cast:0,cd:[6,4,0.25],range:60,col:'#b48cff',tgt:1,tag:'Lifetap',kind:'lifetap',dmg:[5,2],beam:'#a3252f'},
    {id:'disease',name:'Disease Cloud',short:'Cloud',lvl:2,mana:6,cast:0,cd:[10,6,0.4],range:80,col:'#7a9a3a',tgt:1,tag:'DoT',kind:'dot',dmg:[3,1.4],dur:[18,0.5]},
    {id:'terror',name:'Terror',short:'Terror',lvl:3,mana:7,cast:0,cd:[20,12,0.8],range:80,col:'#6a4fa3',tgt:1,tag:'Fear',kind:'fear',dur:[4,0.2]},
    {id:'minion',name:'Raise Minion',short:'Minion',lvl:4,mana:14,cast:3,cd:[30,15,1.5],col:'#cfc8b2',tgt:0,tag:'Pet',kind:'pet',pet:{name:'minion',img:'minion',hp:[18,8],dmg:[2,1],ac:3}},
    {id:'dcleave',name:'Dark Cleave',short:'DCleave',lvl:5,mana:6,cast:0,cd:[10,6,0.5],col:'#a3252f',tgt:0,tag:'Area lifetap',kind:'cleave',dmg:[6,2.4],tapPer:[4,1.5],radius:24,melee:1},
    {id:'sfeign',name:'Feign Death',short:'Feign',lvl:6,mana:5,cast:0,cd:[60,35,2.5],col:'#9a9a9a',tgt:0,tag:'Escape',kind:'feign'},
    {id:'harm',name:'Harm Touch',short:'Harm',lvl:8,mana:0,cast:0,cd:[90,60,2],range:30,col:'#a3252f',tgt:1,tag:'Big hit',kind:'nuke',dmg:[40,14],hpCost:0.2,beam:'#a3252f'}]},
  wizard:{name:'Wizard',role:'Caster',solo:'Steady',blurb:'Glass cannon. Freeze and Shatter, Blink away. Strong on one mob, weak on two.',hp:[32,10],mana:[50,13],ac:0,regen:1,caster:1,desc:'Glass cannon. Frost Bolt chills, Freeze holds, Shatter hits huge. Blink to get around, Gate home. Solo: strong on one mob, weak on two.',
    loadout:['frost','blink','freeze','shatter','fireball','nova','mshield','gate'],abilities:[
    {id:'frost',name:'Frost Bolt',short:'Frost',lvl:1,mana:6,cast:0,cd:null,range:80,col:'#9fd8ff',tgt:1,tag:'Nuke + chill',kind:'nuke',dmg:[8,3.2],chill:1,beam:'#9fd8ff'},
    {id:'blink',name:'Blink',short:'Blink',lvl:1,mana:5,cast:0,cd:[12,6,0.6],col:'#c8e8ff',tgt:0,tag:'Teleport',kind:'blink',range:50},
    {id:'freeze',name:'Freeze',short:'Freeze',lvl:2,mana:7,cast:0,cd:[14,8,0.6],range:80,col:'#bfe6ff',tgt:1,tag:'Root',kind:'root',dur:[8,0.4]},
    {id:'shatter',name:'Shatter',short:'Shattr',lvl:3,mana:10,cast:0,cd:[10,6,0.4],range:80,col:'#e6f6ff',tgt:1,tag:'Combo nuke',kind:'nuke',dmg:[26,9],shatter:1,beam:'#e6f6ff'},
    {id:'fireball',name:'Fireball',short:'Fire',lvl:4,mana:18,cast:2.5,cd:[8,5,0.3],range:80,col:'#ff9a4a',tgt:1,tag:'Big nuke',kind:'nuke',dmg:[22,8],beam:'#ff9a4a'},
    {id:'nova',name:'Frost Nova',short:'Nova',lvl:5,mana:14,cast:0,cd:[20,12,0.8],col:'#bfe6ff',tgt:0,tag:'Area freeze',kind:'cleave',dmg:[6,2.4],root:[3,0.2],radius:34},
    {id:'mshield',name:'Mana Shield',short:'Shield',lvl:6,mana:10,cast:0,cd:[40,25,1.5],col:'#7dbbff',tgt:0,tag:'Absorb',kind:'buff',buff:'mshield',dur:[10,0.5]},
    {id:'gate',name:'Gate',short:'Gate',lvl:8,mana:20,cast:6,cd:[300,200,0],col:'#c8a0ff',tgt:0,tag:'Go home',kind:'gate'}]},
  // ---- Batch 2 (v0.18). New kinds: song (Bard: toggles on/off, pulses every 3s, two at once), crescendo, slow (attack slow only),
  // mark, trap, detonate, petbuff, canni (health for mana). New fields: dash, hits, knock, petHeal, shot, back (Disengage),
  // split (Monk's Feign Death), all/totem/tick (ground circles that hit any mob), val (a buff's strength, e.g. Flame Shield),
  // pet:{threat, burn, boom, boomStun, say}. Class field dotStack: each DoT ticks this much harder per other DoT on the mob (Shaman).
  magician:{name:'Magician',role:'Pet',solo:'Easy',blurb:'Summons an elemental for each fight, then blows it up and calls the next.',hp:[34,10],mana:[48,12],ac:0,regen:1,caster:1,desc:'Summoner. Pick an elemental for the fight (Earth tanks, Fire burns), then blow it up with Detonate and call the next. Solo: strong, like the Necro.',
    loadout:['lash','earth','fire','mende','burnout','detonate','fshield','elink'],abilities:[
    {id:'lash',name:'Elemental Lash',short:'Lash',lvl:1,mana:4,cast:0,cd:null,range:40,col:'#ff9a4a',tgt:1,tag:'Short-range hit, heals pet',kind:'nuke',dmg:[5,2],petHeal:[2,1],beam:'#ffb37a'},
    {id:'earth',name:'Summon Earth',short:'Earth',lvl:1,mana:15,cast:3,cd:[8,5,0.3],col:'#8a6a48',tgt:0,tag:'Pet: tank, stone fist',kind:'pet',pet:{name:'earth elemental',img:'earth',hp:[34,15],dmg:[2.5,1.3],ac:10,atk:2,threat:5,boom:0.5,boomStun:2.5,bash:{cd:10,dur:0.5},say:'An earth elemental heaves itself up out of the ground.'}},
    {id:'fire',name:'Summon Fire',short:'Fire',lvl:2,mana:15,cast:3,cd:[8,5,0.3],col:'#ff9a4a',tgt:0,tag:'Pet: damage',kind:'pet',pet:{name:'fire elemental',img:'fire',hp:[18,8],dmg:[4,2],ac:2,atk:1.6,threat:2,burn:[1.5,0.7],boom:1.3,say:'A fire elemental flares into being beside you.'}},
    {id:'mende',name:'Mend Elemental',short:'MendE',lvl:3,mana:9,cast:1,cd:[8,5,0.3],col:'#7dffa6',tgt:0,tag:'Pet heal',kind:'petheal',heal:[16,7]},
    {id:'burnout',name:'Burnout',short:'Burn',lvl:4,mana:8,cast:0,cd:[30,20,1],col:'#ffb37a',tgt:0,tag:'Pet attacks faster',kind:'petbuff',buff:'burnout',dur:[20,0]},
    {id:'detonate',name:'Detonate',short:'Boom',lvl:5,mana:10,cast:0,cd:[20,12,0.8],col:'#ff5a2a',tgt:0,tag:'Pet explodes',kind:'detonate',dmg:[20,8],radius:30},
    {id:'fshield',name:'Flame Shield',short:'FShield',lvl:6,mana:12,cast:1,cd:[10,10,0],col:'#ff9a4a',tgt:0,tag:'Damage shield',kind:'buff',buff:'fshield',dur:[99999,0],val:[2,0.8]},
    {id:'elink',name:'Elemental Link',short:'Link',lvl:8,mana:10,cast:0,cd:[45,30,1.5],col:'#ffd27a',tgt:0,tag:'Pet takes half your damage',kind:'buff',buff:'link',dur:[10,0]}]},
  ranger:{name:'Ranger',role:'Hybrid',solo:'Steady',blurb:'Archer who shoots on the move and drags mobs through traps.',hp:[44,13],mana:[20,5],ac:6,regen:1.1,gear:['ranger'],desc:'Archer who never stops moving. Shoots while walking, lays traps, and drags mobs through them. Solo: good if you keep moving.',
    loadout:['shoot','mark','ensnare','trap','disengage','salve','volley','rapid'],abilities:[
    {id:'shoot',name:'Shoot',short:'Shoot',lvl:1,mana:0,cast:0,cd:null,range:80,col:'#e8e2cf',tgt:1,tag:'Ranged, on the move',kind:'nuke',dmg:[7,2.8],melee:1,shot:1,beam:'#e8e2cf'},
    {id:'mark',name:"Hunter's Mark",short:'Mark',lvl:1,mana:4,cast:0,cd:[6,4,0.2],range:80,col:'#ffb37a',tgt:1,tag:'+20% damage on it',kind:'mark',mark:1.2},
    {id:'ensnare',name:'Ensnaring Shot',short:'Snare',lvl:2,mana:5,cast:0,cd:[14,8,0.5],range:80,col:'#5f9ea0',tgt:1,tag:'Snare',kind:'snare',dmg:[3,1.2],dur:[14,0.8],melee:1,beam:'#9fd0d0'},
    {id:'trap',name:'Spike Trap',short:'Trap',lvl:3,mana:6,cast:0,cd:[8,5,0.3],col:'#8d8692',tgt:0,tag:'Ground trap',kind:'trap',dmg:[16,6],bleed:[3,1.4],melee:1},
    {id:'disengage',name:'Disengage',short:'Diseng',lvl:4,mana:0,cast:0,cd:[12,8,0.4],col:'#7dbbd0',tgt:0,tag:'Hop back',kind:'blink',back:1,range:36,melee:1},
    {id:'salve',name:'Salve',short:'Salve',lvl:5,mana:8,cast:1.5,cd:[8,5,0.3],col:'#7dffa6',tgt:0,tag:'Heal',kind:'heal',heal:[16,6]},
    {id:'volley',name:'Volley',short:'Volley',lvl:6,mana:10,cast:0,cd:[20,12,0.8],range:80,col:'#e8e2cf',tgt:1,tag:'Area over time',kind:'ground',all:1,radius:22,dur:[4,0],tick:1,dmg:[4,1.6],melee:1,msg:'Arrows rain down on the area.'},
    {id:'rapid',name:'Rapid Fire',short:'Rapid',lvl:8,mana:0,cast:0,cd:[40,25,1.5],col:'#ffd27a',tgt:0,tag:'Shoot 2x faster',kind:'buff',buff:'rapid',dur:[6,0],melee:1}]},
  monk:{name:'Monk',role:'Melee',solo:'Steady',blurb:'Fast fists, no armor. Pull a group, Feign Death, fight the one that stays.',hp:[50,14],mana:null,ac:4,regen:1.4,gear:['monk'],desc:'Fast fists, no armor. Pull a group, then Feign Death: everything walks home except your target. Solo: good, one mob at a time.',
    loadout:['palm','mmend','fkick','mfeign','sweep','flurry','deflect','dragon'],abilities:[
    {id:'palm',name:'Palm Strike',short:'Palm',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#ffd27a',tgt:1,tag:'Melee',kind:'nuke',dmg:[8,3.2],melee:1},
    {id:'mmend',name:'Mend',short:'Mend',lvl:1,mana:0,cast:0,cd:[40,25,1.5],col:'#7dffa6',tgt:0,tag:'Instant heal',kind:'heal',heal:[18,7],melee:1},
    {id:'fkick',name:'Flying Kick',short:'Kick',lvl:2,mana:0,cast:0,cd:[12,8,0.4],range:60,col:'#ffb37a',tgt:1,tag:'Leap + kick',kind:'nuke',dmg:[6,2.4],dash:1,melee:1},
    {id:'mfeign',name:'Feign Death',short:'Feign',lvl:3,mana:0,cast:0,cd:[20,12,0.6],col:'#9a9a9a',tgt:0,tag:'Split the pull',kind:'feign',split:1,melee:1},
    {id:'sweep',name:'Leg Sweep',short:'Sweep',lvl:4,mana:0,cast:0,cd:[10,6,0.5],range:18,col:'#c9a227',tgt:1,tag:'Stun',kind:'stun',dmg:[3,1],dur:[2,0.1],melee:1},
    {id:'flurry',name:'Flurry',short:'Flurry',lvl:5,mana:0,cast:0,cd:[14,9,0.5],range:18,col:'#ffe9a8',tgt:1,tag:'Five punches',kind:'nuke',dmg:[3,1.2],hits:5,melee:1},
    {id:'deflect',name:'Deflect',short:'Deflct',lvl:6,mana:0,cast:0,cd:[40,28,1.2],col:'#cfd6e0',tgt:0,tag:'Dodge all hits',kind:'buff',buff:'deflect',dur:[3,0.1],melee:1},
    {id:'dragon',name:'Dragon Strike',short:'Dragon',lvl:8,mana:0,cast:0,cd:[16,10,0.6],range:18,col:'#ff9a4a',tgt:1,tag:'Big hit + knockback',kind:'nuke',dmg:[18,6],knock:22,melee:1}]},
  shaman:{name:'Shaman',role:'Hybrid',solo:'Easy',blurb:'Slows the mob so it barely hurts, stacks poisons, drops a totem.',hp:[40,12],mana:[42,11],ac:4,regen:1,caster:1,gear:['shaman'],dotStack:0.1,desc:'Never casts a bolt. Slows the mob so it barely hurts, stacks poisons (each one a bit stronger with the other on), drops a totem and walks away. Solo: strong and safe.',
    loadout:['jab','sicken','sheal','drowsy','wolf','swarm','totem','canni'],abilities:[
    {id:'jab',name:'Spear Jab',short:'Jab',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[6,2.4],melee:1},
    {id:'sicken',name:'Sicken',short:'Sicken',lvl:1,mana:6,cast:0,cd:[8,5,0.4],range:80,col:'#7a9a3a',tgt:1,tag:'DoT',kind:'dot',dmg:[4,2],dur:[18,0.5]},
    {id:'sheal',name:'Minor Healing',short:'Heal',lvl:1,mana:8,cast:1.5,cd:[6,3,0.4],col:'#7dffa6',tgt:0,tag:'Heal',kind:'heal',heal:[14,6]},
    {id:'drowsy',name:'Drowsy',short:'Drowsy',lvl:2,mana:6,cast:0,cd:[12,8,0.4],range:80,col:'#9fb8e0',tgt:1,tag:'Attack slow',kind:'slow',dur:[24,1],aslowX:1.43},
    {id:'wolf',name:'Spirit of the Wolf',short:'Wolf',lvl:3,mana:10,cast:1,cd:[10,10,0],col:'#cfd6e0',tgt:0,tag:'Run faster (out of fights)',kind:'buff',buff:'wolf',dur:[99999,0]},
    {id:'swarm',name:'Swarm',short:'Swarm',lvl:4,mana:8,cast:0,cd:[10,6,0.4],range:80,col:'#c9a227',tgt:1,tag:'Second DoT',kind:'dot',dmg:[4,2],dur:[15,0.5]},
    {id:'totem',name:'Venom Totem',short:'Totem',lvl:5,mana:10,cast:0,cd:[24,16,0.8],col:'#7a9a3a',tgt:0,tag:'Poison totem',kind:'ground',all:1,totem:1,radius:26,dur:[20,0],tick:2,dmg:[4,1.6],msg:'You plant a Venom Totem. Mobs that come near it are poisoned.'},
    {id:'ward',name:'Spirit Ward',short:'Ward',lvl:6,mana:14,cast:1.5,cd:[10,10,0],col:'#c9a227',tgt:0,tag:'Armor + health',kind:'buff',buff:'ward',dur:[99999,0]},
    {id:'canni',name:'Cannibalize',short:'Canni',lvl:8,mana:0,cast:0,cd:[8,5,0.3],col:'#a3252f',tgt:0,tag:'Health for mana',kind:'canni',hpCost:0.15,ratio:1.2}]},
  bard:{name:'Bard',role:'Hybrid',solo:'Steady',blurb:'Light melee. Two songs pulse on their own: heal, hurt, speed, slow.',hp:[46,13],mana:[26,6],ac:5,regen:1.2,gear:['bard'],desc:'Light melee who is always playing. Two songs pulse around you on their own: heal, hurt, run fast, swing faster, or slow the mobs. Solo: steady.',
    loadout:['slash','smend','dirge','travel','lullaby','chant','discord','crescendo'],abilities:[
    {id:'slash',name:'Slash',short:'Slash',lvl:1,mana:0,cast:0,cd:null,range:18,col:'#cfd6e0',tgt:1,tag:'Melee',kind:'nuke',dmg:[7,2.8],melee:1},
    {id:'smend',name:'Song of Mending',short:'Mending',lvl:1,mana:5,cast:0,cd:[2,2,0],col:'#7dffa6',tgt:0,tag:'Song: heal',kind:'song',song:'heal',heal:[3,1.2]},
    {id:'dirge',name:'Dirge',short:'Dirge',lvl:2,mana:5,cast:0,cd:[2,2,0],col:'#c8506a',tgt:0,tag:'Song: hurt mobs near you',kind:'song',song:'dmg',dmg:[4,2],radius:32},
    {id:'travel',name:'Song of Travel',short:'Travel',lvl:3,mana:3,cast:0,cd:[2,2,0],col:'#7dbbd0',tgt:0,tag:'Song: run faster',kind:'song',song:'speed'},
    {id:'lullaby',name:'Lullaby',short:'Lullaby',lvl:4,mana:8,cast:0,cd:[10,7,0.3],range:70,col:'#e0c3ff',tgt:1,tag:'Sleep',kind:'mez',dur:[9,0.2]},
    {id:'chant',name:'Chant of Blades',short:'Chant',lvl:5,mana:5,cast:0,cd:[2,2,0],col:'#cfd6e0',tgt:0,tag:'Song: swing faster',kind:'song',song:'haste'},
    {id:'discord',name:'Discord',short:'Discord',lvl:6,mana:5,cast:0,cd:[2,2,0],col:'#8a6ad0',tgt:0,tag:'Song: mobs attack slower',kind:'song',song:'discord',radius:32},
    {id:'crescendo',name:'Crescendo',short:'Cresc',lvl:8,mana:12,cast:0,cd:[60,40,2],col:'#ffd27a',tgt:0,tag:'Big final pulse',kind:'crescendo',power:4}]}
};
CLASSES.druid.caster=1;

// Skill tree forks (owner, Nov 18-19; plan in docs/research/progression-and-retention.md). At level 10 and every even level
// after, one ability gets a fork: pick one of two versions. "set" is copied over the ability's own numbers when that side is
// picked; the extra fields (thorns, splash, sweep, ...) are read in combat.js. Both sides are a bit stronger than the base
// ability and about equal to each other: they differ by situation (one mob vs many, long fights vs packs).
// Level 12 and 14 forks (v0.44) are in too; they can be tried with ?level=12 / ?level=14 or the DEV panel until the cap passes 10.
const FORKS={
  necro:[{lvl:10,ab:'raise',opts:[
    {id:'a',name:'Bone Pair',desc:'One cast raises two skeletons, each a bit over half as strong. The second one picks up any extra mob that hits you.',set:{pet:{name:'skeleton',img:'pet',hp:[18,8.4],dmg:[1.9,1],ac:6,pair:1}}},
    {id:'b',name:'Bone Knight',desc:'One tougher skeleton (half again the health, more armor, about the same damage). Every 8s it taunts back any mob that turned on you.',set:{pet:{name:'bone knight',img:'pet',hp:[45,21],dmg:[3.1,1.6],ac:12,taunt:8,say:'A bone knight in rusted plate claws its way out of the ground.'}}}]},
  {lvl:12,ab:'plague',opts:[
    {id:'a',name:'Leaping Plague',desc:'When the plagued mob dies, the rest of the plague jumps to the nearest mob that\'s fighting you.',set:{dmg:[4.4,2.2],leap:1}},
    {id:'b',name:'Twin Plague',desc:'Stacks twice on one mob (each copy a bit weaker): cast it again while it\'s still on.',set:{dmg:[2.6,1.3],stack:2}}]},
  {lvl:14,ab:'tap',opts:[
    {id:'a',name:'Bone Tap',desc:'Lifetap also heals your skeleton for half of what it heals you.',set:{petTap:0.5}},
    {id:'b',name:'Twin Tap',desc:'Lifetap also hits a second mob near your target for half.',set:{twin:0.5}}]}],
  druid:[{lvl:10,ab:'snare',opts:[
    {id:'a',name:'Thornsnare',desc:'The snared mob takes thorn damage every few seconds while it walks. Keep it moving.',set:{thorns:[3,1.2]}},
    {id:'b',name:'Tangle Field',desc:'Also snares every mob near your target, for a little less time.',set:{splash:48,splashX:0.8}}]},
  {lvl:12,ab:'rot',opts:[
    {id:'a',name:'Sap Strength',desc:'The rotting mob hits about 15% softer while the rot lasts.',set:{dmg:[3.15,1.7],weak:0.85}},
    {id:'b',name:'Blight Spores',desc:'The rot also lands on up to 2 mobs near your target, at 60% strength.',set:{spores:2,sporeX:0.6}}]},
  {lvl:14,ab:'mend',opts:[
    {id:'a',name:'Wild Regrowth',desc:'Instant: heals over 8s instead, so you can cast it while kiting.',set:{kind:'hot',cast:0,heal:[4.5,1.8],dur:[8,0]}},
    {id:'b',name:'Verdant Touch',desc:'Slower cast, bigger heal. Healing past full becomes a shield for 8s.',set:{cast:2,heal:[20,8],overShield:1}}]}],
  warrior:[{lvl:10,ab:'bash',opts:[
    {id:'a',name:'Shield Slam',desc:'A longer stun that never misses, so it always breaks a cast.',set:{dur:[3.2,0.16],sure:1}},
    {id:'b',name:'Shield Sweep',desc:'Also stuns every mob in front of you, for a shorter time.',set:{sweep:26,sweepX:0.6}}]},
  {lvl:12,ab:'cleave',opts:[
    {id:'a',name:'Whirlwind',desc:'A wider spin that hits every mob around you, with double threat on each.',set:{radius:34,dmg:[6.6,2.75],threatX:2}},
    {id:'b',name:'Sunder',desc:'A heavy hit on your target that cracks its armor (+20% damage taken, 10s). Mobs beside it take a light hit.',set:{needT:1,mainX:1.8,sideX:0.4,crack:10}}]},
  {lvl:14,ab:'stance',opts:[
    {id:'a',name:'Iron Stance',desc:'Lasts longer and blocks much more (65% less damage), but you hit 25% softer.',set:{dur:[14,0.6],stanceX:0.35,stanceHit:0.75}},
    {id:'b',name:'Retaliation',desc:'Shorter, but every hit you take strikes back at the attacker.',set:{dur:[6,0.3],retal:[4,1.6]}}]}],
  rogue:[{lvl:10,ab:'evade',opts:[
    {id:'a',name:'Ambush',desc:'Evade also stuns your target for 2s, and your next Backstab crits.',set:{evStun:2,evCrit:1.5}}, 
    {id:'b',name:'Feint',desc:'Evade also dazes every mob around you for 2s, so you can handle two.',set:{evDaze:2}}]},
  {lvl:12,ab:'gouge',opts:[
    {id:'a',name:'Blind',desc:'Much longer, but any damage breaks it: park a second mob out of the fight.',set:{dur:[10,0.3],blind:1}},
    {id:'b',name:'Kidney Shot',desc:'A shorter stun on a shorter cooldown, and your next 2 Backstabs work from any side.',set:{dur:[2.5,0.08],cd:[7,4,0.4],kidney:2}}]},
  {lvl:14,ab:'rend',opts:[
    {id:'a',name:'Garrote',desc:'From Hide: stops a caster\'s spell, delays its next one, and bleeds double.',set:{dmg:[4.4,2.2],garrote:2}},
    {id:'b',name:'Lacerate',desc:'Stacks up to 3 times on one mob (each a bit weaker), for long fights.',set:{dmg:[3,1.5],stack:3}}]}],
  cleric:[{lvl:10,ab:'renew',opts:[
    {id:'a',name:'Warding Renew',desc:'While Renew lasts, the next big hit on you is blocked.',set:{ward:1}},
    {id:'b',name:'Radiant Renew',desc:'Each tick also burns every mob near you, not just undead (undead take more).',set:{holyAll:0.6}}]},
  {lvl:12,ab:'hlight',opts:[
    {id:'a',name:'Judgment',desc:'A bigger hit, and the target deals 15% less damage for 6s.',set:{dmg:[7.5,3],weak:0.85,weakT:6}},
    {id:'b',name:'Holy Nova',desc:'Light bursts around you: hits every mob near you and heals you a little per mob hit.',set:{kind:'cleave',tgt:0,radius:36,dmg:[5,2],tapPer:[2.5,1]}}]},
  {lvl:14,ab:'aura',opts:[
    {id:'a',name:'Divine Shelter',desc:'You also heal over time while you\'re immune.',set:{shelter:[10,4]}},
    {id:'b',name:'Divine Wrath',desc:'When the aura ends, holy light blasts every mob near you.',set:{wrath:[14,5.5],wrathR:40}}]}],
  enchanter:[{lvl:10,ab:'mez',opts:[
    {id:'a',name:'Deep Sleep',desc:'One mob sleeps much longer, and the first hit doesn\'t wake it.',set:{dur:[36,0.6],deep:1}},
    {id:'b',name:'Mass Mez',desc:'Up to 3 mobs near the first one fall asleep, for a shorter time.',set:{mass:3,dur:[12,0.2]}}]},
  {lvl:12,ab:'charm',opts:[
    {id:'a',name:'Lasting Charm',desc:'The charm lasts much longer.',set:{dur:[40,2.5]}},
    {id:'b',name:'Thrall',desc:'Normal length, but when it ends the mob falls asleep for 6s and then walks home instead of turning on you.',set:{thrall:6}}]},
  {lvl:14,ab:'slow',opts:[
    {id:'a',name:'Deep Slow',desc:'A stronger slow (mobs attack half as often), and slowed mobs take 25% more from Mind Rot.',set:{slowX:2,deepSlow:1.25}},
    {id:'b',name:'Mind Drain',desc:'The normal slow, and you get mana back while it lasts.',set:{drain:0.02}}]}],
  paladin:[{lvl:10,ab:'consec',opts:[
    {id:'a',name:'Sanctuary',desc:'A smaller circle with a stronger heal, and you take 20% less damage inside it.',set:{radius:18,heal:[3.2,1.3],sanct:0.8}},
    {id:'b',name:'Wide Consecrate',desc:'A bigger circle that burns any mob, not just undead. Heals a little less.',set:{radius:38,all:1,heal:[1.6,0.65],dmg:[3,1.1]}}]},
  {lvl:12,ab:'taunt',opts:[
    {id:'a',name:'Challenge',desc:'Taunts every mob fighting near you.',set:{aoe:40}},
    {id:'b',name:'Rebuke',desc:'One mob, and it deals 20% less damage for 8s.',set:{weak:0.8,weakT:8}}]},
  {lvl:14,ab:'dstrike',opts:[
    {id:'a',name:'Crusader Strike',desc:'One heavy hit on your target that heals you for 30% of the damage.',set:{single:1,dmg:[15,6],healPct:0.3}},
    {id:'b',name:'Divine Storm',desc:'A wider circle all around you, lighter hits.',set:{radius:36,dmg:[5.6,2.25]}}]}],
  shadowknight:[{lvl:10,ab:'dcleave',opts:[
    {id:'a',name:'Reaping Cleave',desc:'Heals much more per mob hit, but needs two or more mobs next to you.',set:{tapPer:[6.4,2.4],need2:1}},
    {id:'b',name:'Rending Blow',desc:'One big hit on your target with a solid heal.',set:{single:1,dmg:[11,4.3],tapPer:[6,2.2]}}]},
  {lvl:12,ab:'disease',opts:[
    {id:'a',name:'Plague Cloud',desc:'Also spreads to up to 3 mobs near your target, at 70% strength.',set:{spores:3,sporeX:0.7}},
    {id:'b',name:'Withering Cloud',desc:'One mob: it hits 15% softer, and your Siphon heals half again as much off it.',set:{dmg:[3.3,1.5],weak:0.85,wither:1.5}}]},
  {lvl:14,ab:'minion',opts:[
    {id:'a',name:'Ghoul',desc:'A tougher minion that taunts back any mob that turns on you every 8s.',set:{pet:{name:'ghoul',img:'minion',hp:[30,13],dmg:[2.2,1.1],ac:8,taunt:8,say:'A ghoul drags itself up out of the dirt.'}}},
    {id:'b',name:'Wraith',desc:'A fragile wraith whose hits heal you.',set:{pet:{name:'wraith',img:'minion',hp:[11,5],dmg:[3,1.5],ac:1,tap:0.6,say:'A wraith rises, cold and hungry, at your side.'}}}]}],
  wizard:[{lvl:10,ab:'shatter',opts:[
    {id:'a',name:'Deep Shatter',desc:'A bigger single hit.',set:{dmg:[34,11.7]}},
    {id:'b',name:'Shatter Burst',desc:'Splashes 40% onto every mob near the target and chills them.',set:{burstR:30,burstX:0.4}}]},
  {lvl:12,ab:'nova',opts:[
    {id:'a',name:'Deep Freeze',desc:'Freezes twice as long, less damage: sets up a kite.',set:{root:[6,0.4],dmg:[4,1.6]}},
    {id:'b',name:'Nova Blast',desc:'More damage and knocks mobs back, with a short freeze.',set:{dmg:[9,3.6],knock:20,root:[1.5,0.1]}}]},
  {lvl:14,ab:'fireball',opts:[
    {id:'a',name:'Pyroblast',desc:'A longer cast and a huge hit.',set:{cast:3.5,mana:24,dmg:[36,13]}},
    {id:'b',name:'Living Bomb',desc:'A fast cast that burns over 9s, then explodes onto every mob near the target.',set:{cast:1,dmg:[8,3],bombDot:[3,1.1],bombBoom:[12,4.5],bombR:36}}]}],
  magician:[{lvl:10,ab:'detonate',opts:[
    {id:'a',name:'Volatile',desc:'A bigger blast.',set:{dmg:[24,9.6]}},
    {id:'b',name:'Rebirth',desc:'A slightly smaller blast, but your next summon is instant and free.',set:{dmg:[18,7.2],rebirth:1}}]},
  {lvl:12,ab:'burnout',opts:[
    {id:'a',name:'Overdrive',desc:'Your pet attacks much faster for a shorter time, and loses a little health each second.',set:{dur:[10,0],petHaste:1.8,petDrain:0.02}},
    {id:'b',name:'Wildfire',desc:'The normal speed-up, and your pet\'s hits splash 40% onto mobs near its target.',set:{petSplash:0.4}}]},
  {lvl:14,ab:'fshield',opts:[
    {id:'a',name:'Inferno Shield',desc:'A stronger shield on you.',set:{val:[3,1.2]}},
    {id:'b',name:'Shared Flames',desc:'The shield goes on your pet: mobs hitting it burn (on you when no pet is out).',set:{val:[2.6,1.05],onPet:1}}]}],
  ranger:[{lvl:10,ab:'trap',opts:[
    {id:'a',name:'Barbed Trap',desc:'A bigger hit and a long, deep bleed on the mob that steps in.',set:{dmg:[20,7.5],bleed:[5.4,2.5],bleedT:18}},
    {id:'b',name:'Blast Trap',desc:'Hits every mob near the trap and knocks them back.',set:{blast:30,knock:24}}]},
  {lvl:12,ab:'volley',opts:[
    {id:'a',name:'Rain of Arrows',desc:'Wider and longer, lighter hits.',set:{radius:32,dur:[6,0],dmg:[3.2,1.3]}},
    {id:'b',name:'Pinning Volley',desc:'Same size; every mob it hits is rooted for 3s once.',set:{dmg:[4.2,1.7],pin:3}}]},
  {lvl:14,ab:'disengage',opts:[
    {id:'a',name:'Recoil Shot',desc:'Hop back and fire a free shot that snares.',set:{recoil:5}},
    {id:'b',name:'Double Hop',desc:'Two hops stored, for long kites.',set:{charges:2}}]}],
  monk:[{lvl:10,ab:'mfeign',opts:[
    {id:'a',name:'Perfect Split',desc:'When you stand up, the mob you kept is stunned for 2s.',set:{standStun:2}},
    {id:'b',name:'Still Water',desc:'You get health and mana back fast while you lie there: a rest in the middle of a fight.',set:{still:0.08}}]},
  {lvl:12,ab:'flurry',opts:[
    {id:'a',name:'Hundred Fists',desc:'More punches on one mob.',set:{hits:7,dmg:[2.4,1]}},
    {id:'b',name:'Whirling Flurry',desc:'Six punches spread across every mob around you.',set:{hits:6,spread:24}}]},
  {lvl:14,ab:'fkick',opts:[
    {id:'a',name:'Tiger Leap',desc:'If the mob you leap at dies within 3s, Flying Kick is ready again.',set:{dmg:[6.6,2.6],tiger:3}},
    {id:'b',name:'Crane Kick',desc:'Landing stuns every mob near you for 1.5s.',set:{crane:1.5,craneR:24}}]}],
  shaman:[{lvl:10,ab:'drowsy',opts:[
    {id:'a',name:'Torpor',desc:'A stronger attack slow on one mob.',set:{aslowX:1.75}},
    {id:'b',name:'Drowsy Cloud',desc:'A weaker slow on every mob near your target.',set:{splash:40,aslowX:1.3}}]},
  {lvl:12,ab:'swarm',opts:[
    {id:'a',name:'Locust Swarm',desc:'When its mob dies, the swarm jumps to the nearest mob that\'s fighting you.',set:{leap:1}},
    {id:'b',name:'Stinging Swarm',desc:'A bit stronger, and it counts as two DoTs for your stacking bonus.',set:{dmg:[4.4,2.2],cnt:2}}]},
  {lvl:14,ab:'totem',opts:[
    {id:'a',name:'Toxic Totem',desc:'A stronger poison on every mob near it.',set:{dmg:[5.2,2.1]}},
    {id:'b',name:'Mending Totem',desc:'Heals you while you stand near it, and poisons one mob.',set:{heal:[3,1.2],one:1}}]}],
  bard:[{lvl:10,ab:'crescendo',opts:[
    {id:'a',name:'Finale',desc:'A bigger final pulse. Your songs end.',set:{power:5.5}},
    {id:'b',name:'Encore',desc:'A smaller pulse, and your songs keep playing.',set:{power:2.6,keep:1}}]},
  {lvl:12,ab:'chant',opts:[
    {id:'a',name:'Bladesong',desc:'Your swings also hit one mob next to your target, for half.',set:{blade:0.5}},
    {id:'b',name:'Battle Tempo',desc:'Swing speed keeps building through a long fight, up to twice as fast.',set:{tempo:1}}]},
  {lvl:14,ab:'dirge',opts:[
    {id:'a',name:'Dirge of Ruin',desc:'Damage builds the longer a mob stays near you (up to +75%).',set:{dmg:[3.6,1.8],ruin:1}},
    {id:'b',name:'Requiem',desc:'Weaker, but each mob it kills heals you.',set:{dmg:[3,1.5],requiem:0.15}}]}]
};

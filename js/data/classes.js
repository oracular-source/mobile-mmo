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
    {id:'mendb',name:'Mend Bones',short:'MendB',lvl:8,mana:10,cast:1,cd:[10,6,0.4],col:'#e8e2cf',tgt:0,tag:'Pet heal',kind:'petheal',heal:[20,8]}]}
};
CLASSES.druid.caster=1;

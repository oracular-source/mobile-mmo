"""Shot list for the teaser (see docs/board.md, Next 0). Each shot is one page load of the real game.
setup runs once (JS), tick runs every frame with i = frame number. Coordinates are game pixels in that area's map."""

TITLE = 'ASHFEN HOLLOW'
VERSION = 'Prototype v0.68'

def ov(text, y, size, a, b, col='#ffe9a8', band=False, w='700', font='DejaVu Serif'):
    return "__ov.push({text:%r,y:%s,size:%s,from:%d,to:%d,col:%r,band:%s,w:%r,font:%r});" % (
        text, y, size, a, b, col, 'true' if band else 'false', w, font)

def cap(text, a, b, y=0.16, size=20):   # caption band near the top
    return ov(text, y, size, a, b, band=True)

SHOTS = [
    # 1. Dusk over the crossroads: the camera drifts up the road from Town 1's gate to the campfire; players heading out.
    dict(name='s1_title', cls='druid', area='crossroads', level=5, frames=165, zoom=999, fin=15, warm=20,
         setup="H.quiet();H.god();__hideHero=true;H.at(330,420);"
               "addFake('warrior','Kael',405,690,{fight:false,path:[{x:405,y:560},{x:380,y:470},{x:340,y:430}]});"
               "addFake('cleric','Brother Tam',380,760,{fight:false,path:[{x:395,y:580},{x:372,y:480},{x:322,y:430}]});"
               "addFake('wizard','Morwen',428,820,{fight:false,path:[{x:420,y:600},{x:390,y:490},{x:350,y:440}]});"
               "addFake('bard','Oona',318,412,{fight:false,sit:true,dir:1});addFake('ranger','Juniper',342,416,{fight:false,sit:true,dir:-1});"
               + ov(TITLE, 0.30, 34, 45, 175) + ov('a mobile MMO prototype', 0.355, 14, 60, 175, col='#c9c2ae', w='400'),
         tick="const k=Math.min(1,i/150),e=k*k*(3-2*k);H.cam(400-60*e,650-220*e);"),

    # 2. Real phone screen: a Druid tab-targeting grave rats, other players fighting their own rats nearby.
    dict(name='s2_rats', cls='druid', area='crossroads', level=6, frames=130, zoom=150, hud=True, warm=10,
         setup="H.quiet();H.god();__heroName='Thistle';H.at(420,600);H.fight({abis:['rot','thorn'],range:62,R:110});"
               "addFake('warrior','Kael',500,585,{dmg:6});addFake('rogue','Vex',350,585,{dmg:5});"
               + cap('Tab-target combat · one thumb', 5, 125, y=0.36, size=17)),

    # 3. Fast cut through classes.
    dict(name='s3a_necro', cls='necro', area='graveyard', level=9, frames=70, zoom=150, warm=110, fin=3, fout=3,
         setup="H.quiet();H.god();__heroName='Grimsby';H.at(456,545);B.use('raise');"
               "H.only(m=>Math.hypot(m.x-460,m.y-580)<90);"
               + cap('14 classes', 0, 69, y=0.16, size=20) + ov('Necromancer', 0.70, 22, 0, 69, col='#9be37a'),
         tick="if(i===0){H.fight({abis:['plague','tap'],range:60,R:140});}"),
    dict(name='s3b_wizard', cls='wizard', area='wolfwood', level=12, frames=70, zoom=150, warm=6, fin=3, fout=3,
         setup="H.quiet();H.god();__heroName='Morwen';H.at(870,700);H.only(m=>Math.hypot(m.x-850,m.y-660)<60);"
               "mobs.forEach(m=>{if(!m.dead){m.x+=8;m.y+=18}});H.fight({abis:['nova','shatter','freeze','frost'],range:60,R:160});"
               + cap('14 classes', 0, 69, y=0.16, size=20) + ov('Wizard', 0.70, 22, 0, 69, col='#9fd0ff')),
    dict(name='s3c_warrior', cls='warrior', area='crypt', level=12, frames=70, zoom=150, warm=6, fin=3, fout=6,
         setup="H.quiet();H.god();__heroName='Kael';H.at(344,345);H.only(m=>Math.hypot(m.x-344,m.y-330)<75);"
               "mobs.forEach(m=>{if(!m.dead){m.state='chase';m.x=344+(m.x-344)*0.4;m.y=342+(m.y-330)*0.4}});"
               "H.fight({abis:['cleave','stance','bash','strike'],range:20,R:80});"
               + cap('14 classes', 0, 69, y=0.16, size=20) + ov('Warrior', 0.70, 22, 0, 69, col='#ff9a7a'),
         tick="mobs.forEach(m=>{if(!m.dead)m.hp=Math.max(m.hp,m.maxhp*0.35)});"),

    # 4. The crypt: a group takes on the Skeleton King (his shadow bolt telegraph, his skeletons at half health).
    dict(name='s4_king', cls='paladin', area='crypt', level=12, frames=240, zoom=150, warm=6,
         setup="H.quiet();H.god();__heroName='Dunmore';H.at(500,200);"
               "H.only(m=>m.type==='boss1');window.K=mobs.find(m=>m.type==='boss1'&&!m.dead);"
               "H.fight({abis:['dstrike','hbash','smiteu','pstrike'],range:20,R:200});"
               "addFake('warrior','Kael',470,214,{dmg:9,slot:3.6});addFake('wizard','Morwen',540,236,{dmg:12,slot:0.4,bigEvery:3});"
               "addFake('magician','Fizzwick',460,240,{dmg:11,slot:2.6,bigEvery:3.5});addFake('cleric','Brother Tam',514,250,{dmg:6,slot:1.4,healT:player});"
               "__fakes.forEach(f=>{f.target=K;f.aggro=300});engage(K);K.def=Object.assign({},K.def,{name:'the Skeleton King'});curArea().lights.push({x:500,y:150,r:120,w:14});"
               + cap('The Skeleton King', 8, 235) + ov('Shadow Bolt · raises his guard', 0.21, 13, 30, 235, col='#d8b8ff', w='400'),
         tick="H.track(K,i,10,225);if(i===8)K.bolt=0.2;"),

    # 5. Wolfwood: Greyfang howls in his pack.
    dict(name='s5_greyfang', cls='shadowknight', area='wolfwood', level=12, frames=190, zoom=150, warm=6,
         setup="H.quiet();H.god();__heroName='Sable';window.G=mobs.find(m=>m.type==='greyfang');"
               "H.only(m=>m===G||Math.hypot(m.x-G.x,m.y-G.y)<40);G.sp.route=null;H.at(G.x+10,G.y+70);"
               "H.fight({abis:['dcleave','harm','siphon','sstrike'],range:20,R:200});player.target=G;"
               "addFake('ranger','Juniper',G.x-30,G.y+92,{dmg:9,slot:0.2,bigEvery:3});addFake('druid','Thistle',G.x+42,G.y+96,{dmg:8,slot:2.8,bigEvery:3});"
               "addFake('shaman','Brann',G.x-14,G.y+104,{dmg:9,slot:4,bigEvery:3});addFake('enchanter','Isolde',G.x+20,G.y+112,{dmg:7,slot:1.2,bigEvery:3});"
               + cap("Greyfang · he howls in his pack", 8, 185),
         tick="H.track(G,i,10,175);mobs.forEach(m=>{if(!m.dead&&m!==G)m.hp=Math.max(m.hp,m.maxhp*(i<130?0.5:0))});"),

    # 6. Dungeon 1: the Drowned Prior (Grasp of the Deep), the Bellringer (the Toll), Brother Malrec (Candle Wake).
    dict(name='s6a_prior', cls='warrior', area='dungeon1', level=15, frames=180, zoom=150, warm=6,
         setup="H.quiet();H.god();__heroName='Kael';window.P=mobs.find(m=>m.type==='prior');"
               "H.only(m=>m===P);H.at(P.x,P.y+50);player.target=P;engage(P);P.graspCd=0.6;"
               "H.fight({abis:['cleave','bash','strike'],range:20,R:200});"
               "addFake('necro','Grimsby',P.x-40,P.y+60,{dmg:9,slot:2.6,bigEvery:3});addFake('wizard','Morwen',P.x+40,P.y+62,{dmg:12,slot:0.5,bigEvery:3});"
               "addFake('cleric','Brother Tam',P.x,P.y+80,{dmg:6,slot:1.6,healT:player});__fakes.forEach(f=>{f.target=P;f.aggro=300});"
               + cap('The Drowned Prior', 8, 175) + ov('Grasp of the Deep', 0.21, 13, 20, 175, col='#9fd8c0', w='400'),
         tick="H.track(P,i,10,170);if(i===95)P.graspCd=0.1;"),
    dict(name='s6b_bell', cls='monk', area='dungeon1_f2', level=15, frames=140, zoom=150, warm=6,
         setup="H.quiet();H.god();__heroName='Pell';window.BR=mobs.find(m=>m.type==='bellringer');"
               "H.only(m=>m===BR);H.at(BR.x,BR.y+40);player.target=BR;engage(BR);BR.tollCd=0.8;"
               "H.fight({abis:['dragon','flurry','fkick','palm'],range:20,R:200});"
               "addFake('paladin','Dunmore',BR.x-24,BR.y+30,{dmg:8,slot:3});addFake('magician','Fizzwick',BR.x+44,BR.y+50,{dmg:11,slot:0.3,bigEvery:2.5});"
               "addFake('shaman','Brann',BR.x-40,BR.y+56,{dmg:9,slot:2.2,bigEvery:2.5});__fakes.forEach(f=>{f.target=BR;f.aggro=300});"
               + cap('The Bellringer', 8, 135) + ov('The Toll', 0.21, 13, 20, 135, col='#ffd27a', w='400'),
         tick="H.track(BR,i,10,130);if(i===80)BR.tollCd=0.1;"),
    dict(name='s6c_malrec', cls='warrior', area='dungeon1_f2', level=15, frames=230, zoom=150, warm=6,
         setup="H.quiet();H.god();__heroName='Kael';window.M=mobs.find(m=>m.type==='malrec');"
               "H.only(m=>m.type==='malrec'||m.type==='deacon');H.at(264,150);player.target=M;"
               "H.fight({abis:['cleave','bash','strike'],range:20,R:200});"
               "addFake('cleric','Brother Tam',250,190,{dmg:6,slot:1.5,healT:player});addFake('wizard','Morwen',290,186,{dmg:12,slot:0.6,bigEvery:3});"
               "addFake('necro','Grimsby',236,176,{dmg:9,slot:2.6,bigEvery:3});addFake('shaman','Brann',280,166,{dmg:9,slot:5.5,bigEvery:3});"
               + cap('Brother Malrec', 8, 225) + ov('Candle Wake: stop the wisps', 0.21, 13, 30, 225, col='#ffd27a', w='400'),
         tick="H.track(M,i,10,210);mobs.forEach(m=>{if(!m.dead&&m.type==='deacon')m.hp=Math.max(m.hp,m.maxhp*(i<160?0.3:0))});"
              "mobs.forEach(m=>{if(!m.dead&&m.type==='cwisp')m.hp=Math.max(m.hp,m.maxhp*(i<185?0.5:0))});"),

    # 7. More players: the campfire as a hub, the camera pulling back.
    dict(name='s7_together', cls='druid', area='crossroads', level=8, frames=190, zoom=999, warm=20,
         vf="scale=w='trunc(720*(1.45-0.45*min(1\\,t/5.5))/2)*2':h=-2:eval=frame:flags=neighbor,crop=720:1280[v];movie=CAP7,loop=loop=-1:size=1,setpts=N/30/TB,format=rgba,fade=t=in:st=0.7:d=0.3:alpha=1[c];[v][c]overlay=shortest=1",
         caption='Coming in phase 3: play together',
         setup="H.quiet();H.god();__heroName='Thistle';H.at(336,432);H.only(m=>m.type==='beetle'&&m.y<240||Math.hypot(m.x-330,m.y-470)>140);"
               "addFake('bard','Oona',316,414,{fight:false,sit:true,dir:1});addFake('ranger','Juniper',342,418,{fight:false,sit:true,dir:-1});"
               "addFake('cleric','Brother Tam',320,440,{fight:false,sit:true,dir:1});"
               "addFake('warrior','Kael',300,520,{fight:false,path:[{x:320,y:470},{x:350,y:380},{x:360,y:300},{x:340,y:200}]});"
               "addFake('wizard','Morwen',290,530,{fight:false,path:[{x:310,y:480},{x:340,y:390},{x:350,y:310},{x:330,y:210}]});"
               "addFake('rogue','Vex',420,600,{fight:false,path:[{x:400,y:520},{x:380,y:450},{x:300,y:430},{x:200,y:430}]});"
               "addFake('monk','Pell',250,430,{fight:false,path:[{x:330,y:460},{x:410,y:520},{x:410,y:640}]});"
               "addFake('enchanter','Isolde',360,450,{fight:false,sit:true,dir:-1});"
               "",
         tick="H.cam(334,440);"),

    # 8. End card.
    dict(name='s8_end', cls='druid', area='crossroads', level=8, frames=120, zoom=999, warm=20, fin=10, fout=20,
         setup="H.quiet();H.god();__hideHero=true;H.at(334,470);H.only(m=>false);"
               "addFake('bard','Oona',316,414,{fight:false,sit:true,dir:1});addFake('ranger','Juniper',342,418,{fight:false,sit:true,dir:-1});"
               "addFake('cleric','Brother Tam',320,440,{fight:false,sit:true,dir:1});addFake('enchanter','Isolde',360,450,{fight:false,sit:true,dir:-1});"
               "__names=null;"
               + "__ov.push({dim:0.5,from:0,to:200});" + ov(TITLE, 0.42, 30, 0, 200) + ov(VERSION, 0.48, 15, 10, 200, col='#c9c2ae', w='400')
               + ov('EverQuest-style, made for phones', 0.515, 12, 18, 200, col='#9a937f', w='400'),
         tick="H.cam(334,432);"),
]

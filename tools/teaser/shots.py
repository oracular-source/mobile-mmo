"""Shot list for the teaser, draft 3 (owner notes, Nov 21-22; see docs/board.md). Each shot is one page load of the real game.
setup runs once (JS), tick runs every frame with i = frame number (negative during warm-up, so most shots open mid-fight).
Coordinates are game pixels in that area's map.

Draft 3 rules: no boss ever dies on camera (H.band keeps its health inside a sliding window, so we see the middle of the
fight and cut away); fights open already going and end before they're over; the Skeleton King is a quick flash, the Drowned
Prior gets the time (two Grasps: the hero steps off the first, the second catches him); no Bellringer, no Malrec; several
players of different classes in nearly every shot; the end card is just the title."""

TITLE = 'ASHFEN HOLLOW'

def ov(text, y, size, a, b, col='#ffe9a8', band=False, w='700', font='DejaVu Serif'):
    return "__ov.push({text:%r,y:%s,size:%s,from:%d,to:%d,col:%r,band:%s,w:%r,font:%r});" % (
        text, y, size, a, b, col, 'true' if band else 'false', w, font)

def cap(text, a, b, y=0.16, size=20):   # caption band near the top
    return ov(text, y, size, a, b, band=True)

SHOTS = [
    # 1. Dusk over the crossroads: the camera drifts up the road to the campfire. A group of three heads out together
    #    (two following the leader's footsteps), a fourth jogs to catch up, two rest by the fire.
    dict(name='s1_title', cls='druid', area='crossroads', level=5, frames=170, zoom=999, fin=15, warm=30,
         setup="H.quiet();H.god();__hideHero=true;H.at(330,420);"
               "const K=addFake('warrior','Kael',400,636,{fight:false,spd:33,path:[{x:404,y:560},{x:384,y:470},{x:350,y:420},{x:340,y:330}]});"
               "addFake('cleric','Brother Tam',388,646,{fight:false,follow:K,slot:2.4,lag:0.6});"
               "addFake('wizard','Morwen',414,648,{fight:false,follow:K,slot:0.7,lag:0.9});"
               "addFake('rogue','Vex',452,646,{fight:false,spd:34,reactT:0,path:[{x:446,y:640,wait:0.9},{x:412,y:600,run:1},{x:392,y:500,run:1},{x:360,y:430}]});"
               "addFake('bard','Oona',318,412,{fight:false,sitting:true,sitStay:1,dir:1});addFake('ranger','Juniper',344,418,{fight:false,sitting:true,sitStay:1,dir:-1});"
               + ov(TITLE, 0.30, 34, 45, 180) + ov('a mobile MMO prototype', 0.355, 14, 60, 180, col='#c9c2ae', w='400'),
         tick="const k=Math.min(1,Math.max(0,i)/150),e=k*k*(3-2*k);H.cam(400-60*e,650-220*e);"),

    # 2. The real phone screen: a Druid tab-targeting grave rats; two other players each fighting their own rat nearby.
    dict(name='s2_rats', cls='druid', area='crossroads', level=6, frames=150, zoom=150, hud=True, warm=75,
         setup="H.quiet();H.god();__heroName='Thistle';H.at(420,600);H.fight({abis:['rot','thorn'],range:62,R:110,react:0.4});"
               "const mv=(a,b,x,y)=>{const m=mobs.find(m=>!m.dead&&Math.abs(m.x-a)<6&&Math.abs(m.y-b)<6);if(m){m.x=m.hx=x;m.y=m.hy=y}};mv(344,602,392,566);mv(504,602,456,560);H.only(m=>!(Math.abs(m.x-536)<6&&Math.abs(m.y-570)<6));"
               "addFake('warrior','Kael',470,575,{dmg:4,puller:1,aggro:70});addFake('rogue','Vex',372,585,{dmg:3,puller:1,aggro:70});"
               + cap('Tab-target combat · one thumb', 5, 145, y=0.27, size=17),
         tick="if(i<110)H.floor(mobs.filter(m=>m.state==='chase'),0.25);"),

    # 3. A quick cut through classes, each already mid-fight, each with another player beside them.
    dict(name='s3a_necro', cls='necro', area='graveyard', level=9, frames=78, zoom=150, warm=150, fin=3, fout=3,
         setup="H.quiet();H.god();__heroName='Grimsby';H.at(456,545);B.use('raise');"
               "H.only(m=>Math.hypot(m.x-460,m.y-580)<110);"
               "addFake('shaman','Brann',430,560,{dmg:4,puller:1,aggro:130});"
               + cap('14 classes', 0, 77, y=0.16, size=20) + ov('Necromancer', 0.70, 22, 0, 77, col='#9be37a'),
         tick="if(i===-150)H.fight({abis:['plague','tap'],range:60,R:140,react:0.5});H.floor(mobs.filter(m=>m.state==='chase'),0.3);"),
    dict(name='s3b_wizard', cls='wizard', area='wolfwood', level=12, frames=78, zoom=150, warm=60, fin=3, fout=3,
         setup="H.quiet();H.god();__heroName='Morwen';H.at(870,700);H.only(m=>Math.hypot(m.x-850,m.y-660)<60);"
               "mobs.forEach(m=>{if(!m.dead){m.x+=8;m.y+=18}});H.fight({abis:['nova','shatter','freeze','frost'],range:60,R:160,react:0.3});"
               "window.__tank=addFake('paladin','Dunmore',880,690,{dmg:4});"
               + cap('14 classes', 0, 77, y=0.16, size=20) + ov('Wizard', 0.70, 22, 0, 77, col='#9fd0ff'),
         tick="H.floor(mobs.filter(m=>m.state==='chase'),0.3);"),
    dict(name='s3c_warrior', cls='warrior', area='crypt', level=12, frames=78, zoom=150, warm=60, fin=3, fout=6,
         setup="H.quiet();H.god();__heroName='Kael';H.at(344,345);H.only(m=>Math.hypot(m.x-344,m.y-330)<75);"
               "mobs.forEach(m=>{if(!m.dead){m.state='chase';m.x=344+(m.x-344)*0.5;m.y=342+(m.y-330)*0.5}});"
               "H.fight({abis:['cleave','stance','bash','strike'],range:20,R:80,react:0.2});"
               "addFake('cleric','Brother Tam',330,395,{dmg:3,noRest:1});"
               + cap('14 classes', 0, 77, y=0.16, size=20) + ov('Warrior', 0.70, 22, 0, 77, col='#ff9a7a'),
         tick="H.floor(mobs.filter(m=>!m.dead),0.35);"),

    # 4. A flash of the Skeleton King mid-fight: the Paladin holds him, the group burns him, his Shadow Bolt bar comes up.
    dict(name='s4_king', cls='paladin', area='crypt', level=12, frames=125, zoom=150, warm=150,
         setup="H.quiet();H.god();__heroName='Dunmore';H.at(500,200);"
               "H.only(m=>m.type==='boss1');window.K=mobs.find(m=>m.type==='boss1'&&!m.dead);"
               "H.fight({abis:['dstrike','hbash','smiteu','pstrike'],range:20,R:200,react:0.2});"
               "addFake('warrior','Kael',470,214,{dmg:7,slotA:3.4,assist:player});addFake('wizard','Morwen',540,236,{dmg:9,bigEvery:4,assist:player,slotA:0.5});"
               "addFake('magician','Fizzwick',460,240,{dmg:8,bigEvery:5,assist:player,slotA:-0.5});addFake('cleric','Brother Tam',514,250,{dmg:4,assist:player,noRest:1});"
               "__fakes.forEach(f=>{f.target=K});engage(K);K.def=Object.assign({},K.def,{name:'the Skeleton King'});curArea().lights.push({x:500,y:150,r:120,w:14});"
               + cap('The Skeleton King', 6, 120),
         tick="H.band(K,i,-150,125,0.86,0.64);if(i===20)K.bolt=0.2;H.follow(K,0,48,0.08);"),

    # 5. Wolfwood: the Ranger pulls Greyfang, he howls his pack in, the Warrior picks them up and the group falls in behind.
    dict(name='s5_greyfang', cls='shadowknight', area='wolfwood', level=12, frames=215, zoom=150, warm=15,
         setup="H.quiet();H.god();__heroName='Sable';window.G=mobs.find(m=>m.type==='greyfang');"
               "H.only(m=>m===G||Math.hypot(m.x-G.x,m.y-G.y)<40);G.sp.route=null;H.at(G.x+16,G.y+92);"
               "H.fight({abis:['dcleave','harm','siphon','sstrike'],range:20,R:200,react:0.6,engaged:true});"
               "window.__tank=addFake('warrior','Kael',G.x-4,G.y+86,{dmg:6,armor:0.4});"
               "window.J=addFake('ranger','Juniper',G.x-34,G.y+104,{dmg:6,bigEvery:5,puller:1,aggro:170,target:G});"
               "addFake('druid','Thistle',G.x+40,G.y+108,{dmg:6,bigEvery:5,aggro:170});addFake('shaman','Brann',G.x-14,G.y+118,{dmg:6,bigEvery:5,aggro:170,heals:1});"
               "addFake('enchanter','Isolde',G.x+22,G.y+122,{dmg:5,bigEvery:5,aggro:170});"
               "__fakes.forEach(f=>{if(f!==J){f.fight=false}});"
               + cap('Greyfang · he howls in his pack', 8, 210),
         tick="if(i===-15)window.__camF=null;"
              "if(G.state==='chase'&&!window.__go){window.__go=1;G.fakeT=__tank;__fakes.forEach((f,k)=>{if(!f.fight){f.fight=true;f.reactT=0.25+k*0.15}})}"
              "mobs.forEach(m=>{if(!m.dead&&m!==G){if(G.state==='chase'&&!m.fakeT)m.fakeT=__tank;H.floor([m],0.4)}});H.band(G,i,0,215,0.97,0.7);"
              "H.follow({x:(G.x+__tank.x)/2,y:(G.y+__tank.y)/2+18},0,0,0.05);"),

    # 6. Dungeon 1, the Drowned Prior: the door has slammed, the room is flooded, everyone wades. The Warrior holds him; the
    #    hero (a Druid, back with the casters) steps off the first ripple, and the second one catches him: hands drag at his legs.
    dict(name='s6a_prior', cls='druid', area='dungeon1', level=15, frames=280, zoom=150, warm=100,
         setup="H.quiet();H.god();__heroName='Thistle';window.P=mobs.find(m=>m.type==='prior');"
               "H.only(m=>m===P);H.at(P.x+26,P.y+58);player.target=P;"
               "H.fight({abis:['rot','thorn'],range:62,R:200,react:0.3,dodgeLate:0.25});"
               "window.__tank=addFake('warrior','Kael',P.x,P.y+18,{dmg:6,armor:0.4,target:P,slotA:1.57});"
               "addFake('necro','Grimsby',P.x-42,P.y+58,{dmg:7,bigEvery:5,target:P});addFake('wizard','Morwen',P.x-10,P.y+70,{dmg:8,bigEvery:4.5,target:P});"
               "addFake('cleric','Brother Tam',P.x+50,P.y+74,{dmg:4,target:P,noRest:1});"
               "H.tankOn(P,__tank);P.graspCd=99;"
               + cap('The Drowned Prior', 8, 275) + ov('Grasp of the Deep', 0.21, 13, 30, 275, col='#9fd8c0', w='400'),
         tick="H.band(P,i,-100,280,0.86,0.6);P.fakeT=__tank;H.follow(P,8,46,0.05);"
              "if(i===24)P.graspCd=0.01;if(i===150){P.graspCd=0.01;__hf.dodge=false}if(i===240)__hf.dodge=true;"
              "if(i>0&&!P.casting&&P.graspCd<1&&i<150)P.graspCd=99;"),

    # 7. The campfire as a hub: people resting, a pair heading out, one arriving, the camera pulling back.
    dict(name='s7_together', cls='druid', area='crossroads', level=8, frames=195, zoom=999, warm=40,
         vf="scale=w='trunc(720*(1.45-0.45*min(1\\,t/5.5))/2)*2':h=-2:eval=frame:flags=neighbor,crop=720:1280[v];movie=CAP7,loop=loop=-1:size=1,setpts=N/30/TB,format=rgba,fade=t=in:st=0.7:d=0.3:alpha=1[c];[v][c]overlay=shortest=1",
         caption='Coming in phase 3: play together',
         setup="H.quiet();H.god();__heroName='Thistle';H.at(336,432);H.only(m=>m.type==='beetle'&&m.y<240||Math.hypot(m.x-330,m.y-470)>140);"
               "addFake('bard','Oona',316,414,{fight:false,sitting:true,sitStay:1,dir:1});addFake('ranger','Juniper',342,418,{fight:false,sitting:true,sitStay:1,dir:-1});"
               "addFake('cleric','Brother Tam',320,442,{fight:false,sitting:true,sitStay:1,dir:1});"
               "const K=addFake('warrior','Kael',300,520,{fight:false,path:[{x:320,y:470},{x:350,y:380},{x:360,y:300},{x:340,y:200}]});"
               "addFake('wizard','Morwen',286,534,{fight:false,follow:K,slot:2.2,lag:0.7});"
               "addFake('rogue','Vex',470,520,{fight:false,path:[{x:420,y:480,run:1},{x:372,y:452},{x:362,y:446}],endSit:-1});"
               "addFake('monk','Pell',250,430,{fight:false,path:[{x:300,y:460},{x:380,y:520},{x:410,y:640}]});"
               "addFake('enchanter','Isolde',360,452,{fight:false,sitting:true,sitStay:1,dir:-1});",
         tick="H.cam(334,440);"),

    # 8. End card: just the title (owner: no version number, no tagline).
    dict(name='s8_end', cls='druid', area='crossroads', level=8, frames=110, zoom=999, warm=20, fin=10, fout=20,
         setup="H.quiet();H.god();__hideHero=true;H.at(334,470);H.only(m=>false);"
               "addFake('bard','Oona',316,414,{fight:false,sitting:true,sitStay:1,dir:1});addFake('ranger','Juniper',342,418,{fight:false,sitting:true,sitStay:1,dir:-1});"
               "addFake('cleric','Brother Tam',320,442,{fight:false,sitting:true,sitStay:1,dir:1});addFake('enchanter','Isolde',360,452,{fight:false,sitting:true,sitStay:1,dir:-1});"
               "__names=null;"
               + "__ov.push({dim:0.5,from:0,to:200});" + ov(TITLE, 0.45, 30, 0, 200),
         tick="H.cam(334,432);"),
]

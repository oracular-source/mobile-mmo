# Map format: maps as text, checked by a script

Since Nov 18, 2026, every area map is a plain-text file. One character is one tile, so Claude can design, edit and review a map the way it edits any other file, and a checker script catches placement mistakes before the owner sees anything. **The game loads them** (since v0.22, `js/area.js`). In the game now: `crossroads` (where the game starts), `rat_tunnel`, `graveyard`, `crypt`, `wolfwood` (since v0.40) and `chapel` (since v0.62); `?area=<map>` starts in one, DEV → Teleport reaches each.

## Where things live
- `js/data/tiles.js`: the shared tables. `TILESET` (each tile character: name, walkable or not, colour, tags) and `OBJECTS` (buildings and props: size in tiles, how much open ground they need around them, which side the door is on, light radius). Add a tile or object here once and every map can use it.
- `js/data/maps/<area>.js`: one file per area (`graveyard.js`, `crypt.js`). Plain data, game-ready: each adds itself to `MAPS`.
- `js/area.js`: the game side. Reads a map file, paints its pixel-art ground once (tile and prop drawings in the moonlit palette), and builds its walk map, lights, spawns, fog and exits. A new tile or object needs a drawing here as well as a line in `tiles.js`.
- `tools/mapcheck.py`: the checker. It checks every rule below, then draws two pictures: the whole map with a coordinate ruler, and one phone screen at game scale from the way in.

## A map file
```js
MAPS.graveyard = {
  name: 'Sunken Graveyard', zone: [2, 64], tint: 'moonlit', start: 'east', rules: 'dead-inside',
  tiles: [
    ',,,,TT::TT,,,',   // one string per row, all the same width
  ],
  things: `
obj bell_tower 22 7            # an object from OBJECTS, top-left corner at x y
spawn corpse 4-5 12 27         # mob type, level or level range, x y
named skeleton_king 7 31 6 summon=throne key=crown_shard
rare weeping_bride 33 22
chest 27 41
exit east 47 35 to=crossroads lit
exit sinkhole 38 23 to=rat_tunnel at=mouth   # at = which exit you arrive by on the other side (when a map has two ways to the same place)
fog 9 24 13 13                 # x y width height
label 23 5 Bell tower          # text on the overview picture only
critter crow 22.5 4.9 1 high   # kind x y [how many] [high]: small living things (v0.49), tile units, decimals fine
`
};
```
- `enter` (optional): the chat line when you arrive. `tint`: the area's light, from `AREA_TINT` in `js/area.js` (`moonlit`, `crypt`, `dusk`, `earth`, `wood`).
- Rat holes (`h`) are earth wall with a burrow in its face; the floor tile below each one is where Old Gnawbone's rats come out. Put them where the wall has floor directly below.
- `zone` is where the map's top-left tile sits on the Zone 1 layout (128 × 128).
- `start` names the exit players arrive from; distances and the phone view are measured from there.
- `named ... route=x,y;x,y;...` (optional): a wandering named's loop. The checker makes sure every point is open ground you can reach and draws the loop as a dashed line; `pack=N` is how many wolves walk with it.
- `critter` (v0.49): looks only, never in the way. Kinds: `crow` (flies off when you come close, back once you've gone; `high` = perched up on a fence, roof or statue, drawn over everyone), `frog` (on open ground by water, plops in when you come close), `moth` (circles the light it's placed at; the number is how many), `owl` (sits on a branch, blinks, turns its head to watch you), `firefly` (v0.59: drifts and blinks over a marsh or meadow; the number is how many), `rabbit` (v0.59: nibbles in the grass, bolts for the trees when you come close), `bat` (flutters round the spot), `deer` (v0.81: grazes in a clearing, looks up and watches you, bounds away when you come close), `eyes` (v0.81: a pair of pale eyes under dark trees that blink and vanish when you come near; place them on tree tiles). Ripples on open water and smoke from a shack's chimney need no line. The checker wants frogs on open ground with water near, and moths near a light.
- `bar x y id side` (v0.62): a gate tile that stays shut until you walk up to it from `side` (W, E, N or S); then it opens for good for every character (saved under `ashfen-gates`). From the other side it says it's barred. The chapel's east gate.
- Safe arrival (v0.77): no `spawn`, `named` or `rare` within 4 tiles of any `exit` (you land about 2 tiles off it, and most mobs notice you from about 3). The game also keeps mobs calm for a moment when you arrive.
- Mob camps (v0.62): spawns of mob types with `camp:1` (the cultists) standing within 3 tiles of each other fight as one camp; the first pulled shouts for the nearest other camp within 8 tiles if no wall or fence is in the way.
- `rules: 'dead-inside'` turns on the dead-area check for this map.
- `instance: 1` (Dungeon 1, in the game since v0.63): an instanced area (just you, or your group later). Nothing respawns while you're inside; walking in again is a fresh run (mobs, chests and seals all reset), timed for the run summary. A `chest` in an instance opens once per run, and won't open while a named within 6 tiles of it is still alive (5 before v0.66). **Floors (v0.66):** an instance can be several maps joined by exits (Dungeon 1: `dungeon1` and `dungeon1_f2`). Walking between them keeps the same run: what you killed stays dead, opened seals and chests stay open, the clock keeps running. Walking in from outside starts a fresh run and rebuilds every floor. The way out at the last boss takes you back out the way you came into the first floor. `wake: '...'` is the line you see when you respawn there.
- `seal x0 y0 x1 y1 object` (v0.63): those tiles are shut by a stone slab until you walk up to the first object of that kind. In an instance it shuts again every fresh run. The checker ignores it (it checks the map as if open).
- `finale x0 y0 x1 y1 ring=N` (v0.79, Dungeon 1's sanctum): when the dungeon's end boss (`end`) dies, the finale starts (the Bellringer and the Drowned Prior come back, `js/world.js` startFinale) and every open floor tile in x0..x1, y0..y1 floods over 60 s, farthest from the middle first and the doorway (the row below y1) sooner, all but a dry ring N tiles round the middle. Dying in the finale drains it; walking back into the room starts it again. The checker ignores it.
- A `seal` held by a named other than `drowned_prior` (v0.79, the Bellringer) draws as an iron gate that rises when he's driven off, instead of flood water.
- `lockin x0 y0 x1 y1 named room=rx0,ry0,rx1,ry1` (v0.71, the Drowned Prior's chamber): step into the room rectangle (a couple of tiles past the door) while that named is up and the door tiles x0..x1, y0..y1 shut behind you (a portcullis), then every dry walkable floor tile in the room turns to flood `z` (slow), spreading from the middle over about 3 s; tiles under objects stay dry. The named's death opens the door (and a `seal` on the same named drains the water); dying in the room puts the water back and opens the door. The checker ignores it.
- `seal x0 y0 x1 y1 named` (v0.66): if the last word is a named on the same map (`drowned_prior`), the tiles stay shut until that named dies; drawn as flood water over the steps. If the map has flood water, his death also **drains it**: every `z` becomes `Z` (drained: wet stone, walkable, not slow) and the floor is painted again.
- `group=<name>` on a `spawn` or `named` line (v0.63): puts it in that group whatever its kind, so they fight together (Brother Malrec and his deacons). Without it, packs and camps group by distance as before.
- `wade: 1` (v0.64, the crossroads): the map's `~` water can be waded, slowed like flood water. `startAt: [x, y]` (v0.64): where you start and wake when the start exit can't be stood next to (the crossroads' closed town gate). Tile `L` **palisade** (v0.64): a log wall.
- Tile `z` **flood** (v0.63): walkable water that slows anyone wading it to 60% (you, pets and mobs; floating things skim over).
- New in Nov 20 for the chapel and Dungeon 1: tiles `Y` pew, `z` flood water (walkable; it will slow you and mobs), `N` bone niche (a wall with a skull shelf), `V` steps (walk down between rooms of one map), `K` ember pit; objects well, book_pyre, torn_banner, pack, altar, window (stained glass, on a wall), table, cage, bell_mold.
- Coordinates count from 0 at the top-left; x goes right, y goes down. The overview picture has a ruler every 4 tiles, so notes like "move the shack to 2,20" work.

## What the checker enforces
Errors (must fix):
- Every row the same width, every character in `TILESET`.
- Objects fit on the map, sit on the right ground, don't overlap, keep their clear ring of open ground (rubble at a building's foot is allowed), and their door opens onto open ground.
- Graves never touch a building (no gravestones on a bell tower).
- Mobs, named, rares, chests and exits stand on open ground, never inside scenery or a building.
- Everything can be reached on foot from the way in.
- `dead-inside`: no living grass, trees or bushes inside the fence or wall.

- Exits between maps: the map an exit leads to must have the `at=` exit it names (error) and a way back (warning).

Warnings (look at them):
- Dead ends (a tile with one way out), sealed pockets nobody can reach.
- Lonely graves (graves sit in rows), rubble with nothing nearby it could have fallen from.
- A mob much stronger than one farther in (difficulty grows with distance).
- The way in, and any exit marked `lit`, with no torch or brazier near it.

It also prints the farthest walk from the way in, in tiles and seconds.

## How Claude uses it
1. Edit the map file (or a quick painter script for a first draft, then edit the file by hand from there).
2. `python3 tools/mapcheck.py js/data/maps/*.js --out out/`; fix every error, judge every warning.
3. Look at both pictures, then show the owner. Owner notes go back into the file, and any new rule goes into `docs/area-rules.md` and, if it can be checked, into the checker.

Pictures go to `out/` (not saved in the repo). Needs Python 3 with Pillow.

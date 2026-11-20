# Map format: maps as text, checked by a script

Since Nov 18, 2026, every area map is a plain-text file. One character is one tile, so Claude can design, edit and review a map the way it edits any other file, and a checker script catches placement mistakes before the owner sees anything. **The game loads them** (since v0.22, `js/area.js`). In the game now: `crossroads` (where the game starts), `rat_tunnel`, `graveyard`, `crypt` and `wolfwood` (since v0.40); `?area=<map>` starts in one, DEV → Teleport reaches each.

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
- `critter` (v0.49): looks only, never in the way. Kinds: `crow` (flies off when you come close, back once you've gone; `high` = perched up on a fence, roof or statue, drawn over everyone), `frog` (on open ground by water, plops in when you come close), `moth` (circles the light it's placed at; the number is how many), `owl` (sits on a branch, blinks, turns its head to watch you), `bat` (flutters round the spot). Ripples on open water and smoke from a shack's chimney need no line. The checker wants frogs on open ground with water near, and moths near a light.
- `rules: 'dead-inside'` turns on the dead-area check for this map.
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

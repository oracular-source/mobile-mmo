# Area rules: how we build a new area

The baseline for every new area (owner, Nov 18, 2026). Add to it as we build. Map research and the "why" behind most of these: `docs/research/map-design.md`.

## How a new area gets made (one area per pass)
1. **Brief** (in chat, short): levels, theme, three mood words, landmark, named, rare, 3–5 things to find, which mobs live there, and a list of what's new vs reused.
2. **Style takes** (only when it's a new setting): 3–4 takes of the same scene in different looks. The owner picks one before anything else gets drawn.
3. **Full area mock-up:** one big top-down map of the whole area (the owner zooms in instead of walking it), plus one in-game phone view. Big chunks are fine; one area at a time. Since Nov 18 this is a text map in `js/data/maps/` that must pass `tools/mapcheck.py` before the owner sees it (`docs/map-format.md`); the checker draws both pictures.
4. **Owner notes**, then fixes. New rules that come out of the notes go into this file.
5. **Build it in the game**, then play-test on the phone.

## Every area feels like its own place
- **Own look:** its own light tint, fog, ground, plants, props, critters and sounds. You should know where you are from a single screenshot.
- **Dead areas are dead all the way, inside their border.** A graveyard gets dead trees, dead grass and bare branches behind its gate; the forest outside can stay green right up to it. Plants, trees and ground always match the area you're standing in.
- **New setting, new assets.** Draw new props, trees and tiles that fit the area instead of recolouring the last area's. Reuse is fine only when it truly belongs (the same road, the same fence where two areas meet, rats in more than one cave). It should be hard to spot repeats.
- **Areas in a zone are related, zones are different (owner, Nov 19).** Areas inside one zone feel similar but not the same: they share the zone's family of light, palette and mood, and each still has its own setting (Zone 1: the graveyard is cold and dead, the rat tunnel damp earth, Wolfwood foresty with wolves, all dusky and moody). A **new zone** is where the look changes up for real: new light, palette and mood.
- **One landmark you can see (or hear, or see lit up) from the area's entrance.**
- **Borders fit the place (owner, Nov 18).** Pick the transition that makes sense. **Hard cut** where there's a real boundary: a gate, a wall, a fence, a cave mouth (walk through the graveyard gate and now you're in a graveyard: dead trees, dead grass, new light, all at once). **Gradual blend** where open land meets open land, and in bigger areas: the forest thins out, grass dries, the light shifts over a stretch of road so it flows naturally. Default to the blend outdoors; use the hard cut when something physical marks the line.

## Look at references first; every object must read (owner, Nov 19)
Some art hasn't read as what it was meant to be (the crypt bones looked like little white blobs; the first Wolfwood lean-to looked like an upside-down pyramid). So for every new prop, monster or tile:
- **Look at references before drawing.** Pull a few reference images (real photos of the thing, plus pixel art of it at a similar size) with image search, and note the 2–3 shapes that make it recognisable (a lean-to = sloped roof + ridge pole + posts + dark opening; a bone = long shaft + knobbed ends, a skull = round dome + dark eye holes).
- **Draw those shapes big and simple.** At game size a thing reads by its outline, so lead with silhouette and contrast, not small detail.
- **Squint test at real game zoom** before showing or shipping: crop it from an in-game screenshot at the phone's zoom and ask "would someone name this right without being told?" If not, redraw.
- **When it's new or unsure, show it first:** a crop of the object in game next to one reference image, so the owner can say yes before it ships.

## Heart: the small details (owner, Nov 20)
The goal is a game that feels thought about, not generated. Small details set games apart, so every area gets them on purpose:
- **Something alive in every screen:** a critter, a flicker, a ripple, smoke, a moving plant. Frogs by water, crows on walls, moths at lights, owls in trees.
- **Wear and age:** moss and ivy on old stone (the bell tower's moss is the bar), cracks, stains, worn paths, chipped edges.
- **Right sizes:** doors, windows and props sized for the 20 × 24 characters, not left over from older art (the graveyard shack's door is too small).
- **Small stories:** a prop that hints at what happened (the dead adventurer in the rat tunnel, the hunter's camp, the fallen bell).
- **Ways between areas look like something:** an entrance where something marks it (gate, cave mouth, stairs), or a path that just carries on into the next place; never a black box at the edge.
- **Take it slow:** art passes go in chunks, one area at a time, and each chunk gets looked at on the phone before the next.
- **Learned on the graveyard pass (v0.49):** every stone weathers on its own (lean, chip, crack, moss on the top and foot, lichen), never all the same; critters get a lighter back or pale eyes so they show against dark ground on a phone; a critter that hides when you come close (crows, frogs) makes the place feel aware of you; dead areas get dead reeds and leaves too, not just dead grass; the area's name should show up in the art (sunken headstones in the Sunken Graveyard's water). Critters go in the map file as `critter` lines (`map-format.md`).

## Natural placement, no mistakes
- Everything looks like it would really be there. Nothing overlaps what it shouldn't: no gravestones on a tower, no props in walls, holes or each other, no mobs standing in scenery.
- Every object has a footprint (the space it takes up); buildings and paths keep about a tile of space around them.
- Things sit where they'd really be: graves in rows on open ground, rubble at the foot of what it fell from, paths worn where people walk, puddles in low spots.
- Buildings have believable openings: doors at ground level, windows only where a building would have them.
- Every mock-up gets checked for overlaps before the owner sees it (`tools/mapcheck.py` does this for map files). When a new rule can be checked by a script, add it to the checker too.

## Natural shapes: nothing looks like the tile grid (owner, Nov 20)
The map is made of square tiles, but the world shouldn't look like it. Square water in the crossroads and the graveyard read almost like a path. These rules apply to every area, old and new:
- **Water has natural edges:** banks curve and bite across tile lines, corners are rounded, never a straight run longer than a couple of tiles. A darker wet rim at the edge, then mud, stones and reeds; shallows fade in before the deep water. Creeks wander and change width; ponds are blobs, not boxes.
- **How water is drawn (v0.52, the recipe for every area):** water is one smooth shape, not tiles: a little blur turns stair steps into slopes, two layers of slow wobble bend the banks (a few pixels either way), so a 1-tile creek varies in width and a pond is a blob. From land to deep: wet mud strip (changing width) → 1 px dark wet rim → lighter, greener shallows → mid → deep in soft patches, with a shadow under the north bank (3/4 view). Then the bank details: pebbles at the waterline, reeds in clumps (dead and tan in dead places), lily pads only where the water is alive, light catching the deep. Water never creeps onto a road or a built floor. Anything placed in water (headstones, critters) checks the drawn shape, not the tile.
- **Every edge between two grounds is soft:** grass into dirt, path into grass, moss into blight: ragged, uneven lines, never a ruler edge along the tiles.
- **Woods are mixed:** never one tree repeated. 2–3 kinds per area growing in stands (neighbours mostly match, a few mixed in), young, mid and old sizes, small shade shifts from crown to crown, and something growing between the trunks (seedlings, ferns, fallen branches). Each area sets its mix in `TREE_MIX` (`js/area.js`), or gets new kinds when the setting calls for it (v0.51).
- **How ground edges are drawn (v0.54, the recipe for every area):** each pixel picks its ground from a smooth blend of the tiles around it, plus a little wobble, so two grounds meet in loose curves. **Natural ground** (grass, dead grass, mud, marsh, needles, moss, blight) blends loosely; **worn paths** get a small head start so a thin path stays joined at diagonal steps; **built ground** (roads, floors, stairs, flagstones) keeps a near-straight edge, because people made it (owner, Nov 20: a built path can be straight). Colour patches inside a ground are wobbled so they never form a checker grid. Small details (tufts, pebbles) only sit on the ground that actually shows there.
- **Past the map's edge (owner, Nov 20):** no big black boxes. Fill in with what's around: earth and dirt in a cave (the rat tunnel's walls are the model), trees where a forest runs off the map, fields past open land. Card: "Zone edges and ways between areas".
- **Still square (to fix):** the rat tunnel's earth walls follow tile steps; round them off in the dungeon pass.
- **Drawing, not map changes:** these are fixed in how tiles are drawn, so map files, walking and saves stay the same.
- **Check it on the in-game view:** if a shape looks like it follows the grid, redraw it.

## Area pass checklist (owner, Nov 20)
Every built area gets a pass with this list, and every new area (the Ruined Chapel grounds, Dungeon 1, Zone 2) is built with it from day one. Tick each line on the in-game view on a phone-sized screen:
1. **Natural shapes:** water and ground edges use the recipes above; walls, cliffs and cave edges don't follow tile steps; woods are mixed.
2. **Edges and ways out:** no black past the map edge; every way out looks like what it is (gate, cave mouth, stairs, or a path that carries on).
3. **Heart:** something alive in every screen; wear and age on anything old; doors and props sized for people; 1–3 small stories.
4. **Reads at a glance:** every prop and monster passes the squint test (references first).
5. **Natural placement:** nothing overlaps, things sit where they'd really be (`tools/mapcheck.py`).
6. **Its own place:** the area matches its look sheet below, and its light and fog change where the place changes.
7. **Saved:** every decision and recipe from the pass goes into this file in the same push, and the reply says what was saved.

## Every look decision gets saved here (owner, Nov 20)
Whenever the owner makes a call on how things should look or feel (in any chat), write it into this file in the section it fits, with the date, in the same push. This file is how every chat keeps the world consistent; the board only tracks the work. **Also save the recipe (owner, Nov 20):** when a visual change ships, add a short "how it's drawn" line here (like the water and ground recipes above), so every new location is built the same way from day one. Each reply that changes a visual says which rule it saved. This is the best-practice file for every new location.

## Layout
- Main road plus small side paths that reward curiosity.
- Loops, not dead ends; a shortcut back to the hub where it fits.
- **Not every area needs two ways out (owner, Nov 20):** a cave or burrow can have one way in and out when that fits what it is (the rat tunnel: just the sinkhole). Never put two entrances to the same place right next to each other.
- Harder with distance and depth, never with locked doors.
- 1–2 secrets per area off the main road (a hidden chest, a side path, a rare spawn spot).
- Light as breadcrumbs: torches at entrances, one lit marker in view at a time.

## Levels (owner, Nov 18)
- **Plan the whole zone's levels before building the next area.** The level ladder in `design.md` (Zone 1) is the one source of truth; update it first, then build.
- **Every area is a step up at its top end.** Bands can overlap (owner, Nov 18: overlap gives a choice of where to level, EverQuest-style, as long as the areas play differently), but each area's top level is higher than the last one's.
- **Easy at the door, hard at the far end:** spread an area's band across it (low end by the entrance, top end deepest), so a wide band still feels like a climb.
- **The named is the fight for the top of its area's band:** most classes should beat it by then in the sim (the Skeleton King, level 7, is beaten at 6–9, which matches the crypt's 6–9). Its own level number can sit inside the band. The area's rare sits at the top of the band.
- **The dungeon comes when it comes.** The first dungeon can be at 12, 13 or 15; what matters is a smooth climb to it, not hitting a set level.
- **Check the pace when an area is built:** clearing an area normally (plus its named) should take you up through most of its band. Too fast and you outlevel the next area; too slow and you grind. Tune spawns, XP or the band, and note it on the board.

## Phone readability
- **You're never under the HUD (v0.55):** the camera keeps your character below the top bars and above the spell grid, scrolling past the map edge when it has to. Past the edge the area's ground carries on (a ground-only mirror of the edge), never black. Map edges still need their own scenery so that strip looks right (zone edges card).
- Mobs and the player must stand out from the ground: different lightness, not just a different colour.
- Effects (fog, rain, ash) never hide a mob or the target ring for long.

## Area look sheets
Each area gets a short look sheet here once its style is picked.

### Sunken Graveyard
Style: **A · Moonlit** (picked Nov 18; other takes kept in the "Mobile MMO — Sunken Graveyard mock-up" canvas). Cold green night tint, blue crypt light, warm torches at the gate. The iron fence and gate are the border: living forest up to it, dead trees only and dead grass inside, low fog, broken bell tower with a wooden door, crypt mouth with cold light and candles. Full map: `js/data/maps/graveyard.js` and `crypt.js` (Nov 18).

### Crossroads
Style: **warm dusk** (v0.29). Living forest everywhere, trees thick along every road (owner loves trees), open grass at the crossing with the campfire and signpost, a creek with a plank bridge on the north road and a reedy marsh meadow on its west banks. Hard cut nowhere: it's open land, so the roads simply run off the edges. East: the sinkhole, torn turf and stones round it, roots hanging into the dark, dust rising, a lantern on a post that someone left as a warning. Full map: `js/data/maps/crossroads.js`.

### Rat tunnel
Style: **B · cold damp earth** (owner picked Nov 18; a tunnel, not a mine). Packed earth walls with dark soil faces, stones and hanging roots; rat holes with spilled dirt and gnawed bones; dirt piles kicked out of the burrows; pale mushrooms at the foot of the walls; drips; bones heaped in the den. Cold daylight falls through the sinkhole and a few cracks, with dust turning in it; mist over the pool and the den floor. Rats get a size bigger as you go deeper. Full map: `js/data/maps/rat_tunnel.js`.

### Wolfwood
Style: **A · Dusk hush** (picked Nov 19; other takes kept in the "Mobile MMO — Wolfwood style takes" canvas, drawn by `tools/wolfwood_takes.py`). Dim green-grey dusk, gold light shafts through gaps in the canopy, low fog lying between the trunks; darker the deeper (north) you go. Leafy trees at the crossroads end blend into tall dark firs (soft border along the north road). Ground: needles and moss, grey blight creeping out from the dead giant tree, which stands bare and pale above the canopy with a hollow at its foot. Hunter's camp in a clearing (lean-to, cold firepit, drying rack, sprung traps). Blight wolves grey with red eyes; the boar brown with a pale thorn ridge. Hunter's camp has a lit campfire (rest spot). Full map: `js/data/maps/wolfwood.js` (approved Nov 19). **Built into the game in v0.40.**

### Ruined Chapel
Style: **A · Vesper embers** (picked Nov 20; other takes kept in the "Mobile MMO — Ruined Chapel style takes" canvas, drawn by `tools/chapel_takes.py`). Cold blue-grey dusk, the same family as the rest of Zone 1, with warm pools of candle and ember light round the shrine, the wall gap, the chapel door and the cult camps. Grey smoke lies low and drifts in bands instead of fog, and rises in thin threads above censers and wisps. The firs of Wolfwood thin out along the road in (soft border); inside the low stone wall the ground is trampled ash and gravel with broken flagstones before the door. Running-bond grey stone with ivy, slate roof with holes in it, the steeple whole with one gold-lit window (the landmark). Cult banners: dark cloth with a red ring, hung from the wall top. Cultists hooded with red eyes in the dark of the hood (zealot rust-red, ashcaller grey, chanter purple); ash wisps a gold-white flame with a smoke tail. Critters: crows on the wall, moths at the candles.


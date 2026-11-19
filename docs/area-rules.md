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
- **One landmark you can see (or hear, or see lit up) from the area's entrance.**
- **Borders fit the place (owner, Nov 18).** Pick the transition that makes sense. **Hard cut** where there's a real boundary: a gate, a wall, a fence, a cave mouth (walk through the graveyard gate and now you're in a graveyard: dead trees, dead grass, new light, all at once). **Gradual blend** where open land meets open land, and in bigger areas: the forest thins out, grass dries, the light shifts over a stretch of road so it flows naturally. Default to the blend outdoors; use the hard cut when something physical marks the line.

## Natural placement, no mistakes
- Everything looks like it would really be there. Nothing overlaps what it shouldn't: no gravestones on a tower, no props in walls, holes or each other, no mobs standing in scenery.
- Every object has a footprint (the space it takes up); buildings and paths keep about a tile of space around them.
- Things sit where they'd really be: graves in rows on open ground, rubble at the foot of what it fell from, paths worn where people walk, puddles in low spots.
- Buildings have believable openings: doors at ground level, windows only where a building would have them.
- Every mock-up gets checked for overlaps before the owner sees it (`tools/mapcheck.py` does this for map files). When a new rule can be checked by a script, add it to the checker too.

## Layout
- Main road plus small side paths that reward curiosity.
- Loops, not dead ends; a shortcut back to the hub where it fits.
- Harder with distance and depth, never with locked doors.
- 1–2 secrets per area off the main road (a hidden chest, a side path, a rare spawn spot).
- Light as breadcrumbs: torches at entrances, one lit marker in view at a time.

## Phone readability
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

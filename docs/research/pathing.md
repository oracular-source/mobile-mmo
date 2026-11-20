# Mob pathing: how mobs find their way

Pathing deep dive (Nov 19, 2026), done before building v0.43. The owner played Wolfwood and saw mobs getting stuck on things, and asked for the leanest approach that other teams actually use.

## The problem
Before v0.43, every mob walked in a straight line toward its target, sliding sideways a little when it bumped into something. With a tree, fence or wall corner in the way, it ground into it and stopped. Hurt wolves ran straight away from you, so they pinned themselves on the nearest tree, which looked random but wasn't. Measured in Zone 1 (mob 5–12 tiles away with something in the way): mobs reached you only **40–75% of the time**.

## What other teams do
- **A\* (one path per mob):** the classic. Good when each unit has its own goal. Cost grows with the number of mobs, since each one searches separately.
- **Flow fields / distance maps:** one pass from the goal fills every tile with "steps to the goal", and every unit just walks downhill. Fieldrunners 2 (a phone tower defense game) used flow fields based on Dijkstra's algorithm, plus steering, to move thousands of units cheaply. Supreme Commander 2 used them for big groups. The cost doesn't grow with the number of units.
- **Roguelikes (Brogue's "Dijkstra maps"):** the same idea on a tile grid. The same maps give smart fleeing for free: Brogue's author points out that a monster that just runs directly away from the player bangs its head into the nearest corner. His fix is a "safety map" that leads it somewhere it can actually escape to.
- **Straight line first, pathing only when needed:** old roguelike advice: most of the time a straight walk works, so only bring in pathfinding when something is in the way. Keeps open-ground fights feeling exactly as they did.
- **Stuck checks (big MMOs and engines):** WoW, Conan Exiles and Roblox all have long-running complaints about mobs sticking on terrain. The usual band-aid is a watchdog that notices a mob hasn't moved and re-paths or teleports it. That treats the symptom; a grid map that knows where the walls are avoids the cause.

## What we built (v0.43) and why it's the lean choice
- **Distance maps on our tile grid** (`js/path.js`). Our areas are small grids (up to 64 × 48 = about 3,000 tiles), so one pass takes a fraction of a millisecond. Most mobs chase the same target (you), so one map serves all of them. Maps are cached by goal tile and only rebuilt when the goal moves to another tile.
- **Straight line when it's clear.** A quick line check comes first; the map only steers when something blocks the line. Close fights feel the same as before.
- **Smooth corners.** A mob looks up to 4 tiles ahead along the map and heads for the farthest one it can see, so it cuts smooth lines instead of zig-zagging tile by tile. Diagonal steps never cut through the corner of a wall or trunk.
- **Fallback.** If the goal can't be reached on foot (across water), the old straight walk is used.
- **Random fleeing (owner's call):** a hurt wolf picks a random open spot 4–8 tiles away that it can actually walk to, never one closer to you than it is now, then another spot if its run isn't over. Fleeing toward other packs waits for bigger class kits (backlog).
- **Not used:** A\* per mob (more code, cost grows with mobs, no benefit at our size); navmeshes (made for 3D and free-form worlds; we have tiles); steering and crowd separation (mobs don't push each other in our game; revisit if crowding looks bad).

## Results (headless test)
| Area | Reached you before | Reached you now |
| --- | --- | --- |
| Crossroads | 19 / 37 | 37 / 37 |
| Rat tunnel | 16 / 40 | 40 / 40 |
| Sunken Graveyard | 23 / 40 | 40 / 40 |
| Crypt | 30 / 40 | 40 / 40 |
| Wolfwood | 18 / 40 | 40 / 40 |

Hurt wolves fled at angles all round the circle with zero time stuck. All 32 Wolfwood mobs chasing at once: about 0.2 ms per game tick (a frame has about 16 ms).

## Later
- **Fear** can use a safety map (backlog card).
- **Tap-to-move** for the player can use `pathTo` (optimization card).
- **Phase 3 (server):** the same maps work on a server; one map per player target per area, cached the same way.

## Sources
- Fieldrunners 2 flow fields: https://www.taylorfrancis.com/books/9780429055096/chapters/10.1201/9780429055096-8
- Red Blob Games, flow fields with breadth-first search: https://www.redblobgames.com/pathfinding/tower-defense/
- Flow fields vs A\*: https://epheria.github.io/en/posts/FlowFieldPathfinding.en ; Supreme Commander 2: https://wynnliam.github.io/alexander/2019/12/05/flowfields.html
- Brogue's Dijkstra maps and safety maps: https://groups.google.com/g/rec.games.roguelike.development/c/6yNIuhSerpM ; https://roguebasin.com/index.php/Dijkstra
- Straight line first, pathing when stuck: https://groups.google.com/g/rec.games.roguelike.development/c/v0udTX8YxC8
- Mobs sticking in big games: https://forums.funcom.com/t/sticky-terrain-features/95908 ; https://forums.funcom.com/t/npcs-clipping-seems-to-cause-a-large-amount-of-issues-with-the-game/155004 ; https://www.aol.com/news/2008-07-30-in-wow-and-other-games-pathfinding-is-still-kind-of-a-problem.html

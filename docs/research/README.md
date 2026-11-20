# Research notes

Short notes on how games (and MMOs especially) are usually built, so our choices are based on what works for other people, not guesses. Each note ends with **What this means for us**.

| Note | What's in it |
| --- | --- |
| [coding-practices.md](coding-practices.md) | How to organize the game's code: splitting files without a build step, data vs. code, the game loop, saves, randomness, phone performance, testing |
| [mmo-development.md](mmo-development.md) | Lessons from MMO development: the server is the boss, what we can prepare now in single-player, and design "laws" from older online worlds |
| [progression-and-retention.md](progression-and-retention.md) | The leveling plan so far (cap 30 now, 50 planned, skill tree from 5, 10–12 abilities by 30) and the research behind it: ability pacing, kits that change, retention (Nov 17) |
| [power-scaling.md](power-scaling.md) | Scaling rule (approved Nov 19): breadth grows, depth stays flat, zones fixed; breadth ladder to 50, Necro 1–50 path, dungeon tiers idea, guardrails from other games (Nov 19) |
| [art-direction.md](art-direction.md) | How to decide the look as a non-artist: visual pillars, mood board, the six style-guide rules, readability tests (Nov 17) |
| [pixel-world-alive.md](pixel-world-alive.md) | What makes a small pixel world feel alive (Stardew Valley, Hyper Light Drifter, Eastward, Graveyard Keeper, Sea of Stars, Kingdom): ambient life, light, colour, readability, cheap-first effects, phone rules (Nov 17) |
| [monsters-weapons-spells.md](monsters-weapons-spells.md) | Monsters, weapon swings and spells from older dark games (Diablo 1 and 2, Tibia, Ragnarok, Darkest Dungeon, Blasphemous, Loop Hero, Noita): monster families and size tiers, 4-beat swings, readable spell colours, crowd clutter (Nov 17) |
| [map-design.md](map-design.md) | Map design that invites wandering but never gets you lost (Disney, Breath of the Wild, Elden Ring, Dark Souls, Hollow Knight, EverQuest, WoW, OSRS), plus the Zone 1 layout proposal (Nov 17) |
| [characters-and-spells.md](characters-and-spells.md) | Character looks and spell feel (Darkest Dungeon, Blasphemous, Hyper Light Drifter, Hades, Ragnarok, League's VFX guide, Vlambeer): silhouette first, faces hidden or shown, three-beat spells, sound, cosmetics layers; six look drafts and the A+B mix (Nov 17) |

## The short version
1. **Split by job, keep it simple.** Modern phone browsers load JavaScript files directly ("ES modules"), so we can split `index.html` into `css/` and `js/` files with no build tools, and GitHub Pages keeps serving it from the same link.
2. **Numbers in data, rules in code.** We already do this (`CLASSES`, `TYPES`, `ITEMS`). The split should put all data in its own files so balancing never means touching game logic.
3. **Game rules apart from drawing.** Combat, movement and AI should not depend on the screen. That's what lets the headless sim (testing grounds) run every class without a phone, and later lets the same rules run on a server.
4. **Repeatable randomness for testing.** A "seeded" random number generator gives the same results every run, so balance numbers from the sim can be trusted and bugs can be replayed.
5. **Version the saves.** Put a version number in saved data so future updates can upgrade old saves instead of breaking them.
6. **Plan for "never trust the player".** In an MMO the server decides everything. We stay single-player for now, but keeping rules separate from input and drawing makes that move much easier.

Researched Nov 17, 2026.

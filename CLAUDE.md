# Mobile MMO

A tab-target fantasy MMO for phones, inspired by EverQuest (camps, pulls, classes that need each other) and Dreadmyst (small scope, build customization, short repeatable runs). The full design is in `docs/design.md`. Read it before starting any new feature.

## About me
- I'm not a developer. Explain things in plain words, and skip the jargon unless you define it.
- After every change, tell me exactly how to test it: what to open, what to tap, and what I should see.
- If something needs me to install or set up a tool, give me step-by-step instructions.
- Ask before big or hard-to-undo changes (deleting files, restructuring folders, adding new tools or frameworks).

## Current phase
Phase 2: solo prototype. Gate Road, the Sunken Graveyard and Dungeon 1; all 14 classes playable: Druid, Warrior, Necromancer, Rogue, batch 1 (Cleric, Enchanter, Paladin, Shadow Knight, Wizard) and batch 2 (Magician, Ranger, Monk, Shaman, Bard) on the default skin; single-player, no server.
Launch classes (later phases): Warrior, Cleric, Druid, Enchanter, Rogue, Necromancer. The full 14-class roster is in the design doc.
Don't add multiplayer, accounts or server code until I say we're in phase 3.

## Tech stack (prototype)
- Plain HTML, CSS and JavaScript drawn on a canvas, split by job (since v0.14): `index.html` (page and buttons), `css/game.css`, and `js/` files. No build step, no frameworks.
- The `js/` files are plain scripts (not modules) that share one scope, loaded in the order listed at the bottom of `index.html`. A new file must be added to that list in the right spot, and top-level names must be unique across files. Code that runs at load time can only use things from files above it; code inside functions can use anything.
- Split rules: `js/data/` holds numbers only, no logic. Game rules (`combat.js`, `update.js`, `world.js`) don't draw or read touch input. All saving goes through `store` in `js/save.js`; if a change alters how something is saved, bump `SAVE_VERSION` and add an upgrade step. Every gameplay random roll uses `rng()` (`js/rng.js`); `rnd()` is the seeded one for the map and spawn spots. Each file starts with a one-line note on what it does.
- It runs in any phone browser (or opened straight from disk) and is hosted on GitHub Pages from the `main` branch.
- Later options: Phaser + Capacitor (stay on web, ship to app stores) or Godot 4. Server: Nakama. Decide after the prototype.

## How we work
- One small feature per session. Finish it, test it, then stop.
- Keep code simple and readable over clever. Add short comments that explain *why*.
- Before finishing, open the game in a headless browser if you can and check for JavaScript errors.
- When I report a bug, ask for what I saw (or a screenshot) before guessing.
- When a feature works, commit with a short, clear message.
- Work flows through `docs/board.md` (lean): one card at a time, small batches, ideas go to the backlog before any building, defects before features. Update the board's Now/Next, changelog and known issues with every change.
- Chat light (saves compute): end every reply with one line: 🟢 keep going, 🟡 finish this card then start a new chat, or 🔴 start a new chat now. Green = fresh chat. Yellow = a feature is done in this chat or it has had several big builds or file reads. Red = the chat has been summarized/compacted, or a second feature would start here. Before any 🟡 or 🔴, make sure `docs/board.md` Now/Next is current so a new chat can pick up with: "Continue from the board."
- GitHub is the single source of truth for docs. Refresh the Claude design doc only at milestones.
- Developer panel for manual testing: open the game with `?dev` (DEV button: levels, heal, god mode, loot, teleports). `?dev=0` turns it off.
- Automated checks: open `index.html?debug` to get `window.__game` (enterZone, player, mobs, inv) for headless tests.
- Testing grounds and sim (`js/sim.js`): each class has a playbook bot in `BOTS` that follows `docs/playbooks.md` (when X, do Y). A new class needs a bot there too. `__game.runSim({seeds:10})` runs the current class's scenarios headless (fixed steps, `seedRng`) and resolves with the results; `__game.simTable(res)` turns them into a markdown table. To run every class, set `localStorage['ashfen-class']` and reload between runs. Save results to `docs/sim-results.md`.
- Game numbers live in `js/data/`: `classes.js` (`CLASSES`: stats, abilities, loadouts), `mobs.js` (`TYPES`, `NEED` XP), `items.js` (`ITEMS`), `sprites.js` (`SPR`, `PAL`, `RAGS` for every class's tier-0 look (head + body + weapon), and the older `SKINS` default skin kept for DEV comparison). Add a class by adding data, not new code paths; abilities use generic kinds (nuke, heal, hot, dot, root, snare, slow (attack slow only), buff, petbuff, stun, cleave (any area effect), lifetap, pet, petheal, detonate, fear, feign, backstab, stealth, evade, mez, charm, taunt, decoy, ground, trap, mark, canni, song, crescendo, blink, gate), plus optional fields (undead, undeadOnly, holy, hpCost, chill, shatter, aslow, full, pet:{... threat, burn, boom, boomStun, say}, stun/root/tapPer on area kinds, dash, hits, knock, petHeal, shot, back, split, all/totem/tick on ground, val on buffs, song:'heal'|'dmg'|'speed'|'haste'|'discord'). Class field `dotStack` (Shaman) makes each DoT tick harder per other DoT on the mob. Buffs show on the buff bar automatically (name and colour from the ability that gives them). Mobs with `undead:1` take holy bonuses. Mobs pick targets by threat (player vs pet); a Phantasm decoy draws nearby mobs first. Classes list their gear groups in `gear` (e.g. `['warrior','knight']`).

## Game rules to protect
These come from the design pillars. Flag any feature that breaks one.
1. Every activity has a natural stopping point within about 20 minutes. Sessions can run from 15 minutes to a few hours.
2. Everything is soloable; groups are rewarded, never required.
3. Classes are defined by role and utility, not bigger numbers.
4. Phone-first: one thumb to target, no more than 8 ability buttons on screen.
5. Small and finished beats big and rough.

Monetization: free to play, with paid extra bank and inventory space. Never sell power, XP boosts, or loot boxes.

## Art and audio
- Only original assets (made by us) or CC0 / public domain assets. Nothing that needs a paid license or comes from another game.
- Log every asset in `docs/credits.md`: file, who made it or where it came from, and its license.
- Art style: dark 2D pixel art, 3/4 top-down view (Dreadmyst meets Diablo 2 and Vampire Survivors). Characters are 16x18 pixel sprites (the A+B take 1 look, v0.19: 6-row head, 12-row body) with a black outline; monsters follow the size tiers in `docs/research/monsters-weapons-spells.md`, list in `docs/monsters.md`. Use the palette in `art/palette.md`.
- Sprites are currently stored as text grids in `js/data/sprites.js` (one character per pixel, see `SPR` and `PAL`).
- Render at low resolution and scale up with nearest-neighbor (no smoothing) so pixels stay crisp.
- **New areas:** follow `docs/area-rules.md` (one area per pass: brief, style takes, full area mock-up, owner notes, build). Add new rules there as we learn them.
- **Natural placement, no mistakes (owner, Nov 18):** every scene, map and mock-up must look like a real place. Nothing overlaps something it shouldn't: no gravestones on a bell tower, no props inside walls, holes or other props, no mobs standing in scenery. Give every object a footprint, keep a tile of clearance around buildings and paths, and check placements for overlaps before showing or shipping. Things sit where they would really be (graves in rows on open ground, rubble at the foot of what it fell from, paths worn where people walk).

## Folder layout
- `index.html` the page (HUD and menu markup) and the list of scripts
- `css/game.css` styles
- `js/` the game, one file per job: `core` (canvas, tile size), `rng`, `save` (safe storage, save version, upgrade steps for old saves), `map` (overworld, Dungeon 1 rooms), `state` (class, bags, saves, settings, loadout), `spawns`, `fx` (floating text, log, helpers), `combat` (threat, hits, pet, loot, casting), `input` (touch, joystick, pinch), `ui` (spell pad, menus, character screen), `world` (NPCs, critters, zones, boss AI), `update` (one game tick), `render` (drawing, lighting, zoom, HUD), `sim` (testing grounds: arena test fights, playbook bots and the sim), `dev` (DEV panel), `main` (loop, start screen; loads last)
- `js/data/` numbers only: classes, mobs, items, sprites
- `docs/` design doc, progress notes, credits
- `art/` palette, and sprite sheets once we export them
- `audio/` sound effects and music (empty for now)

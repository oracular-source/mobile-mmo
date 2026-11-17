# Mobile MMO

A tab-target fantasy MMO for phones, inspired by EverQuest (camps, pulls, classes that need each other) and Dreadmyst (small scope, build customization, short repeatable runs). The full design is in `docs/design.md`. Read it before starting any new feature.

## About me
- I'm not a developer. Explain things in plain words, and skip the jargon unless you define it.
- After every change, tell me exactly how to test it: what to open, what to tap, and what I should see.
- If something needs me to install or set up a tool, give me step-by-step instructions.
- Ask before big or hard-to-undo changes (deleting files, restructuring folders, adding new tools or frameworks).

## Current phase
Phase 2: solo prototype. Gate Road, the Sunken Graveyard and Dungeon 1; playable classes Druid, Warrior and Necromancer; single-player, no server.
Launch classes (later phases): Warrior, Cleric, Druid, Wizard, Rogue, Necromancer. The full 14-class roster is in the design doc.
Don't add multiplayer, accounts or server code until I say we're in phase 3.

## Tech stack (prototype)
- The whole game is one file: `index.html` (HTML, CSS and plain JavaScript, drawn on a canvas). No build step, no frameworks.
- It runs in any phone browser and is hosted on GitHub Pages from the `main` branch.
- Keep it working as a single file unless I agree to split it. If it grows past ~3,000 lines, propose a split into `js/` files.
- Later options: Phaser + Capacitor (stay on web, ship to app stores) or Godot 4. Server: Nakama. Decide after the prototype.

## How we work
- One small feature per session. Finish it, test it, then stop.
- Keep code simple and readable over clever. Add short comments that explain *why*.
- Before finishing, open the game in a headless browser if you can and check for JavaScript errors.
- When I report a bug, ask for what I saw (or a screenshot) before guessing.
- When a feature works, commit with a short, clear message.
- Work flows through `docs/board.md` (lean): one card at a time, small batches, ideas go to the backlog before any building, defects before features. Update the board's Now/Next, changelog and known issues with every change.
- GitHub is the single source of truth for docs. Refresh the Claude design doc only at milestones.
- Developer panel for manual testing: open the game with `?dev` (DEV button: levels, heal, god mode, loot, teleports). `?dev=0` turns it off.
- Automated checks: open `index.html?debug` to get `window.__game` (enterZone, player, mobs, inv) for headless tests.
- Game numbers live in data tables near the top of the script: `CLASSES` (stats, abilities, loadouts), `TYPES` (mobs), `ITEMS`, `NEED` (XP). Add a class by adding data, not new code paths; abilities use generic kinds (nuke, heal, dot, root, snare, buff, stun, cleave, lifetap, pet, petheal, fear, feign). Mobs pick targets by threat (player vs pet).

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
- Art style: dark 2D pixel art, 3/4 top-down view (Dreadmyst meets Diablo 2 and Vampire Survivors). Characters are 12x16 pixel sprites with a black outline. Use the palette in `art/palette.md`.
- Sprites are currently stored as text grids in `index.html` (one character per pixel, see `SPR` and `PAL`).
- Render at low resolution and scale up with nearest-neighbor (no smoothing) so pixels stay crisp.

## Folder layout
- `index.html` the game
- `docs/` design doc, progress notes, credits
- `art/` palette, and sprite sheets once we export them
- `audio/` sound effects and music (empty for now)

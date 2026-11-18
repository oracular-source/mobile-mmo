# Board

One place for the work: what's being built now, what's next, every idea, and what shipped. The game design lives in `design.md`; this file is the flow.

## How we work (lean)
- **One thing at a time (WIP = 1).** Finish, test, ship, then pull the next card.
- **Small batches.** Each change ships as its own version to the live link so it can be judged on a phone right away.
- **Pull, don't push.** Work comes from Now/Next. New ideas go to the Idea backlog first, never straight into the build.
- **Definition of done:** works in a headless test with no errors → docs updated (this board, `design.md` if rules changed) → committed and pushed → owner plays it on the phone.
- **Feedback loop:** play-test notes become cards. Defects get fixed before new features.
- **Prioritize by value ÷ effort.** Value = does it make the core loop more fun or answer an open question. Effort = S (one session), M (2–3), L (4+).
- **Dev game artifact:** after each release, republish `index.html` (with `dev.on` forced to true) to the owner's "Mobile MMO — Dev game" artifact, slug `4705b8bf-2515-4e08-89d4-64251da5813f`, so it stays current.
- **Single source of truth:** GitHub. The Claude design doc gets refreshed at milestones only.

## Roadmap (phase 2: solo prototype)
| # | Milestone | Done when | Status |
| --- | --- | --- | --- |
| 0 | Controls and core combat | You can fight and kite comfortably on your phone | Done (v0.6) |
| 1 | Basic loot | Kills feel rewarding between dings | Done (v0.7) |
| 2 | First dungeon | A run is fun enough to repeat | Done (v0.9) |
| 3 | Two more classes (Warrior, Necromancer) + real class system | Each class plays differently on the road and in the dungeon | Done (v0.11.1) |
| 3b | All 14 classes at baseline, in two batches of 5, on one default skin + testing grounds | Every class plays like itself and the sim can run them all | Now (batch 1 done v0.17; batch 2 next) |
| 3c | Balance (overnight sim runs) | All classes roughly even in the sim, anchored on Necro (easiest solo). Cleric may stay near-unkillable but slow; Warrior becomes the ultimate tank | Next |
| 3d | Art redo: mock-ups, lock one character, write the style guide, roll it out to every class and the world | Everything follows one look | Later |
| 4 | Polish and gate review | A friend can play from a link without help | Later |

Gate review after milestone 4: 5–10 friends play, then decide whether the core is fun, web vs Godot, and whether to start phase 3 (multiplayer).

## Now
1. **Batch 2 playbooks** (M): Magician, Ranger, Monk, Shaman, Bard. Owner and Claude draft the kits and twists in `docs/playbooks.md` like batch 1, then build (L). Needs the buff bar (backlog) and Bard songs. **First draft written (Nov 17):** kits, twists and bot rules for all five. Waiting on owner answers to 4 open questions at the end of the batch 2 section.
Owner to play: the five batch 1 classes (v0.17) on the phone. Notes become cards.
Done: batch 1 build (v0.17), testing grounds and sim (v0.16), default skin (v0.15).

## Next
1. **Batch 2 build:** the five classes on the default skin, with bots. One release.
2. **Balance** (milestone 3c): overnight sim runs, anchors first (Necro, Cleric), owner plays to judge fun. Melee classes soloing Boss 1 gets fixed here. Warrior gets its ultimate-tank pass here (card in the backlog).
3. **Art redo** (milestone 3d): mock-ups to compare on the phone, lock one character (likely the Druid), write the rules in `art/palette.md` as a style guide (sprite size, outline, shading, palette, animation frames), then the same for one tree, one ground tile and one wall before rolling out.
4. **Feel pass:** hit sparks, knockback, animations, sound.
5. Milestone 4: start screen polish, fix anything clearly broken.

Done earlier on Nov 17: research notes (`docs/research/`), file split (v0.14), versioned saves (v0.14.1), Rogue (v0.13, v0.13.1).

## Decisions
- **Portrait (phone held upright).** Fits short sessions, playing in bed, and one-thumb targeting. Seeing more of the world comes from zooming out, not turning the phone.
- **Zoom:** farthest (and default) view is about 215–235 game pixels wide on most phones, tuned by play-test (v0.11.5's ~290 was too far, v0.11.6's ~195 too close). Players pick Near / Far or pinch.
- **Screen layout (v0.12.1):** max 8 ability buttons on screen: 6 on the right (pad or classic) plus slots 7–8 on the left, in joystick and tap-to-move alike. Left column above the chat box: slot 7, slot 8, Sit (kept on screen: Necros sit while the pet and DoTs fight). Top left under the portrait: 1st hit / Auto. Top right: Menu (Spells, Arrange, Settings). No bottom bar. Character = tap the portrait. Target button dropped; Next ⟳ does that job.
- **Build wide (Nov 17):** all 14 classes reach baseline in batches of 5 on one default skin before balance, art or feel work. Supersedes "one class per release" for this phase.
- **One boss health bar:** bosses use the normal target frame (top right). The separate wide boss bar was removed in v0.14.2 as redundant.
- **Launch six (Nov 17):** Warrior, Cleric, Druid, Enchanter, Rogue, Necromancer. Enchanter replaces Wizard (more unique); Wizard moves to later.
- **Balancing waits** until most launch classes exist. Until then, only fix obvious outliers.
- **Rogue Evade is damage (Nov 17):** Evade, then Backstab right away. Most players would use it that way; the sim now runs only this version.
- **Soloable, at different difficulty by class:** everything can be soloed, but pet classes (Necro) solo comfortably while tanks (Warrior) find it harder and are rewarded for grouping. Tell players this when they pick a class.

- **Cleric stays tough, Warrior gets tougher (Nov 17):** a Cleric that almost never dies is fine because its kills are slow. The Warrior should be the ultimate tank: the hardest class in the game to kill. Fixed in the balance pass, not now.

## Idea backlog
Value: H/M/L. Effort: S/M/L. Phase: when it fits.

| Idea | Value | Effort | Phase |
| --- | --- | --- | --- |
| Buff spells and a buff bar. Rules: a buff hits you and everyone nearby (Warriors: self only), no targeting; lasts until you die | M | M | 2 |
| Animations: walking, casting, attacking, pet movement | H | L | 2 (milestone 4, with the art pass) |
| Boss feel: slight screen shake on big boss attacks, and the camera pulls back when you enter a boss room (no separate boss bar) | M | S | 2 (with the feel pass) |
| **Warrior = ultimate tank** (owner, Nov 17): hardest class to kill, ahead of the Cleric. Options to pick from: (a) clearly the most health and armor in the game; (b) **Last Stand:** once a fight, a killing blow leaves you at 1 HP with big damage reduction for 5s; (c) **Shield Block:** a chance to block a hit outright, higher with a shield; (d) **Hold the Line:** takes less damage for each mob on it (the opposite of the Shadow Knight healing per mob). Sim target: Warrior survives longest of all classes, kills stay slow | H | S–M | 2 (milestone 3c, balance) |
| Warrior group tools: Charge (rush to a target) and a big-radius taunt shout | H | S | 2 |
| Short fight buffs (10–15 min) saved for hard fights or raids | M | M | later |
| Raids | M | L | phase 4+ |
| First Dungeon 1 visit is public: everyone shares it until they've reached the end (or been grouped); later visits are private. Lets Warriors find groups | H | L | phase 3 |
| Class picker shows how solo-friendly each class is (e.g. Warrior: groups recommended; Necro: strong solo) | M | S | 2 (milestone 4) |
| Tough mobs pay better: mire beetles take half damage (armor 0.5) but their Beetle Shell sells for 3 copper, less than a Brittle Bone (4). Raise to ~8 and always drop one; same rule for future armored mobs | M | S | 2 (with milestone 4) |
| Journal per dungeon: boss drops listed once found, like a bestiary | M | S | 2 |
| Sound effects (generated, CC0) | H | M | 2 (milestone 4) |
| Art pass: sprites, tiles and the overall look. Method (Nov 17): mock-ups, lock one character, write a style guide, then roll out | H | L | 2 (milestone 3d) |
| Simple minimap | M | M | 2 |
| Free-form HUD editor (place every button anywhere) | L | L | later |
| Level design: the Gate Road is a rough sandbox. Design a real starting area that feels lively and detailed | H | L | after UI and classes |
| Rest of Zone 1: Wolfwood Edge, the Mire, Ruined Chapel, Greyfang, Brother Malrec | H | L | after classes |
| Quests and a hub city (Town 1) | M | L | after classes |
| NPC companion to fill a missing role | M | L | phase 3 |
| Personal loot for everyone, no rolling | H | S | phase 3 (already personal in solo) |
| Get players into dungeons quickly so others can't steal their mobs | H | M | phase 3 |
| High-level players can't attack low-level mobs (block, or no XP/loot) | M | S | phase 3 |
| First-hit tagging: the first player or group to hit a mob owns it | M | S | phase 3 |
| Extra spawns or zone copies when an area gets crowded | M | M | phase 3 |
| Dungeon lockouts or loot timers for bosses | L | S | phase 3 |
| Longer dungeons (later ones grow past the short first one) | H | M | after classes |
| **Leveling plan (leaning, Nov 17):** plan for level 50, launch at 30; about 60–80 hours to 30; something new every ~3 sessions; 10–12 abilities by 30 and 13–15 by 50. Details: `docs/research/progression-and-retention.md` | H | S | 2 (revisit once real leveling times are known) |
| **Skill tree from level 5:** 1 point per level, about 30 upgrades per class in 3 branches, pick-one spots, cheap respec. Replaces stat points (stats from gear). Upgrades as generic data kinds (cooldown cut, charge, duration, area, spread). Launch six first | H | L | 2–3 (when levels past 10 exist) |
| Fold the Druid's 18 abilities into 11 + tree upgrades (list in the progression note); same pass for other classes as they reach 30 | M | M | with the skill tree |
| Necromancer Bone Pair / Bone Knight as the first pick-one upgrade (sim checks two pets) | H | M | with the skill tree |
| "Next unlock" preview on level-up and the character screen | M | S | 2 |
| Collection log for named drops (extends the dungeon journal card) | M | S | 2 |
| Post-cap side perks (capped, catch-up friendly), harder dungeon tiers | M | L | later |
| **Pixel art deep dive** (owner, Nov 17): what makes a 2D pixel world feel alive and well designed, looking well beyond MMOs (Stardew Valley and others): ambient life, animation, light, color, readability. Research note in `docs/research/`, then draft character mock-ups as artifacts (no game changes) | H | M | next art step, before 3d |
| Owner mood board (10–20 references + 3–5 "not this"), see `docs/research/art-direction.md` | H | S | before 3d |
| Visual pillars agreed and written at the top of `art/palette.md` (draft in the art note) | H | S | before 3d |
| Palette rebuilt as hue-shifted ramps | M | S | 3d |
| DEV panel grayscale and silhouette views for readability checks | M | S | 3d |
| **Boss telegraphs:** a cast bar or timer pops up before a boss's big ability so players see it coming and can counter it (step out, stun, Divine Aura, Feign Death). Adds depth to boss fights | H | M | 2 (with the balance or feel pass) |
| **Short teleports for everyone:** walking less in general. Some classes get fun travel tools as flavor (Wizard Blink and Gate, Druid circles), not as big unlocks; may live in class passives. Mounts possibly later | M | M | 2–3 |
| **Class passives:** a small always-on perk per class that adds flavor (travel tools could live here). Not written down yet; owner to describe | M | M | later |
| ~~Class playbooks for the sim~~ (done v0.16 for the four current classes): tactics, not just a combo. Owner writes each class's process in plain words, saved as "when X, do Y" rules. Examples: Necro dreads (fears) the highest-HP mob while fighting the weaker one, sits for mana once nothing is on it, keeps plague on every mob in the fight; Rogue sprints to get around. The sim then kites and moves like a real player, so balance numbers match real play. First draft for review: `docs/playbooks.md` (Nov 17) | H | M | 2 (with the testing grounds) |
| Fixed-step game rules for normal play too (the sim already runs fixed steps and seeded rolls), so fights play the same on any phone (from research) | L | S | later |
| **Boss 1 throws a bone instead of a purple beam** (owner, Nov 17): keep attacks thematic. A skeleton boss lobs a spinning bone you can see fly, not a laser. Could become a dodgeable projectile later (ties to boss telegraphs) | M | S | 2 (with the feel pass) |
| **Abilities rank up as you level** (owner, Nov 17): at set levels an ability gets a new step, not just bigger numbers. Example: Raise Bones gives the Necro a second skeleton, later a third. Every class gets a few of these milestones | H | M | 2–3 (after batch 2, with balance) |
| **No XP loss on death; a repair shop instead.** Dying damages your gear; a classic repair NPC fixes it for copper. A money sink, not a power cost. Owner, Nov 17: put one in later | M | M | 2–3 (with Town 1 or milestone 4) |

## Known issues
- **Batch 1 numbers are first drafts:** Shadow Knight loses most two-mob fights before level 8; Enchanter kills are slow (30–45s a single mob). Tune in the balance pass.
- New classes draw on the shared default body, and their pets reuse placeholder art (the minion is a dark recolour of the skeleton; the sword is a tiny sprite).
- **Sim bots play perfectly** (the Druid kites without ever getting hit from level 4 on; the Wizard and Enchanter bots take no damage at all outside Boss 1). Real phone play is sloppier, so sim numbers are a best case; judge fun by playing.
- **Melee classes can't solo Boss 1 yet.** Quick sim (perfect rotation, no gear): Rogue at level 8 gets Boss 1 to about a third of its health before dying; Warrior at level 8 to about half. Rogue has no self-heal. Sim (v0.16, playbook bots): Warrior leaves Boss 1 at about half health, Rogue at 42–64% depending on the Evade playbook. Fix in the balance pass (testing grounds), not one class at a time. Batch 1 (v0.17 sim, level 8): Cleric wins Boss 1 9/10, Paladin 5/10; Shadow Knight, Wizard and Enchanter never.
- Boss 1 is the skeleton sprite scaled up 3x, so its pixels are chunkier than everything else. Placeholder until the art pass draws it at full size.
- Lag and jitter reported on phone (v0.8): fixed in v0.8.1; confirm on device.
- Sprites draw on top of tree canopies (no depth sorting with scenery).
- Gate Road mobs top out at level 5, so overworld leveling slows after 5–6 until more zones exist.
- The game pauses while menus are open (fine for single-player; an MMO wouldn't pause).

## Changelog
- **Docs (Nov 17)** Batch 2 first draft in `docs/playbooks.md`: Magician (pick your elemental, Detonate), Ranger (shoots while moving, traps), Monk (Feign Death splits pulls), Shaman (stacking DoTs, Drowsy, totems, Cannibalize), Bard (two songs always on). Owner notes logged: Cleric staying near-unkillable is fine; Warrior should be the ultimate tank (backlog card, balance pass). No game changes.
- **Docs (Nov 17)** Rogue's Evade settled as damage (A): playbook updated, the sim runs only that version. No game changes for players.
- **Docs (Nov 17)** Research notes `docs/research/progression-and-retention.md` (leveling plan: cap 30 now and 50 planned, skill tree from level 5, 10–12 abilities by 30) and `docs/research/art-direction.md` (how to decide the look). design.md progression updated as "leaning"; backlog cards added. No game changes.
- **v0.17** **Batch 1: five new classes**, each with 8 abilities (levels 1–8), its own gear and Boss 1 drops, on the shared default skin, and a sim bot. Pick them on the start screen. **Cleric:** hammer and heals; every heal also burns nearby undead; Renew (heal over time), Holy Light, Daze, Turn Undead, Greater Heal, Divine Aura (4s immune, can't attack). **Enchanter:** no bolts; Mind Rot, **Mesmerize** (sleeps the closest extra mob coming at you; sleeping mobs show Zz and a timer; any hit wakes them), a floating sword pet, Slow Mind (slower moving and attacking), Clarity, **Charm** (a mob fights for you, the pet bar turns pink and counts down, then it breaks free and comes for you), Color Flash (area stun), Phantasm (decoy). **Paladin:** Lay on Hands, Holy Bash, Mend, Smite Undead, Taunt, **Consecrate** (gold ring on the floor: heals you inside, burns undead), Divine Strike. **Shadow Knight:** Siphon, Disease Cloud, Terror, a small minion, **Harm Touch** (costs 20% of your health), Feign Death, **Dark Cleave** (heals per mob hit). **Wizard:** Frost Bolt **chills** (stacking slow), Freeze, **Shatter** (huge on a frozen mob), Blink, Fireball, Frost Nova, Mana Shield, Gate (home to the guards). Mobs now have an **undead** tag (corpses, skeletons, Boss 1), shown in the target frame. Buffs now end when you die. Target frame names each DoT. No save changes; existing characters are untouched. Sim results in `docs/sim-results.md`.
- **v0.16** **Testing grounds and sim** (developer tools only; no gameplay or save changes). DEV panel → **Testing grounds**: **Go there** opens an empty walled arena (exit circle bottom left); **Rat / Beetle / Skeleton / Two skeletons / Boss 1** spawn a test fight at your level; **Bot plays me** lets the playbook bot play your character live in the arena; **Run sim** fights every scenario 10 times at levels 1, 4 and 8 for your class (about a minute) and shows kill time, rest time, damage taken, mana used, deaths and how much health the mobs had left when you lost. Bots for Druid, Warrior, Necromancer and Rogue (both Evade versions) follow `docs/playbooks.md`. The sim runs in fixed steps (30 per second) with seeded random rolls, so the same seed gives the same fight; your character, bags, journal and saves are put back afterward. First results: `docs/sim-results.md`.
- **v0.15** **Default skin:** one shared body for every class, told apart by clothes colour, trim, hair and weapon (staff, sword, mace, dagger, shield). New classes get it automatically by having an entry in `SKINS` (`js/data/sprites.js`) and no own sprite; the four current classes keep their sprites until the art redo. Colours are ready for all nine classes so far (the four current ones plus Cleric, Enchanter, Paladin, Shadow Knight, Wizard). DEV panel → **Look**: a **Default skin** toggle shows your class on the shared body, and a gallery shows all nine side by side. No gameplay or save changes.
- **v0.14.2** Removed the wide boss health bar across the top of the screen. Bosses now show only in the regular target frame (top right), like every other mob. Plan change on the board: all 14 classes in batches of 5 on a default skin, then balance, then an art redo. Batch 1 playbooks drafted.
- **v0.14.1** Safer saves (no gameplay change): all saving goes through one place (`js/save.js`). The save now carries a **version number**, and future changes come with an upgrade step so old characters carry over instead of breaking. Before upgrading, a backup copy of the old save is kept. Half-written or corrupted save entries are cleared instead of lingering. If the phone blocks storage (private browsing) or it's full, the game still runs and keeps progress for that session. Existing characters, levels, bags and settings carry over unchanged.
- **v0.14** Same game, new insides: `index.html` is split into `css/game.css` and 18 small `js/` files by job (data, map, state, combat, input, UI, world, update, render, dev, main). Game numbers now live in `js/data/` (classes, mobs, items, sprites). Every gameplay random roll goes through one `rng()` so the testing grounds can replay fights later. Headless test: all four classes load, cast every spell, enter Dungeon 1 and loot with no errors, same stats and loadouts as v0.13.1.
- **Docs (Nov 17)** Research notes in `docs/research/`: coding practices for a no-build browser game (file split, data vs. code, game loop, saves, seeded randomness, phone performance, testing) and MMO lessons (authoritative server, instancing, Koster's laws). No game changes.
- **v0.13.1** Rogue buff from play-test: **Backstab from Hide one-shots most mobs a level or two below you** (damage 12+4.5/level → 20+7/level). Backstab now also works from any side on a **stunned** mob (double damage) or an **Evaded** one (triple, can't miss, like an ambush), so the combo is Gouge → Backstab and Evade → Backstab with no fiddly stepping around. Stab, Rend and Gouge's cooldown a bit better; Rogue HP 48 + 14/level (was 44 + 13) and AC 8 (was 5).
- **v0.13** **Rogue** added (no mana, skills on cooldowns, leather armor). **Stab** (main attack), **Backstab** (only from Hide for triple damage that can't miss, or from behind for double), **Hide** (mobs don't notice you, you sneak at 70% speed and show see-through; using a skill or getting hit ends it), **Throwing Knife** (pull), **Gouge** (stun, lvl 2), **Rend** (bleed, lvl 3), **Evade** (lvl 5: mobs fighting you lose track for ~3s; Hide during it and they walk home), **Sprint** (lvl 7, +50% speed). Tapping an enemy from Hide opens with Backstab. Rogue gear (daggers, leathers) and three Boss 1 drops: Boss 1 Dagger, Jerkin and Parrying Blade. Auto-cast no longer swings at an Evaded mob. Start screen tip says "main attack" instead of "Tap spell".
- **v0.12.1** Layout from play-test: the **bottom bar is gone** (more room for the map). Slots 7–8 and **Sit** now stack on the left, right above the chat box, instead of squeezed beside it. **Menu** moved to the top right; the **1st hit / Auto** toggles moved to the top left under your portrait. The Character button is gone; tap your portrait instead. The chat box keeps a fixed height so it never runs up under the buttons.
- **v0.12** Hotbar and bottom bar: the bottom bar is now **Sit / Character / Menu**. Menu holds Spells, Arrange and Settings; the old Target button is gone (Next ⟳ above your spells does the same). Two new spell slots (7 and 8) sit as small buttons on the **left edge** (right edge in left-handed mode), in both joystick and tap-to-move. The Warrior's Throw Stone now has a slot; Druid and Necromancer slots 7–8 show "empty" until new spells arrive. Existing saves keep their arrangement. Keyboard 7 and 8 cast them. While arranging, the Menu button reads **Done**.
- **v0.11.7** Zoom out allowed one notch further than v0.11.6: the farthest (default) view is about 234 game pixels wide on a typical phone.
- **v0.11.6** Zoom out pulled in two notches after play-testing: the farthest view (also the default) is now about 195 game pixels wide on a typical phone instead of up to 290. Settings → Zoom is now Near / Far.
- **v0.11.5** Zoom and bosses: the view is zoomed out (about 40% more world on screen); **pinch** the map to zoom in or out, or pick Near / Normal / Far in Settings → Zoom (it's remembered). Pinching never walks or targets. Boss 1 draws at 3x player size, and a wide **boss health bar** appears across the top while a boss is fighting you. The camera can now scroll a little past the map's top edge so the top bars never cover you. Sharper screens on 3x phones (finer zoom steps); frame time unchanged in testing.
- **v0.11.4** Targeting: a **Next ⟳** button right above your spells switches to the next enemy mid-fight (same as the bottom bar's Target). The **1st hit** and **Auto** toggles moved to the top right under the target frame, since they're set between fights. DEV button and cast bar shifted down to make room.
- **v0.11.3** Joystick fix: while one finger holds the joystick, a quick tap on an enemy with another finger now targets it (and casts your main attack if **1st hit** is on). A second-finger tap on empty ground does nothing, so it never fights the joystick.
- **v0.11.2** Home-screen app: add the game to your phone's home screen and it opens full screen with its own icon (the Druid), no browser bars. Settings → Developer tools On/Off, since a home-screen app can't use `?dev` in its link.
- **v0.11.1** From the class play-test: dying now ends every fight (mobs forget you, lingering DoTs are cleared, and everything walks back to its spot; before, a DoT tick after you respawned could pull the mob back and your new skeleton would chase it); the skeleton dies with you; skeleton follow no longer jitters; two quick toggles above your abilities: **1st hit** (tapping an enemy casts your main attack) and **Auto** (keeps casting), also in Settings; all of Boss 1's gear now waits in the chest: one named item and one uncommon every time, plus a small rare chance; Lifetap heals 85% of its damage (was 100%).
- **v0.11** **Necromancer** added with the first pet: Raise Bones summons a skeleton that follows you, attacks what you're fighting and tanks (a threat system decides who mobs hit; the pet's hits count triple). Lifetap (main attack, heals you), Siphon Plague (strong DoT), Dread (fear: the mob runs away), Feign Death (mobs forget you and stay put, no reset), Mend Bones (heal the pet). Pet HP bar under your health. Caster gear is shared by Druid and Necromancer. **Developer tools:** open the game once with `?dev` for a DEV button: level up/down, full heal, reset cooldowns, god mode, kill target, give gear, teleports (gate, crypt door, dungeon start, boss room), spawn Old Gnawbone, wipe saves. Turn off with `?dev=0`.
- **v0.10** Class system: classes are data (stats, abilities, loadout, sprite); abilities are generic kinds (nuke, heal, dot, root, snare, buff, stun, cleave). Spells grow each level: more damage and healing, longer roots, snares and stuns. Each class has its own level, bags and loadout; pick your class on the start screen (or Settings → Change class). **Warrior** added: no mana, high HP, built-in plate armor, Strike, Bandage, Throw Stone, Shield Bash (stun), Hamstring, Defensive Stance, Cleave; STR stat and warrior gear; personal loot only drops gear your class can use; Boss 1 drops a Warrior blade, breastplate or shield for Warriors. Dungeon: the entrance exit is blocked while something is chasing you; the end portal only appears after Boss 1 dies.
- **v0.9** From the first dungeon play-test: no leashing (mobs chase until someone dies or the guards step in, so running out of range no longer resets them); mobs much faster (24–31 vs the Druid's 34), so kiting needs snares; shorter Dungeon 1 (13 mobs, room 3 is now a quiet passage); dungeon mobs ~10% tougher, Boss 1 +18% HP, shadow bolt every 7s; an ending: Boss 1 leaves a chest (copper + uncommon item) and a way out with a run summary (time, kills, XP, gear).
- **v0.8.2** Test shortcut: add `?level=7` to the game link to jump to that level (prototype only).
- **v0.8.1** Performance: lighting is now drawn from pre-made light stamps instead of rewriting every pixel each frame (about 3x faster on a slowed-down test CPU: ~55 ms to ~18 ms per frame); the camera follows a rounded player position so the Druid no longer shimmers; screen resolution capped at 2x; HUD updates 10 times a second.
- **v0.8** Dungeon 1: crypt door at the back of the graveyard; five-room instanced crypt (levels 4–6 crypt rats and skeletons, social groups); Boss 1 (level 7, shadow bolt every 8s, calls two skeletons at half health); better dungeon drops; Boss 1 always drops a named item (staff, robe or charm); exit circle; death wakes you at the crypt entrance; the dungeon resets each time you enter. Placeholder names: Town 1, Dungeon 1, Boss 1.
- **v0.7.1** Per-spell cooldowns that shrink with level; countdown on buttons.
- **v0.7** Basic loot: personal drops, 16-slot bags, 8 gear slots, STA/WIS/INT/AC, copper, selling to Marrow, Character screen (Gear, Bags, Journal); spell queue so other spells work during auto-cast.
- **v0.6.2** Creeping Rot at level 2, Tanglefoot at 3.
- **v0.6.1** Movement options: tap + drag stick (shown or hidden) or hold to move.
- **v0.6** Auto-cast for the main spell; Thornlash instant; mana costs down, mobs tougher, more XP; kill journal.
- **v0.5.1** Two gate guards only; no line spam.
- **v0.5** Resists on all targeted spells, level-scaled durations, ~10 hours to level 10, mobs spread by level, guards, peddler, campfire, torches, signpost, critters, fireflies.
- **v0.4** Slower leveling and tougher mobs.
- **v0.3** Flick-or-tap spell pad, Arrange mode, smaller main button.
- **v0.2** Spell pad, classic buttons, drag-and-drop loadout, settings, joystick, smart targeting.
- **v0.1** First playable: Druid on the Gate Road.

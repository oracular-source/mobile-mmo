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
| 3b | Remaining launch classes (Rogue, Cleric, Enchanter) + testing grounds and balance | All six launch classes play like themselves and are roughly even in the sim | Now |
| 4 | Polish and gate review | A friend can play from a link without help | Later |

Gate review after milestone 4: 5–10 friends play, then decide whether the core is fun, web vs Godot, and whether to start phase 3 (multiplayer).

## Now
- **Launch classes baseline** (L, one release per class). Get all six launch classes playable at a baseline before any feel or balance work. Baseline = sprite, 6–8 abilities from level 1 to 8, class gear, Boss 1 drops; it plays like itself, not polished. The class identity pass happens inside each release. In order:
  1. ~~**Rogue**~~ Done in v0.13; buffed in v0.13.1 after play-test (felt undertuned).
  2. **Cleric** (pure healer): big slow heals and heals over time, hammer melee, strong vs undead. Slow solo outdoors.
  3. **Enchanter** (crowd control): mez (sleep until hit), charm (temporary pet that can break free), mana regen. Needs a touch-friendly mez control.
- Finished: UI and controls pass (v0.11.3–v0.12.1), layout approved on phone.

## Next
Owner asked for these Nov 17, before the rest of the class baseline (Cleric, Enchanter):
1. ~~**Research notes**~~ Done Nov 17: `docs/research/` (coding practices, MMO lessons). Art and assets research comes later, before the art pass.
2. ~~**Split `index.html` into files**~~ Done in v0.14: `css/game.css`, `js/` by job, `js/data/` for numbers. Plain scripts sharing one scope instead of ES modules (simpler, and still opens straight from disk). Next up: versioned saves (backlog, S) fits right after this; then class combos.
3. **Class combos saved as data:** each class gets a `rotation` (its solo combo) next to its abilities, so the sim plays every class the same way it's meant to be played, and the design doc lists them.
4. Continue Now: Cleric, then Enchanter.
5. **Balance by anchors** (owner's idea): tune the best soloer (Necromancer) and the worst (Cleric) first, then fit everyone else between them, using the testing grounds below.
6. **Testing grounds:** dev-only arena plus a headless sim where every class fights the same mobs at levels 1, 4 and 8; reports kill time, damage taken, mana used, deaths. Claude tunes numbers from it; the owner plays to judge fun.
7. **Balance pass** on all six launch classes using the testing grounds.
8. **Feel pass**, class by class: melee feel (hit sparks, knockback, swing), animations, sound.
9. Milestone 4: start screen polish, fix anything clearly broken.

## Decisions
- **Portrait (phone held upright).** Fits short sessions, playing in bed, and one-thumb targeting. Seeing more of the world comes from zooming out, not turning the phone.
- **Zoom:** farthest (and default) view is about 215–235 game pixels wide on most phones, tuned by play-test (v0.11.5's ~290 was too far, v0.11.6's ~195 too close). Players pick Near / Far or pinch.
- **Screen layout (v0.12.1):** max 8 ability buttons on screen: 6 on the right (pad or classic) plus slots 7–8 on the left, in joystick and tap-to-move alike. Left column above the chat box: slot 7, slot 8, Sit (kept on screen: Necros sit while the pet and DoTs fight). Top left under the portrait: 1st hit / Auto. Top right: Menu (Spells, Arrange, Settings). No bottom bar. Character = tap the portrait. Target button dropped; Next ⟳ does that job.
- **Launch six (Nov 17):** Warrior, Cleric, Druid, Enchanter, Rogue, Necromancer. Enchanter replaces Wizard (more unique); Wizard moves to later.
- **Classes before feel:** all launch classes reach baseline before animations, sound or feel work.
- **Balancing waits** until most launch classes exist. Until then, only fix obvious outliers.
- **Soloable, at different difficulty by class:** everything can be soloed, but pet classes (Necro) solo comfortably while tanks (Warrior) find it harder and are rewarded for grouping. Tell players this when they pick a class.

## Idea backlog
Value: H/M/L. Effort: S/M/L. Phase: when it fits.

| Idea | Value | Effort | Phase |
| --- | --- | --- | --- |
| Buff spells and a buff bar. Rules: a buff hits you and everyone nearby (Warriors: self only), no targeting; lasts until you die | M | M | 2 |
| Animations: walking, casting, attacking, pet movement | H | L | 2 (milestone 4, with the art pass) |
| Boss feel: slight screen shake on big boss attacks, and the camera pulls back when you enter a boss room | M | S | 2 (with the feel pass) |
| Warrior group tools: Charge (rush to a target) and a big-radius taunt shout | H | S | 2 |
| Short fight buffs (10–15 min) saved for hard fights or raids | M | M | later |
| Raids | M | L | phase 4+ |
| First Dungeon 1 visit is public: everyone shares it until they've reached the end (or been grouped); later visits are private. Lets Warriors find groups | H | L | phase 3 |
| Class picker shows how solo-friendly each class is (e.g. Warrior: groups recommended; Necro: strong solo) | M | S | 2 (milestone 4) |
| Tough mobs pay better: mire beetles take half damage (armor 0.5) but their Beetle Shell sells for 3 copper, less than a Brittle Bone (4). Raise to ~8 and always drop one; same rule for future armored mobs | M | S | 2 (with milestone 4) |
| Journal per dungeon: boss drops listed once found, like a bestiary | M | S | 2 |
| Sound effects (generated, CC0) | H | M | 2 (milestone 4) |
| Art pass: sprites, tiles and the overall look | H | L | 2 (milestone 4) |
| Simple minimap | M | M | 2 |
| Free-form HUD editor (place every button anywhere) | L | L | later |
| Stat points (3 per level) | M | M | later |
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
| Versioned saves: saves carry a version number and old saves get upgraded instead of breaking; storage errors never crash the game (from research) | H | S | 2 (right after the split) |
| Fixed-step game rules and seeded randomness, so fights play the same on any phone and the sim gives repeatable numbers (from research) | M | S | 2 (with the testing grounds) |

## Known issues
- **Melee classes can't solo Boss 1 yet.** Quick sim (perfect rotation, no gear): Rogue at level 8 gets Boss 1 to about a third of its health before dying; Warrior at level 8 to about half. Rogue has no self-heal. Fix in the balance pass (testing grounds), not one class at a time.
- Boss 1 is the skeleton sprite scaled up 3x, so its pixels are chunkier than everything else. Placeholder until the art pass draws it at full size.
- Lag and jitter reported on phone (v0.8): fixed in v0.8.1; confirm on device.
- Sprites draw on top of tree canopies (no depth sorting with scenery).
- Gate Road mobs top out at level 5, so overworld leveling slows after 5–6 until more zones exist.
- The game pauses while menus are open (fine for single-player; an MMO wouldn't pause).

## Changelog
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

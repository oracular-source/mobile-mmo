# Board

One place for the work: what's being built now, what's next, every idea, and what shipped. The game design lives in `design.md`; this file is the flow.

## How we work (lean)
- **One thing at a time (WIP = 1).** Finish, test, ship, then pull the next card.
- **Small batches.** Each change ships as its own version to the live link so it can be judged on a phone right away.
- **Pull, don't push.** Work comes from Now/Next. New ideas go to the Idea backlog first, never straight into the build.
- **Definition of done:** works in a headless test with no errors → docs updated (this board, `design.md` if rules changed) → committed and pushed → owner plays it on the phone.
- **Feedback loop:** play-test notes become cards. Defects get fixed before new features.
- **Prioritize by value ÷ effort.** Value = does it make the core loop more fun or answer an open question. Effort = S (one session), M (2–3), L (4+).
- **Single source of truth:** GitHub. The Claude design doc gets refreshed at milestones only.

## Roadmap (phase 2: solo prototype)
| # | Milestone | Done when | Status |
| --- | --- | --- | --- |
| 0 | Controls and core combat | You can fight and kite comfortably on your phone | Done (v0.6) |
| 1 | Basic loot | Kills feel rewarding between dings | Done (v0.7) |
| 2 | First dungeon | A run is fun enough to repeat | Done (v0.9) |
| 3 | Two more classes (Warrior, Necromancer) + real class system | Each class plays differently on the road and in the dungeon | In progress (class system + Warrior done) |
| 4 | Polish and gate review | A friend can play from a link without help | Later |

Gate review after milestone 4: 5–10 friends play, then decide whether the core is fun, web vs Godot, and whether to start phase 3 (multiplayer).

## Now
- **Warrior play-test** (S): does melee feel different from the Druid in a good way? Is the Warrior too tanky or too weak solo?

## Next
1. Necromancer: pet class (pet AI is the new system) (L)
2. Melee feel: hit sparks, small knockback, a swing animation (S)

## Idea backlog
Value: H/M/L. Effort: S/M/L. Phase: when it fits.

| Idea | Value | Effort | Phase |
| --- | --- | --- | --- |
| Buff spells and a buff bar showing active buffs and timers | M | M | 2 |
| Journal per dungeon: boss drops listed once found, like a bestiary | M | S | 2 |
| Sound effects (generated, CC0) | H | M | 2 (milestone 4) |
| Art pass: sprites, tiles and the overall look | H | L | 2 (milestone 4) |
| Simple minimap | M | M | 2 |
| Trigger for spell slots 7 and 8 (levels 15 and 25): second ring or two extra buttons | M | S | before level 15 content |
| Free-form HUD editor (place every button anywhere) | L | L | later |
| Stat points (3 per level) | M | M | later |
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

## Known issues
- Lag and jitter reported on phone (v0.8): fixed in v0.8.1; confirm on device.
- Sprites draw on top of tree canopies (no depth sorting with scenery).
- Gate Road mobs top out at level 5, so overworld leveling slows after 5–6 until more zones exist.
- The game pauses while menus are open (fine for single-player; an MMO wouldn't pause).

## Changelog
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

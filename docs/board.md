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
| 4 | Polish and gate review | A friend can play from a link without help | Later |

Gate review after milestone 4: 5–10 friends play, then decide whether the core is fun, web vs Godot, and whether to start phase 3 (multiplayer).

## Now
- **UI and controls pass** (M). Owner is switching to the joystick (more control, can move while casting). In order:
  1. ~~**Bug:** second finger can't target while the joystick is held.~~ Fixed in v0.11.3; confirm on phone.
  2. ~~**Better targeting:**~~ v0.11.4: a Next ⟳ button sits just above the spells; the 1st hit / Auto toggles moved to the top right (set between fights). Confirm on phone.
  3. **Rethink the bottom bar and hotbar** (see the Hotbar redesign card): what belongs on screen, what goes in menus, room for more spells.
  Talk through the layout with the owner before building step 3.

## Next
1. Class identity pass: with the UI settled, decide what each class should look and feel like.
2. Feel pass, all at once: melee feel (hit sparks, knockback, swing), animations, sound. Owner wants these done together, not piecemeal.
3. Milestone 4: start screen polish, fix anything clearly broken. **No big balance pass yet** (see Decisions).

## Decisions
- **Balancing waits** until most launch classes exist. Until then, only fix obvious outliers.
- **Soloable, at different difficulty by class:** everything can be soloed, but pet classes (Necro) solo comfortably while tanks (Warrior) find it harder and are rewarded for grouping. Tell players this when they pick a class.

## Idea backlog
Value: H/M/L. Effort: S/M/L. Phase: when it fits.

| Idea | Value | Effort | Phase |
| --- | --- | --- | --- |
| Buff spells and a buff bar. Rules: a buff hits you and everyone nearby (Warriors: self only), no targeting; lasts until you die | M | M | 2 |
| Animations: walking, casting, attacking, pet movement | H | L | 2 (milestone 4, with the art pass) |
| Hotbar redesign: small left-hand bar (shows in tap-to-move mode), room for more spells; covers slots 7 and 8. Joystick stays the default for new players | H | M | 2 |
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

## Known issues
- Lag and jitter reported on phone (v0.8): fixed in v0.8.1; confirm on device.
- Sprites draw on top of tree canopies (no depth sorting with scenery).
- Gate Road mobs top out at level 5, so overworld leveling slows after 5–6 until more zones exist.
- The game pauses while menus are open (fine for single-player; an MMO wouldn't pause).

## Changelog
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

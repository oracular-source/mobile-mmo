# Progress

## Done
- Design doc: vision, pillars, 14-class roster, Druid kit, Zone 1 mobs, roadmap, controls
- Art direction: dark 2D pixel art, 12x16 sprites
- Prototype v0.1: Gate Road map, Druid with 6 spells, rats, beetles, shambling corpses, Old Gnawbone, con colors, combat log, dusk lighting, saved level/XP
- Prototype v0.2 (controls update):
  - Spell pad: tap, hold (repeats while held), flick up/down/left/right; ring icons tappable
  - Classic buttons option: main button plus five fanned around it, hold to repeat
  - Spellbook with drag-and-drop loadout (or tap spell, tap slot); saved in the browser
  - Settings: control scheme, left-handed, tap-enemy casts or targets only, pad size, hold time, flick distance
  - Movement: tap to move, plus an invisible drag joystick anywhere on the game screen; WASD and keys 1–6 on desktop
  - No auto-attack; tapping an enemy casts the Tap spell at normal cost
  - Smart targeting (nearest enemy), range ring when out of range, no auto-walk
  - New spell order: Tanglefoot (snare) at 2, Creeping Rot at 4, Rootgrip at 6, Barkskin at 8
  - Shorter casts: Thornlash 0.4s, Rootgrip 0.6s, Mending Touch 1.2s; Tanglefoot, Creeping Rot and Barkskin instant

- Prototype v0.3 (controls polish):
  - Removed hold gestures everywhere; every spell is a flick or a tap
  - Spell pad: smaller center button, five ring spells at 72 degrees, flick toward a spell or tap it
  - Arrange mode: drag spells on the pad or buttons to swap them in place
  - Classic buttons: smaller main button, tap to cast

- v0.4 pacing: mob HP raised (even-level mob takes about 5-6 Thornlash hits); XP curve slowed to about 10 kills for level 2, then 15-18 per level; old saves reset

- v0.5 (EverQuest feel and a living gate):
  - Resist rolls on every targeted spell, scaled by level; no fizzles; mana still spent on a resist
  - Root, snare and DoT durations scale with level difference
  - Higher-level mobs hit harder
  - XP curve targets about 10 hours to level 10
  - Mobs spread by level: 1–2 at the gate, 2–3 down the road, 3–5 in the graveyard
  - Guards (two at the gate) kill mobs you drag to them; no XP or loot if they did most of the damage
  - Marrow the Peddler, campfire (doubles resting speed), wall torches, signpost, crows, frogs, fireflies, NPC chatter and speech bubbles
  - Several light sources in the dusk lighting

- v0.6:
  - Auto-cast for the main spell (on by default, Auto pill above the pad, also in Settings); pauses below 15% mana
  - Thornlash is now instant so auto-cast works while kiting
  - Mana costs about 15% lower; mobs +15% HP and +10% damage; XP per kill +25%
  - Journal (tap the Druid frame): named mobs slain or not yet slain, and kill counts per creature

- v0.6.1: movement options in Settings: tap + drag stick (stick can be shown or hidden) or hold to move (press and hold to walk toward your finger)

- v0.6.2: Creeping Rot moved to level 2 and Tanglefoot to level 3, so early armored beetles are beatable

- v0.7 (milestone 1, basic loot):
  - Personal loot straight into bags: junk per mob type, common gear (~11-15%), uncommon (~3-5%), a rare chest from level 4+ mobs (1%), Old Gnawbone always drops the Gnawed Ring
  - 16-slot bags, 8 gear slots (head, chest, legs, feet, hands, weapon, off-hand, ring)
  - Stats that matter: STA +3 HP, WIS +3 mana, INT +2% spell damage and healing, AC softens hits
  - Copper from kills; sell items or all junk to Marrow the Peddler (tap him up close)
  - Character screen from the Druid frame: Gear, Bags (with compare vs worn item), Journal
  - Spell queue: a spell tapped during the cooldown fires next, ahead of auto-cast
- v0.7.1: per-spell cooldowns that shrink as you level (Mending Touch 8s→4s, Creeping Rot 12s→6s, Tanglefoot 18s→10s, Rootgrip 24s→12s, Barkskin 30s→15s; Thornlash has none), countdown shown on the buttons

## Next (see docs/roadmap.md)
1. Play-test loot pacing: does something worth equipping drop often enough?
2. Milestone 2: first dungeon (needs a setting/title decision for names)

## Known issues / notes
- Gate Road mobs top out at level 5, so leveling slows sharply after 5-6 until the rest of Zone 1 is built (milestone 3).
- Sprites draw on top of tree canopies (no depth sorting with scenery yet).
- The game pauses while the Spellbook or Settings is open (single-player convenience; an MMO wouldn't pause).

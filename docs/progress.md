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

## Next (milestone 1: feel and polish, see docs/roadmap.md)
1. Tune numbers from phone play-tests
2. Sound effects (generated, CC0)
3. Fix sprites drawing over tree canopies
4. Old Gnawbone's add-summon at half health
5. Simple minimap

## Known issues / notes
- XP curve is boosted for testing (`need()` in the script).
- Sprites draw on top of tree canopies (no depth sorting with scenery yet).
- The game pauses while the Spellbook or Settings is open (single-player convenience; an MMO wouldn't pause).

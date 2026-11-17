# Progress

## Done
- Design doc: vision, pillars, 14-class roster, Druid kit, Zone 1 mobs, roadmap
- Art direction: dark 2D pixel art, 12x16 sprites
- Prototype v0.1 (`index.html`):
  - Gate Road map: town wall and gate, road, pond, trees, edge of the Sunken Graveyard
  - Druid with the 6 starting abilities (Thornlash, Mending Touch, Rootgrip, Barkskin, Creeping Rot, Tanglefoot), unlocking at levels 1, 1, 2, 4, 6, 8
  - Cast times, 1.5s global cooldown, moving cancels casts, sit to regen
  - Mobs: grave rats, mire beetles (armored), shambling corpses (slow, social pairs), Old Gnawbone (rare named)
  - EverQuest-style con colors, combat log, leashing, respawns, death with small XP loss
  - Dusk lighting with a dithered lantern glow
  - Level and XP saved in the browser

## Next
1. Play-test the kite loop at levels 4–8 and tune numbers
2. Old Gnawbone's add-summon at half health (in the design, not built yet)
3. Virtual joystick as a movement option
4. Loot window and simple inventory
5. Wolfwood Edge with blight wolves (flee at low health)

## Known issues / notes
- XP curve is boosted for testing (`need()` in the script).
- Sprites draw on top of tree canopies (no depth sorting with scenery yet).
- Druid melee auto-attack is a placeholder staff bonk.

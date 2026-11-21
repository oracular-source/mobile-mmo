# Sim results

Made by the testing grounds sim (`js/sim.js`), v0.24, Nov 18. Each class's bot plays by its playbook (`docs/playbooks.md`) with no gear, against mobs at its own level (Boss 1 is always level 7). **Every level from 1 to 10** (the level cap) is run now, and Boss 1 is tried from level 6 up, so you can see where a class turns the corner. Each line is 10 fights with fixed seeds 1000–1009, so running it again gives the same numbers until the game changes.

How to read it: **Kill** = seconds from the pull to the last mob dying (wins only). **Rest** = seconds sitting afterward to get back to 80% health and mana. **Dmg taken** and **Mana used** are per fight. **Mob HP left** = how much health the mobs still had when you lost. **Beats Boss 1** = the first level that wins 5 or more fights in 10 (a retry or two gets it done).

Run it yourself on the phone: open the game with `?dev`, DEV → Testing grounds → **Run sim** (runs the class you're playing; a few minutes now). The summary line above the table shows the first level that beats Boss 1.


## Dungeon 1 run (v0.63, Nov 20, map chat)
`runDungeon({seeds:2})` (open with `?debug`; `optional:true` adds the Bellringer's foundry): one run through Brother Malrec's chapel at level 15 (the cap is 16). Each camp or group is one arena fight (all its mobs at once), then rest to 80%, plus walking at 1.4× the straight line; a lost fight costs 25 s and one retry. Best case: bots play perfectly, the arena has no flood water (so the Prior's Grasp always misses and nobody wades) and fights don't chain. **Target (owner): 10–15 minutes.** Malrec column = his fight with both deacons (W win, D death, T timeout; seconds), two seeds, up to two tries each.

| Class | Run (min) | Deaths | Drowned Prior | Brother Malrec + 2 deacons |
| --- | --- | --- | --- | --- |
| Druid | 12.9, 10.6 | 3, 2 | W 33s, W 30s | D 79s D 152s · D 82s D 79s |
| Warrior | 11.5, 11.6 | 2, 2 | W 51s, W 42s | D 60s D 54s · D 62s D 60s |
| Necromancer | 9.2, 8.4 | 0, 0 | W 46s, W 46s | W 101s · W 56s |
| Rogue | 7.8, 7.8 | 2, 2 | W 25s, W 24s | D 28s D 32s · D 27s D 27s |
| Cleric | 12.8, 12.8 | 8, 4 | W 48s, W 44s | D 56s D 15s · D 15s D 15s |
| Enchanter | 10.2, 9.6 | 0, 0 | W 44s, W 43s | W 103s · W 68s |
| Paladin | 12.0, 11.4 | 6, 6 | W 27s, W 27s | D 44s D 44s · D 44s D 34s |
| Shadow Knight | 10.5, 9.9 | 1, 0 | W 40s, W 41s | D 26s W 86s · W 95s |
| Wizard | 12.5, 12.8 | 5, 3 | W 33s, W 33s | T 72s W 101s · T 90s W 121s |
| Magician | 12.2, 12.1 | 4, 4 | W 37s, W 35s | W 145s · W 142s |
| Ranger | 12.0, 10.3 | 2, 1 | W 36s, W 36s | W 94s · W 102s |
| Monk | 8.4, 8.5 | 0, 0 | W 34s, W 34s | W 81s · W 90s |
| Shaman | 9.6, 9.6 | 0, 0 | W 50s, W 50s | W 62s · W 66s |
| Bard | 12.0, 11.8 | 5, 6 | W 39s, W 41s | D 28s D 31s · D 26s D 29s |

**Reading it:** the run lands at 8–13 minutes, inside the target once real play's slop (wading, missed interrupts, the Prior's Grasp) is added. **8 of 14 beat Malrec at 15** (Necro, Enchanter, Shadow Knight, Wizard, Magician, Ranger, Monk, Shaman); Druid, Warrior, Rogue, Cleric, Paladin and Bard lose to Malrec plus two deacons at once, the same three-at-once weakness as the chapel camps. The **Cleric dies in about 15 s** to Malrec in most tries, which looks like a bot or kit problem worth a look. With the foundry (one seed): the Bellringer falls to Necro, Warrior, Enchanter, Cleric, Ranger, Rogue and Shaman (25–68 s), not the Bard; the run grows by about 1–3 minutes. Tuning this is the balance chat's job (Decisions: tune toward Malrec). Tuned once during the build: Malrec's heal 35% every 8 s → 25% every 10 s, deacons a little softer, his Ash Bolt every 7 s → 9 s, the Prior and the Bellringer given more health (they died in 25–45 s).

## Level 10 forks (v0.39, Nov 19, skill tree chat)
`__game.runForkSim({seeds:10})` (open with `?debug`): each class's level 10 fork, the base ability and both sides, at level 10 (the cap), 10 fights each, no gear. Fights: one skeleton, a pack of three, Old Gnawbone and the Skeleton King, both set to level 10 (long named fights). Each cell: wins · kill time · damage per second (all mob health, adds included, over the kill time) · damage taken. Rule (progression note): both sides a bit better than the base, about equal, better in different places; if one side wins everywhere, redesign.

Tuned once after the first run: Bone Knight hits harder (2.7 → 3.1 base), Thornsnare thorns halved (it beat the King 9 in 10 vs the base's 1 in 10), Tangle Field reaches farther and lasts longer (48px, 80%), Volatile 130% → 120%, Rebirth's blast 70% → 90%; the Shadow Knight bot now uses Rending Blow on a single mob.

| Class | Side | Single skeleton | Pack of 3 | Old Gnawbone | Skeleton King |
| --- | --- | --- | --- | --- | --- |
| Necromancer | Base Raise Bones | 10/10 · 18s · 15.8 dps · 0 taken | 9/10 · 34s · 25.7 dps · 162 taken | 10/10 · 23s · 25.4 dps · 45 taken | 10/10 · 49s · 20.9 dps · 255 taken |
| Necromancer | Bone Pair | 10/10 · 16s · 18.1 dps · 0 taken | 10/10 · 35s · 24.4 dps · 79 taken | 10/10 · 34s · 22.9 dps · 12 taken | 10/10 · 50s · 20.7 dps · 155 taken |
| Necromancer | Bone Knight | 10/10 · 18s · 15.9 dps · 0 taken | 10/10 · 36s · 24.0 dps · 98 taken | 10/10 · 41s · 18.1 dps · 20 taken | 10/10 · 50s · 20.8 dps · 190 taken |
| Druid | Base Tanglefoot | 10/10 · 13s · 22.2 dps · 0 taken | 10/10 · 48s · 18.1 dps · 0 taken | 10/10 · 35s · 22.6 dps · 0 taken | 1/10 · 52s · 19.8 dps · 158 taken |
| Druid | Thornsnare | 10/10 · 12s · 23.8 dps · 0 taken | 10/10 · 42s · 20.7 dps · 0 taken | 10/10 · 33s · 24.0 dps · 0 taken | 7/10 · 48s · 21.7 dps · 126 taken |
| Druid | Tangle Field | 10/10 · 13s · 22.2 dps · 0 taken | 10/10 · 43s · 20.1 dps · 0 taken | 10/10 · 37s · 21.6 dps · 0 taken | 1/10 · 52s · 19.7 dps · 158 taken |
| Warrior | Base Shield Bash | 10/10 · 18s · 15.6 dps · 74 taken | 5/10 · 53s · 16.3 dps · 278 taken | 10/10 · 37s · 21.3 dps · 69 taken | 10/10 · 58s · 17.8 dps · 234 taken |
| Warrior | Shield Slam | 10/10 · 19s · 15.4 dps · 48 taken | 8/10 · 54s · 15.8 dps · 270 taken | 10/10 · 41s · 19.4 dps · 63 taken | 10/10 · 59s · 17.5 dps · 191 taken |
| Warrior | Shield Sweep | 10/10 · 18s · 15.6 dps · 74 taken | 9/10 · 50s · 17.1 dps · 284 taken | 10/10 · 35s · 22.6 dps · 65 taken | 10/10 · 56s · 18.5 dps · 223 taken |
| Rogue | Base Evade | 10/10 · 12s · 23.1 dps · 21 taken | 1/10 · 31s · 27.6 dps · 200 taken | 10/10 · 25s · 22.1 dps · 32 taken | 9/10 · 38s · 27.4 dps · 162 taken |
| Rogue | Ambush | 10/10 · 12s · 23.4 dps · 21 taken | 2/10 · 30s · 28.9 dps · 192 taken | 10/10 · 25s · 22.1 dps · 32 taken | 9/10 · 34s · 30.8 dps · 152 taken |
| Rogue | Feint | 10/10 · 12s · 23.4 dps · 21 taken | 3/10 · 32s · 27.0 dps · 192 taken | 10/10 · 25s · 21.9 dps · 27 taken | 9/10 · 37s · 27.8 dps · 160 taken |
| Cleric | Base Renew | 10/10 · 15s · 20.0 dps · 93 taken | 9/10 · 36s · 24.0 dps · 402 taken | 10/10 · 51s · 15.5 dps · 290 taken | 10/10 · 41s · 25.0 dps · 225 taken |
| Cleric | Warding Renew | 10/10 · 15s · 18.9 dps · 77 taken | 9/10 · 37s · 23.3 dps · 370 taken | 10/10 · 51s · 15.5 dps · 290 taken | 10/10 · 43s · 24.1 dps · 215 taken |
| Cleric | Radiant Renew | 10/10 · 15s · 20.0 dps · 93 taken | 9/10 · 36s · 24.0 dps · 402 taken | 10/10 · 37s · 21.1 dps · 224 taken | 10/10 · 41s · 25.0 dps · 225 taken |
| Enchanter | Base Mesmerize | 10/10 · 16s · 18.0 dps · 0 taken | 10/10 · 51s · 16.7 dps · 0 taken | 10/10 · 85s · 9.3 dps · 0 taken | 10/10 · 102s · 10.1 dps · 58 taken |
| Enchanter | Deep Sleep | 10/10 · 16s · 18.0 dps · 0 taken | 10/10 · 54s · 16.0 dps · 0 taken | 10/10 · 92s · 8.8 dps · 2 taken | 10/10 · 100s · 10.4 dps · 58 taken |
| Enchanter | Mass Mez | 10/10 · 16s · 18.0 dps · 0 taken | 10/10 · 79s · 10.9 dps · 0 taken | 10/10 · 85s · 9.3 dps · 1 taken | 10/10 · 67s · 15.3 dps · 59 taken |
| Paladin | Base Consecrate | 10/10 · 12s · 25.1 dps · 59 taken | 10/10 · 22s · 38.9 dps · 329 taken | 10/10 · 39s · 20.5 dps · 179 taken | 10/10 · 33s · 31.1 dps · 316 taken |
| Paladin | Sanctuary | 10/10 · 12s · 25.1 dps · 47 taken | 10/10 · 22s · 38.7 dps · 253 taken | 10/10 · 39s · 20.5 dps · 161 taken | 10/10 · 34s · 30.9 dps · 310 taken |
| Paladin | Wide Consecrate | 10/10 · 12s · 24.5 dps · 59 taken | 10/10 · 28s · 31.6 dps · 394 taken | 10/10 · 25s · 31.3 dps · 107 taken | 10/10 · 36s · 28.9 dps · 339 taken |
| Shadow Knight | Base Dark Cleave | 10/10 · 18s · 16.8 dps · 35 taken | 0/10 · 316 taken | 10/10 · 34s · 23.7 dps · 81 taken | 10/10 · 54s · 19.1 dps · 340 taken |
| Shadow Knight | Reaping Cleave | 10/10 · 18s · 16.8 dps · 35 taken | 2/10 · 49s · 17.5 dps · 393 taken | 10/10 · 34s · 23.7 dps · 81 taken | 10/10 · 53s · 19.3 dps · 347 taken |
| Shadow Knight | Rending Blow | 10/10 · 17s · 17.6 dps · 25 taken | 0/10 · 319 taken | 10/10 · 42s · 18.8 dps · 97 taken | 10/10 · 54s · 18.9 dps · 332 taken |
| Wizard | Base Shatter | 10/10 · 11s · 25.4 dps · 0 taken | 10/10 · 41s · 21.7 dps · 0 taken | 10/10 · 37s · 22.1 dps · 0 taken | 9/10 · 55s · 18.7 dps · 100 taken |
| Wizard | Deep Shatter | 10/10 · 11s · 25.4 dps · 0 taken | 10/10 · 39s · 22.5 dps · 0 taken | 10/10 · 34s · 23.6 dps · 0 taken | 8/10 · 55s · 18.8 dps · 101 taken |
| Wizard | Shatter Burst | 10/10 · 11s · 25.4 dps · 0 taken | 10/10 · 38s · 23.4 dps · 0 taken | 10/10 · 33s · 24.5 dps · 0 taken | 8/10 · 55s · 18.7 dps · 108 taken |
| Magician | Base Detonate | 10/10 · 10s · 28.6 dps · 0 taken | 0/10 · 134 taken | 10/10 · 28s · 28.5 dps · 13 taken | 0/10 · 134 taken |
| Magician | Volatile | 10/10 · 10s · 28.6 dps · 0 taken | 2/10 · 31s · 27.9 dps · 130 taken | 10/10 · 25s · 31.2 dps · 8 taken | 0/10 · 134 taken |
| Magician | Rebirth | 10/10 · 10s · 28.6 dps · 0 taken | 0/10 · 134 taken | 10/10 · 29s · 27.5 dps · 15 taken | 0/10 · 134 taken |
| Ranger | Base Spike Trap | 10/10 · 13s · 22.2 dps · 0 taken | 10/10 · 53s · 16.1 dps · 0 taken | 10/10 · 67s · 12.0 dps · 0 taken | 9/10 · 58s · 17.7 dps · 159 taken |
| Ranger | Barbed Trap | 10/10 · 13s · 22.2 dps · 0 taken | 10/10 · 47s · 18.3 dps · 0 taken | 10/10 · 66s · 12.5 dps · 0 taken | 9/10 · 58s · 17.7 dps · 159 taken |
| Ranger | Blast Trap | 10/10 · 13s · 22.2 dps · 0 taken | 10/10 · 51s · 16.8 dps · 0 taken | 10/10 · 65s · 12.8 dps · 0 taken | 9/10 · 58s · 17.7 dps · 159 taken |
| Monk | Base Feign Death | 10/10 · 13s · 21.6 dps · 71 taken | 4/10 · 49s · 17.5 dps · 291 taken | 10/10 · 38s · 21.0 dps · 78 taken | 8/10 · 49s · 21.0 dps · 247 taken |
| Monk | Perfect Split | 10/10 · 13s · 21.6 dps · 71 taken | 3/10 · 54s · 15.9 dps · 300 taken | 10/10 · 39s · 20.2 dps · 66 taken | 9/10 · 47s · 22.0 dps · 222 taken |
| Monk | Still Water | 10/10 · 13s · 21.6 dps · 71 taken | 8/10 · 51s · 16.9 dps · 306 taken | 10/10 · 38s · 21.0 dps · 78 taken | 8/10 · 48s · 21.6 dps · 252 taken |
| Shaman | Base Drowsy | 10/10 · 19s · 15.2 dps · 0 taken | 10/10 · 37s · 23.4 dps · 0 taken | 10/10 · 41s · 19.4 dps · 0 taken | 10/10 · 57s · 18.3 dps · 163 taken |
| Shaman | Torpor | 10/10 · 19s · 15.2 dps · 0 taken | 10/10 · 37s · 23.4 dps · 0 taken | 10/10 · 41s · 19.4 dps · 0 taken | 10/10 · 57s · 18.3 dps · 163 taken |
| Shaman | Drowsy Cloud | 10/10 · 19s · 15.2 dps · 0 taken | 10/10 · 34s · 25.1 dps · 0 taken | 10/10 · 40s · 19.6 dps · 0 taken | 10/10 · 56s · 18.5 dps · 156 taken |
| Bard | Base Crescendo | 10/10 · 14s · 21.0 dps · 94 taken | 0/10 · 280 taken | 10/10 · 45s · 17.7 dps · 168 taken | 10/10 · 232s · 4.4 dps · 0 taken |
| Bard | Finale | 10/10 · 14s · 21.0 dps · 94 taken | 0/10 · 304 taken | 10/10 · 45s · 17.7 dps · 168 taken | 10/10 · 232s · 4.4 dps · 0 taken |
| Bard | Encore | 10/10 · 14s · 21.0 dps · 94 taken | 0/10 · 275 taken | 10/10 · 45s · 17.6 dps · 175 taken | 10/10 · 233s · 4.4 dps · 0 taken |

**Read:**
- **Clear trade-offs (keep):** Warrior (Slam takes less damage, Sweep wins packs), Cleric (Warding takes less damage, Radiant kills Gnawbone 14s faster), Paladin (Sanctuary takes less damage, Wide kills Gnawbone 14s faster), Monk (Still Water wins packs 8/10 vs 3/10, Perfect Split wins the King), Wizard and Ranger (close everywhere, small edges), Shaman (Cloud a bit faster on packs; Torpor shows nothing here because the bot kites, so attack speed rarely matters).
- **One side wins everywhere (redesign candidates, owner call):** **Necro** Bone Pair is faster or safer in every fight; Bone Knight doesn't yet win long named fights as planned. **Druid** Thornsnare still beats Tangle Field everywhere but packs (about equal there). **Magician** Volatile wins packs and Gnawbone; Rebirth plays like the base.
- **Not really tested by the bot:** Enchanter Mass Mez (the bot then wakes sleeping mobs one by one: slower but just as safe), Bard (the bot only Crescendos when low, so all three rows match), Rogue (all three close; packs still beat the Rogue).

## Zone 1 pace after the XP knobs (v0.34.1, Nov 19, map chat)
Same pace sim as below (DEV → Testing grounds → **Zone 1 pace**), after the three-knob XP system: mob XP from level × toughness; 20 more spawns (tunnel +6, graveyard +8, crypt +6) and the graveyard and crypt a level up. Kills per level: first try 6, 9, 12, 16, 21, 27, 34, 42, 52 reached 8 in 44–68 min, which the owner found a bit fast; now **x1.4: 8, 12, 17, 22, 29, 38, 48, 59, 73**. This run goes on to level 10 (there's nothing above level 7 in Zone 1 yet, so 8 to 10 is grinding the crypt; Wolfwood will take over there). 3 runs per class, perfect bots.

| Class | Level after lap 1 | Lap 1 (min) | Level after each area, lap 1 | Time to 8 | Time to 10 | Deaths (to 10) |
| --- | --- | --- | --- | --- | --- | --- |
| Wizard | 6.4 | 28 | 3.2 → 4.7 → 5.7 → 6.4 | 68 min | 2.7 h | 5 |
| Magician | 6.4 | 30 | 3.2 → 4.7 → 5.7 → 6.4 | 71 min | 2.9 h | 2 |
| Ranger | 6.7 | 31 | 3.2 → 4.7 → 5.7 → 6.8 | 74 min | 2.9 h | 2 |
| Rogue | 6.5 | 26 | 3.1 → 4.8 → 5.9 → 6.5 | 75 min | 2.6 h | 9.7 |
| Enchanter | 6.9 | 31 | 3.2 → 4.7 → 5.7 → 6.8 | 75 min | 3.1 h | 0 |
| Bard | 6.8 | 34 | 3.1 → 4.8 → 5.8 → 6.8 | 79 min | 3.3 h | 4.7 |
| Necromancer | 6.9 | 37 | 2.6 → 4.5 → 5.8 → 6.9 | 80 min | 3.1 h | 4.7 |
| Cleric | 6.5 | 34 | 3.1 → 4.8 → 5.9 → 6.5 | 82 min | 3.1 h | 6.7 |
| Druid | 6.4 | 37 | 1.5 → 4.7 → 5.8 → 6.4 | 83 min | 3.1 h | 12.7 |
| Monk | 6.5 | 32 | 3.1 → 4.7 → 5.7 → 6.5 | 86 min | 2.7 h | 7 |
| Shaman | 6.9 | 37 | 3.1 → 4.8 → 5.9 → 6.9 | 87 min | 3.4 h | 2.3 |
| Warrior | 6.4 | 34 | 3.2 → 4.7 → 5.7 → 6.4 | 88 min | 3.4 h | 4 |
| Paladin | 6.4 | 34 | 3.1 → 4.6 → 5.8 → 6.5 | 93 min | 3.0 h | 10 |
| Shadow Knight | 6.4 | 35 | 3.1 → 4.7 → 5.7 → 6.4 | 94 min | 3.8 h | 5.3 |

**What it says**
- **One lap of Zone 1 ends at level 6.4–6.9** (was 5.7 before v0.34.1) and takes 26–37 minutes. Every area ends inside its band, in the lower half: crossroads 3.1–3.2 (band 1–3), tunnel 4.5–4.8 (3–6), graveyard 5.7–5.9 (5–8), crypt 6.4–6.9 (6–9).
- **Wolfwood's 8 comes at 68–94 minutes; level 10 at 2.6–3.8 hours** (was 1.6–2.5 hours to 8 before v0.34.1). Real play is slower than the bots. Fastest: Wizard; slowest: Shadow Knight. That spread is kill speed (the balance chat's job); XP never looks at class.
- **Most deaths on the way to 10:** Druid 12.7 (one run lost a lot early to beetles at level 1–2), Paladin 10, Rogue 9.7.

## Zone 1 pace (v0.33.4, Nov 19, map chat)
How a fresh level-1 character climbs through the built areas (crossroads → rat tunnel → graveyard → crypt). New sim: `runPace()` in `js/sim.js`, DEV → Testing grounds → **Zone 1 pace** (runs the class you're playing, 3 runs, a few seconds). The bot does laps of all four areas and plays like a sensible player: it fights spawns from 3 levels below it to 2 above (easiest first), walks past the rest, and tries a named only when it's at most 1 level above. Fights run at each spawn's real level, XP is the game's own rule, a death costs the real 10% plus 25 s and one retry. Laps go on until level 8 (Wolfwood's door). Best case: bots play perfectly, no gear, no rares or chests, rest to 80%; real phone play will be slower.

| Class | Level after lap 1 | Lap 1 (min) | Level after each area, lap 1 | Laps to 8 | Time to 8 | Deaths | Gnawbone first beaten | King first beaten |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Enchanter | 5.7 | 20 | 3 → 4 → 5 → 5 | 6 | 1.6 h | 0.7 | 6 | 6 |
| Magician | 5.7 | 20 | 3 → 4 → 5 → 5 | 6.3 | 1.6 h | 2.3 | 6 | 7 |
| Rogue | 5.7 | 17 | 3 → 4 → 5 → 5 | 9 | 1.6 h | 8 | 6 (1/3) | 8 |
| Wizard | 5.7 | 19 | 3 → 4 → 5 → 5 | 8 | 1.7 h | 4.7 | 6 | 7 |
| Necromancer | 5.7 | 23 | 3 → 4 → 5 → 5 | 6.3 | 1.7 h | 2.3 | 5 | 6 |
| Monk | 5.7 | 21 | 3 → 4 → 5 → 5 | 8 | 1.8 h | 6.3 | 7 | 8 |
| Druid | 5.7 | 21 | 3 → 4 → 5 → 5 | 7.3 | 1.9 h | 5 | 5 | 8 (2/3) |
| Bard | 5.7 | 19 | 3 → 4 → 5 → 5 | 7 | 1.9 h | 4.3 | not by 8 | 6 |
| Cleric | 5.7 | 23 | 3 → 4 → 5 → 5 | 8 | 1.9 h | 6.7 | 7 (1/3) | 6 |
| Ranger | 5.7 | 21 | 3 → 4 → 5 → 5 | 7.7 | 2.0 h | 4 | 6 | 7 |
| Paladin | 5.7 | 24 | 3 → 4 → 5 → 5 | 8.3 | 2.0 h | 9 | 7 | 8 |
| Shaman | 5.6 | 24 | 3 → 4 → 5 → 5 | 6.7 | 2.0 h | 3 | 5 | 6 |
| Warrior | 5.7 | 23 | 3 → 4 → 5 → 5 | 8 | 2.2 h | 4.3 | 6 | 8 |
| Shadow Knight | 5.7 | 23 | 3 → 4 → 5 → 5 | 8.3 | 2.5 h | 6 | 6 | 8 |

**What it says**
- **Nobody outlevels Zone 1. It's the other way round.** One lap of everything (about 20 minutes) ends at **level 5.6–5.7 for every class**: crossroads 3, rat tunnel 4, graveyard 5, crypt 5 (the bot skips the crypt's skeletons and the back graves on lap 1 because they're too high). Every area ends **below the top of its band** (tunnel 4.6 vs 6, graveyard 5 vs 8, crypt 5.7 vs 9).
- **Getting to Wolfwood's 8 takes 6–9 more laps of the same four areas: 1.6–2.5 hours.** Fastest: Enchanter, Magician, Rogue (1.6 h); slowest: Warrior (2.2 h) and Shadow Knight (2.5 h). From level 6 on, a lap gives less than half a level (level 6 needs 8,400 XP, 7 needs 15,400).
- **Why:** the XP table was set for about 10 hours to level 10 at 50 kills an hour, but Zone 1 has only about 54 spawns in all, so there's far less to kill than the curve expects.
- **Named:** Old Gnawbone falls at 5–7 (the Bard bot never beats him by 8: its kite doesn't deal with his rats); the Skeleton King at 6–8.
- **Most deaths:** Paladin 9, Rogue 8, Cleric 7, Monk 6 (mostly pulls 2 levels above, and the King).

## Old Gnawbone (v0.29, map chat)
Old Gnawbone is level 6 and comes before the crypt, so he should go down earlier than the Skeleton King (7–8). Fight added to the testing grounds (`gnaw`, tried from level 5); `runSim({fights:['gnaw']})` runs just him. In the arena his rats appear beside him (no wall holes there). Wins in 10 at levels 5 · 6 · 7 · 8 (Druid, Enchanter, Ranger, Shaman, Wizard from the first run with 140 + 34/level health; the rest after the cut to 125 + 31/level):

| Class | Beats him at | Wins at L5 · 6 · 7 · 8 |
| --- | --- | --- |
| Druid, Enchanter, Ranger, Shaman, Wizard | 5 | 10 · 10 · 10 · 10 |
| Necromancer | 6 | 3 · 10 · 10 · 10 |
| Warrior | 6 | 0 · 9 · 10 · 10 |
| Magician | 6 | 0 · 9 · 4 · 10 |
| Monk | 7 | 0 · 0 · 10 · 10 |
| Shadow Knight | 7 | 0 · 3 · 10 · 10 |
| Paladin | 7 | 0 · 0 · 8 · 10 |
| Rogue | 8 | 0 · 1 · 0 · 10 |
| Cleric | 8 | 0 · 0 · 1 · 9 |
| Bard | 8 | 0 · 0 · 0 · 8 |

Rogue, Cleric and Bard need level 8, the same as the King: the extra rats are what kill them. For the balance lane to look at.

## The yardstick (owner, Nov 17)
Beating the level-7 Boss 1 at level 6–8 is fine. Needing level 9 is borderline. **Needing level 10 (the cap), or never, means the class needs a different look for soloing.** Losing two skeletons at level 1 is fine: pull singles at level 1.

## First level that beats Boss 1 (v0.24)
| Class | Beats Boss 1 at | Was (v0.23) | Wins at L6 · 7 · 8 · 9 · 10 | Boss 1 kill at L8 (s) | DPS on Boss 1 at L8 | L1 skeleton, kill + rest (s) | Two skeletons from (was) | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bard | level 6 | level 6 | 10 · 10 · 10 · 10 · 10 | 247 | 2.2 | 18 | level 4 (4) | Fine |
| Cleric | level 7 | level 7 | 0 · 10 · 10 · 10 · 10 | 53 | 10.4 | 18 | level 2 (2) | Fine |
| Enchanter | level 7 | level 7 | 3 · 10 · 10 · 10 · 10 | 91 | 6.1 | 19 | level 1 (1) | Fine |
| Magician | level 7 | level 7 | 0 · 8 · 10 · 10 · 10 | 82 | 6.7 | 15 | level 3 (3) | Fine |
| Necromancer | level 7 | level 7 | 2 · 7 · 9 · 10 · 10 | 49 | 11.3 | 16 | level 4 (4) | Fine |
| Shaman | level 7 | level 6 | 4 · 7 · 10 · 10 · 10 | 55 | 10.2 | 16 | level 4 (4) | Fine |
| Druid | level 8 | level 8 | 0 · 0 · 8 · 10 · 10 | 52 | 10.7 | 17 | level 3 (3) | Fine |
| Monk | level 8 | level 8 | 0 · 0 · 6 · 10 · 10 | 51 | 11.0 | 17 | level 5 (5) | Fine |
| Paladin | level 8 | level 8 | 0 · 0 · 10 · 10 · 10 | 35 | 15.9 | 19 | level 4 (4) | Fine |
| Ranger | level 8 | level 8 | 2 · 1 · 9 · 10 · 10 | 69 | 8.1 | 14 | level 1 (1) | Fine |
| Rogue | level 8 | level 8 | 0 · 0 · 6 · 10 · 10 | 39 | 14.4 | 12 | level 2 (2) | Fine |
| Shadow Knight | level 8 | level 8 | 0 · 0 · 6 · 10 · 10 | 56 | 9.8 | 18 | level 6 (6) | Fine |
| Warrior | level 8 | level 8 | 0 · 0 · 7 · 10 · 10 | 59 | 9.5 | 17 | level 1 (1) | Fine |
| Wizard | level 8 | level 8 | 0 · 2 · 6 · 8 · 10 | 61 | 9.1 | 19 | level 1 (1) | Fine |

*Two skeletons from* = first level that wins 8 or more in 10. *Was* = v0.23. *Boss 1 kill* = average seconds for a win at level 8. *DPS* = Boss 1's health (555 at level 7) divided by that kill time, so it leaves out the two skeletons it calls; a rough guide to how fast each class hurts it. *L1 skeleton* target: about 12–22s for every class.

## Shaman pass (v0.24, Nov 18)
Owner's call: **Spirit of the Wolf doesn't work in fights** (a travel spell; using it to out-run a boss defeats the purpose).
- **Spirit of the Wolf:** no speed while anything is fighting you; the buff stays on and works again once the fight ends. Alone this only moved the Shaman from 10/10 to 9/10 at level 6: at normal speed it still out-walks Boss 1.
- **Drowsy no longer slows Boss 1's casting** (only its attacks). Slowing a boss's spells is now the Enchanter's thing alone (Slow Mind). With a normal-speed bolt the Shaman can't step out of every one. 6 → **7** (4/10 at 6, 7/10 at 7, 10/10 at 8).
- Tried first and left out: weaker heal, less health, weaker DoTs; none moved it.
- Every other class unchanged. **Now: Bard 6; Cleric, Enchanter, Magician, Necromancer, Shaman 7; the rest 8.**

## Even-out pass (v0.23, Nov 18)
Owner's target: every class beats Boss 1 at **level 7 or 8**, a close range rather than an exact level; the Bard stays at 6 (its ~4-minute kite is the cost).
- **Boss 1 a little easier:** health 260 + 46/level → **247 + 44/level** (582 → 555 at level 7, about 5% less). This alone moved the Druid from 9 to 8.
- **Rogue:** **Gouge** cooldown 12s → 10s (about 7s at level 8, so it's ready for most bolts), stun 2.5s → **3.5s**, and the bot **saves Gouge for Boss 1's bolt** instead of using it on cooldown. Health 48 + 14/level → 50 + 15/level. 9 → **8** (6/10). The bolt was already being broken; the Rogue was losing the melee race once the two skeletons came, and the longer stun buys that time back.
- **Monk:** **Leg Sweep** cooldown 14s → 10s, and the bot saves it for the bolt (it used to be spent on cooldown, so 3–4 bolts landed every fight; now almost none do). 9 → **8** (6/10).
- **Enchanter:** **Color Flash at level 7** (was 6) and health 34 + 10/level → 34 + 9/level. Color Flash was what broke the bolt at 6. 6 → **7** (3/10 at 6, 10/10 at 7).
- **Wizard (sim fix, not a game change):** the bot cast Gate whenever its *target* was above 40% health, and after Boss 1 calls its skeletons the target is often a fresh skeleton, so it ran from fights it was winning. It now judges by the boss. It had slipped to level 9 with the boss change; back to **8**.
- **Shaman: unchanged (level 6), see below** (fixed in v0.24, above).

**Why the Shaman won't come down (finding):** with Spirit of the Wolf it runs 30% faster than Boss 1, its DoTs need no standing still, and it steps out of the bolt's range every time. Tried, one at a time and together: weaker DoTs, a weaker and pricier heal, less health, and stopping Drowsy from slowing the cast. Every run still won 10/10 at level 6. A test with **no heal at all** also won 10/10, and took *less* damage: standing still to heal is the only time bolts land. Bringing it to 7 means changing how the kite works, not its numbers. Options are on the board.

**Early levels unchanged:** the level-1 skeleton still takes 12–19s for every class.

## Early-levels pass (v0.21, Nov 18)
Goal (owner OK, Nov 18): every class kills a level-1 skeleton in roughly 12–22s with a spammable starter, and no class front-loads a big cooldown. Before → after (level-1 skeleton, kill + rest):
- **Shaman: Spear Jab** (level 1 melee, spammable; still never a bolt). 48s → **17s**. Levels 1–3 the Shaman stands and jabs with Drowsy and Sicken ticking; the kite starts with Swarm at 4. Level 3 was 43s → 16s. Two skeletons now from level 4 (was 1): pull singles early.
- **Enchanter: Mind Lash** (cheap instant hit, spammable). 43s → **20s**, and kills are about twice as fast at every level (level-4 skeleton 44s → 19s). Boss 1 level 7 → **6**, with a faster kill. Clarity starts in the spellbook.
- **Necromancer:** Siphon Plague at level 1, Raise Bones at **level 4**. 28s → **16s**. No pet before 4 means two skeletons only from level 4 (was 1). Boss 1 unchanged (7).
- **Paladin:** Mend at level 1, Lay on Hands at **level 5**. Single skeleton unchanged (19s). Without Lay on Hands, two skeletons go from level 4 (was a wobbly 1). Boss 1 unchanged (8).
- **Rogue:** Stab 10+4/level → 7+2.8 (like the other melee starters), Backstab 20+7 → 10+6: from Hide it still one-shots mobs about two levels below you, not even ones. 5s → **12s**. Two skeletons from level 2 (was 1). Boss 1 unchanged (9).
- Everyone else unchanged (their kits weren't touched; numbers match v0.18.4).

## Per-class pass (v0.18.4)
One change per class, smallest that does the job, each tried in the sim first:
- **Rogue: Dodge** (passive): a quarter of melee hits miss outright. Level 10 → **9** (8/10). 20% gave 9 at 5/10; 30% gave 8/10 at 9 but still only 4/10 at 8. The Rogue stays "borderline", which fits "weak solo, best with a tank". Evading Boss 1 for the full 3s (instead of half) was tried first: no real change, reverted.
- **Magician: Stone Fist** on the Earth elemental: when the mob it's fighting starts a spell, it slams it (0.5s stun) and breaks the cast, then waits 10s. The Magician was dying to the bolt (no stun of its own). Level 10 → **7**, same as the Necro, as its description says. It's automatic, so it holds up on a phone too.
- **Bard: kites bosses** (owner's pick: slow but safe). Song of Travel + Dirge, dragging Boss 1 just inside Dirge's reach, out of range when it casts. Dirge doubled (2+1/level → 4+2/level) so the kite ends inside the time limit. Never → **level 6**, 10/10, no damage taken in the sim, but Boss 1 takes **~4 minutes** at level 8 (5.5 at level 6, about 3.3 at level 10). Kiting with Dirge unchanged ran out the 7-minute limit; tripled took ~3 minutes. On the road the Bard still melees (Chant and Discord from level 6), so its normal fights barely change.
- **Enchanter: slows slow casting.** An attack slow on a boss (Slow Mind 60%, the Shaman's Drowsy 40%) also slows its spellcasting: the cast bar fills slower and the gap between bolts grows (about 11s instead of 7 under Slow Mind). The Enchanter was dying only to the bolt. Level 10 → **7** (9/10 at 7, 5/10 at 8, 9/10 at 9: it wobbles). Kills stay slow (~2.5 minutes). Shaman unchanged (level 6).
- **Shadow Knight: Dark Cleave at level 5, Harm Touch at 8** (swapped). Its "likes two mobs" twist only arrived at level 8 before. Two skeletons from level 8 → **6**; Boss 1 unchanged (level 8).
- **Left alone:** Druid and Monk (level 9, borderline). Druid sits right on the line (3/10 at level 8). Shaman stays at 6: inside the "fine" range.

## What stands out (v0.18.4)
- **Every class beats Boss 1 by level 9.** Fine (6–8): Bard, Shaman 6; Cleric, Enchanter, Magician, Necromancer 7; Paladin, Ranger, Shadow Knight, Warrior, Wizard 8. Borderline (9): Druid, Monk, Rogue.
- **Fight length varies a lot:** Paladin and Rogue ~35s, most classes 50–70s, Magician ~85s, Enchanter ~2.5 min, Bard ~4 min. The slow ones are safe (Bard takes almost no damage).
- **Two skeletons:** Shadow Knight and Monk from level 6, Bard 4, Druid and Magician 3, Cleric 2, everyone else from level 1.
- **Bots play perfectly** and interrupt every bolt they can. On a phone, classes that rely on manual interrupts (Necro, Cleric, Shadow Knight, Warrior) will feel harder; the Magician's Stone Fist and the Enchanter's slow are automatic once set up. The Bard's kite gets harder in a real room with walls and adds than in the open arena.

## Boss telegraph (v0.18.3)
Boss 1's shadow bolt is now a **2-second cast** with a purple bar (in the target frame and over its head). Boss 1 stands still while casting. **Counters:** a stun or fear in that window interrupts it (Evade and Feign Death too); being out of range (110) when it lands, Deflect or Divine Aura makes it miss. Rhythm unchanged: one bolt about every 7s. Damage unchanged.

Every bot got one shared rule, checked before its playbook: when Boss 1 starts casting, use a stun or fear that reaches; if it has none ready and is below 60% health, step out of range if it can make it in time.
- **Moved up:** Necromancer 9 → **7** (Dread interrupts), Cleric 8 → **7** (Daze), Warrior 9 → **8** (Shield Bash), Shadow Knight 10 → **8** (Terror), Wizard 10 → **8** (stepping out of range), Monk 10 → **9** (Leg Sweep), Enchanter never → **10** (Color Flash).
- **No change:** Shaman 6, Paladin 8, Rogue 10, Magician 10, Bard never.
- **Slipped a little:** Ranger 7 → 8 and Druid 8 → 9 (3 wins in 10 at level 8, was 5). Neither has a stun; they lose a little damage dodging. Druid and Wizard sit right on the 5-in-10 line: whether bots dodge from 60% or 80% health flips them (80%: Druid 8, Wizard 9). Treat both as "about level 8–9".
- Rogue and Bard lost the melee race; the Magician did die to the bolt (about 110 of its 124 health at level 9). Fixed in v0.18.4.

## Warrior pass (v0.18.2)
Hold the Line (20% less damage per mob on you, up to 3, so 20–60%) and Last Stand (once a fight, a killing blow leaves you at 1 HP and nothing can drop you lower for 5s; the bot Bandages in that window). Before → after:
- **Two skeletons:** never (1 win in 100) → **10/10 at every level from 1**.
- **Boss 1:** never → **level 9** (4/10 at level 8, Boss 1 left at 12% in losses; 10/10 at 9). Borderline, one level short of the "by 8" target.
- **Kills stay slow:** same kill times as before (skeleton 16–19s, Boss 1 about a minute). Damage taken on an even skeleton went from ~42% of health to ~33%.
- Tried first: 10% per mob (up to 4) only fixed two skeletons; Boss 1 still only at 10. 15% per mob: Boss 1 at 9 (6/10). The bolt from Boss 1 counts toward Hold the Line too.
- Full rerun of all 14 (Nov 17) changed nothing else: v0.18.2 only touched the Warrior.

## Earlier runs
v0.18.4 (per-class pass, before the early-levels pass): Bard, Shaman 6; Cleric, Enchanter, Magician, Necromancer 7; Paladin, Ranger, Shadow Knight, Warrior, Wizard 8; Druid, Monk, Rogue 9. Level-1 skeleton kill + rest: Shaman 48s, Enchanter 43s, Necro 28s, Rogue 5s, most others 13–19s.

v0.18.3 (telegraph, before the per-class pass): Shaman 6; Cleric, Necromancer 7; Paladin, Ranger, Shadow Knight, Warrior, Wizard 8; Druid, Monk 9; Rogue, Magician, Enchanter 10; Bard never. Shadow Knight two skeletons from level 8.

v0.18.1 (before the Warrior pass and the telegraph): Shaman 6, Ranger 7, Cleric, Druid, Paladin 8, Necromancer 9; Rogue, Magician, Wizard, Shadow Knight, Monk 10; Warrior, Enchanter, Bard never. v0.16–v0.18 ran only levels 1, 4 and 8 with Boss 1 at 8. Rogue's Evade comparison (A as damage vs B as escape) is settled as A; see the board's decisions.

## Tables (every level, v0.24)

### Druid

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 3

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 8 | 1 | 10 | 31 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 16 | 4 | 30 | 58 | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 3 | 39 | 53 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 60 | 37 | 62% |
| 2 | Rat | 10/10 | 0 | 8 | 1 | 14 | 31 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 17 | 4 | 39 | 61 | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 3 | 51 | 53 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 80 | 41 | 61% |
| 3 | Rat | 10/10 | 0 | 10 | 3 | 0 | 40 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 13 | 4 | 0 | 52 | – |
| 3 | Skeleton | 10/10 | 0 | 13 | 4 | 0 | 50 | – |
| 3 | Two skeletons | 10/10 | 0 | 37 | 7 | 0 | 97 | – |
| 4 | Rat | 10/10 | 0 | 10 | 2 | 0 | 40 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 13 | 3 | 0 | 52 | – |
| 4 | Skeleton | 10/10 | 0 | 13 | 3 | 0 | 50 | – |
| 4 | Two skeletons | 10/10 | 0 | 34 | 6 | 0 | 97 | – |
| 5 | Rat | 10/10 | 0 | 10 | 1 | 0 | 40 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 13 | 2 | 0 | 52 | – |
| 5 | Skeleton | 10/10 | 0 | 13 | 2 | 0 | 50 | – |
| 5 | Two skeletons | 10/10 | 0 | 33 | 5 | 0 | 95 | – |
| 6 | Rat | 10/10 | 0 | 10 | 1 | 0 | 40 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 13 | 2 | 0 | 52 | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 2 | 0 | 50 | – |
| 6 | Two skeletons | 10/10 | 0 | 32 | 5 | 0 | 114 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 117 | 118 | 49% |
| 7 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 13 | 1 | 0 | 52 | – |
| 7 | Skeleton | 10/10 | 0 | 13 | 1 | 0 | 50 | – |
| 7 | Two skeletons | 10/10 | 0 | 32 | 6 | 0 | 113 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 124 | 128 | 31% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 13 | 1 | 0 | 52 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 1 | 0 | 50 | – |
| 8 | Two skeletons | 10/10 | 0 | 32 | 5 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 8/10 | 2 | 52 | 11 | 99 | 167 | 9% |
| 9 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 13 | 0 | 0 | 52 | – |
| 9 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 50 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 3 | 0 | 106 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 46 | 9 | 89 | 166 | – |
| 10 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 13 | 0 | 0 | 52 | – |
| 10 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 50 | – |
| 10 | Two skeletons | 10/10 | 0 | 32 | 2 | 0 | 109 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 50 | 6 | 99 | 150 | – |

### Warrior

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 7 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 1 | 21 | – | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 1 | 25 | – | – |
| 1 | Two skeletons | 10/10 | 0 | 31 | 5 | 67 | – | – |
| 2 | Rat | 10/10 | 0 | 12 | 0 | 8 | – | – |
| 2 | Beetle (armored) | 10/10 | 0 | 22 | 1 | 24 | – | – |
| 2 | Skeleton | 10/10 | 0 | 17 | 1 | 28 | – | – |
| 2 | Two skeletons | 10/10 | 0 | 34 | 4 | 84 | – | – |
| 3 | Rat | 10/10 | 0 | 14 | 0 | 14 | – | – |
| 3 | Beetle (armored) | 10/10 | 0 | 23 | 1 | 31 | – | – |
| 3 | Skeleton | 10/10 | 0 | 19 | 1 | 36 | – | – |
| 3 | Two skeletons | 10/10 | 0 | 38 | 5 | 109 | – | – |
| 4 | Rat | 10/10 | 0 | 14 | 0 | 17 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 23 | 1 | 36 | – | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 1 | 40 | – | – |
| 4 | Two skeletons | 10/10 | 0 | 39 | 5 | 125 | – | – |
| 5 | Rat | 10/10 | 0 | 14 | 0 | 19 | – | – |
| 5 | Beetle (armored) | 10/10 | 0 | 23 | 1 | 41 | – | – |
| 5 | Skeleton | 10/10 | 0 | 19 | 1 | 46 | – | – |
| 5 | Two skeletons | 10/10 | 0 | 39 | 6 | 142 | – | – |
| 6 | Rat | 10/10 | 0 | 14 | 0 | 21 | – | – |
| 6 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 47 | – | – |
| 6 | Skeleton | 10/10 | 0 | 19 | 2 | 54 | – | – |
| 6 | Two skeletons | 10/10 | 0 | 40 | 6 | 155 | – | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 199 | – | 55% |
| 7 | Rat | 10/10 | 0 | 14 | 0 | 25 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 53 | – | – |
| 7 | Skeleton | 10/10 | 0 | 19 | 2 | 59 | – | – |
| 7 | Two skeletons | 10/10 | 0 | 40 | 5 | 165 | – | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 223 | – | 27% |
| 8 | Rat | 10/10 | 0 | 14 | 0 | 27 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 60 | – | – |
| 8 | Skeleton | 10/10 | 0 | 19 | 2 | 66 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 39 | 6 | 181 | – | – |
| 8 | Boss 1 (lvl 7) | 7/10 | 3 | 59 | 7 | 214 | – | 19% |
| 9 | Rat | 10/10 | 0 | 14 | 0 | 26 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 59 | – | – |
| 9 | Skeleton | 10/10 | 0 | 19 | 2 | 67 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 39 | 5 | 186 | – | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 56 | 5 | 180 | – | – |
| 10 | Rat | 10/10 | 0 | 14 | 0 | 28 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 64 | – | – |
| 10 | Skeleton | 10/10 | 0 | 19 | 2 | 73 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 39 | 6 | 201 | – | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 50 | 5 | 151 | – | – |

### Rogue

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 2

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 6 | 0 | 2 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 14 | 1 | 15 | – | – |
| 1 | Skeleton | 10/10 | 0 | 11 | 1 | 15 | – | – |
| 1 | Two skeletons | 6/10 | 4 | 26 | 10 | 58 | – | 12% |
| 2 | Rat | 10/10 | 0 | 6 | 0 | 3 | – | – |
| 2 | Beetle (armored) | 10/10 | 0 | 15 | 0 | 13 | – | – |
| 2 | Skeleton | 10/10 | 0 | 11 | 0 | 13 | – | – |
| 2 | Two skeletons | 9/10 | 1 | 25 | 11 | 63 | – | 11% |
| 3 | Rat | 10/10 | 0 | 8 | 0 | 4 | – | – |
| 3 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 13 | – | – |
| 3 | Skeleton | 10/10 | 0 | 12 | 0 | 17 | – | – |
| 3 | Two skeletons | 10/10 | 0 | 24 | 11 | 71 | – | – |
| 4 | Rat | 10/10 | 0 | 7 | 0 | 4 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 15 | – | – |
| 4 | Skeleton | 10/10 | 0 | 11 | 0 | 18 | – | – |
| 4 | Two skeletons | 10/10 | 0 | 24 | 12 | 83 | – | – |
| 5 | Rat | 10/10 | 0 | 9 | 0 | 6 | – | – |
| 5 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 18 | – | – |
| 5 | Skeleton | 10/10 | 0 | 13 | 1 | 23 | – | – |
| 5 | Two skeletons | 10/10 | 0 | 25 | 11 | 83 | – | – |
| 6 | Rat | 10/10 | 0 | 9 | 0 | 7 | – | – |
| 6 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 18 | – | – |
| 6 | Skeleton | 10/10 | 0 | 12 | 0 | 22 | – | – |
| 6 | Two skeletons | 10/10 | 0 | 25 | 12 | 99 | – | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 140 | – | 55% |
| 7 | Rat | 10/10 | 0 | 8 | 0 | 8 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 20 | – | – |
| 7 | Skeleton | 10/10 | 0 | 12 | 0 | 23 | – | – |
| 7 | Two skeletons | 10/10 | 0 | 25 | 12 | 103 | – | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 155 | – | 37% |
| 8 | Rat | 10/10 | 0 | 8 | 0 | 7 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 18 | – | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 0 | 24 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 24 | 8 | 87 | – | – |
| 8 | Boss 1 (lvl 7) | 6/10 | 4 | 39 | 18 | 159 | – | 31% |
| 9 | Rat | 10/10 | 0 | 8 | 0 | 7 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 19 | – | – |
| 9 | Skeleton | 10/10 | 0 | 12 | 0 | 26 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 24 | 10 | 105 | – | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 35 | 12 | 122 | – | – |
| 10 | Rat | 10/10 | 0 | 7 | 0 | 7 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 21 | – | – |
| 10 | Skeleton | 10/10 | 0 | 12 | 0 | 27 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 24 | 11 | 116 | – | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 32 | 6 | 86 | – | – |

### Necromancer

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 4

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 9 | 3 | 11 | 46 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 13 | 4 | 24 | 60 | – |
| 1 | Skeleton | 10/10 | 0 | 12 | 4 | 37 | 58 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 86 | 66 | 49% |
| 2 | Rat | 10/10 | 0 | 9 | 2 | 14 | 45 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 13 | 3 | 31 | 60 | – |
| 2 | Skeleton | 10/10 | 0 | 12 | 3 | 47 | 58 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 125 | 79 | 35% |
| 3 | Rat | 10/10 | 0 | 12 | 3 | 7 | 48 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 13 | 65 | – |
| 3 | Skeleton | 10/10 | 0 | 15 | 5 | 24 | 62 | – |
| 3 | Two skeletons | 1/10 | 9 | 30 | 12 | 140 | 100 | 19% |
| 4 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 9 | – |
| 4 | Two skeletons | 10/10 | 0 | 33 | 1 | 22 | 91 | – |
| 5 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 5 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 5 | Two skeletons | 10/10 | 0 | 35 | 1 | 17 | 91 | – |
| 6 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 6 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 6 | Two skeletons | 10/10 | 0 | 33 | 0 | 14 | 84 | – |
| 6 | Boss 1 (lvl 7) | 2/10 | 8 | 65 | 10 | 222 | 122 | 44% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 7 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 7 | Two skeletons | 10/10 | 0 | 33 | 0 | 0 | 86 | – |
| 7 | Boss 1 (lvl 7) | 7/10 | 3 | 68 | 6 | 247 | 152 | 47% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 15 | – |
| 8 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 8 | Two skeletons | 10/10 | 0 | 31 | 0 | 2 | 64 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 49 | 6 | 250 | 128 | 29% |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 14 | – |
| 9 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 63 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 44 | 3 | 207 | 107 | – |
| 10 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 0 | 12 | – |
| 10 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 10 | Two skeletons | 10/10 | 0 | 33 | 0 | 0 | 63 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 39 | 2 | 195 | 98 | – |

### Cleric

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 2

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 13 | 1 | 15 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 24 | 5 | 40 | 6 | – |
| 1 | Skeleton | 10/10 | 0 | 17 | 0 | 42 | 18 | – |
| 1 | Two skeletons | 1/10 | 9 | 31 | 4 | 88 | 15 | 46% |
| 2 | Rat | 10/10 | 0 | 14 | 0 | 23 | 11 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 26 | 3 | 57 | 20 | – |
| 2 | Skeleton | 10/10 | 0 | 15 | 0 | 48 | 29 | – |
| 2 | Two skeletons | 8/10 | 2 | 27 | 1 | 136 | 44 | 41% |
| 3 | Rat | 10/10 | 0 | 12 | 0 | 25 | 16 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 23 | 1 | 61 | 26 | – |
| 3 | Skeleton | 10/10 | 0 | 14 | 0 | 52 | 30 | – |
| 3 | Two skeletons | 10/10 | 0 | 26 | 1 | 161 | 51 | – |
| 4 | Rat | 10/10 | 0 | 13 | 0 | 26 | 17 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 69 | 27 | – |
| 4 | Skeleton | 10/10 | 0 | 16 | 0 | 52 | 33 | – |
| 4 | Two skeletons | 9/10 | 1 | 25 | 0 | 167 | 49 | 28% |
| 5 | Rat | 10/10 | 0 | 13 | 0 | 31 | 17 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 81 | 28 | – |
| 5 | Skeleton | 10/10 | 0 | 15 | 0 | 65 | 34 | – |
| 5 | Two skeletons | 10/10 | 0 | 31 | 1 | 173 | 74 | – |
| 6 | Rat | 10/10 | 0 | 13 | 0 | 36 | 17 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 84 | 26 | – |
| 6 | Skeleton | 10/10 | 0 | 15 | 0 | 72 | 33 | – |
| 6 | Two skeletons | 10/10 | 0 | 31 | 0 | 193 | 71 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 350 | 83 | 43% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 41 | 17 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 97 | 27 | – |
| 7 | Skeleton | 10/10 | 0 | 15 | 0 | 80 | 32 | – |
| 7 | Two skeletons | 10/10 | 0 | 30 | 0 | 173 | 72 | – |
| 7 | Boss 1 (lvl 7) | 10/10 | 0 | 52 | 2 | 391 | 122 | – |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 45 | 17 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 98 | 26 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 88 | 33 | – |
| 8 | Two skeletons | 10/10 | 0 | 30 | 0 | 211 | 72 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 53 | 0 | 333 | 118 | – |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 50 | 17 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 112 | 27 | – |
| 9 | Skeleton | 10/10 | 0 | 14 | 0 | 43 | 33 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 0 | 192 | 82 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 41 | 0 | 222 | 81 | – |
| 10 | Rat | 10/10 | 0 | 14 | 0 | 53 | 18 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 118 | 27 | – |
| 10 | Skeleton | 10/10 | 0 | 14 | 0 | 84 | 33 | – |
| 10 | Two skeletons | 10/10 | 0 | 31 | 0 | 254 | 72 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 46 | 0 | 149 | 78 | – |

### Enchanter

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 1 | 0 | 27 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 17 | 3 | 0 | 42 | – |
| 1 | Skeleton | 10/10 | 0 | 17 | 3 | 0 | 42 | – |
| 1 | Two skeletons | 10/10 | 0 | 36 | 7 | 0 | 89 | – |
| 2 | Rat | 10/10 | 0 | 8 | 0 | 0 | 20 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 0 | 28 | – |
| 2 | Skeleton | 10/10 | 0 | 11 | 0 | 0 | 28 | – |
| 2 | Two skeletons | 10/10 | 0 | 31 | 2 | 0 | 77 | – |
| 3 | Rat | 10/10 | 0 | 8 | 0 | 0 | 25 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 32 | – |
| 3 | Skeleton | 10/10 | 0 | 11 | 0 | 0 | 31 | – |
| 3 | Two skeletons | 10/10 | 0 | 30 | 2 | 0 | 84 | – |
| 4 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 49 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 48 | – |
| 4 | Two skeletons | 10/10 | 0 | 35 | 0 | 0 | 102 | – |
| 5 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 49 | – |
| 5 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 48 | – |
| 5 | Two skeletons | 10/10 | 0 | 37 | 0 | 0 | 101 | – |
| 6 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 49 | – |
| 6 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 48 | – |
| 6 | Two skeletons | 10/10 | 0 | 37 | 0 | 0 | 101 | – |
| 6 | Boss 1 (lvl 7) | 3/10 | 7 | 77 | 14 | 87 | 141 | 49% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 42 | – |
| 7 | Skeleton | 10/10 | 0 | 17 | 0 | 0 | 43 | – |
| 7 | Two skeletons | 10/10 | 0 | 35 | 0 | 0 | 96 | – |
| 7 | Boss 1 (lvl 7) | 10/10 | 0 | 86 | 5 | 44 | 195 | – |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 42 | – |
| 8 | Skeleton | 10/10 | 0 | 17 | 0 | 0 | 43 | – |
| 8 | Two skeletons | 10/10 | 0 | 35 | 0 | 0 | 96 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 91 | 4 | 44 | 186 | – |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 0 | 43 | – |
| 9 | Skeleton | 10/10 | 0 | 17 | 0 | 0 | 43 | – |
| 9 | Two skeletons | 10/10 | 0 | 36 | 0 | 0 | 96 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 95 | 0 | 24 | 174 | – |
| 10 | Rat | 10/10 | 0 | 13 | 0 | 0 | 34 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 41 | – |
| 10 | Skeleton | 10/10 | 0 | 17 | 0 | 0 | 42 | – |
| 10 | Two skeletons | 10/10 | 0 | 36 | 0 | 0 | 94 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 93 | 0 | 20 | 166 | – |

### Paladin

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 4

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 12 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 4 | 30 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 3 | 35 | 0 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 69 | 0 | 48% |
| 2 | Rat | 10/10 | 0 | 12 | 0 | 13 | 0 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 22 | 3 | 32 | 0 | – |
| 2 | Skeleton | 10/10 | 0 | 18 | 2 | 38 | 0 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 88 | 2 | 53% |
| 3 | Rat | 10/10 | 0 | 13 | 0 | 17 | 0 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 21 | 4 | 40 | 0 | – |
| 3 | Skeleton | 10/10 | 0 | 18 | 2 | 42 | 0 | – |
| 3 | Two skeletons | 0/10 | 10 | – | – | 104 | 2 | 58% |
| 4 | Rat | 10/10 | 0 | 12 | 0 | 20 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 22 | 4 | 47 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 14 | 1 | 37 | 20 | – |
| 4 | Two skeletons | 9/10 | 1 | 32 | 5 | 144 | 43 | 50% |
| 5 | Rat | 10/10 | 0 | 13 | 0 | 25 | 0 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 22 | 6 | 59 | 0 | – |
| 5 | Skeleton | 10/10 | 0 | 14 | 1 | 42 | 20 | – |
| 5 | Two skeletons | 10/10 | 0 | 31 | 2 | 168 | 34 | – |
| 6 | Rat | 10/10 | 0 | 13 | 0 | 29 | 14 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 24 | 2 | 70 | 14 | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 1 | 49 | 33 | – |
| 6 | Two skeletons | 10/10 | 0 | 27 | 0 | 174 | 45 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 300 | 50 | 57% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 33 | 14 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 25 | 1 | 77 | 14 | – |
| 7 | Skeleton | 10/10 | 0 | 12 | 0 | 51 | 31 | – |
| 7 | Two skeletons | 10/10 | 0 | 25 | 1 | 186 | 42 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 310 | 50 | 42% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 32 | 14 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 1 | 85 | 14 | – |
| 8 | Skeleton | 10/10 | 0 | 11 | 0 | 50 | 34 | – |
| 8 | Two skeletons | 10/10 | 0 | 20 | 4 | 153 | 42 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 35 | 3 | 315 | 81 | – |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 31 | 14 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 81 | 14 | – |
| 9 | Skeleton | 10/10 | 0 | 11 | 0 | 55 | 34 | – |
| 9 | Two skeletons | 10/10 | 0 | 19 | 4 | 159 | 41 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 32 | 1 | 268 | 74 | – |
| 10 | Rat | 10/10 | 0 | 13 | 0 | 33 | 14 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 92 | 14 | – |
| 10 | Skeleton | 10/10 | 0 | 11 | 0 | 54 | 34 | – |
| 10 | Two skeletons | 10/10 | 0 | 19 | 4 | 167 | 41 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 26 | 5 | 161 | 56 | – |

### Shadow Knight

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 6

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 12 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 21 | 4 | 31 | 7 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 36 | 8 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 75 | 12 | 47% |
| 2 | Rat | 10/10 | 0 | 10 | 0 | 13 | 6 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 15 | 1 | 25 | 10 | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 2 | 36 | 12 | – |
| 2 | Two skeletons | 1/10 | 9 | 26 | 7 | 97 | 27 | 31% |
| 3 | Rat | 10/10 | 0 | 10 | 0 | 15 | 6 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 15 | 1 | 31 | 11 | – |
| 3 | Skeleton | 10/10 | 0 | 13 | 2 | 43 | 12 | – |
| 3 | Two skeletons | 1/10 | 9 | 26 | 8 | 114 | 26 | 35% |
| 4 | Rat | 10/10 | 0 | 20 | 0 | 1 | 8 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 13 | 12 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 24 | 8 | – |
| 4 | Two skeletons | 1/10 | 9 | 31 | 8 | 132 | 28 | 30% |
| 5 | Rat | 10/10 | 0 | 20 | 0 | 1 | 7 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 15 | 12 | – |
| 5 | Skeleton | 10/10 | 0 | 19 | 0 | 28 | 8 | – |
| 5 | Two skeletons | 2/10 | 8 | 31 | 8 | 163 | 39 | 12% |
| 6 | Rat | 10/10 | 0 | 20 | 0 | 1 | 8 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 17 | 11 | – |
| 6 | Skeleton | 10/10 | 0 | 19 | 0 | 29 | 7 | – |
| 6 | Two skeletons | 8/10 | 2 | 35 | 8 | 186 | 49 | 13% |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 187 | 53 | 59% |
| 7 | Rat | 10/10 | 0 | 20 | 0 | 0 | 7 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 24 | 0 | 19 | 12 | – |
| 7 | Skeleton | 10/10 | 0 | 19 | 0 | 28 | 6 | – |
| 7 | Two skeletons | 10/10 | 0 | 35 | 8 | 203 | 48 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 225 | 62 | 45% |
| 8 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 0 | 19 | 12 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 33 | 6 | – |
| 8 | Two skeletons | 9/10 | 1 | 35 | 7 | 234 | 55 | 3% |
| 8 | Boss 1 (lvl 7) | 6/10 | 4 | 56 | 14 | 292 | 88 | 23% |
| 9 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 12 | 9 | – |
| 9 | Skeleton | 10/10 | 0 | 16 | 0 | 36 | 6 | – |
| 9 | Two skeletons | 10/10 | 0 | 35 | 8 | 256 | 56 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 54 | 11 | 299 | 94 | – |
| 10 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 12 | 9 | – |
| 10 | Skeleton | 10/10 | 0 | 18 | 0 | 37 | 6 | – |
| 10 | Two skeletons | 10/10 | 0 | 35 | 8 | 275 | 55 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 49 | 8 | 265 | 77 | – |

### Wizard

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 8 | 4 | 0 | 38 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 16 | 9 | 0 | 69 | – |
| 1 | Skeleton | 10/10 | 0 | 13 | 7 | 0 | 55 | – |
| 1 | Two skeletons | 10/10 | 0 | 43 | 11 | 0 | 110 | – |
| 2 | Rat | 10/10 | 0 | 8 | 3 | 0 | 38 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 16 | 7 | 0 | 68 | – |
| 2 | Skeleton | 10/10 | 0 | 13 | 5 | 0 | 56 | – |
| 2 | Two skeletons | 10/10 | 0 | 36 | 11 | 0 | 111 | – |
| 3 | Rat | 10/10 | 0 | 8 | 2 | 0 | 38 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 16 | 6 | 0 | 68 | – |
| 3 | Skeleton | 10/10 | 0 | 13 | 4 | 0 | 56 | – |
| 3 | Two skeletons | 10/10 | 0 | 35 | 9 | 0 | 111 | – |
| 4 | Rat | 10/10 | 0 | 8 | 3 | 0 | 43 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 15 | 6 | 0 | 72 | – |
| 4 | Skeleton | 10/10 | 0 | 12 | 5 | 0 | 60 | – |
| 4 | Two skeletons | 10/10 | 0 | 32 | 10 | 0 | 116 | – |
| 5 | Rat | 10/10 | 0 | 8 | 2 | 0 | 44 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 15 | 5 | 0 | 72 | – |
| 5 | Skeleton | 10/10 | 0 | 12 | 4 | 0 | 60 | – |
| 5 | Two skeletons | 10/10 | 0 | 26 | 9 | 0 | 114 | – |
| 6 | Rat | 10/10 | 0 | 8 | 2 | 0 | 44 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 15 | 4 | 0 | 72 | – |
| 6 | Skeleton | 10/10 | 0 | 12 | 3 | 0 | 60 | – |
| 6 | Two skeletons | 10/10 | 0 | 26 | 8 | 0 | 114 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 92 | 202 | 36% |
| 7 | Rat | 10/10 | 0 | 8 | 1 | 0 | 43 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 0 | 72 | – |
| 7 | Skeleton | 10/10 | 0 | 12 | 2 | 0 | 60 | – |
| 7 | Two skeletons | 10/10 | 0 | 26 | 7 | 0 | 114 | – |
| 7 | Boss 1 (lvl 7) | 2/10 | 8 | 62 | 16 | 98 | 216 | 28% |
| 8 | Rat | 10/10 | 0 | 8 | 1 | 0 | 43 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 0 | 72 | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 2 | 0 | 60 | – |
| 8 | Two skeletons | 10/10 | 0 | 26 | 6 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 6/10 | 4 | 61 | 10 | 92 | 213 | 15% |
| 9 | Rat | 10/10 | 0 | 8 | 0 | 0 | 43 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 15 | 2 | 0 | 72 | – |
| 9 | Skeleton | 10/10 | 0 | 12 | 1 | 0 | 60 | – |
| 9 | Two skeletons | 10/10 | 0 | 26 | 5 | 0 | 114 | – |
| 9 | Boss 1 (lvl 7) | 8/10 | 0 (+2 escaped) | 53 | 8 | 75 | 189 | 100% |
| 10 | Rat | 10/10 | 0 | 8 | 0 | 0 | 43 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 15 | 2 | 0 | 73 | – |
| 10 | Skeleton | 10/10 | 0 | 12 | 1 | 0 | 60 | – |
| 10 | Two skeletons | 10/10 | 0 | 26 | 4 | 0 | 114 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 45 | 7 | 62 | 174 | – |

### Magician

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 3

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 0 | 29 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 49 | – |
| 1 | Skeleton | 10/10 | 0 | 15 | 0 | 0 | 39 | – |
| 1 | Two skeletons | 4/10 | 6 | 50 | 10 | 42 | 81 | 11% |
| 2 | Rat | 10/10 | 0 | 9 | 0 | 0 | 21 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 15 | 0 | 0 | 41 | – |
| 2 | Skeleton | 10/10 | 0 | 12 | 0 | 0 | 31 | – |
| 2 | Two skeletons | 2/10 | 8 | 50 | 8 | 48 | 73 | 12% |
| 3 | Rat | 10/10 | 0 | 9 | 0 | 0 | 21 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 15 | 0 | 0 | 41 | – |
| 3 | Skeleton | 10/10 | 0 | 12 | 0 | 0 | 35 | – |
| 3 | Two skeletons | 10/10 | 0 | 48 | 0 | 11 | 76 | – |
| 4 | Rat | 10/10 | 0 | 8 | 0 | 0 | 25 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 0 | 42 | – |
| 4 | Skeleton | 10/10 | 0 | 11 | 0 | 0 | 36 | – |
| 4 | Two skeletons | 10/10 | 0 | 48 | 0 | 13 | 85 | – |
| 5 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 43 | – |
| 5 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 39 | – |
| 5 | Two skeletons | 10/10 | 0 | 48 | 0 | 13 | 84 | – |
| 6 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 6 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 6 | Two skeletons | 10/10 | 0 | 47 | 0 | 17 | 82 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 94 | 101 | 46% |
| 7 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 7 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 7 | Two skeletons | 10/10 | 0 | 47 | 0 | 17 | 81 | – |
| 7 | Boss 1 (lvl 7) | 8/10 | 2 | 86 | 13 | 94 | 136 | 42% |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 8 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 8 | Two skeletons | 10/10 | 0 | 47 | 0 | 22 | 78 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 82 | 10 | 79 | 132 | – |
| 9 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 9 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 9 | Two skeletons | 10/10 | 0 | 47 | 0 | 25 | 77 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 73 | 7 | 70 | 115 | – |
| 10 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 10 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 10 | Two skeletons | 10/10 | 0 | 47 | 0 | 26 | 77 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 71 | 4 | 55 | 100 | – |

### Ranger

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 10 | 0 | 0 | 4 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 0 | 4 | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 0 | 0 | 4 | – |
| 1 | Two skeletons | 10/10 | 0 | 28 | 0 | 0 | 8 | – |
| 2 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 14 | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 2 | Two skeletons | 10/10 | 0 | 53 | 0 | 0 | 29 | – |
| 3 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 20 | 0 | 0 | 14 | – |
| 3 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 10 | – |
| 3 | Two skeletons | 10/10 | 0 | 47 | 0 | 0 | 28 | – |
| 4 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 20 | 0 | 0 | 12 | – |
| 4 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 4 | Two skeletons | 10/10 | 0 | 45 | 0 | 0 | 28 | – |
| 5 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 20 | 0 | 0 | 12 | – |
| 5 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 5 | Two skeletons | 10/10 | 0 | 39 | 0 | 0 | 29 | – |
| 6 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 10 | – |
| 6 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 6 | Two skeletons | 10/10 | 0 | 39 | 0 | 0 | 48 | – |
| 6 | Boss 1 (lvl 7) | 2/10 | 8 | 83 | 9 | 186 | 88 | 32% |
| 7 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 10 | – |
| 7 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 7 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 48 | – |
| 7 | Boss 1 (lvl 7) | 1/10 | 9 | 72 | 9 | 196 | 76 | 28% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 48 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 69 | 5 | 122 | 85 | 4% |
| 9 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 9 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 9 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 49 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 62 | 8 | 90 | 69 | – |
| 10 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 10 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 10 | Two skeletons | 10/10 | 0 | 40 | 0 | 0 | 50 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 49 | 7 | 79 | 56 | – |

### Monk

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 5

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 10 | 0 | 12 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 18 | 4 | 30 | – | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 2 | 38 | – | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 89 | – | 45% |
| 2 | Rat | 10/10 | 0 | 9 | 0 | 16 | – | – |
| 2 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 39 | – | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 6 | 50 | – | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 109 | – | 48% |
| 3 | Rat | 10/10 | 0 | 9 | 0 | 21 | – | – |
| 3 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 49 | – | – |
| 3 | Skeleton | 10/10 | 0 | 14 | 4 | 62 | – | – |
| 3 | Two skeletons | 4/10 | 1 (+5 escaped) | 32 | 11 | 124 | – | 20% |
| 4 | Rat | 10/10 | 0 | 10 | 0 | 18 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 5 | 50 | – | – |
| 4 | Skeleton | 10/10 | 0 | 15 | 6 | 55 | – | – |
| 4 | Two skeletons | 2/10 | 1 (+7 escaped) | 38 | 10 | 144 | – | 30% |
| 5 | Rat | 10/10 | 0 | 8 | 0 | 21 | – | – |
| 5 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 54 | – | – |
| 5 | Skeleton | 10/10 | 0 | 14 | 6 | 64 | – | – |
| 5 | Two skeletons | 8/10 | 1 (+1 escaped) | 34 | 11 | 162 | – | 10% |
| 6 | Rat | 10/10 | 0 | 8 | 0 | 24 | – | – |
| 6 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 61 | – | – |
| 6 | Skeleton | 10/10 | 0 | 14 | 7 | 73 | – | – |
| 6 | Two skeletons | 9/10 | 0 (+1 escaped) | 36 | 11 | 173 | – | 20% |
| 6 | Boss 1 (lvl 7) | 0/10 | 7 (+3 escaped) | – | – | 190 | – | 62% |
| 7 | Rat | 10/10 | 0 | 8 | 0 | 28 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 64 | – | – |
| 7 | Skeleton | 10/10 | 0 | 14 | 5 | 65 | – | – |
| 7 | Two skeletons | 8/10 | 1 (+1 escaped) | 36 | 11 | 192 | – | 11% |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 215 | – | 45% |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 12 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 4 | 63 | – | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 5 | 70 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 32 | 6 | 176 | – | – |
| 8 | Boss 1 (lvl 7) | 6/10 | 0 (+4 escaped) | 51 | 6 | 206 | – | 9% |
| 9 | Rat | 10/10 | 0 | 7 | 0 | 13 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 15 | 4 | 68 | – | – |
| 9 | Skeleton | 10/10 | 0 | 12 | 5 | 77 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 32 | 7 | 194 | – | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 46 | 4 | 161 | – | – |
| 10 | Rat | 10/10 | 0 | 7 | 0 | 14 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 3 | 64 | – | – |
| 10 | Skeleton | 10/10 | 0 | 13 | 3 | 66 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 33 | 6 | 198 | – | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 45 | 4 | 162 | – | – |

### Shaman

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 4

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 10 | 0 | 14 | 6 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 14 | 4 | 24 | 6 | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 3 | 36 | 9 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 70 | 14 | 56% |
| 2 | Rat | 10/10 | 0 | 11 | 0 | 14 | 12 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 25 | 12 | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 2 | 36 | 12 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 90 | 20 | 58% |
| 3 | Rat | 10/10 | 0 | 12 | 0 | 18 | 13 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 15 | 5 | 33 | 13 | – |
| 3 | Skeleton | 10/10 | 0 | 15 | 3 | 47 | 15 | – |
| 3 | Two skeletons | 0/10 | 10 | – | – | 104 | 20 | 58% |
| 4 | Rat | 10/10 | 0 | 17 | 0 | 0 | 22 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 22 | – |
| 4 | Skeleton | 10/10 | 0 | 22 | 0 | 0 | 34 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 62 | – |
| 5 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 5 | Skeleton | 10/10 | 0 | 21 | 0 | 0 | 39 | – |
| 5 | Two skeletons | 10/10 | 0 | 31 | 1 | 0 | 66 | – |
| 6 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 6 | Skeleton | 10/10 | 0 | 21 | 0 | 0 | 37 | – |
| 6 | Two skeletons | 10/10 | 0 | 30 | 0 | 0 | 66 | – |
| 6 | Boss 1 (lvl 7) | 4/10 | 6 | 83 | 6 | 177 | 119 | 62% |
| 7 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 7 | Skeleton | 10/10 | 0 | 21 | 0 | 0 | 37 | – |
| 7 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 66 | – |
| 7 | Boss 1 (lvl 7) | 7/10 | 3 | 65 | 1 | 156 | 109 | 60% |
| 8 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 8 | Skeleton | 10/10 | 0 | 20 | 0 | 0 | 35 | – |
| 8 | Two skeletons | 10/10 | 0 | 29 | 0 | 0 | 56 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 55 | 1 | 104 | 104 | – |
| 9 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 9 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 32 | – |
| 9 | Two skeletons | 10/10 | 0 | 29 | 0 | 0 | 55 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 55 | 5 | 127 | 99 | – |
| 10 | Rat | 10/10 | 0 | 16 | 0 | 0 | 31 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 10 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 32 | – |
| 10 | Two skeletons | 10/10 | 0 | 28 | 0 | 0 | 55 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 47 | 0 | 91 | 94 | – |

### Bard

Boss 1 first beaten (5+ wins in 10): level 6 · Two skeletons (8+ in 10): from level 4

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 1 | 33 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 41 | 0 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 70 | 0 | 58% |
| 2 | Rat | 10/10 | 0 | 10 | 0 | 16 | 0 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 17 | 1 | 37 | 0 | – |
| 2 | Skeleton | 10/10 | 0 | 15 | 2 | 46 | 0 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 84 | 0 | 44% |
| 3 | Rat | 10/10 | 0 | 10 | 0 | 19 | 0 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 17 | 1 | 44 | 0 | – |
| 3 | Skeleton | 10/10 | 0 | 14 | 2 | 52 | 0 | – |
| 3 | Two skeletons | 0/10 | 10 | – | – | 102 | 0 | 42% |
| 4 | Rat | 10/10 | 0 | 9 | 0 | 24 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 17 | 1 | 54 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 13 | 1 | 56 | 0 | – |
| 4 | Two skeletons | 9/10 | 1 | 29 | 4 | 134 | 16 | 13% |
| 5 | Rat | 10/10 | 0 | 10 | 0 | 28 | 0 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 60 | 0 | – |
| 5 | Skeleton | 10/10 | 0 | 14 | 2 | 71 | 0 | – |
| 5 | Two skeletons | 10/10 | 0 | 28 | 4 | 141 | 16 | – |
| 6 | Rat | 10/10 | 0 | 10 | 0 | 25 | 0 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 55 | 0 | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 4 | 66 | 0 | – |
| 6 | Two skeletons | 9/10 | 1 | 36 | 6 | 170 | 21 | 59% |
| 6 | Boss 1 (lvl 7) | 10/10 | 0 | 333 | 0 | 0 | 8 | – |
| 7 | Rat | 10/10 | 0 | 10 | 0 | 27 | 0 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 62 | 0 | – |
| 7 | Skeleton | 10/10 | 0 | 13 | 4 | 71 | 0 | – |
| 7 | Two skeletons | 6/10 | 4 | 36 | 6 | 181 | 21 | 10% |
| 7 | Boss 1 (lvl 7) | 10/10 | 0 | 286 | 0 | 0 | 8 | – |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 30 | 0 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 68 | 0 | – |
| 8 | Skeleton | 10/10 | 0 | 14 | 4 | 77 | 0 | – |
| 8 | Two skeletons | 8/10 | 2 | 39 | 5 | 226 | 38 | 18% |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 247 | 0 | 0 | 8 | – |
| 9 | Rat | 10/10 | 0 | 10 | 0 | 35 | 0 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 75 | 0 | – |
| 9 | Skeleton | 10/10 | 0 | 14 | 4 | 85 | 0 | – |
| 9 | Two skeletons | 9/10 | 1 | 35 | 5 | 241 | 37 | 28% |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 227 | 0 | 0 | 8 | – |
| 10 | Rat | 10/10 | 0 | 10 | 1 | 38 | 0 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 17 | 7 | 83 | 0 | – |
| 10 | Skeleton | 10/10 | 0 | 14 | 4 | 92 | 0 | – |
| 10 | Two skeletons | 9/10 | 1 | 40 | 4 | 259 | 36 | 19% |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 187 | 0 | 0 | 8 | – |

## Level 12 and 14 forks, rough check (v0.44, Nov 19)

One seed per fight (the full 10-seed run takes about 10 minutes a class on the build machine), at each fork's level, in the arena: a single skeleton, a pack of 3, Old Gnawbone and the Skeleton King at even level. Cells are DPS on a win, – on a loss. **Same as base** means the class bot never pressed that ability in these fights (its playbook doesn't use it, or the fight never called for it), so the side is untested here, not equal. Fork balance is parked (owner, Nov 19); this is a first look, not a verdict.

| Class | Side | Single | Pack of 3 | Gnawbone | Skeleton King | Note |
| --- | --- | --- | --- | --- | --- | --- |
| necro | Base Siphon Plague | 18.9 | – | 29.0 | 26.1 |  |
| necro | Leaping Plague | 19.2 | 31.5 | 32.9 | 24.1 |  |
| necro | Twin Plague | 15.7 | – | 25.9 | 23.6 |  |
| necro | Base Lifetap | 21.5 | – | 30.2 | 28.2 |  |
| necro | Bone Tap | 21.9 | – | 30.2 | 26.9 |  |
| necro | Twin Tap | 21.9 | 38.7 | 32.9 | 30.3 |  |
| druid | Base Creeping Rot | 24.2 | 22.3 | 24.5 | 19.8 |  |
| druid | Sap Strength | 24.2 | 23.0 | 24.5 | 20.9 |  |
| druid | Blight Spores | 24.2 | 22.0 | 25.7 | 19.9 |  |
| druid | Base Mending Touch | 27.6 | 24.5 | 24.5 | 22.6 |  |
| druid | Wild Regrowth | 27.6 | 24.5 | 24.5 | 22.6 | same as base |
| druid | Verdant Touch | 27.6 | 24.5 | 24.5 | 22.6 | same as base |
| warrior | Base Cleave | 19.3 | – | 24.7 | 20.8 |  |
| warrior | Whirlwind | 19.3 | 17.9 | 27.2 | 21.4 |  |
| warrior | Sunder | 19.3 | – | 23.6 | 20.2 |  |
| warrior | Base Defensive Stance | 22.0 | – | 30.4 | 23.0 |  |
| warrior | Iron Stance | 22.0 | 17.5 | 30.4 | 22.6 |  |
| warrior | Retaliation | 22.0 | 23.8 | 30.4 | 27.2 |  |
| rogue | Base Gouge | 32.1 | 25.6 | 19.6 | 34.0 |  |
| rogue | Blind | 24.9 | – | 21.2 | 29.9 |  |
| rogue | Kidney Shot | 28.1 | – | 19.6 | 34.0 |  |
| rogue | Base Rend | 36.6 | – | 26.5 | 36.7 |  |
| rogue | Garrote | 36.6 | – | 26.5 | 36.7 | same as base |
| rogue | Lacerate | 36.6 | – | 25.2 | 35.1 |  |
| cleric | Base Holy Light | 27.2 | 25.3 | 17.5 | 23.7 |  |
| cleric | Judgment | 27.2 | 25.3 | 17.5 | 24.2 |  |
| cleric | Holy Nova | 17.6 | 21.2 | 16.3 | 21.4 |  |
| cleric | Base Divine Aura | 31.0 | 24.2 | 20.2 | 24.1 |  |
| cleric | Divine Shelter | 31.0 | 24.2 | 20.2 | 24.1 | same as base |
| cleric | Divine Wrath | 31.0 | 24.2 | 20.2 | 24.1 | same as base |
| enchanter | Base Charm | 19.5 | 20.9 | 8.8 | 10.6 |  |
| enchanter | Lasting Charm | 19.5 | 20.9 | 10.5 | 12.3 |  |
| enchanter | Thrall | 19.5 | 20.9 | 12.4 | 15.4 |  |
| enchanter | Base Slow Mind | 22.2 | 21.5 | 8.5 | 17.2 |  |
| enchanter | Deep Slow | 24.4 | 13.1 | 8.5 | 17.6 |  |
| enchanter | Mind Drain | 22.2 | 21.5 | 8.5 | 17.2 | same as base |
| paladin | Base Taunt | 31.0 | 35.3 | 22.1 | 49.2 |  |
| paladin | Challenge | 31.0 | 35.3 | 22.1 | 49.2 | same as base |
| paladin | Rebuke | 31.0 | 35.3 | 22.1 | 49.2 |  |
| paladin | Base Divine Strike | 35.3 | 40.9 | 26.5 | 61.2 |  |
| paladin | Crusader Strike | 35.3 | 53.5 | 20.4 | 44.3 |  |
| paladin | Divine Storm | 35.3 | 40.9 | 23.1 | 56.8 |  |
| shadowknight | Base Disease Cloud | 16.9 | – | 25.1 | 20.1 |  |
| shadowknight | Plague Cloud | 16.9 | – | 27.4 | 25.5 |  |
| shadowknight | Withering Cloud | 16.4 | 21.9 | 27.4 | 22.9 |  |
| shadowknight | Base Raise Minion | 19.2 | – | 28.1 | 25.9 |  |
| shadowknight | Ghoul | 15.4 | – | 15.9 | 24.9 |  |
| shadowknight | Wraith | 24.1 | – | 31.0 | 24.6 |  |
| wizard | Base Frost Nova | 28.4 | 20.6 | 21.7 | 20.4 |  |
| wizard | Deep Freeze | 28.4 | 21.7 | 19.6 | 20.4 |  |
| wizard | Nova Blast | 28.4 | 29.1 | 23.3 | 20.4 |  |
| wizard | Base Fireball | 32.3 | 23.5 | 27.1 | 25.1 |  |
| wizard | Pyroblast | 38.8 | 23.0 | 38.2 | 26.8 |  |
| wizard | Living Bomb | 37.1 | 32.7 | 33.1 | 27.4 |  |
| magician | Base Burnout | 33.6 | – | 25.3 | – |  |
| magician | Overdrive | 39.7 | – | 29.5 | 30.2 |  |
| magician | Wildfire | 33.6 | – | 25.3 | – | same as base |
| magician | Base Flame Shield | 38.3 | – | 31.3 | 32.4 |  |
| magician | Inferno Shield | 38.3 | – | 31.3 | 32.4 | same as base |
| magician | Shared Flames | 45.2 | – | 33.2 | 38.9 |  |
| ranger | Base Volley | 27.4 | 20.7 | 11.3 | 21.5 |  |
| ranger | Rain of Arrows | 27.4 | 20.7 | 11.5 | 21.5 |  |
| ranger | Pinning Volley | 27.4 | 15.4 | 14.2 | 21.5 |  |
| ranger | Base Disengage | 31.2 | 19.8 | 15.3 | 28.2 |  |
| ranger | Recoil Shot | 31.2 | 19.8 | 15.3 | 28.2 | same as base |
| ranger | Double Hop | 31.2 | 19.8 | 15.3 | 28.2 | same as base |
| monk | Base Flurry | 23.2 | 21.4 | 23.8 | 27.0 |  |
| monk | Hundred Fists | 29.4 | – | 23.8 | 26.1 |  |
| monk | Whirling Flurry | 29.4 | – | 26.2 | – |  |
| monk | Base Flying Kick | 26.4 | 22.2 | 26.2 | 28.1 |  |
| monk | Tiger Leap | 26.4 | 24.7 | 25.0 | 28.1 |  |
| monk | Crane Kick | 33.5 | 21.4 | 29.1 | 28.1 |  |
| shaman | Base Swarm | 17.9 | 28.6 | 19.5 | 24.2 |  |
| shaman | Locust Swarm | 17.9 | 28.9 | 27.7 | 24.2 |  |
| shaman | Stinging Swarm | 17.9 | 31.3 | 21.0 | 24.2 |  |
| shaman | Base Venom Totem | 20.4 | 33.8 | 22.2 | 27.9 |  |
| shaman | Toxic Totem | 20.4 | 33.8 | 22.2 | 27.9 | same as base |
| shaman | Mending Totem | 20.4 | 33.8 | 22.2 | 27.9 | same as base |
| bard | Base Chant of Blades | 23.7 | – | 25.0 | 5.2 |  |
| bard | Bladesong | 23.7 | – | 32.8 | 5.4 |  |
| bard | Battle Tempo | 18.8 | – | 29.1 | 5.1 |  |
| bard | Base Dirge | 26.9 | – | 27.1 | 5.8 |  |
| bard | Dirge of Ruin | 26.9 | – | 27.1 | 5.0 |  |
| bard | Requiem | 26.9 | – | 27.1 | 4.2 |  |

## Dungeon 1 rebuild, two floors (v0.66, Nov 21)
`__game` page, `runDungeon({seeds:2, lvl:15})` for each class: floor 1 (catacomb, hall, the Drowned Prior and his two dead) then floor 2 (the Bellringer and his two cultists, the wisp room, Malrec and his deacons). Each group is one arena fight plus rest and walking; a lost fight is tried once more (+25 s). The Bellringer is no longer optional. Bots don't step off the Prior's ripples or out of the great wisps' rings, and the Prior's grip in the arena only slows (it never mattered much to a bot standing still).

| Class | Run (min) | Deaths | Drowned Prior (+2) | Bellringer (+2) | Malrec (+2 deacons) |
| --- | --- | --- | --- | --- | --- |
| Druid | 12.3 / 10.9 | 3 / 2 | W / W | 1 of 2 first try | lost both runs |
| Warrior | 13.9 / 15.7 | 6 / 8 | lost | lost | lost |
| Rogue | 9.8 / 10.5 | 6 / 8 | lost | lost | lost |
| Necromancer | 10.9 / 8.3 | 4 / 1 | 2nd try both | W | W (2nd try once) |
| Cleric | 12.3 / 12.8 | 8 / 10 | W / W | lost | lost (dies in ~15 s) |
| Enchanter | 10.3 / 10.6 | 0 / 0 | W | W | W (81–102 s) |
| Paladin | 10.9 / 9.7 | 5 / 4 | W (~29 s) | lost | lost |
| Shadow Knight | 12.4 / 11.9 | 5 / 3 | lost | W on 1 of 2 tries | W once |
| Wizard | 14.3 / 13.1 | 8 / 4 | W once | lost | lost (timeout then dead) |
| Magician | 13.6 / 14.4 | 4 / 5 | W (~100 s) | lost | W (~140 s) |
| Ranger | 9.5 / 9.8 | 0 / 0 | W | W | W |
| Monk | 10.3 / 11.1 | 2 / 1 | W | W once | W |
| Shaman | 8.7 / 8.5 | 0 / 0 | W | W | W |
| Bard | 13.8 / 13.4 | 12 / 12 | lost | lost | lost |

**Pace:** every class lands in 8.5–15.7 min (most 10–14), inside the 10–15 target (sim runs are a best case on walking, a worst case on retries). **Balance chat:** the Prior with his two dead is now a real wall for Warrior, Rogue, Shadow Knight, Bard and sometimes the Wizard, though the owner wants him forgiving; the Bellringer stops seven classes; Malrec still beats six (Cleric in ~15 s, as in v0.63). Shaman, Ranger and Enchanter never die.

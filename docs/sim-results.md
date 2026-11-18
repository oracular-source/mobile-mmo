# Sim results

Made by the testing grounds sim (`js/sim.js`), v0.18.1, Nov 17. Each class's bot plays by its playbook (`docs/playbooks.md`) with no gear, against mobs at its own level (Boss 1 is always level 7). **Every level from 1 to 10** (the level cap) is run now, and Boss 1 is tried from level 6 up, so you can see where a class turns the corner. Each line is 10 fights with fixed seeds 1000–1009, so running it again gives the same numbers until the game changes.

How to read it: **Kill** = seconds from the pull to the last mob dying (wins only). **Rest** = seconds sitting afterward to get back to 80% health and mana. **Dmg taken** and **Mana used** are per fight. **Mob HP left** = how much health the mobs still had when you lost. **Beats Boss 1** = the first level that wins 5 or more fights in 10 (a retry or two gets it done).

Run it yourself on the phone: open the game with `?dev`, DEV → Testing grounds → **Run sim** (runs the class you're playing; a few minutes now). The summary line above the table shows the first level that beats Boss 1.

## The yardstick (owner, Nov 17)
Beating the level-7 Boss 1 at level 6–8 is fine. Needing level 9 is borderline. **Needing level 10 (the cap), or never, means the class needs a different look for soloing.** Losing two skeletons at level 1 is fine: pull singles at level 1.

## First level that beats Boss 1
| Class | Beats Boss 1 at | Wins at L6 · 7 · 8 · 9 · 10 | Two skeletons from | Verdict |
| --- | --- | --- | --- | --- |
| Shaman | level 6 | 9 · 10 · 10 · 10 · 10 | level 1 | Fine |
| Ranger | level 7 | 4 · 7 · 9 · 10 · 10 | level 1 | Fine |
| Cleric | level 8 | 0 · 3 · 9 · 10 · 10 | level 2 | Fine |
| Druid | level 8 | 0 · 0 · 5 · 10 · 10 | level 3 | Fine |
| Paladin | level 8 | 0 · 0 · 5 · 9 · 10 | level 1 | Fine |
| Necromancer | level 9 | 1 · 1 · 4 · 10 · 10 | level 1 | Borderline |
| Warrior (v0.18.2) | level 9 | 0 · 0 · 4 · 10 · 10 | level 1 | Borderline (was never) |
| Rogue | level 10 | 0 · 0 · 0 · 0 · 9 | level 1 | Needs a look |
| Magician | level 10 | 0 · 0 · 0 · 1 · 8 | level 3 | Needs a look |
| Wizard | level 10 | 0 · 1 · 0 · 2 · 5 | level 1 | Needs a look |
| Shadow Knight | level 10 | 0 · 0 · 0 · 0 · 7 | level 8 | Needs a look |
| Monk | level 10 | 0 · 0 · 0 · 0 · 7 | level 6 | Needs a look |
| Enchanter | **never** (by 10) | 0 · 0 · 0 · 0 · 0 | level 1 | Needs a look |
| Bard | **never** (by 10) | 0 · 0 · 0 · 0 · 0 | level 4 | Needs a look |

*Two skeletons from* = first level that wins 8 or more in 10.

## Warrior pass (v0.18.2)
Hold the Line (20% less damage per mob on you, up to 3, so 20–60%) and Last Stand (once a fight, a killing blow leaves you at 1 HP and nothing can drop you lower for 5s; the bot Bandages in that window). Before → after:
- **Two skeletons:** never (1 win in 100) → **10/10 at every level from 1**.
- **Boss 1:** never → **level 9** (4/10 at level 8, Boss 1 left at 12% in losses; 10/10 at 9). Borderline, one level short of the "by 8" target.
- **Kills stay slow:** same kill times as before (skeleton 16–19s, Boss 1 about a minute). Damage taken on an even skeleton went from ~42% of health to ~33%.
- Tried first: 10% per mob (up to 4) only fixed two skeletons; Boss 1 still only at 10. 15% per mob: Boss 1 at 9 (6/10). The bolt from Boss 1 counts toward Hold the Line too.
- Not yet compared with the other 13 under one rerun (next step on the board), so "hardest to kill" is checked only against the v0.18.1 numbers.

## What stands out (v0.18.1, every level)
- **On time (level 6–8):** Shaman (6), Ranger (7), Druid, Cleric and Paladin (8). Necro is borderline at 9 (4 wins in 10 at 8).
- **Only at the cap (level 10):** Rogue, Shadow Knight, Magician, Monk and Wizard. Rogue, Monk and Shadow Knight are close at 9 (Boss 1 left at 26–28%): they run out of health just before the end. Wizard's level-10 "5 in 10" is shaky: most of its losses are Gate escapes with Boss 1 barely hurt.
- **Never by 10:** Warrior, Enchanter, Bard. These don't hurt Boss 1 enough: it still has 34–65% (Warrior), 55–76% (Enchanter) and 52–77% (Bard) of its health when they die.
- **Warrior is flat:** an even-level skeleton takes about 42% of its health at every level from 1 to 10, and its kills get slower (16s to 19s). Every other melee class gets safer as it levels (Paladin 51% to 26%, Shadow Knight 54% to 19%, Monk 59% to 44%). So Warrior never wins two skeletons (1 win in 100 fights across all levels) and never beats Boss 1.
- **Correction to the first rundown:** melee damage taken does *not* grow faster than melee health. In raw numbers it rises with level, but as a share of health it stays flat or drops. There's no shared "melee scaling" problem; the Warrior is the outlier.
- **Two skeletons:** Shadow Knight is the slowest of the rest (8+ wins only from level 8), then Monk (6), Bard (4), Druid and Magician (3), Cleric (2). Paladin wobbles at levels 2–3 (4 and 7 wins).
- **Bots play perfectly**, so the kiters (Shaman, Ranger, Druid, Wizard) look better here than they will on a phone.

## Earlier runs
v0.16–v0.18 ran only levels 1, 4 and 8 with Boss 1 at 8. Those numbers match the level 1, 4 and 8 rows below (no rule changes since), so they've been folded in here. Rogue's Evade comparison (A as damage vs B as escape) is settled as A; see the board's decisions.

## Tables (every level)

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
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 112 | 100 | 60% |
| 7 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 13 | 1 | 0 | 52 | – |
| 7 | Skeleton | 10/10 | 0 | 13 | 1 | 0 | 50 | – |
| 7 | Two skeletons | 10/10 | 0 | 32 | 6 | 0 | 113 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 124 | 110 | 43% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 13 | 1 | 0 | 52 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 1 | 0 | 50 | – |
| 8 | Two skeletons | 10/10 | 0 | 32 | 5 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 5/10 | 5 | 55 | 10 | 128 | 152 | 17% |
| 9 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 13 | 0 | 0 | 52 | – |
| 9 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 50 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 3 | 0 | 106 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 50 | 8 | 106 | 168 | – |
| 10 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 13 | 0 | 0 | 52 | – |
| 10 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 50 | – |
| 10 | Two skeletons | 10/10 | 0 | 32 | 2 | 0 | 109 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 43 | 6 | 74 | 144 | – |

### Warrior

v0.18.2 (Hold the Line + Last Stand). Boss 1 first beaten (5+ wins in 10): level 9 · Two skeletons (8+ in 10): level 1

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
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 197 | – | 61% |
| 7 | Rat | 10/10 | 0 | 14 | 0 | 25 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 53 | – | – |
| 7 | Skeleton | 10/10 | 0 | 19 | 2 | 59 | – | – |
| 7 | Two skeletons | 10/10 | 0 | 40 | 5 | 165 | – | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 236 | – | 37% |
| 8 | Rat | 10/10 | 0 | 14 | 0 | 27 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 60 | – | – |
| 8 | Skeleton | 10/10 | 0 | 19 | 2 | 66 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 39 | 6 | 181 | – | – |
| 8 | Boss 1 (lvl 7) | 4/10 | 6 | 61 | 6 | 242 | – | 12% |
| 9 | Rat | 10/10 | 0 | 14 | 0 | 26 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 59 | – | – |
| 9 | Skeleton | 10/10 | 0 | 19 | 2 | 67 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 39 | 5 | 186 | – | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 59 | 7 | 215 | – | – |
| 10 | Rat | 10/10 | 0 | 14 | 0 | 28 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 24 | 1 | 64 | – | – |
| 10 | Skeleton | 10/10 | 0 | 19 | 2 | 73 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 39 | 6 | 201 | – | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 53 | 5 | 175 | – | – |

### Rogue

Boss 1 first beaten (5+ wins in 10): level 10 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 8 | 0 | 8 | – | – |
| 1 | Skeleton | 10/10 | 0 | 5 | 0 | 6 | – | – |
| 1 | Two skeletons | 10/10 | 0 | 16 | 7 | 39 | – | – |
| 2 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 2 | Beetle (armored) | 10/10 | 0 | 9 | 0 | 10 | – | – |
| 2 | Skeleton | 10/10 | 0 | 6 | 0 | 7 | – | – |
| 2 | Two skeletons | 10/10 | 0 | 18 | 8 | 51 | – | – |
| 3 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 3 | Beetle (armored) | 10/10 | 0 | 9 | 0 | 12 | – | – |
| 3 | Skeleton | 10/10 | 0 | 8 | 0 | 14 | – | – |
| 3 | Two skeletons | 10/10 | 0 | 19 | 10 | 64 | – | – |
| 4 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 9 | 0 | 15 | – | – |
| 4 | Skeleton | 10/10 | 0 | 8 | 0 | 16 | – | – |
| 4 | Two skeletons | 10/10 | 0 | 18 | 10 | 71 | – | – |
| 5 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 5 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 17 | – | – |
| 5 | Skeleton | 10/10 | 0 | 10 | 0 | 20 | – | – |
| 5 | Two skeletons | 10/10 | 0 | 20 | 11 | 84 | – | – |
| 6 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 6 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 13 | – | – |
| 6 | Skeleton | 10/10 | 0 | 10 | 0 | 14 | – | – |
| 6 | Two skeletons | 9/10 | 1 | 19 | 9 | 83 | – | 16% |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 132 | – | 65% |
| 7 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 16 | – | – |
| 7 | Skeleton | 10/10 | 0 | 10 | 0 | 15 | – | – |
| 7 | Two skeletons | 9/10 | 1 | 19 | 10 | 96 | – | 17% |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 146 | – | 49% |
| 8 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 18 | – | – |
| 8 | Skeleton | 10/10 | 0 | 10 | 0 | 17 | – | – |
| 8 | Two skeletons | 9/10 | 1 | 19 | 10 | 105 | – | 4% |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 160 | – | 42% |
| 9 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 19 | – | – |
| 9 | Skeleton | 10/10 | 0 | 10 | 0 | 18 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 20 | 9 | 96 | – | – |
| 9 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 174 | – | 28% |
| 10 | Rat | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 11 | 0 | 21 | – | – |
| 10 | Skeleton | 10/10 | 0 | 10 | 0 | 20 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 20 | 10 | 109 | – | – |
| 10 | Boss 1 (lvl 7) | 9/10 | 1 | 26 | 11 | 127 | – | 26% |

### Necromancer

Boss 1 first beaten (5+ wins in 10): level 9 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 22 | 0 | 0 | 6 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 34 | 4 | 0 | 46 | – |
| 1 | Skeleton | 10/10 | 0 | 24 | 4 | 0 | 41 | – |
| 1 | Two skeletons | 10/10 | 0 | 32 | 8 | 37 | 110 | – |
| 2 | Rat | 10/10 | 0 | 15 | 0 | 0 | 9 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 20 | 0 | 0 | 18 | – |
| 2 | Skeleton | 10/10 | 0 | 20 | 0 | 0 | 25 | – |
| 2 | Two skeletons | 10/10 | 0 | 25 | 1 | 38 | 81 | – |
| 3 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 3 | Skeleton | 10/10 | 0 | 22 | 0 | 0 | 19 | – |
| 3 | Two skeletons | 10/10 | 0 | 33 | 2 | 10 | 97 | – |
| 4 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 12 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 1 | 22 | 89 | – |
| 5 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 5 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 5 | Two skeletons | 10/10 | 0 | 32 | 0 | 14 | 88 | – |
| 6 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 6 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 6 | Two skeletons | 10/10 | 0 | 33 | 0 | 14 | 83 | – |
| 6 | Boss 1 (lvl 7) | 1/10 | 9 | 100 | 14 | 214 | 116 | 55% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 7 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 7 | Two skeletons | 10/10 | 0 | 33 | 0 | 0 | 84 | – |
| 7 | Boss 1 (lvl 7) | 1/10 | 9 | 67 | 14 | 201 | 86 | 55% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 15 | – |
| 8 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 8 | Two skeletons | 10/10 | 0 | 31 | 0 | 2 | 64 | – |
| 8 | Boss 1 (lvl 7) | 4/10 | 6 | 53 | 6 | 229 | 123 | 19% |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 14 | – |
| 9 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 63 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 48 | 0 | 164 | 116 | – |
| 10 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 0 | 12 | – |
| 10 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 10 | Two skeletons | 10/10 | 0 | 33 | 0 | 0 | 63 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 40 | 1 | 173 | 99 | – |

### Cleric

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 2

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
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 451 | 81 | 49% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 41 | 17 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 97 | 27 | – |
| 7 | Skeleton | 10/10 | 0 | 15 | 0 | 80 | 32 | – |
| 7 | Two skeletons | 10/10 | 0 | 30 | 0 | 173 | 72 | – |
| 7 | Boss 1 (lvl 7) | 3/10 | 7 | 52 | 2 | 488 | 93 | 36% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 45 | 17 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 98 | 26 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 88 | 33 | – |
| 8 | Two skeletons | 10/10 | 0 | 30 | 0 | 211 | 72 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 51 | 0 | 437 | 111 | 38% |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 50 | 17 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 112 | 27 | – |
| 9 | Skeleton | 10/10 | 0 | 14 | 0 | 43 | 33 | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 0 | 192 | 82 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 48 | 0 | 409 | 100 | – |
| 10 | Rat | 10/10 | 0 | 14 | 0 | 53 | 18 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 118 | 27 | – |
| 10 | Skeleton | 10/10 | 0 | 14 | 0 | 84 | 33 | – |
| 10 | Two skeletons | 10/10 | 0 | 31 | 0 | 254 | 72 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 44 | 0 | 356 | 91 | – |

### Enchanter

Boss 1 first beaten (5+ wins in 10): never (by level 10) · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 34 | 0 | 0 | 18 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 18 | – |
| 1 | Skeleton | 10/10 | 0 | 43 | 0 | 0 | 25 | – |
| 1 | Two skeletons | 10/10 | 0 | 89 | 0 | 0 | 73 | – |
| 2 | Rat | 10/10 | 0 | 14 | 0 | 0 | 11 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 22 | 0 | 0 | 13 | – |
| 2 | Skeleton | 10/10 | 0 | 32 | 0 | 0 | 19 | – |
| 2 | Two skeletons | 10/10 | 0 | 77 | 0 | 0 | 71 | – |
| 3 | Rat | 10/10 | 0 | 13 | 0 | 0 | 15 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 20 | – |
| 3 | Skeleton | 10/10 | 0 | 26 | 0 | 0 | 27 | – |
| 3 | Two skeletons | 10/10 | 0 | 64 | 0 | 0 | 84 | – |
| 4 | Rat | 10/10 | 0 | 35 | 0 | 0 | 33 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 34 | 0 | 0 | 33 | – |
| 4 | Skeleton | 10/10 | 0 | 44 | 0 | 0 | 43 | – |
| 4 | Two skeletons | 10/10 | 0 | 91 | 0 | 0 | 107 | – |
| 5 | Rat | 10/10 | 0 | 36 | 0 | 0 | 33 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 33 | 0 | 0 | 33 | – |
| 5 | Skeleton | 10/10 | 0 | 45 | 0 | 0 | 40 | – |
| 5 | Two skeletons | 10/10 | 0 | 86 | 0 | 0 | 101 | – |
| 6 | Rat | 10/10 | 0 | 37 | 0 | 0 | 33 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 34 | 0 | 0 | 33 | – |
| 6 | Skeleton | 10/10 | 0 | 46 | 0 | 0 | 37 | – |
| 6 | Two skeletons | 10/10 | 0 | 84 | 0 | 0 | 100 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 94 | 35 | 76% |
| 7 | Rat | 10/10 | 0 | 32 | 0 | 0 | 27 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 27 | – |
| 7 | Skeleton | 10/10 | 0 | 39 | 0 | 0 | 33 | – |
| 7 | Two skeletons | 10/10 | 0 | 69 | 0 | 0 | 86 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 104 | 32 | 67% |
| 8 | Rat | 10/10 | 0 | 32 | 0 | 0 | 27 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 27 | – |
| 8 | Skeleton | 10/10 | 0 | 39 | 0 | 0 | 33 | – |
| 8 | Two skeletons | 10/10 | 0 | 70 | 0 | 0 | 85 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 114 | 29 | 65% |
| 9 | Rat | 10/10 | 0 | 33 | 0 | 0 | 27 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 27 | – |
| 9 | Skeleton | 10/10 | 0 | 40 | 0 | 0 | 33 | – |
| 9 | Two skeletons | 10/10 | 0 | 72 | 0 | 0 | 85 | – |
| 9 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 124 | 26 | 55% |
| 10 | Rat | 10/10 | 0 | 33 | 0 | 0 | 27 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 27 | – |
| 10 | Skeleton | 10/10 | 0 | 41 | 0 | 0 | 33 | – |
| 10 | Two skeletons | 10/10 | 0 | 73 | 0 | 0 | 84 | – |
| 10 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 134 | 48 | 63% |

### Paladin

Boss 1 first beaten (5+ wins in 10): level 8 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 12 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 4 | 30 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 3 | 35 | 0 | – |
| 1 | Two skeletons | 8/10 | 2 | 33 | 4 | 113 | 0 | 7% |
| 2 | Rat | 10/10 | 0 | 12 | 0 | 13 | 0 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 22 | 3 | 32 | 0 | – |
| 2 | Skeleton | 10/10 | 0 | 18 | 2 | 38 | 0 | – |
| 2 | Two skeletons | 4/10 | 6 | 35 | 5 | 150 | 0 | 9% |
| 3 | Rat | 10/10 | 0 | 13 | 0 | 17 | 0 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 21 | 4 | 40 | 0 | – |
| 3 | Skeleton | 10/10 | 0 | 18 | 2 | 42 | 0 | – |
| 3 | Two skeletons | 7/10 | 3 | 38 | 6 | 190 | 6 | 8% |
| 4 | Rat | 10/10 | 0 | 12 | 0 | 20 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 22 | 4 | 47 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 14 | 1 | 37 | 20 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 1 | 144 | 35 | – |
| 5 | Rat | 10/10 | 0 | 13 | 0 | 25 | 0 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 22 | 6 | 59 | 0 | – |
| 5 | Skeleton | 10/10 | 0 | 14 | 1 | 42 | 20 | – |
| 5 | Two skeletons | 10/10 | 0 | 31 | 2 | 168 | 34 | – |
| 6 | Rat | 10/10 | 0 | 13 | 0 | 29 | 14 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 24 | 2 | 70 | 14 | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 1 | 49 | 33 | – |
| 6 | Two skeletons | 10/10 | 0 | 27 | 0 | 174 | 45 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 323 | 46 | 62% |
| 7 | Rat | 10/10 | 0 | 13 | 0 | 33 | 14 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 25 | 1 | 77 | 14 | – |
| 7 | Skeleton | 10/10 | 0 | 12 | 0 | 51 | 31 | – |
| 7 | Two skeletons | 10/10 | 0 | 25 | 1 | 186 | 42 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 330 | 47 | 47% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 32 | 14 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 1 | 85 | 14 | – |
| 8 | Skeleton | 10/10 | 0 | 11 | 0 | 50 | 34 | – |
| 8 | Two skeletons | 10/10 | 0 | 20 | 4 | 153 | 42 | – |
| 8 | Boss 1 (lvl 7) | 5/10 | 5 | 35 | 4 | 383 | 79 | 13% |
| 9 | Rat | 10/10 | 0 | 13 | 0 | 31 | 14 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 81 | 14 | – |
| 9 | Skeleton | 10/10 | 0 | 11 | 0 | 55 | 34 | – |
| 9 | Two skeletons | 10/10 | 0 | 19 | 4 | 159 | 41 | – |
| 9 | Boss 1 (lvl 7) | 9/10 | 1 | 33 | 2 | 296 | 72 | 33% |
| 10 | Rat | 10/10 | 0 | 13 | 0 | 33 | 14 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 92 | 14 | – |
| 10 | Skeleton | 10/10 | 0 | 11 | 0 | 54 | 34 | – |
| 10 | Two skeletons | 10/10 | 0 | 19 | 4 | 167 | 41 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 29 | 4 | 218 | 71 | – |

### Shadow Knight

Boss 1 first beaten (5+ wins in 10): level 10 · Two skeletons (8+ in 10): from level 8

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
| 5 | Skeleton | 10/10 | 0 | 14 | 0 | 24 | 6 | – |
| 5 | Two skeletons | 2/10 | 8 | 29 | 8 | 152 | 29 | 18% |
| 6 | Rat | 10/10 | 0 | 20 | 0 | 1 | 8 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 17 | 11 | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 0 | 27 | 6 | – |
| 6 | Two skeletons | 4/10 | 6 | 34 | 8 | 181 | 39 | 9% |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 162 | 27 | 57% |
| 7 | Rat | 10/10 | 0 | 20 | 0 | 0 | 7 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 24 | 0 | 19 | 12 | – |
| 7 | Skeleton | 10/10 | 0 | 14 | 0 | 29 | 6 | – |
| 7 | Two skeletons | 7/10 | 3 | 36 | 8 | 206 | 45 | 13% |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 190 | 37 | 59% |
| 8 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 0 | 19 | 12 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 33 | 6 | – |
| 8 | Two skeletons | 10/10 | 0 | 36 | 8 | 234 | 59 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 248 | 62 | 43% |
| 9 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 12 | 9 | – |
| 9 | Skeleton | 10/10 | 0 | 16 | 0 | 36 | 6 | – |
| 9 | Two skeletons | 10/10 | 0 | 36 | 8 | 258 | 58 | – |
| 9 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 275 | 65 | 26% |
| 10 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 12 | 9 | – |
| 10 | Skeleton | 10/10 | 0 | 18 | 0 | 37 | 6 | – |
| 10 | Two skeletons | 10/10 | 0 | 36 | 8 | 276 | 58 | – |
| 10 | Boss 1 (lvl 7) | 7/10 | 3 | 51 | 13 | 307 | 79 | 18% |

### Wizard

Boss 1 first beaten (5+ wins in 10): level 10 · Two skeletons (8+ in 10): from level 1

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
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 92 | 185 | 46% |
| 7 | Rat | 10/10 | 0 | 8 | 1 | 0 | 43 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 0 | 72 | – |
| 7 | Skeleton | 10/10 | 0 | 12 | 2 | 0 | 60 | – |
| 7 | Two skeletons | 10/10 | 0 | 26 | 7 | 0 | 114 | – |
| 7 | Boss 1 (lvl 7) | 1/10 | 9 | 92 | 17 | 100 | 214 | 23% |
| 8 | Rat | 10/10 | 0 | 8 | 1 | 0 | 43 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 0 | 72 | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 2 | 0 | 60 | – |
| 8 | Two skeletons | 10/10 | 0 | 26 | 6 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 112 | 222 | 28% |
| 9 | Rat | 10/10 | 0 | 8 | 0 | 0 | 43 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 15 | 2 | 0 | 72 | – |
| 9 | Skeleton | 10/10 | 0 | 12 | 1 | 0 | 60 | – |
| 9 | Two skeletons | 10/10 | 0 | 26 | 5 | 0 | 114 | – |
| 9 | Boss 1 (lvl 7) | 2/10 | 5 (+3 escaped) | 50 | 14 | 109 | 208 | 48% |
| 10 | Rat | 10/10 | 0 | 8 | 0 | 0 | 43 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 15 | 2 | 0 | 73 | – |
| 10 | Skeleton | 10/10 | 0 | 12 | 1 | 0 | 60 | – |
| 10 | Two skeletons | 10/10 | 0 | 26 | 4 | 0 | 114 | – |
| 10 | Boss 1 (lvl 7) | 5/10 | 1 (+4 escaped) | 48 | 14 | 104 | 191 | 88% |

### Magician

Boss 1 first beaten (5+ wins in 10): level 10 · Two skeletons (8+ in 10): from level 3

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
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 94 | 79 | 60% |
| 7 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 7 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 7 | Two skeletons | 10/10 | 0 | 47 | 0 | 17 | 81 | – |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 104 | 64 | 57% |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 8 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 8 | Two skeletons | 10/10 | 0 | 47 | 0 | 22 | 78 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 114 | 75 | 49% |
| 9 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 9 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 9 | Two skeletons | 10/10 | 0 | 47 | 0 | 25 | 77 | – |
| 9 | Boss 1 (lvl 7) | 1/10 | 9 | 81 | 17 | 124 | 82 | 42% |
| 10 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 10 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 10 | Two skeletons | 10/10 | 0 | 47 | 0 | 26 | 77 | – |
| 10 | Boss 1 (lvl 7) | 8/10 | 2 | 75 | 13 | 131 | 110 | 40% |

### Ranger

Boss 1 first beaten (5+ wins in 10): level 7 · Two skeletons (8+ in 10): from level 1

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
| 6 | Boss 1 (lvl 7) | 4/10 | 6 | 95 | 8 | 247 | 112 | 33% |
| 7 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 10 | – |
| 7 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 7 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 48 | – |
| 7 | Boss 1 (lvl 7) | 7/10 | 3 | 77 | 4 | 218 | 106 | 37% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 48 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 58 | 5 | 182 | 86 | 1% |
| 9 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 9 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 9 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 49 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 53 | 9 | 154 | 77 | – |
| 10 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 10 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 10 | Two skeletons | 10/10 | 0 | 40 | 0 | 0 | 50 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 53 | 4 | 139 | 66 | – |

### Monk

Boss 1 first beaten (5+ wins in 10): level 10 · Two skeletons (8+ in 10): from level 6

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
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 5 | 55 | – | – |
| 4 | Skeleton | 10/10 | 0 | 15 | 4 | 65 | – | – |
| 4 | Two skeletons | 3/10 | 3 (+4 escaped) | 34 | 10 | 145 | – | 26% |
| 5 | Rat | 10/10 | 0 | 8 | 0 | 21 | – | – |
| 5 | Beetle (armored) | 10/10 | 0 | 16 | 5 | 53 | – | – |
| 5 | Skeleton | 10/10 | 0 | 13 | 6 | 64 | – | – |
| 5 | Two skeletons | 6/10 | 3 (+1 escaped) | 34 | 11 | 161 | – | 10% |
| 6 | Rat | 10/10 | 0 | 8 | 0 | 24 | – | – |
| 6 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 60 | – | – |
| 6 | Skeleton | 10/10 | 0 | 13 | 7 | 73 | – | – |
| 6 | Two skeletons | 9/10 | 0 (+1 escaped) | 36 | 11 | 174 | – | 27% |
| 6 | Boss 1 (lvl 7) | 0/10 | 2 (+8 escaped) | – | – | 188 | – | 70% |
| 7 | Rat | 10/10 | 0 | 8 | 0 | 28 | – | – |
| 7 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 68 | – | – |
| 7 | Skeleton | 10/10 | 0 | 13 | 7 | 81 | – | – |
| 7 | Two skeletons | 8/10 | 1 (+1 escaped) | 36 | 11 | 195 | – | 33% |
| 7 | Boss 1 (lvl 7) | 0/10 | 8 (+2 escaped) | – | – | 212 | – | 62% |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 12 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 5 | 70 | – | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 5 | 70 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 31 | 6 | 177 | – | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 237 | – | 41% |
| 9 | Rat | 10/10 | 0 | 7 | 0 | 13 | – | – |
| 9 | Beetle (armored) | 10/10 | 0 | 16 | 5 | 72 | – | – |
| 9 | Skeleton | 10/10 | 0 | 12 | 5 | 77 | – | – |
| 9 | Two skeletons | 10/10 | 0 | 31 | 6 | 188 | – | – |
| 9 | Boss 1 (lvl 7) | 0/10 | 1 (+9 escaped) | – | – | 242 | – | 28% |
| 10 | Rat | 10/10 | 0 | 7 | 0 | 14 | – | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 5 | 78 | – | – |
| 10 | Skeleton | 10/10 | 0 | 12 | 5 | 83 | – | – |
| 10 | Two skeletons | 10/10 | 0 | 32 | 7 | 211 | – | – |
| 10 | Boss 1 (lvl 7) | 7/10 | 0 (+3 escaped) | 44 | 10 | 229 | – | 10% |

### Shaman

Boss 1 first beaten (5+ wins in 10): level 6 · Two skeletons (8+ in 10): from level 1

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 40 | 0 | 0 | 18 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 33 | 0 | 0 | 12 | – |
| 1 | Skeleton | 10/10 | 0 | 48 | 0 | 0 | 18 | – |
| 1 | Two skeletons | 10/10 | 0 | 58 | 0 | 0 | 38 | – |
| 2 | Rat | 10/10 | 0 | 34 | 0 | 0 | 24 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 32 | 0 | 0 | 24 | – |
| 2 | Skeleton | 10/10 | 0 | 42 | 0 | 0 | 31 | – |
| 2 | Two skeletons | 10/10 | 0 | 51 | 0 | 0 | 63 | – |
| 3 | Rat | 10/10 | 0 | 34 | 0 | 0 | 24 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 31 | 0 | 0 | 24 | – |
| 3 | Skeleton | 10/10 | 0 | 43 | 0 | 0 | 32 | – |
| 3 | Two skeletons | 10/10 | 0 | 52 | 0 | 0 | 64 | – |
| 4 | Rat | 10/10 | 0 | 17 | 0 | 0 | 22 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 22 | – |
| 4 | Skeleton | 10/10 | 0 | 22 | 0 | 0 | 34 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 62 | – |
| 5 | Rat | 10/10 | 0 | 16 | 0 | 0 | 22 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 5 | Skeleton | 10/10 | 0 | 21 | 0 | 0 | 29 | – |
| 5 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 60 | – |
| 6 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 6 | Skeleton | 10/10 | 0 | 20 | 0 | 0 | 26 | – |
| 6 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 57 | – |
| 6 | Boss 1 (lvl 7) | 9/10 | 1 | 75 | 8 | 256 | 189 | 26% |
| 7 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 7 | Skeleton | 10/10 | 0 | 20 | 0 | 0 | 25 | – |
| 7 | Two skeletons | 10/10 | 0 | 30 | 0 | 0 | 55 | – |
| 7 | Boss 1 (lvl 7) | 10/10 | 0 | 59 | 5 | 171 | 113 | – |
| 8 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 8 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 23 | – |
| 8 | Two skeletons | 10/10 | 0 | 28 | 0 | 0 | 45 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 52 | 4 | 146 | 104 | – |
| 9 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 9 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 23 | – |
| 9 | Two skeletons | 10/10 | 0 | 27 | 0 | 0 | 47 | – |
| 9 | Boss 1 (lvl 7) | 10/10 | 0 | 48 | 2 | 132 | 89 | – |
| 10 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 10 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 22 | – |
| 10 | Two skeletons | 10/10 | 0 | 27 | 0 | 0 | 45 | – |
| 10 | Boss 1 (lvl 7) | 10/10 | 0 | 45 | 5 | 133 | 84 | – |

### Bard

Boss 1 first beaten (5+ wins in 10): never (by level 10) · Two skeletons (8+ in 10): from level 4

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 1 | 33 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 41 | 0 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 70 | 0 | 58% |
| 2 | Rat | 10/10 | 0 | 11 | 0 | 17 | 0 | – |
| 2 | Beetle (armored) | 10/10 | 0 | 19 | 1 | 43 | 0 | – |
| 2 | Skeleton | 10/10 | 0 | 14 | 2 | 46 | 0 | – |
| 2 | Two skeletons | 0/10 | 10 | – | – | 86 | 0 | 52% |
| 3 | Rat | 10/10 | 0 | 11 | 0 | 21 | 0 | – |
| 3 | Beetle (armored) | 10/10 | 0 | 18 | 1 | 50 | 0 | – |
| 3 | Skeleton | 10/10 | 0 | 15 | 2 | 58 | 0 | – |
| 3 | Two skeletons | 0/10 | 10 | – | – | 100 | 0 | 52% |
| 4 | Rat | 10/10 | 0 | 11 | 0 | 24 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 1 | 57 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 15 | 2 | 66 | 0 | – |
| 4 | Two skeletons | 9/10 | 1 | 31 | 5 | 145 | 16 | 48% |
| 5 | Rat | 10/10 | 0 | 11 | 0 | 28 | 0 | – |
| 5 | Beetle (armored) | 10/10 | 0 | 19 | 1 | 71 | 0 | – |
| 5 | Skeleton | 10/10 | 0 | 14 | 2 | 75 | 0 | – |
| 5 | Two skeletons | 9/10 | 1 | 31 | 5 | 167 | 16 | 26% |
| 6 | Rat | 10/10 | 0 | 10 | 0 | 25 | 0 | – |
| 6 | Beetle (armored) | 10/10 | 0 | 17 | 5 | 54 | 0 | – |
| 6 | Skeleton | 10/10 | 0 | 14 | 4 | 65 | 0 | – |
| 6 | Two skeletons | 10/10 | 0 | 36 | 6 | 174 | 21 | – |
| 6 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 143 | 5 | 77% |
| 7 | Rat | 10/10 | 0 | 10 | 0 | 27 | 0 | – |
| 7 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 63 | 0 | – |
| 7 | Skeleton | 10/10 | 0 | 13 | 4 | 71 | 0 | – |
| 7 | Two skeletons | 7/10 | 3 | 36 | 6 | 186 | 21 | 12% |
| 7 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 168 | 5 | 57% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 32 | 0 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 68 | 0 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 4 | 78 | 0 | – |
| 8 | Two skeletons | 8/10 | 2 | 40 | 5 | 221 | 38 | 24% |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 234 | 27 | 67% |
| 9 | Rat | 10/10 | 0 | 10 | 1 | 36 | 0 | – |
| 9 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 76 | 0 | – |
| 9 | Skeleton | 10/10 | 0 | 14 | 4 | 87 | 0 | – |
| 9 | Two skeletons | 8/10 | 2 | 36 | 5 | 251 | 37 | 20% |
| 9 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 264 | 30 | 61% |
| 10 | Rat | 10/10 | 0 | 10 | 0 | 37 | 0 | – |
| 10 | Beetle (armored) | 10/10 | 0 | 17 | 7 | 83 | 0 | – |
| 10 | Skeleton | 10/10 | 0 | 14 | 4 | 96 | 0 | – |
| 10 | Two skeletons | 8/10 | 2 | 42 | 5 | 280 | 37 | 18% |
| 10 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 286 | 35 | 52% |

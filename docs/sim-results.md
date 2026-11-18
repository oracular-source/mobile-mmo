# Sim results

Made by the testing grounds sim (`js/sim.js`), v0.16, Nov 17; batch 1 added in v0.17, batch 2 in v0.18. Each class's bot plays by its playbook (`docs/playbooks.md`) with no gear, against mobs at its own level (Boss 1 is always level 7). Each line is 10 fights with fixed seeds 1000–1009, so running it again gives the same numbers until the game changes.

How to read it: **Kill** = seconds from the pull to the last mob dying (wins only). **Rest** = seconds sitting afterward to get back to 80% health and mana. **Dmg taken** and **Mana used** are per fight. **Mob HP left** = how much health the mobs still had when you lost.

Run it yourself on the phone: open the game with `?dev`, DEV → Testing grounds → **Run sim** (runs the class you're playing).

## What stands out: batch 2 (v0.18)
First numbers for Magician, Ranger, Monk, Shaman and Bard (tables at the bottom). Draft numbers for the balance pass; the older nine classes weren't re-run (no changes to their rules).
- **Shaman is the new safest class:** takes no damage against singles and pairs at any level and **wins Boss 1 10 in 10** (Drowsy plus two DoTs plus Venom Totem, kiting). Singles are slow at level 1 (33–48s) but fine by level 4 (16–22s). Likely too strong on Boss 1: a balance-pass target, along with the Cleric.
- **Ranger is close behind:** no damage taken outside Boss 1, wins every pair, and wins Boss 1 9 in 10. Kiting with traps and snares is very strong in a perfect bot's hands; real thumbs will take hits.
- **Magician kills singles fastest of the pet classes** (7s rats, 10s skeletons at level 8 with a Fire elemental) and clears pairs at levels 4 and 8 with Earth, but loses Boss 1 every time (about half its health left): it has no self-heal, and the shadow bolts reach it while the pet tanks. Level 1 pairs: 4 in 10.
- **Monk:** singles fine at every level. Two skeletons: no Feign Death at levels 1–2 (lose every time, as the playbook expects: pull singles only); at level 4 the split works but wins only 3 in 10 (4 more escape); at level 8 it wins all 10. Never beats Boss 1 (fits the melee known issue).
- **Bard:** steady on singles, takes the most damage of the batch. Wins pairs from level 4 (9/10), not at level 1 (only Song of Mending and Slash). Never beats Boss 1 (two-thirds of its health left).
- **Bots play perfectly** here too, so the kiters (Shaman, Ranger) look better than they will on a phone.

## What stands out: batch 1 (v0.17)
First numbers for the five new classes (same mobs, seeds and rules; tables at the bottom). The four older classes re-ran identical to v0.16. These are draft numbers for the balance pass (milestone 3c), not tuning targets.
- **Wizard and Enchanter take no damage** against single mobs and pairs at every level: the bots kite (Wizard) or let the pet and sleep do the work (Enchanter) perfectly. Same caveat as the Druid: a real thumb won't. Both lose every Boss 1 fight (Boss 1 can't be mezzed or charmed, and its shadow bolt reaches them).
- **Wizard kills fastest of the casters** (8s rats, 12s skeletons) but rests the most per fight and burns ~60 mana a skeleton, as designed.
- **Enchanter kills slowest** (30–45s singles, 70–90s pairs) but never dies outside Boss 1: control over speed.
- **Cleric is the safest melee:** wins Boss 1 9 times in 10 at level 8 (healing through it, and every heal burns Boss 1), but kills are slow. Two skeletons at level 1 (no Turn Undead or Renew yet) lose 9 in 10. It may be too strong on Boss 1 for "bottom anchor".
- **Paladin wins Boss 1 half the time** and clears pairs fastest of the tanks (20s at level 8 with Consecrate and Divine Strike). Strong in the crypt, as intended.
- **Shadow Knight struggles with pairs before level 8** (0/10 at level 1, 1/10 at level 4) and never beats Boss 1; at level 8 Dark Cleave turns pairs into wins. The "likes a crowd" twist only arrives at 8; the balance pass should look at earlier levels.

## What stands out (first run, v0.16)
- **Warrior is the weakest solo by far:** it loses every two-skeleton fight and Boss 1 (to about half health), and kills singles slowest. Matches the "tanks find solo harder" decision, but the gap is big.
- **Rogue kills singles fastest** (3s rats from Hide), but can't beat Boss 1 (fits the known issue).
- **Necro is the safest:** never dies outside Boss 1 and barely takes damage, as planned (top anchor).
- **Druid takes no damage from level 4 on:** the bot kites perfectly. A real thumb on a phone won't, so treat Druid numbers as a best case.
- **Boss 1 at level 8:** Druid wins half, Necro 4 in 10, Warrior and Rogue never.
- **Rogue Evade, both ways:** "as damage" (A) clears pairs faster (19s vs 30s) and gets Boss 1 lower (42% left vs 64%), but died once in 10 pair fights; "as escape" (B) never died outside Boss 1. **Owner picked A (Nov 17);** later sim runs show only A.

## Tables
### Druid
| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 8 | 1 | 10 | 31 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 16 | 4 | 30 | 58 | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 3 | 39 | 53 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 60 | 37 | 62% |
| 4 | Rat | 10/10 | 0 | 10 | 2 | 0 | 40 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 13 | 3 | 0 | 52 | – |
| 4 | Skeleton | 10/10 | 0 | 13 | 3 | 0 | 50 | – |
| 4 | Two skeletons | 10/10 | 0 | 34 | 6 | 0 | 97 | – |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 40 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 13 | 1 | 0 | 52 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 1 | 0 | 50 | – |
| 8 | Two skeletons | 10/10 | 0 | 32 | 5 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 5/10 | 5 | 55 | 10 | 128 | 152 | 17% |
### Warrior
| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 9 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 1 | 26 | – | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 31 | – | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 76 | – | 30% |
| 4 | Rat | 10/10 | 0 | 14 | 0 | 21 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 23 | 2 | 44 | – | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 2 | 50 | – | – |
| 4 | Two skeletons | 0/10 | 10 | – | – | 124 | – | 45% |
| 8 | Rat | 10/10 | 0 | 14 | 0 | 34 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 2 | 75 | – | – |
| 8 | Skeleton | 10/10 | 0 | 19 | 3 | 83 | – | – |
| 8 | Two skeletons | 1/10 | 9 | 37 | 9 | 193 | – | 32% |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 198 | – | 53% |
### Necromancer
| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 22 | 0 | 0 | 6 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 34 | 4 | 0 | 46 | – |
| 1 | Skeleton | 10/10 | 0 | 24 | 4 | 0 | 41 | – |
| 1 | Two skeletons | 10/10 | 0 | 32 | 8 | 37 | 110 | – |
| 4 | Rat | 10/10 | 0 | 14 | 0 | 0 | 9 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 9 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 12 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 1 | 22 | 89 | – |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 18 | 0 | 0 | 15 | – |
| 8 | Skeleton | 10/10 | 0 | 18 | 0 | 0 | 19 | – |
| 8 | Two skeletons | 10/10 | 0 | 31 | 0 | 2 | 64 | – |
| 8 | Boss 1 (lvl 7) | 4/10 | 6 | 53 | 6 | 229 | 123 | 19% |
### Rogue
| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat · Evade as damage | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 1 | Beetle (armored) · Evade as damage | 10/10 | 0 | 8 | 0 | 8 | – | – |
| 1 | Skeleton · Evade as damage | 10/10 | 0 | 5 | 0 | 6 | – | – |
| 1 | Two skeletons · Evade as damage | 10/10 | 0 | 16 | 7 | 39 | – | – |
| 4 | Rat · Evade as damage | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 4 | Beetle (armored) · Evade as damage | 10/10 | 0 | 9 | 0 | 15 | – | – |
| 4 | Skeleton · Evade as damage | 10/10 | 0 | 8 | 0 | 16 | – | – |
| 4 | Two skeletons · Evade as damage | 10/10 | 0 | 18 | 10 | 71 | – | – |
| 8 | Rat · Evade as damage | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 8 | Beetle (armored) · Evade as damage | 10/10 | 0 | 11 | 0 | 18 | – | – |
| 8 | Skeleton · Evade as damage | 10/10 | 0 | 10 | 0 | 17 | – | – |
| 8 | Two skeletons · Evade as damage | 9/10 | 1 | 19 | 10 | 105 | – | 4% |
| 8 | Boss 1 (lvl 7) · Evade as damage | 0/10 | 10 | – | – | 160 | – | 42% |
| 1 | Rat · Evade as escape | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 1 | Beetle (armored) · Evade as escape | 10/10 | 0 | 8 | 0 | 8 | – | – |
| 1 | Skeleton · Evade as escape | 10/10 | 0 | 5 | 0 | 6 | – | – |
| 1 | Two skeletons · Evade as escape | 10/10 | 0 | 16 | 7 | 39 | – | – |
| 4 | Rat · Evade as escape | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 4 | Beetle (armored) · Evade as escape | 10/10 | 0 | 9 | 0 | 15 | – | – |
| 4 | Skeleton · Evade as escape | 10/10 | 0 | 8 | 0 | 16 | – | – |
| 4 | Two skeletons · Evade as escape | 10/10 | 0 | 18 | 10 | 71 | – | – |
| 8 | Rat · Evade as escape | 10/10 | 0 | 3 | 0 | 0 | – | – |
| 8 | Beetle (armored) · Evade as escape | 10/10 | 0 | 10 | 0 | 23 | – | – |
| 8 | Skeleton · Evade as escape | 10/10 | 0 | 8 | 0 | 19 | – | – |
| 8 | Two skeletons · Evade as escape | 10/10 | 0 | 30 | 4 | 116 | – | – |
| 8 | Boss 1 (lvl 7) · Evade as escape | 0/10 | 10 | – | – | 174 | – | 64% |

## Batch 1 tables (v0.17)

### Cleric

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 13 | 1 | 15 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 24 | 5 | 40 | 6 | – |
| 1 | Skeleton | 10/10 | 0 | 17 | 0 | 42 | 18 | – |
| 1 | Two skeletons | 1/10 | 9 | 31 | 4 | 88 | 15 | 46% |
| 4 | Rat | 10/10 | 0 | 13 | 0 | 26 | 17 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 26 | 0 | 69 | 27 | – |
| 4 | Skeleton | 10/10 | 0 | 16 | 0 | 52 | 33 | – |
| 4 | Two skeletons | 9/10 | 1 | 25 | 0 | 167 | 49 | 28% |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 45 | 17 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 0 | 98 | 26 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 88 | 33 | – |
| 8 | Two skeletons | 10/10 | 0 | 30 | 0 | 211 | 72 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 51 | 0 | 437 | 111 | 38% |

### Enchanter

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 34 | 0 | 0 | 18 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 18 | – |
| 1 | Skeleton | 10/10 | 0 | 43 | 0 | 0 | 25 | – |
| 1 | Two skeletons | 10/10 | 0 | 89 | 0 | 0 | 73 | – |
| 4 | Rat | 10/10 | 0 | 35 | 0 | 0 | 33 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 34 | 0 | 0 | 33 | – |
| 4 | Skeleton | 10/10 | 0 | 44 | 0 | 0 | 43 | – |
| 4 | Two skeletons | 10/10 | 0 | 91 | 0 | 0 | 107 | – |
| 8 | Rat | 10/10 | 0 | 32 | 0 | 0 | 27 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 30 | 0 | 0 | 27 | – |
| 8 | Skeleton | 10/10 | 0 | 39 | 0 | 0 | 33 | – |
| 8 | Two skeletons | 10/10 | 0 | 70 | 0 | 0 | 85 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 114 | 29 | 65% |

### Paladin

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 12 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 4 | 30 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 3 | 35 | 0 | – |
| 1 | Two skeletons | 8/10 | 2 | 33 | 4 | 113 | 0 | 7% |
| 4 | Rat | 10/10 | 0 | 12 | 0 | 20 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 22 | 4 | 47 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 14 | 1 | 37 | 20 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 1 | 144 | 35 | – |
| 8 | Rat | 10/10 | 0 | 13 | 0 | 32 | 14 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 25 | 1 | 85 | 14 | – |
| 8 | Skeleton | 10/10 | 0 | 11 | 0 | 50 | 34 | – |
| 8 | Two skeletons | 10/10 | 0 | 20 | 4 | 153 | 42 | – |
| 8 | Boss 1 (lvl 7) | 5/10 | 5 | 35 | 4 | 383 | 79 | 13% |

### Shadow Knight

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 12 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 21 | 4 | 31 | 7 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 36 | 8 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 75 | 12 | 47% |
| 4 | Rat | 10/10 | 0 | 20 | 0 | 1 | 8 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 23 | 0 | 13 | 12 | – |
| 4 | Skeleton | 10/10 | 0 | 19 | 0 | 24 | 8 | – |
| 4 | Two skeletons | 1/10 | 9 | 31 | 8 | 132 | 28 | 30% |
| 8 | Rat | 10/10 | 0 | 19 | 0 | 0 | 6 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 24 | 0 | 19 | 12 | – |
| 8 | Skeleton | 10/10 | 0 | 15 | 0 | 33 | 6 | – |
| 8 | Two skeletons | 10/10 | 0 | 36 | 8 | 234 | 59 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 248 | 62 | 43% |

### Wizard

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 8 | 4 | 0 | 38 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 16 | 9 | 0 | 69 | – |
| 1 | Skeleton | 10/10 | 0 | 13 | 7 | 0 | 55 | – |
| 1 | Two skeletons | 10/10 | 0 | 43 | 11 | 0 | 110 | – |
| 4 | Rat | 10/10 | 0 | 8 | 3 | 0 | 43 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 15 | 6 | 0 | 72 | – |
| 4 | Skeleton | 10/10 | 0 | 12 | 5 | 0 | 60 | – |
| 4 | Two skeletons | 10/10 | 0 | 32 | 10 | 0 | 116 | – |
| 8 | Rat | 10/10 | 0 | 8 | 1 | 0 | 43 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 15 | 3 | 0 | 72 | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 2 | 0 | 60 | – |
| 8 | Two skeletons | 10/10 | 0 | 26 | 6 | 0 | 114 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 112 | 222 | 28% |

### Magician

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 0 | 29 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 19 | 0 | 0 | 49 | – |
| 1 | Skeleton | 10/10 | 0 | 15 | 0 | 0 | 39 | – |
| 1 | Two skeletons | 4/10 | 6 | 50 | 10 | 42 | 81 | 11% |
| 4 | Rat | 10/10 | 0 | 8 | 0 | 0 | 25 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 14 | 0 | 0 | 42 | – |
| 4 | Skeleton | 10/10 | 0 | 11 | 0 | 0 | 36 | – |
| 4 | Two skeletons | 10/10 | 0 | 48 | 0 | 13 | 85 | – |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 0 | 30 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 12 | 0 | 0 | 42 | – |
| 8 | Skeleton | 10/10 | 0 | 10 | 0 | 0 | 38 | – |
| 8 | Two skeletons | 10/10 | 0 | 47 | 0 | 22 | 78 | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 114 | 75 | 49% |
### Ranger

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 10 | 0 | 0 | 4 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 17 | 0 | 0 | 4 | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 0 | 0 | 4 | – |
| 1 | Two skeletons | 10/10 | 0 | 28 | 0 | 0 | 8 | – |
| 4 | Rat | 10/10 | 0 | 12 | 0 | 0 | 9 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 20 | 0 | 0 | 12 | – |
| 4 | Skeleton | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 4 | Two skeletons | 10/10 | 0 | 45 | 0 | 0 | 28 | – |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 0 | 9 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 9 | – |
| 8 | Skeleton | 10/10 | 0 | 13 | 0 | 0 | 9 | – |
| 8 | Two skeletons | 10/10 | 0 | 41 | 0 | 0 | 48 | – |
| 8 | Boss 1 (lvl 7) | 9/10 | 1 | 58 | 5 | 182 | 86 | 1% |
### Monk

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 10 | 0 | 12 | – | – |
| 1 | Beetle (armored) | 10/10 | 0 | 18 | 4 | 30 | – | – |
| 1 | Skeleton | 10/10 | 0 | 14 | 2 | 38 | – | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 89 | – | 45% |
| 4 | Rat | 10/10 | 0 | 10 | 0 | 18 | – | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 5 | 55 | – | – |
| 4 | Skeleton | 10/10 | 0 | 15 | 4 | 65 | – | – |
| 4 | Two skeletons | 3/10 | 3 (+4 escaped) | 34 | 10 | 145 | – | 26% |
| 8 | Rat | 10/10 | 0 | 7 | 0 | 12 | – | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 5 | 70 | – | – |
| 8 | Skeleton | 10/10 | 0 | 12 | 5 | 70 | – | – |
| 8 | Two skeletons | 10/10 | 0 | 31 | 6 | 177 | – | – |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 237 | – | 41% |
### Shaman

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 40 | 0 | 0 | 18 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 33 | 0 | 0 | 12 | – |
| 1 | Skeleton | 10/10 | 0 | 48 | 0 | 0 | 18 | – |
| 1 | Two skeletons | 10/10 | 0 | 58 | 0 | 0 | 38 | – |
| 4 | Rat | 10/10 | 0 | 17 | 0 | 0 | 22 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 22 | – |
| 4 | Skeleton | 10/10 | 0 | 22 | 0 | 0 | 34 | – |
| 4 | Two skeletons | 10/10 | 0 | 31 | 0 | 0 | 62 | – |
| 8 | Rat | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 16 | 0 | 0 | 21 | – |
| 8 | Skeleton | 10/10 | 0 | 19 | 0 | 0 | 23 | – |
| 8 | Two skeletons | 10/10 | 0 | 28 | 0 | 0 | 45 | – |
| 8 | Boss 1 (lvl 7) | 10/10 | 0 | 52 | 4 | 146 | 104 | – |
### Bard

| Lvl | Fight | Win | Deaths | Kill (s) | Rest (s) | Dmg taken | Mana used | Mob HP left (losses) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rat | 10/10 | 0 | 11 | 0 | 11 | 0 | – |
| 1 | Beetle (armored) | 10/10 | 0 | 20 | 1 | 33 | 0 | – |
| 1 | Skeleton | 10/10 | 0 | 16 | 2 | 41 | 0 | – |
| 1 | Two skeletons | 0/10 | 10 | – | – | 70 | 0 | 58% |
| 4 | Rat | 10/10 | 0 | 11 | 0 | 25 | 0 | – |
| 4 | Beetle (armored) | 10/10 | 0 | 18 | 1 | 57 | 0 | – |
| 4 | Skeleton | 10/10 | 0 | 15 | 2 | 66 | 0 | – |
| 4 | Two skeletons | 9/10 | 1 | 31 | 5 | 145 | 16 | 48% |
| 8 | Rat | 10/10 | 0 | 10 | 0 | 30 | 0 | – |
| 8 | Beetle (armored) | 10/10 | 0 | 17 | 6 | 68 | 0 | – |
| 8 | Skeleton | 10/10 | 0 | 14 | 4 | 77 | 0 | – |
| 8 | Two skeletons | 8/10 | 2 | 39 | 5 | 226 | 38 | 18% |
| 8 | Boss 1 (lvl 7) | 0/10 | 10 | – | – | 236 | 28 | 67% |

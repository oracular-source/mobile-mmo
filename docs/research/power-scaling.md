# Power scaling: feeling overpowered at 50 without breaking the game

Skill tree chat, Nov 19, 2026. **Approved by the owner (Nov 19):** "breadth grows, depth stays flat, zones fixed" is the scaling rule. The ladder numbers and the Necro path below are starting targets that the sim will tune.

Owner's goal (Nov 19): by the end, characters should feel **really strong**, with a big EverQuest-style sense of progression (e.g. a Necromancer with about 5 skeletons). Clutter is a later problem. Scaling has to hold up to level 50 and past.

## The core problem
Our rule 9 (progression note) says mobs are tuned assuming you have your forks, and abilities grow every level. If every same-level mob grows exactly as fast as you, you never *feel* stronger: a level 50 fighting a level 50 mob feels like a level 10 fighting a level 10 mob. That's the ESO / Oblivion trap: players there report feeling weaker as they level because enemies scale with them.

## The rule in one line
**Grow breadth a lot, grow depth a little, never scale zones.**
- **Depth** = how long one same-level mob takes to kill / how hard it hits you. Stays roughly the same from level 10 to 50.
- **Breadth** = how many same-level mobs you can take at once (pets, targets per spell, mez count, cleave count). This is where the power fantasy lives, and it grows every tier.
- **Zones keep fixed levels** (EverQuest style). Going back to an old zone and flattening it is the proof you got strong.

### Breadth ladder (target for every class, solo, quest-level gear)
| Level | Same-level mobs you can handle at once | Blue mobs (a few levels under you) |
| --- | --- | --- |
| 1–9 | 1 | 2 |
| 10 | 1–2 | 2–3 |
| 20 | 2–3 | 4 |
| 30 (launch cap) | 3–4 | 5–6 |
| 40 | 4–5 | 7–8 |
| 50 | 5–6 | a whole camp |

Gear sits on top of this: a well-geared player pushes one row higher. Breadth comes from **level and ranks** for everyone, so it fits rule 9; forks pick *how* you get it (Bone Pair vs Bone Knight), not *whether*.

### Each class has its own breadth stat
| Class | Breadth grows as | Level 50 picture |
| --- | --- | --- |
| Necromancer | standing skeletons | 5 skeletons, plus a burst army |
| Magician | pets + short summons | main pet + 2–3 swarm elementals |
| Wizard | area spells | pull a room, nuke it down |
| Enchanter | mez count | 4–5 mobs asleep while you kill one |
| Druid / Shaman | DoTs and slows on many | a field of rooted, rotting mobs |
| Bard | kite count | kite 6+ mobs on songs |
| Warrior / Paladin / SK | cleave + taunt count | hold a pack, cleave heals you |
| Cleric | area heals / undead burn | tank a pack by out-healing it |
| Rogue / Monk / Ranger | splits, traps, bursts | split a camp, kill fast one at a time |

## Necromancer theorycraft, 1 to 50
- **1–9:** one skeleton.
- **10 fork (approved):** Bone Pair (2 at ~60%) or Bone Knight (1 tough taunter).
- **Odd-level rank-ups:** skeletons get stronger, never more numerous.
- **20 major, Bone Lord:** +1 skeleton for everyone who picks it (Pair → 3, Knight → Knight + 1 squire). Plaguebringer and Blood Pact get breadth from DoTs and group support instead.
- **30 major, Army of Bones:** once a fight, every corpse nearby stands up for 15s (the "screen full of skeletons" moment).
- **35 / 40 (expansion):** new ability *Bone Legion*: standing cap 4.
- **50 major:** the "lord of the dead" pick: standing cap 5 and a bigger Army of Bones.
- **Rule:** more skeletons means each one is weaker. Total pet power follows the ladder; the count is what feels good (Diablo 2's maxed Raise Skeleton gives 8, "individually weak, strong in numbers").

## Guardrails for longevity (from the research)
1. **No zone or mob level scaling.** Oblivion's designer now calls its scaling a mistake; players said it made the world flat. ESO's version is popular for flexibility, but its main cost is that progression feels weaker. Fixed zones + grey mobs give no XP (EverQuest con colours) keeps old zones as stomping grounds without making them a leveling exploit.
2. **Keep numbers small and mostly additive.** Diablo 4 hit billions-to-trillions of damage by stacking multipliers from gear, aspects, paragon boards and glyphs; players found builds collapsed into hunting "[x]" stats. WoW has had to squish stats repeatedly (bosses even hit the game's health limit). For us: damage and health grow roughly in a straight line with level; at most two or three things multiply (e.g. crit, one gear stat). Forks and majors never add "+% all damage" (already rule 9).
3. **Spend the "exponential" on breadth, not numbers.** Five skeletons hitting for 40 feels huge and still reads cleanly on a phone; one skeleton hitting for 40,000 doesn't.
4. **Power comes in spikes.** Designers note flat-spike-flat feels better than a smooth curve. Our spikes: forks, majors, rank-ups. Majors at 30, 40 and 50 should each be a "big moment."
5. **Temporary armies are the clutter valve.** EverQuest swarm pets are fragile, pure damage, short-lived and sit beside your main pet. Path of Exile 2 limits permanent minions with a budget (Spirit), which pushes builds toward temporary ones. For us: permanent pets capped by level (1 → 5), big armies only as short bursts.
6. **Expansions: sideways first.** Guild Wars 2 players widely blame power creep, not elite specs themselves, for making older specs feel worse. When a new major arrives at 40/50, re-check old majors so nobody feels forced to swap.
7. **Past the cap: capped side progress.** EverQuest AAs were easier to build than levels and didn't unbalance the game; later EQ sped up AA gain for players with few AAs so newcomers catch up. Our capped side perks (run speed, sitting, pet looks, small power) follow the same idea.
8. **Let the game throw more at you.** Vampire Survivors keeps the "overpowered" feeling fun by escalating enemy counts so your power has targets. For us: later zones have bigger packs, links and social aggro, so breadth is used, not wasted.

## Dungeons: keep in mind (owner, Nov 19; not decided)
The owner is deciding how dungeons work. Idea: **difficulty tiers of the same dungeon**. A higher tier adds **more and bigger packs**, so:
- a solo player can rerun a dungeon they've outgrown at a higher tier and *see* they got stronger (the breadth ladder made visible), and
- groups get tiers with **extra-big, extra-strong packs** built for several players' breadth.
This fits the rule: tiers raise **pack size first**, mob strength second. Backlog card: "Solo vs group tuning, plus difficulty tiers" on the board.

## Clutter on a phone (later, but plan for it)
- Pets stay small (only a little bigger than now), follow in a tight formation, and share one health line in the party frame ("Skeletons 4/5").
- Floating text: pet hits are already small (v0.33); with 5 pets, merge their numbers into one per second.
- Groups (phase 3): option to fade other players' pets.

## What this asks of the sim
Add a **"how many can I take"** test: for each class at 10, 20 and 30, pull 1, 2, 3, 4... same-level mobs and find where it breaks. Target the breadth ladder above. Also test blue-con pulls.

## Sources
- Engadget, vertical vs horizontal progression: https://www.engadget.com/2014-02-05-mmo-mechanics-comparing-vertical-and-horizontal-progression.html
- MassivelyOP, horizontal progression and level scaling: https://massivelyop.com/2025/04/03/vague-patch-notes-whats-so-hopeless-about-horizontal-progression-in-mmos/ and https://massivelyop.com/2025/04/10/vague-patch-notes-the-problem-with-level-scaling-in-mmos
- GamesRadar, Oblivion scaling "was a mistake": https://gamesradar.com/games/the-elder-scrolls/as-oblivion-remastered-introduces-new-fans-to-bethesdas-iconic-2006-rpg-ex-elder-scrolls-dev-admits-the-level-scaling-system-was-a-mistake-eventually-fixed-in-skyrim
- OpenCritic on Oblivion auto-scaling: https://opencritic.com/news/16843/-totally-ruins-a-game-for-me-oblivion-remastered-has-made-people-remember-that-auto-scaling-is-actually-kind-of-bad
- ESO forums, getting weaker when leveling: https://forums.elderscrollsonline.com/en/discussion/comment/3722632/
- EverQuest AA history: https://mikeshea.net/loral/001139.html and https://www.everquest.com/news/imported-eq-enus-50943
- EQ con colours and XP: https://wiki.takp.info/index.php/Experience_Points
- EQ swarm pets: https://everquest.allakhazam.com/wiki/eq:Necromancer
- Diablo 2 Raise Skeleton: https://www.gamerguides.com/diablo-ii-resurrected/guide/characters/necromancer-builds/summonmancer and https://www.icy-veins.com/d2/summoner-necromancer-build-skills
- Last Epoch minion counts: https://steamcommunity.com/app/899770/discussions/0/6051221329347120874
- Path of Exile 2 Spirit: https://maxroll.gg/poe2/guides/spirit-guide
- Diablo 4 multipliers: https://www.pcgamer.com/games/rpg/dealing-trillions-of-damage-in-diablo-4-isnt-a-problem-worth-worrying-about-as-long-as-theres-something-that-makes-it-meaningful-game-director-says-i-know-a-lot-of-it-is-from-fear and https://us.forums.blizzard.com/en/d4/t/feedback-there-are-still-systems-level-problems-with-d4-and-21-doesnt-fix-them-suggestions-inside/208836
- WoW stat squish: https://warcraft.wiki.gg/wiki/Stat_squish and https://massivelyop.com/?p=507150
- Guild Wars 2 elite specs and power creep: https://en-forum.guildwars2.com/topic/17443-i-honestly-think-the-addition-of-elite-specs-to-the-game-was-a-design-mistake/
- Vampire Survivors escalation: https://www.pcgamer.com/great-moments-in-pc-gaming-reaching-the-dps-singularity-in-vampire-survivors
- Flat-spike power curves: https://discussions.unity.com/t/graphing-and-game-design/602886
- Linear DPS formula (Dungeon Siege 2): https://gamedeveloper.com/design/the-craft-of-game-systems-practical-examples

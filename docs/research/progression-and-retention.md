# Leveling, abilities and what keeps players coming back

Research for how fast levels and abilities should come, how a class kit keeps changing once it's complete, and what keeps MMO players around. Starts with **The plan so far** (owner, Nov 17; skill tree decided Nov 18), then the research behind it. Researched Nov 17, 2026; skill tree research added Nov 18.

## The plan so far
Owner, Nov 17: items 1–5 are leaning, not locked; revisit once real leveling times are known. Items 6–11 (the skill tree) were decided by the owner on Nov 18.

1. **Plan the game as levels 1–50, launch with a cap of 30.** Open 31–40 and 41–50 in expansions. Design ability rhythm and growth for 50 now so nothing has to be redone.
2. **Leveling time:** keep the early targets (level 10 in about 10 hours). Aim for **about 60–80 hours to level 30**: 2–3 months for a player with a job at about an hour a day. Hardcore players will always be faster; tune for the busy player.
3. **Never more than about 3 sessions without something new:** a level, an upgrade, a named drop or a step in an ability quest.
4. **Ability counts:** the core kit by about level 10 (classes have 7–8 now), then 3–4 more by level 30 (**about 10–12 total**), and about 3 more by 50 (**about 13–15**). Loadout stays at 8 slots, so a few abilities always sit on the bench, and that's the build.
5. **Merge instead of adding:** abilities that do a similar job become fork options on one button (see the Druid example below). Replaces design.md's "15–20 abilities by 30".
6. **Skill tree = forks (decided Nov 18).** No tree before level 10: players are still learning their kit. The **first fork at level 10 is the "first big step"**. One ability gets its **fork** (pick one of **two** versions) **every 2 levels up to 20 (10, 12, 14, 16, 18), then every 3 (23, 26, 29; then 33, 36, 39, 43, 46, 49)** (pacing decided by the owner Nov 24, option B: early levels stay exciting, later levels don't get overwhelming). Each ability gets one fork; utility like Gate or Circle Port may get none.
7. **Majors at 20 and 30** (40 and 50 in the expansions). A major is class-wide, has **three** options, and changes the class's signature mechanic. Level 20 = *how you play* (solo or group, pet or self); level 30 = *your big moment* (a flashy new effect or a once-a-fight power). By 30: **8 ability forks (10, 12, 14, 16, 18, 23, 26, 29) + 2 majors** (10 picks). By 50: about **14 forks + 4 majors**, so with one fork per ability, forks and abilities (13–15 by 50) run out together. Classes with short kits (Druid and Necro have 6 today) need their odd-level abilities built before then. Past 50: decide later (AAs were proposed).
8. **Levels without a fork:** new abilities, rank-ups, and the 7th and 8th loadout slots (15 and 25). Every level still brings something.
9. **Power comes from your level, not your picks.** Both sides of a fork are a bit stronger than the base ability and about equal to each other; they differ by situation (solo vs group, one mob vs many). Mobs are tuned assuming "has a fork at this level", whichever side. Abilities still grow a little every level on their own. No "+5%" options. Sim each side (solo, group, boss); if one wins everywhere, redesign it.
10. **Swapping is free in town.** Until Town 1 exists: you pick at the ding (a "pick your new toy" card), then swap for free at any campfire (owner, Nov 19).
11. **No skill points;** forks replace the old stat points, and stats come from gear.
12. **Scaling rule (owner, Nov 19): breadth grows, depth stays flat, zones fixed.** What grows with level is how many mobs you can take at once (about 1–2 at 10, 3–4 at 30, 5–6 at 50), not how fast one dies. Forks pick *how* you get breadth. Details: `power-scaling.md`.

### Example: Druid, 18 abilities folded into 11
- **Kept as abilities:** Thornlash, Mending Touch, Creeping Rot, Tanglefoot, Rootgrip, Barkskin, Thorn Aura (the core 7), plus Stormcall, Mending Rain, Wolf Form and Circle Port (quest).
- **Became fork options:** Mending Touch (Cleanse *or* Wild Regrowth heal over time), Creeping Rot (Sap Strength), Wolf Form (Pack Run for the group), Rootgrip (Briar Wall, roots an area). Nature's Sight becomes a passive. Heart of the Grove becomes a level 30 major option.

### Necromancer level 10 fork: Raise Bones (approved Nov 19)
- **Bone Pair:** one cast raises two skeletons, each about 60% of today's health and damage (a bit stronger together). The second skeleton picks up any extra mob that hits you, so each holds its own mob. Weaker on Boss 1 and Gnawbone (they die one at a time; Mend Bones heals one). For camps and big pulls.
- **Bone Knight:** one skeleton with about 150% health, more armor and about the same damage (tuned v0.39). **Taunts every 8s**, pulling back any mob that turned on you, so sitting mid-fight is safer. With two mobs one still comes for you unless you Dread it. For long single fights and named.
- **Sim check:** both in a single fight, a pack and a long named fight at levels 10–15 (not tuned to one boss), with DPS tracked. Target: Bone Pair wins packs, Bone Knight wins long named fights; if either wins everywhere, redesign. Watch for exploits (taunt stacking, two pets splitting threat oddly).

### Level 10 forks, the other 13 classes (approved Nov 19)
Owner notes (Nov 19): **forks are for the rest of the character's life, so judge them on longevity (packs, long named fights, groups later), never on one boss**; no fork option that only works on undead (too narrow); escape options are fine for some classes, but death here is cheap, so a pure escape rarely gets picked; give it a second use.
- **Druid · Tanglefoot:** *Thornsnare* (snared mob takes thorn damage while it walks) / *Tangle Field* (weaker snare on every mob near the target).
- **Warrior · Shield Bash:** *Shield Slam* (longer stun, always breaks a cast) / *Shield Sweep* (shorter stun on every mob in front).
- **Rogue · Evade:** *Ambush* (Evade stuns 2s and the next Backstab crits) / *Feint* (Evade also dazes every mob around you for 2s, so a Rogue can handle two).
- **Cleric · Renew:** *Warding Renew* (also blocks the next big hit) / *Radiant Renew* (each tick burns any mob near you, extra on undead).
- **Enchanter · Mesmerize:** *Deep Sleep* (one mob, much longer, first hit doesn't wake it) / *Mass Mez* (up to 3 mobs, shorter).
- **Paladin · Consecrate:** *Sanctuary* (smaller circle, stronger heal, less damage taken inside) / *Wide Consecrate* (bigger circle, burns any mob, weaker).
- **Shadow Knight · Dark Cleave:** *Reaping Cleave* (heals more per mob, needs 2+) / *Rending Blow* (one big hit, solid heal).
- **Wizard · Shatter:** *Deep Shatter* (bigger single hit) / *Shatter Burst* (splashes and chills nearby mobs).
- **Magician · Detonate:** *Volatile* (bigger blast) / *Rebirth* (smaller blast, next summon instant and free).
- **Ranger · Spike Trap:** *Barbed Trap* (bigger hit and long bleed on one) / *Blast Trap* (hits and knocks back everything nearby).
- **Monk · Feign Death:** *Perfect Split* (target stunned 2s when you stand) / *Still Water* (you regenerate fast while feigned, a mid-fight rest).
- **Shaman · Drowsy:** *Torpor* (stronger attack slow on one) / *Drowsy Cloud* (weaker slow on every mob near the target).
- **Bard · Crescendo:** *Finale* (bigger pulse, songs end) / *Encore* (smaller pulse, songs keep playing).

**Built (v0.39, Nov 19):** all 14 level 10 forks are in the game (Menu → Skills; pick at the ding, swap at any campfire). Numbers tuned once after the sim (Bone Knight damage up, Thornsnare thorns halved, Tangle Field wider and longer, Volatile 120%, Rebirth's blast 90%). Results and redesign candidates (Bone Pair vs Bone Knight, Thornsnare vs Tangle Field, Volatile vs Rebirth) in `docs/sim-results.md`.

### Level 12 forks, all 14 classes (approved Nov 19)
Same rules as level 10: both sides a bit stronger than the base, about equal, different by situation (one mob vs many, solo vs group later). Picked a different ability from the level 10 fork for each class, and mixed templates so level 10 and 12 don't feel like the same choice twice.
- **Necromancer · Siphon Plague:** *Leaping Plague* (when its mob dies, the rest of the plague jumps to the nearest mob) / *Twin Plague* (stacks twice on one mob).
- **Druid · Creeping Rot:** *Sap Strength* (rotting mob hits about 15% softer) / *Blight Spores* (rot also lands on up to 2 mobs near the target, weaker).
- **Warrior · Cleave:** *Whirlwind* (hits every mob around you, not just in front, with extra threat on each) / *Sunder* (heavy hit on your target that cracks its armor for 10s; mobs beside it take a light hit).
- **Rogue · Gouge:** *Blind* (much longer, but breaks on damage: park a second mob out of the fight) / *Kidney Shot* (shorter stun, shorter cooldown, and your next 2 hits count as from behind).
- **Cleric · Holy Light:** *Judgment* (bigger hit, and the target deals less damage for 6s) / *Holy Nova* (light bursts around you, hitting every mob near you and healing you a little per mob hit).
- **Enchanter · Charm:** *Lasting Charm* (lasts much longer and breaks less) / *Thrall* (normal length, but when it ends the mob falls asleep for 6s instead of turning on you).
- **Paladin · Taunt:** *Challenge* (taunts every mob near you) / *Rebuke* (one mob, and it deals 20% less damage for 8s).
- **Shadow Knight · Disease Cloud:** *Plague Cloud* (spreads to mobs near the target) / *Withering Cloud* (one mob, it hits softer and your Siphon heals more off it).
- **Wizard · Frost Nova:** *Deep Freeze* (roots twice as long, less damage: sets up a kite) / *Nova Blast* (more damage and knocks mobs back, short root).
- **Magician · Burnout:** *Overdrive* (pet attacks much faster for a shorter time, and loses a little health each second) / *Wildfire* (same speed as now, but the pet's hits splash onto mobs near it).
- **Ranger · Volley:** *Rain of Arrows* (wider and longer, lighter hits) / *Pinning Volley* (same size, every mob hit is rooted 3s: damage plus a getaway).
- **Monk · Flurry:** *Hundred Fists* (more punches on one mob) / *Whirling Flurry* (punches spread across every mob around you).
- **Shaman · Swarm:** *Locust Swarm* (when its mob dies, it jumps to the nearest mob) / *Stinging Swarm* (one mob, and it counts as two DoTs for the Shaman's stacking bonus).
- **Bard · Chant of Blades:** *Bladesong* (your swings also hit one mob next to your target) / *Battle Tempo* (swing speed keeps building through a long fight, up to double).
- **Sim check (when built):** each side in a single fight, a pack and a long named fight at levels 12–15, DPS tracked; if one side wins everywhere, redesign. Watch for: Leaping Plague / Locust Swarm chaining forever through a big pull, Thrall chain-sleeping, Whirlwind threat with Challenge-style tanks in groups later.

**Built (v0.44, Nov 19):** all 14 level 12 forks are in the game; reach them with `?level=12` or DEV until the cap passes 10. Small changes while building: Twin Plague's copies are about 65% each (two stacked is a bit over one full-strength plague), Holy Nova heals a little per mob hit like Dark Cleave, Thrall's mob wanders home after its 6s sleep.

### Level 14 forks, all 14 classes (approved Nov 19)
Same rules again. Each class forks an ability that had no fork yet, and classes that already had "one mob vs many" at 10 or 12 get a different kind of choice here (tank vs hit back, offense vs sustain, burst vs over time, you vs your pet).
- **Necromancer · Lifetap:** *Bone Tap* (also heals your skeleton for half) / *Twin Tap* (also hits a second mob for half).
- **Druid · Mending Touch:** *Wild Regrowth* (instant heal over 8s, cast while kiting) / *Verdant Touch* (slower cast, bigger heal; overheal becomes a short shield).
- **Warrior · Defensive Stance:** *Iron Stance* (longer, blocks much more, you hit softer) / *Retaliation* (shorter, every blocked hit strikes back).
- **Rogue · Rend:** *Garrote* (from Hide: stops casters casting 3s and bleeds double) / *Lacerate* (stacks up to 3 times for long fights).
- **Cleric · Divine Aura:** *Divine Shelter* (heals you over time while immune) / *Divine Wrath* (blasts every mob near you when it ends).
- **Enchanter · Slow Mind:** *Deep Slow* (stronger, and slowed mobs take more from Mind Rot) / *Mind Drain* (normal slow, you regain mana while it lasts).
- **Paladin · Divine Strike:** *Crusader Strike* (one heavy hit, heals you for 30% of the damage) / *Divine Storm* (wider circle all around you, lighter hits).
- **Shadow Knight · Raise Minion:** *Ghoul* (tougher, holds one mob) / *Wraith* (fragile, its hits heal you).
- **Wizard · Fireball:** *Pyroblast* (longer cast, huge hit) / *Living Bomb* (fast cast, burns over time, then explodes onto nearby mobs).
- **Magician · Flame Shield:** *Inferno Shield* (stronger shield on you) / *Shared Flames* (goes on your pet, so mobs hitting the pet burn).
- **Ranger · Disengage:** *Recoil Shot* (hop back and fire a free shot that snares) / *Double Hop* (two hops stored, for long kites).
- **Monk · Flying Kick:** *Tiger Leap* (cooldown resets if the leaped-at mob dies) / *Crane Kick* (landing stuns every mob near you 1.5s).
- **Shaman · Venom Totem:** *Toxic Totem* (stronger poison on every mob near it) / *Mending Totem* (heals you while you stand near it; poisons one mob).
- **Bard · Dirge:** *Dirge of Ruin* (damage builds the longer a mob stays near you) / *Requiem* (weaker, each mob it kills heals you).
**Built (v0.44, Nov 19):** all 14 level 14 forks are in the game (`?level=14`). Lacerate's copies are about 75% each; Living Bomb burns 9s then explodes in a small circle; Double Hop keeps a second hop in store (0.6s between hops); Shared Flames falls back to you when no pet is out.

### Level 16 forks, all 14 classes (approved Nov 24, as drafted)
Same rules. Each class forks an ability with no fork yet; this round leans on **offense vs defense** and **solo vs group later**, since 10–14 already did a lot of one mob vs many.
- **Necromancer · Dread:** *Mass Dread* (fears every mob near you, shorter) / *Dread Rot* (one mob; your DoTs hit it 30% harder while it's feared).
- **Druid · Rootgrip:** *Briar Wall* (roots every mob in an area) / *Strangling Roots* (one mob, longer root, takes damage while held).
- **Warrior · Hamstring:** *Crippling Strike* (snared mob also attacks 20% slower) / *Hamstring Bleed* (snared mob bleeds; the bleed grows while it moves).
- **Rogue · Hide:** *Vanish* (Hide mid-fight on a long cooldown: every mob loses you, and a Backstab within 4s counts as from Hide) / *Stalk* (full speed while hidden; your opener stuns 2s).
- **Cleric · Greater Heal:** *Flash Heal* (1s cast, about 70% size) / *Blessed Heal* (full size, plus a short Renew on you and anyone nearby).
- **Enchanter · Animate Blade:** *Blade Pair* (two weaker swords) / *Runeblade* (one tougher sword that lasts until it dies and can hold a mob briefly).
- **Paladin · Holy Bash:** *Hammer of Justice* (thrown from range, longer stun, always breaks a cast) / *Bash of Light* (normal stun, heals you for a chunk).
- **Shadow Knight · Terror:** *Mass Terror* (fears every mob near you, short) / *Death Grip* (yanks one mob to you and taunts it: a pull, or a tank tool in groups).
- **Wizard · Blink:** *Frost Blink* (leaves an icy patch that roots the first mob to cross it) / *Arcane Blink* (your next spell after Blink is instant).
- **Magician · Mend Elemental:** *Rejuvenate* (heals your pet over time and you a little) / *Empowering Mend* (normal heal; the pet's next 5 hits are stronger).
- **Ranger · Rapid Fire:** *Barrage* (shots pierce through to mobs behind the target) / *Focused Fire* (lasts twice as long; each shot on the marked mob raises the Mark bonus).
- **Monk · Deflect:** *Riposte* (every dodged hit strikes back) / *Iron Body* (lasts longer and also dodges spells and arrows).
- **Shaman · Cannibalize:** *Ancestral Gift* (mana over time for you and anyone nearby) / *Blood Rite* (instant mana; your next DoT ticks 30% harder).
- **Bard · Discord:** *Dissonance* (mobs near you take 15% more from your songs) / *Soothing Discord* (stronger slow, 30%, for packs).
- **Sim check (when built):** single fight, pack and long named fight at levels 16–18, DPS tracked. Watch for: Vanish resets, Death Grip pulling a pack apart one by one, Riposte with Deflect uptime, Blood Rite letting a Shaman skip sitting.

### Level 18 forks, all 14 classes (approved Nov 24, with three swaps)
Same rules; each class forks an ability with no fork yet. The owner swapped three "same but bigger" sides (Ironbark, Arcane Ward, Soul Bond) for ones that play differently, per the no-"+%" rule. After this, Druid and Necro have one unforked ability left (Thornlash; Feign Death), so their odd-level abilities (or Pet forks for the Necro) are needed before 23.
- **Necromancer · Mend Bones:** *Bone Splint* (heals your skeleton over time, cheap, works while you sit) / *Ossify* (instant big heal, and the skeleton takes 30% less damage for 6s).
- **Druid · Barkskin:** *Ironbark* (short burst that halves the damage you take, long cooldown: an emergency button) / *Thornbark* (normal strength; mobs that hit you take thorn damage).
- **Warrior · Throw Stone:** *Heavy Stone* (stuns 1.5s and breaks a cast, from range) / *Taunting Throw* (lighter hit that bounces to up to 3 mobs with big threat: pull a pack onto you).
- **Rogue · Throwing Knife:** *Crippling Knife* (snares, so a split mob can't run back; cleaner pulls) / *Fan of Knives* (light hit on every mob in front: a finisher for a hurt pack).
- **Cleric · Daze:** *Concussion* (longer stun; the mob hits softer for 6s after) / *Hammer Toss* (short stun thrown from range: stop a caster or a runner).
- **Enchanter · Phantasm:** *Mirror Images* (two copies, mobs split between them, shorter) / *Lingering Phantasm* (one copy, lasts longer, and mezzes mobs near it for 3s when it ends).
- **Paladin · Mend:** *Swift Mend* (instant, smaller) / *Martyr's Mend* (bigger, also heals anyone near you).
- **Shadow Knight · Harm Touch:** *Blood Price* (bigger hit, costs 30% health, heals back half the damage over 6s) / *Harm Wave* (hits every mob in front for less, same cost).
- **Wizard · Mana Shield:** *Arcane Ward* (while the shield is up, hits can't push back or break your casts) / *Mana Burst* (when it ends, blasts mobs near you based on what it soaked).
- **Magician · Elemental Link:** *Soul Bond* (while linked, your pet's hits give you mana) / *Shared Pain* (the pet takes less for you, but hits harder for everything it soaks).
- **Ranger · Ensnaring Shot:** *Crippling Shot* (stronger, longer snare) / *Scatter Shot* (lighter snare on every mob near the target).
- **Monk · Dragon Strike:** *Dragon Fang* (bigger hit, no knockback, stuns 1s) / *Dragon Wave* (lighter hit that knocks back every mob in front).
- **Shaman · Sicken:** *Virulent Sicken* (lasts much longer for less mana: long fights) / *Spreading Sickness* (recasting it also lands it on one more mob nearby).
- **Bard · Song of Mending:** *Battle Hymn* (heals more while you're hitting something) / *Chorus* (normal heal, plus a small shield on you and anyone nearby each pulse).
- **Sim check (when built):** same as level 16. Watch for: Taunting Throw dragging huge pulls, Mana Burst plus Mana Shield uptime, Soul Bond letting a Magician skip sitting, Bone Splint making the Necro pet unkillable, Spreading Sickness with Shaman DoT stacking.

### Example: Necromancer (draft)
- **Forks:** Raise Bones (10): *Bone Pair* (two weaker skeletons) or *Bone Knight* (one tougher, taunts; two pets need a threat check in the sim). Siphon Plague (12): jumps to a new mob when its target dies, or stacks twice on one mob. Lifetap (14): also heals your skeleton, or hits a second mob for half. Dread (16): fears everything near you, or feared mobs take extra DoT damage.
- **Major at 20, "what kind of necro":** *Bone Lord* (skeletons cleave, the main one taunts: solo pet build) / *Plaguebringer* (DoTs spread to every mob near your target: group pulls) / *Blood Pact* (lifetaps heal your group a little: group support).
- **Major at 30, "signature moment":** *Army of Bones* (once a fight, raise every corpse nearby for 15s) / *Lichform* (20s of free spells and double lifetaps) / *Death's Door* (the first killing blow each fight drops you into Feign Death at 30% health instead).

### Keeping the work manageable
- Forks use shared templates stored as data (two weaker pets vs one tougher, spreads vs stacks, longer vs area, instant vs over time), each with its own class flavor; only a few per class need custom work.
- Launch six by 30: 6 × (9 forks + 2 majors) = 66 picks (about 140 options), versus about 180 upgrades in the old 30-per-class tree. Build the launch six first.

### Past the cap
- Each expansion: one or two new abilities (each with its fork) and a new major (40, 50).
- At max level: capped side perks (run speed, faster sitting, longer pulls, pet looks, small power) so new players can catch up, plus collections (journal, named-drop log, cosmetics), harder dungeon tiers and raids. 14 classes and an account-wide bank make alts a long goal of their own.

## The short version of the research
1. **No empty dings.** A level that only adds stats feels like padding, because mobs scale at the same rate.
2. **Full core kit early, then the kit changes instead of growing.**
3. **Fewer new buttons, more upgrades,** which also fits the 8-button phone limit.
4. **Upgrades should change how an ability plays,** and big milestones can offer a pick-one choice.
5. **Something new every 3–5 sessions** (mobile guideline for 20-minute sessions).
6. **Past the cap:** raise it with expansions and add capped side progression (like EverQuest's AAs).
7. **Retention:** players early in the game stay for achievement; at max level they stay for other people. Never punish skipping a day.

## Skill tree research (Nov 18)
- **Scarcity makes a choice real.** If every node can eventually be unlocked, the tree is just an order of operations and everyone ends the same. Fun = scarcity plus options that change how you play.
- **Mists of Pandaria (WoW):** one pick of three every 15 levels (6 total). Fewer talents, but each could change gameplay much more; "at worst a talent is only right situationally." The catch: once points stopped coming every level, there was little to look forward to at the next level, which is why Dragonflight brought point trees back. Lesson: the levels between picks need their own rewards (our odd levels).
- **Guild Wars 2:** each tier offers three major traits and you take one; free swaps out of combat; stat boosts were removed from traits.
- **Diablo 4:** criticised for low-risk +damage and +defense passives (easier to balance, boring). The expansion rework removed passives from the tree so it only changes how active skills behave.
- **Diablo 3 runes:** one change per skill, picked from several. The lead designer's regret: a newly unlocked rune often goes untried because players are happy with what they have. Lesson: present a fork as "pick your new toy" at the moment it arrives.
- **ESO morphs and Last Epoch skill trees:** the same skill playing very differently is what players remember (Last Epoch's "big boy skeletons"). Last Epoch also shows the cost: once skill trees hold the fun, passive trees shrink to % boosts.

## What other games do

### How often new abilities arrive
| Game | Pattern | Lesson |
| --- | --- | --- |
| WoW Classic | Something at the trainer on 30 of 60 levels: level 1, then every even level from 4 to 60 (Mage: 56 abilities). No new abilities after 50 in Season of Discovery, only ranks | A steady drip feels good, but many visits only give a bigger number |
| EverQuest | Big batches of spells every 4–5 levels | Players say they'd rather have one thing each level than 10 at once |
| Guild Wars | Level cap 20 came fast; real progression was collecting skills after the cap | Levels can be a short step toward the real build game |
| WoW (later) | Cut many abilities ("pruning") because classes had too many buttons; players split on it | The problem was abilities that did the same job, not complexity itself |
| WoW talents | Players call "+5/10%" talents boring, and some talents are so strong everyone feels forced to take them | Upgrades should change behavior; must-haves should be baseline |

Leveling feels too fast when abilities arrive faster than you can learn them or find a use for them. It feels empty when a level brings nothing new.

### How kits keep changing once complete
- **Final Fantasy XIV traits:** passive unlocks that upgrade an existing ability on the same button. They raise its power, cut its cooldown, turn it into a stronger tier (Glare becomes Glare III) or change how it plays (an extra charge).
- **Elder Scrolls Online morphs:** once you've used a skill enough, you pick one of two upgraded versions, each adding a different effect. The choice sticks unless you pay to respec.
- **Ours already:** abilities grow a little every level, cooldowns shrink, and rank upgrades replace old versions (Thornlash II at 12).

### How long leveling takes
- Classic WoW: about 10–12 days of play time to level 60 on average (240–290 hours). At 10 hours a week, that's about 5.5 months.
- Mobile guideline: with 20-minute sessions, players need a meaningful unlock every 3–5 sessions.

## What keeps players coming back
- **Achievement early, friends later.** A study of 51,104 players in an online game found achievement features predicted who stayed in early and middle levels. At max level, the number of friends predicted it best.
- **Raph Koster's ten retention drivers:** steady new content, character investment, building in the world, social ties, trading, deep systems, PvP, player creations, story, emergent play. Steady content is the most expensive, and missed updates lose players. Social ties are among the most powerful. Deep systems keep a game fresh indefinitely but are hard to build.
- **Old School RuneScape (record player counts, 2025):** no daily or weekly rewards that pressure logins ("equality of time": a five-minute session and an hour are equally worthwhile). Goals interlock instead of resetting, achievements are permanent, and older content stays useful because new gear is built from it.
- **EverQuest AAs:** added near the level cap so players could keep advancing. Veterans warn that EQ2's AAs drifted from side options into required power, which made it harder for new players.
- **Mobile benchmarks (players still playing after 1 / 7 / 30 days):** RPG average about 30% / 10% / 3.5%. Good is about 35–40% / 18–22% / 8–10%. Useful for the closed-alpha gate ("testers return weekly").

## Sources
- MassivelyOP, "When leveling too quickly becomes a problem": https://massivelyop.com/2024/09/26/vague-patch-notes-when-leveling-too-quickly-becomes-a-problem-in-mmorpgs/
- Pantheon forums on ability pacing: https://seforums.pantheonmmo.com/content/forums/topic/10952/how-long-until-ability-2/view/page/2
- WoW Forever Mage abilities by level: https://conquestcapped.com/guides/wow-forever/wow-forever-mage-abilities/
- Season of Discovery Druid: https://warcrafttavern.com/wow-classic/guides/season-of-discovery-sod-druid-abilities-talents
- Blizzard Watch on pruning and talents: https://blizzardwatch.com/2018/04/11/patreon-blizzard-back-pruning-battle-azeroth/ and https://blizzardwatch.com/2022/07/12/talent-trees-base-class/
- FFXIV traits: https://www.gamerguides.com/final-fantasy-xiv-endwalker/guide/melee-dps/reaper/all-reaper-traits-to-level-90
- ESO skills and morphs: https://en.m.uesp.net/wiki/ESO:Skills
- Classic WoW time to 60: https://warcrafttavern.com/wow-classic/guides/how-long-to-60 and https://www.wowhead.com/classic/cn/guide/classic-wow-leveling-basics-tips-and-tricks
- Session unlock pacing: https://abratabia.com/game-economy/player-progression.php
- "Achievement and Friends" retention study: https://arxiv.org/abs/1702.08005v1
- Raph Koster, "What drives retention": https://www.raphkoster.com/?p=33564
- OSRS interview: https://www.gamesradar.com/games/mmo/how-did-the-most-timeless-mmo-hit-a-new-peak-of-240-000-players-12-years-after-launch-protecting-peoples-achievements-and-progression-while-preventing-fomo
- EverQuest AAs: https://en.wikibooks.org/wiki/EverQuest/AA_info and https://seforums.pantheonmmo.com/content/forums/topic/11097/player-progression-you-better-add-aa-system
- Mobile retention benchmarks: https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies and https://appagent.com/?p=61637
- Skill tree scarcity: https://bugnet.io/blog/how-to-design-a-skill-tree-thats-fun-to-plan
- Mists of Pandaria talents: https://classic.wowhead.com/guide=5.0&talents and https://www.pcgamer.com/mists-of-pandaria-will-fix-talents-once-and-for-all-say-blizzard
- Dragonflight bringing points back: https://www.laptopmag.com/features/wow-dragonflight-game-director-ion-hazzikostas-discusses-new-talent-trees-and-the-fate-of-covenant-abilities
- Guild Wars 2 traits: https://wiki.guildwars2.com/wiki/Trait and https://www.dualshockers.com/arenanet-shares-specialization-details-and-images-from-guild-wars-2-heart-of-thorns-expansion/
- Diablo 4 tree criticism and rework: https://us.forums.blizzard.com/en/d4/t/diablo-4-most-shallow-arpg-ever-created/11134 and https://wp-prod.icy-veins.com/?p=131327
- Diablo 3 runes, Wyatt Cheng's regret: https://www.wowhead.com/classic/pt/news/디아블로-iii-개발에-대한-와이엇-쳉-q-a-지옥불-난이도-현금-경매장-등-327085
- Last Epoch skill trees: https://www.goonhammer.com/the-last-epoch-an-arpg-that-cares-how-skilled-you-are and https://forum.lastepoch.com/t/beta-feedback-and-impressions-after-30-hours/14166/7

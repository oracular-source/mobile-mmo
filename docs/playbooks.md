# Class playbooks (draft)

How each class is meant to be played solo, written as rules: **when X, do Y.** The testing-grounds sim will follow these so its balance numbers match real play. Rules are in priority order: the sim checks from the top and does the first one that fits.

**Status:** Druid, Warrior, Necromancer and Rogue are on their second draft (owner's answers in). Batch 1 (Cleric, Enchanter, Paladin, Shadow Knight, Wizard) is on its second draft (owner's answers and signature twists in), Nov 17. Nothing in the game uses this yet.

Things all classes share (from the game rules today):
- You run at 34. Mobs run 24–31, so you can outrun most of them, but not by much. A snare halves their speed; a root stops them.
- Mobs don't leash: once they chase you, they chase until someone dies.
- Sitting regenerates mana 4x and health about 4x faster (doubled again by the campfire). Getting hit while sitting does +25% damage and stands you up.
- "Low health" below means about 35%; "low mana" means about 20%.

---

## Druid: the kiter
**Idea:** never let the mob touch you. Slow it, rot it, and nuke it while backing away.

**Pull:** Creeping Rot from max range, then Tanglefoot (snare) as it comes in.

**Levels 1–2** (only Thornlash and Mend): stand and fight. Thornlash until it dies; Mend if health gets low.

**Fight, level 3 and up, in order:**
1. Health low → back off and cast Mending Touch once you have room (it takes 1.2s standing still).
2. The mob is close and not snared → Tanglefoot. If Tanglefoot is on cooldown, Rootgrip (level 6) and step away.
3. Rot not on the target → Creeping Rot.
4. The mob is within melee range → walk away from it (kite) rather than stand and cast.
5. Otherwise → Thornlash.

**Two or more mobs:** Root the second one (level 6) and fight the first. Rot both if mana allows. Below level 6, kite both with snares and rot.

**Before a hard fight:** Barkskin (level 8).

**Between fights:** sit until mana is about 80% (by the fire if close).

---

## Warrior: the anvil
**Idea:** stand in it, use cooldowns well, and pull one mob at a time.

**Pull:** Throw Stone, then wait for the mob to come to you.

**Fight, in order:**
1. Health low and Defensive Stance ready (level 6) → Defensive Stance.
2. Health low and nothing hitting you → Bandage (2s cast; a hit interrupts it).
3. The mob is trying to run (low health) → Hamstring.
4. Shield Bash ready → Shield Bash.
5. Two or more mobs next to you and Cleave ready (level 8) → Cleave.
6. Otherwise → Strike.

**Losing the fight:** keep fighting. In the sim a Warrior never runs; if it dies, that counts as a death in the results.

**Between fights:** sit until health is about 80%. Warriors have no mana, so downtime is health only.

---

## Necromancer: the juggler
**Idea:** the pet tanks, the plague does the damage, and you control who's hitting what. Sits a lot.

**Before pulling:** no pet → Raise Bones (3s cast). Pet hurt → Mend Bones (level 8) or sit.

**Pull:** Siphon Plague on the target, so the pet picks it up.

**Fight, in order:**
1. Health very low and Feign Death ready (level 6) → Feign Death. Mobs forget you and the pet keeps fighting.
2. Two or more mobs → Dread the one with the **most health** and fight the weaker one. When the Dread wears off and that mob starts walking back toward you, Dread it again.
3. Plague not on a mob you're fighting → Siphon Plague (spread it to every mob in the fight).
4. Pet below half health (level 8) → Mend Bones.
5. Health below about 70% → Lifetap (heals you).
6. Nothing is attacking you and the pet is tanking → **sit** for mana right away, while the plague and pet work. Stand when something turns on you.
7. Otherwise → Lifetap.

**Losing the pet mid-fight:** Dread the mob, back off, and recast Raise Bones if there's time. If not, Feign Death.

**Between fights:** sit until mana is about 80%.

---

## Rogue: the ambusher
**Idea:** open from Hide for a big Backstab, then keep the mob stunned or confused so you can Backstab again.

**Pull:** Hide, sneak up, and open with Backstab (triple damage, can't miss). Throwing Knife only to split one mob off a group.

**Fight, in order:**
1. Evade (level 5): two versions, both tested by the sim (see "Rogue: Evade, tested both ways" at the bottom).
2. Mob stunned or Evaded and Backstab ready → Backstab (double or triple damage from any side).
3. Gouge ready → Gouge (stun), then Backstab.
4. Rend not on the target → Rend.
5. Otherwise → Stab.

**Getting around:** Sprint (level 7) to get to a fight, get out of one, or cross a cleared area. It works in dungeons too.

**Two or more mobs:** avoid. Evade + Hide to drop them and come back one at a time.

**Between fights:** sit until health is about 80%, then Hide before the next pull.

---

## Batch 1 (draft, Nov 17): Cleric, Enchanter, Paladin, Shadow Knight, Wizard
Built together with the default skin (one shared body, told apart by color and weapon). Each class gets its abilities from level 1 to 8, a rough kit and a playbook. Numbers come later from the sim.

**Owner's direction (Nov 17):** flavor first, balance later. No class should feel like "a wizard with a different color." Each one gets a **signature twist** that changes how you play, not just bigger numbers. Only the Wizard is the bolt class.

New rules this batch needs (everything else reuses what the game already has):
- **Undead tag on mobs.** Skeletons and Boss 1 are undead; rats and beetles aren't. Cleric and Paladin hit undead harder.
- **Heal over time:** a heal that ticks, like a DoT in reverse.
- **Mez:** the mob falls asleep until anything hits it, then wakes up angry.
- **Charm:** a mob fights for you for a while, then breaks free and **always attacks you** (high risk, high reward).
- **Holy ground and holy pulses:** an area on the floor that does something to whoever stands in it (Paladin), and heals that also burn nearby undead (Cleric).
- **Spend health as a cost** (Shadow Knight).
- **Chill and Shatter:** Frost Bolt stacks a slow; Shatter does huge damage to a frozen (rooted) mob and breaks the freeze (Wizard).
- **Area nuke:** hits every mob around you (Wizard). Cleave already does this for melee.
- **Small pets:** a smaller Necro skeleton for the Shadow Knight, a floating sword for the Enchanter, and a decoy copy of yourself (Enchanter).
- **Smaller ones:** taunt, short jumps and teleports (Blink, Gate), a can't-be-hurt bubble (Divine Aura), and damage hitting mana first (Mana Shield).

### Cleric: the slow grind (pure healer)
**Idea:** hit things with a hammer and refuse to die. Kills are slow, but deaths almost never happen. The anchor at the bottom of the solo chart.
**Twist: healing burns the dead.** Every heal you cast also sends a pulse of holy damage into undead standing near you. In the crypt, healing yourself *is* your damage, so a Cleric there fights by healing through hits instead of swinging.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Smite | melee | Hammer swing (main attack) |
| 1 | Minor Heal | heal | Medium heal, 1.5s cast |
| 2 | Renew | heal over time | Heals a bit every second for 12s |
| 3 | Holy Light | nuke | Small ranged nuke, double vs undead (pull) |
| 4 | Daze | stun | Short stun with the hammer |
| 5 | Turn Undead | fear | Undead flee; doesn't work on anything else |
| 6 | Greater Heal | heal | Big heal, 2.5s cast, costs a lot of mana |
| 8 | Divine Aura | buff | Can't be hurt for 4s (can't attack either), long cooldown |

**Pull:** Holy Light, then wait for the mob to come.
**Fight, in order:**
1. Health very low and Divine Aura ready (level 8) → Divine Aura, then Greater Heal inside it.
2. Health low → Greater Heal (level 6), else Minor Heal.
3. Renew not running and you're taking hits → Renew.
4. Two mobs and one is undead → Turn Undead on it, fight the other.
5. Daze ready → Daze.
6. Otherwise → Smite.
**Against undead:** heal on cooldown even when not hurt badly; every heal is also an attack.
**Between fights:** sit until mana is about 80%.

### Enchanter: the controller
**Idea:** never fight two things at once, and never do your own damage. Put extras to sleep, slow the one you're fighting, and let something else hit it.
**Twist: borrowed muscle.** No bolts. Your damage comes from a floating sword, a damage-over-time spell, and later a charmed mob. Charm is the high-risk payoff: a borrowed mob hits hard, but when it breaks free it always comes for you.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Mind Rot | dot | Damage over time (main attack) |
| 1 | Mesmerize | mez | Puts a mob to sleep until it's hit, up to ~20s |
| 2 | Animate Blade | pet | A floating sword fights for you for 2 minutes (weak, doesn't tank long) |
| 3 | Slow Mind | snare | Mob moves **and attacks** slower |
| 4 | Clarity | buff | Faster mana regen for you (lasts until you die) |
| 5 | Charm | charm | A mob fights for you for 20–40s, then breaks free and attacks you |
| 6 | Color Flash | stun | Stuns every mob near you (escape button) |
| 8 | Phantasm | pet | A see-through copy of you appears; mobs attack it for a few seconds |

**Before pulling:** Clarity if it isn't on. Animate Blade up (level 2).
**Pull:** Mind Rot on one mob. If more than one comes, Mesmerize every extra one right away.
**Fight, in order:**
1. A mob not currently fought is awake and coming at you → Mesmerize it.
2. Health low and two or more on you → Color Flash, back off, Mesmerize. Level 8: Phantasm first.
3. Level 5+, a mob your level or lower is asleep or free and Charm ready → Charm it and send it at the target. **When the charm is about to break** (the bar runs low) → Mesmerize your pet the moment it turns, then kill it or walk away.
4. Slow Mind not on the target → Slow Mind.
5. Mind Rot not on the target → Mind Rot.
6. Blade expired and nothing on you → Animate Blade.
7. Otherwise → stand back and let the pets work (sit if nothing is hitting you).
**Between fights:** sit until mana is about 80%.
**Touch control for mez (to design in the build):** idea: tap a mob, then the Mez button; sleeping mobs show "Zz" and a small timer so you know when to re-mez.

### Paladin: the holy anvil
**Idea:** a Warrior that trades some toughness for heals and stuns. Very strong in the crypt (undead).
**Twist: hold the line.** Consecrate lays holy ground under you. Standing in it heals you slowly and burns undead that step in. The Warrior walks to the mob; the Paladin makes the mob come to *its* spot and fights there.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Strike | melee | Sword swing (main attack) |
| 1 | Lay on Hands | heal | Full heal, very long cooldown (once a fight at most) |
| 2 | Holy Bash | stun | Shield stun |
| 3 | Mend | heal | Small heal, 2s cast |
| 4 | Smite Undead | nuke | Big nuke, undead only |
| 5 | Taunt | taunt | Pull a mob off your pet or a friend (matters in groups) |
| 6 | Consecrate | holy ground | A circle under you for 15s: you heal slowly in it, undead in it take damage |
| 8 | Divine Strike | cleave | Hits all mobs in front of you, extra vs undead |

**Pull:** Smite Undead on undead (level 4), otherwise Taunt or walk in. Level 6+: let the mob come to you, then Consecrate.
**Fight, in order:**
1. Health very low and Lay on Hands ready → Lay on Hands.
2. Health low and Holy Bash ready → Holy Bash, then Mend while it's stunned.
3. Undead target and Smite Undead ready → Smite Undead.
4. Consecrate ready and the mob is coming or in melee → Consecrate where you stand, and **don't leave the circle**.
5. Two or more next to you and Divine Strike ready → Divine Strike.
6. Holy Bash ready → Holy Bash.
7. Otherwise → Strike.
**Losing the fight:** like the Warrior, never runs in the sim.
**Between fights:** sit until health and mana are about 80%.

### Shadow Knight: the dark anvil
**Idea:** a tank that solos like a weak Necro: lifetaps to stay up, a small skeleton for extra damage, fear to buy time.
**Twist: pays in blood, likes a crowd.** Harm Touch costs a chunk of your own health, and Dark Cleave heals you for every mob it hits. A Warrior wants one mob at a time; a Shadow Knight wants two or three around it, so every swing heals.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Strike | melee | Two-handed swing (main attack) |
| 1 | Siphon | lifetap | Small lifetap, heals you |
| 2 | Disease Cloud | dot | Weak DoT, also the pull |
| 3 | Terror | fear | Mob runs away (shorter than the Necro's Dread) |
| 4 | Raise Minion | pet | Small skeleton: low HP, doesn't tank long |
| 5 | Harm Touch | nuke | Huge hit, costs 20% of your own health, long cooldown |
| 6 | Feign Death | feign | Same as the Necro's |
| 8 | Dark Cleave | cleave | Hits all mobs in front of you and heals a bit per mob |

**Before pulling:** minion up (level 4).
**Pull:** Disease Cloud, then wait.
**Fight, in order:**
1. Health very low and Feign Death ready (level 6) → Feign Death.
2. Three or more mobs → Terror the one with the most health. Two mobs are fine: keep both on you for Dark Cleave.
3. Mob above half health, your health above half, and Harm Touch ready → Harm Touch.
4. Health below about 70% → Siphon.
5. Disease Cloud not on the target → Disease Cloud.
6. Two or more next to you and Dark Cleave ready (level 8) → Dark Cleave (it heals per mob).
7. Otherwise → Strike.
**Between fights:** sit until health and mana are about 80%; re-raise the minion if it died.

### Wizard: the glass cannon
**Idea:** kill it before it reaches you. Biggest single hits in the game, but mana runs dry fast and two mobs is trouble. The one true bolt class.
**Twist: set up, then shatter.** Frost Bolt chills (each hit slows a bit more). Freeze it, then Shatter it for a huge hit. The fun is lining up the combo, not spamming one bolt. Blink from level 1 so the Wizard zips around instead of walking.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Frost Bolt | nuke | Medium nuke; each hit chills (stacks a slow) (main attack) |
| 1 | Blink | move | Short teleport forward: escape, or just get around faster |
| 2 | Freeze | root | Freezes the mob in place |
| 3 | Shatter | nuke | Huge hit on a frozen mob, breaks the freeze; weak on anything else |
| 4 | Fireball | nuke | Big nuke, 2.5s cast, costs a lot |
| 5 | Frost Nova | area nuke | Hits and freezes every mob around you briefly |
| 6 | Mana Shield | buff | Damage hits your mana first for 10s |
| 8 | Gate | move | Teleport to the Gate Road guards (safe stop / escape), long cast |

**Pull:** Fireball from max range (level 4), else Frost Bolt.
**Fight, in order:**
1. Health low and Gate ready (level 8) and losing → Gate out (counts as an escape, not a death).
2. Health low → Mana Shield (level 6), Blink away, Freeze.
3. Mob frozen and Shatter ready → Shatter.
4. Mob within melee range and Freeze ready → Freeze, step back, then Shatter.
5. Two or more mobs close → Frost Nova, then Shatter the strongest.
6. Mob far away and Fireball ready → Fireball.
7. Otherwise → Frost Bolt.
**Between fights:** sit until mana is about 80%. Expect long sits.

### Settled for batch 1 (Nov 17)
- Cleric's Divine Aura: you can't attack inside it. Fine, and a model for boss mechanics later (see the boss telegraph card on the board).
- Enchanter charm always breaks toward you: high risk, high reward.
- Wizard gets Gate at level 8. Teleports are fine early; mounts may come later anyway.
- Shadow Knight keeps Feign Death.

## Batch 2 (later): Magician, Ranger, Monk, Shaman, Bard
Archetypes only for now. Shaman and Bard need the buff bar first; Bard also needs songs.
Flavor notes to carry in: Shaman is the **DoT and slow** class (stack several ticking effects and walk away, never casting bolts). Magician is the **summoner** (picks which elemental pet to bring). Monk fights with fists and **pulls by feigning death**. Ranger shoots while moving. Bard plays songs that run on their own.

---

## Rogue: Evade, tested both ways
Owner's call (Nov 17): the sim runs the Rogue both ways below and reports which kills faster and dies less. The winner becomes the Rogue's playbook.

**What is Evade for?** One thing to know first: a mob that walks home heals to full. So an Evade reset throws away all the damage you've done to that mob.

Example: a level 6 Rogue is fighting a crypt skeleton. The skeleton is at half health, the Rogue is at 60%, and Evade is ready.
- **A. Evade as damage:** Evade, then Backstab right away (triple damage, can't miss). The skeleton turns back on you after ~3s, but it's now nearly dead. Evade becomes part of the combo, so it's usually on cooldown when you need to escape.
- **B. Evade as escape:** save it. Keep going with Gouge → Backstab and Stab. Only when health drops low: Evade, Hide, let the skeleton walk home (healed), rest to 80%, and re-open from Hide.

## Settled (Nov 17)
- Necro re-Dreads the big mob when it starts walking back toward you.
- Necro sits as soon as nothing is on it.
- Druid stands and fights at levels 1–2.
- Warrior never runs in the sim.
- Every class rests to 80% before the next pull.

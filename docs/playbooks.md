# Class playbooks (draft)

How each class is meant to be played solo, written as rules: **when X, do Y.** The testing-grounds sim will follow these so its balance numbers match real play. Rules are in priority order: the sim checks from the top and does the first one that fits.

**Status:** Druid, Warrior, Necromancer and Rogue are on their second draft (owner's answers in). Batch 1 (Cleric, Enchanter, Paladin, Shadow Knight, Wizard) is a first draft, Nov 17. Nothing in the game uses this yet.

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

New rules this batch needs (everything else reuses what the game already has):
- **Undead tag on mobs.** Skeletons and Boss 1 are undead; rats and beetles aren't. Cleric and Paladin hit undead harder.
- **Heal over time:** a heal that ticks, like a DoT in reverse.
- **Mez:** the mob falls asleep until anything hits it, then wakes up angry.
- **Charm:** a mob fights for you for a while, then breaks free and attacks you.
- **Area nuke:** hits every mob around you (Wizard). Cleave already does this for melee.
- **Undead pet (small):** the Necro pet at a smaller size, for the Shadow Knight.
- **Smaller ones:** taunt, a weaken debuff (Tash), short jumps and teleports (Blink, Gate), a can't-be-hurt bubble (Divine Aura), and damage hitting mana first (Mana Shield).

### Cleric: the slow grind (pure healer)
**Idea:** hit things with a hammer and refuse to die. Kills are slow, but deaths almost never happen. The anchor at the bottom of the solo chart.

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
**Between fights:** sit until mana is about 80%.

### Enchanter: the controller
**Idea:** never fight two things at once. Put extras to sleep, slow the one you're fighting, and borrow a mob to do your damage.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Mind Spike | nuke | Small nuke (main attack) |
| 1 | Mesmerize | mez | Puts a mob to sleep until it's hit, up to ~20s |
| 2 | Tash | debuff | Mob takes more spell damage and resists less |
| 3 | Clarity | buff | Faster mana regen for you (lasts until you die) |
| 4 | Slow Mind | snare | Mob moves and attacks slower |
| 5 | Charm | charm | A mob fights for you for 20–40s, then breaks free at full anger |
| 6 | Color Flash | stun | Stuns every mob near you (escape button) |
| 8 | Mind Rot | dot | Damage over time, good with a charmed pet |

**Before pulling:** Clarity if it isn't on.
**Pull:** Mind Spike on one mob. If more than one comes, Mesmerize every extra one right away.
**Fight, in order:**
1. A mob not currently fought is awake and coming at you → Mesmerize it.
2. Health low and two or more on you → Color Flash, back off, Mesmerize.
3. Level 5+, a mob your level or lower is free and Charm ready → Charm it and let it kill the target. **When the charm is about to end** (the bar runs low) → Mesmerize your own pet the moment it breaks, then kill it or walk away.
4. Slow Mind not on the target → Slow Mind.
5. Tash not on the target → Tash.
6. Mind Rot not on the target (level 8) → Mind Rot.
7. Otherwise → Mind Spike.
**Between fights:** sit until mana is about 80%.
**Touch control for mez (to design in the build):** idea: tap a mob, then the Mez button; sleeping mobs show "Zz" and a small timer so you know when to re-mez.

### Paladin: the holy anvil
**Idea:** a Warrior that trades some toughness for heals and stuns. Very strong in the crypt (undead).

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Strike | melee | Sword swing (main attack) |
| 1 | Lay on Hands | heal | Full heal, very long cooldown (once a fight at most) |
| 2 | Holy Bash | stun | Shield stun |
| 3 | Mend | heal | Small heal, 2s cast |
| 4 | Smite Undead | nuke | Big nuke, undead only |
| 5 | Taunt | taunt | Pull a mob off your pet or a friend (matters in groups) |
| 6 | Righteous Fury | buff | More damage for 10s, extra vs undead |
| 8 | Divine Strike | cleave | Hits all mobs in front of you, extra vs undead |

**Pull:** Smite Undead on undead (level 4), otherwise walk in.
**Fight, in order:**
1. Health very low and Lay on Hands ready → Lay on Hands.
2. Health low and Holy Bash ready → Holy Bash, then Mend while it's stunned.
3. Undead target and Smite Undead ready → Smite Undead.
4. Righteous Fury ready and the mob is above half health → Righteous Fury.
5. Two or more next to you and Divine Strike ready → Divine Strike.
6. Holy Bash ready → Holy Bash.
7. Otherwise → Strike.
**Losing the fight:** like the Warrior, never runs in the sim.
**Between fights:** sit until health and mana are about 80%.

### Shadow Knight: the dark anvil
**Idea:** a tank that solos like a weak Necro: lifetaps to stay up, a small skeleton for extra damage, fear to buy time.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Strike | melee | Two-handed swing (main attack) |
| 1 | Siphon | lifetap | Small lifetap, heals you |
| 2 | Disease Cloud | dot | Weak DoT, also the pull |
| 3 | Terror | fear | Mob runs away (shorter than the Necro's Dread) |
| 4 | Raise Minion | pet | Small skeleton: low HP, doesn't tank long |
| 5 | Harm Touch | nuke | Huge hit, very long cooldown |
| 6 | Feign Death | feign | Same as the Necro's |
| 8 | Dark Cleave | cleave | Hits all mobs in front of you and heals a bit per mob |

**Before pulling:** minion up (level 4).
**Pull:** Disease Cloud, then wait.
**Fight, in order:**
1. Health very low and Feign Death ready (level 6) → Feign Death.
2. Two or more mobs → Terror the one with the most health, fight the other.
3. Mob above half health and Harm Touch ready → Harm Touch.
4. Health below about 70% → Siphon.
5. Disease Cloud not on the target → Disease Cloud.
6. Two or more next to you and Dark Cleave ready → Dark Cleave.
7. Otherwise → Strike.
**Between fights:** sit until health and mana are about 80%; re-raise the minion if it died.

### Wizard: the glass cannon
**Idea:** kill it before it reaches you. Biggest single hits in the game, but mana runs dry fast and two mobs is trouble.

| Lvl | Ability | Kind | What it does |
| --- | --- | --- | --- |
| 1 | Frost Bolt | nuke | Medium nuke, small snare (main attack) |
| 1 | Shock | nuke | Instant small nuke |
| 2 | Freeze | root | Roots the mob in place |
| 3 | Fireball | nuke | Big nuke, 2.5s cast, costs a lot |
| 4 | Blink | move | Jump a short way forward (escape) |
| 5 | Frost Nova | area nuke | Hits and snares every mob around you |
| 6 | Mana Shield | buff | Damage hits your mana first for 10s |
| 8 | Gate | move | Teleport to the Gate Road guards (safe stop / escape), long cast |

**Pull:** Fireball from max range (level 3), else Frost Bolt.
**Fight, in order:**
1. Health low and Gate ready (level 8) and losing → Gate out (counts as an escape, not a death).
2. Health low → Mana Shield (level 6), Blink away, Freeze.
3. Mob within melee range and Freeze ready → Freeze, then step back out of range.
4. Two or more mobs close → Frost Nova, back off.
5. Mob rooted or far away and Fireball ready → Fireball.
6. Otherwise → Frost Bolt (Shock while moving).
**Between fights:** sit until mana is about 80%. Expect long sits.

### Questions for the owner (batch 1)
1. Cleric's Divine Aura: fine that you can't attack inside it?
2. Enchanter charm: should breaking free always aim at you, or sometimes just wander off?
3. Wizard's Gate home: OK at level 8, or save teleports for later levels?
4. Shadow Knight gets Feign Death like the Necro (EverQuest did this). Keep it, or make it Necro-only?

## Batch 2 (later): Magician, Ranger, Monk, Shaman, Bard
Archetypes only for now. Shaman and Bard need the buff bar first; Bard also needs songs.

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

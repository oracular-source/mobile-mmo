# Class playbooks (draft)

How each class is meant to be played solo, written as rules: **when X, do Y.** The testing-grounds sim will follow these so its balance numbers match real play. Rules are in priority order: the sim checks from the top and does the first one that fits.

**Status:** second draft, Nov 17, with the owner's answers to the first round of questions. Nothing in the game uses this yet.

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
1. Health low and Evade ready (level 5) → Evade, then Hide. The mob walks home; let it go and rest.
2. Mob stunned or Evaded and Backstab ready → Backstab (double or triple damage from any side).
3. Gouge ready → Gouge (stun), then Backstab.
4. Rend not on the target → Rend.
5. Otherwise → Stab.

**Getting around:** Sprint (level 7) to get to a fight, get out of one, or cross a cleared area. It works in dungeons too.

**Two or more mobs:** avoid. Evade + Hide to drop them and come back one at a time.

**Between fights:** sit until health is about 80%, then Hide before the next pull.

---

## Not built yet (archetypes only)
- **Cleric (healer):** slow and steady. Melee with the hammer, let the heal-over-time run, and use a big heal only when health is low. Never needs to kite. Expected to be the slowest solo class.
- **Enchanter (crowd control):** mez (sleep) every extra mob, fight one at a time, charm a stronger mob as a temporary pet, and break it off before it turns.

---

## Open question
**Rogue: what is Evade for?** One thing to know first: a mob that walks home heals to full. So an Evade reset throws away all the damage you've done to that mob.

Example: a level 6 Rogue is fighting a crypt skeleton. The skeleton is at half health, the Rogue is at 60%, and Evade is ready.
- **A. Evade as damage:** Evade, then Backstab right away (triple damage, can't miss). The skeleton turns back on you after ~3s, but it's now nearly dead. Evade becomes part of the combo, so it's usually on cooldown when you need to escape.
- **B. Evade as escape:** save it. Keep going with Gouge → Backstab and Stab. Only when health drops low: Evade, Hide, let the skeleton walk home (healed), rest to 80%, and re-open from Hide.

The sim can test both and show which kills faster and dies less.

## Settled (Nov 17)
- Necro re-Dreads the big mob when it starts walking back toward you.
- Necro sits as soon as nothing is on it.
- Druid stands and fights at levels 1–2.
- Warrior never runs in the sim.
- Every class rests to 80% before the next pull.

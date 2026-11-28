# Mobile MMO: Design Doc

Copy of the live design doc (Nov 17, 2026). The live version with diagrams is in Claude: "Mobile MMO — Design Doc".

## Vision

A tab-target fantasy MMO for phones, built for sessions from 15 minutes to a few hours, that pairs EverQuest's camp-and-group feel with Dreadmyst's lean, build-focused loop. Working title: TBD.

**Target player:** lapsed classic-MMO fans (EverQuest, OSRS, WoW Classic) with jobs and families. They want real progress in a lunch break, solo when they have to, and better rewards when they group.

**Platform:** iOS and Android first. A PC client can come later on the same servers.

## Inspirations

Take EverQuest's social danger and Dreadmyst's small, tight scope. Leave out the grind walls of both eras.

| Element | From | How it shows up here |
| --- | --- | --- |
| Camps and pulls | EverQuest | Named camps with spawn timers; pull mobs back to a safe spot |
| Classes need each other | EverQuest | Buffs, heals and crowd control make groups clearly faster |
| Death has weight | EverQuest | Death costs time and wears your gear (repair at a campfire for copper); no XP loss (owner, Nov 27: too hardcore for a phone game) |
| Small, finished scope | Dreadmyst | Six launch classes and a few zones, polished before adding more |
| Build customization | Dreadmyst | Ability forks, majors and loadouts as you level |
| Short repeatable runs | Dreadmyst | Camps and dungeons that fit 15–30 minutes |
| Tab-target, 2D view | Dreadmyst | Readable on a phone screen, forgiving on cell signal |

**Leave out:** OSRS-style grind walls, group-only content that needs 4–5 hour sessions, corpse runs that can lose gear, and anything pay-to-win.

## Design pillars

Every feature has to serve at least one of these. If it serves none, it gets cut.

1. **Respect the session.** Every activity has a natural stopping point within 20 minutes.
2. **Solo-viable, group-rewarded.** Anything can be soloed, but groups earn rewards noticeably faster.
3. **Classes need each other.** Identity comes from roles and utility, not bigger numbers.
4. **Readable on a phone.** One thumb to target, no more than 8 ability buttons on screen.
5. **Small and finished.** Ship less content, but make it polished.

## Core loop

One run (a camp session or a dungeon) takes 15–30 minutes and always ends somewhere it's safe to log out.

Pick a camp or dungeon → pull and fight → loot and XP → upgrade build and gear → another run, or a safe stop (log out; rested XP builds while away).

Long term: level 1–30, unlock new zones, chase named-mob drops, then take on the group-only camps at the top of each zone.

## Classes and roles

The full roster is 14 classic classes, each with one signature mechanic and a real weakness, like EverQuest. Six launch first; the rest arrive two or three per update.

| Class | Role | Signature | Strengths | Weaknesses | Launch |
| --- | --- | --- | --- | --- | --- |
| Warrior | Tank | Disciplines | Best mitigation and aggro | No spells; weak solo, needs potions or a healer | Yes |
| Paladin | Tank | Lay on hands | Heals, stuns, bonus vs undead | Less durable than Warrior, lower damage | Later (playable in the prototype since v0.17) |
| Shadow Knight | Tank | Lifetaps | Fear, small undead pet, solos well | Less durable than Warrior | Later (playable in the prototype since v0.17) |
| Cleric | Healer | Resurrection | Best heals, the only full rez | Very low damage, slow solo | Yes (playable since v0.17) |
| Druid | Healer | Root and kite | DoTs, snares, group teleports, great outdoor solo | Weaker heals, fragile, struggles indoors | Yes |
| Shaman | Healer | Slow | Slows, buffs, DoTs | Low burst damage | Later (playable in the prototype since v0.18) |
| Wizard | Caster | Burst nukes | Highest burst, emergency group teleport | Burns mana, pulls aggro, dies fast | Later (playable in the prototype since v0.17) |
| Magician | Caster | Elemental pet | Strong pet, summons gear for the group | Helpless if the pet dies | Later (playable in the prototype since v0.18) |
| Necromancer | Caster | Undead pet + feign death | Best soloer: DoTs, lifetaps, pet | Slow group damage, can't heal others | Yes |
| Enchanter | Caster | Mez and charm | Crowd control, haste, mana regen | Fragile, hardest to play | Yes (playable since v0.17) |
| Rogue | Melee | Backstab | Top melee damage, stealth, traps, locks | Needs a tank, weak solo | Yes |
| Monk | Melee | Feign death pulls | High damage, best puller | Light armor only | Later (playable in the prototype since v0.18) |
| Ranger | Melee | Bow + tracking | Ranged damage, snares, can tank in a pinch | Best at nothing | Later (playable in the prototype since v0.18) |
| Bard | Support | Songs | Group buffs, crowd control, run speed | Low personal power | Later (playable in the prototype since v0.18) |

The launch six cover one tank (Warrior), two healers (Cleric, Druid), two damage dealers (Rogue, Necromancer) and crowd control (Enchanter), and spread out for solo play: Necromancer strong; Druid and Enchanter medium; Warrior, Cleric and Rogue weak and rewarded for grouping. Enchanter replaced Wizard at launch (Nov 17, 2026) because it plays more differently from the existing casters.

Enchanter touch controls (v0.17): the Mez button puts to sleep the closest awake mob coming at you that you are *not* fighting, so one tap handles the extra add and you keep hitting your target (with no extra around it uses your target). Sleeping mobs show **Zz** and the seconds left (orange near the end); tapping a sleeping mob only targets it, and auto-attack and pets leave it alone. Charm works on ordinary mobs your level or lower; while it lasts, the pet bar turns pink and shows the time left instead of health. Bard songs need their own touch controls, such as a song playlist that cycles automatically; that's one reason Bard comes after launch.

### Warrior (playable)

Armored tank with no mana: every skill runs on its own cooldown. High HP (60 + 16 per level) and built-in plate armor; STR adds 2% melee damage per point. Melee range is short, and there's no auto-walking, so the Warrior steps in and holds ground instead of kiting.

**Passives (v0.18.2), the ultimate tank:** **Hold the Line:** takes 20% less damage for each mob on you, up to 3 (so 20–60%); counts Boss 1's bolt too. A small tag on the buff bar shows the current cut. **Last Stand:** once a fight, a killing blow leaves you at 1 HP; for 5s nothing can drop you lower and damage is cut by 75%, so a Bandage in that window sticks. Comes back when the fight ends.

| Level | Skill | Type | What it does |
| --- | --- | --- | --- |
| 1 | Strike | Melee | Main attack, global cooldown only (auto-cast) |
| 1 | Bandage | Heal | 2s cast standing still, then heals; 20s cooldown, down to 12s |
| 1 | Throw Stone | Pull | Ranged poke to pull mobs; not in the default loadout |
| 2 | Shield Bash | Stun | Small hit plus a 2s stun; 12s cooldown, down to 8s |
| 3 | Hamstring | Snare | Slows the target; 18s cooldown, down to 10s |
| 6 | Defensive Stance | Defense | Half damage taken for 10s; 45s cooldown, down to 30s |
| 8 | Cleave | Area | Hits every enemy next to you; 10s cooldown, down to 6s |

### Rogue (playable)

Sneaky melee damage with no mana: every skill runs on its own cooldown. HP 48 + 14 per level, leather armor (AC 8), STR adds 2% melee damage per point. **Dodge (passive, v0.18.4):** a quarter of melee hits miss outright ("DODGE"); spells like Boss 1's bolt still land. Hits harder than the Warrior but can't take hits, so solo play means picking fights carefully: open from Hide, stun, get behind, and Evade when it goes wrong. Best with a tank holding the mob.

| Level | Skill | Type | What it does |
| --- | --- | --- | --- |
| 1 | Stab | Melee | Main attack, global cooldown only (auto-cast). From Hide it becomes Backstab if that's ready |
| 1 | Backstab | Backstab | Triple damage that can't miss from Hide or on an Evaded mob; double from behind or on a stunned mob. From Hide it one-shots most mobs a level or two below you. 10s cooldown, down to 6s |
| 1 | Hide | Stealth | Mobs don't notice you; you sneak at 70% speed. Using any skill or getting hit ends it. Can't hide while something is fighting you |
| 1 | Throwing Knife | Pull | Ranged poke to pull mobs |
| 2 | Gouge | Stun | Small hit plus a 2.5s stun: step behind the mob for a Backstab |
| 3 | Rend | Bleed | Melee damage over time |
| 5 | Evade | Drop aggro | Mobs fighting you forget you and stand confused for about 3s (half on bosses). Hide during it and they walk home; hit them directly and they fight again. Bleed ticks don't wake them |
| 7 | Sprint | Speed | +50% run speed for 8s |

**Behind:** mobs face left or right; you're behind a mob when you're on the side its back faces. A stunned or Evaded mob isn't watching you, so Backstab works from any side (stepping behind in a 2s stun is too fiddly on a phone).

**Solo combo:** Hide → walk up → tap the mob (Backstab ambush) → Gouge → Backstab → Rend, Stab → Evade → Backstab (ambush again).

### Necromancer (playable)

Dark caster with an undead pet. Low HP, mana like the Druid, and caster gear (shared with the Druid). The pet is the class: it tanks while the Necromancer drains and DoTs.

| Level | Spell | Type | What it does |
| --- | --- | --- | --- |
| 1 | Lifetap | Lifetap | Main attack; heals you for the damage dealt |
| 1 | Raise Bones | Pet | 3s cast; summons a skeleton (HP 30 + 14 per level) that follows you, attacks your target and holds aggro |
| 2 | Siphon Plague | DoT | Stronger DoT than the Druid's |
| 3 | Dread | Fear | The target runs away from you for a few seconds, zig-zagging and steering clear of other camps (v0.104) |
| 6 | Feign Death | Escape | Mobs forget you and stay where they are (no heal, no reset); your pet keeps fighting |
| 8 | Mend Bones | Pet heal | Heals your skeleton |

**Threat:** every mob tracks threat from you and from your pet and attacks whoever has more. Damage adds threat; the pet's hits count triple, plus a bonus on its first hit, so it can tank.

**All classes:** abilities grow a little stronger every level after you learn them: more damage and healing, and longer roots, snares and stuns. Each class keeps its own level, bags and loadout, and personal loot only drops gear your class can use.

### Batch 1 classes (playable, v0.17): Cleric, Enchanter, Paladin, Shadow Knight, Wizard

Built wide on the default skin; numbers are first drafts for the balance pass. Full ability tables (levels 1–8) and the "when X, do Y" playbooks are in `docs/playbooks.md`. Each has a signature twist so none plays like a recoloured Wizard:

- **Cleric** (chain, mace and shield): every heal also sends holy damage into undead fighting within about 2.5 tiles, so in the crypt healing yourself is your damage. Renew heals every 2s for 12s (and pulses too). Turn Undead only works on undead. Divine Aura: 4s of no damage, but you can't attack.
- **Enchanter** (caster gear): no bolts. Mind Rot (DoT), Mesmerize, a floating sword pet (2 minutes), Slow Mind (mob moves and attacks slower; a slowed boss also casts slower, v0.18.4), Clarity (+50% mana regen until you die), Charm (20–40s, then the mob breaks free and always attacks you), Color Flash (stuns everything near you), Phantasm (a see-through copy of you that nearby mobs attack for ~5s).
- **Paladin** (wears Warrior plate plus knight gear): Lay on Hands (full heal, ~3 min cooldown), Holy Bash, Mend, Smite Undead (undead only), Taunt, **Consecrate** (holy ground for 15s: you heal every second inside it, undead inside burn), Divine Strike (area, extra vs undead).
- **Shadow Knight** (Warrior plate plus knight gear): Siphon (lifetap), Disease Cloud, Terror (short fear), a small skeleton minion, **Harm Touch** (huge hit that costs 20% of your max health; level 8 since v0.18.4), Feign Death, **Dark Cleave** (area hit that heals you per mob hit; level 5 since v0.18.4, was 8, so the "likes two mobs" twist shows up early).
- **Wizard** (caster gear): Frost Bolt stacks **chill** (−12% speed per stack, up to 4, fades 8s after the last bolt); Freeze roots; **Shatter** does full damage to a frozen mob and breaks the freeze, about a third on anything else. Blink (short teleport the way you last moved), Fireball (2.5s cast), Frost Nova (hits and freezes everything near you), Mana Shield (damage comes out of mana first for 10s), Gate (6s cast, home to the Gate Road guards; ends every fight, and leaves Dungeon 1).

### Batch 2 classes (playable, v0.18): Magician, Ranger, Monk, Shaman, Bard

Same approach as batch 1: default skin, first-draft numbers, full tables and playbooks in `docs/playbooks.md`.

- **Magician** (caster gear): Elemental Lash (short-range hit that also heals your pet a little). **Pick your elemental:** Summon Earth (slow, tough, holds aggro; **Stone Fist** breaks a spell the mob starts casting, once every 10s, v0.18.4) or Summon Fire (fragile, hits hard, every hit sets the mob burning). One pet at a time; summoning the other sends the first away. Mend Elemental, Burnout (pet attacks 30% faster for 20s), **Detonate** (the pet explodes: Fire hits hardest, Earth hits less but stuns), Flame Shield (mobs that hit you take fire damage back, until you die), Elemental Link (10s: the pet takes half the damage meant for you). Air and Water come past level 8.
- **Ranger** (own gear: bows, leathers, quivers): Shoot, Hunter's Mark (your hits on it do 20% more until it dies), Ensnaring Shot (hit + snare), **Spike Trap** (set at your feet, up to two at once, each waits 60s; the first mob within about a tile takes a big hit and bleeds), Disengage (hop backward away from what's on you), Salve (the only cast that makes you stop), Volley (arrows rain on the target's area for 4s), Rapid Fire (Shoot twice as fast for 6s). Every instant ability already works while walking, and the Ranger's whole kit is instant except Salve, which is what "shoots on the move" means here.
- **Monk** (own gear: wraps, gi): Palm Strike, Mend (instant heal, long cooldown), Flying Kick (leaps to the target), **Feign Death that splits** (level 3, 12–20s cooldown): every mob walks home except your target, and the ones sent home ignore you for 10s so you can drag the one that stayed back to your camp. With only one mob on you it drops that one too (an escape). Leg Sweep (stun), Flurry (five quick punches), Deflect (3s of dodging every melee hit), Dragon Strike (big hit, knocks the mob back).
- **Shaman** (caster gear plus own spears and fetishes): Sicken and Swarm (two DoTs), **a small stacking bonus: each Shaman DoT ticks 10% harder for every other DoT on the same mob** (owner, Nov 17), Minor Healing, **Drowsy** (mob attacks about 40% slower but still runs at full speed), Spirit of the Wolf (+30% run speed, until you die), **Venom Totem** (a post on the ground for 20s that poisons mobs fighting you near it), Spirit Ward (+8 armor and +10% max health, until you die), Cannibalize (15% of your health for mana).
- **Bard** solos bosses by **kiting** (owner, Nov 17): Song of Travel + Dirge, drag the boss around inside Dirge's reach, run out of range when it casts. Slow (a few minutes for Boss 1) but safe. **Speed nerf (owner, v0.76):** Song of Travel is 1.6x out of fights but 1.35x while anything fights you, so dodging a bolt takes a quick reaction (below about 1.33x the kite can't get out of bolt range at all).
- **Bard** (own gear: rapiers, lutes, doublets): Slash plus **songs**. Tap a song to start it, tap again to stop; two play at once (a third replaces the oldest). Each pulses every 3s on its own while you walk, fight or sit: Song of Mending (heals you and your pet), Dirge (hurts mobs fighting you within about 2 tiles; doubled in v0.18.4 for the boss kite), Song of Travel (+60% run speed; doesn't add to Wolf, the faster one counts), Chant of Blades (melee 25% faster), Discord (mobs near you attack 25% slower). Lullaby (a short Mesmerize). **Crescendo** ends both songs in one big pulse: 4x heal or damage, a stun from Discord, a 6s sprint from Travel, a triple-damage swing from Chant. Playing songs glow on their buttons.

**Buff bar (v0.18):** a row of small tags under your health shows every buff and song on you, with seconds left on short ones. Buffs hit only you for now; "you and everyone nearby" waits for groups (phase 3).

**Undead:** shambling corpses, crypt skeletons and Boss 1 are undead (rats, beetles and Old Gnawbone aren't). The target frame says "Undead". Boss 1 can't be mesmerized or charmed.

**Buffs end when you die** (since v0.17), so Clarity "until you die" means exactly that; Barkskin and the rest clear on death too.

**Gear:** Cleric has its own gear (maces, chain, shields, three Boss 1 drops). Paladin and Shadow Knight wear Warrior gear plus knight gear (two Boss 1 drops: greatsword and helm). Enchanter and Wizard share caster gear with the Druid and Necro; a new Boss 1 Circlet joins the caster drops.

### Prototype class: Druid

The Druid is the prototype class because it touches every system at once: damage, healing, crowd control, kiting and travel. If it feels good, the other classes are variations on solved problems.

**Identity:** a nature caster who wins outdoor fights by never letting enemies reach them. Light armor; strongest in open zones, weaker in tight dungeons. Stormcall and Circle Port only work outdoors.

| Level | Ability | Type | What it does | Source |
| --- | --- | --- | --- | --- |
| 1 | Thornlash | Nuke | Small nature damage, fast cast | Starting |
| 1 | Mending Touch | Heal | Single-target heal | Starting |
| 2 | Creeping Rot | DoT | Nature damage over 18 seconds | Trainer |
| 3 | Tanglefoot | Snare | Slows target movement by 50% | Trainer |
| 6 | Rootgrip | Crowd control | Roots target in place; can break when it takes damage | Trainer |
| 8 | Barkskin | Buff | Raises armor on self or an ally | Trainer |
| 10 | Thorn Aura | Buff | Damage shield: attackers take damage | Trainer |
| 12 | Wild Regrowth | Heal | Heal over time | Trainer |
| 14 | Cleanse | Cure | Removes poison or disease | Trainer |
| 15 | Stormcall | Nuke | Big lightning hit, long cooldown, outdoors only | Trainer |
| 16 | Wolf Form | Utility | Self run speed boost; drops on attack | Trainer |
| 18 | Nature's Sight | Utility | Shows nearby creatures on the minimap | Trainer |
| 20 | Circle Port | Travel | Teleports the group to the zone's druid circle, outdoors only | Quest |
| 20 | Mending Rain | Heal | Group heal | Trainer |
| 22 | Sap Strength | Debuff | Lowers target's attack damage | Trainer |
| 24 | Pack Run | Utility | Group run speed boost | Trainer |
| 26 | Briar Wall | Crowd control | Roots every enemy in an area | Rare drop |
| 30 | Heart of the Grove | Heal | Huge single heal, 10-minute cooldown | Quest |

**Cooldowns:** stronger spells have their own cooldown that shrinks as you level past the spell, down to a floor: Mending Touch 8s→4s, Creeping Rot 12s→6s, Tanglefoot 18s→10s, Rootgrip 24s→12s, Barkskin 30s→15s. Thornlash only uses the global cooldown.

**Rank upgrades** replace earlier versions instead of taking book space: Thornlash II at 12, Mending Touch II at 16, Rootgrip II at 24.

**Prototype scope:** levels 1–10 in Zone 1 only need the first 7 abilities. Snare comes before root on purpose: it's the safer kiting tool, and root is the stronger upgrade. Creeping Rot comes at level 2 so armored beetles are beatable early. The full DoT, snare and nuke loop is available by level 3. Default loadout: center Thornlash, then clockwise from up: Mending Touch, Tanglefoot, Creeping Rot, Rootgrip, Barkskin.

## Combat

Tab-target combat is the core mobile bet. It plays well on touch, and it handles lag on cell networks much better than action combat. EverQuest is inspiration for spells and skills, not a rulebook.

### Level difference and resists

Level difference is the main source of danger, like EverQuest. A mob two or more levels above you should feel deadly.

- **Resists:** every targeted spell can be resisted, at any level. Even-level mobs resist about 5% of the time, plus 10% for each level they're above you, down to 2% for much lower mobs. A resist still costs the mana. There are no fizzles.
- **Durations:** roots, snares and DoTs last longer on lower-level mobs and shorter on higher ones (15% per level, between 25% and 150% of normal).
- **Harder hits:** mobs above your level hit 15% harder per level; lower ones hit a little softer.
- **No leashing:** a pulled mob chases you until it dies, you die, or guards kill it. Mobs move almost as fast as you, so snares matter and running away is possible but tight.
- **Guards:** town guards attack any mob chasing you that comes near them, so running to the gate is a real escape. If guards do most of the damage, you get no XP or loot.

- **No auto-attack.** Every attack is a spell with a normal mana cost. Optional auto-cast repeats your main spell on the enemy you're fighting; any other spell you tap during the cooldown is queued and goes first. Tapping an enemy targets it and casts your Tap spell (this can be switched to target-only in Settings).
- **Smart targeting:** a spell cast with no target picks the nearest enemy. Out of range shows the spell's range ring; there's no auto-walking into range.
- **Cast times:** most damage and control spells are instant or nearly so and can be used on the move. Heals and big spells need you to stand still.
- **Movement:** tap the ground to walk there, or drag anywhere on the game screen to steer with a floating joystick (hidden by default, can be shown). Option: hold to move, walking toward wherever your finger presses.
- **Global cooldown:** around 1.5 seconds, more deliberate than an action game.
- **Danger:** aggro and pulls matter. Pulling too many mobs is the main way to die.
- **Downtime:** sitting speeds up mana and health regen, like EverQuest's med breaks, but much shorter.

### Controls and customization

Which spell sits in which slot is separate from how you trigger a slot. The loadout always has 6 slots; the control scheme only changes the trigger.

- **Spell pad (default):** one circular pad under the right thumb. Tap the center = slot 1. Five spells sit on a ring around it (up, up-right, down-right, down-left, up-left, 72 degrees apart); flick toward one to cast it, or tap it directly. No hold gestures.
- **Classic buttons:** a main button in the corner with five buttons fanned around it. Tap to cast.
- **Arrange mode:** drag a spell on the pad or buttons onto another to swap them (or tap two spells). The game pauses while arranging.
- **Spellbook:** swap in other learned spells by dragging them onto slots, or tap a spell then tap a slot.
- **Settings:** control scheme, left-handed mode (mirrors the pad or buttons), tap-enemy behavior, pad size and flick distance.
- **Not yet:** a free-form editor for placing every button anywhere.
- **Open question:** slots 7 and 8 (levels 15 and 25) need a trigger once the pad's six spells are used, for example a second ring or two extra buttons.

## World and zones

Start small: one hub city, three outdoor zones and two dungeons, covering levels 1–30.

| Area | Levels | Type | Notes |
| --- | --- | --- | --- |
| Hub city | All | Safe zone | Bank, vendors, trainers, group finder |
| Zone 1 | 1–10 | Outdoor, shared | Crossroads, graveyard and crypt, rat tunnel, Wolfwood, Ruined Chapel (see Zone 1 below) |
| Dungeon 1 (Malrec's chapel) | 14–15 | Instanced, 1–5 players | Inside Zone 1; 10–15 minute run (4 rooms) |
| Zone 2 | 10–20 | Outdoor, shared | First named mobs and rare spawns |
| Zone 3 | 20–30 | Outdoor, shared | Dangerous roamers, group-only named camp |
| Dungeon A | 12–18 | Instanced, 1–5 players | 15–20 minute run, scales to party size |
| Dungeon B | 25–30 | Instanced, 1–5 players | 20–25 minutes, harder boss |

Outdoor zones are shared, so you see other players, with a cap of around 50 per zone copy. An open-world dungeon for the classic EverQuest "camp in a dungeon" feel can come after launch.

**Dungeon sizes:** two tiers, so there's content for both a small group and a guild night.

| Tier | Players | Run length | Notes |
| --- | --- | --- | --- |
| Group dungeon | 1–5 (scales) | 15–30 minutes | Classic EverQuest group of 5: tank, healer, 3 flex. Soloable with an NPC companion. |
| Raid | 10–20 | 1–2 hours | Progress saves after each boss, so players can leave between bosses. Weekly loot lockout. |

Raids come after the MVP, once group dungeons are proven fun.

## Zone 1: Ashfen Hollow (levels 1–10)

A cursed borderland just outside the hub city (Town 1): a crossroads, a graveyard, a rat-infested sinkhole and a darkening forest that ends at a ruined chapel. Reworked Nov 17, 2026 from the Gate Road sandbox; research and reasoning in `docs/research/map-design.md`, rough layout in the "Mobile MMO — Zone 1 layout (rough)" sketch. The name is a placeholder until the setting is decided. **Status (v0.29): the crossroads, the rat tunnel, the Sunken Graveyard and the crypt are in the game; Wolfwood and the chapel are design only.** Order (owner, Nov 18): crossroads → rat tunnel → graveyard and crypt → Wolfwood → chapel.

**Size:** about 128 × 128 tiles. A straight walk from the town gate to the chapel is about 2 minutes on a winding road (about 250 tiles); each area's entrance is about 30 seconds from the crossroads. Judge it on the phone and adjust.

**Layout rules**
- Hub and spokes: the crossroads sits outside the gate, with a road to each area and the landmark at its end in view.
- One theme, one landmark, one named and one named rare per area, plus a few things to find (camps, story props, a hidden chest).
- Loops, not dead ends: a shortcut path runs from the chapel down the east side back to the crossroads.
- Difficulty grows with distance and depth, never with locked doors.
- Borders fit the place (owner, Nov 18): a hard cut where something physical marks the line (the graveyard gate, a cave mouth), a gradual blend where open land meets open land (the forest thinning toward the chapel). Rules for building areas: `area-rules.md`.
- Low ground fog is the signature effect; it changes by area.
- A map that fills in as you explore. No quest arrows.

| Area | Levels | Landmark | Named | What's there |
| --- | --- | --- | --- | --- |
| Crossroads (outside Town 1's gate; where the game starts, v0.29) | 1–3 | Campfire and signpost | none | Guards, Marrow the Peddler (not in yet), rats and beetles, critters |
| Sunken Graveyard (west) | 3–8 | A broken bell tower | **Skeleton King** at the crypt throne | Shambling corpses, crypt skeletons, dug graves, low fog; the crypt is an open, shared area at the back |
| Rat tunnel (east) | 2–6 | A sinkhole with dust rising and squeaks you can hear | **Old Gnawbone** (6) at the bottom | The first stop after the crossroads (easier than the crypt). A damp earth tunnel, not a mine: tunnel rats at the mouth, big tunnel rats deeper, holes in the walls, dirt piles, bones, roots, daylight through cracks, a pool cavern, a squeeze passage; one way in and out, the sinkhole (owner, Nov 20: it's a rat tunnel; the back hole was removed in v0.51.3) |
| Wolfwood (north) | 4–7 | A dead giant tree at the forest edge | **Greyfang** wanders a loop with his pack | Blight wolves, a hunter's abandoned camp, the forest getting darker |
| Ruined Chapel (deep wood) | 7–10 | The chapel tower above the trees; candles at night | **Brother Malrec** inside his dungeon (Dungeon 1) | Fen cultists in camps of three outside; the dungeon entrance under the altar |

**Level ladder (draft 2, approved by the owner Nov 18): Dungeon 1 at 15.** Owner: spread the levels out, worried there are too many mobs and too much to explore for a short climb, so the zone stretches to 15 and the bands widen. Bands overlap from the graveyard on (a choice of where to level, EverQuest-style), each area's top end still climbs, and inside each area it's easy at the entrance and hard at the far end. A named is the tough fight for the top of its band: most classes should beat it there in the sim, whatever its own level number. Rules in `area-rules.md` (Levels).

| Step | Area | Band | Named (beaten at) | Change from today |
| --- | --- | --- | --- | --- |
| 1 | Crossroads | 1–3 | Ironshell rare 3 | none |
| 2 | Rat tunnel | 3–6 | Old Gnawbone 6 (5–8 in the pace sim) | done v0.30.3: big tunnel rats 5 in the pool cavern, 5–6 in the den (were 4–5); v0.34.1: six more rats (3–5) between the warren and the den |
| 3 | Sunken Graveyard | 5–8 | the Weeping Bride rare 8 | done v0.30.3: back graves 7–8 (were 4–5); v0.34.1: front graves 4, middle field 5 (were 3 and 4), eight more corpses (5–7) |
| 4 | Crypt (shared) | 6–9 | Skeleton King 7 (6–9 in the sims) | v0.34.1: a level up all round (stairs 5, halls 6, throne room 7) and six more mobs |
| 5 | Wolfwood | 8–11 | Greyfang (11–12) | not built |
| 6 | Ruined Chapel grounds | 10–14 | the Ashen Acolyte rare 14 | not built |
| 7 | Dungeon 1 (Malrec's chapel) | 14–15 | Brother Malrec (15) | built v0.63 (was 12–13, Malrec 11) |

What it needs: the level cap goes from 10 to 15 (XP table to 15), every class gets abilities or ability ranks for levels 9–15 (balance chat), and the built areas get the small re-levels in the last column (done v0.30.3). The cap stays at 10 until the forks exist. **The "first big step at level 10" (owner, Nov 18) is the first fork:** levels 10, 12 and 14 each bring a fork (pick one of two versions of an ability), and 11, 13 and 15 bring a new ability or rank-up (15 also opens loadout slot 7); the balance chat fills 9–15 on that rhythm. The forks (or a first slice of them) have to exist before the cap goes past 10, or those levels are empty dings.

The Mire is out of Zone 1 for now (small and finished); it may return in Zone 2.

**Named mobs.** Every named has one look and one move that set it apart from the mobs around it.

| Named | Level | Where | Look | Move | Summon key |
| --- | --- | --- | --- | --- | --- |
| Skeleton King | 7 | Crypt throne (shared) | Crown, bigger than the skeletons, gold glint in the dark | Throws a spinning bone, calls two skeletons at half health | Crown shard (crypt skeletons) |
| Old Gnawbone | 6 | Bottom of the rat tunnel (shared) | Huge, hunched and bristly, scarred back, torn ear, a scar through the eye, long yellow teeth (own sprite, v0.29) | Squeals at 2/3 and 1/3 health and two rats burrow out of the nearest wall holes | Severed paw (tunnel rats) |
| Greyfang | 7 | Wanders Wolfwood | Silver coat, glowing eyes, leads the pack | Howls to call the pack back, never flees | none (wanders on a timer) |
| Brother Malrec | beaten at 15 (draft 2) | End of Dungeon 1 | Censer trailing smoke, candles light up around him | Heals his cultists; kill or root them first | none (dungeon boss) |

**Summoning.** At the Skeleton King's and Old Gnawbone's spots, touching an object (the throne, a pile of bones) summons the named if it isn't up, so nobody finds an empty camp. It needs only the area's key item, which is used up (no cooldown). Keys drop from about 1 kill in 10 of that area's mobs, only inside the area (v0.31). Walking up offers a Summon prompt; the named comes out fighting at its usual spot; its normal 5-minute respawn still runs.

**Named rares.** About 1 in 100 spawns in an area is that area's named rare: tougher, more XP, a better drop, and its own name and look. **In the game since v0.32** for the crossroads, rat tunnel and graveyard: each respawn in the area rolls 1 in 100; the rare appears at its own spot on the map (only one at a time, a soft chat line hints it), stays up if you leave, gives 3x XP and always drops an uncommon for your class (25% a rare). Ironshell is level 3, the Pale Rat 5 (calls friends at 30%), the Weeping Bride 8 (two corpses rise at half health). Placeholder names and looks:

| Area | Rare | Look | Twist |
| --- | --- | --- | --- |
| Crossroads | Ironshell | A mire beetle twice the size, with a cracked, mossy shell | Hard shell: DoTs work best |
| Sunken Graveyard | The Weeping Bride | A shambling corpse in a torn veil, pale glow | Her wail makes nearby corpses rise |
| Rat tunnel | The Pale Rat | A white rat with red eyes, bigger than the rest | Fast; runs to call friends at low health |
| Wolfwood | Old Scar | A one-eyed grey wolf with a torn ear | Hits hard, never part of a pack |
| Ruined Chapel | The Ashen Acolyte | A cultist in grey robes trailing smoke | Casts a shadow bolt; flees to Malrec's door |

**Hidden chests.** A few per area, off the main road; each rolls a piece of gear your class can use, then refills after a while. **In the game since v0.32:** one per built area (crossroads, rat tunnel, graveyard, crypt); walk up to open it for copper and one piece of gear, with better odds deeper in (`CHEST_ODDS` in `js/data/items.js`); it fills again after 10 minutes.

**Lore** waits until the setting is decided.

**Mobs from the old design** (rework to the new areas as they're built): grave rat (1–2), mire beetle (2–3), shambling dead (3–5), crypt rat and crypt skeleton (4–6), blight wolf (4–7, packs of 2–3, flee at low health), fen cultist (6–10, camps of three, call for help). Each still teaches one part of the kit (targeting, DoTs vs armor, kiting, snares, pulling one at a time).

## Dungeon 1: Brother Malrec's chapel (placeholder name)

The zone's only instanced dungeon (Nov 17 change: the crypt is now an open, shared area in the graveyard). Entered from under the ruined chapel's altar, for about levels 14–15 (draft 2 ladder, Nov 18; was 8–10), scaled for one player until multiplayer exists.

- **Locked in, v0.71 (owner, Nov 21):** step a couple of tiles into the Drowned Prior's chamber while he's up and a **portcullis slams down** behind you; the flood then spreads from the middle pool to every wall in about 3 s, so the whole fight is slow wading (you, your pet, him and his dead). His death drains it and lifts the portcullis; dying in there sinks the water back and opens the door for the next try. He carries a faint cold light (his lantern) so he reads in the dark water.
- **Rebuilt in v0.66 (owner, Nov 21; draft 4 maps: one hall on floor 1, the Bellringer first on floor 2; replaces the shape below):** grip: ripples under you for 1.5 s, then a hard slow. **Draft 3 as approved:** middle size, two floors. Floor 1: enter in the catacomb (three packs), west hall (mender camp, chest) and east hall (a big wisp with an area burn) as a loop, then the flooded chamber, the only water, with the Drowned Prior: his grip now **slows you hard** (not a hold); his death drains the flood and opens stairs down. Floor 2: a landing (one small pack), the wisp room (two packs, each with a big wisp that outlives its summoner), Malrec's sanctum. About 10 packs, ~25 mobs plus 3 big wisps, 10–15 minutes. Details in `docs/research/map-design.md` (Dungeon 1 rebuild, draft 3).
- **Shape (owner, Nov 20, replaces the 4-room plan):** bigger and substantial, with a mini boss, but still a **10–15 minute run**: six rooms, a secret loop and an optional named lair, about 23 mobs on the main way, two named fights plus Malrec. Map draft 2: `js/data/maps/dungeon1.js`; brief in `docs/research/map-design.md`.
- **Rooms:** one map walked straight through, north is deeper.
  1. **Chapel nave** (above ground): pews, stained glass, the altar under a red cult cloth; one camp of three (14). Touching the altar opens the stairs down behind it.
  2. **Flooded catacomb:** bone niches and coffins in knee-deep water that **slows everyone, you and the mobs**. Five drowned dead (14). A secret loop round the west wall to a chest in a burial niche.
  3. **Drowned crypts:** narrow burial passages that loop, flooded in patches; four dead (14–15).
  4. **The Drowned Prior (mini boss, 15):** in his flooded crypt chapel. **Grasp of the Deep** (2 s cast): hands rise from the water and hold anyone standing in it; get onto a dry stone plinth.
  5. **The cult's half:** refectory and ritual hall (an ember pit), each with a camp of three that has a **mender** (heals the others: stop it first); a dormitory with a monk in a cage; two ash wisps (15).
  6. **Malrec's sanctum:** Brother Malrec (15; most classes should beat him at 15) on a dais with **two deacons** (15).
  - **Optional: the Bellringer (15)** in the old bell foundry off the catacomb, with two cultists and his own chest. **Toll** (1.5 s wind-up): stuns anyone within reach; step back.
- **Malrec's fight:** he heals his deacons, so deal with them first (kill, root, mez or fear). His big move (owner picked, Nov 20) is **Candle Wake**: each time he loses a sixth of his health a candle round the room flares and an ash wisp drifts slowly toward him; if it reaches him he heals. Kill or snare the wisps (switch targets).
- **Malrec's chest:** like Boss 1's: one named item for your class and one uncommon every time, plus a small rare chance. Then the exit with a run summary.
- **Solo check:** he must stay soloable at the cap (pillar 2). When he's built, the sim checks that most classes beat him at 15 (draft 2 ladder); if not, tune him, not the level.
- **In the game since v0.63:** walk in through the chapel door. Touch the altar to open the stairs. Menders heal their camp (stun or fear the cast), flood water slows everyone, the Prior's Grasp of the Deep (get onto a plinth), the Bellringer's Toll (step back; his chest won't open while he stands), Malrec heals his deacons (Rite of Mending, stoppable) and throws a telegraphed Ash Bolt, and Candle Wake sends candle wisps to heal him. His chest holds one Malrec item for your gear group, one uncommon and a 20% rare; the Prior drops his Cowl, the Bellringer his Band (any class). Then the way out and the run summary, back to the chapel door. Sim (v0.63): a run takes about 8–13 minutes (best-case bots; the Bellringer adds about 1–3), and 8 of 14 classes beat Malrec at 15 (balance chat to tune toward him).
- **The old prototype dungeon:** the instanced crypt with Boss 1 is still in the code (DEV only). Its notes: 13 mobs in five rooms, crypt rats and skeletons (levels 4–6), Boss 1 (level 7) with a shadow bolt about every 7 seconds and two skeletons at half health. The bolt is a **telegraphed 2s cast** (v0.18.3): a purple cast bar shows in the target frame and over its head, and Boss 1 stands still while casting. A stun or fear interrupts it (Evade and Feign Death too); being out of range (110), Deflect or Divine Aura makes it miss. Every boss's big move should follow this rule: seen coming, with a counter, a chest and an exit with a run summary.
- **Placeholder names:** Town 1, Dungeon 1 and Boss 1 stand in until the setting is decided.

## Solo vs group

Every class can solo to level cap. Grouping is never required, just clearly worth it.

- **Group bonus:** extra XP for each group member, plus better loot tables in dungeons.
- **Group-only goals:** one named camp near the top of each zone needs a group. It's optional, but it has the best drops.
- **NPC companion:** hire a companion to fill a missing role, like EverQuest's mercenaries, at reduced strength.
- **Group finder:** queue by role from anywhere and get teleported to the dungeon entrance.

## Progression and builds

The level cap is 30 at launch and gets raised with each expansion; the game is planned as levels 1–50 (31–40 and 41–50 in expansions). Builds come from choices, not from grinding. Leveling is EverQuest-shaped: early levels are quick, then it slows sharply. Pace is set by **kills per level** (v0.34.1): level 1 takes 8 even-level kills, then about 25% more each level (8, 12, 17, 22, 29, 38, 48, 59, 73 to reach 10); the XP needed is worked out from that, and each mob's XP from its level and how tough it is (health with armor, and damage, next to a standard mob). Zone 1 is filled so one clear of an area takes you into its band: in the pace sim (perfect bots) one lap of all four areas takes about half an hour and ends at level 6.4–6.9, Wolfwood's level 8 comes at 70–95 minutes and level 10 at about 3 hours (by class). Real play is slower. Was: level 10 in about 10 hours; owner, Nov 19: an hour per level is too slow, the first try (8 in an hour) a bit fast. Gear, loot and named mobs fill the gaps between dings. This pulls against pillar 1, so every session still needs a clear payoff besides XP. Leaning (Nov 17, not locked): about 60–80 hours of play to level 30, and never more than about 3 sessions without something new. Plan and research: `docs/research/progression-and-retention.md`.

- **Stats:** come from gear. There are no stat points or skill points (decided Nov 18); forks replace them.
- **Forks (decided Nov 18):** no tree before level 10, while players learn their kit. One ability gets its fork (pick one of two versions: two skeletons or one tougher one, a DoT that spreads or stacks) **every 2 levels up to 20 (10, 12, 14, 16, 18), then every 3 (23, 26, 29, then 33, 36, 39, 43, 46, 49)** (owner, Nov 24: keeps the early game fast and stops it getting overwhelming later). Each ability gets one fork; utility like Gate may get none. Past 50: decide later.
- **Majors (decided Nov 18):** at levels 20 and 30 (40 and 50 in expansions), a class-wide pick of three that changes the class's signature mechanic. Level 20 is how you play (solo or group, pet or self); level 30 is your big moment. So by 30: 8 ability forks and 2 majors (10 picks); by 50 about 14 forks and 4 majors, so forks and abilities (13–15 by 50) run out together.
- **Odd levels:** new abilities, rank-ups, and loadout slots 7 (level 15) and 8 (level 25), so every level brings something.
- **Power comes from level, not picks:** both sides of a fork are a little stronger than the base ability and about equal to each other; they differ by situation. Mobs are tuned assuming every player has their forks. Abilities still grow a little every level on their own. No "+5%" options. The sim checks each option; if one wins everywhere, it gets redesigned.
- **Abilities:** EverQuest-style spellbook. **Every class has the same number of abilities at the same levels** (decided Nov 25): 8 by level 8, then new ones at 11, 17, 21 and 27 (12 by 30) and 31, 41 and 47 (15 by 50); one per class has no fork. Long cast-once buffs become always-on class traits (Clarity, Spirit Ward). Each class learns these, with similar abilities merged into fork options, but can only have 6–8 of them loaded at a time (6 slots at level 1, a 7th at 15, an 8th at 25). The loadout is the build: two players of the same class can play very differently.
- **Swapping:** forks, majors and loadouts can be changed free in town, so experimenting costs nothing.
- **Gear:** 8 slots (head, chest, legs, feet, hands, weapon, off-hand, ring), with drops from camps, named mobs and dungeon bosses, in rarity tiers (junk, common/white, uncommon/green, rare/blue, named/pink). Loot is personal and goes straight to your bags. **Drops are sparse (v0.97, owner Nov 27):** normal mobs drop gear about 1 kill in 30, blues are a highlight, **pinks only from named and bosses** (about 1 kill in 4–5 on average, with bad-luck protection), the first kill of each named is always blue or better, and **Brother Malrec's chest offers three items: pick one**. **Weapons drop by your class's weapon type, armour by gear group; every rare mob drops its own blue, and a pink or a rare's own item you already own never drops again (v0.119).** **Wear:** each death wears every worn item 10%; at 100% it gives no stats until repaired at any campfire (until Town 1). Numbers in `LOOT` (`js/data/items.js`). Stats: STA +3 HP, WIS +3 mana, INT +2% spell damage and healing, AC softens incoming hits. No gear score gates.
- **Pink tricks (v0.124, owner Nov 27):** every pink does one small trick on top of its stats (weapons: one per class holding it; named items: one for everyone), tiny in Zone 1. **Longevity:** each trick is one of a kind (later items never repeat it) and never shrinks as you level, and situational tricks (water, stuns, wolves, rats) become real picks in later zones built around those things, so the choice later is more stats or this trick: a build decision, never a must-have. Rings and small slots are where old pinks live on. **Jewelry:** one ring and one necklace (owner: two rings are a chore); necklaces run a little stronger.
- **Weapons by class (decided Nov 27):** staff (Wizard, Necromancer), scepter (Magician, Enchanter), crook (Druid), spear (Shaman), sword (Warrior, Shadow Knight), mace (Cleric, Paladin), rapier (Bard), dagger (Rogue), bow (Ranger). Monks use no weapons (fists only). Your equipped weapon shows in your hand; its look follows its power tier (`docs/area-rules.md`, Weapon looks).
- **Enchanting (v0.100, owner Nov 27):** every gear item goes +1 to +5, each step a sure +2% of its stats (+10% at +5: small, felt through the look: +N name, glow at +3 and +5). One Enchant Orb plus a growing copper fee per step, at a campfire until Town 1's forge exists. Orbs are rare drops (named, rares, chests, Malrec always); unwanted gear breaks into orb dust (40 dust = 1 orb); orbs can be bought for about an hour of copper; an enchant can be moved onto a new item of the same slot for copper.
- **Alts:** an account-wide bank and cosmetic unlocks make leveling a second class feel good.

**Spellbook rules**

- Swap loaded abilities out of combat only, with a short load time (a few seconds, not EverQuest's long memorizing).
- Save loadout presets, such as solo, group and raid, and switch with one tap out of combat.
- Higher ranks replace lower ones (Minor Heal becomes Heal), so the book stays at 10–15 meaningful choices instead of filling with obsolete versions.
- Some abilities are rare drops or quest rewards, not trainer purchases, which gives camps and named mobs another reason to exist.

## Social and economy

Social features ship at launch. Economy features wait until there are real players to tune them against.

- **Chat:** zone, group, guild and whisper channels, plus quick-chat phrases ("Inc!", "OOM", "LFG") so typing on a phone is optional.
- **Guilds:** at launch, with a roster and guild chat. A shared guild bank comes later.
- **Trading:** face-to-face trades at launch. An auction house comes after the MVP.
- **Crafting:** deferred until after the MVP.

## Monetization

The plan for now is free to play, with paid extra bank and inventory space. Server costs are ongoing, so the game needs income, and storage is convenience rather than combat power. Keep free storage generous so paid space never feels required.

| Model | Upside | Downside |
| --- | --- | --- |
| Free + cosmetic shop | Most players, standard on mobile | Needs a steady flow of new cosmetics |
| One-time purchase | Simple and honest | Much smaller player base on mobile |
| Optional QoL subscription | Predictable income | Extra bank or slots can feel pay-to-win |

**Never:** selling power, XP boosts or loot boxes. Loot boxes are also legally restricted in some countries.

## Tech plan

Use off-the-shelf tools wherever possible. Writing a custom engine like Dreadmyst's is the hard road, and most of the effort should go into the game itself.

| Layer | Choice | Why |
| --- | --- | --- |
| Prototype | HTML5 canvas game, plain JS files with no build step (`index.html`, `css/`, `js/`) | Plays on any phone browser, no installs; hosted free on GitHub Pages |
| Long-term engine | Stay on web (Phaser + Capacitor for app stores) or move to Godot 4 | Decide after the prototype proves the combat is fun |
| Game server | Nakama (or Colyseus) | Open source; handles accounts, chat, groups and server-authoritative logic |
| Database | PostgreSQL | Built into Nakama's standard setup |
| Hosting | One small cloud server to start | Scale up only once there are players |
| Art | Original pixel art, 12×16 sprites, plus CC0 packs | Dark 2D pixel style (Dreadmyst meets Diablo 2 and Vampire Survivors); no license fees |

The server decides all combat results, never the phone. That's the main defense against cheating.

## MVP scope and roadmap

The MVP is one hub, three zones, two dungeons and six classes up to level 30. Each phase has to pass its gate before the next one starts.

1. **Design doc** (weeks 1–2): pillars, classes, core loop.
2. **Solo prototype** (months 1–4): 1 zone, 1 class (Druid), single-player. Gate: combat feels fun.
3. **Online slice** (months 4–8): Nakama server, 4-player dungeon. Gate: 4 friends clear a dungeon.
4. **Closed alpha** (months 8–12): 20 testers, 6 launch classes. Gate: testers return weekly.
5. **Soft launch** (month 12+): public on iOS and Android.

All durations are rough estimates for a part-time solo developer. If the solo prototype isn't fun, the fix is changing the design, not adding multiplayer. That's why it comes first.

## Open questions

- [ ] Working title and setting: dark and cursed like Dreadmyst, or classic high fantasy like Norrath?
- [ ] Final monetization model
- [ ] Solo project, or bring in an artist or programmer?
- [ ] Is PvP in scope, for example an arena like Dreadmyst's?

## Ideas backlog

See `board.md`.

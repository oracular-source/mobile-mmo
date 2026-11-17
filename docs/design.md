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
| Death has weight | EverQuest | Death costs XP and time, never your gear |
| Small, finished scope | Dreadmyst | Six launch classes and a few zones, polished before adding more |
| Build customization | Dreadmyst | Stat points and ability loadouts as you level |
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
| Paladin | Tank | Lay on hands | Heals, stuns, bonus vs undead | Less durable than Warrior, lower damage | Later |
| Shadow Knight | Tank | Lifetaps | Fear, small undead pet, solos well | Less durable than Warrior | Later |
| Cleric | Healer | Resurrection | Best heals, the only full rez | Very low damage, slow solo | Yes |
| Druid | Healer | Root and kite | DoTs, snares, group teleports, great outdoor solo | Weaker heals, fragile, struggles indoors | Yes |
| Shaman | Healer | Slow | Slows, buffs, DoTs | Low burst damage | Later |
| Wizard | Caster | Burst nukes | Highest burst, emergency group teleport | Burns mana, pulls aggro, dies fast | Yes |
| Magician | Caster | Elemental pet | Strong pet, summons gear for the group | Helpless if the pet dies | Later |
| Necromancer | Caster | Undead pet + feign death | Best soloer: DoTs, lifetaps, pet | Slow group damage, can't heal others | Yes |
| Enchanter | Caster | Mez and charm | Crowd control, haste, mana regen | Fragile, hardest to play | Later |
| Rogue | Melee | Backstab | Top melee damage, stealth, traps, locks | Needs a tank, weak solo | Yes |
| Monk | Melee | Feign death pulls | High damage, best puller | Light armor only | Later |
| Ranger | Melee | Bow + tracking | Ranged damage, snares, can tank in a pinch | Best at nothing | Later |
| Bard | Support | Songs | Group buffs, crowd control, run speed | Low personal power | Later |

Bard songs and Enchanter crowd control need touch-specific controls, such as a song playlist that cycles automatically. That's one reason both come after launch.

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

**Rank upgrades** replace earlier versions instead of taking book space: Thornlash II at 12, Mending Touch II at 16, Rootgrip II at 24.

**Prototype scope:** levels 1–10 in Zone 1 only need the first 7 abilities. Snare comes before root on purpose: it's the safer kiting tool, and root is the stronger upgrade. Creeping Rot comes at level 2 so armored beetles are beatable early. The full DoT, snare and nuke loop is available by level 3. Default loadout: center Thornlash, then clockwise from up: Mending Touch, Tanglefoot, Creeping Rot, Rootgrip, Barkskin.

## Combat

Tab-target combat is the core mobile bet. It plays well on touch, and it handles lag on cell networks much better than action combat. EverQuest is inspiration for spells and skills, not a rulebook.

### Level difference and resists

Level difference is the main source of danger, like EverQuest. A mob two or more levels above you should feel deadly.

- **Resists:** every targeted spell can be resisted, at any level. Even-level mobs resist about 5% of the time, plus 10% for each level they're above you, down to 2% for much lower mobs. A resist still costs the mana. There are no fizzles.
- **Durations:** roots, snares and DoTs last longer on lower-level mobs and shorter on higher ones (15% per level, between 25% and 150% of normal).
- **Harder hits:** mobs above your level hit 15% harder per level; lower ones hit a little softer.
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
| Zone 1 | 1–10 | Outdoor, shared | Tutorial camps, few roaming threats |
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

A blighted marsh-wood just outside the hub city. Each mob teaches one part of the Druid's kit, so the zone doubles as the tutorial. The name is a placeholder until the setting is decided.

Mobs are spread out by level: only level 1–2 near the gate, 2–3 further down the road, 3–5 in the graveyard. The gate camp has two guards, Marrow the Peddler with a campfire that doubles resting speed, wall torches, a signpost, and ambient life (crows, frogs, fireflies).

Layout: Hub city → Gate Road (1–3) → either Sunken Graveyard (3–5) or Wolfwood Edge (4–7) → The Mire (6–9) → Ruined Chapel (7–10, zone finale).

| Mob | Level | Area | Behavior | What it teaches | Drops |
| --- | --- | --- | --- | --- | --- |
| Grave rat | 1–2 | Gate Road | Aggressive, weak | Basic targeting and nukes | Rat whiskers (vendor) |
| Mire beetle | 2–3 | Gate Road | Slow, heavily armored | DoTs beat armor | Beetle shell (crafting later) |
| Shambling dead | 3–5 | Sunken Graveyard | Very slow; social in pairs | Kiting: root, DoT, walk away | Bone charms, coin |
| Blight wolf | 4–7 | Wolfwood Edge | Fast, packs of 2–3, flee at low health | Snare and root, or they run and bring friends | Pelts, fangs |
| Bog wisp | 5–7 | The Mire | Floats, so roots don't hold; ranged shadow bolt; night only | Adapting when your main tool fails | Wisp essence |
| Bog lurker | 8–10 | The Mire, roaming | Hits hard, regenerates unless a DoT is ticking | Keep DoTs up; respect roamers | Lurker hide, rare gear |
| Fen cultist | 6–10 | Ruined Chapel | Camps of 3; casters and melee; call for help | Pulling one at a time | Coin, robes, cult notes (quest) |

**Named mobs** (soloable, first taste of rare spawns)

| Named | Level | Spawn | Fight | Drop |
| --- | --- | --- | --- | --- |
| Old Gnawbone | 4 | Replaces a graveyard rat, about 20-minute timer | Big rat, summons 2 rats at half health | Gnawed Ring (+STA) |
| Greyfang | 7 | Leads a wolf pack, about 30-minute timer | Never flees; howls to call the pack back | Greyfang Cloak (+AGI, small run speed) |
| Brother Malrec | 10 | Chapel altar, about 45-minute timer | Heals his cultists; kill or root his guards first | Malrec's Censer (off-hand, +WIS) |

## Solo vs group

Every class can solo to level cap. Grouping is never required, just clearly worth it.

- **Group bonus:** extra XP for each group member, plus better loot tables in dungeons.
- **Group-only goals:** one named camp near the top of each zone needs a group. It's optional, but it has the best drops.
- **NPC companion:** hire a companion to fill a missing role, like EverQuest's mercenaries, at reduced strength.
- **Group finder:** queue by role from anywhere and get teleported to the dungeon entrance.

## Progression and builds

The level cap is 30 at launch and gets raised with each expansion. Builds come from choices, not from grinding. Leveling is EverQuest-shaped: early levels are quick, then it slows sharply. Target: level 2 in about 10 minutes, level 5 in about 1.3 hours, level 10 in about 10 hours. Gear, loot and named mobs fill the gaps between dings. This pulls against pillar 1, so every session still needs a clear payoff besides XP.

- **Stats:** every level gives 3 points to spend on STR, STA, AGI, INT or WIS.
- **Abilities:** EverQuest-style spellbook. Each class learns 15–20 abilities by level 30 but can only have 6–8 of them loaded at a time (6 slots at level 1, a 7th at 15, an 8th at 25). The loadout is the build: two players of the same class can play very differently.
- **Respec:** cheap respecs in town, so experimenting is encouraged.
- **Gear:** 8 slots (head, chest, legs, feet, hands, weapon, off-hand, ring), with drops from camps, named mobs and dungeon bosses, in rarity tiers (junk, common, uncommon, rare, named). Loot is personal and goes straight to your bags. Stats: STA +3 HP, WIS +3 mana, INT +2% spell damage and healing, AC softens incoming hits. No gear score gates.
- **Alts:** an account-wide bank and cosmetic unlocks make leveling a second class feel good.

**Spellbook rules**

- Swap loaded abilities out of combat only, with a short load time (a few seconds, not EverQuest's long memorizing).
- Save loadout presets, such as solo, group and raid, and switch with one tap out of combat.
- Higher ranks replace lower ones (Minor Heal becomes Heal), so the book stays at 15–20 meaningful choices instead of filling with obsolete versions.
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
| Prototype | Single-file HTML5 canvas game (`index.html`) | Plays on any phone browser, no installs; hosted free on GitHub Pages |
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

See `docs/ideas.md`.

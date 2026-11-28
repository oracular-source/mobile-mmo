# Status: where every lane is right now

**Read this first.** Updated on every push and copied into the claude.ai Project on every push (the bigger docs at least every 3 pushes), so a chat that can't reach GitHub still knows the current state. The full detail lives in `docs/board.md`.

**Live version: v0.150** (Nov 27, 2026). Game: https://oracular-source.github.io/mobile-mmo/

## Lanes: last shipped → next pickup
| Lane (start phrase) | Last shipped | Next pickup |
| --- | --- | --- |
| **Animation** ("Connect to GitHub. Continue on animation"): enemy attacks, deaths, boss moves | v0.149 the Bellringer's clapper stays upright on the slam; v0.147 enemies cast with their bodies: cast poses for all 11 caster moves; v0.141 cultist deaths; v0.134 beetles, boar, ash wisp and cultists attack and die | Owner looks at v0.149 and v0.134 on the phone; then the other wisps and cultists reuse the moves, then Old Gnawbone's boss move |
| **Multiplayer** ("… Continue on multiplayer"): two players, phone to phone | v0.150 step 2: shared monsters in normal areas (host's phone runs them), kills count for both (full XP each), group scaling on by itself, tap your partner to heal them; v0.136 step 1: see each other, chat | Owner and wife try step 2 on the phones (one on mobile data). Then **step 3**: playing together everywhere (Dungeon 1 as a group, buffs on your partner, see pets, follow between areas, boss specials aim at both) |
| **Items** ("… Continue on items"): drops, boss loot, enchanting, gold | v0.146 chests refill hourly (was 10 min); v0.144 climb with gear sim (review page "Zone 1 climb with gear"); v0.131 one pink per boss | **Parked (owner: enough items for now).** Reopens with notes from the owner's full Zone 1 playthrough |
| **Map** ("… Continue on map"): maps, tiles, area art | v0.148 **Town 1 draft 2**: round and cozier, the wizard's stable and a paddock of horses (DEV → Teleport → Town 1 (draft) only); v0.143 Town 1 buildings drawn, Dungeon 1 censers and pool fixed; v0.140 Dungeon 1 stairs out and love pass | **Owner reviews Town 1 draft 2 on the phone**, then the **Town 1 build**: townsfolk at their stations, services move from campfires to them, open the crossroads gate, start in town |
| **Character** ("… Continue on character animations"): player bodies and attack poses | v0.145 Zone 1 gear brighter, a real upgrade (all 14); v0.142 Zone 1 gear shows; v0.135 staff glow sized by mana (instant spells too); v0.133 channel glow calmer; v0.130 channel glow on cast-time spells; v0.121 weapons in your hand (owner OK'd) | **Gear looks across the whole game** (armour showing + weapon scope): owner decided: body stays 15 × 18 and gear grows the outline, chest and head show in Zone 1, weapon colours stay for now. Owner decided one look step per zone. Zone 1 gear v0.145 (brighter class colours, owner OK'd): owner looks on the phone; Zone 2's look comes with Zone 2's items. Then the card **Hits that grow with damage** (one scaling system for swing impacts) |
| **Spells** ("… Continue on spells"): player spell looks | — | Big spells as a setting (My spells: Big / Classic), then spells that grow with rank |
| **Balance** ("… Continue on balance"): class and mob numbers, sim | — | **Next lane up (owner, Nov 27).** Gear is in a sim (`runClimb`, `tools/climb.py`). Keep tests light (owner). Fix the obvious ones: Bard (~16 h to Malrec; owner's idea: one or two enemies at a time, no kiting at level 1, a bit stronger), Cleric 15.8 h, Paladin 10.7 h; Wizard can't beat Malrec without gear; caster gear worth little; then Malrec's finale for all 14 |
| **Skill tree** ("… Continue on skill tree"): design only for now | — | Owner approves the every-class-to-8 draft; build waits until Balance is idle |
| **Optimization** ("… Continue on optimization") | v0.104 fear wanders | Out of cards; waiting on the owner |

## Open owner decisions
- Mounts / Zone 2: basic mount around level 10 / hour 10–11 (maybe mid Zone 2), auto-mount out of combat; Zone 2 levels 15–18 or 15–22 still open.
- Design talk (new card): faster climb, maybe level 100, zones built from a kit.
- Character: phone look at Zone 1 gear (v0.145); still open: weapon pace, shields, capes; later how hits should scale with damage.

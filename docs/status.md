# Status: where every lane is right now

**Read this first.** Updated on every push and copied into the claude.ai Project on every push (the bigger docs at least every 3 pushes), so a chat that can't reach GitHub still knows the current state. The full detail lives in `docs/board.md`.

**Live version: v0.145** (Nov 27, 2026). Game: https://oracular-source.github.io/mobile-mmo/

## Lanes: last shipped → next pickup
| Lane (start phrase) | Last shipped | Next pickup |
| --- | --- | --- |
| **Animation** ("Connect to GitHub. Continue on animation"): enemy attacks, deaths, boss moves | v0.141 cultists, menders and deacons die three ways at random; v0.134 beetles, boar, ash wisp and cultists attack and die for real. **Draft (not in game): "Mob cast poses draft 1"**: all 11 caster moves | Owner's notes on the cast poses draft (and v0.134 on the phone); then build the cast poses, the other wisps and cultists reuse the moves, then Old Gnawbone's boss move |
| **Multiplayer** ("… Continue on multiplayer"): two players, phone to phone | v0.138 joining shows its steps and a reason when stuck (first try stuck on same Wi-Fi); v0.136 step 1: see each other (Menu → Group, Host / Join, chat); group scaling numbers | Works on mobile data (same Wi-Fi fails: relay card, later). **Next: step 2, shared mobs + heal your partner** (owner said go; not while Balance is building) |
| **Items** ("… Continue on items"): drops, boss loot, enchanting, gold | v0.144 **climb with gear** sim (review page "Zone 1 climb with gear"): 5.2 bot h to Malrec at level 14; blues ~4/h, chests out-drop mobs, Ironshell gives everyone's first blue, orbs and copper plentiful; v0.131 one pink per boss; v0.128 necklace slot | **Owner picks item fixes 1-4** from the review page and gives his own Zone 1 time; tell Balance before building; teleport orbs on the back burner |
| **Map** ("… Continue on map"): maps, tiles, area art | v0.143 Town 1 buildings drawn (DEV → Teleport → Town 1 (draft) only), Dungeon 1 censers and pool fixed; v0.140 Dungeon 1 stairs out and love pass | **Town 1 build**: townsfolk at their stations, services move from campfires to them, open the crossroads gate, start in town |
| **Character** ("… Continue on character animations"): player bodies and attack poses | v0.145 Zone 1 gear brighter, a real upgrade (all 14); v0.142 Zone 1 gear shows; v0.135 staff glow sized by mana (instant spells too); v0.133 channel glow calmer; v0.130 channel glow on cast-time spells; v0.121 weapons in your hand (owner OK'd) | **Gear looks across the whole game** (armour showing + weapon scope): owner decided: body stays 15 × 18 and gear grows the outline, chest and head show in Zone 1, weapon colours stay for now. Owner decided one look step per zone. Zone 1 gear v0.145 (brighter class colours, owner OK'd): owner looks on the phone; Zone 2's look comes with Zone 2's items. Then the card **Hits that grow with damage** (one scaling system for swing impacts) |
| **Spells** ("… Continue on spells"): player spell looks | — | Big spells as a setting (My spells: Big / Classic), then spells that grow with rank |
| **Balance** ("… Continue on balance"): class and mob numbers, sim | — | Tune Malrec's finale for all 14. **Gear is in a sim now** (v0.144 `runClimb`). Fix the obviously broken classes without over-testing (owner): Bard (~16 h, owner's idea: one or two enemies at a time, no kiting at level 1, a bit stronger), Cleric 15.8 h, Paladin 10.7 h; Wizard can't beat Malrec naked; caster gear worth little |
| **Skill tree** ("… Continue on skill tree"): design only for now | — | Owner approves the every-class-to-8 draft; build waits until Balance is idle |
| **Optimization** ("… Continue on optimization") | v0.104 fear wanders | Out of cards; waiting on the owner |

## Open owner decisions
- Items / Zone 2 (review page "Zone 1 climb with gear"): your own time to Malrec; mount timing; Zone 2 levels 15-18 or 15-22; which item fixes 1-4.
- Animation: notes on "Mob cast poses draft 1" (keep / change / skip each; glow size; release flash).
- Design talk (new card): faster climb, maybe level 100, zones built from a kit.
- Character: phone look at Zone 1 gear (v0.145); still open: weapon pace, shields, capes; later how hits should scale with damage.

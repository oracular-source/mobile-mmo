# Status: where every lane is right now

**Read this first.** Updated on every push and copied into the claude.ai Project on every push (the bigger docs at least every 3 pushes), so a chat that can't reach GitHub still knows the current state. The full detail lives in `docs/board.md`.

**Live version: v0.142** (Nov 27, 2026). Game: https://oracular-source.github.io/mobile-mmo/

## Lanes: last shipped → next pickup
| Lane (start phrase) | Last shipped | Next pickup |
| --- | --- | --- |
| **Animation** ("Connect to GitHub. Continue on animation"): enemy attacks, deaths, boss moves | v0.141 cultists, menders and deacons die three ways at random; v0.134 beetles, boar, ash wisp and cultists attack and die for real. **Draft (not in game): "Mob cast poses draft 1"**: all 11 caster moves | Owner's notes on the cast poses draft (and v0.134 on the phone); then build the cast poses, the other wisps and cultists reuse the moves, then Old Gnawbone's boss move |
| **Multiplayer** ("… Continue on multiplayer"): two players, phone to phone | v0.138 joining shows its steps and a reason when stuck (first try stuck on same Wi-Fi); v0.136 step 1: see each other (Menu → Group, Host / Join, chat); group scaling numbers | Works on mobile data (same Wi-Fi fails: relay card, later). **Next: step 2, shared mobs + heal your partner** (owner said go; not while Balance is building) |
| **Items** ("… Continue on items"): drops, boss loot, enchanting, gold | v0.131 one pink per boss (Skeleton King: weapon; Greyfang: ring; Ironshell: bracers), Malrec two pinks: his chest gives one at random plus a blue, no repeats; v0.128 necklace slot; v0.124 pink tricks | Owner plays with the new gear and runs balance checks; teleport orbs on the back burner (owner: wait for a bigger world and the mounts); later: dungeon tiers with stronger pinks |
| **Map** ("… Continue on map"): maps, tiles, area art | v0.140 Dungeon 1: stairs rise behind Malrec's altar after the finale (the way out), quick love pass on both floors; v0.132 Ironshell's pond corner | **Town 1**: small Diablo-style hub, everyone round one square, wizard gives the main quest through an orb. Draft 1 map drawn, owner to review |
| **Character** ("… Continue on character animations"): player bodies and attack poses | v0.142 Zone 1 gear shows (chest and head dye your clothes and hat); v0.135 staff glow sized by mana (instant spells too); v0.133 channel glow calmer; v0.130 channel glow on cast-time spells; v0.121 weapons in your hand (owner OK'd) | **Gear looks across the whole game** (armour showing + weapon scope): owner decided: body stays 15 × 18 and gear grows the outline, chest and head show in Zone 1, weapon colours stay for now. Owner decided one look step per zone. Zone 1 gear is in the game (v0.142): owner to look and give colour notes (review page "Zone 1 gear looks"); Zone 2's look comes with Zone 2's items. Then the card **Hits that grow with damage** (one scaling system for swing impacts) |
| **Spells** ("… Continue on spells"): player spell looks | — | Big spells as a setting (My spells: Big / Classic), then spells that grow with rank |
| **Balance** ("… Continue on balance"): class and mob numbers, sim | — | Tune Malrec's finale for all 14; put gear in the sim; time the climb to Malrec |
| **Skill tree** ("… Continue on skill tree"): design only for now | — | Owner approves the every-class-to-8 draft; build waits until Balance is idle |
| **Optimization** ("… Continue on optimization") | v0.104 fear wanders | Out of cards; waiting on the owner |

## Open owner decisions
- Animation: notes on "Mob cast poses draft 1" (keep / change / skip each; glow size; release flash).
- Design talk (new card): faster climb, maybe level 100, zones built from a kit.
- Character: colour notes on Zone 1 gear (v0.142); still open: weapon pace, shields, capes; later how hits should scale with damage.

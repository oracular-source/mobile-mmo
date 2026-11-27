# Gold, items and teleport orbs (research, Nov 19)

Deep dive for the "Items and gold rethink" card on the board. Must be settled before Zone 2. Nothing here is built yet; the owner picks.

## The owner's brief (Nov 19)
- Buying and selling items is convoluted and a time sink: less killing, not straightforward.
- Gold should go to **one thing that keeps making you stronger** and keeps the system going.
- Idea: **orbs that enchant gear**, small upgrades each, tiers matched to gear tiers; a weaker orb still works on better gear but upgrades it less; maybe merge small orbs into bigger ones.
- Second pass: **not unlimited** (that would be farmable forever); make orbs **rarer** instead.
- New idea: **teleport orbs** that drop from monsters, so moving around the world is another reason to kill.
- Rule over everything: no system should take time away from fighting.

## Where the game is today
- Every kill gives a little copper (level + 0–2). Hidden chests give 20–35. Junk (whiskers, shells, bones, pelts) sells to Marrow for 1–7 each; gear can be sold too.
- **Copper buys nothing.** There is no shop, no repair, no upgrade. So right now gold has no job at all, and selling junk is a walk to Marrow for a number that doesn't matter.
- Gear drops are personal, by rarity (common, uncommon, rare, named). 8 slots. Death costs 10% XP.
- So we're starting clean: nothing to undo, no economy to protect.

## What other games do (and what we take from each)

**Path of Exile: the orbs are the money.** There's no gold for trading; every currency is a consumable that changes an item, and trade prices are counted in those same orbs. GGG's reasoning: when gold is easy to get, players stop valuing it and barter with items instead; and when the money is used up as it's spent, you don't need fake gold sinks like repair bills. Their own later lesson: the Chaos Orb became the trade unit and lost its crafting identity, and PoE 2 brought gold back for NPC purchases.
*Take:* orbs that drop from kills and get used up on gear are a proven, self-balancing loop. *Avoid:* dozens of orb types and random rerolls; that's a spreadsheet game, not a phone game.

**WoW (Dragonflight crests): a fixed upgrade track with a cap.** Every item has a short track (e.g. 1/6 → 6/6); each step costs an upgrade currency matched to the item's tier. Crests were capped per week, and anything earned past the cap came as the lower tier instead, so effort never fully wasted. Later patches let players trade low crests up into higher ones (90 low → 15 high, a 6:1 ratio). Complaint: replacing an upgraded item felt like throwing away the upgrades.
*Take:* a short, visible track per item, tier-matched currency, and merging small into big (the owner's merge idea already exists and works). *Avoid:* weekly caps (we're a solo phone game; caps punish binge sessions).

**Last Epoch: each item has a limit (forging potential).** Every crafting step uses some of the item's potential; at zero the item is finished. Rarer items start with more. Players argue the limit makes much loot feel useless, so the devs softened it: the last craft always succeeds.
*Take:* a per-item limit is the cleanest way to stop "unlimited" without a weekly cap. *Avoid:* making the limit random or harsh.

**Diablo 4 masterworking: what not to do.** Upgrades cost huge piles of gold plus one bottleneck material (Obducite), and one season pushed a single crafting step from 50,000 to 1,000,000 gold; Blizzard had to hotfix the cost down. Gold got piled on as the brake.
*Take:* don't make gold the main brake on power; it turns into a grind and a balance fire. *Avoid:* a single rare material that everything waits on.

**Lost Ark honing and MapleStory Star Force: chance to fail or break.** Lost Ark adds a pity meter (Artisan's Energy) that guarantees success after enough fails. MapleStory items could drop stars or be destroyed, and a scandal over hidden odds caused a mass player revolt; players have long asked for destruction to go.
*Take:* nothing. *Rule:* **no failure, no downgrade, no destruction.** Every orb used is a sure upgrade. That also keeps us far from anything that looks like gambling, which matters for a game that sells nothing but bag space.

**Diablo 3 Blood Shards: a currency with one job.** Shards come from rift runs and are spent only at one gambler NPC; you spend them after every run because they can't stockpile much.
*Take:* a currency with exactly one use is easy to understand. *Avoid:* the gamble.

**Vampire Survivors: gold buys permanent stat boosts.** Gold from runs buys account-wide power-ups, and refunds are free, so players experiment.
*Take:* "gold → small permanent power" is a satisfying, zero-hassle loop and fits the owner's "one thing that keeps you stronger."

**Diablo 2 and OSRS: teleports as items.** D2 town portal scrolls drop from monsters or are cheap at vendors; waypoints, once found, are free forever. OSRS teleport tablets are stackable, single-use spells you can buy or make. D3 dropped scrolls in the end, because a cheap item you always have is just a button with extra steps.
*Take:* teleport orbs work if they're **rare enough to matter** and **free travel (waypoints) still exists** for the basics. *Avoid:* orbs so common they're just a tax.

## What the research says, in short
1. The best loops turn kills straight into power with no middle step (PoE orbs, Survivors gold). Selling junk to a shop is the middle step the owner wants gone.
2. "Unlimited" is solved by a **limit on each item**, not by making orbs rare alone. Rarity sets the pace, the item limit sets the ceiling.
3. Sure upgrades feel good; failure, downgrades and destruction cause the biggest player anger in the genre.
4. Merging small currency into big currency is common and liked.
5. Losing upgrades when gear changes feels bad; let some of it carry over.
6. Gold needs one clear job. If it's also the brake on power, it becomes the grind.

## Options

**A. Orbs only, no gold.** Kills drop orbs (rare); orbs upgrade gear; copper is removed. Simplest, but loses the satisfying "coins from every kill," and phase 3 trading would have no small change.

**B. Orbs do the power, gold does the small jobs (Claude's lean).**
- **Enchant orbs** drop from kills: rare from normal mobs, more likely from named, rares and bosses, never sold. They're the pace of power.
- **Every item has an enchant track**, e.g. **+1 to +5** (rarer gear later gets a longer track). Each orb is a sure +1: a small boost to the item's main stats (about +5% each, so +5 = about +25%; tuned in the sim). Nothing fails, nothing breaks. The track is the ceiling, so it's never unlimited.
- **Orb tiers match gear tiers** (owner's idea): a Zone 1 orb gives a full step on Zone 1 gear and a **half step** on higher-tier gear. Zone 2 orbs drop in Zone 2.
- **Merge 3 small orbs into 1 bigger** one (WoW-style trade-up), so old-zone orbs keep their value.
- **Gold's one job: the forge.** A small copper fee per enchant and per merge, plus **moving enchants to a new item** of the same slot (carry the levels over, pay copper). So upgrading a weapon never feels wasted. Copper stays the "something every kill" drip; orbs stay the real prize.
- **Junk stops being a chore:** junk turns into copper the moment you pick it up (no Marrow trip). Marrow becomes the forge/enchanter. Gear you don't want can be **broken down into orb dust** (a little toward a small orb) instead of sold.

**C. Gold buys power directly (Survivors style).** Spend copper at the forge for permanent +stat steps, no orbs. Very simple, but every kill becomes the same small number, and it's easy to farm forever unless capped hard.

## Teleport orbs (new idea)
- **What:** a stackable item that drops from monsters (rare; more from named). Use one to jump to any **campfire or waypoint you've already found**.
- **Fits with existing cards:** waypoints (free zone travel after beating a zone's first dungeon) stay the free backbone; teleport orbs cover what waypoints don't: before you've beaten the dungeon, or straight to a spot that has no waypoint. Class travel (Wizard Gate, Druid circles) stays flavour on top.
- **Keep them meaningful:** rare enough that you think before using one (D3 lesson); a stack limit in bags (bag space is what the game sells, so don't make orbs eat it unfairly: give them their own small pouch).
- **Optional gold job:** Marrow could also sell teleport orbs at a high copper price as a backup, so gold has a second small use. Owner's call.
- **Pillar check:** helps short phone sessions (rule 1) and gives another reason to kill. No issue.

## Guardrails (from the game rules)
- No failure, downgrade or destruction; no hidden odds; nothing that resembles a loot box (monetization rule).
- Never sell orbs, copper or teleports for real money.
- Enchanting happens in one tap at the forge or from the character screen strip; no mini-game.
- Upgrades stay small next to levels and forks, so class roles still decide fights (rule 3).
- The sim gets an "enchanted gear" check so +5 gear can't break Boss 1 / Brother Malrec tuning.

## Questions for the owner
1. Option A, B or C? (Claude leans B.)
2. Track length: +5 per item to start?
3. Should enchanting be anywhere (from the character screen) or only at a forge NPC in town/camp?
4. Teleport orbs: drop-only, or also buyable from Marrow at a high price?
5. Keep selling unwanted gear for copper, or replace it with breaking gear down into orb dust?
6. Phase 3 (later): can orbs be traded between players?

## Owner's answers (Nov 19, second pass)
- **Track:** +5 per item to start.
- **Where:** enchanting happens at a **forge in town** (you go back to town to do it; until Town 1 exists, the crossroads camp stands in).
- **Teleport orbs:** drop from monsters **and** can be bought.
- **Unwanted gear:** breaks down into **orb dust** (duplicates give a lot). No selling gear for copper.
- **Gold's jobs:** forge fees, plus **orbs for sale at a very high price** as a backstop, so bad luck never leaves you grinding with no orbs at all.
- **Trading (decided, Nov 19, later reply):** orbs are **tradable between players** (phase 3). If player trading is popular enough, **the shop orbs go away** and players supply each other. Gear and dust stay bound (Claude's lean below, not objected to).
- **Trading (first thought):** undecided. Owner's thought: trade orbs only, no gear trading, gear breaks down into dust. Worry: items might feel like grind fodder, and players want things to spend gold on.

### Claude's view on trading (for phase 3; nothing to build now)
- **Lean: orbs tradable, gear bound to whoever looted it, dust bound.** Orbs are small, all the same and easy to price, so a player market for them is simple and gives gold a second use (buy orbs from other players below the shop price). Bound gear keeps loot personal (it's already personal loot) and stops gear farmers.
- **The shop price is the ceiling.** Because the forge always sells orbs at a fixed high price, no player can charge more than that, and gold never becomes worthless: there's always something to turn it into until your gear is +5. New zones bring new gear and new orb tiers, so the sink refills.
- **Items keep their meaning through what they do, not their price.** A named ring with its own effect is worth chasing because of the effect; enchanting multiplies the base item, so a better base is still the real upgrade. Duplicates and outgrown gear go to dust.
- **Gold uses, all in one place:** forge fees, shop orbs, shop teleport orbs, moving enchants to new gear, and later cosmetic extras (like dye colours) that are looks only. Never bank space for gold (that's what the game sells for real money).
- **Risk to watch:** if shop orbs are too cheap, gold becomes power you can grind without fighting new things. Keep the shop price well above what a normal session earns (e.g. one shop orb ≈ an hour of copper), and tune in the sim.

## Items lane, draft 1: drops that feel good (Nov 27)

**Owner's brief (Nov 27):** items don't *feel* like anything yet. Too many drops; blues and pinks should be saved for real moments; you shouldn't be in full pink by the end of the first run. Gear should feel sparser. Work out boss drops (loot stays personal), how enchanting works, and what gold does.

**Where the game is today (v0.92, `rollLoot` in `js/combat.js`):**
- Every kill: 60% junk; about 11–15% a white (common); about 3–5% a green (uncommon), doubled in the rat tunnel and crypt; 1% a blue (rare) from level 4 mobs (3% in the tunnel and crypt).
- **Every named always drops a pink:** Old Gnawbone (ring), Greyfang (ring), the Skeleton King (one of his items), the Drowned Prior (cowl), the Bellringer (ring), Malrec (weapon), plus a green 50–100% of the time. That's **6 pinks guaranteed in one lap of Zone 1**, and there are only 8 gear slots. This is why it feels like full pink by the end of the first run.
- A rare mob always drops a green, 25% a blue. Chests roll a white, green or blue (up to 25% blue in Dungeon 1).
- Rough count over a climb to 15 (about 1,000 kills): ~130 whites, ~40 greens, ~10–20 blues, 6+ pinks. Too much of everything.

**Proposal (owner to pick and tune):**
1. **Fewer drops, so each one counts.** Normal mobs mostly drop copper and junk (junk turns to copper on pickup, so nothing to sell). Gear about 1 kill in 30, nearly all white or green. **Blues are a session highlight** (about one per hour of play: rares, chests, bosses, very rarely mobs). **Pinks only from named, rares and bosses**, each with its own twist (the Meaningful named loot card). Target for a fresh character after Dungeon 1's first clear: mostly greens, 2–3 blues, maybe 1 pink; a full pink set comes from farming.
2. **Drops that feel like an event.** A light beam in the item's colour on the ground, its own sound, and the existing banner for blues and pinks.
3. **Boss loot (still personal).** Each boss drops one item for your class: about 60% green, 30% blue, 10% pink. **First kill of each boss is always blue or better.** **Bad-luck protection:** each kill without a pink raises the pink chance a little, reset when one drops. **Malrec's chest: pick 1 of 3** (three items for your class, you choose one). The dungeon journal lists each boss's drops once seen, so you know what you're farming.
4. **Enchanting (+1 to +5, already decided).** Small sure steps, no fail or break. **+3 adds a faint glow, +5 a strong one** (ties to gear showing on the character). Orbs are rare drops, one tier per zone; merge 3 into 1; a lower orb on better gear gives less. **Moving an enchant to new gear costs gold**, so a new drop never feels like losing your +4. Unwanted gear breaks into orb dust; an auto setting does it for whites.
5. **What gold is for (one loop).** Main: forge fees (enchanting, moving enchants). Backstop: orbs at a very high price. Small: teleport orbs, dyes, maybe repairs after death (older card). Never bank space (that's sold for real money).

**Owner answers (Nov 27):** pinks from **named and bosses only**; Malrec's chest: **pick 1 of 3**; normal mobs **still drop gear, but rarely**; **repairs after death replace the XP loss** ("too hardcore for a phone game"). **Built in v0.97.**

**Questions as asked:**
1. Pinks from named and bosses only, or can rares drop them too?
2. Malrec's chest: pick 1 of 3, or a straight random roll?
3. Should normal mobs drop gear at all, or only copper and junk (gear from chests, rares and named)?
4. Repairs after death: keep that card or drop it?

## Sources
- Path of Exile dev diary, "Rethinking Gold as a Currency": https://pathofexile.com/forum/view-thread/55102
- Path of Exile economy (Game Developer): https://gamedeveloper.com/design/path-of-exile-economy-currency-trading
- PoE 2 crafting pulled back: https://saschb2b.github.io/game-mechanics/games/path-of-exile-2/crafting-pulled-back
- WoW Embers of Neltharion upgrade system: https://worldofwarcraft.blizzard.com/news/23923485/
- WoW Season 3 upgrade changes: https://news.blizzard.com/en-us/article/24017505/developer-insight-universal-upgrade-system-improvements-for-dragonflight-season-3
- Crest trade-ups 6:1: https://blizzardwatch.com/?p=173213
- Last Epoch crafting changes 0.8.4: https://forum.lastepoch.com/t/crafting-changes-coming-to-eternal-legends-update-0-8-4/45597/1
- Last Epoch forging potential debate: https://forum.lastepoch.com/t/i-dont-see-why-forging-potential-exists/49569
- Diablo 4 gold bottleneck: https://www.wowhead.com/diablo-4/it/news/blizzard-internally-discussing-gold-bottleneck-issue-diablo-4-season-4-341097
- Diablo 4 gold problem patch: https://pcgamer.com/games/rpg/blizzard-addresses-diablo-4s-gold-problem-in-a-patch-but-nobody-is-quite-sure-if-its-solved-yet
- Lost Ark honing guide (Artisan's Energy): https://www.rpgstash.com/blog/lost-ark-gear-honing-guide
- MapleStory player protest: https://blogs.tuni.fi/playlab/game-research-highlights/united-by-dissatisfaction-how-players-bounded-together-to-protest-changes-done-to-their-favourite-game/
- MapleStory forum on removing destruction: https://forums.maplestory.nexon.net/discussion/comment/117927
- Diablo 3 Blood Shards: https://di.diablowiki.net/Bloodshard
- Vampire Survivors power-ups: https://gamerjournalist.com/vampire-survivors-powerups/
- Diablo 2 town portals and waypoints: https://classic.battle.net/diablo2exp/basics
- Diablo 3 removed town portal scrolls: https://di.diablowiki.net/TP
- OSRS magic tablets: https://oldschool.runescape.wiki/w/Teleport_tab
- Faucets and sinks overview: https://dev.to/hiroshi_takamura_c851fe71/how-to-design-a-game-economy-sources-sinks-loops-and-balance-j05

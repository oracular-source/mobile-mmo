# Monster list

Every monster in the game today and every one planned for Zone 1, with its new-look status. We redo them **one at a time**, in the order below: draw the new look, compare old and new on the phone, then put it in the game. Shape rules, size tiers and animation sets come from `docs/research/monsters-weapons-spells.md`.

**How to look at them:** open the game with `?dev`, tap **DEV**, scroll to **Look → Monsters** (every monster as it draws in the game; the gallery scales each one to fit, so judge true size in the world). To see one in action: **Testing grounds → Go there**, then tap Rat, Beetle, Skeleton or Boss 1.

Rules for every new monster: black outline, faces right, its own family colours (never the player-side colours; undead stay in bone, grey-green and purple), a red or glowing eye as the accent, legs that move when it walks (a step frame), and size from its tier.

## Owner notes (Nov 21, character chat)
- **Keep as the bar:** the rats, Old Gnawbone, and the chapel and Dungeon 1 placeholders (cultists, wisps, Acolyte, Malrec and the rest): owner likes how they look.
- **Redo:** the crypt skeleton (and the pet skeletons), the Skeleton King and the shambling corpse (zombie). Owner doesn't like them; they need to be **bigger** than today. Owner wants another look at them.
- **Scope of this pass:** base character models only, as placeholders. Animations come later. Then the base look for every class.
- Player characters are **15 × 18** (final), so humanoid monster sizes are judged against that.
- **Brother Malrec gets grander vestments and his own model** (owner, Nov 21): he's the dungeon boss, so he shouldn't look like the monastery's default robed shape; similar family, but with a clear differentiator.
- **Draft 1 drawn (Nov 21):** `art/drafts/undead-draft1.png`, grids in `tools/undead_mobs.py`. Crypt skeleton 16×20 (rusty sword, broken round shield, red eyes), Necro pet (clean bone, green eyes, thigh-bone club), SK minion (dark bone, red eyes, sword), shambling corpse 16×20 (hunched, both arms reaching, jaw hanging, ribs through a torn shirt, one bare foot), Skeleton King 24×29 (crown with a red gem, violet fire in the sockets, ermine collar, torn purple mantle, greatsword planted point down), Brother Malrec 24×28 (tall pointed cowl with a gold tip and trim, ember eyes in shadow, black cope with a gold collar over a red robe, gold-embroidered stole, gold hem, crook-staff with a lit censer); **Malrec B** keeps the vestments but trades the hood for a tall red mitre with a gold band and ember sigil, a gaunt grey face with ember eyes and an ash-grey beard, framed by a stiff gold-edged collar (24×30). Each walker has a step frame. **Owner OK'd them all and picked Malrec A (Nov 21); in the game in v0.65.**
- **Named, round 2 (owner, Nov 21):** Greyfang and Old Gnawbone a bit **bigger, shaggier, "more spicy"**, same vibe. Draft 1: `art/drafts/named-draft1.png`, grids in `tools/named_mobs.py`. Greyfang 38×21 (thick ruff, dark saddle down the back, snarling open jaw, two broken hunters' arrows in his back, old scars on the flank); Old Gnawbone 48×23 (his current shape grown longer and deeper, spiky shag along the back, belly fringe, a bone clenched in his teeth, a rusty trap jaw on his tail). **Owner to review.**
- **Drowned Prior and Bellringer, draft 1 (Nov 21, owner: same vibe as the monastery monsters, upgraded like Malrec):** `art/drafts/monastery-named-draft1.png`, grids in `tools/monastery_named.py`. Both keep the cult's hood but get their own model. **Drowned Prior** 25×29: soaked hood slumping to one side, his drowned face showing (bloated grey-green, sunken sockets with pale glowing eyes, slack open jaw), a tarnished silver prior's chain and seal, the habit darker and wetter below the waist, weed and river-grass hanging off him, a tattered dripping hem, and the dead lantern on its chain now with a faint drowned glow (the one light in his chamber). **Bellringer** 28×29: a hunched hulk, head low and forward between huge shoulders under a short hood, linen rags wound over his ears (rang the bells till he went deaf), ember eyes, a scorched leather foundry apron with a burn hole, rope belt with a small handbell, big bare fists, and the great bell's iron clapper held up as a maul. Each has a step frame. **Owner OK'd both (Nov 21); in the game in v0.69.**
- **Order from here (owner, Nov 21):** named in the game → **player character models (top priority)** → Prior and Bellringer. **No rat pass** (owner changed his mind: they're too small to gain detail; they stay the bar).
- **Redesign pass, draft 1 (owner, Nov 21: "give another crack" at everything not redone yet; small changes expected):** `art/drafts/redesign-draft1.png`, grids in `tools/redesign_pass.py`. **Cult:** one hand-drawn body for all of them (lit cowl rim, face in shadow with glowing eyes, a mantle, a hand showing, rope belt with a knotted tail, robe folds, darker hem, boots that swap on the step), keeping the flared hood-to-hem shape; zealot (sickle), ashcaller (an ember cupped up, ash smudge), chanter (swinging censer), mender (open book, bandage roll at the belt), summoner (coal held high, ember rune on the hem), deacon a size up with a gold stole and a mace, the Ashen Acolyte taller in pale ash robes going sooty at the hem with smoke rising. **Wolfwood:** blight wolf 31×16 (fur, small ruff, thin flank, bushy tail, the blight a sick green patch with a glow, bared teeth); Old Scar the same body, browner, one long scar across the flank and one through a milky blind eye, notched ear; thornback boar 28×15 (bristly mane, thorn ridge, hooves, tusk). **Rats:** big tunnel rat 29×12 as a small Gnawbone (shaggy spikes, mangy patch, scar, long yellow teeth); the Pale Rat its white colourway. Regular rats unchanged (the bar). **Beetles:** mire beetle 18×10 (domed shell with a seam and sheen, mandibles, six legs); Ironshell 30×15 at full detail (cracked shell grown over with moss), no more 2× pixels. **Weeping Bride** 18×22: long torn veil, tattered gown going muddy at the hem, wilted bouquet, grey-green face with wet streaks and pale glowing eyes. **Pets:** earth elemental (stacked stone golem, moss, glowing eyes and seams), fire elemental (flame body with a white-hot core and fire arms), floating sword (slim pale blade with a pink glow and a gem). Wisps kept (they already read). **Owner notes on draft 1 (Nov 21):** looks really good; wolf, rat and boar feet were backwards or silly; elementals lopsided; wolves a bit bigger; Ironshell is a bug, so feelers; weapons wait (no floating sword, cult hand items stay as they are). **Draft 2** (`art/drafts/redesign-draft2.png`): feet fixed (rules in `area-rules.md`, Legs and feet), blight wolf and Old Scar 37×18 (Greyfang 38×21 stays taller and chunkier), symmetric elementals, feelers on the mire beetle and Ironshell, floating sword dropped. **Owner to review.**
- **Player base look, draft 1 (Nov 21):** `art/drafts/players-draft1.png`, grids in `tools/player_rags.py`: all 14 classes drawn at 15 × 18 (13 × 16 fill plus outline). **Owner OK as placeholders; in the game in v0.68.**

## In the game now
| # | Monster | Where | Family | Size target | Today | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Grave rat | Gate Road | Rat | 16×8 (mid-size) | — | **New look in game (v0.19):** long low body, snout, pink ear, long tail, 4 legs, red eye, scurry frame |
| 1b | Crypt rat | Crypt | Rat | 16×8 | — | **New look in game (v0.19):** pale colourway |
| 1c | Tunnel rat | Rat tunnel | Rat | 16×8 | — | **In game (v0.29):** earthy brown colourway |
| 1d | Big tunnel rat | Rat tunnel (deeper) | Rat | 20×10 | — | **In game (v0.29):** the rat a size up, darker; its own step frame |
| 2 | Mire beetle | Gate Road | Beetle | 14×8 | Blue blob, 10×7 | **Next** |
| 3 | Shambling corpse | Graveyard | Zombie | 16×20 | — | **New look in game (v0.65):** hunched, arms reaching, jaw hanging, ribs through a torn shirt, step frame |
| 4 | Crypt skeleton | Crypt | Skeleton | 16×20 | — | **New look in game (v0.65):** own skeleton body, rusty sword, broken round shield, red eyes, step frame |
| 5 | Necromancer's skeleton, Shadow Knight's minion | Pets | Skeleton | 16×20 | — | **New look in game (v0.65):** clean bone, green eyes, bone club; dark bone, red eyes, sword |
| 6 | **Skeleton King** | Crypt | Skeleton (boss) | 24×29 | — | **New look in game (v0.65):** crown, violet fire in the sockets, ermine collar, torn purple cloak, greatsword, drawn at full size |
| 7 | Old Gnawbone | Rat tunnel (den) | Rat (named) | about 24×12 | — | **Round 2 in game (v0.67, owner OK Nov 21):** 48×23, longer and deeper, shaggy back and belly fringe, a bone in his teeth, a rusty trap jaw on his tail. **Own sprite in game (v0.29, map chat, owner asked):** 32×17, hunched and bristly, scarred back, torn ear, a scar through the eye, long yellow teeth, step frame |
| 8 | Earth and fire elementals | Magician pets | Elemental | 12×12 | One shape in two colours | To do |
| 9 | Floating sword | Enchanter pet | Object | 5×10 | Tiny sprite | To do (low) |
| 10 | Blight wolf | Wolfwood | Wolf | 24×14 | — | **In game (v0.40, map chat, owner OK Nov 19):** grey, red eyes, a blight patch, step frame. Packs of 2–3, flees at 20% health |
| 11 | Greyfang | Wolfwood | Wolf (named) | 30×17 | — | **Round 2 in game (v0.67, owner OK Nov 21):** 38×21, redrawn by hand: big ruff, dark saddle, snarl, two hunters' arrows in his side, scars. **In game (v0.40):** the wolf at 1.25× in silver, raised ruff, ice-blue eyes. Walks a loop with two pack wolves, howls them in |
| 12 | Old Scar | Wolfwood | Wolf (rare) | 24×14 | — | **In game (v0.40):** browner, torn ear, pink scar through a blind eye. Alone, hits hard |
| 13 | Thornback boar | Wolfwood | Boar | 23×12 | — | **In game (v0.40):** brown, pale thorn ridge, tusk out past the snout curving up (owner, Nov 19). Charges |

## Planned for Zone 1 (not built yet)
Drawn when their area is built, so the list stays in step with the map chat.

| Monster | Area | Family | Look notes (from `design.md`) |
| --- | --- | --- | --- |
| Fen cultist | Ruined Chapel | Humanoid | Camps of three, a healer in each |
| The Ashen Acolyte (rare) | Ruined Chapel | Humanoid | Grey robes trailing smoke |
| Ironshell (rare) | Crossroads | Beetle | Twice the size, cracked mossy shell |
| The Weeping Bride (rare) | Graveyard | Zombie | Torn veil, pale glow |
| The Pale Rat (rare) | Rat tunnel | Rat | White with red eyes, bigger |

**In the game since v0.62 as placeholders** (character design pass redraws them): fen zealot, ashcaller and chanter (one robed shape in three colours, `mkRobed` in `js/render.js`, data `ROBED` in `js/data/sprites.js`), the Ashen Acolyte (the same shape a size bigger, pale), the ash wisp (`WISP_SPR`).

**In the game since v0.63 as placeholders** (Dungeon 1; same robed shape, `ROBED`): fen mender (pale sage, a book), cult deacon (oxblood, a size up, a mace), **the Drowned Prior** (mini boss, 20×23, grey-green rotted habit with weed, pale eyes, a dead lantern), **the Bellringer** (optional named, 22×25, soot-brown, the bell's clapper as a maul), **Brother Malrec** (boss; **own sprite since v0.65**, 24×28, grand vestments), and the candle wisp (the ash wisp's flame in pale candle gold). **Owner (Nov 20): likes the rats as they are**; keep them as the bar for the character design pass rather than redoing them.

## Not monsters, but on the same art list later
Guards and Marrow the Peddler (people: redo with the character look), crow and frog critters (fine for now).

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
- **Order from here (owner, Nov 21):** named in the game → **player character models (top priority)** → Prior and Bellringer → **rats last** (a pass to match, keeping their vibe).

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
| 7 | Old Gnawbone | Rat tunnel (den) | Rat (named) | about 24×12 | — | **Bigger, shaggier draft (Nov 21), owner to review.** **Own sprite in game (v0.29, map chat, owner asked):** 32×17, hunched and bristly, scarred back, torn ear, a scar through the eye, long yellow teeth, step frame |
| 8 | Earth and fire elementals | Magician pets | Elemental | 12×12 | One shape in two colours | To do |
| 9 | Floating sword | Enchanter pet | Object | 5×10 | Tiny sprite | To do (low) |
| 10 | Blight wolf | Wolfwood | Wolf | 24×14 | — | **In game (v0.40, map chat, owner OK Nov 19):** grey, red eyes, a blight patch, step frame. Packs of 2–3, flees at 20% health |
| 11 | Greyfang | Wolfwood | Wolf (named) | 30×17 | — | **Bigger, shaggier draft (Nov 21), owner to review.** **In game (v0.40):** the wolf at 1.25× in silver, raised ruff, ice-blue eyes. Walks a loop with two pack wolves, howls them in |
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

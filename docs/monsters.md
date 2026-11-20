# Monster list

Every monster in the game today and every one planned for Zone 1, with its new-look status. We redo them **one at a time**, in the order below: draw the new look, compare old and new on the phone, then put it in the game. Shape rules, size tiers and animation sets come from `docs/research/monsters-weapons-spells.md`.

**How to look at them:** open the game with `?dev`, tap **DEV**, scroll to **Look → Monsters** (every monster as it draws in the game; the gallery scales each one to fit, so judge true size in the world). To see one in action: **Testing grounds → Go there**, then tap Rat, Beetle, Skeleton or Boss 1.

Rules for every new monster: black outline, faces right, its own family colours (never the player-side colours; undead stay in bone, grey-green and purple), a red or glowing eye as the accent, legs that move when it walks (a step frame), and size from its tier.

## In the game now
| # | Monster | Where | Family | Size target | Today | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Grave rat | Gate Road | Rat | 16×8 (mid-size) | — | **New look in game (v0.19):** long low body, snout, pink ear, long tail, 4 legs, red eye, scurry frame |
| 1b | Crypt rat | Crypt | Rat | 16×8 | — | **New look in game (v0.19):** pale colourway |
| 1c | Tunnel rat | Rat tunnel | Rat | 16×8 | — | **In game (v0.29):** earthy brown colourway |
| 1d | Big tunnel rat | Rat tunnel (deeper) | Rat | 20×10 | — | **In game (v0.29):** the rat a size up, darker; its own step frame |
| 2 | Mire beetle | Gate Road | Beetle | 14×8 | Blue blob, 10×7 | **Next** |
| 3 | Shambling corpse | Graveyard | Zombie | 12×16 | Upright, flat, less detail than the characters | To do |
| 4 | Crypt skeleton | Crypt | Skeleton | 12×16 | Recoloured corpse (looks like a zombie) | To do: its own skeleton body |
| 5 | Necromancer's skeleton, Shadow Knight's minion | Pets | Skeleton | 12×16 | Recoloured corpse | To do: skeleton variants (clean bone + green eyes; dark bone + red eyes) |
| 6 | Boss 1 → **Skeleton King** | Crypt | Skeleton (boss) | about 24×32, full size | Corpse at 3× | To do: crown, drawn at full size |
| 7 | Old Gnawbone | Rat tunnel (den) | Rat (named) | about 24×12 | — | **Own sprite in game (v0.29, map chat, owner asked):** 32×17, hunched and bristly, scarred back, torn ear, a scar through the eye, long yellow teeth, step frame |
| 8 | Earth and fire elementals | Magician pets | Elemental | 12×12 | One shape in two colours | To do |
| 9 | Floating sword | Enchanter pet | Object | 5×10 | Tiny sprite | To do (low) |

## Planned for Zone 1 (not built yet)
Drawn when their area is built, so the list stays in step with the map chat.

| Monster | Area | Family | Look notes (from `design.md`) |
| --- | --- | --- | --- |
| Blight wolf | Wolfwood | Wolf | Packs of 2–3, flee at low health. **Draft 3 (Nov 19, map chat)**: `tools/wolfwood_mobs.py`, owner to OK (Greyfang, Old Scar and the thornback boar drafted there too) |
| Greyfang (named) | Wolfwood | Wolf | Silver coat, glowing eyes, leads the pack |
| Old Scar (rare) | Wolfwood | Wolf | One-eyed grey wolf, torn ear |
| Fen cultist | Ruined Chapel | Humanoid | Camps of three, a healer in each |
| The Ashen Acolyte (rare) | Ruined Chapel | Humanoid | Grey robes trailing smoke |
| Brother Malrec (boss) | Dungeon 1 | Humanoid (boss) | Censer trailing smoke, candles light around him |
| Ironshell (rare) | Crossroads | Beetle | Twice the size, cracked mossy shell |
| The Weeping Bride (rare) | Graveyard | Zombie | Torn veil, pale glow |
| The Pale Rat (rare) | Rat tunnel | Rat | White with red eyes, bigger |

## Not monsters, but on the same art list later
Guards and Marrow the Peddler (people: redo with the character look), crow and frog critters (fine for now).

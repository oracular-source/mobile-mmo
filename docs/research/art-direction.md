# Art direction: how to decide the look

How small teams settle on a visual style and keep it consistent, and how that splits between the owner (taste) and Claude (rules and execution). Groundwork for milestone 3d (art redo). Researched Nov 17, 2026.

## The short version
1. **Words before pictures.** Write 3–5 visual pillars: short rules every asset has to follow.
2. **Mood board from your taste.** Collect 10–20 images you love, including some from outside games, plus a few you *don't* want.
3. **Lock six rules** before drawing the second asset: resolution, palette, outline, shading, animation timing and proportions.
4. **Readability beats detail,** especially on a phone: clear silhouettes, strong light/dark contrast between characters and ground, one focal point.
5. **Consistency beats quality.** Players forgive simple art right away if it hangs together. Mixed styles are the most common indie art problem.
6. **One golden asset per type, then roll out.** Lock one character, one tile, one tree and one wall, then match everything to them (already the plan for 3d).

## Who does what
| Owner | Claude |
| --- | --- |
| Picks references and says what he loves about each | Turns the references into written rules and a palette |
| Judges mock-ups **on the phone** and picks one | Draws variations that change one thing at a time |
| Makes the final call on the pillars | Checks every new asset against the rules (silhouette, grayscale, palette) |

Claude can follow rules precisely and keep things consistent, but taste has to come from the owner. Mock-ups should always be compared side by side on the phone, at real game size.

## The process

### 1. Visual pillars (draft for the owner to edit)
- **Readable at arm's length.** Characters and mobs pop; the ground sits back.
- **Dark world, warm light.** Cool, muted ground and walls. Torches, campfires and magic are the brightest things on screen (fits the existing lighting).
- **Chunky and honest pixels.** 12×16 characters, 1-pixel black outline, few colors per sprite, no blur or smoothing.
- **Every class known by shape,** not only color: hat, hood, weapon or shield silhouette.
- **Red means danger.** Keep bright red for monster eyes, enemy casts and low health.

### 2. Mood board
- Save 10–20 screenshots or photos on your phone: EverQuest, Dreadmyst, Diablo 2 and others, plus a few that aren't games (paintings, photos of places, movie stills). Searching only games gets you clichés.
- For each, note in a few words what you like (the color? the light? the chunkiness?).
- Add 3–5 "not this" images. Showing what you don't want is often more useful.
- Share them in a chat; Claude pulls out the palette, light direction and shape rules.

### 3. The six locked rules (style guide)
These go into `art/palette.md`, which becomes the style guide.

| Rule | Now | To decide |
| --- | --- | --- |
| Resolution | 12×16 characters | Tile size; boss size (Boss 1 is currently scaled 3x, which looks chunkier) |
| Palette | Colors listed per material | Rebuild as **ramps**: 3–4 shades per material, shadows shifted toward blue or purple, highlights toward yellow ("hue shifting") |
| Outline | 1px black on every sprite | Keep, or outline characters only and not scenery? |
| Shading | Not written down | Suggest: light from the top left, 2 shades + 1 highlight |
| Animation timing | None yet | Frames for walk, cast, attack and hit; frame speed |
| Proportions | Not written down | Head size, body height, weapon size |

### 4. Readability tests (run on every new asset)
- **Silhouette test:** fill the sprite solid black. Can you still tell the class or mob?
- **Grayscale test:** take a screenshot in black and white. Characters should be clearly lighter or darker than the ground. Most readability problems are light/dark problems: a detailed background in the same mid-tones swallows the characters.
- **Busy-fight test:** check the busiest fight (pet, several mobs, spell effects), not a calm scene, on the phone.
- **Background pushed back:** ground and scenery are lower contrast and less saturated than characters.
- **Palette check:** only colors from the palette, about 16 or fewer per sprite.

### 5. Golden assets and rollout
1. Lock one character (likely the Druid). Compare 3 variations at a time on the phone, changing one thing per round (outline, then shading, then palette).
2. Write the winning choices into the style guide.
3. Do the same for one ground tile, one tree and one wall.
4. Roll out to the other classes (the default skin makes that easier), then mobs, then the world.

Backlog cards for these steps are on `docs/board.md` (Nov 17).

## Sources
- Readable pixel art: https://bugnet.io/blog/how-to-make-pixel-art-that-reads-clearly and https://bugnet.io/blog/readable-game-art-why-clarity-beats-detail
- Consistency over quality: https://bugnet.io/blog/color-palettes-for-indie-games
- Pixel art style guide (six rules): https://www.sprite-ai.art/blog/2d-pixel-art-style-guide
- Hue shifting and color ramps: https://www.slynyrd.com/blog/2018/1/10/pixelblog-1-color-palettes
- Palette size: https://gdg.mit.edu/style-guide
- Mood boards and showing what you don't want: https://gamedeveloper.com/blogs/crafting-the-perfect-game-art-brief and https://mycours.es/gamedesign2021/?p=1623
- Locking a style before production: https://www.juegostudio.com/blog/art-direction-in-games
- Visual pillars and style guides for solo devs: https://www.wayline.io/blog/beginner-pro-visual-identity-no-asset-packs

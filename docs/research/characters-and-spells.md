# Characters and spells: what makes them read, feel and land

Fourth design deep dive (Nov 17, 2026), from the "character chat". The owner wants to explore character looks and themes (not locked to style B), and later spells and abilities. Research first, then drafts. No game changes.

Drafts: Claude canvas **"Mobile MMO — Character looks (draft 1)"** (https://claude.ai/artifact/G5MLwD6Sb4UnBf8NM5cW5m). Six looks (A–F), each with Druid, Warrior, Rogue and Necromancer, idle/walk/cast, colour/grayscale/silhouette, a sample spell in that look, palette, shape rule and risk. A side-by-side board compares all six at near phone size. A second row holds the A+B mix takes and a prestige cosmetics sample (see "Draft 2" below).

## The short version
1. **Silhouette first, colour second, detail last.** A common rule of thumb is that ~70% of a design's impact is the outline. At 12×16 on a phone, detail barely exists, so the head shape (hood, helm, mask, hat, antlers) carries the class.
2. **One signature thing per class.** A mask, a hat, a cape colour. Darkest Dungeon's makers built classes from one mechanic, then gave each "an interesting silhouette". The Leper's mask is what people remember.
3. **Hidden faces fit dark worlds; visible faces fit friendly ones.** Blasphemous built its hero around a faceless penitent's hood; Hyper Light Drifter's hero is basically a cape. Classic MMOs (Ragnarok, EverQuest box art) show faces and big heads.
4. **Few colours per material.** Hades' concept art uses roughly a shadow, a base and a highlight per material. Same as our "2 shades + 1 highlight" rule.
5. **A spell has three beats:** anticipation (a short cast glow), impact (the brightest, most saturated moment, very early), dissipation (a quick fade so the screen clears). Riot's League VFX guide is built on this.
6. **Size and loudness match importance.** Big abilities look big; the basic attack stays small. Heals look soft and green; knock-ups look vertical. Players already know this language.
7. **Feel comes from stacking small things,** not one big effect: hit flash, a pixel of knockback, a short freeze (hit-stop) on big hits, screen shake only for the biggest, particles, and above all **sound**. Players of Diablo and Last Epoch repeatedly say a spell with one weak sound feels weak however good it looks.
8. **Gear on the body is expensive in 2D.** A paper-doll system (layered gear sprites) is what lets MMO players look different, but every item needs drawing for every frame. Ragnarok kept it cheap: body by class, plus hairstyle and headgear layers only.

## What the games teach

### Shape language and readability (TF2, Overwatch, indie guides)
- Round shapes read friendly, square sturdy, pointed dangerous. Use it per class: Warrior squarish, Rogue pointed, Necro tall and pointed, Druid organic.
- Test the whole cast at once: every character should be identifiable from silhouette alone, or players confuse them in a fight. Our canvas has a silhouette view for exactly this.
- One signature accent colour per character, the rest restrained.

### Darkest Dungeon: mood plus one hook
Characters are worn and grim, with heavy blacks, but each class has one strong visual hook (mask, hat, weapon). Bourassa: the game started from wanting to avoid the usual "power fantasy" of ever-bigger gear. Good fit for "death has weight".

### Blasphemous: faith, masks, no face
The hero is based on Spanish Holy Week penitents' robes; the team mixed southern Spanish religious art with Castlevania and Dark Souls. A faceless, masked hero gives a strong, eerie icon. Look B (Hollow Saints) borrows the *idea* (veils, relics, candles), not the design.

### Hyper Light Drifter: the cape is the character
A tiny hero made of a cape and a sword, with alternate capes as rewards. Shows how a single shape plus one colour can be a whole identity, and how cosmetics can be "the cape" instead of full outfits. Look E (Neon Drifters) explores that.

### Hades: colour against darkness
Bold colour on a dark underworld; boons pop because the world is dark. Each material uses about three tones. Our "dark world, warm light" pillar is the same idea.

### Ragnarok Online and Tibia: MMO sprites at scale
Ragnarok assembles each character from layers: body (by class and gender), hairstyle, headgear. Headgear became the main way players showed off. Tibia's "addons" are small pieces over a base outfit. **For us:** the cheapest real customization is a head/hat layer and a cape/back layer, plus palette swaps, before full gear sprites.

### Proportions
At 16 px tall, sprites are usually 2–3 heads tall (big heads read faces and hats better). Chibi (Pokémon) puts 60%+ of the height in the head; classic RPGs 38–54%. Our current 5-row head in 16 rows (~31%) is on the realistic side; Look D tests a 7-row head (~44%), Look B a taller 18-row body.

### Spells and feel (League VFX guide, Vlambeer, Diablo)
- **Three beats:** anticipation (short, alerts others), impact (peak brightness in the first quarter of the effect), dissipation (clean fade).
- **Hierarchy:** saturation, contrast and size scale with how much the ability matters. Basic attacks quiet; signature spells loud.
- **Stacked feedback** (Vlambeer's "Art of Screenshake"): impact effect, hit reaction, knockback, permanence (marks that stay a moment), hit pause, shake. Use 2–3 per event, more only for big moments. Uniform shake on everything stops meaning anything.
- **Sound is half the spell.** Diablo 2's Corpse Explosion is remembered for its sound; forum players call out abilities with a single faint sound as feeling weak. Every spell needs at least a cast sound and an impact sound, the impact layered.
- **Phone extra:** a short vibration on big hits and crits (and a setting to turn it off).

## The six drafts (canvas)
| Look | Feel | Shape rule | Watch out |
| --- | --- | --- | --- |
| **A. Grave Lantern** (style B) | Grim, earthy, torchlit, classic | Shared body; hood/helm/mask; black outline | Safe, least surprising |
| **B. Hollow Saints** | Solemn, masked, candlelit | Taller 12×18, robes to the ground, no faces | Long robes hide walking |
| **C. Wicker & Moss** | Eerie folk horror, handmade | Masks carry class: antlers, fox, bucket helm, straw man | Can drift cute |
| **D. Storybook Norrath** | Heroic, bright, nostalgic | Big heads, faces, navy outline, one bold colour per class | Clashes with a dark world |
| **E. Neon Drifters** | Mysterious, minimal | Near-black bodies, one neon cape colour = class and spell colour | Little room to show gear |
| **F. Plague & Brass** | Grim, alchemical, sooty | Hats and masks: kettle hat, beak, cloth mask; brass coats | Locks the world to a plague city |

Each look's spell sample: A ember bolt that lights the ground; B a shaft of gold light with a floor ring; C a seed with fireflies bursting into leaves; D a chunky star with a ring and number pop; E a neon line and sharp burst with one white flash; F a thrown vial that leaves a green cloud.

## Draft 2: owner feedback and the A+B mix (Nov 17)
**Owner:** likes B but finds A more approachable; wants a mix. Likes the bigger heads but not the stubby legs, and not the look-D rogue. B's spell was by far the best. B's plain long robes were a cop-out: robes need more flair. Idea: earned cosmetics (boss kills, chests) to show prestige: weapon, hat, robe, maybe wings at the end.

**Mix, take 1:** 12×18 like B with a normal 6-row head. Druid and Warrior show faces; Rogue (new: deep hood, red scarf over the nose, short mantle, a strap, two daggers) and Necro (bone crown, shadowed face, glowing eyes) keep some mystery. Every robe has the same parts: shoulder mantle, gold clasp and centre trim, belt with buckle, a sash tail, gold hem, and boots that show so the legs still walk. B's judgement spell carried to other schools: green ray for the Druid, violet for the Necro.

**Mix, take 2:** the same, with a 9-wide, 7-row head (about 40% of the height). The body loses one robe row, never leg length.

**Prestige cosmetics sample:** one Druid gaining one earned look at a time: hat (Greyfang's Pelt, named kill), robe colourway (Chapel Vestments, hidden chest), weapon (Crowned Staff, Skeleton King), back (Spirit Wings, end-game raid). Four slots keep drawing work small. Looks only, never power; wear any earned look over your gear; account-wide. Backlog card on the board.

## What this means for us
1. **Owner picks take 1 or take 2** (or a tweak) on the phone; then it becomes the golden character for milestone 3d.
2. **Agree the look with the world chat.** The A+B mix (dark world, gold and candlelight, faces on some classes) fits Zone 1's graveyard, chapel and cultists.
3. **Customization plan:** class body + head/hat layer + weapon layer + back layer (cape, wings) + palette colourways. That is also the cosmetics system. Full paper-doll gear later, if ever.
4. **Spell pass after the look is picked:** start from B's judgement ray as the template (cast ring at the feet, a beat of build-up, a bright shaft, a floor ring, fast fade), one colour per school, size by importance, a cast and impact sound for each.

## Open questions for the owner
- Take 1 or take 2?
- Which classes show faces, which stay hidden?
- Should regular gear show on the character, or only cosmetics (hat, robe colour, weapon, back)?

## Sources
- Shape language and the 70/30 silhouette rule: https://rocketbrush.com/blog/shape-language-in-game-character-design-how-to-make-characters-readable-and-consistent ; silhouette-first, cast test, one accent: https://bugnet.io/blog/character-design-basics-for-indie-devs ; TF2/Overwatch readability: https://medium.com/@xavierck/character-readability-in-team-fortress-2-and-overwatch-68c41d454465 ; curved vs angular: https://80.lv/articles/character-design-development-from-concept-to-final-illustration
- Darkest Dungeon: https://gamespot.com/articles/darkest-dungeon-captures-the-hellish-life-of-an-adventurer/1100-6420150/ , https://gamesbeat.com/darkest-dungeon-designers-really-arent-sadists-were-realists/3 , https://store.epicgames.com/news/darkest-dungeon-2-early-access-interview?lang=en-US
- Blasphemous: https://blog.playstation.com/?p=215830 , https://blog.eu.playstation.com/2019/09/09/the-creator-of-brutal-platformer-blasphemous-out-this-week-on-ps4-reveals-its-real-world-inspirations/
- Hyper Light Drifter: https://tvtropes.org/pmwiki/pmwiki.php/Characters/HyperLightDrifter , https://gamedeveloper.com/business/the-ultra-modern-stylings-of-hyper-light-drifter
- Hades: https://80.lv/articles/ares-from-hades-recreated-in-stunning-hand-painted-3d , https://shapes.inc/fandom/hades/author
- Ragnarok layers: https://chrisengineergame.blogspot.com/2020/12/game-design-artstyle.html ; Tibia addons and paper dolls: https://otland.net/threads/paperdoll.263967/ , https://soulbound.game/news/how-we-built-a-pixel-art-character-and-cosmetic-system/
- Proportions: https://pixnote.net/en/learn/character , https://www.slynyrd.com/blog/2019/5/21/pixelblog-17-human-anatomy , https://blakecrosley.com/blog/pixel-art-characters-on-iphone
- VFX beats and hierarchy: https://www.vfxapprentice.com/blog/10-league-of-legends-vfx-design-tips , https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/ , https://80.lv/articles/vfx-staples-shape-color-and-motion/ , https://realtimevfx.com/t/anatomy-of-a-league-of-legends-missile-part-2-what-are-we-communicating-with-our-vfx/13062
- Juice: https://dkliao.itch.io/the-art-of-screenshake-recreation/devlog/451576/quick-breakdown-of-all-the-effects , https://gamejuice.pages.dev/articles/screen-shake-guide
- Sound: https://us.forums.blizzard.com/en/d4/t/bring-back-corpse-explosion-sound-from-classic-d2/11695 , https://forum.lastepoch.com/t/in-my-opinion-most-spells-lack-audio-polish-that-would-make-them-feel-more-impactful/53719
- Dreadmyst (classes built around clear feedback): https://store.steampowered.com/app/4241850

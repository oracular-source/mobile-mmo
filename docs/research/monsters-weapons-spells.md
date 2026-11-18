# Monsters, weapon swings and spells: lessons from older, darker games

Second art deep dive (Nov 17, 2026), after the owner picked style B for characters. The question: before any art rollout, how should **monsters**, **weapon animations** and **spells** look and feel, so we have templates to build on? Looked at Diablo 1 and 2, Tibia, Ragnarok Online, Darkest Dungeon, Blasphemous, Loop Hero, Noita and MMO effect-clutter complaints. No game changes.

## The short version
1. **Our monsters are mostly one sprite.** The crypt skeleton, the Necromancer's skeleton, the Shadow Knight's minion and Boss 1 are all recolours of the shambling corpse. That is why the Necro's pet reads as a zombie. Rats (and the crypt rat, and Old Gnawbone at 2×) share one tiny 10×6 sprite.
2. **One body per monster family, then variants.** Diablo 2 builds most of its roster this way: one model per family, colour shifts for tougher variants, and swappable parts (heads, weapons, armour). That's the template system we want.
3. **Shape first.** Each family needs its own silhouette before colour: rat = long, low, pointed snout and tail; zombie = hunched, arms reaching, lopsided; skeleton = thin, gaps between bones, big skull with dark eye sockets.
4. **A swing is 4 beats:** wind-up (held), one smear frame (the weapon's arc filled in with its two brightest colours), impact (held longest, 1 pixel lunge), recover. Weapon weight comes from timing, not frame count.
5. **Hits react only when they matter.** Diablo 2 only plays the "flinch" when a hit takes more than 1/12 of max health. Every hit flashes; big hits flinch; only boss hits shake the screen.
6. **Spells are readable, not flashy:** one colour family per school, a short cast glow at the caster's hands, a small projectile, an impact that lasts a fraction of a second. Fire lights up the dark (Diablo).
7. **Plan for crowds now.** MMO players everywhere complain that other players' effects bury the fight. Design so your own spells and enemy attacks are full strength and other players' can be toned down.

## What these games teach

### Diablo 1 and 2: darkness, weight and families
- **Dark as a mechanic.** Diablo's makers wanted the game to be literally dark, with the light radius as a mechanic so you fear what's just past your sight. In Diablo 1 the light radius even decided when monsters woke up, and fire made more light but also alerted enemies. **For us:** we already have light pools; spells that carry light (a fireball lighting the crypt as it flies) are cheap and very Diablo.
- **Frame-based feel.** Diablo 2 runs its animations at 25 frames a second, and each swing is a set number of frames: the arm swinging, the weapon coming down, the hit landing, then the weapon rising back to ready. A barbarian's basic one-handed swing took 7 of those frames, about a quarter of a second.
- **Flinch with a threshold.** The hit-recovery (flinch) animation only plays when a hit deals more than 1/12 of the character's max health, and nothing else can happen while it plays. That keeps flinches rare enough to mean "that one hurt."
- **Families and variants.** Monsters of the same kind appear in different colours and names but the same shape; the colour tells you it's a stronger version. Besides colour shifts, a component system let one monster wear different heads, weapons and armour. The zombie class, for example, comes as Zombie, Hungry Dead, Ghoul, Drowned Carcass and Plague Bearer.
- **Corpses matter.** In Diablo 2 whatever you killed fell and stayed on the ground, and the Necromancer raised or exploded those bodies; Raise Skeleton is cast on a slain monster's corpse. **For us:** corpses that stay a few seconds give the Necromancer a future hook (raise from a corpse) and make fights leave a mark.

### Tibia and Ragnarok Online: old 2D MMOs
- Tibia has kept the same 2D pixel look for over 16 years, with every square 32×32 pixels. Its players still complain that spell effects pile up until they can't see where to walk, and ask for opacity sliders or turning off other players' spells.
- Ragnarok Online's effect list includes a separate **cast-start aura per element** (one for earth, and so on) alongside the travel and hit effects. That's a neat idea for us: the glow at the caster's feet says *what* is coming before it lands, for players and for enemy casters alike.

### Modern MMOs: the clutter problem
- WoW players asked for a way to turn other people's spells down while keeping boss and their own effects visible. Blizzard eventually added "Spell Density" settings, where effects may disappear or appear much weaker, see-through or less colourful. Elder Scrolls Online added sliders for how many particle systems show and at what distance.
- **For us:** a phone screen is tiny, so this matters more. Rule from day one: own effects and enemy attacks full; other players' effects small and dim, with a setting later.

### Darkest Dungeon: strong lines, splashes of colour
The art director wanted the game to feel old and worn, and says its strong linework lets him splash unexpected colour onto things without losing readability. Hard edges and pooled blacks match the uncompromising tone. **For us:** our black outline does the same job. Keep monsters mostly dark and muted, and save one bright accent (eyes, a glowing wound, a weapon edge) per monster.

### Blasphemous: pixel animation done the hard way
The team stayed "purist" about pixel art and found themselves facing the limits games had 25 years ago; animation was the hardest part because they drew it all by hand, frame by frame. **For us:** budget frames carefully. A few strong frames per action, not many weak ones.

### Loop Hero: tiny sprites, a lot of character
Reviewers say its sprites deliver a lot of character in a few frames of animation, but also that the tiny, limited-animation enemy icons are easy to overlook until a fight starts. **For us:** small is fine, but every monster needs at least an idle and a clear attack pose so it's noticed on the map.

### Noita: the weird one
Every pixel is physically simulated and there are hundreds of spells and modifiers. Wonderful, but its readability comes from slow, single-player chaos. **For us:** the lesson is restraint; one interaction per spell at most (fire lights things, frost tints blue), no simulated mess in an MMO.

## Templates proposed

### Monster size tiers (game pixels)
| Tier | Size | Examples |
| --- | --- | --- |
| Critter | up to 8×6 | crow, frog, bat |
| Small beast | 12–16 wide × 8–10 tall | rats, beetles, wolves |
| Humanoid | 12×16 (same as players) | zombie, skeleton, cultist |
| Large | about 16×20 to 24×24 | bog lurker, named brutes |
| Boss | drawn at full size, about 24×32 | Boss 1 (no more 3× scaling) |

### One body per family, then variants
| Family | Shape rules | Accent | Variants by colour or parts |
| --- | --- | --- | --- |
| Rat | long and low, pointed snout, round ear, thin tail longer than the body, 4 legs showing | red eye | grave rat (grey-brown), crypt rat (pale), Old Gnawbone (bigger, scarred, darker) |
| Beetle | round shell with a centre seam, short legs, small head | shell sheen | mire beetle, later armoured types |
| Zombie (shambling corpse) | hunched forward, one or both arms reaching, lopsided shoulders, torn rags, one dragging foot | dull eyes, a wound | fresh (grey-green), rotten (darker, more rag), drowned later |
| Skeleton | upright, thin limbs with gaps, ribs as stripes, big skull with dark sockets, no flesh | eye glow in the sockets | crypt skeleton (old bone, rusty sword), Necro's skeleton (clean bone, green eyes), SK minion (dark bone, red eyes), Boss 1 (bigger, crowned or robed, purple) |

Rule from Hyper Light Drifter (first deep dive): monsters never use the player-side colour families. Undead stay in bone, grey-green and purple.

### Animation set per monster
| Action | Frames | Notes |
| --- | --- | --- |
| Idle | 2 | breathing or swaying; zombies sway, skeletons rattle a pixel |
| Walk | 2–4 | rats scurry fast; zombies drag a foot |
| Attack | 3 | wind-up (held, the readable "tell"), strike, recover |
| Hit | 1 | white flash on every hit; a 1 px flinch only for big hits |
| Death | 2–3 | collapse; corpse stays a few seconds then fades |

### Weapon swings
- **Beats:** wind-up → smear → impact (held, lunge 1 px) → recover. A pixel art guide calls smear frames essential for a smooth feel with few frames, usually just one. For the smear, fill the arc the weapon travels with its two brightest colours, then leave a shrinking remnant for one frame to show it slowing down. On impact, hold the frame longer to sell the weapon's weight.
- **Weight by timing:** dagger snaps (short wind-up, fast), sword in between, mace and greatsword hold the wind-up longer and the impact longer. Staff casters use a cast pose instead.
- **On the target:** white flash, a 1–2 frame spark, a pixel of knockback. Hit-stop (both fighters freeze for a few frames) only on big hits and crits, never on every auto-attack.

### Spells
| School | Colour | Shape |
| --- | --- | --- |
| Nature (Druid, Shaman) | green | thorns, motes, leaves |
| Shadow / disease (Necro, SK) | purple and sick green | wisps, drips |
| Holy (Cleric, Paladin) | gold-white | rays, rings |
| Frost (Wizard) | pale blue | shards; chilled targets tint blue |
| Fire (Wizard, Magician) | orange | carries light in the dark |
| Mind (Enchanter, Bard) | pink-violet | rings, Zz, notes |

- **Cast:** a 2-frame glow at the hands or staff tip plus a small floor glow in the school's colour. Enemy casters use the same, so it doubles as a telegraph.
- **Travel:** small projectile, 2–3 px trail.
- **Impact:** 200–400 ms, then gone. DoTs show a tiny repeating mark on the target, not a cloud.
- **Ground effects** (Consecrate, totems, traps): an outlined ring on the floor, see-through, never a filled blob.

## What this means for us
1. **Monster template mock-ups next** (no game changes): rat, beetle, zombie and skeleton bodies in style B at true size, plus colour variants, Boss 1 drawn at full size, each with idle, attack, hit and death frames. Compare on the phone like the Druid takes.
2. **Fix the shared body** when the art rolls out: skeleton-type monsters get a real skeleton body, so the Necro's pet looks like a skeleton.
3. **Weapon swing samples** on the mock-up: dagger, sword and mace swings with smear frames, so we can judge weight before drawing every class.
4. **Spell samples:** one bolt per school on the mock-up, cast glow included, to check readability at game size.
5. **Corpses and the Necro:** let corpses stay a few seconds; "raise from a corpse" goes to the backlog as a later Necro idea.
6. **Plan the effects rule** (own and enemy full, others dim) now, build the setting in phase 3.

## Open questions for the owner
- **Gore:** Diablo and Blasphemous are bloody. Do we want blood and lingering corpses, or keep it lighter (bones and dust)?
- **Rats:** a bit bigger (14×8) so they read as rats, or keep them tiny and rely on shape?
- **Hit-stop:** only on crits and big abilities, or never (MMO auto-attacks feel calmer)?
- **Boss 1:** a crowned skeleton king, a robed skeleton priest, or something else?

## Sources
- Diablo light radius as a mechanic: https://shapes.inc/fandom/diablo/author and https://medium.com/@dlcraddock/architects-of-terror-how-blizzard-north-designed-the-ultimate-final-boss-in-diablo-and-diablo-2-c12d86cf20f
- Diablo 2 frames and swing timing: https://www.wowhead.com/classic/cn/news/디아블로-ii-레저렉션-브레이크포인트-가이드-324599, https://diablo2.diablowiki.net/Special:MobileDiff/27954, https://di.diablowiki.net/Breakpoint
- Diablo 2 hit recovery threshold: https://diablo-archive.fandom.com/wiki/Faster_Hit_Recovery
- Diablo 2 monster families, palette shifts and components: https://diablo2.wiki.fextralife.com/Enemies, https://diablo2.diablowiki.net/Monsters_archive, https://knowll.com/g/13/diablo-ii-enemies-guide
- Diablo corpses and Raise Skeleton: https://gamesbeat.com/creating-corpses-making-bodies-matter-in-diablo-3/ and https://diablo2.diablowiki.net/Raise_Skeleton
- Tibia's pixel look: https://tibiavip.app/home/news?id=4917 ; Tibia effect clutter: https://redlib.belloworld.it/r/TibiaMMO/comments/1edwwdy/how_do_you_enjoy_this_game_with_all_this_visual
- Ragnarok Online effect list (cast auras per element): https://www.scribd.com/document/614886549/effects
- WoW spell clutter and Spell Density: https://us.forums.blizzard.com/en/wow/t/can-we-have-a-way-to-hide-other-peoples-spells/1256968 and https://mein-mmo.de/en/in-wow-you-can-finally-turn-off-the-annoying-crap-of-your-teammates,1402948 ; ESO particle sliders: https://forums.elderscrollsonline.com/en/discussion/127974
- Darkest Dungeon art: https://www.gamedeveloper.com/audio/road-to-the-igf-red-hook-studios-i-darkest-dungeon-i- and https://www.gamespot.com:443/articles/the-gothic-sensibilities-of-darkest-dungeon/1100-6424880/ and https://blanknothad1946.blogspot.com/2022/03/how-to-draw-in-darkest-dungeon-style.html
- Blasphemous purist pixel art and hand animation: https://www.hollywoodreporter.com/heat-vision/blasphemous-designer-purist-approach-games-pixel-art-style-1238370 and https://www.tomshw.it/videogioco/the-art-of-pixel-pixel-art/la-ricerca-della-perfezione
- Loop Hero sprites: https://rpgamer.com/?p=89394 and https://gamespot.com/reviews/loop-hero-review/1900-6417656/
- Noita: https://www.tuni.fi/playlab/noita-an-unforgiving-roguelite-full-of-surprises
- Smear frames and melee beats: https://slynyrd.com/blog/2018/9/8/pixelblog-9-melee-attacks and https://www.slynyrd.com/blog/2025/5/23/pixelblog-56-top-down-character-attack-animation ; filling the arc: https://wiki.wesnoth.org/How_to_create_motion_blurs

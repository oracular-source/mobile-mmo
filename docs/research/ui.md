# UI research and breakdowns

Notes for the UI pass (the "UI double-tap" card on the board). Rough breakdowns first, one screen part at a time, looks fleshed out later.

## Direction (owner, Nov 18)
- **Minimal, EverQuest-style for now:** plain dark grey panels, thin light borders, square buttons, plain text labels. No theme yet; the theme comes later, on top of a layout that already works.
- Each breakdown: what's there now, what's wrong, 2–4 rough sketches with a pick, then the owner chooses. Looks stay rough.

## What we learned
- **RuneScape:** praised for one consistent way of doing things; when every window uses its own button styles, players have to re-learn each screen. Rule for us: one button style, one panel style, used everywhere.
- **Phone action RPGs (Diablo Immortal and others):** the main attack is the biggest button, sitting where the thumb rests, with the other skills around it. The most-used buttons should never be a reach; leave space between buttons so you don't hit the wrong one; keep the layout stable so muscle memory builds.
- **Tap targets:** Apple's minimum is 44 × 44 points, Google's 48. Our round pad's small buttons are about 43 and their labels 9px.
- **Target cycling on phones:** usually a target button next to the skills, or a swipe/tap on the target frame (RF Online does both).
- **Spell queue:** a common complaint in MMOs is not knowing whether the next spell got queued. WoW players add mods that mark the queue window on the cast bar. Built for us in v0.27.5 (spinning gold ring + "Next" chip under the cast bar).

## Breakdown list (order)
1. Spell pad and Next ⟳ (done v0.28)
2. Chat log (done v0.30.1)
3. Your frame (name, level, health, mana, XP, buffs) (matched to the target frame v0.33.1)
4. Target frame and boss cast bar (done v0.33)
5. Slots 7–8 and Sit (done v0.30.2; slots 7–8 already moved into the grid in v0.28)
6. Floating text over heads (done v0.33)
7. Pet bar (done v0.34)
8. Menu screens (Spells, Arrange, Settings) (done v0.35)
9. Character screen (Gear, Bags, Journal) (done v0.36)
10. Moments (level up, death, loot, run summary) (done v0.37)
11. Start screen and class picker (done v0.38)
12. Minimap and full map (Wolfwood bug fixed v0.41.2; owner picked A, built v0.42)
13. Top pills: Log, Menu, 1st hit, Auto (options written, owner to pick)
17. Never pause: windows and the skill pick (owner picked A, built v0.56)
18. Buff and debuff icons with timers (owner picked B, built v0.58)
19. Windows match the HUD, plus small fixes (owner picked B and all six fixes, built v0.60)

## 1. Spell pad and Next ⟳
Now: a round pad, main attack in the middle, five round buttons around it (about 43px, 9px labels), flick or tap; Next ⟳ floats above it. A "classic" fan layout exists in Settings.
Options: **A** EQ grid 2×3 (main bottom-right); **B** arc with a big main button in the corner and five square buttons around it; **C** keep the round pad, just bigger buttons and labels. Next ⟳: **1** a bar on the pad cluster, **2** tap the target frame to switch.
Claude leaned B. **Owner picked A, EverQuest grid**, extended to **all 8 spells in one 2 × 4 block** (left side freed for pet controls later), with **◀ Back** and **Next ▶** target buttons. Reason: same-size buttons make every spell equally easy to hit, players arrange their own order, and Auto covers the main attack. Built v0.28. Tap-the-target-frame to switch is still open (not built).
Note: we first put the most-used spells at the bottom (nearest the thumb). **v0.29.1, owner:** flipped: first spells on top, main top left, because on his phone the thumb rests a little high on the grid. Grid is smaller (Medium default) with Small / Medium / Large in Settings. Back now cycles like Next in reverse. Classic layout removed (parked in the backlog). Settings itself needs a cleanup (backlog card, breakdown 8). **v0.33.2, owner:** the whole grid moved up one button's height off the bottom edge (felt unnatural that low); 1.5 is the fallback if 1 isn't enough. **v0.33.3, owner:** Auto now fires at any target in range, not only one that's already fighting you (run past and hit things); not from Hide or Feign Death, not on a sleeping mob.

## 2. Chat log
Now (before v0.30.1): 5 lines, bottom left, older lines faded, no scroll-back. Every hit you land or take wrote a line (and about a third of your pet's), so in a fight with DoTs ticking, "charm breaks!", "bags full" or a drop scrolled away in a second or two. Long tips wrapped to 2–3 lines.
Options: **A** quiet box (routine hits hidden, they float over heads anyway) plus a full history window; **B** All / Fight / Loot tabs on the box itself; **C** same box, tap for history.
**Owner picked A**, with one change: the chat box is **joystick space** (he moves by touching there), so it must never open anything; tapping, holding or triple-tapping it is out. The history opens from a **Log** button next to Menu, top right, away from both thumbs. Claude's call on the rest (owner OK'd): **4 lines, no fading** (EverQuest), and the Log panel **doesn't pause** the game, so you can keep moving while you read. Built v0.30.1.
Rule for later: routine lines are logged with kind `'fight'` (Log panel only), drops and copper with `'loot'`; everything else shows in the box. A hit on you of a fifth of your health or more, and spell resists, stay in the box. The same line twice in a row shows once with ×2.
Owner idea (Nov 18): the joystick doesn't need to be visible at all; the chat box area doubles as it, and spell and status cues can live elsewhere later.

## 3. Your frame
**Owner (Nov 18): clean enough for now, no changes.** The one problem he's seen is on the **target frame**: the debuffs on an enemy are a single line of names joined by dots (`tfx`), which gets hard to read once several are up (Rot · Rootgrip · Marked ...). Parked until spell icons exist; then buffs and debuffs become **small icons with a timer running down** (on your frame and the target's). Backlog card: "Buff and debuff icons with timers".

## 4. Target frame and boss cast bar
First parked, then **unparked by the owner the same night (Nov 18)**: rudimentary debuffs now, icons later.
Now: debuffs on one line joined by dots, cut off after about two; the frame grows over Log and Menu when a cast bar shows; no health number; still the old gold-trim look.
Options: **A** full-word coloured tags with seconds that wrap (like the buff bar), health % on the bar, Log/Menu move down with the frame, boss cast big in the middle of the screen; **B** two-letter codes on one line, thin cast bar under health; **C** same layout tidied, text list wraps.
**Owner's pick (A, with changes):**
- Plain grey frame (EverQuest style, like the grid).
- Health bar shows **actual health on the left** (e.g. 12/20) and **percent on the right**.
- Debuffs as **full-word tags** with seconds left (Rooted 6, Snared 4, Rot 9, Swarm 5, Marked), wrapping to more lines as needed. Rough version until spell icons exist; then each tag becomes an icon with the same timer (backlog card).
- **Cast bar only in the middle of the screen, never in the target frame.** Bosses and named only. It shows whoever is casting at you **even if you're targeting something else**; if you target the boss you already see it in the middle, so no need for both. (Today only Boss 1's Shadow Bolt is a cast, so nothing is lost.)
- Log and Menu move down when the frame grows, so it never covers them.
**Built v0.33.** Claude's calls: Stunned and Afraid tags added (they matter for the bolt); the small purple bar over the casting boss's head stays, since it shows *which* mob is casting; the minimap and DEV move down with Log/Menu. **v0.33.1 (owner):** your frame now matches: plain grey, health and mana as numbers left and percent right.

## 5. Slots 7–8 and Sit
Slots 7–8 already live in the 2 × 4 grid (v0.28), so only **Sit** was left: a round button on the left, the last bit of the old look. **Owner: keep it on the left, make it square to match the grid.** v0.30.2: Sit uses the grid's plain grey square style, **about 80% of a spell button's size** (owner: the left side has less on it, so it needn't be as big; **pet buttons later get this smaller size too**), and follows Settings → Grid size; it reads **Stand** with a gold border while you sit. The left side stays free for pet controls later.

## 6. Floating text over heads
Now: every number and word the same size (12px, a few 15px), rising straight up from one spot and fading from the first frame. DoT ticks, your hits and pet hits stack into one smear; they differ only by colour. Status words (Zz, MARKED, MISS) float away like damage.
Options: **A** spread out and hold (your hits big and white, DoT ticks and pet hits small, each nudged a little sideways so they never stack; solid most of the way, then fade; status words sit still over the head); **B** dealt arcs right, taken arcs left (Diablo); **C** only your hits and hits on you float (DoT ticks and pet hits only in the Log).
**Owner picked A** (Nov 18). **Built v0.33:** sizes: your hits 13px white, other numbers 11, DoT/pet/guard hits 9, milestone words 15. A new number within ~10px of one from the last 0.6s takes the next free spot around it (sideways first, then a row up). Solid for the first 65% of its life, then fades; numbers rise on an ease-out, words don't move and stack upward. Caller passes the kind: `floatText(x,y,txt,col,big,'hit'|'small')`; text that isn't a number counts as a word. Known limit: 6+ hits in the same instant on one mob still crowd a little; normal fights space them out.

## 7. Pet bar
Now (before v0.34): a 4px unlabeled line under the XP bar, easy to mistake for it; no name, no numbers, a timer only for Charm. No orders at all: the pet takes your target if it's fighting you, otherwise the nearest mob chasing you, and can't be called back.
Options: **A** pet frame under yours (name, health, what it's hitting), no buttons; **B** A plus two orders, **Attack** and **Back off**, on the left above Sit at Sit's size; **C** pet health and orders together bottom left.
**Owner picked B** (Nov 19), with: the pet's health bar **thinner than yours but the same length**; **Back off holds** the pet until you press Attack again; the frame names the pet (**Earth elemental**, **Fire elemental**, Skeleton, Minion, Floating sword, Charmed rat).
**Built v0.34:** a thin row at the bottom of your frame (name left, what it's hitting or **held** right, 6px bar). Timed pets show seconds left (Floating sword 84s, Charmed rat 6s), red under 5s. Attack and Back off show only while a pet is out; Back off turns gold while held. Attack works on a mob that isn't fighting you yet (so the pet can pull), never on a sleeping one; with no target it just ends the hold. Guard, Hold, Taunt (EverQuest's other orders) wait for groups.

## 8. Menu screens (Spells, Arrange, Settings)
Now (before v0.35): Menu opened a small list (Spells, Arrange buttons, Settings, Back to game), each opening its own window, so every change took two taps. Settings was one long list of 13 rows in no order: Change class at the top, Developer tools mixed in, long labels, pad-only rows appearing in the middle.
Options: **A** one window with two tabs (Spells, Settings), Arrange as a button on the Spells tab, Settings in four groups; **B** Settings in folding sections; **C** Settings as sub-pages.
**Owner picked A** (Nov 19). **Built v0.35:** Menu opens straight into one window with a ✕ and square grey tabs **Spells | Settings** (remembers the last tab for the session). Spells tab: **Arrange buttons on screen** at the top, then the spellbook and loadout as before. Settings in four groups with short labels: **Controls** (Layout, Grid size or Pad size + Flick distance, Hand, Movement, Drag stick), **Combat** (Tap an enemy (1st hit), Keep casting (Auto)), **Display** (Zoom, Minimap), **Game** (Change class, Developer tools). Same settings, same saves. Classic fan layout stays parked.

## 9. Character screen (Gear, Bags, Journal)
Now (before v0.36): the old rounded card with a Done button and three tabs. Gear: stats in one long grey sentence, then 8 text rows; **tapping a worn item took it off straight away** (easy to strip your weapon by accident). Bags: 4 × 4 cells with 9.5px names, details opening under the grid (often a scroll away). Equipping meant Bags to equip, Gear to see the result. Journal: Named and Creatures; rares mixed in with named.
Options: **A** same three tabs in the grey window, stats in a small block, tap a slot for details + Take off; **B** EverQuest paper doll: gear slots around your picture, stats beside it, bags below, one details strip; Journal its own tab; **C** one scrolling list (worn, then bags), text only.
Claude leaned B. **Owner picked B** (Nov 19). **Built v0.36:** grey window with ✕ and square tabs **Character | Journal** (the menu window's style). Doll: Head, Chest, Legs, Feet left; Ring, Hands, Weapon, Off-hand right; your rags picture in the middle at 4x; stats column on the right. Bags: 16 squares, two rows of 8, short name = the item's last word (smaller text for long words), rarity as the border colour, ×n for stacks. First tap selects (gold outline), the strip below does the rest: bags get Equip / Sell (near Marrow) / Destroy with the stat comparison; worn slots get Take off. After Equip the selection follows the item to its slot; after Take off it follows it to the bag. Journal adds a **Rares** section. Same saves.
Later: item icons replace the short names once the art pass draws them; the middle picture will show gear once gear shows on the character.

## 10. Moments (level up, death, loot, run summary)
Now (before v0.37): level up was gold floating text for about a second plus chat lines; death was a red screen and "You have died" for 3 seconds, then an automatic respawn, with the 10% XP loss never shown; drops floated their name and went only to the Log, so an uncommon looked like junk; **"bags full, item left behind" went only to the Log** (a bug: drops could vanish unseen); the crypt had no run summary (only the old Dungeon 1 did).
Options: **A** quiet, everything in the chat box; **B** one banner slot up top for big moments, a small death panel with Respawn, a small run summary panel; **C** full screens that pause the game.
Claude leaned B. **Owner picked B** (Nov 19), with changes: **no run summary panel** (no Stay / Leave), just a banner "Crypt cleared in m:ss"; **don't show junk** like rat tails.
**Built v0.37:** `banner(title,sub,col)` in `js/fx.js` (grey box under the cast bar, ~2.6s, queues, 1.8s each when more are waiting, muted during the sim). Banners: Level N + New: spells; Uncommon / Rare / Named / Key drop; Journal: first kill (named or rare); Bags full + item left behind; Crypt cleared in m:ss (`run.cryptT0` set on entering the crypt, cleared after the banner, so once per visit). Uncommon-or-better drops and bags full also go to the chat box; junk and commons stay in the Log. Death panel (`#deathUI`): Slain by X, −N XP, Respawn button; `player.dead` stays up until the button (no timer); hidden while the sim runs.

## 11. Start screen and class picker
Now (v0.37): the old rounded card. Title, a version line, **14 class buttons in a 3-wide grid** (with Lv for classes you've played), the current class's description, then a **10-bullet how-to list** and Play. Problems: **tapping a class reloads the game straight away**, so you can only read a class's description by switching to it; the how-to list is long and **out of date** (spell pad, Auto pill "top right", Dungeon 1 "levels 4 to 7"); descriptions range from one line to five, and only some say how the class solos (the design says players should be told this when they pick); nothing shows the class's role or look; it isn't the grey window style the other screens now use. Change class (Settings → Game) comes back here.
Options:
- **A Tidy one screen:** grey window, the 14 classes as square buttons each with a short role tag (Tank, Healer, Pet, CC, Melee, Caster, Hybrid) and Lv; **tapping selects** (gold outline) and shows the class's picture, role, **Solo: easy / steady / hard**, and a two-line description below; Play (reloads only if you picked a different class). The how-to list leaves this screen and becomes a short **How to play** tab in Menu.
- **B EverQuest two-step:** first a **character select** page: the classes you've played as rows (picture, name, level, where you left off) with Play, plus **New character** → the class picker from A. Feels most like an MMO and is ready for real characters and names later; one extra tap for someone new.
- **C One class at a time:** a big picture of the class (rags, 4x) with ◀ ▶ arrows or a swipe, role + solo rating + description under it, a row of 14 small chips on top to jump. Best for reading each class; slowest to compare.
Claude leans **A** now (small, finished; fixes the reload and the stale text), with B's character list as a later card once characters have names.
**Owner picked A** (Nov 19). **Built v0.38:** grey window, 4-wide grid of square class buttons (role, or Lv once played; one long word like Necromancer gets smaller text), tap selects with a gold outline and fills the info box (rags picture at 3x, name, role · Solo: X, `blurb`), Play switches class via `store` + reload with a one-time `sessionStorage` flag (`ashfen-go`) that starts the game after the reload. Change class opens it with a ✕; same class = Back to game (resumes, no `enterZone`). How-to list rewritten as Menu → **How to play**. B parked as a backlog card (character select list).

## 12. Minimap and full map (check)
Now (v0.41.1): 86px minimap top right (2px a tile, you in the middle, pins for places found, arrows on the rim toward exits off the edge); tap it for the full map (fills in as you explore, + / − zoom and pinch, Explored %, a legend of found places).
Found in the check:
- **Bug: Wolfwood had no minimap or map at all** (it was missing from a hand-kept list of areas). **Fixed v0.41.2:** every area built from a map file now gets a map automatically, so new areas can't be missed.
- **Last old-look window:** the map screen is still the rounded gold card with a gold title and a green "Back to game" button, and no ✕; the minimap has a rounded gold frame. (Log, Menu, 1st hit and Auto are still rounded gold pills too; outside this breakdown.)
- **Pins don't say which is which:** every exit is the same green square, and the names are only in the legend below, so with four exits you can't tell which square is the crypt tunnel.
- **No zone view:** each area only shows itself; nothing shows how the crossroads, tunnel, graveyard, crypt and Wolfwood connect.
- Fine as is: size, fill-in, rim arrows, zoom, explored %.
Options (rough):
- **A Tidy:** grey window with ✕ (menu style), square grey frame on the minimap, and each found pin on the map gets a **number** that matches a numbered legend row (1 Crossroads, 2 Crypt tunnel...).
- **B A plus a Zone tab:** square tabs **Area | Zone 1**; the Zone tab draws the five areas as boxes joined by their roads and tunnels, the one you're in outlined gold, ones you haven't been to as "?".
- **C A, but names on the map:** short names written beside each pin instead of numbers (crowds at 1x on small areas; reads well zoomed in).
Claude leans **A** (it's a check; small and finished), with B's zone view as a backlog card for when Zone 1 has its chapel and Town 1.
**Owner picked A** (Nov 19). **Built v0.42:** the map window has the Menu's header with a ✕ (the green Back to game button is gone), square grey zoom buttons and a square map border; the minimap has a square grey frame. Found places are numbered on the map (a coloured square with the number in it, kept inside the frame when it sits on an edge) and the list below uses the same numbers and colours. Numbers follow the order places are listed, so they stay the same each time you open the map. B's zone view went to the backlog.

## 13. Top pills (Log, Menu, 1st hit, Auto)
Now (v0.42): four rounded gold-trimmed pills, 26px tall, the last old-look buttons on the play screen. **Top left** under your frame: "1st hit on" and "Auto on" (gold text when on). **Top right** under the target frame: Log and Menu. Problems: they don't match the grey square style everywhere else; "1st hit on / off" spells the state in words, so the pill changes width when you toggle it; 26px is under the 44px tap size, fine for between-fight buttons but easy to miss.
Owner note (Nov 19): the minimap stays (fun to have); the full map gets another cleanup later (backlog).
Options (rough):
- **A Square, same spots:** grey square-cornered buttons in the grid's style, 32px tall, fixed width. 1st hit and Auto show **on** as a gold border and gold text, **off** as plain grey (no "on/off" words). Log and Menu unchanged in place.
- **B Merge the toggles into one row with Log and Menu, top right:** `[1st] [Auto] [Log] [Menu]` under the target frame; the top left under your frame is left clear for buffs. One place for every small button.
- **C Toggles become icons on your frame:** two small square chips inside the bottom-right corner of your frame (a sword for 1st hit, a loop for Auto), lit gold when on; Log and Menu go square (as A). Least clutter, but icons need art and must be learned.
Claude leans **A** (small, finished, nothing moves so muscle memory holds).
**Built v0.45 (owner, Nov 19: "fix up those buttons", A):** all four are grey squares in the grid's style (4px corners), 32px tall. 1st hit and Auto have a small light at the left, lit gold (and gold border and text) when on, dim grey when off; no on/off words, so the width never changes. Log has the gold border while the Log panel is open; Menu reads Done (gold) while arranging. The minimap, Log panel and DEV button moved down 6px.

## 14. Minimap look (owner, Nov 19: "the minimap doesn't look great")
Now (v0.45): each tile is the average colour of the painted ground under it, brightened, so it reads as blurry green with soft tan roads; pins are plain coloured squares; you're a gold dot (no facing); no area name.
Drafts: `art/drafts/ui-minimap-options.png` (made by `tools/ui_drafts.py` from the real crossroads map).
- **A Flat colours:** one clean colour per kind of ground (road, grass, trees, water, stone), so roads stand out; pins become the small map icons (15); you're a gold arrow that shows which way you face; the area name in a grey strip under it.
- **B Roads only:** dark ground, only roads, water and walls drawn. Quietest and easiest to read; loses the forest shapes.
- **C A plus monsters:** A, with red dots for monsters near you.
Claude leans **A** (cohesive with the flat grey UI; C's dots can be added later if wanted).
**Owner picked A** (Nov 19), with icons **much smaller** than the draft. **Built v0.48:** one flat colour per kind of ground, each area's grass/road/floor colour taken from its own painted ground (so Wolfwood still looks like dusk); roads come from the map file's road tiles (the `path` tag), not guessed from colour (the first try speckled Wolfwood). Found places are **plain shapes** (owner, after seeing tiny picture icons: shapes are enough, the full map shows what they are): 5 × 5 dots in the pin's colour with a black outline: **square** town, **circle** cave or dungeon door, **triangle** campfire, **diamond** named, **hollow square** hidden chest, **arrow** a way out (pointing out of the area). The full map's list shows each place's shape next to its number. You're a gold arrow showing the way you last moved (the full map uses it too). The area name sits in a grey strip along the bottom. Same size and spot; the full map gets the same flat colours.

## 15. Icons (owner, Nov 19: icons for spells and map places)
Same 12 × 12 shapes on a 16 × 16 grey square with the grid's 1px light border, three looks. Drafts: `art/drafts/ui-icon-styles.png`.
- **1 Plain:** grey/white shape, no colour. Quietest, most EverQuest.
- **2 Tinted:** the shape in the spell's colour (the colour chip each spell already has) or the pin's colour. Matches today's colour chips and pin colours.
- **3 Filled:** a dark square of that colour with a light shape. Boldest, most like classic MMO spell icons.
Draft shapes: Thornlash, Mend, Rootgrip, a fire nuke, Shield Bash, Raise Bones; Town, Dungeon door, Campfire, Way out, Named, Hidden chest. Rough first pass: references-first applies when each real icon is drawn (Thornlash still reads as a stick).
**Owner picked 2 Tinted** (Nov 19); the minimap uses plain shapes instead (owner), so style 2 is for spell icons. Claude leaned **2 Tinted** (keeps the grey UI quiet, colour carries meaning already used everywhere). Scope once picked: ~156 abilities across 14 classes share shapes by kind where it makes sense (every heal a cross variant, every root roots), plus ~6 map icons; the icon replaces the colour chip on spell buttons and the Spells list. Map icons ship with the minimap pass; spell icons can go class by class.

### 15b. How spell icons share shapes (Nov 20)
109 abilities across 14 classes (counted from `classes.js`): nuke 23, buff 12, heal 9, DoT 7, stun / area / pet / song 5 each, snare 4, and 1–3 of everything else. Draft: `art/drafts/ui-spell-icons-b.png` (made by `tools/ui_spell_icons.py`, real spell colours, tinted style with a 1px dark outline so shapes read on grey).
- **A One shape per kind (~30):** every damage spell is the same bolt, so Thornlash, Strike and Throw Stone differ only by colour (grey-ish spells blur).
- **B Kind + what hits you (~40):** support kinds share one shape (every heal a cross, every snare a shackled boot, every DoT a drip, every stun a star, armour buffs a shield, fear a ghost, feign a tombstone, pets their creature); damage spells show the weapon or element (sword, dagger, fist, arrow, rock, thorn, flame, frost, holy, shadow). Colour tells shared shapes apart. Drawn for Druid, Necromancer and Warrior.
- **C One shape per spell (109):** most distinct, slowest; the label already names the spell.
Claude leans **B**. Note: a shared shape on two similar colours (Rot and Plague) looks the same, but no class has both, so it never matters on one grid. Rough first pass: each real icon still gets references first when drawn.

**Owner picked B** (Nov 20). **Built v0.50 for Druid, Necromancer and Warrior** (the drafted shapes): shapes in `js/data/icons.js`, each ability picks one with `icon:'name'` in `classes.js`; `iconHTML` in `ui.js` tints and outlines it and snaps its size so every icon pixel is a whole number of screen pixels. Shows on the spell grid, the Spells list, the drag ghost and the Next chip. Classes without icons keep the colour chip. **Next:** the other 11 classes, references first, reusing shared shapes (heal cross, snare boot, DoT drip, stun star, shield, skull) and adding weapon and element shapes (dagger, fist, arrow, flame, frost, holy, shadow, note for songs...).

**Drafts for the other 11 classes (Nov 20):** `art/drafts/ui-spell-icons-all-1.png` (Rogue, Cleric, Enchanter, Paladin, Shadow Knight, Wizard) and `-all-2.png` (Magician, Ranger, Monk, Shaman, Bard), made by `tools/ui_spell_icons_all.py`. 47 new shapes, plus the shipped ones reused (heal cross, boot, drip, star, shield, skull, ghost, tomb, tap, sword, flame). Owner asked for them in bulk to review all at once. Choices worth a look: Cleric Heal vs GHeal (plain cross vs cross with rays, same colour family), Magician Earth and Fire pets share one golem (colour tells them apart), Bard songs share one note (colour tells them apart), Burnout and Rapid Fire share an "up" arrow, Wizard Mana Shield, Magician Flame Shield and Cleric Divine Aura share a bubble. Shapes drawn from what the thing looks like; no photo reference pass yet. **Owner: build them all** (Nov 20). **Built v0.53**: every class now has icons. Next: owner names any that don't read on the phone; those get a references-first redraw.

## 16. Camera under the top bars (owner, Nov 20)
Arriving at a northern way in or walking to a map's top edge put your character behind the top frames. Options: **A** stop the view under the bars (measure the real bottom of the top UI over you and scroll just far enough; only changes anything near map edges), **B** always centre you in the open space between the bars and the spell grid (shifts the view everywhere), **C** fade the bars when you're under them (still covers you). Claude leaned A. **Owner picked A** (Nov 20), and added: no black past the edge, the visuals should still show behind the bars. **Built v0.55**: `measureSafe()` in `render.js` (10 times a second, top and bottom UI over your sprite), eased camera limits, and a ground-only mirror of each area's top and bottom edge (`edgeTop` / `edgeBot` from `paintArea`) drawn past the map edge.

## 17. Never pause: windows and the skill pick (owner, Nov 20)
Now: Menu, Character screen, full Map, yes/no prompts (Summon is the live one) and Arrange all stop the game (`running=false`) behind a 90% black cover. Just un-pausing would mean fighting blind behind it.
**Skill pick (decided):** reaching level 10, 12 or 14 opens nothing; the Menu button pulses gold and the Skills tab inside pulses until you pick (not the spell's own button). The level-up banner adds "Skill choice: open Menu". The pulse must look different from the steady gold light on the 1st hit / Auto toggles.
**All options:** yes/no prompts become a small strip under the cast bar (two buttons; walking away cancels); Arrange keeps running; only the DEV panel and the start screen may still pause.
Options for the windows:
- **A See-through:** windows stay centred, the cover goes light so the world shows around them, your frame stays on top, the window edge flashes red on a hit. Smallest; but the window sits over your character.
- **B Half window:** windows slide up from the bottom and take about half the screen; the camera shifts so you and what's near you stay in view in the top half; frames stay up. Spell grid hidden while open. The full Map stays full-screen.
- **C Warn me:** windows stay dark and full-screen; a red "Under attack" strip with your health shows when you're hit; tap it to close. Cheap, but you learn of danger only after the hit.
Claude leaned **B** (the only one where you can see yourself and nearby mobs). **Owner picked A** (Nov 20). **Built v0.56:** `.modal` cover 0.38 black (DEV and start screen keep 0.9 and still pause, `pausing()` in `ui.js`), windows padded below the measured top frames (`--hudH`), `#hud` above windows; `pauseWatch()` (10/s, with the HUD) flashes the open card's border red when health drops, toggles `.due` (gold pulse, `skpulse`) on Menu and the Skills tab while `forkDue()`, and runs `promptWatch()`. Prompt strip `#promptUI` (not a modal) cancels past two tiles or on an area change. `openModal` closes any other window and opens the Menu on Skills when a choice is waiting. B stays the fallback if the covered middle bites in play.

## 18. Buff and debuff icons with timers (Nov 20)
Unblocked now that every spell has an icon (v0.53); this is the board's "Buff and debuff icons with timers" card.
**Now:** your buffs are small coloured word tags under your frame ("Sprint 9"); effects on the target are full-word tags with seconds ("Rooted 6", "Rot 14", "Chilled x3"), mixed in with traits that never run out (Rare, Undead, Armored, Marked). With 4+ up they wrap to a second and third line, which pushes Log, Menu and the minimap down and is hard to read mid-fight.
**Same in every option:** each effect becomes its 16px spell icon (the same shapes and tints as the spell grid) in one row; DoTs use their spell's icon, states use the shared ones (roots, boot, star, ghost for fear, mez for sleep, frost for Chilled with a small x3 for stacks). Traits leave the row and sit as plain grey words after the level ("Lv 8  Undead"). Tap an icon to see its name for a moment (nothing pauses). Long buffs (no timer) show no number.
Options, draft `art/drafts/ui-buff-icons.png` (made by `tools/ui_buff_icons.py`):
- **A Number under:** seconds under every timed icon, red at 3 and under. Most exact; adds a line of height to both frames.
- **B Dark shade fills down:** the icon darkens from the top as it runs out (like a cooldown), a small number in the corner only under 10s, red edge blinking in the last 3s. Same height as one row of icons.
- **C Thin bar under:** a 2px bar under each icon drains, no numbers, red in the last 3s. Calmest; you guess the seconds.
Claude leans **B**: the row stays one line high, you can read "about half left" at a glance, and exact seconds show only when they start to matter (re-rooting, re-snaring). Risk: the shade must look different from a spell cooldown on the grid; it reads differently because these sit on the frames, not the grid, and have no grey-out. **Owner picked B** (Nov 20). **Built v0.58:** `fxRow()` in `render.js` draws both rows (rebuilt only when the set of effects changes; shade height, corner number and `.low` red blink update in place, 10 times a second); `fxFull()` keeps each effect's full time (the longest since it was last put up, so a refresh starts over). Buff icons come from the ability that gives the buff (`BUFFS[k].icon`). Traits in `#tlv`. Tap tip `#fxtip` in `ui.js`. Next: owner plays and says if the shade reads as different from spell cooldowns.

## 19. Windows match the HUD (consistency check, Nov 20)
Breakdowns 1–18 are done, so this pass opened every screen at phone size and looked for anything breaking the RuneScape rule (one panel style, one button style everywhere).
**Main gap:** the HUD has been plain grey squares since v0.33–v0.45 (`#282828` panels, `#8a8a8a` edges), but every window (Menu, Character, Map, start screen) still has the older look: purple-black gradient, gold-brown edge, rounded buttons with a shine. Two styles on one screen.
Options, drafts `art/drafts/ui-window-looks-menu.png` and `-char.png` (the real game restyled, by `tools/ui_window_looks.py`):
- **A Plain grey, white titles:** windows and their buttons use the HUD's grey and edges; gold only means "on / selected".
- **B Plain grey, gold titles:** same, but window titles and section headings (Spellbook, Loadout, Controls) stay gold so you can scan long windows.
- **C Dark, grey edges:** keep the dark windows, just square the corners and swap gold-brown edges for grey. Smallest change; still two looks.
Claude leans **B**: one look everywhere, and the gold headings help on the long Spells and Settings pages.
**Small fixes found (go with any option):**
1. A selected tab and the gold "skill choice waiting" pulse look the same in a still frame (both gold edges). Selected = lighter fill, white text, no gold; only the pulse uses gold.
2. "How to play" wraps to two lines on the tab; rename it **Help**.
3. The Skills tab has a big "Back to game" button at the bottom; no other window does (✕ closes everywhere). Remove it.
4. Stale text: "Sell near Marrow" above the bags shows where no Marrow exists; Help says to sell to Marrow and describes the old default movement. Hide the sell note when no merchant is near; refresh Help.
5. Character window title "Druid 10" → "Druid · Lv 10" (matches the start screen).
6. Start screen's green Play button is the last green button; make it the grey button with a gold edge (main action).

**Owner picked B and all six fixes** (Nov 20). **Built v0.60:** one CSS block at the end of `css/game.css` ("Windows match the HUD"); old purple overrides for the Menu's buttons and Arrange removed; Change class lost its inline colours; tab renamed Help; the Menu's Back to game button removed; the sell note shows only near Marrow; titles read "Druid · Lv 10". Rules saved in `docs/area-rules.md` (UI look).

## 20. Minimap and full map cleanup (owner, Nov 20)
Owner: doesn't love the minimap icons, wants a better way to show where you are, plus an overall cleanup of the map. Drafts from the real map data: `art/drafts/ui-map-looks-mini.png` (crossroads, Wolfwood, graveyard) and `-full.png` (the real map window restyled), made by `tools/ui_map_looks.py` + `.js`.
**What's wrong now:** the ground is one flat square per tile, so woods read as a noisy checkerboard and the fog edge is a staircase; the 5-pixel code shapes (square, circle, triangle, diamond) have to be learned; the "you" arrow is small and about the same gold as the campfire; the full map needs numbers plus a list to say what anything is.
**Same in every option (the cleanup):**
- **Ground drawn, not tiled:** trees merge into soft forest masses with lumpy edges, water gets round edges, roads are clean lines (wide roads stay solid), buildings plain grey blocks; each area keeps its own colours (v0.48's per-area ground colours).
- **Soft fog edge** where the explored part ends, instead of square steps.
- **Picture pins** instead of code shapes: house = town, arch = door down (cave, crypt, sinkhole), flame = campfire, skull = named, chest = hidden chest, arrow = way out pointing out of the area. Black outline, kind colour. Exits off the minimap still point from the rim.
- **Full map window:** "% explored" moves into the header, zoom − / + sit on the map's corner, so the map gets the room.
**"You" on the minimap (pick one):**
- **A Clean square:** square minimap with the name strip; you're a bigger gold arrow with a white edge and a faint light cone showing which way you face.
- **B Pictures + ring:** square, no name strip (the name moves to the full map); you're a gold dot in a white ring with a small white pointer on its edge (Google Maps / Guild Wars 2 style). Can't be confused with a pin.
- **C Round compass:** round minimap with a grey ring, name on a tab under it; you're the same ring-and-pointer; pins shrink to coloured dots (pictures only on the full map).
**Full map (pick one):**
- **A Names on the map:** each place's name sits next to its pin; no list.
- **B Tap a pin:** pins only; tapping one shows a strip under the map with the name, what it is, and how far and which way ("Wolfwood · way out · 26 tiles north").
- **C Short list by kind:** pins only on the map; a compact list underneath grouped as Ways out, Ways down, Named, Rest and finds.
Claude leans **minimap B + full map A**: the ring can't be mistaken for anything else on the map, picture pins need no learning, and names on the map mean no matching numbers to a list (B's tap strip can come later if labels crowd in bigger areas). The drawn ground is the biggest single win and works with any pick.

**Owner picked B, but cleaner and smaller** (Nov 20): "a mix between B and what we have now": keep today's small, simple look, not the chunkier draft. **Built v0.61:** minimap stays 2 px a tile with the name strip; ground drawn in flat colours (trees and water as rounded masses with no highlights or lumps, roads as clean lines, wide roads solid, soft fog edge); 5 × 5 picture pins (pointer, house, arch, flame, skull, chest) in their own colours; you = gold dot in a white ring with a white pointer. Full map = option B: no numbers or list, tap a pin for a strip (name, what it is, tiles and direction), "% explored" in the title, + / − on the map's corner. Code: `mmGround` (drawn ground per size, cached), `mmPicture` (cut by the explored mask `Z.m` with a blurred edge), the minimap rebuilds its picture only when new tiles are revealed (`compDirty`), `mapSel` + a tap handler on `#mapcv`.

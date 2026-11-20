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
11. Start screen and class picker
12. Minimap and full map (check only)

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

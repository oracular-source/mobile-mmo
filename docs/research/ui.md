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
3. Your frame (name, level, health, mana, XP, buffs) (reviewed Nov 18: fine for now)
4. Target frame and boss cast bar (back burner, Nov 18: not right yet, revisit later)
5. Slots 7–8 and Sit (done v0.30.2; slots 7–8 already moved into the grid in v0.28)
6. Floating text over heads (next)
7. Pet bar
8. Menu screens (Spells, Arrange, Settings)
9. Character screen (Gear, Bags, Journal)
10. Moments (level up, death, loot, run summary)
11. Start screen and class picker
12. Minimap and full map (check only)

## 1. Spell pad and Next ⟳
Now: a round pad, main attack in the middle, five round buttons around it (about 43px, 9px labels), flick or tap; Next ⟳ floats above it. A "classic" fan layout exists in Settings.
Options: **A** EQ grid 2×3 (main bottom-right); **B** arc with a big main button in the corner and five square buttons around it; **C** keep the round pad, just bigger buttons and labels. Next ⟳: **1** a bar on the pad cluster, **2** tap the target frame to switch.
Claude leaned B. **Owner picked A, EverQuest grid**, extended to **all 8 spells in one 2 × 4 block** (left side freed for pet controls later), with **◀ Back** and **Next ▶** target buttons. Reason: same-size buttons make every spell equally easy to hit, players arrange their own order, and Auto covers the main attack. Built v0.28. Tap-the-target-frame to switch is still open (not built).
Note: we first put the most-used spells at the bottom (nearest the thumb). **v0.29.1, owner:** flipped: first spells on top, main top left, because on his phone the thumb rests a little high on the grid. Grid is smaller (Medium default) with Small / Medium / Large in Settings. Back now cycles like Next in reverse. Classic layout removed (parked in the backlog). Settings itself needs a cleanup (backlog card, breakdown 8).

## 2. Chat log
Now (before v0.30.1): 5 lines, bottom left, older lines faded, no scroll-back. Every hit you land or take wrote a line (and about a third of your pet's), so in a fight with DoTs ticking, "charm breaks!", "bags full" or a drop scrolled away in a second or two. Long tips wrapped to 2–3 lines.
Options: **A** quiet box (routine hits hidden, they float over heads anyway) plus a full history window; **B** All / Fight / Loot tabs on the box itself; **C** same box, tap for history.
**Owner picked A**, with one change: the chat box is **joystick space** (he moves by touching there), so it must never open anything; tapping, holding or triple-tapping it is out. The history opens from a **Log** button next to Menu, top right, away from both thumbs. Claude's call on the rest (owner OK'd): **4 lines, no fading** (EverQuest), and the Log panel **doesn't pause** the game, so you can keep moving while you read. Built v0.30.1.
Rule for later: routine lines are logged with kind `'fight'` (Log panel only), drops and copper with `'loot'`; everything else shows in the box. A hit on you of a fifth of your health or more, and spell resists, stay in the box. The same line twice in a row shows once with ×2.
Owner idea (Nov 18): the joystick doesn't need to be visible at all; the chat box area doubles as it, and spell and status cues can live elsewhere later.

## 3. Your frame
**Owner (Nov 18): clean enough for now, no changes.** The one problem he's seen is on the **target frame**: the debuffs on an enemy are a single line of names joined by dots (`tfx`), which gets hard to read once several are up (Rot · Rootgrip · Marked ...). Parked until spell icons exist; then buffs and debuffs become **small icons with a timer running down** (on your frame and the target's). Backlog card: "Buff and debuff icons with timers".

## 4. Target frame and boss cast bar
**Owner (Nov 18): not right yet, but back burner** for the UI pass; revisit later (with the debuff icons card). Backlog card: "Target frame and boss cast bar rework".

## 5. Slots 7–8 and Sit
Slots 7–8 already live in the 2 × 4 grid (v0.28), so only **Sit** was left: a round button on the left, the last bit of the old look. **Owner: keep it on the left, make it square to match the grid.** v0.30.2: Sit uses the grid's plain grey square style, **about 80% of a spell button's size** (owner: the left side has less on it, so it needn't be as big; **pet buttons later get this smaller size too**), and follows Settings → Grid size; it reads **Stand** with a gold border while you sit. The left side stays free for pet controls later.

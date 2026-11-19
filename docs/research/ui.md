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
1. Spell pad and Next ⟳ (in progress)
2. Chat log
3. Your frame (name, level, health, mana, XP, buffs)
4. Target frame and boss cast bar
5. Slots 7–8 and Sit
6. Floating text over heads
7. Pet bar
8. Menu screens (Spells, Arrange, Settings)
9. Character screen (Gear, Bags, Journal)
10. Moments (level up, death, loot, run summary)
11. Start screen and class picker
12. Minimap and full map (check only)

## 1. Spell pad and Next ⟳
Now: a round pad, main attack in the middle, five round buttons around it (about 43px, 9px labels), flick or tap; Next ⟳ floats above it. A "classic" fan layout exists in Settings.
Options: **A** EQ grid 2×3 (main bottom-right); **B** arc with a big main button in the corner and five square buttons around it; **C** keep the round pad, just bigger buttons and labels. Next ⟳: **1** a bar on the pad cluster, **2** tap the target frame to switch.
Pick (Claude): B + Next 1 and 2. Owner to choose.

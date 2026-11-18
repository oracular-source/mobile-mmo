# Coding practices for a browser game

Where we are today (v0.13.1): one `index.html`, about 1,560 lines but ~119 KB (many very long lines), plain JavaScript on a canvas, no build step, hosted on GitHub Pages.

## 1. Splitting files without a build step
- **What people do:** Every current browser understands JavaScript modules: separate `.js` files that `import` what they need from each other, loaded with `<script type="module">`. Many small canvas games ship this way on GitHub Pages with no bundler, no npm and no install step.
- **The catch:** modules don't load when you open the file straight from your computer (`file://`); they need a web server. GitHub Pages is one, so the live link works. For headless tests we run a tiny local server.
- **Split by job, not by size.** Each file should answer one question ("what are the classes?", "how does combat work?", "how is it drawn?").

**What this means for us:** the plan on the board (page + `css/game.css` + `js/` split into data, combat, world, input, UI, render, main) matches common practice. Add a short header comment to each file saying what it's for, and keep the game playable after every step of the split.

## 2. Data vs. code ("data-driven")
- **What people do:** keep *what* (stats, spells, mobs, items, zones) in data tables and *how* (rules) in code. Changing a number never means editing logic, new content is mostly new data, and data files are easy to read and diff.
- Nystrom's *Game Programming Patterns* calls a close cousin of this the **Type Object** pattern: one generic "mob" or "ability" and many data entries that describe kinds of them. That's exactly our generic ability kinds (nuke, heal, dot…).

**What this means for us:** we already do this well. In the split, move `CLASSES`, `TYPES`, `ITEMS`, `NEED`, sprites and palette into `js/data/` files with no game logic in them. The planned class `rotation` (solo combo) belongs there too.

## 3. The game loop
- **What people do:** the loop is *read input → update the world → draw*, every frame. The widely cited advice (Glenn Fiedler's "Fix Your Timestep") is to update game rules in **fixed steps** (e.g. 30 or 60 times a second) and draw as often as the screen allows. Fixed steps make the game behave the same on fast and slow phones and make simulations repeatable. Some guides suggest 30 updates a second on mobile to save battery.
- **Ours today:** one update per frame with a variable step, capped at 0.05 s so a slow frame can't jump too far. Fine for now, but a fight can play out slightly differently at 30 vs 120 frames a second.

**What this means for us:** not urgent for the split. Worth doing with the testing grounds, since a headless sim should run in fixed steps anyway. Added to the idea backlog.

## 4. Useful patterns (from *Game Programming Patterns*)
- **State:** a character is in one state at a time (idle, chasing, casting, fleeing, returning home), each with its own rules. Clearer mob AI than lots of yes/no flags.
- **Observer / events:** the game announces "mob died", "level up", "item looted", and other parts (chat log, journal, sound, quests later) listen. Keeps combat code from knowing about every screen.
- **Object pool:** reuse objects for things created constantly (damage numbers, sparks, projectiles) instead of making new ones, which avoids small stutters on phones.
- Advice that repeats everywhere: start simple and add a pattern only when the problem shows up.

**What this means for us:** an event list fits well during the split (combat → chat log/journal). The others wait until there's a reason (feel pass for pooling, mob AI work for states).

## 5. Saves
- **What people do:** put a **version number** in every save. When the format changes, bump the version and write a small "upgrade" step so old saves load instead of breaking. Wrap saving and loading so a full or blocked storage, or a damaged save, never crashes the game. Fill in missing values with defaults. `localStorage` is fine for small saves; offering an export/backup is a nice extra.
- **Ours today:** saves (per-class progress, bags, settings) go into `localStorage` with no version number.

**What this means for us:** add a save version before more classes and systems pile on, ideally right after the split (one `js/save.js` file). Added to the idea backlog.

## 6. Randomness you can repeat
- **What people do:** `Math.random()` can't be "seeded", so every run differs. Games that need repeatable results (testing, balancing, replaying a bug) use a small seeded generator (e.g. *mulberry32*, a few lines of code): same seed in, same rolls out. Players still get a fresh seed each session, so nothing feels scripted.
- **Ours today:** `Math.random()` is used in 16 places.

**What this means for us:** route all game rolls through one `rng()` function during the split. The testing grounds can then run each class with fixed seeds and give stable balance numbers.

## 7. Phone performance (canvas)
- Draw at low resolution and scale up (we do), use `requestAnimationFrame` (we do), pre-draw things that don't change (we do for lighting, v0.8.1).
- Avoid touching the page layout (HTML elements) every frame; update the HUD a few times a second instead (we do: 10/s).
- Big, well-spaced touch targets (about 44 px or more), and `touch-action: none` on the game area so the browser doesn't scroll or zoom.
- Test on a mid-range phone, not just a fast one.

**What this means for us:** we're in good shape; keep these rules in `CLAUDE.md` so the split doesn't lose them.

## 8. Testing
- Keep the rules runnable without drawing, so a script can play thousands of fights quickly. Combined with seeded randomness and fixed steps, results are repeatable, which is what makes automated balance checks trustworthy.

**What this means for us:** this is the testing-grounds card. The split should make sure combat and world code don't call drawing code directly.

## Sources
- [Game Programming Patterns: contents](https://gameprogrammingpatterns.com/contents.html) and [Object Pool](https://gameprogrammingpatterns.com/object-pool.html) (Robert Nystrom)
- [Fix Your Timestep](http://gafferongames.com/game-physics/fix-your-timestep/) (Glenn Fiedler) and a [fixed vs. variable timestep summary](https://bugnet.io/blog/fixed-timestep-vs-variable-timestep-which-to-use)
- [Game loop skill notes (30 Hz on mobile, cap frame time)](https://skills.sh/dadbodgeoff/drift/game-loop)
- [Native ES modules, no build](https://www.vivianvoss.net/blog/the-esmodules-replacement); [example static game on GitHub Pages](https://mintlify.wiki/apursley2012/treasure-hunt-game/quickstart)
- [What is data-driven design? (Game Dev Stack Exchange)](https://backiee.wasmer.app/http_gamedev_stackexchange_com/questions/59638/what-is-data-driven-design)
- [Web game save best practices](https://bugnet.io/blog/game-save-best-practices-web); [Meta: version your save schema](https://developers.meta.com/horizon/documentation/native/ps-save-game-best-practices/)
- [Seeded RNG for testing, balancing and restoring state](https://npmjs.com/package/rung); [Cliffski on needing determinism for balance testing](https://www.positech.co.uk/cliffsblog/2026/06/)
- [web.dev: canvas performance](https://web.dev/articles/canvas-performance/); [mobile HTML5 game touch guidance](https://dev.to/gamh5games/optimizing-html5-action-games-for-mobile-devices-19ce)

# MMO development lessons

We're single-player until phase 3. These notes are about choices now that make phase 3 easier, plus design lessons from older online worlds.

## 1. The server is the boss ("authoritative server")
- **The core rule:** never trust the player's device. If a player could gain anything by lying (position, damage, loot, gold), the server decides it. The phone sends *what the player tried to do* ("cast Lifetap on mob 12"), the server checks it, runs the rules, and sends back what happened.
- **Keeping it responsive:** waiting for the server makes controls feel laggy, so the phone **predicts** its own movement right away and quietly corrects if the server disagrees. Other players are shown slightly in the past and smoothly moved between updates. (Gabriel Gambetta's "Fast-Paced Multiplayer" series explains this simply.)
- **Tab-target helps us:** EverQuest-style combat (pick a target, cast, cooldowns) tolerates a bit of delay far better than aim-based action games. We mostly need prediction for movement, not for hits.
- **Common shortcut and its cost:** many games trust the client for movement at first because it's easy, then fight speed hacks later.

**What this means for us now:**
- Keep **game rules** (combat, threat, loot rolls, XP) in their own files that never read the joystick or the screen. Input turns into simple "actions"; rules process actions; rendering just draws the result. That separation is exactly what a server would need, so the same rule files could later run on a server (Nakama supports JavaScript-style server code).
- Loot and gold should come from rules, never from the UI. (Already true.)
- Don't build anything multiplayer yet (phase 3 rule).

## 2. World structure
- The classic pattern (EverQuest-era) is a shared overworld plus **instanced dungeons** per group. That's already our plan: Gate Road shared later, Dungeon 1 instanced.
- Ideas already on the board (first-hit tagging, extra spawns when crowded, personal loot, lockouts) are the standard answers to camping and kill-stealing.

## 3. Design "laws" from older online worlds
Raph Koster (Ultima Online, Star Wars Galaxies) collected rules of thumb from MUD and early MMO designers. Ones that fit us:
- **Players will work out every formula** by testing. Assume damage, resist and drop numbers become public; keep them fair and understandable.
- **Players will automate whatever is tedious.** What they script tells you what isn't fun. (Relevant to our Auto toggle: if people want everything automated, that part needs work.)
- **Many paths to advance** keep people around; classes are one form of expression among several.
- **A finished story gets used up fast.** Content can't be made as fast as players eat it, so lasting MMOs lean on repeatable systems (camps, dungeon runs, gear chase), which matches our short repeatable runs.
- **Online economies are hard.** Keep money simple until there's trading.
- Koster also warns these are challenges to question, not commandments.

## Sources
- [Gabriel Gambetta: Client-Server Game Architecture](https://gabrielgambetta.com/client-server-game-architecture.html) and [part 1 summary](https://www.gabrielgambetta.com/fpm1.html)
- [AccelByte: server-authoritative logic to prevent cheating](https://accelbyte.io/blog/server-authoritative-logic-to-prevent-cheating)
- [Mirror networking: never trust the client](https://mirror-networking.gitbook.io/docs/security/cheating)
- [Photon: MMO backend eras, overworld plus instanced dungeons](https://blog.photonengine.com/building-a-seamless-mmo-backend-across-machines/)
- [Raph Koster: The Laws of Online World Design](https://www.raphkoster.com/?p=15036) ([full list mirror with discussion](https://paizo.com/threads/rzs2p8g6))

# DOUBLE TAKE — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Fanyway/best-spot-the-difference-game-20261121-0451-/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Fanyway/best-spot-the-difference-game-20261121-0451-/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Two pictures, side by side. They look the same — they are not. Find all
7 differences in each scene before the clock runs out.

## How to play

- **Click** a difference on either panel (A or B) to mark it with a gold ring.
- Each find scores points; consecutive finds build a **combo** up to ×5.
- A wrong click costs **3 seconds** and resets your combo.
- **H** (or the Hint button) pulses a ring around a random unfound difference — 3 hints per level.
- **R** restarts the scene, **N** goes to the next scene after a clear.

## The scenes

1. **Sunset Market** — a fruit stall at golden hour (warm-up)
2. **Coral Reef** — fish, corals and a treasure chest (deeper water)
3. **Night Train** — a moonlit railway crossing (last stop)

Every scene hides 7 differences: a missing object, a colour change, an extra
object, a flipped element, a size change, a moved object and a pattern change.
Each level runs on a 90-second clock with a visible pressure bar; clearing a
level earns stars and a time bonus.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

All art is drawn procedurally with canvas 2D by the game's own code, all
sounds are a small WebAudio synth — no images, fonts or audio files, no
network requests. Static files under `game/`, handed in by `main.ts`.

Built by an AI agent for make.fun's "Make the best spot the difference game"
bounty.

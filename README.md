# 🧩 NEON 2048 — Kedbyte Arcade · Cartridge 04

A premium neon take on the classic 2048 merge puzzle, hand-built by **Kedbyte — Arcade Division**.
Slide glowing tiles, chain fiery merges, and forge the legendary white-hot **2048** tile.

Built with React, TypeScript, Vite and Tailwind CSS — no game libraries, every animation hand-rolled.

## Features

- **Silky tile physics** — tiles glide on eased transitions; merges pop with particle bursts and floating `+N` scores
- **Screen juice** — screen shake on big merges (128+), animated score counter, rotating molten board frame
- **The tile ramp** — earth → fire → gold → white-hot, each tier with its own glow; the 2048 tile *breathes*
- **Rising-pitch audio** — every merge plays a blip that climbs with the tile's power of two; big merges drop a sub-bass thump (WebAudio, zero samples)
- **Undo** — one-level undo (`Z`), because mercy is a feature
- **Win & endless** — forge 2048 to win, then keep pushing toward the platinum 4096
- **Full stats** — score, moves, top tile, persistent best per browser
- **Controls** — arrows / WASD, swipe on touch, on-screen D-pad on phones
- **Living world** — drifting ghost-number embers, warm nebula, scanlines and a sweeping light band
- **Kedbyte branding** — presents splash, arcade-division lockup, in-board watermark

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build (dist/)
```

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Slide tiles | `← ↑ ↓ →` / `WASD` | Swipe or D-pad |
| Undo | `Z` | — |
| New run | `R` | Center button |
| Mute | `M` | Speaker button |

## Scoring

Merging two tiles of value `N` scores `2N`. Chain merges across moves to climb the leaderboard of one — your best is saved locally.

## The Neon Arcade series — by Kedbyte

1. 🐍 `serpent-snake-game` — arcade snake
2. 🧱 `brickstorm-breakout-game` — neon breakout
3. 🚀 `voidbreaker-asteroid-game` — asteroid blaster
4. 🧩 `neon-2048-game` — this one

Every cartridge is built by **Kedbyte — Arcade Division**: hand-rolled engines,
procedural audio, and a shared neon identity. No game frameworks, no asset packs.

## License

MIT · © 2026 Kedbyte

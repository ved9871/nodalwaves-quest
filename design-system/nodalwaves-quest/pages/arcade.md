# Page override — Arcade Protocol (`/arcade`)

Alternate homepage for a Gen Z, gaming, and collectible-minded audience. Everything in `../MASTER.md` still applies
(brand names, logo, compliance copy, accessibility checklist) **except** the rules this file overrides.

Styles live in `client/src/pages/arcade.css`; every class is prefixed `arc-` so none collide with Tailwind utilities
generated from theme tokens.

## Overrides

| Area | Master (Chrome Command) | Arcade Protocol |
|---|---|---|
| Style | HUD / sci-fi FUI, restrained | Retro-futurism + vibrant block-based: CRT scanlines, glitch headline, synthwave grid floor |
| Background | `#050507` | `#08080A` |
| Primary | `#CE0E2D` | Neon crimson `#FF1A3C` (soft `#FF4D66` for small text, deep `#8B0A1E` for pixel shadows) |
| Secondary | Chrome `#C6CDD6` | Silver `#C0C0C0` + chrome gradient text |
| Display font | Space Grotesk | Orbitron 500–900, uppercase |
| Body font | Inter | Exo 2 |
| Shapes | 10px radius panels | Cut-corner frames (`arc-frame` + `arc-cut`), slanted buttons, diamond bullets |
| Glitch / scanlines | Anti-pattern | Allowed — headline and page overlay only, never on body copy |

Still banned here: neon green, magenta, cyan (the usual cyberpunk palette) — the brand stays crimson, silver, black.

## Components

- `Glitch` — base text plus two offset layers drawn as `::before`/`::after` with `content: attr(data-text) / ""`.
  Don't use duplicate DOM spans for the layers: `aria-hidden` hides them from screen readers but not from
  search engines or copy/paste, so the H1 would read "LEVEL UP LEVEL UP LEVEL UP".
- `Frame` — cut-corner panel; tones `default`, `hot` (crimson edge), `muted` (locked).
- `arc-btn` / `arc-btn-face` — primary slanted button; glow via `filter: drop-shadow` on the unclipped parent.
- `arc-btn-alt` — secondary slanted outline button.
- `PlayerCard` — holographic player card, pointer-tilt on mouse only, static under reduced motion.
- `Ticker` — marquee with a visible pause button; pauses on hover and focus; static under reduced motion.
- `Seg` — 10-segment stat bar; always pair with an `sr-only` value when it carries information.

## Collectible framing (compliance)

Badges use a trading-card look with rarity tiers (Common, Rare, Epic, Legendary), but copy must never call them NFTs,
tokens, mintable, tradeable, or valuable. Keep the line: "Badges are in-app achievements. They aren't NFTs or tokens,
and they have no monetary value." No "insert coin", "loot", "battle pass", or anything that implies paying or payouts.

## Motion

Glitch bursts (3.4s cycle), grid floor scroll (2.4s), marquee (40s), card float (6s), legendary holo sheen (5s).
All disabled under `prefers-reduced-motion`; glitch layers are removed entirely.

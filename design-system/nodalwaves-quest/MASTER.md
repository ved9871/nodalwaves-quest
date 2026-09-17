# NodalQuest — Design System (Master)

**Style:** Chrome Command — HUD / sci-fi FUI rendered in the NodalWaves brand colors.
Chosen over *Obsidian Glass* (glassmorphism) and *Arcade Protocol* (cyberpunk) because it mirrors the brand's own
social creative (chrome lettering, crimson glow, HUD micro-labels, badge on a lit platform) and uses the mandated font set.

Page-specific overrides go in `pages/<page>.md`; when one exists, its rules win over this file.

## Brand rules that override everything

- Name: **NodalQuest** (product), **NodalWaves** (ecosystem), **$NODAL** / Nodal Token (token, on Polygon).
- Never use the legacy names `NodeWaves`, `Node Waves`, `NWS`, `$NWS`, `NodalQuest`. Grep before shipping.
- Logo: the red-dot badge only (`client/public/nodalwaves-badge.png`, hero uses `nodalwaves-mark.png`). The gold-dot logo is rejected.
- Copy: no yield, APY, income, return, or price language. Frame around participation, access, utility, architecture.
  XP, badges, and ranks are educational — say so near any competition or reward mention.
- Voice: confident and premium, with restraint. Architecture over adjectives.

## Palette

| Token | Hex | Use |
|---|---|---|
| `void` | `#050507` | Page background |
| `hull` | `#0E1014` | Raised strips (stats, footer) |
| `crimson` | `#CE0E2D` | Brand primary — CTAs, brackets, active states |
| `crimson-hot` | `#FF2E4C` | Glow, icons on dark, live indicators |
| `chrome` | `#C6CDD6` | Secondary accent — replaces gold |
| Text primary | `#FFFFFF` / `.text-chrome` | Headings |
| Text body | `#A3AAB4` / `#9AA1AB` | Paragraphs |
| Text muted | `#8F96A0` / `#6B727C` | Labels, captions, disclaimers |
| Link on dark | `#FF8A99` | Inline links (crimson is too dark for small text) |

No gold, purple, or rainbow category colors. Status is carried by crimson (active/unlocked) vs. neutral (locked/future).

## Typography

- **Display:** Space Grotesk 600–700, tight leading (0.98–1.05), `text-balance` on headings.
- **Body:** Inter 400–500, 16–20px, `leading-relaxed`, `text-pretty` on paragraphs.
- **Data / HUD:** JetBrains Mono, uppercase, `tracking-[0.18em]` for labels (`.hud-label`); numbers, XP, levels, phase tags.
- Keep brand phrases like "next wave." together with `whitespace-nowrap`.

## Components (in `client/src/index.css`)

- `.text-chrome` / `.text-crimson` — metallic and crimson gradient text for headlines.
- `.panel-hud` — dark gradient panel, 1px `#20232A` border, 10px radius.
- `.hud-frame` — 14px crimson corner brackets (top-left, bottom-right). Use on feature cards, not every card.
- `.btn-crimson` — primary CTA, 48px min height, crimson gradient + glow. One per section.
- `.btn-hud` — secondary CTA, outlined, crimson border on hover.
- `.bg-hud-grid` — 56px crimson hairline grid; always fade it with a CSS mask.
- `.focus-hud` — visible focus ring (`#FF6275`) for custom interactive elements.

## Motion

- Section reveals: fade + 24px rise, 550ms, `cubic-bezier(0.22, 1, 0.36, 1)`, staggered 60–80ms.
- Above-the-fold content uses `Reveal immediate` (animate on mount), never scroll-triggered.
- Ambient: badge float (6s), platform ring pulse (3.2s), hero scan band (7s). All disabled under `prefers-reduced-motion`.

## Accessibility checklist

- Contrast ≥ 4.5:1 for body text on `void` (use `#9AA1AB` or lighter; `#6B727C` only for ≥ 12px captions/disclaimers).
- Touch targets ≥ 44px (social icons are 44×44, CTAs 48px).
- Decorative layers get `aria-hidden`; icon-only links get `aria-label`.
- Lucide SVG icons only — no emoji as icons.
- Verify at 390px and 1440px: no horizontal overflow, no stuck-hidden reveals.

## Anti-patterns

- Neon green/magenta/cyan cyberpunk palettes, glitch text, scanline overlays on body copy.
- Glassmorphism blobs as the main surface.
- Multiple competing glows in one viewport — one crimson focal point per section.
- Disabled "Coming soon" buttons — say it in text instead.

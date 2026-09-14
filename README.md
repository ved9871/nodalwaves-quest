# NodalWaves Quest

A game-feel Web3 learning platform for the NodalWaves ecosystem — complete quests, earn XP, unlock badges, climb leaderboards.

Live site: [nodewavesquest.com](https://nodewavesquest.com)

## Brand

The visual identity follows the official NodalWaves badge (`client/public/nodalwaves-badge.png`):

- **Deep red** primary — `oklch(0.55 0.22 25)`
- **Brushed silver / chrome** accent — `oklch(0.82 0.012 250)` (replaces the earlier gold accent)
- **Near-black** background — `oklch(0.08 0.01 250)`
- **Fonts** — Space Grotesk (display/headings), Inter (body)

All theme tokens live in `client/src/index.css`.

## Stack

- **Client:** React 19 + Vite 7, Tailwind CSS 4, shadcn/ui (Radix), wouter, TanStack Query, tRPC client
- **Server:** Express + tRPC 11, Drizzle ORM (MySQL), JWT cookie auth
- **Tests:** Vitest

## Development

```bash
pnpm install
pnpm dev        # dev server (client + API)
pnpm build      # production build → dist/
pnpm test       # vitest
```

The server needs a MySQL `DATABASE_URL` and related env vars (see `server/_core/env.ts`). Drizzle migrations are in `drizzle/`.

## Static preview (GitHub Pages)

The client can be built as a static preview without the backend:

```bash
BASE_PATH=/nodewaves-quest/ npx vite build
```

The `gh-pages` branch carries this build. Pages that need the API (login, dashboard, quests) require the full server + database.

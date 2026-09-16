# NodalWaves Quest — Backend & Admin

Full-stack app: React + Vite client, Express + tRPC server, Drizzle ORM over MySQL,
JWT-cookie sessions (bcrypt passwords). The GitHub Pages preview is client-only; the
features below need the server running with a database.

## Run it

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` + `JWT_SECRET` (minimum).
3. Create the schema: `pnpm db:push` (drizzle-kit generate + migrate).
4. Seed content: `node scripts/seed-content.mjs` (fresh installs) — already NodalWaves-branded.
5. `pnpm build` then `pnpm start` (or `pnpm dev` for local).

## Re-brand existing live data (NodeWaves/NWS -> NodalWaves/$NODAL)

If a database already has old-branded rows (zones, lessons, quizzes, badges), rewrite
them in place without touching user accounts or progress:

```
DATABASE_URL="mysql://..." node scripts/rebrand-db.mjs
```

Idempotent and safe to re-run. The raw statements are in `drizzle/rebrand-live-data.sql`.

## Admin dashboard

- **URL:** `/admin` (login at `/admin-login`, email + password).
- **Roles:** `admin` (full CRUD, analytics, user/role management, leaderboard reset,
  QA tools) and `demo_admin` (read-only + announcements). Set on `users.role`.
- **Create the first admin** (email/password accounts):

```
DATABASE_URL="mysql://..." node scripts/make-admin.mjs you@example.com
# demote: node scripts/make-admin.mjs you@example.com user
```

OAuth accounts can also be auto-promoted by setting `OWNER_OPEN_ID` to their openId.

## Password reset

Email + 6-digit OTP (valid 15 min), on `/forgot-password`. Set the `SMTP_*` env vars to
send real email. Without SMTP the flow still works end-to-end and the code is written to
the server console (fine for closed beta). No account enumeration: the request step
always returns success.

## Google login

Direct Google OAuth 2.0 (no third-party broker). Set `GOOGLE_CLIENT_ID` +
`GOOGLE_CLIENT_SECRET` to turn on the "Continue with Google" button (the client reads
`auth.config` to know whether to enable it). In Google Cloud Console add the redirect URI
`{APP_BASE_URL}/api/oauth/google/callback`. New Google users land on `/setup` to pick a
username; returning users go straight in.

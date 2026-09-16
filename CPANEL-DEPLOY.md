# Deploying NodalWaves Quest on GoDaddy cPanel (Node.js App)

Your GoDaddy Web Hosting plan includes **Node.js Apps** (cPanel → "Setup Node.js App"),
so the whole app can run there. This guide is the exact, repeatable process.

The app is prepared for cPanel/Passenger:
- The server binds the **exact** `PORT` cPanel gives it (no port scanning).
- `app.cjs` is the Passenger startup file (loads the built ESM server).
- The production server no longer loads the Vite build toolchain, so the host install
  only needs 13 runtime packages (`package.server.json`), not the full dev toolchain.

---

## 0. Prerequisites

- The target domain **nodalwavesquest.com** must be registered and added to this cPanel
  account (as the primary or an addon domain), with its DNS pointing to GoDaddy.
  To test before the domain is ready, use a subdomain of an existing domain
  (e.g. `quest.web3technetwork.com`).
- Node version: choose **18 or 20** in the "Setup Node.js App" dialog.

## 1. Create the MySQL database (cPanel → MySQL Databases)

1. Create a database, e.g. `nodal_quest`.
2. Create a user with a strong password and **add it to the database with ALL PRIVILEGES**.
3. Note the values for the `.env` below. On GoDaddy the DB host is usually `localhost`.
   `DATABASE_URL="mysql://DBUSER:DBPASS@localhost:3306/DBNAME"`

## 2. Build locally (on this machine)

```
# from the repo root
BASE_PATH=/ pnpm build        # or: BASE_PATH=/ node ./node_modules/vite/bin/vite.js build && \
                              #      node ./node_modules/esbuild/bin/esbuild server/_core/index.ts \
                              #      --platform=node --packages=external --bundle --format=esm --splitting --outdir=dist
```

Note: build with **base `/`** for real hosting (the `/nodalwaves-quest/` base is only for the
GitHub Pages preview). This produces:
- `dist/public/` — the static client
- `dist/*.js` — the server bundle (index.js + chunks)

## 3. Upload

Upload these to the cPanel app folder (e.g. `~/nodalwaves-quest`), via File Manager or FTP:
- `dist/` (the whole folder)
- `app.cjs`
- `package.server.json`  → **rename to `package.json`** in the app folder
- create `.env` in the app folder from `.env.example` (see step 5)

Do **not** upload `node_modules` — cPanel installs them.

## 4. Setup Node.js App (cPanel → Software → Setup Node.js App → Create)

- **Node.js version:** 20 (or 18)
- **Application mode:** Production
- **Application root:** `nodalwaves-quest` (the folder you uploaded to)
- **Application URL:** your domain (or the test subdomain)
- **Application startup file:** `app.cjs`
- Create, then click **Run NPM Install** (installs the 13 runtime deps).

## 5. Environment variables

Add these in the Node.js App UI ("Environment variables"), or in `.env` in the app root:

```
NODE_ENV=production
DATABASE_URL=mysql://DBUSER:DBPASS@localhost:3306/DBNAME
JWT_SECRET=<long-random-string>
APP_BASE_URL=https://nodalwavesquest.com
# Email (optional — reset codes log to console until set)
SMTP_HOST=  SMTP_PORT=587  SMTP_USER=  SMTP_PASS=
SMTP_FROM_EMAIL=noreply@nodalwavesquest.com  SMTP_FROM_NAME=NodalWaves Quest
# Google login (optional)
GOOGLE_CLIENT_ID=  GOOGLE_CLIENT_SECRET=
```

## 6. Create the schema, seed, and set the first admin

Use cPanel Terminal (or the Node.js App's "Run JS script") from the app root. Because only
runtime deps are installed here, run migrations from a machine that has the dev tools, OR
import the schema via phpMyAdmin using the SQL in `drizzle/*.sql`. Then:

```
DATABASE_URL="mysql://..." node scripts/rebrand-db.mjs     # only if importing old data
DATABASE_URL="mysql://..." node scripts/make-admin.mjs you@example.com
```

(For a fresh DB, run the app's normal migrate + `node scripts/seed-content.mjs` from a
dev-capable environment pointed at the same `DATABASE_URL`.)

## 7. Start / restart

Click **Restart** in the Node.js App UI after any change. Visit the domain — the Arcade
homepage should load, and signup/login/quests now persist to MySQL.

## Google OAuth redirect URI

In Google Cloud Console, add: `https://nodalwavesquest.com/api/oauth/google/callback`
(and the test-subdomain equivalent if used).

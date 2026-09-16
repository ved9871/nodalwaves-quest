# Deploy NodalWaves Quest on Railway (GitHub auto-deploy + MySQL)

Railway builds from the GitHub repo on every push, includes MySQL, and gives HTTPS.
Domain stays at GoDaddy (we point DNS at Railway).

## 1. Project from GitHub
1. railway.app → sign up / **Login with GitHub** → authorize.
2. **New Project → Deploy from GitHub repo → `ved9871/nodalwaves-quest`** (branch `main`).
3. Railway auto-detects pnpm + Node 20 and runs: install → `pnpm build` → `pnpm start`.

## 2. Add MySQL
- In the project: **New → Database → Add MySQL**. It provisions and exposes `MYSQL_URL`.

## 3. Service variables (the app service, not the DB)
- `NODE_ENV` = `production`
- `JWT_SECRET` = `0i-p5zdFDyHH2TNZnMCOiRggy7QXTLUg4bO86lLzxjiaNkEBqtMvzg2gzbXaIEBA`
- `APP_BASE_URL` = `https://nodalwavesquest.com`
- `DATABASE_URL` = reference the MySQL plugin: set the value to `${{MySQL.MYSQL_URL}}`
  (Railway substitutes the real connection string). Do **not** set `PORT` — Railway injects it.

## 4. Create tables + seed (one-off, after MySQL is up)
Railway service → **Settings → Deploy → Pre-Deploy Command**: `pnpm db:push`
(applies the drizzle migrations before each deploy). Then run once via the service
**Shell / one-off command**:
- `node scripts/seed-content.mjs`   (loads zones, lessons, quizzes — NodalWaves-branded)
After you sign up on the live site once:
- `node scripts/make-admin.mjs you@example.com`

## 5. Custom domain
- Railway service → **Settings → Networking → Custom Domain** → add `nodalwavesquest.com`
  (and `www`). Railway shows the exact DNS record to create.
- In **GoDaddy → this domain → DNS**, add the record Railway gives you.
  - Root/apex usually needs a CNAME; if GoDaddy can't CNAME the root, point `www` via CNAME
    and set root **Forwarding → www**, or use the A record Railway provides.
- HTTPS is issued automatically once DNS resolves.

## 6. Google OAuth (optional, later)
Add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` as service variables; in Google Cloud add
redirect URI `https://nodalwavesquest.com/api/oauth/google/callback`.

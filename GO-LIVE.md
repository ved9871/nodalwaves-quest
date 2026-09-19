# NodalQuest — Go Live on nodalwavesquest.com (GoDaddy cPanel)

This is the full checklist to make the **whole app** (website + login + database + admin)
live on your domain. Do the steps in order. Nothing here needs coding — it's uploading
files and filling in cPanel forms.

> **Why not GitHub?** GitHub only shows the static preview (the pages, no login/database).
> The real app needs a Node.js server + MySQL, which is what your GoDaddy cPanel hosting
> provides. That's what this guide sets up.

You will use the file I gave you: **`nodalquest-godaddy.zip`**.

---

## What you need before starting (5 min)

1. Your GoDaddy **cPanel** login (the hosting control panel, not the domain page).
2. The domain **nodalwavesquest.com** already added to this hosting account. *(You said this is done.)*
3. The MySQL database you already created. You'll need its **exact** name and user (Step 2).

---

## Step 1 — Log into cPanel

1. Go to GoDaddy → **My Products** → your Web Hosting → **cPanel Admin** (or "Manage").
2. You should see the cPanel dashboard with sections like *Files*, *Databases*, *Software*.

If GoDaddy shows a "Set up your Node app" **marketing wizard** at `setup.godaddy.com` and it
errors with **403** — ignore it. We use the classic cPanel tools directly (Steps 5–6), which work.

---

## Step 2 — Get your exact database name, user, and password

1. In cPanel → **Databases** → **MySQL Databases**.
2. Under **Current Databases**, copy the **exact** database name. On GoDaddy it has an
   account prefix, e.g. `abcd1234_nodalquest` — not just `nodalquest`.
3. Under **Current Users**, copy the **exact** username, e.g. `abcd1234_prakashved155`.
4. Make sure that user is **added to that database with ALL PRIVILEGES**
   (same page → "Add User To Database"). If unsure, add it again and tick **ALL PRIVILEGES**.
5. Password: use the one you set for that DB user. **If you shared it anywhere, reset it here now**
   (Current Users → Change Password) and use the new one below.

**Write these three down** — you'll paste them into `.env` in Step 4:
- DB name: `__________________`
- DB user: `__________________`
- DB password: `__________________`

> ⚠️ If your password contains special characters, they must be URL-encoded in the connection
> string. Common ones: `@` → `%40`, `#` → `%23`, `$` → `%24`, `:` → `%3A`, `/` → `%2F`.
> Example: `Nodalwaves@#123` becomes `Nodalwaves%40%23123`.

---

## Step 3 — Upload and extract the app

1. In cPanel → **Files** → **File Manager**.
2. Go to your home directory (the left tree, `/home/<youraccount>`). **Do not** put the app
   inside `public_html` — cPanel's Node tool serves it for you.
3. Click **Upload**, choose **`nodalquest-godaddy.zip`**, wait for 100%.
4. Back in File Manager, right-click the zip → **Extract**. You'll get a folder, e.g.
   `nodalquest-godaddy` containing `dist/`, `app.cjs`, `package.json`, `scripts/`, `drizzle/`, `.env.example`.
5. Delete the `.zip` afterwards to save space (optional).

Remember this folder's name — it's your **Application root** in Step 5 (e.g. `nodalquest-godaddy`).

---

## Step 4 — Create the `.env` file (your secrets)

1. In File Manager, open the app folder (`nodalquest-godaddy`).
2. Rename **`.env.example`** to **`.env`** (right-click → Rename). *(If you don't see files
   starting with a dot, click Settings top-right → tick "Show Hidden Files".)*
3. Right-click `.env` → **Edit**, replace the contents with this (fill in your DB values from Step 2):

```
NODE_ENV=production
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
JWT_SECRET=9nRrnxtxAQu5BfIA8o93fC108GWQrfNlGj8nYPrAEbKsC2ADnXQu6ieohCxxdEWG
APP_BASE_URL=https://nodalwavesquest.com
```

- Replace `DB_USER`, `DB_PASSWORD` (URL-encoded), `DB_NAME` with your exact values.
- Example: `DATABASE_URL=mysql://abcd1234_prakashved155:Nodalwaves%40%23123@localhost:3306/abcd1234_nodalquest`
- `JWT_SECRET` above is freshly generated for you — keep it secret; changing it later logs everyone out.
- **Save.**

(Optional extras you can add later — leave out for now: `SMTP_*` for password-reset emails,
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google login.)

---

## Step 5 — Create the Node.js app

1. cPanel → **Software** → **Setup Node.js App** → **Create Application**.
2. Fill in:
   - **Node.js version:** `20` (or 18 if 20 isn't listed)
   - **Application mode:** `Production`
   - **Application root:** the folder from Step 3, e.g. `nodalquest-godaddy`
   - **Application URL:** select **nodalwavesquest.com** (leave the path box empty = site root)
   - **Application startup file:** `app.cjs`
3. Click **Create**.
4. On the app's page, click **Run NPM Install** (installs ~13 packages; wait for it to finish).
5. Leave this page open — you'll use its **"Run JS script"** / terminal button in Step 6, and
   **Restart** in Step 7.

---

## Step 6 — Create the database tables, seed content, and your admin

### ✅ Recommended for GoDaddy managed Node hosting: the built-in setup endpoint

Because the managed platform has no shell to run scripts, the app has a one-time,
token-protected setup endpoint that does everything from inside the app.

1. In the GoDaddy app dashboard → **Settings → Secrets**, add:
   - `SETUP_TOKEN` = any long random string you choose (e.g. `nq-setup-8f2k9d3m1p`)
   - (optional) `ADMIN_EMAIL` = prakashved155@gmail.com
   - (optional) `ADMIN_PASSWORD` = a password you choose (if omitted, one is generated and shown)
2. **Redeploy / pull latest** from GitHub (Integrations tab → pull), so the new code + secret are live.
3. In your browser, open **once**:
   `https://nodalwavesquest.com/api/setup?token=YOUR_SETUP_TOKEN`
   You'll get a JSON summary: tables created, zones/badges/lessons/quizzes seeded, and the admin
   account (with the generated password if you didn't set `ADMIN_PASSWORD`). **Copy the password.**
4. Back in **Secrets**, **delete `SETUP_TOKEN`** (this disables the endpoint) and redeploy/restart.
5. Reload the site — signup, dashboard, quests, and admin now work.

That's it. The sections below are only needed if you prefer to do it manually with a database tool.

---

### Alternative A — Manual via phpMyAdmin (if you use classic cPanel MySQL)

### 6a. Create the tables (phpMyAdmin)

1. cPanel → **Databases** → **phpMyAdmin**.
2. Left sidebar: click your database (the `abcd1234_nodalquest` one).
3. Top tab **Import** → **Choose File** → select `drizzle/nodalquest-schema.sql`
   (from the app folder — you may need to download it from File Manager first, then upload here).
4. Click **Go/Import**. You should see "22 tables created" / success.

### 6b. Seed the learning content + create your admin (cPanel Terminal)

1. cPanel → **Advanced** → **Terminal** (if your plan has it). If there's no Terminal, use the
   **"Run JS script"** field on the Setup Node.js App page instead — see 6c.
2. Enter the app's environment and run:

```
cd ~/nodalquest-godaddy
source /home/<youraccount>/nodevenv/nodalquest-godaddy/20/bin/activate   # path shown on the Node app page as "Enter to the virtual environment"
node scripts/seed-content.mjs
node scripts/create-admin.mjs prakashved155@gmail.com "TMnwdq-pHjhFN-LRCxq6" admin
```

- The first command seeds 9 zones, lessons, quizzes, and badges.
- The second creates your **admin login**. It reads `.env` automatically.

### 6c. No Terminal? Use "Run JS script"

On the Setup Node.js App page there's a **"Run JS script"** box. Run these one at a time by
entering the script path:
- `scripts/seed-content.mjs`
- `scripts/create-admin.mjs`  *(this variant will generate a random password and print it in the
  log; or keep using Terminal in 6b to set the exact password above.)*

---

## Step 7 — Start it and check HTTPS

1. On the Setup Node.js App page, click **Restart**.
2. In cPanel → **Security** → **SSL/TLS Status**, make sure **nodalwavesquest.com** has a
   certificate (GoDaddy usually auto-issues AutoSSL; if not, click **Run AutoSSL**).
3. Open **https://nodalwavesquest.com** in your browser.

---

## Step 8 — If the domain doesn't resolve yet (DNS)

If the page doesn't load at all:
1. GoDaddy → **Domains** → nodalwavesquest.com → **DNS**.
2. Ensure the **A record** for `@` points to your hosting's IP (shown in cPanel right sidebar,
   "Shared IP Address"). Add/adjust if needed.
3. DNS changes can take 15 min–2 hours. Test again after.

---

## Step 9 — Final acceptance test (do all of these)

- [ ] `https://nodalwavesquest.com` loads the NodalQuest homepage with the logo.
- [ ] Click **Play / Create account** → sign up with a test email + password.
- [ ] You land on profile setup → pick avatar/username → reach the dashboard with XP/zones.
- [ ] Refresh the page — you're still logged in.
- [ ] Complete one lesson → XP increases.
- [ ] Log out, log back in.
- [ ] Go to **/admin-login**, sign in with your admin email + password from Step 6.
- [ ] The admin dashboard loads (users, content, analytics, feedback).

If all pass — **you're live.** 🎉

---

## Your login details (created in Step 6)

| Role | Email | Password |
|---|---|---|
| Admin (full) | prakashved155@gmail.com | `TMnwdq-pHjhFN-LRCxq6` |

**Change this password after your first admin login.** To add a read-only demo admin later:
`node scripts/create-admin.mjs demo@nodalwavesquest.com "yourNewPassword" demo_admin`

---

## Troubleshooting

- **Homepage loads but login/XP fails** → `/api/trpc` isn't reaching Node, or `.env` DATABASE_URL
  is wrong. Recheck Step 4 values (exact DB name/user, URL-encoded password) and click Restart.
- **Signup gives a database error** → the tables weren't imported (redo Step 6a) or the DB user
  lacks privileges (Step 2.4).
- **Logs in then immediately logged out** → make sure `https://` is working (Step 7) and
  `JWT_SECRET` in `.env` didn't change.
- **A route like /dashboard shows 404 on refresh** → the app must be running via Setup Node.js App
  (Step 5), not served as static files. Confirm the app shows "started" and Restart.
- **"Setup Node.js App" is missing in cPanel** → your GoDaddy plan may not include Node hosting.
  Tell me and I'll give you the closest alternative to keep the domain.
- **Anything else** → copy the error from the app's log (Setup Node.js App page → "…log") and send it to me.

---

## Later (optional) — turn on emails and Google login

- **Password-reset emails:** add `SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM_EMAIL=noreply@nodalwavesquest.com`, `SMTP_FROM_NAME=NodalQuest` to `.env`, Restart.
  (Until then, reset codes are written to the app log instead of emailed.)
- **Google login:** create OAuth credentials in Google Cloud Console, add
  `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`, and set the authorized redirect URI to
  `https://nodalwavesquest.com/api/oauth/google/callback`. Restart. The button turns on automatically.

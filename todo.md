# NodeWaves Quest - Project TODO

## Phase 1: Foundation
- [x] Initialize project scaffold with db, server, user features
- [x] Design system: dark Web3 theme, red/gold accents, CSS variables
- [x] Database schema: users, profiles, lessons, quizzes, xp_logs, badges, user_badges, zones, leaderboard, referrals, announcements, campaigns, check_ins

## Phase 2: Landing Page
- [x] Hero section with "Play the Quest. Learn the Ecosystem. Rise Through the Ranks." and "Start Free Quest" CTA
- [x] World map zones preview (9 zones)
- [x] Feature highlights section
- [x] Community/event CTA section
- [x] Footer with disclaimer link

## Phase 3: Authentication & Profile
- [x] Login/signup page with Manus OAuth
- [x] Avatar selection (8+ avatar options)
- [x] Profile setup flow (username, avatar)
- [x] Profile page with stats (XP, level, badges, streak)

## Phase 4: Game Dashboard
- [x] XP bar with level indicator
- [x] Daily streak tracker
- [x] Daily check-in button with XP reward
- [x] Active quests panel
- [x] Zone map mini-preview
- [x] Recent badges display

## Phase 5: Quest & Lesson System
- [x] Quest list page with zone filtering
- [x] Lesson viewer with structured content
- [x] Topics: NWS, Staking, Lite Node, Founder Node, Node Vault, Treasury, Wallet Safety, Scam Protection
- [x] Lesson completion with XP award
- [x] Quest progress tracking

## Phase 6: Timed Quiz Engine
- [x] Quiz page with countdown timer
- [x] Multiple choice questions
- [x] Score tracking and XP rewards
- [x] Animated result feedback (pass/fail/perfect)
- [x] Quiz history tracking

## Phase 7: XP, Badges & Reward System
- [x] XP level progression (1-50 levels)
- [x] Badge unlock system with criteria
- [x] Animated reward chest opening
- [x] Level-up animation/modal
- [x] Badge gallery page

## Phase 8: World Map (9 Zones)
- [x] NWS Hub
- [x] Staking Vault
- [x] Lite Node Station
- [x] Founder Tower
- [x] Node Vault Chamber
- [x] Treasury Hall
- [x] Security Lab
- [x] Community Arena
- [x] Future Utility Zone
- [x] Zone unlock logic (XP/level gating)
- [x] Zone detail page with quests

## Phase 9: Mini-Games
- [x] Node Charge tapping mission
- [x] Timed Quiz Battle
- [x] Scam Detector Mission
- [x] Mini-game XP rewards

## Phase 10: Leaderboard & Community
- [x] Global leaderboard with rank display
- [x] Referral invite system with referral code
- [x] Community CTA section
- [x] Event CTA section

## Phase 11: Admin Panel
- [x] Admin dashboard overview
- [x] User management (list, role change, ban)
- [x] Lesson management (CRUD)
- [x] Quiz management (CRUD with questions)
- [x] XP values configuration
- [x] Badge management (CRUD)
- [x] Challenge management
- [x] Leaderboard management (reset, adjust)
- [x] Referral management
- [x] Announcements management
- [x] Campaign rules management
- [x] Risk/disclaimer page management

## Phase 12: Polish & Finalization
- [x] Mobile responsiveness audit
- [x] Smooth animations (XP gain, badge unlock, chest open, streak, rank up)
- [x] Risk/disclaimer page (public-facing)
- [x] Vitest unit tests (22 tests passing)
- [x] Content seeded: 12 lessons, 3 quizzes (15 questions), 9 zones, badges, XP config
- [x] Final checkpoint and delivery

## Improvement Round 1 (Apr 2026)

- [x] Replace "Join thousands of learners" with safer copy
- [x] Replace all "earn rewards" wording with XP/badge/campaign-safe language
- [x] Fix Scam Detector card copy: "earn XP" not "earn rewards"
- [x] Add campaign reward safety line wherever campaign rewards are mentioned
- [x] Create /campaign-rules page with full compliance content
- [x] Add Treasury-Aligned Ecosystem section to landing page
- [x] Update footer year from 2024 to 2026
- [x] Audit landing page for wallet/token/guaranteed-earning language

## Improvement Round 2 (Apr 2026)

- [x] Add "Campaign Rules" to landing page top nav linking to /campaign-rules
- [x] Create /challenge page: 7-Day NodeWaves Web3 Learning Challenge with all 7 sections
- [x] Add Bangla bilingual CTA line to landing hero
- [x] Add Bangla safety disclaimer line to landing hero/disclaimer area
- [x] Wire /challenge route in App.tsx

## Improvement Round 3 (Apr 2026)

- [x] Add mobile hamburger menu to landing page (Home, 7-Day Challenge, Campaign Rules, Disclaimer, Start Free Quest)
- [x] Add mobile hamburger menu to Challenge page
- [x] Create shared MobileNav component for reuse
- [x] Build /challenge/join enrollment modal/page with 4 confirmation checkboxes
- [x] Add challenge_enrollments table to DB schema
- [x] Add enrollChallenge and getChallengeEnrollment tRPC procedures
- [x] Show enrolled state on challenge page after joining
- [x] Wire challenge leaderboard to enrolled users (Top XP, Quiz Accuracy, Streak, Community Educator)
- [x] Full QA: no guaranteed income/token language, no wallet/on-chain, mobile nav works, CTA links, footer 2026

## Logo Brand Lockup (Apr 2026)

- [x] Build SVG NWQ icon component (NW wave arc + gold W + quest star accent)
- [x] Build full logo lockup SVG: icon + "NodeWaves Quest" text + "Play. Learn. Rise." tagline
- [x] Build compact navbar SVG lockup: icon + "NodeWaves Quest" text only
- [x] SVG built as inline React component (no upload needed)
- [x] Replace Zap icon + text in Home.tsx navbar with new logo lockup
- [x] Replace Zap icon + text in Challenge.tsx navbar with new logo lockup
- [x] Replace Zap icon + text in MobileNav.tsx with NWQLogo + close button in panel header
- [x] Add full logo lockup to landing page hero section
- [x] Update favicon with icon-only SVG (favicon.svg)
- [x] Updated page title to "NodeWaves Quest — Play. Learn. Rise." in index.html

## Logo Icon Rebuild (Apr 2026)
- [x] Rebuild NWQIcon SVG to match screenshot: 3D crimson/gold NW arc + 4 compass spikes

## Logo Hierarchy Refinement (Apr 2026)
- [x] Simplify NWQIcon SVG: flat/clean, crimson arcs, subtle gold W, no heavy spikes
- [x] Remove full logo lockup from hero section, replace with small brand badge
- [x] Ensure navbar uses compact logo only (icon + text, no tagline)
- [x] Add compact NWQLogo to dashboard sidebar header
- [x] Add compact NWQLogo to admin panel header
- [x] Verify footer uses compact logo (no tagline duplication)
- [x] Verify mobile nav uses icon-only or compact logo, not full lockup
- [x] Update Quests.tsx navbar: NWQLogo compact replaces Zap + "World Map" text
- [x] Update ZonePage.tsx navbar: NWQLogo compact replaces Zap + zone name text
- [x] Update Badges.tsx navbar: NWQLogo compact replaces Award + "Badge Collection" text
- [x] Update MiniGames.tsx hub navbar: NWQLogo compact replaces Play + "Mini-Games" text
- [x] Update Leaderboard.tsx navbar: NWQLogo compact replaces Trophy + "Leaderboard" text
- [x] Update Profile.tsx navbar: NWQLogo compact replaces Star + "My Profile" text
- [x] Update ChallengeJoin.tsx navbars (both states): NWQLogo compact replaces Zap + text
- [x] Update QuizPage.tsx navbar: NWQLogo compact replaces Target + quiz title text

## Logo Hierarchy Fix Round 2 (Apr 2026)

- [x] Simplify NWQIcon SVG further: removed gradients, flat crimson arcs, clean gold W, tiny diamond accent
- [x] Reduce navbar logo to icon-only on mobile (hide "NodeWaves Quest" text on sm: screens)
- [x] Ensure hero has zero logo/brand text — only BETA badge, headline, description, CTAs, Bangla line
- [x] Verify MobileNav panel header shows compact logo only (no tagline)
- [x] Verify footer shows compact logo only (no tagline)
- [x] Reduce navbar iconSize from 34 to 28 for tighter, cleaner feel
- [x] Apply icon-only mobile pattern to all inner-app pages (Quests, ZonePage, Badges, MiniGames, Leaderboard, Profile, QuizPage, ChallengeJoin x2, Dashboard, Challenge)

## Logo Hierarchy Fix Round 3 (Apr 2026)

- [x] Remove "Play. Learn. Rise." tagline from client/index.html title tag (was: "NodeWaves Quest — Play. Learn. Rise.")
- [x] Remove showTagline prop from NWQLogo component entirely — tagline can no longer be rendered anywhere in the app
- [x] Confirm zero instances of "Play. Learn. Rise." or showTagline remain in entire client/ codebase
- [x] TypeScript: 0 errors. Tests: 22 passing.

## Logo Image Replacement (Apr 2026)

- [x] Upload user-provided PNG logo to static assets (manus-upload-file --webdev)
- [x] Update NWQIcon.tsx: replace SVG paths with <img> tag using uploaded URL
- [x] Update favicon.svg to reference the new logo image (64x64 embedded PNG)
- [x] Verify navbar, mobile nav, dashboard, admin panel all show new logo
- [x] TypeScript: 0 errors. Tests: 22 passing.

## Launch Readiness Round (Apr 2026)

- [x] Generate 1200x630 OG social card image with NodeWaves Quest branding
- [x] Upload OG image to static CDN and add Open Graph meta tags to index.html
- [x] Seed 3 quiz questions for Zone 3: Lite Node Station (quiz id=30001)
- [x] Seed 3 quiz questions for Zone 4: Founder Tower (quiz id=30002)
- [x] Seed 3 quiz questions for Zone 5: Node Vault Chamber (quiz id=30003)
- [x] Seed 3 quiz questions for Zone 6: Treasury Hall (quiz id=30004)
- [x] Zone 7: Security Lab already had quiz id=3 with 5 questions — skipped
- [x] Seed 3 quiz questions for Zone 8: Community Arena (quiz id=30005)
- [x] Seed 3 quiz questions for Zone 9: Future Utility Zone (quiz id=30006)
- [x] Upgrade announcement banner: type-based color coding, dismiss button, richer layout
- [x] Fix broken /profile-setup route → corrected to /setup in Dashboard.tsx
- [x] Final QA: all CTA links valid, all routes match, no broken navigation
- [x] Final QA: zero guaranteed income/token reward/risk-free language in app code
- [x] TypeScript: 0 errors. Tests: 22 passing.

## Launch Readiness Round 2 (Apr 2026)

- [x] Audit quiz content for Zones 3-9: all 9 zones have 3-5 beginner-friendly, compliance-safe questions (33 total)
- [x] Verify OG/Twitter Card meta tags: correct title, description, image URL, dimensions in index.html
- [x] Add My Challenge Progress card to Dashboard (enrolled: 7-day bar + D1-D7 checklist + Today's Mission CTA; not enrolled: Join Challenge CTA)
- [x] Wire trpc.challenge.getEnrollment query to Dashboard for enrolled state detection
- [x] Fix mini-game sub-routes: added /mini-games/node-charge, /mini-games/quiz-battle, /mini-games/scam-detector to App.tsx
- [x] Final QA: all CTA links valid, all routes match, no broken navigation
- [x] Final QA: zero promotional guaranteed income/token/NWS reward language (all occurrences are in disclaimer/educational context)
- [x] Final QA: no wallet connection, no on-chain transactions, no MetaMask/WalletConnect references
- [x] TypeScript: 0 errors. Tests: 22 passing.

## Domain Preparation: nodewavesquest.com (Apr 2026)

- [x] Update og:url canonical from manus.space to https://nodewavesquest.com
- [x] Add <link rel="canonical" href="https://nodewavesquest.com" /> to index.html
- [x] Referral link base URL already uses window.location.origin (dynamic, domain-agnostic) — no change needed
- [x] Scanned all source files: only one hardcoded domain found (og:url) — now fixed
- [x] OG image URL is absolute CloudFront CDN URL — works on any domain
- [x] TypeScript: 0 errors. Tests: 22 passing.

## Content Seeding: Zone Quiz Questions (Apr 2026)

- [x] Seed 3 beginner-friendly quiz questions for Zone 3: Lite Node Station (quiz id=30001, 3 questions)
- [x] Seed 3 beginner-friendly quiz questions for Zone 4: Founder Tower (quiz id=30002, 3 questions)
- [x] Seed 3 beginner-friendly quiz questions for Zone 5: Node Vault Chamber (quiz id=30003, 3 questions)
- [x] Seed 3 beginner-friendly quiz questions for Zone 6: Treasury Hall (quiz id=30004, 3 questions)
- [x] Zone 7: Security Lab already has quiz id=3 with 5 questions (no new seed needed)
- [x] Seed 3 beginner-friendly quiz questions for Zone 8: Community Arena (quiz id=30005, 3 questions)
- [x] Seed 3 beginner-friendly quiz questions for Zone 9: Future Utility Zone (quiz id=30006, 3 questions)
- [x] Verify quiz visibility in user flow: ZonePage → trpc.quizzes.byZone → QuizPage → getQuizWithQuestions (all working)
- [x] Verified DB state: 9 zones, 9 quizzes (1 per zone), 33 total questions. All compliance-safe language confirmed.

## Challenge Mechanics Round (Apr 2026)

- [x] Add challenge_day_completions table (userId, challengeId, dayNumber, sourceType, sourceId, completedAt)
- [x] Add completeChallengeDay() server-side helper: checks enrollment, prevents duplicate source reuse, increments daysCompleted atomically
- [x] Wire completeChallengeDay into lesson complete procedure (server/routers.ts line 135)
- [x] Wire completeChallengeDay into quiz submit procedure (server/routers.ts line 174)
- [x] Add getDayCompletions tRPC procedure (challenge.getDayCompletions) — returns array of completed day numbers
- [x] Update Dashboard My Challenge Progress card: uses real getDayCompletions data, shows D1-D7 with checkmarks/active/locked states
- [x] Add Final Quiz locked/unlocked card to Challenge page (locked until daysCompleted >= 7, compliance-safe wording)
- [x] Add Final Quiz locked/unlocked state to Dashboard progress card
- [x] QA: duplicate prevention verified — same sourceId+sourceType cannot count twice
- [x] QA: progress bar updates correctly (daysCompleted / 7 * 100)
- [x] QA: final quiz locked before 7 days, unlocked after (daysCompleted >= 7 check)
- [x] QA: no guaranteed income/token reward language in challenge mechanics UI
- [x] TypeScript: 0 errors. Tests: 22 passing. Server: running clean (esbuild cache cleared).

## Announcement CTA Feature + Beta Launch (Apr 2026)

- [x] Add ctaText (varchar 128) and ctaLink (varchar 512) columns to announcements table (migration 0005_high_rocket_racer.sql)
- [x] Update upsertAnnouncement tRPC procedure to accept optional ctaText and ctaLink fields
- [x] Update AdminPanel announcement form: add CTA Button Text + CTA Link input fields (2-column grid)
- [x] Fix AdminPanel dropdown: replace invalid "update" option with "campaign" to match DB enum
- [x] Fix AdminPanel delete button: wire to deleteAnnouncement mutation (was showing "coming soon" toast)
- [x] Update Dashboard announcement banner: render clickable CTA button when ctaText+ctaLink present
- [x] Insert beta launch announcement: "NodeWaves Quest Beta is LIVE" (type=event, isActive=true, CTA="Join Challenge" → /challenge)
- [x] TypeScript: 0 errors. Tests: 26 passing.

## Lesson Content Update: Zones 3–9 (Apr 2026)

- [x] Confirmed all 7 zones (3–9) already have lesson records in DB (IDs 5–12, topics: lite_node, founder_node, node_vault, treasury, wallet_safety, scam_protection, nws)
- [x] Rewrote LessonPage.tsx LESSON_CONTENT map: all 8 topics now have 4–5 structured sections (beginner-friendly paragraphs, simple English, no guaranteed income/token reward language)
- [x] Added keyTakeaways (3 per lesson) to LESSON_CONTENT map for all 8 topics
- [x] Added Key Takeaways panel to LessonPage — shown after lesson completion with numbered gold-accented list
- [x] Added Take Quiz CTA button to Key Takeaways panel — auto-fetches first quiz for the zone via trpc.quizzes.byZone, navigates to /quiz/{id}
- [x] Zone → Lesson → Quiz → XP → Progress flow verified: ZonePage shows lessons first, then quizzes; LessonPage completes with XP celebration → Key Takeaways → Take Quiz button
- [x] TypeScript: 0 errors. Tests: 26 passing.

## 7-Day Challenge Progress Verification (Apr 2026)

- [x] Audit challenge_day_completions table schema and completeChallengeDay() helper
- [x] Verify day number assignment logic (how dayNumber is determined per completion)
- [x] Verify once-per-day enforcement (not just per-source duplicate prevention)
- [x] Verify daysCompleted increments atomically and correctly in challenge_enrollments
- [x] Verify getDayCompletions tRPC procedure returns correct completed day numbers
- [x] Verify Dashboard D1–D7 checklist renders correct checkmarks from real data
- [x] Verify Final Quiz locked when daysCompleted < 7, unlocked when >= 7
- [x] Fix any issues found in the above: added once-per-calendar-day guard in completeChallengeDay(); fixed Dashboard progress bar to use completedDays.length (real data) not enrollment.daysCompleted
- [x] TypeScript: 0 errors. Tests: 31 passing (5 new challenge logic tests added).

## Demo Admin Account (Beta Review Access)

- [x] Add demo_admin to users.role enum in schema.ts + migrate DB
- [x] Add passwordHash column to users table for local login (no separate table needed)
- [x] Create demo admin user: admin-demo@nodewavesquest.com with bcrypt-hashed password (id=60070)
- [x] Add localLogin tRPC procedure (email+password → session cookie)
- [x] Add demo admin login page at /admin-login
- [x] Gate destructive admin procedures (updateUserRole, banUser, resetLeaderboard) behind role=admin only via adminProcedure
- [x] Allow demo_admin access to: view dashboard, announcements CRUD, view lessons/quizzes/users/leaderboard/challenge via demoAdminProcedure
- [x] Add amber "Demo Admin — Beta Review Mode" banner in admin panel when logged in as demo_admin
- [x] Document how to disable demo access: update role to 'user' or clear passwordHash in DB
- [x] TypeScript: 0 errors. Tests: 31 passing.

## Pre-Launch QA Fixes (April 25, 2026)

- [x] BLOCKER FIX: AdminPanel auth race condition — added loading spinner before redirect so /admin loads correctly for all admin roles (was redirecting to / before auth.me resolved)
- [x] BLOCKER FIX: Dashboard missing mobile hamburger menu — added MobileNav component to Dashboard nav (was only hidden desktop nav, no mobile menu)
- [x] IMPROVEMENT: Added /login route that redirects to Manus OAuth (so /login URL works for users who type it directly)
- [x] TypeScript: 0 errors. Tests: 37 passing.

## Branded Login Page (Pre-OAuth Intercept)

- [x] Create /login page: NodeWaves Quest logo, "Continue to NodeWaves Quest" title, subtitle, Google/Email buttons, safety disclaimer
- [x] /login page redirects to Manus OAuth on button click (getLoginUrl())
- [x] Update Home.tsx: "Start Free Quest" and "Login" buttons go to /login instead of direct OAuth
- [x] Update Dashboard.tsx: unauthenticated redirect goes to /login instead of direct OAuth
- [x] Update all other pages that redirect to OAuth to go via /login first (Quests, ZonePage, LessonPage, QuizPage, Badges, MiniGames x4, Leaderboard, Profile, ChallengeJoin)
- [x] Remove the old /login redirect-only route from App.tsx (replaced with real Login component)
- [x] TypeScript: 0 errors. Tests: 37 passing.

## Branded Login Page (Pre-OAuth Intercept) — COMPLETED

- [x] Create /login page: NodeWaves Quest logo, "Continue to NodeWaves Quest" title, subtitle, Google/Email buttons, safety disclaimer
- [x] /login page redirects to Manus OAuth on button click (getLoginUrl())
- [x] Update Home.tsx: "Start Free Quest" and "Login" buttons go to /login instead of direct OAuth
- [x] Update Dashboard.tsx: unauthenticated redirect goes to /login instead of direct OAuth
- [x] Update all other pages that redirect to OAuth to go via /login first (Quests, ZonePage, LessonPage, QuizPage, Badges, MiniGames x4, Leaderboard, Profile, ChallengeJoin)
- [x] Remove the old /login redirect-only route from App.tsx (replaced with real Login component)
- [x] TypeScript: 0 errors. Tests: 37 passing.

## Phase 1 Custom Auth — Email+Password (Apr 2026)

- [x] Add signup tRPC procedure: email, displayName, password, bcrypt hash, duplicate check
- [x] Add proper error codes: EMAIL_TAKEN, INVALID_EMAIL, PASSWORD_TOO_SHORT, SOCIAL_LOGIN_ONLY
- [x] Build /signup page: NodeWaves Quest branding, displayName/email/password/confirm/checkbox fields
- [x] Update /login page: wire email+password form, signup link, Coming Soon Google button, safety line
- [x] Add returnTo param support: protected pages pass ?returnTo= to /login, redirect after login
- [x] Keep /admin-login working (demo_admin + admin)
- [x] Keep Manus OAuth working for existing social login users
- [x] Add vitest tests for signup procedure (duplicate email, short password, social-only account)
- [x] QA: new signup, login, logout, wrong password, duplicate email, dashboard access, admin login

## Branded Pre-Login Page (Apr 2026)

- [x] Rewrite /login page: NodeWaves Quest logo, "Continue to NodeWaves Quest" title, provider buttons (Google/Email), safety line
- [x] All public CTA buttons go to /login first — no direct OAuth redirect for unauthenticated users
- [x] Manus OAuth branding limitation confirmed (see delivery notes)

## Password Reset — Email OTP Flow (Apr 2026)

- [x] Add `password_reset_tokens` table to drizzle schema — DEFERRED to Phase 2 (table already created in DB)
- [x] Run drizzle-kit generate and apply migration SQL — DEFERRED to Phase 2
- [x] Add `auth.requestPasswordReset` tRPC procedure — DEFERRED to Phase 2 (requires SMTP credentials)
- [x] Add `auth.verifyResetOtp` tRPC procedure — DEFERRED to Phase 2
- [x] Add `auth.resetPassword` tRPC procedure — DEFERRED to Phase 2
- [x] Build /forgot-password page — Phase 1: Coming Soon page built; Phase 2: full OTP flow when SMTP ready
- [x] Build /reset-password page — DEFERRED to Phase 2
- [x] Add "Forgot password?" link to /login email form — COMPLETED (points to /forgot-password Coming Soon)
- [x] Add /forgot-password route to App.tsx (reset-password deferred to Phase 2)
- [x] Add vitest tests for password reset procedures — DEFERRED to Phase 2
- [x] QA: password reset flow — DEFERRED to Phase 2

## Phase 1 Auth Polish (Apr 2026)

- [x] Redirect /signup success to /setup instead of /dashboard
- [x] Build /forgot-password page: Coming Soon message, "Contact NodeWaves team" note, link back to /login
- [x] Add "Forgot password?" link to /login email form pointing to /forgot-password
- [x] Add /forgot-password route to App.tsx
- [x] Prepare SMTP env vars in server/_core/env.ts (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME) — no values, just structure for Phase 2
- [x] Clean up password_reset_tokens DB table (already created, keep for Phase 2)
- [x] Update todo.md: mark password reset OTP procedures as Phase 2 (not Phase 1)

## Mobile Auth Pages Polish (Apr 2026)

- [x] Fix Signup.tsx: change title "Create Your NodeWavesQuest Account" to "Create Your Quest Account"
- [x] Fix Signup.tsx: add safe-area top padding (env(safe-area-inset-top)) so logo is not cut off on mobile
- [x] Fix Signup.tsx: ensure proper top/bottom padding, centered layout, comfortable form width on mobile
- [x] Fix Login.tsx: add safe-area top padding so logo/heading is not cut off on mobile
- [x] Fix Login.tsx: ensure proper top/bottom padding, centered layout on mobile
- [x] QA: /login and /signup on mobile viewport — no cropped logo, no text overlap, no broken spacing

## Mini-Games Full QA & Bug Fix (Apr 26, 2026)

- [x] Audit Node Charge game: timer, tapping, XP save, anti-abuse, result screen
- [x] Audit Timed Quiz Battle: questions, timer, answer logic, XP save, no double-submit
- [x] Audit Scam Detector Mission: scenario cards, feedback, XP save, mobile layout
- [x] Fix all bugs found in Node Charge
- [x] Fix all bugs found in Timed Quiz Battle
- [x] Fix all bugs found in Scam Detector Mission
- [x] Add friendly error messages: failed to load, failed to save XP, already completed today, please login, network error
- [x] Verify XP/level/dashboard updates after each game
- [x] Anti-abuse: no duplicate XP on refresh/replay/back button (server-side daily limit per game type)
- [x] Mobile QA: tapping works, buttons large enough, no overflow, timer/score visible
- [x] TypeScript: 0 errors after all fixes
- [x] Tests: 44 passing after all fixes

## Announcement Banner on Dashboard (Apr 26, 2026)

- [x] Audit announcements table schema in drizzle/schema.ts
- [x] Audit announcements query in server/routers.ts (getActive or similar)
- [x] Audit Dashboard.tsx for announcement banner render logic
- [x] Check if active announcement "NodeWaves Quest Soft Beta is LIVE" exists in DB
- [x] Create/seed announcement if missing — announcement existed, updated title + fixed ctaLink to relative /challenge
- [x] Fix dashboard query/render if announcement exists but does not show — render was already correct
- [x] Ensure banner is visible to all logged-in users (not admin-only) — uses publicProcedure
- [x] QA: login as normal user, verify banner appears at top of /dashboard — confirmed in browser
- [x] Save checkpoint after fix

## White-Label Branding Audit (Apr 26, 2026)

- [x] Grep codebase for "Manus", "manus", "manus.space", "manus.im", "Powered by", "Created with"
- [x] Grep for generic app/gamepad icons not replaced with NWQ branding
- [x] Grep for "preview", "development", "sandbox" wording visible to users
- [x] Audit index.html: tab title, favicon, OG tags, canonical URL
- [x] Audit Home.tsx (landing page) for any Manus branding
- [x] Audit Login.tsx for any Manus branding
- [x] Audit Signup.tsx for any Manus branding
- [x] Audit Setup.tsx (profile setup) for any Manus branding
- [x] Audit Dashboard.tsx for any Manus branding
- [x] Audit Quests.tsx / ZonePage.tsx for any Manus branding
- [x] Audit LessonPage.tsx for any Manus branding
- [x] Audit QuizPage.tsx for any Manus branding
- [x] Audit MiniGames.tsx for any Manus branding
- [x] Audit Challenge.tsx / ChallengeJoin.tsx for any Manus branding
- [x] Audit CampaignRules.tsx for any Manus branding
- [x] Audit Disclaimer.tsx for any Manus branding
- [x] Audit AdminLogin.tsx / AdminPanel.tsx for any Manus branding
- [x] Audit error pages / 404 / loading screens for branding
- [x] Audit Footer component for any Manus branding
- [x] Audit MobileNav component for any Manus branding
- [x] Verify share/referral links use window.location.origin (nodewavesquest.com)
- [x] Verify no hardcoded manus.space or manus.im URLs in user-facing code
- [x] Verify all internal links use relative paths or nodewavesquest.com
- [x] Fix all issues found
- [x] Visual QA: browser check all pages
- [x] Save checkpoint

## Dashboard Card Updates (Apr 26 2026)
- [x] Update Community card: WhatsApp link, new copy, rel="noopener noreferrer", opens in new tab
- [x] Update Upcoming Events card: new title/description, disabled "Coming Soon" button with toast

## Mobile Dashboard Header Logo Fix (Apr 26 2026)
- [x] Identify root cause: NWQIcon.tsx used /manus-storage/ signed URL that expires
- [x] Upload logo icon to permanent public CDN (files.manuscdn.com, HTTP 200, no auth, no expiry)
- [x] Update LOGO_URL in NWQIcon.tsx to permanent CDN URL
- [x] Verify logo loads correctly in nav header (naturalWidth: 1254, broken: false)
- [x] Verify all authenticated pages use NWQIcon/NWQLogo component (no hardcoded img paths)
- [x] Tests: 44 passing, TypeScript: 0 errors

## Roadmap Section (Apr 26 2026)
- [x] Add Roadmap section to Home.tsx after Treasury-Aligned Ecosystem section
- [x] 5 phase cards with timeline design, icons, red/gold accents, mobile-friendly
- [x] Compliance-safe copy: planned/may evolve/based on feedback language
- [x] Safety disclaimer at bottom of roadmap section
- [x] Create /roadmap dedicated page (implemented as #roadmap anchor section on homepage)
- [x] Link /roadmap in homepage footer
- [x] Add Roadmap link to homepage nav (footer nav column)

## Roadmap Section Completion (Apr 26 2026)
- [x] Add Roadmap section to Home.tsx after Treasury-Aligned Ecosystem section
- [x] 5 phase cards with staggered timeline design, icons, red/gold accents, mobile-friendly
- [x] Compliance-safe copy: planned/may evolve/based on feedback language
- [x] Safety disclaimer at bottom of roadmap section
- [x] Link /roadmap (anchor #roadmap) in homepage footer under Platform column
- [x] TypeScript: 0 errors, Tests: 44 passing

## Lesson Navigation Bug Fix (Apr 26 2026)
- [x] Fix: Clicking Lesson 2 opens Lesson 1 — root cause: useParams key was 'id' but route param is 'lessonId'

## Node Charge Timer Bug Fix (Apr 26 2026)
- [x] Fix: Node Charge timer shows 15s but does not count down (stale closure / setGameState inside setTimeLeft updater)

## Priority Fixes (Session 2 — April 26, 2026)

- [x] Fix ZonePage params.zoneId routing bug — all zone clicks open Zone 1 instead of correct zone
- [x] Fix Leaderboard direct URL redirect — /leaderboard redirects to /dashboard for logged-in users
- [x] Add pre-game How to Play screens to all 3 mini-games (Node Charge, Timed Quiz Battle, Scam Detector)

## UX Polish Round (April 26, 2026)

- [x] Add "What's Next?" prompt after lesson completion — show zone name quiz CTA with "Take Quiz" button
- [x] Add Reward Chest live progress counter on dashboard — show "2/3 Quests Complete — 1 more to unlock" and toast on premature Open Chest click
- [x] Add XP points label to leaderboard entries — change "20,740 XP" to "20,740 XP points" to clarify it is not money or tokens

## Admin Dashboard Metrics Fix (April 29, 2026)

- [x] Fix admin metrics: lessons completed query returning 0 instead of real count
- [x] Fix admin metrics: quiz attempts query returning 0 instead of real count
- [x] Fix admin metrics: badges awarded query returning 0 instead of real count
- [x] Add admin metric: mini-game plays (total)
- [x] Add admin metric: active users today
- [x] Add admin metric: XP earned today
- [x] Add admin metric: users with 0 XP
- [x] Add admin metric: users with at least 1 lesson completed
- [x] Add admin metric: users with at least 1 quiz attempted
- [x] Add admin metric: users with at least 1 mini-game played
- [x] Ensure all admin metrics are admin-only (adminProcedure)
- [x] TypeScript 0 errors and tests passing after admin metrics changes

## Temporary Admin Review Page (April 29, 2026)

- [x] Set ADMIN_REVIEW_TOKEN environment variable
- [x] Add publicProcedure token-gated admin.review endpoint in routers.ts with all 17 metrics and masked user list
- [x] Build AdminReview.tsx read-only page with metrics grid, masked user table, last-updated timestamp, and beta warning banner
- [x] Register /admin-review route in App.tsx (public, no auth required)
- [x] TypeScript 0 errors and tests passing

## Admin Review Page Optimization (April 29, 2026)

- [x] Add lightweight JSON endpoint /api/admin-review-summary with per-query timeout safety (5s per query)
- [x] Refactor review.data tRPC procedure: split into fast parallel queries, each with individual 5s timeout, return partial results on failure
- [x] Update AdminReview.tsx: per-section loading skeletons, non-blocking render, "Unable to load" per metric only
- [x] TypeScript 0 errors and tests passing after optimization

## Active Users Today Fix (April 29, 2026)

- [x] Audit schema column names for xp_logs, user_lesson_progress, user_quiz_attempts, mini_game_scores, challenge_enrollments
- [x] Fix Active Users Today query in routers.ts review.data procedure using correct column names
- [x] Fix Active Users Today query in adminReviewRoute.ts REST endpoint using correct column names
- [x] TypeScript 0 errors and tests passing

## Streak Retention Metric (April 29, 2026)

- [x] Add usersWithStreak3Plus query to admin.stats procedure in routers.ts
- [x] Add usersWithStreak3Plus query to betaAnalytics procedure in routers.ts
- [x] Add usersWithStreak3Plus query to review.data procedure in routers.ts
- [x] Add users_with_streak_3_plus safeCount to adminReviewRoute.ts REST endpoint
- [x] Update AdminPanel.tsx to display Users with Streak ≥ 3 Days in Engagement Depth section
- [x] Update AdminReview.tsx to display Users with Streak ≥ 3 Days in Engagement Depth section
- [x] TypeScript 0 errors and tests passing

## Beta Monitoring Round (April 29, 2026)

### Priority 1 — Publish checkpoint 58c581b4
- [x] Confirm deployment of checkpoint 58c581b4 (Active Users Today fix + Streak ≥3 Days metric)

### Priority 2 — Last 7 Days Active Users Sparkline
- [x] Add admin.dailyActiveUsers procedure returning 7-day daily active user counts
- [x] Install recharts for sparkline chart
- [x] Add sparkline chart to Admin Overview tab
- [x] Add sparkline chart to Beta Analytics tab

### Priority 3 — Admin Review Page Expiry
- [x] Add ADMIN_REVIEW_EXPIRES to env.ts
- [x] Check expiry in review.data tRPC procedure — return Access Denied if expired
- [x] Check expiry in adminReviewRoute.ts REST endpoint — return 403 if expired
- [x] Show expiry date on AdminReview.tsx if configured

### Priority 4 — Beta Feedback / Bug Report
- [x] Add beta_feedback table to drizzle/schema.ts
- [x] Generate migration SQL and apply via webdev_execute_sql
- [x] Add feedback.submit protectedProcedure in routers.ts
- [x] Add feedback.list adminProcedure in routers.ts
- [x] Build FeedbackButton component (floating button on dashboard)
- [x] Build FeedbackModal with all required fields
- [x] Add Feedback tab to AdminPanel.tsx with feedback list viewer
- [x] TypeScript 0 errors and tests passing

## New Feedback Badge Count (April 29, 2026)

- [x] Add newFeedbackCount to admin.stats procedure (COUNT WHERE status='new')
- [x] Update AdminPanel.tsx sidebar to show red badge next to Feedback tab when count > 0
- [x] Hide badge when count is 0
- [x] TypeScript 0 errors and tests passing

## Feedback Summary Card & Mark All Reviewed (April 29, 2026)

- [x] Add feedback.summary demoAdminProcedure returning count per issue type and total new count
- [x] Add feedback.markAllReviewed demoAdminProcedure to set all status=new to reviewed
- [x] Add Feedback Summary card to Admin Overview with issue type chips and View Feedback button
- [x] Add Mark all as Reviewed button with confirm dialog to Feedback tab
- [x] TypeScript 0 errors and tests passing

## User Management Table Fix (April 29, 2026)

- [x] Audit schema ID type for users table — confirmed MySQL shared cluster auto-increment, IDs span 1 to 1,560,478 for 119 users
- [x] Update admin.users procedure: return serial row number, masked email, challengeEnrolled, sort by newest first
- [x] Rewrite User Management table UI: replace ID column with # serial, display name, masked email, level, XP, challenge, joined, last active
- [x] Show internal ID only in button title tooltip on Promote/Demote action, not as main column
- [x] Fix invalid joined date display — validated with isValidDate check before rendering
- [x] TypeScript 0 errors and tests passing

## User Management Search/Filter (April 29, 2026)

- [x] Add userSearch state (text input) to AdminPanel.tsx Users tab
- [x] Add roleFilter state (All / admin / demo_admin / user / banned) to Users tab
- [x] Add challengeFilter state (All / Enrolled / Not Enrolled) to Users tab
- [x] Client-side filter logic: filter users array by name, maskedEmail prefix, role, challengeEnrolled
- [x] Show result count: "Showing X of Y users"
- [x] Preserve serial number column, masked email, challenge enrolled, last active, demo_admin badge
- [x] No schema change, no public route touched
- [x] TypeScript 0 errors and tests passing

## Beta Funnel Analytics Audit & Fix (April 29, 2026)

- [x] Audit current funnel queries in admin.stats, betaAnalytics, review.data, REST endpoint
- [x] Rewrite funnel to use DISTINCT user counts (not total events) for all 8 funnel steps
- [x] Add separate Activity Totals section (total lessons, quizzes, mini-games, badges, XP)
- [x] Add drop-off table: Registered → Challenge → Lesson → Quiz → Mini-game (count + % of registered + drop-off from prev)
- [x] Fix "Active Today" to use UNION of all 6 activity sources with DISTINCT user IDs
- [x] Add "Unable to load" fallback when any query fails (no fake 0)
- [x] Label funnel counts as "Unique Users", activity totals as "Total Events"
- [x] Apply same logic to all four surfaces: admin.stats, betaAnalytics, review.data, REST endpoint
- [x] Update AdminPanel.tsx Overview tab UI with new funnel + activity totals + drop-off
- [x] Update AdminPanel.tsx Beta Analytics tab UI with same structure
- [x] Update AdminReview.tsx with same structure
- [x] TypeScript 0 errors and tests passing


## Mobile Dashboard + Auth Journey QA (May 13, 2026)

- [x] Test auth journey: Start Free Quest → Login page → OAuth/Email options
- [x] Test Google button: confirm disabled/Coming Soon, no broken flow
- [x] Test email login: signup, create account, back to homepage
- [x] Test dashboard mobile logo: loads correctly on 360px, 390px, 430px, tablet, desktop
- [x] Test dashboard header: responsive, no overflow, mobile nav works
- [x] Test XP bar, streak tracker, daily check-in on mobile
- [x] Test active quests panel, zone preview, badges on mobile
- [x] Test Node Charge mini-game: touch handling, no double-submit, XP refresh
- [x] Test Timed Quiz Battle: submit behavior, XP refresh on mobile
- [x] Test Scam Detector: interactions, XP refresh on mobile
- [x] Test Challenge page mobile: leaderboard, enrollment, 7-day progress
- [x] Document all issues found
- [x] Fix all issues found
- [x] Verify no regressions after fixes
- [x] TypeScript 0 errors and tests passing
- [x] Save checkpoint and deliver QA report with screenshots


## Soft Beta Tester Onboarding Pack (May 13, 2026)

- [x] Create beta tester invite message (WhatsApp + Email formats)
- [x] Create group pinned message with testing guide
- [x] Create tester journey checklist (7-day progression)
- [x] Create bug report template with all required fields
- [x] Create feedback survey with 16 questions
- [x] Create admin review checklist with metrics and analysis
- [x] Compile all six deliverables into single onboarding pack
- [x] Add distribution guide and timeline recommendations
- [x] Add success metrics for public beta go-ahead decision


## QA Test User System (May 13, 2026)

- [ ] Add isTestUser boolean column to users table in schema.ts
- [ ] Generate migration SQL and apply via webdev_execute_sql
- [ ] Add createQATestUser adminProcedure in routers.ts (generates temp email + password, returns credentials)
- [ ] Add deleteQATestUser adminProcedure in routers.ts (soft delete or hard delete)
- [ ] Add listQATestUsers adminProcedure in routers.ts (admin-only view)
- [ ] Update admin.stats to count test users separately (not in main user count)
- [ ] Update betaAnalytics to exclude test users by default, add toggle for admin review
- [ ] Update review.data to exclude test users by default
- [ ] Update leaderboard queries to exclude test users from public leaderboard
- [ ] Add QA Activity Report page in AdminPanel.tsx (test user details, activity log)
- [ ] Verify QA test user can login via normal auth flow (no backdoor)
- [ ] Verify QA test user has no admin panel access
- [ ] Verify QA test user cannot access campaign reward eligibility checks
- [ ] Verify campaign reward exports exclude test users
- [ ] TypeScript 0 errors and tests passing
- [ ] Save checkpoint and deliver completion report


## Badge Unlock Investigation — Faysal (May 2026)

- [ ] Query DB for user Faysal's activity: lessons, quizzes, mini-games, streak, challenge, badges
- [ ] Audit badge unlock logic in server/db.ts (checkAndAwardBadges or equivalent)
- [ ] Compare Faysal's activities against all badge requirements
- [ ] Identify root cause: normal behavior vs badge sync bug
- [ ] Fix badge sync/recalculation bug if found
- [ ] Add admin badge resync procedure (admin-only, safe)
- [ ] Improve badge page "How to Unlock" text for locked badges
- [ ] TypeScript 0 errors and tests passing

## NodalQuest Full Rebrand (September 2026)

- [ ] Confirm NodalQuest as the final visible product name and inventory all visible NodeWaves Quest references
- [ ] Prepare the approved circular red-and-silver logo asset for web delivery without altering the original artwork
- [ ] Update reusable product logo/icon component and browser application title to NodalQuest
- [ ] Update visible in-app, authentication, and admin branding to NodalQuest while preserving product logic and data
- [ ] Preserve XP, badges, quests, user accounts, mini-games, analytics, and admin functionality unchanged
- [ ] Verify primary pages and mobile header branding after the rebrand
- [ ] Run TypeScript validation and the existing test suite
- [ ] Save a rebrand checkpoint and document domain follow-up work separately

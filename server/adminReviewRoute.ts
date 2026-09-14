/**
 * Temporary read-only beta review JSON endpoint.
 * Route: GET /api/admin-review-summary?token=...
 *
 * IMPORTANT: Disable this route before public launch by removing ADMIN_REVIEW_TOKEN.
 *
 * Security: token-gated, read-only, no private data, masked emails only.
 * Expiry: set ADMIN_REVIEW_EXPIRES=YYYY-MM-DD to auto-expire after that date.
 *
 * Analytics contract (v2):
 *  - funnel[]        → Conversion Funnel — Unique Users
 *  - activityTotals  → Activity Totals — Total Events
 *  - supporting[]    → Supporting counts (role breakdown, today, streaks)
 *  - recent_users[]  → Latest 20 users (masked email, no private data)
 */
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import {
  users,
  userProfiles,
  challengeEnrollments,
} from "../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getBetaAnalytics } from "./betaAnalyticsHelper";

const QUERY_TIMEOUT_MS = 5000;

// ── Email masker ─────────────────────────────────────────────────────────────
function maskEmail(email: string | null): string {
  if (!email) return "***@***.***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length <= 2 ? "***" : local[0] + "***";
  return `${masked}@${domain}`;
}

// ── Route registration ───────────────────────────────────────────────────────
export function registerAdminReviewRoute(app: Express) {
  app.get("/api/admin-review-summary", async (req: Request, res: Response) => {
    // ── Token check ──────────────────────────────────────────────────────────
    const expectedToken = ENV.adminReviewToken;
    const providedToken = (req.query.token as string) ?? "";
    if (!expectedToken || providedToken !== expectedToken) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    // ── Expiry check ─────────────────────────────────────────────────────────
    if (ENV.adminReviewExpires) {
      const today = new Date().toISOString().slice(0, 10);
      if (today > ENV.adminReviewExpires) {
        res.status(403).json({
          error: "Access Denied: This review page has expired.",
          expiredOn: ENV.adminReviewExpires,
        });
        return;
      }
    }

    // ── DB connection ────────────────────────────────────────────────────────
    const db = await getDb();
    if (!db) {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    // ── Run shared analytics helper ──────────────────────────────────────────
    const analytics = await getBetaAnalytics(db);

    // ── Role breakdown (not in shared helper) ────────────────────────────────
    const safeCount = async (fn: () => Promise<number>): Promise<number | null> => {
      try {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), QUERY_TIMEOUT_MS)
          ),
        ]);
      } catch {
        return null;
      }
    };

    const [normalUsers, adminUsersCount, demoAdminCount] = await Promise.all([
      safeCount(async () => {
        const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "user"));
        return Number(r.v);
      }),
      safeCount(async () => {
        const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "admin"));
        return Number(r.v);
      }),
      safeCount(async () => {
        const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "demo_admin"));
        return Number(r.v);
      }),
    ]);

    // ── Latest 20 users (masked email) ───────────────────────────────────────
    let recentUsers: object[] = [];
    try {
      const raw = await Promise.race([
        db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
          })
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(20),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), QUERY_TIMEOUT_MS)
        ),
      ]);

      const enrolledSet = new Set(
        (
          await db
            .select({ userId: challengeEnrollments.userId })
            .from(challengeEnrollments)
        ).map((r) => r.userId)
      );

      const profileMap = new Map(
        (
          await db
            .select({
              userId: userProfiles.userId,
              xp: userProfiles.xp,
              level: userProfiles.level,
            })
            .from(userProfiles)
            .where(
              sql`${userProfiles.userId} IN (${sql.join(
                raw.map((u) => sql`${u.id}`),
                sql`, `
              )})`
            )
        ).map((p) => [p.userId, p])
      );

      recentUsers = raw.map((u) => ({
        display_name: u.name ?? "(no name)",
        masked_email: maskEmail(u.email),
        joined: u.createdAt ? new Date(u.createdAt).toISOString() : null,
        xp: profileMap.get(u.id)?.xp ?? 0,
        level: profileMap.get(u.id)?.level ?? 1,
        challenge_enrolled: enrolledSet.has(u.id),
      }));
    } catch {
      recentUsers = [];
    }

    // ── Response ─────────────────────────────────────────────────────────────
    res.setHeader("Cache-Control", "no-store");
    res.json({
      _note: "Temporary read-only beta review endpoint. Disable before public launch.",
      _analytics_version: "v2",
      generated_at: new Date().toISOString(),
      expires_on: ENV.adminReviewExpires || null,

      // ── Conversion Funnel — Unique Users ─────────────────────────────────
      // Each step: { label, count (unique users | null), pctOfRegistered, dropOffFromPrev }
      funnel: analytics.funnel.map((s) => ({
        label: s.label,
        unique_users: s.count,
        pct_of_registered: s.pctOfRegistered,
        drop_off_from_prev_pct: s.dropOffFromPrev,
        ok: s.count !== null,
      })),

      // ── Activity Totals — Total Events ────────────────────────────────────
      activity_totals: {
        total_lessons_completed: {
          value: analytics.activityTotals.totalLessonsCompleted,
          ok: analytics.activityTotals.totalLessonsCompleted !== null,
        },
        total_quiz_attempts: {
          value: analytics.activityTotals.totalQuizAttempts,
          ok: analytics.activityTotals.totalQuizAttempts !== null,
        },
        total_mini_game_plays: {
          value: analytics.activityTotals.totalMiniGamePlays,
          ok: analytics.activityTotals.totalMiniGamePlays !== null,
        },
        total_badges_awarded: {
          value: analytics.activityTotals.totalBadgesAwarded,
          ok: analytics.activityTotals.totalBadgesAwarded !== null,
        },
        total_xp_earned: {
          value: analytics.activityTotals.totalXpEarned,
          ok: analytics.activityTotals.totalXpEarned !== null,
        },
      },

      // ── Supporting counts ─────────────────────────────────────────────────
      supporting: {
        total_users: { value: analytics.totalUsers, ok: analytics.totalUsers !== null },
        registered_today: { value: analytics.todayUsers, ok: analytics.todayUsers !== null },
        normal_users: { value: normalUsers, ok: normalUsers !== null },
        admin_users: { value: adminUsersCount, ok: adminUsersCount !== null },
        demo_admin_users: { value: demoAdminCount, ok: demoAdminCount !== null },
        xp_earned_today: { value: analytics.xpEarnedToday, ok: analytics.xpEarnedToday !== null },
        users_with_streak_3_plus: { value: analytics.usersWithStreak3Plus, ok: analytics.usersWithStreak3Plus !== null },
        users_with_zero_xp: { value: analytics.usersWithZeroXp, ok: analytics.usersWithZeroXp !== null },
      },

      recent_users: recentUsers,
    });
  });
}

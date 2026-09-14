/**
 * Shared beta analytics helper.
 *
 * All funnel counts use DISTINCT user IDs (unique users).
 * Activity totals count total event rows.
 * Both categories are returned separately so UI can label them correctly.
 *
 * Used by:
 *   - admin.stats (demoAdminProcedure)
 *   - admin.betaAnalytics (adminProcedure)
 *   - review.data (publicProcedure, token-gated)
 *   - GET /api/admin-review-summary (REST, token-gated)
 */

import { sql, eq } from "drizzle-orm";
import {
  users,
  userProfiles,
  challengeEnrollments,
  userLessonProgress,
  userQuizAttempts,
  miniGameScores,
  userBadges,
  xpLogs,
  dailyCheckIns,
} from "../drizzle/schema";

const QUERY_TIMEOUT_MS = 5000;

/** Wraps a single async query with a timeout. Returns null on failure. */
async function safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
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
}

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single funnel step. null means the query failed. */
export interface FunnelStep {
  label: string;
  /** Unique user count — null means "Unable to load" */
  count: number | null;
  /** % of total registered users — null if count or total is unavailable */
  pctOfRegistered: number | null;
  /** Drop-off from the previous step (0-100) — null if either step is unavailable */
  dropOffFromPrev: number | null;
}

/** Structured analytics payload returned by getBetaAnalytics() */
export interface BetaAnalyticsPayload {
  // ── Conversion Funnel — Unique Users ──────────────────────────────────────
  funnel: FunnelStep[];

  // ── Activity Totals — Total Events ────────────────────────────────────────
  activityTotals: {
    totalLessonsCompleted: number | null;
    totalQuizAttempts: number | null;
    totalMiniGamePlays: number | null;
    totalBadgesAwarded: number | null;
    totalXpEarned: number | null;
  };

  // ── Supporting counts (used by Overview cards) ────────────────────────────
  totalUsers: number | null;
  todayUsers: number | null;
  xpEarnedToday: number | null;
  usersWithStreak3Plus: number | null;
  usersWithZeroXp: number | null;
  newFeedbackCount?: number | null; // only populated by admin.stats
}

// ── Main helper ───────────────────────────────────────────────────────────────

/**
 * Runs all funnel + activity total queries against the provided Drizzle db instance.
 * Every query is individually wrapped in safeQuery() so a single DB failure
 * returns null for that metric rather than throwing.
 *
 * @param db  Drizzle MySQL db instance
 * @param opts.includeFeedbackCount  Whether to query beta_feedback for new count
 */
export async function getBetaAnalytics(
  db: Awaited<ReturnType<typeof import("./db").getDb>>,
  opts: { includeFeedbackCount?: boolean } = {}
): Promise<BetaAnalyticsPayload> {
  if (!db) {
    // Return all-null payload when DB is unavailable
    const nullFunnel: FunnelStep[] = FUNNEL_LABELS.map((label) => ({
      label,
      count: null,
      pctOfRegistered: null,
      dropOffFromPrev: null,
    }));
    return {
      funnel: nullFunnel,
      activityTotals: {
        totalLessonsCompleted: null,
        totalQuizAttempts: null,
        totalMiniGamePlays: null,
        totalBadgesAwarded: null,
        totalXpEarned: null,
      },
      totalUsers: null,
      todayUsers: null,
      xpEarnedToday: null,
      usersWithStreak3Plus: null,
      usersWithZeroXp: null,
      newFeedbackCount: null,
    };
  }

  // ── Run all queries in parallel ─────────────────────────────────────────────
  const [
    // Funnel — unique users
    totalUsers,
    profileCompleted,
    challengeJoined,
    usersWithLesson,
    usersWithQuiz,
    usersWithMiniGame,
    usersWithBadge,
    activeUsersToday,
    // Activity totals — total events
    totalLessonsCompleted,
    totalQuizAttempts,
    totalMiniGamePlays,
    totalBadgesAwarded,
    totalXpEarned,
    // Supporting
    todayUsers,
    xpEarnedToday,
    usersWithStreak3Plus,
    usersWithZeroXp,
  ] = await Promise.all([
    // ── 1. Registered (all users) ─────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(users);
      return Number(r.v);
    }),

    // ── 2. Profile Completed (profileSetupDone = true) ────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${userProfiles.userId})` })
        .from(userProfiles)
        .where(eq(userProfiles.profileSetupDone, true));
      return Number(r.v);
    }),

    // ── 3. Challenge Joined (distinct enrolled users) ─────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${challengeEnrollments.userId})` })
        .from(challengeEnrollments);
      return Number(r.v);
    }),

    // ── 4. Completed ≥1 Lesson ────────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${userLessonProgress.userId})` })
        .from(userLessonProgress);
      return Number(r.v);
    }),

    // ── 5. Attempted ≥1 Quiz ─────────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${userQuizAttempts.userId})` })
        .from(userQuizAttempts);
      return Number(r.v);
    }),

    // ── 6. Played ≥1 Mini-Game ───────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${miniGameScores.userId})` })
        .from(miniGameScores);
      return Number(r.v);
    }),

    // ── 7. Earned ≥1 Badge ───────────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(DISTINCT ${userBadges.userId})` })
        .from(userBadges);
      return Number(r.v);
    }),

    // ── 8. Active Today (UNION of 6 activity sources) ────────────────────────
    safeQuery(async () => {
      const [a, b, c, d, e, f] = await Promise.all([
        db.selectDistinct({ userId: xpLogs.userId }).from(xpLogs)
          .where(sql`DATE(${xpLogs.createdAt}) = CURDATE()`),
        db.selectDistinct({ userId: userLessonProgress.userId }).from(userLessonProgress)
          .where(sql`DATE(${userLessonProgress.completedAt}) = CURDATE()`),
        db.selectDistinct({ userId: userQuizAttempts.userId }).from(userQuizAttempts)
          .where(sql`DATE(${userQuizAttempts.completedAt}) = CURDATE()`),
        db.selectDistinct({ userId: miniGameScores.userId }).from(miniGameScores)
          .where(sql`DATE(${miniGameScores.playedAt}) = CURDATE()`),
        db.selectDistinct({ userId: challengeEnrollments.userId }).from(challengeEnrollments)
          .where(sql`DATE(${challengeEnrollments.enrolledAt}) = CURDATE()`),
        db.selectDistinct({ userId: dailyCheckIns.userId }).from(dailyCheckIns)
          .where(sql`DATE(${dailyCheckIns.checkedInAt}) = CURDATE()`),
      ]);
      const s = new Set([...a, ...b, ...c, ...d, ...e, ...f].map((r) => r.userId));
      return s.size;
    }),

    // ── Activity Totals — Total Events ────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(userLessonProgress);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(userQuizAttempts);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(miniGameScores);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(userBadges);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COALESCE(SUM(${xpLogs.amount}), 0)` })
        .from(xpLogs);
      return Number(r.v);
    }),

    // ── Supporting ────────────────────────────────────────────────────────────
    safeQuery(async () => {
      const [r] = await db.select({ v: sql<number>`COUNT(*)` }).from(users)
        .where(sql`DATE(${users.createdAt}) = CURDATE()`);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COALESCE(SUM(${xpLogs.amount}), 0)` })
        .from(xpLogs)
        .where(sql`DATE(${xpLogs.createdAt}) = CURDATE()`);
      return Number(r.v);
    }),
    safeQuery(async () => {
      const [r] = await db
        .select({ v: sql<number>`COUNT(*)` })
        .from(userProfiles)
        .where(sql`${userProfiles.currentStreak} >= 3`);
      return Number(r.v);
    }),
    safeQuery(async () => {
      // Users with zero XP = profiles with xp=0 + users with no profile at all
      const [r] = await db
        .select({ v: sql<number>`COUNT(*)` })
        .from(userProfiles)
        .where(sql`${userProfiles.xp} = 0 OR ${userProfiles.xp} IS NULL`);
      const noProfile = await db.execute(
        sql`SELECT COUNT(*) as cnt FROM users u LEFT JOIN user_profiles p ON u.id = p.userId WHERE p.id IS NULL`
      ) as any;
      const noProfileRows = Array.isArray(noProfile[0]) ? noProfile[0] : noProfile;
      return Number(r.v) + Number((noProfileRows[0] as any)?.cnt ?? 0);
    }),
  ]);

  // Optional: feedback count
  let newFeedbackCount: number | null = null;
  if (opts.includeFeedbackCount) {
    try {
      const { betaFeedback } = await import("../drizzle/schema");
      const [r] = await db
        .select({ v: sql<number>`COUNT(*)` })
        .from(betaFeedback)
        .where(eq(betaFeedback.status, "new"));
      newFeedbackCount = Number(r.v);
    } catch {
      newFeedbackCount = null;
    }
  }

  // ── Build funnel with drop-off ────────────────────────────────────────────
  const rawSteps: Array<{ label: string; count: number | null }> = [
    { label: "Registered", count: totalUsers },
    { label: "Profile Completed", count: profileCompleted },
    { label: "Challenge Joined", count: challengeJoined },
    { label: "Completed ≥1 Lesson", count: usersWithLesson },
    { label: "Attempted ≥1 Quiz", count: usersWithQuiz },
    { label: "Played ≥1 Mini-Game", count: usersWithMiniGame },
    { label: "Earned ≥1 Badge", count: usersWithBadge },
    { label: "Active Today", count: activeUsersToday },
  ];

  const registered = totalUsers ?? 0;
  const funnel: FunnelStep[] = rawSteps.map((step, i) => {
    const pctOfRegistered =
      step.count !== null && registered > 0
        ? Math.round((step.count / registered) * 100)
        : null;

    let dropOffFromPrev: number | null = null;
    if (i > 0) {
      const prev = rawSteps[i - 1].count;
      if (step.count !== null && prev !== null && prev > 0) {
        dropOffFromPrev = Math.round(((prev - step.count) / prev) * 100);
      }
    }

    return { label: step.label, count: step.count, pctOfRegistered, dropOffFromPrev };
  });

  return {
    funnel,
    activityTotals: {
      totalLessonsCompleted,
      totalQuizAttempts,
      totalMiniGamePlays,
      totalBadgesAwarded,
      totalXpEarned,
    },
    totalUsers,
    todayUsers,
    xpEarnedToday,
    usersWithStreak3Plus,
    usersWithZeroXp,
    newFeedbackCount,
  };
}

// ── Label list (used for null-payload generation) ─────────────────────────────
const FUNNEL_LABELS = [
  "Registered",
  "Profile Completed",
  "Challenge Joined",
  "Completed ≥1 Lesson",
  "Attempted ≥1 Quiz",
  "Played ≥1 Mini-Game",
  "Earned ≥1 Badge",
  "Active Today",
];

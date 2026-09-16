import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, userProfiles, zones, lessons, quizzes, quizQuestions,
  badges, userBadges, xpLogs, dailyCheckIns, userLessonProgress,
  userQuizAttempts, userZoneUnlocks, miniGameScores, referrals,
  announcements, campaigns, xpConfig, challengeEnrollments, challengeDayCompletions,
  passwordResetTokens,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── User Profiles ────────────────────────────────────────────────────────────
export async function getOrCreateProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  const code = nanoid(8).toUpperCase();
  await db.insert(userProfiles).values({ userId, referralCode: code });
  const created = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return created[0] ?? null;
}

export async function setupProfile(userId: number, username: string, avatarId: string, referralCode?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // Check username uniqueness
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.username, username)).limit(1);
  if (existing.length > 0 && existing[0].userId !== userId) throw new Error("Username already taken");

  const profile = await getOrCreateProfile(userId);
  if (!profile) throw new Error("Could not create profile");

  // Handle referral
  let referredById: number | undefined;
  if (referralCode) {
    const referrer = await db.select().from(userProfiles).where(eq(userProfiles.referralCode, referralCode)).limit(1);
    if (referrer.length > 0 && referrer[0].userId !== userId) {
      referredById = referrer[0].userId;
    }
  }

  await db.update(userProfiles).set({
    username,
    avatarId,
    referredBy: referredById ?? null,
    profileSetupDone: true,
  }).where(eq(userProfiles.userId, userId));

  // Grant signup XP
  await grantXP(userId, 50, "admin_grant", undefined, "Welcome bonus XP");

  // Handle referral XP
  if (referredById) {
    await db.insert(referrals).values({ referrerId: referredById, referredUserId: userId });
    await grantXP(referredById, 100, "referral", userId, "Referral bonus");
    await db.update(userProfiles).set({ totalReferrals: sql`totalReferrals + 1` }).where(eq(userProfiles.userId, referredById));
  }

  return await getOrCreateProfile(userId);
}

// ─── XP & Levels ─────────────────────────────────────────────────────────────
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 50) level++;
  return level;
}

export async function grantXP(
  userId: number,
  amount: number,
  source: "lesson" | "quiz" | "daily_checkin" | "streak_bonus" | "badge_bonus" | "mini_game" | "referral" | "admin_grant",
  sourceId?: number,
  description?: string
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(xpLogs).values({ userId, amount, source, sourceId, description });
  const profile = await getOrCreateProfile(userId);
  if (!profile) return;

  const newXp = (profile.xp ?? 0) + amount;
  const newLevel = levelForXp(newXp);

  await db.update(userProfiles).set({ xp: newXp, level: newLevel }).where(eq(userProfiles.userId, userId));
  return { newXp, newLevel, leveledUp: newLevel > (profile.level ?? 1) };
}

// ─── Daily Check-in ───────────────────────────────────────────────────────────
export async function performCheckIn(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const profile = await getOrCreateProfile(userId);
  if (!profile) throw new Error("Profile not found");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (profile.lastCheckIn) {
    const lastDate = new Date(profile.lastCheckIn);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    if (lastDay.getTime() === today.getTime()) throw new Error("Already checked in today");
  }

  const yesterday = new Date(today.getTime() - 86400000);
  let newStreak = 1;
  if (profile.lastCheckIn) {
    const lastDate = new Date(profile.lastCheckIn);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    if (lastDay.getTime() === yesterday.getTime()) {
      newStreak = (profile.currentStreak ?? 0) + 1;
    }
  }

  const newLongest = Math.max(newStreak, profile.longestStreak ?? 0);
  let xpEarned = 25;
  let bonusDesc = "";

  if (newStreak === 3) { xpEarned += 50; bonusDesc = " + 3-day streak bonus"; }
  else if (newStreak === 7) { xpEarned += 100; bonusDesc = " + 7-day streak bonus"; }
  else if (newStreak === 30) { xpEarned += 300; bonusDesc = " + 30-day streak bonus"; }

  await db.insert(dailyCheckIns).values({ userId, xpEarned, streakDay: newStreak });
  await db.update(userProfiles).set({
    lastCheckIn: now,
    currentStreak: newStreak,
    longestStreak: newLongest,
  }).where(eq(userProfiles.userId, userId));

  const xpResult = await grantXP(userId, xpEarned, "daily_checkin", undefined, `Daily check-in${bonusDesc}`);
  return { xpEarned, newStreak, newLongest, ...xpResult };
}

// ─── Zones ────────────────────────────────────────────────────────────────────
export async function getZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(zones).where(eq(zones.isActive, true)).orderBy(zones.order);
}

export async function getUserZoneUnlocks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userZoneUnlocks).where(eq(userZoneUnlocks.userId, userId));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
export async function getLessonsByZone(zoneId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(and(eq(lessons.zoneId, zoneId), eq(lessons.isActive, true))).orderBy(lessons.order);
}

export async function getLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result[0] ?? null;
}

export async function completeLesson(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const lesson = await getLesson(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const existing = await db.select().from(userLessonProgress)
    .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId))).limit(1);
  if (existing.length > 0) return { alreadyCompleted: true, xpEarned: 0 };

  await db.insert(userLessonProgress).values({ userId, lessonId, xpEarned: lesson.xpReward });
  const xpResult = await grantXP(userId, lesson.xpReward, "lesson", lessonId, `Completed: ${lesson.title}`);
  return { alreadyCompleted: false, xpEarned: lesson.xpReward, ...xpResult };
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export async function getQuizWithQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return null;
  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (!quiz[0]) return null;
  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(quizQuestions.order);
  return { ...quiz[0], questions };
}

export async function submitQuizAttempt(userId: number, quizId: number, answers: number[], timeTaken: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const quizData = await getQuizWithQuestions(quizId);
  if (!quizData) throw new Error("Quiz not found");

  const total = quizData.questions.length;
  const correct = quizData.questions.filter((q, i) => answers[i] === q.correctIndex).length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quizData.passingScore;

  let xpEarned = 0;
  if (passed) {
    xpEarned = score === 100 ? quizData.xpReward + 50 : quizData.xpReward;
  }

  await db.insert(userQuizAttempts).values({ userId, quizId, score, xpEarned, timeTaken, passed });
  if (xpEarned > 0) {
    await grantXP(userId, xpEarned, "quiz", quizId, `Quiz: ${quizData.title} (${score}%)`);
  }

  return { score, correct, total, passed, xpEarned };
}

// ─── Badges ───────────────────────────────────────────────────────────────────
export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges).where(eq(badges.isActive, true));
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: userBadges.id,
    badgeId: userBadges.badgeId,
    earnedAt: userBadges.earnedAt,
    name: badges.name,
    description: badges.description,
    icon: badges.icon,
    color: badges.color,
    slug: badges.slug,
  }).from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
}

export async function checkAndAwardBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const profile = await getOrCreateProfile(userId);
  if (!profile) return [];

  const allBadges = await getAllBadges();
  const userBadgeList = await getUserBadges(userId);
  const earnedIds = new Set(userBadgeList.map(b => b.badgeId));
  const newBadges = [];

  // Fetch activity counts once (only if there are non-level/streak/xp badges to check)
  const unearnedBadges = allBadges.filter(b => !earnedIds.has(b.id));
  const needsActivity = unearnedBadges.some(b => {
    const c = b.criteria as { type: string } | null;
    return c && ["lesson", "zone", "quiz_perfect", "mini_game", "referral"].includes(c.type);
  });

  let lessonCount = 0;
  let zoneUnlocks: number[] = [];
  let hasPerfectQuiz = false;
  let miniGameTypes: string[] = [];
  let referralCount = 0;

  if (needsActivity) {
    const [lessonRows, zoneRows, quizRows, miniGameRows, referralRows] = await Promise.all([
      db.select({ v: sql<number>`COUNT(*)` }).from(userLessonProgress).where(eq(userLessonProgress.userId, userId)),
      db.select({ zoneId: userZoneUnlocks.zoneId }).from(userZoneUnlocks).where(eq(userZoneUnlocks.userId, userId)),
      // Perfect quiz: score matches total questions for that quiz
      db.select({ quizId: userQuizAttempts.quizId, score: userQuizAttempts.score })
        .from(userQuizAttempts)
        .where(eq(userQuizAttempts.userId, userId)),
      db.select({ gameType: miniGameScores.gameType }).from(miniGameScores).where(eq(miniGameScores.userId, userId)),
      db.select({ v: sql<number>`COUNT(*)` }).from(referrals).where(eq(referrals.referrerId, userId)),
    ]);
    lessonCount = Number(lessonRows[0]?.v ?? 0);
    zoneUnlocks = zoneRows.map(r => r.zoneId);
    miniGameTypes = Array.from(new Set(miniGameRows.map(r => r.gameType)));
    referralCount = Number(referralRows[0]?.v ?? 0);

    // Check perfect quiz: score must equal total questions for that quiz
    if (quizRows.length > 0) {
      const quizIds = Array.from(new Set(quizRows.map(r => r.quizId)));
      const questionCounts = await db
        .select({ quizId: quizQuestions.quizId, cnt: sql<number>`COUNT(*)` })
        .from(quizQuestions)
        .where(sql`${quizQuestions.quizId} IN (${sql.join(quizIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(quizQuestions.quizId);
      const countMap = new Map(questionCounts.map(r => [r.quizId, Number(r.cnt)]));
      hasPerfectQuiz = quizRows.some(r => countMap.get(r.quizId) !== undefined && r.score >= countMap.get(r.quizId)!);
    }
  }

  for (const badge of unearnedBadges) {
    const criteria = badge.criteria as { type: string; value: number | string } | null;
    if (!criteria) continue;

    let earned = false;
    if (criteria.type === "level" && (profile.level ?? 1) >= (criteria.value as number)) earned = true;
    else if (criteria.type === "streak" && (profile.currentStreak ?? 0) >= (criteria.value as number)) earned = true;
    else if (criteria.type === "xp" && (profile.xp ?? 0) >= (criteria.value as number)) earned = true;
    else if (criteria.type === "lesson" && lessonCount >= (criteria.value as number)) earned = true;
    else if (criteria.type === "zone" && zoneUnlocks.includes(criteria.value as number)) earned = true;
    else if (criteria.type === "quiz_perfect" && hasPerfectQuiz) earned = true;
    else if (criteria.type === "mini_game" && miniGameTypes.includes(criteria.value as string)) earned = true;
    else if (criteria.type === "referral" && referralCount >= (criteria.value as number)) earned = true;

    if (earned) {
      await db.insert(userBadges).values({ userId, badgeId: badge.id });
      if (badge.xpBonus > 0) await grantXP(userId, badge.xpBonus, "badge_bonus", badge.id, `Badge: ${badge.name}`);
      newBadges.push(badge);
    }
  }

  return newBadges;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export async function getLeaderboard(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const { eq: eqOp, and: andOp } = await import("drizzle-orm");
  return db.select({
    userId: userProfiles.userId,
    username: userProfiles.username,
    avatarId: userProfiles.avatarId,
    xp: userProfiles.xp,
    level: userProfiles.level,
    currentStreak: userProfiles.currentStreak,
  }).from(userProfiles)
    .innerJoin(users, eqOp(userProfiles.userId, users.id))
    .where(andOp(eqOp(userProfiles.profileSetupDone, true), eqOp(users.isTestUser, false)))
    .orderBy(desc(userProfiles.xp))
    .limit(limit);
}

// ─── Mini-Games ───────────────────────────────────────────────────────────────
export async function saveMiniGameScore(
  userId: number,
  gameType: "node_charge" | "quiz_battle" | "scam_detector",
  score: number,
  xpEarned: number
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // Anti-abuse: each game type can award XP at most once per UTC calendar day
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const existing = await db
    .select({ id: miniGameScores.id })
    .from(miniGameScores)
    .where(
      and(
        eq(miniGameScores.userId, userId),
        eq(miniGameScores.gameType, gameType),
        gte(miniGameScores.playedAt, todayStart),
        lt(miniGameScores.playedAt, todayEnd)
      )
    )
    .limit(1);

  const alreadyPlayedToday = existing.length > 0;
  const actualXp = alreadyPlayedToday ? 0 : xpEarned;

  // Always record the play (for stats), but only grant XP on first play of the day
  await db.insert(miniGameScores).values({ userId, gameType, score, xpEarned: actualXp });
  if (actualXp > 0) await grantXP(userId, actualXp, "mini_game", undefined, `Mini-game: ${gameType}`);

  return { score, xpEarned: actualXp, alreadyPlayedToday };
}

// ─── Challenge Day Progress ─────────────────────────────────────────────────────────

/**
 * Safely records a challenge day completion and increments daysCompleted.
 * Rules:
 *   - Once-per-source: the same quiz/lesson cannot count twice (enforced by DB unique index).
 *   - Once-per-calendar-day: only ONE new day can be credited per UTC calendar day.
 *   - Max 7 days total.
 * Returns { alreadyCompleted, dayNumber, daysCompleted } so callers can show feedback.
 */
export async function completeChallengeDay(
  userId: number,
  sourceType: "quiz" | "lesson",
  sourceId: number,
  challengeId = "7day-web3-challenge"
): Promise<{ alreadyCompleted: boolean; dayNumber: number; daysCompleted: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // 1. Get the user's enrollment
  const [enrollment] = await db.select()
    .from(challengeEnrollments)
    .where(and(eq(challengeEnrollments.userId, userId), eq(challengeEnrollments.challengeId, challengeId)))
    .limit(1);

  if (!enrollment) {
    // User is not enrolled — silently skip
    return { alreadyCompleted: false, dayNumber: 0, daysCompleted: 0 };
  }

  // 2. Load all existing completions for this user+challenge
  const completedDays = await db.select()
    .from(challengeDayCompletions)
    .where(and(
      eq(challengeDayCompletions.userId, userId),
      eq(challengeDayCompletions.challengeId, challengeId)
    ));

  const completedDayNumbers = new Set(completedDays.map(d => d.dayNumber));
  const currentDaysCompleted = completedDayNumbers.size;

  // If already at 7 days, no more progress
  if (currentDaysCompleted >= 7) {
    return { alreadyCompleted: true, dayNumber: 7, daysCompleted: 7 };
  }

  // 3. Prevent same source from counting twice (belt-and-suspenders over DB unique index)
  const alreadyUsed = completedDays.some(
    d => d.sourceType === sourceType && d.sourceId === sourceId
  );
  if (alreadyUsed) {
    return { alreadyCompleted: true, dayNumber: currentDaysCompleted, daysCompleted: currentDaysCompleted };
  }

  // 4. Once-per-calendar-day enforcement:
  //    A user can only earn ONE new challenge day per UTC calendar day.
  //    If they already have a completion recorded today, skip.
  const todayUTC = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const alreadyCompletedToday = completedDays.some(d => {
    const dayDate = new Date(d.completedAt).toISOString().slice(0, 10);
    return dayDate === todayUTC;
  });
  if (alreadyCompletedToday) {
    return { alreadyCompleted: true, dayNumber: currentDaysCompleted, daysCompleted: currentDaysCompleted };
  }

  // 5. Record the new day completion (include completionDate for DB-level once-per-day index)
  const nextDay = currentDaysCompleted + 1;
  await db.insert(challengeDayCompletions).values({
    userId,
    challengeId,
    dayNumber: nextDay,
    completionDate: new Date(todayUTC), // Date object for drizzle date() column — enforced unique per user+challenge+date
    sourceType,
    sourceId,
  });

  // 6. Update the enrollment's daysCompleted counter to match actual completed day count
  await db.update(challengeEnrollments)
    .set({ daysCompleted: nextDay })
    .where(and(
      eq(challengeEnrollments.userId, userId),
      eq(challengeEnrollments.challengeId, challengeId)
    ));

  return { alreadyCompleted: false, dayNumber: nextDay, daysCompleted: nextDay };
}

/**
 * Returns the list of completed day numbers for a user in the challenge.
 */
export async function getChallengeDayCompletions(
  userId: number,
  challengeId = "7day-web3-challenge"
): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ dayNumber: challengeDayCompletions.dayNumber })
    .from(challengeDayCompletions)
    .where(and(
      eq(challengeDayCompletions.userId, userId),
      eq(challengeDayCompletions.challengeId, challengeId)
    ))
    .orderBy(challengeDayCompletions.dayNumber);
  return rows.map(r => r.dayNumber);
}

// ─── Announcements ────────────────────────────────────────────────────────────────
export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(desc(announcements.createdAt))
    .limit(10);
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isTestUser: users.isTestUser,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    username: userProfiles.username,
    avatarId: userProfiles.avatarId,
    xp: userProfiles.xp,
    level: userProfiles.level,
    currentStreak: userProfiles.currentStreak,
    challengeEnrolled: sql<number>`CASE WHEN EXISTS (SELECT 1 FROM challenge_enrollments ce WHERE ce.userId = ${users.id} AND ce.isActive = 1) THEN 1 ELSE 0 END`,
  }).from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Mask email and add row number for display
  return rows.map((row, idx) => {
    const maskedEmail = (() => {
      if (!row.email) return null;
      const [local, domain] = row.email.split("@");
      if (!domain) return null;
      const masked = local.length <= 2 ? "***" : local[0] + "***";
      return `${masked}@${domain}`;
    })();
    return {
      ...row,
      rowNumber: offset + idx + 1,
      maskedEmail,
      challengeEnrolled: Number(row.challengeEnrolled) === 1,
      // Keep email for full admin only — UI will decide whether to show it
    };
  });
}

export async function getXpConfig() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xpConfig);
}

export async function updateXpConfig(key: string, value: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(xpConfig).set({ value }).where(eq(xpConfig.key, key));
}

export async function getAllLessons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).orderBy(lessons.zoneId, lessons.order);
}

export async function upsertLesson(data: {
  id?: number;
  zoneId: number;
  title: string;
  slug: string;
  content: string;
  topic: "nws" | "staking" | "lite_node" | "founder_node" | "node_vault" | "treasury" | "wallet_safety" | "scam_protection";
  xpReward: number;
  order: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  if (data.id) {
    await db.update(lessons).set(data).where(eq(lessons.id, data.id));
  } else {
    await db.insert(lessons).values(data);
  }
}

export async function getAllQuizzes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).orderBy(quizzes.zoneId);
}

export async function getAllCampaigns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await getOrCreateProfile(userId);
  const badgeList = await getUserBadges(userId);
  const recentXp = await db.select().from(xpLogs)
    .where(eq(xpLogs.userId, userId))
    .orderBy(desc(xpLogs.createdAt))
    .limit(10);
  return { profile, badges: badgeList, recentXp };
}

// ─── Auth: email lookup, password reset (OTP) ──────────────────────────────────
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

/**
 * Store a bcrypt-hashed OTP for a password reset, invalidating any prior
 * outstanding codes for that user first.
 */
export async function createPasswordResetOtp(userId: number, tokenHash: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(passwordResetTokens)
    .set({ used: true })
    .where(and(eq(passwordResetTokens.userId, userId), eq(passwordResetTokens.used, false)));
  await db.insert(passwordResetTokens).values({ userId, tokenHash, expiresAt });
}

/** Latest unused, unexpired reset token for a user, or null. */
export async function getActivePasswordResetOtp(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.userId, userId),
      eq(passwordResetTokens.used, false),
      gte(passwordResetTokens.expiresAt, new Date()),
    ))
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function markPasswordResetOtpUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id));
}

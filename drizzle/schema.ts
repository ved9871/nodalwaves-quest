import {
  boolean,
  date,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "demo_admin"]).default("user").notNull(),
  // Local password login support (for demo admin and future email-auth users)
  passwordHash: varchar("passwordHash", { length: 256 }),
  // QA test user flag — excludes from campaign rewards, public leaderboard, analytics
  isTestUser: boolean("isTestUser").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── User Profiles ────────────────────────────────────────────────────────────
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  username: varchar("username", { length: 64 }),
  avatarId: varchar("avatarId", { length: 32 }).default("avatar1"),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastCheckIn: timestamp("lastCheckIn"),
  referralCode: varchar("referralCode", { length: 16 }).unique(),
  referredBy: int("referredBy"),
  totalReferrals: int("totalReferrals").default(0).notNull(),
  profileSetupDone: boolean("profileSetupDone").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Zones ────────────────────────────────────────────────────────────────────
export const zones = mysqlTable("zones", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  order: int("order").notNull(),
  requiredLevel: int("requiredLevel").default(1).notNull(),
  requiredXp: int("requiredXp").default(0).notNull(),
  icon: varchar("icon", { length: 64 }),
  color: varchar("color", { length: 32 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;

// ─── User Zone Unlocks ────────────────────────────────────────────────────────
export const userZoneUnlocks = mysqlTable("user_zone_unlocks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  zoneId: int("zoneId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  zoneId: int("zoneId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  content: text("content").notNull(),
  topic: mysqlEnum("topic", [
    "nws",
    "staking",
    "lite_node",
    "founder_node",
    "node_vault",
    "treasury",
    "wallet_safety",
    "scam_protection",
  ]).notNull(),
  xpReward: int("xpReward").default(50).notNull(),
  order: int("order").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;

// ─── User Lesson Progress ─────────────────────────────────────────────────────
export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
});

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId"),
  zoneId: int("zoneId"),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  timeLimitSeconds: int("timeLimitSeconds").default(60).notNull(),
  xpReward: int("xpReward").default(100).notNull(),
  passingScore: int("passingScore").default(70).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;

// ─── Quiz Questions ───────────────────────────────────────────────────────────
export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  question: text("question").notNull(),
  options: json("options").notNull(), // string[]
  correctIndex: int("correctIndex").notNull(),
  explanation: text("explanation"),
  order: int("order").default(0).notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;

// ─── User Quiz Attempts ───────────────────────────────────────────────────────
export const userQuizAttempts = mysqlTable("user_quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: int("quizId").notNull(),
  score: int("score").notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  timeTaken: int("timeTaken").default(0).notNull(),
  passed: boolean("passed").default(false).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

// ─── Badges ───────────────────────────────────────────────────────────────────
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  color: varchar("color", { length: 32 }).default("#FFD700"),
  criteria: json("criteria"), // { type: 'xp'|'level'|'streak'|'quiz'|'lesson'|'zone', value: number }
  xpBonus: int("xpBonus").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;

// ─── User Badges ──────────────────────────────────────────────────────────────
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

// ─── XP Logs ─────────────────────────────────────────────────────────────────
export const xpLogs = mysqlTable("xp_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  source: mysqlEnum("source", [
    "lesson",
    "quiz",
    "daily_checkin",
    "streak_bonus",
    "badge_bonus",
    "mini_game",
    "referral",
    "admin_grant",
  ]).notNull(),
  sourceId: int("sourceId"),
  description: varchar("description", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Daily Check-ins ──────────────────────────────────────────────────────────
export const dailyCheckIns = mysqlTable("daily_check_ins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  xpEarned: int("xpEarned").default(25).notNull(),
  streakDay: int("streakDay").default(1).notNull(),
});

// ─── Mini-Game Scores ─────────────────────────────────────────────────────────
export const miniGameScores = mysqlTable("mini_game_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameType: mysqlEnum("gameType", [
    "node_charge",
    "quiz_battle",
    "scam_detector",
  ]).notNull(),
  score: int("score").notNull(),
  xpEarned: int("xpEarned").default(0).notNull(),
  playedAt: timestamp("playedAt").defaultNow().notNull(),
});

// ─── Referrals ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  xpBonusGranted: boolean("xpBonusGranted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["info", "event", "warning", "campaign"]).default("info").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  ctaText: varchar("ctaText", { length: 128 }),
  ctaLink: varchar("ctaLink", { length: 512 }),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  rules: json("rules"), // { minXp, minLevel, minStreak, etc. }
  rewardDescription: text("rewardDescription"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Challenge Enrollments ──────────────────────────────────────────────────
export const challengeEnrollments = mysqlTable("challenge_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: varchar("challengeId", { length: 64 }).notNull().default("7day-web3-challenge"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  daysCompleted: int("daysCompleted").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type ChallengeEnrollment = typeof challengeEnrollments.$inferSelect;
export type InsertChallengeEnrollment = typeof challengeEnrollments.$inferInsert;

// ─── Challenge Day Completions ───────────────────────────────────────────────
// Tracks which specific days a user has completed in the 7-day challenge.
// Prevents duplicate increments from repeated quiz/lesson attempts.
export const challengeDayCompletions = mysqlTable("challenge_day_completions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: varchar("challengeId", { length: 64 }).notNull().default("7day-web3-challenge"),
  dayNumber: int("dayNumber").notNull(), // 1-7
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  // DB-level once-per-calendar-day enforcement: one row per user per UTC date
  completionDate: date("completionDate").notNull(),
  sourceType: mysqlEnum("sourceType", ["quiz", "lesson"]).notNull(),
  sourceId: int("sourceId").notNull(), // quizId or lessonId
}, (t) => ({
  // Prevent the same source (quiz/lesson) from counting twice for the same user+challenge
  uniqueSource: uniqueIndex("uq_challenge_day_source").on(t.userId, t.challengeId, t.sourceType, t.sourceId),
  // DB-level once-per-calendar-day: only one new day per UTC date per user
  uniqueDate: uniqueIndex("uq_challenge_day_date").on(t.userId, t.challengeId, t.completionDate),
}));

export type ChallengeDayCompletion = typeof challengeDayCompletions.$inferSelect;

// ─── XP Config ────────────────────────────────────────────────────────────────
export const xpConfig = mysqlTable("xp_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: int("value").notNull(),
  description: varchar("description", { length: 256 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Password Reset Tokens ────────────────────────────────────────────────────
// Stores hashed 6-digit OTP codes for email-based password reset.
// Tokens expire after 15 minutes and can only be used once.
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 256 }).notNull(), // bcrypt hash of the 6-digit OTP
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ─── Beta Feedback ────────────────────────────────────────────────────────────
// Stores bug reports and suggestions submitted by beta users from the dashboard.
export const betaFeedback = mysqlTable("beta_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  issueType: mysqlEnum("issueType", ["bug", "suggestion", "confusing_text", "mobile_issue", "game_issue"]).notNull(),
  pageOrSection: varchar("pageOrSection", { length: 128 }),
  message: text("message").notNull(),
  screenshotNote: text("screenshotNote"),
  deviceType: varchar("deviceType", { length: 64 }),
  browser: varchar("browser", { length: 64 }),
  status: mysqlEnum("status", ["new", "reviewed", "resolved", "dismissed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BetaFeedback = typeof betaFeedback.$inferSelect;

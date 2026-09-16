import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getOrCreateProfile, setupProfile, performCheckIn, getZones, getUserZoneUnlocks,
  getLessonsByZone, getLesson, completeLesson, getQuizWithQuestions, submitQuizAttempt,
  getAllBadges, getUserBadges, checkAndAwardBadges, getLeaderboard, saveMiniGameScore,
  getActiveAnnouncements, getAllUsers, getXpConfig, updateXpConfig, getAllLessons,
  upsertLesson, getAllQuizzes, getAllCampaigns, getAllAnnouncements, getUserStats,
  grantXP, levelForXp, xpForLevel, getDb, completeChallengeDay, getChallengeDayCompletions,
  getUserByEmail, setUserPassword, createPasswordResetOtp, getActivePasswordResetOtp, markPasswordResetOtpUsed,
} from "./db";
import {
  users, userProfiles, lessons, quizzes, quizQuestions, badges, userBadges,
  announcements, campaigns, xpConfig, referrals, challengeEnrollments,
  userLessonProgress, userQuizAttempts, miniGameScores, xpLogs, betaFeedback,
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ─── Admin guards ────────────────────────────────────────────────────────────
// Full admin only (role=admin): destructive operations, role changes, exports
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});
// Demo admin + full admin: read-only views + announcements CRUD
const demoAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "demo_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

    // ─── Auth ──────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // Local email+password login (for all users with passwordHash)
    localLogin: publicProcedure.input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const bcrypt = await import("bcryptjs");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      // If user exists but has no passwordHash, they signed up via social login
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "SOCIAL_LOGIN_ONLY",
        });
      }
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      // Create a JWT session token using the same mechanism as OAuth
      const { sdk } = await import("./_core/sdk");
      const { getSessionCookieOptions } = await import("./_core/cookies");
      const { ONE_YEAR_MS } = await import("@shared/const");
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "User",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      // Update lastSignedIn
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
      return { success: true, role: user.role };
    }),

    // Signup with email + password (creates new user account)
    signup: publicProcedure.input(z.object({
      email: z.string().email({ message: "INVALID_EMAIL" }),
      displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }).max(50),
      password: z.string().min(8, { message: "PASSWORD_TOO_SHORT" }),
      confirmPassword: z.string(),
    })).mutation(async ({ ctx, input }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Passwords do not match" });
      }
      const bcrypt = await import("bcryptjs");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check for duplicate email
      const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing) {
        // If existing user has no passwordHash, they used social login
        if (!existing.passwordHash) {
          throw new TRPCError({ code: "CONFLICT", message: "SOCIAL_LOGIN_ONLY" });
        }
        throw new TRPCError({ code: "CONFLICT", message: "EMAIL_TAKEN" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Generate a unique openId for email/password users
      const { randomUUID } = await import("crypto");
      const openId = `local_${randomUUID()}`;

      // Insert new user
      await db.insert(users).values({
        openId,
        name: input.displayName,
        email: input.email,
        loginMethod: "email",
        role: "user",
        passwordHash,
        lastSignedIn: new Date(),
      });

      // Fetch the newly created user
      const [newUser] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!newUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Create JWT session
      const { sdk } = await import("./_core/sdk");
      const { getSessionCookieOptions } = await import("./_core/cookies");
      const { ONE_YEAR_MS } = await import("@shared/const");
      const sessionToken = await sdk.createSessionToken(newUser.openId, {
        name: newUser.name || newUser.email || "User",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, role: newUser.role, userId: newUser.id };
    }),

    // Public auth capabilities for the client (which providers/flows are live)
    config: publicProcedure.query(async () => {
      const { isGoogleOAuthEnabled } = await import("./_core/googleOAuth");
      const { isEmailConfigured } = await import("./_core/email");
      return {
        googleEnabled: isGoogleOAuthEnabled(),
        // Reset always works end-to-end; without SMTP the code is logged server-side for beta.
        passwordResetEnabled: true,
        passwordResetEmailLive: isEmailConfigured(),
      };
    }),

    // ── Password reset (6-digit OTP) ──────────────────────────────────────
    // Step 1: request a code. Always returns a generic success (no account enumeration).
    requestPasswordReset: publicProcedure.input(z.object({
      email: z.string().email(),
    })).mutation(async ({ input }) => {
      const generic = { success: true } as const;
      const user = await getUserByEmail(input.email);
      // Only email/password accounts can reset a password.
      if (!user || !user.passwordHash) return generic;

      const bcrypt = await import("bcryptjs");
      const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
      const tokenHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await createPasswordResetOtp(user.id, tokenHash, expiresAt);

      const { sendEmail, brandedEmail } = await import("./_core/email");
      await sendEmail({
        to: input.email,
        subject: "Your NodalWaves Quest password reset code",
        html: brandedEmail({
          heading: "Reset your password",
          body: `<p>Use this code to reset your NodalWaves Quest password. It expires in 15 minutes.</p>`
            + `<p style="font-size:30px;font-weight:700;letter-spacing:6px;color:#ffffff;margin:18px 0">${code}</p>`
            + `<p>If you didn't request this, you can ignore this email — your password stays the same.</p>`,
        }),
      });
      return generic;
    }),

    // Step 2: submit the code + a new password.
    resetPassword: publicProcedure.input(z.object({
      email: z.string().email(),
      code: z.string().length(6),
      newPassword: z.string().min(8, { message: "PASSWORD_TOO_SHORT" }),
    })).mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_CODE" });
      }
      const record = await getActivePasswordResetOtp(user.id);
      if (!record) throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_CODE" });

      const bcrypt = await import("bcryptjs");
      const ok = await bcrypt.compare(input.code, record.tokenHash);
      if (!ok) throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_CODE" });

      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await setUserPassword(user.id, passwordHash);
      await markPasswordResetOtpUsed(record.id);
      return { success: true } as const;
    }),
  }),

  // ─── Profile ─────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getOrCreateProfile(ctx.user.id);
    }),

    setup: protectedProcedure.input(z.object({
      username: z.string().min(3).max(32),
      avatarId: z.string(),
      referralCode: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      return setupProfile(ctx.user.id, input.username, input.avatarId, input.referralCode);
    }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return getUserStats(ctx.user.id);
    }),

    xpLogs: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const { xpLogs } = await import("../drizzle/schema");
      return db.select().from(xpLogs).where(eq(xpLogs.userId, ctx.user.id)).orderBy(xpLogs.createdAt).limit(20);
    }),
    updateUsername: protectedProcedure.input(z.object({ username: z.string().min(3).max(30) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { userProfiles } = await import("../drizzle/schema");
      await db.update(userProfiles).set({ username: input.username }).where(eq(userProfiles.userId, ctx.user.id));
      return { success: true };
    }),
    xpInfo: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getOrCreateProfile(ctx.user.id);
      if (!profile) return null;
      const currentLevelXp = xpForLevel(profile.level ?? 1);
      const nextLevelXp = xpForLevel((profile.level ?? 1) + 1);
      const progressXp = (profile.xp ?? 0) - currentLevelXp;
      const neededXp = nextLevelXp - currentLevelXp;
      return {
        ...profile,
        currentLevelXp,
        nextLevelXp,
        progressXp: Math.max(0, progressXp),
        neededXp,
        progressPercent: Math.min(100, Math.round((Math.max(0, progressXp) / neededXp) * 100)),
      };
    }),
  }),

  // ─── Check-in ────────────────────────────────────────────────────────────
  checkin: router({
    perform: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await performCheckIn(ctx.user.id);
      const newBadges = await checkAndAwardBadges(ctx.user.id);
      return { ...result, newBadges };
    }),

    status: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getOrCreateProfile(ctx.user.id);
      if (!profile) return { canCheckIn: true, streak: 0 };
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let canCheckIn = true;
      if (profile.lastCheckIn) {
        const lastDate = new Date(profile.lastCheckIn);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        canCheckIn = lastDay.getTime() < today.getTime();
      }
      return { canCheckIn, streak: profile.currentStreak ?? 0, lastCheckIn: profile.lastCheckIn };
    }),
  }),

  // ─── Zones ───────────────────────────────────────────────────────────────
  zones: router({
    list: publicProcedure.query(async () => getZones()),

    userUnlocks: protectedProcedure.query(async ({ ctx }) => {
      return getUserZoneUnlocks(ctx.user.id);
    }),
  }),

  // ─── Lessons ─────────────────────────────────────────────────────────────
  lessons: router({
    byZone: protectedProcedure.input(z.object({ zoneId: z.number() })).query(async ({ input }) => {
      return getLessonsByZone(input.zoneId);
    }),

    get: protectedProcedure.input(z.object({ lessonId: z.number() })).query(async ({ input }) => {
      return getLesson(input.lessonId);
    }),

    complete: protectedProcedure.input(z.object({ lessonId: z.number() })).mutation(async ({ ctx, input }) => {
      const result = await completeLesson(ctx.user.id, input.lessonId);
      const newBadges = await checkAndAwardBadges(ctx.user.id);
      // Auto-advance challenge day progress if user is enrolled
      const challengeProgress = await completeChallengeDay(ctx.user.id, "lesson", input.lessonId);
      return { ...result, newBadges, challengeProgress };
    }),

    userProgress: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const { userLessonProgress } = await import("../drizzle/schema");
      return db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, ctx.user.id));
    }),
  }),

  // ─── Quizzes ─────────────────────────────────────────────────────────────
  quizzes: router({
    get: protectedProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => {
      const quiz = await getQuizWithQuestions(input.quizId);
      if (!quiz) return null;
      // Strip correct answers from client response
      return {
        ...quiz,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          order: q.order,
        })),
      };
    }),

    submit: protectedProcedure.input(z.object({
      quizId: z.number(),
      answers: z.array(z.number()),
      timeTaken: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const result = await submitQuizAttempt(ctx.user.id, input.quizId, input.answers, input.timeTaken);
      const newBadges = await checkAndAwardBadges(ctx.user.id);
      // Auto-advance challenge day progress if user is enrolled (only on passing attempts)
      let challengeProgress = { alreadyCompleted: false, dayNumber: 0, daysCompleted: 0 };
      if (result.passed) {
        challengeProgress = await completeChallengeDay(ctx.user.id, "quiz", input.quizId);
      }
      return { ...result, newBadges, challengeProgress };
    }),

    byZone: publicProcedure.input(z.object({ zoneId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(quizzes).where(eq(quizzes.zoneId, input.zoneId));
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const { userQuizAttempts } = await import("../drizzle/schema");
      return db.select().from(userQuizAttempts)
        .where(eq(userQuizAttempts.userId, ctx.user.id))
        .orderBy(userQuizAttempts.completedAt)
        .limit(50);
    }),
  }),

  // ─── Badges ──────────────────────────────────────────────────────────────
  badges: router({
    all: publicProcedure.query(async () => getAllBadges()),
    mine: protectedProcedure.query(async ({ ctx }) => getUserBadges(ctx.user.id)),
  }),

  // ─── Leaderboard ─────────────────────────────────────────────────────────
  leaderboard: router({
    top: publicProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ input }) => {
      return getLeaderboard(input.limit ?? 50);
    }),

    myRank: protectedProcedure.query(async ({ ctx }) => {
      const board = await getLeaderboard(1000);
      const rank = board.findIndex(e => e.userId === ctx.user.id) + 1;
      return { rank: rank > 0 ? rank : null, total: board.length };
    }),
  }),

  // ─── Mini-Games ──────────────────────────────────────────────────────────
  miniGames: router({
    saveScore: protectedProcedure.input(z.object({
      gameType: z.enum(["node_charge", "quiz_battle", "scam_detector"]),
      score: z.number(),
      xpEarned: z.number(),
    })).mutation(async ({ ctx, input }) => {
      const result = await saveMiniGameScore(ctx.user.id, input.gameType, input.score, input.xpEarned);
      const newBadges = await checkAndAwardBadges(ctx.user.id);
      return { ...result, newBadges };
    }),
  }),

  // ─── Announcements ───────────────────────────────────────────────────────
  announcements: router({
    active: publicProcedure.query(async () => getActiveAnnouncements()),
  }),

  // ─── Referrals ───────────────────────────────────────────────────────────
  referral: router({
    myCode: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getOrCreateProfile(ctx.user.id);
      return { code: profile?.referralCode ?? null };
    }),
  }),

  // ─── Admin ───────────────────────────────────────────────────────────────
  admin: router({
    // Users (read-only for demo_admin)
    users: demoAdminProcedure.input(z.object({ limit: z.number().optional(), offset: z.number().optional() })).query(async ({ input }) => {
      return getAllUsers(input.limit ?? 100, input.offset ?? 0);
    }),

    updateUserRole: adminProcedure.input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

    grantXp: adminProcedure.input(z.object({
      userId: z.number(),
      amount: z.number(),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      return grantXP(input.userId, input.amount, "admin_grant", undefined, input.description);
    }),

    // Lessons (read-only for demo_admin)
    lessons: demoAdminProcedure.query(async () => getAllLessons()),

    upsertLesson: adminProcedure.input(z.object({
      id: z.number().optional(),
      zoneId: z.number(),
      title: z.string(),
      slug: z.string(),
      content: z.string(),
      topic: z.enum(["nws", "staking", "lite_node", "founder_node", "node_vault", "treasury", "wallet_safety", "scam_protection"]),
      xpReward: z.number(),
      order: z.number(),
    })).mutation(async ({ input }) => {
      await upsertLesson(input);
      return { success: true };
    }),

    deleteLesson: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(lessons).set({ isActive: false }).where(eq(lessons.id, input.id));
      return { success: true };
    }),

    // Quizzes (read-only for demo_admin)
    quizzes: demoAdminProcedure.query(async () => getAllQuizzes()),

    upsertQuiz: adminProcedure.input(z.object({
      id: z.number().optional(),
      zoneId: z.number().optional(),
      lessonId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      timeLimitSeconds: z.number(),
      xpReward: z.number(),
      passingScore: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(quizzes).set(input).where(eq(quizzes.id, input.id));
      } else {
        await db.insert(quizzes).values(input);
      }
      return { success: true };
    }),

    upsertQuestion: adminProcedure.input(z.object({
      id: z.number().optional(),
      quizId: z.number(),
      question: z.string(),
      options: z.array(z.string()),
      correctIndex: z.number(),
      explanation: z.string().optional(),
      order: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(quizQuestions).set({ ...input, options: input.options }).where(eq(quizQuestions.id, input.id));
      } else {
        await db.insert(quizQuestions).values({ ...input, options: input.options });
      }
      return { success: true };
    }),

    getQuizWithQuestions: demoAdminProcedure.input(z.object({ quizId: z.number() })).query(async ({ input }) => {
      return getQuizWithQuestions(input.quizId);
    }),

    // XP Config (read-only for demo_admin)
    xpConfig: demoAdminProcedure.query(async () => getXpConfig()),

    updateXpConfig: adminProcedure.input(z.object({
      key: z.string(),
      value: z.number(),
    })).mutation(async ({ input }) => {
      await updateXpConfig(input.key, input.value);
      return { success: true };
    }),

    // Badges (read-only for demo_admin)
    badges: demoAdminProcedure.query(async () => getAllBadges()),

    upsertBadge: adminProcedure.input(z.object({
      id: z.number().optional(),
      slug: z.string(),
      name: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      criteria: z.any().optional(),
      xpBonus: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(badges).set(input).where(eq(badges.id, input.id));
      } else {
        await db.insert(badges).values(input);
      }
      return { success: true };
    }),

    // Announcements (CRUD allowed for demo_admin)
    announcements: demoAdminProcedure.query(async () => getAllAnnouncements()),

    upsertAnnouncement: demoAdminProcedure.input(z.object({
      id: z.number().optional(),
      title: z.string(),
      content: z.string(),
      type: z.enum(["info", "event", "warning", "campaign"]),
      isActive: z.boolean(),
      ctaText: z.string().optional(),
      ctaLink: z.string().optional(),
      expiresAt: z.date().optional(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(announcements).set(input).where(eq(announcements.id, input.id));
      } else {
        await db.insert(announcements).values(input);
      }
      return { success: true };
    }),

    // Campaigns (read-only for demo_admin)
    campaigns: demoAdminProcedure.query(async () => getAllCampaigns()),

    upsertCampaign: adminProcedure.input(z.object({
      id: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      rules: z.any().optional(),
      rewardDescription: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      isActive: z.boolean(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(campaigns).set(input).where(eq(campaigns.id, input.id));
      } else {
        await db.insert(campaigns).values(input);
      }
      return { success: true };
    }),

    // Leaderboard (read-only for demo_admin)
    leaderboard: demoAdminProcedure.query(async () => getLeaderboard(100)),
    resetLeaderboard: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(userProfiles).set({ xp: 0, level: 1 });
      return { success: true };
    }),
    // Ban / unban user (sets a banned flag via role or deletion)
    banUser: adminProcedure.input(z.object({ userId: z.number(), ban: z.boolean() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Mark banned users with a special role value stored in users table
      await db.update(users).set({ role: input.ban ? ("banned" as any) : "user" }).where(eq(users.id, input.userId));
      return { success: true };
    }),
    // Referrals (read-only for demo_admin)
    referrals: demoAdminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(referrals).orderBy(referrals.createdAt).limit(200);
    }),
    // Delete announcement (allowed for demo_admin)
    deleteAnnouncement: demoAdminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(announcements).where(eq(announcements.id, input.id));
      return { success: true };
    }),
    // Stats overview (read-only for demo_admin)
    stats: demoAdminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;
      const { getBetaAnalytics } = await import("./betaAnalyticsHelper");

      // ── Content counts (not in shared helper) ─────────────────────────────
      const [{ adminUsers }] = await db.select({ adminUsers: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "admin"));
      const [{ normalUsers }] = await db.select({ normalUsers: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "user"));
      const [{ totalLessons }] = await db.select({ totalLessons: sql<number>`COUNT(*)` }).from(lessons);
      const [{ totalQuizzes }] = await db.select({ totalQuizzes: sql<number>`COUNT(*)` }).from(quizzes);

      const analytics = await getBetaAnalytics(db, { includeFeedbackCount: true });

      // Convenience aliases for Overview cards that still use flat field names
      const funnelMap = Object.fromEntries(analytics.funnel.map(s => [s.label, s]));
      return {
        // Core
        totalUsers: analytics.totalUsers ?? 0,
        adminUsers: Number(adminUsers),
        normalUsers: Number(normalUsers),
        todayUsers: analytics.todayUsers ?? 0,
        // Content
        totalLessons: Number(totalLessons),
        totalQuizzes: Number(totalQuizzes),
        // Activity Totals — Total Events
        totalLessonsCompleted: analytics.activityTotals.totalLessonsCompleted ?? 0,
        totalQuizAttempts: analytics.activityTotals.totalQuizAttempts ?? 0,
        totalBadgesAwarded: analytics.activityTotals.totalBadgesAwarded ?? 0,
        totalMiniGamePlays: analytics.activityTotals.totalMiniGamePlays ?? 0,
        // Today
        xpEarnedToday: analytics.xpEarnedToday ?? 0,
        activeUsersToday: funnelMap["Active Today"]?.count ?? 0,
        // Engagement depth
        usersWithZeroXp: analytics.usersWithZeroXp ?? 0,
        usersWithStreak3Plus: analytics.usersWithStreak3Plus ?? 0,
        newFeedbackCount: analytics.newFeedbackCount ?? 0,
        // Conversion Funnel — Unique Users (new structured format)
        funnel: analytics.funnel,
        activityTotals: analytics.activityTotals,
        // Legacy flat fields for existing Overview cards
        challengeEnrolled: funnelMap["Challenge Joined"]?.count ?? 0,
        usersWithLesson: funnelMap["Completed ≥1 Lesson"]?.count ?? 0,
        usersWithQuiz: funnelMap["Attempted ≥1 Quiz"]?.count ?? 0,
        usersWithMiniGame: funnelMap["Played ≥1 Mini-Game"]?.count ?? 0,
        funnelChallengeRate: funnelMap["Challenge Joined"]?.pctOfRegistered ?? 0,
        funnelLessonRate: funnelMap["Completed ≥1 Lesson"]?.pctOfRegistered ?? 0,
        funnelQuizRate: funnelMap["Attempted ≥1 Quiz"]?.pctOfRegistered ?? 0,
        funnelMiniGameRate: funnelMap["Played ≥1 Mini-Game"]?.pctOfRegistered ?? 0,
      };
    }),
    // Beta funnel analytics (admin-only)
    betaAnalytics: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;
      const { getBetaAnalytics } = await import("./betaAnalyticsHelper");
      const analytics = await getBetaAnalytics(db);
      const funnelMap = Object.fromEntries(analytics.funnel.map(s => [s.label, s]));
      return {
        // Core
        totalUsers: analytics.totalUsers ?? 0,
        todayUsers: analytics.todayUsers ?? 0,
        // Activity Totals — Total Events
        totalLessonsCompleted: analytics.activityTotals.totalLessonsCompleted ?? 0,
        totalQuizAttempts: analytics.activityTotals.totalQuizAttempts ?? 0,
        totalMiniGamePlays: analytics.activityTotals.totalMiniGamePlays ?? 0,
        totalBadgesAwarded: analytics.activityTotals.totalBadgesAwarded ?? 0,
        totalXpEarned: analytics.activityTotals.totalXpEarned ?? 0,
        // Today
        xpEarnedToday: analytics.xpEarnedToday ?? 0,
        activeUsersToday: funnelMap["Active Today"]?.count ?? 0,
        // Engagement depth
        usersWithZeroXp: analytics.usersWithZeroXp ?? 0,
        usersWithStreak3Plus: analytics.usersWithStreak3Plus ?? 0,
        // Conversion Funnel — Unique Users (structured)
        funnel: analytics.funnel,
        activityTotals: analytics.activityTotals,
        // Legacy flat fields
        challengeEnrolled: funnelMap["Challenge Joined"]?.count ?? 0,
        usersWithLesson: funnelMap["Completed ≥1 Lesson"]?.count ?? 0,
        usersWithQuiz: funnelMap["Attempted ≥1 Quiz"]?.count ?? 0,
        usersWithMiniGame: funnelMap["Played ≥1 Mini-Game"]?.count ?? 0,
        funnelChallengeRate: funnelMap["Challenge Joined"]?.pctOfRegistered ?? 0,
        funnelLessonRate: funnelMap["Completed ≥1 Lesson"]?.pctOfRegistered ?? 0,
        funnelQuizRate: funnelMap["Attempted ≥1 Quiz"]?.pctOfRegistered ?? 0,
        funnelMiniGameRate: funnelMap["Played ≥1 Mini-Game"]?.pctOfRegistered ?? 0,
      };
    }),
    // Last 7 days daily active users (admin-only)
    dailyActiveUsers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      // Build 7 days of data by querying each activity table grouped by date
      const days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const dateStr = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        try {
          const [a, b, c, d, e] = await Promise.all([
            db.selectDistinct({ userId: xpLogs.userId }).from(xpLogs).where(sql`DATE(${xpLogs.createdAt}) = ${dateStr}`),
            db.selectDistinct({ userId: userLessonProgress.userId }).from(userLessonProgress).where(sql`DATE(${userLessonProgress.completedAt}) = ${dateStr}`),
            db.selectDistinct({ userId: userQuizAttempts.userId }).from(userQuizAttempts).where(sql`DATE(${userQuizAttempts.completedAt}) = ${dateStr}`),
            db.selectDistinct({ userId: miniGameScores.userId }).from(miniGameScores).where(sql`DATE(${miniGameScores.playedAt}) = ${dateStr}`),
            db.selectDistinct({ userId: challengeEnrollments.userId }).from(challengeEnrollments).where(sql`DATE(${challengeEnrollments.enrolledAt}) = ${dateStr}`),
          ]);
          const unique = new Set([...a, ...b, ...c, ...d, ...e].map(r => r.userId));
          days.push({ date: dateStr, count: unique.size });
        } catch {
          days.push({ date: dateStr, count: 0 });
        }
      }
      return days;
    }),

    // QA Test User Management (admin-only)
    createQATestUser: adminProcedure.mutation(async () => {
      const bcrypt = await import("bcryptjs");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Generate unique test email and temporary password
      const timestamp = Date.now();
      const testEmail = `qa-tester-${timestamp}@nodewavesquest.test`;
      const tempPassword = `QATest${timestamp}!`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create test user with isTestUser flag
      const result = await db.insert(users).values({
        openId: `qa-test-${timestamp}`,
        name: "Quest QA Tester",
        email: testEmail,
        loginMethod: "local",
        role: "user",
        passwordHash: hashedPassword,
        isTestUser: true,
      });

      // Create profile for test user
      const userId = (result as any).insertId as number;
      await db.insert(userProfiles).values({
        userId,
        username: `QA Tester ${timestamp}`,
        avatarId: "avatar1",
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        profileSetupDone: true,
      });

      return {
        success: true,
        userId,
        email: testEmail,
        password: tempPassword,
        note: "This is a temporary password. User must login via normal auth flow at /login",
      };
    }),

    deleteQATestUser: adminProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify user is a test user before deleting
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (!user.isTestUser) throw new TRPCError({ code: "FORBIDDEN", message: "Can only delete test users" });

      // Delete related data (cascade)
      await Promise.all([
        db.delete(userProfiles).where(eq(userProfiles.userId, input.userId)),
        db.delete(xpLogs).where(eq(xpLogs.userId, input.userId)),
        db.delete(userBadges).where(eq(userBadges.userId, input.userId)),
        db.delete(userLessonProgress).where(eq(userLessonProgress.userId, input.userId)),
        db.delete(userQuizAttempts).where(eq(userQuizAttempts.userId, input.userId)),
        db.delete(miniGameScores).where(eq(miniGameScores.userId, input.userId)),
        db.delete(challengeEnrollments).where(eq(challengeEnrollments.userId, input.userId)),
        db.delete(users).where(eq(users.id, input.userId)),
      ]);

      return { success: true };
    }),

    listQATestUsers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const testUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(eq(users.isTestUser, true))
        .orderBy(desc(users.createdAt));

      return testUsers;
    }),

    // Admin badge resync: recalculate and award any missing badges for a user
    resyncUserBadges: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        // Verify user exists
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const [user] = await db.select({ id: users.id, name: users.name })
          .from(users).where(eq(users.id, input.userId)).limit(1);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const newBadges = await checkAndAwardBadges(input.userId);
        return {
          success: true,
          userId: input.userId,
          userName: user.name,
          newBadgesAwarded: newBadges.length,
          badges: newBadges.map(b => ({ id: b.id, name: b.name })),
        };
      }),

    // Admin badge resync all: recalculate badges for all users (use with caution)
    resyncAllBadges: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const allUsers = await db.select({ id: users.id }).from(users)
        .where(eq(users.isTestUser, false));

      let totalAwarded = 0;
      const results: { userId: number; count: number }[] = [];

      for (const u of allUsers) {
        try {
          const newBadges = await checkAndAwardBadges(u.id);
          if (newBadges.length > 0) {
            totalAwarded += newBadges.length;
            results.push({ userId: u.id, count: newBadges.length });
          }
        } catch {
          // Skip individual failures
        }
      }

      return {
        success: true,
        usersProcessed: allUsers.length,
        totalBadgesAwarded: totalAwarded,
        usersWithNewBadges: results,
      };
    }),
  }),
  // ─── Challenge ──────────────────────────────────────────────────────────
  challenge: router({
    // Check if current user is enrolled
    getEnrollment: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(challengeEnrollments)
        .where(and(eq(challengeEnrollments.userId, ctx.user.id), eq(challengeEnrollments.challengeId, "7day-web3-challenge")))
        .limit(1);
      return result[0] ?? null;
    }),

    // Get completed day numbers for the current user
    getDayCompletions: protectedProcedure.query(async ({ ctx }) => {
      return getChallengeDayCompletions(ctx.user.id);
    }),

    // Enroll in the challenge
    enroll: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Check if already enrolled
      const existing = await db
        .select()
        .from(challengeEnrollments)
        .where(and(eq(challengeEnrollments.userId, ctx.user.id), eq(challengeEnrollments.challengeId, "7day-web3-challenge")))
        .limit(1);
      if (existing[0]) return { alreadyEnrolled: true, enrollment: existing[0] };
      await db.insert(challengeEnrollments).values({
        userId: ctx.user.id,
        challengeId: "7day-web3-challenge",
        daysCompleted: 0,
        isActive: true,
      });
      return { alreadyEnrolled: false, enrollment: null };
    }),

    // Challenge leaderboard — all 4 categories, filtered to enrolled users
    leaderboard: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { topXp: [], bestAccuracy: [], longestStreak: [], communityEducator: [] };
      // Get enrolled user IDs
      const enrolled = await db
        .select({ userId: challengeEnrollments.userId })
        .from(challengeEnrollments)
        .where(eq(challengeEnrollments.challengeId, "7day-web3-challenge"));
      if (enrolled.length === 0) return { topXp: [], bestAccuracy: [], longestStreak: [], communityEducator: [] };
      const enrolledIds = enrolled.map((e) => e.userId);

      // Get all enrolled profiles
      const profiles = await db
        .select({
          userId: userProfiles.userId,
          username: userProfiles.username,
          avatarId: userProfiles.avatarId,
          level: userProfiles.level,
          xp: userProfiles.xp,
          currentStreak: userProfiles.currentStreak,
          longestStreak: userProfiles.longestStreak,
          totalReferrals: userProfiles.totalReferrals,
        })
        .from(userProfiles)
        .limit(200);
      const enrolledProfiles = profiles.filter((p) => enrolledIds.includes(p.userId));

      // Top XP
      const topXp = [...enrolledProfiles].sort((a, b) => b.xp - a.xp).slice(0, 5);

      // Best Quiz Accuracy: get quiz attempts for enrolled users
      const { userQuizAttempts } = await import("../drizzle/schema");
      const attempts = await db
        .select({
          userId: userQuizAttempts.userId,
          score: userQuizAttempts.score,
        })
        .from(userQuizAttempts)
        .limit(1000);
      const enrolledAttempts = attempts.filter((a) => enrolledIds.includes(a.userId));
      // Compute average accuracy per user
      const accuracyMap: Record<number, { total: number; count: number }> = {};
      for (const a of enrolledAttempts) {
        if (!accuracyMap[a.userId]) accuracyMap[a.userId] = { total: 0, count: 0 };
        accuracyMap[a.userId].total += a.score ?? 0;
        accuracyMap[a.userId].count += 1;
      }
      const bestAccuracy = enrolledProfiles
        .filter((p) => accuracyMap[p.userId]?.count > 0)
        .map((p) => ({
          ...p,
          avgScore: Math.round((accuracyMap[p.userId]?.total ?? 0) / (accuracyMap[p.userId]?.count ?? 1)),
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5);

      // Longest Streak
      const longestStreak = [...enrolledProfiles].sort((a, b) => b.longestStreak - a.longestStreak).slice(0, 5);

      // Community Educator (most referrals)
      const communityEducator = [...enrolledProfiles].sort((a, b) => b.totalReferrals - a.totalReferrals).slice(0, 5);

      return { topXp, bestAccuracy, longestStreak, communityEducator };
    }),
  }),

  // ── Temporary Beta Review (public, token-gated) ───────────────────────────────────────
  // IMPORTANT: Disable this router before public launch.
  review: router({
    data: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const { ENV } = await import("./_core/env");
      const expectedToken = ENV.adminReviewToken;
      if (!expectedToken || input.token !== expectedToken) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      }
      // Expiry check
      if (ENV.adminReviewExpires) {
        const today = new Date().toISOString().slice(0, 10);
        if (today > ENV.adminReviewExpires) {
          throw new TRPCError({ code: "FORBIDDEN", message: `Access Denied: This review page expired on ${ENV.adminReviewExpires}.` });
        }
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { getBetaAnalytics } = await import("./betaAnalyticsHelper");
      const analytics = await getBetaAnalytics(db);
      const funnelMap = Object.fromEntries(analytics.funnel.map(s => [s.label, s]));

      // Role breakdown (not in shared helper)
      const [normalUsers, adminUsersCount, demoAdminCount] = await Promise.all([
        db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "user")).then(([r]) => Number(r.v)).catch(() => null),
        db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "admin")).then(([r]) => Number(r.v)).catch(() => null),
        db.select({ v: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, "demo_admin")).then(([r]) => Number(r.v)).catch(() => null),
      ]);

      // Wrap funnel steps as { label, value, ok } for AdminReview positional UI
      const toMetric = (label: string, value: number | null) => ({ label, value, ok: value !== null });
      const funnelMetrics = analytics.funnel.map(s => toMetric(s.label, s.count));

      // ── Latest 20 users (masked email, no private data) — with timeout ────
      const maskEmail = (email: string | null): string => {
        if (!email) return "***@***.***";
        const [local, domain] = email.split("@");
        if (!domain) return "***";
        const masked = local.length <= 2 ? "***" : local[0] + "***";
        return `${masked}@${domain}`;
      };

      const QUERY_TIMEOUT_MS = 5000;
      let recentUsers: object[] = [];
      try {
        const recentUsersRaw = await Promise.race([
          db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
            .from(users).orderBy(desc(users.createdAt)).limit(20),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), QUERY_TIMEOUT_MS)),
        ]);

        const enrolledUserIds = new Set(
          (await db.select({ userId: challengeEnrollments.userId }).from(challengeEnrollments)).map((r) => r.userId)
        );

        const profileMap = new Map(
          (await db.select({ userId: userProfiles.userId, xp: userProfiles.xp, level: userProfiles.level })
            .from(userProfiles)
            .where(sql`${userProfiles.userId} IN (${sql.join(recentUsersRaw.map((u) => sql`${u.id}`), sql`, `)})`)
          ).map((p) => [p.userId, p])
        );

        recentUsers = recentUsersRaw.map((u) => {
          const profile = profileMap.get(u.id);
          return {
            displayName: u.name ?? "(no name)",
            maskedEmail: maskEmail(u.email),
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
            xp: profile?.xp ?? 0,
            level: profile?.level ?? 1,
            challengeEnrolled: enrolledUserIds.has(u.id),
          };
        });
      } catch {
        recentUsers = [];
      }

      return {
        generatedAt: new Date().toISOString(),
        expiresOn: ENV.adminReviewExpires || null,
        // ── Conversion Funnel — Unique Users ──────────────────────────────────
        funnel: analytics.funnel,
        // ── Activity Totals — Total Events ────────────────────────────────────
        activityTotals: analytics.activityTotals,
        // ── Supporting metrics ─────────────────────────────────────────────
        supporting: [
          { label: "Total Registered Users", value: analytics.totalUsers, ok: analytics.totalUsers !== null },
          { label: "Registered Today", value: analytics.todayUsers, ok: analytics.todayUsers !== null },
          { label: "Normal Users", value: normalUsers, ok: normalUsers !== null },
          { label: "Admin Users", value: adminUsersCount, ok: adminUsersCount !== null },
          { label: "Demo Admin Users", value: demoAdminCount, ok: demoAdminCount !== null },
          { label: "XP Earned Today", value: analytics.xpEarnedToday, ok: analytics.xpEarnedToday !== null },
          { label: "Users with Streak ≥3 Days", value: analytics.usersWithStreak3Plus, ok: analytics.usersWithStreak3Plus !== null },
          { label: "Users with 0 XP", value: analytics.usersWithZeroXp, ok: analytics.usersWithZeroXp !== null },
        ],
        // ── Legacy positional metrics array (kept for backward compat) ────────
        metrics: funnelMetrics,
        recentUsers,
      };
    }),
  }),

  // ── Beta Feedback ─────────────────────────────────────────────────────────────────────────────
  feedback: router({
    submit: protectedProcedure
      .input(z.object({
        issueType: z.enum(["bug", "suggestion", "confusing_text", "mobile_issue", "game_issue"]),
        pageOrSection: z.string().max(128).optional(),
        message: z.string().min(5).max(2000),
        screenshotNote: z.string().max(500).optional(),
        deviceType: z.string().max(64).optional(),
        browser: z.string().max(64).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await db.insert(betaFeedback).values({
          userId: ctx.user.id,
          issueType: input.issueType,
          pageOrSection: input.pageOrSection ?? null,
          message: input.message,
          screenshotNote: input.screenshotNote ?? null,
          deviceType: input.deviceType ?? null,
          browser: input.browser ?? null,
          status: "new",
        });
        return { success: true };
      }),

    list: demoAdminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        status: z.enum(["new", "reviewed", "resolved", "dismissed", "all"]).default("all"),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const PAGE_SIZE = 20;
        const offset = (input.page - 1) * PAGE_SIZE;
        const whereClause = input.status !== "all" ? eq(betaFeedback.status, input.status as "new" | "reviewed" | "resolved" | "dismissed") : undefined;
        const rows = await db
          .select({
            id: betaFeedback.id,
            userId: betaFeedback.userId,
            issueType: betaFeedback.issueType,
            pageOrSection: betaFeedback.pageOrSection,
            message: betaFeedback.message,
            screenshotNote: betaFeedback.screenshotNote,
            deviceType: betaFeedback.deviceType,
            browser: betaFeedback.browser,
            status: betaFeedback.status,
            createdAt: betaFeedback.createdAt,
            userName: users.name,
          })
          .from(betaFeedback)
          .leftJoin(users, eq(betaFeedback.userId, users.id))
          .where(whereClause)
          .orderBy(desc(betaFeedback.createdAt))
          .limit(PAGE_SIZE)
          .offset(offset);
        const [countRow] = await db
          .select({ total: sql<number>`COUNT(*)` })
          .from(betaFeedback)
          .where(whereClause);
        return { rows, total: Number(countRow?.total ?? 0), page: input.page, pageSize: PAGE_SIZE };
      }),

    updateStatus: demoAdminProcedure
      .input(z.object({
        id: z.number().int(),
        status: z.enum(["new", "reviewed", "resolved", "dismissed"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await db.update(betaFeedback).set({ status: input.status }).where(eq(betaFeedback.id, input.id));
        return { success: true };
      }),
    summary: demoAdminProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const rows = await db
          .select({ issueType: betaFeedback.issueType, count: sql<number>`COUNT(*)` })
          .from(betaFeedback)
          .groupBy(betaFeedback.issueType);
        const [{ totalNew }] = await db
          .select({ totalNew: sql<number>`COUNT(*)` })
          .from(betaFeedback)
          .where(eq(betaFeedback.status, 'new'));
        const byType: Record<string, number> = {};
        for (const r of rows) byType[r.issueType] = Number(r.count);
        return {
          byType,
          totalNew: Number(totalNew),
          total: rows.reduce((s, r) => s + Number(r.count), 0),
        };
      }),
    markAllReviewed: demoAdminProcedure
      .mutation(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const result = await db
          .update(betaFeedback)
          .set({ status: 'reviewed' })
          .where(eq(betaFeedback.status, 'new'));
        return { success: true, updated: (result as any).affectedRows ?? 0 };
      }),
  }),
});
export type AppRouter = typeof appRouter;

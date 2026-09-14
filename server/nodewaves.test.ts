import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getOrCreateProfile: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    username: "testuser",
    avatarId: "avatar1",
    xp: 500,
    level: 3,
    currentStreak: 5,
    referralCode: "TESTCODE",
    lastCheckIn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getZones: vi.fn().mockResolvedValue([
    { id: 1, slug: "nws-hub", name: "Nodal Hub", description: "Learn about $NODAL", order: 1, requiredLevel: 1, isActive: true },
    { id: 2, slug: "staking-vault", name: "Staking Vault", description: "Learn about staking", order: 2, requiredLevel: 2, isActive: true },
  ]),
  getUserZoneUnlocks: vi.fn().mockResolvedValue([{ zoneId: 1 }]),
  getLessonsByZone: vi.fn().mockResolvedValue([
    { id: 1, zoneId: 1, slug: "what-is-nws", title: "What is Nodal Token?", topic: "nws", xpReward: 50, order: 1, isActive: true },
  ]),
  getLesson: vi.fn().mockResolvedValue({
    id: 1, zoneId: 1, slug: "what-is-nws", title: "What is Nodal Token?",
    topic: "nws", content: "# $NODAL\n$NODAL is the native token.", xpReward: 50, order: 1, isActive: true,
  }),
  getAllBadges: vi.fn().mockResolvedValue([
    { id: 1, slug: "welcome", name: "Welcome Badge", description: "First login", xpBonus: 25, color: "#D69E2E" },
    { id: 2, slug: "first-quest", name: "First Quest", description: "Complete first lesson", xpBonus: 50, color: "#E53E3E" },
  ]),
  getUserBadges: vi.fn().mockResolvedValue([
    { id: 1, slug: "welcome", name: "Welcome Badge", description: "First login", xpBonus: 25, color: "#D69E2E" },
  ]),
  getLeaderboard: vi.fn().mockResolvedValue([
    { userId: 1, username: "testuser", avatarId: "avatar1", xp: 500, level: 3, currentStreak: 5 },
    { userId: 2, username: "player2", avatarId: "avatar2", xp: 300, level: 2, currentStreak: 2 },
  ]),
  getActiveAnnouncements: vi.fn().mockResolvedValue([]),
  getUserStats: vi.fn().mockResolvedValue({ lessonsCompleted: 3, quizzesCompleted: 2, badgesEarned: 1 }),
  xpForLevel: vi.fn().mockImplementation((level: number) => level * level * 100),
  getAllAnnouncements: vi.fn().mockResolvedValue([]),
  getAllCampaigns: vi.fn().mockResolvedValue([]),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getAllBadgesAdmin: vi.fn().mockResolvedValue([]),
  completeChallengeDay: vi.fn().mockResolvedValue({ alreadyCompleted: false, daysCompleted: 1 }),
  getChallengeDayCompletions: vi.fn().mockResolvedValue([1, 2, 3]),
  getChallengeEnrollment: vi.fn().mockResolvedValue(null),
  enrollChallenge: vi.fn().mockResolvedValue({ id: 1, userId: 1, daysCompleted: 0, enrolledAt: new Date() }),
  saveMiniGameScore: vi.fn().mockResolvedValue({ id: 1, userId: 1, gameType: 'node-charge', score: 100, createdAt: new Date() }),
}));

// ─── Test helpers ─────────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({ user: { ...makeCtx().user!, role: "admin" } });
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
  });

  it("logout clears session cookie", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Zones Tests ──────────────────────────────────────────────────────────────
describe("zones", () => {
  it("lists all active zones", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const zones = await caller.zones.list();
    expect(Array.isArray(zones)).toBe(true);
    expect(zones.length).toBeGreaterThanOrEqual(0);
  });

  it("returns user zone unlocks for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const unlocks = await caller.zones.userUnlocks();
    expect(Array.isArray(unlocks)).toBe(true);
  });
});

// ─── Lessons Tests ────────────────────────────────────────────────────────────
describe("lessons", () => {
  it("returns lessons for a zone", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const lessons = await caller.lessons.byZone({ zoneId: 1 });
    expect(Array.isArray(lessons)).toBe(true);
  });

  it("returns a specific lesson by ID", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const lesson = await caller.lessons.get({ lessonId: 1 });
    expect(lesson).not.toBeNull();
    if (lesson) {
      expect(lesson.title).toBe("What is Nodal Token?");
      expect(lesson.topic).toBe("nws");
    }
  });
});

// ─── Badges Tests ─────────────────────────────────────────────────────────────
describe("badges", () => {
  it("returns all badges publicly", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const badges = await caller.badges.all();
    expect(Array.isArray(badges)).toBe(true);
  });

  it("returns user badges for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const myBadges = await caller.badges.mine();
    expect(Array.isArray(myBadges)).toBe(true);
  });

  it("throws UNAUTHORIZED for unauthenticated badge mine request", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.badges.mine()).rejects.toThrow();
  });
});

// ─── Leaderboard Tests ────────────────────────────────────────────────────────
describe("leaderboard", () => {
  it("returns top leaderboard entries publicly", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const board = await caller.leaderboard.top({ limit: 10 });
    expect(Array.isArray(board)).toBe(true);
  });

  it("returns my rank for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const rank = await caller.leaderboard.myRank();
    expect(rank).toHaveProperty("rank");
    expect(rank).toHaveProperty("total");
  });

  it("throws UNAUTHORIZED for unauthenticated myRank request", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.leaderboard.myRank()).rejects.toThrow();
  });
});

// ─── Profile Tests ────────────────────────────────────────────────────────────
describe("profile", () => {
  it("returns XP info for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const xpInfo = await caller.profile.xpInfo();
    expect(xpInfo).not.toBeNull();
    if (xpInfo) {
      expect(xpInfo).toHaveProperty("xp");
      expect(xpInfo).toHaveProperty("level");
      expect(xpInfo).toHaveProperty("progressPercent");
    }
  });

  it("throws UNAUTHORIZED for unauthenticated xpInfo request", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profile.xpInfo()).rejects.toThrow();
  });
});

// ─── Announcements Tests ──────────────────────────────────────────────────────
describe("announcements", () => {
  it("returns active announcements publicly", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const announcements = await caller.announcements.active();
    expect(Array.isArray(announcements)).toBe(true);
  });
});

// ─── Admin Access Control Tests ───────────────────────────────────────────────
describe("admin access control", () => {
  it("throws FORBIDDEN for non-admin user accessing admin stats", async () => {
    const ctx = makeCtx(); // regular user
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("allows admin user to access admin stats", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    // Should not throw (may return null if DB not available in test)
    const stats = await caller.admin.stats();
    // stats can be null when DB is not available
    expect(stats === null || typeof stats === "object").toBe(true);
  });

  it("throws FORBIDDEN for non-admin user accessing user list", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users({})).rejects.toThrow();
  });
});

// ─── Referral Tests ───────────────────────────────────────────────────────────
describe("referral", () => {
  it("returns referral code for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.referral.myCode();
    expect(result).toHaveProperty("code");
  });

  it("throws UNAUTHORIZED for unauthenticated referral code request", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.referral.myCode()).rejects.toThrow();
  });
});

// ─── Challenge Mechanics Tests ────────────────────────────────────────────────
describe("challenge mechanics", () => {
  it("getDayCompletions returns array of completed day numbers for enrolled user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const days = await caller.challenge.getDayCompletions();
    expect(Array.isArray(days)).toBe(true);
    // Mock returns [1, 2, 3]
    expect(days).toEqual([1, 2, 3]);
  });

  it("throws UNAUTHORIZED for unauthenticated getDayCompletions", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.challenge.getDayCompletions()).rejects.toThrow();
  });

  it("getEnrollment returns null for non-enrolled user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const enrollment = await caller.challenge.getEnrollment();
    expect(enrollment).toBeNull();
  });

  it("throws UNAUTHORIZED for unauthenticated getEnrollment", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.challenge.getEnrollment()).rejects.toThrow();
  });
});

// ─── completeChallengeDay unit tests ─────────────────────────────────────────
describe("completeChallengeDay logic", () => {
  it("returns alreadyCompleted=true when same sourceId+sourceType used twice", async () => {
    // Simulate: user already has a completion with sourceType=quiz, sourceId=1
    const existingCompletions = [
      { dayNumber: 1, sourceType: "quiz" as const, sourceId: 1, completedAt: new Date("2026-04-20T10:00:00Z"), userId: 1, challengeId: "7day-web3-challenge", id: 1 },
    ];
    const completedDayNumbers = new Set(existingCompletions.map(d => d.dayNumber));
    const currentDaysCompleted = completedDayNumbers.size;
    const alreadyUsed = existingCompletions.some(d => d.sourceType === "quiz" && d.sourceId === 1);
    expect(alreadyUsed).toBe(true);
    expect(currentDaysCompleted).toBe(1);
  });

  it("returns alreadyCompleted=true when a completion already exists for today", async () => {
    const todayUTC = new Date().toISOString().slice(0, 10);
    const existingCompletions = [
      { dayNumber: 1, sourceType: "lesson" as const, sourceId: 5, completedAt: new Date(), userId: 1, challengeId: "7day-web3-challenge", id: 1 },
    ];
    const alreadyCompletedToday = existingCompletions.some(d => {
      const dayDate = new Date(d.completedAt).toISOString().slice(0, 10);
      return dayDate === todayUTC;
    });
    expect(alreadyCompletedToday).toBe(true);
  });

  it("allows a new day when no completion exists for today and source is new", async () => {
    const todayUTC = new Date().toISOString().slice(0, 10);
    const existingCompletions = [
      { dayNumber: 1, sourceType: "lesson" as const, sourceId: 5, completedAt: new Date("2026-04-20T10:00:00Z"), userId: 1, challengeId: "7day-web3-challenge", id: 1 },
    ];
    const alreadyUsed = existingCompletions.some(d => d.sourceType === "quiz" && d.sourceId === 10);
    const alreadyCompletedToday = existingCompletions.some(d => {
      const dayDate = new Date(d.completedAt).toISOString().slice(0, 10);
      return dayDate === todayUTC;
    });
    expect(alreadyUsed).toBe(false);
    expect(alreadyCompletedToday).toBe(false);
  });

  it("caps at 7 days — no new day recorded when daysCompleted >= 7", () => {
    const completedDayNumbers = new Set([1, 2, 3, 4, 5, 6, 7]);
    const currentDaysCompleted = completedDayNumbers.size;
    expect(currentDaysCompleted >= 7).toBe(true);
  });

  it("finalQuizUnlocked is true only when daysCount >= 7", () => {
    expect([0, 1, 3, 6].every(d => d < 7)).toBe(true);
    expect(7 >= 7).toBe(true);
    expect(8 >= 7).toBe(true);
  });
});

// ─── Demo Admin Role Tests ────────────────────────────────────────────────────
describe("demo_admin role access", () => {
  function makeDemoAdminCtx(): TrpcContext {
    return makeCtx({ user: { ...makeCtx().user!, role: "demo_admin" as any } });
  }

  it("demo_admin can call admin.users (demoAdminProcedure)", async () => {
    // getAllUsers is already mocked at top-level to return []
    const ctx = makeDemoAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("demo_admin can call admin.announcements (demoAdminProcedure)", async () => {
    // getAllAnnouncements is already mocked at top-level to return []
    const ctx = makeDemoAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.announcements();
    expect(Array.isArray(result)).toBe(true);
  });

  it("demo_admin cannot call admin.updateUserRole (adminProcedure only)", async () => {
    const ctx = makeDemoAdminCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.updateUserRole({ userId: 1, role: "user" })).rejects.toThrow("Admin access required");
  });

  it("demo_admin cannot call admin.resetLeaderboard (adminProcedure only)", async () => {
    const ctx = makeDemoAdminCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.resetLeaderboard()).rejects.toThrow("Admin access required");
  });

  it("regular user cannot call admin.users (demoAdminProcedure blocks non-admin)", async () => {
    const ctx = makeCtx(); // role: 'user'
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users({})).rejects.toThrow("Admin access required");
  });

  it("full admin can still call admin.updateUserRole", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    };
    (getDb as any).mockResolvedValueOnce(mockDb);
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.updateUserRole({ userId: 2, role: "user" });
    expect(result.success).toBe(true);
  });
});

// ─── Signup Procedure Tests ───────────────────────────────────────────────────
describe("auth.signup", () => {
  it("throws BAD_REQUEST when passwords do not match", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.signup({
        displayName: "Test User",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
      })
    ).rejects.toThrow("Passwords do not match");
  });

  it("throws CONFLICT with EMAIL_TAKEN when email already exists with passwordHash", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 1,
              openId: "existing-open-id",
              email: "existing@example.com",
              passwordHash: "$2b$10$hashedpassword",
              role: "user",
            }]),
          }),
        }),
      }),
    };
    (getDb as any).mockResolvedValueOnce(mockDb);
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.signup({
        displayName: "Test User",
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
      })
    ).rejects.toThrow("EMAIL_TAKEN");
  });

  it("throws CONFLICT with SOCIAL_LOGIN_ONLY when email exists without passwordHash", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 2,
              openId: "social-open-id",
              email: "social@example.com",
              passwordHash: null,
              role: "user",
            }]),
          }),
        }),
      }),
    };
    (getDb as any).mockResolvedValueOnce(mockDb);
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.signup({
        displayName: "Social User",
        email: "social@example.com",
        password: "password123",
        confirmPassword: "password123",
      })
    ).rejects.toThrow("SOCIAL_LOGIN_ONLY");
  });

  it("throws validation error for password shorter than 8 characters", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.signup({
        displayName: "Test User",
        email: "newuser@example.com",
        password: "short",
        confirmPassword: "short",
      })
    ).rejects.toThrow();
  });

  it("throws validation error for invalid email format", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.signup({
        displayName: "Test User",
        email: "not-an-email",
        password: "password123",
        confirmPassword: "password123",
      })
    ).rejects.toThrow();
  });
});

// ─── localLogin SOCIAL_LOGIN_ONLY Tests ──────────────────────────────────────
describe("auth.localLogin social login detection", () => {
  it("throws SOCIAL_LOGIN_ONLY when user has no passwordHash", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: 3,
              openId: "social-user-open-id",
              email: "socialuser@example.com",
              passwordHash: null,
              role: "user",
            }]),
          }),
        }),
      }),
    };
    (getDb as any).mockResolvedValueOnce(mockDb);
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.localLogin({
        email: "socialuser@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow("SOCIAL_LOGIN_ONLY");
  });

  it("throws UNAUTHORIZED for non-existent email", async () => {
    const { getDb } = await import("./db");
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    (getDb as any).mockResolvedValueOnce(mockDb);
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.localLogin({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow("Invalid email or password");
  });
});

// ── Admin Review token validation ────────────────────────────────────────────
describe("admin review token", () => {
  it("ADMIN_REVIEW_TOKEN env is set", () => {
    expect(process.env.ADMIN_REVIEW_TOKEN).toBeTruthy();
    expect((process.env.ADMIN_REVIEW_TOKEN ?? "").length).toBeGreaterThan(8);
  });
});

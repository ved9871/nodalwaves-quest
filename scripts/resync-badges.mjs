/**
 * One-time admin badge resync script for user Faysal (userId 360863).
 * Run with: node scripts/resync-badges.mjs
 * Safe to run multiple times — already-earned badges are skipped.
 */
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await createConnection(DB_URL);

const USER_ID = 360863;

// 1. Get profile
const [[profile]] = await conn.execute(
  "SELECT level, currentStreak, xp FROM user_profiles WHERE userId = ?",
  [USER_ID]
);
console.log("Profile:", profile);

// 2. Get all badges
const [allBadges] = await conn.execute("SELECT * FROM badges");

// 3. Get earned badge IDs
const [earned] = await conn.execute(
  "SELECT badgeId FROM user_badges WHERE userId = ?",
  [USER_ID]
);
const earnedIds = new Set(earned.map(r => r.badgeId));
console.log("Currently earned badge IDs:", [...earnedIds]);

// 4. Gather activity data
const [[{ lesson_count }]] = await conn.execute(
  "SELECT COUNT(*) as lesson_count FROM user_lesson_progress WHERE userId = ?",
  [USER_ID]
);
const [zoneRows] = await conn.execute(
  "SELECT zoneId FROM user_zone_unlocks WHERE userId = ?",
  [USER_ID]
);
const zoneUnlocks = zoneRows.map(r => r.zoneId);

const [miniGameRows] = await conn.execute(
  "SELECT DISTINCT gameType FROM mini_game_scores WHERE userId = ?",
  [USER_ID]
);
const miniGameTypes = miniGameRows.map(r => r.gameType);

const [[{ referral_count }]] = await conn.execute(
  "SELECT COUNT(*) as referral_count FROM referrals WHERE referrerId = ?",
  [USER_ID]
);

// Perfect quiz check: score >= total questions for that quiz
const [quizAttempts] = await conn.execute(
  "SELECT quizId, score FROM user_quiz_attempts WHERE userId = ?",
  [USER_ID]
);
let hasPerfectQuiz = false;
if (quizAttempts.length > 0) {
  const quizIds = [...new Set(quizAttempts.map(r => r.quizId))];
  const placeholders = quizIds.map(() => "?").join(",");
  const [qCounts] = await conn.execute(
    `SELECT quizId, COUNT(*) as cnt FROM quiz_questions WHERE quizId IN (${placeholders}) GROUP BY quizId`,
    quizIds
  );
  const countMap = new Map(qCounts.map(r => [r.quizId, Number(r.cnt)]));
  hasPerfectQuiz = quizAttempts.some(r => {
    const total = countMap.get(r.quizId);
    return total !== undefined && Number(r.score) >= total;
  });
}

console.log("\nActivity summary:");
console.log("  Lessons completed:", lesson_count);
console.log("  Zone unlocks:", zoneUnlocks);
console.log("  Mini-game types played:", miniGameTypes);
console.log("  Referrals made:", referral_count);
console.log("  Has perfect quiz:", hasPerfectQuiz);
console.log("  Level:", profile.level, "| Streak:", profile.currentStreak, "| XP:", profile.xp);

// 5. Check each badge
const newBadges = [];
for (const badge of allBadges) {
  if (earnedIds.has(badge.id)) continue;
  const criteria = typeof badge.criteria === "string" ? JSON.parse(badge.criteria) : badge.criteria;
  if (!criteria) continue;

  let earned = false;
  if (criteria.type === "level" && Number(profile.level) >= criteria.value) earned = true;
  else if (criteria.type === "streak" && Number(profile.currentStreak) >= criteria.value) earned = true;
  else if (criteria.type === "xp" && Number(profile.xp) >= criteria.value) earned = true;
  else if (criteria.type === "lesson" && Number(lesson_count) >= criteria.value) earned = true;
  else if (criteria.type === "zone" && zoneUnlocks.includes(criteria.value)) earned = true;
  else if (criteria.type === "quiz_perfect" && hasPerfectQuiz) earned = true;
  else if (criteria.type === "mini_game" && miniGameTypes.includes(criteria.value)) earned = true;
  else if (criteria.type === "referral" && Number(referral_count) >= criteria.value) earned = true;

  if (earned) {
    newBadges.push(badge);
    console.log(`  → Awarding badge: ${badge.name} (id=${badge.id})`);
    await conn.execute(
      "INSERT INTO user_badges (userId, badgeId, earnedAt) VALUES (?, ?, NOW())",
      [USER_ID, badge.id]
    );
    // Grant XP bonus if any
    if (badge.xpBonus > 0) {
      await conn.execute(
        "UPDATE user_profiles SET xp = xp + ? WHERE userId = ?",
        [badge.xpBonus, USER_ID]
      );
      await conn.execute(
        "INSERT INTO xp_logs (userId, amount, source, sourceId, description, createdAt) VALUES (?, ?, 'badge_bonus', ?, ?, NOW())",
        [USER_ID, badge.xpBonus, badge.id, `Badge: ${badge.name}`]
      );
    }
  }
}

if (newBadges.length === 0) {
  console.log("\nNo new badges to award — all eligible badges already earned.");
} else {
  console.log(`\n✅ Awarded ${newBadges.length} new badge(s) to Faysal.`);
}

// 6. Final badge count
const [[{ final_count }]] = await conn.execute(
  "SELECT COUNT(*) as final_count FROM user_badges WHERE userId = ?",
  [USER_ID]
);
console.log(`\nFinal badge count: ${final_count}`);

await conn.end();

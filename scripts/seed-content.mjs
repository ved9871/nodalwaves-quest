// Local seed runner (needs a Node shell + DATABASE_URL). For hosts without a shell
// (e.g. GoDaddy managed Node), use the in-app endpoint GET /api/setup?token=... instead.
// Seeds zones, badges, announcements (per-item if missing) and lessons + quizzes
// (only when those tables are empty). Idempotent.
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { ZONES, BADGES, ANNOUNCEMENTS, LESSONS, QUIZZES } from "./seed-content-data.mjs";
dotenv.config();

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const conn = await mysql.createConnection(process.env.DATABASE_URL);

let zonesAdded = 0;
for (const z of ZONES) {
  const [rows] = await conn.execute("SELECT id FROM zones WHERE slug = ?", [z.slug]);
  if (rows.length === 0) {
    await conn.execute(
      "INSERT INTO zones (slug, name, description, `order`, requiredLevel, requiredXp, icon, color, isActive) VALUES (?,?,?,?,?,?,?,?,1)",
      [z.slug, z.name, z.description, z.order, z.requiredLevel, z.requiredXp, z.icon, z.color],
    );
    zonesAdded++;
  }
}
console.log(`Zones added: ${zonesAdded}`);

const [zoneRows] = await conn.execute("SELECT id, slug FROM zones");
const zones = {};
for (const z of zoneRows) zones[z.slug] = z.id;

let badgesAdded = 0;
for (const b of BADGES) {
  const [rows] = await conn.execute("SELECT id FROM badges WHERE slug = ?", [b.slug]);
  if (rows.length === 0) {
    await conn.execute(
      "INSERT INTO badges (slug, name, description, icon, color, criteria, xpBonus, isActive) VALUES (?,?,?,?,?,?,?,1)",
      [b.slug, b.name, b.description, b.icon, b.color, JSON.stringify(b.criteria), b.xpBonus],
    );
    badgesAdded++;
  }
}
console.log(`Badges added: ${badgesAdded}`);

const [[{ ac }]] = await conn.execute("SELECT COUNT(*) AS ac FROM announcements");
if (Number(ac) === 0) {
  for (const a of ANNOUNCEMENTS) {
    await conn.execute(
      "INSERT INTO announcements (title, content, type, isActive, ctaText, ctaLink) VALUES (?,?,?,?,?,?)",
      [a.title, a.content, a.type, a.isActive ? 1 : 0, a.ctaText ?? null, a.ctaLink ?? null],
    );
  }
  console.log(`Announcements seeded: ${ANNOUNCEMENTS.length}`);
}

const [[{ lc }]] = await conn.execute("SELECT COUNT(*) AS lc FROM lessons");
if (Number(lc) === 0) {
  for (const l of LESSONS) {
    const zid = zones[l.zoneSlug];
    if (!zid) continue;
    await conn.execute(
      "INSERT INTO lessons (zoneId, slug, title, topic, content, xpReward, `order`, isActive) VALUES (?,?,?,?,?,?,?,1)",
      [zid, slugify(l.title), l.title, l.topic, l.content, l.xpReward, l.order],
    );
    console.log(`  Lesson: ${l.title}`);
  }
} else console.log("Lessons already present — skipped.");

const [[{ qc }]] = await conn.execute("SELECT COUNT(*) AS qc FROM quizzes");
if (Number(qc) === 0) {
  for (const quiz of QUIZZES) {
    const zid = zones[quiz.zoneSlug];
    if (!zid) continue;
    const [result] = await conn.execute(
      "INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore) VALUES (?,?,?,?,?,?)",
      [zid, quiz.title, quiz.description, quiz.timeLimitSeconds, quiz.xpReward, quiz.passingScore],
    );
    const quizId = result.insertId;
    for (const q of quiz.questions) {
      await conn.execute(
        "INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES (?,?,?,?,?,?)",
        [quizId, q.question, JSON.stringify(q.options), q.correctIndex, q.explanation, q.order],
      );
    }
    console.log(`  Quiz: ${quiz.title} (${quiz.questions.length} questions)`);
  }
} else console.log("Quizzes already present — skipped.");

await conn.end();
console.log("\n🎉 Content seeding complete!");

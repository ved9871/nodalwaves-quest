// One-time, token-gated setup endpoint for fresh deployments (e.g. GoDaddy managed
// Node hosting, where there is no shell to run seed scripts).
//
// Trigger once:  GET https://<domain>/api/setup?token=<SETUP_TOKEN>
// It runs INSIDE the app, so it always targets the same database the app uses.
//
// It: (1) creates all tables (IF NOT EXISTS), (2) seeds zones/badges/announcements
// per-item if missing, (3) seeds lessons+quizzes if those tables are empty,
// (4) creates/updates the admin account. Safe to run more than once.
//
// Env used: SETUP_TOKEN (required to enable), DATABASE_URL (required),
//           ADMIN_EMAIL (optional), ADMIN_PASSWORD (optional — generated if unset).
// After a successful run, REMOVE SETUP_TOKEN from your secrets to disable this route.
import type { Express, Request, Response } from "express";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
// @ts-expect-error - generated data modules (plain .mjs, no d.ts)
import { SCHEMA_SQL } from "../../scripts/schema-sql.mjs";
// @ts-expect-error - generated data modules (plain .mjs, no d.ts)
import { ZONES, BADGES, ANNOUNCEMENTS, LESSONS, QUIZZES } from "../../scripts/seed-content-data.mjs";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function genPassword(): string {
  const cs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const b = crypto.randomBytes(18);
  let s = "";
  for (let i = 0; i < b.length; i++) s += cs[b[i] % cs.length];
  return `${s.slice(0, 6)}-${s.slice(6, 12)}-${s.slice(12, 18)}`;
}

export function registerSetupRoute(app: Express) {
  const handler = async (req: Request, res: Response) => {
    const token = process.env.SETUP_TOKEN;
    const provided = (req.query.token as string) || (req.headers["x-setup-token"] as string);
    if (!token) return res.status(403).json({ ok: false, error: "Setup is disabled (SETUP_TOKEN not set)." });
    if (!provided || provided !== token) return res.status(403).json({ ok: false, error: "Invalid setup token." });
    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).json({ ok: false, error: "DATABASE_URL is not set." });

    const summary: Record<string, unknown> = {};
    let conn: mysql.Connection | undefined;
    try {
      conn = await mysql.createConnection({ uri: url, multipleStatements: true });

      // 1) Schema
      await conn.query(SCHEMA_SQL);
      summary.schema = "created/verified";

      // 2) Zones — insert any missing (by slug)
      let zonesAdded = 0;
      for (const z of ZONES) {
        const [rows] = await conn.execute("SELECT id FROM zones WHERE slug = ?", [z.slug]);
        if ((rows as unknown[]).length === 0) {
          await conn.execute(
            "INSERT INTO zones (slug, name, description, `order`, requiredLevel, requiredXp, icon, color, isActive) VALUES (?,?,?,?,?,?,?,?,1)",
            [z.slug, z.name, z.description, z.order, z.requiredLevel, z.requiredXp, z.icon, z.color],
          );
          zonesAdded++;
        }
      }
      summary.zonesAdded = zonesAdded;

      // Build slug -> id map
      const [zoneRows] = await conn.execute("SELECT id, slug FROM zones");
      const zoneId: Record<string, number> = {};
      for (const z of zoneRows as { id: number; slug: string }[]) zoneId[z.slug] = z.id;

      // 3) Badges — insert any missing (by slug)
      let badgesAdded = 0;
      for (const b of BADGES) {
        const [rows] = await conn.execute("SELECT id FROM badges WHERE slug = ?", [b.slug]);
        if ((rows as unknown[]).length === 0) {
          await conn.execute(
            "INSERT INTO badges (slug, name, description, icon, color, criteria, xpBonus, isActive) VALUES (?,?,?,?,?,?,?,1)",
            [b.slug, b.name, b.description, b.icon, b.color, JSON.stringify(b.criteria), b.xpBonus],
          );
          badgesAdded++;
        }
      }
      summary.badgesAdded = badgesAdded;

      // 4) Announcements — seed only if table empty
      const [[annCount]] = (await conn.execute("SELECT COUNT(*) AS c FROM announcements")) as unknown as [{ c: number }[]];
      if (Number(annCount.c) === 0) {
        for (const a of ANNOUNCEMENTS) {
          await conn.execute(
            "INSERT INTO announcements (title, content, type, isActive, ctaText, ctaLink) VALUES (?,?,?,?,?,?)",
            [a.title, a.content, a.type, a.isActive ? 1 : 0, a.ctaText ?? null, a.ctaLink ?? null],
          );
        }
        summary.announcementsSeeded = ANNOUNCEMENTS.length;
      } else summary.announcementsSeeded = 0;

      // 5) Lessons — seed only if table empty
      const [[lessonCount]] = (await conn.execute("SELECT COUNT(*) AS c FROM lessons")) as unknown as [{ c: number }[]];
      if (Number(lessonCount.c) === 0) {
        let n = 0;
        for (const l of LESSONS) {
          const zid = zoneId[l.zoneSlug];
          if (!zid) continue;
          await conn.execute(
            "INSERT INTO lessons (zoneId, slug, title, topic, content, xpReward, `order`, isActive) VALUES (?,?,?,?,?,?,?,1)",
            [zid, slugify(l.title), l.title, l.topic, l.content, l.xpReward, l.order],
          );
          n++;
        }
        summary.lessonsSeeded = n;
      } else summary.lessonsSeeded = 0;

      // 6) Quizzes + questions — seed only if table empty
      const [[quizCount]] = (await conn.execute("SELECT COUNT(*) AS c FROM quizzes")) as unknown as [{ c: number }[]];
      if (Number(quizCount.c) === 0) {
        let nq = 0;
        for (const quiz of QUIZZES) {
          const zid = zoneId[quiz.zoneSlug];
          if (!zid) continue;
          const [result] = await conn.execute(
            "INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore) VALUES (?,?,?,?,?,?)",
            [zid, quiz.title, quiz.description, quiz.timeLimitSeconds, quiz.xpReward, quiz.passingScore],
          );
          const quizId = (result as mysql.ResultSetHeader).insertId;
          for (const q of quiz.questions) {
            await conn.execute(
              "INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES (?,?,?,?,?,?)",
              [quizId, q.question, JSON.stringify(q.options), q.correctIndex, q.explanation, q.order],
            );
          }
          nq++;
        }
        summary.quizzesSeeded = nq;
      } else summary.quizzesSeeded = 0;

      // 7) Admin account
      const adminEmail = (process.env.ADMIN_EMAIL || "prakashved155@gmail.com").toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || genPassword();
      const passwordHash = bcrypt.hashSync(adminPassword, 10);
      const username = (adminEmail.split("@")[0] || "admin").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32) || "admin";
      const [adminRows] = await conn.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
      if ((adminRows as unknown[]).length > 0) {
        await conn.execute("UPDATE users SET role='admin', passwordHash=?, loginMethod='local' WHERE email=?", [passwordHash, adminEmail]);
        summary.admin = { email: adminEmail, created: false, note: "existing account promoted to admin; password reset" };
      } else {
        const openId = `local_${crypto.randomBytes(12).toString("hex")}`;
        const [ins] = await conn.execute(
          "INSERT INTO users (openId, name, email, loginMethod, role, passwordHash, isTestUser) VALUES (?,?,?,'local','admin',?,0)",
          [openId, username, adminEmail, passwordHash],
        );
        const userId = (ins as mysql.ResultSetHeader).insertId;
        const referralCode = crypto.randomBytes(4).toString("hex");
        await conn.execute(
          "INSERT INTO user_profiles (userId, username, avatarId, referralCode, profileSetupDone) VALUES (?,?,'avatar1',?,1)",
          [userId, username, referralCode],
        );
        summary.admin = { email: adminEmail, created: true };
      }
      // Only reveal the password when we generated it (no ADMIN_PASSWORD provided)
      if (!process.env.ADMIN_PASSWORD) (summary.admin as Record<string, unknown>).generatedPassword = adminPassword;

      summary.ok = true;
      summary.next = "Setup complete. Remove the SETUP_TOKEN secret to disable this endpoint, then restart.";
      return res.status(200).json(summary);
    } catch (err) {
      return res.status(500).json({ ok: false, error: String((err as Error).message || err), summary });
    } finally {
      if (conn) await conn.end();
    }
  };

  app.get("/api/setup", handler);
  app.post("/api/setup", handler);
}

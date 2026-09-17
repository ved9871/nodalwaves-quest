// Create (or update) an admin / demo_admin account directly, with a password.
// Use this to bootstrap the first admin on a fresh deploy WITHOUT signing up first.
// Login afterward at /admin-login with the email + password printed below.
//
// Usage:
//   DATABASE_URL=... node scripts/create-admin.mjs <email> [password] [admin|demo_admin]
//   - password omitted -> a strong one is generated and printed once.
//   - role omitted      -> admin (full "super admin").
//
// If a user with that email already exists, its role + password are updated.
import "dotenv/config";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const email = process.argv[2];
const argPw = process.argv[3];
const role = process.argv[4] || "admin";

if (!email) {
  console.error("Usage: node scripts/create-admin.mjs <email> [password] [admin|demo_admin]");
  process.exit(1);
}
if (!["admin", "demo_admin"].includes(role)) {
  console.error(`Invalid role: ${role} (use admin or demo_admin)`);
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set."); process.exit(1); }

function genPassword() {
  const cs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const b = crypto.randomBytes(18);
  let s = "";
  for (const x of b) s += cs[x % cs.length];
  return `${s.slice(0, 6)}-${s.slice(6, 12)}-${s.slice(12, 18)}`;
}

const password = argPw || genPassword();
const passwordHash = bcrypt.hashSync(password, 10);
const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 32) || "admin";

const conn = await mysql.createConnection(url);
try {
  const [rows] = await conn.query("SELECT id, role FROM users WHERE email = ?", [email]);
  if (rows.length) {
    await conn.query("UPDATE users SET role = ?, passwordHash = ?, loginMethod = 'local' WHERE email = ?", [role, passwordHash, email]);
    console.log(`Updated existing account ${email}: role -> ${role}, password reset.`);
  } else {
    const openId = `local_${crypto.randomBytes(12).toString("hex")}`;
    const [res] = await conn.query(
      "INSERT INTO users (openId, name, email, loginMethod, role, passwordHash, isTestUser) VALUES (?, ?, ?, 'local', ?, ?, 0)",
      [openId, username, email, role, passwordHash],
    );
    const userId = res.insertId;
    const referralCode = crypto.randomBytes(4).toString("hex");
    await conn.query(
      "INSERT INTO user_profiles (userId, username, avatarId, referralCode, profileSetupDone) VALUES (?, ?, 'avatar1', ?, 1)",
      [userId, username, referralCode],
    );
    console.log(`Created ${role} account ${email} (userId ${userId}).`);
  }
  console.log("\n  Login at /admin-login");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("\n  Change this password after first login.");
} finally {
  await conn.end();
}

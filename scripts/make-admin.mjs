// Promote (or demote) a user by email. Bootstrap the first admin this way.
// Usage:
//   DATABASE_URL=... node scripts/make-admin.mjs user@example.com           -> admin
//   DATABASE_URL=... node scripts/make-admin.mjs user@example.com demo_admin
//   DATABASE_URL=... node scripts/make-admin.mjs user@example.com user      -> revoke
import "dotenv/config";
import mysql from "mysql2/promise";

const email = process.argv[2];
const role = process.argv[3] || "admin";
if (!email) { console.error("Usage: node scripts/make-admin.mjs <email> [admin|demo_admin|user]"); process.exit(1); }
if (!["admin", "demo_admin", "user"].includes(role)) { console.error(`Invalid role: ${role}`); process.exit(1); }
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set."); process.exit(1); }

const conn = await mysql.createConnection(url);
try {
  const [rows] = await conn.query("SELECT id, email, role FROM users WHERE email = ?", [email]);
  if (!rows.length) { console.error(`No user found with email: ${email}`); process.exit(2); }
  await conn.query("UPDATE users SET role = ? WHERE email = ?", [role, email]);
  console.log(`Updated ${email}: ${rows[0].role} -> ${role}`);
} finally {
  await conn.end();
}

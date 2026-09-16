// Rebrand live DB data (NodeWaves/NWS -> NodalWaves/$NODAL) in place.
// Usage: DATABASE_URL="mysql://user:pass@host:3306/db" node scripts/rebrand-db.mjs
// Idempotent and non-destructive (only rewrites user-facing text columns).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set."); process.exit(1); }

const sql = readFileSync(join(__dirname, "..", "drizzle", "rebrand-live-data.sql"), "utf8");
const statements = sql
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const conn = await mysql.createConnection(url);
let changed = 0;
try {
  for (const stmt of statements) {
    const [res] = await conn.query(stmt);
    const n = res?.affectedRows ?? 0;
    if (n > 0) { changed += n; console.log(`  ${n} row(s): ${stmt.slice(0, 60)}...`); }
  }
  console.log(`\nDone. ${changed} row update(s) applied.`);
} finally {
  await conn.end();
}

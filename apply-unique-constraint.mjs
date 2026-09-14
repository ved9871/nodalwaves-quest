import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL env var not set");
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);
try {
  await conn.execute(
    "ALTER TABLE `challenge_day_completions` ADD CONSTRAINT `uq_challenge_day_source` UNIQUE(`userId`,`challengeId`,`sourceType`,`sourceId`)"
  );
  console.log("✓ Unique constraint applied successfully");
} catch (e) {
  if (e.code === "ER_DUP_KEYNAME") {
    console.log("✓ Unique constraint already exists — skipping");
  } else {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
await conn.end();
process.exit(0);

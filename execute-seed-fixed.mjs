import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Read and execute the seed SQL file
const seedSQL = readFileSync('./drizzle/seed-zone-quizzes-fixed.sql', 'utf-8');
const statements = seedSQL.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

console.log(`Executing ${statements.length} SQL statements...`);

for (const stmt of statements) {
  if (stmt.trim()) {
    try {
      await conn.execute(stmt);
      console.log('✓ Executed:', stmt.substring(0, 80).replace(/\n/g, ' '));
    } catch (e) {
      console.error('✗ Error:', e.message.substring(0, 100));
    }
  }
}

// Verify the seeding
const [result] = await conn.execute(`
  SELECT 
    z.id as zone_id,
    z.name as zone_name,
    COUNT(DISTINCT q.id) as quiz_count,
    SUM(CASE WHEN qq.id IS NOT NULL THEN 1 ELSE 0 END) as total_questions
  FROM zones z
  LEFT JOIN quizzes q ON z.id = q.zoneId
  LEFT JOIN quiz_questions qq ON q.id = qq.quizId
  GROUP BY z.id, z.name
  ORDER BY z.id
`);

console.log('\n=== Quiz Content Summary ===');
result.forEach(row => {
  console.log(`Zone ${row.zone_id}: ${row.zone_name} - ${row.quiz_count} quiz(zes), ${row.total_questions} questions`);
});

await conn.end();

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { quizzes, questions } from './drizzle/schema.ts';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

const allQuizzes = await db.select().from(quizzes).orderBy(quizzes.zoneId);
const allQuestions = await db.select().from(questions);

console.log('=== Quizzes by Zone ===');
allQuizzes.forEach(q => {
  const qCount = allQuestions.filter(qu => qu.quizId === q.id).length;
  console.log(`Zone ${q.zoneId}: ${q.name} (Quiz ID ${q.id}) - ${qCount} questions`);
});

await conn.end();

-- Rebrand live data in place: NodeWaves/NWS -> NodalWaves/$NODAL.
-- Idempotent: safe to run more than once. Updates only user-facing text columns;
-- user accounts, XP, badges, and progress are untouched.
-- Run with: node scripts/rebrand-db.mjs   (uses DATABASE_URL)

-- Zones
UPDATE zones SET name = REPLACE(name, 'NodeWaves', 'NodalWaves') WHERE name LIKE '%NodeWaves%';
UPDATE zones SET name = REPLACE(name, 'NWS Hub', 'Nodal Hub') WHERE name LIKE '%NWS Hub%';
UPDATE zones SET description = REPLACE(description, 'NodeWaves', 'NodalWaves') WHERE description LIKE '%NodeWaves%';
UPDATE zones SET description = REPLACE(description, 'NWS', '$NODAL') WHERE description LIKE '%NWS%';

-- Lessons
UPDATE lessons SET title = REPLACE(title, 'NodeWaves', 'NodalWaves') WHERE title LIKE '%NodeWaves%';
UPDATE lessons SET title = REPLACE(title, 'What is NWS Token?', 'What is Nodal Token?') WHERE title LIKE '%NWS Token%';
UPDATE lessons SET title = REPLACE(title, 'NWS Token', 'Nodal Token') WHERE title LIKE '%NWS Token%';
UPDATE lessons SET title = REPLACE(title, 'NWS', '$NODAL') WHERE title LIKE '%NWS%';
UPDATE lessons SET content = REPLACE(content, 'NodeWaves', 'NodalWaves') WHERE content LIKE '%NodeWaves%';
UPDATE lessons SET content = REPLACE(content, 'NWS token', 'Nodal Token') WHERE content LIKE '%NWS token%';
UPDATE lessons SET content = REPLACE(content, 'NWS tokens', '$NODAL tokens') WHERE content LIKE '%NWS tokens%';
UPDATE lessons SET content = REPLACE(content, 'NWS', '$NODAL') WHERE content LIKE '%NWS%';

-- Quizzes
UPDATE quizzes SET title = REPLACE(title, 'NodeWaves', 'NodalWaves') WHERE title LIKE '%NodeWaves%';
UPDATE quizzes SET title = REPLACE(title, 'NWS', '$NODAL') WHERE title LIKE '%NWS%';
UPDATE quizzes SET description = REPLACE(description, 'NodeWaves', 'NodalWaves') WHERE description LIKE '%NodeWaves%';
UPDATE quizzes SET description = REPLACE(description, 'NWS', '$NODAL') WHERE description LIKE '%NWS%';

-- Quiz questions + explanations + options JSON
UPDATE quiz_questions SET question = REPLACE(question, 'NodeWaves', 'NodalWaves') WHERE question LIKE '%NodeWaves%';
UPDATE quiz_questions SET question = REPLACE(question, 'NWS', '$NODAL') WHERE question LIKE '%NWS%';
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'NodeWaves', 'NodalWaves') WHERE explanation LIKE '%NodeWaves%';
UPDATE quiz_questions SET explanation = REPLACE(explanation, 'NWS', '$NODAL') WHERE explanation LIKE '%NWS%';
UPDATE quiz_questions SET options = REPLACE(options, 'NodeWaves', 'NodalWaves') WHERE options LIKE '%NodeWaves%';
UPDATE quiz_questions SET options = REPLACE(options, 'NWS', '$NODAL') WHERE options LIKE '%NWS%';

-- Badges
UPDATE badges SET name = REPLACE(name, 'NodeWaves', 'NodalWaves') WHERE name LIKE '%NodeWaves%';
UPDATE badges SET name = REPLACE(name, 'NWS', '$NODAL') WHERE name LIKE '%NWS%';
UPDATE badges SET description = REPLACE(description, 'NodeWaves', 'NodalWaves') WHERE description LIKE '%NodeWaves%';
UPDATE badges SET description = REPLACE(description, 'NWS', '$NODAL') WHERE description LIKE '%NWS%';

-- Announcements + campaigns
UPDATE announcements SET title = REPLACE(title, 'NodeWaves', 'NodalWaves') WHERE title LIKE '%NodeWaves%';
UPDATE announcements SET content = REPLACE(content, 'NodeWaves', 'NodalWaves') WHERE content LIKE '%NodeWaves%';
UPDATE announcements SET title = REPLACE(title, 'NWS', '$NODAL') WHERE title LIKE '%NWS%';
UPDATE announcements SET content = REPLACE(content, 'NWS', '$NODAL') WHERE content LIKE '%NWS%';
UPDATE campaigns SET name = REPLACE(name, 'NodeWaves', 'NodalWaves') WHERE name LIKE '%NodeWaves%';
UPDATE campaigns SET description = REPLACE(description, 'NodeWaves', 'NodalWaves') WHERE description LIKE '%NodeWaves%';

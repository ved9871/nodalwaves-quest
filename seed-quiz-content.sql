-- Check current quiz status per zone
SELECT 
  z.id as zone_id,
  z.name as zone_name,
  COUNT(DISTINCT q.id) as quiz_count,
  SUM(CASE WHEN qu.id IS NOT NULL THEN 1 ELSE 0 END) as question_count
FROM zones z
LEFT JOIN quizzes q ON z.id = q.zoneId
LEFT JOIN questions qu ON q.id = qu.quizId
GROUP BY z.id, z.name
ORDER BY z.id;

CREATE OR REPLACE VIEW `user_libraries` AS
SELECT
a.id as anime_id, a.title AS title, a.image AS image,
a.episode_count AS total,
COUNT(ue.id) AS progress,
SUM(e.runtime) AS runtime,
ue.user_id as user_id

FROM 
episodes e 
LEFT JOIN anime a ON a.id = e.anime_id
LEFT JOIN user_episodes ue ON ue.episode_id = e.id 
WHERE ue.user_id IS NOT NULL

GROUP BY e.anime_id, ue.user_id;

DELETE FROM leaderboards
WHERE mode_id = 'global-xp'
  AND id <> ('xp-' || user_id);

INSERT OR REPLACE INTO leaderboards
  (id, user_id, username, playlist, mode_id, rating, score, season_id, source, updated_at, xp, badge, moderator)
SELECT
  'xp-' || u.id,
  u.id,
  u.username,
  'all modes',
  'global-xp',
  MAX(COALESCE(s.xp, 0), COALESCE(u.rating, 0), COALESCE(l.xp, 0), COALESCE(l.score, 0)),
  MAX(COALESCE(s.xp, 0), COALESCE(u.rating, 0), COALESCE(l.xp, 0), COALESCE(l.score, 0)),
  'preseason',
  'server',
  COALESCE(u.updated_at, CURRENT_TIMESTAMP),
  MAX(COALESCE(s.xp, 0), COALESCE(u.rating, 0), COALESCE(l.xp, 0), COALESCE(l.score, 0)),
  COALESCE(u.badge, ''),
  CASE WHEN u.role = 'moderator' THEN 1 ELSE 0 END
FROM users u
LEFT JOIN stats s ON s.user_id = u.id
LEFT JOIN leaderboards l ON l.user_id = u.id AND l.mode_id = 'global-xp'
WHERE EXISTS (
  SELECT 1
  FROM account_credentials c
  WHERE c.user_id = u.id AND c.auth_provider = 'password'
);

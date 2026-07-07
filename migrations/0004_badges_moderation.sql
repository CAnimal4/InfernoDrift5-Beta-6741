CREATE TABLE IF NOT EXISTS account_bans (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  banned_until TEXT NOT NULL,
  banned_by_user_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_account_bans_until
  ON account_bans (banned_until);

INSERT OR IGNORE INTO users
  (id, username, age_gate, device_id, rating, founder_badge, created_at, updated_at, badge, role)
VALUES
  ('seed-joshua', 'Joshua', '13+', '', 5700, 0, '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z', 'Advanced Player', 'player'),
  ('seed-tosh', 'Tosh the Sigma', '13+', '', 4300, 0, '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z', 'Rizzler', 'player'),
  ('seed-clark', 'Clark', '13+', '', 8200, 1, '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z', 'Founder', 'player'),
  ('seed-moderator', 'MODERATOR', '13+', '', 7600, 0, '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z', 'MOD', 'moderator');

INSERT OR IGNORE INTO username_claims
  (username_key, user_id, username, created_at)
VALUES
  ('joshua', 'seed-joshua', 'Joshua', '2026-05-18T00:00:00.000Z'),
  ('tosh the sigma', 'seed-tosh', 'Tosh the Sigma', '2026-05-18T00:00:00.000Z'),
  ('clark', 'seed-clark', 'Clark', '2026-05-18T00:00:00.000Z'),
  ('moderator', 'seed-moderator', 'MODERATOR', '2026-05-18T00:00:00.000Z');

INSERT OR REPLACE INTO account_credentials
  (user_id, username_key, password_hash, password_salt, auth_provider, created_at, updated_at)
VALUES
  ('seed-joshua', 'joshua', '3b6809b32be81d84a5238f9b083cc0f98de50fdc96479833efdfc2977df062ea', 'seed-joshua-v1', 'password', '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z'),
  ('seed-tosh', 'tosh the sigma', 'daa6abe0208e5355caa1dd90c895b36725bd94b31e1196bef6687d62d03e2fc1', 'seed-tosh-v1', 'password', '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z'),
  ('seed-clark', 'clark', 'fe8e5287d1ff13adeaa3b041a35781493f43f567d9a531a4a775911c022dc570', 'seed-clark-v1', 'password', '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z'),
  ('seed-moderator', 'moderator', '73292f1ee357f1ee6c3c951a806f0c1bf469fa2ceebb30fcf9b29135110d3b23', 'seed-moderator-v1', 'password', '2026-05-18T00:00:00.000Z', '2026-05-18T00:00:00.000Z');

INSERT OR REPLACE INTO leaderboards
  (id, user_id, username, playlist, mode_id, rating, score, season_id, source, updated_at, xp, badge, moderator)
VALUES
  ('seed-xp-seed-joshua', 'seed-joshua', 'Joshua', 'all modes', 'global-xp', 5700, 5700, 'preseason', 'server', '2026-05-18T00:00:00.000Z', 5700, 'Advanced Player', 0),
  ('seed-xp-seed-tosh', 'seed-tosh', 'Tosh the Sigma', 'all modes', 'global-xp', 4300, 4300, 'preseason', 'server', '2026-05-18T00:00:00.000Z', 4300, 'Rizzler', 0),
  ('seed-xp-seed-clark', 'seed-clark', 'Clark', 'all modes', 'global-xp', 8200, 8200, 'preseason', 'server', '2026-05-18T00:00:00.000Z', 8200, 'Founder', 0),
  ('seed-xp-seed-moderator', 'seed-moderator', 'MODERATOR', 'all modes', 'global-xp', 7600, 7600, 'preseason', 'server', '2026-05-18T00:00:00.000Z', 7600, 'MOD', 1);

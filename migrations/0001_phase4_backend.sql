CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  age_gate TEXT NOT NULL DEFAULT 'unset',
  device_id TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 1000,
  founder_badge INTEGER NOT NULL DEFAULT 0,
  badge TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'player',
  banned_until TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  message TEXT NOT NULL,
  reply_email TEXT NOT NULL DEFAULT '',
  diagnostics_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at
  ON feedback (created_at);

CREATE TABLE IF NOT EXISTS username_claims (
  username_key TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cloud_saves (
  user_id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  server_updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stats (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  runs INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ranked_ratings (
  user_id TEXT NOT NULL,
  playlist TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 1000,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  placements_remaining INTEGER NOT NULL DEFAULT 5,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  season_id TEXT NOT NULL DEFAULT 'preseason',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, playlist, season_id)
);

CREATE TABLE IF NOT EXISTS leaderboards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  playlist TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 1000,
  score INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  season_id TEXT NOT NULL DEFAULT 'preseason',
  source TEXT NOT NULL DEFAULT 'server',
  updated_at TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT '',
  moderator INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  from_username TEXT NOT NULL,
  to_user_id TEXT NOT NULL DEFAULT '',
  to_username TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  responded_at TEXT
);

CREATE TABLE IF NOT EXISTS friends (
  user_id TEXT NOT NULL,
  friend_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, friend_user_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  user_id TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL DEFAULT '',
  blocked_username TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, blocked_user_id, blocked_username)
);

CREATE TABLE IF NOT EXISTS moderation_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL,
  reporter_username TEXT NOT NULL,
  target_user_id TEXT NOT NULL DEFAULT '',
  target_username TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS moderation_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recent_players (
  user_id TEXT NOT NULL,
  other_user_id TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  room_code TEXT NOT NULL DEFAULT '',
  seen_at TEXT NOT NULL,
  PRIMARY KEY (user_id, other_user_id, mode_id)
);

CREATE TABLE IF NOT EXISTS room_history (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  mode_id TEXT NOT NULL,
  playlist TEXT NOT NULL,
  result_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cosmetics (
  user_id TEXT NOT NULL,
  cosmetic_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'unlock',
  unlocked_at TEXT NOT NULL,
  PRIMARY KEY (user_id, cosmetic_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_playlist
  ON leaderboards (playlist, mode_id, season_id, rating DESC, score DESC);

CREATE INDEX IF NOT EXISTS idx_recent_players_user
  ON recent_players (user_id, seen_at);

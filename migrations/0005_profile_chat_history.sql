CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT '',
  moderator INTEGER NOT NULL DEFAULT 0,
  message_text TEXT NOT NULL,
  quick INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created
  ON chat_messages (channel, created_at DESC);

CREATE TABLE IF NOT EXISTS account_deletions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username_key TEXT NOT NULL,
  deleted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user
  ON account_deletions (user_id, deleted_at DESC);

CREATE TABLE IF NOT EXISTS room_members (
  room_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  mode_id TEXT NOT NULL DEFAULT '',
  playlist TEXT NOT NULL DEFAULT '',
  joined_at TEXT NOT NULL,
  left_at TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (room_code, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_user
  ON room_members (user_id, joined_at DESC);

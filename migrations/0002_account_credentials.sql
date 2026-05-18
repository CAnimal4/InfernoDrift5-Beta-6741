CREATE TABLE IF NOT EXISTS account_credentials (
  user_id TEXT PRIMARY KEY,
  username_key TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  auth_provider TEXT NOT NULL DEFAULT 'password',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_account_credentials_username_key
  ON account_credentials (username_key);

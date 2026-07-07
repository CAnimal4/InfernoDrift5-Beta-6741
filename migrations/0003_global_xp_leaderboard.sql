CREATE INDEX IF NOT EXISTS idx_leaderboards_global_xp
  ON leaderboards (xp DESC, score DESC, updated_at DESC);

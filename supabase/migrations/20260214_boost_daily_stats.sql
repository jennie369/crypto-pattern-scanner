-- Migration: boost_daily_stats table for real per-day boost analytics
-- Replaces the Math.random() variance-based daily stats with actual tracked data

CREATE TABLE IF NOT EXISTS boost_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boost_id UUID NOT NULL REFERENCES post_boosts(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  reactions INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(boost_id, stat_date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_boost_daily_stats_boost_id ON boost_daily_stats(boost_id);
CREATE INDEX IF NOT EXISTS idx_boost_daily_stats_date ON boost_daily_stats(stat_date);

-- RLS: users can only read their own boost stats
ALTER TABLE boost_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own boost daily stats"
  ON boost_daily_stats FOR SELECT
  USING (
    boost_id IN (
      SELECT id FROM post_boosts WHERE user_id = auth.uid()
    )
  );

-- Service role can insert/update (for RPCs and triggers)
CREATE POLICY "Service role full access to boost_daily_stats"
  ON boost_daily_stats FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RPC to upsert daily stats for a boost (called by increment RPCs)
CREATE OR REPLACE FUNCTION upsert_boost_daily_stat(
  p_boost_id UUID,
  p_field TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO boost_daily_stats (boost_id, stat_date)
  VALUES (p_boost_id, CURRENT_DATE)
  ON CONFLICT (boost_id, stat_date) DO NOTHING;

  IF p_field = 'impressions' THEN
    UPDATE boost_daily_stats
    SET impressions = impressions + p_increment, updated_at = NOW()
    WHERE boost_id = p_boost_id AND stat_date = CURRENT_DATE;
  ELSIF p_field = 'clicks' THEN
    UPDATE boost_daily_stats
    SET clicks = clicks + p_increment, updated_at = NOW()
    WHERE boost_id = p_boost_id AND stat_date = CURRENT_DATE;
  ELSIF p_field = 'reactions' THEN
    UPDATE boost_daily_stats
    SET reactions = reactions + p_increment, updated_at = NOW()
    WHERE boost_id = p_boost_id AND stat_date = CURRENT_DATE;
  ELSIF p_field = 'comments' THEN
    UPDATE boost_daily_stats
    SET comments = comments + p_increment, updated_at = NOW()
    WHERE boost_id = p_boost_id AND stat_date = CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upsert_boost_daily_stat(UUID, TEXT, INTEGER) TO authenticated;

-- Update existing increment RPCs to also track daily stats
CREATE OR REPLACE FUNCTION increment_boost_impressions(p_boost_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE post_boosts
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = p_boost_id;

  PERFORM upsert_boost_daily_stat(p_boost_id, 'impressions', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_boost_clicks(p_boost_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE post_boosts
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = p_boost_id;

  PERFORM upsert_boost_daily_stat(p_boost_id, 'clicks', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE boost_daily_stats IS 'Per-day analytics for boost campaigns, replacing estimated daily distributions';

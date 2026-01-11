-- ============================================================================
-- GEMRAL AI LIVESTREAM - COMPLETE SETUP
-- Combined migration: Phase 1 Foundation + Phase 2 AI Brain + Phase 3 Multi-Platform
-- Run this ONCE to set up all livestream tables
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For pgvector (AI embeddings)

-- ============================================================================
-- 1. CREATE USER_PROFILES IF NOT EXISTS
-- This table may already exist from earlier migrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PREMIUM', 'PRO', 'VIP', 'ADMIN')),
  role TEXT DEFAULT 'user',
  is_admin BOOLEAN DEFAULT false,
  gem_balance INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,

  -- Preferences
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',

  -- Stats
  stats JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. LIVESTREAM SESSIONS TABLE (Phase 1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS livestream_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session info
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,

  -- Status: scheduled, live, ended, cancelled
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),

  -- Timing
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Platforms config
  platforms JSONB DEFAULT '{"gemral": true, "tiktok": false, "facebook": false}',
  stream_keys JSONB,

  -- AI Settings
  persona TEXT DEFAULT 'SuPhu' CHECK (persona IN ('SuPhu', 'CoGiao', 'BanThan')),
  voice_id TEXT DEFAULT 'banmai',
  auto_reply BOOLEAN DEFAULT true,
  proactive_engagement BOOLEAN DEFAULT true,

  -- Stats
  stats JSONB DEFAULT '{
    "peak_viewers": 0,
    "current_viewers": 0,
    "total_comments": 0,
    "total_gifts": 0,
    "total_gift_value": 0,
    "total_orders": 0,
    "revenue": 0
  }',

  -- Phase 3: Multi-platform
  restream_enabled BOOLEAN DEFAULT false,
  restream_channels JSONB DEFAULT '[]',
  viewer_counts JSONB DEFAULT '{"gemral": 0, "tiktok": 0, "facebook": 0, "total": 0}',
  product_showcase JSONB DEFAULT '{"enabled": true, "current_product_id": null, "queue": []}',
  gift_settings JSONB DEFAULT '{"enabled": true, "minimum_gem": 1, "goal_gem": 0, "goal_progress": 0}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_status ON livestream_sessions(status);
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_created_at ON livestream_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_created_by ON livestream_sessions(created_by);

-- ============================================================================
-- 3. LIVESTREAM COMMENTS TABLE (Phase 1 + 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS livestream_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,

  -- User info
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN ('gemral', 'tiktok', 'facebook')),
  platform_user_id TEXT,
  platform_username TEXT NOT NULL,
  platform_avatar TEXT,

  -- Content
  message TEXT NOT NULL,

  -- AI Analysis (Phase 2)
  intent TEXT,
  emotion TEXT,
  emotion_intensity FLOAT DEFAULT 0,
  priority_score INTEGER DEFAULT 0,

  -- AI Response tracking
  ai_responded BOOLEAN DEFAULT false,
  ai_response_id UUID,
  response_latency_ms INTEGER,

  -- Gift info
  has_gift BOOLEAN DEFAULT false,
  gift_type TEXT,
  gift_value INTEGER DEFAULT 0,

  -- Moderation
  is_spam BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  flagged_reason TEXT,

  -- Phase 3: Extended metadata
  user_tier TEXT,
  badges JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_livestream_comments_session ON livestream_comments(session_id);
CREATE INDEX IF NOT EXISTS idx_livestream_comments_created ON livestream_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_livestream_comments_priority ON livestream_comments(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_livestream_comments_platform ON livestream_comments(platform);

-- ============================================================================
-- 4. AI RESPONSES TABLE (Phase 1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES livestream_comments(id) ON DELETE SET NULL,

  -- Response details
  response_text TEXT NOT NULL,
  response_tier INTEGER CHECK (response_tier IN (1, 2, 3)),
  persona TEXT,

  -- Voice & Avatar
  voice_id TEXT,
  voice_settings JSONB,
  avatar_expression TEXT,

  -- Media URLs
  audio_url TEXT,
  video_url TEXT,

  -- Performance
  tts_latency_ms INTEGER,
  avatar_latency_ms INTEGER,
  total_latency_ms INTEGER,
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_responses_session ON ai_responses(session_id);

-- ============================================================================
-- 5. LIVESTREAM GIFTS TABLE (Phase 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS livestream_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,

  -- User info
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN ('gemral', 'tiktok', 'facebook')),
  platform_user_id TEXT,
  platform_username TEXT NOT NULL,

  -- Gift details
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_count INTEGER DEFAULT 1,

  -- Values
  diamond_value INTEGER DEFAULT 0,
  star_value INTEGER DEFAULT 0,
  gem_value INTEGER DEFAULT 0,
  value_vnd INTEGER DEFAULT 0,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livestream_gifts_session ON livestream_gifts(session_id);
CREATE INDEX IF NOT EXISTS idx_livestream_gifts_platform ON livestream_gifts(platform);

-- ============================================================================
-- 6. PLATFORM CONNECTIONS TABLE (Phase 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'facebook', 'youtube', 'shopee')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  platform_display_name TEXT,
  platform_avatar TEXT,

  is_verified BOOLEAN DEFAULT false,
  is_follower BOOLEAN DEFAULT false,
  is_subscriber BOOLEAN DEFAULT false,

  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,

  follower_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_user ON user_platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_lookup ON user_platform_connections(platform, platform_user_id);

-- ============================================================================
-- 7. TEMPORARY PLATFORM USERS (Phase 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS temporary_platform_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'facebook', 'youtube')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  display_name TEXT,
  avatar_url TEXT,

  merged_to_user_id UUID REFERENCES auth.users(id),
  merged_at TIMESTAMPTZ,

  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  UNIQUE(platform, platform_user_id)
);

CREATE INDEX IF NOT EXISTS idx_temp_users_platform ON temporary_platform_users(platform, platform_user_id);

-- ============================================================================
-- 8. KNOWLEDGE BASE TABLE (Phase 2 - pgvector)
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  category TEXT NOT NULL,
  subcategory TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Vector embedding for semantic search
  embedding vector(1536),

  -- Metadata
  keywords TEXT[],
  related_products TEXT[],
  metadata JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);

-- ============================================================================
-- 9. INTENT PATTERNS TABLE (Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS intent_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  intent_id TEXT NOT NULL UNIQUE,
  intent_name TEXT NOT NULL,
  intent_name_vi TEXT,
  tier INTEGER DEFAULT 2 CHECK (tier IN (1, 2, 3)),
  priority FLOAT DEFAULT 0.5,

  patterns TEXT[] NOT NULL,
  keywords TEXT[],
  response_templates JSONB,

  requires_product BOOLEAN DEFAULT false,
  requires_context BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intent_patterns_intent ON intent_patterns(intent_id);

-- ============================================================================
-- 10. STREAM HEALTH LOGS (Phase 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stream_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES livestream_sessions(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('gemral', 'tiktok', 'facebook', 'restream')),

  bitrate INTEGER,
  fps REAL,
  resolution TEXT,
  latency_ms INTEGER,
  dropped_frames INTEGER,

  status TEXT CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
  issue_type TEXT,
  issue_details TEXT,

  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_health_session ON stream_health_logs(session_id);

-- ============================================================================
-- 11. ADD COLUMNS TO USER_PROFILES (Safe - checks if exists)
-- ============================================================================

DO $$
BEGIN
  -- Livestream platforms
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'livestream_platforms') THEN
    ALTER TABLE user_profiles ADD COLUMN livestream_platforms JSONB DEFAULT '{}';
  END IF;

  -- Emotional profile
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'emotional_profile') THEN
    ALTER TABLE user_profiles ADD COLUMN emotional_profile JSONB DEFAULT '{}';
  END IF;

  -- Livestream preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'livestream_preferences') THEN
    ALTER TABLE user_profiles ADD COLUMN livestream_preferences JSONB DEFAULT '{}';
  END IF;

  -- Livestream stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'livestream_stats') THEN
    ALTER TABLE user_profiles ADD COLUMN livestream_stats JSONB DEFAULT '{
      "total_sessions_watched": 0,
      "total_watch_time_minutes": 0,
      "total_comments": 0,
      "total_gifts_sent": 0,
      "total_gifts_value": 0
    }';
  END IF;

  -- Platforms (cross-platform identity)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'platforms') THEN
    ALTER TABLE user_profiles ADD COLUMN platforms JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE livestream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_health_logs ENABLE ROW LEVEL SECURITY;

-- Sessions policies
DROP POLICY IF EXISTS "Anyone can view public sessions" ON livestream_sessions;
CREATE POLICY "Anyone can view public sessions" ON livestream_sessions
  FOR SELECT USING (status IN ('live', 'ended'));

DROP POLICY IF EXISTS "Authenticated can view all sessions" ON livestream_sessions;
CREATE POLICY "Authenticated can view all sessions" ON livestream_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON livestream_comments;
CREATE POLICY "Anyone can view comments" ON livestream_comments
  FOR SELECT USING (is_hidden = false AND is_spam = false);

DROP POLICY IF EXISTS "Authenticated can create comments" ON livestream_comments;
CREATE POLICY "Authenticated can create comments" ON livestream_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Gifts policies
DROP POLICY IF EXISTS "Anyone can view gifts" ON livestream_gifts;
CREATE POLICY "Anyone can view gifts" ON livestream_gifts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can send gifts" ON livestream_gifts;
CREATE POLICY "Authenticated can send gifts" ON livestream_gifts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Platform connections policies
DROP POLICY IF EXISTS "Users can view own connections" ON user_platform_connections;
CREATE POLICY "Users can view own connections" ON user_platform_connections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own connections" ON user_platform_connections;
CREATE POLICY "Users can manage own connections" ON user_platform_connections
  FOR ALL USING (auth.uid() = user_id);

-- Temp users policies
DROP POLICY IF EXISTS "Anyone can view temp users" ON temporary_platform_users;
CREATE POLICY "Anyone can view temp users" ON temporary_platform_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage temp users" ON temporary_platform_users;
CREATE POLICY "System can manage temp users" ON temporary_platform_users
  FOR ALL USING (true);

-- Knowledge base policies
DROP POLICY IF EXISTS "Anyone can read knowledge" ON knowledge_base;
CREATE POLICY "Anyone can read knowledge" ON knowledge_base
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- 13. REALTIME SUBSCRIPTIONS
-- ============================================================================

DO $$
BEGIN
  -- Add tables to realtime publication (ignore errors if already added)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE livestream_comments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE livestream_sessions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE livestream_gifts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ============================================================================
-- 14. HELPER FUNCTIONS
-- ============================================================================

-- Update session stats on new comment
CREATE OR REPLACE FUNCTION increment_session_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE livestream_sessions
  SET stats = jsonb_set(
    stats,
    '{total_comments}',
    to_jsonb(COALESCE((stats->>'total_comments')::INTEGER, 0) + 1)
  )
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_comment_count ON livestream_comments;
CREATE TRIGGER trigger_increment_comment_count
  AFTER INSERT ON livestream_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_session_comment_count();

-- Update session stats on new gift
CREATE OR REPLACE FUNCTION update_session_gift_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE livestream_sessions
  SET stats = jsonb_set(
    jsonb_set(
      stats,
      '{total_gifts}',
      to_jsonb(COALESCE((stats->>'total_gifts')::INTEGER, 0) + NEW.gift_count)
    ),
    '{total_gift_value}',
    to_jsonb(COALESCE((stats->>'total_gift_value')::INTEGER, 0) + COALESCE(NEW.value_vnd, 0))
  )
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gift_stats ON livestream_gifts;
CREATE TRIGGER trigger_update_gift_stats
  AFTER INSERT ON livestream_gifts
  FOR EACH ROW
  EXECUTE FUNCTION update_session_gift_stats();

-- Update viewer counts
CREATE OR REPLACE FUNCTION update_viewer_counts(
  p_session_id UUID,
  p_platform TEXT,
  p_count INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_counts JSONB;
  v_total INTEGER;
BEGIN
  SELECT viewer_counts INTO v_counts FROM livestream_sessions WHERE id = p_session_id;

  v_counts = jsonb_set(v_counts, ARRAY[p_platform], to_jsonb(p_count));
  v_total = COALESCE((v_counts->>'gemral')::INTEGER, 0)
          + COALESCE((v_counts->>'tiktok')::INTEGER, 0)
          + COALESCE((v_counts->>'facebook')::INTEGER, 0);
  v_counts = jsonb_set(v_counts, ARRAY['total'], to_jsonb(v_total));

  UPDATE livestream_sessions
  SET viewer_counts = v_counts,
      stats = jsonb_set(stats, '{current_viewers}', to_jsonb(v_total))
  WHERE id = p_session_id;

  -- Update peak if needed
  UPDATE livestream_sessions
  SET stats = jsonb_set(stats, '{peak_viewers}', to_jsonb(v_total))
  WHERE id = p_session_id
    AND COALESCE((stats->>'peak_viewers')::INTEGER, 0) < v_total;
END;
$$ LANGUAGE plpgsql;

-- Semantic search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.category,
    kb.title,
    kb.content,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Get gift leaderboard
CREATE OR REPLACE FUNCTION get_gift_leaderboard(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank INTEGER,
  user_id UUID,
  platform TEXT,
  platform_username TEXT,
  avatar TEXT,
  total_gifts INTEGER,
  total_value INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(lg.value_vnd) DESC)::INTEGER AS rank,
    lg.user_id,
    lg.platform,
    lg.platform_username,
    lg.metadata->>'avatar' AS avatar,
    SUM(lg.gift_count)::INTEGER AS total_gifts,
    SUM(lg.value_vnd)::INTEGER AS total_value
  FROM livestream_gifts lg
  WHERE lg.session_id = p_session_id
  GROUP BY lg.user_id, lg.platform, lg.platform_username, lg.metadata->>'avatar'
  ORDER BY total_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE - All livestream tables created
-- ============================================================================

COMMENT ON TABLE livestream_sessions IS 'AI Livestream sessions (Phase 1-3)';
COMMENT ON TABLE livestream_comments IS 'Multi-platform comments (Phase 1-3)';
COMMENT ON TABLE livestream_gifts IS 'Gift tracking from all platforms (Phase 3)';
COMMENT ON TABLE knowledge_base IS 'AI knowledge base with embeddings (Phase 2)';
COMMENT ON TABLE user_platform_connections IS 'Cross-platform user identity (Phase 3)';

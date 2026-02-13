-- ============================================================
-- MIGRATION 001: CHATBOT MEMORY TABLES
-- GEM Master Chatbot Upgrade - Long-term Memory & Personalization
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: user_chatbot_profiles
-- Long-term memory profile for AI personalization
-- ============================================================

CREATE TABLE IF NOT EXISTS user_chatbot_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Identity
  display_name VARCHAR(100),
  preferred_name VARCHAR(50),
  birth_date DATE,
  zodiac_sign VARCHAR(20),

  -- Spiritual Journey
  life_purpose TEXT,
  core_values TEXT[] DEFAULT '{}',
  spiritual_goals TEXT[] DEFAULT '{}',

  -- Communication Preferences
  communication_style VARCHAR(20) DEFAULT 'balanced' CHECK (communication_style IN ('gentle', 'direct', 'balanced')),
  language_preference VARCHAR(10) DEFAULT 'vi',

  -- Journey Tracking
  journey_start_date DATE DEFAULT CURRENT_DATE,
  transformation_days INTEGER DEFAULT 0,

  -- Notification Preferences
  notification_preferences JSONB DEFAULT '{
    "daily_insight": true,
    "streak_alerts": true,
    "ritual_reminders": true,
    "pattern_observations": true,
    "milestone_celebrations": true,
    "preferred_time": "08:00"
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_chatbot_profile UNIQUE (user_id)
);

-- Indexes for user_chatbot_profiles
CREATE INDEX IF NOT EXISTS idx_chatbot_profiles_user_id ON user_chatbot_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_profiles_journey_start ON user_chatbot_profiles(journey_start_date);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_chatbot_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Auto-calculate transformation_days
  IF NEW.journey_start_date IS NOT NULL THEN
    NEW.transformation_days = GREATEST(0, CURRENT_DATE - NEW.journey_start_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chatbot_profile_timestamp ON user_chatbot_profiles;
CREATE TRIGGER trigger_update_chatbot_profile_timestamp
  BEFORE UPDATE ON user_chatbot_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_chatbot_profile_timestamp();

-- ============================================================
-- TABLE 2: chat_memories
-- Semantic memories for AI context
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Memory Classification
  memory_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (memory_type IN (
    'goal', 'value', 'preference', 'achievement', 'challenge',
    'relationship', 'emotion', 'insight', 'divination', 'general'
  )),
  category VARCHAR(50) DEFAULT 'general',

  -- Memory Content
  title VARCHAR(200),
  content TEXT NOT NULL,
  summary TEXT,
  context JSONB DEFAULT '{}',

  -- Memory Importance
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Source Tracking
  source_type VARCHAR(50) DEFAULT 'conversation' CHECK (source_type IN (
    'conversation', 'divination', 'goal', 'manual', 'extracted'
  )),
  source_reference_id UUID,

  -- Expiration (null = never expires)
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_memories
CREATE INDEX IF NOT EXISTS idx_chat_memories_user_id ON chat_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_memories_type ON chat_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_chat_memories_category ON chat_memories(category);
CREATE INDEX IF NOT EXISTS idx_chat_memories_importance ON chat_memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_chat_memories_pinned ON chat_memories(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_chat_memories_expires ON chat_memories(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_memories_search ON chat_memories(user_id, memory_type, importance DESC);

-- Auto-update timestamp trigger for chat_memories
DROP TRIGGER IF EXISTS trigger_update_chat_memories_timestamp ON chat_memories;
CREATE TRIGGER trigger_update_chat_memories_timestamp
  BEFORE UPDATE ON chat_memories
  FOR EACH ROW
  EXECUTE FUNCTION update_user_chatbot_profile_timestamp();

-- ============================================================
-- TABLE 3: emotional_states
-- Emotion tracking history for AI adaptation
-- ============================================================

CREATE TABLE IF NOT EXISTS emotional_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Emotion Data
  primary_emotion VARCHAR(50) NOT NULL,
  secondary_emotions TEXT[] DEFAULT '{}',
  intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),

  -- Frequency Data (GEM Method Hz mapping)
  frequency_hz INTEGER CHECK (frequency_hz >= 20 AND frequency_hz <= 700),
  frequency_level VARCHAR(20) CHECK (frequency_level IN ('low', 'medium', 'elevated')),

  -- Context
  trigger_topic VARCHAR(100),
  message_excerpt TEXT,
  session_id UUID,

  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for emotional_states
CREATE INDEX IF NOT EXISTS idx_emotional_states_user_id ON emotional_states(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_detected_at ON emotional_states(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_states_emotion ON emotional_states(primary_emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_states_user_date ON emotional_states(user_id, detected_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_chatbot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

-- user_chatbot_profiles policies
DROP POLICY IF EXISTS "Users can view own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can view own chatbot profile" ON user_chatbot_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can create own chatbot profile" ON user_chatbot_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can update own chatbot profile" ON user_chatbot_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- chat_memories policies
DROP POLICY IF EXISTS "Users can view own memories" ON chat_memories;
CREATE POLICY "Users can view own memories" ON chat_memories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own memories" ON chat_memories;
CREATE POLICY "Users can create own memories" ON chat_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON chat_memories;
CREATE POLICY "Users can update own memories" ON chat_memories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON chat_memories;
CREATE POLICY "Users can delete own memories" ON chat_memories
  FOR DELETE USING (auth.uid() = user_id);

-- emotional_states policies
DROP POLICY IF EXISTS "Users can view own emotional states" ON emotional_states;
CREATE POLICY "Users can view own emotional states" ON emotional_states
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own emotional states" ON emotional_states;
CREATE POLICY "Users can create own emotional states" ON emotional_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Get or create chatbot profile
CREATE OR REPLACE FUNCTION get_or_create_chatbot_profile(p_user_id UUID)
RETURNS user_chatbot_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile user_chatbot_profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO v_profile
  FROM user_chatbot_profiles
  WHERE user_id = p_user_id;

  -- Create if not exists
  IF v_profile.id IS NULL THEN
    INSERT INTO user_chatbot_profiles (user_id, journey_start_date)
    VALUES (p_user_id, CURRENT_DATE)
    RETURNING * INTO v_profile;
  END IF;

  RETURN v_profile;
END;
$$;

-- Function: Search memories by relevance
CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_query TEXT,
  p_memory_type VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  category TEXT,
  title TEXT,
  content TEXT,
  importance INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If query is empty, return recent memories
  IF p_query IS NULL OR TRIM(p_query) = '' THEN
    RETURN QUERY
    SELECT
      m.id,
      m.memory_type::TEXT,
      m.category::TEXT,
      m.title::TEXT,
      m.content,
      m.importance,
      m.created_at,
      1.0::FLOAT AS relevance_score
    FROM chat_memories m
    WHERE m.user_id = p_user_id
      AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY m.importance DESC, m.created_at DESC
    LIMIT p_limit;
    RETURN;
  END IF;

  -- Search with query
  RETURN QUERY
  SELECT
    m.id,
    m.memory_type::TEXT,
    m.category::TEXT,
    m.title::TEXT,
    m.content,
    m.importance,
    m.created_at,
    -- Simple text similarity score
    CASE
      WHEN m.content ILIKE '%' || p_query || '%' THEN 1.0
      WHEN m.title ILIKE '%' || p_query || '%' THEN 0.8
      WHEN m.summary ILIKE '%' || p_query || '%' THEN 0.6
      ELSE 0.0
    END::FLOAT AS relevance_score
  FROM chat_memories m
  WHERE m.user_id = p_user_id
    AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
    AND (
      m.content ILIKE '%' || p_query || '%'
      OR m.title ILIKE '%' || p_query || '%'
      OR m.summary ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance_score DESC, m.importance DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Get recent memories
CREATE OR REPLACE FUNCTION get_recent_memories(
  p_user_id UUID,
  p_memory_type VARCHAR DEFAULT NULL,
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 20
)
RETURNS SETOF chat_memories
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM chat_memories
  WHERE user_id = p_user_id
    AND (p_memory_type IS NULL OR memory_type = p_memory_type)
    AND (expires_at IS NULL OR expires_at > NOW())
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY importance DESC, created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Get emotional journey
CREATE OR REPLACE FUNCTION get_emotional_journey(
  p_user_id UUID,
  p_days INTEGER DEFAULT 14
)
RETURNS TABLE (
  detected_date DATE,
  avg_frequency INTEGER,
  primary_emotions TEXT[],
  record_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(detected_at) AS detected_date,
    ROUND(AVG(frequency_hz))::INTEGER AS avg_frequency,
    ARRAY_AGG(DISTINCT primary_emotion::TEXT)::TEXT[] AS primary_emotions,
    COUNT(*)::INTEGER AS record_count
  FROM emotional_states
  WHERE user_id = p_user_id
    AND detected_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(detected_at)
  ORDER BY detected_date DESC;
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_or_create_chatbot_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_memories(UUID, TEXT, VARCHAR, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_memories(UUID, VARCHAR, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emotional_journey(UUID, INTEGER) TO authenticated;

-- ============================================================
-- CLEANUP FUNCTION (for expired memories)
-- Can be called by scheduled job
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_expired_memories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM chat_memories
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE user_chatbot_profiles IS 'Long-term memory profile for AI chatbot personalization';
COMMENT ON TABLE chat_memories IS 'Semantic memories extracted from conversations for AI context';
COMMENT ON TABLE emotional_states IS 'Emotion tracking history for adaptive AI responses';

COMMENT ON COLUMN user_chatbot_profiles.transformation_days IS 'Auto-calculated days since journey_start_date';
COMMENT ON COLUMN chat_memories.importance IS 'Memory importance 1-10, higher = more relevant for AI context';
COMMENT ON COLUMN emotional_states.frequency_hz IS 'Emotion frequency in Hz (20-700) based on GEM method';

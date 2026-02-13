-- ============================================================
-- CONSOLIDATED MIGRATION: CHATBOT UPGRADE TABLES
-- Run this in Supabase SQL Editor to enable Memory, Emotion,
-- Rituals, Gamification, and Proactive AI features
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STEP 1: Create user_streaks table FIRST (dependency for rituals)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL DEFAULT 'general',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completion_date DATE,
  streak_start_date DATE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_earned TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_streak_type UNIQUE (user_id, streak_type)
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streaks" ON user_streaks;
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- STEP 2: CHATBOT MEMORY TABLES
-- ============================================================

-- TABLE: user_chatbot_profiles
CREATE TABLE IF NOT EXISTS user_chatbot_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  preferred_name VARCHAR(50),
  birth_date DATE,
  zodiac_sign VARCHAR(20),
  life_purpose TEXT,
  core_values TEXT[] DEFAULT '{}',
  spiritual_goals TEXT[] DEFAULT '{}',
  communication_style VARCHAR(20) DEFAULT 'balanced' CHECK (communication_style IN ('gentle', 'direct', 'balanced')),
  language_preference VARCHAR(10) DEFAULT 'vi',
  journey_start_date DATE DEFAULT CURRENT_DATE,
  transformation_days INTEGER DEFAULT 0,
  notification_preferences JSONB DEFAULT '{"daily_insight": true, "streak_alerts": true, "ritual_reminders": true, "pattern_observations": true, "milestone_celebrations": true, "preferred_time": "08:00"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_chatbot_profile UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_chatbot_profiles_user_id ON user_chatbot_profiles(user_id);

ALTER TABLE user_chatbot_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can view own chatbot profile" ON user_chatbot_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can create own chatbot profile" ON user_chatbot_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chatbot profile" ON user_chatbot_profiles;
CREATE POLICY "Users can update own chatbot profile" ON user_chatbot_profiles FOR UPDATE USING (auth.uid() = user_id);

-- TABLE: chat_memories
CREATE TABLE IF NOT EXISTS chat_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (memory_type IN ('goal', 'value', 'preference', 'achievement', 'challenge', 'relationship', 'emotion', 'insight', 'divination', 'general')),
  category VARCHAR(50) DEFAULT 'general',
  title VARCHAR(200),
  content TEXT NOT NULL,
  summary TEXT,
  context JSONB DEFAULT '{}',
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  is_pinned BOOLEAN DEFAULT FALSE,
  source_type VARCHAR(50) DEFAULT 'conversation' CHECK (source_type IN ('conversation', 'divination', 'goal', 'manual', 'extracted')),
  source_reference_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_memories_user_id ON chat_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_memories_type ON chat_memories(memory_type);

ALTER TABLE chat_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memories" ON chat_memories;
CREATE POLICY "Users can view own memories" ON chat_memories FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own memories" ON chat_memories;
CREATE POLICY "Users can create own memories" ON chat_memories FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON chat_memories;
CREATE POLICY "Users can update own memories" ON chat_memories FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON chat_memories;
CREATE POLICY "Users can delete own memories" ON chat_memories FOR DELETE USING (auth.uid() = user_id);

-- TABLE: emotional_states
CREATE TABLE IF NOT EXISTS emotional_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_emotion VARCHAR(50) NOT NULL,
  secondary_emotions TEXT[] DEFAULT '{}',
  intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
  frequency_hz INTEGER CHECK (frequency_hz >= 20 AND frequency_hz <= 700),
  frequency_level VARCHAR(20) CHECK (frequency_level IN ('low', 'medium', 'elevated')),
  trigger_topic VARCHAR(100),
  message_excerpt TEXT,
  session_id UUID,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_states_user_id ON emotional_states(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_detected_at ON emotional_states(detected_at DESC);

ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own emotional states" ON emotional_states;
CREATE POLICY "Users can view own emotional states" ON emotional_states FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own emotional states" ON emotional_states;
CREATE POLICY "Users can create own emotional states" ON emotional_states FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 3: RITUAL TABLES
-- ============================================================

-- TABLE: user_rituals
CREATE TABLE IF NOT EXISTS user_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  ritual_type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (ritual_type IN ('meditation', 'affirmation', 'gratitude', 'journaling', 'exercise', 'reading', 'breathing', 'visualization', 'custom')),
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'weekly', 'custom')),
  scheduled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  scheduled_time TIME NOT NULL DEFAULT '08:00',
  duration_minutes INTEGER DEFAULT 10 CHECK (duration_minutes >= 1 AND duration_minutes <= 480),
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  xp_reward INTEGER DEFAULT 10,
  streak_eligible BOOLEAN DEFAULT TRUE,
  icon_name VARCHAR(50) DEFAULT 'sparkles',
  color VARCHAR(20) DEFAULT '#FFBD59',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_rituals_user_id ON user_rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rituals_active ON user_rituals(user_id, is_active) WHERE is_active = TRUE;

ALTER TABLE user_rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rituals" ON user_rituals;
CREATE POLICY "Users can view own rituals" ON user_rituals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own rituals" ON user_rituals;
CREATE POLICY "Users can create own rituals" ON user_rituals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own rituals" ON user_rituals;
CREATE POLICY "Users can update own rituals" ON user_rituals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rituals" ON user_rituals;
CREATE POLICY "Users can delete own rituals" ON user_rituals FOR DELETE USING (auth.uid() = user_id);

-- TABLE: ritual_completions
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_id UUID REFERENCES user_rituals(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_actual INTEGER,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  mood_before VARCHAR(50),
  mood_after VARCHAR(50),
  notes TEXT,
  reflection TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ritual_completions_user_id ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_lookup ON ritual_completions(user_id, completion_date DESC);

ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own completions" ON ritual_completions;
CREATE POLICY "Users can view own completions" ON ritual_completions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own completions" ON ritual_completions;
CREATE POLICY "Users can create own completions" ON ritual_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own completions" ON ritual_completions;
CREATE POLICY "Users can update own completions" ON ritual_completions FOR UPDATE USING (auth.uid() = user_id);

-- Add ritual_id to user_streaks if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_streaks' AND column_name = 'ritual_id') THEN
    ALTER TABLE user_streaks ADD COLUMN ritual_id UUID REFERENCES user_rituals(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- STEP 4: PROACTIVE AI TABLES
-- ============================================================

-- TABLE: proactive_messages
CREATE TABLE IF NOT EXISTS proactive_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('daily_insight', 'ritual_reminder', 'streak_alert', 'streak_milestone', 'pattern_observation', 'celebration', 'encouragement', 'check_in', 'weekly_summary', 'custom')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'push', 'both', 'email')),
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  was_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  was_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  user_response TEXT,
  user_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proactive_messages_user_id ON proactive_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_pending ON proactive_messages(scheduled_for, is_sent) WHERE is_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_proactive_messages_unread ON proactive_messages(user_id, was_read, is_sent) WHERE was_read = FALSE AND is_sent = TRUE;

ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own proactive messages" ON proactive_messages;
CREATE POLICY "Users can view own proactive messages" ON proactive_messages FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own proactive messages" ON proactive_messages;
CREATE POLICY "Users can create own proactive messages" ON proactive_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own proactive messages" ON proactive_messages;
CREATE POLICY "Users can update own proactive messages" ON proactive_messages FOR UPDATE USING (auth.uid() = user_id);

-- TABLE: feature_usage
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_feature_date UNIQUE (user_id, feature_key, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_lookup ON feature_usage(user_id, feature_key, usage_date);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON feature_usage;
CREATE POLICY "Users can view own usage" ON feature_usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON feature_usage;
CREATE POLICY "Users can insert own usage" ON feature_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON feature_usage;
CREATE POLICY "Users can update own usage" ON feature_usage FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- STEP 5: HELPER FUNCTIONS
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
  SELECT * INTO v_profile FROM user_chatbot_profiles WHERE user_id = p_user_id;
  IF v_profile.id IS NULL THEN
    INSERT INTO user_chatbot_profiles (user_id, journey_start_date)
    VALUES (p_user_id, CURRENT_DATE)
    RETURNING * INTO v_profile;
  END IF;
  RETURN v_profile;
END;
$$;

-- Function: Initialize default rituals
CREATE OR REPLACE FUNCTION initialize_default_rituals(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_rituals WHERE user_id = p_user_id;
  IF v_count > 0 THEN RETURN v_count; END IF;

  INSERT INTO user_rituals (user_id, name, description, ritual_type, duration_minutes, scheduled_time, icon_name, color, sort_order)
  VALUES
    (p_user_id, 'Thiền buổi sáng', 'Thiền định 10 phút để bắt đầu ngày mới', 'meditation', 10, '06:30', 'sun', '#87CEEB', 1),
    (p_user_id, 'Affirmation', 'Đọc và cảm nhận các khẳng định tích cực', 'affirmation', 5, '07:00', 'sparkles', '#FFD700', 2),
    (p_user_id, 'Nhật ký biết ơn', 'Viết 3 điều biết ơn trong ngày', 'gratitude', 5, '21:00', 'heart', '#FF69B4', 3);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function: Get pending proactive messages
CREATE OR REPLACE FUNCTION get_pending_proactive_messages(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS SETOF proactive_messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM proactive_messages
  WHERE user_id = p_user_id AND is_sent = TRUE AND was_read = FALSE AND was_dismissed = FALSE
  ORDER BY priority DESC, scheduled_for DESC
  LIMIT p_limit;
END;
$$;

-- Function: Mark proactive message as read
CREATE OR REPLACE FUNCTION mark_proactive_message_read(p_message_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE proactive_messages SET was_read = TRUE, read_at = NOW()
  WHERE id = p_message_id AND user_id = p_user_id;
  RETURN FOUND;
END;
$$;

-- Function: Increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(p_user_id UUID, p_feature_key VARCHAR, p_usage_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  INSERT INTO feature_usage (user_id, feature_key, usage_date, count)
  VALUES (p_user_id, p_feature_key, p_usage_date, 1)
  ON CONFLICT (user_id, feature_key, usage_date)
  DO UPDATE SET count = feature_usage.count + 1, updated_at = NOW()
  RETURNING count INTO v_new_count;
  RETURN v_new_count;
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_or_create_chatbot_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_default_rituals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_proactive_messages(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_proactive_message_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_feature_usage(UUID, VARCHAR, DATE) TO authenticated;

-- ============================================================
-- DONE! All chatbot upgrade tables created successfully.
-- ============================================================
SELECT 'Chatbot Upgrade Tables Created Successfully!' AS result;

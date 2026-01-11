-- ============================================================
-- PHASE 1: Multi-Platform Chatbot - Platform Tables
-- File: 20251227_phase1_platform_tables.sql
-- Description: Tables for multi-platform chatbot (Zalo, Messenger, Mobile, Web)
-- Author: Claude Code
-- Date: 2025-12-27
-- ============================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: chatbot_platform_users
-- Maps external platform users to internal profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_platform_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Platform identification
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('zalo', 'messenger', 'mobile', 'web')),
  platform_user_id VARCHAR(255) NOT NULL, -- External platform's user ID

  -- User info from platform
  display_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20), -- For Zalo (optional)
  email VARCHAR(255), -- For web (optional)

  -- Link to internal user (optional - external users may not have account)
  app_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Platform-specific metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {"locale": "vi", "timezone": "Asia/Ho_Chi_Minh", "source": "oa_message"}

  -- Tracking
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one record per platform+platform_user_id
  CONSTRAINT unique_platform_user UNIQUE (platform, platform_user_id)
);

-- Indexes for chatbot_platform_users
CREATE INDEX IF NOT EXISTS idx_platform_users_platform ON chatbot_platform_users(platform);
CREATE INDEX IF NOT EXISTS idx_platform_users_app_user ON chatbot_platform_users(app_user_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_last_seen ON chatbot_platform_users(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_users_blocked ON chatbot_platform_users(is_blocked) WHERE is_blocked = true;

-- ============================================================
-- TABLE 2: chatbot_platform_conversations
-- Platform-specific conversations
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_platform_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to platform user
  platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

  -- Platform info (denormalized for query efficiency)
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('zalo', 'messenger', 'mobile', 'web')),

  -- Conversation state
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived', 'pending_human')),

  -- Context for AI continuity
  context JSONB DEFAULT '{}',
  -- Example: {"topic": "trading", "user_tier": "FREE", "intent": "pattern_analysis"}

  -- Summary for quick loading
  last_message_preview TEXT,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Stats
  message_count INTEGER DEFAULT 0,
  user_message_count INTEGER DEFAULT 0,
  ai_message_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chatbot_platform_conversations
CREATE INDEX IF NOT EXISTS idx_platform_conv_user ON chatbot_platform_conversations(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_platform_conv_platform ON chatbot_platform_conversations(platform);
CREATE INDEX IF NOT EXISTS idx_platform_conv_status ON chatbot_platform_conversations(status);
CREATE INDEX IF NOT EXISTS idx_platform_conv_last_msg ON chatbot_platform_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_conv_active ON chatbot_platform_conversations(platform_user_id, status) WHERE status = 'active';

-- ============================================================
-- TABLE 3: chatbot_messages
-- Individual messages with token tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  conversation_id UUID NOT NULL REFERENCES chatbot_platform_conversations(id) ON DELETE CASCADE,
  platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'voice', 'image', 'file', 'sticker', 'location')),

  -- Platform message ID (for deduplication)
  platform_message_id VARCHAR(255),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {"voice_duration": 5.2, "image_url": "...", "sticker_id": "..."}

  -- Performance tracking (AI responses only)
  tokens_used INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  model_used VARCHAR(50),

  -- For voice messages
  voice_transcription_id UUID,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chatbot_messages
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_conv ON chatbot_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_user ON chatbot_messages(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_role ON chatbot_messages(role);
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_type ON chatbot_messages(content_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_platform_id ON chatbot_messages(platform_message_id) WHERE platform_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_msg_created ON chatbot_messages(created_at DESC);

-- ============================================================
-- TABLE 4: chatbot_platform_configs
-- Platform credentials and settings (admin only)
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_platform_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Platform identification
  platform VARCHAR(20) NOT NULL UNIQUE CHECK (platform IN ('zalo', 'messenger', 'mobile', 'web')),

  -- Status
  is_enabled BOOLEAN DEFAULT FALSE,

  -- Credentials (encrypted in production)
  config JSONB NOT NULL DEFAULT '{}',
  -- Zalo: {"oa_id": "...", "oa_secret": "...", "access_token": "...", "refresh_token": "..."}
  -- Messenger: {"page_id": "...", "page_access_token": "...", "app_secret": "..."}

  -- Webhook settings
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  webhook_verified_at TIMESTAMPTZ,

  -- AI settings per platform
  ai_config JSONB DEFAULT '{}',
  -- Example: {"model": "gemini-pro", "max_tokens": 1024, "temperature": 0.7}

  -- Rate limits
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 1000,

  -- Tracking
  last_activity_at TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE 5: chatbot_offline_queue
-- Queue for messages when user is offline or API fails
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Target user
  platform_user_id UUID REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform info
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('zalo', 'messenger', 'mobile', 'web')),

  -- Message to deliver
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'notification', 'reminder', 'alert')),
  message JSONB NOT NULL,
  -- Example: {"content": "...", "title": "...", "action_url": "..."}

  -- Processing status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'expired')),

  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,

  -- Priority (higher = more urgent)
  priority INTEGER DEFAULT 0,

  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Indexes for chatbot_offline_queue
CREATE INDEX IF NOT EXISTS idx_offline_queue_user ON chatbot_offline_queue(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_app_user ON chatbot_offline_queue(app_user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON chatbot_offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_pending ON chatbot_offline_queue(status, priority DESC, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_offline_queue_retry ON chatbot_offline_queue(next_retry_at) WHERE status = 'pending' AND retry_count < max_retries;

-- ============================================================
-- TABLE 6: chatbot_voice_transcriptions
-- Store voice message transcriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to message
  message_id UUID REFERENCES chatbot_messages(id) ON DELETE CASCADE,

  -- Audio file info
  audio_url TEXT NOT NULL,
  audio_format VARCHAR(20), -- 'mp3', 'ogg', 'wav', 'm4a'
  audio_size_bytes INTEGER,

  -- Transcription result
  transcription TEXT,
  transcription_status VARCHAR(20) DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),

  -- Metadata
  duration_seconds DECIMAL(10,2),
  language VARCHAR(10) DEFAULT 'vi', -- ISO 639-1
  confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000

  -- Provider info
  provider VARCHAR(50), -- 'whisper', 'google', 'azure'
  provider_response JSONB,

  -- Error tracking
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for chatbot_voice_transcriptions
CREATE INDEX IF NOT EXISTS idx_voice_trans_message ON chatbot_voice_transcriptions(message_id);
CREATE INDEX IF NOT EXISTS idx_voice_trans_status ON chatbot_voice_transcriptions(transcription_status);
CREATE INDEX IF NOT EXISTS idx_voice_trans_pending ON chatbot_voice_transcriptions(created_at) WHERE transcription_status = 'pending';

-- ============================================================
-- Add foreign key from chatbot_messages to voice_transcriptions
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_voice_transcription'
  ) THEN
    ALTER TABLE chatbot_messages
      ADD CONSTRAINT fk_messages_voice_transcription
      FOREIGN KEY (voice_transcription_id)
      REFERENCES chatbot_voice_transcriptions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_platform_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_offline_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: chatbot_platform_users
-- ============================================================

DROP POLICY IF EXISTS "Users can view own platform accounts" ON chatbot_platform_users;
CREATE POLICY "Users can view own platform accounts"
  ON chatbot_platform_users FOR SELECT
  USING (app_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all platform users" ON chatbot_platform_users;
CREATE POLICY "Admins can view all platform users"
  ON chatbot_platform_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "Service can manage platform users" ON chatbot_platform_users;
CREATE POLICY "Service can manage platform users"
  ON chatbot_platform_users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- RLS POLICIES: chatbot_platform_conversations
-- ============================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON chatbot_platform_conversations;
CREATE POLICY "Users can view own conversations"
  ON chatbot_platform_conversations FOR SELECT
  USING (
    platform_user_id IN (
      SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all conversations" ON chatbot_platform_conversations;
CREATE POLICY "Admins can view all conversations"
  ON chatbot_platform_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "Service can manage conversations" ON chatbot_platform_conversations;
CREATE POLICY "Service can manage conversations"
  ON chatbot_platform_conversations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- RLS POLICIES: chatbot_messages
-- ============================================================

DROP POLICY IF EXISTS "Users can view own messages" ON chatbot_messages;
CREATE POLICY "Users can view own messages"
  ON chatbot_messages FOR SELECT
  USING (
    platform_user_id IN (
      SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all messages" ON chatbot_messages;
CREATE POLICY "Admins can view all messages"
  ON chatbot_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "Service can manage messages" ON chatbot_messages;
CREATE POLICY "Service can manage messages"
  ON chatbot_messages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- RLS POLICIES: chatbot_platform_configs (Admin only)
-- ============================================================

DROP POLICY IF EXISTS "Admins can view configs" ON chatbot_platform_configs;
CREATE POLICY "Admins can view configs"
  ON chatbot_platform_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "Admins can manage configs" ON chatbot_platform_configs;
CREATE POLICY "Admins can manage configs"
  ON chatbot_platform_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
    )
  );

DROP POLICY IF EXISTS "Service can manage configs" ON chatbot_platform_configs;
CREATE POLICY "Service can manage configs"
  ON chatbot_platform_configs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- RLS POLICIES: chatbot_offline_queue
-- ============================================================

DROP POLICY IF EXISTS "Users can view own queue" ON chatbot_offline_queue;
CREATE POLICY "Users can view own queue"
  ON chatbot_offline_queue FOR SELECT
  USING (
    app_user_id = auth.uid() OR
    platform_user_id IN (
      SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service can manage queue" ON chatbot_offline_queue;
CREATE POLICY "Service can manage queue"
  ON chatbot_offline_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- RLS POLICIES: chatbot_voice_transcriptions
-- ============================================================

DROP POLICY IF EXISTS "Users can view own transcriptions" ON chatbot_voice_transcriptions;
CREATE POLICY "Users can view own transcriptions"
  ON chatbot_voice_transcriptions FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM chatbot_messages
      WHERE platform_user_id IN (
        SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Service can manage transcriptions" ON chatbot_voice_transcriptions;
CREATE POLICY "Service can manage transcriptions"
  ON chatbot_voice_transcriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_platform_users ON chatbot_platform_users;
CREATE TRIGGER set_timestamp_platform_users
  BEFORE UPDATE ON chatbot_platform_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_platform_conversations ON chatbot_platform_conversations;
CREATE TRIGGER set_timestamp_platform_conversations
  BEFORE UPDATE ON chatbot_platform_conversations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_platform_configs ON chatbot_platform_configs;
CREATE TRIGGER set_timestamp_platform_configs
  BEFORE UPDATE ON chatbot_platform_configs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- TRIGGER: Update conversation stats on new message
-- ============================================================

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_platform_conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    message_count = message_count + 1,
    user_message_count = CASE WHEN NEW.role = 'user' THEN user_message_count + 1 ELSE user_message_count END,
    ai_message_count = CASE WHEN NEW.role = 'assistant' THEN ai_message_count + 1 ELSE ai_message_count END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Also update platform user's last_seen
  UPDATE chatbot_platform_users
  SET last_seen_at = NOW()
  WHERE id = NEW.platform_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON chatbot_messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON chatbot_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================
-- FUNCTION: get_or_create_platform_user
-- ============================================================

CREATE OR REPLACE FUNCTION get_or_create_platform_user(
  p_platform VARCHAR(20),
  p_platform_user_id VARCHAR(255),
  p_display_name VARCHAR(255) DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO chatbot_platform_users (
    platform,
    platform_user_id,
    display_name,
    avatar_url,
    metadata,
    first_seen_at,
    last_seen_at
  ) VALUES (
    p_platform,
    p_platform_user_id,
    COALESCE(p_display_name, 'User'),
    p_avatar_url,
    p_metadata,
    NOW(),
    NOW()
  )
  ON CONFLICT (platform, platform_user_id)
  DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, chatbot_platform_users.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, chatbot_platform_users.avatar_url),
    metadata = chatbot_platform_users.metadata || EXCLUDED.metadata,
    last_seen_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_or_create_conversation
-- ============================================================

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_platform_user_id UUID,
  p_platform VARCHAR(20),
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
BEGIN
  -- Try to find active conversation within last 24 hours
  SELECT id INTO v_conv_id
  FROM chatbot_platform_conversations
  WHERE platform_user_id = p_platform_user_id
    AND platform = p_platform
    AND status = 'active'
    AND last_message_at > NOW() - INTERVAL '24 hours'
  ORDER BY last_message_at DESC
  LIMIT 1;

  -- If no active conversation, create new one
  IF v_conv_id IS NULL THEN
    INSERT INTO chatbot_platform_conversations (
      platform_user_id,
      platform,
      status,
      context,
      started_at,
      last_message_at
    ) VALUES (
      p_platform_user_id,
      p_platform,
      'active',
      p_context,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: save_chatbot_message
-- ============================================================

CREATE OR REPLACE FUNCTION save_chatbot_message(
  p_conversation_id UUID,
  p_platform_user_id UUID,
  p_role VARCHAR(20),
  p_content TEXT,
  p_content_type VARCHAR(20) DEFAULT 'text',
  p_metadata JSONB DEFAULT '{}',
  p_tokens_used INTEGER DEFAULT 0,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_platform_message_id VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO chatbot_messages (
    conversation_id,
    platform_user_id,
    role,
    content,
    content_type,
    metadata,
    tokens_used,
    response_time_ms,
    platform_message_id
  ) VALUES (
    p_conversation_id,
    p_platform_user_id,
    p_role,
    p_content,
    p_content_type,
    p_metadata,
    p_tokens_used,
    p_response_time_ms,
    p_platform_message_id
  )
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: link_platform_user_to_app
-- ============================================================

CREATE OR REPLACE FUNCTION link_platform_user_to_app(
  p_platform_user_id UUID,
  p_app_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE chatbot_platform_users
  SET
    app_user_id = p_app_user_id,
    updated_at = NOW()
  WHERE id = p_platform_user_id
    AND app_user_id IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: queue_offline_message
-- ============================================================

CREATE OR REPLACE FUNCTION queue_offline_message(
  p_platform_user_id UUID,
  p_platform VARCHAR(20),
  p_message JSONB,
  p_message_type VARCHAR(20) DEFAULT 'text',
  p_priority INTEGER DEFAULT 0,
  p_expires_in INTERVAL DEFAULT '7 days'
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO chatbot_offline_queue (
    platform_user_id,
    platform,
    message,
    message_type,
    priority,
    expires_at,
    status
  ) VALUES (
    p_platform_user_id,
    p_platform,
    p_message,
    p_message_type,
    p_priority,
    NOW() + p_expires_in,
    'pending'
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: process_offline_queue
-- ============================================================

CREATE OR REPLACE FUNCTION process_offline_queue(
  p_batch_size INTEGER DEFAULT 100
)
RETURNS SETOF chatbot_offline_queue AS $$
BEGIN
  RETURN QUERY
  UPDATE chatbot_offline_queue
  SET
    status = 'processing',
    processed_at = NOW()
  WHERE id IN (
    SELECT id FROM chatbot_offline_queue
    WHERE status = 'pending'
      AND expires_at > NOW()
      AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    ORDER BY priority DESC, created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: mark_queue_delivered
-- ============================================================

CREATE OR REPLACE FUNCTION mark_queue_delivered(p_queue_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE chatbot_offline_queue
  SET
    status = 'delivered',
    delivered_at = NOW()
  WHERE id = p_queue_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: mark_queue_failed
-- ============================================================

CREATE OR REPLACE FUNCTION mark_queue_failed(
  p_queue_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
BEGIN
  SELECT retry_count, max_retries INTO v_retry_count, v_max_retries
  FROM chatbot_offline_queue
  WHERE id = p_queue_id;

  IF v_retry_count >= v_max_retries - 1 THEN
    UPDATE chatbot_offline_queue
    SET
      status = 'failed',
      last_error = p_error,
      retry_count = retry_count + 1
    WHERE id = p_queue_id;
  ELSE
    UPDATE chatbot_offline_queue
    SET
      status = 'pending',
      last_error = p_error,
      retry_count = retry_count + 1,
      next_retry_at = NOW() + (POWER(2, retry_count + 1) * INTERVAL '1 minute')
    WHERE id = p_queue_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_platform_user_stats
-- ============================================================

CREATE OR REPLACE FUNCTION get_platform_user_stats(p_platform_user_id UUID)
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages BIGINT,
  total_voice_messages BIGINT,
  avg_response_time_ms NUMERIC,
  total_tokens_used BIGINT,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM chatbot_platform_conversations WHERE platform_user_id = p_platform_user_id) AS total_conversations,
    (SELECT COUNT(*) FROM chatbot_messages WHERE platform_user_id = p_platform_user_id) AS total_messages,
    (SELECT COUNT(*) FROM chatbot_messages WHERE platform_user_id = p_platform_user_id AND content_type = 'voice') AS total_voice_messages,
    (SELECT AVG(response_time_ms)::NUMERIC FROM chatbot_messages WHERE platform_user_id = p_platform_user_id AND role = 'assistant' AND response_time_ms IS NOT NULL) AS avg_response_time_ms,
    (SELECT COALESCE(SUM(tokens_used), 0) FROM chatbot_messages WHERE platform_user_id = p_platform_user_id AND role = 'assistant') AS total_tokens_used,
    (SELECT first_seen_at FROM chatbot_platform_users WHERE id = p_platform_user_id) AS first_seen,
    (SELECT last_seen_at FROM chatbot_platform_users WHERE id = p_platform_user_id) AS last_seen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON chatbot_platform_users TO authenticated;
GRANT ALL ON chatbot_platform_conversations TO authenticated;
GRANT ALL ON chatbot_messages TO authenticated;
GRANT ALL ON chatbot_platform_configs TO authenticated;
GRANT ALL ON chatbot_offline_queue TO authenticated;
GRANT ALL ON chatbot_voice_transcriptions TO authenticated;

GRANT EXECUTE ON FUNCTION get_or_create_platform_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION save_chatbot_message TO authenticated;
GRANT EXECUTE ON FUNCTION link_platform_user_to_app TO authenticated;
GRANT EXECUTE ON FUNCTION queue_offline_message TO authenticated;
GRANT EXECUTE ON FUNCTION process_offline_queue TO authenticated;
GRANT EXECUTE ON FUNCTION mark_queue_delivered TO authenticated;
GRANT EXECUTE ON FUNCTION mark_queue_failed TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_user_stats TO authenticated;

-- ============================================================
-- SEED DATA: Platform Configs
-- ============================================================

INSERT INTO chatbot_platform_configs (platform, is_enabled, config, ai_config)
VALUES
  ('zalo', FALSE, '{"oa_id": "", "oa_secret": ""}', '{"model": "gemini-2.0-flash-exp", "max_tokens": 1024}'),
  ('messenger', FALSE, '{"page_id": "", "page_access_token": ""}', '{"model": "gemini-2.0-flash-exp", "max_tokens": 1024}'),
  ('mobile', TRUE, '{"version": "1.0.0"}', '{"model": "gemini-2.0-flash-exp", "max_tokens": 2048}'),
  ('web', TRUE, '{"cors_origins": ["*"]}', '{"model": "gemini-2.0-flash-exp", "max_tokens": 2048}')
ON CONFLICT (platform) DO NOTHING;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE chatbot_platform_users IS 'External platform users (Zalo, Messenger) mapped to app accounts';
COMMENT ON TABLE chatbot_platform_conversations IS 'Chatbot conversations per platform with context';
COMMENT ON TABLE chatbot_messages IS 'Individual messages with token and performance tracking';
COMMENT ON TABLE chatbot_platform_configs IS 'Platform credentials and AI settings (admin only)';
COMMENT ON TABLE chatbot_offline_queue IS 'Queue for offline message delivery with retry logic';
COMMENT ON TABLE chatbot_voice_transcriptions IS 'Voice message transcriptions with status tracking';

COMMENT ON FUNCTION get_or_create_platform_user IS 'Upsert platform user from external platform webhook';
COMMENT ON FUNCTION get_or_create_conversation IS 'Get or create active conversation for platform user';
COMMENT ON FUNCTION save_chatbot_message IS 'Save message and auto-update conversation stats';

-- ============================================================
-- DONE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PHASE 1 Multi-Platform Chatbot Tables Created Successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables: chatbot_platform_users, chatbot_platform_conversations,';
  RAISE NOTICE '        chatbot_messages, chatbot_platform_configs,';
  RAISE NOTICE '        chatbot_offline_queue, chatbot_voice_transcriptions';
  RAISE NOTICE 'Functions: get_or_create_platform_user, get_or_create_conversation,';
  RAISE NOTICE '           save_chatbot_message, queue_offline_message, etc.';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE '============================================================';
END $$;

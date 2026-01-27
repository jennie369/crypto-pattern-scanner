-- =====================================================
-- MESSAGES PRIVACY FEATURES
-- Migration: 20260127
-- Purpose: Add message requests, privacy settings, restrict users, spam detection
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: USER PRIVACY SETTINGS TABLE
-- Lưu trữ cài đặt quyền riêng tư của user
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,

  -- Messaging Privacy
  allow_message_requests BOOLEAN DEFAULT true,    -- Cho phép nhận tin nhắn chờ
  read_receipts_enabled BOOLEAN DEFAULT true,     -- Hiện xác nhận đã đọc
  typing_indicator_enabled BOOLEAN DEFAULT true,  -- Hiện đang nhập...
  online_status_enabled BOOLEAN DEFAULT true,     -- Hiện trạng thái online
  last_seen_enabled BOOLEAN DEFAULT true,         -- Hiện hoạt động lần cuối

  -- Call Privacy
  allow_calls_from TEXT DEFAULT 'everyone' CHECK (allow_calls_from IN (
    'everyone',       -- Tất cả
    'contacts_only',  -- Chỉ người đã chat
    'nobody'          -- Không ai
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user ON public.user_privacy_settings(user_id);

-- RLS Policies for user_privacy_settings
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own privacy settings" ON public.user_privacy_settings;
CREATE POLICY "Users can view own privacy settings"
  ON public.user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view others limited privacy settings" ON public.user_privacy_settings;
CREATE POLICY "Users can view others limited privacy settings"
  ON public.user_privacy_settings FOR SELECT
  USING (true); -- Allow reading others' settings for privacy checks

DROP POLICY IF EXISTS "Users can insert own privacy settings" ON public.user_privacy_settings;
CREATE POLICY "Users can insert own privacy settings"
  ON public.user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own privacy settings" ON public.user_privacy_settings;
CREATE POLICY "Users can update own privacy settings"
  ON public.user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_privacy_settings TO authenticated;

-- =====================================================
-- PART 2: USER CONTACTS TABLE
-- Lưu trữ danh sách contacts (người đã nhắn tin)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',     -- Đang active
    'archived',   -- Đã archive
    'removed'     -- Đã xóa
  )),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_contacts_user ON public.user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_contact ON public.user_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_status ON public.user_contacts(status);

-- RLS Policies for user_contacts
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contacts" ON public.user_contacts;
CREATE POLICY "Users can view own contacts"
  ON public.user_contacts FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = contact_id);

DROP POLICY IF EXISTS "Users can manage own contacts" ON public.user_contacts;
CREATE POLICY "Users can manage own contacts"
  ON public.user_contacts FOR ALL
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_contacts TO authenticated;

-- =====================================================
-- PART 3: MESSAGE REQUESTS TABLE
-- Lưu trữ tin nhắn chờ duyệt từ người lạ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Chờ duyệt
    'accepted',   -- Đã chấp nhận
    'declined',   -- Đã từ chối
    'blocked'     -- Đã chặn
  )),
  message_preview TEXT,           -- Preview tin nhắn đầu tiên
  messages_count INT DEFAULT 1,   -- Số tin nhắn chờ
  wants_to_call BOOLEAN DEFAULT false, -- Người này muốn gọi
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,

  UNIQUE(conversation_id, requester_id, recipient_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_requests_recipient ON public.message_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_requester ON public.message_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_status ON public.message_requests(status);
CREATE INDEX IF NOT EXISTS idx_message_requests_conversation ON public.message_requests(conversation_id);

-- RLS Policies for message_requests
ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their message requests" ON public.message_requests;
CREATE POLICY "Users can view their message requests"
  ON public.message_requests FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can insert message requests" ON public.message_requests;
CREATE POLICY "Users can insert message requests"
  ON public.message_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Recipients can update message requests" ON public.message_requests;
CREATE POLICY "Recipients can update message requests"
  ON public.message_requests FOR UPDATE
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete their message requests" ON public.message_requests;
CREATE POLICY "Users can delete their message requests"
  ON public.message_requests FOR DELETE
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- Grant permissions
GRANT ALL ON public.message_requests TO authenticated;

-- =====================================================
-- PART 4: RESTRICTED USERS TABLE
-- Lưu trữ users bị restrict (silent block)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.restricted_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restricter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restricter_id, restricted_id),
  CONSTRAINT no_self_restrict CHECK (restricter_id != restricted_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restricted_users_restricter ON public.restricted_users(restricter_id);
CREATE INDEX IF NOT EXISTS idx_restricted_users_restricted ON public.restricted_users(restricted_id);

-- RLS Policies for restricted_users
ALTER TABLE public.restricted_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their restrictions" ON public.restricted_users;
CREATE POLICY "Users can view their restrictions"
  ON public.restricted_users FOR SELECT
  USING (auth.uid() = restricter_id);

DROP POLICY IF EXISTS "Users can create restrictions" ON public.restricted_users;
CREATE POLICY "Users can create restrictions"
  ON public.restricted_users FOR INSERT
  WITH CHECK (auth.uid() = restricter_id);

DROP POLICY IF EXISTS "Users can delete their restrictions" ON public.restricted_users;
CREATE POLICY "Users can delete their restrictions"
  ON public.restricted_users FOR DELETE
  USING (auth.uid() = restricter_id);

-- Grant permissions
GRANT ALL ON public.restricted_users TO authenticated;

-- =====================================================
-- PART 5: MESSAGE SPAM TABLE
-- Lưu trữ tin nhắn bị đánh dấu spam
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_spam (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spam_type TEXT NOT NULL CHECK (spam_type IN (
    'auto_detected',  -- Tự động phát hiện
    'user_reported',  -- User báo cáo
    'admin_flagged'   -- Admin đánh dấu
  )),
  spam_reason TEXT,
  confidence_score DECIMAL(5,4) DEFAULT 0, -- 0.0000 to 1.0000
  status TEXT DEFAULT 'flagged' CHECK (status IN (
    'flagged',
    'confirmed',
    'dismissed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, reporter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_spam_conversation ON public.message_spam(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_spam_reporter ON public.message_spam(reporter_id);
CREATE INDEX IF NOT EXISTS idx_message_spam_status ON public.message_spam(status);

-- RLS Policies for message_spam
ALTER TABLE public.message_spam ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their spam reports" ON public.message_spam;
CREATE POLICY "Users can view their spam reports"
  ON public.message_spam FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create spam reports" ON public.message_spam;
CREATE POLICY "Users can create spam reports"
  ON public.message_spam FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can update their spam reports" ON public.message_spam;
CREATE POLICY "Users can update their spam reports"
  ON public.message_spam FOR UPDATE
  USING (auth.uid() = reporter_id);

-- Grant permissions
GRANT ALL ON public.message_spam TO authenticated;

-- =====================================================
-- PART 6: UPDATE MESSAGES TABLE
-- Add new columns for privacy features
-- =====================================================

-- Add is_message_request column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND column_name = 'is_message_request'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN is_message_request BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add is_restricted column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND column_name = 'is_restricted'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN is_restricted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add is_spam column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'messages'
    AND column_name = 'is_spam'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN is_spam BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_messages_is_message_request ON public.messages(is_message_request) WHERE is_message_request = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_restricted ON public.messages(is_restricted) WHERE is_restricted = true;
CREATE INDEX IF NOT EXISTS idx_messages_is_spam ON public.messages(is_spam) WHERE is_spam = true;

-- =====================================================
-- PART 7: HELPER FUNCTIONS
-- =====================================================

-- Function: Check if users are contacts (đã nhắn tin)
CREATE OR REPLACE FUNCTION public.are_users_contacts(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_contacts
    WHERE (user_id = user_a AND contact_id = user_b AND status = 'active')
       OR (user_id = user_b AND contact_id = user_a AND status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is restricted
CREATE OR REPLACE FUNCTION public.is_user_restricted(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restricted_users
    WHERE restricter_id = checker_id AND restricted_id = target_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user privacy settings with defaults
CREATE OR REPLACE FUNCTION public.get_user_privacy_settings(target_user_id UUID)
RETURNS TABLE (
  allow_message_requests BOOLEAN,
  read_receipts_enabled BOOLEAN,
  typing_indicator_enabled BOOLEAN,
  online_status_enabled BOOLEAN,
  last_seen_enabled BOOLEAN,
  allow_calls_from TEXT
) AS $$
DECLARE
  v_settings RECORD;
BEGIN
  SELECT
    ups.allow_message_requests,
    ups.read_receipts_enabled,
    ups.typing_indicator_enabled,
    ups.online_status_enabled,
    ups.last_seen_enabled,
    ups.allow_calls_from
  INTO v_settings
  FROM user_privacy_settings ups
  WHERE ups.user_id = target_user_id;

  -- If no settings found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, true, true, true, true, 'everyone'::TEXT;
  ELSE
    RETURN QUERY SELECT
      COALESCE(v_settings.allow_message_requests, true),
      COALESCE(v_settings.read_receipts_enabled, true),
      COALESCE(v_settings.typing_indicator_enabled, true),
      COALESCE(v_settings.online_status_enabled, true),
      COALESCE(v_settings.last_seen_enabled, true),
      COALESCE(v_settings.allow_calls_from, 'everyone');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get message requests count
CREATE OR REPLACE FUNCTION public.get_message_requests_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM message_requests
    WHERE recipient_id = p_user_id AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Accept message request
CREATE OR REPLACE FUNCTION public.accept_message_request(p_request_id UUID)
RETURNS void AS $$
DECLARE
  v_conversation_id UUID;
  v_requester_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Get request details and verify ownership
  SELECT conversation_id, requester_id, recipient_id
  INTO v_conversation_id, v_requester_id, v_recipient_id
  FROM message_requests
  WHERE id = p_request_id AND recipient_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message request not found or not authorized';
  END IF;

  -- Update request status
  UPDATE message_requests
  SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
  WHERE id = p_request_id;

  -- Add to contacts (both directions)
  INSERT INTO user_contacts (user_id, contact_id, first_message_at)
  VALUES (v_recipient_id, v_requester_id, NOW())
  ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active', last_message_at = NOW();

  INSERT INTO user_contacts (user_id, contact_id, first_message_at)
  VALUES (v_requester_id, v_recipient_id, NOW())
  ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active', last_message_at = NOW();

  -- Update messages to remove request flag
  UPDATE messages
  SET is_message_request = false
  WHERE conversation_id = v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decline message request
CREATE OR REPLACE FUNCTION public.decline_message_request(p_request_id UUID, p_block_user BOOLEAN DEFAULT false)
RETURNS void AS $$
DECLARE
  v_requester_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get request details and verify ownership
  SELECT requester_id, conversation_id
  INTO v_requester_id, v_conversation_id
  FROM message_requests
  WHERE id = p_request_id AND recipient_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message request not found or not authorized';
  END IF;

  -- Update request status
  UPDATE message_requests
  SET status = CASE WHEN p_block_user THEN 'blocked' ELSE 'declined' END,
      declined_at = NOW(),
      updated_at = NOW()
  WHERE id = p_request_id;

  -- Optionally block user
  IF p_block_user THEN
    INSERT INTO blocked_users (blocker_id, blocked_id, reason)
    VALUES (auth.uid(), v_requester_id, 'Blocked from message request')
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
  END IF;

  -- Delete messages in the conversation
  DELETE FROM messages WHERE conversation_id = v_conversation_id;

  -- Delete conversation participants
  DELETE FROM conversation_participants WHERE conversation_id = v_conversation_id;

  -- Delete conversation
  DELETE FROM conversations WHERE id = v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if can call user
CREATE OR REPLACE FUNCTION public.can_call_user(caller_id UUID, callee_id UUID)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_blocked BOOLEAN;
  v_are_contacts BOOLEAN;
  v_call_setting TEXT;
  v_has_pending_request BOOLEAN;
BEGIN
  -- Check if blocked
  SELECT is_user_blocked(caller_id, callee_id) INTO v_blocked;
  IF v_blocked THEN
    RETURN QUERY SELECT false, 'Không thể gọi vì đã bị chặn'::TEXT;
    RETURN;
  END IF;

  -- Check if there's a pending message request
  SELECT EXISTS (
    SELECT 1 FROM message_requests
    WHERE requester_id = caller_id
      AND recipient_id = callee_id
      AND status = 'pending'
  ) INTO v_has_pending_request;

  IF v_has_pending_request THEN
    -- Update wants_to_call flag
    UPDATE message_requests
    SET wants_to_call = true, updated_at = NOW()
    WHERE requester_id = caller_id
      AND recipient_id = callee_id
      AND status = 'pending';

    RETURN QUERY SELECT false, 'Hãy đợi người này chấp nhận tin nhắn của bạn trước khi gọi'::TEXT;
    RETURN;
  END IF;

  -- Get callee's call settings
  SELECT allow_calls_from INTO v_call_setting
  FROM user_privacy_settings
  WHERE user_id = callee_id;

  v_call_setting := COALESCE(v_call_setting, 'everyone');

  -- Check based on setting
  IF v_call_setting = 'nobody' THEN
    RETURN QUERY SELECT false, 'Người này không nhận cuộc gọi'::TEXT;
    RETURN;
  END IF;

  IF v_call_setting = 'contacts_only' THEN
    SELECT are_users_contacts(caller_id, callee_id) INTO v_are_contacts;
    IF NOT v_are_contacts THEN
      RETURN QUERY SELECT false, 'Người này chỉ nhận cuộc gọi từ người đã nhắn tin'::TEXT;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if should create message request
CREATE OR REPLACE FUNCTION public.should_create_message_request(sender_id UUID, recipient_id UUID)
RETURNS TABLE (
  needs_request BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_blocked BOOLEAN;
  v_are_contacts BOOLEAN;
  v_allows_requests BOOLEAN;
  v_is_restricted BOOLEAN;
BEGIN
  -- Check if blocked
  SELECT is_user_blocked(sender_id, recipient_id) INTO v_blocked;
  IF v_blocked THEN
    RETURN QUERY SELECT false, 'blocked'::TEXT;
    RETURN;
  END IF;

  -- Check if restricted
  SELECT is_user_restricted(recipient_id, sender_id) INTO v_is_restricted;
  IF v_is_restricted THEN
    RETURN QUERY SELECT false, 'restricted'::TEXT;
    RETURN;
  END IF;

  -- Check if contacts
  SELECT are_users_contacts(sender_id, recipient_id) INTO v_are_contacts;
  IF v_are_contacts THEN
    RETURN QUERY SELECT false, 'contacts'::TEXT;
    RETURN;
  END IF;

  -- Check if recipient allows message requests
  SELECT allow_message_requests INTO v_allows_requests
  FROM user_privacy_settings
  WHERE user_id = recipient_id;

  IF COALESCE(v_allows_requests, true) THEN
    RETURN QUERY SELECT true, 'needs_request'::TEXT;
  ELSE
    RETURN QUERY SELECT false, 'not_allowed'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create or update message request
CREATE OR REPLACE FUNCTION public.handle_message_request(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_recipient_id UUID,
  p_message_preview TEXT
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Insert or update message request
  INSERT INTO message_requests (
    conversation_id, requester_id, recipient_id,
    message_preview, messages_count, status
  )
  VALUES (
    p_conversation_id, p_sender_id, p_recipient_id,
    LEFT(p_message_preview, 100), 1, 'pending'
  )
  ON CONFLICT (conversation_id, requester_id, recipient_id)
  DO UPDATE SET
    messages_count = message_requests.messages_count + 1,
    message_preview = CASE
      WHEN message_requests.messages_count < 3
      THEN LEFT(p_message_preview, 100)
      ELSE message_requests.message_preview
    END,
    updated_at = NOW()
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get restricted messages
CREATE OR REPLACE FUNCTION public.get_restricted_messages(p_user_id UUID, p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  message_type TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ,
  sender_name TEXT,
  sender_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.attachment_url,
    m.created_at,
    COALESCE(p.full_name, p.display_name, p.username, 'User') AS sender_name,
    p.avatar_url AS sender_avatar
  FROM messages m
  JOIN profiles p ON p.id = m.sender_id
  WHERE m.is_restricted = true
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = m.conversation_id
        AND cp.user_id = p_user_id
    )
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get spam messages
CREATE OR REPLACE FUNCTION public.get_spam_messages(p_user_id UUID, p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  message_type TEXT,
  created_at TIMESTAMPTZ,
  spam_type TEXT,
  spam_reason TEXT,
  sender_name TEXT,
  sender_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.created_at,
    ms.spam_type,
    ms.spam_reason,
    COALESCE(p.full_name, p.display_name, p.username, 'User') AS sender_name,
    p.avatar_url AS sender_avatar
  FROM messages m
  JOIN message_spam ms ON ms.message_id = m.id
  JOIN profiles p ON p.id = m.sender_id
  WHERE ms.reporter_id = p_user_id
    AND ms.status = 'flagged'
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Ensure privacy settings exist for user (upsert)
CREATE OR REPLACE FUNCTION public.ensure_privacy_settings(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_privacy_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update privacy settings
CREATE OR REPLACE FUNCTION public.update_privacy_settings(
  p_user_id UUID,
  p_allow_message_requests BOOLEAN DEFAULT NULL,
  p_read_receipts_enabled BOOLEAN DEFAULT NULL,
  p_typing_indicator_enabled BOOLEAN DEFAULT NULL,
  p_online_status_enabled BOOLEAN DEFAULT NULL,
  p_last_seen_enabled BOOLEAN DEFAULT NULL,
  p_allow_calls_from TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Verify ownership
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to update these settings';
  END IF;

  -- Ensure settings row exists
  PERFORM ensure_privacy_settings(p_user_id);

  -- Update with COALESCE to keep existing values if NULL passed
  UPDATE user_privacy_settings
  SET
    allow_message_requests = COALESCE(p_allow_message_requests, allow_message_requests),
    read_receipts_enabled = COALESCE(p_read_receipts_enabled, read_receipts_enabled),
    typing_indicator_enabled = COALESCE(p_typing_indicator_enabled, typing_indicator_enabled),
    online_status_enabled = COALESCE(p_online_status_enabled, online_status_enabled),
    last_seen_enabled = COALESCE(p_last_seen_enabled, last_seen_enabled),
    allow_calls_from = COALESCE(p_allow_calls_from, allow_calls_from),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 8: TRIGGERS
-- =====================================================

-- Trigger function: Auto-create privacy settings for new users
CREATE OR REPLACE FUNCTION public.auto_create_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (if users table has new inserts)
DROP TRIGGER IF EXISTS create_privacy_settings_trigger ON public.users;
CREATE TRIGGER create_privacy_settings_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_privacy_settings();

-- Trigger function: Update last_message_at in user_contacts
CREATE OR REPLACE FUNCTION public.update_contact_last_message()
RETURNS TRIGGER AS $$
DECLARE
  v_other_user_id UUID;
BEGIN
  -- Get other participant in conversation
  SELECT user_id INTO v_other_user_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  IF v_other_user_id IS NOT NULL THEN
    -- Update last_message_at for both users
    UPDATE user_contacts
    SET last_message_at = NOW()
    WHERE (user_id = NEW.sender_id AND contact_id = v_other_user_id)
       OR (user_id = v_other_user_id AND contact_id = NEW.sender_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_contact_last_message_trigger ON public.messages;
CREATE TRIGGER update_contact_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_last_message();

-- =====================================================
-- PART 9: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.are_users_contacts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_restricted(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_privacy_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_message_requests_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_message_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_message_request(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_call_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.should_create_message_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_message_request(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_restricted_messages(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_spam_messages(UUID, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_privacy_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_privacy_settings(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO authenticated;

-- =====================================================
-- PART 10: VERIFY & NOTIFY
-- =====================================================

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- Verify tables created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'user_privacy_settings',
      'user_contacts',
      'message_requests',
      'restricted_users',
      'message_spam'
    );

  IF table_count = 5 THEN
    RAISE NOTICE '✅ SUCCESS: All 5 privacy tables created';
    RAISE NOTICE '   - user_privacy_settings';
    RAISE NOTICE '   - user_contacts';
    RAISE NOTICE '   - message_requests';
    RAISE NOTICE '   - restricted_users';
    RAISE NOTICE '   - message_spam';
    RAISE NOTICE '🔐 RLS policies enabled';
    RAISE NOTICE '⚡ Helper functions created';
    RAISE NOTICE '🔄 Triggers configured';
  ELSE
    RAISE WARNING '⚠️  Only % tables created. Expected 5.', table_count;
  END IF;
END $$;

-- Comments
COMMENT ON TABLE public.user_privacy_settings IS 'User privacy preferences for messaging and calls';
COMMENT ON TABLE public.user_contacts IS 'Track users who have messaged each other';
COMMENT ON TABLE public.message_requests IS 'Pending message requests from strangers';
COMMENT ON TABLE public.restricted_users IS 'Silently restricted users (soft block)';
COMMENT ON TABLE public.message_spam IS 'Reported and detected spam messages';

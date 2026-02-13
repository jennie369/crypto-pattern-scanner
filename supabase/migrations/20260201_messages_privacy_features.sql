-- =====================================================
-- MESSAGES PRIVACY FEATURES
-- Migration: 20260201
-- =====================================================

-- 1. USER PRIVACY SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Messaging Privacy
  allow_message_requests BOOLEAN DEFAULT true,
  read_receipts_enabled BOOLEAN DEFAULT true,
  typing_indicator_enabled BOOLEAN DEFAULT true,
  online_status_enabled BOOLEAN DEFAULT true,
  last_seen_enabled BOOLEAN DEFAULT true,

  -- Call Privacy
  allow_calls_from TEXT DEFAULT 'everyone' CHECK (allow_calls_from IN (
    'everyone',
    'contacts_only',
    'nobody'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER CONTACTS TABLE (Track who has chatted with whom)
CREATE TABLE IF NOT EXISTS public.user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'archived',
    'removed'
  )),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- 3. MESSAGE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'accepted',
    'declined',
    'blocked'
  )),
  message_preview TEXT,
  messages_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,

  UNIQUE(conversation_id, requester_id, recipient_id)
);

-- 4. RESTRICTED USERS TABLE (Silent block)
CREATE TABLE IF NOT EXISTS public.restricted_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restricter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restricter_id, restricted_id),
  CONSTRAINT no_self_restrict CHECK (restricter_id != restricted_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_recipient ON message_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_status ON message_requests(status);
CREATE INDEX IF NOT EXISTS idx_restricted_users_restricter ON restricted_users(restricter_id);
CREATE INDEX IF NOT EXISTS idx_restricted_users_restricted ON restricted_users(restricted_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_user ON user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_contact ON user_contacts(contact_id);

-- Add new columns to messages table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_message_request') THEN
    ALTER TABLE messages ADD COLUMN is_message_request BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_restricted') THEN
    ALTER TABLE messages ADD COLUMN is_restricted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- RLS POLICIES
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE restricted_users ENABLE ROW LEVEL SECURITY;

-- Privacy Settings Policies
DROP POLICY IF EXISTS "Users can view own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can view own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can insert own privacy settings"
  ON user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can update own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow reading other users' privacy settings for features like online status
DROP POLICY IF EXISTS "Users can view others privacy settings" ON user_privacy_settings;
CREATE POLICY "Users can view others privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (true);

-- User Contacts Policies
DROP POLICY IF EXISTS "Users can view own contacts" ON user_contacts;
CREATE POLICY "Users can view own contacts"
  ON user_contacts FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = contact_id);

DROP POLICY IF EXISTS "Users can manage own contacts" ON user_contacts;
CREATE POLICY "Users can manage own contacts"
  ON user_contacts FOR ALL
  USING (auth.uid() = user_id);

-- Message Requests Policies
DROP POLICY IF EXISTS "Users can view their message requests" ON message_requests;
CREATE POLICY "Users can view their message requests"
  ON message_requests FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can insert message requests" ON message_requests;
CREATE POLICY "Users can insert message requests"
  ON message_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Recipients can update message requests" ON message_requests;
CREATE POLICY "Recipients can update message requests"
  ON message_requests FOR UPDATE
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete their requests" ON message_requests;
CREATE POLICY "Users can delete their requests"
  ON message_requests FOR DELETE
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

-- Restricted Users Policies
DROP POLICY IF EXISTS "Users can view their restrictions" ON restricted_users;
CREATE POLICY "Users can view their restrictions"
  ON restricted_users FOR SELECT
  USING (auth.uid() = restricter_id);

DROP POLICY IF EXISTS "Users can create restrictions" ON restricted_users;
CREATE POLICY "Users can create restrictions"
  ON restricted_users FOR INSERT
  WITH CHECK (auth.uid() = restricter_id);

DROP POLICY IF EXISTS "Users can delete their restrictions" ON restricted_users;
CREATE POLICY "Users can delete their restrictions"
  ON restricted_users FOR DELETE
  USING (auth.uid() = restricter_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if users are contacts (have chatted before)
CREATE OR REPLACE FUNCTION are_users_contacts(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_contacts
    WHERE (user_id = user_a AND contact_id = user_b AND status = 'active')
       OR (user_id = user_b AND contact_id = user_a AND status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is restricted
CREATE OR REPLACE FUNCTION is_user_restricted(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restricted_users
    WHERE restricter_id = checker_id AND restricted_id = target_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user privacy settings with defaults
CREATE OR REPLACE FUNCTION get_user_privacy_settings(target_user_id UUID)
RETURNS TABLE (
  allow_message_requests BOOLEAN,
  read_receipts_enabled BOOLEAN,
  typing_indicator_enabled BOOLEAN,
  online_status_enabled BOOLEAN,
  last_seen_enabled BOOLEAN,
  allow_calls_from TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ups.allow_message_requests, true),
    COALESCE(ups.read_receipts_enabled, true),
    COALESCE(ups.typing_indicator_enabled, true),
    COALESCE(ups.online_status_enabled, true),
    COALESCE(ups.last_seen_enabled, true),
    COALESCE(ups.allow_calls_from, 'everyone')
  FROM user_privacy_settings ups
  WHERE ups.user_id = target_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT true, true, true, true, true, 'everyone'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if can call user
CREATE OR REPLACE FUNCTION can_call_user(caller_id UUID, callee_id UUID)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_blocked BOOLEAN;
  v_are_contacts BOOLEAN;
  v_call_setting TEXT;
BEGIN
  -- Check if blocked
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = callee_id AND blocked_id = caller_id
  ) INTO v_blocked;

  IF v_blocked THEN
    RETURN QUERY SELECT false, 'User is blocked'::TEXT;
    RETURN;
  END IF;

  -- Get callee's call settings
  SELECT ups.allow_calls_from INTO v_call_setting
  FROM user_privacy_settings ups
  WHERE ups.user_id = callee_id;

  v_call_setting := COALESCE(v_call_setting, 'everyone');

  IF v_call_setting = 'nobody' THEN
    RETURN QUERY SELECT false, 'User does not accept calls'::TEXT;
    RETURN;
  END IF;

  IF v_call_setting = 'contacts_only' THEN
    SELECT are_users_contacts(caller_id, callee_id) INTO v_are_contacts;
    IF NOT v_are_contacts THEN
      RETURN QUERY SELECT false, 'User only accepts calls from contacts'::TEXT;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get message requests count for a user
CREATE OR REPLACE FUNCTION get_message_requests_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM message_requests
    WHERE recipient_id = p_user_id AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_privacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_privacy_settings_updated_at ON user_privacy_settings;
CREATE TRIGGER trigger_update_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_privacy_settings_updated_at();

-- Trigger to auto-add contacts when message request is accepted
CREATE OR REPLACE FUNCTION on_message_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Add both users as contacts
    INSERT INTO user_contacts (user_id, contact_id)
    VALUES (NEW.recipient_id, NEW.requester_id)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active', last_message_at = NOW();

    INSERT INTO user_contacts (user_id, contact_id)
    VALUES (NEW.requester_id, NEW.recipient_id)
    ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active', last_message_at = NOW();

    NEW.accepted_at = NOW();
  END IF;

  IF NEW.status IN ('declined', 'blocked') AND OLD.status = 'pending' THEN
    NEW.declined_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_on_message_request_accepted ON message_requests;
CREATE TRIGGER trigger_on_message_request_accepted
  BEFORE UPDATE ON message_requests
  FOR EACH ROW
  EXECUTE FUNCTION on_message_request_accepted();

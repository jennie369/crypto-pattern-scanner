-- VoIP Push Support Migration
-- Adds voip_token column for iOS PushKit tokens
-- Created: 2026-01-31

-- ========== Add voip_token column ==========

-- Add voip_token column to user_push_tokens if not exists
ALTER TABLE user_push_tokens
ADD COLUMN IF NOT EXISTS voip_token TEXT;

COMMENT ON COLUMN user_push_tokens.voip_token IS 'iOS VoIP PushKit token for incoming call notifications';

-- ========== Add index for VoIP token lookups ==========

-- Index for faster VoIP token lookups
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_voip_active
ON user_push_tokens(user_id)
WHERE voip_token IS NOT NULL AND is_active = true;

-- ========== Function to update VoIP token ==========

-- Function for updating VoIP token specifically
CREATE OR REPLACE FUNCTION update_voip_token(
  p_user_id UUID,
  p_voip_token TEXT,
  p_platform TEXT DEFAULT 'ios'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert the VoIP token
  INSERT INTO user_push_tokens (user_id, voip_token, platform, is_active, updated_at)
  VALUES (p_user_id, p_voip_token, p_platform, true, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    voip_token = EXCLUDED.voip_token,
    platform = EXCLUDED.platform,
    is_active = true,
    updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_voip_token(UUID, TEXT, TEXT) TO authenticated;

-- ========== Add notification preferences for calls ==========

-- Add call notification preferences if the columns don't exist
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS incoming_calls BOOLEAN DEFAULT true;

ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS missed_calls BOOLEAN DEFAULT true;

-- ========== Summary ==========

-- This migration adds:
-- 1. voip_token column to user_push_tokens table
-- 2. Index for faster VoIP token lookups
-- 3. Function for updating VoIP tokens
-- 4. Call notification preferences

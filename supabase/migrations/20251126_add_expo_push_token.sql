-- GEM Platform - Add expo_push_token to users table
-- For mobile push notifications via Expo

-- Add expo_push_token column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'expo_push_token'
  ) THEN
    ALTER TABLE users ADD COLUMN expo_push_token TEXT;
    COMMENT ON COLUMN users.expo_push_token IS 'Expo Push Token for mobile notifications';
  END IF;
END $$;

-- Add notification_settings column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE users ADD COLUMN notification_settings JSONB DEFAULT '{
      "orderUpdates": true,
      "promotions": true,
      "priceAlerts": true,
      "patternAlerts": true,
      "tradeAlerts": true,
      "forumLikes": true,
      "forumComments": true,
      "forumFollows": true,
      "systemAlerts": true,
      "partnershipAlerts": true
    }'::jsonb;
    COMMENT ON COLUMN users.notification_settings IS 'User notification preferences';
  END IF;
END $$;

-- Create function to update expo push token
CREATE OR REPLACE FUNCTION update_expo_push_token(
  user_id_param UUID,
  token_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET
    expo_push_token = token_param,
    updated_at = NOW()
  WHERE id = user_id_param;

  RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_expo_push_token TO authenticated;

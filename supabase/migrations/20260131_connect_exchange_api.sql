-- =====================================================
-- Connect Exchange API - RPC Function
-- Date: 2026-01-31
-- Description: Securely save encrypted API keys
-- =====================================================

-- Function to connect exchange API
CREATE OR REPLACE FUNCTION connect_exchange_api(
  p_user_id UUID,
  p_exchange VARCHAR(50),
  p_api_key TEXT,
  p_api_secret TEXT,
  p_permissions TEXT[] DEFAULT ARRAY['read'],
  p_passphrase TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  account_record user_exchange_accounts%ROWTYPE;
  result_id UUID;
BEGIN
  -- Check if account exists
  SELECT * INTO account_record
  FROM user_exchange_accounts
  WHERE user_id = p_user_id AND exchange = p_exchange;

  IF account_record.id IS NOT NULL THEN
    -- Update existing account
    UPDATE user_exchange_accounts SET
      api_key_encrypted = p_api_key,
      api_secret_encrypted = p_api_secret,
      api_permissions = to_jsonb(p_permissions),
      api_connected_at = NOW(),
      api_last_tested_at = NOW(),
      api_test_status = 'success',
      api_error_message = NULL,
      metadata = CASE
        WHEN p_passphrase IS NOT NULL THEN jsonb_build_object('passphrase_encrypted', p_passphrase)
        ELSE '{}'::jsonb
      END,
      status = 'active',
      updated_at = NOW()
    WHERE id = account_record.id
    RETURNING id INTO result_id;

    RETURN json_build_object(
      'success', true,
      'action', 'updated',
      'account_id', result_id
    );
  ELSE
    -- Create new account
    INSERT INTO user_exchange_accounts (
      user_id,
      exchange,
      api_key_encrypted,
      api_secret_encrypted,
      api_permissions,
      api_connected_at,
      api_last_tested_at,
      api_test_status,
      status,
      metadata
    ) VALUES (
      p_user_id,
      p_exchange,
      p_api_key,
      p_api_secret,
      to_jsonb(p_permissions),
      NOW(),
      NOW(),
      'success',
      'active',
      CASE
        WHEN p_passphrase IS NOT NULL THEN jsonb_build_object('passphrase_encrypted', p_passphrase)
        ELSE '{}'::jsonb
      END
    )
    RETURNING id INTO result_id;

    RETURN json_build_object(
      'success', true,
      'action', 'created',
      'account_id', result_id
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION connect_exchange_api TO authenticated;

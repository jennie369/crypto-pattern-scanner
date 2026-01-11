-- =====================================================
-- EMAIL VERIFICATION SYSTEM FOR ORDER LINKING
-- Date: 2025-12-28
-- Purpose: Secure email verification before linking orders
-- =====================================================

-- 1. Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL, -- 6-digit OTP
  purpose TEXT NOT NULL DEFAULT 'link_email', -- 'link_email' or 'link_order'
  order_number TEXT, -- For order linking verification

  -- Security
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  is_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  verified_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_token CHECK (length(token) = 6)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_purpose ON email_verification_tokens(purpose);

-- 2. Enable RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can only view their own tokens
CREATE POLICY "Users view own tokens" ON email_verification_tokens
FOR SELECT USING (auth.uid() = user_id);

-- Users can create tokens for themselves
CREATE POLICY "Users create own tokens" ON email_verification_tokens
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens (for attempts count)
CREATE POLICY "Users update own tokens" ON email_verification_tokens
FOR UPDATE USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access tokens" ON email_verification_tokens
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Add verified_emails to profiles (emails that have been verified)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verified_linked_emails'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verified_linked_emails TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added verified_linked_emails column to profiles';
  END IF;
END $$;

-- 5. Create function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to request email verification
CREATE OR REPLACE FUNCTION request_email_verification(
  p_user_id UUID,
  p_email TEXT,
  p_purpose TEXT DEFAULT 'link_email',
  p_order_number TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, token_id UUID, message TEXT) AS $$
DECLARE
  v_token TEXT;
  v_token_id UUID;
  v_existing_count INTEGER;
  v_rate_limit_count INTEGER;
BEGIN
  -- 1. Check rate limiting (max 5 requests per hour per email)
  SELECT COUNT(*) INTO v_rate_limit_count
  FROM email_verification_tokens
  WHERE email = LOWER(p_email)
    AND user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_rate_limit_count >= 5 THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 giờ.'::TEXT;
    RETURN;
  END IF;

  -- 2. Check if email is already verified for this user
  IF p_purpose = 'link_email' THEN
    SELECT COUNT(*) INTO v_existing_count
    FROM profiles
    WHERE id = p_user_id
      AND (
        email = LOWER(p_email)
        OR LOWER(p_email) = ANY(COALESCE(verified_linked_emails, '{}'))
      );

    IF v_existing_count > 0 THEN
      RETURN QUERY SELECT FALSE, NULL::UUID, 'Email này đã được liên kết với tài khoản của bạn.'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- 3. Invalidate any existing tokens for this email + user
  UPDATE email_verification_tokens
  SET expires_at = NOW()
  WHERE user_id = p_user_id
    AND email = LOWER(p_email)
    AND is_verified = FALSE
    AND expires_at > NOW();

  -- 4. Generate new OTP
  v_token := generate_otp();

  -- 5. Create new token
  INSERT INTO email_verification_tokens (
    user_id,
    email,
    token,
    purpose,
    order_number
  ) VALUES (
    p_user_id,
    LOWER(p_email),
    v_token,
    p_purpose,
    p_order_number
  )
  RETURNING id INTO v_token_id;

  -- 6. Return success (token will be sent via Edge Function)
  RETURN QUERY SELECT TRUE, v_token_id, v_token;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_email_otp(
  p_user_id UUID,
  p_email TEXT,
  p_otp TEXT,
  p_purpose TEXT DEFAULT 'link_email'
)
RETURNS TABLE(success BOOLEAN, message TEXT, order_number TEXT) AS $$
DECLARE
  v_token_record RECORD;
  v_order_number TEXT;
BEGIN
  -- 1. Find the token
  SELECT * INTO v_token_record
  FROM email_verification_tokens
  WHERE user_id = p_user_id
    AND email = LOWER(p_email)
    AND purpose = p_purpose
    AND is_verified = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- 2. Check if token exists
  IF v_token_record IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Mã OTP không hợp lệ hoặc đã hết hạn.'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- 3. Check attempts
  IF v_token_record.attempts >= v_token_record.max_attempts THEN
    -- Invalidate token
    UPDATE email_verification_tokens
    SET expires_at = NOW()
    WHERE id = v_token_record.id;

    RETURN QUERY SELECT FALSE, 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới.'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- 4. Increment attempts
  UPDATE email_verification_tokens
  SET attempts = attempts + 1
  WHERE id = v_token_record.id;

  -- 5. Verify OTP
  IF v_token_record.token != p_otp THEN
    RETURN QUERY SELECT FALSE,
      FORMAT('Mã OTP không đúng. Còn %s lần thử.', v_token_record.max_attempts - v_token_record.attempts - 1)::TEXT,
      NULL::TEXT;
    RETURN;
  END IF;

  -- 6. Mark as verified
  UPDATE email_verification_tokens
  SET is_verified = TRUE, verified_at = NOW()
  WHERE id = v_token_record.id;

  -- 7. Get order number if linking order
  v_order_number := v_token_record.order_number;

  -- 8. If purpose is link_email, add to verified_linked_emails
  IF p_purpose = 'link_email' THEN
    UPDATE profiles
    SET
      linked_emails = array_append(
        COALESCE(linked_emails, '{}'),
        LOWER(p_email)
      ),
      verified_linked_emails = array_append(
        COALESCE(verified_linked_emails, '{}'),
        LOWER(p_email)
      )
    WHERE id = p_user_id
      AND NOT (LOWER(p_email) = ANY(COALESCE(linked_emails, '{}')));
  END IF;

  RETURN QUERY SELECT TRUE, 'Xác thực thành công!'::TEXT, v_order_number;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to link order after verification
CREATE OR REPLACE FUNCTION link_order_after_verification(
  p_user_id UUID,
  p_email TEXT,
  p_order_number TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_order RECORD;
  v_is_verified BOOLEAN;
BEGIN
  -- 1. Check if email is verified for this user
  SELECT EXISTS (
    SELECT 1 FROM email_verification_tokens
    WHERE user_id = p_user_id
      AND email = LOWER(p_email)
      AND purpose IN ('link_email', 'link_order')
      AND is_verified = TRUE
      AND verified_at > NOW() - INTERVAL '30 minutes'
  ) INTO v_is_verified;

  -- Also check verified_linked_emails
  IF NOT v_is_verified THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = p_user_id
        AND (
          email = LOWER(p_email)
          OR LOWER(p_email) = ANY(COALESCE(verified_linked_emails, '{}'))
        )
    ) INTO v_is_verified;
  END IF;

  IF NOT v_is_verified THEN
    RETURN QUERY SELECT FALSE, 'Vui lòng xác thực email trước khi liên kết đơn hàng.'::TEXT;
    RETURN;
  END IF;

  -- 2. Find order
  SELECT * INTO v_order
  FROM shopify_orders
  WHERE order_number = p_order_number
    AND email = LOWER(p_email);

  IF v_order IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Không tìm thấy đơn hàng với số đơn và email này.'::TEXT;
    RETURN;
  END IF;

  -- 3. Check if already linked to this user
  IF v_order.user_id = p_user_id THEN
    RETURN QUERY SELECT TRUE, 'Đơn hàng đã được liên kết với tài khoản của bạn.'::TEXT;
    RETURN;
  END IF;

  -- 4. Update order's user_id
  UPDATE shopify_orders
  SET user_id = p_user_id
  WHERE id = v_order.id;

  -- 5. Add email to linked_emails if not already
  UPDATE profiles
  SET
    linked_emails = array_append(
      COALESCE(linked_emails, '{}'),
      LOWER(p_email)
    ),
    verified_linked_emails = array_append(
      COALESCE(verified_linked_emails, '{}'),
      LOWER(p_email)
    )
  WHERE id = p_user_id
    AND NOT (LOWER(p_email) = ANY(COALESCE(linked_emails, '{}')));

  RETURN QUERY SELECT TRUE, 'Đã liên kết đơn hàng thành công!'::TEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_tokens
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_verification_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION request_email_verification TO authenticated;
GRANT EXECUTE ON FUNCTION verify_email_otp TO authenticated;
GRANT EXECUTE ON FUNCTION link_order_after_verification TO authenticated;

-- Done
SELECT 'Email verification system created successfully!' as result;

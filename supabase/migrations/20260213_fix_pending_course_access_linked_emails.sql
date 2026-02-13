-- =====================================================
-- FIX: apply_all_pending_purchases() + verify_email_otp()
-- Date: 2026-02-13
-- =====================================================
-- BUG 1: apply_pending_course_access section only matches by primary email (v_user_email)
--         instead of ALL emails (v_all_emails) including linked_emails
-- BUG 2: verify_email_otp() does NOT call apply_all_pending_purchases() after
--         successfully verifying a new email, so pending purchases from the
--         newly linked email are not claimed automatically
-- =====================================================

-- =====================================================
-- FIX 1: Recreate apply_all_pending_purchases() with linked_emails support for course_access
-- =====================================================
CREATE OR REPLACE FUNCTION apply_all_pending_purchases(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier_result JSONB;
  v_gem_result JSONB;
  v_course_result JSONB;
  v_user_email TEXT;
  v_linked_emails TEXT[];
  v_all_emails TEXT[];
  v_course_applied INTEGER := 0;
BEGIN
  -- Validate user exists
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Get linked emails (safely) for course access matching
  BEGIN
    SELECT COALESCE(linked_emails, '{}') INTO v_linked_emails
    FROM profiles WHERE id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_linked_emails := '{}';
  END;

  -- Combine primary + linked emails
  v_all_emails := array_append(COALESCE(v_linked_emails, '{}'), v_user_email);

  -- Apply pending tier upgrades (already uses linked_emails internally)
  BEGIN
    v_tier_result := apply_pending_tier_upgrades(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    v_tier_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  -- Apply pending gem credits (already uses linked_emails internally)
  BEGIN
    v_gem_result := claim_pending_gem_credits(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    v_gem_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  -- Apply pending course access - NOW USES v_all_emails (FIX for BUG 1)
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_course_access') THEN
      -- Mark matching pending records as applied using ALL emails (primary + linked)
      UPDATE pending_course_access
      SET
        applied = true,
        applied_user_id = p_user_id,
        applied_at = NOW()
      WHERE email = ANY(v_all_emails)
      AND applied = false;

      GET DIAGNOSTICS v_course_applied = ROW_COUNT;

      -- Create course enrollments for newly applied records
      IF v_course_applied > 0 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        INSERT INTO course_enrollments (user_id, course_id, access_type, enrolled_at, metadata)
        SELECT
          p_user_id,
          course_id,
          'shopify_purchase',
          NOW(),
          jsonb_build_object('from_pending', true, 'shopify_order_id', shopify_order_id)
        FROM pending_course_access
        WHERE applied_user_id = p_user_id
        AND applied_at >= NOW() - INTERVAL '1 minute'
        ON CONFLICT (user_id, course_id) DO NOTHING;
      END IF;

      v_course_result := jsonb_build_object(
        'success', true,
        'applied_count', v_course_applied,
        'emails_checked', v_all_emails
      );
    ELSE
      v_course_result := jsonb_build_object('success', true, 'message', 'Table not found');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_course_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'success', true,
    'tier_upgrades', v_tier_result,
    'gem_credits', v_gem_result,
    'course_access', v_course_result
  );
END;
$$;

-- =====================================================
-- FIX 2: Recreate verify_email_otp() to auto-call apply_all_pending_purchases()
-- after successfully verifying a new email
-- =====================================================
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
  v_pending_result JSONB;
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

  -- 9. If purpose is link_order, also add to linked arrays
  IF p_purpose = 'link_order' THEN
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

  -- 10. FIX BUG 2: Auto-apply ALL pending purchases after email verification
  -- This ensures pending tiers, gems, AND courses from the newly linked email
  -- are claimed immediately without waiting for next login
  BEGIN
    v_pending_result := apply_all_pending_purchases(p_user_id);
    IF v_pending_result IS NOT NULL AND (v_pending_result->>'success')::boolean THEN
      RAISE NOTICE '[verify_email_otp] Auto-applied pending purchases for user % after verifying email %: %',
        p_user_id, p_email, v_pending_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Non-blocking: don't fail OTP verification if pending application fails
    RAISE NOTICE '[verify_email_otp] Failed to auto-apply pending purchases: %', SQLERRM;
  END;

  RETURN QUERY SELECT TRUE, 'Xác thực thành công!'::TEXT, v_order_number;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIX 2b: Also update link_order_after_verification()
-- to call apply_all_pending_purchases() after linking
-- =====================================================
CREATE OR REPLACE FUNCTION link_order_after_verification(
  p_user_id UUID,
  p_email TEXT,
  p_order_number TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_order RECORD;
  v_is_verified BOOLEAN;
  v_pending_result JSONB;
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

  -- 6. FIX: Auto-apply pending purchases after order linking
  BEGIN
    v_pending_result := apply_all_pending_purchases(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[link_order_after_verification] Failed to auto-apply pending: %', SQLERRM;
  END;

  RETURN QUERY SELECT TRUE, 'Đã liên kết đơn hàng thành công!'::TEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Re-grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO service_role;
GRANT EXECUTE ON FUNCTION verify_email_otp TO authenticated;
GRANT EXECUTE ON FUNCTION link_order_after_verification TO authenticated;

-- =====================================================
-- Verification query
-- =====================================================
SELECT 'Migration complete! Fixed:' as status,
  '1. apply_all_pending_purchases() now uses linked_emails for course_access' as fix_1,
  '2. verify_email_otp() now auto-calls apply_all_pending_purchases() after verification' as fix_2,
  '3. link_order_after_verification() now auto-calls apply_all_pending_purchases() after linking' as fix_3;

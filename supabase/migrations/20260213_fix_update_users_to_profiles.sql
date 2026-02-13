-- =====================================================
-- FIX: UPDATE users SET → UPDATE profiles SET
-- Date: 2026-02-13
-- Team E — Cross-team critical finding from RLS audit
-- =====================================================
--
-- ROOT CAUSE:
-- apply_pending_tier_upgrades() and award_level_badge() both write to
-- `UPDATE users SET` — but the app reads from `profiles` table.
-- Result: pre-signup tier upgrades and badge awards silently fail or
-- write to wrong table, never reflected in the user's actual profile.
--
-- AFFECTED FUNCTIONS:
-- 1. apply_pending_tier_upgrades(UUID) — 3 UPDATE users SET statements
-- 2. award_level_badge(UUID) — 1 UPDATE users SET statement
--
-- SCOPE: These are SECURITY DEFINER functions called from:
-- - apply_all_pending_purchases() → called on SIGNED_IN
-- - verify_email_otp() → called after email verification
-- - link_order_after_verification() → called after order linking
-- - auto-award-badges edge function → triggered by user_stats changes
-- =====================================================

-- =====================================================
-- FIX 1: apply_pending_tier_upgrades — UPDATE users → UPDATE profiles
-- =====================================================
CREATE OR REPLACE FUNCTION apply_pending_tier_upgrades(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_linked_emails TEXT[];
  v_all_emails TEXT[];
  v_pending RECORD;
  v_applied_count INTEGER := 0;
  v_expiry_date TIMESTAMPTZ;
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_tier_upgrades') THEN
    RETURN jsonb_build_object('success', true, 'applied_count', 0, 'message', 'Table not found');
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Get linked emails (safely)
  BEGIN
    SELECT COALESCE(linked_emails, '{}') INTO v_linked_emails
    FROM profiles WHERE id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_linked_emails := '{}';
  END;

  -- Combine all emails
  v_all_emails := array_append(COALESCE(v_linked_emails, '{}'), v_user_email);

  -- Loop through pending tier upgrades
  FOR v_pending IN
    SELECT id, product_type, tier_purchased, bundle_scanner_tier, bundle_chatbot_tier,
           bundle_duration_months, amount, partner_id
    FROM pending_tier_upgrades
    WHERE email = ANY(v_all_emails)
    AND applied = false
  LOOP
    -- Calculate expiry date
    IF v_pending.bundle_duration_months IS NOT NULL THEN
      v_expiry_date := NOW() + (v_pending.bundle_duration_months || ' months')::INTERVAL;
    ELSE
      v_expiry_date := NOW() + INTERVAL '1 month';
    END IF;

    -- FIX: Apply tier upgrade to PROFILES table (was incorrectly targeting 'users')
    IF v_pending.product_type = 'course' THEN
      UPDATE profiles SET
        course_tier = v_pending.tier_purchased,
        course_tier_expires_at = v_expiry_date,
        scanner_tier = COALESCE(v_pending.bundle_scanner_tier, scanner_tier),
        scanner_tier_expires_at = CASE
          WHEN v_pending.bundle_scanner_tier IS NOT NULL THEN v_expiry_date
          ELSE scanner_tier_expires_at
        END,
        chatbot_tier = COALESCE(v_pending.bundle_chatbot_tier, chatbot_tier),
        chatbot_tier_expires_at = CASE
          WHEN v_pending.bundle_chatbot_tier IS NOT NULL THEN v_expiry_date
          ELSE chatbot_tier_expires_at
        END,
        tier = v_pending.tier_purchased,
        tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;

    ELSIF v_pending.product_type = 'scanner' THEN
      UPDATE profiles SET
        scanner_tier = v_pending.tier_purchased,
        scanner_tier_expires_at = v_expiry_date,
        tier = v_pending.tier_purchased,
        tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;

    ELSIF v_pending.product_type = 'chatbot' THEN
      UPDATE profiles SET
        chatbot_tier = v_pending.tier_purchased,
        chatbot_tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    -- Mark as applied
    UPDATE pending_tier_upgrades SET
      applied = true,
      applied_at = NOW(),
      applied_user_id = p_user_id,
      updated_at = NOW()
    WHERE id = v_pending.id;

    v_applied_count := v_applied_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'applied_count', v_applied_count,
    'message', CASE WHEN v_applied_count > 0
      THEN 'Applied ' || v_applied_count || ' pending tier upgrades'
      ELSE 'No pending tier upgrades found'
    END
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- FIX 2: award_level_badge — UPDATE users → UPDATE profiles
-- =====================================================
CREATE OR REPLACE FUNCTION award_level_badge(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_win_rate NUMERIC;
  v_level_badge TEXT;
BEGIN
  -- Get current win rate
  SELECT win_rate INTO v_win_rate
  FROM user_stats
  WHERE user_id = p_user_id;

  -- Determine badge
  IF v_win_rate >= 95 THEN
    v_level_badge := 'diamond';
  ELSIF v_win_rate >= 85 THEN
    v_level_badge := 'platinum';
  ELSIF v_win_rate >= 75 THEN
    v_level_badge := 'gold';
  ELSIF v_win_rate >= 60 THEN
    v_level_badge := 'silver';
  ELSE
    v_level_badge := 'bronze';
  END IF;

  -- FIX: Update PROFILES (was incorrectly targeting 'users')
  UPDATE profiles
  SET level_badge = v_level_badge
  WHERE id = p_user_id;

  RETURN v_level_badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Re-grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO authenticated;
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO service_role;
GRANT EXECUTE ON FUNCTION award_level_badge TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Migration complete! Fixed:' as status,
  '1. apply_pending_tier_upgrades: UPDATE users → UPDATE profiles (3 statements)' as fix_1,
  '2. award_level_badge: UPDATE users → UPDATE profiles (1 statement)' as fix_2;

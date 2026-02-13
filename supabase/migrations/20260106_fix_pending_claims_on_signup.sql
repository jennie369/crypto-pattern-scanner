-- =====================================================
-- FIX: PENDING CLAIMS ON USER SIGNUP
-- Date: 2026-01-06
-- Purpose: Automatically apply pending tier upgrades, gems, courses when user signs up
-- =====================================================

-- =====================================================
-- DROP ALL existing versions of functions (dynamic)
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all versions of apply_pending_tier_upgrades
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_pending_tier_upgrades'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    -- Drop all versions of apply_all_pending_purchases
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_all_pending_purchases'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;
END $$;

-- =====================================================
-- FUNCTION: apply_pending_tier_upgrades
-- Claims all pending tier upgrades for a user by email
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
  -- Get user email and linked emails from users table
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  SELECT COALESCE(linked_emails, '{}') INTO v_linked_emails
  FROM profiles WHERE id = p_user_id;

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

    -- Apply tier upgrade to users table
    IF v_pending.product_type = 'course' THEN
      UPDATE users SET
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
      UPDATE users SET
        scanner_tier = v_pending.tier_purchased,
        scanner_tier_expires_at = v_expiry_date,
        tier = v_pending.tier_purchased,
        tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;

    ELSIF v_pending.product_type = 'chatbot' THEN
      UPDATE users SET
        chatbot_tier = v_pending.tier_purchased,
        chatbot_tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    -- Mark as applied
    UPDATE pending_tier_upgrades SET
      applied = true,
      applied_at = NOW(),
      applied_user_id = p_user_id
    WHERE id = v_pending.id;

    v_applied_count := v_applied_count + 1;

    RAISE NOTICE 'Applied pending tier upgrade: % % for user %',
      v_pending.product_type, v_pending.tier_purchased, p_user_id;
  END LOOP;

  IF v_applied_count = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'applied_count', 0,
      'message', 'No pending tier upgrades found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'applied_count', v_applied_count,
    'message', 'Applied ' || v_applied_count || ' pending tier upgrades'
  );
END;
$$;

-- =====================================================
-- FUNCTION: apply_all_pending_purchases
-- Master function to apply all pending purchases for a user
-- Called on signup or email verification
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
BEGIN
  -- Apply pending tier upgrades
  SELECT apply_pending_tier_upgrades(p_user_id) INTO v_tier_result;

  -- Apply pending gem credits (existing function)
  BEGIN
    SELECT claim_pending_gem_credits(p_user_id) INTO v_gem_result;
  EXCEPTION WHEN undefined_function THEN
    v_gem_result := jsonb_build_object('success', false, 'error', 'Function not found');
  END;

  -- Apply pending course access
  BEGIN
    UPDATE pending_course_access
    SET
      applied = true,
      applied_user_id = p_user_id,
      applied_at = NOW()
    WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id)
    AND applied = false;

    -- Create course enrollments for pending courses
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

    v_course_result := jsonb_build_object('success', true);
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
-- UPDATE: handle_new_user to apply pending purchases
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_result JSONB;
BEGIN
  -- Create user record
  INSERT INTO public.users (
    id,
    email,
    display_name,
    full_name,
    scanner_tier,
    course_tier,
    chatbot_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.email),
    'FREE',
    'FREE',
    'FREE'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

  -- CRITICAL: Apply pending purchases for this user
  -- This handles the case where user bought before creating account
  BEGIN
    SELECT apply_all_pending_purchases(NEW.id) INTO v_pending_result;
    IF v_pending_result->>'success' = 'true' THEN
      RAISE NOTICE 'Applied pending purchases for new user %: %', NEW.id, v_pending_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Non-blocking - log but don't fail user creation
    RAISE WARNING 'Failed to apply pending purchases for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO authenticated;
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO service_role;
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO service_role;

-- =====================================================
-- Add missing columns to pending_tier_upgrades if not exist
-- =====================================================
ALTER TABLE pending_tier_upgrades ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE pending_tier_upgrades ADD COLUMN IF NOT EXISTS applied_user_id UUID;

-- =====================================================
-- COMMENT
-- =====================================================
COMMENT ON FUNCTION apply_pending_tier_upgrades IS
'Claims all pending tier upgrades for a user by matching email. Called on signup via handle_new_user trigger.';

COMMENT ON FUNCTION apply_all_pending_purchases IS
'Master function to apply all pending purchases (tiers, gems, courses) for a user. Called on signup.';

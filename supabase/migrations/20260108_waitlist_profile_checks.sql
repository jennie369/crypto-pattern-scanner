-- ============================================================================
-- WAITLIST PROFILE CHECKS
-- Prevent duplicate accounts and handle edge cases
-- Run in Supabase SQL Editor AFTER 20260108_waitlist_referral_system.sql
-- ============================================================================

-- 1. FUNCTION: Check if waitlist email/phone already has an account
-- Returns profile info if exists, for linking purposes
CREATE OR REPLACE FUNCTION public.check_waitlist_has_account(
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS TABLE(
  has_account BOOLEAN,
  profile_id UUID,
  profile_email TEXT,
  profile_display_name TEXT,
  already_linked BOOLEAN
) AS $$
DECLARE
  v_phone_normalized TEXT;
  v_email_normalized TEXT;
BEGIN
  -- Normalize email
  v_email_normalized := LOWER(TRIM(p_email));

  -- Normalize phone if provided
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
    IF length(v_phone_normalized) = 9 THEN
      v_phone_normalized := '0' || v_phone_normalized;
    END IF;
  END IF;

  -- Check profiles table for matching email
  RETURN QUERY
  SELECT
    TRUE::BOOLEAN,
    p.id,
    u.email::TEXT,
    COALESCE(p.display_name, p.full_name)::TEXT,
    (p.waitlist_entry_id IS NOT NULL)::BOOLEAN
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = v_email_normalized
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- Check profiles table for matching phone (if phone column exists)
  IF v_phone_normalized IS NOT NULL THEN
    RETURN QUERY
    SELECT
      TRUE::BOOLEAN,
      p.id,
      u.email::TEXT,
      COALESCE(p.display_name, p.full_name)::TEXT,
      (p.waitlist_entry_id IS NOT NULL)::BOOLEAN
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.phone = v_phone_normalized
       OR p.phone = p_phone
    LIMIT 1;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- No account found
  RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE::BOOLEAN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. FUNCTION: Enhanced waitlist registration check
-- Returns detailed status for UI feedback
CREATE OR REPLACE FUNCTION public.check_waitlist_status(
  p_email TEXT,
  p_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_phone_normalized TEXT;
  v_email_normalized TEXT;
  v_waitlist_lead RECORD;
  v_profile RECORD;
  v_result JSONB;
BEGIN
  -- Normalize inputs
  v_email_normalized := LOWER(TRIM(p_email));
  v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
  IF v_phone_normalized LIKE '84%' THEN
    v_phone_normalized := '0' || substring(v_phone_normalized from 3);
  END IF;

  -- Check 1: Already in waitlist_leads?
  SELECT id, queue_number, referral_code, lead_status, user_id, email, phone_normalized
  INTO v_waitlist_lead
  FROM public.waitlist_leads
  WHERE phone_normalized = v_phone_normalized
     OR (email IS NOT NULL AND LOWER(email) = v_email_normalized)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_waitlist_lead IS NOT NULL THEN
    -- Case A: Already registered and converted to account
    IF v_waitlist_lead.lead_status = 'converted' AND v_waitlist_lead.user_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'already_converted',
        'message', 'Email/SĐT này đã đăng ký waitlist và đã tạo tài khoản.',
        'queue_number', v_waitlist_lead.queue_number,
        'referral_code', v_waitlist_lead.referral_code,
        'can_register', false
      );
    END IF;

    -- Case B: Already registered but not converted
    RETURN jsonb_build_object(
      'status', 'already_registered',
      'message', 'Email/SĐT này đã đăng ký waitlist trước đó.',
      'queue_number', v_waitlist_lead.queue_number,
      'referral_code', v_waitlist_lead.referral_code,
      'can_register', false,
      'can_update', true
    );
  END IF;

  -- Check 2: Already has app account but not in waitlist?
  SELECT p.id, u.email, p.display_name, p.full_name, p.waitlist_entry_id
  INTO v_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = v_email_normalized
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    -- Case C: Has account, already linked to waitlist
    IF v_profile.waitlist_entry_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'status', 'account_with_waitlist',
        'message', 'Email này đã có tài khoản và đã được link với waitlist.',
        'can_register', false
      );
    END IF;

    -- Case D: Has account but NOT in waitlist - can register!
    RETURN jsonb_build_object(
      'status', 'account_no_waitlist',
      'message', 'Email này đã có tài khoản. Đăng ký waitlist để nhận ưu đãi Early Bird!',
      'profile_id', v_profile.id,
      'can_register', true,
      'will_link', true
    );
  END IF;

  -- Check 3: Phone belongs to existing account?
  SELECT p.id, u.email, p.display_name, p.full_name
  INTO v_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.phone = v_phone_normalized
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    -- Case E: Phone has account
    RETURN jsonb_build_object(
      'status', 'phone_has_account',
      'message', 'SĐT này đã có tài khoản với email khác.',
      'existing_email_masked',
        CASE
          WHEN length(v_profile.id::text) > 0
          THEN substring(v_profile.id::text, 1, 3) || '***'
          ELSE '***'
        END,
      'can_register', true,
      'will_link', true
    );
  END IF;

  -- Case F: Clean - can register new waitlist entry
  RETURN jsonb_build_object(
    'status', 'new',
    'message', 'OK',
    'can_register', true,
    'will_link', false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. FUNCTION: Auto-link existing account to new waitlist entry
-- Call this after inserting waitlist_lead if profile exists
CREATE OR REPLACE FUNCTION public.auto_link_waitlist_to_existing_account(
  p_waitlist_id UUID,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_phone_normalized TEXT;
  v_email_normalized TEXT;
  v_profile RECORD;
  v_lead RECORD;
BEGIN
  -- Normalize inputs
  v_email_normalized := LOWER(TRIM(p_email));
  IF p_phone IS NOT NULL THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
  END IF;

  -- Get the waitlist lead
  SELECT * INTO v_lead
  FROM public.waitlist_leads
  WHERE id = p_waitlist_id;

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Waitlist entry not found');
  END IF;

  -- Find matching profile
  SELECT p.id INTO v_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = v_email_normalized
     OR (v_phone_normalized IS NOT NULL AND p.phone = v_phone_normalized)
  LIMIT 1;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No existing account to link');
  END IF;

  -- Update waitlist_leads with user_id
  UPDATE public.waitlist_leads
  SET
    user_id = v_profile.id,
    lead_status = 'converted',
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_waitlist_id
    AND user_id IS NULL; -- Only if not already linked

  -- Update profile with waitlist info
  UPDATE public.profiles
  SET
    queue_number = v_lead.queue_number,
    waitlist_entry_id = p_waitlist_id,
    waitlist_converted_at = NOW(),
    waitlist_referral_code = v_lead.referral_code,
    updated_at = NOW()
  WHERE id = v_profile.id
    AND waitlist_entry_id IS NULL; -- Only if not already linked

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile.id,
    'queue_number', v_lead.queue_number,
    'referral_code', v_lead.referral_code,
    'message', 'Đã link với tài khoản có sẵn!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNCTION: Prevent duplicate affiliate relationships
-- Called when processing referral to ensure no circular or duplicate referrals
CREATE OR REPLACE FUNCTION public.validate_affiliate_relationship(
  p_referrer_code TEXT,
  p_referred_email TEXT,
  p_referred_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_referrer_user_id UUID;
  v_referred_profile RECORD;
  v_existing_referral RECORD;
  v_phone_normalized TEXT;
BEGIN
  -- Normalize phone
  v_phone_normalized := regexp_replace(p_referred_phone, '[^0-9]', '', 'g');
  IF v_phone_normalized LIKE '84%' THEN
    v_phone_normalized := '0' || substring(v_phone_normalized from 3);
  END IF;

  -- Get referrer user_id
  SELECT user_id INTO v_referrer_user_id
  FROM public.waitlist_leads
  WHERE referral_code = UPPER(p_referrer_code)
  LIMIT 1;

  IF v_referrer_user_id IS NULL THEN
    -- Check profiles
    SELECT id INTO v_referrer_user_id
    FROM public.profiles
    WHERE referral_code = UPPER(p_referrer_code)
       OR affiliate_code = UPPER(p_referrer_code)
    LIMIT 1;
  END IF;

  IF v_referrer_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'invalid_referrer',
      'message', 'Mã giới thiệu không tồn tại'
    );
  END IF;

  -- Check if referred person already has an account
  SELECT p.id, p.referred_by_user_id
  INTO v_referred_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = LOWER(p_referred_email)
     OR p.phone = v_phone_normalized
  LIMIT 1;

  IF v_referred_profile IS NOT NULL THEN
    -- Check if already has a referrer (duplicate prevention)
    IF v_referred_profile.referred_by_user_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'valid', false,
        'reason', 'already_referred',
        'message', 'Người này đã được giới thiệu bởi người khác'
      );
    END IF;

    -- Check for circular referral (A referred B, B trying to refer A)
    IF v_referred_profile.id = v_referrer_user_id THEN
      RETURN jsonb_build_object(
        'valid', false,
        'reason', 'self_referral',
        'message', 'Không thể tự giới thiệu chính mình'
      );
    END IF;
  END IF;

  -- Check for existing referral in waitlist_leads
  SELECT id, referred_by_code
  INTO v_existing_referral
  FROM public.waitlist_leads
  WHERE (LOWER(email) = LOWER(p_referred_email) OR phone_normalized = v_phone_normalized)
    AND referred_by_code IS NOT NULL
  LIMIT 1;

  IF v_existing_referral IS NOT NULL AND v_existing_referral.referred_by_code != UPPER(p_referrer_code) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'reason', 'different_referrer',
      'message', 'Email/SĐT này đã được giới thiệu bởi mã khác',
      'existing_referrer', v_existing_referral.referred_by_code
    );
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'valid', true,
    'referrer_user_id', v_referrer_user_id,
    'message', 'OK'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.check_waitlist_has_account TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_waitlist_status TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_link_waitlist_to_existing_account TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_affiliate_relationship TO anon, authenticated, service_role;

-- 6. COMMENTS
COMMENT ON FUNCTION public.check_waitlist_has_account IS 'Check if email/phone from waitlist already has an app account';
COMMENT ON FUNCTION public.check_waitlist_status IS 'Comprehensive check for waitlist registration status - returns detailed info for UI';
COMMENT ON FUNCTION public.auto_link_waitlist_to_existing_account IS 'Auto-link new waitlist entry to existing account if found';
COMMENT ON FUNCTION public.validate_affiliate_relationship IS 'Validate referral relationship - prevent duplicates and circular referrals';

-- Done!
SELECT 'Waitlist Profile Checks migration completed!' as result;

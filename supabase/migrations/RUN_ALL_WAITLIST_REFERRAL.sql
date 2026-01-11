-- ============================================================================
-- RUN ALL WAITLIST REFERRAL MIGRATIONS
-- Combined migration file - Run this ONE file in Supabase SQL Editor
-- ============================================================================
-- This combines:
-- 1. 20260108_waitlist_referral_system.sql
-- 2. 20260108_waitlist_profile_checks.sql
-- 3. 20260108_early_bird_benefits_system.sql (partial)
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: ADD COLUMNS TO TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles table columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS queue_number INTEGER,
ADD COLUMN IF NOT EXISTS waitlist_entry_id UUID,
ADD COLUMN IF NOT EXISTS waitlist_converted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waitlist_referral_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS scanner_trial_tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS scanner_trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scanner_original_tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS early_bird_discount_code VARCHAR(50);

-- Waitlist_leads columns
ALTER TABLE public.waitlist_leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS affiliate_id UUID,
ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(20);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: CREATE INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_waitlist_leads_user_id ON public.waitlist_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_referred_by ON public.waitlist_leads(referred_by_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_phone_normalized ON public.waitlist_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_profiles_queue_number ON public.profiles(queue_number);
CREATE INDEX IF NOT EXISTS idx_profiles_waitlist_entry_id ON public.profiles(waitlist_entry_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: FUNCTION - validate_referral_code
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  referrer_user_id UUID,
  referrer_name TEXT,
  source_table TEXT
) AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := UPPER(TRIM(p_code));

  IF v_code IS NULL OR v_code = '' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check in waitlist_leads first
  RETURN QUERY
  SELECT TRUE::BOOLEAN, wl.user_id, wl.full_name::TEXT, 'waitlist_leads'::TEXT
  FROM public.waitlist_leads wl
  WHERE wl.referral_code = v_code
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Check in profiles
  RETURN QUERY
  SELECT TRUE::BOOLEAN, p.id, COALESCE(p.full_name, p.display_name)::TEXT, 'profiles'::TEXT
  FROM public.profiles p
  WHERE p.referral_code = v_code OR p.affiliate_code = v_code
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Check in affiliate_codes
  BEGIN
    RETURN QUERY
    SELECT TRUE::BOOLEAN, ac.user_id,
      (SELECT COALESCE(p2.full_name, p2.display_name) FROM public.profiles p2 WHERE p2.id = ac.user_id)::TEXT,
      'affiliate_codes'::TEXT
    FROM public.affiliate_codes ac
    WHERE ac.code = v_code OR ac.short_code = v_code
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  EXCEPTION WHEN undefined_table THEN
    -- affiliate_codes table doesn't exist, skip
    NULL;
  END;

  RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: FUNCTION - check_self_referral
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_self_referral(
  p_email TEXT,
  p_phone TEXT,
  p_referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_email TEXT;
  v_referrer_phone TEXT;
BEGIN
  IF p_referral_code IS NULL OR p_referral_code = '' THEN
    RETURN FALSE;
  END IF;

  SELECT email, phone INTO v_referrer_email, v_referrer_phone
  FROM public.waitlist_leads
  WHERE referral_code = UPPER(p_referral_code)
  LIMIT 1;

  IF v_referrer_email IS NOT NULL AND LOWER(v_referrer_email) = LOWER(p_email) THEN
    RETURN TRUE;
  END IF;

  IF v_referrer_phone IS NOT NULL AND p_phone IS NOT NULL THEN
    DECLARE
      v_norm_referrer TEXT := regexp_replace(v_referrer_phone, '[^0-9]', '', 'g');
      v_norm_input TEXT := regexp_replace(p_phone, '[^0-9]', '', 'g');
    BEGIN
      IF v_norm_referrer = v_norm_input THEN
        RETURN TRUE;
      END IF;
    END;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 5: FUNCTION - increment_referral_count
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_referral_count(p_referrer_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_code TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  v_code := UPPER(TRIM(p_referrer_code));

  IF v_code IS NULL OR v_code = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid code');
  END IF;

  UPDATE public.waitlist_leads
  SET referral_count = COALESCE(referral_count, 0) + 1, updated_at = NOW()
  WHERE referral_code = v_code;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'updated_count', v_updated_count, 'code', v_code);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 6: FUNCTION - auto_link_waitlist_to_existing_account
-- ═══════════════════════════════════════════════════════════════════════════

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
  v_email_normalized := LOWER(TRIM(p_email));
  IF p_phone IS NOT NULL THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
  END IF;

  SELECT * INTO v_lead FROM public.waitlist_leads WHERE id = p_waitlist_id;
  IF v_lead IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Waitlist entry not found');
  END IF;

  SELECT p.id INTO v_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = v_email_normalized
     OR (v_phone_normalized IS NOT NULL AND p.phone = v_phone_normalized)
  LIMIT 1;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No existing account to link');
  END IF;

  UPDATE public.waitlist_leads
  SET user_id = v_profile.id, lead_status = 'converted', converted_at = NOW(), updated_at = NOW()
  WHERE id = p_waitlist_id AND user_id IS NULL;

  UPDATE public.profiles
  SET queue_number = v_lead.queue_number, waitlist_entry_id = p_waitlist_id,
      waitlist_converted_at = NOW(), waitlist_referral_code = v_lead.referral_code, updated_at = NOW()
  WHERE id = v_profile.id AND waitlist_entry_id IS NULL;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile.id,
    'queue_number', v_lead.queue_number,
    'referral_code', v_lead.referral_code,
    'message', 'Đã link với tài khoản có sẵn!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 7: FUNCTION - validate_affiliate_relationship
-- ═══════════════════════════════════════════════════════════════════════════

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
  v_phone_normalized := regexp_replace(p_referred_phone, '[^0-9]', '', 'g');
  IF v_phone_normalized LIKE '84%' THEN
    v_phone_normalized := '0' || substring(v_phone_normalized from 3);
  END IF;

  -- Get referrer user_id
  SELECT user_id INTO v_referrer_user_id FROM public.waitlist_leads
  WHERE referral_code = UPPER(p_referrer_code) LIMIT 1;

  IF v_referrer_user_id IS NULL THEN
    SELECT id INTO v_referrer_user_id FROM public.profiles
    WHERE referral_code = UPPER(p_referrer_code) OR affiliate_code = UPPER(p_referrer_code) LIMIT 1;
  END IF;

  IF v_referrer_user_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'invalid_referrer', 'message', 'Mã giới thiệu không tồn tại');
  END IF;

  -- Check if referred person already has referrer
  SELECT p.id, p.referred_by_user_id INTO v_referred_profile
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = LOWER(p_referred_email) OR p.phone = v_phone_normalized
  LIMIT 1;

  IF v_referred_profile IS NOT NULL THEN
    IF v_referred_profile.referred_by_user_id IS NOT NULL THEN
      RETURN jsonb_build_object('valid', false, 'reason', 'already_referred', 'message', 'Người này đã được giới thiệu bởi người khác');
    END IF;
    IF v_referred_profile.id = v_referrer_user_id THEN
      RETURN jsonb_build_object('valid', false, 'reason', 'self_referral', 'message', 'Không thể tự giới thiệu chính mình');
    END IF;
  END IF;

  -- Check existing referral in waitlist_leads
  SELECT id, referred_by_code INTO v_existing_referral FROM public.waitlist_leads
  WHERE (LOWER(email) = LOWER(p_referred_email) OR phone_normalized = v_phone_normalized)
    AND referred_by_code IS NOT NULL LIMIT 1;

  IF v_existing_referral IS NOT NULL AND v_existing_referral.referred_by_code != UPPER(p_referrer_code) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'different_referrer', 'message', 'Email/SĐT này đã được giới thiệu bởi mã khác');
  END IF;

  RETURN jsonb_build_object('valid', true, 'referrer_user_id', v_referrer_user_id, 'message', 'OK');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 8: FUNCTION - link_user_to_waitlist
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.link_user_to_waitlist(
  p_user_id UUID,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_phone_normalized TEXT;
  v_email_normalized TEXT;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  IF p_phone IS NOT NULL AND p_phone != '' THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
    IF length(v_phone_normalized) = 9 THEN
      v_phone_normalized := '0' || v_phone_normalized;
    END IF;
  END IF;

  SELECT * INTO v_lead
  FROM public.waitlist_leads
  WHERE (
    (email IS NOT NULL AND LOWER(email) = v_email_normalized)
    OR (v_phone_normalized IS NOT NULL AND phone_normalized = v_phone_normalized)
  )
  AND (user_id IS NULL OR lead_status != 'converted')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No waitlist entry found for this email/phone');
  END IF;

  UPDATE public.waitlist_leads
  SET user_id = p_user_id, lead_status = 'converted', converted_at = NOW(), updated_at = NOW()
  WHERE id = v_lead.id;

  UPDATE public.profiles
  SET queue_number = v_lead.queue_number, waitlist_entry_id = v_lead.id,
      waitlist_converted_at = NOW(), waitlist_referral_code = v_lead.referral_code, updated_at = NOW()
  WHERE id = p_user_id;

  -- Apply Early Bird benefits
  BEGIN
    PERFORM public.apply_early_bird_benefits(p_user_id, v_lead.id);
  EXCEPTION WHEN undefined_function THEN
    RAISE NOTICE 'apply_early_bird_benefits not available';
  END;

  RETURN jsonb_build_object(
    'success', true,
    'waitlist_id', v_lead.id,
    'queue_number', v_lead.queue_number,
    'referral_code', v_lead.referral_code,
    'referred_by', v_lead.referred_by_code,
    'is_top_100', v_lead.queue_number <= 100,
    'message', CASE
      WHEN v_lead.queue_number <= 100 THEN 'Chào mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận mã giảm 10% + Scanner TIER2 miễn phí 14 ngày!'
      ELSE 'Chào mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận Scanner TIER2 miễn phí 14 ngày!'
    END
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Error: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 9: FUNCTION - check_waitlist_has_account
-- ═══════════════════════════════════════════════════════════════════════════

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
  v_email_normalized := LOWER(TRIM(p_email));

  IF p_phone IS NOT NULL AND p_phone != '' THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
  END IF;

  RETURN QUERY
  SELECT TRUE::BOOLEAN, p.id, u.email::TEXT, COALESCE(p.display_name, p.full_name)::TEXT,
         (p.waitlist_entry_id IS NOT NULL)::BOOLEAN
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(u.email) = v_email_normalized
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  IF v_phone_normalized IS NOT NULL THEN
    RETURN QUERY
    SELECT TRUE::BOOLEAN, p.id, u.email::TEXT, COALESCE(p.display_name, p.full_name)::TEXT,
           (p.waitlist_entry_id IS NOT NULL)::BOOLEAN
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.phone = v_phone_normalized OR p.phone = p_phone
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT, FALSE::BOOLEAN;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 10: GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.validate_referral_code TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_self_referral TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_referral_count TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_link_waitlist_to_existing_account TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_affiliate_relationship TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.link_user_to_waitlist TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_waitlist_has_account TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pg_proc
  WHERE proname IN (
    'validate_referral_code', 'check_self_referral', 'increment_referral_count',
    'auto_link_waitlist_to_existing_account', 'validate_affiliate_relationship',
    'link_user_to_waitlist', 'check_waitlist_has_account'
  );
  RAISE NOTICE '✅ Migration completed! % functions created/updated.', v_count;
END;
$$;

SELECT '✅ RUN_ALL_WAITLIST_REFERRAL.sql completed!' as result;

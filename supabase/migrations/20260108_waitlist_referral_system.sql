-- ============================================================================
-- WAITLIST REFERRAL SYSTEM
-- Link waitlist to profiles + referral tracking
-- Run in Supabase SQL Editor
-- ============================================================================

-- 1. ADD COLUMNS TO PROFILES TABLE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS queue_number INTEGER,
ADD COLUMN IF NOT EXISTS waitlist_entry_id UUID,
ADD COLUMN IF NOT EXISTS waitlist_converted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waitlist_referral_code VARCHAR(20);

-- 2. ADD COLUMNS TO WAITLIST_LEADS (for linking)
ALTER TABLE public.waitlist_leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS affiliate_id UUID;

-- 3. INDEX FOR FASTER LOOKUPS
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_user_id ON public.waitlist_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_referred_by ON public.waitlist_leads(referred_by_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_phone_normalized ON public.waitlist_leads(phone_normalized);

-- 4. FUNCTION: Validate referral code exists
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
  -- Normalize code to uppercase
  v_code := UPPER(TRIM(p_code));

  IF v_code IS NULL OR v_code = '' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check in waitlist_leads first (người đăng ký waitlist có mã)
  RETURN QUERY
  SELECT
    TRUE::BOOLEAN,
    wl.user_id,
    wl.full_name::TEXT,
    'waitlist_leads'::TEXT
  FROM public.waitlist_leads wl
  WHERE wl.referral_code = v_code
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- Check in profiles (người đã có account)
  RETURN QUERY
  SELECT
    TRUE::BOOLEAN,
    p.id,
    COALESCE(p.full_name, p.display_name)::TEXT,
    'profiles'::TEXT
  FROM public.profiles p
  WHERE p.referral_code = v_code
     OR p.affiliate_code = v_code
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- Check in affiliate_codes (affiliate links)
  RETURN QUERY
  SELECT
    TRUE::BOOLEAN,
    ac.user_id,
    (SELECT COALESCE(p2.full_name, p2.display_name) FROM public.profiles p2 WHERE p2.id = ac.user_id)::TEXT,
    'affiliate_codes'::TEXT
  FROM public.affiliate_codes ac
  WHERE ac.code = v_code
     OR ac.short_code = v_code
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- Not found anywhere
  RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. FUNCTION: Increment referral count (khi có người đăng ký qua mã)
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

  -- Increment in waitlist_leads
  UPDATE public.waitlist_leads
  SET
    referral_count = COALESCE(referral_count, 0) + 1,
    updated_at = NOW()
  WHERE referral_code = v_code;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Also update affiliate_profiles if exists
  UPDATE public.affiliate_profiles ap
  SET
    updated_at = NOW()
  FROM public.profiles p
  WHERE ap.user_id = p.id
    AND (p.referral_code = v_code OR p.affiliate_code = v_code);

  RETURN jsonb_build_object(
    'success', true,
    'updated_waitlist_leads', v_updated_count,
    'code', v_code
  );
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION: Link user to waitlist entry (khi signup app)
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

  -- Find matching waitlist_leads entry (not yet converted)
  SELECT * INTO v_lead
  FROM public.waitlist_leads
  WHERE (
    (email IS NOT NULL AND LOWER(email) = v_email_normalized)
    OR
    (v_phone_normalized IS NOT NULL AND phone_normalized = v_phone_normalized)
  )
  AND (user_id IS NULL OR lead_status != 'converted')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No waitlist entry found for this email/phone'
    );
  END IF;

  -- Update waitlist_leads - mark as converted
  UPDATE public.waitlist_leads
  SET
    user_id = p_user_id,
    lead_status = 'converted',
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = v_lead.id;

  -- Update profiles with waitlist info
  UPDATE public.profiles
  SET
    queue_number = v_lead.queue_number,
    waitlist_entry_id = v_lead.id,
    waitlist_converted_at = NOW(),
    waitlist_referral_code = v_lead.referral_code,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the conversion
  RAISE NOTICE 'Waitlist linked: user_id=%, waitlist_id=%, queue=#%',
    p_user_id, v_lead.id, v_lead.queue_number;

  -- Apply Early Bird benefits (discount code + scanner trial)
  -- This is non-blocking - if function doesn't exist yet, it won't fail
  BEGIN
    PERFORM public.apply_early_bird_benefits(p_user_id, v_lead.id);
    RAISE NOTICE 'Early Bird benefits applied for user %', p_user_id;
  EXCEPTION WHEN undefined_function THEN
    RAISE NOTICE 'apply_early_bird_benefits not yet available';
  END;

  RETURN jsonb_build_object(
    'success', true,
    'waitlist_id', v_lead.id,
    'queue_number', v_lead.queue_number,
    'referral_code', v_lead.referral_code,
    'referred_by', v_lead.referred_by_code,
    'is_top_100', v_lead.queue_number <= 100,
    'message',
      CASE
        WHEN v_lead.queue_number <= 100 THEN
          'Chào mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận mã giảm 10% + Scanner TIER2 miễn phí 14 ngày!'
        ELSE
          'Chào mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận Scanner TIER2 miễn phí 14 ngày!'
      END
  );

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'link_user_to_waitlist error: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error linking waitlist: ' || SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCTION: Check for self-referral (prevent gaming)
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
    RETURN FALSE; -- No referral code, not self-referral
  END IF;

  -- Get referrer's email/phone from waitlist_leads
  SELECT email, phone INTO v_referrer_email, v_referrer_phone
  FROM public.waitlist_leads
  WHERE referral_code = UPPER(p_referral_code)
  LIMIT 1;

  IF v_referrer_email IS NOT NULL AND LOWER(v_referrer_email) = LOWER(p_email) THEN
    RETURN TRUE; -- Self-referral by email
  END IF;

  IF v_referrer_phone IS NOT NULL AND p_phone IS NOT NULL THEN
    -- Normalize both phones and compare
    DECLARE
      v_norm_referrer TEXT := regexp_replace(v_referrer_phone, '[^0-9]', '', 'g');
      v_norm_input TEXT := regexp_replace(p_phone, '[^0-9]', '', 'g');
    BEGIN
      IF v_norm_referrer = v_norm_input THEN
        RETURN TRUE; -- Self-referral by phone
      END IF;
    END;
  END IF;

  RETURN FALSE; -- Not self-referral
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.validate_referral_code TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_referral_count TO service_role;
GRANT EXECUTE ON FUNCTION public.link_user_to_waitlist TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_self_referral TO anon, authenticated, service_role;

-- 9. COMMENT FUNCTIONS
COMMENT ON FUNCTION public.validate_referral_code IS 'Validate if a referral code exists in system (waitlist_leads, profiles, or affiliate_codes)';
COMMENT ON FUNCTION public.increment_referral_count IS 'Increment referral_count for the referrer when someone uses their code';
COMMENT ON FUNCTION public.link_user_to_waitlist IS 'Link a new user account to their waitlist entry by email/phone match';
COMMENT ON FUNCTION public.check_self_referral IS 'Check if user is trying to use their own referral code';

-- Done!
SELECT 'Waitlist Referral System migration completed!' as result;

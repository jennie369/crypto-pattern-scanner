-- ============================================================================
-- EARLY BIRD BENEFITS SYSTEM
-- Full flow for waitlist benefits:
-- 1. 10% discount code for first 100 users (course purchases)
-- 2. 14-day Scanner TIER2 trial (auto-lock after expiry)
-- Run in Supabase SQL Editor
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 1: DISCOUNT CODES TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Table to store discount codes (synced with Shopify)
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code info
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount'
  discount_value NUMERIC(10,2) NOT NULL, -- 10 = 10% or 10 VND

  -- Restrictions
  min_purchase_amount NUMERIC(12,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'courses', 'products', 'specific_skus'
  applicable_skus TEXT[], -- Array of SKUs this code applies to

  -- Owner info
  user_id UUID REFERENCES auth.users(id),
  waitlist_lead_id UUID REFERENCES public.waitlist_leads(id),

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Shopify sync
  shopify_discount_id TEXT, -- Shopify price rule ID
  shopify_synced_at TIMESTAMPTZ,

  -- Metadata
  source VARCHAR(50) DEFAULT 'early_bird', -- 'early_bird', 'referral', 'promotion', 'affiliate'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_user_id ON public.discount_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_waitlist_lead_id ON public.discount_codes(waitlist_lead_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON public.discount_codes(is_active) WHERE is_active = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 2: ADD TRIAL COLUMNS TO PROFILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Add scanner trial columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS scanner_trial_tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS scanner_trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scanner_original_tier VARCHAR(20),
ADD COLUMN IF NOT EXISTS early_bird_discount_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS early_bird_benefits_applied_at TIMESTAMPTZ;

-- Add early bird columns to waitlist_leads
ALTER TABLE public.waitlist_leads
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_code_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scanner_trial_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS benefits_applied_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 3: EARLY BIRD BENEFITS TABLE (Track who gets what)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.early_bird_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  waitlist_lead_id UUID REFERENCES public.waitlist_leads(id),
  user_id UUID REFERENCES auth.users(id),
  queue_number INTEGER NOT NULL,

  -- What benefits
  discount_10_percent BOOLEAN DEFAULT FALSE,
  discount_code VARCHAR(50),
  scanner_trial_14_days BOOLEAN DEFAULT FALSE,
  scanner_trial_ends_at TIMESTAMPTZ,
  crystal_gift BOOLEAN DEFAULT FALSE, -- Tặng Crystal cho 100 người đầu
  vip_group_access BOOLEAN DEFAULT FALSE,

  -- Status
  benefits_granted_at TIMESTAMPTZ DEFAULT NOW(),
  discount_used BOOLEAN DEFAULT FALSE,
  discount_used_at TIMESTAMPTZ,
  discount_order_id TEXT,
  scanner_trial_expired BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_early_bird_benefits_waitlist ON public.early_bird_benefits(waitlist_lead_id);
CREATE INDEX IF NOT EXISTS idx_early_bird_benefits_user ON public.early_bird_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_early_bird_benefits_queue ON public.early_bird_benefits(queue_number);

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 4: FUNCTION - Generate Early Bird Discount Code
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.generate_early_bird_discount_code(
  p_waitlist_lead_id UUID,
  p_queue_number INTEGER
)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_lead RECORD;
BEGIN
  -- Only first 100 get discount
  IF p_queue_number > 100 THEN
    RETURN NULL;
  END IF;

  -- Get lead info
  SELECT * INTO v_lead FROM public.waitlist_leads WHERE id = p_waitlist_lead_id;
  IF v_lead IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if already has discount code
  IF v_lead.discount_code IS NOT NULL THEN
    RETURN v_lead.discount_code;
  END IF;

  -- Generate unique code: EARLY-[QueueNumber]-[Random4]
  v_code := 'EARLY' || LPAD(p_queue_number::TEXT, 3, '0') || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.discount_codes WHERE code = v_code) LOOP
    v_code := 'EARLY' || LPAD(p_queue_number::TEXT, 3, '0') || '-' ||
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  END LOOP;

  -- Create discount code entry
  INSERT INTO public.discount_codes (
    code,
    description,
    discount_type,
    discount_value,
    max_uses,
    applies_to,
    waitlist_lead_id,
    valid_from,
    valid_until,
    source
  ) VALUES (
    v_code,
    'Early Bird 10% - Queue #' || p_queue_number,
    'percentage',
    10, -- 10%
    1, -- Single use
    'courses', -- Only for courses
    p_waitlist_lead_id,
    NOW(),
    NOW() + INTERVAL '30 days', -- Valid for 30 days
    'early_bird'
  );

  -- Update waitlist_leads
  UPDATE public.waitlist_leads
  SET discount_code = v_code, updated_at = NOW()
  WHERE id = p_waitlist_lead_id;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 5: FUNCTION - Apply Early Bird Benefits on Account Creation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.apply_early_bird_benefits(
  p_user_id UUID,
  p_waitlist_lead_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_discount_code TEXT;
  v_trial_ends_at TIMESTAMPTZ;
  v_benefits_applied JSONB;
  v_existing_benefit RECORD;
BEGIN
  -- Get waitlist lead
  SELECT * INTO v_lead FROM public.waitlist_leads WHERE id = p_waitlist_lead_id;

  IF v_lead IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Waitlist lead not found');
  END IF;

  -- Check if benefits already applied
  SELECT * INTO v_existing_benefit
  FROM public.early_bird_benefits
  WHERE waitlist_lead_id = p_waitlist_lead_id;

  IF v_existing_benefit IS NOT NULL AND v_existing_benefit.user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Benefits already applied',
      'existing_benefits', row_to_json(v_existing_benefit)
    );
  END IF;

  v_benefits_applied := jsonb_build_object();

  -- ═══════════════════════════════════════════
  -- BENEFIT 1: 10% Discount (First 100 only)
  -- ═══════════════════════════════════════════
  IF v_lead.queue_number <= 100 THEN
    -- Generate discount code if not exists
    IF v_lead.discount_code IS NULL THEN
      v_discount_code := generate_early_bird_discount_code(p_waitlist_lead_id, v_lead.queue_number);
    ELSE
      v_discount_code := v_lead.discount_code;
    END IF;

    -- Update profiles with discount code
    UPDATE public.profiles
    SET
      early_bird_discount_code = v_discount_code,
      updated_at = NOW()
    WHERE id = p_user_id;

    -- Link discount code to user
    UPDATE public.discount_codes
    SET user_id = p_user_id, updated_at = NOW()
    WHERE waitlist_lead_id = p_waitlist_lead_id;

    v_benefits_applied := v_benefits_applied || jsonb_build_object(
      'discount_10_percent', true,
      'discount_code', v_discount_code
    );
  END IF;

  -- ═══════════════════════════════════════════
  -- BENEFIT 2: Scanner Trial 14 Days (All Early Birds)
  -- ═══════════════════════════════════════════
  v_trial_ends_at := NOW() + INTERVAL '14 days';

  -- Save original tier and apply trial
  UPDATE public.profiles
  SET
    scanner_original_tier = COALESCE(scanner_original_tier, scanner_tier), -- Don't overwrite if already set
    scanner_trial_tier = 'TIER2',
    scanner_trial_ends_at = v_trial_ends_at,
    scanner_tier = 'TIER2', -- Upgrade to TIER2 during trial
    early_bird_benefits_applied_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  v_benefits_applied := v_benefits_applied || jsonb_build_object(
    'scanner_trial_14_days', true,
    'scanner_trial_tier', 'TIER2',
    'scanner_trial_ends_at', v_trial_ends_at
  );

  -- ═══════════════════════════════════════════
  -- BENEFIT 3: Crystal Gift (First 100 only)
  -- ═══════════════════════════════════════════
  IF v_lead.queue_number <= 100 THEN
    -- Note: Crystal shipping will be handled by admin manually
    -- This just marks them as eligible
    v_benefits_applied := v_benefits_applied || jsonb_build_object(
      'crystal_gift_eligible', true
    );
  END IF;

  -- ═══════════════════════════════════════════
  -- Record benefits in early_bird_benefits table
  -- ═══════════════════════════════════════════
  INSERT INTO public.early_bird_benefits (
    waitlist_lead_id,
    user_id,
    queue_number,
    discount_10_percent,
    discount_code,
    scanner_trial_14_days,
    scanner_trial_ends_at,
    crystal_gift,
    vip_group_access,
    benefits_granted_at
  ) VALUES (
    p_waitlist_lead_id,
    p_user_id,
    v_lead.queue_number,
    v_lead.queue_number <= 100,
    v_discount_code,
    TRUE,
    v_trial_ends_at,
    v_lead.queue_number <= 100,
    TRUE, -- All early birds get VIP group
    NOW()
  )
  ON CONFLICT (waitlist_lead_id) WHERE waitlist_lead_id IS NOT NULL
  DO UPDATE SET
    user_id = p_user_id,
    benefits_granted_at = NOW(),
    updated_at = NOW();

  -- Update waitlist_leads
  UPDATE public.waitlist_leads
  SET
    scanner_trial_granted = TRUE,
    benefits_applied_at = NOW(),
    updated_at = NOW()
  WHERE id = p_waitlist_lead_id;

  RETURN jsonb_build_object(
    'success', true,
    'queue_number', v_lead.queue_number,
    'benefits', v_benefits_applied,
    'message',
      CASE
        WHEN v_lead.queue_number <= 100 THEN
          'Chúc mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận được: Giảm 10% khóa học + Scanner TIER2 miễn phí 14 ngày + Crystal năng lượng!'
        ELSE
          'Chào mừng Early Bird #' || v_lead.queue_number || '! Bạn nhận được Scanner TIER2 miễn phí 14 ngày!'
      END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 6: FUNCTION - Check & Expire Scanner Trials (Cron Job)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.expire_scanner_trials()
RETURNS JSONB AS $$
DECLARE
  v_expired_count INTEGER := 0;
  v_profile RECORD;
BEGIN
  -- Find all expired trials
  FOR v_profile IN
    SELECT id, scanner_original_tier, scanner_trial_tier, scanner_trial_ends_at
    FROM public.profiles
    WHERE scanner_trial_ends_at IS NOT NULL
      AND scanner_trial_ends_at <= NOW()
      AND scanner_tier = scanner_trial_tier -- Still on trial tier
  LOOP
    -- Revert to original tier (or FREE if none)
    UPDATE public.profiles
    SET
      scanner_tier = COALESCE(v_profile.scanner_original_tier, 'FREE'),
      scanner_trial_tier = NULL,
      scanner_trial_ends_at = NULL,
      -- Keep scanner_original_tier for record
      updated_at = NOW()
    WHERE id = v_profile.id;

    -- Update early_bird_benefits
    UPDATE public.early_bird_benefits
    SET
      scanner_trial_expired = TRUE,
      updated_at = NOW()
    WHERE user_id = v_profile.id;

    v_expired_count := v_expired_count + 1;

    RAISE NOTICE 'Expired trial for user %: % -> %',
      v_profile.id,
      v_profile.scanner_trial_tier,
      COALESCE(v_profile.scanner_original_tier, 'FREE');
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'expired_count', v_expired_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 7: FUNCTION - Validate Discount Code on Purchase
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.validate_discount_code(
  p_code TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_product_type TEXT DEFAULT 'courses'
)
RETURNS JSONB AS $$
DECLARE
  v_discount RECORD;
  v_phone_normalized TEXT;
BEGIN
  -- Normalize phone
  IF p_phone IS NOT NULL THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF v_phone_normalized LIKE '84%' THEN
      v_phone_normalized := '0' || substring(v_phone_normalized from 3);
    END IF;
  END IF;

  -- Find discount code
  SELECT d.*, w.email as waitlist_email, w.phone_normalized as waitlist_phone
  INTO v_discount
  FROM public.discount_codes d
  LEFT JOIN public.waitlist_leads w ON w.id = d.waitlist_lead_id
  WHERE UPPER(d.code) = UPPER(p_code);

  IF v_discount IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'invalid_code',
      'message', 'Mã giảm giá không tồn tại'
    );
  END IF;

  -- Check if active
  IF NOT v_discount.is_active THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'inactive',
      'message', 'Mã giảm giá đã hết hiệu lực'
    );
  END IF;

  -- Check validity period
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'expired',
      'message', 'Mã giảm giá đã hết hạn'
    );
  END IF;

  -- Check max uses
  IF v_discount.current_uses >= v_discount.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'max_uses_reached',
      'message', 'Mã giảm giá đã được sử dụng hết'
    );
  END IF;

  -- Check product type
  IF v_discount.applies_to != 'all' AND v_discount.applies_to != p_product_type THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'wrong_product_type',
      'message', 'Mã giảm giá không áp dụng cho loại sản phẩm này'
    );
  END IF;

  -- For Early Bird codes, verify email/phone matches
  IF v_discount.source = 'early_bird' AND v_discount.waitlist_lead_id IS NOT NULL THEN
    IF p_email IS NOT NULL AND v_discount.waitlist_email IS NOT NULL THEN
      IF LOWER(p_email) != LOWER(v_discount.waitlist_email) THEN
        -- Also check phone
        IF p_phone IS NULL OR v_phone_normalized != v_discount.waitlist_phone THEN
          RETURN jsonb_build_object(
            'valid', false,
            'error', 'wrong_owner',
            'message', 'Mã Early Bird này chỉ dành cho email/SĐT đã đăng ký waitlist'
          );
        END IF;
      END IF;
    END IF;
  END IF;

  -- All checks passed
  RETURN jsonb_build_object(
    'valid', true,
    'discount_type', v_discount.discount_type,
    'discount_value', v_discount.discount_value,
    'code', v_discount.code,
    'description', v_discount.description,
    'applies_to', v_discount.applies_to,
    'message', 'Áp dụng thành công: Giảm ' ||
      CASE v_discount.discount_type
        WHEN 'percentage' THEN v_discount.discount_value || '%'
        ELSE v_discount.discount_value || 'đ'
      END
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 8: FUNCTION - Mark Discount Code as Used
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.use_discount_code(
  p_code TEXT,
  p_order_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_discount RECORD;
BEGIN
  -- Find and update discount code
  UPDATE public.discount_codes
  SET
    current_uses = current_uses + 1,
    is_active = CASE WHEN current_uses + 1 >= max_uses THEN FALSE ELSE is_active END,
    updated_at = NOW()
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = TRUE
  RETURNING * INTO v_discount;

  IF v_discount IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Discount code not found or inactive');
  END IF;

  -- Update early_bird_benefits if exists
  UPDATE public.early_bird_benefits
  SET
    discount_used = TRUE,
    discount_used_at = NOW(),
    discount_order_id = p_order_id,
    updated_at = NOW()
  WHERE discount_code = UPPER(p_code);

  RETURN jsonb_build_object(
    'success', true,
    'discount_id', v_discount.id,
    'current_uses', v_discount.current_uses + 1,
    'max_uses', v_discount.max_uses
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 9: FUNCTION - Get User's Early Bird Status
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_early_bird_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_benefit RECORD;
  v_profile RECORD;
  v_discount RECORD;
BEGIN
  -- Get profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Get benefits
  SELECT * INTO v_benefit FROM public.early_bird_benefits WHERE user_id = p_user_id;

  -- Get discount code if exists
  IF v_profile.early_bird_discount_code IS NOT NULL THEN
    SELECT * INTO v_discount
    FROM public.discount_codes
    WHERE code = v_profile.early_bird_discount_code;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_early_bird', v_benefit IS NOT NULL OR v_profile.queue_number IS NOT NULL,
    'queue_number', COALESCE(v_benefit.queue_number, v_profile.queue_number),
    'benefits', CASE WHEN v_benefit IS NOT NULL THEN jsonb_build_object(
      'discount_10_percent', v_benefit.discount_10_percent,
      'discount_code', v_benefit.discount_code,
      'discount_used', v_benefit.discount_used,
      'scanner_trial_14_days', v_benefit.scanner_trial_14_days,
      'scanner_trial_ends_at', v_benefit.scanner_trial_ends_at,
      'scanner_trial_expired', v_benefit.scanner_trial_expired,
      'crystal_gift', v_benefit.crystal_gift,
      'vip_group_access', v_benefit.vip_group_access
    ) ELSE NULL END,
    'scanner_trial', CASE WHEN v_profile.scanner_trial_ends_at IS NOT NULL THEN jsonb_build_object(
      'active', v_profile.scanner_trial_ends_at > NOW(),
      'tier', v_profile.scanner_trial_tier,
      'ends_at', v_profile.scanner_trial_ends_at,
      'days_remaining', EXTRACT(DAY FROM v_profile.scanner_trial_ends_at - NOW())::INTEGER
    ) ELSE NULL END,
    'discount_code_status', CASE WHEN v_discount IS NOT NULL THEN jsonb_build_object(
      'code', v_discount.code,
      'used', v_discount.current_uses > 0,
      'valid_until', v_discount.valid_until,
      'discount_value', v_discount.discount_value || '%'
    ) ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 10: TRIGGER - Auto-generate discount code on waitlist insert
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trigger_generate_early_bird_discount()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for first 100
  IF NEW.queue_number <= 100 AND NEW.discount_code IS NULL THEN
    NEW.discount_code := generate_early_bird_discount_code(NEW.id, NEW.queue_number);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_early_bird_discount ON public.waitlist_leads;
CREATE TRIGGER trg_generate_early_bird_discount
  BEFORE INSERT OR UPDATE ON public.waitlist_leads
  FOR EACH ROW
  WHEN (NEW.queue_number <= 100 AND NEW.discount_code IS NULL)
  EXECUTE FUNCTION public.trigger_generate_early_bird_discount();

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 11: RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_bird_benefits ENABLE ROW LEVEL SECURITY;

-- Discount codes policies
DROP POLICY IF EXISTS "Users can view own discount codes" ON public.discount_codes;
CREATE POLICY "Users can view own discount codes" ON public.discount_codes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access discount_codes" ON public.discount_codes;
CREATE POLICY "Service role full access discount_codes" ON public.discount_codes
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Early bird benefits policies
DROP POLICY IF EXISTS "Users can view own benefits" ON public.early_bird_benefits;
CREATE POLICY "Users can view own benefits" ON public.early_bird_benefits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access early_bird" ON public.early_bird_benefits;
CREATE POLICY "Service role full access early_bird" ON public.early_bird_benefits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 12: GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.generate_early_bird_discount_code TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_early_bird_benefits TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_scanner_trials TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_discount_code TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.use_discount_code TO service_role;
GRANT EXECUTE ON FUNCTION public.get_early_bird_status TO authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- PART 13: COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.discount_codes IS 'Discount codes for courses/products - synced with Shopify';
COMMENT ON TABLE public.early_bird_benefits IS 'Track Early Bird benefits granted to waitlist users';
COMMENT ON FUNCTION public.generate_early_bird_discount_code IS 'Generate 10% discount code for first 100 waitlist users';
COMMENT ON FUNCTION public.apply_early_bird_benefits IS 'Apply all Early Bird benefits when user creates account';
COMMENT ON FUNCTION public.expire_scanner_trials IS 'Cron job: Check and expire scanner trials that have ended';
COMMENT ON FUNCTION public.validate_discount_code IS 'Validate discount code before purchase';
COMMENT ON FUNCTION public.use_discount_code IS 'Mark discount code as used after purchase';
COMMENT ON FUNCTION public.get_early_bird_status IS 'Get user Early Bird benefits status';

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'Early Bird Benefits System migration completed!' as result;

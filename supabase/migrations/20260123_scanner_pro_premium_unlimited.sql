-- =====================================================
-- SCANNER PRO & PREMIUM - UNLIMITED QUOTA
-- January 23, 2026
--
-- Changes:
-- - Scanner PRO/TIER1: Changed from 20 scans/day to UNLIMITED
-- - Scanner PREMIUM/TIER2: Changed from 50 scans/day to UNLIMITED
-- - Only FREE tier has limited scans (5/day)
-- =====================================================

-- =====================================================
-- 1. UPDATE check_all_quotas FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION check_all_quotas(p_user_id UUID)
RETURNS TABLE (
    chatbot_tier TEXT,
    chatbot_limit INTEGER,
    chatbot_used INTEGER,
    chatbot_remaining INTEGER,
    chatbot_unlimited BOOLEAN,
    scanner_tier TEXT,
    scanner_limit INTEGER,
    scanner_used INTEGER,
    scanner_remaining INTEGER,
    scanner_unlimited BOOLEAN,
    today_date DATE,
    reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE;
    v_reset TIMESTAMPTZ;
    v_profile RECORD;
    v_chatbot_used INTEGER;
    v_scanner_used INTEGER;
    v_chatbot_limit INTEGER;
    v_scanner_limit INTEGER;
    v_is_unlimited BOOLEAN;
    v_effective_tier TEXT;
BEGIN
    -- Get Vietnam date (UTC+7)
    v_today := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
    v_reset := (v_today + INTERVAL '1 day')::TIMESTAMPTZ;

    -- Get profile (use aliases to avoid ambiguous column reference)
    SELECT
        p.chatbot_tier AS user_chatbot_tier,
        p.scanner_tier AS user_scanner_tier,
        p.is_admin,
        p.role
    INTO v_profile
    FROM profiles p
    WHERE p.id = p_user_id;

    -- Check if Admin or Manager (unlimited access)
    v_is_unlimited := (
        v_profile.is_admin = true OR
        v_profile.role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
        v_profile.user_chatbot_tier IN ('ADMIN', 'MANAGER') OR
        v_profile.user_scanner_tier IN ('ADMIN', 'MANAGER')
    );

    -- Determine effective tier for display
    IF v_profile.is_admin = true OR v_profile.role IN ('admin', 'ADMIN') THEN
        v_effective_tier := 'ADMIN';
    ELSIF v_profile.role IN ('manager', 'MANAGER') THEN
        v_effective_tier := 'MANAGER';
    ELSE
        v_effective_tier := NULL;
    END IF;

    -- Get chatbot usage
    SELECT COALESCE(queries_used, 0) INTO v_chatbot_used
    FROM chatbot_quota
    WHERE user_id = p_user_id AND date = v_today;
    v_chatbot_used := COALESCE(v_chatbot_used, 0);

    -- Get scanner usage
    SELECT COALESCE(scans_used, 0) INTO v_scanner_used
    FROM scanner_quota
    WHERE user_id = p_user_id AND date = v_today;
    v_scanner_used := COALESCE(v_scanner_used, 0);

    -- Calculate limits based on tier
    IF v_is_unlimited THEN
        v_chatbot_limit := -1;
        v_scanner_limit := -1;
    ELSE
        -- Chatbot limits (unchanged)
        v_chatbot_limit := CASE UPPER(COALESCE(v_profile.user_chatbot_tier, 'FREE'))
            WHEN 'TIER3' THEN -1
            WHEN 'VIP' THEN -1
            WHEN 'TIER2' THEN 50
            WHEN 'PREMIUM' THEN 50
            WHEN 'TIER1' THEN 15
            WHEN 'PRO' THEN 15
            ELSE 5
        END;

        -- Scanner limits - PRO and PREMIUM now UNLIMITED
        v_scanner_limit := CASE UPPER(COALESCE(v_profile.user_scanner_tier, 'FREE'))
            WHEN 'TIER3' THEN -1
            WHEN 'VIP' THEN -1
            WHEN 'TIER2' THEN -1   -- CHANGED: Was 50, now unlimited
            WHEN 'PREMIUM' THEN -1 -- CHANGED: Was 50, now unlimited
            WHEN 'TIER1' THEN -1   -- CHANGED: Was 20, now unlimited
            WHEN 'PRO' THEN -1     -- CHANGED: Was 20, now unlimited
            ELSE 5                 -- FREE tier: 5 scans/day
        END;
    END IF;

    RETURN QUERY SELECT
        COALESCE(v_effective_tier, UPPER(COALESCE(v_profile.user_chatbot_tier, 'FREE'))),
        v_chatbot_limit,
        v_chatbot_used,
        CASE WHEN v_chatbot_limit = -1 THEN -1 ELSE GREATEST(0, v_chatbot_limit - v_chatbot_used) END,
        v_is_unlimited OR v_chatbot_limit = -1,
        COALESCE(v_effective_tier, UPPER(COALESCE(v_profile.user_scanner_tier, 'FREE'))),
        v_scanner_limit,
        v_scanner_used,
        CASE WHEN v_scanner_limit = -1 THEN -1 ELSE GREATEST(0, v_scanner_limit - v_scanner_used) END,
        v_is_unlimited OR v_scanner_limit = -1,
        v_today,
        v_reset;
END;
$$;

-- =====================================================
-- 2. UPDATE increment_scanner_quota FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION increment_scanner_quota(p_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    used INTEGER,
    remaining INTEGER,
    limit_reached BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE;
    v_profile RECORD;
    v_is_unlimited BOOLEAN;
    v_current_used INTEGER;
    v_limit INTEGER;
BEGIN
    v_today := (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

    -- Get profile
    SELECT p.is_admin, p.role, p.scanner_tier AS user_scanner_tier INTO v_profile
    FROM profiles p WHERE p.id = p_user_id;

    -- Check if unlimited (Admin/Manager/VIP/PRO/PREMIUM - all paid tiers now unlimited)
    v_is_unlimited := (
        v_profile.is_admin = true OR
        v_profile.role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
        v_profile.user_scanner_tier IN ('TIER3', 'VIP', 'TIER2', 'PREMIUM', 'TIER1', 'PRO', 'ADMIN', 'MANAGER')
    );

    -- Get or create today's quota record
    INSERT INTO scanner_quota (user_id, date, scans_used)
    VALUES (p_user_id, v_today, 0)
    ON CONFLICT (user_id, date) DO NOTHING;

    -- Increment (still track usage for analytics even if unlimited)
    UPDATE scanner_quota
    SET scans_used = scans_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND date = v_today
    RETURNING scans_used INTO v_current_used;

    -- Calculate limit - PRO and PREMIUM now UNLIMITED
    IF v_is_unlimited THEN
        v_limit := -1;
    ELSE
        -- Only FREE tier has limited scans
        v_limit := 5;
    END IF;

    RETURN QUERY SELECT
        true,
        v_current_used,
        CASE WHEN v_limit = -1 THEN -1 ELSE GREATEST(0, v_limit - v_current_used) END,
        CASE WHEN v_limit = -1 THEN false ELSE v_current_used >= v_limit END;
END;
$$;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION check_all_quotas(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_scanner_quota(UUID) TO authenticated;

-- =====================================================
-- VERIFY
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Scanner PRO & PREMIUM Unlimited Quota Applied!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Scanner Tier Limits:';
    RAISE NOTICE '  - FREE: 5 scans/day';
    RAISE NOTICE '  - PRO/TIER1: UNLIMITED';
    RAISE NOTICE '  - PREMIUM/TIER2: UNLIMITED';
    RAISE NOTICE '  - VIP/TIER3: UNLIMITED';
    RAISE NOTICE '=====================================================';
END $$;

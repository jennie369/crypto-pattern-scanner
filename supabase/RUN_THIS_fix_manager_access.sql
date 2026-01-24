-- ============================================================
-- FIX: Manager role not getting unlimited access
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Update check_course_access to include Admin & Manager bypass
CREATE OR REPLACE FUNCTION check_course_access(
    user_id_param UUID,
    course_id_param TEXT
)
RETURNS TABLE(has_access BOOLEAN, reason TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    is_admin_flag BOOLEAN;
BEGIN
    -- First check if user is Admin or Manager - they bypass all restrictions
    SELECT p.role, p.is_admin INTO user_role, is_admin_flag
    FROM profiles p
    WHERE p.id = user_id_param;

    -- Admin and Manager always have access
    IF is_admin_flag = true OR
       user_role IN ('admin', 'ADMIN', 'manager', 'MANAGER') THEN
        RETURN QUERY SELECT true, 'admin_access'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Normal enrollment check
    RETURN QUERY
    SELECT
        CASE
            WHEN ce.id IS NOT NULL AND ce.is_active = true THEN true
            -- FREE courses are accessible to all
            WHEN c.tier_required IS NULL OR c.tier_required = 'FREE' THEN true
            ELSE false
        END AS has_access,
        CASE
            WHEN ce.id IS NOT NULL AND ce.is_active = true THEN 'enrolled'
            WHEN c.tier_required IS NULL OR c.tier_required = 'FREE' THEN 'free_course'
            WHEN ce.id IS NOT NULL AND ce.is_active = false THEN 'enrollment_expired'
            ELSE 'not_enrolled'
        END AS reason,
        ce.expires_at AS expires_at
    FROM courses c
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id AND ce.user_id = user_id_param
    WHERE c.id = course_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION check_course_access(UUID, TEXT) TO authenticated;

-- 2. Update check_all_quotas to include Manager bypass
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

    -- Get profile
    SELECT
        chatbot_tier,
        scanner_tier,
        is_admin,
        role
    INTO v_profile
    FROM profiles
    WHERE id = p_user_id;

    -- Check if Admin or Manager (unlimited access)
    v_is_unlimited := (
        v_profile.is_admin = true OR
        v_profile.role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
        v_profile.chatbot_tier IN ('ADMIN', 'MANAGER') OR
        v_profile.scanner_tier IN ('ADMIN', 'MANAGER')
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
        -- Chatbot limits
        v_chatbot_limit := CASE UPPER(COALESCE(v_profile.chatbot_tier, 'FREE'))
            WHEN 'TIER3' THEN -1
            WHEN 'VIP' THEN -1
            WHEN 'TIER2' THEN 50
            WHEN 'PREMIUM' THEN 50
            WHEN 'TIER1' THEN 15
            WHEN 'PRO' THEN 15
            ELSE 5
        END;

        -- Scanner limits
        v_scanner_limit := CASE UPPER(COALESCE(v_profile.scanner_tier, 'FREE'))
            WHEN 'TIER3' THEN -1
            WHEN 'VIP' THEN -1
            WHEN 'TIER2' THEN 50
            WHEN 'PREMIUM' THEN 50
            WHEN 'TIER1' THEN 20
            WHEN 'PRO' THEN 20
            ELSE 10
        END;
    END IF;

    RETURN QUERY SELECT
        COALESCE(v_effective_tier, UPPER(COALESCE(v_profile.chatbot_tier, 'FREE'))),
        v_chatbot_limit,
        v_chatbot_used,
        CASE WHEN v_chatbot_limit = -1 THEN -1 ELSE GREATEST(0, v_chatbot_limit - v_chatbot_used) END,
        v_is_unlimited OR v_chatbot_limit = -1,
        COALESCE(v_effective_tier, UPPER(COALESCE(v_profile.scanner_tier, 'FREE'))),
        v_scanner_limit,
        v_scanner_used,
        CASE WHEN v_scanner_limit = -1 THEN -1 ELSE GREATEST(0, v_scanner_limit - v_scanner_used) END,
        v_is_unlimited OR v_scanner_limit = -1,
        v_today,
        v_reset;
END;
$$;

GRANT EXECUTE ON FUNCTION check_all_quotas(UUID) TO authenticated;

-- 3. Update increment_chatbot_quota to skip increment for Admin/Manager
CREATE OR REPLACE FUNCTION increment_chatbot_quota(p_user_id UUID)
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
    SELECT is_admin, role, chatbot_tier INTO v_profile
    FROM profiles WHERE id = p_user_id;

    -- Check if unlimited (Admin/Manager/VIP)
    v_is_unlimited := (
        v_profile.is_admin = true OR
        v_profile.role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
        v_profile.chatbot_tier IN ('TIER3', 'VIP', 'ADMIN', 'MANAGER')
    );

    -- Get or create today's quota record
    INSERT INTO chatbot_quota (user_id, date, queries_used)
    VALUES (p_user_id, v_today, 0)
    ON CONFLICT (user_id, date) DO NOTHING;

    -- Increment
    UPDATE chatbot_quota
    SET queries_used = queries_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND date = v_today
    RETURNING queries_used INTO v_current_used;

    -- Calculate limit
    IF v_is_unlimited THEN
        v_limit := -1;
    ELSE
        v_limit := CASE UPPER(COALESCE(v_profile.chatbot_tier, 'FREE'))
            WHEN 'TIER2' THEN 50
            WHEN 'PREMIUM' THEN 50
            WHEN 'TIER1' THEN 15
            WHEN 'PRO' THEN 15
            ELSE 5
        END;
    END IF;

    RETURN QUERY SELECT
        true,
        v_current_used,
        CASE WHEN v_limit = -1 THEN -1 ELSE GREATEST(0, v_limit - v_current_used) END,
        CASE WHEN v_limit = -1 THEN false ELSE v_current_used >= v_limit END;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_chatbot_quota(UUID) TO authenticated;

-- 4. Update increment_scanner_quota to skip increment for Admin/Manager
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
    SELECT is_admin, role, scanner_tier INTO v_profile
    FROM profiles WHERE id = p_user_id;

    -- Check if unlimited
    v_is_unlimited := (
        v_profile.is_admin = true OR
        v_profile.role IN ('admin', 'ADMIN', 'manager', 'MANAGER') OR
        v_profile.scanner_tier IN ('TIER3', 'VIP', 'ADMIN', 'MANAGER')
    );

    -- Get or create today's quota record
    INSERT INTO scanner_quota (user_id, date, scans_used)
    VALUES (p_user_id, v_today, 0)
    ON CONFLICT (user_id, date) DO NOTHING;

    -- Increment
    UPDATE scanner_quota
    SET scans_used = scans_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND date = v_today
    RETURNING scans_used INTO v_current_used;

    -- Calculate limit
    IF v_is_unlimited THEN
        v_limit := -1;
    ELSE
        v_limit := CASE UPPER(COALESCE(v_profile.scanner_tier, 'FREE'))
            WHEN 'TIER2' THEN 50
            WHEN 'PREMIUM' THEN 50
            WHEN 'TIER1' THEN 20
            WHEN 'PRO' THEN 20
            ELSE 10
        END;
    END IF;

    RETURN QUERY SELECT
        true,
        v_current_used,
        CASE WHEN v_limit = -1 THEN -1 ELSE GREATEST(0, v_limit - v_current_used) END,
        CASE WHEN v_limit = -1 THEN false ELSE v_current_used >= v_limit END;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_scanner_quota(UUID) TO authenticated;

-- ============================================================
-- DONE - Reload app to test Manager access
-- ============================================================
SELECT 'Manager access fix applied successfully!' AS result;

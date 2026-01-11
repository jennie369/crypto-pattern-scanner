-- ============================================================
-- GEM PARTNERSHIP SYSTEM v3.0 - CRON JOBS
-- Date: 2024-12-28
-- Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
-- ============================================================

-- ============================================================
-- RPC: Auto-approve CTV applications after 3 days
-- Called by cron job every hour
-- ============================================================
CREATE OR REPLACE FUNCTION auto_approve_ctv_applications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_app RECORD;
  v_referral_code TEXT;
  v_referrer_id UUID;
BEGIN
  FOR v_app IN
    SELECT * FROM partnership_applications
    WHERE application_type = 'ctv'
      AND status = 'pending'
      AND auto_approve_at IS NOT NULL
      AND auto_approve_at <= NOW()
  LOOP
    -- Generate unique referral code
    v_referral_code := 'CTV' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- Check for referrer
    v_referrer_id := NULL;
    IF v_app.referred_by_code IS NOT NULL THEN
      SELECT user_id INTO v_referrer_id
      FROM affiliate_profiles
      WHERE referral_code = v_app.referred_by_code;
    END IF;

    -- Update application status
    UPDATE partnership_applications
    SET status = 'approved',
        reviewed_at = NOW(),
        admin_notes = 'Tự động duyệt sau 3 ngày'
    WHERE id = v_app.id;

    -- Create or update affiliate profile
    INSERT INTO affiliate_profiles (
      user_id,
      referral_code,
      role,
      ctv_tier,
      referred_by,
      payment_schedule,
      resource_access_level,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      v_app.user_id,
      v_referral_code,
      'ctv',
      'bronze',
      v_referrer_id,
      'monthly',
      'basic',
      TRUE,
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
      is_active = TRUE,
      updated_at = NOW();

    -- Create notification
    INSERT INTO partner_notifications (
      user_id,
      notification_type,
      title,
      message,
      metadata
    ) VALUES (
      v_app.user_id,
      'application_approved',
      '🎉 Đơn đăng ký CTV được duyệt!',
      'Chúc mừng! Bạn đã trở thành Đối Tác Phát Triển 🥉 Đồng. Mã giới thiệu của bạn: ' || v_referral_code,
      JSONB_BUILD_OBJECT('referral_code', v_referral_code, 'tier', 'bronze')
    );

    -- Mark for onboarding
    UPDATE profiles
    SET pending_onboarding = 'ctv_partner'
    WHERE id = v_app.user_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Weekly tier upgrade check (every Monday)
-- Upgrade CTVs who have reached next tier threshold
-- ============================================================
CREATE OR REPLACE FUNCTION process_weekly_tier_upgrades()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_profile RECORD;
  v_new_tier TEXT;
  v_old_tier TEXT;
  v_payment_schedule TEXT;
BEGIN
  FOR v_profile IN
    SELECT * FROM affiliate_profiles
    WHERE role = 'ctv'
      AND is_active = TRUE
  LOOP
    v_old_tier := v_profile.ctv_tier;

    -- Determine new tier based on total_sales
    v_new_tier := CASE
      WHEN v_profile.total_sales >= 800000000 THEN 'diamond'
      WHEN v_profile.total_sales >= 400000000 THEN 'platinum'
      WHEN v_profile.total_sales >= 150000000 THEN 'gold'
      WHEN v_profile.total_sales >= 50000000 THEN 'silver'
      ELSE 'bronze'
    END;

    -- Only upgrade (never downgrade in weekly check)
    IF v_new_tier != v_old_tier AND (
      (v_old_tier = 'bronze' AND v_new_tier IN ('silver', 'gold', 'platinum', 'diamond')) OR
      (v_old_tier = 'silver' AND v_new_tier IN ('gold', 'platinum', 'diamond')) OR
      (v_old_tier = 'gold' AND v_new_tier IN ('platinum', 'diamond')) OR
      (v_old_tier = 'platinum' AND v_new_tier = 'diamond')
    ) THEN
      -- Determine payment schedule
      v_payment_schedule := CASE v_new_tier
        WHEN 'diamond' THEN 'weekly'
        WHEN 'platinum' THEN 'weekly'
        WHEN 'gold' THEN 'biweekly'
        ELSE 'monthly'
      END;

      -- Update tier
      UPDATE affiliate_profiles
      SET ctv_tier = v_new_tier,
          payment_schedule = v_payment_schedule,
          last_upgrade_at = NOW(),
          updated_at = NOW()
      WHERE id = v_profile.id;

      -- Create notification
      INSERT INTO partner_notifications (
        user_id,
        notification_type,
        title,
        message,
        metadata
      ) VALUES (
        v_profile.user_id,
        'tier_upgrade',
        '🎉 Chúc mừng thăng cấp!',
        'Bạn đã lên ' || CASE v_new_tier
          WHEN 'diamond' THEN '👑 Kim Cương'
          WHEN 'platinum' THEN '💎 Bạch Kim'
          WHEN 'gold' THEN '🥇 Vàng'
          WHEN 'silver' THEN '🥈 Bạc'
          ELSE '🥉 Đồng'
        END || ' từ ' || CASE v_old_tier
          WHEN 'diamond' THEN '👑 Kim Cương'
          WHEN 'platinum' THEN '💎 Bạch Kim'
          WHEN 'gold' THEN '🥇 Vàng'
          WHEN 'silver' THEN '🥈 Bạc'
          ELSE '🥉 Đồng'
        END,
        JSONB_BUILD_OBJECT('old_tier', v_old_tier, 'new_tier', v_new_tier)
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Monthly tier downgrade check (last day of month)
-- Downgrade CTVs who have monthly_sales < 10% of tier threshold
-- ============================================================
CREATE OR REPLACE FUNCTION process_monthly_tier_downgrades()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_profile RECORD;
  v_new_tier TEXT;
  v_old_tier TEXT;
  v_min_required DECIMAL;
  v_payment_schedule TEXT;
BEGIN
  FOR v_profile IN
    SELECT * FROM affiliate_profiles
    WHERE role = 'ctv'
      AND is_active = TRUE
      AND ctv_tier != 'bronze'  -- Bronze never downgrades
  LOOP
    v_old_tier := v_profile.ctv_tier;

    -- Calculate minimum required monthly sales (10% of tier threshold)
    v_min_required := CASE v_old_tier
      WHEN 'diamond' THEN 80000000   -- 10% of 800M
      WHEN 'platinum' THEN 40000000  -- 10% of 400M
      WHEN 'gold' THEN 15000000      -- 10% of 150M
      WHEN 'silver' THEN 5000000     -- 10% of 50M
      ELSE 0
    END;

    -- Check if monthly_sales is below minimum
    IF COALESCE(v_profile.monthly_sales, 0) < v_min_required THEN
      -- Downgrade by one tier
      v_new_tier := CASE v_old_tier
        WHEN 'diamond' THEN 'platinum'
        WHEN 'platinum' THEN 'gold'
        WHEN 'gold' THEN 'silver'
        WHEN 'silver' THEN 'bronze'
        ELSE 'bronze'
      END;

      -- Determine payment schedule
      v_payment_schedule := CASE v_new_tier
        WHEN 'diamond' THEN 'weekly'
        WHEN 'platinum' THEN 'weekly'
        WHEN 'gold' THEN 'biweekly'
        ELSE 'monthly'
      END;

      -- Update tier
      UPDATE affiliate_profiles
      SET ctv_tier = v_new_tier,
          payment_schedule = v_payment_schedule,
          last_downgrade_at = NOW(),
          updated_at = NOW()
      WHERE id = v_profile.id;

      -- Create notification
      INSERT INTO partner_notifications (
        user_id,
        notification_type,
        title,
        message,
        metadata
      ) VALUES (
        v_profile.user_id,
        'tier_downgrade',
        '📉 Thông báo giảm cấp',
        'Tier của bạn đã giảm xuống ' || CASE v_new_tier
          WHEN 'platinum' THEN '💎 Bạch Kim'
          WHEN 'gold' THEN '🥇 Vàng'
          WHEN 'silver' THEN '🥈 Bạc'
          ELSE '🥉 Đồng'
        END || '. Doanh số tháng chưa đạt 10% ngưỡng tier. Hãy tăng doanh số để lên lại!',
        JSONB_BUILD_OBJECT('old_tier', v_old_tier, 'new_tier', v_new_tier, 'required', v_min_required, 'actual', v_profile.monthly_sales)
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Reset monthly sales (1st of every month)
-- ============================================================
CREATE OR REPLACE FUNCTION reset_monthly_sales()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE affiliate_profiles
  SET monthly_sales = 0,
      updated_at = NOW()
  WHERE monthly_sales > 0;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- pg_cron JOBS SETUP
-- Note: Run these AFTER enabling pg_cron extension
-- SELECT cron.schedule(...) commands
-- ============================================================

-- To enable pg_cron, run in Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule jobs (run these after pg_cron is enabled):
--
-- 1. Auto-approve CTV applications - Every hour
-- SELECT cron.schedule(
--   'ctv-auto-approve',
--   '0 * * * *',
--   $$ SELECT auto_approve_ctv_applications(); $$
-- );
--
-- 2. Weekly tier upgrade - Every Monday at 00:00 UTC+7 (Sunday 17:00 UTC)
-- SELECT cron.schedule(
--   'weekly-tier-upgrade',
--   '0 17 * * 0',
--   $$ SELECT process_weekly_tier_upgrades(); $$
-- );
--
-- 3. Monthly tier downgrade - Last day of month at 23:59 UTC+7 (16:59 UTC)
-- SELECT cron.schedule(
--   'monthly-tier-downgrade',
--   '59 16 28-31 * *',
--   $$
--     SELECT CASE
--       WHEN DATE_PART('day', (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::DATE) = DATE_PART('day', NOW())
--       THEN process_monthly_tier_downgrades()
--       ELSE 0
--     END;
--   $$
-- );
--
-- 4. Reset monthly sales - 1st of every month at 00:00 UTC+7 (previous day 17:00 UTC)
-- SELECT cron.schedule(
--   'reset-monthly-sales',
--   '0 17 1 * *',
--   $$ SELECT reset_monthly_sales(); $$
-- );
--
-- To view scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To unschedule a job:
-- SELECT cron.unschedule('job-name');

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION auto_approve_ctv_applications() TO service_role;
GRANT EXECUTE ON FUNCTION process_weekly_tier_upgrades() TO service_role;
GRANT EXECUTE ON FUNCTION process_monthly_tier_downgrades() TO service_role;
GRANT EXECUTE ON FUNCTION reset_monthly_sales() TO service_role;

-- ============================================================
-- COMMENT FOR DOCUMENTATION
-- ============================================================
COMMENT ON FUNCTION auto_approve_ctv_applications() IS 'GEM Partnership v3.0: Auto-approve CTV applications after 3 days';
COMMENT ON FUNCTION process_weekly_tier_upgrades() IS 'GEM Partnership v3.0: Weekly tier upgrade check (every Monday)';
COMMENT ON FUNCTION process_monthly_tier_downgrades() IS 'GEM Partnership v3.0: Monthly tier downgrade check (last day of month, <10% threshold)';
COMMENT ON FUNCTION reset_monthly_sales() IS 'GEM Partnership v3.0: Reset monthly_sales to 0 on 1st of month';

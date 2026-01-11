-- ============================================================
-- PARTNERSHIP SYSTEM v3.0 MIGRATION
-- Date: 2024-12-28
-- Description:
--   - Upgrade CTV từ 4 tiers (EN) sang 5 tiers (VN)
--   - Thêm sub-affiliate system
--   - Thêm KOL verification
--   - Auto-approve CTV sau 3 ngày
-- Reference: GEM_PARTNERSHIP_OFFICIAL_POLICY_V3.md
-- ============================================================

-- ============================================================
-- 1. AFFILIATE_PROFILES - Add new columns
-- ============================================================

-- Add referred_by for sub-affiliate tracking
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- Add sub_affiliate_earnings to track earnings from referrals
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS sub_affiliate_earnings DECIMAL(15,2) DEFAULT 0;

-- Add monthly_sales for downgrade evaluation
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS monthly_sales DECIMAL(15,2) DEFAULT 0;

-- Add tier evaluation timestamps
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_tier_check_at TIMESTAMPTZ;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_upgrade_at TIMESTAMPTZ;

ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS last_downgrade_at TIMESTAMPTZ;

-- Add payment_schedule (monthly, biweekly, weekly)
ALTER TABLE affiliate_profiles
  ADD COLUMN IF NOT EXISTS payment_schedule VARCHAR(20) DEFAULT 'monthly';

-- ============================================================
-- 2. UPDATE CTV_TIER CONSTRAINT - 5 tiers Vietnamese
-- ============================================================

-- Drop old constraint
ALTER TABLE affiliate_profiles
  DROP CONSTRAINT IF EXISTS affiliate_profiles_ctv_tier_check;

-- Add new constraint with 5 VN tiers
ALTER TABLE affiliate_profiles
  ADD CONSTRAINT affiliate_profiles_ctv_tier_check
  CHECK (ctv_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'));

-- ============================================================
-- 3. UPDATE ROLE CONSTRAINT - ctv and kol only
-- ============================================================

-- Drop old constraint
ALTER TABLE affiliate_profiles
  DROP CONSTRAINT IF EXISTS affiliate_profiles_role_check;

-- Add new constraint
ALTER TABLE affiliate_profiles
  ADD CONSTRAINT affiliate_profiles_role_check
  CHECK (role IN ('ctv', 'kol'));

-- ============================================================
-- 4. MIGRATE EXISTING TIER VALUES (EN -> VN)
-- ============================================================

-- beginner -> bronze
UPDATE affiliate_profiles
SET ctv_tier = 'bronze'
WHERE ctv_tier = 'beginner';

-- growing -> silver
UPDATE affiliate_profiles
SET ctv_tier = 'silver'
WHERE ctv_tier = 'growing';

-- master -> gold
UPDATE affiliate_profiles
SET ctv_tier = 'gold'
WHERE ctv_tier = 'master';

-- grand -> diamond
UPDATE affiliate_profiles
SET ctv_tier = 'diamond'
WHERE ctv_tier = 'grand';

-- ============================================================
-- 5. MIGRATE AFFILIATE 3% USERS TO CTV BRONZE
-- User decision: Affiliate 3% -> CTV Bronze (10% digital, 6% physical)
-- ============================================================

UPDATE affiliate_profiles
SET role = 'ctv', ctv_tier = 'bronze'
WHERE role = 'affiliate';

-- ============================================================
-- 6. PARTNERSHIP_APPLICATIONS - Add KOL fields
-- ============================================================

-- Add social_platforms JSONB (e.g., {"youtube": 50000, "facebook": 30000})
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS social_platforms JSONB DEFAULT '{}';

-- Add total_followers for KOL eligibility check
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS total_followers INTEGER DEFAULT 0;

-- Add social_proof_urls for verification
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS social_proof_urls TEXT[];

-- Add referred_by_code for sub-affiliate tracking
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(50);

-- Add auto_approve_at for CTV auto-approve (3 days)
ALTER TABLE partnership_applications
  ADD COLUMN IF NOT EXISTS auto_approve_at TIMESTAMPTZ;

-- ============================================================
-- 7. AFFILIATE_COMMISSIONS - Add sub-affiliate tracking
-- ============================================================

-- Add affiliate_role for commission calculation
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS affiliate_role VARCHAR(20);

-- Add affiliate_tier for commission calculation
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS affiliate_tier VARCHAR(20);

-- Add sub_affiliate_id (who referred this affiliate)
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS sub_affiliate_id UUID REFERENCES auth.users(id);

-- Add sub_affiliate_commission amount
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS sub_affiliate_commission DECIMAL(15,2) DEFAULT 0;

-- Add sub_affiliate_rate used
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS sub_affiliate_rate DECIMAL(5,4);

-- ============================================================
-- 8. CREATE PARTNER_NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification info
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'application_approved', 'application_rejected',
    'tier_upgrade', 'tier_downgrade',
    'commission_earned', 'commission_paid',
    'sub_affiliate_joined', 'sub_affiliate_earned',
    'payment_scheduled', 'payment_processed'
  )),

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Related data
  related_id UUID,
  related_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. RLS FOR PARTNER_NOTIFICATIONS
-- ============================================================

ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON partner_notifications;
CREATE POLICY "Users can view own notifications" ON partner_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON partner_notifications;
CREATE POLICY "Users can update own notifications" ON partner_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert
DROP POLICY IF EXISTS "Service can insert notifications" ON partner_notifications;
CREATE POLICY "Service can insert notifications" ON partner_notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 10. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_referred_by
  ON affiliate_profiles(referred_by);

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_payment_schedule
  ON affiliate_profiles(payment_schedule);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_sub_affiliate_id
  ON affiliate_commissions(sub_affiliate_id);

CREATE INDEX IF NOT EXISTS idx_partner_notifications_user_unread
  ON partner_notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_partnership_applications_auto_approve
  ON partnership_applications(auto_approve_at)
  WHERE status = 'pending';

-- ============================================================
-- 11. TRIGGER: Auto-set auto_approve_at for CTV applications
-- ============================================================

CREATE OR REPLACE FUNCTION set_ctv_auto_approve_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_type = 'ctv' AND NEW.status = 'pending' THEN
    NEW.auto_approve_at = NEW.created_at + INTERVAL '3 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_ctv_auto_approve ON partnership_applications;
CREATE TRIGGER trg_set_ctv_auto_approve
  BEFORE INSERT ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_ctv_auto_approve_at();

-- Update existing pending CTV applications
UPDATE partnership_applications
SET auto_approve_at = created_at + INTERVAL '3 days'
WHERE application_type = 'ctv'
  AND status = 'pending'
  AND auto_approve_at IS NULL;

-- ============================================================
-- 12. RPC: Get commission rate v3
-- Returns commission rate based on role, tier, and product type
-- ============================================================

CREATE OR REPLACE FUNCTION get_commission_rate_v3(
  p_role VARCHAR,
  p_tier VARCHAR,
  p_product_type VARCHAR
) RETURNS DECIMAL AS $$
BEGIN
  -- KOL: 20% for all products
  IF p_role = 'kol' THEN
    RETURN 0.20;
  END IF;

  -- CTV rates based on tier and product type
  RETURN CASE p_tier
    WHEN 'bronze' THEN
      CASE WHEN p_product_type = 'digital' THEN 0.10 ELSE 0.06 END
    WHEN 'silver' THEN
      CASE WHEN p_product_type = 'digital' THEN 0.15 ELSE 0.08 END
    WHEN 'gold' THEN
      CASE WHEN p_product_type = 'digital' THEN 0.20 ELSE 0.10 END
    WHEN 'platinum' THEN
      CASE WHEN p_product_type = 'digital' THEN 0.25 ELSE 0.12 END
    WHEN 'diamond' THEN
      CASE WHEN p_product_type = 'digital' THEN 0.30 ELSE 0.15 END
    ELSE 0.10 -- Default bronze digital rate
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 13. RPC: Get sub-affiliate rate v3
-- Returns sub-affiliate rate based on referrer's role and tier
-- ============================================================

CREATE OR REPLACE FUNCTION get_sub_affiliate_rate_v3(
  p_role VARCHAR,
  p_tier VARCHAR
) RETURNS DECIMAL AS $$
BEGIN
  -- KOL: 3.5%
  IF p_role = 'kol' THEN
    RETURN 0.035;
  END IF;

  -- CTV rates based on tier
  RETURN CASE p_tier
    WHEN 'bronze' THEN 0.02
    WHEN 'silver' THEN 0.025
    WHEN 'gold' THEN 0.03
    WHEN 'platinum' THEN 0.035
    WHEN 'diamond' THEN 0.04
    ELSE 0.02 -- Default bronze rate
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 14. RPC: Get tier by total sales
-- Returns tier based on total sales amount
-- ============================================================

CREATE OR REPLACE FUNCTION get_tier_by_total_sales(
  p_total_sales DECIMAL
) RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE
    WHEN p_total_sales >= 800000000 THEN 'diamond'   -- 800M VND
    WHEN p_total_sales >= 400000000 THEN 'platinum'  -- 400M VND
    WHEN p_total_sales >= 150000000 THEN 'gold'      -- 150M VND
    WHEN p_total_sales >= 50000000 THEN 'silver'     -- 50M VND
    ELSE 'bronze'
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 15. RPC: Auto-approve pending CTV applications (3 days)
-- Called by scheduled job every hour
-- ============================================================

CREATE OR REPLACE FUNCTION auto_approve_ctv_applications()
RETURNS TABLE(approved_count INTEGER, approved_ids UUID[]) AS $$
DECLARE
  v_app RECORD;
  v_approved_ids UUID[] := '{}';
  v_count INTEGER := 0;
  v_referrer_id UUID;
BEGIN
  FOR v_app IN
    SELECT * FROM partnership_applications
    WHERE application_type = 'ctv'
      AND status = 'pending'
      AND auto_approve_at <= NOW()
  LOOP
    -- 1. Approve the application
    UPDATE partnership_applications
    SET status = 'approved',
        reviewed_at = NOW(),
        admin_notes = 'Tự động duyệt sau 3 ngày'
    WHERE id = v_app.id;

    -- 2. Find referrer if referred_by_code exists
    v_referrer_id := NULL;
    IF v_app.referred_by_code IS NOT NULL AND v_app.referred_by_code != '' THEN
      SELECT user_id INTO v_referrer_id
      FROM affiliate_profiles
      WHERE referral_code = v_app.referred_by_code;
    END IF;

    -- 3. Create/update affiliate profile
    INSERT INTO affiliate_profiles (
      user_id,
      referral_code,
      role,
      ctv_tier,
      referred_by,
      payment_schedule,
      is_active
    ) VALUES (
      v_app.user_id,
      'GEM' || upper(substring(md5(random()::text) from 1 for 8)),
      'ctv',
      'bronze',
      v_referrer_id,
      'monthly',
      TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'ctv',
      ctv_tier = COALESCE(affiliate_profiles.ctv_tier, 'bronze'),
      referred_by = COALESCE(affiliate_profiles.referred_by, v_referrer_id),
      is_active = TRUE,
      updated_at = NOW();

    -- 4. Create notification for approved user
    INSERT INTO partner_notifications (
      user_id,
      notification_type,
      title,
      message,
      related_id,
      related_type,
      metadata
    ) VALUES (
      v_app.user_id,
      'application_approved',
      '🎉 Chúc mừng! Đơn đăng ký CTV đã được duyệt',
      'Bạn đã chính thức trở thành Đối Tác Phát Triển 🥉 Đồng. Hãy bắt đầu chia sẻ link giới thiệu để nhận hoa hồng!',
      v_app.id,
      'application',
      jsonb_build_object(
        'tier', 'bronze',
        'role', 'ctv',
        'auto_approved', true
      )
    );

    -- 5. Notify referrer if exists
    IF v_referrer_id IS NOT NULL THEN
      INSERT INTO partner_notifications (
        user_id,
        notification_type,
        title,
        message,
        related_id,
        related_type
      ) VALUES (
        v_referrer_id,
        'sub_affiliate_joined',
        '👥 Có đối tác mới từ link giới thiệu của bạn!',
        'Một đối tác mới đã đăng ký thành công qua link của bạn. Bạn sẽ nhận hoa hồng từ doanh số của họ!',
        v_app.user_id,
        'user'
      );
    END IF;

    v_approved_ids := array_append(v_approved_ids, v_app.id);
    v_count := v_count + 1;
  END LOOP;

  RETURN QUERY SELECT v_count, v_approved_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 16. RPC: Get partner dashboard stats
-- Returns comprehensive partner stats
-- ============================================================

CREATE OR REPLACE FUNCTION get_partner_dashboard_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_profile affiliate_profiles%ROWTYPE;
  v_tier_config JSONB;
BEGIN
  -- Get profile
  SELECT * INTO v_profile
  FROM affiliate_profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;

  -- Build tier config
  v_tier_config := CASE v_profile.ctv_tier
    WHEN 'bronze' THEN jsonb_build_object(
      'name', 'Đồng', 'icon', '🥉', 'color', '#CD7F32',
      'digital', 0.10, 'physical', 0.06, 'subAffiliate', 0.02
    )
    WHEN 'silver' THEN jsonb_build_object(
      'name', 'Bạc', 'icon', '🥈', 'color', '#C0C0C0',
      'digital', 0.15, 'physical', 0.08, 'subAffiliate', 0.025
    )
    WHEN 'gold' THEN jsonb_build_object(
      'name', 'Vàng', 'icon', '🥇', 'color', '#FFD700',
      'digital', 0.20, 'physical', 0.10, 'subAffiliate', 0.03
    )
    WHEN 'platinum' THEN jsonb_build_object(
      'name', 'Bạch Kim', 'icon', '💎', 'color', '#E5E4E2',
      'digital', 0.25, 'physical', 0.12, 'subAffiliate', 0.035
    )
    WHEN 'diamond' THEN jsonb_build_object(
      'name', 'Kim Cương', 'icon', '👑', 'color', '#00F0FF',
      'digital', 0.30, 'physical', 0.15, 'subAffiliate', 0.04
    )
    ELSE jsonb_build_object(
      'name', 'Đồng', 'icon', '🥉', 'color', '#CD7F32',
      'digital', 0.10, 'physical', 0.06, 'subAffiliate', 0.02
    )
  END;

  v_result := jsonb_build_object(
    'role', v_profile.role,
    'tier', v_profile.ctv_tier,
    'tierConfig', v_tier_config,
    'total_sales', COALESCE(v_profile.total_sales, 0),
    'monthly_sales', COALESCE(v_profile.monthly_sales, 0),
    'total_commission', COALESCE(v_profile.total_commission, 0),
    'available_balance', COALESCE(v_profile.available_balance, 0),
    'sub_affiliate_earnings', COALESCE(v_profile.sub_affiliate_earnings, 0),
    'referral_code', v_profile.referral_code,
    'payment_schedule', v_profile.payment_schedule,
    'referred_count', (
      SELECT COUNT(*) FROM affiliate_profiles
      WHERE referred_by = p_user_id
    ),
    'pending_commission', (
      SELECT COALESCE(SUM(commission_amount), 0)
      FROM affiliate_commissions
      WHERE affiliate_id = p_user_id AND status = 'pending'
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM partner_notifications
      WHERE user_id = p_user_id AND is_read = FALSE
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 17. COMMENT ON TABLES
-- ============================================================

COMMENT ON TABLE partner_notifications IS 'Notification history for partnership events (v3.0)';
COMMENT ON FUNCTION get_commission_rate_v3 IS 'Get commission rate based on role, tier, product type (v3.0)';
COMMENT ON FUNCTION get_sub_affiliate_rate_v3 IS 'Get sub-affiliate rate based on referrer role and tier (v3.0)';
COMMENT ON FUNCTION auto_approve_ctv_applications IS 'Auto-approve CTV applications after 3 days (v3.0)';
COMMENT ON FUNCTION get_partner_dashboard_stats IS 'Get comprehensive partner dashboard stats (v3.0)';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

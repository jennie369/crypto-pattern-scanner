-- ============================================================
-- KOL VERIFICATION TABLE + PARTNER_NOTIFICATIONS
-- Date: 2026-02-17
-- Deployed via Supabase MCP as two migrations:
--   1. create_partner_notifications_table
--   2. create_kol_verification_table
-- Root cause: both tables were referenced by services but
--   never created in the database.
-- ============================================================

-- ============================================================
-- 1. CREATE partner_notifications TABLE
-- Was defined in 20241228_partnership_v3.sql but never applied.
-- Used by 4 services + 2 edge functions.
-- ============================================================

CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'application_approved', 'application_rejected',
    'tier_upgrade', 'tier_downgrade',
    'commission_earned', 'commission_paid',
    'sub_affiliate_joined', 'sub_affiliate_earned',
    'payment_scheduled', 'payment_processed',
    'account_deactivated', 'account_reactivated'
  )),

  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  related_id UUID,
  related_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',

  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner notifications"
  ON partner_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own partner notifications"
  ON partner_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert partner notifications"
  ON partner_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all partner notifications"
  ON partner_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE INDEX IF NOT EXISTS idx_partner_notifications_user_unread
  ON partner_notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_partner_notifications_user_id
  ON partner_notifications(user_id, created_at DESC);

COMMENT ON TABLE partner_notifications IS 'Notification history for partnership events (v3.0)';

-- ============================================================
-- 2. CREATE kol_verification TABLE
-- Referenced by 3 services but never created.
-- Stores KYC data (ID images) and social media URLs for KOL applicants.
-- ============================================================

CREATE TABLE IF NOT EXISTS kol_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES partnership_applications(id) ON DELETE SET NULL,

  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  id_type VARCHAR(20) DEFAULT 'cccd' CHECK (id_type IN ('cccd', 'passport', 'cmnd')),
  id_number VARCHAR(50),
  id_front_image_url TEXT,
  id_back_image_url TEXT,
  portrait_image_url TEXT,

  youtube_url TEXT,
  youtube_followers INTEGER DEFAULT 0,
  facebook_url TEXT,
  facebook_followers INTEGER DEFAULT 0,
  instagram_url TEXT,
  instagram_followers INTEGER DEFAULT 0,
  tiktok_url TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_url TEXT,
  twitter_followers INTEGER DEFAULT 0,
  discord_url TEXT,
  discord_members INTEGER DEFAULT 0,
  telegram_url TEXT,
  telegram_members INTEGER DEFAULT 0,

  verification_status VARCHAR(20) DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kol_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification"
  ON kol_verification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON kol_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verifications"
  ON kol_verification FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update verifications"
  ON kol_verification FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

CREATE INDEX IF NOT EXISTS idx_kol_verification_user_id
  ON kol_verification(user_id);

CREATE INDEX IF NOT EXISTS idx_kol_verification_application_id
  ON kol_verification(application_id);

CREATE INDEX IF NOT EXISTS idx_kol_verification_status
  ON kol_verification(verification_status)
  WHERE verification_status = 'pending';

CREATE OR REPLACE FUNCTION update_kol_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kol_verification_updated_at
  BEFORE UPDATE ON kol_verification
  FOR EACH ROW
  EXECUTE FUNCTION update_kol_verification_updated_at();

COMMENT ON TABLE kol_verification IS 'KYC verification data for KOL applicants — ID documents and social media proof';

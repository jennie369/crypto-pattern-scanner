-- ============================================================
-- PAYMENT AUTOMATION SYSTEM
-- Created: 2024-12-26
-- Purpose: Track bank transfers và manage user access
-- ============================================================

-- ============================================================
-- TABLE 1: pending_payments
-- Track các đơn hàng chờ thanh toán chuyển khoản
-- ============================================================

CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Shopify Order Info
  shopify_order_id VARCHAR(50) NOT NULL,
  order_number VARCHAR(20) NOT NULL,
  checkout_token VARCHAR(100),

  -- Customer Info
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_name VARCHAR(255),

  -- Payment Info
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  transfer_content VARCHAR(100) NOT NULL,  -- DH{orderNumber}

  -- QR Code
  qr_code_url TEXT,

  -- Bank Info (for reference)
  bank_name VARCHAR(50) DEFAULT 'Vietcombank',
  bank_account VARCHAR(20) DEFAULT '1074286868',
  bank_account_name VARCHAR(100) DEFAULT 'CT TNHH GEM CAPITAL HOLDING',

  -- Status
  payment_status VARCHAR(20) DEFAULT 'pending',
  -- pending: chờ thanh toán
  -- verifying: đang xác minh (số tiền không khớp)
  -- paid: đã thanh toán
  -- expired: hết hạn
  -- cancelled: đã hủy

  -- Verification Info
  bank_transaction_id VARCHAR(100),
  verified_amount DECIMAL(15,2),
  verified_at TIMESTAMPTZ,
  verification_method VARCHAR(20),  -- auto, manual
  verification_note TEXT,

  -- Manual Upload (backup)
  proof_image_url TEXT,
  proof_uploaded_at TIMESTAMPTZ,

  -- Reminder tracking
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- created_at + 24h
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_pending_shopify_order UNIQUE(shopify_order_id),
  CONSTRAINT unique_pending_order_number UNIQUE(order_number)
);

-- Indexes for pending_payments
CREATE INDEX IF NOT EXISTS idx_pending_payments_order_number
  ON pending_payments(order_number);
CREATE INDEX IF NOT EXISTS idx_pending_payments_transfer_content
  ON pending_payments(transfer_content);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status
  ON pending_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_expires
  ON pending_payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_payments_email
  ON pending_payments(customer_email);

-- RLS for pending_payments
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Service role có full access
CREATE POLICY "Service role full access on pending_payments"
  ON pending_payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users có thể xem payment của mình qua email
CREATE POLICY "Users can view own payments"
  ON pending_payments FOR SELECT
  USING (
    customer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );


-- ============================================================
-- TABLE 2: user_access
-- Quản lý quyền truy cập của users (sync từ Shopify)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User identifier
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Access Tiers (0 = free, 1/2/3 = paid tiers)
  scanner_tier INTEGER DEFAULT 0 CHECK (scanner_tier >= 0 AND scanner_tier <= 3),
  course_tier INTEGER DEFAULT 0 CHECK (course_tier >= 0 AND course_tier <= 3),
  chatbot_tier INTEGER DEFAULT 0 CHECK (chatbot_tier >= 0 AND chatbot_tier <= 3),

  -- Enrolled Courses (array of Shopify product IDs)
  enrolled_courses TEXT[] DEFAULT '{}',

  -- Gem Balance
  gem_balance INTEGER DEFAULT 0 CHECK (gem_balance >= 0),

  -- Source tracking
  source VARCHAR(20) DEFAULT 'shopify',  -- shopify, manual, promo, affiliate
  shopify_order_ids TEXT[] DEFAULT '{}',
  shopify_customer_id VARCHAR(50),

  -- Subscription info
  is_lifetime BOOLEAN DEFAULT false,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,  -- NULL = lifetime

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_access_at TIMESTAMPTZ
);

-- Indexes for user_access
CREATE INDEX IF NOT EXISTS idx_user_access_email
  ON user_access(user_email);
CREATE INDEX IF NOT EXISTS idx_user_access_user_id
  ON user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_tiers
  ON user_access(scanner_tier, course_tier, chatbot_tier);

-- RLS for user_access
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Service role có full access
CREATE POLICY "Service role full access on user_access"
  ON user_access FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users có thể xem access của mình
CREATE POLICY "Users can view own access"
  ON user_access FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );


-- ============================================================
-- TABLE 3: payment_logs
-- Log tất cả payment events để audit
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference
  pending_payment_id UUID REFERENCES pending_payments(id),
  order_number VARCHAR(20),

  -- Event info
  event_type VARCHAR(50) NOT NULL,
  -- order_created, payment_received, payment_verified,
  -- payment_failed, access_unlocked, reminder_sent, order_expired

  event_data JSONB,

  -- Source
  source VARCHAR(50),  -- shopify_webhook, casso_webhook, manual, system

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_order
  ON payment_logs(order_number);
CREATE INDEX IF NOT EXISTS idx_payment_logs_type
  ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created
  ON payment_logs(created_at DESC);

-- RLS for payment_logs
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on payment_logs"
  ON payment_logs FOR ALL
  USING (true);


-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pending_payments
DROP TRIGGER IF EXISTS trigger_pending_payments_updated ON pending_payments;
CREATE TRIGGER trigger_pending_payments_updated
  BEFORE UPDATE ON pending_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();

-- Trigger for user_access
DROP TRIGGER IF EXISTS trigger_user_access_updated ON user_access;
CREATE TRIGGER trigger_user_access_updated
  BEFORE UPDATE ON user_access
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();


-- Function: Add gems to user
CREATE OR REPLACE FUNCTION add_user_gems(
  p_email VARCHAR,
  p_amount INTEGER,
  p_source VARCHAR DEFAULT 'purchase'
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_access (user_email, gem_balance, source)
  VALUES (p_email, p_amount, p_source)
  ON CONFLICT (user_email)
  DO UPDATE SET
    gem_balance = user_access.gem_balance + p_amount,
    updated_at = NOW()
  RETURNING gem_balance INTO v_new_balance;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;


-- Function: Unlock access by tier
CREATE OR REPLACE FUNCTION unlock_user_access(
  p_email VARCHAR,
  p_scanner_tier INTEGER DEFAULT NULL,
  p_course_tier INTEGER DEFAULT NULL,
  p_chatbot_tier INTEGER DEFAULT NULL,
  p_order_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_access (
    user_email,
    scanner_tier,
    course_tier,
    chatbot_tier,
    shopify_order_ids,
    source
  )
  VALUES (
    p_email,
    COALESCE(p_scanner_tier, 0),
    COALESCE(p_course_tier, 0),
    COALESCE(p_chatbot_tier, 0),
    CASE WHEN p_order_id IS NOT NULL THEN ARRAY[p_order_id] ELSE '{}' END,
    'shopify'
  )
  ON CONFLICT (user_email)
  DO UPDATE SET
    scanner_tier = GREATEST(user_access.scanner_tier, COALESCE(p_scanner_tier, user_access.scanner_tier)),
    course_tier = GREATEST(user_access.course_tier, COALESCE(p_course_tier, user_access.course_tier)),
    chatbot_tier = GREATEST(user_access.chatbot_tier, COALESCE(p_chatbot_tier, user_access.chatbot_tier)),
    shopify_order_ids = CASE
      WHEN p_order_id IS NOT NULL AND NOT (p_order_id = ANY(user_access.shopify_order_ids))
      THEN array_append(user_access.shopify_order_ids, p_order_id)
      ELSE user_access.shopify_order_ids
    END,
    updated_at = NOW();

  RETURN true;
END;
$$ LANGUAGE plpgsql;


-- Function: Check if payment expired
CREATE OR REPLACE FUNCTION check_expired_payments()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE pending_payments
  SET payment_status = 'expired'
  WHERE payment_status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- STORAGE BUCKET (for payment proofs)
-- ============================================================

-- Create storage bucket for payment proofs if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage bucket
CREATE POLICY "Allow authenticated users to upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Allow public read access to payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');


-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON pending_payments TO anon, authenticated;
GRANT ALL ON user_access TO anon, authenticated;
GRANT ALL ON payment_logs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_user_gems TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unlock_user_access TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_expired_payments TO anon, authenticated;

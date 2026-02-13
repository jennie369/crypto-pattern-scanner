-- ============================================================
-- PAYMENT AUTOMATION SYSTEM - V3 (Only missing parts)
-- Tables already exist, just need policies and functions
-- ============================================================

-- ============================================================
-- DROP ALL EXISTING POLICIES FIRST
-- ============================================================

DROP POLICY IF EXISTS "Service role full access on pending_payments" ON pending_payments;
DROP POLICY IF EXISTS "Users can view own payments" ON pending_payments;
DROP POLICY IF EXISTS "Service role full access on user_access" ON user_access;
DROP POLICY IF EXISTS "Users can view own access" ON user_access;
DROP POLICY IF EXISTS "Service role full access on payment_logs" ON payment_logs;

-- ============================================================
-- RECREATE POLICIES
-- ============================================================

-- pending_payments policies
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on pending_payments"
  ON pending_payments FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own payments"
  ON pending_payments FOR SELECT
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- user_access policies
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on user_access"
  ON user_access FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own access"
  ON user_access FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- payment_logs policies
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on payment_logs"
  ON payment_logs FOR ALL
  USING (true);


-- ============================================================
-- FUNCTIONS (CREATE OR REPLACE)
-- ============================================================

CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pending_payments_updated ON pending_payments;
CREATE TRIGGER trigger_pending_payments_updated
  BEFORE UPDATE ON pending_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();

DROP TRIGGER IF EXISTS trigger_user_access_updated ON user_access;
CREATE TRIGGER trigger_user_access_updated
  BEFORE UPDATE ON user_access
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();

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
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow authenticated users to upload payment proofs" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Allow public read access to payment proofs" ON storage.objects;
CREATE POLICY "Allow public read access to payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');


-- ============================================================
-- INDEXES (IF NOT EXISTS)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pending_payments_order_number ON pending_payments(order_number);
CREATE INDEX IF NOT EXISTS idx_pending_payments_transfer_content ON pending_payments(transfer_content);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_expires ON pending_payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_payments_email ON pending_payments(customer_email);

CREATE INDEX IF NOT EXISTS idx_user_access_email ON user_access(user_email);
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_tiers ON user_access(scanner_tier, course_tier, chatbot_tier);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_number);
CREATE INDEX IF NOT EXISTS idx_payment_logs_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created ON payment_logs(created_at DESC);


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

-- Done!
SELECT 'Payment system setup completed!' as status;

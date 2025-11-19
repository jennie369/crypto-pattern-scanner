-- =============================================
-- CREATE PENDING TIER UPGRADES TABLE
-- =============================================
-- Purpose: Store Shopify orders from users who haven't signed up yet
-- When user signs up later, automatically apply their tier upgrades
-- =============================================

-- =============================================
-- STEP 1: CREATE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS pending_tier_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  product_type VARCHAR(20) NOT NULL CHECK (product_type IN ('course', 'scanner', 'chatbot')),
  tier_purchased VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 2: CREATE INDEXES
-- =============================================

-- Index for fast lookup by email (most common query)
CREATE INDEX IF NOT EXISTS idx_pending_upgrades_email ON pending_tier_upgrades(email);

-- Index for unapplied upgrades
CREATE INDEX IF NOT EXISTS idx_pending_upgrades_unapplied ON pending_tier_upgrades(applied) WHERE applied = FALSE;

-- Index for order_id (to prevent duplicates)
CREATE INDEX IF NOT EXISTS idx_pending_upgrades_order_id ON pending_tier_upgrades(order_id);

-- =============================================
-- STEP 3: CREATE FUNCTION TO APPLY PENDING UPGRADES
-- =============================================

CREATE OR REPLACE FUNCTION apply_pending_tier_upgrades(user_email VARCHAR)
RETURNS TABLE(
  upgrades_applied INTEGER,
  course_tier VARCHAR,
  scanner_tier VARCHAR,
  chatbot_tier VARCHAR
) AS $$
DECLARE
  v_user_id UUID;
  v_current_course_tier VARCHAR := 'free';
  v_current_scanner_tier VARCHAR := 'free';
  v_current_chatbot_tier VARCHAR := 'free';
  v_highest_course_tier VARCHAR := 'free';
  v_highest_scanner_tier VARCHAR := 'free';
  v_highest_chatbot_tier VARCHAR := 'free';
  v_upgrades_count INTEGER := 0;
  pending_record RECORD;
BEGIN
  -- Get user_id
  SELECT id, course_tier, scanner_tier, chatbot_tier
  INTO v_user_id, v_current_course_tier, v_current_scanner_tier, v_current_chatbot_tier
  FROM users
  WHERE email = user_email;

  -- If user not found, return 0
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER, 'free'::VARCHAR, 'free'::VARCHAR, 'free'::VARCHAR;
    RETURN;
  END IF;

  -- Initialize highest tiers with current tiers
  v_highest_course_tier := v_current_course_tier;
  v_highest_scanner_tier := v_current_scanner_tier;
  v_highest_chatbot_tier := v_current_chatbot_tier;

  -- Loop through all pending upgrades for this email
  FOR pending_record IN
    SELECT id, product_type, tier_purchased, order_id, amount, purchased_at
    FROM pending_tier_upgrades
    WHERE email = user_email AND applied = FALSE
    ORDER BY purchased_at ASC
  LOOP
    v_upgrades_count := v_upgrades_count + 1;

    -- Update highest tier based on product type
    IF pending_record.product_type = 'course' THEN
      -- Course tier hierarchy: free < tier1 < tier2 < tier3
      IF pending_record.tier_purchased = 'tier3' THEN
        v_highest_course_tier := 'tier3';
      ELSIF pending_record.tier_purchased = 'tier2' AND v_highest_course_tier NOT IN ('tier3') THEN
        v_highest_course_tier := 'tier2';
      ELSIF pending_record.tier_purchased = 'tier1' AND v_highest_course_tier = 'free' THEN
        v_highest_course_tier := 'tier1';
      END IF;

    ELSIF pending_record.product_type = 'scanner' THEN
      -- Scanner tier hierarchy: free < pro < premium < vip
      IF pending_record.tier_purchased = 'vip' THEN
        v_highest_scanner_tier := 'vip';
      ELSIF pending_record.tier_purchased = 'premium' AND v_highest_scanner_tier NOT IN ('vip') THEN
        v_highest_scanner_tier := 'premium';
      ELSIF pending_record.tier_purchased = 'pro' AND v_highest_scanner_tier = 'free' THEN
        v_highest_scanner_tier := 'pro';
      END IF;

    ELSIF pending_record.product_type = 'chatbot' THEN
      -- Chatbot tier hierarchy: free < pro < premium
      IF pending_record.tier_purchased = 'premium' THEN
        v_highest_chatbot_tier := 'premium';
      ELSIF pending_record.tier_purchased = 'pro' AND v_highest_chatbot_tier = 'free' THEN
        v_highest_chatbot_tier := 'pro';
      END IF;
    END IF;

    -- Mark as applied
    UPDATE pending_tier_upgrades
    SET applied = TRUE, applied_at = NOW()
    WHERE id = pending_record.id;

    -- Log to shopify_orders table
    INSERT INTO shopify_orders (
      user_id,
      order_id,
      product_type,
      tier_purchased,
      amount,
      processed_at
    ) VALUES (
      v_user_id,
      pending_record.order_id,
      pending_record.product_type,
      pending_record.tier_purchased,
      pending_record.amount,
      pending_record.purchased_at
    );
  END LOOP;

  -- Update user tiers if any pending upgrades were found
  IF v_upgrades_count > 0 THEN
    UPDATE users
    SET
      course_tier = v_highest_course_tier,
      scanner_tier = v_highest_scanner_tier,
      chatbot_tier = v_highest_chatbot_tier,
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Return results
  RETURN QUERY SELECT v_upgrades_count, v_highest_course_tier, v_highest_scanner_tier, v_highest_chatbot_tier;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STEP 4: CREATE TRIGGER FOR AUTO-APPLY ON USER CREATION
-- =============================================

CREATE OR REPLACE FUNCTION trigger_apply_pending_upgrades()
RETURNS TRIGGER AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Check if there are pending upgrades for this email
  IF EXISTS (
    SELECT 1 FROM pending_tier_upgrades
    WHERE email = NEW.email AND applied = FALSE
  ) THEN
    -- Apply pending upgrades
    SELECT * INTO v_result
    FROM apply_pending_tier_upgrades(NEW.email);

    -- Log the application
    RAISE NOTICE 'Applied % pending upgrades for user %', v_result.upgrades_applied, NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_user_signup_apply_pending_upgrades ON users;

-- Create trigger that fires AFTER INSERT on users table
CREATE TRIGGER on_user_signup_apply_pending_upgrades
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_apply_pending_upgrades();

-- =============================================
-- STEP 5: VERIFICATION
-- =============================================

-- Check table created
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'pending_tier_upgrades'
ORDER BY ordinal_position;

-- Check indexes created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'pending_tier_upgrades';

-- Check function created
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN ('apply_pending_tier_upgrades', 'trigger_apply_pending_upgrades');

-- Check trigger created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_user_signup_apply_pending_upgrades';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ PENDING TIER UPGRADES SYSTEM CREATED      ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '✅ Table: pending_tier_upgrades created'
UNION ALL
SELECT '✅ Indexes created for fast lookup'
UNION ALL
SELECT '✅ Function: apply_pending_tier_upgrades() created'
UNION ALL
SELECT '✅ Trigger: Auto-apply on user signup enabled'
UNION ALL
SELECT ''
UNION ALL
SELECT '🔄 NEW FLOW:'
UNION ALL
SELECT '  1. User mua hàng trước → Lưu vào pending'
UNION ALL
SELECT '  2. User signup sau → Tự động apply tier'
UNION ALL
SELECT '  3. Hoặc signup trước → Mua sau → Apply ngay'
UNION ALL
SELECT ''
UNION ALL
SELECT '📋 NEXT: Update webhook để lưu vào pending table';

-- =============================================
-- TESTING QUERIES
-- =============================================

-- Test: Check pending upgrades for an email
-- SELECT * FROM pending_tier_upgrades WHERE email = 'test@example.com';

-- Test: Manually apply pending upgrades
-- SELECT * FROM apply_pending_tier_upgrades('test@example.com');

-- Test: Insert a pending upgrade manually
-- INSERT INTO pending_tier_upgrades (email, order_id, product_type, tier_purchased, amount)
-- VALUES ('test@example.com', 'TEST12345', 'scanner', 'pro', 997000);

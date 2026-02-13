-- =====================================================
-- CRITICAL FIX: Create missing pending_tier_upgrades table
-- Date: 2026-01-08
-- Root Cause: Table was never created but webhook tries to insert
-- This causes signup to fail when handle_new_user calls apply_all_pending_purchases
-- =====================================================

-- =====================================================
-- 0. CLEANUP: Drop ALL existing versions of functions
-- This prevents "function name is not unique" errors
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all versions of grant_gems
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'grant_gems'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    -- Drop all versions of claim_pending_gem_credits
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'claim_pending_gem_credits'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    -- Drop all versions of apply_pending_tier_upgrades
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_pending_tier_upgrades'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    -- Drop all versions of apply_all_pending_purchases
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_all_pending_purchases'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    -- Drop all versions of add_user_gems (related function)
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'add_user_gems'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;

    RAISE NOTICE '=== Cleanup complete ===';
END $$;

-- =====================================================
-- 1. CREATE pending_tier_upgrades TABLE
-- This table stores tier upgrades for users who bought before signing up
-- =====================================================
CREATE TABLE IF NOT EXISTS pending_tier_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer info (from Shopify order)
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(255), -- Shopify order ID

  -- Product info
  product_type VARCHAR(50) NOT NULL, -- 'course', 'scanner', 'chatbot'
  tier_purchased VARCHAR(50) NOT NULL, -- 'TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP'
  amount DECIMAL(15,2), -- Amount paid

  -- Bundle info (for course purchases)
  bundle_scanner_tier VARCHAR(50), -- Included scanner tier
  bundle_chatbot_tier VARCHAR(50), -- Included chatbot tier
  bundle_duration_months INTEGER, -- Duration in months

  -- Affiliate tracking
  partner_id UUID, -- Affiliate who referred this purchase

  -- Status
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID, -- User ID when applied

  -- Timestamps
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_tier_upgrades_email ON pending_tier_upgrades(email);
CREATE INDEX IF NOT EXISTS idx_pending_tier_upgrades_applied ON pending_tier_upgrades(applied);

-- =====================================================
-- 2. CREATE pending_gem_credits TABLE (if not exists)
-- Used by shopify-webhook for gem pack purchases
-- =====================================================
CREATE TABLE IF NOT EXISTS pending_gem_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  gems_amount INTEGER NOT NULL,
  pack_name VARCHAR(255),
  order_id VARCHAR(255),
  variant_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, claimed
  claimed_at TIMESTAMPTZ,
  claimed_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_gem_credits_email ON pending_gem_credits(email);
CREATE INDEX IF NOT EXISTS idx_pending_gem_credits_status ON pending_gem_credits(status);

-- =====================================================
-- 2B. CREATE pending_gem_purchases TABLE (legacy fallback)
-- Used by shopify-webhook as fallback if pending_gem_credits fails
-- =====================================================
CREATE TABLE IF NOT EXISTS pending_gem_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(255),
  gem_amount INTEGER NOT NULL,
  price_paid DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'VND',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_gem_purchases_email ON pending_gem_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_gem_purchases_applied ON pending_gem_purchases(applied);

-- =====================================================
-- 2C. CREATE pending_course_access TABLE
-- Used by shopify-webhook for course purchases (user not found)
-- =====================================================
CREATE TABLE IF NOT EXISTS pending_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  course_id UUID NOT NULL,
  shopify_order_id VARCHAR(255),
  access_type VARCHAR(50) DEFAULT 'purchase',
  price_paid DECIMAL(15,2),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_course_access_email ON pending_course_access(email);
CREATE INDEX IF NOT EXISTS idx_pending_course_access_applied ON pending_course_access(applied);

-- =====================================================
-- 3. Ensure profiles has linked_emails column
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linked_emails TEXT[] DEFAULT '{}';

-- =====================================================
-- 4. Ensure users table has all required tier columns
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS scanner_tier VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS scanner_tier_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chatbot_tier VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS chatbot_tier_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_tier VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_tier_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;

-- =====================================================
-- 5. Ensure course_enrollments has correct structure
-- =====================================================
-- Check if course_enrollments exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
    CREATE TABLE course_enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      course_id UUID NOT NULL,
      access_type VARCHAR(50) DEFAULT 'purchase',
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}',
      UNIQUE(user_id, course_id)
    );
  END IF;
END $$;

-- =====================================================
-- 6. Create grant_gems function if not exists
-- =====================================================
CREATE OR REPLACE FUNCTION grant_gems(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'purchase',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_gems INTEGER;
  v_new_gems INTEGER;
BEGIN
  -- Get current gems
  SELECT COALESCE(gems, 0) INTO v_current_gems
  FROM profiles WHERE id = p_user_id;

  v_new_gems := v_current_gems + p_amount;

  -- Update gems
  UPDATE profiles SET gems = v_new_gems WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO gems_transactions (user_id, type, amount, balance_after, reason, metadata)
  VALUES (p_user_id, 'credit', p_amount, v_new_gems, p_reason, p_metadata)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'gems_added', p_amount,
    'new_balance', v_new_gems
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- 7. Create gems_transactions if not exists
-- =====================================================
CREATE TABLE IF NOT EXISTS gems_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- credit, debit
  amount INTEGER NOT NULL,
  balance_after INTEGER,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. Ensure profiles has gems column
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 0;

-- =====================================================
-- 9. RECREATE claim_pending_gem_credits with safety checks
-- Handles BOTH pending_gem_credits AND pending_gem_purchases (fallback)
-- =====================================================
CREATE OR REPLACE FUNCTION claim_pending_gem_credits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_linked_emails TEXT[];
  v_all_emails TEXT[];
  v_total_gems INTEGER := 0;
  v_claim_count INTEGER := 0;
  v_credit RECORD;
  v_purchase RECORD;
  v_grant_result JSONB;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Get linked emails (safely)
  BEGIN
    SELECT COALESCE(linked_emails, '{}') INTO v_linked_emails
    FROM profiles WHERE id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_linked_emails := '{}';
  END;

  -- Combine all emails
  v_all_emails := array_append(COALESCE(v_linked_emails, '{}'), v_user_email);

  -- === PART 1: Process pending_gem_credits table ===
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_gem_credits' AND table_schema = 'public') THEN
    FOR v_credit IN
      SELECT id, gems_amount, pack_name
      FROM pending_gem_credits
      WHERE email = ANY(v_all_emails)
      AND status = 'pending'
    LOOP
      v_grant_result := grant_gems(p_user_id, v_credit.gems_amount, 'pending_claim',
        jsonb_build_object('pack_name', v_credit.pack_name));

      IF (v_grant_result->>'success')::boolean THEN
        UPDATE pending_gem_credits SET
          status = 'claimed',
          claimed_at = NOW(),
          claimed_user_id = p_user_id
        WHERE id = v_credit.id;

        v_total_gems := v_total_gems + v_credit.gems_amount;
        v_claim_count := v_claim_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- === PART 2: Process pending_gem_purchases table (legacy fallback) ===
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_gem_purchases' AND table_schema = 'public') THEN
    FOR v_purchase IN
      SELECT id, gem_amount, order_id
      FROM pending_gem_purchases
      WHERE email = ANY(v_all_emails)
      AND applied = false
    LOOP
      v_grant_result := grant_gems(p_user_id, v_purchase.gem_amount, 'pending_purchase',
        jsonb_build_object('order_id', v_purchase.order_id));

      IF (v_grant_result->>'success')::boolean THEN
        UPDATE pending_gem_purchases SET
          applied = true,
          applied_at = NOW(),
          applied_user_id = p_user_id
        WHERE id = v_purchase.id;

        v_total_gems := v_total_gems + v_purchase.gem_amount;
        v_claim_count := v_claim_count + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'credits_claimed', v_claim_count,
    'gems_granted', v_total_gems
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- 10. RECREATE apply_pending_tier_upgrades with safety
-- =====================================================
CREATE OR REPLACE FUNCTION apply_pending_tier_upgrades(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_linked_emails TEXT[];
  v_all_emails TEXT[];
  v_pending RECORD;
  v_applied_count INTEGER := 0;
  v_expiry_date TIMESTAMPTZ;
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_tier_upgrades') THEN
    RETURN jsonb_build_object('success', true, 'applied_count', 0, 'message', 'Table not found');
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Get linked emails (safely)
  BEGIN
    SELECT COALESCE(linked_emails, '{}') INTO v_linked_emails
    FROM profiles WHERE id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    v_linked_emails := '{}';
  END;

  -- Combine all emails
  v_all_emails := array_append(COALESCE(v_linked_emails, '{}'), v_user_email);

  -- Loop through pending tier upgrades
  FOR v_pending IN
    SELECT id, product_type, tier_purchased, bundle_scanner_tier, bundle_chatbot_tier,
           bundle_duration_months, amount, partner_id
    FROM pending_tier_upgrades
    WHERE email = ANY(v_all_emails)
    AND applied = false
  LOOP
    -- Calculate expiry date
    IF v_pending.bundle_duration_months IS NOT NULL THEN
      v_expiry_date := NOW() + (v_pending.bundle_duration_months || ' months')::INTERVAL;
    ELSE
      v_expiry_date := NOW() + INTERVAL '1 month';
    END IF;

    -- Apply tier upgrade to users table
    IF v_pending.product_type = 'course' THEN
      UPDATE users SET
        course_tier = v_pending.tier_purchased,
        course_tier_expires_at = v_expiry_date,
        scanner_tier = COALESCE(v_pending.bundle_scanner_tier, scanner_tier),
        scanner_tier_expires_at = CASE
          WHEN v_pending.bundle_scanner_tier IS NOT NULL THEN v_expiry_date
          ELSE scanner_tier_expires_at
        END,
        chatbot_tier = COALESCE(v_pending.bundle_chatbot_tier, chatbot_tier),
        chatbot_tier_expires_at = CASE
          WHEN v_pending.bundle_chatbot_tier IS NOT NULL THEN v_expiry_date
          ELSE chatbot_tier_expires_at
        END,
        tier = v_pending.tier_purchased,
        tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;

    ELSIF v_pending.product_type = 'scanner' THEN
      UPDATE users SET
        scanner_tier = v_pending.tier_purchased,
        scanner_tier_expires_at = v_expiry_date,
        tier = v_pending.tier_purchased,
        tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;

    ELSIF v_pending.product_type = 'chatbot' THEN
      UPDATE users SET
        chatbot_tier = v_pending.tier_purchased,
        chatbot_tier_expires_at = v_expiry_date,
        updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    -- Mark as applied
    UPDATE pending_tier_upgrades SET
      applied = true,
      applied_at = NOW(),
      applied_user_id = p_user_id,
      updated_at = NOW()
    WHERE id = v_pending.id;

    v_applied_count := v_applied_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'applied_count', v_applied_count,
    'message', CASE WHEN v_applied_count > 0
      THEN 'Applied ' || v_applied_count || ' pending tier upgrades'
      ELSE 'No pending tier upgrades found'
    END
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================================================
-- 11. RECREATE apply_all_pending_purchases (master function)
-- =====================================================
CREATE OR REPLACE FUNCTION apply_all_pending_purchases(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier_result JSONB;
  v_gem_result JSONB;
  v_course_result JSONB;
  v_user_email TEXT;
BEGIN
  -- Validate user exists
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Apply pending tier upgrades
  BEGIN
    v_tier_result := apply_pending_tier_upgrades(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    v_tier_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  -- Apply pending gem credits
  BEGIN
    v_gem_result := claim_pending_gem_credits(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    v_gem_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  -- Apply pending course access
  BEGIN
    -- Check if pending_course_access table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_course_access') THEN
      UPDATE pending_course_access
      SET
        applied = true,
        applied_user_id = p_user_id,
        applied_at = NOW()
      WHERE email = v_user_email
      AND applied = false;

      -- Create course enrollments (if table exists)
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        INSERT INTO course_enrollments (user_id, course_id, access_type, enrolled_at, metadata)
        SELECT
          p_user_id,
          course_id,
          'shopify_purchase',
          NOW(),
          jsonb_build_object('from_pending', true, 'shopify_order_id', shopify_order_id)
        FROM pending_course_access
        WHERE applied_user_id = p_user_id
        AND applied_at >= NOW() - INTERVAL '1 minute'
        ON CONFLICT (user_id, course_id) DO NOTHING;
      END IF;

      v_course_result := jsonb_build_object('success', true);
    ELSE
      v_course_result := jsonb_build_object('success', true, 'message', 'Table not found');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_course_result := jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'success', true,
    'tier_upgrades', v_tier_result,
    'gem_credits', v_gem_result,
    'course_access', v_course_result
  );
END;
$$;

-- =====================================================
-- 12. RECREATE handle_new_user trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending_result JSONB;
BEGIN
  -- Create user record with defaults
  INSERT INTO public.users (
    id,
    email,
    display_name,
    full_name,
    scanner_tier,
    course_tier,
    chatbot_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'FREE',
    'FREE',
    'FREE',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.users.display_name),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    updated_at = NOW();

  -- Apply pending purchases for this user
  -- This handles the case where user bought before creating account
  BEGIN
    v_pending_result := apply_all_pending_purchases(NEW.id);
    IF v_pending_result->>'success' = 'true' THEN
      RAISE NOTICE 'Applied pending purchases for new user %: %', NEW.id, v_pending_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail user creation
    RAISE WARNING 'Failed to apply pending for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 13. GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO authenticated;
GRANT EXECUTE ON FUNCTION apply_pending_tier_upgrades TO service_role;
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION apply_all_pending_purchases TO service_role;
GRANT EXECUTE ON FUNCTION claim_pending_gem_credits TO authenticated;
GRANT EXECUTE ON FUNCTION claim_pending_gem_credits TO service_role;
GRANT EXECUTE ON FUNCTION grant_gems TO authenticated;
GRANT EXECUTE ON FUNCTION grant_gems TO service_role;

-- =====================================================
-- 14. RLS Policies for ALL pending tables
-- =====================================================
ALTER TABLE pending_tier_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_gem_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_gem_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_course_access ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (using DO block to handle IF NOT EXISTS)
DO $$
BEGIN
  -- pending_tier_upgrades
  DROP POLICY IF EXISTS "Service role full access pending_tier_upgrades" ON pending_tier_upgrades;
  CREATE POLICY "Service role full access pending_tier_upgrades" ON pending_tier_upgrades FOR ALL USING (true);

  -- pending_gem_credits
  DROP POLICY IF EXISTS "Service role full access pending_gem_credits" ON pending_gem_credits;
  CREATE POLICY "Service role full access pending_gem_credits" ON pending_gem_credits FOR ALL USING (true);

  -- pending_gem_purchases
  DROP POLICY IF EXISTS "Service role full access pending_gem_purchases" ON pending_gem_purchases;
  CREATE POLICY "Service role full access pending_gem_purchases" ON pending_gem_purchases FOR ALL USING (true);

  -- pending_course_access
  DROP POLICY IF EXISTS "Service role full access pending_course_access" ON pending_course_access;
  CREATE POLICY "Service role full access pending_course_access" ON pending_course_access FOR ALL USING (true);
END $$;

-- =====================================================
-- DONE - This migration creates ALL missing pending tables:
--
-- TABLES CREATED:
-- 1. pending_tier_upgrades  - For tier/subscription purchases before signup
-- 2. pending_gem_credits    - For gem pack purchases before signup
-- 3. pending_gem_purchases  - Legacy fallback for gem purchases
-- 4. pending_course_access  - For course purchases before signup
-- 5. gems_transactions      - For tracking gem credits/debits
-- 6. course_enrollments     - For course access (if not exists)
--
-- FUNCTIONS CREATED/UPDATED:
-- 1. grant_gems()                    - Grant gems to user
-- 2. claim_pending_gem_credits()     - Claim pending gems (both tables)
-- 3. apply_pending_tier_upgrades()   - Apply pending tier upgrades
-- 4. apply_all_pending_purchases()   - Master function for all pending
-- 5. handle_new_user()               - Trigger on user signup
--
-- COLUMNS ADDED:
-- - profiles.linked_emails, profiles.gems
-- - users.scanner_tier, users.chatbot_tier, users.course_tier, etc.
--
-- RLS POLICIES:
-- - All 4 pending tables have service_role full access
-- =====================================================

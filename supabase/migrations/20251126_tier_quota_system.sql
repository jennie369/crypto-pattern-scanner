-- =====================================================
-- GEM Platform - Tier & Quota System Migration
-- Date: 2025-11-26
-- Features: User purchases tracking, Chatbot quota tracking
-- =====================================================

-- =====================================================
-- 1. USER PURCHASES TABLE
-- Track all product purchases (bundles, standalone)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Product info
    product_id TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('bundle', 'chatbot', 'scanner', 'course')),
    product_tier TEXT CHECK (product_tier IN ('TIER1', 'TIER2', 'TIER3', 'PRO', 'PREMIUM', 'VIP')),
    product_name TEXT,

    -- Purchase details
    amount DECIMAL(12, 2),
    currency TEXT DEFAULT 'VND',

    -- Shopify integration
    shopify_order_id TEXT,
    shopify_order_number TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,

    -- Timestamps
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Service can manage purchases" ON user_purchases;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_active ON user_purchases(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product_type ON user_purchases(product_type);
CREATE INDEX IF NOT EXISTS idx_user_purchases_shopify ON user_purchases(shopify_order_id);

-- Enable RLS
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own purchases"
    ON user_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service can manage purchases"
    ON user_purchases FOR ALL
    USING (true)
    WITH CHECK (true);


-- =====================================================
-- 2. CHATBOT QUOTA TABLE
-- Track daily query usage per user
-- =====================================================

CREATE TABLE IF NOT EXISTS chatbot_quota (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Daily tracking
    date DATE NOT NULL,
    queries_used INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one record per user per day
    UNIQUE(user_id, date)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can update own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Users can insert own quota" ON chatbot_quota;
DROP POLICY IF EXISTS "Service can manage quota" ON chatbot_quota;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_quota_user_date ON chatbot_quota(user_id, date);
CREATE INDEX IF NOT EXISTS idx_chatbot_quota_date ON chatbot_quota(date);

-- Enable RLS
ALTER TABLE chatbot_quota ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can manage their own quota
CREATE POLICY "Users can view own quota"
    ON chatbot_quota FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota"
    ON chatbot_quota FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quota"
    ON chatbot_quota FOR UPDATE
    USING (auth.uid() = user_id);


-- =====================================================
-- 3. HELPER FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_purchases
DROP TRIGGER IF EXISTS update_user_purchases_updated_at ON user_purchases;
CREATE TRIGGER update_user_purchases_updated_at
    BEFORE UPDATE ON user_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for chatbot_quota
DROP TRIGGER IF EXISTS update_chatbot_quota_updated_at ON chatbot_quota;
CREATE TRIGGER update_chatbot_quota_updated_at
    BEFORE UPDATE ON chatbot_quota
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 4. FUNCTION TO GET USER TIER
-- Returns highest tier from purchases
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_tier TEXT := 'FREE';
    v_tier_level INT := 0;
    v_purchase RECORD;
    v_profile RECORD;
    v_current_level INT;
BEGIN
    -- Check profile tiers first
    SELECT chatbot_tier, scanner_tier, course_tier
    INTO v_profile
    FROM profiles
    WHERE id = p_user_id;

    IF FOUND THEN
        -- Check chatbot_tier
        IF v_profile.chatbot_tier IS NOT NULL THEN
            v_current_level := CASE UPPER(v_profile.chatbot_tier)
                WHEN 'VIP' THEN 3
                WHEN 'TIER3' THEN 3
                WHEN 'PREMIUM' THEN 2
                WHEN 'TIER2' THEN 2
                WHEN 'PRO' THEN 1
                WHEN 'TIER1' THEN 1
                ELSE 0
            END;
            IF v_current_level > v_tier_level THEN
                v_tier_level := v_current_level;
            END IF;
        END IF;

        -- Check scanner_tier
        IF v_profile.scanner_tier IS NOT NULL THEN
            v_current_level := CASE UPPER(v_profile.scanner_tier)
                WHEN 'VIP' THEN 3
                WHEN 'TIER3' THEN 3
                WHEN 'PREMIUM' THEN 2
                WHEN 'TIER2' THEN 2
                WHEN 'PRO' THEN 1
                WHEN 'TIER1' THEN 1
                ELSE 0
            END;
            IF v_current_level > v_tier_level THEN
                v_tier_level := v_current_level;
            END IF;
        END IF;
    END IF;

    -- Check user_purchases
    FOR v_purchase IN
        SELECT product_type, product_tier
        FROM user_purchases
        WHERE user_id = p_user_id AND is_active = true
    LOOP
        v_current_level := CASE UPPER(COALESCE(v_purchase.product_tier, ''))
            WHEN 'VIP' THEN 3
            WHEN 'TIER3' THEN 3
            WHEN 'PREMIUM' THEN 2
            WHEN 'TIER2' THEN 2
            WHEN 'PRO' THEN 1
            WHEN 'TIER1' THEN 1
            ELSE 0
        END;
        IF v_current_level > v_tier_level THEN
            v_tier_level := v_current_level;
        END IF;
    END LOOP;

    -- Convert level back to tier name
    v_tier := CASE v_tier_level
        WHEN 3 THEN 'TIER3'
        WHEN 2 THEN 'TIER2'
        WHEN 1 THEN 'TIER1'
        ELSE 'FREE'
    END;

    RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 5. FUNCTION TO CHECK QUOTA
-- Returns remaining queries for today
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
RETURNS TABLE (
    tier TEXT,
    daily_limit INT,
    queries_used INT,
    remaining INT,
    is_unlimited BOOLEAN
) AS $$
DECLARE
    v_tier TEXT;
    v_limit INT;
    v_used INT;
    v_today DATE;
BEGIN
    -- Get user tier
    v_tier := get_user_tier(p_user_id);

    -- Get limit based on tier
    v_limit := CASE v_tier
        WHEN 'TIER3' THEN -1  -- Unlimited
        WHEN 'TIER2' THEN 50
        WHEN 'TIER1' THEN 15
        ELSE 5
    END;

    -- Get today's date (Vietnam timezone approximation)
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;

    -- Get queries used today
    SELECT COALESCE(cq.queries_used, 0)
    INTO v_used
    FROM chatbot_quota cq
    WHERE cq.user_id = p_user_id AND cq.date = v_today;

    IF NOT FOUND THEN
        v_used := 0;
    END IF;

    -- Return results
    RETURN QUERY SELECT
        v_tier,
        v_limit,
        v_used,
        CASE WHEN v_limit = -1 THEN -1 ELSE GREATEST(0, v_limit - v_used) END,
        v_limit = -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 6. CLEANUP OLD QUOTA RECORDS
-- Run daily to remove records older than 30 days
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_quota_records()
RETURNS INT AS $$
DECLARE
    v_deleted INT;
BEGIN
    DELETE FROM chatbot_quota
    WHERE date < CURRENT_DATE - INTERVAL '30 days';

    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- DONE!
-- =====================================================

-- Verify tables exist
DO $$
BEGIN
    RAISE NOTICE 'Tier & Quota System tables created successfully';
    RAISE NOTICE 'Tables: user_purchases, chatbot_quota';
    RAISE NOTICE 'Functions: get_user_tier(), check_user_quota(), cleanup_old_quota_records()';
END $$;

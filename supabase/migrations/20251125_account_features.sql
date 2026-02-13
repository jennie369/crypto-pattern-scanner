-- =====================================================
-- GEM Platform - Account Features Migration
-- Date: 2025-11-25
-- Features: Portfolio Holdings, Notification Settings
-- =====================================================

-- =====================================================
-- 1. PORTFOLIO HOLDINGS TABLE
-- =====================================================

-- Create portfolio_holdings table for tracking user crypto holdings
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    avg_buy_price DECIMAL(20, 8),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate symbols per user
    UNIQUE(user_id, symbol)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);

-- Enable RLS
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_holdings (drop if exists first)
DROP POLICY IF EXISTS "Users can view own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Users can insert own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Users can update own holdings" ON portfolio_holdings;
DROP POLICY IF EXISTS "Users can delete own holdings" ON portfolio_holdings;

CREATE POLICY "Users can view own holdings"
    ON portfolio_holdings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
    ON portfolio_holdings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
    ON portfolio_holdings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
    ON portfolio_holdings FOR DELETE
    USING (auth.uid() = user_id);


-- =====================================================
-- 2. NOTIFICATION SETTINGS TABLE
-- =====================================================

-- Create notification_settings table for user preferences
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Trading notifications
    pattern_alerts BOOLEAN DEFAULT true,
    price_alerts BOOLEAN DEFAULT true,
    paper_trade_results BOOLEAN DEFAULT true,

    -- Community notifications
    new_followers BOOLEAN DEFAULT true,
    post_likes BOOLEAN DEFAULT true,
    post_comments BOOLEAN DEFAULT true,
    mentions BOOLEAN DEFAULT true,

    -- Affiliate notifications
    new_referral BOOLEAN DEFAULT true,
    commission_earned BOOLEAN DEFAULT true,
    tier_upgrade BOOLEAN DEFAULT true,

    -- Order notifications
    order_confirmation BOOLEAN DEFAULT true,
    shipping_updates BOOLEAN DEFAULT true,

    -- Email notifications
    email_marketing BOOLEAN DEFAULT false,
    email_weekly_digest BOOLEAN DEFAULT true,
    email_important BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings (drop if exists first)
DROP POLICY IF EXISTS "Users can view own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON notification_settings;

CREATE POLICY "Users can view own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
    ON notification_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
    ON notification_settings FOR UPDATE
    USING (auth.uid() = user_id);


-- =====================================================
-- 3. UPDATE PROFILES TABLE
-- Add missing columns if needed
-- =====================================================

-- Add phone column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- Add bio column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Add gender column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(10);
    END IF;
END $$;


-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for portfolio_holdings
DROP TRIGGER IF EXISTS update_portfolio_holdings_updated_at ON portfolio_holdings;
CREATE TRIGGER update_portfolio_holdings_updated_at
    BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for notification_settings
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 5. DEFAULT NOTIFICATION SETTINGS FUNCTION
-- Auto-create settings when user signs up
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings on new user
DROP TRIGGER IF EXISTS create_notification_settings_on_signup ON auth.users;
CREATE TRIGGER create_notification_settings_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_settings();


-- =====================================================
-- 6. CREATE DEFAULT SETTINGS FOR EXISTING USERS
-- =====================================================

INSERT INTO notification_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_settings)
ON CONFLICT (user_id) DO NOTHING;


-- =====================================================
-- DONE!
-- =====================================================

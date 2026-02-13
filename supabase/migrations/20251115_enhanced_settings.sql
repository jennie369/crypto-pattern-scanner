-- ========================================
-- ENHANCED SETTINGS SYSTEM
-- ========================================
-- Migration for comprehensive user settings, sessions, API keys, and invoices
-- Created: 2025-11-15

-- ========================================
-- TABLE 1: User Settings (JSONB for flexibility)
-- ========================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Notification preferences (granular control)
  notifications JSONB DEFAULT '{
    "telegram": false,
    "email": false,
    "browser": true,
    "priceAlerts": true,
    "patternDetected": true,
    "tradeSignals": false,
    "systemUpdates": true
  }'::jsonb,

  -- Privacy & security settings
  privacy JSONB DEFAULT '{
    "profileVisibility": "private",
    "showTrades": false,
    "twoFactorEnabled": false
  }'::jsonb,

  -- Trading preferences
  trading JSONB DEFAULT '{
    "defaultTimeframe": "1h",
    "riskPercentage": 2,
    "enabledPatterns": ["head_and_shoulders", "double_top", "double_bottom", "triangle", "wedge"]
  }'::jsonb,

  -- Display preferences
  display JSONB DEFAULT '{
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "dateFormat": "MM/DD/YYYY",
    "theme": "dark"
  }'::jsonb,

  -- Advanced settings
  advanced JSONB DEFAULT '{
    "betaFeatures": false,
    "debugMode": false
  }'::jsonb,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- TABLE 2: User Sessions (Active login tracking)
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Device information
  device_name TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,

  -- Network information
  ip_address TEXT,
  user_agent TEXT,

  -- Session status
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT NOW(),

  -- Session metadata
  login_at TIMESTAMP DEFAULT NOW(),
  logout_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;

-- RLS Policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- TABLE 3: API Keys (For external integrations)
-- ========================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Key information
  name TEXT NOT NULL, -- User-defined name for the key
  key TEXT UNIQUE NOT NULL, -- Format: gem_{32_random_characters}
  key_preview TEXT, -- First 8 + last 4 characters for display

  -- Status and usage
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,

  CONSTRAINT api_key_format CHECK (key ~ '^gem_[a-zA-Z0-9]{32}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE is_active = TRUE;

-- RLS Policies for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- TABLE 4: Subscription Invoices (Billing history)
-- ========================================
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Invoice details
  invoice_number TEXT UNIQUE NOT NULL,

  -- Product information
  product_type TEXT NOT NULL, -- 'course', 'scanner', 'chatbot', 'bundle'
  tier TEXT NOT NULL, -- 'tier1', 'tier2', 'tier3'

  -- Pricing
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Payment information
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
  payment_intent_id TEXT, -- External payment reference

  -- Invoice URLs
  invoice_url TEXT,
  receipt_url TEXT,

  -- Timestamps
  issued_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  due_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT valid_product_type CHECK (product_type IN ('course', 'scanner', 'chatbot', 'bundle'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_user_id ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_issued_at ON subscription_invoices(issued_at DESC);

-- RLS Policies for subscription_invoices
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON subscription_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON subscription_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON subscription_invoices
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- FUNCTION 1: Auto-create user settings on user registration
-- ========================================
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings
DROP TRIGGER IF EXISTS trigger_create_default_user_settings ON users;
CREATE TRIGGER trigger_create_default_user_settings
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- ========================================
-- FUNCTION 2: Generate API key with gem_ prefix
-- ========================================
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'gem_';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(characters, floor(random() * length(characters) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNCTION 3: Update updated_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_subscription_invoices_updated_at ON subscription_invoices;
CREATE TRIGGER trigger_update_subscription_invoices_updated_at
  BEFORE UPDATE ON subscription_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTION 4: Clean up old inactive sessions (30 days)
-- ========================================
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE,
      logout_at = NOW()
  WHERE is_active = TRUE
    AND last_activity < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Force schema reload for PostgREST
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced Settings System migration completed successfully!';
  RAISE NOTICE '   - user_settings table created';
  RAISE NOTICE '   - user_sessions table created';
  RAISE NOTICE '   - api_keys table created';
  RAISE NOTICE '   - subscription_invoices table created';
  RAISE NOTICE '   - RLS policies enabled';
  RAISE NOTICE '   - Auto-triggers configured';
END $$;

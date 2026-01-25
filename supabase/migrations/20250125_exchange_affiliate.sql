-- =====================================================
-- EXCHANGE AFFILIATE SYSTEM - Complete Migration
-- Date: 2025-01-25
-- Description: Exchange affiliate links, tracking, API connection for trading
-- Access: All tiers (view exchanges), TIER2+ (API connection)
-- =====================================================

-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- Table 1: Exchange Config (Admin managed)
CREATE TABLE IF NOT EXISTS exchange_config (
  id VARCHAR(50) PRIMARY KEY, -- 'binance', 'nami', 'okx', 'bybit'
  display_name VARCHAR(100) NOT NULL,

  -- Affiliate info
  affiliate_ref_code VARCHAR(100),
  affiliate_link TEXT NOT NULL,

  -- Commission rates
  commission_rate_spot NUMERIC DEFAULT 0.1, -- 10% of trading fee
  commission_rate_futures NUMERIC DEFAULT 0.1,
  user_fee_discount NUMERIC DEFAULT 0.2, -- 20% discount for user

  -- Display info
  color VARCHAR(20) DEFAULT '#F0B90B',
  logo_url TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,

  -- Deposit methods
  deposit_methods JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_recommended BOOLEAN DEFAULT false,
  supports_vnd BOOLEAN DEFAULT true,

  -- API connection
  api_connection_enabled BOOLEAN DEFAULT true,
  min_tier_for_api INTEGER DEFAULT 2, -- TIER 2+

  -- Ordering
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active exchanges
CREATE INDEX IF NOT EXISTS idx_exchange_config_active ON exchange_config(is_active, display_order);

-- Table 2: User Exchange Accounts
CREATE TABLE IF NOT EXISTS user_exchange_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL REFERENCES exchange_config(id),

  -- Status flow: pending_signup → registered → kyc_verified → deposited → active
  status VARCHAR(30) DEFAULT 'pending_signup' CHECK (status IN (
    'pending_signup', 'registered', 'kyc_verified', 'deposited', 'active', 'disconnected'
  )),

  -- Account info
  exchange_email VARCHAR(255),
  exchange_uid VARCHAR(100), -- Exchange's user ID if available

  -- API connection (TIER 2+)
  api_key_encrypted TEXT, -- Encrypted with CryptoJS
  api_secret_encrypted TEXT,
  api_permissions JSONB DEFAULT '[]'::jsonb, -- ['read', 'trade'] - NEVER 'withdraw'
  api_connected_at TIMESTAMPTZ,
  api_last_tested_at TIMESTAMPTZ,
  api_test_status VARCHAR(20) CHECK (api_test_status IN ('success', 'failed', 'pending')),
  api_error_message TEXT,

  -- Cached balance (updated periodically)
  cached_balance JSONB, -- { total: 1000, spot: 800, futures: 200, updated_at: '...' }
  balance_last_synced_at TIMESTAMPTZ,

  -- Milestones tracking
  link_clicked_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  kyc_verified_at TIMESTAMPTZ,
  first_deposit_at TIMESTAMPTZ,
  first_trade_at TIMESTAMPTZ,

  -- Source tracking
  signup_source VARCHAR(50), -- 'scanner', 'profile', 'paper_trade', 'onboarding', etc.

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one account per exchange per user
  UNIQUE(user_id, exchange)
);

-- Indexes for user_exchange_accounts
CREATE INDEX IF NOT EXISTS idx_user_exchange_user ON user_exchange_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exchange_status ON user_exchange_accounts(status);
CREATE INDEX IF NOT EXISTS idx_user_exchange_exchange ON user_exchange_accounts(exchange);
CREATE INDEX IF NOT EXISTS idx_user_exchange_api ON user_exchange_accounts(user_id) WHERE api_key_encrypted IS NOT NULL;

-- Table 3: Exchange Affiliate Events (Analytics)
CREATE TABLE IF NOT EXISTS exchange_affiliate_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL REFERENCES exchange_config(id),

  -- Event type
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'link_clicked', 'signup_started', 'signup_confirmed',
    'kyc_started', 'kyc_verified',
    'first_deposit', 'deposit',
    'first_trade', 'trade',
    'api_connected', 'api_disconnected',
    'prompt_shown', 'prompt_clicked', 'prompt_dismissed'
  )),

  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Source tracking
  source_screen VARCHAR(50), -- 'scanner', 'profile', 'paper_trade', etc.
  source_action VARCHAR(50), -- 'pattern_detected', 'win_streak', 'onboarding', etc.

  -- Attribution
  session_id VARCHAR(100),
  device_info JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_affiliate_events_user ON exchange_affiliate_events(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_exchange ON exchange_affiliate_events(exchange);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_type ON exchange_affiliate_events(event_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_created ON exchange_affiliate_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_source ON exchange_affiliate_events(source_screen);

-- Table 4: Deposit Prompts (Smart reminders)
CREATE TABLE IF NOT EXISTS deposit_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange VARCHAR(50) NOT NULL REFERENCES exchange_config(id),

  -- Prompt type
  prompt_type VARCHAR(50) NOT NULL CHECK (prompt_type IN (
    'after_signup', 'winning_streak', 'high_grade_pattern',
    'first_time_scanner', 'paper_profit_milestone', 'manual'
  )),

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ, -- Prompt expires after 7 days

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'shown', 'clicked', 'dismissed', 'expired', 'cancelled'
  )),

  -- Context data
  context_data JSONB DEFAULT '{}'::jsonb, -- { win_streak: 5, profit: 1500, pattern_grade: 'A+' }

  -- Response tracking
  shown_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_action VARCHAR(20), -- 'open_exchange', 'remind_later', 'dismiss'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for prompts
CREATE INDEX IF NOT EXISTS idx_deposit_prompts_user ON deposit_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_prompts_pending ON deposit_prompts(user_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_deposit_prompts_scheduled ON deposit_prompts(scheduled_at) WHERE status = 'pending';

-- =====================================================
-- PART 2: ENABLE RLS
-- =====================================================

ALTER TABLE exchange_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exchange_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_affiliate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_prompts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active exchanges" ON exchange_config;
DROP POLICY IF EXISTS "Admins can manage exchange config" ON exchange_config;

DROP POLICY IF EXISTS "Users can view own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can insert own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can update own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can delete own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Admins can manage all exchange accounts" ON user_exchange_accounts;

DROP POLICY IF EXISTS "Users can view own events" ON exchange_affiliate_events;
DROP POLICY IF EXISTS "Users can insert own events" ON exchange_affiliate_events;
DROP POLICY IF EXISTS "Admins can view all events" ON exchange_affiliate_events;

DROP POLICY IF EXISTS "Users can view own prompts" ON deposit_prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON deposit_prompts;
DROP POLICY IF EXISTS "System can insert prompts" ON deposit_prompts;
DROP POLICY IF EXISTS "Admins can manage all prompts" ON deposit_prompts;

-- Exchange Config Policies
CREATE POLICY "Anyone can view active exchanges"
  ON exchange_config FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage exchange config"
  ON exchange_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User Exchange Accounts Policies
CREATE POLICY "Users can view own exchange accounts"
  ON user_exchange_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own exchange accounts"
  ON user_exchange_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own exchange accounts"
  ON user_exchange_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own exchange accounts"
  ON user_exchange_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all exchange accounts"
  ON user_exchange_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exchange Affiliate Events Policies
CREATE POLICY "Users can view own events"
  ON exchange_affiliate_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own events"
  ON exchange_affiliate_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all events"
  ON exchange_affiliate_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deposit Prompts Policies
CREATE POLICY "Users can view own prompts"
  ON deposit_prompts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own prompts"
  ON deposit_prompts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert prompts"
  ON deposit_prompts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all prompts"
  ON deposit_prompts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PART 4: HELPER FUNCTIONS
-- =====================================================

-- Function 1: Track affiliate event
CREATE OR REPLACE FUNCTION track_exchange_event(
  user_id_param UUID,
  exchange_param VARCHAR(50),
  event_type_param VARCHAR(50),
  source_screen_param VARCHAR(50) DEFAULT NULL,
  source_action_param VARCHAR(50) DEFAULT NULL,
  event_data_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  new_event_id UUID;
BEGIN
  INSERT INTO exchange_affiliate_events (
    user_id, exchange, event_type,
    source_screen, source_action, event_data
  ) VALUES (
    user_id_param, exchange_param, event_type_param,
    source_screen_param, source_action_param, event_data_param
  )
  RETURNING id INTO new_event_id;

  RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Create or update exchange account
CREATE OR REPLACE FUNCTION upsert_exchange_account(
  user_id_param UUID,
  exchange_param VARCHAR(50),
  status_param VARCHAR(30) DEFAULT 'pending_signup',
  email_param VARCHAR(255) DEFAULT NULL,
  source_param VARCHAR(50) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  account_record user_exchange_accounts%ROWTYPE;
  result_id UUID;
BEGIN
  -- Check if account exists
  SELECT * INTO account_record
  FROM user_exchange_accounts
  WHERE user_id = user_id_param AND exchange = exchange_param;

  IF FOUND THEN
    -- Update existing
    UPDATE user_exchange_accounts
    SET
      status = CASE
        WHEN status_param = 'pending_signup' THEN status -- Don't downgrade
        ELSE status_param
      END,
      exchange_email = COALESCE(email_param, exchange_email),
      signup_source = COALESCE(source_param, signup_source),
      updated_at = NOW()
    WHERE id = account_record.id
    RETURNING id INTO result_id;

    RETURN json_build_object(
      'success', true,
      'account_id', result_id,
      'action', 'updated'
    );
  ELSE
    -- Create new
    INSERT INTO user_exchange_accounts (
      user_id, exchange, status,
      exchange_email, signup_source, link_clicked_at
    ) VALUES (
      user_id_param, exchange_param, status_param,
      email_param, source_param, NOW()
    )
    RETURNING id INTO result_id;

    RETURN json_build_object(
      'success', true,
      'account_id', result_id,
      'action', 'created'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Confirm exchange signup
CREATE OR REPLACE FUNCTION confirm_exchange_signup(
  user_id_param UUID,
  exchange_param VARCHAR(50),
  email_param VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
  account_record user_exchange_accounts%ROWTYPE;
BEGIN
  -- Get or create account
  SELECT * INTO account_record
  FROM user_exchange_accounts
  WHERE user_id = user_id_param AND exchange = exchange_param;

  IF NOT FOUND THEN
    -- Create new account
    INSERT INTO user_exchange_accounts (
      user_id, exchange, status, exchange_email, registered_at
    ) VALUES (
      user_id_param, exchange_param, 'registered', email_param, NOW()
    );
  ELSE
    -- Update existing
    UPDATE user_exchange_accounts
    SET
      status = CASE WHEN status = 'pending_signup' THEN 'registered' ELSE status END,
      exchange_email = email_param,
      registered_at = COALESCE(registered_at, NOW()),
      updated_at = NOW()
    WHERE id = account_record.id;
  END IF;

  -- Track event
  PERFORM track_exchange_event(
    user_id_param, exchange_param, 'signup_confirmed',
    NULL, NULL, json_build_object('email', email_param)::jsonb
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Xac nhan dang ky thanh cong!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Update account milestone
CREATE OR REPLACE FUNCTION update_exchange_milestone(
  user_id_param UUID,
  exchange_param VARCHAR(50),
  milestone_param VARCHAR(30)
)
RETURNS JSON AS $$
DECLARE
  new_status VARCHAR(30);
  timestamp_column TEXT;
BEGIN
  -- Determine new status and timestamp column
  CASE milestone_param
    WHEN 'kyc_verified' THEN
      new_status := 'kyc_verified';
      timestamp_column := 'kyc_verified_at';
    WHEN 'first_deposit' THEN
      new_status := 'deposited';
      timestamp_column := 'first_deposit_at';
    WHEN 'first_trade' THEN
      new_status := 'active';
      timestamp_column := 'first_trade_at';
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid milestone');
  END CASE;

  -- Update account
  EXECUTE format(
    'UPDATE user_exchange_accounts SET status = $1, %I = NOW(), updated_at = NOW() WHERE user_id = $2 AND exchange = $3',
    timestamp_column
  ) USING new_status, user_id_param, exchange_param;

  -- Track event
  PERFORM track_exchange_event(user_id_param, exchange_param, milestone_param);

  RETURN json_build_object('success', true, 'milestone', milestone_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Schedule deposit prompt
CREATE OR REPLACE FUNCTION schedule_deposit_prompt(
  user_id_param UUID,
  exchange_param VARCHAR(50),
  prompt_type_param VARCHAR(50),
  delay_minutes INTEGER DEFAULT 0,
  context_data_param JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
  new_prompt_id UUID;
  scheduled TIMESTAMPTZ;
  expires TIMESTAMPTZ;
BEGIN
  -- Check if user already has pending prompt of same type
  IF EXISTS (
    SELECT 1 FROM deposit_prompts
    WHERE user_id = user_id_param
    AND exchange = exchange_param
    AND prompt_type = prompt_type_param
    AND status = 'pending'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Prompt already scheduled'
    );
  END IF;

  -- Check if user already deposited on this exchange
  IF EXISTS (
    SELECT 1 FROM user_exchange_accounts
    WHERE user_id = user_id_param
    AND exchange = exchange_param
    AND first_deposit_at IS NOT NULL
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already deposited'
    );
  END IF;

  -- Calculate schedule
  scheduled := NOW() + (delay_minutes || ' minutes')::INTERVAL;
  expires := scheduled + INTERVAL '7 days';

  -- Create prompt
  INSERT INTO deposit_prompts (
    user_id, exchange, prompt_type,
    scheduled_at, expires_at, context_data
  ) VALUES (
    user_id_param, exchange_param, prompt_type_param,
    scheduled, expires, context_data_param
  )
  RETURNING id INTO new_prompt_id;

  RETURN json_build_object(
    'success', true,
    'prompt_id', new_prompt_id,
    'scheduled_at', scheduled
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get pending prompts for user
CREATE OR REPLACE FUNCTION get_pending_prompts(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  exchange VARCHAR(50),
  prompt_type VARCHAR(50),
  context_data JSONB,
  scheduled_at TIMESTAMPTZ,
  exchange_name VARCHAR(100),
  exchange_color VARCHAR(20),
  affiliate_link TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.id,
    dp.exchange,
    dp.prompt_type,
    dp.context_data,
    dp.scheduled_at,
    ec.display_name as exchange_name,
    ec.color as exchange_color,
    ec.affiliate_link
  FROM deposit_prompts dp
  JOIN exchange_config ec ON ec.id = dp.exchange
  WHERE dp.user_id = user_id_param
  AND dp.status = 'pending'
  AND dp.scheduled_at <= NOW()
  AND (dp.expires_at IS NULL OR dp.expires_at > NOW())
  ORDER BY dp.scheduled_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Update prompt response
CREATE OR REPLACE FUNCTION respond_to_prompt(
  prompt_id_param UUID,
  action_param VARCHAR(20) -- 'open_exchange', 'remind_later', 'dismiss'
)
RETURNS JSON AS $$
DECLARE
  new_status VARCHAR(20);
  prompt_record deposit_prompts%ROWTYPE;
BEGIN
  -- Get prompt
  SELECT * INTO prompt_record FROM deposit_prompts WHERE id = prompt_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Prompt not found');
  END IF;

  -- Determine new status
  CASE action_param
    WHEN 'open_exchange' THEN new_status := 'clicked';
    WHEN 'remind_later' THEN new_status := 'pending'; -- Reschedule
    WHEN 'dismiss' THEN new_status := 'dismissed';
    ELSE new_status := 'dismissed';
  END CASE;

  -- Update prompt
  IF action_param = 'remind_later' THEN
    UPDATE deposit_prompts
    SET
      scheduled_at = NOW() + INTERVAL '24 hours',
      updated_at = NOW()
    WHERE id = prompt_id_param;
  ELSE
    UPDATE deposit_prompts
    SET
      status = new_status,
      shown_at = COALESCE(shown_at, NOW()),
      responded_at = NOW(),
      response_action = action_param,
      updated_at = NOW()
    WHERE id = prompt_id_param;
  END IF;

  -- Track event
  PERFORM track_exchange_event(
    prompt_record.user_id,
    prompt_record.exchange,
    CASE WHEN action_param = 'open_exchange' THEN 'prompt_clicked' ELSE 'prompt_dismissed' END,
    NULL, NULL,
    json_build_object('prompt_type', prompt_record.prompt_type, 'action', action_param)::jsonb
  );

  RETURN json_build_object('success', true, 'action', action_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 8: Check if should show deposit prompt (rate limiting)
CREATE OR REPLACE FUNCTION should_show_deposit_prompt(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prompts_shown_today INTEGER;
  last_prompt_time TIMESTAMPTZ;
BEGIN
  -- Count prompts shown today
  SELECT COUNT(*) INTO prompts_shown_today
  FROM deposit_prompts
  WHERE user_id = user_id_param
  AND shown_at >= NOW() - INTERVAL '24 hours';

  -- Max 2 prompts per day
  IF prompts_shown_today >= 2 THEN
    RETURN false;
  END IF;

  -- Check minimum interval (4 hours)
  SELECT MAX(shown_at) INTO last_prompt_time
  FROM deposit_prompts
  WHERE user_id = user_id_param
  AND shown_at IS NOT NULL;

  IF last_prompt_time IS NOT NULL AND last_prompt_time > NOW() - INTERVAL '4 hours' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 9: Get user's exchange accounts summary
CREATE OR REPLACE FUNCTION get_user_exchange_summary(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_accounts', COUNT(*),
    'registered', COUNT(*) FILTER (WHERE status IN ('registered', 'kyc_verified', 'deposited', 'active')),
    'with_deposit', COUNT(*) FILTER (WHERE first_deposit_at IS NOT NULL),
    'with_api', COUNT(*) FILTER (WHERE api_key_encrypted IS NOT NULL),
    'accounts', json_agg(json_build_object(
      'exchange', uea.exchange,
      'exchange_name', ec.display_name,
      'status', uea.status,
      'has_api', uea.api_key_encrypted IS NOT NULL,
      'registered_at', uea.registered_at,
      'first_deposit_at', uea.first_deposit_at,
      'cached_balance', uea.cached_balance
    ) ORDER BY uea.created_at)
  ) INTO result
  FROM user_exchange_accounts uea
  JOIN exchange_config ec ON ec.id = uea.exchange
  WHERE uea.user_id = user_id_param;

  RETURN COALESCE(result, json_build_object(
    'total_accounts', 0,
    'registered', 0,
    'with_deposit', 0,
    'with_api', 0,
    'accounts', '[]'::json
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 10: Check win streak trigger for deposit prompt
CREATE OR REPLACE FUNCTION check_win_streak_trigger(
  user_id_param UUID,
  current_streak INTEGER,
  total_profit NUMERIC DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  has_registered_exchange BOOLEAN;
  preferred_exchange VARCHAR(50);
  prompt_result JSON;
BEGIN
  -- Only trigger if streak >= 3
  IF current_streak < 3 THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'Streak too low');
  END IF;

  -- Check if user has registered exchange without deposit
  SELECT EXISTS(
    SELECT 1 FROM user_exchange_accounts
    WHERE user_id = user_id_param
    AND status IN ('registered', 'kyc_verified')
    AND first_deposit_at IS NULL
  ) INTO has_registered_exchange;

  IF NOT has_registered_exchange THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'No registered exchange without deposit');
  END IF;

  -- Check rate limiting
  IF NOT should_show_deposit_prompt(user_id_param) THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'Rate limited');
  END IF;

  -- Get preferred exchange (most recent registered)
  SELECT exchange INTO preferred_exchange
  FROM user_exchange_accounts
  WHERE user_id = user_id_param
  AND status IN ('registered', 'kyc_verified')
  AND first_deposit_at IS NULL
  ORDER BY registered_at DESC
  LIMIT 1;

  -- Schedule prompt
  SELECT schedule_deposit_prompt(
    user_id_param,
    preferred_exchange,
    'winning_streak',
    0, -- Immediate
    json_build_object('win_streak', current_streak, 'profit', total_profit)::jsonb
  ) INTO prompt_result;

  RETURN json_build_object(
    'should_prompt', true,
    'exchange', preferred_exchange,
    'prompt', prompt_result
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 11: Check high grade pattern trigger
CREATE OR REPLACE FUNCTION check_pattern_trigger(
  user_id_param UUID,
  pattern_grade VARCHAR(10),
  pattern_name VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  has_registered_exchange BOOLEAN;
  preferred_exchange VARCHAR(50);
  prompt_result JSON;
BEGIN
  -- Only trigger for A or A+ grades
  IF pattern_grade NOT IN ('A', 'A+') THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'Grade not high enough');
  END IF;

  -- Check if user has registered exchange without deposit
  SELECT EXISTS(
    SELECT 1 FROM user_exchange_accounts
    WHERE user_id = user_id_param
    AND status IN ('registered', 'kyc_verified')
    AND first_deposit_at IS NULL
  ) INTO has_registered_exchange;

  IF NOT has_registered_exchange THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'No registered exchange without deposit');
  END IF;

  -- Check rate limiting
  IF NOT should_show_deposit_prompt(user_id_param) THEN
    RETURN json_build_object('should_prompt', false, 'reason', 'Rate limited');
  END IF;

  -- Get preferred exchange
  SELECT exchange INTO preferred_exchange
  FROM user_exchange_accounts
  WHERE user_id = user_id_param
  AND status IN ('registered', 'kyc_verified')
  AND first_deposit_at IS NULL
  ORDER BY registered_at DESC
  LIMIT 1;

  -- Schedule prompt
  SELECT schedule_deposit_prompt(
    user_id_param,
    preferred_exchange,
    'high_grade_pattern',
    0,
    json_build_object('grade', pattern_grade, 'pattern', pattern_name)::jsonb
  ) INTO prompt_result;

  RETURN json_build_object(
    'should_prompt', true,
    'exchange', preferred_exchange,
    'prompt', prompt_result
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 5: ADMIN VIEWS & STATS
-- =====================================================

-- View: Exchange affiliate stats (Admin)
CREATE OR REPLACE VIEW exchange_affiliate_stats AS
SELECT
  ec.id as exchange,
  ec.display_name,
  COUNT(DISTINCT uea.user_id) as total_accounts,
  COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.status IN ('registered', 'kyc_verified', 'deposited', 'active')) as registered,
  COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.kyc_verified_at IS NOT NULL) as kyc_verified,
  COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.first_deposit_at IS NOT NULL) as deposited,
  COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.first_trade_at IS NOT NULL) as traded,
  COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.api_key_encrypted IS NOT NULL) as api_connected,
  COUNT(DISTINCT eae.id) FILTER (WHERE eae.event_type = 'link_clicked') as link_clicks,
  ROUND(
    COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.status IN ('registered', 'kyc_verified', 'deposited', 'active'))::NUMERIC /
    NULLIF(COUNT(DISTINCT eae.user_id) FILTER (WHERE eae.event_type = 'link_clicked'), 0) * 100, 1
  ) as click_to_signup_rate,
  ROUND(
    COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.first_deposit_at IS NOT NULL)::NUMERIC /
    NULLIF(COUNT(DISTINCT uea.user_id) FILTER (WHERE uea.status IN ('registered', 'kyc_verified', 'deposited', 'active')), 0) * 100, 1
  ) as signup_to_deposit_rate
FROM exchange_config ec
LEFT JOIN user_exchange_accounts uea ON uea.exchange = ec.id
LEFT JOIN exchange_affiliate_events eae ON eae.exchange = ec.id
WHERE ec.is_active = true
GROUP BY ec.id, ec.display_name
ORDER BY registered DESC;

-- Function: Get detailed affiliate stats with date range
CREATE OR REPLACE FUNCTION get_affiliate_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  summary_data JSON;
  by_exchange_data JSON;
  by_source_data JSON;
  daily_trend_data JSON;
BEGIN
  -- Get summary
  SELECT json_build_object(
    'total_link_clicks', COUNT(*) FILTER (WHERE event_type = 'link_clicked'),
    'total_signups', COUNT(*) FILTER (WHERE event_type = 'signup_confirmed'),
    'total_kyc', COUNT(*) FILTER (WHERE event_type = 'kyc_verified'),
    'total_deposits', COUNT(*) FILTER (WHERE event_type = 'first_deposit'),
    'total_trades', COUNT(*) FILTER (WHERE event_type = 'first_trade')
  ) INTO summary_data
  FROM exchange_affiliate_events
  WHERE created_at BETWEEN start_date AND end_date;

  -- Get by exchange (from view, but as a separate query)
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO by_exchange_data
  FROM (SELECT * FROM exchange_affiliate_stats) t;

  -- Get by source
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO by_source_data
  FROM (
    SELECT
      source_screen as source,
      COUNT(*) FILTER (WHERE event_type = 'link_clicked') as clicks,
      COUNT(*) FILTER (WHERE event_type = 'signup_confirmed') as signups
    FROM exchange_affiliate_events
    WHERE created_at BETWEEN start_date AND end_date
    AND source_screen IS NOT NULL
    GROUP BY source_screen
    ORDER BY COUNT(*) DESC
  ) t;

  -- Get daily trend
  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.date), '[]'::json) INTO daily_trend_data
  FROM (
    SELECT
      date_trunc('day', created_at)::DATE as date,
      COUNT(*) FILTER (WHERE event_type = 'link_clicked') as clicks,
      COUNT(*) FILTER (WHERE event_type = 'signup_confirmed') as signups,
      COUNT(*) FILTER (WHERE event_type = 'first_deposit') as deposits
    FROM exchange_affiliate_events
    WHERE created_at BETWEEN start_date AND end_date
    GROUP BY date_trunc('day', created_at)
  ) t;

  -- Build result
  result := json_build_object(
    'period', json_build_object('start', start_date, 'end', end_date),
    'summary', COALESCE(summary_data, '{}'::json),
    'by_exchange', by_exchange_data,
    'by_source', by_source_data,
    'daily_trend', daily_trend_data
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 6: TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on user_exchange_accounts
CREATE OR REPLACE FUNCTION update_user_exchange_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_exchange_accounts ON user_exchange_accounts;
CREATE TRIGGER trigger_update_user_exchange_accounts
  BEFORE UPDATE ON user_exchange_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_exchange_accounts_updated_at();

-- Trigger: Update updated_at on deposit_prompts
CREATE OR REPLACE FUNCTION update_deposit_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deposit_prompts ON deposit_prompts;
CREATE TRIGGER trigger_update_deposit_prompts
  BEFORE UPDATE ON deposit_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_deposit_prompts_updated_at();

-- Trigger: Auto-expire old prompts
CREATE OR REPLACE FUNCTION expire_old_prompts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deposit_prompts
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 7: INSERT DEFAULT DATA
-- =====================================================

-- Insert default exchange configs
INSERT INTO exchange_config (
  id, display_name, affiliate_ref_code, affiliate_link,
  commission_rate_spot, commission_rate_futures, user_fee_discount,
  color, description, features, deposit_methods,
  is_active, is_recommended, supports_vnd, display_order
) VALUES
-- Binance
(
  'binance',
  'Binance',
  '1124799179',
  'https://accounts.binance.com/register?ref=1124799179',
  0.1, 0.1, 0.2,
  '#F0B90B',
  'San giao dich lon nhat the gioi voi thanh khoan cao nhat',
  '["San lon nhat the gioi", "Thanh khoan cao nhat", "Nhieu cap giao dich", "P2P ho tro VND", "Giam 20% phi khi dang ky qua GEM"]'::jsonb,
  '[{"id": "p2p", "name": "P2P (VND → USDT)", "recommended": true, "description": "Mua USDT bang VND truc tiep tu nguoi ban"}, {"id": "card", "name": "The Visa/Mastercard", "recommended": false, "description": "Phi cao hon nhung nhanh chong"}]'::jsonb,
  true, true, true, 1
),
-- Nami
(
  'nami',
  'Nami Exchange',
  'gem2025',
  'https://nami.exchange/ref/gem2025',
  0.15, 0.15, 0.15,
  '#00D4AA',
  'San giao dich Viet Nam, ho tro tieng Viet va nap/rut VND truc tiep',
  '["San Viet Nam 100%", "Ho tro tieng Viet", "Nap/rut VND truc tiep", "Ho tro 24/7 tieng Viet", "Giam 15% phi khi dang ky qua GEM"]'::jsonb,
  '[{"id": "bank", "name": "Chuyen khoan ngan hang", "recommended": true, "description": "Nap VND truc tiep tu ngan hang Viet Nam"}, {"id": "momo", "name": "Vi MoMo", "recommended": false, "description": "Nap nhanh qua vi dien tu"}]'::jsonb,
  true, false, true, 2
),
-- OKX
(
  'okx',
  'OKX',
  'GEMRAL2025',
  'https://www.okx.com/join/GEMRAL2025',
  0.1, 0.1, 0.2,
  '#000000',
  'San giao dich top 3 the gioi voi cong cu giao dich chuyen nghiep',
  '["Top 3 the gioi", "Copy trading tot", "Giao dien than thien", "P2P ho tro VND", "Giam 20% phi khi dang ky qua GEM"]'::jsonb,
  '[{"id": "p2p", "name": "P2P (VND → USDT)", "recommended": true, "description": "Mua USDT bang VND"}, {"id": "card", "name": "The Visa/Mastercard", "recommended": false, "description": "Nap nhanh bang the"}]'::jsonb,
  true, false, true, 3
),
-- Bybit
(
  'bybit',
  'Bybit',
  'GEMRAL',
  'https://www.bybit.com/invite?ref=GEMRAL',
  0.1, 0.1, 0.2,
  '#F7A600',
  'San chuyen ve Futures voi leverage cao va thanh khoan tot',
  '["Chuyen ve Futures", "Leverage len toi 100x", "Giao dich nhanh", "P2P ho tro VND", "Giam 20% phi khi dang ky qua GEM"]'::jsonb,
  '[{"id": "p2p", "name": "P2P (VND → USDT)", "recommended": true, "description": "Mua USDT bang VND"}, {"id": "crypto", "name": "Chuyen crypto tu san khac", "recommended": false, "description": "Neu da co crypto o san khac"}]'::jsonb,
  true, false, true, 4
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  affiliate_ref_code = EXCLUDED.affiliate_ref_code,
  affiliate_link = EXCLUDED.affiliate_link,
  commission_rate_spot = EXCLUDED.commission_rate_spot,
  commission_rate_futures = EXCLUDED.commission_rate_futures,
  user_fee_discount = EXCLUDED.user_fee_discount,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  deposit_methods = EXCLUDED.deposit_methods,
  is_active = EXCLUDED.is_active,
  is_recommended = EXCLUDED.is_recommended,
  supports_vnd = EXCLUDED.supports_vnd,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check tables created
SELECT 'exchange_config' as table_name, COUNT(*) as count FROM exchange_config
UNION ALL
SELECT 'user_exchange_accounts', COUNT(*) FROM user_exchange_accounts
UNION ALL
SELECT 'exchange_affiliate_events', COUNT(*) FROM exchange_affiliate_events
UNION ALL
SELECT 'deposit_prompts', COUNT(*) FROM deposit_prompts;

-- Check functions created
SELECT proname as function_name
FROM pg_proc
WHERE proname IN (
  'track_exchange_event',
  'upsert_exchange_account',
  'confirm_exchange_signup',
  'update_exchange_milestone',
  'schedule_deposit_prompt',
  'get_pending_prompts',
  'respond_to_prompt',
  'should_show_deposit_prompt',
  'get_user_exchange_summary',
  'check_win_streak_trigger',
  'check_pattern_trigger',
  'get_affiliate_stats'
)
ORDER BY proname;

-- Verify default data
SELECT id, display_name, is_active, is_recommended FROM exchange_config ORDER BY display_order;

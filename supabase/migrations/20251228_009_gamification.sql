-- ============================================================
-- PHASE 5: NÂNG CAO - Gamification Tables
-- File: 20251228_009_gamification.sql
-- Description: Games, Lucky Wheel, Daily Check-in, Gems system
-- KPI: 40%+ engagement rate
-- ============================================================

-- ============================================================
-- TABLE 1: chatbot_games
-- Game definitions and configurations
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Game info
    name VARCHAR(255) NOT NULL,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN (
        'lucky_wheel',
        'scratch_card',
        'slot_machine',
        'quiz',
        'trivia'
    )),
    description TEXT,

    -- Configuration (JSON for flexibility)
    config JSONB DEFAULT '{}',
    -- Lucky Wheel example:
    -- {
    --   "segments": [
    --     {"label": "Giảm 10%", "probability": 0.25, "prize_type": "discount", "prize_value": "10"},
    --     {"label": "50 Gems", "probability": 0.30, "prize_type": "gems", "prize_value": "50"}
    --   ]
    -- }

    -- Limits
    plays_per_day INTEGER DEFAULT 1,
    plays_per_week INTEGER,
    requires_gems INTEGER DEFAULT 0,  -- Gems required to play

    -- Stats
    total_plays INTEGER DEFAULT 0,
    total_winners INTEGER DEFAULT 0,
    total_prizes_value DECIMAL(12,2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,

    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: chatbot_game_plays
-- Game play history
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_game_plays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    game_id UUID NOT NULL REFERENCES chatbot_games(id) ON DELETE CASCADE,
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Result
    result JSONB DEFAULT '{}',
    prize_type VARCHAR(50),  -- gems, discount, free_shipping, product, none
    prize_value TEXT,
    prize_claimed BOOLEAN DEFAULT false,
    prize_claimed_at TIMESTAMPTZ,

    -- Metadata
    gems_spent INTEGER DEFAULT 0,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game plays
CREATE INDEX IF NOT EXISTS idx_game_plays_user ON chatbot_game_plays(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_game ON chatbot_game_plays(game_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_date ON chatbot_game_plays(played_at DESC);

-- ============================================================
-- TABLE 3: chatbot_user_gems
-- User virtual currency balance
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_user_gems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference
    platform_user_id UUID UNIQUE NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Balance
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,

    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for gems
CREATE INDEX IF NOT EXISTS idx_user_gems_balance ON chatbot_user_gems(balance DESC);

-- ============================================================
-- TABLE 4: chatbot_gem_transactions
-- Gem transaction history
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_gem_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Transaction info
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'daily_bonus',      -- Daily check-in
        'game_win',         -- Won from game
        'game_spend',       -- Spent on game
        'referral',         -- Referral bonus
        'purchase',         -- Bought with money
        'redeem',           -- Redeemed for discount
        'gift',             -- Admin gift
        'refund',           -- Refund
        'expired',          -- Expired gems
        'bonus'             -- Other bonus
    )),
    amount INTEGER NOT NULL,  -- Positive for earn, negative for spend
    balance_after INTEGER NOT NULL,

    -- Reference to source
    reference_type VARCHAR(50),  -- game, checkin, order, etc.
    reference_id UUID,
    description TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_gem_transactions_user ON chatbot_gem_transactions(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_type ON chatbot_gem_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_date ON chatbot_gem_transactions(created_at DESC);

-- ============================================================
-- TABLE 5: chatbot_daily_checkins
-- Daily check-in records
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Check-in info
    checkin_date DATE NOT NULL,
    streak_day INTEGER DEFAULT 1 CHECK (streak_day BETWEEN 1 AND 7),

    -- Rewards
    gems_earned INTEGER DEFAULT 0,
    bonus_earned TEXT,  -- mystery_box, extra_spin, etc.
    bonus_claimed BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint for one check-in per day
    UNIQUE(platform_user_id, checkin_date)
);

-- Index for check-ins
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON chatbot_daily_checkins(platform_user_id, checkin_date DESC);

-- ============================================================
-- TABLE 6: chatbot_achievements
-- Achievement definitions
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Achievement info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),  -- Emoji or icon name
    category VARCHAR(50) DEFAULT 'general',

    -- Requirements
    requirement_type VARCHAR(50) NOT NULL,  -- checkin_streak, games_played, gems_earned, etc.
    requirement_value INTEGER NOT NULL,

    -- Rewards
    gem_reward INTEGER DEFAULT 0,
    badge_name VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,  -- Hidden until unlocked

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 7: chatbot_user_achievements
-- User unlocked achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES chatbot_achievements(id) ON DELETE CASCADE,

    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(platform_user_id, achievement_id)
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_user_gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_gem_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Service role full access
CREATE POLICY "Service role access games" ON chatbot_games FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access plays" ON chatbot_game_plays FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access gems" ON chatbot_user_gems FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access transactions" ON chatbot_gem_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access checkins" ON chatbot_daily_checkins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access achievements" ON chatbot_achievements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access user_achievements" ON chatbot_user_achievements FOR ALL USING (auth.role() = 'service_role');

-- Users can view active games
CREATE POLICY "Users can view active games" ON chatbot_games FOR SELECT
    USING (is_active = true);

-- Users can view achievements
CREATE POLICY "Users can view achievements" ON chatbot_achievements FOR SELECT
    USING (is_active = true AND (is_hidden = false OR EXISTS (
        SELECT 1 FROM chatbot_user_achievements ua
        WHERE ua.achievement_id = chatbot_achievements.id
        AND ua.completed = true
    )));

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS set_timestamp_games ON chatbot_games;
CREATE TRIGGER set_timestamp_games
    BEFORE UPDATE ON chatbot_games
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_gems ON chatbot_user_gems;
CREATE TRIGGER set_timestamp_gems
    BEFORE UPDATE ON chatbot_user_gems
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- FUNCTION: get_or_create_gem_balance
-- ============================================================

CREATE OR REPLACE FUNCTION get_or_create_gem_balance(p_platform_user_id UUID)
RETURNS chatbot_user_gems AS $$
DECLARE
    v_gems chatbot_user_gems;
BEGIN
    INSERT INTO chatbot_user_gems (platform_user_id)
    VALUES (p_platform_user_id)
    ON CONFLICT (platform_user_id) DO NOTHING;

    SELECT * INTO v_gems
    FROM chatbot_user_gems
    WHERE platform_user_id = p_platform_user_id;

    RETURN v_gems;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: add_gems_chatbot
-- Note: Named differently to avoid conflict with existing add_gems function
-- ============================================================

CREATE OR REPLACE FUNCTION add_gems_chatbot(
    p_platform_user_id UUID,
    p_amount INTEGER,
    p_transaction_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_gems chatbot_user_gems;
    v_new_balance INTEGER;
BEGIN
    -- Get or create balance
    SELECT * INTO v_gems FROM get_or_create_gem_balance(p_platform_user_id);

    v_new_balance := v_gems.balance + p_amount;

    -- Update balance
    UPDATE chatbot_user_gems SET
        balance = v_new_balance,
        total_earned = total_earned + GREATEST(p_amount, 0),
        total_spent = total_spent + ABS(LEAST(p_amount, 0)),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE platform_user_id = p_platform_user_id;

    -- Log transaction
    INSERT INTO chatbot_gem_transactions (
        platform_user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        reference_type,
        reference_id
    ) VALUES (
        p_platform_user_id,
        p_transaction_type,
        p_amount,
        v_new_balance,
        p_description,
        p_reference_type,
        p_reference_id
    );

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: daily_checkin
-- ============================================================

CREATE OR REPLACE FUNCTION daily_checkin(p_platform_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    streak_day INTEGER,
    gems_earned INTEGER,
    bonus_earned TEXT,
    message TEXT
) AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
    v_last_checkin RECORD;
    v_streak INTEGER := 1;
    v_gems INTEGER;
    v_bonus TEXT;
BEGIN
    -- Check if already checked in today
    IF EXISTS (
        SELECT 1 FROM chatbot_daily_checkins
        WHERE platform_user_id = p_platform_user_id
        AND checkin_date = v_today
    ) THEN
        RETURN QUERY SELECT
            false,
            0,
            0,
            NULL::TEXT,
            'Bạn đã điểm danh hôm nay rồi!'::TEXT;
        RETURN;
    END IF;

    -- Get yesterday's check-in for streak
    SELECT * INTO v_last_checkin
    FROM chatbot_daily_checkins
    WHERE platform_user_id = p_platform_user_id
    AND checkin_date = v_yesterday;

    IF v_last_checkin IS NOT NULL THEN
        v_streak := (v_last_checkin.streak_day % 7) + 1;
    END IF;

    -- Calculate rewards based on streak
    CASE v_streak
        WHEN 1 THEN v_gems := 10; v_bonus := NULL;
        WHEN 2 THEN v_gems := 15; v_bonus := NULL;
        WHEN 3 THEN v_gems := 20; v_bonus := NULL;
        WHEN 4 THEN v_gems := 25; v_bonus := NULL;
        WHEN 5 THEN v_gems := 30; v_bonus := NULL;
        WHEN 6 THEN v_gems := 40; v_bonus := NULL;
        WHEN 7 THEN v_gems := 100; v_bonus := 'mystery_box';
        ELSE v_gems := 10; v_bonus := NULL;
    END CASE;

    -- Save check-in
    INSERT INTO chatbot_daily_checkins (
        platform_user_id,
        checkin_date,
        streak_day,
        gems_earned,
        bonus_earned
    ) VALUES (
        p_platform_user_id,
        v_today,
        v_streak,
        v_gems,
        v_bonus
    );

    -- Add gems
    PERFORM add_gems_chatbot(
        p_platform_user_id,
        v_gems,
        'daily_bonus',
        'Điểm danh ngày ' || v_streak
    );

    -- Update streak in user_gems
    UPDATE chatbot_user_gems SET
        current_streak = v_streak,
        longest_streak = GREATEST(longest_streak, v_streak)
    WHERE platform_user_id = p_platform_user_id;

    RETURN QUERY SELECT
        true,
        v_streak,
        v_gems,
        v_bonus,
        ('Điểm danh thành công! Ngày ' || v_streak || '/7. +' || v_gems || ' Gems')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_plays_today
-- ============================================================

CREATE OR REPLACE FUNCTION get_plays_today(
    p_platform_user_id UUID,
    p_game_id UUID
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM chatbot_game_plays
        WHERE platform_user_id = p_platform_user_id
        AND game_id = p_game_id
        AND played_at >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_gamification_stats
-- ============================================================

CREATE OR REPLACE FUNCTION get_gamification_stats(p_platform_user_id UUID)
RETURNS TABLE (
    gem_balance INTEGER,
    total_earned INTEGER,
    total_spent INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    games_played BIGINT,
    games_won BIGINT,
    total_checkins BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(g.balance, 0),
        COALESCE(g.total_earned, 0),
        COALESCE(g.total_spent, 0),
        COALESCE(g.current_streak, 0),
        COALESCE(g.longest_streak, 0),
        (SELECT COUNT(*) FROM chatbot_game_plays WHERE platform_user_id = p_platform_user_id),
        (SELECT COUNT(*) FROM chatbot_game_plays WHERE platform_user_id = p_platform_user_id AND prize_type != 'none'),
        (SELECT COUNT(*) FROM chatbot_daily_checkins WHERE platform_user_id = p_platform_user_id)
    FROM chatbot_user_gems g
    WHERE g.platform_user_id = p_platform_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA: Default Games
-- ============================================================

INSERT INTO chatbot_games (name, game_type, description, config, plays_per_day) VALUES
    ('Vòng Quay May Mắn', 'lucky_wheel', 'Quay để nhận phần thưởng hấp dẫn mỗi ngày!', '{
        "segments": [
            {"label": "Giảm 10%", "probability": 0.15, "prize_type": "discount", "prize_value": "10", "color": "#FF6B6B"},
            {"label": "Giảm 5%", "probability": 0.25, "prize_type": "discount", "prize_value": "5", "color": "#4ECDC4"},
            {"label": "Free Ship", "probability": 0.10, "prize_type": "free_shipping", "prize_value": "true", "color": "#45B7D1"},
            {"label": "50 Gems", "probability": 0.20, "prize_type": "gems", "prize_value": "50", "color": "#96CEB4"},
            {"label": "20 Gems", "probability": 0.15, "prize_type": "gems", "prize_value": "20", "color": "#FFEAA7"},
            {"label": "Chúc may mắn", "probability": 0.15, "prize_type": "none", "prize_value": null, "color": "#DFE6E9"}
        ]
    }', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Default Achievements
-- ============================================================

INSERT INTO chatbot_achievements (name, description, icon, category, requirement_type, requirement_value, gem_reward) VALUES
    ('Người mới', 'Điểm danh lần đầu tiên', '🌟', 'checkin', 'total_checkins', 1, 10),
    ('Siêng năng', 'Điểm danh 7 ngày liên tiếp', '🔥', 'checkin', 'checkin_streak', 7, 50),
    ('Kiên trì', 'Điểm danh 30 ngày', '💪', 'checkin', 'total_checkins', 30, 200),
    ('May mắn', 'Thắng game lần đầu', '🎰', 'games', 'games_won', 1, 20),
    ('Cao thủ', 'Thắng 10 lần game', '👑', 'games', 'games_won', 10, 100),
    ('Tỉ phú Gems', 'Tích lũy 1000 Gems', '💎', 'gems', 'gems_earned', 1000, 100),
    ('Đại gia', 'Tích lũy 5000 Gems', '🏆', 'gems', 'gems_earned', 5000, 500)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON chatbot_games TO authenticated;
GRANT ALL ON chatbot_game_plays TO authenticated;
GRANT ALL ON chatbot_user_gems TO authenticated;
GRANT ALL ON chatbot_gem_transactions TO authenticated;
GRANT ALL ON chatbot_daily_checkins TO authenticated;
GRANT ALL ON chatbot_achievements TO authenticated;
GRANT ALL ON chatbot_user_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_gem_balance TO authenticated;
GRANT EXECUTE ON FUNCTION add_gems_chatbot TO authenticated;
GRANT EXECUTE ON FUNCTION daily_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION get_plays_today TO authenticated;
GRANT EXECUTE ON FUNCTION get_gamification_stats TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE chatbot_games IS 'Game definitions for gamification features';
COMMENT ON TABLE chatbot_game_plays IS 'User game play history';
COMMENT ON TABLE chatbot_user_gems IS 'User virtual currency (Gems) balance';
COMMENT ON TABLE chatbot_gem_transactions IS 'Gem transaction history';
COMMENT ON TABLE chatbot_daily_checkins IS 'Daily check-in records with streak tracking';
COMMENT ON TABLE chatbot_achievements IS 'Achievement definitions';
COMMENT ON TABLE chatbot_user_achievements IS 'User unlocked achievements';

-- ============================================================
-- DONE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'PHASE 5 Gamification Tables Created Successfully!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables: chatbot_games, chatbot_game_plays, chatbot_user_gems,';
    RAISE NOTICE '        chatbot_gem_transactions, chatbot_daily_checkins,';
    RAISE NOTICE '        chatbot_achievements, chatbot_user_achievements';
    RAISE NOTICE 'Functions: get_or_create_gem_balance, add_gems_chatbot, daily_checkin,';
    RAISE NOTICE '           get_plays_today, get_gamification_stats';
    RAISE NOTICE '============================================================';
END $$;

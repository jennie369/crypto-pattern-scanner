-- ============================================================
-- PHASE 3: TRÍ TUỆ - Emotion Detection & Personalization Tables
-- File: 20251228_005_emotion_tables.sql
-- Description: Emotion logs, user preferences for AI personalization
-- ============================================================

-- ============================================================
-- TABLE 1: chatbot_emotion_logs
-- Stores emotion analysis results for each message
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_emotion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    message_id UUID REFERENCES chatbot_messages(id) ON DELETE SET NULL,
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES chatbot_platform_conversations(id) ON DELETE CASCADE,

    -- Sentiment Analysis
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(4,3) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),

    -- Emotion Detection
    emotion VARCHAR(30) CHECK (emotion IN (
        'happy', 'excited', 'satisfied',
        'neutral', 'confused', 'curious',
        'sad', 'disappointed', 'frustrated', 'angry', 'anxious'
    )),
    emotion_score DECIMAL(4,3) CHECK (emotion_score >= 0 AND emotion_score <= 1),

    -- Urgency Detection
    urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    urgency_score DECIMAL(4,3) CHECK (urgency_score >= 0 AND urgency_score <= 1),

    -- Details
    trigger_words TEXT[] DEFAULT '{}',
    response_tone VARCHAR(50),
    empathy_level INTEGER CHECK (empathy_level BETWEEN 1 AND 5),

    -- Metadata
    raw_text TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for emotion logs
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user ON chatbot_emotion_logs(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_conversation ON chatbot_emotion_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_emotion ON chatbot_emotion_logs(emotion);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_sentiment ON chatbot_emotion_logs(sentiment);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_urgency ON chatbot_emotion_logs(urgency);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_created ON chatbot_emotion_logs(created_at DESC);

-- ============================================================
-- TABLE 2: chatbot_user_preferences
-- Stores user preferences for personalization
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_user_id UUID UNIQUE NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Language & Style
    preferred_language VARCHAR(10) DEFAULT 'vi',
    response_style VARCHAR(30) DEFAULT 'friendly' CHECK (response_style IN (
        'formal', 'friendly', 'casual', 'professional', 'empathetic'
    )),
    use_emoji BOOLEAN DEFAULT true,

    -- Interests & Preferences
    interests JSONB DEFAULT '{}',
    -- Example: {"trading": true, "crystals": true, "tarot": false}

    favorite_categories TEXT[] DEFAULT '{}',
    -- Example: ['bracelets', 'pendants', 'rings']

    price_range JSONB DEFAULT '{"min": 0, "max": null}',

    -- Shopping History (for recommendations)
    viewed_products UUID[] DEFAULT '{}',
    purchased_products UUID[] DEFAULT '{}',
    wishlist_products UUID[] DEFAULT '{}',

    -- Astrology/Feng Shui (for personalized recommendations)
    zodiac_sign VARCHAR(20) CHECK (zodiac_sign IN (
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    )),
    birth_year INTEGER CHECK (birth_year > 1900 AND birth_year < 2100),
    element VARCHAR(20) CHECK (element IN ('metal', 'water', 'wood', 'fire', 'earth')),
    favorite_crystals TEXT[] DEFAULT '{}',

    -- Engagement Metrics
    engagement_score DECIMAL(4,3) DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 1),
    interaction_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,

    -- Emotion History Summary
    dominant_emotion VARCHAR(30),
    avg_sentiment_score DECIMAL(4,3),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user preferences
CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON chatbot_user_preferences(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_user_prefs_zodiac ON chatbot_user_preferences(zodiac_sign);
CREATE INDEX IF NOT EXISTS idx_user_prefs_element ON chatbot_user_preferences(element);
CREATE INDEX IF NOT EXISTS idx_user_prefs_engagement ON chatbot_user_preferences(engagement_score DESC);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: chatbot_emotion_logs
-- ============================================================

DROP POLICY IF EXISTS "Service role access emotion logs" ON chatbot_emotion_logs;
CREATE POLICY "Service role access emotion logs"
    ON chatbot_emotion_logs FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own emotion logs" ON chatbot_emotion_logs;
CREATE POLICY "Users can view own emotion logs"
    ON chatbot_emotion_logs FOR SELECT
    USING (
        platform_user_id IN (
            SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can view all emotion logs" ON chatbot_emotion_logs;
CREATE POLICY "Admins can view all emotion logs"
    ON chatbot_emotion_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
        )
    );

-- ============================================================
-- RLS POLICIES: chatbot_user_preferences
-- ============================================================

DROP POLICY IF EXISTS "Service role access user preferences" ON chatbot_user_preferences;
CREATE POLICY "Service role access user preferences"
    ON chatbot_user_preferences FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own preferences" ON chatbot_user_preferences;
CREATE POLICY "Users can view own preferences"
    ON chatbot_user_preferences FOR SELECT
    USING (
        platform_user_id IN (
            SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own preferences" ON chatbot_user_preferences;
CREATE POLICY "Users can update own preferences"
    ON chatbot_user_preferences FOR UPDATE
    USING (
        platform_user_id IN (
            SELECT id FROM chatbot_platform_users WHERE app_user_id = auth.uid()
        )
    );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update timestamp trigger
DROP TRIGGER IF EXISTS set_timestamp_user_preferences ON chatbot_user_preferences;
CREATE TRIGGER set_timestamp_user_preferences
    BEFORE UPDATE ON chatbot_user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- FUNCTION: log_emotion_analysis
-- ============================================================

CREATE OR REPLACE FUNCTION log_emotion_analysis(
    p_message_id UUID,
    p_platform_user_id UUID,
    p_conversation_id UUID,
    p_sentiment VARCHAR(20),
    p_sentiment_score DECIMAL(4,3),
    p_emotion VARCHAR(30),
    p_emotion_score DECIMAL(4,3),
    p_urgency VARCHAR(20),
    p_urgency_score DECIMAL(4,3),
    p_trigger_words TEXT[] DEFAULT '{}',
    p_response_tone VARCHAR(50) DEFAULT NULL,
    p_empathy_level INTEGER DEFAULT NULL,
    p_raw_text TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO chatbot_emotion_logs (
        message_id,
        platform_user_id,
        conversation_id,
        sentiment,
        sentiment_score,
        emotion,
        emotion_score,
        urgency,
        urgency_score,
        trigger_words,
        response_tone,
        empathy_level,
        raw_text
    ) VALUES (
        p_message_id,
        p_platform_user_id,
        p_conversation_id,
        p_sentiment,
        p_sentiment_score,
        p_emotion,
        p_emotion_score,
        p_urgency,
        p_urgency_score,
        p_trigger_words,
        p_response_tone,
        p_empathy_level,
        p_raw_text
    )
    RETURNING id INTO v_log_id;

    -- Update user preferences with emotion data
    INSERT INTO chatbot_user_preferences (platform_user_id, interaction_count, last_interaction_at)
    VALUES (p_platform_user_id, 1, NOW())
    ON CONFLICT (platform_user_id) DO UPDATE SET
        interaction_count = chatbot_user_preferences.interaction_count + 1,
        last_interaction_at = NOW(),
        updated_at = NOW();

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_or_create_user_preferences
-- ============================================================

CREATE OR REPLACE FUNCTION get_or_create_user_preferences(p_platform_user_id UUID)
RETURNS chatbot_user_preferences AS $$
DECLARE
    v_prefs chatbot_user_preferences;
BEGIN
    INSERT INTO chatbot_user_preferences (platform_user_id)
    VALUES (p_platform_user_id)
    ON CONFLICT (platform_user_id) DO NOTHING;

    SELECT * INTO v_prefs
    FROM chatbot_user_preferences
    WHERE platform_user_id = p_platform_user_id;

    RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: update_user_preferences
-- ============================================================

CREATE OR REPLACE FUNCTION update_user_preferences(
    p_platform_user_id UUID,
    p_updates JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE chatbot_user_preferences
    SET
        preferred_language = COALESCE((p_updates->>'preferred_language')::VARCHAR, preferred_language),
        response_style = COALESCE((p_updates->>'response_style')::VARCHAR, response_style),
        use_emoji = COALESCE((p_updates->>'use_emoji')::BOOLEAN, use_emoji),
        interests = COALESCE((p_updates->'interests')::JSONB, interests),
        favorite_categories = COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(p_updates->'favorite_categories')),
            favorite_categories
        ),
        zodiac_sign = COALESCE((p_updates->>'zodiac_sign')::VARCHAR, zodiac_sign),
        birth_year = COALESCE((p_updates->>'birth_year')::INTEGER, birth_year),
        element = COALESCE((p_updates->>'element')::VARCHAR, element),
        updated_at = NOW()
    WHERE platform_user_id = p_platform_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_user_emotion_stats
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_emotion_stats(
    p_platform_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_messages BIGINT,
    avg_sentiment_score NUMERIC,
    dominant_emotion VARCHAR(30),
    emotion_breakdown JSONB,
    urgency_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total,
            AVG(sentiment_score) as avg_sentiment,
            emotion,
            COUNT(*) as emotion_count
        FROM chatbot_emotion_logs
        WHERE platform_user_id = p_platform_user_id
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        GROUP BY emotion
    ),
    urgency_stats AS (
        SELECT
            urgency,
            COUNT(*) as urgency_count
        FROM chatbot_emotion_logs
        WHERE platform_user_id = p_platform_user_id
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        GROUP BY urgency
    )
    SELECT
        (SELECT SUM(total) FROM stats)::BIGINT as total_messages,
        (SELECT AVG(avg_sentiment) FROM stats)::NUMERIC as avg_sentiment_score,
        (SELECT emotion FROM stats ORDER BY emotion_count DESC LIMIT 1) as dominant_emotion,
        (SELECT jsonb_object_agg(emotion, emotion_count) FROM stats) as emotion_breakdown,
        (SELECT jsonb_object_agg(urgency, urgency_count) FROM urgency_stats) as urgency_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON chatbot_emotion_logs TO authenticated;
GRANT ALL ON chatbot_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION log_emotion_analysis TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emotion_stats TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE chatbot_emotion_logs IS 'Emotion analysis logs for each chatbot message';
COMMENT ON TABLE chatbot_user_preferences IS 'User preferences for AI personalization and recommendations';
COMMENT ON FUNCTION log_emotion_analysis IS 'Log emotion analysis result and update user preferences';
COMMENT ON FUNCTION get_or_create_user_preferences IS 'Get or create user preferences record';
COMMENT ON FUNCTION update_user_preferences IS 'Update user preferences with JSON patch';
COMMENT ON FUNCTION get_user_emotion_stats IS 'Get emotion statistics for a user over specified days';

-- ============================================================
-- DONE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'PHASE 3 Emotion Tables Created Successfully!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables: chatbot_emotion_logs, chatbot_user_preferences';
    RAISE NOTICE 'Functions: log_emotion_analysis, get_or_create_user_preferences,';
    RAISE NOTICE '           update_user_preferences, get_user_emotion_stats';
    RAISE NOTICE '============================================================';
END $$;

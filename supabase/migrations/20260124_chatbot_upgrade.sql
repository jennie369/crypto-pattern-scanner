-- ============================================================
-- GEM MASTER CHATBOT UPGRADE - DATABASE MIGRATION
-- Created: 2026-01-24
-- Description: 5 new tables for chatbot intelligence features
-- ============================================================
-- CHẠY TỪNG BLOCK MỘT, VERIFY SAU MỖI BLOCK
-- ============================================================

-- ============================================================
-- BLOCK 1: USER AI INSIGHTS TABLE
-- Lưu insights về user từ conversations
-- ============================================================

-- Check if table exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_ai_insights') THEN
        CREATE TABLE user_ai_insights (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

            -- Insight data
            insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN (
                'trading_pattern',    -- Patterns user quan tâm
                'emotional_pattern',  -- Vấn đề cảm xúc thường gặp
                'learning_style',     -- Cách học ưa thích
                'interest_topic',     -- Chủ đề hay hỏi
                'weakness',           -- Điểm yếu cần cải thiện
                'strength',           -- Điểm mạnh
                'behavior'            -- Hành vi đặc trưng
            )),
            content TEXT NOT NULL,
            confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
            source_message_id UUID,   -- Message dẫn đến insight này

            -- Metadata
            is_active BOOLEAN DEFAULT TRUE,
            times_referenced INTEGER DEFAULT 0,  -- Số lần AI sử dụng insight này
            last_referenced_at TIMESTAMPTZ,

            -- Timestamps
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        RAISE NOTICE 'Table user_ai_insights created successfully';
    ELSE
        RAISE NOTICE 'Table user_ai_insights already exists, skipping';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_ai_insights_user_id ON user_ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_insights_type ON user_ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_ai_insights_active ON user_ai_insights(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE user_ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insights" ON user_ai_insights;
CREATE POLICY "Users can view own insights" ON user_ai_insights
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert insights" ON user_ai_insights;
CREATE POLICY "System can insert insights" ON user_ai_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update insights" ON user_ai_insights;
CREATE POLICY "System can update insights" ON user_ai_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- ✅ VERIFY BLOCK 1:
-- SELECT * FROM user_ai_insights LIMIT 1;


-- ============================================================
-- BLOCK 2: CONVERSATION TOPICS TABLE
-- Track chủ đề của mỗi conversation
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversation_topics') THEN
        CREATE TABLE conversation_topics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            conversation_id UUID,  -- Link to chat_messages group

            -- Topic data
            topic VARCHAR(100) NOT NULL,
            category VARCHAR(50) CHECK (category IN (
                'trading',
                'spiritual',
                'emotional',
                'learning',
                'upgrade',
                'general'
            )),
            sentiment VARCHAR(20) CHECK (sentiment IN (
                'positive',
                'negative',
                'neutral',
                'mixed'
            )),

            -- Metrics
            message_count INTEGER DEFAULT 1,
            duration_seconds INTEGER,

            -- Timestamps
            started_at TIMESTAMPTZ DEFAULT NOW(),
            ended_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        RAISE NOTICE 'Table conversation_topics created successfully';
    ELSE
        RAISE NOTICE 'Table conversation_topics already exists, skipping';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_topics_user_id ON conversation_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_topics_category ON conversation_topics(category);
CREATE INDEX IF NOT EXISTS idx_conversation_topics_started_at ON conversation_topics(started_at DESC);

-- RLS
ALTER TABLE conversation_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own topics" ON conversation_topics;
CREATE POLICY "Users can view own topics" ON conversation_topics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert topics" ON conversation_topics;
CREATE POLICY "Users can insert topics" ON conversation_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update topics" ON conversation_topics;
CREATE POLICY "Users can update topics" ON conversation_topics
    FOR UPDATE USING (auth.uid() = user_id);

-- ✅ VERIFY BLOCK 2:
-- SELECT * FROM conversation_topics LIMIT 1;


-- ============================================================
-- BLOCK 3: CHATBOT ANALYTICS TABLE
-- Track queries để cải thiện knowledge base
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'chatbot_analytics') THEN
        CREATE TABLE chatbot_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

            -- Query data
            query TEXT NOT NULL,
            query_intent VARCHAR(50),
            matched_faq_key VARCHAR(100),

            -- Response data
            response_type VARCHAR(30) DEFAULT 'text',
            confidence DECIMAL(3,2),
            response_time_ms INTEGER,

            -- Feedback
            user_feedback VARCHAR(20) CHECK (user_feedback IN (
                'thumbs_up',
                'thumbs_down',
                'none'
            )) DEFAULT 'none',
            feedback_comment TEXT,

            -- Context
            user_tier VARCHAR(20),
            session_id UUID,

            -- Timestamps
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        RAISE NOTICE 'Table chatbot_analytics created successfully';
    ELSE
        RAISE NOTICE 'Table chatbot_analytics already exists, skipping';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_user_id ON chatbot_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_intent ON chatbot_analytics(query_intent);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_feedback ON chatbot_analytics(user_feedback);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_created ON chatbot_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_no_match ON chatbot_analytics(matched_faq_key)
    WHERE matched_faq_key IS NULL;

-- RLS - Analytics có thể public cho admin
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics" ON chatbot_analytics;
CREATE POLICY "Users can view own analytics" ON chatbot_analytics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert analytics" ON chatbot_analytics;
CREATE POLICY "Users can insert analytics" ON chatbot_analytics
    FOR INSERT WITH CHECK (TRUE);  -- Allow all inserts

-- ✅ VERIFY BLOCK 3:
-- SELECT * FROM chatbot_analytics LIMIT 1;


-- ============================================================
-- BLOCK 4: SMART TRIGGERS LOG TABLE
-- Log các smart triggers đã hiển thị
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'smart_trigger_logs') THEN
        CREATE TABLE smart_trigger_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

            -- Trigger data
            trigger_type VARCHAR(50) NOT NULL,
            trigger_message TEXT NOT NULL,
            trigger_condition JSONB,  -- Condition that triggered

            -- User response
            was_shown BOOLEAN DEFAULT TRUE,
            was_dismissed BOOLEAN DEFAULT FALSE,
            was_acted_upon BOOLEAN DEFAULT FALSE,
            action_taken VARCHAR(50),

            -- Timestamps
            shown_at TIMESTAMPTZ DEFAULT NOW(),
            dismissed_at TIMESTAMPTZ,
            acted_at TIMESTAMPTZ
        );

        RAISE NOTICE 'Table smart_trigger_logs created successfully';
    ELSE
        RAISE NOTICE 'Table smart_trigger_logs already exists, skipping';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_smart_trigger_logs_user_id ON smart_trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_trigger_logs_type ON smart_trigger_logs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_smart_trigger_logs_shown ON smart_trigger_logs(shown_at DESC);

-- RLS
ALTER TABLE smart_trigger_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own triggers" ON smart_trigger_logs;
CREATE POLICY "Users can view own triggers" ON smart_trigger_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert triggers" ON smart_trigger_logs;
CREATE POLICY "Users can insert triggers" ON smart_trigger_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update triggers" ON smart_trigger_logs;
CREATE POLICY "Users can update triggers" ON smart_trigger_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- ✅ VERIFY BLOCK 4:
-- SELECT * FROM smart_trigger_logs LIMIT 1;


-- ============================================================
-- BLOCK 5: USER CONTEXT CACHE TABLE
-- Cache user context để không phải build lại mỗi lần
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_context_cache') THEN
        CREATE TABLE user_context_cache (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

            -- Cached context
            context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
            context_version INTEGER DEFAULT 1,

            -- Cache metadata
            is_stale BOOLEAN DEFAULT FALSE,
            last_built_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),

            -- Timestamps
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),

            -- Unique constraint
            CONSTRAINT unique_user_context UNIQUE (user_id)
        );

        RAISE NOTICE 'Table user_context_cache created successfully';
    ELSE
        RAISE NOTICE 'Table user_context_cache already exists, skipping';
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_context_cache_user_id ON user_context_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_context_cache_expires ON user_context_cache(expires_at);

-- RLS
ALTER TABLE user_context_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own context" ON user_context_cache;
CREATE POLICY "Users can view own context" ON user_context_cache
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own context" ON user_context_cache;
CREATE POLICY "Users can upsert own context" ON user_context_cache
    FOR ALL USING (auth.uid() = user_id);

-- ✅ VERIFY BLOCK 5:
-- SELECT * FROM user_context_cache LIMIT 1;


-- ============================================================
-- BLOCK 6: HELPER FUNCTIONS
-- ============================================================

-- Function: Get user's recent topics (last N days)
CREATE OR REPLACE FUNCTION get_user_recent_topics(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    topic VARCHAR(100),
    category VARCHAR(50),
    frequency BIGINT,
    last_discussed TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ct.topic,
        ct.category,
        COUNT(*)::BIGINT as frequency,
        MAX(ct.started_at) as last_discussed
    FROM conversation_topics ct
    WHERE ct.user_id = p_user_id
        AND ct.started_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY ct.topic, ct.category
    ORDER BY frequency DESC, last_discussed DESC
    LIMIT p_limit;
END;
$$;

-- Function: Get user's active insights
CREATE OR REPLACE FUNCTION get_user_active_insights(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    insight_type VARCHAR(50),
    content TEXT,
    confidence DECIMAL(3,2),
    times_referenced INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        uai.insight_type,
        uai.content,
        uai.confidence,
        uai.times_referenced
    FROM user_ai_insights uai
    WHERE uai.user_id = p_user_id
        AND uai.is_active = TRUE
    ORDER BY uai.confidence DESC, uai.times_referenced DESC
    LIMIT p_limit;
END;
$$;

-- ✅ VERIFY BLOCK 6:
-- SELECT * FROM get_user_recent_topics('test-user-id', 7, 10);


-- ============================================================
-- FINAL VERIFICATION
-- ============================================================
-- Chạy tất cả queries này để verify migration thành công:

-- SELECT tablename FROM pg_tables WHERE schemaname = 'public'
--     AND tablename IN ('user_ai_insights', 'conversation_topics', 'chatbot_analytics',
--                       'smart_trigger_logs', 'user_context_cache');

-- Expected: 5 rows

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ CHATBOT UPGRADE MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - user_ai_insights (User AI insights storage)';
    RAISE NOTICE '  - conversation_topics (Conversation topic tracking)';
    RAISE NOTICE '  - chatbot_analytics (Query analytics & feedback)';
    RAISE NOTICE '  - smart_trigger_logs (Smart trigger logs)';
    RAISE NOTICE '  - user_context_cache (User context caching)';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - get_user_recent_topics()';
    RAISE NOTICE '  - get_user_active_insights()';
    RAISE NOTICE '============================================================';
END $$;

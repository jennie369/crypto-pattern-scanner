-- ============================================================
-- VISIONBOARD UPGRADE MIGRATION
-- Activity Feed & Recommendations System
-- Migration: 20260125_visionboard_activity_feed.sql
-- ============================================================

-- ============================================================
-- 1. ACTIVITY FEED TABLE
-- Tracks all user activities across rituals, goals, habits, divination
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_activities') THEN
        CREATE TABLE user_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

            -- Activity type
            activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
                'ritual_complete',
                'goal_progress',
                'goal_complete',
                'habit_complete',
                'tarot_reading',
                'iching_reading',
                'achievement_unlock',
                'streak_milestone',
                'visionboard_update',
                'reflection_saved'
            )),

            -- Reference to source
            reference_id UUID,
            reference_type VARCHAR(50),

            -- Activity data
            title VARCHAR(255) NOT NULL,
            description TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,

            -- XP and rewards
            xp_earned INTEGER DEFAULT 0,

            -- Timestamps
            completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        RAISE NOTICE 'Table user_activities created';
    ELSE
        RAISE NOTICE 'Table user_activities already exists';
    END IF;
END $$;

-- Indexes for user_activities
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON user_activities(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON user_activities(user_id, completed_at DESC);

-- RLS for user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own activities" ON user_activities;
CREATE POLICY "Users view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own activities" ON user_activities;
CREATE POLICY "Users insert own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 2. USER RECOMMENDATIONS CACHE
-- Store personalized ritual/activity recommendations
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_recommendations') THEN
        CREATE TABLE user_recommendations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

            -- Recommendations
            suggested_rituals JSONB DEFAULT '[]'::jsonb,
            optimal_time VARCHAR(20),
            focus_areas JSONB DEFAULT '[]'::jsonb,
            personalized_message TEXT,

            -- Cache control
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),

            UNIQUE(user_id)
        );

        RAISE NOTICE 'Table user_recommendations created';
    ELSE
        RAISE NOTICE 'Table user_recommendations already exists';
    END IF;
END $$;

-- Indexes for user_recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires ON user_recommendations(expires_at);

-- RLS for user_recommendations
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own recommendations" ON user_recommendations;
CREATE POLICY "Users view own recommendations" ON user_recommendations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users upsert own recommendations" ON user_recommendations;
CREATE POLICY "Users upsert own recommendations" ON user_recommendations
    FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- 3. HELPER FUNCTIONS
-- ============================================================

-- Get user activity feed with pagination
CREATE OR REPLACE FUNCTION get_user_activity_feed(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    activity_type VARCHAR,
    title VARCHAR,
    description TEXT,
    metadata JSONB,
    xp_earned INTEGER,
    completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.activity_type,
        a.title,
        a.description,
        a.metadata,
        a.xp_earned,
        a.completed_at
    FROM user_activities a
    WHERE a.user_id = p_user_id
    ORDER BY a.completed_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Get activities grouped by date for calendar view
CREATE OR REPLACE FUNCTION get_activities_by_date(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    activity_date DATE,
    activity_count INTEGER,
    total_xp INTEGER,
    activity_types TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(a.completed_at) as activity_date,
        COUNT(*)::INTEGER as activity_count,
        COALESCE(SUM(a.xp_earned), 0)::INTEGER as total_xp,
        ARRAY_AGG(DISTINCT a.activity_type) as activity_types
    FROM user_activities a
    WHERE a.user_id = p_user_id
      AND DATE(a.completed_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(a.completed_at)
    ORDER BY activity_date;
END;
$$;

-- Get today's activity summary
CREATE OR REPLACE FUNCTION get_today_activity_summary(p_user_id UUID)
RETURNS TABLE (
    total_activities INTEGER,
    total_xp INTEGER,
    rituals_completed INTEGER,
    readings_completed INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_activities,
        COALESCE(SUM(a.xp_earned), 0)::INTEGER as total_xp,
        COUNT(*) FILTER (WHERE a.activity_type = 'ritual_complete')::INTEGER as rituals_completed,
        COUNT(*) FILTER (WHERE a.activity_type IN ('tarot_reading', 'iching_reading'))::INTEGER as readings_completed
    FROM user_activities a
    WHERE a.user_id = p_user_id
      AND DATE(a.completed_at) = CURRENT_DATE;
END;
$$;


-- ============================================================
-- VERIFY MIGRATION
-- ============================================================
-- Run these queries to verify:
-- SELECT * FROM user_activities LIMIT 1;
-- SELECT * FROM user_recommendations LIMIT 1;
-- SELECT get_user_activity_feed(auth.uid(), 10, 0);
-- SELECT get_today_activity_summary(auth.uid());

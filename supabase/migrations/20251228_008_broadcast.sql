-- ============================================================
-- PHASE 4: TỐI ƯU - Broadcast Marketing Tables
-- File: 20251228_008_broadcast.sql
-- Description: User segments, broadcast campaigns, A/B testing
-- KPI: 90%+ broadcast open rate
-- ============================================================

-- ============================================================
-- TABLE 1: chatbot_segments
-- User segments for targeted marketing
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Segment rules (JSON structure for flexible filtering)
    rules JSONB NOT NULL DEFAULT '{}',
    -- Example rules:
    -- {"platform": ["zalo", "messenger"]}
    -- {"tier": ["TIER_2", "TIER_3"]}
    -- {"last_active_days": {"lte": 30}}
    -- {"purchase_count": {"gte": 1}}
    -- {"zodiac_sign": ["aries", "taurus"]}
    -- {"emotion_dominant": ["happy", "excited"]}

    -- Calculated stats
    user_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,  -- System segments cannot be deleted

    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default segments
INSERT INTO chatbot_segments (name, description, rules, is_system) VALUES
    ('All Users', 'Tất cả users trên mọi platform', '{}', true),
    ('Zalo Users', 'Users trên Zalo', '{"platform": ["zalo"]}', true),
    ('Messenger Users', 'Users trên Messenger', '{"platform": ["messenger"]}', true),
    ('Active Last 7 Days', 'Users hoạt động trong 7 ngày', '{"last_active_days": {"lte": 7}}', true),
    ('Inactive 30+ Days', 'Users không hoạt động 30+ ngày', '{"last_active_days": {"gte": 30}}', true),
    ('Premium Tiers', 'Users tier 2+ trả phí', '{"tier": ["TIER_2", "TIER_3"]}', true),
    ('Has Purchased', 'Users đã mua hàng', '{"purchase_count": {"gte": 1}}', true),
    ('Cart Abandoners', 'Users bỏ giỏ hàng', '{"has_abandoned_cart": true}', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLE 2: chatbot_broadcasts
-- Broadcast campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Campaign info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Message content
    message_template TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN (
        'text',
        'image',
        'template',
        'quick_reply'
    )),

    -- Attachments (images, buttons, etc.)
    attachments JSONB DEFAULT '[]',
    -- Example: [{"type": "image", "url": "..."}]

    quick_replies JSONB DEFAULT '[]',
    -- Example: [{"label": "Xem ngay", "payload": "view_promo"}]

    -- Targeting
    segment_id UUID REFERENCES chatbot_segments(id) ON DELETE SET NULL,
    platforms TEXT[] DEFAULT ARRAY['zalo', 'messenger'],

    -- Scheduling
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft',       -- Not yet ready
        'scheduled',   -- Scheduled for future
        'sending',     -- Currently sending
        'sent',        -- Completed
        'paused',      -- Paused mid-send
        'cancelled',   -- Cancelled
        'failed'       -- Failed
    )),
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,

    -- A/B Testing
    is_ab_test BOOLEAN DEFAULT false,
    ab_variants JSONB DEFAULT NULL,
    -- Example: [
    --   {"id": "A", "message": "...", "weight": 50},
    --   {"id": "B", "message": "...", "weight": 50}
    -- ]
    winning_variant VARCHAR(50),

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for broadcasts
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON chatbot_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled ON chatbot_broadcasts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_broadcasts_segment ON chatbot_broadcasts(segment_id);

-- ============================================================
-- TABLE 3: chatbot_broadcast_recipients
-- Recipients for each broadcast
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_broadcast_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    broadcast_id UUID NOT NULL REFERENCES chatbot_broadcasts(id) ON DELETE CASCADE,
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',     -- Waiting to send
        'sent',        -- Message sent
        'delivered',   -- Delivery confirmed
        'read',        -- Message read
        'clicked',     -- Link clicked
        'replied',     -- User replied
        'failed',      -- Send failed
        'skipped'      -- Skipped (unsubscribed, blocked, etc.)
    )),

    -- Timestamps
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,

    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- A/B variant
    variant_id VARCHAR(50),

    -- Platform message ID for tracking
    platform_message_id VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for recipients
CREATE INDEX IF NOT EXISTS idx_recipients_broadcast ON chatbot_broadcast_recipients(broadcast_id, status);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON chatbot_broadcast_recipients(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_pending ON chatbot_broadcast_recipients(broadcast_id, status)
    WHERE status = 'pending';

-- Unique constraint to prevent duplicate recipients
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipients_unique
    ON chatbot_broadcast_recipients(broadcast_id, platform_user_id);

-- ============================================================
-- TABLE 4: chatbot_broadcast_templates
-- Reusable message templates
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_broadcast_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Template info
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,

    -- Content
    message_template TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    attachments JSONB DEFAULT '[]',
    quick_replies JSONB DEFAULT '[]',

    -- Variables (for preview)
    sample_variables JSONB DEFAULT '{}',
    -- Example: {"name": "Ngọc", "product": "Vòng Thạch Anh"}

    -- Usage stats
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample templates
INSERT INTO chatbot_broadcast_templates (name, category, message_template, sample_variables) VALUES
    ('Welcome New User', 'onboarding',
     'Chào {{name}}! Cảm ơn bạn đã theo dõi Gemral. Bạn có thể hỏi tôi bất cứ điều gì về trading, đá phong thủy, và nhiều hơn nữa!',
     '{"name": "bạn"}'),
    ('Flash Sale', 'promotion',
     'Flash Sale hôm nay! Giảm {{discount}}% cho {{product_category}}. Chỉ áp dụng đến hết {{end_time}}. Mua ngay: {{link}}',
     '{"discount": "20", "product_category": "vòng tay", "end_time": "23:59", "link": "https://..."}'),
    ('Order Shipped', 'transaction',
     'Đơn hàng #{{order_id}} của bạn đã được gửi! Mã vận đơn: {{tracking_code}}. Theo dõi tại: {{tracking_link}}',
     '{"order_id": "12345", "tracking_code": "VN123456", "tracking_link": "https://..."}'),
    ('Weekly Tips', 'engagement',
     'Mẹo tuần này cho cung {{zodiac}}: {{tip_content}}. Đọc thêm: {{link}}',
     '{"zodiac": "Bạch Dương", "tip_content": "Thời điểm tốt để đầu tư", "link": "https://..."}'),
    ('Re-engagement', 'winback',
     'Xin chào {{name}}! Chúng tôi nhớ bạn. Quay lại và nhận ưu đãi đặc biệt: Giảm {{discount}}% cho đơn hàng tiếp theo. Mã: {{code}}',
     '{"name": "bạn", "discount": "15", "code": "COMEBACK15"}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_broadcast_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Service role full access
DROP POLICY IF EXISTS "Service role access segments" ON chatbot_segments;
CREATE POLICY "Service role access segments"
    ON chatbot_segments FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role access broadcasts" ON chatbot_broadcasts;
CREATE POLICY "Service role access broadcasts"
    ON chatbot_broadcasts FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role access recipients" ON chatbot_broadcast_recipients;
CREATE POLICY "Service role access recipients"
    ON chatbot_broadcast_recipients FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role access templates" ON chatbot_broadcast_templates;
CREATE POLICY "Service role access templates"
    ON chatbot_broadcast_templates FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Admins can manage broadcasts
DROP POLICY IF EXISTS "Admins can manage broadcasts" ON chatbot_broadcasts;
CREATE POLICY "Admins can manage broadcasts"
    ON chatbot_broadcasts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
        )
    );

DROP POLICY IF EXISTS "Admins can view segments" ON chatbot_segments;
CREATE POLICY "Admins can view segments"
    ON chatbot_segments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.is_admin = TRUE OR p.role IN ('admin', 'ADMIN'))
        )
    );

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS set_timestamp_segments ON chatbot_segments;
CREATE TRIGGER set_timestamp_segments
    BEFORE UPDATE ON chatbot_segments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_broadcasts ON chatbot_broadcasts;
CREATE TRIGGER set_timestamp_broadcasts
    BEFORE UPDATE ON chatbot_broadcasts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_templates ON chatbot_broadcast_templates;
CREATE TRIGGER set_timestamp_templates
    BEFORE UPDATE ON chatbot_broadcast_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- FUNCTION: calculate_segment_users
-- Calculate and update user count for a segment
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_segment_users(p_segment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_rules JSONB;
    v_count INTEGER;
BEGIN
    -- Get segment rules
    SELECT rules INTO v_rules
    FROM chatbot_segments
    WHERE id = p_segment_id;

    -- Build dynamic query based on rules
    -- For now, simple implementation
    IF v_rules IS NULL OR v_rules = '{}'::JSONB THEN
        -- All users
        SELECT COUNT(*) INTO v_count
        FROM chatbot_platform_users
        WHERE is_blocked = FALSE;
    ELSIF v_rules ? 'platform' THEN
        SELECT COUNT(*) INTO v_count
        FROM chatbot_platform_users
        WHERE is_blocked = FALSE
          AND platform = ANY(ARRAY(SELECT jsonb_array_elements_text(v_rules->'platform')));
    ELSE
        -- Default: all users
        SELECT COUNT(*) INTO v_count
        FROM chatbot_platform_users
        WHERE is_blocked = FALSE;
    END IF;

    -- Update segment
    UPDATE chatbot_segments SET
        user_count = v_count,
        last_calculated_at = NOW()
    WHERE id = p_segment_id;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: populate_broadcast_recipients
-- Populate recipients for a broadcast based on segment
-- ============================================================

CREATE OR REPLACE FUNCTION populate_broadcast_recipients(p_broadcast_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_segment_id UUID;
    v_platforms TEXT[];
    v_rules JSONB;
    v_count INTEGER := 0;
BEGIN
    -- Get broadcast info
    SELECT segment_id, platforms INTO v_segment_id, v_platforms
    FROM chatbot_broadcasts
    WHERE id = p_broadcast_id;

    -- Get segment rules
    IF v_segment_id IS NOT NULL THEN
        SELECT rules INTO v_rules
        FROM chatbot_segments
        WHERE id = v_segment_id;
    ELSE
        v_rules := '{}'::JSONB;
    END IF;

    -- Insert recipients (simple platform filter for now)
    INSERT INTO chatbot_broadcast_recipients (broadcast_id, platform_user_id)
    SELECT p_broadcast_id, id
    FROM chatbot_platform_users
    WHERE is_blocked = FALSE
      AND (v_platforms IS NULL OR platform = ANY(v_platforms))
      AND (v_rules IS NULL OR v_rules = '{}'::JSONB OR
           (v_rules ? 'platform' AND platform = ANY(ARRAY(SELECT jsonb_array_elements_text(v_rules->'platform')))))
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Update total recipients count
    UPDATE chatbot_broadcasts SET
        total_recipients = v_count,
        updated_at = NOW()
    WHERE id = p_broadcast_id;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_broadcast_stats
-- Get detailed stats for a broadcast
-- ============================================================

CREATE OR REPLACE FUNCTION get_broadcast_stats(p_broadcast_id UUID)
RETURNS TABLE (
    broadcast_name VARCHAR(255),
    status VARCHAR(30),
    total_recipients INTEGER,
    sent_count INTEGER,
    delivered_count INTEGER,
    read_count INTEGER,
    clicked_count INTEGER,
    replied_count INTEGER,
    error_count INTEGER,
    open_rate NUMERIC,
    click_rate NUMERIC,
    reply_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.name,
        b.status,
        b.total_recipients,
        b.sent_count,
        b.delivered_count,
        b.read_count,
        b.clicked_count,
        b.replied_count,
        b.error_count,
        CASE WHEN b.sent_count > 0 THEN ROUND(b.read_count::NUMERIC / b.sent_count * 100, 1) ELSE 0 END,
        CASE WHEN b.read_count > 0 THEN ROUND(b.clicked_count::NUMERIC / b.read_count * 100, 1) ELSE 0 END,
        CASE WHEN b.sent_count > 0 THEN ROUND(b.replied_count::NUMERIC / b.sent_count * 100, 1) ELSE 0 END
    FROM chatbot_broadcasts b
    WHERE b.id = p_broadcast_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_scheduled_broadcasts
-- Get broadcasts that are due to be sent
-- ============================================================

CREATE OR REPLACE FUNCTION get_scheduled_broadcasts(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    broadcast_id UUID,
    name VARCHAR(255),
    message_template TEXT,
    message_type VARCHAR(50),
    attachments JSONB,
    quick_replies JSONB,
    platforms TEXT[],
    is_ab_test BOOLEAN,
    ab_variants JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.name,
        b.message_template,
        b.message_type,
        b.attachments,
        b.quick_replies,
        b.platforms,
        b.is_ab_test,
        b.ab_variants
    FROM chatbot_broadcasts b
    WHERE b.status = 'scheduled'
      AND b.scheduled_at <= NOW()
    ORDER BY b.scheduled_at
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON chatbot_segments TO authenticated;
GRANT ALL ON chatbot_broadcasts TO authenticated;
GRANT ALL ON chatbot_broadcast_recipients TO authenticated;
GRANT ALL ON chatbot_broadcast_templates TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_segment_users TO authenticated;
GRANT EXECUTE ON FUNCTION populate_broadcast_recipients TO authenticated;
GRANT EXECUTE ON FUNCTION get_broadcast_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_scheduled_broadcasts TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE chatbot_segments IS 'User segments for targeted broadcast marketing';
COMMENT ON TABLE chatbot_broadcasts IS 'Broadcast marketing campaigns';
COMMENT ON TABLE chatbot_broadcast_recipients IS 'Recipients for each broadcast campaign';
COMMENT ON TABLE chatbot_broadcast_templates IS 'Reusable message templates for broadcasts';
COMMENT ON FUNCTION calculate_segment_users IS 'Calculate and update user count for a segment';
COMMENT ON FUNCTION populate_broadcast_recipients IS 'Populate recipients for a broadcast based on segment';
COMMENT ON FUNCTION get_broadcast_stats IS 'Get detailed statistics for a broadcast';
COMMENT ON FUNCTION get_scheduled_broadcasts IS 'Get broadcasts that are due to be sent';

-- ============================================================
-- DONE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'PHASE 4 Broadcast Tables Created Successfully!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables: chatbot_segments, chatbot_broadcasts, chatbot_broadcast_recipients, chatbot_broadcast_templates';
    RAISE NOTICE 'Functions: calculate_segment_users, populate_broadcast_recipients, get_broadcast_stats, get_scheduled_broadcasts';
    RAISE NOTICE '============================================================';
END $$;

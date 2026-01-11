-- ============================================================
-- PHASE 4: TỐI ƯU - Cart Recovery Tables
-- File: 20251228_007_cart_recovery.sql
-- Description: Abandoned cart tracking and recovery automation
-- KPI: 25%+ cart recovery rate
-- ============================================================

-- ============================================================
-- TABLE 1: chatbot_abandoned_carts
-- Tracks abandoned shopping carts for recovery campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_abandoned_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User reference
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,

    -- Shopify cart info
    shopify_cart_id VARCHAR(255),
    checkout_url TEXT,

    -- Cart contents
    items JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"product_id": "...", "title": "...", "quantity": 1, "price": 500000, "image_url": "..."}]
    item_count INTEGER DEFAULT 0,
    subtotal DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'VND',

    -- Recovery status
    recovery_status VARCHAR(30) DEFAULT 'abandoned' CHECK (recovery_status IN (
        'abandoned',      -- Cart is abandoned
        'reminder_1',     -- First reminder sent
        'reminder_2',     -- Second reminder sent
        'reminder_3',     -- Final reminder (with discount) sent
        'recovered',      -- User completed purchase
        'expired',        -- Recovery window expired
        'opted_out'       -- User opted out of reminders
    )),

    -- Reminder tracking
    reminder_1_sent_at TIMESTAMPTZ,
    reminder_2_sent_at TIMESTAMPTZ,
    reminder_3_sent_at TIMESTAMPTZ,

    -- Discount for final reminder
    discount_code VARCHAR(50),
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),

    -- Recovery tracking
    recovered_at TIMESTAMPTZ,
    recovered_order_id VARCHAR(255),
    recovered_amount DECIMAL(12,2),

    -- Timestamps
    abandoned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cart recovery
CREATE INDEX IF NOT EXISTS idx_carts_user ON chatbot_abandoned_carts(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON chatbot_abandoned_carts(recovery_status);
CREATE INDEX IF NOT EXISTS idx_carts_abandoned ON chatbot_abandoned_carts(abandoned_at DESC);
CREATE INDEX IF NOT EXISTS idx_carts_shopify ON chatbot_abandoned_carts(shopify_cart_id);

-- ============================================================
-- TABLE 2: chatbot_cart_recovery_schedule
-- Schedule for sending cart recovery reminders
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_cart_recovery_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reference
    cart_id UUID NOT NULL REFERENCES chatbot_abandoned_carts(id) ON DELETE CASCADE,

    -- Schedule info
    reminder_number INTEGER NOT NULL CHECK (reminder_number BETWEEN 1 AND 3),
    scheduled_at TIMESTAMPTZ NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending',    -- Waiting to be sent
        'sent',       -- Successfully sent
        'failed',     -- Send failed
        'cancelled',  -- Cancelled (cart recovered or opted out)
        'skipped'     -- Skipped (previous reminder not sent)
    )),

    -- Execution tracking
    sent_at TIMESTAMPTZ,
    attempt_count INTEGER DEFAULT 0,
    error_message TEXT,

    -- Metadata
    message_id VARCHAR(255),  -- Platform message ID for tracking

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for schedule
CREATE INDEX IF NOT EXISTS idx_schedule_status ON chatbot_cart_recovery_schedule(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_schedule_cart ON chatbot_cart_recovery_schedule(cart_id);

-- ============================================================
-- TABLE 3: chatbot_cart_recovery_config
-- Configuration for cart recovery campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_cart_recovery_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Config key
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL DEFAULT '{}',

    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO chatbot_cart_recovery_config (config_key, config_value, description) VALUES
    ('reminder_schedule', '{"reminder_1": 30, "reminder_2": 120, "reminder_3": 1440}', 'Delay in minutes for each reminder'),
    ('discount_config', '{"enabled": true, "percent": 10, "min_cart_value": 500000}', 'Discount settings for final reminder'),
    ('recovery_window', '{"hours": 72}', 'Maximum time window for recovery attempts'),
    ('enabled', '{"value": true}', 'Master switch for cart recovery')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE chatbot_abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_cart_recovery_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_cart_recovery_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Service role full access
DROP POLICY IF EXISTS "Service role access carts" ON chatbot_abandoned_carts;
CREATE POLICY "Service role access carts"
    ON chatbot_abandoned_carts FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role access schedule" ON chatbot_cart_recovery_schedule;
CREATE POLICY "Service role access schedule"
    ON chatbot_cart_recovery_schedule FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role access config" ON chatbot_cart_recovery_config;
CREATE POLICY "Service role access config"
    ON chatbot_cart_recovery_config FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Admins can view carts
DROP POLICY IF EXISTS "Admins can view carts" ON chatbot_abandoned_carts;
CREATE POLICY "Admins can view carts"
    ON chatbot_abandoned_carts FOR SELECT
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

-- Update timestamp trigger
DROP TRIGGER IF EXISTS set_timestamp_carts ON chatbot_abandoned_carts;
CREATE TRIGGER set_timestamp_carts
    BEFORE UPDATE ON chatbot_abandoned_carts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_config ON chatbot_cart_recovery_config;
CREATE TRIGGER set_timestamp_config
    BEFORE UPDATE ON chatbot_cart_recovery_config
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- FUNCTION: track_abandoned_cart
-- Create abandoned cart record and schedule reminders
-- ============================================================

CREATE OR REPLACE FUNCTION track_abandoned_cart(
    p_platform_user_id UUID,
    p_shopify_cart_id VARCHAR(255),
    p_checkout_url TEXT,
    p_items JSONB,
    p_subtotal DECIMAL(12,2),
    p_currency VARCHAR(10) DEFAULT 'VND'
)
RETURNS UUID AS $$
DECLARE
    v_cart_id UUID;
    v_config JSONB;
    v_delay_1 INTEGER;
    v_delay_2 INTEGER;
    v_delay_3 INTEGER;
BEGIN
    -- Get reminder schedule config
    SELECT config_value INTO v_config
    FROM chatbot_cart_recovery_config
    WHERE config_key = 'reminder_schedule' AND is_active = TRUE;

    v_delay_1 := COALESCE((v_config->>'reminder_1')::INTEGER, 30);
    v_delay_2 := COALESCE((v_config->>'reminder_2')::INTEGER, 120);
    v_delay_3 := COALESCE((v_config->>'reminder_3')::INTEGER, 1440);

    -- Check for existing active cart
    SELECT id INTO v_cart_id
    FROM chatbot_abandoned_carts
    WHERE platform_user_id = p_platform_user_id
      AND shopify_cart_id = p_shopify_cart_id
      AND recovery_status NOT IN ('recovered', 'expired', 'opted_out');

    IF v_cart_id IS NOT NULL THEN
        -- Update existing cart
        UPDATE chatbot_abandoned_carts SET
            items = p_items,
            item_count = jsonb_array_length(p_items),
            subtotal = p_subtotal,
            updated_at = NOW()
        WHERE id = v_cart_id;

        RETURN v_cart_id;
    END IF;

    -- Create new cart record
    INSERT INTO chatbot_abandoned_carts (
        platform_user_id,
        shopify_cart_id,
        checkout_url,
        items,
        item_count,
        subtotal,
        currency
    ) VALUES (
        p_platform_user_id,
        p_shopify_cart_id,
        p_checkout_url,
        p_items,
        jsonb_array_length(p_items),
        p_subtotal,
        p_currency
    )
    RETURNING id INTO v_cart_id;

    -- Schedule reminders
    INSERT INTO chatbot_cart_recovery_schedule (cart_id, reminder_number, scheduled_at)
    VALUES
        (v_cart_id, 1, NOW() + (v_delay_1 || ' minutes')::INTERVAL),
        (v_cart_id, 2, NOW() + (v_delay_2 || ' minutes')::INTERVAL),
        (v_cart_id, 3, NOW() + (v_delay_3 || ' minutes')::INTERVAL);

    RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: mark_cart_recovered
-- Mark cart as recovered and cancel pending reminders
-- ============================================================

CREATE OR REPLACE FUNCTION mark_cart_recovered(
    p_cart_id UUID,
    p_order_id VARCHAR(255),
    p_amount DECIMAL(12,2) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update cart status
    UPDATE chatbot_abandoned_carts SET
        recovery_status = 'recovered',
        recovered_at = NOW(),
        recovered_order_id = p_order_id,
        recovered_amount = COALESCE(p_amount, subtotal),
        updated_at = NOW()
    WHERE id = p_cart_id;

    -- Cancel pending reminders
    UPDATE chatbot_cart_recovery_schedule SET
        status = 'cancelled'
    WHERE cart_id = p_cart_id
      AND status = 'pending';

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_pending_reminders
-- Get reminders that are due to be sent
-- ============================================================

CREATE OR REPLACE FUNCTION get_pending_reminders(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    schedule_id UUID,
    cart_id UUID,
    reminder_number INTEGER,
    platform_user_id UUID,
    platform VARCHAR(50),
    platform_user_external_id VARCHAR(255),
    display_name VARCHAR(255),
    shopify_cart_id VARCHAR(255),
    checkout_url TEXT,
    items JSONB,
    item_count INTEGER,
    subtotal DECIMAL(12,2),
    currency VARCHAR(10),
    discount_code VARCHAR(50),
    discount_percent INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS schedule_id,
        s.cart_id,
        s.reminder_number,
        c.platform_user_id,
        u.platform,
        u.platform_user_id AS platform_user_external_id,
        u.display_name,
        c.shopify_cart_id,
        c.checkout_url,
        c.items,
        c.item_count,
        c.subtotal,
        c.currency,
        c.discount_code,
        c.discount_percent
    FROM chatbot_cart_recovery_schedule s
    JOIN chatbot_abandoned_carts c ON s.cart_id = c.id
    JOIN chatbot_platform_users u ON c.platform_user_id = u.id
    WHERE s.status = 'pending'
      AND s.scheduled_at <= NOW()
      AND c.recovery_status NOT IN ('recovered', 'expired', 'opted_out')
    ORDER BY s.scheduled_at
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: get_cart_recovery_stats
-- Get cart recovery statistics
-- ============================================================

CREATE OR REPLACE FUNCTION get_cart_recovery_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_abandoned BIGINT,
    total_recovered BIGINT,
    recovery_rate NUMERIC,
    total_abandoned_value NUMERIC,
    total_recovered_value NUMERIC,
    avg_cart_value NUMERIC,
    reminder_1_sent BIGINT,
    reminder_2_sent BIGINT,
    reminder_3_sent BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) FILTER (WHERE recovery_status != 'expired') AS abandoned,
            COUNT(*) FILTER (WHERE recovery_status = 'recovered') AS recovered,
            SUM(subtotal) FILTER (WHERE recovery_status != 'expired') AS abandoned_value,
            SUM(recovered_amount) FILTER (WHERE recovery_status = 'recovered') AS recovered_value,
            AVG(subtotal) AS avg_value,
            COUNT(*) FILTER (WHERE reminder_1_sent_at IS NOT NULL) AS r1,
            COUNT(*) FILTER (WHERE reminder_2_sent_at IS NOT NULL) AS r2,
            COUNT(*) FILTER (WHERE reminder_3_sent_at IS NOT NULL) AS r3
        FROM chatbot_abandoned_carts
        WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
    )
    SELECT
        abandoned,
        recovered,
        CASE WHEN abandoned > 0 THEN ROUND(recovered::NUMERIC / abandoned * 100, 1) ELSE 0 END,
        COALESCE(abandoned_value, 0),
        COALESCE(recovered_value, 0),
        COALESCE(avg_value, 0),
        r1, r2, r3
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON chatbot_abandoned_carts TO authenticated;
GRANT ALL ON chatbot_cart_recovery_schedule TO authenticated;
GRANT ALL ON chatbot_cart_recovery_config TO authenticated;
GRANT EXECUTE ON FUNCTION track_abandoned_cart TO authenticated;
GRANT EXECUTE ON FUNCTION mark_cart_recovered TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_reminders TO authenticated;
GRANT EXECUTE ON FUNCTION get_cart_recovery_stats TO authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE chatbot_abandoned_carts IS 'Tracks abandoned shopping carts for recovery campaigns';
COMMENT ON TABLE chatbot_cart_recovery_schedule IS 'Schedule for sending cart recovery reminder messages';
COMMENT ON TABLE chatbot_cart_recovery_config IS 'Configuration for cart recovery system';
COMMENT ON FUNCTION track_abandoned_cart IS 'Create abandoned cart record and schedule reminders';
COMMENT ON FUNCTION mark_cart_recovered IS 'Mark cart as recovered and cancel pending reminders';
COMMENT ON FUNCTION get_pending_reminders IS 'Get reminders that are due to be sent';
COMMENT ON FUNCTION get_cart_recovery_stats IS 'Get cart recovery statistics for analytics';

-- ============================================================
-- DONE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'PHASE 4 Cart Recovery Tables Created Successfully!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables: chatbot_abandoned_carts, chatbot_cart_recovery_schedule, chatbot_cart_recovery_config';
    RAISE NOTICE 'Functions: track_abandoned_cart, mark_cart_recovered, get_pending_reminders, get_cart_recovery_stats';
    RAISE NOTICE '============================================================';
END $$;

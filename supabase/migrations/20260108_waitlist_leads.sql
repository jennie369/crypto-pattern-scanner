-- ============================================================================
-- GEMRAL WAITLIST LEADS SYSTEM
-- Lead Management với Scoring & Shopify/Zalo Integration
-- Created: January 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. WAITLIST LEADS TABLE
-- Main table for landing page form submissions with lead scoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contact Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    phone_normalized VARCHAR(20) NOT NULL, -- +84xxxxxxxxx format

    -- Product Interest (array for multiple selections)
    interested_products TEXT[] DEFAULT '{}',
    -- Values: 'trading', 'spiritual', 'courses', 'affiliate'
    primary_interest VARCHAR(50), -- Auto-set to first selected interest

    -- Lead Scoring (0-100)
    lead_score INTEGER DEFAULT 10 CHECK (lead_score >= 0 AND lead_score <= 100),
    lead_grade VARCHAR(1) DEFAULT 'D', -- A/B/C/D/F (computed from score)
    lead_status VARCHAR(20) DEFAULT 'new' CHECK (lead_status IN (
        'new',          -- Vừa đăng ký
        'engaged',      -- Đã tương tác (click link, open email)
        'qualified',    -- Phù hợp tiêu chí (có tiềm năng)
        'hot',          -- Rất tiềm năng (score >= 80)
        'converted',    -- Đã chuyển đổi thành user/customer
        'inactive',     -- Không tương tác lâu ngày
        'unsubscribed'  -- Đã hủy đăng ký
    )),

    -- Source Tracking (UTM)
    source VARCHAR(50) DEFAULT 'landing_page',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    referrer_url TEXT,

    -- Device Information
    ip_address VARCHAR(45), -- IPv6 support
    user_agent TEXT,
    device_type VARCHAR(20), -- mobile, desktop, tablet

    -- Marketing Consent (GDPR/PDPA compliance)
    marketing_consent BOOLEAN DEFAULT true,
    consent_timestamp TIMESTAMPTZ,

    -- Shopify Customer Sync
    shopify_customer_id VARCHAR(50),
    shopify_sync_status VARCHAR(20) DEFAULT 'pending' CHECK (shopify_sync_status IN (
        'pending',  -- Chưa sync
        'synced',   -- Đã sync thành công
        'failed',   -- Sync thất bại
        'skipped'   -- Bỏ qua (no email/phone)
    )),
    shopify_synced_at TIMESTAMPTZ,
    shopify_tags TEXT[], -- Tags đã thêm vào Shopify Customer

    -- Zalo Integration (link to existing waitlist_entries)
    waitlist_entry_id UUID REFERENCES public.waitlist_entries(id),
    zalo_synced BOOLEAN DEFAULT false,
    zalo_synced_at TIMESTAMPTZ,

    -- Queue Number (for display)
    queue_number SERIAL NOT NULL,

    -- Referral System
    referral_code VARCHAR(20) UNIQUE,
    referred_by_code VARCHAR(20),
    referred_by_lead_id UUID REFERENCES public.waitlist_leads(id),
    referral_count INTEGER DEFAULT 0,

    -- Metadata
    notes TEXT, -- Admin notes
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9+\-\s]{9,15}$'),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.waitlist_leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_phone_normalized ON public.waitlist_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.waitlist_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_grade ON public.waitlist_leads(lead_grade);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.waitlist_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_shopify_id ON public.waitlist_leads(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_referral_code ON public.waitlist_leads(referral_code);
CREATE INDEX IF NOT EXISTS idx_leads_referred_by ON public.waitlist_leads(referred_by_code);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.waitlist_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_queue_number ON public.waitlist_leads(queue_number);

-- GIN index for array search (interested_products)
CREATE INDEX IF NOT EXISTS idx_leads_interests ON public.waitlist_leads USING GIN (interested_products);

-- ============================================================================
-- 2. WAITLIST LEAD ACTIVITIES TABLE
-- Track all lead activities for scoring and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.waitlist_leads(id) ON DELETE CASCADE,

    -- Activity Info
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'signup',           -- Đăng ký form
        'email_sent',       -- Gửi email
        'email_opened',     -- Mở email
        'email_clicked',    -- Click link trong email
        'zalo_follow',      -- Follow Zalo OA
        'zalo_message',     -- Nhận tin nhắn Zalo
        'page_visit',       -- Truy cập page
        'status_change',    -- Thay đổi status
        'score_update',     -- Cập nhật score
        'admin_note',       -- Admin thêm note
        'shopify_sync',     -- Sync với Shopify
        'converted'         -- Chuyển đổi thành user
    )),
    activity_detail TEXT,

    -- Score Impact
    score_change INTEGER DEFAULT 0, -- Positive or negative

    -- Source
    source VARCHAR(100),
    ip_address VARCHAR(45),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Admin user ID if applicable
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.waitlist_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.waitlist_lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.waitlist_lead_activities(created_at DESC);

-- ============================================================================
-- 3. WAITLIST LEAD SETTINGS TABLE
-- Configuration for lead scoring rules
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_lead_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. WAITLIST DAILY LEAD STATS TABLE
-- Aggregated daily statistics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_lead_daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE NOT NULL UNIQUE,

    -- Counts
    total_leads INTEGER DEFAULT 0,
    new_leads_today INTEGER DEFAULT 0,
    hot_leads INTEGER DEFAULT 0, -- score >= 80
    qualified_leads INTEGER DEFAULT 0, -- score >= 60
    converted_today INTEGER DEFAULT 0,
    unsubscribed_today INTEGER DEFAULT 0,

    -- By Interest (JSONB)
    leads_by_interest JSONB DEFAULT '{}', -- {"trading": 50, "spiritual": 30, ...}

    -- By Source (JSONB)
    leads_by_source JSONB DEFAULT '{}', -- {"landing_page": 80, "referral": 20, ...}

    -- Conversion Metrics
    shopify_synced INTEGER DEFAULT 0,
    zalo_synced INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_lead_daily_stats_date ON public.waitlist_lead_daily_stats(stat_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_lead_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_lead_daily_stats ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for Edge Functions)
CREATE POLICY "service_role_full_access_leads"
    ON public.waitlist_leads FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_full_access_activities"
    ON public.waitlist_lead_activities FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_full_access_settings"
    ON public.waitlist_lead_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_full_access_daily_stats"
    ON public.waitlist_lead_daily_stats FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Admin can view and manage all leads
CREATE POLICY "admin_view_all_leads"
    ON public.waitlist_leads FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

CREATE POLICY "admin_update_leads"
    ON public.waitlist_leads FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

CREATE POLICY "admin_view_activities"
    ON public.waitlist_lead_activities FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

CREATE POLICY "admin_insert_activities"
    ON public.waitlist_lead_activities FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

CREATE POLICY "admin_view_settings"
    ON public.waitlist_lead_settings FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

CREATE POLICY "admin_view_daily_stats"
    ON public.waitlist_lead_daily_stats FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- Public can insert leads (for form submission via anon key - but use Edge Function instead)
CREATE POLICY "public_insert_leads"
    ON public.waitlist_leads FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Normalize Vietnamese phone number to +84 format
CREATE OR REPLACE FUNCTION normalize_vietnamese_phone_lead(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    -- Remove all non-digit characters except +
    cleaned := regexp_replace(phone_input, '[^0-9+]', '', 'g');

    -- Handle various Vietnamese formats
    IF cleaned LIKE '0%' THEN
        -- 0xxx -> +84xxx
        cleaned := '+84' || substring(cleaned from 2);
    ELSIF cleaned LIKE '84%' AND cleaned NOT LIKE '+84%' THEN
        -- 84xxx -> +84xxx
        cleaned := '+' || cleaned;
    ELSIF cleaned NOT LIKE '+%' THEN
        -- Assume Vietnamese number without prefix
        cleaned := '+84' || cleaned;
    END IF;

    RETURN cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Generate unique referral code (GEM + 5 chars)
CREATE OR REPLACE FUNCTION generate_lead_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No I, O, 0, 1 to avoid confusion
    result TEXT := 'GEM';
    i INTEGER;
    exists_count INTEGER;
BEGIN
    LOOP
        result := 'GEM';
        FOR i IN 1..5 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        -- Check uniqueness
        SELECT COUNT(*) INTO exists_count
        FROM public.waitlist_leads
        WHERE referral_code = result;

        EXIT WHEN exists_count = 0;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate lead grade from score
CREATE OR REPLACE FUNCTION calculate_lead_grade(score INTEGER)
RETURNS VARCHAR(1) AS $$
BEGIN
    IF score >= 80 THEN
        RETURN 'A'; -- Hot
    ELSIF score >= 60 THEN
        RETURN 'B'; -- Qualified
    ELSIF score >= 40 THEN
        RETURN 'C'; -- Engaged
    ELSIF score >= 20 THEN
        RETURN 'D'; -- New
    ELSE
        RETURN 'F'; -- Cold
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate initial lead score based on interests
CREATE OR REPLACE FUNCTION calculate_initial_lead_score(
    p_interested_products TEXT[],
    p_email VARCHAR,
    p_marketing_consent BOOLEAN,
    p_referred_by_code VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 10; -- Base score
BEGIN
    -- Email provided: +10
    IF p_email IS NOT NULL AND p_email != '' THEN
        score := score + 10;
    END IF;

    -- Marketing consent: +5
    IF p_marketing_consent THEN
        score := score + 5;
    END IF;

    -- Referred by someone: +15
    IF p_referred_by_code IS NOT NULL AND p_referred_by_code != '' THEN
        score := score + 15;
    END IF;

    -- Each interest: +5 (max 20)
    IF p_interested_products IS NOT NULL THEN
        score := score + LEAST(array_length(p_interested_products, 1) * 5, 20);
    END IF;

    -- Multiple interests (2+): bonus +10
    IF p_interested_products IS NOT NULL AND array_length(p_interested_products, 1) >= 2 THEN
        score := score + 10;
    END IF;

    -- Cap at 100
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function: Before insert - normalize phone, generate referral code, calculate score
CREATE OR REPLACE FUNCTION waitlist_lead_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize phone
    NEW.phone_normalized := normalize_vietnamese_phone_lead(NEW.phone);

    -- Generate referral code if not provided
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_lead_referral_code();
    END IF;

    -- Set primary interest (first in array)
    IF NEW.interested_products IS NOT NULL AND array_length(NEW.interested_products, 1) > 0 THEN
        NEW.primary_interest := NEW.interested_products[1];
    END IF;

    -- Calculate initial score
    NEW.lead_score := calculate_initial_lead_score(
        NEW.interested_products,
        NEW.email,
        NEW.marketing_consent,
        NEW.referred_by_code
    );

    -- Calculate grade
    NEW.lead_grade := calculate_lead_grade(NEW.lead_score);

    -- Set consent timestamp
    IF NEW.marketing_consent THEN
        NEW.consent_timestamp := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_before_insert ON public.waitlist_leads;
CREATE TRIGGER trigger_lead_before_insert
    BEFORE INSERT ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION waitlist_lead_before_insert();

-- Trigger function: Update referral count when someone uses a referral code
CREATE OR REPLACE FUNCTION update_lead_referrer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referred_by_code IS NOT NULL AND NEW.referred_by_code != '' THEN
        -- Update referrer's count
        UPDATE public.waitlist_leads
        SET
            referral_count = referral_count + 1,
            -- Bonus score for getting referrals
            lead_score = LEAST(lead_score + 5, 100),
            lead_grade = calculate_lead_grade(LEAST(lead_score + 5, 100)),
            updated_at = NOW()
        WHERE referral_code = NEW.referred_by_code;

        -- Set the referred_by_lead_id
        NEW.referred_by_lead_id := (
            SELECT id FROM public.waitlist_leads
            WHERE referral_code = NEW.referred_by_code
            LIMIT 1
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead_referrer_count ON public.waitlist_leads;
CREATE TRIGGER trigger_update_lead_referrer_count
    BEFORE INSERT ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_referrer_count();

-- Trigger function: Auto-update timestamps
CREATE OR REPLACE FUNCTION waitlist_lead_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    -- Recalculate grade if score changed
    IF NEW.lead_score != OLD.lead_score THEN
        NEW.lead_grade := calculate_lead_grade(NEW.lead_score);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_update_timestamp ON public.waitlist_leads;
CREATE TRIGGER trigger_lead_update_timestamp
    BEFORE UPDATE ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION waitlist_lead_update_timestamp();

-- Trigger function: Log activity on insert
CREATE OR REPLACE FUNCTION log_lead_signup_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.waitlist_lead_activities (
        lead_id,
        activity_type,
        activity_detail,
        score_change,
        source,
        ip_address,
        metadata
    ) VALUES (
        NEW.id,
        'signup',
        'Lead đăng ký từ ' || COALESCE(NEW.source, 'landing_page'),
        NEW.lead_score,
        NEW.source,
        NEW.ip_address,
        jsonb_build_object(
            'interests', NEW.interested_products,
            'referral_code', NEW.referred_by_code
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_lead_signup ON public.waitlist_leads;
CREATE TRIGGER trigger_log_lead_signup
    AFTER INSERT ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_signup_activity();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function: Get lead stats for admin dashboard
CREATE OR REPLACE FUNCTION get_lead_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    today_count INTEGER;
    hot_count INTEGER;
    qualified_count INTEGER;
    converted_count INTEGER;
    connection_rate DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM public.waitlist_leads
    WHERE lead_status != 'unsubscribed';

    SELECT COUNT(*) INTO today_count
    FROM public.waitlist_leads
    WHERE created_at >= CURRENT_DATE
    AND lead_status != 'unsubscribed';

    SELECT COUNT(*) INTO hot_count
    FROM public.waitlist_leads
    WHERE lead_score >= 80
    AND lead_status NOT IN ('converted', 'unsubscribed');

    SELECT COUNT(*) INTO qualified_count
    FROM public.waitlist_leads
    WHERE lead_score >= 60
    AND lead_status NOT IN ('converted', 'unsubscribed');

    SELECT COUNT(*) INTO converted_count
    FROM public.waitlist_leads
    WHERE lead_status = 'converted';

    -- Calculate conversion rate
    IF total_count > 0 THEN
        connection_rate := (converted_count::DECIMAL / total_count::DECIMAL) * 100;
    ELSE
        connection_rate := 0;
    END IF;

    SELECT json_build_object(
        'total_leads', total_count,
        'today_leads', today_count,
        'hot_leads', hot_count,
        'qualified_leads', qualified_count,
        'converted_leads', converted_count,
        'conversion_rate', ROUND(connection_rate, 2)
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get public stats for landing page
CREATE OR REPLACE FUNCTION get_waitlist_lead_public_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    recent_count INTEGER;
    max_slots INTEGER := 500;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM public.waitlist_leads
    WHERE lead_status NOT IN ('unsubscribed', 'inactive');

    SELECT COUNT(*) INTO recent_count
    FROM public.waitlist_leads
    WHERE created_at > NOW() - INTERVAL '24 hours'
    AND lead_status NOT IN ('unsubscribed', 'inactive');

    SELECT json_build_object(
        'total_entries', total_count,
        'recent_joins', recent_count,
        'max_slots', max_slots,
        'remaining_slots', GREATEST(0, max_slots - total_count),
        'is_open', total_count < max_slots
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update lead score with activity logging
CREATE OR REPLACE FUNCTION update_lead_score(
    p_lead_id UUID,
    p_score_change INTEGER,
    p_activity_type VARCHAR,
    p_activity_detail TEXT DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    new_score INTEGER;
BEGIN
    -- Update lead score
    UPDATE public.waitlist_leads
    SET lead_score = LEAST(GREATEST(lead_score + p_score_change, 0), 100)
    WHERE id = p_lead_id
    RETURNING lead_score INTO new_score;

    -- Log activity
    INSERT INTO public.waitlist_lead_activities (
        lead_id,
        activity_type,
        activity_detail,
        score_change,
        created_by
    ) VALUES (
        p_lead_id,
        p_activity_type,
        p_activity_detail,
        p_score_change,
        p_admin_id
    );

    RETURN new_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update daily stats (called by cron or manually)
CREATE OR REPLACE FUNCTION update_lead_daily_stats()
RETURNS VOID AS $$
DECLARE
    today DATE := CURRENT_DATE;
    stats_record RECORD;
    interest_stats JSONB;
    source_stats JSONB;
BEGIN
    -- Calculate counts
    SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE DATE(created_at) = today) as new_today,
        COUNT(*) FILTER (WHERE lead_score >= 80 AND lead_status NOT IN ('converted', 'unsubscribed')) as hot,
        COUNT(*) FILTER (WHERE lead_score >= 60 AND lead_status NOT IN ('converted', 'unsubscribed')) as qualified,
        COUNT(*) FILTER (WHERE lead_status = 'converted' AND DATE(updated_at) = today) as converted_today,
        COUNT(*) FILTER (WHERE lead_status = 'unsubscribed' AND DATE(updated_at) = today) as unsub_today,
        COUNT(*) FILTER (WHERE shopify_sync_status = 'synced') as shopify,
        COUNT(*) FILTER (WHERE zalo_synced = true) as zalo
    INTO stats_record
    FROM public.waitlist_leads
    WHERE lead_status != 'unsubscribed';

    -- Calculate interest breakdown
    SELECT jsonb_object_agg(interest, cnt)
    INTO interest_stats
    FROM (
        SELECT unnest(interested_products) as interest, COUNT(*) as cnt
        FROM public.waitlist_leads
        WHERE lead_status != 'unsubscribed'
        GROUP BY interest
    ) sub;

    -- Calculate source breakdown
    SELECT jsonb_object_agg(source, cnt)
    INTO source_stats
    FROM (
        SELECT COALESCE(source, 'unknown') as source, COUNT(*) as cnt
        FROM public.waitlist_leads
        WHERE lead_status != 'unsubscribed'
        GROUP BY source
    ) sub;

    -- Upsert daily stats
    INSERT INTO public.waitlist_lead_daily_stats (
        stat_date,
        total_leads,
        new_leads_today,
        hot_leads,
        qualified_leads,
        converted_today,
        unsubscribed_today,
        leads_by_interest,
        leads_by_source,
        shopify_synced,
        zalo_synced,
        conversion_rate
    )
    VALUES (
        today,
        stats_record.total,
        stats_record.new_today,
        stats_record.hot,
        stats_record.qualified,
        stats_record.converted_today,
        stats_record.unsub_today,
        COALESCE(interest_stats, '{}'),
        COALESCE(source_stats, '{}'),
        stats_record.shopify,
        stats_record.zalo,
        CASE WHEN stats_record.total > 0
            THEN ROUND((stats_record.converted_today::DECIMAL / stats_record.total::DECIMAL) * 100, 2)
            ELSE 0
        END
    )
    ON CONFLICT (stat_date) DO UPDATE SET
        total_leads = EXCLUDED.total_leads,
        new_leads_today = EXCLUDED.new_leads_today,
        hot_leads = EXCLUDED.hot_leads,
        qualified_leads = EXCLUDED.qualified_leads,
        converted_today = EXCLUDED.converted_today,
        unsubscribed_today = EXCLUDED.unsubscribed_today,
        leads_by_interest = EXCLUDED.leads_by_interest,
        leads_by_source = EXCLUDED.leads_by_source,
        shopify_synced = EXCLUDED.shopify_synced,
        zalo_synced = EXCLUDED.zalo_synced,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: Default Settings
-- ============================================================================

INSERT INTO public.waitlist_lead_settings (setting_key, setting_value, description) VALUES

-- Scoring rules
('scoring_rules', '{
    "email_provided": 10,
    "marketing_consent": 5,
    "referred_by": 15,
    "per_interest": 5,
    "multiple_interests_bonus": 10,
    "email_opened": 5,
    "email_clicked": 10,
    "zalo_follow": 15,
    "referral_success": 5
}'::jsonb, 'Quy tắc tính điểm lead'),

-- Grade thresholds
('grade_thresholds', '{
    "A": 80,
    "B": 60,
    "C": 40,
    "D": 20,
    "F": 0
}'::jsonb, 'Ngưỡng điểm cho mỗi grade'),

-- Valid interests
('valid_interests', '["trading", "spiritual", "courses", "affiliate"]'::jsonb, 'Danh sách interests hợp lệ'),

-- Rate limits
('rate_limits', '{
    "per_ip_per_hour": 5,
    "per_phone_per_day": 3,
    "global_per_minute": 100
}'::jsonb, 'Giới hạn tần suất submit form'),

-- Shopify sync config
('shopify_sync', '{
    "enabled": true,
    "create_customer": true,
    "add_tags": true,
    "add_metafields": true,
    "default_tags": ["waitlist", "gemral"]
}'::jsonb, 'Cấu hình sync với Shopify')

ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant sequence access
GRANT USAGE, SELECT ON SEQUENCE waitlist_leads_queue_number_seq TO anon, authenticated;

-- Grant table access
GRANT SELECT ON public.waitlist_leads TO anon;
GRANT INSERT ON public.waitlist_leads TO anon;
GRANT ALL ON public.waitlist_leads TO authenticated;
GRANT ALL ON public.waitlist_lead_activities TO authenticated;
GRANT SELECT ON public.waitlist_lead_settings TO authenticated;
GRANT SELECT ON public.waitlist_lead_daily_stats TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Waitlist Leads System created successfully!';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Tables: waitlist_leads, waitlist_lead_activities, waitlist_lead_settings, waitlist_lead_daily_stats';
    RAISE NOTICE 'RLS policies enabled';
    RAISE NOTICE 'Functions: normalize_vietnamese_phone_lead, calculate_lead_grade, calculate_initial_lead_score';
    RAISE NOTICE 'Functions: get_lead_stats, get_waitlist_lead_public_stats, update_lead_score, update_lead_daily_stats';
    RAISE NOTICE 'Triggers: auto phone normalization, referral code generation, score calculation';
    RAISE NOTICE 'Seed data: scoring_rules, grade_thresholds, valid_interests, rate_limits, shopify_sync';
    RAISE NOTICE '========================================';
END $$;

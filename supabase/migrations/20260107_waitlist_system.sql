-- ============================================================================
-- GEMRAL WAITLIST SYSTEM
-- Pre-launch Waitlist Management with Nurturing Automation
-- Created: January 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. WAITLIST ENTRIES TABLE
-- Main table storing all waitlist registrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Queue Management (auto-increment)
    queue_number SERIAL UNIQUE NOT NULL,

    -- Contact Information
    full_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    phone_normalized VARCHAR(20) NOT NULL, -- +84xxxxxxxxx format
    email VARCHAR(255),

    -- Zalo Integration
    zalo_user_id VARCHAR(100),
    zalo_display_name VARCHAR(255),
    zalo_avatar_url TEXT,
    zalo_connected BOOLEAN DEFAULT FALSE,
    zalo_connected_at TIMESTAMPTZ,

    -- Referral System
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by_code VARCHAR(20),
    referred_by_id UUID REFERENCES public.waitlist_entries(id),
    referral_count INTEGER DEFAULT 0,

    -- Status Management
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',        -- Registered but not verified/connected
        'verified',       -- Phone verified (via Zalo follow)
        'nurturing',      -- In nurturing sequence
        'completed',      -- Completed nurturing
        'converted',      -- Downloaded/registered app
        'unsubscribed',   -- Opted out
        'invalid'         -- Invalid phone/data
    )),

    -- Interest Tracking
    interest_type VARCHAR(50), -- 'trading', 'spiritual', 'both'

    -- Nurturing Progress
    nurturing_stage INTEGER DEFAULT 0, -- 0=none, 1=day0, 2=day3, 3=day7, 4=day10, 5=day14
    last_nurturing_at TIMESTAMPTZ,
    next_nurturing_at TIMESTAMPTZ,
    nurturing_paused BOOLEAN DEFAULT FALSE,

    -- Launch Notification
    app_notified_at TIMESTAMPTZ,
    app_downloaded_at TIMESTAMPTZ,
    first_login_at TIMESTAMPTZ,
    premium_activated_at TIMESTAMPTZ,

    -- Source Tracking (UTM)
    source VARCHAR(100) DEFAULT 'landing_page',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),

    -- Device & Location
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20), -- mobile, desktop, tablet

    -- Engagement Metrics
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_read INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_phone ON public.waitlist_entries(phone);
CREATE INDEX IF NOT EXISTS idx_waitlist_phone_normalized ON public.waitlist_entries(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_waitlist_zalo_user_id ON public.waitlist_entries(zalo_user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_nurturing_stage ON public.waitlist_entries(nurturing_stage);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON public.waitlist_entries(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by_code ON public.waitlist_entries(referred_by_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_queue_number ON public.waitlist_entries(queue_number);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_next_nurturing ON public.waitlist_entries(next_nurturing_at)
    WHERE status IN ('verified', 'nurturing')
    AND nurturing_paused = FALSE
    AND next_nurturing_at IS NOT NULL;

-- ============================================================================
-- 2. NURTURING MESSAGES TABLE
-- Templates for automated nurturing sequence
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nurturing_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Message Identity
    stage INTEGER NOT NULL, -- 1=Day0, 2=Day3, 3=Day7, 4=Day10, 5=Day14
    stage_name VARCHAR(100) NOT NULL, -- 'welcome', 'value_prop', 'social_proof', 'urgency', 'final'

    -- Timing
    days_after_signup INTEGER NOT NULL DEFAULT 0,
    send_hour INTEGER DEFAULT 9 CHECK (send_hour >= 0 AND send_hour <= 23), -- Preferred hour (VN time)

    -- Message Content (supports template variables)
    -- Variables: {{name}}, {{queue_number}}, {{referral_code}}, {{referral_count}}, {{total_waitlist}}, {{days_until_launch}}
    message_template TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, carousel

    -- Rich Content
    image_url TEXT,
    button_text VARCHAR(100),
    button_url TEXT,

    -- Quick Actions (JSONB array)
    quick_actions JSONB DEFAULT '[]', -- [{title, payload}]

    -- Targeting
    target_interest VARCHAR(50), -- null = all, 'trading', 'spiritual'

    -- A/B Testing
    variant VARCHAR(10) DEFAULT 'A', -- A, B, C for testing
    is_active BOOLEAN DEFAULT TRUE,

    -- Performance Metrics
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,

    UNIQUE(stage, variant, target_interest)
);

-- Index for template lookup
CREATE INDEX IF NOT EXISTS idx_nurturing_stage ON public.nurturing_messages(stage);
CREATE INDEX IF NOT EXISTS idx_nurturing_active ON public.nurturing_messages(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 3. WAITLIST MESSAGE LOGS TABLE
-- Track all messages sent to waitlist entries
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- References
    entry_id UUID NOT NULL REFERENCES public.waitlist_entries(id) ON DELETE CASCADE,
    nurturing_message_id UUID REFERENCES public.nurturing_messages(id),

    -- Message Details
    message_type VARCHAR(50) NOT NULL, -- 'welcome', 'nurturing', 'launch', 'custom', 'referral_bonus'
    stage INTEGER, -- Nurturing stage if applicable

    -- Content
    message_content TEXT NOT NULL,

    -- Zalo Delivery
    zalo_user_id VARCHAR(100),
    zalo_message_id VARCHAR(100),

    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'read', 'clicked', 'replied', 'failed', 'skipped'
    )),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for message logs
CREATE INDEX IF NOT EXISTS idx_message_logs_entry_id ON public.waitlist_message_logs(entry_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON public.waitlist_message_logs(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_type ON public.waitlist_message_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_message_logs_zalo_message_id ON public.waitlist_message_logs(zalo_message_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_pending ON public.waitlist_message_logs(scheduled_at)
    WHERE status = 'pending';

-- ============================================================================
-- 4. WAITLIST DAILY STATS TABLE
-- Aggregated statistics for dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_date DATE NOT NULL UNIQUE,

    -- Registration Stats
    total_entries INTEGER DEFAULT 0,
    new_entries_today INTEGER DEFAULT 0,
    verified_entries INTEGER DEFAULT 0,
    zalo_connected_today INTEGER DEFAULT 0,
    total_zalo_connected INTEGER DEFAULT 0,

    -- Source Breakdown (JSONB for flexibility)
    signups_by_source JSONB DEFAULT '{}', -- {"landing_page": 50, "referral": 30, "facebook_ad": 20}

    -- Interest Breakdown
    signups_by_interest JSONB DEFAULT '{}', -- {"trading": 40, "spiritual": 30, "both": 30}

    -- Nurturing Stats
    nurturing_sent INTEGER DEFAULT 0,
    nurturing_delivered INTEGER DEFAULT 0,
    nurturing_read INTEGER DEFAULT 0,
    nurturing_clicked INTEGER DEFAULT 0,

    -- Conversion Rates
    zalo_connect_rate DECIMAL(5,2) DEFAULT 0, -- %
    nurturing_open_rate DECIMAL(5,2) DEFAULT 0, -- %
    nurturing_click_rate DECIMAL(5,2) DEFAULT 0, -- %

    -- Referral Stats
    total_referrals INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,

    -- Conversion Stats
    conversions INTEGER DEFAULT 0, -- Downloaded app
    unsubscribes INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.waitlist_daily_stats(stat_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurturing_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_daily_stats ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for backend)
CREATE POLICY "Service role full access on waitlist_entries"
    ON public.waitlist_entries FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on nurturing_messages"
    ON public.nurturing_messages FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on waitlist_message_logs"
    ON public.waitlist_message_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on waitlist_daily_stats"
    ON public.waitlist_daily_stats FOR ALL
    USING (auth.role() = 'service_role');

-- Admin users can view all (check admin role in profiles)
CREATE POLICY "Admin can view all waitlist entries"
    ON public.waitlist_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can manage nurturing messages"
    ON public.nurturing_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can view message logs"
    ON public.waitlist_message_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can view waitlist stats"
    ON public.waitlist_daily_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Public can insert waitlist entries (for registration from landing page)
CREATE POLICY "Public can insert waitlist"
    ON public.waitlist_entries FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Normalize Vietnamese phone number to +84 format
CREATE OR REPLACE FUNCTION normalize_vietnamese_phone(phone_input TEXT)
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
CREATE OR REPLACE FUNCTION generate_waitlist_referral_code()
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
        FROM public.waitlist_entries
        WHERE referral_code = result;

        EXIT WHEN exists_count = 0;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: Auto-normalize phone and generate referral code
CREATE OR REPLACE FUNCTION waitlist_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize phone
    NEW.phone_normalized := normalize_vietnamese_phone(NEW.phone);

    -- Generate referral code if not provided
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_waitlist_referral_code();
    END IF;

    -- Set initial nurturing schedule (welcome message immediately)
    NEW.nurturing_stage := 0;
    NEW.next_nurturing_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_waitlist_before_insert ON public.waitlist_entries;
CREATE TRIGGER trigger_waitlist_before_insert
    BEFORE INSERT ON public.waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION waitlist_before_insert();

-- Trigger function: Update referral count when someone uses a referral code
CREATE OR REPLACE FUNCTION update_waitlist_referrer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referred_by_code IS NOT NULL AND NEW.referred_by_code != '' THEN
        -- Update referrer's count
        UPDATE public.waitlist_entries
        SET
            referral_count = referral_count + 1,
            updated_at = NOW()
        WHERE referral_code = NEW.referred_by_code;

        -- Set the referred_by_id
        NEW.referred_by_id := (
            SELECT id FROM public.waitlist_entries
            WHERE referral_code = NEW.referred_by_code
            LIMIT 1
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_referrer_count ON public.waitlist_entries;
CREATE TRIGGER trigger_update_referrer_count
    BEFORE INSERT ON public.waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_waitlist_referrer_count();

-- Trigger function: Auto-update timestamps
CREATE OR REPLACE FUNCTION waitlist_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_waitlist_update_timestamp ON public.waitlist_entries;
CREATE TRIGGER trigger_waitlist_update_timestamp
    BEFORE UPDATE ON public.waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION waitlist_update_timestamp();

-- Function: Get entries due for nurturing
CREATE OR REPLACE FUNCTION get_waitlist_nurturing_queue(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    entry_id UUID,
    phone_normalized VARCHAR(20),
    zalo_user_id VARCHAR(100),
    full_name VARCHAR(255),
    queue_number INTEGER,
    referral_code VARCHAR(20),
    referral_count INTEGER,
    nurturing_stage INTEGER,
    interest_type VARCHAR(50),
    next_nurturing_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id as entry_id,
        e.phone_normalized,
        e.zalo_user_id,
        e.full_name,
        e.queue_number,
        e.referral_code,
        e.referral_count,
        e.nurturing_stage,
        e.interest_type,
        e.next_nurturing_at
    FROM public.waitlist_entries e
    WHERE
        e.status IN ('verified', 'nurturing')
        AND e.nurturing_paused = FALSE
        AND e.zalo_user_id IS NOT NULL
        AND e.nurturing_stage < 5
        AND e.next_nurturing_at <= NOW()
    ORDER BY e.next_nurturing_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get public stats for landing page
CREATE OR REPLACE FUNCTION get_waitlist_public_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    verified_count INTEGER;
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM public.waitlist_entries
    WHERE status != 'invalid';

    SELECT COUNT(*) INTO verified_count
    FROM public.waitlist_entries
    WHERE status IN ('verified', 'nurturing', 'completed', 'converted');

    SELECT COUNT(*) INTO recent_count
    FROM public.waitlist_entries
    WHERE created_at > NOW() - INTERVAL '24 hours'
    AND status != 'invalid';

    SELECT json_build_object(
        'total_entries', total_count,
        'verified_count', verified_count,
        'recent_joins', recent_count,
        'max_slots', 500,
        'remaining_slots', GREATEST(0, 500 - total_count),
        'is_open', total_count < 500
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update daily stats (called by worker)
CREATE OR REPLACE FUNCTION update_waitlist_daily_stats()
RETURNS VOID AS $$
DECLARE
    today DATE := CURRENT_DATE;
    stats_record RECORD;
BEGIN
    -- Calculate stats
    SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE DATE(created_at) = today) as new_today,
        COUNT(*) FILTER (WHERE status IN ('verified', 'nurturing', 'completed', 'converted')) as verified,
        COUNT(*) FILTER (WHERE zalo_connected = TRUE AND DATE(zalo_connected_at) = today) as zalo_today,
        COUNT(*) FILTER (WHERE zalo_connected = TRUE) as zalo_total
    INTO stats_record
    FROM public.waitlist_entries
    WHERE status != 'invalid';

    -- Upsert daily stats
    INSERT INTO public.waitlist_daily_stats (
        stat_date,
        total_entries,
        new_entries_today,
        verified_entries,
        zalo_connected_today,
        total_zalo_connected
    )
    VALUES (
        today,
        stats_record.total,
        stats_record.new_today,
        stats_record.verified,
        stats_record.zalo_today,
        stats_record.zalo_total
    )
    ON CONFLICT (stat_date) DO UPDATE SET
        total_entries = EXCLUDED.total_entries,
        new_entries_today = EXCLUDED.new_entries_today,
        verified_entries = EXCLUDED.verified_entries,
        zalo_connected_today = EXCLUDED.zalo_connected_today,
        total_zalo_connected = EXCLUDED.total_zalo_connected,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: Default Nurturing Messages
-- ============================================================================

INSERT INTO public.nurturing_messages (stage, stage_name, days_after_signup, message_template, quick_actions, target_interest) VALUES

-- Stage 1: Welcome (Day 0)
(1, 'welcome', 0,
'Chao {{name}}!

Cam on ban da dang ky trai nghiem Gemral Premium!

So thu tu cua ban: #{{queue_number}}
Du kien app ra mat: Thang 2/2026

Trong thoi gian cho doi, Jennie se gui cho ban:
- Tips trading mien phi
- Bai doc Tarot/I Ching hang tuan
- Sneak peek tinh nang moi

Ma gioi thieu cua ban: {{referral_code}}
Moi 3 ban be de nhan them 30 ngay Premium!

Gemral - Giau co tu tam thuc',
'[{"title": "Xem them ve Gemral", "payload": "ABOUT_GEMRAL"}, {"title": "Moi ban be", "payload": "SHARE_REFERRAL"}]',
NULL),

-- Stage 2: Value Prop (Day 3) - Trading focus
(2, 'nurturing_day_3', 3,
'{{name}} oi,

Ta co mot tip trading danh rieng cho ban:

ZONE RETEST - BI QUYET CUA TRADER CHUYEN NGHIEP

90% trader thua lo vi "duoi gia" - vao lenh ngay khi thay tin hieu.

Trader chuyen nghiep lam khac:
- Doi gia quay lai test zone
- Xac nhan zone con hold
- Moi vao lenh

Don gian nhung hieu qua.

GEM Scanner se tu dong phat hien zone nay cho ban!

Gemral',
'[{"title": "Tim hieu GEM Scanner", "payload": "ABOUT_SCANNER"}]',
'trading'),

-- Stage 2: Value Prop (Day 3) - Spiritual focus
(2, 'nurturing_day_3_spiritual', 3,
'{{name}} oi,

Hom nay ta muon chia se voi ban ve NANG LUONG va TIEN BAC:

Tien bac la mot dang nang luong.
Khi tam ban blocked, tien cung blocked.
Khi ban flow, tien cung flow.

Cau hoi suy ngam:
"Niem tin nao ve tien dang gioi han ban?"

GEM Master se giup ban kham pha qua Tarot va I Ching.

Gemral - Giau co tu tam thuc',
'[{"title": "Thu Tarot mien phi", "payload": "TRY_TAROT"}]',
'spiritual'),

-- Stage 3: Sneak Peek (Day 7)
(3, 'nurturing_day_7', 7,
'{{name}} oi,

SNEAK PEEK: GEM Scanner AI

Ta vua hoan thien tinh nang phat hien pattern tu dong!

Scanner se:
- Quet 200+ cap coin realtime
- Phat hien zone High/Low Frequency
- Alert khi co tin hieu vao lenh
- Backtest 686 lenh voi 68% win rate

Ban se la nguoi dau tien duoc trai nghiem!

So thu tu cua ban: #{{queue_number}}

Gemral',
'[{"title": "Xem demo Scanner", "payload": "DEMO_SCANNER"}]',
NULL),

-- Stage 4: Social Proof (Day 10)
(4, 'nurturing_day_10', 10,
'{{name}} oi,

Day la feedback tu beta tester:

"Truoc khi dung Gemral, minh trade theo cam tinh va thua lien tuc. Sau 2 tuan dung GEM Scanner, minh da co lai 15% account. Quan trong nhat la minh khong con FOMO nua!"
- Anh Minh, trader 2 nam kinh nghiem

Ban co muon la nguoi tiep theo khong?

So thu tu cua ban: #{{queue_number}}
Da co {{total_waitlist}} nguoi dang ky!

Gemral',
'[]',
NULL),

-- Stage 5: Final (Day 14)
(5, 'nurturing_day_14', 14,
'{{name}} OI, SAP RA MAT ROI!

App Gemral dang trong giai doan test cuoi cung.

Ban la 1 trong {{total_waitlist}} nguoi dang ky som nhat!

So thu tu: #{{queue_number}}
Phan thuong: Premium 30 ngay MIEN PHI

Hay san sang nhe! Ta se thong bao ngay khi app ready.

Gemral - Trade dung tan so',
'[{"title": "Nhac toi khi ra mat", "payload": "REMIND_LAUNCH"}]',
NULL)

ON CONFLICT (stage, variant, target_interest) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant sequence access for queue_number auto-increment
GRANT USAGE, SELECT ON SEQUENCE waitlist_entries_queue_number_seq TO anon, authenticated;

-- Grant table access
GRANT SELECT ON public.waitlist_entries TO anon;
GRANT ALL ON public.waitlist_entries TO authenticated;
GRANT ALL ON public.nurturing_messages TO authenticated;
GRANT ALL ON public.waitlist_message_logs TO authenticated;
GRANT ALL ON public.waitlist_daily_stats TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Waitlist System tables created successfully!';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Tables: waitlist_entries, nurturing_messages, waitlist_message_logs, waitlist_daily_stats';
    RAISE NOTICE 'RLS policies enabled';
    RAISE NOTICE 'Functions: normalize_vietnamese_phone, generate_waitlist_referral_code';
    RAISE NOTICE 'Functions: get_waitlist_nurturing_queue, get_waitlist_public_stats';
    RAISE NOTICE 'Triggers: auto phone normalization, referral code generation, referral count';
    RAISE NOTICE 'Seed data: 6 nurturing message templates';
    RAISE NOTICE '========================================';
END $$;

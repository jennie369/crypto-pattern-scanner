-- ============================================================
-- TRADING COURSE LEADS TABLE
-- For yinyangmasters.com/pages/khoatradingtansodocquyen landing page
-- Benefits: 500K discount + 30 days Pro Scanner (first 50 people)
-- ============================================================

-- Create trading_leads table
CREATE TABLE IF NOT EXISTS trading_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Queue position (auto-increment)
    queue_number SERIAL UNIQUE,

    -- Contact info
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(100),

    -- Lead source tracking
    source VARCHAR(50) DEFAULT 'fomo_popup',  -- fomo_popup, hero_form, pricing_section, etc.
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer_url TEXT,

    -- Benefits status
    benefits_status VARCHAR(20) DEFAULT 'pending' CHECK (benefits_status IN (
        'pending',      -- Waiting for confirmation
        'confirmed',    -- Email confirmed
        'redeemed',     -- Benefits used
        'expired',      -- Benefits expired
        'cancelled'     -- User cancelled
    )),

    -- Specific benefits for trading leads
    discount_code VARCHAR(20),           -- Generated discount code
    discount_amount INTEGER DEFAULT 500000,  -- 500,000 VND
    scanner_days INTEGER DEFAULT 30,      -- 30 days Pro Scanner
    scanner_activated_at TIMESTAMPTZ,     -- When Pro Scanner was activated
    scanner_expires_at TIMESTAMPTZ,       -- When Pro Scanner expires

    -- Conversion tracking
    converted_at TIMESTAMPTZ,             -- When they purchased a course
    course_tier VARCHAR(20),              -- tier_1, tier_2, tier_3
    order_id VARCHAR(100),                -- Shopify order ID if converted

    -- User account link (if they create Gemral account)
    user_id UUID REFERENCES auth.users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email_confirmed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT trading_leads_email_unique UNIQUE (email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trading_leads_email ON trading_leads(email);
CREATE INDEX IF NOT EXISTS idx_trading_leads_queue_number ON trading_leads(queue_number);
CREATE INDEX IF NOT EXISTS idx_trading_leads_benefits_status ON trading_leads(benefits_status);
CREATE INDEX IF NOT EXISTS idx_trading_leads_discount_code ON trading_leads(discount_code);
CREATE INDEX IF NOT EXISTS idx_trading_leads_created_at ON trading_leads(created_at DESC);

-- ============================================================
-- FUNCTION: Generate unique discount code
-- ============================================================
CREATE OR REPLACE FUNCTION generate_trading_discount_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate code: TRADE + 6 random alphanumeric chars
        new_code := 'TRADE' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM trading_leads WHERE discount_code = new_code) INTO code_exists;

        -- Exit loop if unique
        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Auto-generate discount code on insert
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_trading_lead_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize email to lowercase
    NEW.email := lower(trim(NEW.email));

    -- Generate discount code if not provided
    IF NEW.discount_code IS NULL THEN
        NEW.discount_code := generate_trading_discount_code();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trading_lead_insert ON trading_leads;
CREATE TRIGGER trigger_trading_lead_insert
    BEFORE INSERT ON trading_leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_trading_lead_before_insert();

-- ============================================================
-- TRIGGER: Update timestamp on changes
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_trading_leads_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trading_leads_updated ON trading_leads;
CREATE TRIGGER trigger_trading_leads_updated
    BEFORE UPDATE ON trading_leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_trading_leads_update_timestamp();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE trading_leads ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "trading_leads_service_all" ON trading_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can only see their own record (if linked)
CREATE POLICY "trading_leads_user_select" ON trading_leads
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow anon to insert (for landing page form)
CREATE POLICY "trading_leads_anon_insert" ON trading_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================================
-- FUNCTION: Get trading leads stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_trading_leads_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_leads', COUNT(*),
        'first_50_remaining', GREATEST(0, 50 - COUNT(*)),
        'first_50_taken', LEAST(50, COUNT(*)),
        'pending', COUNT(*) FILTER (WHERE benefits_status = 'pending'),
        'confirmed', COUNT(*) FILTER (WHERE benefits_status = 'confirmed'),
        'redeemed', COUNT(*) FILTER (WHERE benefits_status = 'redeemed'),
        'converted', COUNT(*) FILTER (WHERE converted_at IS NOT NULL),
        'today_signups', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)
    ) INTO result
    FROM trading_leads;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Check and activate Pro Scanner
-- ============================================================
CREATE OR REPLACE FUNCTION activate_pro_scanner(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    lead_record trading_leads%ROWTYPE;
    result JSON;
BEGIN
    -- Get lead by email
    SELECT * INTO lead_record
    FROM trading_leads
    WHERE email = lower(trim(p_email))
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Email not found');
    END IF;

    -- Check if already activated
    IF lead_record.scanner_activated_at IS NOT NULL THEN
        RETURN json_build_object(
            'success', true,
            'already_activated', true,
            'expires_at', lead_record.scanner_expires_at
        );
    END IF;

    -- Check if eligible (first 50)
    IF lead_record.queue_number > 50 THEN
        RETURN json_build_object('success', false, 'error', 'Not in first 50 registrants');
    END IF;

    -- Activate scanner
    UPDATE trading_leads
    SET
        scanner_activated_at = NOW(),
        scanner_expires_at = NOW() + (scanner_days || ' days')::INTERVAL,
        benefits_status = CASE
            WHEN benefits_status = 'pending' THEN 'confirmed'
            ELSE benefits_status
        END
    WHERE id = lead_record.id;

    RETURN json_build_object(
        'success', true,
        'activated_at', NOW(),
        'expires_at', NOW() + (lead_record.scanner_days || ' days')::INTERVAL,
        'days', lead_record.scanner_days
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Validate discount code
-- ============================================================
CREATE OR REPLACE FUNCTION validate_trading_discount(p_code VARCHAR)
RETURNS JSON AS $$
DECLARE
    lead_record trading_leads%ROWTYPE;
BEGIN
    -- Get lead by discount code
    SELECT * INTO lead_record
    FROM trading_leads
    WHERE discount_code = upper(trim(p_code));

    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid code');
    END IF;

    -- Check if already redeemed
    IF lead_record.benefits_status = 'redeemed' THEN
        RETURN json_build_object('valid', false, 'error', 'Code already used');
    END IF;

    -- Check if expired
    IF lead_record.benefits_status = 'expired' THEN
        RETURN json_build_object('valid', false, 'error', 'Code expired');
    END IF;

    -- Check if in first 50
    IF lead_record.queue_number > 50 THEN
        RETURN json_build_object('valid', false, 'error', 'Not eligible for discount');
    END IF;

    -- Valid code
    RETURN json_build_object(
        'valid', true,
        'discount_amount', lead_record.discount_amount,
        'email', lead_record.email,
        'queue_number', lead_record.queue_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Redeem discount code
-- ============================================================
CREATE OR REPLACE FUNCTION redeem_trading_discount(
    p_code VARCHAR,
    p_order_id VARCHAR,
    p_course_tier VARCHAR
)
RETURNS JSON AS $$
DECLARE
    lead_record trading_leads%ROWTYPE;
BEGIN
    -- Validate first
    SELECT * INTO lead_record
    FROM trading_leads
    WHERE discount_code = upper(trim(p_code))
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid code');
    END IF;

    IF lead_record.benefits_status = 'redeemed' THEN
        RETURN json_build_object('success', false, 'error', 'Already redeemed');
    END IF;

    -- Mark as redeemed
    UPDATE trading_leads
    SET
        benefits_status = 'redeemed',
        converted_at = NOW(),
        order_id = p_order_id,
        course_tier = p_course_tier
    WHERE id = lead_record.id;

    RETURN json_build_object(
        'success', true,
        'discount_applied', lead_record.discount_amount,
        'email', lead_record.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT EXECUTE ON FUNCTION get_trading_leads_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_trading_leads_stats() TO anon;
GRANT EXECUTE ON FUNCTION validate_trading_discount(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_trading_discount(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION activate_pro_scanner(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_trading_discount(VARCHAR, VARCHAR, VARCHAR) TO service_role;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE trading_leads IS 'Leads from trading course landing page with special benefits';
COMMENT ON COLUMN trading_leads.queue_number IS 'Position in queue - first 50 get benefits';
COMMENT ON COLUMN trading_leads.discount_code IS 'Unique code for 500K discount';
COMMENT ON COLUMN trading_leads.scanner_days IS 'Number of days for Pro Scanner access';

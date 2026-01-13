-- ============================================================
-- FREQUENCY COURSE LEADS TABLE
-- For yinyangmasters.com/pages/7ngaykhaimotansogoc landing page
-- Khóa 7 Ngày Khai Mở Tần Số Gốc
-- Benefits: 200K discount (first 50 people)
-- ============================================================

-- Create frequency_leads table
CREATE TABLE IF NOT EXISTS frequency_leads (
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

    -- Specific benefits for frequency leads
    discount_code VARCHAR(20),               -- Shopify discount code
    discount_amount INTEGER DEFAULT 200000,  -- 200,000 VND

    -- Conversion tracking
    converted_at TIMESTAMPTZ,                -- When they purchased the course
    order_id VARCHAR(100),                   -- Shopify order ID if converted

    -- User account link (if they create Gemral account)
    user_id UUID REFERENCES auth.users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email_confirmed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT frequency_leads_email_unique UNIQUE (email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_frequency_leads_email ON frequency_leads(email);
CREATE INDEX IF NOT EXISTS idx_frequency_leads_queue_number ON frequency_leads(queue_number);
CREATE INDEX IF NOT EXISTS idx_frequency_leads_benefits_status ON frequency_leads(benefits_status);
CREATE INDEX IF NOT EXISTS idx_frequency_leads_discount_code ON frequency_leads(discount_code);
CREATE INDEX IF NOT EXISTS idx_frequency_leads_created_at ON frequency_leads(created_at DESC);

-- ============================================================
-- TRIGGER: Auto-set discount code to FREQ200K on insert
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_frequency_lead_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize email to lowercase
    NEW.email := lower(trim(NEW.email));

    -- Set discount code to the shared Shopify code
    IF NEW.discount_code IS NULL THEN
        NEW.discount_code := 'FREQ200K';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_frequency_lead_insert ON frequency_leads;
CREATE TRIGGER trigger_frequency_lead_insert
    BEFORE INSERT ON frequency_leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_frequency_lead_before_insert();

-- ============================================================
-- TRIGGER: Update timestamp on changes
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_frequency_leads_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_frequency_leads_updated ON frequency_leads;
CREATE TRIGGER trigger_frequency_leads_updated
    BEFORE UPDATE ON frequency_leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_frequency_leads_update_timestamp();

-- ============================================================
-- TRIGGER: Notify admins on new frequency lead registration
-- ============================================================
CREATE OR REPLACE FUNCTION notify_admins_new_frequency_lead()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get all admin user IDs
    FOR admin_id IN
        SELECT id FROM auth.users
        WHERE raw_user_meta_data->>'role' = 'admin'
           OR raw_user_meta_data->>'is_admin' = 'true'
    LOOP
        -- Insert notification for each admin
        INSERT INTO forum_notifications (
            user_id,
            type,
            title,
            body,
            data,
            read
        ) VALUES (
            admin_id,
            'frequency_lead_new',
            'Lead Khóa 7 Ngày Mới #' || NEW.queue_number,
            'Email: ' || NEW.email || ' | Nguồn: ' || COALESCE(NEW.source, 'fomo_popup'),
            jsonb_build_object(
                'lead_id', NEW.id,
                'queue_number', NEW.queue_number,
                'email', NEW.email,
                'source', NEW.source,
                'is_first_50', NEW.queue_number <= 50
            ),
            false
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_frequency_lead ON frequency_leads;
CREATE TRIGGER trigger_notify_frequency_lead
    AFTER INSERT ON frequency_leads
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_frequency_lead();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE frequency_leads ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "frequency_leads_service_all" ON frequency_leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can only see their own record (if linked)
CREATE POLICY "frequency_leads_user_select" ON frequency_leads
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow anon to insert (for landing page form)
CREATE POLICY "frequency_leads_anon_insert" ON frequency_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================================
-- FUNCTION: Get frequency leads stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_frequency_leads_stats()
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
    FROM frequency_leads;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Validate frequency discount code
-- ============================================================
CREATE OR REPLACE FUNCTION validate_frequency_discount(p_code VARCHAR)
RETURNS JSON AS $$
DECLARE
    lead_record frequency_leads%ROWTYPE;
BEGIN
    -- Get lead by discount code
    SELECT * INTO lead_record
    FROM frequency_leads
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
-- FUNCTION: Redeem frequency discount code
-- ============================================================
CREATE OR REPLACE FUNCTION redeem_frequency_discount(
    p_code VARCHAR,
    p_order_id VARCHAR
)
RETURNS JSON AS $$
DECLARE
    lead_record frequency_leads%ROWTYPE;
BEGIN
    -- Validate first
    SELECT * INTO lead_record
    FROM frequency_leads
    WHERE discount_code = upper(trim(p_code))
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid code');
    END IF;

    IF lead_record.benefits_status = 'redeemed' THEN
        RETURN json_build_object('success', false, 'error', 'Already redeemed');
    END IF;

    -- Mark as redeemed
    UPDATE frequency_leads
    SET
        benefits_status = 'redeemed',
        converted_at = NOW(),
        order_id = p_order_id
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
GRANT EXECUTE ON FUNCTION get_frequency_leads_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_frequency_leads_stats() TO anon;
GRANT EXECUTE ON FUNCTION validate_frequency_discount(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_frequency_discount(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION redeem_frequency_discount(VARCHAR, VARCHAR) TO service_role;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE frequency_leads IS 'Leads from 7-day frequency course landing page with special benefits';
COMMENT ON COLUMN frequency_leads.queue_number IS 'Position in queue - first 50 get 200K discount';
COMMENT ON COLUMN frequency_leads.discount_code IS 'Shopify discount code FREQ200K';

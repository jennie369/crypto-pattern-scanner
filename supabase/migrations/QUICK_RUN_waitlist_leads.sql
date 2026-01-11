-- ============================================================================
-- QUICK VERSION: GEMRAL WAITLIST LEADS TABLE
-- Run this in Supabase SQL Editor first to test
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main Waitlist Leads Table (simplified)
CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contact Info
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    phone_normalized VARCHAR(20) NOT NULL,

    -- Interest
    interested_products TEXT[] DEFAULT '{}',
    primary_interest VARCHAR(50),

    -- Lead Scoring
    lead_score INTEGER DEFAULT 10,
    lead_grade VARCHAR(1) DEFAULT 'D',
    lead_status VARCHAR(20) DEFAULT 'new',

    -- Source Tracking
    source VARCHAR(50) DEFAULT 'landing_page',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    referrer_url TEXT,

    -- Device Info
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Marketing
    marketing_consent BOOLEAN DEFAULT true,

    -- Shopify Sync
    shopify_customer_id VARCHAR(50),
    shopify_sync_status VARCHAR(20) DEFAULT 'pending',
    shopify_synced_at TIMESTAMPTZ,

    -- Zalo Link (reference to existing waitlist_entries - optional)
    waitlist_entry_id UUID,

    -- Queue Number
    queue_number SERIAL NOT NULL,

    -- Referral
    referral_code VARCHAR(20) UNIQUE,
    referred_by_code VARCHAR(20),
    referral_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.waitlist_leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_phone_normalized ON public.waitlist_leads(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.waitlist_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.waitlist_leads(created_at);

-- RLS: Enable
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- RLS: Service role full access
CREATE POLICY "service_full_access_leads" ON public.waitlist_leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS: Anon can insert (for public form submission)
CREATE POLICY "anon_insert_leads" ON public.waitlist_leads
    FOR INSERT TO anon WITH CHECK (true);

-- Function: Normalize phone
CREATE OR REPLACE FUNCTION normalize_vietnamese_phone_lead(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
    cleaned TEXT;
BEGIN
    cleaned := regexp_replace(phone_input, '[^0-9]', '', 'g');

    IF cleaned LIKE '84%' THEN
        cleaned := '0' || substring(cleaned from 3);
    END IF;

    IF length(cleaned) = 9 THEN
        cleaned := '0' || cleaned;
    END IF;

    RETURN cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate grade from score
CREATE OR REPLACE FUNCTION calculate_lead_grade(score INTEGER)
RETURNS VARCHAR(1) AS $$
BEGIN
    RETURN CASE
        WHEN score >= 80 THEN 'A'
        WHEN score >= 60 THEN 'B'
        WHEN score >= 40 THEN 'C'
        WHEN score >= 20 THEN 'D'
        ELSE 'F'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Generate referral code
CREATE OR REPLACE FUNCTION generate_lead_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'GEM' || upper(substring(md5(random()::text) from 1 for 5));
        SELECT EXISTS(SELECT 1 FROM public.waitlist_leads WHERE referral_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto normalize phone and generate referral code
CREATE OR REPLACE FUNCTION trigger_normalize_lead_phone()
RETURNS TRIGGER AS $$
BEGIN
    NEW.phone_normalized := normalize_vietnamese_phone_lead(NEW.phone);

    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_lead_referral_code();
    END IF;

    IF NEW.interested_products IS NOT NULL AND array_length(NEW.interested_products, 1) > 0 THEN
        NEW.primary_interest := NEW.interested_products[1];
    END IF;

    NEW.lead_grade := calculate_lead_grade(NEW.lead_score);
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_before_insert ON public.waitlist_leads;
CREATE TRIGGER trigger_lead_before_insert
    BEFORE INSERT ON public.waitlist_leads
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_lead_phone();

DROP TRIGGER IF EXISTS trigger_lead_before_update ON public.waitlist_leads;
CREATE TRIGGER trigger_lead_before_update
    BEFORE UPDATE ON public.waitlist_leads
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_lead_phone();

-- Done!
SELECT 'waitlist_leads table created successfully!' as result;

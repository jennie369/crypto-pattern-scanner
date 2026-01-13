-- ============================================================================
-- INSTRUCTOR APPLICATIONS TABLE
-- ============================================================================
-- Table to store instructor/lecturer registration applications
-- Includes CV upload, social proof, expertise areas, and admin review fields

-- Drop table if exists (for development)
DROP TABLE IF EXISTS instructor_applications CASCADE;

-- Create instructor_applications table
CREATE TABLE instructor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,

    -- Professional Info
    expertise_areas TEXT[] DEFAULT '{}', -- Array of expertise: ['trading', 'mindset', 'wealth', etc.]
    years_experience INTEGER DEFAULT 0,
    current_occupation TEXT,
    bio TEXT, -- Short introduction about themselves

    -- CV & Portfolio
    cv_url TEXT, -- URL to uploaded CV (PDF)
    cv_filename TEXT, -- Original filename
    portfolio_urls TEXT[] DEFAULT '{}', -- Array of portfolio/work sample URLs

    -- Social Media Proof
    social_platforms JSONB DEFAULT '{}', -- {youtube: 5000, facebook: 10000, ...}
    total_followers INTEGER DEFAULT 0,
    social_proof_urls TEXT[] DEFAULT '{}', -- Array of social media URLs

    -- Course Proposal (Optional)
    proposed_course_title TEXT,
    proposed_course_description TEXT,
    proposed_course_target_audience TEXT,

    -- Teaching Experience
    teaching_experience TEXT, -- Description of teaching/training experience
    has_online_course_experience BOOLEAN DEFAULT FALSE,
    previous_platforms TEXT[] DEFAULT '{}', -- ['udemy', 'coursera', 'youtube', etc.]

    -- Revenue Share Preference
    preferred_revenue_share TEXT DEFAULT '50-50', -- '40-60', '50-50', '60-40'

    -- Application Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview_scheduled', 'approved', 'rejected', 'withdrawn')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    interview_scheduled_at TIMESTAMPTZ,
    interview_notes TEXT,

    -- Source tracking
    source TEXT DEFAULT 'landing_page', -- 'landing_page', 'app', 'referral', 'direct'
    referred_by_code TEXT,
    referred_by_user_id UUID REFERENCES profiles(id),

    -- Approval tracking
    approved_tier TEXT, -- 'standard', 'premium', 'exclusive' after approval
    approved_revenue_share INTEGER, -- Actual approved revenue share percentage
    contract_signed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_instructor_applications_email ON instructor_applications(email);
CREATE INDEX idx_instructor_applications_status ON instructor_applications(status);
CREATE INDEX idx_instructor_applications_created ON instructor_applications(created_at DESC);
CREATE INDEX idx_instructor_applications_expertise ON instructor_applications USING GIN(expertise_areas);

-- Enable RLS
ALTER TABLE instructor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert (for landing page submissions)
CREATE POLICY "Anyone can submit instructor application"
ON instructor_applications FOR INSERT
TO public
WITH CHECK (true);

-- RLS Policy: Users can view their own applications by email
CREATE POLICY "Users can view own applications"
ON instructor_applications FOR SELECT
TO public
USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- RLS Policy: Only admins can update
CREATE POLICY "Admins can update instructor applications"
ON instructor_applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_instructor_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_instructor_application_timestamp ON instructor_applications;
CREATE TRIGGER update_instructor_application_timestamp
    BEFORE UPDATE ON instructor_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_instructor_application_timestamp();

-- ============================================================================
-- ADMIN NOTIFICATIONS TABLE (if not exists)
-- ============================================================================
-- Create a table to store admin notifications if it doesn't exist

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'instructor_application', 'partnership_application', 'support_ticket', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data like application_id, user info, etc.
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_by UUID REFERENCES profiles(id),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- Enable RLS on admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications"
ON admin_notifications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Only admins can update (mark as read)
CREATE POLICY "Admins can update notifications"
ON admin_notifications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Function to create admin notification when new instructor application is submitted
CREATE OR REPLACE FUNCTION notify_admin_instructor_application()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_notifications (
        type,
        title,
        message,
        data,
        priority
    ) VALUES (
        'instructor_application',
        'Đơn đăng ký Giảng Viên mới',
        format('%s (%s) đã đăng ký làm Giảng Viên với %s năm kinh nghiệm',
               NEW.full_name,
               NEW.email,
               COALESCE(NEW.years_experience::text, '0')),
        jsonb_build_object(
            'application_id', NEW.id,
            'full_name', NEW.full_name,
            'email', NEW.email,
            'phone', NEW.phone,
            'expertise_areas', NEW.expertise_areas,
            'total_followers', NEW.total_followers,
            'has_cv', NEW.cv_url IS NOT NULL,
            'proposed_course', NEW.proposed_course_title
        ),
        CASE
            WHEN NEW.total_followers >= 50000 THEN 'high'
            WHEN NEW.total_followers >= 20000 THEN 'normal'
            ELSE 'low'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify admin on new instructor application
DROP TRIGGER IF EXISTS notify_admin_on_instructor_application ON instructor_applications;
CREATE TRIGGER notify_admin_on_instructor_application
    AFTER INSERT ON instructor_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_instructor_application();

-- ============================================================================
-- Storage bucket for CV uploads (run manually in Supabase Dashboard)
-- ============================================================================
-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- Bucket name: instructor-cvs
-- Public: false
-- Allowed MIME types: application/pdf
-- Max file size: 10MB

-- Grant storage access (if using Supabase Storage API)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('instructor-cvs', 'instructor-cvs', false)
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE instructor_applications IS 'Stores instructor/lecturer registration applications from landing page and app';
COMMENT ON COLUMN instructor_applications.expertise_areas IS 'Array of expertise areas: trading, mindset, wealth, spirituality, business, etc.';
COMMENT ON COLUMN instructor_applications.cv_url IS 'Supabase Storage URL for uploaded CV (PDF)';
COMMENT ON COLUMN instructor_applications.social_platforms IS 'JSON object with follower counts per platform';
COMMENT ON COLUMN instructor_applications.status IS 'Application status: pending, reviewing, interview_scheduled, approved, rejected, withdrawn';
COMMENT ON COLUMN instructor_applications.approved_tier IS 'Tier assigned after approval: standard (40%), premium (50%), exclusive (60%)';

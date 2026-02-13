-- ============================================================================
-- INSTRUCTOR APPLICATION SYSTEM SETUP (WITHOUT STORAGE BUCKET)
-- ============================================================================
-- Run this file in Supabase SQL Editor
-- NOTE: Create storage bucket manually in Dashboard (see instructions below)
-- ============================================================================

-- ============================================================================
-- STEP 1: INSTRUCTOR APPLICATIONS TABLE
-- ============================================================================

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
    expertise_areas TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    current_occupation TEXT,
    bio TEXT,

    -- CV & Portfolio
    cv_url TEXT,
    cv_filename TEXT,
    portfolio_urls TEXT[] DEFAULT '{}',

    -- Social Media Proof
    social_platforms JSONB DEFAULT '{}',
    total_followers INTEGER DEFAULT 0,
    social_proof_urls TEXT[] DEFAULT '{}',

    -- Course Proposal (Optional)
    proposed_course_title TEXT,
    proposed_course_description TEXT,
    proposed_course_target_audience TEXT,

    -- Teaching Experience
    teaching_experience TEXT,
    has_online_course_experience BOOLEAN DEFAULT FALSE,
    previous_platforms TEXT[] DEFAULT '{}',

    -- Revenue Share Preference
    preferred_revenue_share TEXT DEFAULT '50-50',

    -- Application Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview_scheduled', 'approved', 'rejected', 'withdrawn')),
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    interview_scheduled_at TIMESTAMPTZ,
    interview_notes TEXT,

    -- Source tracking
    source TEXT DEFAULT 'landing_page',
    referred_by_code TEXT,
    referred_by_user_id UUID,

    -- Approval tracking
    approved_tier TEXT,
    approved_revenue_share INTEGER,
    contract_signed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_instructor_applications_email ON instructor_applications(email);
CREATE INDEX idx_instructor_applications_status ON instructor_applications(status);
CREATE INDEX idx_instructor_applications_created ON instructor_applications(created_at DESC);
CREATE INDEX idx_instructor_applications_expertise ON instructor_applications USING GIN(expertise_areas);

-- Enable RLS
ALTER TABLE instructor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert
CREATE POLICY "Anyone can submit instructor application"
ON instructor_applications FOR INSERT
TO public
WITH CHECK (true);

-- RLS Policy: Anyone can view (for checking duplicates)
CREATE POLICY "Anyone can view instructor applications"
ON instructor_applications FOR SELECT
TO public
USING (true);

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
-- STEP 2: ADMIN NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_by UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- Enable RLS on admin_notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can view notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;

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

-- Allow system/triggers to insert
CREATE POLICY "System can insert notifications"
ON admin_notifications FOR INSERT
TO public
WITH CHECK (true);

-- ============================================================================
-- STEP 3: NOTIFICATION TRIGGER
-- ============================================================================

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
        '🎓 Đơn đăng ký Giảng Viên mới',
        format('%s (%s) đã đăng ký làm Giảng Viên với %s năm kinh nghiệm. Lĩnh vực: %s',
               NEW.full_name,
               NEW.email,
               COALESCE(NEW.years_experience::text, '0'),
               COALESCE(array_to_string(NEW.expertise_areas, ', '), 'Chưa chọn')),
        jsonb_build_object(
            'application_id', NEW.id,
            'full_name', NEW.full_name,
            'email', NEW.email,
            'phone', NEW.phone,
            'expertise_areas', NEW.expertise_areas,
            'years_experience', NEW.years_experience,
            'total_followers', NEW.total_followers,
            'has_cv', NEW.cv_url IS NOT NULL,
            'proposed_course', NEW.proposed_course_title,
            'preferred_revenue_share', NEW.preferred_revenue_share,
            'source', NEW.source
        ),
        CASE
            WHEN NEW.total_followers >= 50000 THEN 'high'
            WHEN NEW.total_followers >= 20000 THEN 'normal'
            WHEN NEW.years_experience >= 5 THEN 'normal'
            ELSE 'low'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify admin on new instructor application
DROP TRIGGER IF EXISTS notify_admin_on_instructor_application ON instructor_applications;
CREATE TRIGGER notify_admin_on_instructor_application
    AFTER INSERT ON instructor_applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_instructor_application();

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'instructor_applications') THEN
        RAISE NOTICE '✅ Table instructor_applications created successfully';
    ELSE
        RAISE EXCEPTION '❌ Table instructor_applications NOT created';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_notifications') THEN
        RAISE NOTICE '✅ Table admin_notifications exists';
    ELSE
        RAISE EXCEPTION '❌ Table admin_notifications NOT created';
    END IF;
END $$;

-- ============================================================================
-- DONE! Now create storage bucket manually (see instructions below)
-- ============================================================================

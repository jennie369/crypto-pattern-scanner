-- ============================================
-- MIGRATION: 20251202_content_calendar.sql
-- Description: Content Calendar cho Auto-Post System
-- Author: Claude AI
-- Date: 2024-12-02
-- ============================================

-- ========== TABLE: content_calendar ==========
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content info
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL DEFAULT 'post',
  -- content_type: 'post', 'video', 'short', 'reel', 'story'

  -- Media
  media_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  video_url TEXT,

  -- Metadata
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  link_url TEXT,

  -- Platform targeting
  platform VARCHAR(50) NOT NULL,
  -- platform: 'gemral', 'facebook', 'tiktok', 'youtube', 'threads', 'instagram'

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',

  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft',
  -- status: 'draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled'

  posted_at TIMESTAMPTZ,
  error_message TEXT,
  external_post_id VARCHAR(255), -- ID từ platform sau khi post thành công

  -- Pillar/Category
  pillar VARCHAR(100),
  -- pillar: 'spiritual', 'trading', 'money', 'healing', 'community'

  -- Author
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========
-- Index cho query scheduled posts
CREATE INDEX IF NOT EXISTS idx_content_calendar_schedule
  ON content_calendar(scheduled_date, scheduled_time, status);

-- Index cho query by platform
CREATE INDEX IF NOT EXISTS idx_content_calendar_platform
  ON content_calendar(platform, status);

-- Index cho query by date range
CREATE INDEX IF NOT EXISTS idx_content_calendar_date_range
  ON content_calendar(scheduled_date, platform);

-- Index cho search by title
CREATE INDEX IF NOT EXISTS idx_content_calendar_title
  ON content_calendar USING gin(to_tsvector('simple', title));

-- ========== RLS POLICIES ==========
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins full access on content_calendar" ON content_calendar;
DROP POLICY IF EXISTS "Creators can manage own content" ON content_calendar;
DROP POLICY IF EXISTS "Users can view published content" ON content_calendar;

-- Admins can do everything
CREATE POLICY "Admins full access on content_calendar"
  ON content_calendar
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Content creators can view and edit own content
CREATE POLICY "Creators can manage own content"
  ON content_calendar
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- All authenticated users can view published content
CREATE POLICY "Users can view published content"
  ON content_calendar
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'posted'
  );

-- ========== TRIGGERS ==========
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_content_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_calendar_updated_at ON content_calendar;

CREATE TRIGGER trigger_content_calendar_updated_at
  BEFORE UPDATE ON content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_content_calendar_updated_at();

-- ========== COMMENTS ==========
COMMENT ON TABLE content_calendar IS 'Stores scheduled content for auto-posting to various platforms';
COMMENT ON COLUMN content_calendar.platform IS 'Target platform: gemral, facebook, tiktok, youtube, threads, instagram';
COMMENT ON COLUMN content_calendar.status IS 'Post status: draft, scheduled, posting, posted, failed, cancelled';
COMMENT ON COLUMN content_calendar.pillar IS 'Content pillar: spiritual, trading, money, healing, community';

-- ========== DONE ==========
SELECT 'content_calendar table created successfully' AS result;

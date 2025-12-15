-- ============================================
-- MIGRATION: 20251202_auto_post_logs.sql
-- Description: Logs table cho Auto-Post tracking
-- Author: Claude AI
-- Date: 2024-12-02
-- ============================================

-- ========== TABLE: auto_post_logs ==========
CREATE TABLE IF NOT EXISTS auto_post_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to content
  content_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,

  -- Execution info
  platform VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  -- action: 'post_created', 'post_updated', 'post_deleted', 'post_failed', 'retry_attempted'

  -- Status
  status VARCHAR(50) NOT NULL,
  -- status: 'success', 'failed', 'pending', 'retrying'

  -- Response data
  response_data JSONB,
  error_message TEXT,
  error_code VARCHAR(50),

  -- External reference
  external_post_id VARCHAR(255),
  external_url TEXT,

  -- Timing
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,

  -- Retry info
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_auto_post_logs_content
  ON auto_post_logs(content_id);

CREATE INDEX IF NOT EXISTS idx_auto_post_logs_platform_status
  ON auto_post_logs(platform, status);

CREATE INDEX IF NOT EXISTS idx_auto_post_logs_executed_at
  ON auto_post_logs(executed_at DESC);

-- ========== RLS POLICIES ==========
ALTER TABLE auto_post_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all logs" ON auto_post_logs;
DROP POLICY IF EXISTS "System can insert logs" ON auto_post_logs;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs"
  ON auto_post_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- System can insert logs (via service role)
CREATE POLICY "System can insert logs"
  ON auto_post_logs
  FOR INSERT
  WITH CHECK (true);

-- ========== COMMENTS ==========
COMMENT ON TABLE auto_post_logs IS 'Logs all auto-post activities for debugging and monitoring';
COMMENT ON COLUMN auto_post_logs.action IS 'Action type: post_created, post_updated, post_deleted, post_failed, retry_attempted';
COMMENT ON COLUMN auto_post_logs.status IS 'Execution status: success, failed, pending, retrying';

-- ========== DONE ==========
SELECT 'auto_post_logs table created successfully' AS result;

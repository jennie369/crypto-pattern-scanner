-- ============================================
-- DASHBOARD WIDGETS - PERFORMANCE OPTIMIZATION
-- Phase 13: Testing & Launch
-- Created: 2025-01-20
-- ============================================

-- Drop old individual indexes (if they exist)
DROP INDEX IF EXISTS idx_widgets_user_visible;
DROP INDEX IF EXISTS idx_widgets_user_order;

-- Create optimized composite index for the most common query pattern:
-- SELECT * FROM dashboard_widgets
-- WHERE user_id = ? AND is_visible = true
-- ORDER BY position_order
CREATE INDEX IF NOT EXISTS idx_widgets_user_visible_order
  ON dashboard_widgets(user_id, is_visible, position_order);

-- This composite index optimizes:
-- 1. Dashboard page load (fetching visible widgets in order)
-- 2. Widget reordering operations
-- 3. Filtering deleted/hidden widgets

-- Keep individual indexes for other query patterns
CREATE INDEX IF NOT EXISTS idx_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_widgets_goal ON dashboard_widgets(linked_goal_id);

-- Add index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_active_next
  ON scheduled_notifications(user_id, is_active, next_send_at)
  WHERE is_active = TRUE;

-- Analyze tables to update statistics for query planner
ANALYZE dashboard_widgets;
ANALYZE manifestation_goals;
ANALYZE scheduled_notifications;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_widgets_user_visible_order IS
  'Composite index for dashboard page load optimization - covers user_id + is_visible + position_order';

COMMENT ON INDEX idx_notifications_user_active_next IS
  'Optimized index for cron job to find pending notifications';

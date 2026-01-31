-- =====================================================
-- COMMENT LIKES RPC FUNCTIONS
-- File: migrations/20260131_comment_likes_rpc.sql
-- Created: January 31, 2026
-- Purpose: Functions to increment/decrement comment likes_count
-- =====================================================

-- Function to increment comment likes count
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_comments
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = comment_id;
END;
$$;

-- Function to decrement comment likes count
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_comments
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
  WHERE id = comment_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_comment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_comment_likes(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION increment_comment_likes IS 'Increment likes_count on forum_comments by 1';
COMMENT ON FUNCTION decrement_comment_likes IS 'Decrement likes_count on forum_comments by 1 (min 0)';

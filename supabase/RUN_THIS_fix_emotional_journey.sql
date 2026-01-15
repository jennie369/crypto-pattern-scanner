-- ============================================================
-- FIX: Multiple RPC function type mismatch errors
-- Run this in Supabase SQL Editor to fix all issues
-- ============================================================

-- DROP old functions first (required when changing return types)
DROP FUNCTION IF EXISTS search_memories(UUID, TEXT, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS get_emotional_journey(UUID, INTEGER);

-- FIX 1: get_emotional_journey function returns varchar[] instead of text[]
CREATE OR REPLACE FUNCTION get_emotional_journey(
  p_user_id UUID,
  p_days INTEGER DEFAULT 14
)
RETURNS TABLE (
  detected_date DATE,
  avg_frequency INTEGER,
  primary_emotions TEXT[],
  record_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(detected_at) AS detected_date,
    ROUND(AVG(frequency_hz))::INTEGER AS avg_frequency,
    ARRAY_AGG(DISTINCT primary_emotion::TEXT)::TEXT[] AS primary_emotions,
    COUNT(*)::INTEGER AS record_count
  FROM emotional_states
  WHERE user_id = p_user_id
    AND detected_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(detected_at)
  ORDER BY detected_date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_emotional_journey(UUID, INTEGER) TO authenticated;

-- FIX 2: search_memories function type mismatch (VARCHAR vs TEXT)
CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_query TEXT,
  p_memory_type VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  category TEXT,
  title TEXT,
  content TEXT,
  importance INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If query is empty, return recent memories
  IF p_query IS NULL OR TRIM(p_query) = '' THEN
    RETURN QUERY
    SELECT
      m.id,
      m.memory_type::TEXT,
      m.category::TEXT,
      m.title::TEXT,
      m.content,
      m.importance,
      m.created_at,
      1.0::FLOAT AS relevance_score
    FROM chat_memories m
    WHERE m.user_id = p_user_id
      AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
      AND (m.expires_at IS NULL OR m.expires_at > NOW())
    ORDER BY m.importance DESC, m.created_at DESC
    LIMIT p_limit;
    RETURN;
  END IF;

  -- Search with query
  RETURN QUERY
  SELECT
    m.id,
    m.memory_type::TEXT,
    m.category::TEXT,
    m.title::TEXT,
    m.content,
    m.importance,
    m.created_at,
    CASE
      WHEN m.content ILIKE '%' || p_query || '%' THEN 1.0
      WHEN m.title ILIKE '%' || p_query || '%' THEN 0.8
      WHEN m.summary ILIKE '%' || p_query || '%' THEN 0.6
      ELSE 0.0
    END::FLOAT AS relevance_score
  FROM chat_memories m
  WHERE m.user_id = p_user_id
    AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
    AND (
      m.content ILIKE '%' || p_query || '%'
      OR m.title ILIKE '%' || p_query || '%'
      OR m.summary ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance_score DESC, m.importance DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION search_memories(UUID, TEXT, VARCHAR, INTEGER) TO authenticated;

-- FIX 3: Ensure last_completion_date column exists in user_streaks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'last_completion_date'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN last_completion_date DATE;
  END IF;
END $$;

-- ============================================================
-- DONE - Reload app to test
-- ============================================================

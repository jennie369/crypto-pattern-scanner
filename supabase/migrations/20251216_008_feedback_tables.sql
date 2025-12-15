-- ═══════════════════════════════════════════════════════════════════════════
-- GEMRAL AI BRAIN - Phase 5: Continuous Learning & Feedback System
-- Migration: 008_feedback_tables.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. RESPONSE FEEDBACK TABLE
-- Stores user feedback (thumbs up/down) on AI responses
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_response_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Context
  feature TEXT NOT NULL,              -- 'chatbot', 'scanner', 'tarot', 'iching'
  session_id TEXT,
  conversation_id UUID,

  -- Query/Response
  query TEXT NOT NULL,
  response TEXT NOT NULL,

  -- Feedback
  rating TEXT NOT NULL CHECK (rating IN ('positive', 'negative')),
  feedback_type TEXT,                 -- 'incorrect', 'unhelpful', 'offensive', 'other'
  feedback_text TEXT,                 -- User's explanation

  -- RAG context (if used)
  rag_used BOOLEAN DEFAULT FALSE,
  sources_used TEXT[],
  sources_helpful BOOLEAN,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'new',          -- 'new', 'reviewed', 'actioned', 'dismissed'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_response_feedback_user ON ai_response_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_response_feedback_feature ON ai_response_feedback(feature);
CREATE INDEX IF NOT EXISTS idx_ai_response_feedback_rating ON ai_response_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_ai_response_feedback_status ON ai_response_feedback(status);
CREATE INDEX IF NOT EXISTS idx_ai_response_feedback_created ON ai_response_feedback(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. LEARNING UPDATES TABLE
-- Tracks changes made based on feedback
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_learning_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source
  feedback_id UUID REFERENCES ai_response_feedback(id),
  feedback_ids UUID[],                -- Multiple feedbacks that led to this update

  -- Update type
  update_type TEXT NOT NULL,          -- 'knowledge_added', 'prompt_updated', 'filter_added', 'pattern_adjusted'
  feature TEXT NOT NULL,              -- 'chatbot', 'scanner', 'tarot', etc.

  -- Change details
  description TEXT NOT NULL,
  change_summary TEXT,

  -- Before/After (for tracking)
  before_state JSONB,
  after_state JSONB,

  -- Impact
  affected_document_ids UUID[],
  affected_pattern_ids UUID[],

  -- Validation
  validation_status TEXT DEFAULT 'pending',  -- 'pending', 'validated', 'reverted'
  validation_notes TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FEEDBACK AGGREGATES (Daily stats)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_feedback_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL,
  feature TEXT NOT NULL,

  -- Counts
  total_feedback INT DEFAULT 0,
  positive_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,

  -- Satisfaction rate
  satisfaction_rate DECIMAL(5,2),      -- positive / total * 100

  -- Negative breakdown
  incorrect_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  offensive_count INT DEFAULT 0,
  other_count INT DEFAULT 0,

  -- RAG stats
  rag_used_count INT DEFAULT 0,
  rag_helpful_count INT DEFAULT 0,
  rag_satisfaction_rate DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stat_date, feature)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. PROMPT IMPROVEMENTS TABLE
-- Tracks prompt engineering improvements
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_prompt_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  feature TEXT NOT NULL,              -- 'chatbot', 'scanner_ai', etc.
  prompt_name TEXT NOT NULL,          -- 'system_prompt', 'trading_prompt', etc.

  -- Version tracking
  version INT NOT NULL,
  previous_version INT,

  -- Content
  prompt_content TEXT NOT NULL,
  change_description TEXT,

  -- Performance
  satisfaction_rate_before DECIMAL(5,2),
  satisfaction_rate_after DECIMAL(5,2),
  sample_size INT,

  -- Status
  status TEXT DEFAULT 'draft',        -- 'draft', 'testing', 'active', 'archived'
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_improvements_feature ON ai_prompt_improvements(feature);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_improvements_status ON ai_prompt_improvements(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RPC FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Submit feedback
CREATE OR REPLACE FUNCTION submit_ai_feedback(
  p_user_id UUID,
  p_feature TEXT,
  p_query TEXT,
  p_response TEXT,
  p_rating TEXT,
  p_feedback_type TEXT DEFAULT NULL,
  p_feedback_text TEXT DEFAULT NULL,
  p_rag_used BOOLEAN DEFAULT FALSE,
  p_sources_used TEXT[] DEFAULT NULL,
  p_sources_helpful BOOLEAN DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_feedback_id UUID;
BEGIN
  INSERT INTO ai_response_feedback (
    user_id, feature, query, response, rating,
    feedback_type, feedback_text, rag_used, sources_used,
    sources_helpful, session_id, metadata
  ) VALUES (
    p_user_id, p_feature, p_query, p_response, p_rating,
    p_feedback_type, p_feedback_text, p_rag_used, p_sources_used,
    p_sources_helpful, p_session_id, p_metadata
  )
  RETURNING id INTO v_feedback_id;

  -- Track knowledge gap if negative feedback
  IF p_rating = 'negative' AND p_feedback_type = 'incorrect' THEN
    PERFORM increment_knowledge_gap(p_query, p_user_id);
  END IF;

  RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get feedback stats
CREATE OR REPLACE FUNCTION get_feedback_stats(
  p_feature TEXT DEFAULT NULL,
  p_days INT DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_feedback', COUNT(*),
    'positive_count', COUNT(*) FILTER (WHERE rating = 'positive'),
    'negative_count', COUNT(*) FILTER (WHERE rating = 'negative'),
    'satisfaction_rate', ROUND(
      100.0 * COUNT(*) FILTER (WHERE rating = 'positive') /
      NULLIF(COUNT(*), 0),
      2
    ),
    'by_feature', (
      SELECT jsonb_object_agg(feature, stats)
      FROM (
        SELECT
          feature,
          jsonb_build_object(
            'total', COUNT(*),
            'positive', COUNT(*) FILTER (WHERE rating = 'positive'),
            'negative', COUNT(*) FILTER (WHERE rating = 'negative'),
            'satisfaction_rate', ROUND(
              100.0 * COUNT(*) FILTER (WHERE rating = 'positive') /
              NULLIF(COUNT(*), 0),
              2
            )
          ) as stats
        FROM ai_response_feedback
        WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
          AND (p_feature IS NULL OR feature = p_feature)
        GROUP BY feature
      ) t
    ),
    'negative_breakdown', (
      SELECT jsonb_object_agg(COALESCE(feedback_type, 'unspecified'), cnt)
      FROM (
        SELECT feedback_type, COUNT(*) as cnt
        FROM ai_response_feedback
        WHERE rating = 'negative'
          AND created_at > NOW() - (p_days || ' days')::INTERVAL
          AND (p_feature IS NULL OR feature = p_feature)
        GROUP BY feedback_type
      ) t
    ),
    'rag_stats', (
      SELECT jsonb_build_object(
        'total_with_rag', COUNT(*) FILTER (WHERE rag_used = TRUE),
        'rag_helpful', COUNT(*) FILTER (WHERE rag_used = TRUE AND sources_helpful = TRUE),
        'rag_satisfaction_rate', ROUND(
          100.0 * COUNT(*) FILTER (WHERE rag_used = TRUE AND rating = 'positive') /
          NULLIF(COUNT(*) FILTER (WHERE rag_used = TRUE), 0),
          2
        )
      )
    ),
    'trend', (
      SELECT jsonb_agg(row_to_json(t) ORDER BY t.date)
      FROM (
        SELECT
          DATE(created_at) as date,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE rating = 'positive') as positive,
          COUNT(*) FILTER (WHERE rating = 'negative') as negative
        FROM ai_response_feedback
        WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
          AND (p_feature IS NULL OR feature = p_feature)
        GROUP BY DATE(created_at)
      ) t
    )
  )
  INTO v_result
  FROM ai_response_feedback
  WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
    AND (p_feature IS NULL OR feature = p_feature);

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get negative feedback for review
CREATE OR REPLACE FUNCTION get_negative_feedback_for_review(
  p_feature TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT
        id,
        feature,
        query,
        response,
        feedback_type,
        feedback_text,
        rag_used,
        sources_used,
        created_at
      FROM ai_response_feedback
      WHERE rating = 'negative'
        AND status = 'new'
        AND (p_feature IS NULL OR feature = p_feature)
      ORDER BY created_at DESC
      LIMIT p_limit
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark feedback as reviewed
CREATE OR REPLACE FUNCTION review_feedback(
  p_feedback_id UUID,
  p_reviewer_id UUID,
  p_action_taken TEXT,
  p_status TEXT DEFAULT 'reviewed'
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ai_response_feedback
  SET
    status = p_status,
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    action_taken = p_action_taken,
    updated_at = NOW()
  WHERE id = p_feedback_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record learning update
CREATE OR REPLACE FUNCTION record_learning_update(
  p_feedback_id UUID,
  p_update_type TEXT,
  p_feature TEXT,
  p_description TEXT,
  p_change_summary TEXT DEFAULT NULL,
  p_before_state JSONB DEFAULT NULL,
  p_after_state JSONB DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_update_id UUID;
BEGIN
  INSERT INTO ai_learning_updates (
    feedback_id, update_type, feature, description,
    change_summary, before_state, after_state, created_by
  ) VALUES (
    p_feedback_id, p_update_type, p_feature, p_description,
    p_change_summary, p_before_state, p_after_state, p_created_by
  )
  RETURNING id INTO v_update_id;

  -- Mark feedback as actioned
  UPDATE ai_response_feedback
  SET
    status = 'actioned',
    updated_at = NOW()
  WHERE id = p_feedback_id;

  RETURN v_update_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE ai_response_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_improvements ENABLE ROW LEVEL SECURITY;

-- Users can see their own feedback
CREATE POLICY "Users can view own feedback"
  ON ai_response_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can submit feedback
CREATE POLICY "Users can submit feedback"
  ON ai_response_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all feedback
CREATE POLICY "Admin can manage all feedback"
  ON ai_response_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- Admin only for learning updates
CREATE POLICY "Admin can manage learning updates"
  ON ai_learning_updates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- Admin only for stats
CREATE POLICY "Admin can view feedback stats"
  ON ai_feedback_daily_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- Admin only for prompt improvements
CREATE POLICY "Admin can manage prompts"
  ON ai_prompt_improvements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = TRUE OR role = 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_ai_response_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_response_feedback_updated
  BEFORE UPDATE ON ai_response_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_response_feedback_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════

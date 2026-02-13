-- supabase/migrations/20251216_002_knowledge_tables.sql
-- Knowledge Base cho RAG System
-- GEMRAL AI BRAIN - Phase 1

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. KNOWLEDGE DOCUMENTS - Lưu tài liệu gốc
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'spiritual',      -- Phong thủy, I Ching, Tarot, Crystals
    'trading',        -- GEM Frequency, patterns, strategies
    'product',        -- App features, guides, FAQ
    'user_generated', -- User feedback, Q&A
    'market_data',    -- Market insights, analysis
    'research'        -- Research papers, studies
  )),
  category TEXT,      -- Sub-category
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,

  -- Content
  content TEXT NOT NULL,
  content_hash TEXT,  -- MD5 hash for deduplication

  -- Quality metrics
  quality_score FLOAT DEFAULT 0.5,  -- 0-1, updated by feedback
  usage_count INTEGER DEFAULT 0,    -- How often retrieved
  helpful_count INTEGER DEFAULT 0,  -- Thumbs up
  not_helpful_count INTEGER DEFAULT 0, -- Thumbs down

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft', 'review')),
  version INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_indexed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ -- For time-sensitive content
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_source_type
  ON ai_knowledge_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_status
  ON ai_knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_tags
  ON ai_knowledge_documents USING GIN(tags);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_knowledge_documents_hash
  ON ai_knowledge_documents(content_hash) WHERE content_hash IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. KNOWLEDGE CHUNKS - Lưu chunks đã embedding
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE,

  -- Content
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,  -- Vị trí trong document

  -- Embedding (1536 dimensions cho OpenAI text-embedding-3-small)
  embedding vector(1536),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,

  -- Quality
  retrieval_count INTEGER DEFAULT 0,  -- Times retrieved
  relevance_feedback FLOAT,           -- Avg relevance score

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index (IVFFlat for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_embedding
  ON ai_knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_document
  ON ai_knowledge_chunks(document_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. KNOWLEDGE GAPS - Track câu hỏi không trả lời được
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Query info
  query_text TEXT NOT NULL,
  query_embedding vector(1536),

  -- Context
  feature_context TEXT,  -- tarot, iching, trading, etc.
  user_id UUID REFERENCES auth.users(id),

  -- Statistics
  occurrence_count INTEGER DEFAULT 1,

  -- Resolution
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'ignored')),
  resolved_by_document_id UUID REFERENCES ai_knowledge_documents(id),
  resolution_notes TEXT,

  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_gaps_status ON ai_knowledge_gaps(status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_gaps_context ON ai_knowledge_gaps(feature_context);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Knowledge documents: Public read for active, admin write
ALTER TABLE ai_knowledge_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active knowledge" ON ai_knowledge_documents;
CREATE POLICY "Anyone can view active knowledge" ON ai_knowledge_documents
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role can manage knowledge" ON ai_knowledge_documents;
CREATE POLICY "Service role can manage knowledge" ON ai_knowledge_documents
  FOR ALL USING (auth.role() = 'service_role');

-- Knowledge chunks: Public read
ALTER TABLE ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view chunks" ON ai_knowledge_chunks;
CREATE POLICY "Anyone can view chunks" ON ai_knowledge_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_knowledge_documents
      WHERE id = ai_knowledge_chunks.document_id
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Service role can manage chunks" ON ai_knowledge_chunks;
CREATE POLICY "Service role can manage chunks" ON ai_knowledge_chunks
  FOR ALL USING (auth.role() = 'service_role');

-- Knowledge gaps: Users see own, admins see all
ALTER TABLE ai_knowledge_gaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gaps" ON ai_knowledge_gaps;
CREATE POLICY "Users can view own gaps" ON ai_knowledge_gaps
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can insert gaps" ON ai_knowledge_gaps;
CREATE POLICY "Users can insert gaps" ON ai_knowledge_gaps
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage gaps" ON ai_knowledge_gaps;
CREATE POLICY "Service role can manage gaps" ON ai_knowledge_gaps
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function: Vector similarity search
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT,
  source_type TEXT,
  category TEXT,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kd.source_type,
    kd.category,
    kd.title
  FROM ai_knowledge_chunks kc
  JOIN ai_knowledge_documents kd ON kd.id = kc.document_id
  WHERE
    kd.status = 'active'
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR kd.source_type = filter_source_type)
    AND (filter_category IS NULL OR kd.category = filter_category)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Increment knowledge gap occurrence
CREATE OR REPLACE FUNCTION increment_knowledge_gap(p_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_knowledge_gaps
  SET
    occurrence_count = occurrence_count + 1,
    last_seen_at = NOW()
  WHERE query_text = p_query;
END;
$$;

-- Function: Update chunk retrieval stats
CREATE OR REPLACE FUNCTION update_chunk_retrieval(
  p_chunk_ids UUID[],
  p_relevance_scores FLOAT[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..array_length(p_chunk_ids, 1) LOOP
    UPDATE ai_knowledge_chunks
    SET
      retrieval_count = retrieval_count + 1,
      relevance_feedback = COALESCE(
        (relevance_feedback * retrieval_count + p_relevance_scores[i]) / (retrieval_count + 1),
        p_relevance_scores[i]
      ),
      updated_at = NOW()
    WHERE id = p_chunk_ids[i];
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TRIGGER FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_ai_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ai_knowledge_documents_updated_at ON ai_knowledge_documents;
CREATE TRIGGER tr_ai_knowledge_documents_updated_at
  BEFORE UPDATE ON ai_knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION update_ai_knowledge_updated_at();

DROP TRIGGER IF EXISTS tr_ai_knowledge_chunks_updated_at ON ai_knowledge_chunks;
CREATE TRIGGER tr_ai_knowledge_chunks_updated_at
  BEFORE UPDATE ON ai_knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION update_ai_knowledge_updated_at();

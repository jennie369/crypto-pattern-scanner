-- PHASE 2A: FAQ Tables for Chatbot Automation
-- Supports keyword-based search and vector embeddings

-- Enable pgvector if not already (should be enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- FAQ Table
CREATE TABLE IF NOT EXISTS chatbot_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    keywords TEXT[] NOT NULL DEFAULT '{}',
    embedding vector(768),

    -- Analytics
    match_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for FAQ
CREATE INDEX IF NOT EXISTS idx_faq_category ON chatbot_faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_is_active ON chatbot_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_keywords ON chatbot_faq USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_priority ON chatbot_faq(priority DESC);

-- Vector index for semantic search (if embeddings are used)
CREATE INDEX IF NOT EXISTS idx_faq_embedding ON chatbot_faq
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function: Search FAQ by keywords
CREATE OR REPLACE FUNCTION search_faq_keywords(
    p_keywords TEXT[],
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    category VARCHAR(50),
    keywords TEXT[],
    match_score FLOAT,
    match_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.question,
        f.answer,
        f.category,
        f.keywords,
        -- Calculate match score based on keyword overlap
        (
            SELECT COUNT(*)::FLOAT / GREATEST(array_length(p_keywords, 1), 1)
            FROM unnest(p_keywords) k
            WHERE k = ANY(f.keywords)
        ) AS match_score,
        f.match_count
    FROM chatbot_faq f
    WHERE f.is_active = true
        AND (p_category IS NULL OR f.category = p_category)
        AND f.keywords && p_keywords  -- Array overlap operator
    ORDER BY match_score DESC, f.priority DESC, f.match_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment FAQ match count
CREATE OR REPLACE FUNCTION increment_faq_match(p_faq_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE chatbot_faq
    SET match_count = match_count + 1,
        updated_at = NOW()
    WHERE id = p_faq_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Record FAQ feedback
CREATE OR REPLACE FUNCTION record_faq_feedback(
    p_faq_id UUID,
    p_helpful BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    IF p_helpful THEN
        UPDATE chatbot_faq
        SET helpful_count = helpful_count + 1,
            updated_at = NOW()
        WHERE id = p_faq_id;
    ELSE
        UPDATE chatbot_faq
        SET not_helpful_count = not_helpful_count + 1,
            updated_at = NOW()
        WHERE id = p_faq_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Search FAQ by vector similarity (for future use)
CREATE OR REPLACE FUNCTION search_faq_vector(
    p_query_embedding vector(768),
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5,
    p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    question TEXT,
    answer TEXT,
    category VARCHAR(50),
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.question,
        f.answer,
        f.category,
        1 - (f.embedding <=> p_query_embedding) AS similarity
    FROM chatbot_faq f
    WHERE f.is_active = true
        AND f.embedding IS NOT NULL
        AND (p_category IS NULL OR f.category = p_category)
        AND 1 - (f.embedding <=> p_query_embedding) >= p_threshold
    ORDER BY f.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE chatbot_faq ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "faq_read_policy" ON chatbot_faq
    FOR SELECT
    USING (is_active = true);

-- Allow full access for service role
CREATE POLICY "faq_service_policy" ON chatbot_faq
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Update trigger
CREATE OR REPLACE FUNCTION update_faq_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faq_updated_at
    BEFORE UPDATE ON chatbot_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_timestamp();

COMMENT ON TABLE chatbot_faq IS 'FAQ entries for automated chatbot responses';
COMMENT ON FUNCTION search_faq_keywords IS 'Search FAQs by keyword matching';
COMMENT ON FUNCTION search_faq_vector IS 'Search FAQs by vector similarity (semantic search)';

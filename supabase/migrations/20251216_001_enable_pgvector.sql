-- supabase/migrations/20251216_001_enable_pgvector.sql
-- Enable pgvector extension for vector similarity search
-- GEMRAL AI BRAIN - Phase 1

-- ═══════════════════════════════════════════════════════════════════════════
-- ENABLE PGVECTOR EXTENSION
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if extension exists first
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
DO $$
DECLARE
  ext_version TEXT;
BEGIN
  SELECT extversion INTO ext_version FROM pg_extension WHERE extname = 'vector';
  IF ext_version IS NOT NULL THEN
    RAISE NOTICE 'pgvector extension enabled successfully. Version: %', ext_version;
  ELSE
    RAISE EXCEPTION 'pgvector extension failed to install';
  END IF;
END $$;

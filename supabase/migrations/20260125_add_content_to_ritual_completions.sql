-- =====================================================
-- Add content column to vision_ritual_completions
-- Created: January 25, 2026
-- Purpose: Store ritual content data (letter text, affirmations, etc.)
-- =====================================================

-- Add content column if not exists
ALTER TABLE vision_ritual_completions
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN vision_ritual_completions.content IS 'JSONB field to store ritual content like letter text, affirmations, reflection, etc.';

-- Create index for JSONB queries (if needed)
CREATE INDEX IF NOT EXISTS idx_vision_ritual_completions_content
ON vision_ritual_completions USING GIN (content)
WHERE content IS NOT NULL AND content != '{}'::jsonb;

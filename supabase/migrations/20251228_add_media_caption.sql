-- ============================================================
-- ADD CAPTION COLUMN TO MESSAGES
-- ============================================================
-- Allow users to add captions to media messages (images, videos)
-- Phase 1C: Photo/Video Caption

-- Add caption column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'caption'
    ) THEN
        ALTER TABLE messages ADD COLUMN caption TEXT;
    END IF;
END $$;

-- Add index for caption search (full-text search)
-- Note: Using 'simple' config as 'vietnamese' is not available by default in Supabase
CREATE INDEX IF NOT EXISTS idx_messages_caption
ON messages USING gin(to_tsvector('simple', coalesce(caption, '')));

-- Add comment for documentation
COMMENT ON COLUMN messages.caption IS 'Optional caption text for media messages (images, videos). Max 1000 characters.';

-- ============================================================
-- USAGE:
-- When sending a media message, include caption field:
-- INSERT INTO messages (conversation_id, sender_id, content, message_type, attachment_url, caption)
-- VALUES (?, ?, '', 'image', 'https://...', 'My caption text');
-- ============================================================

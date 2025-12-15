-- Migration: Add columns for chat history features
-- Created: 2025-11-26

-- Add new columns to chatbot_conversations table
ALTER TABLE chatbot_conversations
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'New Chat',
ADD COLUMN IF NOT EXISTS preview TEXT,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for efficient history queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_user_history') THEN
    CREATE INDEX idx_conversations_user_history
    ON chatbot_conversations(user_id, last_message_at DESC)
    WHERE is_archived = FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_archived') THEN
    CREATE INDEX idx_conversations_archived
    ON chatbot_conversations(user_id, is_archived);
  END IF;
END $$;

-- Update existing rows to have proper last_message_at
UPDATE chatbot_conversations
SET last_message_at = COALESCE(updated_at, started_at, NOW())
WHERE last_message_at IS NULL;

-- Comment on new columns
COMMENT ON COLUMN chatbot_conversations.title IS 'Auto-generated title from first user message';
COMMENT ON COLUMN chatbot_conversations.preview IS 'Preview text from last message (max 100 chars)';
COMMENT ON COLUMN chatbot_conversations.message_count IS 'Number of messages in conversation';
COMMENT ON COLUMN chatbot_conversations.is_archived IS 'Whether conversation is archived';
COMMENT ON COLUMN chatbot_conversations.last_message_at IS 'Timestamp of last message for sorting';

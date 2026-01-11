-- ============================================================
-- MESSAGE MENTIONS TABLE
-- ============================================================
-- Store @mentions in messages for notification and highlighting
-- Phase 1D: @Mentions System

-- Create mentions table
CREATE TABLE IF NOT EXISTS message_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  start_index INTEGER NOT NULL, -- Position in text where mention starts
  end_index INTEGER NOT NULL,   -- Position in text where mention ends
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each mention is unique per message, user, and position
  UNIQUE(message_id, mentioned_user_id, start_index)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_mentions_message_id ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user_id ON message_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_conversation_id ON message_mentions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mentions_is_read ON message_mentions(is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "select_mentions_in_conversations" ON message_mentions;
DROP POLICY IF EXISTS "insert_mentions_own_messages" ON message_mentions;
DROP POLICY IF EXISTS "update_own_mentions" ON message_mentions;

-- RLS Policies
-- Users can view mentions in conversations they're part of
CREATE POLICY "select_mentions_in_conversations" ON message_mentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = message_mentions.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can insert mentions in their own messages
CREATE POLICY "insert_mentions_own_messages" ON message_mentions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE id = message_mentions.message_id
      AND sender_id = auth.uid()
    )
  );

-- Users can update mentions of themselves (mark as read)
CREATE POLICY "update_own_mentions" ON message_mentions
  FOR UPDATE USING (mentioned_user_id = auth.uid());

-- Enable realtime for mentions (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE message_mentions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- HELPER FUNCTION: Get unread mention count for a user
-- ============================================================
CREATE OR REPLACE FUNCTION get_unread_mention_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM message_mentions
    WHERE mentioned_user_id = user_id_param
    AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USAGE:
-- Insert mention when sending message:
-- INSERT INTO message_mentions (message_id, mentioned_user_id, conversation_id, start_index, end_index)
-- VALUES (?, ?, ?, 4, 15);
--
-- Mark mentions as read:
-- UPDATE message_mentions SET is_read = TRUE
-- WHERE mentioned_user_id = ? AND conversation_id = ?;
-- ============================================================

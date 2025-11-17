-- =====================================================
-- MESSAGE READ RECEIPTS
-- =====================================================
-- Track when messages are read by recipients

-- Step 1: Add read tracking columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS read_by UUID REFERENCES auth.users(id);

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at
ON messages(read_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_read
ON messages(conversation_id, read_at);

-- Step 3: Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Update unread messages in the conversation
  UPDATE messages
  SET
    read_at = NOW(),
    read_by = p_user_id
  WHERE
    conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read_at IS NULL;

  GET DIAGNOSTICS affected_count = ROW_COUNT;

  RETURN affected_count;
END;
$$;

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('read_at', 'read_by');

-- Check if function was created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'mark_messages_as_read';

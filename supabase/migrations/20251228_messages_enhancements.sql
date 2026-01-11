-- ============================================================
-- GEM MESSAGES - ENHANCED FEATURES
-- File: supabase/migrations/20251228_messages_enhancements.sql
-- Description: Add missing columns and functions for advanced messaging
-- ============================================================

-- ============================================================
-- 1. ENHANCE MESSAGES TABLE
-- ============================================================

-- Add reply_to column for message replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'reply_to_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add forwarded_from column for forwarded messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'forwarded_from_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN forwarded_from_id UUID REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add voice_url column for voice messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'voice_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN voice_url TEXT;
  END IF;
END $$;

-- Add voice_duration column for voice messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'voice_duration'
  ) THEN
    ALTER TABLE messages ADD COLUMN voice_duration INTEGER; -- Duration in seconds
  END IF;
END $$;

-- Add video_url column for video messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN video_url TEXT;
  END IF;
END $$;

-- Add video_thumbnail column for video messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'video_thumbnail'
  ) THEN
    ALTER TABLE messages ADD COLUMN video_thumbnail TEXT;
  END IF;
END $$;

-- Add pinned_at column for pinned messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'pinned_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN pinned_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add pinned_by column for who pinned the message
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'pinned_by'
  ) THEN
    ALTER TABLE messages ADD COLUMN pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add scheduled_at column for scheduled messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN scheduled_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add is_scheduled column for scheduled messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_scheduled'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_scheduled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add disappear_after column for disappearing messages (in seconds)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'disappear_after'
  ) THEN
    ALTER TABLE messages ADD COLUMN disappear_after INTEGER; -- Time in seconds after which message disappears
  END IF;
END $$;

-- Add edited_at column for edited messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE messages ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add original_content column for edited messages (to show edit history)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'original_content'
  ) THEN
    ALTER TABLE messages ADD COLUMN original_content TEXT;
  END IF;
END $$;

-- Add is_starred column for starred messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_starred'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_starred BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add link_preview column for link previews (JSONB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'link_preview'
  ) THEN
    ALTER TABLE messages ADD COLUMN link_preview JSONB;
    -- Example: {"url": "...", "title": "...", "description": "...", "image": "..."}
  END IF;
END $$;

-- Update message_type constraint to include voice, video
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;

  -- Add new constraint with all types
  ALTER TABLE messages ADD CONSTRAINT messages_message_type_check
    CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio', 'voice', 'sticker', 'gif', 'location', 'contact', 'call'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ============================================================
-- 2. ENHANCE CONVERSATION PARTICIPANTS TABLE
-- ============================================================

-- Add role column for group chat roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'role'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN role TEXT DEFAULT 'member'
      CHECK (role IN ('owner', 'admin', 'member'));
  END IF;
END $$;

-- Add is_muted column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'is_muted'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN is_muted BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add muted_until column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'muted_until'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN muted_until TIMESTAMPTZ;
  END IF;
END $$;

-- Add can_send_messages column (for read-only members)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'can_send_messages'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN can_send_messages BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add nickname column (custom display name in this conversation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN nickname TEXT;
  END IF;
END $$;

-- Add notification_setting column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'notification_setting'
  ) THEN
    ALTER TABLE conversation_participants ADD COLUMN notification_setting TEXT DEFAULT 'all'
      CHECK (notification_setting IN ('all', 'mentions', 'none'));
  END IF;
END $$;

-- ============================================================
-- 3. ENHANCE CONVERSATIONS TABLE
-- ============================================================

-- Add typing_users column (array of user IDs currently typing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'typing_users'
  ) THEN
    ALTER TABLE conversations ADD COLUMN typing_users UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Add avatar_url column for group chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE conversations ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add description column for group chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'description'
  ) THEN
    ALTER TABLE conversations ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add last_message_preview column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'last_message_preview'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_preview TEXT;
  END IF;
END $$;

-- Add last_message_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add is_archived column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE conversations ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add pinned_at column for pinned conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'pinned_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN pinned_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add disappearing_messages_duration column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'disappearing_messages_duration'
  ) THEN
    ALTER TABLE conversations ADD COLUMN disappearing_messages_duration INTEGER; -- Duration in seconds
  END IF;
END $$;

-- Add theme column for chat themes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'theme'
  ) THEN
    ALTER TABLE conversations ADD COLUMN theme TEXT DEFAULT 'default';
  END IF;
END $$;

-- ============================================================
-- 4. ADD INDEXES
-- ============================================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_forwarded_from ON messages(forwarded_from_id) WHERE forwarded_from_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(conversation_id, pinned_at) WHERE pinned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_scheduled ON messages(scheduled_at) WHERE is_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_starred ON messages(conversation_id, is_starred) WHERE is_starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_voice ON messages(conversation_id) WHERE voice_url IS NOT NULL;

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_archived ON conversations(is_archived) WHERE is_archived = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(pinned_at) WHERE pinned_at IS NOT NULL;

-- ============================================================
-- 5. FUNCTIONS
-- ============================================================

-- Drop existing functions to avoid signature conflicts
DROP FUNCTION IF EXISTS get_or_create_dm_conversation(UUID, UUID);
DROP FUNCTION IF EXISTS create_group_chat(UUID, UUID[], TEXT, TEXT);
DROP FUNCTION IF EXISTS create_group_chat(UUID, UUID[], TEXT);
DROP FUNCTION IF EXISTS create_group_chat(UUID, UUID[]);
DROP FUNCTION IF EXISTS set_typing_status(UUID, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS toggle_pin_message(UUID, UUID);
DROP FUNCTION IF EXISTS get_pinned_messages(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_pinned_messages(UUID);
DROP FUNCTION IF EXISTS forward_message(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS edit_message(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS search_messages(UUID, TEXT, UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS search_messages(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS search_messages(UUID, TEXT);

-- Function: Get or create 1-1 DM conversation
CREATE OR REPLACE FUNCTION get_or_create_dm_conversation(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_ids UUID[];
BEGIN
  -- Create sorted participant array for consistent lookup
  v_participant_ids := ARRAY(SELECT unnest(ARRAY[p_user_id_1, p_user_id_2]) ORDER BY 1);

  -- Check if conversation already exists
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE is_group = FALSE
    AND participant_ids @> v_participant_ids
    AND participant_ids <@ v_participant_ids;

  -- If exists, return it
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (participant_ids, created_by, is_group)
  VALUES (v_participant_ids, p_user_id_1, FALSE)
  RETURNING id INTO v_conversation_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (v_conversation_id, p_user_id_1),
    (v_conversation_id, p_user_id_2);

  RETURN v_conversation_id;
END;
$$;

-- Function: Create group chat
CREATE OR REPLACE FUNCTION create_group_chat(
  p_creator_id UUID,
  p_member_ids UUID[],
  p_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
  v_all_members UUID[];
  v_member_id UUID;
BEGIN
  -- Include creator in members if not already
  v_all_members := ARRAY(SELECT DISTINCT unnest(array_append(p_member_ids, p_creator_id)));

  -- Create conversation
  INSERT INTO conversations (
    participant_ids,
    created_by,
    is_group,
    name,
    avatar_url
  )
  VALUES (v_all_members, p_creator_id, TRUE, p_name, p_avatar_url)
  RETURNING id INTO v_conversation_id;

  -- Add creator as owner
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES (v_conversation_id, p_creator_id, 'owner');

  -- Add other members
  FOREACH v_member_id IN ARRAY p_member_ids
  LOOP
    IF v_member_id != p_creator_id THEN
      INSERT INTO conversation_participants (conversation_id, user_id, role)
      VALUES (v_conversation_id, v_member_id, 'member');
    END IF;
  END LOOP;

  RETURN v_conversation_id;
END;
$$;

-- Function: Set typing status
CREATE OR REPLACE FUNCTION set_typing_status(
  p_conversation_id UUID,
  p_user_id UUID,
  p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_is_typing THEN
    UPDATE conversations
    SET typing_users = array_append(
      array_remove(typing_users, p_user_id),
      p_user_id
    )
    WHERE id = p_conversation_id;
  ELSE
    UPDATE conversations
    SET typing_users = array_remove(typing_users, p_user_id)
    WHERE id = p_conversation_id;
  END IF;
END;
$$;

-- Function: Pin/unpin message
CREATE OR REPLACE FUNCTION toggle_pin_message(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_pinned BOOLEAN;
BEGIN
  -- Check current pin status
  SELECT (pinned_at IS NOT NULL) INTO v_is_pinned
  FROM messages
  WHERE id = p_message_id;

  IF v_is_pinned THEN
    -- Unpin
    UPDATE messages
    SET pinned_at = NULL, pinned_by = NULL
    WHERE id = p_message_id;

    RETURN jsonb_build_object('success', true, 'pinned', false);
  ELSE
    -- Pin
    UPDATE messages
    SET pinned_at = NOW(), pinned_by = p_user_id
    WHERE id = p_message_id;

    RETURN jsonb_build_object('success', true, 'pinned', true);
  END IF;
END;
$$;

-- Function: Get pinned messages in conversation
CREATE OR REPLACE FUNCTION get_pinned_messages(
  p_conversation_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  message_type TEXT,
  pinned_at TIMESTAMPTZ,
  pinned_by UUID,
  sender JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.message_type,
    m.pinned_at,
    m.pinned_by,
    jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url
    ) AS sender
  FROM messages m
  JOIN profiles p ON p.id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND m.pinned_at IS NOT NULL
  ORDER BY m.pinned_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Forward message
CREATE OR REPLACE FUNCTION forward_message(
  p_message_id UUID,
  p_to_conversation_id UUID,
  p_sender_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_original RECORD;
  v_new_message_id UUID;
BEGIN
  -- Get original message
  SELECT * INTO v_original FROM messages WHERE id = p_message_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found';
  END IF;

  -- Create forwarded message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    attachment_url,
    attachment_name,
    attachment_type,
    attachment_size,
    voice_url,
    voice_duration,
    video_url,
    video_thumbnail,
    sticker_id,
    giphy_id,
    giphy_url,
    forwarded_from_id
  )
  VALUES (
    p_to_conversation_id,
    p_sender_id,
    v_original.content,
    v_original.message_type,
    v_original.attachment_url,
    v_original.attachment_name,
    v_original.attachment_type,
    v_original.attachment_size,
    v_original.voice_url,
    v_original.voice_duration,
    v_original.video_url,
    v_original.video_thumbnail,
    v_original.sticker_id,
    v_original.giphy_id,
    v_original.giphy_url,
    p_message_id
  )
  RETURNING id INTO v_new_message_id;

  RETURN v_new_message_id;
END;
$$;

-- Function: Edit message
CREATE OR REPLACE FUNCTION edit_message(
  p_message_id UUID,
  p_new_content TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_original_content TEXT;
BEGIN
  -- Get and verify ownership
  SELECT content INTO v_original_content
  FROM messages
  WHERE id = p_message_id AND sender_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Message not found or not owned by user');
  END IF;

  -- Update message
  UPDATE messages
  SET
    content = p_new_content,
    edited_at = NOW(),
    original_content = COALESCE(original_content, v_original_content)
  WHERE id = p_message_id;

  RETURN jsonb_build_object('success', true, 'edited_at', NOW());
END;
$$;

-- Function: Search messages
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_conversation_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  content TEXT,
  message_type TEXT,
  created_at TIMESTAMPTZ,
  sender JSONB,
  conversation_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.content,
    m.message_type,
    m.created_at,
    jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'avatar_url', p.avatar_url
    ) AS sender,
    c.name AS conversation_name
  FROM messages m
  JOIN profiles p ON p.id = m.sender_id
  JOIN conversations c ON c.id = m.conversation_id
  JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  WHERE
    m.content ILIKE '%' || p_query || '%'
    AND (p_conversation_id IS NULL OR m.conversation_id = p_conversation_id)
    AND m.is_deleted = FALSE
  ORDER BY m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function: Update last message preview
CREATE OR REPLACE FUNCTION update_last_message_preview()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_preview = CASE
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100)
      WHEN NEW.message_type = 'image' THEN 'Sent a photo'
      WHEN NEW.message_type = 'video' THEN 'Sent a video'
      WHEN NEW.message_type = 'voice' THEN 'Sent a voice message'
      WHEN NEW.message_type = 'file' THEN 'Sent a file'
      WHEN NEW.message_type = 'sticker' THEN 'Sent a sticker'
      WHEN NEW.message_type = 'gif' THEN 'Sent a GIF'
      WHEN NEW.message_type = 'location' THEN 'Shared a location'
      ELSE 'New message'
    END,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last message preview
DROP TRIGGER IF EXISTS trigger_update_last_message ON messages;
CREATE TRIGGER trigger_update_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_message_preview();

-- ============================================================
-- 6. GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_or_create_dm_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_group_chat(UUID, UUID[], TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_typing_status(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_pin_message(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pinned_messages(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION forward_message(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION edit_message(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_messages(UUID, TEXT, UUID, INTEGER, INTEGER) TO authenticated;

-- ============================================================
-- 7. ENABLE REALTIME FOR CONVERSATIONS
-- ============================================================

-- Already enabled from base migration, but ensure it's there
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION get_or_create_dm_conversation IS 'Get existing 1-1 DM conversation or create new one';
COMMENT ON FUNCTION create_group_chat IS 'Create a new group chat conversation';
COMMENT ON FUNCTION set_typing_status IS 'Update typing indicator for a user in a conversation';
COMMENT ON FUNCTION toggle_pin_message IS 'Pin or unpin a message';
COMMENT ON FUNCTION get_pinned_messages IS 'Get all pinned messages in a conversation';
COMMENT ON FUNCTION forward_message IS 'Forward a message to another conversation';
COMMENT ON FUNCTION edit_message IS 'Edit message content (saves original)';
COMMENT ON FUNCTION search_messages IS 'Search messages across user conversations';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Messages enhancements migration completed!';
  RAISE NOTICE '📝 New message columns: reply_to, forwarded_from, voice, video, pin, schedule, edit';
  RAISE NOTICE '👥 New conversation columns: typing_users, avatar, description, theme';
  RAISE NOTICE '⚡ New functions: get_or_create_dm_conversation, create_group_chat, forward_message, edit_message, search_messages';
END $$;

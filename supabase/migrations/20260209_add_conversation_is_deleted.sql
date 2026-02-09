-- =====================================================
-- ADD is_deleted TO conversation_settings
-- Enables per-user soft delete for conversations
-- Cross-device consistent deletion
-- =====================================================

-- 1. Add is_deleted column to conversation_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'conversation_settings' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE public.conversation_settings ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.conversation_settings ADD COLUMN deleted_at TIMESTAMPTZ;

    -- Index for filtering deleted conversations
    CREATE INDEX IF NOT EXISTS idx_conv_settings_deleted
      ON public.conversation_settings(user_id, is_deleted)
      WHERE is_deleted = TRUE;

    RAISE NOTICE 'Added is_deleted and deleted_at columns to conversation_settings';
  END IF;
END $$;

-- 2. Create helper function to soft delete conversation (per-user)
CREATE OR REPLACE FUNCTION soft_delete_conversation(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.conversation_settings (conversation_id, user_id, is_deleted, deleted_at, updated_at)
  VALUES (p_conversation_id, auth.uid(), TRUE, NOW(), NOW())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET
    is_deleted = TRUE,
    deleted_at = NOW(),
    updated_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create helper function to restore deleted conversation
CREATE OR REPLACE FUNCTION restore_deleted_conversation(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.conversation_settings
  SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get user's deleted conversation IDs
CREATE OR REPLACE FUNCTION get_deleted_conversation_ids()
RETURNS TABLE (conversation_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.conversation_id
  FROM public.conversation_settings cs
  WHERE cs.user_id = auth.uid()
  AND cs.is_deleted = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Comments
COMMENT ON COLUMN public.conversation_settings.is_deleted IS 'Per-user soft delete flag for conversation';
COMMENT ON COLUMN public.conversation_settings.deleted_at IS 'Timestamp when user deleted this conversation';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Conversation soft delete feature added successfully!';
  RAISE NOTICE '📌 New columns: is_deleted, deleted_at';
  RAISE NOTICE '📌 New functions: soft_delete_conversation, restore_deleted_conversation, get_deleted_conversation_ids';
END $$;

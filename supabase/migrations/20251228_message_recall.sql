-- =====================================================
-- MESSAGE RECALL FEATURE
-- Phase 2: Add recall columns to messages table
-- =====================================================

-- Add recall columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_recalled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMPTZ;

-- Index for filtering recalled messages
CREATE INDEX IF NOT EXISTS idx_messages_is_recalled
ON public.messages(is_recalled)
WHERE is_recalled = TRUE;

-- Update message_type check to include more types
-- First drop the old constraint if it exists
DO $$
BEGIN
  ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add updated constraint with all types
ALTER TABLE public.messages
ADD CONSTRAINT messages_message_type_check
CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio', 'sticker', 'gif'));

-- =====================================================
-- FUNCTION: Recall a message
-- =====================================================
CREATE OR REPLACE FUNCTION recall_message(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_message RECORD;
  v_diff_hours NUMERIC;
  v_time_limit INTEGER;
BEGIN
  -- Fetch message
  SELECT * INTO v_message
  FROM public.messages
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tin nhắn không tồn tại');
  END IF;

  -- Check ownership
  IF v_message.sender_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bạn chỉ có thể thu hồi tin nhắn của mình');
  END IF;

  -- Check if already recalled
  IF v_message.is_recalled = TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tin nhắn đã được thu hồi');
  END IF;

  -- Calculate time difference in hours
  v_diff_hours := EXTRACT(EPOCH FROM (NOW() - v_message.created_at)) / 3600;

  -- Set time limit based on message type (1h for media, 24h for text)
  IF v_message.message_type IN ('image', 'video', 'audio', 'file') THEN
    v_time_limit := 1;
  ELSE
    v_time_limit := 24;
  END IF;

  -- Check time limit
  IF v_diff_hours > v_time_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Đã quá thời gian thu hồi (%s giờ)', v_time_limit)
    );
  END IF;

  -- Update message
  UPDATE public.messages
  SET
    is_recalled = TRUE,
    recalled_at = NOW(),
    content = NULL,
    caption = NULL
  WHERE id = p_message_id;

  -- Delete reactions for this message
  DELETE FROM public.message_reactions
  WHERE message_id = p_message_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Check if message can be recalled
-- =====================================================
CREATE OR REPLACE FUNCTION can_recall_message(
  p_message_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_message RECORD;
  v_diff_ms NUMERIC;
  v_time_limit_ms NUMERIC;
  v_remaining_ms NUMERIC;
BEGIN
  SELECT * INTO v_message
  FROM public.messages
  WHERE id = p_message_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('canRecall', false, 'reason', 'Message not found');
  END IF;

  IF v_message.sender_id != p_user_id THEN
    RETURN jsonb_build_object('canRecall', false, 'reason', 'Không phải tin nhắn của bạn');
  END IF;

  IF v_message.is_recalled = TRUE THEN
    RETURN jsonb_build_object('canRecall', false, 'reason', 'Đã thu hồi');
  END IF;

  -- Calculate in milliseconds
  v_diff_ms := EXTRACT(EPOCH FROM (NOW() - v_message.created_at)) * 1000;

  -- Time limit in ms (1h = 3600000ms for media, 24h = 86400000ms for text)
  IF v_message.message_type IN ('image', 'video', 'audio', 'file') THEN
    v_time_limit_ms := 3600000;
  ELSE
    v_time_limit_ms := 86400000;
  END IF;

  IF v_diff_ms > v_time_limit_ms THEN
    RETURN jsonb_build_object('canRecall', false, 'reason', 'Đã hết thời gian thu hồi');
  END IF;

  v_remaining_ms := v_time_limit_ms - v_diff_ms;

  RETURN jsonb_build_object('canRecall', true, 'remainingTime', v_remaining_ms);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.messages.is_recalled IS 'Whether message has been recalled/unsent';
COMMENT ON COLUMN public.messages.recalled_at IS 'Timestamp when message was recalled';

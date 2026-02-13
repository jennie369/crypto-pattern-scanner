-- =====================================================
-- CONVERSATION SETTINGS TABLE
-- Phase 2: Per-user per-conversation settings
-- Includes: themes, pinned conversations, mute settings
-- =====================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.conversation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Theme settings
  theme_id VARCHAR(50) DEFAULT 'crystal',
  custom_background_url TEXT,

  -- Notification settings
  notification_sound VARCHAR(100) DEFAULT 'default',
  mute_until TIMESTAMPTZ,

  -- Pin settings
  is_pinned BOOLEAN DEFAULT FALSE,
  pin_order INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint per user per conversation
  CONSTRAINT unique_conv_user_settings UNIQUE (conversation_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conv_settings_conv
  ON public.conversation_settings(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conv_settings_user
  ON public.conversation_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_conv_settings_pinned
  ON public.conversation_settings(user_id, is_pinned)
  WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_conv_settings_theme
  ON public.conversation_settings(theme_id);

-- Enable RLS
ALTER TABLE public.conversation_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own conversation settings" ON public.conversation_settings;
DROP POLICY IF EXISTS "Users can view conversation settings" ON public.conversation_settings;

-- Policy: Users can manage their own settings (full CRUD)
CREATE POLICY "Users can manage own conversation settings"
  ON public.conversation_settings FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Users can view settings in conversations they participate in (for theme sync)
CREATE POLICY "Users can view conversation settings"
  ON public.conversation_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversation_settings.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_conv_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS conv_settings_updated ON public.conversation_settings;
CREATE TRIGGER conv_settings_updated
  BEFORE UPDATE ON public.conversation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_conv_settings_timestamp();

-- Enable realtime (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversation_settings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get pinned conversations for a user
CREATE OR REPLACE FUNCTION get_pinned_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  pin_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.conversation_id, cs.pin_order
  FROM public.conversation_settings cs
  WHERE cs.user_id = p_user_id
  AND cs.is_pinned = TRUE
  ORDER BY cs.pin_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pin a conversation (with max 5 limit)
CREATE OR REPLACE FUNCTION pin_conversation(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_pinned_count INTEGER;
  v_max_order INTEGER;
BEGIN
  -- Check current pinned count
  SELECT COUNT(*) INTO v_pinned_count
  FROM public.conversation_settings
  WHERE user_id = p_user_id
  AND is_pinned = TRUE;

  IF v_pinned_count >= 5 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Chỉ có thể ghim tối đa 5 cuộc trò chuyện'
    );
  END IF;

  -- Get max pin order
  SELECT COALESCE(MAX(pin_order), 0) INTO v_max_order
  FROM public.conversation_settings
  WHERE user_id = p_user_id
  AND is_pinned = TRUE;

  -- Upsert settings
  INSERT INTO public.conversation_settings (
    conversation_id, user_id, is_pinned, pin_order
  ) VALUES (
    p_conversation_id, p_user_id, TRUE, v_max_order + 1
  )
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET
    is_pinned = TRUE,
    pin_order = v_max_order + 1,
    updated_at = NOW();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unpin a conversation
CREATE OR REPLACE FUNCTION unpin_conversation(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.conversation_settings
  SET
    is_pinned = FALSE,
    pin_order = NULL,
    updated_at = NOW()
  WHERE conversation_id = p_conversation_id
  AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set chat theme
CREATE OR REPLACE FUNCTION set_chat_theme(
  p_conversation_id UUID,
  p_user_id UUID,
  p_theme_id VARCHAR(50)
)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO public.conversation_settings (
    conversation_id, user_id, theme_id
  ) VALUES (
    p_conversation_id, p_user_id, p_theme_id
  )
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET
    theme_id = p_theme_id,
    updated_at = NOW();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.conversation_settings IS 'Per-user settings for each conversation (themes, pins, mute)';

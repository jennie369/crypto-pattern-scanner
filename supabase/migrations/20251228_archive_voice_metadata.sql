-- =====================================================
-- ARCHIVE COLUMN + VOICE MESSAGE METADATA
-- =====================================================

-- 1. Add is_archived to conversation_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'conversation_settings' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE public.conversation_settings ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    CREATE INDEX IF NOT EXISTS idx_conv_settings_archived
      ON public.conversation_settings(user_id, is_archived)
      WHERE is_archived = TRUE;
    RAISE NOTICE 'Added is_archived column';
  END IF;
END $$;

-- 2. Create voice_message_metadata table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'voice_message_metadata') THEN

    CREATE TABLE public.voice_message_metadata (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      message_id UUID NOT NULL UNIQUE,
      duration_ms INTEGER NOT NULL DEFAULT 0,
      waveform JSONB DEFAULT '[]',

      -- Transcription data
      transcription TEXT,
      transcription_status VARCHAR(20) DEFAULT 'pending',
      transcription_language VARCHAR(10) DEFAULT 'vi',
      transcription_confidence FLOAT,
      transcription_error TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT fk_voice_metadata_message
        FOREIGN KEY (message_id)
        REFERENCES public.messages(id)
        ON DELETE CASCADE,

      CONSTRAINT valid_transcription_status
        CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'))
    );

    RAISE NOTICE 'Created voice_message_metadata table';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voice_metadata_message
  ON public.voice_message_metadata(message_id);

CREATE INDEX IF NOT EXISTS idx_voice_metadata_status
  ON public.voice_message_metadata(transcription_status)
  WHERE transcription_status IN ('pending', 'processing');

-- RLS
ALTER TABLE public.voice_message_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view voice metadata in their conversations" ON public.voice_message_metadata;
DROP POLICY IF EXISTS "Users can insert voice metadata for own messages" ON public.voice_message_metadata;
DROP POLICY IF EXISTS "Users can update voice metadata for own messages" ON public.voice_message_metadata;

CREATE POLICY "Users can view voice metadata in their conversations"
  ON public.voice_message_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = voice_message_metadata.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert voice metadata for own messages"
  ON public.voice_message_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = voice_message_metadata.message_id
      AND m.sender_id = auth.uid()
    )
  );

CREATE POLICY "Service role can update voice metadata"
  ON public.voice_message_metadata FOR UPDATE
  USING (true);

-- Enable realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_message_metadata;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- =====================================================
-- ARCHIVE FUNCTIONS
-- =====================================================

-- Archive a conversation
CREATE OR REPLACE FUNCTION public.archive_conversation(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.conversation_settings (conversation_id, user_id, is_archived, updated_at)
  VALUES (p_conversation_id, auth.uid(), TRUE, NOW())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET is_archived = TRUE, updated_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unarchive a conversation
CREATE OR REPLACE FUNCTION public.unarchive_conversation(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.conversation_settings
  SET is_archived = FALSE, updated_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get archived conversations
CREATE OR REPLACE FUNCTION public.get_archived_conversations()
RETURNS TABLE (conversation_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.conversation_id
  FROM public.conversation_settings cs
  WHERE cs.user_id = auth.uid()
  AND cs.is_archived = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VOICE TRANSCRIPTION FUNCTIONS
-- =====================================================

-- Update transcription status
CREATE OR REPLACE FUNCTION public.update_transcription_status(
  p_message_id UUID,
  p_status VARCHAR(20),
  p_transcription TEXT DEFAULT NULL,
  p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.voice_message_metadata
  SET
    transcription_status = p_status,
    transcription = COALESCE(p_transcription, transcription),
    transcription_error = p_error,
    updated_at = NOW()
  WHERE message_id = p_message_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert or update voice metadata
CREATE OR REPLACE FUNCTION public.upsert_voice_metadata(
  p_message_id UUID,
  p_duration_ms INTEGER,
  p_waveform JSONB DEFAULT '[]',
  p_language VARCHAR(10) DEFAULT 'vi'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.voice_message_metadata (
    message_id, duration_ms, waveform, transcription_language
  )
  VALUES (p_message_id, p_duration_ms, p_waveform, p_language)
  ON CONFLICT (message_id)
  DO UPDATE SET
    duration_ms = p_duration_ms,
    waveform = p_waveform,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

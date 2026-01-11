-- =====================================================
-- MESSAGE READ RECEIPTS TABLE
-- For detailed read tracking in group chats
-- =====================================================

-- Create message_read_receipts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'message_read_receipts') THEN

    CREATE TABLE public.message_read_receipts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      message_id UUID NOT NULL,
      user_id UUID NOT NULL,
      conversation_id UUID NOT NULL,
      read_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT fk_receipts_message
        FOREIGN KEY (message_id)
        REFERENCES public.messages(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_receipts_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_receipts_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES public.conversations(id)
        ON DELETE CASCADE,

      CONSTRAINT unique_read_receipt
        UNIQUE (message_id, user_id)
    );

    RAISE NOTICE 'Created message_read_receipts table';
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipts_message
  ON public.message_read_receipts(message_id);

CREATE INDEX IF NOT EXISTS idx_receipts_conversation
  ON public.message_read_receipts(conversation_id);

CREATE INDEX IF NOT EXISTS idx_receipts_user
  ON public.message_read_receipts(user_id);

-- RLS
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view receipts in their conversations" ON public.message_read_receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON public.message_read_receipts;

-- Create policies
CREATE POLICY "Users can view receipts in their conversations"
  ON public.message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = message_read_receipts.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own receipts"
  ON public.message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON public.message_read_receipts FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_receipts;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Function to mark message as read
CREATE OR REPLACE FUNCTION public.mark_message_read_receipt(
  p_message_id UUID,
  p_conversation_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.message_read_receipts (message_id, user_id, conversation_id, read_at)
  VALUES (p_message_id, auth.uid(), p_conversation_id, NOW())
  ON CONFLICT (message_id, user_id)
  DO UPDATE SET read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get read receipts for a message
CREATE OR REPLACE FUNCTION public.get_message_read_receipts(p_message_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  read_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.user_id,
    p.display_name,
    p.avatar_url,
    r.read_at
  FROM public.message_read_receipts r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.message_id = p_message_id
  ORDER BY r.read_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

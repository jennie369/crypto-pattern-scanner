-- ============================================================
-- ENABLE REALTIME FOR MESSAGES
--
-- This migration adds messages and message_reactions tables
-- to Supabase Realtime publication for real-time messaging
-- ============================================================

-- Enable realtime for messages table (for real-time chat)
DO $$
BEGIN
  -- Check if table is not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    RAISE NOTICE 'Added messages table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'messages table already in supabase_realtime publication';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication does not exist';
  WHEN duplicate_object THEN
    RAISE NOTICE 'messages table already in publication';
END $$;

-- Enable realtime for message_reactions table (for real-time reactions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'message_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
    RAISE NOTICE 'Added message_reactions table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'message_reactions table already in supabase_realtime publication';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication does not exist';
  WHEN duplicate_object THEN
    RAISE NOTICE 'message_reactions table already in publication';
END $$;

-- Enable realtime for conversation_participants (for member updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
    RAISE NOTICE 'Added conversation_participants table to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'conversation_participants table already in supabase_realtime publication';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'supabase_realtime publication does not exist';
  WHEN duplicate_object THEN
    RAISE NOTICE 'conversation_participants table already in publication';
END $$;

-- Verify tables are in publication
DO $$
DECLARE
  tables_list TEXT;
BEGIN
  SELECT string_agg(tablename, ', ')
  INTO tables_list
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND tablename IN ('messages', 'message_reactions', 'conversations', 'conversation_participants');

  RAISE NOTICE 'Tables in supabase_realtime: %', COALESCE(tables_list, 'none');
END $$;

-- ============================================================
-- IMPORTANT: After running this migration, you need to:
-- 1. Go to Supabase Dashboard -> Database -> Replication
-- 2. Verify that 'messages' and 'message_reactions' tables are listed
-- 3. If not, manually enable them from the dashboard
-- ============================================================

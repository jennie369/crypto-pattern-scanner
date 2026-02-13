-- Safe migration: Create chatbot_conversations table (handles existing objects)

-- Create table if not exists
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  messages JSONB[] DEFAULT '{}',
  context JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_user') THEN
    CREATE INDEX idx_conversations_user ON chatbot_conversations(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_session') THEN
    CREATE INDEX idx_conversations_session ON chatbot_conversations(session_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_conversations_updated') THEN
    CREATE INDEX idx_conversations_updated ON chatbot_conversations(updated_at DESC);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Users can view own conversations" ON chatbot_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON chatbot_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON chatbot_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON chatbot_conversations;

-- Create RLS policies
CREATE POLICY "Users can view own conversations"
  ON chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chatbot_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON chatbot_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace function
CREATE OR REPLACE FUNCTION update_chatbot_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_chatbot_conversation_timestamp ON chatbot_conversations;
CREATE TRIGGER update_chatbot_conversation_timestamp
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_conversation_timestamp();

-- Add comment
COMMENT ON TABLE chatbot_conversations IS 'Stores conversation history for Gemini AI context';

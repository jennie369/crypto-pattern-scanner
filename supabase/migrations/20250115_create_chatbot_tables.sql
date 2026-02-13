-- ========================================
-- GEM MASTER CHATBOT TABLES
-- Day 35: I Ching & Tarot Chatbot
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chatbot History Table
CREATE TABLE IF NOT EXISTS public.chatbot_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('iching', 'tarot', 'chat')),
  question TEXT,
  response TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_user_date
  ON public.chatbot_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_type
  ON public.chatbot_history(type);

-- Enable Row Level Security
ALTER TABLE public.chatbot_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chatbot history"
  ON public.chatbot_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatbot history"
  ON public.chatbot_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatbot history"
  ON public.chatbot_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.chatbot_history TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Chatbot tables created successfully!';
  RAISE NOTICE '📋 Table: chatbot_history';
  RAISE NOTICE '🔐 RLS policies enabled';
  RAISE NOTICE '⚡ Indexes created for performance';
END $$;

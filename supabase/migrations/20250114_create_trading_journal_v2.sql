-- ========================================
-- TRADING JOURNAL TABLE MIGRATION V2
-- Portfolio Tracker v2 - Week 4 Day 22-24
-- Fix: Drop and recreate table properly
-- ========================================

-- Drop existing table if it exists (with cascade to drop dependencies)
DROP TABLE IF EXISTS public.trading_journal CASCADE;

-- Drop existing trigger function if it exists
DROP FUNCTION IF EXISTS public.handle_trading_journal_updated_at() CASCADE;

-- Create trading_journal table
CREATE TABLE public.trading_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entry details
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT trading_journal_title_check CHECK (char_length(title) > 0 AND char_length(title) <= 200)
);

-- Create indexes for performance
CREATE INDEX idx_trading_journal_user_id ON public.trading_journal(user_id);
CREATE INDEX idx_trading_journal_entry_date ON public.trading_journal(entry_date DESC);
CREATE INDEX idx_trading_journal_created_at ON public.trading_journal(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.trading_journal ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own journal entries
CREATE POLICY "Users can view own journal entries"
  ON public.trading_journal
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own journal entries
CREATE POLICY "Users can insert own journal entries"
  ON public.trading_journal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal entries"
  ON public.trading_journal
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal entries"
  ON public.trading_journal
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_trading_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_trading_journal_updated_at
  BEFORE UPDATE ON public.trading_journal
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trading_journal_updated_at();

-- Grant permissions
GRANT ALL ON public.trading_journal TO authenticated;
GRANT ALL ON public.trading_journal TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Trading Journal table created successfully with all columns!';
  RAISE NOTICE '📋 Columns: id, user_id, title, content, tags, entry_date, created_at, updated_at';
END $$;

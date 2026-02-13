-- ========================================
-- TRADING JOURNAL TABLE MIGRATION
-- Portfolio Tracker v2 - Week 4 Day 22-24
-- ========================================

-- Create trading_journal table
CREATE TABLE IF NOT EXISTS public.trading_journal (
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

  -- Indexes for performance
  CONSTRAINT trading_journal_title_check CHECK (char_length(title) <= 200)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON public.trading_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_entry_date ON public.trading_journal(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_journal_created_at ON public.trading_journal(created_at DESC);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_trading_journal_updated_at
  BEFORE UPDATE ON public.trading_journal
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.trading_journal TO authenticated;
GRANT ALL ON public.trading_journal TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Trading Journal table created successfully!';
END $$;

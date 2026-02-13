-- Fix creator_earnings table - add missing columns
-- Run this FIRST before other migrations

-- Add all missing columns to creator_earnings
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS creator_id UUID;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS gross_amount INT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS platform_fee INT DEFAULT 0;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS net_amount INT;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ;
ALTER TABLE creator_earnings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON creator_earnings(status);

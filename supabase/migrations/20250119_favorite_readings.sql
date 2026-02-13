-- Migration: Favorite Readings
-- Created: 2025-01-19
-- Description: Allow users to save favorite I Ching, Tarot, and chat readings

-- Create favorite_readings table
CREATE TABLE IF NOT EXISTS favorite_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('iching', 'tarot', 'chat')),
  reading_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorite_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorite_readings(reading_type);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorite_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON favorite_readings(user_id, reading_type);

-- Enable Row Level Security
ALTER TABLE favorite_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorite_readings
-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
  ON favorite_readings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorite_readings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own favorites (notes)
CREATE POLICY "Users can update their own favorites"
  ON favorite_readings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON favorite_readings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_favorite_reading_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_favorite_reading_timestamp
  BEFORE UPDATE ON favorite_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_reading_updated_at();

-- Comments
COMMENT ON TABLE favorite_readings IS 'Stores users favorite I Ching, Tarot, and chat readings';
COMMENT ON COLUMN favorite_readings.user_id IS 'User who saved the favorite';
COMMENT ON COLUMN favorite_readings.reading_type IS 'Type of reading: iching, tarot, or chat';
COMMENT ON COLUMN favorite_readings.reading_data IS 'JSON data of the reading (hexagram, cards, message, etc)';
COMMENT ON COLUMN favorite_readings.notes IS 'User notes about this reading';

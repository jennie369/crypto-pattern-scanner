-- Migration: Product Analytics
-- Created: 2025-01-19
-- Description: Track product views and clicks in chatbot

-- Create product_analytics table
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click')),
  context JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_user_id ON product_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_event_type ON product_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_timestamp ON product_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_context ON product_analytics USING GIN (context);

-- Enable Row Level Security
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_analytics
-- Users can insert their own analytics
CREATE POLICY "Users can insert their own product analytics"
  ON product_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics
CREATE POLICY "Users can view their own product analytics"
  ON product_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all analytics (role = 'admin')
CREATE POLICY "Admins can view all product analytics"
  ON product_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE product_analytics IS 'Tracks product views and clicks from chatbot recommendations';
COMMENT ON COLUMN product_analytics.user_id IS 'User who viewed/clicked the product (nullable for anonymous)';
COMMENT ON COLUMN product_analytics.product_id IS 'Product identifier (tier1, tier2, tier3, etc)';
COMMENT ON COLUMN product_analytics.event_type IS 'Type of event: view or click';
COMMENT ON COLUMN product_analytics.context IS 'Additional context (source, mode, etc)';
COMMENT ON COLUMN product_analytics.timestamp IS 'When the event occurred';

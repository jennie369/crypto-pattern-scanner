-- =====================================================
-- PRODUCT REVIEWS TABLE
-- In-app reviews from verified purchasers
-- Keeps existing Shopify/Judge.me reviews unchanged
-- =====================================================

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_handle TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_handle);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_user_product ON product_reviews(user_id, product_handle);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews FOR SELECT
  USING (status = 'approved');

-- Users can read their own reviews (any status)
CREATE POLICY "Users can read own reviews"
  ON product_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all reviews (using service role or admin check)
-- Note: Admin policies typically use service role key, not regular RLS

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_updated_at();

-- Grant permissions
GRANT SELECT ON product_reviews TO anon;
GRANT ALL ON product_reviews TO authenticated;

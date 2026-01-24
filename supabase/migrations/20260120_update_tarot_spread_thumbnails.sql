-- =====================================================
-- UPDATE TAROT SPREAD THUMBNAIL KEYS
-- January 20, 2026
-- =====================================================

-- Update thumbnail_key for all spreads
UPDATE tarot_spreads SET thumbnail_key = 'spread-single-card' WHERE spread_id = 'single-card';
UPDATE tarot_spreads SET thumbnail_key = 'spread-past-present-future' WHERE spread_id = 'past-present-future';
UPDATE tarot_spreads SET thumbnail_key = 'spread-mind-body-spirit' WHERE spread_id = 'mind-body-spirit';
UPDATE tarot_spreads SET thumbnail_key = 'spread-decision-making' WHERE spread_id = 'decision-making';
UPDATE tarot_spreads SET thumbnail_key = 'spread-celtic-cross' WHERE spread_id = 'celtic-cross';
UPDATE tarot_spreads SET thumbnail_key = 'spread-love-relationship' WHERE spread_id = 'love-relationship';
UPDATE tarot_spreads SET thumbnail_key = 'spread-broken-heart' WHERE spread_id = 'broken-heart';
UPDATE tarot_spreads SET thumbnail_key = 'spread-career-path' WHERE spread_id = 'career-path';
UPDATE tarot_spreads SET thumbnail_key = 'spread-should-i-buy' WHERE spread_id = 'should-i-buy';
UPDATE tarot_spreads SET thumbnail_key = 'spread-market-outlook' WHERE spread_id = 'market-outlook';
UPDATE tarot_spreads SET thumbnail_key = 'spread-portfolio-balance' WHERE spread_id = 'portfolio-balance';
UPDATE tarot_spreads SET thumbnail_key = 'spread-trading-strategy' WHERE spread_id = 'trading-strategy';

-- Verify
DO $$
DECLARE
  updated_count INT;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM tarot_spreads WHERE thumbnail_key IS NOT NULL;
  RAISE NOTICE '✅ Updated thumbnail_key for % tarot spreads', updated_count;
END $$;

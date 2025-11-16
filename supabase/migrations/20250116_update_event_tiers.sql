-- ==============================================
-- UPDATE EVENT TIER VALUES
-- Migration: 20250116_update_event_tiers.sql
-- ==============================================
-- Changes required_tier values from TIER1/TIER2/TIER3 to free/basic/premium/vip
-- ==============================================

-- Step 1: Drop existing constraint
ALTER TABLE public.community_events
DROP CONSTRAINT IF EXISTS community_events_required_tier_check;

-- Step 2: Update existing data (if any)
UPDATE public.community_events
SET required_tier = CASE
  WHEN required_tier = 'TIER1' THEN 'basic'
  WHEN required_tier = 'TIER2' THEN 'premium'
  WHEN required_tier = 'TIER3' THEN 'vip'
  ELSE 'free'
END
WHERE required_tier IN ('TIER1', 'TIER2', 'TIER3');

-- Step 3: Add new constraint with updated values
ALTER TABLE public.community_events
ADD CONSTRAINT community_events_required_tier_check
CHECK (required_tier IN ('free', 'basic', 'premium', 'vip'));

-- Step 4: Set default value to 'free' (optional - allows NULL by default)
ALTER TABLE public.community_events
ALTER COLUMN required_tier SET DEFAULT 'free';

-- Verification Query (commented out - run manually if needed)
-- SELECT id, title, required_tier FROM public.community_events;

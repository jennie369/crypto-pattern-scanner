-- ==============================================
-- UPDATE EVENT TIER VALUES
-- Migration: 20250116_update_event_tiers.sql
-- ==============================================
-- Changes required_tier values from TIER1/TIER2/TIER3 to free/basic/premium/vip
-- ==============================================

-- Step 1: Drop existing constraint
ALTER TABLE public.community_events
DROP CONSTRAINT IF EXISTS community_events_required_tier_check;

-- Step 2: Update existing data - Normalize to UPPERCASE
UPDATE public.community_events
SET required_tier = CASE
  WHEN LOWER(required_tier) IN ('free', 'tier1') THEN 'FREE'
  WHEN UPPER(required_tier) = 'TIER1' THEN 'TIER1'
  WHEN UPPER(required_tier) = 'TIER2' THEN 'TIER2'
  WHEN UPPER(required_tier) = 'TIER3' THEN 'TIER3'
  ELSE 'FREE'
END
WHERE required_tier IS NOT NULL;

-- Step 3: Add new constraint with UPPERCASE values (including FREE for public events)
ALTER TABLE public.community_events
ADD CONSTRAINT community_events_required_tier_check
CHECK (required_tier IN ('FREE', 'TIER1', 'TIER2', 'TIER3'));

-- Step 4: Set default value to 'FREE' (allows anyone to attend by default)
ALTER TABLE public.community_events
ALTER COLUMN required_tier SET DEFAULT 'FREE';

-- Verification Query (commented out - run manually if needed)
-- SELECT id, title, required_tier FROM public.community_events;

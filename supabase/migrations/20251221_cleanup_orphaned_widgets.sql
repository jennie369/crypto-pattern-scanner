-- ============================================================
-- CLEANUP ORPHANED WIDGETS
-- Delete affirmation and action_plan widgets that have no linked_goal_id
-- These are legacy widgets that are no longer useful
-- ============================================================

-- First, let's see what we're about to delete (for logging)
DO $$
DECLARE
  orphan_aff_count INTEGER;
  orphan_ap_count INTEGER;
BEGIN
  -- Count orphaned affirmation widgets
  SELECT COUNT(*) INTO orphan_aff_count
  FROM vision_board_widgets
  WHERE type = 'affirmation'
    AND (content->>'linked_goal_id' IS NULL OR content->>'linked_goal_id' = '');

  -- Count orphaned action_plan widgets
  SELECT COUNT(*) INTO orphan_ap_count
  FROM vision_board_widgets
  WHERE type = 'action_plan'
    AND (content->>'linked_goal_id' IS NULL OR content->>'linked_goal_id' = '');

  RAISE NOTICE 'Found % orphaned affirmation widgets to delete', orphan_aff_count;
  RAISE NOTICE 'Found % orphaned action_plan widgets to delete', orphan_ap_count;
END $$;

-- Delete orphaned affirmation widgets (no linked_goal_id)
DELETE FROM vision_board_widgets
WHERE type = 'affirmation'
  AND (content->>'linked_goal_id' IS NULL OR content->>'linked_goal_id' = '');

-- Delete orphaned action_plan widgets (no linked_goal_id)
DELETE FROM vision_board_widgets
WHERE type = 'action_plan'
  AND (content->>'linked_goal_id' IS NULL OR content->>'linked_goal_id' = '');

-- Also delete affirmation/action_plan widgets where linked_goal_id points to a non-existent goal
DELETE FROM vision_board_widgets w
WHERE w.type IN ('affirmation', 'action_plan')
  AND w.content->>'linked_goal_id' IS NOT NULL
  AND w.content->>'linked_goal_id' != ''
  AND NOT EXISTS (
    SELECT 1 FROM vision_board_widgets g
    WHERE g.id::text = w.content->>'linked_goal_id'
      AND g.type = 'goal'
  );

-- Log final count
DO $$
DECLARE
  remaining_aff INTEGER;
  remaining_ap INTEGER;
  remaining_goals INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_aff FROM vision_board_widgets WHERE type = 'affirmation';
  SELECT COUNT(*) INTO remaining_ap FROM vision_board_widgets WHERE type = 'action_plan';
  SELECT COUNT(*) INTO remaining_goals FROM vision_board_widgets WHERE type = 'goal';

  RAISE NOTICE 'Cleanup complete!';
  RAISE NOTICE 'Remaining: % goals, % affirmations, % action_plans', remaining_goals, remaining_aff, remaining_ap;
END $$;

-- ============================================================
-- FIX: Call History not working
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Check if calls table has correct schema
DO $$
BEGIN
  -- Add caller_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'caller_id') THEN
    -- Check if initiator_id exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'initiator_id') THEN
      ALTER TABLE calls RENAME COLUMN initiator_id TO caller_id;
      RAISE NOTICE 'Renamed initiator_id to caller_id';
    ELSE
      ALTER TABLE calls ADD COLUMN caller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added caller_id column';
    END IF;
  END IF;

  -- Add end_reason if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'end_reason') THEN
    ALTER TABLE calls ADD COLUMN end_reason TEXT;
    RAISE NOTICE 'Added end_reason column';
  END IF;

  -- Add conversation_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'conversation_id') THEN
    ALTER TABLE calls ADD COLUMN conversation_id UUID;
    RAISE NOTICE 'Added conversation_id column';
  END IF;

  RAISE NOTICE 'Calls table schema check complete';
END $$;

-- 2. Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS get_call_history(UUID, INTEGER, INTEGER);

-- 3. Create get_call_history function
CREATE OR REPLACE FUNCTION get_call_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  call_type TEXT,
  status TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ,
  is_outgoing BOOLEAN,
  other_user JSONB,
  conversation_id UUID,
  end_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    COALESCE(c.call_type, 'audio')::TEXT,
    c.status::TEXT,
    COALESCE(c.duration_seconds, 0),
    c.created_at,
    (c.caller_id = p_user_id) AS is_outgoing,
    CASE
      WHEN c.caller_id = p_user_id THEN (
        SELECT jsonb_build_object(
          'id', p.id,
          'display_name', COALESCE(p.display_name, p.full_name, p.username, 'Người dùng'),
          'avatar_url', p.avatar_url
        )
        FROM call_participants cp
        JOIN profiles p ON p.id = cp.user_id
        WHERE cp.call_id = c.id
        AND cp.user_id != p_user_id
        LIMIT 1
      )
      ELSE (
        SELECT jsonb_build_object(
          'id', p.id,
          'display_name', COALESCE(p.display_name, p.full_name, p.username, 'Người dùng'),
          'avatar_url', p.avatar_url
        )
        FROM profiles p
        WHERE p.id = c.caller_id
      )
    END AS other_user,
    c.conversation_id,
    c.end_reason::TEXT
  FROM calls c
  JOIN call_participants cp ON cp.call_id = c.id
  WHERE cp.user_id = p_user_id
  AND c.status NOT IN ('initiating', 'connecting')
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION get_call_history(UUID, INTEGER, INTEGER) TO authenticated;

-- 5. Verify function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_call_history';

-- 6. Test the function (optional - replace with your user_id)
-- SELECT * FROM get_call_history('your-user-id-here', 10, 0);

SELECT 'SUCCESS: Call history function has been created/updated!' AS result;

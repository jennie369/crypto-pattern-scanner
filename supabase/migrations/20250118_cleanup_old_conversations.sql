-- =====================================================
-- CLEANUP OLD CONVERSATIONS WITHOUT PARTICIPANTS
-- =====================================================
-- These conversations were created before RLS fix
-- They have no participants, so we need to delete them

-- Check how many conversations will be deleted
SELECT
  COUNT(*) as conversations_without_participants
FROM conversations
WHERE id NOT IN (
  SELECT DISTINCT conversation_id
  FROM conversation_participants
);

-- Delete old conversations that have no participants
DELETE FROM conversations
WHERE id NOT IN (
  SELECT DISTINCT conversation_id
  FROM conversation_participants
);

-- Verify cleanup
SELECT
  COUNT(*) as total_conversations,
  (SELECT COUNT(*) FROM conversation_participants) as total_participants
FROM conversations;

-- Should show:
-- total_conversations: 0 (or very few if some had participants)
-- total_participants: 0 (or matching 2x conversations)

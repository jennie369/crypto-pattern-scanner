-- =====================================================
-- STEP 1: CLEANUP ALL EXISTING VERSIONS OF FUNCTIONS
-- Run this FIRST before creating new functions
-- =====================================================

-- Find and drop ALL versions of apply_pending_tier_upgrades
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_pending_tier_upgrades'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;
END $$;

-- Find and drop ALL versions of apply_all_pending_purchases
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'apply_all_pending_purchases'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped: %', r.func_signature;
    END LOOP;
END $$;

-- Verify cleanup
SELECT proname, pg_get_function_identity_arguments(oid) as args
FROM pg_proc
WHERE proname IN ('apply_pending_tier_upgrades', 'apply_all_pending_purchases')
AND pronamespace = 'public'::regnamespace;

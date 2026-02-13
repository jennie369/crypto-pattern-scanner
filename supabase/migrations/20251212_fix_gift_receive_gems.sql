-- ============================================
-- Migration: Fix Gift Receive Gems
-- Date: 2024-12-12
-- Purpose: Ensure receive_gems RPC works correctly
-- IMPORTANT: Run this migration on Supabase!
-- ============================================

-- 1. First, drop all existing versions of receive_gems to avoid conflicts
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'receive_gems'
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.func_signature;
    END LOOP;
END $$;

-- 2. Create the receive_gems function with SECURITY DEFINER
-- This allows it to bypass RLS and update other users' profiles
CREATE OR REPLACE FUNCTION public.receive_gems(
  p_recipient_id UUID,
  p_amount INT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_current_balance INT;
    v_new_balance INT;
BEGIN
    -- Get current balance
    SELECT COALESCE(gems, 0) INTO v_current_balance
    FROM public.profiles
    WHERE id = p_recipient_id;

    IF v_current_balance IS NULL THEN
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + p_amount;

    -- Add to recipient's profiles.gems
    UPDATE public.profiles
    SET gems = v_new_balance
    WHERE id = p_recipient_id;

    -- Check if update actually happened
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Profile not found',
            'recipient_id', p_recipient_id
        );
    END IF;

    -- Also sync to user_wallets if exists
    UPDATE public.user_wallets
    SET gem_balance = COALESCE(gem_balance, 0) + p_amount,
        total_earned = COALESCE(total_earned, 0) + p_amount,
        updated_at = NOW()
    WHERE user_id = p_recipient_id;

    -- Record in gems_transactions (with safe UUID cast)
    BEGIN
        INSERT INTO public.gems_transactions (
            user_id,
            type,
            amount,
            description,
            reference_id,
            reference_type
        ) VALUES (
            p_recipient_id,
            'receive',  -- This matches the CHECK constraint
            p_amount,
            p_description,
            CASE
                WHEN p_reference_id IS NOT NULL
                AND p_reference_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                THEN p_reference_id::UUID
                ELSE NULL
            END,
            p_reference_type
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log but don't fail if transaction record fails
        RAISE WARNING 'Could not record transaction: %', SQLERRM;
    END;

    RETURN jsonb_build_object(
        'success', true,
        'added', p_amount,
        'new_balance', v_new_balance,
        'recipient_id', p_recipient_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.receive_gems(UUID, INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.receive_gems(UUID, INT, TEXT, TEXT, TEXT) TO anon;

-- 4. Ensure gems_transactions table exists with correct schema
CREATE TABLE IF NOT EXISTS public.gems_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('spend', 'receive', 'purchase', 'bonus', 'refund')),
    amount INT NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_gems_transactions_user ON public.gems_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_created ON public.gems_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gems_transactions_type ON public.gems_transactions(type);

-- 6. Enable RLS and create policies
ALTER TABLE public.gems_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own gem transactions" ON public.gems_transactions;
CREATE POLICY "Users can view own gem transactions" ON public.gems_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- System/functions can insert transactions (for SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can insert gem transactions" ON public.gems_transactions;
CREATE POLICY "System can insert gem transactions" ON public.gems_transactions
    FOR INSERT WITH CHECK (true);

-- 7. Verify function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'receive_gems' AND n.nspname = 'public'
    ) THEN
        RAISE NOTICE 'SUCCESS: receive_gems function created successfully';
    ELSE
        RAISE EXCEPTION 'FAILED: receive_gems function was not created';
    END IF;
END $$;

-- ============================================
-- DONE - Test by calling:
-- SELECT receive_gems('user-uuid-here'::UUID, 100, 'Test gift', NULL, 'gift');
-- ============================================

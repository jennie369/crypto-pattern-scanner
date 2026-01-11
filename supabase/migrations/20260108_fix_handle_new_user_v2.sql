-- =====================================================
-- FIX: handle_new_user trigger causing signup failures
-- Date: 2026-01-08
-- Issue: apply_all_pending_purchases call in trigger fails
-- Solution: Remove pending purchases call from trigger
--           (AuthContext already calls it on SIGNED_IN)
-- =====================================================

-- Drop and recreate handle_new_user function (simpler version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user record with default values
  INSERT INTO public.users (
    id,
    email,
    display_name,
    full_name,
    scanner_tier,
    course_tier,
    chatbot_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'FREE',
    'FREE',
    'FREE',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.users.display_name),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    updated_at = NOW();

  -- NOTE: Pending purchases will be applied by mobile app via AuthContext
  -- on SIGNED_IN event calling apply_all_pending_purchases RPC
  -- This keeps the trigger simple and prevents signup failures

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'handle_new_user warning for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMMENT
-- =====================================================
COMMENT ON FUNCTION public.handle_new_user() IS
'Creates user record on signup. Pending purchases applied via mobile app AuthContext, not in trigger.';

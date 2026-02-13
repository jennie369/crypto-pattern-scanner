-- =============================================
-- STEP 1: TẠO DATABASE TRIGGER TỰ ĐỘNG
-- =============================================
-- Trigger này sẽ TỰ ĐỘNG tạo record trong public.users
-- mỗi khi có user signup trong auth.users
-- =============================================
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
-- =============================================

-- ===== XÓA TRIGGER CŨ (NẾU CÓ) =====
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

SELECT '🗑️ Dropped old trigger (if exists)' AS status;

-- ===== TẠO FUNCTION TỰ ĐỘNG TẠO USER PROFILE =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- ← QUAN TRỌNG: Bypass RLS, chạy với quyền owner
SET search_path = public
AS $$
BEGIN
  -- Log để debug (xem trong Supabase Logs)
  RAISE LOG 'Trigger fired for new user: %', NEW.id;
  RAISE LOG 'Email: %', NEW.email;

  -- Insert vào public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    tier,
    course_tier,
    scanner_tier,
    chatbot_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                              -- ID từ auth.users
    NEW.email,                                           -- Email từ auth.users
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- Full name từ metadata
    'free',                                              -- Tier mặc định
    'free',                                              -- Course tier mặc định
    'free',                                              -- Scanner tier mặc định
    'free',                                              -- Chatbot tier mặc định
    NOW(),                                               -- created_at
    NOW()                                                -- updated_at
  )
  ON CONFLICT (id) DO NOTHING; -- Tránh duplicate nếu user đã tồn tại

  RAISE LOG '✅ User profile created successfully for: %', NEW.email;

  -- Tạo daily quota record
  INSERT INTO public.daily_scan_quota (
    user_id,
    scan_count,
    max_scans,
    last_reset,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    0,        -- Bắt đầu với 0 scans
    5,        -- Free tier = 5 scans/day
    NOW(),    -- Reset time
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE LOG '✅ Daily quota created for: %', NEW.email;

  RETURN NEW;
END;
$$;

SELECT '✅ Function created: handle_new_user()' AS status;

-- ===== TẠO TRIGGER =====
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Trigger created: on_auth_user_created' AS status;

-- =============================================
-- VERIFY TRIGGER ĐÃ ĐƯỢC TẠO
-- =============================================

SELECT
  '╔════════════════════════════════════════════════╗' as message
UNION ALL
SELECT '║  ✅ AUTO PROFILE TRIGGER CREATED              ║'
UNION ALL
SELECT '╚════════════════════════════════════════════════╝'
UNION ALL
SELECT ''
UNION ALL
SELECT '📊 VERIFICATION:';

-- Check trigger có tồn tại không
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT '' AS separator;
SELECT '✅ Expected:' AS status;
SELECT '  - trigger_name: on_auth_user_created' AS detail;
SELECT '  - event_manipulation: INSERT' AS detail;
SELECT '  - event_object_table: users' AS detail;
SELECT '  - action_timing: AFTER' AS detail;

-- Check function có SECURITY DEFINER không
SELECT '' AS separator;
SELECT '🔒 Function Security:' AS status;

SELECT
  proname AS function_name,
  CASE
    WHEN prosecdef THEN '✅ SECURITY DEFINER (Bypass RLS)'
    ELSE '❌ NOT SECURITY DEFINER (Will fail!)'
  END AS security_setting
FROM pg_proc
WHERE proname = 'handle_new_user';

SELECT '' AS separator;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;
SELECT '🎉 TRIGGER READY!' AS status;
SELECT 'Mỗi khi user signup → Profile tự động tạo!' AS info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS separator;

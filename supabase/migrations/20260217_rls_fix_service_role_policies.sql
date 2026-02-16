-- ============================================================
-- Migration 1: Fix 24 Misconfigured Service-Role Policies
-- ============================================================
-- These policies incorrectly use TO {public} instead of TO service_role,
-- allowing any authenticated/anonymous user full access to data.
-- Fix: DROP the old {public} policy → CREATE POLICY with TO service_role.
-- Only add user-facing policies where they DON'T already exist.

-- ============================================================
-- Group A: Backend-only tables (service_role only) — 11 tables
-- ============================================================

-- 1. account_burn_events
DROP POLICY IF EXISTS "service_update_burn_events" ON account_burn_events;
CREATE POLICY "service_role_update_burn_events" ON account_burn_events
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- 2. admin_ai_daily_reports
DROP POLICY IF EXISTS "service_all_ai_reports" ON admin_ai_daily_reports;
CREATE POLICY "service_role_all_ai_reports" ON admin_ai_daily_reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. pending_course_access
DROP POLICY IF EXISTS "Service role full access pending_course_access" ON pending_course_access;
CREATE POLICY "service_role_all_pending_course_access" ON pending_course_access
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. pending_gem_credits
DROP POLICY IF EXISTS "Service role full access pending_gem_credits" ON pending_gem_credits;
CREATE POLICY "service_role_all_pending_gem_credits" ON pending_gem_credits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. pending_gem_purchases (drop 2 old policies, create 1)
DROP POLICY IF EXISTS "Service role full access pending_gem_purchases" ON pending_gem_purchases;
DROP POLICY IF EXISTS "Service role full access pending_gems" ON pending_gem_purchases;
CREATE POLICY "service_role_all_pending_gem_purchases" ON pending_gem_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. pending_tier_upgrades (keep existing service_role SELECT/UPDATE/INSERT)
DROP POLICY IF EXISTS "Service role full access pending_tier_upgrades" ON pending_tier_upgrades;
CREATE POLICY "service_role_all_pending_tier_upgrades" ON pending_tier_upgrades
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. proof_export_history
DROP POLICY IF EXISTS "service_all_export_history" ON proof_export_history;
CREATE POLICY "service_role_all_export_history" ON proof_export_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. rate_limit_tracking
DROP POLICY IF EXISTS "Service role full access to rate_limit_tracking" ON rate_limit_tracking;
CREATE POLICY "service_role_all_rate_limit_tracking" ON rate_limit_tracking
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. temporary_platform_users
DROP POLICY IF EXISTS "System can manage temp users" ON temporary_platform_users;
CREATE POLICY "service_role_all_temp_users" ON temporary_platform_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 10. user_daily_composite
DROP POLICY IF EXISTS "service_all_composite" ON user_daily_composite;
CREATE POLICY "service_role_all_composite" ON user_daily_composite
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 11. user_practice_profile
DROP POLICY IF EXISTS "service_all_profiles" ON user_practice_profile;
CREATE POLICY "service_role_all_practice_profile" ON user_practice_profile
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- Group B: Tables needing client-access policies — 12 tables
-- Only create user policies that don't already exist.
-- ============================================================

-- 12. gems_transactions
-- Existing user policies: "Users can view own gem transactions" (SELECT),
--   "Users can view own transactions" (SELECT), "Users view own gem transactions" (SELECT),
--   "System can insert gem transactions" (INSERT)
-- Missing: admin SELECT
DROP POLICY IF EXISTS "Service role full access gems_transactions" ON gems_transactions;
CREATE POLICY "service_role_all_gems_transactions" ON gems_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "admin_select_all_gems_transactions" ON gems_transactions
  FOR SELECT TO authenticated USING (is_admin_user());

-- 13. pending_payments
-- Existing user policies: "Users can view own payments" (SELECT via email)
-- Missing: UPDATE
DROP POLICY IF EXISTS "Service role full access on pending_payments" ON pending_payments;
CREATE POLICY "service_role_all_pending_payments" ON pending_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_update_own_pending_payments" ON pending_payments
  FOR UPDATE TO authenticated USING (customer_email = (auth.jwt()->>'email'));

-- 14. payment_logs
-- No existing user policies
DROP POLICY IF EXISTS "Service role full access on payment_logs" ON payment_logs;
CREATE POLICY "service_role_all_payment_logs" ON payment_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_insert_payment_logs" ON payment_logs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_select_all_payment_logs" ON payment_logs
  FOR SELECT TO authenticated USING (is_admin_user());

-- 15. user_access
-- Existing user policies: "Users can view own access" (SELECT)
DROP POLICY IF EXISTS "Service role full access on user_access" ON user_access;
CREATE POLICY "service_role_all_user_access" ON user_access
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 16. user_purchases
-- Existing user policies: "Users can view own purchases" (SELECT),
--   "Users view own purchases" (SELECT)
DROP POLICY IF EXISTS "Service can manage purchases" ON user_purchases;
CREATE POLICY "service_role_all_user_purchases" ON user_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 17. account_health_snapshots
-- Existing user policies: "users_select_own_health_snapshots" (SELECT),
--   "admin_select_all_health_snapshots" (SELECT)
DROP POLICY IF EXISTS "service_update_health_snapshots" ON account_health_snapshots;
CREATE POLICY "service_role_update_health_snapshots" ON account_health_snapshots
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- 18. instructor_earnings
-- Existing user policies: "Admins can view all earnings" (SELECT),
--   "Instructors can view own earnings" (SELECT)
DROP POLICY IF EXISTS "Service can manage earnings" ON instructor_earnings;
CREATE POLICY "service_role_all_instructor_earnings" ON instructor_earnings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 19. upgrade_banners
-- Existing user policies: "Public read active banners" (SELECT)
DROP POLICY IF EXISTS "Service role manage banners" ON upgrade_banners;
CREATE POLICY "service_role_all_upgrade_banners" ON upgrade_banners
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 20. upgrade_tiers
-- Existing user policies: "Public read active tiers" (SELECT)
DROP POLICY IF EXISTS "Service role manage tiers" ON upgrade_tiers;
CREATE POLICY "service_role_all_upgrade_tiers" ON upgrade_tiers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 21. upgrade_events
-- Existing user policies: "Users insert own events" (INSERT),
--   "Users read own events" (SELECT)
DROP POLICY IF EXISTS "Service role manage events" ON upgrade_events;
CREATE POLICY "service_role_all_upgrade_events" ON upgrade_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 22. user_push_tokens
-- Drop the bad {public} USING(true) SELECT policy
-- Keep existing "Service role full access to user_push_tokens" (already TO service_role)
-- All user policies already exist: SELECT, INSERT, UPDATE, DELETE, ALL, admin SELECT
DROP POLICY IF EXISTS "Service role can select all" ON user_push_tokens;

-- 23. voice_message_metadata
-- Existing user policies: INSERT (message ownership), SELECT (conversation participation)
-- Missing: user UPDATE
DROP POLICY IF EXISTS "Service role can update voice metadata" ON voice_message_metadata;
CREATE POLICY "service_role_update_voice_metadata" ON voice_message_metadata
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_update_own_voice_metadata" ON voice_message_metadata
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = voice_message_metadata.message_id
      AND m.sender_id = auth.uid()
    )
  );

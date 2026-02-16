-- ============================================================
-- Migration 2: Enable RLS on 20 Tables + Add Policies
-- ============================================================
-- These tables have RLS completely disabled — no access control at all.
-- Fix: ENABLE ROW LEVEL SECURITY + add service_role ALL + user policies.

-- ============================================================
-- Group A: Backend-only (service_role ALL) — 9 tables
-- ============================================================

-- 1. calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_calls" ON calls
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. collectionproducts
ALTER TABLE collectionproducts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_collectionproducts" ON collectionproducts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. intent_patterns
ALTER TABLE intent_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_intent_patterns" ON intent_patterns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. job_logs
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_job_logs" ON job_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. proactive_engagement_logs
ALTER TABLE proactive_engagement_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_proactive_engagement_logs" ON proactive_engagement_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. push_notification_queue
ALTER TABLE push_notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_push_notification_queue" ON push_notification_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. shopify_product_variants
ALTER TABLE shopify_product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_shopify_product_variants" ON shopify_product_variants
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. shopifywebhooklogs
ALTER TABLE shopifywebhooklogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_shopifywebhooklogs" ON shopifywebhooklogs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9. system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_system_logs" ON system_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- Group B: User-accessible (service_role ALL + user policies) — 7 tables
-- ============================================================

-- 10. user_profiles (id = auth.uid())
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_user_profiles" ON user_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_own_user_profile" ON user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_update_own_user_profile" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "admin_select_all_user_profiles" ON user_profiles
  FOR SELECT TO authenticated USING (is_admin_user());

-- 11. chatbot_history (has user_id)
ALTER TABLE chatbot_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_chatbot_history" ON chatbot_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_own_chatbot_history" ON chatbot_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_chatbot_history" ON chatbot_history
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 12. creator_earnings (has creator_id)
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_creator_earnings" ON creator_earnings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_own_creator_earnings" ON creator_earnings
  FOR SELECT TO authenticated USING (creator_id = auth.uid());

-- 13. analytics_events (has user_id)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_analytics_events" ON analytics_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_insert_own_analytics_events" ON analytics_events
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_select_all_analytics_events" ON analytics_events
  FOR SELECT TO authenticated USING (is_admin_user());

-- 14. experiment_assignments (has user_id)
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_experiment_assignments" ON experiment_assignments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_own_experiment_assignments" ON experiment_assignments
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_experiment_assignments" ON experiment_assignments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 15. experiment_conversions (has user_id)
ALTER TABLE experiment_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_experiment_conversions" ON experiment_conversions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_insert_own_experiment_conversions" ON experiment_conversions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 16. recommendation_logs (has user_id)
ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_recommendation_logs" ON recommendation_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_insert_own_recommendation_logs" ON recommendation_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Group C: Public catalogs (service_role ALL + public read) — 4 tables
-- ============================================================

-- 17. ai_feature_usage_stats (aggregate stats — backend only)
ALTER TABLE ai_feature_usage_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_ai_feature_usage_stats" ON ai_feature_usage_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 18. experiments (catalog — all active experiments are public config)
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_experiments" ON experiments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_experiments" ON experiments
  FOR SELECT TO authenticated USING (true);

-- 19. gem_packs (catalog — active packs visible to users)
ALTER TABLE gem_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_gem_packs" ON gem_packs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_active_gem_packs" ON gem_packs
  FOR SELECT TO authenticated USING (is_active = true);

-- 20. vision_rituals (catalog — ritual catalog is public)
ALTER TABLE vision_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_vision_rituals" ON vision_rituals
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "users_select_vision_rituals" ON vision_rituals
  FOR SELECT TO authenticated USING (true);

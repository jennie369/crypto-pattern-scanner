-- =====================================================
-- AFFILIATE TRACKING DATABASE FUNCTIONS
-- Migration: 20241117000003
-- Purpose: Helper functions for affiliate tracking
-- CORRECTED to use affiliate_profiles instead of affiliate_partners
-- =====================================================

-- =====================================================
-- FUNCTION 1: Get Affiliate Dashboard Summary
-- Called when: Loading affiliate dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_affiliate_dashboard_summary(
  user_id_param UUID
)
RETURNS TABLE (
  total_referrals BIGINT,
  pending_referrals BIGINT,
  converted_referrals BIGINT,
  total_commission NUMERIC,
  pending_commission NUMERIC,
  paid_commission NUMERIC,
  conversion_rate NUMERIC,
  total_sales NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT r.id) as total_referrals,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'pending') as pending_referrals,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'converted') as converted_referrals,
    COALESCE(SUM(c.commission_amount), 0) as total_commission,
    COALESCE(SUM(c.commission_amount) FILTER (WHERE c.status = 'pending'), 0) as pending_commission,
    COALESCE(SUM(c.commission_amount) FILTER (WHERE c.status = 'paid'), 0) as paid_commission,
    CASE
      WHEN COUNT(DISTINCT r.id) > 0
      THEN (COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'converted')::NUMERIC / COUNT(DISTINCT r.id) * 100)
      ELSE 0
    END as conversion_rate,
    COALESCE(ap.total_sales, 0) as total_sales
  FROM affiliate_profiles ap
  LEFT JOIN affiliate_referrals r ON r.affiliate_id = user_id_param
  LEFT JOIN affiliate_commissions c ON c.affiliate_id = user_id_param
  WHERE ap.user_id = user_id_param
  GROUP BY ap.total_sales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- FUNCTION 2: Calculate Commission Amount
-- Utility function for commission calculation
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_commission(
  order_total NUMERIC,
  commission_rate NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN FLOOR(order_total * (commission_rate / 100));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- =====================================================
-- FUNCTION 3: Get Referral Details for User
-- Called when: Viewing referral list in dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_referrals(
  user_id_param UUID
)
RETURNS TABLE (
  referral_id UUID,
  referred_user_email TEXT,
  referred_user_name TEXT,
  referral_code TEXT,
  status TEXT,
  created_at TIMESTAMP,
  first_purchase_date TIMESTAMP,
  total_spent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as referral_id,
    u.email as referred_user_email,
    u.full_name as referred_user_name,
    r.referral_code,
    r.status,
    r.created_at,
    r.first_purchase_date,
    COALESCE(SUM(s.sale_amount), 0) as total_spent
  FROM affiliate_referrals r
  JOIN profiles u ON u.id = r.referred_user_id
  LEFT JOIN affiliate_sales s ON s.referral_id = r.id
  WHERE r.affiliate_id = user_id_param
  GROUP BY r.id, u.email, u.full_name, r.referral_code, r.status, r.created_at, r.first_purchase_date
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- FUNCTION 4: Get Commission History
-- Called when: Viewing commission history
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_commissions(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  commission_id UUID,
  sale_id UUID,
  product_name TEXT,
  sale_amount NUMERIC,
  commission_rate NUMERIC,
  commission_amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP,
  paid_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as commission_id,
    c.sale_id,
    s.product_name,
    s.sale_amount,
    c.commission_rate,
    c.commission_amount,
    c.status,
    c.created_at,
    c.paid_at
  FROM affiliate_commissions c
  LEFT JOIN affiliate_sales s ON s.id = c.sale_id
  WHERE c.affiliate_id = user_id_param
  ORDER BY c.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- VERIFY FUNCTIONS CREATED
-- =====================================================
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN (
    'get_affiliate_dashboard_summary',
    'calculate_commission',
    'get_user_referrals',
    'get_user_commissions'
  );

  IF func_count = 4 THEN
    RAISE NOTICE 'SUCCESS: All 4 affiliate functions created';
  ELSE
    RAISE WARNING 'Only % functions created. Expected 4.', func_count;
  END IF;
END $$;
-- =====================================================
-- GRANT EXECUTE PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_affiliate_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_commission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_referrals TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_commissions TO authenticated;
-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION get_affiliate_dashboard_summary IS 'Get aggregate dashboard data for affiliate user';
COMMENT ON FUNCTION calculate_commission IS 'Calculate commission amount from order total and rate';
COMMENT ON FUNCTION get_user_referrals IS 'Get list of referrals for a user';
COMMENT ON FUNCTION get_user_commissions IS 'Get commission history for a user';

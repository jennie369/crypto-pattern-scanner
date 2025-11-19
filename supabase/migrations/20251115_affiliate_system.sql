-- ========================================
-- AFFILIATE SYSTEM MIGRATION
-- Days 39-40: Complete Partnership Program
-- ========================================

-- 1. AFFILIATE PROFILES
-- Stores user role, CTV tier, and accumulated sales
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'affiliate', -- 'affiliate', 'ctv', 'instructor'
  ctv_tier TEXT DEFAULT 'beginner', -- 'beginner', 'growing', 'master', 'grand'
  total_sales DECIMAL(12,2) DEFAULT 0, -- Accumulated sales for tier upgrades
  instructor_salary DECIMAL(10,2) DEFAULT 0, -- For instructors only
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. AFFILIATE CODES
-- Unique referral codes for tracking
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. AFFILIATE REFERRALS
-- Track referred users
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'converted', 'inactive'
  first_purchase_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. AFFILIATE SALES
-- Track all product sales (multi-product ecosystem)
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL, -- 'course-love', 'course-money', 'course-7days', 'course-trading-t1/t2/t3', 'scanner-pro/premium/vip', 'physical-product'
  product_name TEXT,
  sale_amount DECIMAL(10,2) NOT NULL,
  purchase_date TIMESTAMP DEFAULT NOW(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. AFFILIATE COMMISSIONS
-- Calculated commissions from sales
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES affiliate_sales(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,4) NOT NULL, -- 0.03, 0.10, 0.15, 0.20, 0.30
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid'
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. AFFILIATE BONUS KPI
-- Monthly KPI bonuses (product-specific)
CREATE TABLE IF NOT EXISTS affiliate_bonus_kpi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of the month
  product_type TEXT NOT NULL, -- Which product category this bonus is for
  students_count INTEGER NOT NULL, -- How many students sold this month
  target_count INTEGER NOT NULL, -- KPI target for this product/tier
  bonus_amount DECIMAL(10,2) NOT NULL, -- Bonus earned
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid'
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(affiliate_id, month, product_type)
);

-- 7. AFFILIATE WITHDRAWALS
-- Payout requests
CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL, -- 'bank_transfer', 'momo', 'paypal'
  account_details JSONB NOT NULL, -- Bank account info, Momo number, etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_profiles_role ON affiliate_profiles(role);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_codes_user_id ON affiliate_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliate_id ON affiliate_sales(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_product_type ON affiliate_sales(product_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_purchase_date ON affiliate_sales(purchase_date);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_bonus_kpi_affiliate_id ON affiliate_bonus_kpi(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_bonus_kpi_month ON affiliate_bonus_kpi(month);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_bonus_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/update/create their own profile
CREATE POLICY "Users can view own affiliate profile" ON affiliate_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own affiliate profile" ON affiliate_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate profile" ON affiliate_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Codes: Users can view/create their own codes
CREATE POLICY "Users can view own affiliate codes" ON affiliate_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own affiliate codes" ON affiliate_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals: Affiliates can view/create their own referrals
CREATE POLICY "Affiliates can view own referrals" ON affiliate_referrals
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can create referrals" ON affiliate_referrals
  FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

-- Sales: Affiliates can view/create their own sales
CREATE POLICY "Affiliates can view own sales" ON affiliate_sales
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can create sales" ON affiliate_sales
  FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

-- Commissions: Affiliates can view/create their own commissions
CREATE POLICY "Affiliates can view own commissions" ON affiliate_commissions
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can create commissions" ON affiliate_commissions
  FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

-- Bonus KPI: Affiliates can view their own bonuses
CREATE POLICY "Affiliates can view own bonuses" ON affiliate_bonus_kpi
  FOR SELECT USING (auth.uid() = affiliate_id);

-- Withdrawals: Users can view and create their own withdrawals
CREATE POLICY "Users can view own withdrawals" ON affiliate_withdrawals
  FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Users can create own withdrawals" ON affiliate_withdrawals
  FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to auto-generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO affiliate_codes (user_id, code)
  VALUES (
    NEW.user_id,
    'GEM' || UPPER(SUBSTRING(NEW.user_id::TEXT FROM 1 FOR 8))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate code when profile is created
CREATE TRIGGER trigger_generate_referral_code
  AFTER INSERT ON affiliate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Function to auto-upgrade CTV tier based on total sales
CREATE OR REPLACE FUNCTION check_tier_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for CTV role
  IF NEW.role = 'ctv' THEN
    IF NEW.total_sales >= 600000000 AND NEW.ctv_tier != 'grand' THEN
      NEW.ctv_tier = 'grand';
    ELSIF NEW.total_sales >= 300000000 AND NEW.ctv_tier IN ('beginner', 'growing') THEN
      NEW.ctv_tier = 'master';
    ELSIF NEW.total_sales >= 100000000 AND NEW.ctv_tier = 'beginner' THEN
      NEW.ctv_tier = 'growing';
    END IF;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check tier upgrade on total_sales update
CREATE TRIGGER trigger_check_tier_upgrade
  BEFORE UPDATE OF total_sales ON affiliate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_tier_upgrade();

-- ========================================
-- SEED DATA (Optional - for testing)
-- ========================================

-- This would be handled by the application when users sign up
-- or convert to affiliate/CTV status

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- =====================================================
-- PARTNERSHIP SYSTEM V2 - Complete Migration
-- Date: 2025-11-26
-- Description: Affiliate/CTV registration, approval, withdrawal system
-- =====================================================

-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- Table 1: Partnership Applications
CREATE TABLE IF NOT EXISTS partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application info
  application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('affiliate', 'ctv')),

  -- Personal info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- CTV-specific fields
  courses_owned TEXT[],
  reason_for_joining TEXT,
  marketing_channels TEXT,
  estimated_monthly_sales VARCHAR(50),

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index to prevent duplicate pending applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_application
  ON partnership_applications(user_id)
  WHERE status = 'pending';

-- Indexes for partnership_applications
CREATE INDEX IF NOT EXISTS idx_applications_user ON partnership_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON partnership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON partnership_applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_created ON partnership_applications(created_at DESC);

-- Table 2: Withdrawal Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount info
  amount NUMERIC NOT NULL CHECK (amount >= 100000), -- Minimum 100K VND
  available_balance_at_request NUMERIC NOT NULL,

  -- Bank info
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,

  -- Status flow: pending → approved → processing → completed
  --              pending → rejected
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),

  -- Timestamps
  approved_at TIMESTAMPTZ,
  processing_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Admin info
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  processed_by UUID REFERENCES auth.users(id),
  transaction_reference VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for withdrawal_requests
CREATE INDEX IF NOT EXISTS idx_withdrawals_partner ON withdrawal_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created ON withdrawal_requests(created_at DESC);

-- =====================================================
-- PART 2: UPDATE PROFILES TABLE
-- =====================================================

-- Add partnership columns to profiles if not exist
DO $$
BEGIN
  -- Affiliate code (unique identifier)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'affiliate_code') THEN
    ALTER TABLE profiles ADD COLUMN affiliate_code VARCHAR(20) UNIQUE;
  END IF;

  -- Partnership role: null (none), 'affiliate', 'ctv'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_role') THEN
    ALTER TABLE profiles ADD COLUMN partnership_role VARCHAR(20) CHECK (partnership_role IN ('affiliate', 'ctv'));
  END IF;

  -- CTV tier (1-4)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ctv_tier') THEN
    ALTER TABLE profiles ADD COLUMN ctv_tier INTEGER DEFAULT 1 CHECK (ctv_tier BETWEEN 1 AND 4);
  END IF;

  -- Commission tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_commission') THEN
    ALTER TABLE profiles ADD COLUMN total_commission NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'available_balance') THEN
    ALTER TABLE profiles ADD COLUMN available_balance NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'withdrawn_total') THEN
    ALTER TABLE profiles ADD COLUMN withdrawn_total NUMERIC DEFAULT 0;
  END IF;

  -- Push notification token
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'push_token') THEN
    ALTER TABLE profiles ADD COLUMN push_token TEXT;
  END IF;

  -- Partnership approved date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'partnership_approved_at') THEN
    ALTER TABLE profiles ADD COLUMN partnership_approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================
-- PART 3: RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own applications" ON partnership_applications;
DROP POLICY IF EXISTS "Users can insert applications" ON partnership_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON partnership_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON partnership_applications;

DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Users can insert withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawal_requests;

-- Partnership Applications Policies
CREATE POLICY "Users can view own applications"
  ON partnership_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert applications"
  ON partnership_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending applications"
  ON partnership_applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all applications"
  ON partnership_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Withdrawal Requests Policies
CREATE POLICY "Users can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid());

CREATE POLICY "Users can insert withdrawals"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Admins can manage all withdrawals"
  ON withdrawal_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PART 4: HELPER FUNCTIONS
-- =====================================================

-- Function 1: Generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: GEM + 6 random alphanumeric chars
    new_code := 'GEM' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE affiliate_code = new_code) INTO code_exists;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Check if user is eligible for CTV (has purchased courses)
CREATE OR REPLACE FUNCTION check_ctv_eligibility(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_course BOOLEAN;
BEGIN
  -- Check in shopify_orders for digital products
  SELECT EXISTS(
    SELECT 1 FROM shopify_orders
    WHERE user_id = user_id_param
    AND financial_status = 'paid'
    AND (
      product_type = 'digital'
      OR tier_purchased IS NOT NULL
      OR product_type IN ('course', 'scanner', 'chatbot')
    )
  ) INTO has_course;

  -- Also check in users table for existing tiers
  IF NOT has_course THEN
    SELECT EXISTS(
      SELECT 1 FROM users
      WHERE id = user_id_param
      AND (
        course_tier IS NOT NULL
        OR scanner_tier IS NOT NULL
        OR chatbot_tier IS NOT NULL
      )
    ) INTO has_course;
  END IF;

  RETURN has_course;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get user's owned courses
CREATE OR REPLACE FUNCTION get_user_courses(user_id_param UUID)
RETURNS TABLE(
  course_name TEXT,
  tier TEXT,
  purchased_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(so.product_type, 'Course') || ' ' || COALESCE(so.tier_purchased, '') as course_name,
    so.tier_purchased as tier,
    so.paid_at as purchased_at
  FROM shopify_orders so
  WHERE so.user_id = user_id_param
  AND so.financial_status = 'paid'
  AND so.product_type IN ('course', 'scanner', 'chatbot', 'digital')
  ORDER BY so.paid_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Get partnership status
CREATE OR REPLACE FUNCTION get_partnership_status(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  profile_data RECORD;
  application_data RECORD;
  is_eligible BOOLEAN;
BEGIN
  -- Get profile data
  SELECT
    affiliate_code,
    partnership_role,
    ctv_tier,
    total_commission,
    available_balance,
    withdrawn_total,
    partnership_approved_at
  INTO profile_data
  FROM profiles
  WHERE id = user_id_param;

  -- Get latest application
  SELECT
    id,
    application_type,
    status,
    rejection_reason,
    created_at
  INTO application_data
  FROM partnership_applications
  WHERE user_id = user_id_param
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check CTV eligibility
  SELECT check_ctv_eligibility(user_id_param) INTO is_eligible;

  -- Build result
  result := json_build_object(
    'has_partnership', profile_data.affiliate_code IS NOT NULL,
    'affiliate_code', profile_data.affiliate_code,
    'partnership_role', profile_data.partnership_role,
    'ctv_tier', profile_data.ctv_tier,
    'total_commission', COALESCE(profile_data.total_commission, 0),
    'available_balance', COALESCE(profile_data.available_balance, 0),
    'withdrawn_total', COALESCE(profile_data.withdrawn_total, 0),
    'partnership_approved_at', profile_data.partnership_approved_at,
    'has_application', application_data.id IS NOT NULL,
    'application_id', application_data.id,
    'application_type', application_data.application_type,
    'application_status', application_data.status,
    'application_date', application_data.created_at,
    'rejection_reason', application_data.rejection_reason,
    'is_ctv_eligible', is_eligible
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Submit partnership application
CREATE OR REPLACE FUNCTION submit_partnership_application(
  user_id_param UUID,
  app_type VARCHAR(20),
  full_name_param VARCHAR(255),
  email_param VARCHAR(255),
  phone_param VARCHAR(50) DEFAULT NULL,
  reason_param TEXT DEFAULT NULL,
  channels_param TEXT DEFAULT NULL,
  estimated_sales_param VARCHAR(50) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_application_id UUID;
  user_courses TEXT[];
  is_eligible BOOLEAN;
BEGIN
  -- Check if user already has partnership
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param AND affiliate_code IS NOT NULL) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn đã là Partner. Không thể đăng ký thêm.'
    );
  END IF;

  -- Check if user has pending application
  IF EXISTS (
    SELECT 1 FROM partnership_applications
    WHERE user_id = user_id_param AND status = 'pending'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn đã có đơn đăng ký đang chờ xử lý.'
    );
  END IF;

  -- For CTV, check eligibility
  IF app_type = 'ctv' THEN
    SELECT check_ctv_eligibility(user_id_param) INTO is_eligible;
    IF NOT is_eligible THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Bạn cần mua ít nhất 1 khóa học để đăng ký CTV.'
      );
    END IF;

    -- Get user's courses
    SELECT ARRAY_AGG(course_name)
    INTO user_courses
    FROM get_user_courses(user_id_param);
  END IF;

  -- Insert application
  INSERT INTO partnership_applications (
    user_id,
    application_type,
    full_name,
    email,
    phone,
    courses_owned,
    reason_for_joining,
    marketing_channels,
    estimated_monthly_sales
  ) VALUES (
    user_id_param,
    app_type,
    full_name_param,
    email_param,
    phone_param,
    user_courses,
    reason_param,
    channels_param,
    estimated_sales_param
  )
  RETURNING id INTO new_application_id;

  RETURN json_build_object(
    'success', true,
    'application_id', new_application_id,
    'message', 'Đơn đăng ký đã được gửi thành công! Chúng tôi sẽ xem xét trong 1-2 ngày làm việc.'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 6: Admin approve partnership application
CREATE OR REPLACE FUNCTION approve_partnership_application(
  application_id_param UUID,
  admin_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  app_record RECORD;
  new_affiliate_code VARCHAR(20);
  new_role VARCHAR(20);
BEGIN
  -- Get application
  SELECT * INTO app_record
  FROM partnership_applications
  WHERE id = application_id_param AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Đơn đăng ký không tồn tại hoặc đã được xử lý.'
    );
  END IF;

  -- Generate affiliate code
  SELECT generate_affiliate_code() INTO new_affiliate_code;

  -- Determine role
  new_role := app_record.application_type;

  -- Update application
  UPDATE partnership_applications
  SET
    status = 'approved',
    approved_at = NOW(),
    reviewed_by = admin_id_param,
    admin_notes = admin_notes_param,
    updated_at = NOW()
  WHERE id = application_id_param;

  -- Update user profile
  UPDATE profiles
  SET
    affiliate_code = new_affiliate_code,
    partnership_role = new_role,
    ctv_tier = CASE WHEN new_role = 'ctv' THEN 1 ELSE NULL END,
    partnership_approved_at = NOW(),
    updated_at = NOW()
  WHERE id = app_record.user_id;

  -- Also update affiliate_profiles if exists
  INSERT INTO affiliate_profiles (user_id, referral_code, role, ctv_tier, total_sales)
  VALUES (app_record.user_id, new_affiliate_code, new_role,
          CASE WHEN new_role = 'ctv' THEN 'beginner' ELSE NULL END, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    referral_code = new_affiliate_code,
    role = new_role,
    ctv_tier = CASE WHEN new_role = 'ctv' THEN 'beginner' ELSE affiliate_profiles.ctv_tier END,
    updated_at = NOW();

  RETURN json_build_object(
    'success', true,
    'affiliate_code', new_affiliate_code,
    'user_id', app_record.user_id,
    'email', app_record.email,
    'role', new_role,
    'message', 'Đơn đăng ký đã được phê duyệt!'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 7: Admin reject partnership application
CREATE OR REPLACE FUNCTION reject_partnership_application(
  application_id_param UUID,
  admin_id_param UUID,
  rejection_reason_param TEXT
)
RETURNS JSON AS $$
DECLARE
  app_record RECORD;
BEGIN
  -- Get application
  SELECT * INTO app_record
  FROM partnership_applications
  WHERE id = application_id_param AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Đơn đăng ký không tồn tại hoặc đã được xử lý.'
    );
  END IF;

  -- Update application
  UPDATE partnership_applications
  SET
    status = 'rejected',
    rejected_at = NOW(),
    rejection_reason = rejection_reason_param,
    reviewed_by = admin_id_param,
    updated_at = NOW()
  WHERE id = application_id_param;

  RETURN json_build_object(
    'success', true,
    'user_id', app_record.user_id,
    'email', app_record.email,
    'message', 'Đơn đăng ký đã bị từ chối.'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 8: Request withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
  partner_id_param UUID,
  amount_param NUMERIC,
  bank_name_param VARCHAR(255),
  account_number_param VARCHAR(100),
  account_holder_param VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
  current_balance NUMERIC;
  new_withdrawal_id UUID;
BEGIN
  -- Get current available balance
  SELECT available_balance INTO current_balance
  FROM profiles
  WHERE id = partner_id_param;

  -- Validate
  IF current_balance IS NULL OR current_balance < amount_param THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Số dư khả dụng không đủ.'
    );
  END IF;

  IF amount_param < 100000 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Số tiền rút tối thiểu là 100,000đ.'
    );
  END IF;

  -- Check if has pending withdrawal
  IF EXISTS (
    SELECT 1 FROM withdrawal_requests
    WHERE partner_id = partner_id_param AND status IN ('pending', 'approved', 'processing')
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn đang có yêu cầu rút tiền chưa hoàn tất.'
    );
  END IF;

  -- Create withdrawal request
  INSERT INTO withdrawal_requests (
    partner_id,
    amount,
    available_balance_at_request,
    bank_name,
    account_number,
    account_holder_name
  ) VALUES (
    partner_id_param,
    amount_param,
    current_balance,
    bank_name_param,
    account_number_param,
    account_holder_param
  )
  RETURNING id INTO new_withdrawal_id;

  -- Deduct from available balance (hold)
  UPDATE profiles
  SET
    available_balance = available_balance - amount_param,
    updated_at = NOW()
  WHERE id = partner_id_param;

  RETURN json_build_object(
    'success', true,
    'withdrawal_id', new_withdrawal_id,
    'amount', amount_param,
    'message', 'Yêu cầu rút tiền đã được gửi! Chúng tôi sẽ xử lý trong 1-3 ngày làm việc.'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 9: Admin approve withdrawal
CREATE OR REPLACE FUNCTION admin_approve_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  withdrawal_record RECORD;
BEGIN
  SELECT * INTO withdrawal_record
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Yêu cầu rút tiền không tồn tại hoặc đã được xử lý.'
    );
  END IF;

  UPDATE withdrawal_requests
  SET
    status = 'approved',
    approved_at = NOW(),
    reviewed_by = admin_id_param,
    admin_notes = admin_notes_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;

  RETURN json_build_object(
    'success', true,
    'partner_id', withdrawal_record.partner_id,
    'amount', withdrawal_record.amount,
    'message', 'Yêu cầu rút tiền đã được phê duyệt.'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 10: Admin complete withdrawal
CREATE OR REPLACE FUNCTION admin_complete_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  transaction_ref_param VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
  withdrawal_record RECORD;
BEGIN
  SELECT * INTO withdrawal_record
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param AND status IN ('approved', 'processing');

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Yêu cầu rút tiền không tồn tại hoặc chưa được duyệt.'
    );
  END IF;

  -- Update withdrawal
  UPDATE withdrawal_requests
  SET
    status = 'completed',
    completed_at = NOW(),
    processed_by = admin_id_param,
    transaction_reference = transaction_ref_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;

  -- Update profile withdrawn total
  UPDATE profiles
  SET
    withdrawn_total = COALESCE(withdrawn_total, 0) + withdrawal_record.amount,
    updated_at = NOW()
  WHERE id = withdrawal_record.partner_id;

  RETURN json_build_object(
    'success', true,
    'partner_id', withdrawal_record.partner_id,
    'amount', withdrawal_record.amount,
    'transaction_ref', transaction_ref_param,
    'message', 'Đã hoàn tất chuyển tiền!'
  );
END;
$$ LANGUAGE plpgsql;

-- Function 11: Admin reject withdrawal
CREATE OR REPLACE FUNCTION admin_reject_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  rejection_reason_param TEXT
)
RETURNS JSON AS $$
DECLARE
  withdrawal_record RECORD;
BEGIN
  SELECT * INTO withdrawal_record
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param AND status IN ('pending', 'approved');

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Yêu cầu rút tiền không tồn tại hoặc đã được xử lý.'
    );
  END IF;

  -- Update withdrawal
  UPDATE withdrawal_requests
  SET
    status = 'rejected',
    rejected_at = NOW(),
    rejection_reason = rejection_reason_param,
    reviewed_by = admin_id_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;

  -- Return funds to available balance
  UPDATE profiles
  SET
    available_balance = COALESCE(available_balance, 0) + withdrawal_record.amount,
    updated_at = NOW()
  WHERE id = withdrawal_record.partner_id;

  RETURN json_build_object(
    'success', true,
    'partner_id', withdrawal_record.partner_id,
    'amount', withdrawal_record.amount,
    'message', 'Yêu cầu rút tiền đã bị từ chối. Số tiền đã được hoàn lại.'
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: TRIGGERS
-- =====================================================

-- Trigger: Update updated_at on partnership_applications
CREATE OR REPLACE FUNCTION update_partnership_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partnership_applications ON partnership_applications;
CREATE TRIGGER trigger_update_partnership_applications
  BEFORE UPDATE ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_applications_updated_at();

-- Trigger: Update updated_at on withdrawal_requests
CREATE OR REPLACE FUNCTION update_withdrawal_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_withdrawal_requests ON withdrawal_requests;
CREATE TRIGGER trigger_update_withdrawal_requests
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_requests_updated_at();

-- =====================================================
-- PART 6: ADMIN HELPER VIEWS
-- =====================================================

-- View: Pending applications for admin
CREATE OR REPLACE VIEW admin_pending_applications AS
SELECT
  pa.*,
  p.email as user_email,
  p.full_name as user_name,
  p.avatar_url
FROM partnership_applications pa
JOIN profiles p ON p.id = pa.user_id
WHERE pa.status = 'pending'
ORDER BY pa.created_at ASC;

-- View: Pending withdrawals for admin
CREATE OR REPLACE VIEW admin_pending_withdrawals AS
SELECT
  wr.*,
  p.email as partner_email,
  p.full_name as partner_name,
  p.affiliate_code,
  p.partnership_role,
  p.ctv_tier
FROM withdrawal_requests wr
JOIN profiles p ON p.id = wr.partner_id
WHERE wr.status IN ('pending', 'approved', 'processing')
ORDER BY wr.created_at ASC;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check tables created
SELECT 'partnership_applications' as table_name, COUNT(*) as count FROM partnership_applications
UNION ALL
SELECT 'withdrawal_requests', COUNT(*) FROM withdrawal_requests;

-- Check functions created
SELECT proname as function_name
FROM pg_proc
WHERE proname IN (
  'generate_affiliate_code',
  'check_ctv_eligibility',
  'get_user_courses',
  'get_partnership_status',
  'submit_partnership_application',
  'approve_partnership_application',
  'reject_partnership_application',
  'request_withdrawal',
  'admin_approve_withdrawal',
  'admin_complete_withdrawal',
  'admin_reject_withdrawal'
)
ORDER BY proname;

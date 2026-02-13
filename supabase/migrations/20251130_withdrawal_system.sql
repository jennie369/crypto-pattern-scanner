-- =============================================
-- GEM Mobile - Withdrawal System
-- Issue #24: Withdraw Flow Hoàn Chỉnh
-- =============================================

-- 1. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount info
  gems_amount INTEGER NOT NULL,
  vnd_amount DECIMAL(15, 0) NOT NULL,
  platform_fee DECIMAL(15, 0) NOT NULL,
  author_receive DECIMAL(15, 0) NOT NULL,

  -- Bank info
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(100) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed')),

  -- Admin processing
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  reject_reason TEXT,
  transaction_id VARCHAR(100), -- Bank transaction reference

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdraw_user ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdraw_created ON public.withdrawal_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_pending ON public.withdrawal_requests(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view own requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own requests" ON public.withdrawal_requests;
CREATE POLICY "Users can insert own requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can view all requests" ON public.withdrawal_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update requests" ON public.withdrawal_requests;
CREATE POLICY "Admins can update requests" ON public.withdrawal_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Process Withdrawal RPC Function
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_request_id UUID,
  p_admin_id UUID,
  p_action VARCHAR(10), -- 'approve' or 'reject'
  p_reject_reason TEXT DEFAULT NULL,
  p_transaction_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_request RECORD;
  v_user_balance INTEGER;
  v_result JSON;
BEGIN
  -- Get request
  SELECT * INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Request already processed');
  END IF;

  IF p_action = 'approve' THEN
    -- Check user balance
    SELECT gem_balance INTO v_user_balance
    FROM public.profiles
    WHERE id = v_request.user_id;

    IF v_user_balance IS NULL OR v_user_balance < v_request.gems_amount THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Deduct balance
    UPDATE public.profiles
    SET gem_balance = gem_balance - v_request.gems_amount,
        updated_at = NOW()
    WHERE id = v_request.user_id;

    -- Update request
    UPDATE public.withdrawal_requests
    SET status = 'approved',
        processed_by = p_admin_id,
        processed_at = NOW(),
        transaction_id = p_transaction_id,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Create notification for user
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_request.user_id,
      'withdraw_approved',
      'Rút tiền thành công',
      'Yêu cầu rút ' || v_request.gems_amount || ' gems đã được duyệt. Số tiền sẽ được chuyển trong 1-3 ngày làm việc.',
      json_build_object('request_id', p_request_id, 'amount', v_request.gems_amount)
    );

    v_result := json_build_object('success', true, 'message', 'Withdrawal approved');

  ELSIF p_action = 'reject' THEN
    -- Update request
    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        processed_by = p_admin_id,
        processed_at = NOW(),
        reject_reason = p_reject_reason,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Create notification for user
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data
    ) VALUES (
      v_request.user_id,
      'withdraw_rejected',
      'Yêu cầu rút tiền bị từ chối',
      'Lý do: ' || COALESCE(p_reject_reason, 'Không đáp ứng điều kiện'),
      json_build_object('request_id', p_request_id, 'reason', p_reject_reason)
    );

    v_result := json_build_object('success', true, 'message', 'Withdrawal rejected');

  ELSE
    v_result := json_build_object('success', false, 'error', 'Invalid action');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.withdrawal_requests IS 'User withdrawal requests with admin processing';
COMMENT ON FUNCTION process_withdrawal IS 'Process withdrawal request (approve/reject) - admin only';

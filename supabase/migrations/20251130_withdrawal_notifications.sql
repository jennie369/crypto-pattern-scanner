-- ============================================
-- Issue 24: Withdrawal Status Notification Trigger
-- Automatically notify users when withdrawal status changes
-- ============================================

-- Create trigger function to notify user on withdrawal status change
CREATE OR REPLACE FUNCTION notify_withdrawal_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine notification title and message based on new status
    CASE NEW.status
      WHEN 'approved' THEN
        v_title := 'Yêu cầu rút tiền được duyệt';
        v_message := 'Yêu cầu rút ' || NEW.amount::TEXT || ' đã được duyệt. Vui lòng chờ xử lý.';
      WHEN 'processing' THEN
        v_title := 'Đang xử lý rút tiền';
        v_message := 'Yêu cầu rút ' || NEW.amount::TEXT || ' đang được xử lý.';
      WHEN 'completed' THEN
        v_title := 'Rút tiền thành công';
        v_message := 'Rút ' || NEW.amount::TEXT || ' hoàn tất. Mã GD: ' || COALESCE(NEW.transaction_reference, 'N/A');
      WHEN 'rejected' THEN
        v_title := 'Yêu cầu rút tiền bị từ chối';
        v_message := 'Yêu cầu rút tiền bị từ chối. Lý do: ' || COALESCE(NEW.rejection_reason, 'Không rõ');
      ELSE
        -- Don't notify for other status changes
        RETURN NEW;
    END CASE;

    -- Insert notification into forum_notifications table
    INSERT INTO forum_notifications (
      id,
      user_id,
      type,
      title,
      message,
      read,
      created_at
    ) VALUES (
      gen_random_uuid(),
      NEW.partner_id,
      'system',
      v_title,
      v_message,
      FALSE,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS withdrawal_status_notification ON withdrawal_requests;

-- Create trigger on withdrawal_requests table
CREATE TRIGGER withdrawal_status_notification
  AFTER UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_withdrawal_status_change();

-- ============================================
-- Also notify admins when new withdrawal is requested
-- ============================================

CREATE OR REPLACE FUNCTION notify_admin_new_withdrawal()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
  v_partner_name TEXT;
BEGIN
  -- Get partner name
  SELECT full_name INTO v_partner_name
  FROM profiles
  WHERE id = NEW.partner_id;

  -- Notify all admins about new withdrawal request
  FOR v_admin_id IN
    SELECT id FROM profiles WHERE role = 'ADMIN' OR is_admin = TRUE
  LOOP
    INSERT INTO forum_notifications (
      id,
      user_id,
      type,
      title,
      message,
      read,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_admin_id,
      'system',
      'Yêu cầu rút tiền mới',
      COALESCE(v_partner_name, 'Người dùng') || ' yêu cầu rút ' || NEW.amount::TEXT || '. Vui lòng xem xét.',
      FALSE,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS new_withdrawal_admin_notification ON withdrawal_requests;

-- Create trigger for new withdrawal requests
CREATE TRIGGER new_withdrawal_admin_notification
  AFTER INSERT ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_withdrawal();

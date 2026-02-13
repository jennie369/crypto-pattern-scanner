-- ============================================================
-- SUPPORT TICKET SYSTEM
-- Migration: 20251215_support_tickets.sql
-- Purpose: Help desk / support ticket system with messaging
-- ============================================================

-- 1. Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,

  -- User info
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email TEXT, -- For non-authenticated users

  -- Ticket content
  subject VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
    -- 'billing', 'technical', 'account', 'feature_request', 'bug_report', 'general'

  -- Priority & Status
  priority VARCHAR(50) DEFAULT 'normal',
    -- 'low', 'normal', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'open',
    -- 'open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'

  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),

  -- Metadata
  source VARCHAR(50) DEFAULT 'app', -- 'app', 'email', 'website'
  device_info JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);

-- 2. Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Sender info
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type VARCHAR(50) NOT NULL, -- 'user', 'admin', 'system'
  sender_name VARCHAR(200),

  -- Message content
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',

  -- Metadata
  is_internal BOOLEAN DEFAULT false, -- Internal notes (hidden from user)
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ticket_messages(created_at);

-- 3. Ticket number sequence
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

-- 4. Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'TKT-' || LPAD(nextval('ticket_number_seq')::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_ticket_number ON support_tickets;
CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- 6. Function to update ticket timestamps
CREATE OR REPLACE FUNCTION update_ticket_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.last_activity_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ticket_timestamps ON support_tickets;
CREATE TRIGGER trigger_update_ticket_timestamps
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamps();

-- 7. Function to update ticket on new message
CREATE OR REPLACE FUNCTION on_ticket_message_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update ticket last_activity_at
  UPDATE support_tickets
  SET last_activity_at = NOW()
  WHERE id = NEW.ticket_id;

  -- If admin replied, set status to in_progress if was open
  IF NEW.sender_type = 'admin' THEN
    UPDATE support_tickets
    SET status = CASE
      WHEN status = 'open' THEN 'in_progress'
      WHEN status = 'waiting_for_user' THEN 'in_progress'
      ELSE status
    END
    WHERE id = NEW.ticket_id;
  END IF;

  -- If user replied after being resolved, reopen
  IF NEW.sender_type = 'user' THEN
    UPDATE support_tickets
    SET status = CASE
      WHEN status = 'resolved' THEN 'open'
      ELSE status
    END
    WHERE id = NEW.ticket_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_on_ticket_message ON ticket_messages;
CREATE TRIGGER trigger_on_ticket_message
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION on_ticket_message_insert();

-- 8. RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins manage tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users view own messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users create messages" ON ticket_messages;
DROP POLICY IF EXISTS "Admins manage messages" ON ticket_messages;

-- Tickets - Users can view and create their own
CREATE POLICY "Users create tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users view own tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own tickets" ON support_tickets
  FOR UPDATE USING (user_id = auth.uid());

-- Tickets - Admins can view and manage all
CREATE POLICY "Admins manage tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Messages - Users can view their ticket messages (non-internal)
CREATE POLICY "Users view own messages" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_messages.ticket_id
      AND t.user_id = auth.uid()
    )
    AND is_internal = false
  );

-- Messages - Users can create messages on their tickets
CREATE POLICY "Users create messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_messages.ticket_id
      AND t.user_id = auth.uid()
    )
    AND sender_type = 'user'
  );

-- Messages - Admins can view and create all
CREATE POLICY "Admins manage messages" ON ticket_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 9. Function to create ticket with initial message
CREATE OR REPLACE FUNCTION create_support_ticket(
  p_subject VARCHAR,
  p_description TEXT,
  p_category VARCHAR DEFAULT 'general',
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_ticket_id UUID;
  v_ticket_number VARCHAR;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM profiles WHERE id = v_user_id;
  END IF;

  -- Create ticket
  INSERT INTO support_tickets (user_id, user_email, subject, category, priority)
  VALUES (v_user_id, v_user_email, p_subject, p_category, p_priority)
  RETURNING id, ticket_number INTO v_ticket_id, v_ticket_number;

  -- Add initial message
  INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message)
  VALUES (v_ticket_id, v_user_id, 'user', p_description);

  RETURN jsonb_build_object(
    'success', true,
    'ticket_id', v_ticket_id,
    'ticket_number', v_ticket_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to get ticket stats for admin
CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_progress_tickets BIGINT,
  resolved_tickets BIGINT,
  unassigned_tickets BIGINT,
  avg_response_time INTERVAL,
  tickets_today BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_tickets,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT AS open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT AS in_progress_tickets,
    COUNT(*) FILTER (WHERE status IN ('resolved', 'closed'))::BIGINT AS resolved_tickets,
    COUNT(*) FILTER (WHERE assigned_to IS NULL AND status = 'open')::BIGINT AS unassigned_tickets,
    NULL::INTERVAL AS avg_response_time, -- Would need more complex query
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::BIGINT AS tickets_today
  FROM support_tickets;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to assign ticket
CREATE OR REPLACE FUNCTION assign_ticket(
  p_ticket_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_admin UUID;
BEGIN
  v_current_admin := COALESCE(p_admin_id, auth.uid());

  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_current_admin AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không có quyền admin');
  END IF;

  -- Assign ticket
  UPDATE support_tickets
  SET
    assigned_to = v_current_admin,
    assigned_at = NOW(),
    status = CASE WHEN status = 'open' THEN 'in_progress' ELSE status END
  WHERE id = p_ticket_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Function to resolve ticket
CREATE OR REPLACE FUNCTION resolve_ticket(
  p_ticket_id UUID,
  p_resolution TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = v_admin_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không có quyền admin');
  END IF;

  -- Resolve ticket
  UPDATE support_tickets
  SET
    status = 'resolved',
    resolution = p_resolution,
    resolved_at = NOW(),
    resolved_by = v_admin_id
  WHERE id = p_ticket_id;

  -- Add system message
  INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message)
  VALUES (p_ticket_id, v_admin_id, 'system', 'Ticket đã được giải quyết');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

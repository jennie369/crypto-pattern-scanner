-- PHASE 2A: Handoff Tables for Human Agent Support
-- Manages agents, handoff queue, and CSAT tracking

-- Agent Status Enum
CREATE TYPE agent_status AS ENUM ('online', 'offline', 'busy', 'away');

-- Handoff Status Enum
CREATE TYPE handoff_status AS ENUM ('waiting', 'assigned', 'in_progress', 'resolved', 'cancelled', 'expired');

-- Priority Levels
CREATE TYPE handoff_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Chatbot Agents Table
CREATE TABLE IF NOT EXISTS chatbot_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,

    -- Status
    status agent_status DEFAULT 'offline',
    last_active_at TIMESTAMPTZ,

    -- Capacity
    max_concurrent_chats INTEGER DEFAULT 5,
    current_chats INTEGER DEFAULT 0,

    -- Stats
    total_handled INTEGER DEFAULT 0,
    avg_response_time_seconds INTEGER DEFAULT 0,
    avg_resolution_time_seconds INTEGER DEFAULT 0,
    avg_csat FLOAT DEFAULT 0.0,
    total_csat_ratings INTEGER DEFAULT 0,

    -- Settings
    auto_assign BOOLEAN DEFAULT true,
    notification_enabled BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id),
    UNIQUE(email)
);

-- Handoff Queue Table
CREATE TABLE IF NOT EXISTS chatbot_handoff_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    platform_user_id UUID NOT NULL REFERENCES chatbot_platform_users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES chatbot_platform_conversations(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES chatbot_agents(id) ON DELETE SET NULL,

    -- Handoff Details
    reason TEXT NOT NULL,
    priority handoff_priority DEFAULT 'normal',
    status handoff_status DEFAULT 'waiting',

    -- Queue Position (calculated)
    queue_position INTEGER,

    -- Timing
    wait_time_seconds INTEGER DEFAULT 0,
    handle_time_seconds INTEGER DEFAULT 0,

    -- Resolution
    resolution_notes TEXT,
    csat_score INTEGER CHECK (csat_score >= 1 AND csat_score <= 5),
    csat_feedback TEXT,

    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Indexes for Agents
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON chatbot_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON chatbot_agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_current_chats ON chatbot_agents(current_chats);

-- Indexes for Handoff Queue
CREATE INDEX IF NOT EXISTS idx_handoff_status ON chatbot_handoff_queue(status);
CREATE INDEX IF NOT EXISTS idx_handoff_priority ON chatbot_handoff_queue(priority);
CREATE INDEX IF NOT EXISTS idx_handoff_agent ON chatbot_handoff_queue(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_handoff_conversation ON chatbot_handoff_queue(conversation_id);
CREATE INDEX IF NOT EXISTS idx_handoff_requested_at ON chatbot_handoff_queue(requested_at);
CREATE INDEX IF NOT EXISTS idx_handoff_platform_user ON chatbot_handoff_queue(platform_user_id);

-- Function: Request Handoff
CREATE OR REPLACE FUNCTION request_handoff(
    p_platform_user_id UUID,
    p_conversation_id UUID,
    p_reason TEXT,
    p_priority handoff_priority DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_handoff_id UUID;
    v_queue_position INTEGER;
BEGIN
    -- Check for existing pending handoff
    SELECT id INTO v_handoff_id
    FROM chatbot_handoff_queue
    WHERE conversation_id = p_conversation_id
        AND status IN ('waiting', 'assigned', 'in_progress')
    LIMIT 1;

    IF v_handoff_id IS NOT NULL THEN
        RETURN v_handoff_id;
    END IF;

    -- Calculate queue position
    SELECT COUNT(*) + 1 INTO v_queue_position
    FROM chatbot_handoff_queue
    WHERE status = 'waiting';

    -- Create new handoff request
    INSERT INTO chatbot_handoff_queue (
        platform_user_id,
        conversation_id,
        reason,
        priority,
        queue_position
    ) VALUES (
        p_platform_user_id,
        p_conversation_id,
        p_reason,
        p_priority,
        v_queue_position
    )
    RETURNING id INTO v_handoff_id;

    -- Update conversation status
    UPDATE chatbot_platform_conversations
    SET status = 'handoff_pending',
        updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN v_handoff_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-assign Handoff to Available Agent
CREATE OR REPLACE FUNCTION auto_assign_handoff(p_handoff_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_handoff RECORD;
    v_agent_id UUID;
BEGIN
    -- Get oldest waiting handoff (or specific one)
    IF p_handoff_id IS NOT NULL THEN
        SELECT * INTO v_handoff
        FROM chatbot_handoff_queue
        WHERE id = p_handoff_id AND status = 'waiting';
    ELSE
        SELECT * INTO v_handoff
        FROM chatbot_handoff_queue
        WHERE status = 'waiting'
        ORDER BY
            CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'normal' THEN 3
                WHEN 'low' THEN 4
            END,
            requested_at
        LIMIT 1;
    END IF;

    IF v_handoff IS NULL THEN
        RETURN NULL;
    END IF;

    -- Find available agent with lowest load
    SELECT id INTO v_agent_id
    FROM chatbot_agents
    WHERE status = 'online'
        AND auto_assign = true
        AND current_chats < max_concurrent_chats
    ORDER BY current_chats, last_active_at DESC
    LIMIT 1;

    IF v_agent_id IS NULL THEN
        RETURN NULL; -- No available agent
    END IF;

    -- Assign to agent
    UPDATE chatbot_handoff_queue
    SET assigned_agent_id = v_agent_id,
        status = 'assigned',
        assigned_at = NOW(),
        wait_time_seconds = EXTRACT(EPOCH FROM (NOW() - requested_at))::INTEGER
    WHERE id = v_handoff.id;

    -- Update agent's current chats
    UPDATE chatbot_agents
    SET current_chats = current_chats + 1,
        last_active_at = NOW()
    WHERE id = v_agent_id;

    -- Update conversation status
    UPDATE chatbot_platform_conversations
    SET status = 'handoff_assigned',
        updated_at = NOW()
    WHERE id = v_handoff.conversation_id;

    -- Recalculate queue positions
    PERFORM recalculate_queue_positions();

    RETURN v_agent_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Recalculate Queue Positions
CREATE OR REPLACE FUNCTION recalculate_queue_positions()
RETURNS VOID AS $$
BEGIN
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (
            ORDER BY
                CASE priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'normal' THEN 3
                    WHEN 'low' THEN 4
                END,
                requested_at
        ) as new_position
        FROM chatbot_handoff_queue
        WHERE status = 'waiting'
    )
    UPDATE chatbot_handoff_queue h
    SET queue_position = r.new_position
    FROM ranked r
    WHERE h.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Function: Start Handoff Chat
CREATE OR REPLACE FUNCTION start_handoff_chat(p_handoff_id UUID, p_agent_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE chatbot_handoff_queue
    SET status = 'in_progress',
        started_at = NOW()
    WHERE id = p_handoff_id
        AND assigned_agent_id = p_agent_id
        AND status = 'assigned';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE chatbot_platform_conversations
    SET status = 'handoff_active',
        updated_at = NOW()
    WHERE id = (
        SELECT conversation_id FROM chatbot_handoff_queue WHERE id = p_handoff_id
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Resolve Handoff
CREATE OR REPLACE FUNCTION resolve_handoff(
    p_handoff_id UUID,
    p_notes TEXT DEFAULT NULL,
    p_csat_score INTEGER DEFAULT NULL,
    p_csat_feedback TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_handoff RECORD;
    v_handle_time INTEGER;
BEGIN
    SELECT * INTO v_handoff
    FROM chatbot_handoff_queue
    WHERE id = p_handoff_id
        AND status IN ('assigned', 'in_progress');

    IF v_handoff IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Calculate handle time
    v_handle_time := EXTRACT(EPOCH FROM (NOW() - COALESCE(v_handoff.started_at, v_handoff.assigned_at)))::INTEGER;

    -- Update handoff record
    UPDATE chatbot_handoff_queue
    SET status = 'resolved',
        resolved_at = NOW(),
        handle_time_seconds = v_handle_time,
        resolution_notes = COALESCE(p_notes, resolution_notes),
        csat_score = p_csat_score,
        csat_feedback = p_csat_feedback
    WHERE id = p_handoff_id;

    -- Update agent stats
    UPDATE chatbot_agents
    SET current_chats = GREATEST(0, current_chats - 1),
        total_handled = total_handled + 1,
        avg_resolution_time_seconds = (
            (avg_resolution_time_seconds * total_handled + v_handle_time) / (total_handled + 1)
        )::INTEGER,
        last_active_at = NOW()
    WHERE id = v_handoff.assigned_agent_id;

    -- Update CSAT if provided
    IF p_csat_score IS NOT NULL THEN
        UPDATE chatbot_agents
        SET avg_csat = (
                (avg_csat * total_csat_ratings + p_csat_score) / (total_csat_ratings + 1)
            ),
            total_csat_ratings = total_csat_ratings + 1
        WHERE id = v_handoff.assigned_agent_id;
    END IF;

    -- Update conversation status
    UPDATE chatbot_platform_conversations
    SET status = 'resolved',
        updated_at = NOW()
    WHERE id = v_handoff.conversation_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Cancel Handoff
CREATE OR REPLACE FUNCTION cancel_handoff(p_handoff_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_handoff RECORD;
BEGIN
    SELECT * INTO v_handoff
    FROM chatbot_handoff_queue
    WHERE id = p_handoff_id
        AND status IN ('waiting', 'assigned');

    IF v_handoff IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update handoff status
    UPDATE chatbot_handoff_queue
    SET status = 'cancelled',
        resolved_at = NOW()
    WHERE id = p_handoff_id;

    -- Free up agent if assigned
    IF v_handoff.assigned_agent_id IS NOT NULL THEN
        UPDATE chatbot_agents
        SET current_chats = GREATEST(0, current_chats - 1)
        WHERE id = v_handoff.assigned_agent_id;
    END IF;

    -- Update conversation status
    UPDATE chatbot_platform_conversations
    SET status = 'active',
        updated_at = NOW()
    WHERE id = v_handoff.conversation_id;

    -- Recalculate queue positions
    PERFORM recalculate_queue_positions();

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Queue Position
CREATE OR REPLACE FUNCTION get_queue_position(p_handoff_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_position INTEGER;
BEGIN
    SELECT queue_position INTO v_position
    FROM chatbot_handoff_queue
    WHERE id = p_handoff_id AND status = 'waiting';

    RETURN COALESCE(v_position, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Update Agent Status
CREATE OR REPLACE FUNCTION update_agent_status(
    p_agent_id UUID,
    p_status agent_status
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE chatbot_agents
    SET status = p_status,
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE id = p_agent_id;

    -- If going offline, reassign pending handoffs
    IF p_status IN ('offline', 'away') THEN
        UPDATE chatbot_handoff_queue
        SET assigned_agent_id = NULL,
            status = 'waiting',
            assigned_at = NULL
        WHERE assigned_agent_id = p_agent_id
            AND status = 'assigned';

        -- Recalculate queue and try auto-assign
        PERFORM recalculate_queue_positions();
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE chatbot_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_handoff_queue ENABLE ROW LEVEL SECURITY;

-- Agents: Read for authenticated, full for service role
CREATE POLICY "agents_read_policy" ON chatbot_agents
    FOR SELECT
    USING (true);

CREATE POLICY "agents_self_update" ON chatbot_agents
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "agents_service_policy" ON chatbot_agents
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Handoff: Full access for agents and service role
CREATE POLICY "handoff_read_policy" ON chatbot_handoff_queue
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chatbot_agents
            WHERE user_id = auth.uid()
        )
        OR auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "handoff_service_policy" ON chatbot_handoff_queue
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Update triggers
CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON chatbot_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_timestamp();

CREATE TRIGGER handoff_updated_at
    BEFORE UPDATE ON chatbot_handoff_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_timestamp();

COMMENT ON TABLE chatbot_agents IS 'Human agents for handling handoffs from chatbot';
COMMENT ON TABLE chatbot_handoff_queue IS 'Queue for conversations handed off to human agents';
COMMENT ON FUNCTION request_handoff IS 'Create a new handoff request for a conversation';
COMMENT ON FUNCTION auto_assign_handoff IS 'Automatically assign waiting handoffs to available agents';
COMMENT ON FUNCTION resolve_handoff IS 'Resolve a handoff with optional CSAT rating';

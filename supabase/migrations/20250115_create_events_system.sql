-- ==========================================
-- EVENTS CALENDAR SYSTEM
-- Day 35-36: Community Events & Calendar
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- COMMUNITY EVENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('webinar', 'meetup', 'workshop', 'trading_session')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT, -- Physical location or online link
  is_online BOOLEAN DEFAULT TRUE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  required_tier TEXT CHECK (required_tier IN ('TIER1', 'TIER2', 'TIER3')),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- EVENT RSVPS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_community_events_start_time ON public.community_events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_community_events_event_type ON public.community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_community_events_required_tier ON public.community_events(required_tier);
CREATE INDEX IF NOT EXISTS idx_community_events_host ON public.community_events(host_id);
CREATE INDEX IF NOT EXISTS idx_community_events_tags ON public.community_events USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON public.event_rsvps(status);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events Policies
CREATE POLICY "Anyone can view published events"
  ON public.community_events FOR SELECT
  USING (true);

CREATE POLICY "Hosts can create events"
  ON public.community_events FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own events"
  ON public.community_events FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own events"
  ON public.community_events FOR DELETE
  USING (auth.uid() = host_id);

-- RSVP Policies
CREATE POLICY "Anyone can view RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (true);

CREATE POLICY "Users can RSVP to events"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Update event's updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_update_timestamp
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_timestamp();

-- Increment participant count on RSVP
CREATE OR REPLACE FUNCTION increment_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'going' THEN
    UPDATE public.community_events
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_increment_participants
  AFTER INSERT ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_participants();

-- Decrement participant count on RSVP change/delete
CREATE OR REPLACE FUNCTION decrement_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'going' THEN
    UPDATE public.community_events
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_decrement_participants_update
  AFTER UPDATE ON public.event_rsvps
  FOR EACH ROW
  WHEN (OLD.status = 'going' AND NEW.status != 'going')
  EXECUTE FUNCTION decrement_event_participants();

CREATE TRIGGER rsvp_decrement_participants_delete
  AFTER DELETE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION decrement_event_participants();

-- Update RSVP timestamp
CREATE OR REPLACE FUNCTION update_rsvp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_update_timestamp
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_rsvp_timestamp();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE public.community_events IS 'Community events calendar with webinars, meetups, and workshops';
COMMENT ON TABLE public.event_rsvps IS 'User RSVPs for community events';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Events calendar system tables created successfully!';
  RAISE NOTICE '📅 Tables: community_events, event_rsvps';
  RAISE NOTICE '🔐 RLS policies enabled';
  RAISE NOTICE '⚡ Participant count triggers configured';
END $$;

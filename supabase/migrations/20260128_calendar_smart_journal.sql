-- =====================================================
-- CALENDAR SMART JOURNAL - DATABASE MIGRATION
-- File: migrations/20260128_calendar_smart_journal.sql
-- Created: January 28, 2026
-- Description: Smart Journal System integrating 6 data sources
-- Run this BEFORE implementing any service code
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: calendar_journal_entries
-- Main journal entries (reflection, gratitude, quick notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Date & Type
  entry_date DATE NOT NULL,
  entry_type VARCHAR(30) NOT NULL DEFAULT 'reflection',
  -- Types: 'reflection', 'gratitude', 'goal_note', 'ritual_reflection', 'quick_note'

  -- Content
  title VARCHAR(200),
  content TEXT NOT NULL,

  -- Mood tracking
  mood VARCHAR(20), -- 'happy', 'peaceful', 'neutral', 'sad', 'stressed', 'excited', 'anxious'
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),

  -- Categorization
  life_area VARCHAR(30), -- 'finance', 'health', 'career', 'relationships', 'personal', 'spiritual'
  tags TEXT[] DEFAULT '{}',

  -- Related entities
  related_ritual_id UUID,
  related_goal_id UUID,
  related_habit_id UUID,

  -- Media
  attachments JSONB DEFAULT '[]',
  -- Format: [{url, type: 'image'|'file', name, size, uploaded_at}]
  voice_note_url TEXT,
  voice_note_duration INTEGER, -- seconds

  -- Metadata
  is_pinned BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  word_count INTEGER DEFAULT 0,

  -- Onboarding tracking
  is_first_entry BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON calendar_journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_type ON calendar_journal_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_journal_mood ON calendar_journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_life_area ON calendar_journal_entries(life_area);
CREATE INDEX IF NOT EXISTS idx_journal_tags ON calendar_journal_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_journal_pinned ON calendar_journal_entries(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_journal_favorite ON calendar_journal_entries(user_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS Policies
ALTER TABLE calendar_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journal_select_own" ON calendar_journal_entries;
CREATE POLICY "journal_select_own" ON calendar_journal_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_insert_own" ON calendar_journal_entries;
CREATE POLICY "journal_insert_own" ON calendar_journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_update_own" ON calendar_journal_entries;
CREATE POLICY "journal_update_own" ON calendar_journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "journal_delete_own" ON calendar_journal_entries;
CREATE POLICY "journal_delete_own" ON calendar_journal_entries
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 2: trading_journal_entries
-- Specialized trading journal with metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS trading_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Link to calendar journal (optional)
  calendar_entry_id UUID REFERENCES calendar_journal_entries(id) ON DELETE SET NULL,

  -- Trade info
  trade_date DATE NOT NULL,
  trade_time TIME,
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),

  -- Pattern & Setup (from Scanner)
  pattern_type VARCHAR(50), -- 'DPD', 'UPU', 'head-shoulders', etc.
  pattern_grade VARCHAR(5) CHECK (pattern_grade IN ('A+', 'A', 'B', 'C', 'D')),
  timeframe VARCHAR(10), -- '15m', '1h', '4h', '1d'
  zone_type VARCHAR(20), -- 'demand', 'supply', 'flip'
  zone_strength INTEGER CHECK (zone_strength >= 1 AND zone_strength <= 5),

  -- Prices
  entry_price DECIMAL(20, 8) NOT NULL,
  exit_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  take_profit_1 DECIMAL(20, 8),
  take_profit_2 DECIMAL(20, 8),
  take_profit_3 DECIMAL(20, 8),

  -- Position sizing
  position_size DECIMAL(20, 8),
  position_value_usdt DECIMAL(20, 2),
  risk_amount_usdt DECIMAL(20, 2),
  risk_percent DECIMAL(5, 2) CHECK (risk_percent >= 0 AND risk_percent <= 100),
  risk_reward_ratio DECIMAL(5, 2),

  -- Result
  pnl_amount DECIMAL(20, 2),
  pnl_percent DECIMAL(10, 4),
  pnl_r DECIMAL(5, 2), -- P/L in R multiples
  result VARCHAR(15) CHECK (result IN ('win', 'loss', 'breakeven', 'open', 'cancelled')),

  -- Analysis notes
  entry_reason TEXT,
  exit_reason TEXT,
  lessons_learned TEXT,
  market_context TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,

  -- Rating & Discipline (1-5)
  execution_rating INTEGER CHECK (execution_rating >= 1 AND execution_rating <= 5),
  setup_rating INTEGER CHECK (setup_rating >= 1 AND setup_rating <= 5),
  management_rating INTEGER CHECK (management_rating >= 1 AND management_rating <= 5),

  -- Discipline checklist (JSONB for flexibility)
  discipline_checklist JSONB DEFAULT '{
    "correct_setup": null,
    "correct_size": null,
    "stop_loss_set": null,
    "waited_confirmation": null,
    "followed_plan": null,
    "no_fomo": null,
    "no_revenge_trade": null,
    "proper_risk_management": null
  }',
  discipline_score INTEGER CHECK (discipline_score >= 0 AND discipline_score <= 100),

  -- Psychology tracking
  pre_trade_emotion VARCHAR(20), -- 'calm', 'anxious', 'greedy', 'fomo', 'confident', 'fearful', 'revenge'
  during_trade_emotion VARCHAR(20),
  post_trade_emotion VARCHAR(20),
  emotional_note TEXT,

  -- Screenshots
  screenshots JSONB DEFAULT '[]',
  -- Format: [{url, caption, type: 'entry'|'exit'|'analysis'|'setup', uploaded_at}]

  -- Source tracking
  source VARCHAR(30) DEFAULT 'manual',
  -- 'manual', 'scanner_signal', 'paper_trade', 'shadow_mode', 'ai_suggestion'
  source_reference_id UUID, -- Reference to scanner_signals or paper_trades

  -- Confirmation tracking
  confirmations_used JSONB DEFAULT '[]', -- ['volume_spike', 'rsi_divergence', 'candle_pattern', etc.]

  -- Timestamps
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  holding_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trading_user_date ON trading_journal_entries(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_symbol ON trading_journal_entries(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_result ON trading_journal_entries(result);
CREATE INDEX IF NOT EXISTS idx_trading_pattern ON trading_journal_entries(pattern_type);
CREATE INDEX IF NOT EXISTS idx_trading_source ON trading_journal_entries(source);
CREATE INDEX IF NOT EXISTS idx_trading_pnl ON trading_journal_entries(user_id, pnl_amount);

-- RLS
ALTER TABLE trading_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "trading_select_own" ON trading_journal_entries;
CREATE POLICY "trading_select_own" ON trading_journal_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_insert_own" ON trading_journal_entries;
CREATE POLICY "trading_insert_own" ON trading_journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_update_own" ON trading_journal_entries;
CREATE POLICY "trading_update_own" ON trading_journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_delete_own" ON trading_journal_entries;
CREATE POLICY "trading_delete_own" ON trading_journal_entries
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 3: calendar_ritual_logs
-- Auto-logged rituals (triggered from ritual completion)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_ritual_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Link to original completion
  ritual_completion_id UUID,

  -- Ritual info
  log_date DATE NOT NULL,
  log_time TIME,
  ritual_slug VARCHAR(50) NOT NULL,
  ritual_name VARCHAR(100) NOT NULL,
  ritual_category VARCHAR(30), -- 'mindfulness', 'manifestation', 'healing', 'gratitude'

  -- Completion details
  duration_seconds INTEGER,
  duration_minutes INTEGER GENERATED ALWAYS AS (duration_seconds / 60) STORED,
  xp_earned INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 1,
  is_streak_bonus BOOLEAN DEFAULT FALSE,

  -- User input from ritual
  user_input TEXT, -- Gratitude items, wishes, letters, etc.
  reflection TEXT,

  -- User can add notes later
  additional_notes TEXT,
  notes_added_at TIMESTAMPTZ,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ritual_logs_user_date ON calendar_ritual_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_logs_slug ON calendar_ritual_logs(ritual_slug);
CREATE INDEX IF NOT EXISTS idx_ritual_logs_category ON calendar_ritual_logs(ritual_category);

-- RLS
ALTER TABLE calendar_ritual_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ritual_logs_select_own" ON calendar_ritual_logs;
CREATE POLICY "ritual_logs_select_own" ON calendar_ritual_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ritual_logs_insert_own" ON calendar_ritual_logs;
CREATE POLICY "ritual_logs_insert_own" ON calendar_ritual_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ritual_logs_update_own" ON calendar_ritual_logs;
CREATE POLICY "ritual_logs_update_own" ON calendar_ritual_logs
  FOR UPDATE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 4: calendar_divination_logs
-- Auto-logged divination readings (Tarot, I Ching, Numerology)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_divination_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Reading info
  log_date DATE NOT NULL,
  log_time TIME,
  reading_type VARCHAR(20) NOT NULL CHECK (reading_type IN ('tarot', 'iching', 'numerology')),

  -- Result
  result_summary TEXT NOT NULL, -- "The Star - Hy vong va doi moi"
  result_data JSONB NOT NULL, -- Full reading data (cards, hexagram, etc.)

  -- For Tarot
  spread_type VARCHAR(30), -- 'single', 'three_card', 'celtic_cross', etc.
  cards_drawn JSONB, -- [{position, card_name, is_reversed}]

  -- For I Ching
  hexagram_number INTEGER,
  hexagram_name VARCHAR(100),
  changing_lines JSONB, -- [1, 3, 6] - lines that are changing

  -- User context
  user_question TEXT,
  user_intention TEXT,
  life_area VARCHAR(30), -- Related life area

  -- User interpretation (added later)
  user_interpretation TEXT,
  interpretation_added_at TIMESTAMPTZ,

  -- User action taken based on reading
  action_taken TEXT,
  action_taken_at TIMESTAMPTZ,

  -- Related entities
  related_goal_id UUID,

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  is_significant BOOLEAN DEFAULT FALSE, -- User marks as important

  -- Timestamps
  reading_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_divination_user_date ON calendar_divination_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_divination_type ON calendar_divination_logs(reading_type);
CREATE INDEX IF NOT EXISTS idx_divination_favorite ON calendar_divination_logs(user_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS
ALTER TABLE calendar_divination_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "divination_select_own" ON calendar_divination_logs;
CREATE POLICY "divination_select_own" ON calendar_divination_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "divination_insert_own" ON calendar_divination_logs;
CREATE POLICY "divination_insert_own" ON calendar_divination_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "divination_update_own" ON calendar_divination_logs;
CREATE POLICY "divination_update_own" ON calendar_divination_logs
  FOR UPDATE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 5: calendar_goal_progress_logs
-- Goal progress notes and milestones
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_goal_progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID NOT NULL,

  -- Log info
  log_date DATE NOT NULL,
  log_time TIME,

  -- Progress tracking
  progress_note TEXT,
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  previous_percent INTEGER,
  progress_change INTEGER GENERATED ALWAYS AS (progress_percent - COALESCE(previous_percent, 0)) STORED,

  -- Milestones
  milestone_title VARCHAR(200),
  milestone_achieved BOOLEAN DEFAULT FALSE,
  milestone_xp INTEGER DEFAULT 0,

  -- Daily stats
  actions_completed_today INTEGER DEFAULT 0,
  actions_total_today INTEGER DEFAULT 0,

  -- Mood about progress
  progress_mood VARCHAR(20), -- 'motivated', 'frustrated', 'proud', 'stuck', 'excited'

  -- Blockers
  blockers TEXT,
  next_steps TEXT,

  -- Auto-logged vs manual
  is_auto_logged BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_date ON calendar_goal_progress_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON calendar_goal_progress_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_milestone ON calendar_goal_progress_logs(milestone_achieved) WHERE milestone_achieved = TRUE;

-- RLS
ALTER TABLE calendar_goal_progress_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goal_progress_select_own" ON calendar_goal_progress_logs;
CREATE POLICY "goal_progress_select_own" ON calendar_goal_progress_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goal_progress_insert_own" ON calendar_goal_progress_logs;
CREATE POLICY "goal_progress_insert_own" ON calendar_goal_progress_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goal_progress_update_own" ON calendar_goal_progress_logs;
CREATE POLICY "goal_progress_update_own" ON calendar_goal_progress_logs
  FOR UPDATE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 6: calendar_daily_mood
-- Daily mood tracking (morning/evening check-ins)
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_daily_mood (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  mood_date DATE NOT NULL,

  -- Morning check-in
  morning_mood VARCHAR(20),
  morning_mood_score INTEGER CHECK (morning_mood_score >= 1 AND morning_mood_score <= 5),
  morning_note TEXT,
  morning_energy INTEGER CHECK (morning_energy >= 1 AND morning_energy <= 5),
  morning_sleep_quality INTEGER CHECK (morning_sleep_quality >= 1 AND morning_sleep_quality <= 5),
  morning_checked_at TIMESTAMPTZ,

  -- Midday check-in (optional)
  midday_mood VARCHAR(20),
  midday_mood_score INTEGER CHECK (midday_mood_score >= 1 AND midday_mood_score <= 5),
  midday_note TEXT,
  midday_checked_at TIMESTAMPTZ,

  -- Evening check-in
  evening_mood VARCHAR(20),
  evening_mood_score INTEGER CHECK (evening_mood_score >= 1 AND evening_mood_score <= 5),
  evening_note TEXT,
  evening_productivity INTEGER CHECK (evening_productivity >= 1 AND evening_productivity <= 5),
  evening_gratitude TEXT, -- Quick gratitude
  evening_checked_at TIMESTAMPTZ,

  -- Overall (calculated or manually set)
  overall_mood VARCHAR(20),
  overall_mood_score INTEGER CHECK (overall_mood_score >= 1 AND overall_mood_score <= 5),

  -- Factors affecting mood
  mood_factors JSONB DEFAULT '[]',
  -- ['good_sleep', 'exercise', 'stress', 'social', 'weather', 'work', 'health', etc.]

  -- Day highlights
  day_highlight TEXT,
  day_lowlight TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, mood_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_mood_user_date ON calendar_daily_mood(user_id, mood_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_mood_score ON calendar_daily_mood(overall_mood_score);

-- RLS
ALTER TABLE calendar_daily_mood ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mood_select_own" ON calendar_daily_mood;
CREATE POLICY "mood_select_own" ON calendar_daily_mood
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mood_insert_own" ON calendar_daily_mood;
CREATE POLICY "mood_insert_own" ON calendar_daily_mood
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mood_update_own" ON calendar_daily_mood;
CREATE POLICY "mood_update_own" ON calendar_daily_mood
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mood_delete_own" ON calendar_daily_mood;
CREATE POLICY "mood_delete_own" ON calendar_daily_mood
  FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 7: calendar_user_settings
-- User preferences for calendar features
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Onboarding
  has_seen_onboarding BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,

  -- Feature settings
  auto_log_rituals BOOLEAN DEFAULT TRUE,
  auto_log_divination BOOLEAN DEFAULT TRUE,
  auto_log_goals BOOLEAN DEFAULT TRUE,

  -- Reminder settings
  morning_mood_reminder BOOLEAN DEFAULT TRUE,
  morning_reminder_time TIME DEFAULT '07:00',
  evening_mood_reminder BOOLEAN DEFAULT TRUE,
  evening_reminder_time TIME DEFAULT '21:00',
  journal_reminder BOOLEAN DEFAULT FALSE,
  journal_reminder_time TIME DEFAULT '20:00',

  -- Display settings
  default_calendar_view VARCHAR(20) DEFAULT 'month', -- 'month', 'week', 'day'
  show_mood_on_calendar BOOLEAN DEFAULT TRUE,
  show_trading_on_calendar BOOLEAN DEFAULT TRUE,
  show_divination_on_calendar BOOLEAN DEFAULT TRUE,

  -- Privacy
  share_mood_with_coach BOOLEAN DEFAULT FALSE,
  share_trading_with_community BOOLEAN DEFAULT FALSE,

  -- Notification token for push
  push_token TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS
ALTER TABLE calendar_user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_all_own" ON calendar_user_settings;
CREATE POLICY "settings_all_own" ON calendar_user_settings
  FOR ALL USING (auth.uid() = user_id);


-- =====================================================
-- TABLE 8: calendar_notification_queue
-- Queue for scheduled notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  notification_type VARCHAR(50) NOT NULL,
  -- Types: 'morning_mood', 'evening_mood', 'journal_reminder', 'streak_at_risk', 'milestone'

  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',

  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT FALSE,

  -- Error tracking
  send_attempts INTEGER DEFAULT 0,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for processing
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending
  ON calendar_notification_queue(scheduled_at)
  WHERE is_sent = FALSE;

-- RLS
ALTER TABLE calendar_notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_select_own" ON calendar_notification_queue;
CREATE POLICY "notification_select_own" ON calendar_notification_queue
  FOR SELECT USING (auth.uid() = user_id);


-- =====================================================
-- UPDATE existing vision_daily_summary table
-- Add new columns for journal integration
-- =====================================================
DO $$
BEGIN
  -- Add journal_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'journal_count') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN journal_count INTEGER DEFAULT 0;
  END IF;

  -- Add trading_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'trading_count') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN trading_count INTEGER DEFAULT 0;
  END IF;

  -- Add trading_pnl
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'trading_pnl') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN trading_pnl DECIMAL(20, 2) DEFAULT 0;
  END IF;

  -- Add trading stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'trading_wins') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN trading_wins INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'trading_losses') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN trading_losses INTEGER DEFAULT 0;
  END IF;

  -- Add divination_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'divination_count') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN divination_count INTEGER DEFAULT 0;
  END IF;

  -- Add mood columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'mood_morning') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN mood_morning VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'mood_evening') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN mood_evening VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'mood_overall') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN mood_overall VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'mood_score') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN mood_score INTEGER;
  END IF;

  -- Add notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_daily_summary' AND column_name = 'day_notes') THEN
    ALTER TABLE vision_daily_summary ADD COLUMN day_notes TEXT;
  END IF;
END $$;


-- =====================================================
-- FUNCTION: Auto-log ritual to calendar
-- Triggered when ritual is completed
-- =====================================================
CREATE OR REPLACE FUNCTION fn_auto_log_ritual_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
  v_ritual_name VARCHAR(100);
  v_ritual_category VARCHAR(30);
  v_user_settings RECORD;
BEGIN
  -- Check if user has auto-logging enabled
  SELECT * INTO v_user_settings
  FROM calendar_user_settings
  WHERE user_id = NEW.user_id;

  -- If no settings or auto_log enabled (default TRUE)
  IF v_user_settings IS NULL OR v_user_settings.auto_log_rituals = TRUE THEN

    -- Get ritual name from slug
    v_ritual_name := CASE NEW.ritual_slug
      WHEN 'heart-expansion' THEN 'Heart Expansion'
      WHEN 'heart-opening' THEN 'Heart Expansion'
      WHEN 'gratitude-flow' THEN 'Gratitude Flow'
      WHEN 'cleansing-breath' THEN 'Cleansing Breath'
      WHEN 'purify-breathwork' THEN 'Cleansing Breath'
      WHEN 'water-manifest' THEN 'Water Manifest'
      WHEN 'letter-to-universe' THEN 'Letter to Universe'
      WHEN 'burn-release' THEN 'Burn & Release'
      WHEN 'star-wish' THEN 'Star Wish'
      WHEN 'crystal-healing' THEN 'Crystal Healing'
      ELSE INITCAP(REPLACE(NEW.ritual_slug, '-', ' '))
    END;

    -- Get category
    v_ritual_category := CASE NEW.ritual_slug
      WHEN 'heart-expansion' THEN 'healing'
      WHEN 'heart-opening' THEN 'healing'
      WHEN 'gratitude-flow' THEN 'gratitude'
      WHEN 'cleansing-breath' THEN 'mindfulness'
      WHEN 'purify-breathwork' THEN 'mindfulness'
      WHEN 'water-manifest' THEN 'manifestation'
      WHEN 'letter-to-universe' THEN 'manifestation'
      WHEN 'burn-release' THEN 'healing'
      WHEN 'star-wish' THEN 'manifestation'
      WHEN 'crystal-healing' THEN 'healing'
      ELSE 'mindfulness'
    END;

    -- Insert to calendar_ritual_logs
    INSERT INTO calendar_ritual_logs (
      user_id,
      ritual_completion_id,
      log_date,
      log_time,
      ritual_slug,
      ritual_name,
      ritual_category,
      xp_earned,
      user_input,
      reflection,
      completed_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      DATE(NEW.completed_at),
      (NEW.completed_at)::TIME,
      NEW.ritual_slug,
      v_ritual_name,
      v_ritual_category,
      COALESCE(NEW.xp_earned, 25),
      NEW.content,
      NEW.reflection,
      NEW.completed_at
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_auto_log_ritual ON vision_ritual_completions;
CREATE TRIGGER trg_auto_log_ritual
  AFTER INSERT ON vision_ritual_completions
  FOR EACH ROW
  EXECUTE FUNCTION fn_auto_log_ritual_to_calendar();


-- =====================================================
-- FUNCTION: Update daily summary after journal entry
-- =====================================================
CREATE OR REPLACE FUNCTION fn_update_summary_on_journal()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert daily summary
  INSERT INTO vision_daily_summary (user_id, summary_date, journal_count)
  VALUES (NEW.user_id, NEW.entry_date, 1)
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    journal_count = COALESCE(vision_daily_summary.journal_count, 0) + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_summary_journal ON calendar_journal_entries;
CREATE TRIGGER trg_update_summary_journal
  AFTER INSERT ON calendar_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_summary_on_journal();


-- =====================================================
-- FUNCTION: Update daily summary after trading entry
-- =====================================================
CREATE OR REPLACE FUNCTION fn_update_summary_on_trading()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert daily summary
  INSERT INTO vision_daily_summary (
    user_id, summary_date, trading_count, trading_pnl, trading_wins, trading_losses
  )
  VALUES (
    NEW.user_id,
    NEW.trade_date,
    1,
    COALESCE(NEW.pnl_amount, 0),
    CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    trading_count = COALESCE(vision_daily_summary.trading_count, 0) + 1,
    trading_pnl = COALESCE(vision_daily_summary.trading_pnl, 0) + COALESCE(NEW.pnl_amount, 0),
    trading_wins = COALESCE(vision_daily_summary.trading_wins, 0) +
      CASE WHEN NEW.result = 'win' THEN 1 ELSE 0 END,
    trading_losses = COALESCE(vision_daily_summary.trading_losses, 0) +
      CASE WHEN NEW.result = 'loss' THEN 1 ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_summary_trading ON trading_journal_entries;
CREATE TRIGGER trg_update_summary_trading
  AFTER INSERT ON trading_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_summary_on_trading();


-- =====================================================
-- FUNCTION: Get full day calendar data
-- Returns all activities for a specific day
-- =====================================================
CREATE OR REPLACE FUNCTION get_day_calendar_data(
  p_user_id UUID,
  p_date DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'date', p_date,
    'date_display', TO_CHAR(p_date, 'DD/MM/YYYY'),
    'day_name', TO_CHAR(p_date, 'Day'),

    -- Daily summary
    'summary', (
      SELECT jsonb_build_object(
        'daily_score', COALESCE(daily_score, 0),
        'xp_earned', COALESCE(xp_earned, 0),
        'goals_completed', COALESCE(actions_completed, 0),
        'goals_total', COALESCE(actions_total, 0),
        'habits_completed', COALESCE(habits_completed, 0),
        'ritual_completed', COALESCE(ritual_completed, FALSE),
        'journal_count', COALESCE(journal_count, 0),
        'trading_count', COALESCE(trading_count, 0),
        'trading_pnl', COALESCE(trading_pnl, 0),
        'trading_wins', COALESCE(trading_wins, 0),
        'trading_losses', COALESCE(trading_losses, 0),
        'divination_count', COALESCE(divination_count, 0)
      )
      FROM vision_daily_summary
      WHERE user_id = p_user_id AND summary_date = p_date
    ),

    -- Mood data
    'mood', (
      SELECT jsonb_build_object(
        'id', id,
        'morning_mood', morning_mood,
        'morning_score', morning_mood_score,
        'morning_note', morning_note,
        'evening_mood', evening_mood,
        'evening_score', evening_mood_score,
        'evening_note', evening_note,
        'overall_mood', overall_mood,
        'overall_score', overall_mood_score,
        'factors', mood_factors,
        'highlight', day_highlight,
        'lowlight', day_lowlight
      )
      FROM calendar_daily_mood
      WHERE user_id = p_user_id AND mood_date = p_date
    ),

    -- Rituals
    'rituals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'type', 'ritual',
        'ritual_name', ritual_name,
        'ritual_slug', ritual_slug,
        'category', ritual_category,
        'xp_earned', xp_earned,
        'duration_minutes', duration_minutes,
        'user_input', user_input,
        'reflection', reflection,
        'additional_notes', additional_notes,
        'completed_at', completed_at,
        'timestamp', completed_at
      ) ORDER BY completed_at)
      FROM calendar_ritual_logs
      WHERE user_id = p_user_id AND log_date = p_date
    ), '[]'::jsonb),

    -- Journals
    'journals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'type', 'journal',
        'entry_type', entry_type,
        'title', title,
        'content', content,
        'mood', mood,
        'mood_score', mood_score,
        'tags', tags,
        'life_area', life_area,
        'is_pinned', is_pinned,
        'is_favorite', is_favorite,
        'attachments', attachments,
        'created_at', created_at,
        'timestamp', created_at
      ) ORDER BY created_at)
      FROM calendar_journal_entries
      WHERE user_id = p_user_id AND entry_date = p_date
    ), '[]'::jsonb),

    -- Trades
    'trades', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'type', 'trade',
        'symbol', symbol,
        'direction', direction,
        'pattern_type', pattern_type,
        'pattern_grade', pattern_grade,
        'entry_price', entry_price,
        'exit_price', exit_price,
        'pnl_amount', pnl_amount,
        'pnl_percent', pnl_percent,
        'result', result,
        'discipline_score', discipline_score,
        'execution_rating', execution_rating,
        'pre_trade_emotion', pre_trade_emotion,
        'lessons_learned', lessons_learned,
        'entry_time', entry_time,
        'exit_time', exit_time,
        'timestamp', COALESCE(entry_time, created_at)
      ) ORDER BY COALESCE(entry_time, created_at))
      FROM trading_journal_entries
      WHERE user_id = p_user_id AND trade_date = p_date
    ), '[]'::jsonb),

    -- Divinations
    'divinations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'type', 'divination',
        'reading_type', reading_type,
        'result_summary', result_summary,
        'spread_type', spread_type,
        'cards_drawn', cards_drawn,
        'hexagram_number', hexagram_number,
        'hexagram_name', hexagram_name,
        'user_question', user_question,
        'user_interpretation', user_interpretation,
        'is_favorite', is_favorite,
        'reading_at', reading_at,
        'timestamp', reading_at
      ) ORDER BY reading_at)
      FROM calendar_divination_logs
      WHERE user_id = p_user_id AND log_date = p_date
    ), '[]'::jsonb),

    -- Goal progress
    'goal_progress', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', gpl.id,
        'type', 'goal_progress',
        'goal_id', gpl.goal_id,
        'goal_title', g.title,
        'goal_life_area', g.life_area,
        'progress_note', gpl.progress_note,
        'progress_percent', gpl.progress_percent,
        'progress_change', gpl.progress_change,
        'milestone_title', gpl.milestone_title,
        'milestone_achieved', gpl.milestone_achieved,
        'progress_mood', gpl.progress_mood,
        'blockers', gpl.blockers,
        'next_steps', gpl.next_steps,
        'created_at', gpl.created_at,
        'timestamp', gpl.created_at
      ) ORDER BY gpl.created_at)
      FROM calendar_goal_progress_logs gpl
      LEFT JOIN vision_goals g ON gpl.goal_id = g.id
      WHERE gpl.user_id = p_user_id AND gpl.log_date = p_date
    ), '[]'::jsonb)

  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: Get calendar month markers
-- Returns activity indicators for month view
-- =====================================================
CREATE OR REPLACE FUNCTION get_calendar_month_markers(
  p_user_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_result JSONB;
BEGIN
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  SELECT jsonb_agg(day_data ORDER BY date)
  INTO v_result
  FROM (
    SELECT
      d.date,
      jsonb_build_object(
        'date', d.date,
        'daily_score', COALESCE(s.daily_score, 0),
        'has_journal', COALESCE(s.journal_count, 0) > 0,
        'has_trade', COALESCE(s.trading_count, 0) > 0,
        'has_ritual', COALESCE(r.ritual_count, 0) > 0,
        'has_divination', COALESCE(dv.div_count, 0) > 0,
        'has_mood', m.id IS NOT NULL,
        'mood_score', m.overall_mood_score,
        'mood', m.overall_mood,
        'xp_earned', COALESCE(s.xp_earned, 0),
        'trading_pnl', COALESCE(s.trading_pnl, 0),
        'activity_count',
          COALESCE(s.journal_count, 0) +
          COALESCE(s.trading_count, 0) +
          COALESCE(r.ritual_count, 0) +
          COALESCE(dv.div_count, 0),
        'score_color', CASE
          WHEN COALESCE(s.daily_score, 0) >= 80 THEN 'gold'
          WHEN COALESCE(s.daily_score, 0) >= 60 THEN 'green'
          WHEN COALESCE(s.daily_score, 0) >= 40 THEN 'yellow'
          WHEN COALESCE(s.daily_score, 0) > 0 THEN 'red'
          ELSE 'none'
        END
      ) as day_data
    FROM generate_series(v_start_date, v_end_date, '1 day'::INTERVAL) as d(date)
    LEFT JOIN vision_daily_summary s
      ON s.user_id = p_user_id AND s.summary_date = d.date
    LEFT JOIN (
      SELECT log_date, COUNT(*) as ritual_count
      FROM calendar_ritual_logs
      WHERE user_id = p_user_id
        AND log_date BETWEEN v_start_date AND v_end_date
      GROUP BY log_date
    ) r ON r.log_date = d.date
    LEFT JOIN (
      SELECT log_date, COUNT(*) as div_count
      FROM calendar_divination_logs
      WHERE user_id = p_user_id
        AND log_date BETWEEN v_start_date AND v_end_date
      GROUP BY log_date
    ) dv ON dv.log_date = d.date
    LEFT JOIN calendar_daily_mood m
      ON m.user_id = p_user_id AND m.mood_date = d.date
  ) sub;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- FUNCTION: Get trading journal stats
-- Returns trading performance metrics
-- =====================================================
CREATE OR REPLACE FUNCTION get_trading_journal_stats(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_start DATE;
  v_end DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end := COALESCE(p_end_date, CURRENT_DATE);

  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start', v_start,
      'end', v_end,
      'days', v_end - v_start + 1
    ),
    'overview', jsonb_build_object(
      'total_trades', COUNT(*),
      'wins', COUNT(*) FILTER (WHERE result = 'win'),
      'losses', COUNT(*) FILTER (WHERE result = 'loss'),
      'breakeven', COUNT(*) FILTER (WHERE result = 'breakeven'),
      'open', COUNT(*) FILTER (WHERE result = 'open'),
      'win_rate', ROUND(
        COUNT(*) FILTER (WHERE result = 'win')::DECIMAL /
        NULLIF(COUNT(*) FILTER (WHERE result IN ('win', 'loss')), 0) * 100, 2
      )
    ),
    'pnl', jsonb_build_object(
      'total', COALESCE(SUM(pnl_amount), 0),
      'gross_profit', COALESCE(SUM(pnl_amount) FILTER (WHERE pnl_amount > 0), 0),
      'gross_loss', COALESCE(SUM(pnl_amount) FILTER (WHERE pnl_amount < 0), 0),
      'avg_win', COALESCE(AVG(pnl_amount) FILTER (WHERE result = 'win'), 0),
      'avg_loss', COALESCE(AVG(pnl_amount) FILTER (WHERE result = 'loss'), 0),
      'largest_win', COALESCE(MAX(pnl_amount), 0),
      'largest_loss', COALESCE(MIN(pnl_amount), 0),
      'profit_factor', ROUND(
        ABS(COALESCE(SUM(pnl_amount) FILTER (WHERE pnl_amount > 0), 0)) /
        NULLIF(ABS(COALESCE(SUM(pnl_amount) FILTER (WHERE pnl_amount < 0), 1)), 0), 2
      )
    ),
    'discipline', jsonb_build_object(
      'avg_score', ROUND(AVG(discipline_score), 1),
      'avg_execution', ROUND(AVG(execution_rating), 1),
      'trades_with_stop_loss', COUNT(*) FILTER (WHERE stop_loss IS NOT NULL),
      'followed_plan_rate', ROUND(
        COUNT(*) FILTER (WHERE (discipline_checklist->>'followed_plan')::BOOLEAN = TRUE)::DECIMAL /
        NULLIF(COUNT(*), 0) * 100, 1
      )
    ),
    'patterns', (
      SELECT jsonb_agg(pattern_stat)
      FROM (
        SELECT jsonb_build_object(
          'pattern', pattern_type,
          'count', COUNT(*),
          'win_rate', ROUND(
            COUNT(*) FILTER (WHERE result = 'win')::DECIMAL /
            NULLIF(COUNT(*) FILTER (WHERE result IN ('win', 'loss')), 0) * 100, 1
          ),
          'total_pnl', SUM(pnl_amount)
        ) as pattern_stat
        FROM trading_journal_entries
        WHERE user_id = p_user_id
          AND trade_date BETWEEN v_start AND v_end
          AND pattern_type IS NOT NULL
        GROUP BY pattern_type
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) sub
    ),
    'emotions', jsonb_build_object(
      'most_common_pre', (
        SELECT pre_trade_emotion
        FROM trading_journal_entries
        WHERE user_id = p_user_id AND trade_date BETWEEN v_start AND v_end
        GROUP BY pre_trade_emotion
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ),
      'best_emotion', (
        SELECT pre_trade_emotion
        FROM trading_journal_entries
        WHERE user_id = p_user_id AND trade_date BETWEEN v_start AND v_end
          AND pre_trade_emotion IS NOT NULL
        GROUP BY pre_trade_emotion
        HAVING COUNT(*) >= 3
        ORDER BY
          COUNT(*) FILTER (WHERE result = 'win')::DECIMAL /
          NULLIF(COUNT(*) FILTER (WHERE result IN ('win', 'loss')), 0) DESC
        LIMIT 1
      )
    )
  ) INTO v_result
  FROM trading_journal_entries
  WHERE user_id = p_user_id
    AND trade_date BETWEEN v_start AND v_end;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- GRANTS: Grant execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_day_calendar_data(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_month_markers(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trading_journal_stats(UUID, DATE, DATE) TO authenticated;


-- =====================================================
-- COMMENTS: Document tables
-- =====================================================
COMMENT ON TABLE calendar_journal_entries IS 'Main journal entries for Calendar Smart Journal - reflections, gratitude, notes';
COMMENT ON TABLE trading_journal_entries IS 'Trading journal with detailed metrics, psychology tracking, discipline checklist';
COMMENT ON TABLE calendar_ritual_logs IS 'Auto-logged ritual completions from vision_ritual_completions trigger';
COMMENT ON TABLE calendar_divination_logs IS 'Tarot and I Ching readings logged from divination services';
COMMENT ON TABLE calendar_goal_progress_logs IS 'Goal progress notes and milestone achievements';
COMMENT ON TABLE calendar_daily_mood IS 'Daily mood tracking with morning, midday, and evening check-ins';
COMMENT ON TABLE calendar_user_settings IS 'User preferences for calendar features, notifications, and display';
COMMENT ON TABLE calendar_notification_queue IS 'Queue for scheduled push notifications';

COMMENT ON FUNCTION get_day_calendar_data IS 'Returns all calendar activities for a specific day as JSONB';
COMMENT ON FUNCTION get_calendar_month_markers IS 'Returns activity markers for each day in a month for calendar heatmap';
COMMENT ON FUNCTION get_trading_journal_stats IS 'Returns trading performance statistics for a date range';

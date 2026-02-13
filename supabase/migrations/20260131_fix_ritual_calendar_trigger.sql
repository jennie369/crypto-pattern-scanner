-- =====================================================
-- FIX: ritual_slug column error in trigger
-- File: migrations/20260131_fix_ritual_calendar_trigger.sql
-- Created: January 31, 2026
-- Issue: Trigger fn_auto_log_ritual_to_calendar references
--        NEW.ritual_slug but table uses ritual_id
-- =====================================================

-- Drop and recreate the function with correct column reference
CREATE OR REPLACE FUNCTION fn_auto_log_ritual_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
  v_ritual_name VARCHAR(100);
  v_ritual_category VARCHAR(30);
  v_user_settings RECORD;
  v_user_input TEXT;
BEGIN
  -- Check if user has auto-logging enabled
  SELECT * INTO v_user_settings
  FROM calendar_user_settings
  WHERE user_id = NEW.user_id;

  -- If no settings or auto_log enabled (default TRUE)
  IF v_user_settings IS NULL OR v_user_settings.auto_log_rituals = TRUE THEN

    -- Get ritual name from ritual_id (which is the slug)
    -- FIX: Changed NEW.ritual_slug to NEW.ritual_id
    v_ritual_name := CASE NEW.ritual_id
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
      ELSE INITCAP(REPLACE(NEW.ritual_id, '-', ' '))
    END;

    -- Get category
    -- FIX: Changed NEW.ritual_slug to NEW.ritual_id
    v_ritual_category := CASE NEW.ritual_id
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

    -- Handle user_input - check if content column exists and extract
    -- The content column is JSONB, user_input is the old TEXT column
    v_user_input := COALESCE(
      NEW.user_input,
      CASE WHEN NEW.content IS NOT NULL THEN NEW.content::TEXT ELSE NULL END
    );

    -- Insert to calendar_ritual_logs
    -- FIX: Changed NEW.ritual_slug to NEW.ritual_id in values
    INSERT INTO calendar_ritual_logs (
      user_id,
      ritual_completion_id,
      log_date,
      log_time,
      ritual_slug,
      ritual_name,
      ritual_category,
      duration_seconds,
      xp_earned,
      user_input,
      reflection,
      completed_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      DATE(NEW.completed_at),
      (NEW.completed_at)::TIME,
      NEW.ritual_id,  -- FIX: was NEW.ritual_slug
      v_ritual_name,
      v_ritual_category,
      NEW.duration_seconds,
      COALESCE(NEW.xp_earned, 25),
      v_user_input,
      NEW.reflection,
      NEW.completed_at
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger already exists, no need to recreate
-- The function replacement will take effect immediately

-- Add a comment to document the fix
COMMENT ON FUNCTION fn_auto_log_ritual_to_calendar IS
  'Auto-logs ritual completions to calendar_ritual_logs. Fixed 2026-01-31: Changed ritual_slug to ritual_id';

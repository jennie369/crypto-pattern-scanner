-- =============================================
-- READING HISTORY TABLES
-- Stores Tarot and I Ching reading history
-- =============================================

-- 1. Create tarot_readings table
CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reading info
  spread_type TEXT NOT NULL,
  spread_id TEXT,  -- Optional reference to spread config
  question TEXT,
  life_area TEXT CHECK (life_area IN ('general', 'love', 'career', 'health', 'money', 'family', 'trading')),

  -- Cards drawn
  cards JSONB NOT NULL DEFAULT '[]',
  -- Format: [{ "position": 0, "card_id": "the-fool", "reversed": false, "interpretation": "..." }]

  -- Interpretations
  overall_interpretation TEXT,
  ai_interpretation TEXT,

  -- Recommendations
  crystal_recommendations JSONB DEFAULT '[]',
  affirmation TEXT,

  -- Vision Board integration
  vision_goal_id UUID,  -- Optional reference to vision goal

  -- Export
  exported BOOLEAN DEFAULT FALSE,
  export_url TEXT,

  -- User actions
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Metadata
  reading_duration_seconds INT,
  reversed_enabled BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create iching_readings table
CREATE TABLE IF NOT EXISTS iching_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Question info
  question TEXT,
  life_area TEXT CHECK (life_area IN ('general', 'love', 'career', 'health', 'money', 'family', 'trading')),

  -- Hexagram data
  present_hexagram INT NOT NULL CHECK (present_hexagram BETWEEN 1 AND 64),
  changing_lines INT[] DEFAULT '{}',
  -- Format: [1, 3, 5] = lines 1, 3, 5 are changing
  future_hexagram INT CHECK (future_hexagram BETWEEN 1 AND 64),

  -- Coin casting results
  cast_results JSONB DEFAULT '[]',
  -- Format: [{"line": 1, "coins": [3, 2, 2], "sum": 7, "type": "young_yang"}]

  -- Interpretations
  present_interpretation TEXT,
  changing_interpretation TEXT,
  future_interpretation TEXT,
  overall_interpretation TEXT,
  ai_interpretation TEXT,

  -- Recommendations
  crystal_recommendations JSONB DEFAULT '[]',
  affirmation TEXT,

  -- Vision Board integration
  vision_goal_id UUID,  -- Optional reference to vision goal

  -- Export
  exported BOOLEAN DEFAULT FALSE,
  export_url TEXT,

  -- User actions
  starred BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Metadata
  casting_method TEXT DEFAULT 'coin' CHECK (casting_method IN ('coin', 'card', 'random')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_tarot_readings_user ON tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_user_created ON tarot_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_spread ON tarot_readings(spread_type);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_starred ON tarot_readings(user_id, starred) WHERE starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_tarot_readings_life_area ON tarot_readings(life_area);

CREATE INDEX IF NOT EXISTS idx_iching_readings_user ON iching_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_iching_readings_user_created ON iching_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iching_readings_hexagram ON iching_readings(present_hexagram);
CREATE INDEX IF NOT EXISTS idx_iching_readings_starred ON iching_readings(user_id, starred) WHERE starred = TRUE;

-- 4. Enable RLS
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iching_readings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Tarot Readings
CREATE POLICY "Users can view own tarot readings" ON tarot_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tarot readings" ON tarot_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tarot readings" ON tarot_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tarot readings" ON tarot_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. RLS Policies - I Ching Readings
CREATE POLICY "Users can view own iching readings" ON iching_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own iching readings" ON iching_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own iching readings" ON iching_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own iching readings" ON iching_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Updated_at triggers
CREATE OR REPLACE FUNCTION update_tarot_readings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_iching_readings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tarot_readings_updated_at ON tarot_readings;
CREATE TRIGGER trg_tarot_readings_updated_at
  BEFORE UPDATE ON tarot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_tarot_readings_updated_at();

DROP TRIGGER IF EXISTS trg_iching_readings_updated_at ON iching_readings;
CREATE TRIGGER trg_iching_readings_updated_at
  BEFORE UPDATE ON iching_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_iching_readings_updated_at();

-- 8. RPC Functions

-- Get reading history with pagination
CREATE OR REPLACE FUNCTION get_reading_history(
  p_user_id UUID,
  p_type TEXT DEFAULT 'all',  -- 'tarot', 'iching', 'all'
  p_life_area TEXT DEFAULT NULL,
  p_starred_only BOOLEAN DEFAULT FALSE,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  spread_type TEXT,
  question TEXT,
  life_area TEXT,
  starred BOOLEAN,
  created_at TIMESTAMPTZ,
  preview_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  (
    -- Tarot readings
    SELECT
      tr.id,
      'tarot'::TEXT as type,
      tr.spread_type,
      tr.question,
      tr.life_area,
      tr.starred,
      tr.created_at,
      jsonb_build_object(
        'cards_count', jsonb_array_length(tr.cards),
        'first_card', tr.cards->0->>'card_id'
      ) as preview_data
    FROM tarot_readings tr
    WHERE tr.user_id = p_user_id
      AND (p_type = 'all' OR p_type = 'tarot')
      AND (p_life_area IS NULL OR tr.life_area = p_life_area)
      AND (NOT p_starred_only OR tr.starred = TRUE)

    UNION ALL

    -- I Ching readings
    SELECT
      ir.id,
      'iching'::TEXT as type,
      'iching'::TEXT as spread_type,
      ir.question,
      ir.life_area,
      ir.starred,
      ir.created_at,
      jsonb_build_object(
        'hexagram', ir.present_hexagram,
        'has_changing', array_length(ir.changing_lines, 1) > 0
      ) as preview_data
    FROM iching_readings ir
    WHERE ir.user_id = p_user_id
      AND (p_type = 'all' OR p_type = 'iching')
      AND (p_life_area IS NULL OR ir.life_area = p_life_area)
      AND (NOT p_starred_only OR ir.starred = TRUE)
  )
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Toggle star reading
CREATE OR REPLACE FUNCTION toggle_reading_star(
  p_reading_id UUID,
  p_type TEXT  -- 'tarot' or 'iching'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_starred BOOLEAN;
BEGIN
  IF p_type = 'tarot' THEN
    UPDATE tarot_readings
    SET starred = NOT starred
    WHERE id = p_reading_id AND user_id = auth.uid()
    RETURNING starred INTO v_new_starred;
  ELSIF p_type = 'iching' THEN
    UPDATE iching_readings
    SET starred = NOT starred
    WHERE id = p_reading_id AND user_id = auth.uid()
    RETURNING starred INTO v_new_starred;
  END IF;

  RETURN v_new_starred;
END;
$$;

-- Get reading count by type
CREATE OR REPLACE FUNCTION get_reading_stats(p_user_id UUID)
RETURNS TABLE (
  total_readings BIGINT,
  tarot_count BIGINT,
  iching_count BIGINT,
  starred_count BIGINT,
  this_week_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM tarot_readings WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM iching_readings WHERE user_id = p_user_id) as total_readings,
    (SELECT COUNT(*) FROM tarot_readings WHERE user_id = p_user_id) as tarot_count,
    (SELECT COUNT(*) FROM iching_readings WHERE user_id = p_user_id) as iching_count,
    (SELECT COUNT(*) FROM tarot_readings WHERE user_id = p_user_id AND starred = TRUE) +
    (SELECT COUNT(*) FROM iching_readings WHERE user_id = p_user_id AND starred = TRUE) as starred_count,
    (SELECT COUNT(*) FROM tarot_readings WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days') +
    (SELECT COUNT(*) FROM iching_readings WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days') as this_week_count;
END;
$$;

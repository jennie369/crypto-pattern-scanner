-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 2C: Compression + Inducement + Look Right
-- Migration for compression patterns, stop hunt detection, zone validity
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1: zone_history table - Add compression and inducement columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE zone_history
ADD COLUMN IF NOT EXISTS has_compression BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compression_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS compression_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS compression_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS has_inducement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inducement_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS inducement_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS inducement_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS inducement_sweep_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS look_right_valid BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS look_right_status VARCHAR(15) DEFAULT 'FRESH',
ADD COLUMN IF NOT EXISTS look_right_confidence DECIMAL(3, 2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS look_right_check_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invalidation_price DECIMAL(20, 8),
ADD COLUMN IF NOT EXISTS closes_beyond_zone INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wicks_beyond_zone INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2: paper_positions table - Add compression and inducement columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS has_compression BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compression_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS compression_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS compression_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS has_inducement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inducement_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS inducement_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS look_right_valid BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS look_right_status VARCHAR(15),
ADD COLUMN IF NOT EXISTS look_right_confidence DECIMAL(3, 2);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3: paper_trades table - Add compression and inducement columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE paper_trades
ADD COLUMN IF NOT EXISTS has_compression BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compression_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS compression_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS has_inducement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inducement_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS inducement_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS look_right_valid BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS look_right_status VARCHAR(15);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 4: paper_pending_orders table - Add compression and inducement columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE paper_pending_orders
ADD COLUMN IF NOT EXISTS has_compression BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compression_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS compression_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS has_inducement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inducement_type VARCHAR(30),
ADD COLUMN IF NOT EXISTS inducement_quality VARCHAR(15),
ADD COLUMN IF NOT EXISTS look_right_valid BOOLEAN DEFAULT TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 5: Indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_zone_history_compression
ON zone_history(has_compression)
WHERE has_compression = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_inducement
ON zone_history(has_inducement)
WHERE has_inducement = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_look_right_valid
ON zone_history(look_right_valid)
WHERE look_right_valid = TRUE;

CREATE INDEX IF NOT EXISTS idx_zone_history_look_right_status
ON zone_history(look_right_status);

CREATE INDEX IF NOT EXISTS idx_paper_positions_compression
ON paper_positions(has_compression)
WHERE has_compression = TRUE;

CREATE INDEX IF NOT EXISTS idx_paper_positions_inducement
ON paper_positions(has_inducement)
WHERE has_inducement = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 6: Comments for documentation
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON COLUMN zone_history.has_compression IS 'Whether compression pattern detected approaching zone';
COMMENT ON COLUMN zone_history.compression_type IS 'Type: descending_triangle, ascending_triangle, descending_wedge, ascending_wedge, symmetrical';
COMMENT ON COLUMN zone_history.compression_quality IS 'Quality: excellent, good, moderate';
COMMENT ON COLUMN zone_history.compression_percent IS 'Compression ratio as percentage (e.g., 60 = 60% compressed)';

COMMENT ON COLUMN zone_history.has_inducement IS 'Whether inducement/stop hunt detected at zone';
COMMENT ON COLUMN zone_history.inducement_type IS 'Type: bullish_inducement, bearish_inducement';
COMMENT ON COLUMN zone_history.inducement_price IS 'Price level where stops were swept';
COMMENT ON COLUMN zone_history.inducement_quality IS 'Quality: excellent, good, moderate';
COMMENT ON COLUMN zone_history.inducement_sweep_percent IS 'How far price swept past zone (%)';

COMMENT ON COLUMN zone_history.look_right_valid IS 'Whether zone passes Look Right validation';
COMMENT ON COLUMN zone_history.look_right_status IS 'Status: FRESH, TESTED, BROKEN';
COMMENT ON COLUMN zone_history.look_right_confidence IS 'Confidence score 0-1 based on tests/wicks';
COMMENT ON COLUMN zone_history.look_right_check_at IS 'Last time Look Right was validated';
COMMENT ON COLUMN zone_history.invalidation_price IS 'Price level that would invalidate zone';
COMMENT ON COLUMN zone_history.closes_beyond_zone IS 'Number of candle closes beyond zone';
COMMENT ON COLUMN zone_history.wicks_beyond_zone IS 'Number of candle wicks beyond zone';

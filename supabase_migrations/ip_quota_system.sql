-- ============================================
-- IP-Based Quota System for Anonymous Bitcoin Scans
-- ============================================

-- 1. Create ip_scan_quota table
CREATE TABLE IF NOT EXISTS ip_scan_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  scan_count INTEGER DEFAULT 0,
  max_scans INTEGER DEFAULT 5,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_ip_scan_quota_ip ON ip_scan_quota(ip_address);

-- 3. Enable Row Level Security
ALTER TABLE ip_scan_quota ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy (allow all operations for now since this is IP-based)
CREATE POLICY "Allow all operations on ip_scan_quota"
  ON ip_scan_quota
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Function to check IP quota
CREATE OR REPLACE FUNCTION check_ip_quota(ip_addr TEXT)
RETURNS JSON AS $$
DECLARE
  quota_record RECORD;
  current_date DATE;
  reset_needed BOOLEAN;
  remaining_scans INTEGER;
BEGIN
  current_date := CURRENT_DATE;

  -- Get or create quota record
  SELECT * INTO quota_record
  FROM ip_scan_quota
  WHERE ip_address = ip_addr;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO ip_scan_quota (ip_address, scan_count, max_scans, last_reset)
    VALUES (ip_addr, 0, 5, NOW())
    RETURNING * INTO quota_record;
  END IF;

  -- Check if reset is needed (new day)
  reset_needed := DATE(quota_record.last_reset) < current_date;

  IF reset_needed THEN
    -- Reset quota for new day
    UPDATE ip_scan_quota
    SET scan_count = 0,
        last_reset = NOW(),
        updated_at = NOW()
    WHERE ip_address = ip_addr
    RETURNING * INTO quota_record;
  END IF;

  -- Calculate remaining scans
  remaining_scans := quota_record.max_scans - quota_record.scan_count;

  -- Return result
  RETURN json_build_object(
    'can_scan', remaining_scans > 0,
    'remaining', remaining_scans,
    'total', quota_record.max_scans,
    'used', quota_record.scan_count
  );
END;
$$ LANGUAGE plpgsql;

-- Function to increment IP scan count
CREATE OR REPLACE FUNCTION increment_ip_scan(ip_addr TEXT)
RETURNS JSON AS $$
DECLARE
  quota_record RECORD;
  current_date DATE;
  reset_needed BOOLEAN;
BEGIN
  current_date := CURRENT_DATE;

  -- Get quota record
  SELECT * INTO quota_record
  FROM ip_scan_quota
  WHERE ip_address = ip_addr;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO ip_scan_quota (ip_address, scan_count, max_scans, last_reset)
    VALUES (ip_addr, 1, 5, NOW())
    RETURNING * INTO quota_record;

    RETURN json_build_object(
      'success', true,
      'remaining', quota_record.max_scans - 1
    );
  END IF;

  -- Check if reset is needed (new day)
  reset_needed := DATE(quota_record.last_reset) < current_date;

  IF reset_needed THEN
    -- Reset and increment
    UPDATE ip_scan_quota
    SET scan_count = 1,
        last_reset = NOW(),
        updated_at = NOW()
    WHERE ip_address = ip_addr
    RETURNING * INTO quota_record;
  ELSE
    -- Just increment
    UPDATE ip_scan_quota
    SET scan_count = scan_count + 1,
        updated_at = NOW()
    WHERE ip_address = ip_addr
    RETURNING * INTO quota_record;
  END IF;

  RETURN json_build_object(
    'success', true,
    'remaining', quota_record.max_scans - quota_record.scan_count
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION check_ip_quota(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_ip_scan(TEXT) TO anon, authenticated;

-- ============================================
-- CLEANUP (Optional - only if recreating)
-- ============================================

-- Uncomment to drop existing objects:
-- DROP FUNCTION IF EXISTS check_ip_quota(TEXT);
-- DROP FUNCTION IF EXISTS increment_ip_scan(TEXT);
-- DROP TABLE IF EXISTS ip_scan_quota;

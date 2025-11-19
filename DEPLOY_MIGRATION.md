# 🚀 DEPLOY MIGRATION - Entry Type Analytics

## ⚠️ QUAN TRỌNG: Migration này cần deploy ngay!

Migration file: `supabase/migrations/20250109_add_entry_type_analytics.sql`

---

## 🔹 CÁCH 1: Supabase Dashboard SQL Editor (KHUYẾN NGHỊ)

### Bước 1: Mở SQL Editor
**URL:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

### Bước 2: Tạo New Query
1. Click nút **"New query"** (góc trên bên phải)
2. Name: `Add Entry Type Analytics Columns`

### Bước 3: Copy Migration SQL

Mở file: `supabase/migrations/20250109_add_entry_type_analytics.sql`

Copy toàn bộ nội dung (68 dòng)

### Bước 4: Paste và Run
1. Paste SQL vào editor
2. Click nút **"Run"** (hoặc Ctrl+Enter)
3. Chờ kết quả

### Bước 5: Verify

Sau khi run, chạy query này để verify:

```sql
-- Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'portfolio_transactions'
  AND column_name IN (
    'entry_type',
    'pattern_type',
    'zone_status_at_entry',
    'confirmation_type',
    'realized_pnl',
    'risk_reward_ratio'
  );
```

**Expected output:** 6 rows (6 columns mới)

---

## 🔹 CÁCH 2: CLI với Token (Nếu muốn dùng CLI)

```bash
# Set token
$env:SUPABASE_ACCESS_TOKEN = "sbp_9ae8731e8b1f21029f8868cf9479052a070f64ac"

# Link project (nếu chưa link)
npx supabase link --project-ref pgfkbcnzqozzkohwbgbk

# Push migration
npx supabase db push
```

---

## 🔹 CÁCH 3: Direct SQL (Nhanh nhất)

Vào: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql

Paste SQL này:

```sql
-- Add entry_type column (RETEST, BREAKOUT, OTHER)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS entry_type TEXT CHECK (entry_type IN ('RETEST', 'BREAKOUT', 'OTHER'));

-- Add pattern_type column (DPD, UPU, UPD, DPU)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS pattern_type TEXT CHECK (pattern_type IN ('DPD', 'UPU', 'UPD', 'DPU', 'UNKNOWN'));

-- Add zone_status_at_entry (which workflow step when entered)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_status_at_entry TEXT;

-- Add confirmation_type (Pin Bar, Hammer, Engulfing, etc.)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS confirmation_type TEXT;

-- Add realized_pnl for closed positions (for analytics)
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS realized_pnl DECIMAL(20, 2);

-- Add risk_reward_ratio for tracking actual R:R
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS risk_reward_ratio DECIMAL(10, 2);

-- Add zone info for reference
ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_top DECIMAL(20, 8);

ALTER TABLE portfolio_transactions
ADD COLUMN IF NOT EXISTS zone_bottom DECIMAL(20, 8);

-- Create index on entry_type for analytics queries
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_entry_type
ON portfolio_transactions(entry_type)
WHERE entry_type IS NOT NULL;

-- Create index on pattern_type
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_pattern_type
ON portfolio_transactions(pattern_type)
WHERE pattern_type IS NOT NULL;

-- Create index on realized_pnl for performance analytics
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_realized_pnl
ON portfolio_transactions(realized_pnl)
WHERE realized_pnl IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN portfolio_transactions.entry_type IS 'Type of entry: RETEST (recommended), BREAKOUT (not recommended), OTHER';
COMMENT ON COLUMN portfolio_transactions.pattern_type IS 'GEM pattern type: DPD, UPU, UPD, DPU';
COMMENT ON COLUMN portfolio_transactions.zone_status_at_entry IS 'Entry workflow status when entered (CONFIRMATION, IN_ZONE, etc.)';
COMMENT ON COLUMN portfolio_transactions.confirmation_type IS 'Confirmation candle type (Pin Bar, Hammer, Engulfing, etc.)';
COMMENT ON COLUMN portfolio_transactions.realized_pnl IS 'Realized profit/loss when position closed';
COMMENT ON COLUMN portfolio_transactions.risk_reward_ratio IS 'Actual risk:reward ratio achieved';

-- Update existing transactions to have default entry_type
UPDATE portfolio_transactions
SET entry_type = 'OTHER'
WHERE entry_type IS NULL;
```

Click **"Run"**

---

## ✅ Verify Migration Success

Run query này:

```sql
-- Count new columns
SELECT
  COUNT(*) FILTER (WHERE column_name = 'entry_type') as has_entry_type,
  COUNT(*) FILTER (WHERE column_name = 'pattern_type') as has_pattern_type,
  COUNT(*) FILTER (WHERE column_name = 'realized_pnl') as has_realized_pnl
FROM information_schema.columns
WHERE table_name = 'portfolio_transactions';
```

**Expected:** All counts = 1

---

## 🎯 Tại Sao Cần Migration Này?

Migration này thêm các columns cần thiết cho:

### 1. Entry Type Analytics (Tasks 18-19)
- `entry_type` - Phân loại RETEST vs BREAKOUT
- `realized_pnl` - Tính win rate và profit

### 2. Pattern Tracking
- `pattern_type` - Theo dõi DPD, UPU patterns
- `zone_status_at_entry` - Status khi enter
- `confirmation_type` - Loại confirmation candle

### 3. Performance Analytics
- `risk_reward_ratio` - R:R thực tế đạt được
- `zone_top`, `zone_bottom` - Reference zones

**Nếu KHÔNG deploy migration này:**
- ❌ Entry Type Analytics page sẽ lỗi
- ❌ Portfolio API calls sẽ fail
- ❌ Add Holding form sẽ không lưu được entry_type

---

## 📊 Sau Khi Deploy

Test ngay:
1. Vào Portfolio page
2. Add new holding
3. Select entry_type = RETEST
4. Check Analytics tab

Should work! ✅

---

**Last Updated:** 2025-01-09
**Migration File:** 20250109_add_entry_type_analytics.sql

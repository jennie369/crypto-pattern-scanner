# 🔧 BACKEND SCHEMA CACHE FIX - STEP BY STEP

## ❌ IMPORTANT: Cannot Restart Hosted Supabase

You're using **Hosted Supabase Cloud** (not local). PostgREST runs on Supabase's servers and cannot be restarted manually. The schema cache will auto-refresh after table changes.

---

## 🎯 SOLUTION: Fix Database Schema

### **STEP 1: Check Current Schema**

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist and their columns
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('backtestconfigs', 'backtestresults', 'backtesttrades')
ORDER BY table_name, ordinal_position;
```

**Expected Result:**
- **If empty:** Tables don't exist → Deploy full migration (STEP 2A)
- **If returns data:** Tables exist with old schema → Drop and recreate (STEP 2B)

---

### **STEP 2A: Tables Don't Exist (Fresh Deploy)**

If tables don't exist, deploy the full migration:

1. Open: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor
2. Click **"New Query"**
3. Paste the migration SQL (it's in your clipboard from earlier)
4. Click **"Run"** or press Ctrl+Enter
5. Wait for: ✅ "Success. No rows returned"

PostgREST cache will auto-refresh. **DONE!**

---

### **STEP 2B: Tables Exist with Old Schema (Need Update)**

If tables exist but have wrong columns:

```sql
-- Drop old tables (cascades to dependent objects)
DROP TABLE IF EXISTS backtesttrades CASCADE;
DROP TABLE IF EXISTS backtestresults CASCADE;
DROP TABLE IF EXISTS backtestconfigs CASCADE;
DROP TABLE IF EXISTS ai_predictions CASCADE;
```

Then run the full migration from STEP 2A.

---

### **STEP 3: Force Schema Cache Reload (Optional)**

After deploying tables, force PostgREST to reload schema:

```sql
-- Force immediate schema cache reload
NOTIFY pgrst, 'reload schema';
```

Or wait 30 seconds - PostgREST auto-reloads periodically.

---

### **STEP 4: Grant TIER 3 Access**

```sql
UPDATE profiles
SET scanner_tier = 'TIER3'
WHERE email = 'your-email@example.com';
```

Replace with your actual email.

---

### **STEP 5: Verify Schema**

```sql
-- Verify avg_loss column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'backtestresults'
  AND column_name = 'avg_loss';
```

Should return: `avg_loss`

---

### **STEP 6: Test Backtesting**

1. Refresh browser: http://localhost:5173
2. Navigate to: `/tier3/backtesting`
3. Create and run a backtest
4. Should complete 100% without errors

---

## 📊 TROUBLESHOOTING

### **Error: "permission denied for table backtestresults"**

**Fix:** Check RLS policies. Run:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'backtestresults';

-- If rowsecurity = true, verify your tier
SELECT id, email, scanner_tier, course_tier
FROM profiles
WHERE id = auth.uid();
```

### **Error: "Could not find 'avg_loss' column"**

**Fix:** Schema cache not refreshed. Run:

```sql
NOTIFY pgrst, 'reload schema';
```

Wait 10 seconds, then retry.

---

## ⏱️ ESTIMATED TIME

- Check schema: 1 minute
- Deploy migration: 2 minutes
- Reload cache: 30 seconds
- Grant access: 30 seconds
- Verify: 1 minute

**TOTAL: ~5 minutes**

---

## ✅ SUCCESS CRITERIA

- [ ] Tables exist with all required columns
- [ ] `avg_loss` column present in backtestresults
- [ ] PostgREST schema cache refreshed (no column errors)
- [ ] TIER 3 access granted
- [ ] Backtest completes 100% successfully

---

## 🚀 QUICK START

**Run these 3 queries in order:**

1. Check schema:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'backtest%';
```

2. If tables exist, drop them:
```sql
DROP TABLE IF EXISTS backtesttrades CASCADE;
DROP TABLE IF EXISTS backtestresults CASCADE;
DROP TABLE IF EXISTS backtestconfigs CASCADE;
```

3. Deploy full migration (paste from clipboard)

4. Force reload:
```sql
NOTIFY pgrst, 'reload schema';
```

5. Grant access:
```sql
UPDATE profiles SET scanner_tier = 'TIER3'
WHERE email = 'your-email@example.com';
```

**DONE! Test at http://localhost:5173/tier3/backtesting**

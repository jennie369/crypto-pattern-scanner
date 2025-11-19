# IP-Based Quota System Setup

## Overview
This migration enables **IP-based quota tracking** for anonymous Bitcoin scans. Users can scan Bitcoin 5 times per day without creating an account, based on their IP address.

## Features
- ✅ 5 free Bitcoin scans per day for anonymous users (IP-based)
- ✅ Automatic daily quota reset
- ✅ Other coins require authentication
- ✅ Seamless integration with existing user-based quota system

## Installation Steps

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Migration
1. Copy the entire contents of `ip_quota_system.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute the migration

### 3. Verify Installation
Run this query to verify the table was created:
```sql
SELECT * FROM ip_scan_quota LIMIT 1;
```

Run this query to test the RPC functions:
```sql
SELECT check_ip_quota('127.0.0.1');
```

Expected result:
```json
{
  "can_scan": true,
  "remaining": 5,
  "total": 5,
  "used": 0
}
```

## Database Schema

### Table: `ip_scan_quota`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ip_address | TEXT | User's IP address (unique) |
| scan_count | INTEGER | Number of scans today |
| max_scans | INTEGER | Max scans per day (default: 5) |
| last_reset | TIMESTAMP | Last quota reset time |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### RPC Functions

#### `check_ip_quota(ip_addr TEXT)`
Checks if an IP address can scan Bitcoin.

**Returns:**
```json
{
  "can_scan": boolean,
  "remaining": number,
  "total": number,
  "used": number
}
```

#### `increment_ip_scan(ip_addr TEXT)`
Increments the scan count for an IP address.

**Returns:**
```json
{
  "success": boolean,
  "remaining": number
}
```

## How It Works

### Frontend Flow
1. User visits homepage (no authentication required)
2. Chart is **blurred** for non-authenticated users
3. User clicks scan button:
   - **Bitcoin**: Check IP quota → Allow if quota available
   - **Other coins**: Show signup/login prompt
4. After scan: Increment IP quota counter
5. Quota resets automatically at midnight (daily)

### Backend Flow
1. `check_ip_quota()` is called with user's IP
2. Function checks if record exists:
   - If not: Create new record with 0 scans
   - If exists: Check if new day (reset if needed)
3. Calculate remaining scans: `max_scans - scan_count`
4. Return quota status

## Security Notes

- ✅ Row Level Security (RLS) enabled
- ✅ Public access allowed (IP-based, anonymous)
- ✅ Functions are granted to both `anon` and `authenticated` roles
- ⚠️ IP addresses are stored as plain text (consider privacy regulations)
- ⚠️ Users behind VPNs/proxies share the same IP quota

## Configuration

### Change Max Scans Per Day
To change from 5 to a different number (e.g., 10):
```sql
UPDATE ip_scan_quota SET max_scans = 10;
```

For all future records, modify the function default in `ip_quota_system.sql`:
```sql
INSERT INTO ip_scan_quota (ip_address, scan_count, max_scans, last_reset)
VALUES (ip_addr, 0, 10, NOW())  -- Change 5 to 10
```

## Troubleshooting

### Issue: "function check_ip_quota does not exist"
**Solution:** Make sure you ran the entire migration SQL file.

### Issue: Quota not resetting daily
**Solution:** Check the `last_reset` timestamp. The function resets when `DATE(last_reset) < CURRENT_DATE`.

### Issue: All IPs showing same quota
**Solution:** Verify IP detection is working on frontend. Check browser console for the actual IP being sent.

## Testing

### Test IP Quota
```sql
-- Check quota for test IP
SELECT check_ip_quota('192.168.1.100');

-- Increment scan
SELECT increment_ip_scan('192.168.1.100');

-- Check again (should show 1 scan used)
SELECT check_ip_quota('192.168.1.100');

-- View raw data
SELECT * FROM ip_scan_quota WHERE ip_address = '192.168.1.100';
```

### Reset Quota for Testing
```sql
-- Reset specific IP
UPDATE ip_scan_quota
SET scan_count = 0, last_reset = NOW()
WHERE ip_address = '192.168.1.100';

-- Clear all IP quota records
TRUNCATE ip_scan_quota;
```

## Next Steps

After running this migration:
1. ✅ Frontend is already integrated
2. ✅ Homepage is now public
3. ✅ Charts are blurred for non-authenticated users
4. ✅ Bitcoin scanning works with IP quota
5. ✅ Other coins show signup prompt

Test the flow:
1. Visit the homepage without logging in
2. Try scanning Bitcoin (should work 5 times)
3. Try scanning other coins (should show signup modal)
4. Chart should be blurred until you log in

## Support

If you encounter any issues:
1. Check Supabase logs in the dashboard
2. Verify RPC functions are created: `Database > Functions`
3. Check table exists: `Database > Tables`
4. Test RPC functions directly in SQL Editor

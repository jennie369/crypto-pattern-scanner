# Gemral - Tier System Documentation

## Overview

Gemral sử dụng hệ thống tier để quản lý quyền truy cập features cho users.

## Tier Levels

| Tier | Aliases | Level | Chatbot Queries | Voice | Scanner Patterns | Color |
|------|---------|-------|-----------------|-------|------------------|-------|
| FREE | - | 0 | 5/day | 3/day | 3 | #FF6B6B |
| TIER1 | PRO | 1 | 15/day | Unlimited | 7 | #FFBD59 |
| TIER2 | PREMIUM | 2 | 50/day | Unlimited | 15 | #6A5BFF |
| TIER3 | VIP | 3 | Unlimited | Unlimited | 24 | #FFD700 |
| ADMIN | - | 99 | Unlimited | Unlimited | Unlimited | #FF00FF |

## Database Tables

### Primary Table: `profiles`
```sql
-- Main profile table with tier information
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  role VARCHAR(20) DEFAULT 'user',        -- 'user' | 'admin'
  is_admin BOOLEAN DEFAULT FALSE,
  scanner_tier VARCHAR(20) DEFAULT 'FREE', -- FREE|TIER1|TIER2|TIER3|ADMIN
  chatbot_tier VARCHAR(20) DEFAULT 'FREE',
  course_tier VARCHAR(20) DEFAULT 'FREE',
  ...
)
```

### Secondary Table: `users`
```sql
-- Synced from profiles via trigger
users (
  id UUID PRIMARY KEY,
  email TEXT,
  role VARCHAR(20),
  is_admin BOOLEAN,
  scanner_tier VARCHAR(20),
  chatbot_tier VARCHAR(20),
  course_tier VARCHAR(20),
  ...
)
```

### Purchases Table: `user_purchases`
```sql
user_purchases (
  id UUID PRIMARY KEY,
  user_id UUID,
  product_type TEXT,   -- 'bundle' | 'chatbot' | 'scanner' | 'course'
  product_tier TEXT,   -- 'TIER1' | 'TIER2' | 'TIER3' | 'PRO' | 'PREMIUM' | 'VIP'
  is_active BOOLEAN,
  ...
)
```

## Admin Detection Logic

User is considered ADMIN if ANY of these conditions are true:

```javascript
const isAdmin =
  profile.role === 'admin' ||
  profile.role === 'ADMIN' ||
  profile.is_admin === true ||
  profile.scanner_tier === 'ADMIN' ||
  profile.chatbot_tier === 'ADMIN';
```

## Tier Detection Flow

```
1. TierService.getUserTier(userId)
   ├── Check profile for admin status → return 'ADMIN'
   ├── Get highest tier from profile columns
   │   ├── chatbot_tier
   │   ├── scanner_tier
   │   └── course_tier
   ├── Check user_purchases for active purchases
   └── Return highest tier found
```

## Files & Components

### Services
- `gem-mobile/src/services/tierService.js` - Main tier logic
- `gem-mobile/src/services/quotaService.js` - Chatbot quota tracking
- `gem-mobile/src/services/voiceService.js` - Voice quota tracking
- `gem-mobile/src/services/supabase.js` - getUserProfile from profiles table

### Context
- `gem-mobile/src/contexts/AuthContext.js` - isAdmin, userTier in context

### Components
- `gem-mobile/src/components/TierGuard.js` - Feature access control
- `gem-mobile/src/components/GemMaster/TierBadge.js` - Display tier badge
- `gem-mobile/src/components/GemMaster/QuotaIndicator.js` - Show remaining quota

## Setting User Tier

### Via Supabase SQL Editor:
```sql
-- Set admin
UPDATE profiles SET
  role = 'admin',
  is_admin = TRUE,
  scanner_tier = 'ADMIN',
  chatbot_tier = 'ADMIN',
  course_tier = 'ADMIN'
WHERE email = 'user@example.com';

-- Set TIER3/VIP
UPDATE profiles SET
  scanner_tier = 'TIER3',
  chatbot_tier = 'TIER3'
WHERE email = 'user@example.com';

-- Set TIER2/PREMIUM
UPDATE profiles SET
  scanner_tier = 'TIER2',
  chatbot_tier = 'TIER2'
WHERE email = 'user@example.com';

-- Set TIER1/PRO
UPDATE profiles SET
  scanner_tier = 'TIER1',
  chatbot_tier = 'TIER1'
WHERE email = 'user@example.com';
```

## RLS Policies

Admin users bypass RLS via `is_user_admin()` function:

```sql
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT role, is_admin, scanner_tier, chatbot_tier
  INTO user_profile
  FROM profiles
  WHERE id = user_id_param;

  RETURN (
    user_profile.role = 'admin' OR
    user_profile.role = 'ADMIN' OR
    user_profile.is_admin = TRUE OR
    user_profile.scanner_tier = 'ADMIN' OR
    user_profile.chatbot_tier = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migrations Required

Run these migrations in order on Supabase:
1. `20251126_add_missing_admin_columns.sql` - Add is_admin column
2. `20251126_sync_users_profiles_tiers.sql` - Sync users/profiles tables
3. `20251126_fix_admin_rls_policies.sql` - Fix RLS policies for admin

## Troubleshooting

### Error: "Profile error: 42703"
- Column doesn't exist in database
- Run migration to add missing columns

### User shows FREE but should be ADMIN
1. Check profiles table has correct tier values
2. Verify email matches exactly
3. Check is_admin = TRUE
4. Restart app to refresh session

### Admin can't access admin features
1. Check AuthContext isAdmin is true
2. Check profile has role='admin' or is_admin=true
3. Run RLS policy migration

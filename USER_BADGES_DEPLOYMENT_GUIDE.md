# User Badges System - Deployment & Testing Guide

## 🎯 System Overview

A complete user badges system with:
- ✅ **14 badge types** (verification, tier, level, role, achievement)
- ✅ **Lucide React icons** with custom animations
- ✅ **Priority-based display** system
- ✅ **Auto-awarding** via Edge Function
- ✅ **Admin management** panel
- ✅ **Integration** across 6 pages

---

## 📁 Files Created

### Database Migrations
- `supabase/migrations/20241117_user_badges_system.sql` - Main badge system
- `supabase/migrations/20241117_auto_award_badges_trigger.sql` - Auto-award trigger

### React Components
- `frontend/src/components/UserBadge/UserBadge.jsx` - Single badge component
- `frontend/src/components/UserBadge/UserBadge.css` - Badge styling + animations
- `frontend/src/components/UserBadge/UserBadges.jsx` - Multi-badge container
- `frontend/src/components/UserBadge/UserBadges.css` - Container styling

### Admin Panel
- `frontend/src/pages/Admin/BadgeManagement.jsx` - Badge management UI
- `frontend/src/pages/Admin/BadgeManagement.css` - Admin panel styling

### Edge Function
- `supabase/functions/auto-award-badges/index.ts` - Auto-award logic

### Updated Pages
- `frontend/src/contexts/AuthContext.jsx` - Added badge fields to SELECT
- `frontend/src/pages/Community/UserProfile.jsx` - Badges on profile
- `frontend/src/pages/Community/Leaderboard.jsx` - Badges on leaderboard
- `frontend/src/pages/Forum/Forum.jsx` - Badges on thread authors
- `frontend/src/pages/Forum/ThreadDetail.jsx` - Badges on reply authors
- `frontend/src/pages/Messages/Messages.jsx` - Badges in conversations

---

## 🚀 Deployment Steps

### Step 1: Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20241117_user_badges_system.sql`
4. Click **Run** to execute
5. Repeat for `supabase/migrations/20241117_auto_award_badges_trigger.sql`

**Option B: Using Supabase CLI**

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
npx supabase db push
```

**Verify Migration Success:**
```sql
-- Check if columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('verified_seller', 'verified_trader', 'level_badge', 'role_badge', 'achievement_badges');

-- Should return 5 rows

-- Check badge_definitions table
SELECT COUNT(*) FROM badge_definitions;
-- Should return 14 (all badge types)
```

---

### Step 2: Deploy Edge Function

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Login to Supabase (if not already logged in)
npx supabase login

# Deploy the function
npx supabase functions deploy auto-award-badges --project-ref YOUR_PROJECT_REF
```

**Replace `YOUR_PROJECT_REF`** with your Supabase project reference (found in Dashboard > Settings > General).

**Verify Deployment:**
1. Go to Supabase Dashboard > Edge Functions
2. You should see `auto-award-badges` listed
3. Check the logs to ensure it's running without errors

---

### Step 3: Configure App Routes (Optional)

If you want to add the Admin Badge Management to your navigation, add this route to `App.jsx`:

```jsx
import BadgeManagement from './pages/Admin/BadgeManagement';

// Inside <Routes>
<Route path="/admin/badges" element={<BadgeManagement />} />
```

---

## 🧪 Testing Checklist

### ✅ Phase 1: Visual Testing - Badge Display

**Test on UserProfile.jsx:**
1. Navigate to your user profile
2. Verify badges appear next to your name
3. Check animations are working
4. Hover over badges to see tooltips

**Test on Leaderboard.jsx:**
1. Go to the leaderboard
2. Verify badges appear next to usernames in the table
3. Check sizing is consistent (small badges)

**Test on Forum.jsx:**
1. Browse forum threads
2. Verify tiny badges appear next to thread author names
3. Check they don't break the layout

**Test on ThreadDetail.jsx:**
1. Open a forum thread
2. Verify badges appear on reply authors
3. Check tiny size is appropriate

**Test on Messages.jsx:**
1. Open Messages page
2. Verify badges in conversation list (next to participant names)
3. Verify badges in "New Conversation" search results

---

### ✅ Phase 2: Functional Testing - Badge Logic

**Test Badge Priority System:**
1. Give a user multiple badges (verification + tier + level)
2. Verify they display in correct order:
   - Verification badges first
   - Then tier badge
   - Then role badge
   - Then level badge
   - Achievement badges last

**Test Tier Badge Mapping:**
```javascript
// Test these tier values in database
scanner_tier = 'TIER3' → Should show VIP badge
scanner_tier = 'TIER2' → Should show Premium badge
scanner_tier = 'TIER1' → Should show Basic badge
scanner_tier = 'FREE' → Should show no tier badge
```

**Test Achievement Badges:**
1. Add achievement badge to a user (e.g., `['top_trader']`)
2. Verify it displays correctly
3. Add multiple achievements
4. Verify maxBadges limit works

---

### ✅ Phase 3: Auto-Award Testing

**Test Level Badge Auto-Award:**

1. Create/update a user's stats in `user_stats` table:
```sql
-- Test Bronze (< 60% win rate)
INSERT INTO user_stats (user_id, win_rate, total_trades)
VALUES ('YOUR_USER_ID', 45.0, 10);
-- Check: level_badge should be 'bronze'

-- Test Silver (60-74%)
UPDATE user_stats
SET win_rate = 68.0
WHERE user_id = 'YOUR_USER_ID';
-- Check: level_badge should be 'silver'

-- Test Gold (75-84%)
UPDATE user_stats
SET win_rate = 78.5
WHERE user_id = 'YOUR_USER_ID';
-- Check: level_badge should be 'gold'

-- Test Platinum (85-94%)
UPDATE user_stats
SET win_rate = 88.0
WHERE user_id = 'YOUR_USER_ID';
-- Check: level_badge should be 'platinum'

-- Test Diamond (>= 95%)
UPDATE user_stats
SET win_rate = 96.0
WHERE user_id = 'YOUR_USER_ID';
-- Check: level_badge should be 'diamond'
```

2. Verify Edge Function logs:
   - Go to Supabase Dashboard > Edge Functions > auto-award-badges > Logs
   - You should see execution logs showing badge awards

---

### ✅ Phase 4: Admin Panel Testing

**Access Admin Panel:**
1. Navigate to `/admin/badges` (if you added the route)
2. You should see the Badge Management interface
3. **Note:** Only users with `role = 'admin'` or `scanner_tier = 'TIER3'` can access

**Test User Search:**
1. Type a username in search bar
2. Verify results filter correctly
3. Test email search

**Test Tier Filter:**
1. Select different tier filters (FREE, TIER1, TIER2, TIER3)
2. Verify table updates correctly

**Test Badge Editing:**
1. Click "Edit" button on a user
2. Modal should open with current badges
3. Toggle verification badges
4. Change level badge dropdown
5. Select role badge
6. Check/uncheck achievement badges
7. Verify preview updates in real-time
8. Click "Save Changes"
9. Confirm database was updated:
```sql
SELECT verified_seller, verified_trader, level_badge, role_badge, achievement_badges
FROM users
WHERE id = 'USER_ID';
```

---

## 🔍 Troubleshooting

### Issue: Badges Not Showing

**Check 1: AuthContext Loading Badge Fields**
```javascript
// In AuthContext.jsx, verify SELECT includes:
verified_seller,
verified_trader,
level_badge,
role_badge,
achievement_badges
```

**Check 2: Database Columns Exist**
```sql
\d users  -- PostgreSQL command to describe table
```

**Check 3: Component Import**
```javascript
// Each page should have:
import UserBadges from '../../components/UserBadge/UserBadges';
```

---

### Issue: Auto-Award Not Working

**Check 1: Edge Function Deployed**
```bash
npx supabase functions list
# Should show: auto-award-badges
```

**Check 2: Trigger Exists**
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_award_badges';
```

**Check 3: pg_net Extension Enabled**
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

**Check 4: Function Logs**
- Check Supabase Dashboard > Edge Functions > auto-award-badges > Logs
- Look for errors in execution

**Alternative: Manual Award Function**
If Edge Function doesn't work, use the manual function:
```sql
SELECT award_level_badge('USER_ID');
```

---

### Issue: Admin Panel Access Denied

**Fix: Grant Admin Role**
```sql
UPDATE users
SET role = 'admin'
WHERE id = 'YOUR_USER_ID';

-- OR grant TIER3 access
UPDATE users
SET scanner_tier = 'TIER3'
WHERE id = 'YOUR_USER_ID';
```

---

## 🎨 Badge Types Reference

### Verification Badges (Auto: No, Manual: Yes)
- `verified_seller` - Green shield, verified seller
- `verified_trader` - Cyan shield, verified trader

### Tier Badges (Auto: Based on subscription)
- `tier_free` - FREE users
- `tier_1` - TIER 1 Basic users
- `tier_2` - TIER 2 Premium users
- `tier_3` - TIER 3 VIP users (animated!)

### Level Badges (Auto: Yes via Edge Function)
- `bronze` - < 60% win rate
- `silver` - 60-74% win rate
- `gold` - 75-84% win rate
- `platinum` - 85-94% win rate
- `diamond` - ≥ 95% win rate (rainbow sparkle!)

### Role Badges (Auto: No, Manual: Yes)
- `admin` - Admin role
- `moderator` - Moderator role
- `mentor` - Mentor/educator
- `partner` - Official partner

### Achievement Badges (Auto: No, Manual: Yes)
- `top_trader` - Top performer
- `high_roller` - Large volume trader
- `consistent` - Consistent profits
- `perfect_week` - Perfect trading week
- `comeback_king` - Recovered from loss
- `risk_taker` - High-risk strategy

---

## 📊 Usage Examples

### Display Badges with Different Sizes

```jsx
// Tiny (for conversation lists, comments)
<UserBadges user={user} size="tiny" />

// Small (for tables, cards)
<UserBadges user={user} size="small" />

// Medium (for profiles, headers)
<UserBadges user={user} size="medium" showLabels={true} />

// Large (for profile modals, detailed views)
<UserBadges user={user} size="large" showLabels={true} maxBadges={10} />
```

### Single Badge Display

```jsx
import UserBadge from '../../components/UserBadge/UserBadge';

<UserBadge type="verified_seller" size="medium" showLabel={true} />
<UserBadge type="tier_3" size="large" showLabel={false} />
<UserBadge type="diamond" size="small" showLabel={true} />
```

---

## ✅ Deployment Complete!

All phases implemented:
- ✅ Phase 1: Database migration created
- ✅ Phase 2: AuthContext updated
- ✅ Phase 3: UserBadge components created
- ✅ Phase 4: Integrated in 6 pages
- ✅ Phase 5: Edge Function created
- ✅ Phase 6: Admin panel created
- ✅ Phase 7: Testing guide provided

## 📝 Next Steps

1. **Run migrations** in Supabase Dashboard
2. **Deploy Edge Function** using Supabase CLI
3. **Test badge display** on all integrated pages
4. **Grant admin access** to yourself
5. **Test admin panel** functionality
6. **Award test badges** to verify system

---

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs (Database > Logs, Edge Functions > Logs)
3. Verify all migrations ran successfully
4. Ensure AuthContext is loading badge fields
5. Check component imports are correct

## 🎉 Enjoy Your New Badge System!

Your users can now earn and display beautiful, animated badges across the platform!

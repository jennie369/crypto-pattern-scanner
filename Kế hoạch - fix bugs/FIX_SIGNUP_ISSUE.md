# 🔧 Fix: Signup Không Tạo User Trong Database

## ❌ Vấn Đề

Bạn signup trong app nhưng user KHÔNG xuất hiện trong database (`users` table).

**Refresh button cũng bị lỗi** vì không có profile để refresh.

---

## 🔍 Nguyên Nhân

### Root Cause 1: Missing INSERT RLS Policy

Database có **Row Level Security (RLS)** enabled, nhưng `users` table chỉ có 2 policies:
- ✅ SELECT policy: "Users can read own data"
- ✅ UPDATE policy: "Users can update own data"
- ❌ **MISSING**: INSERT policy

→ Khi signup, `supabase.from('users').insert()` bị RLS **block** → Fail silently!

**Evidence**: `supabase_schema.sql` lines 71-79 - Chỉ có SELECT và UPDATE policies

---

### Root Cause 2: AuthContext Không Check Error

File: `AuthContext.jsx` lines 119-129 (BEFORE fix)

```javascript
// 2. Create user profile
if (data.user) {
  await supabase.from('users').insert([...]); // ❌ No error check!

  // 3. Create daily quota
  await supabase.from('daily_scan_quota').upsert([...]); // ❌ No error check!
}

return { success: true, data }; // ✅ Always returns success!
```

→ Insert fails, nhưng code vẫn return `success: true` → User nghĩ signup thành công!

---

### Root Cause 3: pending_tier_upgrades Cũng Thiếu RLS

Table mới `pending_tier_upgrades` (flexible purchase system) cũng chưa có RLS policies.

→ Webhook sẽ fail khi try to insert pending upgrades!

---

## ✅ Giải Pháp (3 Bước)

### BƯỚC 1: Chạy Database Fix Script ⚠️ **QUAN TRỌNG**

**File**: `fix_signup_and_rls_policies.sql`

**Đường dẫn SQL Editor**:
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

**Cách làm**:
1. Mở file `fix_signup_and_rls_policies.sql`
2. Copy toàn bộ nội dung
3. Paste vào Supabase SQL Editor
4. Click **"Run"** (nút xanh góc phải) hoặc `Ctrl + Enter`

**Script sẽ**:
1. ✅ Add INSERT policy cho `users` table
2. ✅ Enable RLS trên `pending_tier_upgrades`
3. ✅ Add 4 policies cho `pending_tier_upgrades`
4. ✅ Verify policies đã được tạo

**Kết quả mong đợi**:
```
✅ RLS POLICIES FIXED
✅ Users table: INSERT policy added
✅ pending_tier_upgrades: RLS enabled
✅ pending_tier_upgrades: 4 policies added
```

---

### BƯỚC 2: AuthContext Đã Được Update (AUTO)

**File**: `AuthContext.jsx` (đã update tự động)

**Changes**:
1. ✅ Check `profileError` sau insert
2. ✅ Log chi tiết errors ra console
3. ✅ Return proper error message nếu fail
4. ✅ Check `quotaError` sau quota insert
5. ✅ Console logs để debug

**New signup flow**:
```javascript
const { data: profileData, error: profileError } = await supabase
  .from('users')
  .insert([...])
  .select()
  .single();

if (profileError) {
  console.error('❌ Failed to create user profile:', profileError);
  return {
    success: false,
    error: 'Failed to create user profile. Please try logging in again.'
  };
}
```

---

### BƯỚC 3: Test Signup

#### A. Clear Browser Cache (Optional)

Nếu bạn đã signup trước đó:
1. Open browser DevTools (`F12`)
2. Click **Application** tab
3. Left sidebar → **Storage**
4. Click **Clear site data**
5. Reload page

---

#### B. Test Signup Mới

1. **Vào app**: http://localhost:5173 (hoặc production URL)
2. **Click "Sign Up"** / "Đăng ký"
3. **Fill form**:
   - Full Name: Test User
   - Email: test-signup-fix@example.com (email mới chưa dùng)
   - Password: test123
   - Confirm Password: test123
4. **Click "Sign Up"**

---

#### C. Check Browser Console

**Open DevTools (`F12`)** → **Console** tab

**Expected logs**:
```
✅ Auth user created: <uuid>
📝 Creating user profile...
✅ User profile created: { id: ..., email: ..., tier: 'free', ... }
📝 Creating daily quota...
✅ Daily quota created
🎉 Signup completed successfully!
```

**If you see error**:
```
❌ Failed to create user profile: { code: "42501", message: "..." }
```

→ RLS policy chưa được apply đúng. Chạy lại BƯỚC 1.

---

#### D. Verify Database

**Đường dẫn SQL Editor**:
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

**Paste query**:
```sql
SELECT id, email, full_name, tier, course_tier, scanner_tier, chatbot_tier, created_at
FROM users
WHERE email = 'test-signup-fix@example.com';
```

**Click "Run"**

**Expected**: 1 row with your test user ✅

**If empty**: Signup still failing - check console logs for errors

---

#### E. Test Refresh Button

1. **Login** với account vừa signup
2. **Vào Settings page**
3. **Click "🔄 Refresh Profile"**

**Expected**:
- ✅ Toast: "Profile refreshed successfully!"
- ✅ Tier displayed correctly
- ✅ Full name displayed

**If error**:
- Check console logs
- Verify user exists in database

---

## 🧪 Additional Tests

### Test 1: Signup Fail Handling

**Scenario**: User signup với email đã tồn tại

**Expected**:
- ❌ Show error: "Email already in use" (or similar)
- ❌ Console shows error
- ❌ Returns `success: false`

---

### Test 2: Buy-Then-Signup Flow

**Scenario**: User mua hàng trên Shopify TRƯỚC khi signup

1. **Mua hàng** trên Shopify với email: `test-flow@example.com`
2. **Check logs**: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs

**Expected**:
```
⏳ User not found for email: test-flow@example.com
   Saving to pending_tier_upgrades table...
✅ Pending upgrade saved
```

3. **Signup** trong app với cùng email: `test-flow@example.com`
4. **Check database**:

```sql
SELECT email, scanner_tier, chatbot_tier, course_tier
FROM users
WHERE email = 'test-flow@example.com';
```

**Expected**: Tier đã được apply tự động! ✅

---

### Test 3: Signup-Then-Buy Flow (Original)

**Scenario**: User signup TRƯỚC, mua hàng SAU (flow cũ)

1. **Signup** với email: `test-flow-2@example.com`
2. **Mua hàng** trên Shopify với cùng email
3. **Check logs**:

**Expected**:
```
👤 Found user ...
✅ User scanner_tier updated: pro
```

✅ Tier update ngay lập tức!

---

## 🆘 Troubleshooting

### Lỗi: "Failed to create user profile"

**Check 1: RLS policy đã add chưa?**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users';
```

**Expected**: 3 rows - SELECT, UPDATE, INSERT

**Fix**: Chạy lại `fix_signup_and_rls_policies.sql`

---

### Lỗi: "Failed to save pending upgrade"

**Check 1: RLS policies cho pending_tier_upgrades?**
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'pending_tier_upgrades';
```

**Expected**: 4 rows

**Fix**: Chạy lại `fix_signup_and_rls_policies.sql`

---

### Lỗi: Browser console shows "403 Forbidden"

**Cause**: RLS policy chưa đúng hoặc chưa được apply

**Fix**:
1. Hard refresh browser (`Ctrl + Shift + R`)
2. Re-run SQL script
3. Check `auth.uid()` returns correct user ID:

```sql
SELECT auth.uid();
```

Should return your user's UUID when logged in.

---

### Lỗi: Refresh button vẫn lỗi sau khi signup

**Check 1: User có trong database không?**
```sql
SELECT * FROM users WHERE email = 'your-email@example.com';
```

**If empty**: Signup failed - check console logs

**If exists**:
- Try logout/login again
- Check if `auth.uid()` matches user ID in database

---

## 📋 Checklist

- [ ] Chạy `fix_signup_and_rls_policies.sql` trong SQL Editor
- [ ] Verify 3 policies cho `users` table (SELECT, UPDATE, INSERT)
- [ ] Verify 4 policies cho `pending_tier_upgrades` table
- [ ] AuthContext.jsx đã update (tự động)
- [ ] Test signup với email mới
- [ ] Check browser console logs - thấy "🎉 Signup completed successfully!"
- [ ] Verify user xuất hiện trong database
- [ ] Test refresh button - works!
- [ ] Test buy-then-signup flow
- [ ] Test signup-then-buy flow (original)

---

## 📊 What Changed?

### Database (SQL)

**Before**:
```sql
-- users table
✅ SELECT policy
✅ UPDATE policy
❌ NO INSERT policy → Signup fails!

-- pending_tier_upgrades table
❌ NO RLS policies → Webhook fails!
```

**After**:
```sql
-- users table
✅ SELECT policy
✅ UPDATE policy
✅ INSERT policy → Signup works! ✅

-- pending_tier_upgrades table
✅ RLS enabled
✅ 4 policies added → Webhook works! ✅
```

---

### Frontend (AuthContext.jsx)

**Before**:
```javascript
await supabase.from('users').insert([...]); // No error check
return { success: true }; // Always success
```

**After**:
```javascript
const { data, error } = await supabase.from('users').insert([...]);

if (error) {
  console.error('❌ Failed:', error);
  return { success: false, error: '...' };
}

console.log('✅ Success:', data);
return { success: true, data };
```

---

## 🎯 Success Criteria

Hệ thống hoạt động đúng khi:

1. ✅ **Signup creates user**: User xuất hiện trong database ngay sau signup
2. ✅ **Refresh works**: Click refresh button → profile updates
3. ✅ **Buy-then-signup**: User mua hàng trước, signup sau → Tier tự động apply
4. ✅ **Signup-then-buy**: User signup trước, mua sau → Tier update ngay
5. ✅ **Error handling**: Nếu signup fail → Show error message rõ ràng
6. ✅ **Console logs**: Có logs chi tiết để debug

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `fix_signup_and_rls_policies.sql` | Database fix script (RUN THIS FIRST) |
| `AuthContext.jsx` | Updated with error handling |
| `database_pending_tier_upgrades.sql` | Pending upgrades system |
| `NEW_FLEXIBLE_PURCHASE_FLOW.md` | Buy-then-signup guide |
| `START_HERE.md` | Main setup guide |

---

**BẮT ĐẦU NGAY**: Chạy `fix_signup_and_rls_policies.sql` trong SQL Editor! 🚀

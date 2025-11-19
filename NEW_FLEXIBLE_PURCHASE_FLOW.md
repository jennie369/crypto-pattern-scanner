# 🎉 NEW: Flexible Purchase Flow

## ✅ Vấn Đề Đã Giải Quyết

**Trước đây:** User BẮT BUỘC phải signup trong app TRƯỚC, rồi mới mua hàng trên Shopify.

**Bây giờ:** User có thể mua hàng và signup theo BẤT KỲ thứ tự nào!

---

## 🔄 2 Flows Đều Hoạt Động

### Flow 1: Signup Trước → Mua Sau (Flow Cũ)
```
User vào App → Signup
    ↓
User vào Shopify Store → Mua hàng
    ↓
Webhook nhận order → Tìm thấy user ✅
    ↓
Update tier NGAY LẬP TỨC
    ↓
User refresh app → Thấy tier mới ngay!
```

**Kết quả:** Tier được update **ngay lập tức** sau khi thanh toán.

---

### Flow 2: Mua Trước → Signup Sau (Flow Mới)
```
User vào Shopify Store → Mua hàng (CHƯA có account)
    ↓
Webhook nhận order → KHÔNG tìm thấy user ⏳
    ↓
Lưu vào pending_tier_upgrades table
    ↓
User vào App → Signup với CÙNG email
    ↓
Database trigger tự động detect pending orders
    ↓
Apply TẤT CẢ pending upgrades cho user
    ↓
User thấy tier đã được nâng cấp ngay sau signup!
```

**Kết quả:** Tier được update **tự động** ngay khi signup.

---

## 🗄️ Database Changes

### Bảng Mới: `pending_tier_upgrades`

```sql
CREATE TABLE pending_tier_upgrades (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  product_type VARCHAR(20) NOT NULL,  -- course, scanner, chatbot
  tier_purchased VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2),
  purchased_at TIMESTAMPTZ,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Mục đích:** Lưu orders từ users chưa signup.

---

### Function Mới: `apply_pending_tier_upgrades()`

```sql
SELECT * FROM apply_pending_tier_upgrades('user@example.com');
```

**Chức năng:**
1. Tìm tất cả pending upgrades cho email
2. Tính tier cao nhất (nếu user mua nhiều products)
3. Update user tiers
4. Mark pending upgrades as applied
5. Log vào shopify_orders table

---

### Trigger Mới: `on_user_signup_apply_pending_upgrades`

**Tự động chạy** mỗi khi có user mới được insert vào `users` table.

**Logic:**
```sql
AFTER INSERT ON users
→ Check if pending_tier_upgrades exists for this email
→ If yes: Call apply_pending_tier_upgrades()
→ User gets tier immediately after signup!
```

---

## 📝 Webhook Changes

### Trước Đây (Old Code)

```typescript
if (userError || !userData) {
  console.error('❌ User not found:', userError)
  return new Response(
    JSON.stringify({ error: 'User not found' }),
    { status: 404 }
  )
}
```

**Problem:** Return error → Order bị lost!

---

### Bây Giờ (New Code)

```typescript
if (userError || !userData) {
  console.log(`⏳ User not found for email: ${customerEmail}`)
  console.log(`   Saving to pending_tier_upgrades table...`)

  // Save to pending table
  await supabase
    .from('pending_tier_upgrades')
    .insert({
      email: customerEmail,
      order_id: orderIdShopify,
      product_type: productType,
      tier_purchased: tierPurchased,
      amount: amountPaid,
      purchased_at: new Date().toISOString(),
      applied: false
    })

  console.log(`✅ Pending upgrade saved for ${customerEmail}`)
  console.log(`   Will be applied automatically when user signs up!`)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Order saved. Tier will be applied when user signs up.',
      pending: true
    }),
    { status: 200 }
  )
}
```

**Benefit:** Lưu order thay vì reject → User vẫn nhận được tier sau khi signup!

---

## 🚀 Deployment Steps

### Bước 1: Chạy Database Migration

**Đường dẫn SQL Editor:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

**Paste file:** `database_pending_tier_upgrades.sql`

Click **"Run"**

**Kết quả mong đợi:**
```
✅ Table: pending_tier_upgrades created
✅ Indexes created for fast lookup
✅ Function: apply_pending_tier_upgrades() created
✅ Trigger: Auto-apply on user signup enabled
```

---

### Bước 2: Deploy Updated Webhook

**Code đã được update trong:** `supabase/functions/shopify-webhook/index.ts`

**Deploy qua Dashboard:**
1. Vào: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook
2. Click tab **"Code"**
3. Copy toàn bộ nội dung `index.ts` đã update
4. Paste vào editor
5. Click **"Deploy"**

**Hoặc deploy qua CLI:**
```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
supabase functions deploy shopify-webhook --no-verify-jwt
```

---

### Bước 3: Verify Deployment

#### A. Check Database

```sql
-- Check table exists
SELECT * FROM pending_tier_upgrades LIMIT 1;

-- Check function exists
SELECT * FROM apply_pending_tier_upgrades('test@example.com');

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_user_signup_apply_pending_upgrades';
```

#### B. Check Webhook Deployed

```
curl https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

Should return: `{"error":"Unauthorized"}` ✅

---

## 🧪 Testing Both Flows

### Test Flow 1: Signup → Mua (Normal Flow)

**Bước 1:** Signup trong app
- Email: `test-flow1@example.com`

**Bước 2:** Mua product trên Shopify
- Checkout với email: `test-flow1@example.com`
- Product: Scanner PRO (SKU: `gem-scanner-pro`)

**Bước 3:** Check logs
- URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs

**Expected:**
```
✅ HMAC verified successfully
📧 Order from: test-flow1@example.com
💰 Financial status: paid
✅ Order is paid. Processing tier upgrade...
💎 Product: scanner, Tier: pro
👤 Found user d5f7a8c3...
✅ User scanner_tier updated: pro
✅ Transaction logged successfully
```

**Bước 4:** Check database
```sql
SELECT email, scanner_tier FROM users
WHERE email = 'test-flow1@example.com';
```

**Expected:** `scanner_tier = 'pro'` ✅

---

### Test Flow 2: Mua → Signup (New Flow)

**Bước 1:** Mua product trên Shopify TRƯỚC (chưa signup)
- Vào: https://yinyangmasters.com
- Thêm product: **Chatbot PREMIUM** (SKU: `gem-chatbot-premium`)
- Checkout với email: `test-flow2@example.com` (email CHƯA TỒN TẠI trong app)

**Bước 2:** Check logs ngay sau khi mua
- URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs

**Expected:**
```
✅ HMAC verified successfully
📧 Order from: test-flow2@example.com
💰 Financial status: paid
✅ Order is paid. Processing tier upgrade...
💎 Product: chatbot, Tier: premium
⏳ User not found for email: test-flow2@example.com
   Saving to pending_tier_upgrades table...
✅ Pending upgrade saved for test-flow2@example.com
   Product: chatbot, Tier: premium
   Will be applied automatically when user signs up!
```

**Bước 3:** Check pending table
```sql
SELECT * FROM pending_tier_upgrades
WHERE email = 'test-flow2@example.com';
```

**Expected:**
| email | product_type | tier_purchased | applied |
|-------|--------------|----------------|---------|
| test-flow2@example.com | chatbot | premium | FALSE |

**Bước 4:** Signup trong app
- Vào app UI
- Click "Sign Up"
- Email: `test-flow2@example.com` (CÙNG email đã mua hàng)
- Password: anything
- Complete signup

**Bước 5:** Check database ngay sau signup
```sql
SELECT email, chatbot_tier FROM users
WHERE email = 'test-flow2@example.com';
```

**Expected:** `chatbot_tier = 'premium'` ✅ (Tier đã được apply tự động!)

**Bước 6:** Check pending table lại
```sql
SELECT * FROM pending_tier_upgrades
WHERE email = 'test-flow2@example.com';
```

**Expected:**
| email | applied | applied_at |
|-------|---------|------------|
| test-flow2@example.com | TRUE | 2025-11-07 21:15:32 |

✅ `applied = TRUE` nghĩa là đã được apply!

---

### Test Flow 3: Mua Nhiều Products → Signup (Edge Case)

**Scenario:** User mua cả 3 products trước khi signup.

**Bước 1:** Mua 3 orders liên tiếp
- Order 1: Course Tier 1 (email: `test-flow3@example.com`)
- Order 2: Scanner PRO (email: `test-flow3@example.com`)
- Order 3: Chatbot PREMIUM (email: `test-flow3@example.com`)

**Bước 2:** Check pending table
```sql
SELECT product_type, tier_purchased, applied
FROM pending_tier_upgrades
WHERE email = 'test-flow3@example.com'
ORDER BY purchased_at;
```

**Expected:** 3 rows, tất cả `applied = FALSE`

**Bước 3:** Signup
- Email: `test-flow3@example.com`

**Bước 4:** Check user tiers
```sql
SELECT email, course_tier, scanner_tier, chatbot_tier
FROM users
WHERE email = 'test-flow3@example.com';
```

**Expected:**
| email | course_tier | scanner_tier | chatbot_tier |
|-------|-------------|--------------|--------------|
| test-flow3@example.com | tier1 | pro | premium |

✅ **TẤT CẢ 3 tiers đã được apply cùng lúc!**

**Bước 5:** Check shopify_orders table
```sql
SELECT order_id, product_type, tier_purchased
FROM shopify_orders
WHERE user_id = (SELECT id FROM users WHERE email = 'test-flow3@example.com');
```

**Expected:** 3 rows (tất cả 3 orders đã được log)

---

## 📊 Monitoring Queries

### 1. Xem Pending Upgrades Chưa Apply

```sql
SELECT
  email,
  product_type,
  tier_purchased,
  amount,
  purchased_at,
  created_at
FROM pending_tier_upgrades
WHERE applied = FALSE
ORDER BY created_at DESC;
```

**Use case:** Xem users nào đã mua hàng nhưng chưa signup.

---

### 2. Xem Pending Upgrades Đã Apply

```sql
SELECT
  email,
  product_type,
  tier_purchased,
  applied_at,
  purchased_at
FROM pending_tier_upgrades
WHERE applied = TRUE
ORDER BY applied_at DESC
LIMIT 20;
```

**Use case:** Xem users vừa signup và nhận được tier.

---

### 3. Xem User Có Bao Nhiêu Pending Upgrades

```sql
SELECT
  email,
  COUNT(*) as pending_count,
  SUM(amount) as total_spent
FROM pending_tier_upgrades
WHERE applied = FALSE
GROUP BY email
ORDER BY pending_count DESC;
```

**Use case:** Tìm users mua nhiều products nhưng chưa signup (để retarget họ signup).

---

### 4. Manually Apply Pending Upgrades (Nếu Cần)

```sql
-- Check pending
SELECT * FROM pending_tier_upgrades
WHERE email = 'user@example.com' AND applied = FALSE;

-- Apply manually
SELECT * FROM apply_pending_tier_upgrades('user@example.com');

-- Verify applied
SELECT email, course_tier, scanner_tier, chatbot_tier
FROM users WHERE email = 'user@example.com';
```

---

## 🆘 Troubleshooting

### Lỗi: Pending upgrade không được apply sau signup

**Check 1: Trigger có hoạt động?**
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_user_signup_apply_pending_upgrades';
```

Should return 1 row with `event_manipulation = INSERT`.

**Check 2: Function có hoạt động?**
```sql
SELECT * FROM apply_pending_tier_upgrades('test@example.com');
```

Should return: `upgrades_applied, course_tier, scanner_tier, chatbot_tier`.

**Check 3: Có pending upgrades không?**
```sql
SELECT * FROM pending_tier_upgrades
WHERE email = 'test@example.com' AND applied = FALSE;
```

**Fix:** Manually run function nếu trigger không chạy:
```sql
SELECT * FROM apply_pending_tier_upgrades('user@example.com');
```

---

### Lỗi: Webhook không lưu vào pending table

**Check logs:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs
```

**Tìm:**
```
⏳ User not found for email: ...
✅ Pending upgrade saved for ...
```

**Nếu không thấy** → Webhook chưa deploy code mới.

**Fix:** Re-deploy webhook với code updated.

---

### Lỗi: User signup nhưng tier vẫn là 'free'

**Possible causes:**

**1. Email không match:**
- User mua hàng với: `user@example.com`
- User signup với: `user123@example.com`

→ Email PHẢI GIỐNG NHAU!

**2. Trigger không chạy:**
```sql
-- Check trigger logs (if enabled)
-- Or manually apply
SELECT * FROM apply_pending_tier_upgrades('user@example.com');
```

**3. Pending upgrades đã applied trước đó:**
```sql
SELECT * FROM pending_tier_upgrades
WHERE email = 'user@example.com';
```

If `applied = TRUE` → Đã apply rồi, nhưng có thể user bị delete/recreate.

---

## 📋 Checklist Deployment

- [ ] Chạy `database_pending_tier_upgrades.sql` trong SQL Editor
- [ ] Verify table, function, trigger created
- [ ] Deploy updated webhook code (`index.ts`)
- [ ] Test Flow 1: Signup → Mua (should work as before)
- [ ] Test Flow 2: Mua → Signup (NEW flow)
- [ ] Test Flow 3: Mua nhiều products → Signup
- [ ] Check logs: pending upgrades được lưu
- [ ] Check database: tiers được apply sau signup
- [ ] Monitor `pending_tier_upgrades` table
- [ ] Update documentation/training materials

---

## 🎉 Benefits

✅ **User-friendly:** User không bị force signup trước khi mua

✅ **No lost orders:** Tất cả orders đều được track, kể cả từ users chưa signup

✅ **Automatic:** Trigger tự động apply tiers khi user signup

✅ **Supports multiple purchases:** User có thể mua nhiều products trước khi signup

✅ **Backward compatible:** Flow cũ (signup → mua) vẫn hoạt động bình thường

✅ **Clean logs:** Rõ ràng trong logs khi nào apply ngay, khi nào pending

---

## 🚀 Next Steps

Sau khi deploy xong, bạn có thể:

1. **Monitor pending upgrades:**
   - Check regularly: Bao nhiêu users mua hàng nhưng chưa signup?
   - Retarget họ qua email: "Bạn đã mua hàng, hãy signup để kích hoạt!"

2. **Analytics:**
   - % users signup trước vs mua trước?
   - Average time between purchase và signup?
   - Users mua bao nhiêu products trung bình trước khi signup?

3. **Marketing:**
   - Email automation: Gửi email reminder cho users có pending upgrades
   - Offer: "Signup ngay để unlock tier bạn đã mua!"

---

**HỆ THỐNG BÂY GIỜ LINH HOẠT HƠN! 🎉**

User có thể **mua hàng bất kỳ lúc nào**, signup **bất kỳ lúc nào**, và tier sẽ **tự động được apply**!

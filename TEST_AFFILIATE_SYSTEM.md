# 🧪 HƯỚNG DẪN TEST HỆ THỐNG AFFILIATE

## BƯỚC 1: KIỂM TRA DATABASE

### 1.1 Chạy SQL Check Script

Vào **Supabase Dashboard** > **SQL Editor** > Paste nội dung file:
```
supabase/CHECK_AFFILIATE_TABLES.sql
```

### 1.2 Kết quả mong đợi

**Tables cần có:**
- ✅ users
- ✅ affiliate_profiles
- ✅ affiliate_referrals
- ✅ affiliate_sales
- ✅ affiliate_commissions hoặc commission_sales
- ✅ shopify_orders
- ✅ shopify_webhook_logs
- ✅ pending_tier_upgrades

**Columns quan trọng trong `shopify_orders`:**
- shopify_order_id
- partner_id (UUID)
- product_type (varchar)
- financial_status
- paid_at

---

## BƯỚC 2: TEST SHOPIFY THEME TRACKING

### 2.1 Test Cookie Tracking

```
1. Mở browser (Chrome/Firefox)
2. Vào: https://yinyangmasters.com/?ref=TEST123
3. Mở Developer Console (F12)
4. Gõ: GEM_AFFILIATE.getCookie()
5. Kết quả: "TEST123" ✅
```

### 2.2 Test Cart Attributes

```
1. Vẫn ở trang yinyangmasters.com (đã có cookie)
2. Add bất kỳ sản phẩm vào Cart
3. Mở Console, gõ:
   fetch('/cart.js').then(r => r.json()).then(console.log)
4. Tìm trong response:
   "attributes": { "partner_id": "TEST123" } ✅
```

### 2.3 Test với Affiliate thật

```
1. Lấy referral_code của một CTV từ database:
   SELECT user_id, referral_code FROM affiliate_profiles LIMIT 1;

2. Giả sử kết quả: referral_code = "ABC123", user_id = "uuid-xxx"

3. Mở: https://yinyangmasters.com/?ref=ABC123

4. Add sản phẩm vào cart

5. Checkout (không cần thanh toán thật)

6. Kiểm tra trong Shopify Admin > Orders:
   - Order mới có "Note attributes": partner_id = ABC123
```

---

## BƯỚC 3: TEST WEBHOOK END-TO-END

### 3.1 Chuẩn bị

Cần một CTV thật trong database:

```sql
-- Tạo test affiliate profile (nếu chưa có)
INSERT INTO affiliate_profiles (user_id, referral_code, role, ctv_tier, total_sales)
VALUES (
  'YOUR_USER_UUID',  -- Thay bằng user_id thật
  'TEST_CTV_001',
  'ctv',
  'beginner',
  0
)
ON CONFLICT (user_id) DO NOTHING;
```

### 3.2 Tạo Test Order trong Shopify

**Cách 1: Qua Shopify Admin UI**

1. Shopify Admin > Orders > Create order
2. Add customer (email phải match user trong Supabase)
3. Add sản phẩm bất kỳ
4. Trong "Notes" section, click "Add note"
5. Không thể add note_attributes qua UI, dùng Cách 2

**Cách 2: Qua Shopify API (Recommended)**

```bash
# PowerShell - Tạo order với partner_id
$SHOPIFY_STORE = "yinyang-masters"
$SHOPIFY_TOKEN = "shpat_YOUR_TOKEN"  # Lấy từ Shopify Admin > Apps > Develop apps

curl -X POST "https://$SHOPIFY_STORE.myshopify.com/admin/api/2024-01/orders.json" `
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "order": {
      "email": "test@example.com",
      "line_items": [
        {
          "title": "Test Product",
          "price": "100000",
          "quantity": 1
        }
      ],
      "note_attributes": [
        {
          "name": "partner_id",
          "value": "TEST_CTV_001"
        }
      ],
      "financial_status": "paid"
    }
  }'
```

**Cách 3: Mua thật với Affiliate Link**

1. Mở: https://yinyangmasters.com/?ref=TEST_CTV_001
2. Add sản phẩm vào cart
3. Checkout và thanh toán thật (có thể dùng test credit card)
4. Webhook sẽ tự động trigger

### 3.3 Verify Webhook Received

Sau khi tạo/thanh toán order, check trong Supabase:

```sql
-- Check webhook logs (mới nhất)
SELECT
  id,
  topic,
  shopify_id,
  processed,
  created_at,
  payload->>'financial_status' as status
FROM shopify_webhook_logs
ORDER BY created_at DESC
LIMIT 5;
```

**Kết quả mong đợi:**
- Có record với topic = "orders/create" hoặc "orders/paid"
- processed = false (ban đầu) hoặc true (sau khi xử lý)

### 3.4 Verify Order Saved

```sql
-- Check orders
SELECT
  shopify_order_id,
  order_number,
  email,
  total_price,
  financial_status,
  partner_id,
  product_type,
  paid_at,
  processed_at
FROM shopify_orders
ORDER BY created_at DESC
LIMIT 5;
```

**Kết quả mong đợi:**
- Order mới xuất hiện
- partner_id = "TEST_CTV_001" (hoặc UUID của CTV)
- financial_status = "paid" (nếu đã thanh toán)

### 3.5 Verify Commission Calculated

```sql
-- Check commission (commission_sales table)
SELECT
  partner_id,
  shopify_order_id,
  order_total,
  product_type,
  commission_rate,
  commission_amount,
  status,
  created_at
FROM commission_sales
ORDER BY created_at DESC
LIMIT 5;

-- Hoặc check affiliate_commissions table
SELECT * FROM affiliate_commissions
ORDER BY created_at DESC
LIMIT 5;
```

**Kết quả mong đợi:**
- Commission record mới
- commission_amount > 0
- commission_rate đúng theo tier (10% digital, 3% physical cho beginner)

### 3.6 Verify Affiliate Stats Updated

```sql
-- Check affiliate profile updated
SELECT
  user_id,
  referral_code,
  role,
  ctv_tier,
  total_sales
FROM affiliate_profiles
WHERE referral_code = 'TEST_CTV_001';
```

**Kết quả mong đợi:**
- total_sales tăng lên bằng order_total

---

## BƯỚC 4: TEST MOBILE APP

### 4.1 Đăng nhập với CTV Account

1. Mở GEM Mobile App
2. Đăng nhập với tài khoản CTV đã test

### 4.2 Verify AffiliateScreen

1. Vào Account > Affiliate (hoặc CTV Dashboard)
2. Check hiển thị:
   - ✅ Referral Code / Link
   - ✅ Total Commission
   - ✅ Pending Commission
   - ✅ Recent Orders (có order mới test)
   - ✅ Commission amount đúng

### 4.3 Test Copy Referral Link

1. Tap "Copy Link"
2. Paste ở đâu đó
3. Link format: `https://gem.vn/?ref=TEST_CTV_001` hoặc tương tự

---

## BƯỚC 5: CHECK EDGE FUNCTION LOGS

### 5.1 Qua Supabase Dashboard

1. Vào: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions
2. Click vào `shopify-webhook`
3. Tab "Logs"
4. Tìm log entries gần đây

### 5.2 Logs mong đợi

```
📨 Webhook received: orders/paid
📧 Order from: test@example.com, Order ID: 123456
💎 Product: digital, Tier: TIER1, Amount: 100000
👤 Found user abc-123
🎯 Checking for affiliate referral...
🎉 AFFILIATE FOUND! ID: xyz-789
   Role: ctv, CTV Tier: beginner
💰 Commission: 100000 × 10% = 10000
✅ Commission processed
```

---

## 🔴 TROUBLESHOOTING

### Webhook không trigger

1. Check Shopify Admin > Settings > Notifications > Webhooks
2. Xem "Recent webhook deliveries"
3. Check status codes (200 = OK, 401 = Auth failed, 500 = Error)

### Commission không được tính

1. Check partner_id có trong order không
2. Check user có trong affiliate_profiles không
3. Check Edge Function logs cho errors

### partner_id không được gửi

1. Verify Shopify theme script đã install
2. Check cookie: `document.cookie` trong Console
3. Check cart attributes: `fetch('/cart.js').then(r=>r.json()).then(console.log)`

---

## ✅ SUCCESS CRITERIA

Test thành công khi:

- [ ] Cookie được lưu khi visit với ?ref=
- [ ] Cart có partner_id attribute
- [ ] Webhook logs có record mới
- [ ] shopify_orders có order mới với partner_id
- [ ] commission_sales có commission record
- [ ] affiliate_profiles.total_sales tăng
- [ ] Mobile app hiển thị commission đúng

---

## 📞 QUICK DEBUG QUERIES

```sql
-- Everything in one query
SELECT
  'Webhook Logs' as type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM shopify_webhook_logs
UNION ALL
SELECT
  'Orders' as type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM shopify_orders
UNION ALL
SELECT
  'Commissions' as type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM commission_sales
UNION ALL
SELECT
  'Affiliates' as type,
  COUNT(*) as count,
  NULL as latest
FROM affiliate_profiles;
```

---

*Last updated: November 26, 2025*

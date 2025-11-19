# 🔧 URGENT: Sửa SKU Của Shopify Products

## ⚠️ Vấn Đề

**3 products có SKU sai** → Webhook sẽ không nhận diện được → Tier sẽ không tự động nâng cấp!

---

## 📋 Danh Sách Cần Sửa

### 1. YinYang Chatbot AI - PRO
- 🔗 URL: https://yinyangmasters.com/products/yinyang-chatbot-ai-pro
- ❌ SKU hiện tại: Chưa biết (có thể là `yinyang-chatbot-ai-pro`)
- ✅ SKU phải là: **`gem-chatbot-pro`**

### 2. Scanner Dashboard - VIP
- 🔗 URL: https://yinyangmasters.com/products/scanner-dashboard-vip
- ❌ SKU hiện tại: Chưa biết (có thể là `scanner-dashboard-vip`)
- ✅ SKU phải là: **`gem-scanner-vip`**

### 3. Scanner Dashboard - PREMIUM
- 🔗 URL: https://yinyangmasters.com/products/scanner-dashboard-premium
- ❌ SKU hiện tại: Chưa biết (có thể là `scanner-dashboard-premium`)
- ✅ SKU phải là: **`gem-scanner-premium`**

---

## 🔧 Cách Sửa SKU Trong Shopify

### Bước 1: Vào Shopify Admin
1. Vào: https://yinyang-masters.myshopify.com/admin
2. Click **Products** ở sidebar trái

### Bước 2: Sửa Từng Product

#### A. Sửa Chatbot PRO
1. Tìm product: **YinYang Chatbot AI - PRO**
2. Click vào product để edit
3. Scroll xuống phần **Pricing**
4. Tìm dòng **SKU**
5. Đổi thành: **`gem-chatbot-pro`**
6. Click **Save** ở góc trên phải

#### B. Sửa Scanner VIP
1. Tìm product: **Scanner Dashboard - VIP**
2. Click vào product để edit
3. Scroll xuống phần **Pricing**
4. Tìm dòng **SKU**
5. Đổi thành: **`gem-scanner-vip`**
6. Click **Save**

#### C. Sửa Scanner PREMIUM
1. Tìm product: **Scanner Dashboard - PREMIUM**
2. Click vào product để edit
3. Scroll xuống phần **Pricing**
4. Tìm dòng **SKU**
5. Đổi thành: **`gem-scanner-premium`**
6. Click **Save**

---

## ✅ Verify SKU Đã Đúng

Sau khi sửa xong, kiểm tra lại:

### Products PHẢI CÓ SKU Như Sau:

| Product | SKU Đúng | URL |
|---------|----------|-----|
| **Course Tier 1** | `gem-course-tier1` | https://yinyangmasters.com/products/gem-tier1 |
| **Course Tier 2** | `gem-course-tier2` | https://yinyangmasters.com/products/gem-tier2 |
| **Course Tier 3** | `gem-course-tier3` | https://yinyangmasters.com/products/gem-tier3 |
| **Scanner PRO** | `gem-scanner-pro` | https://yinyangmasters.com/products/gem-scanner-pro |
| **Scanner PREMIUM** | `gem-scanner-premium` | https://yinyangmasters.com/products/scanner-dashboard-premium |
| **Scanner VIP** | `gem-scanner-vip` | https://yinyangmasters.com/products/scanner-dashboard-vip |
| **Chatbot PRO** | `gem-chatbot-pro` | https://yinyangmasters.com/products/yinyang-chatbot-ai-pro |
| **Chatbot PREMIUM** | `gem-chatbot-premium` | https://yinyangmasters.com/products/gem-chatbot-premium |

---

## 🧪 Test Sau Khi Sửa

### 1. Kiểm Tra Webhook Đã Deploy
```bash
curl https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

**Kết quả mong đợi:**
```json
{"error":"Unauthorized"}
```
✅ Đây là ĐÚNG! Webhook đang chờ HMAC signature từ Shopify.

### 2. Test Bằng Cách Mua Hàng Thử
1. Vào 1 trong các product pages
2. Thêm vào cart
3. Checkout (dùng test mode nếu có)
4. Hoàn tất thanh toán

### 3. Kiểm Tra Tier Đã Update

**Đường dẫn:** Vào Supabase SQL Editor
- **URL trực tiếp:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
- Hoặc: Supabase Dashboard → SQL Editor (sidebar trái) → New Query

**Paste query này:**
```sql
SELECT
  email,
  course_tier,
  scanner_tier,
  chatbot_tier,
  updated_at
FROM users
WHERE email = 'your-test-email@example.com';
```

**Thay `your-test-email@example.com`** bằng email thật của user test.

**Click "Run"** (nút xanh góc phải) hoặc `Ctrl + Enter`

**Kết quả:** Tier tương ứng phải đã thay đổi!

📖 **Chi tiết hơn:** Xem file `HOW_TO_CHECK_DATABASE.md`

### 4. Xem Logs
```bash
supabase functions logs shopify-webhook
```

Bạn sẽ thấy:
```
✅ HMAC verified successfully
📧 Order from: customer@email.com
💰 Financial status: paid
💎 Product: scanner, Tier: pro, Amount: 997000
✅ User scanner_tier updated: pro
```

### 5. Test Payment Flow (QUAN TRỌNG!)

**Webhook CHỈ nâng cấp tier khi order đã thanh toán!**

#### Test Scenario 1: Order Chưa Thanh Toán
```
1. Tạo order nhưng KHÔNG thanh toán (chọn Bank Transfer)

2. Check logs:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs
   - Hoặc: Supabase → Edge Functions → shopify-webhook → Tab "Logs"

   ✅ HMAC verified successfully
   📧 Order from: customer@email.com
   💰 Financial status: pending
   ⏳ Order not paid yet (status: pending)
   ⏳ Skipping tier update. Will process when marked as paid.

3. Check database:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
   - Paste query:
     SELECT email, scanner_tier FROM users WHERE email = 'your-email@example.com';
   - Click "Run"

   → Tier KHÔNG đổi ✅
```

#### Test Scenario 2: Mark Order As Paid Sau
```
1. Vào Shopify Admin → Orders
2. Tìm order vừa tạo
3. Click "Mark as paid"
4. Nếu có webhook "Order updated" → Webhook tự động trigger

5. Check logs:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs

   ✅ HMAC verified successfully
   📧 Order from: customer@email.com
   💰 Financial status: paid
   ✅ Order is paid. Processing tier upgrade...
   💎 Product: scanner, Tier: pro
   ✅ User scanner_tier updated: pro

6. Check database:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
   - Query: SELECT email, scanner_tier FROM users WHERE email = 'your-email@example.com';

   → Tier ĐÃ đổi ✅
```

#### Test Scenario 3: Order Đã Thanh Toán Ngay
```
1. Tạo order và thanh toán luôn (credit card test mode)

2. Check logs:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs

   ✅ HMAC verified successfully
   📧 Order from: customer@email.com
   💰 Financial status: paid
   ✅ Order is paid. Processing tier upgrade...
   💎 Product: scanner, Tier: pro
   ✅ User scanner_tier updated: pro

3. Check database:
   - URL: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
   - Query: SELECT email, scanner_tier FROM users WHERE email = 'your-email@example.com';

   → Tier đã đổi ngay lập tức ✅
```

**Expected Behavior:**
- ✅ Order `pending` → Tier KHÔNG đổi
- ✅ Order `paid` → Tier tự động nâng cấp
- ✅ Mark as paid sau → Tier nâng cấp khi có webhook "Order updated"

---

## 🚨 Nếu Vẫn Không Hoạt Động

### Check Webhook Configuration
1. Shopify Admin → Settings → Notifications
2. Scroll xuống **Webhooks**
3. Tìm webhook: **Order creation**
4. URL phải là: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`
5. Secret phải match với: `c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd`

### Check Edge Function Logs
```bash
supabase functions logs shopify-webhook --limit 20
```

Tìm errors ở đây.

### Common Issues

#### Issue: "No valid product SKU found"
→ SKU không đúng format. Sửa lại SKU theo bảng trên.

#### Issue: "User not found"
→ User phải signup trong app TRƯỚC KHI mua hàng trên Shopify.

#### Issue: "HMAC verification failed"
→ Webhook secret sai. Check lại trong Shopify Settings.

---

## 📝 Next Steps

Sau khi sửa xong SKU:
1. ✅ Sửa 3 SKU trong Shopify
2. ✅ Deploy Edge Function (chạy `deploy-shopify-webhook.bat`)
3. ✅ Test bằng mua hàng thử
4. ✅ Verify tier đã update trong database

---

**Xong hết rồi! 🎉**

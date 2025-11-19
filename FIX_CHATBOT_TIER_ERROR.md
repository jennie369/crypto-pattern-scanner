# 🔧 Fix: Chatbot Tier Database Error

## ❌ Lỗi Hiện Tại

Khi webhook xử lý order mua Chatbot PREMIUM, bạn thấy lỗi:

```
❌ Failed to update tier: {
  code: "22P02",
  message: 'invalid input syntax for type integer: "premium"'
}
```

**Logs chi tiết:**
```
✅ HMAC verified successfully
📧 Order from: jenniechu68@gmail.com
💰 Financial status: paid
✅ Order is paid. Processing tier upgrade...
💎 Product: chatbot, Tier: premium, Amount: 99000
👤 Found user...
❌ Failed to update tier (code: 22P02)
```

---

## 🔍 Nguyên Nhân

**PostgreSQL Error Code 22P02**: "invalid input syntax for type integer"

Nghĩa là: Column `chatbot_tier` trong database đang là kiểu **INTEGER**, nhưng code đang cố gắng insert giá trị **string** "premium".

**Tại sao?**
- Database migration `database_migration_3tiers.sql` định nghĩa column đúng là `VARCHAR(20)`
- Nhưng có thể:
  1. Migration chưa được chạy hoàn chỉnh
  2. Column đã tồn tại trước đó với kiểu INTEGER
  3. Migration chạy nhưng ALTER COLUMN không thành công

---

## ✅ GIẢI PHÁP (2 PHÚT)

### Bước 1: Vào Supabase SQL Editor

**Đường dẫn trực tiếp:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

Hoặc:
1. Vào: https://supabase.com/dashboard
2. Click project: **Gem Trading** (pgfkbcnzqozzkohwbgbk)
3. Sidebar trái → **SQL Editor**
4. Click **New Query**

---

### Bước 2: Paste Script Sửa Lỗi

Copy toàn bộ nội dung file: **`FIX_DATABASE_COLUMN_TYPES_V2.sql`**

**QUAN TRỌNG**: Dùng V2, KHÔNG dùng V1!

Paste vào SQL Editor.

Click **"Run"** (nút xanh góc phải) hoặc `Ctrl + Enter`

**Script V2 sẽ:**
1. Check data hiện có
2. Migrate data từ integer sang string (nếu có)
3. Set NULL values thành 'free'
4. Fix invalid values
5. Rồi mới apply constraints

---

### Bước 3: Verify Kết Quả

Sau khi chạy xong, bạn sẽ thấy bảng kết quả:

| column_name | data_type | character_maximum_length | column_default |
|-------------|-----------|-------------------------|----------------|
| chatbot_tier | character varying | 20 | 'free'::character varying |
| course_tier | character varying | 20 | 'free'::character varying |
| scanner_tier | character varying | 20 | 'free'::character varying |

✅ **ĐÚNG RỒI!** Tất cả 3 columns giờ đã là `VARCHAR(20)`.

Và message:
```
╔════════════════════════════════════════════════╗
║  ✅ COLUMN TYPES FIXED                         ║
╚════════════════════════════════════════════════╝

✅ All 3 tier columns are now VARCHAR(20)
✅ Constraints re-applied
✅ Ready to receive Shopify webhooks!

🧪 NEXT: Test webhook by creating a new order
```

---

## 🧪 TEST LẠI SAU KHI FIX

### Test 1: Tạo Order Mới Trên Shopify

1. Vào store: https://yinyangmasters.com
2. Thêm product **Chatbot PREMIUM** vào cart
3. Checkout với email: `jenniechu68@gmail.com` (hoặc email test khác)
4. Complete order

---

### Test 2: Check Logs

**Đường dẫn:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs
```

**Bây giờ PHẢI thấy:**
```
✅ HMAC verified successfully
📧 Order from: jenniechu68@gmail.com
💰 Financial status: paid
✅ Order is paid. Processing tier upgrade...
💎 Product: chatbot, Tier: premium, Amount: 99000
👤 Found user d5f7a8c3...
   Course: free, Scanner: free, Chatbot: free
✅ User chatbot_tier updated: premium
✅ Transaction logged successfully
```

**KHÔNG còn lỗi** `Failed to update tier`! 🎉

---

### Test 3: Check Database

**Đường dẫn:**
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```

**Query:**
```sql
SELECT
  email,
  course_tier,
  scanner_tier,
  chatbot_tier,
  updated_at
FROM users
WHERE email = 'jenniechu68@gmail.com';
```

**Kết quả mong đợi:**
| email | course_tier | scanner_tier | chatbot_tier | updated_at |
|-------|-------------|--------------|--------------|------------|
| jenniechu68@gmail.com | free | free | **premium** | 2025-11-07 14:23:45 |

✅ `chatbot_tier` đã được update thành **premium**!

---

## 🔄 Test Tất Cả 3 Product Types

Sau khi fix xong, test cả 3 loại products:

### 1. Test Course Product
```
Product: Course Tier 1 (SKU: gem-course-tier1)
Expected: course_tier = 'tier1'
```

### 2. Test Scanner Product
```
Product: Scanner PRO (SKU: gem-scanner-pro)
Expected: scanner_tier = 'pro'
```

### 3. Test Chatbot Product
```
Product: Chatbot PREMIUM (SKU: gem-chatbot-premium)
Expected: chatbot_tier = 'premium'
```

**Tất cả 3 phải hoạt động KHÔNG có lỗi!**

---

## 🔍 Chi Tiết Script Làm Gì

File `FIX_DATABASE_COLUMN_TYPES.sql` thực hiện:

### 1. Check Current Column Types
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN (...)
```
Xem column hiện tại đang là kiểu gì.

### 2. Fix Chatbot Tier Column
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_chatbot_tier_check;
ALTER TABLE users ALTER COLUMN chatbot_tier TYPE VARCHAR(20);
ALTER TABLE users ALTER COLUMN chatbot_tier SET DEFAULT 'free';
ALTER TABLE users ADD CONSTRAINT users_chatbot_tier_check
  CHECK (chatbot_tier IN ('free', 'pro', 'premium'));
```

**Các bước:**
1. Xóa constraint cũ (nếu có)
2. Đổi column type thành VARCHAR(20)
3. Set default value = 'free'
4. Thêm lại constraint để validate giá trị

### 3. Fix All 3 Columns (To Be Safe)
Script cũng fix luôn `course_tier` và `scanner_tier` để đảm bảo cả 3 đều đúng kiểu.

### 4. Verify
Kiểm tra lại để confirm tất cả đã là VARCHAR(20).

---

## ⚠️ Quan Trọng

**Sau khi chạy script này:**
1. ✅ Không cần re-deploy Edge Function (code đã đúng)
2. ✅ Không cần sửa code (code đã đúng)
3. ✅ Chỉ cần fix database schema
4. ✅ Test ngay bằng cách tạo order mới trên Shopify

**Script này KHÔNG:**
- ❌ Xóa data hiện có
- ❌ Thay đổi giá trị trong database
- ❌ Ảnh hưởng đến users hiện tại

Script CHỈ sửa **kiểu dữ liệu** của columns.

---

## 🆘 Nếu Vẫn Gặp Lỗi

### Lỗi: "check constraint is violated by some row"
**Full error:**
```
ERROR: 23514: check constraint "users_chatbot_tier_check" of relation "users" is violated by some row
```

**Nguyên nhân**: Table có data không hợp lệ (integer hoặc NULL values)

**Giải pháp**: Dùng script **V2** (file `FIX_DATABASE_COLUMN_TYPES_V2.sql`), KHÔNG dùng V1!

Script V2 sẽ migrate data TRƯỚC KHI apply constraints.

---

### Lỗi: "relation 'users' does not exist"
→ Sai database. Check lại xem bạn đang connect đúng project `pgfkbcnzqozzkohwbgbk`.

### Lỗi: "permission denied"
→ Vào SQL Editor trong Supabase Dashboard, KHÔNG dùng external SQL client.

### Lỗi: "constraint ... already exists"
→ Bỏ qua lỗi này, script vẫn chạy tiếp.

### Vẫn thấy lỗi "invalid input syntax for type integer"
→ Paste output của query này:
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('course_tier', 'scanner_tier', 'chatbot_tier')
ORDER BY column_name;
```

Gửi screenshot output để debug thêm.

---

## 📋 Checklist

- [ ] Vào SQL Editor: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
- [ ] Paste toàn bộ file `FIX_DATABASE_COLUMN_TYPES.sql`
- [ ] Click "Run"
- [ ] Thấy message "✅ COLUMN TYPES FIXED"
- [ ] Tạo test order trên Shopify
- [ ] Check logs: Không còn lỗi "Failed to update tier"
- [ ] Check database: Tier đã được update đúng
- [ ] Test cả 3 product types (Course, Scanner, Chatbot)

---

## 🎯 Quick Links

| Task | URL |
|------|-----|
| **SQL Editor** | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql |
| **Function Logs** | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs |
| **Users Table** | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor/users |
| **Shopify Store** | https://yinyangmasters.com |
| **Shopify Admin** | https://yinyang-masters.myshopify.com/admin |

---

**LET'S FIX IT! 🚀**

**Bắt đầu ngay: Vào SQL Editor → Paste script → Run!**

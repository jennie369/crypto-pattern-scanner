# 🗄️ Hướng Dẫn Check Database

## 📍 Cách Vào SQL Editor

### Cách 1: URL Trực Tiếp (NHANH NHẤT)
```
https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
```
Click vào link này → Mở SQL Editor ngay!

### Cách 2: Qua Dashboard
1. Vào: https://supabase.com/dashboard
2. Click vào project: **Gem Trading**
3. Sidebar trái → Click **SQL Editor** (icon database)
4. Click **New Query**

---

## 📊 Common Queries

### 1. Kiểm Tra Tier Của User

**Đường dẫn:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql

**Query:**
```sql
SELECT
  email,
  course_tier,
  scanner_tier,
  chatbot_tier,
  updated_at
FROM users
WHERE email = 'test@example.com';
```

**Thay `test@example.com`** bằng email của user bạn muốn check.

**Cách chạy:**
1. Paste query vào editor
2. Thay email
3. Click **"Run"** (nút xanh góc phải) hoặc `Ctrl + Enter`
4. Xem kết quả ở bảng phía dưới

**Kết quả mẫu:**
| email | course_tier | scanner_tier | chatbot_tier | updated_at |
|-------|-------------|--------------|--------------|------------|
| test@example.com | free | pro | free | 2025-11-07 12:34:56 |

---

### 2. Xem Tất Cả Users Và Tiers

```sql
SELECT
  id,
  email,
  course_tier,
  scanner_tier,
  chatbot_tier,
  created_at,
  updated_at
FROM users
ORDER BY created_at DESC
LIMIT 20;
```

---

### 3. Xem Shopify Orders (Transaction Log)

```sql
SELECT
  so.id,
  so.order_id,
  so.product_type,
  so.tier_purchased,
  so.amount,
  so.processed_at,
  u.email
FROM shopify_orders so
JOIN users u ON u.id = so.user_id
ORDER BY so.processed_at DESC
LIMIT 20;
```

Xem 20 orders gần nhất.

---

### 4. Check User Đã Mua Gì

```sql
SELECT
  u.email,
  u.course_tier,
  u.scanner_tier,
  u.chatbot_tier,
  COUNT(so.id) as total_purchases,
  SUM(so.amount) as total_spent
FROM users u
LEFT JOIN shopify_orders so ON so.user_id = u.id
WHERE u.email = 'test@example.com'
GROUP BY u.id, u.email, u.course_tier, u.scanner_tier, u.chatbot_tier;
```

---

### 5. Tìm Users Có Scanner PRO Hoặc Cao Hơn

```sql
SELECT
  email,
  scanner_tier,
  updated_at
FROM users
WHERE scanner_tier IN ('pro', 'premium', 'vip')
ORDER BY updated_at DESC;
```

---

### 6. Check Daily Scan Quota

```sql
SELECT
  u.email,
  dsq.scan_count,
  dsq.max_scans,
  dsq.last_reset_at,
  u.scanner_tier
FROM daily_scan_quota dsq
JOIN users u ON u.id = dsq.user_id
WHERE u.email = 'test@example.com';
```

---

## 🔧 Troubleshooting Queries

### Tìm Orders Pending (Chưa Thanh Toán)

**Note:** Shopify không gửi financial_status trong webhook data to database, nhưng bạn có thể check orders trong Shopify Admin.

Trong database, chỉ có orders **đã paid** mới được log (sau khi code update).

---

### Reset Tier Về Free (Testing)

```sql
UPDATE users
SET
  scanner_tier = 'free',
  updated_at = NOW()
WHERE email = 'test@example.com';
```

⚠️ **CHỈ dùng để test!**

---

### Xóa Test Orders

```sql
DELETE FROM shopify_orders
WHERE user_id = (
  SELECT id FROM users WHERE email = 'test@example.com'
);
```

⚠️ **CHỈ dùng để test!**

---

## 📝 Template Query Để Copy

```sql
-- Check tier của 1 user
SELECT email, course_tier, scanner_tier, chatbot_tier, updated_at
FROM users
WHERE email = 'YOUR_EMAIL_HERE';

-- Xem orders của user
SELECT so.order_id, so.product_type, so.tier_purchased, so.amount, so.processed_at
FROM shopify_orders so
JOIN users u ON u.id = so.user_id
WHERE u.email = 'YOUR_EMAIL_HERE'
ORDER BY so.processed_at DESC;

-- Xem tất cả users có paid tier
SELECT email, course_tier, scanner_tier, chatbot_tier
FROM users
WHERE
  course_tier != 'free' OR
  scanner_tier != 'free' OR
  chatbot_tier != 'free'
ORDER BY updated_at DESC;
```

---

## 🎯 Quick Links

| Task | URL |
|------|-----|
| SQL Editor | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql |
| Table Editor (users) | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor/users |
| Table Editor (shopify_orders) | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor/shopify_orders |
| Edge Functions | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions |
| Database Settings | https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/settings/database |

---

## 💡 Tips

1. **Save Queries:** SQL Editor có history - queries cũ được lưu tự động
2. **Multiple Queries:** Có thể paste nhiều queries, chọn query muốn chạy rồi click Run
3. **Export Results:** Click "Download CSV" ở kết quả để export
4. **Keyboard Shortcuts:**
   - `Ctrl + Enter`: Run query
   - `Ctrl + /`: Comment/uncomment
   - `Ctrl + S`: Save query

---

**Xong! Giờ bạn biết check database ở đâu rồi!** 🎉

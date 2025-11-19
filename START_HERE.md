# 🚀 SHOPIFY INTEGRATION - BẮT ĐẦU TỪ ĐÂY

## 📋 Tổng Quan

Bạn đang thiết lập hệ thống tự động nâng cấp tier khi user mua hàng trên Shopify.

**Thông tin project:**
- ✅ Supabase Project: `pgfkbcnzqozzkohwbgbk`
- ✅ Shopify Store: `yinyangmasters.com`
- ✅ Webhook URL: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`
- ✅ 8 products đã tạo trên Shopify

---

## 🎯 Những Gì Đã Hoàn Thành

### ✅ Code & Files
- [x] Database migration SQL (`database_migration_3tiers.sql`)
- [x] Edge Function webhook (`supabase/functions/shopify-webhook/index.ts`)
- [x] Frontend Pricing.jsx updated với domain `yinyangmasters.com`
- [x] AuthContext.jsx có helper functions cho 3 tiers
- [x] PatternScanner.jsx dùng `scanner_tier`

### ✅ Documentation
- [x] Deployment guide (`SHOPIFY_DEPLOYMENT_GUIDE.md`)
- [x] Install CLI guide (`INSTALL_SUPABASE_CLI.md`)
- [x] Fix SKU guide (`FIX_SHOPIFY_SKUS.md`)
- [x] Deploy script (`deploy-shopify-webhook.bat`)

---

## 🎉 NEW: Flexible Purchase Flow

**User bây giờ có thể:**
- ✅ Mua hàng TRƯỚC → Signup SAU → Tự động nhận tier
- ✅ Signup TRƯỚC → Mua SAU → Nhận tier ngay (flow cũ)

**Cả 2 flows đều hoạt động!** Xem chi tiết: `NEW_FLEXIBLE_PURCHASE_FLOW.md`

---

## 🔴 CẦN LÀM NGAY (4 Bước)

### BƯỚC 0: Deploy Flexible Purchase System ⭐ **MỚI**

**Mục đích:** Cho phép user mua hàng trước khi signup

1. Vào Supabase SQL Editor: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
2. Copy toàn bộ file: `database_pending_tier_upgrades.sql`
3. Paste vào SQL Editor → Click **Run**
4. Verify thấy: `✅ PENDING TIER UPGRADES SYSTEM CREATED`

**Webhook đã được update tự động** (code trong `index.ts` đã có logic mới)

→ Chỉ cần deploy lại webhook là xong! (Xem BƯỚC 3)

---

### BƯỚC 1: Sửa SKU Trong Shopify ⚠️ **QUAN TRỌNG**

**3 products có SKU sai → Phải sửa ngay!**

Đọc file: **`FIX_SHOPIFY_SKUS.md`**

Tóm tắt:
1. Vào Shopify Admin → Products
2. Sửa 3 products:
   - **Chatbot PRO**: SKU = `gem-chatbot-pro`
   - **Scanner VIP**: SKU = `gem-scanner-vip`
   - **Scanner PREMIUM**: SKU = `gem-scanner-premium`

---

### BƯỚC 2: Chạy Database Migration

1. Vào Supabase Dashboard: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk
2. Click **SQL Editor** (sidebar trái)
3. Click **New Query**
4. Copy toàn bộ nội dung file: `database_migration_3tiers.sql`
5. Paste vào SQL Editor
6. Click **Run**

**Kết quả mong đợi:**
```
✅ 3-TIER MIGRATION COMPLETED
```

---

### BƯỚC 3: Deploy Edge Function

#### A. Cài Supabase CLI
Đọc file: **`INSTALL_SUPABASE_CLI.md`**

**Cách nhanh nhất (Windows):**
```powershell
# Mở PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Cài Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify
supabase --version
```

#### B. Chạy Deploy Script
Double-click file: **`deploy-shopify-webhook.bat`**

Script sẽ tự động:
- Link project
- Set secrets
- Deploy webhook
- Test endpoint

---

## 🧪 Test Toàn Bộ Hệ Thống

### 1. Kiểm Tra Webhook Đã Deploy
Mở browser, vào:
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

**Phải thấy:**
```json
{"error":"Unauthorized"}
```
✅ Đúng rồi! Webhook đang chờ HMAC từ Shopify.

### 2. Test Mua Hàng
1. Signup 1 account test trong app
2. Nhớ email của account
3. Vào Shopify store, thêm 1 product vào cart
4. Checkout với cùng email đã signup
5. Hoàn tất thanh toán

### 3. Kiểm Tra Tier Đã Update
Vào Supabase → SQL Editor:
```sql
SELECT
  email,
  course_tier,
  scanner_tier,
  chatbot_tier,
  updated_at
FROM users
WHERE email = 'test-email@example.com';
```

**Tier tương ứng phải đã thay đổi!** 🎉

### 4. Xem Logs
```bash
supabase functions logs shopify-webhook
```

Sẽ thấy:
```
✅ HMAC verified successfully
📧 Order from: customer@email.com
💎 Product: scanner, Tier: pro
✅ User scanner_tier updated: pro
✅ Transaction logged successfully
```

---

## 📊 SKU Reference (Quan Trọng!)

### Course Products
| Product | Price | SKU |
|---------|-------|-----|
| Course Tier 1 | 11,000,000đ | `gem-course-tier1` |
| Course Tier 2 | 21,000,000đ | `gem-course-tier2` |
| Course Tier 3 VIP | 68,000,000đ | `gem-course-tier3` |

### Scanner Products
| Product | Price | SKU |
|---------|-------|-----|
| Scanner PRO | 997,000đ | `gem-scanner-pro` |
| Scanner PREMIUM | 1,997,000đ | `gem-scanner-premium` |
| Scanner VIP | 5,997,000đ | `gem-scanner-vip` |

### Chatbot Products
| Product | Price | SKU |
|---------|-------|-----|
| Chatbot PRO | 39,000đ | `gem-chatbot-pro` |
| Chatbot PREMIUM | 99,000đ | `gem-chatbot-premium` |

---

## 🔄 Flow Hoàn Chỉnh

### Flow 1: Signup → Mua (Normal)
```
User signup trong app
    ↓
User vào Shopify store → Mua product
    ↓
Shopify gửi webhook → Edge Function nhận
    ↓
Verify HMAC + Check financial_status = paid
    ↓
Parse SKU → Tìm user theo email → ✅ Tìm thấy
    ↓
Update tier NGAY trong database
    ↓
Log transaction vào shopify_orders
    ↓
User refresh app → Thấy tier mới! 🎉
```

### Flow 2: Mua → Signup (NEW - Flexible!)
```
User vào Shopify store → Mua product (CHƯA có account)
    ↓
Shopify gửi webhook → Edge Function nhận
    ↓
Verify HMAC + Check financial_status = paid
    ↓
Parse SKU → Tìm user theo email → ⏳ KHÔNG tìm thấy
    ↓
Lưu vào pending_tier_upgrades table
    ↓
(Sau đó...) User vào app → Signup
    ↓
Database trigger tự động detect pending orders
    ↓
Apply tất cả pending tiers cho user
    ↓
User thấy tier ngay sau signup! 🎉
```

---

## 🆘 Troubleshooting

### Lỗi: "invalid input syntax for type integer: premium"
→ Column type sai trong database. Đọc `FIX_CHATBOT_TIER_ERROR.md`

### Lỗi: "No valid product SKU found"
→ SKU sai. Đọc `FIX_SHOPIFY_SKUS.md`

### Lỗi: "User not found" (ĐÃ FIX!)
→ Đã được fix! Order sẽ lưu vào `pending_tier_upgrades` và apply khi user signup sau
→ Xem: `NEW_FLEXIBLE_PURCHASE_FLOW.md`

### Lỗi: "HMAC verification failed"
→ Webhook secret sai. Check Shopify Settings → Notifications → Webhooks

### Lỗi: "Missing authorization header" (JWT issue)
→ Edge Function require JWT. Đọc `FIX_JWT_AUTH_ISSUE.md`

### Lỗi: "supabase: command not found"
→ Chưa cài Supabase CLI. Đọc `INSTALL_SUPABASE_CLI.md`

---

## 📂 File Structure

```
crypto-pattern-scanner/
├── START_HERE.md                      ← BẠN ĐANG ĐỌC FILE NÀY
├── SHOPIFY_DEPLOYMENT_GUIDE.md        ← Hướng dẫn chi tiết
├── INSTALL_SUPABASE_CLI.md            ← Cài CLI
├── FIX_SHOPIFY_SKUS.md                ← Sửa SKU
├── FIX_JWT_AUTH_ISSUE.md              ← Sửa JWT authentication
├── FIX_CHATBOT_TIER_ERROR.md          ← Sửa database column type
├── HOW_TO_CHECK_DATABASE.md           ← Hướng dẫn check database
├── deploy-shopify-webhook.bat         ← Deploy script
├── database_migration_3tiers.sql      ← Database migration (3 tiers)
├── database_pending_tier_upgrades.sql ← NEW: Flexible purchase system
├── FIX_DATABASE_COLUMN_TYPES_V2.sql   ← Fix column type script (USE THIS)
├── NEW_FLEXIBLE_PURCHASE_FLOW.md      ← NEW: Buy-first-signup-later guide
│
├── supabase/
│   └── functions/
│       └── shopify-webhook/
│           ├── index.ts               ← Webhook code
│           └── config.yaml            ← Disable JWT verification
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── Pricing.jsx            ← Pricing page
│       ├── contexts/
│       │   └── AuthContext.jsx        ← Auth với 3 tiers
│       └── components/
│           └── Scanner/
│               └── PatternScanner.jsx ← Dùng scanner_tier
```

---

## 🎉 Success Criteria

Hệ thống hoạt động khi:
- ✅ User mua Scanner PRO → `scanner_tier` = `pro`
- ✅ User mua Course Tier 1 → `course_tier` = `tier1`
- ✅ User mua Chatbot PREMIUM → `chatbot_tier` = `premium`
- ✅ Các tier khác KHÔNG thay đổi (độc lập)
- ✅ Transaction được log vào `shopify_orders`
- ✅ User thấy tier mới sau khi refresh app

---

## 📞 Need Help?

### Quick Links:
1. **Check logs:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook/logs
2. **Check database:** https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/sql
3. **Shopify webhooks:** Shopify Admin → Settings → Notifications → Webhooks

### Documentation:
- 📖 **How to check database:** `HOW_TO_CHECK_DATABASE.md`
- 🔧 **Fix JWT auth issue:** `FIX_JWT_AUTH_ISSUE.md`
- 🔍 **Fix SKUs:** `FIX_SHOPIFY_SKUS.md`
- ⚠️ **Fix database column type error:** `FIX_CHATBOT_TIER_ERROR.md`
- 🚀 **Deploy via Dashboard:** `DEPLOY_VIA_DASHBOARD.md`
- ⭐ **NEW: Flexible purchase flow:** `NEW_FLEXIBLE_PURCHASE_FLOW.md`

---

**LET'S GO! 🚀**

**Bắt đầu từ BƯỚC 1: Sửa SKU ngay!**

# 🚀 Hướng Dẫn Deploy Shopify Webhook

## ✅ Webhook đã được cập nhật với Payment Status Check

File: `supabase/functions/shopify-webhook/index.ts`

**Thay đổi quan trọng:**
- ✅ Chỉ xử lý orders có `financial_status = 'paid'`
- ✅ Orders chưa thanh toán sẽ được lưu nhưng không upgrade tier
- ✅ Khi order được mark là paid, tier sẽ tự động upgrade

## 📋 Cách 1: Deploy qua PowerShell Script (Khuyến nghị)

### Bước 1: Lấy Access Token
1. Truy cập: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Đặt tên: `Shopify Webhook Deploy`
4. Copy token (chỉ hiện 1 lần!)

### Bước 2: Chạy Script
```powershell
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
.\deploy-webhook.ps1
```

### Bước 3: Nhập Token
- Script sẽ hỏi token
- Paste token và nhấn Enter
- Chờ deploy hoàn tất

## 📋 Cách 2: Deploy qua Supabase Dashboard

### Bước 1: Mở Dashboard
1. Truy cập: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk
2. Click "Edge Functions" trong menu bên trái
3. Tìm function `shopify-webhook`

### Bước 2: Deploy New Version
1. Click vào `shopify-webhook`
2. Click nút "Deploy new version"
3. Upload file: `supabase/functions/shopify-webhook/index.ts`
4. Click "Deploy"

### Bước 3: Verify
1. Chờ deployment hoàn tất (thường < 1 phút)
2. Check "Deployments" tab
3. Timestamp phải match hôm nay
4. Status phải là "Active"

## 📋 Cách 3: Deploy qua CLI (Nếu đã có token)

```bash
# Set token
set SUPABASE_ACCESS_TOKEN=your_token_here

# Deploy
npx supabase functions deploy shopify-webhook --project-ref pgfkbcnzqozzkohwbgbk
```

## ✅ Sau Khi Deploy

### 1. Test Webhook
Chạy test script:
```powershell
.\test-webhook.ps1
```

### 2. Verify trong Supabase Dashboard
- Vào: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions/shopify-webhook
- Check "Deployments" tab
- Xem "Logs" tab để monitor requests

### 3. Update Shopify (nếu cần)
Webhook URL (không đổi):
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

## 🔍 Kiểm Tra Payment Status Logic

Webhook hiện tại sẽ xử lý như sau:

### Order Status: PAID ✅
```
1. Nhận webhook từ Shopify
2. Verify HMAC signature
3. Check financial_status = 'paid' → ✅ OK
4. Determine tier (tier1/tier2/tier3)
5. Update user's scanner_tier/chatbot_tier
6. Send confirmation email (nếu có)
```

### Order Status: PENDING/UNPAID ⏳
```
1. Nhận webhook từ Shopify
2. Verify HMAC signature
3. Check financial_status = 'pending' → ⏳ SKIP
4. Log message: "Order not paid yet, skipping tier update"
5. Return 200 OK (để Shopify không retry)
6. Đợi webhook tiếp theo khi order được mark là paid
```

### Order Status: REFUNDED/CANCELLED ❌
```
1. Nhận webhook từ Shopify
2. Verify HMAC signature
3. Check financial_status = 'refunded' → ❌ SKIP
4. Không update tier
5. (Tùy chọn: Downgrade tier nếu muốn)
```

## 📝 Code Reference

**Payment Status Check:** `index.ts` lines 83-101
```typescript
if (financialStatus !== 'paid') {
  console.log(`⏳ Order ${orderIdShopify} not paid yet`);
  return new Response(/* 200 OK with note */);
}
console.log(`✅ Order is paid. Processing tier upgrade...`);
```

**Tier Mapping:** `index.ts` lines 285-318
```typescript
const bundleMapping = {
  'tier1': { scanner: 'pro', chatbot: 'pro', months: 12 },
  'tier2': { scanner: 'premium', chatbot: 'premium', months: 12 },
  'tier3': { scanner: 'vip', chatbot: 'premium', months: 24 }
};
```

## 🆘 Nếu Gặp Lỗi

### Error: "Access token not provided"
→ Chưa set SUPABASE_ACCESS_TOKEN
→ Dùng Cách 1 hoặc Cách 2 thay vì Cách 3

### Error: "HMAC verification failed"
→ Kiểm tra SHOPIFY_WEBHOOK_SECRET trong Supabase Secrets
→ Phải match với secret trong Shopify webhook settings

### Error: "User not found"
→ Order có email chưa đăng ký
→ Webhook sẽ tạo pending_tier_upgrade record
→ Khi user đăng ký, tier tự động upgrade

## 📊 Monitor Logs

Sau khi deploy, monitor logs:
```
Dashboard → Edge Functions → shopify-webhook → Logs
```

Tìm các messages:
- ✅ "Order is paid. Processing tier upgrade..."
- ⏳ "Order not paid yet (status: pending)"
- ❌ "HMAC verification failed"
- 👤 "User not found, creating pending upgrade"

## 🎯 Next Steps

1. **Deploy webhook** (chọn 1 trong 3 cách trên)
2. **Test với Shopify test order** (paid status)
3. **Verify tier được upgrade** trong database
4. **Monitor logs** trong vài ngày đầu
5. **Document any issues** để fix nhanh

---

**Webhook URL:**
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

**Project Ref:** `pgfkbcnzqozzkohwbgbk`

**Last Updated:** 2025-01-09

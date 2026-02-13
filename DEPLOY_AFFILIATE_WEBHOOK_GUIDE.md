# 🚀 HƯỚNG DẪN DEPLOY AFFILIATE WEBHOOK

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

- [x] SQL Migrations đã chạy
- [x] Edge Function code đã update
- [ ] Supabase CLI đã cài đặt
- [ ] Đã login Supabase CLI
- [ ] Có access Shopify Admin

---

## PHẦN 1: DEPLOY EDGE FUNCTION

### Bước 1.1: Cài đặt Supabase CLI (nếu chưa có)

**Windows (PowerShell Admin):**
```powershell
# Cách 1: Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Cách 2: NPM
npm install -g supabase
```

**Verify:**
```bash
supabase --version
```

### Bước 1.2: Login Supabase

```bash
supabase login
```
→ Browser sẽ mở, login với tài khoản Supabase của bạn

### Bước 1.3: Link Project

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Lấy Project ID từ Supabase Dashboard > Project Settings > General
supabase link --project-ref YOUR_PROJECT_ID
```

**Tìm Project ID:**
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Settings > General > Reference ID (ví dụ: `abcdefghijklmnop`)

### Bước 1.4: Set Environment Variables

```bash
# Set secrets cho Edge Function
supabase secrets set SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
```

**Lấy SHOPIFY_WEBHOOK_SECRET:**
1. Shopify Admin > Settings > Notifications > Webhooks
2. Copy "Signing secret" ở cuối trang

### Bước 1.5: Deploy Edge Function

```bash
supabase functions deploy shopify-webhook
```

**Output thành công:**
```
Deploying function shopify-webhook...
✓ Function shopify-webhook deployed
```

### Bước 1.6: Verify Deployment

```bash
# Check function status
supabase functions list
```

**Hoặc kiểm tra trong Dashboard:**
1. Supabase Dashboard > Edge Functions
2. Tìm `shopify-webhook`
3. Status: `Active`

---

## PHẦN 2: REGISTER SHOPIFY WEBHOOKS

### Cách 1: Qua Shopify Admin UI

1. **Vào Shopify Admin:**
   - https://yinyang-masters.myshopify.com/admin (hoặc URL shop của bạn)

2. **Navigate to Webhooks:**
   - Settings (⚙️ góc dưới trái)
   - Notifications
   - Scroll xuống "Webhooks"

3. **Create Webhook - orders/create:**
   - Click "Create webhook"
   - Event: `Order creation`
   - Format: `JSON`
   - URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/shopify-webhook`
   - API version: `2024-01` (hoặc mới nhất)
   - Click "Save"

4. **Create Webhook - orders/paid:**
   - Click "Create webhook"
   - Event: `Order payment`
   - Format: `JSON`
   - URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/shopify-webhook`
   - API version: `2024-01`
   - Click "Save"

5. **Create Webhook - orders/updated:**
   - Click "Create webhook"
   - Event: `Order updated`
   - Format: `JSON`
   - URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/shopify-webhook`
   - API version: `2024-01`
   - Click "Save"

### Cách 2: Qua Shopify API (curl)

**Lấy Shopify Admin API Token:**
1. Shopify Admin > Apps > Develop apps
2. Chọn app hoặc tạo mới
3. API credentials > Admin API access token

**Chạy commands:**

```powershell
# Set variables
$SHOPIFY_STORE = "yinyang-masters"
$SHOPIFY_TOKEN = "shpat_xxxxxxxxxxxxx"  # Your Admin API token
$WEBHOOK_URL = "https://YOUR_PROJECT_ID.supabase.co/functions/v1/shopify-webhook"

# 1. Create orders/create webhook
curl -X POST "https://$SHOPIFY_STORE.myshopify.com/admin/api/2024-01/webhooks.json" `
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"webhook\":{\"topic\":\"orders/create\",\"address\":\"'$WEBHOOK_URL'\",\"format\":\"json\"}}'

# 2. Create orders/paid webhook
curl -X POST "https://$SHOPIFY_STORE.myshopify.com/admin/api/2024-01/webhooks.json" `
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"webhook\":{\"topic\":\"orders/paid\",\"address\":\"'$WEBHOOK_URL'\",\"format\":\"json\"}}'

# 3. Create orders/updated webhook
curl -X POST "https://$SHOPIFY_STORE.myshopify.com/admin/api/2024-01/webhooks.json" `
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"webhook\":{\"topic\":\"orders/updated\",\"address\":\"'$WEBHOOK_URL'\",\"format\":\"json\"}}'
```

### Verify Webhooks Registered

```powershell
# List all webhooks
curl -X GET "https://$SHOPIFY_STORE.myshopify.com/admin/api/2024-01/webhooks.json" `
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN"
```

**Expected output:**
```json
{
  "webhooks": [
    {
      "id": 123456789,
      "topic": "orders/create",
      "address": "https://xxx.supabase.co/functions/v1/shopify-webhook"
    },
    {
      "id": 123456790,
      "topic": "orders/paid",
      "address": "https://xxx.supabase.co/functions/v1/shopify-webhook"
    },
    {
      "id": 123456791,
      "topic": "orders/updated",
      "address": "https://xxx.supabase.co/functions/v1/shopify-webhook"
    }
  ]
}
```

---

## PHẦN 3: TESTING

### Test 1: Webhook Logs

Sau khi register webhooks, check logs trong Supabase:

```sql
-- Check webhook logs
SELECT * FROM shopify_webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Test 2: Create Test Order

1. Vào Shopify Admin
2. Orders > Create order
3. Add test product
4. Mark as paid
5. Check Supabase logs

### Test 3: Verify Commission

```sql
-- Check commission records
SELECT * FROM commission_sales
ORDER BY created_at DESC
LIMIT 10;

-- Or fallback table
SELECT * FROM affiliate_commissions
ORDER BY created_at DESC
LIMIT 10;
```

### Test 4: Edge Function Logs

```bash
# View real-time logs
supabase functions logs shopify-webhook --tail
```

**Hoặc trong Dashboard:**
1. Supabase Dashboard > Edge Functions
2. Click `shopify-webhook`
3. Tab "Logs"

---

## PHẦN 4: TROUBLESHOOTING

### Error: "Unauthorized" (401)

**Nguyên nhân:** HMAC verification failed

**Fix:**
1. Check SHOPIFY_WEBHOOK_SECRET đã set đúng chưa
2. Trong Supabase Dashboard > Edge Functions > shopify-webhook > Secrets
3. Verify giá trị match với Shopify webhook signing secret

```bash
# Update secret
supabase secrets set SHOPIFY_WEBHOOK_SECRET=correct_secret_here
```

### Error: "No customer email"

**Nguyên nhân:** Order không có customer email

**Fix:** Đây là expected behavior cho guest checkouts. Orders sẽ được log nhưng không process tier upgrade.

### Error: Commission not calculated

**Check:**
1. Order có `partner_id` trong note_attributes không?
2. User có record trong `affiliate_referrals` với status='pending' không?
3. Affiliate có profile trong `affiliate_profiles` không?

```sql
-- Debug query
SELECT
  o.shopify_order_id,
  o.partner_id,
  ar.affiliate_id,
  ap.role,
  ap.ctv_tier
FROM shopify_orders o
LEFT JOIN affiliate_referrals ar ON ar.referred_user_id = o.user_id
LEFT JOIN affiliate_profiles ap ON ap.user_id = COALESCE(o.partner_id, ar.affiliate_id)
ORDER BY o.created_at DESC
LIMIT 5;
```

### Webhook không được gọi

**Check:**
1. Shopify Admin > Settings > Notifications > Webhooks
2. Xem "Recent webhook deliveries"
3. Check status codes và error messages

---

## 📊 FLOW SAU KHI DEPLOY

```
Customer đặt hàng trên Shopify
        ↓
Shopify gửi "orders/create" webhook
        ↓
Edge Function nhận → Save order (status: pending)
        ↓
Customer thanh toán
        ↓
Shopify gửi "orders/paid" webhook
        ↓
Edge Function nhận:
  1. Upgrade user tier ✅
  2. Calculate commission ✅
  3. Update affiliate stats ✅
  4. Record course enrollment (KPI) ✅
        ↓
Data available in:
  - shopify_orders (order info)
  - commission_sales (commission records)
  - affiliate_profiles (total_sales updated)
  - course_enrollments (KPI tracking)
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Supabase CLI installed & logged in
- [ ] Project linked (`supabase link`)
- [ ] SHOPIFY_WEBHOOK_SECRET set
- [ ] Edge function deployed (`supabase functions deploy`)
- [ ] orders/create webhook registered
- [ ] orders/paid webhook registered
- [ ] orders/updated webhook registered
- [ ] Test order created & verified
- [ ] Commission calculation verified
- [ ] Logs show no errors

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check Edge Function logs trong Supabase Dashboard
2. Check `shopify_webhook_logs` table
3. Verify webhook delivery trong Shopify Admin

**Useful commands:**
```bash
# View logs
supabase functions logs shopify-webhook --tail

# Redeploy
supabase functions deploy shopify-webhook

# Check secrets
supabase secrets list
```

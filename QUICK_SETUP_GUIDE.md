# 🚀 QUICK SETUP GUIDE - SHOPIFY INTEGRATION

## ⏱️ **10 MINUTES TO COMPLETE**

Follow these steps **EXACTLY** to deploy Shopify integration.

---

## 📋 **YOUR CREDENTIALS** (Already Have!)

```
✅ Shopify Domain: yinyang-masters.myshopify.com
✅ Admin API Token: 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
✅ Storefront Token: 5c70b78ecf59c54097b7cd21d162d463
✅ Webhook Secret: 5h4u9xE84SwcN6BpGCk6szOuKa8dKdbVVs66aXFKWHw=
✅ Supabase Project: pgfkbcnzqozzkohwbgbk
✅ Supabase URL: https://pgfkbcnzqozzkohwbgbk.supabase.co
```

---

## 🎯 **STEP 1: Set Secrets in Supabase** (3 minutes)

### **Option A: Via Dashboard (EASIEST)**

1. Open: **https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/settings/functions**

2. Click **"Edge Functions"** → **"Environment Variables"**

3. Add these 4 secrets:

   | Name | Value |
   |------|-------|
   | `SHOPIFY_DOMAIN` | `yinyang-masters.myshopify.com` |
   | `SHOPIFY_ADMIN_TOKEN` | `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` |
   | `SHOPIFY_STOREFRONT_TOKEN` | `5c70b78ecf59c54097b7cd21d162d463` |
   | `SHOPIFY_WEBHOOK_SECRET` | `5h4u9xE84SwcN6BpGCk6szOuKa8dKdbVVs66aXFKWHw=` |

4. Click **"Save"** for each

### **Option B: Via Supabase CLI**

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Login first
npx supabase login

# Set secrets
npx supabase secrets set SHOPIFY_DOMAIN=yinyang-masters.myshopify.com
npx supabase secrets set SHOPIFY_ADMIN_TOKEN=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
npx supabase secrets set SHOPIFY_STOREFRONT_TOKEN=5c70b78ecf59c54097b7cd21d162d463
npx supabase secrets set SHOPIFY_WEBHOOK_SECRET=5h4u9xE84SwcN6BpGCk6szOuKa8dKdbVVs66aXFKWHw=

# Verify
npx supabase secrets list
```

✅ **Done! Secrets are set.**

---

## 🗄️ **STEP 2: Run Database Migration** (2 minutes)

### **Option A: Via Dashboard (EASIEST)**

1. Open: **https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/editor**

2. Click **"SQL Editor"**

3. Click **"New query"**

4. Copy entire content from:
   ```
   supabase/migrations/20250114_shopify_integration.sql
   ```

5. Paste into SQL Editor

6. Click **"Run"** (or press Ctrl+Enter)

7. Should see: ✅ **"Success. No rows returned"**

### **Option B: Via CLI**

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

npx supabase db push
```

✅ **Done! Database tables created.**

**Verify in Dashboard:**
- Go to **Table Editor**
- Should see 4 new tables:
  - `shopify_products`
  - `shopify_collections`
  - `shopping_carts`
  - `shopify_orders`

---

## 🚀 **STEP 3: Deploy Edge Functions** (3 minutes)

### **Option A: Via Dashboard**

1. Open: **https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk/functions**

2. Click **"Deploy new function"**

3. **For shopify-products:**
   - Name: `shopify-products`
   - Import from: `Local folder`
   - Select: `supabase/functions/shopify-products`
   - Click **"Deploy"**

4. **Repeat for:**
   - `shopify-cart`
   - `shopify-webhook` (may already exist)

### **Option B: Via CLI (FASTER)**

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Deploy all functions
npx supabase functions deploy shopify-products --no-verify-jwt
npx supabase functions deploy shopify-cart --no-verify-jwt
npx supabase functions deploy shopify-webhook --no-verify-jwt

# List deployed functions
npx supabase functions list
```

✅ **Done! Edge Functions deployed.**

**Your Function URLs:**
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-products
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-cart
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

---

## 🔗 **STEP 4: Register Shopify Webhooks** (2 minutes)

### **Option A: Via Shopify Admin UI**

1. Open: **https://yinyang-masters.myshopify.com/admin/settings/notifications**

2. Scroll to **"Webhooks"** section

3. Click **"Create webhook"**

4. **Create 3 webhooks:**

   **Webhook 1: Product Creation**
   - Event: `Product creation`
   - Format: `JSON`
   - URL: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`
   - API version: `2024-01`

   **Webhook 2: Product Update**
   - Event: `Product update`
   - Format: `JSON`
   - URL: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`

   **Webhook 3: Product Deletion**
   - Event: `Product deletion`
   - Format: `JSON`
   - URL: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`

### **Option B: Via API (Copy-paste in terminal)**

```bash
# Set token
set SHOPIFY_TOKEN=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
set WEBHOOK_URL=https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook

# Create webhooks
curl -X POST "https://yinyang-masters.myshopify.com/admin/api/2024-01/webhooks.json" -H "X-Shopify-Access-Token: %SHOPIFY_TOKEN%" -H "Content-Type: application/json" -d "{\"webhook\":{\"topic\":\"products/create\",\"address\":\"%WEBHOOK_URL%\",\"format\":\"json\"}}"

curl -X POST "https://yinyang-masters.myshopify.com/admin/api/2024-01/webhooks.json" -H "X-Shopify-Access-Token: %SHOPIFY_TOKEN%" -H "Content-Type: application/json" -d "{\"webhook\":{\"topic\":\"products/update\",\"address\":\"%WEBHOOK_URL%\",\"format\":\"json\"}}"

curl -X POST "https://yinyang-masters.myshopify.com/admin/api/2024-01/webhooks.json" -H "X-Shopify-Access-Token: %SHOPIFY_TOKEN%" -H "Content-Type: application/json" -d "{\"webhook\":{\"topic\":\"products/delete\",\"address\":\"%WEBHOOK_URL%\",\"format\":\"json\"}}"
```

✅ **Done! Webhooks registered.**

---

## 🧪 **STEP 5: Test Integration** (1 minute)

### **Test Edge Function:**

Open your browser developer console and run:

```javascript
fetch('https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc'
  },
  body: JSON.stringify({
    action: 'getProducts',
    limit: 5,
    syncToDb: true
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected output:**
```json
{
  "success": true,
  "products": [...],
  "count": 5
}
```

### **Test Shop Page:**

1. Open: **http://localhost:5176/shop**

2. Open DevTools Console (F12)

3. Should see:
   ```
   📦 Fetching products from Edge Function...
   ✅ Fetched X products
   ```

4. ✅ **NO CORS ERRORS!**

5. Products should display!

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Supabase secrets set (4 secrets)
- [ ] Database tables created (4 tables)
- [ ] Edge Functions deployed (3 functions)
- [ ] Webhooks registered (3 webhooks)
- [ ] Products fetch successfully
- [ ] No CORS errors
- [ ] Shop page loads products

---

## 🎉 **SUCCESS!**

If all steps complete, your Shopify integration is **LIVE**!

**Test URLs:**
- Shop: `http://localhost:5176/shop`
- Cart: `http://localhost:5176/cart`

**Admin URLs:**
- Supabase: `https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk`
- Shopify: `https://yinyang-masters.myshopify.com/admin`

---

## 🔧 **TROUBLESHOOTING**

### **No products showing?**

1. Check if products exist in Shopify
2. Make sure products are published to "Online Store"
3. Run sync manually:
   ```javascript
   fetch('https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-products', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({action: 'getProducts', limit: 100, syncToDb: true})
   })
   ```

### **CORS error?**

- Shouldn't happen! Edge Functions handle CORS.
- Make sure frontend is using `shopify.js` service (not calling Shopify directly)

### **Edge Function errors?**

1. Check secrets are set correctly
2. Check function logs: **Supabase Dashboard → Functions → Logs**
3. Redeploy: `npx supabase functions deploy shopify-products`

---

**Last Updated:** 2025-01-14
**Setup Time:** ~10 minutes
**Status:** ✅ Ready for production

# =Í SHOPIFY + SUPABASE INTEGRATION - DEPLOYMENT GUIDE

## =Ë OVERVIEW

This guide will help you deploy the Shopify integration using Supabase Edge Functions.

**Architecture:**
```
Frontend (React) ’ Supabase Edge Functions ’ Shopify API (No CORS!)
```

**Benefits:**
-  No CORS issues
-  Secure API keys (hidden in backend)
-  Fast & scalable
-  Real-time webhooks
-  Native Shopify checkout

---

## =' PREREQUISITES

### **1. Shopify Setup**

You need:
-  Shopify store domain: `yinyangmasters.myshopify.com`
-  Shopify Admin API access token
-  Shopify Storefront API access token: `5c70b78ecf59c54097b7cd21d162d463`

### **2. Supabase Setup**

You need:
-  Supabase project created
-  Supabase CLI installed: `npm install -g supabase`
-  Logged in: `supabase login`
-  Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

### **3. Get Your Shopify Admin API Token**

**Steps:**
1. Go to Shopify Admin: `https://yinyangmasters.myshopify.com/admin`
2. Settings ’ Apps and sales channels ’ Develop apps
3. Create app: "GEM Platform Backend"
4. Configuration ’ Admin API integration
5. Select scopes:
   -  `read_products`
   -  `read_orders`
   -  `read_inventory`
   -  `read_product_listings`
6. Install app
7. Copy **Admin API access token** (starts with `shpat_`)

### **4. Generate Webhook Secret**

```bash
# Generate a random webhook secret
openssl rand -hex 32
```

Save this for later!

---

## =€ STEP-BY-STEP DEPLOYMENT

### **STEP 1: Run Database Migration** ñ 2 minutes

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Apply migration
supabase db push
```

**Expected output:**
```
 shopify_products table created
 shopify_collections table created
 shopping_carts table created
 shopify_orders table created
 Indexes created
 RLS policies created
```

**Verify in Supabase Dashboard:**
- Go to: Table Editor
- Should see 4 new tables: `shopify_products`, `shopify_collections`, `shopping_carts`, `shopify_orders`

---

### **STEP 2: Set Environment Variables** ñ 3 minutes

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Set secrets in Supabase
supabase secrets set SHOPIFY_DOMAIN=yinyangmasters.myshopify.com
supabase secrets set SHOPIFY_ADMIN_TOKEN=shpat_YOUR_ADMIN_TOKEN_HERE
supabase secrets set SHOPIFY_STOREFRONT_TOKEN=5c70b78ecf59c54097b7cd21d162d463
supabase secrets set SHOPIFY_WEBHOOK_SECRET=your_generated_secret_here
```

**Verify secrets:**
```bash
supabase secrets list
```

Should see:
```
 SHOPIFY_DOMAIN
 SHOPIFY_ADMIN_TOKEN
 SHOPIFY_STOREFRONT_TOKEN
 SHOPIFY_WEBHOOK_SECRET
 SUPABASE_URL (auto)
 SUPABASE_SERVICE_ROLE_KEY (auto)
```

---

### **STEP 3: Deploy Edge Functions** ñ 5 minutes

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"

# Deploy all functions
supabase functions deploy shopify-products
supabase functions deploy shopify-cart
supabase functions deploy shopify-webhook
```

**Expected output:**
```
 shopify-products deployed successfully
 shopify-cart deployed successfully
 shopify-webhook deployed successfully
```

**Get your function URLs:**
```bash
supabase functions list
```

Copy these URLs (you'll need them):
- `https://YOUR_PROJECT.supabase.co/functions/v1/shopify-products`
- `https://YOUR_PROJECT.supabase.co/functions/v1/shopify-cart`
- `https://YOUR_PROJECT.supabase.co/functions/v1/shopify-webhook`

---

### **STEP 4: Test Edge Functions** ñ 3 minutes

**Test shopify-products:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/shopify-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"action":"getProducts","limit":5}'
```

**Expected response:**
```json
{
  "success": true,
  "products": [...],
  "count": 5
}
```

**Test shopify-cart:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/shopify-cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"action":"createCart","lineItems":[]}'
```

---

### **STEP 5: Register Shopify Webhooks** ñ 5 minutes

**Option A: Using Shopify Admin UI**

1. Go to: `https://yinyangmasters.myshopify.com/admin/settings/notifications`
2. Scroll to "Webhooks"
3. Click "Create webhook"
4. Set:
   - **Event:** `Product creation`
   - **Format:** `JSON`
   - **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/shopify-webhook`
   - **API version:** `2024-01`
5. Repeat for:
   - Product update
   - Product delete
   - Order creation
   - Order updated

**Option B: Using Shopify API (Faster)**

```bash
# Set your admin token
SHOPIFY_TOKEN="shpat_YOUR_ADMIN_TOKEN_HERE"
WEBHOOK_URL="https://YOUR_PROJECT.supabase.co/functions/v1/shopify-webhook"

# Products webhooks
curl -X POST "https://yinyangmasters.myshopify.com/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "products/create",
      "address": "'$WEBHOOK_URL'",
      "format": "json"
    }
  }'

curl -X POST "https://yinyangmasters.myshopify.com/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "products/update",
      "address": "'$WEBHOOK_URL'",
      "format": "json"
    }
  }'

curl -X POST "https://yinyangmasters.myshopify.com/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "products/delete",
      "address": "'$WEBHOOK_URL'",
      "format": "json"
    }
  }'
```

**Verify webhooks registered:**
```bash
curl -X GET "https://yinyangmasters.myshopify.com/admin/api/2024-01/webhooks.json" \
  -H "X-Shopify-Access-Token: $SHOPIFY_TOKEN"
```

---

### **STEP 6: Sync Initial Products** ñ 2 minutes

**Trigger initial product sync:**

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/shopify-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "action": "getProducts",
    "limit": 100,
    "syncToDb": true
  }'
```

**Verify in Supabase:**
1. Go to Table Editor ’ `shopify_products`
2. Should see your products synced!

---

### **STEP 7: Test Frontend** ñ 3 minutes

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\frontend"

# Start dev server (if not running)
npm run dev
```

**Open browser:**
1. Navigate to: `http://localhost:5176/shop`
2. Products should load! 
3. No CORS errors! 
4. Try adding to cart
5. Try checkout (should redirect to Shopify)

**Check browser console:**
```
=æ Fetching products from Edge Function...
 Fetched 10 products
```

---

##  VERIFICATION CHECKLIST

### **Database**
- [ ] `shopify_products` table exists
- [ ] `shopify_collections` table exists
- [ ] `shopping_carts` table exists
- [ ] `shopify_orders` table exists
- [ ] Products are synced in database

### **Edge Functions**
- [ ] `shopify-products` deployed
- [ ] `shopify-cart` deployed
- [ ] `shopify-webhook` deployed
- [ ] All functions return 200 OK

### **Webhooks**
- [ ] `products/create` webhook registered
- [ ] `products/update` webhook registered
- [ ] `products/delete` webhook registered
- [ ] Webhook secret matches

### **Frontend**
- [ ] Shop page loads products
- [ ] No CORS errors in console
- [ ] Add to cart works
- [ ] Checkout redirects to Shopify
- [ ] Products display correctly

---

## = TROUBLESHOOTING

### **Problem: "Failed to fetch products"**

**Check:**
1. Edge Function deployed: `supabase functions list`
2. Secrets set: `supabase secrets list`
3. Shopify token valid
4. Check function logs: `supabase functions logs shopify-products`

**Fix:**
```bash
# Redeploy function
supabase functions deploy shopify-products --no-verify-jwt
```

### **Problem: "CORS error"**

**This should NOT happen!** If you see CORS, it means:
- Frontend is calling Shopify directly (bad)
- Should call Edge Function instead (good)

**Fix:** Make sure `shopify.js` is using `callEdgeFunction()` method.

### **Problem: "No products showing"**

**Check:**
1. Products exist in Shopify
2. Products are published to "Online Store" channel
3. Run sync again with `syncToDb: true`
4. Check Supabase table: Table Editor ’ `shopify_products`

### **Problem: "Webhook not receiving data"**

**Check:**
1. Webhook URL correct
2. Webhook secret matches
3. Test webhook: Create/update a product in Shopify
4. Check logs: `supabase functions logs shopify-webhook`

**Test webhook manually:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/shopify-webhook \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: test" \
  -d '{"id": 123, "title": "Test Product"}'
```

### **Problem: "Checkout URL not generated"**

**Check:**
1. Cart API function deployed
2. Variant IDs are valid Shopify GIDs (format: `gid://shopify/ProductVariant/123`)
3. Check logs: `supabase functions logs shopify-cart`

---

## =Ê MONITORING

### **View Function Logs**

```bash
# Real-time logs
supabase functions logs shopify-products --follow
supabase functions logs shopify-cart --follow
supabase functions logs shopify-webhook --follow
```

### **Check Database**

```sql
-- See recent products
SELECT title, price, synced_at
FROM shopify_products
ORDER BY synced_at DESC
LIMIT 10;

-- See active carts
SELECT id, total, created_at
FROM shopping_carts
WHERE expires_at > NOW()
ORDER BY created_at DESC;

-- See webhook logs
SELECT topic, processed, created_at
FROM shopify_webhook_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

## <¯ NEXT STEPS

After successful deployment:

1. **Add Products to Shopify**
   - Add real products with images, pricing
   - Tag products appropriately
   - Set up collections

2. **Test Full Flow**
   - Browse shop
   - Add to cart
   - Complete checkout
   - Verify order in Shopify Admin

3. **Customize Shop UI**
   - Update product card styling
   - Add filters/search
   - Improve mobile layout

4. **Marketing Integration**
   - Add Shopify Pixels
   - Connect Google Analytics
   - Set up email marketing

---

## =Þ SUPPORT

If you encounter issues:

1. **Check logs:** `supabase functions logs`
2. **Check database:** Table Editor in Supabase Dashboard
3. **Test APIs:** Use curl commands above
4. **Verify secrets:** `supabase secrets list`

---

## ( SUCCESS!

If all checks pass, your Shopify integration is **LIVE**! <‰

**You now have:**
-  No CORS issues
-  Secure backend
-  Real-time webhooks
-  Native Shopify checkout
-  Production-ready shop

**Test your shop:**
`http://localhost:5176/shop` (dev)
`https://your-domain.com/shop` (production)

---

**Last Updated:** 2025-01-14
**Version:** 1.0
**Author:** Claude Code + Jennie Chu

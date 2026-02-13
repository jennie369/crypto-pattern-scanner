# 🚀 Deploy Edge Function Qua Supabase Dashboard (Không Cần CLI)

## ⚡ Cách Nhanh Nhất - Không Cần Cài Gì Cả!

---

## Bước 1: Vào Supabase Dashboard

1. Vào: https://supabase.com/dashboard/project/pgfkbcnzqozzkohwbgbk
2. Click **Edge Functions** ở sidebar trái
3. Click **Create a new function**

---

## Bước 2: Tạo Function

### Điền Form:

**Function name:**
```
shopify-webhook
```

**Region:** Chọn `Southeast Asia (Singapore)` (gần VN nhất)

Click **Create function**

---

## Bước 3: Copy Code

1. Function editor sẽ mở ra
2. **XÓA HẾT** code mẫu có sẵn
3. Copy toàn bộ code dưới đây và paste vào:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ========================================
    // 1. VERIFY SHOPIFY HMAC SIGNATURE
    // ========================================
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256')
    const shopifySecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET')

    if (!hmacHeader || !shopifySecret) {
      console.error('❌ Missing HMAC header or secret')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Read request body
    const bodyText = await req.text()

    // Verify HMAC
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(shopifySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(bodyText)
    )

    const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)))

    if (computedHmac !== hmacHeader) {
      console.error('❌ HMAC verification failed')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ HMAC verified successfully')

    // ========================================
    // 2. PARSE ORDER DATA
    // ========================================
    const orderData = JSON.parse(bodyText)

    const customerEmail = orderData.customer?.email
    const orderIdShopify = orderData.id
    const lineItems = orderData.line_items || []

    if (!customerEmail) {
      console.error('❌ No customer email in order')
      return new Response(
        JSON.stringify({ error: 'No customer email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📧 Order from: ${customerEmail}, Order ID: ${orderIdShopify}`)

    // ========================================
    // 3. EXTRACT PRODUCT TYPE & TIER FROM SKU
    // ========================================
    let productType = null // course, scanner, chatbot
    let tierPurchased = null
    let amountPaid = 0

    for (const item of lineItems) {
      const sku = item.sku?.toLowerCase() || ''
      const price = parseFloat(item.price) || 0

      // Course products
      if (sku.includes('gem-course-tier1') || sku.includes('course-tier1')) {
        productType = 'course'
        tierPurchased = 'tier1'
        amountPaid = price
        break
      } else if (sku.includes('gem-course-tier2') || sku.includes('course-tier2')) {
        productType = 'course'
        tierPurchased = 'tier2'
        amountPaid = price
        break
      } else if (sku.includes('gem-course-tier3') || sku.includes('course-tier3')) {
        productType = 'course'
        tierPurchased = 'tier3'
        amountPaid = price
        break
      }

      // Scanner products
      else if (sku.includes('gem-scanner-pro') || sku.includes('scanner-pro')) {
        productType = 'scanner'
        tierPurchased = 'pro'
        amountPaid = price
        break
      } else if (sku.includes('gem-scanner-premium') || sku.includes('scanner-premium')) {
        productType = 'scanner'
        tierPurchased = 'premium'
        amountPaid = price
        break
      } else if (sku.includes('gem-scanner-vip') || sku.includes('scanner-vip')) {
        productType = 'scanner'
        tierPurchased = 'vip'
        amountPaid = price
        break
      }

      // Chatbot products
      else if (sku.includes('gem-chatbot-pro') || sku.includes('chatbot-pro')) {
        productType = 'chatbot'
        tierPurchased = 'pro'
        amountPaid = price
        break
      } else if (sku.includes('gem-chatbot-premium') || sku.includes('chatbot-premium')) {
        productType = 'chatbot'
        tierPurchased = 'premium'
        amountPaid = price
        break
      }
    }

    if (!productType || !tierPurchased) {
      console.error('❌ No valid product SKU found in line items')
      return new Response(
        JSON.stringify({ error: 'Invalid product SKU' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`💎 Product: ${productType}, Tier: ${tierPurchased}, Amount: ${amountPaid}`)

    // ========================================
    // 4. CONNECT TO SUPABASE & UPDATE USER TIER
    // ========================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, course_tier, scanner_tier, chatbot_tier')
      .eq('email', customerEmail)
      .single()

    if (userError || !userData) {
      console.error('❌ User not found:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.id
    const oldCourseTier = userData.course_tier
    const oldScannerTier = userData.scanner_tier
    const oldChatbotTier = userData.chatbot_tier

    console.log(`👤 Found user ${userId}`)
    console.log(`   Course: ${oldCourseTier}, Scanner: ${oldScannerTier}, Chatbot: ${oldChatbotTier}`)

    // Prepare update object based on product type
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (productType === 'course') {
      updateData.course_tier = tierPurchased
    } else if (productType === 'scanner') {
      updateData.scanner_tier = tierPurchased
      // Also update old 'tier' column for backward compatibility
      updateData.tier = tierPurchased === 'pro' ? 'tier1' : tierPurchased === 'premium' ? 'tier2' : 'tier3'
    } else if (productType === 'chatbot') {
      updateData.chatbot_tier = tierPurchased
    }

    // Update user tier
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Failed to update tier:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update tier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ User ${productType}_tier updated: ${tierPurchased}`)

    // ========================================
    // 5. LOG TRANSACTION TO shopify_orders TABLE
    // ========================================
    const { error: logError } = await supabase
      .from('shopify_orders')
      .insert({
        user_id: userId,
        order_id: orderIdShopify,
        product_type: productType,
        tier_purchased: tierPurchased,
        amount: amountPaid,
        processed_at: new Date().toISOString()
      })

    if (logError) {
      console.error('⚠️ Failed to log transaction:', logError)
      // Don't fail the whole request if logging fails
    } else {
      console.log('✅ Transaction logged successfully')
    }

    // ========================================
    // 6. RETURN SUCCESS RESPONSE
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tier upgraded successfully',
        user_id: userId,
        product_type: productType,
        old_tier: productType === 'course' ? oldCourseTier : productType === 'scanner' ? oldScannerTier : oldChatbotTier,
        new_tier: tierPurchased
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

4. Click **Save** (góc trên phải)

---

## Bước 4: Set Environment Variables

1. Vẫn trong function editor, click tab **Secrets** (bên cạnh tab Code)
2. Add 3 secrets:

### Secret 1:
- **Name:** `SHOPIFY_WEBHOOK_SECRET`
- **Value:** `c5b5e7caaf2ccf17beb14cfa1ef93502d81095c4f204a8fe5ba98ead75c51ddd`
- Click **Add secret**

### Secret 2:
- **Name:** `SUPABASE_URL`
- **Value:** `https://pgfkbcnzqozzkohwbgbk.supabase.co`
- Click **Add secret**

### Secret 3:
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NzUzNiwiZXhwIjoyMDc3NzUzNTM2fQ.pI9VjPhcl0sds1mcPsa5nnRv6ODDHbI29Q1ViMLoEQg`
- Click **Add secret**

---

## Bước 5: Deploy Function

1. Quay lại tab **Code**
2. Click **Deploy function** (góc trên phải)
3. Đợi 1-2 phút...
4. Khi thấy "✅ Deployed successfully!" → XONG!

---

## Bước 6: Get Webhook URL

1. Sau khi deploy xong, copy **Function URL**
2. URL sẽ là: `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`

---

## Bước 7: Test

Mở browser, vào:
```
https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook
```

**Phải thấy:**
```json
{"error":"Unauthorized"}
```

✅ **Đúng rồi!** Webhook đang chạy và chờ HMAC từ Shopify.

---

## ✅ Xong Rồi!

Webhook đã deploy thành công! Giờ bạn cần:

1. ✅ Database migration - DONE
2. ✅ Edge Function deployed - DONE
3. ⚠️ Sửa 3 SKUs trong Shopify (xem `FIX_SHOPIFY_SKUS.md`)
4. 🧪 Test bằng mua hàng thử!

---

## 🔍 Check Logs

Để xem logs của webhook:
1. Vào Supabase Dashboard → Edge Functions
2. Click vào function `shopify-webhook`
3. Click tab **Logs**

Sau khi có order, bạn sẽ thấy:
```
✅ HMAC verified successfully
📧 Order from: customer@email.com
💰 Financial status: paid
💎 Product: scanner, Tier: pro
✅ User scanner_tier updated: pro
```

---

## 💰 Payment Status Logic

**QUAN TRỌNG:** Webhook CHỈ nâng cấp tier khi order đã được thanh toán!

### Flow Xử Lý:

#### 1. Order Chưa Thanh Toán (Pending Payment)
```
Customer tạo order → Chọn "Bank Transfer"
  ↓
Webhook trigger
  ↓
Check financial_status = "pending"
  ↓
⏳ Skip tier update (return success nhưng không đổi tier)
  ↓
Logs: "Order not paid yet, skipping tier update"
```

#### 2. Order Đã Thanh Toán
```
Admin mark order as "Paid" trong Shopify
  ↓
Webhook trigger (nếu có config "Order updated")
  ↓
Check financial_status = "paid"
  ↓
✅ Update tier trong database
  ↓
Logs: "Order is paid. Processing tier upgrade..."
```

### Config Webhook "Order Updated" (Optional)

Để tự động handle late payments, thêm webhook thứ 2:

1. Vào Shopify Admin → Settings → Notifications
2. Scroll xuống **Webhooks** → Create webhook
3. **Event:** `Order updated`
4. **URL:** `https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/shopify-webhook`
5. **Format:** JSON
6. **API Version:** 2025-01

**Lợi ích:** Khi bạn mark order as paid sau này, webhook tự động trigger và nâng cấp tier.

**Không bắt buộc:** Nếu không config, bạn có thể manually mark order + trigger webhook trong Shopify admin.

---

**DONE! 🎉**

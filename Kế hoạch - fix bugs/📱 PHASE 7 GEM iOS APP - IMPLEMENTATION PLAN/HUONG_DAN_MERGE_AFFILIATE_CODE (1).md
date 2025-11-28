# 🔀 HƯỚNG DẪN MERGE: Code Hiện Tại + File Mới

**Mục đích:** Kết hợp code tier upgrade (hiện tại) với affiliate commission system (mới)

---

## 📊 TÌNH HÌNH HIỆN TẠI

### **Code đã có (Claude Code):**
✅ Shopify webhook working  
✅ Tier upgrade logic  
✅ HMAC verification  
✅ User lookup by email  
✅ pending_tier_upgrades table  
✅ shopify_orders table  

### **File mới (Của tôi):**
✅ Affiliate commission calculation  
✅ Product type detection (digital vs physical)  
✅ Commission rates theo tier  
✅ KPI bonus system  
✅ Course enrollment tracking  

---

## 🎯 CHIẾN LƯỢC MERGE

### **OPTION 1: MERGE VÀO CODE HIỆN TẠI** ⭐ KHUYÊN DÙNG

**Ưu điểm:**
- Giữ nguyên tier upgrade logic đã work
- Bổ sung thêm affiliate features
- Ít risk hơn

**Cách làm:**

#### **Bước 1: Update Database Schema**

Chạy **2 SQL migrations** theo thứ tự:

```bash
# 1. Fix commission calculation
Run: FIX_AFFILIATE_COMMISSION_MIGRATION.sql

# 2. Add KPI system
Run: KPI_BONUS_SYSTEM_MIGRATION.sql
```

Migrations này KHÔNG conflict với schema hiện tại vì:
- Không touch bảng `shopify_orders` đã có
- Không touch bảng `pending_tier_upgrades`
- CHỈ ADD thêm tables mới + functions mới

---

#### **Bước 2: Update Edge Function**

**File:** `supabase/functions/shopify-webhook/index.ts`

**Thay đổi:**

```typescript
// ========== ADD: Đọc topic từ header ==========
serve(async (req) => {
  try {
    // EXISTING: HMAC verification
    const hmac = req.headers.get('X-Shopify-Hmac-Sha256')
    const rawBody = await req.text()
    
    if (!verifyWebhook(rawBody, hmac!)) {
      return new Response('Unauthorized', { status: 401 })
    }

    // ⭐ NEW: Đọc topic
    const topic = req.headers.get('X-Shopify-Topic')
    const orderData = JSON.parse(rawBody)
    
    console.log(`📨 Webhook received: ${topic}`, {
      order_id: orderData.id,
      financial_status: orderData.financial_status,
    })

    // Log webhook
    await supabase.from('shopify_webhook_logs').insert({
      topic: topic,
      shopify_id: orderData.id?.toString(),
      payload: orderData,
      processed: false,
    })

    // ⭐ NEW: Route theo topic
    if (topic === 'orders/create') {
      return await handleOrderCreated(supabase, orderData)
    } else if (topic === 'orders/paid') {
      return await handleOrderPaid(supabase, orderData)
    } else if (topic === 'orders/updated') {
      return await handleOrderUpdated(supabase, orderData)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

---

#### **Bước 3: Add Handler Functions**

**3.1. handleOrderCreated (orders/create event)**

```typescript
// ⭐ NEW FUNCTION
async function handleOrderCreated(
  supabase: any,
  orderData: any
) {
  console.log('📦 Handling order created:', orderData.id)
  
  // Determine product type
  const productType = determineProductType(orderData.line_items)
  
  // Get partner ID từ note_attributes (nếu có)
  const partnerId = orderData.note_attributes?.find(
    (attr: any) => attr.name === 'partner_id'
  )?.value || null
  
  // Save order (KHÔNG tính commission vì chưa paid)
  await supabase.from('shopify_orders').insert({
    shopify_order_id: orderData.id.toString(),
    order_number: orderData.order_number,
    email: orderData.email,
    total_price: orderData.total_price,
    currency: orderData.currency,
    financial_status: orderData.financial_status,
    fulfillment_status: orderData.fulfillment_status,
    line_items: orderData.line_items,
    product_type: productType,
    partner_id: partnerId,
    created_at: orderData.created_at,
    paid_at: null,  // Chưa thanh toán
  })
  
  console.log('✅ Order created saved (waiting for payment)')
  
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Order created, waiting for payment',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
```

---

**3.2. handleOrderPaid (orders/paid event)**

```typescript
// ⭐ NEW FUNCTION - Kết hợp tier upgrade + commission
async function handleOrderPaid(
  supabase: any,
  orderData: any
) {
  console.log('💰 Handling order PAID:', orderData.id)
  
  try {
    // 1. EXISTING LOGIC: Tier Upgrade
    await processExistingTierUpgradeLogic(supabase, orderData)
    
    // 2. NEW LOGIC: Affiliate Commission
    await processAffiliateCommission(supabase, orderData)
    
    // 3. Update order status
    await supabase
      .from('shopify_orders')
      .update({
        financial_status: 'paid',
        paid_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .eq('shopify_order_id', orderData.id.toString())
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order paid processed successfully',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error processing paid order:', error)
    throw error
  }
}

// Helper: Existing tier upgrade logic
async function processExistingTierUpgradeLogic(
  supabase: any,
  orderData: any
) {
  console.log('🔄 Processing tier upgrade (existing logic)...')
  
  // === PASTE TOÀN BỘ CODE TIER UPGRADE HIỆN TẠI VÀO ĐÂY ===
  // Code từ line 82-300 trong file hiện tại
  // Bao gồm:
  // - Extract SKU
  // - Find user by email
  // - Update user tier
  // - Handle pending_tier_upgrades
  // - etc.
  
  // ĐÃY LÀ CODE CỦA CLAUDE CODE - GIỮ NGUYÊN!
}

// Helper: NEW affiliate commission logic
async function processAffiliateCommission(
  supabase: any,
  orderData: any
) {
  console.log('💵 Processing affiliate commission (new logic)...')
  
  // Get order record
  const { data: order } = await supabase
    .from('shopify_orders')
    .select('*')
    .eq('shopify_order_id', orderData.id.toString())
    .single()
  
  if (!order || !order.partner_id) {
    console.log('⏭️  No affiliate partner for this order')
    return
  }
  
  // Call SQL function to process commission
  const { data: result, error } = await supabase
    .rpc('process_order_commission', {
      shopify_order_id_param: orderData.id,
      partner_id_param: order.partner_id,
      order_total_param: parseFloat(orderData.total_price),
      line_items_param: orderData.line_items,
    })
  
  if (error) {
    console.error('❌ Commission processing error:', error)
    throw error
  }
  
  console.log('✅ Commission processed:', {
    commission_id: result.commission_id,
    amount: result.commission_amount,
  })
  
  // Record course enrollment (if applicable)
  const lineItem = orderData.line_items[0]
  await supabase.rpc('record_course_enrollment', {
    partner_id_param: order.partner_id,
    user_id_param: order.user_id,
    order_id_param: order.id,
    product_name_param: lineItem.name,
    sku_param: lineItem.sku,
    price_param: parseFloat(lineItem.price),
  })
  
  console.log('✅ Affiliate commission completed')
}
```

---

**3.3. handleOrderUpdated (orders/updated event)**

```typescript
// ⭐ NEW FUNCTION
async function handleOrderUpdated(
  supabase: any,
  orderData: any
) {
  console.log('🔄 Handling order updated:', orderData.id)
  
  // Check if order chuyển sang paid
  if (orderData.financial_status === 'paid') {
    // Check xem đã process chưa
    const { data: existing } = await supabase
      .from('shopify_orders')
      .select('processed_at')
      .eq('shopify_order_id', orderData.id.toString())
      .single()
    
    if (!existing?.processed_at) {
      // Chưa process → Process như orders/paid
      return await handleOrderPaid(supabase, orderData)
    }
  }
  
  // Order updated nhưng không phải paid → chỉ log
  console.log('ℹ️  Order updated but not paid')
  return new Response(
    JSON.stringify({ success: true, message: 'Order update logged' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
```

---

**3.4. determineProductType Helper**

```typescript
// ⭐ NEW HELPER - Từ file của tôi
function determineProductType(lineItems: any[]): string {
  for (const item of lineItems) {
    const productType = item.product_type?.toLowerCase() || ''
    const tags = item.tags?.toLowerCase() || ''
    const sku = item.sku?.toLowerCase() || ''
    
    // Digital products
    if (
      productType.includes('course') ||
      productType.includes('tier') ||
      productType.includes('subscription') ||
      tags.includes('digital') ||
      sku.includes('tier') ||
      sku.includes('course')
    ) {
      return 'digital'
    }
    
    // Physical products
    if (
      productType.includes('crystal') ||
      productType.includes('jewelry') ||
      tags.includes('physical')
    ) {
      return 'physical'
    }
  }
  
  return 'physical' // Default
}
```

---

#### **Bước 4: Update shopify_orders Table**

**Add columns cho affiliate tracking:**

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE shopify_orders
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS product_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_shopify_orders_partner 
ON shopify_orders(partner_id);

CREATE INDEX IF NOT EXISTS idx_shopify_orders_product_type 
ON shopify_orders(product_type);
```

---

#### **Bước 5: Register Webhook Topics**

Trong Shopify Admin, register **3 webhooks**:

1. **orders/create**
   - URL: `https://your-project.supabase.co/functions/v1/shopify-webhook`
   - Format: JSON

2. **orders/paid**
   - URL: `https://your-project.supabase.co/functions/v1/shopify-webhook`
   - Format: JSON

3. **orders/updated**
   - URL: `https://your-project.supabase.co/functions/v1/shopify-webhook`
   - Format: JSON

---

#### **Bước 6: Update Mobile App**

**File:** `src/services/orderTrackingService.js`

Tạo file mới với code từ `BỔ_SUNG_SHOPIFY_WEBHOOK_TRACKING.md`

**File:** `src/services/commissionService.js`

Add functions từ `FIX_AFFILIATE_COMMISSION_MIGRATION.sql`

**File:** `src/screens/Affiliate/AffiliateScreen.js`

Add UI components từ `YEU_CAU_1_UPDATED_COMPLETE.md`

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Database (30 phút)**
- [ ] Run `FIX_AFFILIATE_COMMISSION_MIGRATION.sql`
- [ ] Run `KPI_BONUS_SYSTEM_MIGRATION.sql`
- [ ] Run `ALTER TABLE shopify_orders ADD COLUMN...`
- [ ] Verify functions created:
  ```sql
  SELECT proname FROM pg_proc 
  WHERE proname LIKE '%commission%' OR proname LIKE '%kpi%';
  ```

### **Phase 2: Edge Function (1-2 giờ)**
- [ ] Backup current `shopify-webhook/index.ts`
- [ ] Add topic routing logic
- [ ] Add `handleOrderCreated()`
- [ ] Add `handleOrderPaid()` với cả tier + commission
- [ ] Add `handleOrderUpdated()`
- [ ] Add `determineProductType()` helper
- [ ] Deploy: `supabase functions deploy shopify-webhook`
- [ ] Test với Shopify sandbox

### **Phase 3: Shopify Webhooks (15 phút)**
- [ ] Register `orders/create` webhook
- [ ] Register `orders/paid` webhook
- [ ] Register `orders/updated` webhook
- [ ] Verify webhook delivery trong Shopify Admin

### **Phase 4: Mobile App (1-2 giờ)**
- [ ] Create `orderTrackingService.js`
- [ ] Update `commissionService.js`
- [ ] Update `AffiliateScreen.js` UI
- [ ] Test in app

### **Phase 5: Testing (1 giờ)**
- [ ] Create test order trong Shopify
- [ ] Mark as paid
- [ ] Verify webhook logs
- [ ] Verify commission calculated
- [ ] Verify tier upgraded
- [ ] Verify UI displays correct data

---

## 🎯 KẾT QUẢ SAU KHI MERGE

### **Functionality:**
✅ Tier upgrade vẫn work (existing)  
✅ Commission calculation work (new)  
✅ KPI bonus tracking work (new)  
✅ Product type detection work (new)  
✅ Order state tracking work (improved)  

### **Database:**
✅ `shopify_orders` có thêm product_type, partner_id  
✅ `commission_sales` track commissions  
✅ `course_enrollments` track KPI  
✅ `monthly_kpi_performance` track bonuses  

### **Mobile App:**
✅ Affiliate screen hiển thị commission breakdown  
✅ KPI progress bars  
✅ Recent orders với product type badges  

---

## 📊 SO SÁNH TRƯỚC/SAU

### **TRƯỚC (Code hiện tại):**
```
Shopify Order Paid
  ↓
Webhook → Edge Function
  ↓
if (paid) → Upgrade Tier ✅
  ↓
Done
```

### **SAU (Sau merge):**
```
Shopify Order Created
  ↓
Webhook "orders/create" → Edge Function
  ↓
Save order (status: pending) ✅
  ↓
User thanh toán
  ↓
Webhook "orders/paid" → Edge Function
  ↓
1. Upgrade Tier ✅ (existing logic)
2. Calculate Commission ✅ (new)
3. Track Course Enrollment ✅ (new)
4. Update Partner Stats ✅ (new)
  ↓
Done
```

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **Backup trước khi merge:**
   ```bash
   cp shopify-webhook/index.ts shopify-webhook/index.ts.backup
   ```

2. **Test kỹ trước khi deploy:**
   - Test local với `supabase functions serve`
   - Test với Shopify sandbox orders
   - Verify commission amounts

3. **Không xóa code cũ:**
   - Keep existing tier upgrade logic
   - Chỉ ADD thêm affiliate logic
   - Minimize risk

4. **Monitor sau deploy:**
   ```sql
   -- Check webhook logs
   SELECT * FROM shopify_webhook_logs 
   WHERE processed = false 
   ORDER BY created_at DESC;
   
   -- Check commissions
   SELECT * FROM commission_sales 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

## ✅ SUCCESS CRITERIA

Merge thành công khi:
- [ ] Tier upgrade vẫn work như cũ
- [ ] Commission được tính đúng cho orders mới
- [ ] KPI tracking hoạt động
- [ ] Mobile app hiển thị data mới
- [ ] Không có errors trong webhook logs
- [ ] Performance không bị ảnh hưởng

---

**KHUYẾN NGHỊ:** Làm từng bước, test kỹ từng bước, deploy từng bước!

**Thời gian ước tính:** 4-6 giờ tổng cộng

**Risk level:** 🟡 Medium (vì đã có code working, chỉ ADD thêm)

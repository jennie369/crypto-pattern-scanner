# 📋 YÊU CẦU 1 - UPDATED: FIX AFFILIATE COMMISSION + SHOPIFY TRACKING + KPI BONUS

**Version:** 2.0 - Complete System  
**Date:** November 25, 2025  
**Status:** ⚠️ CRITICAL - Requires immediate implementation

---

## 🔍 PHÂN TÍCH VẤN ĐỀ

### **3 Vấn Đề Chính:**

#### **1. Commission Calculation SAI (CRITICAL)** ❌

**File hiện tại:** `20241117000003_affiliate_functions.sql`

**Vấn đề:**
```sql
-- Function cũ CHỈ nhận commission_rate đã tính sẵn
CREATE OR REPLACE FUNCTION calculate_commission(
  order_total NUMERIC,
  commission_rate NUMERIC  -- ← Hardcoded rate
)
```

**Thiếu:**
- ❌ Không phân biệt product type (digital vs physical)
- ❌ Không tự động lấy rate theo partner tier
- ❌ Không match BẢNG TÍNH COMMISSION CHUẨN

**Impact:** Commission bị tính sai → Partner mất tiền hoặc công ty mất tiền!

---

#### **2. Shopify Order Tracking THIẾU (CRITICAL)** ❌

**Vấn đề:**
- ❌ Không có webhook từ Shopify
- ❌ Không track order state (created vs paid)
- ❌ Commission tính khi order created (chưa thanh toán)
- ❌ Không có edge function để xử lý webhook

**Flow hiện tại (SAI):**
```
User mua → Order created → Tính commission ngay ❌
                              ↑
                     CHƯA THANH TOÁN!
```

**Flow đúng (CẦN):**
```
User mua → Order created → Chờ
         ↓
     Thanh toán
         ↓
    Order paid → Webhook → Edge Function → Tính commission ✅
```

---

#### **3. KPI Bonus System THIẾU (HIGH PRIORITY)** ❌

**Theo BẢNG TÍNH COMMISSION CHUẨN:**

Partner có thêm bonus KPI mỗi tháng (CHỈ với digital products):

**Tier 1:**
- +250K nếu đạt 25 học viên (Tình Yêu/Tư Duy)
- +500K nếu đạt 10 học viên (7 Ngày)
- +5M nếu đạt 5 học viên (Trading)

**Tier 2:**
- +400K nếu đạt 35 học viên (Tình Yêu/Tư Duy)
- +1M nếu đạt 15 học viên (7 Ngày)
- +7M nếu đạt 6 học viên (Trading)

**Tier 3:**
- +700K nếu đạt 50 học viên (Tình Yêu/Tư Duy)
- +2M nếu đạt 20 học viên (7 Ngày)
- +10M nếu đạt 9 học viên (Trading)

**Tier 4:**
- +1.5M nếu đạt 70 học viên (Tình Yêu/Tư Duy)
- +3M nếu đạt 30 học viên (7 Ngày)
- +20M nếu đạt 25 học viên (Trading)

**Hiện tại:** KHÔNG có system track số học viên theo từng khóa học!

---

## 🛠️ GIẢI PHÁP TOÀN DIỆN

### **Architecture Overview:**

```
┌─────────────────────────────────────────────────────────────┐
│                    GEM AFFILIATE SYSTEM                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   SHOPIFY    │
│   (Orders)   │
└──────┬───────┘
       │ Webhook: order/paid
       ↓
┌────────────────────────────────────────┐
│  SUPABASE EDGE FUNCTION                │
│  - Verify HMAC signature               │
│  - Parse order data                    │
│  - Determine product type              │
│  - Get partner tier                    │
│  - Calculate commission                │
│  - Record course enrollment (if course)│
│  - Update partner stats                │
└────────────────┬───────────────────────┘
                 ↓
┌────────────────────────────────────────────────────────┐
│  SUPABASE DATABASE                                     │
│                                                        │
│  Tables:                                               │
│  ├─ shopify_orders (track orders + payment status)   │
│  ├─ commission_sales (commission records)             │
│  ├─ course_enrollments (KPI tracking)                 │
│  └─ monthly_kpi_performance (KPI bonuses)             │
│                                                        │
│  Functions:                                            │
│  ├─ get_commission_rate(type, tier) → %               │
│  ├─ calculate_commission_v2(amount, type, tier)       │
│  ├─ determine_product_type(line_items) → type         │
│  ├─ process_order_commission(order) → commission      │
│  ├─ record_course_enrollment(order) → enrollment      │
│  └─ calculate_monthly_kpi_bonus(partner, month)       │
└────────────────┬───────────────────────────────────────┘
                 ↓
┌────────────────────────────────────────┐
│  MOBILE APP                            │
│  - AffiliateScreen shows:              │
│    • Commission breakdown (digital/physical) │
│    • Recent orders with product type   │
│    • KPI progress bars                 │
│    • Monthly bonus tracker             │
└────────────────────────────────────────┘
```

---

## 📦 FILES CẦN IMPLEMENT

### **File 1: FIX_AFFILIATE_COMMISSION_MIGRATION.sql** ⚠️ CRITICAL

**Purpose:** Fix commission calculation với product type + tier logic

**Nội dung:**
- ✅ Function `get_commission_rate(product_type, partner_tier)`
- ✅ Function `calculate_commission_v2(amount, type, tier)`
- ✅ Function `determine_product_type(line_items)`
- ✅ Function `process_order_commission(shopify_order_id, partner_id, ...)`
- ✅ Function `check_tier_progression(partner_id)`
- ✅ Function `get_partner_commission_summary(partner_id)`

**Commission Rates (đúng theo BẢNG TÍNH):**

| Product Type | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------------|--------|--------|--------|--------|
| Digital      | 10%    | 15%    | 20%    | 30%    |
| Physical     | 3%     | 10%    | 12%    | 15%    |

**Tier Thresholds:**
- Tier 1: < 100M VND
- Tier 2: ≥ 100M VND
- Tier 3: ≥ 300M VND
- Tier 4: ≥ 600M VND

---

### **File 2: BỔ_SUNG_SHOPIFY_WEBHOOK_TRACKING.md** ⚠️ CRITICAL

**Purpose:** Shopify webhook system để track orders + tính commission

**Components:**

#### **2.1. Database Schema:**

```sql
-- shopify_orders table
CREATE TABLE shopify_orders (
  id UUID PRIMARY KEY,
  shopify_order_id BIGINT UNIQUE,
  user_id UUID,
  partner_id UUID,  -- Affiliate partner
  
  order_number VARCHAR(50),
  email VARCHAR(255),
  total_price NUMERIC,
  
  financial_status VARCHAR(50),  -- 'pending', 'paid', 'refunded'
  fulfillment_status VARCHAR(50),
  
  product_type VARCHAR(20),  -- 'digital' or 'physical'
  product_category VARCHAR(100),
  
  created_at TIMESTAMP,
  paid_at TIMESTAMP,  -- ⭐ Commission CHỈ tính khi có paid_at
  updated_at TIMESTAMP
);

-- webhook_logs table (debug)
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY,
  webhook_topic VARCHAR(100),
  shopify_order_id BIGINT,
  payload JSONB,
  processed BOOLEAN,
  error TEXT,
  created_at TIMESTAMP
);
```

#### **2.2. Supabase Edge Function:**

**File:** `supabase/functions/shopify-webhook/index.ts`

**Flow:**
1. Receive webhook từ Shopify
2. Verify HMAC signature (security)
3. Parse order data
4. Log to webhook_logs
5. **If topic = "orders/paid":**
   - Update order status
   - Determine product type
   - Get partner tier
   - Calculate commission
   - Insert commission_sales
   - Record course enrollment (if course)
   - Update partner stats
   - Send notification

**Key Functions:**
```typescript
verifyWebhook(body, hmac) → boolean
handleOrderCreated(order) → save order (no commission yet)
handleOrderPaid(order) → ⭐ CALCULATE COMMISSION
determineProductType(lineItems) → 'digital' | 'physical'
calculateAndRecordCommission(order, partner) → commission
```

#### **2.3. Mobile App Integration:**

**File:** `src/services/orderTrackingService.js`

**Functions:**
- `getUserOrders(userId)` - Get orders from Supabase
- `getOrderDetail(orderId)` - Order detail
- `trackAffiliateClick(partnerCode)` - Track when user clicks affiliate link
- `getCurrentPartner()` - Get partner from localStorage
- `getShopifyCheckoutURL(product, partnerId)` - Attach partner_id to checkout

---

### **File 3: KPI_BONUS_SYSTEM_MIGRATION.sql** ⭐ HIGH PRIORITY

**Purpose:** Track student enrollments và tính KPI bonus hàng tháng

**Components:**

#### **3.1. Database Schema:**

```sql
-- course_enrollments table
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY,
  partner_id UUID,
  user_id UUID,
  order_id UUID,
  
  course_type VARCHAR(50),  -- 'tinh_yeu_tu_duy', 'bay_ngay', 'trading'
  course_name TEXT,
  course_price NUMERIC,
  
  enrolled_at TIMESTAMP,
  enrollment_month DATE,  -- First day of month
  status VARCHAR(20)  -- 'active', 'cancelled', 'refunded'
);

-- monthly_kpi_performance table
CREATE TABLE monthly_kpi_performance (
  id UUID PRIMARY KEY,
  partner_id UUID,
  
  year INTEGER,
  month INTEGER,
  period_start DATE,
  period_end DATE,
  
  -- Enrollment counts
  tinh_yeu_tu_duy_count INTEGER,
  bay_ngay_count INTEGER,
  trading_count INTEGER,
  
  -- Bonus amounts
  tinh_yeu_tu_duy_bonus NUMERIC,
  bay_ngay_bonus NUMERIC,
  trading_bonus NUMERIC,
  total_bonus NUMERIC,
  
  partner_tier INTEGER,
  calculated_at TIMESTAMP,
  paid BOOLEAN,
  paid_at TIMESTAMP
);
```

#### **3.2. Functions:**

```sql
-- Identify course type từ product name/SKU
identify_course_type(product_name, sku, price) → course_type

-- Record enrollment khi course được mua
record_course_enrollment(partner_id, user_id, order_id, product, sku, price)

-- Calculate KPI bonus cho partner trong tháng
calculate_monthly_kpi_bonus(partner_id, year, month) → bonuses

-- Save monthly performance
save_monthly_kpi_performance(partner_id, year, month) → id

-- Batch calculate tất cả partners (run cuối tháng)
calculate_all_partners_kpi(year, month) → results

-- Get KPI dashboard
get_partner_kpi_dashboard(partner_id, year, month) → dashboard_data
```

#### **3.3. KPI Logic:**

**Course Classification:**
- **Tình Yêu/Tư Duy:** Price 300K-600K, hoặc có keyword "tình yêu", "tư duy"
- **7 Ngày:** Price 1.5M-2.5M, hoặc có keyword "7 ngày", "khai mở"
- **Trading:** Price ≥10M, hoặc có keyword "trading", "tier", "scanner"

**Bonus Calculation:**
```javascript
IF partner_tier = 1:
  IF tinh_yeu_count >= 25: bonus += 250000
  IF bay_ngay_count >= 10: bonus += 500000
  IF trading_count >= 5: bonus += 5000000

ELSE IF partner_tier = 2:
  IF tinh_yeu_count >= 35: bonus += 400000
  IF bay_ngay_count >= 15: bonus += 1000000
  IF trading_count >= 6: bonus += 7000000

ELSE IF partner_tier = 3:
  IF tinh_yeu_count >= 50: bonus += 700000
  IF bay_ngay_count >= 20: bonus += 2000000
  IF trading_count >= 9: bonus += 10000000

ELSE IF partner_tier = 4:
  IF tinh_yeu_count >= 70: bonus += 1500000
  IF bay_ngay_count >= 30: bonus += 3000000
  IF trading_count >= 25: bonus += 20000000
```

---

## 📱 MOBILE APP UPDATES

### **Update 1: commissionService.js**

**Add functions:**

```javascript
// Product type detection
export const getProductType = (lineItems) => {
  const item = lineItems[0];
  const productType = item.product_type?.toLowerCase() || '';
  const tags = item.tags?.join(',').toLowerCase() || '';
  const sku = item.sku?.toLowerCase() || '';
  
  if (
    productType.includes('course') ||
    productType.includes('tier') ||
    tags.includes('digital')
  ) {
    return 'digital';
  }
  
  return 'physical';
};

// Calculate with product type
export const calculateCommissionWithType = (order, partnerTier) => {
  const productType = getProductType(order.line_items);
  const saleAmount = parseFloat(order.total_price);
  const rate = getCommissionRate(productType, partnerTier);
  const commissionAmount = saleAmount * rate;
  
  return { productType, saleAmount, rate, commissionAmount };
};
```

---

### **Update 2: AffiliateScreen.js**

**Add sections:**

```javascript
// 1. Commission Breakdown by Product Type
<View style={styles.commissionBreakdownCard}>
  <Text style={styles.sectionTitle}>Phân Loại Hoa Hồng</Text>
  
  <View style={styles.breakdownRow}>
    <View style={styles.productTypeColumn}>
      <Text style={styles.productTypeLabel}>Digital Products</Text>
      <Text style={styles.productTypeAmount}>
        {digitalCommission.toLocaleString('vi-VN')}₫
      </Text>
      <Text style={styles.productTypeCount}>
        {digitalOrderCount} đơn • {partnerTierRates.digital}%
      </Text>
    </View>
    
    <View style={styles.productTypeColumn}>
      <Text style={styles.productTypeLabel}>Physical Products</Text>
      <Text style={styles.productTypeAmount}>
        {physicalCommission.toLocaleString('vi-VN')}₫
      </Text>
      <Text style={styles.productTypeCount}>
        {physicalOrderCount} đơn • {partnerTierRates.physical}%
      </Text>
    </View>
  </View>
</View>

// 2. KPI Progress Section
<View style={styles.kpiProgressCard}>
  <Text style={styles.sectionTitle}>KPI Bonus Tháng Này</Text>
  
  {/* Tình Yêu/Tư Duy Progress */}
  <View style={styles.kpiItem}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>Tình Yêu / Tư Duy</Text>
      <Text style={styles.kpiCount}>
        {kpiData.tinh_yeu_count}/{kpiData.tinh_yeu_target}
      </Text>
    </View>
    <ProgressBar 
      progress={kpiData.tinh_yeu_count / kpiData.tinh_yeu_target}
      color={kpiData.tinh_yeu_achieved ? '#4CAF50' : '#FFA726'}
    />
    <Text style={styles.kpiBonus}>
      Bonus: {kpiData.tinh_yeu_bonus.toLocaleString('vi-VN')}₫
    </Text>
  </View>
  
  {/* 7 Ngày Progress */}
  <View style={styles.kpiItem}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>7 Ngày Khai Mở</Text>
      <Text style={styles.kpiCount}>
        {kpiData.bay_ngay_count}/{kpiData.bay_ngay_target}
      </Text>
    </View>
    <ProgressBar 
      progress={kpiData.bay_ngay_count / kpiData.bay_ngay_target}
      color={kpiData.bay_ngay_achieved ? '#4CAF50' : '#FFA726'}
    />
    <Text style={styles.kpiBonus}>
      Bonus: {kpiData.bay_ngay_bonus.toLocaleString('vi-VN')}₫
    </Text>
  </View>
  
  {/* Trading Progress */}
  <View style={styles.kpiItem}>
    <View style={styles.kpiHeader}>
      <Text style={styles.kpiLabel}>Frequency Trading</Text>
      <Text style={styles.kpiCount}>
        {kpiData.trading_count}/{kpiData.trading_target}
      </Text>
    </View>
    <ProgressBar 
      progress={kpiData.trading_count / kpiData.trading_target}
      color={kpiData.trading_achieved ? '#4CAF50' : '#FFA726'}
    />
    <Text style={styles.kpiBonus}>
      Bonus: {kpiData.trading_bonus.toLocaleString('vi-VN')}₫
    </Text>
  </View>
  
  {/* Total Monthly Bonus */}
  <View style={styles.totalBonusRow}>
    <Text style={styles.totalBonusLabel}>Tổng Bonus Tháng Này:</Text>
    <Text style={styles.totalBonusAmount}>
      {kpiData.total_bonus.toLocaleString('vi-VN')}₫
    </Text>
  </View>
</View>

// 3. Recent Orders with Product Type
<View style={styles.recentOrdersCard}>
  <Text style={styles.sectionTitle}>Đơn Hàng Gần Đây</Text>
  
  {recentOrders.map((order) => (
    <View key={order.id} style={styles.orderItem}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>#{order.order_number}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.paid_at).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>
          {order.total_price.toLocaleString('vi-VN')}₫
        </Text>
        <View style={[
          styles.productTypeBadge,
          { 
            backgroundColor: order.product_type === 'digital' 
              ? '#4CAF50' 
              : '#FF9800' 
          }
        ]}>
          <Text style={styles.productTypeText}>
            {order.product_type === 'digital' ? 'Digital' : 'Physical'}
          </Text>
        </View>
      </View>
    </View>
  ))}
</View>
```

**Load data:**

```javascript
const loadAffiliateData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Get commission summary
    const { data: summary } = await supabase
      .rpc('get_partner_commission_summary', { partner_id_param: stats?.id });
    
    setDigitalCommission(summary.digital_commission);
    setPhysicalCommission(summary.physical_commission);
    
    // 2. Get KPI dashboard
    const { data: kpi } = await supabase
      .rpc('get_partner_kpi_dashboard', { 
        partner_id_param: stats?.id,
        year_param: new Date().getFullYear(),
        month_param: new Date().getMonth() + 1
      });
    
    setKpiData(kpi);
    
    // 3. Get recent orders
    const { data: orders } = await supabase
      .from('shopify_orders')
      .select('*')
      .eq('partner_id', stats?.id)
      .eq('financial_status', 'paid')  // CHỈ lấy orders đã thanh toán
      .order('paid_at', { ascending: false })
      .limit(10);
    
    setRecentOrders(orders);
    
  } catch (error) {
    console.error('Error loading affiliate data:', error);
  }
};
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Database (Day 1-2)**

- [ ] Run `FIX_AFFILIATE_COMMISSION_MIGRATION.sql` in Supabase
- [ ] Run `KPI_BONUS_SYSTEM_MIGRATION.sql` in Supabase
- [ ] Verify all functions created (12 new functions total)
- [ ] Test commission calculation:
  ```sql
  SELECT * FROM get_commission_rate('digital', 1);  -- Should return 10
  SELECT * FROM get_commission_rate('physical', 4);  -- Should return 15
  ```
- [ ] Test product type detection:
  ```sql
  SELECT determine_product_type('[{"product_type":"Course","sku":"TIER1"}]'::jsonb);
  ```
- [ ] Test KPI calculation:
  ```sql
  SELECT * FROM calculate_monthly_kpi_bonus(partner_id, 2025, 11);
  ```

### **Phase 2: Shopify Webhook (Day 2-3)**

- [ ] Create `supabase/functions/shopify-webhook/index.ts`
- [ ] Deploy Edge Function:
  ```bash
  supabase functions deploy shopify-webhook
  ```
- [ ] Configure environment variables:
  ```
  SHOPIFY_WEBHOOK_SECRET=xxx
  SUPABASE_URL=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx
  ```
- [ ] Register webhook in Shopify:
  - Topic: `orders/paid`
  - URL: `https://your-project.supabase.co/functions/v1/shopify-webhook`
  - Format: JSON
- [ ] Test với Shopify test order
- [ ] Verify commission được tính đúng

### **Phase 3: Mobile App (Day 3-4)**

- [ ] Create `src/services/orderTrackingService.js`
- [ ] Update `src/services/commissionService.js` với product type logic
- [ ] Update `AffiliateScreen.js`:
  - [ ] Commission breakdown section
  - [ ] KPI progress section
  - [ ] Recent orders with product type badges
- [ ] Create `src/components/KPIProgressBar.js`
- [ ] Create `src/components/ProductTypeBadge.js`
- [ ] Test UI với real data

### **Phase 4: Testing & Validation (Day 4-5)**

- [ ] End-to-end test:
  1. User clicks affiliate link
  2. Makes purchase on Shopify
  3. Pays order
  4. Webhook triggers
  5. Commission calculated correctly
  6. Partner sees update in app
- [ ] Test scenarios:
  - [ ] Digital product (Tier 1 course): 10% commission
  - [ ] Physical product (Crystal): 3% commission
  - [ ] Tier progression (100M → Tier 2)
  - [ ] KPI bonus (5 trading students → +5M bonus)
- [ ] Verify commission amounts match BẢNG TÍNH
- [ ] Check webhook logs for errors

### **Phase 5: Monitoring & Cron Jobs (Day 5)**

- [ ] Setup monthly KPI calculation cron job:
  ```sql
  -- Run vào 00:01 ngày 1 hàng tháng
  SELECT * FROM calculate_all_partners_kpi(
    EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER,
    EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')::INTEGER
  );
  ```
- [ ] Setup monitoring queries:
  ```sql
  -- Check unprocessed webhooks
  SELECT * FROM webhook_logs 
  WHERE processed = false 
  ORDER BY created_at DESC;
  
  -- Check unpaid orders
  SELECT * FROM shopify_orders 
  WHERE financial_status != 'paid';
  
  -- Check commission totals
  SELECT product_type, SUM(commission_amount) 
  FROM commission_sales 
  GROUP BY product_type;
  ```
- [ ] Create admin dashboard queries

---

## 🎯 SUCCESS CRITERIA

### **Commission System:**
✅ Digital products: 10-30% theo tier  
✅ Physical products: 3-15% theo tier  
✅ Commission CHỈ tính khi order = PAID  
✅ Product type detection 100% accurate  
✅ Tier progression tự động khi đạt threshold

### **Order Tracking:**
✅ Tất cả orders sync từ Shopify  
✅ Order states chính xác (created/paid/refunded)  
✅ Partner ID được track đúng  
✅ Webhook signature verified  
✅ Error logging đầy đủ

### **KPI Bonus:**
✅ Course enrollments được track  
✅ Enrollment counts đúng theo course type  
✅ Bonus calculation match BẢNG TÍNH CHUẨN  
✅ Monthly calculation tự động  
✅ Partner dashboard hiển thị progress

### **Mobile App:**
✅ Commission breakdown by product type  
✅ KPI progress bars với targets  
✅ Recent orders với product type badges  
✅ Real-time updates  
✅ UI polish và UX smooth

---

## 📊 EXPECTED RESULTS

### **For Partners:**
- Thấy rõ commission từ digital vs physical
- Track KPI progress real-time
- Biết cần bao nhiêu học viên nữa để đạt bonus
- Xem history đầy đủ với product type

### **For Company:**
- Commission tính đúng 100%
- Không mất tiền do tính sai
- Track được conversion rate theo product type
- KPI system motivate partners bán nhiều hơn
- Audit trail đầy đủ cho kế toán

### **Technical:**
- Webhook processing < 5 seconds
- Commission calculation accurate to 0.01₫
- No duplicate commission records
- Database queries optimized (< 100ms)
- Error rate < 0.1%

---

## 🚨 CRITICAL NOTES

1. **PHẢI chạy migrations theo thứ tự:**
   - First: FIX_AFFILIATE_COMMISSION_MIGRATION.sql
   - Second: KPI_BONUS_SYSTEM_MIGRATION.sql
   - Third: Deploy Edge Function
   - Fourth: Register Shopify webhook

2. **Shopify webhook PHẢI có HMAC verification:**
   - Nếu không verify → security risk
   - Attacker có thể fake webhooks

3. **Commission CHỈ tính khi order.financial_status = 'paid':**
   - Nếu tính khi 'pending' → mất tiền khi refund
   - Edge function PHẢI check status

4. **KPI calculation PHẢI run vào cuối tháng:**
   - Setup cron job hoặc manual trigger
   - Không tính realtime (tốn performance)

5. **Product type detection PHẢI accurate:**
   - Sai type → sai commission rate
   - Test kỹ với tất cả products

---

## 📄 DELIVERABLES

1. ✅ `FIX_AFFILIATE_COMMISSION_MIGRATION.sql` (6 functions)
2. ✅ `KPI_BONUS_SYSTEM_MIGRATION.sql` (6 functions + 2 tables)
3. ✅ `BỔ_SUNG_SHOPIFY_WEBHOOK_TRACKING.md` (Edge Function code)
4. ⏳ `shopify-webhook/index.ts` (Supabase Edge Function)
5. ⏳ `orderTrackingService.js` (Mobile service)
6. ⏳ Updated `AffiliateScreen.js` (UI components)
7. ⏳ Testing checklist + validation queries
8. ⏳ Cron job setup guide

---

## 🔗 RELATED FILES

- **Reference:** `BẢNG_TÍNH_COMMISSION_CHUẨN.md` (Source of truth)
- **Existing:** `20241117000003_affiliate_functions.sql` (Keep for backward compatibility)
- **Project Docs:** `PLAN_FIX_GEM_MOBILE_COMPLETE.md` (Main plan)
- **Implementation:** `IMPLEMENTATION_GUIDE_CLAUDE_CODE.md` (Step-by-step)

---

**STATUS:** ⚠️ Ready for implementation  
**PRIORITY:** 🔴 CRITICAL  
**EFFORT:** 4-6 hours (1 developer)  
**DEPENDENCIES:** Shopify Admin access, Supabase project  
**RISK LEVEL:** Medium (requires careful testing)

---

*Last updated: November 25, 2025*
*Version: 2.0 - Complete System*

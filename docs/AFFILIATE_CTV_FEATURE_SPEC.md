# AFFILIATE & CTV SYSTEM v3.0 - COMPLETE FEATURE SPEC
## Cross Shopify Shop Affiliate + KOL Partnership Program

**Version:** 3.0
**Last Updated:** 2026-01-08
**Status:** FULLY IMPLEMENTED & VERIFIED

---

## TABLE OF CONTENTS
1. [System Overview](#1-system-overview)
2. [Commission Rates v3.0](#2-commission-rates-v30)
3. [Database Schema](#3-database-schema)
4. [Mobile App Services](#4-mobile-app-services)
5. [UI Screens & Components](#5-ui-screens--components)
6. [Shopify Webhook Integration](#6-shopify-webhook-integration)
7. [Cron Jobs & Automation](#7-cron-jobs--automation)
8. [Notifications System](#8-notifications-system)
9. [Design Specifications](#9-design-specifications)
10. [User Flows](#10-user-flows)
11. [Files Summary](#11-files-summary)
12. [Security & Validation](#12-security--validation)
13. [Implementation Status](#13-implementation-status)

---

## 1. SYSTEM OVERVIEW

### 1.1 Business Model
Hệ thống Partnership gồm 2 chương trình:
- **CTV (Cộng Tác Viên)**: 5 cấp - Ai cũng có thể tham gia, tự động duyệt sau 3 ngày
- **KOL Affiliate**: Dành cho Influencer 20K+ followers, cần admin review

### 1.2 Programs Comparison

| Feature | CTV 5 Tiers | KOL Affiliate |
|---------|-------------|---------------|
| **Yêu cầu** | Không cần | 20,000+ followers |
| **Duyệt đơn** | Tự động sau 3 ngày | Admin xem xét |
| **Commission Digital** | 10% → 30% | 20% |
| **Commission Physical** | 6% → 15% | 20% |
| **Sub-Affiliate** | 2% → 4% | 3.5% |
| **Tier upgrades** | Hàng tuần (Thứ 2) | Không có |
| **Tier downgrades** | Cuối tháng (<10% threshold) | Không có |

### 1.3 Key Changes in v3.0
- ❌ **Removed**: Affiliate 3% program (migrated to CTV Bronze)
- ✅ **Added**: 5 CTV tiers với Vietnamese names
- ✅ **Added**: KOL program (20K+ followers required)
- ✅ **Added**: Sub-affiliate commission system
- ✅ **Added**: Separate rates for digital/physical products
- ✅ **Changed**: CTV no longer requires course purchase
- ✅ **Added**: Auto-approve CTV after 3 days
- ✅ **Added**: Weekly tier upgrades, monthly downgrades

---

## 2. COMMISSION RATES v3.0

### 2.1 CTV 5-Tier System

| Tier | Name (VN) | Icon | Threshold (VND) | Digital | Physical | Sub-Aff | Payment |
|------|-----------|------|-----------------|---------|----------|---------|---------|
| Bronze | Đồng | 🥉 | 0 | 10% | 6% | 2% | Monthly |
| Silver | Bạc | 🥈 | 50,000,000 | 15% | 8% | 2.5% | Monthly |
| Gold | Vàng | 🥇 | 150,000,000 | 20% | 10% | 3% | Biweekly |
| Platinum | Bạch Kim | 💎 | 400,000,000 | 25% | 12% | 3.5% | Weekly |
| Diamond | Kim Cương | 👑 | 800,000,000 | 30% | 15% | 4% | Weekly |

### 2.2 KOL Affiliate

| Feature | Value |
|---------|-------|
| **Requirements** | 20,000+ followers (BẮT BUỘC) |
| **Digital Commission** | 20% |
| **Physical Commission** | 20% |
| **Sub-Affiliate** | 3.5% |
| **Payment Schedule** | Biweekly (1st & 15th) |
| **Platforms** | YouTube, Facebook, Instagram, TikTok, Twitter, Discord, Telegram |

### 2.3 Sub-Affiliate System
Khi partner A giới thiệu partner B, A nhận sub-affiliate commission từ mỗi sale của B:

```
Customer buys → Partner B gets 10% → Partner A gets 2% (sub-affiliate)
```

### 2.4 Product Type Classification

**Digital Products:**
- course, subscription, ebook, digital_product, membership
- SKU contains: tier, course, scanner, chatbot

**Physical Products:**
- crystal, jewelry, physical_product, merchandise
- Default for unlabeled products

---

## 3. DATABASE SCHEMA

### 3.1 Table: `partnership_applications`
**Purpose:** Lưu đơn đăng ký CTV/KOL

```sql
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Application Type
  application_type VARCHAR(20) NOT NULL, -- 'ctv' or 'kol'

  -- CTV-specific fields
  reason_for_joining TEXT,
  referred_by_code VARCHAR(50), -- Referral code of existing partner

  -- KOL-specific fields
  social_platforms JSONB, -- { youtube: 50000, facebook: 30000, ... }
  total_followers INTEGER,
  social_links JSONB, -- { youtube: "url", facebook: "url", ... }
  content_niche TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected

  -- Auto-approve (CTV only)
  auto_approve_at TIMESTAMPTZ, -- Set to created_at + 3 days

  -- Review Info (KOL only)
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Table: `affiliate_profiles`
**Purpose:** Profile của partner đã được duyệt

```sql
CREATE TABLE affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  referral_code VARCHAR(50) UNIQUE NOT NULL, -- GEM + 8 random chars
  role VARCHAR(20) DEFAULT 'ctv', -- 'ctv' or 'kol'

  -- CTV Tier
  ctv_tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond

  -- Stats
  total_sales DECIMAL(15,2) DEFAULT 0,
  monthly_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  pending_commission DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,

  -- Sub-Affiliate
  referred_by UUID REFERENCES auth.users(id), -- User who referred this partner
  sub_affiliate_earnings DECIMAL(15,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Table: `affiliate_codes`
**Purpose:** Mã affiliate cho từng sản phẩm

```sql
CREATE TABLE affiliate_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Code Info
  code VARCHAR(100) UNIQUE NOT NULL, -- username_SHORTCODE
  short_code VARCHAR(20) NOT NULL, -- Product initials + random

  -- Product Info (for product-specific links)
  product_id VARCHAR(255), -- Shopify product ID (null for general link)
  product_type VARCHAR(50), -- crystal, course, subscription, bundle
  product_name VARCHAR(255),
  product_price DECIMAL(15,2),
  product_handle VARCHAR(255),
  image_url TEXT,

  -- Stats
  clicks INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  sales_amount DECIMAL(15,2) DEFAULT 0,
  commission_earned DECIMAL(15,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);
```

### 3.4 Table: `affiliate_referrals`
**Purpose:** Tracking clicks và conversions

```sql
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES auth.users(id),
  affiliate_code VARCHAR(50) NOT NULL,

  -- Referral Info
  referred_user_id UUID REFERENCES auth.users(id),
  referred_email VARCHAR(255),

  -- Tracking
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,

  -- Product Context
  product_id VARCHAR(255),
  product_type VARCHAR(50),

  -- Status
  status VARCHAR(20) DEFAULT 'clicked', -- clicked, registered, converted

  -- Timestamps
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,

  -- Order Reference
  order_id VARCHAR(255),
  order_amount DECIMAL(15,2)
);
```

### 3.5 Table: `commission_sales`
**Purpose:** Lịch sử commission từ mỗi sale

```sql
CREATE TABLE commission_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES auth.users(id),

  -- Order Info
  shopify_order_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(100),
  order_amount DECIMAL(15,2) NOT NULL,

  -- Product Info
  product_type VARCHAR(50), -- 'digital' or 'physical'
  product_category VARCHAR(50), -- course, scanner, crystal, etc.
  product_name VARCHAR(255),

  -- Partner Info at time of sale
  partner_role VARCHAR(20), -- 'ctv' or 'kol'
  partner_tier VARCHAR(20), -- bronze, silver, gold, platinum, diamond

  -- Commission
  commission_rate DECIMAL(5,2) NOT NULL, -- 0.10 = 10%
  commission_amount DECIMAL(15,2) NOT NULL,

  -- Sub-Affiliate (if applicable)
  is_sub_affiliate BOOLEAN DEFAULT false,
  original_partner_id UUID REFERENCES auth.users(id),

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

### 3.6 Table: `withdrawal_requests`
**Purpose:** Yêu cầu rút tiền

```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Amount
  amount DECIMAL(15,2) NOT NULL,

  -- Bank Info
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,

  -- Status Workflow
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, processing, completed, rejected

  -- Admin Actions
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Completion
  completed_at TIMESTAMPTZ,
  transaction_reference VARCHAR(255),

  -- Rejection
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.7 Table: `partner_notifications`
**Purpose:** Thông báo cho partners

```sql
CREATE TABLE partner_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL, -- tier_upgrade, tier_downgrade, commission_earned, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,

  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. MOBILE APP SERVICES

### 4.1 partnershipConstants.js
**Path:** `gem-mobile/src/constants/partnershipConstants.js`

**Exports:**
```javascript
// Roles
PARTNERSHIP_ROLES = { CTV: 'ctv', KOL: 'kol' }
ROLE_DISPLAY = { ctv: { name, shortName, description }, kol: {...} }

// CTV Tiers
CTV_TIERS = { BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }
CTV_TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
CTV_TIER_CONFIG = {
  bronze: {
    key: 'bronze',
    name: 'Đồng',
    icon: '🥉',
    color: '#CD7F32',
    bgColor: 'rgba(205, 127, 50, 0.15)',
    threshold: 0,
    commission: { digital: 0.10, physical: 0.06 },
    subAffiliate: 0.02,
    paymentSchedule: 'monthly',
    benefits: [...]
  },
  // ... silver, gold, platinum, diamond
}

// KOL Config
KOL_CONFIG = {
  requirements: { minFollowers: 20000 },
  commission: { digital: 0.20, physical: 0.20 },
  subAffiliate: 0.035,
  acceptedPlatforms: [...],
  benefits: [...]
}

// Helper Functions
getCommissionRate(role, tier, productType)
getSubAffiliateRate(role, tier)
determineTierByTotalSales(totalSales)
calculateTierProgress(currentTier, totalSales)
formatTierDisplay(tier) // "🥉 Đồng"
checkKOLEligibility(totalFollowers)
checkDowngradeCondition(currentTier, monthlySales)
```

### 4.2 affiliateService.js
**Path:** `gem-mobile/src/services/affiliateService.js`

**Key Methods:**
```javascript
class AffiliateService {
  // Profile Management
  async getOrCreateProfile()
  async getProfile()

  // Partnership Approval Check (CRITICAL)
  async checkPartnershipApproval(userId)
  // Returns: { isApproved, affiliateCode, role, ctvTier }

  // Product Affiliate Links
  async generateProductAffiliateLink(productId, productType, productData)
  // IMPORTANT: Only generates if user has APPROVED partnership

  // Link Generation
  generateShortCode(productName) // "RQC456"
  generateProductUrl(shortCode, affiliateCode, productId, productHandle)
  // Format: https://link.gemral.app/p/{shortCode}?ref={affiliateCode}&pid={productId}

  // Stats
  async getDashboardStats()
  async getProductLinkStats()
  async getProductLinks(limit)

  // Sharing
  async shareProductLink(productLink)
  async copyProductLink(productLink)

  // Commission Calculation
  getProductCommissionRate(productType, profile)
  getSubAffiliateRate(profile)
  calculateCommission(saleAmount, role, ctvTier, productType)
  calculateSubAffiliateCommission(saleAmount, role, ctvTier)
}
```

### 4.3 partnershipService.js
**Path:** `gem-mobile/src/services/partnershipService.js`

**Key Methods:**
```javascript
export const partnershipService = {
  // Partnership Status
  async getPartnershipStatus(userId)
  async getPartnershipStatusFallback(userId) // Direct DB query fallback

  // Applications
  async submitApplication(formData)
  async submitCTVApplication(data) // Simplified CTV registration
  async getApplicationStatus(userId, type)
  async getAllApplications(userId)
  async cancelApplication(applicationId)

  // Notifications
  async notifyAdminsNewApplication(data)

  // Withdrawal
  async requestWithdrawal(withdrawalData)
  async getWithdrawalHistory(partnerId)

  // Stats
  async getCommissionStats(partnerId)
  async getRecentOrdersWithCommission(partnerId, limit)

  // Links
  getReferralLink(affiliateCode) // https://yinyangmasters.com/?ref={code}
  getAppReferralLink(affiliateCode) // https://gemral.com/?ref={code}

  // Real-time
  subscribeToPartnershipUpdates(userId, callback)
  unsubscribe(subscription)
}
```

---

## 5. UI SCREENS & COMPONENTS

### 5.1 AffiliateSection.js
**Path:** `gem-mobile/src/screens/tabs/components/AffiliateSection.js`

**Handles 4 Scenarios:**

| Scenario | Condition | UI Display |
|----------|-----------|------------|
| 1 | No partnership, no application | Registration options (CTV + KOL) |
| 2 | Has pending application | "Đang Chờ Phê Duyệt" card |
| 3 | Application rejected | Rejection info + "Đăng Ký Lại" |
| 4 | Approved | Affiliate code, stats, buttons |

**Scenario 1 - Registration (No Partnership):**
```jsx
<View style={styles.registrationCard}>
  {/* Header */}
  <Gift size={28} color={COLORS.gold} />
  <Text>Tham Gia Kiếm Tiền Cùng GEM</Text>

  {/* CTV Option - Open to everyone */}
  <View style={styles.programCard}>
    <Text>CTV 5 Cấp</Text>
    <Badge>10-30%</Badge>
    <Text>• Digital: 10% → 30%</Text>
    <Text>• Physical: 6% → 15%</Text>
    <Text>• Sub-affiliate: 2% → 4%</Text>
    <Text>• Tự động duyệt sau 3 ngày</Text>
    <Badge color="success">Mở cho tất cả!</Badge>
    <Button onPress={handleCtvRegister}>Đăng Ký CTV</Button>
  </View>

  {/* KOL Option */}
  <View style={[styles.programCard, styles.kolCard]}>
    <Text>KOL Affiliate</Text>
    <Badge color="purple">20%</Badge>
    <Text>• Hoa hồng 20% tất cả sản phẩm</Text>
    <Text>• Sub-affiliate: 3.5%</Text>
    <Badge color="purple">Yêu cầu: 20,000+ followers</Badge>
    <Button onPress={handleKolRegister}>Đăng Ký KOL</Button>
  </View>
</View>
```

**Scenario 4 - Approved Partner:**
```jsx
<View style={styles.partnerCard}>
  {/* Code + Tier Badge */}
  <View style={styles.partnerHeader}>
    <Share2 size={28} color={COLORS.gold} />
    <Text style={styles.codeLabel}>Mã giới thiệu của bạn</Text>
    <Text style={styles.codeValue}>{affiliateCode}</Text>
    <Badge backgroundColor={tierColor}>{tierName}</Badge>
  </View>

  {/* Action Buttons */}
  <View style={styles.actionButtons}>
    <Button onPress={handleCopyCode}>Sao chép mã</Button>
    <Button variant="outline" onPress={handleCopyLink}>Sao chép link</Button>
  </View>

  {/* Stats Grid */}
  <View style={styles.statsGrid}>
    <StatCard icon={DollarSign} value={totalCommission} label="Tổng hoa hồng" />
    <StatCard icon={TrendingUp} value={thisMonthCommission} label="Tháng này" />
    <StatCard icon={Users} value={totalOrders} label="Đơn hàng" />
    <StatCard icon={CheckCircle} value={availableBalance} label="Khả dụng" />
  </View>

  {/* Footer */}
  <Button variant="outline" onPress={() => navigate('AffiliateDetail')}>Xem Chi Tiết</Button>
  <Button variant="outline" onPress={() => navigate('WithdrawRequest')}>Rút Tiền</Button>
</View>
```

### 5.2 ProductAffiliateLinkSheet.js
**Path:** `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js`

**Triggered from:** Product detail screens, Shop items

**States:**

| State | Condition | Display |
|-------|-----------|---------|
| Loading | Generating link | Spinner + "Đang tạo link..." |
| Error (Not Approved) | requiresPartnership: true | Error + "Đăng ký Partnership" button |
| Error (Other) | Other errors | Error + "Thử lại" button |
| Success | Link generated | Product info, commission, link, share buttons |

**Success UI Structure:**
```jsx
<Modal visible={visible} transparent>
  <Animated.View style={styles.sheet}>
    {/* Header */}
    <Link size={20} color={COLORS.gold} />
    <Text>Link Affiliate</Text>
    <X onPress={handleClose} />

    {/* Product Card */}
    <View style={styles.productCard}>
      <Text style={styles.productName}>{productName}</Text>
      <Text style={styles.productPrice}>{price} VND</Text>
    </View>

    {/* Commission Card */}
    <View style={styles.commissionCard}>
      <Row label="Hoa hồng của bạn:" value={commissionRate + "%"} />
      <Row label="Thu nhập ước tính:" value={estimatedCommission + " VND"} />
    </View>

    {/* Link Box */}
    <View style={styles.linkBox}>
      <Text>{linkData.url}</Text>
      <Copy onPress={handleCopy} />
    </View>

    {/* Actions */}
    <Button icon={Copy} onPress={handleCopy}>Sao chép</Button>
    <Button icon={Share2} onPress={handleShare} variant="primary">Chia sẻ</Button>

    {/* Tip */}
    <Lightbulb />
    <Text>Chia sẻ link trên mạng xã hội để tăng thu nhập!</Text>
  </Animated.View>
</Modal>
```

### 5.3 User Screens

| Screen | Path | Purpose |
|--------|------|---------|
| PartnershipRegistrationScreen | `screens/Account/PartnershipRegistrationScreen.js` | Form đăng ký CTV/KOL |
| KOLRegistrationForm | (inside above) | KOL-specific form with social platforms |
| AffiliateDetailScreen | `screens/Account/AffiliateDetailScreen.js` | Chi tiết affiliate, commission history |
| WithdrawRequestScreen | `screens/Account/WithdrawRequestScreen.js` | Form rút tiền |

### 5.4 Admin Screens

| Screen | Path | Purpose |
|--------|------|---------|
| AdminApplicationsScreen | `screens/Admin/AdminApplicationsScreen.js` | Review CTV/KOL applications |
| AdminWithdrawalsScreen | `screens/Admin/AdminWithdrawalsScreen.js` | Process withdrawal requests |

---

## 6. SHOPIFY WEBHOOK INTEGRATION

### 6.1 shopify-webhook/index.ts
**Path:** `supabase/functions/shopify-webhook/index.ts`

**Commission Rates in Webhook (lines 12-31):**
```typescript
const COMMISSION_RATES_V3 = {
  kol: { digital: 20, physical: 20 },
  ctv: {
    bronze: { digital: 10, physical: 6 },
    silver: { digital: 15, physical: 8 },
    gold: { digital: 20, physical: 10 },
    platinum: { digital: 25, physical: 12 },
    diamond: { digital: 30, physical: 15 },
  },
};

const SUB_AFFILIATE_RATES_V3 = {
  kol: 3.5,
  bronze: 2, silver: 2.5, gold: 3, platinum: 3.5, diamond: 4,
};
```

### 6.2 Order Processing Flow

```
Shopify Order (orders/paid)
    ↓
shopify-webhook function receives order
    ↓
Extract partner_id from:
  1. note_attributes.partner_id (Mobile App injection)
  2. note_attributes.ref (URL parameter)
  3. note_attributes.affiliate_id (Legacy)
  4. affiliate_referrals table (by customer email)
    ↓
If partner found:
  1. Get partner role & tier from affiliate_profiles
  2. Determine product type (digital/physical)
  3. Calculate commission using getCommissionRateV3()
  4. Create commission_sales record
  5. Update affiliate_profiles.total_sales
  6. Update affiliate_profiles.monthly_sales
  7. Check for sub-affiliate (referred_by)
     - If exists, calculate sub-affiliate commission
     - Update original partner's sub_affiliate_earnings
  8. Send push notification via partnership-notifications
    ↓
Partner receives "🎊 +{amount} từ đơn #{order}"
```

### 6.3 Partner ID Extraction (lines 799-820)

```typescript
function getPartnerIdFromOrder(order) {
  const noteAttributes = order.note_attributes || [];

  // Priority order
  const keys = ['partner_id', 'ref', 'affiliate_id', 'referral_code'];

  for (const key of keys) {
    const attr = noteAttributes.find(a => a.name === key);
    if (attr?.value) return attr.value;
  }

  return null;
}
```

### 6.4 Sub-Affiliate Processing (lines 1004-1074)

```typescript
// Check if partner was referred by another partner
const { data: referrer } = await supabase
  .from('affiliate_profiles')
  .select('user_id, role, ctv_tier')
  .eq('user_id', partnerProfile.referred_by)
  .single();

if (referrer) {
  const subAffRate = getSubAffiliateRateV3(referrer.role, referrer.ctv_tier);
  const subAffCommission = orderTotal * (subAffRate / 100);

  // Record sub-affiliate commission
  await supabase.from('commission_sales').insert({
    partner_id: referrer.user_id,
    shopify_order_id: order.id,
    commission_rate: subAffRate,
    commission_amount: subAffCommission,
    is_sub_affiliate: true,
    original_partner_id: partnerId,
  });

  // Update sub-affiliate earnings
  await supabase.rpc('increment_sub_affiliate_earnings', {
    partner_id: referrer.user_id,
    amount: subAffCommission,
  });
}
```

---

## 7. CRON JOBS & AUTOMATION

### 7.1 Cron Jobs Configuration

| Job | Schedule | Function | Purpose |
|-----|----------|----------|---------|
| CTV Auto Approve | Every hour (0 * * * *) | `auto_approve_pending_ctv()` | Auto-approve CTV apps after 3 days |
| Weekly Tier Upgrade | Sunday 17:00 UTC | `process_weekly_tier_upgrades()` | Upgrade tiers based on total_sales |
| Monthly Tier Downgrade | 28-31st 16:59 UTC | `process_monthly_tier_downgrades()` | Downgrade if monthly_sales < 10% threshold |
| Reset Monthly Sales | 1st 17:00 UTC | `reset_monthly_sales()` | Reset monthly_sales to 0 |

### 7.2 SQL Functions

**Auto-Approve CTV (3 days):**
```sql
CREATE FUNCTION auto_approve_pending_ctv()
RETURNS INTEGER AS $$
DECLARE
  approved_count INTEGER := 0;
  app RECORD;
BEGIN
  FOR app IN
    SELECT * FROM partnership_applications
    WHERE application_type = 'ctv'
    AND status = 'pending'
    AND auto_approve_at <= NOW()
  LOOP
    -- Create affiliate_profiles record
    INSERT INTO affiliate_profiles (user_id, role, ctv_tier, referral_code)
    VALUES (app.user_id, 'ctv', 'bronze', generate_affiliate_code());

    -- Update application status
    UPDATE partnership_applications
    SET status = 'approved', approved_at = NOW()
    WHERE id = app.id;

    -- Update profiles table
    UPDATE profiles
    SET partnership_role = 'ctv', ctv_tier = 'bronze'
    WHERE id = app.user_id;

    -- Send notification
    INSERT INTO partner_notifications (partner_id, type, title, message)
    VALUES (app.user_id, 'application_approved',
            '🎉 Chúc mừng!', 'Bạn đã trở thành CTV cấp Đồng!');

    approved_count := approved_count + 1;
  END LOOP;

  RETURN approved_count;
END;
$$ LANGUAGE plpgsql;
```

**Weekly Tier Upgrade:**
```sql
CREATE FUNCTION process_weekly_tier_upgrades()
RETURNS INTEGER AS $$
DECLARE
  upgraded_count INTEGER := 0;
  partner RECORD;
  new_tier TEXT;
BEGIN
  FOR partner IN
    SELECT * FROM affiliate_profiles WHERE role = 'ctv' AND is_active = true
  LOOP
    -- Determine tier by total_sales
    new_tier := CASE
      WHEN partner.total_sales >= 800000000 THEN 'diamond'
      WHEN partner.total_sales >= 400000000 THEN 'platinum'
      WHEN partner.total_sales >= 150000000 THEN 'gold'
      WHEN partner.total_sales >= 50000000 THEN 'silver'
      ELSE 'bronze'
    END;

    -- Upgrade if new tier is higher
    IF new_tier != partner.ctv_tier THEN
      UPDATE affiliate_profiles SET ctv_tier = new_tier WHERE id = partner.id;
      INSERT INTO partner_notifications (partner_id, type, title, message)
      VALUES (partner.user_id, 'tier_upgrade', '🚀 Thăng cấp!',
              'Bạn đã lên cấp ' || new_tier);
      upgraded_count := upgraded_count + 1;
    END IF;
  END LOOP;

  RETURN upgraded_count;
END;
$$ LANGUAGE plpgsql;
```

### 7.3 External Cron Service
**Provider:** cron-job.org

| Job Name | URL | Schedule |
|----------|-----|----------|
| GEM CTV Auto Approve | `{SUPABASE_URL}/functions/v1/partnership-cron?action=auto_approve` | Every hour |
| GEM Weekly Tier Upgrade | `{SUPABASE_URL}/functions/v1/partnership-cron?action=tier_upgrade` | Sun 17:00 UTC |
| GEM Monthly Tier Downgrade | `{SUPABASE_URL}/functions/v1/partnership-cron?action=tier_downgrade` | 28-31st 16:59 UTC |
| GEM Reset Monthly Sales | `{SUPABASE_URL}/functions/v1/partnership-cron?action=reset_monthly` | 1st 17:00 UTC |

---

## 8. NOTIFICATIONS SYSTEM

### 8.1 Notification Types

| Event | Title | Body |
|-------|-------|------|
| `application_approved` | 🎉 Chúc mừng! Bạn đã trở thành {role} | Bắt đầu kiếm hoa hồng từ mỗi đơn hàng ngay! |
| `application_rejected` | 📋 Đơn đăng ký cần bổ sung | {rejection_reason} |
| `tier_upgrade` | 🚀 Chúc mừng thăng cấp! | Bạn đã lên cấp {tier}! Hoa hồng tăng lên rồi! |
| `tier_downgrade` | ⚠️ Thông báo về cấp bậc | Cấp bậc của bạn đã được điều chỉnh về {tier} |
| `commission_earned` | 🎊 Bạn vừa nhận hoa hồng! | +{amount} từ đơn hàng #{order_number} |
| `sub_affiliate_earned` | 💎 Hoa hồng sub-affiliate! | +{amount} từ đối tác {partner_name} |
| `withdrawal_approved` | ✅ Yêu cầu rút tiền đã duyệt | Số tiền {amount} sẽ được chuyển trong 24h |
| `withdrawal_completed` | 💰 Đã chuyển tiền thành công! | {amount} đã được chuyển vào tài khoản |
| `withdrawal_rejected` | ❌ Yêu cầu rút tiền bị từ chối | {rejection_reason} |

### 8.2 partnership-notifications Edge Function
**Path:** `supabase/functions/partnership-notifications/index.ts`

```typescript
// Event payload
interface NotificationEvent {
  event_type: string;
  user_id: string;
  data: {
    order_number?: string;
    amount?: number;
    tier?: string;
    reason?: string;
    // ...
  }
}

// Sends push notification via Expo
async function sendPushNotification(userId, title, body, data) {
  // Get user's expo push token
  const { data: profile } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', userId)
    .single();

  if (!profile?.expo_push_token) return;

  // Send via Expo Push API
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    body: JSON.stringify({
      to: profile.expo_push_token,
      title,
      body,
      data,
      sound: 'default',
    }),
  });
}
```

---

## 9. DESIGN SPECIFICATIONS

### 9.1 Color Palette

```javascript
// Tier Colors
TIER_COLORS = {
  bronze: '#CD7F32',   // Bronze metal
  silver: '#C0C0C0',   // Silver metal
  gold: '#FFD700',     // Gold metal
  platinum: '#E5E4E2', // Platinum metal
  diamond: '#00F0FF',  // Cyan diamond
};

// Role Colors
KOL_COLOR = '#9C27B0'; // Purple

// Status Colors
STATUS_COLORS = {
  pending: '#FF9800',    // Orange
  approved: '#4CAF50',   // Green
  rejected: '#FF5252',   // Red
  processing: '#9C27B0', // Purple
  completed: '#4CAF50',  // Green
};

// Action Colors
COLORS = {
  gold: '#FFBD59',       // Primary accent
  burgundy: '#9C0612',   // Button background
  purple: '#6A5BFF',     // CTV accent
  success: '#3AF7A6',    // Success text
  error: '#FF6B6B',      // Error text
};
```

### 9.2 Typography

```javascript
// Section Titles
sectionTitle: {
  fontSize: 18,        // TYPOGRAPHY.fontSize.lg
  fontWeight: '700',   // bold
  color: COLORS.gold,
}

// Code Value (Affiliate Code)
codeValue: {
  fontSize: 28,        // TYPOGRAPHY.fontSize.xxxl
  fontWeight: '700',   // bold
  color: COLORS.gold,
}

// Stat Value
statValue: {
  fontSize: 20,        // TYPOGRAPHY.fontSize.xl
  fontWeight: '700',   // bold
  color: COLORS.textPrimary,
}

// Commission Rate
commissionRate: {
  fontSize: 20,
  fontWeight: '700',
  color: COLORS.gold,
}

// Commission Amount
commissionAmount: {
  fontSize: 20,
  fontWeight: '700',
  color: '#22C55E',    // Green
}
```

### 9.3 Card Styles

```javascript
// Glass Card (Registration, Partner)
glassCard: {
  backgroundColor: 'rgba(15, 16, 48, 0.55)', // GLASS.background
  borderRadius: 18,                           // GLASS.borderRadius
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.3)',    // Gold border
  padding: 16,                                // SPACING.lg
}

// Program Card (CTV/KOL option)
programCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: 12,
}

// Stat Card
statCard: {
  width: '48%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  padding: 12,
  alignItems: 'center',
}

// Commission Card
commissionCard: {
  backgroundColor: 'rgba(15, 16, 48, 0.6)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  padding: 16,
}
```

### 9.4 Button Styles

```javascript
// Primary Button (Gold background)
primaryButton: {
  backgroundColor: COLORS.gold,
  paddingVertical: 12,
  borderRadius: 12,
}

// CTV Button (Purple)
ctvButton: {
  backgroundColor: COLORS.purple, // #6A5BFF
  paddingVertical: 12,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
}

// KOL Button (Purple)
kolButton: {
  backgroundColor: '#9C27B0',
  // ...same structure
}

// Copy Button (Burgundy)
copyButton: {
  backgroundColor: COLORS.burgundy, // #9C0612
  paddingVertical: 12,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

// Link Button (Outline)
linkButton: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: COLORS.gold,
  paddingVertical: 12,
  borderRadius: 10,
}

// Share Button (Gradient feel with solid)
shareButton: {
  backgroundColor: '#9C0612',
  paddingVertical: 12,
  borderRadius: 10,
}
```

### 9.5 Badge Styles

```javascript
// Tier Badge
tierBadge: {
  backgroundColor: `${tierColor}30`, // 30% opacity
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 8,
}
tierText: {
  fontSize: 12,
  fontWeight: '700',
  color: tierColor,
}

// Rate Badge
rateBadge: {
  backgroundColor: 'rgba(255, 189, 89, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
}
rateText: {
  fontSize: 13,
  fontWeight: '700',
  color: COLORS.gold,
}

// Status Badge
statusBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
  backgroundColor: `${statusColor}20`, // 20% opacity
}
statusText: {
  fontSize: 10,
  fontWeight: '600',
  color: statusColor,
}

// Eligibility Badge (Success)
eligibleBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(58, 247, 166, 0.15)',
  paddingHorizontal: 8,
  paddingVertical: 6,
  borderRadius: 8,
  gap: 6,
}
eligibleText: {
  fontSize: 13,
  fontWeight: '600',
  color: COLORS.success,
}

// KOL Requirement Badge
kolRequirementBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(156, 39, 176, 0.15)',
  paddingHorizontal: 8,
  paddingVertical: 6,
  borderRadius: 8,
  gap: 6,
}
kolRequirementText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#9C27B0',
}
```

### 9.6 Bottom Sheet Styles

```javascript
// Sheet Container
sheet: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: SCREEN_HEIGHT * 0.65,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  backgroundColor: '#0F1030',
  ...SHADOWS.glass,
}

// Handle
handle: {
  width: 36,
  height: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 2,
}

// Backdrop
backdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
}
```

---

## 10. USER FLOWS

### 10.1 CTV Registration Flow
```
User opens Account Tab
    ↓
AffiliateSection shows registration options
    ↓
User taps "Đăng Ký CTV"
    ↓
PartnershipRegistrationScreen (type: 'ctv')
    ↓
Fill form (full_name, email, phone, reason)
    ↓
Submit → partnershipService.submitCTVApplication()
    ↓
Application saved with:
  - status: 'pending'
  - auto_approve_at: NOW() + 3 days
    ↓
AffiliateSection shows "Đang Chờ Phê Duyệt"
    ↓
[After 3 days] Cron job auto_approve_pending_ctv()
    ↓
Creates affiliate_profiles with:
  - role: 'ctv'
  - ctv_tier: 'bronze'
  - referral_code: 'GEM...'
    ↓
User receives push notification "🎉 Chúc mừng!"
```

### 10.2 KOL Registration Flow
```
User taps "Đăng Ký KOL"
    ↓
KOLRegistrationForm
    ↓
Fill form:
  - full_name, email, phone
  - social_platforms: { youtube: 50000, facebook: 30000, ... }
  - social_links: { youtube: "url", ... }
  - content_niche
    ↓
Client-side validation: checkKOLEligibility(totalFollowers)
    ↓
If totalFollowers < 20000: Show error, cannot submit
    ↓
If >= 20000: Submit
    ↓
Application saved with status: 'pending'
    ↓
Admin receives notification about new KOL application
    ↓
Admin reviews in AdminApplicationsScreen
    ↓
├── Approve
│       ↓
│   Creates affiliate_profiles with role: 'kol'
│   User receives "🎉 Chúc mừng KOL!" notification
│
└── Reject
        ↓
    User receives rejection notification with reason
```

### 10.3 Product Affiliate Link Flow
```
User views product → Taps "Link Affiliate"
    ↓
ProductAffiliateLinkSheet opens
    ↓
affiliateService.checkPartnershipApproval(userId)
    ↓
├── NOT APPROVED
│       ↓
│   Show error + "Đăng ký Partnership" button
│
└── APPROVED
        ↓
    affiliateService.generateProductAffiliateLink()
        ↓
    Display:
      - Product info (name, price)
      - Commission rate (based on role/tier + product type)
      - Estimated commission
      - Link URL
        ↓
    User copies/shares link
```

### 10.4 Commission Tracking Flow
```
Customer clicks affiliate link
    ↓
Link format: https://link.gemral.app/p/{shortCode}?ref={code}&pid={productId}
    ↓
Shopify stores ref in cart attributes (via Theme script)
    ↓
Customer completes checkout
    ↓
Shopify sends orders/paid webhook
    ↓
shopify-webhook function:
  1. Extract partner_id from note_attributes
  2. Get partner profile (role, tier)
  3. Determine product type (digital/physical)
  4. Calculate commission
  5. Create commission_sales record
  6. Update affiliate_profiles stats
  7. Check for sub-affiliate
  8. Send push notification
    ↓
Partner receives: "🎊 +{amount} từ đơn #{order}"
```

### 10.5 Withdrawal Flow
```
Partner opens WithdrawRequestScreen
    ↓
Display:
  - Available balance
  - Minimum withdrawal: 100,000 VND
  - Warning if has pending withdrawal
    ↓
Fill form:
  - Amount (với MAX button)
  - Bank name
  - Account number
  - Account holder (auto uppercase)
    ↓
Validation:
  - Amount >= 100,000
  - Amount <= available_balance
  - No pending withdrawal exists
    ↓
Submit → partnershipService.requestWithdrawal()
    ↓
Creates withdrawal_requests with status: 'pending'
Deducts amount from available_balance
    ↓
Admin sees in AdminWithdrawalsScreen
    ↓
├── Approve → processing
│       ↓
│   Admin completes (enters transaction ref)
│       ↓
│   Status: completed
│   Partner receives: "💰 Đã chuyển tiền!"
│
└── Reject
        ↓
    Amount refunded to available_balance
    Partner receives: "❌ Từ chối" + reason
```

---

## 11. FILES SUMMARY

### 11.1 Constants & Config
| File | Purpose |
|------|---------|
| `gem-mobile/src/constants/partnershipConstants.js` | All tier configs, rates, helpers |

### 11.2 Services
| File | Purpose |
|------|---------|
| `gem-mobile/src/services/affiliateService.js` | Link generation, product links, stats |
| `gem-mobile/src/services/partnershipService.js` | Registration, status, withdrawals |
| `gem-mobile/src/services/withdrawService.js` | Withdrawal helpers |

### 11.3 User Screens
| File | Purpose |
|------|---------|
| `gem-mobile/src/screens/tabs/components/AffiliateSection.js` | Main section in Account tab |
| `gem-mobile/src/screens/Account/PartnershipRegistrationScreen.js` | CTV/KOL registration form |
| `gem-mobile/src/screens/Account/AffiliateDetailScreen.js` | Detailed stats, commission history |
| `gem-mobile/src/screens/Account/WithdrawRequestScreen.js` | Withdrawal request form |

### 11.4 Admin Screens
| File | Purpose |
|------|---------|
| `gem-mobile/src/screens/Admin/AdminApplicationsScreen.js` | Review CTV/KOL applications |
| `gem-mobile/src/screens/Admin/AdminWithdrawalsScreen.js` | Process withdrawals |

### 11.5 Components
| File | Purpose |
|------|---------|
| `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js` | Product link bottom sheet |
| `gem-mobile/src/components/Affiliate/index.js` | Exports |

### 11.6 Edge Functions
| File | Purpose |
|------|---------|
| `supabase/functions/shopify-webhook/index.ts` | Process orders, commission tracking |
| `supabase/functions/partnership-notifications/index.ts` | Send push notifications |
| `supabase/functions/partnership-cron/index.ts` | Cron job handler |

### 11.7 Database Migrations
| File | Purpose |
|------|---------|
| `supabase/migrations/20241228_partnership_v3.sql` | v3.0 schema changes |
| `supabase/migrations/20241228_partnership_v3_cron_jobs.sql` | Cron RPC functions |

---

## 12. SECURITY & VALIDATION

### 12.1 RLS Policies
```sql
-- Users can only view their own partnership data
CREATE POLICY "Users can view own affiliate_profiles" ON affiliate_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only view their own applications
CREATE POLICY "Users can view own applications" ON partnership_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can view all
CREATE POLICY "Admins can view all affiliate_profiles" ON affiliate_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true))
  );
```

### 12.2 Approval Gate
**CRITICAL:** Affiliate links ONLY generated for users with approved partnership.

```javascript
// In affiliateService.js:generateProductAffiliateLink()
const partnershipCheck = await this.checkPartnershipApproval(user.id);

if (!partnershipCheck.isApproved) {
  return {
    success: false,
    error: 'Bạn chưa là đối tác affiliate...',
    requiresPartnership: true,
  };
}
```

### 12.3 Withdrawal Validation
```javascript
// Minimum amount
if (amount < 100000) {
  return { error: 'Rút tối thiểu 100,000 VND' };
}

// Cannot exceed balance
if (amount > available_balance) {
  return { error: 'Số dư không đủ' };
}

// Only one pending withdrawal
const { count } = await supabase
  .from('withdrawal_requests')
  .select('*', { count: 'exact', head: true })
  .eq('partner_id', userId)
  .eq('status', 'pending');

if (count > 0) {
  return { error: 'Bạn có yêu cầu rút tiền đang chờ xử lý' };
}
```

### 12.4 KOL Eligibility
```javascript
export const checkKOLEligibility = (totalFollowers) => {
  const MIN_FOLLOWERS = 20000; // BẮT BUỘC, không ngoại lệ

  if (totalFollowers >= MIN_FOLLOWERS) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Cần thêm ${MIN_FOLLOWERS - totalFollowers} followers`,
  };
};
```

---

## 13. IMPLEMENTATION STATUS

### 13.1 Fully Implemented (100%)

| Feature | File/Location | Status |
|---------|---------------|--------|
| CTV 5 Tiers (VN names) | partnershipConstants.js | ✅ |
| Commission rates v3.0 | affiliateService.js, shopify-webhook | ✅ |
| Sub-affiliate rates | affiliateService.js, shopify-webhook | ✅ |
| KOL 20K requirement | KOLRegistrationForm.js | ✅ |
| Tier thresholds | partnershipConstants.js | ✅ |
| Sub-affiliate tracking | shopify-webhook:1004-1074 | ✅ |
| CTV Auto-approve (3 days) | partnership_v3_cron_jobs.sql | ✅ |
| Weekly tier upgrade | partnership_v3_cron_jobs.sql | ✅ |
| Monthly tier downgrade | partnership_v3_cron_jobs.sql | ✅ |
| Reset monthly sales | partnership_v3_cron_jobs.sql | ✅ |
| External cron (cron-job.org) | 4 jobs configured | ✅ |
| Payment schedules | partnershipConstants.js | ✅ |
| Vietnamese tier names | all files | ✅ |
| KOL social platforms | KOLRegistrationForm.js | ✅ |
| Admin app review | AdminApplicationsScreen.js | ✅ |
| AffiliateSection UI v3.0 | AffiliateSection.js | ✅ |
| Product affiliate links | ProductAffiliateLinkSheet.js | ✅ |
| Withdrawal system | WithdrawRequestScreen.js | ✅ |
| Partner notifications | partnership-notifications | ✅ |

### 13.2 Cron Jobs Status

| Job | Schedule | Status |
|-----|----------|--------|
| GEM CTV Auto Approve | Every hour (0 * * * *) | ✅ 200 OK |
| GEM Weekly Tier Upgrade | Sunday 17:00 UTC | ✅ 200 OK |
| GEM Monthly Tier Downgrade | 28-31st 16:59 UTC | ✅ 200 OK |
| GEM Reset Monthly Sales | 1st 17:00 UTC | ✅ 200 OK |

### 13.3 Commission Rates Verification

```
CTV Bronze:   Digital 10% ✅ | Physical 6%  ✅ | Sub-Aff 2%   ✅
CTV Silver:   Digital 15% ✅ | Physical 8%  ✅ | Sub-Aff 2.5% ✅
CTV Gold:     Digital 20% ✅ | Physical 10% ✅ | Sub-Aff 3%   ✅
CTV Platinum: Digital 25% ✅ | Physical 12% ✅ | Sub-Aff 3.5% ✅
CTV Diamond:  Digital 30% ✅ | Physical 15% ✅ | Sub-Aff 4%   ✅
KOL:          Digital 20% ✅ | Physical 20% ✅ | Sub-Aff 3.5% ✅
```

---

**END OF FEATURE SPEC**

*Generated by Claude Code*
*Project: GEM Partnership System v3.0*

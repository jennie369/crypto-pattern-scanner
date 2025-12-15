# AFFILIATE & CTV 4 LEVELS - COMPLETE FEATURE SPEC
## Cross Shopify Shop Affiliate System

**Version:** 2.0
**Last Updated:** 2025-12-14
**Status:** FULLY IMPLEMENTED

---

## 1. SYSTEM OVERVIEW

### 1.1 Business Model
Hệ thống Affiliate & Cộng tác viên (CTV) 4 cấp cho phép người dùng giới thiệu sản phẩm và nhận hoa hồng từ đơn hàng Shopify.

### 1.2 Partner Types

| Type | Commission | Description |
|------|------------|-------------|
| **Affiliate** | 3% | Người giới thiệu cơ bản |
| **CTV (Cộng Tác Viên)** | 10-30% | Đối tác bán hàng chuyên nghiệp với 4 cấp độ |

### 1.3 CTV 4-Tier System

| Tier | Digital Commission | Physical Commission | Sales Threshold |
|------|-------------------|---------------------|-----------------|
| **Beginner** | 10% | 5% | 0 VND |
| **Growing** | 15% | 7% | 100,000,000 VND |
| **Master** | 20% | 10% | 300,000,000 VND |
| **Grand** | 30% | 15% | 600,000,000 VND |

---

## 2. DATABASE SCHEMA

### 2.1 Table: `partnership_applications`
**Purpose:** Lưu đơn đăng ký Affiliate/CTV

```sql
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  -- Application Type
  application_type VARCHAR(20) NOT NULL, -- 'affiliate' or 'ctv'

  -- CTV-specific fields
  courses_owned TEXT[],
  reason_for_joining TEXT,
  marketing_channels TEXT,
  estimated_monthly_sales VARCHAR(100),

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected

  -- Review Info
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Table: `affiliate_profiles`
**Purpose:** Profile và stats của partner đã được duyệt

```sql
CREATE TABLE affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'affiliate', -- 'affiliate' or 'ctv'

  -- CTV Tier
  ctv_tier VARCHAR(20) DEFAULT 'beginner', -- beginner, growing, master, grand

  -- Stats
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Table: `affiliate_codes`
**Purpose:** Mã affiliate cho từng sản phẩm

```sql
CREATE TABLE affiliate_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Product Info
  product_id VARCHAR(255) NOT NULL, -- Shopify product ID (string)
  product_type VARCHAR(50) NOT NULL, -- crystal, course, subscription

  -- Code Info
  affiliate_code VARCHAR(50) UNIQUE NOT NULL,
  short_link VARCHAR(255),
  full_url TEXT,

  -- Commission
  commission_rate DECIMAL(5,2),

  -- Stats
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);
```

### 2.4 Table: `affiliate_referrals`
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

### 2.5 Table: `affiliate_commissions` / `commission_sales`
**Purpose:** Lịch sử hoa hồng

```sql
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES auth.users(id),

  -- Order Info
  order_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(100),
  order_amount DECIMAL(15,2) NOT NULL,

  -- Product Info
  product_id VARCHAR(255),
  product_type VARCHAR(50),

  -- Commission
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

### 2.6 Table: `withdrawal_requests`
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

### 2.7 Profiles Table Extension
Thêm các cột vào bảng `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  affiliate_code VARCHAR(50) UNIQUE,
  partnership_role VARCHAR(20), -- 'affiliate' or 'ctv'
  ctv_tier VARCHAR(20) DEFAULT 'beginner',
  total_sales DECIMAL(15,2) DEFAULT 0,
  available_balance DECIMAL(15,2) DEFAULT 0,
  expo_push_token TEXT;
```

---

## 3. SQL FUNCTIONS (RPC)

### 3.1 Partnership Management

```sql
-- Get partnership status
CREATE FUNCTION get_partnership_status(user_id_param UUID)
RETURNS JSONB

-- Approve partnership application
CREATE FUNCTION approve_partnership_application(
  application_id_param UUID,
  admin_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL
) RETURNS JSONB

-- Reject partnership application
CREATE FUNCTION reject_partnership_application(
  application_id_param UUID,
  admin_id_param UUID,
  rejection_reason_param TEXT
) RETURNS JSONB
```

### 3.2 Withdrawal Management

```sql
-- Submit withdrawal request
CREATE FUNCTION request_withdrawal(
  partner_id_param UUID,
  amount_param DECIMAL,
  bank_name_param TEXT,
  account_number_param TEXT,
  account_holder_param TEXT
) RETURNS JSONB

-- Admin approve withdrawal
CREATE FUNCTION admin_approve_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL
) RETURNS JSONB

-- Admin complete withdrawal (after bank transfer)
CREATE FUNCTION admin_complete_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  transaction_ref_param TEXT
) RETURNS JSONB

-- Admin reject withdrawal
CREATE FUNCTION admin_reject_withdrawal(
  withdrawal_id_param UUID,
  admin_id_param UUID,
  rejection_reason_param TEXT
) RETURNS JSONB
```

### 3.3 Affiliate Code Generation

```sql
-- Generate unique affiliate code
CREATE FUNCTION generate_affiliate_code() RETURNS TEXT
-- Format: GEM + random 8 chars

-- Create product affiliate code
CREATE FUNCTION create_product_affiliate_code(
  user_id_param UUID,
  product_id_param TEXT,
  product_type_param TEXT
) RETURNS JSONB
```

---

## 4. MOBILE APP SERVICES

### 4.1 affiliateService.js
**Path:** `gem-mobile/src/services/affiliateService.js`

**Key Methods:**
```javascript
class AffiliateService {
  // Profile Management
  async getProfile()
  async getOrCreateProfile()

  // Partnership Approval Check (NEW - Fixed)
  async checkPartnershipApproval(userId)
  // Returns: { isApproved, affiliateCode, role, ctvTier }

  // Product Affiliate Links
  async generateProductAffiliateLink(productId, productType, productData)
  // IMPORTANT: Only generates link if user has APPROVED partnership

  // Stats
  async getAffiliateStats()
  async getCommissionHistory(limit)
  async getReferralHistory(limit)

  // Referral Tracking
  async trackReferralClick(affiliateCode, productId, metadata)
  async convertReferral(affiliateCode, orderId, orderAmount)
}
```

### 4.2 partnershipService.js
**Path:** `gem-mobile/src/services/partnershipService.js`

**Key Methods:**
```javascript
export const partnershipService = {
  // Application
  async submitApplication(applicationData)
  async getPartnershipStatus(userId)
  async getApplicationHistory(userId)

  // Withdrawal
  async requestWithdrawal(withdrawalData)
  async getWithdrawalHistory(userId, limit)
  async getPendingWithdrawals(userId)

  // Stats
  async getPartnerStats(userId)
  async getCommissionHistory(userId, options)
}
```

---

## 5. UI SCREENS & COMPONENTS

### 5.1 User Screens

#### AffiliateSection.js (Account Tab Component)
**Path:** `gem-mobile/src/screens/tabs/components/AffiliateSection.js`

**4 Scenarios:**

| Scenario | Status | UI Display |
|----------|--------|------------|
| 1. No Partnership | No application | Registration form with 2 options: Affiliate 3% hoặc CTV 10-30% |
| 2. Pending | Application submitted | "Đang Chờ Phê Duyệt" status card with application details |
| 3. Rejected | Application rejected | Rejection reason + "Đăng Ký Lại" button |
| 4. Approved | Active partner | Affiliate code, stats, link generation enabled |

**Scenario 1 - No Partnership (Registration Form):**
```jsx
<View style={styles.optionCard}>
  <Text style={styles.optionTitle}>Affiliate</Text>
  <Text style={styles.commissionRate}>3%</Text>
  <Text style={styles.optionDesc}>Giới thiệu sản phẩm và nhận hoa hồng</Text>
  <TouchableOpacity onPress={() => navigate('PartnershipRegistration', { type: 'affiliate' })}>
    <Text>Đăng Ký Ngay</Text>
  </TouchableOpacity>
</View>

<View style={styles.optionCard}>
  <Text style={styles.optionTitle}>CTV 4 Cấp</Text>
  <Text style={styles.commissionRate}>10-30%</Text>
  <Text style={styles.optionDesc}>Hoa hồng cao hơn, thăng cấp theo doanh số</Text>
  <TouchableOpacity onPress={() => navigate('PartnershipRegistration', { type: 'ctv' })}>
    <Text>Đăng Ký Ngay</Text>
  </TouchableOpacity>
</View>
```

**Scenario 4 - Approved (Active Partner):**
```jsx
<View style={styles.codeCard}>
  <Text style={styles.codeLabel}>Mã Affiliate của bạn</Text>
  <Text style={styles.codeValue}>{affiliateCode}</Text>
  <TouchableOpacity onPress={copyCode}>
    <Text>Sao chép</Text>
  </TouchableOpacity>
</View>

<View style={styles.statsGrid}>
  <StatCard label="Tổng hoa hồng" value={formatCurrency(totalCommission)} />
  <StatCard label="Số dư khả dụng" value={formatCurrency(availableBalance)} />
  <StatCard label="Số người giới thiệu" value={totalReferrals} />
</View>
```

#### PartnershipRegistrationScreen.js
**Path:** `gem-mobile/src/screens/Account/PartnershipRegistrationScreen.js`

**Form Fields:**
- Họ tên (required)
- Email (required, auto-filled)
- Số điện thoại
- Loại đăng ký: Affiliate / CTV (based on route param)

**CTV-only Fields:**
- Khóa học đã mua (dropdown)
- Lý do tham gia
- Kênh marketing dự kiến
- Doanh số dự kiến/tháng

#### AffiliateDetailScreen.js
**Path:** `gem-mobile/src/screens/Account/AffiliateDetailScreen.js`

**Sections:**
1. **Referral Code Card** - Mã giới thiệu + Copy buttons
2. **Tier & Role Card** - Current tier, commission rates, progress bar
3. **Stats Grid** - Total commission, pending, referrals, conversions
4. **This Month Stats** - Monthly commission & sales
5. **Commission History** - FlatList of commission records

#### WithdrawRequestScreen.js
**Path:** `gem-mobile/src/screens/Account/WithdrawRequestScreen.js`

**Form Fields:**
- Số tiền (với MAX button)
- Tên ngân hàng
- Số tài khoản
- Chủ tài khoản (auto uppercase)

**Validation:**
- Minimum: 100,000 VND
- Cannot exceed available balance
- Cannot have pending withdrawal

**States:**
- Balance card showing available balance
- Warning if balance < minimum
- Warning if has pending withdrawal
- Withdrawal history list

### 5.2 Admin Screens

#### AdminApplicationsScreen.js
**Path:** `gem-mobile/src/screens/Admin/AdminApplicationsScreen.js`

**Features:**
- Filter tabs: Chờ duyệt | Đã duyệt | Từ chối | Tất cả
- Expandable application cards
- Approve/Reject buttons with confirmation
- Rejection reason modal

**Application Card Display:**
```jsx
<View style={styles.applicationCard}>
  <Badge type={app.application_type} /> // AFFILIATE or CTV
  <Text>{app.full_name}</Text>
  <Text>{app.email}</Text>
  <StatusBadge status={app.status} />

  {expanded && (
    <View>
      <DetailRow label="Phone" value={app.phone} />
      <DetailRow label="Courses" value={app.courses_owned} />
      <DetailRow label="Reason" value={app.reason_for_joining} />

      {app.status === 'pending' && (
        <ActionButtons onApprove={...} onReject={...} />
      )}
    </View>
  )}
</View>
```

#### AdminWithdrawalsScreen.js
**Path:** `gem-mobile/src/screens/Admin/AdminWithdrawalsScreen.js`

**Features:**
- Filter tabs: Chờ duyệt | Đã duyệt | Đang xử lý | Hoàn tất | Từ chối | Tất cả
- Expandable withdrawal cards with partner info
- Bank details display
- Approve → Complete workflow
- Complete modal (requires transaction reference)
- Reject modal (requires reason)

**Withdrawal Status Flow:**
```
pending → approved → processing → completed
            ↓
         rejected (refund balance)
```

### 5.3 Product Affiliate Link Sheet

#### ProductAffiliateLinkSheet.js
**Path:** `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js`

**Triggered from:** Product detail screens, Shop items

**States:**
1. **Loading** - Generating link
2. **Success** - Shows link, commission info, copy/share buttons
3. **Error (Not Approved)** - Shows "Đăng ký Partnership" button
4. **Error (Other)** - Shows error message + retry button

**Success Display:**
```jsx
<View style={styles.linkSheet}>
  <Text style={styles.productName}>{product.name}</Text>
  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>

  <View style={styles.commissionCard}>
    <Text>Hoa hồng của bạn: {commissionRate}%</Text>
    <Text>Thu nhập ước tính: {formatCurrency(estimatedIncome)}</Text>
  </View>

  <View style={styles.linkContainer}>
    <Text selectable>{affiliateLink}</Text>
    <TouchableOpacity onPress={copyLink}>
      <CopyIcon />
    </TouchableOpacity>
  </View>

  <View style={styles.actions}>
    <Button title="Sao chép" onPress={copyLink} />
    <Button title="Chia sẻ" onPress={shareLink} variant="primary" />
  </View>

  <Text style={styles.hint}>
    Chia sẻ link trên mạng xã hội để tăng thu nhập!
  </Text>
</View>
```

---

## 6. SHOPIFY WEBHOOK INTEGRATION

### 6.1 shopify-webhook Edge Function
**Path:** `supabase/functions/shopify-webhook/index.ts`

**Order Processing Flow:**
```
Shopify Order (orders/paid)
    ↓
shopify-webhook function
    ↓
Check for affiliate code in:
  1. Order note_attributes (partner_id)
  2. affiliate_referrals table (by customer email)
    ↓
If affiliate found:
  1. Calculate commission based on role/tier
  2. Create commission record
  3. Update affiliate stats
  4. Trigger partnership-notifications
    ↓
Partner receives push notification
```

**Commission Calculation:**
```typescript
function calculateCommission(orderAmount: number, role: string, tier: string): number {
  if (role === 'affiliate') {
    return orderAmount * 0.03; // 3%
  }

  // CTV rates by tier
  const rates = {
    beginner: 0.10,  // 10%
    growing: 0.15,   // 15%
    master: 0.20,    // 20%
    grand: 0.30,     // 30%
  };

  return orderAmount * (rates[tier] || 0.10);
}
```

### 6.2 Tracking via Affiliate Link

**Link Format:**
```
https://gemral.com/p/{shortCode}?aff={affiliateCode}
```

**Tracking Process:**
1. Customer clicks affiliate link
2. `aff` parameter saved to localStorage/cookie
3. Added to cart as `note_attribute` before checkout
4. Shopify webhook receives order with `partner_id` in note_attributes
5. Commission calculated and recorded

---

## 7. NOTIFICATIONS SYSTEM

### 7.1 partnership-notifications Edge Function
**Path:** `supabase/functions/partnership-notifications/index.ts`

**Event Types:**

| Event | Title | Body |
|-------|-------|------|
| `partnership_approved` | 🎉 Chúc mừng! Bạn đã trở thành {role} | Bắt đầu kiếm {rate} hoa hồng từ mỗi đơn hàng giới thiệu ngay! |
| `partnership_rejected` | 📋 Đơn đăng ký của bạn cần bổ sung | {rejection_reason} |
| `withdrawal_approved` | ✅ Yêu cầu rút tiền đã được duyệt | Số tiền {amount} sẽ được chuyển trong 24h. |
| `withdrawal_completed` | 💰 Đã chuyển tiền thành công! | {amount} đã được chuyển vào tài khoản của bạn. |
| `withdrawal_rejected` | ❌ Yêu cầu rút tiền bị từ chối | Vui lòng kiểm tra thông tin ngân hàng và thử lại. |
| `commission_earned` | 🎊 Bạn vừa nhận hoa hồng! | +{amount} từ đơn hàng #{order_id} |
| `tier_upgrade` | 🚀 Chúc mừng thăng cấp! | Bạn đã lên cấp {tier}! Hoa hồng tăng lên rồi! |

### 7.2 notificationService.js Integration
**Path:** `gem-mobile/src/services/notificationService.js`

**Notification Channels:**
```javascript
// Android channels
await Notifications.setNotificationChannelAsync('orders', {
  name: 'Đơn hàng',
  importance: HIGH,
});

await Notifications.setNotificationChannelAsync('alerts', {
  name: 'Cảnh báo',
  importance: HIGH,
});
```

**Type to Category Mapping:**
```javascript
TYPE_TO_CATEGORY = {
  partnership_approved: 'system',
  partnership_rejected: 'system',
  withdrawal_approved: 'system',
  withdrawal_completed: 'system',
  withdrawal_rejected: 'system',
  commission_earned: 'system',
}
```

---

## 8. DESIGN SPECIFICATIONS

### 8.1 Color Palette

```javascript
// Partner Type Colors
AFFILIATE_COLOR = '#2196F3'     // Blue
CTV_COLOR = '#9C27B0'           // Purple

// Status Colors
STATUS_COLORS = {
  pending: '#FF9800',    // Orange
  approved: '#4CAF50',   // Green
  rejected: '#FF5252',   // Red
  processing: '#9C27B0', // Purple
  completed: '#4CAF50',  // Green
}

// Tier Colors
TIER_COLORS = {
  beginner: COLORS.textMuted,   // Gray
  growing: COLORS.info,         // Blue
  master: COLORS.gold,          // Gold
  grand: COLORS.burgundy,       // Burgundy
}

// Commission Colors
COMMISSION_SUCCESS = COLORS.gold      // #FFBD59
COMMISSION_PENDING = COLORS.warning   // Orange
```

### 8.2 Typography

```javascript
// Section Titles
sectionTitle: {
  fontSize: TYPOGRAPHY.fontSize.lg,      // 18
  fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
  color: COLORS.gold,
}

// Stat Values
statValue: {
  fontSize: 18,
  fontWeight: '700',
  color: COLORS.textPrimary,
}

// Commission Amount
commissionAmount: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.gold,
}

// Badge Text
badgeText: {
  fontSize: 10,
  fontWeight: '700',
  textTransform: 'uppercase',
}
```

### 8.3 Card Styles

```javascript
// Glass Card (Standard)
glassCard: {
  backgroundColor: GLASS.background,  // rgba(15, 16, 48, 0.55)
  borderRadius: GLASS.borderRadius,   // 18
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.3)',  // Gold border
  padding: SPACING.lg,
}

// Stat Card
statCard: {
  width: '48%',
  backgroundColor: GLASS.background,
  borderRadius: 14,
  padding: SPACING.md,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.3)',
}

// Application Card
applicationCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  marginBottom: 8,
  overflow: 'hidden',
}
```

### 8.4 Button Styles

```javascript
// Primary Button (Gold)
primaryButton: {
  backgroundColor: COLORS.gold,
  paddingVertical: SPACING.md,
  borderRadius: 12,
}

// Approve Button
approveButton: {
  backgroundColor: 'rgba(76, 175, 80, 0.3)',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
  borderRadius: 8,
  gap: 4,
}

// Reject Button
rejectButton: {
  backgroundColor: COLORS.burgundy,
  // Same layout as approve
}

// Copy Button
copyButton: {
  backgroundColor: COLORS.burgundy,
  paddingVertical: SPACING.md,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

// Copy Link Button (Outline)
copyLinkButton: {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: COLORS.gold,
}
```

### 8.5 Status Badge Styles

```javascript
statusBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
  backgroundColor: `${getStatusColor(status)}20`, // 20% opacity
}

statusText: {
  fontSize: 10,
  fontWeight: '600',
  color: getStatusColor(status),
}
```

### 8.6 Progress Bar

```javascript
// Tier Progress Bar
progressBar: {
  height: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  overflow: 'hidden',
}

progressFill: {
  height: '100%',
  backgroundColor: COLORS.gold,
  borderRadius: 4,
}
```

### 8.7 Modal Styles

```javascript
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: SPACING.md,
}

modalContent: {
  backgroundColor: '#1a1a2e',
  borderRadius: 14,
  padding: SPACING.lg,
  width: '100%',
  maxWidth: 360,
}

modalInput: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 10,
  padding: SPACING.sm,
  color: '#FFF',
  fontSize: 13,
  minHeight: 80,
}
```

---

## 9. USER FLOWS

### 9.1 Registration Flow
```
User opens Account Tab
    ↓
AffiliateSection shows registration options
    ↓
User taps "Đăng Ký" (Affiliate or CTV)
    ↓
PartnershipRegistrationScreen
    ↓
Fill form → Submit
    ↓
Application saved with status='pending'
    ↓
AffiliateSection shows "Đang Chờ Phê Duyệt"
```

### 9.2 Admin Approval Flow
```
Admin opens AdminApplicationsScreen
    ↓
Filter by "Chờ duyệt"
    ↓
Expand application → Review details
    ↓
├── Approve → Confirm dialog
│       ↓
│   RPC: approve_partnership_application()
│       ↓
│   Creates affiliate_profiles record
│   Updates profiles.affiliate_code
│   Sends push notification
│       ↓
│   User receives "Chúc mừng!" notification
│
└── Reject → Enter reason → Confirm
        ↓
    RPC: reject_partnership_application()
        ↓
    User receives "Cần bổ sung" notification
```

### 9.3 Product Affiliate Link Flow
```
User views product → Taps "Link Affiliate"
    ↓
ProductAffiliateLinkSheet opens
    ↓
affiliateService.checkPartnershipApproval()
    ↓
├── NOT APPROVED → Show error + "Đăng ký Partnership" button
│
└── APPROVED → Generate link
        ↓
    affiliateService.generateProductAffiliateLink()
        ↓
    Display link, commission rate, estimated income
        ↓
    User copies/shares link
```

### 9.4 Commission Tracking Flow
```
Customer clicks affiliate link
    ↓
aff={code} saved to session
    ↓
Customer completes checkout on Shopify
    ↓
Shopify sends orders/paid webhook
    ↓
shopify-webhook function:
  1. Find affiliate by code
  2. Calculate commission
  3. Create commission record
  4. Update affiliate stats
  5. Call partnership-notifications
    ↓
Partner receives push: "🎊 +{amount} từ đơn #{order}"
```

### 9.5 Withdrawal Flow
```
Partner opens WithdrawRequestScreen
    ↓
Enter amount + bank details
    ↓
Submit → Confirm dialog
    ↓
RPC: request_withdrawal()
    ↓
Balance deducted, request created
    ↓
Admin sees in AdminWithdrawalsScreen
    ↓
Approve → Complete (enter transaction ref)
    ↓
Partner receives "💰 Đã chuyển tiền thành công!"
```

---

## 10. FILES SUMMARY

### Services
- `gem-mobile/src/services/affiliateService.js`
- `gem-mobile/src/services/partnershipService.js`
- `gem-mobile/src/services/notificationService.js`
- `gem-mobile/src/services/withdrawService.js`

### User Screens
- `gem-mobile/src/screens/tabs/components/AffiliateSection.js`
- `gem-mobile/src/screens/Account/PartnershipRegistrationScreen.js`
- `gem-mobile/src/screens/Account/AffiliateDetailScreen.js`
- `gem-mobile/src/screens/Account/WithdrawRequestScreen.js`

### Admin Screens
- `gem-mobile/src/screens/Admin/AdminApplicationsScreen.js`
- `gem-mobile/src/screens/Admin/AdminWithdrawalsScreen.js`

### Components
- `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js`

### Edge Functions
- `supabase/functions/shopify-webhook/index.ts`
- `supabase/functions/partnership-notifications/index.ts`

### Database Migrations
- `supabase/migrations/20251126_partnership_system.sql`
- `supabase/migrations/20251127_extend_affiliate_codes_for_products.sql`
- `supabase/migrations/20251130_withdrawal_system.sql`
- `supabase/migrations/20251129_commission_sales_table.sql`

---

## 11. SECURITY

### 11.1 RLS Policies
- Users can only view/manage their own partnership data
- Admin can view all applications/withdrawals
- Commission records protected by user_id

### 11.2 Approval Gate
- **CRITICAL:** Affiliate links ONLY generated for users with approved partnership
- `checkPartnershipApproval()` verifies status before generating any links
- Non-approved users shown "Đăng ký Partnership" prompt

### 11.3 Withdrawal Validation
- Minimum amount: 100,000 VND
- Cannot exceed available balance
- Only one pending withdrawal at a time
- Rejection refunds balance automatically

---

**END OF FEATURE SPEC**

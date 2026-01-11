# 📜 QUY CHẾ CHÍNH THỨC - HỆ THỐNG PARTNERSHIP GEM
## Official Reference Document for Code Implementation

**Version:** 3.0  
**Ngày ban hành:** 28/12/2024  
**Trạng thái:** CHÍNH THỨC - EFFECTIVE IMMEDIATELY  
**Mục đích:** Làm bản đối chiếu reference và hệ quy chiếu để viết code logic tính toán

---

## 📋 MỤC LỤC

1. [Định Nghĩa & Thuật Ngữ](#1-định-nghĩa--thuật-ngữ)
2. [Chương Trình CTV (Đối Tác Phát Triển)](#2-chương-trình-ctv-đối-tác-phát-triển)
3. [Chương Trình KOL Affiliate](#3-chương-trình-kol-affiliate)
4. [Hệ Thống Sub-Affiliate](#4-hệ-thống-sub-affiliate)
5. [Quy Tắc Thăng/Giảm Cấp](#5-quy-tắc-thănggiảm-cấp)
6. [Lịch Thanh Toán](#6-lịch-thanh-toán)
7. [Công Thức Tính Toán](#7-công-thức-tính-toán)
8. [Constants & Enums](#8-constants--enums)
9. [Database Schema](#9-database-schema)
10. [API Reference](#10-api-reference)

---

## 1. ĐỊNH NGHĨA & THUẬT NGỮ

### 1.1 Thuật Ngữ

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **CTV** | Cộng Tác Viên / Đối Tác Phát Triển |
| **KOL** | Key Opinion Leader - Người có ảnh hưởng |
| **Digital Product** | Sản phẩm số (khóa học, subscription, ebook) |
| **Physical Product** | Sản phẩm vật lý (crystal, jewelry) |
| **Commission** | Hoa hồng trực tiếp từ đơn hàng |
| **Sub-Affiliate** | Hoa hồng gián tiếp từ đối tác được giới thiệu |
| **Threshold** | Ngưỡng doanh số để thăng cấp |
| **Total Sales** | Tổng doanh số tích lũy từ trước đến nay |
| **Monthly Sales** | Doanh số trong tháng hiện tại |

### 1.2 Phân Loại Sản Phẩm

```javascript
const PRODUCT_TYPES = {
  // Digital Products (commission cao hơn)
  DIGITAL: ['course', 'subscription', 'ebook', 'digital_product'],
  
  // Physical Products (commission thấp hơn)
  PHYSICAL: ['crystal', 'jewelry', 'physical_product']
};

// Function kiểm tra loại sản phẩm
function isDigitalProduct(productType) {
  return PRODUCT_TYPES.DIGITAL.includes(productType);
}
```

---

## 2. CHƯƠNG TRÌNH CTV (ĐỐI TÁC PHÁT TRIỂN)

### 2.1 Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│  CHƯƠNG TRÌNH CTV (ĐỐI TÁC PHÁT TRIỂN)                          │
├─────────────────────────────────────────────────────────────────┤
│  • Đối tượng: Tất cả users                                      │
│  • Điều kiện: Không có (ai cũng đăng ký được)                   │
│   
│  • Tier khởi đầu: 🥉 Bronze (Đồng)                               │
│  • Thăng cấp: Dựa trên tổng doanh số (total_sales)              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Bảng Cấp Bậc & Hoa Hồng (OFFICIAL)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BẢNG CẤP BẬC CTV - CHÍNH THỨC                                │
├───────┬──────────────┬─────────────────┬──────────┬──────────┬─────────┬────────┤
│ TIER  │ TÊN TIẾNG    │ THRESHOLD       │ DIGITAL  │ PHYSICAL │ SUB-AFF │ PAYMENT│
│       │ VIỆT (ICON)  │ (VND)           │          │          │         │        │
├───────┼──────────────┼─────────────────┼──────────┼──────────┼─────────┼────────┤
│bronze │ Đồng (🥉)    │ 0               │ 10%      │ 6%       │ 2%      │Monthly │
│silver │ Bạc (🥈)     │ 50,000,000      │ 15%      │ 8%       │ 2.5%    │Monthly │
│gold   │ Vàng (🥇)    │ 150,000,000     │ 20%      │ 10%      │ 3%      │Biweekly│
│platinum│Bạch Kim (💎)│ 400,000,000     │ 25%      │ 12%      │ 3.5%    │Weekly  │
│diamond│ Kim Cương(👑)│ 800,000,000     │ 30%      │ 15%      │ 4%      │Weekly  │
└───────┴──────────────┴─────────────────┴──────────┴──────────┴─────────┴────────┘
```

### 2.3 Constants (Code Reference)

```javascript
/**
 * CTV TIER CONFIGURATION - OFFICIAL
 * @description Cấu hình chính thức cho các cấp CTV
 * @version 3.0
 * @lastUpdated 2024-12-28
 */
const CTV_TIER_CONFIG = {
  bronze: {
    key: 'bronze',
    name: 'Đồng',
    icon: '🥉',
    color: '#CD7F32',
    threshold: 0,
    commission: {
      digital: 0.10,    // 10%
      physical: 0.06,   // 6%
    },
    subAffiliate: 0.02, // 2%
    paymentSchedule: 'monthly',
    order: 1,
  },
  silver: {
    key: 'silver',
    name: 'Bạc',
    icon: '🥈',
    color: '#C0C0C0',
    threshold: 50000000, // 50M VND
    commission: {
      digital: 0.15,    // 15%
      physical: 0.08,   // 8%
    },
    subAffiliate: 0.025, // 2.5%
    paymentSchedule: 'monthly',
    order: 2,
  },
  gold: {
    key: 'gold',
    name: 'Vàng',
    icon: '🥇',
    color: '#FFD700',
    threshold: 150000000, // 150M VND
    commission: {
      digital: 0.20,    // 20%
      physical: 0.10,   // 10%
    },
    subAffiliate: 0.03, // 3%
    paymentSchedule: 'biweekly',
    order: 3,
  },
  platinum: {
    key: 'platinum',
    name: 'Bạch Kim',
    icon: '💎',
    color: '#E5E4E2',
    threshold: 400000000, // 400M VND
    commission: {
      digital: 0.25,    // 25%
      physical: 0.12,   // 12%
    },
    subAffiliate: 0.035, // 3.5%
    paymentSchedule: 'weekly',
    order: 4,
  },
  diamond: {
    key: 'diamond',
    name: 'Kim Cương',
    icon: '👑',
    color: '#00F0FF',
    threshold: 800000000, // 800M VND
    commission: {
      digital: 0.30,    // 30%
      physical: 0.15,   // 15%
    },
    subAffiliate: 0.04, // 4%
    paymentSchedule: 'weekly',
    order: 5,
  },
};

// Thứ tự tier (để so sánh)
const CTV_TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
```

---

## 3. CHƯƠNG TRÌNH KOL AFFILIATE

### 3.1 Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│  CHƯƠNG TRÌNH KOL AFFILIATE                                     │
├─────────────────────────────────────────────────────────────────┤
│  • Vị trí: Chương trình dành cho influencers                    │
│  • Điều kiện: 20,000+ followers (BẮT BUỘC)                      │
│    ⚠️ Dù đã là CTV vẫn PHẢI có 20K+ followers                   │
│    ⚠️ Không có bất kỳ ngoại lệ nào                              │
│
│  • Commission: 20% (cả digital và physical)                     │
│  • Sub-affiliate: 3.5%                                          │
│  • Payment: Bi-weekly (2 lần/tháng)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Bảng Hoa Hồng KOL (OFFICIAL)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    KOL AFFILIATE - CHÍNH THỨC                                   │
├─────────────────┬───────────────┬───────────────┬───────────────┬───────────────┤
│ LOẠI            │ DIGITAL       │ PHYSICAL      │ SUB-AFF       │ PAYMENT       │
├─────────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ KOL Affiliate   │ 20%           │ 20%           │ 3.5%          │ Bi-weekly     │
├─────────────────┴───────────────┴───────────────┴───────────────┴───────────────┤
│ TỔNG TIỀM NĂNG: 20% + 3.5% = 23.5%                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Constants (Code Reference)

```javascript
/**
 * KOL AFFILIATE CONFIGURATION - OFFICIAL
 * @description Cấu hình chính thức cho KOL Affiliate
 * @version 3.0
 * @lastUpdated 2024-12-28
 */
const KOL_CONFIG = {
  key: 'kol',
  name: 'KOL Affiliate',
  icon: '⭐',
  color: '#9C27B0',
  
  // Điều kiện đăng ký (BẮT BUỘC 20K+ followers)
  requirements: {
    minFollowers: 20000,  // 20K followers - BẮT BUỘC
    // ❌ ĐÃ BỎ: orIsCTV - Không có ngoại lệ cho CTV
  },
  
  // Commission rates (đồng nhất cho cả digital và physical)
  commission: {
    digital: 0.20,    // 20%
    physical: 0.20,   // 20%
  },
  
  subAffiliate: 0.035, // 3.5%
  paymentSchedule: 'biweekly',
  
  // Social platforms được chấp nhận
  acceptedPlatforms: ['youtube', 'facebook', 'instagram', 'tiktok', 'twitter', 'discord', 'telegram'],
};
```

### 3.4 Điều Kiện Đăng Ký KOL

```javascript
/**
 * Kiểm tra user có đủ điều kiện đăng ký KOL không
 * 
 * ⚠️ LOGIC ĐÃ SỬA (v3.0.1):
 * - CHỈ check followers >= 20,000
 * - KHÔNG có ngoại lệ cho CTV
 * - Dù đã là CTV vẫn PHẢI có 20K+ followers
 * 
 * @param {Object} socialStats - Thống kê mạng xã hội { youtube: 10000, facebook: 5000, ... }
 * @returns {Object} { eligible: boolean, reason: string }
 */
function checkKOLEligibility(socialStats) {
  const MIN_FOLLOWERS = 20000;
  
  // Tính tổng followers
  const totalFollowers = Object.values(socialStats || {}).reduce((sum, count) => sum + count, 0);
  
  // ⚠️ CHỈ CHECK FOLLOWERS, KHÔNG CÓ NGOẠI LỆ CHO CTV
  if (totalFollowers >= MIN_FOLLOWERS) {
    return {
      eligible: true,
      reason: `Đủ điều kiện: ${formatNumber(totalFollowers)} followers`,
      condition: 'has_followers'
    };
  }
  
  const remaining = MIN_FOLLOWERS - totalFollowers;
  return {
    eligible: false,
    reason: `Cần thêm ${formatNumber(remaining)} followers (hiện có ${formatNumber(totalFollowers)}/20,000)`,
    condition: 'not_eligible',
    details: {
      currentFollowers: totalFollowers,
      requiredFollowers: MIN_FOLLOWERS,
      remainingFollowers: remaining
    }
  };
}
```

---

## 4. HỆ THỐNG SUB-AFFILIATE

### 4.1 Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│  HỆ THỐNG SUB-AFFILIATE (1 CẤP)                                 │
├─────────────────────────────────────────────────────────────────┤
│  • Cấu trúc: Chỉ 1 level (không phải MLM)                       │
│  • Cách hoạt động:                                              │
│    - A giới thiệu B đăng ký CTV/KOL                             │
│    - B bán hàng → B nhận commission chính                       │
│    - A nhận sub-affiliate % từ doanh số của B                   │
│  • Tracking: Qua referral_code khi đăng ký                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Bảng Sub-Affiliate Rate

```
┌─────────────────────────────────────────────────────────────────┐
│  SUB-AFFILIATE RATES - CHÍNH THỨC                               │
├─────────────────────────────────────────────────────────────────┤
│  NGƯỜI GIỚI THIỆU (A)     │  SUB-AFF RATE                       │
├───────────────────────────┼─────────────────────────────────────┤
│  CTV Bronze               │  2.0%                               │
│  CTV Silver               │  2.5%                               │
│  CTV Gold                 │  3.0%                               │
│  CTV Platinum             │  3.5%                               │
│  CTV Diamond              │  4.0%                               │
│  KOL Affiliate            │  3.5%                               │
└─────────────────────────────────────────────────────────────────┘

Lưu ý: Sub-affiliate rate của A không phụ thuộc vào tier của B
```

### 4.3 Ví Dụ Tính Toán

```
Scenario:
- A (CTV Gold) giới thiệu B đăng ký CTV
- B (CTV Bronze) bán sản phẩm digital 10,000,000 VND

Tính toán:
┌─────────────────────────────────────────────────────────────────┐
│  B nhận commission: 10,000,000 × 10% = 1,000,000 VND            │
│  A nhận sub-aff:    10,000,000 × 3%  = 300,000 VND              │
│  ─────────────────────────────────────────────────────────────  │
│  Tổng chi trả:      1,300,000 VND                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. QUY TẮC THĂNG/GIẢM CẤP

### 5.1 Quy Tắc Thăng Cấp (UPGRADE)

```
┌─────────────────────────────────────────────────────────────────┐
│  UPGRADE RULES - CHÍNH THỨC                                     │
├─────────────────────────────────────────────────────────────────┤
│  Tần suất kiểm tra:  Weekly (mỗi Thứ 2, 00:00 UTC+7)            │
│  Điều kiện:          total_sales >= threshold tier tiếp theo    │
│  Hiệu lực:           Ngay lập tức                               │
│  Tự động:            Có (scheduled job)                         │
│  Notification:       Push + In-app                              │
└─────────────────────────────────────────────────────────────────┘
```

**Logic Code:**

```javascript
/**
 * Kiểm tra và xử lý upgrade tier
 * @param {string} userId - User ID
 * @returns {Object} { upgraded: boolean, oldTier: string, newTier: string }
 */
async function checkAndUpgradeTier(userId) {
  const profile = await getAffiliateProfile(userId);
  
  if (profile.role !== 'ctv') return { upgraded: false };
  
  const currentTier = profile.ctv_tier;
  const totalSales = profile.total_sales;
  
  // Tìm tier cao nhất mà user đủ điều kiện
  let newTier = currentTier;
  for (const tier of CTV_TIER_ORDER) {
    if (totalSales >= CTV_TIER_CONFIG[tier].threshold) {
      newTier = tier;
    }
  }
  
  if (newTier !== currentTier && 
      CTV_TIER_CONFIG[newTier].order > CTV_TIER_CONFIG[currentTier].order) {
    // Upgrade
    await updateTier(userId, newTier);
    await sendUpgradeNotification(userId, currentTier, newTier);
    
    return {
      upgraded: true,
      oldTier: currentTier,
      newTier: newTier,
    };
  }
  
  return { upgraded: false };
}
```

### 5.2 Quy Tắc Giảm Cấp (DOWNGRADE)

```
┌─────────────────────────────────────────────────────────────────┐
│  DOWNGRADE RULES - CHÍNH THỨC                                   │
├─────────────────────────────────────────────────────────────────┤
│  Tần suất kiểm tra:  Monthly (ngày cuối tháng, 23:59 UTC+7)     │
│  Điều kiện:          monthly_sales < 10% threshold hiện tại     │
│  Giảm:               1 tier mỗi lần                             │
│  Tự động:            Có (scheduled job)                         │
│  Notification:       Push + In-app (với lời nhắc)               │
│  Bảo vệ:             Bronze không thể giảm thêm                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logic Code:**

```javascript
/**
 * Kiểm tra và xử lý downgrade tier (cuối tháng)
 * @param {string} userId - User ID
 * @returns {Object} { downgraded: boolean, oldTier: string, newTier: string }
 */
async function checkAndDowngradeTier(userId) {
  const profile = await getAffiliateProfile(userId);
  
  if (profile.role !== 'ctv') return { downgraded: false };
  if (profile.ctv_tier === 'bronze') return { downgraded: false }; // Không giảm dưới Bronze
  
  const currentTier = profile.ctv_tier;
  const monthlySales = profile.monthly_sales;
  const currentThreshold = CTV_TIER_CONFIG[currentTier].threshold;
  
  // Điều kiện downgrade: doanh số tháng < 10% threshold hiện tại
  const minRequired = currentThreshold * 0.10;
  
  if (monthlySales < minRequired) {
    // Giảm 1 tier
    const currentIndex = CTV_TIER_ORDER.indexOf(currentTier);
    const newTier = CTV_TIER_ORDER[currentIndex - 1];
    
    await updateTier(userId, newTier);
    await sendDowngradeNotification(userId, currentTier, newTier);
    
    return {
      downgraded: true,
      oldTier: currentTier,
      newTier: newTier,
    };
  }
  
  return { downgraded: false };
}

/**
 * Reset monthly_sales vào đầu tháng
 */
async function resetMonthlySales() {
  await supabase
    .from('affiliate_profiles')
    .update({ monthly_sales: 0 })
    .neq('role', null);
}
```

### 5.3 Bảng Điều Kiện Giữ Cấp

| Tier | Threshold | Min Monthly (10%) | Để giữ cấp |
|------|-----------|-------------------|------------|
| 🥉 Bronze | 0 | 0 | Luôn giữ |
| 🥈 Silver | 50M | 5M | ≥ 5M/tháng |
| 🥇 Gold | 150M | 15M | ≥ 15M/tháng |
| 💎 Platinum | 400M | 40M | ≥ 40M/tháng |
| 👑 Diamond | 800M | 80M | ≥ 80M/tháng |

---

## 6. LỊCH THANH TOÁN

### 6.1 Bảng Lịch Thanh Toán

```
┌─────────────────────────────────────────────────────────────────┐
│  PAYMENT SCHEDULE - CHÍNH THỨC                                  │
├─────────────────────────────────────────────────────────────────┤
│  TIER/ROLE          │  TẦN SUẤT    │  NGÀY THANH TOÁN          │
├─────────────────────┼──────────────┼───────────────────────────┤
│  🥉 Bronze          │  Monthly     │  Ngày 15 hàng tháng       │
│  🥈 Silver          │  Monthly     │  Ngày 15 hàng tháng       │
│  🥇 Gold            │  Bi-weekly   │  Ngày 1 và 15             │
│  💎 Platinum        │  Weekly      │  Thứ 2 hàng tuần          │
│  👑 Diamond         │  Weekly      │  Thứ 2 hàng tuần          │
│  KOL Affiliate      │  Bi-weekly   │  Ngày 1 và 15             │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Quy Định Rút Tiền

```
┌─────────────────────────────────────────────────────────────────┐
│  WITHDRAWAL RULES - CHÍNH THỨC                                  │
├─────────────────────────────────────────────────────────────────┤
│  Minimum:            100,000 VND                                │
│  Maximum:            Không giới hạn (= available_balance)       │
│  Pending limit:      1 yêu cầu tại 1 thời điểm                  │
│  Processing time:    1-3 ngày làm việc                          │
│  Refund on reject:   Tự động hoàn lại available_balance         │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Constants (Code Reference)

```javascript
const PAYMENT_CONFIG = {
  minWithdrawal: 100000, // 100K VND
  maxPendingRequests: 1,
  processingDays: 3,
  
  schedules: {
    monthly: {
      name: 'Hàng tháng',
      days: [15], // Ngày 15
    },
    biweekly: {
      name: 'Nửa tháng',
      days: [1, 15], // Ngày 1 và 15
    },
    weekly: {
      name: 'Hàng tuần',
      dayOfWeek: 1, // Thứ 2 (0 = CN, 1 = T2, ...)
    },
  },
};
```

---

## 7. CÔNG THỨC TÍNH TOÁN

### 7.1 Tính Commission Đơn Hàng

```javascript
/**
 * Tính commission cho đơn hàng
 * @param {number} orderAmount - Giá trị đơn hàng (VND)
 * @param {string} productType - Loại sản phẩm ('digital' hoặc 'physical')
 * @param {string} role - Role của affiliate ('ctv' hoặc 'kol')
 * @param {string} tier - Tier của CTV (nếu role = 'ctv')
 * @returns {Object} { commission, rate }
 */
function calculateCommission(orderAmount, productType, role, tier = 'bronze') {
  let rate;
  
  if (role === 'kol') {
    // KOL: 20% cho cả digital và physical
    rate = KOL_CONFIG.commission[productType] || 0.20;
  } else {
    // CTV: Theo tier và loại sản phẩm
    const tierConfig = CTV_TIER_CONFIG[tier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    
    const type = isDigitalProduct(productType) ? 'digital' : 'physical';
    rate = tierConfig.commission[type];
  }
  
  const commission = Math.round(orderAmount * rate);
  
  return {
    commission,
    rate,
    ratePercent: `${(rate * 100).toFixed(1)}%`,
  };
}
```

### 7.2 Tính Sub-Affiliate Commission

```javascript
/**
 * Tính sub-affiliate commission
 * @param {number} orderAmount - Giá trị đơn hàng (VND)
 * @param {string} referrerRole - Role của người giới thiệu
 * @param {string} referrerTier - Tier của người giới thiệu (nếu CTV)
 * @returns {Object} { subCommission, rate }
 */
function calculateSubAffiliateCommission(orderAmount, referrerRole, referrerTier = 'bronze') {
  let rate;
  
  if (referrerRole === 'kol') {
    rate = KOL_CONFIG.subAffiliate; // 3.5%
  } else {
    const tierConfig = CTV_TIER_CONFIG[referrerTier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${referrerTier}`);
    }
    rate = tierConfig.subAffiliate;
  }
  
  const subCommission = Math.round(orderAmount * rate);
  
  return {
    subCommission,
    rate,
    ratePercent: `${(rate * 100).toFixed(1)}%`,
  };
}
```

### 7.3 Tính Tổng Chi Trả Cho Đơn Hàng

```javascript
/**
 * Tính tổng chi trả commission cho 1 đơn hàng
 * @param {Object} order - Order data
 * @param {Object} affiliate - Affiliate data (người bán)
 * @param {Object} referrer - Referrer data (người giới thiệu affiliate, nếu có)
 * @returns {Object} { affiliateCommission, subAffiliateCommission, total }
 */
function calculateOrderPayouts(order, affiliate, referrer = null) {
  const { amount, productType } = order;
  
  // Commission cho affiliate (người bán)
  const { commission: affiliateCommission, rate: affiliateRate } = 
    calculateCommission(amount, productType, affiliate.role, affiliate.ctv_tier);
  
  // Sub-affiliate commission (nếu có người giới thiệu)
  let subAffiliateCommission = 0;
  let subAffiliateRate = 0;
  
  if (referrer && referrer.id !== affiliate.id) {
    const result = calculateSubAffiliateCommission(
      amount, 
      referrer.role, 
      referrer.ctv_tier
    );
    subAffiliateCommission = result.subCommission;
    subAffiliateRate = result.rate;
  }
  
  return {
    orderAmount: amount,
    productType,
    
    // Affiliate (người bán)
    affiliate: {
      id: affiliate.id,
      role: affiliate.role,
      tier: affiliate.ctv_tier,
      commission: affiliateCommission,
      rate: affiliateRate,
    },
    
    // Sub-affiliate (người giới thiệu)
    subAffiliate: referrer ? {
      id: referrer.id,
      role: referrer.role,
      tier: referrer.ctv_tier,
      commission: subAffiliateCommission,
      rate: subAffiliateRate,
    } : null,
    
    // Tổng
    totalPayout: affiliateCommission + subAffiliateCommission,
  };
}
```

### 7.4 Xác Định Tier Dựa Trên Doanh Số

```javascript
/**
 * Xác định tier dựa trên tổng doanh số
 * @param {number} totalSales - Tổng doanh số (VND)
 * @returns {string} Tier key
 */
function determineTierByTotalSales(totalSales) {
  let resultTier = 'bronze';
  
  for (const tier of CTV_TIER_ORDER) {
    if (totalSales >= CTV_TIER_CONFIG[tier].threshold) {
      resultTier = tier;
    } else {
      break;
    }
  }
  
  return resultTier;
}

/**
 * Tính progress đến tier tiếp theo
 * @param {string} currentTier - Tier hiện tại
 * @param {number} totalSales - Tổng doanh số
 * @returns {Object} { nextTier, progress, remaining }
 */
function calculateTierProgress(currentTier, totalSales) {
  const currentIndex = CTV_TIER_ORDER.indexOf(currentTier);
  
  // Đã là tier cao nhất
  if (currentIndex === CTV_TIER_ORDER.length - 1) {
    return {
      nextTier: null,
      progress: 100,
      remaining: 0,
    };
  }
  
  const nextTier = CTV_TIER_ORDER[currentIndex + 1];
  const currentThreshold = CTV_TIER_CONFIG[currentTier].threshold;
  const nextThreshold = CTV_TIER_CONFIG[nextTier].threshold;
  
  const range = nextThreshold - currentThreshold;
  const current = totalSales - currentThreshold;
  const progress = Math.min(100, Math.round((current / range) * 100));
  const remaining = Math.max(0, nextThreshold - totalSales);
  
  return {
    nextTier,
    nextTierName: CTV_TIER_CONFIG[nextTier].name,
    nextThreshold,
    progress,
    remaining,
  };
}
```

---

## 8. CONSTANTS & ENUMS

### 8.1 Complete Constants File

```javascript
/**
 * GEM PARTNERSHIP CONSTANTS - OFFICIAL v3.0
 * @description Tất cả constants cho hệ thống Partnership
 * @lastUpdated 2024-12-28
 */

// ============================================================
// ROLES
// ============================================================
export const PARTNERSHIP_ROLES = {
  CTV: 'ctv',
  KOL: 'kol',
};

// ============================================================
// CTV TIERS
// ============================================================
export const CTV_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
};

export const CTV_TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export const CTV_TIER_CONFIG = {
  bronze: {
    key: 'bronze',
    name: 'Đồng',
    icon: '🥉',
    color: '#CD7F32',
    threshold: 0,
    commission: { digital: 0.10, physical: 0.06 },
    subAffiliate: 0.02,
    paymentSchedule: 'monthly',
    order: 1,
  },
  silver: {
    key: 'silver',
    name: 'Bạc',
    icon: '🥈',
    color: '#C0C0C0',
    threshold: 50000000,
    commission: { digital: 0.15, physical: 0.08 },
    subAffiliate: 0.025,
    paymentSchedule: 'monthly',
    order: 2,
  },
  gold: {
    key: 'gold',
    name: 'Vàng',
    icon: '🥇',
    color: '#FFD700',
    threshold: 150000000,
    commission: { digital: 0.20, physical: 0.10 },
    subAffiliate: 0.03,
    paymentSchedule: 'biweekly',
    order: 3,
  },
  platinum: {
    key: 'platinum',
    name: 'Bạch Kim',
    icon: '💎',
    color: '#E5E4E2',
    threshold: 400000000,
    commission: { digital: 0.25, physical: 0.12 },
    subAffiliate: 0.035,
    paymentSchedule: 'weekly',
    order: 4,
  },
  diamond: {
    key: 'diamond',
    name: 'Kim Cương',
    icon: '👑',
    color: '#00F0FF',
    threshold: 800000000,
    commission: { digital: 0.30, physical: 0.15 },
    subAffiliate: 0.04,
    paymentSchedule: 'weekly',
    order: 5,
  },
};

// ============================================================
// KOL CONFIG
// ============================================================
export const KOL_CONFIG = {
  key: 'kol',
  name: 'KOL Affiliate',
  icon: '⭐',
  color: '#9C27B0',
  requirements: {
    minFollowers: 20000,
    // ❌ ĐÃ BỎ: orIsCTV - Không có ngoại lệ cho CTV
  },
  commission: { digital: 0.20, physical: 0.20 },
  subAffiliate: 0.035,
  paymentSchedule: 'biweekly',
  acceptedPlatforms: ['youtube', 'facebook', 'instagram', 'tiktok', 'twitter', 'discord', 'telegram'],
};

// ============================================================
// PRODUCT TYPES
// ============================================================
export const PRODUCT_TYPES = {
  DIGITAL: ['course', 'subscription', 'ebook', 'digital_product'],
  PHYSICAL: ['crystal', 'jewelry', 'physical_product'],
};

// ============================================================
// PAYMENT CONFIG
// ============================================================
export const PAYMENT_CONFIG = {
  minWithdrawal: 100000,
  maxPendingRequests: 1,
  processingDays: 3,
  schedules: {
    monthly: { name: 'Hàng tháng', days: [15] },
    biweekly: { name: 'Nửa tháng', days: [1, 15] },
    weekly: { name: 'Hàng tuần', dayOfWeek: 1 },
  },
};

// ============================================================
// APPLICATION CONFIG
// ============================================================
export const APPLICATION_CONFIG = {
  ctv: {
    autoApprove: true,
    autoApproveDays: 3,
  },
  kol: {
    autoApprove: false,
    requiresAdminReview: true,
  },
};

// ============================================================
// STATUS
// ============================================================
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
};

// ============================================================
// TIER EVALUATION
// ============================================================
export const TIER_EVALUATION = {
  upgrade: {
    frequency: 'weekly',
    dayOfWeek: 1, // Thứ 2
    time: '00:00',
  },
  downgrade: {
    frequency: 'monthly',
    dayOfMonth: -1, // Ngày cuối tháng
    time: '23:59',
    minMonthlyPercentage: 0.10, // 10% của threshold
  },
};
```

---

## 9. DATABASE SCHEMA

### 9.1 Updated affiliate_profiles Table

```sql
-- ============================================================
-- AFFILIATE_PROFILES TABLE - v3.0
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Role: 'ctv' hoặc 'kol'
  role VARCHAR(20) DEFAULT 'ctv' CHECK (role IN ('ctv', 'kol')),
  
  -- CTV Tier: bronze, silver, gold, platinum, diamond
  ctv_tier VARCHAR(20) DEFAULT 'bronze' 
    CHECK (ctv_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  
  -- Sub-affiliate tracking
  referred_by UUID REFERENCES auth.users(id),
  
  -- Stats
  total_sales DECIMAL(15,2) DEFAULT 0,          -- Tổng doanh số (để xét upgrade)
  monthly_sales DECIMAL(15,2) DEFAULT 0,        -- Doanh số tháng (để xét downgrade)
  total_commission DECIMAL(15,2) DEFAULT 0,     -- Tổng hoa hồng đã nhận
  available_balance DECIMAL(15,2) DEFAULT 0,    -- Số dư khả dụng
  sub_affiliate_earnings DECIMAL(15,2) DEFAULT 0, -- Tổng thu nhập từ sub-affiliate
  
  -- Tier evaluation
  last_tier_check_at TIMESTAMPTZ,
  last_upgrade_at TIMESTAMPTZ,
  last_downgrade_at TIMESTAMPTZ,
  
  -- Payment
  payment_schedule VARCHAR(20) DEFAULT 'monthly'
    CHECK (payment_schedule IN ('monthly', 'biweekly', 'weekly')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_affiliate_profiles_user_id ON affiliate_profiles(user_id);
CREATE INDEX idx_affiliate_profiles_referral_code ON affiliate_profiles(referral_code);
CREATE INDEX idx_affiliate_profiles_referred_by ON affiliate_profiles(referred_by);
CREATE INDEX idx_affiliate_profiles_role ON affiliate_profiles(role);
CREATE INDEX idx_affiliate_profiles_ctv_tier ON affiliate_profiles(ctv_tier);
```

### 9.2 Updated partnership_applications Table

```sql
-- ============================================================
-- PARTNERSHIP_APPLICATIONS TABLE - v3.0
-- ============================================================
CREATE TABLE IF NOT EXISTS partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Application Type: 'ctv' hoặc 'kol'
  application_type VARCHAR(20) NOT NULL CHECK (application_type IN ('ctv', 'kol')),
  
  -- KOL-specific fields
  social_platforms JSONB,  -- {"youtube": 50000, "facebook": 30000, ...}
  total_followers INTEGER,
  social_proof_urls TEXT[], -- Links to profiles
  
  -- Common fields
  reason_for_joining TEXT,
  marketing_channels TEXT,
  
  -- Referral (ai giới thiệu user này đăng ký)
  referred_by_code VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Auto-approve tracking (for CTV)
  auto_approve_at TIMESTAMPTZ, -- Thời điểm sẽ auto approve
  
  -- Review Info
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Set auto_approve_at for CTV applications
CREATE OR REPLACE FUNCTION set_ctv_auto_approve()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_type = 'ctv' THEN
    NEW.auto_approve_at = NEW.created_at + INTERVAL '3 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_ctv_auto_approve
  BEFORE INSERT ON partnership_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_ctv_auto_approve();
```

### 9.3 Commission Tracking với Sub-Affiliate

```sql
-- ============================================================
-- AFFILIATE_COMMISSIONS TABLE - v3.0
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Affiliate (người bán)
  affiliate_id UUID REFERENCES auth.users(id),
  affiliate_role VARCHAR(20),
  affiliate_tier VARCHAR(20),
  
  -- Sub-affiliate (người giới thiệu affiliate, nếu có)
  sub_affiliate_id UUID REFERENCES auth.users(id),
  sub_affiliate_commission DECIMAL(15,2) DEFAULT 0,
  sub_affiliate_rate DECIMAL(5,4),
  
  -- Order Info
  order_id VARCHAR(255) NOT NULL,
  order_number VARCHAR(100),
  order_amount DECIMAL(15,2) NOT NULL,
  
  -- Product Info
  product_id VARCHAR(255),
  product_type VARCHAR(50), -- 'digital' hoặc 'physical'
  
  -- Commission
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

---

## 10. API REFERENCE

### 10.1 RPC Functions

```sql
-- ============================================================
-- GET COMMISSION RATE
-- ============================================================
CREATE OR REPLACE FUNCTION get_commission_rate(
  p_role VARCHAR,
  p_tier VARCHAR,
  p_product_type VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  IF p_role = 'kol' THEN
    v_rate := 0.20; -- KOL: 20% cho cả digital và physical
  ELSE
    -- CTV rates
    CASE p_tier
      WHEN 'bronze' THEN
        v_rate := CASE WHEN p_product_type = 'digital' THEN 0.10 ELSE 0.06 END;
      WHEN 'silver' THEN
        v_rate := CASE WHEN p_product_type = 'digital' THEN 0.15 ELSE 0.08 END;
      WHEN 'gold' THEN
        v_rate := CASE WHEN p_product_type = 'digital' THEN 0.20 ELSE 0.10 END;
      WHEN 'platinum' THEN
        v_rate := CASE WHEN p_product_type = 'digital' THEN 0.25 ELSE 0.12 END;
      WHEN 'diamond' THEN
        v_rate := CASE WHEN p_product_type = 'digital' THEN 0.30 ELSE 0.15 END;
      ELSE
        v_rate := 0.10; -- Default bronze
    END CASE;
  END IF;
  
  RETURN v_rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- GET SUB-AFFILIATE RATE
-- ============================================================
CREATE OR REPLACE FUNCTION get_sub_affiliate_rate(
  p_role VARCHAR,
  p_tier VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  IF p_role = 'kol' THEN
    v_rate := 0.035; -- KOL: 3.5%
  ELSE
    -- CTV rates
    CASE p_tier
      WHEN 'bronze' THEN v_rate := 0.02;
      WHEN 'silver' THEN v_rate := 0.025;
      WHEN 'gold' THEN v_rate := 0.03;
      WHEN 'platinum' THEN v_rate := 0.035;
      WHEN 'diamond' THEN v_rate := 0.04;
      ELSE v_rate := 0.02;
    END CASE;
  END IF;
  
  RETURN v_rate;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 CHECKLIST KHI IMPLEMENT

```
□ Update constants file với CTV_TIER_CONFIG và KOL_CONFIG
□ Update database schema (migration script)
□ Update affiliateService.js - commission calculation
□ Update shopify-webhook - sub-affiliate tracking
□ Update AffiliateSection.js - UI tier badges
□ Update PartnershipRegistrationScreen.js - KOL form
□ Create scheduled job - weekly upgrade check
□ Create scheduled job - monthly downgrade check
□ Create scheduled job - CTV auto-approve (3 days)
□ Update AdminApplicationsScreen.js - auto-approve countdown
□ Test all commission calculations
□ Test upgrade/downgrade flows
□ Test sub-affiliate tracking
```

---

**END OF OFFICIAL POLICY DOCUMENT**

**Version:** 3.0  
**Effective Date:** 28/12/2024  
**Approved By:** GEM Platform Admin

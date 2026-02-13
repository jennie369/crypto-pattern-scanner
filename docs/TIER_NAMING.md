# GEM Mobile - Tier Naming Conventions

> **CRITICAL:** Mỗi feature có hệ thống tier naming khác nhau. PHẢI dùng đúng convention.

## Overview

| Feature | Tier System | Database Column |
|---------|-------------|-----------------|
| Scanner | TIER1/TIER2/TIER3/ADMIN | `profiles.scanner_tier` |
| Chatbot | FREE/PRO/PREMIUM/VIP | `profiles.chatbot_tier` |
| Course | FREE/BASIC/PRO/MASTER | `profiles.course_tier` |

---

## 1. Scanner Tier System

### Tier Levels
```javascript
const SCANNER_TIERS = {
  FREE: 0,    // Không có, mặc định
  TIER1: 1,   // Pro
  TIER2: 2,   // Premium
  TIER3: 3,   // VIP
  ADMIN: 4,   // Admin (unlimited)
};
```

### Database Column
```sql
profiles.scanner_tier -- VARCHAR: 'FREE', 'TIER1', 'TIER2', 'TIER3', 'ADMIN'
```

### Features by Tier
| Feature | FREE | TIER1 | TIER2 | TIER3 | ADMIN |
|---------|------|-------|-------|-------|-------|
| Scan/day | 5 | 15 | 50 | ∞ | ∞ |
| Max coins | 3 | 10 | 50 | ∞ | ∞ |
| Multi-TF | ❌ | ❌ | ✅ | ✅ | ✅ |
| Pattern Enhancement | ❌ | Basic | Advanced | Full | Full |

### Code Usage
```javascript
// tierAccessService.js
import { tierAccessService } from '../services/tierAccessService';

tierAccessService.setTier(userTier, userId);
const canScan = await tierAccessService.checkScanLimit();
const maxCoins = tierAccessService.getMaxCoins();

// Check tier level
const getTierLevel = (tier) => {
  const levels = { 'FREE': 0, 'TIER1': 1, 'TIER2': 2, 'TIER3': 3, 'ADMIN': 4 };
  return levels[tier?.toUpperCase()] || 0;
};
```

### Shopify Products
| Tier | Product Handle | Price |
|------|----------------|-------|
| TIER1 | `gem-scanner-tier1` | 99.000đ/tháng |
| TIER2 | `gem-scanner-tier2` | 199.000đ/tháng |
| TIER3 | `gem-scanner-tier3` | 399.000đ/tháng |

---

## 2. Chatbot Tier System

### Tier Levels
```javascript
const CHATBOT_TIERS = {
  FREE: 0,     // Mặc định
  PRO: 1,      // Basic paid
  PREMIUM: 2,  // Mid tier
  VIP: 3,      // Unlimited
};
```

### Database Column
```sql
profiles.chatbot_tier -- VARCHAR: 'FREE', 'PRO', 'PREMIUM', 'VIP'
```

### Features by Tier
| Feature | FREE | PRO | PREMIUM | VIP |
|---------|------|-----|---------|-----|
| Queries/day | 5 | 15 | 50 | ∞ |
| Analysis depth | Basic | Basic | Advanced | Real-time |
| Trading signals | ❌ | ✅ | ✅ | ✅ |
| Support | ❌ | Email | Priority | 24/7 VIP |

### Code Usage
```javascript
// ChatbotPricingModal.js - ĐÚNG
const CHATBOT_TIERS = [
  { id: 'pro', tier: 'PRO', queries: 15 },
  { id: 'premium', tier: 'PREMIUM', queries: 50 },
  { id: 'vip', tier: 'VIP', queries: -1 },
];

const getTierLevel = (tier) => {
  const levels = { 'FREE': 0, 'PRO': 1, 'PREMIUM': 2, 'VIP': 3 };
  return levels[tier?.toUpperCase()] || 0;
};

// ❌ SAI - Không dùng TIER1/TIER2/TIER3 cho chatbot!
const levels = { 'TIER1': 1, 'TIER2': 2, 'TIER3': 3 }; // SAI!
```

### Shopify Products
| Tier | Product Handle | URL | Price |
|------|----------------|-----|-------|
| PRO | `gem-chatbot-pro` | `https://shop.gemcrypto.vn/products/gem-chatbot-pro` | 39.000đ/tháng |
| PREMIUM | `gem-chatbot-premium` | `https://shop.gemcrypto.vn/products/gem-chatbot-premium` | 59.000đ/tháng |
| VIP | `gem-chatbot-vip` | `https://shop.gemcrypto.vn/products/gem-chatbot-vip` | 99.000đ/tháng |

---

## 3. Course Tier System

### Tier Levels
```javascript
const COURSE_TIERS = {
  FREE: 0,     // Free courses only
  BASIC: 1,    // Basic courses
  PRO: 2,      // Pro courses
  MASTER: 3,   // All courses
};
```

### Database Column
```sql
profiles.course_tier -- VARCHAR: 'FREE', 'BASIC', 'PRO', 'MASTER'
```

### Features by Tier
| Feature | FREE | BASIC | PRO | MASTER |
|---------|------|-------|-----|--------|
| Free courses | ✅ | ✅ | ✅ | ✅ |
| Basic courses | ❌ | ✅ | ✅ | ✅ |
| Pro courses | ❌ | ❌ | ✅ | ✅ |
| Master courses | ❌ | ❌ | ❌ | ✅ |
| Certificates | ❌ | ✅ | ✅ | ✅ |

---

## ⚠️ Common Mistakes

### Mistake 1: Mixing tier systems
```javascript
// ❌ SAI - Dùng scanner tier cho chatbot
const chatbotTiers = ['TIER1', 'TIER2', 'TIER3']; // SAI!

// ✅ ĐÚNG
const chatbotTiers = ['PRO', 'PREMIUM', 'VIP'];
```

### Mistake 2: Display text không đúng
```javascript
// ❌ SAI - Hiển thị TIER1/PRO lẫn lộn
'TIER1/PRO: 15 lượt/ngày'  // Confusing!

// ✅ ĐÚNG - Chọn 1 hệ thống
// Cho chatbot:
'PRO: 15 lượt/ngày'
// Cho scanner:
'TIER1: 15 lượt/ngày'
```

### Mistake 3: Hardcode thay vì constant
```javascript
// ❌ SAI
if (tier === 'PRO') { ... }
if (tier === 'TIER1') { ... }

// ✅ ĐÚNG - Dùng helper function
const level = getTierLevel(tier);
if (level >= 1) { ... }
```

---

## Tier Comparison Functions

### Scanner Tier
```javascript
// In tierAccessService.js or tierService.js
export const getScannerTierLevel = (tier) => {
  const levels = {
    'FREE': 0,
    'TIER1': 1,
    'TIER2': 2,
    'TIER3': 3,
    'ADMIN': 4
  };
  return levels[tier?.toUpperCase()] || 0;
};
```

### Chatbot Tier
```javascript
// In ChatbotPricingModal.js or chatbotService.js
export const getChatbotTierLevel = (tier) => {
  const levels = {
    'FREE': 0,
    'PRO': 1,
    'PREMIUM': 2,
    'VIP': 3
  };
  return levels[tier?.toUpperCase()] || 0;
};
```

### Course Tier
```javascript
// In courseService.js
export const getCourseTierLevel = (tier) => {
  const levels = {
    'FREE': 0,
    'BASIC': 1,
    'PRO': 2,
    'MASTER': 3
  };
  return levels[tier?.toUpperCase()] || 0;
};
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    TIER NAMING CHEAT SHEET              │
├─────────────────────────────────────────────────────────┤
│ SCANNER: FREE → TIER1 → TIER2 → TIER3 → ADMIN          │
│ CHATBOT: FREE → PRO → PREMIUM → VIP                     │
│ COURSE:  FREE → BASIC → PRO → MASTER                    │
├─────────────────────────────────────────────────────────┤
│ DB Columns:                                             │
│   profiles.scanner_tier                                 │
│   profiles.chatbot_tier                                 │
│   profiles.course_tier                                  │
└─────────────────────────────────────────────────────────┘
```

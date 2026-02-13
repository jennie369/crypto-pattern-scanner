# MUA CRYSTAL QUA CHATBOT VỚI UPSELL TỰ ĐỘNG - COMPLETE FEATURE SPEC

**Version:** 1.0
**Last Updated:** December 14, 2025
**Platform:** GEM Mobile App (React Native)
**Integration:** Shopify Storefront API

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Flow](#2-user-flow)
3. [Context Detection System](#3-context-detection-system)
4. [Crystal Tag Mapping](#4-crystal-tag-mapping)
5. [Upsell Logic System](#5-upsell-logic-system)
6. [Combo Discount System](#6-combo-discount-system)
7. [UI Components](#7-ui-components)
8. [Service Layer](#8-service-layer)
9. [Database Schema](#9-database-schema)
10. [RPC Functions](#10-rpc-functions)
11. [Integration Points](#11-integration-points)
12. [Design Specifications](#12-design-specifications)
13. [Analytics & Tracking](#13-analytics--tracking)

---

## 1. Overview

### 1.1 System Purpose

"Mua Crystal qua Chatbot với Upsell Tự Động" là hệ thống cho phép user mua đá phong thủy trực tiếp trong chat với GemMaster AI, với gợi ý upsell thông minh dựa trên:

- **Context Detection**: Phân tích nội dung chat để hiểu nhu cầu user
- **Crystal Recommendation**: Gợi ý đá phù hợp với context (tình yêu → Thạch Anh Hồng)
- **Smart Upsell**: Gợi ý sản phẩm bổ trợ dựa trên crystal synergy
- **Combo Discount**: Giảm giá khi mua nhiều sản phẩm

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Context-Based Recommendations** | AI phân tích chat để gợi ý crystal phù hợp |
| **Quick Buy Modal** | Mua nhanh trong chat không cần rời screen |
| **Smart Upsell Modal** | Gợi ý sản phẩm synergy với lý do cụ thể |
| **Combo Discounts** | 10-20% giảm giá khi mua combo |
| **Shopify Integration** | Real products từ Shopify với đúng tags |
| **Cart Integration** | Thêm vào giỏ và checkout qua Shopify |

### 1.3 Technical Stack

- **Frontend**: React Native + Expo
- **UI**: Glass Morphism + Lucide Icons
- **Backend**: Shopify Storefront API
- **Analytics**: Supabase (upsell_events, combo_purchases)

---

## 2. User Flow

### 2.1 Complete Purchase Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User Chat với GemMaster                                     │
│     "Tôi muốn tìm đá cho tình yêu"                              │
│              │                                                  │
│              ▼                                                  │
│  2. AI Response + Crystal Recommendation Card                   │
│     [Thạch Anh Hồng cards với "Mua ngay" button]                │
│              │                                                  │
│              ▼                                                  │
│  3. User taps "Mua ngay" on product                             │
│              │                                                  │
│              ▼                                                  │
│  4. QuickBuyModal opens                                         │
│     - Product info, price                                       │
│     - Quantity selector                                         │
│     - Variant selection (if multiple)                           │
│     - "Thêm vào giỏ" / "Mua ngay" buttons                       │
│              │                                                  │
│              ▼                                                  │
│  5. User taps "Thêm vào giỏ"                                    │
│              │                                                  │
│              ▼                                                  │
│  6. crystalUpsellService.getUpsellSuggestions()                 │
│     - Fetches complementary products                            │
│     - Calculates combo discount                                 │
│              │                                                  │
│              ▼                                                  │
│  7. UpsellModal opens                                           │
│     - Success message "Đã thêm vào giỏ!"                        │
│     - Discount banner "Mua thêm giảm X%"                        │
│     - Upsell product cards với toggle checkbox                  │
│     - Combo summary (subtotal, discount, total)                 │
│     - "Tiếp tục mua" / "Thanh toán" buttons                     │
│              │                                                  │
│              ▼                                                  │
│  8. User toggles upsell products                                │
│     - Real-time combo recalculation                             │
│              │                                                  │
│              ▼                                                  │
│  9. User taps "Thanh toán"                                      │
│              │                                                  │
│              ▼                                                  │
│ 10. CartContext.createCheckout()                                │
│     - Creates Shopify checkout URL                              │
│     - Opens CheckoutWebView                                     │
│              │                                                  │
│              ▼                                                  │
│ 11. Shopify Checkout (WebView)                                  │
│     - User completes payment                                    │
│              │                                                  │
│              ▼                                                  │
│ 12. Webhook: Order Created                                      │
│     - Track combo purchase analytics                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Alternative Flows

**Flow A: Skip Upsell**
- User taps "Tiếp tục mua" → Returns to chat
- Or taps "Thanh toán" without selecting upsells

**Flow B: Direct Buy Now**
- User taps "Mua ngay" in QuickBuyModal
- Skips upsell modal, goes directly to checkout with upsell data attached

**Flow C: View Product Detail**
- User taps on product card (not "Mua ngay" button)
- Navigates to Shop > ProductDetail screen
- Full product page with reviews, description, etc.

---

## 3. Context Detection System

### 3.1 Intent Detection

**File:** `gem-mobile/src/utils/intentDetector.js`

```javascript
INTENT_TYPES = {
  // Divination intents
  TAROT_READING: 'tarot_reading',
  ICHING_READING: 'iching_reading',

  // Life areas (trigger crystal recommendations)
  CAREER: 'career',
  FINANCE: 'finance',
  LOVE: 'love',
  HEALTH: 'health',
  SPIRITUAL: 'spiritual',

  // Emotional states
  ANXIOUS: 'anxious',
  STRESSED: 'stressed',
  CONFUSED: 'confused',
  HOPEFUL: 'hopeful',
  SAD: 'sad',
  ANGRY: 'angry',

  // Crystal specific
  CRYSTAL_RECOMMENDATION: 'crystal_recommendation',
  CRYSTAL_INFO: 'crystal_info',
};
```

### 3.2 Trigger Keywords

**File:** `gem-mobile/src/services/crystalTagMappingService.js`

```javascript
CRYSTAL_TRIGGER_KEYWORDS = [
  // Crystal names
  'thạch anh', 'đá', 'crystal', 'quartz',
  'amethyst', 'citrine', 'hematite',

  // Product types
  'vòng tay', 'trụ', 'cụm', 'set đá',

  // Purposes
  'năng lượng', 'chakra', 'phong thủy',
  'chọn đá', 'gợi ý đá', 'recommend',

  // Life areas
  'tình yêu', 'tiền bạc', 'bảo vệ', 'thiền',
];
```

### 3.3 Detection Flow

```javascript
// In GemMasterScreen.js
const handleAIResponse = async (response, userMessage) => {
  const context = `${userMessage} ${response}`;

  // Check if should show crystal recommendations
  if (shouldShowCrystalRecommendations(context)) {
    setCrystalRec({
      show: true,
      context: context,
    });
  }
};
```

---

## 4. Crystal Tag Mapping

### 4.1 Context → Shopify Tags

**File:** `gem-mobile/src/services/crystalTagMappingService.js`

| Context Keyword | Shopify Tags |
|-----------------|--------------|
| `thạch anh tím`, `amethyst` | `['Thạch Anh Tím']` |
| `thạch anh hồng`, `rose quartz` | `['Thạch Anh Hồng']` |
| `thạch anh vàng`, `citrine` | `['Thạch Anh Vàng']` |
| `thạch anh trắng`, `clear quartz` | `['Thạch Anh Trắng']` |
| `tình yêu`, `love`, `quan hệ` | `['Thạch Anh Hồng']` |
| `tiền bạc`, `tài lộc`, `wealth` | `['Thạch Anh Vàng', 'Cây Tài Lộc']` |
| `thiền`, `meditation`, `ngủ ngon` | `['Thạch Anh Tím']` |
| `bảo vệ`, `protection`, `grounding` | `['Hematite', 'Khói Xám']` |
| `vòng tay`, `bracelet` | `['Vòng Tay']` |
| `set đá`, `bộ đá` | `['Set', 'Special set']` |
| `cây tài lộc` | `['Cây Tài Lộc']` |
| `tinh dầu`, `nước hoa` | `['Tinh dầu nước hoa Jérie']` |

### 4.2 Tag Extraction Function

```javascript
export const extractShopifyTags = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const allTags = new Set();

  for (const [keyword, tags] of Object.entries(CONTEXT_TO_SHOPIFY_TAGS)) {
    if (lowerText.includes(keyword)) {
      tags.forEach(tag => allTags.add(tag));
    }
  }

  return Array.from(allTags);
};
```

### 4.3 Get Recommendations

```javascript
export const getCrystalRecommendations = async (context, limit = 4) => {
  const tags = extractShopifyTags(context);

  if (tags.length === 0) {
    // Fallback to bestsellers
    return await shopifyService.getBestsellers(limit);
  }

  const products = await shopifyService.getProductsByTags(tags, limit, true);

  // Supplement with bestsellers if not enough products
  if (products.length < limit) {
    const bestsellers = await shopifyService.getBestsellers(limit - products.length);
    return [...products, ...bestsellers];
  }

  return products;
};
```

---

## 5. Upsell Logic System

### 5.1 Crystal Synergy Map

**File:** `gem-mobile/src/services/crystalUpsellService.js`

#### CRYSTAL_UPSELL_MAP

| Primary Crystal | Upsell Tags | Reasons (Vietnamese) |
|-----------------|-------------|----------------------|
| **Thạch Anh Hồng** (Love) | `Thạch Anh Tím`, `Aura`, `Set` | Tăng trực giác tình yêu, Hài hòa năng lượng quan hệ |
| **Thạch Anh Tím** (Spiritual) | `Thạch Anh Trắng`, `Thạch Anh Hồng`, `Special set` | Khuếch đại thiền định, Cân bằng năng lượng tim |
| **Thạch Anh Vàng** (Wealth) | `Cây Tài Lộc`, `Thạch Anh Trắng`, `Set` | Tăng năng lượng tài lộc x2, Phong thủy hoàn chỉnh |
| **Thạch Anh Trắng** (Clarity) | `Thạch Anh Tím`, `Thạch Anh Vàng`, `Special set` | Combo thiền định, Khuếch đại thịnh vượng |
| **Cây Tài Lộc** | `Thạch Anh Vàng`, `Trụ`, `Vòng Tay` | Đá hộ mệnh tài lộc, Năng lượng bên mình |
| **Khói Xám** (Protection) | `Hematite`, `Thạch Anh Trắng`, `Set` | Tăng cường bảo vệ, Thanh lọc tiêu cực |
| **Hematite** | `Khói Xám`, `Thạch Anh Trắng`, `Vòng Tay` | Đá grounding bổ trợ, Bảo vệ 24/7 |
| **Vòng Tay** | `Trụ`, `Set`, `Tinh dầu nước hoa Jérie` | Đặt trong nhà, Nước hoa năng lượng đi kèm |
| **Trụ** | `Cụm`, `Vòng Tay`, `Set` | Tăng năng lượng phòng, Combo full bộ |
| **Cụm** | `Trụ`, `Vòng Tay`, `Special set` | Tối ưu không gian, Bộ sưu tập đặc biệt |
| **Set** | `Trụ`, `Cây Tài Lộc`, `Tinh dầu nước hoa Jérie` | Thêm điểm nhấn, Nước hoa năng lượng |
| **Tinh dầu nước hoa Jérie** | `Thạch Anh Hồng`, `Thạch Anh Tím`, `Vòng Tay` | Combo tình yêu, Combo thiền định |

#### Default Upsells

```javascript
DEFAULT_UPSELLS = {
  upsells: ['Bestseller', 'Set', 'Vòng Tay'],
  reason: {
    'Bestseller': 'Sản phẩm được yêu thích nhất',
    'Set': 'Tiết kiệm với combo',
    'Vòng Tay': 'Dễ sử dụng hàng ngày',
  },
};
```

### 5.2 Get Upsell Suggestions

```javascript
export const getUpsellSuggestions = async (primaryProduct, limit = 3) => {
  const allProducts = await getCachedProducts();

  // Find matching upsell config based on product tags
  const primaryTags = getProductTags(primaryProduct);
  let upsellConfig = null;
  let matchedTag = null;

  for (const tag of primaryTags) {
    if (CRYSTAL_UPSELL_MAP[tag]) {
      upsellConfig = CRYSTAL_UPSELL_MAP[tag];
      matchedTag = tag;
      break;
    }
  }

  // Use default if no specific mapping
  if (!upsellConfig) {
    upsellConfig = DEFAULT_UPSELLS;
    matchedTag = 'default';
  }

  // Find products matching upsell tags
  const upsellProducts = allProducts.filter(product => {
    if (product.id === primaryProduct.id) return false;
    return productHasAnyTag(product, upsellConfig.upsells);
  });

  // Sort bestsellers first
  const sortedUpsells = upsellProducts.sort((a, b) => {
    const aIsBestseller = productHasAnyTag(a, ['Bestseller', 'Hot Product']);
    const bIsBestseller = productHasAnyTag(b, ['Bestseller', 'Hot Product']);
    if (aIsBestseller && !bIsBestseller) return -1;
    if (!aIsBestseller && bIsBestseller) return 1;
    return 0;
  });

  // Add reason to each upsell
  const upsellsWithReasons = sortedUpsells.slice(0, limit).map(product => {
    const productTags = getProductTags(product);
    let reason = 'Sản phẩm bổ trợ hoàn hảo';

    for (const tag of productTags) {
      if (upsellConfig.reason[tag]) {
        reason = upsellConfig.reason[tag];
        break;
      }
    }

    return { ...product, upsellReason: reason };
  });

  return {
    primaryProduct,
    matchedTag,
    upsells: upsellsWithReasons,
    comboDiscount: getComboDiscount(1 + upsellsWithReasons.length),
  };
};
```

---

## 6. Combo Discount System

### 6.1 Discount Rates

```javascript
COMBO_DISCOUNTS = {
  2: 0.10,  // 10% for 2 items
  3: 0.15,  // 15% for 3 items
  4: 0.18,  // 18% for 4 items
  5: 0.20,  // 20% for 5+ items
};
```

### 6.2 Calculate Combo Total

```javascript
export const calculateComboTotal = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { subtotal: 0, discount: 0, total: 0, discountPercent: 0 };
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price || item.variants?.[0]?.price || 0);
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  // Get total item count
  const totalItems = cartItems.reduce((sum, item) =>
    sum + (item.quantity || 1), 0);

  // Get discount rate
  const discountRate = getComboDiscount(totalItems);
  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    discountPercent: discountRate * 100,
    itemCount: totalItems,
  };
};
```

### 6.3 Upsell Message

```javascript
export const getUpsellMessage = (primaryProduct, upsells = []) => {
  if (upsells.length === 0) return null;

  const upsellNames = upsells.slice(0, 2).map(p => p.title).join(' và ');
  const discount = getComboDiscount(1 + upsells.length) * 100;

  return `Kết hợp với ${upsellNames} để tăng hiệu quả! Mua combo giảm ${discount}%`;
};
```

---

## 7. UI Components

### 7.1 CrystalRecommendationNew

**Location:** `gem-mobile/src/components/GemMaster/CrystalRecommendationNew.js`

**Purpose:** Hiển thị sản phẩm gợi ý trong chat

**Props:**
```typescript
interface Props {
  context: string;       // Combined user message + AI response
  limit?: number;        // Max products to show (default 4)
  onQuickBuy?: (product) => void; // Callback for quick buy button
}
```

**Features:**
- Horizontal FlatList với product cards
- "HOT" badge cho bestsellers
- "Mua ngay" button với Zap icon
- "Xem tất cả" link to Shop tab
- Animated entrance (FadeInRight)

**Styling:**
```javascript
container: {
  backgroundColor: 'rgba(155, 89, 182, 0.05)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(155, 89, 182, 0.2)',
}
productCard: {
  width: 140,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
}
quickBuyBtn: {
  backgroundColor: COLORS.gold,
  borderRadius: 8,
  paddingVertical: 6,
}
```

### 7.2 QuickBuyModal

**Location:** `gem-mobile/src/components/GemMaster/QuickBuyModal.js`

**Purpose:** Modal mua nhanh trong chat

**Props:**
```typescript
interface Props {
  visible: boolean;
  product: ShopifyProduct;
  onClose: () => void;
  onShowUpsell: (upsellData) => void;
  onBuyNow: (purchaseData) => void;
}
```

**Sections:**
1. **Header**: "Mua nhanh" with Gem icon
2. **Product Row**: Image + title + tags + price
3. **Variant Selection**: If multiple variants (pills)
4. **Quantity Selector**: -/+ controls with total price
5. **Upsell Hint**: "Thêm vào giỏ để xem combo giảm giá!"
6. **Action Buttons**: "Thêm vào giỏ" / "Mua ngay"
7. **Success State**: Green checkmark "Đã thêm vào giỏ!"

**Key Behaviors:**
- Reset state when product changes
- Select first variant by default
- Max quantity: 10
- Triggers upsell fetch after add to cart
- Shows success state briefly before showing upsell modal

### 7.3 UpsellModal

**Location:** `gem-mobile/src/components/GemMaster/UpsellModal.js`

**Purpose:** Hiển thị upsell suggestions với combo discount

**Props:**
```typescript
interface Props {
  visible: boolean;
  upsellData: {
    primaryProduct: Product;
    matchedTag: string;
    upsells: Product[];
    comboDiscount: number;
  };
  onClose: () => void;
  onCheckout: (checkoutUrl) => void;
  onContinueShopping: () => void;
}
```

**Sections:**
1. **Header**: "Combo giảm giá!" with Sparkles icon
2. **Discount Banner**: "Mua thêm để được giảm X%"
3. **Success Section**: Green box "Đã thêm vào giỏ! [Product Name]"
4. **Upsell Cards**: Toggle checkbox + image + title + reason + price
5. **Combo Summary**: Subtotal, Discount, Total
6. **Action Buttons**:
   - No selection: "Tiếp tục mua" / "Thanh toán"
   - With selection: "Thanh toán (X sản phẩm)"

**Key Behaviors:**
- Real-time combo recalculation when toggling products
- Adds selected upsells to cart before checkout
- Creates Shopify checkout URL

### 7.4 ProductCard (in CrystalRecommendationNew)

**Styling:**
```javascript
imageContainer: {
  width: '100%',
  aspectRatio: 1,
  backgroundColor: '#1a1a2e',
}
badge: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: '#E74C3C',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
}
price: {
  fontSize: 14,
  fontWeight: '700',
  color: COLORS.gold,
}
```

### 7.5 UpsellProductCard

**Styling:**
```javascript
upsellCard: {
  flexDirection: 'row',
  padding: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
}
upsellCardSelected: {
  backgroundColor: 'rgba(212, 175, 55, 0.1)',
  borderColor: COLORS.gold,
}
checkbox: {
  width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.3)',
}
checkboxSelected: {
  backgroundColor: COLORS.gold,
  borderColor: COLORS.gold,
}
upsellReason: {
  fontSize: 11,
  color: COLORS.gold,
  fontStyle: 'italic',
}
```

---

## 8. Service Layer

### 8.1 crystalUpsellService.js

**Location:** `gem-mobile/src/services/crystalUpsellService.js`

**Exports:**
```javascript
export default {
  getUpsellSuggestions,    // Get upsell products for a primary product
  getComboDiscount,        // Get discount rate by item count
  calculateComboTotal,     // Calculate cart total with discount
  formatPrice,             // Format VND price
  getUpsellMessage,        // Generate upsell message
  clearCache,              // Clear product cache
  CRYSTAL_UPSELL_MAP,      // Export mapping for reference
  COMBO_DISCOUNTS,         // Export discount rates
};
```

**Caching:**
```javascript
let productCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### 8.2 crystalTagMappingService.js

**Location:** `gem-mobile/src/services/crystalTagMappingService.js`

**Exports:**
```javascript
export default {
  shouldShowCrystalRecommendations,  // Check if text triggers recommendations
  extractShopifyTags,                // Extract Shopify tags from context
  getCrystalRecommendations,         // Fetch products by context
  formatPrice,                       // Format VND price
  CONTEXT_TO_SHOPIFY_TAGS,           // Mapping reference
};
```

### 8.3 shopRecommendationService.js

**Location:** `gem-mobile/src/services/shopRecommendationService.js`

**Exports:**
```javascript
export default {
  shouldShowProductRecommendation,
  extractTagsFromContext,
  getProductRecommendations,
  formatProductPrice,
  getRecommendationsForPurpose,  // love, wealth, meditation, protection, trading
  CONTEXT_TO_TAGS,
};
```

### 8.4 shopifyService.js Integration

**Required Methods:**
```javascript
// Get products by tags
getProductsByTags(tags, limit, sortByRelevance);

// Get bestsellers
getBestsellers(limit);

// Get all products (for cache)
getProducts({ limit: 100 });
```

---

## 9. Database Schema

### 9.1 upsell_events Table

```sql
CREATE TABLE upsell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,

  -- Primary product
  primary_product_id TEXT NOT NULL,
  primary_product_title TEXT,
  primary_product_tags TEXT[],

  -- Upsell context
  source_screen TEXT,  -- 'gemmaster', 'iching', 'tarot', 'shop'
  matched_tag TEXT,

  -- Upsell products shown
  upsell_products JSONB DEFAULT '[]'::jsonb,
  upsell_count INT DEFAULT 0,

  -- Conversion tracking
  products_added JSONB DEFAULT '[]'::jsonb,
  conversion_count INT DEFAULT 0,

  -- Discount info
  combo_discount_percent DECIMAL(5,2) DEFAULT 0,
  potential_savings DECIMAL(12,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'shown',  -- shown, skipped, converted, checkout

  -- Timestamps
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  checkout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.2 combo_purchases Table

```sql
CREATE TABLE combo_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),

  -- Order info
  shopify_order_id TEXT,
  order_number TEXT,

  -- Combo details
  item_count INT NOT NULL,
  products JSONB NOT NULL,

  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,

  -- Source tracking
  upsell_event_id UUID REFERENCES upsell_events(id),
  source_screen TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9.3 crystal_tag_performance Table

```sql
CREATE TABLE crystal_tag_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,

  -- Impressions
  times_shown INT DEFAULT 0,
  times_as_primary INT DEFAULT 0,
  times_as_upsell INT DEFAULT 0,

  -- Conversions
  times_added_to_cart INT DEFAULT 0,
  times_purchased INT DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- Calculated
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. RPC Functions

### 10.1 track_upsell_shown

```sql
CREATE OR REPLACE FUNCTION track_upsell_shown(
  p_user_id UUID,
  p_session_id TEXT,
  p_primary_product_id TEXT,
  p_primary_product_title TEXT,
  p_primary_product_tags TEXT[],
  p_source_screen TEXT,
  p_matched_tag TEXT,
  p_upsell_products JSONB,
  p_combo_discount_percent DECIMAL
)
RETURNS UUID;
```

### 10.2 track_upsell_conversion

```sql
CREATE OR REPLACE FUNCTION track_upsell_conversion(
  p_event_id UUID,
  p_products_added JSONB
)
RETURNS BOOLEAN;
```

### 10.3 track_combo_purchase

```sql
CREATE OR REPLACE FUNCTION track_combo_purchase(
  p_user_id UUID,
  p_shopify_order_id TEXT,
  p_order_number TEXT,
  p_products JSONB,
  p_subtotal DECIMAL,
  p_discount_percent DECIMAL,
  p_discount_amount DECIMAL,
  p_total DECIMAL,
  p_upsell_event_id UUID DEFAULT NULL,
  p_source_screen TEXT DEFAULT NULL
)
RETURNS UUID;
```

### 10.4 get_upsell_analytics

```sql
CREATE OR REPLACE FUNCTION get_upsell_analytics(
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  total_shown BIGINT,
  total_converted BIGINT,
  total_checkout BIGINT,
  conversion_rate DECIMAL,
  checkout_rate DECIMAL,
  avg_upsells_shown DECIMAL,
  avg_upsells_added DECIMAL,
  total_combo_revenue DECIMAL,
  avg_discount_percent DECIMAL,
  top_source_screen TEXT
);
```

---

## 11. Integration Points

### 11.1 GemMasterScreen Integration

**State:**
```javascript
const [crystalRec, setCrystalRec] = useState({
  show: false,
  context: '',
});

const [quickBuyModal, setQuickBuyModal] = useState({
  visible: false,
  product: null,
});

const [upsellModal, setUpsellModal] = useState({
  visible: false,
  upsellData: null,
});
```

**Render:**
```jsx
{/* Crystal Recommendations in chat */}
{crystalRec.show && (
  <CrystalRecommendationNew
    context={crystalRec.context}
    limit={4}
    onQuickBuy={(product) => {
      setQuickBuyModal({ visible: true, product });
    }}
  />
)}

{/* Quick Buy Modal */}
<QuickBuyModal
  visible={quickBuyModal.visible}
  product={quickBuyModal.product}
  onClose={() => setQuickBuyModal({ visible: false, product: null })}
  onShowUpsell={(upsellData) => {
    setUpsellModal({ visible: true, upsellData });
  }}
  onBuyNow={handleBuyNow}
/>

{/* Upsell Modal */}
<UpsellModal
  visible={upsellModal.visible}
  upsellData={upsellModal.upsellData}
  onClose={() => setUpsellModal({ visible: false, upsellData: null })}
  onCheckout={handleCheckout}
  onContinueShopping={handleContinueShopping}
/>
```

### 11.2 CartContext Integration

```javascript
const { addItem, items, createCheckout } = useCart();

// In UpsellModal
const handleCheckout = async () => {
  // Add selected upsells
  for (const product of selectedUpsells) {
    await addItem(product, null, 1);
  }

  // Create checkout
  const result = await createCheckout();
  if (result.success) {
    onCheckout(result.checkoutUrl);
  }
};
```

### 11.3 Tarot/IChing Screen Integration

Both divination screens can trigger crystal recommendations:
```javascript
// After showing divination result
setCrystalRec({
  show: true,
  context: `${divinationQuestion} ${divinationResult}`,
});
```

---

## 12. Design Specifications

### 12.1 Colors

```javascript
// Primary colors
COLORS = {
  gold: '#FFBD59',
  purple: '#6A5BFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

// Crystal recommendation container
crystalContainer: {
  backgroundColor: 'rgba(155, 89, 182, 0.05)',
  borderColor: 'rgba(155, 89, 182, 0.2)',
}

// Modal backdrop
backdrop: {
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
}

// Modal content
blurContainer: {
  backgroundColor: 'rgba(20, 20, 40, 0.95)',
}

// Success state
successSection: {
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
}

// Discount banner
discountBanner: {
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  borderColor: 'rgba(212, 175, 55, 0.3)',
}

// Hot badge
badge: {
  backgroundColor: '#E74C3C',
}
```

### 12.2 Typography

```javascript
TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
  fontWeight: {
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### 12.3 Button Styles

```javascript
// Gold primary button
buyBtn: {
  backgroundColor: COLORS.gold,
  borderRadius: 14,
  paddingVertical: 12,
}
buyBtnText: {
  color: '#0F1030',
  fontWeight: '600',
}

// Gold outline button
cartBtn: {
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  borderWidth: 1,
  borderColor: COLORS.gold,
  borderRadius: 14,
}
cartBtnText: {
  color: COLORS.gold,
}

// Quick buy mini button
quickBuyBtn: {
  backgroundColor: COLORS.gold,
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 10,
}
quickBuyText: {
  fontSize: 11,
  fontWeight: '600',
  color: '#0F1030',
}
```

### 12.4 Animations

```javascript
// Modal entrance
entering={SlideInDown.springify().damping(15)}
exiting={SlideOutDown.duration(200)}

// Product card entrance
entering={FadeInRight.delay(index * 100).duration(300)}

// Discount banner
entering={FadeIn.delay(200)}
```

---

## 13. Analytics & Tracking

### 13.1 Events Tracked

| Event | When | Data |
|-------|------|------|
| **upsell_shown** | UpsellModal opens | primary_product, upsells, matched_tag, source_screen |
| **upsell_converted** | User adds upsell products | products_added, conversion_count |
| **upsell_skipped** | User closes without adding | - |
| **checkout_started** | User taps checkout | cart_items, total, discount |
| **combo_purchase** | Order completed | order_id, products, discount_amount |

### 13.2 Key Metrics

| Metric | Formula |
|--------|---------|
| **Upsell Show Rate** | upsell_shown / add_to_cart_clicks |
| **Upsell Conversion Rate** | converted / shown |
| **Checkout Rate** | checkout / shown |
| **Average Upsells Added** | total_upsells_added / converted_events |
| **Average Discount Given** | sum(discount_amount) / combo_purchases |
| **Combo Revenue** | sum(combo_purchases.total) |

### 13.3 Tag Performance Tracking

```sql
-- Best performing primary tags
SELECT tag,
       times_as_primary,
       times_added_to_cart,
       ROUND(times_added_to_cart::decimal / NULLIF(times_as_primary, 0) * 100, 2) as conversion_rate,
       total_revenue
FROM crystal_tag_performance
ORDER BY conversion_rate DESC;

-- Best performing upsell tags
SELECT tag,
       times_as_upsell,
       times_purchased,
       ROUND(times_purchased::decimal / NULLIF(times_as_upsell, 0) * 100, 2) as upsell_success_rate
FROM crystal_tag_performance
WHERE times_as_upsell > 0
ORDER BY upsell_success_rate DESC;
```

---

## Appendix A: Component Exports

```javascript
// From gem-mobile/src/components/GemMaster/index.js
export { default as QuickBuyModal } from './QuickBuyModal';
export { default as UpsellModal } from './UpsellModal';
export { default as CrystalRecommendationNew } from './CrystalRecommendationNew';
export { default as ProductRecommendations } from './ProductRecommendations';
```

## Appendix B: Price Formatting

```javascript
// Vietnamese price format
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return 'Liên hệ';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
};

// Examples:
// 3690000 → "3.690.000đ"
// 150000 → "150.000đ"
```

---

**End of Document**

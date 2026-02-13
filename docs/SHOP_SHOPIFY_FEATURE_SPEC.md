# GEM Mobile - Shop Tab & Shopify Integration
# COMPLETE FEATURE SPECIFICATION

**Version:** 2.0
**Last Updated:** 2025-12-13
**Platform:** React Native (Expo)
**E-commerce:** Shopify Storefront API via Supabase Edge Functions

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Shop Screens](#3-shop-screens)
4. [Shop Components](#4-shop-components)
5. [Shopify Service](#5-shopify-service)
6. [Cross-Feature Integrations](#6-cross-feature-integrations)
7. [Design System](#7-design-system)
8. [User Flows](#8-user-flows)
9. [Data Models](#9-data-models)
10. [Order Management](#10-order-management)
11. [Error Handling](#11-error-handling)
12. [Performance Optimizations](#12-performance-optimizations)
13. [File Manifest](#13-file-manifest)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
The Shop tab is the e-commerce hub of GEM Mobile, powered by Shopify Storefront API. It provides:
- Product browsing with category filtering
- Shopify checkout integration (WebView)
- Order tracking and management
- Cross-feature product integrations

### 1.2 Key Integrations
| Integration | Description |
|-------------|-------------|
| Forum Posts | Attach products to posts |
| GemMaster Chatbot | AI product recommendations |
| GEM Currency | Purchase gems via Shopify |
| Courses | Course access via purchase |
| Vision Board | Goal-related product suggestions |
| Affiliate System | Share product links |

### 1.3 Technology Stack
- **E-commerce:** Shopify Storefront API
- **CORS Proxy:** Supabase Edge Functions
- **Reviews:** Judge.me integration
- **Checkout:** Shopify hosted checkout (WebView)
- **Storage:** AsyncStorage (local) + Supabase (sync)

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     GEM Mobile App                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
│              (CORS Proxy / Auth)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Shopify Storefront API                          │
│              (Products / Cart / Checkout)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Navigation Stack
```
ShopStack (Tab Navigator)
├── ShopMain (ShopScreen)
├── ProductDetail
├── ProductSearch
├── ProductList
├── Cart
├── Checkout (WebView)
├── OrderSuccess
├── Orders
├── OrderDetail
├── GemPurchasePending
└── GemPurchaseSuccess
```

### 2.3 Component Hierarchy
```
ShopScreen
├── Header (Animated - Auto-hide)
│   ├── Title "GEM Shop"
│   ├── Search Icon
│   └── Cart Icon + Badge
├── ShopCategoryTabs
│   └── Tab[] (All, Crystals, Courses, etc.)
├── ProductSection[] (Multiple)
│   ├── SectionHeader
│   └── ProductCard[] (Horizontal/Grid)
├── SponsorBannerCard[] (Distributed)
└── ExploreSection (Infinite Scroll)
```

---

## 3. SHOP SCREENS

### 3.1 ShopScreen (Main)
**Path:** `gem-mobile/src/screens/Shop/ShopScreen.js`

#### Purpose
Central product browsing hub with category filtering and infinite scroll

#### Layout Structure
```
┌─────────────────────────────────────┐
│ GEM Shop          🔍  🛒(3)        │  ← Auto-hide Header
├─────────────────────────────────────┤
│ [All][Crystals][Courses][GemMaster] │  ← Category Tabs
├─────────────────────────────────────┤
│ 🌟 Dành Cho Bạn            Xem tất cả│
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │ 📦  │ │ 📦  │ │ 📦  │ →          │  ← Horizontal Section
│ │$100 │ │$150 │ │$200 │            │
│ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────┤
│ 🔥 Đang Thịnh Hành                  │
│ ┌─────┐ ┌─────┐                    │
│ │ 📦  │ │ 📦  │                    │  ← Grid Section
│ │$300 │ │$250 │                    │
│ └─────┘ └─────┘                    │
├─────────────────────────────────────┤
│ [SPONSOR BANNER]                    │  ← Distributed Banners
├─────────────────────────────────────┤
│ 💎 Khám Phá Thêm                    │
│ ┌─────┐ ┌─────┐                    │
│ │ 📦  │ │ 📦  │                    │  ← Infinite Scroll
│ │     │ │     │ ⏳ Loading...      │
│ └─────┘ └─────┘                    │
└─────────────────────────────────────┘
```

#### Header Auto-Hide Animation
```javascript
// Scroll threshold
const SCROLL_THRESHOLD = 10;
const HEADER_HEIGHT = 60;
const TABS_HEIGHT = 60;

// Animation spring config
Animated.spring(headerTranslateY, {
  toValue: shouldHide ? -(HEADER_HEIGHT + TABS_HEIGHT) : 0,
  useNativeDriver: true,
  tension: 80,
  friction: 12,
});
```

#### Category Tabs
| Tab | Icon | Tags Filter |
|-----|------|-------------|
| All | LayoutGrid | No filter |
| Crystals & Spiritual | Gem | Thạch Anh, Hematite, Aquamarine... |
| Khóa học | GraduationCap | khoa-hoc, gem-academy |
| GemMaster | Bot | GEM Chatbot |
| Scanner | BarChart3 | Scanner |
| Gem Pack | Package | Gem Pack, virtual-currency |

#### Product Sections
| Section ID | Title | Type | Layout |
|------------|-------|------|--------|
| for-you | Dành Cho Bạn | personalized | horizontal |
| trending | Đang Thịnh Hành | tagged | horizontal |
| money | Manifest Tiền Bạc | tagged | horizontal |
| love | Manifest Tình Yêu | tagged | horizontal |
| prosperity | Manifest Thịnh Vượng | tagged | horizontal |
| bracelets | Trang Sức Phong Thủy | tagged | horizontal |
| explore | Khám Phá Thêm | all | infinite-grid |

#### State Management
```javascript
const [allProducts, setAllProducts] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('all');
const [sectionsData, setSectionsData] = useState({});
const [sectionsLoading, setSectionsLoading] = useState({});
const [exploreProducts, setExploreProducts] = useState([]);
const [exploreOffset, setExploreOffset] = useState(0);
const [loadingMore, setLoadingMore] = useState(false);
const [headerVisible, setHeaderVisible] = useState(true);
```

---

### 3.2 ProductDetailScreen
**Path:** `gem-mobile/src/screens/Shop/ProductDetailScreen.js`

#### Purpose
Complete product view with gallery, reviews, and purchase CTAs

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Product Title                🔄  │  ← Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │        PRODUCT IMAGE            │ │  ← Image Gallery
│ │         (Swipeable)             │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ ● ○ ○ ○ ○                          │  ← Image Dots
│ [img][img][img][img][img]          │  ← Thumbnails
├─────────────────────────────────────┤
│ Product Title                       │
│ ₫1,500,000  ̶₫̶2̶,̶0̶0̶0̶,̶0̶0̶0̶  [-25%]    │  ← Price + Sale
├─────────────────────────────────────┤
│ Variant: [S] [M] [L] [XL]          │  ← Variants
│ Quantity: [-] 1 [+]                │  ← Quantity
├─────────────────────────────────────┤
│ Description:                        │
│ Lorem ipsum dolor sit amet...       │  ← Description
├─────────────────────────────────────┤
│ 📦 Miễn phí ship đơn > 975K        │
│ 🚚 Giao hàng 3-5 ngày              │  ← Shipping Info
│ ↩️ Đổi trả 7 ngày                   │
│ ✓ Đảm bảo chất lượng 100%          │
├─────────────────────────────────────┤
│ ⚠️ LƯU Ý VỀ ĐÁ THIÊN NHIÊN        │
│ Đá thiên nhiên có thể có sự        │  ← Crystal Note
│ khác biệt về màu sắc, kích thước   │
├─────────────────────────────────────┤
│ ⭐ ĐÁNH GIÁ TỪ KHÁCH HÀNG          │
│ ⭐⭐⭐⭐⭐ 4.8 (125 đánh giá)        │  ← Reviews
│ ┌─────────────────────────────────┐ │
│ │ User A: "Great quality!"       │ │
│ │ ⭐⭐⭐⭐⭐  ✓ Verified           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🔥 Bestsellers                      │
│ [Product] [Product] [Product] →    │  ← Recommendations
├─────────────────────────────────────┤
│ ❓ Câu Hỏi Thường Gặp              │
│ ▼ Cách chọn size?                  │  ← FAQ Accordion
│ ▼ Chính sách đổi trả?              │
├─────────────────────────────────────┤
│                                     │
│ [🔗 Share Link] [🛒 Add] [Buy Now] │  ← Sticky CTAs
└─────────────────────────────────────┘
```

#### Image Gallery Features
```javascript
// Image sources priority
const images = [
  product.image,
  ...(product.images || []),
  product.featuredImage,
  ...(product.variants?.map(v => v.image).filter(Boolean) || [])
].filter(Boolean);

// Thumbnail navigation
const scrollToImage = (index) => {
  flatListRef.current?.scrollToIndex({ index, animated: true });
  setSelectedImageIndex(index);
};
```

#### Reviews Integration (Judge.me)
```javascript
// Fetch reviews
const reviews = await reviewService.getProductReviews(product);

// Review card structure
{
  author: "User Name",
  rating: 5,
  body: "Review text...",
  created_at: "2025-01-01",
  verified: true,
  images: ["url1", "url2"]
}
```

#### Recommendation Sections
| Section | Icon | Data Source |
|---------|------|-------------|
| Bestsellers | Sparkles | `shopifyService.getBestsellers()` |
| For You | Heart | `shopifyService.getForYouProducts()` |
| Similar | Eye | `shopifyService.getSimilarProducts()` |
| Complete Look | Layers | `shopifyService.getComplementaryProducts()` |
| Trending | TrendingUp | `shopifyService.getHotProducts()` |
| Explore | Grid | Infinite scroll pagination |

#### Sticky CTAs
```javascript
// CTA animation sync with tab bar
const ctaTranslateY = tabBarTranslateY.interpolate({
  inputRange: [0, 120],
  outputRange: [0, 120],
  extrapolate: 'clamp',
});

// Bottom padding
const ACTION_BUTTON_BOTTOM_PADDING = 90; // Tab bar height
```

---

### 3.3 CheckoutWebView
**Path:** `gem-mobile/src/screens/Shop/CheckoutWebView.js`

#### Purpose
Shopify hosted checkout in WebView with success detection

#### Success Detection Methods
```javascript
// 1. URL-based detection
const isSuccess = url.includes('/thank_you') || url.includes('/orders/');

// 2. DOM element detection (injected JS)
const successSelectors = [
  '.os-order-number',
  '.order-confirmation',
  '[data-step="thank_you"]'
];

// 3. Page title detection
if (document.title.includes('Thank you')) {
  handleSuccess();
}

// 4. MutationObserver for DOM changes
const observer = new MutationObserver(() => {
  checkForSuccessElements();
});

// 5. History API interception
const originalPushState = history.pushState;
history.pushState = function() {
  originalPushState.apply(this, arguments);
  checkForSuccessURL();
};

// 6. Interval checking (backup)
setInterval(() => {
  checkForSuccessURL();
  checkForSuccessElements();
}, 500); // Max 60 checks = 30 seconds
```

#### Order Extraction
```javascript
// Extract order ID from URL
const orderIdMatch = url.match(/orders\/(\d+)/);
const orderId = orderIdMatch ? orderIdMatch[1] : null;

// Extract order number from DOM
const orderNumber = document.querySelector('.os-order-number')?.textContent;
```

#### Navigation Handling
```javascript
// Product type determines success screen
const handleSuccess = () => {
  if (productType === 'gems') {
    // Gems require webhook confirmation
    navigation.replace('GemPurchasePending', {
      orderId,
      gemAmount,
      packageName
    });
  } else {
    // Regular shop orders
    navigation.replace('OrderSuccess', {
      orderId,
      orderNumber
    });
  }
};
```

#### WebView Configuration
```javascript
// iOS specific
contentInsetAdjustmentBehavior: 'never',
bounces: false,

// Android specific
mixedContentMode: 'always',
thirdPartyCookiesEnabled: true,

// Injected CSS to hide Shopify navigation
const hideNavCSS = `
  .header, .site-header, .shopify-header { display: none !important; }
  .breadcrumb { display: none !important; }
`;
```

---

### 3.4 OrdersScreen
**Path:** `gem-mobile/src/screens/Orders/OrdersScreen.js`

#### Purpose
Order history with status filtering

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Đơn Hàng Của Tôi                 │
├─────────────────────────────────────┤
│ [Tất cả][Đang xử lý][Đang giao][Đã giao]│
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ #GEM12345           15/01/2025 │ │
│ │ 🟡 Đang xử lý                  │ │
│ │ [img][img] +2 more             │ │
│ │ Total: ₫1,500,000              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ #GEM12344           14/01/2025 │ │
│ │ 🟢 Đã giao                     │ │
│ │ [img][img][img]                │ │
│ │ Total: ₫2,000,000              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Status Styling
| Status | Icon | Color | Label |
|--------|------|-------|-------|
| pending | Clock | Gold | Chờ xử lý |
| processing | Package | Purple | Đang xử lý |
| shipped | Truck | Cyan | Đang giao |
| delivered | CheckCircle | Green | Đã giao |
| cancelled | XCircle | Red | Đã hủy |

---

### 3.5 OrderDetailScreen
**Path:** `gem-mobile/src/screens/Orders/OrderDetailScreen.js`

#### Purpose
Complete order information with timeline and tracking

#### Layout Structure
```
┌─────────────────────────────────────┐
│ ← Chi Tiết Đơn Hàng                │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🟡 ĐANG XỬ LÝ                  │ │
│ │ Đơn hàng đang được chuẩn bị    │ │  ← Status Card
│ │ [Theo dõi vận chuyển]          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Timeline:                           │
│ ● Đặt hàng      15/01 10:30       │
│ ● Xác nhận      15/01 10:35       │  ← Order Timeline
│ ○ Đang giao     --                 │
│ ○ Hoàn thành    --                 │
├─────────────────────────────────────┤
│ Thông Tin Đơn Hàng                  │
│ Mã đơn:    #GEM12345               │
│ Ngày đặt:  15/01/2025              │  ← Order Info
│ Tracking:  VN123456789 [📋]        │
├─────────────────────────────────────┤
│ Sản Phẩm                            │
│ ┌─────────────────────────────────┐ │
│ │ [img] Product Name              │ │
│ │       Variant: M | x2           │ │  ← Items
│ │       ₫500,000                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Địa Chỉ Giao Hàng                   │
│ Nguyễn Văn A                        │
│ 0901234567                          │  ← Shipping Address
│ 123 Đường ABC, Q.1, TP.HCM         │
├─────────────────────────────────────┤
│ Thanh Toán                          │
│ Tạm tính:        ₫1,400,000        │
│ Phí ship:        ₫30,000           │  ← Payment Summary
│ Giảm giá:        -₫100,000         │
│ ─────────────────────────          │
│ TỔNG CỘNG:       ₫1,330,000        │
├─────────────────────────────────────┤
│ [📞 Liên hệ hỗ trợ]                │
└─────────────────────────────────────┘
```

---

## 4. SHOP COMPONENTS

### 4.1 ProductCard
**Path:** `gem-mobile/src/screens/Shop/components/ProductCard.js`

#### Props
```typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: ViewStyle;
  darkMode?: boolean;    // Default: true
  compact?: boolean;     // Reduced size mode
}
```

#### Layout
```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │                 │ │
│ │   PRODUCT IMG   │ │
│ │                 │ │
│ │          [-25%] │ │  ← Sale Badge
│ └─────────────────┘ │
│ ├───────────────────┤
│ │ Product Title     │
│ │ (max 2 lines)     │
│ ├───────────────────┤
│ │ ₫1,500,000        │  ← Current Price
│ │ ̶₫̶2̶,̶0̶0̶0̶,̶0̶0̶0̶        │  ← Compare Price
│ └───────────────────┘
│              [🛒]    │  ← Quick Add Button
└─────────────────────┘
```

#### Styling
```javascript
const cardStyle = {
  backgroundColor: GLASS.background,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  overflow: 'hidden',
};

const saleBadge = {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: COLORS.error,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
};
```

---

### 4.2 ProductSection
**Path:** `gem-mobile/src/screens/Shop/components/ProductSection.js`

#### Props
```typescript
interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading: boolean;
  layout: 'horizontal' | 'grid';
  showViewAll?: boolean;
  hasInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  onProductPress: (product: Product) => void;
  onViewAll?: () => void;
}
```

#### Layouts
```javascript
// Horizontal Layout (FlatList)
const horizontalConfig = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { paddingHorizontal: SPACING.md },
  ItemSeparatorComponent: () => <View style={{ width: SPACING.sm }} />,
};

// Grid Layout (Static 2 columns)
const gridConfig = {
  numColumns: 2,
  columnWrapperStyle: { justifyContent: 'space-between' },
};

// Infinite Grid Layout (FlatList with pagination)
const infiniteGridConfig = {
  ...gridConfig,
  onEndReached: onLoadMore,
  onEndReachedThreshold: 0.3,
  ListFooterComponent: loading ? <ActivityIndicator /> : null,
};
```

#### Card Dimensions
```javascript
const HORIZONTAL_CARD_WIDTH = 160;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 3) / 2;
```

---

### 4.3 ShopCategoryTabs
**Path:** `gem-mobile/src/screens/Shop/components/ShopCategoryTabs.js`

#### Props
```typescript
interface ShopCategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}
```

#### Tab Styling
```javascript
const tabStyle = {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
  marginRight: 8,
};

const activeTabStyle = {
  backgroundColor: 'rgba(106, 91, 255, 0.2)',
  borderWidth: 1,
  borderColor: COLORS.purple,
};

const inactiveTabStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
};
```

---

### 4.4 ProductPicker
**Path:** `gem-mobile/src/components/ProductPicker.js`

#### Purpose
Modal to select products for Forum posts, GemMaster chat, etc.

#### Props
```typescript
interface ProductPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: Product | Product[]) => void;
  currentProduct?: Product;
  multiSelect?: boolean;      // Default: false
  maxSelect?: number;         // Default: 10
}
```

#### Layout
```
┌─────────────────────────────────────┐
│ Chọn Sản Phẩm                  [X] │
├─────────────────────────────────────┤
│ 🔍 [Search products...]            │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [img] Product 1           [✓]  │ │
│ │       ₫500,000                 │ │
│ ├─────────────────────────────────┤ │
│ │ [img] Product 2           [ ]  │ │
│ │       ₫750,000                 │ │
│ ├─────────────────────────────────┤ │
│ │ [img] Product 3           [ ]  │ │
│ │       ₫300,000                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Cancel]              [Select (1)] │
└─────────────────────────────────────┘
```

#### Features
- Real-time search filtering
- Product type detection (digital/gems/physical)
- Multi-select with checkmarks
- Loads up to 100 Shopify products
- Image format normalization

---

## 5. SHOPIFY SERVICE

### 5.1 Service Architecture
**Path:** `gem-mobile/src/services/shopifyService.js`

#### API Flow
```
Mobile App
    │
    ▼
┌─────────────────────────────────────┐
│  shopifyService.js                   │
│  - Handles API calls                 │
│  - Caches products                   │
│  - Transforms data                   │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│  Supabase Edge Function              │
│  (shopify-storefront)                │
│  - CORS handling                     │
│  - Auth headers                      │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│  Shopify Storefront API              │
│  (GraphQL)                           │
└─────────────────────────────────────┘
```

### 5.2 Key Methods

#### Product Methods
```javascript
// Fetch all products (cached)
async getProducts(options?: {
  first?: number;      // Default: 100
  sortKey?: string;    // TITLE, PRICE, BEST_SELLING
  reverse?: boolean;
}): Promise<Product[]>

// Get single product by handle
async getProductByHandle(handle: string): Promise<Product | null>

// Get single product by ID
async getProductById(id: string): Promise<Product | null>

// Search products
async searchProducts(query: string, limit?: number): Promise<Product[]>

// Get products by collection
async getCollectionProducts(
  handle: string,
  limit?: number
): Promise<Product[]>
```

#### Cart Methods
```javascript
// Create new cart
async createCart(
  lineItems: CartLine[],
  userId?: string,
  sessionId?: string
): Promise<Cart>

// Add items to cart
async addToCart(cartId: string, lines: CartLine[]): Promise<Cart>

// Update cart quantities
async updateCart(cartId: string, lines: CartLine[]): Promise<Cart>

// Remove items from cart
async removeFromCart(cartId: string, lineIds: string[]): Promise<Cart>
```

#### Recommendation Methods
```javascript
// Get bestselling products
async getBestsellers(limit?: number, products?: Product[]): Promise<Product[]>

// Get personalized recommendations
async getForYouProducts(
  product: Product,
  limit?: number,
  products?: Product[]
): Promise<Product[]>

// Get similar products (same tags)
async getSimilarProducts(
  product: Product,
  limit?: number,
  products?: Product[]
): Promise<Product[]>

// Get trending/hot products
async getHotProducts(limit?: number, products?: Product[]): Promise<Product[]>

// Get special sets/bundles
async getSpecialSets(limit?: number, products?: Product[]): Promise<Product[]>

// Filter by tags
async getProductsByTags(
  tags: string[],
  limit?: number,
  orLogic?: boolean,
  products?: Product[]
): Promise<Product[]>
```

#### ID Conversion
```javascript
// Convert to Shopify Global ID
toGlobalId(id: string, type: string): string
// Example: toGlobalId('123', 'ProductVariant')
// Returns: 'gid://shopify/ProductVariant/123'

// Extract numeric ID from Global ID
fromGlobalId(globalId: string): string
// Example: fromGlobalId('gid://shopify/ProductVariant/123')
// Returns: '123'
```

### 5.3 Caching Strategy
```javascript
class ShopifyService {
  _productsCache: Product[] | null = null;
  _productsCacheTime: number = 0;
  CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getProducts() {
    const now = Date.now();
    if (this._productsCache && (now - this._productsCacheTime) < this.CACHE_DURATION) {
      return this._productsCache;
    }

    const products = await this._fetchProducts();
    this._productsCache = products;
    this._productsCacheTime = now;
    return products;
  }
}
```

---

## 6. CROSS-FEATURE INTEGRATIONS

### 6.1 Forum Integration - Products in Posts
**Files:**
- `gem-mobile/src/screens/Forum/components/PostCard.js`
- `gem-mobile/src/components/ProductPicker.js`
- Database: `post_products` table

#### Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE POST FLOW                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
   Write content              [📎 Attach Product]
        │                           │
        │                           ▼
        │                  ProductPicker Modal
        │                  - Search products
        │                  - Multi-select (max 10)
        │                  - Confirm selection
        │                           │
        └───────────┬───────────────┘
                    ▼
           Submit Post
           - Save to forum_posts
           - Save products to post_products
                    │
                    ▼
           Post displays with
           product badges
```

#### PostCard Product Badge
```javascript
// Product badge on post card
<TouchableOpacity
  style={styles.productBadge}
  onPress={() => navigation.navigate('ProductDetail', { product })}
>
  <ShoppingBag size={14} color={COLORS.gold} />
  <Text style={styles.productBadgeText}>
    {attachedProducts.length} sản phẩm
  </Text>
</TouchableOpacity>
```

#### Database Schema
```sql
CREATE TABLE post_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forum_posts(id),
  product_id TEXT NOT NULL,           -- Shopify product ID
  product_handle TEXT,                -- URL handle
  product_title TEXT,
  product_image TEXT,
  product_price DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6.2 GemMaster Chatbot Integration
**Files:**
- `gem-mobile/src/screens/GemMaster/GemMasterScreen.js`
- `gem-mobile/src/components/GemMaster/ProductRecommendation.js`
- `gem-mobile/src/services/shopRecommendationService.js`

#### Context-Based Recommendations
```javascript
// AI determines relevant products based on conversation
const getRecommendations = async (userMessage, context) => {
  // Keywords extraction
  const keywords = extractKeywords(userMessage);

  // Map keywords to tags
  const tags = mapKeywordsToTags(keywords);
  // Example: "tình yêu" → ["Thạch Anh Hồng", "Rose Quartz"]

  // Fetch matching products
  const products = await shopifyService.getProductsByTags(tags, 4);

  return products;
};
```

#### ProductRecommendation Component
```javascript
// Displays in chat message
<Animatable.View animation="fadeInRight" duration={500}>
  <Text style={styles.title}>Sản phẩm gợi ý</Text>
  <FlatList
    horizontal
    data={products}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => navigateToProduct(item)}
        style={styles.productCard}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </TouchableOpacity>
    )}
  />
</Animatable.View>
```

#### Navigation from Chat
```javascript
// Navigate to product detail
const navigateToProduct = (product) => {
  navigation.navigate('MainTabs', {
    screen: 'ShopTab',
    params: {
      screen: 'ProductDetail',
      params: { product }
    }
  });
};
```

---

### 6.3 GEM Currency Purchase
**Files:**
- `gem-mobile/src/services/gemEconomyService.js`
- `gem-mobile/src/screens/Wallet/BuyGemsScreen.js`
- Database: `gem_packs`, `gems_transactions`, `profiles.gems`

#### GEM Configuration
```javascript
const GEM_CONFIG = {
  RATE: 100,                    // 1 gem = 100 VND
  DAILY_CHECKIN: 5,             // gems per day
  STREAK_7_BONUS: 20,           // 7-day streak bonus
  STREAK_30_BONUS: 100,         // 30-day streak bonus
  WELCOME_BONUS: 50,            // New user bonus
  PENDING_CREDIT_EXPIRY: 90,    // Days before pending expires
};
```

#### GEM Pack Model
```typescript
interface GemPack {
  id: string;
  slug: string;                  // 'starter', 'premium', etc.
  gems_quantity: number;         // Base gems
  bonus_gems: number;            // Bonus gems
  total_gems: number;            // quantity + bonus
  price: number;                 // VND price
  display_order: number;
  is_active: boolean;
  shopify_variant_id: string;    // Linked Shopify variant
  vnd_per_gem: number;           // Calculated
  savings_percent: number;       // vs base rate
}
```

#### Purchase Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    GEM PURCHASE FLOW                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. BUY GEMS SCREEN                                           │
│    - Display available gem packs                             │
│    - Show price, bonus, savings                              │
│    - User selects pack                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CREATE PURCHASE ORDER                                     │
│    gemEconomyService.createPurchaseOrder()                   │
│    - Status: 'initiated'                                     │
│    - Stores: userId, packId, gemAmount, etc.                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SHOPIFY CHECKOUT                                          │
│    - Add gem pack variant to cart                            │
│    - Navigate to CheckoutWebView                             │
│    - productType: 'gems'                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. THANK YOU PAGE DETECTED                                   │
│    ⚠️ IMPORTANT: This is ORDER CREATED, NOT payment done!   │
│    - Navigate to GemPurchasePending                          │
│    - Show "Waiting for payment confirmation"                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼ (Webhook)
┌─────────────────────────────────────────────────────────────┐
│ 5. SHOPIFY WEBHOOK (order.paid)                              │
│    - Verify payment completed                                │
│    - Extract gem pack info                                   │
│    - Call gemEconomyService.creditGems()                     │
│    - Update profiles.gems                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. GEMS CREDITED                                             │
│    - User's gem balance updated                              │
│    - Transaction logged in gems_transactions                 │
│    - Show success notification                               │
└─────────────────────────────────────────────────────────────┘
```

#### Key Methods
```javascript
// Get user's gem balance
async getGemBalance(userId: string): Promise<number>

// Get available gem packs
async getGemPacks(): Promise<GemPack[]>

// Get pack by Shopify variant
async getGemPackByVariantId(variantId: string): Promise<GemPack | null>

// Create pending purchase order
async createPurchaseOrder(userId: string, pack: GemPack): Promise<Order>

// Credit gems after payment confirmed
async creditGems(userId: string, amount: number, source: string): Promise<void>

// Format gem display
formatGemAmount(amount: number): string  // "1.2K", "10K", etc.
```

---

### 6.4 Course Access Integration
**Files:**
- `gem-mobile/src/services/courseAccessService.js`
- `gem-mobile/src/screens/Courses/CourseDetailScreen.js`
- `gem-mobile/src/screens/Courses/CourseCheckout.js`
- Database: `course_enrollments`, `shopify_courses`

#### Access Types
| Type | Description |
|------|-------------|
| admin_grant | Admin manually granted |
| shopify_purchase | Purchased via Shopify |
| tier_unlock | Unlocked by subscription tier |
| gift | Gifted by another user |

#### Course-Shopify Linking
```sql
-- Link courses to Shopify products
CREATE TABLE shopify_courses (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  shopify_product_id TEXT NOT NULL,
  shopify_variant_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Purchase Flow
```
┌─────────────────────────────────────────────────────────────┐
│                 COURSE PURCHASE FLOW                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. COURSE DETAIL SCREEN                                      │
│    - Show course info, lessons preview                       │
│    - Check if user has access                                │
│    - Show price if not enrolled                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ (No access)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. COURSE CHECKOUT                                           │
│    - Get linked Shopify product                              │
│    - Add to cart                                             │
│    - Navigate to CheckoutWebView                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SHOPIFY CHECKOUT                                          │
│    - Complete payment                                        │
│    - Webhook triggered                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. WEBHOOK HANDLER                                           │
│    - Identify course product                                 │
│    - Call courseAccessService.grantAccess()                  │
│    - Create enrollment record                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ACCESS GRANTED                                            │
│    - User can access all lessons                             │
│    - Progress tracking begins                                │
│    - Certificate available on completion                     │
└─────────────────────────────────────────────────────────────┘
```

#### Key Methods
```javascript
// Check if user has course access
async checkAccess(userId: string, courseId: string): Promise<boolean>

// Grant access after purchase
async grantAccess({
  userId: string,
  courseId: string,
  accessType: 'shopify_purchase',
  durationDays?: number    // Optional: null = lifetime
}): Promise<Enrollment>

// Revoke access (admin)
async revokeAccess(userId: string, courseId: string): Promise<void>

// Get user's enrolled courses
async getEnrolledCourses(userId: string): Promise<Course[]>

// Get course students (admin)
async getCourseStudents(courseId: string): Promise<Student[]>

// Get student progress
async getStudentProgress(
  userId: string,
  courseId: string
): Promise<Progress>
```

---

### 6.5 Vision Board Integration
**Files:**
- `gem-mobile/src/screens/VisionBoard/`
- `gem-mobile/src/services/visionBoardService.js`

#### Goal-Product Mapping
```javascript
// Map vision board goals to product recommendations
const GOAL_PRODUCT_MAPPING = {
  'wealth': ['Thạch Anh Vàng', 'Citrine', 'Cây Tài Lộc'],
  'love': ['Thạch Anh Hồng', 'Rose Quartz'],
  'health': ['Thạch Anh Tím', 'Amethyst'],
  'career': ['Mắt Hổ', 'Tiger Eye'],
  'protection': ['Obsidian', 'Black Tourmaline'],
};

// Get products for user's goals
async getProductsForGoals(goals: Goal[]): Promise<Product[]> {
  const tags = goals.flatMap(g => GOAL_PRODUCT_MAPPING[g.category] || []);
  return shopifyService.getProductsByTags(tags, 8);
}
```

---

### 6.6 Affiliate System Integration
**Files:**
- `gem-mobile/src/services/affiliateService.js`
- `gem-mobile/src/components/Affiliate/ProductAffiliateLinkSheet.js`
- Database: `affiliate_profiles`, `affiliate_codes`, `affiliate_commissions`

#### Affiliate Link Generation
```javascript
// Generate shareable affiliate link
async generateAffiliateLink(
  userId: string,
  productId: string
): Promise<string> {
  const affiliateCode = await getOrCreateCode(userId);
  return `${SHOP_URL}/products/${productHandle}?ref=${affiliateCode}`;
}
```

#### Commission Tracking
```javascript
// Track affiliate sale
async trackAffiliateSale(
  orderId: string,
  affiliateCode: string,
  orderTotal: number
): Promise<void> {
  const commission = orderTotal * COMMISSION_RATE; // e.g., 10%

  await supabase.from('affiliate_commissions').insert({
    affiliate_code: affiliateCode,
    order_id: orderId,
    order_total: orderTotal,
    commission_amount: commission,
    status: 'pending'
  });
}
```

#### ProductAffiliateLinkSheet
```
┌─────────────────────────────────────┐
│ Chia Sẻ Sản Phẩm              [X]  │
├─────────────────────────────────────┤
│ [img] Product Name                  │
│       ₫500,000                      │
├─────────────────────────────────────┤
│ Link giới thiệu của bạn:            │
│ ┌─────────────────────────────────┐ │
│ │ https://shop.gem.vn/...?ref=ABC │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Hoa hồng: 10% (₫50,000)            │
├─────────────────────────────────────┤
│ [📋 Copy Link] [📤 Share]          │
└─────────────────────────────────────┘
```

---

## 7. DESIGN SYSTEM

### 7.1 Color Palette
**Path:** `gem-mobile/src/utils/tokens.js`

#### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| burgundy | #9C0612 | Primary buttons, CTAs |
| burgundyDark | #6B0F1A | Button pressed state |
| burgundyLight | #C41E2A | Hover effects |
| gold | #FFBD59 | Premium, prices, accents |
| goldBright | #FFD700 | Emphasis, highlights |

#### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| purple | #6A5BFF | Interactive elements |
| purpleGlow | #8C64FF | Glow effects |
| cyan | #00F0FF | Links, prices |

#### Status Colors
| Name | Hex | Usage |
|------|-----|-------|
| success | #3AF7A6 | Success states, positive |
| error | #FF6B6B | Errors, sale badges |
| warning | #FFB800 | Warnings, caution |
| info | #3B82F6 | Information |

#### Background Colors
| Name | Hex | Usage |
|------|-----|-------|
| background | #05040B | Main app background |
| bgMid | #0F1030 | Card backgrounds |
| bgLight | #1a0b2e | Elevated surfaces |

#### Glass Morphism
```javascript
const GLASS = {
  background: 'rgba(15, 16, 48, 0.55)',
  backgroundLight: 'rgba(15, 16, 48, 0.5)',
  backgroundHeavy: 'rgba(15, 16, 48, 0.6)',
  blur: 18,
  saturate: 180,
  borderWidth: 1.2,
  borderRadius: 18,
};
```

#### Text Colors
| Name | Value | Usage |
|------|-------|-------|
| textPrimary | #FFFFFF | Headings |
| textSecondary | rgba(255,255,255,0.8) | Body text |
| textMuted | rgba(255,255,255,0.6) | Labels |
| textSubtle | rgba(255,255,255,0.5) | Disabled |

---

### 7.2 Spacing Scale
```javascript
const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40,
};
```

---

### 7.3 Typography
```javascript
const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    xxxl: 18,
    display: 20,
    hero: 32,
    giant: 42,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  families: {
    primary: 'System',
    mono: 'Menlo',
  },
};
```

---

### 7.4 Component Styles

#### Glass Card
```javascript
const glassCard = {
  backgroundColor: GLASS.background,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  padding: SPACING.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
};
```

#### Primary Button
```javascript
const primaryButton = {
  backgroundColor: COLORS.burgundy,
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderWidth: 1.5,
  borderColor: COLORS.gold,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
};

const primaryButtonText = {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
};
```

#### Secondary Button
```javascript
const secondaryButton = {
  backgroundColor: 'transparent',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.5)',
};

const secondaryButtonText = {
  color: COLORS.gold,
  fontSize: 14,
  fontWeight: '600',
};
```

#### Sale Badge
```javascript
const saleBadge = {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: COLORS.error,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
};

const saleBadgeText = {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '700',
};
```

#### Cart Badge
```javascript
const cartBadge = {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: COLORS.burgundy,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  alignItems: 'center',
  justifyContent: 'center',
};

const cartBadgeText = {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '700',
};
```

---

### 7.5 Gradients
```javascript
const GRADIENTS = {
  background: ['#05040B', '#0F1030', '#1a0b2e'],
  backgroundLocations: [0, 0.5, 1],

  primaryButton: ['#9C0612', '#6B0F1A'],

  card: ['rgba(15, 16, 48, 0.55)', 'rgba(15, 16, 48, 0.45)'],

  gold: ['#FFBD59', '#FFD700'],
};
```

---

### 7.6 Animations

#### Header Auto-Hide
```javascript
// Spring animation for smooth hide/show
Animated.spring(headerTranslateY, {
  toValue: shouldHide ? -120 : 0,
  useNativeDriver: true,
  tension: 80,
  friction: 12,
}).start();
```

#### Product Card Press
```javascript
// Scale animation on press
Animated.spring(scale, {
  toValue: 0.95,
  useNativeDriver: true,
  tension: 100,
  friction: 5,
}).start();
```

#### Image Gallery Dots
```javascript
// Dot indicator animation
const dotStyle = {
  width: index === currentIndex ? 24 : 8,
  backgroundColor: index === currentIndex
    ? COLORS.purple
    : 'rgba(255,255,255,0.3)',
};
```

#### Success Checkmark
```javascript
// Scale-in animation
Animated.spring(checkmarkScale, {
  toValue: 1,
  friction: 3,
  tension: 40,
  useNativeDriver: true,
}).start();
```

---

## 8. USER FLOWS

### 8.1 Browse & Purchase Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSE & PURCHASE                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. SHOP TAB                                                  │
│    - Browse products by category                             │
│    - View trending/recommended                               │
│    - Search for specific products                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PRODUCT DETAIL                                            │
│    - View images, description, reviews                       │
│    - Select variant (size, color)                            │
│    - Choose quantity                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
   [Add to Cart]              [Buy Now]
        │                           │
        ▼                           │
   Cart Screen                      │
   - View items                     │
   - Update quantities              │
   - Remove items                   │
   - Apply discount code            │
        │                           │
        └───────────┬───────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CHECKOUT (WebView)                                        │
│    - Enter shipping address                                  │
│    - Select payment method                                   │
│    - Complete payment                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ORDER SUCCESS                                             │
│    - Confirmation message                                    │
│    - Order number                                            │
│    - Product recommendations                                 │
│    - Continue shopping / View orders                         │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Order Tracking Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER TRACKING                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. ORDERS LIST                                               │
│    - View all orders                                         │
│    - Filter by status                                        │
│    - See order summary                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ORDER DETAIL                                              │
│    - Status card with description                            │
│    - Order timeline                                          │
│    - Product list                                            │
│    - Shipping info                                           │
│    - Payment summary                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ (If shipped)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SHIPPING TRACKING                                         │
│    - Open carrier tracking page                              │
│    - Real-time location updates                              │
│    - Estimated delivery                                      │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Product Attachment Flow (Forum)
```
┌─────────────────────────────────────────────────────────────┐
│                 ATTACH PRODUCT TO POST                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE/EDIT POST                                          │
│    - Write content                                           │
│    - Add images/media                                        │
│    - Click [📎 Attach Product]                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PRODUCT PICKER MODAL                                      │
│    - Search products                                         │
│    - Multi-select (up to 10)                                │
│    - See price/image preview                                 │
│    - Confirm selection                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. POST SUBMITTED                                            │
│    - Products saved to post_products table                   │
│    - Badge shows on post card                                │
│    - Tap badge → Product Detail                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. DATA MODELS

### 9.1 Product Model
```typescript
interface Product {
  id: string;                    // Shopify product ID
  handle: string;                // URL-friendly identifier
  title: string;
  description: string;
  descriptionHtml?: string;

  // Pricing
  price: number;                 // Current price (first variant)
  compareAtPrice?: number;       // Original price (for sale)

  // Images
  image: string;                 // Main image URL
  images: Array<string | {src: string}>;
  featuredImage?: string;

  // Variants
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    image?: string;
    availableForSale: boolean;
    sku?: string;
  }>;

  // Metadata
  tags: string[];
  productType: string;
  vendor: string;
  available: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
```

### 9.2 Cart Model
```typescript
interface Cart {
  id: string;
  checkoutUrl: string;

  lines: Array<{
    id: string;
    quantity: number;
    merchandise: {
      id: string;                // Variant ID
      product: Product;
    };
  }>;

  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };

  totalQuantity: number;
}
```

### 9.3 Order Model
```typescript
interface Order {
  id: string;
  orderNumber: string;

  status: 'pending' | 'confirmed' | 'processing' |
          'shipped' | 'delivered' | 'cancelled';

  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    image?: string;
    variant?: string;
  }>;

  // Pricing
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;

  // Payment
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: string;

  // Shipping
  shippingAddress: {
    name: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };

  // Tracking
  trackingNumber?: string;
  trackingUrl?: string;

  // Status History
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;

  // Timestamps
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}
```

### 9.4 GEM Pack Model
```typescript
interface GemPack {
  id: string;
  slug: string;                  // 'starter', 'premium', etc.
  name: string;
  description?: string;

  // Gem amounts
  gems_quantity: number;         // Base gems
  bonus_gems: number;            // Bonus gems
  total_gems: number;            // quantity + bonus

  // Pricing
  price: number;                 // VND price
  vnd_per_gem: number;           // Calculated efficiency
  savings_percent: number;       // vs base rate

  // Shopify linking
  shopify_product_id: string;
  shopify_variant_id: string;

  // Status
  is_active: boolean;
  display_order: number;

  // Badge/promotion
  badge?: string;                // "Best Value", "Popular"
}
```

### 9.5 Review Model
```typescript
interface Review {
  id: string;
  product_id: string;

  // Author
  author: string;
  email?: string;
  verified: boolean;             // Verified purchase

  // Content
  rating: number;                // 1-5
  title?: string;
  body: string;

  // Media
  images: string[];

  // Timestamps
  created_at: string;
  updated_at?: string;

  // Moderation
  status: 'approved' | 'pending' | 'rejected';
}
```

---

## 10. ORDER MANAGEMENT

### 10.1 Order Service
**Path:** `gem-mobile/src/services/orderService.js`

#### Dual Storage Strategy
```javascript
// Local (immediate) + Remote (synced)
class OrderService {
  // Save locally after checkout success
  async saveLocalOrder(orderData) {
    const orders = await this.getLocalOrders();
    orders.unshift(orderData);
    await AsyncStorage.setItem('gem_orders', JSON.stringify(orders.slice(0, 50)));
  }

  // Get combined orders
  async getUserOrders(userId) {
    const [supabaseOrders, localOrders] = await Promise.all([
      this.getSupabaseOrders(userId),
      this.getLocalOrders()
    ]);

    return this.mergeOrders(supabaseOrders, localOrders);
  }

  // Deduplicate merged orders
  mergeOrders(remote, local) {
    const remoteIds = new Set(remote.map(o => o.id));
    const uniqueLocal = local.filter(o => !remoteIds.has(o.id));
    return [...remote, ...uniqueLocal].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}
```

#### Status Transitions
```
pending → confirmed → processing → shipped → delivered
           ↓
        cancelled
```

### 10.2 Order Tracking Service
**Path:** `gem-mobile/src/services/orderTrackingService.js`

#### Features
- Carrier integration (GHN, GHTK, Viettel Post)
- Real-time tracking updates
- Webhook for status changes
- Push notification triggers

---

## 11. ERROR HANDLING

### 11.1 Product Fetch Errors
```javascript
// Fallback chain for product data
async getProduct(productId) {
  try {
    // Try fresh fetch
    return await shopifyService.getProductById(productId);
  } catch (error) {
    // Try cached version
    const cached = await getCachedProduct(productId);
    if (cached) return cached;

    // Try by handle
    const handle = await getProductHandle(productId);
    if (handle) {
      return await shopifyService.getProductByHandle(handle);
    }

    throw new Error('Product not found');
  }
}
```

### 11.2 Checkout Errors
```javascript
// WebView error handling
<WebView
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    Alert.alert(
      'Lỗi kết nối',
      'Không thể tải trang thanh toán. Vui lòng thử lại.',
      [
        { text: 'Thử lại', onPress: () => webViewRef.current?.reload() },
        { text: 'Quay lại', onPress: () => navigation.goBack() }
      ]
    );
  }}
/>
```

### 11.3 Order Sync Errors
```javascript
// Graceful degradation
async getUserOrders(userId) {
  try {
    // Try Supabase first
    const orders = await supabase.from('orders').select('*');
    return orders;
  } catch (error) {
    console.warn('Supabase fetch failed, using local cache');
    return await this.getLocalOrders();
  }
}
```

---

## 12. PERFORMANCE OPTIMIZATIONS

### 12.1 Product Caching
```javascript
// Cache all products for tag-based queries
class ShopifyService {
  _productsCache = null;
  _productsCacheTime = 0;
  CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCachedProducts() {
    if (this._productsCache &&
        Date.now() - this._productsCacheTime < this.CACHE_DURATION) {
      return this._productsCache;
    }
    return null;
  }
}
```

### 12.2 Image Optimization
```javascript
// Use Shopify CDN transformations
const getOptimizedImageUrl = (url, width = 400) => {
  if (!url) return PLACEHOLDER_IMAGE;

  // Shopify CDN format
  if (url.includes('cdn.shopify.com')) {
    return url.replace(/\.([^.]+)$/, `_${width}x.$1`);
  }

  return url;
};
```

### 12.3 Lazy Loading
```javascript
// Infinite scroll pagination
const loadMoreProducts = async () => {
  if (loadingMore || !hasMore) return;

  setLoadingMore(true);
  const newProducts = await shopifyService.getProducts({
    first: 12,
    after: lastCursor
  });

  setProducts(prev => [...prev, ...newProducts]);
  setLoadingMore(false);
};
```

### 12.4 Section Parallel Loading
```javascript
// Load all sections simultaneously
useEffect(() => {
  const loadSections = async () => {
    const sectionPromises = SECTIONS.map(section =>
      loadSectionProducts(section.id)
    );

    await Promise.all(sectionPromises);
  };

  loadSections();
}, []);
```

---

## 13. FILE MANIFEST

```
gem-mobile/src/
├── screens/
│   ├── Shop/
│   │   ├── ShopScreen.js              # Main shop screen
│   │   ├── ProductDetailScreen.js     # Product detail
│   │   ├── ProductSearchScreen.js     # Search screen
│   │   ├── ProductListScreen.js       # Category listing
│   │   ├── CartScreen.js              # Shopping cart
│   │   ├── CheckoutWebView.js         # Shopify checkout
│   │   ├── index.js
│   │   └── components/
│   │       ├── ProductCard.js         # Product card
│   │       ├── ProductSection.js      # Section layout
│   │       └── ShopCategoryTabs.js    # Category tabs
│   ├── Orders/
│   │   ├── OrdersScreen.js            # Order list
│   │   └── OrderDetailScreen.js       # Order detail
│   ├── Wallet/
│   │   ├── BuyGemsScreen.js           # Gem purchase
│   │   ├── GemPurchasePending.js      # Pending confirmation
│   │   └── GemPurchaseSuccess.js      # Success screen
│   └── Courses/
│       └── CourseCheckout.js          # Course purchase
├── components/
│   ├── ProductPicker.js               # Product selection modal
│   ├── Affiliate/
│   │   └── ProductAffiliateLinkSheet.js
│   └── GemMaster/
│       └── ProductRecommendation.js   # AI recommendations
├── services/
│   ├── shopifyService.js              # Shopify API
│   ├── orderService.js                # Order management
│   ├── orderTrackingService.js        # Tracking
│   ├── gemEconomyService.js           # GEM currency
│   ├── courseAccessService.js         # Course access
│   ├── affiliateService.js            # Affiliate system
│   └── shopRecommendationService.js   # AI recommendations
└── utils/
    ├── tokens.js                      # Design tokens
    └── shopConfig.js                  # Shop configuration
```

---

## CHANGELOG

### Version 2.0 (2025-12-13)
- Complete Shop tab documentation
- Cross-feature integration specs
- GEM currency purchase flow
- Course access integration
- Affiliate system integration
- Forum product attachment
- GemMaster AI recommendations

### Version 1.0 (Initial)
- Basic shop functionality
- Shopify checkout integration
- Order management

---

**END OF DOCUMENT**

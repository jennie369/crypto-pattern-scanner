# GEM Mobile - Navigation Map

> **CRITICAL:** Luôn sử dụng đúng tên screen khi navigate. Đây là source of truth.

## Tab Navigator (MainTabs)

| Tab Name | Stack | Initial Screen |
|----------|-------|----------------|
| `Home` | HomeStack | ForumFeed |
| `Shop` | ShopStack | ShopMain |
| `Trading` | ScannerStack | ScannerMain |
| `GemMaster` | GemMasterStack | GemMasterMain |
| `Notifications` | - | NotificationsScreen |
| `Account` | AccountStack | AssetsHome |

---

## Navigation Examples

### Cross-Tab Navigation
```javascript
// ✅ ĐÚNG - Navigate từ bất kỳ đâu đến Shop > CheckoutWebView
navigation.navigate('Shop', {
  screen: 'CheckoutWebView',
  params: { checkoutUrl: '...', title: '...' },
});

// ❌ SAI - Tên tab sai
navigation.navigate('ShopTab', { ... });  // ShopTab không tồn tại!
navigation.navigate('HomeTab', { ... });  // HomeTab không tồn tại!
```

### Within Same Stack
```javascript
// Trong AccountStack
navigation.navigate('Wallet');
navigation.navigate('BuyGems');

// Trong HomeStack
navigation.navigate('PostDetail', { postId: '123' });
```

---

## HomeStack (Tab: Home)

| Screen Name | Component | Description |
|-------------|-----------|-------------|
| `ForumFeed` | ForumScreen | Trang chủ forum |
| `PostDetail` | PostDetailScreen | Chi tiết bài viết |
| `UserProfile` | UserProfileScreen | Profile user khác |
| `CreatePost` | CreatePostScreen | Tạo bài viết mới |
| `EditPost` | EditPostScreen | Sửa bài viết |
| `HashtagFeed` | HashtagFeedScreen | Feed theo hashtag |
| `Search` | SearchScreen | Tìm kiếm forum |
| `GlobalSearch` | GlobalSearchScreen | Tìm kiếm toàn app |
| `PostAnalytics` | PostAnalyticsScreen | Thống kê bài viết |
| `PostGifts` | PostGiftsScreen | Quà tặng bài viết |
| `FollowersList` | FollowersListScreen | Danh sách followers |
| `FollowingList` | FollowingListScreen | Danh sách following |
| `ProductDetail` | ProductDetailScreen | Sản phẩm từ post |

---

## ShopStack (Tab: Shop)

| Screen Name | Component | Description |
|-------------|-----------|-------------|
| `ShopMain` | ShopScreen | Trang chủ shop |
| `ProductSearch` | ProductSearchScreen | Tìm kiếm sản phẩm |
| `ProductList` | ProductListScreen | Danh sách sản phẩm |
| `ProductDetail` | ProductDetailScreen | Chi tiết sản phẩm |
| `Cart` | CartScreen | Giỏ hàng |
| `Checkout` | CheckoutScreen | Thanh toán |
| `CheckoutWebView` | CheckoutWebView | WebView Shopify checkout |
| `OrderSuccess` | OrderSuccessScreen | Đặt hàng thành công |
| `GemPurchaseSuccess` | GemPurchaseSuccessScreen | Mua gem thành công |
| `GemPurchasePending` | GemPurchasePendingScreen | Chờ xác nhận gem |
| `Orders` | OrdersScreen | Danh sách đơn hàng |
| `OrderDetail` | OrderDetailScreen | Chi tiết đơn hàng |

---

## ScannerStack (Tab: Trading)

| Screen Name | Component | Description |
|-------------|-----------|-------------|
| `ScannerMain` | ScannerScreen | Màn hình scanner chính |
| `PatternDetail` | PatternDetailScreen | Chi tiết pattern |
| `OpenPositions` | OpenPositionsScreen | Lệnh đang mở |
| `PaperTradeHistory` | PaperTradeHistoryScreen | Lịch sử paper trade |

---

## GemMasterStack (Tab: GemMaster)

| Screen Name | Component | Description |
|-------------|-----------|-------------|
| `GemMasterMain` | GemMasterScreen | Chatbot AI chính |
| `IChing` | IChingScreen | Bói Kinh Dịch |
| `Tarot` | TarotScreen | Bói Tarot |
| `ChatHistory` | ChatHistoryScreen | Lịch sử chat |

---

## AccountStack (Tab: Account)

### Profile & Settings
| Screen Name | Component |
|-------------|-----------|
| `AssetsHome` | AccountScreen |
| `ProfileSettings` | ProfileSettingsScreen |
| `ProfileFull` | ProfileFullScreen |
| `PrivacySettings` | PrivacySettingsScreen |
| `NotificationSettings` | NotificationSettingsScreen |
| `FollowersList` | FollowersListScreen |
| `FollowingList` | FollowingListScreen |

### Wallet & Gems
| Screen Name | Component |
|-------------|-----------|
| `Wallet` | WalletScreen |
| `BuyGems` | BuyGemsScreen |
| `GemPackList` | GemPackListScreen |
| `TransactionHistory` | TransactionHistoryScreen |
| `GiftCatalog` | GiftCatalogScreen |
| `GiftHistory` | GiftHistoryScreen |
| `DailyCheckin` | DailyCheckinScreen |
| `GemPurchaseSuccess` | GemPurchaseSuccessScreen |
| `GemPurchasePending` | GemPurchasePendingScreen |

### Affiliate & Earnings
| Screen Name | Component |
|-------------|-----------|
| `AffiliateDetail` | AffiliateDetailScreen |
| `AffiliateDashboard` | AffiliateScreen |
| `AffiliateWelcome` | AffiliateWelcomeScreen |
| `MarketingKits` | MarketingKitsScreen |
| `PartnershipRegistration` | PartnershipRegistrationScreen |
| `Earnings` | EarningsScreen |
| `EarningsHistory` | EarningsHistoryScreen |
| `Withdraw` | WithdrawScreen |
| `WithdrawRequest` | WithdrawRequestScreen |
| `WithdrawalHistory` | WithdrawalHistoryScreen |

### Vision Board
| Screen Name | Component |
|-------------|-----------|
| `VisionBoard` | VisionBoardScreen |
| `GoalDetail` | GoalDetailScreen |
| `Achievements` | AchievementsScreen |
| `VisionCalendar` | CalendarScreen |
| `DailyRecap` | DailyRecapScreen |
| `RitualHistory` | RitualHistoryScreen |

### Trading & Portfolio
| Screen Name | Component |
|-------------|-----------|
| `Portfolio` | PortfolioScreen |
| `PaperTradeHistory` | PaperTradeHistoryScreen |
| `TierUpgrade` | TierUpgradeScreen |

### Orders
| Screen Name | Component |
|-------------|-----------|
| `MyOrders` | OrdersScreen |
| `OrderDetail` | OrderDetailScreen |
| `LinkOrder` | LinkOrderScreen |

### Boost & Monetization
| Screen Name | Component |
|-------------|-----------|
| `BoostedPosts` | BoostedPostsScreen |
| `SelectPostForBoost` | SelectPostForBoostScreen |
| `BoostPost` | BoostPostScreen |
| `BoostAnalytics` | BoostAnalyticsScreen |

### Help & Others
| Screen Name | Component |
|-------------|-----------|
| `HelpSupport` | HelpSupportScreen |
| `HelpCenter` | HelpCenterScreen |
| `HelpCategory` | HelpCategoryScreen |
| `HelpArticle` | HelpArticleScreen |
| `Terms` | TermsScreen |
| `SavedPosts` | SavedPostsScreen |
| `CloseFriends` | CloseFriendsScreen |
| `SoundLibrary` | SoundLibraryScreen |
| `SoundDetail` | SoundDetailScreen |
| `UploadSound` | UploadSoundScreen |

---

## CourseStack

| Screen Name | Component |
|-------------|-----------|
| `CourseList` | CoursesScreen |
| `CourseDetail` | CourseDetailScreen |
| `LessonPlayer` | LessonPlayerScreen |
| `Quiz` | QuizScreen |
| `Certificate` | CertificateScreen |

---

## Auth Screens (Outside MainTabs)

| Screen Name | Component |
|-------------|-----------|
| `Login` | LoginScreen |
| `Signup` | SignupScreen |

---

## Common Navigation Patterns

### 1. Mở CheckoutWebView từ bất kỳ đâu
```javascript
navigation.navigate('Shop', {
  screen: 'CheckoutWebView',
  params: {
    checkoutUrl: 'https://shop.gemcrypto.vn/...',
    title: 'Thanh toán',
    returnScreen: 'Home', // Tab để quay về
  },
});
```

### 2. Mở Product Detail từ Post
```javascript
// Trong HomeStack - có ProductDetail riêng
navigation.navigate('ProductDetail', { product });

// Hoặc navigate sang Shop tab
navigation.navigate('Shop', {
  screen: 'ProductDetail',
  params: { product },
});
```

### 3. Navigate đến Profile user
```javascript
navigation.navigate('UserProfile', { userId: '123' });
```

### 4. Navigate đến Wallet
```javascript
navigation.navigate('Account', {
  screen: 'Wallet',
});
```

---

## ⚠️ Common Mistakes

```javascript
// ❌ SAI - Tab names sai
navigation.navigate('ShopTab', ...);      // Không có ShopTab
navigation.navigate('HomeTab', ...);      // Không có HomeTab
navigation.navigate('TradingTab', ...);   // Không có TradingTab

// ✅ ĐÚNG - Tab names đúng
navigation.navigate('Shop', ...);
navigation.navigate('Home', ...);
navigation.navigate('Trading', ...);

// ❌ SAI - Screen name sai
navigation.navigate('Scanner', ...);      // Không có, phải là ScannerMain
navigation.navigate('GemMaster', ...);    // Đây là tab, không phải screen

// ✅ ĐÚNG
navigation.navigate('Trading', { screen: 'ScannerMain' });
navigation.navigate('GemMaster', { screen: 'GemMasterMain' });
```

# 📱 GEM iOS APP - FINAL NAVIGATION STRUCTURE (6 TABS)

**Updated:** January 21, 2025  
**Status:** FINAL - Ready to implement

---

## 🎯 6 TABS CUỐI CÙNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Content Area                                        │
│                    (Active Tab Screen)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│   [🏠]      [🛒]      [📊]            [🤖]             [🔔]       [💰]                │
│   Home      Shop   Giao Dịch  Gem Master  Notifications Tài Sản              │
│  ACTIVE                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ **HOME** 🏠 → `/forum`

**Icon:** Home (home)  
**Tên:** Home  
**Route:** `/forum`  
**Screen:** ForumScreen

**Chức năng:**
- ✅ Forum/Community feed (CHÍNH)
- ✅ Trending posts
- ✅ Following feed
- ✅ Create post
- ✅ Categories

**Layout:**

```
ForumScreen
├─ Header:
│   ├─ Logo: 💎 GEM
│   ├─ Search icon
│   └─ Profile avatar (tap → Account)
│
├─ Category Tabs (horizontal scroll)
│   ├─ All
│   ├─ Following
│   ├─ Trading
│   ├─ Patterns
│   ├─ Spiritual
│   ├─ Success
│   └─ Q&A
│
├─ Post Feed (FlatList)
│   ├─ PostCard:
│   │   ├─ Author (avatar + name + badges)
│   │   ├─ Timestamp
│   │   ├─ Category tag
│   │   ├─ Title
│   │   ├─ Content preview
│   │   ├─ Image (if any)
│   │   ├─ Trade levels (if trading post)
│   │   ├─ Engagement (👍 likes, 💬 comments)
│   │   └─ Tap → PostDetailScreen
│   └─ Pull-to-refresh
│
└─ FAB Button (bottom right)
    └─ Create Post
```

**Features:**
- ✅ Infinite scroll
- ✅ Pull-to-refresh
- ✅ Like/Unlike posts
- ✅ Comment on posts
- ✅ Share posts
- ✅ Follow/Unfollow users
- ✅ Report posts
- ✅ Filter by category
- ✅ Search posts

**Web App Equivalent:**
- Web: `/forum` (Forum page)
- Mobile: Home tab (default landing)

**Why Home = Forum?**
- ✅ Community first approach
- ✅ User engagement on open
- ✅ Social feed like Facebook/Instagram
- ✅ Sticky/viral content

---

## 2️⃣ **SHOP** 🛒 → `/shop`

**Icon:** Shopping bag (shopping-bag)  
**Tên:** Shop  
**Route:** `/shop`  
**Screen:** ShopScreen

**Chức năng:**
- ✅ E-commerce store
- ✅ Products catalog
- ✅ Cart management
- ✅ Checkout
- ✅ Order tracking

**Layout:**

```
ShopScreen
├─ Header:
│   ├─ Search bar
│   └─ Cart icon (badge: item count)
│
├─ Banner Carousel
│   └─ Promotions, Featured products
│
├─ Categories (horizontal scroll)
│   ├─ 💎 Crystals & Spiritual
│   ├─ 📚 Courses
│   ├─ ⭐ Subscriptions
│   ├─ 📦 Merchandise
│   └─ 🎁 Gift Cards
│
├─ Featured Section
│   ├─ New Arrivals
│   ├─ Best Sellers
│   └─ On Sale
│
├─ Product Grid (2 columns)
│   └─ ProductCard:
│       ├─ Image
│       ├─ Name
│       ├─ Price
│       ├─ Original price (strikethrough if sale)
│       ├─ Discount badge
│       ├─ Rating (stars)
│       ├─ Quick add to cart button
│       └─ Tap → ProductDetailScreen
│
└─ Bottom Sheet (when cart has items)
    └─ Cart summary + Checkout button
```

**Product Categories:**

### **💎 Crystals & Spiritual:**
- Natural gemstones
- Crystal grids
- Meditation tools
- Incense & candles
- Tarot/Oracle decks
- Feng shui items

### **📚 Courses:**
- GEM Pattern Method Course
- Advanced Trading Strategies
- Risk Management Mastery
- Spiritual Trading Mindset
- I Ching for Traders
- Recorded webinars

### **⭐ Subscriptions:**
- TIER 1 - BASIC (11M VND/tháng)
- TIER 2 - PRO (21M VND/tháng)
- TIER 3 - VIP (68M VND/tháng)
- Annual plans (20% discount)
- Auto-renewal options

### **📦 Merchandise:**
- GEM branded apparel
- Trading notebooks
- Mouse pads
- Stickers
- Coffee mugs

### **🎁 Gift Cards:**
- Digital gift cards
- Amount options (500K - 5M VND)
- Send to others
- Redeemable for any product

**Features:**
- ✅ Product search & filter
- ✅ Add to cart
- ✅ Cart management (update quantity, remove)
- ✅ Wishlist/Save for later
- ✅ Product reviews & ratings
- ✅ Related products
- ✅ Checkout flow (Shopify)
- ✅ Order history
- ✅ Order tracking
- ✅ Payment integration (Shopify)

**Web App Equivalent:**
- Web: `/shop` + YinYangMasters.com integration
- Mobile: Shop tab (native shopping experience)

**Integration:**
- ✅ Shopify API (same as web)
- ✅ Product sync
- ✅ Cart persistence
- ✅ Order webhooks → Auto upgrade TIER

---

## 3️⃣ **GIAO DỊCH** 📊 → `/scannerv2`

**Icon:** Chart trending up (trending-up hoặc chart-line)  
**Tên:** Giao Dịch  
**Route:** `/scannerv2`  
**Screen:** ScannerScreen

**Chức năng:**
- ✅ Pattern scanner (CORE)
- ✅ Live market data
- ✅ Pattern detection
- ✅ Trading signals
- ✅ Chart analysis

**Layout:**

```
ScannerScreen
├─ Header:
│   ├─ Title: Pattern Scanner
│   ├─ Settings icon (scanner config)
│   └─ Help icon
│
├─ Scanner Controls:
│   ├─ Coin Selector (dropdown)
│   │   └─ BTCUSDT, ETHUSDT, BNBUSDT, etc.
│   │
│   ├─ Timeframe Buttons (horizontal)
│   │   └─ [5m] [15m] [1H] [4H] [1D] [1W]
│   │
│   ├─ Pattern Filter (dropdown)
│   │   └─ All, Reversal, Continuation, HFZ/LFZ
│   │
│   └─ [Scan Now] Button
│       └─ Gold button with burgundy shadow
│
├─ Pattern List (FlatList)
│   ├─ PatternCard:
│   │   ├─ Pattern Type Badge (DPD, UPU, etc.)
│   │   ├─ Symbol + Timeframe
│   │   ├─ Confidence Bar (70-95%)
│   │   ├─ Entry Price
│   │   ├─ R:R Ratio (1:2, 1:3, etc.)
│   │   ├─ Timestamp
│   │   ├─ Status (Fresh/Tested/Weak)
│   │   └─ Tap → PatternDetailScreen
│   │
│   ├─ Pull-to-refresh
│   └─ Loading state / Empty state
│
└─ Quick Actions (bottom)
    ├─ [Filter] button
    ├─ [Sort] button
    └─ [My Alerts] button
```

**PatternDetailScreen:**
```
PatternDetailScreen
├─ Header:
│   ├─ Back button
│   ├─ Pattern name
│   └─ Share icon
│
├─ Pattern Info Card:
│   ├─ Symbol + Timeframe
│   ├─ Confidence percentage (circular progress)
│   ├─ Detection time
│   └─ Status badge
│
├─ Trading Levels:
│   ├─ Entry Price (green)
│   ├─ Stop Loss (red)
│   ├─ Take Profit 1 (gold)
│   ├─ Take Profit 2 (gold)
│   └─ R:R Ratio
│
├─ Chart View:
│   └─ TradingView WebView
│       └─ Chart with pattern marked
│
├─ Pattern Description:
│   ├─ What is this pattern?
│   ├─ How to trade it?
│   └─ Success rate stats
│
└─ Action Buttons:
    ├─ [Paper Trade] - Add to journal
    ├─ [Set Alert] - Price alert
    ├─ [Share] - Share to community
    └─ [More Info] - Pattern wiki
```

**Features:**
- ✅ Real-time pattern detection
- ✅ Multiple timeframes
- ✅ Multiple symbols
- ✅ Filter & sort patterns
- ✅ Pattern details with chart
- ✅ Trading levels display
- ✅ Paper trade mode
- ✅ Price alerts
- ✅ Pattern statistics
- ✅ Success rate tracking
- ✅ Real-time updates (Supabase subscriptions)

**Scanner Logic (REUSE from web):**
- Copy: `frontend/src/services/patternDetection.js`
- Copy: `frontend/src/services/responseDetector.js`
- Copy: `frontend/src/utils/constants.js`
- Adapt UI only

**Web App Equivalent:**
- Web: `/scannerv2` (Scanner V2 page)
- Mobile: Giao Dịch tab (same functionality)

**Data Source:**
- Supabase `patterns` table
- Real-time subscription for new patterns
- Binance API for current prices

---

## 4️⃣ **Gem Master** 🤖

**Icon:** Robot (robot)  
**Tên:** GEM Master  
**Route:** `/Gem Master` (internal)  
**Screen:** Gem MasterScreen

**Chức năng:**
- ✅ AI chat (I Ching, Tarot, Tử Vi)
- ✅ Trading advice
- ✅ Spiritual guidance
- ✅ Interactive Dashboard
- ✅ Widget creation

**Layout:**

```
Gem MasterScreen
├─ Header:
│   ├─ Back button
│   ├─ Title: GEM Master
│   ├─ Info icon (about Gem Master)
│   └─ Dashboard button (top right)
│
├─ Chat Messages (inverted FlatList)
│   ├─ User Message (right aligned):
│   │   └─ Blue bubble with white text
│   │
│   ├─ AI Message (left aligned):
│   │   ├─ Gold bubble with dark text
│   │   ├─ Avatar (gem emoji 💎)
│   │   └─ Widget prompt (if detected)
│   │
│   └─ Typing Indicator (when AI is responding)
│       └─ Animated dots
│
├─ Widget Prompt (when AI response triggers):
│   ├─ Preview card
│   ├─ [Add to Dashboard] button
│   └─ [Dismiss] button
│
└─ Input Bar (bottom):
    ├─ Text input (multiline)
    ├─ Emoji button
    ├─ Image upload button
    └─ Send button (gold)
```

**DashboardScreen (nested):**
```
DashboardScreen (accessed from Gem Master header)
├─ Header:
│   ├─ Back to Chat
│   ├─ Title: My Dashboard
│   └─ [+ Add Widget] FAB
│
├─ Widget Grid (drag & drop):
│   ├─ Goal Card Widget:
│   │   ├─ Goal name
│   │   ├─ Progress bar
│   │   ├─ Target date
│   │   └─ Tap to edit
│   │
│   ├─ Affirmation Widget:
│   │   ├─ Daily affirmation text
│   │   ├─ Tap to change
│   │   └─ Mark as complete
│   │
│   ├─ Action Plan Widget:
│   │   ├─ Task checklist
│   │   ├─ Check/uncheck items
│   │   └─ Progress indicator
│   │
│   └─ Crystal Grid Widget:
│       ├─ Recommended crystals
│       ├─ Purpose/intention
│       └─ Tap to shop
│
└─ Empty State:
    └─ "Start chatting to create widgets"
```

**Features:**
- ✅ AI conversation (OpenAI/Claude API)
- ✅ Response detection (triggers widget creation)
- ✅ Widget factory (creates widgets from AI)
- ✅ Interactive dashboard
- ✅ Widget management (add/edit/delete)
- ✅ Drag & drop widgets
- ✅ Widget persistence (Supabase)
- ✅ Chat history
- ✅ Quick replies
- ✅ Image attachments

**AI Integration (REUSE from web):**
- Copy: `src/services/responseDetector.js` - 100%
- Copy: `src/services/dataExtractor.js` - 100%
- Copy: `src/services/widgetFactory.js` - 100%
- Only adapt UI components

**Web App Equivalent:**
- Web: `/Gem Master` + `/dashboard`
- Mobile: Gem Master tab + nested Dashboard

---

## 5️⃣ **NOTIFICATIONS** 🔔

**Icon:** Bell (bell)  
**Tên:** Thông Báo  
**Route:** `/notifications` (internal)  
**Screen:** NotificationsScreen

**Chức năng:**
- ✅ All notifications center
- ✅ Trading alerts
- ✅ Community notifications
- ✅ System updates
- ✅ Deep linking

**Layout:**

```
NotificationsScreen
├─ Header:
│   ├─ Title: Thông Báo
│   ├─ Mark all as read button
│   └─ Settings icon
│
├─ Filter Tabs (horizontal):
│   ├─ Tất Cả (badge: total unread)
│   ├─ Giao Dịch (trading alerts)
│   ├─ Cộng Đồng (community)
│   └─ Hệ Thống (system)
│
├─ Notification List (FlatList):
│   ├─ NotificationCard:
│   │   ├─ Type Icon (left):
│   │   │   ├─ 📊 Trading
│   │   │   ├─ 👥 Community
│   │   │   ├─ 💬 Message
│   │   │   └─ ⚙️ System
│   │   │
│   │   ├─ Content (center):
│   │   │   ├─ Title (bold if unread)
│   │   │   ├─ Message
│   │   │   └─ Timestamp
│   │   │
│   │   ├─ Unread Indicator (right):
│   │   │   └─ Gold dot if unread
│   │   │
│   │   ├─ Tap → Navigate to related screen
│   │   └─ Swipe left → Delete
│   │
│   └─ Load more on scroll
│
└─ Empty State:
    └─ "Chưa có thông báo nào"
```

**Notification Types:**

### **📊 Giao Dịch (Trading):**
- Pattern detected: "DPD pattern found on BTCUSDT 1H"
- Entry hit: "Entry price reached for [pattern]"
- Stop loss hit: "Stop loss triggered for [symbol]"
- Take profit hit: "Take profit 1 reached!"
- Price alert: "BTCUSDT reached 45,000"
- Paper trade update: "Your paper trade closed with +15%"

### **👥 Cộng Đồng (Community):**
- New reply: "[User] replied to your post"
- Post liked: "[User] liked your post"
- Mentioned: "[User] mentioned you in a comment"
- New follower: "[User] started following you"
- Event reminder: "Event [Name] starts in 1 hour"

### **💬 Tin Nhắn (Messages):**
- New DM: "New message from [User]"
- Group message: "New message in [Group]"

### **⚙️ Hệ Thống (System):**
- App update: "New version available"
- Maintenance: "Scheduled maintenance tomorrow"
- New feature: "Check out the new backtesting tool!"
- TIER renewal: "Your TIER 1 subscription renews in 3 days"
- Promotion: "50% off all courses this weekend!"

**Features:**
- ✅ Badge on tab icon (unread count)
- ✅ Push notifications (FCM)
- ✅ Deep linking (tap → relevant screen)
- ✅ Filter by type
- ✅ Swipe to delete
- ✅ Mark as read/unread
- ✅ Mark all as read
- ✅ Notification settings
- ✅ Do Not Disturb mode
- ✅ Sound/vibration preferences

**Deep Linking Examples:**
```
Trading alert → Giao Dịch tab (pattern detail)
Post reply → Home tab (post detail)
New message → Messages screen (in Account?)
Price alert → Giao Dịch tab (chart)
```

**Web App Equivalent:**
- Web: Notification bell icon (header) + dropdown
- Mobile: Dedicated tab (better UX)

---

## 6️⃣ **TÀI SẢN** 💰 → `/account`

**Icon:** Wallet hoặc Account circle (wallet hoặc account-circle)  
**Tên:** Tài Sản  
**Route:** `/account`  
**Screen:** AccountScreen

**Chức năng:**
- ✅ User profile & assets
- ✅ Trading statistics
- ✅ Settings & preferences
- ✅ Account management

**Layout:**

```
AccountScreen
├─ User Card (top):
│   ├─ Avatar (large, tap to edit)
│   ├─ Display Name
│   ├─ Email
│   ├─ TIER Badge (gold/silver/bronze)
│   ├─ Level Badge (Beginner/Advanced/Expert)
│   └─ Edit Profile button
│
├─ Stats Cards (3 cards, horizontal scroll):
│   ├─ Trading Stats:
│   │   ├─ Total Trades: 156
│   │   ├─ Win Rate: 68%
│   │   └─ Total P&L: +45%
│   │
│   ├─ Portfolio Value:
│   │   ├─ Total Value: $12,450
│   │   ├─ Today's Change: +2.5%
│   │   └─ View Portfolio button
│   │
│   └─ Community Stats:
│       ├─ Posts: 42
│       ├─ Followers: 128
│       └─ Following: 89
│
├─ Quick Actions (grid, 3 columns):
│   ├─ Row 1:
│   │   ├─ 📊 Portfolio
│   │   ├─ 📖 Trading Journal
│   │   └─ 🛠️ Tools
│   │
│   ├─ Row 2:
│   │   ├─ ⚙️ Settings
│   │   ├─ 🤝 Affiliate
│   │   └─ 💳 Upgrade TIER
│   │
│   ├─ Row 3:
│   │   ├─ 🏆 Achievements
│   │   ├─ 📅 Events
│   │   └─ 💬 Messages
│   │
│   └─ Row 4:
│       ├─ 📊 Analytics
│       ├─ 📚 My Courses
│       └─ 🛒 My Orders
│
├─ Recent Activity:
│   ├─ Recent Trades (last 5)
│   ├─ Recent Posts (last 3)
│   └─ View All button
│
└─ Footer:
    ├─ [Help Center] button
    ├─ [Privacy Policy] button
    └─ [🔐 Đăng Xuất] button (red)
```

**Sub-Screens:**

### **Portfolio Screen:**
```
PortfolioScreen
├─ Total Value Card
├─ Asset Allocation (pie chart)
├─ Holdings List:
│   └─ AssetCard:
│       ├─ Symbol + Name
│       ├─ Quantity
│       ├─ Avg Price
│       ├─ Current Price
│       ├─ P&L ($ & %)
│       └─ Tap to view detail
└─ [+ Add Position] button
```

### **Trading Journal Screen:**
```
JournalScreen
├─ Stats Summary (top)
├─ Filter/Sort options
├─ Trade List:
│   └─ TradeCard:
│       ├─ Symbol
│       ├─ Entry/Exit
│       ├─ P&L
│       ├─ Date
│       └─ Tap to edit
└─ [+ Add Trade] FAB
```

### **Tools Menu Screen:**
```
ToolsScreen
├─ TIER 1 Section:
│   ├─ Risk Calculator
│   ├─ Position Size Calculator
│   └─ Trading Journal (link)
│
├─ TIER 2 Section (locked if tier insufficient):
│   ├─ Multi-Timeframe Analysis
│   ├─ Sentiment Analyzer
│   ├─ Market Screener
│   ├─ S/R Levels
│   ├─ Volume Analysis
│   ├─ News Calendar
│   └─ Portfolio Tracker (link)
│
└─ TIER 3 Section (locked if tier insufficient):
    ├─ Advanced Backtesting
    ├─ AI Prediction
    └─ Whale Tracker
```

### **Settings Screen:**
```
SettingsScreen
├─ Account:
│   ├─ Edit Profile
│   ├─ Change Password
│   └─ Email Preferences
│
├─ Notifications:
│   ├─ Push Notifications (toggle)
│   ├─ Trading Alerts (toggle)
│   ├─ Community Notifications (toggle)
│   ├─ Sound (toggle)
│   └─ Vibration (toggle)
│
├─ Trading:
│   ├─ Default Timeframe
│   ├─ Default Risk %
│   └─ Paper Trade Mode (toggle)
│
├─ Appearance:
│   ├─ Theme (Light/Dark/Auto)
│   └─ Language (Tiếng Việt/English)
│
├─ Privacy & Security:
│   ├─ Biometric Login (Face ID/Touch ID)
│   ├─ Two-Factor Auth
│   └─ Privacy Policy
│
└─ About:
    ├─ App Version
    ├─ Terms of Service
    ├─ Help Center
    └─ Contact Support
```

### **Affiliate Screen:**
```
AffiliateScreen
├─ Referral Code Card:
│   ├─ Your Code: JENNIE369
│   ├─ [Copy] button
│   └─ [Share] button
│
├─ Stats Cards:
│   ├─ Total Referrals: 12
│   ├─ Active Referrals: 8
│   ├─ Total Earnings: 2.4M VND
│   └─ Pending: 600K VND
│
├─ Commission Tiers:
│   ├─ Direct (50%): 1.2M VND
│   ├─ Level 2 (25%): 800K VND
│   ├─ Level 3 (15%): 300K VND
│   └─ Level 4 (10%): 100K VND
│
├─ Referral List:
│   └─ ReferralCard:
│       ├─ User name
│       ├─ Join date
│       ├─ Status (Active/Inactive)
│       ├─ Tier purchased
│       └─ Your commission
│
└─ [Withdraw] Button (if balance > 1M)
```

**Features:**
- ✅ Complete user profile
- ✅ Trading & portfolio stats
- ✅ All tools access
- ✅ Settings & preferences
- ✅ Affiliate management
- ✅ Recent activity
- ✅ Messages (DM)
- ✅ Events (RSVP'd)
- ✅ Achievements
- ✅ Logout

**Web App Equivalent:**
- Web: `/account` + various sub-pages
- Mobile: Tài Sản tab (all in one place)

---

## 📊 FINAL NAVIGATION TABLE

| # | Tab Name | Icon | Route | Screen | Main Features |
|---|----------|------|-------|--------|---------------|
| 1 | **Home** | 🏠 | `/forum` | ForumScreen | Forum posts, Community feed, Categories |
| 2 | **Shop** | 🛒 | `/shop` | ShopScreen | Products, Courses, Subscriptions, Cart |
| 3 | **Giao Dịch** | 📊 | `/scannerv2` | ScannerScreen | Pattern scanner, Charts, Trading signals |
| 4 | **Gem Master** | 🤖 | `/Gem Master` | Gem MasterScreen | AI chat, Dashboard, Widgets |
| 5 | **Notifications** | 🔔 | `/notifications` | NotificationsScreen | All alerts, Deep linking |
| 6 | **Tài Sản** | 💰 | `/account` | AccountScreen | Profile, Portfolio, Settings, Tools |

---

## 🎨 DESIGN SPECS

**Tab Bar Style:**
```javascript
{
  backgroundColor: COLORS.navy,           // #112250
  borderTopColor: COLORS.gold,            // #FFBD59
  borderTopWidth: 2,
  height: 70,                             // Slightly taller for 6 tabs
  paddingBottom: 10,
  paddingTop: 10,
}
```

**Tab Item Style:**
```javascript
// Active Tab
{
  color: COLORS.gold,                     // #FFBD59
  fontSize: 11,                           // Smaller for 6 tabs
  fontWeight: 'bold',
}

// Inactive Tab
{
  color: COLORS.textMuted,                // rgba(255,255,255,0.5)
  fontSize: 11,
  fontWeight: 'normal',
}
```

**Tab Icons:**
```javascript
const TAB_ICONS = {
  Home: 'home',                           // Material Community Icons
  Shop: 'shopping',                       // or 'cart'
  Trading: 'chart-line',                  // or 'trending-up'
  Gem Master: 'robot',
  Notifications: 'bell',
  Account: 'wallet',                      // or 'account-circle'
};
```

**Badges:**
- Notifications: Red badge (unread count)
- Shop: Gold badge (cart items count)
- Others: No badge

---

## 🔄 SO SÁNH LẦN CẬP NHẬT

### **Lần 1 (Original):**
```
1. Scanner 🔍
2. Tools 🛠️
3. Community 👥
4. Gem Master 🤖
5. Account 👤
```

### **Lần 2 (First update):**
```
1. Giao Dịch 📊
2. Feeds 📰
3. Shop 🛒
4. Gem Master 🤖
5. Notifications 🔔
6. Account 👤
```

### **Lần 3 (FINAL):**
```
1. Home 🏠 → /forum
2. Shop 🛒 → /shop
3. Giao Dịch 📊 → /scannerv2
4. Gem Master 🤖
5. Notifications 🔔
6. Tài Sản 💰 → /account
```

---

## 💡 WHY THESE CHANGES?

### **1. Home (thay vì Feeds):**
- ✅ "Home" = universal term
- ✅ Default landing page
- ✅ Social feed first = engagement
- ✅ Routes to `/forum` (matches web)

### **2. Shop giữ nguyên:**
- ✅ E-commerce tab
- ✅ Routes to `/shop` (matches web)

### **3. Giao Dịch:**
- ✅ Routes to `/scannerv2` (matches web exactly)
- ✅ Core trading functionality

### **4. Gem Master giữ nguyên:**
- ✅ AI assistant + Dashboard

### **5. Notifications giữ nguyên:**
- ✅ Alerts center

### **6. Tài Sản (thay Account):**
- ✅ "Tài Sản" = Assets/Wealth (better name)
- ✅ Emphasizes portfolio/money management
- ✅ Routes to `/account` (matches web)
- ✅ More appealing than generic "Account"

---

## 🚀 IMPLEMENTATION CODE

**MainNavigator.js (FINAL):**
```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/colors';

// Screens
import ForumScreen from '../screens/Forum/ForumScreen';
import ShopScreen from '../screens/Shop/ShopScreen';
import ScannerScreen from '../screens/Scanner/ScannerScreen';
import Gem MasterScreen from '../screens/Gem Master/Gem MasterScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import AccountScreen from '../screens/Account/AccountScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  // These would come from your state management
  const unreadNotifications = 5;
  const cartItemCount = 2;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopColor: COLORS.gold,
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.navy,
          borderBottomColor: COLORS.gold,
          borderBottomWidth: 1,
        },
        headerTintColor: COLORS.gold,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ForumScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={size} color={color} />
          ),
          tabBarBadge: cartItemCount > 0 ? cartItemCount : null,
        }}
      />
      
      <Tab.Screen
        name="Trading"
        component={ScannerScreen}
        options={{
          title: 'Giao Dịch',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Gem Master"
        component={Gem MasterScreen}
        options={{
          title: 'Gem Master',
          tabBarIcon: ({ color, size }) => (
            <Icon name="robot" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Thông Báo',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : null,
        }}
      />
      
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Tài Sản',
          tabBarIcon: ({ color, size }) => (
            <Icon name="wallet" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
```

---

## 📱 USER FLOW FINAL

```
Open App
  ↓
Splash Screen (2s)
  ↓
Login Screen
  ↓
🏠 HOME (Default landing)
  ├─ Scroll community feed
  ├─ Read posts
  ├─ Like/comment
  └─ Create post
  ↓
🛒 SHOP
  ├─ Browse products
  ├─ Add to cart
  └─ Checkout
  ↓
📊 GIAO DỊCH
  ├─ Scan patterns
  ├─ View chart
  └─ Set alerts
  ↓
🤖 GEM MASTER
  ├─ Chat with AI
  ├─ Create widgets
  └─ View dashboard
  ↓
🔔 NOTIFICATIONS
  ├─ Check alerts
  ├─ Tap to open
  └─ Mark as read
  ↓
💰 TÀI SẢN
  ├─ View portfolio
  ├─ Check stats
  ├─ Access tools
  ├─ Settings
  └─ Logout
```

---

## ✅ ROUTES MAPPING (Web ↔ Mobile)

| Web Route | Mobile Tab | Screen |
|-----------|------------|--------|
| `/forum` | Home 🏠 | ForumScreen |
| `/shop` | Shop 🛒 | ShopScreen |
| `/scannerv2` | Giao Dịch 📊 | ScannerScreen |
| `/Gem Master` | Gem Master 🤖 | Gem MasterScreen |
| `/account` | Tài Sản 💰 | AccountScreen |
| `/notifications` (new) | Notifications 🔔 | NotificationsScreen |

**Perfect 1:1 mapping với web app! ✅**

---

## 🎯 NEXT STEPS

**Week 2 Implementation:**
1. Create 6 placeholder screens
2. Update MainNavigator with 6 tabs
3. Add badges (notifications, cart)
4. Test navigation flow
5. Build to TestFlight

**PROMPT for Claude Code:**
```
TASK: Create 6-tab navigation - FINAL structure

TABS:
1. Home (🏠) → ForumScreen (/forum)
2. Shop (🛒) → ShopScreen (/shop)
3. Giao Dịch (📊) → ScannerScreen (/scannerv2)
4. Gem Master (🤖) → Gem MasterScreen
5. Notifications (🔔) → NotificationsScreen
6. Tài Sản (💰) → AccountScreen (/account)

Create placeholder screens for all 6 tabs
Update MainNavigator.js with final structure
Add badges for Notifications & Shop
Test navigation flow
```

---

**💎 NAVIGATION STRUCTURE HOÀN CHỈNH!

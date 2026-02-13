# ACCOUNT TAB (TÀI SẢN) - COMPLETE FEATURE SPEC
## GEM Mobile - Account Management Hub

**Version:** 2.0
**Last Updated:** 2025-12-14
**Status:** FULLY IMPLEMENTED

---

## 1. OVERVIEW

### 1.1 Purpose
Account Tab (Tài Sản) là hub trung tâm cho:
- Profile & cài đặt người dùng
- Quản lý tài sản (Gems, Thu nhập, Portfolio)
- Affiliate/CTV Partnership
- Đơn hàng & Khóa học
- Vision Board & Gamification
- Admin Dashboard (cho admin)

### 1.2 Navigation Structure
```
AccountStack (Tài Sản Tab)
├── AccountScreen (Main Hub)
├── Profile & Settings
│   ├── ProfileFull
│   ├── ProfileSettings
│   ├── NotificationSettings
│   ├── PrivacySettings
│   ├── CloseFriends
│   └── SavedPosts
├── Vision Board
│   ├── VisionBoardScreen
│   ├── Achievements
│   ├── VisionCalendar
│   ├── GoalDetail
│   ├── DailyRecap
│   └── Rituals (5 types)
├── Gem Economy
│   ├── Wallet
│   ├── BuyGems
│   ├── GemPackList
│   ├── DailyCheckin
│   ├── TransactionHistory
│   └── GiftCatalog/History
├── Creator Tools
│   ├── Earnings
│   ├── EarningsHistory
│   ├── Withdraw
│   ├── SoundLibrary
│   └── BoostedPosts
├── Partnership/Affiliate
│   ├── AffiliateDetail
│   ├── PartnershipRegistration
│   └── WithdrawRequest
├── Portfolio & Trading
│   ├── Portfolio
│   └── PaperTradeHistory
├── Orders
│   ├── MyOrders
│   ├── OrderDetail
│   └── LinkOrder
└── Admin (if isAdmin)
    ├── AdminDashboard
    ├── AdminApplications
    ├── AdminWithdrawals
    ├── AdminUsers
    ├── AdminCourses (+ Builders)
    ├── ContentCalendar
    └── More...
```

---

## 2. MAIN SCREEN: AccountScreen

### 2.1 File Location
`gem-mobile/src/screens/tabs/AccountScreen.js`

### 2.2 Screen Sections (Top to Bottom)

| # | Section | Description |
|---|---------|-------------|
| 1 | Profile Header | Avatar, tên, username, bio, badges, nút Sửa |
| 2 | View Full Profile | Link đến ProfileFullScreen |
| 3 | Vision Board Card | Mục tiêu & Affirmations |
| 4 | Admin Panel | Chỉ hiện nếu isAdmin=true |
| 5 | Asset Stats | 3 cards: Gems, Thu nhập, Affiliate |
| 6 | Quick Actions Grid | 6 action cards |
| 7 | Gem Economy Section | Mua Gems, Điểm danh |
| 8 | Đơn Hàng Section | Tất cả đơn, Liên kết đơn |
| 9 | Affiliate Section | Dynamic 4 scenarios |
| 10 | Tài Sản Section | Portfolio, Paper Trade |
| 11 | Khóa Học Section | Tất cả, Đang học |
| 12 | Cài Đặt Section | Profile, Password, Biometric, Notifications |
| 13 | Khác Section | Help, Terms, Logout |
| 14 | Sponsor Banners | Dynamic từ database |

### 2.3 State Management

```javascript
// Core State
const [profile, setProfile] = useState(null);
const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

// Modals
const [editModalVisible, setEditModalVisible] = useState(false);
const [passwordModalVisible, setPasswordModalVisible] = useState(false);
const [showBiometricModal, setShowBiometricModal] = useState(false);

// Biometric
const [biometricEnabled, setBiometricEnabled] = useState(false);
const [biometricSupported, setBiometricSupported] = useState(false);
const [biometricType, setBiometricType] = useState('Sinh trắc học');

// Admin Stats
const [adminStats, setAdminStats] = useState({
  pendingApplications: 0,
  pendingWithdrawals: 0,
  totalPartners: 0,
  totalUsers: 0,
});

// Asset Stats
const [assetStats, setAssetStats] = useState({
  gems: 0,
  earnings: 0,
  affiliate: 0,
});
```

---

## 3. UI SECTIONS DETAIL

### 3.1 Profile Header

**Components:**
- Avatar (70x70, tap to edit)
- Display name + UserBadges
- Username (@username)
- Bio (2 lines)
- Edit button (gold icon)

**Styles:**
```javascript
profileSection: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: GLASS.background,
  borderRadius: GLASS.borderRadius,
  padding: SPACING.lg,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
}

avatar: {
  width: 70,
  height: 70,
  borderRadius: 35,
}

displayName: {
  fontSize: TYPOGRAPHY.fontSize.xxxl,  // 22
  fontWeight: TYPOGRAPHY.fontWeight.bold,
  color: COLORS.textPrimary,
}

editButton: {
  backgroundColor: 'rgba(255, 189, 89, 0.1)',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
}
```

### 3.2 Vision Board Card

**Appearance:** Gold-bordered card with Eye + Sparkles icons

**Styles:**
```javascript
visionBoardCard: {
  backgroundColor: GLASS.background,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.3)',
}

visionBoardTitle: {
  fontSize: TYPOGRAPHY.fontSize.xl,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  color: COLORS.textPrimary,
}
```

**Navigation:** `navigation.navigate('VisionBoard')`

### 3.3 Admin Panel (Admin Only)

**Visibility:** `if (isAdmin)`

**Layout:**
- Header: Shield icon + "ADMIN PANEL" text
- Main button: "Quản Lý Hệ Thống" → AdminDashboard
- Quick actions row 1: Đơn đăng ký, Rút tiền, Users
- Quick actions row 2: Quản lý khóa học, Cấp quyền truy cập

**Badge Counts:** Red badges showing pending counts

**Styles:**
```javascript
adminSection: {
  backgroundColor: GLASS.background,
  borderRadius: 14,
  padding: SPACING.lg,
  borderWidth: 1,
  borderColor: 'rgba(255, 189, 89, 0.3)',
}

adminHeaderText: {
  fontSize: TYPOGRAPHY.fontSize.sm,
  fontWeight: TYPOGRAPHY.fontWeight.bold,
  color: COLORS.gold,
  letterSpacing: 1.5,
}

adminBadgeCount: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: COLORS.error,
  borderRadius: 10,
  minWidth: 18,
  height: 18,
}
```

### 3.4 Asset Stats Cards

**3 Cards:** Gems | Thu nhập | Affiliate

**Layout:**
- Icon (gold, 24px)
- Value (display size, bold)
- Label (sm, muted)
- Subtitle (xs, subtle)

**Data:**
```javascript
assetStats = {
  gems: profile.gems,           // e.g., 16,640
  earnings: monthlyEarnings,    // e.g., 0K (VND)
  affiliate: totalCommission,   // e.g., 0K
}
```

**Styles:**
```javascript
assetStatsContainer: {
  flexDirection: 'row',
  gap: SPACING.md,
}

assetStatCard: {
  flex: 1,
  backgroundColor: GLASS.background,
  borderRadius: GLASS.borderRadius,
  padding: SPACING.lg,
  alignItems: 'center',
  borderWidth: GLASS.borderWidth,
  borderColor: 'rgba(106, 91, 255, 0.2)',
}

assetStatValue: {
  fontSize: TYPOGRAPHY.fontSize.display,
  fontWeight: TYPOGRAPHY.fontWeight.bold,
  color: COLORS.textPrimary,
}
```

### 3.5 Quick Actions Grid

**6 Action Cards (2 columns):**
1. Ví Gems → Wallet
2. Thu Nhập → Earnings
3. Giao Dịch → EarningsHistory
4. Boost → BoostedPosts
5. Portfolio → Portfolio
6. Âm Thanh → SoundLibrary

**Card Style:**
```javascript
actionCard: {
  width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
  backgroundColor: GLASS.background,
  borderRadius: GLASS.borderRadius,
  padding: SPACING.lg,
  borderWidth: GLASS.borderWidth,
  borderColor: 'rgba(106, 91, 255, 0.2)',
}

actionIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: 'rgba(255, 189, 89, 0.15)',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### 3.6 Menu Sections

**Standard Menu Item:**
```javascript
menuItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: GLASS.background,
  borderRadius: 14,
  padding: SPACING.md,
  marginBottom: SPACING.sm,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.15)',
}

menuIcon: {
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 189, 89, 0.15)',
  justifyContent: 'center',
  alignItems: 'center',
}

menuText: {
  fontSize: TYPOGRAPHY.fontSize.lg,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  color: COLORS.textPrimary,
}
```

---

## 4. SUB-SCREENS

### 4.1 Profile Screens

| Screen | File | Purpose |
|--------|------|---------|
| ProfileFull | `screens/tabs/ProfileFullScreen.js` | Full profile với tabs Posts/Photos/Videos |
| ProfileSettings | `screens/Account/ProfileSettingsScreen.js` | Edit profile info |
| FollowersList | `screens/Profile/FollowersListScreen.js` | Danh sách followers |
| FollowingList | `screens/Profile/FollowingListScreen.js` | Danh sách following |

### 4.2 Vision Board Screens

| Screen | Purpose |
|--------|---------|
| VisionBoard | Main hub với tabs: Goals, Daily, Affirmations |
| Achievements | Gamification achievements |
| VisionCalendar | Calendar view |
| GoalDetail | Chi tiết goal |
| DailyRecap | Recap hàng ngày |
| RitualPlayground | Breathing exercises |
| HeartExpansionRitual | Ritual mở rộng trái tim |
| GratitudeFlowRitual | Ritual biết ơn |
| CleansingBreathRitual | Ritual thanh lọc |
| WaterManifestRitual | Ritual nước |
| LetterToUniverseRitual | Viết thư cho vũ trụ |

### 4.3 Gem Economy Screens

| Screen | Purpose |
|--------|---------|
| Wallet | Main wallet với balance, actions |
| BuyGems | Mua Gems |
| GemPackList | Danh sách gói Gems |
| DailyCheckin | Điểm danh nhận 5 Gems/ngày |
| TransactionHistory | Lịch sử giao dịch |
| GiftCatalog | Catalog quà tặng |
| GiftHistory | Lịch sử quà tặng |
| GemPurchaseSuccess | Mua thành công |
| GemPurchasePending | Đang xử lý |

### 4.4 Creator Tools Screens

| Screen | Purpose |
|--------|---------|
| Earnings | Dashboard thu nhập |
| EarningsHistory | Lịch sử thu nhập |
| Withdraw | Rút tiền |
| WithdrawalHistory | Lịch sử rút tiền |
| SoundLibrary | Thư viện âm thanh |
| UploadSound | Upload âm thanh |
| BoostedPosts | Quản lý bài đã boost |
| BoostPost | Boost bài viết |
| BoostAnalytics | Analytics của boost |

### 4.5 Partnership/Affiliate Screens

| Screen | Purpose |
|--------|---------|
| AffiliateDetail | Dashboard chi tiết affiliate |
| PartnershipRegistration | Form đăng ký Affiliate/CTV |
| WithdrawRequest | Form yêu cầu rút tiền |

### 4.6 Order Screens

| Screen | Purpose |
|--------|---------|
| MyOrders | Danh sách đơn hàng từ Shopify |
| OrderDetail | Chi tiết đơn hàng |
| LinkOrder | Liên kết đơn mua bằng email khác |

### 4.7 Settings Screens

| Screen | Purpose |
|--------|---------|
| NotificationSettings | Cài đặt thông báo |
| PrivacySettings | Ai có thể xem bài viết |
| CloseFriends | Quản lý danh sách bạn thân |
| SavedPosts | Bài viết đã bookmark |
| HelpSupport | Trợ giúp & hỗ trợ |
| Terms | Điều khoản sử dụng |

---

## 5. ADMIN SCREENS

### 5.1 Admin Dashboard
**File:** `screens/Admin/AdminDashboardScreen.js`
**Purpose:** Main admin hub với navigation đến các chức năng

### 5.2 Partnership Management
- **AdminApplications** - Duyệt đơn đăng ký Affiliate/CTV
- **AdminWithdrawals** - Xử lý yêu cầu rút tiền

### 5.3 User Management
- **AdminUsers** - Quản lý users

### 5.4 Content Management
- **ContentCalendar** - Lịch nội dung
- **ContentEditor** - Tạo/sửa nội dung
- **AutoPostLogs** - Nhật ký auto-post
- **PlatformSettings** - Kết nối platforms

### 5.5 Course Management
- **CourseList** - Danh sách khóa học
- **CourseBuilder** - Tạo khóa học
- **ModuleBuilder** - Tạo module
- **LessonBuilder** - Tạo bài học
- **QuizBuilder** - Tạo quiz
- **GrantAccess** - Cấp quyền truy cập
- **CourseStudents** - Học viên

### 5.6 Other Admin
- **AdminSponsorBanners** - Quản lý banner
- **AdminGiftCatalog** - Quản lý quà tặng
- **AdminSeedContent** - Seed content AI
- **ContentDashboard** - Hub content
- **PushEditor** - Tạo push notification
- **TemplateLibrary** - Thư viện templates

---

## 6. COMPONENTS

### 6.1 AffiliateSection
**File:** `screens/tabs/components/AffiliateSection.js`

**4 Scenarios:**
1. **No Partnership** → Show registration form
2. **Pending** → Show "Đang Chờ Phê Duyệt"
3. **Rejected** → Show rejection reason + retry button
4. **Approved** → Show affiliate code + stats

### 6.2 EditProfileModal
**File:** `screens/tabs/components/EditProfileModal.js`
**Purpose:** Modal để edit profile info

### 6.3 ChangePasswordModal
**File:** `screens/tabs/components/ChangePasswordModal.js`
**Purpose:** Modal đổi mật khẩu

### 6.4 BiometricSetupModal
**File:** `components/Auth/BiometricSetupModal.js`
**Purpose:** Setup Face ID / Touch ID

### 6.5 UserBadges
**File:** `components/UserBadge.js`
**Purpose:** Hiển thị badges (Admin, Verified, Creator, etc.)

### 6.6 SponsorBannerCard
**File:** `components/SponsorBannerCard.js`
**Purpose:** Hiển thị sponsor banners

---

## 7. DESIGN SPECIFICATIONS

### 7.1 Color Palette

```javascript
// Icon Colors - ALL GOLD
ICON_COLOR = COLORS.gold  // #FFBD59

// Icon Backgrounds
ICON_BG = 'rgba(255, 189, 89, 0.15)'

// Card Borders
CARD_BORDER = 'rgba(106, 91, 255, 0.15)'  // Purple tint
GOLD_BORDER = 'rgba(255, 189, 89, 0.3)'   // Gold tint

// Admin Panel
ADMIN_BORDER = 'rgba(255, 189, 89, 0.3)'  // Gold

// Logout
LOGOUT_ICON_BG = 'rgba(255, 107, 107, 0.15)'
LOGOUT_TEXT = COLORS.error
```

### 7.2 Typography

```javascript
// Section Title
sectionTitle: {
  fontSize: TYPOGRAPHY.fontSize.lg,      // 18
  fontWeight: TYPOGRAPHY.fontWeight.bold,
  color: COLORS.textPrimary,
}

// Quick Actions Section Title
quickActionsSectionTitle: {
  fontSize: TYPOGRAPHY.fontSize.xxxl,    // 22
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
}

// Menu Text
menuText: {
  fontSize: TYPOGRAPHY.fontSize.lg,      // 18
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
}

// Menu Subtext
menuSubtext: {
  fontSize: TYPOGRAPHY.fontSize.sm,      // 13
  color: COLORS.textMuted,
}
```

### 7.3 Spacing

```javascript
// Screen Padding
scrollContent: {
  paddingHorizontal: SPACING.lg,  // 16
  paddingTop: SPACING.md,         // 12
  paddingBottom: CONTENT_BOTTOM_PADDING + 40,
}

// Card Padding
cardPadding: SPACING.lg  // 16

// Section Margin
sectionMargin: SPACING.lg  // 16

// Menu Item Margin
menuItemMargin: SPACING.sm  // 8
```

### 7.4 Glass Morphism

```javascript
// Standard Card
{
  backgroundColor: GLASS.background,  // rgba(15, 16, 48, 0.55)
  borderRadius: GLASS.borderRadius,   // 18
  borderWidth: GLASS.borderWidth,     // 1
  borderColor: 'rgba(106, 91, 255, 0.2)',
}

// Menu Item
{
  backgroundColor: GLASS.background,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.15)',
}
```

### 7.5 Icons

**All icons use gold color: `COLORS.gold` (#FFBD59)**

**Icon sizes:**
- Menu icon: 20px
- Action card icon: 24px
- Header icon: 18px

**Icon background:**
```javascript
{
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 189, 89, 0.15)',
}
```

---

## 8. FEATURES

### 8.1 Biometric Authentication
- Check device support (Face ID / Touch ID)
- Enable/disable toggle
- Setup modal with password verification
- Secure token storage

### 8.2 Pull to Refresh
- RefreshControl on ScrollView
- Reloads profile, stats, admin stats
- Gold color indicator

### 8.3 Double-tap Scroll to Top
- Custom hook `useScrollToTop`
- Scrolls to top and refreshes

### 8.4 Deep Link Handling
- Handle `openVisionBoard` param
- Handle `showConfetti` for celebrations
- Navigate to specific Vision Board tabs

### 8.5 Sponsor Banners
- Dynamic banners from database
- Distributed throughout screen
- Dismissable with impression tracking

---

## 9. SERVICES USED

```javascript
// Auth
import { useAuth } from '../../contexts/AuthContext';

// Forum/Profile
import { forumService } from '../../services/forumService';

// Supabase
import { signOut, supabase } from '../../services/supabase';

// Biometric
import biometricService from '../../services/biometricService';

// Sponsor Banners
import { useSponsorBanners } from '../../components/SponsorBannerSection';
```

---

## 10. DATA LOADING

### 10.1 Load on Focus
```javascript
useFocusEffect(
  useCallback(() => {
    if (user?.id) {
      loadData();
      if (isAdmin) {
        loadAdminStats();
      }
    }
  }, [user?.id, isAdmin])
);
```

### 10.2 loadData()
- Load profile from `forumService.getUserProfile()`
- Load stats from `forumService.getUserStats()`
- Load asset stats (gems, earnings, affiliate)

### 10.3 loadAdminStats()
- Count pending partnership applications
- Count pending withdrawal requests
- Count total partners
- Count total users

---

## 11. NAVIGATION ACTIONS

### 11.1 Profile Actions
- `setEditModalVisible(true)` → Edit profile modal
- `navigation.navigate('ProfileFull')` → Full profile
- `setPasswordModalVisible(true)` → Change password modal

### 11.2 Admin Actions
- `navigation.navigate('AdminDashboard')` → Admin hub
- `navigation.navigate('AdminApplications')` → Partnership applications
- `navigation.navigate('AdminWithdrawals')` → Withdrawal requests
- `navigation.navigate('AdminUsers')` → User management
- `navigation.navigate('AdminCourses')` → Course management
- `navigation.navigate('GrantAccess')` → Grant access

### 11.3 Asset Actions
- `navigation.navigate('Wallet')` → Wallet
- `navigation.navigate('Earnings')` → Earnings
- `navigation.navigate('Portfolio')` → Portfolio
- `navigation.navigate('BoostedPosts')` → Boosted posts

### 11.4 Order Actions
- `navigation.navigate('MyOrders')` → Orders list
- `navigation.navigate('LinkOrder')` → Link order

### 11.5 Settings Actions
- `navigation.navigate('ProfileSettings')` → Profile settings
- `navigation.navigate('NotificationSettings')` → Notifications
- `navigation.navigate('PrivacySettings')` → Privacy
- `navigation.navigate('CloseFriends')` → Close friends
- `navigation.navigate('SavedPosts')` → Saved posts
- `navigation.navigate('HelpSupport')` → Help
- `navigation.navigate('Terms')` → Terms

---

## 12. VIETNAMESE LABELS

| English | Vietnamese |
|---------|------------|
| Account | Tài Sản |
| Profile | Hồ sơ |
| Edit | Sửa |
| View full profile | Xem trang cá nhân đầy đủ |
| Vision Board | Vision Board |
| Goals & Affirmations | Mục tiêu & Affirmations |
| Admin Panel | Admin Panel |
| System Management | Quản Lý Hệ Thống |
| Applications | Đơn đăng ký |
| Withdrawals | Rút tiền |
| Users | Users |
| Course Management | Quản lý khóa học |
| Grant Access | Cấp quyền truy cập |
| Gems | Gems |
| Income | Thu nhập |
| This month | Tháng này |
| Affiliate | Affiliate |
| Commission | Hoa hồng |
| Manage Assets | Quản lý tài sản |
| Wallet | Ví Gems |
| Buy & manage | Mua & quản lý |
| Income | Thu Nhập |
| View & withdraw | Xem & rút tiền |
| Transactions | Giao Dịch |
| Transaction history | Lịch sử chi tiêu |
| Boost | Boost |
| Boost posts | Quảng cáo bài |
| Portfolio | Portfolio |
| Statistics | Thống kê |
| Sounds | Âm Thanh |
| Library | Thư viện |
| Gem Economy | Gem Economy |
| Buy Gems | Mua Gems |
| Top up Gems | Nạp Gems để sử dụng dịch vụ |
| Daily Check-in | Điểm danh |
| Get 5 free Gems daily | Nhận 5 Gems miễn phí mỗi ngày |
| My Orders | Đơn Hàng Của Tôi |
| All orders | Tất cả đơn hàng |
| Track Shopify orders | Theo dõi đơn hàng từ Shopify |
| Link order | Liên kết đơn hàng |
| Link order with different email | Liên kết đơn mua bằng email khác |
| My Courses | Khóa Học Của Tôi |
| All courses | Tất cả khóa học |
| Discover & enroll | Khám phá & đăng ký khóa học |
| Currently learning | Đang học |
| Continue your courses | Tiếp tục khóa học của bạn |
| Assets | Tài Sản |
| Portfolio | Portfolio |
| Manage crypto assets | Quản lý tài sản crypto |
| Paper Trade History | Paper Trade History |
| Simulated trading history | Lịch sử giao dịch giả lập |
| Settings | Cài Đặt |
| Personal info | Thông tin cá nhân |
| Change password | Đổi mật khẩu |
| Biometric login | Đăng nhập bằng sinh trắc học |
| Enabled | Đã bật |
| Not enabled | Chưa bật |
| Notification settings | Cài đặt thông báo |
| Privacy settings | Cài đặt quyền riêng tư |
| Who can see your posts | Ai có thể xem bài viết của bạn |
| Close friends | Bạn thân |
| Manage close friends | Quản lý danh sách bạn thân |
| Saved posts | Bài viết đã lưu |
| Bookmarked posts | Các bài viết bạn đã bookmark |
| Other | Khác |
| Help & Support | Trợ giúp & Hỗ trợ |
| Terms of Use | Điều khoản sử dụng |
| Logout | Đăng xuất |

---

## 13. SECURITY

### 13.1 Authentication Check
- Screen requires `user` from AuthContext
- Shows "Not logged in" state if no user

### 13.2 Admin Check
- Admin features only visible if `isAdmin = true`
- Checked from AuthContext

### 13.3 Biometric Security
- Uses SecureStore for token storage
- Password verification before enabling
- LocalAuthentication for verification

---

**END OF FEATURE SPEC**

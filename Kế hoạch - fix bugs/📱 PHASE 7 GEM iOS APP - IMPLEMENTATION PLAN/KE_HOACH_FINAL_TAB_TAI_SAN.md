# ✅ KẾ HOẠCH FINAL - FIX TAB TÀI SẢN (Sau báo cáo đầy đủ)

**Ngày:** 25/11/2025  
**Status:** 🎯 CONFIRMED - Ready to implement  

---

## 📊 CODE HIỆN TẠI - CONFIRMED

### **✅ ĐÃ CÓ (Working):**

| Screen/Component | File | Features | Status |
|------------------|------|----------|--------|
| **Profile Full** | ProfileFullScreen.js (367 lines) | 3 tabs: Posts, Photos, Videos | ✅ DONE |
| **Account** | AccountScreen.js (847 lines) | UI đầy đủ, thiếu handlers | ⚠️ PARTIAL |
| **Edit Profile** | EditProfileModal.js | Modal edit profile | ✅ DONE |
| **Notifications** | NotificationsScreen.js | LIST thông báo (4 tabs) | ✅ DONE |
| **Scanner** | ScannerScreen.js (713 lines) | Pattern scan, chart, results | ✅ DONE |
| **Open Positions** | OpenPositionsScreen.js (573 lines) | Paper trade positions | ✅ DONE |
| **Paper Trade Modal** | PaperTradeModal.js | Mở position mới | ✅ DONE |
| **Paper Service** | paperTradeService.js | Paper trade logic | ✅ DONE |

---

### **❌ CHƯA CÓ (Cần tạo):**

| Screen | Purpose | Priority |
|--------|---------|----------|
| **PortfolioScreen** | Quản lý crypto thực | 🔴 HIGH |
| **PaperTradeHistoryScreen** | Lịch sử đã đóng | 🔴 HIGH |
| **NotificationSettingsScreen** | Bật/tắt notification types | 🟡 MEDIUM |
| **ProfileSettingsScreen** | Update profile đầy đủ | 🟡 MEDIUM |
| **ChangePasswordScreen/Modal** | Đổi mật khẩu | 🟡 MEDIUM |
| **AffiliateDetailScreen** | Stats affiliate chi tiết | 🔴 HIGH |
| **HelpSupportScreen** | FAQ + contact | 🟢 LOW |
| **TermsScreen** | Điều khoản | 🟢 LOW |

**Total:** 8 screens cần tạo

---

### **⚠️ QUAN TRỌNG - KHÔNG TỒN TẠI:**

```javascript
// ❌ KHÔNG CÓ - Sẽ crash
navigation.navigate('Trading')

// ✅ CÓ SẴN
navigation.navigate('Scanner')           // Tab Giao Dịch
navigation.navigate('OpenPositions')     // Vị thế đang mở
navigation.navigate('Notifications')     // Tab Thông Báo (LIST, not settings)
navigation.navigate('ProfileFull')       // Profile đầy đủ
```

---

## 🎯 KẾ HOẠCH IMPLEMENTATION - CONFIRMED

### **Tất cả features cần fix trong AccountScreen.js:**

| # | Feature | Current | Solution | Type | Time |
|---|---------|---------|----------|------|------|
| 1 | **Copy Affiliate** | `onPress={() => {}}` | Add Clipboard.copy() | Code | 5 phút |
| 2 | **Logout** | `onPress={handleLogout}` | Add confirmation | Code | 5 phút |
| 3 | **Affiliate Detail** | `onPress={() => {}}` | Navigate to AffiliateDetailScreen | Screen | 2 giờ |
| 4 | **Portfolio** | `navigate('Trading')` ❌ | Navigate to PortfolioScreen | Screen | 2 giờ |
| 5 | **Paper Trade History** | `navigate('Trading')` ❌ | Navigate to PaperTradeHistoryScreen | Screen | 1 giờ |
| 6 | **Thông tin cá nhân** | `onPress={() => {}}` | Navigate to ProfileSettingsScreen | Screen | 1 giờ |
| 7 | **Đổi mật khẩu** | `onPress={() => {}}` | Show ChangePasswordModal | Modal | 30 phút |
| 8 | **Cài đặt thông báo** | `onPress={() => {}}` | Navigate to NotificationSettingsScreen | Screen | 1 giờ |
| 9 | **Trợ giúp** | `onPress={() => {}}` | Navigate to HelpSupportScreen | Screen | 1 giờ |
| 10 | **Điều khoản** | `onPress={() => {}}` | Navigate to TermsScreen | Screen | 1 giờ |

**Total: 10 features, 8 screens, 1 modal**

---

## 📋 PHASE-BY-PHASE IMPLEMENTATION

### **PHASE 1: Quick Fixes trong AccountScreen (15 phút)** ⚡

**File:** `src/screens/tabs/AccountScreen.js`

**Tasks:**
- [ ] Import `expo-clipboard`
- [ ] Implement `handleCopyAffiliateCode()`
- [ ] Update logout confirmation in `handleLogout()`
- [ ] Fix tất cả `onPress={() => {}}` thành proper handlers

**Code:**
```javascript
import * as Clipboard from 'expo-clipboard';

// 1. Copy Affiliate Code
const handleCopyAffiliateCode = async () => {
  try {
    await Clipboard.setStringAsync(affiliateCode);
    Alert.alert('✅ Thành công', 'Đã sao chép mã giới thiệu!');
  } catch (error) {
    Alert.alert('❌ Lỗi', 'Không thể sao chép');
  }
};

// 2. Logout with confirmation
const handleLogout = () => {
  Alert.alert(
    'Đăng Xuất',
    'Bạn có chắc muốn đăng xuất?',
    [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng Xuất', 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        }
      }
    ]
  );
};

// 3. Fix navigation handlers
<TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
<TouchableOpacity onPress={() => navigation.navigate('PaperTradeHistory')}>
<TouchableOpacity onPress={() => navigation.navigate('ProfileSettings')}>
<TouchableOpacity onPress={() => setShowPasswordModal(true)}>
<TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')}>
<TouchableOpacity onPress={() => navigation.navigate('AffiliateDetail')}>
<TouchableOpacity onPress={() => navigation.navigate('HelpSupport')}>
<TouchableOpacity onPress={() => navigation.navigate('Terms')}>
```

**Dependencies:**
```bash
expo install expo-clipboard
```

---

### **PHASE 2: High Priority Screens (5 giờ)** 🔴

#### **2.1. AffiliateDetailScreen (2 giờ)**

**File:** `src/screens/Account/AffiliateDetailScreen.js`

**Features:**
- Header với mã affiliate + nút copy + share
- Tổng quan: Hoa hồng, Người giới thiệu, Tier
- Thống kê tháng này: Digital/Physical sales
- Progress bar lên tier tiếp theo
- Lịch sử hoa hồng (list)
- Link đến tài liệu

**API Integration:**
```javascript
// Get stats
const { data: stats } = await supabase
  .rpc('get_affiliate_commission_summary', {
    affiliate_user_id: userId
  });

// Get history
const { data: history } = await supabase
  .from('affiliate_commissions')
  .select('*')
  .eq('affiliate_id', userId)
  .order('created_at', { ascending: false });
```

**Database:** Use existing affiliate tables

---

#### **2.2. PortfolioScreen (2 giờ)**

**File:** `src/screens/Account/PortfolioScreen.js`

**Features:**
- Total portfolio value (real-time)
- Add coin form (symbol, quantity, avg price)
- Coin list với current price (Binance API)
- P&L per coin (unrealized)
- Total P&L
- Edit/Delete coin
- Chart view (optional)

**Database:**
```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  symbol VARCHAR(20) NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_buy_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Service:** `src/services/portfolioService.js`
```javascript
export const portfolioService = {
  async getUserPortfolio(userId) {
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId);
    
    // Get current prices from Binance
    const symbols = data.map(item => `${item.symbol}USDT`);
    const prices = await binanceService.getCurrentPrices(symbols);
    
    // Calculate P&L
    return data.map(item => ({
      ...item,
      currentPrice: prices[item.symbol],
      totalValue: item.quantity * prices[item.symbol],
      pnl: ((prices[item.symbol] - item.avg_buy_price) / item.avg_buy_price) * 100
    }));
  },
  
  async addCoin(userId, symbol, quantity, avgPrice) {
    return await supabase.from('portfolio_items').insert({
      user_id: userId,
      symbol,
      quantity,
      avg_buy_price: avgPrice
    });
  },
  
  async updateCoin(id, updates) {
    return await supabase
      .from('portfolio_items')
      .update(updates)
      .eq('id', id);
  },
  
  async deleteCoin(id) {
    return await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);
  }
};
```

---

#### **2.3. PaperTradeHistoryScreen (1 giờ)**

**File:** `src/screens/Account/PaperTradeHistoryScreen.js`

**Features:**
- Stats: Total trades, Win rate, Total P&L
- Filter: All, Long, Short, Win, Loss
- Date range filter
- Trade list với:
  - Symbol, Direction
  - Entry/Exit price
  - P&L ($ and %)
  - Duration
  - Status (Win/Loss)
- Sort: Date, P&L, Duration

**Query from existing table:**
```javascript
const { data: history } = await supabase
  .from('trading_journal')
  .select('*')
  .eq('user_id', userId)
  .eq('is_paper_trade', true)
  .eq('status', 'closed')  // Only closed positions
  .order('closed_at', { ascending: false });

// Calculate stats
const stats = {
  totalTrades: history.length,
  wins: history.filter(t => t.pnl > 0).length,
  losses: history.filter(t => t.pnl <= 0).length,
  winRate: (wins / totalTrades) * 100,
  totalPnl: history.reduce((sum, t) => sum + t.pnl, 0)
};
```

**Database:** Use existing `trading_journal` table ✅

---

### **PHASE 3: Settings Screens (2.5 giờ)** 🟡

#### **3.1. ProfileSettingsScreen (1 giờ)**

**File:** `src/screens/Account/ProfileSettingsScreen.js`

**Features:**
- Avatar upload (camera/gallery)
- Full name input
- Username input (check unique)
- Email (disabled/readonly)
- Phone number
- Bio textarea
- Gender selector
- Birth date picker
- Save button

**Code:**
```javascript
import * as ImagePicker from 'expo-image-picker';

const handleUploadAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload to Supabase Storage
    const file = result.assets[0];
    const fileName = `${userId}_${Date.now()}.jpg`;
    
    const { data: uploadData, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, {
        uri: file.uri,
        type: 'image/jpeg',
        name: fileName
      });
    
    if (!error) {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      
      setAvatarUrl(urlData.publicUrl);
    }
  }
};

const handleSave = async () => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      username: username,
      phone: phone,
      bio: bio,
      gender: gender,
      birth_date: birthDate,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (!error) {
    Alert.alert('Thành công', 'Đã cập nhật thông tin!');
  }
};
```

**Dependencies:**
```bash
expo install expo-image-picker
```

---

#### **3.2. ChangePasswordModal (30 phút)**

**File:** `src/screens/tabs/components/ChangePasswordModal.js`

**Features:**
- Current password input
- New password input
- Confirm password input
- Password strength indicator
- Show/hide password toggles
- Validate + Save

**Code:**
```javascript
const handleChangePassword = async () => {
  // Validation
  if (newPassword !== confirmPassword) {
    Alert.alert('Lỗi', 'Mật khẩu không khớp');
    return;
  }
  
  if (newPassword.length < 8) {
    Alert.alert('Lỗi', 'Mật khẩu phải tối thiểu 8 ký tự');
    return;
  }
  
  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (!error) {
    Alert.alert('Thành công', 'Đã đổi mật khẩu!');
    onClose();
  }
};
```

---

#### **3.3. NotificationSettingsScreen (1 giờ)**

**File:** `src/screens/Account/NotificationSettingsScreen.js`

**Features:**
- Push notification master toggle
- Category toggles:
  - Trading (Pattern, Price alerts)
  - Community (Comments, Likes, Follows)
  - Affiliate (New referrals, Commission)
  - Orders (Status updates, Delivery)
- Email notification toggles
- Save preferences to database

**Database:**
```sql
CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  
  -- Push notifications
  push_enabled BOOLEAN DEFAULT true,
  
  -- Trading
  trading_pattern BOOLEAN DEFAULT true,
  trading_price BOOLEAN DEFAULT true,
  
  -- Community
  community_comment BOOLEAN DEFAULT true,
  community_like BOOLEAN DEFAULT true,
  community_follow BOOLEAN DEFAULT true,
  
  -- Affiliate
  affiliate_referral BOOLEAN DEFAULT true,
  affiliate_commission BOOLEAN DEFAULT true,
  
  -- Orders
  orders_status BOOLEAN DEFAULT true,
  orders_delivery BOOLEAN DEFAULT true,
  
  -- Email
  email_weekly BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Code:**
```javascript
const handleToggle = async (field, value) => {
  // Update local state
  setSettings({ ...settings, [field]: value });
  
  // Save to database
  await supabase
    .from('notification_settings')
    .upsert({
      user_id: userId,
      [field]: value,
      updated_at: new Date().toISOString()
    });
};
```

---

### **PHASE 4: Support & Content (2 giờ)** 🟢

#### **4.1. HelpSupportScreen (1 giờ)**

**File:** `src/screens/Account/HelpSupportScreen.js`

**Features:**
- FAQ list (expandable accordion)
- Contact buttons:
  - Telegram (deep link)
  - Email (mailto link)
  - Live Chat (navigate to chat)
- Documentation links
- Bug report button
- App version info

**Code:**
```javascript
import * as Linking from 'expo-linking';

const faqs = [
  {
    question: 'Làm sao để nạp tiền?',
    answer: 'Bạn có thể nạp tiền qua...'
  },
  {
    question: 'Cách sử dụng Pattern Scanner?',
    answer: 'Pattern Scanner cho phép...'
  },
  // ... more FAQs
];

const handleContactTelegram = () => {
  Linking.openURL('https://t.me/GEMSupport');
};

const handleContactEmail = () => {
  Linking.openURL('mailto:support@gem.vn?subject=Hỗ trợ GEM');
};

const handleLiveChat = () => {
  // Navigate to chat screen or open external chat
  navigation.navigate('Chat', { type: 'support' });
};
```

---

#### **4.2. TermsScreen (1 giờ)**

**File:** `src/screens/Account/TermsScreen.js`

**Features:**
- Tab view: Điều khoản | Chính sách bảo mật
- Scrollable content
- Last updated date
- Download PDF button (optional)

**Content:**
```javascript
const termsContent = `
ĐIỀU KHOẢN SỬ DỤNG Gemral

Cập nhật: 25/11/2025

1. GIỚI THIỆU
Gemral cung cấp các công cụ phân tích...

2. QUYỀN VÀ NGHĨA VỤ
...

3. SỬ DỤNG DỊCH VỤ
...
`;

const privacyContent = `
CHÍNH SÁCH BẢO MẬT

Cập nhật: 25/11/2025

1. THU THẬP THÔNG TIN
...
`;
```

**UI:**
```javascript
const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'

<ScrollView>
  <View style={styles.tabs}>
    <TouchableOpacity onPress={() => setActiveTab('terms')}>
      <Text>Điều Khoản</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setActiveTab('privacy')}>
      <Text>Bảo Mật</Text>
    </TouchableOpacity>
  </View>
  
  <Text style={styles.content}>
    {activeTab === 'terms' ? termsContent : privacyContent}
  </Text>
</ScrollView>
```

---

### **PHASE 5: Navigation Setup (30 phút)** 🔧

**File:** `src/navigation/AppNavigator.js`

**Add routes:**
```javascript
<Stack.Screen 
  name="AffiliateDetail" 
  component={AffiliateDetailScreen}
  options={{ title: 'Chương Trình Affiliate' }}
/>

<Stack.Screen 
  name="Portfolio" 
  component={PortfolioScreen}
  options={{ title: 'Portfolio' }}
/>

<Stack.Screen 
  name="PaperTradeHistory" 
  component={PaperTradeHistoryScreen}
  options={{ title: 'Lịch Sử Paper Trade' }}
/>

<Stack.Screen 
  name="ProfileSettings" 
  component={ProfileSettingsScreen}
  options={{ title: 'Thông Tin Cá Nhân' }}
/>

<Stack.Screen 
  name="NotificationSettings" 
  component={NotificationSettingsScreen}
  options={{ title: 'Cài Đặt Thông Báo' }}
/>

<Stack.Screen 
  name="HelpSupport" 
  component={HelpSupportScreen}
  options={{ title: 'Trợ Giúp & Hỗ Trợ' }}
/>

<Stack.Screen 
  name="Terms" 
  component={TermsScreen}
  options={{ title: 'Điều Khoản Sử Dụng' }}
/>
```

---

### **PHASE 6: Testing & Polish (1 giờ)** ✨

**Checklist:**
- [ ] Test tất cả navigation flows
- [ ] Test copy affiliate code
- [ ] Test logout confirmation
- [ ] Test portfolio CRUD
- [ ] Test paper trade history filters
- [ ] Test profile settings save
- [ ] Test password change
- [ ] Test notification settings toggles
- [ ] Test deep links (Telegram, Email)
- [ ] Check loading states
- [ ] Check error handling
- [ ] Check empty states
- [ ] Test trên iOS
- [ ] Test trên Android

---

## ⏱️ TIMELINE SUMMARY

| Phase | Tasks | Duration | Total |
|-------|-------|----------|-------|
| **Phase 1** | Quick fixes | 15 phút | 15 phút |
| **Phase 2** | High priority screens | 5 giờ | 5h 15m |
| **Phase 3** | Settings screens | 2.5 giờ | 7h 45m |
| **Phase 4** | Support & content | 2 giờ | 9h 45m |
| **Phase 5** | Navigation setup | 30 phút | 10h 15m |
| **Phase 6** | Testing & polish | 1 giờ | **11h 15m** |

**Total: 11.25 giờ (~1.5 ngày work)**

---

## 📁 FILES SUMMARY

### **New Files (10):**

**Screens (7):**
1. `src/screens/Account/AffiliateDetailScreen.js`
2. `src/screens/Account/PortfolioScreen.js`
3. `src/screens/Account/PaperTradeHistoryScreen.js`
4. `src/screens/Account/ProfileSettingsScreen.js`
5. `src/screens/Account/NotificationSettingsScreen.js`
6. `src/screens/Account/HelpSupportScreen.js`
7. `src/screens/Account/TermsScreen.js`

**Components (1):**
8. `src/screens/tabs/components/ChangePasswordModal.js`

**Services (1):**
9. `src/services/portfolioService.js`

**Migrations (1):**
10. `supabase/migrations/20251125_account_features.sql`

### **Modified Files (2):**
1. `src/screens/tabs/AccountScreen.js` (add handlers + modal)
2. `src/navigation/AppNavigator.js` (add routes)

**Total: 12 files**

---

## 💾 DATABASE MIGRATIONS

**File:** `supabase/migrations/20251125_account_features.sql`

```sql
-- 1. Portfolio
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_buy_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_user ON portfolio_items(user_id);

-- 2. Notification Settings
CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  trading_pattern BOOLEAN DEFAULT true,
  trading_price BOOLEAN DEFAULT true,
  community_comment BOOLEAN DEFAULT true,
  community_like BOOLEAN DEFAULT true,
  community_follow BOOLEAN DEFAULT true,
  affiliate_referral BOOLEAN DEFAULT true,
  affiliate_commission BOOLEAN DEFAULT true,
  orders_status BOOLEAN DEFAULT true,
  orders_delivery BOOLEAN DEFAULT true,
  email_weekly BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio"
  ON portfolio_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own notification settings"
  ON notification_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## 📦 DEPENDENCIES

**Install:**
```bash
expo install expo-clipboard
expo install expo-image-picker
expo install expo-linking
```

**Already have:**
- @supabase/supabase-js ✅
- react-navigation ✅
- All UI libraries ✅

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Quick Fixes (15 phút)**
- [ ] Install expo-clipboard
- [ ] Add copy affiliate handler
- [ ] Add logout confirmation
- [ ] Fix navigation handlers

### **Phase 2: High Priority (5 giờ)**
- [ ] Create AffiliateDetailScreen
- [ ] Create PortfolioScreen
- [ ] Create portfolioService
- [ ] Create PaperTradeHistoryScreen
- [ ] Run database migrations

### **Phase 3: Settings (2.5 giờ)**
- [ ] Create ProfileSettingsScreen
- [ ] Install expo-image-picker
- [ ] Create ChangePasswordModal
- [ ] Create NotificationSettingsScreen

### **Phase 4: Support (2 giờ)**
- [ ] Install expo-linking
- [ ] Create HelpSupportScreen
- [ ] Create TermsScreen
- [ ] Add FAQ content

### **Phase 5: Navigation (30 phút)**
- [ ] Add 7 routes to AppNavigator
- [ ] Test all navigations

### **Phase 6: Testing (1 giờ)**
- [ ] Test all features end-to-end
- [ ] Fix bugs
- [ ] Polish UI/UX

---

## 🎯 SUCCESS CRITERIA

**All buttons work:**
- ✅ Copy affiliate code → Clipboard
- ✅ Chi tiết affiliate → AffiliateDetailScreen
- ✅ Portfolio → PortfolioScreen
- ✅ Paper Trade History → PaperTradeHistoryScreen
- ✅ Thông tin cá nhân → ProfileSettingsScreen
- ✅ Đổi mật khẩu → ChangePasswordModal
- ✅ Cài đặt thông báo → NotificationSettingsScreen
- ✅ Trợ giúp → HelpSupportScreen
- ✅ Điều khoản → TermsScreen
- ✅ Đăng xuất → Confirmation + logout

**Functionality works:**
- ✅ Portfolio CRUD operations
- ✅ Real-time portfolio prices
- ✅ Paper trade history filters
- ✅ Profile update + avatar upload
- ✅ Password change
- ✅ Notification settings save
- ✅ Deep links work
- ✅ No crashes

---

## 🚀 READY TO IMPLEMENT

**Prompt for Claude Code:**

```
Implement Tab Tài Sản fixes - 10 features:

Phase 1 (15 phút):
- Add expo-clipboard
- Implement copy affiliate code
- Add logout confirmation
- Fix all navigation handlers in AccountScreen.js

Phase 2 (5 giờ):
- AffiliateDetailScreen + API integration
- PortfolioScreen + portfolioService + Binance API
- PaperTradeHistoryScreen + query trading_journal
- Run database migrations

Phase 3 (2.5 giờ):
- ProfileSettingsScreen + expo-image-picker
- ChangePasswordModal + Supabase Auth
- NotificationSettingsScreen + database

Phase 4 (2 giờ):
- HelpSupportScreen + expo-linking
- TermsScreen + content

Phase 5 (30 phút):
- Add 7 routes to AppNavigator

Phase 6 (1 giờ):
- Test everything
- Fix bugs
- Polish

File: KE_HOACH_FINAL_TAB_TAI_SAN.md
Timeline: 11.25 giờ
Files: 10 new + 2 modified
```

---

**KẾ HOẠCH FINAL - CONFIRMED & READY! ✅**

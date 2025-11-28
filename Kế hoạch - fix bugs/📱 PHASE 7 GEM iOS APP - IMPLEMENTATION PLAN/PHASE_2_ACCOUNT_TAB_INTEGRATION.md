# 🔄 PHASE 2 UPDATE: DASHBOARD WIDGETS IN ACCOUNT TAB

**Critical Change:** Widgets add vào **AccountScreen.js** (Tab Tài Sản) thay vì DashboardScreen riêng

---

## 📍 LOCATION: TAB TÀI SẢN (ACCOUNT)

### **Current AccountScreen Structure:**
```
AccountScreen.js (src/screens/tabs/)
├─ 1. Profile Header (Avatar, name, username, bio)
├─ 2. Stats Row (Posts, Followers, Following)
├─ 3. Đơn Hàng Của Tôi (Orders)
├─ 4. Chương Trình Affiliate
├─ 5. Tài Sản (Portfolio & Paper Trade)
├─ 6. Tài Khoản (Settings)
└─ 7. Khác (Help, Terms, Logout)
```

### **NEW AccountScreen Structure (After Phase 2):**
```
AccountScreen.js (src/screens/tabs/)
├─ 1. Profile Header (Avatar, name, username, bio)
├─ 2. 📊 DASHBOARD WIDGETS ✨ [NEW SECTION]
│   ├─ Goal Tracking Cards (1-10 based on tier)
│   ├─ Daily Affirmation Card
│   ├─ Action Checklist Cards
│   └─ Stats Widget
├─ 3. Stats Row (Posts, Followers, Following)
├─ 4. Đơn Hàng Của Tôi (Orders)
├─ 5. Chương Trình Affiliate
├─ 6. Tài Sản (Portfolio & Paper Trade)
├─ 7. Tài Khoản (Settings)
└─ 8. Khác (Help, Terms, Logout)
```

**Position:** Dashboard Widgets section sẽ ở **position #2**, ngay sau Profile Header để prominent và dễ access.

---

## 🎨 VISUAL LAYOUT

### **AccountScreen.js với Dashboard Widgets:**

```
┌────────────────────────────────────────┐
│ Tab: Tài Sản                       ⚙️  │ ← Header
├────────────────────────────────────────┤
│                                        │
│ ┌────────────────────────────────┐    │
│ │ 👤 Profile Header              │    │
│ │ Avatar | Name | Username       │    │
│ │ Bio text...                    │    │
│ └────────────────────────────────┘    │
│                                        │
│ ┌────────────────────────────────┐    │ ← NEW!
│ │ 📊 Dashboard - Goals & Actions │▼   │
│ ├────────────────────────────────┤    │
│ │                                │    │
│ │ ┌──────────────────────────┐  │    │
│ │ │ 💰 100M Passive Income   │  │    │
│ │ │ ████░░░░░░░░ 40%         │  │    │
│ │ │ 92 days left             │  │    │
│ │ └──────────────────────────┘  │    │
│ │                                │    │
│ │ ┌──────────────────────────┐  │    │
│ │ │ ✨ Today's Affirmation   │  │    │
│ │ │ "Tiền bạc đến với tôi..." │  │    │
│ │ │ 🔥 7-day streak          │  │    │
│ │ └──────────────────────────┘  │    │
│ │                                │    │
│ │ [+ Add New Goal]               │    │
│ └────────────────────────────────┘    │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ 📊 Stats Row                   │    │
│ │ 42 Posts | 156 Followers       │    │
│ └────────────────────────────────┘    │
│                                        │
│ ┌────────────────────────────────┐    │
│ │ 📦 Đơn Hàng Của Tôi            │    │
│ └────────────────────────────────┘    │
│                                        │
│ ... (existing sections)                │
│                                        │
└────────────────────────────────────────┘
```

---

## 📝 IMPLEMENTATION CHANGES

### **File Structure (UPDATED):**

```
src/
├── screens/
│   ├── tabs/
│   │   └── AccountScreen.js          [MAJOR UPDATE]
│   │       ├─ Add DashboardWidgets section
│   │       ├─ Render user's widgets
│   │       └─ Collapsible section
│   │
│   └── Account/
│       ├─ AccountScreen.js           [NO CHANGES]
│       ├─ AffiliateDetailScreen.js   [NO CHANGES]
│       ├─ PortfolioScreen.js         [NO CHANGES]
│       └─ ... (other screens)
│
├── components/GemMaster/
│   ├── WidgetSuggestionCard.js       [NEW]
│   ├── WidgetPreviewModal.js         [NEW]
│   ├── GoalTrackingCard.js           [NEW]
│   ├── AffirmationCard.js            [NEW]
│   ├── ActionChecklistCard.js        [NEW]
│   ├── StatsWidget.js                [NEW]
│   └── WidgetEvolutionModal.js       [NEW]
│
└── services/
    ├── responseDetectionService.js   [NEW]
    ├── widgetFactoryService.js       [NEW]
    ├── widgetManagementService.js    [NEW]
    └── ... (other services)
```

**Note:** 
- ❌ NO DashboardScreen.js được tạo
- ✅ Widgets render trong AccountScreen.js existing
- ✅ All widget components reusable

---

## 🔧 ACCOUNTSCREEN.JS STRUCTURE

### **Current Code Structure (Simplified):**

```jsx
// AccountScreen.js (src/screens/tabs/)
const AccountScreen = () => {
  return (
    <ScrollView>
      {/* 1. Profile Header */}
      <ProfileHeader />
      
      {/* 2. Stats Row */}
      <StatsRow />
      
      {/* 3. Đơn Hàng */}
      <OrdersSection />
      
      {/* 4. Affiliate */}
      <AffiliateSection />
      
      {/* 5. Tài Sản */}
      <AssetsSection />
      
      {/* 6. Tài Khoản */}
      <AccountSettingsSection />
      
      {/* 7. Khác */}
      <OtherSection />
    </ScrollView>
  );
};
```

### **NEW Code Structure (With Widgets):**

```jsx
// AccountScreen.js (src/screens/tabs/)
import { useState, useEffect } from 'react';
import WidgetManagementService from '../../services/widgetManagementService';
import GoalTrackingCard from '../../components/GemMaster/GoalTrackingCard';
import AffirmationCard from '../../components/GemMaster/AffirmationCard';
import ActionChecklistCard from '../../components/GemMaster/ActionChecklistCard';
import StatsWidget from '../../components/GemMaster/StatsWidget';

const AccountScreen = () => {
  const [widgets, setWidgets] = useState([]);
  const [isWidgetSectionCollapsed, setIsWidgetSectionCollapsed] = useState(false);
  
  // Load user's widgets
  useEffect(() => {
    loadUserWidgets();
  }, []);
  
  const loadUserWidgets = async () => {
    const userWidgets = await WidgetManagementService.getUserWidgets(userId);
    setWidgets(userWidgets);
  };
  
  return (
    <ScrollView>
      {/* 1. Profile Header */}
      <ProfileHeader />
      
      {/* 2. Dashboard Widgets Section - NEW! */}
      {widgets.length > 0 && (
        <View style={styles.dashboardSection}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsWidgetSectionCollapsed(!isWidgetSectionCollapsed)}
          >
            <Text style={styles.sectionTitle}>
              📊 Dashboard - Goals & Actions
            </Text>
            <Icon name={isWidgetSectionCollapsed ? 'chevron-down' : 'chevron-up'} />
          </TouchableOpacity>
          
          {!isWidgetSectionCollapsed && (
            <View style={styles.widgetsContainer}>
              {widgets.map(widget => {
                switch(widget.type) {
                  case 'GOAL_CARD':
                    return <GoalTrackingCard key={widget.id} widget={widget} />;
                  case 'AFFIRMATION_CARD':
                    return <AffirmationCard key={widget.id} widget={widget} />;
                  case 'ACTION_CHECKLIST':
                    return <ActionChecklistCard key={widget.id} widget={widget} />;
                  case 'STATS_WIDGET':
                    return <StatsWidget key={widget.id} widget={widget} />;
                  default:
                    return null;
                }
              })}
              
              {/* Add New Goal Button */}
              <TouchableOpacity 
                style={styles.addWidgetButton}
                onPress={() => navigation.navigate('GemMaster')}
              >
                <Text>+ Thêm Mục Tiêu Mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Empty State - No widgets yet */}
      {widgets.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            💎 Chưa có mục tiêu nào
          </Text>
          <Text style={styles.emptyText}>
            Chat với GEM AI để tạo goals & affirmations!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('GemMaster')}
          >
            <Text>Bắt Đầu Ngay</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 3. Stats Row */}
      <StatsRow />
      
      {/* 4. Đơn Hàng */}
      <OrdersSection />
      
      {/* ... existing sections ... */}
    </ScrollView>
  );
};
```

---

## 🔗 NAVIGATION FLOW

### **User Journey:**

```
FLOW 1: Create Widget from Chat
─────────────────────────────────
1. User in Gemral tab
2. Chat với AI: "Manifest 100M"
3. AI suggest: "Add to Dashboard?"
4. User click "Yes"
5. Widget created → Saved to database
6. Success message: "✅ View in Account tab"
7. User navigate to Account tab
8. See new widget in Dashboard section
```

```
FLOW 2: View Existing Widgets
──────────────────────────────
1. User tap Account tab
2. See Profile Header
3. See Dashboard section (collapsed by default if >3 widgets)
4. Tap to expand
5. See all widgets
6. Interact with widgets (update progress, check tasks)
```

```
FLOW 3: Notification → Widget
──────────────────────────────
1. User receives notification (Morning Affirmation)
2. Tap notification
3. Deep link opens app → Account tab
4. Auto-scroll to Dashboard section
5. Expand Dashboard section
6. Highlight specific widget (affirmation card)
```

### **Deep Linking Implementation:**

```javascript
// Handle notification deep link
Notifications.addNotificationResponseReceivedListener(response => {
  const { widgetId, widgetType } = response.notification.request.content.data;
  
  // Navigate to Account tab
  navigation.navigate('MainTabs', {
    screen: 'Account',
    params: {
      scrollToWidget: widgetId,
      expandDashboard: true
    }
  });
});

// In AccountScreen.js
useEffect(() => {
  if (route.params?.scrollToWidget) {
    // Expand dashboard section
    setIsWidgetSectionCollapsed(false);
    
    // Scroll to specific widget
    setTimeout(() => {
      widgetRefs[route.params.scrollToWidget]?.current?.scrollIntoView();
      
      // Highlight widget briefly
      highlightWidget(route.params.scrollToWidget);
    }, 300);
  }
}, [route.params]);
```

---

## 🎨 UI/UX CONSIDERATIONS

### **1. Collapsible Section:**
```
Default State:
- Collapsed if user has 4+ widgets (save space)
- Expanded if user has 1-3 widgets (show immediately)
- Remember user's preference (AsyncStorage)
```

### **2. Widget Order:**
```
Display Priority:
1. Active goals (progress < 100%)
2. Today's affirmation
3. Incomplete checklists
4. Stats widget (always last)
5. Completed goals (collapsed by default)
```

### **3. Empty State:**
```
No Widgets Yet:
- Show beautiful empty state
- "💎 Chưa có mục tiêu nào"
- CTA button: "Bắt Đầu Ngay" → Navigate to GemMaster tab
- Subtle animation (fade in)
```

### **4. Space Management:**
```
Max Widgets Displayed:
- FREE: 1 widget shown, rest collapsed
- TIER1: 3 widgets shown
- TIER2: 5 widgets shown
- TIER3: All widgets shown

"View All" button if more widgets exist
```

---

## 📊 UPDATED FILE CHANGES

### **Files to MODIFY:**

**1. AccountScreen.js (MAJOR UPDATE)**
```
Location: src/screens/tabs/AccountScreen.js
Changes:
+ Import widget components
+ Add state for widgets
+ Add loadUserWidgets()
+ Add Dashboard section (position #2)
+ Add empty state
+ Add collapsible logic
+ Add deep link handling
```

**2. Navigation (AccountStack.js)**
```
Location: src/navigation/AccountStack.js
Changes:
- NO new screens needed ✅
- Deep link params handled in AccountScreen
```

### **Files to CREATE (Components):**

All widget components in `src/components/GemMaster/`:
- WidgetSuggestionCard.js
- WidgetPreviewModal.js
- GoalTrackingCard.js
- AffirmationCard.js
- ActionChecklistCard.js
- StatsWidget.js
- WidgetEvolutionModal.js

### **Files to CREATE (Services):**

All services in `src/services/`:
- responseDetectionService.js
- widgetFactoryService.js
- widgetManagementService.js
- widgetInteractionService.js
- notificationScheduler.js
- notificationPersonalizer.js

---

## ✅ TESTING CHECKLIST (UPDATED)

### **AccountScreen Integration:**

- [ ] Dashboard section renders correctly
- [ ] Widgets display in correct order
- [ ] Empty state shows when no widgets
- [ ] Collapsible section works
- [ ] "Add New Goal" button navigates to GemMaster
- [ ] Deep link from notification works
- [ ] Auto-scroll to widget works
- [ ] Highlight animation works
- [ ] Doesn't break existing AccountScreen features
- [ ] Scrolling smooth with many widgets
- [ ] Performance good (no lag)

### **Widget Functionality:**

- [ ] Goal card updates progress
- [ ] Affirmation card shows daily affirmation
- [ ] Checklist card checkboxes work
- [ ] Stats widget displays accurate data
- [ ] All widgets responsive (different screen sizes)
- [ ] All widgets follow design tokens
- [ ] All widgets match GEM brand

### **User Flow:**

- [ ] Chat → Create widget → See in Account ✅
- [ ] Notification → Open widget ✅
- [ ] Edit widget works
- [ ] Delete widget works
- [ ] Widget order can be changed
- [ ] Tier limits enforced (1/3/10/unlimited)

---

## 🎯 SUCCESS CRITERIA (UPDATED)

### **Must Work:**

✅ Widgets render in AccountScreen properly  
✅ Doesn't disrupt existing Account features  
✅ Smooth user experience  
✅ Deep linking 100% working  
✅ All widget types functional  
✅ Performance optimized  

### **Nice to Have:**

- Drag & drop to reorder widgets
- Swipe to delete widget
- Widget customization themes
- Share widget as image from Account

---

## 🚨 CRITICAL NOTES

### **Why Account Tab Makes Sense:**

✅ **User Mindset:** 
- "Account" = "My stuff", "My dashboard"
- Natural place for personal goals & tracking

✅ **Existing Pattern:**
- Account already has "Tài Sản" section
- Widgets = Digital assets/goals
- Fits existing mental model

✅ **Navigation:**
- No new tab needed
- Users already visit Account frequently
- Easy to find

✅ **Technical:**
- Simpler implementation
- No new navigation screen
- Reuse existing AccountScreen

### **Position #2 (After Profile Header):**

✅ **Prominent:** First thing user sees after profile  
✅ **Priority:** Goals/actions are important  
✅ **Flow:** Natural progression (Who am I → What are my goals → What are my assets)  

---

## 📝 SUMMARY OF CHANGES

### **Original Plan:**
```
❌ Create new DashboardScreen.js
❌ Add to navigation as separate screen
❌ User navigate to separate dashboard
```

### **Updated Plan:**
```
✅ Add Dashboard section to AccountScreen.js
✅ Position #2 (after Profile Header)
✅ Collapsible section
✅ No new navigation screen needed
✅ Deep link to Account tab
✅ Simpler, cleaner implementation
```

---

**STATUS:** ✅ UPDATED to integrate with Account tab  
**Location:** AccountScreen.js (src/screens/tabs/)  
**Position:** Section #2 (after Profile Header)  
**Impact:** Cleaner UX, easier implementation  

🚀 **READY FOR IMPLEMENTATION!**

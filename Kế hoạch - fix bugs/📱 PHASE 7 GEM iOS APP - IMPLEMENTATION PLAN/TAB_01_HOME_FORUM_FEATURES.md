# 📱 TAB 1: HOME (FORUM) - DETAILED FEATURES

**Last Updated:** November 26, 2025
**Status:** ✅ COMPLETE

---

## 1. FEED & NAVIGATION

### A. Main Feed Display
✅ **FlatList Feed** - Infinite scroll với performance optimization
✅ **Pull-to-Refresh** - Kéo xuống để refresh (tintColor: gold)
✅ **Infinite Scroll** - Load thêm posts khi scroll đến cuối (threshold: 0.5)
✅ **Empty State** - Hiển thị khi không có bài viết ("Chưa có bài viết")
✅ **Loading State** - ActivityIndicator với gold color khi đang load

### B. Category Tabs (Top Navigation)
✅ **Explore** - "Dành cho bạn" - Personalized feed
✅ **Following** - "Đang theo dõi" - Posts từ người follow
✅ **News** - "Tin tức" - News feed
✅ **Popular** - "Phổ biến" - Trending posts
✅ **Academy** - "Academy" - Educational content

### C. Swipe Navigation
✅ **Horizontal Swipe** - Swipe left/right để chuyển tab
✅ **useSwipeNavigation Hook** - Custom hook quản lý gesture
✅ **canSwipeLeft/canSwipeRight** - Boundary detection

---

## 2. BURGER MENU (SIDE MENU)

### A. Menu Animation
✅ **Slide Animation** - Spring animation từ trái sang (tension: 65, friction: 11)
✅ **Modal Overlay** - Semi-transparent overlay (rgba(0,0,0,0.7))
✅ **Glass Morphism** - BlurView với liquid effect
✅ **Tap Outside to Close** - Chạm overlay để đóng menu

### B. Quick Actions
✅ **Đã Thích** - Xem posts đã like (Heart icon, color: error)
✅ **Đã Lưu** - Xem posts đã bookmark (Bookmark icon, color: gold)

### C. System Feeds
| Section | Feed | Subtitle | Icon |
|---------|------|----------|------|
| NGUỒN TIN | Đang Theo Dõi | Người bạn follow | Users |

### D. Category Feeds

**GIAO DỊCH Section:**
| Feed | Subtitle | Icon |
|------|----------|------|
| Phân Tích Thị Trường | Crypto & futures | TrendingUp |
| Chia Sẻ Tips Hay | GEM Method | Target |
| Kết Quả Giao Dịch | Chia sẻ P/L | DollarSign |

**TINH THẦN Section:**
| Feed | Subtitle | Icon |
|------|----------|------|
| Review Đá Crystal | Crystal healing | Gem |
| Luật Hấp Dẫn | Mindset & năng lượng | Sparkles |
| Tips Chữa Lành | Phát triển bản thân | Users |

**THỊNH VƯỢNG Section:**
| Feed | Subtitle | Icon |
|------|----------|------|
| Giao Dịch Chánh Niệm | Kết hợp cả hai | Target |
| Tips Trader Thành Công | Tư duy thịnh vượng | Rocket |

**KIẾM TIỀN Section:**
| Feed | Subtitle | Icon |
|------|----------|------|
| Affiliate & CTV | Cơ hội hợp tác | DollarSign |

### E. Custom Feeds Management
✅ **Create Feed Button (+)** - Tạo feed mới
✅ **Edit Feeds Button (Edit3)** - Chỉnh sửa feeds
✅ **Custom Feeds List** - Hiển thị user-created feeds
✅ **Reorder Feeds** - Drag để sắp xếp lại
✅ **Delete Feed** - Xóa custom feed

---

## 3. POST CARD COMPONENT

### A. Author Header
✅ **Avatar** - 40x40px, rounded, tap để xem profile
✅ **Author Name** - Font semibold, tap để xem profile
✅ **User Badges** - Hiển thị badges (tiny size, max 2)
✅ **Timestamp** - Relative time ("Vừa xong", "5 phút trước", etc.)
✅ **Category Badge** - Badge màu theo category

### B. Post Content
✅ **Title** - Font bold, xxl size, max 2 lines
✅ **Content Preview** - Font lg, max 3 lines
✅ **Post Image** - 200px height, rounded corners
✅ **Media Support** - image_url hoặc media_url

### C. Interaction Actions

**Like Button:**
✅ **Like/Unlike Toggle** - Heart icon với animation
✅ **Like Count Display** - Hiển thị số likes
✅ **Like Animation** - Bounce animation khi like (scale 1 → 1.4 → 1)
✅ **Unlike Animation** - Scale animation (1 → 0.8 → 1)
✅ **AuthGate** - Yêu cầu đăng nhập

**Double-Tap Like (Instagram Style):**
✅ **Double-Tap Detection** - 300ms threshold
✅ **Big Heart Animation** - Heart 80px xuất hiện giữa post
✅ **Heart Fade Out** - Fade sau 400ms

**Comment Button:**
✅ **Comment Icon** - MessageCircle icon
✅ **Comment Count** - Hiển thị số comments
✅ **Navigate to Detail** - Mở PostDetail với focusComment
✅ **AuthGate** - Yêu cầu đăng nhập

**Share Button:**
✅ **Share Icon** - Share2 icon
✅ **Native Share** - Sử dụng React Native Share API
✅ **Share Content** - Title + content preview + "Xem thêm tại Gemral"

**Save/Bookmark Button:**
✅ **Bookmark Toggle** - Bookmark icon filled/outline
✅ **Save State** - Gold color khi đã save
✅ **AuthGate** - Yêu cầu đăng nhập

---

## 4. POST DETAIL SCREEN

### A. Header
✅ **Back Button** - ArrowLeft icon, navigate back
✅ **Title** - "Chi tiết bài viết"
✅ **Glass Background** - GLASS.background với border

### B. Post Card (Full)
✅ **Author Row** - Avatar + name + badges + timestamp
✅ **Full Title** - Display size, bold
✅ **Full Content** - lg size, lineHeight 22
✅ **Full Image** - 200px height nếu có
✅ **Action Buttons** - Like + Comment với counts

### C. Comments Section
✅ **Comments Title** - "Bình luận (count)"
✅ **Comments List** - Danh sách comments
✅ **Empty State** - "Chưa có bình luận nào. Hãy là người đầu tiên!"

### D. Comment Item
✅ **Comment Avatar** - 32x32px
✅ **Author Name** - md size, semibold
✅ **User Badges** - tiny size, max 2
✅ **Comment Text** - lg size
✅ **Timestamp** - xs size, muted
✅ **Reply Button** - Reply icon + "Trả lời" text

### E. Nested Replies
✅ **Reply Container** - marginLeft 40px với left border
✅ **Reply Avatar** - 28x28px
✅ **Reply Content** - Same style như comment
✅ **Reply Threading** - Visual hierarchy với border

### F. Comment Input
✅ **Fixed Position** - Above tab bar
✅ **Animated Position** - Keyboard show/hide animation
✅ **Text Input** - Multiline, max 500 chars
✅ **Send Button** - Send icon, disabled khi empty
✅ **Loading State** - ActivityIndicator khi submitting

### G. Reply Mode
✅ **Replying To Bar** - Purple background với name
✅ **Cancel Reply** - X button để cancel
✅ **Placeholder Change** - "Trả lời {name}..."
✅ **Parent Comment Link** - Reply được nest dưới parent

---

## 5. CREATE POST SCREEN

### A. Header
✅ **Close Button** - X icon, dismiss modal
✅ **Title** - "Tạo bài viết"
✅ **Submit Button** - "Đăng" với gold background

### B. Topic Selector
✅ **Topic Dropdown** - Expandable picker
✅ **No Selection Option** - "Không chọn"
✅ **Color Coding** - Mỗi topic có màu riêng

**Main Topics (All Users):**
| Topic | Color | Icon |
|-------|-------|------|
| GIAO DỊCH | #00F0FF (cyan) | 🎯 |
| TINH THẦN | #6A5BFF (purple) | ☯️ |
| THỊNH VƯỢNG | #FFBD59 (gold) | 🌟 |

**Admin-Only Topics:**
| Topic | Color | Icon | Feed Type |
|-------|-------|------|-----------|
| AFFILIATE | #FF6B6B | 💰 | affiliate |
| TIN TỨC | #4ECDC4 | 📰 | news |
| THÔNG BÁO | #FFE66D | 📢 | announcement |
| ACADEMY | #A855F7 | 🎓 | academy |

### C. Content Input
✅ **Combined Input** - Title từ dòng đầu tiên
✅ **Multiline** - TextAlignVertical top
✅ **Hint** - "Dòng đầu tiên sẽ tự động trở thành tiêu đề"
✅ **Auto Extract** - First line = title, rest = content

### D. Media Upload
✅ **Add Media Button** - Dashed border, ImagePlus icon
✅ **Image Picker** - Chọn từ library
✅ **Camera** - Chụp ảnh mới
✅ **Media Preview** - Hiển thị ảnh đã chọn
✅ **Edit Button** - Crop icon để edit
✅ **Delete Button** - Trash2 icon để xóa
✅ **Upload Progress** - Overlay với ActivityIndicator

### E. Image Editor Modal
✅ **Full Screen Modal** - presentationStyle fullScreen
✅ **Image Preview** - Full size preview
✅ **Rotate Tool** - Xoay 90 độ
✅ **Crop Tool** - Crop 16:9
✅ **Save/Cancel** - Header buttons
✅ **Loading Overlay** - Khi đang process

---

## 6. REALTIME FEATURES

### A. Supabase Realtime
✅ **INSERT Listener** - Nhận posts mới realtime
✅ **UPDATE Listener** - Cập nhật posts đã edit
✅ **DELETE Listener** - Xóa posts đã remove
✅ **Channel Subscribe** - 'forum_posts_changes'
✅ **Cleanup** - Unsubscribe khi unmount

### B. Deduplication
✅ **addNewPost Function** - Prevent duplicate posts
✅ **Exists Check** - Check by post ID
✅ **Update Instead of Add** - Nếu đã tồn tại thì update

---

## 7. RECOMMENDATION SYSTEM

### A. For You Feed (Explore)
✅ **forumRecommendationService** - Service xử lý recommendations
✅ **getForYouPosts** - Sort posts theo relevance
✅ **Fallback** - Dùng default order nếu service lỗi

### B. View Tracking
✅ **trackView** - Track khi user xem post
✅ **Non-blocking** - Async tracking không block UI
✅ **Error Handling** - Catch errors silently

---

## 8. AUTHENTICATION INTEGRATION

### A. AuthGate Component
✅ **Protected Actions** - Wrap interactive buttons
✅ **Login Prompt** - Alert với option đăng nhập
✅ **Action Description** - Custom message per action
✅ **Navigation** - Navigate to Auth screen

### B. Protected Actions
- Like post
- Comment on post
- Save/bookmark post
- Create new post

---

## 9. HEADER COMPONENTS

### A. Main Header
✅ **Menu Button** - Burger icon, mở SideMenu
✅ **Title** - "💎 GEM" + subtitle (current feed name)
✅ **Search Icon** - Search button
✅ **Messages Icon** - HeaderMessagesIcon với unread badge
✅ **Bell Icon** - Notifications button

### B. FAB Button
✅ **Floating Action Button** - Create post button
✅ **Position** - Bottom right corner
✅ **AuthGate Wrapped** - Yêu cầu đăng nhập
✅ **Navigation** - Navigate to CreatePost

---

## 10. CSS/STYLING

### A. Color Palette
```javascript
// Background
GRADIENTS.background: ['#05040B', '#0F1030', '#1a0b2e']

// Header
GLASS.background: rgba(15, 16, 48, 0.55)
borderBottomColor: 'rgba(255, 189, 89, 0.2)'

// Title
COLORS.textPrimary: #FFFFFF
COLORS.gold: #FFBD59

// SideMenu
overlay: 'rgba(0, 0, 0, 0.7)'
panelBorder: 'rgba(106, 91, 255, 0.3)'
quickActionBg: 'rgba(255, 189, 89, 0.1)'
quickActionBorder: 'rgba(255, 189, 89, 0.3)'
feedItemBg: 'rgba(106, 91, 255, 0.08)'
feedItemBorder: 'rgba(106, 91, 255, 0.15)'
feedItemActive: 'rgba(255, 189, 89, 0.15)'

// Post Card
GLASS.background: rgba(15, 16, 48, 0.55)
borderColor: 'rgba(106, 91, 255, 0.2)'
GLASS.borderRadius: 18px
GLASS.padding: 20px

// Like Button
liked: #FF6B6B
unliked: COLORS.textMuted

// Save Button
saved: COLORS.gold (#FFBD59)
unsaved: COLORS.textMuted
```

### B. Typography
```javascript
// Title
fontSize: TYPOGRAPHY.fontSize.xxl (16)
fontWeight: bold

// Content
fontSize: TYPOGRAPHY.fontSize.lg (14)
lineHeight: 20

// Author
fontSize: TYPOGRAPHY.fontSize.lg (14)
fontWeight: semibold

// Timestamp
fontSize: TYPOGRAPHY.fontSize.sm (11)
color: COLORS.textMuted
```

---

## 11. KEY FILES

### Screen Files
- `src/screens/Forum/ForumScreen.js` (505 lines)
- `src/screens/Forum/PostDetailScreen.js` (694 lines)
- `src/screens/Forum/CreatePostScreen.js` (825 lines)
- `src/screens/Forum/UserProfileScreen.js`

### Component Files
- `src/screens/Forum/components/PostCard.js` (518 lines)
- `src/screens/Forum/components/SideMenu.js` (614 lines)
- `src/screens/Forum/components/CategoryTabs.js`
- `src/screens/Forum/components/FABButton.js`
- `src/screens/Forum/components/CreateFeedModal.js`
- `src/screens/Forum/components/EditFeedsModal.js`

### Service Files
- `src/services/forumService.js`
- `src/services/forumRecommendationService.js`

### Shared Components
- `src/components/AuthGate.js`
- `src/components/UserBadge/UserBadges.js`
- `src/components/HeaderMessagesIcon.js`

### Hooks
- `src/hooks/useSwipeNavigation.js`

---

## 12. PENDING/FUTURE FEATURES

### Not Implemented Yet:
⏳ **Video Posts** - Upload và play video
⏳ **Polls** - Tạo polls/surveys
⏳ **Mentions** - @mention users trong post
⏳ **Hashtags** - #hashtag support
⏳ **Report Post** - Report inappropriate content
⏳ **Block User** - Block user từ feed
⏳ **Hide Post** - Ẩn post khỏi feed
⏳ **Turn Off Notifications** - Tắt notifications cho post
⏳ **Multiple Images** - Upload nhiều ảnh
⏳ **Image Gallery** - Swipe qua nhiều ảnh
⏳ **Link Preview** - Preview URLs trong post
⏳ **Rich Text** - Bold, italic, formatting
⏳ **Drafts** - Lưu drafts

---

**📝 Document Version:** 1.0
**📅 Last Updated:** November 26, 2025

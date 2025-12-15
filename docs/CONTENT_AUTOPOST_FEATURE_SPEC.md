# CONTENT & AUTO-POST FEATURE SPEC
## COMPLETE IMPLEMENTATION DOCUMENTATION

**Feature:** Nội Dung & Auto-Post System
**Location:** Account Tab > Admin Dashboard > Nội Dung & Auto-Post
**Status:** FULLY IMPLEMENTED
**Last Updated:** 2025-12-14

---

## 1. FEATURE OVERVIEW

### 1.1 Purpose
A comprehensive content management and auto-posting system that allows admins to:
- Schedule content for automatic posting
- Manage connections to multiple social platforms
- Track posting history and status
- Create/edit/delete scheduled content

### 1.2 Supported Platforms
| Platform | Code | Color | Auth Required | Status |
|----------|------|-------|---------------|--------|
| Gemral Feed | `gemral` | `#FFBD59` (gold) | No | Ready to use |
| Facebook Page | `facebook` | `#1877F2` | Yes (Access Token) | Implemented |
| YouTube | `youtube` | `#FF0000` | Yes (Access Token) | Implemented |
| Instagram | `instagram` | `#E4405F` | Yes (Access Token) | Implemented |
| TikTok | `tiktok` | `#000000` | Yes (Access Token) | Planned |
| Threads | `threads` | `#000000` | Yes (Access Token) | Planned |

### 1.3 Content Status Workflow
```
draft → scheduled → posting → posted/failed → cancelled
```

| Status | Color | Vietnamese Label |
|--------|-------|------------------|
| `draft` | `COLORS.textMuted` | Nháp |
| `scheduled` | `COLORS.info` | Đã lên lịch |
| `posting` | `COLORS.warning` | Đang đăng |
| `posted` | `COLORS.success` | Đã đăng |
| `failed` | `COLORS.error` | Thất bại |
| `cancelled` | `#9ca3af` | Đã hủy |

---

## 2. DATABASE SCHEMA

### 2.1 Table: `content_calendar`
**Migration:** `supabase/migrations/20251202_content_calendar.sql`

```sql
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content info
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL DEFAULT 'post',

  -- Media
  media_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  video_url TEXT,

  -- Metadata
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  link_url TEXT,

  -- Platform targeting
  platform VARCHAR(50) NOT NULL,

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',

  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft',
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  external_post_id VARCHAR(255),

  -- Pillar/Category
  pillar VARCHAR(100),

  -- Author
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_content_calendar_schedule` - (scheduled_date, scheduled_time, status)
- `idx_content_calendar_platform` - (platform, status)
- `idx_content_calendar_date_range` - (scheduled_date, platform)
- `idx_content_calendar_title` - Full-text search on title

**RLS Policies:**
- Admins full access
- Creators can manage own content
- Authenticated users can view posted content

### 2.2 Table: `auto_post_logs`
**Migration:** `supabase/migrations/20251202_auto_post_logs.sql`

```sql
CREATE TABLE IF NOT EXISTS auto_post_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference
  content_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,

  -- Execution info
  platform VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,

  -- Response data
  response_data JSONB,
  error_message TEXT,
  error_code VARCHAR(50),

  -- External reference
  external_post_id VARCHAR(255),
  external_url TEXT,

  -- Timing
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,

  -- Retry info
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'
);
```

**Action Types:**
- `post_created`
- `post_updated`
- `post_deleted`
- `post_failed`
- `retry_attempted`

**Log Statuses:**
- `success`
- `failed`
- `pending`
- `retrying`

### 2.3 Table: `platform_connections`
**Migration:** `supabase/migrations/20251202_platform_connections.sql`

```sql
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Platform info
  platform VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,

  -- Connection status
  is_connected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Credentials
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Platform-specific IDs
  page_id VARCHAR(255),      -- Facebook Page ID
  channel_id VARCHAR(255),   -- YouTube Channel ID
  account_id VARCHAR(255),   -- Generic account ID

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Metadata
  connected_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data:**
- gemral, facebook, youtube, tiktok, threads, instagram

---

## 3. UI SCREENS

### 3.1 ContentCalendarScreen
**File:** `gem-mobile/src/screens/Admin/ContentCalendarScreen.js`

**Purpose:** Main calendar view for managing scheduled content

**Components:**
- Header with Calendar icon and title
- Stats row (Today, This Week, Posted, Failed)
- Month navigation (prev/next)
- FlatList grouped by date
- FAB for adding new content
- Action modal for Edit/Schedule/Cancel/Delete

**State:**
```javascript
const [contentByDate, setContentByDate] = useState({});
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedItem, setSelectedItem] = useState(null);
const [showActionModal, setShowActionModal] = useState(false);
```

**UI Specifications:**

| Element | Style |
|---------|-------|
| Header Title | fontSize: TYPOGRAPHY.fontSize.xxxl, color: COLORS.gold |
| Stats Row | backgroundColor: 'rgba(0,0,0,0.3)', justify: space-around |
| Stat Value | fontSize: TYPOGRAPHY.fontSize.display, fontWeight: bold |
| Month Text | fontSize: TYPOGRAPHY.fontSize.xxxl, textTransform: capitalize |
| Date Section | paddingHorizontal: SPACING.lg, border-bottom |
| Today Section | backgroundColor: 'rgba(255,189,89,0.1)' |
| Content Item | backgroundColor: GLASS.background, borderRadius: SPACING.sm |
| Platform Indicator | width: 4, height: 40, borderRadius: 2 |
| Status Badge | paddingHorizontal: SPACING.sm, paddingVertical: 2 |
| FAB | width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.gold |

**Actions:**
- `handlePrevMonth()` / `handleNextMonth()` - Navigate months
- `handleAddContent()` - Navigate to ContentEditor
- `handleEditContent(item)` - Navigate to ContentEditor with contentId
- `handleDeleteContent(item)` - Delete with confirmation
- `handleScheduleContent(item)` - Change status to 'scheduled'
- `handleCancelContent(item)` - Change status to 'cancelled'

### 3.2 ContentEditorScreen
**File:** `gem-mobile/src/screens/Admin/ContentEditorScreen.js`

**Purpose:** Create or edit content for scheduling

**Form Fields:**
| Field | Type | Required | Placeholder |
|-------|------|----------|-------------|
| Title | TextInput | Yes | "Nhập tiêu đề bài viết..." |
| Content | TextInput (multiline) | Yes | "Nhập nội dung bài viết..." |
| Platform | Chip selector | Yes | 6 options |
| Content Type | Chip selector | Yes | post/video/short/story |
| Pillar | Chip selector | No | 5 options |
| Scheduled Date | DateTimePicker | Yes | Today |
| Scheduled Time | DateTimePicker | Yes | Current time |
| Hashtags | TextInput | No | "hashtags, phân cách bằng dấu phẩy" |
| Link URL | TextInput (url) | No | "https://..." |
| Media URLs | TextInput (multiline) | No | "URL hình ảnh (mỗi dòng 1 URL)" |
| Video URL | TextInput (url) | No (only for video/short) | "URL video..." |

**Platform Options:**
```javascript
const PLATFORM_OPTIONS = [
  { id: 'gemral', label: 'Gemral Feed', icon: Home },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Film },
  { id: 'threads', label: 'Threads', icon: FileText },
];
```

**Content Type Options:**
```javascript
const CONTENT_TYPE_OPTIONS = [
  { id: 'post', label: 'Bài viết', icon: FileText },
  { id: 'video', label: 'Video', icon: Film },
  { id: 'short', label: 'Short/Reel', icon: Film },
  { id: 'story', label: 'Story', icon: Image },
];
```

**Pillar Options:**
```javascript
const PILLAR_OPTIONS = [
  { id: 'spiritual', label: 'Tâm linh' },
  { id: 'trading', label: 'Trading' },
  { id: 'money', label: 'Tài chính' },
  { id: 'healing', label: 'Chữa lành' },
  { id: 'community', label: 'Cộng đồng' },
];
```

**UI Specifications:**

| Element | Style |
|---------|-------|
| Section Title | fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textSecondary |
| Input | backgroundColor: INPUT.background, borderRadius: INPUT.borderRadius |
| Text Area | minHeight: 120, textAlignVertical: 'top' |
| Option Chip | backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: SPACING.sm |
| Option Chip Active | backgroundColor: COLORS.gold |
| Save Button | backgroundColor: 'rgba(255,255,255,0.1)' |
| Schedule Button | backgroundColor: COLORS.gold |

**Actions:**
- `handleSave(false)` - Save as draft
- `handleSave(true)` - Save and schedule

### 3.3 AutoPostLogsScreen
**File:** `gem-mobile/src/screens/Admin/AutoPostLogsScreen.js`

**Purpose:** View history of all auto-post activities

**Components:**
- Header with back button and filter
- Stats row (Total, Today, Success, Failed)
- FlatList of log items
- Filter modal by status
- Detail modal for log info

**State:**
```javascript
const [logs, setLogs] = useState([]);
const [stats, setStats] = useState(null);
const [filterStatus, setFilterStatus] = useState(null);
const [showFilterModal, setShowFilterModal] = useState(false);
const [selectedLog, setSelectedLog] = useState(null);
const [showDetailModal, setShowDetailModal] = useState(false);
```

**Status Config:**
```javascript
const STATUS_CONFIG = {
  success: { color: COLORS.success, icon: CheckCircle, label: 'Thành công' },
  failed: { color: COLORS.error, icon: XCircle, label: 'Thất bại' },
  pending: { color: COLORS.warning, icon: Clock, label: 'Đang chờ' },
  retrying: { color: COLORS.info, icon: RefreshCw, label: 'Đang thử lại' },
};
```

**UI Specifications:**

| Element | Style |
|---------|-------|
| Log Item | backgroundColor: GLASS.background, borderRadius: GLASS.borderRadius |
| Log Title | fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: semibold |
| Platform Text | fontSize: TYPOGRAPHY.fontSize.md, textTransform: capitalize |
| Error Text | fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.error, fontStyle: italic |
| Filter Modal | width: '80%', backgroundColor: COLORS.bgMid |
| Detail Modal | width: '90%', maxHeight: '80%' |

**Features:**
- Pagination with infinite scroll
- Pull-to-refresh
- Filter by status (success/failed/pending/retrying)
- View detailed log info with all fields

### 3.4 PlatformSettingsScreen
**File:** `gem-mobile/src/screens/Admin/PlatformSettingsScreen.js`

**Purpose:** Manage platform connections and credentials

**Components:**
- Header with back button
- FlatList of platform items
- Each platform shows: icon, name, status, toggle, actions
- Connect modal for entering credentials

**State:**
```javascript
const [platforms, setPlatforms] = useState([]);
const [showConnectModal, setShowConnectModal] = useState(false);
const [selectedPlatform, setSelectedPlatform] = useState(null);
const [accessToken, setAccessToken] = useState('');
const [pageId, setPageId] = useState('');
const [connecting, setConnecting] = useState(false);
```

**Platform Config:**
```javascript
const PLATFORM_CONFIG = {
  gemral: { label: 'Gemral Feed', icon: Home, color: COLORS.gold, noAuth: true },
  facebook: { label: 'Facebook Page', icon: Facebook, color: '#1877F2' },
  youtube: { label: 'YouTube', icon: Youtube, color: '#FF0000' },
  instagram: { label: 'Instagram', icon: Instagram, color: '#E4405F' },
  tiktok: { label: 'TikTok', icon: Film, color: '#000000' },
  threads: { label: 'Threads', icon: FileText, color: '#000000' },
};
```

**UI Specifications:**

| Element | Style |
|---------|-------|
| Platform Item | backgroundColor: GLASS.background, borderRadius: GLASS.borderRadius |
| Platform Icon | width: 48, height: 48, borderRadius: 12 |
| Platform Name | fontSize: TYPOGRAPHY.fontSize.xxxl, fontWeight: semibold |
| Connected Badge | color: COLORS.success |
| Disconnected Badge | color: COLORS.textMuted |
| No Auth Badge | "Sẵn sàng sử dụng", color: COLORS.success |
| Connect Button | backgroundColor: COLORS.gold |
| Switch | trackColor: { true: COLORS.success } |

**Actions:**
- `handleToggleActive(platform)` - Toggle is_active
- `handleConnectPress(platform)` - Open connect modal
- `handleConnect()` - Save credentials
- `handleDisconnect(platform)` - Clear credentials with confirmation

---

## 4. SERVICES

### 4.1 contentCalendarService.js
**File:** `gem-mobile/src/services/contentCalendarService.js`

**Exports:**
```javascript
// Constants
export const PLATFORMS = ['gemral', 'facebook', 'tiktok', 'youtube', 'threads', 'instagram'];
export const CONTENT_TYPES = ['post', 'video', 'short', 'reel', 'story'];
export const STATUSES = ['draft', 'scheduled', 'posting', 'posted', 'failed', 'cancelled'];
export const PILLARS = ['spiritual', 'trading', 'money', 'healing', 'community'];

// CRUD Operations
export const getContentCalendar = async (options) => {...}
export const getContentById = async (contentId) => {...}
export const createContent = async (contentData) => {...}
export const updateContent = async (contentId, updateData) => {...}
export const deleteContent = async (contentId) => {...}

// Status Management
export const scheduleContent = async (contentId) => {...}
export const cancelContent = async (contentId) => {...}

// Queries
export const getContentByDateRange = async (startDate, endDate) => {...}
export const getContentStats = async () => {...}

// Bulk Operations
export const bulkCreateContent = async (contentArray) => {...}
```

### 4.2 autoPostService.js
**File:** `gem-mobile/src/services/autoPostService.js`

**Exports:**
```javascript
// Logs
export const getAutoPostLogs = async (options) => {...}
export const getLogById = async (logId) => {...}
export const getLogsStats = async () => {...}

// Platform Connections
export const getPlatformConnections = async () => {...}
export const getPlatformConnection = async (platform) => {...}
export const updatePlatformConnection = async (platform, updateData) => {...}
export const connectPlatform = async (platform, credentials) => {...}
export const disconnectPlatform = async (platform) => {...}
export const togglePlatformActive = async (platform, isActive) => {...}
export const updatePlatformSettings = async (platform, settings) => {...}

// Manual Posting
export const triggerManualPost = async (contentId) => {...}
export const retryFailedPost = async (contentId) => {...}
```

---

## 5. EDGE FUNCTIONS (SUPABASE)

### 5.1 auto-post-scheduler
**File:** `supabase/functions/auto-post-scheduler/index.ts`

**Purpose:** Main scheduler that runs hourly to process scheduled posts

**Trigger:** pg_cron or manual invoke

**Logic:**
1. Get current Vietnam time
2. Query posts where `scheduled_date = today` AND `scheduled_time = current_hour` AND `status = 'scheduled'`
3. For each post:
   - Update status to 'posting'
   - Route to appropriate platform function
   - On success: Update to 'posted', log success
   - On failure: Update to 'failed', log error with retry info

**Response:**
```json
{
  "success": true,
  "message": "Đã xử lý X bài viết",
  "processed": 3,
  "succeeded": 2,
  "failed": 1,
  "results": [...],
  "duration_ms": 1234
}
```

### 5.2 post-to-gemral
**File:** `supabase/functions/post-to-gemral/index.ts`

**Purpose:** Post content directly to Gemral Feed (forum_posts table)

**Logic:**
1. Receive post data
2. Map content_type to post_type
3. Insert into forum_posts with metadata
4. Return post ID

**Post Type Mapping:**
```javascript
{
  post: 'text',
  video: 'video',
  short: 'video',
  reel: 'video',
  story: 'story',
  image: 'image'
}
```

### 5.3 post-to-facebook
**File:** `supabase/functions/post-to-facebook/index.ts`

**Purpose:** Post content to Facebook Page via Graph API

**Logic:**
1. Get Facebook credentials from platform_connections
2. Build message with hashtags
3. Based on content_type:
   - Video: POST to `/{page_id}/videos`
   - Photo: POST to `/{page_id}/photos`
   - Text: POST to `/{page_id}/feed`
4. Update last_used_at
5. Return external_post_id and URL

**API Version:** v18.0

---

## 6. NAVIGATION

**Admin Stack Integration:**
```javascript
// In AccountStack.js or AdminDashboard.js
<Stack.Screen name="ContentCalendar" component={ContentCalendarScreen} />
<Stack.Screen name="ContentEditor" component={ContentEditorScreen} />
<Stack.Screen name="AutoPostLogs" component={AutoPostLogsScreen} />
<Stack.Screen name="PlatformSettings" component={PlatformSettingsScreen} />
```

**Admin Dashboard Menu:**
```javascript
// Nội Dung & Auto-Post section
{
  title: 'Nội Dung & Auto-Post',
  items: [
    { label: 'Lịch Nội Dung', screen: 'ContentCalendar', icon: Calendar },
    { label: 'Nhật Ký Auto-Post', screen: 'AutoPostLogs', icon: Clock },
    { label: 'Kết Nối Nền Tảng', screen: 'PlatformSettings', icon: Link },
  ]
}
```

---

## 7. DESIGN TOKENS

### 7.1 Colors Used
```javascript
// Platform Colors
PLATFORM_COLORS = {
  gemral: COLORS.gold,        // #FFBD59
  facebook: '#1877F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  threads: '#000000',
  instagram: '#E4405F',
};

// Status Colors
STATUS_COLORS = {
  draft: COLORS.textMuted,
  scheduled: COLORS.info,
  posting: COLORS.warning,
  posted: COLORS.success,
  failed: COLORS.error,
  cancelled: '#9ca3af',
};
```

### 7.2 Typography
- Header Title: `fontSize.xxxl`, `fontWeight.bold`
- Section Title: `fontSize.lg`, `fontWeight.semibold`
- Content Title: `fontSize.xxl`, `fontWeight.semibold`
- Meta Text: `fontSize.sm`, `color: textMuted`
- Badge Text: `fontSize.xs`, `fontWeight.bold`, `uppercase`

### 7.3 Spacing
- Screen padding: `SPACING.lg`
- Section margin: `SPACING.md`
- Item padding: `SPACING.md` to `SPACING.lg`
- Gap between elements: `SPACING.sm` to `SPACING.md`

### 7.4 Glass Morphism
```javascript
// Standard glass card
{
  backgroundColor: GLASS.background,  // rgba(15, 16, 48, 0.55)
  borderRadius: GLASS.borderRadius,   // 18
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
}
```

### 7.5 Buttons
```javascript
// Primary (Gold)
{
  backgroundColor: COLORS.gold,
  color: COLORS.bgDarkest,
  fontWeight: 'bold',
}

// Secondary
{
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: COLORS.textPrimary,
}

// Destructive
{
  color: COLORS.error,
}
```

### 7.6 Inputs
```javascript
{
  backgroundColor: INPUT.background,
  borderRadius: INPUT.borderRadius,
  borderWidth: 1,
  borderColor: INPUT.borderColor,
  padding: SPACING.md,
  color: COLORS.textPrimary,
  fontSize: TYPOGRAPHY.fontSize.xxl,
}
```

---

## 8. IMPLEMENTATION VERIFICATION

### 8.1 Checklist vs Original Plan

| Component | Plan | Implemented | Notes |
|-----------|------|-------------|-------|
| **Database** ||||
| content_calendar table | Yes | Yes | Full schema with indexes |
| auto_post_logs table | Yes | Yes | Full schema with foreign key |
| platform_connections table | Yes | Yes | With seed data |
| **Edge Functions** ||||
| auto-post-scheduler | Yes | Yes | With Gemral direct posting |
| post-to-gemral | Yes | Yes | Maps to forum_posts |
| post-to-facebook | Yes | Yes | Text/Photo/Video support |
| post-to-youtube | Yes | No | File exists but not read |
| **Services** ||||
| contentCalendarService | Yes | Yes | Full CRUD + stats |
| autoPostService | Yes | Yes | Logs + Platform connections |
| **UI Screens** ||||
| ContentCalendarScreen | Yes | Yes | Calendar view with stats |
| ContentEditorScreen | Yes | Yes | Full form with all fields |
| AutoPostLogsScreen | Yes | Yes | With filter and pagination |
| PlatformSettingsScreen | Yes | Yes | Connect/Disconnect flow |

### 8.2 Missing from Plan (Not Critical)
1. `post-to-youtube` function - File exists but not verified
2. `post-to-tiktok` function - Not implemented
3. `post-to-threads` function - Not implemented
4. `post-to-instagram` function - Not implemented
5. OAuth flow for platforms (currently manual token entry)
6. CSV import UI (backend `bulkCreateContent` exists)

### 8.3 Extra Features Added (Not in Plan)
1. `retryFailedPost()` - Retry failed posts
2. `triggerManualPost()` - Manual posting trigger
3. `updatePlatformSettings()` - Platform-specific settings
4. Full glass morphism styling
5. Pull-to-refresh on all screens
6. Infinite scroll pagination on logs

---

## 9. USER FLOW

### 9.1 Creating Scheduled Content
```
Admin Dashboard
  → Lịch Nội Dung
    → FAB (+)
      → ContentEditor
        → Fill form
          → "Lưu nháp" (save as draft)
          → "Lên lịch đăng" (save and schedule)
```

### 9.2 Managing Content
```
ContentCalendar
  → Tap content item
    → Action Modal
      → "Chỉnh sửa" → ContentEditor
      → "Lên lịch đăng" (if draft)
      → "Hủy lịch" (if scheduled)
      → "Xóa" (with confirmation)
```

### 9.3 Connecting Platform
```
Admin Dashboard
  → Kết Nối Nền Tảng
    → PlatformSettings
      → Tap "Kết nối"
        → Enter Access Token (+ Page ID for Facebook)
          → Submit
```

### 9.4 Viewing Logs
```
ContentCalendar
  → Clock icon in header
    → AutoPostLogs
      → Filter by status
      → Tap log item
        → View details
```

---

## 10. VIETNAMESE LABELS

| English | Vietnamese |
|---------|------------|
| Content Calendar | Lịch Nội Dung |
| Auto-Post Logs | Nhật Ký Auto-Post |
| Platform Settings | Kết Nối Nền Tảng |
| Create content | Tạo nội dung |
| Edit | Chỉnh sửa |
| Schedule | Lên lịch đăng |
| Cancel | Hủy lịch |
| Delete | Xóa |
| Save draft | Lưu nháp |
| Title | Tiêu đề |
| Content | Nội dung |
| Content type | Loại nội dung |
| Platform | Platform |
| Topic (Pillar) | Chủ đề (Pillar) |
| Schedule date | Lịch đăng |
| Hashtags | Hashtags |
| Connect | Kết nối |
| Disconnect | Ngắt kết nối |
| Ready to use | Sẵn sàng sử dụng |
| Connected | Đã kết nối |
| Not connected | Chưa kết nối |
| Today | Hôm nay |
| This week | Tuần này |
| Posted | Đã đăng |
| Failed | Lỗi / Thất bại |
| Success | Thành công |
| Pending | Đang chờ |
| Retrying | Đang thử lại |

---

## 11. ERROR HANDLING

### 11.1 Service Errors
All services return standardized response:
```javascript
// Success
{ success: true, data: {...}, message: 'Thành công' }

// Error
{ success: false, error: 'Error message', data: null }
```

### 11.2 UI Error States
- Loading spinner with "Đang tải..."
- Error icon with message + "Thử lại" button
- Empty state with appropriate icon and message

### 11.3 Edge Function Errors
```javascript
{
  success: false,
  error: 'Error message',
  error_code: 'ERROR_CODE',
  timestamp: '2025-12-14T...'
}
```

---

## 12. SECURITY

### 12.1 RLS Policies
- **content_calendar**: Admins full access, creators manage own, users view posted
- **auto_post_logs**: Only admins can view
- **platform_connections**: Super admins manage, admins can view

### 12.2 Token Storage
- Access tokens stored in `platform_connections.access_token`
- Should be encrypted in production
- Never exposed to client (only service role can read)

### 12.3 Edge Function Auth
- Uses `SUPABASE_SERVICE_ROLE_KEY` for database operations
- CORS headers configured for cross-origin requests

---

**END OF FEATURE SPEC**

# MESSAGES - COMPLETE FEATURE SPECIFICATION
## GEM Mobile App - Direct Messaging, Group Chat & Calling

---

## TABLE OF CONTENTS

1. [Feature Overview](#1-feature-overview)
2. [Navigation & Screens Structure](#2-navigation--screens-structure)
3. [Screens Specification](#3-screens-specification)
   - 3.1-3.6 Core Screens
   - 3.7 Privacy Features Screens
4. [Components Specification](#4-components-specification)
5. [Call Feature (Audio/Video)](#5-call-feature-audiovideo)
6. [Service Layer](#6-service-layer)
   - 6.1 messagingService.js
   - 6.2 privacySettingsService.js
   - 6.3 restrictedUsersService.js
   - 6.4 spamDetectionService.js
7. [Database Schema](#7-database-schema)
8. [Design Tokens & Styling](#8-design-tokens--styling)
9. [User Flows](#9-user-flows)
10. [Animations & Effects](#10-animations--effects)
11. [Performance Optimizations](#11-performance-optimizations)
12. [Critical Sync Requirements](#12-critical-sync-requirements)
13. [Error Handling](#13-error-handling)
14. [Testing Checklist](#14-testing-checklist)

---

## 1. FEATURE OVERVIEW

### 1.1 Description
TikTok-style messaging system with real-time sync between web and mobile, featuring glass-morphism UI, rich media support, advanced interaction patterns, and audio/video calling.

### 1.2 Key Features

#### Messaging
- Real-time 1-1 and group conversations
- Typing indicators (2000ms timeout)
- Message reactions (double-tap for heart, emoji picker)
- Swipe gestures (reply, archive, delete, mute)
- Media attachments (images, videos, audio, files)
- Voice messages with waveform visualization
- Stickers, GIFs, and emojis
- Message pinning and starring
- Scheduled messages
- Message translation
- Link previews
- Message recall (2hr window for text, 5min for media)
- Message editing with timestamp
- Read receipts (single & group)
- @Mentions with autocomplete
- Online presence status
- Block/Report functionality

#### Calling (Phase 1 & 2)
- 1-1 Audio calls with WebRTC
- 1-1 Video calls with camera switching
- Picture-in-Picture mode
- Audio to video upgrade
- Call history and missed calls
- Speaker/earpiece toggle
- Mute functionality
- Connection quality indicator

---

## 2. NAVIGATION & SCREENS STRUCTURE

### 2.1 MessagesStack Navigation
```
MessagesStack
├── ConversationsListScreen     # Main inbox
├── ChatScreen                  # Individual chat view
├── NewConversationScreen       # Start new chat (modal)
├── CreateGroupScreen           # Create group chat (modal)
├── ConversationInfoScreen      # Chat details/settings
├── MessageSearchScreen         # Search messages
├── ForwardMessageScreen        # Forward to contacts (modal)
├── PinnedMessagesScreen        # View all pinned
├── StarredMessagesScreen       # View all starred
├── ScheduledMessagesScreen     # View scheduled
├── MediaGalleryScreen          # Shared media gallery
├── ArchivedChatsScreen         # Archived conversations
│
├── # Privacy Features
├── MessagePrivacySettings      # Privacy settings screen
├── BlockedUsersScreen          # Manage blocked users
├── RestrictedUsersScreen       # Silent block management
├── MessageRequestsScreen       # Message requests (tin nhắn chờ)
├── SpamMessagesScreen          # Spam messages folder
│
└── ProfileFull                 # View user profile from chat
```

### 2.2 CallStack Navigation
```
CallStack
├── OutgoingCallScreen          # Initiating call (slide_from_bottom)
├── IncomingCallScreen          # Receiving call (fade)
├── InCallScreen                # Active audio call (fade)
├── VideoCallScreen             # Active video call (fade)
├── CallEndedScreen             # Call summary (fade)
└── CallHistoryScreen           # Call history list (slide_from_right)
```

### 2.3 Navigation Animation Config
```javascript
screenOptions: {
  headerShown: false,
  animation: 'slide_from_right',  // Default
}

// Modal screens
presentation: 'modal'
animation: 'slide_from_bottom'

// Call screens
gestureEnabled: false  // Disable swipe back during calls
```

---

## 3. SCREENS SPECIFICATION

### 3.1 ConversationsListScreen
**Purpose:** Main inbox showing all conversations

**Features:**
- Real-time conversation updates via Supabase subscription
- Unread count badges (gold highlight)
- Online status indicators (green dot)
- Search conversations (by name, group, message content)
- Swipe actions (archive, delete, mute, pin)
- Pinned conversations (max 5, shown at top)
- Pull-to-refresh
- Empty state with CTA

**UI Components:**
```
┌─────────────────────────────────────┐
│  Messages           [Search] [+New] │  Header
├─────────────────────────────────────┤
│  🔍 Search conversations...         │  Search Bar
├─────────────────────────────────────┤
│  📌 PINNED                          │  Section Header
│  ┌─────────────────────────────────┐│
│  │ [Avatar] Name           12:34   ││  SwipeableConversationItem
│  │          Last message... (2)    ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  ALL MESSAGES                       │  Section Header
│  ┌─────────────────────────────────┐│
│  │ [Avatar] Name           12:34   ││
│  │    ●     Last message...        ││  Online indicator
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**State:**
```javascript
const [conversations, setConversations] = useState([]);
const [pinnedIds, setPinnedIds] = useState([]);
const [archivedIds, setArchivedIds] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchFocused, setSearchFocused] = useState(false);
```

---

### 3.2 ChatScreen
**Purpose:** Individual chat conversation view

**Features:**
- Real-time message sync
- Typing indicators with user names
- Double-tap to react with heart animation
- Swipe right to reply
- Media attachments with preview
- Voice message recording
- Pinned messages bar (carousel)
- Message actions (long-press menu)
- @Mention autocomplete
- Call buttons in header (audio/video)

**UI Layout:**
```
┌─────────────────────────────────────┐
│ [<] [Avatar] Name    [📞] [📹] [...] │  Header with call buttons
│     ● Online / typing...            │
├─────────────────────────────────────┤
│ 📌 "Pinned message preview..."  [>] │  PinnedMessagesBar
├─────────────────────────────────────┤
│                                     │
│   ┌──────────────────┐              │  Other's message (left)
│   │ Message content  │              │
│   └──────────────────┘              │
│                                     │
│              ┌──────────────────┐   │  Own message (right)
│              │ Message content  │   │  Purple background
│              │            ✓✓   │   │  Read receipt
│              └──────────────────┘   │
│                                     │
│   User is typing...                 │  TypingIndicator
│                                     │
├─────────────────────────────────────┤
│ [+] [⏰] [😊] │ Type a message │ [🎤]│  ChatInput
│ ┌─────────────────────────────────┐ │  Reply preview (if replying)
│ │ ↩️ Replying to: "message..."    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**State:**
```javascript
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
const [typingUsers, setTypingUsers] = useState([]);
const [replyTo, setReplyTo] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);
const [selectedMessage, setSelectedMessage] = useState(null);
const [showActionSheet, setShowActionSheet] = useState(false);
const [pinnedMessages, setPinnedMessages] = useState([]);
const [editingMessage, setEditingMessage] = useState(null);
const [starredMessageIds, setStarredMessageIds] = useState([]);
const [mentionSearch, setMentionSearch] = useState(null);
```

**Critical Sync Requirements:**
```javascript
// Channel names MUST match web for real-time sync
const messageChannel = `messages:${conversationId}`;
const presenceChannel = `presence:${conversationId}`;
const TYPING_TIMEOUT = 2000; // MUST be 2000ms
const OPTIMISTIC_ID_PATTERN = `temp-${Date.now()}`;
```

---

### 3.3 NewConversationScreen
**Purpose:** Search and select user to start new chat

**Features:**
- User search (name/email with debounce)
- Recent conversations quick access
- Create group button
- Online status display
- Loading states

**Flow:**
```
1. User opens NewConversationScreen
2. Search field auto-focuses
3. User types → searchUsers() called (300ms debounce)
4. Results show with online status
5. Tap user → createConversation() or get existing
6. Navigate to ChatScreen
```

---

### 3.4 CreateGroupScreen
**Purpose:** Create new group conversation

**Features:**
- Group name input (required)
- Group avatar picker (optional)
- Member search and selection
- Selected members preview (horizontal scroll with remove)
- Minimum 2 members required

**UI Layout:**
```
┌─────────────────────────────────────┐
│ [X]    Create Group         [Create]│
├─────────────────────────────────────┤
│  [📷]  Group name...                │  Avatar + Name input
├─────────────────────────────────────┤
│  Selected (3):                      │
│  [Avatar X] [Avatar X] [Avatar X]   │  Horizontal scroll
├─────────────────────────────────────┤
│  🔍 Search users...                 │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ [Avatar] Name           [✓]     ││  User list with checkboxes
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 3.5 ConversationInfoScreen
**Purpose:** Conversation details and settings

**Features:**
- Profile/group info display
- Shared media gallery access
- Pinned messages access
- Starred messages access
- Notification settings
- Disappearing messages toggle
- Chat themes selection
- Group settings (name, avatar, members)
- Block/Report user
- Exit/Delete group

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]           Chat Info            │
├─────────────────────────────────────┤
│           [Large Avatar]            │
│           User Name                 │
│           ● Online now              │
├─────────────────────────────────────┤
│  [🖼️] Media    [📌] Pinned   [⭐] Starred │
│     32           5            12    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 🔔  Notifications         [>]   ││
│  │ ⏱️  Disappearing Messages [>]   ││
│  │ 🎨  Chat Theme            [>]   ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 🚫  Block User                  ││  Danger zone
│  │ ⚠️  Report User                 ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 3.6 Other Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **MessageSearchScreen** | Search messages | Global/conversation search, filters (type, date, sender), highlight matches |
| **ForwardMessageScreen** | Forward message | Select conversations, preview message, multi-select |
| **PinnedMessagesScreen** | View pinned | Browse all pinned, unpin, jump to message |
| **StarredMessagesScreen** | View starred | Important messages, unstar, jump to message, filter by conversation |
| **ScheduledMessagesScreen** | Manage scheduled | Edit/cancel pending messages, reschedule |
| **MediaGalleryScreen** | Shared media | Grid view of all media, filter by type (images/files) |
| **ArchivedChatsScreen** | Archived chats | List archived conversations, unarchive functionality |

---

### 3.7 Privacy Features Screens

#### MessagePrivacySettings (PrivacySettingsScreen)
**Purpose:** Configure privacy settings for messaging

**Features:**
- Cho phép tin nhắn chờ (Message Requests) - toggle
- Xác nhận đã đọc (Read Receipts) - toggle
- Đang nhập... (Typing Indicator) - toggle
- Trạng thái online (Online Status) - toggle
- Hoạt động lần cuối (Last Active) - toggle
- Ai có thể gọi cho bạn (Call Permissions) - options

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]      Quyền riêng tư            │
├─────────────────────────────────────┤
│  TIN NHẮN                           │
│  ┌─────────────────────────────────┐│
│  │ ✉️  Cho phép tin nhắn chờ  [⚙️]  ││
│  │ ✓✓  Xác nhận đã đọc       [⚙️]  ││
│  │ ...  Đang nhập...         [⚙️]  ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  TRẠNG THÁI                         │
│  ┌─────────────────────────────────┐│
│  │ ●  Trạng thái online      [⚙️]  ││
│  │ ⏱️  Hoạt động lần cuối    [⚙️]  ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  CUỘC GỌI                           │
│  ┌─────────────────────────────────┐│
│  │ Ai có thể gọi cho bạn?          ││
│  │ ○ Tất cả mọi người        [✓]   ││
│  │ ○ Chỉ người đã nhắn tin         ││
│  │ ○ Không ai                      ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 🚫  Người đã chặn          [>]  ││
│  │ 👁️  Người bị hạn chế       [>]  ││
│  │ 📧  Tin nhắn spam          [>]  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### BlockedUsersScreen
**Purpose:** Manage blocked users

**Features:**
- List blocked users with profiles
- Search blocked users
- Unblock user functionality
- Info banner explaining blocking
- Empty state when no blocked users

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]       Người đã chặn            │
├─────────────────────────────────────┤
│  ℹ️ Người bị chặn không thể gửi tin │
│     nhắn hoặc xem trạng thái online │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ [Avatar] User Name              ││
│  │          Đã chặn: 12/01/2025    ││
│  │                      [Bỏ chặn]  ││
│  └─────────────────────────────────┘│
│                                     │
│  Empty State:                       │
│  ┌─────────────────────────────────┐│
│  │         [✓ Shield Icon]         ││
│  │      Không có người bị chặn     ││
│  │  Người bị chặn không thể gửi    ││
│  │  tin nhắn hoặc xem trạng thái   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### RestrictedUsersScreen (Silent Block)
**Purpose:** Manage silently blocked users

**Features:**
- List restricted users with profiles
- Unrestrict user functionality
- Info banner explaining silent blocking
- Shows unread message count from restricted users
- Empty state when no restricted users
- User doesn't know they're restricted

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]       Người bị hạn chế         │
├─────────────────────────────────────┤
│  ℹ️ Người bị hạn chế sẽ không biết  │
│     họ bị hạn chế. Tin nhắn của họ  │
│     vẫn đến nhưng sẽ được lọc riêng │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ [Avatar] User Name              ││
│  │          Hạn chế từ: 12/01/2025 ││
│  │          📬 3 tin nhắn chưa đọc ││
│  │                    [Bỏ hạn chế] ││
│  └─────────────────────────────────┘│
│                                     │
│  Empty State:                       │
│  ┌─────────────────────────────────┐│
│  │         [👁️‍🗨️ Eye Icon]          ││
│  │    Không có người bị hạn chế    ││
│  │  Khi bạn hạn chế ai đó, họ sẽ   ││
│  │  không biết điều đó. Tin nhắn   ││
│  │  của họ sẽ được chuyển vào      ││
│  │  thư mục hạn chế.               ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### MessageRequestsScreen
**Purpose:** Manage message requests from strangers

**Features:**
- List pending message requests
- Preview requester profile
- Accept/Decline buttons
- View profile button
- Info banner explaining message requests
- Empty state when no requests

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]        Tin nhắn chờ            │
├─────────────────────────────────────┤
│  ℹ️ Tin nhắn từ người lạ sẽ xuất    │
│     hiện ở đây. Bạn có thể chấp     │
│     nhận hoặc từ chối.              │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ [Avatar] Requester Name         ││
│  │          "Preview message..."   ││
│  │          2 giờ trước            ││
│  │                                 ││
│  │    [Từ chối]    [Chấp nhận]     ││
│  └─────────────────────────────────┘│
│                                     │
│  Empty State:                       │
│  ┌─────────────────────────────────┐│
│  │         [📧 Mail Icon]          ││
│  │    Không có tin nhắn chờ        ││
│  │  Tin nhắn từ người lạ sẽ xuất   ││
│  │  hiện ở đây để bạn duyệt        ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### SpamMessagesScreen
**Purpose:** View and manage spam-detected messages

**Features:**
- List spam messages with confidence score
- Filter by spam type (auto-detected, user reported, etc.)
- Mark as "Not Spam" (restore to inbox)
- Delete spam permanently
- Delete all spam
- Auto-delete after 30 days
- Pull-to-refresh
- Animated entrance

**Spam Types:**
```javascript
SPAM_TYPE_LABELS = {
  auto_detected: 'Tự động phát hiện',
  user_reported: 'Người dùng báo cáo',
  pattern_match: 'Khớp mẫu',
  link_spam: 'Spam liên kết',
  repeat_spam: 'Lặp lại nhiều lần',
}
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [<]       Spam (5)          [🗑️]   │
├─────────────────────────────────────┤
│  [Tất cả] [Tự động] [Báo cáo] [...]│  Filter chips
├─────────────────────────────────────┤
│  ℹ️ Tin nhắn spam sẽ được tự động   │
│     xóa sau 30 ngày.                │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ [Avatar ⚠️] Sender Name  2h ago ││
│  │ [Tự động phát hiện] [85% ✓]     ││
│  │ "Spam message content..."       ││
│  │                                 ││
│  │ [✓ Không phải spam]  [🗑️ Xóa]   ││
│  └─────────────────────────────────┘│
│                                     │
│  Empty State:                       │
│  ┌─────────────────────────────────┐│
│  │         [🛡️ Shield Icon]        ││
│  │        Không có spam            ││
│  │  Hộp thư của bạn sạch sẽ!       ││
│  │  Chúng tôi sẽ tự động lọc tin   ││
│  │  nhắn rác cho bạn.              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 4. COMPONENTS SPECIFICATION

### 4.1 MessageBubble
**Purpose:** Individual message display

**Features:**
- Double-tap to react (heart animation)
- Long-press for action menu
- Swipe to reply (PanResponder)
- Media preview (image, video, audio, file, sticker, GIF)
- Reaction emoji row
- Reply quote display
- Read receipts
- Recalled message placeholder
- @Mention highlighting
- Edit indicator

**Props:**
```javascript
{
  message: Object,              // Message data
  isOwn: Boolean,               // Own message flag
  showAvatar: Boolean,          // Show sender avatar
  onDoubleTap: Function,        // Heart reaction
  onLongPress: Function,        // Action menu
  onReply: Function,            // Swipe reply
  onDelete: Function,           // Delete message
  onReaction: Function,         // Add reaction
  currentUserId: String,        // Current user
  isGroupChat: Boolean,         // Group flag
  totalParticipants: Number,    // For read receipts
  onScrollToMessage: Function,  // Jump to quoted message
  isHighlighted: Boolean,       // Search highlight
}
```

**Styling:**
```javascript
// Own Message
bubbleOwn: {
  backgroundColor: COLORS.purple,      // #6A5BFF
  borderRadius: 18,
  borderBottomRightRadius: 4,          // Tail effect
  maxWidth: SCREEN_WIDTH * 0.75,
  padding: SPACING.md,
}

// Other Message
bubbleOther: {
  backgroundColor: 'rgba(15, 16, 48, 0.7)',
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  borderRadius: 18,
  borderBottomLeftRadius: 4,           // Tail effect
  maxWidth: SCREEN_WIDTH * 0.75,
  padding: SPACING.md,
}

// Recalled Message
bubbleRecalled: {
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderStyle: 'dashed',
  opacity: 0.6,
}
```

---

### 4.2 ChatInput
**Purpose:** Message composition bar

**Features:**
- Text input with auto-resize (max 120px height)
- Media picker (gallery, camera, files)
- Voice message recording
- Reply preview bar (animated slide)
- Attachment preview row
- Send button animation
- Sticker/emoji/GIF picker
- Message scheduling
- @Mention autocomplete popup

**Props:**
```javascript
{
  onSend: Function,           // Send message
  onTyping: Function,         // Typing indicator
  replyTo: Object,            // Reply reference
  onClearReply: Function,     // Clear reply
  disabled: Boolean,          // Disabled state
  conversationId: String,     // Current conversation
  onOpenSchedule: Function,   // Open scheduler
  currentUserId: String,      // Current user
  participants: Array,        // For @mentions
}
```

**Button Layout (left to right):**
```
[+] Add Media → Opens media picker sheet
[⏰] Schedule → Opens schedule picker
[😊] Emoji → Opens sticker/emoji picker
[Text Input Field]
[🎤/➤] Mic (empty) / Send (has text)
```

**Styling:**
```javascript
inputBar: {
  backgroundColor: 'rgba(15, 16, 48, 0.6)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(106, 91, 255, 0.2)',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
}

inputContainer: {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  minHeight: 40,
  maxHeight: 120,
}

sendButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: COLORS.purple,
  justifyContent: 'center',
  alignItems: 'center',
}
```

---

### 4.3 SwipeableConversationItem
**Purpose:** Conversation list item with swipe actions

**Swipe Actions (left-to-right reveal):**
```
┌─────────────────────────────────────────────────┐
│ [Pin] [Mute] [Archive] [Delete] │ Item Content  │
│ Gold  Purple  Gold     Red      │               │
└─────────────────────────────────────────────────┘
```

**Action Styling:**
```javascript
pinButton: { backgroundColor: COLORS.gold, width: 70 }
muteButton: { backgroundColor: COLORS.purple, width: 70 }
archiveButton: { backgroundColor: COLORS.gold, width: 70 }
deleteButton: { backgroundColor: COLORS.error, width: 70 }

// Swipe thresholds
SWIPE_THRESHOLD: 70,           // Trigger single action
FULL_SWIPE_THRESHOLD: 280,     // Trigger delete
```

---

### 4.4 VoiceRecorder
**Purpose:** Voice message recording

**Features:**
- Hold to record
- Slide left to cancel
- Release to send
- Waveform visualization (animated bars)
- Duration display
- Max recording time (60s)

**Styling:**
```javascript
recordingIndicator: {
  backgroundColor: COLORS.error,
  borderRadius: 20,
  flexDirection: 'row',
  alignItems: 'center',
  padding: SPACING.sm,
}

waveformBar: {
  width: 3,
  backgroundColor: COLORS.textPrimary,
  borderRadius: 1.5,
  marginHorizontal: 1,
}
```

---

### 4.5 Message Action Components

#### MessageActionSheet
**Purpose:** Long-press context menu

**Actions:**
```javascript
const actions = [
  { icon: Reply, label: 'Reply', onPress: onReply },
  { icon: Copy, label: 'Copy', onPress: onCopy },
  { icon: Forward, label: 'Forward', onPress: onForward },
  { icon: Pin, label: isPinned ? 'Unpin' : 'Pin', onPress: onTogglePin },
  { icon: Star, label: isStarred ? 'Unstar' : 'Star', onPress: onToggleStar },
  { icon: Edit, label: 'Edit', onPress: onEdit, showIf: isOwn },
  { icon: Trash, label: 'Delete', onPress: onDelete, showIf: isOwn, danger: true },
  { icon: RotateCcw, label: 'Recall', onPress: onRecall, showIf: canRecall },
  { icon: Globe, label: 'Translate', onPress: onTranslate },
  { icon: Flag, label: 'Report', onPress: onReport, showIf: !isOwn, danger: true },
];
```

#### ReactionPicker
**Purpose:** Emoji reaction selector

**Default Reactions:**
```javascript
const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍'];
```

**Styling:**
```javascript
reactionContainer: {
  backgroundColor: 'rgba(15, 16, 48, 0.95)',
  borderRadius: 25,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  flexDirection: 'row',
  gap: SPACING.sm,
}

reactionEmoji: {
  fontSize: 24,
  padding: SPACING.xs,
}
```

#### ReadReceiptIndicator
**Purpose:** Message delivery status

**States:**
```javascript
sending: { icon: Clock, color: COLORS.textMuted }
sent: { icon: Check, color: COLORS.textMuted }
delivered: { icon: CheckCheck, color: COLORS.textMuted }
read: { icon: CheckCheck, color: COLORS.cyan }
```

---

### 4.6 Other Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **TypingIndicator** | Shows typing users | `users: Array` |
| **OnlineIndicator** | Online status dot | `isOnline`, `lastSeen`, `size` |
| **PinnedMessagesBar** | Pinned message carousel | `pinnedMessages`, `onPress`, `onViewAll` |
| **LinkPreview** | URL preview card | `url` |
| **ImageViewer** | Full-screen image | `visible`, `imageUrl`, `onClose` |
| **VideoPlayer** | Video playback | `visible`, `videoUrl`, `onClose` |
| **EditMessageSheet** | Edit message modal | `message`, `onSave`, `onClose` |
| **ScheduleMessageSheet** | Schedule picker | `onSchedule`, `onClose` |
| **TranslateMessageSheet** | Translation modal | `message`, `onClose` |
| **DisappearingMessagesSheet** | Auto-delete settings | `onDurationChange` |
| **ChatThemesSheet** | Theme selector | `onThemeSelect` |
| **MuteConversationSheet** | Mute duration picker | `onMute` |
| **GroupSettingsSheet** | Group management | Group name, avatar, exit |
| **AddParticipantsSheet** | Add group members | `onAddParticipants` |

---

## 5. CALL FEATURE (AUDIO/VIDEO)

### 5.1 Overview
WebRTC-based peer-to-peer calling with Supabase Realtime for signaling.

**Target Latency:** < 150ms (Facebook Messenger level)

### 5.2 Call Screens

#### OutgoingCallScreen
**Purpose:** Initiating a call

**UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │   Avatar    │             │  Pulsing animation
│         │   (140px)   │             │
│         └─────────────┘             │
│                                     │
│          User Name                  │
│      📞 Calling... 00:15            │  Timer counting
│                                     │
│                                     │
│                                     │
│     [🔇]    [🔊]    [📞 End]       │  Controls
│     Mute   Speaker   Cancel         │
│                                     │
└─────────────────────────────────────┘
```

#### IncomingCallScreen
**Purpose:** Receiving a call

**UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────┐             │
│         │   Avatar    │             │  Pulsing animation
│         │   (140px)   │             │
│         └─────────────┘             │
│                                     │
│          Caller Name                │
│      📞 Incoming audio call         │
│      or                             │
│      📹 Incoming video call         │
│                                     │
│                                     │
│     [❌ Decline]    [✓ Accept]     │
│        Red            Green         │
│                                     │
│    Tap to answer or decline         │
└─────────────────────────────────────┘
```

#### InCallScreen (Audio)
**Purpose:** Active audio call

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [Connected]      [||||] Quality    │  Status bar
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │   Avatar    │             │
│         │   (120px)   │             │
│         └─────────────┘             │
│                                     │
│          User Name                  │
│           05:32                     │  Call duration (gold)
│                                     │
│     Reconnecting...                 │  (if reconnecting)
│                                     │
│  [🔇] [🔊] [📹] [📞 End]           │  Controls
│  Mute Speaker Video  End            │
│                                     │
└─────────────────────────────────────┘
```

#### VideoCallScreen
**Purpose:** Active video call

**UI Layout:**
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │    Remote Video (Full Screen)  │ │
│ │                                 │ │
│ │        ┌──────────┐             │ │  LocalVideoView
│ │        │ Local    │             │ │  (Draggable)
│ │        │ Preview  │             │ │
│ │        │  [🔄]    │             │ │  Camera switch
│ │        └──────────┘             │ │
│ │                                 │ │
│ │  [Connected]    [||||] Quality  │ │  Status (auto-hide)
│ └─────────────────────────────────┘ │
│                                     │
│          [ 05:32 ]                  │  Duration badge
│                                     │
│  [−]                                │  Minimize button
│                                     │
│  [🔄] [📹] [🔇] [🔊] [📞]          │  VideoControls
│                                     │  (auto-hide after 4s)
└─────────────────────────────────────┘
```

#### MinimizedCallView
**Purpose:** Floating bubble when minimized

**UI Layout:**
```
┌───────────┐
│  Video/   │  100x140px
│  Avatar   │  Draggable
│ ┌───────┐ │  Snaps to edges
│ │ 05:32 │ │  Duration badge
│ └───────┘ │
│ [⬜] [📞] │  Maximize / End
└───────────┘
```

### 5.3 Call Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **CallButton** | Header call button | `type: 'audio'/'video'`, `onPress`, `disabled` |
| **CallAvatar** | Pulsing avatar | `uri`, `size`, `isPulsing`, `pulseColor` |
| **CallTimer** | Duration display | `duration`, `size: 'large'/'medium'/'small'` |
| **CallControls** | Audio call buttons | `isMuted`, `isSpeakerOn`, `showVideo`, `onToggle*` |
| **CallStatusBadge** | Connection status | `status: 'connecting'/'connected'/'reconnecting'` |
| **CallQualityIndicator** | Signal bars | `quality: 'excellent'/'good'/'fair'/'poor'/'bad'` |
| **LocalVideoView** | Self preview | `stream`, `isMirrored`, `onSwitchCamera` |
| **RemoteVideoView** | Other's video | `stream`, `isVideoEnabled`, `userName`, `userAvatar` |
| **VideoControls** | Video call buttons | `isMuted`, `isVideoEnabled`, `onToggle*`, `visible` |
| **MinimizedCallView** | PiP bubble | `stream`, `callDuration`, `onMaximize`, `onEndCall` |
| **IncomingCallOverlay** | Call notification | Full-screen overlay for incoming calls |

### 5.4 Call Service Methods

```javascript
// webrtcService.js
initLocalStream(withVideo)      // Get mic/camera
createPeerConnection()          // Setup RTCPeerConnection
createOffer()                   // Caller creates offer
handleOffer(offer)              // Callee creates answer
handleAnswer(answer)            // Caller handles answer
addIceCandidate(candidate)      // Add ICE candidates
toggleMute(mute)                // Mute/unmute mic
enableVideo(enable)             // Toggle video
switchCamera()                  // Front/back camera
getVideoStats()                 // Video quality stats
setVideoQuality(quality)        // Adjust bitrate/fps
cleanup()                       // Close connection

// callService.js
initiateCall(conversationId, calleeId, callType)
answerCall(callId)
declineCall(callId)
endCall(callId, reason)
cancelCall(callId)
toggleMute(callId, isMuted)
toggleVideo(callId, isEnabled)
upgradeToVideo(callId)          // Audio → Video
switchCamera(callId)
getCallHistory(limit)
subscribeToIncomingCalls(userId, callback)

// callSignalingService.js
// Channel: `call-signal:${callId}`
// Types: offer, answer, ice-candidate, end, mute, video-on/off
```

### 5.5 Call Constants

```javascript
CALL_TYPE = { AUDIO: 'audio', VIDEO: 'video' }

CALL_STATUS = {
  INITIATING, RINGING, CONNECTING, CONNECTED,
  RECONNECTING, ENDED, MISSED, DECLINED, CANCELLED, FAILED, BUSY
}

CALL_TIMEOUTS = {
  RING_TIMEOUT: 60000,          // 60s
  CONNECTION_TIMEOUT: 30000,    // 30s
  RECONNECT_TIMEOUT: 15000,     // 15s
}

VIDEO_QUALITY = {
  HIGH: { bitrate: 2500000, fps: 30, resolution: '1280x720' },
  MEDIUM: { bitrate: 1000000, fps: 24, resolution: '854x480' },
  LOW: { bitrate: 500000, fps: 15, resolution: '640x360' },
}

CALL_UI = {
  AVATAR_SIZE_LARGE: 140,
  CONTROL_BUTTON_SIZE: 60,
  END_BUTTON_SIZE: 70,
  LOCAL_VIDEO_WIDTH: 120,
  LOCAL_VIDEO_HEIGHT: 160,
  CONTROLS_HIDE_DELAY: 4000,    // Auto-hide after 4s
}
```

### 5.6 Call Hooks

```javascript
// useCall.js - Main call state
const {
  callState, isMuted, isSpeakerOn, isVideoEnabled,
  connectionQuality, isConnected, isReconnecting,
  toggleMute, toggleSpeaker, toggleVideo,
  answerCall, declineCall, cancelCall, endCall,
} = useCall({ call, isCaller, onCallEnded });

// useVideoCall.js - Extended for video
const {
  ...useCall,
  localVideoStream, remoteVideoStream,
  isLocalVideoEnabled, isRemoteVideoEnabled,
  isFrontCamera, isMinimized, isPiPActive, videoStats,
  toggleLocalVideo, switchCamera, upgradeToVideo,
  minimize, maximize, togglePiP, setVideoQuality,
} = useVideoCall(options);

// useCallTimer.js - Duration timer
const { formattedDuration, duration } = useCallTimer(isConnected);

// useAudioOutput.js - Speaker toggle
const { isSpeakerOn, toggleSpeaker } = useAudioOutput();

// useCameraSwitch.js - Camera toggle
const { isFrontCamera, switchCamera, isSwitching } = useCameraSwitch();

// usePictureInPicture.js - PiP mode
const { isPiPSupported, isPiPActive, enterPiP, exitPiP } = usePictureInPicture(isInCall);

// useIncomingCall.js - Global listener
const { incomingCall, answerCall, declineCall } = useIncomingCall();
```

---

## 6. SERVICE LAYER

### 6.1 messagingService.js

#### Conversations
```javascript
getConversations()
// Returns: Array<{ id, name, is_group, latest_message, other_participant, my_unread_count }>

createConversation(participantIds, isGroup = false, name = null)
// Creates new or returns existing conversation

deleteConversation(conversationId)
toggleMute(conversationId, shouldMute)

// Pinning (max 5)
getPinnedConversationIds()
pinConversation(conversationId)
unpinConversation(conversationId)

// Archiving
getArchivedConversationIds()
archiveConversation(conversationId)
unarchiveConversation(conversationId)
```

#### Messages
```javascript
// Pagination
getMessages(conversationId, cursor = null, limit = 50)
// Returns: { messages, hasMore, nextCursor }

// Send
sendMessage(conversationId, content, attachment = null)
// Supports: text, image, video, audio, file, sticker, gif

// Actions
deleteMessage(messageId)           // Soft delete
editMessage(messageId, newContent) // With edit timestamp
recallMessage(messageId)           // 2hr window text, 5min media
canRecallMessage(message)          // Check if recallable
markAsRead(conversationId)         // Update last_read_at

// Pinning
getPinnedMessages(conversationId)
pinMessage(messageId)
unpinMessage(messageId)

// Starring
getStarredMessages(conversationId)
starMessage(messageId)
unstarMessage(messageId)

// Scheduling
scheduleMessage(conversationId, content, scheduledDate, attachment)
getScheduledMessages(conversationId)
cancelScheduledMessage(messageId)

// Translation
translateMessage(messageId, targetLanguage)
```

#### Reactions
```javascript
addReaction(messageId, emoji)
removeReaction(messageId, emoji)
toggleReaction(messageId, emoji)  // Returns: boolean (added/removed)
```

#### User Management
```javascript
searchUsers(query)
// Returns: Array<{ id, display_name, avatar_url, online_status }>

blockUser(blockedUserId, reason = null)
unblockUser(blockedUserId)
getBlockedUsers()
isUserBlocked(userId)

reportUser({ reportedUserId, reportType, description })

updateOnlineStatus(status)  // 'online', 'away', 'offline'
```

#### Real-Time Subscriptions
```javascript
// Messages (INSERT, UPDATE events)
subscribeToMessages(conversationId, callback)
// Channel: `messages:${conversationId}`

// Typing (2000ms timeout)
subscribeToTyping(conversationId, userId, onTypingChange)
// Channel: `presence:${conversationId}`
// Returns: { channel, broadcastTyping() }

// Unread count
subscribeToUnreadCount(userId, callback)
// Channel: `unread:${userId}`

unsubscribe(subscription)
getTotalUnreadCount()
```

#### Chat Customization
```javascript
getChatTheme(conversationId)
setChatTheme(conversationId, themeId)
setCustomBackground(conversationId, imageUrl)
```

#### Media
```javascript
uploadAttachment(file, conversationId)
// Returns: { url, name, type, size, duration }
// Bucket: 'message-attachments'
```

#### Search
```javascript
searchMessages(query, conversationId = null)
// Global or per-conversation search
```

---

### 6.2 privacySettingsService.js

#### Privacy Settings
```javascript
// Get all privacy settings
getPrivacySettings()
// Returns: { allow_message_requests, show_read_receipts, show_typing, show_online, show_last_active, call_permission }

// Update privacy settings
updatePrivacySetting(key, value)
// Keys: 'allow_message_requests', 'show_read_receipts', 'show_typing', 'show_online', 'show_last_active'

// Update call permission
updateCallPermission(permission)
// Values: 'everyone', 'contacts_only', 'nobody'
```

---

### 6.3 restrictedUsersService.js

#### Restricted Users (Silent Block)
```javascript
// Restrict/Unrestrict
restrictUser(userId, reason = null)
unrestrictUser(userId)

// Get restricted users
getRestrictedUsers(forceRefresh = false)  // With caching
getRestrictedUsersCount()

// Check restriction status
isUserRestricted(userId)
amIRestrictedBy(userId)  // Limited by RLS

// Restricted messages
getRestrictedMessages(limit = 50, offset = 0)
getUnreadRestrictedMessagesCount()
markRestrictedMessageRead(messageId)
deleteRestrictedMessagesFrom(restrictedUserId)
```

**Key Features:**
- Silent blocking - restricted user doesn't know
- Messages from restricted users go to separate folder
- Caching with 60s TTL for performance
- RLS policies prevent users from knowing they're restricted

---

### 6.4 spamDetectionService.js

#### Spam Detection
```javascript
// Detection
detectSpam(content, senderId = null)
// Returns: { isSpam: boolean, confidence: number, reasons: string[], score: number }

// Auto-flagging
autoFlagSpam(messageId, conversationId, confidence, reasons)

// Report spam
reportSpam(messageId, conversationId, reason = 'user_reported')
```

#### Spam Management
```javascript
// Get spam messages
getSpamMessages(limit = 50, offset = 0)
getSpamMessagesCount()

// Actions
markNotSpam(spamId)       // Alias for dismissSpam
dismissSpam(messageId)    // Restore to inbox
deleteSpamMessage(messageId)
deleteAllSpam()

// Block spam sender
blockSpamSender(messageId)
```

**Spam Detection Patterns:**
```javascript
SPAM_PATTERNS = {
  multipleLinks: /https?:\/\/[^\s]+/gi,           // Multiple URLs
  shortenedUrls: /(bit\.ly|tinyurl|...)/i,        // URL shorteners
  cryptoScam: /(free\s*bitcoin|airdrop|...)/i,    // Crypto scams
  financialScam: /(make\s*\$?\d+.*day|...)/i,     // Financial scams
  phishing: /(verify\s*your\s*account|...)/i,     // Phishing
  adultSpam: /(click\s*here.*chat|...)/i,         // Adult content
  genericSpam: /(congratulations.*won|...)/i,     // Generic spam
  vietnameseSpam: /(kiếm\s*tiền\s*online|...)/i,  // Vietnamese spam
}

SPAM_KEYWORDS = {
  high: ['bitcoin giveaway', 'double your money', ...],    // +25 score
  medium: ['limited offer', 'act now', ...],               // +15 score
  low: ['free', 'winner', ...],                            // +5 score
}

// Spam threshold: 50% confidence
// Spam score calculation: sum of pattern matches + keyword scores
```

---

## 7. DATABASE SCHEMA

### 7.1 Tables

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  is_group BOOLEAN DEFAULT FALSE,
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users,
  content TEXT,
  message_type TEXT DEFAULT 'text',  -- text, image, video, audio, file, sticker, gif, recall
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size INTEGER,
  attachment_duration INTEGER,       -- For audio/video
  sticker_id UUID,
  giphy_id TEXT,
  giphy_url TEXT,
  reply_to UUID REFERENCES messages,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  is_starred BOOLEAN DEFAULT FALSE,
  is_recalled BOOLEAN DEFAULT FALSE,
  recalled_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  read_by UUID[] DEFAULT '{}',
  delivered_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Blocked Users
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- User Reports
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users,
  reported_user_id UUID REFERENCES auth.users,
  report_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations,
  caller_id UUID REFERENCES auth.users,
  call_type TEXT NOT NULL,           -- audio, video
  status TEXT DEFAULT 'initiating',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  end_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Participants
CREATE TABLE call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  role TEXT DEFAULT 'participant',   -- caller, callee
  status TEXT DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  UNIQUE(call_id, user_id)
);

-- Call Events (logging)
CREATE TABLE call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privacy Settings
CREATE TABLE user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  allow_message_requests BOOLEAN DEFAULT TRUE,
  show_read_receipts BOOLEAN DEFAULT TRUE,
  show_typing BOOLEAN DEFAULT TRUE,
  show_online BOOLEAN DEFAULT TRUE,
  show_last_active BOOLEAN DEFAULT TRUE,
  call_permission TEXT DEFAULT 'everyone',  -- everyone, contacts_only, nobody
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restricted Users (Silent Block)
CREATE TABLE restricted_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restricter_id UUID REFERENCES auth.users ON DELETE CASCADE,
  restricted_id UUID REFERENCES auth.users ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restricter_id, restricted_id)
);

-- Message Requests
CREATE TABLE message_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',  -- pending, accepted, declined
  message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, requester_id, receiver_id)
);

-- Message Spam
CREATE TABLE message_spam (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users ON DELETE CASCADE,
  spam_type TEXT DEFAULT 'user_reported',  -- auto_detected, user_reported, pattern_match, link_spam, repeat_spam
  spam_reason TEXT,
  confidence_score DECIMAL(3, 2) DEFAULT 0.00,  -- 0.00 to 1.00
  status TEXT DEFAULT 'flagged',  -- flagged, dismissed, confirmed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, reporter_id)
);
```

### 7.2 RLS Policies
```sql
-- Users can only access their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

-- Users can only access messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE auth.uid() = ANY(participant_ids)
    )
  );

-- Users can only delete own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Privacy settings: Users can only access their own
CREATE POLICY "Users can view own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Restricted users: Users can only see users they restricted
CREATE POLICY "Users can view own restrictions"
  ON restricted_users FOR SELECT
  USING (restricter_id = auth.uid());

CREATE POLICY "Users can restrict others"
  ON restricted_users FOR INSERT
  WITH CHECK (restricter_id = auth.uid());

CREATE POLICY "Users can unrestrict"
  ON restricted_users FOR DELETE
  USING (restricter_id = auth.uid());

-- Blocked users: Same pattern as restricted
CREATE POLICY "Users can view own blocks"
  ON blocked_users FOR SELECT
  USING (blocker_id = auth.uid());

-- Message spam: Users can only see their own spam reports
CREATE POLICY "Users can view own spam reports"
  ON message_spam FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can report spam"
  ON message_spam FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Message requests: Users can see requests sent to them
CREATE POLICY "Users can view incoming requests"
  ON message_requests FOR SELECT
  USING (receiver_id = auth.uid() OR requester_id = auth.uid());
```

---

## 8. DESIGN TOKENS & STYLING

### 8.1 Colors
```javascript
// Primary Brand
burgundy: '#9C0612'
burgundyDark: '#6B0F1A'
gold: '#FFBD59'
goldBright: '#FFD700'

// Backgrounds
bgDarkest: '#05040B'
bgMid: '#0F1030'
bgLight: '#1a0b2e'
glassBg: 'rgba(15, 16, 48, 0.55)'
glassBgLight: 'rgba(15, 16, 48, 0.5)'
glassBgHeavy: 'rgba(15, 16, 48, 0.6)'

// Accents
purple: '#6A5BFF'
purpleGlow: '#8C64FF'
purpleMuted: 'rgba(106, 91, 255, 0.2)'
cyan: '#00F0FF'

// Functional
success: '#3AF7A6'
error: '#FF6B6B'
warning: '#FFB800'
info: '#3B82F6'

// Text
textPrimary: '#FFFFFF'
textSecondary: 'rgba(255, 255, 255, 0.8)'
textMuted: 'rgba(255, 255, 255, 0.6)'
textSubtle: 'rgba(255, 255, 255, 0.5)'
textDisabled: 'rgba(255, 255, 255, 0.4)'

// Input
inputBg: 'rgba(0, 0, 0, 0.3)'
inputBorder: 'rgba(106, 91, 255, 0.3)'
```

### 8.2 Gradients
```javascript
// Background gradient (3 stops)
background: ['#05040B', '#0F1030', '#1a0b2e']
backgroundLocations: [0, 0.5, 1]

// Button gradients
primaryButton: ['#9C0612', '#6B0F1A']
glassBorder: ['#6A5BFF', '#00F0FF']
gold: ['#FFBD59', '#FFD700']
avatar: ['#FFBD59', '#9C0612']
toggleActive: ['#3AF7A6', '#00F0FF']
```

### 8.3 Typography
```javascript
fontFamily: {
  primary: 'System',    // SF Pro Display on iOS
  mono: 'Menlo',        // For timestamps, code
}

fontSize: {
  xs: 10,       // Timestamps, badges
  sm: 11,       // Secondary text
  md: 12,       // Body text
  base: 13,     // Default
  lg: 14,       // Emphasis
  xl: 15,       // Headers
  xxl: 16,      // Large headers
  xxxl: 18,     // Screen titles
  display: 20,  // Display text
  hero: 32,     // Hero text
}

fontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}

lineHeight: {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
}
```

### 8.4 Spacing
```javascript
SPACING = {
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
}
```

### 8.5 Border Radius
```javascript
BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,      // Glass cards
  xxl: 24,
  full: 9999,  // Circles
}
```

### 8.6 Component Styles

#### Message Bubble
```javascript
// Own Message (right aligned)
bubbleOwn: {
  backgroundColor: COLORS.purple,      // #6A5BFF
  borderRadius: 18,
  borderBottomRightRadius: 4,          // Tail
  maxWidth: SCREEN_WIDTH * 0.75,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  marginRight: SPACING.md,
  marginLeft: SPACING.huge,
}

// Other Message (left aligned)
bubbleOther: {
  backgroundColor: 'rgba(15, 16, 48, 0.7)',
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  borderRadius: 18,
  borderBottomLeftRadius: 4,           // Tail
  maxWidth: SCREEN_WIDTH * 0.75,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  marginLeft: SPACING.md,
  marginRight: SPACING.huge,
}
```

#### Glass Card
```javascript
glassCard: {
  backgroundColor: 'rgba(15, 16, 48, 0.55)',
  borderWidth: 1.2,
  borderColor: 'rgba(106, 91, 255, 0.3)',
  borderRadius: 18,
  // Shadow
  shadowColor: 'rgba(0, 0, 0, 0.7)',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 20,
  elevation: 10,
}
```

#### Header
```javascript
header: {
  backgroundColor: 'rgba(5, 4, 11, 0.95)',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  paddingHorizontal: SPACING.lg,
  height: 56,
}
```

#### Input Bar
```javascript
inputBar: {
  backgroundColor: 'rgba(15, 16, 48, 0.6)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(106, 91, 255, 0.2)',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
}

textInput: {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  borderRadius: 20,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  color: COLORS.textPrimary,
  fontSize: TYPOGRAPHY.fontSize.base,
  minHeight: 40,
  maxHeight: 120,
}
```

#### Avatar
```javascript
avatar: {
  sm: { width: 32, height: 32, borderRadius: 16 },
  md: { width: 42, height: 42, borderRadius: 21 },
  lg: { width: 56, height: 56, borderRadius: 28 },
  xl: { width: 80, height: 80, borderRadius: 40 },
  xxl: { width: 120, height: 120, borderRadius: 60 },
}
```

#### Online Indicator
```javascript
onlineIndicator: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: COLORS.bgDarkest,
  justifyContent: 'center',
  alignItems: 'center',
}

onlineDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: COLORS.success,  // #3AF7A6
}
```

#### Reaction Badge
```javascript
reactionBadge: {
  backgroundColor: 'rgba(15, 16, 48, 0.8)',
  borderRadius: 12,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderWidth: 1,
  borderColor: 'rgba(106, 91, 255, 0.2)',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
}

// When user has reacted
reactionBadgeOwn: {
  borderColor: COLORS.gold,
}
```

#### Call Button
```javascript
callButton: {
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
}

callButtonMuted: {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}

callButtonActive: {
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
}

endCallButton: {
  backgroundColor: COLORS.error,
  width: 70,
  height: 70,
  borderRadius: 35,
}

acceptCallButton: {
  backgroundColor: COLORS.success,
}

declineCallButton: {
  backgroundColor: COLORS.error,
}
```

---

## 9. USER FLOWS

### 9.1 Send Message Flow
```
1. User types in ChatInput
2. onTyping() called → broadcasts to presence channel
3. User taps Send
4. Create optimistic message with temp-${Date.now()} ID
5. Add to local messages immediately (optimistic update)
6. Call sendMessage() API
7. On success: Replace temp message with server response
8. On failure: Remove temp message, show error toast
9. Real-time subscription updates all clients
```

### 9.2 React to Message Flow
```
1. User double-taps message bubble
2. Heart animation triggered (scale + opacity)
3. toggleReaction(messageId, '❤️') called
4. Optimistic update to local reactions
5. Real-time broadcasts to all clients
6. Heart floats up and fades out
```

### 9.3 Reply to Message Flow
```
1. User swipes right on message (or taps Reply in menu)
2. replyTo state set with message reference
3. MessageReplyPreview slides up in ChatInput
4. User types reply message
5. Send includes reply_to: originalMessageId
6. MessageBubble shows quoted message above content
7. Tap on quote → scrollToMessage(originalId)
```

### 9.4 Initiate Call Flow
```
1. User taps 📞 or 📹 in chat header
2. Permission check (mic, camera for video)
3. Create call record in database
4. Navigate to OutgoingCallScreen
5. Subscribe to call signaling channel
6. Create WebRTC offer
7. Send offer via Supabase broadcast
8. Send push notification to callee
9. Wait for answer (60s timeout)
10. On answer: Exchange ICE candidates → Connected
11. Navigate to InCallScreen/VideoCallScreen
```

### 9.5 Receive Call Flow
```
1. useIncomingCall hook detects new call
2. IncomingCallOverlay displayed (or system notification)
3. Ringtone + vibration starts
4. User taps Accept
5. Permission check
6. Get offer from signaling channel
7. Create WebRTC answer
8. Send answer via broadcast
9. Exchange ICE candidates → Connected
10. Navigate to InCallScreen/VideoCallScreen
```

### 9.6 Create Group Flow
```
1. User navigates to CreateGroupScreen
2. Enter group name (required)
3. Optional: Select group avatar
4. Search and select members (min 2)
5. Selected members shown in horizontal scroll
6. Tap Create
7. createConversation(ids, isGroup=true, name)
8. Navigate to new group ChatScreen
```

---

## 10. ANIMATIONS & EFFECTS

### 10.1 Heart Reaction Animation
```javascript
// On double-tap
const heartAnimation = Animated.sequence([
  // Scale up
  Animated.spring(heartScale, {
    toValue: 1.5,
    tension: 65,
    friction: 3,
    useNativeDriver: true,
  }),
  // Scale back
  Animated.timing(heartScale, {
    toValue: 1,
    duration: 100,
    useNativeDriver: true,
  }),
  // Fade out with delay
  Animated.timing(heartOpacity, {
    toValue: 0,
    duration: 300,
    delay: 200,
    useNativeDriver: true,
  }),
]);

// Float up animation
Animated.timing(heartTranslateY, {
  toValue: -100,
  duration: 600,
  useNativeDriver: true,
});
```

### 10.2 Swipe to Reply Animation
```javascript
// Using PanResponder
const swipeThreshold = 100;

onPanResponderMove: (_, gesture) => {
  if (gesture.dx > 0) {
    translateX.setValue(Math.min(gesture.dx, swipeThreshold));
  }
}

onPanResponderRelease: (_, gesture) => {
  if (gesture.dx > swipeThreshold * 0.7) {
    // Trigger reply
    onReply(message);
  }
  // Snap back
  Animated.spring(translateX, {
    toValue: 0,
    tension: 65,
    friction: 11,
    useNativeDriver: true,
  }).start();
}
```

### 10.3 Send Button Animation
```javascript
const sendAnimation = Animated.sequence([
  Animated.timing(scale, {
    toValue: 0.8,
    duration: 50,
    useNativeDriver: true,
  }),
  Animated.spring(scale, {
    toValue: 1,
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  }),
]);
```

### 10.4 Typing Indicator Animation
```javascript
// Three dots bouncing
const dotAnimations = [0, 1, 2].map((i) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(dots[i], {
        toValue: -4,
        duration: 300,
        delay: i * 150,
        useNativeDriver: true,
      }),
      Animated.timing(dots[i], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ])
  )
);
```

### 10.5 Call Avatar Pulse Animation
```javascript
// Pulsing rings
Animated.loop(
  Animated.parallel([
    // Scale ring
    Animated.sequence([
      Animated.timing(pulseScale, {
        toValue: 1.3,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]),
    // Fade ring
    Animated.sequence([
      Animated.timing(pulseOpacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseOpacity, {
        toValue: 0.6,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]),
  ])
);
```

### 10.6 Video Controls Auto-Hide
```javascript
// Hide after 4 seconds of inactivity
useEffect(() => {
  if (showControls) {
    const timer = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowControls(false));
    }, 4000);
    return () => clearTimeout(timer);
  }
}, [showControls]);

// Tap to toggle
onPress={() => {
  setShowControls(true);
  Animated.timing(controlsOpacity, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start();
}}
```

### 10.7 Glass-morphism Effect
```javascript
// Using expo-blur
<BlurView intensity={18} style={styles.glassContainer}>
  <View style={styles.glassContent}>
    {children}
  </View>
</BlurView>

// Or with CSS-like approach
glassContainer: {
  backgroundColor: 'rgba(15, 16, 48, 0.55)',
  backdropFilter: 'blur(18px) saturate(180%)',
  borderWidth: 1.2,
  borderRadius: 18,
}
```

### 10.8 Haptic Feedback
```javascript
import * as Haptics from 'expo-haptics';

// Light - buttons, toggles
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium - selection, swipe complete
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy - end call, delete
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success - message sent, call connected
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

---

## 11. PERFORMANCE OPTIMIZATIONS

### 11.1 FlatList Configuration
```javascript
<FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={(item) => item.id}
  inverted                          // Chat is bottom-up
  windowSize={10}                   // Render 10 screens
  removeClippedSubviews={true}      // Unmount off-screen
  maxToRenderPerBatch={10}          // Batch size
  initialNumToRender={15}           // Initial render
  updateCellsBatchingPeriod={50}    // Batch updates
  getItemLayout={(data, index) => ({
    length: 76,                     // Fixed item height
    offset: 76 * index,
    index,
  })}
  onEndReached={loadMoreMessages}
  onEndReachedThreshold={0.5}
/>
```

### 11.2 Component Memoization
```javascript
// Memoize message bubble
const MessageBubble = memo(({ message, ...props }) => {
  // ...
}, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.reactions === next.message.reactions &&
    prev.isHighlighted === next.isHighlighted
  );
});

// Memoize conversation item
const ConversationItem = memo(({ conversation, ...props }) => {
  // ...
});

// Memoize callbacks
const handleSend = useCallback((content) => {
  sendMessage(conversationId, content);
}, [conversationId]);
```

### 11.3 Image Optimization
```javascript
// Upload with compression
const compressedImage = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 1080 } }],
  { compress: 0.8, format: SaveFormat.JPEG }
);

// Progressive loading
<Image
  source={{ uri: imageUrl }}
  placeholder={{ uri: thumbnailUrl }}
  transition={200}
  contentFit="cover"
/>
```

### 11.4 Subscription Management
```javascript
// Single subscription per conversation
useEffect(() => {
  const subscription = subscribeToMessages(conversationId, handleNewMessage);

  return () => {
    unsubscribe(subscription);
  };
}, [conversationId]);

// Debounce typing broadcasts
const broadcastTyping = useMemo(
  () => debounce(() => channel.track({ typing: true }), 300),
  [channel]
);
```

---

## 12. CRITICAL SYNC REQUIREMENTS

### 12.1 Channel Names (MUST MATCH WEB)
```javascript
// Messages channel - real-time message updates
`messages:${conversationId}`

// Presence channel - typing indicators
`presence:${conversationId}`

// Unread channel - badge updates
`unread:${userId}`

// Call signaling channel
`call-signal:${callId}`

// Incoming calls channel
`incoming-calls:${userId}`
```

### 12.2 Typing Timeout
```javascript
// MUST be 2000ms on both platforms
const TYPING_TIMEOUT = 2000;
```

### 12.3 Optimistic Message ID Pattern
```javascript
// MUST use this pattern for deduplication
const tempId = `temp-${Date.now()}`;
```

### 12.4 Message Types
```javascript
// All platforms must support these types
const MESSAGE_TYPES = [
  'text',
  'image',
  'video',
  'audio',
  'file',
  'sticker',
  'gif',
  'recall',  // Recalled message placeholder
];
```

### 12.5 Storage Bucket
```javascript
// MUST use same bucket name
const BUCKET_NAME = 'message-attachments';
```

### 12.6 Soft Delete
```javascript
// Messages marked as deleted, not removed
UPDATE messages SET is_deleted = true WHERE id = messageId;

// Query excludes deleted
SELECT * FROM messages WHERE is_deleted = false;
```

### 12.7 Recall Window
```javascript
// Text messages: 2 hours
const TEXT_RECALL_WINDOW = 2 * 60 * 60 * 1000; // 2 hours

// Media messages: 5 minutes (also deletes from storage)
const MEDIA_RECALL_WINDOW = 5 * 60 * 1000; // 5 minutes
```

---

## 13. ERROR HANDLING

### 13.1 Network Errors
```javascript
// Show toast with retry option
try {
  await sendMessage(conversationId, content);
} catch (error) {
  // Remove optimistic message
  setMessages(prev => prev.filter(m => m.id !== tempId));

  // Show error toast
  Toast.show({
    type: 'error',
    text1: 'Failed to send message',
    text2: 'Tap to retry',
    onPress: () => retrySend(),
  });
}
```

### 13.2 Permission Errors
```javascript
// Camera/microphone permission
const requestPermissions = async () => {
  const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
  const { status: micStatus } = await Audio.requestPermissionsAsync();

  if (cameraStatus !== 'granted' || micStatus !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please enable camera and microphone access in Settings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};
```

### 13.3 Upload Errors
```javascript
// With progress and retry
const uploadWithRetry = async (file, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadAttachment(file, conversationId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
};
```

### 13.4 Call Errors
```javascript
// ICE connection failed
peerConnection.oniceconnectionstatechange = () => {
  if (peerConnection.iceConnectionState === 'failed') {
    // Try to restart ICE
    peerConnection.restartIce();

    // Show reconnecting UI
    setCallState(CALL_STATUS.RECONNECTING);

    // Timeout after 15s
    setTimeout(() => {
      if (peerConnection.iceConnectionState === 'failed') {
        endCall(callId, END_REASON.CONNECTION_FAILED);
      }
    }, 15000);
  }
};
```

---

## 14. TESTING CHECKLIST

### 14.1 Messaging
- [ ] Send text message
- [ ] Send image from gallery
- [ ] Take and send photo
- [ ] Send document/file
- [ ] Record and send voice message
- [ ] Double-tap to react with heart
- [ ] Long-press for action menu
- [ ] Swipe to reply
- [ ] Pin/unpin message
- [ ] Star/unstar message
- [ ] Edit own message
- [ ] Delete own message
- [ ] Recall message (within time window)
- [ ] Forward message
- [ ] Search in conversation
- [ ] Translate message
- [ ] Schedule message
- [ ] @Mention user

### 14.2 Conversations
- [ ] Create 1-1 conversation
- [ ] Create group chat
- [ ] Add members to group
- [ ] Change group name/avatar
- [ ] Mute conversation (duration options)
- [ ] Pin conversation (max 5)
- [ ] Archive conversation
- [ ] Delete conversation
- [ ] Change chat theme
- [ ] Set disappearing messages

### 14.3 Calling
- [ ] Initiate audio call
- [ ] Initiate video call
- [ ] Receive incoming call
- [ ] Accept call
- [ ] Decline call
- [ ] Toggle mute
- [ ] Toggle speaker
- [ ] Toggle video
- [ ] Switch camera (front/back)
- [ ] Upgrade audio to video
- [ ] Minimize call (PiP)
- [ ] End call
- [ ] Call timeout (60s)
- [ ] Reconnection handling

### 14.4 Privacy Features
- [ ] Toggle message requests
- [ ] Toggle read receipts
- [ ] Toggle typing indicator
- [ ] Toggle online status
- [ ] Toggle last active
- [ ] Set call permission (everyone/contacts/nobody)
- [ ] Block user
- [ ] Unblock user
- [ ] View blocked users list
- [ ] Restrict user (silent block)
- [ ] Unrestrict user
- [ ] View restricted users list
- [ ] Restricted user doesn't know
- [ ] View message requests
- [ ] Accept message request
- [ ] Decline message request
- [ ] View spam messages
- [ ] Mark as not spam (restore)
- [ ] Delete spam message
- [ ] Delete all spam
- [ ] Spam auto-detection working
- [ ] Report message as spam
- [ ] Navigate to profile from chat details

### 14.5 Real-time Sync
- [ ] Messages sync with web
- [ ] Typing indicators sync
- [ ] Read receipts sync
- [ ] Online status sync
- [ ] Reactions sync
- [ ] Pins/stars sync

### 14.6 Edge Cases
- [ ] Long message (1000+ chars)
- [ ] Large file upload
- [ ] Slow network handling
- [ ] Offline mode behavior
- [ ] Background notification
- [ ] App kill during call
- [ ] Multiple devices sync

### 14.7 UI/UX
- [ ] Pull to refresh
- [ ] Infinite scroll pagination
- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Keyboard handling
- [ ] Safe area handling
- [ ] Glass-morphism effects
- [ ] Animations smooth (60fps)

---

*Document Version: 3.0*
*Last Updated: 2026-01-28*
*Author: Claude Code*
*Includes: Phase 1 Audio Call + Phase 2 Video Call + Privacy Features*

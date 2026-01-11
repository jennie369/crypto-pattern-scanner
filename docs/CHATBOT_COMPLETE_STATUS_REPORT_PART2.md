# CHATBOT AUTO-REPLY SYSTEM - COMPLETE STATUS REPORT
## Part 2: Admin Dashboard & UI Specifications

---

## 11. ADMIN DASHBOARD STRUCTURE

**Framework:** Next.js
**Styling:** Tailwind CSS
**Location:** `/admin/`

### 11.1 File Structure

```
admin/
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── index.js             # Dashboard home
│   ├── chatbot/
│   │   ├── index.js         # Conversations list
│   │   └── [id].js          # Conversation detail
│   ├── faq/
│   │   └── index.js         # FAQ manager
│   ├── agents/
│   │   └── index.js         # Bot agents
│   ├── broadcasts/
│   │   └── index.js         # Broadcast campaigns
│   └── analytics/
│       └── index.js         # Chat analytics
├── components/
│   ├── Layout.js            # Main layout with sidebar
│   ├── ChatMonitor.js       # Real-time chat monitoring
│   ├── FAQEditor.js         # FAQ CRUD
│   ├── HandoffQueue.js      # Human handoff queue
│   ├── DataTable.js         # Generic table
│   └── StatsCard.js         # Stats display
├── services/
│   └── api.js               # API client
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## 12. DESIGN TOKENS - ADMIN DASHBOARD

### 12.1 Color Palette

```javascript
// tailwind.config.js
colors: {
  // Background
  gray: {
    750: '#1f2937',    // Card background
    800: '#111827',    // Sidebar background
    850: '#0f172a',    // Darker background
    900: '#030712',    // Main background
  },

  // Accent
  amber: {
    400: '#FFD080',    // Light accent
    500: '#FFBD59',    // Primary accent (GEM brand)
    600: '#FF8C00',    // Dark accent
  },

  // Status
  green: {
    500: '#22c55e',    // Active, online, success
  },
  yellow: {
    500: '#eab308',    // Waiting, warning
  },
  red: {
    500: '#ef4444',    // Handoff, error
  },
  blue: {
    500: '#3b82f6',    // Zalo platform
  },
  indigo: {
    500: '#6366f1',    // Messenger platform
  },
}
```

### 12.2 Typography

```javascript
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
}
```

### 12.3 Platform Color Mapping

```javascript
// pages/chatbot/index.js
const platformColors = {
  zalo: 'bg-blue-500',      // #3b82f6
  messenger: 'bg-indigo-500', // #6366f1
  web: 'bg-amber-500',       // #FFBD59
};
```

### 12.4 Status Color Mapping

```javascript
const statusColors = {
  active: 'bg-green-500',    // #22c55e
  waiting: 'bg-yellow-500',  // #eab308
  handoff: 'bg-red-500',     // #ef4444
  resolved: 'bg-gray-500',   // #6b7280
};
```

---

## 13. ADMIN LAYOUT SPECIFICATIONS

### 13.1 Sidebar Navigation

**File:** `components/Layout.js`

| Menu Item | Route | Icon |
|-----------|-------|------|
| Dashboard | `/` | Home icon |
| Conversations | `/chatbot` | Chat bubble icon |
| FAQ Manager | `/faq` | Question mark icon |
| Agents | `/agents` | Users icon |
| Broadcasts | `/broadcasts` | Megaphone icon |
| Analytics | `/analytics` | Chart icon |

### 13.2 Layout Dimensions

| Element | Size | Notes |
|---------|------|-------|
| Sidebar Width | `w-64` | 256px |
| Top Bar Height | `h-16` | 64px |
| Content Padding | `p-6` | 24px |
| Logo Container | `h-16` | 64px |

### 13.3 Layout CSS Classes

```jsx
// Sidebar
<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800">

// Top Bar
<header className="sticky top-0 z-40 flex items-center h-16 px-6 bg-gray-800 border-b border-gray-700">

// Main Content
<main className="p-6">{children}</main>

// Active menu item
<Link className="bg-amber-500/20 text-amber-500">

// Inactive menu item
<Link className="text-gray-400 hover:bg-gray-700 hover:text-white">
```

---

## 14. CONVERSATIONS PAGE SPECIFICATIONS

**File:** `pages/chatbot/index.js`

### 14.1 Filter Panel

```jsx
<div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
  {/* Search Input */}
  <input className="w-full bg-gray-700 text-white rounded-lg px-4 py-2
    focus:outline-none focus:ring-2 focus:ring-amber-500" />

  {/* Platform Dropdown */}
  <select className="bg-gray-700 text-white rounded-lg px-4 py-2">
    <option value="all">All Platforms</option>
    <option value="zalo">Zalo</option>
    <option value="messenger">Messenger</option>
    <option value="web">Web</option>
  </select>

  {/* Status Dropdown */}
  <select className="bg-gray-700 text-white rounded-lg px-4 py-2">
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="waiting">Waiting</option>
    <option value="handoff">Handoff</option>
    <option value="resolved">Resolved</option>
  </select>
</div>
```

### 14.2 Data Table Columns

| Column | Key | Sortable | Render |
|--------|-----|----------|--------|
| Platform | `platform` | No | Circle badge with letter |
| User | `user_name` | Yes | Name + phone |
| Last Message | `last_message` | No | Truncated text |
| Messages | `message_count` | Yes | Number |
| Status | `status` | No | Badge with dot |
| Last Activity | `updated_at` | Yes | Date/time |

### 14.3 Platform Badge Render

```jsx
<span className={`inline-flex items-center justify-center w-8 h-8 rounded-full
  text-white text-sm font-medium ${platformColors[value]}`}>
  {value?.charAt(0).toUpperCase()}
</span>
```

### 14.4 Status Badge Render

```jsx
<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
  ${statusColors[value]}/20`}>
  <span className={`w-1.5 h-1.5 rounded-full ${statusColors[value]} mr-1.5`}></span>
  {value}
</span>
```

---

## 15. COMPONENT SPECIFICATIONS

### 15.1 DataTable Component

**File:** `components/DataTable.js`

```typescript
interface DataTableProps {
  columns: Column[];
  data: any[];
  loading: boolean;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    totalPages: number;
    from: number;
    to: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}
```

### 15.2 StatsCard Component

**File:** `components/StatsCard.js`

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;        // Percentage change
  changeType?: 'increase' | 'decrease';
  icon?: ReactNode;
}
```

### 15.3 ChatMonitor Component

**File:** `components/ChatMonitor.js`

Features:
- Real-time message display
- User typing indicator
- Bot response preview
- Handoff trigger button

### 15.4 FAQEditor Component

**File:** `components/FAQEditor.js`

Features:
- Question/answer CRUD
- Category management
- Keyword tagging
- Priority ordering

### 15.5 HandoffQueue Component

**File:** `components/HandoffQueue.js`

Features:
- Pending handoff list
- Agent assignment
- Priority sorting
- Time-in-queue display

---

## 16. API SERVICE

**File:** `services/api.js`

### 16.1 Endpoints

```javascript
const api = {
  // Conversations
  getConversations: (params) => fetch('/api/conversations', { params }),
  getConversation: (id) => fetch(`/api/conversations/${id}`),

  // FAQ
  getFAQs: (params) => fetch('/api/faq', { params }),
  createFAQ: (data) => fetch('/api/faq', { method: 'POST', body: data }),
  updateFAQ: (id, data) => fetch(`/api/faq/${id}`, { method: 'PUT', body: data }),
  deleteFAQ: (id) => fetch(`/api/faq/${id}`, { method: 'DELETE' }),

  // Agents
  getAgents: () => fetch('/api/agents'),

  // Broadcasts
  getBroadcasts: (params) => fetch('/api/broadcasts', { params }),
  createBroadcast: (data) => fetch('/api/broadcasts', { method: 'POST', body: data }),

  // Analytics
  getAnalytics: (params) => fetch('/api/analytics', { params }),
};
```

---

## 17. ADMIN PAGES STATUS

| Page | File | Status | Features |
|------|------|--------|----------|
| Dashboard | `pages/index.js` | ✅ IMPLEMENTED | Stats overview, recent activity |
| Conversations List | `pages/chatbot/index.js` | ✅ IMPLEMENTED | Filter, search, pagination |
| Conversation Detail | `pages/chatbot/[id].js` | ✅ IMPLEMENTED | Message history, user info |
| FAQ Manager | `pages/faq/index.js` | ✅ IMPLEMENTED | CRUD, categories |
| Agents | `pages/agents/index.js` | ✅ IMPLEMENTED | Agent list, status |
| Broadcasts | `pages/broadcasts/index.js` | ✅ IMPLEMENTED | Campaign management |
| Analytics | `pages/analytics/index.js` | ✅ IMPLEMENTED | Charts, metrics |

---

## 18. MOBILE APP INTEGRATION (GEM Master)

### 18.1 Main Screens

| Screen | File | Status |
|--------|------|--------|
| GemMasterScreen | `screens/GemMaster/GemMasterScreen.js` | ✅ |
| ChatHistoryScreen | `screens/GemMaster/ChatHistoryScreen.js` | ✅ |
| TarotScreen | `screens/GemMaster/TarotScreen.js` | ✅ |
| IChingScreen | `screens/GemMaster/IChingScreen.js` | ✅ |

### 18.2 Key Components (44 total)

| Component | Purpose | Status |
|-----------|---------|--------|
| ChatbotPricingModal | Tier upgrade prompts | ✅ |
| ClearChatButton | Clear history | ✅ |
| QuotaIndicator | Usage display | ✅ |
| VoiceInputButton | Voice messages | ✅ |
| QuickActionBar | Action buttons | ✅ |
| ProductRecommendation | Product cards | ✅ |
| DivinationResultCard | Tarot/IChing results | ✅ |

### 18.3 Services

| Service | File | Status |
|---------|------|--------|
| gemMasterAIService | AI chat integration | ✅ |
| gemMasterService | Main service | ✅ |
| chatHistoryService | History management | ✅ |

---

## 19. UI/UX FLOW DIAGRAMS

### 19.1 User Message Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ Platform Adapter│ (Zalo/Messenger/Web)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Message Router  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────┐
│  FAQ  │ │   AI    │
│ Match │ │ Service │
└───┬───┘ └────┬────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│ Response Format │ (Text + Quick Actions)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Platform Adapter│ (Send)
└────────┬────────┘
         │
         ▼
    User Receives
```

### 19.2 Handoff Flow

```
Bot Detects Handoff Need
    │
    ▼
┌─────────────────┐
│ handoff_service │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Handoff  │
│ Queue Entry     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────┐
│ Notify│ │  User   │
│ Admin │ │ Message │
└───────┘ └─────────┘
         │
         ▼
┌─────────────────┐
│ Agent Takes     │
│ Over            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Human Response  │
└─────────────────┘
```

---

## 20. RESPONSIVE BREAKPOINTS

```javascript
// Tailwind defaults used
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### 20.1 Layout Behavior

| Breakpoint | Sidebar | Content |
|------------|---------|---------|
| < 1024px (lg) | Hidden, toggleable | Full width |
| >= 1024px | Always visible | `ml-64` margin |

---

## 21. MISSING ADMIN FEATURES

| Feature | Status | Priority |
|---------|--------|----------|
| Real-time WebSocket Updates | ❌ | HIGH |
| Conversation Export (CSV/PDF) | ❌ | MEDIUM |
| User Segment Editor | ⚠️ Partial | MEDIUM |
| A/B Test Manager | ❌ | LOW |
| Response Templates Library | ❌ | MEDIUM |
| Bulk Actions on Conversations | ❌ | LOW |
| Agent Performance Metrics | ❌ | MEDIUM |
| Custom Dashboard Widgets | ❌ | LOW |

---

## 22. SUPABASE EDGE FUNCTIONS

| Function | File | Purpose | Status |
|----------|------|---------|--------|
| chatbot-gemini | `functions/chatbot-gemini/index.ts` | Gemini chat | ✅ |
| gem-master-chat | `functions/gem-master-chat/index.ts` | GemMaster chat | ✅ |
| broadcast-notification | `functions/broadcast-notification/index.ts` | Mass notifications | ✅ |
| notification-scheduler | `functions/notification-scheduler/index.ts` | Scheduled sends | ✅ |

---

## 23. ACCESS CONTROL

### 23.1 Current Implementation

| Role | Access |
|------|--------|
| Admin | Full access to all pages |
| - | No other roles implemented |

### 23.2 Recommended Roles (NOT IMPLEMENTED)

| Role | Conversations | FAQ | Broadcasts | Analytics | Settings |
|------|---------------|-----|------------|-----------|----------|
| Super Admin | Full | Full | Full | Full | Full |
| Manager | Read/Write | Read/Write | Read/Write | Read | Read |
| Agent | Assigned Only | Read | - | - | - |
| Viewer | Read | Read | Read | Read | - |

---

## 24. SUMMARY

### 24.1 Implementation Status

| Component | Status | Percentage |
|-----------|--------|------------|
| Backend Services | ✅ Complete | 95% |
| Platform Adapters | ✅ Complete | 90% |
| Admin Dashboard | ✅ Complete | 80% |
| Mobile Integration | ✅ Complete | 85% |
| Database Schema | ✅ Complete | 100% |
| Edge Functions | ✅ Complete | 100% |

### 24.2 Overall System Status: **~85% COMPLETE**

### 24.3 Critical Missing Items

1. **Web Adapter** - Needs full implementation
2. **Real-time Admin Updates** - WebSocket for dashboard
3. **Role-based Access Control** - Only admin role exists
4. **Analytics Aggregation Backend** - No backend processing

---

**End of Status Report**

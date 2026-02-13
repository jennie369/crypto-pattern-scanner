# 📊 Gemral - PROJECT SUMMARY
## Complete Context for Session Continuation

**Version:** November 17, 2025  
**Purpose:** Essential context để Claude hiểu toàn bộ project trong session mới  
**Usage:** Upload file này đầu tiên mỗi session mới

---

## 🎯 PROJECT OVERVIEW

### **What is Gemral?**
Gemral là crypto trading ecosystem toàn diện kết hợp:
- **Trading Tools:** GEM Frequency Method (68% win rate dựa trên 686 backtests)
- **Spiritual Wellness:** Academy, Crystals shop, I Ching/Tarot chatbot
- **Community:** Forum, DM, Events, Leaderboard
- **Education:** Courses về trading + tâm linh

### **Core Value Proposition:**
"Trade Smarter, Live Better" - Tích hợp analytical trading với spiritual wellness

---

## 🏗️ TECH STACK

```
Frontend:
- React 18 + Vite
- React Router v6
- Lucide React (icons)
- CSS3 (custom, no framework)

Backend:
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Edge Functions
- Real-time subscriptions

APIs:
- OKX API (crypto data, thay Binance)
- Shopify (payments, products)
- Tevello (LMS courses)
- Zalo Official Account (VN messaging)

Payment:
- Shopify Checkout
- Webhook verification (HMAC)
- TIER access control
```

---

## 💎 TIER SYSTEM

### **TIER 1: BASIC (11M VND)**
- 3 patterns (DPD, UPU, HFZ/LFZ)
- Basic scanner
- Risk calculator
- Position size calculator
- Community access (basic)
- Chatbot (15 questions/day)

### **TIER 2: PRO (21M VND)**
- All TIER 1 +
- 12 patterns total
- Portfolio tracker
- Market screener
- S/R Levels
- Volume analysis
- Unlimited chatbot
- DM access

### **TIER 3: VIP (68M VND / 24 months)**
- All TIER 2 +
- 24 patterns complete
- AI predictions
- Whale tracking
- Advanced backtesting
- Priority support
- Exclusive events

---

## 📊 DATABASE SCHEMA (Supabase)

### **Key Tables:**

```sql
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  display_name text,
  avatar_url text,
  scanner_tier text DEFAULT 'free', -- free, tier1, tier2, tier3
  course_tier text DEFAULT 'free',
  chatbot_tier text DEFAULT 'free',
  verified_seller boolean DEFAULT false,
  verified_trader boolean DEFAULT false,
  level_badge text, -- bronze, silver, gold, platinum, diamond
  role_badge text, -- mod, admin, vip
  achievement_badges text[], -- array of badge IDs
  affiliate_code text UNIQUE,
  total_referrals integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  last_seen timestamp
)

forum_threads (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users,
  title text,
  content text,
  category text, -- trading, patterns, spiritual, success, qa
  image_url text,
  trade_entry numeric,
  trade_sl numeric,
  trade_tp numeric,
  trade_rr numeric,
  is_pinned boolean DEFAULT false,
  created_at timestamp
)

forum_replies (
  id uuid PRIMARY KEY,
  thread_id uuid REFERENCES forum_threads,
  author_id uuid REFERENCES users,
  content text,
  created_at timestamp
)

forum_likes (
  id uuid PRIMARY KEY,
  thread_id uuid REFERENCES forum_threads,
  user_id uuid REFERENCES users,
  created_at timestamp,
  UNIQUE(thread_id, user_id)
)

scans (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  pattern_type text,
  symbol text,
  timeframe text,
  confidence numeric,
  entry_price numeric,
  stop_loss numeric,
  take_profit numeric,
  status text, -- pending, triggered, completed, cancelled
  created_at timestamp
)

affiliate_clicks (
  id uuid PRIMARY KEY,
  affiliate_code text,
  clicked_at timestamp,
  ip_address text,
  user_agent text
)

affiliate_conversions (
  id uuid PRIMARY KEY,
  affiliate_code text,
  customer_id uuid REFERENCES users,
  order_value numeric,
  commission_amount numeric,
  tier_purchased text,
  converted_at timestamp
)
```

---

## 🎨 BRAND COLORS

```css
/* Primary Colors */
--burgundy: #9C0612;      /* Primary brand color */
--gold: #FFBD59;          /* Accent, CTA buttons */
--navy: #112250;          /* Dark backgrounds */
--deep-navy: #0a0e27;     /* Darker backgrounds */

/* Semantic Colors */
--success: #00FF88;       /* Positive, online indicators */
--warning: #FFB800;       /* Alerts */
--danger: #FF4444;        /* Errors, stop loss */
--info: #00D9FF;          /* Information */

/* Tier Colors */
--tier1-color: #FFD700;   /* Gold star */
--tier2-color: #E8C4FF;   /* Purple diamond */
--tier3-color: #FF6B9D;   /* Pink crown */

/* Badge Colors */
--bronze: #CD7F32;
--silver: #C0C0C0;
--gold-badge: #FFD700;
--platinum: #E5E4E2;
--diamond: #B9F2FF;
```
 /* 🌟 Background - Glow Effect (Blur Layers Version) */
  --bg-base-dark: #0A1628;
  --bg-base-mid: #0D1B2A;
  --bg-base-light: #0F172A;
  --bg-gradient-base: linear-gradient(135deg, #0A1628 0%, #0D1B2A 50%, #0F172A 100%);
  
  /* Glow Colors */
  --glow-blue-bright: rgba(59, 130, 246, 0.5);
  --glow-blue-medium: rgba(37, 99, 235, 0.25);
  --glow-blue-dark: rgba(30, 64, 175, 0.3);
  
  /* Legacy support */
  --bg-primary: #0A1628;
  --bg-secondary: #0D1B2A;
  --bg-tertiary: #0F172A;

---

## 📂 PROJECT STRUCTURE

```
gem-trading-platform/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home/              # Public landing (/)
│   │   │   ├── Scanner/           # Pattern scanner (/scanner-v2)
│   │   │   ├── Community/         # Community hub (/community)
│   │   │   │   ├── CommunityHub.jsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── LeftSidebar.jsx
│   │   │   │   │   ├── CenterFeed.jsx
│   │   │   │   │   ├── PostCard.jsx
│   │   │   │   │   ├── RightSidebar.jsx
│   │   │   │   │   ├── PostCreationModal.jsx
│   │   │   │   │   └── ThreadDetail.jsx
│   │   │   ├── Learning/          # Courses + Shop (/learning)
│   │   │   ├── Account/           # Account dashboard (/account)
│   │   │   ├── Profile/           # User profile (/profile)
│   │   │   ├── Affiliate/         # Affiliate program (/affiliate)
│   │   │   └── Settings/          # Settings (/settings)
│   │   ├── components/
│   │   │   ├── Navigation/        # TopNav with dropdowns
│   │   │   ├── UserBadge/         # Badge system
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── TierContext.jsx
│   │   └── lib/
│   │       └── supabase.js
│   └── public/
├── supabase/
│   ├── migrations/
│   └── functions/
└── docs/
```

---

## 🎯 CURRENT STATUS (November 17, 2025)

### **Overall Progress: 85%**

```
✅ COMPLETED:
- Core authentication (Supabase)
- Basic pattern scanner (3 patterns working)
- Risk calculator
- Position size calculator
- Forum database (forum_threads, forum_replies, forum_likes)
- Shopify integration (payments working)
- Affiliate tracking system
- User profiles
- Database schema complete
- RLS policies implemented
- Navigation fixed (Home, /scanner-v2)

🚧 IN PROGRESS:
- Community Hub implementation (0% - chỉ có database) ⚠️
- User Badges system - 50%
- TIER 2/3 tools completion - 70%
- Account Dashboard redesign - 90%

⏳ TODO:
- Complete Community Hub UI (5 days)
- Complete 21 remaining patterns (3/24 done)
- Paper trading mode
- Advanced backtesting
- AI predictions
- Whale tracking
- Mobile responsive polish
- Performance optimization
```

---

## 🚀 LAUNCH PLAN

### **Timeline: 2 tuần (By December 1, 2025)**

**Week 1 (Nov 18-24):**
- Complete Community Hub redesign
- Implement User Badges
- Finish TIER 2/3 tools
- Complete Account Dashboard

**Week 2 (Nov 25 - Dec 1):**
- Testing & bug fixes
- Mobile responsive
- Performance optimization
- Soft launch prep

---

## 📋 NAVIGATION STRUCTURE

```
TOP NAVIGATION:
🏠 Home (/)
🔍 Scanner (/scanner-v2)
👥 Community ▼
   ├─ 💬 Forum (/community)
   ├─ 🤖 Chatbot (/community?tab=chatbot)
   ├─ ✉️ Messages (/community?tab=messages)
   ├─ 📅 Events (/community?tab=events)
   └─ 🏆 Leaderboard (/community?tab=leaderboard)

📚 Learning ▼
   ├─ 📖 Courses (/courses)
   └─ 🛍️ Shop (/shop)

👤 Account ▼
   ├─ 👤 Profile (/profile)
   ├─ 🤝 Affiliate (/affiliate)
   ├─ ⚙️ Settings (/settings)
   └─ 🚪 Logout
```

---

## 🎨 KEY FEATURES

### **1. Pattern Scanner**
- Real-time detection (OKX WebSocket)
- 24 patterns (3 working, 21 TODO)
- Confidence scoring (70-95%)
- Entry/SL/TP calculations
- Alert notifications

### **2. GEM Frequency Method**
- Zone-based trading (not breakouts)
- HFZ (High Frequency Zone) & LFZ (Low Frequency Zone)
- DPD (Down-Pivot-Down) pattern
- UPU (Up-Pivot-Up) pattern
- Zone lifecycle: Fresh → Tested 1x → Tested 2x → Weak → Invalid

### **3. Community Hub**
- Forum với categories
- Direct messaging (TIER 1+)
- Events calendar
- Leaderboard
- Gemral Chatbot (I Ching, Tarot, Tử Vi)

### **4. Affiliate Program**
- Unique tracking codes
- 3-30% commission rates
- Multi-level tracking (3 levels)
- Real-time dashboard
- Automatic payouts

---

## 🔐 AUTHENTICATION & AUTHORIZATION

```javascript
// Auth Flow
1. User signs up via Shopify
2. Webhook → Supabase Edge Function
3. Create user record with tier
4. Send welcome email via Zalo
5. User logs in → JWT token
6. Frontend checks userData.scanner_tier
7. Conditional rendering based on tier

// Tier Check Example
{userData?.scanner_tier !== 'free' && (
  <ProtectedTool />
)}

// RLS Policy Example
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

---

## 📱 KEY USER FLOWS

### **New User Journey:**
1. Land on Home page
2. See 68% win rate claim
3. Click "Start Free Trial"
4. Redirected to Shopify checkout
5. Complete payment
6. Webhook creates account
7. Receive login credentials via email
8. Login → Scanner access unlocked

### **Existing User Journey:**
1. Login
2. Go to Scanner
3. Select symbol + timeframe
4. View detected patterns
5. Click pattern for details
6. Execute trade or save signal
7. Track in Portfolio (TIER 2+)

---

## 🎯 BUSINESS METRICS

**Revenue Targets (3 months):**
- Month 1: 300M VND
- Month 2: 1B VND
- Month 3: 2B VND

**User Acquisition:**
- Viral coefficient target: 2.0
- Affiliate conversion rate: 5-10%
- Organic search: 30%
- Paid ads: 20%

**Retention:**
- Month 1: 80%
- Month 3: 60%
- Month 6: 45%

---

## 🔧 COMMON DEVELOPMENT COMMANDS

```bash
# Frontend
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Supabase
supabase start          # Start local Supabase
supabase db push        # Push migrations
supabase functions deploy  # Deploy edge functions

# Git
git add .
git commit -m "feat: description"
git push origin main
```

---

## 📞 KEY CONTACTS

**Founder:** Jennie Chu  
**Primary Developer:** Working with Claude AI  
**AI Assistants:**
- Claude: Strategy, planning, analysis
- Claude Code: Terminal implementation
- Comet AI: Browser testing

---

## 🎯 NEXT IMMEDIATE TASKS

1. **Build Community Hub UI** (5 days) ⚠️ **PRIORITY 1**
   - Implement CenterFeed + PostCard (connect to forum_threads)
   - Implement LeftSidebar (categories, online users, top members)
   - Implement RightSidebar (trending, news, creators)
   - Create PostCreationModal
   - Create ThreadDetail page
   - Test all database connections

2. **Implement User Badges** (2 days)
   - Badge components
   - Database updates
   - Integration everywhere

3. **Finish TIER 2/3 Tools** (2 days)
   - S/R Levels page
   - Volume Analysis page
   - Routes update

4. **Complete Account Dashboard** (1 day)
   - Connect real Supabase data
   - Mobile responsive

**Total: 10 days to 95% completion**

---

## ✅ USE THIS FILE FOR:
- Starting new Claude sessions
- Quick project reference
- Onboarding new developers
- Remembering context after breaks

**Always upload this + specific feature docs for best results!**

# COURSES + SHOPIFY INTEGRATION - COMPLETE FEATURE SPECIFICATION

**Version:** 2.0
**Last Updated:** December 24, 2024
**Platforms:** Web (React), Mobile (React Native), Backend (Supabase + Deno Edge Functions)

---

## IMPLEMENTATION STATUS

| Feature | Status | Notes |
|---------|--------|-------|
| Course Catalog | DONE | CoursesScreen.js with filtering |
| Course Detail | DONE | CourseDetailScreen.js with enrollment |
| Lesson Player | DONE | LessonPlayerScreen.js (video/article/quiz) |
| Quiz System | DONE | QuizScreen.js, QuizBuilderScreen.js |
| Certificate System | DONE | CertificateScreen.js with share |
| Shopify Integration | DONE | Webhook handler, cart checkout |
| Admin Course Builder | DONE | Full CRUD with drag-drop |
| Admin Quiz Builder | DONE | Question management |
| Admin Student Management | DONE | Progress tracking, access control |
| Course Analytics | DONE | CourseAnalyticsScreen.js |
| Student Progress Detail | DONE | StudentProgressScreen.js |
| 3 Trading Courses Seed | DONE | TIER1, TIER2, TIER3 courses |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [Admin Course Builder System](#4-admin-course-builder-system)
5. [Trading Courses Content](#5-trading-courses-content)
6. [Complete User Flows](#6-complete-user-flows)
7. [Shopify Integration](#7-shopify-integration)
8. [HTML Course Content System](#8-html-course-content-system)
9. [Quiz System](#9-quiz-system)
10. [Certificate System](#10-certificate-system)
11. [UI/UX Components](#11-uiux-components)
12. [Design Tokens & CSS Specifications](#12-design-tokens--css-specifications)
13. [API Endpoints](#13-api-endpoints)
14. [Real-time Sync](#14-real-time-sync)
15. [Mobile Specifications](#15-mobile-specifications)

---

## 1. EXECUTIVE SUMMARY

### 1.1 System Overview

The GEM Platform Courses system is a comprehensive learning management system (LMS) with:

- **Multi-platform support**: Web (React) + Mobile (React Native)
- **Payment integration**: Shopify checkout with webhook-based access granting
- **Access control**: Tier-based (FREE/TIER1/TIER2/TIER3) + individual course purchases
- **Content types**: Video lessons, HTML articles, interactive quizzes
- **Progress tracking**: Real-time progress sync, completion certificates
- **Admin tools**: Course builder, student management, analytics

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| Course Catalog | Browse, filter, search published courses |
| Enrollment | Free enrollment or Shopify purchase |
| Learning Player | Video/Article/Quiz with progress tracking |
| Quiz System | Multiple choice, true/false, fill-blank questions |
| Certificates | Auto-generated on course completion |
| Tier Access | Tier-locked courses unlock with subscription |
| Shopify Webhook | Automatic access grant on purchase |
| HTML Builder | Rich HTML content with custom tags |
| Admin Builder | Full course management with drag-drop |
| Analytics | Student progress, revenue, completion rates |

---

## 2. ARCHITECTURE OVERVIEW

### 2.1 Frontend (React Web)

```
frontend/src/
├── pages/
│   ├── Courses.jsx              # Course catalog
│   ├── CourseDetail.jsx         # Course detail page
│   ├── CourseLearning.jsx       # Learning player
│   └── Courses/
│       └── components/
│           ├── CourseCard.jsx       # Course card component
│           ├── ModuleAccordion.jsx  # Expandable module
│           ├── ArticleRenderer.jsx  # HTML content renderer
│           ├── QuizQuestion.jsx     # Quiz question component
│           ├── QuizTimer.jsx        # Quiz countdown timer
│           └── QuizResult.jsx       # Quiz results display
├── services/
│   ├── courseService.js         # Course CRUD & queries
│   ├── enrollmentService.js     # Enrollment management
│   ├── progressService.js       # Progress & certificates
│   ├── lessonService.js         # Lesson content loading
│   ├── quizService.js           # Quiz submission & grading
│   └── htmlLessonParser.js      # HTML content parser
└── contexts/
    └── CourseContext.jsx        # Course state management
```

### 2.2 Mobile (React Native)

```
gem-mobile/src/
├── screens/
│   ├── Courses/
│   │   ├── CoursesScreen.js         # Main courses tab
│   │   ├── CourseDetailScreen.js    # Course details + enrollment
│   │   ├── LessonPlayerScreen.js    # Video/Article/Quiz player
│   │   ├── QuizScreen.js            # Full quiz experience
│   │   ├── CertificateScreen.js     # Certificate display
│   │   └── CourseCheckout.js        # Shopify WebView checkout
│   └── Admin/
│       └── Courses/
│           ├── CourseListScreen.js      # Admin course list
│           ├── CourseBuilderScreen.js   # Create/edit course (1720 lines)
│           ├── ModuleBuilderScreen.js   # Module/chapter editor (926 lines)
│           ├── LessonBuilderScreen.js   # Lesson editor with HTML (1363 lines)
│           ├── QuizBuilderScreen.js     # Quiz question management
│           ├── CourseStudentsScreen.js  # Student management (959 lines)
│           ├── StudentProgressScreen.js # Individual student progress
│           ├── CourseAnalyticsScreen.js # Course statistics
│           ├── GrantAccessScreen.js     # Manual access granting
│           ├── CoursePreviewScreen.js   # Preview course content
│           └── index.js                 # Barrel exports
├── services/
│   ├── courseService.js         # Course API + AsyncStorage
│   ├── courseAccessService.js   # Access validation
│   ├── progressService.js       # Progress tracking
│   └── htmlLessonParser.js      # Regex-based HTML parser
└── contexts/
    └── CourseContext.js         # Mobile course state
```

### 2.3 Backend (Supabase)

```
supabase/
├── functions/
│   └── shopify-webhook/
│       └── index.ts             # Webhook handler
└── migrations/
    ├── 20251125_courses_CLEAN_START.sql
    ├── 20251129_course_access_system.sql
    ├── 20251129_course_quiz_system.sql
    ├── 20251130_html_course_content.sql
    ├── 20251209_course_access_via_shopify.sql
    ├── 20251209_link_courses_to_shopify.sql
    └── 20251224_trading_courses_seed.sql   # 3 trading courses
```

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

#### courses
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Access Control
  tier_required TEXT DEFAULT 'FREE',  -- FREE, TIER1, TIER2, TIER3
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Media
  thumbnail_url TEXT,

  -- Stats
  estimated_duration TEXT,
  difficulty_level TEXT,  -- beginner, intermediate, advanced
  rating DECIMAL,
  students_count INT DEFAULT 0,

  -- Instructor
  instructor_name TEXT,
  instructor_avatar TEXT,
  created_by UUID REFERENCES auth.users(id),

  -- Shopify Integration
  shopify_product_id TEXT,
  price DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  membership_duration_days INT,

  -- Settings
  drip_enabled BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### course_modules
```sql
CREATE TABLE course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### course_lessons
```sql
CREATE TABLE course_lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'video',  -- 'video', 'article', 'quiz'
  duration_minutes INT,
  order_index INT DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,

  -- Video Content
  video_url TEXT,
  thumbnail_url TEXT,

  -- Article Content
  content TEXT,
  content_html TEXT,
  content_blocks JSONB DEFAULT '[]',

  -- HTML Content System
  html_content TEXT,
  parsed_content JSONB,
  embedded_quizzes JSONB,
  embedded_images JSONB,

  -- Quiz Settings
  passing_score INT DEFAULT 70,

  -- Version Control
  last_edited_at TIMESTAMPTZ,
  last_edited_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### course_enrollments
```sql
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Enrollment Info
  access_type TEXT DEFAULT 'purchase',  -- 'purchase', 'admin_grant', 'gift', 'trial'
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),

  -- Progress
  progress_percentage INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Shopify Data
  metadata JSONB,

  -- Expiry
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id, course_id)
);
```

#### course_progress
```sql
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Video Progress
  watch_time_seconds INT DEFAULT 0,
  last_position_seconds INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);
```

### 3.2 Quiz System Tables

#### quizzes
```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  -- Settings
  passing_score INT DEFAULT 70,
  time_limit_minutes INT,
  max_attempts INT DEFAULT 3,

  -- Options
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_options BOOLEAN DEFAULT false,
  show_answers_after BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### quiz_questions
```sql
CREATE TABLE quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

  -- Question Content
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',

  -- Options: JSONB array of option strings
  options JSONB NOT NULL DEFAULT '[]',

  -- Correct answer (single string for multiple_choice)
  correct_answer TEXT,

  explanation TEXT,
  points INT DEFAULT 10,
  order_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### quiz_attempts
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT REFERENCES quizzes(id),
  lesson_id TEXT,
  course_id TEXT NOT NULL,

  attempt_number INT DEFAULT 1,
  answers JSONB NOT NULL DEFAULT '{}',

  score INT DEFAULT 0,
  max_score INT NOT NULL,
  score_percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,

  time_spent_seconds INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  graded_answers JSONB DEFAULT '[]'
);
```

### 3.3 Certificate Table

#### course_certificates
```sql
CREATE TABLE course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  user_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  instructor_name TEXT,

  certificate_number TEXT UNIQUE,

  issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. ADMIN COURSE BUILDER SYSTEM

### 4.1 Overview

The Admin Course Builder is a comprehensive system for creating and managing courses, accessible only to admin users.

### 4.2 Admin Screens

| Screen | File | Lines | Description |
|--------|------|-------|-------------|
| CourseListScreen | `CourseListScreen.js` | ~400 | List all courses with filters |
| CourseBuilderScreen | `CourseBuilderScreen.js` | 1720 | Create/edit course with modules |
| ModuleBuilderScreen | `ModuleBuilderScreen.js` | 926 | Edit module, manage lessons (drag-drop) |
| LessonBuilderScreen | `LessonBuilderScreen.js` | 1363 | Video/Article/Quiz editor, HTML paste |
| QuizBuilderScreen | `QuizBuilderScreen.js` | ~600 | Quiz question management |
| CourseStudentsScreen | `CourseStudentsScreen.js` | 959 | Student list, progress, access control |
| StudentProgressScreen | `StudentProgressScreen.js` | ~500 | Individual student progress detail |
| CourseAnalyticsScreen | `CourseAnalyticsScreen.js` | ~600 | Course statistics and metrics |
| GrantAccessScreen | `GrantAccessScreen.js` | ~400 | Manual access granting |
| CoursePreviewScreen | `CoursePreviewScreen.js` | ~300 | Preview course as student |

### 4.3 Navigation Registration

**File:** `gem-mobile/src/navigation/AccountStack.js`

```javascript
// Admin Course Screens
import {
  CourseListScreen,
  CourseBuilderScreen,
  ModuleBuilderScreen,
  LessonBuilderScreen,
  QuizBuilderScreen,
  GrantAccessScreen,
  CourseStudentsScreen,
  CoursePreviewScreen,
  StudentProgressScreen,
  CourseAnalyticsScreen,
} from '../screens/Admin/Courses';

// Stack.Screen registrations (lines 529-580)
<Stack.Screen name="AdminCourses" component={CourseListScreen} />
<Stack.Screen name="CourseBuilder" component={CourseBuilderScreen} />
<Stack.Screen name="ModuleBuilder" component={ModuleBuilderScreen} />
<Stack.Screen name="LessonBuilder" component={LessonBuilderScreen} />
<Stack.Screen name="QuizBuilder" component={QuizBuilderScreen} />
<Stack.Screen name="GrantAccess" component={GrantAccessScreen} />
<Stack.Screen name="CourseStudents" component={CourseStudentsScreen} />
<Stack.Screen name="CoursePreview" component={CoursePreviewScreen} />
<Stack.Screen name="StudentProgress" component={StudentProgressScreen} />
<Stack.Screen name="CourseAnalytics" component={CourseAnalyticsScreen} />
```

### 4.4 Key Features

#### CourseBuilderScreen
- Create/edit course with title, description, thumbnail
- Set tier requirement (FREE, TIER1, TIER2, TIER3)
- Set price and Shopify product ID
- Manage modules with drag-drop reordering
- DraggableFlatList for module reordering
- Add/delete modules

#### ModuleBuilderScreen
- Edit module title and description
- Manage lessons within module
- Drag-drop lesson reordering
- Add new lessons (video, article, quiz)
- Duplicate lessons
- Navigate to LessonBuilder

#### LessonBuilderScreen
- Edit lesson title, description
- Set lesson type (video, article, quiz)
- Video URL input (YouTube, Vimeo)
- HTML content paste and edit
- Save HTML to Supabase
- Block editor (legacy)
- Attachment management
- Preview toggle

#### CourseStudentsScreen
- List enrolled students with progress
- Search and filter students
- Sort by date, progress, name
- Filter by status (active, expired, completed)
- Grant access extension
- Revoke access
- Navigate to StudentProgress

#### StudentProgressScreen
- Student info card
- Progress circle (percentage)
- Stats: lessons completed, watch time, quiz pass count
- Lesson-by-lesson progress list
- Quiz attempt history with scores

#### CourseAnalyticsScreen
- Overview cards: total students, active, completed, avg progress
- Revenue card with total earnings
- Course info: modules, lessons, quiz pass rate
- Enrollment chart by month
- Recent enrollments list
- Quick actions: manage students, edit course

---

## 5. TRADING COURSES CONTENT

### 5.1 Overview

Three trading courses are available, one for each tier:

| Tier | Course Name | Price | Chapters | Lessons |
|------|-------------|-------|----------|---------|
| TIER1 | NEN TANG TRADER CHUYEN NGHIEP | 11,000,000 VND | 8 | 16+ |
| TIER2 | TAN SO TRADER THINH VUONG | 21,000,000 VND | 6 | 13+ |
| TIER3 | DE CHE TRADER BAC THAY | 68,000,000 VND | 5 | 13+ |

**Total:** 19 modules, 40+ lessons, 5 quizzes

### 5.2 TIER 1: NEN TANG TRADER CHUYEN NGHIEP

**Target:** Nguoi moi bat dau trading
**Duration:** 30 gio
**Difficulty:** Beginner

| Chapter | Title | Lessons |
|---------|-------|---------|
| 1 | Gioi thieu Trading | Trading la gi, Thi truong Crypto, Cac san, Quiz |
| 2 | Doc Bieu Do Co Ban | Candlestick, Timeframes, Volume, Quiz |
| 3 | Pattern Co Ban | DPD, UPU, Head & Shoulders, Quiz |
| 4 | Support & Resistance | Support Zone, Resistance Zone, Breakout, Quiz |
| 5 | Quan Ly Von | Risk management, Position sizing |
| 6 | Tam Ly Trading | Kiem soat cam xuc, Ky luat |
| 7 | Thuc Hanh Scanner | Su dung GEM Scanner |
| 8 | Paper Trading | Thuc hanh giao dich mo phong |

### 5.3 TIER 2: TAN SO TRADER THINH VUONG

**Target:** Trader da co nen tang
**Duration:** 25 gio
**Difficulty:** Intermediate

| Chapter | Title | Lessons |
|---------|-------|---------|
| 1 | Pattern Nang Cao | Double Top/Bottom, Triangles, HFZ/LFZ, Inv H&S, Quiz |
| 2 | Multi-Timeframe | Top-Down Analysis, 3 TF Strategy, Confluence, Quiz |
| 3 | Volume Profile | Advanced volume analysis |
| 4 | GEM Master AI | AI trong Trading, Features, Karma System, Quiz |
| 5 | Tam Linh & Trading | Tarot, I Ching integration |
| 6 | Chien Luoc Tong Hop | Xay dung he thong trading |

### 5.4 TIER 3: DE CHE TRADER BAC THAY

**Target:** Trader muon dat den dinh cao
**Duration:** 40 gio + Mentoring
**Difficulty:** Advanced

| Chapter | Title | Lessons |
|---------|-------|---------|
| 1 | 24 Pattern Mastery | Flag, Wedge, Cup & Handle, Candlestick Mastery, Quiz |
| 2 | AI Signals | Signal Interpretation, Entry/Exit AI, R/R AI, Quiz |
| 3 | Whale Tracking | On-chain Analysis, Whale Alerts, Smart Money, Quiz |
| 4 | Portfolio Management | Quan ly danh muc chuyen nghiep |
| 5 | VIP Mentoring | Setup Guide, Trading Plan, Live Sessions, VIP Community |

### 5.5 Seed Data Migration

**File:** `supabase/migrations/20251224_trading_courses_seed.sql`

```sql
-- Creates:
-- - 3 courses (course-tier1-trading-foundation, course-tier2-trading-advanced, course-tier3-trading-mastery)
-- - 19 modules across all courses
-- - 40+ lessons with video/article/quiz types
-- - 5 quizzes with sample questions
```

---

## 6. COMPLETE USER FLOWS

### 6.1 Flow: Browse & Enroll in Free Course

```
User navigates to Courses tab
    -> courseService.getPublishedCourses()
    -> Display CourseCard grid with tier badges
    -> User clicks FREE course
    -> CourseDetailScreen loads
    -> User clicks "Dang ky mien phi"
    -> enrollmentService.enroll(userId, courseId)
    -> Navigate to first lesson
```

### 6.2 Flow: Purchase Paid Course (Shopify)

```
User clicks PAID course card
    -> CourseDetailScreen shows locked state
    -> User clicks "Mua khoa hoc"
    -> shopifyService.createCart([{variantId, qty: 1}])
    -> Navigate to CourseCheckout (WebView)
    -> User completes Shopify checkout
    -> Shopify sends webhook to /shopify-webhook
    -> Webhook grants access to user
    -> User returns to app with access
```

### 6.3 Flow: Admin Creates Course

```
Admin navigates to AdminDashboard
    -> Clicks "Quan ly khoa hoc"
    -> CourseListScreen loads
    -> Clicks "Tao moi"
    -> CourseBuilderScreen opens
    -> Fills course info (title, description, tier, price)
    -> Adds modules
    -> For each module -> ModuleBuilderScreen
    -> For each lesson -> LessonBuilderScreen
    -> For quiz lessons -> QuizBuilderScreen
    -> Publishes course
```

### 6.4 Flow: Admin Views Student Progress

```
Admin in CourseStudentsScreen
    -> Clicks "Chi tiet" on student row
    -> Navigate to StudentProgress
    -> StudentProgressScreen loads
    -> Shows student info, overall progress
    -> Lists each lesson with completion status
    -> Shows quiz attempt history
```

---

## 7. SHOPIFY INTEGRATION

### 7.1 Webhook Handler Overview

**File:** `supabase/functions/shopify-webhook/index.ts`

The webhook listens for Shopify events:
- `orders/create` - Order placed (pending)
- `orders/paid` - Payment confirmed
- `orders/updated` - Status changed

### 7.2 Security: HMAC Verification

```typescript
const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
const shopifySecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');

const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  'raw',
  encoder.encode(shopifySecret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
);

const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));

if (computedHmac !== hmacHeader) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 7.3 Course Detection Methods

**Method 1: SKU Pattern Matching**
```javascript
const courseMatch = sku.match(/(?:gem-)?individual-course-(\w+)/i);
```

**Method 2: Product Properties**
```javascript
const courseIdProp = lineItem.properties?.find(p => p.name === 'course_id');
```

**Method 3: Database Lookup**
```javascript
const { data: course } = await supabase
  .from('courses')
  .select('id')
  .eq('shopify_product_id', productId)
  .single();
```

### 7.4 Access Grant Function

```typescript
async function grantCourseAccess(userId, courseId, orderData) {
  // Check existing enrollment
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    // Extend existing
    await supabase.from('course_enrollments').update({
      expires_at: calculateNewExpiry(existing.expires_at),
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
  } else {
    // Create new enrollment
    await supabase.from('course_enrollments').insert({
      user_id: userId,
      course_id: courseId,
      access_type: 'purchase',
      enrolled_at: new Date().toISOString(),
      metadata: { shopify_order_id: orderData.id }
    });
  }
}
```

---

## 8. HTML COURSE CONTENT SYSTEM

### 8.1 Content Storage

| Field | Type | Purpose |
|-------|------|---------|
| `html_content` | TEXT | Raw HTML from teacher |
| `parsed_content` | JSONB | Structured block array |
| `content_blocks` | JSONB | Legacy block format |

### 8.2 HTML Paste Workflow

1. Teacher copies HTML from AI/ChatGPT/Notion
2. Opens LessonBuilderScreen
3. Clicks "Dan HTML" button
4. Paste from clipboard
5. Preview in editor
6. Click "Luu HTML" to save

### 8.3 Supported Elements

- `<h1>` - `<h6>`: Headings
- `<p>`: Paragraphs
- `<ul>`, `<ol>`, `<li>`: Lists
- `<img>`: Images
- `<pre><code>`: Code blocks
- `<blockquote class="tip|warning|info">`: Callouts

---

## 9. QUIZ SYSTEM

### 9.1 Question Types

| Type | Description |
|------|-------------|
| `multiple_choice` | Single correct answer (radio buttons) |
| `true_false` | True or False toggle |

### 9.2 Quiz Flow

1. User starts quiz lesson
2. Questions displayed one at a time
3. User selects answers
4. Submit quiz
5. Calculate score and pass/fail
6. If passed, lesson marked complete
7. Show results with explanations

### 9.3 Quiz Builder Features

- Add/edit/delete questions
- Set points per question
- Set passing score
- Reorder questions
- Preview quiz

---

## 10. CERTIFICATE SYSTEM

### 10.1 Certificate Generation

```javascript
async function generateCertificate(userId, courseId, userName) {
  // Verify 100% completion
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('progress_percentage')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (enrollment.progress_percentage < 100) {
    throw new Error('Course not completed');
  }

  // Generate unique number
  const certificateNumber = `GEM-${Date.now()}-${randomString(6)}`;

  // Create certificate
  await supabase.from('course_certificates').insert({
    user_id: userId,
    course_id: courseId,
    user_name: userName,
    course_title: course.title,
    certificate_number: certificateNumber
  });
}
```

### 10.2 Certificate Display

- User name
- Course title
- Issue date
- Unique certificate number
- Share buttons (Facebook, LinkedIn)
- Download option

---

## 11. UI/UX COMPONENTS

### 11.1 Course Card
- Thumbnail with tier badge
- Title and description
- Progress bar (if enrolled)
- Price or "Mien phi"
- "Bat dau" / "Tiep tuc" button

### 11.2 Module Accordion
- Expandable module list
- Lesson count and duration
- Lesson items with type icons
- Active lesson highlighted

### 11.3 Lesson Player
- Video player with controls
- Article renderer for HTML
- Quiz interface
- Progress tracking
- Next/Previous navigation

---

## 12. DESIGN TOKENS & CSS SPECIFICATIONS

### 12.1 Color Palette

```javascript
// gem-mobile/src/utils/tokens.js
export const COLORS = {
  bgDarkest: '#0A0E27',
  bgCard: '#1A1B3A',
  bgGlass: 'rgba(15, 16, 48, 0.55)',

  gold: '#FFBD59',
  success: '#3AF7A6',
  error: '#FF6B6B',
  info: '#00F0FF',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.85)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  tierFree: '#3AF7A6',
  tier1: '#00F0FF',
  tier2: '#6A5BFF',
  tier3: '#FFBD59',
};
```

### 12.2 Typography

```javascript
export const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};
```

### 12.3 Spacing

```javascript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 13. API ENDPOINTS

### 13.1 Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List published courses |
| GET | `/courses/:id` | Get course details |
| POST | `/courses` | Create course (admin) |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |

### 13.2 Enrollment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/enrollments` | User's enrollments |
| POST | `/enrollments` | Enroll in course |
| DELETE | `/enrollments/:id` | Unenroll |

### 13.3 Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/:courseId` | Get course progress |
| POST | `/progress/lesson/:id/complete` | Mark lesson complete |

### 13.4 Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes/:lessonId` | Get quiz for lesson |
| POST | `/quizzes/:quizId/submit` | Submit answers |

---

## 14. REAL-TIME SYNC

### 14.1 Progress Sync

- Lesson completion synced immediately
- Course progress percentage recalculated
- AsyncStorage for offline support
- Supabase for persistence

### 14.2 Enrollment Sync

- Shopify webhook grants access
- App polls for new access on focus
- Real-time subscription optional

---

## 15. MOBILE SPECIFICATIONS

### 15.1 Navigation Structure

```
AccountStack
  └── Admin Screens
      ├── AdminDashboard
      └── Course Management
          ├── AdminCourses (CourseListScreen)
          ├── CourseBuilder
          ├── ModuleBuilder
          ├── LessonBuilder
          ├── QuizBuilder
          ├── CourseStudents
          ├── StudentProgress
          ├── CourseAnalytics
          ├── GrantAccess
          └── CoursePreview
```

### 15.2 Key Dependencies

- `react-native-draggable-flatlist`: Module/lesson reordering
- `expo-clipboard`: HTML paste functionality
- `expo-document-picker`: Attachment uploads
- `react-native-webview`: Shopify checkout

---

## APPENDIX

### A. Environment Variables

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Shopify
SHOPIFY_STORE_DOMAIN=xxx.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxx
SHOPIFY_WEBHOOK_SECRET=xxx
```

### B. File Locations Reference

```
# Admin Course Screens
gem-mobile/src/screens/Admin/Courses/CourseListScreen.js
gem-mobile/src/screens/Admin/Courses/CourseBuilderScreen.js
gem-mobile/src/screens/Admin/Courses/ModuleBuilderScreen.js
gem-mobile/src/screens/Admin/Courses/LessonBuilderScreen.js
gem-mobile/src/screens/Admin/Courses/QuizBuilderScreen.js
gem-mobile/src/screens/Admin/Courses/CourseStudentsScreen.js
gem-mobile/src/screens/Admin/Courses/StudentProgressScreen.js
gem-mobile/src/screens/Admin/Courses/CourseAnalyticsScreen.js
gem-mobile/src/screens/Admin/Courses/GrantAccessScreen.js
gem-mobile/src/screens/Admin/Courses/CoursePreviewScreen.js
gem-mobile/src/screens/Admin/Courses/index.js

# Navigation
gem-mobile/src/navigation/AccountStack.js

# Services
gem-mobile/src/services/courseService.js
gem-mobile/src/services/courseAccessService.js
gem-mobile/src/services/progressService.js
gem-mobile/src/services/courseBuilderService.js

# Migrations
supabase/migrations/20251125_courses_CLEAN_START.sql
supabase/migrations/20251129_course_quiz_system.sql
supabase/migrations/20251224_trading_courses_seed.sql

# Backend Functions
supabase/functions/shopify-webhook/index.ts
```

### C. Testing Checklist

- [x] Course list with tier filtering
- [x] Course detail with enrollment button
- [x] Free course enrollment
- [x] Paid course Shopify checkout
- [x] Webhook grants access
- [x] Video lesson player
- [x] Article/HTML lesson display
- [x] Quiz submission and grading
- [x] Certificate generation
- [x] Admin: Create course
- [x] Admin: Add modules
- [x] Admin: Add lessons
- [x] Admin: Build quiz
- [x] Admin: View students
- [x] Admin: View student progress
- [x] Admin: View course analytics
- [x] Admin: Grant/revoke access
- [x] 3 Trading courses seeded

---

**Document Version:** 2.0
**Created:** December 2024
**Last Updated:** December 24, 2024
**Maintained by:** GEM Development Team

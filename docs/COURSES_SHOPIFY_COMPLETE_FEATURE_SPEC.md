# COURSES + SHOPIFY INTEGRATION - COMPLETE FEATURE SPECIFICATION

**Version:** 1.0
**Last Updated:** December 2024
**Platforms:** Web (React), Mobile (React Native), Backend (Supabase + Deno Edge Functions)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [Complete User Flows](#4-complete-user-flows)
5. [Shopify Integration](#5-shopify-integration)
6. [HTML Course Content System](#6-html-course-content-system)
7. [Quiz System](#7-quiz-system)
8. [Certificate System](#8-certificate-system)
9. [UI/UX Components](#9-uiux-components)
10. [Design Tokens & CSS Specifications](#10-design-tokens--css-specifications)
11. [API Endpoints](#11-api-endpoints)
12. [Real-time Sync](#12-real-time-sync)
13. [Mobile Specifications](#13-mobile-specifications)

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
├── screens/Courses/
│   ├── CoursesScreen.js         # Main courses tab
│   ├── CourseDetailScreen.js    # Course details + enrollment
│   ├── LessonPlayerScreen.js    # Video/Article/Quiz player
│   ├── QuizScreen.js            # Full quiz experience
│   ├── CertificateScreen.js     # Certificate display
│   └── CourseCheckout.js        # Shopify WebView checkout
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
    ├── 20251129_course_access_system.sql
    ├── 20251129_course_quiz_system.sql
    ├── 20251130_html_course_content.sql
    ├── 20251209_course_access_via_shopify.sql
    └── 20251209_link_courses_to_shopify.sql
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

  -- Media
  thumbnail_url TEXT,

  -- Stats
  duration_hours INT,
  total_lessons INT,
  rating DECIMAL,
  students_count INT DEFAULT 0,

  -- Instructor
  instructor_name TEXT,
  instructor_avatar TEXT,
  created_by UUID REFERENCES auth.users(id),

  -- Shopify Integration
  shopify_product_id TEXT,           -- Links to Shopify product
  price DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  membership_duration_days INT,       -- null = lifetime

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
  content TEXT,                      -- Raw HTML
  content_html TEXT,                 -- Alternate field
  content_blocks JSONB DEFAULT '[]', -- Structured blocks

  -- HTML Content System
  html_content TEXT,                 -- Teacher's HTML input
  parsed_content JSONB,              -- Parsed structured content
  embedded_quizzes JSONB,            -- Extracted quiz data
  embedded_images JSONB,             -- Image metadata

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
  access_type TEXT DEFAULT 'purchase',  -- 'purchase', 'admin_grant', 'affiliate'
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),

  -- Progress
  progress_percentage INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Shopify Data
  metadata JSONB,  -- { shopify_order_id, order_number, purchase_price }

  -- Expiry
  expires_at TIMESTAMPTZ,  -- null = lifetime access

  UNIQUE(user_id, course_id)
);
```

#### lesson_progress
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'not_started',  -- 'not_started', 'in_progress', 'completed'
  progress_percent INT DEFAULT 0,

  -- Video Progress
  time_spent_seconds INT DEFAULT 0,
  video_position_seconds INT DEFAULT 0,

  -- Completion
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);
```

### 3.2 Quiz System Tables

#### quizzes
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
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
  allow_review BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(lesson_id)
);
```

#### quiz_questions
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

  -- Question Content
  question_text TEXT NOT NULL,
  question_image TEXT,

  -- Type: 'multiple_choice', 'multiple_select', 'true_false', 'fill_blank'
  question_type TEXT DEFAULT 'multiple_choice',

  -- Options: [{ id: 'a', text: 'Option A', is_correct: true/false }]
  options JSONB NOT NULL DEFAULT '[]',

  -- For fill_blank: ['answer1', 'answer2']
  correct_answers JSONB DEFAULT '[]',

  explanation TEXT,
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### quiz_attempts
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,

  attempt_number INT DEFAULT 1,

  -- Answers: { question_id: selected_answer }
  answers JSONB NOT NULL DEFAULT '{}',

  -- Results
  score INT DEFAULT 0,
  max_score INT NOT NULL,
  score_percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,

  -- Timing
  time_spent_seconds INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Graded details
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

  -- Unique certificate number: GEM-{timestamp}-{random}
  certificate_number TEXT UNIQUE,

  issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Version Control Table

#### lesson_versions
```sql
CREATE TABLE lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,

  version_number INT NOT NULL,
  html_content TEXT,
  parsed_content JSONB,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(lesson_id, version_number)
);

-- Auto-create version on update trigger
CREATE OR REPLACE FUNCTION create_lesson_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO lesson_versions (lesson_id, version_number, html_content, parsed_content, created_by)
  SELECT OLD.id,
         COALESCE((SELECT MAX(version_number) FROM lesson_versions WHERE lesson_id = OLD.id), 0) + 1,
         OLD.html_content,
         OLD.parsed_content,
         NEW.last_edited_by;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.5 Shopify Integration Tables

#### shopify_orders
```sql
CREATE TABLE shopify_orders (
  shopify_order_id TEXT PRIMARY KEY,
  order_number TEXT,
  email TEXT,
  user_id UUID REFERENCES auth.users(id),

  total_price DECIMAL,
  product_type TEXT,  -- 'individual_course', 'gems', 'course', 'scanner'
  tier_purchased TEXT,

  financial_status TEXT,  -- 'pending', 'paid', 'processing'
  processed_at TIMESTAMPTZ,

  line_items JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### pending_course_access
```sql
CREATE TABLE pending_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  shopify_order_id TEXT,

  access_type TEXT DEFAULT 'purchase',
  price_paid DECIMAL,

  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_user_id UUID
);
```

---

## 4. COMPLETE USER FLOWS

### 4.1 Flow: Browse & Enroll in Free Course

```
┌─────────────────────────────────────────────────────────────────┐
│ User navigates to /courses                                       │
├─────────────────────────────────────────────────────────────────┤
│ 1. CoursesScreen loads                                          │
│    ├─ courseService.getPublishedCourses()                       │
│    ├─ enrollmentService.getUserEnrollments(userId)              │
│    └─ Display CourseCard grid                                   │
├─────────────────────────────────────────────────────────────────┤
│ 2. User clicks "Bắt đầu học" on FREE course                     │
│    └─ Navigate to /courses/{courseId}                           │
├─────────────────────────────────────────────────────────────────┤
│ 3. CourseDetail loads                                           │
│    ├─ courseService.getCourseDetail(courseId, userId)           │
│    ├─ Check: hasAccess(userTier, course.tier) → true (FREE)     │
│    └─ Display enrollment button                                 │
├─────────────────────────────────────────────────────────────────┤
│ 4. User clicks "Đăng ký miễn phí"                               │
│    ├─ enrollmentService.enroll(userId, courseId)                │
│    ├─ Create course_enrollments record                          │
│    └─ Navigate to /courses/{courseId}/learn/{firstLessonId}     │
├─────────────────────────────────────────────────────────────────┤
│ 5. Lesson loads                                                 │
│    ├─ courseService.getLessonContent(lessonId)                  │
│    ├─ progressService.markLessonStarted()                       │
│    └─ Display lesson content                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Flow: Purchase Paid Course (Shopify)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks course card for PAID course                      │
│    └─ Navigate to /courses/{courseId}                           │
├─────────────────────────────────────────────────────────────────┤
│ 2. CourseDetail shows locked state                              │
│    ├─ hasAccess() → false (requires TIER or payment)            │
│    └─ Display "Mua khóa học" button                             │
├─────────────────────────────────────────────────────────────────┤
│ 3. User clicks "Mua khóa học"                                   │
│    ├─ shopifyService.getProductById(shopify_product_id)         │
│    ├─ shopifyService.createCart([{variantId, qty: 1}])          │
│    ├─ Get cart.checkoutUrl                                      │
│    └─ Navigate to CourseCheckout (WebView)                      │
├─────────────────────────────────────────────────────────────────┤
│ 4. User completes Shopify checkout                              │
│    └─ Shopify sends webhook to /shopify-webhook                 │
├─────────────────────────────────────────────────────────────────┤
│ 5. Webhook Handler processes order                              │
│    ├─ Verify HMAC signature                                     │
│    ├─ Extract product_id from line_items                        │
│    ├─ Query courses WHERE shopify_product_id = product_id       │
│    ├─ Find user by customer email                               │
│    │   ├─ If found: grantCourseAccess()                         │
│    │   └─ If not found: save to pending_course_access           │
│    └─ Return 200 OK                                             │
├─────────────────────────────────────────────────────────────────┤
│ 6. WebView detects thank-you redirect                           │
│    ├─ Navigate back to CourseDetailScreen                       │
│    ├─ Refresh course data                                       │
│    └─ Show "Tiếp tục học" (now enrolled)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Flow: Complete Lesson → Next Lesson

```
┌─────────────────────────────────────────────────────────────────┐
│ VIDEO LESSON                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. User watching video                                          │
│    ├─ onPlaybackStatusUpdate tracks position                    │
│    └─ Auto-mark complete when 90% watched                       │
├─────────────────────────────────────────────────────────────────┤
│ OR User manually marks complete                                 │
│    ├─ progressService.markLessonComplete(userId, courseId, lid) │
│    ├─ Update lesson_progress status = 'completed'               │
│    ├─ Recalculate course_enrollments.progress_percentage        │
│    └─ Show "Bài tiếp theo" navigation                           │
├─────────────────────────────────────────────────────────────────┤
│ 2. User clicks "Bài tiếp theo"                                  │
│    ├─ getNextLesson() → find next lesson in order_index         │
│    └─ Navigate to next lesson                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ARTICLE LESSON                                                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. Display ArticleRenderer with parsed content_blocks           │
│ 2. User scrolls to bottom or clicks "Đánh dấu hoàn thành"       │
│ 3. progressService.markLessonComplete()                         │
│ 4. Navigate to next lesson                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUIZ LESSON                                                     │
├─────────────────────────────────────────────────────────────────┤
│ 1. Display QuizScreen with questions                            │
│ 2. User answers all questions                                   │
│ 3. calculateQuizResults() → score, passed                       │
│ 4. If passed: auto-mark lesson complete                         │
│ 5. Navigate to next lesson                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Flow: Course Completion → Certificate

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User completes final lesson                                  │
│    └─ progress_percentage reaches 100%                          │
├─────────────────────────────────────────────────────────────────┤
│ 2. CourseDetail shows certificate card                          │
│    └─ "Chúc mừng! Bạn đã hoàn thành khóa học"                   │
├─────────────────────────────────────────────────────────────────┤
│ 3. User clicks "Xem chứng chỉ"                                  │
│    └─ Navigate to /courses/{courseId}/certificate               │
├─────────────────────────────────────────────────────────────────┤
│ 4. Certificate auto-generates                                   │
│    ├─ progressService.generateCertificate()                     │
│    ├─ Check progress_percentage >= 100                          │
│    ├─ Create course_certificates record:                        │
│    │   certificate_number: GEM-{timestamp}-{random}             │
│    │   user_name, course_title, instructor_name                 │
│    │   issued_at: NOW()                                         │
│    └─ Return certificate data                                   │
├─────────────────────────────────────────────────────────────────┤
│ 5. CertificateScreen displays                                   │
│    ├─ Fancy certificate template                                │
│    ├─ User name, course title, issue date                       │
│    ├─ Unique certificate number                                 │
│    ├─ Share buttons (Facebook, LinkedIn)                        │
│    └─ Download PDF button                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. SHOPIFY INTEGRATION

### 5.1 Webhook Handler Overview

**File:** `supabase/functions/shopify-webhook/index.ts`

The webhook listens for Shopify events:
- `orders/create` - Order placed (pending)
- `orders/paid` - Payment confirmed
- `orders/updated` - Status changed

### 5.2 Security: HMAC Verification

```typescript
// Webhook signature verification
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

### 5.3 Course Detection Methods

The webhook identifies courses from Shopify orders using three methods:

**Method 1: SKU Pattern Matching**
```javascript
const courseMatch = sku.match(/(?:gem-)?individual-course-(\w+)/i) ||
                    sku.match(/course-id-(\w+)/i);
if (courseMatch) {
  courseId = courseMatch[1];
}
```

**Method 2: Product Properties**
```javascript
// Check line item properties for course_id
const courseIdProp = lineItem.properties?.find(p => p.name === 'course_id');
if (courseIdProp) {
  courseId = courseIdProp.value;
}
```

**Method 3: Database Product ID Lookup**
```javascript
const { data: course } = await supabase
  .from('courses')
  .select('id, title, shopify_product_id')
  .eq('shopify_product_id', productId)
  .single();

if (course) {
  courseId = course.id;
}
```

### 5.4 Access Grant Function

```typescript
async function grantCourseAccess(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  orderData: ShopifyOrder
) {
  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, membership_duration_days')
    .eq('id', courseId)
    .single();

  // Calculate expiry
  const expiresAt = course.membership_duration_days
    ? new Date(Date.now() + course.membership_duration_days * 24 * 60 * 60 * 1000).toISOString()
    : null; // null = lifetime access

  // Check existing enrollment
  const { data: existing } = await supabase
    .from('course_enrollments')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('course_id', course.id)
    .single();

  if (existing) {
    // Extend existing enrollment
    const newExpiry = calculateExtendedExpiry(existing.expires_at, course.membership_duration_days);
    await supabase.from('course_enrollments').update({
      expires_at: newExpiry,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
  } else {
    // Create new enrollment
    await supabase.from('course_enrollments').insert({
      user_id: userId,
      course_id: course.id,
      access_type: 'purchase',
      enrolled_at: new Date().toISOString(),
      expires_at: expiresAt,
      metadata: {
        shopify_order_id: orderData.id.toString(),
        order_number: orderData.order_number,
        purchase_price: orderData.total_price
      }
    });
  }
}
```

### 5.5 Race Condition Prevention

```typescript
// Check if already processed (prevents duplicate grants)
const { data: existingOrder } = await supabase
  .from('shopify_orders')
  .select('processed_at')
  .eq('shopify_order_id', orderIdShopify.toString())
  .single();

if (existingOrder?.processed_at) {
  console.log('Order already processed, skipping');
  return new Response('OK', { status: 200 });
}

// Immediately mark as processing
await supabase.from('shopify_orders').upsert({
  shopify_order_id: orderIdShopify.toString(),
  financial_status: 'processing',
  processed_at: new Date().toISOString()
});
```

### 5.6 Pending Access (User Not Found)

If the customer email doesn't match any user:

```typescript
// Save to pending_course_access
await supabase.from('pending_course_access').insert({
  email: customerEmail,
  course_id: courseId,
  shopify_order_id: orderData.id.toString(),
  access_type: 'purchase',
  price_paid: orderData.total_price,
  purchased_at: new Date().toISOString(),
  applied: false
});

// When user signs up, call this RPC:
SELECT apply_pending_course_access(
  user_id_param := NEW.id,
  user_email_param := NEW.email
);
```

### 5.7 Course-Product Linking

```sql
-- Example: Link courses to Shopify products
UPDATE courses SET shopify_product_id = '8863027921073'
WHERE id = 'course-tier1-trading';

UPDATE courses SET shopify_product_id = '8904651342001'
WHERE id = 'course-7-ngay-khai-mo';
```

### 5.8 Access Validation Function

```sql
CREATE OR REPLACE FUNCTION check_course_access(
  user_id_param UUID,
  course_id_param TEXT
)
RETURNS TABLE (
  has_access BOOLEAN,
  reason TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  course_record RECORD;
  enrollment_record RECORD;
BEGIN
  -- Get course
  SELECT * INTO course_record FROM courses WHERE id = course_id_param;

  -- FREE course = always accessible
  IF course_record.tier_required = 'FREE' THEN
    RETURN QUERY SELECT true, 'free_course', NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check enrollment
  SELECT * INTO enrollment_record
  FROM course_enrollments
  WHERE user_id = user_id_param
    AND course_id = course_id_param
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'purchase_required', NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Check expiry
  IF enrollment_record.expires_at IS NOT NULL
     AND enrollment_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'enrollment_expired', enrollment_record.expires_at;
    RETURN;
  END IF;

  -- Has valid enrollment
  RETURN QUERY SELECT true, 'enrolled', enrollment_record.expires_at;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. HTML COURSE CONTENT SYSTEM

### 6.1 Content Storage

Lessons store HTML content in multiple formats:

| Field | Type | Purpose |
|-------|------|---------|
| `html_content` | TEXT | Raw HTML from teacher |
| `parsed_content` | JSONB | Structured block array |
| `embedded_quizzes` | JSONB | Extracted quiz data |
| `embedded_images` | JSONB | Image metadata |

### 6.2 Supported HTML Tags

#### Standard Elements
- `<h1>` - `<h6>`: Headings
- `<p>`: Paragraphs with inline formatting
- `<ul>`, `<ol>`, `<li>`: Lists
- `<img>`: Standalone images
- `<figure>` + `<figcaption>`: Captioned images
- `<pre><code>`: Code blocks with language attribute
- `<blockquote>`: Quotes with styling classes
- `<table>`, `<tr>`, `<th>`, `<td>`: Tables

#### Custom GEM Tags (Quizzes)
```html
<gem-quiz id="quiz-1" title="Quiz Title" passing-score="70" required="true">
  <gem-question type="single" points="10">
    <gem-prompt>What is 2 + 2?</gem-prompt>
    <gem-option correct="false">3</gem-option>
    <gem-option correct="true">4</gem-option>
    <gem-option correct="false">5</gem-option>
    <gem-explanation>2 + 2 equals 4.</gem-explanation>
  </gem-question>
</gem-quiz>
```

#### Blockquote Styling Classes
```html
<blockquote class="tip">Tip content</blockquote>
<blockquote class="warning">Warning content</blockquote>
<blockquote class="info">Info content</blockquote>
<blockquote class="success">Success content</blockquote>
```

### 6.3 Parser Architecture

#### Frontend Parser (DOMParser)
**File:** `frontend/src/services/htmlLessonParser.js`

Uses native browser DOMParser for accurate HTML parsing:

```javascript
parse(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return {
    blocks: this.parseContentBlocks(doc),
    quizzes: this.parseQuizzes(doc),
    images: this.parseImages(doc),
    metadata: this.extractMetadata(doc)
  };
}
```

#### Mobile Parser (Regex)
**File:** `gem-mobile/src/services/htmlLessonParser.js`

Uses regex patterns (no DOMParser in React Native):

```javascript
parseContentBlocks(html) {
  const blocks = [];

  // Heading regex
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    blocks.push({
      id: `block-${blocks.length}`,
      type: 'heading',
      level: parseInt(match[1]),
      content: this.stripTags(match[2]),
      position: match.index
    });
  }

  // Similar patterns for p, ul, ol, blockquote, pre, figure, img
  // ...

  // Sort by position to maintain order
  return blocks.sort((a, b) => a.position - b.position);
}
```

### 6.4 Parsed Output Structure

```javascript
{
  blocks: [
    {
      id: 'block-0',
      type: 'heading',
      level: 1,
      content: 'Lesson Title',
      html: '<h1>Lesson Title</h1>'
    },
    {
      id: 'block-1',
      type: 'paragraph',
      content: 'This is the first paragraph...',
      html: '<p>This is the first paragraph...</p>'
    },
    {
      id: 'block-2',
      type: 'list',
      ordered: false,
      items: ['Item 1', 'Item 2', 'Item 3'],
      html: '<ul>...</ul>'
    },
    {
      id: 'block-3',
      type: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'Description',
      caption: 'Figure 1: Example image'
    },
    {
      id: 'block-4',
      type: 'code',
      language: 'javascript',
      content: 'const x = 1;',
      html: '<pre><code class="language-javascript">...</code></pre>'
    },
    {
      id: 'block-5',
      type: 'callout',
      style: 'tip',  // tip, warning, info, success
      content: 'Pro tip: ...'
    }
  ],
  quizzes: [
    {
      id: 'quiz-1',
      title: 'Quiz Title',
      passingScore: 70,
      required: true,
      questions: [
        {
          id: 'quiz-1-q0',
          type: 'single',
          points: 10,
          prompt: 'What is 2 + 2?',
          options: [
            { id: 'quiz-1-q0-opt0', text: '3', isCorrect: false },
            { id: 'quiz-1-q0-opt1', text: '4', isCorrect: true },
            { id: 'quiz-1-q0-opt2', text: '5', isCorrect: false }
          ],
          explanation: '2 + 2 equals 4.'
        }
      ]
    }
  ],
  images: [
    { id: 'img-0', src: 'https://...', alt: 'Description', width: null, height: null }
  ],
  metadata: {
    title: 'Lesson Title',  // From first <h1>
    description: 'This is the first paragraph...',  // First 200 chars
    estimatedReadTime: 5  // minutes at 200 words/min
  }
}
```

### 6.5 Validation Methods

```javascript
validate(content) {
  const errors = [];
  const warnings = [];

  // Check for empty quizzes
  content.quizzes.forEach(quiz => {
    quiz.questions.forEach(q => {
      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        errors.push(`Quiz "${quiz.title}" question has no correct answer`);
      }
      if (!q.prompt) {
        errors.push(`Quiz "${quiz.title}" has empty question prompt`);
      }
      if (q.options.length < 2) {
        errors.push(`Quiz "${quiz.title}" question needs at least 2 options`);
      }
    });
  });

  // Check images for alt text
  content.images.forEach(img => {
    if (!img.alt) {
      warnings.push(`Image missing alt text: ${img.src}`);
    }
  });

  // Check for empty content
  if (content.blocks.length === 0 && content.quizzes.length === 0) {
    errors.push('Content is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

getStats(content) {
  return {
    blockCount: content.blocks.length,
    quizCount: content.quizzes.length,
    questionCount: content.quizzes.reduce((sum, q) => sum + q.questions.length, 0),
    imageCount: content.images.length,
    estimatedReadTime: content.metadata.estimatedReadTime
  };
}
```

### 6.6 Version Control

```sql
-- Get lesson with version count
SELECT l.*,
       (SELECT COUNT(*) FROM lesson_versions WHERE lesson_id = l.id) as version_count
FROM course_lessons l
WHERE l.id = $1;

-- Restore specific version
UPDATE course_lessons SET
  html_content = v.html_content,
  parsed_content = v.parsed_content,
  last_edited_at = NOW(),
  last_edited_by = $user_id
FROM lesson_versions v
WHERE course_lessons.id = $lesson_id AND v.id = $version_id;
```

---

## 7. QUIZ SYSTEM

### 7.1 Question Types

| Type | Description | Options Format |
|------|-------------|----------------|
| `multiple_choice` | Single correct answer | `[{id, text, is_correct}]` |
| `multiple_select` | Multiple correct answers | `[{id, text, is_correct}]` |
| `true_false` | True or False | `[{id: 'true', text: 'True'}, {id: 'false', text: 'False'}]` |
| `fill_blank` | Text input answer | `correct_answers: ['answer1', 'answer2']` |

### 7.2 Quiz Flow

```javascript
// Quiz Component State
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState({});
const [quizState, setQuizState] = useState('idle'); // idle, active, completed
const [timeRemaining, setTimeRemaining] = useState(null);

// Answer Selection
const handleAnswer = (questionId, selectedOptionId) => {
  setAnswers(prev => ({
    ...prev,
    [questionId]: selectedOptionId
  }));
};

// Submit Quiz
const submitQuiz = async () => {
  const result = await quizService.submitQuiz(quizId, answers);
  // result = { score, maxScore, percentage, passed, gradedAnswers }

  if (result.passed) {
    await progressService.markLessonComplete(userId, courseId, lessonId);
  }

  setQuizState('completed');
};
```

### 7.3 Grading Logic

```javascript
function gradeQuiz(questions, userAnswers) {
  let score = 0;
  const gradedAnswers = [];

  questions.forEach(q => {
    const userAnswer = userAnswers[q.id];
    let isCorrect = false;

    switch (q.question_type) {
      case 'multiple_choice':
      case 'true_false':
        const correctOption = q.options.find(o => o.is_correct);
        isCorrect = userAnswer === correctOption.id;
        break;

      case 'multiple_select':
        const correctIds = q.options.filter(o => o.is_correct).map(o => o.id);
        const userIds = Array.isArray(userAnswer) ? userAnswer : [];
        isCorrect = correctIds.length === userIds.length &&
                    correctIds.every(id => userIds.includes(id));
        break;

      case 'fill_blank':
        isCorrect = q.correct_answers.some(
          ans => ans.toLowerCase() === userAnswer?.toLowerCase()
        );
        break;
    }

    if (isCorrect) {
      score += q.points;
    }

    gradedAnswers.push({
      questionId: q.id,
      userAnswer,
      isCorrect,
      correctAnswer: q.options?.find(o => o.is_correct)?.id || q.correct_answers,
      explanation: q.explanation
    });
  });

  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= quiz.passing_score,
    gradedAnswers
  };
}
```

### 7.4 Quiz Attempt Storage

```javascript
// Create attempt record
await supabase.from('quiz_attempts').insert({
  user_id: userId,
  quiz_id: quizId,
  lesson_id: lessonId,
  course_id: courseId,
  attempt_number: (previousAttempts + 1),
  answers: userAnswers,
  score: result.score,
  max_score: result.maxScore,
  score_percentage: result.percentage,
  passed: result.passed,
  time_spent_seconds: timeSpent,
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  graded_answers: result.gradedAnswers
});
```

---

## 8. CERTIFICATE SYSTEM

### 8.1 Certificate Generation

```javascript
async function generateCertificate(userId, courseId, userName) {
  // Verify completion
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('progress_percentage')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (enrollment.progress_percentage < 100) {
    throw new Error('Course not completed');
  }

  // Check existing certificate
  const { data: existing } = await supabase
    .from('course_certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return existing;
  }

  // Get course info
  const { data: course } = await supabase
    .from('courses')
    .select('title, instructor_name')
    .eq('id', courseId)
    .single();

  // Generate unique certificate number
  const certificateNumber = `GEM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Create certificate
  const { data: certificate } = await supabase
    .from('course_certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      user_name: userName,
      course_title: course.title,
      instructor_name: course.instructor_name,
      certificate_number: certificateNumber,
      issued_at: new Date().toISOString()
    })
    .select()
    .single();

  return certificate;
}
```

### 8.2 Certificate Verification (Public)

```javascript
async function verifyCertificate(certificateNumber) {
  const { data: certificate } = await supabase
    .from('course_certificates')
    .select('user_name, course_title, instructor_name, issued_at')
    .eq('certificate_number', certificateNumber)
    .single();

  if (!certificate) {
    return { valid: false };
  }

  return {
    valid: true,
    userName: certificate.user_name,
    courseTitle: certificate.course_title,
    instructorName: certificate.instructor_name,
    issuedAt: certificate.issued_at
  };
}
```

### 8.3 Certificate Display Data

```javascript
{
  certificateNumber: "GEM-1702483200000-X7K9M2",
  userName: "Nguyễn Văn A",
  courseTitle: "GEM Trading Academy - Pattern Mastery",
  instructorName: "GEM Team",
  issuedAt: "2024-12-13T12:00:00.000Z",
  // Calculated fields
  issuedDateFormatted: "13/12/2024",
  verifyUrl: "https://gem.vn/verify/GEM-1702483200000-X7K9M2"
}
```

---

## 9. UI/UX COMPONENTS

### 9.1 CourseCard Component

**Props:**
```typescript
interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    tier_required: 'FREE' | 'TIER1' | 'TIER2' | 'TIER3';
    rating: number;
    students_count: number;
    duration_hours: number;
    total_lessons: number;
    price: number;
    instructor: {
      name: string;
      avatar: string;
    };
    progress?: number; // 0-100 if enrolled
  };
  userTier: string;
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
  onClick: () => void;
}
```

**States:**
| State | Description | Visual |
|-------|-------------|--------|
| Default | Normal view | Card with thumbnail, info |
| Hover | Mouse over | Thumbnail zoom 1.1x, gold border |
| Locked | Tier requirement not met | Dark overlay, lock icon |
| Enrolled | User enrolled | Progress bar, "Tiếp tục" button |
| Completed | 100% progress | Checkmark badge, "Xem lại" |

### 9.2 ModuleAccordion Component

**Props:**
```typescript
interface ModuleAccordionProps {
  module: {
    id: string;
    title: string;
    lessons: Lesson[];
  };
  index: number;
  courseId: string;
  isEnrolled: boolean;
  userProgress: LessonProgress[];
  currentLessonId?: string;
  onLessonClick: (lesson: Lesson) => void;
}
```

**Behavior:**
- Click header to expand/collapse
- Shows module number (Module 1, Module 2...)
- Displays lesson count and total duration
- Expanded state shows lesson list
- Active lesson highlighted with cyan

### 9.3 ArticleRenderer Component

**Props:**
```typescript
interface ArticleRendererProps {
  blocks: ContentBlock[];
  onImageClick?: (imageUrl: string) => void;
}
```

**Renders block types:**
- `heading` → `<h1>` - `<h6>` with proper sizing
- `paragraph` → `<p>` with link, bold, italic support
- `list` → `<ul>` or `<ol>` with gold bullet markers
- `image` → Responsive image with lazy loading
- `video` → YouTube embed or HTML5 video
- `code` → Syntax-highlighted code block with copy button
- `callout` → Styled tip/warning/info/success boxes
- `quote` → Blockquote with left border
- `table` → Responsive table
- `steps` → Numbered step list

### 9.4 QuizQuestion Component

**Props:**
```typescript
interface QuizQuestionProps {
  question: {
    id: string;
    question_text: string;
    question_image?: string;
    question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'fill_blank';
    options: Array<{ id: string; text: string }>;
    points: number;
  };
  selectedAnswer: string | string[];
  onAnswer: (questionId: string, answer: string | string[]) => void;
  showResult?: boolean;
  correctAnswer?: string | string[];
}
```

**Question Type UI:**
| Type | UI Element |
|------|------------|
| `multiple_choice` | Radio buttons |
| `multiple_select` | Checkboxes |
| `true_false` | Two large toggle buttons |
| `fill_blank` | Text input field |

### 9.5 QuizResult Component

**Props:**
```typescript
interface QuizResultProps {
  result: {
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    gradedAnswers: GradedAnswer[];
    timeSpent: number;
  };
  onRetry: () => void;
  onContinue: () => void;
  canRetry: boolean;
}
```

**Display:**
- Large score circle with percentage
- Pass/Fail indicator (green/red)
- Correct/Wrong answer count
- Time spent
- Review answers (if allowed)
- Retry button (if attempts remaining)
- Continue button

---

## 10. DESIGN TOKENS & CSS SPECIFICATIONS

### 10.1 Color Palette

```css
:root {
  /* Background Colors */
  --bg-base-dark: #0A0E27;
  --bg-base-mid: #141B3D;
  --bg-base-light: #1E2A5E;
  --bg-gradient: linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #1E2A5E 100%);

  /* Card Backgrounds */
  --bg-card: rgba(30, 42, 94, 0.4);
  --bg-card-hover: rgba(30, 42, 94, 0.6);
  --bg-glass: rgba(15, 16, 48, 0.55);
  --blur-glass: 18px;

  /* Brand Colors */
  --brand-gold: #FFBD59;
  --brand-gold-muted: #D4A574;
  --brand-burgundy: #9C0612;
  --brand-purple: #8B5CF6;
  --brand-pink: #FF6B9D;

  /* Course Theme (Blue Glow) */
  --course-primary: #00D9FF;
  --course-accent: #4A90E2;
  --course-glow: rgba(0, 217, 255, 0.3);
  --course-bg: rgba(0, 180, 216, 0.05);

  /* Course Card */
  --course-card-bg: #1A1B3A;
  --course-card-bg-hover: #222352;
  --course-card-border: rgba(255, 255, 255, 0.08);
  --course-card-border-hover: rgba(255, 189, 89, 0.3);

  /* Tier Colors */
  --tier-free-color: #3AF7A6;
  --tier-free-bg: rgba(58, 247, 166, 0.1);
  --tier1-color: #00F0FF;
  --tier1-bg: rgba(0, 240, 255, 0.1);
  --tier2-color: #6A5BFF;
  --tier2-bg: rgba(106, 91, 255, 0.1);
  --tier3-color: #FFBD59;
  --tier3-bg: rgba(255, 189, 89, 0.1);

  /* Functional Colors */
  --course-success: #3AF7A6;
  --course-error: #FF6B6B;
  --course-warning: #FFB800;
  --course-info: #00F0FF;

  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.85);
  --text-tertiary: rgba(255, 255, 255, 0.70);
  --text-muted: rgba(255, 255, 255, 0.50);
  --text-disabled: rgba(255, 255, 255, 0.35);
}
```

### 10.2 Typography

```css
:root {
  /* Font Families */
  --font-display: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 13px;
  --text-sm: 15px;
  --text-base: 17px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 48px;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### 10.3 Spacing System (4px grid)

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### 10.4 Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 30px;
  --radius-full: 50px;
  --radius-circle: 50%;
}
```

### 10.5 Shadows & Glows

```css
:root {
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.3);

  /* Glows */
  --glow-gold: 0 0 30px rgba(255, 189, 89, 0.5);
  --glow-cyan: 0 0 30px rgba(0, 240, 255, 0.4);
  --glow-purple: 0 0 30px rgba(139, 92, 246, 0.4);
}
```

### 10.6 Transitions & Animations

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;

  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}
```

### 10.7 Component-Specific Styles

#### Course Card
```css
.course-card {
  background: var(--course-card-bg);
  border: 1px solid var(--course-card-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.course-card:hover {
  border-color: var(--course-card-border-hover);
}

.course-card:hover .thumbnail-image {
  transform: scale(1.1);
}

.course-card:hover .course-title {
  color: var(--brand-gold);
}
```

#### Thumbnail
```css
.course-thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
```

#### Progress Bar
```css
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #3AF7A6 0%, #00F0FF 100%);
  box-shadow: 0 0 8px rgba(58, 247, 166, 0.5);
  transition: width 0.5s ease;
}
```

#### Tier Badge
```css
.tier-badge {
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
  backdrop-filter: blur(10px);
}

.tier-badge.free {
  color: var(--tier-free-color);
  background: var(--tier-free-bg);
  border-color: var(--tier-free-color);
}

.tier-badge.tier1 {
  color: var(--tier1-color);
  background: var(--tier1-bg);
  border-color: var(--tier1-color);
}
```

#### Buttons
```css
.btn-continue,
.btn-start {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #000;
  transition: all 0.3s ease;
}

.btn-continue:hover,
.btn-start:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 189, 89, 0.3);
}

.btn-start-quiz {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--course-primary) 0%, #00D4FF 100%);
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 700;
}

.btn-start-quiz:hover {
  box-shadow: 0 8px 24px rgba(0, 240, 255, 0.3);
}
```

#### Module Accordion
```css
.module-header-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--course-card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.module-header-btn:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.module-header-btn.expanded {
  border-color: var(--course-primary);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.module-chevron {
  transition: transform 0.2s ease;
}

.module-chevron.rotated {
  transform: rotate(90deg);
}
```

#### Lesson Item
```css
.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-item:hover:not(.locked) {
  background: rgba(255, 255, 255, 0.05);
}

.lesson-item.active {
  background: rgba(0, 240, 255, 0.1);
}

.lesson-item.active .lesson-title {
  color: var(--course-primary);
}

.lesson-item.completed .lesson-icon {
  color: var(--course-success);
}

.lesson-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Code Block
```css
.article-code {
  margin: 24px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #1E1E2E;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.code-language {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.copy-button {
  padding: 4px 10px;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.code-content code {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  color: #E0E0E0;
}
```

#### Callout
```css
.article-callout {
  display: flex;
  gap: 12px;
  margin: 24px 0;
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid;
}

.article-callout.tip {
  background: rgba(255, 189, 89, 0.1);
  border-color: rgba(255, 189, 89, 0.3);
}

.article-callout.warning {
  background: rgba(255, 184, 0, 0.1);
  border-color: rgba(255, 184, 0, 0.3);
}

.article-callout.info {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
}

.article-callout.success {
  background: rgba(58, 247, 166, 0.1);
  border-color: rgba(58, 247, 166, 0.3);
}
```

### 10.8 Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1400px;
}

/* Mobile: < 768px */
@media (max-width: 767px) {
  .course-info { padding: 14px 16px 16px; }
  .course-title { font-size: 15px; }
  .course-footer { flex-direction: column; }
  .btn-continue, .btn-start { width: 100%; padding: 12px 20px; }

  .learning-sidebar { width: 85%; max-width: 320px; }
  .lesson-wrapper { padding: 12px; }
  .lesson-title-main { font-size: 18px; }
  .article-wrapper { padding: 16px; border-radius: 14px; }
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  .learning-sidebar { position: fixed; z-index: 200; }
  .mobile-sidebar-toggle { display: flex; }
}
```

---

## 11. API ENDPOINTS

### 11.1 Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List published courses |
| GET | `/courses/:id` | Get course details |
| GET | `/courses/:id/lessons/:lessonId` | Get lesson content |
| POST | `/courses` | Create course (admin) |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |

### 11.2 Enrollment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/enrollments` | User's enrollments |
| POST | `/enrollments` | Enroll in course |
| DELETE | `/enrollments/:id` | Unenroll |

### 11.3 Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/:courseId` | Get course progress |
| POST | `/progress/lesson/:lessonId/start` | Mark lesson started |
| POST | `/progress/lesson/:lessonId/complete` | Mark lesson complete |

### 11.4 Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes/:lessonId` | Get quiz for lesson |
| POST | `/quizzes/:quizId/submit` | Submit quiz answers |
| GET | `/quizzes/:quizId/attempts` | Get user's attempts |

### 11.5 Certificate Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/certificates/:courseId` | Generate certificate |
| GET | `/certificates/verify/:number` | Verify certificate (public) |
| GET | `/certificates/user` | Get user's certificates |

---

## 12. REAL-TIME SYNC

### 12.1 Frontend Sync

```javascript
// After enrollment/completion - refetch data
await enrollmentService.enroll(userId, courseId);
await courseService.getCourseDetail(courseId, userId); // Refetch

// Course service cache (5 minutes)
_isCacheValid() {
  return Date.now() - this._lastFetchTime < 5 * 60 * 1000;
}
```

### 12.2 Mobile Sync (AsyncStorage + Supabase)

```javascript
// On lesson complete
await courseService.markLessonComplete(userId, courseId, lessonId);
  // 1. Update AsyncStorage locally
  // 2. Sync to Supabase if online

// On app focus/refresh
await courseContext.refresh();
  // 1. Fetch all courses from Supabase
  // 2. Fetch enrollments
  // 3. Fetch progress
  // 4. Update local state
```

### 12.3 Supabase Realtime (Optional)

```javascript
// Subscribe to progress changes
const subscription = supabase
  .channel('lesson-progress')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'lesson_progress',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update local state
    updateProgress(payload.new);
  })
  .subscribe();
```

---

## 13. MOBILE SPECIFICATIONS

### 13.1 React Native Tokens

```javascript
// gem-mobile/src/utils/tokens.js
export const colors = {
  bgBase: '#0A0E27',
  bgCard: '#1A1B3A',
  bgGlass: 'rgba(15, 16, 48, 0.55)',

  brandGold: '#FFBD59',
  coursePrimary: '#00F0FF',
  courseSuccess: '#3AF7A6',
  courseError: '#FF6B6B',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.85)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  tierFree: '#3AF7A6',
  tier1: '#00F0FF',
  tier2: '#6A5BFF',
  tier3: '#FFBD59',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
};
```

### 13.2 Mobile-Specific Dimensions

```javascript
// Video player
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

// Play/Pause button
const playPauseBtn = {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: 'rgba(255, 189, 89, 0.3)',
};

// Course card thumbnail
const thumbnailHeight = 200;

// Bottom safe area
const BOTTOM_TAB_HEIGHT = 60;
const SAFE_AREA_BOTTOM = Platform.OS === 'ios' ? 34 : 0;
```

### 13.3 Animations (Animated API)

```javascript
// Card entrance animation
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(20)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }),
  ]).start();
}, []);

// Staggered list animation
const stagger = 50; // ms between items
items.forEach((_, index) => {
  Animated.timing(itemAnims[index], {
    toValue: 1,
    duration: 200,
    delay: index * stagger,
    useNativeDriver: true,
  }).start();
});
```

### 13.4 Navigation Structure

```
AppNavigator
  └── MainTabs
      └── CourseStack
          ├── CoursesScreen (tab)
          ├── CourseDetailScreen
          ├── LessonPlayerScreen
          ├── QuizScreen
          ├── CertificateScreen
          └── CourseCheckout (WebView)
```

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
# Frontend
frontend/src/pages/Courses.jsx
frontend/src/pages/CourseDetail.jsx
frontend/src/pages/CourseLearning.jsx
frontend/src/pages/Courses/components/CourseCard.jsx
frontend/src/pages/Courses/components/ArticleRenderer.jsx
frontend/src/services/courseService.js
frontend/src/services/enrollmentService.js
frontend/src/services/progressService.js
frontend/src/services/htmlLessonParser.js

# Mobile
gem-mobile/src/screens/Courses/CoursesScreen.js
gem-mobile/src/screens/Courses/CourseDetailScreen.js
gem-mobile/src/screens/Courses/LessonPlayerScreen.js
gem-mobile/src/screens/Courses/QuizScreen.js
gem-mobile/src/services/courseService.js
gem-mobile/src/services/courseAccessService.js
gem-mobile/src/services/htmlLessonParser.js

# Backend
supabase/functions/shopify-webhook/index.ts
supabase/migrations/20251129_course_access_system.sql
supabase/migrations/20251209_course_access_via_shopify.sql
```

### C. Testing Checklist

- [ ] Free course enrollment
- [ ] Paid course Shopify checkout
- [ ] Webhook receives and processes order
- [ ] Access granted to correct user
- [ ] Pending access for new users
- [ ] Video lesson progress tracking
- [ ] Article lesson completion
- [ ] Quiz submission and grading
- [ ] Certificate generation at 100%
- [ ] Mobile-web progress sync
- [ ] Tier-locked course display
- [ ] Course expiry handling

---

**Document Version:** 1.0
**Created:** December 2024
**Maintained by:** GEM Development Team

# 🚀 SETUP GUIDE - Messages & Image Upload

## ⚠️ CRITICAL STEPS - Run in order!

### **Step 1: Fix Messages RLS Policies**

**Issue**: Can't start conversations due to Row Level Security policies

**Solution**: Run SQL migration

```bash
# Option A: Via Supabase Dashboard
```

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy và paste nội dung từ: `supabase/migrations/20250118_fix_messages_rls.sql`
5. Click **RUN** (Ctrl+Enter)
6. Verify success: Should see "Success. No rows returned"

```bash
# Option B: Via CLI
```

```bash
cd "C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner"
npx supabase db push
```

---

### **Step 2: Create Storage Buckets**

**Purpose**: Enable image uploads for Events, Avatars, and Message Attachments

**Solution**: Run SQL migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy và paste nội dung từ: `supabase/migrations/20250118_create_storage_buckets.sql`
3. Click **RUN**
4. Verify buckets created:
   - Go to **Storage** (left sidebar)
   - Should see 3 buckets:
     - `event-covers` ✅
     - `avatars` ✅
     - `message-attachments` ✅

---

### **Step 3: Verify Tables Exist**

Run this SQL to check:

```sql
-- Check conversations table
SELECT COUNT(*) as conversation_count FROM conversations;

-- Check conversation_participants table
SELECT COUNT(*) as participant_count FROM conversation_participants;

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'conversation_participants');
```

**Expected Result**:
- Both tables should exist
- `rowsecurity` should be `true` for both

---

### **Step 4: Test Messages Feature**

1. **Login** to your app
2. Go to **Messages** page
3. Click **"+"** button (New Chat)
4. Search for a user (type at least 2 characters)
5. Click on user to start conversation
6. **Expected**: Chat panel should appear on the right
7. Try sending a message
8. **Expected**: Message appears immediately

**If it fails:**
- Open **Browser Console** (F12)
- Look for logs starting with 🔵, ✅, or ❌
- Copy all logs and send to me

---

### **Step 5: Test Image Upload**

1. Go to **Events** page
2. Click **"Create Event"**
3. Fill in event details
4. **Cover Image** section:
   - Click the upload zone
   - Select an image (PNG, JPG, GIF, WebP)
   - Max size: 5MB
5. **Expected**:
   - Progress bar shows
   - Image preview appears
   - "X" button to remove
6. Click **"Create Event"**
7. **Expected**:
   - Event created with cover image
   - Image shows on event card

**Test Edit:**
1. Find your event
2. Click **Edit** button (blue pencil icon)
3. Change cover image
4. **Expected**:
   - Old image shows
   - Can upload new image
   - Save updates image

---

## 🔍 TROUBLESHOOTING

### **Issue 1: "Failed to start conversation"**

**Symptoms**: Alert popup when clicking user to chat

**Causes**:
1. RLS policies not applied
2. Tables don't exist
3. User authentication issue

**Fix**:
```sql
-- Check if policies exist
SELECT policyname FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants');

-- Should see policies:
-- - Users can view their conversations
-- - Users can create conversations
-- - Users can update their conversations
-- - Users can view conversation participants
-- - Users can create conversation participants
```

If no policies found → Run Step 1 again

---

### **Issue 2: "Upload failed" for images**

**Symptoms**: Error when uploading image

**Causes**:
1. Storage bucket doesn't exist
2. Storage policies not set
3. File too large (>5MB)
4. Wrong file type

**Fix**:
```sql
-- Check buckets exist
SELECT * FROM storage.buckets
WHERE id IN ('event-covers', 'avatars', 'message-attachments');

-- Check policies
SELECT policyname FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

If no buckets found → Run Step 2 again

---

### **Issue 3: Console errors with "PGRST..."**

**Symptoms**: PostgREST errors in console

**Causes**: Database schema mismatch

**Fix**:
```sql
-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify schema
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('conversations', 'conversation_participants', 'community_events')
ORDER BY table_name, ordinal_position;
```

---

### **Issue 4: Images not showing after upload**

**Symptoms**: Upload succeeds but image doesn't display

**Causes**:
1. Public access not enabled
2. Wrong URL returned
3. CORS issue

**Fix**:

1. Check bucket is public:
```sql
SELECT name, public FROM storage.buckets
WHERE id = 'event-covers';
-- public should be TRUE
```

2. Make bucket public if needed:
```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'event-covers';
```

3. Check CORS settings in Supabase Dashboard:
   - Go to **Settings** → **API**
   - Under **CORS Origins**, make sure your localhost is allowed:
     - `http://localhost:5173`
     - `http://localhost:3000`

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Messages page loads without errors
- [ ] Can search for users
- [ ] Can click user to start conversation
- [ ] Chat panel appears on right
- [ ] Can send messages
- [ ] Messages appear immediately
- [ ] Can see chat history
- [ ] Events create modal has image upload
- [ ] Can drag-drop or click to upload image
- [ ] Image preview shows after upload
- [ ] Can remove uploaded image
- [ ] Event saves with cover image
- [ ] Cover image shows on event card
- [ ] Can edit event and change cover image

---

## 📊 NEW FILES CREATED

```
frontend/
├── src/
│   ├── components/
│   │   └── ImageUpload/
│   │       ├── ImageUpload.jsx       [NEW] Image upload component
│   │       └── ImageUpload.css       [NEW] Upload styles
│   └── utils/
│       └── imageUpload.js            [NEW] Upload utilities

supabase/
└── migrations/
    ├── 20250118_fix_messages_rls.sql         [NEW] Fix RLS policies
    └── 20250118_create_storage_buckets.sql   [NEW] Create storage buckets
```

---

## 🎯 WHAT'S FIXED

### ✅ **Messages Feature**
- Fixed: Can't start conversation
- Fixed: Chat panel not appearing
- Fixed: Display names showing "User"
- Fixed: Missing avatars
- Fixed: No online status indicators
- Added: Comprehensive debug logging

### ✅ **Image Upload Feature**
- Added: File upload component
- Added: Drag & drop support
- Added: Image preview
- Added: Upload progress indicator
- Added: File validation (type, size)
- Added: Supabase Storage integration
- Replaced: URL input → File upload

---

## 🚀 NEXT STEPS (Optional)

If all tests pass, you can implement additional features:

1. **Avatar Upload** (same as cover image)
2. **Emoji Picker** for Messages
3. **Message Read Receipts**
4. **Typing Indicators**
5. **File Attachments** for Messages

Let me know which feature you want next!

---

**Any issues? Send me:**
1. Console logs (F12 → Console tab)
2. Screenshot of error
3. Which step failed

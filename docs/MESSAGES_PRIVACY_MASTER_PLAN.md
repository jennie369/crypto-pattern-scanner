# MESSAGES PRIVACY FEATURES - MASTER PLAN

## MỤC LỤC

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Services Architecture](#services-architecture)
4. [Screens & Components](#screens--components)
5. [Implementation Phases](#implementation-phases)
6. [Edge Cases & Flows](#edge-cases--flows)
7. [Impact Analysis](#impact-analysis)

---

## OVERVIEW

### Features cần implement:

1. **Message Requests (Inbox TikTok-style)**
   - Tin nhắn từ người lạ vào "Tin nhắn chờ" thay vì inbox chính
   - Flow Accept/Decline với preview
   - Call restriction cho người lạ

2. **Privacy Settings**
   - Read receipts toggle (Xác nhận đã đọc)
   - Online status toggle (Trạng thái online)
   - Typing indicator toggle (Đang nhập...)
   - Last seen toggle (Hoạt động lần cuối)

3. **Restrict User (Silent Block)**
   - Tin nhắn từ user bị restrict vào folder riêng
   - Không thông báo
   - User không biết mình bị restrict

4. **Spam Detection**
   - Auto-detect spam patterns
   - Move to spam folder

5. **Advanced Reporting**
   - Enhanced reporting với screenshots
   - Categories chi tiết

---

## DATABASE SCHEMA

### Migration File: `20260127_messages_privacy_features.sql`

```sql
-- =====================================================
-- MESSAGES PRIVACY FEATURES
-- Migration: 20260127
-- =====================================================

-- 1. MESSAGE REQUESTS TABLE
-- Lưu trữ tin nhắn chờ duyệt từ người lạ
CREATE TABLE IF NOT EXISTS public.message_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Chờ duyệt
    'accepted',   -- Đã chấp nhận
    'declined',   -- Đã từ chối
    'blocked'     -- Đã chặn
  )),
  message_preview TEXT,           -- Preview tin nhắn đầu tiên
  messages_count INT DEFAULT 1,   -- Số tin nhắn chờ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,

  UNIQUE(conversation_id, requester_id, recipient_id)
);

-- 2. USER PRIVACY SETTINGS TABLE
-- Lưu trữ cài đặt quyền riêng tư của user
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Messaging Privacy
  allow_message_requests BOOLEAN DEFAULT true,    -- Cho phép nhận tin nhắn chờ
  read_receipts_enabled BOOLEAN DEFAULT true,     -- Hiện xác nhận đã đọc
  typing_indicator_enabled BOOLEAN DEFAULT true,  -- Hiện đang nhập...
  online_status_enabled BOOLEAN DEFAULT true,     -- Hiện trạng thái online
  last_seen_enabled BOOLEAN DEFAULT true,         -- Hiện hoạt động lần cuối

  -- Call Privacy
  allow_calls_from TEXT DEFAULT 'everyone' CHECK (allow_calls_from IN (
    'everyone',       -- Tất cả
    'contacts_only',  -- Chỉ người đã chat
    'nobody'          -- Không ai
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESTRICTED USERS TABLE
-- Lưu trữ users bị restrict (silent block)
CREATE TABLE IF NOT EXISTS public.restricted_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restricter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(restricter_id, restricted_id),
  CONSTRAINT no_self_restrict CHECK (restricter_id != restricted_id)
);

-- 4. MESSAGE SPAM TABLE
-- Lưu trữ tin nhắn bị đánh dấu spam
CREATE TABLE IF NOT EXISTS public.message_spam (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spam_type TEXT NOT NULL CHECK (spam_type IN (
    'auto_detected',  -- Tự động phát hiện
    'user_reported',  -- User báo cáo
    'admin_flagged'   -- Admin đánh dấu
  )),
  spam_reason TEXT,
  confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
  status TEXT DEFAULT 'flagged' CHECK (status IN (
    'flagged',
    'confirmed',
    'dismissed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, reporter_id)
);

-- 5. CONTACTS TABLE (Track đã chat/chưa chat)
-- Lưu trữ danh sách contacts (người đã nhắn tin)
CREATE TABLE IF NOT EXISTS public.user_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',     -- Đang active
    'archived',   -- Đã archive
    'removed'     -- Đã xóa
  )),
  first_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- INDEXES
CREATE INDEX idx_message_requests_recipient ON message_requests(recipient_id);
CREATE INDEX idx_message_requests_status ON message_requests(status);
CREATE INDEX idx_restricted_users_restricter ON restricted_users(restricter_id);
CREATE INDEX idx_restricted_users_restricted ON restricted_users(restricted_id);
CREATE INDEX idx_message_spam_conversation ON message_spam(conversation_id);
CREATE INDEX idx_user_contacts_user ON user_contacts(user_id);

-- RLS POLICIES
ALTER TABLE message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restricted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_spam ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;

-- Message Requests Policies
CREATE POLICY "Users can view their message requests"
  ON message_requests FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = requester_id);

CREATE POLICY "Users can insert message requests"
  ON message_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Recipients can update message requests"
  ON message_requests FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Privacy Settings Policies
CREATE POLICY "Users can view own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
  ON user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Restricted Users Policies
CREATE POLICY "Users can view their restrictions"
  ON restricted_users FOR SELECT
  USING (auth.uid() = restricter_id);

CREATE POLICY "Users can create restrictions"
  ON restricted_users FOR INSERT
  WITH CHECK (auth.uid() = restricter_id);

CREATE POLICY "Users can delete their restrictions"
  ON restricted_users FOR DELETE
  USING (auth.uid() = restricter_id);

-- User Contacts Policies
CREATE POLICY "Users can view own contacts"
  ON user_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts"
  ON user_contacts FOR ALL
  USING (auth.uid() = user_id);
```

### Database Functions:

```sql
-- Check if users are contacts (đã nhắn tin)
CREATE OR REPLACE FUNCTION are_users_contacts(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_contacts
    WHERE (user_id = user_a AND contact_id = user_b AND status = 'active')
       OR (user_id = user_b AND contact_id = user_a AND status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is restricted
CREATE OR REPLACE FUNCTION is_user_restricted(checker_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restricted_users
    WHERE restricter_id = checker_id AND restricted_id = target_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user privacy settings with defaults
CREATE OR REPLACE FUNCTION get_user_privacy_settings(target_user_id UUID)
RETURNS TABLE (
  allow_message_requests BOOLEAN,
  read_receipts_enabled BOOLEAN,
  typing_indicator_enabled BOOLEAN,
  online_status_enabled BOOLEAN,
  last_seen_enabled BOOLEAN,
  allow_calls_from TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ups.allow_message_requests, true),
    COALESCE(ups.read_receipts_enabled, true),
    COALESCE(ups.typing_indicator_enabled, true),
    COALESCE(ups.online_status_enabled, true),
    COALESCE(ups.last_seen_enabled, true),
    COALESCE(ups.allow_calls_from, 'everyone')
  FROM user_privacy_settings ups
  WHERE ups.user_id = target_user_id;

  -- If no settings found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, true, true, true, true, 'everyone'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle new message: check if needs message request
CREATE OR REPLACE FUNCTION handle_new_message_privacy()
RETURNS TRIGGER AS $$
DECLARE
  sender_id UUID;
  recipient_id UUID;
  are_contacts BOOLEAN;
  sender_blocked BOOLEAN;
  sender_restricted BOOLEAN;
  recipient_allows_requests BOOLEAN;
BEGIN
  sender_id := NEW.sender_id;

  -- Get recipient (other participant in conversation)
  SELECT cp.user_id INTO recipient_id
  FROM conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != sender_id
  LIMIT 1;

  IF recipient_id IS NULL THEN
    RETURN NEW; -- Group chat or no recipient
  END IF;

  -- Check if blocked
  SELECT is_user_blocked(sender_id, recipient_id) INTO sender_blocked;
  IF sender_blocked THEN
    RAISE EXCEPTION 'User is blocked';
  END IF;

  -- Check if restricted (silent)
  SELECT is_user_restricted(recipient_id, sender_id) INTO sender_restricted;
  IF sender_restricted THEN
    -- Mark message as restricted (silent delivery)
    NEW.is_restricted := true;
    RETURN NEW;
  END IF;

  -- Check if contacts
  SELECT are_users_contacts(sender_id, recipient_id) INTO are_contacts;

  IF NOT are_contacts THEN
    -- Check if recipient allows message requests
    SELECT allow_message_requests INTO recipient_allows_requests
    FROM user_privacy_settings
    WHERE user_id = recipient_id;

    IF COALESCE(recipient_allows_requests, true) THEN
      -- Create or update message request
      INSERT INTO message_requests (
        conversation_id, requester_id, recipient_id,
        message_preview, messages_count, status
      )
      VALUES (
        NEW.conversation_id, sender_id, recipient_id,
        LEFT(NEW.content, 100), 1, 'pending'
      )
      ON CONFLICT (conversation_id, requester_id, recipient_id)
      DO UPDATE SET
        messages_count = message_requests.messages_count + 1,
        message_preview = CASE
          WHEN message_requests.messages_count < 3
          THEN LEFT(NEW.content, 100)
          ELSE message_requests.message_preview
        END,
        updated_at = NOW();

      -- Mark message as pending request
      NEW.is_message_request := true;
    ELSE
      -- Recipient doesn't allow message requests, silently drop
      RAISE EXCEPTION 'User does not accept message requests';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept message request
CREATE OR REPLACE FUNCTION accept_message_request(p_request_id UUID)
RETURNS void AS $$
DECLARE
  v_conversation_id UUID;
  v_requester_id UUID;
  v_recipient_id UUID;
BEGIN
  -- Get request details
  SELECT conversation_id, requester_id, recipient_id
  INTO v_conversation_id, v_requester_id, v_recipient_id
  FROM message_requests
  WHERE id = p_request_id AND recipient_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message request not found';
  END IF;

  -- Update request status
  UPDATE message_requests
  SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
  WHERE id = p_request_id;

  -- Add to contacts
  INSERT INTO user_contacts (user_id, contact_id)
  VALUES (v_recipient_id, v_requester_id)
  ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active';

  INSERT INTO user_contacts (user_id, contact_id)
  VALUES (v_requester_id, v_recipient_id)
  ON CONFLICT (user_id, contact_id) DO UPDATE SET status = 'active';

  -- Update messages to remove request flag
  UPDATE messages
  SET is_message_request = false
  WHERE conversation_id = v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decline message request
CREATE OR REPLACE FUNCTION decline_message_request(p_request_id UUID, p_block_user BOOLEAN DEFAULT false)
RETURNS void AS $$
DECLARE
  v_requester_id UUID;
  v_conversation_id UUID;
BEGIN
  -- Get request details
  SELECT requester_id, conversation_id
  INTO v_requester_id, v_conversation_id
  FROM message_requests
  WHERE id = p_request_id AND recipient_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message request not found';
  END IF;

  -- Update request status
  UPDATE message_requests
  SET status = CASE WHEN p_block_user THEN 'blocked' ELSE 'declined' END,
      declined_at = NOW(),
      updated_at = NOW()
  WHERE id = p_request_id;

  -- Optionally block user
  IF p_block_user THEN
    INSERT INTO blocked_users (blocker_id, blocked_id, reason)
    VALUES (auth.uid(), v_requester_id, 'Blocked from message request')
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
  END IF;

  -- Delete conversation and messages
  DELETE FROM messages WHERE conversation_id = v_conversation_id;
  DELETE FROM conversation_participants WHERE conversation_id = v_conversation_id;
  DELETE FROM conversations WHERE id = v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get message requests count
CREATE OR REPLACE FUNCTION get_message_requests_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM message_requests
    WHERE recipient_id = p_user_id AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if can call user
CREATE OR REPLACE FUNCTION can_call_user(caller_id UUID, callee_id UUID)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_blocked BOOLEAN;
  v_are_contacts BOOLEAN;
  v_call_setting TEXT;
BEGIN
  -- Check if blocked
  SELECT is_user_blocked(caller_id, callee_id) INTO v_blocked;
  IF v_blocked THEN
    RETURN QUERY SELECT false, 'User is blocked'::TEXT;
    RETURN;
  END IF;

  -- Get callee's call settings
  SELECT allow_calls_from INTO v_call_setting
  FROM user_privacy_settings
  WHERE user_id = callee_id;

  v_call_setting := COALESCE(v_call_setting, 'everyone');

  -- Check based on setting
  IF v_call_setting = 'nobody' THEN
    RETURN QUERY SELECT false, 'User does not accept calls'::TEXT;
    RETURN;
  END IF;

  IF v_call_setting = 'contacts_only' THEN
    SELECT are_users_contacts(caller_id, callee_id) INTO v_are_contacts;
    IF NOT v_are_contacts THEN
      RETURN QUERY SELECT false, 'User only accepts calls from contacts'::TEXT;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Cập nhật bảng messages:

```sql
-- Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_message_request BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false;
```

---

## SERVICES ARCHITECTURE

### 1. messageRequestService.js

```javascript
/**
 * Message Request Service
 * Handles message requests from strangers (TikTok-style inbox)
 */

// Exported Functions:
- getMessageRequests(status = 'pending')     // Lấy danh sách message requests
- getMessageRequestsCount()                   // Đếm số requests pending
- acceptMessageRequest(requestId)             // Chấp nhận request
- declineMessageRequest(requestId, block)     // Từ chối (optional block)
- subscribeToMessageRequests(callback)        // Real-time subscription
- isConversationMessageRequest(conversationId) // Check nếu là request
```

### 2. privacySettingsService.js

```javascript
/**
 * Privacy Settings Service
 * Manages user privacy preferences
 */

// Exported Functions:
- getPrivacySettings()                        // Lấy settings của current user
- updatePrivacySettings(settings)             // Cập nhật settings
- getOtherUserPrivacySettings(userId)         // Lấy settings của user khác (limited)
- shouldShowReadReceipts(userId)              // Check hiện read receipts không
- shouldShowOnlineStatus(userId)              // Check hiện online status không
- shouldShowTypingIndicator(userId)           // Check hiện typing không
- shouldShowLastSeen(userId)                  // Check hiện last seen không
- canCallUser(calleeId)                       // Check có thể gọi không
```

### 3. restrictedUsersService.js

```javascript
/**
 * Restricted Users Service
 * Silent blocking - user doesn't know they're restricted
 */

// Exported Functions:
- getRestrictedUsers()                        // Lấy danh sách restricted
- restrictUser(userId, reason)                // Restrict user
- unrestrictUser(userId)                      // Bỏ restrict
- isUserRestricted(userId)                    // Check restricted
- getRestrictedMessages()                     // Lấy tin nhắn từ restricted users
```

### 4. spamDetectionService.js

```javascript
/**
 * Spam Detection Service
 * Detect and filter spam messages
 */

// Exported Functions:
- detectSpam(message)                         // Check message có spam không
- reportSpam(messageId, reason)               // Report spam
- getSpamMessages()                           // Lấy tin nhắn spam
- dismissSpam(messageId)                      // Đánh dấu không phải spam
```

---

## SCREENS & COMPONENTS

### New Screens:

1. **MessageRequestsScreen.js**
   - Hiển thị danh sách message requests
   - Preview tin nhắn + avatar
   - Buttons: Accept, Decline, Block & Report
   - Empty state

2. **PrivacySettingsScreen.js**
   - Toggle switches cho các privacy settings
   - Tooltips giải thích từng setting
   - Realtime save

3. **RestrictedUsersScreen.js**
   - Danh sách users bị restrict
   - Unrestrict button
   - Info banner

4. **RestrictedMessagesScreen.js**
   - Tin nhắn từ restricted users
   - Option để unrestrict

5. **SpamMessagesScreen.js**
   - Tin nhắn spam
   - Not Spam / Delete options

### New Components:

1. **MessageRequestItem.js** - Item trong list requests
2. **MessageRequestPreview.js** - Preview modal
3. **PrivacyToggle.js** - Toggle switch với tooltip
4. **RestrictedUserItem.js** - Item trong restricted list
5. **MessageRequestBadge.js** - Badge hiển thị số requests

---

## IMPLEMENTATION PHASES

### Phase 1: Database Migrations (1 file)
- [x] Create migration file with all tables
- [x] Add RLS policies
- [x] Create helper functions
- [x] Update messages table

### Phase 2: Core Services (4 files)
- [ ] messageRequestService.js
- [ ] privacySettingsService.js
- [ ] restrictedUsersService.js
- [ ] spamDetectionService.js

### Phase 3: Message Requests Screen (3 files)
- [ ] MessageRequestsScreen.js
- [ ] MessageRequestItem.js
- [ ] MessageRequestPreview.js

### Phase 4: Privacy Settings Screen (2 files)
- [ ] PrivacySettingsScreen.js
- [ ] PrivacyToggle.js

### Phase 5: Integration with Existing Code
- [ ] Update messagingService.js
- [ ] Update callService.js
- [ ] Update ChatScreen.js
- [ ] Update ConversationsListScreen.js

### Phase 6: Restricted & Spam Screens (4 files)
- [ ] RestrictedUsersScreen.js
- [ ] RestrictedMessagesScreen.js
- [ ] SpamMessagesScreen.js
- [ ] Update BlockedUsersScreen.js

### Phase 7: Navigation & Testing
- [ ] Update MessagesStack.js
- [ ] Add navigation links
- [ ] Testing all flows

---

## EDGE CASES & FLOWS

### Message Request Flows:

1. **User A gửi tin nhắn cho User B (chưa từng chat)**
   - Check: B có bật allow_message_requests?
   - Yes: Tin nhắn vào message_requests, B thấy badge
   - No: Tin nhắn bị silent drop

2. **User B accept request**
   - Cả 2 được thêm vào contacts của nhau
   - Tin nhắn chuyển vào inbox chính
   - Notification cho A: "B đã chấp nhận tin nhắn của bạn"

3. **User B decline request**
   - Option: Block luôn?
   - Yes: A bị block, không gửi được nữa
   - No: Conversation bị xóa, A có thể gửi lại

4. **User A gửi tiếp khi request pending**
   - messages_count tăng lên
   - Không tạo request mới
   - Preview update nếu < 3 messages

### Privacy Settings Flows:

5. **User A tắt read_receipts**
   - Người khác không thấy A đã đọc
   - A cũng không thấy người khác đã đọc (reciprocal)

6. **User A tắt online_status**
   - Luôn hiện "offline" với người khác
   - A vẫn thấy online_status của người khác

7. **User A tắt typing_indicator**
   - Người khác không thấy A đang nhập
   - A cũng không thấy người khác đang nhập (reciprocal)

8. **User A set calls = contacts_only**
   - Người lạ không thể gọi
   - Hiện thông báo: "Người này chỉ nhận cuộc gọi từ người đã nhắn tin"

### Restrict User Flows:

9. **User A restrict User B**
   - B không biết
   - Tin nhắn B gửi vào restricted folder
   - Không notification cho A
   - B vẫn thấy "Đã gửi" bình thường

10. **User A unrestrict User B**
    - Tin nhắn trong restricted folder vẫn giữ nguyên
    - Tin nhắn mới vào inbox bình thường

### Call Restriction Flows:

11. **User A (stranger) gọi User B**
    - Check: B có trong message_requests pending?
    - Yes: Hiện "Hãy chấp nhận tin nhắn trước khi gọi"
    - Tin nhắn request có badge "Muốn gọi cho bạn"

12. **User A gọi User B (calls = nobody)**
    - Hiện: "Người này không nhận cuộc gọi"

13. **User A gọi User B (calls = contacts_only, chưa chat)**
    - Hiện: "Hãy nhắn tin trước khi gọi"

### Spam Detection Flows:

14. **Auto-detect spam**
    - Patterns: links nhiều, repeated messages, keywords
    - Confidence score > 0.7: Move to spam
    - Notification: "Tin nhắn này có thể là spam"

15. **User report spam**
    - Move to spam folder
    - Admin review queue
    - Option: Block sender

### Additional Edge Cases:

16. **User bị block gửi tin nhắn**
    - Error: "Không thể gửi tin nhắn"
    - Không tạo message request

17. **User đã accept rồi bị block**
    - Xóa khỏi contacts
    - Tin nhắn cũ vẫn còn nhưng không gửi được

18. **Chuyển từ message request sang accept**
    - Notification cho requester
    - Badge disappear
    - Tin nhắn hiện trong inbox

19. **Group chat với stranger**
    - KHÔNG áp dụng message request cho group
    - Chỉ áp dụng cho 1-1 chat

20. **User A có multiple pending requests từ B**
    - Gộp thành 1 request với messages_count

21. **Call đến khi đang pending request**
    - Reject call với reason
    - Tự động hiện prompt accept request

22. **User A tắt all privacy sau đó bật lại**
    - Không retroactive - chỉ ảnh hưởng từ thời điểm bật

23. **Restricted user gửi nhiều tin**
    - Tất cả vào restricted folder
    - Có badge riêng cho restricted messages

24. **Admin review spam report**
    - Confirm spam: User bị flag
    - Dismiss: Message back to normal

25. **Notification settings vs Privacy**
    - Privacy settings override notification settings
    - Nếu restricted: không notification dù mute = off

---

## IMPACT ANALYSIS

### Files cần sửa:

1. **messagingService.js**
   - Thêm check message request trước khi gửi
   - Thêm check restricted trước khi notify
   - Update getConversations để filter requests

2. **callService.js**
   - Thêm canCallUser check trước initiateCall
   - Hiện error message phù hợp

3. **ChatScreen.js**
   - Hiện banner nếu là message request
   - Accept/Decline buttons
   - Check privacy trước khi hiện typing/read

4. **ConversationsListScreen.js**
   - Thêm Message Requests row với badge
   - Filter out message request conversations

5. **MessagesStack.js**
   - Thêm routes cho new screens

6. **presenceService.js**
   - Check privacy settings trước khi broadcast

7. **BlockedUsersScreen.js**
   - Thêm link đến Restricted Users

### Performance Considerations:

- Cache privacy settings locally
- Batch check contacts status
- Lazy load restricted messages
- Debounce privacy setting updates

### Security Considerations:

- RLS cho tất cả tables mới
- Check auth.uid() trong mọi function
- Validate input trong services
- Rate limit cho message requests

---

## FILES TO CREATE

```
supabase/migrations/
├── 20260127_messages_privacy_features.sql

gem-mobile/src/services/
├── messageRequestService.js
├── privacySettingsService.js
├── restrictedUsersService.js
└── spamDetectionService.js

gem-mobile/src/screens/Messages/
├── MessageRequestsScreen.js
├── PrivacySettingsScreen.js
├── RestrictedUsersScreen.js
├── RestrictedMessagesScreen.js
└── SpamMessagesScreen.js

gem-mobile/src/screens/Messages/components/
├── MessageRequestItem.js
├── MessageRequestPreview.js
├── PrivacyToggle.js
└── RestrictedUserItem.js
```

---

## CHECKLIST

- [ ] Database migration created and tested
- [ ] All services created and exported
- [ ] All screens created with proper UI
- [ ] Navigation updated
- [ ] Integration with existing code
- [ ] Edge cases handled
- [ ] RLS policies working
- [ ] Push notifications integrated
- [ ] Tooltips added
- [ ] Testing completed

-- =====================================================
-- FIX VIETNAMESE DIACRITICS IN NOTIFICATION TRIGGERS
-- January 19, 2026
--
-- Issue: Notifications showing "voi bai viet cua ban" instead of "với bài viết của bạn"
-- Cause: Previous migration had stripped diacritics
-- =====================================================

-- Fix the reaction notification trigger
CREATE OR REPLACE FUNCTION notify_post_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  reactor_name TEXT;
BEGIN
  -- Get post owner
  IF NEW.post_id IS NOT NULL THEN
    SELECT user_id INTO post_owner_id FROM public.forum_posts WHERE id = NEW.post_id;
  ELSIF NEW.seed_post_id IS NOT NULL THEN
    SELECT user_id INTO post_owner_id FROM public.seed_posts WHERE id = NEW.seed_post_id;
  END IF;

  -- Get reactor name
  SELECT COALESCE(full_name, display_name, username, 'Người dùng')
  INTO reactor_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify self or seed users
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Only notify if owner exists in profiles (real user)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = post_owner_id) THEN
    INSERT INTO public.notifications (
      user_id, type, title, body, data, created_at
    ) VALUES (
      post_owner_id,
      'reaction',
      COALESCE(reactor_name, 'Ai đó') || ' đã thả cảm xúc',
      'với bài viết của bạn',
      jsonb_build_object(
        'type', 'reaction',
        'post_id', COALESCE(NEW.post_id, NEW.seed_post_id),
        'reactor_id', NEW.user_id,
        'reaction_type', NEW.reaction_type
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix comment notification trigger
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
  post_title TEXT;
BEGIN
  -- Get post info
  IF NEW.post_id IS NOT NULL THEN
    SELECT user_id, COALESCE(title, SUBSTRING(content, 1, 50))
    INTO post_owner_id, post_title
    FROM public.forum_posts WHERE id = NEW.post_id;
  END IF;

  -- Get commenter name
  SELECT COALESCE(full_name, display_name, username, 'Người dùng')
  INTO commenter_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify self
  IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Create notification with proper Vietnamese
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = post_owner_id) THEN
    INSERT INTO public.notifications (
      user_id, type, title, body, data, created_at
    ) VALUES (
      post_owner_id,
      'comment',
      COALESCE(commenter_name, 'Ai đó') || ' đã bình luận',
      'về bài viết của bạn',
      jsonb_build_object(
        'type', 'comment',
        'post_id', NEW.post_id,
        'comment_id', NEW.id,
        'commenter_id', NEW.user_id
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix follow notification trigger
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower name
  SELECT COALESCE(full_name, display_name, username, 'Người dùng')
  INTO follower_name
  FROM public.profiles WHERE id = NEW.follower_id;

  -- Create notification with proper Vietnamese
  INSERT INTO public.notifications (
    user_id, type, title, body, data, created_at
  ) VALUES (
    NEW.following_id,
    'follow',
    COALESCE(follower_name, 'Ai đó') || ' đã theo dõi bạn',
    'Bạn có người theo dõi mới!',
    jsonb_build_object(
      'type', 'follow',
      'follower_id', NEW.follower_id
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE EXISTING NOTIFICATIONS WITH WRONG ENCODING
-- notifications table uses: body column
-- forum_notifications table uses: message column
-- =====================================================

-- Fix notifications table (has 'body' column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'body'
  ) THEN
    UPDATE public.notifications
    SET body = 'với bài viết của bạn'
    WHERE body = 'voi bai viet cua ban';

    UPDATE public.notifications
    SET title = REPLACE(title, 'da tha cam xuc', 'đã thả cảm xúc')
    WHERE title LIKE '%da tha cam xuc%';

    UPDATE public.notifications
    SET title = REPLACE(title, 'Ai do ', 'Ai đó ')
    WHERE title LIKE '%Ai do %';

    RAISE NOTICE 'Fixed notifications table';
  END IF;
END $$;

-- Fix forum_notifications table (has 'message' column, not 'body')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_notifications' AND column_name = 'message'
  ) THEN
    UPDATE public.forum_notifications
    SET message = 'với bài viết của bạn'
    WHERE message = 'voi bai viet cua ban';

    UPDATE public.forum_notifications
    SET title = REPLACE(title, 'da tha cam xuc', 'đã thả cảm xúc')
    WHERE title LIKE '%da tha cam xuc%';

    UPDATE public.forum_notifications
    SET title = REPLACE(title, 'Ai do ', 'Ai đó ')
    WHERE title LIKE '%Ai do %';

    RAISE NOTICE 'Fixed forum_notifications table';
  END IF;
END $$;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed Vietnamese diacritics in notification triggers!';
END $$;

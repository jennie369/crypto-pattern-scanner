-- =============================================
-- PHASE 1: REACTION SYSTEM
-- Migration: create_post_reactions
-- Date: 2024-12-30
-- =============================================

-- 1. Create post_reactions table
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_reaction_type CHECK (
    reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')
  ),
  CONSTRAINT unique_user_post_reaction UNIQUE(post_id, user_id)
);

-- 2. Add reaction_counts column to forum_posts
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS reaction_counts JSONB
  DEFAULT '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id
  ON public.post_reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id
  ON public.post_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_type
  ON public.post_reactions(reaction_type);

CREATE INDEX IF NOT EXISTS idx_post_reactions_created
  ON public.post_reactions(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone can view reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.post_reactions;
CREATE POLICY "Anyone can view reactions"
  ON public.post_reactions FOR SELECT
  USING (true);

-- Users can insert their own reactions
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.post_reactions;
CREATE POLICY "Users can insert own reactions"
  ON public.post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions
DROP POLICY IF EXISTS "Users can update own reactions" ON public.post_reactions;
CREATE POLICY "Users can update own reactions"
  ON public.post_reactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reactions
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.post_reactions;
CREATE POLICY "Users can delete own reactions"
  ON public.post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create function to update reaction counts
CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  counts JSONB;
  target_post_id UUID;
BEGIN
  -- Get the correct post_id
  target_post_id := COALESCE(NEW.post_id, OLD.post_id);

  -- Calculate new counts
  SELECT jsonb_build_object(
    'like', COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0),
    'love', COALESCE(SUM(CASE WHEN reaction_type = 'love' THEN 1 ELSE 0 END), 0),
    'haha', COALESCE(SUM(CASE WHEN reaction_type = 'haha' THEN 1 ELSE 0 END), 0),
    'wow', COALESCE(SUM(CASE WHEN reaction_type = 'wow' THEN 1 ELSE 0 END), 0),
    'sad', COALESCE(SUM(CASE WHEN reaction_type = 'sad' THEN 1 ELSE 0 END), 0),
    'angry', COALESCE(SUM(CASE WHEN reaction_type = 'angry' THEN 1 ELSE 0 END), 0),
    'total', COUNT(*)
  ) INTO counts
  FROM public.post_reactions
  WHERE post_id = target_post_id;

  -- Handle case when no reactions exist
  IF counts IS NULL THEN
    counts := '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0,"total":0}'::jsonb;
  END IF;

  -- Update forum_posts
  UPDATE public.forum_posts
  SET reaction_counts = counts,
      updated_at = NOW()
  WHERE id = target_post_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create triggers for INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS trigger_update_reaction_counts_insert ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_insert
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

DROP TRIGGER IF EXISTS trigger_update_reaction_counts_update ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_update
  AFTER UPDATE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

DROP TRIGGER IF EXISTS trigger_update_reaction_counts_delete ON public.post_reactions;
CREATE TRIGGER trigger_update_reaction_counts_delete
  AFTER DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reaction_counts();

-- 8. Create notification function for reactions
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  reactor_name TEXT;
  post_preview TEXT;
BEGIN
  -- Get post owner and preview
  SELECT user_id, LEFT(content, 100) INTO post_owner_id, post_preview
  FROM public.forum_posts WHERE id = NEW.post_id;

  -- Get reactor display name
  SELECT display_name INTO reactor_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify self
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    created_at
  ) VALUES (
    post_owner_id,
    'reaction',
    COALESCE(reactor_name, 'Ai đó') || ' đã thả cảm xúc',
    'với bài viết của bạn',
    jsonb_build_object(
      'type', 'reaction',
      'post_id', NEW.post_id,
      'reactor_id', NEW.user_id,
      'reaction_type', NEW.reaction_type
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for notifications
DROP TRIGGER IF EXISTS trigger_notify_post_reaction ON public.post_reactions;
CREATE TRIGGER trigger_notify_post_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_reaction();

-- 10. Migrate existing likes from forum_likes to post_reactions
-- This converts old likes to reaction_type = 'like'
INSERT INTO public.post_reactions (post_id, user_id, reaction_type, created_at)
SELECT post_id, user_id, 'like', created_at
FROM public.forum_likes
WHERE post_id IS NOT NULL
ON CONFLICT (post_id, user_id) DO NOTHING;

-- 11. Create view for reaction details with user info
CREATE OR REPLACE VIEW public.post_reactions_with_users AS
SELECT
  pr.id,
  pr.post_id,
  pr.user_id,
  pr.reaction_type,
  pr.created_at,
  p.display_name,
  p.avatar_url
FROM public.post_reactions pr
LEFT JOIN public.profiles p ON pr.user_id = p.id;

-- 12. Grant permissions on view
GRANT SELECT ON public.post_reactions_with_users TO authenticated;

-- 13. Comments for documentation
COMMENT ON TABLE public.post_reactions IS 'Stores user reactions on forum posts (like, love, haha, wow, sad, angry)';
COMMENT ON COLUMN public.post_reactions.reaction_type IS 'Type of reaction: like, love, haha, wow, sad, angry';
COMMENT ON COLUMN public.forum_posts.reaction_counts IS 'JSONB object with counts per reaction type and total';

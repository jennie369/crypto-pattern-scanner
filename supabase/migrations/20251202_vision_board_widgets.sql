-- Vision Board Widgets Table
-- Created by GEM Master AI for storing user widgets

-- Create the vision_board_widgets table
CREATE TABLE IF NOT EXISTS public.vision_board_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'affirmation', 'goal', 'habit', 'exercise', 'tracker', 'crystal'
    title TEXT NOT NULL,
    icon TEXT,
    content JSONB, -- Stores affirmations array, exercises array, etc.
    explanation TEXT,
    is_active BOOLEAN DEFAULT true,
    streak INTEGER DEFAULT 0,
    last_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_user_id
    ON public.vision_board_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_type
    ON public.vision_board_widgets(type);
CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_active
    ON public.vision_board_widgets(user_id, is_active);

-- Enable RLS
ALTER TABLE public.vision_board_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own widgets
CREATE POLICY "Users can view own vision board widgets"
    ON public.vision_board_widgets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own widgets
CREATE POLICY "Users can insert own vision board widgets"
    ON public.vision_board_widgets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own widgets
CREATE POLICY "Users can update own vision board widgets"
    ON public.vision_board_widgets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own widgets
CREATE POLICY "Users can delete own vision board widgets"
    ON public.vision_board_widgets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_vision_board_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vision_board_widgets_updated_at
    ON public.vision_board_widgets;
CREATE TRIGGER trigger_update_vision_board_widgets_updated_at
    BEFORE UPDATE ON public.vision_board_widgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vision_board_widgets_updated_at();

-- Grant permissions
GRANT ALL ON public.vision_board_widgets TO authenticated;
GRANT SELECT ON public.vision_board_widgets TO anon;

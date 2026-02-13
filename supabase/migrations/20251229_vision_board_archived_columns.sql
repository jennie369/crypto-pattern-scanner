-- Add archived columns to vision_board_widgets table
-- Required for archive functionality in Vision Board

DO $$
BEGIN
    -- Add archived column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vision_board_widgets'
        AND column_name = 'archived'
    ) THEN
        ALTER TABLE public.vision_board_widgets
        ADD COLUMN archived BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Added archived column to vision_board_widgets';
    ELSE
        RAISE NOTICE 'archived column already exists';
    END IF;

    -- Add archived_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vision_board_widgets'
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE public.vision_board_widgets
        ADD COLUMN archived_at TIMESTAMPTZ;

        RAISE NOTICE 'Added archived_at column to vision_board_widgets';
    ELSE
        RAISE NOTICE 'archived_at column already exists';
    END IF;
END $$;

-- Create index for archived widgets (partial index for better performance)
CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_archived
    ON public.vision_board_widgets(user_id, archived)
    WHERE archived = TRUE;

-- Create index for non-archived widgets (active widgets query)
CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_active_not_archived
    ON public.vision_board_widgets(user_id, is_active)
    WHERE archived = FALSE OR archived IS NULL;

-- Add comments
COMMENT ON COLUMN public.vision_board_widgets.archived IS 'Whether widget is archived (hidden from main view)';
COMMENT ON COLUMN public.vision_board_widgets.archived_at IS 'Timestamp when widget was archived';

-- Fix vision_board_widgets schema
-- The table has 'type' column but app code expects 'widget_type'
-- This migration adds widget_type as an alias/copy of type

-- Option 1: Add widget_type column and copy data from type
DO $$
BEGIN
    -- Check if widget_type column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'vision_board_widgets'
        AND column_name = 'widget_type'
    ) THEN
        -- Add widget_type column
        ALTER TABLE public.vision_board_widgets
        ADD COLUMN widget_type TEXT;

        -- Copy existing data from type column
        UPDATE public.vision_board_widgets
        SET widget_type = type
        WHERE widget_type IS NULL;

        -- Make widget_type NOT NULL after copying data
        ALTER TABLE public.vision_board_widgets
        ALTER COLUMN widget_type SET NOT NULL;

        -- Add index for widget_type
        CREATE INDEX IF NOT EXISTS idx_vision_board_widgets_widget_type
            ON public.vision_board_widgets(widget_type);

        RAISE NOTICE 'Added widget_type column to vision_board_widgets';
    ELSE
        RAISE NOTICE 'widget_type column already exists';
    END IF;
END $$;

-- Create trigger to keep type and widget_type in sync
CREATE OR REPLACE FUNCTION public.sync_vision_board_widget_type()
RETURNS TRIGGER AS $$
BEGIN
    -- If widget_type is set but type is not, copy to type
    IF NEW.widget_type IS NOT NULL AND NEW.type IS NULL THEN
        NEW.type = NEW.widget_type;
    -- If type is set but widget_type is not, copy to widget_type
    ELSIF NEW.type IS NOT NULL AND NEW.widget_type IS NULL THEN
        NEW.widget_type = NEW.type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_vision_board_widget_type
    ON public.vision_board_widgets;
CREATE TRIGGER trigger_sync_vision_board_widget_type
    BEFORE INSERT OR UPDATE ON public.vision_board_widgets
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_vision_board_widget_type();

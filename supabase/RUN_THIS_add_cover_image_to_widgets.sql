-- Add cover_image column to vision_board_widgets table
-- For legacy goal widgets that store cover images

ALTER TABLE vision_board_widgets
ADD COLUMN IF NOT EXISTS cover_image TEXT;

COMMENT ON COLUMN vision_board_widgets.cover_image IS 'Cover image URL for goal widgets';

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vision_board_widgets'
AND column_name = 'cover_image';

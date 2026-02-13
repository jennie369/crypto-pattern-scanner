-- Fix pending order status constraint
-- Add TRIGGERED_PENDING and REJECTED statuses

-- Drop existing constraint and add new one with all statuses
ALTER TABLE paper_pending_orders DROP CONSTRAINT IF EXISTS paper_pending_orders_status_check;

ALTER TABLE paper_pending_orders
ADD CONSTRAINT paper_pending_orders_status_check
CHECK (status IN ('PENDING', 'TRIGGERED', 'TRIGGERED_PENDING', 'FILLED', 'CANCELLED', 'EXPIRED', 'FAILED', 'REJECTED'));

-- Add filled_price and filled_quantity columns if not exist
ALTER TABLE paper_pending_orders ADD COLUMN IF NOT EXISTS filled_price DECIMAL(20, 8) NULL;
ALTER TABLE paper_pending_orders ADD COLUMN IF NOT EXISTS filled_quantity DECIMAL(20, 8) NULL;
ALTER TABLE paper_pending_orders ADD COLUMN IF NOT EXISTS position_id UUID NULL;

COMMENT ON COLUMN paper_pending_orders.status IS 'PENDING: waiting, TRIGGERED: stop hit, TRIGGERED_PENDING: stop hit but limit not met, FILLED: executed, CANCELLED: user cancelled, EXPIRED: TTL expired, FAILED: execution failed, REJECTED: order rejected';

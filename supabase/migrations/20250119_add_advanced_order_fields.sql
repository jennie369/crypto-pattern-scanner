-- ========================================
-- Migration: Add Advanced Order Fields for Paper Trading
-- Date: 2025-01-19
-- Phase: 02 - Database Schema & Backend Updates
-- ========================================
--
-- This migration adds support for:
-- - Order types (Market, Limit, Stop-Limit)
-- - Take Profit / Stop Loss prices
-- - Time in Force (GTC, IOC, FOK)
-- - Reduce-Only orders
-- - Linked TP/SL orders with parent relationship
-- ========================================

-- Add new columns to paper_trading_orders
ALTER TABLE paper_trading_orders
ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'market',
ADD COLUMN IF NOT EXISTS limit_price DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS stop_price DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS time_in_force VARCHAR(10) DEFAULT 'GTC',
ADD COLUMN IF NOT EXISTS reduce_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS take_profit_price DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS stop_loss_price DECIMAL(20,8),
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES paper_trading_orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS linked_order_type VARCHAR(10);

-- Add index for parent_order_id (for TP/SL lookups)
CREATE INDEX IF NOT EXISTS idx_paper_orders_parent
ON paper_trading_orders(parent_order_id)
WHERE parent_order_id IS NOT NULL;

-- Add index for order_type
CREATE INDEX IF NOT EXISTS idx_paper_orders_type
ON paper_trading_orders(order_type);

-- Add index for status + order_type (for pending orders)
CREATE INDEX IF NOT EXISTS idx_paper_orders_status_type
ON paper_trading_orders(status, order_type)
WHERE status = 'pending';

-- Add index for user_id + status (for monitoring user's pending orders)
CREATE INDEX IF NOT EXISTS idx_paper_orders_user_status
ON paper_trading_orders(user_id, status)
WHERE status = 'pending';

-- Create enum type for order_type (optional, for type safety)
DO $$ BEGIN
  CREATE TYPE order_type_enum AS ENUM ('market', 'limit', 'stop-limit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum type for time_in_force
DO $$ BEGIN
  CREATE TYPE tif_enum AS ENUM ('GTC', 'IOC', 'FOK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum type for linked_order_type
DO $$ BEGIN
  CREATE TYPE linked_order_enum AS ENUM ('TP', 'SL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN paper_trading_orders.order_type IS 'Order type: market (immediate), limit (at specific price), stop-limit (triggered at stop price)';
COMMENT ON COLUMN paper_trading_orders.limit_price IS 'Target price for limit orders - order executes at this price or better';
COMMENT ON COLUMN paper_trading_orders.stop_price IS 'Trigger price for stop-limit orders - when market hits this, limit order is placed';
COMMENT ON COLUMN paper_trading_orders.time_in_force IS 'Time in force: GTC (Good Till Cancelled), IOC (Immediate or Cancel), FOK (Fill or Kill)';
COMMENT ON COLUMN paper_trading_orders.reduce_only IS 'If true, order will only reduce existing position (cannot open new position)';
COMMENT ON COLUMN paper_trading_orders.take_profit_price IS 'Take profit target price - automatically sell when profit target reached';
COMMENT ON COLUMN paper_trading_orders.stop_loss_price IS 'Stop loss trigger price - automatically sell when loss limit reached';
COMMENT ON COLUMN paper_trading_orders.parent_order_id IS 'Parent order ID for TP/SL orders - links child orders to parent position';
COMMENT ON COLUMN paper_trading_orders.linked_order_type IS 'TP (Take Profit) or SL (Stop Loss) - indicates type of linked order';

-- Add reserved_balance column to paper_trading_accounts (for pending orders)
ALTER TABLE paper_trading_accounts
ADD COLUMN IF NOT EXISTS reserved_balance DECIMAL(20,2) DEFAULT 0;

COMMENT ON COLUMN paper_trading_accounts.reserved_balance IS 'Balance reserved for pending limit/stop-limit orders';

-- Verify migration success
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'paper_trading_orders'
  AND column_name IN (
    'order_type', 'limit_price', 'stop_price',
    'time_in_force', 'reduce_only',
    'take_profit_price', 'stop_loss_price',
    'parent_order_id', 'linked_order_type'
  );

  IF column_count = 9 THEN
    RAISE NOTICE '✅ Migration successful: All 9 columns added to paper_trading_orders';
  ELSE
    RAISE WARNING '⚠️  Migration incomplete: Only % of 9 columns found', column_count;
  END IF;
END $$;

-- Migration complete

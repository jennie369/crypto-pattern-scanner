/**
 * Gemral - Paper Trade Monitor Cron
 * Server-side price monitoring for TP/SL/Liquidation
 * Runs every minute via pg_cron to check positions even when app is closed
 *
 * Deploy: supabase functions deploy paper-trade-monitor-cron
 * Setup cron: See RUN_THIS_setup_paper_trade_cron.sql
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Binance Futures API base URL
const BINANCE_API = 'https://fapi.binance.com';

interface Position {
  id: string;
  user_id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  quantity: number;
  margin: number;
  leverage: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  position_value: number;
}

interface PriceData {
  [symbol: string]: number;
}

// ═══════════════════════════════════════════════════════════
// BINANCE PRICE FETCHER
// ═══════════════════════════════════════════════════════════

async function fetchBinancePrices(symbols: string[]): Promise<PriceData> {
  const prices: PriceData = {};

  if (symbols.length === 0) return prices;

  try {
    // Use ticker/price endpoint for multiple symbols
    const response = await fetch(`${BINANCE_API}/fapi/v1/ticker/price`);

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter only requested symbols
    const symbolSet = new Set(symbols.map(s => s.toUpperCase()));

    for (const item of data) {
      if (symbolSet.has(item.symbol)) {
        prices[item.symbol] = parseFloat(item.price);
      }
    }

    return prices;
  } catch (error) {
    console.error('[Monitor] Binance price fetch error:', error);
    return prices;
  }
}

// ═══════════════════════════════════════════════════════════
// LIQUIDATION PRICE CALCULATOR
// ═══════════════════════════════════════════════════════════

function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: 'LONG' | 'SHORT',
  positionValue: number
): number {
  // Simplified liquidation calculation
  // Real formula varies by exchange, this is approximate
  const maintenanceMarginRate = 0.004; // 0.4%
  const margin = positionValue / leverage;

  if (direction === 'LONG') {
    // Long liquidation: Entry * (1 - 1/leverage + maintenance margin rate)
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    // Short liquidation: Entry * (1 + 1/leverage - maintenance margin rate)
    return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
}

// ═══════════════════════════════════════════════════════════
// POSITION CLOSER
// ═══════════════════════════════════════════════════════════

async function closePosition(
  supabase: any,
  position: Position,
  closePrice: number,
  closeType: 'TAKE_PROFIT' | 'STOP_LOSS' | 'LIQUIDATION'
): Promise<{ success: boolean; pnl: number }> {
  try {
    const isLong = position.direction === 'LONG';
    const priceDiff = isLong
      ? closePrice - position.entry_price
      : position.entry_price - closePrice;

    const pnl = priceDiff * position.quantity;
    const roe = (pnl / position.margin) * 100;

    // Phase 10 Fix D: Atomic close — only close if still OPEN (prevents duplicate close + notification)
    const { data: updated, error: updateError } = await supabase
      .from('paper_trades')
      .update({
        status: 'CLOSED',
        exit_price: closePrice,
        exit_reason: closeType,
        realized_pnl: pnl,
        realized_pnl_percent: roe,
        result: pnl >= 0 ? 'WIN' : 'LOSS',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', position.id)
      .eq('status', 'OPEN')
      .select('id');

    if (updateError) {
      console.error('[Monitor] Close position error:', updateError);
      return { success: false, pnl: 0 };
    }

    // If no rows updated, position was already closed (by client or previous cron run)
    if (!updated || updated.length === 0) {
      console.log(`[Monitor] Position already closed (skipping): ${position.symbol}`);
      return { success: false, pnl: 0 };
    }

    console.log(`[Monitor] Position closed: ${position.symbol} ${closeType} PnL: ${pnl.toFixed(2)}`);

    return { success: true, pnl };
  } catch (error) {
    console.error('[Monitor] Close position exception:', error);
    return { success: false, pnl: 0 };
  }
}

// ═══════════════════════════════════════════════════════════
// PUSH NOTIFICATION SENDER
// ═══════════════════════════════════════════════════════════

async function sendPushNotification(
  supabase: any,
  userId: string,
  type: string,
  position: Position,
  pnl: number,
  closePrice: number
): Promise<void> {
  try {
    const roe = (pnl / position.margin) * 100;
    const pnlFormatted = pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
    const roeFormatted = roe >= 0 ? `+${roe.toFixed(1)}%` : `${roe.toFixed(1)}%`;

    let title: string;
    let body: string;

    switch (type) {
      case 'tp_hit':
        title = 'Chốt lời thành công!';
        body = `${position.symbol}: ${pnlFormatted} USDT (${roeFormatted} ROI)`;
        break;
      case 'sl_hit':
        title = 'Cắt lỗ đã kích hoạt';
        body = `${position.symbol}: ${pnlFormatted} USDT (${roeFormatted} ROI)`;
        break;
      case 'liquidation':
        title = 'Vị thế đã bị thanh lý!';
        body = `${position.symbol}: Thanh lý @ ${closePrice.toFixed(4)} - Lỗ: ${pnlFormatted} USDT`;
        break;
      default:
        return;
    }

    // Call send-paper-trade-push Edge Function
    await supabase.functions.invoke('send-paper-trade-push', {
      body: {
        userId,
        type,
        title,
        body,
        data: {
          positionId: position.id,
          symbol: position.symbol,
          pnl,
          roe,
          closePrice,
        },
      },
    });

    console.log(`[Monitor] Push sent to user ${userId}: ${type}`);
  } catch (error) {
    console.error('[Monitor] Push notification error:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Initialize Supabase with service role (bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all open positions from paper_trades table
    const { data: positions, error: fetchError } = await supabase
      .from('paper_trades')
      .select('*')
      .eq('status', 'OPEN')
      .not('stop_loss', 'is', null)
      .not('take_profit', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch positions: ${fetchError.message}`);
    }

    if (!positions || positions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No open positions', checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Monitor] Checking ${positions.length} open positions`);

    // Get unique symbols
    const symbols = [...new Set(positions.map((p: Position) => p.symbol))];

    // Fetch current prices from Binance
    const prices = await fetchBinancePrices(symbols);

    if (Object.keys(prices).length === 0) {
      console.warn('[Monitor] No prices fetched from Binance');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch prices' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Monitor] Fetched prices for ${Object.keys(prices).length} symbols`);

    // Check each position
    let closedCount = 0;
    const closedPositions: string[] = [];

    for (const position of positions as Position[]) {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) {
        console.warn(`[Monitor] No price for ${position.symbol}`);
        continue;
      }

      const isLong = position.direction === 'LONG';

      // Check Stop Loss
      const hitStopLoss = isLong
        ? currentPrice <= position.stop_loss
        : currentPrice >= position.stop_loss;

      if (hitStopLoss) {
        const { success, pnl } = await closePosition(
          supabase,
          position,
          position.stop_loss,
          'STOP_LOSS'
        );

        if (success) {
          closedCount++;
          closedPositions.push(`${position.symbol} SL`);

          // Send push notification
          await sendPushNotification(
            supabase,
            position.user_id,
            'sl_hit',
            position,
            pnl,
            position.stop_loss
          );
        }
        continue;
      }

      // Check Take Profit
      const hitTakeProfit = isLong
        ? currentPrice >= position.take_profit
        : currentPrice <= position.take_profit;

      if (hitTakeProfit) {
        const { success, pnl } = await closePosition(
          supabase,
          position,
          position.take_profit,
          'TAKE_PROFIT'
        );

        if (success) {
          closedCount++;
          closedPositions.push(`${position.symbol} TP`);

          // Send push notification
          await sendPushNotification(
            supabase,
            position.user_id,
            'tp_hit',
            position,
            pnl,
            position.take_profit
          );
        }
        continue;
      }

      // Check Liquidation
      const leverage = position.leverage || 1;
      const positionValue = position.position_size * leverage;
      const liquidationPrice = calculateLiquidationPrice(
        position.entry_price,
        leverage,
        position.direction,
        positionValue
      );

      const hitLiquidation = isLong
        ? currentPrice <= liquidationPrice
        : currentPrice >= liquidationPrice;

      if (hitLiquidation) {
        const { success, pnl } = await closePosition(
          supabase,
          position,
          liquidationPrice,
          'LIQUIDATION'
        );

        if (success) {
          closedCount++;
          closedPositions.push(`${position.symbol} LIQ`);

          // Send push notification
          await sendPushNotification(
            supabase,
            position.user_id,
            'liquidation',
            position,
            pnl,
            liquidationPrice
          );
        }
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[Monitor] Complete: ${closedCount} closed in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: positions.length,
        closed: closedCount,
        closedPositions,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Monitor] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

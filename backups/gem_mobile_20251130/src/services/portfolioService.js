/**
 * Portfolio Service
 * Manage user's crypto portfolio with real-time prices from Binance
 */

import { supabase } from './supabase';
import { binanceService } from './binanceService';

class PortfolioService {
  /**
   * Get user's portfolio with current prices
   */
  async getUserPortfolio(userId) {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Get unique symbols
      const symbols = [...new Set(data.map(item => item.symbol))];

      // Get current prices from Binance
      const prices = await this.getCurrentPrices(symbols);

      // Calculate P&L for each item
      return data.map(item => {
        const currentPrice = prices[item.symbol] || 0;
        const totalValue = item.quantity * currentPrice;
        const costBasis = item.quantity * item.avg_buy_price;
        const pnl = totalValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        return {
          ...item,
          currentPrice,
          totalValue,
          costBasis,
          pnl,
          pnlPercent,
        };
      });
    } catch (error) {
      console.error('[Portfolio] getUserPortfolio error:', error);
      return [];
    }
  }

  /**
   * Get current prices from Binance
   */
  async getCurrentPrices(symbols) {
    const prices = {};

    try {
      // Fetch all tickers at once
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      const tickers = await response.json();

      // Create a map for faster lookup
      const tickerMap = {};
      tickers.forEach(t => {
        tickerMap[t.symbol] = parseFloat(t.price);
      });

      // Get prices for our symbols
      symbols.forEach(symbol => {
        const pair = `${symbol.toUpperCase()}USDT`;
        if (tickerMap[pair]) {
          prices[symbol] = tickerMap[pair];
        }
      });

      return prices;
    } catch (error) {
      console.error('[Portfolio] getCurrentPrices error:', error);
      return prices;
    }
  }

  /**
   * Add a coin to portfolio
   */
  async addCoin(userId, symbol, quantity, avgBuyPrice, notes = '') {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          quantity: parseFloat(quantity),
          avg_buy_price: parseFloat(avgBuyPrice),
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Portfolio] addCoin error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a coin in portfolio
   */
  async updateCoin(id, updates) {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[Portfolio] updateCoin error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a coin from portfolio
   */
  async deleteCoin(id) {
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[Portfolio] deleteCoin error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get portfolio summary
   */
  async getPortfolioSummary(userId) {
    try {
      const portfolio = await this.getUserPortfolio(userId);

      const summary = {
        totalValue: 0,
        totalCostBasis: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        itemCount: portfolio.length,
        topGainer: null,
        topLoser: null,
      };

      if (portfolio.length === 0) return summary;

      portfolio.forEach(item => {
        summary.totalValue += item.totalValue;
        summary.totalCostBasis += item.costBasis;
        summary.totalPnl += item.pnl;

        if (!summary.topGainer || item.pnlPercent > summary.topGainer.pnlPercent) {
          summary.topGainer = item;
        }
        if (!summary.topLoser || item.pnlPercent < summary.topLoser.pnlPercent) {
          summary.topLoser = item;
        }
      });

      summary.totalPnlPercent = summary.totalCostBasis > 0
        ? (summary.totalPnl / summary.totalCostBasis) * 100
        : 0;

      return summary;
    } catch (error) {
      console.error('[Portfolio] getPortfolioSummary error:', error);
      return null;
    }
  }

  /**
   * Search for a coin symbol (validate it exists on Binance)
   */
  async searchCoin(query) {
    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data = await response.json();

      const usdtPairs = data.symbols.filter(s =>
        s.quoteAsset === 'USDT' &&
        s.status === 'TRADING' &&
        s.baseAsset.toLowerCase().includes(query.toLowerCase())
      );

      return usdtPairs.slice(0, 20).map(s => ({
        symbol: s.baseAsset,
        pair: s.symbol,
        name: s.baseAsset,
      }));
    } catch (error) {
      console.error('[Portfolio] searchCoin error:', error);
      return [];
    }
  }
}

export const portfolioService = new PortfolioService();
export default portfolioService;

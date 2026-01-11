/**
 * GEM Scanner - Chart Preferences Service
 * Manages user preferences for chart display (order lines, colors, etc.)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEY = 'gem_chart_preferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  // Order Lines Visibility
  showEntryLines: true,
  showTPLines: true,
  showSLLines: true,
  showLiquidationLines: true,
  showPendingOrders: true,

  // Line Colors
  entryLineColor: '#FFBD59',    // Gold
  tpLineColor: '#22C55E',       // Green
  slLineColor: '#EF4444',       // Red
  liquidationLineColor: '#A855F7', // Purple
  pendingLineColor: '#00F0FF',  // Cyan

  // Line Styles (0=Solid, 1=Dashed, 2=Dotted)
  entryLineStyle: 0,
  tpLineStyle: 1,
  slLineStyle: 1,
  liquidationLineStyle: 2,
  pendingLineStyle: 2,

  // Line Width
  lineWidth: 1,

  // Label Display
  showPnlOnLines: true,
  showPercentOnLines: true,

  // Other Chart Preferences
  showVolume: false,
  showPriceLines: true,
  defaultTimeframe: '4h',
};

class ChartPreferencesService {
  constructor() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.initialized = false;
    this.userId = null;
  }

  /**
   * Initialize service and load preferences
   */
  async init(userId = null) {
    if (this.initialized && this.userId === userId) return this.preferences;

    this.userId = userId;

    try {
      // First try to load from local storage (faster)
      const localPrefs = await this.loadFromLocal();
      if (localPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...localPrefs };
      }

      // Then sync with Supabase if user is logged in
      if (userId) {
        await this.syncWithSupabase(userId);
      }

      this.initialized = true;
      return this.preferences;
    } catch (error) {
      console.error('[ChartPreferences] Init error:', error);
      return this.preferences;
    }
  }

  /**
   * Load preferences from local storage
   */
  async loadFromLocal() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('[ChartPreferences] Local load error:', error);
      return null;
    }
  }

  /**
   * Save preferences to local storage
   */
  async saveToLocal() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('[ChartPreferences] Local save error:', error);
    }
  }

  /**
   * Sync preferences with Supabase
   */
  async syncWithSupabase(userId) {
    try {
      // Get preferences from Supabase using the RPC function
      const { data, error } = await supabase
        .rpc('get_or_create_chart_preferences', { p_user_id: userId });

      if (error) {
        console.warn('[ChartPreferences] Supabase RPC error, using local:', error.message);
        return;
      }

      if (data) {
        // Map database columns to our preference keys
        const dbPrefs = {
          showEntryLines: data.show_entry_lines,
          showTPLines: data.show_tp_lines,
          showSLLines: data.show_sl_lines,
          showLiquidationLines: data.show_liquidation_lines,
          showPendingOrders: data.show_pending_orders,
          entryLineColor: data.entry_line_color,
          tpLineColor: data.tp_line_color,
          slLineColor: data.sl_line_color,
          liquidationLineColor: data.liquidation_line_color,
          pendingLineColor: data.pending_line_color,
          lineWidth: data.line_width,
          showPnlOnLines: data.show_pnl_on_lines,
          showPercentOnLines: data.show_percent_on_lines,
          showVolume: data.show_volume,
          showPriceLines: data.show_price_lines,
          defaultTimeframe: data.default_timeframe,
        };

        this.preferences = { ...DEFAULT_PREFERENCES, ...dbPrefs };
        await this.saveToLocal();
      }
    } catch (error) {
      console.error('[ChartPreferences] Supabase sync error:', error);
    }
  }

  /**
   * Get current preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Update a single preference
   */
  async updatePreference(key, value) {
    return this.updatePreferences({ [key]: value });
  }

  /**
   * Update multiple preferences
   */
  async updatePreferences(updates) {
    try {
      // Update local state
      this.preferences = { ...this.preferences, ...updates };

      // Save to local storage
      await this.saveToLocal();

      // Save to Supabase if user is logged in
      if (this.userId) {
        await this.saveToSupabase(this.userId, updates);
      }

      return this.preferences;
    } catch (error) {
      console.error('[ChartPreferences] Update error:', error);
      return this.preferences;
    }
  }

  /**
   * Save preferences to Supabase
   */
  async saveToSupabase(userId, updates) {
    try {
      // Map our preference keys to database columns
      const dbUpdates = {};

      const keyMapping = {
        showEntryLines: 'show_entry_lines',
        showTPLines: 'show_tp_lines',
        showSLLines: 'show_sl_lines',
        showLiquidationLines: 'show_liquidation_lines',
        showPendingOrders: 'show_pending_orders',
        entryLineColor: 'entry_line_color',
        tpLineColor: 'tp_line_color',
        slLineColor: 'sl_line_color',
        liquidationLineColor: 'liquidation_line_color',
        pendingLineColor: 'pending_line_color',
        lineWidth: 'line_width',
        showPnlOnLines: 'show_pnl_on_lines',
        showPercentOnLines: 'show_percent_on_lines',
        showVolume: 'show_volume',
        showPriceLines: 'show_price_lines',
        defaultTimeframe: 'default_timeframe',
      };

      for (const [key, value] of Object.entries(updates)) {
        if (keyMapping[key]) {
          dbUpdates[keyMapping[key]] = value;
        }
      }

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_chart_preferences')
        .upsert({
          user_id: userId,
          ...dbUpdates,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.warn('[ChartPreferences] Supabase save error:', error.message);
      }
    } catch (error) {
      console.error('[ChartPreferences] Supabase save error:', error);
    }
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    await this.saveToLocal();

    if (this.userId) {
      await this.saveToSupabase(this.userId, DEFAULT_PREFERENCES);
    }

    return this.preferences;
  }

  /**
   * Get visibility preferences for order lines
   */
  getOrderLineVisibility() {
    return {
      showEntryLines: this.preferences.showEntryLines,
      showTPLines: this.preferences.showTPLines,
      showSLLines: this.preferences.showSLLines,
      showLiquidationLines: this.preferences.showLiquidationLines,
      showPendingOrders: this.preferences.showPendingOrders,
    };
  }

  /**
   * Get color preferences for order lines
   */
  getOrderLineColors() {
    return {
      entryLineColor: this.preferences.entryLineColor,
      tpLineColor: this.preferences.tpLineColor,
      slLineColor: this.preferences.slLineColor,
      liquidationLineColor: this.preferences.liquidationLineColor,
      pendingLineColor: this.preferences.pendingLineColor,
    };
  }

  /**
   * Get style preferences for order lines (0=Solid, 1=Dashed, 2=Dotted)
   */
  getOrderLineStyles() {
    return {
      entryLineStyle: this.preferences.entryLineStyle ?? 0,
      tpLineStyle: this.preferences.tpLineStyle ?? 1,
      slLineStyle: this.preferences.slLineStyle ?? 1,
      liquidationLineStyle: this.preferences.liquidationLineStyle ?? 2,
      pendingLineStyle: this.preferences.pendingLineStyle ?? 2,
    };
  }

  /**
   * Toggle a visibility setting
   */
  async toggleVisibility(key) {
    const currentValue = this.preferences[key];
    return this.updatePreference(key, !currentValue);
  }
}

export const chartPreferencesService = new ChartPreferencesService();
export default chartPreferencesService;

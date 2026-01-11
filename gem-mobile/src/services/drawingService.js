/**
 * GEM Scanner - Drawing Service
 * Supabase CRUD operations for chart drawings
 */

import { supabase } from './supabase';

// ========== FETCH DRAWINGS ==========

/**
 * Fetch drawings for a specific symbol and timeframe
 * @param {string} userId - User ID
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {string} timeframe - Chart timeframe (e.g., '4h')
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const fetchDrawings = async (userId, symbol, timeframe) => {
  try {
    if (!userId || !symbol) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('chart_drawings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('is_visible', true)
      .contains('visible_timeframes', [timeframe])
      .order('z_index', { ascending: true });

    if (error) throw error;

    console.log('[drawingService] Fetched', data?.length || 0, 'drawings for', symbol, timeframe);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[drawingService] fetchDrawings error:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Fetch all drawings for a symbol (all timeframes)
 */
export const fetchAllDrawingsForSymbol = async (userId, symbol) => {
  try {
    if (!userId || !symbol) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('chart_drawings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .eq('is_visible', true)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[drawingService] fetchAllDrawingsForSymbol error:', error);
    return { data: [], error: error.message };
  }
};

// ========== SAVE DRAWING ==========

/**
 * Save a new drawing
 * @param {Object} drawing - Drawing object
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const saveDrawing = async (drawing) => {
  try {
    const { data, error } = await supabase
      .from('chart_drawings')
      .insert([{
        user_id: drawing.user_id,
        symbol: drawing.symbol,
        timeframe: drawing.timeframe,
        tool_type: drawing.tool_type,
        drawing_data: drawing.drawing_data,
        name: drawing.name || null,
        is_visible: drawing.is_visible ?? true,
        z_index: drawing.z_index || 0,
        visible_timeframes: drawing.visible_timeframes || ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('[drawingService] Saved drawing:', data?.id, drawing.tool_type);
    return { data, error: null };
  } catch (error) {
    console.error('[drawingService] saveDrawing error:', error);
    return { data: null, error: error.message };
  }
};

// ========== UPDATE DRAWING ==========

/**
 * Update an existing drawing
 * @param {string} id - Drawing ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateDrawing = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('chart_drawings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('[drawingService] Updated drawing:', id);
    return { data, error: null };
  } catch (error) {
    console.error('[drawingService] updateDrawing error:', error);
    return { data: null, error: error.message };
  }
};

// ========== DELETE DRAWING ==========

/**
 * Delete a single drawing
 * @param {string} id - Drawing ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteDrawing = async (id) => {
  try {
    const { error } = await supabase
      .from('chart_drawings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('[drawingService] Deleted drawing:', id);
    return { success: true, error: null };
  } catch (error) {
    console.error('[drawingService] deleteDrawing error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete all drawings for a symbol
 * @param {string} userId - User ID
 * @param {string} symbol - Trading pair
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export const deleteAllDrawings = async (userId, symbol) => {
  try {
    const { data, error } = await supabase
      .from('chart_drawings')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .select();

    if (error) throw error;

    const count = data?.length || 0;
    console.log('[drawingService] Deleted', count, 'drawings for', symbol);
    return { success: true, count, error: null };
  } catch (error) {
    console.error('[drawingService] deleteAllDrawings error:', error);
    return { success: false, count: 0, error: error.message };
  }
};

// ========== TOGGLE VISIBILITY ==========

/**
 * Toggle drawing visibility
 * @param {string} id - Drawing ID
 * @param {boolean} isVisible - New visibility state
 */
export const toggleDrawingVisibility = async (id, isVisible) => {
  return updateDrawing(id, { is_visible: isVisible });
};

// ========== EXPORT/IMPORT ==========

/**
 * Export all drawings for a symbol as JSON
 */
export const exportDrawings = async (userId, symbol) => {
  try {
    const { data, error } = await supabase
      .from('chart_drawings')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol);

    if (error) throw error;

    const exportData = {
      symbol,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      drawings: data || [],
    };

    return { data: exportData, error: null };
  } catch (error) {
    console.error('[drawingService] exportDrawings error:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Import drawings from JSON
 */
export const importDrawings = async (userId, importData) => {
  try {
    const drawings = (importData?.drawings || []).map((d) => ({
      user_id: userId,
      symbol: d.symbol || importData.symbol,
      timeframe: d.timeframe,
      tool_type: d.tool_type,
      drawing_data: d.drawing_data,
      name: d.name,
      is_visible: d.is_visible ?? true,
      z_index: d.z_index || 0,
      visible_timeframes: d.visible_timeframes || ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
    }));

    if (drawings.length === 0) {
      return { count: 0, error: null };
    }

    const { data, error } = await supabase
      .from('chart_drawings')
      .insert(drawings)
      .select();

    if (error) throw error;

    console.log('[drawingService] Imported', data?.length || 0, 'drawings');
    return { count: data?.length || 0, error: null };
  } catch (error) {
    console.error('[drawingService] importDrawings error:', error);
    return { count: 0, error: error.message };
  }
};

// ========== DEFAULT EXPORT ==========

const drawingService = {
  fetchDrawings,
  fetchAllDrawingsForSymbol,
  saveDrawing,
  updateDrawing,
  deleteDrawing,
  deleteAllDrawings,
  toggleDrawingVisibility,
  exportDrawings,
  importDrawings,
};

export default drawingService;

/**
 * Error Utilities
 *
 * Shared error formatting helpers for consistent error logging across the app.
 * Supabase errors are complex objects that don't serialize well in React Native console.
 */

/**
 * Format Supabase/API error for logging
 * Extracts useful information from error objects that would otherwise show as "[Object object]"
 *
 * @param {any} error - Error object from Supabase, fetch, or other sources
 * @returns {string} - Human-readable error string
 */
export const formatError = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || error.toString();
  }

  // Handle Supabase error objects
  const parts = [];
  if (error.message) parts.push(`message: ${error.message}`);
  if (error.code) parts.push(`code: ${error.code}`);
  if (error.details) parts.push(`details: ${error.details}`);
  if (error.hint) parts.push(`hint: ${error.hint}`);
  if (error.status) parts.push(`status: ${error.status}`);
  if (error.statusText) parts.push(`statusText: ${error.statusText}`);

  // If we extracted useful parts, return them
  if (parts.length > 0) {
    return parts.join(', ');
  }

  // Fallback: try JSON.stringify
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/**
 * Alias for backward compatibility
 */
export const formatSupabaseError = formatError;

export default { formatError, formatSupabaseError };

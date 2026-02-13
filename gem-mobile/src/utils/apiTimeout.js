/**
 * API Timeout Utility
 *
 * Wraps Supabase/API calls with timeout to prevent infinite loading states.
 * When API calls hang forever, the app becomes unresponsive.
 * This ensures all API calls either complete or timeout within a reasonable time.
 *
 * Created: January 31, 2026
 */

const DEFAULT_TIMEOUT = 15000; // 15 seconds default
const SHORT_TIMEOUT = 8000;    // 8 seconds for quick queries
const LONG_TIMEOUT = 30000;    // 30 seconds for uploads/heavy operations

/**
 * Wrap a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} operation - Operation name for error messages
 * @returns {Promise} - Resolves with result or rejects with timeout error
 */
export const withTimeout = (promise, ms = DEFAULT_TIMEOUT, operation = 'API call') => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout: ${operation} took longer than ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => {
      clearTimeout(timeoutId);
    });
};

/**
 * Execute a function with timeout and return a standardized result
 * @param {Function} fn - Async function to execute
 * @param {object} options - Options
 * @param {number} options.timeout - Timeout in ms
 * @param {string} options.operation - Operation name
 * @param {*} options.fallback - Fallback value on timeout/error
 * @returns {Promise<{data: *, error: Error|null, timedOut: boolean}>}
 */
export const safeExecute = async (fn, options = {}) => {
  const { timeout = DEFAULT_TIMEOUT, operation = 'operation', fallback = null } = options;

  try {
    const result = await withTimeout(fn(), timeout, operation);
    return { data: result, error: null, timedOut: false };
  } catch (err) {
    const isTimeout = err.message?.includes('Timeout');
    console.warn(`[safeExecute] ${operation} failed:`, err.message);
    return {
      data: fallback,
      error: err,
      timedOut: isTimeout,
    };
  }
};

/**
 * Create a timeout-wrapped Supabase query executor
 * Usage:
 *   const result = await supabaseWithTimeout(
 *     () => supabase.from('table').select('*').eq('id', 1),
 *     { timeout: 10000, operation: 'fetch user' }
 *   );
 */
export const supabaseWithTimeout = async (queryFn, options = {}) => {
  const { timeout = DEFAULT_TIMEOUT, operation = 'Supabase query' } = options;

  try {
    const result = await withTimeout(queryFn(), timeout, operation);
    return result;
  } catch (err) {
    const isTimeout = err.message?.includes('Timeout');
    console.warn(`[Supabase] ${operation} ${isTimeout ? 'timed out' : 'failed'}:`, err.message);

    // Return Supabase-style error object
    return {
      data: null,
      error: {
        message: err.message,
        code: isTimeout ? 'TIMEOUT' : 'ERROR',
      },
    };
  }
};

// Export timeout constants for consistency
export const TIMEOUTS = {
  DEFAULT: DEFAULT_TIMEOUT,
  SHORT: SHORT_TIMEOUT,
  LONG: LONG_TIMEOUT,
  INSTANT: 5000,
};

export default { withTimeout, safeExecute, supabaseWithTimeout, TIMEOUTS };

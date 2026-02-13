/**
 * Connection Health Monitor
 *
 * C14 FIX: Health checks and AppState handling are now managed by
 * AppResumeManager (unified resume system). This class is kept as a
 * thin wrapper for backwards compatibility (start/stop lifecycle
 * called from AuthContext.performFullCleanup).
 *
 * The AppResumeManager handles:
 * - Periodic health checks (60s)
 * - AppState pause/resume
 * - 3-strike full recovery
 * - Stuck-state detection
 *
 * The manager runs for the entire app lifetime (started by AppNavigator).
 * It does NOT need to stop on logout — all operations are safe when
 * logged out (session check returns null, WS reconnects are no-ops).
 */

class ConnectionHealthMonitor {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start — no-op. AppResumeManager is started by AppNavigator.
   * Kept for backwards compatibility.
   */
  start() {
    this.isRunning = true;
    console.log('[ConnectionHealth] start() — managed by AppResumeManager');
  }

  /**
   * Stop — no-op. AppResumeManager runs for the app's lifetime.
   * Called by AuthContext.performFullCleanup on logout.
   */
  stop() {
    this.isRunning = false;
    console.log('[ConnectionHealth] stop() — AppResumeManager keeps running');
  }
}

// Singleton
const connectionHealthMonitor = new ConnectionHealthMonitor();
export { connectionHealthMonitor };
export default connectionHealthMonitor;

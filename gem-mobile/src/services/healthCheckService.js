/**
 * Health Check Service
 * Phase 5: Production
 *
 * System health monitoring features:
 * - Service Health Checks (Supabase, TTS, Avatar, APIs)
 * - Latency Monitoring
 * - Health Status Logging
 * - Auto-Recovery Triggers
 * - Status Dashboard Data
 */

import { supabase } from './supabase';

// NetInfo - use try-catch for Expo Go compatibility
let NetInfo = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  // Fallback for Expo Go - create mock NetInfo
  NetInfo = {
    fetch: async () => ({ isConnected: true, isInternetReachable: true, type: 'wifi' }),
    addEventListener: () => () => {},
  };
  console.log('[HealthCheck] Using mock NetInfo for Expo Go');
}

// ============================================================================
// HEALTH STATUS TYPES
// ============================================================================

const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
};

const SERVICE_NAMES = {
  SUPABASE: 'supabase',
  FPT_TTS: 'fpt_tts',
  MUSETALK: 'musetalk',
  LIVEKIT: 'livekit',
  SHOPIFY: 'shopify',
  NETWORK: 'network',
};

// ============================================================================
// HEALTH CHECKER
// ============================================================================

class HealthChecker {
  constructor(name, checkFn, options = {}) {
    this.name = name;
    this.checkFn = checkFn;
    this.timeout = options.timeout || 5000;
    this.healthyThreshold = options.healthyThreshold || 1000; // ms
    this.degradedThreshold = options.degradedThreshold || 3000; // ms
    this.lastCheck = null;
    this.lastStatus = null;
    this.consecutiveFailures = 0;
  }

  async check() {
    const startTime = Date.now();

    try {
      // Wrap check with timeout
      const result = await Promise.race([
        this.checkFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), this.timeout)
        ),
      ]);

      const latency = Date.now() - startTime;

      // Determine status based on latency
      let status;
      if (latency <= this.healthyThreshold) {
        status = HEALTH_STATUS.HEALTHY;
      } else if (latency <= this.degradedThreshold) {
        status = HEALTH_STATUS.DEGRADED;
      } else {
        status = HEALTH_STATUS.DEGRADED;
      }

      this.consecutiveFailures = 0;
      this.lastStatus = status;
      this.lastCheck = {
        status,
        latency,
        checkedAt: new Date().toISOString(),
        metadata: result?.metadata || {},
      };

      return this.lastCheck;
    } catch (error) {
      this.consecutiveFailures++;
      this.lastStatus = HEALTH_STATUS.UNHEALTHY;
      this.lastCheck = {
        status: HEALTH_STATUS.UNHEALTHY,
        latency: Date.now() - startTime,
        checkedAt: new Date().toISOString(),
        error: error.message,
        consecutiveFailures: this.consecutiveFailures,
      };

      return this.lastCheck;
    }
  }
}

// ============================================================================
// HEALTH CHECK SERVICE
// ============================================================================

class HealthCheckService {
  constructor() {
    this.checkers = new Map();
    this.checkInterval = null;
    this.listeners = [];
    this.isRunning = false;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  initialize() {
    // Register default health checkers
    this.registerChecker(
      SERVICE_NAMES.NETWORK,
      this.createNetworkChecker(),
      { timeout: 3000 }
    );

    this.registerChecker(
      SERVICE_NAMES.SUPABASE,
      this.createSupabaseChecker(),
      { timeout: 5000, healthyThreshold: 500 }
    );

    this.registerChecker(
      SERVICE_NAMES.FPT_TTS,
      this.createTTSChecker(),
      { timeout: 10000, healthyThreshold: 1000 }
    );

    this.registerChecker(
      SERVICE_NAMES.MUSETALK,
      this.createMuseTalkChecker(),
      { timeout: 10000, healthyThreshold: 2000 }
    );
  }

  // ============================================================================
  // CHECKER CREATORS
  // ============================================================================

  createNetworkChecker() {
    return async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        throw new Error('No network connection');
      }
      return {
        metadata: {
          type: state.type,
          isInternetReachable: state.isInternetReachable,
        },
      };
    };
  }

  createSupabaseChecker() {
    return async () => {
      // Simple query to check Supabase connection
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      if (error) throw error;
      return { metadata: { connected: true } };
    };
  }

  createTTSChecker() {
    return async () => {
      // Check FPT TTS health endpoint
      const response = await fetch(
        'https://api.fpt.ai/hmi/tts/v5/healthz',
        {
          method: 'GET',
          headers: {
            'api-key': process.env.EXPO_PUBLIC_FPT_AI_API_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TTS API returned ${response.status}`);
      }

      return { metadata: { status: 'available' } };
    };
  }

  createMuseTalkChecker() {
    return async () => {
      const museTalkUrl = process.env.EXPO_PUBLIC_MUSETALK_API_URL;
      if (!museTalkUrl) {
        return { metadata: { status: 'not_configured' } };
      }

      const response = await fetch(`${museTalkUrl}/health`);
      if (!response.ok) {
        throw new Error(`MuseTalk returned ${response.status}`);
      }

      const data = await response.json();
      return { metadata: data };
    };
  }

  createLiveKitChecker() {
    return async () => {
      // LiveKit health check would go here
      return { metadata: { status: 'configured' } };
    };
  }

  // ============================================================================
  // CHECKER MANAGEMENT
  // ============================================================================

  registerChecker(name, checkFn, options = {}) {
    this.checkers.set(name, new HealthChecker(name, checkFn, options));
  }

  unregisterChecker(name) {
    this.checkers.delete(name);
  }

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  async checkService(name) {
    const checker = this.checkers.get(name);
    if (!checker) {
      throw new Error(`Unknown service: ${name}`);
    }

    const result = await checker.check();

    // Log to database
    await this.logHealthCheck(name, result);

    // Notify listeners
    this.notifyListeners(name, result);

    return result;
  }

  async checkAllServices() {
    const results = {};
    const promises = [];

    this.checkers.forEach((checker, name) => {
      promises.push(
        this.checkService(name).then((result) => {
          results[name] = result;
        })
      );
    });

    await Promise.allSettled(promises);

    return results;
  }

  async getSystemHealth() {
    const results = await this.checkAllServices();

    let overallStatus = HEALTH_STATUS.HEALTHY;
    let unhealthyCount = 0;
    let degradedCount = 0;

    Object.values(results).forEach((result) => {
      if (result.status === HEALTH_STATUS.UNHEALTHY) {
        unhealthyCount++;
      } else if (result.status === HEALTH_STATUS.DEGRADED) {
        degradedCount++;
      }
    });

    // Determine overall status
    if (unhealthyCount > 0) {
      overallStatus = HEALTH_STATUS.UNHEALTHY;
    } else if (degradedCount > 0) {
      overallStatus = HEALTH_STATUS.DEGRADED;
    }

    return {
      overallStatus,
      services: results,
      summary: {
        total: this.checkers.size,
        healthy: this.checkers.size - unhealthyCount - degradedCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
      },
      checkedAt: new Date().toISOString(),
    };
  }

  // ============================================================================
  // LOGGING
  // ============================================================================

  async logHealthCheck(serviceName, result) {
    try {
      await supabase.from('system_health_logs').insert({
        service_name: serviceName,
        status: result.status,
        latency_ms: result.latency,
        error_count: result.consecutiveFailures || 0,
        metadata: result.metadata || {},
        checked_at: result.checkedAt,
      });
    } catch (error) {
      console.warn('[HealthCheck] Failed to log:', error.message);
    }
  }

  // ============================================================================
  // CONTINUOUS MONITORING
  // ============================================================================

  startMonitoring(intervalMs = 60000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.checkInterval = setInterval(async () => {
      await this.checkAllServices();
    }, intervalMs);

    // Run initial check
    this.checkAllServices();
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // ============================================================================
  // LISTENERS
  // ============================================================================

  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners(serviceName, result) {
    this.listeners.forEach((listener) => {
      try {
        listener(serviceName, result);
      } catch (error) {
        // Ignore listener errors
      }
    });
  }

  // ============================================================================
  // QUICK STATUS CHECKS
  // ============================================================================

  isServiceHealthy(name) {
    const checker = this.checkers.get(name);
    return checker?.lastStatus === HEALTH_STATUS.HEALTHY;
  }

  getServiceStatus(name) {
    const checker = this.checkers.get(name);
    return checker?.lastCheck || null;
  }

  getLastCheckTime() {
    let latestTime = null;

    this.checkers.forEach((checker) => {
      if (checker.lastCheck) {
        const checkTime = new Date(checker.lastCheck.checkedAt);
        if (!latestTime || checkTime > latestTime) {
          latestTime = checkTime;
        }
      }
    });

    return latestTime;
  }

  // ============================================================================
  // DASHBOARD DATA
  // ============================================================================

  async getDashboardData() {
    const systemHealth = await this.getSystemHealth();

    // Get historical data
    const { data: recentLogs } = await supabase
      .from('system_health_logs')
      .select('*')
      .gte('checked_at', new Date(Date.now() - 3600000).toISOString())
      .order('checked_at', { ascending: false });

    // Calculate uptime percentages
    const uptimeByService = {};

    if (recentLogs) {
      const groupedLogs = {};
      recentLogs.forEach((log) => {
        if (!groupedLogs[log.service_name]) {
          groupedLogs[log.service_name] = [];
        }
        groupedLogs[log.service_name].push(log);
      });

      Object.keys(groupedLogs).forEach((serviceName) => {
        const logs = groupedLogs[serviceName];
        const healthyCount = logs.filter((l) => l.status === HEALTH_STATUS.HEALTHY).length;
        uptimeByService[serviceName] = ((healthyCount / logs.length) * 100).toFixed(2);
      });
    }

    // Calculate average latencies
    const avgLatencies = {};
    if (recentLogs) {
      const latencyByService = {};
      recentLogs.forEach((log) => {
        if (!latencyByService[log.service_name]) {
          latencyByService[log.service_name] = [];
        }
        if (log.latency_ms) {
          latencyByService[log.service_name].push(log.latency_ms);
        }
      });

      Object.keys(latencyByService).forEach((serviceName) => {
        const latencies = latencyByService[serviceName];
        avgLatencies[serviceName] = (
          latencies.reduce((a, b) => a + b, 0) / latencies.length
        ).toFixed(0);
      });
    }

    return {
      ...systemHealth,
      uptimeByService,
      avgLatencies,
      recentIssues: recentLogs?.filter((l) => l.status !== HEALTH_STATUS.HEALTHY).slice(0, 10) || [],
    };
  }

  // ============================================================================
  // ADMIN FUNCTIONS
  // ============================================================================

  async getHealthSummary() {
    try {
      const { data } = await supabase.rpc('get_system_health_summary');
      return data || [];
    } catch (error) {
      console.error('[HealthCheck] Get summary error:', error);
      return [];
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  cleanup() {
    this.stopMonitoring();
    this.listeners = [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const healthCheckService = new HealthCheckService();
export const HEALTH_STATUS_ENUM = HEALTH_STATUS;
export const SERVICE_NAMES_ENUM = SERVICE_NAMES;

export { HealthChecker };

export default healthCheckService;

/**
 * Scanner Optimization Tests
 *
 * Tests for the optimized scanner services:
 * - BatchInjectorService
 * - PatternEnricherService
 * - WebSocketPoolService
 * - OpposingMapperService
 * - PatternCacheService
 * - PatternNotificationService
 *
 * Run: npm test -- --testPathPattern=scannerOptimization
 */

// Mock react-native
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: 'active',
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Import services (will be mocked in tests)
import { BatchInjectorService } from '../../src/services/scanner/batchInjectorService';
import { PatternEnricherService } from '../../src/services/scanner/patternEnricherService';
import { OpposingMapperService } from '../../src/services/scanner/opposingMapperService';
import { PatternCacheService } from '../../src/services/scanner/patternCacheService';

// =====================================================
// BATCH INJECTOR TESTS
// =====================================================

describe('BatchInjectorService', () => {
  let batchInjector;
  let mockWebViewRef;

  beforeEach(() => {
    batchInjector = new BatchInjectorService();
    mockWebViewRef = {
      current: {
        injectJavaScript: jest.fn(),
      },
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    batchInjector.clear();
    jest.useRealTimers();
  });

  test('should batch multiple updates into single injection', () => {
    // Arrange
    const zone1 = { id: 'z1', zone_high: 100, zone_low: 90 };
    const line1 = { id: 'l1', price: 95 };

    // Act
    batchInjector.queueUpdate('zones', [zone1], mockWebViewRef);
    batchInjector.queueUpdate('orderLines', [line1], mockWebViewRef);

    // Fast-forward past batch delay
    jest.advanceTimersByTime(100);

    // Assert
    expect(mockWebViewRef.current.injectJavaScript).toHaveBeenCalledTimes(1);
  });

  test('should merge updates with same key', () => {
    // Arrange
    const zone1 = { id: 'z1', zone_high: 100 };
    const zone2 = { id: 'z2', zone_high: 200 };

    // Act - queue zones twice
    batchInjector.queueUpdate('zones', [zone1], mockWebViewRef);
    batchInjector.queueUpdate('zones', [zone2], mockWebViewRef);

    jest.advanceTimersByTime(100);

    // Assert - should only inject once with latest value
    expect(mockWebViewRef.current.injectJavaScript).toHaveBeenCalledTimes(1);
    const injectedCode = mockWebViewRef.current.injectJavaScript.mock.calls[0][0];
    expect(injectedCode).toContain('z2'); // Latest value
  });

  test('should handle empty payload gracefully', () => {
    // Act & Assert - should not throw
    expect(() => batchInjector.flush()).not.toThrow();
  });

  test('should clear pending updates', () => {
    // Arrange
    batchInjector.queueUpdate('zones', [{ id: 1 }], mockWebViewRef);

    // Act
    batchInjector.clear();
    jest.advanceTimersByTime(100);

    // Assert - no injection should happen
    expect(mockWebViewRef.current.injectJavaScript).not.toHaveBeenCalled();
  });

  test('should track metrics correctly', () => {
    // Arrange
    batchInjector.queueUpdate('zones', [{ id: 1 }], mockWebViewRef);
    batchInjector.queueUpdate('orderLines', [{ id: 2 }], mockWebViewRef);
    jest.advanceTimersByTime(100);

    // Act
    const metrics = batchInjector.getMetrics();

    // Assert
    expect(metrics.totalBatches).toBe(1);
    expect(metrics.totalUpdates).toBe(2);
    expect(metrics.avgBatchSize).toBe(2);
  });
});

// =====================================================
// PATTERN ENRICHER TESTS
// =====================================================

describe('PatternEnricherService', () => {
  let enricher;

  beforeEach(() => {
    enricher = new PatternEnricherService();
  });

  afterEach(() => {
    enricher.clearCache();
  });

  test('should generate unique IDs', () => {
    // Arrange
    const p1 = { type: 'Double Top', entry: 100 };
    const p2 = { type: 'Double Top', entry: 100 };

    // Act
    const id1 = enricher.generateId(p1, 'BTCUSDT', '1h');
    const id2 = enricher.generateId(p2, 'ETHUSDT', '1h');

    // Assert
    expect(id1).not.toBe(id2);
  });

  test('should normalize bullish direction correctly', () => {
    const testCases = [
      { input: 'LONG', expected: 'bullish' },
      { input: 'long', expected: 'bullish' },
      { input: 'bullish', expected: 'bullish' },
      { input: 'up', expected: 'bullish' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = enricher.enrichPattern({ direction: input }, { symbol: 'BTC' });
      expect(result.direction).toBe(expected);
    });
  });

  test('should normalize bearish direction correctly', () => {
    const testCases = [
      { input: 'SHORT', expected: 'bearish' },
      { input: 'short', expected: 'bearish' },
      { input: 'bearish', expected: 'bearish' },
      { input: 'down', expected: 'bearish' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = enricher.enrichPattern({ direction: input }, { symbol: 'BTC' });
      expect(result.direction).toBe(expected);
    });
  });

  test('should infer direction from SL position', () => {
    // Bullish: SL below entry
    const bullish = enricher.enrichPattern({
      entry: 100,
      stopLoss: 90,
    }, { symbol: 'BTC' });
    expect(bullish.direction).toBe('bullish');

    // Bearish: SL above entry
    const bearish = enricher.enrichPattern({
      entry: 100,
      stopLoss: 110,
    }, { symbol: 'BTC' });
    expect(bearish.direction).toBe('bearish');
  });

  test('should calculate risk/reward ratio', () => {
    const pattern = enricher.enrichPattern({
      entry: 100,
      stopLoss: 90,
      takeProfit: 120,
    }, { symbol: 'BTC' });

    // Risk: 100 - 90 = 10
    // Reward: 120 - 100 = 20
    // R:R = 20/10 = 2
    expect(pattern.riskRewardRatio).toBe(2);
  });

  test('should assign confidence grade', () => {
    const highConfidence = enricher.enrichPattern({
      confidence: 0.95,
    }, { symbol: 'BTC' });
    expect(highConfidence.grade).toBe('A+');

    const mediumConfidence = enricher.enrichPattern({
      confidence: 0.75,
    }, { symbol: 'BTC' });
    expect(mediumConfidence.grade).toBe('B');

    const lowConfidence = enricher.enrichPattern({
      confidence: 0.55,
    }, { symbol: 'BTC' });
    expect(lowConfidence.grade).toBe('C');
  });

  test('should use cache for repeated enrichments', () => {
    const pattern = { id: 'test-1', type: 'Double Top', entry: 100 };
    const context = { symbol: 'BTCUSDT', timeframe: '1h' };

    // First call
    const result1 = enricher.enrichPattern(pattern, context);

    // Second call should use cache
    const result2 = enricher.enrichPattern(pattern, context);

    expect(result1).toBe(result2); // Same reference from cache
  });
});

// =====================================================
// OPPOSING MAPPER TESTS
// =====================================================

describe('OpposingMapperService', () => {
  let mapper;

  beforeEach(() => {
    mapper = new OpposingMapperService();
  });

  afterEach(() => {
    mapper.clear();
  });

  test('should build map in O(n)', () => {
    // Arrange - create 1000 patterns
    const patterns = Array(1000).fill(null).map((_, i) => ({
      id: `pattern-${i}`,
      symbol: 'BTCUSDT',
      direction: i % 2 === 0 ? 'bullish' : 'bearish',
      entry: 100 + i,
    }));

    // Act & measure
    const start = Date.now();
    mapper.buildMaps(patterns);
    const duration = Date.now() - start;

    // Assert - should be fast (under 100ms)
    expect(duration).toBeLessThan(100);
  });

  test('should find opposing patterns correctly', () => {
    const patterns = [
      { id: 'bull-1', symbol: 'BTCUSDT', direction: 'bullish', entry: 100 },
      { id: 'bear-1', symbol: 'BTCUSDT', direction: 'bearish', entry: 110 },
      { id: 'bull-2', symbol: 'BTCUSDT', direction: 'bullish', entry: 90 },
      { id: 'bear-2', symbol: 'BTCUSDT', direction: 'bearish', entry: 120 },
    ];

    mapper.buildMaps(patterns);

    // Get opposing (bearish) patterns for a bullish pattern
    const opposing = mapper.getOpposing(patterns[0]);
    expect(opposing).toHaveLength(2);
    expect(opposing.every(p => p.direction === 'bearish')).toBe(true);
  });

  test('should find optimal TP from opposing patterns', () => {
    const patterns = [
      { id: 'bull-1', symbol: 'BTCUSDT', direction: 'bullish', entry: 100 },
      { id: 'bear-1', symbol: 'BTCUSDT', direction: 'bearish', entry: 115 },
      { id: 'bear-2', symbol: 'BTCUSDT', direction: 'bearish', entry: 130 },
    ];

    mapper.buildMaps(patterns);

    // Find optimal TP for bullish pattern (should be nearest opposing zone above)
    const result = mapper.findOptimalTP(patterns[0], 120);

    expect(result).toBeDefined();
    expect(result.opposingPrice).toBe(115); // Nearest opposing zone
  });

  test('should handle empty pattern list', () => {
    mapper.buildMaps([]);

    const metrics = mapper.getMetrics();
    expect(metrics.bullishCount).toBe(0);
    expect(metrics.bearishCount).toBe(0);
  });
});

// =====================================================
// PATTERN CACHE TESTS
// =====================================================

describe('PatternCacheService', () => {
  let cache;

  beforeEach(() => {
    cache = new PatternCacheService();
  });

  afterEach(() => {
    cache.clear();
  });

  test('should cache and retrieve patterns', () => {
    const patterns = [{ id: 1, type: 'Double Top' }];

    cache.set('BTCUSDT', '1h', patterns);
    const retrieved = cache.get('BTCUSDT', '1h');

    expect(retrieved).toEqual(patterns);
  });

  test('should return null for expired cache', () => {
    const patterns = [{ id: 1 }];

    // Set with very short TTL
    cache.set('BTCUSDT', '1h', patterns, 1); // 1ms TTL

    // Wait for expiration
    return new Promise(resolve => {
      setTimeout(() => {
        const retrieved = cache.get('BTCUSDT', '1h');
        expect(retrieved).toBeNull();
        resolve();
      }, 10);
    });
  });

  test('should be case-insensitive for symbol', () => {
    const patterns = [{ id: 1 }];

    cache.set('btcusdt', '1h', patterns);
    const retrieved = cache.get('BTCUSDT', '1h');

    expect(retrieved).toEqual(patterns);
  });

  test('should deduplicate concurrent requests', async () => {
    let fetchCount = 0;
    const fetchFn = async () => {
      fetchCount++;
      await new Promise(r => setTimeout(r, 50)); // Simulate API delay
      return [{ id: 1 }];
    };

    // Fire 3 concurrent requests
    const [r1, r2, r3] = await Promise.all([
      cache.getOrFetch('BTC', '1h', fetchFn),
      cache.getOrFetch('BTC', '1h', fetchFn),
      cache.getOrFetch('BTC', '1h', fetchFn),
    ]);

    // Should only fetch once
    expect(fetchCount).toBe(1);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  test('should invalidate specific symbol/timeframe', () => {
    cache.set('BTCUSDT', '1h', [{ id: 1 }]);
    cache.set('BTCUSDT', '4h', [{ id: 2 }]);
    cache.set('ETHUSDT', '1h', [{ id: 3 }]);

    cache.invalidate('BTCUSDT', '1h');

    expect(cache.get('BTCUSDT', '1h')).toBeNull();
    expect(cache.get('BTCUSDT', '4h')).not.toBeNull();
    expect(cache.get('ETHUSDT', '1h')).not.toBeNull();
  });

  test('should invalidate all timeframes for symbol', () => {
    cache.set('BTCUSDT', '1h', [{ id: 1 }]);
    cache.set('BTCUSDT', '4h', [{ id: 2 }]);
    cache.set('ETHUSDT', '1h', [{ id: 3 }]);

    cache.invalidate('BTCUSDT'); // No timeframe = invalidate all

    expect(cache.get('BTCUSDT', '1h')).toBeNull();
    expect(cache.get('BTCUSDT', '4h')).toBeNull();
    expect(cache.get('ETHUSDT', '1h')).not.toBeNull();
  });

  test('should evict oldest entry when at capacity', () => {
    // Set max size to 3 for testing
    cache.MAX_CACHE_SIZE = 3;

    cache.set('BTC', '1h', [{ id: 1 }]);
    cache.set('ETH', '1h', [{ id: 2 }]);
    cache.set('SOL', '1h', [{ id: 3 }]);
    cache.set('BNB', '1h', [{ id: 4 }]); // Should evict BTC

    expect(cache.get('BTC', '1h')).toBeNull();
    expect(cache.get('ETH', '1h')).not.toBeNull();
    expect(cache.get('SOL', '1h')).not.toBeNull();
    expect(cache.get('BNB', '1h')).not.toBeNull();
  });

  test('should report correct stats', () => {
    cache.set('BTCUSDT', '1h', [{ id: 1 }, { id: 2 }]);
    cache.set('ETHUSDT', '4h', [{ id: 3 }]);

    const stats = cache.getStats();

    expect(stats.size).toBe(2);
    expect(stats.entries).toHaveLength(2);
    expect(stats.entries[0].patterns).toBe(2);
  });
});

// =====================================================
// ACCESS CONTROL TESTS
// =====================================================

describe('Scanner Access Control', () => {
  // Import access control functions
  const {
    canAccessFeature,
    canUsePattern,
    canUseTimeframe,
    getTierLimits,
    getAllowedTimeframes,
    getAllowedPatterns,
    SCANNER_ACCESS_TIERS,
  } = require('../../src/config/scannerAccessControl');

  test('FREE tier should have limited features', () => {
    expect(canAccessFeature('FREE', 'cacheEnabled')).toBe(false);
    expect(canAccessFeature('FREE', 'websocketEnabled')).toBe(false);
    expect(getTierLimits('FREE').maxCoins).toBe(10);
    expect(getTierLimits('FREE').maxTimeframes).toBe(1);
  });

  test('TIER1/SILVER should have more features', () => {
    expect(canAccessFeature('TIER1', 'cacheEnabled')).toBe(true);
    expect(canAccessFeature('TIER1', 'websocketEnabled')).toBe(true);
    expect(canAccessFeature('SILVER', 'notificationsEnabled')).toBe(true);
    expect(getTierLimits('TIER1').maxCoins).toBe(50);
  });

  test('TIER2/GOLD should have all patterns', () => {
    expect(canUsePattern('TIER2', 'Quasimodo')).toBe(true);
    expect(canUsePattern('TIER2', 'Diamond')).toBe(true);
    expect(canAccessFeature('GOLD', 'v2EnhancementsEnabled')).toBe(true);
  });

  test('TIER3/DIAMOND should have unlimited access', () => {
    const limits = getTierLimits('TIER3');
    expect(limits.maxCoins).toBe(-1); // Unlimited
    expect(limits.maxTimeframes).toBe(-1); // Unlimited
    expect(limits.scanCooldown).toBe(0); // No cooldown
    expect(canAccessFeature('DIAMOND', 'apiAccess')).toBe(true);
  });

  test('should validate allowed timeframes', () => {
    expect(canUseTimeframe('FREE', '1h')).toBe(true);
    expect(canUseTimeframe('FREE', '4h')).toBe(false);
    expect(canUseTimeframe('TIER1', '4h')).toBe(true);
    expect(canUseTimeframe('TIER2', '1d')).toBe(true);
  });

  test('should validate allowed patterns', () => {
    expect(canUsePattern('FREE', 'Double Top')).toBe(true);
    expect(canUsePattern('FREE', 'Head and Shoulders')).toBe(false);
    expect(canUsePattern('TIER1', 'Head and Shoulders')).toBe(true);
  });

  test('ADMIN should have all access', () => {
    expect(canAccessFeature('ADMIN', 'debugMode')).toBe(true);
    expect(canAccessFeature('ADMIN', 'adminPanel')).toBe(true);
    expect(canUsePattern('ADMIN', 'AnyPattern')).toBe(true);
    expect(canUseTimeframe('ADMIN', '1s')).toBe(true);
  });

  test('should handle invalid tier gracefully', () => {
    expect(getTierLimits('INVALID')).toEqual(getTierLimits('FREE'));
    expect(canAccessFeature('INVALID', 'cacheEnabled')).toBe(false);
  });
});

// =====================================================
// INTEGRATION TESTS
// =====================================================

describe('Scanner Integration', () => {
  test('should enrich and cache patterns together', async () => {
    const enricher = new PatternEnricherService();
    const cache = new PatternCacheService();

    // Simulate scan flow
    const rawPatterns = [
      { type: 'Double Top', entry: 100, stopLoss: 90, takeProfit: 120 },
      { type: 'Support', entry: 80, stopLoss: 75, takeProfit: 95 },
    ];

    // Enrich patterns
    const enriched = enricher.enrichPatterns(rawPatterns, {
      symbol: 'BTCUSDT',
      timeframe: '1h',
    });

    // Cache enriched patterns
    cache.set('BTCUSDT', '1h', enriched);

    // Retrieve from cache
    const cached = cache.get('BTCUSDT', '1h');

    expect(cached).toHaveLength(2);
    expect(cached[0].id).toBeDefined();
    expect(cached[0].riskRewardRatio).toBeDefined();
    expect(cached[0].grade).toBeDefined();
  });

  test('should build opposing map after enrichment', () => {
    const enricher = new PatternEnricherService();
    const mapper = new OpposingMapperService();

    // Enrich patterns
    const patterns = [
      { type: 'Support', entry: 100, direction: 'bullish' },
      { type: 'Resistance', entry: 120, direction: 'bearish' },
    ];

    const enriched = enricher.enrichPatterns(patterns, {
      symbol: 'BTCUSDT',
      timeframe: '1h',
    });

    // Build opposing map
    mapper.buildMaps(enriched);

    // Find opposing for bullish pattern
    const opposing = mapper.getOpposing(enriched[0]);
    expect(opposing).toHaveLength(1);
    expect(opposing[0].direction).toBe('bearish');
  });
});

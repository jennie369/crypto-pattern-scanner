/**
 * OptimizedImage Component
 * High-performance image loading with aggressive caching
 *
 * Features:
 * - Aggressive prefetching with parallel loading
 * - Loading spinner placeholder
 * - Fast fade-in animation
 * - Quick retry on failure
 * - Memory-efficient caching
 *
 * Created: December 14, 2025
 * Updated: January 23, 2026 - Performance optimization
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, Image, StyleSheet, Animated, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff } from 'lucide-react-native';
import { COLORS } from '../../utils/tokens';

// No network fallback - use local placeholder UI instead
const USE_LOCAL_FALLBACK = true;

// In-memory cache to track which images have been prefetched
const prefetchedUrls = new Set();
const failedUrls = new Set(); // Track failed URLs to avoid retrying
const prefetchQueue = [];
let isPrefetching = false;

/**
 * Prefetch images for faster loading
 * Uses React Native's Image.prefetch which caches to disk
 */
export const prefetchImages = async (urls) => {
  if (!urls || urls.length === 0) return;

  // Filter valid URLs that haven't been prefetched or failed
  const validUrls = urls.filter(url =>
    url &&
    typeof url === 'string' &&
    url.startsWith('http') &&
    !prefetchedUrls.has(url) &&
    !failedUrls.has(url)
  );

  if (validUrls.length === 0) return;

  // Add to queue (avoid duplicates)
  validUrls.forEach(url => {
    if (!prefetchQueue.includes(url)) {
      prefetchQueue.push(url);
    }
  });

  // Start prefetching if not already running
  if (!isPrefetching) {
    processPrefetchQueue();
  }
};

const processPrefetchQueue = async () => {
  if (prefetchQueue.length === 0) {
    isPrefetching = false;
    return;
  }

  isPrefetching = true;

  // Process in batches of 8 for faster loading
  const batch = prefetchQueue.splice(0, 8);

  await Promise.allSettled(
    batch.map(async (url) => {
      try {
        const result = await Promise.race([
          Image.prefetch(url),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000))
        ]);
        if (result) prefetchedUrls.add(url);
      } catch {
        failedUrls.add(url);
      }
    })
  );

  // Minimal delay between batches - keep loading fast
  if (prefetchQueue.length > 0) {
    setImmediate(processPrefetchQueue);
  } else {
    isPrefetching = false;
  }
};

/**
 * Clear prefetch tracking (for memory management)
 */
export const clearPrefetchCache = () => {
  prefetchedUrls.clear();
};

const OptimizedImage = memo(({
  source,
  uri,
  style,
  resizeMode = 'cover',
  showPlaceholder = true,
  maxRetries = 1,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Resolve image source
  const imageUri = uri || (typeof source === 'object' ? source?.uri : source);

  // Validate URL
  const isValidUri = imageUri && typeof imageUri === 'string' && imageUri.startsWith('http');
  const currentUri = isValidUri ? imageUri : null;

  // Check if image was already prefetched - skip loading state if so
  const wasPrefetched = currentUri && prefetchedUrls.has(currentUri);

  // Initialize fade value to 1 if already prefetched
  useEffect(() => {
    if (!currentUri) {
      // Invalid URL - show error state immediately
      setIsLoading(false);
      setHasError(true);
      return;
    }

    if (wasPrefetched) {
      fadeAnim.setValue(1);
      setIsLoading(false);
      setHasError(false);
    } else {
      // Reset for new images
      setIsLoading(true);
      setHasError(false);
      fadeAnim.setValue(0);
    }
  }, [currentUri, wasPrefetched]);

  const handleLoad = useCallback((event) => {
    setIsLoading(false);
    setHasError(false);

    // Fast fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    // Mark as prefetched for future renders
    if (currentUri) {
      prefetchedUrls.add(currentUri);
    }
    onLoad?.(event);
  }, [currentUri, onLoad, fadeAnim]);

  const handleError = useCallback((event) => {
    // Quick retry once
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Immediate retry
      setIsLoading(true);
      fadeAnim.setValue(0);
    } else {
      // Failed - show local fallback UI
      setIsLoading(false);
      setHasError(true);
      if (currentUri) {
        failedUrls.add(currentUri);
      }
      onError?.(event);
    }
  }, [retryCount, maxRetries, currentUri, onError, fadeAnim]);

  // Render local fallback UI when image fails
  const renderFallback = () => (
    <View style={[StyleSheet.absoluteFill, styles.fallbackContainer]}>
      <LinearGradient
        colors={['rgba(26, 11, 46, 0.9)', 'rgba(30, 32, 80, 0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <ImageOff size={24} color={COLORS.textMuted || 'rgba(255,255,255,0.4)'} />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Loading spinner - shows while loading */}
      {isLoading && showPlaceholder && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <ActivityIndicator size="small" color={COLORS.gold || '#FFBD59'} />
        </View>
      )}

      {/* Error fallback - shows when image fails */}
      {hasError && renderFallback()}

      {/* Actual image with fade-in - only render if we have valid URL and no error */}
      {currentUri && !hasError && (
        <Animated.Image
          key={`${currentUri}-${retryCount}`}
          source={{
            uri: currentUri,
            cache: 'default',
            priority: Platform.OS === 'android' ? 'high' : undefined,
          }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: fadeAnim },
          ]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          progressiveRenderingEnabled={Platform.OS === 'android'}
          fadeDuration={0}
          {...props}
        />
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  const prevUri = prevProps.uri || prevProps.source?.uri || prevProps.source;
  const nextUri = nextProps.uri || nextProps.source?.uri || nextProps.source;
  return prevUri === nextUri;
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.glassBgHeavy || 'rgba(30, 32, 80, 0.7)',
  },
  placeholder: {
    backgroundColor: COLORS.glassBgHeavy || 'rgba(30, 32, 80, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;

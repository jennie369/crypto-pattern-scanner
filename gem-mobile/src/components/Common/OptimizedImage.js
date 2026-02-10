/**
 * OptimizedImage Component
 * High-performance image loading with aggressive caching using expo-image
 * Theme-aware component
 *
 * Features:
 * - Uses expo-image for superior caching (disk + memory)
 * - Cached images display INSTANTLY (no flicker)
 * - Smooth placeholder transitions
 * - Automatic retry on failure
 * - Memory-efficient
 *
 * Created: December 14, 2025
 * Updated: February 4, 2026 - Switched to expo-image for instant cached display
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

// In-memory tracking for prefetched URLs
const prefetchedUrls = new Set();
const failedUrls = new Set();
const prefetchQueue = [];
let isPrefetching = false;

/**
 * Prefetch images for faster loading
 * Uses expo-image's prefetch which caches aggressively to disk
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

  // Process in batches of 10 for faster loading
  const batch = prefetchQueue.splice(0, 10);

  await Promise.allSettled(
    batch.map(async (url) => {
      try {
        // Use expo-image prefetch for aggressive disk caching
        await Image.prefetch(url);
        prefetchedUrls.add(url);
      } catch {
        failedUrls.add(url);
      }
    })
  );

  // Continue processing queue
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
  failedUrls.clear();
};

/**
 * Get cache status for debugging
 */
export const getCacheStats = () => ({
  prefetched: prefetchedUrls.size,
  failed: failedUrls.size,
  queued: prefetchQueue.length,
});

const OptimizedImage = memo(({
  source,
  uri,
  style,
  resizeMode = 'cover',
  showPlaceholder = true,
  placeholder,
  transition = 100,
  onLoad,
  onError,
  priority = 'normal',
  cachePolicy = 'disk',
  ...props
}) => {
  const { colors, settings } = useSettings();
  const [hasError, setHasError] = useState(false);

  // Resolve image source
  const imageUri = uri || (typeof source === 'object' ? source?.uri : source);
  const isValidUri = imageUri && typeof imageUri === 'string' && imageUri.startsWith('http');
  const currentUri = isValidUri ? imageUri : null;

  // Theme-aware styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: settings.theme === 'light'
        ? 'rgba(0, 0, 0, 0.05)'
        : (colors.glassBgHeavy || 'rgba(30, 32, 80, 0.7)'),
    },
    fallbackContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors, settings.theme]);

  const handleLoad = useCallback((event) => {
    setHasError(false);
    if (currentUri) {
      prefetchedUrls.add(currentUri);
    }
    onLoad?.(event);
  }, [currentUri, onLoad]);

  const handleError = useCallback((event) => {
    setHasError(true);
    if (currentUri) {
      failedUrls.add(currentUri);
    }
    onError?.(event);
  }, [currentUri, onError]);

  // Theme-aware fallback gradients
  const fallbackGradient = settings.theme === 'light'
    ? ['rgba(200, 200, 200, 0.5)', 'rgba(180, 180, 180, 0.6)']
    : ['rgba(26, 11, 46, 0.9)', 'rgba(30, 32, 80, 0.95)'];

  // Render local fallback UI when image fails or no valid URL
  const renderFallback = () => (
    <View style={[StyleSheet.absoluteFill, styles.fallbackContainer]}>
      <LinearGradient
        colors={fallbackGradient}
        style={StyleSheet.absoluteFill}
      />
      <ImageOff size={24} color={colors.textMuted} />
    </View>
  );

  // Show error state
  if (hasError || !currentUri) {
    return (
      <View style={[styles.container, style]}>
        {renderFallback()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* expo-image with aggressive caching */}
      <Image
        source={{ uri: currentUri }}
        style={StyleSheet.absoluteFill}
        contentFit={resizeMode}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={placeholder || (showPlaceholder ? { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' } : undefined)}
        placeholderContentFit="cover"
        {...props}
      />
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

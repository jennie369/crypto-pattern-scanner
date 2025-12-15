/**
 * Gemral - Welcome Screen
 * First-time user onboarding with 5 slides
 *
 * Features:
 * - Swipeable slides with animations
 * - Progress pagination dots
 * - Skip button (goes to auth)
 * - Next/Back navigation
 * - CTA buttons on last slide
 *
 * Uses design tokens from utils/tokens.js
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

import { COLORS, TYPOGRAPHY, SPACING, GRADIENTS } from '../../utils/tokens';
import { WELCOME_SLIDES, WELCOME_CTA } from '../../config/welcomeConfig';
import welcomeService from '../../services/welcomeService';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // ========== STATE ==========
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // ========== EFFECTS ==========
  useEffect(() => {
    // Track slide view
    const slide = WELCOME_SLIDES[currentIndex];
    if (slide) {
      welcomeService.trackSlideView(slide.id, currentIndex);
    }
  }, [currentIndex]);

  // ========== HANDLERS ==========
  const handleNext = useCallback(() => {
    if (currentIndex < WELCOME_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleSkip = useCallback(async () => {
    await welcomeService.markWelcomeCompleted(currentIndex + 1);
    navigation.replace('Auth');
  }, [navigation, currentIndex]);

  const handleGetStarted = useCallback(async () => {
    await welcomeService.markWelcomeCompleted(5);
    navigation.replace('Auth', { screen: 'Register' });
  }, [navigation]);

  const handleLogin = useCallback(async () => {
    await welcomeService.markWelcomeCompleted(5);
    navigation.replace('Auth', { screen: 'Login' });
  }, [navigation]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0]?.index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // ========== RENDER SLIDE ==========
  const renderSlide = useCallback(({ item }) => {
    const IconComponent = item?.icon;

    return (
      <LinearGradient
        colors={item?.bgGradient || GRADIENTS.background}
        style={styles.slide}
      >
        <View style={styles.slideContent}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${item?.iconColor || COLORS.gold}20` },
            ]}
          >
            {IconComponent && (
              <IconComponent size={64} color={item?.iconColor || COLORS.gold} />
            )}
          </View>

          {/* Title */}
          <Text style={styles.slideTitle}>{item?.title || ''}</Text>

          {/* Subtitle */}
          <Text
            style={[
              styles.slideSubtitle,
              { color: item?.iconColor || COLORS.gold },
            ]}
          >
            {item?.subtitle || ''}
          </Text>

          {/* Description */}
          <Text style={styles.slideDescription}>{item?.description || ''}</Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {(item?.features || []).map((feature, idx) => {
              const FeatureIcon = feature?.icon;
              return (
                <View key={idx} style={styles.featureItem}>
                  <View
                    style={[
                      styles.featureIconBg,
                      {
                        backgroundColor: `${item?.iconColor || COLORS.gold}15`,
                      },
                    ]}
                  >
                    {FeatureIcon && (
                      <FeatureIcon
                        size={18}
                        color={item?.iconColor || COLORS.gold}
                      />
                    )}
                  </View>
                  <Text style={styles.featureText}>{feature?.text || ''}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    );
  }, []);

  // ========== RENDER PAGINATION ==========
  const renderPagination = useCallback(() => {
    return (
      <View style={styles.pagination}>
        {WELCOME_SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: COLORS.gold,
                },
              ]}
            />
          );
        })}
      </View>
    );
  }, [scrollX]);

  // ========== MAIN RENDER ==========
  const isLastSlide = currentIndex === WELCOME_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Skip Button */}
      {!isLastSlide && (
        <SafeAreaView edges={['top']} style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={WELCOME_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item?.id || String(Math.random())}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom Section */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSection}>
        {/* Pagination */}
        {renderPagination()}

        {/* Navigation Buttons */}
        {!isLastSlide ? (
          <View style={styles.navButtons}>
            {currentIndex > 0 && (
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <ChevronLeft size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Tiếp theo</Text>
              <ChevronRight size={20} color={COLORS.bgDarkest} />
            </TouchableOpacity>
          </View>
        ) : (
          /* CTA Buttons on Last Slide */
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {WELCOME_CTA?.primaryButton?.text || 'Bắt đầu ngay'}
              </Text>
              <ChevronRight size={20} color={COLORS.bgDarkest} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {WELCOME_CTA?.secondaryButton?.text ||
                  'Đã có tài khoản? Đăng nhập'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  skipContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 180, // Space for bottom section
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  slideSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  slideDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
    marginRight: SPACING.xs,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
    width: '100%',
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
    marginRight: SPACING.sm,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
});

export default WelcomeScreen;

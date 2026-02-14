/**
 * Gemral - Glass Bottom Tab Bar
 * Refined floating pill-style tab bar with deep navy glass effect
 * Supports auto-hide on scroll via TabBarContext
 * Dynamic notification badge count
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Shadow } from 'react-native-shadow-2';
import { Home, ShoppingCart, BarChart2, Star, Bell, Box } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBar } from '../contexts/TabBarContext';
import { useSettings } from '../contexts/SettingsContext';
import { forumService } from '../services/forumService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const DOUBLE_TAP_DELAY = 300; // ms between taps to count as double-tap

const SCREEN_WIDTH = Dimensions.get('window').width;

// Theme-specific design tokens
const getDarkTokens = () => ({
  colors: {
    bg: '#041027',
    barTint: 'rgba(17, 34, 80, 0.85)',
    rimDark: 'rgba(106, 91, 255, 0.2)',
    rimLight: 'rgba(106, 91, 255, 0.1)',
    icon: 'rgba(255,255,255,0.92)',
    iconInactive: 'rgba(255,255,255,0.48)',
    activeBg: 'rgba(17, 34, 80, 0.95)',
    activeRim: 'rgba(106, 91, 255, 0.3)',
    innerShadow: 'rgba(0,0,0,0.55)',
    glassAccent: '#112250',
    // Gradient colors
    gradientColors: ['rgba(15, 16, 48, 0.65)', 'rgba(106, 91, 255, 0.12)', 'rgba(15, 16, 48, 0.75)'],
    sheenColors: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'],
    borderGlow: 'rgba(106, 91, 255, 0.25)',
    badgeBorder: 'rgba(17, 34, 80, 0.9)',
  },
  blurTint: 'dark',
  blurIntensity: 90,
});

const getLightTokens = () => ({
  colors: {
    bg: '#FFFFFF',
    barTint: 'rgba(255, 255, 255, 0.92)',
    rimDark: 'rgba(0, 0, 0, 0.08)',
    rimLight: 'rgba(0, 0, 0, 0.04)',
    icon: 'rgba(0, 0, 0, 0.85)',
    iconInactive: 'rgba(0, 0, 0, 0.45)',
    activeBg: 'rgba(255, 255, 255, 0.98)',
    activeRim: 'rgba(156, 6, 18, 0.2)',  // burgundy accent
    innerShadow: 'rgba(0,0,0,0.08)',
    glassAccent: '#F5F5F5',
    // Gradient colors
    gradientColors: ['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 240, 0.9)', 'rgba(255, 255, 255, 0.95)'],
    sheenColors: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)'],
    borderGlow: 'rgba(0, 0, 0, 0.1)',
    badgeBorder: 'rgba(255, 255, 255, 0.9)',
  },
  blurTint: 'light',
  blurIntensity: 80,
});

// Static design tokens
const BaseTokens = {
  spacing: { page: 20 },
  radius: { bar: 40, pill: 32 },
  sizes: { barHeight: 76, icon: 20, activeIcon: 22 },
  z: { base: 0, tabBar: 100 },
  touch: { minSize: 44 },
};

export default function GlassBottomTab({ state, descriptors, navigation }) {
  // Get theme settings for dynamic theming
  const { settings, t } = useSettings();
  const Tokens = useMemo(() => ({
    ...BaseTokens,
    ...(settings.theme === 'light' ? getLightTokens() : getDarkTokens()),
  }), [settings.theme]);

  // Get safe area insets for navigation bar
  const insets = useSafeAreaInsets();

  // Calculate bottom padding based on platform:
  // - iOS: Position just above home indicator without floating too high
  // - Android: Use insets.bottom, but add extra padding for 3-button nav
  //   when insets.bottom is 0 (system nav bar not detected as safe area)
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      // iOS: Position tab bar just above home indicator with small gap
      // 6px gives enough clearance from the white home indicator bar
      return 6;
    } else {
      // Android: Safe area might not detect 3-button navigation bar
      // If insets.bottom is 0, add default padding for nav bar (~48dp)
      // If insets.bottom > 0, it's gesture navigation, use that value
      if (insets.bottom > 0) {
        return insets.bottom;
      }
      // For 3-button navigation where insets.bottom is 0
      // Add extra padding to ensure tab bar is above system nav
      return 16; // Minimum padding when nav bar is sticky-immersive
    }
  };

  const bottomPadding = getBottomPadding();

  // Get tab bar visibility and double-tap event emitter from context
  let tabBarTranslateY;
  let emitScrollToTopAndRefresh = null;
  try {
    const { translateY, emitScrollToTopAndRefresh: emit } = useTabBar();
    tabBarTranslateY = translateY;
    emitScrollToTopAndRefresh = emit;
  } catch (e) {
    // Context not available, use default (no animation)
    tabBarTranslateY = new Animated.Value(0);
  }

  // Track last tap time for each tab for double-tap detection
  const lastTapTimeRef = useRef({});

  // Prevent double navigation - track if navigation is in progress
  const isNavigatingRef = useRef(false);
  const NAVIGATION_COOLDOWN = 400; // ms to prevent double taps

  // Get auth state
  let isAuthenticated = false;
  let user = null;
  try {
    const authContext = useAuth();
    isAuthenticated = authContext?.isAuthenticated || false;
    user = authContext?.user || null;
  } catch (e) {
    // Auth context not available
  }

  // Dynamic notification badge count
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count from BOTH tables
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const [forumCount, systemResult] = await Promise.all([
        forumService.getUnreadNotificationCount(),
        notificationService.getUnreadCount(user?.id),
      ]);
      const total = (forumCount || 0) + (systemResult?.count || 0);
      setUnreadCount(total);
    } catch (error) {
      console.log('[GlassBottomTab] Error fetching unread count:', error);
    }
  }, [isAuthenticated, user?.id]);

  // Refresh count on tab focus changes
  useEffect(() => {
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Also refresh when navigating to notifications tab
  useEffect(() => {
    const currentRoute = state.routes[state.index]?.name;
    let timer;
    if (currentRoute === 'Notifications') {
      // Small delay to let notifications screen update first
      // C12 FIX: Track timeout for cleanup on unmount/re-render
      timer = setTimeout(fetchUnreadCount, 500);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [state.index, fetchUnreadCount]);

  const items = [
    { key: 'Home', label: t('tabs.home', 'Trang Chủ'), Icon: Home },
    { key: 'Shop', label: t('tabs.shop', 'Cửa Hàng'), Icon: ShoppingCart },
    { key: 'Trading', label: t('tabs.trading', 'Giao Dịch'), Icon: BarChart2 },
    { key: 'GemMaster', label: t('tabs.gemMaster', 'Gem Master'), Icon: Star },
    { key: 'Notifications', label: t('tabs.notifications', 'Thông Báo'), Icon: Bell, badge: unreadCount },
    { key: 'Account', label: t('tabs.account', 'Tài Sản'), Icon: Box },
  ];

  // Create themed styles
  const styles = useMemo(() => createStyles(Tokens), [Tokens]);

  const pillWidth = SCREEN_WIDTH * 0.92;
  const itemWidth = pillWidth / items.length;

  const onTabPress = (index, routeName) => {
    const now = Date.now();

    // Prevent double-tap navigation - ignore if navigation is in cooldown
    if (isNavigatingRef.current) {
      return;
    }

    const route = state.routes[index];
    const isFocused = state.index === index;
    const lastTapTime = lastTapTimeRef.current[routeName] || 0;
    const isDoubleTap = now - lastTapTime < DOUBLE_TAP_DELAY;

    // Update last tap time
    lastTapTimeRef.current[routeName] = now;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      if (isFocused) {
        // Already on this tab
        const tabState = route.state;
        const hasNestedScreens = tabState && tabState.index > 0;

        if (hasNestedScreens) {
          // Set navigation cooldown
          isNavigatingRef.current = true;
          setTimeout(() => { isNavigatingRef.current = false; }, NAVIGATION_COOLDOWN);

          // There are nested screens, pop to the root of this tab
          try {
            const firstRoute = tabState.routeNames?.[0] || tabState.routes?.[0]?.name;
            if (firstRoute) {
              navigation.navigate(routeName, { screen: firstRoute });
            } else {
              navigation.navigate(routeName);
            }
          } catch (e) {
            console.warn('[GlassBottomTab] Navigation error:', e.message);
            navigation.navigate(routeName);
          }
        } else if (isDoubleTap) {
          // Double-tap on tab's home screen - scroll to top and refresh
          if (emitScrollToTopAndRefresh) {
            emitScrollToTopAndRefresh(routeName);
          }
        }
        // Single tap on home screen - do nothing
      } else {
        // Navigating to a different tab - set cooldown to prevent double navigation
        isNavigatingRef.current = true;
        setTimeout(() => { isNavigatingRef.current = false; }, NAVIGATION_COOLDOWN);

        // Check if target tab has nested screens and reset it
        const targetRoute = state.routes[index];
        const targetState = targetRoute?.state;
        const targetHasNestedScreens = targetState && targetState.index > 0;

        if (targetHasNestedScreens) {
          navigation.navigate(routeName, {
            screen: targetState.routeNames?.[0] || targetState.routes?.[0]?.name,
          });
        } else {
          navigation.navigate(routeName);
        }
      }
    }
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { bottom: bottomPadding, transform: [{ translateY: tabBarTranslateY }] }]}
    >
      <Shadow
        startColor="rgba(0,0,0,0.65)"
        distance={10}
        offset={[0, 8]}
        containerStyle={styles.shadowWrap}
        radius={Tokens.radius.bar}
      >
        <BlurView
          intensity={Tokens.blurIntensity}
          tint={Tokens.blurTint}
          style={[styles.blur, { width: pillWidth, borderRadius: Tokens.radius.bar }]}
        >
          {/* Glass Morphism Liquid Overlay */}
          <LinearGradient
            colors={Tokens.colors.gradientColors}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Top Sheen for Liquid Effect */}
          <LinearGradient
            colors={Tokens.colors.sheenColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.topSheen}
          />
          {/* Purple Border Glow */}
          <View style={styles.borderGlow} />

          {/* Main pill content */}
          <View style={[styles.pill, { width: pillWidth }]}>
            <View style={[styles.iconRow, { width: pillWidth }]}>
              {items.map((item, index) => {
                const isFocused = state.index === index;
                const IconComponent = item.Icon;

                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => onTabPress(index, item.key)}
                    activeOpacity={0.6}
                    delayPressIn={0}
                    style={[styles.tabItem, { width: itemWidth }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isFocused }}
                  >
                    <View style={styles.iconContainer}>
                      <IconComponent
                        size={isFocused ? Tokens.sizes.activeIcon : Tokens.sizes.icon}
                        color={isFocused ? Tokens.colors.icon : Tokens.colors.iconInactive}
                        strokeWidth={2}
                      />
                      {item.badge > 0 ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: isFocused ? Tokens.colors.icon : Tokens.colors.iconInactive },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BlurView>
      </Shadow>
    </Animated.View>
  );
}

// Styles are now created dynamically inside the component using createStyles function
function createStyles(Tokens) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: Tokens.z.tabBar,
    },
    shadowWrap: {
      alignSelf: 'center',
    },
    blur: {
      overflow: 'hidden',
      backgroundColor: Tokens.colors.barTint,
      alignSelf: 'center',
    },
    pill: {
      height: Tokens.sizes.barHeight,
      borderRadius: Tokens.radius.bar,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      paddingHorizontal: 6,
    },
    iconRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      minHeight: Tokens.touch.minSize,
    },
    iconContainer: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      backgroundColor: '#DC2626',
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: Tokens.colors.badgeBorder,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    tabLabel: {
      fontSize: 10,
      marginTop: 4,
      letterSpacing: 0.2,
      fontWeight: '600',
    },
    topSheen: {
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      height: 20,
      borderRadius: 20,
    },
    borderGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: Tokens.radius.bar,
      borderWidth: 1,
      borderColor: Tokens.colors.borderGlow,
    },
  });
}

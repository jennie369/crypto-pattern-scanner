/**
 * Gemral - Glass Bottom Tab Bar
 * Refined floating pill-style tab bar with deep navy glass effect
 * Supports auto-hide on scroll via TabBarContext
 * Dynamic notification badge count
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Shadow } from 'react-native-shadow-2';
import { Home, ShoppingCart, BarChart2, Star, Bell, Box } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBar } from '../contexts/TabBarContext';
import { forumService } from '../services/forumService';
import { useAuth } from '../contexts/AuthContext';

const DOUBLE_TAP_DELAY = 300; // ms between taps to count as double-tap

const SCREEN_WIDTH = Dimensions.get('window').width;

// Design tokens - matching header dark blue color
const Tokens = {
  colors: {
    bg: '#041027',                         // very deep navy
    barTint: 'rgba(17, 34, 80, 0.85)',     // match header GLASS.background
    rimDark: 'rgba(106, 91, 255, 0.2)',    // purple tint like header border
    rimLight: 'rgba(106, 91, 255, 0.1)',
    icon: 'rgba(255,255,255,0.92)',
    iconInactive: 'rgba(255,255,255,0.48)',
    activeBg: 'rgba(17, 34, 80, 0.95)',    // same dark blue as header
    activeRim: 'rgba(106, 91, 255, 0.3)',  // purple border like header
    innerShadow: 'rgba(0,0,0,0.55)',
    glassAccent: '#112250'                 // header navy color
  },
  spacing: { page: 20 },
  radius: { bar: 40, pill: 32 },
  sizes: { barHeight: 76, icon: 20, activeIcon: 22 },
  z: { base: 0, tabBar: 100 },
  touch: { minSize: 44 },
  glass: {
    blurIntensity: 90,    // stronger frosted look
    rimAlpha: 0.95,
    glowAlpha: 0.22,
    sheenAlpha: 0.06
  }
};

export default function GlassBottomTab({ state, descriptors, navigation }) {
  // Get safe area insets for navigation bar
  const insets = useSafeAreaInsets();

  // Calculate bottom padding based on platform:
  // - iOS: Use insets.bottom (handles notch/home indicator)
  // - Android: Use insets.bottom, but add extra padding for 3-button nav
  //   when insets.bottom is 0 (system nav bar not detected as safe area)
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      // iOS: Trust safe area insets (handles notch, home indicator)
      return Math.max(insets.bottom, 8);
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

  // Get auth state
  let isAuthenticated = false;
  try {
    const authContext = useAuth();
    isAuthenticated = authContext?.isAuthenticated || false;
  } catch (e) {
    // Auth context not available
  }

  // Dynamic notification badge count
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await forumService.getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.log('[GlassBottomTab] Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

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
    if (currentRoute === 'Notifications') {
      // Small delay to let notifications screen update first
      setTimeout(fetchUnreadCount, 500);
    }
  }, [state.index, fetchUnreadCount]);

  const items = [
    { key: 'Home', label: 'Home', Icon: Home },
    { key: 'Shop', label: 'Shop', Icon: ShoppingCart },
    { key: 'Trading', label: 'Giao Dịch', Icon: BarChart2 },
    { key: 'GemMaster', label: 'Gem Master', Icon: Star },
    { key: 'Notifications', label: 'Thông Báo', Icon: Bell, badge: unreadCount },
    { key: 'Account', label: 'Tài Sản', Icon: Box },
  ];

  const pillWidth = SCREEN_WIDTH * 0.92;
  const itemWidth = pillWidth / items.length;

  const onTabPress = (index, routeName) => {
    const route = state.routes[index];
    const isFocused = state.index === index;
    const now = Date.now();
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
          // There are nested screens, pop to the root of this tab
          console.log('[GlassBottomTab] Popping to top for tab:', routeName, 'nested index:', tabState?.index);
          try {
            // Navigate to the first route in the tab's stack instead of popToTop
            // This is more reliable across different navigator configurations
            const firstRoute = tabState.routeNames?.[0] || tabState.routes?.[0]?.name;
            if (firstRoute) {
              navigation.navigate(routeName, { screen: firstRoute });
            } else {
              // Fallback: use goBack multiple times or just navigate to tab
              // Avoid popToTop as it may not be handled
              console.log('[GlassBottomTab] No first route found, navigating to tab root');
              navigation.navigate(routeName);
            }
          } catch (e) {
            console.warn('[GlassBottomTab] Navigation error:', e.message);
            // Fallback: just navigate to the tab
            navigation.navigate(routeName);
          }
        } else if (isDoubleTap) {
          // Double-tap on tab's home screen
          console.log('[GlassBottomTab] Double-tap detected on tab:', routeName);
          // Emit scroll to top and refresh event if handler exists
          if (emitScrollToTopAndRefresh) {
            emitScrollToTopAndRefresh(routeName);
          }
        }
        // Single tap on home screen - do nothing
      } else {
        // Navigating to a different tab
        // Check if target tab has nested screens and reset it
        const targetRoute = state.routes[index];
        const targetState = targetRoute?.state;
        const targetHasNestedScreens = targetState && targetState.index > 0;

        if (targetHasNestedScreens) {
          // Reset target tab to its root screen before navigating
          console.log('[GlassBottomTab] Resetting tab with nested screens:', routeName);
          navigation.navigate(routeName, {
            screen: targetState.routeNames?.[0] || targetState.routes?.[0]?.name,
          });
        } else {
          // Just navigate normally
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
          intensity={Tokens.glass.blurIntensity}
          tint="dark"
          style={[styles.blur, { width: pillWidth, borderRadius: Tokens.radius.bar }]}
        >
          {/* Glass Morphism Liquid Overlay */}
          <LinearGradient
            colors={[
              'rgba(15, 16, 48, 0.65)',
              'rgba(106, 91, 255, 0.12)',
              'rgba(15, 16, 48, 0.75)',
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Top Sheen for Liquid Effect */}
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
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
                    activeOpacity={0.85}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom is now dynamic via inline style (useSafeAreaInsets)
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
    borderColor: 'rgba(17, 34, 80, 0.9)',
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
  // Glass morphism liquid styles
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
    borderColor: 'rgba(106, 91, 255, 0.25)',
  },
});

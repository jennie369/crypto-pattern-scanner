/**
 * useThemedStyles Hook
 * Creates theme-reactive styles that update when app theme changes
 *
 * Usage:
 * const styles = useThemedStyles((colors, theme, spacing) => ({
 *   container: {
 *     backgroundColor: colors.bgDarkest,
 *     padding: spacing.md,
 *   },
 *   title: {
 *     color: colors.textPrimary,
 *     fontSize: 18,
 *   },
 * }));
 */

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

/**
 * useThemedStyles - Create theme-reactive styles
 *
 * @param {function} styleFactory - Function that receives (colors, theme, spacing) and returns style object
 * @returns {object} StyleSheet.create result that updates with theme
 *
 * @example
 * function MyScreen() {
 *   const styles = useThemedStyles((colors, theme, spacing) => ({
 *     container: {
 *       flex: 1,
 *       backgroundColor: colors.bgDarkest,
 *     },
 *     text: {
 *       color: colors.textPrimary,
 *     },
 *   }));
 *
 *   return <View style={styles.container}><Text style={styles.text}>Hello</Text></View>;
 * }
 */
export function useThemedStyles(styleFactory) {
  const { colors, theme, glass, gradients, SPACING, TYPOGRAPHY, settings, getFontSize } = useSettings();

  // Memoize styles based on theme
  const styles = useMemo(() => {
    const styleObject = styleFactory(colors, theme, SPACING, {
      glass,
      gradients,
      typography: TYPOGRAPHY,
      settings,
      getFontSize,
    });
    return StyleSheet.create(styleObject);
  }, [colors, theme, glass, gradients, SPACING, TYPOGRAPHY, settings.theme, settings.fontSize]);

  return styles;
}

/**
 * useThemedValues - Get theme values without creating styles
 * Useful for inline styles or dynamic values
 *
 * @returns {object} Theme values
 */
export function useThemedValues() {
  const { colors, theme, glass, gradients, SPACING, TYPOGRAPHY, settings, getFontSize } = useSettings();

  return useMemo(() => ({
    colors,
    theme,
    glass,
    gradients,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    settings,
    getFontSize,
    // Convenience helpers
    isDark: settings.theme === 'dark',
    isLight: settings.theme === 'light',
  }), [colors, theme, glass, gradients, SPACING, TYPOGRAPHY, settings]);
}

/**
 * createThemedComponent - HOC to wrap component with themed styles
 * Useful for migrating existing components
 *
 * @param {Component} Component - React component to wrap
 * @param {function} styleFactory - Style factory function
 * @returns {Component} Themed component
 */
export function createThemedComponent(Component, styleFactory) {
  return function ThemedComponent(props) {
    const styles = useThemedStyles(styleFactory);
    return <Component {...props} themedStyles={styles} />;
  };
}

export default useThemedStyles;

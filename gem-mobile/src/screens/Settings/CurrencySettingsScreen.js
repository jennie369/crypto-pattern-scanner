/**
 * CurrencySettingsScreen - Currency selection screen
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';

const CURRENCY_OPTIONS = [
  {
    value: 'VND',
    label: 'VND (₫)',
    symbol: '₫',
    example: '1.000.000₫',
    description: 'Đồng Việt Nam',
  },
  {
    value: 'USD',
    label: 'USD ($)',
    symbol: '$',
    example: '$40.82',
    description: 'US Dollar',
  },
];

export default function CurrencySettingsScreen({ navigation }) {
  const {
    settings,
    updateSetting,
    colors,
    gradients,
    SPACING,
    getFontSize,
    t,
    triggerHaptic,
  } = useSettings();

  const handleSelectCurrency = async (currencyValue) => {
    if (currencyValue === settings.currency) return;

    triggerHaptic('success');
    await updateSetting('currency', currencyValue);
  };

  const statusBarStyle = settings.theme === 'light' ? 'dark-content' : 'light-content';
  const backgroundColor = settings.theme === 'light' ? '#FFFFFF' : colors.bgDarkest;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    gradientBg: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.lg,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: getFontSize(20),
      fontWeight: '700',
      color: colors.textPrimary,
      marginLeft: SPACING.md,
    },
    content: {
      paddingHorizontal: SPACING.md,
    },
    optionCard: {
      backgroundColor: settings.theme === 'light' ? '#FFFFFF' : colors.glassBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: settings.theme === 'light' ? '#CCCCCC' : colors.inputBorder,
      overflow: 'hidden',
      ...(settings.theme === 'light' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }),
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.05)'
        : 'rgba(255,255,255,0.05)',
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionSelected: {
      backgroundColor: settings.theme === 'light'
        ? 'rgba(156, 6, 18, 0.05)'
        : 'rgba(106, 91, 255, 0.1)',
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    symbolBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    symbolText: {
      fontSize: getFontSize(18),
      fontWeight: '700',
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: getFontSize(16),
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: getFontSize(13),
      color: colors.textMuted,
    },
    optionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    exampleText: {
      fontSize: getFontSize(14),
      fontWeight: '600',
      color: colors.gold,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.burgundy || colors.primary || '#9C0612',
      justifyContent: 'center',
      alignItems: 'center',
    },
    description: {
      fontSize: getFontSize(13),
      color: colors.textMuted,
      marginTop: SPACING.lg,
      paddingHorizontal: SPACING.sm,
      lineHeight: 20,
    },
    infoCard: {
      marginTop: SPACING.xl,
      backgroundColor: settings.theme === 'light'
        ? 'rgba(0,0,0,0.03)'
        : 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      padding: SPACING.md,
    },
    infoTitle: {
      fontSize: getFontSize(13),
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    infoText: {
      fontSize: getFontSize(12),
      color: colors.textMuted,
      lineHeight: 18,
    },
  });

  const renderBackground = (children) => {
    if (settings.theme === 'light') {
      return <View style={styles.container}>{children}</View>;
    }

    return (
      <LinearGradient
        colors={gradients.background}
        locations={gradients.backgroundLocations}
        style={styles.gradientBg}
      >
        {children}
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {renderBackground(
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('settings.currency.title')}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.optionCard}>
              {CURRENCY_OPTIONS.map((currency, index) => {
                const isSelected = settings.currency === currency.value;
                const isLast = index === CURRENCY_OPTIONS.length - 1;

                // Colors for symbol badge
                const badgeBg = currency.value === 'VND'
                  ? (settings.theme === 'light' ? 'rgba(156, 6, 18, 0.1)' : 'rgba(156, 6, 18, 0.2)')
                  : (settings.theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)');
                const symbolColor = currency.value === 'VND'
                  ? (colors.burgundy || '#9C0612')
                  : '#3B82F6';

                return (
                  <TouchableOpacity
                    key={currency.value}
                    style={[
                      styles.option,
                      isLast && styles.optionLast,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelectCurrency(currency.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.symbolBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.symbolText, { color: symbolColor }]}>
                          {currency.symbol}
                        </Text>
                      </View>
                      <View style={styles.optionContent}>
                        <Text style={styles.optionLabel}>{currency.label}</Text>
                        <Text style={styles.optionDescription}>{currency.description}</Text>
                      </View>
                    </View>

                    <View style={styles.optionRight}>
                      <Text style={styles.exampleText}>{currency.example}</Text>
                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.description}>
              {t('settings.currency.description')}
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Lưu ý</Text>
              <Text style={styles.infoText}>
                Tỷ giá chuyển đổi: 1 USD ≈ 24,500 VND. Giá hiển thị chỉ mang tính tham khảo.
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

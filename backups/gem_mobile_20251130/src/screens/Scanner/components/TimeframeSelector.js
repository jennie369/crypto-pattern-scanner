/**
 * GEM Mobile - Timeframe Selector
 * All timeframes with dropdown + customizable favorites
 * Design tokens v3.0 compliant
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { ChevronDown, Settings, Check, X, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, TYPOGRAPHY, BUTTON, GLASS } from '../../../utils/tokens';

// All available timeframes
const ALL_TIMEFRAMES = [
  { key: '1m', label: '1m', binance: '1m', tradingview: '1', minutes: 1 },
  { key: '3m', label: '3m', binance: '3m', tradingview: '3', minutes: 3 },
  { key: '5m', label: '5m', binance: '5m', tradingview: '5', minutes: 5 },
  { key: '15m', label: '15m', binance: '15m', tradingview: '15', minutes: 15 },
  { key: '30m', label: '30m', binance: '30m', tradingview: '30', minutes: 30 },
  { key: '1h', label: '1H', binance: '1h', tradingview: '60', minutes: 60 },
  { key: '2h', label: '2H', binance: '2h', tradingview: '120', minutes: 120 },
  { key: '4h', label: '4H', binance: '4h', tradingview: '240', minutes: 240 },
  { key: '8h', label: '8H', binance: '8h', tradingview: '480', minutes: 480 },
  { key: '1d', label: '1D', binance: '1d', tradingview: 'D', minutes: 1440 },
  { key: '1w', label: '1W', binance: '1w', tradingview: 'W', minutes: 10080 },
  { key: '1M', label: '1M', binance: '1M', tradingview: 'M', minutes: 43200 },
];

const DEFAULT_VISIBLE = ['1h', '4h', '1d', '1w'];
const STORAGE_KEY = '@gem_scanner_visible_timeframes';

const TimeframeSelector = ({ selected, onSelect }) => {
  const [visibleTimeframes, setVisibleTimeframes] = useState(DEFAULT_VISIBLE);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setVisibleTimeframes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[Timeframe] Load preferences error:', error);
    }
  };

  const savePreferences = async (timeframes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timeframes));
      setVisibleTimeframes(timeframes);
    } catch (error) {
      console.error('[Timeframe] Save preferences error:', error);
    }
  };

  // Get visible timeframe objects
  const visibleTFs = ALL_TIMEFRAMES.filter(tf => visibleTimeframes.includes(tf.key));

  // Toggle timeframe in visible list
  const toggleVisible = (key) => {
    let newVisible;
    if (visibleTimeframes.includes(key)) {
      // Remove (min 2)
      if (visibleTimeframes.length <= 2) return;
      newVisible = visibleTimeframes.filter(k => k !== key);
    } else {
      // Add (max 5)
      if (visibleTimeframes.length >= 5) return;
      newVisible = [...visibleTimeframes, key];
      // Sort by minutes
      newVisible.sort((a, b) => {
        const aMin = ALL_TIMEFRAMES.find(tf => tf.key === a)?.minutes || 0;
        const bMin = ALL_TIMEFRAMES.find(tf => tf.key === b)?.minutes || 0;
        return aMin - bMin;
      });
    }
    savePreferences(newVisible);
  };

  // Handle select from dropdown
  const handleDropdownSelect = (key) => {
    onSelect(key);
    setDropdownVisible(false);
  };

  const resetToDefault = () => {
    savePreferences(DEFAULT_VISIBLE);
  };

  return (
    <View style={styles.container}>
      {/* Visible Timeframe Buttons */}
      <View style={styles.buttonsRow}>
        {visibleTFs.map((tf) => (
          <TouchableOpacity
            key={tf.key}
            style={[
              styles.button,
              selected === tf.key && styles.buttonActive,
            ]}
            onPress={() => onSelect(tf.key)}
          >
            <Text style={[
              styles.buttonText,
              selected === tf.key && styles.buttonTextActive,
            ]}>
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* More Button */}
        <TouchableOpacity
          style={[styles.button, styles.moreButton]}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.buttonText}>More</Text>
          <ChevronDown size={14} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Settings size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal - All Timeframes */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContent}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Timeframe</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.dropdownGrid}>
              {ALL_TIMEFRAMES.map((tf) => (
                <TouchableOpacity
                  key={tf.key}
                  style={[
                    styles.dropdownItem,
                    selected === tf.key && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleDropdownSelect(tf.key)}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selected === tf.key && styles.dropdownItemTextActive,
                  ]}>
                    {tf.label}
                  </Text>
                  {selected === tf.key && (
                    <Check size={14} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settings Modal - Customize visible timeframes */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SafeAreaView style={styles.settingsContainer}>
          <View style={styles.settingsContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Customize Timeframes</Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.settingsSubtitle}>
              Select 2-5 timeframes to show on main screen
            </Text>

            <View style={styles.settingsList}>
              {ALL_TIMEFRAMES.map((tf) => {
                const isVisible = visibleTimeframes.includes(tf.key);
                const canToggle = isVisible ? visibleTimeframes.length > 2 : visibleTimeframes.length < 5;

                return (
                  <TouchableOpacity
                    key={tf.key}
                    style={[
                      styles.settingsItem,
                      isVisible && styles.settingsItemActive,
                      !canToggle && !isVisible && styles.settingsItemDisabled,
                    ]}
                    onPress={() => toggleVisible(tf.key)}
                    disabled={!canToggle && !isVisible}
                  >
                    <View style={[
                      styles.settingsCheckbox,
                      isVisible && styles.settingsCheckboxActive,
                    ]}>
                      {isVisible && <Check size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={[
                      styles.settingsItemText,
                      !canToggle && !isVisible && styles.settingsItemTextDisabled,
                    ]}>
                      {tf.label}
                    </Text>
                    <Text style={styles.settingsItemMinutes}>
                      {tf.minutes < 60 ? `${tf.minutes}m` :
                       tf.minutes < 1440 ? `${tf.minutes / 60}h` :
                       tf.minutes < 10080 ? `${tf.minutes / 1440}d` :
                       tf.minutes < 43200 ? `${tf.minutes / 10080}w` : '1mo'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefault}
            >
              <RotateCcw size={16} color={COLORS.textMuted} />
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },

  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  button: {
    flex: 1,
    paddingVertical: BUTTON.timeframe.paddingVertical,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },

  buttonActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },

  buttonText: {
    fontSize: BUTTON.timeframe.fontSize,
    fontWeight: BUTTON.timeframe.fontWeight,
    color: COLORS.textMuted,
  },

  buttonTextActive: {
    color: COLORS.gold,
  },

  moreButton: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },

  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dropdown
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },

  dropdownContent: {
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },

  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  dropdownTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  dropdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '23%',
    paddingVertical: SPACING.md,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },

  dropdownItemActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },

  dropdownItemText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  dropdownItemTextActive: {
    color: COLORS.gold,
  },

  // Settings
  settingsContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },

  settingsContent: {
    flex: 1,
    padding: SPACING.xxl,
  },

  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  settingsTitle: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  doneButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  doneButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  settingsSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxl,
  },

  settingsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BUTTON.timeframe.borderRadius,
    backgroundColor: GLASS.background,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  settingsItemActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderColor: COLORS.purple,
  },

  settingsItemDisabled: {
    opacity: 0.5,
  },

  settingsCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingsCheckboxActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },

  settingsItemText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },

  settingsItemTextDisabled: {
    color: COLORS.textMuted,
  },

  settingsItemMinutes: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxxl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },

  resetButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
});

// Export timeframes for external use
export { ALL_TIMEFRAMES };
export default TimeframeSelector;

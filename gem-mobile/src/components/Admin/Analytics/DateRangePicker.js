/**
 * DateRangePicker Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Date range selection with preset options
 *
 * Created: January 30, 2026
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Calendar,
  ChevronDown,
  X,
  Check,
} from 'lucide-react-native';
import { useSettings } from '../../../contexts/SettingsContext';

const DATE_RANGES = {
  TODAY: { label: 'Hôm nay', days: 0 },
  YESTERDAY: { label: 'Hôm qua', days: 1 },
  LAST_7_DAYS: { label: '7 ngày qua', days: 7 },
  LAST_14_DAYS: { label: '14 ngày qua', days: 14 },
  LAST_30_DAYS: { label: '30 ngày qua', days: 30 },
  LAST_90_DAYS: { label: '90 ngày qua', days: 90 },
  THIS_MONTH: { label: 'Tháng này', type: 'month' },
  LAST_MONTH: { label: 'Tháng trước', type: 'lastMonth' },
  THIS_YEAR: { label: 'Năm nay', type: 'year' },
};

const DateRangePicker = ({
  value = 'LAST_7_DAYS',
  onChange,
  style,
  compact = false,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [showModal, setShowModal] = useState(false);

  const currentRange = DATE_RANGES[value] || DATE_RANGES.LAST_7_DAYS;

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      gap: 8,
    },
    buttonCompact: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    buttonText: {
      fontSize: 13,
      color: colors.textPrimary,
    },
    buttonTextCompact: {
      fontSize: 11,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    modalContent: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : '#1A1B3D',
      borderRadius: 20,
      width: '100%',
      maxWidth: 320,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    optionsList: {
      padding: SPACING.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: 12,
      marginVertical: 2,
    },
    optionSelected: {
      backgroundColor: 'rgba(106, 91, 255, 0.15)',
    },
    optionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    optionTextSelected: {
      color: colors.purple,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const getDateRange = (rangeKey) => {
    const range = DATE_RANGES[rangeKey];
    const now = new Date();
    let startDate, endDate;

    if (range.type === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    } else if (range.type === 'lastMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (range.type === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
    } else if (range.days === 0) {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = now;
    } else if (range.days === 1) {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    } else {
      startDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000);
      endDate = now;
    }

    return { startDate, endDate };
  };

  const handleSelect = (rangeKey) => {
    const { startDate, endDate } = getDateRange(rangeKey);
    onChange?.({
      key: rangeKey,
      label: DATE_RANGES[rangeKey].label,
      startDate,
      endDate,
    });
    setShowModal(false);
  };

  const formatDateRange = () => {
    const { startDate, endDate } = getDateRange(value);
    const formatDate = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

    if (value === 'TODAY') return 'Hôm nay';
    if (value === 'YESTERDAY') return 'Hôm qua';

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          compact && styles.buttonCompact,
          style,
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Calendar size={compact ? 14 : 16} color={colors.purple} />
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {compact ? currentRange.label : formatDateRange()}
        </Text>
        <ChevronDown size={compact ? 12 : 14} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khoảng thời gian</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {Object.entries(DATE_RANGES).map(([key, range]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.option,
                    value === key && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === key && styles.optionTextSelected,
                    ]}
                  >
                    {range.label}
                  </Text>
                  {value === key && (
                    <Check size={18} color={colors.purple} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export { DATE_RANGES };
export default DateRangePicker;

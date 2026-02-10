/**
 * ExportButton Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Export data functionality with multiple formats
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Download,
  FileText,
  Table,
  X,
  Check,
} from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSettings } from '../../../contexts/SettingsContext';

const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV', icon: Table, description: 'Excel, Google Sheets' },
  { id: 'json', label: 'JSON', icon: FileText, description: 'Dữ liệu thô' },
];

const ExportButton = ({
  data = [],
  filename = 'analytics_export',
  columns = [],
  onExport,
  disabled = false,
  compact = false,
  style,
}) => {
  const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.2)',
      gap: 6,
    },
    buttonCompact: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 6,
      borderRadius: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 13,
      color: colors.textPrimary,
    },
    buttonTextDisabled: {
      color: colors.textMuted,
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

    dataInfo: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: SPACING.md,
    },

    formatList: {
      padding: SPACING.md,
    },
    formatOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: 12,
      marginBottom: SPACING.sm,
      backgroundColor: 'rgba(106, 91, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    formatOptionSelected: {
      backgroundColor: 'rgba(106, 91, 255, 0.15)',
      borderColor: colors.purple,
    },
    formatIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(106, 91, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    formatInfo: {
      flex: 1,
    },
    formatLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    formatLabelSelected: {
      color: colors.purple,
    },
    formatDescription: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return '';

    const headers = columns.length > 0
      ? columns.map(c => c.label || c.key)
      : Object.keys(data[0]);

    const keys = columns.length > 0
      ? columns.map(c => c.key)
      : Object.keys(data[0]);

    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const handleExport = async (format) => {
    setSelectedFormat(format);
    setExporting(true);

    try {
      let content;
      let fileExtension;
      let mimeType;

      if (format === 'csv') {
        content = convertToCSV(data, columns);
        fileExtension = 'csv';
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(data, null, 2);
        fileExtension = 'json';
        mimeType = 'application/json';
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}.${fileExtension}`;
      const filePath = `${FileSystem.documentDirectory}${fullFilename}`;

      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType,
          dialogTitle: 'Xuất dữ liệu Analytics',
        });
      } else {
        Alert.alert(
          'Thành công',
          `Đã lưu file ${fullFilename}`,
          [{ text: 'OK' }]
        );
      }

      onExport?.({ format, filename: fullFilename, rowCount: data.length });
      setShowModal(false);

    } catch (error) {
      console.error('[ExportButton] Export error:', error);
      Alert.alert('Lỗi', 'Không thể xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          compact && styles.buttonCompact,
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={() => setShowModal(true)}
        disabled={disabled || data.length === 0}
        activeOpacity={0.7}
      >
        <Download size={compact ? 14 : 16} color={disabled ? colors.textMuted : colors.textPrimary} />
        {!compact && (
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            Xuất
          </Text>
        )}
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
          onPress={() => !exporting && setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xuất dữ liệu</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                disabled={exporting}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.dataInfo}>
              {data.length} bản ghi sẽ được xuất
            </Text>

            <View style={styles.formatList}>
              {EXPORT_FORMATS.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.id;

                return (
                  <TouchableOpacity
                    key={format.id}
                    style={[
                      styles.formatOption,
                      isSelected && styles.formatOptionSelected,
                    ]}
                    onPress={() => handleExport(format.id)}
                    disabled={exporting}
                  >
                    <View style={styles.formatIcon}>
                      {exporting && isSelected ? (
                        <ActivityIndicator size="small" color={colors.purple} />
                      ) : (
                        <Icon size={20} color={isSelected ? colors.purple : colors.textSecondary} />
                      )}
                    </View>
                    <View style={styles.formatInfo}>
                      <Text style={[styles.formatLabel, isSelected && styles.formatLabelSelected]}>
                        {format.label}
                      </Text>
                      <Text style={styles.formatDescription}>{format.description}</Text>
                    </View>
                    {isSelected && !exporting && (
                      <Check size={18} color={colors.purple} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ExportButton;

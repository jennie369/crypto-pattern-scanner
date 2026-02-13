/**
 * ColorPicker Component
 * Color picker with wheel/palette UI for admin screens
 * Features: Preset colors, HSL wheel, hex input
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Palette, Pipette } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 280);

// Preset color palettes
const PRESET_COLORS = {
  'Đỏ & Hồng': ['#FF4757', '#FF6B81', '#FF0000', '#DC143C', '#C71585', '#FF1493', '#FF69B4', '#FFB6C1'],
  'Cam & Vàng': ['#FFA502', '#FF9500', '#FFD700', '#FFBD59', '#F9A825', '#FFEB3B', '#FFC107', '#FF8C00'],
  'Xanh lá': ['#2ED573', '#00D68F', '#00C853', '#4CAF50', '#8BC34A', '#CDDC39', '#009688', '#00BFA5'],
  'Xanh dương': ['#1E90FF', '#3742FA', '#0984E3', '#2196F3', '#03A9F4', '#00BCD4', '#0097A7', '#00ACC1'],
  'Tím': ['#A855F7', '#9C27B0', '#6A5BFF', '#7C4DFF', '#651FFF', '#8E24AA', '#AB47BC', '#BA68C8'],
  'Trung tính': ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E', '#757575', '#424242', '#212121', '#000000'],
};

// Convert HSL to Hex
const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

// Convert Hex to HSL
const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Validate hex color
const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

const ColorPicker = memo(({
  value = '#FF4757',
  onChange,
  label = 'Màu',
  placeholder = '#FFFFFF',
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  const [hexInput, setHexInput] = useState(value);

  const handleOpen = useCallback(() => {
    setTempColor(value);
    setHsl(hexToHsl(value));
    setHexInput(value);
    setModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [value]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    onChange?.(tempColor);
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [tempColor, onChange]);

  const handlePresetSelect = useCallback((color) => {
    setTempColor(color);
    setHsl(hexToHsl(color));
    setHexInput(color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleHexChange = useCallback((text) => {
    setHexInput(text);
    if (isValidHex(text)) {
      setTempColor(text.toUpperCase());
      setHsl(hexToHsl(text));
    }
  }, []);

  const handleHueChange = useCallback((newHue) => {
    const newHsl = { ...hsl, h: Math.round(newHue) };
    setHsl(newHsl);
    const newColor = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setTempColor(newColor);
    setHexInput(newColor);
  }, [hsl]);

  const handleSaturationLightnessChange = useCallback((s, l) => {
    const newHsl = { h: hsl.h, s: Math.round(s), l: Math.round(l) };
    setHsl(newHsl);
    const newColor = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setTempColor(newColor);
    setHexInput(newColor);
  }, [hsl.h]);

  // Hue slider pan responder
  const huePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = evt.nativeEvent.locationX;
      const hue = Math.max(0, Math.min(360, (x / (WHEEL_SIZE - 20)) * 360));
      handleHueChange(hue);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX;
      const hue = Math.max(0, Math.min(360, (x / (WHEEL_SIZE - 20)) * 360));
      handleHueChange(hue);
    },
  });

  // Saturation/Lightness box pan responder
  const slPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const s = Math.max(0, Math.min(100, (locationX / (WHEEL_SIZE - 20)) * 100));
      const l = Math.max(0, Math.min(100, 100 - (locationY / 120) * 100));
      handleSaturationLightnessChange(s, l);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const s = Math.max(0, Math.min(100, (locationX / (WHEEL_SIZE - 20)) * 100));
      const l = Math.max(0, Math.min(100, 100 - (locationY / 120) * 100));
      handleSaturationLightnessChange(s, l);
    },
  });

  return (
    <>
      {/* Color Input with Preview */}
      <View style={[styles.inputContainer, style]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[styles.colorPreview, { backgroundColor: value }]}
            onPress={handleOpen}
            activeOpacity={0.8}
          >
            <Palette size={16} color={hsl.l > 50 ? '#000' : '#FFF'} />
          </TouchableOpacity>
          <TextInput
            style={styles.hexInput}
            value={value}
            onChangeText={(text) => {
              if (isValidHex(text)) {
                onChange?.(text.toUpperCase());
              }
            }}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={7}
          />
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={handleOpen}
            activeOpacity={0.7}
          >
            <Pipette size={18} color={COLORS.purple} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Color Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn màu</Text>
              <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                <Check size={24} color={COLORS.success} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContentContainer}
            >
              {/* Preview */}
              <View style={styles.previewSection}>
                <View style={[styles.previewBox, { backgroundColor: tempColor }]}>
                  <Text style={[styles.previewText, { color: hsl.l > 50 ? '#000' : '#FFF' }]}>
                    {tempColor}
                  </Text>
                </View>
              </View>

              {/* Hex Input */}
              <View style={styles.hexInputSection}>
                <Text style={styles.sectionLabel}>Mã màu HEX</Text>
                <TextInput
                  style={styles.modalHexInput}
                  value={hexInput}
                  onChangeText={handleHexChange}
                  placeholder="#FF4757"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  maxLength={7}
                />
              </View>

              {/* Hue Slider */}
              <View style={styles.sliderSection}>
                <Text style={styles.sectionLabel}>Màu sắc (Hue)</Text>
                <View style={styles.hueSliderContainer} {...huePanResponder.panHandlers}>
                  <LinearGradient
                    colors={[
                      '#FF0000', '#FFFF00', '#00FF00', '#00FFFF',
                      '#0000FF', '#FF00FF', '#FF0000'
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.hueSlider}
                  />
                  <View
                    style={[
                      styles.hueThumb,
                      { left: (hsl.h / 360) * (WHEEL_SIZE - 40) }
                    ]}
                  />
                </View>
              </View>

              {/* Saturation/Lightness Box */}
              <View style={styles.sliderSection}>
                <Text style={styles.sectionLabel}>Độ bão hòa & Độ sáng</Text>
                <View style={styles.slBoxContainer} {...slPanResponder.panHandlers}>
                  <LinearGradient
                    colors={['#FFF', hslToHex(hsl.h, 100, 50)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.slBox}
                  >
                    <LinearGradient
                      colors={['transparent', '#000']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </LinearGradient>
                  <View
                    style={[
                      styles.slThumb,
                      {
                        left: (hsl.s / 100) * (WHEEL_SIZE - 40),
                        top: ((100 - hsl.l) / 100) * 100,
                      }
                    ]}
                  />
                </View>
              </View>

              {/* Preset Colors */}
              <View style={styles.presetsSection}>
                <Text style={styles.sectionLabel}>Màu có sẵn</Text>
                {Object.entries(PRESET_COLORS).map(([category, colors]) => (
                  <View key={category} style={styles.presetCategory}>
                    <Text style={styles.categoryLabel}>{category}</Text>
                    <View style={styles.presetRow}>
                      {colors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.presetColor,
                            { backgroundColor: color },
                            tempColor === color && styles.presetColorSelected,
                          ]}
                          onPress={() => handlePresetSelect(color)}
                          activeOpacity={0.7}
                        >
                          {tempColor === color && (
                            <Check size={16} color={hexToHsl(color).l > 50 ? '#000' : '#FFF'} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

ColorPicker.displayName = 'ColorPicker';

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  colorPreview: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  hexInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  pickerButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.purple,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.bgDarkest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },

  // Preview
  previewSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  previewBox: {
    width: WHEEL_SIZE,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Hex input
  hexInputSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  modalHexInput: {
    height: 48,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    textAlign: 'center',
  },

  // Hue slider
  sliderSection: {
    marginBottom: SPACING.xl,
  },
  hueSliderContainer: {
    width: WHEEL_SIZE - 20,
    height: 30,
    alignSelf: 'center',
    position: 'relative',
  },
  hueSlider: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    marginTop: 5,
  },
  hueThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#333',
    top: 3,
    marginLeft: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Saturation/Lightness box
  slBoxContainer: {
    width: WHEEL_SIZE - 20,
    height: 120,
    alignSelf: 'center',
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  slBox: {
    width: '100%',
    height: '100%',
  },
  slThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFF',
    marginLeft: -10,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  // Presets
  presetsSection: {
    marginTop: SPACING.md,
  },
  presetCategory: {
    marginBottom: SPACING.lg,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  presetColor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetColorSelected: {
    borderColor: COLORS.gold,
    transform: [{ scale: 1.1 }],
  },
});

export default ColorPicker;

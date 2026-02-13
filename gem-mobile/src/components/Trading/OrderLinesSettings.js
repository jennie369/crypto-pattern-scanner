/**
 * GEM Scanner - Order Lines Settings Modal
 * Consistent with app theme (Dark Blue Glass)
 * Features: Color wheel picker, line style selector
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Dimensions,
  Platform,
  TextInput,
  PanResponder,
} from 'react-native';
import {
  X,
  TrendingUp,
  Target,
  Shield,
  AlertTriangle,
  Clock,
  Palette,
  Check,
  RotateCcw,
  Eye,
  DollarSign,
  Percent,
  Minus,
  MoreHorizontal,
  Pipette,
} from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G, Path } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { chartPreferencesService } from '../../services/chartPreferencesService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Quick preset colors (smaller set for quick access)
const PRESET_COLORS = [
  '#FFBD59', '#00F0FF', '#22C55E', '#EF4444',
  '#3B82F6', '#A855F7', '#F97316', '#FFFFFF',
  '#EC4899', '#14B8A6', '#6B7280', '#FBBF24',
];

// Helper functions for color conversion
const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
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

// Line style options
const LINE_STYLE_OPTIONS = [
  { id: 0, label: 'Solid', icon: 'solid' },
  { id: 1, label: 'Dashed', icon: 'dashed' },
  { id: 2, label: 'Dotted', icon: 'dotted' },
];

// Color Wheel Picker Component
const ColorWheelPicker = ({ visible, currentColor, onColorSelect, onClose }) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState(currentColor || '#FFBD59');

  const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 240);
  const WHEEL_RADIUS = WHEEL_SIZE / 2;
  const INNER_RADIUS = WHEEL_RADIUS - 30;

  useEffect(() => {
    if (currentColor) {
      const hsl = hexToHsl(currentColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setHexInput(currentColor);
    }
  }, [currentColor, visible]);

  const selectedColor = hslToHex(hue, saturation, lightness);

  const handleWheelTouch = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const centerX = WHEEL_RADIUS;
    const centerY = WHEEL_RADIUS;
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only respond if touch is within the ring
    if (distance >= INNER_RADIUS && distance <= WHEEL_RADIUS) {
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setHue(Math.round(angle));
      setHexInput(hslToHex(Math.round(angle), saturation, lightness));
    }
  };

  const handleHexChange = (text) => {
    setHexInput(text);
    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
      const hsl = hexToHsl(text);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  };

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  if (!visible) return null;

  // Generate color wheel segments
  const wheelSegments = [];
  for (let i = 0; i < 360; i += 10) {
    const startAngle = (i - 90) * (Math.PI / 180);
    const endAngle = (i + 10 - 90) * (Math.PI / 180);
    const x1 = WHEEL_RADIUS + WHEEL_RADIUS * Math.cos(startAngle);
    const y1 = WHEEL_RADIUS + WHEEL_RADIUS * Math.sin(startAngle);
    const x2 = WHEEL_RADIUS + WHEEL_RADIUS * Math.cos(endAngle);
    const y2 = WHEEL_RADIUS + WHEEL_RADIUS * Math.sin(endAngle);
    const x3 = WHEEL_RADIUS + INNER_RADIUS * Math.cos(endAngle);
    const y3 = WHEEL_RADIUS + INNER_RADIUS * Math.sin(endAngle);
    const x4 = WHEEL_RADIUS + INNER_RADIUS * Math.cos(startAngle);
    const y4 = WHEEL_RADIUS + INNER_RADIUS * Math.sin(startAngle);

    wheelSegments.push(
      <Path
        key={i}
        d={`M ${x1} ${y1} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${x4} ${y4} Z`}
        fill={hslToHex(i, 100, 50)}
      />
    );
  }

  // Hue indicator position
  const indicatorAngle = (hue - 90) * (Math.PI / 180);
  const indicatorRadius = (WHEEL_RADIUS + INNER_RADIUS) / 2;
  const indicatorX = WHEEL_RADIUS + indicatorRadius * Math.cos(indicatorAngle);
  const indicatorY = WHEEL_RADIUS + indicatorRadius * Math.sin(indicatorAngle);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={colorWheelStyles.overlay}>
        <View style={colorWheelStyles.container}>
          {/* Header */}
          <View style={colorWheelStyles.header}>
            <Pipette size={20} color={COLORS.gold} />
            <Text style={colorWheelStyles.title}>Chọn Màu Tùy Chỉnh</Text>
            <TouchableOpacity onPress={onClose} style={colorWheelStyles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Color Wheel */}
          <View style={colorWheelStyles.wheelContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleWheelTouch}
              onPressIn={handleWheelTouch}
            >
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                <G>{wheelSegments}</G>
                {/* Center circle with selected color */}
                <Circle
                  cx={WHEEL_RADIUS}
                  cy={WHEEL_RADIUS}
                  r={INNER_RADIUS - 5}
                  fill={selectedColor}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={2}
                />
                {/* Hue indicator */}
                <Circle
                  cx={indicatorX}
                  cy={indicatorY}
                  r={8}
                  fill={hslToHex(hue, 100, 50)}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Saturation Slider */}
          <View style={colorWheelStyles.sliderRow}>
            <Text style={colorWheelStyles.sliderLabel}>Bão hòa</Text>
            <View style={colorWheelStyles.sliderTrack}>
              <View style={[colorWheelStyles.sliderFill, { width: `${saturation}%`, backgroundColor: hslToHex(hue, 100, 50) }]} />
              <TouchableOpacity
                style={[colorWheelStyles.sliderThumb, { left: `${saturation}%` }]}
                onPress={() => {}}
              />
            </View>
            <Text style={colorWheelStyles.sliderValue}>{saturation}%</Text>
          </View>

          {/* Lightness Slider */}
          <View style={colorWheelStyles.sliderRow}>
            <Text style={colorWheelStyles.sliderLabel}>Độ sáng</Text>
            <View style={colorWheelStyles.sliderTrack}>
              <View style={[colorWheelStyles.sliderFill, { width: `${lightness}%`, backgroundColor: '#FFFFFF' }]} />
              <TouchableOpacity
                style={[colorWheelStyles.sliderThumb, { left: `${lightness}%` }]}
                onPress={() => {}}
              />
            </View>
            <Text style={colorWheelStyles.sliderValue}>{lightness}%</Text>
          </View>

          {/* Quick Adjust Buttons */}
          <View style={colorWheelStyles.quickButtons}>
            {[25, 50, 75, 100].map((val) => (
              <TouchableOpacity
                key={`sat-${val}`}
                style={[colorWheelStyles.quickBtn, saturation === val && colorWheelStyles.quickBtnActive]}
                onPress={() => {
                  setSaturation(val);
                  setHexInput(hslToHex(hue, val, lightness));
                }}
              >
                <Text style={colorWheelStyles.quickBtnText}>S:{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={colorWheelStyles.quickButtons}>
            {[25, 40, 50, 60, 75].map((val) => (
              <TouchableOpacity
                key={`lit-${val}`}
                style={[colorWheelStyles.quickBtn, lightness === val && colorWheelStyles.quickBtnActive]}
                onPress={() => {
                  setLightness(val);
                  setHexInput(hslToHex(hue, saturation, val));
                }}
              >
                <Text style={colorWheelStyles.quickBtnText}>L:{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hex Input */}
          <View style={colorWheelStyles.hexRow}>
            <Text style={colorWheelStyles.hexLabel}>HEX:</Text>
            <TextInput
              style={colorWheelStyles.hexInput}
              value={hexInput}
              onChangeText={handleHexChange}
              placeholder="#FFBD59"
              placeholderTextColor="#666"
              maxLength={7}
              autoCapitalize="characters"
            />
            <View style={[colorWheelStyles.previewBox, { backgroundColor: selectedColor }]} />
          </View>

          {/* Action Buttons */}
          <View style={colorWheelStyles.actions}>
            <TouchableOpacity style={colorWheelStyles.cancelBtn} onPress={onClose}>
              <Text style={colorWheelStyles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={colorWheelStyles.confirmBtn} onPress={handleConfirm}>
              <Check size={18} color="#FFF" />
              <Text style={colorWheelStyles.confirmText}>Xác Nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const colorWheelStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#0F1030',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 8,
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sliderLabel: {
    width: 70,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sliderTrack: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 12,
    opacity: 0.5,
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  sliderValue: {
    width: 45,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 6,
  },
  quickBtnActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  quickBtnText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  hexLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  hexInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  previewBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmText: {
    fontSize: 15,
    color: '#1A202C',
    fontWeight: '700',
  },
});

// Settings configuration
const VISIBILITY_SETTINGS = [
  {
    key: 'showEntryLines',
    label: 'Đường Entry',
    description: 'Hiển thị giá Entry của vị thế',
    icon: TrendingUp,
    colorKey: 'entryLineColor',
    styleKey: 'entryLineStyle',
    defaultColor: '#FFBD59',
    defaultStyle: 0,
  },
  {
    key: 'showTPLines',
    label: 'Đường Chốt Lời (TP)',
    description: 'Hiển thị giá TP của vị thế',
    icon: Target,
    colorKey: 'tpLineColor',
    styleKey: 'tpLineStyle',
    defaultColor: '#22C55E',
    defaultStyle: 1,
  },
  {
    key: 'showSLLines',
    label: 'Đường Cắt Lỗ (SL)',
    description: 'Hiển thị giá SL của vị thế',
    icon: Shield,
    colorKey: 'slLineColor',
    styleKey: 'slLineStyle',
    defaultColor: '#EF4444',
    defaultStyle: 1,
  },
  {
    key: 'showLiquidationLines',
    label: 'Đường Thanh Lý',
    description: 'Hiển thị giá thanh lý',
    icon: AlertTriangle,
    colorKey: 'liquidationLineColor',
    styleKey: 'liquidationLineStyle',
    defaultColor: '#A855F7',
    defaultStyle: 2,
  },
  {
    key: 'showPendingOrders',
    label: 'Lệnh Chờ Khớp',
    description: 'Hiển thị lệnh chờ khớp',
    icon: Clock,
    colorKey: 'pendingLineColor',
    styleKey: 'pendingLineStyle',
    defaultColor: '#00F0FF',
    defaultStyle: 2,
  },
];

// Default preferences
const DEFAULT_PREFS = {
  showEntryLines: true,
  showTPLines: true,
  showSLLines: true,
  showLiquidationLines: true,
  showPendingOrders: true,
  // Colors
  entryLineColor: '#FFBD59',
  tpLineColor: '#22C55E',
  slLineColor: '#EF4444',
  liquidationLineColor: '#A855F7',
  pendingLineColor: '#00F0FF',
  // Line Styles (0=Solid, 1=Dashed, 2=Dotted)
  entryLineStyle: 0,
  tpLineStyle: 1,
  slLineStyle: 1,
  liquidationLineStyle: 2,
  pendingLineStyle: 2,
  // Display options
  showPnlOnLines: true,
  showPercentOnLines: true,
};

const OrderLinesSettings = ({
  visible = false,
  onClose,
  preferences = {},
  onPreferencesChange,
}) => {
  const [localPrefs, setLocalPrefs] = useState({ ...DEFAULT_PREFS, ...preferences });
  const [editingColor, setEditingColor] = useState(null);
  const [editingStyle, setEditingStyle] = useState(null);
  // Color wheel picker state
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [colorWheelTarget, setColorWheelTarget] = useState(null); // which colorKey is being edited

  useEffect(() => {
    if (visible) {
      setLocalPrefs({ ...DEFAULT_PREFS, ...preferences });
      setEditingColor(null);
      setEditingStyle(null);
      setShowColorWheel(false);
      setColorWheelTarget(null);
    }
  }, [visible, preferences]);

  const handleToggle = async (key) => {
    const newValue = !localPrefs[key];
    const newPrefs = { ...localPrefs, [key]: newValue };
    setLocalPrefs(newPrefs);

    try {
      await chartPreferencesService.updatePreference(key, newValue);
      onPreferencesChange?.(newPrefs);
    } catch (error) {
      console.error('[OrderLinesSettings] Toggle error:', error);
    }
  };

  const handleColorChange = async (colorKey, color) => {
    const newPrefs = { ...localPrefs, [colorKey]: color };
    setLocalPrefs(newPrefs);
    setEditingColor(null);

    try {
      await chartPreferencesService.updatePreference(colorKey, color);
      onPreferencesChange?.(newPrefs);
    } catch (error) {
      console.error('[OrderLinesSettings] Color change error:', error);
    }
  };

  const handleStyleChange = async (styleKey, styleId) => {
    const newPrefs = { ...localPrefs, [styleKey]: styleId };
    setLocalPrefs(newPrefs);
    setEditingStyle(null);

    try {
      await chartPreferencesService.updatePreference(styleKey, styleId);
      onPreferencesChange?.(newPrefs);
    } catch (error) {
      console.error('[OrderLinesSettings] Style change error:', error);
    }
  };

  const handleReset = async () => {
    try {
      const defaultPrefs = await chartPreferencesService.resetToDefaults();
      setLocalPrefs({ ...DEFAULT_PREFS, ...defaultPrefs });
      onPreferencesChange?.(defaultPrefs);
    } catch (error) {
      console.error('[OrderLinesSettings] Reset error:', error);
    }
  };

  // Render line style icon
  const renderLineStyleIcon = (styleId, color = COLORS.textMuted, size = 20) => {
    const lineY = 10;
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {styleId === 0 ? (
          // Solid line
          <View style={{ width: size - 4, height: 2, backgroundColor: color }} />
        ) : styleId === 1 ? (
          // Dashed line
          <View style={{ flexDirection: 'row', gap: 2 }}>
            <View style={{ width: 4, height: 2, backgroundColor: color }} />
            <View style={{ width: 4, height: 2, backgroundColor: color }} />
            <View style={{ width: 4, height: 2, backgroundColor: color }} />
          </View>
        ) : (
          // Dotted line
          <View style={{ flexDirection: 'row', gap: 3 }}>
            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          </View>
        )}
      </View>
    );
  };

  const renderSettingItem = (setting) => {
    const { key, label, description, icon: Icon, colorKey, styleKey, defaultColor, defaultStyle } = setting;
    const isEnabled = localPrefs[key] !== false;
    const color = localPrefs[colorKey] || defaultColor;
    const lineStyle = localPrefs[styleKey] ?? defaultStyle ?? 0;
    const isEditingThisColor = editingColor === colorKey;
    const isEditingThisStyle = editingStyle === styleKey;

    return (
      <View key={key} style={styles.settingItem}>
        <View style={styles.settingHeader}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Icon size={18} color={color} />
          </View>

          {/* Label & Description */}
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>

          {/* Toggle */}
          <Switch
            value={isEnabled}
            onValueChange={() => handleToggle(key)}
            trackColor={{ false: 'rgba(106, 91, 255, 0.2)', true: 'rgba(255,189,89,0.4)' }}
            thumbColor={isEnabled ? COLORS.gold : 'rgba(255,255,255,0.5)'}
            ios_backgroundColor="rgba(106, 91, 255, 0.2)"
          />
        </View>

        {/* Color & Style Picker Row */}
        {isEnabled && (
          <View style={styles.colorRow}>
            {/* Color Picker */}
            <Text style={styles.colorLabel}>Màu:</Text>
            <TouchableOpacity
              style={[styles.colorButton, isEditingThisColor && styles.colorButtonActive]}
              onPress={() => {
                setEditingColor(isEditingThisColor ? null : colorKey);
                setEditingStyle(null);
              }}
            >
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Palette size={14} color={isEditingThisColor ? COLORS.gold : COLORS.textMuted} />
            </TouchableOpacity>

            {/* Line Style Picker */}
            <Text style={[styles.colorLabel, { marginLeft: 12 }]}>Kiểu:</Text>
            <TouchableOpacity
              style={[styles.colorButton, isEditingThisStyle && styles.colorButtonActive]}
              onPress={() => {
                setEditingStyle(isEditingThisStyle ? null : styleKey);
                setEditingColor(null);
              }}
            >
              {renderLineStyleIcon(lineStyle, isEditingThisStyle ? COLORS.gold : color)}
              <Text style={[styles.styleLabel, isEditingThisStyle && { color: COLORS.gold }]}>
                {LINE_STYLE_OPTIONS[lineStyle]?.label || 'Solid'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Color Picker Panel - Compact with Color Wheel */}
        {isEnabled && isEditingThisColor && (
          <View style={styles.colorPickerCompact}>
            {/* Preset Colors - Smaller Grid */}
            <View style={styles.presetGrid}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorOptionSmall,
                    { backgroundColor: c },
                    color === c && styles.colorOptionSmallSelected,
                  ]}
                  onPress={() => handleColorChange(colorKey, c)}
                >
                  {color === c && (
                    <Check size={10} color={c === '#FFFFFF' ? '#000' : '#FFF'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {/* Color Wheel Button */}
            <TouchableOpacity
              style={styles.colorWheelBtn}
              onPress={() => {
                setColorWheelTarget(colorKey);
                setShowColorWheel(true);
              }}
            >
              <Pipette size={14} color={COLORS.gold} />
              <Text style={styles.colorWheelBtnText}>Tùy chỉnh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Line Style Picker Panel */}
        {isEnabled && isEditingThisStyle && (
          <View style={styles.stylePicker}>
            {LINE_STYLE_OPTIONS.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleOption,
                  lineStyle === style.id && styles.styleOptionSelected,
                ]}
                onPress={() => handleStyleChange(styleKey, style.id)}
              >
                {renderLineStyleIcon(style.id, lineStyle === style.id ? COLORS.gold : color, 24)}
                <Text style={[
                  styles.styleOptionLabel,
                  lineStyle === style.id && { color: COLORS.gold },
                ]}>
                  {style.label}
                </Text>
                {lineStyle === style.id && (
                  <Check size={14} color={COLORS.gold} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop - tap to close */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Modal Container - Dark Blue Glass Theme */}
        <View style={styles.modalContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Eye size={20} color={COLORS.gold} />
              <Text style={styles.title}>Cài Đặt Đường Lệnh</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {/* Line Visibility Section */}
            <Text style={styles.sectionTitle}>HIỂN THỊ ĐƯỜNG LINE</Text>
            {VISIBILITY_SETTINGS.map(renderSettingItem)}

            {/* Display Options Section */}
            <Text style={styles.sectionTitle}>TÙY CHỌN HIỂN THỊ</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <DollarSign size={18} color="#22C55E" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Hiển thị PnL ($)</Text>
                  <Text style={styles.settingDescription}>Lãi/lỗ trên đường line</Text>
                </View>
                <Switch
                  value={localPrefs.showPnlOnLines !== false}
                  onValueChange={() => handleToggle('showPnlOnLines')}
                  trackColor={{ false: 'rgba(106, 91, 255, 0.2)', true: 'rgba(255,189,89,0.4)' }}
                  thumbColor={localPrefs.showPnlOnLines !== false ? COLORS.gold : 'rgba(255,255,255,0.5)'}
                  ios_backgroundColor="rgba(106, 91, 255, 0.2)"
                />
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Percent size={18} color="#3B82F6" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Hiển thị ROE (%)</Text>
                  <Text style={styles.settingDescription}>Phần trăm trên đường line</Text>
                </View>
                <Switch
                  value={localPrefs.showPercentOnLines !== false}
                  onValueChange={() => handleToggle('showPercentOnLines')}
                  trackColor={{ false: 'rgba(106, 91, 255, 0.2)', true: 'rgba(255,189,89,0.4)' }}
                  thumbColor={localPrefs.showPercentOnLines !== false ? COLORS.gold : 'rgba(255,255,255,0.5)'}
                  ios_backgroundColor="rgba(106, 91, 255, 0.2)"
                />
              </View>
            </View>

            {/* Reset Button inside scroll */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={16} color={COLORS.textMuted} />
              <Text style={styles.resetText}>Khôi Phục Mặc Định</Text>
            </TouchableOpacity>

            {/* Bottom safe area padding - increased for tab bar clearance */}
            <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
          </ScrollView>
        </View>
      </View>

      {/* Color Wheel Picker Modal */}
      <ColorWheelPicker
        visible={showColorWheel}
        currentColor={colorWheelTarget ? (localPrefs[colorWheelTarget] || '#FFBD59') : '#FFBD59'}
        onColorSelect={(selectedColor) => {
          if (colorWheelTarget) {
            handleColorChange(colorWheelTarget, selectedColor);
          }
        }}
        onClose={() => {
          setShowColorWheel(false);
          setColorWheelTarget(null);
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // DARK BLUE GLASS THEME - matching app
  modalContainer: {
    backgroundColor: '#0F1030', // bgMid from tokens
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.92,
    minHeight: SCREEN_HEIGHT * 0.6,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)', // purple border
    borderBottomWidth: 0,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(106, 91, 255, 0.5)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 1.2,
  },
  // Glass card item
  settingItem: {
    backgroundColor: 'rgba(15, 16, 48, 0.6)', // glassBg
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.25)',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  colorRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  colorLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginRight: 8,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  // Compact color picker with smaller boxes
  colorPickerCompact: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.15)',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorOptionSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorOptionSmallSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  colorWheelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.4)',
    alignSelf: 'flex-start',
  },
  colorWheelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
  },
  // Style label for button
  styleLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Style picker panel
  stylePicker: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.15)',
  },
  styleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  styleOptionSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  styleOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    gap: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default memo(OrderLinesSettings);

// src/components/Trading/ChartToolbar.js
// Binance-style compact timeframe toolbar with "More" modal
import React, { memo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  BarChart3,
  Pencil,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Target,
  ChevronDown,
  X,
} from 'lucide-react-native';

// All available timeframes (organized like Binance)
const ALL_TIMEFRAMES = [
  // Row 1
  { label: '1s', value: '1s' },
  { label: '1p', value: '1m' },
  { label: '3p', value: '3m' },
  // Row 2
  { label: '5p', value: '5m' },
  { label: '15p', value: '15m' },
  { label: '30p', value: '30m' },
  { label: '1h', value: '1h' },
  // Row 3
  { label: '2h', value: '2h' },
  { label: '4h', value: '4h' },
  { label: '6h', value: '6h' },
  { label: '8h', value: '8h' },
  // Row 4
  { label: '12h', value: '12h' },
  { label: '1n', value: '1d' },
  { label: '3n', value: '3d' },
  { label: '1t', value: '1w' },
  // Row 5
  { label: '1Tháng', value: '1M' },
];

// Quick access timeframes shown in toolbar
const QUICK_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h'];

// Get display label for a timeframe value
const getTimeframeLabel = (value) => {
  const tf = ALL_TIMEFRAMES.find(t => t.value === value);
  return tf ? tf.label : value;
};

const ChartToolbar = ({
  // Timeframe props
  activeTimeframe = '4h',
  onTimeframeChange,
  // Price lines
  showPriceLines = true,
  onTogglePriceLines,
  // Volume
  showVolume = false,
  onToggleVolume,
  // Other tools
  onToggleDrawing,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onToggleTheme,
  activeIndicators = [],
}) => {
  const [showTimeframeModal, setShowTimeframeModal] = useState(false);

  // Check if active timeframe is in quick list
  const isInQuickList = QUICK_TIMEFRAMES.includes(activeTimeframe);

  const handleSelectTimeframe = (value) => {
    onTimeframeChange?.(value);
    setShowTimeframeModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Timeframe Buttons */}
        {QUICK_TIMEFRAMES.map((tf) => {
          const isActive = activeTimeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframeButton, isActive && styles.timeframeButtonActive]}
              onPress={() => onTimeframeChange?.(tf)}
            >
              <Text style={[styles.timeframeText, isActive && styles.timeframeTextActive]}>
                {getTimeframeLabel(tf)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* More Timeframes Button */}
        <TouchableOpacity
          style={[
            styles.moreButton,
            (!isInQuickList) && styles.moreButtonActive
          ]}
          onPress={() => setShowTimeframeModal(true)}
        >
          <Text style={[
            styles.moreButtonText,
            (!isInQuickList) && styles.moreButtonTextActive
          ]}>
            {!isInQuickList ? getTimeframeLabel(activeTimeframe) : 'Nhiều hơn'}
          </Text>
          <ChevronDown size={14} color={!isInQuickList ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Draw Button */}
        <TouchableOpacity
          style={[styles.drawButton, activeIndicators.includes('drawing') && styles.drawButtonActive]}
          onPress={onToggleDrawing}
        >
          <Pencil size={14} color={activeIndicators.includes('drawing') ? '#FFBD59' : '#A0AEC0'} />
          <Text style={[styles.drawButtonText, activeIndicators.includes('drawing') && styles.drawButtonTextActive]}>
            Vẽ
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tool Buttons */}
        <TouchableOpacity
          style={[styles.toolButton, showVolume && styles.toolButtonActive]}
          onPress={onToggleVolume}
        >
          <BarChart3 size={14} color={showVolume ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, showPriceLines && styles.toolButtonActive]}
          onPress={onTogglePriceLines}
        >
          <Target size={14} color={showPriceLines ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={onToggleTheme}>
          <Sun size={14} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onFullscreen}>
          <Maximize2 size={14} color="#A0AEC0" />
        </TouchableOpacity>
      </ScrollView>

      {/* Timeframe Selection Modal */}
      <Modal
        visible={showTimeframeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeframeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeframeModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Khung thời gian</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimeframeModal(false)}
              >
                <Text style={styles.modalEditText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            {/* Timeframe Grid */}
            <View style={styles.timeframeGrid}>
              {ALL_TIMEFRAMES.map((tf) => {
                const isActive = activeTimeframe === tf.value;
                return (
                  <TouchableOpacity
                    key={tf.value}
                    style={[
                      styles.gridButton,
                      isActive && styles.gridButtonActive
                    ]}
                    onPress={() => handleSelectTimeframe(tf.value)}
                  >
                    <Text style={[
                      styles.gridButtonText,
                      isActive && styles.gridButtonTextActive
                    ]}>
                      {tf.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Timeframe Section */}
            <View style={styles.customSection}>
              <Text style={styles.customSectionTitle}>Khoảng thời gian tùy chỉnh</Text>
              <TouchableOpacity style={styles.addCustomButton}>
                <Text style={styles.addCustomText}>+</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 2,
    height: '100%',
  },
  // Timeframe buttons - compact like Binance
  timeframeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 2,
  },
  timeframeButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  timeframeTextActive: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  // More button
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
  },
  moreButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  moreButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  moreButtonTextActive: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  // Tool buttons
  toolButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  // Draw button
  drawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  drawButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  drawButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  drawButtonTextActive: {
    color: '#FFBD59',
  },
  // Action buttons
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  // Divider
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 6,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalEditText: {
    fontSize: 14,
    color: '#FFBD59',
    fontWeight: '500',
  },
  // Timeframe grid
  timeframeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  gridButton: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderColor: '#FFBD59',
  },
  gridButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  gridButtonTextActive: {
    color: '#FFBD59',
    fontWeight: '600',
  },
  // Custom section
  customSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  customSectionTitle: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  addCustomButton: {
    width: 80,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomText: {
    fontSize: 20,
    color: '#A0AEC0',
    fontWeight: '300',
  },
});

export default memo(ChartToolbar);

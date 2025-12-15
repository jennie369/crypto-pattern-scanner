// src/components/Trading/ChartToolbar.js
// FIXED: Support timeframes + horizontal scroll + no overlap
import React, { memo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {
  BarChart3,
  TrendingUp,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Target,
} from 'lucide-react-native';

const ChartToolbar = ({
  // Timeframe props
  timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'],
  activeTimeframe = '4h',
  onTimeframeChange,
  // Price lines
  showPriceLines = true,
  onTogglePriceLines,
  // Volume
  showVolume = false,
  onToggleVolume,
  // Other tools
  onToggleIndicators,
  onToggleDrawing,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onToggleTheme,
  activeIndicators = [],
  compact = false,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Timeframe Buttons */}
        {timeframes.map((tf) => {
          const isActive = activeTimeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframeButton, isActive && styles.timeframeButtonActive]}
              onPress={() => onTimeframeChange?.(tf)}
            >
              <Text style={[styles.timeframeText, isActive && styles.timeframeTextActive]}>
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tool Buttons */}
        <TouchableOpacity
          style={[styles.toolButton, showVolume && styles.toolButtonActive]}
          onPress={onToggleVolume}
        >
          <BarChart3 size={16} color={showVolume ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, activeIndicators.includes('drawing') && styles.toolButtonActive]}
          onPress={onToggleDrawing}
        >
          <TrendingUp size={16} color={activeIndicators.includes('drawing') ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, showPriceLines && styles.toolButtonActive]}
          onPress={onTogglePriceLines}
        >
          <Target size={16} color={showPriceLines ? '#FFBD59' : '#A0AEC0'} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={onZoomIn}>
          <ZoomIn size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onZoomOut}>
          <ZoomOut size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onToggleTheme}>
          <Sun size={16} color="#A0AEC0" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onFullscreen}>
          <Maximize2 size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: 'rgba(26, 32, 44, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    height: '100%',
  },
  // Timeframe buttons
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 4,
  },
  timeframeButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  timeframeTextActive: {
    color: '#FFBD59',
  },
  // Tool buttons
  toolButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  toolButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
  },
  // Action buttons
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  // Divider
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 6,
  },
});

export default memo(ChartToolbar);

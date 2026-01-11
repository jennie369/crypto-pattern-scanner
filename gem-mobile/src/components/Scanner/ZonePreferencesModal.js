/**
 * GEM Mobile - Zone Preferences Modal
 * Settings for zone visualization display
 *
 * Settings:
 * - Show HFZ/LFZ zones toggles
 * - Show labels toggle
 * - Show historical zones (TIER2+)
 * - Max zones slider
 * - Zone color customization (TIER2+)
 * - Notification toggles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  X,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Layers,
  TrendingUp,
  TrendingDown,
  Tag,
  History,
  Palette,
  Lock,
  ChevronRight,
} from 'lucide-react-native';

import { tierAccessService } from '../../services/tierAccessService';
import { supabase } from '../../services/supabase';
import { COLORS, SPACING } from '../../theme/darkTheme';

const DEFAULT_PREFERENCES = {
  show_hfz: true,
  show_lfz: true,
  show_labels: true,
  show_historical: false,
  max_zones: 5,
  hfz_color: '#FF6B6B',
  lfz_color: '#4ECDC4',
  notify_on_retest: true,
  notify_on_broken: true,
  notify_on_fresh: false,
  notify_on_mtf: true,
};

const ZonePreferencesModal = ({
  visible,
  onClose,
  userId,
  userTier = 'FREE',
  onSave,
}) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (visible && userId) {
      loadPreferences();
    }
  }, [visible, userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('zone_visualization_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...data,
        });
      }
    } catch (error) {
      console.log('[ZonePreferences] Load error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('zone_visualization_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setHasChanges(false);
      onSave?.(preferences);
      onClose();
    } catch (error) {
      console.error('[ZonePreferences] Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Feature access checks
  const canShowHistorical = tierAccessService.canViewHistoricalZones();
  const canCustomizeColors = tierAccessService.canCustomizeZones();
  const canUseAlerts = tierAccessService.canUseZoneAlerts();
  const maxZonesAllowed = tierAccessService.getMaxZonesDisplayed();

  const renderToggle = (key, label, icon, enabled = true, locked = false) => (
    <View style={[styles.settingRow, !enabled && styles.settingRowDisabled]}>
      <View style={styles.settingInfo}>
        {icon}
        <Text style={[styles.settingLabel, !enabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
        {locked && (
          <View style={styles.lockedBadge}>
            <Lock size={10} color={COLORS.warning} />
          </View>
        )}
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(value) => handleChange(key, value)}
        disabled={!enabled}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
        thumbColor={preferences[key] ? COLORS.primary : COLORS.textSecondary}
      />
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Zone Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Zone Visibility */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zone Visibility</Text>

                {renderToggle(
                  'show_hfz',
                  'Show HFZ (Supply) Zones',
                  <TrendingDown size={18} color="#FF6B6B" />
                )}

                {renderToggle(
                  'show_lfz',
                  'Show LFZ (Demand) Zones',
                  <TrendingUp size={18} color="#4ECDC4" />
                )}

                {renderToggle(
                  'show_labels',
                  'Show Zone Labels',
                  <Tag size={18} color={COLORS.primary} />
                )}

                {renderToggle(
                  'show_historical',
                  'Show Historical Zones',
                  <History size={18} color={COLORS.textSecondary} />,
                  canShowHistorical,
                  !canShowHistorical
                )}
              </View>

              {/* Max Zones Slider */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Display Limit</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Max zones to display</Text>
                  <Text style={styles.sliderValue}>{preferences.max_zones}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={Math.min(maxZonesAllowed, 20)}
                  step={1}
                  value={preferences.max_zones}
                  onValueChange={(value) => handleChange('max_zones', value)}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.primary}
                />
                <Text style={styles.sliderHint}>
                  {maxZonesAllowed < 20
                    ? `Your tier allows max ${maxZonesAllowed} zones`
                    : 'Unlimited zones available'}
                </Text>
              </View>

              {/* Color Customization (TIER2+) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Zone Colors</Text>
                  {!canCustomizeColors && (
                    <View style={styles.tierBadge}>
                      <Lock size={10} color={COLORS.warning} />
                      <Text style={styles.tierBadgeText}>TIER2+</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.colorRow, !canCustomizeColors && styles.disabledRow]}
                  disabled={!canCustomizeColors}
                >
                  <View style={styles.colorInfo}>
                    <View style={[styles.colorPreview, { backgroundColor: preferences.hfz_color }]} />
                    <Text style={styles.colorLabel}>HFZ (Supply) Color</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.colorRow, !canCustomizeColors && styles.disabledRow]}
                  disabled={!canCustomizeColors}
                >
                  <View style={styles.colorInfo}>
                    <View style={[styles.colorPreview, { backgroundColor: preferences.lfz_color }]} />
                    <Text style={styles.colorLabel}>LFZ (Demand) Color</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Notifications */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Notifications</Text>
                  {!canUseAlerts && (
                    <View style={styles.tierBadge}>
                      <Lock size={10} color={COLORS.warning} />
                      <Text style={styles.tierBadgeText}>TIER1+</Text>
                    </View>
                  )}
                </View>

                {renderToggle(
                  'notify_on_retest',
                  'Zone Retest Alerts',
                  <Bell size={18} color={COLORS.primary} />,
                  canUseAlerts,
                  !canUseAlerts
                )}

                {renderToggle(
                  'notify_on_broken',
                  'Zone Broken Alerts',
                  <Bell size={18} color={COLORS.error} />,
                  canUseAlerts,
                  !canUseAlerts
                )}

                {renderToggle(
                  'notify_on_mtf',
                  'MTF Alignment Alerts',
                  <Layers size={18} color={COLORS.success} />,
                  canUseAlerts,
                  !canUseAlerts
                )}
              </View>

              {/* Bottom spacing */}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {/* Save Button */}
          {hasChanges && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.warning,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  settingLabelDisabled: {
    color: COLORS.textSecondary,
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    padding: 4,
    borderRadius: 4,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sliderLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  disabledRow: {
    opacity: 0.5,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ZonePreferencesModal;

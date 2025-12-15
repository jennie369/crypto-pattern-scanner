/**
 * Gemral - Privacy Settings Screen
 * Control who can see your posts and interact with you
 * Dark glass theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Shield, Globe, Users, Lock, Eye, MessageCircle, Heart } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const PRIVACY_OPTIONS = [
  {
    id: 'post_visibility',
    title: 'Ai có thể xem bài viết của bạn',
    icon: Eye,
    options: ['everyone', 'followers', 'close_friends'],
    labels: {
      everyone: 'Mọi người',
      followers: 'Chỉ người theo dõi',
      close_friends: 'Chỉ bạn thân',
    },
  },
  {
    id: 'comment_permission',
    title: 'Ai có thể bình luận',
    icon: MessageCircle,
    options: ['everyone', 'followers', 'close_friends'],
    labels: {
      everyone: 'Mọi người',
      followers: 'Chỉ người theo dõi',
      close_friends: 'Chỉ bạn thân',
    },
  },
  {
    id: 'like_visibility',
    title: 'Hiển thị số lượt thích',
    icon: Heart,
    type: 'toggle',
  },
];

export default function PrivacySettingsScreen({ navigation }) {
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    post_visibility: 'everyone',
    comment_permission: 'everyone',
    like_visibility: true,
    activity_status: true,
    read_receipts: true,
  });

  // Load privacy settings from database
  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Privacy settings stored in profiles.metadata.privacy
      const { data, error } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Load from metadata.privacy or use defaults
      const privacyData = data?.metadata?.privacy || {};
      setSettings(prev => ({
        ...prev,
        ...privacyData,
      }));
    } catch (error) {
      console.error('[PrivacySettings] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    // Update local state immediately for responsive UI
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to database
    if (!user?.id) return;

    setSaving(true);
    try {
      // Get current metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      // Merge privacy settings into metadata
      const updatedMetadata = {
        ...(profile?.metadata || {}),
        privacy: newSettings,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ metadata: updatedMetadata })
        .eq('id', user.id);

      if (error) throw error;
      console.log('[PrivacySettings] Saved successfully');
    } catch (error) {
      console.error('[PrivacySettings] Save error:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: settings[key] }));
      alert({ type: 'error', title: 'Lỗi', message: 'Không thể lưu cài đặt. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const getOptionIcon = (option) => {
    switch (option) {
      case 'everyone':
        return Globe;
      case 'followers':
        return Users;
      case 'close_friends':
        return Lock;
      default:
        return Globe;
    }
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quyền riêng tư</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Shield size={24} color={COLORS.cyan} />
            <Text style={styles.infoText}>
              Kiểm soát ai có thể xem và tương tác với nội dung của bạn
            </Text>
          </View>

          {/* Privacy Options */}
          {PRIVACY_OPTIONS.map((option) => (
            <View key={option.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <option.icon size={20} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>{option.title}</Text>
              </View>

              {option.type === 'toggle' ? (
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Bật</Text>
                  <Switch
                    value={settings[option.id]}
                    onValueChange={(value) => updateSetting(option.id, value)}
                    trackColor={{ false: COLORS.textMuted, true: COLORS.gold }}
                    thumbColor={COLORS.textPrimary}
                  />
                </View>
              ) : (
                <View style={styles.optionsContainer}>
                  {option.options.map((opt) => {
                    const OptionIcon = getOptionIcon(opt);
                    const isSelected = settings[option.id] === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionItem, isSelected && styles.optionItemActive]}
                        onPress={() => updateSetting(option.id, opt)}
                      >
                        <OptionIcon size={18} color={isSelected ? COLORS.gold : COLORS.textMuted} />
                        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                          {option.labels[opt]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}

          {/* Additional Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cài đặt khác</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Trạng thái hoạt động</Text>
                <Text style={styles.settingDesc}>Hiển thị khi bạn đang online</Text>
              </View>
              <Switch
                value={settings.activity_status}
                onValueChange={(value) => updateSetting('activity_status', value)}
                trackColor={{ false: COLORS.textMuted, true: COLORS.gold }}
                thumbColor={COLORS.textPrimary}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Xác nhận đã đọc</Text>
                <Text style={styles.settingDesc}>Cho người khác biết khi bạn đã đọc tin nhắn</Text>
              </View>
              <Switch
                value={settings.read_receipts}
                onValueChange={(value) => updateSetting('read_receipts', value)}
                trackColor={{ false: COLORS.textMuted, true: COLORS.gold }}
                thumbColor={COLORS.textPrimary}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      {AlertComponent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 200, 255, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 255, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  optionTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

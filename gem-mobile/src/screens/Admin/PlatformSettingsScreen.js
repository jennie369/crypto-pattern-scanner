/**
 * Gemral - Platform Settings Screen
 * Quản lý kết nối các platform
 * @description Admin UI cho platform connections
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import {
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Link,
  Unlink,
  Settings,
  Check,
  X,
  Home,
  Facebook,
  Youtube,
  Instagram,
  Film,
  FileText,
  Key,
} from 'lucide-react-native';

// Services
import {
  getPlatformConnections,
  connectPlatform,
  disconnectPlatform,
  togglePlatformActive,
} from '../../services/autoPostService';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, INPUT } from '../../utils/tokens';

// ========== CONSTANTS ==========
const PLATFORM_CONFIG = {
  gemral: { label: 'Gemral Feed', icon: Home, color: COLORS.gold, noAuth: true },
  facebook: { label: 'Facebook Page', icon: Facebook, color: '#1877F2' },
  youtube: { label: 'YouTube', icon: Youtube, color: '#FF0000' },
  instagram: { label: 'Instagram', icon: Instagram, color: '#E4405F' },
  tiktok: { label: 'TikTok', icon: Film, color: '#000000' },
  threads: { label: 'Threads', icon: FileText, color: '#000000' },
};

// ========== COMPONENT ==========
const PlatformSettingsScreen = () => {
  const navigation = useNavigation();
  const { alert, AlertComponent } = useCustomAlert();

  // ========== STATE ==========
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Connect modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [connecting, setConnecting] = useState(false);

  // ========== EFFECTS ==========
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // ========== DATA FETCHING ==========
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPlatformConnections();

      if (!result.success) {
        throw new Error(result.error);
      }

      setPlatforms(result.data);
      setError(null);
    } catch (err) {
      console.error('[PlatformSettings] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ========== HANDLERS ==========
  const handleToggleActive = async (platform, currentValue) => {
    const result = await togglePlatformActive(platform.platform, !currentValue);
    if (result.success) {
      fetchData();
    } else {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: result.error || 'Không thể thay đổi trạng thái'
      });
    }
  };

  const handleConnectPress = (platform) => {
    const config = PLATFORM_CONFIG[platform?.platform];
    if (config?.noAuth) {
      // Gemral doesn't need auth
      alert({
        type: 'info',
        title: 'Thông báo',
        message: 'Gemral Feed không cần kết nối riêng'
      });
      return;
    }

    setSelectedPlatform(platform);
    setAccessToken('');
    setPageId('');
    setShowConnectModal(true);
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập Access Token'
      });
      return;
    }

    try {
      setConnecting(true);
      const result = await connectPlatform(selectedPlatform?.platform, {
        access_token: accessToken.trim(),
        page_id: pageId.trim() || null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã kết nối platform'
      });
      setShowConnectModal(false);
      fetchData();
    } catch (err) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: err?.message || 'Không thể kết nối'
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (platform) => {
    alert({
      type: 'warning',
      title: 'Xác nhận ngắt kết nối',
      message: `Bạn có chắc muốn ngắt kết nối ${PLATFORM_CONFIG[platform?.platform]?.label || platform?.platform}?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Ngắt kết nối',
          style: 'destructive',
          onPress: async () => {
            const result = await disconnectPlatform(platform?.platform);
            if (result.success) {
              alert({
                type: 'success',
                title: 'Thành công',
                message: 'Đã ngắt kết nối'
              });
              fetchData();
            } else {
              alert({
                type: 'error',
                title: 'Lỗi',
                message: result.error || 'Không thể ngắt kết nối'
              });
            }
          },
        },
      ]
    });
  };

  // ========== RENDER HELPERS ==========
  const renderPlatformItem = ({ item }) => {
    const config = PLATFORM_CONFIG[item?.platform] || {};
    const IconComponent = config.icon || Link;
    const isConnected = item?.is_connected;
    const isActive = item?.is_active;

    return (
      <View style={styles.platformItem}>
        <View style={styles.platformHeader}>
          <View style={[styles.platformIcon, { backgroundColor: config.color || COLORS.textMuted }]}>
            <IconComponent size={24} color="#fff" />
          </View>
          <View style={styles.platformInfo}>
            <Text style={styles.platformName}>{config.label || item?.display_name}</Text>
            <View style={styles.statusRow}>
              {isConnected ? (
                <View style={styles.connectedBadge}>
                  <Check size={12} color={COLORS.success} />
                  <Text style={styles.connectedText}>Đã kết nối</Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <X size={12} color={COLORS.textMuted} />
                  <Text style={styles.disconnectedText}>Chưa kết nối</Text>
                </View>
              )}
              {item?.last_used_at && (
                <Text style={styles.lastUsed}>
                  Dùng: {new Date(item.last_used_at).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>
          </View>
          <Switch
            value={isActive}
            onValueChange={() => handleToggleActive(item, isActive)}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: COLORS.success }}
            thumbColor={isActive ? '#fff' : '#ccc'}
          />
        </View>

        {item?.last_error && (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color={COLORS.error} />
            <Text style={styles.errorText} numberOfLines={2}>
              {item.last_error}
            </Text>
          </View>
        )}

        <View style={styles.platformActions}>
          {!config.noAuth && (
            <>
              {isConnected ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDisconnect(item)}
                >
                  <Unlink size={16} color={COLORS.error} />
                  <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
                    Ngắt kết nối
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.connectButton]}
                  onPress={() => handleConnectPress(item)}
                >
                  <Link size={16} color={COLORS.bgDarkest} />
                  <Text style={styles.connectButtonText}>Kết nối</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {config.noAuth && (
            <View style={styles.noAuthBadge}>
              <Check size={14} color={COLORS.success} />
              <Text style={styles.noAuthText}>Sẵn sàng sử dụng</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderConnectModal = () => {
    const config = PLATFORM_CONFIG[selectedPlatform?.platform] || {};

    return (
      <Modal
        visible={showConnectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.connectModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Kết nối {config.label || selectedPlatform?.platform}
              </Text>
              <TouchableOpacity onPress={() => setShowConnectModal(false)}>
                <X size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Nhập Access Token và Page ID (nếu có) để kết nối platform.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Access Token *</Text>
              <View style={styles.inputWithIcon}>
                <Key size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập access token..."
                  placeholderTextColor={COLORS.textMuted}
                  value={accessToken}
                  onChangeText={setAccessToken}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {selectedPlatform?.platform === 'facebook' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Page ID</Text>
                <View style={styles.inputWithIcon}>
                  <FileText size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nhập Page ID..."
                    placeholderTextColor={COLORS.textMuted}
                    value={pageId}
                    onChangeText={setPageId}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConnectModal(false)}
                disabled={connecting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleConnect}
                disabled={connecting}
              >
                {connecting ? (
                  <ActivityIndicator size="small" color={COLORS.bgDarkest} />
                ) : (
                  <>
                    <Link size={18} color={COLORS.bgDarkest} />
                    <Text style={styles.submitButtonText}>Kết nối</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ========== LOADING STATE ==========
  if (loading && !refreshing) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Platform Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Platforms List */}
        <FlatList
          data={platforms}
          keyExtractor={(item) => item?.platform}
          renderItem={renderPlatformItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Connect Modal */}
        {renderConnectModal()}

        {/* Alert Component */}
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  platformItem: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  platformName: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxs,
    gap: SPACING.md,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  connectedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  disconnectedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  lastUsed: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
  platformActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  connectButton: {
    backgroundColor: COLORS.gold,
  },
  connectButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDarkest,
  },
  noAuthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  noAuthText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectModal: {
    width: '90%',
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  modalDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  modalInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
});

export default PlatformSettingsScreen;

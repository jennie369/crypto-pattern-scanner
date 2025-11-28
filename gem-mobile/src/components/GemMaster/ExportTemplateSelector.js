/**
 * Gemral - Export Template Selector
 *
 * Modal to choose export template
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Lock,
  Image as ImageIcon,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, GLASS } from '../../utils/tokens';
import exportService from '../../services/exportService';
import TierService from '../../services/tierService';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Template icons mapping
const TEMPLATE_ICONS = {
  reading_card: ImageIcon,
  chat_wisdom: MessageSquare,
  trading_signal: TrendingUp,
};

const ExportTemplateSelector = ({
  visible,
  onClose,
  onSelect,
  userTier = 'FREE',
}) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible, userTier]);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      const availableTemplates = exportService.getAvailableTemplates(userTier);
      setTemplates(availableTemplates);
      // Pre-select first available template
      const firstAvailable = availableTemplates.find((t) => !t.isLocked);
      if (firstAvailable) {
        setSelectedId(firstAvailable.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplatePress = (template) => {
    if (template.isLocked) {
      Alert.alert(
        'Premium Template',
        `This template requires ${template.tier}+.\n\nUpgrade to unlock all templates!`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Learn More',
            onPress: () => {
              // Could navigate to upgrade screen
              console.log('Navigate to upgrade');
            },
          },
        ]
      );
      return;
    }
    setSelectedId(template.id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  const getIcon = (templateId) => {
    const IconComponent = TEMPLATE_ICONS[templateId] || ImageIcon;
    return IconComponent;
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'FREE':
        return 'Free';
      case 'TIER1':
        return 'Pro';
      case 'TIER2':
        return 'Premium';
      case 'TIER3':
        return 'VIP';
      default:
        return tier;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Sparkles size={20} color={COLORS.gold} />
              <Text style={styles.title}>Choose Template</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>Loading templates...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {templates.map((template) => {
                const IconComponent = getIcon(template.id);
                const isSelected = selectedId === template.id;

                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      isSelected && styles.templateCardSelected,
                      template.isLocked && styles.templateCardLocked,
                    ]}
                    onPress={() => handleTemplatePress(template)}
                    activeOpacity={0.8}
                  >
                    {/* Icon */}
                    <View
                      style={[
                        styles.templateIcon,
                        isSelected && styles.templateIconSelected,
                      ]}
                    >
                      {template.isLocked ? (
                        <Lock size={24} color={COLORS.textMuted} />
                      ) : (
                        <IconComponent
                          size={24}
                          color={isSelected ? COLORS.gold : COLORS.purple}
                        />
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.templateInfo}>
                      <View style={styles.templateNameRow}>
                        <Text
                          style={[
                            styles.templateName,
                            template.isLocked && styles.templateNameLocked,
                          ]}
                        >
                          {template.name}
                        </Text>

                        {/* Tier Badge */}
                        <View
                          style={[
                            styles.tierBadge,
                            {
                              backgroundColor:
                                template.tier === 'FREE'
                                  ? 'rgba(255, 255, 255, 0.1)'
                                  : template.tier === 'TIER1'
                                  ? 'rgba(255, 189, 89, 0.2)'
                                  : 'rgba(106, 91, 255, 0.2)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tierBadgeText,
                              {
                                color:
                                  template.tier === 'FREE'
                                    ? COLORS.textMuted
                                    : template.tier === 'TIER1'
                                    ? COLORS.gold
                                    : COLORS.purple,
                              },
                            ]}
                          >
                            {getTierLabel(template.tier)}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.templateDescription,
                          template.isLocked && styles.templateDescriptionLocked,
                        ]}
                        numberOfLines={2}
                      >
                        {template.description}
                      </Text>

                      {template.isLocked && (
                        <Text style={styles.unlockText}>
                          Upgrade to unlock
                        </Text>
                      )}
                    </View>

                    {/* Selection indicator */}
                    {isSelected && !template.isLocked && (
                      <View style={styles.selectedIndicator}>
                        <View style={styles.selectedDot} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            {/* Info text */}
            <Text style={styles.footerText}>
              {userTier === 'FREE'
                ? 'Upgrade to remove watermark'
                : 'All exports without watermark'}
            </Text>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedId && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedId}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selectedId
                    ? ['#9C0612', '#6B0F1A']
                    : ['#333', '#222']
                }
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>Create Image</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34, // Safe area
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading
  loadingContainer: {
    padding: SPACING.huge,
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },

  // Template Card
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.md,
  },
  templateCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.08)',
  },
  templateCardLocked: {
    opacity: 0.6,
  },

  // Icon
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },

  // Info
  templateInfo: {
    flex: 1,
  },
  templateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  templateName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  templateNameLocked: {
    color: COLORS.textMuted,
  },
  templateDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  templateDescriptionLocked: {
    color: COLORS.textMuted,
  },
  unlockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },

  // Tier Badge
  tierBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },

  // Selection
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },

  // Footer
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 189, 89, 0.1)',
    gap: SPACING.md,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default ExportTemplateSelector;

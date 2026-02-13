// ============================================================
// UPGRADE POPUP COMPONENT
// Purpose: Modal popup để upgrade
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Lock,
  Sparkles,
  Check,
  Crown,
  Gem,
  TrendingUp,
  Zap,
  AlertCircle,
  BookOpen,
  ArrowUpCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import upgradeService from '../../services/upgradeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const ICONS = {
  lock: Lock,
  sparkles: Sparkles,
  crown: Crown,
  gem: Gem,
  'trending-up': TrendingUp,
  zap: Zap,
  'alert-circle': AlertCircle,
  'book-open': BookOpen,
  'arrow-up-circle': ArrowUpCircle,
};

const UpgradePopup = () => {
  const navigation = useNavigation();
  const { currentPopup, hideUpgradePopup, handleUpgradeClick } = useUpgrade();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentPopup) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [currentPopup, scaleAnim, opacityAnim]);

  if (!currentPopup) return null;

  const IconComponent = ICONS[currentPopup.icon_name] || Sparkles;
  const tierInfo = currentPopup.tierInfo;
  const features = tierInfo ? upgradeService.parseFeatures(tierInfo.features_json) : [];

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideUpgradePopup();
    });
  };

  const handleUpgrade = () => {
    handleUpgradeClick(navigation);
  };

  return (
    <Modal
      visible={!!currentPopup}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Button */}
          {currentPopup.is_dismissible !== false && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <IconComponent size={40} color={COLORS.gold} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentPopup.title}</Text>

          {/* Subtitle */}
          {currentPopup.subtitle && (
            <Text style={styles.subtitle}>{currentPopup.subtitle}</Text>
          )}

          {/* Description */}
          {currentPopup.description && (
            <Text style={styles.description}>{currentPopup.description}</Text>
          )}

          {/* Features */}
          {features.length > 0 && (
            <View style={styles.featuresContainer}>
              {features.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  {feature.included ? (
                    <Check size={16} color={COLORS.success} />
                  ) : (
                    <X size={16} color={COLORS.textMuted} />
                  )}
                  <Text
                    style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled,
                    ]}
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Price */}
          {tierInfo && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {upgradeService.formatPrice(tierInfo.price_vnd)}
              </Text>
              {tierInfo.badge_text && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tierInfo.badge_text}</Text>
                </View>
              )}
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>
              {currentPopup.cta_text || 'Nâng cấp ngay'}
            </Text>
          </TouchableOpacity>

          {/* Secondary CTA */}
          {currentPopup.secondary_cta_text && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                navigation.navigate('UpgradeScreen', {
                  tierType: currentPopup.target_tier_type,
                });
                hideUpgradePopup();
              }}
            >
              <Text style={styles.secondaryText}>
                {currentPopup.secondary_cta_text}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  featureTextDisabled: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  badge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
  },
  secondaryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});

export default UpgradePopup;

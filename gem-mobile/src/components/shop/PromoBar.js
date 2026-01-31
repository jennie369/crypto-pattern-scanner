/**
 * PromoBar.js - Promotional Banner Bar Component
 * Dismissible promotional message bar at top of shop
 * Fetches active promo config from Supabase
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Clipboard,
  Platform,
} from 'react-native';
import { X, Copy, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import InAppBrowser from '../Common/InAppBrowser';

const PromoBar = ({ style, onDismiss }) => {
  const [promo, setPromo] = useState(null);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // InAppBrowser state for URL links
  const [browserVisible, setBrowserVisible] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');

  // Fetch active promo
  const fetchPromo = useCallback(async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('promo_bar_config')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        setVisible(false);
        return;
      }

      setPromo(data);

      // Animate in
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 48,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } catch (err) {
      console.error('[PromoBar] Fetch error:', err);
      setVisible(false);
    }
  }, [heightAnim, opacityAnim]);

  useEffect(() => {
    fetchPromo();
  }, [fetchPromo]);

  const handleDismiss = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate out
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  const handleCopyVoucher = async () => {
    if (!promo?.voucher_code) return;

    try {
      await Clipboard.setString(promo.voucher_code);
      setCopied(true);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[PromoBar] Copy error:', err);
    }
  };

  const handleLinkPress = () => {
    if (promo?.link_url) {
      // Navigate based on link type
      if (promo.link_url.startsWith('http')) {
        // Open URL in InAppBrowser (WebView) instead of external browser
        setBrowserUrl(promo.link_url);
        setBrowserTitle(promo.link_text || 'Promo');
        setBrowserVisible(true);
      } else {
        // Internal navigation would be handled here
        // navigation.navigate(promo.link_url);
      }
    }
  };

  if (!visible || !promo) {
    return null;
  }

  const backgroundColor = promo.background_color || COLORS.burgundy;
  const textColor = promo.text_color || COLORS.textPrimary;

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            height: heightAnim,
            opacity: opacityAnim,
            backgroundColor,
          },
          style,
        ]}
      >
      <View style={styles.content}>
        {/* Message */}
        <Text style={[styles.message, { color: textColor }]} numberOfLines={1}>
          {promo.message}
        </Text>

        {/* Voucher Code */}
        {promo.voucher_code && (
          <TouchableOpacity
            style={styles.voucherButton}
            onPress={handleCopyVoucher}
            activeOpacity={0.7}
          >
            <Text style={[styles.voucherCode, { color: textColor }]}>
              {promo.voucher_code}
            </Text>
            <Copy size={12} color={textColor} />
            {copied && (
              <Text style={[styles.copiedText, { color: textColor }]}>
                Đã sao chép!
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Link */}
        {promo.link_text && promo.link_url && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleLinkPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkText, { color: textColor }]}>
              {promo.link_text}
            </Text>
            <ExternalLink size={12} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dismiss Button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color={textColor} />
      </TouchableOpacity>
      </Animated.View>

      {/* InAppBrowser for URL links */}
      <InAppBrowser
        visible={browserVisible}
        url={browserUrl}
        title={browserTitle}
        onClose={() => setBrowserVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  voucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  voucherCode: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  copiedText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: SPACING.xs,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  dismissButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default PromoBar;

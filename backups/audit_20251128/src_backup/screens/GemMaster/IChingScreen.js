/**
 * Gemral - I Ching Screen
 * Interactive hexagram casting and interpretation
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Share,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Share2, Hexagon, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';
import { useTabBar } from '../../contexts/TabBarContext';
import { getHexagramImage, getCardBack } from '../../assets/iching';

// Services for tier/quota checking
import TierService from '../../services/tierService';
import QuotaService from '../../services/quotaService';
import { supabase } from '../../services/supabase';

// Complete 64 hexagrams data
const HEXAGRAMS = [
  { id: 1, name: 'Càn', vietnamese: 'Trời', meaning: 'Sức mạnh sáng tạo', lines: [1, 1, 1, 1, 1, 1] },
  { id: 2, name: 'Khôn', vietnamese: 'Đất', meaning: 'Tiếp nhận', lines: [0, 0, 0, 0, 0, 0] },
  { id: 3, name: 'Truân', vietnamese: 'Khó khăn ban đầu', meaning: 'Khởi đầu gian nan', lines: [1, 0, 0, 0, 1, 0] },
  { id: 4, name: 'Mông', vietnamese: 'Non trẻ', meaning: 'Học hỏi', lines: [0, 1, 0, 0, 0, 1] },
  { id: 5, name: 'Nhu', vietnamese: 'Chờ đợi', meaning: 'Kiên nhẫn', lines: [1, 1, 1, 0, 1, 0] },
  { id: 6, name: 'Tụng', vietnamese: 'Tranh tụng', meaning: 'Xung đột', lines: [0, 1, 0, 1, 1, 1] },
  { id: 7, name: 'Sư', vietnamese: 'Quân đội', meaning: 'Kỷ luật', lines: [0, 1, 0, 0, 0, 0] },
  { id: 8, name: 'Tỷ', vietnamese: 'Đoàn kết', meaning: 'Hợp tác', lines: [0, 0, 0, 0, 1, 0] },
  { id: 9, name: 'Tiểu Súc', vietnamese: 'Thuần dưỡng nhỏ', meaning: 'Tích lũy nhỏ', lines: [1, 1, 1, 0, 1, 1] },
  { id: 10, name: 'Lý', vietnamese: 'Đạp lên', meaning: 'Cẩn trọng tiến bước', lines: [1, 1, 0, 1, 1, 1] },
  { id: 11, name: 'Thái', vietnamese: 'Hanh thông', meaning: 'Hòa bình phát triển', lines: [1, 1, 1, 0, 0, 0] },
  { id: 12, name: 'Bĩ', vietnamese: 'Bế tắc', meaning: 'Trì trệ', lines: [0, 0, 0, 1, 1, 1] },
  { id: 13, name: 'Đồng Nhân', vietnamese: 'Đồng lòng', meaning: 'Cộng đồng', lines: [1, 0, 1, 1, 1, 1] },
  { id: 14, name: 'Đại Hữu', vietnamese: 'Sở hữu lớn', meaning: 'Thịnh vượng', lines: [1, 1, 1, 1, 0, 1] },
  { id: 15, name: 'Khiêm', vietnamese: 'Khiêm tốn', meaning: 'Nhún nhường', lines: [0, 0, 1, 0, 0, 0] },
  { id: 16, name: 'Dự', vietnamese: 'Vui vẻ', meaning: 'Nhiệt tình', lines: [0, 0, 0, 1, 0, 0] },
  { id: 17, name: 'Tùy', vietnamese: 'Theo', meaning: 'Thích ứng', lines: [1, 0, 0, 1, 1, 0] },
  { id: 18, name: 'Cổ', vietnamese: 'Sửa chữa', meaning: 'Cải thiện', lines: [0, 1, 1, 0, 0, 1] },
  { id: 19, name: 'Lâm', vietnamese: 'Tiếp cận', meaning: 'Đến gần', lines: [1, 1, 0, 0, 0, 0] },
  { id: 20, name: 'Quan', vietnamese: 'Chiêm ngưỡng', meaning: 'Quan sát', lines: [0, 0, 0, 0, 1, 1] },
  { id: 21, name: 'Phệ Hạp', vietnamese: 'Cắn', meaning: 'Quyết đoán', lines: [1, 0, 0, 1, 0, 1] },
  { id: 22, name: 'Bí', vietnamese: 'Trang sức', meaning: 'Vẻ đẹp', lines: [1, 0, 1, 0, 0, 1] },
  { id: 23, name: 'Bác', vietnamese: 'Bóc lột', meaning: 'Sụp đổ', lines: [0, 0, 0, 0, 0, 1] },
  { id: 24, name: 'Phục', vietnamese: 'Quay về', meaning: 'Hồi phục', lines: [1, 0, 0, 0, 0, 0] },
  { id: 25, name: 'Vô Vọng', vietnamese: 'Không lỗi', meaning: 'Chân thực', lines: [1, 0, 0, 1, 1, 1] },
  { id: 26, name: 'Đại Súc', vietnamese: 'Thuần dưỡng lớn', meaning: 'Tích lũy lớn', lines: [1, 1, 1, 0, 0, 1] },
  { id: 27, name: 'Di', vietnamese: 'Nuôi dưỡng', meaning: 'Dinh dưỡng', lines: [1, 0, 0, 0, 0, 1] },
  { id: 28, name: 'Đại Quá', vietnamese: 'Quá lớn', meaning: 'Vượt mức', lines: [0, 1, 1, 1, 1, 0] },
  { id: 29, name: 'Khảm', vietnamese: 'Nước', meaning: 'Nguy hiểm', lines: [0, 1, 0, 0, 1, 0] },
  { id: 30, name: 'Ly', vietnamese: 'Lửa', meaning: 'Sáng suốt', lines: [1, 0, 1, 1, 0, 1] },
  { id: 31, name: 'Hàm', vietnamese: 'Cảm ứng', meaning: 'Hấp dẫn', lines: [0, 0, 1, 1, 1, 0] },
  { id: 32, name: 'Hằng', vietnamese: 'Bền bỉ', meaning: 'Kiên trì', lines: [0, 1, 1, 1, 0, 0] },
  { id: 33, name: 'Độn', vietnamese: 'Rút lui', meaning: 'Ẩn mình', lines: [0, 0, 1, 1, 1, 1] },
  { id: 34, name: 'Đại Tráng', vietnamese: 'Sức mạnh lớn', meaning: 'Hùng mạnh', lines: [1, 1, 1, 1, 0, 0] },
  { id: 35, name: 'Tấn', vietnamese: 'Tiến bộ', meaning: 'Phát triển', lines: [0, 0, 0, 1, 0, 1] },
  { id: 36, name: 'Minh Di', vietnamese: 'Ánh sáng bị che', meaning: 'Ẩn giấu', lines: [1, 0, 1, 0, 0, 0] },
  { id: 37, name: 'Gia Nhân', vietnamese: 'Gia đình', meaning: 'Gia đạo', lines: [1, 0, 1, 0, 1, 1] },
  { id: 38, name: 'Khuê', vietnamese: 'Đối nghịch', meaning: 'Mâu thuẫn', lines: [1, 1, 0, 1, 0, 1] },
  { id: 39, name: 'Kiển', vietnamese: 'Chướng ngại', meaning: 'Khó khăn', lines: [0, 0, 1, 0, 1, 0] },
  { id: 40, name: 'Giải', vietnamese: 'Giải thoát', meaning: 'Giải phóng', lines: [0, 1, 0, 1, 0, 0] },
  { id: 41, name: 'Tổn', vietnamese: 'Giảm bớt', meaning: 'Hy sinh', lines: [1, 1, 0, 0, 0, 1] },
  { id: 42, name: 'Ích', vietnamese: 'Tăng thêm', meaning: 'Lợi ích', lines: [1, 0, 0, 0, 1, 1] },
  { id: 43, name: 'Quải', vietnamese: 'Đột phá', meaning: 'Quyết định', lines: [1, 1, 1, 1, 1, 0] },
  { id: 44, name: 'Cấu', vietnamese: 'Gặp gỡ', meaning: 'Đối mặt', lines: [0, 1, 1, 1, 1, 1] },
  { id: 45, name: 'Tụy', vietnamese: 'Tụ họp', meaning: 'Tập hợp', lines: [0, 0, 0, 1, 1, 0] },
  { id: 46, name: 'Thăng', vietnamese: 'Đi lên', meaning: 'Thăng tiến', lines: [0, 1, 1, 0, 0, 0] },
  { id: 47, name: 'Khốn', vietnamese: 'Khốn cùng', meaning: 'Kiệt sức', lines: [0, 1, 0, 1, 1, 0] },
  { id: 48, name: 'Tỉnh', vietnamese: 'Giếng', meaning: 'Nguồn nước', lines: [0, 1, 1, 0, 1, 0] },
  { id: 49, name: 'Cách', vietnamese: 'Cách mạng', meaning: 'Thay đổi', lines: [1, 0, 1, 1, 1, 0] },
  { id: 50, name: 'Đỉnh', vietnamese: 'Đỉnh vạc', meaning: 'Nuôi dưỡng', lines: [0, 1, 1, 1, 0, 1] },
  { id: 51, name: 'Chấn', vietnamese: 'Sấm', meaning: 'Chấn động', lines: [1, 0, 0, 1, 0, 0] },
  { id: 52, name: 'Cấn', vietnamese: 'Núi', meaning: 'Tĩnh lặng', lines: [0, 0, 1, 0, 0, 1] },
  { id: 53, name: 'Tiệm', vietnamese: 'Dần dần', meaning: 'Tiến từ từ', lines: [0, 0, 1, 0, 1, 1] },
  { id: 54, name: 'Quy Muội', vietnamese: 'Cô gái về nhà chồng', meaning: 'Kết hôn', lines: [1, 1, 0, 1, 0, 0] },
  { id: 55, name: 'Phong', vietnamese: 'Dồi dào', meaning: 'Sung túc', lines: [1, 0, 1, 1, 0, 0] },
  { id: 56, name: 'Lữ', vietnamese: 'Lữ khách', meaning: 'Du hành', lines: [0, 0, 1, 1, 0, 1] },
  { id: 57, name: 'Tốn', vietnamese: 'Gió', meaning: 'Thâm nhập', lines: [0, 1, 1, 0, 1, 1] },
  { id: 58, name: 'Đoài', vietnamese: 'Đầm', meaning: 'Vui vẻ', lines: [1, 1, 0, 1, 1, 0] },
  { id: 59, name: 'Hoán', vietnamese: 'Phân tán', meaning: 'Lan tỏa', lines: [0, 1, 0, 0, 1, 1] },
  { id: 60, name: 'Tiết', vietnamese: 'Tiết chế', meaning: 'Hạn chế', lines: [1, 1, 0, 0, 1, 0] },
  { id: 61, name: 'Trung Phu', vietnamese: 'Thành tín', meaning: 'Chân thành', lines: [1, 1, 0, 0, 1, 1] },
  { id: 62, name: 'Tiểu Quá', vietnamese: 'Quá nhỏ', meaning: 'Vượt mức nhỏ', lines: [0, 0, 1, 1, 0, 0] },
  { id: 63, name: 'Ký Tế', vietnamese: 'Hoàn thành', meaning: 'Đã hoàn thành', lines: [1, 0, 1, 0, 1, 0] },
  { id: 64, name: 'Vị Tế', vietnamese: 'Chưa hoàn thành', meaning: 'Sắp hoàn thành', lines: [0, 1, 0, 1, 0, 1] },
];

const IChingScreen = ({ navigation, route }) => {
  const [hexagram, setHexagram] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const { hideTabBar, showTabBar } = useTabBar();

  // Quota state
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('FREE');
  const [quota, setQuota] = useState(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);

  // Callback to send result back to chat
  const onSendToChat = route?.params?.onSendToChat;

  // Hide tab bar when screen is focused
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, [hideTabBar, showTabBar]);

  // Load user tier and quota on mount
  useEffect(() => {
    const loadUserQuota = async () => {
      try {
        setIsLoadingQuota(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const tier = await TierService.getUserTier(currentUser.id);
          setUserTier(tier);
          const quotaData = await QuotaService.checkQuota(currentUser.id, tier);
          setQuota(quotaData);
          console.log('[IChingScreen] User tier:', tier, 'Quota:', quotaData);
        } else {
          setUserTier('FREE');
          setQuota(QuotaService.getDefaultQuota());
        }
      } catch (error) {
        console.error('[IChingScreen] Error loading quota:', error);
        setQuota(QuotaService.getDefaultQuota());
      } finally {
        setIsLoadingQuota(false);
      }
    };

    loadUserQuota();
  }, []);

  // Check if user can perform divination (has quota remaining)
  const canDivine = useCallback(() => {
    if (!quota) return false;
    return quota.unlimited || quota.remaining > 0;
  }, [quota]);

  // Refresh quota after using
  const refreshQuota = useCallback(async () => {
    if (!user) return;
    try {
      const quotaData = await QuotaService.checkQuota(user.id, userTier);
      setQuota(quotaData);
    } catch (error) {
      console.error('[IChingScreen] Error refreshing quota:', error);
    }
  }, [user, userTier]);

  // Animation refs
  const lineAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  /**
   * Fisher-Yates shuffle algorithm for true randomness
   * Ensures each hexagram has equal probability of being selected
   */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Use timestamp + Math.random for better entropy
      const seed = Date.now() + Math.random() * 1000000;
      const j = Math.floor(seed % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Cast hexagram
  const castHexagram = useCallback(async () => {
    // CHECK QUOTA FIRST
    if (!canDivine()) {
      Alert.alert(
        'Hết lượt hôm nay',
        `Bạn đã sử dụng hết ${quota?.limit || 5} lượt hỏi trong ngày.\n\nNâng cấp lên tier cao hơn để có thêm lượt:\n• TIER1/PRO: 15 lượt/ngày\n• TIER2/PREMIUM: 50 lượt/ngày\n• TIER3/VIP: Không giới hạn`,
        [{ text: 'Đóng', style: 'cancel' }]
      );
      return;
    }

    setIsLoading(true);
    setHexagram(null);
    setInterpretation(null);

    // Reset animations
    lineAnimations.forEach((anim) => anim.setValue(0));

    // DECREMENT QUOTA (uses same quota as chat)
    if (user) {
      await QuotaService.decrementQuota(user.id);
      await refreshQuota();
    }

    // True random hexagram using Fisher-Yates shuffle
    const shuffled = shuffleArray(HEXAGRAMS);
    // Add extra randomness with timestamp-based seed
    const extraRandom = Math.floor((Date.now() % 1000) * Math.random());
    const randomIndex = (extraRandom + Math.floor(Math.random() * 64)) % 64;
    const selected = shuffled[randomIndex];

    // Animate lines appearing one by one
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      Animated.spring(lineAnimations[i], {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }

    setHexagram(selected);

    // Generate interpretation after a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setInterpretation(generateInterpretation(selected));
    setIsLoading(false);
  }, [lineAnimations, canDivine, quota, user, refreshQuota]);

  // Generate mock interpretation
  const generateInterpretation = (hex) => {
    return {
      general: `Quẻ ${hex.name} (${hex.vietnamese}) mang ý nghĩa ${hex.meaning}. Đây là thời điểm thuận lợi để bạn suy ngẫm về những quyết định quan trọng.`,
      advice: 'Hãy kiên nhẫn và tin tưởng vào quá trình. Mọi thứ đều có thời điểm của nó.',
      warning: 'Tránh hấp tấp, vội vàng trong các quyết định tài chính.',
      fortune: Math.floor(Math.random() * 5) + 1, // 1-5 stars
    };
  };

  // Render hexagram line
  const renderLine = (value, index) => {
    const isYang = value === 1;
    return (
      <Animated.View
        key={index}
        style={[
          styles.lineContainer,
          {
            opacity: lineAnimations[5 - index],
            transform: [
              {
                scaleX: lineAnimations[5 - index],
              },
            ],
          },
        ]}
      >
        {isYang ? (
          // Yang line (solid)
          <View style={styles.yangLine} />
        ) : (
          // Yin line (broken)
          <View style={styles.yinLineContainer}>
            <View style={styles.yinLine} />
            <View style={styles.yinGap} />
            <View style={styles.yinLine} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kinh Dịch</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hexagram Display */}
        <View style={styles.hexagramSection}>
          {hexagram ? (
            <View style={styles.hexagramCardContainer}>
              {/* Real Hexagram Card Image */}
              <View style={styles.hexagramImageWrapper}>
                <Image
                  source={getHexagramImage(hexagram.id)}
                  style={styles.hexagramImage}
                  resizeMode="contain"
                />
              </View>
              {/* Card name overlay */}
              <View style={styles.hexagramNameOverlay}>
                <Text style={styles.hexagramName}>{hexagram.name}</Text>
                <Text style={styles.hexagramVietnamese}>{hexagram.vietnamese}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.hexagramCardContainer}>
              {/* Card Back (before casting) */}
              <View style={styles.hexagramImageWrapper}>
                <Image
                  source={getCardBack()}
                  style={styles.hexagramImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.emptyHexagram}>
                <Text style={styles.emptyText}>Nhấn để gieo quẻ</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quota Display */}
        {!isLoadingQuota && (
          <View style={styles.quotaContainer}>
            <Text style={styles.quotaText}>
              {quota?.unlimited
                ? '✨ Không giới hạn'
                : `📊 Còn ${quota?.remaining || 0}/${quota?.limit || 5} lượt hôm nay`}
            </Text>
            <Text style={styles.tierText}>
              {TierService.getTierDisplayName(userTier)}
            </Text>
          </View>
        )}

        {/* Cast Button */}
        <TouchableOpacity
          style={[
            styles.castButton,
            (isLoading || isLoadingQuota) && styles.castButtonDisabled,
            !canDivine() && styles.castButtonLocked
          ]}
          onPress={castHexagram}
          disabled={isLoading || isLoadingQuota}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!canDivine() ? ['#555', '#444'] : GRADIENTS.gold}
            style={styles.castButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoadingQuota ? (
              <ActivityIndicator size="small" color="#0F1030" />
            ) : !canDivine() ? (
              <>
                <Lock size={20} color="#999" />
                <Text style={[styles.castButtonText, styles.castButtonTextLocked]}>
                  Hết lượt hôm nay
                </Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color="#0F1030" />
                <Text style={styles.castButtonText}>
                  {isLoading ? 'Đang gieo quẻ...' : hexagram ? 'Gieo lại' : 'Gieo quẻ'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Interpretation */}
        {interpretation && (
          <View style={styles.interpretationSection}>
            <Text style={styles.sectionTitle}>Giải quẻ</Text>

            {/* General */}
            <View style={styles.interpretCard}>
              <Text style={styles.interpretLabel}>Tổng quan</Text>
              <Text style={styles.interpretText}>{interpretation.general}</Text>
            </View>

            {/* Advice */}
            <View style={styles.interpretCard}>
              <Text style={styles.interpretLabel}>Lời khuyên</Text>
              <Text style={styles.interpretText}>{interpretation.advice}</Text>
            </View>

            {/* Warning */}
            <View style={[styles.interpretCard, styles.warningCard]}>
              <Text style={[styles.interpretLabel, styles.warningLabel]}>Cảnh báo</Text>
              <Text style={styles.interpretText}>{interpretation.warning}</Text>
            </View>

            {/* Fortune */}
            <View style={styles.fortuneSection}>
              <Text style={styles.fortuneLabel}>Độ may mắn</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    style={[
                      styles.star,
                      star <= interpretation.fortune && styles.starActive,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>

            {/* Send to Chat Button */}
            <TouchableOpacity
              style={styles.sendToChatButton}
              activeOpacity={0.7}
              onPress={() => {
                // Format result for chat with visual data
                const resultData = {
                  type: 'iching',
                  text: `🔮 **Kết quả Kinh Dịch**\n\n**Quẻ ${hexagram.name}** (${hexagram.vietnamese})\n\n${interpretation.general}\n\n**Lời khuyên:** ${interpretation.advice}\n\n**Cảnh báo:** ${interpretation.warning}`,
                  hexagram: {
                    id: hexagram.id,
                    name: hexagram.name,
                    vietnamese: hexagram.vietnamese,
                    meaning: hexagram.meaning,
                    lines: hexagram.lines,
                  },
                  interpretation: interpretation,
                };

                // Go back and send to chat
                navigation.goBack();
                if (onSendToChat) {
                  setTimeout(() => {
                    onSendToChat(resultData);
                  }, 100);
                }
              }}
            >
              <LinearGradient
                colors={GRADIENTS.gold}
                style={styles.sendToChatGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.sendToChatText}>📨 Gửi vào Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  const shareContent = `🔮 Kết quả Kinh Dịch - Gemral\n\n` +
                    `Quẻ: ${hexagram.name} (${hexagram.vietnamese})\n` +
                    `Ý nghĩa: ${hexagram.meaning}\n\n` +
                    `${interpretation.general}\n\n` +
                    `💡 Lời khuyên: ${interpretation.advice}\n\n` +
                    `⚠️ Cảnh báo: ${interpretation.warning}\n\n` +
                    `⭐ Độ may mắn: ${'★'.repeat(interpretation.fortune)}${'☆'.repeat(5 - interpretation.fortune)}\n\n` +
                    `📲 Tải app Gemral để xem quẻ của bạn!\nhttps://gemral.com`;

                  await Share.share({
                    message: shareContent,
                    title: 'Kết quả Kinh Dịch - Gemral',
                  });
                } catch (error) {
                  Alert.alert('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
                }
              }}
            >
              <Share2 size={18} color={COLORS.textPrimary} />
              <Text style={styles.shareButtonText}>Chia sẻ kết quả</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  hexagramSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  hexagramCardContainer: {
    alignItems: 'center',
    width: '100%',
  },
  hexagramImageWrapper: {
    width: 220,
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(15, 16, 48, 0.8)',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  hexagramImage: {
    width: '100%',
    height: '100%',
  },
  hexagramNameOverlay: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  hexagramName: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
  },
  hexagramVietnamese: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyHexagram: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  // Quota display
  quotaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  quotaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  castButton: {
    marginBottom: SPACING.xl,
  },
  castButtonDisabled: {
    opacity: 0.6,
  },
  castButtonLocked: {
    opacity: 0.8,
  },
  castButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  castButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
  castButtonTextLocked: {
    color: '#999',
  },
  interpretationSection: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  interpretCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  warningCard: {
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  interpretLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  warningLabel: {
    color: COLORS.error,
  },
  interpretText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  fortuneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  fortuneLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  starActive: {
    color: COLORS.gold,
  },
  sendToChatButton: {
    marginTop: SPACING.md,
  },
  sendToChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  sendToChatText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0F1030',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    marginTop: SPACING.md,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default IChingScreen;

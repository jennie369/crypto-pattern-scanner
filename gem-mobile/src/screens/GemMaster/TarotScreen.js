/**
 * GEM Platform - Tarot Screen
 * Interactive tarot card reading
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, Share2, Layers, Star, Moon, Sun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';
import { useTabBar } from '../../contexts/TabBarContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.md * 4) / 3;

// Complete 78 Tarot cards (22 Major Arcana + 56 Minor Arcana)
const TAROT_CARDS = [
  // Major Arcana (0-21)
  { id: 0, name: 'The Fool', vietnamese: 'Kẻ Khờ', meaning: 'Khởi đầu mới, mạo hiểm', icon: Star, arcana: 'major' },
  { id: 1, name: 'The Magician', vietnamese: 'Pháp Sư', meaning: 'Sáng tạo, ý chí', icon: Star, arcana: 'major' },
  { id: 2, name: 'The High Priestess', vietnamese: 'Nữ Tu', meaning: 'Trực giác, bí ẩn', icon: Moon, arcana: 'major' },
  { id: 3, name: 'The Empress', vietnamese: 'Hoàng Hậu', meaning: 'Sung túc, nữ tính', icon: Star, arcana: 'major' },
  { id: 4, name: 'The Emperor', vietnamese: 'Hoàng Đế', meaning: 'Quyền lực, ổn định', icon: Star, arcana: 'major' },
  { id: 5, name: 'The Hierophant', vietnamese: 'Giáo Hoàng', meaning: 'Truyền thống, hướng dẫn', icon: Star, arcana: 'major' },
  { id: 6, name: 'The Lovers', vietnamese: 'Người Tình', meaning: 'Tình yêu, lựa chọn', icon: Star, arcana: 'major' },
  { id: 7, name: 'The Chariot', vietnamese: 'Chiến Xa', meaning: 'Chiến thắng, quyết tâm', icon: Star, arcana: 'major' },
  { id: 8, name: 'Strength', vietnamese: 'Sức Mạnh', meaning: 'Dũng cảm, kiên nhẫn', icon: Star, arcana: 'major' },
  { id: 9, name: 'The Hermit', vietnamese: 'Ẩn Sĩ', meaning: 'Nội tâm, tìm kiếm', icon: Moon, arcana: 'major' },
  { id: 10, name: 'Wheel of Fortune', vietnamese: 'Bánh Xe', meaning: 'Vận mệnh, thay đổi', icon: Sun, arcana: 'major' },
  { id: 11, name: 'Justice', vietnamese: 'Công Lý', meaning: 'Công bằng, cân bằng', icon: Star, arcana: 'major' },
  { id: 12, name: 'The Hanged Man', vietnamese: 'Người Treo', meaning: 'Hy sinh, nhìn mới', icon: Moon, arcana: 'major' },
  { id: 13, name: 'Death', vietnamese: 'Tử Thần', meaning: 'Kết thúc, chuyển hóa', icon: Moon, arcana: 'major' },
  { id: 14, name: 'Temperance', vietnamese: 'Tiết Chế', meaning: 'Điều độ, hài hòa', icon: Star, arcana: 'major' },
  { id: 15, name: 'The Devil', vietnamese: 'Ác Quỷ', meaning: 'Ràng buộc, cám dỗ', icon: Moon, arcana: 'major' },
  { id: 16, name: 'The Tower', vietnamese: 'Tháp', meaning: 'Đổ vỡ, giác ngộ', icon: Moon, arcana: 'major' },
  { id: 17, name: 'The Star', vietnamese: 'Ngôi Sao', meaning: 'Hy vọng, cảm hứng', icon: Star, arcana: 'major' },
  { id: 18, name: 'The Moon', vietnamese: 'Mặt Trăng', meaning: 'Ảo tưởng, tiềm thức', icon: Moon, arcana: 'major' },
  { id: 19, name: 'The Sun', vietnamese: 'Mặt Trời', meaning: 'Thành công, niềm vui', icon: Sun, arcana: 'major' },
  { id: 20, name: 'Judgement', vietnamese: 'Phán Xét', meaning: 'Phục sinh, đánh giá', icon: Star, arcana: 'major' },
  { id: 21, name: 'The World', vietnamese: 'Thế Giới', meaning: 'Hoàn thành, thành tựu', icon: Sun, arcana: 'major' },

  // Minor Arcana - Wands (Fire) - Hành động, đam mê
  { id: 22, name: 'Ace of Wands', vietnamese: 'Át Gậy', meaning: 'Khởi đầu sáng tạo', icon: Sun, arcana: 'wands' },
  { id: 23, name: 'Two of Wands', vietnamese: 'Hai Gậy', meaning: 'Lập kế hoạch, quyết định', icon: Star, arcana: 'wands' },
  { id: 24, name: 'Three of Wands', vietnamese: 'Ba Gậy', meaning: 'Mở rộng, tiến bộ', icon: Star, arcana: 'wands' },
  { id: 25, name: 'Four of Wands', vietnamese: 'Bốn Gậy', meaning: 'Ăn mừng, ổn định', icon: Sun, arcana: 'wands' },
  { id: 26, name: 'Five of Wands', vietnamese: 'Năm Gậy', meaning: 'Cạnh tranh, xung đột', icon: Star, arcana: 'wands' },
  { id: 27, name: 'Six of Wands', vietnamese: 'Sáu Gậy', meaning: 'Chiến thắng, công nhận', icon: Sun, arcana: 'wands' },
  { id: 28, name: 'Seven of Wands', vietnamese: 'Bảy Gậy', meaning: 'Bảo vệ, kiên định', icon: Star, arcana: 'wands' },
  { id: 29, name: 'Eight of Wands', vietnamese: 'Tám Gậy', meaning: 'Tốc độ, hành động', icon: Sun, arcana: 'wands' },
  { id: 30, name: 'Nine of Wands', vietnamese: 'Chín Gậy', meaning: 'Kiên trì, thận trọng', icon: Star, arcana: 'wands' },
  { id: 31, name: 'Ten of Wands', vietnamese: 'Mười Gậy', meaning: 'Gánh nặng, trách nhiệm', icon: Moon, arcana: 'wands' },
  { id: 32, name: 'Page of Wands', vietnamese: 'Thị Vệ Gậy', meaning: 'Khám phá, nhiệt huyết', icon: Star, arcana: 'wands' },
  { id: 33, name: 'Knight of Wands', vietnamese: 'Hiệp Sĩ Gậy', meaning: 'Phiêu lưu, đam mê', icon: Sun, arcana: 'wands' },
  { id: 34, name: 'Queen of Wands', vietnamese: 'Hoàng Hậu Gậy', meaning: 'Tự tin, quyến rũ', icon: Sun, arcana: 'wands' },
  { id: 35, name: 'King of Wands', vietnamese: 'Hoàng Đế Gậy', meaning: 'Lãnh đạo, tầm nhìn', icon: Sun, arcana: 'wands' },

  // Minor Arcana - Cups (Water) - Cảm xúc, quan hệ
  { id: 36, name: 'Ace of Cups', vietnamese: 'Át Cốc', meaning: 'Tình yêu mới, cảm xúc', icon: Moon, arcana: 'cups' },
  { id: 37, name: 'Two of Cups', vietnamese: 'Hai Cốc', meaning: 'Kết nối, đối tác', icon: Star, arcana: 'cups' },
  { id: 38, name: 'Three of Cups', vietnamese: 'Ba Cốc', meaning: 'Ăn mừng, tình bạn', icon: Sun, arcana: 'cups' },
  { id: 39, name: 'Four of Cups', vietnamese: 'Bốn Cốc', meaning: 'Thiền định, thờ ơ', icon: Moon, arcana: 'cups' },
  { id: 40, name: 'Five of Cups', vietnamese: 'Năm Cốc', meaning: 'Mất mát, hối tiếc', icon: Moon, arcana: 'cups' },
  { id: 41, name: 'Six of Cups', vietnamese: 'Sáu Cốc', meaning: 'Hoài niệm, ngây thơ', icon: Star, arcana: 'cups' },
  { id: 42, name: 'Seven of Cups', vietnamese: 'Bảy Cốc', meaning: 'Ảo tưởng, lựa chọn', icon: Moon, arcana: 'cups' },
  { id: 43, name: 'Eight of Cups', vietnamese: 'Tám Cốc', meaning: 'Rời bỏ, tìm kiếm', icon: Moon, arcana: 'cups' },
  { id: 44, name: 'Nine of Cups', vietnamese: 'Chín Cốc', meaning: 'Mãn nguyện, ước mơ', icon: Sun, arcana: 'cups' },
  { id: 45, name: 'Ten of Cups', vietnamese: 'Mười Cốc', meaning: 'Hạnh phúc, gia đình', icon: Sun, arcana: 'cups' },
  { id: 46, name: 'Page of Cups', vietnamese: 'Thị Vệ Cốc', meaning: 'Sáng tạo, trực giác', icon: Star, arcana: 'cups' },
  { id: 47, name: 'Knight of Cups', vietnamese: 'Hiệp Sĩ Cốc', meaning: 'Lãng mạn, mơ mộng', icon: Moon, arcana: 'cups' },
  { id: 48, name: 'Queen of Cups', vietnamese: 'Hoàng Hậu Cốc', meaning: 'Từ bi, trực giác', icon: Moon, arcana: 'cups' },
  { id: 49, name: 'King of Cups', vietnamese: 'Hoàng Đế Cốc', meaning: 'Điềm tĩnh, khôn ngoan', icon: Star, arcana: 'cups' },

  // Minor Arcana - Swords (Air) - Tư duy, giao tiếp
  { id: 50, name: 'Ace of Swords', vietnamese: 'Át Kiếm', meaning: 'Sáng suốt, sự thật', icon: Star, arcana: 'swords' },
  { id: 51, name: 'Two of Swords', vietnamese: 'Hai Kiếm', meaning: 'Bế tắc, quyết định', icon: Moon, arcana: 'swords' },
  { id: 52, name: 'Three of Swords', vietnamese: 'Ba Kiếm', meaning: 'Đau buồn, mất mát', icon: Moon, arcana: 'swords' },
  { id: 53, name: 'Four of Swords', vietnamese: 'Bốn Kiếm', meaning: 'Nghỉ ngơi, hồi phục', icon: Moon, arcana: 'swords' },
  { id: 54, name: 'Five of Swords', vietnamese: 'Năm Kiếm', meaning: 'Xung đột, thất bại', icon: Moon, arcana: 'swords' },
  { id: 55, name: 'Six of Swords', vietnamese: 'Sáu Kiếm', meaning: 'Chuyển tiếp, di chuyển', icon: Star, arcana: 'swords' },
  { id: 56, name: 'Seven of Swords', vietnamese: 'Bảy Kiếm', meaning: 'Chiến thuật, lừa dối', icon: Moon, arcana: 'swords' },
  { id: 57, name: 'Eight of Swords', vietnamese: 'Tám Kiếm', meaning: 'Giới hạn, bất lực', icon: Moon, arcana: 'swords' },
  { id: 58, name: 'Nine of Swords', vietnamese: 'Chín Kiếm', meaning: 'Lo lắng, ác mộng', icon: Moon, arcana: 'swords' },
  { id: 59, name: 'Ten of Swords', vietnamese: 'Mười Kiếm', meaning: 'Kết thúc đau đớn', icon: Moon, arcana: 'swords' },
  { id: 60, name: 'Page of Swords', vietnamese: 'Thị Vệ Kiếm', meaning: 'Tò mò, quan sát', icon: Star, arcana: 'swords' },
  { id: 61, name: 'Knight of Swords', vietnamese: 'Hiệp Sĩ Kiếm', meaning: 'Quyết đoán, nhanh nhẹn', icon: Star, arcana: 'swords' },
  { id: 62, name: 'Queen of Swords', vietnamese: 'Hoàng Hậu Kiếm', meaning: 'Độc lập, sắc bén', icon: Star, arcana: 'swords' },
  { id: 63, name: 'King of Swords', vietnamese: 'Hoàng Đế Kiếm', meaning: 'Công bằng, lý trí', icon: Star, arcana: 'swords' },

  // Minor Arcana - Pentacles (Earth) - Vật chất, tài chính
  { id: 64, name: 'Ace of Pentacles', vietnamese: 'Át Xu', meaning: 'Cơ hội tài chính', icon: Sun, arcana: 'pentacles' },
  { id: 65, name: 'Two of Pentacles', vietnamese: 'Hai Xu', meaning: 'Cân bằng, thích ứng', icon: Star, arcana: 'pentacles' },
  { id: 66, name: 'Three of Pentacles', vietnamese: 'Ba Xu', meaning: 'Hợp tác, kỹ năng', icon: Star, arcana: 'pentacles' },
  { id: 67, name: 'Four of Pentacles', vietnamese: 'Bốn Xu', meaning: 'Tiết kiệm, bảo thủ', icon: Moon, arcana: 'pentacles' },
  { id: 68, name: 'Five of Pentacles', vietnamese: 'Năm Xu', meaning: 'Khó khăn, thiếu thốn', icon: Moon, arcana: 'pentacles' },
  { id: 69, name: 'Six of Pentacles', vietnamese: 'Sáu Xu', meaning: 'Hào phóng, chia sẻ', icon: Sun, arcana: 'pentacles' },
  { id: 70, name: 'Seven of Pentacles', vietnamese: 'Bảy Xu', meaning: 'Kiên nhẫn, đầu tư', icon: Star, arcana: 'pentacles' },
  { id: 71, name: 'Eight of Pentacles', vietnamese: 'Tám Xu', meaning: 'Chăm chỉ, rèn luyện', icon: Star, arcana: 'pentacles' },
  { id: 72, name: 'Nine of Pentacles', vietnamese: 'Chín Xu', meaning: 'Thành công, độc lập', icon: Sun, arcana: 'pentacles' },
  { id: 73, name: 'Ten of Pentacles', vietnamese: 'Mười Xu', meaning: 'Thịnh vượng, gia tộc', icon: Sun, arcana: 'pentacles' },
  { id: 74, name: 'Page of Pentacles', vietnamese: 'Thị Vệ Xu', meaning: 'Học hỏi, cơ hội', icon: Star, arcana: 'pentacles' },
  { id: 75, name: 'Knight of Pentacles', vietnamese: 'Hiệp Sĩ Xu', meaning: 'Siêng năng, đáng tin', icon: Star, arcana: 'pentacles' },
  { id: 76, name: 'Queen of Pentacles', vietnamese: 'Hoàng Hậu Xu', meaning: 'Nuôi dưỡng, thực tế', icon: Sun, arcana: 'pentacles' },
  { id: 77, name: 'King of Pentacles', vietnamese: 'Hoàng Đế Xu', meaning: 'Thành đạt, vững chắc', icon: Sun, arcana: 'pentacles' },
];

// Spread positions
const SPREAD_POSITIONS = ['Quá khứ', 'Hiện tại', 'Tương lai'];

const TarotScreen = ({ navigation }) => {
  const [selectedCards, setSelectedCards] = useState([null, null, null]);
  const [isRevealed, setIsRevealed] = useState([false, false, false]);
  const [isReading, setIsReading] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const { hideTabBar, showTabBar } = useTabBar();

  // Hide tab bar when screen is focused
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, [hideTabBar, showTabBar]);

  // Animation refs
  const cardFlips = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Draw cards
  const drawCards = useCallback(async () => {
    setIsReading(true);
    setSelectedCards([null, null, null]);
    setIsRevealed([false, false, false]);
    setInterpretation(null);

    // Reset animations
    cardFlips.forEach((anim) => anim.setValue(0));

    // Shuffle and pick 3 random cards
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, 3);

    // Reveal cards one by one with animation
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSelectedCards((prev) => {
        const newCards = [...prev];
        newCards[i] = drawn[i];
        return newCards;
      });

      Animated.spring(cardFlips[i], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      setIsRevealed((prev) => {
        const newRevealed = [...prev];
        newRevealed[i] = true;
        return newRevealed;
      });
    }

    // Generate interpretation
    await new Promise((resolve) => setTimeout(resolve, 300));
    setInterpretation(generateInterpretation(drawn));
    setIsReading(false);
  }, [cardFlips]);

  // Generate mock interpretation
  const generateInterpretation = (cards) => {
    return {
      summary: `Trải bài của bạn cho thấy một hành trình từ ${cards[0].vietnamese} đến ${cards[2].vietnamese}. Đây là thông điệp quan trọng cho giai đoạn này.`,
      past: `${cards[0].vietnamese}: ${cards[0].meaning}. Quá khứ đã định hình con người bạn ngày hôm nay.`,
      present: `${cards[1].vietnamese}: ${cards[1].meaning}. Hiện tại đang mang đến những cơ hội mới.`,
      future: `${cards[2].vietnamese}: ${cards[2].meaning}. Tương lai hứa hẹn nhiều điều thú vị.`,
      advice: 'Hãy tin tưởng vào trực giác và không ngừng tiến về phía trước.',
    };
  };

  // Render card
  const renderCard = (index) => {
    const card = selectedCards[index];
    const revealed = isRevealed[index];

    const frontAnimatedStyle = {
      transform: [
        {
          rotateY: cardFlips[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg'],
          }),
        },
      ],
    };

    const backAnimatedStyle = {
      transform: [
        {
          rotateY: cardFlips[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    };

    const IconComponent = card?.icon || Star;

    return (
      <View key={index} style={styles.cardSlot}>
        <Text style={styles.positionLabel}>{SPREAD_POSITIONS[index]}</Text>

        <View style={styles.cardContainer}>
          {/* Card Back */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <LinearGradient
              colors={['#2A1F5C', '#1A1438']}
              style={styles.cardBackGradient}
            >
              <View style={styles.cardBackPattern}>
                <Star size={24} color={COLORS.gold} strokeWidth={1} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Card Front */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <LinearGradient
              colors={['rgba(255, 189, 89, 0.3)', 'rgba(106, 91, 255, 0.2)']}
              style={styles.cardFrontGradient}
            >
              {card && (
                <>
                  <View style={styles.cardIconWrapper}>
                    <IconComponent size={28} color={COLORS.gold} />
                  </View>
                  <Text style={styles.cardNumber}>{card.id}</Text>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {card.vietnamese}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Tarot</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards Section */}
        <View style={styles.cardsSection}>
          <View style={styles.spreadIcon}>
            <Layers size={32} color={COLORS.cyan} />
          </View>
          <Text style={styles.spreadTitle}>Trải bài 3 lá</Text>
          <Text style={styles.spreadSubtitle}>Quá khứ - Hiện tại - Tương lai</Text>

          {/* Cards Row */}
          <View style={styles.cardsRow}>
            {[0, 1, 2].map((index) => renderCard(index))}
          </View>
        </View>

        {/* Draw Button */}
        <TouchableOpacity
          style={[styles.drawButton, isReading && styles.drawButtonDisabled]}
          onPress={drawCards}
          disabled={isReading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.glassBorder}
            style={styles.drawButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.drawButtonText}>
              {isReading ? 'Đang bốc bài...' : selectedCards[0] ? 'Bốc lại' : 'Bốc bài'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Interpretation */}
        {interpretation && (
          <View style={styles.interpretationSection}>
            <Text style={styles.sectionTitle}>Giải bài</Text>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{interpretation.summary}</Text>
            </View>

            {/* Past */}
            <View style={styles.interpretCard}>
              <Text style={styles.interpretLabel}>Quá khứ</Text>
              <Text style={styles.interpretText}>{interpretation.past}</Text>
            </View>

            {/* Present */}
            <View style={[styles.interpretCard, styles.presentCard]}>
              <Text style={[styles.interpretLabel, styles.presentLabel]}>Hiện tại</Text>
              <Text style={styles.interpretText}>{interpretation.present}</Text>
            </View>

            {/* Future */}
            <View style={[styles.interpretCard, styles.futureCard]}>
              <Text style={[styles.interpretLabel, styles.futureLabel]}>Tương lai</Text>
              <Text style={styles.interpretText}>{interpretation.future}</Text>
            </View>

            {/* Advice */}
            <View style={styles.adviceCard}>
              <Text style={styles.adviceLabel}>Lời khuyên</Text>
              <Text style={styles.adviceText}>{interpretation.advice}</Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
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
  cardsSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  spreadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  spreadTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  spreadSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  cardSlot: {
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardBack: {
    zIndex: 1,
  },
  cardFront: {
    zIndex: 0,
  },
  cardBackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 12,
  },
  cardBackPattern: {
    opacity: 0.5,
  },
  cardFrontGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.5)',
    borderRadius: 12,
  },
  cardIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardNumber: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  cardName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  drawButton: {
    marginBottom: SPACING.xl,
  },
  drawButtonDisabled: {
    opacity: 0.6,
  },
  drawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: 24,
  },
  drawButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
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
  summaryCard: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    padding: SPACING.md,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  interpretCard: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
  },
  presentCard: {
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  futureCard: {
    borderColor: 'rgba(58, 247, 166, 0.3)',
    backgroundColor: 'rgba(58, 247, 166, 0.05)',
  },
  interpretLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presentLabel: {
    color: COLORS.cyan,
  },
  futureLabel: {
    color: COLORS.success,
  },
  interpretText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  adviceCard: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    padding: SPACING.md,
  },
  adviceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adviceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
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

export default TarotScreen;

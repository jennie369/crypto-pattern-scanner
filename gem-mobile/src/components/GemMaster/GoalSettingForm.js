/**
 * GEM Mobile - Goal Setting Form
 * Interactive form for setting goals/affirmations with questionnaire
 * Instead of text chat, user fills form and selects options
 * Then AI analyzes and suggests widgets to add to Vision Board
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  Target,
  Heart,
  Briefcase,
  DollarSign,
  Users,
  Brain,
  Sparkles,
  ChevronRight,
  Check,
  Plus,
  CheckCircle,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';
import gemMasterService from '../../services/gemMasterService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Life areas for goal categorization
const LIFE_AREAS = [
  { id: 'finance', label: 'Tài chính', icon: DollarSign, color: '#10B981' },
  { id: 'crypto', label: 'Crypto', icon: Zap, color: '#F7931A' },
  { id: 'career', label: 'Sự nghiệp', icon: Briefcase, color: '#6366F1' },
  { id: 'health', label: 'Sức khỏe', icon: Heart, color: '#EF4444' },
  { id: 'relationships', label: 'Mối quan hệ', icon: Users, color: '#EC4899' },
  { id: 'personal', label: 'Phát triển bản thân', icon: Brain, color: '#8B5CF6' },
  { id: 'spiritual', label: 'Tâm linh', icon: Sparkles, color: '#F59E0B' },
];

// Timeframes for goals
const TIMEFRAMES = [
  { id: '1week', label: '1 tuần' },
  { id: '1month', label: '1 tháng' },
  { id: '3months', label: '3 tháng' },
  { id: '6months', label: '6 tháng' },
  { id: '1year', label: '1 năm' },
  { id: 'ongoing', label: 'Không giới hạn' },
];

// Motivation levels
const MOTIVATION_LEVELS = [
  { id: 'very_high', label: 'Rất cao', emoji: '100%' },
  { id: 'high', label: 'Cao', emoji: '80%' },
  { id: 'medium', label: 'Trung bình', emoji: '50%' },
  { id: 'need_help', label: 'Cần hỗ trợ', emoji: '30%' },
];

// Goal suggestions by life area - quick select options
const GOAL_SUGGESTIONS = {
  finance: [
    'Tiết kiệm 100 triệu trong 6 tháng',
    'Xây dựng quỹ khẩn cấp 6 tháng chi tiêu',
    'Tăng thu nhập thụ động lên 10tr/tháng',
    'Đầu tư crypto có lợi nhuận ổn định',
    'Thanh toán hết nợ trong năm nay',
    'Mua nhà/đất đầu tiên',
  ],
  crypto: [
    'Đạt lợi nhuận 50% từ trading crypto',
    'Xây dựng portfolio crypto cân bằng',
    'Học phân tích kỹ thuật thành thạo',
    'Quản lý rủi ro, không mất quá 2%/lệnh',
    'Tìm 3 altcoin tiềm năng mùa bull run',
    'Tham gia staking và yield farming',
  ],
  career: [
    'Thăng tiến lên vị trí quản lý',
    'Tăng lương 30% trong năm nay',
    'Học thêm kỹ năng mới (AI, Data)',
    'Chuyển đổi ngành nghề thành công',
    'Xây dựng thương hiệu cá nhân',
    'Khởi nghiệp kinh doanh riêng',
  ],
  health: [
    'Giảm 10kg và duy trì cân nặng',
    'Tập gym đều đặn 4 buổi/tuần',
    'Ngủ đủ 7-8 tiếng mỗi đêm',
    'Ăn uống lành mạnh, ít đường',
    'Chạy bộ 5km không nghỉ',
    'Thiền định 15 phút mỗi ngày',
  ],
  relationships: [
    'Cải thiện mối quan hệ với gia đình',
    'Tìm được người bạn đời phù hợp',
    'Dành thời gian chất lượng với con',
    'Mở rộng mạng lưới quan hệ',
    'Hàn gắn mối quan hệ đã xa cách',
    'Học cách giao tiếp hiệu quả hơn',
  ],
  personal: [
    'Học ngoại ngữ mới (Anh/Trung)',
    'Đọc 24 cuốn sách trong năm',
    'Phát triển tư duy tích cực',
    'Vượt qua nỗi sợ và lo âu',
    'Xây dựng thói quen tốt mỗi ngày',
    'Du lịch trải nghiệm 3 nơi mới',
  ],
  spiritual: [
    'Thiền định sâu 30 phút mỗi ngày',
    'Kết nối với bản ngã cao hơn',
    'Sống mindful và hiện tại',
    'Phát triển trực giác và năng lượng',
    'Thực hành biết ơn mỗi ngày',
    'Cân bằng chakra và năng lượng',
  ],
};

// Pre-defined affirmation templates by category
const AFFIRMATION_TEMPLATES = {
  finance: [
    'Tôi thu hút tiền bạc và sự thịnh vượng mỗi ngày',
    'Tôi xứng đáng được giàu có và sung túc',
    'Tiền bạc đến với tôi dễ dàng và liên tục',
    'Tôi quản lý tài chính một cách thông minh',
  ],
  crypto: [
    'Tôi giao dịch với sự bình tĩnh và kỷ luật',
    'Mỗi quyết định trading của tôi đều sáng suốt',
    'Tôi kiên nhẫn chờ đợi cơ hội hoàn hảo',
    'Tôi quản lý rủi ro một cách khôn ngoan',
    'Thị trường crypto mang lại cơ hội tuyệt vời cho tôi',
  ],
  career: [
    'Tôi là chuyên gia trong lĩnh vực của mình',
    'Cơ hội tốt luôn đến với tôi',
    'Tôi tự tin trong mọi quyết định công việc',
    'Sự nghiệp của tôi phát triển mỗi ngày',
  ],
  health: [
    'Cơ thể tôi khỏe mạnh và tràn đầy năng lượng',
    'Tôi yêu thương và chăm sóc bản thân mỗi ngày',
    'Tôi ngủ ngon và thức dậy đầy sức sống',
    'Tâm trí tôi bình an và cơ thể tôi khỏe mạnh',
  ],
  relationships: [
    'Tôi thu hút những mối quan hệ tích cực',
    'Tôi được yêu thương và tôn trọng',
    'Tôi dễ dàng kết nối với người khác',
    'Tình yêu tràn ngập trong cuộc sống của tôi',
  ],
  personal: [
    'Tôi tin tưởng vào khả năng của bản thân',
    'Mỗi ngày tôi trở nên tốt đẹp hơn',
    'Tôi dũng cảm theo đuổi ước mơ',
    'Tôi xứng đáng với mọi điều tốt đẹp',
  ],
  spiritual: [
    'Tôi kết nối sâu sắc với vũ trụ',
    'Năng lượng tích cực bao quanh tôi',
    'Tôi sống trong sự biết ơn mỗi ngày',
    'Trực giác của tôi luôn dẫn đường đúng đắn',
  ],
};

const GoalSettingForm = ({
  visible,
  formType = 'goal',
  preSelectedArea = null,  // NEW: Pre-selected life area from intent detection
  userInput = null,        // NEW: Original user input text
  onClose,
  onResult
}) => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);

  // Determine initial step: skip step 1 if area is pre-selected
  const initialStep = preSelectedArea ? 2 : 1;

  // Form state
  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Form data - pre-fill from props
  const [selectedArea, setSelectedArea] = useState(preSelectedArea);
  const [goalText, setGoalText] = useState(userInput || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  const [selectedAffirmations, setSelectedAffirmations] = useState([]);
  const [customAffirmation, setCustomAffirmation] = useState('');

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Update form when props change (e.g. when modal opens with new preSelectedArea)
  React.useEffect(() => {
    if (visible) {
      if (preSelectedArea) {
        setSelectedArea(preSelectedArea);
        setStep(2); // Skip to step 2 (goal description)
      } else {
        setStep(1);
      }
      if (userInput) {
        setGoalText(userInput);
      }
    }
  }, [visible, preSelectedArea, userInput]);

  // Reset form
  const resetForm = useCallback(() => {
    setStep(preSelectedArea ? 2 : 1);
    setSelectedArea(preSelectedArea || null);
    setGoalText(userInput || '');
    setSelectedTimeframe(null);
    setSelectedMotivation(null);
    setSelectedAffirmations([]);
    setCustomAffirmation('');
    setShowResult(false);
    setAnalysisResult(null);
  }, [preSelectedArea, userInput]);

  // Handle close
  const handleClose = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  // Toggle affirmation selection
  const toggleAffirmation = useCallback((aff) => {
    setSelectedAffirmations(prev => {
      if (prev.includes(aff)) {
        return prev.filter(a => a !== aff);
      }
      return [...prev, aff];
    });
  }, []);

  // Add custom affirmation
  const addCustomAffirmation = useCallback(() => {
    if (customAffirmation.trim()) {
      setSelectedAffirmations(prev => [...prev, customAffirmation.trim()]);
      setCustomAffirmation('');
    }
  }, [customAffirmation]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (step < 4) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [step]);

  // Go to previous step
  // Don't go back to step 1 if area was pre-selected (skip step 1)
  const prevStep = useCallback(() => {
    const minStep = preSelectedArea ? 2 : 1;
    if (step > minStep) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  }, [step, preSelectedArea]);

  // Check if current step is complete
  const isStepComplete = useCallback(() => {
    switch (step) {
      case 1:
        return selectedArea !== null;
      case 2:
        return goalText.trim().length >= 5;
      case 3:
        return selectedTimeframe !== null && selectedMotivation !== null;
      case 4:
        return selectedAffirmations.length > 0;
      default:
        return false;
    }
  }, [step, selectedArea, goalText, selectedTimeframe, selectedMotivation, selectedAffirmations]);

  // Submit form and analyze
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Vui lòng đăng nhập để sử dụng');
      }

      // Compile form data
      const areaLabel = LIFE_AREAS.find(a => a.id === selectedArea)?.label || '';
      const formData = {
        lifeArea: selectedArea,
        lifeAreaLabel: areaLabel,
        goal: goalText,
        timeframe: TIMEFRAMES.find(t => t.id === selectedTimeframe)?.label || '',
        motivation: selectedMotivation,
        affirmations: selectedAffirmations,
      };

      console.log('[GoalSettingForm] Submitting:', formData);

      // Generate contextual analysis (NOT crystal recommendations)
      // Create a focused action plan based on the goal
      const motivationLabel = MOTIVATION_LEVELS.find(m => m.id === selectedMotivation)?.label || '';

      // Get action steps for action_plan widget
      const actionSteps = getActionSteps(selectedArea, goalText);
      const analysisText = generateGoalAnalysis(areaLabel, goalText, formData.timeframe, motivationLabel, selectedAffirmations, actionSteps);

      // Build result with proper widget structure - includes goal, affirmation, AND action_plan
      const result = {
        formData,
        analysis: analysisText,
        widgets: [
          {
            type: 'goal',
            title: goalText,
            icon: '🎯',
            data: {
              goalText: goalText,
              lifeArea: selectedArea,
              timeline: formData.timeframe,
            },
          },
          {
            type: 'affirmation',
            title: `Khẳng định: ${areaLabel}`,
            icon: '✨',
            data: {
              affirmations: selectedAffirmations,
              lifeArea: selectedArea,
            },
          },
          {
            type: 'action_plan',
            title: `Kế hoạch: ${areaLabel}`,
            icon: '📋',
            data: {
              steps: actionSteps.map((step, i) => ({
                id: `step_${i}`,
                text: step,
                completed: false,
              })),
              lifeArea: selectedArea,
            },
          },
        ],
      };

      setAnalysisResult(result);
      setShowResult(true);

      // Animate result in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('[GoalSettingForm] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedArea, goalText, selectedTimeframe, selectedMotivation, selectedAffirmations, fadeAnim]);

  // Generate goal analysis text (local, no AI call for irrelevant content)
  const generateGoalAnalysis = (areaLabel, goal, timeframe, motivation, affirmations, actionSteps) => {
    return `**Phân tích mục tiêu: ${areaLabel}**

**Mục tiêu của bạn:**
"${goal}"

**Thời gian:** ${timeframe}
**Mức độ quyết tâm:** ${motivation}

**3 bước hành động đề xuất:**
${actionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Affirmations hàng ngày:**
${affirmations.map(aff => `• "${aff}"`).join('\n')}

**Lời khuyên:** Hãy đọc affirmations mỗi sáng khi thức dậy và tối trước khi ngủ. Theo dõi tiến độ hàng tuần để duy trì động lực!`;
  };

  // Get action steps based on life area
  const getActionSteps = (area, goal) => {
    const stepsByArea = {
      finance: [
        'Lập ngân sách chi tiết và theo dõi chi tiêu hàng ngày',
        'Đặt mục tiêu tiết kiệm cụ thể mỗi tháng (ví dụ: 20% thu nhập)',
        'Tìm hiểu và đầu tư vào các kênh phù hợp với khẩu vị rủi ro',
      ],
      crypto: [
        'Học trading/phân tích kỹ thuật 1h/ngày',
        'Ghi chép trading journal sau mỗi lệnh',
        'Quản lý rủi ro: không vào quá 2% vốn/lệnh',
      ],
      career: [
        'Xác định 3 kỹ năng quan trọng cần phát triển và lập kế hoạch học tập',
        'Mở rộng network qua các sự kiện ngành và LinkedIn',
        'Đặt mục tiêu KPI hàng tháng và đánh giá tiến độ thường xuyên',
      ],
      health: [
        'Lập lịch tập luyện cố định ít nhất 3 buổi/tuần',
        'Chuẩn bị bữa ăn lành mạnh từ đầu tuần',
        'Ngủ đủ 7-8 tiếng và duy trì giờ ngủ đều đặn',
      ],
      relationships: [
        'Dành thời gian chất lượng với người thân yêu mỗi ngày',
        'Thực hành lắng nghe tích cực và thể hiện sự quan tâm chân thành',
        'Tham gia các hoạt động xã hội để mở rộng mối quan hệ',
      ],
      personal: [
        'Đọc sách hoặc học kỹ năng mới ít nhất 30 phút mỗi ngày',
        'Viết nhật ký phản chiếu để hiểu bản thân hơn',
        'Đặt ra thử thách nhỏ hàng tuần để ra khỏi vùng an toàn',
      ],
      spiritual: [
        'Thiền định hoặc thực hành chánh niệm 10-15 phút mỗi ngày',
        'Viết 3 điều biết ơn mỗi tối trước khi ngủ',
        'Kết nối với thiên nhiên qua các hoạt động ngoài trời',
      ],
    };

    return stepsByArea[area] || stepsByArea.personal;
  };

  // Add widgets to Vision Board
  // FIXED: Link affirmation/action_plan widgets to the goal using linked_goal_id
  // This enables cascade deletion when the goal is deleted
  const handleAddToVisionBoard = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const widgets = analysisResult?.widgets || [];
      let goalWidgetId = null;

      // First, save the goal widget to get its ID
      const goalWidget = widgets.find(w => w.type === 'goal');
      if (goalWidget) {
        const result = await gemMasterService.saveWidgetToVisionBoard(goalWidget, user.id);
        if (result.success && result.widget?.id) {
          goalWidgetId = result.widget.id;
          console.log('[GoalSettingForm] Goal widget saved with ID:', goalWidgetId);
        }
      }

      // Then save affirmation and action_plan widgets linked to the goal
      for (const widget of widgets) {
        if (widget.type === 'goal') continue; // Already saved

        // Pass goalWidgetId as linkedGoalId for cascade deletion support
        await gemMasterService.saveWidgetToVisionBoard(widget, user.id, goalWidgetId);
      }

      // Show success modal
      setShowSuccessModal(true);

      // Callback
      onResult?.({
        success: true,
        widgets: analysisResult?.widgets,
        analysis: analysisResult?.analysis,
      });

    } catch (error) {
      console.error('[GoalSettingForm] Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [analysisResult, onResult]);

  // Navigate to Vision Board - scroll to Goals section
  const goToVisionBoard = useCallback(() => {
    setShowSuccessModal(false);
    handleClose();
    navigation.navigate('Account', {
      screen: 'VisionBoard',
      params: { scrollToSection: 'goals' }
    });
  }, [navigation, handleClose]);

  // Get area label for display
  const getAreaLabel = useCallback(() => {
    const area = LIFE_AREAS.find(a => a.id === selectedArea);
    return area?.label || '';
  }, [selectedArea]);

  // Render step indicator - adjust for pre-selected area (skip step 1)
  const renderStepIndicator = () => {
    // If area was pre-selected, we only show 3 steps (2, 3, 4) but display as (1, 2, 3)
    const totalSteps = preSelectedArea ? 3 : 4;
    const adjustedStep = preSelectedArea ? step - 1 : step; // Step 2 becomes 1, Step 3 becomes 2, etc.

    return (
      <View style={styles.stepIndicator}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              s === adjustedStep && styles.stepDotActive,
              s < adjustedStep && styles.stepDotComplete,
            ]}
          >
            {s < adjustedStep && <Check size={12} color="#0A0F1C" />}
          </View>
        ))}
      </View>
    );
  };

  // Render Step 1: Life Area Selection
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bạn muốn đặt mục tiêu ở lĩnh vực nào?</Text>
      <Text style={styles.stepSubtitle}>Chọn một lĩnh vực phù hợp nhất</Text>

      <View style={styles.areaGrid}>
        {LIFE_AREAS.map((area) => {
          const Icon = area.icon;
          const isSelected = selectedArea === area.id;
          return (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaCard,
                isSelected && { borderColor: area.color, backgroundColor: `${area.color}20` },
              ]}
              onPress={() => setSelectedArea(area.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.areaIconContainer, { backgroundColor: `${area.color}30` }]}>
                <Icon size={24} color={area.color} />
              </View>
              <Text style={[styles.areaLabel, isSelected && { color: area.color }]}>
                {area.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: area.color }]}>
                  <Check size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render Step 2: Goal Description
  const renderStep2 = () => {
    const areaInfo = LIFE_AREAS.find(a => a.id === selectedArea);
    const suggestions = GOAL_SUGGESTIONS[selectedArea] || [];
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Mô tả mục tiêu của bạn</Text>
        <Text style={styles.stepSubtitle}>
          Trong lĩnh vực <Text style={{ color: areaInfo?.color }}>{areaInfo?.label}</Text>, bạn muốn đạt được gì?
        </Text>

        <TextInput
          style={styles.goalInput}
          placeholder="Nhập mục tiêu hoặc chọn gợi ý bên dưới..."
          placeholderTextColor={COLORS.textMuted}
          value={goalText}
          onChangeText={setGoalText}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.charCount}>{goalText.length} ký tự (tối thiểu 5)</Text>

        {/* Quick suggestion chips */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsLabel}>Gợi ý nhanh:</Text>
            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionChip,
                    goalText === suggestion && styles.suggestionChipSelected,
                  ]}
                  onPress={() => setGoalText(suggestion)}
                >
                  <Text style={[
                    styles.suggestionChipText,
                    goalText === suggestion && styles.suggestionChipTextSelected,
                  ]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render Step 3: Timeframe & Motivation
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Thời gian & Mức độ quyết tâm</Text>

      <Text style={styles.sectionLabel}>Bạn muốn hoàn thành trong bao lâu?</Text>
      <View style={styles.optionRow}>
        {TIMEFRAMES.map((tf) => (
          <TouchableOpacity
            key={tf.id}
            style={[
              styles.optionChip,
              selectedTimeframe === tf.id && styles.optionChipSelected,
            ]}
            onPress={() => setSelectedTimeframe(tf.id)}
          >
            <Text
              style={[
                styles.optionChipText,
                selectedTimeframe === tf.id && styles.optionChipTextSelected,
              ]}
            >
              {tf.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>
        Mức độ quyết tâm của bạn?
      </Text>
      <View style={styles.motivationGrid}>
        {MOTIVATION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.motivationCard,
              selectedMotivation === level.id && styles.motivationCardSelected,
            ]}
            onPress={() => setSelectedMotivation(level.id)}
          >
            <Text style={styles.motivationEmoji}>{level.emoji}</Text>
            <Text
              style={[
                styles.motivationLabel,
                selectedMotivation === level.id && styles.motivationLabelSelected,
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render Step 4: Affirmations Selection
  const renderStep4 = () => {
    const templates = AFFIRMATION_TEMPLATES[selectedArea] || AFFIRMATION_TEMPLATES.personal;
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Chọn Affirmation phù hợp</Text>
        <Text style={styles.stepSubtitle}>
          Chọn những câu khẳng định bạn muốn nhắc nhở mỗi ngày
        </Text>

        <View style={styles.affirmationList}>
          {templates.map((aff, index) => {
            const isSelected = selectedAffirmations.includes(aff);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.affirmationItem,
                  isSelected && styles.affirmationItemSelected,
                ]}
                onPress={() => toggleAffirmation(aff)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Check size={14} color="#0A0F1C" />}
                </View>
                <Text style={[styles.affirmationText, isSelected && styles.affirmationTextSelected]}>
                  "{aff}"
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom affirmation input */}
        <View style={styles.customAffContainer}>
          <TextInput
            style={styles.customAffInput}
            placeholder="Hoặc thêm affirmation của riêng bạn..."
            placeholderTextColor={COLORS.textMuted}
            value={customAffirmation}
            onChangeText={setCustomAffirmation}
          />
          <TouchableOpacity
            style={[styles.addAffButton, !customAffirmation.trim() && styles.addAffButtonDisabled]}
            onPress={addCustomAffirmation}
            disabled={!customAffirmation.trim()}
          >
            <Plus size={18} color={customAffirmation.trim() ? COLORS.gold : COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.selectedCount}>
          Đã chọn: {selectedAffirmations.length} affirmation
        </Text>
      </View>
    );
  };

  // Render Result View
  const renderResult = () => (
    <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
      <View style={styles.resultHeader}>
        <CheckCircle size={48} color={COLORS.success || '#10B981'} />
        <Text style={styles.resultTitle}>Phân tích hoàn tất!</Text>
      </View>

      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Kết quả phân tích</Text>
        <Text style={styles.analysisText}>{analysisResult?.analysis}</Text>
      </View>

      <View style={styles.widgetPreview}>
        <Text style={styles.widgetPreviewTitle}>Mục tiêu sẽ được tạo:</Text>
        {analysisResult?.widgets?.map((w, i) => (
          <View key={i} style={styles.widgetPreviewItem}>
            <Text style={styles.widgetPreviewIcon}>{w.icon}</Text>
            <Text style={styles.widgetPreviewText}>{w.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity style={styles.skipResultButton} onPress={handleClose}>
          <Text style={styles.skipResultText}>Để sau</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addVisionButton}
          onPress={handleAddToVisionBoard}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#0A0F1C" />
          ) : (
            <>
              <Plus size={18} color="#0A0F1C" />
              <Text style={styles.addVisionText}>Thêm vào Vision Board</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header - show specific title when area is pre-selected */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {preSelectedArea
              ? `Manifest ${getAreaLabel()}`
              : formType === 'goal'
                ? 'Đặt Mục Tiêu Mới'
                : 'Tạo Affirmation'
            }
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {!showResult && renderStepIndicator()}

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {showResult ? (
            renderResult()
          ) : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        {!showResult && (
          <View style={styles.bottomActions}>
            {/* Show back button only when not at the first possible step */}
            {step > (preSelectedArea ? 2 : 1) && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.backButtonText}>Quay lại</Text>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                style={[styles.nextButton, !isStepComplete() && styles.nextButtonDisabled]}
                onPress={nextStep}
                disabled={!isStepComplete()}
              >
                <Text style={styles.nextButtonText}>Tiếp theo</Text>
                <ChevronRight size={20} color="#0A0F1C" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, (!isStepComplete() || isSubmitting) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isStepComplete() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#0A0F1C" />
                ) : (
                  <>
                    <Sparkles size={20} color="#0A0F1C" />
                    <Text style={styles.submitButtonText}>Phân tích & Tạo Mục Tiêu</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.successOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={48} color={COLORS.success || '#10B981'} />
              </View>
              <Text style={styles.successTitle}>Đã thêm thành công!</Text>
              <Text style={styles.successMessage}>
                Mục tiêu đã được thêm vào Vision Board của bạn.
              </Text>
              <View style={styles.successButtons}>
                <TouchableOpacity
                  style={styles.successButtonSecondary}
                  onPress={() => {
                    setShowSuccessModal(false);
                    handleClose();
                  }}
                >
                  <Text style={styles.successButtonSecondaryText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.successButtonPrimary} onPress={goToVisionBoard}>
                  <Text style={styles.successButtonPrimaryText}>Xem Vision Board</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase || '#0A0F1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  stepDotComplete: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  stepContent: {
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  // Area Grid
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  areaCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  areaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  areaLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Goal Input
  goalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  // Goal Suggestions
  suggestionsSection: {
    marginTop: SPACING.lg,
  },
  suggestionsLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionChipSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
  },
  suggestionChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  suggestionChipTextSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Options
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionChipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  optionChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  optionChipTextSelected: {
    color: '#0A0F1C',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Motivation Grid
  motivationGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  motivationCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  motivationCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  motivationEmoji: {
    fontSize: 20,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  motivationLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  motivationLabelSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  // Affirmations
  affirmationList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  affirmationItemSelected: {
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderColor: COLORS.gold,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  affirmationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  affirmationTextSelected: {
    color: COLORS.textPrimary,
  },
  customAffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customAffInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addAffButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAffButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: 34,
    backgroundColor: COLORS.bgBase || '#0A0F1C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
  },
  backButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    gap: SPACING.xs,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  nextButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  // Result View
  resultContainer: {
    paddingTop: SPACING.xl,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  analysisTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  analysisText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  widgetPreview: {
    marginBottom: SPACING.xl,
  },
  widgetPreviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  widgetPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  widgetPreviewIcon: {
    fontSize: 20,
  },
  widgetPreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipResultButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  skipResultText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  addVisionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    gap: SPACING.sm,
  },
  addVisionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
  // Success Modal - Dark theme with gold accents
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: COLORS.glassBg || '#1a1a2e',
    borderRadius: SPACING.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  successIconContainer: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  successButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  successButtonSecondary: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  successButtonSecondaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  successButtonPrimary: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  successButtonPrimaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A0F1C',
  },
});

export default GoalSettingForm;

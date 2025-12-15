/**
 * Gemral - Sound Picker Component
 * Feature #4-5: Browse & Select Sounds for Posts
 * Full-screen modal for selecting audio
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import {
  X,
  Search,
  Music,
  TrendingUp,
  Bookmark,
  Upload,
  Mic,
  Headphones,
  Zap,
  Coffee,
  Star,
  Smile,
  MessageSquare,
  Sparkles,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../utils/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import soundService from '../services/soundService';
import SoundCard from './SoundCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORY_ICONS = {
  trending: TrendingUp,
  pop: Music,
  edm: Zap,
  hiphop: Mic,
  chill: Coffee,
  lofi: Headphones,
  acoustic: Music,
  viet: Star,
  funny: Smile,
  meme: MessageSquare,
  original: Sparkles,
  other: MoreHorizontal,
};

const SoundPicker = ({
  visible,
  onClose,
  onSelect,
  currentSound = null,
}) => {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingSound, setPlayingSound] = useState(null);
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const soundRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const categories = soundService.getCategories();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
      loadSounds();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
      stopSound();
    }
  }, [visible]);

  useEffect(() => {
    loadSounds();
  }, [activeTab]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const loadSounds = async () => {
    setLoading(true);
    let data = [];

    if (activeTab === 'trending') {
      data = await soundService.getTrendingSounds(30);
    } else if (activeTab === 'saved') {
      data = await soundService.getSavedSounds();
    } else if (activeTab === 'my_sounds') {
      data = await soundService.getUserSounds();
    } else {
      data = await soundService.getSoundsByCategory(activeTab, 30);
    }

    setSounds(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSounds();
      return;
    }

    setLoading(true);
    const data = await soundService.searchSounds(searchQuery.trim());
    setSounds(data);
    setLoading(false);
  };

  const playSound = async (sound) => {
    try {
      // Stop current sound if playing
      await stopSound();

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: sound.audio_url },
        { shouldPlay: true }
      );

      soundRef.current = audioSound;
      setPlayingSound(sound);
      setPlayingSoundId(sound.id);

      // Handle playback finish
      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingSound(null);
          setPlayingSoundId(null);
        }
      });
    } catch (error) {
      console.error('[SoundPicker] Play error:', error);
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlayingSound(null);
    setPlayingSoundId(null);
  };

  const handleSelect = (sound) => {
    stopSound();
    onSelect?.(sound);
    handleClose();
  };

  const handleClose = () => {
    stopSound();
    onClose?.();
  };

  const renderCategoryTab = (category) => {
    const IconComponent = CATEGORY_ICONS[category.id] || Music;
    const isActive = activeTab === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryTab, isActive && styles.categoryTabActive]}
        onPress={() => setActiveTab(category.id)}
      >
        <IconComponent
          size={16}
          color={isActive ? COLORS.textPrimary : COLORS.textMuted}
        />
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSound = ({ item }) => (
    <SoundCard
      sound={item}
      isPlaying={playingSoundId === item.id}
      onPlay={playSound}
      onPause={stopSound}
      onSelect={handleSelect}
      showSaveButton={true}
      showUseCount={true}
    />
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.background}
            locations={GRADIENTS.backgroundLocations}
            style={StyleSheet.absoluteFill}
          />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chon am thanh</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tim kiem am thanh..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {/* Special tabs */}
              <TouchableOpacity
                style={[styles.categoryTab, activeTab === 'saved' && styles.categoryTabActive]}
                onPress={() => setActiveTab('saved')}
              >
                <Bookmark
                  size={16}
                  color={activeTab === 'saved' ? COLORS.textPrimary : COLORS.textMuted}
                />
                <Text style={[styles.categoryText, activeTab === 'saved' && styles.categoryTextActive]}>
                  Da luu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryTab, activeTab === 'my_sounds' && styles.categoryTabActive]}
                onPress={() => setActiveTab('my_sounds')}
              >
                <Upload
                  size={16}
                  color={activeTab === 'my_sounds' ? COLORS.textPrimary : COLORS.textMuted}
                />
                <Text style={[styles.categoryText, activeTab === 'my_sounds' && styles.categoryTextActive]}>
                  Cua toi
                </Text>
              </TouchableOpacity>

              {/* Category tabs */}
              {categories.map(renderCategoryTab)}
            </ScrollView>
          </View>

          {/* Sound List */}
          <FlatList
            data={sounds}
            keyExtractor={(item) => item.id}
            renderItem={renderSound}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Music size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>
                  {loading ? 'Dang tai...' : 'Khong tim thay am thanh'}
                </Text>
              </View>
            }
          />

          {/* Current Sound Info (if any) */}
          {currentSound && (
            <View style={styles.currentSoundBar}>
              <View style={styles.currentSoundInfo}>
                <Music size={16} color={COLORS.cyan} />
                <Text style={styles.currentSoundText} numberOfLines={1}>
                  {currentSound.title} - {currentSound.artist_name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeSoundButton}
                onPress={() => onSelect?.(null)}
              >
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    gap: SPACING.xs,
  },
  categoryTabActive: {
    backgroundColor: COLORS.purple,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  currentSoundBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentSoundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  currentSoundText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  removeSoundButton: {
    padding: SPACING.sm,
  },
});

export default SoundPicker;

/**
 * Gemral - Sound Library Screen
 * Feature #4-6: Browse Sounds, Upload Sound, Trending Algorithm
 * Full sound library browser
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { FORCE_REFRESH_EVENT } from '../../utils/loadingStateManager';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import {
  Search,
  Music,
  TrendingUp,
  Bookmark,
  Upload,
  Plus,
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
  ArrowLeft,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS, LAYOUT } from '../../utils/tokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import soundService from '../../services/soundService';
import SoundCard from '../../components/SoundCard';

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

const SoundLibraryScreen = ({ navigation }) => {
  const { alert, AlertComponent } = useCustomAlert();
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const soundRef = useRef(null);

  const categories = soundService.getCategories();

  useEffect(() => {
    loadSounds();
    return () => {
      stopSound();
    };
  }, [activeTab]);

  // Rule 31: Recovery listener for app resume
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(FORCE_REFRESH_EVENT, () => {
      console.log('[SoundLibrary] Force refresh received');
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => loadSounds(), 50); // Rule 57: Break React 18 batch
    });
    return () => listener.remove();
  }, []);

  const loadSounds = async () => {
    try {
      setLoading(true);
      let data = [];

      if (activeTab === 'trending') {
        data = await soundService.getTrendingSounds(50);
      } else if (activeTab === 'saved') {
        data = await soundService.getSavedSounds();
      } else if (activeTab === 'my_sounds') {
        data = await soundService.getUserSounds();
      } else {
        data = await soundService.getSoundsByCategory(activeTab, 50);
      }

      setSounds(data);
    } catch (error) {
      console.error('[SoundLibrary] Error loading sounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSounds();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSounds();
      return;
    }

    try {
      setLoading(true);
      const data = await soundService.searchSounds(searchQuery.trim());
      setSounds(data);
    } catch (error) {
      console.error('[SoundLibrary] Error searching sounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSound = async (sound) => {
    try {
      await stopSound();

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: sound.audio_url },
        { shouldPlay: true }
      );

      soundRef.current = audioSound;
      setPlayingSoundId(sound.id);

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingSoundId(null);
        }
      });
    } catch (error) {
      console.error('[SoundLibrary] Play error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể phát âm thanh',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlayingSoundId(null);
  };

  const handleUploadSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Navigate to upload screen with file info
      navigation.navigate('UploadSound', {
        audioUri: file.uri,
        audioName: file.name,
        audioSize: file.size,
      });
    } catch (error) {
      console.error('[SoundLibrary] Pick file error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể chọn file',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  const handleSoundPress = (sound) => {
    // Navigate to sound detail/posts using this sound
    navigation.navigate('SoundDetail', { soundId: sound.id, sound });
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
      onSelect={handleSoundPress}
      showSaveButton={true}
      showUseCount={true}
    />
  );

  const renderHeader = () => (
    <>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm âm thanh..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadSound}>
        <LinearGradient
          colors={GRADIENTS.primaryButton}
          style={styles.uploadButtonGradient}
        >
          <Upload size={18} color={COLORS.textPrimary} />
          <Text style={styles.uploadButtonText}>Tải lên âm thanh</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Category Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {/* Special tabs */}
          <TouchableOpacity
            style={[styles.categoryTab, activeTab === 'trending' && styles.categoryTabActive]}
            onPress={() => setActiveTab('trending')}
          >
            <TrendingUp
              size={16}
              color={activeTab === 'trending' ? COLORS.textPrimary : COLORS.textMuted}
            />
            <Text style={[styles.categoryText, activeTab === 'trending' && styles.categoryTextActive]}>
              Xu hướng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryTab, activeTab === 'saved' && styles.categoryTabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Bookmark
              size={16}
              color={activeTab === 'saved' ? COLORS.textPrimary : COLORS.textMuted}
            />
            <Text style={[styles.categoryText, activeTab === 'saved' && styles.categoryTextActive]}>
              Đã lưu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.categoryTab, activeTab === 'my_sounds' && styles.categoryTabActive]}
            onPress={() => setActiveTab('my_sounds')}
          >
            <Music
              size={16}
              color={activeTab === 'my_sounds' ? COLORS.textPrimary : COLORS.textMuted}
            />
            <Text style={[styles.categoryText, activeTab === 'my_sounds' && styles.categoryTextActive]}>
              Của tôi
            </Text>
          </TouchableOpacity>

          {/* Category tabs */}
          {categories.slice(1).map(renderCategoryTab)}
        </ScrollView>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeTab === 'trending' ? 'Đang thịnh hành' :
           activeTab === 'saved' ? 'Âm thanh đã lưu' :
           activeTab === 'my_sounds' ? 'Âm thanh của bạn' :
           categories.find(c => c.id === activeTab)?.label || 'Âm thanh'}
        </Text>
        <Text style={styles.sectionCount}>{sounds.length} âm thanh</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thư viện âm thanh</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Sound List */}
        <FlatList
          data={sounds}
          keyExtractor={(item) => item.id}
          renderItem={renderSound}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Music size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>
                {loading ? 'Đang tải...' :
                 activeTab === 'saved' ? 'Chưa có âm thanh đã lưu' :
                 activeTab === 'my_sounds' ? 'Chưa tải lên âm thanh nào' :
                 'Không tìm thấy âm thanh'}
              </Text>
              {activeTab === 'my_sounds' && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleUploadSound}
                >
                  <Plus size={16} color={COLORS.textPrimary} />
                  <Text style={styles.emptyButtonText}>Tải lên ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
        {AlertComponent}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
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
  uploadButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.md,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.lg,
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
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

export default SoundLibraryScreen;

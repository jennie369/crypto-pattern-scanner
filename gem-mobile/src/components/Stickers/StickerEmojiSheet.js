/**
 * GEM Mobile - Sticker & Emoji Sheet Component
 * Zalo/Telegram-style bottom sheet with tabs (Sticker | Emoji | GIF)
 *
 * Props:
 * @param {boolean} visible - Sheet visibility
 * @param {Function} onClose - Close handler
 * @param {Function} onSelect - Selection handler ({ type, stickerId?, giphyId?, url?, emoji? })
 * @param {string} context - 'chat' | 'forum' | 'reaction'
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Search,
  Sparkles,
  Smile,
  ImageIcon,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

// Sub-components
import StickerGrid from './StickerGrid';
import EmojiGrid from './EmojiGrid';
import GiphyGrid from './GiphyGrid';
import StickerPackSelector from './StickerPackSelector';
import RecentStickers from './RecentStickers';

// Services
import stickerService from '../../services/stickerService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { id: 'sticker', icon: Sparkles, label: 'STICKER' },
  { id: 'emoji', icon: Smile, label: 'EMOJI' },
  { id: 'gif', icon: ImageIcon, label: 'GIF' },
];

const StickerEmojiSheet = ({
  visible,
  onClose,
  onSelect,
  context = 'chat',
  defaultTab = 'sticker',
}) => {
  // State
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [packs, setPacks] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Refs
  const searchInputRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    if (visible) {
      loadData();
      setActiveTab(defaultTab); // Reset to default tab when opening
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset state
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [visible, defaultTab]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(keyboardShowEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideListener = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [packsData, recentData] = await Promise.all([
        stickerService.getPacks(),
        stickerService.getRecentItems(null, 20),
      ]);

      setPacks(packsData || []);
      setRecentItems(recentData || []);

      // Select first pack by default
      if (packsData?.length > 0 && !selectedPackId) {
        setSelectedPackId(packsData[0].id);
      }
    } catch (error) {
      console.error('[StickerEmojiSheet] loadData error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection
  const handleSelect = useCallback(async (item, type) => {
    // Track usage (async, don't wait)
    stickerService.trackUsage({
      stickerId: item.stickerId || item.id,
      giphyId: item.giphyId,
      giphyUrl: item.url,
      emoji: item.emoji,
      type,
    });

    // Callback with selected item
    onSelect?.({
      ...item,
      type,
    });

    // Close sheet
    onClose?.();
  }, [onSelect, onClose]);

  // Handle pack selection
  const handlePackSelect = useCallback((packId) => {
    if (packId === 'recent') {
      setSelectedPackId(null);
    } else {
      setSelectedPackId(packId);
    }
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  // Render tab content
  const renderTabContent = () => {
    // Show search results
    if (searchQuery && isSearching) {
      switch (activeTab) {
        case 'sticker':
          return (
            <StickerGrid
              searchQuery={searchQuery}
              onSelect={(sticker) => handleSelect(sticker, 'sticker')}
            />
          );
        case 'gif':
          return (
            <GiphyGrid
              searchQuery={searchQuery}
              onSelect={(gif) => handleSelect(gif, 'gif')}
            />
          );
        case 'emoji':
          return (
            <EmojiGrid
              searchQuery={searchQuery}
              onSelect={(emoji) => handleSelect({ emoji }, 'emoji')}
            />
          );
        default:
          return null;
      }
    }

    // Show normal content
    switch (activeTab) {
      case 'sticker':
        return (
          <View style={styles.tabContent}>
            {/* Recent Section */}
            {!selectedPackId && recentItems.filter(r => r.type === 'sticker').length > 0 && (
              <RecentStickers
                items={recentItems.filter(r => r.type === 'sticker')}
                onSelect={(sticker) => handleSelect(sticker, 'sticker')}
              />
            )}

            {/* Sticker Grid */}
            <StickerGrid
              packId={selectedPackId}
              onSelect={(sticker) => handleSelect(sticker, 'sticker')}
            />
          </View>
        );

      case 'emoji':
        return (
          <EmojiGrid
            recentEmojis={recentItems.filter(r => r.type === 'emoji').map(r => r.emoji)}
            onSelect={(emoji) => handleSelect({ emoji }, 'emoji')}
          />
        );

      case 'gif':
        return (
          <GiphyGrid
            recentGifs={recentItems.filter(r => r.type === 'gif')}
            onSelect={(gif) => handleSelect(gif, 'gif')}
          />
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
              marginBottom: keyboardHeight,
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />

              {/* Tab Buttons */}
              <View style={styles.tabBar}>
                {TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.tabButton,
                        isActive && styles.tabButtonActive,
                      ]}
                      onPress={() => handleTabChange(tab.id)}
                      activeOpacity={0.7}
                    >
                      <IconComponent
                        size={18}
                        color={isActive ? COLORS.gold : COLORS.textMuted}
                      />
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.tabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={18} color={COLORS.textMuted} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder={`Tim ${activeTab === 'sticker' ? 'sticker' : activeTab === 'emoji' ? 'emoji' : 'GIF'}...`}
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setIsSearching(text.length > 0);
                  }}
                  returnKeyType="search"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setIsSearching(false);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {renderTabContent()}
            </View>

            {/* Bottom Pack Selector (Sticker tab only) */}
            {activeTab === 'sticker' && !isSearching && (
              <StickerPackSelector
                packs={packs}
                selectedPackId={selectedPackId}
                onSelect={handlePackSelect}
                showRecent={recentItems.filter(r => r.type === 'sticker').length > 0}
              />
            )}
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: GLASS.borderRadius,
    borderTopRightRadius: GLASS.borderRadius,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: GLASS.background,
  },
  header: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    padding: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});

export default StickerEmojiSheet;

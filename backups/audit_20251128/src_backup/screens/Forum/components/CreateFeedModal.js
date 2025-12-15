/**
 * Gemral - Create Feed Modal
 * Threads-style custom feed creation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Search, Check } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const CreateFeedModal = ({ isOpen, onClose, onCreateFeed }) => {
  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Suggested topics for crypto/trading
  const suggestedTopics = [
    'Bitcoin', 'Ethereum', 'Altcoins', 'DeFi',
    'NFTs', 'Technical Analysis', 'Trading Signals',
    'Crypto News', 'Market Updates', 'Gem Picks',
  ];

  // Suggested profiles (example data)
  const suggestedProfiles = [
    { id: '1', name: 'Crypto Master', handle: '@cryptomaster', verified: true },
    { id: '2', name: 'Trading Pro', handle: '@tradingpro' },
    { id: '3', name: 'GEM Official', handle: '@gemofficial', verified: true },
  ];

  const handleCreate = () => {
    if (!feedName.trim()) {
      alert('Vui lòng nhập tên feed');
      return;
    }

    const newFeed = {
      id: Date.now().toString(),
      name: feedName,
      description: feedDescription,
      isPublic,
      topics: selectedTopics,
      profiles: selectedProfiles,
      createdAt: new Date().toISOString(),
    };

    onCreateFeed(newFeed);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFeedName('');
    setFeedDescription('');
    setIsPublic(false);
    setSelectedTopics([]);
    setSelectedProfiles([]);
    setSearchQuery('');
    onClose();
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const toggleProfile = (profile) => {
    setSelectedProfiles(prev =>
      prev.find(p => p.id === profile.id)
        ? prev.filter(p => p.id !== profile.id)
        : [...prev, profile]
    );
  };

  const filteredTopics = suggestedTopics.filter(topic =>
    topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Tạo Feed Mới</Text>

              <TouchableOpacity onPress={handleCreate} style={styles.headerBtn}>
                <Check size={24} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Feed Name & Description */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Tên Feed</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Crypto News, Trading Signals..."
                  placeholderTextColor={COLORS.textMuted}
                  value={feedName}
                  onChangeText={setFeedName}
                  maxLength={50}
                />

                <Text style={styles.inputLabel}>Mô Tả (Tùy chọn)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Mô tả ngắn về feed này..."
                  placeholderTextColor={COLORS.textMuted}
                  value={feedDescription}
                  onChangeText={setFeedDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>

              {/* Public Feed Toggle */}
              <View style={styles.toggleSection}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Feed Công Khai</Text>
                  <Text style={styles.toggleDescription}>
                    Khi bật, mọi người có thể xem và theo dõi feed này
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '#3e3e3e', true: COLORS.gold }}
                  thumbColor={isPublic ? COLORS.textPrimary : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* Search Topics/Profiles */}
              <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>Thêm Nội Dung</Text>
                <View style={styles.searchBox}>
                  <Search size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm chủ đề hoặc người dùng..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Selected Items */}
              {(selectedTopics.length > 0 || selectedProfiles.length > 0) && (
                <View style={styles.selectedSection}>
                  <Text style={styles.sectionTitle}>
                    Đã Chọn ({selectedTopics.length + selectedProfiles.length})
                  </Text>
                  <View style={styles.selectedGrid}>
                    {selectedTopics.map((topic, index) => (
                      <TouchableOpacity
                        key={`topic-${index}`}
                        style={styles.selectedChip}
                        onPress={() => toggleTopic(topic)}
                      >
                        <Text style={styles.selectedChipText}>{topic}</Text>
                        <X size={14} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                    ))}
                    {selectedProfiles.map((profile) => (
                      <TouchableOpacity
                        key={profile.id}
                        style={styles.selectedChip}
                        onPress={() => toggleProfile(profile)}
                      >
                        <Text style={styles.selectedChipText}>{profile.handle}</Text>
                        <X size={14} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Suggested Topics */}
              <View style={styles.suggestedSection}>
                <Text style={styles.sectionTitle}>Chủ Đề Gợi Ý</Text>
                <View style={styles.topicsGrid}>
                  {filteredTopics.map((topic, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.topicChip,
                        selectedTopics.includes(topic) && styles.topicChipActive,
                      ]}
                      onPress={() => toggleTopic(topic)}
                    >
                      <Text
                        style={[
                          styles.topicText,
                          selectedTopics.includes(topic) && styles.topicTextActive,
                        ]}
                      >
                        {topic}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Suggested Profiles */}
              <View style={styles.suggestedSection}>
                <Text style={styles.sectionTitle}>Người Dùng Gợi Ý</Text>
                {suggestedProfiles.map((profile) => {
                  const isSelected = selectedProfiles.find(p => p.id === profile.id);
                  return (
                    <View key={profile.id} style={styles.profileItem}>
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                          {profile.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                          {profile.name}
                          {profile.verified && ' ✓'}
                        </Text>
                        <Text style={styles.profileHandle}>{profile.handle}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          isSelected && styles.addButtonActive,
                        ]}
                        onPress={() => toggleProfile(profile)}
                      >
                        <Text style={[
                          styles.addButtonText,
                          isSelected && styles.addButtonTextActive,
                        ]}>
                          {isSelected ? 'Đã thêm' : 'Thêm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Bottom Padding */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Create Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !feedName.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!feedName.trim()}
              >
                <Text style={styles.createButtonText}>Tạo Feed</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 189, 89, 0.2)',
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
  },

  // Input Section
  inputSection: {
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Toggle Section
  toggleSection: {
    flexDirection: 'row',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  toggleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Search Section
  searchSection: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },

  // Selected Section
  selectedSection: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gold,
    borderRadius: 20,
  },
  selectedChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.bgDark,
  },

  // Suggested Section
  suggestedSection: {
    padding: SPACING.xl,
    paddingTop: 0,
  },

  // Topics Grid
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  topicChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topicChipActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
  },
  topicText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  topicTextActive: {
    color: COLORS.gold,
  },

  // Profile Item
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  profileHandle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  addButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 20,
  },
  addButtonActive: {
    backgroundColor: COLORS.gold,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },
  addButtonTextActive: {
    color: COLORS.bgDark,
  },

  // Bottom Section
  bottomSection: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  createButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDark,
  },
});

export default CreateFeedModal;

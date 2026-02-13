/**
 * Gemral - Media Gallery Screen
 * View all shared media in a conversation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SPACING = 2;
const NUM_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function MediaGalleryScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const insets = useSafeAreaInsets();

  // State
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('images'); // 'images', 'files'

  // Fetch media
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Fetch all messages with attachments
        const { messages } = await messagingService.getMessages(conversationId, null, 500);

        const media = messages
          .filter(m => m.attachment_url)
          .map(m => ({
            id: m.id,
            url: m.attachment_url,
            type: m.message_type,
            name: m.attachment_name,
            date: m.created_at,
          }));

        setMediaItems(media);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [conversationId]);

  // Filter by type
  const filteredItems = mediaItems.filter(item => {
    if (activeTab === 'images') {
      return item.type === 'image';
    } else {
      return item.type === 'file';
    }
  });

  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return (
        <TouchableOpacity style={styles.imageItem}>
          <Image source={{ uri: item.url }} style={styles.image} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.fileItem}>
        <View style={styles.fileIcon}>
          <Ionicons name="document" size={24} color={COLORS.gold} />
        </View>
        <Text style={styles.fileName} numberOfLines={2}>
          {item.name || 'File'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === 'images' ? 'images-outline' : 'document-outline'}
        size={48}
        color={COLORS.textMuted}
      />
      <Text style={styles.emptyTitle}>
        No {activeTab === 'images' ? 'photos' : 'files'} yet
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'images'
          ? 'Photos shared in this conversation will appear here'
          : 'Files shared in this conversation will appear here'}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Media & Files</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'images' && styles.tabActive]}
          onPress={() => setActiveTab('images')}
        >
          <Ionicons
            name="images"
            size={20}
            color={activeTab === 'images' ? COLORS.gold : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'images' && styles.tabTextActive]}>
            Photos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'files' && styles.tabActive]}
          onPress={() => setActiveTab('files')}
        >
          <Ionicons
            name="document"
            size={20}
            color={activeTab === 'files' ? COLORS.gold : COLORS.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'files' && styles.tabTextActive]}>
            Files
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={activeTab === 'images' ? NUM_COLUMNS : 1}
          key={activeTab} // Force re-render when changing columns
          contentContainerStyle={[
            styles.listContent,
            filteredItems.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // List
  listContent: {
    padding: GRID_SPACING,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Image Item
  imageItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: GRID_SPACING / 2,
    backgroundColor: COLORS.glassBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // File Item
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  fileName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

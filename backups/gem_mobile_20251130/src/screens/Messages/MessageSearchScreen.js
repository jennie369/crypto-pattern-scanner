/**
 * Gemral - Message Search Screen
 * Search messages within conversations
 *
 * Features:
 * - Search across all conversations
 * - Search within specific conversation
 * - Highlight matching text
 * - Jump to message in context
 * - Recent searches
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services
import messagingService from '../../services/messagingService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function MessageSearchScreen({ route, navigation }) {
  const { conversationId, conversationName } = route.params || {};
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Refs
  const searchTimeout = useRef(null);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      try {
        setSearching(true);
        const searchResults = await messagingService.searchMessages(query, conversationId);
        setResults(searchResults);
        setHasSearched(true);
      } catch (error) {
        console.error('Error searching messages:', error);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [conversationId]);

  // Navigate to message in conversation
  const handleResultPress = useCallback((message) => {
    navigation.navigate('Chat', {
      conversationId: message.conversation_id,
      highlightMessageId: message.id,
    });
  }, [navigation]);

  // =====================================================
  // RENDER
  // =====================================================

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === query.toLowerCase();
      return (
        <Text
          key={index}
          style={isMatch ? styles.highlight : undefined}
        >
          {part}
        </Text>
      );
    });
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderResultItem = ({ item }) => {
    const sender = item.users;
    const isOwn = item.sender_id === user?.id;
    const conversation = item.conversations;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleResultPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {sender?.avatar_url ? (
            <Image source={{ uri: sender.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>
                {getInitials(sender?.display_name)}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View style={styles.resultContent}>
          {/* Header row */}
          <View style={styles.resultHeader}>
            <Text style={styles.senderName}>
              {isOwn ? 'You' : sender?.display_name || 'Unknown'}
            </Text>
            <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
          </View>

          {/* Message preview with highlight */}
          <Text style={styles.messagePreview} numberOfLines={2}>
            {highlightText(item.content, searchQuery)}
          </Text>

          {/* Conversation name (if searching all) */}
          {!conversationId && conversation && (
            <View style={styles.conversationBadge}>
              <Ionicons name="chatbubble" size={12} color={COLORS.textMuted} />
              <Text style={styles.conversationName}>
                {conversation.name || 'Direct Message'}
              </Text>
            </View>
          )}
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Search Messages</Text>
          <Text style={styles.emptySubtitle}>
            {conversationId
              ? `Search messages in ${conversationName || 'this conversation'}`
              : 'Search across all your conversations'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>No Results</Text>
        <Text style={styles.emptySubtitle}>
          No messages found matching "{searchQuery}"
        </Text>
      </View>
    );
  };

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

        <Text style={styles.title}>Search</Text>

        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={20} style={styles.searchBlur}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searching && (
            <ActivityIndicator size="small" color={COLORS.gold} />
          )}
          {searchQuery && !searching && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {/* Scope indicator */}
      {conversationId && (
        <View style={styles.scopeIndicator}>
          <Ionicons name="funnel" size={14} color={COLORS.purple} />
          <Text style={styles.scopeText}>
            Searching in: {conversationName || 'this conversation'}
          </Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 44,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },

  // Scope Indicator
  scopeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    gap: SPACING.xs,
  },
  scopeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
  },

  // List
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Result Item
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  resultContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxs,
  },
  senderName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  messagePreview: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  highlight: {
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  conversationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xxs,
  },
  conversationName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
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

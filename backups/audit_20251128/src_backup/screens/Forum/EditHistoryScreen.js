/**
 * Gemral - Edit History Screen
 * Feature #18: View complete edit history of posts/comments
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  FileEdit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, GLASS } from '../../utils/tokens';
import { editHistoryService } from '../../services/editHistoryService';

const EditHistoryScreen = ({ navigation, route }) => {
  const { type, itemId, currentTitle, currentContent } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      let data;
      if (type === 'post') {
        data = await editHistoryService.getPostEditHistory(itemId);
      } else {
        data = await editHistoryService.getCommentEditHistory(itemId);
      }

      // Add current version at the top
      const currentVersion = {
        id: 'current',
        isCurrent: true,
        title: currentTitle,
        content: currentContent,
        edited_at: new Date().toISOString(),
        editor: null,
      };

      setHistory([currentVersion, ...data]);
    } catch (error) {
      console.error('[EditHistory] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAvatarUrl = (editor) => {
    if (editor?.avatar_url) return editor.avatar_url;
    const name = editor?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A5BFF&color=fff`;
  };

  const renderHistoryItem = ({ item, index }) => {
    const isExpanded = expandedId === item.id;
    const previousVersion = history[index + 1];

    return (
      <View style={styles.historyItem}>
        {/* Timeline Line */}
        <View style={styles.timelineContainer}>
          <View
            style={[
              styles.timelineDot,
              item.isCurrent && styles.timelineDotCurrent,
            ]}
          />
          {index < history.length - 1 && <View style={styles.timelineLine} />}
        </View>

        {/* Content */}
        <View style={styles.historyContent}>
          {/* Header */}
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.historyHeaderLeft}>
              {item.isCurrent ? (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Hien tai</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: getAvatarUrl(item.editor) }}
                  style={styles.editorAvatar}
                />
              )}

              <View style={styles.headerInfo}>
                {item.isCurrent ? (
                  <Text style={styles.versionLabel}>Phien ban hien tai</Text>
                ) : (
                  <Text style={styles.editorName}>
                    {item.editor?.full_name || 'Nguoi dung'}
                  </Text>
                )}
                <View style={styles.timeRow}>
                  <Clock size={12} color={COLORS.textMuted} />
                  <Text style={styles.editTime}>
                    {editHistoryService.formatEditTime(item.edited_at)}
                  </Text>
                </View>
              </View>
            </View>

            {isExpanded ? (
              <ChevronUp size={20} color={COLORS.textMuted} />
            ) : (
              <ChevronDown size={20} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Title (for posts) */}
              {type === 'post' && item.title && (
                <View style={styles.contentSection}>
                  <Text style={styles.contentLabel}>Tieu de:</Text>
                  <Text style={styles.contentTitle}>{item.title}</Text>
                </View>
              )}

              {/* Content */}
              <View style={styles.contentSection}>
                <Text style={styles.contentLabel}>Noi dung:</Text>
                <Text style={styles.contentText}>{item.content}</Text>
              </View>

              {/* Show diff with previous version */}
              {previousVersion && !item.isCurrent && (
                <View style={styles.diffSection}>
                  <Text style={styles.diffLabel}>Thay doi tu phien ban truoc:</Text>
                  <DiffView
                    oldContent={previousVersion.content}
                    newContent={item.content}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FileEdit size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Chua co lich su chinh sua</Text>
      <Text style={styles.emptyText}>
        Noi dung nay chua duoc chinh sua lan nao
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lich su chinh sua</Text>
          <View style={styles.headerRight}>
            <Text style={styles.editCount}>
              {history.length > 1 ? `${history.length - 1} lan sua` : ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.purple} />
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

/**
 * Diff View Component - Shows changes between versions
 */
const DiffView = ({ oldContent, newContent }) => {
  const diff = editHistoryService.compareDiff(oldContent, newContent);

  if (diff.added.length === 0 && diff.removed.length === 0) {
    return (
      <Text style={styles.noDiff}>Khong co thay doi dang ke</Text>
    );
  }

  return (
    <View style={styles.diffContainer}>
      {diff.removed.length > 0 && (
        <View style={styles.diffRow}>
          <Text style={styles.diffRemoved}>
            - {diff.removed.map(r => r.word).join(' ')}
          </Text>
        </View>
      )}
      {diff.added.length > 0 && (
        <View style={styles.diffRow}>
          <Text style={styles.diffAdded}>
            + {diff.added.map(a => a.word).join(' ')}
          </Text>
        </View>
      )}
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  editCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // List
  listContent: {
    padding: SPACING.md,
  },
  // History Item
  historyItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  timelineContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.textMuted,
    borderWidth: 2,
    borderColor: GLASS.background,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  historyContent: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  currentBadge: {
    backgroundColor: COLORS.purple,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  editorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg,
  },
  headerInfo: {
    gap: 2,
  },
  versionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  editorName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Expanded Content
  expandedContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentSection: {
    marginTop: SPACING.md,
  },
  contentLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  contentTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  contentText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Diff
  diffSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  diffLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  diffContainer: {
    gap: SPACING.xs,
  },
  diffRow: {
    paddingVertical: 2,
  },
  diffRemoved: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontFamily: 'monospace',
  },
  diffAdded: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontFamily: 'monospace',
  },
  noDiff: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default EditHistoryScreen;

/**
 * Gemral - Media Library Modal Component
 * Thu vien hinh anh chung cho tat ca lessons
 * Supports: search, pagination, select
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  X,
  Search,
  RefreshCw,
  Check,
  Inbox,
  ImageIcon,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';
import courseImageService from '../../services/courseImageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / NUM_COLUMNS;

const MediaLibraryModal = ({
  visible,
  onClose,
  onSelectImage,
  currentLessonImages = [],
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [addingImage, setAddingImage] = useState(false);

  // Debounce search
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load images when modal opens or search changes
  useEffect(() => {
    if (visible) {
      loadImages();
    }
  }, [visible, debouncedQuery]);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (debouncedQuery.trim()) {
        data = await courseImageService.search(debouncedQuery);
      } else {
        data = await courseImageService.getAll(100);
      }
      setImages(data || []);
    } catch (error) {
      console.error('[MediaLibraryModal] Load error:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadImages();
    setRefreshing(false);
  }, [loadImages]);

  // Check if image already exists in current lesson
  const isImageInLesson = useCallback(
    (image) => {
      return (currentLessonImages || []).some(
        (img) => img.image_url === image.image_url
      );
    },
    [currentLessonImages]
  );

  // Handle image selection
  const handleSelect = useCallback(
    async (image) => {
      if (selectedImage?.id === image.id) {
        // Already selected, confirm add
        setAddingImage(true);
        try {
          await onSelectImage?.(image);
          setSelectedImage(null);
          onClose?.();
        } catch (error) {
          console.error('[MediaLibraryModal] Add error:', error);
        } finally {
          setAddingImage(false);
        }
      } else {
        // First tap - select
        setSelectedImage(image);
      }
    },
    [selectedImage, onSelectImage, onClose]
  );

  // Render grid item
  const renderItem = useCallback(
    ({ item }) => {
      const isSelected = selectedImage?.id === item.id;
      const alreadyAdded = isImageInLesson(item);

      return (
        <TouchableOpacity
          style={[
            styles.gridItem,
            isSelected && styles.gridItemSelected,
            alreadyAdded && styles.gridItemAdded,
          ]}
          onPress={() => handleSelect(item)}
          disabled={addingImage}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.gridImage}
            resizeMode="cover"
          />

          {/* Selected overlay */}
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkCircle}>
                <Check size={20} color="#000" />
              </View>
              <Text style={styles.tapAgainText}>Nhan lan nua de them</Text>
            </View>
          )}

          {/* Already added badge */}
          {alreadyAdded && !isSelected && (
            <View style={styles.addedBadge}>
              <Check size={12} color="#000" />
            </View>
          )}

          {/* Position ID */}
          <View style={styles.positionBadge}>
            <Text style={styles.positionText} numberOfLines={1}>
              {item.position_id || 'no-id'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedImage, isImageInLesson, handleSelect, addingImage]
  );

  // Empty state
  const renderEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Inbox size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Khong tim thay hinh anh' : 'Thu vien trong'}
        </Text>
        <Text style={styles.emptyHint}>
          {searchQuery
            ? 'Thu tu khoa khac'
            : 'Upload hinh trong cac bai hoc de hien thi o day'}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  // Header
  const renderHeader = useMemo(
    () => (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tim theo ten file hoac position_id..."
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearch}
              onPress={() => setSearchQuery('')}
            >
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <RefreshCw size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    ),
    [searchQuery, handleRefresh]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <ImageIcon size={24} color={COLORS.gold} />
              <Text style={styles.title}>Thu vien hinh anh</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          {renderHeader}

          {/* Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
              <Text style={styles.loadingText}>Dang tai...</Text>
            </View>
          ) : (
            <FlatList
              data={images}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.gridContainer}
              ListEmptyComponent={renderEmpty}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.gold}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {images.length} hinh anh trong thu vien
            </Text>
            {selectedImage && (
              <TouchableOpacity
                style={[styles.addBtn, addingImage && styles.addBtnDisabled]}
                onPress={() => handleSelect(selectedImage)}
                disabled={addingImage}
              >
                {addingImage ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Check size={18} color="#000" />
                    <Text style={styles.addBtnText}>Them vao bai hoc</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: GRADIENTS.background[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  searchIcon: {
    marginLeft: SPACING.md,
  },
  searchInput: {
    flex: 1,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  clearSearch: {
    padding: SPACING.md,
  },
  refreshBtn: {
    padding: SPACING.sm,
    backgroundColor: GLASS.background,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  gridContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING.xs,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
  },
  gridItemSelected: {
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  gridItemAdded: {
    opacity: 0.6,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 189, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapAgainText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  addedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
  },
  positionText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.fontSize.xs,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl * 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  addBtnDisabled: {
    opacity: 0.7,
  },
  addBtnText: {
    color: '#000',
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default MediaLibraryModal;

/**
 * Gemral - Create Post Screen
 * Modal screen for creating new forum posts
 * WITH MEDIA UPLOAD, IMAGE CROP/EDIT SUPPORT
 * ADMIN-ONLY TOPICS SUPPORT
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronDown, Check, ImagePlus, Trash2, Crop, RotateCw, Plus, Music, Users, ShoppingBag, Globe, Lock, UserCheck, RefreshCw } from 'lucide-react-native';
import alertService from '../../services/alertService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { forumService } from '../../services/forumService';
import { hashtagService } from '../../services/hashtagService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

// Feature modals for sound and product selection
import SoundPicker from '../../components/SoundPicker';
import ProductPicker from '../../components/ProductPicker';
import MentionInput from '../../components/MentionInput';
// NOTE: AudiencePicker modal removed - using inline dropdown instead

// Link Preview Component (Phase 4)
import CreatePostLinkPreview from './components/CreatePostLinkPreview';

// C13 FIX: Use design tokens instead of hardcoded hex colors
// Main topic selections - CHỈ 3 TOPIC CHÍNH cho user thường
const MAIN_TOPICS = [
  { id: 'giao-dich', name: 'GIAO DỊCH', color: COLORS.cyan, icon: '🎯' },
  { id: 'tinh-than', name: 'TINH THẦN', color: COLORS.purple, icon: '☯️' },
  { id: 'thinh-vuong', name: 'THỊNH VƯỢNG', color: COLORS.gold, icon: '🌟' },
];

// Admin-only topics
const ADMIN_TOPICS = [
  { id: 'affiliate', name: 'AFFILIATE', color: COLORS.error, icon: '💰', feedType: 'affiliate' },
  { id: 'tin-tuc', name: 'TIN TỨC', color: '#4ECDC4', icon: '📰', feedType: 'news' },
  { id: 'thong-bao', name: 'THÔNG BÁO', color: '#FFE66D', icon: '📢', feedType: 'announcement' },
  { id: 'academy', name: 'ACADEMY', color: '#A855F7', icon: '🎓', feedType: 'academy' },
];

// Image Editor Modal Component
const ImageEditorModal = ({ visible, imageUri, onSave, onCancel }) => {
  const [editing, setEditing] = useState(false);
  const [currentUri, setCurrentUri] = useState(imageUri);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentUri(imageUri);
    setRotation(0);
  }, [imageUri]);

  const handleRotate = async () => {
    if (!currentUri) return;
    setEditing(true);
    try {
      const newRotation = (rotation + 90) % 360;
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ rotate: 90 }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(result.uri);
      setRotation(newRotation);
    } catch (error) {
      console.error('[ImageEditor] Rotate error:', error);
    } finally {
      setEditing(false);
    }
  };

  const handleCrop = async () => {
    if (!currentUri) return;
    setEditing(true);
    try {
      // Crop to 16:9 aspect ratio from center
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width: 1280, height: 720 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setCurrentUri(result.uri);
    } catch (error) {
      console.error('[ImageEditor] Crop error:', error);
    } finally {
      setEditing(false);
    }
  };

  const handleSave = () => {
    onSave(currentUri);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.editorGradient}
      >
        <SafeAreaView style={styles.editorContainer} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={onCancel} style={styles.editorHeaderBtn}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Chỉnh sửa ảnh</Text>
            <TouchableOpacity onPress={handleSave} style={styles.editorSaveBtn}>
              <Text style={styles.editorSaveText}>Xong</Text>
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <View style={styles.editorImageContainer}>
            {currentUri ? (
              <Image source={{ uri: currentUri }} style={styles.editorImage} resizeMode="contain" />
            ) : null}
            {editing && (
              <View style={styles.editorOverlay}>
                <ActivityIndicator size="large" color={COLORS.gold} />
              </View>
            )}
          </View>

          {/* Edit Tools */}
          <View style={styles.editorTools}>
            <TouchableOpacity style={styles.editorToolBtn} onPress={handleRotate} disabled={editing}>
              <RotateCw size={28} color={COLORS.textPrimary} />
              <Text style={styles.editorToolText}>Xoay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editorToolBtn} onPress={handleCrop} disabled={editing}>
              <Crop size={28} color={COLORS.textPrimary} />
              <Text style={styles.editorToolText}>Cắt 16:9</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const CreatePostScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Media state - NOW SUPPORTS MULTIPLE IMAGES
  const [selectedImages, setSelectedImages] = useState([]); // Array of URIs
  const [uploading, setUploading] = useState(false);
  const MAX_IMAGES = 10;

  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageUri, setTempImageUri] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(-1);

  // Sound attachment state
  const [selectedSound, setSelectedSound] = useState(null);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Audience/visibility state
  const [audience, setAudience] = useState('public'); // 'public', 'followers', 'private'
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);

  // Product attachment state - NOW SUPPORTS MULTIPLE PRODUCTS
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Image aspect ratio state for full-size display
  const [imageAspectRatios, setImageAspectRatios] = useState({});

  // Mention trigger state - for external trigger from Tag People button
  const [triggerMention, setTriggerMention] = useState(false);

  // ========== LINK PREVIEW STATE (Phase 4) ==========
  const [linkPreviewData, setLinkPreviewData] = useState(null);

  /**
   * Handle link preview change
   * Callback từ CreatePostLinkPreview component
   */
  const handlePreviewChange = useCallback((previewData) => {
    setLinkPreviewData(previewData);
    console.log('[CreatePost] Link preview updated:', previewData?.url || 'null');
  }, []);

  // Calculate aspect ratio when images change
  useEffect(() => {
    selectedImages.forEach((uri, index) => {
      if (!imageAspectRatios[uri]) {
        Image.getSize(
          uri,
          (width, height) => {
            setImageAspectRatios(prev => ({
              ...prev,
              [uri]: width / height
            }));
          },
          (error) => {
            console.log('[CreatePost] Could not get image size:', error);
          }
        );
      }
    });
  }, [selectedImages]);

  // isAdmin is now from AuthContext - uses profile role/tier check

  // Get available topics based on user role
  const getAvailableTopics = () => {
    if (isAdmin) {
      return [...MAIN_TOPICS, ...ADMIN_TOPICS];
    }
    return MAIN_TOPICS;
  };

  // Request permission and pick images (multi-select)
  const handlePickImage = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        alert({
          type: 'warning',
          title: 'Giới hạn',
          message: `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`,
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert({
          type: 'warning',
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập thư viện ảnh để tải ảnh lên',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      const remainingSlots = MAX_IMAGES - selectedImages.length;

      let result;
      try {
        // Disable multi-select on Android due to ActivityResultLauncher bug
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: Platform.OS === 'ios' ? true : false,
          selectionLimit: remainingSlots,
          quality: 0.9,
        });
      } catch (multiSelectError) {
        console.warn('[CreatePost] Multi-select failed, falling back to single select:', multiSelectError.message);
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 0.9,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add selected images to array
        const newUris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newUris].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      console.error('[CreatePost] Pick image error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Vui lòng thử lại.',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        alert({
          type: 'warning',
          title: 'Giới hạn',
          message: `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`,
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert({
          type: 'warning',
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập camera để chụp ảnh',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add photo to array
        setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      console.error('[CreatePost] Take photo error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể chụp ảnh. Vui lòng thử lại.',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Handle image editor save
  const handleImageEditorSave = (editedUri) => {
    if (editingImageIndex >= 0) {
      // Editing existing image
      setSelectedImages(prev => {
        const newImages = [...prev];
        newImages[editingImageIndex] = editedUri;
        return newImages;
      });
    }
    setShowImageEditor(false);
    setTempImageUri(null);
    setEditingImageIndex(-1);
  };

  // Handle image editor cancel
  const handleImageEditorCancel = () => {
    setShowImageEditor(false);
    setTempImageUri(null);
    setEditingImageIndex(-1);
  };

  // Edit existing image at index
  const handleEditImage = (index) => {
    if (selectedImages[index]) {
      setTempImageUri(selectedImages[index]);
      setEditingImageIndex(index);
      setShowImageEditor(true);
    }
  };

  // Remove image at index
  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Show media options - use native Alert for reliability
  const showMediaOptions = () => {
    const { Alert } = require('react-native');
    const title = selectedImages.length > 0 ? 'Thêm ảnh khác' : 'Thêm ảnh';
    Alert.alert(
      title,
      'Chọn nguồn ảnh',
      [
        { text: 'Thư viện ảnh', onPress: handlePickImage },
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  // Handle Tag People - trigger @ mention dropdown
  const handleTagPeople = () => {
    setTriggerMention(true);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert({
        type: 'warning',
        title: 'Lỗi',
        message: 'Vui lòng nhập nội dung bài viết',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      let mediaUrls = [];

      // Upload multiple images if selected
      if (selectedImages.length > 0) {
        setUploading(true);
        console.log('[CreatePost] Uploading images:', selectedImages.length);

        const uploadResult = await forumService.uploadMultipleImages(selectedImages);
        console.log('[CreatePost] Upload result:', uploadResult);

        if (uploadResult.success && uploadResult.urls.length > 0) {
          mediaUrls = uploadResult.urls;
          imageUrl = uploadResult.urls[0]; // First image as cover
        } else {
          console.error('[CreatePost] Upload failed:', uploadResult.errors);
          alert({
            type: 'warning',
            title: 'Lỗi',
            message: 'Không thể tải ảnh lên. Bài viết sẽ được đăng không có ảnh.',
            buttons: [{ text: 'OK' }],
          });
        }
        setUploading(false);
      }

      // Extract title from first line of content (if any)
      const lines = content.trim().split('\n');
      const title = lines[0].substring(0, 100); // First line as title, max 100 chars
      const body = lines.length > 1 ? lines.slice(1).join('\n').trim() : lines[0];

      // Determine feed_type based on selected topic
      let feedType = 'general';
      if (selectedTopic?.feedType) {
        feedType = selectedTopic.feedType;
      }

      // Extract hashtags from title and content
      const combinedText = `${title} ${body || title}`;
      const hashtags = hashtagService.extractHashtags(combinedText);

      // Prepare link preview data for database
      const linkPreviewForDb = linkPreviewData ? {
        url: linkPreviewData.url,
        domain: linkPreviewData.domain,
        title: linkPreviewData.title,
        description: linkPreviewData.description,
        image_url: linkPreviewData.image_url || linkPreviewData.image,
        favicon_url: linkPreviewData.favicon_url || linkPreviewData.favicon,
        site_name: linkPreviewData.site_name || linkPreviewData.siteName,
        og_type: linkPreviewData.og_type || linkPreviewData.type,
        is_video: linkPreviewData.is_video || linkPreviewData.isVideo || false,
      } : null;

      console.log('[CreatePost] Link preview for DB:', linkPreviewForDb ? linkPreviewForDb.url : 'null');

      const { data, error } = await forumService.createPost({
        title: title,
        content: body || title, // If only one line, use it as both title and content
        topic: selectedTopic?.id || null,
        image_url: imageUrl, // Cover image (first one)
        media_urls: mediaUrls, // JSONB array of all images
        hashtags: hashtags, // Extracted hashtags array
        feed_type: feedType,
        visibility: audience, // Save audience setting: 'public', 'followers', 'private'
        sound_id: selectedSound?.id || null, // Save attached sound
        // ========== LINK PREVIEW (Phase 4) ==========
        link_preview: linkPreviewForDb,
        extracted_urls: linkPreviewForDb?.url ? [linkPreviewForDb.url] : [],
      });

      if (error) {
        console.error('[CreatePost] Create error:', error);
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể tạo bài viết. Vui lòng thử lại.',
          buttons: [{ text: 'OK' }],
        });
      } else {
        // Insert linked products into post_products table
        if (data?.id && linkedProducts.length > 0) {
          console.log('[CreatePost] Linking products to post:', linkedProducts.length);
          try {
            await forumService.linkProductsToPost(data.id, linkedProducts);
            console.log('[CreatePost] Products linked successfully');
          } catch (linkError) {
            console.error('[CreatePost] Failed to link products:', linkError);
            // Don't block post creation if product linking fails
          }
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error('[CreatePost] Submit error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Get display text for selected topic
  const getTopicDisplayText = () => {
    if (selectedTopic) {
      return `${selectedTopic.icon} ${selectedTopic.name}`;
    }
    return 'Chọn chủ đề';
  };

  const canSubmit = content.trim() && !submitting;

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Topic Selector - CHỈ HIỂN THỊ CHO ADMIN */}
            {isAdmin && (
              <>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowTopicPicker(!showTopicPicker)}
                >
                  <Text style={styles.categorySelectorLabel}>CHỦ ĐỀ (ADMIN)</Text>
                  <View style={styles.categorySelectorValue}>
                    <Text style={[
                      styles.categorySelectorText,
                      selectedTopic && { color: selectedTopic.color }
                    ]}>
                      {getTopicDisplayText()}
                    </Text>
                    <ChevronDown size={20} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>

                {/* Topic Picker */}
                {showTopicPicker && (
                  <View style={styles.categoryPicker}>
                    {/* No selection option */}
                    <TouchableOpacity
                      style={styles.categoryOption}
                      onPress={() => {
                        setSelectedTopic(null);
                        setShowTopicPicker(false);
                      }}
                    >
                      <Text style={styles.categoryOptionText}>Không chọn</Text>
                      {!selectedTopic && <Check size={18} color={COLORS.gold} />}
                    </TouchableOpacity>

                    {/* Available Topics */}
                    {getAvailableTopics().map((topic, index) => (
                      <TouchableOpacity
                        key={`topic-${index}-${topic.id}`}
                        style={[
                          styles.mainTopicOption,
                          selectedTopic?.id === topic.id && styles.mainTopicOptionActive,
                          topic.feedType && styles.adminTopicOption,
                        ]}
                        onPress={() => {
                          setSelectedTopic(topic);
                          setShowTopicPicker(false);
                        }}
                      >
                        <View style={[styles.categoryDot, { backgroundColor: topic.color }]} />
                        <Text style={[
                          styles.mainTopicText,
                          selectedTopic?.id === topic.id && styles.mainTopicTextActive
                        ]}>
                          {topic.icon} {topic.name}
                        </Text>
                        {topic.feedType && (
                          <Text style={styles.adminBadge}>ADMIN</Text>
                        )}
                        {selectedTopic?.id === topic.id && (
                          <Check size={18} color={COLORS.gold} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* SEAMLESS CONTENT INPUT - Facebook-style     */}
            {/* No card, no border, full-width writing area */}
            {/* ═══════════════════════════════════════════ */}
            <MentionInput
              style={styles.contentInput}
              placeholder="Dòng đầu tiên sẽ là tiêu đề...&#10;&#10;Viết nội dung bài viết của bạn...&#10;&#10;Dùng @ để tag người dùng, # để thêm hashtag"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={12}
              triggerMention={triggerMention}
              onTriggerMentionHandled={() => setTriggerMention(false)}
              autoFocus
            />
            <Text style={styles.hint}>Dòng đầu tiên = tiêu đề. Dùng @ để tag, # cho hashtag</Text>

            {/* ═══════════════════════════════════════════ */}
            {/* LINK PREVIEW SECTION (Phase 4) */}
            {/* ═══════════════════════════════════════════ */}
            <CreatePostLinkPreview
              content={content}
              onPreviewChange={handlePreviewChange}
              disabled={submitting}
            />

            {/* ═══════════════════════════════════════════ */}
            {/* MEDIA SECTION - FULL ASPECT RATIO PREVIEW */}
            {/* ═══════════════════════════════════════════ */}
            {selectedImages.length > 0 && (
              <View style={styles.mediaPreviewSection}>
                {selectedImages.map((uri, index) => {
                  const aspectRatio = imageAspectRatios[uri] || 1;
                  const imageHeight = Math.min((SCREEN_WIDTH - SPACING.lg * 2) / aspectRatio, SCREEN_WIDTH * 1.2);

                  return (
                    <View key={`img-${index}`} style={styles.mediaPreviewItem}>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleEditImage(index)}
                      >
                        <Image
                          source={{ uri }}
                          style={[styles.mediaPreviewFull, { height: imageHeight }]}
                          resizeMode="cover"
                        />
                        <View style={styles.tapHintOverlay}>
                          <Crop size={20} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.tapHintText}>Nhấn để chỉnh sửa</Text>
                        </View>
                      </TouchableOpacity>
                      {index === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>BÌA</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.mediaDeleteBtn}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Trash2 size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.gold} />
                    <Text style={styles.uploadingText}>Đang tải lên...</Text>
                  </View>
                )}
              </View>
            )}

            {/* Selected Sound Display */}
            {selectedSound && (
              <View style={styles.selectedSoundCard}>
                <Music size={18} color={COLORS.gold} />
                <View style={styles.selectedSoundInfo}>
                  <Text style={styles.selectedSoundName}>{selectedSound.name}</Text>
                  <Text style={styles.selectedSoundArtist}>{selectedSound.artist || 'Unknown'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedSound(null)}
                  style={styles.removeSoundBtn}
                >
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            {/* Linked Products Display - MULTI-SELECT */}
            {linkedProducts.length > 0 && (
              <View style={styles.linkedProductsContainer}>
                <Text style={styles.linkedProductsTitle}>Sản phẩm đã gắn ({linkedProducts.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.linkedProductsScroll}>
                  {linkedProducts.map((product, index) => (
                    <View key={product.id || index} style={styles.linkedProductCard}>
                      {product.image && (
                        <Image source={{ uri: product.image }} style={styles.linkedProductImage} />
                      )}
                      <View style={styles.linkedProductInfo}>
                        <Text style={styles.linkedProductName} numberOfLines={1}>{product.title}</Text>
                        <Text style={styles.linkedProductPrice}>{product.price}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setLinkedProducts(prev => prev.filter((_, i) => i !== index))}
                        style={styles.removeProductBtn}
                      >
                        <X size={14} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* ACTIONS SECTION - Below content, like FB    */}
            {/* ═══════════════════════════════════════════ */}
            <View style={styles.actionsDivider} />

            {/* Row 1: Photo + Tag People */}
            <TouchableOpacity style={styles.actionRow} onPress={showMediaOptions}>
              <ImagePlus size={22} color={COLORS.success} />
              <Text style={styles.actionRowText}>
                {selectedImages.length > 0 ? `Ảnh (${selectedImages.length}/${MAX_IMAGES})` : 'Ảnh / Video'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleTagPeople}>
              <Users size={22} color={COLORS.cyan} />
              <Text style={styles.actionRowText}>Gắn thẻ người dùng</Text>
            </TouchableOpacity>

            {/* Row 2: Sound */}
            <TouchableOpacity style={styles.actionRow} onPress={() => setShowSoundPicker(true)}>
              <Music size={22} color={selectedSound ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.actionRowText, selectedSound && { color: COLORS.gold }]}>
                {selectedSound ? selectedSound.name : 'Nhạc nền'}
              </Text>
            </TouchableOpacity>

            {/* Row 3: Audience */}
            <TouchableOpacity style={styles.actionRow} onPress={() => setShowAudiencePicker(!showAudiencePicker)}>
              {audience === 'public' && <Globe size={22} color={COLORS.success} />}
              {audience === 'followers' && <UserCheck size={22} color={COLORS.purple} />}
              {audience === 'private' && <Lock size={22} color={COLORS.error} />}
              <Text style={styles.actionRowText}>
                {audience === 'public' && 'Công khai'}
                {audience === 'followers' && 'Followers'}
                {audience === 'private' && 'Riêng tư'}
              </Text>
              <ChevronDown size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Audience Picker Dropdown */}
            {showAudiencePicker && (
              <View style={styles.audienceDropdown}>
                <TouchableOpacity
                  style={[styles.audienceOption, audience === 'public' && styles.audienceOptionActive]}
                  onPress={() => { setAudience('public'); setShowAudiencePicker(false); }}
                >
                  <Globe size={18} color={COLORS.success} />
                  <View style={styles.audienceOptionInfo}>
                    <Text style={styles.audienceOptionText}>Công khai</Text>
                    <Text style={styles.audienceOptionDesc}>Mọi người đều thấy</Text>
                  </View>
                  {audience === 'public' && <Check size={18} color={COLORS.gold} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.audienceOption, audience === 'followers' && styles.audienceOptionActive]}
                  onPress={() => { setAudience('followers'); setShowAudiencePicker(false); }}
                >
                  <UserCheck size={18} color={COLORS.purple} />
                  <View style={styles.audienceOptionInfo}>
                    <Text style={styles.audienceOptionText}>Followers</Text>
                    <Text style={styles.audienceOptionDesc}>Chỉ người theo dõi</Text>
                  </View>
                  {audience === 'followers' && <Check size={18} color={COLORS.gold} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.audienceOption, audience === 'private' && styles.audienceOptionActive]}
                  onPress={() => { setAudience('private'); setShowAudiencePicker(false); }}
                >
                  <Lock size={18} color={COLORS.error} />
                  <View style={styles.audienceOptionInfo}>
                    <Text style={styles.audienceOptionText}>Riêng tư</Text>
                    <Text style={styles.audienceOptionDesc}>Chỉ mình bạn thấy</Text>
                  </View>
                  {audience === 'private' && <Check size={18} color={COLORS.gold} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Row 4: Product */}
            <TouchableOpacity style={styles.actionRow} onPress={() => setShowProductPicker(true)}>
              <ShoppingBag size={22} color={linkedProducts.length > 0 ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.actionRowText, linkedProducts.length > 0 && { color: COLORS.gold }]}>
                {linkedProducts.length > 0 ? `Sản phẩm (${linkedProducts.length})` : 'Gắn sản phẩm'}
              </Text>
            </TouchableOpacity>

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Image Editor Modal */}
        <ImageEditorModal
          visible={showImageEditor}
          imageUri={tempImageUri}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
        />

        {/* Sound Picker Modal */}
        <SoundPicker
          visible={showSoundPicker}
          onClose={() => setShowSoundPicker(false)}
          onSelect={(sound) => {
            setSelectedSound(sound);
            setShowSoundPicker(false);
          }}
        />

        {/* NOTE: Audience selection is handled by inline dropdown in toolbar, not modal */}

        {/* Product Picker Modal - MULTI-SELECT MODE */}
        <ProductPicker
          visible={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          onSelect={(products) => {
            setLinkedProducts(products);
            setShowProductPicker(false);
          }}
          currentProduct={linkedProducts}
          multiSelect={true}
          maxSelect={5}
        />
        {AlertComponent}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  submitButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
  },
  submitText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  categorySelector: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  categorySelectorLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categorySelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  categoryPicker: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryOptionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mainTopicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  mainTopicOptionActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },
  adminTopicOption: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  mainTopicText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  mainTopicTextActive: {
    color: COLORS.gold,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  contentInput: {
    // Seamless: no background, no border, no card
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 0,
    paddingTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    minHeight: 280,
    lineHeight: 28,
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },

  // Media styles
  addMediaBtn: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.xxl,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginTop: SPACING.md,
  },
  addMediaHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  mediaPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.glassBg,
  },
  mediaActions: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  mediaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  mediaActionBtnDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },
  mediaActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },

  // ═══════════════════════════════════════════
  // FULL ASPECT RATIO MEDIA PREVIEW STYLES
  // ═══════════════════════════════════════════
  mediaPreviewSection: {
    marginBottom: SPACING.lg,
  },
  mediaPreviewItem: {
    position: 'relative',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreviewFull: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.bgMid,
  },
  tapHintOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tapHintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  mediaDeleteBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // ═══════════════════════════════════════════
  // ACTIONS SECTION - Stacked rows below content
  // ═══════════════════════════════════════════
  actionsDivider: {
    height: 1,
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
    marginVertical: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionRowText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Multi-image gallery styles
  imageGallery: {
    position: 'relative',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  imageGalleryContent: {
    gap: SPACING.sm,
  },
  galleryImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#112250',
  },
  galleryImageActions: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  galleryActionBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryActionBtnDanger: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },
  addMoreBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.05)',
  },
  addMoreText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Image Editor styles
  editorGradient: {
    flex: 1,
  },
  editorContainer: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  editorHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  editorSaveBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  editorSaveText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
  },
  editorImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  editorImage: {
    width: '100%',
    height: '100%',
  },
  editorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorTools: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xxl,
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.2)',
  },
  editorToolBtn: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  editorToolText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },

  // (Creator toolbar replaced by actionRow stacked items)

  // Audience Dropdown
  audienceDropdown: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  audienceOptionActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
  },
  audienceOptionInfo: {
    flex: 1,
  },
  audienceOptionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  audienceOptionDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Selected Sound Card
  selectedSoundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    gap: SPACING.md,
  },
  selectedSoundInfo: {
    flex: 1,
  },
  selectedSoundName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  selectedSoundArtist: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeSoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Linked Products Container - MULTI-SELECT STYLES
  linkedProductsContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.2)',
  },
  linkedProductsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  linkedProductsScroll: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
  },
  linkedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.8)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    minWidth: 180,
    maxWidth: 220,
  },
  linkedProductImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkedProductInfo: {
    flex: 1,
    minWidth: 80,
    paddingRight: SPACING.xs,
  },
  linkedProductName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  linkedProductPrice: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginTop: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  removeProductBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
});

export default CreatePostScreen;

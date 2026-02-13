/**
 * Gemral - Edit Post Screen
 * Modal screen for editing existing forum posts
 * WITH MEDIA UPLOAD, IMAGE CROP/EDIT SUPPORT
 * SECURITY: Only author can edit their own post
 */

import React, { useState, useEffect } from 'react';
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
  DeviceEventEmitter,
} from 'react-native';
import alertService from '../../services/alertService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronDown, Check, ImagePlus, Trash2, Crop, RotateCw, ShoppingBag, Plus, Users, RefreshCw } from 'lucide-react-native';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING, ACTION_BUTTON_BOTTOM_PADDING } from '../../constants/layout';
import ProductPicker from '../../components/ProductPicker';
import MentionInput from '../../components/MentionInput';

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

const EditPostScreen = ({ navigation, route }) => {
  const { post } = route.params || {};
  const { user, isAdmin } = useAuth();

  // Pre-populate with existing post data
  const [content, setContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Media state - NOW SUPPORTS MULTIPLE IMAGES
  const [selectedImages, setSelectedImages] = useState([]); // Array of URIs
  const [originalMediaUrls, setOriginalMediaUrls] = useState([]); // Original URLs from post
  const [imagesChanged, setImagesChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const MAX_IMAGES = 10;

  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageUri, setTempImageUri] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(-1);

  // Tagged products state
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [originalTaggedProducts, setOriginalTaggedProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productsChanged, setProductsChanged] = useState(false);

  // Image aspect ratios for proper display (keyed by URI)
  const [imageAspectRatios, setImageAspectRatios] = useState({});

  // Mention trigger state - for external trigger from Tag People button
  const [triggerMention, setTriggerMention] = useState(false);

  // Calculate aspect ratio when images change
  useEffect(() => {
    selectedImages.forEach((uri) => {
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
            console.log('[EditPost] Could not get image size:', error);
          }
        );
      }
    });
  }, [selectedImages]);

  // Security check: Only author OR admin can edit
  useEffect(() => {
    if (!post) {
      alertService.error('Lỗi', 'Không tìm thấy bài viết');
      navigation.goBack();
      return;
    }

    // Admin can edit ANY post (including seed posts)
    const isAuthor = post.user_id === user?.id || post.author_id === user?.id;
    if (!isAuthor && !isAdmin) {
      alertService.error('Không có quyền', 'Bạn không thể chỉnh sửa bài viết của người khác');
      navigation.goBack();
      return;
    }

    // Pre-populate form with post data
    initializeForm();
  }, [post, user, isAdmin]);

  const initializeForm = () => {
    if (!post) return;

    try {
      console.log('[EditPost] Initializing form with post:', post.id, 'is_seed:', post.is_seed);

      // Combine title and content back into single content field
      const combinedContent = post.title && post.content !== post.title
        ? `${post.title}\n${post.content}`
        : post.content || post.title || '';

      setContent(combinedContent);

      // Set topic if exists (seed posts use seed_topic, forum posts use topic)
      const topicId = post.topic || post.seed_topic;
      if (topicId) {
        const allTopics = [...MAIN_TOPICS, ...ADMIN_TOPICS];
        const foundTopic = allTopics.find(t => t.id === topicId);
        setSelectedTopic(foundTopic || null);
      }

      // Set images if exists - support both single image_url and multiple media_urls
      // Handle both array of strings and array of objects with url property
      let mediaUrls = post.media_urls || [];
      if (mediaUrls.length > 0) {
        // Normalize to array of strings - handle both [{url: '...'}, ...] and ['url1', 'url2'] formats
        mediaUrls = mediaUrls.map(item => typeof item === 'string' ? item : (item?.url || item));
        mediaUrls = mediaUrls.filter(url => url && typeof url === 'string');
        if (mediaUrls.length > 0) {
          setOriginalMediaUrls(mediaUrls);
          setSelectedImages(mediaUrls);
        } else if (post.image_url) {
          setOriginalMediaUrls([post.image_url]);
          setSelectedImages([post.image_url]);
        }
      } else if (post.image_url) {
        // Fallback to single image_url for older posts
        setOriginalMediaUrls([post.image_url]);
        setSelectedImages([post.image_url]);
      }

      // Set tagged products if exists
      // Check both tagged_products (forum) and seed_post_products (seed)
      const productsData = post.tagged_products || post.seed_post_products || [];
      if (Array.isArray(productsData) && productsData.length > 0) {
        const products = productsData
          .filter(tp => tp && tp.product_id) // Filter out null/invalid entries
          .map(tp => ({
            id: tp.product_id,
            title: tp.product_title || '',
            price: tp.product_price || 0,
            image: tp.product_image || '',
            handle: tp.product_handle || '',
          }));
        if (products.length > 0) {
          setTaggedProducts(products);
          setOriginalTaggedProducts(products);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('[EditPost] Error initializing form:', error);
      alertService.error('Lỗi', 'Không thể tải dữ liệu bài viết. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Get available topics based on user role
  const getAvailableTopics = () => {
    if (isAdmin) {
      return [...MAIN_TOPICS, ...ADMIN_TOPICS];
    }
    return MAIN_TOPICS;
  };

  // Request permission and pick images (multi-select with fallback)
  const handlePickImage = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        alertService.warning('Giới hạn', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alertService.warning('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để tải ảnh lên');
        return;
      }

      const remainingSlots = MAX_IMAGES - selectedImages.length;

      let result;
      try {
        // Try multi-select first (may fail on some Android devices)
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: Platform.OS === 'ios' ? true : false, // Disable multi-select on Android due to ActivityResultLauncher bug
          selectionLimit: remainingSlots,
          quality: 0.9,
        });
      } catch (multiSelectError) {
        console.warn('[EditPost] Multi-select failed, falling back to single select:', multiSelectError.message);
        // Fallback to single select on Android
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
        setImagesChanged(true);
      }
    } catch (error) {
      console.error('[EditPost] Pick image error:', error);
      alertService.error('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        alertService.warning('Giới hạn', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alertService.warning('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh');
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
        setImagesChanged(true);
      }
    } catch (error) {
      console.error('[EditPost] Take photo error:', error);
      alertService.error('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
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
      setImagesChanged(true);
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
    // Check if removing image would leave empty post
    const hasContent = content.trim().length > 0;
    const willHaveOtherImages = selectedImages.length > 1;

    if (!hasContent && !willHaveOtherImages) {
      alertService.warning('Không thể xóa ảnh', 'Bài viết cần có nội dung hoặc ảnh. Hãy nhập nội dung trước khi xóa ảnh cuối cùng.');
      return;
    }

    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagesChanged(true);
  };

  // Delete entire post - WITH CONFIRMATION
  const handleDeletePost = () => {
    alertService.error(
      'Xóa bài viết?',
      'Bạn có chắc muốn xóa toàn bộ bài viết này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa bài viết',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              const { success, error } = await forumService.deletePost(post.id);
              if (success) {
                alertService.success('Thành công', 'Bài viết đã được xóa', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                alertService.error('Lỗi', error || 'Không thể xóa bài viết. Vui lòng thử lại.');
              }
            } catch (error) {
              console.error('[EditPost] Delete error:', error);
              alertService.error('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
            }
          }
        },
      ]
    );
  };

  // Show media options - works for both adding and changing images
  const showMediaOptions = () => {
    const title = selectedImages.length > 0 ? 'Thêm ảnh khác' : 'Thêm ảnh';
    alertService.info(
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
    const hasContent = content.trim().length > 0;
    const hasImages = selectedImages.length > 0;

    // Validate: post must have at least content OR image
    if (!hasContent && !hasImages) {
      alertService.error('Lỗi', 'Bài viết cần có nội dung hoặc ảnh');
      return;
    }

    // If only image (no content), warn user but allow
    if (!hasContent && hasImages) {
      alertService.warning(
        'Không có nội dung',
        'Bài viết chỉ có ảnh mà không có nội dung. Bạn có muốn tiếp tục?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Tiếp tục', onPress: () => performSubmit() }
        ]
      );
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {

    setSubmitting(true);
    try {
      let imageUrl = originalMediaUrls[0] || null;
      let mediaUrls = [...originalMediaUrls];

      // Upload new/changed images if changed
      if (imagesChanged) {
        setUploading(true);
        console.log('[EditPost] Processing images:', selectedImages.length);

        // Separate existing URLs from new local URIs
        const existingUrls = selectedImages.filter(uri => uri.startsWith('http'));
        const newLocalImages = selectedImages.filter(uri => !uri.startsWith('http'));

        // Start with existing URLs
        mediaUrls = [...existingUrls];

        // Upload new local images
        if (newLocalImages.length > 0) {
          console.log('[EditPost] Uploading new images:', newLocalImages.length);
          const uploadResult = await forumService.uploadMultipleImages(newLocalImages);
          console.log('[EditPost] Upload result:', uploadResult);

          if (uploadResult.success && uploadResult.urls.length > 0) {
            mediaUrls = [...mediaUrls, ...uploadResult.urls];
          } else {
            console.error('[EditPost] Upload failed:', uploadResult.errors);
            alertService.error('Lỗi', 'Không thể tải một số ảnh lên.');
          }
        }

        // Update cover image
        imageUrl = mediaUrls[0] || null;
        setUploading(false);
      }

      // Extract title from first line of content
      const lines = content.trim().split('\n');
      const title = lines[0].substring(0, 100);
      const body = lines.length > 1 ? lines.slice(1).join('\n').trim() : lines[0];

      // Determine feed_type based on selected topic
      let feedType = post.feed_type || 'general';
      if (selectedTopic?.feedType) {
        feedType = selectedTopic.feedType;
      }

      // Call update service - include media_urls
      const { success, error, isSeedPost } = await forumService.updatePost(post.id, user.id, {
        title: title,
        content: body || title,
        topic: selectedTopic?.id || null,
        image_url: imageUrl,
        media_urls: mediaUrls,
        feed_type: feedType,
      });

      if (error || !success) {
        console.error('[EditPost] Update error:', error);
        alertService.error('Lỗi', 'Không thể cập nhật bài viết. Vui lòng thử lại.');
      } else {
        // Update products if changed
        // Pass isSeedPost flag to use correct table (post_products vs seed_post_products)
        if (productsChanged) {
          console.log('[EditPost] Updating products:', taggedProducts.length, 'isSeedPost:', isSeedPost);
          const productResult = await forumService.updatePostProducts(post.id, taggedProducts, isSeedPost);
          if (!productResult.success) {
            console.error('[EditPost] Update products error:', productResult.error);
            // Don't fail the whole update, just log the error
          }
        }

        // Emit event to notify ForumScreen to update feed
        const updatedPost = {
          ...post,
          title: title,
          content: body || title,
          topic: selectedTopic?.id || null,
          image_url: imageUrl,
          media_urls: mediaUrls,
          feed_type: feedType,
          tagged_products: taggedProducts.map(p => ({
            product_id: p.id,
            product_title: p.title,
            product_price: p.price,
            product_image: p.image,
            product_handle: p.handle,
          })),
        };
        DeviceEventEmitter.emit('postUpdated', updatedPost);

        alertService.success('Thành công', 'Bài viết đã được cập nhật', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('[EditPost] Submit error:', error);
      alertService.error('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
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

  // Handle product selection from ProductPicker
  const handleProductsSelected = (selectedProducts) => {
    setTaggedProducts(selectedProducts);
    setProductsChanged(true);
    setShowProductPicker(false);
  };

  // Remove a tagged product
  const handleRemoveProduct = (productId) => {
    setTaggedProducts(prev => prev.filter(p => p.id !== productId));
    setProductsChanged(true);
  };

  // Post needs at least content OR image to be valid
  const canSubmit = (content.trim() || selectedImages.length > 0) && !submitting;

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          <Text style={styles.headerTitle}>Chỉnh sửa bài viết</Text>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Topic Selector */}
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowTopicPicker(!showTopicPicker)}
            >
              <Text style={styles.categorySelectorLabel}>CHỦ ĐỀ</Text>
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

            {/* Combined Content Input with @mention support */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NỘI DUNG BÀI VIẾT *</Text>
              <MentionInput
                style={styles.contentInput}
                placeholder="Dòng đầu tiên sẽ là tiêu đề...&#10;&#10;Viết nội dung bài viết của bạn...&#10;&#10;Dùng @ để tag người dùng, # để thêm hashtag"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                triggerMention={triggerMention}
                onTriggerMentionHandled={() => setTriggerMention(false)}
              />
              <Text style={styles.hint}>💡 Dòng đầu tiên sẽ tự động trở thành tiêu đề. Dùng @ để tag, # cho hashtag</Text>
            </View>

            {/* ═══════════════════════════════════════════ */}
            {/* Media Section - FULL ASPECT RATIO MULTI-IMAGE PREVIEW */}
            {/* ═══════════════════════════════════════════ */}
            {selectedImages.length > 0 && (
              <View style={styles.mediaPreviewSection}>
                {selectedImages.map((uri, index) => {
                  const aspectRatio = imageAspectRatios[uri] || 1;
                  const imageHeight = Math.min((SCREEN_WIDTH - SPACING.lg * 2) / aspectRatio, SCREEN_WIDTH * 1.2);

                  return (
                    <View key={`img-${index}`} style={styles.mediaPreviewItem}>
                      {/* Tap image to edit - entire image is tappable */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleEditImage(index)}
                      >
                        <Image
                          source={{ uri }}
                          style={[styles.mediaPreviewFull, { height: imageHeight }]}
                          resizeMode="cover"
                        />
                        {/* Tap hint overlay */}
                        <View style={styles.tapHintOverlay}>
                          <Crop size={20} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.tapHintText}>Nhấn để chỉnh sửa</Text>
                        </View>
                      </TouchableOpacity>
                      {/* Cover badge for first image */}
                      {index === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>BÌA</Text>
                        </View>
                      )}
                      {/* Delete button - positioned at corner */}
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

            {/* ═══════════════════════════════════════════ */}
            {/* Action Toolbar - Add photo, Tag people, Products */}
            {/* ═══════════════════════════════════════════ */}
            <View style={styles.actionToolbar}>
              {/* Add Photo - Always show this for adding NEW photo */}
              <TouchableOpacity style={styles.toolbarItem} onPress={showMediaOptions}>
                <Plus size={22} color={COLORS.success} />
                <Text style={styles.toolbarItemText}>
                  {selectedImages.length > 0 ? `Ảnh (${selectedImages.length}/${MAX_IMAGES})` : 'Thêm ảnh'}
                </Text>
              </TouchableOpacity>

              {/* Tag People */}
              <TouchableOpacity style={styles.toolbarItem} onPress={handleTagPeople}>
                <Users size={22} color={COLORS.cyan} />
                <Text style={styles.toolbarItemText}>Gắn thẻ</Text>
              </TouchableOpacity>

              {/* Tag Products */}
              <TouchableOpacity
                style={styles.toolbarItem}
                onPress={() => setShowProductPicker(true)}
              >
                <ShoppingBag size={22} color={COLORS.gold} />
                <Text style={styles.toolbarItemText}>
                  {taggedProducts.length > 0 ? `${taggedProducts.length} SP` : 'Sản phẩm'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tagged Products - Horizontal scroll */}
            {taggedProducts.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productsScroll}
                contentContainerStyle={styles.productsScrollContent}
              >
                {taggedProducts.map((product, index) => (
                  <View key={`product-${product.id}-${index}`} style={styles.productCard}>
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                    ) : (
                      <View style={[styles.productImage, styles.productImagePlaceholder]}>
                        <ShoppingBag size={16} color={COLORS.textMuted} />
                      </View>
                    )}
                    <Text style={styles.productTitle} numberOfLines={1}>{product.title || ''}</Text>
                    <TouchableOpacity
                      style={styles.removeProductBtnSmall}
                      onPress={() => handleRemoveProduct(product.id)}
                    >
                      <X size={12} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Delete Post Section */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Vùng nguy hiểm</Text>
              <Text style={styles.dangerZoneHint}>
                Xóa bài viết vĩnh viễn. Hành động này không thể hoàn tác.
              </Text>
              <TouchableOpacity
                style={styles.deletePostBtn}
                onPress={handleDeletePost}
                disabled={submitting}
              >
                <Trash2 size={20} color="#FFFFFF" />
                <Text style={styles.deletePostText}>Xoá bài viết</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom padding for tab bar */}
            <View style={{ height: CONTENT_BOTTOM_PADDING + 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Image Editor Modal */}
        <ImageEditorModal
          visible={showImageEditor}
          imageUri={tempImageUri}
          onSave={handleImageEditorSave}
          onCancel={handleImageEditorCancel}
        />

        {/* Product Picker Modal */}
        <ProductPicker
          visible={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          onSelect={handleProductsSelected}
          selectedProducts={taggedProducts}
          multiSelect={true}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },
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
    padding: SPACING.lg,
    paddingBottom: CONTENT_BOTTOM_PADDING + 80,
  },
  categorySelector: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
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
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentInput: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    minHeight: 200,
    lineHeight: 24,
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },

  // ═══════════════════════════════════════════
  // MULTI-IMAGE PREVIEW STYLES
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
  coverBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#112250',
  },

  // Media styles - Full aspect ratio
  mediaPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
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
  mediaChangeBtn: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(106, 91, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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

  // Action Toolbar styles
  actionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  toolbarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  toolbarItemText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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

  // Products horizontal scroll
  productsScroll: {
    marginBottom: SPACING.lg,
  },
  productsScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  productCard: {
    width: 80,
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  removeProductBtnSmall: {
    position: 'absolute',
    top: -4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Danger Zone styles
  dangerZone: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  dangerZoneTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FF6B6B',
    marginBottom: SPACING.xs,
  },
  dangerZoneHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  deletePostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  deletePostText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
});

export default EditPostScreen;

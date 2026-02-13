/**
 * Gemral - Create Post Screen
 * Modal screen for creating new forum posts
 * WITH MEDIA UPLOAD, IMAGE CROP/EDIT SUPPORT
 * ADMIN-ONLY TOPICS SUPPORT
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
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronDown, Check, ImagePlus, Trash2, Crop, RotateCw, Plus, Music, Users, ShoppingBag, Globe, Lock, UserCheck } from 'lucide-react-native';
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

// Main topic selections - CHỈ 3 TOPIC CHÍNH cho user thường
const MAIN_TOPICS = [
  { id: 'giao-dich', name: 'GIAO DỊCH', color: '#00F0FF', icon: '🎯' },
  { id: 'tinh-than', name: 'TINH THẦN', color: '#6A5BFF', icon: '☯️' },
  { id: 'thinh-vuong', name: 'THỊNH VƯỢNG', color: '#FFBD59', icon: '🌟' },
];

// Admin-only topics
const ADMIN_TOPICS = [
  { id: 'affiliate', name: 'AFFILIATE', color: '#FF6B6B', icon: '💰', feedType: 'affiliate' },
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

  // Product attachment state
  const [linkedProduct, setLinkedProduct] = useState(null);
  const [showProductPicker, setShowProductPicker] = useState(false);

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
        Alert.alert('Giới hạn', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập thư viện ảnh để tải ảnh lên',
          [{ text: 'OK' }]
        );
        return;
      }

      const remainingSlots = MAX_IMAGES - selectedImages.length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add selected images to array
        const newUris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newUris].slice(0, MAX_IMAGES));
      }
    } catch (error) {
      console.error('[CreatePost] Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        Alert.alert('Giới hạn', `Bạn chỉ có thể chọn tối đa ${MAX_IMAGES} ảnh`);
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần quyền truy cập camera để chụp ảnh',
          [{ text: 'OK' }]
        );
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
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
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

  // Show media options
  const showMediaOptions = () => {
    Alert.alert(
      'Thêm ảnh',
      'Chọn nguồn ảnh',
      [
        { text: 'Thư viện ảnh', onPress: handlePickImage },
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài viết');
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
          Alert.alert('Lỗi', 'Không thể tải ảnh lên. Bài viết sẽ được đăng không có ảnh.');
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

      const { data, error } = await forumService.createPost({
        title: title,
        content: body || title, // If only one line, use it as both title and content
        topic: selectedTopic?.id || null,
        image_url: imageUrl, // Cover image (first one)
        media_urls: mediaUrls, // JSONB array of all images
        hashtags: hashtags, // Extracted hashtags array
        feed_type: feedType,
      });

      if (error) {
        console.error('[CreatePost] Create error:', error);
        Alert.alert('Lỗi', 'Không thể tạo bài viết. Vui lòng thử lại.');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('[CreatePost] Submit error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
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
      <SafeAreaView style={styles.container} edges={['top']}>
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Topic Selector - CHỦ ĐỀ */}
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
                      topic.feedType && styles.adminTopicOption, // Visual indicator for admin topics
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

            {/* Combined Content Input with @mention and #hashtag support */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NỘI DUNG BÀI VIẾT *</Text>
              <MentionInput
                style={styles.contentInput}
                placeholder="Dòng đầu tiên sẽ là tiêu đề...&#10;&#10;Viết nội dung bài viết của bạn...&#10;&#10;Dùng @ để tag người dùng, # để thêm hashtag"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
              />
              <Text style={styles.hint}>💡 Dòng đầu tiên sẽ tự động trở thành tiêu đề. Dùng @ để tag, # cho hashtag</Text>
            </View>

            {/* ═══════════════════════════════════════════ */}
            {/* CREATOR TOOLBAR - Sound, Audience, Product */}
            {/* ═══════════════════════════════════════════ */}
            <View style={styles.creatorToolbar}>
              {/* Sound Picker Button */}
              <TouchableOpacity
                style={[
                  styles.toolbarBtn,
                  selectedSound && styles.toolbarBtnActive,
                ]}
                onPress={() => setShowSoundPicker(true)}
              >
                <Music size={20} color={selectedSound ? COLORS.gold : COLORS.textMuted} />
                <Text style={[
                  styles.toolbarBtnText,
                  selectedSound && styles.toolbarBtnTextActive,
                ]}>
                  {selectedSound ? selectedSound.name.substring(0, 12) + '...' : 'Nhạc nền'}
                </Text>
              </TouchableOpacity>

              {/* Audience Picker Button */}
              <TouchableOpacity
                style={styles.toolbarBtn}
                onPress={() => setShowAudiencePicker(!showAudiencePicker)}
              >
                {audience === 'public' && <Globe size={20} color={COLORS.success} />}
                {audience === 'followers' && <UserCheck size={20} color={COLORS.purple} />}
                {audience === 'private' && <Lock size={20} color={COLORS.error} />}
                <Text style={styles.toolbarBtnText}>
                  {audience === 'public' && 'Công khai'}
                  {audience === 'followers' && 'Followers'}
                  {audience === 'private' && 'Riêng tư'}
                </Text>
                <ChevronDown size={14} color={COLORS.textMuted} />
              </TouchableOpacity>

              {/* Product Link Button */}
              <TouchableOpacity
                style={[
                  styles.toolbarBtn,
                  linkedProduct && styles.toolbarBtnActive,
                ]}
                onPress={() => setShowProductPicker(true)}
              >
                <ShoppingBag size={20} color={linkedProduct ? COLORS.gold : COLORS.textMuted} />
                <Text style={[
                  styles.toolbarBtnText,
                  linkedProduct && styles.toolbarBtnTextActive,
                ]}>
                  {linkedProduct ? 'Đã gắn' : 'Gắn SP'}
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Linked Product Display */}
            {linkedProduct && (
              <View style={styles.linkedProductCard}>
                <ShoppingBag size={18} color={COLORS.gold} />
                <View style={styles.linkedProductInfo}>
                  <Text style={styles.linkedProductName}>{linkedProduct.title}</Text>
                  <Text style={styles.linkedProductPrice}>{linkedProduct.price}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setLinkedProduct(null)}
                  style={styles.removeProductBtn}
                >
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            {/* Media Section - MULTI-IMAGE SUPPORT */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                ẢNH ĐÍNH KÈM ({selectedImages.length}/{MAX_IMAGES})
              </Text>

              {selectedImages.length > 0 ? (
                // Show image gallery preview
                <View style={styles.imageGallery}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageGalleryContent}
                  >
                    {selectedImages.map((uri, index) => (
                      <View key={`img-${index}`} style={styles.galleryImageContainer}>
                        <Image source={{ uri }} style={styles.galleryImage} />
                        {/* Cover badge for first image */}
                        {index === 0 && (
                          <View style={styles.coverBadge}>
                            <Text style={styles.coverBadgeText}>BIA</Text>
                          </View>
                        )}
                        {/* Action buttons */}
                        <View style={styles.galleryImageActions}>
                          <TouchableOpacity
                            style={styles.galleryActionBtn}
                            onPress={() => handleEditImage(index)}
                          >
                            <Crop size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.galleryActionBtn, styles.galleryActionBtnDanger]}
                            onPress={() => handleRemoveImage(index)}
                          >
                            <X size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    {/* Add more button if under limit */}
                    {selectedImages.length < MAX_IMAGES && (
                      <TouchableOpacity
                        style={styles.addMoreBtn}
                        onPress={showMediaOptions}
                      >
                        <Plus size={28} color={COLORS.textMuted} />
                        <Text style={styles.addMoreText}>Thêm</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  {uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color={COLORS.gold} />
                      <Text style={styles.uploadingText}>Đang tải lên...</Text>
                    </View>
                  )}
                </View>
              ) : (
                // Show add media button
                <TouchableOpacity
                  style={styles.addMediaBtn}
                  onPress={showMediaOptions}
                >
                  <ImagePlus size={32} color={COLORS.textMuted} />
                  <Text style={styles.addMediaText}>Thêm ảnh (tối đa {MAX_IMAGES})</Text>
                  <Text style={styles.addMediaHint}>Chạm để chọn từ thư viện hoặc chụp ảnh</Text>
                </TouchableOpacity>
              )}
            </View>

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

        {/* Product Picker Modal */}
        <ProductPicker
          visible={showProductPicker}
          onClose={() => setShowProductPicker(false)}
          onSelect={(product) => {
            setLinkedProduct(product);
            setShowProductPicker(false);
          }}
          currentProduct={linkedProduct}
        />
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
    padding: SPACING.lg,
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

  // ═══════════════════════════════════════════
  // CREATOR TOOLBAR STYLES
  // ═══════════════════════════════════════════
  creatorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    gap: SPACING.xs,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toolbarBtnActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  toolbarBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  toolbarBtnTextActive: {
    color: COLORS.gold,
  },

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

  // Linked Product Card
  linkedProductCard: {
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
  linkedProductInfo: {
    flex: 1,
  },
  linkedProductName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  linkedProductPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  removeProductBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePostScreen;

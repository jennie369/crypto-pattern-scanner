/**
 * Gemral - Lesson Builder Screen
 * Create and edit lessons (video, article, quiz)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomAlert, { useCustomAlert } from '../../../components/CustomAlert';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Save,
  Play,
  FileText,
  HelpCircle,
  Eye,
  Clock,
  Link,
  Paperclip,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  ClipboardPaste,
  Check,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import * as attachmentService from '../../../services/attachmentService';
import { saveHTMLContent } from '../../../services/courseBuilderService';
import courseImageService from '../../../services/courseImageService';
import { ImageUploader, LessonImageList, MediaLibraryModal } from '../../../components/Admin';

const LessonBuilderScreen = ({ navigation, route }) => {
  const { lessonId, courseId, moduleId, lessonType: initialType } = route.params || {};
  const { isAdmin } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(initialType || 'video');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // HTML Content state (for article/html type)
  const [htmlContent, setHtmlContent] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlPasteStatus, setHtmlPasteStatus] = useState(null); // 'success', 'error', null

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHtml, setSavingHtml] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'images'

  // Images state
  const [lessonImages, setLessonImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [mediaLibraryVisible, setMediaLibraryVisible] = useState(false);

  // Load lesson data
  useEffect(() => {
    loadLessonData();
    if (lessonId) {
      loadLessonImages();
    }
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      const { data: lesson, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setType(lesson.type || lesson.content_type || 'video');
      setVideoUrl(lesson.video_url || '');
      setDurationMinutes(lesson.duration_minutes?.toString() || '');
      setIsPreview(lesson.is_preview || lesson.is_free_preview || false);
      setContentBlocks(lesson.content_blocks || []);
      setHtmlContent(lesson.html_content || lesson.article_content || '');

      // Load attachments
      const { data: attachmentsData } = await supabase
        .from('lesson_attachments')
        .select('*')
        .eq('lesson_id', lessonId);

      setAttachments(attachmentsData || []);
    } catch (error) {
      console.error('[LessonBuilderScreen] loadLessonData error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu bài học',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  };

  // Load lesson images
  const loadLessonImages = async () => {
    if (!lessonId) return;

    try {
      setImagesLoading(true);
      const images = await courseImageService.getByLesson(lessonId);
      setLessonImages(images || []);
    } catch (error) {
      console.error('[LessonBuilderScreen] loadLessonImages error:', error);
    } finally {
      setImagesLoading(false);
    }
  };

  // ========== IMAGE HANDLING ==========

  // Handle upload complete
  const handleUploadComplete = async (uploadData) => {
    try {
      // Create record in database
      const imageRecord = await courseImageService.create({
        lesson_id: lessonId,
        image_url: uploadData.url,
        storage_path: uploadData.path,
        title: uploadData.fileName,
        alt_text: uploadData.fileName,
        width: uploadData.width,
        height: uploadData.height,
        file_size: uploadData.fileSize,
        mime_type: uploadData.mimeType,
        sort_order: lessonImages.length,
      });

      setLessonImages(prev => [...prev, imageRecord]);

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã tải lên hình ảnh',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      console.error('[LessonBuilderScreen] handleUploadComplete error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể lưu thông tin hình ảnh',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId) => {
    try {
      await courseImageService.deleteImage(imageId);
      setLessonImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('[LessonBuilderScreen] handleDeleteImage error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể xóa hình ảnh',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Handle update image
  const handleUpdateImage = async (imageId, updates) => {
    try {
      const updated = await courseImageService.update(imageId, updates);
      setLessonImages(prev =>
        prev.map(img => (img.id === imageId ? { ...img, ...updated } : img))
      );
    } catch (error) {
      console.error('[LessonBuilderScreen] handleUpdateImage error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật hình ảnh',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Handle reorder images
  const handleReorderImages = async (reorderedImages) => {
    try {
      setLessonImages(reorderedImages);
      await courseImageService.updateOrder(
        reorderedImages.map((img, idx) => ({ id: img.id, sort_order: idx }))
      );
    } catch (error) {
      console.error('[LessonBuilderScreen] handleReorderImages error:', error);
      // Reload to restore correct order on error
      loadLessonImages();
    }
  };

  // Handle select from media library
  const handleSelectFromLibrary = async (image) => {
    try {
      // Check if already exists
      if (lessonImages.some(img => img.image_url === image.image_url)) {
        alert({
          type: 'warning',
          title: 'Đã tồn tại',
          message: 'Hình ảnh này đã có trong bài học',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      // Create new record linking to existing image
      const imageRecord = await courseImageService.create({
        lesson_id: lessonId,
        image_url: image.image_url,
        storage_path: image.storage_path,
        title: image.title || image.position_id,
        position_id: image.position_id,
        alt_text: image.alt_text || image.title,
        width: image.width,
        height: image.height,
        file_size: image.file_size,
        mime_type: image.mime_type,
        sort_order: lessonImages.length,
      });

      setLessonImages(prev => [...prev, imageRecord]);
    } catch (error) {
      console.error('[LessonBuilderScreen] handleSelectFromLibrary error:', error);
      throw error;
    }
  };

  // Save lesson
  const handleSave = async () => {
    if (!title.trim()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập tên bài học',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    try {
      setSaving(true);

      const lessonData = {
        title: title.trim(),
        description: description.trim(),
        type,
        video_url: videoUrl.trim() || null,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : 0,
        is_preview: isPreview,
        content_blocks: contentBlocks,
      };

      const { error } = await supabase
        .from('course_lessons')
        .update(lessonData)
        .eq('id', lessonId);

      if (error) throw error;

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật bài học',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      console.error('[LessonBuilderScreen] save error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể lưu bài học',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSaving(false);
    }
  };

  // Navigate to quiz builder
  const handleEditQuiz = () => {
    navigation.navigate('QuizBuilder', {
      lessonId,
      courseId,
      lessonTitle: title,
    });
  };

  // ========== HTML CONTENT FUNCTIONS ==========

  // Paste HTML from clipboard
  const handlePasteHtml = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      if (!clipboardContent || clipboardContent.trim().length === 0) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: 'Clipboard trống. Vui lòng copy HTML trước.',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      // Basic HTML validation
      const trimmedContent = clipboardContent.trim();
      const hasHtmlTags = /<[^>]+>/g.test(trimmedContent);

      if (!hasHtmlTags) {
        alert({
          type: 'warning',
          title: 'Xác nhận',
          message: 'Nội dung không có thẻ HTML. Vẫn muốn sử dụng?',
          buttons: [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Sử dụng',
              onPress: () => {
                setHtmlContent(trimmedContent);
                setHtmlPasteStatus('success');
                setTimeout(() => setHtmlPasteStatus(null), 2000);
              },
            },
          ],
        });
        return;
      }

      setHtmlContent(trimmedContent);
      setHtmlPasteStatus('success');
      setTimeout(() => setHtmlPasteStatus(null), 2000);
    } catch (error) {
      console.error('[LessonBuilderScreen] pasteHtml error:', error);
      setHtmlPasteStatus('error');
      setTimeout(() => setHtmlPasteStatus(null), 2000);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể đọc clipboard',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Save HTML content
  const handleSaveHtml = async () => {
    if (!htmlContent.trim()) {
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Nội dung HTML trống',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    try {
      setSavingHtml(true);

      const result = await saveHTMLContent(lessonId, htmlContent);

      if (!result.success) {
        throw new Error(result.error || 'Lỗi không xác định');
      }

      alert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã lưu nội dung HTML',
        buttons: [{ text: 'OK' }],
      });
    } catch (error) {
      console.error('[LessonBuilderScreen] saveHtml error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể lưu HTML',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setSavingHtml(false);
    }
  };

  // Clear HTML content
  const handleClearHtml = () => {
    alert({
      type: 'warning',
      title: 'Xóa nội dung HTML',
      message: 'Bạn có chắc muốn xóa toàn bộ nội dung HTML?',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => setHtmlContent(''),
        },
      ],
    });
  };

  // State for upload progress
  const [uploading, setUploading] = useState(false);

  // Handle add attachment with attachmentService
  // FIX Bug #27: Use attachmentService for better error handling
  const handleAddAttachment = async () => {
    try {
      // Step 1: Pick document
      const pickResult = await attachmentService.pickDocument();

      if (pickResult.canceled) {
        return;
      }

      if (!pickResult.success) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: pickResult.error || 'Không thể chọn file',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      const file = pickResult.file;
      setUploading(true);

      // Step 2: Upload file using service
      const uploadResult = await attachmentService.uploadFile(file, lessonId);

      if (!uploadResult.success) {
        alert({
          type: 'error',
          title: 'Lỗi',
          message: uploadResult.error || 'Không thể tải file lên',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      // Step 3: Update local state
      setAttachments(prev => [...prev, uploadResult.data]);
      alert({
        type: 'success',
        title: 'Thành công',
        message: `Đã tải lên: ${file.name}`,
        buttons: [{ text: 'OK' }],
      });

    } catch (error) {
      console.error('[LessonBuilderScreen] handleAddAttachment error:', error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể tải file lên',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setUploading(false);
    }
  };

  // Remove attachment using attachmentService
  const handleRemoveAttachment = async (attachmentId) => {
    const attachment = attachments.find(a => a.id === attachmentId);

    alert({
      type: 'warning',
      title: 'Xóa tài liệu',
      message: `Bạn có chắc muốn xóa "${attachment?.file_name}"?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await attachmentService.deleteAttachment(attachmentId);

              if (!result.success) {
                throw new Error(result.error);
              }

              setAttachments(prev => prev.filter(a => a.id !== attachmentId));
              alert({
                type: 'success',
                title: 'Thành công',
                message: 'Đã xóa tài liệu',
                buttons: [{ text: 'OK' }],
              });
            } catch (error) {
              console.error('[LessonBuilderScreen] removeAttachment error:', error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Không thể xóa tài liệu',
                buttons: [{ text: 'OK' }],
              });
            }
          }
        }
      ],
    });
  };

  // Add content block (for article type)
  const handleAddContentBlock = () => {
    alert({
      type: 'info',
      title: 'Thêm nội dung',
      message: 'Chọn loại block:',
      buttons: [
        { text: 'Đoạn văn', onPress: () => addBlock('paragraph') },
        { text: 'Tiêu đề', onPress: () => addBlock('heading') },
        { text: 'Hủy', style: 'cancel' },
      ],
    });
  };

  const addBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: '',
    };

    if (blockType === 'heading') {
      newBlock.level = 2;
    }
    if (blockType === 'list') {
      newBlock.items = [''];
      newBlock.ordered = false;
    }
    if (blockType === 'callout') {
      newBlock.style = 'info';
      newBlock.title = '';
    }

    setContentBlocks(prev => [...prev, newBlock]);
  };

  // Update content block
  const updateBlock = (blockId, updates) => {
    setContentBlocks(prev =>
      prev.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  // Delete content block
  const deleteBlock = (blockId) => {
    setContentBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  // Render content block editor
  const renderBlockEditor = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <View key={block.id} style={styles.blockCard}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockType}>Đoạn văn</Text>
              <TouchableOpacity onPress={() => deleteBlock(block.id)}>
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={block.content}
              onChangeText={(text) => updateBlock(block.id, { content: text })}
              placeholder="Nhập nội dung..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      case 'heading':
        return (
          <View key={block.id} style={styles.blockCard}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockType}>Tiêu đề (H{block.level})</Text>
              <TouchableOpacity onPress={() => deleteBlock(block.id)}>
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={block.content}
              onChangeText={(text) => updateBlock(block.id, { content: text })}
              placeholder="Nhập tiêu đề..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        );

      case 'callout':
        return (
          <View key={block.id} style={styles.blockCard}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockType}>Callout ({block.style})</Text>
              <TouchableOpacity onPress={() => deleteBlock(block.id)}>
                <Trash2 size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={block.title}
              onChangeText={(text) => updateBlock(block.id, { title: text })}
              placeholder="Tiêu đề callout..."
              placeholderTextColor={COLORS.textMuted}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline, { marginTop: SPACING.xs }]}
              value={block.content}
              onChangeText={(text) => updateBlock(block.id, { content: text })}
              placeholder="Nội dung callout..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        );

      default:
        return null;
    }
  };

  // Render type-specific content
  const renderTypeContent = () => {
    switch (type) {
      case 'video':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung Video</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Video URL *</Text>
              <View style={styles.inputWrapper}>
                <Link size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="https://youtube.com/... hoặc https://vimeo.com/..."
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời lượng (phút)</Text>
              <View style={styles.inputWrapper}>
                <Clock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="VD: 15"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        );

      case 'article':
      case 'html':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung bài viết</Text>

            {/* HTML Paste Section */}
            <View style={styles.htmlSection}>
              <View style={styles.htmlHeader}>
                <View style={styles.htmlTitleRow}>
                  <Code size={18} color={COLORS.gold} />
                  <Text style={styles.htmlTitle}>HTML Content</Text>
                </View>
                <View style={styles.htmlActions}>
                  <TouchableOpacity
                    style={[
                      styles.htmlActionBtn,
                      htmlPasteStatus === 'success' && styles.htmlActionSuccess,
                      htmlPasteStatus === 'error' && styles.htmlActionError,
                    ]}
                    onPress={handlePasteHtml}
                  >
                    {htmlPasteStatus === 'success' ? (
                      <Check size={16} color={COLORS.success} />
                    ) : htmlPasteStatus === 'error' ? (
                      <AlertTriangle size={16} color={COLORS.error} />
                    ) : (
                      <ClipboardPaste size={16} color={COLORS.gold} />
                    )}
                    <Text style={[
                      styles.htmlActionText,
                      htmlPasteStatus === 'success' && { color: COLORS.success },
                      htmlPasteStatus === 'error' && { color: COLORS.error },
                    ]}>
                      {htmlPasteStatus === 'success' ? 'Đã dán' : htmlPasteStatus === 'error' ? 'Lỗi' : 'Dán HTML'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.htmlHint}>
                Copy HTML từ AI/ChatGPT/Notion và dán vào đây
              </Text>

              {/* HTML Editor Toggle */}
              <TouchableOpacity
                style={styles.htmlEditorToggle}
                onPress={() => setShowHtmlEditor(!showHtmlEditor)}
              >
                <FileText size={16} color={COLORS.textMuted} />
                <Text style={styles.htmlEditorToggleText}>
                  {showHtmlEditor ? 'Ẩn trình soạn thảo' : 'Hiện trình soạn thảo'}
                </Text>
                <Text style={styles.htmlCharCount}>
                  {htmlContent.length > 0 ? `${htmlContent.length} ký tự` : 'Chưa có nội dung'}
                </Text>
              </TouchableOpacity>

              {/* HTML Editor */}
              {showHtmlEditor && (
                <View style={styles.htmlEditorContainer}>
                  <TextInput
                    style={styles.htmlEditor}
                    value={htmlContent}
                    onChangeText={setHtmlContent}
                    placeholder="<h1>Tiêu đề bài học</h1>\n<p>Nội dung bài học...</p>"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={12}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {/* HTML Actions */}
                  <View style={styles.htmlEditorActions}>
                    {htmlContent.length > 0 && (
                      <TouchableOpacity
                        style={styles.htmlClearBtn}
                        onPress={handleClearHtml}
                      >
                        <Trash2 size={14} color={COLORS.error} />
                        <Text style={styles.htmlClearText}>Xóa</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.htmlSaveBtn, savingHtml && styles.htmlSaveBtnDisabled]}
                      onPress={handleSaveHtml}
                      disabled={savingHtml || !htmlContent.trim()}
                    >
                      {savingHtml ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <Save size={14} color="#000" />
                          <Text style={styles.htmlSaveText}>Lưu HTML</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Preview indicator */}
              {htmlContent.length > 0 && !showHtmlEditor && (
                <View style={styles.htmlPreviewIndicator}>
                  <Check size={14} color={COLORS.success} />
                  <Text style={styles.htmlPreviewText}>
                    Đã có nội dung HTML ({htmlContent.length} ký tự)
                  </Text>
                </View>
              )}
            </View>

            {/* Legacy Block Editor (optional) */}
            <View style={styles.legacyBlockSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.legacyBlockTitle}>Hoặc sử dụng Block Editor</Text>
                <TouchableOpacity
                  style={styles.addBlockBtn}
                  onPress={handleAddContentBlock}
                >
                  <Plus size={16} color="#000" />
                  <Text style={styles.addBlockBtnText}>Thêm block</Text>
                </TouchableOpacity>
              </View>

              {contentBlocks.length === 0 ? (
                <View style={styles.emptyBlocksSmall}>
                  <Text style={styles.emptyBlocksHint}>
                    Block editor cho nội dung đơn giản
                  </Text>
                </View>
              ) : (
                <View style={styles.blocksList}>
                  {contentBlocks.map((block, index) => renderBlockEditor(block, index))}
                </View>
              )}
            </View>
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nội dung Quiz</Text>

            <TouchableOpacity
              style={styles.quizBuilderBtn}
              onPress={handleEditQuiz}
            >
              <HelpCircle size={24} color={COLORS.gold} />
              <View style={styles.quizBuilderInfo}>
                <Text style={styles.quizBuilderTitle}>Mở Quiz Builder</Text>
                <Text style={styles.quizBuilderHint}>
                  Tạo và chỉnh sửa câu hỏi quiz
                </Text>
              </View>
              <ExternalLink size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  // Render Images Tab content
  const renderImagesTab = () => (
    <View style={styles.imagesTabContent}>
      {/* Image Uploader */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tải lên hình ảnh</Text>
        <ImageUploader
          lessonId={lessonId}
          folderPath="lessons"
          onUploadComplete={handleUploadComplete}
          onOpenMediaLibrary={() => setMediaLibraryVisible(true)}
          onError={(error) => console.error('[LessonBuilderScreen] Upload error:', error)}
        />
      </View>

      {/* Lesson Images List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Hình ảnh trong bài ({lessonImages.length})
        </Text>
        <LessonImageList
          images={lessonImages}
          loading={imagesLoading}
          onUpdate={handleUpdateImage}
          onDelete={handleDeleteImage}
          onReorder={handleReorderImages}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.background} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Chỉnh sửa bài học
            </Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Save size={20} color="#000" />
              )}
            </TouchableOpacity>
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'content' && styles.tabActive]}
              onPress={() => setActiveTab('content')}
            >
              <FileText
                size={18}
                color={activeTab === 'content' ? COLORS.gold : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'content' && styles.tabTextActive,
                ]}
              >
                Nội dung
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'images' && styles.tabActive]}
              onPress={() => setActiveTab('images')}
            >
              <ImageIcon
                size={18}
                color={activeTab === 'images' ? COLORS.gold : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'images' && styles.tabTextActive,
                ]}
              >
                Hình ảnh
                {lessonImages.length > 0 && (
                  <Text style={styles.tabBadge}> ({lessonImages.length})</Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'content' ? (
                <>
              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên bài học *</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="VD: Bài 1 - Giới thiệu về Trading"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mô tả ngắn</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Mô tả nội dung bài học..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Lesson Type Indicator */}
                <View style={styles.typeIndicator}>
                  {type === 'video' && <Play size={18} color={COLORS.success} />}
                  {type === 'article' && <FileText size={18} color={COLORS.gold} />}
                  {type === 'quiz' && <HelpCircle size={18} color="#6A5BFF" />}
                  <Text style={styles.typeIndicatorText}>
                    Loại: {type === 'video' ? 'Video' : type === 'article' ? 'Bài viết' : 'Quiz'}
                  </Text>
                </View>

                {/* Preview Toggle */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Eye size={18} color={COLORS.textMuted} />
                    <View>
                      <Text style={styles.toggleLabel}>Cho phép xem thử</Text>
                      <Text style={styles.toggleHint}>
                        Người chưa đăng ký có thể xem bài này
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isPreview}
                    onValueChange={setIsPreview}
                    trackColor={{ false: GLASS.border, true: COLORS.gold }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Type-specific content */}
              {renderTypeContent()}

              {/* Attachments */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
                  <TouchableOpacity
                    style={[styles.addAttachmentBtn, uploading && styles.addAttachmentBtnDisabled]}
                    onPress={handleAddAttachment}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={COLORS.gold} />
                    ) : (
                      <Paperclip size={16} color={COLORS.gold} />
                    )}
                    <Text style={styles.addAttachmentText}>
                      {uploading ? 'Đang tải...' : 'Thêm file'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {attachments.length === 0 ? (
                  <View style={styles.noAttachmentsContainer}>
                    <Text style={styles.noAttachments}>
                      Chưa có tài liệu đính kèm
                    </Text>
                    <Text style={styles.attachmentHint}>
                      Hỗ trợ: PDF, Word, Excel, ZIP (tối đa 50MB)
                    </Text>
                  </View>
                ) : (
                  attachments.map(att => (
                    <View key={att.id} style={styles.attachmentItem}>
                      <Paperclip size={16} color={COLORS.textMuted} />
                      <View style={styles.attachmentInfo}>
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {att.file_name}
                        </Text>
                        {att.file_size && (
                          <Text style={styles.attachmentSize}>
                            {attachmentService.formatFileSize(att.file_size)}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.removeAttachmentBtn}
                        onPress={() => handleRemoveAttachment(att.id)}
                      >
                        <Trash2 size={14} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Bottom Spacer */}
              <View style={{ height: 100 }} />
                </>
              ) : (
                renderImagesTab()
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* Media Library Modal */}
      <MediaLibraryModal
        visible={mediaLibraryVisible}
        onClose={() => setMediaLibraryVisible(false)}
        onSelectImage={handleSelectFromLibrary}
        currentLessonImages={lessonImages}
      />

      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  saveBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Input
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 1,
  },
  input: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    paddingLeft: SPACING.md + 26,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Type Indicator
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  typeIndicatorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  toggleHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },

  // Quiz Builder
  quizBuilderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  quizBuilderInfo: {
    flex: 1,
  },
  quizBuilderTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  quizBuilderHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // HTML Section
  htmlSection: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  htmlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  htmlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  htmlTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  htmlActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  htmlActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
  },
  htmlActionSuccess: {
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
  },
  htmlActionError: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  htmlActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  htmlHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  htmlEditorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  htmlEditorToggleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  htmlCharCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  htmlEditorContainer: {
    marginTop: SPACING.sm,
  },
  htmlEditor: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  htmlEditorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  htmlClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  htmlClearText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
  htmlSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  htmlSaveBtnDisabled: {
    opacity: 0.5,
  },
  htmlSaveText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#000',
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  htmlPreviewIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.sm,
  },
  htmlPreviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
  },

  // Legacy Block Section
  legacyBlockSection: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    padding: SPACING.md,
    opacity: 0.7,
  },
  legacyBlockTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  emptyBlocksSmall: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },

  // Content Blocks
  addBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  addBlockBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#000',
  },
  emptyBlocks: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderStyle: 'dashed',
  },
  emptyBlocksText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptyBlocksHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  blocksList: {
    gap: SPACING.md,
  },
  blockCard: {
    backgroundColor: GLASS.background,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: 12,
    padding: SPACING.md,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  blockType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },

  // Attachments
  addAttachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAttachmentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  noAttachments: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: GLASS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  attachmentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  removeAttachmentBtn: {
    padding: 4,
    marginLeft: SPACING.xs,
  },
  addAttachmentBtnDisabled: {
    opacity: 0.6,
  },
  noAttachmentsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  attachmentHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  attachmentSize: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  tabBadge: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
  },

  // Images Tab
  imagesTabContent: {
    paddingBottom: 100,
  },
});

export default LessonBuilderScreen;

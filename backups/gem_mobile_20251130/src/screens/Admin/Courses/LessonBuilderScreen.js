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
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
} from 'lucide-react-native';

import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const LessonBuilderScreen = ({ navigation, route }) => {
  const { lessonId, courseId, moduleId, lessonType: initialType } = route.params || {};
  const { isAdmin } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(initialType || 'video');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load lesson data
  useEffect(() => {
    loadLessonData();
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
      setType(lesson.type || 'video');
      setVideoUrl(lesson.video_url || '');
      setDurationMinutes(lesson.duration_minutes?.toString() || '');
      setIsPreview(lesson.is_preview || false);
      setContentBlocks(lesson.content_blocks || []);

      // Load attachments
      const { data: attachmentsData } = await supabase
        .from('lesson_attachments')
        .select('*')
        .eq('lesson_id', lessonId);

      setAttachments(attachmentsData || []);
    } catch (error) {
      console.error('[LessonBuilderScreen] loadLessonData error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu bài học');
    } finally {
      setLoading(false);
    }
  };

  // Save lesson
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài học');
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

      Alert.alert('Thành công', 'Đã cập nhật bài học');
    } catch (error) {
      console.error('[LessonBuilderScreen] save error:', error);
      Alert.alert('Lỗi', 'Không thể lưu bài học');
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

  // State for upload progress
  const [uploading, setUploading] = useState(false);

  // Handle add attachment with DocumentPicker
  const handleAddAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/zip',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) return;

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        Alert.alert('Lỗi', 'File quá lớn. Kích thước tối đa là 50MB.');
        return;
      }

      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${lessonId}/${Date.now()}.${fileExt}`;

      // Read file as blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lesson-attachments')
        .upload(fileName, blob, {
          contentType: file.mimeType || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('[LessonBuilderScreen] Upload error:', uploadError);
        // If bucket doesn't exist, show helpful message
        if (uploadError.message?.includes('Bucket not found')) {
          Alert.alert(
            'Lỗi',
            'Storage bucket chưa được tạo.\n\nVui lòng tạo bucket "lesson-attachments" trong Supabase Dashboard → Storage.'
          );
        } else {
          Alert.alert('Lỗi', `Không thể upload file: ${uploadError.message}`);
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lesson-attachments')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data: attachmentData, error: dbError } = await supabase
        .from('lesson_attachments')
        .insert({
          lesson_id: lessonId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.mimeType || 'application/octet-stream',
          storage_path: fileName,
        })
        .select()
        .single();

      if (dbError) {
        console.error('[LessonBuilderScreen] DB error:', dbError);
        Alert.alert('Lỗi', 'Không thể lưu thông tin file');
        return;
      }

      // Update local state
      setAttachments(prev => [...prev, attachmentData]);
      Alert.alert('Thành công', `Đã tải lên: ${file.name}`);

    } catch (error) {
      console.error('[LessonBuilderScreen] handleAddAttachment error:', error);
      Alert.alert('Lỗi', 'Không thể tải file lên');
    } finally {
      setUploading(false);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = async (attachmentId) => {
    // Find attachment to get storage path
    const attachment = attachments.find(a => a.id === attachmentId);

    Alert.alert(
      'Xóa tài liệu',
      `Bạn có chắc muốn xóa "${attachment?.file_name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage if path exists
              if (attachment?.storage_path) {
                await supabase.storage
                  .from('lesson-attachments')
                  .remove([attachment.storage_path]);
              }

              // Delete from database
              const { error } = await supabase
                .from('lesson_attachments')
                .delete()
                .eq('id', attachmentId);

              if (error) throw error;

              setAttachments(prev => prev.filter(a => a.id !== attachmentId));
              Alert.alert('Thành công', 'Đã xóa tài liệu');
            } catch (error) {
              console.error('[LessonBuilderScreen] removeAttachment error:', error);
              Alert.alert('Lỗi', 'Không thể xóa tài liệu');
            }
          }
        }
      ]
    );
  };

  // Add content block (for article type)
  const handleAddContentBlock = () => {
    Alert.alert(
      'Thêm nội dung',
      'Chọn loại block:',
      [
        { text: 'Đoạn văn', onPress: () => addBlock('paragraph') },
        { text: 'Tiêu đề', onPress: () => addBlock('heading') },
        { text: 'Danh sách', onPress: () => addBlock('list') },
        { text: 'Callout', onPress: () => addBlock('callout') },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
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
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nội dung bài viết</Text>
              <TouchableOpacity
                style={styles.addBlockBtn}
                onPress={handleAddContentBlock}
              >
                <Plus size={16} color="#000" />
                <Text style={styles.addBlockBtnText}>Thêm block</Text>
              </TouchableOpacity>
            </View>

            {contentBlocks.length === 0 ? (
              <View style={styles.emptyBlocks}>
                <FileText size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyBlocksText}>Chưa có nội dung</Text>
                <Text style={styles.emptyBlocksHint}>
                  Nhấn "Thêm block" để bắt đầu viết
                </Text>
              </View>
            ) : (
              <View style={styles.blocksList}>
                {contentBlocks.map((block, index) => renderBlockEditor(block, index))}
              </View>
            )}
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

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
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
                            {formatFileSize(att.file_size)}
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
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
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
});

export default LessonBuilderScreen;

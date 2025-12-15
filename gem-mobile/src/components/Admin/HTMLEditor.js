/**
 * Gemral - HTML Editor Component
 * Rich text editor với toolbar cho admin content management
 * @description WYSIWYG editor với Bold, Italic, H1, H2, Link, List
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Link,
  Image,
  List,
  ListOrdered,
  Code,
  Eye,
  Columns,
  X,
  Check,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, INPUT, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// View modes
const VIEW_MODES = {
  CODE: 'code',
  VISUAL: 'visual',
  SPLIT: 'split',
};

// ========== TOOLBAR BUTTON ==========
const ToolbarButton = ({ icon: Icon, label, onPress, isActive }) => (
  <TouchableOpacity
    style={[styles.toolbarButton, isActive && styles.toolbarButtonActive]}
    onPress={onPress}
    accessibilityLabel={label}
  >
    <Icon
      size={18}
      color={isActive ? COLORS.gold : COLORS.textSecondary}
    />
  </TouchableOpacity>
);

// ========== LINK MODAL ==========
const LinkModal = ({ visible, onClose, onInsert }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), text.trim() || url.trim());
      setUrl('');
      setText('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chèn Link</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>URL *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://..."
              placeholderTextColor={COLORS.textMuted}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.inputLabel}>Văn bản hiển thị</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập văn bản (để trống = hiện URL)"
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={setText}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.insertButton} onPress={handleInsert}>
              <Check size={18} color={COLORS.bgDarkest} />
              <Text style={styles.insertButtonText}>Chèn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========== IMAGE MODAL ==========
const ImageModal = ({ visible, onClose, onInsert }) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), alt.trim());
      setUrl('');
      setAlt('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chèn Hình ảnh</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>URL Hình ảnh *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://..."
              placeholderTextColor={COLORS.textMuted}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.inputLabel}>Mô tả (Alt text)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Mô tả hình ảnh..."
              placeholderTextColor={COLORS.textMuted}
              value={alt}
              onChangeText={setAlt}
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.insertButton} onPress={handleInsert}>
              <Check size={18} color={COLORS.bgDarkest} />
              <Text style={styles.insertButtonText}>Chèn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========== MAIN COMPONENT ==========
const HTMLEditor = ({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung HTML...',
  minHeight = 200,
  maxHeight = 400,
  showToolbar = true,
  defaultMode = VIEW_MODES.CODE,
}) => {
  const [html, setHtml] = useState(value);
  const [viewMode, setViewMode] = useState(defaultMode);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef(null);

  // Sync with external value
  useEffect(() => {
    if (value !== html) {
      setHtml(value);
    }
  }, [value]);

  // Update parent
  const handleChange = useCallback((newHtml) => {
    setHtml(newHtml);
    onChange?.(newHtml);
  }, [onChange]);

  // Insert tag at cursor position
  const insertTag = useCallback((openTag, closeTag = '') => {
    const before = html.substring(0, selection.start);
    const selected = html.substring(selection.start, selection.end);
    const after = html.substring(selection.end);

    let newHtml;
    if (selected) {
      // Wrap selected text
      newHtml = `${before}${openTag}${selected}${closeTag}${after}`;
    } else {
      // Insert at cursor
      newHtml = `${before}${openTag}${closeTag}${after}`;
    }

    handleChange(newHtml);
  }, [html, selection, handleChange]);

  // Toolbar actions
  const handleBold = () => insertTag('<strong>', '</strong>');
  const handleItalic = () => insertTag('<em>', '</em>');
  const handleUnderline = () => insertTag('<u>', '</u>');
  const handleH1 = () => insertTag('<h1>', '</h1>');
  const handleH2 = () => insertTag('<h2>', '</h2>');
  const handleList = () => insertTag('<ul>\n  <li>', '</li>\n</ul>');
  const handleOrderedList = () => insertTag('<ol>\n  <li>', '</li>\n</ol>');

  const handleLink = (url, text) => {
    const linkHtml = `<a href="${url}">${text}</a>`;
    const before = html.substring(0, selection.start);
    const after = html.substring(selection.end);
    handleChange(`${before}${linkHtml}${after}`);
  };

  const handleImage = (url, alt) => {
    const imgHtml = `<img src="${url}" alt="${alt || ''}" />`;
    const before = html.substring(0, selection.start);
    const after = html.substring(selection.end);
    handleChange(`${before}${imgHtml}${after}`);
  };

  // HTML Preview
  const previewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #FFFFFF;
          background-color: #0F1030;
          padding: 12px;
          margin: 0;
        }
        h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; color: #FFBD59; }
        h2 { font-size: 20px; font-weight: 600; margin: 14px 0 6px; color: #FFBD59; }
        p { margin: 0 0 12px; }
        a { color: #00F0FF; text-decoration: none; }
        a:hover { text-decoration: underline; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
        ul, ol { margin: 8px 0; padding-left: 24px; }
        li { margin: 4px 0; }
        strong { font-weight: 700; }
        em { font-style: italic; }
        u { text-decoration: underline; }
        pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; }
        code { font-family: monospace; background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      ${html || '<p style="color: rgba(255,255,255,0.5);">Xem trước nội dung...</p>'}
    </body>
    </html>
  `;

  // Render toolbar
  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.toolbarGroup}>
          <ToolbarButton icon={Bold} label="Bold" onPress={handleBold} />
          <ToolbarButton icon={Italic} label="Italic" onPress={handleItalic} />
          <ToolbarButton icon={Underline} label="Underline" onPress={handleUnderline} />
        </View>

        <View style={styles.toolbarDivider} />

        <View style={styles.toolbarGroup}>
          <ToolbarButton icon={Heading1} label="Heading 1" onPress={handleH1} />
          <ToolbarButton icon={Heading2} label="Heading 2" onPress={handleH2} />
        </View>

        <View style={styles.toolbarDivider} />

        <View style={styles.toolbarGroup}>
          <ToolbarButton icon={List} label="Bullet List" onPress={handleList} />
          <ToolbarButton icon={ListOrdered} label="Numbered List" onPress={handleOrderedList} />
        </View>

        <View style={styles.toolbarDivider} />

        <View style={styles.toolbarGroup}>
          <ToolbarButton icon={Link} label="Link" onPress={() => setShowLinkModal(true)} />
          <ToolbarButton icon={Image} label="Image" onPress={() => setShowImageModal(true)} />
        </View>
      </ScrollView>

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === VIEW_MODES.CODE && styles.viewModeButtonActive]}
          onPress={() => setViewMode(VIEW_MODES.CODE)}
        >
          <Code size={16} color={viewMode === VIEW_MODES.CODE ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === VIEW_MODES.VISUAL && styles.viewModeButtonActive]}
          onPress={() => setViewMode(VIEW_MODES.VISUAL)}
        >
          <Eye size={16} color={viewMode === VIEW_MODES.VISUAL ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === VIEW_MODES.SPLIT && styles.viewModeButtonActive]}
          onPress={() => setViewMode(VIEW_MODES.SPLIT)}
        >
          <Columns size={16} color={viewMode === VIEW_MODES.SPLIT ? COLORS.gold : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render code editor
  const renderCodeEditor = () => (
    <TextInput
      ref={inputRef}
      style={[styles.codeInput, { minHeight, maxHeight }]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      value={html}
      onChangeText={handleChange}
      onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
      multiline
      textAlignVertical="top"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );

  // Render visual preview
  const renderVisualPreview = () => (
    <View style={[styles.previewContainer, { minHeight, maxHeight }]}>
      <WebView
        source={{ html: previewHtml }}
        style={styles.webView}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );

  // Render split view
  const renderSplitView = () => (
    <View style={styles.splitContainer}>
      <View style={[styles.splitPane, { maxHeight: maxHeight / 2 }]}>
        <Text style={styles.splitLabel}>Code</Text>
        <TextInput
          style={[styles.codeInput, styles.splitInput]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={html}
          onChangeText={handleChange}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={styles.splitDivider} />
      <View style={[styles.splitPane, { maxHeight: maxHeight / 2 }]}>
        <Text style={styles.splitLabel}>Xem trước</Text>
        <WebView
          source={{ html: previewHtml }}
          style={styles.webView}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {showToolbar && renderToolbar()}

      <View style={styles.editorContainer}>
        {viewMode === VIEW_MODES.CODE && renderCodeEditor()}
        {viewMode === VIEW_MODES.VISUAL && renderVisualPreview()}
        {viewMode === VIEW_MODES.SPLIT && renderSplitView()}
      </View>

      {/* Modals */}
      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleLink}
      />
      <ImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleImage}
      />
    </View>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    backgroundColor: INPUT.background,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.sm,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.xs,
  },
  toolbarButtonActive: {
    backgroundColor: 'rgba(255,189,89,0.2)',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: SPACING.xs,
    padding: 2,
  },
  viewModeButton: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.xs - 2,
  },
  viewModeButtonActive: {
    backgroundColor: 'rgba(255,189,89,0.2)',
  },
  editorContainer: {
    flex: 1,
  },
  codeInput: {
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  splitContainer: {
    flex: 1,
  },
  splitPane: {
    flex: 1,
  },
  splitLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
  },
  splitInput: {
    flex: 1,
    minHeight: 100,
  },
  splitDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.bgMid,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106,91,255,0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textSecondary,
  },
  insertButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.gold,
    gap: SPACING.xs,
  },
  insertButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
});

export { HTMLEditor, VIEW_MODES };
export default HTMLEditor;

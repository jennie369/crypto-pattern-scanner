/**
 * Gemral - Rich Text Editor Component
 * Feature #23: Advanced text editing with formatting
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Heading1,
  Heading2,
  AtSign,
  Hash,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';

const RichTextEditor = ({
  value,
  onChangeText,
  placeholder = 'Viết nội dung...',
  minHeight = 150,
  maxHeight = 400,
  onMentionSearch,
  onHashtagSearch,
}) => {
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showToolbar, setShowToolbar] = useState(true);
  const inputRef = useRef(null);

  // Apply formatting to selected text or insert at cursor
  const applyFormat = useCallback((format) => {
    const text = value || '';
    const { start, end } = selection;
    const selectedText = text.slice(start, end);

    let newText = text;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newText = `${text.slice(0, start)}**${selectedText}**${text.slice(end)}`;
          newCursorPos = end + 4;
        } else {
          newText = `${text.slice(0, start)}****${text.slice(end)}`;
          newCursorPos = start + 2;
        }
        break;

      case 'italic':
        if (selectedText) {
          newText = `${text.slice(0, start)}_${selectedText}_${text.slice(end)}`;
          newCursorPos = end + 2;
        } else {
          newText = `${text.slice(0, start)}__${text.slice(end)}`;
          newCursorPos = start + 1;
        }
        break;

      case 'underline':
        if (selectedText) {
          newText = `${text.slice(0, start)}<u>${selectedText}</u>${text.slice(end)}`;
          newCursorPos = end + 7;
        } else {
          newText = `${text.slice(0, start)}<u></u>${text.slice(end)}`;
          newCursorPos = start + 3;
        }
        break;

      case 'strikethrough':
        if (selectedText) {
          newText = `${text.slice(0, start)}~~${selectedText}~~${text.slice(end)}`;
          newCursorPos = end + 4;
        } else {
          newText = `${text.slice(0, start)}~~~~${text.slice(end)}`;
          newCursorPos = start + 2;
        }
        break;

      case 'heading1':
        newText = `${text.slice(0, start)}# ${selectedText || 'Tiêu đề'}${text.slice(end)}`;
        newCursorPos = start + 2 + (selectedText.length || 7);
        break;

      case 'heading2':
        newText = `${text.slice(0, start)}## ${selectedText || 'Tiêu đề'}${text.slice(end)}`;
        newCursorPos = start + 3 + (selectedText.length || 7);
        break;

      case 'quote':
        newText = `${text.slice(0, start)}> ${selectedText || 'Trích dẫn'}${text.slice(end)}`;
        newCursorPos = start + 2 + (selectedText.length || 9);
        break;

      case 'code':
        if (selectedText) {
          if (selectedText.includes('\n')) {
            newText = `${text.slice(0, start)}\`\`\`\n${selectedText}\n\`\`\`${text.slice(end)}`;
            newCursorPos = end + 8;
          } else {
            newText = `${text.slice(0, start)}\`${selectedText}\`${text.slice(end)}`;
            newCursorPos = end + 2;
          }
        } else {
          newText = `${text.slice(0, start)}\`\`${text.slice(end)}`;
          newCursorPos = start + 1;
        }
        break;

      case 'bullet':
        newText = `${text.slice(0, start)}\n- ${selectedText || 'Mục'}${text.slice(end)}`;
        newCursorPos = start + 3 + (selectedText.length || 3);
        break;

      case 'numbered':
        newText = `${text.slice(0, start)}\n1. ${selectedText || 'Mục'}${text.slice(end)}`;
        newCursorPos = start + 4 + (selectedText.length || 3);
        break;

      case 'link':
        if (selectedText) {
          newText = `${text.slice(0, start)}[${selectedText}](url)${text.slice(end)}`;
          newCursorPos = end + 7;
        } else {
          newText = `${text.slice(0, start)}[tên](url)${text.slice(end)}`;
          newCursorPos = start + 5;
        }
        break;

      case 'mention':
        newText = `${text.slice(0, start)}@${text.slice(end)}`;
        newCursorPos = start + 1;
        break;

      case 'hashtag':
        newText = `${text.slice(0, start)}#${text.slice(end)}`;
        newCursorPos = start + 1;
        break;

      default:
        return;
    }

    onChangeText?.(newText);

    // Move cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          selection: { start: newCursorPos, end: newCursorPos },
        });
      }
    }, 50);
  }, [value, selection, onChangeText]);

  const handleSelectionChange = (event) => {
    setSelection(event.nativeEvent.selection);
  };

  const toolbarItems = [
    { icon: Bold, format: 'bold', label: 'Đậm' },
    { icon: Italic, format: 'italic', label: 'Nghiêng' },
    { icon: Underline, format: 'underline', label: 'Gạch chân' },
    { icon: Strikethrough, format: 'strikethrough', label: 'Gạch ngang' },
    { type: 'separator' },
    { icon: Heading1, format: 'heading1', label: 'Tiêu đề 1' },
    { icon: Heading2, format: 'heading2', label: 'Tiêu đề 2' },
    { type: 'separator' },
    { icon: List, format: 'bullet', label: 'Danh sách' },
    { icon: ListOrdered, format: 'numbered', label: 'Danh sách số' },
    { type: 'separator' },
    { icon: Quote, format: 'quote', label: 'Trích dẫn' },
    { icon: Code, format: 'code', label: 'Code' },
    { icon: Link, format: 'link', label: 'Liên kết' },
    { type: 'separator' },
    { icon: AtSign, format: 'mention', label: 'Nhắc đến' },
    { icon: Hash, format: 'hashtag', label: 'Hashtag' },
  ];

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      {showToolbar && (
        <View style={styles.toolbar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            {toolbarItems.map((item, index) => {
              if (item.type === 'separator') {
                return <View key={index} style={styles.separator} />;
              }

              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.format}
                  style={styles.toolbarButton}
                  onPress={() => applyFormat(item.format)}
                  activeOpacity={0.7}
                >
                  <Icon size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <TextInput
        ref={inputRef}
        style={[styles.input, { minHeight, maxHeight }]}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline
        textAlignVertical="top"
        selectionColor={COLORS.purple}
        onFocus={() => setShowToolbar(true)}
      />

      {/* Character count */}
      {value && value.length > 0 && (
        <View style={styles.charCount}>
          <Text style={styles.charCountText}>{value.length}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Rich Text Renderer - Renders formatted text
 */
export const RichTextRenderer = ({ content, style }) => {
  if (!content) return null;

  // Parse markdown-like syntax
  const parseContent = (text) => {
    const parts = [];
    let currentIndex = 0;

    // Bold: **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    // Italic: _text_
    const italicRegex = /_([^_]+)_/g;
    // Strikethrough: ~~text~~
    const strikeRegex = /~~([^~]+)~~/g;
    // Code: `text`
    const codeRegex = /`([^`]+)`/g;
    // Heading: # text
    const heading1Regex = /^# (.+)$/gm;
    const heading2Regex = /^## (.+)$/gm;
    // Quote: > text
    const quoteRegex = /^> (.+)$/gm;
    // Links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    // Mentions: @username
    const mentionRegex = /@(\w+)/g;
    // Hashtags: #tag
    const hashtagRegex = /#(\w+)/g;

    // For simplicity, just return styled Text components
    // A full implementation would parse and render each format

    return (
      <Text style={[rendererStyles.text, style]}>
        {text}
      </Text>
    );
  };

  return parseContent(content);
};

/**
 * Format Help Component
 */
export const FormatHelp = () => {
  const formats = [
    { syntax: '**đậm**', result: 'đậm', label: 'In đậm' },
    { syntax: '_nghiêng_', result: 'nghiêng', label: 'In nghiêng' },
    { syntax: '~~gạch~~', result: 'gạch', label: 'Gạch ngang' },
    { syntax: '`code`', result: 'code', label: 'Code' },
    { syntax: '# Tiêu đề', result: 'Tiêu đề', label: 'Tiêu đề' },
    { syntax: '> Trích dẫn', result: 'Trích dẫn', label: 'Trích dẫn' },
    { syntax: '[tên](url)', result: 'liên kết', label: 'Liên kết' },
    { syntax: '@username', result: '@username', label: 'Nhắc đến' },
    { syntax: '#hashtag', result: '#hashtag', label: 'Hashtag' },
  ];

  return (
    <View style={helpStyles.container}>
      <Text style={helpStyles.title}>Hướng dẫn định dạng</Text>
      {formats.map((format, index) => (
        <View key={index} style={helpStyles.row}>
          <Text style={helpStyles.syntax}>{format.syntax}</Text>
          <Text style={helpStyles.arrow}>→</Text>
          <Text style={helpStyles.result}>{format.result}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    overflow: 'hidden',
  },
  // Toolbar
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: GLASS.background,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  toolbarButton: {
    padding: SPACING.sm,
    borderRadius: 6,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.xs,
  },
  // Input
  input: {
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  // Character count
  charCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  charCountText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
});

const rendererStyles = StyleSheet.create({
  text: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  heading1: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  heading2: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
    paddingLeft: SPACING.md,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.cyan,
    textDecorationLine: 'underline',
  },
  mention: {
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  hashtag: {
    color: COLORS.purple,
  },
});

const helpStyles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: GLASS.background,
    borderRadius: 12,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  syntax: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    flex: 1,
  },
  arrow: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  result: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
});

export default RichTextEditor;

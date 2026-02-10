/**
 * Gemral - Rich Text Editor Component
 * Feature #23: Advanced text editing with formatting
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import { useSettings } from '../contexts/SettingsContext';

const RichTextEditor = ({
  value,
  onChangeText,
  placeholder = 'Viet noi dung...',
  minHeight = 150,
  maxHeight = 400,
  onMentionSearch,
  onHashtagSearch,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
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
        newText = `${text.slice(0, start)}# ${selectedText || 'Tieu de'}${text.slice(end)}`;
        newCursorPos = start + 2 + (selectedText.length || 7);
        break;

      case 'heading2':
        newText = `${text.slice(0, start)}## ${selectedText || 'Tieu de'}${text.slice(end)}`;
        newCursorPos = start + 3 + (selectedText.length || 7);
        break;

      case 'quote':
        newText = `${text.slice(0, start)}> ${selectedText || 'Trich dan'}${text.slice(end)}`;
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
        newText = `${text.slice(0, start)}\n- ${selectedText || 'Muc'}${text.slice(end)}`;
        newCursorPos = start + 3 + (selectedText.length || 3);
        break;

      case 'numbered':
        newText = `${text.slice(0, start)}\n1. ${selectedText || 'Muc'}${text.slice(end)}`;
        newCursorPos = start + 4 + (selectedText.length || 3);
        break;

      case 'link':
        if (selectedText) {
          newText = `${text.slice(0, start)}[${selectedText}](url)${text.slice(end)}`;
          newCursorPos = end + 7;
        } else {
          newText = `${text.slice(0, start)}[ten](url)${text.slice(end)}`;
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
    { icon: Bold, format: 'bold', label: 'Dam' },
    { icon: Italic, format: 'italic', label: 'Nghieng' },
    { icon: Underline, format: 'underline', label: 'Gach chan' },
    { icon: Strikethrough, format: 'strikethrough', label: 'Gach ngang' },
    { type: 'separator' },
    { icon: Heading1, format: 'heading1', label: 'Tieu de 1' },
    { icon: Heading2, format: 'heading2', label: 'Tieu de 2' },
    { type: 'separator' },
    { icon: List, format: 'bullet', label: 'Danh sach' },
    { icon: ListOrdered, format: 'numbered', label: 'Danh sach so' },
    { type: 'separator' },
    { icon: Quote, format: 'quote', label: 'Trich dan' },
    { icon: Code, format: 'code', label: 'Code' },
    { icon: Link, format: 'link', label: 'Lien ket' },
    { type: 'separator' },
    { icon: AtSign, format: 'mention', label: 'Nhac den' },
    { icon: Hash, format: 'hashtag', label: 'Hashtag' },
  ];

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: glass.border || 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
    },
    // Toolbar
    toolbar: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: glass.background || 'rgba(15, 16, 48, 0.95)',
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
      color: colors.textPrimary,
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
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
                  <Icon size={18} color={colors.textSecondary} />
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
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        selectionColor={colors.purple}
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
 * Rich Text Renderer - Renders formatted text with markdown support
 */
export const RichTextRenderer = ({ content, style }) => {
  const { colors, glass, SPACING, TYPOGRAPHY } = useSettings();

  const rendererStyles = useMemo(() => StyleSheet.create({
    container: {
      gap: 6,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      lineHeight: 22,
    },
    bold: {
      fontWeight: 'bold',
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
      fontSize: TYPOGRAPHY.fontSize['2xl'] || 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    heading2: {
      fontSize: TYPOGRAPHY.fontSize.xl || 20,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    quoteContainer: {
      borderLeftWidth: 3,
      borderLeftColor: colors.purple,
      paddingLeft: SPACING.md,
      marginVertical: SPACING.xs,
    },
    quote: {
      fontStyle: 'italic',
      color: colors.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.md,
      lineHeight: 22,
    },
    link: {
      color: colors.cyan,
      textDecorationLine: 'underline',
    },
    mention: {
      color: colors.cyan,
      fontWeight: '500',
    },
    hashtag: {
      color: colors.purple,
    },
    // Checkbox styles
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 2,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.textMuted,
      marginRight: SPACING.sm,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.success || '#22c55e',
      borderColor: colors.success || '#22c55e',
    },
    checkmark: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    checkboxTextChecked: {
      color: colors.textPrimary,
    },
    // Bullet styles
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 2,
    },
    bullet: {
      color: colors.purple,
      fontSize: TYPOGRAPHY.fontSize.md,
      marginRight: SPACING.sm,
      marginTop: 0,
    },
    bulletText: {
      flex: 1,
    },
    // Empty line
    emptyLine: {
      height: 8,
    },
  }), [colors, glass, SPACING, TYPOGRAPHY]);

  if (!content) return null;

  // Parse inline markdown (bold, italic, code, etc.)
  const parseInlineMarkdown = (text, baseStyle = {}) => {
    if (!text) return null;

    const elements = [];
    let remaining = text;
    let keyIndex = 0;

    // Process inline patterns
    while (remaining.length > 0) {
      // Bold: **text** or ***text***
      const boldMatch = remaining.match(/^\*\*\*?([^*]+)\*\*\*?/);
      if (boldMatch) {
        elements.push(
          <Text key={keyIndex++} style={[baseStyle, rendererStyles.bold]}>
            {parseInlineMarkdown(boldMatch[1], { ...baseStyle, fontWeight: 'bold' })}
          </Text>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: _text_
      const italicMatch = remaining.match(/^_([^_]+)_/);
      if (italicMatch) {
        elements.push(
          <Text key={keyIndex++} style={[baseStyle, rendererStyles.italic]}>
            {italicMatch[1]}
          </Text>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/^~~([^~]+)~~/);
      if (strikeMatch) {
        elements.push(
          <Text key={keyIndex++} style={[baseStyle, rendererStyles.strikethrough]}>
            {strikeMatch[1]}
          </Text>
        );
        remaining = remaining.slice(strikeMatch[0].length);
        continue;
      }

      // Code: `text`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        elements.push(
          <Text key={keyIndex++} style={[baseStyle, rendererStyles.code]}>
            {codeMatch[1]}
          </Text>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Regular character
      const nextSpecial = remaining.search(/(\*\*|_[^_]|~~|`)/);
      if (nextSpecial === -1) {
        elements.push(<Text key={keyIndex++} style={baseStyle}>{remaining}</Text>);
        break;
      } else if (nextSpecial === 0) {
        // If we reach here, the pattern didn't match (e.g., single * or unmatched)
        elements.push(<Text key={keyIndex++} style={baseStyle}>{remaining[0]}</Text>);
        remaining = remaining.slice(1);
      } else {
        elements.push(<Text key={keyIndex++} style={baseStyle}>{remaining.slice(0, nextSpecial)}</Text>);
        remaining = remaining.slice(nextSpecial);
      }
    }

    return elements.length === 1 ? elements[0] : elements;
  };

  // Parse block-level markdown (lines)
  const parseBlockMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Checkbox checked: - [x] text
      if (trimmedLine.match(/^-\s*\[x\]\s*/i)) {
        const contentText = trimmedLine.replace(/^-\s*\[x\]\s*/i, '');
        elements.push(
          <View key={index} style={rendererStyles.checkboxRow}>
            <View style={[rendererStyles.checkbox, rendererStyles.checkboxChecked]}>
              <Text style={rendererStyles.checkmark}>+</Text>
            </View>
            <Text style={[rendererStyles.text, rendererStyles.checkboxTextChecked, style]}>
              {parseInlineMarkdown(contentText)}
            </Text>
          </View>
        );
        return;
      }

      // Checkbox unchecked: - [ ] text
      if (trimmedLine.match(/^-\s*\[\s*\]\s*/)) {
        const contentText = trimmedLine.replace(/^-\s*\[\s*\]\s*/, '');
        elements.push(
          <View key={index} style={rendererStyles.checkboxRow}>
            <View style={rendererStyles.checkbox} />
            <Text style={[rendererStyles.text, style]}>
              {parseInlineMarkdown(contentText)}
            </Text>
          </View>
        );
        return;
      }

      // Bullet point: - text
      if (trimmedLine.match(/^-\s+/)) {
        const contentText = trimmedLine.replace(/^-\s+/, '');
        elements.push(
          <View key={index} style={rendererStyles.bulletRow}>
            <Text style={[rendererStyles.bullet, style]}>*</Text>
            <Text style={[rendererStyles.text, rendererStyles.bulletText, style]}>
              {parseInlineMarkdown(contentText)}
            </Text>
          </View>
        );
        return;
      }

      // Heading 1: # text
      if (trimmedLine.match(/^#\s+/)) {
        const contentText = trimmedLine.replace(/^#\s+/, '');
        elements.push(
          <Text key={index} style={[rendererStyles.heading1, style]}>
            {parseInlineMarkdown(contentText)}
          </Text>
        );
        return;
      }

      // Heading 2: ## text
      if (trimmedLine.match(/^##\s+/)) {
        const contentText = trimmedLine.replace(/^##\s+/, '');
        elements.push(
          <Text key={index} style={[rendererStyles.heading2, style]}>
            {parseInlineMarkdown(contentText)}
          </Text>
        );
        return;
      }

      // Quote: > text
      if (trimmedLine.match(/^>\s*/)) {
        const contentText = trimmedLine.replace(/^>\s*/, '');
        elements.push(
          <View key={index} style={rendererStyles.quoteContainer}>
            <Text style={[rendererStyles.quote, style]}>
              {parseInlineMarkdown(contentText)}
            </Text>
          </View>
        );
        return;
      }

      // Regular line (or empty line for spacing)
      if (trimmedLine) {
        elements.push(
          <Text key={index} style={[rendererStyles.text, style]}>
            {parseInlineMarkdown(trimmedLine)}
          </Text>
        );
      } else if (index > 0 && index < lines.length - 1) {
        // Empty line - add spacing
        elements.push(<View key={index} style={rendererStyles.emptyLine} />);
      }
    });

    return elements;
  };

  return <View style={rendererStyles.container}>{parseBlockMarkdown(content)}</View>;
};

/**
 * Format Help Component
 */
export const FormatHelp = () => {
  const { colors, glass, SPACING, TYPOGRAPHY } = useSettings();

  const helpStyles = useMemo(() => StyleSheet.create({
    container: {
      padding: SPACING.md,
      backgroundColor: glass.background || 'rgba(15, 16, 48, 0.95)',
      borderRadius: 12,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    syntax: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontFamily: 'monospace',
      flex: 1,
    },
    arrow: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginHorizontal: SPACING.sm,
    },
    result: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
      flex: 1,
    },
  }), [colors, glass, SPACING, TYPOGRAPHY]);

  const formats = [
    { syntax: '**dam**', result: 'dam', label: 'In dam' },
    { syntax: '_nghieng_', result: 'nghieng', label: 'In nghieng' },
    { syntax: '~~gach~~', result: 'gach', label: 'Gach ngang' },
    { syntax: '`code`', result: 'code', label: 'Code' },
    { syntax: '# Tieu de', result: 'Tieu de', label: 'Tieu de' },
    { syntax: '> Trich dan', result: 'Trich dan', label: 'Trich dan' },
    { syntax: '[ten](url)', result: 'lien ket', label: 'Lien ket' },
    { syntax: '@username', result: '@username', label: 'Nhac den' },
    { syntax: '#hashtag', result: '#hashtag', label: 'Hashtag' },
  ];

  return (
    <View style={helpStyles.container}>
      <Text style={helpStyles.title}>Huong dan dinh dang</Text>
      {formats.map((format, index) => (
        <View key={index} style={helpStyles.row}>
          <Text style={helpStyles.syntax}>{format.syntax}</Text>
          <Text style={helpStyles.arrow}>-></Text>
          <Text style={helpStyles.result}>{format.result}</Text>
        </View>
      ))}
    </View>
  );
};

export default RichTextEditor;

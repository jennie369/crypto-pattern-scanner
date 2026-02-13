/**
 * Gemral - Mention Input Component
 * Text input with @mention autocomplete support
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Keyboard,
} from 'react-native';
import { AtSign, User } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, INPUT } from '../utils/tokens';
import { searchService } from '../services/searchService';

const MentionInput = ({
  value,
  onChangeText,
  placeholder = 'Viết nội dung...',
  style,
  multiline = true,
  numberOfLines = 4,
  maxLength,
  onFocus,
  onBlur,
  autoFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Detect @ mentions while typing
  const handleTextChange = useCallback((text) => {
    onChangeText?.(text);

    // Find the @ character before cursor
    const textBeforeCursor = text.slice(0, cursorPosition + 1);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      const textAfterAt = text.slice(lastAtIndex + 1, cursorPosition + 1);
      const spaceIndex = textAfterAt.indexOf(' ');

      // If no space after @, we're in mention mode
      if (spaceIndex === -1 && textAfterAt.length <= 20) {
        setMentionStartIndex(lastAtIndex);
        setMentionQuery(textAfterAt);

        // Debounce search
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        if (textAfterAt.length >= 1) {
          debounceTimer.current = setTimeout(() => {
            searchUsers(textAfterAt);
          }, 300);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        closeSuggestions();
      }
    } else {
      closeSuggestions();
    }
  }, [cursorPosition, onChangeText]);

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const results = await searchService.searchUsers(query, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('[MentionInput] Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  const handleSelectUser = (user) => {
    if (mentionStartIndex < 0) return;

    const username = user.full_name || user.email?.split('@')[0] || 'user';
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + mentionQuery.length + 1);
    const newText = `${beforeMention}@${username} ${afterMention}`;

    onChangeText?.(newText);
    closeSuggestions();

    // Move cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = mentionStartIndex + username.length + 2;
        inputRef.current.setNativeProps({
          selection: { start: newCursorPos, end: newCursorPos },
        });
      }
    }, 50);
  };

  const handleSelectionChange = (event) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!showSuggestions) {
        onBlur?.();
      }
    }, 200);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Render user suggestion item
  const renderSuggestion = ({ item }) => {
    const displayName = item.full_name || item.email?.split('@')[0] || 'User';
    const avatarUrl = item.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6A5BFF&color=fff`;

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelectUser(item)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: avatarUrl }} style={styles.suggestionAvatar} />
        <View style={styles.suggestionInfo}>
          <Text style={styles.suggestionName}>{displayName}</Text>
          {item.email && (
            <Text style={styles.suggestionEmail}>@{item.email.split('@')[0]}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, style]}
        value={value}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoFocus={autoFocus}
        selectionColor={COLORS.purple}
        textAlignVertical="top"
      />

      {/* Mention Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <AtSign size={14} color={COLORS.cyan} />
            <Text style={styles.suggestionsTitle}>Gợi ý người dùng</Text>
          </View>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Utility function to render text with clickable mentions
 */
export const renderTextWithMentions = (text, onMentionPress, textStyle) => {
  if (!text) return null;

  // Match @username patterns
  const mentionRegex = /@([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add mention
    parts.push({
      type: 'mention',
      content: match[0],
      username: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  if (parts.length === 0) {
    return <Text style={textStyle}>{text}</Text>;
  }

  return (
    <Text style={textStyle}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <Text
              key={`mention-${index}`}
              style={styles.mentionText}
              onPress={() => onMentionPress?.(part.username)}
            >
              {part.content}
            </Text>
          );
        }
        return <Text key={`text-${index}`}>{part.content}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: INPUT.background,
    borderRadius: INPUT.borderRadius,
    borderWidth: 1,
    borderColor: INPUT.borderColor,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  // Suggestions
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    marginBottom: SPACING.xs,
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    overflow: 'hidden',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.xs,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  suggestionsList: {
    maxHeight: 160,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg,
    marginRight: SPACING.sm,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  suggestionEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  // Mention text style
  mentionText: {
    color: COLORS.cyan,
    fontWeight: '600',
  },
});

export default MentionInput;

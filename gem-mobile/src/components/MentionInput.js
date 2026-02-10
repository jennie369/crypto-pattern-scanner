/**
 * Gemral - Mention Input Component
 * Text input with @mention autocomplete support
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import { AtSign, User } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';
import { searchService } from '../services/searchService';

const MentionInput = ({
  value,
  onChangeText,
  placeholder = 'Viet noi dung...',
  style,
  multiline = true,
  numberOfLines = 4,
  maxLength,
  onFocus,
  onBlur,
  autoFocus = false,
  triggerMention = false, // External trigger to insert @ and show suggestions
  onTriggerMentionHandled, // Callback when trigger is handled
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Handle external trigger to insert @ and show mention dropdown
  useEffect(() => {
    if (triggerMention) {
      // Focus input first
      inputRef.current?.focus();

      // Insert @ at cursor position
      const newText = value
        ? value.slice(0, cursorPosition) + '@' + value.slice(cursorPosition)
        : '@';

      onChangeText?.(newText);

      // Set mention state to trigger dropdown
      setMentionStartIndex(cursorPosition);
      setMentionQuery('');

      // Load initial suggestions (show recent or popular users)
      searchUsers('');

      // Notify parent that trigger was handled
      onTriggerMentionHandled?.();
    }
  }, [triggerMention]);

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

        // Search for users - show all followed users if no query yet
        debounceTimer.current = setTimeout(() => {
          searchUsers(textAfterAt);
        }, textAfterAt.length === 0 ? 100 : 300);
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
      // Search users that current user follows (or all users if not following anyone)
      const searchQuery = query || '';
      const results = await searchService.searchFollowedUsers(searchQuery, 10);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('[MentionInput] Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
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

    // PRIVACY: Use display_name, full_name, or username only - NEVER email
    const displayName = user.display_name || user.full_name || user.username;
    if (!displayName) {
      console.error('[MentionInput] User has no display name, username, or full_name - cannot create mention');
      closeSuggestions();
      return;
    }

    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + mentionQuery.length + 1);
    const newText = `${beforeMention}@${displayName} ${afterMention}`;

    onChangeText?.(newText);
    closeSuggestions();

    // Move cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = mentionStartIndex + displayName.length + 2;
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'relative',
    },
    input: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: glass.border || 'rgba(255, 255, 255, 0.1)',
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textPrimary,
      minHeight: 100,
    },
    // Suggestions - Position below the input instead of above to avoid overflow issues
    suggestionsContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '100%',
      marginTop: SPACING.xs,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : 'rgba(20, 20, 35, 0.98)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(106, 91, 255, 0.3)',
      overflow: 'hidden',
      maxHeight: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 9999,
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
      color: colors.textMuted,
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
      backgroundColor: colors.glassBg,
      marginRight: SPACING.sm,
    },
    suggestionInfo: {
      flex: 1,
    },
    suggestionName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textPrimary,
    },
    suggestionUsername: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    // Mention text style
    mentionText: {
      color: colors.cyan,
      fontWeight: '600',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoFocus={autoFocus}
        selectionColor={colors.purple}
        textAlignVertical="top"
      />

      {/* Mention Suggestions - Using ScrollView + map instead of FlatList to avoid VirtualizedList nesting warning */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <AtSign size={14} color={colors.cyan} />
            <Text style={styles.suggestionsTitle}>Goi y nguoi dung</Text>
          </View>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item) => {
              // PRIVACY: Use display_name, full_name, or username only - NEVER email
              const displayName = item.display_name || item.full_name || item.username;
              const username = item.username;

              // PRIVACY: Skip rendering users without proper name data
              if (!displayName) {
                console.error('[MentionInput] User has no display name - skipping render', item.id);
                return null;
              }

              const avatarUrl = item.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6A5BFF&color=fff`;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectUser(item)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: avatarUrl }} style={styles.suggestionAvatar} />
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName}>{displayName}</Text>
                    {username && (
                      <Text style={styles.suggestionUsername}>@{username}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

/**
 * Utility function to render text with clickable mentions
 */
export const renderTextWithMentions = (text, onMentionPress, textStyle, mentionStyle) => {
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
              style={mentionStyle || { color: '#00D9FF', fontWeight: '600' }}
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

export default MentionInput;

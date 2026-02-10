/**
 * Gemral - Search Bar Component
 * Reusable search input with suggestions
 * Uses design tokens for styling
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  onBack,
  placeholder = 'Tim kiem...',
  autoFocus = false,
  showBackButton = false,
  editable = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const animatedWidth = useRef(new Animated.Value(showBackButton ? 0 : 1)).current;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.xs,
    },
    inputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      paddingHorizontal: SPACING.md,
      height: 44,
    },
    inputContainerFocused: {
      borderColor: colors.inputBorderFocus,
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    input: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    clearButton: {
      marginLeft: SPACING.sm,
    },
    clearButtonInner: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (value?.trim()) {
      onSubmit?.(value.trim());
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        <Search
          size={20}
          color={isFocused ? colors.purple : colors.textMuted}
          style={styles.searchIcon}
        />

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          selectionColor={colors.purple}
        />

        {value?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.clearButtonInner}>
              <X size={14} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;

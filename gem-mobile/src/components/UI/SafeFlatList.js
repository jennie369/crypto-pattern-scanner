/**
 * Gemral - SafeFlatList
 * FlatList wrapper with automatic bottom tab padding
 * Prevents content from being hidden behind the floating tab bar
 */

import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';

export default function SafeFlatList({
  style,
  contentContainerStyle,
  extraBottomPadding = 0,
  ...props
}) {
  return (
    <FlatList
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: CONTENT_BOTTOM_PADDING + extraBottomPadding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

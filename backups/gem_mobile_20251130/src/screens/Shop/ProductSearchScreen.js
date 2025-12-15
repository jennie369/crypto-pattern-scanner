/**
 * Gemral - Product Search Screen
 * Search functionality for Shop products - DARK THEME
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, ArrowLeft, Clock, TrendingUp } from 'lucide-react-native';
import { ProductCard } from './components';
import { shopifyService } from '../../services/shopifyService';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const ProductSearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Auto focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load recent searches from local storage (simplified version)
  useEffect(() => {
    // In production, load from AsyncStorage
    setRecentSearches(['Pha lê', 'Thạch anh', 'Vòng tay', 'Đá quý']);
  }, []);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      // Search products via shopifyService
      const products = await shopifyService.getProducts({ limit: 50 });

      // Filter by search query (client-side search)
      const filtered = products.filter(product => {
        const title = product.title?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const queryLower = searchQuery.toLowerCase();
        return title.includes(queryLower) || description.includes(queryLower);
      });

      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProductPress = (product) => {
    Keyboard.dismiss();
    navigation.navigate('ProductDetail', { product });
  };

  const handleRecentSearch = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      style={[
        styles.productCard,
        index % 2 === 0 ? styles.leftCard : styles.rightCard,
      ]}
      darkMode={true}
    />
  );

  const renderEmptyResults = () => (
    <View style={styles.emptyState}>
      <Search size={48} color={COLORS.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
      <Text style={styles.emptySubtitle}>
        Thử tìm kiếm với từ khóa khác
      </Text>
    </View>
  );

  const renderRecentSearches = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Clock size={18} color={COLORS.textMuted} />
        <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
      </View>
      <View style={styles.tagContainer}>
        {recentSearches.map((term, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            onPress={() => handleRecentSearch(term)}
          >
            <Text style={styles.tagText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
        <TrendingUp size={18} color={COLORS.gold} />
        <Text style={styles.sectionTitle}>Xu hướng</Text>
      </View>
      <View style={styles.tagContainer}>
        {['Phong thủy', 'May mắn', 'Tình duyên', 'Sức khỏe'].map((term, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tag, styles.trendingTag]}
            onPress={() => handleRecentSearch(term)}
          >
            <Text style={[styles.tagText, styles.trendingTagText]}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Search size={20} color={COLORS.textMuted} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch(query)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => handleSearch(query)}
          >
            <Text style={styles.searchBtnText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : hasSearched ? (
          <FlatList
            data={results}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={renderEmptyResults}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderRecentSearches()
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  searchBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gold,
  },

  // Recent Searches
  recentSection: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  trendingTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  trendingTagText: {
    color: COLORS.gold,
  },

  // Grid
  grid: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    marginBottom: SPACING.md,
  },
  leftCard: {
    marginRight: SPACING.xs,
  },
  rightCard: {
    marginLeft: SPACING.xs,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});

export default ProductSearchScreen;

# 📱 WEEK 3: HOME TAB (FORUM) IMPLEMENTATION

**Version:** 1.0
**Created:** November 23, 2025
**Status:** 🎯 READY TO IMPLEMENT

---

## ⚠️ CRITICAL ENFORCEMENT RULES

```markdown
🚨 ABSOLUTE REQUIREMENTS:

1. MUST read DESIGN_TOKENS.md for ALL styling values
2. MUST read FINAL_NAVIGATION_STRUCTURE_6_TABS.md for structure
3. MUST use React Native (NOT web React)
4. MUST reuse services from web app (forumService.js)
5. NO random values - ALL from design tokens
6. Follow exact component structure specified
```

---

## 📋 TASK OVERVIEW

```markdown
NHIỆM VỤ: Implement Home Tab (Forum/Community Feed)
TUẦN: 3
DỰ KIẾN: 7 ngày
MỤC TIÊU: Complete Forum features với full functionality
```

---

## BƯỚC 1: ĐỌC DESIGN SPECS (MANDATORY!)

**READ these files FIRST:**

1. **DESIGN_TOKENS.md**
   - Section 4: Colors (navy, gold, cyan)
   - Section 5: Typography (font sizes)
   - Section 2: Spacing (8px grid)
   - Section 9: Glass Cards
   - Section 11A: Glass Bottom Tab Bar

2. **FINAL_NAVIGATION_STRUCTURE_6_TABS.md**
   - Section 1: Home Tab specs
   - ForumScreen layout
   - Features list

---

## BƯỚC 2: COPY EXISTING SERVICES (REUSE - DON'T REBUILD!)

**From web app, COPY these files:**

```bash
# 1. Forum Service (CRITICAL - Already working!)
cp frontend/src/services/forumService.js \
   gem-mobile/src/services/forumService.js

# 2. Supabase Client (Already configured in gem-mobile)
# Already exists at: gem-mobile/src/services/supabase.js
```

---

## BƯỚC 3: CREATE SCREEN STRUCTURE

**Create folder structure:**

```
src/screens/Forum/
├── ForumScreen.js         (Main screen)
├── PostDetailScreen.js    (Post detail)
├── CreatePostScreen.js    (New post)
├── components/
│   ├── PostCard.js        (Post preview)
│   ├── CategoryTabs.js    (Category filter)
│   ├── CommentSection.js  (Comments)
│   └── FABButton.js       (Floating action)
```

---

## BƯỚC 4: IMPLEMENT ForumScreen.js

```javascript
// src/screens/Forum/ForumScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from './components/PostCard';
import CategoryTabs from './components/CategoryTabs';
import FABButton from './components/FABButton';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const ForumScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    // TODO: Connect to forumService
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>News Feed</Text>
          <Text style={styles.headerSubtitle}>Community & Updates</Text>
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Posts Feed */}
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
        />

        {/* FAB */}
        <FABButton onPress={() => navigation.navigate('CreatePost')} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  header: {
    backgroundColor: GLASS.background,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 120,
  },
});

export default ForumScreen;
```

---

## BƯỚC 5: IMPLEMENT PostCard.js

```javascript
// src/screens/Forum/components/PostCard.js

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Heart, MessageCircle, Eye } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

const PostCard = ({ post, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Author Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: post.user?.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{post.user?.full_name || 'Anonymous'}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
        </View>
        {post.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{post.category?.name}</Text>
          </View>
        )}
      </View>

      {/* Title & Content */}
      <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={3}>{post.content}</Text>

      {/* Stats */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Heart size={16} color={COLORS.textMuted} />
          <Text style={styles.statText}>{post.likes_count || 0}</Text>
        </View>
        <View style={styles.stat}>
          <MessageCircle size={16} color={COLORS.textMuted} />
          <Text style={styles.statText}>{post.comments_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffMins = Math.floor((now - postDate) / 60000);
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return postDate.toLocaleDateString('vi-VN');
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: GLASS.padding,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: SPACING.sm },
  headerText: { flex: 1 },
  authorName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  timestamp: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted },
  categoryBadge: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  footer: { flexDirection: 'row', gap: SPACING.lg },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
});

export default PostCard;
```

---

## BƯỚC 6: IMPLEMENT CategoryTabs.js

```javascript
// src/screens/Forum/components/CategoryTabs.js

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const CategoryTabs = ({ categories, selected, onSelect }) => {
  const allCategories = [{ id: null, name: 'Tất Cả' }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {allCategories.map((category) => {
        const isSelected = category.id === selected;
        return (
          <TouchableOpacity
            key={category.id || 'all'}
            style={[styles.tab, isSelected && styles.tabActive]}
            onPress={() => onSelect(category.id)}
          >
            <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  tabActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: { color: '#112250', fontWeight: TYPOGRAPHY.fontWeight.bold },
});

export default CategoryTabs;
```

---

## BƯỚC 7: IMPLEMENT FABButton.js

```javascript
// src/screens/Forum/components/FABButton.js

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS, SPACING } from '../../../utils/tokens';

const FABButton = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <Plus size={24} color="#FFFFFF" strokeWidth={3} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default FABButton;
```

---

## ✅ VALIDATION CHECKLIST

**Features:**
- [ ] Forum feed displays posts correctly
- [ ] Category tabs working
- [ ] Pull-to-refresh working
- [ ] Post card shows all info
- [ ] FAB button visible
- [ ] Empty state shows correctly
- [ ] Loading indicators working

**Design Compliance:**
- [ ] Colors from DESIGN_TOKENS.md
- [ ] Typography from utils/tokens.js
- [ ] Spacing: 8px grid
- [ ] Glass card style matching spec
- [ ] Dark theme background

**Performance:**
- [ ] FlatList optimized
- [ ] Images loading efficiently
- [ ] Smooth scrolling

---

## 🎯 SUCCESS CRITERIA

```markdown
Forum feed working: ✅
Category filtering: ✅
Pull-to-refresh: ✅
Glass design: ✅
All values from tokens: ✅
Dark theme: ✅
Ready for Week 4: ✅
```

---

**📄 WEEK 3 IMPLEMENTATION GUIDE COMPLETE**
**START IMPLEMENTATION! 🚀**

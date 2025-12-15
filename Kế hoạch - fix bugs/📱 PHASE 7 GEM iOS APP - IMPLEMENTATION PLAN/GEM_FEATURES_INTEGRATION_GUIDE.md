# GEM MOBILE - FEATURES INTEGRATION GUIDE
## Hướng dẫn tích hợp đầy đủ 12 features vào UI

**Vấn đề:** Đã có services/components nhưng user KHÔNG THẤY GÌ để sử dụng!

**Giải pháp:** Document này chỉ chi tiết:
1. ✅ Cách update PostCard với action buttons
2. ✅ Cách update Navigation với routes mới
3. ✅ Cách thêm entry points vào MainTabs/Profile
4. ✅ Flow diagram cho từng feature
5. ✅ Testing checklist

---

## 📋 MỤC LỤC

1. [PostCard Integration](#1-postcard-integration)
2. [Navigation Setup](#2-navigation-setup)
3. [Main Tabs Entry Points](#3-main-tabs-entry-points)
4. [Create Post Flow](#4-create-post-flow)
5. [Profile/Wallet Entry Points](#5-profilewallet-entry-points)
6. [Testing Checklist](#6-testing-checklist)

---

## 1. POSTCARD INTEGRATION

### Vấn đề hiện tại:
```javascript
// PostCard.js hiện tại - CHỈ CÓ like/comment cơ bản
<View style={styles.actions}>
  <TouchableOpacity onPress={handleLike}>
    <Icon name="heart" />
    <Text>{post.like_count}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={handleComment}>
    <Icon name="message-circle" />
    <Text>{post.comment_count}</Text>
  </TouchableOpacity>
</View>
```

### Giải pháp: Update PostCard với TẤT CẢ action buttons

**File:** `src/components/Forum/PostCard.js`

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Lucide';
import { useNavigation } from '@react-navigation/native';

// Import tất cả modals/sheets
import ShareSheet from '../Share/ShareSheet';
import RepostSheet from '../Repost/RepostSheet';
import GiftCatalogSheet from '../Gifting/GiftCatalogSheet';
import CommentActionSheet from '../Comments/CommentActionSheet';
import ReactionsListSheet from '../Reactions/ReactionsListSheet';
import ReceivedGiftsBar from '../Gifting/ReceivedGiftsBar';
import QuotedPost from '../Repost/QuotedPost';
import SoundCard from '../Sound/SoundCard';
import ShoppingTagOverlay from '../Shopping/ShoppingTagOverlay';
import BoostedBadge from '../Monetization/BoostedBadge';

// Import services
import { likePost, savePost } from '../../services/postService';
import { createRepost } from '../../services/repostService';

export default function PostCard({ post, currentUserId, onCommentPress }) {
  const navigation = useNavigation();
  
  // Modal states
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [repostSheetVisible, setRepostSheetVisible] = useState(false);
  const [giftSheetVisible, setGiftSheetVisible] = useState(false);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);

  // Post states
  const [isLiked, setIsLiked] = useState(post.is_liked_by_current_user);
  const [isSaved, setIsSaved] = useState(post.is_saved_by_current_user);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  // Handle actions
  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
      await likePost(post.id, currentUserId, newLikedState);
    } catch (error) {
      console.error('Error liking post:', error);
      setIsLiked(!isLiked); // Revert
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async () => {
    try {
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);
      await savePost(post.id, currentUserId, newSavedState);
    } catch (error) {
      console.error('Error saving post:', error);
      setIsSaved(!isSaved);
    }
  };

  const handleShare = () => {
    setShareSheetVisible(true);
  };

  const handleRepost = () => {
    setRepostSheetVisible(true);
  };

  const handleGift = () => {
    setGiftSheetVisible(true);
  };

  const handleViewReactions = () => {
    setReactionsVisible(true);
  };

  const handleMoreOptions = () => {
    setMoreOptionsVisible(true);
  };

  // Check if this is a repost
  const isRepost = post.original_post_id != null;

  return (
    <View style={styles.card}>
      {/* BOOSTED BADGE (nếu post được boost) */}
      {post.is_boosted && <BoostedBadge />}

      {/* POST HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.authorInfo}
          onPress={() => navigation.navigate('Profile', { userId: post.author_id })}
        >
          <Image 
            source={{ uri: post.author?.avatar_url }} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.authorName}>{post.author?.username}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(post.created_at)}</Text>
          </View>
        </TouchableOpacity>

        {/* MORE OPTIONS BUTTON */}
        <TouchableOpacity onPress={handleMoreOptions}>
          <Icon name="more-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* REPOST INDICATOR (nếu là repost) */}
      {isRepost && (
        <View style={styles.repostIndicator}>
          <Icon name="repeat" size={14} color="#9C0612" />
          <Text style={styles.repostText}>
            {post.author?.username} shared this
          </Text>
        </View>
      )}

      {/* POST CONTENT */}
      <View style={styles.content}>
        {/* Quote text (nếu có) */}
        {post.quote_text && (
          <Text style={styles.quoteText}>{post.quote_text}</Text>
        )}

        {/* Original post content (hoặc quoted post nếu là repost) */}
        {isRepost ? (
          <QuotedPost post={post.original_post} />
        ) : (
          <>
            {/* Caption */}
            <Text style={styles.caption}>{post.content}</Text>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <View style={styles.mediaContainer}>
                <Image 
                  source={{ uri: post.media_urls[0] }} 
                  style={styles.media}
                  resizeMode="cover"
                />
                {/* SHOPPING TAGS OVERLAY */}
                {post.product_tags && post.product_tags.length > 0 && (
                  <ShoppingTagOverlay 
                    tags={post.product_tags}
                    editable={false}
                  />
                )}
              </View>
            )}

            {/* SOUND CARD (nếu có âm thanh) */}
            {post.sound && (
              <SoundCard 
                sound={post.sound}
                onPress={() => navigation.navigate('SoundDetail', { soundId: post.sound.id })}
              />
            )}
          </>
        )}
      </View>

      {/* RECEIVED GIFTS BAR (nếu có gifts) */}
      {post.gift_summary && post.gift_summary.total_count > 0 && (
        <ReceivedGiftsBar 
          gifts={post.gift_summary.gifts}
          totalCount={post.gift_summary.total_count}
          onPress={() => navigation.navigate('PostGifts', { postId: post.id })}
        />
      )}

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        {/* LIKE */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Icon 
            name={isLiked ? "heart" : "heart"} 
            size={22}
            color={isLiked ? "#9C0612" : "#666"}
            fill={isLiked ? "#9C0612" : "none"}
          />
          <TouchableOpacity onPress={handleViewReactions}>
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* COMMENT */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onCommentPress(post)}
        >
          <Icon name="message-circle" size={22} color="#666" />
          <Text style={styles.actionText}>{post.comment_count || 0}</Text>
        </TouchableOpacity>

        {/* REPOST */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleRepost}
        >
          <Icon 
            name="repeat" 
            size={22} 
            color={post.is_reposted_by_current_user ? "#9C0612" : "#666"}
          />
          <Text style={[
            styles.actionText, 
            post.is_reposted_by_current_user && styles.actionTextActive
          ]}>
            {post.repost_count || 0}
          </Text>
        </TouchableOpacity>

        {/* GIFT */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleGift}
        >
          <Icon name="gift" size={22} color="#FFBD59" />
        </TouchableOpacity>

        {/* SHARE */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Icon name="send" size={22} color="#666" />
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* SAVE */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleSave}
        >
          <Icon 
            name={isSaved ? "bookmark" : "bookmark"} 
            size={22} 
            color={isSaved ? "#FFBD59" : "#666"}
            fill={isSaved ? "#FFBD59" : "none"}
          />
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <ShareSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        post={post}
      />

      <RepostSheet
        visible={repostSheetVisible}
        onClose={() => setRepostSheetVisible(false)}
        post={post}
        currentUserId={currentUserId}
      />

      <GiftCatalogSheet
        visible={giftSheetVisible}
        onClose={() => setGiftSheetVisible(false)}
        receiverUserId={post.author_id}
        contextType="post"
        contextId={post.id}
      />

      <ReactionsListSheet
        visible={reactionsVisible}
        onClose={() => setReactionsVisible(false)}
        postId={post.id}
      />

      {/* MORE OPTIONS (Pin, Delete, Report, etc.) - sẽ implement sau */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17, 34, 80, 0.4)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  timestamp: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  repostIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  repostText: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 12,
    color: '#9C0612',
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: 16,
  },
  quoteText: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  caption: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontFamily: 'NotoSansDisplay-Medium',
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 6,
  },
  actionTextActive: {
    color: '#9C0612',
  },
});

// Helper function
function formatTimestamp(timestamp) {
  const now = new Date();
  const posted = new Date(timestamp);
  const diff = Math.floor((now - posted) / 1000); // seconds

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return posted.toLocaleDateString();
}
```

---

## 2. NAVIGATION SETUP

### File: `src/navigation/AppNavigator.js`

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Lucide';

// Existing screens
import HomeScreen from '../screens/Home/HomeScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import CreatePostScreen from '../screens/CreatePost/CreatePostScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// NEW: Shopping screens
import ProductDetailScreen from '../screens/Shopping/ProductDetailScreen';
import ShoppingCartScreen from '../screens/Shopping/ShoppingCartScreen';

// NEW: Sound Library screens
import SoundLibraryScreen from '../screens/Sound/SoundLibraryScreen';
import SoundDetailScreen from '../screens/Sound/SoundDetailScreen';
import UploadSoundScreen from '../screens/Sound/UploadSoundScreen';

// NEW: Monetization screens
import BoostPostScreen from '../screens/Monetization/BoostPostScreen';
import BoostAnalyticsScreen from '../screens/Monetization/BoostAnalyticsScreen';

// NEW: Privacy screens
import PrivacySettingsScreen from '../screens/Privacy/PrivacySettingsScreen';
import CloseFriendsScreen from '../screens/Privacy/CloseFriendsScreen';

// NEW: Wallet & Gifting screens
import WalletScreen from '../screens/Wallet/WalletScreen';
import BuyGemsScreen from '../screens/Wallet/BuyGemsScreen';
import EarningsScreen from '../screens/Creator/EarningsScreen';
import WithdrawScreen from '../screens/Creator/WithdrawScreen';
import PostGiftsScreen from '../screens/Gifting/PostGiftsScreen';

// NEW: Comments screen
import CommentsScreen from '../screens/Comments/CommentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') iconName = 'compass';
          else if (route.name === 'Create') iconName = 'plus-circle';
          else if (route.name === 'Notifications') iconName = 'bell';
          else if (route.name === 'Profile') iconName = 'user';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#9C0612',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'rgba(17, 34, 80, 0.8)',
          borderTopWidth: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Create" component={CreatePostScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// App Stack
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: 'rgba(17, 34, 80, 0.8)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'Montserrat-SemiBold',
          },
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* SHOPPING SCREENS */}
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{ title: 'Product Details' }}
        />
        <Stack.Screen 
          name="ShoppingCart" 
          component={ShoppingCartScreen}
          options={{ 
            title: 'Shopping Cart',
            headerRight: () => (
              <TouchableOpacity>
                <Icon name="shopping-bag" size={20} color="#FFF" />
              </TouchableOpacity>
            ),
          }}
        />

        {/* SOUND LIBRARY SCREENS */}
        <Stack.Screen 
          name="SoundLibrary" 
          component={SoundLibraryScreen}
          options={{ 
            title: 'Sound Library',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('UploadSound')}>
                <Icon name="upload" size={20} color="#FFF" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen 
          name="SoundDetail" 
          component={SoundDetailScreen}
          options={{ title: 'Sound Details' }}
        />
        <Stack.Screen 
          name="UploadSound" 
          component={UploadSoundScreen}
          options={{ title: 'Upload Sound' }}
        />

        {/* MONETIZATION SCREENS */}
        <Stack.Screen 
          name="BoostPost" 
          component={BoostPostScreen}
          options={{ title: 'Boost Post' }}
        />
        <Stack.Screen 
          name="BoostAnalytics" 
          component={BoostAnalyticsScreen}
          options={{ title: 'Campaign Analytics' }}
        />

        {/* PRIVACY SCREENS */}
        <Stack.Screen 
          name="PrivacySettings" 
          component={PrivacySettingsScreen}
          options={{ title: 'Privacy Settings' }}
        />
        <Stack.Screen 
          name="CloseFriends" 
          component={CloseFriendsScreen}
          options={{ title: 'Close Friends' }}
        />

        {/* WALLET & GIFTING SCREENS */}
        <Stack.Screen 
          name="Wallet" 
          component={WalletScreen}
          options={{ 
            title: 'My Wallet',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('BuyGems')}>
                <Icon name="plus-circle" size={20} color="#FFBD59" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen 
          name="BuyGems" 
          component={BuyGemsScreen}
          options={{ title: 'Buy Gems' }}
        />
        <Stack.Screen 
          name="Earnings" 
          component={EarningsScreen}
          options={{ title: 'My Earnings' }}
        />
        <Stack.Screen 
          name="Withdraw" 
          component={WithdrawScreen}
          options={{ title: 'Withdraw Funds' }}
        />
        <Stack.Screen 
          name="PostGifts" 
          component={PostGiftsScreen}
          options={{ title: 'Gifts Received' }}
        />

        {/* COMMENTS SCREEN */}
        <Stack.Screen 
          name="Comments" 
          component={CommentsScreen}
          options={{ title: 'Comments' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 3. MAIN TABS ENTRY POINTS

### A. HomeScreen - Thêm shortcuts

**File:** `src/screens/Home/HomeScreen.js`

```javascript
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* HEADER với shortcuts */}
      <View style={styles.header}>
        <Text style={styles.title}>GEM Forum</Text>
        
        <View style={styles.headerActions}>
          {/* GEM BALANCE WIDGET */}
          <GemBalanceWidget 
            onPress={() => navigation.navigate('Wallet')}
          />

          {/* SOUND LIBRARY */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SoundLibrary')}
            style={styles.headerButton}
          >
            <Icon name="music" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* SHOPPING CART */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('ShoppingCart')}
            style={styles.headerButton}
          >
            <Icon name="shopping-bag" size={20} color="#FFF" />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* FEED */}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard 
            post={item}
            currentUserId={currentUserId}
            onCommentPress={(post) => navigation.navigate('Comments', { postId: post.id })}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
```

---

### B. Profile Screen - Thêm menu options

**File:** `src/screens/Profile/ProfileScreen.js`

```javascript
export default function ProfileScreen({ navigation, route }) {
  const userId = route.params?.userId || currentUserId;
  const isOwnProfile = userId === currentUserId;

  return (
    <ScrollView style={styles.container}>
      {/* PROFILE HEADER */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>

        {isOwnProfile && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        <Stat label="Posts" value={user.post_count} />
        <Stat label="Followers" value={user.followers_count} />
        <Stat label="Following" value={user.following_count} />
      </View>

      {/* MENU OPTIONS (chỉ hiện nếu own profile) */}
      {isOwnProfile && (
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Features</Text>

          {/* MY WALLET */}
          <MenuOption
            icon="wallet"
            title="My Wallet"
            subtitle={`${gemBalance} gems`}
            onPress={() => navigation.navigate('Wallet')}
          />

          {/* CREATOR EARNINGS */}
          <MenuOption
            icon="trending-up"
            title="Creator Earnings"
            subtitle="View your earnings"
            onPress={() => navigation.navigate('Earnings')}
          />

          {/* BOOSTED POSTS */}
          <MenuOption
            icon="zap"
            title="Boosted Posts"
            subtitle="View active campaigns"
            onPress={() => navigation.navigate('BoostedPosts')}
          />

          {/* MY SOUNDS */}
          <MenuOption
            icon="music"
            title="My Sounds"
            subtitle={`${soundCount} uploaded`}
            onPress={() => navigation.navigate('MySounds')}
          />

          {/* PRIVACY SETTINGS */}
          <MenuOption
            icon="shield"
            title="Privacy Settings"
            subtitle="Who can see your posts"
            onPress={() => navigation.navigate('PrivacySettings')}
          />

          {/* CLOSE FRIENDS */}
          <MenuOption
            icon="users"
            title="Close Friends"
            subtitle={`${closeFriendsCount} friends`}
            onPress={() => navigation.navigate('CloseFriends')}
          />

          {/* SAVED POSTS */}
          <MenuOption
            icon="bookmark"
            title="Saved Posts"
            subtitle="Your bookmarks"
            onPress={() => navigation.navigate('SavedPosts')}
          />
        </View>
      )}

      {/* USER POSTS GRID */}
      <View style={styles.postsGrid}>
        {/* Grid of user's posts */}
      </View>
    </ScrollView>
  );
}

// MenuOption Component
function MenuOption({ icon, title, subtitle, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Icon name={icon} size={20} color="#9C0612" />
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color="#666" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    backgroundColor: 'rgba(17, 34, 80, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
});
```

---

## 4. CREATE POST FLOW

### File: `src/screens/CreatePost/CreatePostScreen.js`

```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Lucide';
import * as ImagePicker from 'expo-image-picker';

// Import modals
import SoundPicker from '../../components/Sound/SoundPicker';
import ShoppingTagOverlay from '../../components/Shopping/ShoppingTagOverlay';
import AudiencePicker from '../../components/Privacy/AudiencePicker';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [productTags, setProductTags] = useState([]);
  const [audience, setAudience] = useState('public'); // public, friends, close_friends
  
  // Modal states
  const [soundPickerVisible, setSoundPickerVisible] = useState(false);
  const [audiencePickerVisible, setAudiencePickerVisible] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const handleAddSound = () => {
    setSoundPickerVisible(true);
  };

  const handleTagProducts = () => {
    navigation.navigate('ProductSearch', {
      onSelectProducts: (products) => {
        setProductTags(products);
      }
    });
  };

  const handleSelectAudience = () => {
    setAudiencePickerVisible(true);
  };

  const handlePost = async () => {
    try {
      // Create post with all features
      const postData = {
        content,
        media_url: media,
        sound_id: selectedSound?.id,
        product_tags: productTags.map(p => p.id),
        visibility: audience,
      };

      await createPost(postData);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="x" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={!content && !media}
        >
          <Text style={[styles.postButton, (!content && !media) && styles.postButtonDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* AUDIENCE SELECTOR */}
        <TouchableOpacity 
          style={styles.audienceButton}
          onPress={handleSelectAudience}
        >
          <Icon 
            name={audience === 'public' ? 'globe' : audience === 'friends' ? 'users' : 'user-check'} 
            size={16} 
            color="#9C0612" 
          />
          <Text style={styles.audienceText}>
            {audience === 'public' ? 'Public' : audience === 'friends' ? 'Friends' : 'Close Friends'}
          </Text>
          <Icon name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        {/* TEXT INPUT */}
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#666"
          multiline
          value={content}
          onChangeText={setContent}
        />

        {/* SELECTED MEDIA */}
        {media && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: media }} style={styles.mediaImage} />
            <TouchableOpacity 
              style={styles.removeMediaButton}
              onPress={() => setMedia(null)}
            >
              <Icon name="x" size={20} color="#FFF" />
            </TouchableOpacity>

            {/* SHOPPING TAGS OVERLAY */}
            {productTags.length > 0 && (
              <ShoppingTagOverlay 
                tags={productTags}
                editable={true}
                onEdit={handleTagProducts}
              />
            )}
          </View>
        )}

        {/* SELECTED SOUND */}
        {selectedSound && (
          <View style={styles.selectedSound}>
            <Icon name="music" size={16} color="#9C0612" />
            <Text style={styles.soundName}>{selectedSound.name}</Text>
            <TouchableOpacity onPress={() => setSelectedSound(null)}>
              <Icon name="x" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* PRODUCT TAGS PREVIEW */}
        {productTags.length > 0 && (
          <View style={styles.productTagsPreview}>
            <Text style={styles.productTagsTitle}>
              Tagged Products ({productTags.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productTags.map((product, index) => (
                <View key={index} style={styles.productTagCard}>
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM TOOLBAR */}
      <View style={styles.toolbar}>
        {/* ADD PHOTO */}
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={handlePickImage}
        >
          <Icon name="image" size={24} color="#FFBD59" />
        </TouchableOpacity>

        {/* ADD SOUND */}
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={handleAddSound}
        >
          <Icon name="music" size={24} color="#9C0612" />
        </TouchableOpacity>

        {/* TAG PRODUCTS */}
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={handleTagProducts}
        >
          <Icon name="tag" size={24} color="#00C896" />
        </TouchableOpacity>

        {/* BOOST (after posting) */}
        <TouchableOpacity style={styles.toolButton}>
          <Icon name="zap" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      <SoundPicker
        visible={soundPickerVisible}
        onClose={() => setSoundPickerVisible(false)}
        onSelect={(sound) => {
          setSelectedSound(sound);
          setSoundPickerVisible(false);
        }}
      />

      <AudiencePicker
        visible={audiencePickerVisible}
        onClose={() => setAudiencePickerVisible(false)}
        currentAudience={audience}
        onSelect={(newAudience) => {
          setAudience(newAudience);
          setAudiencePickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  postButton: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#9C0612',
  },
  postButtonDisabled: {
    color: '#666',
  },
  audienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    margin: 16,
  },
  audienceText: {
    fontFamily: 'NotoSansDisplay-Medium',
    fontSize: 13,
    color: '#9C0612',
    marginLeft: 6,
    marginRight: 4,
  },
  textInput: {
    fontFamily: 'NotoSansDisplay-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    padding: 16,
    minHeight: 120,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolButton: {
    padding: 8,
  },
  mediaPreview: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  selectedSound: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  soundName: {
    fontFamily: 'NotoSansDisplay-Medium',
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
});
```

---

## 5. PROFILE/WALLET ENTRY POINTS

### Wallet Screen với shortcuts

**File:** `src/screens/Wallet/WalletScreen.js`

```javascript
export default function WalletScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* BALANCE CARD */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>💎 {balance} Gems</Text>
        <Text style={styles.balanceValue}>≈ {formatCurrency(balance * 200)} VNĐ</Text>
        
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => navigation.navigate('BuyGems')}
        >
          <Icon name="plus-circle" size={20} color="#FFF" />
          <Text style={styles.buyButtonText}>Buy More Gems</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActions}>
        <QuickAction
          icon="gift"
          title="Send Gift"
          onPress={() => navigation.navigate('Home')}
        />
        <QuickAction
          icon="trending-up"
          title="My Earnings"
          onPress={() => navigation.navigate('Earnings')}
        />
        <QuickAction
          icon="credit-card"
          title="Withdraw"
          onPress={() => navigation.navigate('Withdraw')}
        />
      </View>

      {/* TRANSACTION HISTORY */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map(tx => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </View>
    </ScrollView>
  );
}
```

---

## 6. TESTING CHECKLIST

### ✅ PostCard Actions
```
□ Like button works (heart fills, count updates)
□ Comment button navigates to CommentsScreen
□ Repost button opens RepostSheet
□ Gift button opens GiftCatalogSheet  
□ Share button opens ShareSheet
□ Save button works (bookmark fills)
□ View reactions tap on like count
□ Boosted badge shows on boosted posts
□ Sound card shows when sound attached
□ Shopping tags visible on media
□ Received gifts bar shows when gifts exist
□ Quoted post renders for reposts
```

### ✅ Navigation
```
□ All screens accessible via navigation
□ Back buttons work correctly
□ Header titles show properly
□ Tab bar works with 5 tabs
□ Modal screens present correctly
```

### ✅ Create Post Flow
```
□ Audience picker works (Public/Friends/Close Friends)
□ Add photo button opens image picker
□ Add sound button opens SoundPicker modal
□ Tag products button navigates to product search
□ Selected sound shows preview card
□ Tagged products show preview grid
□ Post button enables when content exists
□ Post successfully creates with all features
```

### ✅ Profile Menu
```
□ My Wallet navigates correctly
□ Creator Earnings opens for eligible users
□ Boosted Posts shows active campaigns
□ My Sounds shows uploaded sounds
□ Privacy Settings accessible
□ Close Friends manager works
□ Saved Posts shows bookmarks
```

### ✅ Wallet Flow
```
□ Balance displays correctly
□ Buy Gems button navigates
□ Quick actions work (Send Gift, Earnings, Withdraw)
□ Transaction history loads
□ Gem balance updates after purchase
```

---

## 🎯 IMPLEMENTATION STEPS

### Bước 1: Update PostCard ⭐ (QUAN TRỌNG NHẤT)
```bash
1. Copy đoạn code PostCard hoàn chỉnh ở trên
2. Replace file src/components/Forum/PostCard.js hiện tại
3. Import tất cả modals/sheets cần thiết
4. Test action buttons: Like, Comment, Repost, Gift, Share, Save
```

### Bước 2: Setup Navigation
```bash
1. Copy đoạn code AppNavigator ở trên
2. Add tất cả screens mới vào Stack
3. Test navigation giữa các screens
```

### Bước 3: Update Main Screens
```bash
1. Update HomeScreen với header shortcuts
2. Update ProfileScreen với menu options
3. Update CreatePostScreen với full toolbar
4. Test entry points từ mỗi screen
```

### Bước 4: Test End-to-End
```bash
1. Create post với sound + products + audience
2. Like, comment, repost, gift post
3. View reactions, share externally
4. Buy gems, send gift, view earnings
5. Boost post, view analytics
```

---

## 📊 SUMMARY

**Trước khi integrate:**
- ✅ Có 12 services
- ✅ Có 20+ components
- ❌ User KHÔNG THẤY buttons
- ❌ User KHÔNG BIẾT features tồn tại

**Sau khi integrate:**
- ✅ PostCard với 7 action buttons
- ✅ Navigation với 15+ screens
- ✅ Profile với 7 menu options  
- ✅ Create Post với 4 add-ons
- ✅ User CÓ THỂ dùng TẤT CẢ features!

**Files cần update:**
1. `PostCard.js` - Add action buttons ⭐⭐⭐⭐⭐
2. `AppNavigator.js` - Add routes ⭐⭐⭐⭐
3. `HomeScreen.js` - Add shortcuts ⭐⭐⭐
4. `ProfileScreen.js` - Add menu ⭐⭐⭐
5. `CreatePostScreen.js` - Add toolbar ⭐⭐⭐⭐

**Priority:** BẮT ĐẦU VỚI POSTCARD!

---

**End of Integration Guide**

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { forumCategories } from '../../services/forum';
import { supabase } from '../../lib/supabaseClient';
import LeftSidebar from './components/LeftSidebar';
import CenterFeed from './components/CenterFeed';
import RightSidebar from './components/RightSidebar';
import './Forum3Column.css';

const PAGE_SIZE = 20;

/**
 * Forum3Column Component - SYNCED FROM MOBILE ForumScreen
 * 3-column Community Hub layout (Binance Square style)
 *
 * Enhanced:
 * - Infinite scroll with Intersection Observer
 * - Feed type switching (explore/following/popular/academy)
 * - Custom feeds support
 * - Skeleton loading
 * - Pull-to-refresh (refresh button)
 * - Empty states per feed type
 */
export default function Forum3Column() {
  const { user } = useAuth();

  // Posts state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Feed state
  const [selectedFeed, setSelectedFeed] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Custom Feeds
  const [customFeeds, setCustomFeeds] = useState([]);

  // Refs
  const loadingRef = useRef(false);

  /**
   * Fetch posts on mount and when feed/sort changes
   */
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [selectedFeed, selectedCategory, sortBy]);

  /**
   * Load custom feeds for user
   */
  useEffect(() => {
    if (user) loadCustomFeeds();
  }, [user]);

  const loadCustomFeeds = async () => {
    try {
      const { data } = await supabase
        .from('custom_feeds')
        .select('*')
        .eq('user_id', user.id);
      setCustomFeeds(data || []);
    } catch (err) {
      console.error('[Forum3Column] Custom feeds error:', err);
    }
  };

  /**
   * Load posts with pagination
   */
  const loadPosts = async (pageNum = 1, isInitial = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let postsData = [];
      let totalCount = 0;

      // Feed-specific loading
      if (selectedFeed === 'following' && user) {
        // Following feed — posts from followed users
        const { data: follows } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = (follows || []).map(f => f.following_id);

        if (followingIds.length > 0) {
          const from = (pageNum - 1) * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;
          const { data, count } = await supabase
            .from('forum_posts')
            .select(`*, author:profiles(id, full_name, avatar_url, scanner_tier, role)`, { count: 'exact' })
            .eq('status', 'published')
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .range(from, to);
          postsData = data || [];
          totalCount = count || 0;
        }
      } else if (selectedFeed === 'popular') {
        // Popular/trending feed
        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, count } = await supabase
          .from('forum_posts')
          .select(`*, author:profiles(id, full_name, avatar_url, scanner_tier, role)`, { count: 'exact' })
          .eq('status', 'published')
          .order('likes_count', { ascending: false })
          .range(from, to);
        postsData = data || [];
        totalCount = count || 0;
      } else if (selectedFeed === 'liked') {
        // Liked posts
        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, count } = await supabase
          .from('forum_likes')
          .select(`post:forum_posts(*, author:profiles(id, full_name, avatar_url, scanner_tier, role))`, { count: 'exact' })
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .range(from, to);
        postsData = (data || []).filter(d => d.post).map(d => d.post);
        totalCount = count || 0;
      } else if (selectedFeed === 'saved') {
        // Saved/bookmarked posts
        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, count } = await supabase
          .from('forum_saved')
          .select(`post:forum_posts(*, author:profiles(id, full_name, avatar_url, scanner_tier, role))`, { count: 'exact' })
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .range(from, to);
        postsData = (data || []).filter(d => d.post).map(d => d.post);
        totalCount = count || 0;
      } else {
        // Default explore feed
        const result = await forumService.getThreads({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          page: pageNum,
          limit: PAGE_SIZE,
          sortBy: sortBy === 'latest' ? 'recent' : 'popular'
        });
        postsData = result?.threads || [];
        totalCount = result?.total || 0;
      }

      // Transform
      const transformed = postsData.map(post => ({
        ...post,
        users: post.author ? {
          display_name: post.author.full_name || post.author.display_name,
          avatar_url: post.author.avatar_url
        } : post.users || null,
        like_count: post.likes_count || post.like_count || 0,
        reply_count: post.comments_count || post.reply_count || 0
      }));

      if (isInitial) {
        setPosts(transformed);
      } else {
        setPosts(prev => [...prev, ...transformed]);
      }

      setPage(pageNum);
      setHasMore(transformed.length === PAGE_SIZE);

    } catch (err) {
      console.error('[Forum3Column] Load error:', err);
      if (isInitial) setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  };

  /**
   * Load next page (called by CenterFeed infinite scroll)
   */
  const loadNextPage = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      loadPosts(page + 1, false);
    }
  }, [page, hasMore]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [selectedFeed, selectedCategory, sortBy]);

  /**
   * Handle category filter
   */
  const handleCategoryFilter = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  /**
   * Handle search
   */
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      handleRefresh();
      return;
    }

    try {
      setLoading(true);
      const results = await forumService.searchThreads(query);
      const transformed = (results || []).map(post => ({
        ...post,
        users: post.author ? {
          display_name: post.author.full_name,
          avatar_url: post.author.avatar_url
        } : null,
        like_count: post.likes_count || 0,
        reply_count: post.comments_count || 0
      }));
      setPosts(transformed);
      setHasMore(false);
    } catch (err) {
      console.error('[Forum3Column] Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  /**
   * Handle post creation
   */
  const handleCreatePost = async (postData) => {
    try {
      const dataWithAuthor = { ...postData, authorId: user.id };
      const newPost = await forumService.createThread(dataWithAuthor);

      const transformedPost = {
        ...newPost,
        users: newPost.author ? {
          display_name: newPost.author.full_name,
          avatar_url: newPost.author.avatar_url
        } : {
          display_name: user.user_metadata?.display_name || user.email,
          avatar_url: user.user_metadata?.avatar_url
        }
      };

      setPosts(prev => [transformedPost, ...prev]);
      return transformedPost;
    } catch (err) {
      console.error('[Forum3Column] Create error:', err);
      throw err;
    }
  };

  /**
   * Handle like toggle
   */
  const handleLike = async (postId) => {
    try {
      await forumService.toggleLike('thread', postId, user.id);
      // Optimistic — update local state
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const wasLiked = p._liked;
        return {
          ...p,
          _liked: !wasLiked,
          like_count: wasLiked ? (p.like_count || 1) - 1 : (p.like_count || 0) + 1
        };
      }));
    } catch (err) {
      console.error('[Forum3Column] Like error:', err);
    }
  };

  /**
   * Handle post delete
   */
  const handleDeletePost = async (postId) => {
    try {
      await forumService.deleteThread(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('[Forum3Column] Delete error:', err);
      throw err;
    }
  };

  /**
   * Handle feed change
   */
  const handleFeedChange = useCallback((feedType) => {
    setSelectedFeed(feedType);
  }, []);

  /**
   * Handle quick action (Liked/Saved)
   */
  const handleQuickAction = useCallback((action) => {
    if (action === 'liked') setSelectedFeed('liked');
    else if (action === 'saved') setSelectedFeed('saved');
  }, []);

  /**
   * Empty state messages per feed
   */
  const getEmptyState = () => {
    switch (selectedFeed) {
      case 'following':
        return { title: 'Chưa có bài viết', message: 'Bạn chưa theo dõi ai. Khám phá cộng đồng!' };
      case 'popular':
        return { title: 'Chưa có bài viết trending', message: 'Hãy quay lại sau!' };
      case 'liked':
        return { title: 'Chưa thích bài nào', message: 'Thích bài viết để xem lại ở đây' };
      case 'saved':
        return { title: 'Chưa lưu bài nào', message: 'Lưu bài viết để xem lại ở đây' };
      default:
        return { title: 'Chưa có bài viết nào', message: 'Hãy là người đầu tiên chia sẻ!' };
    }
  };

  return (
    <div className="forum-3column-container">
      <LeftSidebar
        categories={forumCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryFilter}
        selectedFeed={selectedFeed}
        onFeedChange={handleFeedChange}
        onQuickAction={handleQuickAction}
        customFeeds={customFeeds}
        onCreateFeed={() => alert('Tính năng Tạo Feed sẽ sớm được ra mắt!')}
        onEditFeeds={() => alert('Tính năng Quản Lý Feed sẽ sớm được ra mắt!')}
      />

      <CenterFeed
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        searchQuery={searchQuery}
        sortBy={sortBy}
        selectedFeed={selectedFeed}
        hasMore={hasMore}
        emptyState={getEmptyState()}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onCreatePost={handleCreatePost}
        onLike={handleLike}
        onDeletePost={handleDeletePost}
        onLoadMore={loadNextPage}
        onRefresh={handleRefresh}
      />

      <RightSidebar />
    </div>
  );
}

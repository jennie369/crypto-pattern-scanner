import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { forumCategories } from '../../services/forum';
import LeftSidebar from './components/LeftSidebar';
import CenterFeed from './components/CenterFeed';
import RightSidebar from './components/RightSidebar';
import './Forum3Column.css';

/**
 * Forum3Column Component - SYNCED FROM MOBILE ForumScreen
 * 3-column Community Hub layout (Binance Square style)
 *
 * Layout:
 * - Left Sidebar (280px): Feed filters, Categories, Trending Hashtags
 * - Center Feed (1fr): Posts feed + Post creation
 * - Right Sidebar (360px): Trending topics, Suggested creators
 *
 * Features (synced from Mobile):
 * - Feed Types: explore, following, news, popular, academy
 * - Category Filters: Giao dịch, Tinh thần, Thịnh vượng, Kiếm tiền
 * - Quick Actions: Liked posts, Saved posts
 * - Custom Feeds support
 *
 * Responsive:
 * - < 1024px: Hide left sidebar
 * - < 768px: Hide right sidebar (mobile single column)
 */
export default function Forum3Column() {
  const { user } = useAuth();

  // Posts state
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feed state (synced from Mobile)
  const [selectedFeed, setSelectedFeed] = useState('explore'); // explore, following, news, popular, academy, + category feeds
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, trending, top

  // Custom Feeds state
  const [customFeeds, setCustomFeeds] = useState([]);

  // Sidebar data
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [topMembers, setTopMembers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);

  /**
   * Fetch all posts on mount
   */
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Load posts from database
   */
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // getThreads returns { threads, total, page, totalPages }
      const result = await forumService.getThreads({
        limit: 50,
        sortBy: sortBy === 'latest' ? 'recent' : 'popular'
      });

      // Extract threads array from result
      const threadsData = result?.threads || result || [];

      // Transform data to match PostCard expected format
      const transformedPosts = threadsData.map(thread => ({
        ...thread,
        // Map author to users for PostCard compatibility
        users: thread.author ? {
          display_name: thread.author.full_name || thread.author.display_name,
          avatar_url: thread.author.avatar_url
        } : null
      }));

      setPosts(transformedPosts);
      setFilteredPosts(transformedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle category filter
   */
  const handleCategoryFilter = (categorySlug) => {
    setSelectedCategory(categorySlug);

    if (categorySlug === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.category === categorySlug);
      setFilteredPosts(filtered);
    }
  };

  /**
   * Handle search
   */
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    try {
      const results = await forumService.searchThreads(query);
      setFilteredPosts(results);
    } catch (err) {
      console.error('Error searching:', err);
    }
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);

    const sorted = [...filteredPosts].sort((a, b) => {
      if (newSortBy === 'latest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (newSortBy === 'trending') {
        return b.like_count - a.like_count;
      } else {
        return b.like_count - a.like_count;
      }
    });

    setFilteredPosts(sorted);
  };

  /**
   * Handle post creation
   */
  const handleCreatePost = async (postData) => {
    try {
      // Add authorId to postData before creating thread
      const dataWithAuthor = {
        ...postData,
        authorId: user.id
      };

      const newPost = await forumService.createThread(dataWithAuthor);

      // Transform to match PostCard format
      const transformedPost = {
        ...newPost,
        users: newPost.author ? {
          display_name: newPost.author.full_name || newPost.author.display_name,
          avatar_url: newPost.author.avatar_url
        } : {
          display_name: user.user_metadata?.display_name || user.email,
          avatar_url: user.user_metadata?.avatar_url
        }
      };

      // Add to posts list
      setPosts([transformedPost, ...posts]);
      setFilteredPosts([transformedPost, ...filteredPosts]);

      return transformedPost;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  /**
   * Handle like toggle
   */
  const handleLike = async (postId) => {
    try {
      // toggleLike expects (type, id, userId)
      await forumService.toggleLike('thread', postId, user.id);

      // Refresh posts to update like count
      await loadPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  /**
   * Handle post delete
   */
  const handleDeletePost = async (postId) => {
    try {
      await forumService.deleteThread(postId);

      // Remove from local state
      setPosts(posts.filter(p => p.id !== postId));
      setFilteredPosts(filteredPosts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  /**
   * Handle feed change (from LeftSidebar)
   */
  const handleFeedChange = useCallback((feedType) => {
    setSelectedFeed(feedType);
    setLoading(true);

    // TODO: Implement feed-specific loading logic
    // For now, just reload all posts
    loadPosts();
  }, []);

  /**
   * Handle quick action (Liked/Saved posts)
   */
  const handleQuickAction = useCallback(async (action) => {
    setLoading(true);
    try {
      // TODO: Implement liked/saved posts fetching from API
      if (action === 'liked') {
        setSelectedFeed('liked');
        // const likedPosts = await forumService.getLikedPosts();
        // setFilteredPosts(likedPosts);
      } else if (action === 'saved') {
        setSelectedFeed('saved');
        // const savedPosts = await forumService.getSavedPosts();
        // setFilteredPosts(savedPosts);
      }
    } catch (err) {
      console.error('Error loading quick action:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle create custom feed
   */
  const handleCreateFeed = useCallback(() => {
    // TODO: Open CreateFeedModal
    alert('Tính năng Tạo Feed Mới sẽ sớm được ra mắt!');
  }, []);

  /**
   * Handle edit feeds
   */
  const handleEditFeeds = useCallback(() => {
    // TODO: Open EditFeedsModal
    alert('Tính năng Quản Lý Feed sẽ sớm được ra mắt!');
  }, []);

  return (
    <div className="forum-3column-container">
      {/* Left Sidebar - Feed Filters, Categories, Trending Hashtags */}
      <LeftSidebar
        categories={forumCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryFilter}
        selectedFeed={selectedFeed}
        onFeedChange={handleFeedChange}
        onQuickAction={handleQuickAction}
        customFeeds={customFeeds}
        onCreateFeed={handleCreateFeed}
        onEditFeeds={handleEditFeeds}
      />

      {/* Center Feed - Posts */}
      <CenterFeed
        posts={filteredPosts}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onCreatePost={handleCreatePost}
        onLike={handleLike}
        onDeletePost={handleDeletePost}
      />

      {/* Right Sidebar - Trending, Creators */}
      <RightSidebar
        trending={trendingTopics}
        creators={suggestedCreators}
      />
    </div>
  );
}

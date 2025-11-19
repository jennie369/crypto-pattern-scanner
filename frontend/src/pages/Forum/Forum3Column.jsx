import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import forumService, { forumCategories } from '../../services/forum';
import LeftSidebar from './components/LeftSidebar';
import CenterFeed from './components/CenterFeed';
import RightSidebar from './components/RightSidebar';
import './Forum3Column.css';

/**
 * Forum3Column Component
 * 3-column Community Hub layout (Binance Square style)
 *
 * Layout:
 * - Left Sidebar (280px): Categories, Online Users, Top Members
 * - Center Feed (1fr): Posts feed + Post creation
 * - Right Sidebar (360px): Trending topics, Suggested creators
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

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, trending, top

  // Sidebar data (will be fetched in Phase 2)
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

      const data = await forumService.getThreads({
        limit: 50,
        orderBy: sortBy === 'latest' ? 'created_at' : 'like_count'
      });

      setPosts(data);
      setFilteredPosts(data);
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

      // Add to posts list
      setPosts([newPost, ...posts]);
      setFilteredPosts([newPost, ...filteredPosts]);

      return newPost;
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

  return (
    <div className="forum-3column-container">
      {/* Left Sidebar - Categories, Online Users, Top Members */}
      <LeftSidebar
        categories={forumCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryFilter}
        onlineUsers={onlineUsers}
        topMembers={topMembers}
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

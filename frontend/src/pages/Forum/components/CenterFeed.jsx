import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, TrendingUp, Clock, Star, Filter, RefreshCw, ArrowUp } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import PostCard from './PostCard';
import PostCreationModal from './PostCreationModal';
import './CenterFeed.css';

/**
 * CenterFeed Component - ENHANCED
 * Center column of 3-column Community Hub
 *
 * Enhanced:
 * - Infinite scroll via Intersection Observer
 * - PostSkeleton loading
 * - ScrollToTop button
 * - Feed type awareness
 * - Refresh button
 * - Per-feed empty states
 */
export default function CenterFeed({
  posts = [],
  loading = false,
  loadingMore = false,
  error = null,
  searchQuery = '',
  sortBy = 'latest',
  selectedFeed = 'explore',
  hasMore = true,
  emptyState = {},
  onSearch,
  onSortChange,
  onCreatePost,
  onLike,
  onDeletePost,
  onLoadMore,
  onRefresh
}) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sentinelRef = useRef(null);
  const feedRef = useRef(null);

  /**
   * Infinite scroll observer
   */
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore?.();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, onLoadMore]);

  /**
   * Scroll-to-top visibility
   */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);
  };

  const handleCreatePost = async (postData) => {
    try {
      await onCreatePost(postData);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'latest', label: 'Mới nhất', icon: Clock },
    { value: 'trending', label: 'Thịnh hành', icon: TrendingUp },
    { value: 'top', label: 'Top bài viết', icon: Star }
  ];

  return (
    <div className="center-feed" ref={feedRef}>
      {/* Post Creation Box */}
      {user && (
        <div className="post-creation-box" onClick={() => setShowCreateModal(true)}>
          <div className="post-creation-avatar">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={user.user_metadata?.display_name || user.email} />
            ) : (
              <div className="avatar-placeholder">
                {(user.user_metadata?.display_name || user.email)?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="post-creation-input">
            <p>Chia sẻ kinh nghiệm trading của bạn...</p>
          </div>
          <button className="post-creation-btn">
            <Plus size={20} />
            <span>Tạo bài viết</span>
          </button>
        </div>
      )}

      {/* Feed Tabs */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${selectedFeed === 'explore' ? 'active' : ''}`}
          onClick={() => {}}
        >
          Recommended
        </button>
        <button
          className={`feed-tab ${selectedFeed === 'following' ? 'active' : ''}`}
          onClick={() => {}}
        >
          Following
        </button>
      </div>

      {/* Filter Bar */}
      <div className="feed-controls">
        {/* Refresh */}
        <button className="refresh-btn" onClick={onRefresh} title="Làm mới">
          <RefreshCw size={16} />
        </button>

        {/* Sort */}
        <div className="sort-dropdown">
          <Filter size={18} />
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">
        {/* Loading Skeleton */}
        {loading && (
          <div className="feed-skeletons">
            {[1, 2, 3].map(i => (
              <div key={i} className="post-skeleton">
                <div className="skeleton-header">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-meta">
                    <div className="skeleton-line w-40" />
                    <div className="skeleton-line w-24" />
                  </div>
                </div>
                <div className="skeleton-body">
                  <div className="skeleton-line w-90" />
                  <div className="skeleton-line w-70" />
                  <div className="skeleton-line w-50" />
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-line w-24" />
                  <div className="skeleton-line w-24" />
                  <div className="skeleton-line w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="feed-error">
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={onRefresh}>Thử lại</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="feed-empty">
            <div className="empty-icon">
              <TrendingUp size={64} />
            </div>
            <h3>{emptyState.title || 'Chưa có bài viết nào'}</h3>
            <p>
              {searchQuery
                ? `Không tìm thấy kết quả cho "${searchQuery}"`
                : emptyState.message || 'Hãy là người đầu tiên chia sẻ kinh nghiệm!'
              }
            </p>
            {user && !searchQuery && selectedFeed === 'explore' && (
              <button className="create-first-post-btn" onClick={() => setShowCreateModal(true)}>
                <Plus size={20} />
                Tạo bài viết đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && posts.length > 0 && (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLike={() => onLike(post.id)}
                onDelete={() => onDeletePost(post.id)}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="scroll-sentinel">
              {loadingMore && (
                <div className="loading-more">
                  <div className="loading-spinner small" />
                  <span>Đang tải thêm...</span>
                </div>
              )}
            </div>

            {!hasMore && posts.length > 5 && (
              <div className="end-of-feed">
                <p>Đã hiển thị tất cả bài viết</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button className="scroll-to-top-btn" onClick={scrollToTop}>
          <ArrowUp size={20} />
        </button>
      )}

      {/* Post Creation Modal */}
      {showCreateModal && (
        <PostCreationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
          currentUser={user}
        />
      )}
    </div>
  );
}

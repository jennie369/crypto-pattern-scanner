import React, { useState } from 'react';
import { Plus, Search, TrendingUp, Clock, Star, Filter } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import PostCard from './PostCard';
import PostCreationModal from './PostCreationModal';
import './CenterFeed.css';

/**
 * CenterFeed Component - DAY 2 IMPLEMENTATION
 * Center column of 3-column Community Hub
 *
 * Features:
 * - Post creation box (opens modal)
 * - Search bar with real-time filtering
 * - Sort by: Latest, Trending, Top
 * - Posts feed with PostCard components
 * - Like/Comment actions connected to database
 * - Empty states
 */
export default function CenterFeed({
  posts = [],
  loading = false,
  error = null,
  searchQuery = '',
  sortBy = 'latest',
  onSearch,
  onSortChange,
  onCreatePost,
  onLike,
  onDeletePost
}) {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState('recommended'); // recommended or following

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);

    // Debounce search (wait 300ms after user stops typing)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      if (onSearch) onSearch(query);
    }, 300);
  };

  /**
   * Handle post creation
   */
  const handleCreatePost = async (postData) => {
    try {
      await onCreatePost(postData);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err; // Re-throw to let modal handle error
    }
  };

  /**
   * Sort options for dropdown
   */
  const sortOptions = [
    { value: 'latest', label: 'Mới nhất', icon: Clock },
    { value: 'trending', label: 'Thịnh hành', icon: TrendingUp },
    { value: 'top', label: 'Top bài viết', icon: Star }
  ];

  return (
    <div className="center-feed">
      {/* ═══════════════════════════════════════════════════════════
          POST CREATION BOX
          ═══════════════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════════════
          FEED TABS (RECOMMENDED / FOLLOWING)
          ═══════════════════════════════════════════════════════════ */}
      <div className="feed-tabs">
        <button
          className={`feed-tab ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          Recommended
        </button>
        <button
          className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FILTER BAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="feed-controls">
        {/* Sort Dropdown */}
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

      {/* ═══════════════════════════════════════════════════════════
          POSTS FEED
          ═══════════════════════════════════════════════════════════ */}
      <div className="posts-feed">
        {/* Loading State */}
        {loading && (
          <div className="feed-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="feed-error">
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="feed-empty">
            <div className="empty-icon">
              <TrendingUp size={64} />
            </div>
            <h3>Chưa có bài viết nào</h3>
            <p>
              {searchQuery
                ? `Không tìm thấy kết quả cho "${searchQuery}"`
                : 'Hãy là người đầu tiên chia sẻ kinh nghiệm!'
              }
            </p>
            {user && !searchQuery && (
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
          </div>
        )}

        {/* Load More (Placeholder for pagination) */}
        {!loading && posts.length >= 50 && (
          <div className="load-more">
            <button className="load-more-btn">
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          POST CREATION MODAL
          ═══════════════════════════════════════════════════════════ */}
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

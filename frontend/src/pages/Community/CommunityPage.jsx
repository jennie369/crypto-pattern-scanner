/**
 * CommunityPage - Main community feed page
 * Synced with Mobile Home Tab
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forumService, forumCategories } from '../../services/forum';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/UI';
import CompactSidebar from '../../components/CompactSidebar/CompactSidebar';
import {
  Home, Users, TrendingUp, MessageSquare, Search, Plus,
  Flame, Clock, Star, Filter, Eye, ThumbsUp, CheckCircle,
  Pin, ChevronDown
} from 'lucide-react';
import './CommunityPage.css';

const FEED_TABS = [
  { id: 'recommended', label: 'Đề Xuất', icon: Star },
  { id: 'following', label: 'Đang Theo Dõi', icon: Users },
  { id: 'trending', label: 'Xu Hướng', icon: TrendingUp },
  { id: 'new', label: 'Mới Nhất', icon: Clock },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'recommended');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      let sortBy = 'recent';

      // Map tab to sort option
      switch (activeTab) {
        case 'recommended':
          sortBy = 'popular';
          break;
        case 'following':
          sortBy = 'following';
          break;
        case 'trending':
          sortBy = 'trending';
          break;
        case 'new':
        default:
          sortBy = 'recent';
      }

      const result = await forumService.getThreads({
        page: currentPage,
        sortBy,
        limit: 20
      });

      if (reset) {
        setPosts(result.threads || []);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...(result.threads || [])]);
      }

      setHasMore((result.threads || []).length >= 20);
    } catch (err) {
      console.error('[CommunityPage] Error fetching posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchPosts(true);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchPosts(false);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login', { state: { from: '/community/create' } });
      return;
    }
    navigate('/community/create');
  };

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Page Header */}
          <div className="community-header">
            <div className="header-content">
              <div className="header-title-section">
                <div className="header-icon">
                  <Home size={28} />
                </div>
                <div>
                  <h1 className="heading-gold">Cộng Đồng</h1>
                  <p className="header-subtitle">Kết nối, chia sẻ và học hỏi cùng cộng đồng GEM</p>
                </div>
              </div>

              <button className="btn-create-post" onClick={handleCreatePost}>
                <Plus size={20} />
                <span>Tạo Bài Viết</span>
              </button>
            </div>

            {/* Feed Tabs */}
            <div className="feed-tabs">
              {FEED_TABS.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <TabIcon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="community-feed">
            {loading && posts.length === 0 ? (
              <LoadingSpinner message="Đang tải bài viết..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => fetchPosts(true)} />
            ) : posts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Chưa có bài viết"
                description={activeTab === 'following'
                  ? "Bạn chưa theo dõi ai. Hãy theo dõi để xem bài viết của họ!"
                  : "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!"}
                actionLabel="Tạo Bài Viết"
                onAction={handleCreatePost}
              />
            ) : (
              <>
                <div className="posts-list">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => navigate(`/community/post/${post.id}`)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <button
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Đang tải...' : 'Tải thêm'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Post Card Component
function PostCard({ post, onClick }) {
  const category = forumCategories?.find(c => c.id === post.category);

  return (
    <article className="post-card" onClick={onClick}>
      <div className="post-author">
        <img
          src={post.author?.avatar_url || '/default-avatar.png'}
          alt={post.author?.full_name}
          className="author-avatar"
        />
        <div className="author-info">
          <span className="author-name">{post.author?.full_name || 'Ẩn danh'}</span>
          <span className="post-time">
            {new Date(post.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>

      {post.content && (
        <p className="post-excerpt">
          {post.content.length > 200
            ? post.content.slice(0, 200) + '...'
            : post.content}
        </p>
      )}

      <div className="post-stats">
        {category && (
          <span className="post-category" style={{ '--cat-color': category.color }}>
            {category.name}
          </span>
        )}

        <span className="stat-item">
          <ThumbsUp size={14} />
          {post.like_count || 0}
        </span>
        <span className="stat-item">
          <MessageSquare size={14} />
          {post.reply_count || 0}
        </span>
        <span className="stat-item">
          <Eye size={14} />
          {post.view_count || 0}
        </span>

        {post.is_pinned && (
          <span className="badge-pinned">
            <Pin size={12} />
            Ghim
          </span>
        )}
      </div>
    </article>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import {
  MessageSquare,
  Eye,
  ThumbsUp,
  CheckCircle,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  HelpCircle,
  Star,
  Flame,
  Pin,
  Sparkles,
  Trophy
} from 'lucide-react';
import './Forum.css';

// Icon mapper for category icons
const iconMap = {
  MessageSquare,
  TrendingUp,
  Sparkles,
  Trophy,
  HelpCircle
};

const CategoryIcon = ({ iconName, size = 16 }) => {
  const Icon = iconMap[iconName];
  return Icon ? <Icon size={size} /> : null;
};

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadThreads();
  }, [selectedCategory, sortBy, page]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const result = await forumService.getThreads({
        category: selectedCategory,
        page,
        sortBy
      });
      setThreads(result.threads);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadThreads();
      return;
    }
    setLoading(true);
    try {
      const results = await forumService.searchThreads(searchQuery);
      setThreads(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-page">
      {/* Header */}
      <div className="forum-header">
        <div>
          <h1 className="heading-gold" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare size={32} />
            Community Forum
          </h1>
          <p className="forum-subtitle">
            Kết nối, học hỏi và chia sẻ kinh nghiệm cùng cộng đồng
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/forum/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          <span>Tạo Chủ Đề Mới</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="forum-filters card-glass">
        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm Kiếm
          </button>
        </div>

        {/* Categories */}
        <div className="category-buttons">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Star size={16} />
            Tất Cả
          </button>

          {forumCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{
                '--category-color': cat.color,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CategoryIcon iconName={cat.icon} size={16} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="sort-options">
          <Filter size={16} className="sort-icon" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          <span className="sort-label">Sắp xếp:</span>

          <button
            onClick={() => setSortBy('recent')}
            className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Clock size={14} />
            Mới nhất
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Flame size={14} />
            Phổ biến
          </button>
          <button
            onClick={() => setSortBy('unanswered')}
            className={`sort-btn ${sortBy === 'unanswered' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HelpCircle size={14} />
            Chưa trả lời
          </button>
        </div>
      </div>

      {/* Threads List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải...</p>
        </div>
      ) : threads.length === 0 ? (
        <div className="empty-state card-glass">
          <MessageSquare size={64} className="empty-icon" style={{ color: 'rgba(255, 255, 255, 0.3)', margin: '0 auto 16px' }} />
          <h3>Chưa Có Chủ Đề Nào</h3>
          <p>Hãy là người đầu tiên tạo chủ đề thảo luận!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/forum/new')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} />
            <span>Tạo Chủ Đề Mới</span>
          </button>
        </div>
      ) : (
        <div className="threads-list">
          {threads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => navigate(`/forum/thread/${thread.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Trang Trước
          </button>

          <span className="pagination-info">
            Trang {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Trang Sau →
          </button>
        </div>
      )}
    </div>
  );
}

// Thread Card Component
function ThreadCard({ thread, onClick }) {
  const category = forumCategories.find(c => c.id === thread.category);

  return (
    <div className="thread-card card-glass" onClick={onClick}>
      <div className="thread-card-content">
        {/* Author Avatar */}
        <img
          src={thread.author?.avatar_url || '/default-avatar.png'}
          alt={thread.author?.full_name}
          className="thread-avatar"
          style={{ borderColor: category?.color || '#FFBD59' }}
        />

        {/* Main Content */}
        <div className="thread-main">
          {/* Category & Status Badges */}
          <div className="thread-badges">
            {category && (
              <span
                className="category-badge"
                style={{
                  '--badge-color': category.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CategoryIcon iconName={category.icon} size={14} />
                {category.name}
              </span>
            )}

            {thread.is_answered && (
              <span className="status-badge solved" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} />
                Đã Giải Đáp
              </span>
            )}

            {thread.is_pinned && (
              <span className="status-badge pinned" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pin size={14} />
                Ghim
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="thread-title">{thread.title}</h3>

          {/* Excerpt */}
          <p className="thread-excerpt">{thread.content}</p>

          {/* Meta Info */}
          <div className="thread-meta">
            <span className="thread-author">
              {thread.author?.full_name || 'Anonymous'}
              <UserBadges user={thread.author} size="tiny" />
            </span>

            <span className="thread-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} />
              {thread.reply_count || 0} trả lời
            </span>

            <span className="thread-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} />
              {thread.view_count || 0} lượt xem
            </span>

            <span className="thread-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ThumbsUp size={14} />
              {thread.like_count || 0} thích
            </span>

            <span className="thread-date">
              {new Date(thread.updated_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

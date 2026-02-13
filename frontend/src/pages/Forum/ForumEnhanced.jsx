import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService, forumCategories } from '../../services/forum';
import { useAuth } from '../../contexts/AuthContext';
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
  Star
} from 'lucide-react';
import './Forum.css';

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
    <div className="page-container">
      <div className="page-content">
        <div style={{
          padding: '40px 20px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 className="heading-gold" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={32} />
                Community Forum
              </h1>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Kết nối, học hỏi và chia sẻ kinh nghiệm cùng cộng đồng
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => navigate('/forum/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={20} />
              <span>Tạo Chủ Đề Mới</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="card-glass" style={{
            padding: '24px',
            marginBottom: '32px'
          }}>
            {/* Search Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: 1,
                minWidth: '300px',
                position: 'relative'
              }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    background: 'rgba(17, 34, 80, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSearch}
                style={{ padding: '14px 24px' }}
              >
                Tìm Kiếm
              </button>
            </div>

            {/* Categories */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: selectedCategory === 'all'
                    ? 'rgba(255, 189, 89, 0.2)'
                    : 'rgba(17, 34, 80, 0.6)',
                  border: selectedCategory === 'all'
                    ? '1px solid #FFBD59'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: selectedCategory === 'all' ? '#FFBD59' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <Star size={16} />
                Tất Cả
              </button>

              {forumCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '10px 20px',
                    background: selectedCategory === cat.id
                      ? `${cat.color}20`
                      : 'rgba(17, 34, 80, 0.6)',
                    border: selectedCategory === cat.id
                      ? `1px solid ${cat.color}`
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: selectedCategory === cat.id ? cat.color : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Filter size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
              <span style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginRight: '8px'
              }}>
                Sắp xếp:
              </span>

              {[
                { id: 'recent', label: 'Mới nhất', icon: <Clock size={14} /> },
                { id: 'popular', label: 'Phổ biến', icon: <TrendingUp size={14} /> },
                { id: 'unanswered', label: 'Chưa trả lời', icon: <HelpCircle size={14} /> }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: sortBy === option.id
                      ? 'rgba(255, 189, 89, 0.2)'
                      : 'transparent',
                    border: sortBy === option.id
                      ? '1px solid #FFBD59'
                      : 'none',
                    borderRadius: '6px',
                    color: sortBy === option.id ? '#FFBD59' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Threads List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" />
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '16px' }}>
                Đang tải...
              </p>
            </div>
          ) : threads.length === 0 ? (
            <div className="card-glass" style={{
              padding: '60px',
              textAlign: 'center'
            }}>
              <MessageSquare size={64} style={{
                color: 'rgba(255, 255, 255, 0.3)',
                marginBottom: '24px',
                margin: '0 auto 24px'
              }} />
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '16px'
              }}>
                Chưa Có Chủ Đề Nào
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '32px'
              }}>
                Hãy là người đầu tiên tạo chủ đề thảo luận!
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/forum/new')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={20} />
                <span>Tạo Chủ Đề Mới</span>
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
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
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '32px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(17, 34, 80, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                Trang Trước
              </button>

              <span style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px'
              }}>
                Trang {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(17, 34, 80, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                Trang Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Thread Card Component
function ThreadCard({ thread, onClick }) {
  const category = forumCategories.find(c => c.id === thread.category);
  const replyCount = thread.reply_count || 0;

  return (
    <div
      className="card-glass"
      style={{
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.35)';
      }}
    >
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        {/* Author Avatar */}
        <img
          src={thread.author?.avatar_url || '/default-avatar.png'}
          alt={thread.author?.full_name || 'User'}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid ' + (category?.color || '#FFBD59'),
            flexShrink: 0
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category & Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}>
            {category && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: `${category.color}20`,
                border: `1px solid ${category.color}`,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: category.color
              }}>
                {category.icon} {category.name}
              </span>
            )}

            {thread.is_answered && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00FF88',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#00FF88'
              }}>
                <CheckCircle size={14} />
                Đã Giải Đáp
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '8px',
            lineHeight: 1.3
          }}>
            {thread.title}
          </h3>

          {/* Excerpt */}
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '16px',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {thread.content}
          </p>

          {/* Meta Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
              {thread.author?.full_name || 'Unknown User'}
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} />
              {replyCount} trả lời
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} />
              {thread.view_count || 0} lượt xem
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ThumbsUp size={14} />
              {thread.like_count || 0} thích
            </span>

            <span style={{ marginLeft: 'auto' }}>
              {new Date(thread.updated_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

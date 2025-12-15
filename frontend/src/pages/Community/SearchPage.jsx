/**
 * SearchPage - Community search page
 * Search posts, users, hashtags
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services/forum';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner, ErrorState, EmptyState } from '../../components/UI';
import CompactSidebar from '../../components/CompactSidebar/CompactSidebar';
import {
  Search, FileText, Users, Hash, X, ArrowLeft,
  MessageSquare, Eye, ThumbsUp
} from 'lucide-react';
import './SearchPage.css';

const SEARCH_TABS = [
  { id: 'posts', label: 'Bài Viết', icon: FileText },
  { id: 'users', label: 'Người Dùng', icon: Users },
  { id: 'hashtags', label: 'Hashtag', icon: Hash },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('type') || 'posts';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      let searchResults = [];

      switch (activeTab) {
        case 'posts':
          searchResults = await forumService.searchThreads(query);
          break;

        case 'users':
          const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
            .limit(30);

          if (userError) throw userError;
          searchResults = users || [];
          break;

        case 'hashtags':
          // Search posts by hashtag
          searchResults = await forumService.searchThreads(`#${query.replace('#', '')}`);
          break;

        default:
          searchResults = [];
      }

      setResults(searchResults);
      setSearchParams({ q: query, type: activeTab });
    } catch (err) {
      console.error('[SearchPage] Error:', err);
      setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [query, activeTab, setSearchParams]);

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, []);

  useEffect(() => {
    if (hasSearched && query) {
      performSearch();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setSearchParams({});
  };

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Search Header */}
          <div className="search-page-header">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, người dùng, hashtag..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                  autoFocus
                />
                {query && (
                  <button type="button" className="btn-clear" onClick={handleClear}>
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Search Tabs */}
          <div className="search-tabs">
            {SEARCH_TABS.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <TabIcon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="search-results">
            {loading ? (
              <LoadingSpinner message="Đang tìm kiếm..." />
            ) : error ? (
              <ErrorState message={error} onRetry={performSearch} />
            ) : !hasSearched ? (
              <div className="search-hint">
                <Search size={48} />
                <h3>Tìm kiếm trong cộng đồng</h3>
                <p>Nhập từ khóa để tìm bài viết, người dùng hoặc hashtag</p>
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Không tìm thấy kết quả"
                description={`Không tìm thấy kết quả nào cho "${query}"`}
              />
            ) : (
              <div className="results-list">
                {activeTab === 'posts' && results.map(post => (
                  <PostResult
                    key={post.id}
                    post={post}
                    onClick={() => navigate(`/community/post/${post.id}`)}
                  />
                ))}

                {activeTab === 'users' && results.map(userItem => (
                  <UserResult
                    key={userItem.id}
                    user={userItem}
                    onClick={() => navigate(`/community/user/${userItem.id}`)}
                  />
                ))}

                {activeTab === 'hashtags' && results.map(post => (
                  <PostResult
                    key={post.id}
                    post={post}
                    onClick={() => navigate(`/community/post/${post.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Post Result Component
function PostResult({ post, onClick }) {
  return (
    <div className="result-card" onClick={onClick}>
      <div className="result-author">
        <img
          src={post.author?.avatar_url || '/default-avatar.png'}
          alt={post.author?.full_name}
          className="result-avatar"
        />
        <span className="result-author-name">{post.author?.full_name || 'Ẩn danh'}</span>
      </div>

      <h3 className="result-title">{post.title}</h3>

      {post.content && (
        <p className="result-excerpt">
          {post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content}
        </p>
      )}

      <div className="result-stats">
        <span><ThumbsUp size={14} /> {post.like_count || 0}</span>
        <span><MessageSquare size={14} /> {post.reply_count || 0}</span>
        <span><Eye size={14} /> {post.view_count || 0}</span>
      </div>
    </div>
  );
}

// User Result Component
function UserResult({ user, onClick }) {
  return (
    <div className="result-card user-result" onClick={onClick}>
      <img
        src={user.avatar_url || '/default-avatar.png'}
        alt={user.full_name}
        className="user-result-avatar"
      />

      <div className="user-result-info">
        <h3 className="user-result-name">{user.full_name || 'Người dùng'}</h3>
        <span className="user-result-username">@{user.username || 'unknown'}</span>
        {user.bio && <p className="user-result-bio">{user.bio}</p>}
      </div>
    </div>
  );
}

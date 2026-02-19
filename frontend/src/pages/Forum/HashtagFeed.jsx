import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Hash, Loader2, TrendingUp } from 'lucide-react';
import PostCard from './components/PostCard';
import './HashtagFeed.css';

const PAGE_SIZE = 20;

/**
 * HashtagFeed Page — Posts filtered by hashtag
 * Route: /forum/hashtag/:tag
 */
export default function HashtagFeed() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [relatedTags, setRelatedTags] = useState([]);

  const sentinelRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (tag) {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      loadPosts(1, true);
      loadRelatedTags();
    }
  }, [tag]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadPosts(page + 1, false);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const loadPosts = async (pageNum, isInitial) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Search posts with this hashtag in content or tags
      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, scanner_tier, role)
        `, { count: 'exact' })
        .eq('status', 'published')
        .or(`content.ilike.%#${tag}%,tags.cs.{${tag}}`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const transformed = (data || []).map(p => ({
        ...p,
        users: p.author ? { display_name: p.author.full_name, avatar_url: p.author.avatar_url } : null,
        like_count: p.likes_count || 0,
        reply_count: p.comments_count || 0
      }));

      if (isInitial) {
        setPosts(transformed);
        setTotalCount(count || 0);
      } else {
        setPosts(prev => [...prev, ...transformed]);
      }

      setPage(pageNum);
      setHasMore(transformed.length === PAGE_SIZE);
    } catch (err) {
      console.error('[HashtagFeed] Load error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadRelatedTags = async () => {
    try {
      const { data } = await supabase.rpc('get_trending_hashtags', { result_limit: 8 });
      if (data) {
        setRelatedTags(data.filter(t => t.hashtag !== tag).slice(0, 5));
      }
    } catch {
      // Silent — related tags are optional
    }
  };

  return (
    <div className="hashtag-feed-page">
      <div className="hashtag-feed-main">
        {/* Header */}
        <div className="hashtag-header">
          <button className="btn-back" onClick={() => navigate('/forum')}>
            <ArrowLeft size={20} />
          </button>
          <div className="hashtag-title-group">
            <h1 className="hashtag-title">
              <Hash size={28} className="hash-icon" />
              {tag}
            </h1>
            <p className="hashtag-count">
              {loading ? '...' : `${totalCount} bài viết`}
            </p>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="hashtag-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-line wide" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="hashtag-empty">
            <Hash size={48} />
            <h3>Chưa có bài viết nào</h3>
            <p>Chưa có bài viết nào sử dụng #{tag}</p>
          </div>
        ) : (
          <div className="hashtag-posts">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
              />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="scroll-sentinel">
              {loadingMore && (
                <div className="loading-more">
                  <Loader2 size={24} className="spinner-icon" />
                  <span>Đang tải thêm...</span>
                </div>
              )}
            </div>

            {!hasMore && posts.length > 0 && (
              <div className="end-of-feed">
                <p>Đã hiển thị tất cả bài viết</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related tags sidebar (desktop only) */}
      {relatedTags.length > 0 && (
        <aside className="hashtag-sidebar">
          <div className="related-tags-card">
            <h3 className="related-title">
              <TrendingUp size={16} />
              Hashtag liên quan
            </h3>
            <div className="related-tags-list">
              {relatedTags.map((item, i) => (
                <button
                  key={i}
                  className="related-tag"
                  onClick={() => navigate(`/forum/hashtag/${item.hashtag}`)}
                >
                  <Hash size={14} />
                  <span>{item.hashtag}</span>
                  <span className="tag-count">{item.count || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

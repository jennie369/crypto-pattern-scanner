import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import './NewsFeed.css';

export default function NewsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumPosts();
  }, []);

  const fetchForumPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          author_id,
          likes_count,
          comments_count,
          category,
          profiles:author_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform data to match expected structure
      const transformedData = data?.map(post => ({
        ...post,
        author: post.profiles
      })) || [];

      setPosts(transformedData);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'trading': 'cyan',
      'crypto': 'purple',
      'spiritual': 'pink',
      'discussion': 'gold',
      'news': 'green'
    };
    return colors[category] || 'cyan';
  };

  if (loading) {
    return (
      <div className="news-feed-widget">
        <div className="widget-header">
          <h3>📰 Tin Tức Mới Nhất</h3>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-feed-widget">
      {/* Header */}
      <div className="widget-header">
        <h3>📰 Tin Tức Mới Nhất</h3>
        <a href="/forum" className="view-all-link">
          Xem Tất Cả →
        </a>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có bài đăng nào</p>
            <a href="/forum" className="btn-create-post">
              Tạo Bài Đăng Đầu Tiên
            </a>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              timeAgo={getTimeAgo(post.created_at)}
              categoryColor={getCategoryColor(post.category)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="widget-footer">
        <a href="/forum" className="btn-view-forum">
          Vào Diễn Đàn
        </a>
      </div>
    </div>
  );
}

// Post Card Component
function PostCard({ post, timeAgo, categoryColor }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);

    // TODO: Call API to update likes
    // await supabase.rpc('toggle_like', { post_id: post.id });
  };

  const truncateContent = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-card">
      {/* Author & Time */}
      <div className="post-header">
        <div className="author-info">
          <div className="avatar">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.username} />
            ) : (
              <div className="avatar-placeholder">
                {post.author?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="author-details">
            <span className="author-name">{post.author?.username || 'Anonymous'}</span>
            <div className="post-meta">
              <Clock size={12} />
              <span>{timeAgo}</span>
              {post.category && (
                <>
                  <span className="separator">•</span>
                  <span className={`category-badge category-${categoryColor}`}>
                    {post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">
        <h4 className="post-title">{post.title}</h4>
        <p className="post-excerpt">{truncateContent(post.content)}</p>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${liked ? 'active' : ''}`}
          onClick={handleLike}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>

        <button className="action-btn">
          <MessageSquare size={16} />
          <span>{post.comments_count || 0}</span>
        </button>

        <button className="action-btn">
          <Share2 size={16} />
        </button>
      </div>

      {/* Link overlay */}
      <a href={`/forum/post/${post.id}`} className="post-link-overlay"></a>
    </div>
  );
}

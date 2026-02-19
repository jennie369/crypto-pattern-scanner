import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QuotedPost.css';

/**
 * QuotedPost - Compact nested card for reposted/quoted posts
 * Shows original author, content snippet, and optional thumbnail
 */
export default function QuotedPost({ originalPost }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    if (originalPost?.id) {
      navigate(`/forum/thread/${originalPost.id}`);
    }
  };

  // Deleted/missing original post
  if (!originalPost) {
    return (
      <div className="quoted-post quoted-post-deleted">
        <span className="quoted-post-deleted-text">
          Bài viết gốc đã bị xóa
        </span>
      </div>
    );
  }

  const contentSnippet = originalPost.content
    ? originalPost.content.substring(0, 100) + (originalPost.content.length > 100 ? '...' : '')
    : '';

  const authorName = originalPost.users?.display_name || originalPost.author_name || 'Ẩn danh';
  const authorAvatar = originalPost.users?.avatar_url || originalPost.author_avatar;

  // Get first image as thumbnail
  const thumbnail = originalPost.media_urls?.[0] || originalPost.image_url;

  return (
    <div className="quoted-post" onClick={handleClick}>
      <div className="quoted-post-inner">
        {/* Author line */}
        <div className="quoted-post-author">
          <div className="quoted-post-avatar">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} />
            ) : (
              <span>{authorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="quoted-post-name">{authorName}</span>
        </div>

        {/* Content + optional thumbnail */}
        <div className="quoted-post-body">
          {contentSnippet && (
            <p className="quoted-post-content">{contentSnippet}</p>
          )}
          {thumbnail && (
            <div className="quoted-post-thumbnail">
              <img src={thumbnail} alt="Ảnh bài viết gốc" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

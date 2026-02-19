import React, { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import './LinkPreviewCard.css';

/**
 * LinkPreviewCard - Rich link preview cards
 * Supports full variant (image + title + description + domain) and compact variant (domain + title one line)
 */
export default function LinkPreviewCard({
  url,
  title,
  description,
  image,
  domain,
  variant = 'full',
  loading = false
}) {
  const [imageError, setImageError] = useState(false);

  // Extract domain from URL if not provided
  const displayDomain = domain || (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  })();

  const handleClick = (e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="link-preview-card link-preview-loading">
        <div className="link-preview-skeleton-image skeleton-element" />
        <div className="link-preview-skeleton-content">
          <div className="skeleton-element" style={{ width: '80%', height: 14 }} />
          <div className="skeleton-element" style={{ width: '60%', height: 12 }} />
          <div className="skeleton-element" style={{ width: '40%', height: 10 }} />
        </div>
      </div>
    );
  }

  // Error/fallback: just show URL as link
  if (!title && !description && !image) {
    return (
      <a
        className="link-preview-fallback"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <Globe size={14} />
        <span className="link-preview-fallback-url">{url}</span>
        <ExternalLink size={12} />
      </a>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="link-preview-card link-preview-compact" onClick={handleClick}>
        <Globe size={14} className="link-preview-compact-icon" />
        <span className="link-preview-compact-domain">{displayDomain}</span>
        <span className="link-preview-compact-title">{title}</span>
        <ExternalLink size={12} className="link-preview-compact-arrow" />
      </div>
    );
  }

  // Full variant
  return (
    <div className="link-preview-card link-preview-full" onClick={handleClick}>
      {image && !imageError && (
        <div className="link-preview-image">
          <img
            src={image}
            alt={title || 'Link preview'}
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <div className="link-preview-content">
        <span className="link-preview-domain">
          <Globe size={12} />
          {displayDomain}
        </span>
        {title && (
          <h4 className="link-preview-title">{title}</h4>
        )}
        {description && (
          <p className="link-preview-description">{description}</p>
        )}
      </div>
    </div>
  );
}

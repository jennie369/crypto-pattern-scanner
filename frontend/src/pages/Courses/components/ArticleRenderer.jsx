/**
 * ArticleRenderer - Match Mobile LessonRenderer
 * Renders content blocks from lesson content_blocks JSON
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { COLORS, CALLOUT_STYLES } from '../../../shared/design-tokens';
import './ArticleRenderer.css';

// Callout icons mapping
const CALLOUT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  success: CheckCircle,
  error: AlertCircle,
};

export function ArticleRenderer({ content }) {
  if (!content) return null;

  // Handle string content (HTML)
  if (typeof content === 'string') {
    return (
      <div
        className="article-content article-html"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Handle array of blocks
  if (!Array.isArray(content)) return null;

  return (
    <div className="article-content">
      {content.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, index }) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock block={block} />;
    case 'paragraph':
      return <ParagraphBlock block={block} />;
    case 'list':
      return <ListBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'code':
      return <CodeBlock block={block} />;
    case 'callout':
      return <CalloutBlock block={block} />;
    case 'quote':
      return <QuoteBlock block={block} />;
    case 'divider':
      return <DividerBlock />;
    case 'table':
      return <TableBlock block={block} />;
    case 'steps':
      return <StepsBlock block={block} />;
    case 'html':
      return <HTMLBlock block={block} />;
    case 'embed':
      return <EmbedBlock block={block} />;
    default:
      return null;
  }
}

// Heading Block
function HeadingBlock({ block }) {
  const Tag = `h${block.level || 2}`;
  const sizeClasses = {
    1: 'heading-1',
    2: 'heading-2',
    3: 'heading-3',
    4: 'heading-4',
  };

  return (
    <Tag className={`article-heading ${sizeClasses[block.level] || 'heading-2'}`}>
      {block.text}
    </Tag>
  );
}

// Paragraph Block
function ParagraphBlock({ block }) {
  return (
    <p
      className="article-paragraph"
      dangerouslySetInnerHTML={{ __html: block.text }}
    />
  );
}

// List Block
function ListBlock({ block }) {
  const ListTag = block.ordered ? 'ol' : 'ul';
  return (
    <ListTag className={`article-list ${block.ordered ? 'ordered' : 'unordered'}`}>
      {block.items?.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </ListTag>
  );
}

// Image Block
function ImageBlock({ block }) {
  return (
    <figure className="article-image">
      <motion.img
        src={block.url}
        alt={block.alt || ''}
        loading="lazy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {block.caption && (
        <figcaption className="image-caption">{block.caption}</figcaption>
      )}
    </figure>
  );
}

// Video Block
function VideoBlock({ block }) {
  // Check if it's a YouTube URL
  const isYouTube =
    block.url?.includes('youtube.com') || block.url?.includes('youtu.be');

  if (isYouTube) {
    // Extract video ID
    let videoId = '';
    if (block.url.includes('youtu.be/')) {
      videoId = block.url.split('youtu.be/')[1]?.split('?')[0];
    } else if (block.url.includes('watch?v=')) {
      videoId = block.url.split('watch?v=')[1]?.split('&')[0];
    } else if (block.url.includes('embed/')) {
      videoId = block.url.split('embed/')[1]?.split('?')[0];
    }

    return (
      <div className="article-video youtube">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={block.title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video URL
  return (
    <div className="article-video">
      <video src={block.url} controls poster={block.poster} />
    </div>
  );
}

// Code Block
function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="article-code">
      <div className="code-header">
        <span className="code-language">{block.language || 'code'}</span>
        <button className="copy-button" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={14} />
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-content">
        <code className={`language-${block.language || 'text'}`}>
          {block.code}
        </code>
      </pre>
    </div>
  );
}

// Callout Block
function CalloutBlock({ block }) {
  const variant = block.variant || 'info';
  const style = CALLOUT_STYLES[variant] || CALLOUT_STYLES.info;
  const Icon = CALLOUT_ICONS[variant] || Info;

  return (
    <div
      className={`article-callout callout-${variant}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <div className="callout-icon">
        <Icon size={20} color={style.iconColor} />
      </div>
      <div className="callout-content">
        {block.title && <p className="callout-title">{block.title}</p>}
        <p className="callout-text">{block.text}</p>
      </div>
    </div>
  );
}

// Quote Block
function QuoteBlock({ block }) {
  return (
    <blockquote
      className="article-quote"
      style={{ borderColor: COLORS.primary }}
    >
      <p>{block.text}</p>
      {block.author && <footer>— {block.author}</footer>}
    </blockquote>
  );
}

// Divider Block
function DividerBlock() {
  return (
    <hr
      className="article-divider"
      style={{
        background: `linear-gradient(90deg, transparent, ${COLORS.borderLight}, transparent)`,
      }}
    />
  );
}

// Table Block
function TableBlock({ block }) {
  return (
    <div className="article-table-wrapper">
      <table className="article-table">
        {block.headers && (
          <thead>
            <tr>
              {block.headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows?.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Steps Block
function StepsBlock({ block }) {
  return (
    <div className="article-steps">
      {block.steps?.map((step, i) => (
        <div key={i} className="step-item">
          <div
            className="step-number"
            style={{
              backgroundColor: `${COLORS.primary}20`,
              color: COLORS.primary,
            }}
          >
            {i + 1}
          </div>
          <div className="step-content">
            {step.title && <p className="step-title">{step.title}</p>}
            <p className="step-text">{step.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// HTML Block (raw HTML)
function HTMLBlock({ block }) {
  return (
    <div
      className="article-html-block"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

// Embed Block (iframes, etc.)
function EmbedBlock({ block }) {
  return (
    <div className="article-embed">
      <iframe
        src={block.url}
        title={block.title || 'Embedded content'}
        frameBorder="0"
        allowFullScreen
      />
      {block.caption && (
        <p className="embed-caption">{block.caption}</p>
      )}
    </div>
  );
}

export default ArticleRenderer;

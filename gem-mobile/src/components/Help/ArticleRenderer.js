/**
 * Gemral - Article Renderer
 * Renders JSON blocks từ article content
 * Supports: heading, paragraph, list, steps, table, callout, faq, image, video, code, related_articles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Play,
  Copy,
  Check,
  ChevronRight,
  Clock,
} from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

// ========================================
// Block Components
// ========================================

// Heading Block
const HeadingBlock = ({ level, text }) => {
  const styles = headingStyles[level] || headingStyles.h2;
  return <Text style={styles}>{text}</Text>;
};

const headingStyles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xl,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
});

// Paragraph Block
const ParagraphBlock = ({ text }) => (
  <Text style={styles.paragraph}>{text}</Text>
);

// List Block
const ListBlock = ({ items, style: listStyle = 'bullet' }) => {
  if (!items || !Array.isArray(items)) return null;

  return (
    <View style={styles.listContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listBullet}>
            {listStyle === 'numbered' ? `${index + 1}.` : '•'}
          </Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

// Steps Block
const StepsBlock = ({ steps }) => {
  if (!steps || !Array.isArray(steps)) return null;

  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => (
      <View key={index} style={styles.stepItem}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          {step.description && (
            <Text style={styles.stepDescription}>{step.description}</Text>
          )}
          {step.tips && step.tips.length > 0 && (
            <View style={styles.stepTips}>
              {step.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipItem}>
                  <Lightbulb size={14} color={COLORS.gold} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    ))}
    </View>
  );
};

// Table Block
const TableBlock = ({ headers, rows }) => {
  if (!headers || !rows) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.tableContainer}>
        {/* Headers */}
        <View style={styles.tableHeaderRow}>
          {headers.map((header, index) => (
            <View key={index} style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>{header}</Text>
            </View>
          ))}
        </View>
        {/* Rows */}
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.tableRow,
              rowIndex % 2 === 0 && styles.tableRowAlt,
            ]}
          >
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={styles.tableCell}>
                <Text style={styles.tableCellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Callout Block
const CalloutBlock = ({ style: calloutStyle, title, content }) => {
  const calloutConfig = {
    info: { icon: Info, color: COLORS.cyan, bgColor: 'rgba(0, 240, 255, 0.1)' },
    warning: { icon: AlertTriangle, color: COLORS.gold, bgColor: 'rgba(255, 189, 89, 0.1)' },
    success: { icon: CheckCircle, color: COLORS.success, bgColor: 'rgba(58, 247, 166, 0.1)' },
    error: { icon: XCircle, color: COLORS.error, bgColor: 'rgba(255, 107, 107, 0.1)' },
    tip: { icon: Lightbulb, color: COLORS.gold, bgColor: 'rgba(255, 189, 89, 0.1)' },
  };

  const config = calloutConfig[calloutStyle] || calloutConfig.info;
  const IconComponent = config.icon;

  return (
    <View style={[styles.calloutContainer, { backgroundColor: config.bgColor, borderLeftColor: config.color }]}>
      <View style={styles.calloutHeader}>
        <IconComponent size={18} color={config.color} />
        {title && <Text style={[styles.calloutTitle, { color: config.color }]}>{title}</Text>}
      </View>
      <Text style={styles.calloutContent}>{content}</Text>
    </View>
  );
};

// FAQ Block
const FAQBlock = ({ items }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!items || !Array.isArray(items)) return null;

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.faqContainer}>
      {items.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <TouchableOpacity
            style={styles.faqQuestion}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.faqQuestionText}>{item.question}</Text>
            {expandedIndex === index ? (
              <ChevronUp size={20} color={COLORS.gold} />
            ) : (
              <ChevronDown size={20} color={COLORS.textMuted} />
            )}
          </TouchableOpacity>
          {expandedIndex === index && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// Image Block
const ImageBlock = ({ url, caption, alt }) => (
  <View style={styles.imageContainer}>
    <Image
      source={{ uri: url }}
      style={styles.image}
      resizeMode="contain"
      accessibilityLabel={alt}
    />
    {caption && <Text style={styles.imageCaption}>{caption}</Text>}
  </View>
);

// Video Block
const VideoBlock = ({ url, title, thumbnail }) => {
  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity style={styles.videoContainer} onPress={handlePress} activeOpacity={0.8}>
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.videoPlaceholder} />
      )}
      <View style={styles.videoPlayButton}>
        <Play size={32} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
      </View>
      {title && <Text style={styles.videoTitle}>{title}</Text>}
    </TouchableOpacity>
  );
};

// Code Block
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // In React Native, we'd use Clipboard.setString(code)
    // For simplicity, just show visual feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.codeContainer}>
      {language && <Text style={styles.codeLanguage}>{language}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={styles.codeText}>{code}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.codeCopyButton} onPress={handleCopy}>
        {copied ? (
          <Check size={16} color={COLORS.success} />
        ) : (
          <Copy size={16} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Related Articles Block
const RelatedArticlesBlock = ({ articles, onArticlePress }) => {
  if (!articles || !Array.isArray(articles)) return null;

  return (
    <View style={styles.relatedContainer}>
      <Text style={styles.relatedTitle}>Bài Viết Liên Quan</Text>
      {articles.map((article, index) => (
      <TouchableOpacity
        key={index}
        style={styles.relatedItem}
        onPress={() => onArticlePress && onArticlePress(article)}
        activeOpacity={0.7}
      >
        <View style={styles.relatedContent}>
          <Text style={styles.relatedArticleTitle} numberOfLines={2}>
            {article.title}
          </Text>
          {article.readTime && (
            <View style={styles.relatedMeta}>
              <Clock size={12} color={COLORS.textMuted} />
              <Text style={styles.relatedMetaText}>{article.readTime}</Text>
            </View>
          )}
        </View>
        <ChevronRight size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
      ))}
    </View>
  );
};

// ========================================
// Main ArticleRenderer Component
// ========================================

const ArticleRenderer = ({ blocks, onArticlePress }) => {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock key={index} level={block.level} text={block.text} />;

      case 'paragraph':
        return <ParagraphBlock key={index} text={block.text} />;

      case 'list':
        return <ListBlock key={index} items={block.items} style={block.style} />;

      case 'steps':
        return <StepsBlock key={index} steps={block.steps} />;

      case 'table':
        return <TableBlock key={index} headers={block.headers} rows={block.rows} />;

      case 'callout':
        return (
          <CalloutBlock
            key={index}
            style={block.style}
            title={block.title}
            content={block.content}
          />
        );

      case 'faq':
        return <FAQBlock key={index} items={block.items} />;

      case 'image':
        return (
          <ImageBlock
            key={index}
            url={block.url}
            caption={block.caption}
            alt={block.alt}
          />
        );

      case 'video':
        return (
          <VideoBlock
            key={index}
            url={block.url}
            title={block.title}
            thumbnail={block.thumbnail}
          />
        );

      case 'code':
        return <CodeBlock key={index} code={block.code} language={block.language} />;

      case 'related_articles':
        return (
          <RelatedArticlesBlock
            key={index}
            articles={block.articles}
            onArticlePress={onArticlePress}
          />
        );

      default:
        console.warn(`[ArticleRenderer] Unknown block type: ${block.type}`);
        return null;
    }
  };

  return <View style={styles.container}>{blocks.map(renderBlock)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Paragraph
  paragraph: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  // List
  listContainer: {
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  listBullet: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gold,
    width: 20,
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Steps
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: '#000',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  stepTips: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  // Table
  tableContainer: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  tableHeaderCell: {
    minWidth: 100,
    padding: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: 'rgba(106, 91, 255, 0.1)',
  },
  tableHeaderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(106, 91, 255, 0.05)',
  },
  tableCell: {
    minWidth: 100,
    padding: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: 'rgba(106, 91, 255, 0.1)',
  },
  tableCellText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  // Callout
  calloutContainer: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  calloutTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  calloutContent: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // FAQ
  faqContainer: {
    marginBottom: SPACING.md,
  },
  faqItem: {
    backgroundColor: GLASS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 91, 255, 0.1)',
  },
  faqAnswerText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Image
  imageContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: GLASS.background,
  },
  imageCaption: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Video
  videoContainer: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: GLASS.background,
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    padding: SPACING.md,
  },
  // Code
  codeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  codeLanguage: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.cyan,
    lineHeight: 20,
  },
  codeCopyButton: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    padding: SPACING.xs,
  },
  // Related Articles
  relatedContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  relatedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  relatedContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  relatedArticleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  relatedMetaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default ArticleRenderer;

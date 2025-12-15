/**
 * HTML Lesson Parser Service (React Native Version)
 * Parses HTML content from AI/Teachers and extracts:
 * - Text blocks (headings, paragraphs, lists, etc.)
 * - Images with captions
 * - Embedded quizzes (<gem-quiz> custom tags)
 *
 * Note: React Native doesn't have DOMParser, so we use regex-based parsing
 *
 * Supports custom tags:
 * - <gem-quiz> - Quiz container
 * - <gem-question> - Question with type="single|multiple"
 * - <gem-option> - Answer option with correct="true|false"
 * - <gem-prompt> - Question text
 * - <gem-explanation> - Answer explanation
 */

class HTMLLessonParser {
  /**
   * Parse full HTML content
   * @param {string} html - Raw HTML from editor
   * @returns {object} Parsed content object
   */
  parse(html) {
    if (!html || typeof html !== 'string') {
      return this.getEmptyResult();
    }

    const result = {
      blocks: [],
      quizzes: [],
      images: [],
      metadata: {
        title: '',
        description: '',
        estimatedReadTime: 0,
      },
    };

    try {
      // Extract title from first h1
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        result.metadata.title = this.stripTags(h1Match[1]).trim();
      }

      // Extract description from first paragraph
      const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (pMatch) {
        result.metadata.description = this.stripTags(pMatch[1]).trim().substring(0, 200);
      }

      // Parse all content blocks
      result.blocks = this.parseContentBlocks(html);

      // Parse embedded quizzes
      result.quizzes = this.parseQuizzes(html);

      // Extract all images
      result.images = this.parseImages(html);

      // Calculate estimated read time (avg 200 words per minute)
      const textContent = this.stripTags(html);
      const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
      result.metadata.estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

    } catch (error) {
      console.error('[HTMLLessonParser] Parse error:', error);
      return this.getEmptyResult();
    }

    return result;
  }

  /**
   * Get empty result structure
   */
  getEmptyResult() {
    return {
      blocks: [],
      quizzes: [],
      images: [],
      metadata: {
        title: '',
        description: '',
        estimatedReadTime: 0,
      },
    };
  }

  /**
   * Strip HTML tags from string
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripTags(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  /**
   * Parse content blocks from HTML
   * @param {string} html - HTML content
   * @returns {Array} Array of content blocks
   */
  parseContentBlocks(html) {
    const blocks = [];
    let blockIndex = 0;

    // Remove quiz elements first (will be parsed separately)
    const cleanHtml = html.replace(/<gem-quiz[\s\S]*?<\/gem-quiz>/gi, '');

    // Parse headings (h1-h6)
    const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = headingRegex.exec(cleanHtml)) !== null) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'heading',
        level: parseInt(match[1].charAt(1)),
        content: this.stripTags(match[2]).trim(),
        html: match[0],
      });
    }

    // Parse paragraphs
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(cleanHtml)) !== null) {
      const text = this.stripTags(match[1]).trim();
      if (text) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'paragraph',
          content: text,
          html: match[1],
        });
      }
    }

    // Parse unordered lists
    const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
    while ((match = ulRegex.exec(cleanHtml)) !== null) {
      const items = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(match[1])) !== null) {
        const itemText = this.stripTags(liMatch[1]).trim();
        if (itemText) items.push(itemText);
      }
      if (items.length > 0) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'list',
          ordered: false,
          items,
          html: match[0],
        });
      }
    }

    // Parse ordered lists
    const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
    while ((match = olRegex.exec(cleanHtml)) !== null) {
      const items = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(match[1])) !== null) {
        const itemText = this.stripTags(liMatch[1]).trim();
        if (itemText) items.push(itemText);
      }
      if (items.length > 0) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'list',
          ordered: true,
          items,
          html: match[0],
        });
      }
    }

    // Parse blockquotes
    const blockquoteRegex = /<blockquote[^>]*(?:class="([^"]*)")?[^>]*>([\s\S]*?)<\/blockquote>/gi;
    while ((match = blockquoteRegex.exec(cleanHtml)) !== null) {
      const className = match[1] || '';
      let style = 'quote';
      if (className.includes('tip')) style = 'tip';
      else if (className.includes('warning')) style = 'warning';
      else if (className.includes('info')) style = 'info';
      else if (className.includes('success')) style = 'success';

      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'callout',
        style,
        content: this.stripTags(match[2]).trim(),
        html: match[2],
      });
    }

    // Parse code blocks
    const codeRegex = /<pre[^>]*><code[^>]*(?:class="language-([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi;
    while ((match = codeRegex.exec(cleanHtml)) !== null) {
      blocks.push({
        id: `block-${blockIndex++}`,
        type: 'code',
        language: match[1] || 'text',
        content: this.decodeHTMLEntities(match[2]).trim(),
        html: match[0],
      });
    }

    // Parse figures with images
    const figureRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
    while ((match = figureRegex.exec(cleanHtml)) !== null) {
      const imgMatch = match[1].match(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/i);
      const captionMatch = match[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      if (imgMatch) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'image',
          src: imgMatch[1],
          alt: imgMatch[2] || '',
          caption: captionMatch ? this.stripTags(captionMatch[1]).trim() : '',
          html: match[0],
        });
      }
    }

    // Parse standalone images (not in figures)
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
    while ((match = imgRegex.exec(cleanHtml)) !== null) {
      // Check if this image is inside a figure (already processed)
      const beforeImg = cleanHtml.substring(Math.max(0, match.index - 50), match.index);
      if (!beforeImg.includes('<figure')) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: 'image',
          src: match[1],
          alt: match[2] || '',
          caption: '',
          html: match[0],
        });
      }
    }

    // Sort blocks by their position in original HTML
    blocks.sort((a, b) => {
      const posA = cleanHtml.indexOf(a.html);
      const posB = cleanHtml.indexOf(b.html);
      return posA - posB;
    });

    // Reassign IDs after sorting
    blocks.forEach((block, index) => {
      block.id = `block-${index}`;
    });

    return blocks;
  }

  /**
   * Parse <gem-quiz> elements
   * @param {string} html - HTML content
   * @returns {Array} Array of quiz objects
   */
  parseQuizzes(html) {
    const quizzes = [];
    const quizRegex = /<gem-quiz([^>]*)>([\s\S]*?)<\/gem-quiz>/gi;
    let quizMatch;
    let quizIndex = 0;

    while ((quizMatch = quizRegex.exec(html)) !== null) {
      const attributes = quizMatch[1];
      const content = quizMatch[2];

      // Parse quiz attributes
      const idMatch = attributes.match(/id="([^"]*)"/i);
      const titleMatch = attributes.match(/title="([^"]*)"/i);
      const passingScoreMatch = attributes.match(/passing-score="([^"]*)"/i);
      const requiredMatch = attributes.match(/required="([^"]*)"/i);

      const quiz = {
        id: idMatch ? idMatch[1] : `quiz-${quizIndex}`,
        title: titleMatch ? titleMatch[1] : `Kiểm tra ${quizIndex + 1}`,
        passingScore: passingScoreMatch ? parseInt(passingScoreMatch[1]) : 70,
        required: requiredMatch ? requiredMatch[1] === 'true' : false,
        questions: [],
      };

      // Parse questions
      const questionRegex = /<gem-question([^>]*)>([\s\S]*?)<\/gem-question>/gi;
      let qMatch;
      let qIndex = 0;

      while ((qMatch = questionRegex.exec(content)) !== null) {
        const qAttributes = qMatch[1];
        const qContent = qMatch[2];

        const typeMatch = qAttributes.match(/type="([^"]*)"/i);
        const pointsMatch = qAttributes.match(/points="([^"]*)"/i);

        const question = {
          id: `${quiz.id}-q${qIndex}`,
          type: typeMatch ? typeMatch[1] : 'single',
          points: pointsMatch ? parseInt(pointsMatch[1]) : 10,
          prompt: '',
          options: [],
          explanation: '',
        };

        // Parse prompt
        const promptMatch = qContent.match(/<gem-prompt[^>]*>([\s\S]*?)<\/gem-prompt>/i);
        if (promptMatch) {
          question.prompt = this.stripTags(promptMatch[1]).trim();
        }

        // Parse options
        const optionRegex = /<gem-option([^>]*)>([\s\S]*?)<\/gem-option>/gi;
        let optMatch;
        let optIndex = 0;

        while ((optMatch = optionRegex.exec(qContent)) !== null) {
          const correctMatch = optMatch[1].match(/correct="([^"]*)"/i);
          question.options.push({
            id: `${question.id}-opt${optIndex}`,
            text: this.stripTags(optMatch[2]).trim(),
            isCorrect: correctMatch ? correctMatch[1] === 'true' : false,
          });
          optIndex++;
        }

        // Parse explanation
        const explanationMatch = qContent.match(/<gem-explanation[^>]*>([\s\S]*?)<\/gem-explanation>/i);
        if (explanationMatch) {
          question.explanation = this.stripTags(explanationMatch[1]).trim();
        }

        quiz.questions.push(question);
        qIndex++;
      }

      quizzes.push(quiz);
      quizIndex++;
    }

    return quizzes;
  }

  /**
   * Extract all images from HTML
   * @param {string} html - HTML content
   * @returns {Array} Array of image objects
   */
  parseImages(html) {
    const images = [];
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
    let match;
    let index = 0;

    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) {
        images.push({
          id: `img-${index}`,
          src: match[1],
          alt: match[2] || '',
          width: null,
          height: null,
        });
        index++;
      }
    }

    return images;
  }

  /**
   * Decode HTML entities
   * @param {string} str - String with HTML entities
   * @returns {string} Decoded string
   */
  decodeHTMLEntities(str) {
    if (!str) return '';
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  /**
   * Escape HTML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Validate parsed content
   * @param {object} content - Parsed content
   * @returns {object} Validation result
   */
  validate(content) {
    const errors = [];
    const warnings = [];

    if (!content) {
      errors.push('Nội dung trống');
      return { valid: false, errors, warnings };
    }

    // Check for quizzes with no correct answers
    content.quizzes?.forEach(quiz => {
      quiz.questions?.forEach((q, qIndex) => {
        const hasCorrect = q.options?.some(opt => opt.isCorrect);
        if (!hasCorrect) {
          errors.push(`Quiz "${quiz.title}" - Câu ${qIndex + 1}: Chưa có đáp án đúng`);
        }
        if (!q.prompt) {
          errors.push(`Quiz "${quiz.title}" - Câu ${qIndex + 1}: Thiếu câu hỏi`);
        }
        if (q.options?.length < 2) {
          warnings.push(`Quiz "${quiz.title}" - Câu ${qIndex + 1}: Chỉ có ${q.options?.length || 0} lựa chọn`);
        }
      });
    });

    // Check for images without alt text
    content.images?.forEach((img, index) => {
      if (!img.alt) {
        warnings.push(`Hình ${index + 1}: Thiếu mô tả alt text`);
      }
    });

    // Check for empty blocks
    if (content.blocks?.length === 0 && content.quizzes?.length === 0) {
      warnings.push('Nội dung không có text blocks hoặc quiz');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get statistics about parsed content
   * @param {object} content - Parsed content
   * @returns {object} Statistics
   */
  getStats(content) {
    return {
      blockCount: content?.blocks?.length || 0,
      quizCount: content?.quizzes?.length || 0,
      questionCount: content?.quizzes?.reduce((acc, q) => acc + (q.questions?.length || 0), 0) || 0,
      imageCount: content?.images?.length || 0,
      estimatedReadTime: content?.metadata?.estimatedReadTime || 0,
    };
  }
}

// Export singleton instance
export const htmlLessonParser = new HTMLLessonParser();
export default HTMLLessonParser;

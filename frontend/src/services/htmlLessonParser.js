/**
 * HTML Lesson Parser Service
 * Parses HTML content from AI/Teachers and extracts:
 * - Text blocks (headings, paragraphs, lists, etc.)
 * - Images with captions
 * - Embedded quizzes (<gem-quiz> custom tags)
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
      // Use DOMParser (Web browser)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract title from first h1
      const h1 = doc.querySelector('h1');
      if (h1) {
        result.metadata.title = h1.textContent.trim();
      }

      // Extract description from .lesson-description or first paragraph
      const description = doc.querySelector('.lesson-description, .lesson-intro p, p:first-of-type');
      if (description) {
        result.metadata.description = description.textContent.trim().substring(0, 200);
      }

      // Parse all content blocks
      result.blocks = this.parseContentBlocks(doc);

      // Parse embedded quizzes (<gem-quiz> custom tags)
      result.quizzes = this.parseQuizzes(doc);

      // Extract all images
      result.images = this.parseImages(doc);

      // Calculate estimated read time (avg 200 words per minute)
      const textContent = doc.body?.textContent || '';
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
   * Parse content blocks from document
   * @param {Document} doc - Parsed document
   * @returns {Array} Array of content blocks
   */
  parseContentBlocks(doc) {
    const blocks = [];
    const body = doc.body;
    if (!body) return blocks;

    // Get all direct children and nested elements
    const elements = body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, code, figure, img, section, div.pattern-item, div.lesson-content > *');

    let blockIndex = 0;

    elements.forEach((element) => {
      // Skip quiz elements (handled separately)
      if (element.tagName?.toLowerCase() === 'gem-quiz') return;
      if (element.closest('gem-quiz')) return;

      // Skip if already processed as part of parent
      if (element.closest('figure') && element.tagName !== 'FIGURE') return;

      const block = this.parseElement(element, blockIndex);
      if (block) {
        blocks.push(block);
        blockIndex++;
      }
    });

    return blocks;
  }

  /**
   * Parse a single element into a block
   * @param {Element} element - DOM element
   * @param {number} index - Block index
   * @returns {object|null} Block object or null
   */
  parseElement(element, index) {
    const tagName = element.tagName?.toLowerCase() || '';
    const blockId = `block-${index}`;

    // Headings
    if (/^h[1-6]$/.test(tagName)) {
      return {
        id: blockId,
        type: 'heading',
        level: parseInt(tagName.charAt(1)),
        content: element.textContent.trim(),
        html: element.outerHTML,
      };
    }

    // Paragraphs
    if (tagName === 'p') {
      const text = element.textContent.trim();
      if (!text) return null;
      return {
        id: blockId,
        type: 'paragraph',
        content: text,
        html: element.innerHTML,
      };
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent.trim())
        .filter(text => text.length > 0);

      if (items.length === 0) return null;

      return {
        id: blockId,
        type: 'list',
        ordered: tagName === 'ol',
        items,
        html: element.outerHTML,
      };
    }

    // Blockquotes / Tips / Warnings
    if (tagName === 'blockquote') {
      const classList = element.classList;
      let style = 'quote';
      if (classList.contains('tip')) style = 'tip';
      else if (classList.contains('warning')) style = 'warning';
      else if (classList.contains('info')) style = 'info';
      else if (classList.contains('success')) style = 'success';

      return {
        id: blockId,
        type: 'callout',
        style,
        content: element.textContent.trim(),
        html: element.innerHTML,
      };
    }

    // Code blocks
    if (tagName === 'pre' || tagName === 'code') {
      const codeEl = tagName === 'pre' ? element.querySelector('code') || element : element;
      const language = codeEl.getAttribute('data-language') ||
                       codeEl.className.match(/language-(\w+)/)?.[1] ||
                       'text';
      return {
        id: blockId,
        type: 'code',
        language,
        content: codeEl.textContent.trim(),
        html: element.outerHTML,
      };
    }

    // Figures (images with captions)
    if (tagName === 'figure') {
      const img = element.querySelector('img');
      const caption = element.querySelector('figcaption');
      if (img) {
        return {
          id: blockId,
          type: 'image',
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || '',
          caption: caption?.textContent?.trim() || '',
          html: element.outerHTML,
        };
      }
    }

    // Standalone images
    if (tagName === 'img') {
      return {
        id: blockId,
        type: 'image',
        src: element.getAttribute('src') || '',
        alt: element.getAttribute('alt') || '',
        caption: '',
        html: element.outerHTML,
      };
    }

    // Sections and divs with class
    if (tagName === 'section' || (tagName === 'div' && element.className)) {
      const content = element.innerHTML;
      if (content.trim().length === 0) return null;

      return {
        id: blockId,
        type: 'section',
        className: element.className,
        html: element.outerHTML,
      };
    }

    return null;
  }

  /**
   * Parse <gem-quiz> elements
   * @param {Document} doc - Parsed document
   * @returns {Array} Array of quiz objects
   */
  parseQuizzes(doc) {
    const quizzes = [];
    const quizElements = doc.querySelectorAll('gem-quiz');

    quizElements.forEach((quizEl, quizIndex) => {
      const quiz = {
        id: quizEl.getAttribute('id') || `quiz-${quizIndex}`,
        title: quizEl.getAttribute('title') || `Kiểm tra ${quizIndex + 1}`,
        passingScore: parseInt(quizEl.getAttribute('passing-score')) || 70,
        required: quizEl.getAttribute('required') === 'true',
        questions: [],
      };

      const questionElements = quizEl.querySelectorAll('gem-question');

      questionElements.forEach((qEl, qIndex) => {
        const question = {
          id: `${quiz.id}-q${qIndex}`,
          type: qEl.getAttribute('type') || 'single', // 'single' | 'multiple'
          points: parseInt(qEl.getAttribute('points')) || 10,
          prompt: '',
          options: [],
          explanation: '',
        };

        // Get prompt text
        const promptEl = qEl.querySelector('gem-prompt');
        if (promptEl) {
          question.prompt = promptEl.textContent.trim();
        }

        // Get options
        const optionElements = qEl.querySelectorAll('gem-option');
        optionElements.forEach((optEl, optIndex) => {
          question.options.push({
            id: `${question.id}-opt${optIndex}`,
            text: optEl.textContent.trim(),
            isCorrect: optEl.getAttribute('correct') === 'true',
          });
        });

        // Get explanation
        const explanationEl = qEl.querySelector('gem-explanation');
        if (explanationEl) {
          question.explanation = explanationEl.textContent.trim();
        }

        quiz.questions.push(question);
      });

      quizzes.push(quiz);
    });

    return quizzes;
  }

  /**
   * Extract all images from document
   * @param {Document} doc - Parsed document
   * @returns {Array} Array of image objects
   */
  parseImages(doc) {
    const images = [];
    const imgElements = doc.querySelectorAll('img');

    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src');
      if (src) {
        images.push({
          id: `img-${index}`,
          src,
          alt: img.getAttribute('alt') || '',
          width: img.getAttribute('width') || null,
          height: img.getAttribute('height') || null,
        });
      }
    });

    return images;
  }

  /**
   * Convert parsed content back to clean HTML
   * @param {object} parsedContent - Parsed content object
   * @returns {string} Clean HTML string
   */
  toCleanHTML(parsedContent) {
    if (!parsedContent?.blocks) return '';

    let html = '';

    parsedContent.blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          html += `<h${block.level}>${this.escapeHTML(block.content)}</h${block.level}>\n`;
          break;

        case 'paragraph':
          html += `<p>${block.html || this.escapeHTML(block.content)}</p>\n`;
          break;

        case 'image':
          html += `<figure>
            <img src="${block.src}" alt="${this.escapeHTML(block.alt)}" />
            ${block.caption ? `<figcaption>${this.escapeHTML(block.caption)}</figcaption>` : ''}
          </figure>\n`;
          break;

        case 'list':
          const tag = block.ordered ? 'ol' : 'ul';
          html += `<${tag}>
            ${block.items.map(item => `<li>${this.escapeHTML(item)}</li>`).join('\n')}
          </${tag}>\n`;
          break;

        case 'callout':
          html += `<blockquote class="${block.style}">${block.html || this.escapeHTML(block.content)}</blockquote>\n`;
          break;

        case 'code':
          html += `<pre><code class="language-${block.language}">${this.escapeHTML(block.content)}</code></pre>\n`;
          break;

        case 'section':
          html += block.html || '';
          break;

        default:
          if (block.html) {
            html += block.html + '\n';
          }
      }
    });

    return html.trim();
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

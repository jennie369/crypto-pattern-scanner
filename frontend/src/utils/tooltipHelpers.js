// ============================================
// 💡 TOOLTIP CONTENT HELPERS
// Helper functions để render nội dung tooltip
// ============================================

import {
  STATE_TOOLTIPS,
  TIMEFRAME_TOOLTIPS,
  DIRECTION_TOOLTIPS,
  PATTERN_TYPE_TOOLTIPS
} from '../constants/badgeTooltips';

/**
 * Get formatted tooltip content for state badge
 */
export const getStateTooltipContent = (state) => {
  const tooltip = STATE_TOOLTIPS[state] || STATE_TOOLTIPS.FRESH;

  return {
    title: tooltip.title,
    sections: [
      { label: 'Mô tả', content: tooltip.description },
      { label: 'Hành động', content: tooltip.action, highlight: true },
      { label: 'Timing', content: tooltip.timing },
      { label: 'Ví dụ', content: tooltip.example, isExample: true }
    ]
  };
};

/**
 * Get formatted tooltip content for timeframe badge
 */
export const getTimeframeTooltipContent = (quality) => {
  const tooltip = TIMEFRAME_TOOLTIPS[quality] || TIMEFRAME_TOOLTIPS.CAUTION;

  return {
    title: tooltip.title,
    sections: [
      { label: 'Mô tả', content: tooltip.description },
      { label: 'Win Rate', content: tooltip.winRate },
      { label: 'Độ tin cậy', content: tooltip.reliability },
      { label: 'Khuyến nghị', content: tooltip.recommendation, highlight: true },
      { label: 'Ví dụ', content: tooltip.example, isExample: true }
    ]
  };
};

/**
 * Get formatted tooltip content for direction badge
 */
export const getDirectionTooltipContent = (direction) => {
  const tooltip = DIRECTION_TOOLTIPS[direction] || DIRECTION_TOOLTIPS.LONG;

  return {
    title: tooltip.title,
    sections: [
      { label: 'Mô tả', content: tooltip.description },
      { label: 'Entry', content: tooltip.action },
      { label: 'Profit', content: tooltip.profit },
      { label: 'Risk', content: tooltip.risk },
      { label: 'Ví dụ', content: tooltip.example, isExample: true }
    ]
  };
};

/**
 * Get formatted tooltip content for pattern type badge
 */
export const getPatternTypeTooltipContent = (type) => {
  const tooltip = PATTERN_TYPE_TOOLTIPS[type] || PATTERN_TYPE_TOOLTIPS.CONTINUATION;

  return {
    title: tooltip.title,
    sections: [
      { label: 'Mô tả', content: tooltip.description },
      {
        label: 'Đặc điểm',
        content: tooltip.characteristics,
        isList: true
      },
      { label: 'Risk Level', content: tooltip.risk, highlight: true },
      { label: 'Ví dụ', content: tooltip.examples, isExample: true }
    ]
  };
};

/**
 * Render tooltip content as JSX
 */
export const renderTooltipContent = (contentData) => {
  return (
    <>
      <strong>{contentData.title}</strong>
      {contentData.sections.map((section, idx) => {
        if (section.isList) {
          return (
            <div key={idx}>
              <p><strong>{section.label}:</strong></p>
              <ul>
                {section.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (section.isExample) {
          return (
            <div key={idx} className="example">
              💡 {section.content}
            </div>
          );
        }

        return (
          <p key={idx} className={section.highlight ? 'highlight' : ''}>
            <strong>{section.label}:</strong> {section.content}
          </p>
        );
      })}
    </>
  );
};

export default {
  getStateTooltipContent,
  getTimeframeTooltipContent,
  getDirectionTooltipContent,
  getPatternTypeTooltipContent,
  renderTooltipContent
};

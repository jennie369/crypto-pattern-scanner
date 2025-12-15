/**
 * Gemral - Export Templates Index
 */

export { default as ReadingCardTemplate } from './ReadingCardTemplate';
export { default as ChatWisdomTemplate } from './ChatWisdomTemplate';
export { default as TradingSignalTemplate } from './TradingSignalTemplate';

// Template registry
export const TEMPLATE_COMPONENTS = {
  reading_card: require('./ReadingCardTemplate').default,
  chat_wisdom: require('./ChatWisdomTemplate').default,
  trading_signal: require('./TradingSignalTemplate').default,
};

// Get template component by ID
export const getTemplateComponent = (templateId) => {
  return TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS.reading_card;
};

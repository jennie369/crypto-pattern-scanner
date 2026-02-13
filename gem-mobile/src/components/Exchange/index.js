/**
 * =====================================================
 * Exchange Components Index
 * =====================================================
 *
 * Export all Exchange-related components
 *
 * =====================================================
 */

// Main components
export { default as ExchangeCard } from './ExchangeCard';
export { default as DepositPromptModal } from './DepositPromptModal';
export { default as BalanceWidget } from './BalanceWidget';

// Default export as object
export default {
  ExchangeCard: require('./ExchangeCard').default,
  DepositPromptModal: require('./DepositPromptModal').default,
  BalanceWidget: require('./BalanceWidget').default,
};

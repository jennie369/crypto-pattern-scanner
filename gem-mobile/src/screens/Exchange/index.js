/**
 * =====================================================
 * Exchange Screens Index
 * =====================================================
 *
 * Export all Exchange-related screens
 *
 * =====================================================
 */

export { default as ExchangeOnboardingScreen } from './ExchangeOnboardingScreen';
export { default as ExchangeAccountsScreen } from './ExchangeAccountsScreen';
export { default as APIConnectionScreen } from './APIConnectionScreen';

// Default export
export default {
  ExchangeOnboardingScreen: require('./ExchangeOnboardingScreen').default,
  ExchangeAccountsScreen: require('./ExchangeAccountsScreen').default,
  APIConnectionScreen: require('./APIConnectionScreen').default,
};

/**
 * Alert Service
 * Global dark alert service that can be used instead of Alert.alert
 * Provides dark themed alerts matching the app theme
 */

let _showAlert = null;
let _hideAlert = null;
let _pendingAlerts = [];

/**
 * Register the alert handler from the root component
 */
export const registerAlertHandler = (showFn, hideFn) => {
  _showAlert = showFn;
  _hideAlert = hideFn;

  // Process any pending alerts that were queued before registration
  if (_pendingAlerts.length > 0) {
    const pending = _pendingAlerts.shift();
    setTimeout(() => {
      _showAlert(pending);
    }, 100);
  }
};

/**
 * Show a dark themed alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message (optional)
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {Array} buttons - Array of button objects: [{ text: string, onPress: function, style?: 'default'|'cancel'|'destructive' }]
 */
export const showAlert = (title, message, type = 'info', buttons = [{ text: 'OK' }]) => {
  const alertConfig = {
    title,
    message,
    type,
    buttons,
  };

  if (_showAlert) {
    _showAlert(alertConfig);
  } else {
    // Queue alert to be shown once handler is registered
    _pendingAlerts.push(alertConfig);

    // Set timeout fallback in case handler never registers
    setTimeout(() => {
      if (!_showAlert && _pendingAlerts.includes(alertConfig)) {
        // Remove from pending and show native alert as last resort
        _pendingAlerts = _pendingAlerts.filter(a => a !== alertConfig);
        const { Alert } = require('react-native');
        Alert.alert(title, message, buttons);
      }
    }, 500);
  }
};

/**
 * Hide the current alert
 */
export const hideAlert = () => {
  if (_hideAlert) {
    _hideAlert();
  }
};

/**
 * Shorthand methods
 */
export const alertSuccess = (title, message, buttons) => showAlert(title, message, 'success', buttons);
export const alertError = (title, message, buttons) => showAlert(title, message, 'error', buttons);
export const alertWarning = (title, message, buttons) => showAlert(title, message, 'warning', buttons);
export const alertInfo = (title, message, buttons) => showAlert(title, message, 'info', buttons);

export default {
  register: registerAlertHandler,
  show: showAlert,
  hide: hideAlert,
  success: alertSuccess,
  error: alertError,
  warning: alertWarning,
  info: alertInfo,
};

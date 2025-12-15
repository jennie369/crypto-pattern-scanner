/**
 * Reactotron Configuration
 * Debugging tool for React Native
 *
 * SETUP:
 * 1. Download Reactotron app: https://github.com/infinitered/reactotron/releases
 * 2. Run Reactotron app on your computer
 * 3. Run your React Native app
 * 4. Reactotron will automatically connect
 */

import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only configure in development
if (__DEV__) {
  Reactotron
    .setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: 'Gemral Mobile',
      // For physical device, use your computer's IP address:
      // host: '192.168.1.xxx',
    })
    .useReactNative({
      asyncStorage: true, // Monitor AsyncStorage
      networking: {
        ignoreUrls: /symbolicate|127\.0\.0\.1/,
      },
      editor: false,
      errors: { veto: () => false }, // Capture all errors
      overlay: false,
    })
    .connect();

  // Extend console to also log to Reactotron
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.log = (...args) => {
    Reactotron.log(...args);
    originalConsoleLog.apply(console, args);
  };

  console.warn = (...args) => {
    Reactotron.warn(args.join(' '));
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args) => {
    Reactotron.error(args.join(' '));
    originalConsoleError.apply(console, args);
  };

  // Add custom commands
  Reactotron.onCustomCommand({
    command: 'clearLogs',
    handler: () => {
      Reactotron.clear();
      console.log('Reactotron logs cleared!');
    },
    title: 'Clear Logs',
    description: 'Clear all Reactotron logs',
  });

  // Make Reactotron available globally for quick debugging
  console.tron = Reactotron;

  console.log('🔧 Reactotron Configured - Ready for debugging!');
}

export default Reactotron;

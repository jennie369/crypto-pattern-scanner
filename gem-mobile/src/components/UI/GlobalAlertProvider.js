/**
 * GlobalAlertProvider Component
 * Provides global dark alert functionality across the app
 *
 * Usage: Wrap your app with this provider in App.js
 * Then use alertService.show() anywhere in your app
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import DarkAlert from './DarkAlert';
import { registerAlertHandler } from '../../services/alertService';

const GlobalAlertProvider = memo(({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const isRegistered = useRef(false);

  const showAlert = useCallback((config) => {
    setAlertConfig({
      visible: true,
      title: config.title || '',
      message: config.message || '',
      type: config.type || 'info',
      buttons: config.buttons || [{ text: 'OK' }],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  // Register handlers immediately on first render
  if (!isRegistered.current) {
    registerAlertHandler(showAlert, hideAlert);
    isRegistered.current = true;
  }

  // Also register in useEffect to ensure it's done after mount
  useEffect(() => {
    registerAlertHandler(showAlert, hideAlert);
  }, [showAlert, hideAlert]);

  return (
    <>
      {children}
      <DarkAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </>
  );
});

export default GlobalAlertProvider;

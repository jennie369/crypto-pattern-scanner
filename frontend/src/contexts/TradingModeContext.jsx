import React, { createContext, useContext, useState, useEffect } from 'react';

const TradingModeContext = createContext();

/**
 * Trading Mode Provider
 * Manages global state for Real vs Paper trading mode
 * Persists mode preference to localStorage
 */
export const TradingModeProvider = ({ children }) => {
  // Initialize mode from localStorage or default to 'real'
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('tradingMode');
      return savedMode && ['real', 'paper'].includes(savedMode) ? savedMode : 'real';
    } catch (error) {
      console.error('Error reading trading mode from localStorage:', error);
      return 'real';
    }
  });

  // Persist mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('tradingMode', mode);
    } catch (error) {
      console.error('Error saving trading mode to localStorage:', error);
    }
  }, [mode]);

  /**
   * Toggle between real and paper mode
   */
  const toggleMode = () => {
    setMode(prev => prev === 'real' ? 'paper' : 'real');
  };

  /**
   * Set mode directly
   * @param {string} newMode - 'real' or 'paper'
   */
  const setModeDirectly = (newMode) => {
    if (['real', 'paper'].includes(newMode)) {
      setMode(newMode);
    } else {
      console.error('Invalid trading mode:', newMode);
    }
  };

  // Helper booleans for convenience
  const isPaperMode = mode === 'paper';
  const isRealMode = mode === 'real';

  const value = {
    mode,              // Current mode: 'real' or 'paper'
    setMode: setModeDirectly,
    toggleMode,        // Toggle between modes
    isPaperMode,       // Boolean: true if in paper mode
    isRealMode,        // Boolean: true if in real mode
  };

  return (
    <TradingModeContext.Provider value={value}>
      {children}
    </TradingModeContext.Provider>
  );
};

/**
 * Hook to access trading mode context
 * @returns {Object} Trading mode context value
 * @throws {Error} If used outside TradingModeProvider
 */
export const useTradingMode = () => {
  const context = useContext(TradingModeContext);

  if (!context) {
    throw new Error('useTradingMode must be used within TradingModeProvider');
  }

  return context;
};

/**
 * HOC to inject trading mode props into a component
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component with trading mode props
 */
export const withTradingMode = (Component) => {
  return (props) => {
    const tradingMode = useTradingMode();
    return <Component {...props} tradingMode={tradingMode} />;
  };
};

export default TradingModeContext;

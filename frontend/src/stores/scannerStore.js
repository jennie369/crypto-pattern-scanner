/**
 * Scanner Store - Zustand
 * Persistent state management for scanner page
 * Prevents scan results from being reset on UI interactions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useScannerStore = create(
  persist(
    (set, get) => ({
      // Scan state
      scanResults: [],
      selectedPattern: null,
      isScanning: false,
      lastScanTime: null,

      // Multi-TF Results (persisted to prevent loss on tab switch)
      multiTFResults: null,

      // Selected coins & settings
      selectedCoin: 'BTC',
      timeframe: '1H',
      patternFilter: 'All',

      // Actions
      setScanResults: (results) =>
        set({
          scanResults: results,
          lastScanTime: Date.now(),
        }),

      setSelectedPattern: (pattern) => set({ selectedPattern: pattern }),

      setIsScanning: (status) => set({ isScanning: status }),

      setMultiTFResults: (results) => set({ multiTFResults: results }),

      clearScanResults: () =>
        set({
          scanResults: [],
          selectedPattern: null,
          multiTFResults: null,
          lastScanTime: null,
        }),

      setSelectedCoin: (coin) => set({ selectedCoin: coin }),

      setTimeframe: (timeframe) => set({ timeframe }),

      setPatternFilter: (filter) => set({ patternFilter: filter }),

      // Getters
      getScanResultsCount: () => get().scanResults.length,

      hasResults: () => get().scanResults.length > 0,
    }),
    {
      name: 'scanner-storage', // LocalStorage key
      // Only persist these fields (not isScanning)
      partialize: (state) => ({
        scanResults: state.scanResults,
        selectedPattern: state.selectedPattern,
        multiTFResults: state.multiTFResults,
        lastScanTime: state.lastScanTime,
        selectedCoin: state.selectedCoin,
        timeframe: state.timeframe,
        patternFilter: state.patternFilter,
      }),
    }
  )
);

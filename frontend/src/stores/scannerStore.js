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

      // Zone state for chart overlay
      zones: [],
      highlightedZoneId: null,

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

      setSelectedPattern: (pattern) =>
        set({
          selectedPattern: pattern,
          highlightedZoneId: pattern?.id || null,
        }),

      setIsScanning: (status) => set({ isScanning: status }),

      setZones: (zones) => set({ zones }),

      setHighlightedZoneId: (id) => set({ highlightedZoneId: id }),

      clearZones: () => set({ zones: [], highlightedZoneId: null }),

      setMultiTFResults: (results) => set({ multiTFResults: results }),

      clearScanResults: () =>
        set({
          scanResults: [],
          selectedPattern: null,
          multiTFResults: null,
          lastScanTime: null,
          zones: [],
          highlightedZoneId: null,
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
        zones: state.zones,
        multiTFResults: state.multiTFResults,
        lastScanTime: state.lastScanTime,
        selectedCoin: state.selectedCoin,
        timeframe: state.timeframe,
        patternFilter: state.patternFilter,
      }),
    }
  )
);

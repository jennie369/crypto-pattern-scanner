/**
 * Portfolio Custom Hook
 * Manages portfolio data, real-time updates, and state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchHoldings,
  fetchTransactions,
  getPortfolioStats,
  updateHoldingPrices,
  addHolding,
  updateHolding,
  deleteHolding,
  addTransaction,
} from '../services/portfolioApi';

export function usePortfolio(userId) {
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all portfolio data
  const loadPortfolioData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch in parallel
      const [holdingsResult, transactionsResult, statsResult] = await Promise.all([
        fetchHoldings(userId),
        fetchTransactions(userId),
        getPortfolioStats(userId),
      ]);

      if (holdingsResult.error) throw holdingsResult.error;
      if (transactionsResult.error) throw transactionsResult.error;
      if (statsResult.error) throw statsResult.error;

      setHoldings(holdingsResult.data || []);
      setTransactions(transactionsResult.data || []);
      setStats(statsResult.data);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Refresh holdings
  const refreshHoldings = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await fetchHoldings(userId);
      if (error) throw error;
      setHoldings(data || []);
    } catch (err) {
      console.error('Error refreshing holdings:', err);
      setError(err.message);
    }
  }, [userId]);

  // Refresh transactions
  const refreshTransactions = useCallback(async (filters = {}) => {
    if (!userId) return;

    try {
      const { data, error } = await fetchTransactions(userId, filters);
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      setError(err.message);
    }
  }, [userId]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await getPortfolioStats(userId);
      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError(err.message);
    }
  }, [userId]);

  // Add new holding
  const createHolding = useCallback(async (holdingData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await addHolding(userId, holdingData);
      if (error) throw error;

      // Refresh all data
      await Promise.all([
        refreshHoldings(),
        refreshTransactions(),
        refreshStats(),
      ]);

      return { success: true, data };
    } catch (err) {
      console.error('Error creating holding:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId, refreshHoldings, refreshTransactions, refreshStats]);

  // Update holding
  const modifyHolding = useCallback(async (holdingId, updates) => {
    try {
      const { data, error } = await updateHolding(holdingId, updates);
      if (error) throw error;

      // Refresh holdings and stats
      await Promise.all([
        refreshHoldings(),
        refreshStats(),
      ]);

      return { success: true, data };
    } catch (err) {
      console.error('Error updating holding:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [refreshHoldings, refreshStats]);

  // Delete holding
  const removeHolding = useCallback(async (holdingId) => {
    try {
      const { success, error } = await deleteHolding(holdingId);
      if (error) throw error;

      // Refresh all data
      await Promise.all([
        refreshHoldings(),
        refreshTransactions(),
        refreshStats(),
      ]);

      return { success: true };
    } catch (err) {
      console.error('Error deleting holding:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [refreshHoldings, refreshTransactions, refreshStats]);

  // Add transaction
  const createTransaction = useCallback(async (transactionData) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await addTransaction(userId, transactionData);
      if (error) throw error;

      // Refresh transactions
      await refreshTransactions();

      return { success: true, data };
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [userId, refreshTransactions]);

  // Update prices (for real-time updates)
  const updatePrices = useCallback(async (priceUpdates) => {
    if (!userId) return;

    try {
      const { success, error } = await updateHoldingPrices(userId, priceUpdates);
      if (error) throw error;

      // Refresh holdings and stats
      await Promise.all([
        refreshHoldings(),
        refreshStats(),
      ]);
    } catch (err) {
      console.error('Error updating prices:', err);
      setError(err.message);
    }
  }, [userId, refreshHoldings, refreshStats]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    holdings,
    transactions,
    stats,
    loading,
    error,

    // Actions
    refreshHoldings,
    refreshTransactions,
    refreshStats,
    createHolding,
    modifyHolding,
    removeHolding,
    createTransaction,
    updatePrices,
    clearError,
    reload: loadPortfolioData,
  };
}

export default usePortfolio;

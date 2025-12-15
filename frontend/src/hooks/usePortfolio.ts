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
import type {
  PortfolioHolding,
  PortfolioTransaction,
  PortfolioStats,
  NewHoldingInput,
  NewTransactionInput,
  TransactionFilters,
  HoldingPriceUpdate,
} from '../types';

/** Operation result */
interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Portfolio hook return type */
interface UsePortfolioReturn {
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
  stats: PortfolioStats | null;
  loading: boolean;
  error: string | null;
  refreshHoldings: () => Promise<void>;
  refreshTransactions: (filters?: TransactionFilters) => Promise<void>;
  refreshStats: () => Promise<void>;
  createHolding: (holdingData: NewHoldingInput) => Promise<OperationResult<PortfolioHolding>>;
  modifyHolding: (holdingId: string, updates: Partial<PortfolioHolding>) => Promise<OperationResult<PortfolioHolding>>;
  removeHolding: (holdingId: string) => Promise<OperationResult>;
  createTransaction: (transactionData: NewTransactionInput) => Promise<OperationResult<PortfolioTransaction>>;
  updatePrices: (priceUpdates: HoldingPriceUpdate[]) => Promise<void>;
  clearError: () => void;
  reload: () => Promise<void>;
}

export function usePortfolio(userId: string | undefined): UsePortfolioReturn {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all portfolio data
  const loadPortfolioData = useCallback(async (): Promise<void> => {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Refresh holdings
  const refreshHoldings = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await fetchHoldings(userId);
      if (fetchError) throw fetchError;
      setHoldings(data || []);
    } catch (err) {
      console.error('Error refreshing holdings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh holdings';
      setError(errorMessage);
    }
  }, [userId]);

  // Refresh transactions
  const refreshTransactions = useCallback(async (filters: TransactionFilters = {}): Promise<void> => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await fetchTransactions(userId, filters);
      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh transactions';
      setError(errorMessage);
    }
  }, [userId]);

  // Refresh stats
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await getPortfolioStats(userId);
      if (fetchError) throw fetchError;
      setStats(data);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh stats';
      setError(errorMessage);
    }
  }, [userId]);

  // Add new holding
  const createHolding = useCallback(async (
    holdingData: NewHoldingInput
  ): Promise<OperationResult<PortfolioHolding>> => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error: addError } = await addHolding(userId, holdingData);
      if (addError) throw addError;

      // Refresh all data
      await Promise.all([
        refreshHoldings(),
        refreshTransactions(),
        refreshStats(),
      ]);

      return { success: true, data: data ?? undefined };
    } catch (err) {
      console.error('Error creating holding:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create holding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [userId, refreshHoldings, refreshTransactions, refreshStats]);

  // Update holding
  const modifyHolding = useCallback(async (
    holdingId: string,
    updates: Partial<PortfolioHolding>
  ): Promise<OperationResult<PortfolioHolding>> => {
    try {
      const { data, error: updateError } = await updateHolding(holdingId, updates);
      if (updateError) throw updateError;

      // Refresh holdings and stats
      await Promise.all([
        refreshHoldings(),
        refreshStats(),
      ]);

      return { success: true, data: data ?? undefined };
    } catch (err) {
      console.error('Error updating holding:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update holding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refreshHoldings, refreshStats]);

  // Delete holding
  const removeHolding = useCallback(async (holdingId: string): Promise<OperationResult> => {
    try {
      const { success, error: deleteError } = await deleteHolding(holdingId);
      if (deleteError) throw deleteError;

      // Refresh all data
      await Promise.all([
        refreshHoldings(),
        refreshTransactions(),
        refreshStats(),
      ]);

      return { success: true };
    } catch (err) {
      console.error('Error deleting holding:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete holding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [refreshHoldings, refreshTransactions, refreshStats]);

  // Add transaction
  const createTransaction = useCallback(async (
    transactionData: NewTransactionInput
  ): Promise<OperationResult<PortfolioTransaction>> => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error: addError } = await addTransaction(userId, transactionData);
      if (addError) throw addError;

      // Refresh transactions
      await refreshTransactions();

      return { success: true, data: data ?? undefined };
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [userId, refreshTransactions]);

  // Update prices (for real-time updates)
  const updatePrices = useCallback(async (priceUpdates: HoldingPriceUpdate[]): Promise<void> => {
    if (!userId) return;

    try {
      const { success, error: updateError } = await updateHoldingPrices(userId, priceUpdates);
      if (updateError) throw updateError;

      // Refresh holdings and stats
      await Promise.all([
        refreshHoldings(),
        refreshStats(),
      ]);
    } catch (err) {
      console.error('Error updating prices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prices';
      setError(errorMessage);
    }
  }, [userId, refreshHoldings, refreshStats]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    holdings,
    transactions,
    stats,
    loading,
    error,
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

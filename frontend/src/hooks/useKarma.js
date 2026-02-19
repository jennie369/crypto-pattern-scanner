/**
 * useKarma — Karma display hook
 * Fetches karma total, level, and history for a user
 */

import { useState, useCallback, useEffect } from 'react';
import karmaService from '../services/karmaService';

/**
 * @param {string} userId
 * @returns {{ karma, level, levelName, history, loading, refresh }}
 */
export function useKarma(userId) {
  const [karma, setKarma] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelName, setLevelName] = useState('Newbie');
  const [breakdown, setBreakdown] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKarma = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [karmaData, historyData] = await Promise.all([
        karmaService.getUserKarma(userId),
        karmaService.getKarmaHistory(userId),
      ]);

      setKarma(karmaData.total_karma || 0);
      setLevel(karmaData.level || 1);
      setLevelName(karmaData.level_name || 'Newbie');
      setBreakdown(karmaData.breakdown || {});
      setHistory(historyData);
    } catch (err) {
      console.error('useKarma error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchKarma();
  }, [fetchKarma]);

  return {
    karma,
    level,
    levelName,
    breakdown,
    history,
    loading,
    refresh: fetchKarma,
  };
}

export default useKarma;

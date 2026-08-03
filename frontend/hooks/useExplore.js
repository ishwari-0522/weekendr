'use client';

import { useState, useCallback } from 'react';
import exploreService from '../services/explore/exploreService';

/**
 * useExplore: Custom React hook encapsulating state updates for Explore discovery screens.
 */
export function useExplore() {
  const [worlds, setWorlds] = useState([]);
  const [trending, setTrending] = useState([]);
  const [gems, setGems] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadExploreLanding = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resWorlds, resTrend, resGems] = await Promise.all([
        exploreService.getWorlds(),
        exploreService.getTrending(),
        exploreService.getHiddenGems()
      ]);

      if (resWorlds.success) setWorlds(resWorlds.data);
      if (resTrend.success) setTrending(resTrend.data);
      if (resGems.success) setGems(resGems.data);
    } catch (e) {
      setError('A network error occurred loading discovery feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWorldDetail = useCallback(async (worldId) => {
    setLoading(true);
    setError('');
    try {
      const res = await exploreService.getWorldDetail(worldId);
      if (!res.success) {
        setError(res.message || 'World not found.');
      }
      return res;
    } catch (e) {
      setError('Network error occurred loading world details.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (filters) => {
    setLoading(true);
    setError('');
    try {
      const res = await exploreService.searchPlaces(filters);
      if (res.success) {
        setSearchResults(res.data);
      } else {
        setError(res.message || 'Failed to search places.');
      }
    } catch (e) {
      setError('Network error searching places.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    worlds,
    trending,
    gems,
    searchResults,
    loading,
    error,
    loadExploreLanding,
    loadWorldDetail,
    search,
    setSearchResults
  };
}

export default useExplore;

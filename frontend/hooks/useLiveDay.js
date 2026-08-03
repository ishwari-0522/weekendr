'use client';

import { useState, useCallback } from 'react';
import liveDayService from '../services/live/liveDayService';

/**
 * useLiveDay: Custom React hook encapsulating state updates for Live Day companion screens.
 */
export function useLiveDay() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await liveDayService.getCurrentSession();
      if (res.success) {
        setSession(res.data);
      } else {
        setError(res.message || 'Failed to load active session.');
      }
    } catch (e) {
      setError('A network error occurred connecting to Live Day service.');
    } finally {
      setLoading(false);
    }
  }, []);

  const startDay = useCallback(async (memoryId) => {
    setLoading(true);
    setError('');
    try {
      const res = await liveDayService.startSession(memoryId);
      if (res.success) {
        // Reload details
        const details = await liveDayService.getCurrentSession();
        if (details.success) {
          setSession(details.data);
        }
      } else {
        setError(res.message || 'Failed to start Live Day.');
      }
      return res;
    } catch (e) {
      setError('Failed to connect to start service.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const next = useCallback(async () => {
    try {
      const res = await liveDayService.nextStop();
      if (res.success) {
        await loadSession();
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to advance stop.' };
    }
  }, [loadSession]);

  const previous = useCallback(async () => {
    try {
      const res = await liveDayService.previousStop();
      if (res.success) {
        await loadSession();
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to revert stop.' };
    }
  }, [loadSession]);

  const completeCurrentStop = useCallback(async (reflection = '') => {
    try {
      const res = await liveDayService.completeStop(reflection);
      if (res.success) {
        await loadSession();
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to complete stop.' };
    }
  }, [loadSession]);

  const skipCurrentStop = useCallback(async () => {
    try {
      const res = await liveDayService.skipStop();
      if (res.success) {
        await loadSession();
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to skip stop.' };
    }
  }, [loadSession]);

  const endDay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await liveDayService.endSession();
      if (res.success) {
        setSession(null);
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to complete outing.' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,
    loading,
    error,
    loadSession,
    startDay,
    next,
    previous,
    completeCurrentStop,
    skipCurrentStop,
    endDay
  };
}

export default useLiveDay;

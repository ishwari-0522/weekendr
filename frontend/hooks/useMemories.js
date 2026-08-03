'use client';

import { useState, useCallback } from 'react';
import memoryService from '../services/memory/memoryService';

/**
 * useMemories: Custom React hook encapsulating state updates for Memory Book screens.
 */
export function useMemories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMemories = useCallback(async (status = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await memoryService.getMemories(status);
      if (res.success) {
        setMemories(res.data);
      } else {
        setError(res.message || 'Failed to load memories.');
      }
    } catch (e) {
      setError('A network error occurred loading memories.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemory = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await memoryService.getMemoryDetail(id);
      if (!res.success) {
        setError(res.message || 'Memory not found.');
      }
      return res;
    } catch (e) {
      setError('A network error occurred loading memory details.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMemory = useCallback(async (id, payload) => {
    try {
      return await memoryService.updateMemory(id, payload);
    } catch (e) {
      return { success: false, message: 'Failed to save updates.' };
    }
  }, []);

  const deleteMemory = useCallback(async (id) => {
    try {
      const res = await memoryService.deleteMemory(id);
      if (res.success) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to delete memory.' };
    }
  }, []);

  const addPhoto = useCallback(async (memoryId, imageUrl, caption = '') => {
    try {
      return await memoryService.addPhoto(memoryId, imageUrl, caption);
    } catch (e) {
      return { success: false, message: 'Failed to save photo metadata.' };
    }
  }, []);

  const deletePhoto = useCallback(async (photoId) => {
    try {
      return await memoryService.deletePhoto(photoId);
    } catch (e) {
      return { success: false, message: 'Failed to delete photo.' };
    }
  }, []);

  return {
    memories,
    loading,
    error,
    fetchMemories,
    fetchMemory,
    updateMemory,
    deleteMemory,
    addPhoto,
    deletePhoto
  };
}

export default useMemories;

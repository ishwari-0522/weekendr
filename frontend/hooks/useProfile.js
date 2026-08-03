'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import profileService from '../services/profile/profileService';

/**
 * useProfile: Custom React hook calculating lightweight journey statistics and saving preferences.
 */
export function useProfile() {
  const { user, updatePreferences, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updatePrefs = useCallback(async (newPrefs) => {
    setLoading(true);
    setError('');
    try {
      const res = await profileService.updatePreferences(newPrefs);
      if (res.success) {
        // Sync local context state
        updatePreferences(res.data.preferences);
      } else {
        setError(res.message || 'Failed to save preferences.');
      }
      return res;
    } catch (e) {
      setError('A network error occurred saving preferences.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, [updatePreferences]);

  const deleteUserAccount = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileService.deleteAccount();
      if (res.success) {
        logout();
      } else {
        setError(res.message || 'Failed to delete account.');
      }
      return res;
    } catch (e) {
      setError('A network error occurred deleting account.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const calculateStats = useCallback((memories = []) => {
    const daysDesigned = memories.length;
    const memoriesCreated = memories.filter((m) => m.status === 'completed').length;
    
    // Sum activities stops visited
    let placesVisited = 0;
    const citiesSet = new Set();
    const templatesMap = {};
    let ratingsSum = 0;
    let ratedCount = 0;

    memories.forEach((m) => {
      if (m.city) citiesSet.add(m.city.toLowerCase());
      
      // Calculate average rating
      if (m.rating) {
        ratingsSum += m.rating;
        ratedCount += 1;
      }

      // Count templates frequencies
      if (m.experience_template) {
        templatesMap[m.experience_template] = (templatesMap[m.experience_template] || 0) + 1;
      }

      // Read stops count from timeline
      if (m.timeline_json && Array.isArray(m.timeline_json.segments)) {
        const activities = m.timeline_json.segments.filter((s) => s.type === 'activity');
        placesVisited += activities.length;
      }
    });

    // Identify favorite template
    let favoriteTemplate = 'None';
    let maxFreq = 0;
    Object.keys(templatesMap).forEach((tpl) => {
      if (templatesMap[tpl] > maxFreq) {
        maxFreq = templatesMap[tpl];
        favoriteTemplate = tpl;
      }
    });

    const averageRating = ratedCount > 0 ? (ratingsSum / ratedCount).toFixed(1) : '0.0';
    const citiesExplored = citiesSet.size;

    return {
      daysDesigned,
      memoriesCreated,
      placesVisited,
      citiesExplored,
      favoriteTemplate,
      averageRating
    };
  }, []);

  return {
    loading,
    error,
    updatePrefs,
    deleteUserAccount,
    calculateStats
  };
}

export default useProfile;

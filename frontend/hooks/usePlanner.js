import { useState, useEffect, useCallback } from 'react';
import plannerService from '../services/planner/plannerService';

/**
 * Custom React hook isolating API generation and retrieval logic.
 */
export function usePlanner(initialCity = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [templates, setTemplates] = useState({});
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);

  // Fetch all templates configuration
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await plannerService.getTemplates();
    setLoading(false);
    if (res.success) {
      setTemplates(res.data);
    } else {
      setError(res.message);
    }
  }, []);

  // Fetch place categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await plannerService.getCategories();
    setLoading(false);
    if (res.success) {
      setCategories(res.data);
    } else {
      setError(res.message);
    }
  }, []);

  // Fetch areas in a city
  const fetchAreas = useCallback(async (city) => {
    if (!city) {
      setAreas([]);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await plannerService.getAreas(city);
    setLoading(false);
    if (res.success) {
      setAreas(res.data);
    } else {
      setError(res.message);
      setAreas([]);
    }
  }, []);

  // Load templates & categories on mount
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [fetchTemplates, fetchCategories]);

  // Load areas if initialCity is provided
  useEffect(() => {
    if (initialCity) {
      fetchAreas(initialCity);
    }
  }, [initialCity, fetchAreas]);

  // Generate experiences wrapper
  const generateExperience = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await plannerService.generateExperience(params);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
      return res;
    } catch (err) {
      setLoading(false);
      setError('A connection timeout or network failure occurred.');
      return { success: false, message: 'Connection failure' };
    }
  }, []);

  // Edit experiences wrapper
  const editExperience = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await plannerService.editExperience(params);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
      return res;
    } catch (err) {
      setLoading(false);
      setError('Failed to apply itinerary changes.');
      return { success: false, message: 'Connection failure' };
    }
  }, []);

  return {
    loading,
    error,
    templates,
    categories,
    areas,
    fetchAreas,
    generateExperience,
    editExperience
  };
}

export default usePlanner;

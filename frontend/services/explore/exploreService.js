import apiClient from '../planner/apiClient';

/**
 * exploreService: Client-side service interface mapping backend Explore endpoints.
 */
export const exploreService = {
  /**
   * Retrieves all curated worlds configurations.
   */
  async getWorlds() {
    return await apiClient.get('/explore/worlds');
  },

  /**
   * Returns world specifications details and matching places.
   */
  async getWorldDetail(worldId) {
    return await apiClient.get(`/explore/world/${worldId}`);
  },

  /**
   * Retrieves top trending places.
   */
  async getTrending() {
    return await apiClient.get('/explore/trending');
  },

  /**
   * Retrieves highly-rated hidden gems.
   */
  async getHiddenGems() {
    return await apiClient.get('/explore/hidden-gems');
  },

  /**
   * Retrieves places filtered by city name.
   */
  async getCityPlaces(cityName) {
    return await apiClient.get(`/explore/city/${cityName}`);
  },

  /**
   * Performs query-based search filtering.
   */
  async searchPlaces(filters = {}) {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.area) params.append('area', filters.area);
    if (filters.category) params.append('category', filters.category);
    if (filters.budget) params.append('budget', filters.budget);
    if (filters.search) params.append('search', filters.search);
    
    if (filters.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }

    const queryStr = params.toString();
    const url = queryStr ? `/explore/search?${queryStr}` : '/explore/search';
    return await apiClient.get(url);
  }
};

export default exploreService;

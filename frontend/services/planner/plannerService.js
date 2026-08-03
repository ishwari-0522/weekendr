import apiClient from './apiClient';

export const plannerService = {
  /**
   * Generates a recommended chronological experience timeline.
   */
  async generateExperience(params) {
    const payload = {
      city: params.city,
      area: params.area || null,
      budget: params.budget ? parseFloat(params.budget) : null,
      duration: params.duration ? parseInt(params.duration) : null,
      group: params.group || null,
      experience_template: params.experienceTemplate,
      preferences: params.preferences || []
    };
    return apiClient.post('/planner/generate', payload);
  },

  /**
   * Edits an itinerary and returns the updated timeline.
   */
  async editExperience(params) {
    const payload = {
      current_places: params.currentPlaces,
      action: params.action,
      budget: params.budget ? parseFloat(params.budget) : null,
      duration: params.duration ? parseInt(params.duration) : null,
      template_name: params.templateName
    };
    return apiClient.post('/planner/edit', payload);
  },

  /**
   * Fetches experience templates config.
   */
  async getTemplates() {
    return apiClient.get('/templates');
  },

  /**
   * Fetches supported place categories.
   */
  async getCategories() {
    return apiClient.get('/categories');
  },

  /**
   * Fetches areas filtered by city name.
   */
  async getAreas(city) {
    if (!city) return { success: false, message: 'City parameter is required', data: [], errors: [] };
    return apiClient.get(`/areas?city=${encodeURIComponent(city)}`);
  },

  /**
   * Fetches full metadata for a place ID.
   */
  async getPlace(placeId) {
    if (!placeId) return { success: false, message: 'Place ID is required', data: null, errors: [] };
    return apiClient.get(`/place/${placeId}`);
  }
};

export default plannerService;

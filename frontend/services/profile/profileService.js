import apiClient from '../planner/apiClient';

/**
 * profileService: Client-side service interface updating user preferences and settings.
 */
export const profileService = {
  /**
   * Updates user preference configurations.
   */
  async updatePreferences(preferences) {
    return await apiClient.put('/auth/preferences', preferences);
  },

  /**
   * Deletes the user account.
   */
  async deleteAccount() {
    return await apiClient.delete('/users/me');
  }
};

export default profileService;

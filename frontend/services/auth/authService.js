import apiClient from '../planner/apiClient';

/**
 * authService: Interfaces with Flask authentication API endpoints.
 */
export const authService = {
  /**
   * Registers a new user.
   */
  async register(fullName, email, password, phoneNumber = '') {
    return await apiClient.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      phone_number: phoneNumber
    });
  },

  /**
   * Logins user and returns JWT + profile.
   */
  async login(email, password) {
    return await apiClient.post('/auth/login', {
      email,
      password
    });
  },

  /**
   * Retrieves active profile using Authorization token headers.
   */
  async getMe() {
    return await apiClient.get('/auth/me');
  },

  /**
   * Updates preference parameters.
   */
  async updatePreferences(preferences) {
    return await apiClient.put('/auth/preferences', preferences);
  }
};

export default authService;

import apiClient from '../planner/apiClient';

/**
 * liveDayService: Client-side service interface matching Flask Live Outing endpoints.
 */
export const liveDayService = {
  /**
   * Initializes Live Day tracking from a saved memory.
   */
  async startSession(memoryId) {
    return await apiClient.post('/live-day/start', { memory_id: memoryId });
  },

  /**
   * Returns details of user's active session.
   */
  async getCurrentSession() {
    return await apiClient.get('/live-day/current');
  },

  /**
   * Advances the stop index check-in.
   */
  async nextStop() {
    return await apiClient.post('/live-day/next');
  },

  /**
   * Reverts back one stop.
   */
  async previousStop() {
    return await apiClient.post('/live-day/previous');
  },

  /**
   * Completes current stop, storing optional reflection.
   */
  async completeStop(reflection = '') {
    return await apiClient.post('/live-day/complete-stop', { reflection });
  },

  /**
   * Skips current stop and moves index forward.
   */
  async skipStop() {
    return await apiClient.post('/live-day/skip-stop');
  },

  /**
   * Completes the outing, saving reflections to memories.
   */
  async endSession() {
    return await apiClient.post('/live-day/end');
  }
};

export default liveDayService;

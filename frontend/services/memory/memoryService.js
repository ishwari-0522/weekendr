import apiClient from '../planner/apiClient';

/**
 * memoryService: Client-side service interface fetching and updating user memories.
 */
export const memoryService = {
  /**
   * Saves a generated itinerary.
   */
  async saveMemory(payload) {
    return await apiClient.post('/memories', payload);
  },

  /**
   * Returns all memories (optionally filtering by status).
   */
  async getMemories(status = '') {
    const url = status ? `/memories?status=${status}` : '/memories';
    return await apiClient.get(url);
  },

  /**
   * Returns full details of a specific memory.
   */
  async getMemoryDetail(id) {
    return await apiClient.get(`/memories/${id}`);
  },

  /**
   * Updates reflection, rating, title, or status of a memory.
   */
  async updateMemory(id, payload) {
    return await apiClient.put(`/memories/${id}`, payload);
  },

  /**
   * Soft deletes a memory.
   */
  async deleteMemory(id) {
    return await apiClient.delete(`/memories/${id}`);
  },

  /**
   * Adds a photo URL metadata.
   */
  async addPhoto(memoryId, imageUrl, caption = '', displayOrder = 0) {
    return await apiClient.post(`/memories/${memoryId}/photos`, {
      image_url: imageUrl,
      caption,
      display_order: displayOrder
    });
  },

  /**
   * Deletes a photo metadata record.
   */
  async deletePhoto(photoId) {
    return await apiClient.delete(`/memories/photo/${photoId}`);
  }
};

export default memoryService;

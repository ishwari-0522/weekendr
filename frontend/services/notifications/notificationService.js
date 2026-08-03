import apiClient from '../planner/apiClient';

/**
 * notificationService: Client-side service interface mapping backend Notification routes.
 */
export const notificationService = {
  /**
   * Retrieves all notifications.
   */
  async getNotifications() {
    return await apiClient.get('/notifications');
  },

  /**
   * Returns unread notifications count.
   */
  async getUnreadCount() {
    return await apiClient.get('/notifications/unread-count');
  },

  /**
   * Marks a single notification status as read.
   */
  async markRead(id) {
    return await apiClient.put(`/notifications/${id}/read`);
  },

  /**
   * Marks all user notifications as read.
   */
  async markAllRead() {
    return await apiClient.put('/notifications/read-all');
  },

  /**
   * Soft dismisses a notification.
   */
  async dismiss(id) {
    return await apiClient.delete(`/notifications/${id}`);
  }
};

export default notificationService;

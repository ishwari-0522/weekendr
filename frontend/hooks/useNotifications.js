'use client';

import { useState, useCallback } from 'react';
import notificationService from '../services/notifications/notificationService';

/**
 * useNotifications: Custom React hook encapsulating state updates for Notification Center components.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.data.unread_count);
      }
    } catch (e) {
      // Fail silently for background counts
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        // Refresh unread count
        const countRes = await notificationService.getUnreadCount();
        if (countRes.success) {
          setUnreadCount(countRes.data.unread_count);
        }
      } else {
        setError(res.message || 'Failed to load notifications.');
      }
    } catch (e) {
      setError('A network error occurred connecting to Notification service.');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const res = await notificationService.markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to update notification.' };
    }
  }, []);

  const readAll = useCallback(async () => {
    try {
      const res = await notificationService.markAllRead();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: 'read' }))
        );
        setUnreadCount(0);
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to update notifications.' };
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    try {
      const res = await notificationService.dismiss(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // If it was unread, decrement unreadCount
        const target = notifications.find((n) => n.id === id);
        if (target && target.status === 'unread') {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
      return res;
    } catch (e) {
      return { success: false, message: 'Failed to dismiss notification.' };
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    readAll,
    dismiss
  };
}

export default useNotifications;

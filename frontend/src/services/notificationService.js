import api from '@/services/api';

export const notificationService = {
  // GET /api/v1/notifications/  (PaginatedNotificationList)
  getNotifications: async (page = 1) => {
    const response = await api.get('/notifications/', { params: { page } });
    return response.data;
  },

  // GET /api/v1/notifications/unread_count/
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread_count/');
    return response.data;
  },

  // POST /api/v1/notifications/{id}/mark_as_read/
  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/mark_as_read/`);
    return response.data;
  },

  // POST /api/v1/notifications/mark_all_as_read/
  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark_all_as_read/');
    return response.data;
  },
};

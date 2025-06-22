import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'system' | 'hardware' | 'user';
  status: 'unread' | 'read' | 'archived';
  userId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get<Notification[]>('/notifications');
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get<Notification[]>('/notifications/unread');
      return data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw new Error('Failed to fetch unread notifications');
    }
  },

  async markAsRead(id: string): Promise<Notification> {
    try {
      const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  },

  async archiveNotification(id: string): Promise<Notification> {
    try {
      const { data } = await api.patch<Notification>(`/notifications/${id}/archive`);
      return data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error('Failed to archive notification');
    }
  }
}; 
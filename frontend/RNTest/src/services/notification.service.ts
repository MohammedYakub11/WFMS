import apiClient from './apiClient';
import { PaginatedListResult } from '../types/skills';
import {
  AppNotification,
  BroadcastPayload,
  NotificationListParams,
  NotificationPreferences,
} from '../types/notifications';

export const notificationService = {
  getNotifications: (params?: NotificationListParams) =>
    apiClient
      .get('/notifications', { params })
      .then((r) => r.data.data as PaginatedListResult<AppNotification>),
  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count').then((r) => r.data.data as number),
  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data.data as AppNotification),
  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data.data as { updated: boolean }),
  remove: (id: string) => apiClient.delete(`/notifications/${id}`),
  getPreferences: () =>
    apiClient.get('/notifications/preferences').then((r) => r.data.data as NotificationPreferences),
  updatePreferences: (dto: Partial<NotificationPreferences>) =>
    apiClient
      .put('/notifications/preferences', dto)
      .then((r) => r.data.data as NotificationPreferences),
  sendBroadcast: (dto: BroadcastPayload) =>
    apiClient.post('/notifications/broadcast', dto).then((r) => r.data.data as { sent: number }),
};

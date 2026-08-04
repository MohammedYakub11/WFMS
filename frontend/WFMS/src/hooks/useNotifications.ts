import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { NotificationListParams } from '../types/notifications';

// Query-key namespace: ['notifications', params] for the list, and
// ['notifications', 'unreadCount'] for the badge count. Both are invalidated
// together whenever a mutation changes read/unread state so the list and the
// badge never drift apart.

export const useNotifications = (params: NotificationListParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    keepPreviousData: true,
  });
};

export const useUnreadNotificationCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: notificationService.getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRemoveNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: notificationService.getPreferences,
    staleTime: 1000 * 60 * 60,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
    },
  });
};

export const useSendNotification = () => {
  return useMutation({
    mutationFn: notificationService.sendBroadcast,
  });
};

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setNotificationFilter } from '../../store/notificationsUiSlice';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useRemoveNotification,
} from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { NotificationListItem } from '../../components/notifications/NotificationListItem';
import { NotificationSkeleton } from '../../components/notifications/NotificationSkeleton';
import { AppNotification } from '../../types/notifications';
import { lightTheme, darkTheme } from '../../theme/theme';

const LIMIT = 20;

type FilterValue = 'all' | 'unread' | 'read';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

export const NotificationCenterScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const activeFilter = useSelector((state: RootState) => state.notificationsUi.activeFilter);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      filter: activeFilter === 'all' ? undefined : activeFilter,
    }),
    [page, activeFilter],
  );

  const { data, isLoading, isError, refetch, isFetching } = useNotifications(queryParams);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const removeMutation = useRemoveNotification();

  const notifications: AppNotification[] = data?.items || [];
  const total = data?.total || 0;
  const styles = createStyles(theme);

  const handleFilterChange = (value: FilterValue) => {
    dispatch(setNotificationFilter(value));
    setPage(1);
  };

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (notifications.length < total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handleItemPress = useCallback(
    (item: AppNotification) => {
      if (!item.is_read) {
        markReadMutation.mutate(item.id);
      }
      // TODO: deep-link navigation once link format is finalized
    },
    [markReadMutation],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeMutation.mutate(id);
    },
    [removeMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationListItem
        notification={item}
        onPress={() => handleItemPress(item)}
        onRemove={() => handleRemove(item.id)}
      />
    ),
    [handleItemPress, handleRemove],
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="You're all caught up"
        description="No notifications to show."
      />
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        showBack
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
              <AppText color={theme.colors.primary}>Mark all read</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationPreferences')}
              accessibilityLabel="Notification preferences"
            >
              <AppText style={styles.gearIcon}>⚙</AppText>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = activeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => handleFilterChange(f.value)}
            >
              <AppText
                variant="caption"
                color={selected ? theme.colors.surface : theme.colors.textPrimary}
                weight={selected ? 'semiBold' : 'regular'}
              >
                {f.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && page === 1 ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <NotificationSkeleton />}
          contentContainerStyle={styles.listContent}
        />
      ) : isError ? (
        <EmptyState
          title="Failed to load notifications"
          description="An error occurred while fetching your notifications. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} />}
        />
      )}

      {hasPermission('NOTIFICATION_SEND') && (
        <FAB
          icon="bullhorn-outline"
          style={styles.fab}
          onPress={() => navigation.navigate('SendNotification')}
          color="#FFF"
        />
      )}
    </View>
  );
};

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
    },
    listContent: {
      paddingBottom: 24,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    gearIcon: {
      fontSize: 20,
      color: theme.colors.primary,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });

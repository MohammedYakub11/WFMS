import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { lightTheme as theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';

import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../store/uiSlice';
import { useUnreadNotificationCount } from '../hooks/useNotifications';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showDrawer?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  showDrawer = false,
  showNotification = false,
  notificationCount = 0,
  rightAction,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  // Called unconditionally to satisfy the Rules of Hooks (never call a hook
  // behind an early return / conditional). The query itself is gated via
  // `enabled: showNotification` inside the hook, so screens that render
  // AppHeader without the bell never fire the network request.
  const { data: liveUnreadCount } = useUnreadNotificationCount(showNotification);
  const displayedCount = liveUnreadCount ?? notificationCount ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <AppText style={styles.icon}>←</AppText>
          </TouchableOpacity>
        )}

        {showDrawer && (
          <TouchableOpacity onPress={() => dispatch(toggleDrawer())} style={styles.iconButton}>
            <AppText style={styles.icon}>≡</AppText>
          </TouchableOpacity>
        )}

        {title && (
          <AppText variant="h2" style={styles.title}>{title}</AppText>
        )}
      </View>

      <View style={styles.rightSection}>
        {showNotification && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('NotificationCenter')}
          >
            <AppText style={styles.icon}>🔔</AppText>
            {displayedCount > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{displayedCount > 9 ? '9+' : displayedCount}</AppText>
              </View>
            )}
          </TouchableOpacity>
        )}
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2, // Android shadow
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 16,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  icon: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
});

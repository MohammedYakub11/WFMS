import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { lightTheme as theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../store/uiSlice';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { useEmployeeProfile } from '../hooks/useEmployee';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  showDrawer?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  rightAction?: React.ReactNode;
  showAvatar?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  showDrawer = false,
  showNotification = false,
  notificationCount = 0,
  rightAction,
  showAvatar = true, // By default show avatar on dashboard-like screens if possible
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  // Called unconditionally to satisfy the Rules of Hooks (never call a hook
  // behind an early return / conditional). The query itself is gated via
  // `enabled: showNotification` inside the hook, so screens that render
  // AppHeader without the bell never fire the network request.
  const { data: liveUnreadCount } = useUnreadNotificationCount(showNotification);
  const displayedCount = liveUnreadCount ?? notificationCount ?? 0;
  const insets = useSafeAreaInsets();
  // The auth slice's `user` only carries what /auth/login returns (id, email, role,
  // permissions) — no name or photo. The full profile (already fetched/cached elsewhere,
  // e.g. MyProfileScreen) is the actual source of truth for the header avatar.
  const { data: profile } = useEmployeeProfile(user?.id || '');
  const avatarName =
    [profile?.first_name || user?.first_name, profile?.last_name || user?.last_name].filter(Boolean).join(' ') ||
    user?.email ||
    'User';
  const avatarUri = profile?.profile_image;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
            <AppIcon name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}

        {showDrawer && (
          <TouchableOpacity onPress={() => dispatch(toggleDrawer())} style={styles.iconButton} activeOpacity={0.7}>
            <AppIcon name="menu" size={24} color={theme.colors.textPrimary} />
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
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <AppIcon name="bell-outline" size={24} color={theme.colors.textPrimary} />
            {displayedCount > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{displayedCount > 9 ? '9+' : displayedCount}</AppText>
              </View>
            )}
          </TouchableOpacity>
        )}
        {rightAction}
        {showAvatar && user && (
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Avatar
              name={avatarName}
              uri={avatarUri}
              size={32}
            />
          </TouchableOpacity>
        )}
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
    elevation: 0, 
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  avatarContainer: {
    marginLeft: 12,
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

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
import { NeuIconCircle, NEU_BACKGROUND } from './Cards';

interface AppHeaderProps {
  title?: string;
  // Optional line rendered under `title` (e.g. the Dashboard's "Workforce
  // Management System" tagline). Omit to keep every other screen unchanged.
  subtitle?: string;
  // Optional small icon glyph rendered in a soft rounded badge before the
  // title/subtitle stack (e.g. the Dashboard's brand mark).
  titleIcon?: string;
  showBack?: boolean;
  showDrawer?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  rightAction?: React.ReactNode;
  showAvatar?: boolean;
  // 'flat' (default) is the original header used by every existing screen.
  // 'neu' wraps each action icon in a raised Soft UI circle for the
  // neumorphic Dashboard redesign — opt-in only.
  variant?: 'flat' | 'neu';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  titleIcon,
  showBack = false,
  showDrawer = false,
  showNotification = false,
  notificationCount = 0,
  rightAction,
  showAvatar = true, // By default show avatar on dashboard-like screens if possible
  variant = 'neu',
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

  const isNeu = variant === 'neu';

  return (
    <View style={[styles.container, isNeu && styles.containerNeu, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        {showBack && (
          isNeu ? (
            <NeuIconCircle size={40} style={styles.neuIconMargin} onPress={() => navigation.goBack()}>
              <AppIcon name="arrow-left" size={18} color={theme.colors.primary} />
            </NeuIconCircle>
          ) : (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
              <AppIcon name="arrow-left" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          )
        )}

        {showDrawer && (
          isNeu ? (
            <NeuIconCircle size={40} style={styles.neuIconMargin} onPress={() => dispatch(toggleDrawer())}>
              <AppIcon name="menu" size={18} color={theme.colors.primary} />
            </NeuIconCircle>
          ) : (
            <TouchableOpacity onPress={() => dispatch(toggleDrawer())} style={styles.iconButton} activeOpacity={0.7}>
              <AppIcon name="menu" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          )
        )}

        {titleIcon && (
          isNeu ? (
            <NeuIconCircle size={40} style={styles.neuIconMargin}>
              <AppIcon name={titleIcon} size={20} color={theme.colors.primary} />
            </NeuIconCircle>
          ) : (
            <View style={styles.titleIconContainer}>
              <AppIcon name={titleIcon} size={22} color={theme.colors.primary} />
            </View>
          )
        )}

        {title && (
          <View>
            <AppText variant="h2" style={styles.title}>{title}</AppText>
            {subtitle && (
              <AppText variant="caption" color={theme.colors.textSecondary} style={styles.subtitle}>
                {subtitle}
              </AppText>
            )}
          </View>
        )}
      </View>

      <View style={[styles.rightSection, isNeu && styles.rightSectionNeu]}>
        {showNotification && (
          isNeu ? (
            <NeuIconCircle size={40} onPress={() => navigation.navigate('Notifications')}>
              <AppIcon name="bell-outline" size={18} color={theme.colors.primary} />
              {displayedCount > 0 && (
                <View style={styles.badge}>
                  <AppText style={styles.badgeText}>{displayedCount > 9 ? '9+' : displayedCount}</AppText>
                </View>
              )}
            </NeuIconCircle>
          ) : (
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
          )
        )}
        {rightAction}
        {showAvatar && user && (
          isNeu ? (
            // A ≥44dp raised Soft UI circle around the avatar — previously a
            // bare 32x32 Avatar with no surface of its own, so it had neither
            // a neumorphic presence nor a large-enough touch target, and sat
            // "buried" flush against the header's other icons.
            <NeuIconCircle size={48} onPress={() => navigation.navigate('Profile')}>
              <Avatar name={avatarName} uri={avatarUri} size={36} />
            </NeuIconCircle>
          ) : (
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
          )
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
  containerNeu: {
    backgroundColor: NEU_BACKGROUND,
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  neuIconMargin: {
    marginLeft: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Matches `container`'s own paddingHorizontal (16) so the notification-to-
  // avatar gap and the avatar-to-screen-edge gap are equal, per the
  // neumorphic header's "equal spacing" requirement — replaces the previous
  // per-icon `marginLeft: 8`, which gave the avatar less room from its
  // neighbor than the container gave it from the edge.
  rightSectionNeu: {
    gap: 16,
  },
  title: {
    marginLeft: 16,
  },
  subtitle: {
    marginLeft: 16,
    marginTop: 2,
  },
  titleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.l,
    backgroundColor: theme.colors.secondaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
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

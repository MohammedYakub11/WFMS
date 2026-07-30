import React from 'react';
import { StyleSheet, View, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { lightTheme as theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { AppIcon } from '../components/AppIcon';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/authSlice';
import { setDrawerOpen } from '../store/uiSlice';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from '../components/Avatar';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useEmployeeProfile } from '../hooks/useEmployee';
import { NeuSurface, NeuIconCircle, NEU_BACKGROUND } from '../components/Cards';
import pkg from '../../package.json';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';

import { DashboardTabScreen } from '../screens/dashboard/DashboardTabScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { MySkillsScreen } from '../screens/skills/MySkillsScreen';
import { WorkforceSearchScreen } from '../screens/search/WorkforceSearchScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { useUnreadNotificationCount } from '../hooks/useNotifications';

const appVersion = pkg.version;

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  showBadge?: boolean;
}

// `icon` values are Octicons glyph names (see components/AppIcon.tsx) — the
// app's single icon family, not raw emoji.
const menuItems: MenuItem[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'apps', route: 'Dashboard' },
  { key: 'Skills', label: 'My Skills', icon: 'star', route: 'Skills' },
  { key: 'PendingApprovals', label: 'Pending Approvals', icon: 'checklist', route: 'PendingApprovals' },
  { key: 'WorkforceSearch', label: 'Employee Search', icon: 'search', route: 'WorkforceSearch' },
  { key: 'Notifications', label: 'Notifications', icon: 'bell', route: 'Notifications', showBadge: true },
  { key: 'Profile', label: 'My Profile', icon: 'person', route: 'Profile' },
  {
    key: 'EmployeeDirectory',
    label: 'Employee Directory',
    icon: 'people',
    route: 'EmployeeDirectory',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'skillAdmin',
    label: 'Skill Administration',
    icon: 'tools',
    route: 'SkillAdminDirectory',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'skillCategories',
    label: 'Skill Categories',
    icon: 'stack',
    route: 'SkillCategoryManagement',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'RoleManagement',
    label: 'Role Management',
    icon: 'shield',
    route: 'RoleManagement',
    roles: ['Administrator'],
  },
  {
    key: 'AdminOverview',
    label: 'Admin Overview',
    icon: 'graph',
    route: 'AdminOverview',
    roles: ['Administrator'],
  },
  {
    key: 'AuditLogs',
    label: 'Audit Logs',
    icon: 'history',
    route: 'AuditLogs',
    roles: ['Administrator'],
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: 'file',
    route: 'ReportsDashboard',
    roles: ['Administrator', 'Workforce Manager', 'Resource Manager'],
  },
  {
    key: 'OrgSettings',
    label: 'Organization Settings',
    icon: 'organization',
    route: 'OrgSettingsDashboard',
    roles: ['Administrator'],
  },
];

const getActiveRouteName = (state: any): string | undefined => {
  if (!state || typeof state.index !== 'number') return undefined;
  const route = state.routes[state.index];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
};

const DrawerStack = createStackNavigator();

const DrawerMainScreens = () => {
  return (
    <DrawerStack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.FadeFromBottomAndroid,
      }}
    >
      <DrawerStack.Screen name="Dashboard" component={DashboardTabScreen} />
      <DrawerStack.Screen name="Skills" component={MySkillsScreen} />
      <DrawerStack.Screen name="Search" component={WorkforceSearchScreen} />
      <DrawerStack.Screen name="Notifications" component={NotificationCenterScreen} />
      <DrawerStack.Screen name="Profile" component={MyProfileScreen} />
    </DrawerStack.Navigator>
  );
};

export const DrawerNavigator = () => {
  const dispatch = useDispatch();
  const drawerOpen = useSelector((state: RootState) => state.ui.isDrawerOpen);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();
  const { data: profile } = useEmployeeProfile(user?.id || '');
  const activeRouteName = useNavigationState((state) => getActiveRouteName(state));
  const { data: unreadCount } = useUnreadNotificationCount(true);

  const handleLogout = async () => {
    dispatch(setDrawerOpen(false));
    dispatch(clearAuth());
    await AsyncStorage.removeItem('authState');
  };

  const handleNavigation = (route?: string) => {
    dispatch(setDrawerOpen(false));
    if (route) {
      navigation.navigate(route);
    }
  };

  const displayName = profile?.first_name || user?.first_name
    ? `${profile?.first_name || user?.first_name} ${profile?.last_name || user?.last_name || ''}`.trim()
    : user?.email || 'User';

  return (
    <View style={styles.container}>
      <DrawerMainScreens />

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => dispatch(setDrawerOpen(false))}
      >
        <Pressable style={styles.overlay} onPress={() => dispatch(setDrawerOpen(false))}>
          <View style={styles.drawer} onStartShouldSetResponder={() => true}>
            <ScrollView
              style={styles.menuList}
              contentContainerStyle={styles.menuListContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <NeuSurface style={styles.headerCard} contentStyle={styles.headerContent}>
                <Avatar
                  name={displayName}
                  uri={profile?.profile_image}
                  size={64}
                  style={styles.avatarMargin}
                />
                <AppText variant="h2" numberOfLines={1}>{displayName}</AppText>
                {!!user?.role && (
                  <AppText variant="caption" color={theme.colors.primary} style={styles.userRoleText}>
                    {user.role}
                  </AppText>
                )}
                {!!profile?.employee_code && (
                  <AppText variant="caption" color={theme.colors.textSecondary} style={styles.userMetaLine}>
                    Emp ID: {profile.employee_code}
                  </AppText>
                )}
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.userMetaLine}>
                  WFMS Organization
                </AppText>
              </NeuSurface>

              {/* Menu Items */}
              <View style={styles.menuItemsContainer}>
                {menuItems
                  .filter((item) => !item.roles || (!!user?.role && item.roles.includes(user.role)))
                  .map((item) => {
                    const isActive = item.route === activeRouteName;

                    return (
                      <NeuSurface
                        key={item.key}
                        style={styles.menuItemWrapper}
                        contentStyle={[styles.menuItem, isActive && styles.menuItemActive]}
                        onPress={() => handleNavigation(item.route)}
                        radius={theme.radius.xl}
                      >
                        <NeuIconCircle
                          size={40}
                          style={styles.menuIconContainer}
                          contentStyle={isActive && styles.menuIconContainerActive}
                        >
                          <AppIcon name={item.icon} size={20} color={isActive ? '#FFFFFF' : theme.colors.primary} />
                        </NeuIconCircle>
                        <AppText style={[styles.menuLabel, isActive && styles.menuLabelActive]} numberOfLines={1}>
                          {item.label}
                        </AppText>
                        {item.showBadge && unreadCount ? (
                          <View style={styles.badge}>
                            <AppText style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</AppText>
                          </View>
                        ) : null}
                      </NeuSurface>
                    );
                  })}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <NeuSurface style={styles.logoutWrapper} contentStyle={styles.logoutContent} onPress={handleLogout} radius={theme.radius.xl}>
                  <AppIcon name="sign-out" size={20} color={theme.colors.error} style={styles.logoutIcon} />
                  <AppText style={styles.logoutText}>Logout</AppText>
                </NeuSurface>
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.footerMeta}>
                  WFMS v{appVersion}
                </AppText>
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.footerMeta}>
                  © {new Date().getFullYear()} WFMS. All rights reserved.
                </AppText>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: NEU_BACKGROUND,
    flex: 1,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  menuList: {
    flex: 1,
  },
  menuListContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 32,
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarMargin: {
    marginBottom: 16,
  },
  userRoleText: {
    marginTop: 6,
    fontFamily: theme.typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  userMetaLine: {
    marginTop: 4,
    textAlign: 'center',
  },
  menuItemsContainer: {
    marginBottom: 16,
  },
  menuItemWrapper: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
  },
  menuItemActive: {
    backgroundColor: theme.colors.primary, // #22C55E
  },
  menuIconContainer: {
    marginRight: 4,
  },
  // Solid, darker WFMS green (theme.colors.secondary) — not a translucent
  // white overlay — so the circle reads as a distinct raised chip against the
  // lighter-green active row, giving the white icon on top real contrast
  // instead of blending into the page-colored surface underneath it.
  menuIconContainerActive: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  menuLabel: {
    marginLeft: 16,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutWrapper: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  logoutContent: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoutIcon: {
    // marginRight: 8,
    // paddingRight: 8,
  },
  logoutText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    paddingLeft: 8,
    // fontWeight: 'bold',
  },
  footerMeta: {
    marginBottom: 4,
  },
});

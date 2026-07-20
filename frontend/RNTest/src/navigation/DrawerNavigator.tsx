import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { lightTheme as theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { BottomTabNavigator } from './BottomTabNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/authSlice';
import { setDrawerOpen } from '../store/uiSlice';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from '../components/Avatar';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

// 'Skills'/'WorkforceSearch' are the actual registered route names — the previous
// 'MySkills'/'EmployeeSearch' values didn't match any screen. 'Analytics'/'Settings'
// were removed entirely since no such routes/screens exist anywhere in the app.
const menuItems: MenuItem[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: '🏠', route: 'Dashboard' },
  { key: 'Skills', label: 'My Skills', icon: '⚡', route: 'Skills' },
  { key: 'PendingApprovals', label: 'Pending Approvals', icon: '✅', route: 'PendingApprovals' },
  { key: 'WorkforceSearch', label: 'Employee Search', icon: '🔍', route: 'WorkforceSearch' },
  {
    key: 'EmployeeDirectory',
    label: 'Employee Directory',
    icon: '👥',
    route: 'EmployeeDirectory',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'skillAdmin',
    label: 'Skill Administration',
    icon: '🛠️',
    route: 'SkillAdminDirectory',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'skillCategories',
    label: 'Skill Categories',
    icon: '📂',
    route: 'SkillCategoryManagement',
    roles: ['Workforce Manager', 'Resource Manager', 'Administrator'],
  },
  {
    key: 'RoleManagement',
    label: 'Role Management',
    icon: '🛡️',
    route: 'RoleManagement',
    roles: ['Administrator'],
  },
  {
    key: 'AdminOverview',
    label: 'Admin Overview',
    icon: '📊',
    route: 'AdminOverview',
    roles: ['Administrator'],
  },
];

export const DrawerNavigator = () => {
  const dispatch = useDispatch();
  const drawerOpen = useSelector((state: RootState) => state.ui.isDrawerOpen);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<any>();

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



  return (
    <View style={styles.container}>
      <BottomTabNavigator />

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => dispatch(setDrawerOpen(false))}
      >
        <Pressable style={styles.overlay} onPress={() => dispatch(setDrawerOpen(false))}>
          <View style={styles.drawer} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.header}>
              <Avatar
                name={`${user?.first_name || ''} ${user?.last_name || ''}`}
                size={60}
                style={styles.avatarMargin}
              />
              <AppText variant="sectionHeading" style={styles.userName}>
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email || 'User'}
              </AppText>
              <AppText variant="caption" style={styles.userEmail}>{user?.email}</AppText>
            </View>

            {/* Menu Items */}
            <View style={styles.menuList}>
              {menuItems
                .filter((item) => !item.roles || (!!user?.role && item.roles.includes(user.role)))
                .map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                >
                  <AppText style={styles.menuIcon}>{item.icon}</AppText>
                  <AppText style={styles.menuLabel}>{item.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <AppText style={styles.logoutText}>🚪  Logout</AppText>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.surface,
    flex: 1,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: theme.colors.primary,
  },
  avatarMargin: {
    marginBottom: 12,
  },
  userName: {
    color: theme.colors.surface,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 16,
  },
});

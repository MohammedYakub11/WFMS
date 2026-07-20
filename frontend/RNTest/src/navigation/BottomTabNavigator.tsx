import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { lightTheme as theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { DashboardTabScreen } from '../screens/dashboard/DashboardTabScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';

import { MySkillsScreen } from '../screens/skills/MySkillsScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { useUnreadNotificationCount } from '../hooks/useNotifications';

// Placeholder Screens
const SearchScreen = () => <View style={styles.screen}><AppText>Search Screen</AppText></View>;

export type BottomTabParamList = {
  Dashboard: undefined;
  Skills: undefined;
  Search: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  // Mock SVG Icons based on name
  let iconContent = null;
  switch (name) {
    case 'Dashboard':
      iconContent = (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="3" width="7" height="7" rx="1" />
          <Rect x="14" y="3" width="7" height="7" rx="1" />
          <Rect x="14" y="14" width="7" height="7" rx="1" />
          <Rect x="3" y="14" width="7" height="7" rx="1" />
        </Svg>
      );
      break;
    case 'Skills':
      iconContent = (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 2L2 7l10 5 10-5-10-5z" />
          <Path d="M2 17l10 5 10-5" />
          <Path d="M2 12l10 5 10-5" />
        </Svg>
      );
      break;
    case 'Search':
      iconContent = (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="11" cy="11" r="8" />
          <Path d="M21 21l-4.35-4.35" />
        </Svg>
      );
      break;
    case 'Notifications':
      iconContent = (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
      break;
    case 'Profile':
      iconContent = (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
      break;
  }

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      {iconContent}
    </View>
  );
};

interface BottomTabNavigatorProps {
  // onDrawerToggle is unused
}

export const BottomTabNavigator = (_props: BottomTabNavigatorProps) => {
  const { data: unreadCount } = useUnreadNotificationCount();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.medium,
          fontSize: 12,
        },
        tabBarIcon: ({ color, focused }) => <TabIcon name={route.name} color={color} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardTabScreen} />
      <Tab.Screen name="Skills" component={MySkillsScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Notifications"
        component={NotificationCenterScreen}
        options={{ tabBarBadge: unreadCount && unreadCount > 0 ? unreadCount : undefined }}
      />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    padding: 4,
  },
  iconContainerFocused: {
    // Optional: add a subtle background for the active tab icon if desired
  },
});

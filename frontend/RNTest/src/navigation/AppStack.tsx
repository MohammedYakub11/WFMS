import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { DrawerNavigator } from './DrawerNavigator';
import { ProtectedScreen } from './ProtectedScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AddEmployeeSkillScreen } from '../screens/skills/AddEmployeeSkillScreen';
import { EmployeeSkillDetailsScreen } from '../screens/skills/EmployeeSkillDetailsScreen';
import { EditEmployeeSkillScreen } from '../screens/skills/EditEmployeeSkillScreen';
import { PendingApprovalsScreen } from '../screens/approvals/PendingApprovalsScreen';
import { ApprovalDetailScreen } from '../screens/approvals/ApprovalDetailScreen';
import { WorkforceSearchScreen } from '../screens/search/WorkforceSearchScreen';
import { EmployeePreviewScreen } from '../screens/search/EmployeePreviewScreen';
import { EmployeeDirectoryScreen } from '../screens/employees/EmployeeDirectoryScreen';
import { EmployeeDetailsScreen } from '../screens/employees/EmployeeDetailsScreen';
import { AddEmployeeScreen } from '../screens/employees/AddEmployeeScreen';
import { EditEmployeeScreen } from '../screens/employees/EditEmployeeScreen';
import { RoleManagementScreen } from '../screens/roles/RoleManagementScreen';
import { RoleFormScreen } from '../screens/roles/RoleFormScreen';
import { PermissionMatrixScreen } from '../screens/roles/PermissionMatrixScreen';
import { AdminOverviewScreen } from '../screens/dashboard/AdminOverviewScreen';
import { SkillAdminDirectoryScreen } from '../screens/skillAdmin/SkillAdminDirectoryScreen';
import { SkillFormScreen } from '../screens/skillAdmin/SkillFormScreen';
import { SkillAdminDetailsScreen } from '../screens/skillAdmin/SkillAdminDetailsScreen';
import { SkillCategoryManagementScreen } from '../screens/skillAdmin/SkillCategoryManagementScreen';
import { CategoryFormScreen } from '../screens/skillAdmin/CategoryFormScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { NotificationPreferencesScreen } from '../screens/notifications/NotificationPreferencesScreen';
import { SendNotificationScreen } from '../screens/notifications/SendNotificationScreen';

const Stack = createStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AddSkill" component={AddEmployeeSkillScreen} />
      <Stack.Screen name="SkillDetails" component={EmployeeSkillDetailsScreen} />
      <Stack.Screen name="EditSkill" component={EditEmployeeSkillScreen} />
      <Stack.Screen
        name="PendingApprovals"
        component={PendingApprovalsScreen}
        options={{ title: 'Pending Approvals' }}
      />
      <Stack.Screen
        name="ApprovalDetail"
        component={ApprovalDetailScreen}
        options={{ title: 'Review Skill' }}
      />
      <Stack.Screen
        name="WorkforceSearch"
        component={WorkforceSearchScreen}
        options={{ title: 'Workforce Discovery' }}
      />
      <Stack.Screen
        name="EmployeePreview"
        component={EmployeePreviewScreen}
        options={{ title: 'Employee Summary' }}
      />
      <Stack.Screen name="EmployeeDirectory" options={{ title: 'Employee Directory' }}>
        {() => (
          <ProtectedScreen requiredPermission="EMPLOYEE_VIEW">
            <EmployeeDirectoryScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="EmployeeDetails" options={{ title: 'Employee Details' }}>
        {() => <EmployeeDetailsScreen />}
      </Stack.Screen>
      <Stack.Screen name="AddEmployee" options={{ title: 'Add Employee' }}>
        {() => (
          <ProtectedScreen requiredPermission="EMPLOYEE_CREATE">
            <AddEmployeeScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="EditEmployee" options={{ title: 'Edit Employee' }}>
        {() => (
          <ProtectedScreen requiredPermission="EMPLOYEE_UPDATE">
            <EditEmployeeScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="RoleManagement" options={{ title: 'Role Management' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <RoleManagementScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="RoleForm" options={{ title: 'Role Details' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <RoleFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="PermissionMatrix" options={{ title: 'Permission Matrix' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <PermissionMatrixScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminOverview" options={{ title: 'Admin Overview' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <AdminOverviewScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="SkillAdminDirectory" options={{ title: 'Skill Administration' }}>
        {() => (
          <ProtectedScreen requiredPermission="SKILL_VIEW">
            <SkillAdminDirectoryScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      {/*
        Shared create/edit route. ProtectedScreen only accepts a single
        `requiredPermission` string (see ProtectedScreen.tsx), so a route-level
        AND/OR of SKILL_CREATE/SKILL_UPDATE isn't expressible here. Gating on
        SKILL_CREATE is the pragmatic choice: in practice this route is only ever
        reached via the Directory FAB (already gated on SKILL_CREATE) or the
        Details screen's Edit action (already gated on SKILL_UPDATE via
        `canUpdate` in SkillAdminDetailsScreen), so the route guard mainly exists
        to stop unauthorized deep-links. A user with SKILL_UPDATE but not
        SKILL_CREATE would be blocked here even for edits — acceptable for this
        milestone since the two permissions are provisioned together in practice,
        but flagged here for whoever revisits ProtectedScreen's API.
      */}
      <Stack.Screen name="SkillForm" options={{ title: 'Skill Form' }}>
        {() => (
          <ProtectedScreen requiredPermission="SKILL_CREATE">
            <SkillFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="SkillAdminDetails" options={{ title: 'Skill Details' }}>
        {() => (
          <ProtectedScreen requiredPermission="SKILL_VIEW">
            <SkillAdminDetailsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="SkillCategoryManagement" options={{ title: 'Skill Categories' }}>
        {() => (
          <ProtectedScreen requiredPermission="CATEGORY_VIEW">
            <SkillCategoryManagementScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="CategoryForm" options={{ title: 'Category Form' }}>
        {() => (
          <ProtectedScreen requiredPermission="CATEGORY_CREATE">
            <CategoryFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      {/*
        Standalone stack route for the notification inbox, separate from the
        `Notifications` bottom-tab entry (same screen component). This lets the
        AppHeader bell push straight into the inbox from any Stack-level screen
        (e.g. SkillAdminDirectory, EmployeeDirectory) regardless of which tab is
        currently active — mirrors how AddSkill/SkillDetails coexist as both a
        tab-reachable flow and standalone stack routes. No requiredPermission/
        allowedRoles: every authenticated user can view their own inbox, and the
        whole AppStack already sits behind login.
      */}
      <Stack.Screen name="NotificationCenter" options={{ title: 'Notifications' }}>
        {() => (
          <ProtectedScreen>
            <NotificationCenterScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      {/*
        Any authenticated user manages their own notification preferences, so no
        requiredPermission/allowedRoles — matches NotificationCenter's no-gate pattern above.
      */}
      <Stack.Screen name="NotificationPreferences" options={{ title: 'Notification Preferences' }}>
        {() => (
          <ProtectedScreen>
            <NotificationPreferencesScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="SendNotification" options={{ title: 'Send Notification' }}>
        {() => (
          <ProtectedScreen requiredPermission="NOTIFICATION_SEND">
            <SendNotificationScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

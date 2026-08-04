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
import { AuditLogsScreen } from '../screens/audit/AuditLogsScreen';
import { SkillAdminDirectoryScreen } from '../screens/skillAdmin/SkillAdminDirectoryScreen';
import { SkillFormScreen } from '../screens/skillAdmin/SkillFormScreen';
import { SkillAdminDetailsScreen } from '../screens/skillAdmin/SkillAdminDetailsScreen';
import { SkillCategoryManagementScreen } from '../screens/skillAdmin/SkillCategoryManagementScreen';
import { CategoryFormScreen } from '../screens/skillAdmin/CategoryFormScreen';
import { NotificationCenterScreen } from '../screens/notifications/NotificationCenterScreen';
import { NotificationPreferencesScreen } from '../screens/notifications/NotificationPreferencesScreen';
import { SendNotificationScreen } from '../screens/notifications/SendNotificationScreen';
import { ReportsDashboardScreen } from '../screens/reports/ReportsDashboardScreen';
import { ReportGenerateScreen } from '../screens/reports/ReportGenerateScreen';
import { ReportPreviewScreen } from '../screens/reports/ReportPreviewScreen';
import { ReportHistoryScreen } from '../screens/reports/ReportHistoryScreen';
import { OrgSettingsDashboardScreen } from '../screens/orgSettings/OrgSettingsDashboardScreen';
import { DepartmentListScreen } from '../screens/orgSettings/DepartmentListScreen';
import { DepartmentFormScreen } from '../screens/orgSettings/DepartmentFormScreen';
import { DesignationListScreen } from '../screens/orgSettings/DesignationListScreen';
import { DesignationFormScreen } from '../screens/orgSettings/DesignationFormScreen';
import { LocationListScreen } from '../screens/orgSettings/LocationListScreen';
import { LocationFormScreen } from '../screens/orgSettings/LocationFormScreen';
import { BusinessUnitListScreen } from '../screens/orgSettings/BusinessUnitListScreen';
import { BusinessUnitFormScreen } from '../screens/orgSettings/BusinessUnitFormScreen';
import { HolidayCalendarScreen } from '../screens/orgSettings/HolidayCalendarScreen';
import { HolidayFormScreen } from '../screens/orgSettings/HolidayFormScreen';
import { OrganizationProfileScreen } from '../screens/orgSettings/OrganizationProfileScreen';
import { PasswordPolicyScreen } from '../screens/orgSettings/PasswordPolicyScreen';
import { SessionSettingsScreen } from '../screens/orgSettings/SessionSettingsScreen';
import { PreferencesScreen } from '../screens/orgSettings/PreferencesScreen';

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
      <Stack.Screen name="AuditLogs" options={{ title: 'Audit Logs' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <AuditLogsScreen />
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
      <Stack.Screen name="ReportsDashboard" options={{ title: 'Reports' }}>
        {() => (
          <ProtectedScreen requiredPermission="REPORT_VIEW">
            <ReportsDashboardScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="ReportGenerate" options={{ title: 'Generate Report' }}>
        {() => (
          <ProtectedScreen requiredPermission="REPORT_VIEW">
            <ReportGenerateScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="ReportPreview" options={{ title: 'Report Preview' }}>
        {() => (
          <ProtectedScreen requiredPermission="REPORT_VIEW">
            <ReportPreviewScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="ReportHistory" options={{ title: 'Report History' }}>
        {() => (
          <ProtectedScreen requiredPermission="REPORT_VIEW">
            <ReportHistoryScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="OrgSettingsDashboard" options={{ title: 'Organization Settings' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <OrgSettingsDashboardScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="DepartmentList" options={{ title: 'Departments' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <DepartmentListScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="DepartmentForm" options={{ title: 'Department' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <DepartmentFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="DesignationList" options={{ title: 'Designations' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <DesignationListScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="DesignationForm" options={{ title: 'Designation' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <DesignationFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="LocationList" options={{ title: 'Locations' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <LocationListScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="LocationForm" options={{ title: 'Location' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <LocationFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="BusinessUnitList" options={{ title: 'Business Units' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <BusinessUnitListScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="BusinessUnitForm" options={{ title: 'Business Unit' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <BusinessUnitFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="HolidayCalendar" options={{ title: 'Holiday Calendar' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <HolidayCalendarScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="HolidayForm" options={{ title: 'Holiday' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <HolidayFormScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="OrganizationProfile" options={{ title: 'Organization Profile' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <OrganizationProfileScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="PasswordPolicy" options={{ title: 'Password Policy' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <PasswordPolicyScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="SessionSettings" options={{ title: 'Session Settings' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <SessionSettingsScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen name="Preferences" options={{ title: 'Preferences' }}>
        {() => (
          <ProtectedScreen allowedRoles={['Administrator']}>
            <PreferencesScreen />
          </ProtectedScreen>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

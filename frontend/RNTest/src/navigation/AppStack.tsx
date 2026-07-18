import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { DrawerNavigator } from './DrawerNavigator';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AddEmployeeSkillScreen } from '../screens/skills/AddEmployeeSkillScreen';
import { EmployeeSkillDetailsScreen } from '../screens/skills/EmployeeSkillDetailsScreen';
import { EditEmployeeSkillScreen } from '../screens/skills/EditEmployeeSkillScreen';
import { PendingApprovalsScreen } from '../screens/approvals/PendingApprovalsScreen';
import { ApprovalDetailScreen } from '../screens/approvals/ApprovalDetailScreen';
import { WorkforceSearchScreen } from '../screens/search/WorkforceSearchScreen';
import { EmployeePreviewScreen } from '../screens/search/EmployeePreviewScreen';

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
    </Stack.Navigator>
  );
};

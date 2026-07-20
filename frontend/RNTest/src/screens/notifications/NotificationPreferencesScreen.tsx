import React from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../../hooks/useNotifications';
import { NotificationPreferences } from '../../types/notifications';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

type PreferenceField = keyof NotificationPreferences;

const PREFERENCE_ROWS: { field: PreferenceField; label: string }[] = [
  { field: 'onSkillApproval', label: 'Skill Approval Notifications' },
  { field: 'onSkillRejection', label: 'Skill Rejection Notifications' },
  { field: 'onRoleChange', label: 'Role Change Notifications' },
  { field: 'onEmployeeUpdate', label: 'Profile Update Notifications' },
  { field: 'onBroadcast', label: 'Broadcast/Announcement Notifications' },
];

export const NotificationPreferencesScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const styles = createStyles(theme);

  const handleToggle = (field: PreferenceField, value: boolean) => {
    updateMutation.mutate(
      { [field]: value },
      {
        onSuccess: () => showSnackbar('Preference updated', 'success'),
        onError: (error: any) =>
          showSnackbar(error?.response?.data?.message || 'Failed to update preference', 'error'),
      },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Notification Preferences" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Notification Preferences" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.sectionCard}>
          {PREFERENCE_ROWS.map((row, index) => (
            <View
              key={row.field}
              style={[
                styles.toggleRow,
                index < PREFERENCE_ROWS.length - 1 && [styles.toggleRowDivider, { borderBottomColor: theme.colors.divider }],
              ]}
            >
              <AppText weight="semiBold" style={styles.toggleLabel}>{row.label}</AppText>
              <Switch
                value={!!preferences?.[row.field]}
                onValueChange={(value) => handleToggle(row.field, value)}
                trackColor={{ true: theme.colors.primary }}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: typeof lightTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    sectionCard: {
      paddingVertical: 4,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    toggleRowDivider: {
      borderBottomWidth: 1,
    },
    toggleLabel: {
      flex: 1,
      marginRight: 12,
    },
  });

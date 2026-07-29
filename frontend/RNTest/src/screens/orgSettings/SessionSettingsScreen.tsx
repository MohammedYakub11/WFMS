import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '../../hooks/useOrganizationSettings';
import { usePermissions } from '../../hooks/usePermissions';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface SessionSettingsFormValues {
  sessionTimeoutMinutes: string;
  idleTimeoutMinutes: string;
  maxConcurrentSessions: string;
}

export const SessionSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');

  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const { control, handleSubmit, reset } = useForm<SessionSettingsFormValues>({
    defaultValues: { sessionTimeoutMinutes: '60', idleTimeoutMinutes: '15', maxConcurrentSessions: '3' },
  });

  useEffect(() => {
    if (settings) {
      reset({
        sessionTimeoutMinutes: String(settings.sessionTimeoutMinutes),
        idleTimeoutMinutes: String(settings.idleTimeoutMinutes),
        maxConcurrentSessions: String(settings.maxConcurrentSessions),
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SessionSettingsFormValues) => {
    try {
      await updateMutation.mutateAsync({
        sessionTimeoutMinutes: parseInt(data.sessionTimeoutMinutes, 10) || 60,
        idleTimeoutMinutes: parseInt(data.idleTimeoutMinutes, 10) || 15,
        maxConcurrentSessions: parseInt(data.maxConcurrentSessions, 10) || 3,
      });
      showSnackbar('Session settings updated', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to update session settings', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Session Settings" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Session Settings" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="sessionTimeoutMinutes"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Session Timeout (minutes)" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
            <Controller
              control={control}
              name="idleTimeoutMinutes"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Idle Timeout (minutes)" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
            <Controller
              control={control}
              name="maxConcurrentSessions"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Maximum Concurrent Sessions" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
          </Card>
        </ScrollView>

        {canManage && (
          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
            <PrimaryButton title="Save Changes" onPress={handleSubmit(onSubmit)} isLoading={updateMutation.isPending} disabled={updateMutation.isPending} />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  footer: { padding: 16, borderTopWidth: 1 },
});

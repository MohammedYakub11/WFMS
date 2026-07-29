import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '../../hooks/useOrganizationSettings';
import { usePermissions } from '../../hooks/usePermissions';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface PasswordPolicyFormValues {
  passwordMinLength: string;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: string;
  passwordHistoryCount: string;
  maxLoginAttempts: string;
  lockoutDurationMinutes: string;
}

export const PasswordPolicyScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');

  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const { control, handleSubmit, reset } = useForm<PasswordPolicyFormValues>({
    defaultValues: {
      passwordMinLength: '8',
      passwordRequireUppercase: true,
      passwordRequireNumber: true,
      passwordRequireSpecial: true,
      passwordExpiryDays: '90',
      passwordHistoryCount: '5',
      maxLoginAttempts: '5',
      lockoutDurationMinutes: '30',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        passwordMinLength: String(settings.passwordMinLength),
        passwordRequireUppercase: settings.passwordRequireUppercase,
        passwordRequireNumber: settings.passwordRequireNumber,
        passwordRequireSpecial: settings.passwordRequireSpecial,
        passwordExpiryDays: String(settings.passwordExpiryDays),
        passwordHistoryCount: String(settings.passwordHistoryCount),
        maxLoginAttempts: String(settings.maxLoginAttempts),
        lockoutDurationMinutes: String(settings.lockoutDurationMinutes),
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: PasswordPolicyFormValues) => {
    try {
      await updateMutation.mutateAsync({
        passwordMinLength: parseInt(data.passwordMinLength, 10) || 8,
        passwordRequireUppercase: data.passwordRequireUppercase,
        passwordRequireNumber: data.passwordRequireNumber,
        passwordRequireSpecial: data.passwordRequireSpecial,
        passwordExpiryDays: parseInt(data.passwordExpiryDays, 10) || 0,
        passwordHistoryCount: parseInt(data.passwordHistoryCount, 10) || 0,
        maxLoginAttempts: parseInt(data.maxLoginAttempts, 10) || 5,
        lockoutDurationMinutes: parseInt(data.lockoutDurationMinutes, 10) || 30,
      });
      showSnackbar('Password policy updated', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to update password policy', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Password Policy" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Password Policy" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Complexity & Length</AppText>
            <Controller
              control={control}
              name="passwordMinLength"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Minimum Length" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
            {(
              [
                ['passwordRequireUppercase', 'Require Uppercase Letter'],
                ['passwordRequireNumber', 'Require Number'],
                ['passwordRequireSpecial', 'Require Special Character'],
              ] as const
            ).map(([field, label]) => (
              <View key={field} style={styles.switchRow}>
                <AppText weight="medium">{label}</AppText>
                <Controller
                  control={control}
                  name={field}
                  render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} disabled={!canManage} />}
                />
              </View>
            ))}
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Expiry & History</AppText>
            <Controller
              control={control}
              name="passwordExpiryDays"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Expiry (days, 0 = never)" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
            <Controller
              control={control}
              name="passwordHistoryCount"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Password History Count" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Lockout</AppText>
            <Controller
              control={control}
              name="maxLoginAttempts"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Max Login Attempts" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
              )}
            />
            <Controller
              control={control}
              name="lockoutDurationMinutes"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Lockout Duration (minutes)" value={value} onChangeText={onChange} editable={canManage} keyboardType="numeric" />
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
  sectionTitle: { marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});

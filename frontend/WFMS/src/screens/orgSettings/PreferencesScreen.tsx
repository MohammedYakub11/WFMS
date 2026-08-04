import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Chip, Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '../../hooks/useOrganizationSettings';
import { usePermissions } from '../../hooks/usePermissions';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface PreferencesFormValues {
  theme: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  workingDays: string[];
}

const THEME_OPTIONS = ['light', 'dark', 'system'];
const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const PreferencesScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<PreferencesFormValues>({
    defaultValues: {
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: '1,234.56',
      workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        theme: settings.theme,
        language: settings.language,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        numberFormat: settings.numberFormat,
        workingDays: settings.workingDays,
      });
    }
  }, [settings, reset]);

  const selectedTheme = watch('theme');
  const workingDays = watch('workingDays');

  const toggleWorkingDay = (day: string) => {
    const next = workingDays.includes(day) ? workingDays.filter((d) => d !== day) : [...workingDays, day];
    setValue('workingDays', next);
  };

  const onSubmit = async (data: PreferencesFormValues) => {
    try {
      await updateMutation.mutateAsync(data);
      showSnackbar('Preferences updated', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to update preferences', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Application Preferences" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Application Preferences" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.label}>Theme</AppText>
            <Menu
              visible={themeMenuVisible}
              onDismiss={() => setThemeMenuVisible(false)}
              anchor={
                <SecondaryButton
                  title={selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
                  onPress={() => setThemeMenuVisible(true)}
                  style={styles.dropdownButton}
                  disabled={!canManage}
                />
              }
            >
              {THEME_OPTIONS.map((option) => (
                <Menu.Item key={option} title={option.charAt(0).toUpperCase() + option.slice(1)} onPress={() => { setValue('theme', option); setThemeMenuVisible(false); }} />
              ))}
            </Menu>

            <Controller
              control={control}
              name="language"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Default Language" value={value} onChangeText={onChange} editable={canManage} />
              )}
            />
            <Controller
              control={control}
              name="dateFormat"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Date Format" value={value} onChangeText={onChange} editable={canManage} placeholder="DD/MM/YYYY" />
              )}
            />
            <Controller
              control={control}
              name="timeFormat"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Time Format" value={value} onChangeText={onChange} editable={canManage} placeholder="24h or 12h" />
              )}
            />
            <Controller
              control={control}
              name="numberFormat"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Number Format" value={value} onChangeText={onChange} editable={canManage} placeholder="1,234.56" />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Working Days</AppText>
            <View style={styles.chipRow}>
              {WEEK_DAYS.map((day) => (
                <Chip key={day} selected={workingDays.includes(day)} onPress={() => canManage && toggleWorkingDay(day)} style={styles.chip}>
                  {day}
                </Chip>
              ))}
            </View>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.helperText}>
              Unselected days are treated as weekends across the app.
            </AppText>
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
  sectionTitle: { marginBottom: 12 },
  label: { marginBottom: 8 },
  dropdownButton: { marginBottom: 16, alignSelf: 'flex-start', minWidth: 160 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4 },
  helperText: { marginTop: 12 },
  footer: { padding: 16, borderTopWidth: 1 },
});

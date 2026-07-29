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
import { useOrganizationProfile, useUpdateOrganizationProfile } from '../../hooks/useOrganizationSettings';
import { usePermissions } from '../../hooks/usePermissions';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface ProfileFormValues {
  companyName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
}

export const OrganizationProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');

  const { data: profile, isLoading } = useOrganizationProfile();
  const updateMutation = useUpdateOrganizationProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: { companyName: '', logoUrl: '', address: '', phone: '', email: '', website: '', timezone: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName,
        logoUrl: profile.logoUrl || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        timezone: profile.timezone,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({
        companyName: data.companyName,
        logoUrl: data.logoUrl || undefined,
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        timezone: data.timezone || undefined,
      });
      showSnackbar('Organization profile updated', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to update organization profile', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Organization Profile" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Organization Profile" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="companyName"
              rules={{ required: 'Company name is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Company Name" value={value} onChangeText={onChange} editable={canManage} error={errors.companyName?.message} />
              )}
            />
            <Controller
              control={control}
              name="logoUrl"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Logo URL (optional)" value={value} onChangeText={onChange} editable={canManage} />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Address" value={value} onChangeText={onChange} editable={canManage} multiline numberOfLines={2} />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Phone" value={value} onChangeText={onChange} editable={canManage} keyboardType="phone-pad" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Contact Email" value={value} onChangeText={onChange} editable={canManage} keyboardType="email-address" autoCapitalize="none" />
              )}
            />
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Website" value={value} onChangeText={onChange} editable={canManage} autoCapitalize="none" />
              )}
            />
            <Controller
              control={control}
              name="timezone"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Timezone" value={value} onChangeText={onChange} editable={canManage} placeholder="e.g. UTC, Asia/Kolkata" />
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

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Menu, Switch } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Card } from '../../components/Cards';
import { Loader } from '../../components/Loader';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { useCreateLocation, useLocation, useUpdateLocation } from '../../hooks/useLocations';
import { LocationType } from '../../types/organization';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface LocationFormValues {
  locationCode: string;
  name: string;
  type: LocationType;
  address: string;
  city: string;
  country: string;
  timezone: string;
  isActive: boolean;
}

const LOCATION_TYPES: LocationType[] = ['office', 'branch', 'remote'];

export const LocationFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const locationId: string | undefined = route.params?.locationId;
  const isEditMode = !!locationId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: existing, isLoading: isLoadingExisting } = useLocation(locationId || '');
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: { locationCode: '', name: '', type: 'office', address: '', city: '', country: '', timezone: '', isActive: true },
  });

  useEffect(() => {
    if (isEditMode && existing) {
      reset({
        locationCode: existing.locationCode,
        name: existing.name,
        type: existing.type,
        address: existing.address || '',
        city: existing.city || '',
        country: existing.country || '',
        timezone: existing.timezone || '',
        isActive: existing.isActive,
      });
    }
  }, [isEditMode, existing, reset]);

  const selectedType = watch('type');

  const onSubmit = async (data: LocationFormValues) => {
    const payload = {
      locationCode: data.locationCode,
      name: data.name,
      type: data.type,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      timezone: data.timezone || undefined,
      isActive: data.isActive,
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: locationId!, data: payload });
        showSnackbar('Location updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Location created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} location`, 'error');
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Location" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Location' : 'Add Location'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="locationCode"
              rules={{ required: 'Location code is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Location Code" value={value} onChangeText={onChange} error={errors.locationCode?.message} />
              )}
            />
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />

            <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.label}>Type</AppText>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <SecondaryButton
                  title={selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdownButton}
                />
              }
            >
              {LOCATION_TYPES.map((type) => (
                <Menu.Item key={type} title={type.charAt(0).toUpperCase() + type.slice(1)} onPress={() => { setValue('type', type); setMenuVisible(false); }} />
              ))}
            </Menu>

            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Address (optional)" value={value} onChangeText={onChange} multiline numberOfLines={2} />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => <AppTextField label="City (optional)" value={value} onChangeText={onChange} />}
            />
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => <AppTextField label="Country (optional)" value={value} onChangeText={onChange} />}
            />
            <Controller
              control={control}
              name="timezone"
              render={({ field: { onChange, value } }) => <AppTextField label="Timezone (optional)" value={value} onChangeText={onChange} />}
            />
            <View style={styles.switchRow}>
              <AppText weight="medium">Active</AppText>
              <Controller
                control={control}
                name="isActive"
                render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
              />
            </View>
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title={isEditMode ? 'Save Changes' : 'Create Location'}
            onPress={handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  label: { marginBottom: 8 },
  dropdownButton: { marginBottom: 16, alignSelf: 'flex-start', minWidth: 160 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});

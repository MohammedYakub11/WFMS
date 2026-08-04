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
import { useCreateHoliday, useHoliday, useUpdateHoliday } from '../../hooks/useHolidays';
import { useLocations } from '../../hooks/useLocations';
import { Location } from '../../types/organization';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface HolidayFormValues {
  name: string;
  date: string;
  isRecurring: boolean;
  locationId: string;
}

export const HolidayFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const holidayId: string | undefined = route.params?.holidayId;
  const isEditMode = !!holidayId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: existing, isLoading: isLoadingExisting } = useHoliday(holidayId || '');
  const { data: locationsData } = useLocations({ status: 'active' }, 1, 100);
  const locations = locationsData?.items || [];
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    defaultValues: { name: '', date: '', isRecurring: false, locationId: '' },
  });

  useEffect(() => {
    if (isEditMode && existing) {
      reset({
        name: existing.name,
        date: existing.date,
        isRecurring: existing.isRecurring,
        locationId: existing.locationId || '',
      });
    }
  }, [isEditMode, existing, reset]);

  const selectedLocationId = watch('locationId');
  const selectedLocation = locations.find((l: Location) => l.id === selectedLocationId);

  const onSubmit = async (data: HolidayFormValues) => {
    const payload = {
      name: data.name,
      date: data.date,
      isRecurring: data.isRecurring,
      locationId: data.locationId || undefined,
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: holidayId!, data: payload });
        showSnackbar('Holiday updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Holiday created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} holiday`, 'error');
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Holiday" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Holiday' : 'Add Holiday'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Holiday Name" value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Date is required', pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Use YYYY-MM-DD format' } }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} error={errors.date?.message} />
              )}
            />

            <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.label}>
              Location (optional — leave blank for org-wide)
            </AppText>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <SecondaryButton
                  title={selectedLocation?.name || 'All Locations'}
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdownButton}
                />
              }
            >
              <Menu.Item title="All Locations" onPress={() => { setValue('locationId', ''); setMenuVisible(false); }} />
              {locations.map((loc: Location) => (
                <Menu.Item key={loc.id} title={loc.name} onPress={() => { setValue('locationId', loc.id); setMenuVisible(false); }} />
              ))}
            </Menu>

            <View style={styles.switchRow}>
              <AppText weight="medium">Recurs Yearly</AppText>
              <Controller
                control={control}
                name="isRecurring"
                render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
              />
            </View>
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title={isEditMode ? 'Save Changes' : 'Create Holiday'}
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
  dropdownButton: { marginBottom: 16, alignSelf: 'flex-start', minWidth: 200 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});

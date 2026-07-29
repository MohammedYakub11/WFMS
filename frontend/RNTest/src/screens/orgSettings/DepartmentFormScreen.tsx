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
import { useBusinessUnits } from '../../hooks/useBusinessUnits';
import { useCreateDepartment, useDepartment, useUpdateDepartment } from '../../hooks/useDepartments';
import { BusinessUnit } from '../../types/organization';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';

interface DepartmentFormValues {
  departmentCode: string;
  name: string;
  description: string;
  businessUnitId: string;
  isActive: boolean;
}

export const DepartmentFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const departmentId: string | undefined = route.params?.departmentId;
  const isEditMode = !!departmentId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: existing, isLoading: isLoadingExisting } = useDepartment(departmentId || '');
  const { data: businessUnitsData } = useBusinessUnits({ status: 'active' }, 1, 100);
  const businessUnits = businessUnitsData?.items || [];
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const mutation = isEditMode ? updateMutation : createMutation;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    defaultValues: { departmentCode: '', name: '', description: '', businessUnitId: '', isActive: true },
  });

  useEffect(() => {
    if (isEditMode && existing) {
      reset({
        departmentCode: existing.departmentCode,
        name: existing.name,
        description: existing.description || '',
        businessUnitId: existing.businessUnitId || '',
        isActive: existing.isActive,
      });
    }
  }, [isEditMode, existing, reset]);

  const selectedBusinessUnitId = watch('businessUnitId');
  const selectedBusinessUnit = businessUnits.find((bu: BusinessUnit) => bu.id === selectedBusinessUnitId);

  const onSubmit = async (data: DepartmentFormValues) => {
    const payload = {
      departmentCode: data.departmentCode,
      name: data.name,
      description: data.description || undefined,
      businessUnitId: data.businessUnitId || undefined,
      isActive: data.isActive,
    };
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: departmentId!, data: payload });
        showSnackbar('Department updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showSnackbar('Department created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} department`, 'error');
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Department" showBack />
        <Loader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={isEditMode ? 'Edit Department' : 'Add Department'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Controller
              control={control}
              name="departmentCode"
              rules={{ required: 'Department code is required' }}
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Department Code" value={value} onChangeText={onChange} error={errors.departmentCode?.message} />
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
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Description (optional)" value={value} onChangeText={onChange} multiline numberOfLines={3} />
              )}
            />

            <AppText variant="inputLabel" weight="medium" color={theme.colors.textSecondary} style={styles.label}>
              Business Unit (optional)
            </AppText>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <SecondaryButton
                  title={selectedBusinessUnit?.name || 'Select Business Unit'}
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdownButton}
                />
              }
            >
              <Menu.Item title="None" onPress={() => { setValue('businessUnitId', ''); setMenuVisible(false); }} />
              {businessUnits.map((bu: BusinessUnit) => (
                <Menu.Item key={bu.id} title={bu.name} onPress={() => { setValue('businessUnitId', bu.id); setMenuVisible(false); }} />
              ))}
            </Menu>

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
            title={isEditMode ? 'Save Changes' : 'Create Department'}
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

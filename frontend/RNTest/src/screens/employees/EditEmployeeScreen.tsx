import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { EmployeePickerModal } from '../../components/employees/EmployeePickerModal';
import { useEmployee, useUpdateEmployee, useAssignEmployeeRole } from '../../hooks/useEmployee';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { employeeEditSchema } from '../../validations/employee.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { EmployeeListItem } from '../../types/employees';
import { Role as RoleType } from '../../types/roles';

export const EditEmployeeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { employeeId } = route.params;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();

  const { data: employee, isLoading } = useEmployee(employeeId);
  const updateMutation = useUpdateEmployee();
  const assignRoleMutation = useAssignEmployeeRole();
  const { data: roles } = useRoles();

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [reportingManagerName, setReportingManagerName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(employeeEditSchema),
    defaultValues: {
      employee_code: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      location: '',
      experience: null as number | null,
      reportingManagerId: null as string | null,
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        employee_code: employee.employee_code,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        designation: employee.designation || '',
        department: employee.department || '',
        location: employee.location || '',
        experience: employee.experience ?? null,
        reportingManagerId: employee.reportingManagerId || null,
      });
      if (employee.reportingManager) {
        setReportingManagerName(`${employee.reportingManager.first_name} ${employee.reportingManager.last_name}`);
      }
    }
  }, [employee, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({
        id: employeeId,
        data: { ...data, reportingManagerId: data.reportingManagerId || undefined },
      });
      showSnackbar('Employee updated successfully', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to update employee', 'error');
    }
  };

  const handleAssignRole = async (roleId: string) => {
    try {
      await assignRoleMutation.mutateAsync({ employeeId, roleId });
      showSnackbar('Role assigned successfully', 'success');
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to assign role', 'error');
    }
  };

  if (isLoading || !employee) {
    return (
      <View style={styles.container}>
        <AppHeader title="Edit Employee" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Edit Employee" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Personal Information</AppText>
            <Controller control={control} name="first_name" render={({ field: { onChange, value } }) => (
              <AppTextField label="First Name" value={value} onChangeText={onChange} error={errors.first_name?.message} />
            )} />
            <Controller control={control} name="last_name" render={({ field: { onChange, value } }) => (
              <AppTextField label="Last Name" value={value} onChangeText={onChange} error={errors.last_name?.message} />
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <AppTextField label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <AppTextField label="Phone" value={value || ''} onChangeText={onChange} error={errors.phone?.message} />
            )} />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Employment Information</AppText>
            <Controller control={control} name="department" render={({ field: { onChange, value } }) => (
              <AppTextField label="Department" value={value || ''} onChangeText={onChange} error={errors.department?.message} />
            )} />
            <Controller control={control} name="designation" render={({ field: { onChange, value } }) => (
              <AppTextField label="Designation" value={value || ''} onChangeText={onChange} error={errors.designation?.message} />
            )} />
            <Controller control={control} name="location" render={({ field: { onChange, value } }) => (
              <AppTextField label="Location" value={value || ''} onChangeText={onChange} error={errors.location?.message} />
            )} />
            <Controller control={control} name="experience" render={({ field: { onChange, value } }) => (
              <AppTextField
                label="Experience (years)"
                value={value !== null && value !== undefined ? String(value) : ''}
                onChangeText={onChange}
                keyboardType="numeric"
                error={errors.experience?.message}
              />
            )} />
            <View style={styles.pickerField}>
              <AppText variant="inputLabel" color={theme.colors.textSecondary} style={styles.pickerLabel}>
                Reporting Manager
              </AppText>
              <TouchableOpacity
                style={[styles.pickerButton, { borderColor: theme.colors.border }]}
                onPress={() => setIsPickerVisible(true)}
              >
                <AppText>{reportingManagerName || 'Not assigned'}</AppText>
              </TouchableOpacity>
            </View>
          </Card>

          {hasPermission('ROLE_MANAGEMENT') && (
            <Card style={styles.sectionCard}>
              <AppText variant="h3" style={styles.sectionTitle}>Assign Role</AppText>
              <View style={styles.roleChipContainer}>
                {(roles || []).map((role: RoleType) => {
                  const isSelected = employee.role?.id === role.id;
                  return (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleChip,
                        { borderColor: theme.colors.border },
                        isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                      ]}
                      onPress={() => handleAssignRole(role.id)}
                      disabled={assignRoleMutation.isPending}
                    >
                      <AppText
                        variant="caption"
                        weight="semiBold"
                        color={isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary}
                      >
                        {role.name}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <EmployeePickerModal
        visible={isPickerVisible}
        onDismiss={() => setIsPickerVisible(false)}
        excludeEmployeeId={employeeId}
        onSelect={(selected: EmployeeListItem) => {
          setValue('reportingManagerId', selected.id);
          setReportingManagerName(`${selected.first_name} ${selected.last_name}`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 16 },
  sectionTitle: { marginBottom: 16 },
  pickerField: { marginTop: 4 },
  pickerLabel: { marginBottom: 8 },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  roleChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { PasswordField } from '../../components/PasswordField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Card } from '../../components/Cards';
import { EmployeePickerModal } from '../../components/employees/EmployeePickerModal';
import { useCreateEmployee } from '../../hooks/useEmployee';
import { useRoles } from '../../hooks/useRoles';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { employeeSchema } from '../../validations/employee.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { EmployeeListItem } from '../../types/employees';
import { Role } from '../../types/roles';

export const AddEmployeeScreen = () => {
  const navigation = useNavigation<any>();
  const createMutation = useCreateEmployee();
  const { showSnackbar } = useSnackbar();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [reportingManagerName, setReportingManagerName] = useState<string | null>(null);
  const [isRoleMenuVisible, setIsRoleMenuVisible] = useState(false);

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const roles = rolesData ?? [];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      employee_code: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      designation: '',
      department: '',
      location: '',
      experience: null as number | null,
      reportingManagerId: null as string | null,
      roleId: '',
    },
  });

  const selectedRoleId = watch('roleId');
  const selectedRole = roles.find((r: Role) => r.id === selectedRoleId);

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        reportingManagerId: data.reportingManagerId || undefined,
      });
      showSnackbar('Employee created successfully', 'success');
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to create employee', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Add Employee" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Personal Information</AppText>
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="First Name" value={value} onChangeText={onChange} error={errors.first_name?.message} />
              )}
            />
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Last Name" value={value} onChangeText={onChange} error={errors.last_name?.message} />
              )}
            />
            <Controller
              control={control}
              name="employee_code"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Employee Code" value={value} onChangeText={onChange} error={errors.employee_code?.message} />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Account</AppText>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PasswordField label="Password" value={value} onChangeText={onChange} error={errors.password?.message} />
              )}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Employment Information</AppText>
            <Controller
              control={control}
              name="department"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Department" value={value || ''} onChangeText={onChange} error={errors.department?.message} />
              )}
            />
            <Controller
              control={control}
              name="designation"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Designation" value={value || ''} onChangeText={onChange} error={errors.designation?.message} />
              )}
            />
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Location" value={value || ''} onChangeText={onChange} error={errors.location?.message} />
              )}
            />
            <Controller
              control={control}
              name="experience"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Experience (years)"
                  value={value !== null && value !== undefined ? String(value) : ''}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.experience?.message}
                />
              )}
            />
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

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Role &amp; Access</AppText>
            <AppText variant="inputLabel" color={theme.colors.textSecondary} style={styles.pickerLabel}>
              Role *
            </AppText>
            <Controller
              control={control}
              name="roleId"
              render={() => (
                <Menu
                  visible={isRoleMenuVisible}
                  onDismiss={() => setIsRoleMenuVisible(false)}
                  anchor={
                    <SecondaryButton
                      title={isLoadingRoles ? 'Loading roles...' : selectedRole?.name || 'Select Role'}
                      onPress={() => setIsRoleMenuVisible(true)}
                      style={styles.dropdownButton}
                      disabled={isLoadingRoles}
                    />
                  }
                >
                  {roles.map((role: Role) => (
                    <Menu.Item
                      key={role.id}
                      title={role.name}
                      onPress={() => {
                        setValue('roleId', role.id, { shouldValidate: true });
                        setIsRoleMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              )}
            />
            {errors.roleId && (
              <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
                {errors.roleId.message}
              </AppText>
            )}
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton
            title="Create Employee"
            onPress={handleSubmit(onSubmit)}
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending}
          />
        </View>
      </KeyboardAvoidingView>

      <EmployeePickerModal
        visible={isPickerVisible}
        onDismiss={() => setIsPickerVisible(false)}
        onSelect={(employee: EmployeeListItem) => {
          setValue('reportingManagerId', employee.id);
          setReportingManagerName(`${employee.first_name} ${employee.last_name}`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  dropdownButton: {
    alignSelf: 'stretch',
  },
  errorText: {
    marginTop: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});

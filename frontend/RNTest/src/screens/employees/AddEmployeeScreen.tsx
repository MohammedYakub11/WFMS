import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { PasswordField } from '../../components/PasswordField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { EmployeePickerModal } from '../../components/employees/EmployeePickerModal';
import { useCreateEmployee } from '../../hooks/useEmployee';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { employeeSchema } from '../../validations/employee.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { EmployeeListItem } from '../../types/employees';

export const AddEmployeeScreen = () => {
  const navigation = useNavigation<any>();
  const createMutation = useCreateEmployee();
  const { showSnackbar } = useSnackbar();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [reportingManagerName, setReportingManagerName] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
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
    },
  });

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
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Cards';
import { useRole, useCreateRole, useUpdateRole, useAssignPermissions } from '../../hooks/useRoles';
import { usePermissionCatalog } from '../../hooks/useRoles';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { roleSchema } from '../../validations/role.schema';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Permission } from '../../types/roles';

export const RoleFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const roleId: string | undefined = route.params?.roleId;
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: existingRole, isLoading: isLoadingRole } = useRole(roleId || '');
  const { data: catalog, isLoading: isLoadingCatalog } = usePermissionCatalog();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const assignPermissionsMutation = useAssignPermissions();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(roleSchema),
    defaultValues: { name: '', description: '', permissionCodes: [] as string[] },
  });

  const selectedCodes: string[] = watch('permissionCodes') || [];

  useEffect(() => {
    if (existingRole) {
      reset({
        name: existingRole.name,
        description: existingRole.description || '',
        permissionCodes: (existingRole.permissions || []).map((p: Permission) => p.code),
      });
    }
  }, [existingRole, reset]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    (catalog || []).forEach((permission: Permission) => {
      if (!groups[permission.category]) groups[permission.category] = [];
      groups[permission.category].push(permission);
    });
    return groups;
  }, [catalog]);

  const togglePermission = (code: string) => {
    const next = selectedCodes.includes(code)
      ? selectedCodes.filter((c) => c !== code)
      : [...selectedCodes, code];
    setValue('permissionCodes', next, { shouldValidate: true });
  };

  const onSubmit = async (data: { name: string; description?: string | null; permissionCodes?: string[] }) => {
    const permissionCodes = data.permissionCodes || [];
    try {
      if (roleId) {
        await updateMutation.mutateAsync({ id: roleId, data: { name: data.name, description: data.description || undefined } });
        await assignPermissionsMutation.mutateAsync({ roleId, permissionCodes });
        showSnackbar('Role updated successfully', 'success');
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          permissionCodes,
        });
        showSnackbar('Role created successfully', 'success');
      }
      navigation.goBack();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Failed to save role', 'error');
    }
  };

  const isSystemRole = !!existingRole?.isSystem;
  const isSaving = createMutation.isPending || updateMutation.isPending || assignPermissionsMutation.isPending;

  if (roleId && (isLoadingRole || isLoadingCatalog)) {
    return (
      <View style={styles.container}>
        <AppHeader title="Role Details" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={roleId ? 'Edit Role' : 'Add Role'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Role Details</AppText>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="Role Name"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSystemRole}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <AppTextField label="Description" value={value || ''} onChangeText={onChange} multiline numberOfLines={3} />
              )}
            />
            {isSystemRole && (
              <AppText variant="caption" color={theme.colors.textSecondary}>
                This is a system role — its name cannot be changed, but permissions can still be adjusted.
              </AppText>
            )}
          </Card>

          <Card style={styles.sectionCard}>
            <AppText variant="h3" style={styles.sectionTitle}>Permissions</AppText>
            {errors.permissionCodes && (
              <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
                {errors.permissionCodes.message}
              </AppText>
            )}
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <View key={category} style={styles.categoryGroup}>
                <AppText weight="semiBold" style={styles.categoryTitle}>{category}</AppText>
                {permissions.map((permission) => (
                  <Checkbox.Item
                    key={permission.id}
                    label={permission.name}
                    status={selectedCodes.includes(permission.code) ? 'checked' : 'unchecked'}
                    onPress={() => togglePermission(permission.code)}
                  />
                ))}
              </View>
            ))}
          </Card>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.divider }]}>
          <PrimaryButton title="Save Role" onPress={handleSubmit(onSubmit)} isLoading={isSaving} disabled={isSaving} />
        </View>
      </KeyboardAvoidingView>
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
  categoryGroup: { marginBottom: 12 },
  categoryTitle: { marginBottom: 4 },
  errorText: { marginBottom: 8 },
  footer: { padding: 16, borderTopWidth: 1 },
});

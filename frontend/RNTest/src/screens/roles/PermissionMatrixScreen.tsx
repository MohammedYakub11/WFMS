import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { PermissionMatrixTable } from '../../components/roles/PermissionMatrixTable';
import { useRoles, useRolesWithPermissions, usePermissionCatalog, useAssignPermissions } from '../../hooks/useRoles';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Permission, Role } from '../../types/roles';

export const PermissionMatrixScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();

  const { data: roles, isLoading: isLoadingRoles, isError } = useRoles();
  const { data: catalog, isLoading: isLoadingCatalog } = usePermissionCatalog();
  const { rolesWithPermissions, isLoading: isLoadingDetails } = useRolesWithPermissions(roles || []);
  const assignPermissionsMutation = useAssignPermissions();

  const handleToggle = (roleId: string, permissionCode: string, checked: boolean) => {
    const role = (rolesWithPermissions as Role[]).find((r: Role) => r.id === roleId);
    if (!role) return;
    const currentCodes = (role.permissions || []).map((p: Permission) => p.code);
    const nextCodes = checked
      ? [...currentCodes, permissionCode]
      : currentCodes.filter((c: string) => c !== permissionCode);

    assignPermissionsMutation.mutate(
      { roleId, permissionCodes: nextCodes },
      {
        onError: () => showSnackbar('Failed to update permission', 'error'),
      },
    );
  };

  const isLoading = isLoadingRoles || isLoadingCatalog || isLoadingDetails;

  return (
    <View style={styles.container}>
      <AppHeader title="Permission Matrix" showBack />
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError || !roles || !catalog ? (
        <EmptyState title="Failed to load matrix" description="An error occurred while fetching roles and permissions." />
      ) : (
        <View style={styles.tableContainer}>
          <PermissionMatrixTable
            permissions={catalog}
            roles={rolesWithPermissions}
            onToggle={handleToggle}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tableContainer: { flex: 1, padding: 16 },
});

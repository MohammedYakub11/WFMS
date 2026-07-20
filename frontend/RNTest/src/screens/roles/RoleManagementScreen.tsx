import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/AppHeader';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RoleCard } from '../../components/roles/RoleCard';
import { useRoles, useDeleteRole } from '../../hooks/useRoles';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { Role } from '../../types/roles';

export const RoleManagementScreen = () => {
  const navigation = useNavigation<any>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const deleteMutation = useDeleteRole();
  const { showSnackbar } = useSnackbar();
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const handleDelete = () => {
    if (!roleToDelete) return;
    deleteMutation.mutate(roleToDelete.id, {
      onSuccess: () => {
        showSnackbar('Role deleted', 'success');
        setRoleToDelete(null);
      },
      onError: (error: any) => {
        showSnackbar(error?.response?.data?.message || 'Failed to delete role', 'error');
        setRoleToDelete(null);
      },
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Role Management"
        showBack
        rightAction={
          <AppText
            variant="buttonText"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('PermissionMatrix')}
          >
            Matrix
          </AppText>
        }
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load roles"
          description="An error occurred while fetching roles. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={roles || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RoleCard
                role={item}
                onPress={(role) => navigation.navigate('RoleForm', { roleId: role.id })}
                onEdit={(role) => navigation.navigate('RoleForm', { roleId: role.id })}
                onDelete={(role) => setRoleToDelete(role)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState title="No roles yet" description="Create your first custom role to get started." />
          }
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('RoleForm', {})} color="#FFF" />

      <ConfirmationDialog
        visible={!!roleToDelete}
        title="Delete Role"
        message={`Are you sure you want to delete the "${roleToDelete?.name}" role?`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setRoleToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 16, paddingBottom: 80 },
  cardWrapper: { marginBottom: 12 },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#22C55E',
  },
});

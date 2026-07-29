import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { useBusinessUnits, useDeleteBusinessUnit } from '../../hooks/useBusinessUnits';
import { usePermissions } from '../../hooks/usePermissions';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { AppHeader } from '../../components/AppHeader';
import { renderAppIcon } from '../../components/AppIcon';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { OrgEntityCard } from '../../components/organization/OrgEntityCard';
import { lightTheme, darkTheme } from '../../theme/theme';
import { BusinessUnit } from '../../types/organization';

const LIMIT = 10;
type StatusFilter = 'active' | 'inactive' | null;

export const BusinessUnitListScreen = () => {
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const canManage = hasPermission('ORGANIZATION_MANAGEMENT');

  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>(null);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<BusinessUnit | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const query = useMemo(() => ({ search: search || undefined, status: status || undefined }), [search, status]);
  const { data, isLoading, isError, refetch, isFetching } = useBusinessUnits(query, page, LIMIT);
  const deleteMutation = useDeleteBusinessUnit();

  const items: BusinessUnit[] = data?.items || [];
  const total = data?.total || 0;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        showSnackbar('Business unit deleted', 'success');
        setToDelete(null);
      },
      onError: () => {
        showSnackbar('Failed to delete business unit', 'error');
        setToDelete(null);
      },
    });
  };

  const renderStatusToggle = () => (
    <View style={styles.statusRow}>
      {(['All', 'Active', 'Inactive'] as const).map((label) => {
        const value: StatusFilter = label === 'All' ? null : (label.toLowerCase() as StatusFilter);
        const isSelected = status === value;
        return (
          <TouchableOpacity
            key={label}
            style={[styles.statusChip, { borderColor: theme.colors.border }, isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
            onPress={() => { setStatus(value); setPage(1); }}
          >
            <AppText variant="caption" weight="semiBold" color={isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary}>
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Business Units" showBack />

      {isError ? (
        <EmptyState title="Failed to load business units" description="Please try again." actionTitle="Retry" onAction={handleRefresh} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <OrgEntityCard
                title={item.name}
                subtitle={item.description || undefined}
                isActive={item.isActive}
                canManage={canManage}
                onPress={() => navigation.navigate('BusinessUnitForm', { businessUnitId: item.id })}
                onDelete={() => setToDelete(item)}
              />
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <AppTextField label="" placeholder="Search business units..." value={localSearch} onChangeText={setLocalSearch} style={styles.searchField} />
              {renderStatusToggle()}
            </View>
          }
          contentContainerStyle={styles.listContent}
          onEndReached={() => { if (items.length < total && !isFetching) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={!isLoading ? <EmptyState title="No business units found" description="Create your first business unit to get started." /> : null}
          ListFooterComponent={isFetching && !isLoading && page > 1 ? <Loader /> : null}
          refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} />}
        />
      )}

      {canManage && <FAB icon={renderAppIcon("plus")} style={styles.fab} onPress={() => navigation.navigate('BusinessUnitForm', {})} color="#FFF" />}

      <ConfirmationDialog
        visible={!!toDelete}
        title="Delete Business Unit"
        message={`Are you sure you want to delete "${toDelete?.name}"?`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onDismiss={() => setToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContent: { padding: 16, paddingBottom: 0 },
  searchField: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statusChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  listContent: { paddingBottom: 80, paddingHorizontal: 16 },
  cardWrapper: {},
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#22C55E' },
});

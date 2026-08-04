import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard } from 'react-native';
import { FAB, useTheme, Menu, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { RootState } from '../../store';
import { setKeyword } from '../../store/skillAdminDirectorySlice';
import {
  useSkillsAdmin,
  useBulkActivateSkillsAdmin,
  useBulkDeactivateSkillsAdmin,
  useBulkDeleteSkillsAdmin,
} from '../../hooks/useSkillsAdmin';
import { usePermissions } from '../../hooks/usePermissions';
import { useIsWideLayout } from '../../utils/responsive';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { SkillAdminCard } from '../../components/skillAdmin/SkillAdminCard';
import { SkillAdminCardSkeleton } from '../../components/skillAdmin/SkillAdminCardSkeleton';
import { SkillAdminFiltersModal } from '../../components/skillAdmin/SkillAdminFiltersModal';
import { SelectionBar } from '../../components/skillAdmin/SelectionBar';
import { PaginationControls } from '../../components/PaginationControls';
import { AppHeader } from '../../components/AppHeader';
import { renderAppIcon } from '../../components/AppIcon';
import { AppTextField } from '../../components/AppTextField';
import { StatCard } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { downloadAndShareExport, ExportFormat } from '../../utils/exportFile';
import { Skill } from '../../types/skills';

const LIMIT = 10;

export const SkillAdminDirectoryScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const isWideLayout = useIsWideLayout();
  const { showSnackbar } = useSnackbar();

  const { keyword, categoryId, status, sortBy, sortOrder } = useSelector(
    (state: RootState) => state.skillAdminDirectory,
  );

  const [localSearch, setLocalSearch] = useState(keyword);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [page, setPage] = useState(1);

  // Overflow menu (top-right of the header content)
  const [menuVisible, setMenuVisible] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Bulk-select mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setKeyword(localSearch));
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, dispatch]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
    }),
    [page, keyword, categoryId, status, sortBy, sortOrder],
  );

  // Same filters as queryParams, minus pagination — used for the "export all matching filters" flow.
  const exportFilterParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
    }),
    [keyword, categoryId, status, sortBy, sortOrder],
  );

  const { data, isLoading, isError, refetch, isFetching } = useSkillsAdmin(queryParams);

  const skills: Skill[] = useMemo(() => data?.items || [], [data]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const activeCount = skills.filter((s) => s.isActive).length;
  const inactiveCount = skills.filter((s) => !s.isActive).length;

  const canSelectMultiple = hasPermission('SKILL_UPDATE') || hasPermission('SKILL_DELETE');
  const canExport = hasPermission('EXPORT_REPORTS');
  const showOverflowMenu = canSelectMultiple || canExport;

  const bulkActivateMutation = useBulkActivateSkillsAdmin();
  const bulkDeactivateMutation = useBulkDeactivateSkillsAdmin();
  const bulkDeleteMutation = useBulkDeleteSkillsAdmin();

  // The `/skills/export` endpoint only accepts the same list-filters as the directory
  // query (keyword/categoryId/status/sortBy/sortOrder) — it has no `ids` parameter to
  // scope a download to an explicit selection. Wiring an "export selected" action would
  // therefore silently export everything matching the current filters instead of just
  // the checked rows, which would be misleading, so it is intentionally not offered here.
  // "Export CSV"/"Export Excel" (header menu) export using the current directory filters.
  const exportMutation = useMutation({
    mutationFn: (format: ExportFormat) => downloadAndShareExport('/skills/export', exportFilterParams, format, 'skills'),
    onSuccess: () => {
      showSnackbar('Export ready to share', 'success');
    },
    onError: () => {
      showSnackbar('Failed to export skills. Please try again.', 'error');
    },
    onSettled: () => {
      setExportingFormat(null);
    },
  });

  const handleExport = useCallback(
    (format: ExportFormat) => {
      setMenuVisible(false);
      setExportingFormat(format);
      exportMutation.mutate(format);
    },
    [exportMutation],
  );

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isWideLayout && skills.length < total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allOnPageSelected = skills.length > 0 && skills.every((s) => next.has(s.id));
      if (allOnPageSelected) {
        skills.forEach((s) => next.delete(s.id));
      } else {
        skills.forEach((s) => next.add(s.id));
      }
      return next;
    });
  }, [skills]);

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleBulkActivate = useCallback(() => {
    bulkActivateMutation.mutate(Array.from(selectedIds), {
      onSuccess: (result: { requested: number; affected: number }) => {
        showSnackbar(`${result.affected} skill(s) activated`, 'success');
        setSelectedIds(new Set());
        setSelectionMode(false);
      },
      onError: () => showSnackbar('Failed to activate selected skills', 'error'),
    });
  }, [selectedIds, bulkActivateMutation, showSnackbar]);

  const handleBulkDeactivate = useCallback(() => {
    bulkDeactivateMutation.mutate(Array.from(selectedIds), {
      onSuccess: (result: { requested: number; affected: number }) => {
        showSnackbar(`${result.affected} skill(s) deactivated`, 'success');
        setSelectedIds(new Set());
        setSelectionMode(false);
      },
      onError: () => showSnackbar('Failed to deactivate selected skills', 'error'),
    });
  }, [selectedIds, bulkDeactivateMutation, showSnackbar]);

  const handleConfirmDelete = useCallback(() => {
    bulkDeleteMutation.mutate(Array.from(selectedIds), {
      onSuccess: (result: { requested: number; affected: number }) => {
        showSnackbar(`${result.affected} skill(s) deleted`, 'success');
        setSelectedIds(new Set());
        setSelectionMode(false);
        setIsDeleteConfirmVisible(false);
      },
      onError: () => {
        showSnackbar('Failed to delete selected skills', 'error');
        setIsDeleteConfirmVisible(false);
      },
    });
  }, [selectedIds, bulkDeleteMutation, showSnackbar]);

  const renderItem = useCallback(
    ({ item }: { item: Skill }) => (
      <SkillAdminCard
        skill={item}
        selectionMode={selectionMode}
        selected={selectedIds.has(item.id)}
        onToggleSelect={() => toggleSelect(item.id)}
        onPress={
          selectionMode
            ? () => toggleSelect(item.id)
            : () => navigation.navigate('SkillAdminDetails', { skillId: item.id })
        }
      />
    ),
    [navigation, selectionMode, selectedIds, toggleSelect],
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No skills found"
        description="Try adjusting your search or filters to find what you're looking for."
        actionTitle="Clear Search"
        onAction={() => {
          setLocalSearch('');
          dispatch(setKeyword(''));
        }}
      />
    );
  };

  const renderFooter = () => {
    if (isWideLayout) return null;
    if (!isFetching || isLoading || page === 1) return null;
    return <Loader style={styles.loader} />;
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {selectionMode ? (
        <SelectionBar
          selectedCount={selectedIds.size}
          totalOnPage={skills.length}
          allSelected={skills.length > 0 && skills.every((s) => selectedIds.has(s.id))}
          onToggleSelectAll={handleToggleSelectAllOnPage}
          onActivate={hasPermission('SKILL_UPDATE') ? handleBulkActivate : undefined}
          onDeactivate={hasPermission('SKILL_UPDATE') ? handleBulkDeactivate : undefined}
          onDelete={hasPermission('SKILL_DELETE') ? () => setIsDeleteConfirmVisible(true) : undefined}
          onCancel={handleCancelSelection}
          isLoading={bulkActivateMutation.isPending || bulkDeactivateMutation.isPending || bulkDeleteMutation.isPending}
        />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard title="Total" value={total} />
            <StatCard title="Active" value={activeCount} />
            <StatCard title="Inactive" value={inactiveCount} />
          </View>
          <View style={styles.searchContainer}>
            <AppTextField
              label=""
              placeholder="Search skills..."
              value={localSearch}
              onChangeText={setLocalSearch}
              style={styles.searchField}
              rightIcon={
                <IconButton
                  icon={renderAppIcon("filter-variant")}
                  size={20}
                  iconColor={(categoryId || status) ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  style={styles.filterIconButton}
                  onPress={() => setIsFilterVisible(true)}
                  accessibilityLabel="Filter skills"
                />
              }
            />
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Skill Administration"
        showBack
        rightAction={
          showOverflowMenu ? (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon={renderAppIcon("dots-vertical")}
                  onPress={() => setMenuVisible(true)}
                  accessibilityLabel="More options"
                />
              }
            >
              {canSelectMultiple && (
                <Menu.Item
                  leadingIcon={renderAppIcon("checkbox-multiple-marked-outline")}
                  title="Select multiple"
                  onPress={() => {
                    setMenuVisible(false);
                    setSelectionMode(true);
                    setSelectedIds(new Set());
                  }}
                />
              )}
              {canExport && (
                <Menu.Item
                  leadingIcon={renderAppIcon("file-delimited-outline")}
                  title={exportingFormat === 'csv' ? 'Exporting CSV…' : 'Export CSV'}
                  disabled={exportMutation.isPending}
                  onPress={() => handleExport('csv')}
                />
              )}
              {canExport && (
                <Menu.Item
                  leadingIcon={renderAppIcon("file-excel-outline")}
                  title={exportingFormat === 'xlsx' ? 'Exporting Excel…' : 'Export Excel'}
                  disabled={exportMutation.isPending}
                  onPress={() => handleExport('xlsx')}
                />
              )}
            </Menu>
          ) : undefined
        }
      />

      {isLoading && page === 1 ? (
        <View style={styles.container}>
          {renderHeader()}
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkillAdminCardSkeleton />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load skills"
          description="An error occurred while fetching the skill directory. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <>
          <FlatList
            key={isWideLayout ? 'wide' : 'narrow'}
            data={skills}
            numColumns={isWideLayout ? 2 : 1}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} />}
            onScroll={() => Keyboard.dismiss()}
          />
          {isWideLayout && skills.length > 0 && (
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
          )}
        </>
      )}

      <SkillAdminFiltersModal visible={isFilterVisible} onDismiss={() => setIsFilterVisible(false)} />

      <ConfirmationDialog
        visible={isDeleteConfirmVisible}
        title="Delete skills"
        message={`Are you sure you want to delete ${selectedIds.size} skill(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setIsDeleteConfirmVisible(false)}
      />

      {hasPermission('SKILL_CREATE') && !selectionMode && (
        <FAB
          icon={renderAppIcon("plus")}
          style={styles.fab}
          onPress={() => navigation.navigate('SkillForm')}
          color="#FFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginVertical: 16 },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContent: {
    padding: 16,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchField: {
    flex: 1,
  },
  filterIconButton: {
    margin: 0,
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#22C55E',
  },
});

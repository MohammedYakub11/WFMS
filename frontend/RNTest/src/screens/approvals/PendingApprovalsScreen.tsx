import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard, ScrollView, TouchableOpacity } from 'react-native';
import { Chip, Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { usePendingSkills, useApproveSkill, useSkillCategories } from '../../hooks/useSkills';
import { useSearchMetadata } from '../../hooks/useSearch';
import { usePermissions } from '../../hooks/usePermissions';
import { useIsWideLayout } from '../../utils/responsive';
import { useSnackbar } from '../../components/providers/SnackbarProvider';
import { PendingApprovalCard } from '../../components/approvals/PendingApprovalCard';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { StatCard, NEU_BACKGROUND } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { PaginationControls } from '../../components/PaginationControls';
import { AppIcon } from '../../components/AppIcon';
import { EmployeeSkill, SkillCategory } from '../../types/skills';
import { lightTheme, darkTheme } from '../../theme/theme';

const LIMIT = 20;
type StatusFilter = 'all' | 'new' | 'resubmitted';
type SortOption = 'newest' | 'oldest' | 'name_asc';

const SORT_PARAMS: Record<SortOption, { sortBy: 'submittedAt' | 'employeeName'; sortOrder: 'ASC' | 'DESC' }> = {
  newest: { sortBy: 'submittedAt', sortOrder: 'DESC' },
  oldest: { sortBy: 'submittedAt', sortOrder: 'ASC' },
  name_asc: { sortBy: 'employeeName', sortOrder: 'ASC' },
};

export const PendingApprovalsScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const navigation = useNavigation<any>();
  const isWideLayout = useIsWideLayout();
  const { hasPermission } = usePermissions();
  const { showSnackbar } = useSnackbar();
  const canReview = hasPermission('EMPLOYEE_SKILL_UPDATE');

  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [approveTarget, setApproveTarget] = useState<EmployeeSkill | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const queryParams = {
    page,
    limit: LIMIT,
    search: search || undefined,
    department: departmentFilter || undefined,
    categoryId: categoryFilter || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    ...SORT_PARAMS[sortOption],
  };

  const { data, isLoading, isError, refetch, isFetching } = usePendingSkills(queryParams);
  const { data: metadata } = useSearchMetadata();
  const { data: categoriesData } = useSkillCategories();
  const approveMutation = useApproveSkill();

  const items: EmployeeSkill[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const departments: string[] = metadata?.departments || [];
  const categories = categoriesData?.items || [];

  const hasActiveFilters = !!(search || statusFilter !== 'all' || departmentFilter || categoryFilter);

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isWideLayout && items.length < total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePress = useCallback(
    (item: EmployeeSkill) => navigation.navigate('ApprovalDetail', { id: item.id }),
    [navigation],
  );

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    try {
      await approveMutation.mutateAsync({ id: approveTarget.id, comments: undefined });
      showSnackbar('Skill approved successfully', 'success');
    } catch {
      showSnackbar('Failed to approve skill', 'error');
    } finally {
      setApproveTarget(null);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: EmployeeSkill }) => (
      <PendingApprovalCard
        employeeSkill={item}
        onPress={handlePress}
        onApprove={setApproveTarget}
        onReject={handlePress}
        onRequestChanges={handlePress}
        canReview={canReview}
        isApproving={approveMutation.isPending && approveTarget?.id === item.id}
      />
    ),
    [handlePress, canReview, approveMutation.isPending, approveTarget],
  );

  const clearFilters = () => {
    setLocalSearch('');
    setSearch('');
    setStatusFilter('all');
    setDepartmentFilter(null);
    setCategoryFilter(null);
    setPage(1);
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No pending approvals"
        description={
          hasActiveFilters
            ? 'No approvals match your search or filters.'
            : 'All caught up! There are no skill submissions waiting for review.'
        }
        actionTitle={hasActiveFilters ? 'Clear Filters' : undefined}
        onAction={hasActiveFilters ? clearFilters : undefined}
      />
    );
  };

  const renderFooter = () => {
    if (isWideLayout) return null;
    if (!isFetching || isLoading || page === 1) return null;
    return <Loader style={styles.loader} />;
  };

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    name_asc: 'Employee Name (A–Z)',
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.statsRow}>
        <StatCard layout="centered" title="Pending Approvals" value={total} icon={<AppIcon name="clock" size={24} color={theme.colors.primary} />} />
      </View>

      <View style={styles.searchContainer}>
        <AppTextField
          label=""
          placeholder="Search by employee or skill..."
          value={localSearch}
          onChangeText={setLocalSearch}
          style={styles.searchField}
          rightIcon={
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setSortMenuVisible(true)} activeOpacity={0.7} style={styles.filterIconButton}>
                  <AppIcon name="sort" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              }
            >
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <Menu.Item
                  key={option}
                  title={sortLabels[option]}
                  onPress={() => {
                    setSortOption(option);
                    setPage(1);
                    setSortMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          }
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        <Chip
          selected={statusFilter === 'new'}
          onPress={() => {
            setStatusFilter(statusFilter === 'new' ? 'all' : 'new');
            setPage(1);
          }}
          style={styles.chip}
          textStyle={styles.chipText}
        >
          New
        </Chip>
        <Chip
          selected={statusFilter === 'resubmitted'}
          onPress={() => {
            setStatusFilter(statusFilter === 'resubmitted' ? 'all' : 'resubmitted');
            setPage(1);
          }}
          style={styles.chip}
          textStyle={styles.chipText}
        >
          Resubmitted
        </Chip>
        {departments.map((dept) => (
          <Chip
            key={dept}
            selected={departmentFilter === dept}
            onPress={() => {
              setDepartmentFilter(departmentFilter === dept ? null : dept);
              setPage(1);
            }}
            style={styles.chip}
            textStyle={styles.chipText}
          >
            {dept}
          </Chip>
        ))}
        {categories.map((cat: SkillCategory) => (
          <Chip
            key={cat.id}
            selected={categoryFilter === cat.id}
            onPress={() => {
              setCategoryFilter(categoryFilter === cat.id ? null : cat.id);
              setPage(1);
            }}
            style={styles.chip}
            textStyle={styles.chipText}
          >
            {cat.categoryName}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: NEU_BACKGROUND }]}>
      <AppHeader title="Pending Approvals" showBack />

      {isLoading && page === 1 ? (
        <Loader fullScreen />
      ) : isError ? (
        <EmptyState
          title="Failed to load pending approvals"
          description="An error occurred while fetching approvals. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
            onScroll={() => Keyboard.dismiss()}
          />
          {isWideLayout && items.length > 0 && (
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
          )}
        </>
      )}

      <ConfirmationDialog
        visible={!!approveTarget}
        title="Approve Skill"
        message={`Approve "${approveTarget?.skill?.skillName || 'this skill'}" for ${approveTarget?.employee ? `${approveTarget.employee.first_name} ${approveTarget.employee.last_name}` : 'this employee'}?`}
        confirmLabel="Approve"
        isLoading={approveMutation.isPending}
        onConfirm={handleConfirmApprove}
        onDismiss={() => setApproveTarget(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginVertical: 16 },
  container: {
    flex: 1,
  },
  headerContent: {
    padding: 16,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchField: {
    flex: 1,
  },
  filterIconButton: {
    padding: 8,
  },
  chipsRow: {
    marginBottom: 8,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    marginRight: 0,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  chipText: {
    color: lightTheme.colors.textSecondary,
    fontFamily: lightTheme.typography.fontFamily.medium,
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
});

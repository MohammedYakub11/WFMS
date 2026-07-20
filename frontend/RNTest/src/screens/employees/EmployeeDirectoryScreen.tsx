import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setKeyword } from '../../store/employeeDirectorySlice';
import { useEmployees } from '../../hooks/useEmployee';
import { usePermissions } from '../../hooks/usePermissions';
import { useIsWideLayout } from '../../utils/responsive';
import { EmployeeCard } from '../../components/employees/EmployeeCard';
import { EmployeeCardSkeleton } from '../../components/employees/EmployeeCardSkeleton';
import { EmployeeFiltersModal } from '../../components/employees/EmployeeFiltersModal';
import { PaginationControls } from '../../components/PaginationControls';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { StatCard } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { EmployeeListItem } from '../../types/employees';

const LIMIT = 10;

export const EmployeeDirectoryScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const isWideLayout = useIsWideLayout();

  const { keyword, department, designation, status, location, sortBy, sortOrder } = useSelector(
    (state: RootState) => state.employeeDirectory,
  );

  const [localSearch, setLocalSearch] = useState(keyword);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [page, setPage] = useState(1);

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
      department: department || undefined,
      designation: designation || undefined,
      status: status || undefined,
      location: location || undefined,
      sortBy,
      sortOrder,
    }),
    [page, keyword, department, designation, status, location, sortBy, sortOrder],
  );

  const { data, isLoading, isError, refetch, isFetching } = useEmployees(queryParams);

  const employees: EmployeeListItem[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const activeCount = employees.filter((e: EmployeeListItem) => e.status === 'active').length;
  const inactiveCount = employees.filter((e: EmployeeListItem) => e.status === 'inactive').length;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isWideLayout && employees.length < total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: EmployeeListItem }) => (
      <EmployeeCard
        employee={item}
        onPress={(employee) => navigation.navigate('EmployeeDetails', { employeeId: employee.id })}
      />
    ),
    [navigation],
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No employees found"
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
      <View style={styles.statsRow}>
        <StatCard title="Total" value={total} />
        <StatCard title="Active" value={activeCount} />
        <StatCard title="Inactive" value={inactiveCount} />
      </View>
      <View style={styles.searchContainer}>
        <AppTextField
          label=""
          placeholder="Search employees..."
          value={localSearch}
          onChangeText={setLocalSearch}
          style={styles.searchField}
          rightIcon={
            <FAB
              icon="filter-variant"
              size="small"
              style={[
                styles.filterFab,
                (department || designation || status || location) ? { backgroundColor: theme.colors.primaryContainer } : null,
              ]}
              onPress={() => setIsFilterVisible(true)}
            />
          }
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Employee Directory" showBack showNotification />

      {isLoading && page === 1 ? (
        <View style={styles.container}>
          {renderHeader()}
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <EmployeeCardSkeleton />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load employees"
          description="An error occurred while fetching the directory. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <>
          <FlatList
            key={isWideLayout ? 'wide' : 'narrow'}
            data={employees}
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
          {isWideLayout && employees.length > 0 && (
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
          )}
        </>
      )}

      <EmployeeFiltersModal visible={isFilterVisible} onDismiss={() => setIsFilterVisible(false)} />

      {hasPermission('EMPLOYEE_CREATE') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddEmployee')}
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
  filterFab: {
    elevation: 0,
    backgroundColor: 'transparent',
    marginRight: 4,
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

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setKeyword, toggleFilterDrawer, setFilters } from '../../store/searchSlice';
import { useWorkforceSearch } from '../../hooks/useSearch';
import { SearchResultCard } from '../../components/search/SearchResultCard';
import { FilterDrawer } from '../../components/search/FilterDrawer';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { renderAppIcon, AppIcon } from '../../components/AppIcon';
import { NEU_BACKGROUND } from '../../components/Cards';
import { lightTheme, darkTheme } from '../../theme/theme';

export const WorkforceSearchScreen = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const searchState = useSelector((state: RootState) => state.search);

  // Local state for debouncing
  const [localKeyword, setLocalKeyword] = useState(searchState.keyword);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setKeyword(localKeyword));
    }, 500);
    return () => clearTimeout(timer);
  }, [localKeyword, dispatch]);

  // `isFilterDrawerOpen` is UI-only local state, not a backend search field — the
  // API's ValidationPipe rejects unknown query params, so it must not be forwarded.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isFilterDrawerOpen, ...searchQueryParams } = searchState;
  const { data, isLoading, isError, refetch } = useWorkforceSearch(searchQueryParams);

  const hasActiveFilters = !!(searchState.department || searchState.location || searchState.skill);

  const handleEmployeePress = (employee: any) => {
    navigation.navigate('EmployeePreview', { employeeId: employee.id, employeeData: employee });
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No employees found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.headerContent}>
        <View style={styles.searchContainer}>
          <AppTextField
            label=""
            placeholder="Search employees, skills..."
            value={localKeyword}
            onChangeText={setLocalKeyword}
            style={styles.searchField}
            rightIcon={
              <TouchableOpacity onPress={() => dispatch(toggleFilterDrawer())} activeOpacity={0.7} style={styles.filterIconButton}>
                <AppIcon name="filter-variant" size={20} color={hasActiveFilters ? theme.colors.primary : theme.colors.textSecondary} />
              </TouchableOpacity>
            }
          />
        </View>
      </View>

      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersRow}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {searchState.department && (
            <Chip icon={renderAppIcon('close')} onPress={() => dispatch(setFilters({ department: null }))} style={styles.filterChip} textStyle={styles.chipText}>
              {searchState.department}
            </Chip>
          )}
          {searchState.location && (
            <Chip icon={renderAppIcon('close')} onPress={() => dispatch(setFilters({ location: null }))} style={styles.filterChip} textStyle={styles.chipText}>
              {searchState.location}
            </Chip>
          )}
          {searchState.skill && (
            <Chip icon={renderAppIcon('close')} onPress={() => dispatch(setFilters({ skill: null }))} style={styles.filterChip} textStyle={styles.chipText}>
              {searchState.skill}
            </Chip>
          )}
        </ScrollView>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: NEU_BACKGROUND }]}>
      <AppHeader title="Employee Search" showDrawer showNotification />

      {isLoading ? (
        <View style={styles.container}>
          {renderHeader()}
          <Loader fullScreen />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load search results"
          description="An error occurred while searching employees. Please try again."
          actionTitle="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SearchResultCard employee={item} onPress={handleEmployeePress} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
        />
      )}

      <FilterDrawer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    padding: 16,
    paddingBottom: 0,
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
  activeFiltersRow: {
    marginTop: 8,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
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

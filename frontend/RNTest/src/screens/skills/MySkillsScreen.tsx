import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard } from 'react-native';
import { Searchbar, FAB, Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setSearchQuery } from '../../store/skillsSlice';
import { useEmployeeSkills } from '../../hooks/useSkills';
import { SkillCard } from '../../components/skills/SkillCard';
import { SkillSkeleton } from '../../components/skills/SkillSkeleton';
import { SkillFiltersModal } from '../../components/skills/SkillFiltersModal';

// Temporary Mock ID for current user until Auth is fully integrated
const CURRENT_EMPLOYEE_ID = 'CURRENT_USER_ID'; 

export const MySkillsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  
  const { searchQuery, selectedCategoryId, selectedProficiency, sortOption } = useSelector((state: RootState) => state.skills);
  
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, dispatch]);

  const queryParams = useMemo(() => ({
    page,
    limit,
    employeeId: CURRENT_EMPLOYEE_ID,
    search: searchQuery,
    categoryId: selectedCategoryId,
    proficiency: selectedProficiency,
    sort: sortOption,
  }), [page, limit, searchQuery, selectedCategoryId, selectedProficiency, sortOption]);

  const { data, isLoading, isError, refetch, isFetching, error } = useEmployeeSkills(queryParams);

  const skills = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (skills.length < total && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const renderItem = useCallback(({ item }: any) => (
    <SkillCard 
      employeeSkill={item} 
      onEdit={(skill: any) => console.log('Edit', skill.id)}
      onDelete={(skill: any) => console.log('Delete', skill.id)}
      onPress={(skill: any) => navigation.navigate('SkillDetails', { id: skill.id })}
    />
  ), [navigation]);

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={styles.emptyTitle}>No skills found</Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
        <Button mode="outlined" onPress={() => { setLocalSearch(''); dispatch(setSearchQuery('')); }}>Clear Search</Button>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching || isLoading || page === 1) return null;
    return <ActivityIndicator style={{ marginVertical: 16 }} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search skills..."
          onChangeText={setLocalSearch}
          value={localSearch}
          style={styles.searchBar}
          icon="magnify"
          clearIcon="close"
        />
        <FAB
          icon="filter-variant"
          size="small"
          style={[styles.filterFab, (selectedCategoryId || selectedProficiency) ? { backgroundColor: theme.colors.primaryContainer } : null]}
          onPress={() => setIsFilterVisible(true)}
        />
      </View>

      {isLoading && page === 1 ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkillSkeleton />}
          contentContainerStyle={styles.listContent}
        />
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 8 }}>Failed to load skills</Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>{(error as any)?.message || 'An error occurred.'}</Text>
          <Button mode="contained" onPress={handleRefresh}>Retry</Button>
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} />
          }
          onScroll={() => Keyboard.dismiss()}
        />
      )}

      <SkillFiltersModal 
        visible={isFilterVisible} 
        onDismiss={() => setIsFilterVisible(false)} 
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddSkill')}
        label="Add Skill"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  filterFab: {
    elevation: 2,
  },
  listContent: {
    paddingBottom: 80, // Space for bottom FAB
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  }
});

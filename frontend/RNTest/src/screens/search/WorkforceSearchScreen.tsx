import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Searchbar, useTheme, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setKeyword, toggleFilterDrawer, setDepartment, setLocation, setSkills } from '../../store/searchSlice';
import { useWorkforceSearch } from '../../hooks/useSearch';
import { SearchResultCard } from '../../components/search/SearchResultCard';
import { FilterDrawer } from '../../components/search/FilterDrawer';
import { Chip } from 'react-native-paper';

export const WorkforceSearchScreen = () => {
  const theme = useTheme();
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

  const { data, isLoading, isError } = useWorkforceSearch(searchState);

  const handleEmployeePress = (employee: any) => {
    navigation.navigate('EmployeePreview', { employeeId: employee.id, employeeData: employee });
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium">No employees found.</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Try adjusting your search filters.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <Searchbar
          placeholder="Search employees, skills..."
          onChangeText={setLocalKeyword}
          value={localKeyword}
          style={styles.searchBar}
          elevation={1}
        />
        <IconButton 
          icon="filter-variant" 
          mode="contained-tonal"
          size={24}
          onPress={() => dispatch(toggleFilterDrawer())}
        />
      </View>

      {/* Active Filter Chips */}
      {(searchState.department || searchState.location || searchState.skills.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContent}>
            {searchState.department && (
              <Chip icon="close" onPress={() => dispatch(setDepartment(''))} style={styles.filterChip}>
                {searchState.department}
              </Chip>
            )}
            {searchState.location && (
              <Chip icon="close" onPress={() => dispatch(setLocation(''))} style={styles.filterChip}>
                {searchState.location}
              </Chip>
            )}
            {searchState.skills.map(skill => (
              <Chip key={skill} icon="close" onPress={() => dispatch(setSkills(searchState.skills.filter(s => s !== skill)))} style={styles.filterChip}>
                {skill}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.error }}>Error loading search results.</Text>
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultCard employee={item} onPress={handleEmployeePress} />
          )}
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
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    elevation: 2,
    zIndex: 1,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#e3f2fd',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

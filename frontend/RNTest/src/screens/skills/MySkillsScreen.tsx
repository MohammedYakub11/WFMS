import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setSearchQuery } from '../../store/skillsSlice';
import { useEmployeeSkills } from '../../hooks/useSkills';
import { SkillCard } from '../../components/skills/SkillCard';
import { SkillSkeleton } from '../../components/skills/SkillSkeleton';
import { SkillFiltersModal } from '../../components/skills/SkillFiltersModal';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { StatCard } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';


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

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
      setPage(1); 
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

  const { data, isLoading, isError, refetch, isFetching } = useEmployeeSkills(queryParams);

  const skills = data?.data?.data || [];
  const total = data?.data?.total || 0;
  
  const approvedCount = skills.filter((s: any) => s.approvalStatus === 'approved').length;
  const pendingCount = skills.filter((s: any) => s.approvalStatus === 'pending').length;

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
      onEdit={(skill: any) => navigation.navigate('EditSkill', { id: skill.id })}
      onPress={(skill: any) => navigation.navigate('SkillDetails', { id: skill.id })}
    />
  ), [navigation]);

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No skills found"
        description="Try adjusting your search or filters to find what you're looking for."
        actionTitle="Clear Search"
        onAction={() => { setLocalSearch(''); dispatch(setSearchQuery('')); }}
      />
    );
  };

  const renderFooter = () => {
    if (!isFetching || isLoading || page === 1) return null;
    return <Loader style={styles.loader} />;
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.statsRow}>
        <StatCard title="Total Skills" value={total} />
        <StatCard title="Approved" value={approvedCount} />
        <StatCard title="Pending" value={pendingCount} />
      </View>
      <View style={styles.searchContainer}>
        <AppTextField
          label=""
          placeholder="Search skills..."
          value={localSearch}
          onChangeText={setLocalSearch}
          style={styles.searchField}
          rightIcon={
            <FAB
              icon="filter-variant"
              size="small"
              style={[
                styles.filterFab,
                (selectedCategoryId || selectedProficiency) ? { backgroundColor: theme.colors.primaryContainer } : null
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
      <AppHeader title="My Skills" showDrawer showNotification />
      
      {isLoading && page === 1 ? (
        <View style={styles.container}>
          {renderHeader()}
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkillSkeleton />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : isError ? (
        <EmptyState
          title="Failed to load skills"
          description="An error occurred while fetching your skills. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
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
        color="#FFF"
      />
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
    backgroundColor: '#22C55E', // primary
  },
});

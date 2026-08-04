import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Keyboard, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setSearchQuery } from '../../store/skillsSlice';
import { useEmployeeSkills } from '../../hooks/useSkills';
import { SkillCard } from '../../components/skills/SkillCard';
import { SkillSkeleton } from '../../components/skills/SkillSkeleton';
import { SkillFiltersModal } from '../../components/skills/SkillFiltersModal';
import { AppHeader } from '../../components/AppHeader';
import { AppIcon } from '../../components/AppIcon';
import { AppTextField } from '../../components/AppTextField';
import { StatCard, NeuIconCircle, NEU_BACKGROUND } from '../../components/Cards';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { lightTheme as theme } from '../../theme/theme';

export const MySkillsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  
  const { searchQuery, selectedCategoryId, selectedProficiency, sortOption } = useSelector((state: RootState) => state.skills);
  const user = useSelector((state: RootState) => state.auth.user);
  
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
    employeeId: user?.id,
    search: searchQuery,
    categoryId: selectedCategoryId,
    proficiency: selectedProficiency,
    sort: sortOption,
  }), [page, limit, user?.id, searchQuery, selectedCategoryId, selectedProficiency, sortOption]);

  const { data, isLoading, isError, refetch, isFetching } = useEmployeeSkills(queryParams);

  const skills = data?.items || [];
  const total = data?.total || 0;
  
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
        <StatCard layout="centered" title="Total Skills" value={total} icon={<AppIcon name="code-tags" size={24} color={theme.colors.primary} />} />
        <StatCard layout="centered" title="Approved" value={approvedCount} icon={<AppIcon name="check-circle-outline" size={24} color={theme.colors.primary} />} />
        <StatCard layout="centered" title="Pending" value={pendingCount} icon={<AppIcon name="clock" size={24} color={theme.colors.primary} />} />
      </View>
      <View style={styles.searchContainer}>
        <AppTextField
          label=""
          placeholder="Search skills..."
          value={localSearch}
          onChangeText={setLocalSearch}
          style={styles.searchField}
          rightIcon={
            <TouchableOpacity onPress={() => setIsFilterVisible(true)} activeOpacity={0.7} style={styles.filterIconButton}>
              <AppIcon name="filter-variant" size={20} color={(selectedCategoryId || selectedProficiency) ? theme.colors.primary : theme.colors.textSecondary} />
            </TouchableOpacity>
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
            <RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
          onScroll={() => Keyboard.dismiss()}
        />
      )}

      <SkillFiltersModal 
        visible={isFilterVisible} 
        onDismiss={() => setIsFilterVisible(false)} 
      />

      <View style={styles.fabContainer}>
        <NeuIconCircle size={60} contentStyle={styles.fabInner} onPress={() => navigation.navigate('AddSkill')}>
          <AppIcon name="plus" size={24} color="#FFF" />
        </NeuIconCircle>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { marginVertical: 16 },
  container: {
    flex: 1,
    backgroundColor: NEU_BACKGROUND,
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
    padding: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  fabInner: {
    backgroundColor: theme.colors.primary,
  },
});

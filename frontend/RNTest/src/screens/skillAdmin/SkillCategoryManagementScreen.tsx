import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { FAB } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { useCategoriesAdmin } from '../../hooks/useCategoriesAdmin';
import { usePermissions } from '../../hooks/usePermissions';
import { CategoryCard } from '../../components/skillAdmin/CategoryCard';
import { AppHeader } from '../../components/AppHeader';
import { AppTextField } from '../../components/AppTextField';
import { AppText } from '../../components/AppText';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { lightTheme, darkTheme } from '../../theme/theme';
import { SkillCategory } from '../../types/skills';

const LIMIT = 10;

type StatusFilter = 'active' | 'inactive' | null;

export const SkillCategoryManagementScreen = () => {
  const navigation = useNavigation<any>();
  const { hasPermission } = usePermissions();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [localSearch, setLocalSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StatusFilter>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(localSearch);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      keyword: keyword || undefined,
      status: status || undefined,
    }),
    [page, keyword, status],
  );

  const { data, isLoading, isError, refetch, isFetching } = useCategoriesAdmin(queryParams);
  const categories: SkillCategory[] = data?.items || [];
  const total = data?.total || 0;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (categories.length < total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const renderStatusToggle = () => (
    <View style={styles.statusRow}>
      {(['All', 'Active', 'Inactive'] as const).map((label) => {
        const value: StatusFilter = label === 'All' ? null : (label.toLowerCase() as StatusFilter);
        const isSelected = status === value;
        return (
          <TouchableOpacity
            key={label}
            style={[
              styles.statusChip,
              { borderColor: theme.colors.border },
              isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
            onPress={() => {
              setStatus(value);
              setPage(1);
            }}
          >
            <AppText
              variant="caption"
              weight="semiBold"
              color={isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary}
            >
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <AppTextField
        label=""
        placeholder="Search categories..."
        value={localSearch}
        onChangeText={setLocalSearch}
        style={styles.searchField}
      />
      {renderStatusToggle()}
    </View>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No categories found"
        description="Try adjusting your search or filters to find what you're looking for."
        actionTitle="Clear Search"
        onAction={() => {
          setLocalSearch('');
          setKeyword('');
          setStatus(null);
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!isFetching || isLoading || page === 1) return null;
    return <Loader style={styles.loader} />;
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Skill Categories" showBack />

      {isError ? (
        <EmptyState
          title="Failed to load categories"
          description="An error occurred while fetching skill categories. Please try again."
          actionTitle="Retry"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              canUpdate={hasPermission('CATEGORY_UPDATE')}
              onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={handleRefresh} />}
        />
      )}

      {hasPermission('CATEGORY_CREATE') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CategoryForm')}
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
  searchField: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
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

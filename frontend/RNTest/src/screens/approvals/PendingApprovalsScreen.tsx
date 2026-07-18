import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { usePendingSkills } from '../../hooks/useSkills';
import { SkillCard } from '../../components/skills/SkillCard';
import { EmployeeSkill } from '../../types/skills';

export const PendingApprovalsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch, isFetching } = usePendingSkills({ page, limit: 20 });

  const handlePress = (skill: EmployeeSkill) => {
    navigation.navigate('ApprovalDetail', { id: skill.id });
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No pending approvals found.
        </Text>
      </View>
    );
  };

  if (isError) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Failed to load pending approvals.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePress(item)}>
              <SkillCard employeeSkill={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !!data}
              onRefresh={() => {
                setPage(1);
                refetch();
              }}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  }
});

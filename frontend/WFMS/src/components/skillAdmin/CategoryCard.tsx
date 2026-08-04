import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../Cards';
import { AppText } from '../AppText';
import { RootState } from '../../store';
import { lightTheme, darkTheme } from '../../theme/theme';
import { SkillCategory } from '../../types/skills';
import { useActivateCategoryAdmin, useDeactivateCategoryAdmin } from '../../hooks/useCategoriesAdmin';
import { useSnackbar } from '../providers/SnackbarProvider';

interface CategoryCardProps {
  category: SkillCategory;
  onPress?: () => void;
  canUpdate?: boolean;
}

const CategoryCardComponent: React.FC<CategoryCardProps> = ({ category, onPress, canUpdate }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { showSnackbar } = useSnackbar();
  const activateMutation = useActivateCategoryAdmin();
  const deactivateMutation = useDeactivateCategoryAdmin();
  const statusColor = category.isActive ? theme.colors.statusActive : theme.colors.statusDisabled;

  const handleToggle = () => {
    const mutation = category.isActive ? deactivateMutation : activateMutation;
    mutation.mutate(category.id, {
      onSuccess: () => showSnackbar(`Category ${category.isActive ? 'deactivated' : 'activated'}`, 'success'),
      onError: () => showSnackbar('Failed to update category status', 'error'),
    });
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AppText variant="h2" numberOfLines={1}>{category.categoryName}</AppText>
          {!!category.description && (
            <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
              {category.description}
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <AppText variant="caption" style={styles.statusText}>
            {category.isActive ? 'Active' : 'Inactive'}
          </AppText>
        </View>
        {canUpdate && (
          <AppText
            variant="caption"
            weight="semiBold"
            color={theme.colors.primary}
            onPress={handleToggle}
          >
            {category.isActive ? 'Deactivate' : 'Activate'}
          </AppText>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Matches the SkillCard/My Skills spacing convention: 8dp on each card
  // yields a 16dp gap between consecutive cards, so each neumorphic surface
  // has room for its shadow instead of blending into its neighbor.
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});

export const CategoryCard = memo(CategoryCardComponent);

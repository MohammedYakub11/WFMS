import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setFilters, setSortBy, setSortOrder, resetFilters } from '../../store/skillAdminDirectorySlice';
import { useSkillCategories } from '../../hooks/useSkills';
import { SkillCategory } from '../../types/skills';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { lightTheme, darkTheme } from '../../theme/theme';

interface SkillAdminFiltersModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const STATUS_OPTIONS: { label: string; value: 'active' | 'inactive' }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const SORT_OPTIONS = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Name', value: 'skillName' },
  { label: 'Skill Code', value: 'skillCode' },
];

export const SkillAdminFiltersModal: React.FC<SkillAdminFiltersModalProps> = ({ visible, onDismiss }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const { categoryId, status, sortBy, sortOrder } = useSelector((state: RootState) => state.skillAdminDirectory);
  const { data: categoriesData } = useSkillCategories();
  const categories: SkillCategory[] = categoriesData?.items || [];

  const renderChip = (label: string, isSelected: boolean, onPress: () => void, key?: string) => (
    <TouchableOpacity
      key={key ?? label}
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.colors.border },
        isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
      ]}
    >
      <AppText
        variant="caption"
        color={isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary}
        weight="semiBold"
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="h2" style={styles.header}>Filter Skills</AppText>

          <AppText variant="h3" style={styles.sectionTitle}>Status</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All', status === null, () => dispatch(setFilters({ status: null })))}
            {STATUS_OPTIONS.map((opt) =>
              renderChip(opt.label, status === opt.value, () => dispatch(setFilters({ status: opt.value })), opt.value),
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Category</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All Categories', categoryId === null, () => dispatch(setFilters({ categoryId: null })))}
            {categories.map((cat) =>
              renderChip(cat.categoryName, categoryId === cat.id, () => dispatch(setFilters({ categoryId: cat.id })), cat.id),
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          <AppText variant="h3" style={styles.sectionTitle}>Sort By</AppText>
          <View style={styles.chipContainer}>
            {SORT_OPTIONS.map((opt) =>
              renderChip(opt.label, sortBy === opt.value, () => dispatch(setSortBy(opt.value)), opt.value),
            )}
          </View>

          <AppText variant="h3" style={styles.sectionTitle}>Sort Order</AppText>
          <View style={styles.chipContainer}>
            {renderChip('Descending', sortOrder === 'DESC', () => dispatch(setSortOrder('DESC')))}
            {renderChip('Ascending', sortOrder === 'ASC', () => dispatch(setSortOrder('ASC')))}
          </View>

          <View style={styles.actionContainer}>
            <View style={styles.actionButton}>
              <SecondaryButton title="Clear All" onPress={() => dispatch(resetFilters())} />
            </View>
            <View style={styles.actionButton}>
              <PrimaryButton title="Apply" onPress={onDismiss} />
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 24,
    margin: 20,
    maxHeight: '85%',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
});

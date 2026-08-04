import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedCategoryId, setSelectedProficiency, setSortOption, clearFilters } from '../../store/skillsSlice';
import { SkillCategory } from '../../types/skills';
import { useSkillCategories } from '../../hooks/useSkills';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { lightTheme as theme } from '../../theme/theme';

interface SkillFiltersModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const SORT_OPTIONS = [
  { label: 'Recently Updated', value: 'recently_updated' },
  { label: 'Alphabetical', value: 'alphabetical' },
  { label: 'Highest Proficiency', value: 'highest_proficiency' },
  { label: 'Lowest Proficiency', value: 'lowest_proficiency' },
  { label: 'Most Experience', value: 'most_experience' },
];

export const SkillFiltersModal: React.FC<SkillFiltersModalProps> = ({ visible, onDismiss }) => {
  const dispatch = useDispatch();
  
  const { selectedCategoryId, selectedProficiency, sortOption } = useSelector((state: RootState) => state.skills);
  const { data: categoriesData } = useSkillCategories();
  const categories: SkillCategory[] = categoriesData?.items || [];

  const renderChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected
      ]}
    >
      <AppText
        variant="caption"
        style={{
          color: isSelected ? theme.colors.primaryButtonText : theme.colors.textSecondary,
          fontFamily: theme.typography.fontFamily.semiBold
        }}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="h2" style={styles.header}>Sort & Filter Skills</AppText>
          
          <AppText variant="h3" style={styles.sectionTitle}>Sort By</AppText>
          <View style={styles.chipContainer}>
            {SORT_OPTIONS.map((option) => 
              renderChip(
                option.label, 
                sortOption === option.value, 
                () => dispatch(setSortOption(option.value))
              )
            )}
          </View>

          <Divider style={styles.divider} />

          <AppText variant="h3" style={styles.sectionTitle}>Category</AppText>
          <View style={styles.chipContainer}>
            {renderChip('All Categories', selectedCategoryId === null, () => dispatch(setSelectedCategoryId(null)))}
            {categories.map((cat: SkillCategory) => 
              renderChip(
                cat.categoryName, 
                selectedCategoryId === cat.id, 
                () => dispatch(setSelectedCategoryId(cat.id))
              )
            )}
          </View>

          <Divider style={styles.divider} />

          <AppText variant="h3" style={styles.sectionTitle}>Minimum Proficiency</AppText>
          <View style={styles.chipContainer}>
            {renderChip('Any', selectedProficiency === null, () => dispatch(setSelectedProficiency(null)))}
            {[1, 2, 3, 4, 5].map((level) => 
              renderChip(
                `${level}+ Stars`, 
                selectedProficiency === level, 
                () => dispatch(setSelectedProficiency(level))
              )
            )}
          </View>
          
          <View style={styles.actionContainer}>
            <View style={styles.actionButton}>
              <SecondaryButton title="Clear All" onPress={() => dispatch(clearFilters())} />
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
    backgroundColor: theme.colors.surface,
    padding: 24,
    margin: 20,
    borderRadius: theme.radius.l,
    maxHeight: '85%',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    color: theme.colors.textPrimary,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: theme.colors.divider,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
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

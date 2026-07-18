import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Chip, RadioButton, Divider, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedCategoryId, setSelectedProficiency, setSortOption, clearFilters } from '../../store/skillsSlice';
import { SkillCategory } from '../../types/skills';
import { useSkillCategories } from '../../hooks/useSkills';

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
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { selectedCategoryId, selectedProficiency, sortOption } = useSelector((state: RootState) => state.skills);
  const { data: categoriesData } = useSkillCategories();
  const categories: SkillCategory[] = categoriesData?.data?.data || [];

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="titleLarge" style={styles.header}>Sort & Filter Skills</Text>
          
          {/* Sorting Section */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Sort By</Text>
          <RadioButton.Group 
            onValueChange={value => dispatch(setSortOption(value))} 
            value={sortOption}
          >
            {SORT_OPTIONS.map((option) => (
              <RadioButton.Item 
                key={option.value} 
                label={option.label} 
                value={option.value} 
                position="leading"
                labelStyle={styles.radioLabel}
              />
            ))}
          </RadioButton.Group>

          <Divider style={styles.divider} />

          {/* Filtering Section - Category */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipContainer}>
            <Chip 
              selected={selectedCategoryId === null}
              onPress={() => dispatch(setSelectedCategoryId(null))}
              style={styles.chip}
            >
              All Categories
            </Chip>
            {categories.map((cat: SkillCategory) => (
              <Chip
                key={cat.id}
                selected={selectedCategoryId === cat.id}
                onPress={() => dispatch(setSelectedCategoryId(cat.id))}
                style={styles.chip}
              >
                {cat.categoryName}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Filtering Section - Proficiency */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Minimum Proficiency</Text>
          <View style={styles.chipContainer}>
            <Chip 
              selected={selectedProficiency === null}
              onPress={() => dispatch(setSelectedProficiency(null))}
              style={styles.chip}
            >
              Any
            </Chip>
            {[1, 2, 3, 4, 5].map((level) => (
              <Chip
                key={level}
                selected={selectedProficiency === level}
                onPress={() => dispatch(setSelectedProficiency(level))}
                style={styles.chip}
              >
                {level}+ Stars
              </Chip>
            ))}
          </View>
          
          <View style={styles.actionContainer}>
            <Button mode="outlined" onPress={() => dispatch(clearFilters())} style={styles.actionButton}>
              Clear All
            </Button>
            <Button mode="contained" onPress={onDismiss} style={styles.actionButton}>
              Apply
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
  },
  radioLabel: {
    textAlign: 'left',
  },
  divider: {
    marginVertical: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
});

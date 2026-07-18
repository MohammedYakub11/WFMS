const fs = require('fs');

const skillCard = `import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper';
import { EmployeeSkill } from '../../types/skills';

interface SkillCardProps {
  employeeSkill: EmployeeSkill;
  onEdit?: (skill: EmployeeSkill) => void;
  onDelete?: (skill: EmployeeSkill) => void;
}

export const SkillCard = React.memo(({ employeeSkill, onEdit, onDelete }: SkillCardProps) => {
  const theme = useTheme();
  
  const getProficiencyColor = (level: number) => {
    if (level >= 4) return theme.colors.primary;
    if (level === 3) return theme.colors.tertiary;
    return theme.colors.error;
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {employeeSkill.skill.name}
          </Text>
          {onEdit && (
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(employeeSkill)}
              style={styles.iconButton}
            />
          )}
        </View>

        <View style={styles.categoryRow}>
          <Chip 
            textStyle={styles.chipText}
            style={styles.chip}
          >
            {employeeSkill.skill.category.categoryName}
          </Chip>
          {employeeSkill.isCertified && (
            <Chip 
              icon="certificate" 
              textStyle={styles.chipText}
              style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
            >
              Certified
            </Chip>
          )}
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Proficiency</Text>
            <Text 
              variant="bodyMedium" 
              style={[styles.value, { color: getProficiencyColor(employeeSkill.proficiencyLevel) }]}
            >
              {employeeSkill.proficiencyLevel}/5 Stars
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Experience</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {employeeSkill.yearsOfExperience} Years
            </Text>
          </View>
        </View>
        
        <View style={styles.footerRow}>
          <Text variant="bodySmall" style={styles.status}>
            Status: {employeeSkill.approvalStatus}
          </Text>
          <Text variant="bodySmall" style={styles.lastUsed}>
            Last Used: {new Date(employeeSkill.lastUsedDate).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  iconButton: {
    margin: -8,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  status: {
    color: '#666',
    textTransform: 'capitalize',
  },
  lastUsed: {
    color: '#666',
  },
});
`;

const skillSkeleton = `import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from 'react-native-paper';

export const SkillSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Animated.View style={[styles.skeletonLine, styles.titleSkeleton, { opacity }]} />
          <Animated.View style={[styles.skeletonIcon, { opacity }]} />
        </View>
        <View style={styles.categoryRow}>
          <Animated.View style={[styles.skeletonChip, { opacity }]} />
          <Animated.View style={[styles.skeletonChip, { opacity }]} />
        </View>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Animated.View style={[styles.skeletonLine, styles.labelSkeleton, { opacity }]} />
            <Animated.View style={[styles.skeletonLine, styles.valueSkeleton, { opacity }]} />
          </View>
          <View style={styles.detailItem}>
            <Animated.View style={[styles.skeletonLine, styles.labelSkeleton, { opacity }]} />
            <Animated.View style={[styles.skeletonLine, styles.valueSkeleton, { opacity }]} />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonLine: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  titleSkeleton: {
    width: '60%',
    height: 24,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skeletonChip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  labelSkeleton: {
    width: '40%',
    height: 12,
    marginBottom: 8,
  },
  valueSkeleton: {
    width: '80%',
    height: 20,
  },
});
`;

const skillFiltersModal = `import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Chip, RadioButton, Divider, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedCategoryId, setSelectedProficiency, setSortOption, clearFilters } from '../../store/skillsSlice';
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
  const categories = categoriesData?.data?.data || [];

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
            {categories.map((cat: any) => (
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
`;

fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\SkillCard.tsx', skillCard);
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\SkillSkeleton.tsx', skillSkeleton);
fs.writeFileSync('C:\\WFMS\\frontend\\MyApp\\src\\components\\skills\\SkillFiltersModal.tsx', skillFiltersModal);
console.log('Successfully wrote components to disk.');

import React from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text, Button, useTheme, Surface, IconButton, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleFilterDrawer, setFilters, resetFilters } from '../../store/searchSlice';
import { useSearchMetadata } from '../../hooks/useSearch';

export const FilterDrawer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const searchState = useSelector((state: RootState) => state.search);
  const { data: metadata } = useSearchMetadata();

  const handleClose = () => {
    dispatch(toggleFilterDrawer());
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const renderChips = (title: string, options: string[], selectedValue: string | null, fieldKey: string) => {
    if (!options || options.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.sectionTitle}>{title}</Text>
        <View style={styles.chipContainer}>
          {options.map((opt) => (
            <Chip
              key={opt}
              selected={selectedValue === opt}
              onPress={() => dispatch(setFilters({ [fieldKey]: selectedValue === opt ? null : opt }))}
              style={styles.chip}
            >
              {opt}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={searchState.isFilterDrawerOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.drawerContainer} elevation={4}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Filters</Text>
            <IconButton icon="close" onPress={handleClose} />
          </View>
          
          <ScrollView style={styles.content}>
            {renderChips('Department', metadata?.departments || [], searchState.department, 'department')}
            {renderChips('Designation', metadata?.designations || [], searchState.designation, 'designation')}
            {renderChips('Location', metadata?.locations || [], searchState.location, 'location')}
            
            <View style={styles.section}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Certification Status</Text>
              <View style={styles.chipContainer}>
                <Chip
                  selected={searchState.certified === true}
                  onPress={() => dispatch(setFilters({ certified: searchState.certified === true ? null : true }))}
                  style={styles.chip}
                >
                  Certified Only
                </Chip>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button mode="outlined" onPress={handleReset} style={styles.footerButton}>Reset</Button>
            <Button mode="contained" onPress={handleClose} style={styles.footerButton}>Apply</Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

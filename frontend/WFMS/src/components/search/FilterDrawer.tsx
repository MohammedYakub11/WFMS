import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleFilterDrawer, setFilters, resetFilters } from '../../store/searchSlice';
import { useSearchMetadata } from '../../hooks/useSearch';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import { lightTheme, darkTheme } from '../../theme/theme';

export const FilterDrawer = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const searchState = useSelector((state: RootState) => state.search);
  const { data: metadata } = useSearchMetadata();

  const handleClose = () => dispatch(toggleFilterDrawer());
  const handleReset = () => dispatch(resetFilters());

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

  const renderChipSection = (title: string, options: string[], selectedValue: string | null, fieldKey: string) => {
    if (!options || options.length === 0) return null;
    return (
      <>
        <AppText variant="h3" style={styles.sectionTitle}>{title}</AppText>
        <View style={styles.chipContainer}>
          {renderChip('All', selectedValue === null, () => dispatch(setFilters({ [fieldKey]: null })))}
          {options.map((opt) => renderChip(opt, selectedValue === opt, () => dispatch(setFilters({ [fieldKey]: selectedValue === opt ? null : opt })), opt))}
        </View>
        <Divider style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
      </>
    );
  };

  return (
    <Portal>
      <Modal
        visible={searchState.isFilterDrawerOpen}
        onDismiss={handleClose}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.l }]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="h2" style={styles.header}>Filter Employees</AppText>

          {renderChipSection('Department', metadata?.departments || [], searchState.department, 'department')}
          {renderChipSection('Designation', metadata?.designations || [], searchState.designation, 'designation')}
          {renderChipSection('Location', metadata?.locations || [], searchState.location, 'location')}

          <AppText variant="h3" style={styles.sectionTitle}>Certification Status</AppText>
          <View style={styles.chipContainer}>
            {renderChip('Certified Only', searchState.certified === true, () => dispatch(setFilters({ certified: searchState.certified === true ? null : true })))}
          </View>

          <View style={styles.actionContainer}>
            <View style={styles.actionButton}>
              <SecondaryButton title="Clear All" onPress={handleReset} />
            </View>
            <View style={styles.actionButton}>
              <PrimaryButton title="Apply" onPress={handleClose} />
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
